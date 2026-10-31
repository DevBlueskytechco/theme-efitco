// KHÔNG CHẮC: spec chưa chạy trên preview và chưa type-check (không có node_modules, PREVIEW_URL, STORE_PASSWORD trong phiên viết). Kết quả thật lấy từ CI e2e trên PR.
// Ticket ES1-T23 (2727475000000133014) — E2E TE-1 trên develop, chuyển từ ES1-T5, AC theo docs/srs.md#TE-1 (AC1..AC9).
// Không lặp ES1-T16.spec.ts (hành vi JS header/drawer/sticky) và smoke.spec.ts (status, console khi tải, axe trạng thái mặc định).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T23.spec.ts
// Biến tuỳ chọn: EXPECT_ANNOUNCEMENT=off|text|link (mặc định off), EXPECT_MENU_ITEMS=<n>
import { test, expect, type Page, type TestInfo } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const T = {
  bar: 'announcement-bar',
  barLink: 'announcement-bar-link',
  header: 'header',
  logo: 'header-logo',
  nav: 'header-menu',
  item: 'header-menu-item',
  toggle: 'header-menu-toggle',
  submenu: 'header-submenu',
  drawerToggle: 'header-drawer-toggle',
  drawer: 'header-drawer',
  drawerClose: 'header-drawer-close',
  drawerAcc: 'header-drawer-accordion-toggle',
  drawerSub: 'header-drawer-submenu',
  account: 'header-account',
  search: 'header-search-link',
  cart: 'header-cart-link',
  cartCount: 'header-cart-count',
  footer: 'footer',
  footerMenuLink: 'footer-menu-link',
  social: 'footer-social-link',
  payment: 'footer-payment-icon',
  nlForm: 'footer-newsletter-form',
  nlEmail: 'footer-newsletter-email',
  nlSubmit: 'footer-newsletter-submit',
  nlSuccess: 'footer-newsletter-success',
  nlError: 'footer-newsletter-error',
  country: 'footer-country-selector',
  countryOpt: 'footer-country-option',
  language: 'footer-language-selector',
  languageOpt: 'footer-language-option',
} as const;

