// KHÔNG CHẮC: spec chưa chạy, chưa type-check (phiên viết không có trình duyệt và preview; CTO 06/11: e2e tắt tới khi trang chủ xong).
// Ticket ES1-T139 TE-11-BE1: lazy-module + quiz-finder (docs/srs.md#TE-11 AC2, AC3, AC-H16, AC-H17; drafts/techlead/ES1-T132/task-split.md D3, D4, D5, D6, D8, D9).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T139.spec.ts -g "AC2|AC3"
// Dữ liệu ES1-T134 trong tests/e2e/store-data.json: TE11_TAGS_READY; chưa true thì test cần card skip có lý do. Bộ lower + advanced + gym luôn rỗng: có dữ liệu thì 0 sản phẩm, chưa có thì tag không tồn tại (ES1-T133 #1).
import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { expectNotChallenged } from './support/store-guard';
import { env } from './support/store-data';
import { watchShopPay403 } from './support/console-guard';

const TE11 = '/?view=te11';
const HOME = '/';
const MODULE = /\/quiz-finder\.js/;
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];

const storeData = () => JSON.parse(readFileSync(join(process.cwd(), 'tests/e2e/store-data.json'), 'utf8')) as Record<string, unknown>;
const tagsReady = () => env('TE11_TAGS_READY') === 'true' || storeData().TE11_TAGS_READY === true;
const source = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

const tid = (page: Page, id: string) => page.getByTestId(id);
const step = (page: Page, n: number) => page.locator(`[data-testid="quiz-step"][data-quiz-step="${n}"]`);
const title = (page: Page, n: number) => step(page, n).getByTestId('quiz-step-title');
const option = (page: Page, tag: string) => page.locator(`[data-testid="quiz-option-input"][value="${tag}"]`);
const panel = (page: Page) => page.locator('[data-quiz-results-panel]');
const isResults = (url: URL) => url.pathname.includes('/collections/') && url.searchParams.get('view') === 'quiz';
// ES1-T300: tag không có trên sản phẩm nào; kết quả lọc theo tag này luôn 0 sản phẩm.
const EMPTY_TAG = 'es1-t300-khong-co-san-pham';

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

async function open(page: Page, width?: number) {
  if (width) await page.setViewportSize({ width, height: 900 });
  await page.goto(TE11);
  await expect(tid(page, 'quiz')).toHaveAttribute('data-enhanced', '');
  await page.evaluate(() => {
    (window as unknown as { __quizAlive: boolean }).__quizAlive = true;
  });
}

const expectNoReload = (page: Page) => expect(page.evaluate(() => (window as unknown as { __quizAlive?: boolean }).__quizAlive)).resolves.toBe(true);

async function expectStep(page: Page, n: number) {
  for (const i of [1, 2, 3]) {
    if (i === n) await expect(step(page, i)).toBeVisible();
    else await expect(step(page, i)).toBeHidden();
  }
  await expect(step(page, n)).toHaveAttribute('data-active', '');
  await expect(title(page, n)).toBeFocused();
  await expect(tid(page, 'quiz-status')).toHaveText(`Step ${n} of 3`);
  await expect(step(page, n).getByTestId('quiz-step-progress')).toHaveText(`Step ${n} of 3`);
}

async function answerEmptySet(page: Page) {
  await option(page, 'quiz-lower').check();
  await option(page, 'quiz-advanced').check();
  await option(page, 'quiz-gym').check();
}

