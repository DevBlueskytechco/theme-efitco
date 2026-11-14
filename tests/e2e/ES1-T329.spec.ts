// KHÔNG CHẮC: spec chưa chạy (phiên viết không có trình duyệt, preview, node_modules) → chờ CI. Cần main-menu store dev có mục mega (ES1-T271);
// thiếu thì test hành vi mega skip có lý do, test tĩnh vẫn chạy.
// Ticket ES1-T329 TE-22-R2-BE1: assets/header-menu.js 6 862 → ≤ 3 072 B (ADR 0010), chỉ mega/dropdown từ 80rem; drawer tách
// sang assets/header-drawer.js (≤ 4 096 B) nạp lười từ header-menu.js khi chạm nút menu. AC TE-1 AC2 (từ 80rem) → TE-22; navigation.md §6.
// Không lặp ES1-T16.spec.ts (đổi mục, rời header khi đang dùng bàn phím, Esc khi hover, focus trap drawer) — spec đó vẫn phải xanh.
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T329.spec.ts
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect, type Page, type TestInfo } from '@playwright/test';
import { watchShopPay403 } from './support/console-guard';
import { expectNotChallenged } from './support/store-guard';

const ROOT = process.cwd();
const read = (f: string) => readFileSync(join(ROOT, f), 'utf8');
const MENU_JS = 'assets/header-menu.js';
const DRAWER_JS = 'assets/header-drawer.js';
const HEADER = 'blocks/header.liquid';
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|shopifysvc\.com|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];
const HOVER_WAIT = 400; // > 150ms trễ hover trong header-menu.js

const isDesktop = (ti: TestInfo) => ti.project.name === 'desktop';
const tid = (page: Page, id: string) => page.getByTestId(id);

