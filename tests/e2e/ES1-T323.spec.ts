// KHÔNG CHẮC: spec chưa chạy trong phiên viết (sandbox không có Chromium, PREVIEW_URL, STORE_PASSWORD); kết quả thật lấy từ CI e2e của PR.
// Ticket ES1-T323 TE-1-R2-BE1: assets/header-drawer.js (mới, ≤ 4 096 B, nạp lười khi chạm/focus nút menu; ADR 0010).
// AC: docs/srs.md TE-1 AC2 (drawer dưới 80rem: cấp 2 trượt, Back "Back to menu", focus Back, Back trả focus), AC10 (hàng localization
// mở thành cấp 2 trong cùng drawer, có Back, không mở lớp thứ hai); navigation.md §6 (Esc đóng cả drawer ở mọi cấp, lần mở sau về cấp 1,
// Tab chỉ trong cấp đang hiện, vuốt về mép đóng); ADR 0007 #5 (<modal-dialog data-layer="menu">: showModal, focus tiêu đề, trả focus).
// Hợp đồng markup FE: blocks/header.liquid {% doc %} (ES1-T320, TE-1-R2-FE3), snippets/header-drawer-head.liquid.
// Hành vi: fixture dựng lại markup drawer của header.liquid trên origin giả https://theme.test (page.route phục vụ assets/ thật:
// critical.css, base.css, header-menu.js, modal-dialog.js, header-drawer.js) để kiểm cả đường nạp lười import(new URL(..., import.meta.url)).
// Storefront: trang chủ preview, mobile.
// Chạy: npx playwright test tests/e2e/ES1-T323.spec.ts --project=mobile (storefront: PREVIEW_URL=... STORE_PASSWORD=...)
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect, type Locator, type Page } from './support/test';
import AxeBuilder from '@axe-core/playwright';
import { expectNotChallenged } from './support/store-guard';
import { watchShopPay403 } from './support/console-guard';

const DRAWER_JS = 'assets/header-drawer.js';
const MENU_JS = 'assets/header-menu.js';
const DRAWER = readFileSync(DRAWER_JS, 'utf8');
const MENU = readFileSync(MENU_JS, 'utf8');
const HEADER = readFileSync('blocks/header.liquid', 'utf8');
const HEAD = readFileSync('snippets/header-drawer-head.liquid', 'utf8');
const BASE = readFileSync('assets/base.css', 'utf8');
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|shopifysvc\.com|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];

const T = {
  header: 'header',
  toggle: 'header-drawer-toggle',
  drawer: 'header-drawer',
  close: 'header-drawer-close',
  acc: 'header-drawer-accordion-toggle',
  level: 'header-drawer-level',
  back: 'header-drawer-back',
  locale: 'header-drawer-localization',
  country: 'header-drawer-country-option',
} as const;

// ---------- Fixture: markup như blocks/header.liquid render (menu 3 mục: Shop có cấp 3, Collection cấp 2, Sale không con) ----------
const ORIGIN = 'https://theme.test';

// Token mặc định (như ES1-T315); css-variables.liquid là nguồn thật trên store.
const TOKENS = `:root{--space-1:4px;--space-2:8px;--space-3:12px;--space-4:16px;--space-5:24px;--space-6:32px;--space-7:48px;--space-8:120px;
--page-margin:20px;--page-width:91rem;--header-height:80px;--radius-input:8px;--radius-button:8px;--radius-card:12px;--radius-pill:999px;
--color-background:#fff;--color-foreground:#1a1a1a;--color-muted:#6b6b6b;--color-muted-light:#808080;--color-border:#e5e5e5;
--color-background-alt:#f4f4f5;--color-background-dark:#1a1a1a;--color-background-dark-foreground:#fff;--color-accent:#c8400e;
--font-size-sm:.875rem;--font-size-base:1rem;--font-size-lg:1.125rem;--font-size-h3:1.5rem;--font-size-h2:2rem;--line-height-heading:1.1;
--font-heading--family:serif;--font-heading--weight:700;--font-heading--weight-display:800;--font-primary--family:sans-serif;
--motion-fast:150ms;--motion-base:250ms;--motion-slow:500ms;--ease-out:ease-out}`;

