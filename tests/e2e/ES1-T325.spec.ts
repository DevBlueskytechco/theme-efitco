// KHÔNG CHẮC: nhóm storefront/không JS/cảm ứng chưa chạy trong phiên viết (không có PREVIEW_URL, STORE_PASSWORD; Chromium bị sandbox chặn) → kết quả lấy từ CI store-tests
// của PR, chưa báo đạt. Nhóm tĩnh 9/9 đạt (drafts/qa/ES1-T325/pw-static.config.mjs). AC-H28 ảnh/logo, nhãn "Get 15% off", testid lớp tối hero: hỏi ES1-T603.
// Ticket ES1-T325 TE-1-R2-QA1: header tối, drawer, announcement, footer, localization, tài khoản ở 360/768/1280/1920 + không JS.
// AC: docs/srs.md#TE-1 AC2 (drawer dưới 80rem), AC3, AC4, AC5, AC6, AC9, AC10, AC-H28, AC-H29. Test case: drafts/qa/ES1-T325/test-cases.md (TC-xx, TB-xx).
// Không lặp: ES1-T323/ES1-T324 (hành vi JS chi tiết trên fixture), ES1-T330 (từ 80rem, cấp 3), TE-1.spec.ts TC-18, TC-32, TC-33 (giỏ, newsletter gửi thật).
// Thay cho TE-1.spec.ts TC-13, TC-22, TC-23, TC-28–TC-30, TC-45, TC-46/TC-47 (SRS 0.4/0.5); TE-1 TC-42 bỏ theo AC-H29.
// Mốc đặt bằng setViewportSize ở project desktop; project mobile (cảm ứng) chỉ chạy TC-05.
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... [EXPECT_ANNOUNCEMENT=off|text|link] [FRESH_THEME_ID=<id>] npx playwright test tests/e2e/ES1-T325.spec.ts
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { test, expect, type Locator, type Page, type TestInfo } from './support/test';
import { expectNotChallenged } from './support/store-guard';
import { watchShopPay403 } from './support/console-guard';
import { autoDeclineConsent } from './support/consent';
import { env } from './support/store-data';
import { FOOTER_PENDING, footerSettingsApplied, skipUnlessFixture } from './support/home-fixture';

const ROOT = process.cwd();
const read = (...p: string[]) => readFileSync(join(ROOT, ...p), 'utf8');
const LOCALE = JSON.parse(read('locales', 'en.default.json')) as {
  blocks: { footer: Record<string, string>; header: Record<string, unknown>; announcement_bar: Record<string, string> };
};

const WIDTHS = [360, 768, 1280, 1920] as const;
const BELOW_80 = [360, 768] as const;
const FROM_48 = [768, 1280, 1920] as const;
const heightOf = (width: number) => (width === 1920 ? 1080 : 900);

const T = {
  bar: 'announcement-bar',
  barLink: 'announcement-bar-link',
  barPlaceholder: 'announcement-bar-placeholder',
  sentinel: 'header-sticky-sentinel',
  header: 'header',
  account: 'header-account',
  cart: 'header-cart-link',
  search: 'header-search-link',
  drawerToggle: 'header-drawer-toggle',
  drawer: 'header-drawer',
  drawerClose: 'header-drawer-close',
  drawerAcc: 'header-drawer-accordion-toggle',
  drawerSub: 'header-drawer-submenu',
  level: 'header-drawer-level',
  back: 'header-drawer-back',
  drawerAccount: 'header-drawer-account',
  drawerLocale: 'header-drawer-localization',
  drawerLanguageOpt: 'header-drawer-language-option',
  nav: 'header-menu',
  slideshow: 'slideshow',
  footer: 'footer',
  nlForm: 'footer-newsletter-form',
  nlEmail: 'footer-newsletter-email',
  nlSubmit: 'footer-newsletter-submit',
  nlSuccess: 'footer-newsletter-success',
  nlHeading: 'footer-newsletter-heading',
  nlText: 'footer-newsletter-text',
  nlNote: 'footer-newsletter-note',
  nlImage: 'footer-newsletter-image',
  logo: 'footer-logo',
  description: 'footer-description',
  trust: 'footer-trust-item',
  menuLink: 'footer-menu-link',
  social: 'footer-social-link',
  payment: 'footer-payment-icon',
  locToggle: 'footer-localization-toggle',
  locPanel: 'footer-localization-panel',
  country: 'footer-country-selector',
  countryOpt: 'footer-country-option',
  countrySearch: 'footer-country-search',
  language: 'footer-language-selector',
  languageOpt: 'footer-language-option',
  locError: 'footer-localization-error',
} as const;

// Script nền tảng Shopify, không phải lỗi theme (ES1-T121 AC4).
const IGNORE_CONSOLE = /shopifycloud|monorail|web-pixels|trekkie|shop\.app|shopifysvc\.com|otlp-http|cdn\.shopify\.com\/s\/(trekkie|javascripts)|status of 429/i;
const ANNOUNCEMENT = (process.env.EXPECT_ANNOUNCEMENT ?? 'off') as 'off' | 'text' | 'link';
const COUNTRY_TARGET = env('TE1_COUNTRY_TARGET');
const LANGUAGE_TARGET = env('TE1_LANGUAGE_TARGET');
const PRODUCT_HANDLE = env('TE1_PRODUCT_HANDLE');
const FRESH_THEME_ID = process.env.FRESH_THEME_ID;

// ---------- helper ----------
const desktopOnly = (ti: TestInfo) => test.skip(ti.project.name !== 'desktop', 'mốc đặt bằng setViewportSize, chạy ở project desktop');

async function open(page: Page, width: number, path = '/') {
  await page.setViewportSize({ width, height: heightOf(width) });
  await page.goto(path);
  await expectNotChallenged(page);
}

function watchConsole(page: Page): string[] {
  const errors: string[] = [];
  const isShopPay403 = watchShopPay403(page);
  page.on('console', (msg) => {
    if (msg.type() !== 'error' || isShopPay403(msg)) return;
    if (IGNORE_CONSOLE.test(msg.text()) || IGNORE_CONSOLE.test(msg.location().url)) return;
    errors.push(`${msg.text()} @ ${msg.location().url}`);
  });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  return errors;
}

// Màu computed của một biến CSS (đọc qua phần tử tạm).
async function varColor(page: Page, name: string): Promise<string> {
  return page.evaluate((v) => {
    const probe = document.createElement('div');
    probe.style.color = `var(${v})`;
    document.body.append(probe);
    const value = getComputedStyle(probe).color;
    probe.remove();
    return value;
  }, name);
}

type Band = { bg: string; color: string; noise: string; top: number; bottom: number; height: number; width: number; shadow: string; position: string };
const band = (el: Locator): Promise<Band> =>
  el.evaluate((n) => {
    const s = getComputedStyle(n);
    const r = n.getBoundingClientRect();
    return { bg: s.backgroundColor, color: s.color, noise: s.borderImageSource, top: r.top, bottom: r.bottom, height: r.height, width: r.width, shadow: s.boxShadow, position: s.position };
  });

async function scrollTo(page: Page, top: number) {
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), top);
}

const isModal = (el: Locator) => el.evaluate((d) => d.matches(':modal'));
const modalCount = (page: Page) => page.evaluate(() => document.querySelectorAll('dialog:modal').length);
const layerOpen = (page: Page) => page.evaluate(() => document.documentElement.hasAttribute('data-layer-open'));

// Drawer có JS: focus nút menu (nạp lười header-drawer.js), chờ nắm drawer, rồi bấm mở.
async function openDrawer(page: Page) {
  const toggle = page.getByTestId(T.drawerToggle);
  test.skip((await toggle.count()) === 0, 'main-menu store dev rỗng');
  await toggle.focus();
  await expect(page.getByTestId(T.header), 'header-drawer.js chưa nắm drawer').toHaveAttribute('data-drawer-enhanced', '', { timeout: 15_000 });
  await toggle.click();
  const drawer = page.getByTestId(T.drawer);
  await expect.poll(() => isModal(drawer), { message: 'drawer không mở modal' }).toBe(true);
  return { toggle, drawer };
}

