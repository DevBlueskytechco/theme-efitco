// KHÔNG CHẮC: spec chưa chạy (phiên viết không có trình duyệt, preview, node_modules) → chờ CI.
// Ticket ES1-T485: import() động dựng URL bằng new URL(x, import.meta.url) mất ?v= → CDN Shopify trả header-drawer.js cũ.
// Sửa: URL lấy từ Liquid `{{ 'x.js' | asset_url }}` (có ?v=) qua data-* trên chính phần tử: <header-menu data-drawer-src>,
// khối banner image-with-text + <scroll-buttons> data-motion-src. JS đọc dataset; nạp lười giữ nguyên (không thẻ script, không preload).
// AC1, AC5: tĩnh. AC2, AC3: storefront (mobile cho drawer; motion giả lập trình duyệt thường như ES1-T235/ES1-T316).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T485.spec.ts
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect, type Page } from './support/test';
import { expectNotChallenged } from './support/store-guard';
import { watchShopPay403 } from './support/console-guard';
import { newStoreContext } from './support/store-noise';

const read = (f: string) => readFileSync(f, 'utf8');
const JS = readdirSync('assets').filter((f) => f.endsWith('.js'));
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|shopifysvc\.com|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];
const asUser = () => Object.defineProperty(navigator, 'webdriver', { get: () => false });

const liquidFiles = () =>
  ['blocks', 'snippets', 'layout', 'templates'].flatMap((dir) =>
    readdirSync(dir, { withFileTypes: true, recursive: true })
      .filter((f) => f.isFile() && f.name.endsWith('.liquid'))
      .map((f) => join(f.parentPath, f.name)),
  );

