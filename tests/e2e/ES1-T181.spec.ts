// KHÔNG CHẮC: spec chưa chạy (phiên viết không có preview, chưa type-check); scope-guard chặn dev-fe ghi tests/ → Orchestrator chép sang tests/e2e/ES1-T181.spec.ts.
// Ticket ES1-T181 TE-17-FE2: footer hàng 16 (1:1104), AC-H28. Form thành công, lỗi đã có ở TE-1 TC-32, TC-33.
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T181.spec.ts
// Logo và ảnh newsletter là block setting của footer trong layout, preview không đặt được: phần có ảnh cần người kiểm trong editor.
// ES1-T464: chữ footer lấy từ fixture ES1-T331 (tests/fixtures/home-figma.json, khối layout:theme footer), không hardcode.
// newsletter_heading là inline_richtext, default rỗng (ES1-T308 #1): phần trong <em> tô accent. Store chưa áp fixture thì skip (home-fixture.ts).
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { expectNotChallenged } from './support/store-guard';
import { watchShopPay403 } from './support/console-guard';
import { loadHomeFixture, skipUnlessFixture } from './support/home-fixture';

const PAGES = ['/', '/collections/all', '/cart', '/search'];
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];

const norm = (text: string | null) => (text ?? '').replace(/\s+/g, ' ').trim();
const stripTags = (html: string) => norm(html.replace(/<[^>]*>/g, ' '));

const footerFixture = loadHomeFixture().blocks.find((block) => block.scope === 'layout:theme' && block.type === 'footer');
if (!footerFixture) throw new Error('tests/fixtures/home-figma.json thiếu khối layout:theme footer (ES1-T331)');
const settings = footerFixture.settings as Record<string, string | null>;
const pending = (footerFixture.pending_settings ?? {}) as Record<string, string>;

const DESCRIPTION = stripTags(String(settings.description ?? ''));
const HEADING_HTML = String(settings.newsletter_heading ?? '');
const HEADING = stripTags(HEADING_HTML);
// Phần nhấn = chữ trong <em> của fixture; fixture chưa có <em> thì test màu skip có lý do.
const HEADING_EM = stripTags(HEADING_HTML.match(/<em>([\s\S]*?)<\/em>/i)?.[1] ?? '');
const NEWSLETTER_TEXT = stripTags(String(settings.newsletter_text ?? ''));
// newsletter_button_label còn ở pending_settings tới khi ES1-T304 merge; khi đó khoá chuyển sang settings.
const BUTTON_LABEL = norm(String(settings.newsletter_button_label ?? pending.newsletter_button_label ?? ''));
const NOTE = footerFixture.markers?.find((marker) => marker.testid === 'footer-newsletter-note')?.text ?? '';

// Sentinel fixture nằm ở /: mở / để quyết định skip, rồi mới sang trang cần đo.
async function openWithFixture(page: Page, path: string) {
  await page.goto('/');
  await skipUnlessFixture(page);
  if (path !== '/') await page.goto(path);
}

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
  expect(norm(await footer.getByTestId('footer-newsletter-heading').textContent())).toBe(HEADING);
  expect(norm(await footer.locator('.site-footer__newsletter-text').textContent())).toBe(NEWSLETTER_TEXT);
  const submit = footer.getByTestId('footer-newsletter-submit');
  expect(norm(await submit.textContent())).toBe(BUTTON_LABEL);
  await expect(submit.locator('svg')).toHaveAttribute('aria-hidden', 'true');
  expect(norm(await footer.getByTestId('footer-newsletter-note').textContent())).toBe(NOTE);
}

test.describe('ES1-T181 TE-17 hàng 16 footer', () => {
  for (const path of PAGES) {
    test(`AC-H28 đủ phần trên ${path}`, async ({ page }) => {
      await openWithFixture(page, path);
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

  // CTO 09/11 (tong_hop.docx #7, ES1-T250), CTO 14/11 (ES1-T437): phần <em> cam như Figma 1:1148, không nghiêng. Chữ lớn nên ngưỡng AA là 3:1.
  test('heading 2 màu khác nhau; chữ thường từ 4.5:1, phần <em> là chữ lớn từ 3:1 trên nền footer', async ({ page }) => {
    test.skip(!HEADING_EM, 'fixture ES1-T331 chưa có <em> trong newsletter_heading (patch ở drafts/dev-fe/ES1-T464/home-figma.patch.md)');
    await openWithFixture(page, '/');
    const heading = page.getByTestId('footer-newsletter-heading');
    const em = heading.locator('em');
    await expect(em).toHaveText(HEADING_EM);
    const colors = await heading.evaluate((el) => {
      const part = getComputedStyle(el.querySelector('em') as Element);
      return {
        main: getComputedStyle(el).color,
        part: part.color,
        style: part.fontStyle,
        bg: getComputedStyle(el.closest('.site-footer') as Element).backgroundColor,
        size: parseFloat(part.fontSize),
        weight: parseInt(part.fontWeight),
      };
    });
    expect(colors.style, '<em> không nghiêng').toBe('normal');
    // WCAG chữ lớn: từ 24px, hoặc từ 18.66px và đậm
    expect(colors.size >= 24 || (colors.size >= 18.66 && colors.weight >= 700), `cỡ ${colors.size}px`).toBe(true);
    expect(colors.part).not.toBe(colors.main);
    expect(contrast(parseRgb(colors.main), parseRgb(colors.bg))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(parseRgb(colors.part), parseRgb(colors.bg))).toBeGreaterThanOrEqual(3);
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
    await expectNotChallenged(page);
    const { violations } = await new AxeBuilder({ page }).include('[data-testid="footer"]').analyze();
    const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious.map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
    expect(errors).toEqual([]);
  });
});