const head = (title: string, id: string) => `
<div class="site-header__drawer-head" hidden><div class="site-header__drawer-bar">
  <button type="button" class="site-header__drawer-back" data-testid="header-drawer-back" aria-label="Back to menu">Back</button>
  <button type="button" class="close-button" aria-label="Close menu">×</button></div>
  <p class="site-header__drawer-level-title" id="${id}">${title}</p></div>`;

const level = (i: number, title: string, body: string) => `
<li data-testid="header-menu-item"><details>
  <summary class="site-header__drawer-row" data-testid="header-drawer-accordion-toggle" aria-controls="HeaderDrawerSubmenu-${i}">${title}</summary>
  <div class="site-header__drawer-level" role="group" aria-labelledby="HeaderDrawerLevel-${i}" data-drawer-level="2" data-testid="header-drawer-level">
    ${head(title, `HeaderDrawerLevel-${i}`)}
    <ul class="site-header__drawer-submenu" id="HeaderDrawerSubmenu-${i}" data-testid="header-drawer-submenu">
      <li><a class="site-header__drawer-view-all" href="#all-${i}">View all ${title}</a></li>${body}</ul></div></details></li>`;

const FIXTURE = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>ES1-T323</title>
<link rel="stylesheet" href="/assets/critical.css"><link rel="stylesheet" href="/assets/base.css"><style>${TOKENS}</style></head>
<body>
<header class="site-header full-width" data-testid="header"><div class="site-header__inner">
<details class="site-header__drawer" scroll-lock>
  <summary class="site-header__icon" id="HeaderDrawerToggle" data-testid="header-drawer-toggle" aria-controls="HeaderDrawer"><span class="visually-hidden">Open menu</span>≡</summary>
  <modal-dialog data-layer="menu" data-return-focus="HeaderDrawerToggle">
  <dialog class="drawer site-header__drawer-panel" id="HeaderDrawer" aria-labelledby="HeaderDrawerTitle" data-testid="header-drawer">
    <div class="drawer__header"><p class="drawer__title site-header__drawer-title" id="HeaderDrawerTitle">Menu</p>
      <button type="button" class="close-button" data-testid="header-drawer-close" aria-label="Close menu">×</button></div>
    <nav class="drawer__body site-header__drawer-body" aria-label="Mobile menu"><ul class="site-header__drawer-menu">
      ${level(1, 'Shop', `
        <li><a class="site-header__drawer-group-title" id="HeaderDrawerGroup-1-1" href="#cat">Categories</a>
          <ul aria-labelledby="HeaderDrawerGroup-1-1"><li><a href="#c1">Benches</a></li><li><a href="#c2">Weights</a></li></ul></li>
        <li><a href="#bundles">Bundles</a></li>`)}
      ${level(2, 'Collection', `<li><a href="#k1">Cardio</a></li><li><a href="#k2">Strength</a></li>`)}
      <li data-testid="header-menu-item"><a class="site-header__drawer-row" href="#sale">Sale</a></li>
    </ul></nav>
    <div class="drawer__footer site-header__drawer-footer">
      <a class="site-header__drawer-account" href="#account" data-testid="header-drawer-account">Sign In</a>
      <form method="post" action="/localization" id="HeaderDrawerLocalizationForm"><input type="hidden" name="form_type" value="localization">
        <details data-testid="header-drawer-localization">
          <summary class="site-header__drawer-row site-header__drawer-locale" aria-controls="HeaderDrawerLocalization">USD / EN</summary>
          <div class="site-header__drawer-level" id="HeaderDrawerLocalization" role="group" aria-labelledby="HeaderDrawerLocalizationTitle" data-drawer-level="2" data-testid="header-drawer-level">
            ${head('Country/region and language', 'HeaderDrawerLocalizationTitle')}
            <ul class="site-header__drawer-options">
              <li><button class="site-header__drawer-option" type="submit" name="country_code" value="US" data-testid="header-drawer-country-option" aria-current="true">United States</button></li>
              <li><button class="site-header__drawer-option" type="submit" name="country_code" value="FR" data-testid="header-drawer-country-option">France</button></li>
            </ul></div></details></form></div>
  </dialog></modal-dialog>