function firstLevel(page: Page) {
  const acc = page.getByTestId(T.drawer).getByTestId(T.drawerAcc).first();
  const level = acc.locator('xpath=..').getByTestId(T.level);
  return { acc, level, back: level.getByTestId(T.back) };
}

// Localization footer: focus nút gộp (lazy-module nạp picker khi tương tác), chờ define, bấm mở.
const footerToggle = (page: Page) => page.getByTestId(T.footer).getByTestId(T.locToggle);
const footerPanel = (page: Page) => page.getByTestId(T.footer).getByTestId(T.locPanel);

async function requireLocalization(page: Page) {
  test.skip((await footerToggle(page).count()) === 0, 'store dev bán 1 nước + 1 ngôn ngữ');
}

async function openFooterLocalization(page: Page, { js = true } = {}) {
  await requireLocalization(page);
  const toggle = footerToggle(page);
  await toggle.scrollIntoViewIfNeeded();
  if (js) {
    await toggle.focus();
    await page.waitForFunction(() => !!customElements.get('localization-picker'), null, { timeout: 15_000 });
  }
  await toggle.click();
  await expect(footerPanel(page)).toBeVisible();
  return { toggle, panel: footerPanel(page) };
}

async function showTab(scope: Locator, name: RegExp) {
  const tab = scope.getByRole('tab', { name });
  if ((await tab.count()) && (await tab.first().isVisible())) await tab.first().click();
}

// Màu "rgb(r, g, b)", "rgba(...)" hoặc "color(srgb r g b / a)" → alpha.
function alphaOf(c: string): number {
  const slash = c.match(/\/\s*([\d.]+)(%?)\s*\)$/);
  if (slash) return slash[2] ? parseFloat(slash[1]) / 100 : parseFloat(slash[1]);
  const rgba = c.match(/^rgba\([^)]*,\s*([\d.]+)\)$/);
  if (rgba) return parseFloat(rgba[1]);
  return c === 'transparent' ? 0 : 1;
}

function rgbOf(c: string): [number, number, number] {
  const n = (c.match(/[\d.]+/g) ?? []).map(Number);
  return c.startsWith('color(') ? [n[0] * 255, n[1] * 255, n[2] * 255] : [n[0], n[1], n[2]];
}

