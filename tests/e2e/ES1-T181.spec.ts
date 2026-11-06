// KHÔNG CHẮC: spec chưa chạy (phiên viết không có preview, chưa type-check); scope-guard chặn dev-fe ghi tests/ → Orchestrator chép sang tests/e2e/ES1-T181.spec.ts.
// Ticket ES1-T181 TE-17-FE2: footer hàng 16 (1:1104), AC-H28. Form thành công, lỗi đã có ở TE-1 TC-32, TC-33.
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T181.spec.ts
// Logo và ảnh newsletter là block setting của footer trong layout, preview không đặt được: phần có ảnh cần người kiểm trong editor.
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { watchShopPay403 } from './support/console-guard';

const PAGES = ['/', '/collections/all', '/cart', '/search'];
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];
const DESCRIPTION =
  'Efitco provides premium fitness accessories dedicated to supporting your journey as you conquer every health and bodybuilding goal with confidence.';
const NEWSLETTER_TEXT =
  'Get expert training tips, early access to gear, and exclusive offers - plus up to 15% off for subscribers.';

const norm = (text: string | null) => (text ?? '').replace(/\s+/g, ' ').trim();

function luminance(rgb: number[]) {
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: number[], b: number[]) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const parseRgb = (value: string) => (value.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);

async function expectFooterParts(page: Page) {
  const footer = page.getByTestId('footer');
  await expect(footer.getByTestId('footer-logo')).toBeVisible();
  expect(norm(await footer.getByTestId('footer-description').textContent())).toBe(DESCRIPTION);
  expect(norm(await footer.getByTestId('footer-newsletter-heading').textContent())).toBe('Get 15% Off Your First Order');
  expect(norm(await footer.locator('.site-footer__newsletter-text').textContent())).toBe(NEWSLETTER_TEXT);
  const submit = footer.getByTestId('footer-newsletter-submit');
  expect(norm(await submit.textContent())).toBe('Get 15% Off');
  await expect(submit.locator('svg')).toHaveAttribute('aria-hidden', 'true');
  expect(norm(await footer.getByTestId('footer-newsletter-note').textContent())).toBe('No spam. Unsubscribe anytime.');
}

test.describe('ES1-T181 TE-17 hàng 16 footer', () => {
  for (const path of PAGES) {
    test(`AC-H28 đủ phần trên ${path}`, async ({ page }) => {
      await page.goto(path);
      await expectFooterParts(page);
    });
  }

  test('AC-H28 không có ảnh newsletter thì không có khung trống', async ({ page }) => {
    await page.goto('/');
    const footer = page.getByTestId('footer');
    const hasImage = (await footer.getByTestId('footer-newsletter-image').count()) > 0;
    await expect(footer.locator('.site-footer__newsletter-media')).toHaveCount(hasImage ? 1 : 0);
    if (hasImage) {
      await expect(footer.getByTestId('footer-newsletter-image').locator('img')).toHaveAttribute('loading', 'lazy');
    }
  });

  test('logo: không có ảnh thì là tên shop, có ảnh thì link có tên truy cập', async ({ page }) => {
    await page.goto('/');
    const logo = page.getByTestId('footer-logo');
    await expect(logo).toHaveAccessibleName(/\S/);
    await expect(logo).toHaveAttribute('href', /\/$/);
  });

  test('heading 2 màu khác nhau, cả 2 từ 4.5:1 trên nền footer', async ({ page }) => {
    await page.goto('/');
    const heading = page.getByTestId('footer-newsletter-heading');
    const span = heading.locator('span');
    await expect(span).toHaveText('Get 15% Off');
    const colors = await heading.evaluate((el) => ({
      main: getComputedStyle(el).color,
      part: getComputedStyle(el.querySelector('span') as Element).color,
      bg: getComputedStyle(el.closest('.site-footer') as Element).backgroundColor,
    }));
    expect(colors.part).not.toBe(colors.main);
    expect(contrast(parseRgb(colors.main), parseRgb(colors.bg))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(parseRgb(colors.part), parseRgb(colors.bg))).toBeGreaterThanOrEqual(4.5);
  });

  test('nút submit, ô nhập từ 44px và không tràn ngang', async ({ page }) => {
    await page.goto('/');
    for (const id of ['footer-newsletter-submit', 'footer-newsletter-email']) {
      const box = await page.getByTestId(id).boundingBox();
      expect(box?.height, id).toBeGreaterThanOrEqual(44);
      expect(box?.width, id).toBeGreaterThanOrEqual(44);
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('axe 0 serious trong footer, 0 console error', async ({ page }) => {
    const errors: string[] = [];
    const isShopPay403 = watchShopPay403(page);
    page.on('console', (msg) => {
      if (msg.type() !== 'error' || isShopPay403(msg)) return;
      if (IGNORE_CONSOLE.some((r) => r.test(msg.text()) || r.test(msg.location().url))) return;
      errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
    await page.goto('/');
    const { violations } = await new AxeBuilder({ page }).include('[data-testid="footer"]').analyze();
    const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious.map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
    expect(errors).toEqual([]);
  });
});
