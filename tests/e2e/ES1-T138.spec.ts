// KHÔNG CHẮC: spec chưa chạy (phiên viết không có preview, chưa type-check); scope-guard chặn dev-fe ghi tests/ → Orchestrator chép sang tests/e2e/ES1-T138.spec.ts.
// Ticket ES1-T138 TE-11-FE2: vùng kết quả quiz (docs/srs.md#TE-11 AC1, AC3; drafts/techlead/ES1-T132/task-split.md D3, D4, D6, D9; ES1-T133 #1).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T138.spec.ts -g "AC3|nojs"
// Dữ liệu ES1-T134 trong tests/e2e/store-data.json: TE11_TAGS_READY, TE11_TAG_FILTER_READY; chưa true thì skip có lý do.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect, type Browser, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { expectNotChallenged } from './support/store-guard';
import { env } from './support/store-data';
import { watchShopPay403 } from './support/console-guard';
import { skip429 } from './support/cart-api';

const TE11 = '/?view=te11';
// ES1-T417 (CTO 11/11, ES1-T178 mục M phương án A): 3 bộ kết quả đọc collection riêng TE11_QUIZ_COLLECTION (store-data.json, 'te11-quiz'),
// 7 sản phẩm gắn tag (drafts/claude-code/ES1-T178/created-data.md): upper+beginner+home 5 sp, core+beginner+home 1 sp, lower+advanced+gym 0 sp.
// Không đọc /collections/all: dữ liệu demo 4b3b9a5 cũng gắn tag quiz nên số kết quả trên all đổi theo dữ liệu (ES1-T300).
const QUIZ = env('TE11_QUIZ_COLLECTION');
const QUIZ_PATH = `/collections/${encodeURIComponent(QUIZ ?? 'all')}`;
const MANY_TAGS = 'quiz-upper+quiz-beginner+quiz-home';
const ONE_TAGS = 'quiz-core+quiz-beginner+quiz-home';
const NONE_TAGS = 'quiz-lower+quiz-advanced+quiz-gym';
const MANY = `${QUIZ_PATH}/${MANY_TAGS}?view=quiz`;
const ONE = `${QUIZ_PATH}/${ONE_TAGS}?view=quiz`;
const NONE = `${QUIZ_PATH}/${NONE_TAGS}?view=quiz`;
const UNUSED_TAGS = '/collections/all/te11-unused-a+te11-unused-b+te11-unused-c?view=quiz';
const NO_TAGS = '/collections/all?view=quiz';
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];

// env() chỉ trả chuỗi: cờ JSON boolean true phải đọc thẳng từ file, nếu không test skip mãi.
const storeData = () => JSON.parse(readFileSync(join(process.cwd(), 'tests/e2e/store-data.json'), 'utf8')) as Record<string, unknown>;
const flag = (name: string) => env(name) === 'true' || storeData()[name] === true;
const tagsReady = () => flag('TE11_TAGS_READY');
const filterReady = () => flag('TE11_TAG_FILTER_READY');
// ES1-T417: test cần sản phẩm chỉ chạy khi có cả collection riêng và cờ dữ liệu.
const quizReady = () => tagsReady() && !!QUIZ;
const QUIZ_SKIP = 'TE11_TAGS_READY chưa true hoặc thiếu TE11_QUIZ_COLLECTION (ES1-T134, ES1-T178, ES1-T417)';

// ES1-T417: tiền điều kiện dữ liệu, đọc template collection mặc định (lưới tối đa 24 card, không giới hạn 4 như view quiz).
// Lệch số là dữ liệu store dev đổi: fail nêu rõ, không skip.
async function expectCollectionCount(page: Page, tags: string, check: (n: number) => void) {
  const res = await page.goto(`${QUIZ_PATH}/${tags}`);
  expect(res?.status(), `HTTP ${QUIZ_PATH}/${tags}`).toBe(200);
  check(await tid(page, 'collection-product').count());
}
const tid = (page: Page, id: string) => page.getByTestId(id);
const option = (page: Page, tag: string) => page.locator(`[data-testid="quiz-option-input"][value="${tag}"]`);