const ROOT = process.cwd();
const FONT_HEADING = /^["']?Sofia Sans Condensed/i;
const FONT_BODY = /^["']?Inter\b/i;

// Giống smoke.spec.ts: lỗi console không thuộc theme.
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];

const tokens = JSON.parse(readFileSync(join(ROOT, 'docs', 'tokens.json'), 'utf8')) as { color: Record<string, string> };

function rgb(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})`;
}

const isDesktop = (ti: TestInfo) => ti.project.name === 'desktop';
const seriousOrCritical = (v: { impact?: string | null }) => ['serious', 'critical'].includes(v.impact ?? '');

function blockSchema(file: string): { settings?: Array<{ id?: string; type: string; default?: unknown }> } {
  const src = readFileSync(join(ROOT, 'blocks', file), 'utf8');
  const m = src.match(/{%-?\s*schema\s*-?%}([\s\S]*?){%-?\s*endschema\s*-?%}/);
  expect(m, `${file} không có schema`).not.toBeNull();
  return JSON.parse(m![1]);
}

function settingsSchema() {
  return JSON.parse(readFileSync(join(ROOT, 'config', 'settings_schema.json'), 'utf8')) as Array<{ name: string; settings?: Array<{ type: string; id?: string; label?: string; default?: unknown }> }>;
}

async function pathOf(page: Page, href: string | null): Promise<string> {
  expect(href, 'href rỗng').toBeTruthy();
  return new URL(href!, page.url()).pathname;
}

type Product = { handle: string; variantId: number; hasImage: boolean; hasDescription: boolean };

// Dữ liệu TE-9: không có sản phẩm thì trả null, test tự skip phần liên quan.
async function findProduct(page: Page): Promise<Product | null> {
  const res = await page.request.get('/products.json?limit=50');
  if (!res.ok()) return null;
  const data = (await res.json().catch(() => null)) as { products?: Array<{ handle: string; body_html: string | null; images: unknown[]; variants: Array<{ id: number; available: boolean }> }> } | null;
  const available = (data?.products ?? []).filter(p => p.variants.some(v => v.available));
  const p = available.find(x => x.images.length > 0 && x.body_html) ?? available[0];
  if (!p) return null;
  return { handle: p.handle, variantId: p.variants.find(v => v.available)!.id, hasImage: p.images.length > 0, hasDescription: !!p.body_html };
}

async function parentItem(page: Page) {
  const nav = page.getByTestId(T.nav);
  test.skip((await nav.getByTestId(T.toggle).count()) === 0, 'main-menu store dev chưa có mục cấp 2');
  const item = nav.getByTestId(T.item).filter({ has: page.getByTestId(T.toggle) }).first();
  return { item, toggle: item.getByTestId(T.toggle), submenu: item.getByTestId(T.submenu) };
}

async function openDrawer(page: Page) {
  const toggle = page.getByTestId(T.drawerToggle);
  test.skip((await toggle.count()) === 0, 'main-menu store dev rỗng');
  await toggle.click();
  const drawer = page.getByTestId(T.drawer);
  await expect(drawer).toBeVisible();
  return { toggle, drawer };
}

// Giá trị computed của một biến CSS, đọc qua phần tử tạm.
async function cssVar(page: Page, name: string): Promise<string> {
  return page.evaluate((v) => {
    const probe = document.createElement('div');
    document.body.append(probe);
    probe.style.color = `var(${v})`;
    const value = getComputedStyle(probe).color;
    probe.remove();
    return value;
  }, name);
}

// Hero TE-2 chưa merge: giả lập hook data-header-overlay trong con đầu của main (cùng cách ES1-T16.spec.ts).
async function simulateHero(page: Page) {
  await page.evaluate(() => {
    const hook = document.createElement('div');
    hook.setAttribute('data-header-overlay', '');
    document.querySelector('main')?.firstElementChild?.append(hook);
  });
}

async function scrollTo(page: Page, y: number) {
  await page.evaluate(top => window.scrollTo({ top, behavior: 'instant' }), y);
}

async function axeChrome(page: Page) {
  const b = new AxeBuilder({ page });
  for (const id of [T.bar, T.header, T.footer]) {
    if (await page.getByTestId(id).count()) b.include(`[data-testid="${id}"]`);
  }
  return (await b.analyze()).violations.filter(seriousOrCritical).map(v => `${v.id}: ${v.nodes.map(n => n.target.join(' ')).join(', ')}`);
}

// Nút gộp USD / EN chưa có data-testid (đã tạo ticket dev-fe): tạm tìm theo form localization, không theo class.
function localization(page: Page) {
  const form = page.getByTestId(T.footer).locator('form[action*="localization"]');
  return { form, summary: form.locator('summary') };
}

// Đổi sang lựa chọn chưa chọn, trả về value để đối chiếu sau khi tải lại.
async function chooseOther(page: Page, optId: string): Promise<string | null> {
  const others = page.getByTestId(optId).and(page.locator(':not([aria-current="true"])'));
  if ((await others.count()) === 0) return null;
  const option = others.first();
  const value = await option.getAttribute('value');
  await localization(page).summary.click();
  await option.click();
  return value;
}

async function submitNewsletter(page: Page) {
  const before = page.url();
  await page.getByTestId(T.nlForm).getByTestId(T.nlSubmit).click();
  await page.waitForURL(u => u.href !== before);
  test.skip(/\/challenge/.test(page.url()), 'hCaptcha chặn submit tự động, chạy tay (xem test-cases.md)');
}

test.describe('ES1-T23', () => {
  // ---------- AC1 ----------
  test('TC-01 AC1 token qua css-variables, giá trị mặc định tokens.json', async ({ page }) => {
    test.slow();
    const product = await findProduct(page);
    const paths = ['/', '/collections/all', '/cart', ...(product ? [`/products/${product.handle}`] : [])];
    for (const path of paths) {
      await page.goto(path);
      expect(await cssVar(page, '--color-background'), `${path} --color-background`).toBe(rgb(tokens.color.background));
      expect(await cssVar(page, '--color-foreground'), `${path} --color-foreground`).toBe(rgb(tokens.color.foreground));
      expect(await cssVar(page, '--color-accent'), `${path} --color-accent`).toBe(rgb(tokens.color.accent));
      const r = await page.evaluate(() => {
        const inline = Array.from(document.querySelectorAll('style')).map(s => s.textContent ?? '').join('\n');
        const body = getComputedStyle(document.body);
        return {
          font: /--font-[\w-]+\s*:/.test(inline),
          space: /--space-[\w-]+\s*:/.test(inline),
          radius: /--radius-[\w-]+\s*:/.test(inline),
          bodyBg: body.backgroundColor,
          bodyFg: body.color,
        };
      });
      expect({ font: r.font, space: r.space, radius: r.radius }, `${path} thiếu nhóm biến`).toEqual({ font: true, space: true, radius: true });
      expect(r.bodyBg, `${path} nền body không lấy từ --color-background`).toBe(rgb(tokens.color.background));
      expect(r.bodyFg, `${path} chữ body không lấy từ --color-foreground`).toBe(rgb(tokens.color.foreground));
    }
  });

  test('TC-02 AC1 CSS không hardcode màu, font, bo góc', async ({}, ti) => {
    test.skip(!isDesktop(ti), 'static, chạy 1 lần');
    const dir = join(ROOT, 'assets');
    const bad: string[] = [];
    for (const f of readdirSync(dir).filter(n => n.endsWith('.css'))) {
      const src = readFileSync(join(dir, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '));
      src.split('\n').forEach((line, i) => {
        const at = `${f}:${i + 1} ${line.trim()}`;
        const decl = line.includes(':') && !/\{\s*$/.test(line);
        if (decl && /#[0-9a-fA-F]{3,8}\b/.test(line)) bad.push(at);
        else if (/\b(?:rgba?|hsla?)\((?!\s*var\()/.test(line)) bad.push(at);
        else if (/:\s*(?:white|black)\b/i.test(line)) bad.push(at);
        // (?!\s) chặn \s* lùi về 0 ký tự rồi lọt qua lookahead
        else if (/font-family\s*:\s*(?!\s|var\(|inherit)/.test(line)) bad.push(at);
        else if (/border-radius\s*:\s*(?!\s|var\(|0(?:px)?\s*[;}]|50%|inherit)/.test(line)) bad.push(at);
      });
    }
    expect(bad, 'giá trị hardcode trong assets/*.css').toEqual([]);
  });

  test('TC-04 AC1 settings_schema đủ màu, space, radius, label t:', async ({}, ti) => {
    test.skip(!isDesktop(ti), 'static, chạy 1 lần');
    const all = settingsSchema().flatMap(g => g.settings ?? []);
    const colors = all.filter(s => s.type === 'color');
    expect(colors.length, 'R16: cần ≥ 4 setting color').toBeGreaterThanOrEqual(4);
    for (const key of ['background', 'foreground', 'accent', 'muted', 'border']) {
      expect(colors.some(s => (s.id ?? '').includes(key)), `ADR 0001: thiếu màu ${key}`).toBeTruthy();
    }
    expect(all.some(s => /space/.test(s.id ?? '')), 'thiếu setting space').toBeTruthy();
    expect(all.filter(s => /radius/.test(s.id ?? '')).length, 'ADR 0001: 3 setting radius').toBeGreaterThanOrEqual(3);
    const noT = all.filter(s => s.label !== undefined && !s.label.startsWith('t:')).map(s => s.id);
    expect(noT, 'label không dùng t:').toEqual([]);
  });

  // ---------- AC2 desktop ----------
  test('TC-05 AC2 nav desktop đủ mục cấp 1, 1 hàng, không tràn', async ({ page }, ti) => {
    test.skip(!isDesktop(ti), 'desktop');
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    const items = page.getByTestId(T.nav).getByTestId(T.item);
    const n = await items.count();
    test.skip(n === 0, 'main-menu store dev rỗng');
    if (process.env.EXPECT_MENU_ITEMS) expect(n).toBe(Number(process.env.EXPECT_MENU_ITEMS));
    const tops = new Set<number>();
    for (const it of await items.all()) tops.add(Math.round((await it.boundingBox())!.y));
    expect(tops.size, 'mục cấp 1 xuống nhiều hàng').toBe(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(1280);
  });

  test('TC-06 AC2 hover mở dropdown cấp 2', async ({ page }, ti) => {
    test.skip(!isDesktop(ti), 'desktop');
    await page.goto('/');
    const { item, toggle, submenu } = await parentItem(page);
    await expect(submenu).toBeHidden();
    await item.hover();
    await expect(submenu).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(await submenu.getByRole('link').count()).toBeGreaterThan(0);
  });

  test('TC-07 TC-09 AC2 Enter mở, Tab vào submenu, Esc đóng và trả focus', async ({ page }, ti) => {
    test.skip(!isDesktop(ti), 'desktop');
    await page.goto('/');
    const { toggle, submenu } = await parentItem(page);
    await toggle.focus();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(submenu).toBeVisible();
    expect(await toggle.getAttribute('aria-controls')).toBe(await submenu.getAttribute('id'));
    await page.keyboard.press('Tab');
    expect(await submenu.evaluate(el => el.contains(document.activeElement)), 'Tab không vào submenu').toBeTruthy();
    await page.keyboard.press('Escape');
    await expect(submenu).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
  });

  test('TC-08 AC2 Space mở dropdown, không cuộn trang', async ({ page }, ti) => {
    test.skip(!isDesktop(ti), 'desktop');
    await page.goto('/');
    const { toggle, submenu } = await parentItem(page);
    await toggle.focus();
    const y = await page.evaluate(() => window.scrollY);
    await page.keyboard.press('Space');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(submenu).toBeVisible();
    expect(await page.evaluate(() => window.scrollY)).toBe(y);
  });

  test('TC-10 AC2 mục không có con là link thường', async ({ page }, ti) => {
    test.skip(!isDesktop(ti), 'desktop');
    await page.goto('/');
    const plain = page.getByTestId(T.nav).getByTestId(T.item).filter({ hasNot: page.getByTestId(T.toggle) });
    test.skip((await plain.count()) === 0, 'main-menu store dev không có mục không con');
    const link = plain.first().getByRole('link').first();
    expect(await link.getAttribute('aria-expanded')).toBeNull();
    const target = await pathOf(page, await link.getAttribute('href'));
    await link.click();
    await page.waitForURL(u => u.pathname === target);
  });

  test('TC-15 AC2 schema header menu default main-menu', async ({}, ti) => {
    test.skip(!isDesktop(ti), 'static, chạy 1 lần');
    const menu = blockSchema('header.liquid').settings?.find(s => s.id === 'menu');
    expect(menu?.type).toBe('link_list');
    expect(menu?.default, 'R14: link_list cần default').toBe('main-menu');
  });

  // ---------- AC2 mobile ----------
  test('TC-11 TC-12 TC-14 AC2 drawer mobile mở, đóng bằng Esc và nút close', async ({ page }, ti) => {
    test.skip(isDesktop(ti), 'mobile');
    test.slow();
    for (const width of [360, page.viewportSize()!.width]) {
      await page.setViewportSize({ width, height: 780 });
      await page.goto('/');
      await expect(page.getByTestId(T.nav), `${width}: nav desktop phải ẩn`).toBeHidden();
      const before = page.getByTestId(T.drawerToggle);
      test.skip((await before.count()) === 0, 'main-menu store dev rỗng');
      await expect(before).toBeVisible();
      await expect(before).toHaveAccessibleName(/\S/);
      await expect(before).toHaveAttribute('aria-expanded', 'false');

      const { toggle, drawer } = await openDrawer(page);
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      const navItems = await page.getByTestId(T.nav).getByTestId(T.item).count();
      expect(await drawer.getByTestId(T.item).count(), 'số mục cấp 1 drawer ≠ nav').toBe(navItems);

      await page.keyboard.press('Escape');
      await expect(drawer).toBeHidden();
      await expect(toggle).toBeFocused();

      await toggle.click();
      await expect(drawer).toBeVisible();
      await drawer.getByTestId(T.drawerClose).click();
      await expect(drawer).toBeHidden();
      await expect(toggle).toBeFocused();
    }
  });

  test('TC-13 AC2 accordion cấp 2 trong drawer', async ({ page }, ti) => {
    test.skip(isDesktop(ti), 'mobile');
    await page.goto('/');
    const { drawer } = await openDrawer(page);
    test.skip((await drawer.getByTestId(T.drawerAcc).count()) === 0, 'main-menu store dev chưa có mục cấp 2');
    const acc = drawer.getByTestId(T.drawerAcc).first();
    const subId = await acc.getAttribute('aria-controls');
    expect(subId, 'accordion thiếu aria-controls').toBeTruthy();
    const sub = drawer.locator(`[id="${subId}"]`);
    await expect(sub).toHaveAttribute('data-testid', T.drawerSub);
    await acc.click();
    await expect(acc).toHaveAttribute('aria-expanded', 'true');
    await expect(sub).toBeVisible();
    expect(await sub.getByRole('link').count()).toBeGreaterThan(0);
    await acc.click();
    await expect(acc).toHaveAttribute('aria-expanded', 'false');
    await expect(sub).toBeHidden();
  });

  // ---------- AC3 ----------
  test('TC-16 TC-17 AC3 shopify-account trong header', async ({ page }) => {
    await page.goto('/');
    const account = page.getByTestId(T.header).getByTestId(T.account);
    test.skip((await account.count()) === 0, 'store dev tắt customer accounts');
    await expect(account).toHaveCount(1);
    await expect(account).toBeVisible();
    expect(await account.evaluate(el => el.tagName.toLowerCase())).toBe('shopify-account');
  });

  test('TC-18 AC3 cart link + số lượng', async ({ page }) => {
    const product = await findProduct(page);
    test.skip(!product, 'store dev không có sản phẩm còn hàng');
    await page.goto('/');
    await page.request.post('/cart/clear.js');
    const add = await page.request.post('/cart/add.js', { data: { items: [{ id: product!.variantId, quantity: 2 }] } });
    expect(add.ok()).toBeTruthy();
    await page.reload();
    const cart = page.getByTestId(T.header).getByTestId(T.cart);
    await expect(cart).toBeVisible();
    expect(await pathOf(page, await cart.getAttribute('href'))).toMatch(/\/cart$/);
    await expect(cart.getByTestId(T.cartCount)).toHaveText(/\b2\b/);
    await expect(cart).toHaveAccessibleName(/2/);
  });

  test('TC-19 AC3 search link', async ({ page }) => {
    await page.goto('/');
    const search = page.getByTestId(T.header).getByTestId(T.search);
    await expect(search).toBeVisible();
    const target = await pathOf(page, await search.getAttribute('href'));
    expect(target).toMatch(/\/search$/);
    await expect(search).toHaveAccessibleName(/\S/);
    await search.click();
    await page.waitForURL(u => u.pathname === target);
  });

  // ---------- AC4 ----------
  test('TC-21 AC4 text rỗng thì không có announcement bar', async ({ page }) => {
    test.skip((process.env.EXPECT_ANNOUNCEMENT ?? 'off') !== 'off', 'store đang bật announcement');
    for (const path of ['/', '/collections/all']) {
      await page.goto(path);
      await expect(page.getByTestId(T.bar), path).toHaveCount(0);
    }
  });

  test('TC-21b AC4 schema không default, bar khai báo trước header', async ({}, ti) => {
    test.skip(!isDesktop(ti), 'static, chạy 1 lần');
    const text = blockSchema('announcement-bar.liquid').settings?.find(s => s.id === 'text');
    expect(text, 'thiếu setting text').toBeTruthy();
    expect(text?.default, 'mặc định phải rỗng').toBeUndefined();
    const link = blockSchema('announcement-bar.liquid').settings?.find(s => s.id === 'link');
    expect(link?.type).toBe('url');
    const layout = readFileSync(join(ROOT, 'layout', 'theme.liquid'), 'utf8');
    expect(layout.indexOf("block 'announcement-bar'"), 'layout thiếu announcement-bar').toBeGreaterThan(-1);
    expect(layout.indexOf("block 'announcement-bar'"), 'bar phải đứng trước header').toBeLessThan(layout.indexOf("block 'header'"));
  });

  test('TC-22 TC-23 AC4 có text thì bar trên header, link tuỳ chọn', async ({ page }) => {
    const mode = process.env.EXPECT_ANNOUNCEMENT ?? 'off';
    test.skip(mode === 'off', 'cần theme preview có text, EXPECT_ANNOUNCEMENT=text|link');
    await page.goto('/');
    const bar = page.getByTestId(T.bar);
    await expect(bar).toHaveCount(1);
    await expect(bar).toBeVisible();
    await expect(bar).toHaveText(/\S/);
    const b = (await bar.boundingBox())!;
    const h = (await page.getByTestId(T.header).boundingBox())!;
    expect(b.y + b.height, 'bar phải nằm trên header').toBeLessThanOrEqual(h.y + 1);
    if (mode === 'text') {
      await expect(bar.locator('a')).toHaveCount(0);
      return;
    }
    const link = bar.getByTestId(T.barLink);
    await expect(link).toHaveCount(1);
    await expect(link).toHaveAccessibleName((await bar.innerText()).trim());
    const target = await pathOf(page, await link.getAttribute('href'));
    await link.click();
    await page.waitForURL(u => u.pathname === target);
  });

  // ---------- AC5 ----------
  test('TC-30 AC5 selector chỉ hiện khi có ≥ 2 lựa chọn', async ({ page }) => {
    await page.goto('/');
    const f = page.getByTestId(T.footer);
    const pairs: Array<[string, string]> = [[T.country, T.countryOpt], [T.language, T.languageOpt]];
    let shown = 0;
    for (const [sel, opt] of pairs) {
      const n = await f.getByTestId(opt).count();
      if ((await f.getByTestId(sel).count()) === 0) {
        expect(n, `${sel} ẩn nhưng còn lựa chọn`).toBe(0);
        continue;
      }
      shown++;
      expect(n, `${sel} hiện nhưng < 2 lựa chọn`).toBeGreaterThanOrEqual(2);
    }
    await expect(localization(page).form, 'form localization chỉ có khi có selector').toHaveCount(shown > 0 ? 1 : 0);
  });

  test('TC-28 AC5 đổi nước', async ({ page }) => {
    await page.goto('/collections/all');
    test.skip((await page.getByTestId(T.countryOpt).count()) < 2, 'store dev bán 1 nước');
    for (const o of await page.getByTestId(T.countryOpt).all()) {
      expect((await o.textContent()) ?? '', 'lựa chọn nước thiếu mã tiền tệ').toMatch(/\b[A-Z]{3}\b/);
    }
    const value = await chooseOther(page, T.countryOpt);
    test.skip(!value, 'không có nước khác để chọn');
    await expect(page.getByTestId(T.countryOpt).and(page.locator(`[value="${value}"]`))).toHaveAttribute('aria-current', 'true');
    expect(new URL(page.url()).pathname, 'return_to sai').toMatch(/\/collections\/all$/);
  });

  test('TC-29 AC5 đổi ngôn ngữ', async ({ page }) => {
    await page.goto('/collections/all');
    test.skip((await page.getByTestId(T.languageOpt).count()) < 2, 'store dev có 1 ngôn ngữ');
    const value = await chooseOther(page, T.languageOpt);
    test.skip(!value, 'không có ngôn ngữ khác để chọn');
    await expect(page.locator('html')).toHaveAttribute('lang', value!);
    expect(new URL(page.url()).pathname, 'thiếu tiền tố locale').toContain(`/${value!.toLowerCase()}`);
  });

  // ---------- AC6 ----------
  test('TC-32a AC6 form newsletter đúng cấu trúc', async ({ page }) => {
    await page.goto('/');
    const form = page.getByTestId(T.nlForm);
    await expect(form.locator('input[name="contact[tags]"]')).toHaveValue(/newsletter/);
    const email = form.getByTestId(T.nlEmail);
    await expect(email).toHaveAccessibleName(/\S/);
    await expect(email).toHaveAttribute('type', 'email');
    await expect(form.getByTestId(T.nlSubmit)).toHaveAccessibleName(/\S/);
  });

  test('TC-32 AC6 newsletter thành công', async ({ page }, ti) => {
    await page.goto('/');
    await page.getByTestId(T.nlEmail).fill(`qa+es1t23-${ti.project.name}-${Date.now()}@example.com`);
    await submitNewsletter(page);
    expect(page.url()).toMatch(/customer_posted=true/);
    await expect(page.getByTestId(T.nlSuccess)).toBeVisible();
    await expect(page.getByTestId(T.nlSuccess)).toHaveText(/\S/);
  });

  test('TC-33 AC6 newsletter lỗi từ server', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId(T.nlForm).evaluate(f => ((f as HTMLFormElement).noValidate = true));
    await page.getByTestId(T.nlEmail).fill('khong-phai-email');
    await submitNewsletter(page);
    const err = page.getByTestId(T.nlError);
    await expect(err).toBeVisible();
    await expect(err).toHaveText(/\S/);
    const errId = await err.getAttribute('id');
    expect(errId, 'thông báo lỗi thiếu id').toBeTruthy();
    expect(await page.getByTestId(T.nlEmail).getAttribute('aria-describedby')).toContain(errId!);
    await expect(page.getByTestId(T.nlEmail)).toHaveValue('khong-phai-email');
  });

  test('TC-35 AC6 menu footer', async ({ page }, ti) => {
    if (isDesktop(ti)) {
      const menu = blockSchema('footer.liquid').settings?.find(s => s.id === 'menu');
      expect(menu?.default, 'menu footer cần default footer').toBe('footer');
    }
    await page.goto('/');
    const links = page.getByTestId(T.footer).getByTestId(T.footerMenuLink);
    test.skip((await links.count()) === 0, 'menu footer store dev rỗng');
    for (const l of await links.all()) {
      await expect(l).toHaveText(/\S/);
      expect(await l.getAttribute('href')).toBeTruthy();
    }
  });

  test('TC-36 AC6 social icons', async ({ page }) => {
    await page.goto('/');
    const links = page.getByTestId(T.footer).getByTestId(T.social);
    test.skip((await links.count()) === 0, 'store dev chưa nhập URL social');
    for (const s of await links.all()) {
      expect(await s.getAttribute('href')).toMatch(/^https?:\/\//);
      await expect(s).toHaveAccessibleName(/\S/);
    }
  });

  test('TC-37 AC6 payment icons đủ màu', async ({ page }) => {
    await page.goto('/');
    const pays = await page.getByTestId(T.footer).getByTestId(T.payment).all();
    test.skip(pays.length === 0, 'store dev chưa bật payment type');
    for (const p of pays) {
      const svg = p.locator('svg');
      await expect(svg.locator('title')).toHaveCount(1);
      const fills = await svg.evaluate(el => new Set(Array.from(el.querySelectorAll('[fill]')).map(n => n.getAttribute('fill')?.toLowerCase())).size);
      expect(fills, 'payment icon đơn sắc').toBeGreaterThan(1);
    }
  });

  // ---------- AC7 ----------
  test('TC-38 TC-39 TC-40 AC7 lang + meta-tags + page_image', async ({ page }) => {
    test.slow();
    const product = await findProduct(page);
    const paths = ['/', '/collections/all', '/search?q=a', '/cart', ...(product ? [`/products/${product.handle}`] : [])];
    for (const path of paths) {
      await page.goto(path);
      const lang = await page.locator('html').getAttribute('lang');
      const shopLocale = await page.evaluate(() => (window as unknown as { Shopify?: { locale?: string } }).Shopify?.locale);
      expect(lang, `${path} html lang`).toBeTruthy();
      if (shopLocale) expect(lang, `${path} lang ≠ request.locale`).toBe(shopLocale);
      await expect(page.locator('head title')).toHaveCount(1);
      expect((await page.title()).trim(), `${path} title rỗng`).not.toBe('');
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
      expect(await page.locator('link[rel="canonical"]').getAttribute('href'), `${path} canonical`).toMatch(/^https:\/\//);
      for (const p of ['og:title', 'og:type', 'og:url', 'og:description', 'og:site_name']) {
        await expect(page.locator(`meta[property="${p}"]`), `${path} ${p}`).toHaveCount(1);
      }
      for (const n of ['twitter:card', 'twitter:title', 'twitter:description']) {
        await expect(page.locator(`meta[name="${n}"]`), `${path} ${n}`).toHaveCount(1);
      }
    }
    if (!product) return;
    await page.goto(`/products/${product.handle}`);
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'product');
    await expect(page.locator('script[type="application/ld+json"]').first()).toBeAttached();
    if (product.hasDescription) await expect(page.locator('meta[name="description"]')).toHaveCount(1);
    if (product.hasImage) {
      await expect(page.locator('meta[property="og:image:secure_url"]')).toHaveAttribute('content', /^https:\/\/.+/);
      await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', /^\d+$/);
      await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', /^\d+$/);
    }
  });

  // ---------- AC8 ----------
  test('TC-24 AC8 heading Sofia Sans Condensed, body Inter qua font_picker', async ({ page }, ti) => {
    if (isDesktop(ti)) {
      const pickers = settingsSchema().flatMap(g => g.settings ?? []).filter(s => s.type === 'font_picker');
      expect(pickers.length, 'cần 2 font_picker (body, heading)').toBeGreaterThanOrEqual(2);
      const selfHosted = readdirSync(join(ROOT, 'assets')).filter(f => /\.(woff2?|ttf|otf)$/i.test(f));
      expect(selfHosted, 'R15: không tự host font').toEqual([]);
    }
    await page.goto('/');
    const fonts = await page.evaluate(() => {
      const h = document.querySelector('h1, h2');
      return { heading: h ? getComputedStyle(h).fontFamily : '', body: getComputedStyle(document.body).fontFamily };
    });
    expect(fonts.heading, 'font heading').toMatch(FONT_HEADING);
    expect(fonts.body, 'font body').toMatch(FONT_BODY);
  });

  test('TC-25 AC8 font-face body đủ 4 biến thể, swap, từ Shopify CDN', async ({ page }) => {
    await page.goto('/');
    const faces = await page.evaluate(() => Array.from(document.querySelectorAll('style')).map(s => s.textContent ?? '').join('\n').match(/@font-face\s*{[^}]*}/g) ?? []);
    const body = faces.filter(x => /Inter/i.test(x));
    expect(body.length, 'Inter cần ≥ 4 @font-face').toBeGreaterThanOrEqual(4);
    const heading = faces.filter(x => /Sofia Sans Condensed/i.test(x));
    expect(heading.length, 'heading cần @font-face').toBeGreaterThan(0);
    for (const x of [...body, ...heading]) {
      expect(x, 'thiếu font-display: swap').toMatch(/font-display:\s*swap/);
      expect(x, 'font không từ Shopify CDN').toMatch(/fonts\.shopifycdn\.com|\/cdn\//);
    }
  });

  // Chờ Tech Lead: heading hiện có 2 biến thể (700, 800) theo tokens.json; R15 ghi 4 biến thể. Xem test-cases.md mục KHÔNG CHẮC.
  test.fixme('TC-25b AC8 font heading đủ 4 biến thể theo R15', async ({ page }) => {
    await page.goto('/');
    const faces = await page.evaluate(() => Array.from(document.querySelectorAll('style')).map(s => s.textContent ?? '').join('\n').match(/@font-face\s*{[^}]*}/g) ?? []);
    expect(faces.filter(x => /Sofia Sans Condensed/i.test(x)).length).toBeGreaterThanOrEqual(4);
  });

  test('TC-26 AC8 màu chữ phụ: muted-light #6B6B6B, #999999 chỉ trên nền tối', async ({ page }) => {
    await page.goto('/');
    expect(await cssVar(page, '--color-muted-light')).toBe(rgb(tokens.color.muted_light));
    const onDark = await cssVar(page, '--color-muted-on-dark');
    expect(onDark).toBe(rgb(tokens.color.muted_on_dark));
    const onLight = await page.evaluate((color) => {
      const channels = (v: string) => (v.startsWith('rgb') ? (v.match(/[\d.]+/g) ?? []).map(Number) : null);
      const backgroundOf = (el: Element | null): number[] => {
        for (; el; el = el.parentElement) {
          const c = channels(getComputedStyle(el).backgroundColor);
          if (c && (c.length < 4 || c[3] > 0)) return c;
        }
        return [255, 255, 255];
      };
      const hasText = (el: Element) => Array.from(el.childNodes).some(n => n.nodeType === Node.TEXT_NODE && n.textContent?.trim());
      return Array.from(document.querySelectorAll('body *'))
        .filter(el => hasText(el) && getComputedStyle(el).color === color)
        .filter(el => {
          const [r, g, b] = backgroundOf(el);
          return 0.2126 * r + 0.7152 * g + 0.0722 * b > 127;
        })
        .map(el => `${el.tagName.toLowerCase()}: ${el.textContent?.trim().slice(0, 40)}`);
    }, onDark);
    expect(onLight, '#999999 nằm trên nền sáng').toEqual([]);
  });

  // ---------- AC9 ----------
  test('TC-41 AC9 trang không hero: nền background, chữ foreground', async ({ page }) => {
    for (const path of ['/collections/all', '/cart', '/search?q=a']) {
      await page.goto(path);
      const header = page.getByTestId(T.header);
      await expect(header, `${path} nền`).toHaveCSS('background-color', rgb(tokens.color.background));
      await expect(header, `${path} chữ`).toHaveCSS('color', rgb(tokens.color.foreground));
    }
  });

  test('TC-42 AC9 hero giả lập: header đè lên hero, chữ trắng; cuộn thì chữ foreground', async ({ page }) => {
    await page.goto('/');
    const header = page.getByTestId(T.header);
    test.skip((await header.getAttribute('data-sticky')) === null, 'sticky_header đang tắt');
    await simulateHero(page);
    await expect(header).toHaveCSS('color', rgb(tokens.color.background_dark_foreground));
    await expect.poll(async () => {
      const h = (await header.boundingBox())!;
      const m = (await page.locator('main').boundingBox())!;
      return Math.round(Math.abs(m.y - h.y));
    }, { message: 'main phải chui dưới header' }).toBeLessThanOrEqual(1);
    await scrollTo(page, 100);
    await expect(header).toHaveAttribute('data-scrolled', '');
    await expect(header).toHaveCSS('color', rgb(tokens.color.foreground));
  });

  test('TC-43 AC9 sticky: cuộn quá 80px header dính đỉnh, có bóng', async ({ page }) => {
    await page.goto('/');
    const header = page.getByTestId(T.header);
    test.skip((await header.getAttribute('data-sticky')) === null, 'sticky_header đang tắt');
    await expect(header).toHaveCSS('box-shadow', 'none');
    await scrollTo(page, 100);
    await expect(header).toHaveAttribute('data-scrolled', '');
    await expect(header).not.toHaveCSS('box-shadow', 'none');
    await expect.poll(async () => Math.round((await header.boundingBox())!.y)).toBe(0);
    await expect(header).toHaveCSS('color', rgb(tokens.color.foreground));
  });

  test('TC-44 AC9 schema sticky_header mặc định bật', async ({}, ti) => {
    test.skip(!isDesktop(ti), 'static, chạy 1 lần');
    const sticky = blockSchema('header.liquid').settings?.find(s => s.id === 'sticky_header');
    expect(sticky?.type).toBe('checkbox');
    expect(sticky?.default).toBe(true);
  });

  test('TC-45 AC9 localization: 1 nút gộp mở 2 danh sách', async ({ page }) => {
    await page.goto('/');
    const { form, summary } = localization(page);
    test.skip((await form.count()) === 0, 'store dev có 1 nước và 1 ngôn ngữ');
    await expect(form).toHaveCount(1);
    await expect(summary).toHaveCount(1);
    await expect(summary).toContainText(/[A-Z]{3} \/ [A-Z-]{2,}/);
    await expect(summary).toHaveAccessibleName(/\S/);
    const lists = page.getByTestId(T.footer).getByTestId(T.country).or(page.getByTestId(T.language));
    for (const l of await lists.all()) await expect(l).toBeHidden();
    await summary.click();
    for (const l of await lists.all()) await expect(l).toBeVisible();
  });

  test.fixme('TC-46 AC9 hero thật TE-2: header trong suốt đè hero, chữ trắng', async ({ page }) => {
    // Chờ TE-2 có hero đầu trang chủ mang data-header-overlay.
    await page.goto('/');
    await expect(page.locator('main [data-header-overlay]')).toHaveCount(1);
    const header = page.getByTestId(T.header);
    await expect(header).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(header).toHaveCSS('color', rgb(tokens.color.background_dark_foreground));
  });

  test.fixme('TC-47 AC9 hero thật TE-2: lớp phủ overlay_opacity mặc định 30%', async () => {
    // Chờ TE-2: setting overlay_opacity và data-testid lớp phủ chưa có trên develop.
  });

  // ---------- Case biên ----------
  test('TB-05 giỏ rỗng: không badge, cart link vẫn có accessible name', async ({ page }) => {
    await page.goto('/');
    await page.request.post('/cart/clear.js');
    await page.reload();
    const cart = page.getByTestId(T.header).getByTestId(T.cart);
    await expect(cart).toHaveAccessibleName(/\S/);
    await expect(cart.getByTestId(T.cartCount)).toHaveCount(0);
  });

  test('TB-10 JS header lỗi mạng vẫn dùng được menu', async ({ page }, ti) => {
    await page.route('**/header-menu*.js*', r => r.abort());
    await page.goto('/');
    if (isDesktop(ti)) {
      const { toggle, submenu } = await parentItem(page);
      await toggle.click();
      await expect(submenu.getByRole('link').first()).toBeVisible();
    } else {
      const { drawer } = await openDrawer(page);
      await expect(drawer.getByTestId(T.item).first()).toBeVisible();
    }
  });

  test('TB-13 360px không tràn ngang, touch target ≥ 24px', async ({ page }, ti) => {
    test.skip(isDesktop(ti), 'mobile');
    test.slow();
    await page.setViewportSize({ width: 360, height: 780 });
    const product = await findProduct(page);
    const paths = ['/', '/collections/all', ...(product ? [`/products/${product.handle}`] : [])];
    for (const path of paths) {
      await page.goto(path);
      expect(await page.evaluate(() => document.documentElement.scrollWidth), `${path} tràn ngang`).toBeLessThanOrEqual(360);
      for (const id of [T.drawerToggle, T.search, T.account, T.cart]) {
        const el = page.getByTestId(T.header).getByTestId(id);
        if ((await el.count()) === 0) continue; // menu rỗng hoặc tắt customer accounts
        const b = (await el.boundingBox())!;
        expect(Math.min(b.width, b.height), `${path} ${id} < 24px`).toBeGreaterThanOrEqual(24);
      }
    }
  });

  test('TB-15 keyboard: Tab tới cart, focus thấy được, không tabindex > 0', async ({ page }, ti) => {
    test.skip(!isDesktop(ti), 'desktop');
    await page.goto('/');
    expect(await page.locator('[tabindex]').evaluateAll(els => els.filter(e => (e as HTMLElement).tabIndex > 0).length)).toBe(0);
    const order: string[] = [];
    let reached = false;
    for (let i = 0; i < 80 && !reached; i++) {
      await page.keyboard.press('Tab');
      const info = await page.evaluate((hid) => {
        const host = document.activeElement as HTMLElement | null;
        if (!host || host === document.body) return null;
        let deep: Element = host;
        while (deep.shadowRoot?.activeElement) deep = deep.shadowRoot.activeElement;
        const cs = getComputedStyle(deep);
        return {
          id: host.closest('[data-testid]')?.getAttribute('data-testid') ?? '',
          inHeader: !!host.closest(`[data-testid="${hid}"]`),
          ring: (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || cs.boxShadow !== 'none',
          closedShadow: host.tagName === 'SHOPIFY-ACCOUNT' && !host.shadowRoot,
        };
      }, T.header);
      if (!info) continue;
      if (info.inHeader) {
        // Shadow root đóng của shopify-account không đo được từ ngoài: kiểm tay, xem TB-15 trong test-cases.md.
        if (!info.closedShadow) expect(info.ring, `focus không thấy được: ${info.id}`).toBeTruthy();
        if (order[order.length - 1] !== info.id) order.push(info.id);
      }
      reached = info.id === T.cart;
    }
    expect(reached, 'Tab không tới được cart link').toBeTruthy();
    const idx = (id: string) => order.indexOf(id);
    const msg = `thứ tự focus: ${order.join(' > ')}`;
    expect(idx(T.logo), msg).toBeGreaterThan(-1);
    expect(idx(T.search), msg).toBeGreaterThan(idx(T.logo));
    expect(idx(T.search), msg).toBeLessThan(order.length - 1);
  });

  test('TB-16 keyboard: Tab rời submenu thì đóng', async ({ page }, ti) => {
    test.skip(!isDesktop(ti), 'desktop');
    await page.goto('/');
    const { item, toggle, submenu } = await parentItem(page);
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(submenu).toBeVisible();
    const n = await submenu.getByRole('link').count();
    for (let i = 0; i <= n; i++) await page.keyboard.press('Tab');
    expect(await item.evaluate(el => el.contains(document.activeElement)), 'focus chưa rời mục').toBeFalsy();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(submenu).toBeHidden();
  });

  test('TB-19 axe: dropdown mở, drawer mở', async ({ page }, ti) => {
    await page.goto('/');
    if (isDesktop(ti)) {
      const { toggle, submenu } = await parentItem(page);
      await toggle.focus();
      await page.keyboard.press('Enter');
      await expect(submenu).toBeVisible();
      expect(await axeChrome(page), 'dropdown mở').toEqual([]);
    } else {
      await openDrawer(page);
      expect(await axeChrome(page), 'drawer mở').toEqual([]);
    }
  });

  test('TB-20 mỗi trang đúng 1 h1, header không chiếm h1', async ({ page }) => {
    test.slow();
    const product = await findProduct(page);
    const paths = ['/', '/collections/all', ...(product ? [`/products/${product.handle}`] : [])];
    for (const path of paths) {
      await page.goto(path);
      await expect(page.locator('h1'), `${path} số h1`).toHaveCount(1);
      await expect(page.getByTestId(T.header).locator('h1'), `${path} header chiếm h1`).toHaveCount(0);
    }
  });

  test('TB-28 không console error khi thao tác header', async ({ page }, ti) => {
    const errors: string[] = [];
    page.on('console', (m) => {
      if (m.type() !== 'error') return;
      const text = `${m.text()} @ ${m.location().url}`;
      if (!IGNORE_CONSOLE.some(r => r.test(text))) errors.push(text);
    });
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/');
    if (isDesktop(ti)) {
      const { item, submenu } = await parentItem(page);
      await item.hover();
      await expect(submenu).toBeVisible();
    } else {
      const { drawer } = await openDrawer(page);
      const acc = drawer.getByTestId(T.drawerAcc);
      if (await acc.count()) await acc.first().click();
    }
    expect(errors).toEqual([]);
  });
});

test.describe('ES1-T23 không JS', () => {
  test.use({ javaScriptEnabled: false });

  test('TB-11 menu cấp 2 truy cập được khi không JS', async ({ page }, ti) => {
    await page.goto('/');
    if (isDesktop(ti)) {
      const { toggle, submenu } = await parentItem(page);
      await toggle.click();
      await expect(submenu.getByRole('link').first()).toBeVisible();
    } else {
      const { drawer } = await openDrawer(page);
      const acc = drawer.getByTestId(T.drawerAcc);
      test.skip((await acc.count()) === 0, 'main-menu store dev chưa có mục cấp 2');
      await acc.first().click();
      await expect(drawer.getByTestId(T.drawerSub).first().getByRole('link').first()).toBeVisible();
    }
  });

  test('TC-31 AC9 localization submit được khi không JS', async ({ page }) => {
    await page.goto('/collections/all');
    test.skip((await page.getByTestId(T.countryOpt).count()) < 2, 'store dev bán 1 nước');
    const value = await chooseOther(page, T.countryOpt); // chooseOther mở summary trước khi click option
    test.skip(!value, 'không có nước khác để chọn');
    await expect(page.getByTestId(T.countryOpt).and(page.locator(`[value="${value}"]`))).toHaveAttribute('aria-current', 'true');
    expect(new URL(page.url()).pathname, 'return_to sai').toMatch(/\/collections\/all$/);
  });
});
