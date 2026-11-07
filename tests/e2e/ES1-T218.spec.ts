// KHÔNG CHẮC: spec chưa chạy, chưa type-check (phiên viết không có trình duyệt và preview); chờ CI.
// Ticket ES1-T218: Back hoặc đổi đáp án khi kết quả đang tải làm quiz kẹt (docs/srs.md#TE-11 AC2, AC3). Luồng chính nằm ở tests/e2e/ES1-T139.spec.ts:301, :347; file này giữ các ca hồi quy riêng của bug: 0 pageerror, request mới chạy, thử lại sau Back, lỗi thật vẫn sang search.
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T218.spec.ts
import { test, expect, type Page } from '@playwright/test';

const TE11 = '/?view=te11';

const tid = (page: Page, id: string) => page.getByTestId(id);
const step = (page: Page, n: number) => page.locator(`[data-testid="quiz-step"][data-quiz-step="${n}"]`);
const option = (page: Page, tag: string) => page.locator(`[data-testid="quiz-option-input"][value="${tag}"]`);
const panel = (page: Page) => page.locator('[data-quiz-results-panel]');
const isResults = (url: URL) => url.pathname.includes('/collections/') && url.searchParams.get('view') === 'quiz';

function watchPageErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  return errors;
}

async function open(page: Page) {
  await page.goto(TE11);
  await expect(tid(page, 'quiz')).toHaveAttribute('data-enhanced', '');
}

async function answer(page: Page, last: string) {
  await option(page, 'quiz-lower').check();
  await option(page, 'quiz-advanced').check();
  await option(page, last).check();
}

// Treo request kết quả theo tag; trả hàm thả để test tự dọn.
async function hold(page: Page, tag: string) {
  let release = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(
    (url) => isResults(url) && url.pathname.includes(tag),
    async (route) => {
      await gate;
      await route.continue().catch(() => {});
    }
  );
  return release;
}

test.describe('ES1-T218 quiz-finder khi kết quả đang tải', () => {
  test('Back khi đang tải: về bước 2, giữ lựa chọn, 0 pageerror', async ({ page }) => {
    const errors = watchPageErrors(page);
    const release = await hold(page, 'quiz-gym');
    await open(page);
    await answer(page, 'quiz-gym');
    await expect(panel(page)).toHaveAttribute('aria-busy', 'true');

    await tid(page, 'quiz-back').click();

    await expect(step(page, 2)).toHaveAttribute('data-active', '');
    await expect(step(page, 3)).toBeHidden();
    await expect(option(page, 'quiz-advanced')).toBeChecked();
    await expect(option(page, 'quiz-gym')).toBeChecked();
    await expect(panel(page)).toBeHidden();
    await expect(panel(page)).not.toHaveAttribute('aria-busy', /./);
    await expect(tid(page, 'quiz-results')).toHaveAttribute('data-quiz-count', '0');
    release();
    expect(errors).toEqual([]);
  });

  test('Đổi đáp án khi đang tải: request mới chạy, hết aria-busy, hiện kết quả, 0 pageerror', async ({ page }) => {
    const errors = watchPageErrors(page);
    const release = await hold(page, 'quiz-home');
    await open(page);
    await answer(page, 'quiz-home');
    await expect(panel(page)).toHaveAttribute('aria-busy', 'true');

    const request = page.waitForRequest((r) => isResults(new URL(r.url())) && r.url().includes('quiz-gym'));
    await option(page, 'quiz-gym').check();
    await request;

    await expect(panel(page)).toBeVisible();
    await expect(panel(page)).not.toHaveAttribute('aria-busy', /./);
    await expect(tid(page, 'quiz-results')).toHaveAttribute('data-quiz-count', /^\d+$/);
    release();
    expect(errors).toEqual([]);
  });

  test('Back khi đang tải rồi trả lời lại: vẫn ra kết quả, không kẹt', async ({ page }) => {
    const errors = watchPageErrors(page);
    const release = await hold(page, 'quiz-home');
    await open(page);
    await answer(page, 'quiz-home');
    await expect(panel(page)).toHaveAttribute('aria-busy', 'true');

    await tid(page, 'quiz-back').click();
    await expect(step(page, 2)).toHaveAttribute('data-active', '');
    await option(page, 'quiz-advanced').click();
    await expect(step(page, 3)).toHaveAttribute('data-active', '');
    await option(page, 'quiz-gym').check();

    await expect(panel(page)).toBeVisible();
    await expect(panel(page)).not.toHaveAttribute('aria-busy', /./);
    await expect(tid(page, 'quiz-results-heading')).toBeFocused();
    release();
    expect(errors).toEqual([]);
  });

  // Fix đổi cách đánh dấu chờ kết quả, nên phải giữ cách nhận biết lỗi: rỗng sau apply là lỗi, không phải 0 sản phẩm.
  test('Response 200 không có partial: sang search, không báo nhầm 0 sản phẩm', async ({ page }) => {
    await page.route(isResults, (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>No partial</title>' }));
    await open(page);
    await answer(page, 'quiz-gym');
    await page.waitForURL(/\/search\?/);
    expect(new URL(page.url()).searchParams.getAll('filter.p.tag')).toHaveLength(3);
  });
});