function watchConsole(page: Page) {
  const errors: string[] = [];
  const isShopPay403 = watchShopPay403(page);
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    if (isShopPay403(msg)) return;
    if (IGNORE_CONSOLE.some((r) => r.test(msg.text()) || r.test(msg.location().url))) return;
    errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

async function expectNoSeriousAxe(page: Page) {
  await expectNotChallenged(page);
  const { violations } = await new AxeBuilder({ page }).analyze();
  const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(serious.map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
}

async function noJsPage(browser: Browser) {
  const use = test.info().project.use;
  const context = await browser.newContext({
    javaScriptEnabled: false,
    storageState: 'tests/setup/state.json',
    baseURL: use.baseURL,
    ...(use.viewport ? { viewport: use.viewport } : {}),
    ...(use.userAgent ? { userAgent: use.userAgent } : {}),
    ...(use.isMobile !== undefined ? { isMobile: use.isMobile, hasTouch: use.hasTouch } : {}),
  });
  return { context, page: await context.newPage() };
}

// ES1-T417: CTA trỏ collection đang xem (blocks/quiz.liquid: results_url = collection.url khi không có setting).
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
async function expectEmptyResults(page: Page, collectionPath = '/collections/all') {
  await expect(tid(page, 'quiz-results')).toHaveAttribute('data-quiz-count', '0');
  await expect(tid(page, 'quiz-results-grid')).toHaveCount(0);
  await expect(tid(page, 'product-card')).toHaveCount(0);
  await expect(tid(page, 'quiz-empty')).toBeVisible();
  await expect(tid(page, 'quiz-empty-text')).not.toBeEmpty();
  await expect(tid(page, 'quiz-empty-cta')).toHaveAttribute('href', new RegExp(`${escapeRe(collectionPath)}$`));
}

test.describe('ES1-T138 TE-11 kết quả quiz', () => {
  test('AC3 tag không sản phẩm nào có (ES1-T133 #1): vẫn là collection.quiz, 0 card, không ra cả collection', async ({ page }) => {
    const response = await page.goto(UNUSED_TAGS);
    expect(response?.status(), 'ES1-T133 #1: redirect bỏ tag rồi trả 200').toBe(200);
    await expect(tid(page, 'collection-products'), 'redirect làm mất ?view=quiz thì D3 phải đổi').toHaveCount(0);
    await expect(tid(page, 'quiz')).toHaveCount(1);
    await expectEmptyResults(page);
  });

  test('AC3 vào thẳng không có tag: h1 là tên collection, text rỗng và link dùng được', async ({ page }) => {
    const response = await page.goto(NO_TAGS);
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).not.toBeEmpty();
    await expect(tid(page, 'quiz-form')).toHaveCount(0);
    await expect(tid(page, 'quiz-step')).toHaveCount(0);
    await expect(tid(page, 'quiz-results-heading')).toBeVisible();
    await expectEmptyResults(page);
  });

  test('AC3 bộ nhiều kết quả: tối đa 4 card, data-quiz-count khớp, card đúng hook', async ({ page }) => {
    test.skip(!quizReady(), QUIZ_SKIP);
    // ES1-T417: bộ nhiều ≥ 5 sản phẩm trong collection riêng → view quiz cắt còn 4
    await expectCollectionCount(page, MANY_TAGS, (n) => expect(n, `${QUIZ_PATH}/${MANY_TAGS} ≥ 5 sản phẩm (ES1-T178)`).toBeGreaterThanOrEqual(5));
    await page.goto(MANY);
    const cards = tid(page, 'product-card');
    await expect(cards).toHaveCount(4);
    await expect(tid(page, 'quiz-results')).toHaveAttribute('data-quiz-count', '4');
    await expect(tid(page, 'quiz-results-grid')).toBeVisible();
    await expect(tid(page, 'quiz-empty')).toBeHidden();
    await expect(tid(page, 'quiz-results-grid').locator('h4')).toHaveCount(4);
  });

  test('AC3 bộ 1 kết quả: đúng 1 card', async ({ page }) => {
    test.skip(!quizReady(), QUIZ_SKIP);
    // ES1-T417: bộ một = 1 sản phẩm trong collection riêng
    await expectCollectionCount(page, ONE_TAGS, (n) => expect(n, `${QUIZ_PATH}/${ONE_TAGS} = 1 sản phẩm (ES1-T178)`).toBe(1));
    await page.goto(ONE);
    await expect(tid(page, 'product-card')).toHaveCount(1);
    await expect(tid(page, 'quiz-results')).toHaveAttribute('data-quiz-count', '1');
  });

  test('AC3 bộ rỗng (ES1-T134 #3): trang 200, 0 card, text rỗng', async ({ page }) => {
    test.skip(!quizReady(), QUIZ_SKIP);
    // ES1-T417: bộ rỗng = 0 sản phẩm trong collection riêng (7 sản phẩm cố định, ES1-T178), không dựa tổ hợp tag trên /collections/all (ES1-T300)
    const response = await page.goto(NONE);
    expect(response?.status(), 'ES1-T133 #1: trang 200 không có kết quả').toBe(200);
    await expectEmptyResults(page, QUIZ_PATH);
  });

  test('AC3 trang chủ cấu hình đủ: partial có mặt và rỗng, panel ẩn, không thêm khoảng trống', async ({ page }) => {
    await page.goto(TE11);
    await expect(tid(page, 'quiz-results')).toHaveCount(1);
    await expect(tid(page, 'quiz-results')).toHaveAttribute('data-quiz-count', '0');
    await expect(tid(page, 'quiz-results')).toBeEmpty();
    await expect(tid(page, 'quiz-results-heading')).toBeHidden();
    await expect(tid(page, 'quiz-empty')).toBeHidden();
    await expect(tid(page, 'quiz-empty-text')).toBeHidden();

    const quiz = tid(page, 'quiz');
    const before = (await quiz.boundingBox())!.height;
    await quiz.evaluate((el) => el.querySelector('[data-quiz-results-panel]')?.remove());
    expect((await quiz.boundingBox())!.height).toBe(before);
  });

  test('AC3 hook cho BE1 trên root trang chủ', async ({ page }) => {
    await page.goto(TE11);
    const quiz = tid(page, 'quiz');
    await expect(quiz).toHaveJSProperty('tagName', 'QUIZ-FINDER');
    // ES1-T417: index.te11.liquid truyền collection TE11_QUIZ_COLLECTION ở TE-11-R2-FE1 (ES1-T387); trước đó là all
    await expect(quiz).toHaveAttribute('data-results-url', new RegExp(`/collections/(all${QUIZ ? `|${escapeRe(encodeURIComponent(QUIZ))}` : ''})$`));
    await expect(quiz).toHaveAttribute('data-results-view', 'quiz');
    await expect(quiz).toHaveAttribute('data-label-results', /%n/);
    await expect(tid(page, 'quiz-empty-cta')).toHaveAttribute('href', (await quiz.getAttribute('data-results-url'))!);
    await expect(tid(page, 'quiz-results-heading')).toHaveAttribute('tabindex', '-1');
  });

  test('AC3 partial nằm ngoài form, product-swatch.js nạp ngoài partial', async ({ page }) => {
    await page.goto(TE11);
    await expect(tid(page, 'quiz-form').getByTestId('quiz-results')).toHaveCount(0);
    await expect(tid(page, 'quiz').locator('script[src*="product-swatch"]')).toHaveCount(1);
    await expect(tid(page, 'quiz-results').locator('script')).toHaveCount(0);
  });

  test('AC3 axe 0 serious và 0 console error trên collection.quiz', async ({ page }) => {
    const errors = watchConsole(page);
    await page.goto(quizReady() ? MANY : NO_TAGS); // ES1-T417
    await expectNoSeriousAxe(page);
    expect(errors).toEqual([]);
  });

  test('nojs AC1 submit sang search, kết quả có sản phẩm mang tag đã chọn', async ({ browser }) => {
    test.skip(!tagsReady() || !filterReady(), 'TE11_TAGS_READY hoặc TE11_TAG_FILTER_READY chưa true (ES1-T134)');
    const { context, page } = await noJsPage(browser);
    await page.goto(TE11);
    await option(page, 'quiz-upper').check();
    await option(page, 'quiz-beginner').check();
    await option(page, 'quiz-home').check();
    await tid(page, 'quiz-submit').click();
    await page.waitForURL(/\/search\?/);

    const url = new URL(page.url());
    expect(url.searchParams.get('q')).toBe('*');
    expect(url.searchParams.get('type')).toBe('product');
    expect(url.searchParams.getAll('filter.p.tag').sort()).toEqual(['quiz-beginner', 'quiz-home', 'quiz-upper']);

    const first = page.locator('.search-result a').first();
    await expect(first).toBeVisible();
    const handle = new URL((await first.getAttribute('href'))!, page.url()).pathname.split('/').pop()!;
    const product = await context.request.get(`${url.origin}/products/${handle}.json`);
    if (product.status() === 429) skip429('Store trả 429 cho /products/*.json, không đọc được tag (xem ES1-T100)');
    expect(product.ok()).toBeTruthy();
    const { product: data } = (await product.json()) as { product: { tags: string } };
    const tags = data.tags.split(',').map((tag) => tag.trim());
    expect(tags.some((tag) => ['quiz-upper', 'quiz-beginner', 'quiz-home'].includes(tag))).toBeTruthy();
    await context.close();
  });

  test('nojs AC3 collection.quiz hiện kết quả không cần JS', async ({ browser }) => {
    const { context, page } = await noJsPage(browser);
    await page.goto(NO_TAGS);
    await expectEmptyResults(page);
    await context.close();
  });
});