</details>
<a class="site-header__logo" href="#home" data-testid="header-logo">Efitco</a>
<nav class="site-header__nav" aria-label="Main menu" data-testid="header-menu"><ul class="site-header__menu">
  <li class="site-header__item" data-testid="header-menu-item"><a class="site-header__link" href="#sale">Sale</a></li></ul></nav>
</div>
<header-menu hidden></header-menu>
<header-drawer hidden></header-drawer>
</header>
<script src="/assets/header-menu.js" type="module"></script>
<main id="MainContent"><a href="#page" data-testid="page-link">Page link</a><p style="block-size:3000px">Page</p></main>
<script src="/assets/modal-dialog.js" type="module"></script>
</body></html>`;

type MountOptions = { delayDrawer?: number; failDrawer?: boolean };

async function mount(page: Page, opts: MountOptions = {}) {
  const errors: string[] = [];
  const requests: string[] = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  // Request bị abort (test lỗi mạng) sinh "Failed to load resource": lỗi mạng, không phải lỗi JS của theme.
  page.on('console', (m) => m.type() === 'error' && !/Failed to load resource/.test(m.text()) && errors.push(m.text()));
  await page.route(`${ORIGIN}/**`, async (route) => {
    const { pathname } = new URL(route.request().url());
    if (!pathname.startsWith('/assets/')) return route.fulfill({ body: FIXTURE, contentType: 'text/html; charset=utf-8' });
    const name = pathname.slice('/assets/'.length);
    requests.push(name);
    if (name === 'header-drawer.js') {
      if (opts.failDrawer) return route.abort();
      if (opts.delayDrawer) await new Promise((r) => setTimeout(r, opts.delayDrawer));
    }
    const file = join('assets', name);
    if (!/^[\w.-]+$/.test(name) || !existsSync(file)) return route.fulfill({ status: 404, body: '' });
    const type = name.endsWith('.css') ? 'text/css' : name.endsWith('.js') ? 'text/javascript' : 'application/octet-stream';
    return route.fulfill({ body: readFileSync(file), contentType: type });
  });
  await page.goto(`${ORIGIN}/`);
  await page.waitForFunction(() => !!customElements.get('modal-dialog') && !!customElements.get('header-menu'));
  return { errors, requests };
}

const header = (page: Page) => page.getByTestId(T.header);
const drawerOf = (page: Page) => page.getByTestId(T.drawer);
const isModal = (page: Page) => drawerOf(page).evaluate((d) => d.matches(':modal'));
const rootOpen = (page: Page) => page.getByTestId(T.toggle).evaluate((s) => (s.parentElement as HTMLDetailsElement).open);
const nestedOpen = (page: Page) => drawerOf(page).evaluate((d) => d.querySelectorAll('details[open]').length);
const inertCount = (page: Page) => page.evaluate(() => document.querySelectorAll('[inert]').length);
const isInert = (el: Locator) => el.evaluate((e) => !!e.closest('[inert]'));
const activeIn = (el: Locator) => el.evaluate((e) => e.contains(document.activeElement));
const activeTestId = (page: Page) => page.evaluate(() => document.activeElement?.getAttribute('data-testid') ?? document.activeElement?.id ?? '');
const drawerJsLoads = (requests: string[]) => requests.filter((r) => r === 'header-drawer.js').length;

/** Chờ header-drawer.js define và nắm drawer (data-drawer-enhanced, sau whenDefined modal-dialog). */
async function enhanced(page: Page) {
  await expect(header(page)).toHaveAttribute('data-drawer-enhanced', '');
}

/** Focus nút menu (focusin → nạp lười), chờ nâng cấp xong, rồi chạm mở. */
async function openDrawer(page: Page) {
  const toggle = page.getByTestId(T.toggle);
  await toggle.focus();
  await enhanced(page);
  await toggle.click();
  await expect.poll(() => isModal(page)).toBe(true);
  return toggle;
}

/** Mục cấp 1 có cấp 2 thứ n, panel cấp 2 và nút Back của nó. */
function levelOf(page: Page, n: number) {
  const acc = drawerOf(page).getByTestId(T.acc).nth(n);
  const panel = acc.locator('xpath=..').getByTestId(T.level);
  return { acc, panel, back: panel.getByTestId(T.back) };
}