function watchConsole(page: Page) {
  const errors: string[] = [];
  const isShopPay403 = watchShopPay403(page);
  page.on('console', (msg) => {
    if (msg.type() !== 'error' || isShopPay403(msg)) return;
    if (IGNORE_CONSOLE.some((r) => r.test(msg.text()) || r.test(msg.location().url))) return;
    errors.push(`${msg.text()} @ ${msg.location().url}`);
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

/** URL request asset theme theo tên file (đủ query). */
function watchAsset(page: Page, name: string) {
  const urls: string[] = [];
  const re = new RegExp(`/assets/${name.replace('.', '\\.')}(\\?|$)`);
  page.on('request', (r) => re.test(r.url()) && urls.push(r.url()));
  return urls;
}
const hasV = (url: string) => new URL(url).searchParams.has('v');

// ---------- Tĩnh ----------
test.describe('ES1-T485 tĩnh', () => {
  test.beforeEach(({}, ti) => test.skip(ti.project.name !== 'desktop', 'tĩnh, chạy 1 lần'));

  test('AC1, AC5: không import.meta.url trong assets/*.js', () => {
    for (const f of JS) expect(read(`assets/${f}`), f).not.toContain('import.meta.url');
  });

  test('AC2: mọi import() động lấy URL từ dataset (asset_url) hoặc URL tuyệt đối CDN Shopify, không đường dẫn tương đối', () => {
    for (const f of JS) {
      const src = read(`assets/${f}`);
      for (const [, arg] of src.matchAll(/\bimport\(([^)]*)\)/g)) {
        expect(arg, `${f}: import(${arg})`).toMatch(/^(\w+\.dataset\.\w+|"https:\/\/cdn\.shopify\.com\/[^"]+"|STANDARD_EVENTS_URL)$/);
        expect(arg, `${f}: chuỗi tương đối`).not.toMatch(/^["'`]\.{0,2}\/?[\w-]+\.js/);
      }
    }
    // Hằng/biến được truyền vào import() không phải đường dẫn file theme
    for (const f of JS) expect(read(`assets/${f}`), f).not.toMatch(/new URL\(["'][\w-]+\.js["']/);
  });

  test('Liquid: hook URL nạp lười đều qua asset_url', () => {
    const hooks = /data-(drawer-src|motion-src|lazy-module|items-src|search-src)="([^"]*)"/g;
    let seen = 0;
    for (const path of liquidFiles()) {
      for (const [, name, value] of read(path).matchAll(hooks)) {
        seen++;
        expect(value, `${path} data-${name}`).toMatch(/^\{\{ '[\w-]+\.js' \| asset_url \}\}$/);
      }
    }
    expect(seen).toBeGreaterThan(0);
  });

  test('host mang URL: <header-menu data-drawer-src>, banner + scroll-buttons data-motion-src; JS đọc dataset', () => {
    expect(read('blocks/header.liquid')).toContain(`<header-menu hidden data-drawer-src="{{ 'header-drawer.js' | asset_url }}"></header-menu>`);
    expect(read('assets/header-menu.js')).toContain('import(this.dataset.drawerSrc)');
    expect(read('blocks/image-with-text.liquid')).toMatch(/\{% if is_banner %\}\s*data-motion-src="\{\{ 'motion-scrub\.js' \| asset_url \}\}"/);
    for (const block of ['blog-posts', 'collection-list', 'testimonials', 'related-articles', 'video-carousel']) {
      const src = read(`blocks/${block}.liquid`);
      const host = src.slice(src.indexOf('<scroll-buttons'), src.indexOf('>', src.indexOf('<scroll-buttons')));
      expect(host, block).toContain(`data-motion-src="{{ 'scroll-extras.js' | asset_url }}"`);
    }
    const motion = read('assets/motion.js');
    // Thiếu URL (markup cũ) thì bỏ qua, không import("undefined") → 404 + lỗi console
    expect(motion).toContain('const lazy = (el) => el.dataset.motionSrc && import(el.dataset.motionSrc).catch(() => {});');
    expect(read('assets/header-menu.js')).toContain('this.dataset.drawerSrc && (drawer ||= import(this.dataset.drawerSrc)');
    expect(motion).toMatch(/once\(\{ rootMargin: "100% 0px" \}, lazy\)/);
    expect(motion).toMatch(/once\(\{ rootMargin: "200px" \}, lazy\)/);
  });

  test('nạp lười giữ nguyên: không thẻ script, không preload cho header-drawer, motion-scrub, scroll-extras', () => {
    for (const path of liquidFiles()) {
      const src = read(path);
      expect(src, path).not.toMatch(/<script[^>]+(header-drawer|motion-scrub|scroll-extras)\.js/);
      expect(src, path).not.toMatch(/modulepreload[^>]*(header-drawer|motion-scrub|scroll-extras)/);
    }
  });
});

// ---------- Lỗi: thiếu data-drawer-src (markup cũ) không lỗi console ----------
test.describe('ES1-T485 thiếu URL', () => {
  test.beforeEach(({}, ti) => test.skip(ti.project.name !== 'mobile', 'drawer dưới 80rem'));

  test('host không có data-drawer-src: focus nút menu không pageerror, drawer vẫn là <details> dự phòng', async ({ page }) => {
    const ORIGIN = 'https://theme485.test';
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>ES1-T485</title></head><body>
<header data-testid="header"><details><summary data-testid="header-drawer-toggle">Menu</summary><p>Drawer</p></details>
<header-menu hidden></header-menu></header>
<script src="/assets/header-menu.js" type="module"></script></body></html>`;
    await page.route(`${ORIGIN}/**`, (route) => {
      const { pathname } = new URL(route.request().url());
      if (pathname === '/assets/header-menu.js') return route.fulfill({ body: read('assets/header-menu.js'), contentType: 'text/javascript' });
      if (pathname.startsWith('/assets/')) return route.fulfill({ status: 404, body: '' });
      return route.fulfill({ body: html, contentType: 'text/html; charset=utf-8' });
    });
    await page.goto(`${ORIGIN}/`);
    await page.waitForFunction(() => !!customElements.get('header-menu'));
    const toggle = page.getByTestId('header-drawer-toggle');
    await toggle.focus();
    await toggle.click();
    await expect(page.locator('header details')).toHaveAttribute('open', '');
    await page.waitForTimeout(300);
    expect(errors).toEqual([]);
  });
});

// ---------- Storefront ----------
test.describe('ES1-T485 storefront drawer', () => {
  test.beforeEach(({}, ti) => test.skip(ti.project.name !== 'mobile', 'drawer chỉ có dưới 80rem'));

  test('AC3: focus nút menu → header-drawer.js có ?v=, drawer nâng cấp, focus vào #HeaderDrawerTitle; 0 lỗi console', async ({ page }) => {
    const errors = watchConsole(page);
    const urls = watchAsset(page, 'header-drawer.js');
    await page.goto('/');
    await expectNotChallenged(page);
    const toggle = page.getByTestId('header-drawer-toggle');
    test.skip((await toggle.count()) === 0, 'main-menu store dev rỗng');
    await page.waitForFunction(() => !!customElements.get('header-menu'));
    const src = await page.locator('header-menu').first().getAttribute('data-drawer-src');
    expect(src, 'host có data-drawer-src').toBeTruthy();
    expect(hasV(new URL(src!, page.url()).href), `data-drawer-src có v=: ${src}`).toBe(true);
    expect(urls, 'chưa tải trước tương tác').toEqual([]);
    await toggle.focus();
    await expect.poll(() => urls.length).toBeGreaterThan(0);
    for (const u of urls) expect(hasV(u), u).toBe(true);
    await expect(page.getByTestId('header')).toHaveAttribute('data-drawer-enhanced', '');
    await toggle.click();
    await expect(page.locator('#HeaderDrawerTitle')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(toggle).toBeFocused();
    expect(errors).toEqual([]);
  });
});

test.describe('ES1-T485 storefront motion', () => {
  test('AC3: motion-scrub.js (banner) có ?v= khi khối tới gần', async ({ page }) => {
    const errors = watchConsole(page);
    const urls = watchAsset(page, 'motion-scrub.js');
    await page.addInitScript(asUser);
    await page.goto('/');
    await expectNotChallenged(page);
    const banner = page.locator('.image-with-text--banner').first();
    test.skip((await banner.count()) === 0, 'trang chủ không có image with text dạng banner');
    await expect(banner).toHaveAttribute('data-motion-src', /[?&]v=/);
    await banner.scrollIntoViewIfNeeded();
    await expect.poll(() => urls.length).toBeGreaterThan(0);
    for (const u of urls) expect(hasV(u), u).toBe(true);
    await expect(banner.getByTestId('image-with-text-heading')).toHaveAttribute('data-scrub', '');
    expect(errors).toEqual([]);
  });

  test('AC3: scroll-extras.js (hàng cuộn ngang) có ?v=, cả khi giảm chuyển động', async ({ browser }) => {
    const context = await newStoreContext(browser, {
      reducedMotion: 'reduce',
      storageState: 'tests/setup/state.json',
      baseURL: process.env.STORE_ORIGIN || (process.env.PREVIEW_URL ? new URL(process.env.PREVIEW_URL).origin : undefined),
    });
    const page = await context.newPage();
    const errors = watchConsole(page);
    const urls = watchAsset(page, 'scroll-extras.js');
    await page.goto('/');
    await expectNotChallenged(page);
    const row = page.locator('scroll-buttons').first();
    test.skip((await row.count()) === 0, 'trang chủ không có hàng cuộn ngang');
    await expect(row).toHaveAttribute('data-motion-src', /[?&]v=/);
    await row.scrollIntoViewIfNeeded();
    await expect.poll(() => urls.length).toBeGreaterThan(0);
    for (const u of urls) expect(hasV(u), u).toBe(true);
    expect(errors).toEqual([]);
    await context.close();
  });
});