function contrast(a: string, b: string): number {
  const lum = (c: string) => {
    const [r, g, bl] = rgbOf(c).map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const seriousOrCritical = (v: { impact?: string | null }) => ['serious', 'critical'].includes(v.impact ?? '');
async function axeOn(page: Page, testids: string[]) {
  await expectNotChallenged(page);
  const builder = new AxeBuilder({ page });
  for (const id of testids) if (await page.getByTestId(id).count()) builder.include(`[data-testid="${id}"]`);
  return (await builder.analyze()).violations.filter(seriousOrCritical).map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
}

// AC4: store dev để trống bar (mockup trang chủ không có bar). Trạng thái có text dựng bằng markup đúng hợp đồng blocks/announcement-bar.liquid,
// chèn vào container của bar (ngay trước header-sticky-sentinel, layout/theme.liquid), dùng CSS thật của theme. Store có bar thật thì đo bar thật.
const BAR_TEXT = 'Free shipping on orders over $75';
async function ensureBar(page: Page, withLink: boolean): Promise<'store' | 'fixture'> {
  const real = page.getByTestId(T.bar);
  if ((await real.count()) > 0 && ((withLink && ANNOUNCEMENT === 'link') || (!withLink && ANNOUNCEMENT === 'text'))) return 'store';
  await real.evaluateAll((els) => els.forEach((e) => e.remove()));
  await page.getByTestId(T.sentinel).evaluate((sentinel, { withLink, text, label }) => {
    let host = sentinel.previousElementSibling as HTMLElement | null;
    if (!host || host.getAttribute('data-testid') === 'skip-link') {
      host = document.createElement('div');
      host.className = 'block-container';
      sentinel.before(host);
    }
    const arrow = '<svg class="slideshow-icon" aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 16 16"><path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" fill="none"/></svg>';
    const inner = withLink ? `<a class="announcement-bar__link" href="/collections/all" data-testid="announcement-bar-link">${text}${arrow}</a>` : text;
    host.innerHTML = `<aside class="announcement-bar full-width" aria-label="${label}" data-testid="announcement-bar"><p class="announcement-bar__text">${inner}</p></aside>`;
  }, { withLink, text: BAR_TEXT, label: LOCALE.blocks.announcement_bar.label });
  test.info().annotations.push({ type: 'kiem-fixture', description: 'AC4 có text: chèn markup theo hợp đồng blocks/announcement-bar.liquid (store dev để trống bar)' });
  return 'fixture';
}

// Banner consent Shopify che footer/localization (ES1-T434): chỉ gắn ở nhóm có trình duyệt, nhóm tĩnh không mở page.
const declineConsent = async ({ page }: { page: Page }) => {
  await autoDeclineConsent(page);
};

// =====================================================================
test.describe('ES1-T325 tĩnh', () => {
  test.beforeEach(({}, ti) => test.skip(ti.project.name !== 'desktop', 'tĩnh, chạy 1 lần'));

  test('TC-07 AC3 không có templates/customers/ và template customers/*', () => {
    expect(existsSync(join(ROOT, 'templates', 'customers')), 'templates/customers/ phải không tồn tại').toBe(false);
    expect(readdirSync(join(ROOT, 'templates')).filter((f) => /^customers/.test(f))).toEqual([]);
  });

  test('TC-12 AC4 schema announcement chỉ text + link, text không default, không setting màu; markup không có button', () => {
    const src = read('blocks', 'announcement-bar.liquid');
    const schema = JSON.parse(src.match(/{%-?\s*schema\s*-?%}([\s\S]*?){%-?\s*endschema\s*-?%}/)![1]) as { settings: Array<{ id: string; type: string; default?: unknown }> };
    expect(schema.settings.map((s) => s.id)).toEqual(['text', 'link']);
    expect(schema.settings.some((s) => /color/.test(s.type))).toBe(false);
    expect(schema.settings.find((s) => s.id === 'text')?.default).toBeUndefined();
    const markup = src.replace(/{%-?\s*schema[\s\S]*$/, '').replace(/{%-?\s*doc\s*-?%}[\s\S]*?{%-?\s*enddoc\s*-?%}/, '');
    expect(markup, 'bar không có nút (không nút đóng, không xoay)').not.toMatch(/<button/);
    // Hợp đồng markup mà ensureBar() dựng lại
    for (const hook of ['class="announcement-bar full-width"', 'class="announcement-bar__text"', 'class="announcement-bar__link"', 'data-testid="announcement-bar-link"']) {
      expect(markup, `hợp đồng ${hook}`).toContain(hook);
    }
  });

  test('TC-14 AC4 trang password, gift card không có announcement bar', () => {
    expect(read('layout', 'password.liquid')).not.toMatch(/announcement-bar/);
    const gift = read('templates', 'gift_card.liquid');
    expect(gift).toMatch(/^\s*{%-?\s*layout none\s*-?%}/);
    expect(gift).not.toMatch(/announcement-bar/);
    const layout = read('layout', 'theme.liquid');
    expect(layout.indexOf("block 'announcement-bar'"), 'bar trước header').toBeLessThan(layout.indexOf("block 'header'"));
  });

  test('TC-16 AC5 control localization chỉ khi > 1 nước hoặc > 1 ngôn ngữ (footer, drawer)', () => {
    for (const file of ['footer.liquid', 'header.liquid']) {
      // Bỏ {% doc %} và {% comment %}: doc nhắc tên <localization-picker> trước phần markup.
      const src = read('blocks', file)
        .replace(/{%-?\s*doc\s*-?%}[\s\S]*?{%-?\s*enddoc\s*-?%}/g, '')
        .replace(/{%-?\s*comment\s*-?%}[\s\S]*?{%-?\s*endcomment\s*-?%}/g, '');
      expect(src, `${file} điều kiện nước`).toMatch(/localization\.available_countries\.size\s*>\s*1/);
      expect(src, `${file} điều kiện ngôn ngữ`).toMatch(/localization\.available_languages\.size\s*>\s*1/);
      const gate = src.search(/if show_countries or show_languages/);
      expect(gate, `${file} phải bọc control bằng show_countries or show_languages`).toBeGreaterThan(-1);
      expect(src.indexOf('<localization-picker'), `${file}: picker nằm trong điều kiện`).toBeGreaterThan(gate);
    }
  });

  test('TC-19 AC6 schema footer: menu default footer, payment icons từ shop.enabled_payment_types', () => {
    const src = read('blocks', 'footer.liquid');
    const schema = JSON.parse(src.match(/{%-?\s*schema\s*-?%}([\s\S]*?){%-?\s*endschema\s*-?%}/)![1]) as { settings: Array<{ id?: string; default?: unknown }> };
    expect(schema.settings.find((s) => s.id === 'menu')?.default).toBe('footer');
    expect(schema.settings.find((s) => s.id === 'show_payment_icons')?.default).toBe(true);
    expect(src).toMatch(/for type in shop\.enabled_payment_types/);
    expect(src).toMatch(/payment_type_svg_tag/);
    expect(src, 'form newsletter là customer form').toMatch(/form 'customer'/);
  });

  test('TC-22 AC9 schema overlay_opacity của slide mặc định 30', () => {
    const src = read('blocks', 'slideshow-slide.liquid');
    const schema = JSON.parse(src.match(/{%-?\s*schema\s*-?%}([\s\S]*?){%-?\s*endschema\s*-?%}/)![1]) as { settings: Array<{ id?: string; default?: unknown }> };
    expect(schema.settings.find((s) => s.id === 'overlay_opacity')?.default).toBe(30);
  });

  test('TC-26 AC10 tab chỉ khi cả 2 danh sách > 1 mục; ô tìm chỉ khi > 10 nước; hàng nước không cờ', () => {
    const src = read('snippets', 'localization-lists.liquid');
    expect(src).toMatch(/if show_countries and show_languages\s*\n\s*assign has_tabs = true/);
    expect(src).toMatch(/if show_countries and localization\.available_countries\.size > 10\s*\n\s*assign has_search = true/);
    const country = src.slice(src.indexOf('for country in localization.available_countries'), src.indexOf('endfor'));
    expect(country, 'hàng nước không có cờ').not.toMatch(/image_url|image_tag|<img/);
    expect(src, 'không nút Apply: mỗi mục là submit').toMatch(/type="submit"\s*\n\s*name="country_code"/);
  });

  test('TC-34 AC-H28 không viết cứng "Get 15% off"; nhãn nút đọc setting rồi tới locale', () => {
    const files = ['blocks/footer.liquid', ...readdirSync(join(ROOT, 'locales')).map((f) => `locales/${f}`)];
    for (const f of files) expect(read(f), f).not.toMatch(/15%\s*off/i);
    const src = read('blocks', 'footer.liquid');
    const schema = JSON.parse(src.match(/{%-?\s*schema\s*-?%}([\s\S]*?){%-?\s*endschema\s*-?%}/)![1]) as { settings: Array<{ id?: string; default?: unknown }> };
    const label = schema.settings.find((s) => s.id === 'newsletter_button_label');
    expect(label, 'thiếu setting newsletter_button_label').toBeTruthy();
    expect(label?.default).toBeUndefined();
    expect(src).toMatch(/assign newsletter_button_label = block\.settings\.newsletter_button_label/);
    expect(src).toMatch(/if newsletter_button_label == blank\s*\n\s*assign newsletter_button_label = 'blocks\.footer\.newsletter_submit' \| t/);
  });

  test('TB-08 menu rỗng: header không drawer/nav, footer không nav; placeholder chỉ trong design_mode', () => {
    const header = read('blocks', 'header.liquid');
    expect(header).toMatch(/if menu\.links\.size > 0\s*\n\s*assign has_menu = true/);
    expect(header.indexOf('{% if has_menu %}')).toBeLessThan(header.indexOf('data-testid="header-drawer-toggle"'));
    expect(header).toMatch(/elsif request\.design_mode %}\s*\n\s*<p class="site-header__placeholder">/);
    const footer = read('blocks', 'footer.liquid');
    expect(footer.indexOf('if menu_links.size > 0')).toBeLessThan(footer.indexOf('<nav class="site-footer__nav"'));
  });
});

// =====================================================================
test.describe('ES1-T325 storefront', () => {
  test.beforeEach(({}, ti) => desktopOnly(ti));
  test.beforeEach(declineConsent);

  // ---------- AC2: drawer dưới 80rem ----------
  for (const width of BELOW_80) {
    test(`TC-01 AC2 ${width}: chạm nút menu → drawer cấp 1, focus tiêu đề "Menu", Tab tới nút đóng, html[data-layer-open]`, async ({ page }) => {
      await open(page, width);
      await expect(page.getByTestId(T.nav), 'nav desktop ẩn dưới 80rem').toBeHidden();
      const { toggle, drawer } = await openDrawer(page);
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      expect(await layerOpen(page), 'html[data-layer-open] khi drawer mở').toBe(true);
      const titleId = await drawer.getAttribute('aria-labelledby');
      expect(titleId, 'drawer thiếu aria-labelledby').toBeTruthy();
      const title = drawer.locator(`[id="${titleId}"]`);
      await expect(title).toHaveText(String(LOCALE.blocks.header.menu_title));
      await expect(title, 'focus vào tiêu đề, không phải nút đóng').toBeFocused();
      await page.keyboard.press('Tab');
      await expect(drawer.getByTestId(T.drawerClose), 'Tab lần 1 tới nút đóng').toBeFocused();
      await expect(drawer.getByTestId(T.level).first(), 'mở ở cấp 1').toBeHidden();
    });

    test(`TC-02 AC2 ${width}: mục cấp 2 → panel trong cùng drawer, Back "Back to menu" ≥ 44 có focus; Back về cấp 1, focus về mục`, async ({ page }) => {
      await open(page, width);
      const { drawer } = await openDrawer(page);
      test.skip((await drawer.getByTestId(T.drawerAcc).count()) === 0, 'main-menu store dev chưa có mục cấp 2');
      const { acc, level, back } = firstLevel(page);
      await acc.click();
      await expect(level).toBeVisible();
      await expect(back).toBeFocused();
      await expect(back).toHaveAccessibleName(String(LOCALE.blocks.header.back_label));
      expect((await back.boundingBox())!.height, 'Back cao ≥ 44').toBeGreaterThanOrEqual(43.5);
      await expect(level.getByRole('button', { name: String(LOCALE.blocks.header.close_menu) }), 'nút đóng trong đầu cấp 2').toBeVisible();
      const [d, l] = [(await drawer.boundingBox())!, (await level.boundingBox())!];
      expect(l.width, 'cấp 2 phủ bề ngang drawer').toBeGreaterThanOrEqual(d.width - 2);
      expect(l.x, 'cấp 2 nằm trong drawer').toBeGreaterThanOrEqual(d.x - 1);
      expect(await modalCount(page), 'không mở lớp thứ hai').toBe(1);
      await back.click();
      await expect(level).toBeHidden();
      await expect(acc).toBeFocused();
    });

    test(`TC-03 AC2 ${width}: đóng bằng nút đóng, Esc, scrim → focus về nút menu`, async ({ page }) => {
      await open(page, width);
      const { toggle, drawer } = await openDrawer(page);
      const closed = async (how: string) => {
        await expect.poll(() => isModal(drawer), { message: `${how}: drawer vẫn mở` }).toBe(false);
        await expect(toggle, `${how}: focus về nút menu`).toBeFocused();
        await expect(toggle).toHaveAttribute('aria-expanded', 'false');
        expect(await layerOpen(page), `${how}: html còn data-layer-open`).toBe(false);
      };
      await drawer.getByTestId(T.drawerClose).click();
      await closed('nút đóng');
      await toggle.click();
      await expect.poll(() => isModal(drawer)).toBe(true);
      await page.keyboard.press('Escape');
      await closed('Esc');
      await toggle.click();
      await expect.poll(() => isModal(drawer)).toBe(true);
      const box = (await drawer.boundingBox())!;
      const x = Math.min(width - 6, box.x + box.width + 12);
      expect(x, 'không có vùng scrim ngoài drawer').toBeGreaterThan(box.x + box.width);
      await page.mouse.click(x, heightOf(width) / 2);
      await closed('scrim');
    });
  }

  // ---------- AC3 ----------
  for (const width of WIDTHS) {
    test(`TC-06 AC3 ${width}: <shopify-account>, cart link có số lượng, search link`, async ({ page }) => {
      await open(page, width);
      const header = page.getByTestId(T.header);
      const account = header.getByTestId(T.account);
      test.skip((await account.count()) === 0, 'store dev tắt customer accounts');
      await expect(account).toHaveCount(1);
      expect(await account.evaluate((el) => el.tagName.toLowerCase())).toBe('shopify-account');
      await expect(account).toBeVisible();
      const cart = header.getByTestId(T.cart);
      await expect(cart).toBeVisible();
      expect(new URL((await cart.getAttribute('href'))!, page.url()).pathname).toMatch(/\/cart$/);
      await expect(cart, 'tên cart có số món').toHaveAccessibleName(/^Cart, \d+ items?$/);
      const search = header.getByTestId(T.search);
      await expect(search).toBeVisible();
      expect(new URL((await search.getAttribute('href'))!, page.url()).pathname).toMatch(/\/search$/);
      await expect(search).toHaveAccessibleName(String(LOCALE.blocks.header.search));
      if (width < 1280) {
        const { drawer } = await openDrawer(page);
        const link = drawer.getByTestId(T.drawerAccount);
        await expect(link).toBeVisible();
        expect(new URL((await link.getAttribute('href'))!, page.url()).pathname).toMatch(/\/account(\/login)?$/);
      }
    });
  }

  test('TC-08 AC3 /account/login chuyển sang customer accounts do Shopify host', async ({ page }) => {
    await open(page, 1280);
    const res = await page.request.get('/account/login', { maxRedirects: 0 });
    expect(res.status(), `/account/login trả ${res.status()}`).toBeGreaterThanOrEqual(300);
    expect(res.status()).toBeLessThan(400);
    const location = res.headers()['location'] ?? '';
    expect(location, `Location: ${location}`).toMatch(/shopify\.com\/\d+\/account|customer_authentication|\.account\.myshopify\.com|\/authentication\//);
  });

  // ---------- AC4 ----------
  for (const width of WIDTHS) {
    test(`TC-09 AC4 ${width}: text rỗng → không có announcement bar, không placeholder`, async ({ page }) => {
      test.skip(ANNOUNCEMENT !== 'off', 'store đang bật announcement (EXPECT_ANNOUNCEMENT)');
      await open(page, width);
      await expect(page.getByTestId(T.bar)).toHaveCount(0);
      await expect(page.getByTestId(T.barPlaceholder), 'placeholder chỉ trong editor').toHaveCount(0);
    });

    test(`TC-10 TC-11 TC-12 AC4 ${width}: có text → bar trên header, nền tối + noise liền header, ≥ 44; link cả câu ≥ 44; không link chữ thường; không nút`, async ({ page }) => {
      await open(page, width);
      const dark = await varColor(page, '--color-background-dark');
      for (const withLink of [true, false]) {
        await scrollTo(page, 0);
        await ensureBar(page, withLink);
        const bar = page.getByTestId(T.bar);
        await expect(bar).toHaveCount(1);
        await expect(bar).toBeVisible();
        const [b, h] = [await band(bar), await band(page.getByTestId(T.header))];
        expect(b.bottom, 'bar nằm trên header').toBeLessThanOrEqual(h.top + 1);
        expect(h.top - b.bottom, 'bar liền header').toBeLessThanOrEqual(1);
        expect(b.height, 'bar cao ≥ 44').toBeGreaterThanOrEqual(43.5);
        expect(b.bg, 'nền --color-background-dark').toBe(dark);
        expect(b.noise, 'noise như header').toContain('noise-dark');
        expect(b.noise).toBe(h.noise);
        await expect(bar.getByRole('button'), 'không nút đóng').toHaveCount(0);
        await expect(bar.locator('p'), '1 câu, không xoay').toHaveCount(1);
        if (withLink) {
          const link = bar.getByTestId(T.barLink);
          await expect(link).toHaveCount(1);
          expect((await link.innerText()).trim(), 'cả câu là link').toBe((await bar.innerText()).trim());
          expect((await link.boundingBox())!.height, 'vùng chạm link 44').toBeGreaterThanOrEqual(43.5);
        } else {
          await expect(bar.locator('a'), 'không link thì chữ thường').toHaveCount(0);
        }
      }
    });

    test(`TC-13 AC4 ${width}: cuộn qua bar → bar cuộn đi, chỉ header 80 dính đỉnh`, async ({ page }) => {
      await open(page, width);
      const header = page.getByTestId(T.header);
      test.skip((await header.getAttribute('data-sticky')) === null, 'sticky_header đang tắt');
      await ensureBar(page, true);
      const bar = page.getByTestId(T.bar);
      const start = await band(bar);
      expect(['sticky', 'fixed']).not.toContain(start.position);
      await scrollTo(page, Math.ceil(start.height) + 120);
      await expect.poll(async () => (await band(bar)).bottom, { message: 'bar phải cuộn đi' }).toBeLessThanOrEqual(0);
      await expect.poll(async () => Math.round((await band(header)).top), { message: 'header dính đỉnh' }).toBe(0);
      expect(Math.abs((await band(header)).height - 80), 'header 80').toBeLessThanOrEqual(1);
    });
  }

  // ---------- AC5, AC9 (control gộp) ----------
  for (const width of WIDTHS) {
    test(`TC-15 TC-23 AC5 AC9 ${width}: đúng 1 control gộp (cờ + "USD / EN") ở footer và drawer, không 2 nút Currency/Language`, async ({ page }) => {
      await open(page, width);
      await requireLocalization(page);
      const footer = page.getByTestId(T.footer);
      await expect(footer.locator('form[action*="localization"]')).toHaveCount(1);
      const toggle = footerToggle(page);
      await expect(toggle).toHaveCount(1);
      await toggle.scrollIntoViewIfNeeded();
      await expect(toggle).toBeVisible();
      await expect(toggle.locator('img'), 'cờ nước hiện tại').toHaveCount(1);
      await expect(toggle).toContainText(/\b[A-Z]{3} \/ [A-Z]{2}\b/);
      await expect(toggle).toHaveAccessibleName(/\S/);
      await expect(footer.getByRole('button', { name: /^(currency|language)$/i }), 'không 2 nút tách').toHaveCount(0);
      if (width < 1280) {
        await scrollTo(page, 0);
        const { drawer } = await openDrawer(page);
        const row = drawer.getByTestId(T.drawerLocale);
        await expect(row).toHaveCount(1);
        await expect(row.locator('summary')).toBeVisible();
        await expect(row.locator('summary')).toContainText(/\b[A-Z]{3} \/ [A-Z]{2}\b/);
        await expect(drawer.getByRole('button', { name: /^(currency|language)$/i })).toHaveCount(0);
      }
    });
  }

  // ---------- AC6 ----------
  for (const width of WIDTHS) {
    test(`TC-17 AC6 ${width}: newsletter customer form, menu footer, social, payment icons đủ màu; không tràn ngang`, async ({ page }) => {
      await open(page, width);
      const footer = page.getByTestId(T.footer);
      await footer.scrollIntoViewIfNeeded();
      await expect(footer).toBeVisible();
      const form = footer.getByTestId(T.nlForm);
      expect(await form.getAttribute('action')).toMatch(/\/contact\b/);
      expect((await form.getAttribute('method'))?.toLowerCase()).toBe('post');
      await expect(form.locator('input[name="form_type"]')).toHaveValue('customer');
      await expect(form.locator('input[name="contact[tags]"]')).toHaveValue(/newsletter/);
      const email = form.getByTestId(T.nlEmail);
      await expect(email).toHaveAttribute('type', 'email');
      await expect(email).toHaveAccessibleName(/\S/);
      await expect(form.getByTestId(T.nlSubmit)).toBeVisible();
      const links = footer.getByTestId(T.menuLink);
      if ((await links.count()) === 0) test.info().annotations.push({ type: 'du-lieu', description: 'menu footer store dev rỗng' });
      for (const l of await links.all()) expect(await l.getAttribute('href')).toBeTruthy();
      for (const s of await footer.getByTestId(T.social).all()) {
        expect(await s.getAttribute('href')).toMatch(/^https?:\/\//);
        await expect(s).toHaveAccessibleName(/\S/);
      }
      const icons = footer.getByTestId(T.payment);
      if ((await icons.count()) > 0) {
        await expect(footer.getByRole('list', { name: String(LOCALE.blocks.footer.payment_label) })).toBeVisible();
        for (const icon of await icons.all()) {
          const look = await icon.evaluate((li) => {
            const svg = li.querySelector('svg');
            const fills = new Set([...(svg?.querySelectorAll('[fill]') ?? [])].map((n) => n.getAttribute('fill')?.toLowerCase()));
            return { svg: !!svg, fills: fills.size, filter: [li, svg].map((n) => (n ? getComputedStyle(n).filter : 'none')), opacity: svg ? getComputedStyle(svg).opacity : '1' };
          });
          expect(look.svg, 'icon là svg payment_type_svg_tag').toBe(true);
          expect(look.fills, 'icon đủ màu, không đơn sắc').toBeGreaterThan(1);
          expect(look.filter, 'không grayscale/filter').toEqual(['none', 'none']);
          expect(look.opacity).toBe('1');
        }
      } else {
        test.info().annotations.push({ type: 'du-lieu', description: 'store dev chưa bật payment type' });
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth), 'không tràn ngang').toBeLessThanOrEqual(width);
    });
  }

  for (const width of [360, 1280]) {
    test(`TC-18 AC6 ${width}: sau khi gửi thành công → form-message--success role=status`, async ({ page }) => {
      await open(page, width, '/?customer_posted=true');
      const ok = page.getByTestId(T.footer).getByTestId(T.nlSuccess);
      test.skip((await ok.count()) === 0, 'KHÔNG CHẮC: posted_successfully? không đọc ?customer_posted=true; gửi thật ở TE-1 TC-32');
      await ok.scrollIntoViewIfNeeded();
      await expect(ok).toBeVisible();
      await expect(ok).toHaveAttribute('role', 'status');
      await expect(ok).toHaveClass(/form-message--success/);
      await expect(ok).toContainText(String(LOCALE.blocks.footer.newsletter_success));
    });
  }

  // ---------- AC9 ----------
  for (const width of WIDTHS) {
    test(`TC-20 AC9 ${width}: header tối 80, noise, chữ sáng, không đè nội dung (mọi trang)`, async ({ page }) => {
      const pages = width === 360 || width === 1280
        ? ['/', '/collections/all', ...(PRODUCT_HANDLE ? [`/products/${PRODUCT_HANDLE}`] : []), '/cart', '/search?q=a', '/pages/es1-t325-khong-ton-tai']
        : ['/'];
      for (const path of pages) {
        await open(page, width, path);
        const [dark, fg] = [await varColor(page, '--color-background-dark'), await varColor(page, '--color-background-dark-foreground')];
        const h = await band(page.getByTestId(T.header));
        expect(Math.abs(h.height - 80), `${path}: header cao 80`).toBeLessThanOrEqual(1);
        expect(h.bg, `${path}: nền tối`).toBe(dark);
        expect(h.color, `${path}: chữ sáng`).toBe(fg);
        expect(h.noise, `${path}: noise`).toContain('noise-dark');
        const mainTop = await page.getByRole('main').evaluate((m) => m.getBoundingClientRect().top);
        expect(mainTop, `${path}: main bắt đầu dưới đáy header`).toBeGreaterThanOrEqual(h.bottom - 0.5);
      }
    });

    test(`TC-21 AC9 ${width}: sticky → dính đỉnh, nền giữ, có bóng, cao 80, CLS header 0`, async ({ page }) => {
      await open(page, width);
      const header = page.getByTestId(T.header);
      test.skip((await header.getAttribute('data-sticky')) === null, 'sticky_header đang tắt');
      const before = await band(header);
      await header.evaluate((el) => {
        const w = window as unknown as { __headerShift: number };
        w.__headerShift = 0;
        const box = el.parentElement ?? el;
        new PerformanceObserver((list) => {
          for (const e of list.getEntries() as unknown as Array<{ value: number; hadRecentInput: boolean; sources?: Array<{ node?: Node | null }> }>) {
            if (e.hadRecentInput) continue;
            if ((e.sources ?? []).some((s) => s.node && (box.contains(s.node) || s.node.contains(box)))) w.__headerShift += e.value;
          }
        }).observe({ type: 'layout-shift', buffered: false });
      });
      await scrollTo(page, 200);
      await expect(header).toHaveAttribute('data-scrolled', '');
      await expect.poll(async () => Math.round((await band(header)).top), { message: 'header dính đỉnh' }).toBe(0);
      await expect.poll(async () => (await band(header)).shadow, { message: 'có bóng khi dính' }).not.toBe('none');
      const after = await band(header);
      expect(after.bg, 'nền không đổi khi cuộn').toBe(before.bg);
      expect(after.noise).toBe(before.noise);
      expect(Math.abs(after.height - before.height), 'chiều cao không đổi').toBeLessThanOrEqual(0.5);
      expect(await page.evaluate(() => (window as unknown as { __headerShift: number }).__headerShift), 'CLS do header').toBe(0);
    });

    test(`TC-22 AC9 ${width}: lớp tối hero theo overlay_opacity chỉ dưới 80rem`, async ({ page }) => {
      await open(page, width);
      const slideshow = page.getByTestId(T.slideshow).first();
      test.skip((await slideshow.count()) === 0, 'trang chủ store dev không có slideshow');
      // KHÔNG CHẮC: lớp tối chưa có data-testid (blocks/slideshow-slide.liquid .slideshow__overlay), đọc trong evaluate.
      const overlay = await slideshow.evaluate((root) => {
        const slide = root.querySelector<HTMLElement>('[style*="--overlay-opacity"]');
        const layer = slide?.querySelector<HTMLElement>('.slideshow__overlay');
        if (!slide || !layer) return null;
        const s = getComputedStyle(layer);
        return { setting: slide.style.getPropertyValue('--overlay-opacity').trim(), display: s.display, bg: s.backgroundColor };
      });
      expect(overlay, 'slide thiếu --overlay-opacity hoặc lớp tối').not.toBeNull();
      if (overlay!.setting !== '30%') test.info().annotations.push({ type: 'du-lieu', description: `store dev đặt overlay_opacity ${overlay!.setting}` });
      if (width < 1280) {
        expect(overlay!.display).not.toBe('none');
        expect(alphaOf(overlay!.bg), `alpha lớp tối = ${overlay!.setting}`).toBeCloseTo(parseFloat(overlay!.setting) / 100, 1);
      } else {
        expect(overlay!.display, 'từ 1280 không lớp tối').toBe('none');
      }
    });
  }

  // ---------- AC10 ----------
  for (const width of FROM_48) {
    test(`TC-24 AC10 ${width}: từ 48rem popover 2 cột, không tab; Esc đóng trả focus`, async ({ page }) => {
      await open(page, width);
      const { toggle, panel } = await openFooterLocalization(page);
      expect(await isModal(panel), 'popover không phải modal').toBe(false);
      const country = panel.getByTestId(T.country);
      const language = panel.getByTestId(T.language);
      await expect(country).toBeVisible();
      await expect(language).toBeVisible();
      await expect(country).toContainText(String(LOCALE.blocks.footer.country_label));
      await expect(language).toContainText(String(LOCALE.blocks.footer.language_label));
      const [c, l] = [(await country.boundingBox())!, (await language.boundingBox())!];
      expect(l.x, '2 cột: Language bên phải Country').toBeGreaterThanOrEqual(c.x + c.width - 1);
      expect(Math.abs(l.y - c.y), '2 cột cùng hàng').toBeLessThanOrEqual(40);
      for (const tab of await panel.getByRole('tab').all()) await expect(tab, 'không tab từ 48rem').toBeHidden();
      await page.keyboard.press('Escape');
      await expect(panel).toBeHidden();
      await expect(toggle).toBeFocused();
    });
  }

  test('TC-25 AC10 360: dưới 48rem bottom sheet modal 2 tab; đổi tab; nút đóng trả focus', async ({ page }) => {
    await open(page, 360);
    const { toggle, panel } = await openFooterLocalization(page);
    await expect.poll(() => isModal(panel), { message: 'sheet phải modal' }).toBe(true);
    const box = (await panel.boundingBox())!;
    expect(box.y + box.height, 'sheet sát đáy').toBeGreaterThanOrEqual(heightOf(360) - 2);
    expect(box.width, 'sheet rộng hết màn').toBeGreaterThanOrEqual(358);
    const tabs = panel.getByRole('tab');
    await expect(tabs).toHaveCount(2);
    await expect(tabs.first()).toBeVisible();
    await expect(panel.getByTestId(T.country)).toBeVisible();
    await expect(panel.getByTestId(T.language)).toBeHidden();
    await panel.getByRole('tab', { name: String(LOCALE.blocks.footer.language_label) }).click();
    await expect(panel.getByTestId(T.language)).toBeVisible();
    await expect(panel.getByTestId(T.country)).toBeHidden();
    await panel.getByRole('button', { name: String(LOCALE.blocks.footer.close) }).click();
    await expect.poll(() => isModal(panel)).toBe(false);
    await expect(toggle).toBeFocused();
  });

  for (const width of BELOW_80) {
    test(`TC-27 AC10 ${width}: hàng localization drawer mở cấp 2 trong cùng drawer, Back, không lớp thứ hai`, async ({ page }) => {
      await open(page, width);
      await requireLocalization(page);
      const { drawer } = await openDrawer(page);
      const row = drawer.getByTestId(T.drawerLocale);
      await expect(row).toHaveCount(1);
      const summary = row.locator('summary');
      await summary.click();
      const level = row.getByTestId(T.level);
      await expect(level).toBeVisible();
      await expect(level.getByTestId(T.back)).toBeFocused();
      expect(await modalCount(page), 'chỉ 1 lớp modal (drawer)').toBe(1);
      await expect(footerPanel(page), 'không mở panel footer').toBeHidden();
      await expect(level.getByTestId('header-drawer-country-option').first().or(level.getByTestId(T.drawerLanguageOpt).first())).toBeVisible();
      await level.getByTestId(T.back).click();
      await expect(level).toBeHidden();
      await expect(summary).toBeFocused();
    });
  }

  for (const width of [360, 1280]) {
    test(`TC-28 AC10 ${width}: > 10 nước có ô tìm, gõ là lọc; hàng nước không cờ`, async ({ page }) => {
      await open(page, width);
      await requireLocalization(page);
      const all = page.getByTestId(T.footer).getByTestId(T.countryOpt);
      const total = await all.count();
      test.skip(total <= 10, `store dev ${total} nước (≤ 10: ô tìm không có, kiểm tĩnh TC-26)`);
      const { panel } = await openFooterLocalization(page);
      await showTab(panel, new RegExp(`^${LOCALE.blocks.footer.country_label}$`));
      const search = panel.getByTestId(T.countrySearch);
      await expect(search).toBeVisible();
      for (const o of await all.all()) await expect(o.locator('img, svg image'), 'hàng nước không cờ').toHaveCount(0);
      await search.fill('can');
      await expect.poll(async () => (await all.evaluateAll((els) => els.filter((e) => (e as HTMLElement).offsetParent !== null).length))).toBeLessThan(total);
      const shown = await all.evaluateAll((els) => els.filter((e) => (e as HTMLElement).offsetParent !== null).map((e) => e.textContent ?? ''));
      expect(shown.length, 'có kết quả cho "can"').toBeGreaterThan(0);
      for (const t of shown) expect(t.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase(), 'mục hiện khớp từ khoá').toContain('can');
    });
  }

  test('TC-29 AC10 1280: chọn nước đổi ngay qua form localization, không Apply; ✓ + aria-current', async ({ page }) => {
    await open(page, 1280, '/collections/all');
    const { panel } = await openFooterLocalization(page);
    await expect(panel.getByRole('button', { name: /apply/i }), 'không nút Apply').toHaveCount(0);
    const options = panel.getByTestId(T.countryOpt);
    expect(await options.evaluateAll((els) => els.every((e) => e.getAttribute('type') === 'submit')), 'mục là nút submit').toBe(true);
    const current = panel.locator('[data-testid="footer-country-option"][aria-current="true"]');
    await expect(current).toHaveCount(1);
    const tick = await current.evaluate((el) => {
      const s = getComputedStyle(el, '::before');
      return { content: s.content, width: parseFloat(s.inlineSize || s.width) };
    });
    expect(tick.content, 'mục hiện tại có dấu ✓').not.toBe('none');
    expect(tick.width).toBeGreaterThan(0);
    const currentValue = await current.getAttribute('value');
    const target = COUNTRY_TARGET && COUNTRY_TARGET !== currentValue && (await panel.locator(`[data-testid="footer-country-option"][value="${COUNTRY_TARGET}"]`).count())
      ? COUNTRY_TARGET
      : await panel.locator('[data-testid="footer-country-option"]:not([aria-current="true"])').first().getAttribute('value');
    test.skip(!target, 'không có nước khác để chọn');
    const option = panel.locator(`[data-testid="footer-country-option"][value="${target}"]`);
    const currency = ((await option.textContent()) ?? '').match(/\b[A-Z]{3}\b/)?.[0];
    const search = panel.getByTestId(T.countrySearch);
    if (await search.isVisible()) await search.fill(((await option.locator('xpath=.//*[1]').textContent()) ?? '').trim().slice(0, 4));
    await option.scrollIntoViewIfNeeded();
    await Promise.all([page.waitForRequest((r) => r.method() === 'POST' && /\/localization\b/.test(r.url()), { timeout: 15_000 }), option.click()]);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByTestId(T.footer).locator(`[data-testid="footer-country-option"][value="${target}"]`)).toHaveAttribute('aria-current', 'true');
    expect(new URL(page.url()).pathname, 'giữ trang đang xem').toMatch(/\/collections\/all$/);
    if (currency) await expect(footerToggle(page)).toContainText(currency);
  });

  test('TC-30 AC10 360: drawer → localization → tab Language → chọn ngôn ngữ đổi ngay', async ({ page }) => {
    await open(page, 360, '/collections/all');
    await requireLocalization(page);
    const { drawer } = await openDrawer(page);
    const row = drawer.getByTestId(T.drawerLocale);
    await row.locator('summary').click();
    const level = row.getByTestId(T.level);
    await expect(level).toBeVisible();
    await showTab(level, new RegExp(`^${LOCALE.blocks.footer.language_label}$`));
    const options = level.getByTestId(T.drawerLanguageOpt);
    test.skip((await options.count()) < 2, 'store dev có 1 ngôn ngữ');
    const value = LANGUAGE_TARGET && (await level.locator(`[data-testid="${T.drawerLanguageOpt}"][value="${LANGUAGE_TARGET}"]:not([aria-current="true"])`).count())
      ? LANGUAGE_TARGET
      : await level.locator(`[data-testid="${T.drawerLanguageOpt}"]:not([aria-current="true"])`).first().getAttribute('value');
    test.skip(!value, 'không có ngôn ngữ khác để chọn');
    const option = level.locator(`[data-testid="${T.drawerLanguageOpt}"][value="${value}"]`);
    await expect(option).toBeVisible();
    await Promise.all([page.waitForRequest((r) => r.method() === 'POST' && /\/localization\b/.test(r.url()), { timeout: 15_000 }), option.click()]);
    await page.waitForLoadState('domcontentloaded');
    const path = new URL(page.url()).pathname;
    test.skip(/\/password$/.test(path), `môi trường: cookie mật khẩu không theo sang /${value} (ES1-T434), không phải lỗi theme`);
    await expect(page.locator('html')).toHaveAttribute('lang', value!);
    expect(path).toContain(`/${value!.toLowerCase()}`);
  });

  // ---------- AC-H28 ----------
  test('TC-32 AC-H28 1920 store dev đã cấu hình: logo, mô tả, ảnh, heading 2 màu AA, nút "Get 15% off" + icon, "No spam"', async ({ page }) => {
    await open(page, 1920);
    await skipUnlessFixture(page);
    test.skip(!(await footerSettingsApplied(page)), FOOTER_PENDING);
    const footer = page.getByTestId(T.footer);
    await footer.scrollIntoViewIfNeeded();
    await expect(footer.getByTestId(T.logo)).toBeVisible();
    await expect(footer.getByTestId(T.description)).toHaveText(/\S/);
    await expect(footer.getByTestId(T.nlImage), 'ảnh newsletter (fixture ES1-T331 để null: xem KHÔNG CHẮC #2 test-cases)').toBeVisible();
    const heading = footer.getByTestId(T.nlHeading);
    await expect(heading).toBeVisible();
    const colors = await heading.evaluate((h) => {
      const bgOf = (n: Element | null): string => {
        for (let e = n; e; e = e.parentElement) {
          const c = getComputedStyle(e).backgroundColor;
          if (c && c !== 'transparent' && !/,\s*0\)$|\/\s*0\)$/.test(c)) return c;
        }
        return 'rgb(255, 255, 255)';
      };
      const accent = h.querySelector('em, i, strong, span');
      const s = getComputedStyle(h);
      return { base: s.color, accent: accent ? getComputedStyle(accent).color : null, bg: bgOf(h), size: parseFloat(s.fontSize), weight: parseInt(s.fontWeight, 10) };
    });
    expect(colors.accent, 'heading có phần nhấn').not.toBeNull();
    expect(colors.accent, 'heading 2 màu').not.toBe(colors.base);
    const min = colors.size >= 24 || (colors.size >= 18.66 && colors.weight >= 700) ? 3 : 4.5;
    expect(contrast(colors.base, colors.bg), `màu heading / nền ≥ ${min}`).toBeGreaterThanOrEqual(min);
    expect(contrast(colors.accent!, colors.bg), `màu nhấn / nền ≥ ${min}`).toBeGreaterThanOrEqual(min);
    const submit = footer.getByTestId(T.nlSubmit);
    await expect(submit).toHaveText(/get 15% off/i);
    await expect(submit.locator('svg'), 'nút có icon').toHaveCount(1);
    await expect(footer.getByTestId(T.nlNote)).toHaveText('No spam. Unsubscribe anytime.');
  });

  for (const width of WIDTHS) {
    test(`TC-33 AC-H28 ${width} theme mới cài: không "Get 15% off", nút = locale, chữ rỗng không render, không social mẫu`, async ({ page }) => {
      test.skip(!FRESH_THEME_ID, 'chưa có FRESH_THEME_ID (theme push từ repo, không áp fixture)');
      await open(page, width, `/?preview_theme_id=${FRESH_THEME_ID}`);
      const footer = page.getByTestId(T.footer);
      expect(await footer.innerText()).not.toMatch(/get 15% off/i);
      await expect(footer.getByTestId(T.nlSubmit)).toHaveText(String(LOCALE.blocks.footer.newsletter_submit));
      for (const id of [T.description, T.nlHeading, T.nlText, T.trust]) await expect(footer.getByTestId(id), `${id} rỗng thì không render`).toHaveCount(0);
      await expect(footer.getByTestId(T.social)).toHaveCount(0);
      const hrefs = await footer.locator('a[href]').evaluateAll((as) => as.map((a) => a.getAttribute('href') ?? ''));
      expect(hrefs.filter((h) => /tiktok\.com|instagram\.com|youtube\.com|facebook\.com/.test(h)), 'link social mẫu').toEqual([]);
    });
  }

  // ---------- AC-H29 ----------
  for (const width of WIDTHS) {
    test(`TC-35 AC-H29 ${width}: hero thật, header tối 80 không chồng hero; cuộn quá 80 nền không đổi`, async ({ page }) => {
      await open(page, width);
      const hero = page.getByTestId(T.slideshow).first();
      test.skip((await hero.count()) === 0, 'trang chủ store dev không có slideshow');
      const header = page.getByTestId(T.header);
      const dark = await varColor(page, '--color-background-dark');
      const top = await band(header);
      const heroTop = await hero.evaluate((el) => el.getBoundingClientRect().top);
      expect(Math.abs(top.height - 80)).toBeLessThanOrEqual(1);
      expect(top.bg).toBe(dark);
      expect(top.bottom, 'đáy header ≤ đỉnh hero').toBeLessThanOrEqual(heroTop + 0.5);
      await scrollTo(page, 200);
      await expect.poll(async () => (await band(header)).bg).toBe(dark);
      const scrolled = await band(header);
      expect(Math.abs(scrolled.height - 80)).toBeLessThanOrEqual(1);
      expect(scrolled.noise).toBe(top.noise);
    });
  }

  // ---------- Case biên ----------
  test('TB-01 360: header, footer không tràn ngang', async ({ page }) => {
    await open(page, 360);
    await page.getByTestId(T.footer).scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  });

  test('TB-02 360: header-drawer.js lỗi mạng → drawer vẫn mở bằng <details>, cấp 2 accordion tại chỗ', async ({ page }) => {
    const errors = watchConsole(page);
    await page.route(/\/header-drawer\.js/, (route) => route.abort());
    await open(page, 360);
    const toggle = page.getByTestId(T.drawerToggle);
    test.skip((await toggle.count()) === 0, 'main-menu store dev rỗng');
    await toggle.click();
    const drawer = page.getByTestId(T.drawer);
    await expect(drawer).toBeVisible();
    const acc = drawer.getByTestId(T.drawerAcc).first();
    if (await acc.count()) {
      await acc.click();
      await expect(acc.locator('xpath=..').getByTestId(T.drawerSub)).toBeVisible();
      await expect(acc.locator('xpath=..').getByTestId(T.back)).toBeHidden();
    }
    expect(errors.filter((e) => !/Failed to load resource|header-drawer/.test(e))).toEqual([]);
  });

  test('TB-03 1280: localization-*.js lỗi mạng → popover vẫn mở, mục là nút submit', async ({ page }) => {
    await page.route(/\/localization-(picker|list)\.js/, (route) => route.abort());
    await open(page, 1280);
    await openFooterLocalization(page, { js: false });
    const option = footerPanel(page).getByTestId(T.countryOpt).first();
    await expect(option).toBeVisible();
    await expect(option).toHaveAttribute('type', 'submit');
  });

  test('TB-04 1280: offline khi chọn nước → footer-localization-error role=alert', async ({ page, context }) => {
    await open(page, 1280);
    const { panel } = await openFooterLocalization(page);
    const other = panel.locator('[data-testid="footer-country-option"]:not([aria-current="true"])').first();
    test.skip((await other.count()) === 0, 'không có nước khác');
    const search = panel.getByTestId(T.countrySearch);
    if (await search.isVisible()) await search.fill(((await other.locator('xpath=.//*[1]').textContent()) ?? '').trim().slice(0, 4));
    await context.setOffline(true);
    try {
      await other.click();
      const error = page.getByTestId(T.footer).getByTestId(T.locError);
      await expect(error).toBeVisible();
      await expect(error).toHaveAttribute('role', 'alert');
    } finally {
      await context.setOffline(false);
    }
  });

  test('TB-05 360: bàn phím Tab tới nút menu, Enter mở drawer, focus tiêu đề "Menu"', async ({ page }) => {
    await open(page, 360);
    const toggle = page.getByTestId(T.drawerToggle);
    test.skip((await toggle.count()) === 0, 'main-menu store dev rỗng');
    let reached = false;
    for (let i = 0; i < 8 && !reached; i++) {
      await page.keyboard.press('Tab');
      reached = await toggle.evaluate((el) => el === document.activeElement);
    }
    expect(reached, 'Tab không tới nút menu trong 8 lần').toBe(true);
    await expect(page.getByTestId(T.header)).toHaveAttribute('data-drawer-enhanced', '', { timeout: 15_000 });
    await page.keyboard.press('Enter');
    const drawer = page.getByTestId(T.drawer);
    await expect.poll(() => isModal(drawer)).toBe(true);
    await expect(drawer.locator(`[id="${await drawer.getAttribute('aria-labelledby')}"]`)).toBeFocused();
  });

  for (const width of WIDTHS) {
    test(`TB-06 axe ${width}: header, footer, bar đóng 0 serious/critical`, async ({ page }) => {
      await open(page, width);
      expect(await axeOn(page, [T.bar, T.header, T.footer])).toEqual([]);
    });
  }

  test('TB-06 axe 360: drawer cấp 2 mở, sheet localization mở', async ({ page }) => {
    await open(page, 360);
    await openDrawer(page);
    if (await page.getByTestId(T.drawer).getByTestId(T.drawerAcc).count()) {
      await firstLevel(page).acc.click();
      await expect(firstLevel(page).level).toBeVisible();
    }
    expect(await axeOn(page, [T.drawer]), 'drawer').toEqual([]);
    await page.keyboard.press('Escape');
    if (await footerToggle(page).count()) {
      const { panel } = await openFooterLocalization(page);
      await expect.poll(() => isModal(panel)).toBe(true);
      expect(await axeOn(page, [T.locPanel]), 'sheet').toEqual([]);
    }
  });

  test('TB-06 axe 1280: popover localization mở', async ({ page }) => {
    await open(page, 1280);
    await openFooterLocalization(page);
    expect(await axeOn(page, [T.footer])).toEqual([]);
  });

  for (const width of [360, 1280]) {
    test(`TB-07 TB-09 ${width}: không placeholder editor; 0 console error khi mở/đóng drawer và localization`, async ({ page }) => {
      const errors = watchConsole(page);
      await open(page, width);
      await expect(page.getByTestId(T.barPlaceholder)).toHaveCount(0);
      await expect(page.getByText(/No menu to show/)).toHaveCount(0);
      if (width < 1280 && (await page.getByTestId(T.drawerToggle).count())) {
        await openDrawer(page);
        if (await page.getByTestId(T.drawer).getByTestId(T.drawerAcc).count()) {
          const { acc, back } = firstLevel(page);
          await acc.click();
          await back.click();
        }
        await page.keyboard.press('Escape');
      }
      if (await footerToggle(page).count()) {
        await openFooterLocalization(page);
        await page.keyboard.press('Escape');
      }
      expect(errors).toEqual([]);
    });
  }
});

