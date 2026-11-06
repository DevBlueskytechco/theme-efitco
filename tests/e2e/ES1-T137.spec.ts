// KHÔNG CHẮC: spec chưa chạy (phiên viết không có preview, chưa type-check); scope-guard chặn dev-fe ghi tests/ → Orchestrator chép sang tests/e2e/ES1-T137.spec.ts.
// Ticket ES1-T137 TE-11-FE1: quiz markup + CSS (docs/srs.md#TE-11 AC1, AC4; drafts/techlead/ES1-T132/task-split.md D1, D2, D4, D5, D7, D9).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T137.spec.ts -g "AC1|AC4|nojs"
// ES1-T139: test chỉ đúng trước khi JS nâng cấp thì gọi withoutModule, vì quiz ở đầu ?view=te11 nên module nạp ngay.
import { test, expect, type Browser, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { expectNotChallenged } from './support/store-guard';
import { watchShopPay403 } from './support/console-guard';

const TE11 = '/?view=te11';
const HOME = '/';
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];

const tid = (page: Page, id: string) => page.getByTestId(id);
const step = (page: Page, n: number) => page.locator(`[data-testid="quiz-step"][data-quiz-step="${n}"]`);
const option = (page: Page, tag: string) => page.locator(`[data-testid="quiz-option-input"][value="${tag}"]`);
const withoutModule = (page: Page) => page.route(/\/quiz-finder\.js/, (route) => route.abort());

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

async function noJsPage(browser: Browser, width?: number) {
  const use = test.info().project.use;
  const context = await browser.newContext({
    javaScriptEnabled: false,
    storageState: 'tests/setup/state.json',
    baseURL: use.baseURL,
    ...(width ? { viewport: { width, height: 740 } } : use.viewport ? { viewport: use.viewport } : {}),
    ...(use.userAgent ? { userAgent: use.userAgent } : {}),
    ...(use.isMobile !== undefined ? { isMobile: use.isMobile, hasTouch: use.hasTouch } : {}),
  });
  return { context, page: await context.newPage() };
}

