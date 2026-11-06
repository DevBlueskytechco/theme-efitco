// KHÔNG CHẮC: spec chưa chạy, chưa type-check (phiên viết không mở được Chrome; chờ CI).
// Ticket ES1-T219: double click giữ focus ở tiêu đề bước mới (docs/srs.md#TE-11 AC2). Test gốc: tests/e2e/ES1-T139.spec.ts:140.
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T219.spec.ts
import { test, expect, type Locator, type Page } from '@playwright/test';

const tid = (page: Page, id: string) => page.getByTestId(id);
const step = (page: Page, n: number) => page.locator(`[data-testid="quiz-step"][data-quiz-step="${n}"]`);
const title = (page: Page, n: number) => step(page, n).getByTestId('quiz-step-title');
const option = (page: Page, tag: string) => page.locator(`[data-testid="quiz-option-input"][value="${tag}"]`);
const isResults = (url: URL) => url.pathname.includes('/collections/') && url.searchParams.get('view') === 'quiz';

async function open(page: Page) {
  await page.goto('/?view=te11');
  await expect(tid(page, 'quiz')).toHaveAttribute('data-enhanced', '');
}

// mouse.click với clickCount 2 tạo đúng 1 lần bấm có detail 2: lần bấm thứ 2 của double click, rơi vào phần tử chọn trước.
async function secondPress(page: Page, target: Locator) {
  const box = await target.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2, { clickCount: 2 });
}

test.describe('ES1-T219 double click giữ focus ở tiêu đề', () => {
  test('double click lựa chọn bước 1: sang bước 2, focus tiêu đề, 0 lựa chọn bị chọn hộ', async ({ page }) => {
    await open(page);
    await step(page, 1).getByTestId('quiz-option').first().dblclick();
    await expect(step(page, 2)).toHaveAttribute('data-active', '');
    await expect(title(page, 2)).toBeFocused();
    await expect(tid(page, 'quiz-status')).toHaveText('Step 2 of 3');
    await expect(step(page, 2).locator('input:checked')).toHaveCount(0);
  });

  test('sau double click, bấm chuột thường ở bước mới vẫn chọn và sang bước', async ({ page }) => {
    await open(page);
    await step(page, 1).getByTestId('quiz-option').first().dblclick();
    await expect(title(page, 2)).toBeFocused();
    await step(page, 2).getByTestId('quiz-option').filter({ has: option(page, 'quiz-beginner') }).click();
    await expect(option(page, 'quiz-beginner')).toBeChecked();
    await expect(step(page, 3)).toHaveAttribute('data-active', '');
    await expect(title(page, 3)).toBeFocused();
  });

  test('lần bấm thứ 2 rơi ngoài lựa chọn: focus không rơi về body', async ({ page }) => {
    await open(page);
    await option(page, 'quiz-upper').check();
    await expect(title(page, 2)).toBeFocused();
    await secondPress(page, step(page, 2).getByTestId('quiz-step-progress'));
    await expect(step(page, 2)).toHaveAttribute('data-active', '');
    await expect(title(page, 2)).toBeFocused();
  });

  test('double click lựa chọn bước cuối: 1 lựa chọn, focus tiêu đề kết quả', async ({ page }) => {
    const sent: string[] = [];
    page.on('request', (request) => {
      if (isResults(new URL(request.url()))) sent.push(request.url());
    });
    await open(page);
    await option(page, 'quiz-lower').check();
    await option(page, 'quiz-advanced').check();
    await step(page, 3).getByTestId('quiz-option').filter({ has: option(page, 'quiz-gym') }).dblclick();
    await expect(option(page, 'quiz-gym')).toBeChecked();
    await expect(page.locator('[data-quiz-results-panel]')).toBeVisible();
    await expect(tid(page, 'quiz-results-heading')).toBeFocused();
    expect(sent).toHaveLength(1);
  });

  test('bấm chuột thường vào Back chỉ lùi 1 bước: mousedown không chạy logic click', async ({ page }) => {
    await open(page);
    await option(page, 'quiz-upper').check();
    await option(page, 'quiz-beginner').check();
    await tid(page, 'quiz-back').click();
    await expect(step(page, 2)).toHaveAttribute('data-active', '');
    await expect(title(page, 2)).toBeFocused();
  });
});