function watchConsole(page: Page) {
  const errors: string[] = [];
  const isShopPay403 = watchShopPay403(page);
  page.on('console', (msg) => {
    if (msg.type() !== 'error' || isShopPay403(msg)) return;
    if (IGNORE_CONSOLE.some((r) => r.test(msg.text()) || r.test(msg.location().url))) return;
    errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

function watchDrawerModule(page: Page) {
  const urls: string[] = [];
  page.on('request', (r) => {
    if (/\/header-drawer\.js(\?|$)/.test(r.url())) urls.push(r.url());
  });
  return urls;
}

async function open(page: Page, path = '/') {
  await page.goto(path);
  await expectNotChallenged(page);
  await page.waitForFunction(() => !!customElements.get('header-menu'));
}

/** Các mục cấp 1 có panel mega (data-mega="columns" | "tiles") trong nav desktop. */
function megaItems(page: Page) {
  return tid(page, 'header-menu').getByTestId('header-menu-item').filter({ has: page.locator('details[data-mega]') });
}

function parts(page: Page, nth: number) {
  const item = megaItems(page).nth(nth);
  return {
    item,
    details: item.locator('details[data-mega]'),
    toggle: item.getByTestId('header-menu-toggle'),
    panel: item.getByTestId('header-mega-panel'),
    scrim: item.getByTestId('header-scrim'),
  };
}

async function needMega(page: Page, min = 1) {
  const n = await megaItems(page).count();
  test.skip(n < min, `main-menu cần ≥ ${min} mục mega (cấp 2 toàn collection hoặc có cấp 3), store dev ES1-T271`);
}

const htmlHas = (page: Page, attr: string) => page.evaluate((a) => document.documentElement.hasAttribute(a), attr);

test.describe('ES1-T329 tĩnh: trần byte, hợp đồng markup', () => {
  test('header-menu.js ≤ 3 072 B, header-drawer.js ≤ 4 096 B (ADR 0010), không console, không tự tạo custom element', () => {
    const menu = read(MENU_JS);
    const drawer = read(DRAWER_JS);
    expect(Buffer.byteLength(menu)).toBeLessThanOrEqual(3072);
    expect(Buffer.byteLength(drawer)).toBeLessThanOrEqual(4096);
    for (const [file, src] of [[MENU_JS, menu], [DRAWER_JS, drawer]]) {
      expect(src, `${file} có console.*`).not.toMatch(/\bconsole\./);
      expect(src, `${file} tự tạo phần tử (host do FE viết trong markup)`).not.toMatch(/createElement\(/);
      expect(src, `${file} define không guard customElements.get`).toMatch(/customElements\.get\(/);
      expect(src, `${file} fetch tự viết`).not.toMatch(/\bfetch\(/);
    }
    expect(menu, 'header-menu.js không còn phần drawer').not.toMatch(/class HeaderDrawer/);
    expect(menu, 'drawer nạp lười qua import() cùng thư mục asset').toMatch(/import\(new URL\("header-drawer\.js", import\.meta\.url\)\)/);
  });

  test('header.liquid: 1 thẻ script header-menu.js, header-drawer.js không có thẻ (lười), hook FE2 có đủ', () => {
    const src = read(HEADER);
    expect(src.match(/<script[^>]+header-menu\.js/g) ?? []).toHaveLength(1);
    expect(src).not.toMatch(/<script[^>]+header-drawer\.js/);
    for (const hook of ['<header-menu hidden>', '<header-drawer hidden>', 'data-mega=', 'data-layer="mega"', 'data-testid="header-scrim"', 'data-testid="header-mega-panel"', 'data-testid="header-menu-toggle"', 'data-testid="header-drawer-toggle"']) {
      expect(src, `thiếu hook ${hook}`).toContain(hook);
    }
  });
});

test.describe('ES1-T329 mega từ 80rem', () => {
  test.beforeEach(async ({ page }, ti) => {
    test.skip(!isDesktop(ti), 'desktop');
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  test('tải trang: data-mega-enhanced, aria-expanded false, chưa nạp header-drawer.js, 0 lỗi console', async ({ page }) => {
    const errors = watchConsole(page);
    const drawerReq = watchDrawerModule(page);
    await open(page);
    await expect(tid(page, 'header')).toHaveAttribute('data-mega-enhanced', '');
    for (const t of await tid(page, 'header-menu').getByTestId('header-menu-toggle').all()) {
      await expect(t).toHaveAttribute('aria-expanded', 'false');
    }
    await page.waitForTimeout(500);
    expect(drawerReq, 'desktop không chạm nút menu thì không tải header-drawer.js').toEqual([]);
    expect(errors).toEqual([]);
  });

  test('hover mở panel + scrim, aria-expanded true, page-layers gắn html[data-layer-open]', async ({ page }) => {
    await open(page);
    await needMega(page);
    const { toggle, panel, scrim } = parts(page, 0);
    await toggle.hover();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(panel).toBeVisible();
    await expect(scrim).toBeVisible();
    await expect(scrim).toHaveCSS('pointer-events', 'auto');
    if (await page.evaluate(() => !!customElements.get('page-layers'))) {
      await expect.poll(() => htmlHas(page, 'data-layer-open')).toBe(true);
    }
  });

  test('rê sang mục mega khác: đổi panel, data-mega-instant; đóng hết thì gỡ', async ({ page }) => {
    await open(page);
    await needMega(page, 2);
    const a = parts(page, 0);
    const b = parts(page, 1);
    await a.toggle.hover();
    await expect(a.panel).toBeVisible();
    await expect(tid(page, 'header')).not.toHaveAttribute('data-mega-instant');
    await b.toggle.hover();
    await expect(b.toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(a.toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(tid(page, 'header')).toHaveAttribute('data-mega-instant', '');
    await page.keyboard.press('Escape');
    await expect(b.panel).toBeHidden();
    await expect(tid(page, 'header')).not.toHaveAttribute('data-mega-instant');
  });

  test('rê chuột lên scrim (ngoài header và panel) thì đóng sau 150ms', async ({ page }) => {
    await open(page);
    await needMega(page);
    const { toggle, panel } = parts(page, 0);
    await toggle.hover();
    await expect(panel).toBeVisible();
    const box = (await panel.boundingBox())!;
    const y = Math.min(box.y + box.height + 40, 795);
    test.skip(y <= box.y + box.height, 'panel cao kín khung nhìn, không còn vùng scrim để rê');
    await page.mouse.move(640, y);
    await expect(panel).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('bấm scrim đóng panel đang mở bằng bàn phím', async ({ page }) => {
    await open(page);
    await needMega(page);
    const { toggle, panel } = parts(page, 0);
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(panel).toBeVisible();
    const box = (await panel.boundingBox())!;
    const y = Math.min(box.y + box.height + 40, 795);
    test.skip(y <= box.y + box.height, 'panel cao kín khung nhìn');
    await page.mouse.click(640, y);
    await expect(panel).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('bàn phím: Enter mở, Space đóng, Esc đóng và trả focus về trigger', async ({ page }) => {
    await open(page);
    await needMega(page);
    const { toggle, panel } = parts(page, 0);
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Space');
    await expect(panel).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    await expect.poll(() => panel.evaluate((el) => el.contains(document.activeElement))).toBe(true);
    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
    await expect(toggle).toBeFocused();
  });

  test('Tab đi hết link panel (gồm cấp 3) theo thứ tự DOM, Tab ra ngoài thì đóng', async ({ page }) => {
    await open(page);
    await needMega(page);
    const { toggle, panel } = parts(page, 0);
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(panel).toBeVisible();
    const links = await panel.getByRole('link').evaluateAll((els) => els.map((el) => (el as HTMLAnchorElement).href));
    expect(links.length, 'panel không có link').toBeGreaterThan(0);
    const order: string[] = [];
    for (let i = 0; i < links.length; i++) {
      await page.keyboard.press('Tab');
      order.push(await page.evaluate(() => (document.activeElement as HTMLAnchorElement | null)?.href ?? ''));
    }
    expect(order, 'Tab không đi đúng thứ tự link trong panel').toEqual(links);
    await page.keyboard.press('Tab');
    await expect(panel).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('lỗi mạng header-menu.js: bấm trigger vẫn mở panel, scrim bấm được (không JS)', async ({ page }) => {
    await page.route('**/header-menu*.js*', (r) => r.abort());
    await page.goto('/');
    await expectNotChallenged(page);
    await needMega(page);
    const { toggle, panel } = parts(page, 0);
    await expect(tid(page, 'header')).not.toHaveAttribute('data-mega-enhanced');
    await toggle.click();
    await expect(panel.getByRole('link').first()).toBeVisible();
  });
});

test.describe('ES1-T329 drawer nạp lười', () => {
  test.beforeEach(async ({}, ti) => {
    test.skip(isDesktop(ti), 'mobile');
  });

  test('chưa chạm nút menu thì chưa tải header-drawer.js; chạm thì tải, focus vào nút đóng, Esc trả focus', async ({ page }) => {
    const errors = watchConsole(page);
    const drawerReq = watchDrawerModule(page);
    await open(page);
    const toggle = tid(page, 'header-drawer-toggle');
    test.skip((await toggle.count()) === 0, 'menu trống');
    await page.waitForTimeout(500);
    expect(drawerReq, 'header-drawer.js tải sẵn').toEqual([]);
    await toggle.click();
    await expect.poll(() => drawerReq.length).toBeGreaterThan(0);
    await page.waitForFunction(() => !!customElements.get('header-drawer'));
    const drawer = tid(page, 'header-drawer');
    await expect(drawer).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(drawer.getByTestId('header-drawer-close')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden();
    await expect(toggle).toBeFocused();
    expect(errors).toEqual([]);
  });

  test('bàn phím: focus nút menu nạp module, Enter mở, focus vào nút đóng', async ({ page }) => {
    await open(page);
    const toggle = tid(page, 'header-drawer-toggle');
    test.skip((await toggle.count()) === 0, 'menu trống');
    await toggle.focus();
    await page.waitForFunction(() => !!customElements.get('header-drawer'));
    await page.keyboard.press('Enter');
    await expect(tid(page, 'header-drawer-close')).toBeFocused();
  });

  test('lỗi mạng header-drawer.js: drawer vẫn mở/đóng bằng <details>, không pageerror', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (e) => pageErrors.push(e.message));
    await page.route('**/header-drawer*.js*', (r) => r.abort());
    await open(page);
    const toggle = tid(page, 'header-drawer-toggle');
    test.skip((await toggle.count()) === 0, 'menu trống');
    await toggle.click();
    const drawer = tid(page, 'header-drawer');
    await expect(drawer).toBeVisible();
    await expect(drawer.getByTestId('header-menu-item').first()).toBeVisible();
    // Không JS: summary phủ nền sau panel, bấm vào là đóng (như ES1-T16 "backdrop").
    const size = page.viewportSize()!;
    await page.mouse.click(size.width - 5, size.height / 2);
    await expect(drawer).toBeHidden();
    expect(pageErrors).toEqual([]);
  });
});
