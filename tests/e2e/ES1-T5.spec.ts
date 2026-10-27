// KHÔNG CHẮC: data-testid theo hợp đồng đề xuất (drafts/qa/ES1-T5/test-cases.md, dev-fe ES1-T9); markup TE-1 chưa có nên spec fail tới khi FE/BE TE-1 merge (cách gắn CI hỏi ES1-T7). Tên biến token chờ ES1-T7.
// Ticket ES1-T5 (2727475000000119001) — Test case TE-1 Header. Nguồn: docs/srs.md#TE-1, Figma 1:362, 1:1104, docs/tokens.json.
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T5.spec.ts
// Biến trạng thái store (tuỳ chọn): EXPECT_ANNOUNCEMENT=off|text|link, EXPECT_COUNTRIES=<n>, EXPECT_LANGUAGES=<n>, EXPECT_MENU_ITEMS=<n>
import { test, expect, type Page, type Locator, type TestInfo } from '@playwright/test';
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

// docs/tokens.json (giá trị mặc định khi cài)
const TOKENS = { background: 'rgb(255, 255, 255)', foreground: 'rgb(26, 26, 26)', accent: 'rgb(217, 70, 16)', mutedLight: 'rgb(107, 107, 107)', mutedOnDark: 'rgb(153, 153, 153)' };
const FONT_HEADING = /^["']?Sofia Sans Condensed/i;
const FONT_BODY = /^["']?Inter\b/i;

const ROOT = process.cwd();
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

async function firstVisible(loc: Locator): Promise<Locator | null> {
  for (const l of await loc.all()) if (await l.isVisible()) return l;
  return null;
}

async function pathOf(page: Page, loc: Locator): Promise<string> {
  const href = await loc.getAttribute('href');
  expect(href, 'href rỗng').toBeTruthy();
  return new URL(href!, page.url()).pathname;
}

async function firstAvailable(page: Page): Promise<{ handle: string; variantId: number }> {
  const res = await page.request.get('/products.json?limit=50');
  expect(res.ok()).toBeTruthy();
  const { products } = (await res.json()) as { products: Array<{ handle: string; variants: Array<{ id: number; available: boolean }> }> };
  const p = products.find(x => x.variants.some(v => v.available));
  expect(p, 'store dev không có sản phẩm còn hàng (dữ liệu TE-9)').toBeTruthy();
  return { handle: p!.handle, variantId: p!.variants.find(v => v.available)!.id };
}

// Mobile: phần tử có thể nằm trong drawer, mở drawer nếu chưa thấy.
async function visibleInHeader(page: Page, id: string): Promise<Locator> {
  let el = await firstVisible(page.getByTestId(T.header).getByTestId(id));
  if (!el && (await page.getByTestId(T.drawerToggle).isVisible())) {
    await page.getByTestId(T.drawerToggle).click();
    await expect(page.getByTestId(T.drawer)).toBeVisible();
    el = await firstVisible(page.getByTestId(T.drawer).getByTestId(id));
  }
  expect(el, `không thấy ${id}`).not.toBeNull();
  return el!;
}

async function firstParentItem(page: Page) {
  const nav = page.getByTestId(T.nav);
  expect(await nav.getByTestId(T.toggle).count(), 'main-menu chưa có mục cấp 2 trên store dev').toBeGreaterThan(0);
  const item = nav.getByTestId(T.item).filter({ has: page.getByTestId(T.toggle) }).first();
  return { item, toggle: item.getByTestId(T.toggle), submenu: item.getByTestId(T.submenu) };
}

async function axeChrome(page: Page, rules?: string[]) {
  const b = new AxeBuilder({ page });
  if (rules) b.withRules(rules);
  for (const id of [T.bar, T.header, T.drawer, T.footer]) {
    if (await page.getByTestId(id).count()) b.include(`[data-testid="${id}"]`);
  }
  return (await b.analyze()).violations.filter(seriousOrCritical).map(v => `${v.id}: ${v.nodes.map(n => n.target.join(' ')).join(', ')}`);
}

test.describe('ES1-T5', () => {
  test.afterEach(async ({ page }, ti) => {
    if (ti.status !== ti.expectedStatus) await ti.attach('fail', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
  });

  // ---------- AC1 ----------
  test('TC-01 AC1 token qua css-variables, giá trị mặc định tokens.json', async ({ page }) => {
    const { handle } = await firstAvailable(page);
    for (const path of ['/', '/collections/all', `/products/${handle}`, '/cart']) {
      await page.goto(path);
      const r = await page.evaluate(() => {
        const probe = document.createElement('div');
        document.body.appendChild(probe);
        const resolve = (v: string, prop: 'backgroundColor' | 'color') => {
          probe.style[prop] = '';
          probe.style[prop] = `var(${v})`;
          return getComputedStyle(probe)[prop];
        };
        const inline = Array.from(document.querySelectorAll('style')).map(s => s.textContent ?? '').join('\n');
        const out = {
          bg: resolve('--color-background', 'backgroundColor'),
          fg: resolve('--color-foreground', 'color'),
          accent: resolve('--color-accent', 'color'),
          font: /--font-[\w-]+\s*:/.test(inline),
          space: /--space-[\w-]+\s*:/.test(inline),
          radius: /--radius-[\w-]+\s*:/.test(inline),
          bodyBg: getComputedStyle(document.body).backgroundColor,
          bodyFg: getComputedStyle(document.body).color,
        };
        probe.remove();
        return out;
      });
      expect({ bg: r.bg, fg: r.fg, accent: r.accent }, `${path} giá trị biến màu`).toEqual({ bg: TOKENS.background, fg: TOKENS.foreground, accent: TOKENS.accent });
      expect({ font: r.font, space: r.space, radius: r.radius }, `${path} thiếu nhóm biến`).toEqual({ font: true, space: true, radius: true });
      expect(r.bodyBg, `${path} nền body không lấy từ --color-background`).toBe(r.bg);
      expect(r.bodyFg, `${path} chữ body không lấy từ --color-foreground`).toBe(r.fg);
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
        else if (/font-family\s*:\s*(?!var\(|inherit)/.test(line)) bad.push(at);
        else if (/border-radius\s*:\s*(?!var\(|0(?:px)?\s*[;}]|50%|inherit)/.test(line)) bad.push(at);
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
    expect(n, 'main-menu rỗng').toBeGreaterThan(0);
    if (process.env.EXPECT_MENU_ITEMS) expect(n).toBe(Number(process.env.EXPECT_MENU_ITEMS));
    const tops = new Set<number>();
    for (const it of await items.all()) tops.add(Math.round((await it.boundingBox())!.y));
    expect(tops.size, 'mục cấp 1 xuống nhiều hàng').toBe(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(1280);
  });

  test('TC-06 AC2 hover mở dropdown cấp 2', async ({ page }, ti) => {
    test.skip(!isDesktop(ti), 'desktop');
    await page.goto('/');
    const { item, submenu } = await firstParentItem(page);
    await expect(submenu).toBeHidden();
    await item.hover();
    await expect(submenu).toBeVisible();
    expect(await submenu.getByRole('link').count()).toBeGreaterThan(0);
    const vh = page.viewportSize()?.height ?? 800;
    await page.mouse.move(5, vh - 5);
    await expect(submenu).toBeHidden();
  });

  test('TC-07 TC-09 AC2 Enter mở, Tab vào submenu, Esc đóng và trả focus', async ({ page }, ti) => {
    test.skip(!isDesktop(ti), 'desktop');
    await page.goto('/');
    const { toggle, submenu } = await firstParentItem(page);
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
    const { toggle, submenu } = await firstParentItem(page);
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
    expect(await plain.count(), 'main-menu cần ≥ 1 mục không con').toBeGreaterThan(0);
    const link = plain.first().getByRole('link').first();
    expect(await link.getAttribute('aria-expanded')).toBeNull();
    const target = await pathOf(page, link);
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
  test('TC-11..TC-14 AC2 drawer + accordion mobile', async ({ page }, ti) => {
    test.skip(isDesktop(ti), 'mobile');
    for (const width of [360, page.viewportSize()!.width]) {
      await page.setViewportSize({ width, height: 780 });
      await page.goto('/');
      const dt = page.getByTestId(T.drawerToggle);
      await expect(page.getByTestId(T.nav), `${width}: nav desktop phải ẩn`).toBeHidden();
      await expect(dt).toBeVisible();
      await expect(dt).toHaveAccessibleName(/\S/);
      await expect(dt).toHaveAttribute('aria-expanded', 'false');

      await dt.click();
      const drawer = page.getByTestId(T.drawer);
      await expect(drawer).toBeVisible();
      await expect(dt).toHaveAttribute('aria-expanded', 'true');
      expect(await drawer.getByRole('link').count(), 'drawer không có link').toBeGreaterThan(0);
      const navItems = await page.getByTestId(T.nav).getByTestId(T.item).count();
      if (navItems > 0) expect(await drawer.getByTestId(T.item).count(), 'số mục cấp 1 drawer ≠ nav').toBe(navItems);

      expect(await drawer.getByTestId(T.drawerAcc).count(), 'main-menu chưa có mục cấp 2').toBeGreaterThan(0);
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

      await page.keyboard.press('Escape');
      await expect(drawer).toBeHidden();
      await expect(dt).toBeFocused();

      await dt.click();
      await expect(drawer).toBeVisible();
      await drawer.getByTestId(T.drawerClose).click();
      await expect(drawer).toBeHidden();
      await expect(dt).toBeFocused();
    }
  });

  // ---------- AC3 ----------
  test('TC-16 TC-17 AC3 shopify-account trong header', async ({ page }) => {
    await page.goto('/');
    const acc = await visibleInHeader(page, T.account);
    expect(await acc.evaluate(el => el.tagName.toLowerCase())).toBe('shopify-account');
  });

  test('TC-18 AC3 cart link + số lượng', async ({ page }) => {
    const { variantId } = await firstAvailable(page);
    await page.goto('/');
    await page.request.post('/cart/clear.js');
    const add = await page.request.post('/cart/add.js', { data: { items: [{ id: variantId, quantity: 2 }] } });
    expect(add.ok()).toBeTruthy();
    await page.reload();
    const cart = await firstVisible(page.getByTestId(T.header).getByTestId(T.cart));
    expect(cart, 'cart link không hiện').not.toBeNull();
    expect(await pathOf(page, cart!)).toMatch(/\/cart$/);
    await expect(cart!.getByTestId(T.cartCount)).toHaveText(/\b2\b/);
    await expect(cart!).toHaveAccessibleName(/2/);
  });

  test('TC-19 AC3 search link', async ({ page }) => {
    await page.goto('/');
    const s = await visibleInHeader(page, T.search);
    const target = await pathOf(page, s);
    expect(target).toMatch(/\/search$/);
    await expect(s).toHaveAccessibleName(/\S/);
    await s.click();
    await page.waitForURL(u => u.pathname === target);
  });

  // ---------- AC4 ----------
  test('TC-21..TC-23 AC4 announcement bar', async ({ page }) => {
    await page.goto('/');
    const bar = page.getByTestId(T.bar);
    const mode = process.env.EXPECT_ANNOUNCEMENT ?? 'off'; // mặc định theo quyết định CTO 27/10: rỗng
    if (mode === 'off') { await expect(bar).toHaveCount(0); return; }
    await expect(bar).toHaveCount(1);
    await expect(bar).toBeVisible();
    await expect(bar).toHaveText(/\S/);
    const b = (await bar.boundingBox())!;
    const h = (await page.getByTestId(T.header).boundingBox())!;
    expect(b.y + b.height, 'bar phải nằm trên header').toBeLessThanOrEqual(h.y + 1);
    expect(await bar.evaluate((el, id) => {
      const hd = document.querySelector(`[data-testid="${id}"]`);
      return !!hd && !!(el.compareDocumentPosition(hd) & Node.DOCUMENT_POSITION_FOLLOWING);
    }, T.header), 'bar phải đứng trước header trong DOM').toBeTruthy();
    if (mode === 'text') { await expect(bar.locator('a')).toHaveCount(0); return; }
    const link = bar.getByTestId(T.barLink);
    await expect(link).toHaveCount(1);
    await expect(link).toHaveAccessibleName((await bar.innerText()).trim());
    const target = await pathOf(page, link);
    await link.click();
    await page.waitForURL(u => u.pathname === target);
  });

  // ---------- AC5a font/màu chữ phụ ----------
  test('TC-24 AC5 heading Sofia Sans Condensed, body Inter qua font_picker', async ({ page }, ti) => {
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

  test('TC-25 AC5 font-face swap 4 biến thể từ Shopify CDN', async ({ page }) => {
    await page.goto('/');
    const faces = await page.evaluate(() => Array.from(document.querySelectorAll('style')).map(s => s.textContent ?? '').join('\n').match(/@font-face\s*{[^}]*}/g) ?? []);
    for (const fam of [/Sofia Sans Condensed/i, /Inter/i]) {
      const f = faces.filter(x => fam.test(x));
      expect(f.length, `${fam} cần ≥ 4 @font-face`).toBeGreaterThanOrEqual(4);
      for (const x of f) {
        expect(x, 'thiếu font-display: swap').toMatch(/font-display:\s*swap/);
        expect(x, 'font không từ Shopify CDN').toMatch(/fonts\.shopifycdn\.com|\/cdn\//);
      }
    }
  });

  test('TC-26 AC5 màu chữ phụ: muted-light #6B6B6B, #999999 chỉ trên nền tối', async ({ page }) => {
    await page.goto('/');
    const r = await page.evaluate(() => {
      const probe = document.createElement('div');
      document.body.appendChild(probe);
      const resolve = (v: string) => { probe.style.color = ''; probe.style.color = `var(${v})`; return getComputedStyle(probe).color; };
      const out = { mutedLight: resolve('--color-muted-light'), mutedOnDark: resolve('--color-muted-on-dark') };
      probe.remove();
      return out;
    });
    expect(r).toEqual({ mutedLight: 'rgb(107, 107, 107)', mutedOnDark: 'rgb(153, 153, 153)' });
    expect(await axeChrome(page, ['color-contrast']), 'contrast header/footer').toEqual([]);
  });

  // ---------- AC5b country/language ----------
  test('TC-28..TC-30 AC5 country/language selector', async ({ page }) => {
    await page.goto('/');
    const f = page.getByTestId(T.footer);
    const cases: Array<[string, string, string | undefined]> = [
      [T.country, T.countryOpt, process.env.EXPECT_COUNTRIES],
      [T.language, T.languageOpt, process.env.EXPECT_LANGUAGES],
    ];
    for (const [sel, opt, expectN] of cases) {
      const s = f.getByTestId(sel);
      if (expectN !== undefined) {
        if (Number(expectN) >= 2) await expect(s, `${sel} phải hiện`).toHaveCount(1);
        else await expect(s, `${sel} không được hiện`).toHaveCount(0);
      }
      if ((await s.count()) === 0) continue;
      const n = await f.getByTestId(opt).count();
      expect(n, `${sel} hiện nhưng < 2 lựa chọn`).toBeGreaterThanOrEqual(2);
      if (expectN !== undefined) expect(n).toBe(Number(expectN));
    }
    if ((await f.getByTestId(T.country).count()) > 0) {
      for (const o of await f.getByTestId(T.countryOpt).all()) {
        expect((await o.textContent()) ?? '', 'lựa chọn nước thiếu mã tiền tệ').toMatch(/\b[A-Z]{3}\b/);
      }
    }
  });

  // ---------- AC6 ----------
  test('TC-32 AC6 newsletter thành công', async ({ page }) => {
    await page.goto('/');
    const form = page.getByTestId(T.nlForm);
    await expect(form.locator('input[name="contact[tags]"]')).toHaveValue(/newsletter/);
    const email = form.getByTestId(T.nlEmail);
    await expect(email).toHaveAccessibleName(/\S/);
    await email.fill(`qa+te1-${Date.now()}@example.com`);
    await form.getByTestId(T.nlSubmit).click();
    await page.waitForURL(/customer_posted=true/);
    await expect(page.getByTestId(T.nlSuccess)).toBeVisible();
    await expect(page.getByTestId(T.nlSuccess)).toHaveText(/\S/);
  });

  test('TC-33 AC6 newsletter lỗi từ server', async ({ page }) => {
    await page.goto('/');
    const form = page.getByTestId(T.nlForm);
    await form.evaluate(f => ((f as HTMLFormElement).noValidate = true));
    await form.getByTestId(T.nlEmail).fill('khong-phai-email');
    await form.getByTestId(T.nlSubmit).click();
    const err = page.getByTestId(T.nlError);
    await expect(err).toBeVisible();
    await expect(err).toHaveText(/\S/);
    const errId = await err.getAttribute('id');
    expect(errId, 'thông báo lỗi thiếu id').toBeTruthy();
    expect(await page.getByTestId(T.nlEmail).getAttribute('aria-describedby')).toContain(errId!);
    await expect(page.getByTestId(T.nlEmail)).toHaveValue('khong-phai-email');
  });

  test('TC-35..TC-37 AC6 footer menu, social, payment', async ({ page }, ti) => {
    if (isDesktop(ti)) {
      const menu = blockSchema('footer.liquid').settings?.find(s => s.id === 'menu');
      expect(menu?.default, 'menu footer cần default footer').toBe('footer');
    }
    await page.goto('/');
    const f = page.getByTestId(T.footer);
    expect(await f.getByTestId(T.footerMenuLink).count(), 'menu footer mặc định rỗng').toBeGreaterThan(0);
    for (const s of await f.getByTestId(T.social).all()) {
      expect(await s.getAttribute('href')).toMatch(/^https?:\/\//);
      await expect(s).toHaveAccessibleName(/\S/);
    }
    const pays = await f.getByTestId(T.payment).all();
    expect(pays.length, 'không có payment icon').toBeGreaterThan(0);
    for (const p of pays) {
      const svg = (await p.evaluate(el => el.tagName.toLowerCase())) === 'svg' ? p : p.locator('svg');
      await expect(svg.locator('title')).toHaveCount(1);
      const fills = await svg.evaluate(el => new Set(Array.from(el.querySelectorAll('[fill]')).map(n => n.getAttribute('fill')?.toLowerCase())).size);
      expect(fills, 'payment icon đơn sắc').toBeGreaterThan(1);
    }
  });

  // ---------- AC7 ----------
  test('TC-38..TC-40 AC7 lang + meta-tags + page_image', async ({ page }) => {
    const { handle } = await firstAvailable(page);
    for (const path of ['/', '/collections/all', `/products/${handle}`, '/pages/contact', '/search?q=a', '/cart']) {
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
      if (path.startsWith('/products/')) {
        await expect(page.locator('meta[name="description"]')).toHaveCount(1);
        await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'product');
        await expect(page.locator('meta[property="og:image:secure_url"]')).toHaveAttribute('content', /^https:\/\/.+/);
        await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', /^\d+$/);
        await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', /^\d+$/);
        await expect(page.locator('script[type="application/ld+json"]').first()).toBeAttached();
      }
    }
  });

  // ---------- Case biên ----------
  test('TB-05 giỏ rỗng: cart link vẫn có accessible name', async ({ page }) => {
    await page.goto('/');
    await page.request.post('/cart/clear.js');
    await page.reload();
    const cart = await firstVisible(page.getByTestId(T.header).getByTestId(T.cart));
    expect(cart, 'cart link không hiện').not.toBeNull();
    await expect(cart!).toHaveAccessibleName(/\S/);
  });

  test('TB-10 JS header lỗi mạng vẫn dùng được menu', async ({ page }, ti) => {
    await page.route('**/header-menu*.js*', r => r.abort());
    await page.goto('/');
    if (isDesktop(ti)) {
      const { toggle, submenu } = await firstParentItem(page);
      await toggle.click();
      await expect(submenu.getByRole('link').first()).toBeVisible();
    } else {
      await page.getByTestId(T.drawerToggle).click();
      await expect(page.getByTestId(T.drawer)).toBeVisible();
      await expect(page.getByTestId(T.drawer).getByRole('link').first()).toBeVisible();
    }
  });

  test('TB-13 360px không tràn ngang, touch target ≥ 24px', async ({ page }, ti) => {
    test.skip(isDesktop(ti), 'mobile');
    await page.setViewportSize({ width: 360, height: 780 });
    const { handle } = await firstAvailable(page);
    for (const path of ['/', '/collections/all', `/products/${handle}`]) {
      await page.goto(path);
      expect(await page.evaluate(() => document.documentElement.scrollWidth), `${path} tràn ngang`).toBeLessThanOrEqual(360);
      for (const id of [T.drawerToggle, T.search, T.account, T.cart]) {
        const el = await firstVisible(page.getByTestId(T.header).getByTestId(id));
        if (!el) continue; // search/account có thể nằm trong drawer
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
        const a = document.activeElement as HTMLElement | null;
        if (!a || a === document.body) return null;
        const cs = getComputedStyle(a);
        return {
          id: a.closest('[data-testid]')?.getAttribute('data-testid') ?? '',
          inHeader: !!a.closest(`[data-testid="${hid}"]`),
          ring: (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || cs.boxShadow !== 'none',
        };
      }, T.header);
      if (!info) continue;
      if (info.inHeader) {
        expect(info.ring, `focus không thấy được: ${info.id}`).toBeTruthy();
        if (order[order.length - 1] !== info.id) order.push(info.id);
      }
      reached = info.id === T.cart || info.id === T.cartCount;
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
    const { item, toggle, submenu } = await firstParentItem(page);
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(submenu).toBeVisible();
    const n = await submenu.getByRole('link').count();
    for (let i = 0; i <= n; i++) await page.keyboard.press('Tab');
    expect(await item.evaluate(el => el.contains(document.activeElement)), 'focus chưa rời mục').toBeFalsy();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(submenu).toBeHidden();
  });

  test('TB-19 axe: mặc định, dropdown mở, drawer mở', async ({ page }, ti) => {
    await page.goto('/');
    expect(await axeChrome(page), 'trạng thái mặc định').toEqual([]);
    if (isDesktop(ti)) {
      const { toggle } = await firstParentItem(page);
      await toggle.focus();
      await page.keyboard.press('Enter');
      expect(await axeChrome(page), 'dropdown mở').toEqual([]);
    } else {
      await page.getByTestId(T.drawerToggle).click();
      await expect(page.getByTestId(T.drawer)).toBeVisible();
      expect(await axeChrome(page), 'drawer mở').toEqual([]);
    }
  });

  test('TB-20 mỗi trang đúng 1 h1', async ({ page }) => {
    const { handle } = await firstAvailable(page);
    for (const path of ['/', '/collections/all', `/products/${handle}`]) {
      await page.goto(path);
      await expect(page.locator('h1'), `${path} số h1`).toHaveCount(1);
      await expect(page.getByTestId(T.header).locator('h1'), `${path} header chiếm h1`).toHaveCount(0);
    }
  });

  test('TB-28 không console error khi thao tác header', async ({ page }, ti) => {
    const errors: string[] = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/');
    if (isDesktop(ti)) {
      const { item } = await firstParentItem(page);
      await item.hover();
    } else {
      await page.getByTestId(T.drawerToggle).click();
      await page.getByTestId(T.drawer).getByTestId(T.drawerAcc).first().click();
    }
    expect(errors).toEqual([]);
  });
});

test.describe('ES1-T5 không JS', () => {
  test.use({ javaScriptEnabled: false });

  test('TB-11 menu cấp 2 truy cập được khi không JS', async ({ page }, ti) => {
    await page.goto('/');
    if (isDesktop(ti)) {
      const { toggle, submenu } = await firstParentItem(page);
      await toggle.click();
      await expect(submenu.getByRole('link').first()).toBeVisible();
    } else {
      await page.getByTestId(T.drawerToggle).click();
      await expect(page.getByTestId(T.drawer).getByRole('link').first()).toBeVisible();
    }
  });

  test('TC-31 AC5 localization submit được khi không JS', async ({ page }) => {
    test.skip(Number(process.env.EXPECT_COUNTRIES ?? '0') < 2, 'cần shop ≥ 2 nước');
    await page.goto('/');
    const form = page.locator('form[action*="localization"]').first();
    await expect(form).toBeAttached();
    await expect(form.locator('input[name="return_to"]')).toHaveCount(1);
    const country = async () => (await page.context().cookies()).find(c => c.name === 'localization')?.value ?? '';
    const before = await country();
    const select = form.locator('select[name="country_code"]');
    if (await select.count()) {
      const opts = await select.locator('option').evaluateAll(os => os.map(o => ({ v: (o as HTMLOptionElement).value, s: (o as HTMLOptionElement).selected })));
      const next = opts.find(o => !o.s)!;
      await select.selectOption(next.v);
      await form.locator('button[type="submit"], input[type="submit"]').first().click();
    } else {
      await page.getByTestId(T.countryOpt).nth(1).click();
    }
    await page.waitForLoadState('domcontentloaded');
    expect(await country(), 'cookie localization không đổi khi không JS').not.toBe(before);
  });
});
