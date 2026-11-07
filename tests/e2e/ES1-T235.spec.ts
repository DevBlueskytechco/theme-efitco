// ES1-T235: lớp chuyển động (trai_nghiem.xlsx) và chữ menu con. Playwright đặt navigator.webdriver nên motion.js tắt; spec này giả lập trình duyệt thường.
import { test, expect } from '@playwright/test';

const asUser = () => Object.defineProperty(navigator, 'webdriver', { get: () => false });

test.describe('ES1-T235 trải nghiệm', () => {
  test('hiện dần: phần dưới màn hình chờ, cuộn tới thì hiện đủ', async ({ page }) => {
    await page.addInitScript(asUser);
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'on');
    const block = page.locator('.shop-the-look');
    await expect(block).toHaveAttribute('data-reveal', 'wait');
    await block.scrollIntoViewIfNeeded();
    await expect(block).toHaveCSS('opacity', '1', { timeout: 5000 });
    await expect(block).not.toHaveAttribute('data-reveal', 'wait');
  });

  test('số thống kê chạy từ 0 khi cuộn tới, dừng đúng giá trị', async ({ page }) => {
    await page.addInitScript(asUser);
    await page.goto('/');
    const value = page.getByTestId('faq-stat-1').locator('.faq__stat-value');
    await expect(value).toHaveText('0+');
    await value.scrollIntoViewIfNeeded();
    await expect(value).toHaveText('360+', { timeout: 5000 });
  });

  test('prefers-reduced-motion: không bật chuyển động, nội dung hiện ngay', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce', storageState: 'tests/setup/state.json', baseURL: process.env.STORE_ORIGIN });
    const page = await context.newPage();
    await page.addInitScript(asUser);
    await page.goto(new URL(process.env.PREVIEW_URL!).pathname + new URL(process.env.PREVIEW_URL!).search);
    await expect(page.locator('html')).not.toHaveAttribute('data-motion', 'on');
    await expect(page.locator('[data-reveal]')).toHaveCount(0);
    await context.close();
  });

  test('menu con: chữ khác nền, cả khi hover', async ({ page }, ti) => {
    test.skip(ti.project.name !== 'desktop', 'Menu ngang chỉ có từ 80rem');
    await page.goto('/');
    const toggle = page.getByTestId('header-menu-toggle').first();
    await toggle.click();
    const link = page.getByTestId('header-submenu').first().locator('a').first();
    const colors = () => link.evaluate((el) => [getComputedStyle(el).color, getComputedStyle(el.closest('.site-header__submenu')!).backgroundColor]);
    let [color, background] = await colors();
    expect(color).not.toBe(background);
    expect(color).not.toContain('255, 255, 255');
    await link.hover();
    await page.waitForTimeout(300);
    [color, background] = await colors();
    expect(color).not.toBe(background);
  });

  test('chọn tiền tệ: bấm ra ngoài và Esc đều đóng', async ({ page }) => {
    await page.goto('/');
    const disclosure = page.locator('.site-footer__disclosure');
    test.skip((await disclosure.count()) === 0, 'Store chỉ có 1 nước, 1 ngôn ngữ');
    const toggle = page.getByTestId('footer-localization-toggle');
    const open = () => disclosure.evaluate((el: HTMLDetailsElement) => el.open);
    await toggle.click();
    expect(await open()).toBe(true);
    await page.mouse.click(5, 300);
    await expect.poll(open).toBe(false);
    await toggle.click();
    await page.keyboard.press('Escape');
    await expect.poll(open).toBe(false);
  });

  test('ghi chú giảm giá đã bỏ khỏi bundle và shop the look (CTO 07/11)', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('bundle-builder-note')).toHaveCount(0);
    await expect(page.getByTestId('shop-the-look-discount-note')).toHaveCount(0);
  });
});