// ---------- Tĩnh ----------
test.describe('ES1-T323 tĩnh', () => {
  test.beforeEach(({}, ti) => test.skip(ti.project.name !== 'desktop', 'tĩnh, chạy 1 lần'));

  test('trần byte (ADR 0010: header-drawer ≤ 4 096; mỗi file ≤ 8 192), không console/fetch/import tĩnh, không tạo DOM, không style inline, guard define', () => {
    expect(statSync(DRAWER_JS).size, 'header-drawer.js').toBeLessThanOrEqual(4096);
    expect(statSync(MENU_JS).size, 'header-menu.js').toBeLessThanOrEqual(8192);
    for (const [name, src] of [['header-drawer.js', DRAWER], ['header-menu.js', MENU]] as const) {
      expect(src, name).not.toMatch(/console\.|fetch\(|partials|^\s*import\s/m);
      expect(src, name).not.toMatch(/innerHTML|insertAdjacent|\.style\b/);
    }
    expect(DRAWER).not.toMatch(/createElement|import\(/);
    expect(DRAWER).toContain('if (!customElements.get("header-drawer")) customElements.define("header-drawer"');
    // Mở/đóng qua element API của <modal-dialog> (ADR 0007 #5, ES1-T81), không viết lại Esc/scrim
    for (const hook of ['modal-dialog[data-layer="menu"]', 'whenDefined("modal-dialog")', '.open(', '"modal:close"', 'data-drawer-enhanced', '[data-drawer-level]', 'header-drawer-back', 'disconnectedCallback', 'passive: true'])
      expect(DRAWER, hook).toContain(hook);
    expect(DRAWER).not.toMatch(/showModal|"Escape"|keydown[^\n]*Escape/);
  });

  test('nạp lười: header-menu.js import header-drawer.js khi pointerenter/focusin/touchstart nút menu, không thẻ script riêng, không còn class drawer cũ', () => {
    expect(MENU).toContain('import(new URL("header-drawer.js", import.meta.url))');
    expect(MENU).toMatch(/\["pointerenter", "focusin", "touchstart"\]/);
    expect(MENU).not.toMatch(/class HeaderDrawer|mount\("header-drawer"/);
    for (const dir of ['blocks', 'snippets', 'layout', 'templates']) {
      for (const file of readdirSync(dir, { withFileTypes: true, recursive: true })) {
        if (!file.isFile()) continue;
        const path = join(file.parentPath, file.name);
        expect(readFileSync(path, 'utf8'), path).not.toMatch(/header-drawer\.js/);
      }
    }
  });

  test('hợp đồng markup FE (header.liquid, header-drawer-head.liquid, base.css) khớp hook JS và fixture', () => {
    for (const hook of [
      '<header-drawer hidden></header-drawer>',
      '<modal-dialog data-layer="menu" data-return-focus="HeaderDrawerToggle">',
      'data-testid="header-drawer-toggle"',
      'aria-labelledby="HeaderDrawerTitle"',
      'data-testid="header-drawer-close"',
      'data-testid="header-drawer-accordion-toggle"',
      'data-drawer-level="2"',
      'data-testid="header-drawer-level"',
      'data-testid="header-drawer-localization"',
      "{%- render 'header-drawer-head'",
      '<details class="site-header__drawer" scroll-lock>',
    ])
      expect(HEADER, hook).toContain(hook);
    expect(HEAD).toMatch(/class="site-header__drawer-head" hidden/);
    expect(HEAD).toContain('data-testid="header-drawer-back"');
    expect(HEAD).toMatch(/class="close-button"/);
    expect(BASE).toMatch(/\.site-header\[data-drawer-enhanced\] \.site-header__drawer-head\s*\{\s*display:\s*block/);
    expect(BASE).toMatch(/\.site-header\[data-drawer-enhanced\] \.site-header__drawer-level\s*\{[^}]*position:\s*absolute/);
  });
});

// ---------- Hành vi trên fixture (mobile 412, cảm ứng) ----------
test.describe('ES1-T323 hành vi (fixture)', () => {
  test.beforeEach(({}, ti) => test.skip(ti.project.name !== 'mobile', 'drawer chỉ có dưới 80rem; vuốt cần hasTouch'));

  test('nạp lười: chưa chạm thì chưa tải header-drawer.js, aria-expanded false có sẵn; focus nút menu thì tải đúng 1 lần, gắn data-drawer-enhanced', async ({ page }) => {
    const { errors, requests } = await mount(page);
    await page.waitForTimeout(300);
    expect(drawerJsLoads(requests)).toBe(0);
    expect(await page.evaluate(() => !!customElements.get('header-drawer'))).toBe(false);
    const toggle = page.getByTestId(T.toggle);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(levelOf(page, 0).acc).toHaveAttribute('aria-expanded', 'false');
    await expect(header(page)).not.toHaveAttribute('data-drawer-enhanced');

    await toggle.focus();
    await enhanced(page);
    await toggle.hover();
    await toggle.dispatchEvent('touchstart');
    await page.waitForTimeout(200);
    expect(drawerJsLoads(requests), 'import() cache: một lần').toBe(1);
    await expect(header(page).locator('header-drawer')).toBeHidden();
    expect(errors).toEqual([]);
  });

  test('mở: showModal, focus tiêu đề "Menu", aria-expanded true, khoá cuộn; Esc đóng cả drawer, focus về nút menu, aria-expanded false', async ({ page }) => {
    const { errors } = await mount(page);
    const toggle = await openDrawer(page);
    await expect(drawerOf(page).locator('#HeaderDrawerTitle')).toBeFocused();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflowY)).toBe('hidden');
    expect(await page.evaluate(() => document.querySelectorAll('dialog:modal').length)).toBe(1);

    await page.keyboard.press('Escape');
    await expect.poll(() => isModal(page)).toBe(false);
    await expect(toggle).toBeFocused();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect.poll(() => rootOpen(page), 'details gập sau hiệu ứng đóng').toBe(false);
    await expect(drawerOf(page)).toBeHidden();
    expect(errors).toEqual([]);
  });

  test('AC2 cấp 2: chạm mục có con → panel cấp 2 hiện, focus Back, cấp 1 inert, Tab/Shift+Tab chỉ trong cấp 2; Back → về cấp 1, focus về mục vừa mở', async ({ page }) => {
    const { errors } = await mount(page);
    await openDrawer(page);
    const { acc, panel, back } = levelOf(page, 0);
    await acc.click();
    await expect(panel).toBeVisible();
    await expect(back).toBeVisible();
    await expect(back).toBeFocused();
    await expect(back).toHaveAccessibleName('Back to menu');
    expect((await back.boundingBox())!.height, 'Back cao ≥ 44').toBeGreaterThanOrEqual(43.5);
    await expect(acc).toHaveAttribute('aria-expanded', 'true');
    // Cấp 1, đầu drawer, chân drawer không nhận focus, không đọc được khi cấp 2 phủ
    for (const el of [acc, drawerOf(page).getByTestId(T.close), levelOf(page, 1).acc, drawerOf(page).getByTestId('header-drawer-account')])
      expect(await isInert(el)).toBe(true);
    expect(await isInert(panel)).toBe(false);

    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      expect(await activeIn(panel), `Tab lần ${i + 1} ra ngoài cấp 2`).toBe(true);
    }
    await back.focus();
    await page.keyboard.press('Shift+Tab');
    expect(await activeIn(panel), 'Shift+Tab từ Back ra ngoài cấp 2').toBe(true);
    await expect(back).not.toBeFocused();

    await back.click();
    await expect(panel).toBeHidden();
    await expect(acc).toBeFocused();
    await expect(acc).toHaveAttribute('aria-expanded', 'false');
    expect(await inertCount(page)).toBe(0);
    expect(await isModal(page)).toBe(true);
    expect(errors).toEqual([]);
  });

  test('AC2 chỉ bàn phím: Enter mở cấp 2 → focus Back; Enter trên Back → về cấp 1, focus về mục; mục khác vẫn mở được', async ({ page }) => {
    await mount(page);
    await openDrawer(page);
    const first = levelOf(page, 0);
    await first.acc.focus();
    await page.keyboard.press('Enter');
    await expect(first.back).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(first.acc).toBeFocused();
    await expect(first.panel).toBeHidden();
    const second = levelOf(page, 1);
    await second.acc.focus();
    await page.keyboard.press('Space');
    await expect(second.back).toBeFocused();
    expect(await nestedOpen(page), 'chỉ 1 cấp 2 mở').toBe(1);
  });

  test('Esc ở cấp 2 đóng cả drawer, focus về nút menu; mở lại về cấp 1, không còn inert', async ({ page }) => {
    const { errors } = await mount(page);
    const toggle = await openDrawer(page);
    const { acc, back, panel } = levelOf(page, 0);
    await acc.click();
    await expect(back).toBeFocused();
    await page.keyboard.press('Escape');
    await expect.poll(() => isModal(page)).toBe(false);
    await expect(toggle).toBeFocused();
    await expect.poll(() => nestedOpen(page)).toBe(0);
    expect(await inertCount(page)).toBe(0);

    await toggle.click();
    await expect.poll(() => isModal(page)).toBe(true);
    await expect(panel).toBeHidden();
    await expect(acc).toHaveAttribute('aria-expanded', 'false');
    await expect(drawerOf(page).locator('#HeaderDrawerTitle')).toBeFocused();
    expect(errors).toEqual([]);
  });

  test('× trong đầu cấp 2 đóng drawer, focus về nút menu; chạm scrim đóng', async ({ page }) => {
    await mount(page);
    const toggle = await openDrawer(page);
    const { acc, panel } = levelOf(page, 0);
    await acc.click();
    await panel.getByRole('button', { name: 'Close menu' }).click();
    await expect.poll(() => isModal(page)).toBe(false);
    await expect(toggle).toBeFocused();

    await toggle.click();
    await expect.poll(() => isModal(page)).toBe(true);
    const size = page.viewportSize()!;
    await page.mouse.click(size.width - 5, size.height / 2);
    await expect.poll(() => isModal(page)).toBe(false);
    await expect(toggle).toBeFocused();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('AC10: hàng localization ở chân drawer mở thành cấp 2 trong cùng drawer, focus Back, không mở lớp thứ hai; Back về hàng localization', async ({ page }) => {
    const { errors } = await mount(page);
    await openDrawer(page);
    const locale = drawerOf(page).getByTestId(T.locale);
    const summary = locale.locator('summary');
    const panel = locale.getByTestId(T.level);
    await summary.click();
    await expect(panel).toBeVisible();
    await expect(panel.getByTestId(T.back)).toBeFocused();
    await expect(summary).toHaveAttribute('aria-expanded', 'true');
    expect(await page.evaluate(() => document.querySelectorAll('dialog:modal').length), 'không lớp thứ hai').toBe(1);
    // Panel phủ trong drawer: nằm trong hộp của drawer. Đo sau khi hết hiệu ứng trượt (TE-1 AC2 "cấp 2 trượt", base.css
    // drawer-level-in từ translate 100%): giữa chừng panel còn lệch ra ngoài mép drawer (bị overflow: hidden của drawer cắt).
    await panel.evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)));
    const d = (await drawerOf(page).boundingBox())!;
    const p = (await panel.boundingBox())!;
    expect(p.x).toBeGreaterThanOrEqual(d.x - 1);
    expect(p.x + p.width).toBeLessThanOrEqual(d.x + d.width + 1);
    // Mục là nút submit của form localization (đổi được không cần JS, không có nút Apply)
    await expect(panel.getByTestId(T.country).first()).toHaveAttribute('type', 'submit');
    expect(await isInert(panel.getByTestId(T.country).nth(1))).toBe(false);
    expect(await isInert(drawerOf(page).getByTestId('header-drawer-account'))).toBe(true);

    await panel.getByTestId(T.back).click();
    await expect(panel).toBeHidden();
    await expect(summary).toBeFocused();
    expect(await inertCount(page)).toBe(0);
    expect(errors).toEqual([]);
  });

  test('chạm trước khi header-drawer.js về: <details> mở drawer bằng CSS, accordion tại chỗ; tải xong nâng lên showModal, về cấp 1, focus vào drawer', async ({ page }) => {
    const { errors } = await mount(page, { delayDrawer: 1500 });
    const toggle = page.getByTestId(T.toggle);
    await toggle.click();
    await expect(drawerOf(page)).toBeVisible();
    expect(await isModal(page), 'chưa có module: chưa showModal').toBe(false);
    await expect(header(page)).not.toHaveAttribute('data-drawer-enhanced');
    // Bản không JS: cấp 2 là accordion tại chỗ, phần đầu cấp 2 (Back) ẩn
    const { acc, panel, back } = levelOf(page, 0);
    await acc.click();
    await expect(panel).toBeVisible();
    await expect(back).toBeHidden();

    await enhanced(page);
    await expect.poll(() => isModal(page)).toBe(true);
    expect(await rootOpen(page)).toBe(true);
    await expect.poll(() => nestedOpen(page), 'nâng cấp: gập accordion, về cấp 1').toBe(0);
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(await activeIn(drawerOf(page)), 'focus vào drawer sau nâng cấp').toBe(true);
    await page.keyboard.press('Escape');
    await expect.poll(() => isModal(page)).toBe(false);
    await expect(toggle).toBeFocused();
    expect(errors).toEqual([]);
  });

  test('lỗi tải header-drawer.js: drawer vẫn mở/đóng bằng <details>, cấp 2 accordion; chạm lại thì thử tải lại; 0 lỗi JS', async ({ page }) => {
    const { errors, requests } = await mount(page, { failDrawer: true });
    const toggle = page.getByTestId(T.toggle);
    await toggle.focus();
    await expect.poll(() => drawerJsLoads(requests)).toBe(1);
    await page.waitForTimeout(200); // catch() bỏ promise lỗi
    await page.getByTestId('page-link').focus();
    await toggle.focus();
    await expect.poll(() => drawerJsLoads(requests), 'promise lỗi bị bỏ, lần chạm sau thử lại').toBe(2);

    await toggle.click();
    await expect(drawerOf(page)).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false'); // chưa có module: chỉ giá trị lúc tải
    const { acc, panel, back } = levelOf(page, 0);
    await acc.click();
    await expect(panel.getByRole('link').first()).toBeVisible();
    await expect(back).toBeHidden();
    // Chưa nâng cấp: summary là scrim toàn màn (CSS), chạm phần trang bên phải drawer là đóng
    const size = page.viewportSize()!;
    await page.mouse.click(size.width - 5, size.height / 2);
    await expect(drawerOf(page)).toBeHidden();
    await expect(header(page)).not.toHaveAttribute('data-drawer-enhanced');
    expect(await page.evaluate(() => !!customElements.get('header-drawer'))).toBe(false);
    expect(errors).toEqual([]);
  });

  test('đang đóng (chờ hiệu ứng) mà mở lại ngay: drawer giữ mở, details không bị gập', async ({ page }) => {
    await mount(page);
    const toggle = await openDrawer(page);
    await page.keyboard.press('Escape');
    await expect(toggle).toBeFocused();
    await toggle.click();
    await expect.poll(() => isModal(page)).toBe(true);
    await page.waitForTimeout(600);
    expect(await isModal(page)).toBe(true);
    expect(await rootOpen(page)).toBe(true);
    await expect(drawerOf(page)).toBeVisible();
  });

  /** touchstart/touchend tổng hợp trên phần tử (Chromium có Touch khi hasTouch). */
  const swipe = (el: Locator, dx: number, dy = 0) =>
    el.evaluate(
      (node, [dx, dy]) => {
        const r = node.getBoundingClientRect();
        const x = r.left + r.width / 2;
        const y = r.top + 10;
        const t = (cx: number, cy: number) => new Touch({ identifier: 1, target: node, clientX: cx, clientY: cy });
        node.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, touches: [t(x, y)], changedTouches: [t(x, y)] }));
        node.dispatchEvent(new TouchEvent('touchend', { bubbles: true, touches: [], changedTouches: [t(x + dx, y + dy)] }));
      },
      [dx, dy]
    );

  test('vuốt về mép trái > 80px đóng, trả focus; vuốt ngắn, vuốt dọc, vuốt ngược không đóng', async ({ page }) => {
    const { errors } = await mount(page);
    const toggle = await openDrawer(page);
    const row = drawerOf(page).getByTestId('header-menu-item').last();
    await swipe(row, -40);
    await swipe(row, -100, 160);
    await swipe(row, 120);
    expect(await isModal(page)).toBe(true);
    await swipe(row, -120, 20);
    await expect.poll(() => isModal(page)).toBe(false);
    await expect(toggle).toBeFocused();
    expect(errors).toEqual([]);
  });

  test('lên 80rem khi drawer đang mở ở cấp 2: đóng, aria-expanded false, không còn inert, khoá cuộn gỡ', async ({ page }) => {
    await mount(page);
    const toggle = await openDrawer(page);
    await levelOf(page, 0).acc.click();
    await expect(levelOf(page, 0).back).toBeFocused();
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect.poll(() => isModal(page)).toBe(false);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(await rootOpen(page)).toBe(false);
    expect(await nestedOpen(page)).toBe(0);
    expect(await inertCount(page)).toBe(0);
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflowY)).not.toBe('hidden');
    await page.setViewportSize({ width: 412, height: 839 });
    await expect(drawerOf(page)).toBeHidden();
  });

  test('theme editor render lại host: gỡ <header-drawer> gỡ data-drawer-enhanced; gắn lại không nhân đôi listener', async ({ page }) => {
    const { errors } = await mount(page);
    const toggle = await openDrawer(page);
    await page.keyboard.press('Escape');
    await expect.poll(() => rootOpen(page)).toBe(false);
    await page.evaluate(() => {
      const w = window as unknown as { __opens: number };
      w.__opens = 0;
      document.addEventListener('modal:open', () => w.__opens++);
      const host = document.querySelector('header-drawer')!;
      const parent = host.parentNode!;
      host.remove();
      if (document.querySelector('[data-testid="header"]')!.hasAttribute('data-drawer-enhanced')) throw new Error('còn data-drawer-enhanced sau khi gỡ');
      parent.appendChild(host);
    });
    await enhanced(page);
    await toggle.click();
    await expect.poll(() => isModal(page)).toBe(true);
    const { acc, back } = levelOf(page, 0);
    await acc.click();
    await expect(back).toBeFocused();
    await back.click();
    await expect(acc).toBeFocused();
    expect(await page.evaluate(() => (window as unknown as { __opens: number }).__opens)).toBe(1);
    expect(errors).toEqual([]);
  });
});