test.describe('ES1-T139 TE-11 quiz-finder', () => {
  test('AC2 không tải quiz-finder.js khi block còn xa viewport, tới gần mới tải', async ({ page }) => {
    const loaded: string[] = [];
    page.on('request', (request) => {
      if (MODULE.test(request.url())) loaded.push(request.url());
    });
    await page.goto(HOME);
    await page.waitForLoadState('load');
    const quiz = tid(page, 'quiz');
    await expect(quiz).toHaveAttribute('data-lazy-module', MODULE);
    await expect(quiz.locator('script[src*="lazy-module"]')).toHaveCount(1);
    await expect.poll(() => page.evaluate(() => performance.getEntriesByType('resource').some((e) => e.name.includes('lazy-module.js')))).toBe(true);
    expect(loaded).toEqual([]);
    await expect(quiz).not.toHaveAttribute('data-enhanced', '');

    await quiz.scrollIntoViewIfNeeded();
    await expect(quiz).toHaveAttribute('data-enhanced', '');
    expect(loaded).toHaveLength(1);
  });

  test('AC2 trang kết quả riêng không nạp module, không có hook lazy', async ({ page }) => {
    const loaded: string[] = [];
    page.on('request', (request) => {
      if (/\/(quiz-finder|lazy-module)\.js/.test(request.url())) loaded.push(request.url());
    });
    await page.goto('/collections/all?view=quiz');
    await page.waitForLoadState('load');
    await expect(tid(page, 'quiz')).not.toHaveAttribute('data-lazy-module', /./);
    expect(loaded).toEqual([]);
  });

  test('AC2 click sang bước kế: tiến độ, focus h3, status đúng, không reload', async ({ page }) => {
    const errors = watchConsole(page);
    await open(page);
    await expect(step(page, 1)).toHaveAttribute('data-active', '');
    await expect(tid(page, 'quiz-back')).toBeHidden();

    await option(page, 'quiz-upper').check();
    await expectStep(page, 2);
    await expect(tid(page, 'quiz-back')).toBeVisible();

    await option(page, 'quiz-beginner').check();
    await expectStep(page, 3);
    await expectNoReload(page);
    expect(errors).toEqual([]);
  });

  // Input phủ cả hàng nên chuột thật trúng input; el.click() đi đúng đường label chuyển tiếp click, detail bằng 0.
  test('AC2 click qua label chuyển tiếp (detail 0) cũng sang bước', async ({ page }) => {
    await open(page);
    await step(page, 1).locator('.quiz-option__label').first().evaluate((el) => (el as HTMLElement).click());
    await expect(option(page, 'quiz-upper')).toBeChecked();
    await expectStep(page, 2);
  });

  test('AC2 chạm trên mobile sang bước', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Chỉ project Pixel 7 có touch');
    await open(page);
    await step(page, 1).getByTestId('quiz-option').first().tap();
    await expect(option(page, 'quiz-upper')).toBeChecked();
    await expectStep(page, 2);
  });

  test('AC2 double click chỉ sang 1 bước, không chọn hộ bước sau', async ({ page }) => {
    await open(page);
    await step(page, 1).getByTestId('quiz-option').first().dblclick();
    await expect(option(page, 'quiz-upper')).toBeChecked();
    await expectStep(page, 2);
    await expect(step(page, 2).locator('input:checked')).toHaveCount(0);
  });

  test('AC2 Back quay 1 bước, giữ lựa chọn, ẩn ở bước 1', async ({ page }) => {
    await open(page);
    await option(page, 'quiz-core').check();
    await option(page, 'quiz-advanced').check();

    await tid(page, 'quiz-back').click();
    await expectStep(page, 2);
    await expect(option(page, 'quiz-advanced')).toBeChecked();

    await tid(page, 'quiz-back').click();
    await expectStep(page, 1);
    await expect(option(page, 'quiz-core')).toBeChecked();
    await expect(tid(page, 'quiz-back')).toBeHidden();
    await expectNoReload(page);
  });

  test('AC2 mỗi bước 1 lựa chọn: radio, tên riêng theo bước', async ({ page }) => {
    await open(page);
    await expect(step(page, 1).locator('input[type="radio"]')).toHaveCount(3);
    const names = await tid(page, 'quiz-option-input').evaluateAll((inputs) => [...new Set(inputs.map((input) => (input as HTMLInputElement).name))]);
    expect(names).toHaveLength(3);
    expect(names).not.toContain('filter.p.tag');
  });

  test('AC2 phím mũi tên chỉ đổi lựa chọn; Enter, Space sang bước; Enter không submit', async ({ page }) => {
    await open(page);
    await option(page, 'quiz-upper').focus();
    await page.keyboard.press('ArrowDown');
    await expect(option(page, 'quiz-core')).toBeChecked();
    await expect(option(page, 'quiz-core')).toBeFocused();
    await expect(step(page, 1)).toHaveAttribute('data-active', '');
    await expect(step(page, 2)).toBeHidden();

    await page.keyboard.press('Enter');
    await expect(option(page, 'quiz-core')).toBeChecked();
    await expectStep(page, 2);

    await option(page, 'quiz-beginner').focus();
    await page.keyboard.press('Space');
    await expect(option(page, 'quiz-beginner')).toBeChecked();
    await expectStep(page, 3);

    await option(page, 'quiz-gym').focus();
    await page.keyboard.press('Enter');
    await expect(panel(page)).toBeVisible();
    await expect(page).not.toHaveURL(/\/search/);
    await expectNoReload(page);
  });

  test('AC2 sau phím mũi tên, click chuột vẫn sang bước', async ({ page }) => {
    await open(page);
    await option(page, 'quiz-upper').focus();
    await page.keyboard.press('ArrowDown');
    await expect(step(page, 1)).toHaveAttribute('data-active', '');
    await option(page, 'quiz-lower').check();
    await expectStep(page, 2);
  });

  test('AC2 chọn trước khi module nạp: lựa chọn còn, đúng bước', async ({ page }) => {
    let release = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route(MODULE, async (route) => {
      await gate;
      await route.continue();
    });
    await page.goto(TE11);
    await option(page, 'quiz-upper').check();
    await option(page, 'quiz-beginner').check();
    await expect(tid(page, 'quiz')).not.toHaveAttribute('data-enhanced', '');

    release();
    await expect(tid(page, 'quiz')).toHaveAttribute('data-enhanced', '');
    await expect(option(page, 'quiz-upper')).toBeChecked();
    await expect(option(page, 'quiz-beginner')).toBeChecked();
    await expect(option(page, 'quiz-upper')).toHaveAttribute('type', 'radio');
    await expectStep(page, 3);
  });

  test('AC2 AC-H17 bấm vùng body map chọn đúng lựa chọn và sang bước', async ({ page }) => {
    await open(page, 1280);
    const region = page.locator('[data-testid="quiz-body-region"][data-body-region="core"]');
    test.skip((await region.count()) === 0, 'Store không có ảnh sản phẩm cho body map');
    await region.click();
    await expect(option(page, 'quiz-core')).toBeChecked();
    await expect(option(page, 'quiz-upper')).not.toBeChecked();
    await expectStep(page, 2);
  });

  test('AC2 AC-H17 phím mũi tên trên bước có body map không sang bước', async ({ page }) => {
    await open(page, 1280);
    test.skip((await tid(page, 'quiz-body-map').count()) === 0, 'Store không có ảnh sản phẩm cho body map');
    await option(page, 'quiz-upper').focus();
    await page.keyboard.press('ArrowDown');
    await expect(option(page, 'quiz-core')).toBeChecked();
    await expect(step(page, 2)).toBeHidden();
  });

  test('AC2 axe 0 serious ở bước 2', async ({ page }) => {
    const errors = watchConsole(page);
    await open(page);
    await option(page, 'quiz-upper').check();
    await expectStep(page, 2);
    await expectNoSeriousAxe(page);
    expect(errors).toEqual([]);
  });

  test('AC3 AC-H16 bộ rỗng: text rỗng + link, status là text rỗng, focus tiêu đề, 0 console error', async ({ page }) => {
    // ES1-T300 (gộp ES1-T302): dữ liệu demo 4b3b9a5 có 3 sản phẩm mang đủ quiz-lower + quiz-advanced + quiz-gym → bộ này không còn rỗng (đỏ run 42978078054, :256).
    // Không dựa tổ hợp tag thật: page.route đổi đoạn tag cuối của request kết quả sang tag không tồn tại, store tự render partial 0 sản phẩm (đúng markup quiz.liquid, không tự viết HTML partial).
    // route.continue({ url }) do trình duyệt gửi, giữ cookie, không gọi lại store từ Node (ES1-T171).
    await page.route(isResults, (route) => {
      const url = new URL(route.request().url());
      url.pathname = url.pathname.replace(/\/[^/]+$/, `/${EMPTY_TAG}`);
      return route.continue({ url: url.href });
    });
    const errors = watchConsole(page);
    await open(page);
    await answerEmptySet(page);

    await expect(panel(page)).toBeVisible();
    await expect(tid(page, 'quiz-empty')).toBeVisible();
    await expect(tid(page, 'quiz-empty-cta')).toHaveAttribute('href', (await tid(page, 'quiz').getAttribute('data-results-url'))!);
    await expect(tid(page, 'product-card')).toHaveCount(0);
    await expect(tid(page, 'quiz-results')).toHaveAttribute('data-quiz-count', '0');
    const text = await tid(page, 'quiz-empty-text').textContent();
    await expect(tid(page, 'quiz-status')).toHaveText(text!);
    await expect(tid(page, 'quiz-results-heading')).toBeFocused();
    await expect(panel(page)).not.toHaveAttribute('aria-busy', /./);
    await expectNoReload(page);
    await expectNoSeriousAxe(page);
    expect(errors).toEqual([]);
  });

  test('AC3 URL kết quả: handle nối bằng dấu cộng, đúng view', async ({ page }) => {
    await open(page);
    const request = page.waitForRequest((r) => isResults(new URL(r.url())));
    await answerEmptySet(page);
    const url = new URL((await request).url());
    expect(url.pathname).toMatch(/\/collections\/all\/quiz-lower\+quiz-advanced\+quiz-gym$/);
    expect(url.searchParams.get('view')).toBe('quiz');
  });

  test('AC3 aria-busy trên vùng kết quả khi đang tải, gỡ khi xong', async ({ page }) => {
    let release = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route(isResults, async (route) => {
      await gate;
      await route.continue();
    });
    await open(page);
    await answerEmptySet(page);
    await expect(panel(page)).toHaveAttribute('aria-busy', 'true');
    release();
    await expect(panel(page)).toBeVisible();
    await expect(panel(page)).not.toHaveAttribute('aria-busy', /./);
  });

  test('AC3 đổi nhanh ở bước cuối: request cũ bị huỷ, chỉ còn kết quả cuối', async ({ page }) => {
    const failed: string[] = [];
    page.on('requestfailed', (request) => failed.push(request.url()));
    let release = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route(
      (url) => isResults(url) && url.pathname.includes('quiz-home'),
      async (route) => {
        await gate;
        await route.continue().catch(() => {});
      }
    );
    await open(page);
    await option(page, 'quiz-lower').check();
    await option(page, 'quiz-advanced').check();
    await option(page, 'quiz-home').check();
    await expect(panel(page)).toHaveAttribute('aria-busy', 'true');
    await option(page, 'quiz-gym').check();

    await expect(panel(page)).toBeVisible();
    await expect(panel(page)).not.toHaveAttribute('aria-busy', /./);
    const status = await tid(page, 'quiz-status').textContent();
    release();
    await page.waitForTimeout(500);
    expect(failed.some((url) => url.includes('quiz-home'))).toBe(true);
    await expect(tid(page, 'quiz-status')).toHaveText(status!);
    await expect(page).not.toHaveURL(/\/search/);
    await expectNoReload(page);
  });

  test('AC3 Back khi có kết quả: ẩn và xoá, quay về bước 2, giữ lựa chọn', async ({ page }) => {
    await open(page);
    await answerEmptySet(page);
    await expect(panel(page)).toBeVisible();

    await tid(page, 'quiz-back').click();
    await expect(panel(page)).toBeHidden();
    await expect(tid(page, 'quiz-empty')).toBeHidden();
    await expect(tid(page, 'quiz-results')).toBeEmpty();
    await expectStep(page, 2);
    await expect(option(page, 'quiz-advanced')).toBeChecked();
    await expect(option(page, 'quiz-gym')).toBeChecked();
  });

  test('AC3 Back khi đang tải: không hiện kết quả về muộn, không sang search', async ({ page }) => {
    let release = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route(isResults, async (route) => {
      await gate;
      await route.continue().catch(() => {});
    });
    await open(page);
    await answerEmptySet(page);
    await tid(page, 'quiz-back').click();
    await expectStep(page, 2);
    release();
    await page.waitForTimeout(500);
    await expect(panel(page)).toBeHidden();
    await expect(panel(page)).not.toHaveAttribute('aria-busy', /./);
    await expect(page).not.toHaveURL(/\/search/);
  });

  test('AC3 route.abort partial: sang trang search với đủ tag, cùng URL như không JS', async ({ page }) => {
    await page.route(isResults, (route) => route.abort());
    await open(page);
    await option(page, 'quiz-upper').check();
    await option(page, 'quiz-beginner').check();
    await option(page, 'quiz-home').check();
    await page.waitForURL(/\/search\?/);

    const url = new URL(page.url());
    expect(url.searchParams.get('q')).toBe('*');
    expect(url.searchParams.get('type')).toBe('product');
    expect(url.searchParams.getAll('filter.p.tag').sort()).toEqual(['quiz-beginner', 'quiz-home', 'quiz-upper']);
  });

  test('AC3 partial trả lỗi 500: sang trang search, khách không kẹt', async ({ page }) => {
    await page.route(isResults, (route) => route.fulfill({ status: 500, contentType: 'text/html', body: '<!doctype html><title>Error</title>' }));
    await open(page);
    await option(page, 'quiz-upper').check();
    await option(page, 'quiz-beginner').check();
    await option(page, 'quiz-home').check();
    await page.waitForURL(/\/search\?/);
    expect(new URL(page.url()).searchParams.getAll('filter.p.tag')).toHaveLength(3);
  });

  test('AC3 có dữ liệu: tối đa 4 card, status từ data-label-results, swatch trong card chạy sau apply', async ({ page }) => {
    test.skip(!tagsReady(), 'TE11_TAGS_READY chưa true (ES1-T134)');
    const errors = watchConsole(page);
    await open(page);
    await option(page, 'quiz-upper').check();
    await option(page, 'quiz-beginner').check();
    await option(page, 'quiz-home').check();

    await expect(tid(page, 'product-card')).toHaveCount(4);
    await expect(tid(page, 'quiz-empty')).toBeHidden();
    await expect(tid(page, 'quiz-results-heading')).toBeFocused();
    const label = await tid(page, 'quiz').getAttribute('data-label-results');
    await expect(tid(page, 'quiz-status')).toHaveText(label!.replace('%n', '4'));
    await expectNoSeriousAxe(page);

    const swatches = tid(page, 'quiz-results-grid').locator('product-swatch').filter({ has: page.locator('input[data-variant-id]') });
    if (await swatches.count()) {
      const card = swatches.first();
      const inputs = card.locator('input[data-variant-id]');
      if ((await inputs.count()) > 1) {
        await inputs.nth(1).check({ force: true });
        const url = await inputs.nth(1).getAttribute('data-variant-url');
        await expect(card.locator('a[data-card-link]').first()).toHaveAttribute('href', url!);
      }
    }
    await expectNoReload(page);
    expect(errors).toEqual([]);
  });

  test('AC3 contract: tên partial khớp Liquid, trần byte', async () => {
    expect(source('assets/quiz-finder.js')).toContain('partials.fetch("quiz-results"');
    expect(source('blocks/quiz.liquid')).toContain("{% partial 'quiz-results' %}");
    // ADR 0010 (ES1-T316): lazy-module thêm data-lazy-on="interaction", trần 384 → 768
    expect(statSync(join(process.cwd(), 'assets/lazy-module.js')).size).toBeLessThanOrEqual(768);
    expect(statSync(join(process.cwd(), 'assets/quiz-finder.js')).size).toBeLessThanOrEqual(4352);
  });
});