// =====================================================================
test.describe('ES1-T325 cảm ứng (project mobile)', () => {
  test.beforeEach(({}, ti) => test.skip(ti.project.name !== 'mobile', 'cần hasTouch'));
  test.beforeEach(declineConsent);

  test('TC-05 AC2 360 chạm thật: drawer cấp 1, chạm cấp 2 → focus Back, chạm Back → focus mục', async ({ page }) => {
    await open(page, 360);
    const toggle = page.getByTestId(T.drawerToggle);
    test.skip((await toggle.count()) === 0, 'main-menu store dev rỗng');
    await toggle.focus();
    await expect(page.getByTestId(T.header)).toHaveAttribute('data-drawer-enhanced', '', { timeout: 15_000 });
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await toggle.tap();
    const drawer = page.getByTestId(T.drawer);
    await expect.poll(() => isModal(drawer)).toBe(true);
    await expect(drawer.locator(`[id="${await drawer.getAttribute('aria-labelledby')}"]`)).toBeFocused();
    test.skip((await drawer.getByTestId(T.drawerAcc).count()) === 0, 'main-menu store dev chưa có mục cấp 2');
    const { acc, level, back } = firstLevel(page);
    await acc.tap();
    await expect(level).toBeVisible();
    await expect(back).toBeFocused();
    await back.tap();
    await expect(level).toBeHidden();
    await expect(acc).toBeFocused();
  });
});