// ---------- Storefront (preview) ----------
test.describe('ES1-T323 storefront', () => {
  test.beforeEach(({}, ti) => test.skip(ti.project.name !== 'mobile', 'drawer chỉ có dưới 80rem'));

  test('trang chủ: không thẻ script header-drawer.js, tải khi focus nút menu; mở, cấp 2 + Back, Esc; axe 0 serious/critical; 0 lỗi console', async ({ page }) => {
    const errors: string[] = [];
    const isShopPay403 = watchShopPay403(page);
    page.on('console', (msg) => {
      if (msg.type() !== 'error' || isShopPay403(msg)) return;
      if (IGNORE_CONSOLE.some((r) => r.test(msg.text()) || r.test(msg.location().url))) return;
      errors.push(`${msg.text()} @ ${msg.location().url}`);
    });
    page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
    await page.goto('/');
    await expectNotChallenged(page);
    const toggle = page.getByTestId(T.toggle);
    test.skip((await toggle.count()) === 0, 'main-menu store dev rỗng');
    expect(await page.locator('script[src*="/header-drawer"]').count(), 'không thẻ script riêng').toBe(0);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await openDrawer(page);
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const drawer = drawerOf(page);
    await expect(drawer.locator('#HeaderDrawerTitle')).toBeFocused();

    if ((await drawer.getByTestId(T.acc).count()) > 0) {
      const { acc, panel, back } = levelOf(page, 0);
      await acc.click();
      await expect(panel).toBeVisible();
      await expect(back).toBeFocused();
      await expect(back).toHaveAccessibleName(/\S/);
      await expectNotChallenged(page);
      const axe = await new AxeBuilder({ page }).include('[data-testid="header-drawer"]').analyze();
      const bad = axe.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? '')).map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
      expect(bad, 'axe cấp 2 mở').toEqual([]);
      await back.click();
      await expect(acc).toBeFocused();
    }
    const locale = drawer.getByTestId(T.locale);
    if ((await locale.count()) > 0) {
      await locale.locator('summary').click();
      await expect(locale.getByTestId(T.back)).toBeFocused();
      expect(await page.evaluate(() => document.querySelectorAll('dialog:modal').length)).toBe(1);
      await locale.getByTestId(T.back).click();
    }

    await page.keyboard.press('Escape');
    await expect.poll(() => isModal(page)).toBe(false);
    await expect(toggle).toBeFocused();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(errors).toEqual([]);
  });
});
