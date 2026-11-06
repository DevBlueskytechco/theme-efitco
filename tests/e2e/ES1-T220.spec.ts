// KHÔNG CHẮC: spec chưa chạy, chưa type-check (phiên viết không mở được Chrome; chờ CI).
// Ticket ES1-T220: nút next/back tự ẩn làm focus rơi về body. Test gốc: tests/e2e/ES1-T185.spec.ts:224.
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T220.spec.ts tests/e2e/ES1-T185.spec.ts
// Nút chỉ hiện từ 48rem nên đặt viewport 1024 ở cả desktop và Pixel 7 (giống ES1-T185).
import { readFileSync, statSync } from 'node:fs';
import { test, expect, type Page } from '@playwright/test';

const JS_FILE = 'assets/scroll-buttons.js';

const five = (page: Page) => page.getByTestId('container-te15-five');
const root = (page: Page) => five(page).locator('scroll-buttons');
const track = (page: Page) => five(page).getByTestId('collection-list-track');
const prev = (page: Page) => five(page).getByTestId('collection-list-prev');
const next = (page: Page) => five(page).getByTestId('collection-list-next');
const scrollLeft = (page: Page) => track(page).evaluate((el) => el.scrollLeft);

async function open(page: Page) {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto('/?view=te15');
  await expect(root(page)).toHaveAttribute('data-enhanced', '');
}

/** Cuộn đi 1 card, chờ nút back hiện. */
async function leaveStart(page: Page) {
  await next(page).click();
  await expect(prev(page)).toBeVisible();
  await expect.poll(() => scrollLeft(page)).toBeGreaterThan(0);
}

/** Bấm next bằng phím tới khi nút tự ẩn. Không nhảy thẳng tới cuối: scroll-snap mandatory kéo về card gần nhất. */
async function pressNextToEnd(page: Page) {
  for (let i = 0; i < 20 && (await next(page).isVisible()); i += 1) {
    const before = await scrollLeft(page);
    await next(page).focus();
    await page.keyboard.press('Enter');
    await expect.poll(() => scrollLeft(page)).toBeGreaterThan(before);
    // Chờ cuộn smooth dừng để lần bấm sau tính từ đúng card.
    await expect
      .poll(async () => {
        const a = await scrollLeft(page);
        await page.waitForTimeout(100);
        return a === (await scrollLeft(page));
      })
      .toBe(true);
  }
}

test.describe('ES1-T220 tĩnh', () => {
  test('trần 768 B của ES1-T185; đọc activeElement trước khi gán hidden', () => {
    expect(statSync(JS_FILE).size).toBeLessThanOrEqual(768);
    const js = readFileSync(JS_FILE, 'utf8');
    expect(js.indexOf('document.activeElement')).toBeGreaterThan(-1);
    expect(js.indexOf('document.activeElement')).toBeLessThan(js.indexOf('.hidden'));
  });
});

test.describe('ES1-T220 nút đang focus tự ẩn', () => {
  test('back tự ẩn ở đầu: focus sang next, Enter bấm tiếp được', async ({ page }) => {
    await open(page);
    await leaveStart(page);
    await prev(page).focus();
    await page.keyboard.press('Enter');
    await expect(prev(page)).toBeHidden();
    await expect(next(page)).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(prev(page)).toBeVisible();
    await expect(next(page)).toBeFocused();
  });

  test('next tự ẩn ở cuối: focus sang back, Enter bấm tiếp được', async ({ page }) => {
    await open(page);
    await pressNextToEnd(page);
    await expect(next(page)).toBeHidden();
    await expect(prev(page)).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(next(page)).toBeVisible();
    await expect(prev(page)).toBeFocused();
  });

  test('reduced-motion: cuộn không smooth vẫn chuyển focus', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    await leaveStart(page);
    await prev(page).focus();
    await page.keyboard.press('Enter');
    await expect(prev(page)).toBeHidden();
    await expect(next(page)).toBeFocused();
  });

  test('chuột: bấm back tới khi tự ẩn, focus không rơi về body', async ({ page }) => {
    await open(page);
    await leaveStart(page);
    await prev(page).click();
    await expect(prev(page)).toBeHidden();
    await expect(next(page)).toBeFocused();
  });
});

test.describe('ES1-T220 không cướp focus', () => {
  test('focus ở khung cuộn: nút back tự ẩn, focus giữ ở khung cuộn', async ({ page }) => {
    await open(page);
    await leaveStart(page);
    await track(page).focus();
    await track(page).evaluate((el) => el.scrollTo({ left: 0 }));
    await expect(prev(page)).toBeHidden();
    await expect(track(page)).toBeFocused();
  });

  test('bấm next khi còn cuộn được: focus giữ ở next', async ({ page }) => {
    await open(page);
    await next(page).focus();
    await page.keyboard.press('Enter');
    await expect(prev(page)).toBeVisible();
    await expect(next(page)).toBeFocused();
  });
});