test.describe('ES1-T137 TE-11 quiz', () => {
  test('AC1 ?view=te11 trả template kiểm thử, không phải trang chủ thường', async ({ page }) => {
    const response = await page.goto(TE11);
    expect(response?.ok()).toBeTruthy();
    await expect(page.getByTestId('container-te11-quiz')).toBeVisible();
    await expect(page.getByTestId('container-home-quiz')).toHaveCount(0);
    await expect(tid(page, 'quiz-heading')).toHaveText('Find Your Perfect Gear');
    await expect(tid(page, 'quiz-eyebrow')).toHaveText('Our most-loved feature');
    await expect(tid(page, 'quiz-subheading')).toHaveText('Three questions. One shortlist.');
    await expect(tid(page, 'quiz-note')).toHaveCount(2);
    await expect(tid(page, 'quiz-placeholder')).toHaveCount(0);
  });

  test('AC1 có JS trước khi module nâng cấp: chỉ bước 1, chọn xong bước kế mới hiện', async ({ page }) => {
    await withoutModule(page);
    await page.goto(TE11);
    await expect(step(page, 1)).toBeVisible();
    await expect(step(page, 1).getByTestId('quiz-step-progress')).toHaveText('Step 1 of 3');
    await expect(step(page, 2)).toBeHidden();
    await expect(step(page, 3)).toBeHidden();
    await expect(tid(page, 'quiz-submit')).toBeHidden();
    await expect(tid(page, 'quiz-back')).toBeHidden();

    await option(page, 'quiz-upper').check();
    await expect(step(page, 2)).toBeVisible();
    await expect(step(page, 3)).toBeHidden();

    await option(page, 'quiz-beginner').check();
    await expect(step(page, 3)).toBeVisible();

    await option(page, 'quiz-home').check();
    await expect(tid(page, 'quiz-submit')).toBeVisible();
  });

  test('AC1 bỏ chọn bước 1 thì các bước sau ẩn lại (chưa có module)', async ({ page }) => {
    await withoutModule(page);
    await page.goto(TE11);
    await option(page, 'quiz-upper').check();
    await option(page, 'quiz-beginner').check();
    await expect(step(page, 3)).toBeVisible();
    await option(page, 'quiz-upper').uncheck();
    await expect(step(page, 2)).toBeHidden();
    await expect(step(page, 3)).toBeHidden();
  });

  test('AC1 markup: form GET, fieldset, legend chứa h3, input đúng tên và tag', async ({ page }) => {
    await withoutModule(page);
    await page.goto(TE11);
    const form = tid(page, 'quiz-form');
    await expect(form).toHaveAttribute('method', /get/i);
    await expect(form).toHaveAttribute('action', /\/search$/);
    await expect(form.locator('input[type="hidden"][name="q"]')).toHaveValue('*');
    await expect(form.locator('input[type="hidden"][name="type"]')).toHaveValue('product');

    const title = step(page, 1).locator('legend h3');
    await expect(title).toHaveText('Where do you want to focus?');
    await expect(title).toHaveAttribute('tabindex', '-1');
    await expect(title).toHaveAttribute('data-testid', 'quiz-step-title');
    await expect(step(page, 1)).toHaveJSProperty('tagName', 'FIELDSET');

    const input = option(page, 'quiz-upper');
    await expect(input).toHaveAttribute('name', 'filter.p.tag');
    await expect(input).toHaveAttribute('data-tag-handle', 'quiz-upper');
  });

  test('AC1 ca 3, 2, 4 lựa chọn đúng số hàng', async ({ page }) => {
    await page.goto(TE11);
    await expect(step(page, 1).getByTestId('quiz-option')).toHaveCount(3);
    await expect(step(page, 2).getByTestId('quiz-option')).toHaveCount(2);
    await expect(step(page, 3).getByTestId('quiz-option')).toHaveCount(4);
  });

  test('AC1 bước có dưới 2 lựa chọn hợp lệ: storefront không render', async ({ page }) => {
    await page.goto(TE11);
    await expect(tid(page, 'quiz')).toHaveCount(1);
    await expect(page.getByText('Hidden question')).toHaveCount(0);
    await expect(page.getByText('Hidden quiz')).toHaveCount(0);
  });

  test('AC1 trang chủ chưa cấu hình: quiz đủ 3 bước theo D1 ES1-T169', async ({ page }) => {
    const errors = watchConsole(page);
    await page.goto(HOME);
    await expect(tid(page, 'quiz')).toHaveCount(1);
    await expect(tid(page, 'quiz-step')).toHaveCount(3);
    await expect(tid(page, 'quiz-placeholder')).toHaveCount(0);
    await expectNoSeriousAxe(page);
    expect(errors).toEqual([]);
  });

  test('AC1 axe 0 serious và 0 console error trên ?view=te11', async ({ page }) => {
    const errors = watchConsole(page);
    await page.goto(TE11);
    await expectNoSeriousAxe(page);
    expect(errors).toEqual([]);
  });

  test('AC4 360: body map không hiển thị, mỗi hàng cao từ 44px, trang không tràn ngang', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto(TE11);
    const map = tid(page, 'quiz-body-map');
    test.skip((await map.count()) === 0, 'Store không có ảnh sản phẩm cho body map');
    await expect(map).toBeHidden();

    const rows = await step(page, 1).getByTestId('quiz-option').all();
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      const box = await row.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('AC4 bấm vào chữ của hàng cũng chọn được', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto(TE11);
    await step(page, 1).getByTestId('quiz-option').first().click();
    await expect(option(page, 'quiz-upper')).toBeChecked();
  });

  test('AC4 từ 768: body map hiện, bước không có ảnh không chiếm chỗ', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 900 });
    await page.goto(TE11);
    const map = tid(page, 'quiz-body-map');
    test.skip((await map.count()) === 0, 'Store không có ảnh sản phẩm cho body map');
    await expect(map).toBeVisible();
    await expect(map.locator('img')).toHaveAttribute('alt', '');
    await expect(map.locator('img')).toHaveAttribute('loading', 'lazy');
    await expect(step(page, 2).getByTestId('quiz-body-map')).toHaveCount(0);
  });

  test('nojs AC1 hiện đủ 3 bước, tiến độ từng bước, nút Back ẩn', async ({ browser }) => {
    const { context, page } = await noJsPage(browser);
    await page.goto(TE11);
    const expected = ['Step 1 of 3', 'Step 2 of 3', 'Step 3 of 3'];
    for (const [i, text] of expected.entries()) {
      await expect(step(page, i + 1)).toBeVisible();
      await expect(step(page, i + 1).getByTestId('quiz-step-progress')).toHaveText(text);
    }
    await expect(step(page, 1).getByTestId('quiz-step-progress-bar')).toHaveAttribute('style', /--quiz-progress:\s*33\.33%/);
    await expect(step(page, 3).getByTestId('quiz-step-progress-bar')).toHaveAttribute('style', /--quiz-progress:\s*100(\.0)?%/);
    await expect(tid(page, 'quiz-submit')).toBeVisible();
    await expect(tid(page, 'quiz-back')).toBeHidden();
    await context.close();
  });

  test('nojs AC1 submit sang trang search với đủ filter.p.tag đã chọn', async ({ browser }) => {
    const { context, page } = await noJsPage(browser);
    await page.goto(TE11);
    await option(page, 'quiz-upper').check();
    await option(page, 'quiz-beginner').check();
    await option(page, 'quiz-home').check();
    await tid(page, 'quiz-submit').click();
    await page.waitForURL(/\/search\?/);

    const url = new URL(page.url());
    expect(url.pathname).toMatch(/\/search$/);
    expect(url.searchParams.get('q')).toBe('*');
    expect(url.searchParams.get('type')).toBe('product');
    expect(url.searchParams.getAll('filter.p.tag').sort()).toEqual(['quiz-beginner', 'quiz-home', 'quiz-upper']);
    await context.close();
  });

  test('nojs AC4 360: body map ẩn, mọi hàng của 3 bước cao từ 44px', async ({ browser }) => {
    const { context, page } = await noJsPage(browser, 360);
    await page.goto(TE11);
    const rows = await tid(page, 'quiz-option').all();
    expect(rows.length).toBe(9);
    for (const row of rows) {
      const box = await row.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
    const map = tid(page, 'quiz-body-map');
    if (await map.count()) await expect(map).toBeHidden();
    await context.close();
  });
});