// =====================================================================
test.describe('ES1-T325 không JS', () => {
  test.use({ javaScriptEnabled: false });
  test.beforeEach(({}, ti) => desktopOnly(ti));
  test.beforeEach(declineConsent);

  for (const width of BELOW_80) {
    test(`TC-04 AC2 ${width} không JS: drawer mở bằng CSS, cấp 2 accordion tại chỗ, không Back`, async ({ page }) => {
      await open(page, width);
      const toggle = page.getByTestId(T.drawerToggle);
      test.skip((await toggle.count()) === 0, 'main-menu store dev rỗng');
      await toggle.click();
      const drawer = page.getByTestId(T.drawer);
      await expect(drawer).toBeVisible();
      const acc = drawer.getByTestId(T.drawerAcc).first();
      test.skip((await acc.count()) === 0, 'main-menu store dev chưa có mục cấp 2');
      await acc.click();
      const item = acc.locator('xpath=..');
      await expect(item.getByTestId(T.drawerSub)).toBeVisible();
      await expect(item.getByTestId(T.back), 'không Back khi không JS').toBeHidden();
      expect((await item.getByTestId(T.drawerSub).getByRole('link').count()), 'link cấp 2').toBeGreaterThan(0);
    });
  }

  test('TC-31 AC10 1280 không JS: nút gộp footer mở danh sách, bấm nước khác → đổi nước', async ({ page }) => {
    await open(page, 1280, '/collections/all');
    await openFooterLocalization(page, { js: false });
    const panel = footerPanel(page);
    const target = COUNTRY_TARGET && (await panel.locator(`[data-testid="footer-country-option"][value="${COUNTRY_TARGET}"]:not([aria-current="true"])`).count())
      ? COUNTRY_TARGET
      : await panel.locator('[data-testid="footer-country-option"]:not([aria-current="true"])').first().getAttribute('value');
    test.skip(!target, 'không có nước khác');
    const option = panel.locator(`[data-testid="footer-country-option"][value="${target}"]`);
    await option.scrollIntoViewIfNeeded();
    await Promise.all([page.waitForRequest((r) => r.method() === 'POST' && /\/localization\b/.test(r.url()), { timeout: 15_000 }), option.click()]);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByTestId(T.footer).locator(`[data-testid="footer-country-option"][value="${target}"]`)).toHaveAttribute('aria-current', 'true');
  });

  test('TC-31 AC10 360 không JS: drawer → hàng localization → bấm ngôn ngữ khác → đổi ngôn ngữ', async ({ page }) => {
    await open(page, 360, '/collections/all');
    await requireLocalization(page);
    const toggle = page.getByTestId(T.drawerToggle);
    test.skip((await toggle.count()) === 0, 'main-menu store dev rỗng');
    await toggle.click();
    const row = page.getByTestId(T.drawer).getByTestId(T.drawerLocale);
    await row.locator('summary').click();
    const options = row.locator(`[data-testid="${T.drawerLanguageOpt}"]:not([aria-current="true"])`);
    test.skip((await options.count()) === 0, 'store dev có 1 ngôn ngữ');
    const value = LANGUAGE_TARGET && (await row.locator(`[data-testid="${T.drawerLanguageOpt}"][value="${LANGUAGE_TARGET}"]:not([aria-current="true"])`).count())
      ? LANGUAGE_TARGET
      : await options.first().getAttribute('value');
    const option = row.locator(`[data-testid="${T.drawerLanguageOpt}"][value="${value}"]`);
    await option.scrollIntoViewIfNeeded();
    await expect(option).toBeVisible();
    await Promise.all([page.waitForRequest((r) => r.method() === 'POST' && /\/localization\b/.test(r.url()), { timeout: 15_000 }), option.click()]);
    await page.waitForLoadState('domcontentloaded');
    const path = new URL(page.url()).pathname;
    test.skip(/\/password$/.test(path), `môi trường: cookie mật khẩu không theo sang /${value} (ES1-T434)`);
    await expect(page.locator('html')).toHaveAttribute('lang', value!);
  });
});
