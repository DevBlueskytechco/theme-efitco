// KHÔNG CHẮC: spec chưa chạy (phiên viết không có trình duyệt, không preview, không gọi mạng) → chờ CI.
// Thẻ <script> modal-dialog.js trong layout/theme.liquid do FE/Orchestrator thêm (scope-guard chặn dev-be ghi layout/, hỏi ES1-T452):
// test tĩnh "layout" và test storefront fail tới khi có. Test hành vi dựng fixture bằng page.setContent (CSS + JS thật), không gọi store.
// Ticket ES1-T315 TE-10-R2-BE2: assets/modal-dialog.js ≤ 2 048 B (ADR 0007 mục 5, ADR 0010; foundation §15–§16;
// SRS TE-10 AC12, TE-3 AC10, TE-11 AC5, TE-18 AC8 phần chung: mở, Esc, scrim, nút đóng, vuốt sheet, trả focus, khoá cuộn, sự kiện).
// Chạy: npx playwright test tests/e2e/ES1-T315.spec.ts (storefront: PREVIEW_URL=... STORE_PASSWORD=...)
import { readFileSync, statSync } from 'node:fs';
import { test, expect, type Page } from '@playwright/test';
import { expectNotChallenged } from './support/store-guard';
import { watchShopPay403 } from './support/console-guard';

const JS_FILE = 'assets/modal-dialog.js';
const JS = readFileSync(JS_FILE, 'utf8');
const BASE = readFileSync('assets/base.css', 'utf8');
const CRITICAL = readFileSync('assets/critical.css', 'utf8');
const LAYOUT = readFileSync('layout/theme.liquid', 'utf8');
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|shopifysvc\.com|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];

// Token mặc định (config/settings_schema.json, như ES1-T313); css-variables.liquid là nguồn thật trên store.
const TOKENS = `:root{--space-1:4px;--space-2:8px;--space-3:12px;--space-4:16px;--space-5:24px;--space-6:32px;--space-7:48px;--space-8:120px;
--page-margin:20px;--page-width:91rem;--header-height:80px;--radius-input:8px;--radius-button:8px;--radius-card:12px;--radius-pill:999px;
--color-background:#fff;--color-foreground:#1a1a1a;--color-muted:#6b6b6b;--color-muted-light:#808080;--color-border:#e5e5e5;
--color-background-alt:#f4f4f5;--color-background-alt-foreground:#1a1a1a;--color-background-dark:#1a1a1a;--color-background-dark-foreground:#fff;
--color-background-panel:#393942;--color-accent:#c8400e;--color-accent-foreground:#fff;--color-sale:#c8102e;--color-badge-new:#467a48;
--font-size-xs:.8125rem;--font-size-sm:.875rem;--font-size-base:1rem;--font-size-h3:1.5rem;--font-size-h2:2rem;--line-height-body:1.5;--line-height-heading:1.1;
--font-heading--family:serif;--font-heading--weight-display:800;--font-primary--family:sans-serif;
--motion-fast:150ms;--motion-base:250ms;--motion-slow:500ms;--motion-hero:1400ms;--ease-out:ease-out}`;

// Markup theo hợp đồng FE ES1-T313 / task-split §4: <modal-dialog data-layer data-sheet-below data-return-focus><dialog aria-labelledby>.
const FIXTURE = `
<button type="button" id="open-qv" data-testid="open-qv">Quick view</button>
<button type="button" id="open-cart" data-testid="open-cart">Cart</button>
<main data-testid="page-main"><p style="block-size:3000px">Page</p></main>
<modal-dialog data-layer="quick-view" data-sheet-below="48rem">
  <dialog class="dialog dialog--m" data-testid="quick-view-dialog" aria-labelledby="qv-title">
    <div class="dialog__header" data-testid="qv-header"><h2 class="dialog__title" id="qv-title" data-testid="qv-title">Quick view</h2></div>
    <button type="button" class="close-button dialog__close" data-testid="quick-view-close" aria-label="Close quick view">×</button>
    <div class="dialog__body" data-testid="qv-body"><button type="button" data-testid="qv-add">Add To Cart</button><p data-testid="qv-long" style="block-size:2000px">Body</p></div>
  </dialog>
</modal-dialog>
<modal-dialog data-layer="cart" data-return-focus="open-cart">
  <dialog class="drawer drawer--end drawer--wide" data-testid="cart-dialog" aria-labelledby="cart-title">
    <div class="drawer__header"><h2 class="drawer__title" id="cart-title" data-testid="cart-title">Cart</h2>
      <button type="button" class="close-button" data-testid="cart-close" aria-label="Close cart">×</button></div>
    <div class="drawer__body"><a href="#x" data-testid="cart-link">Item</a></div>
    <div class="drawer__footer"><button type="button" data-modal-close data-testid="cart-keep">Keep Shopping</button></div>
  </dialog>
</modal-dialog>
<modal-dialog data-layer="newsletter" data-sheet-below="48rem">
  <dialog class="dialog dialog--s" data-testid="newsletter-dialog" aria-labelledby="nl-title">
    <div class="dialog__header"><h2 class="dialog__title" id="nl-title">Join</h2></div>
    <div class="dialog__body"><label>Email <input type="email" data-testid="nl-email" autofocus></label>
      <div class="shopify-block" data-testid="nl-block">Block</div>
      <form method="dialog"><button data-testid="nl-dismiss">No Thanks</button></form></div>
  </dialog>
</modal-dialog>`;

async function mount(page: Page, width: number, height = 900) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.setViewportSize({ width, height });
  await page.setContent(
    `<!doctype html><html><head><style>${TOKENS}${CRITICAL}${BASE}</style></head><body>${FIXTURE}<script type="module">${JS}</script></body></html>`
  );
  await page.waitForFunction(() => !!customElements.get('modal-dialog'));
  await page.evaluate(() => {
    const w = window as any;
    w.__ev = [];
    for (const t of ['modal:open', 'modal:close'])
      document.addEventListener(t, (e) => w.__ev.push(`${e.type}:${(e.target as HTMLElement).dataset.layer}`));
  });
  return errors;
}

const host = (layer: string) => `modal-dialog[data-layer="${layer}"]`;
const open = (page: Page, layer: string, opener?: string) =>
  page.evaluate(([l, o]) => (document.querySelector(l) as any).open(o ? document.querySelector(`[data-testid="${o}"]`) : undefined), [host(layer), opener ?? ''] as const);
const isOpen = (page: Page, testid: string) => page.getByTestId(testid).evaluate((d: HTMLDialogElement) => d.open && d.matches(':modal'));
const events = (page: Page) => page.evaluate(() => (window as any).__ev as string[]);
const activeTestId = (page: Page) => page.evaluate(() => document.activeElement?.getAttribute('data-testid') ?? document.activeElement?.tagName);

test.describe('ES1-T315 tĩnh', () => {
  test.beforeEach(({}, ti) => test.skip(ti.project.name !== 'desktop', 'tĩnh, chạy 1 lần'));

  test('trần 2 048 B (ADR 0007, 0010), không console/fetch/import tĩnh, không tạo DOM, không style inline, guard define', () => {
    expect(statSync(JS_FILE).size).toBeLessThanOrEqual(2048);
    expect(JS).not.toMatch(/console\.|fetch\(|partials|^\s*import\s|import\(/m);
    expect(JS).not.toMatch(/createElement|insertAdjacent|innerHTML|\.style\b/);
    expect(JS).toContain('if (!customElements.get("modal-dialog")) customElements.define("modal-dialog"');
    for (const hook of ['showModal()', '"modal:"', 'scroll-lock', 'sheetBelow', 'returnFocus', 'aria-labelledby', '[autofocus]', '[data-modal-close],.close-button', 'shopify:block:', 'passive: true', 'disconnectedCallback'])
      expect(JS, hook).toContain(hook);
  });

  test('CSS FE khớp hook: modal-dialog display contents, dialog[scroll-lock][open] khoá cuộn, chuyển động trong no-preference', () => {
    expect(BASE).toMatch(/modal-dialog\s*\{\s*display:\s*contents/);
    expect(CRITICAL).toMatch(/html:has\(dialog\[scroll-lock\]\[open\]/);
    const at = BASE.indexOf('.dialog:not([open])');
    expect(at).toBeGreaterThan(0);
    const media = BASE.lastIndexOf('@media (prefers-reduced-motion', at);
    expect(BASE.slice(media, media + 60)).toContain('no-preference');
  });

  test('layout: đúng 1 thẻ script module modal-dialog.js (FE/Orchestrator thêm, ES1-T452)', () => {
    const tags = LAYOUT.match(/<script[^>]*'modal-dialog\.js'\s*\|\s*asset_url[^>]*>/g) ?? [];
    expect(tags).toHaveLength(1);
    expect(tags[0]).toContain('type="module"');
  });
});

test.describe('ES1-T315 hành vi (fixture, 1280)', () => {
  test.beforeEach(({}, ti) => test.skip(ti.project.name !== 'desktop', 'fixture tĩnh, chạy ở desktop; vuốt ở mobile'));

  test('open(opener): showModal, focus tiêu đề, khoá cuộn, nền inert, modal:open; Esc đóng → focus về nút mở, modal:close', async ({ page }) => {
    const errors = await mount(page, 1280);
    await page.getByTestId('open-qv').click();
    await open(page, 'quick-view', 'open-qv');
    expect(await isOpen(page, 'quick-view-dialog')).toBe(true);
    await expect(page.getByTestId('qv-title')).toBeFocused();
    await expect(page.getByTestId('qv-title')).toHaveAttribute('tabindex', '-1');
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe('hidden');
    // Nền inert: Tab đi qua nút đóng, Add To Cart, không ra nền
    for (let i = 0; i < 2; i++) {
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => !!document.activeElement?.closest('dialog'))).toBe(true);
    }
    expect(await events(page)).toEqual(['modal:open:quick-view']);
    await page.keyboard.press('Escape');
    await expect.poll(() => isOpen(page, 'quick-view-dialog')).toBe(false);
    await expect(page.getByTestId('open-qv')).toBeFocused();
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).not.toBe('hidden');
    await expect.poll(() => events(page)).toEqual(['modal:open:quick-view', 'modal:close:quick-view']);
    expect(errors).toEqual([]);
  });

  test('nút đóng .close-button và [data-modal-close] đóng; open() lặp khi đang mở không nhân đôi sự kiện', async ({ page }) => {
    await mount(page, 1280);
    await open(page, 'quick-view', 'open-qv');
    await open(page, 'quick-view', 'open-qv');
    await page.getByTestId('quick-view-close').click();
    await expect.poll(() => isOpen(page, 'quick-view-dialog')).toBe(false);
    await expect(page.getByTestId('open-qv')).toBeFocused();
    await open(page, 'cart', 'open-cart');
    await page.getByTestId('cart-keep').click();
    await expect.poll(() => isOpen(page, 'cart-dialog')).toBe(false);
    await expect(page.getByTestId('open-cart')).toBeFocused();
    await expect.poll(() => events(page)).toEqual(['modal:open:quick-view', 'modal:close:quick-view', 'modal:open:cart', 'modal:close:cart']);
  });

  test('chạm scrim (::backdrop) đóng; bấm trong thân, trên thanh tiêu đề không đóng', async ({ page }) => {
    await mount(page, 1280);
    await open(page, 'quick-view', 'open-qv');
    await page.getByTestId('qv-header').click();
    await page.getByTestId('qv-add').click();
    expect(await isOpen(page, 'quick-view-dialog')).toBe(true);
    await page.mouse.click(10, 10);
    await expect.poll(() => isOpen(page, 'quick-view-dialog')).toBe(false);
    await expect(page.getByTestId('open-qv')).toBeFocused();
    // Drawer mép phải: chạm vùng trái là scrim
    await open(page, 'cart', 'open-cart');
    expect(await isOpen(page, 'cart-dialog')).toBe(true);
    await page.mouse.click(20, 450);
    await expect.poll(() => isOpen(page, 'cart-dialog')).toBe(false);
  });

  test('một lớp một lúc: mở cart từ nút trong quickview → quickview đóng, cart đóng → focus về nút Quick view', async ({ page }) => {
    await mount(page, 1280);
    await page.getByTestId('open-qv').focus();
    await open(page, 'quick-view', 'open-qv');
    await open(page, 'cart', 'qv-add');
    expect(await isOpen(page, 'quick-view-dialog')).toBe(false);
    expect(await isOpen(page, 'cart-dialog')).toBe(true);
    await expect(page.getByTestId('cart-title')).toBeFocused();
    expect(await page.evaluate(() => document.querySelectorAll('dialog:modal').length)).toBe(1);
    await page.keyboard.press('Escape');
    await expect.poll(() => isOpen(page, 'cart-dialog')).toBe(false);
    await expect(page.getByTestId('open-qv')).toBeFocused();
    // Sự kiện close của <dialog> là task sau, nên close:quick-view đến sau open:cart
    await expect.poll(() => events(page)).toEqual(['modal:open:quick-view', 'modal:open:cart', 'modal:close:quick-view', 'modal:close:cart']);
  });

  test('data-return-focus: open() không opener (vd sau thêm giỏ) → đóng thì focus về phần tử id đó', async ({ page }) => {
    await mount(page, 1280);
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await open(page, 'cart');
    await page.getByTestId('cart-close').click();
    await expect.poll(() => isOpen(page, 'cart-dialog')).toBe(false);
    await expect(page.getByTestId('open-cart')).toBeFocused();
  });

  test('popup tự mở có [autofocus]: focus vào ô FE chọn; form method=dialog đóng, phát modal:close, focus về chỗ cũ', async ({ page }) => {
    await mount(page, 1280);
    await page.getByTestId('open-cart').focus();
    await open(page, 'newsletter');
    await expect(page.getByTestId('nl-email')).toBeFocused();
    await page.getByTestId('nl-dismiss').click();
    await expect.poll(() => isOpen(page, 'newsletter-dialog')).toBe(false);
    await expect(page.getByTestId('open-cart')).toBeFocused();
    await expect.poll(() => events(page)).toEqual(['modal:open:newsletter', 'modal:close:newsletter']);
  });

  test('theme editor: shopify:block:select trong lớp → mở; deselect → đóng; gỡ element không lỗi', async ({ page }) => {
    const errors = await mount(page, 1280);
    const fire = (t: string) => page.getByTestId('nl-block').evaluate((el, type) => el.dispatchEvent(new CustomEvent(type, { bubbles: true })), t);
    await fire('shopify:block:select');
    expect(await isOpen(page, 'newsletter-dialog')).toBe(true);
    await fire('shopify:block:deselect');
    await expect.poll(() => isOpen(page, 'newsletter-dialog')).toBe(false);
    // Render lại block: gỡ + gắn lại không treo listener cũ (một lần mở = một sự kiện)
    await page.evaluate((sel) => {
      const el = document.querySelector(sel)!;
      const parent = el.parentNode!;
      el.remove();
      parent.appendChild(el);
    }, host('newsletter'));
    await fire('shopify:block:select');
    await fire('shopify:block:deselect');
    await expect.poll(() => events(page)).toEqual(['modal:open:newsletter', 'modal:close:newsletter', 'modal:open:newsletter', 'modal:close:newsletter']);
    expect(errors).toEqual([]);
  });

  test('prefers-reduced-motion: reduce → mở không có animation trượt/scale', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await mount(page, 1280);
    await open(page, 'quick-view', 'open-qv');
    const motion = await page.getByTestId('quick-view-dialog').evaluate((d) => ({
      anims: d.getAnimations().length,
      translate: getComputedStyle(d).translate,
      scale: getComputedStyle(d).scale,
    }));
    expect(motion).toEqual({ anims: 0, translate: 'none', scale: 'none' });
  });
});

test.describe('ES1-T315 vuốt sheet (mobile, cảm ứng)', () => {
  test.beforeEach(({}, ti) => test.skip(ti.project.name !== 'mobile', 'cần hasTouch (Pixel 7)'));

  /** Phát touchstart/touchend tổng hợp trên phần tử (Chromium có Touch khi hasTouch). */
  const swipe = (page: Page, testid: string, dy: number, dx = 0) =>
    page.getByTestId(testid).evaluate(
      (el, [dy, dx]) => {
        const r = el.getBoundingClientRect();
        const x = r.left + 20;
        const y = r.top + 10;
        const t = (cx: number, cy: number) => new Touch({ identifier: 1, target: el, clientX: cx, clientY: cy });
        el.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, touches: [t(x, y)], changedTouches: [t(x, y)] }));
        el.dispatchEvent(new TouchEvent('touchend', { bubbles: true, touches: [], changedTouches: [t(x + dx, y + dy)] }));
      },
      [dy, dx]
    );

  test('dưới 48rem: vuốt xuống > 80px đóng, trả focus; vuốt ngắn, vuốt ngang không đóng', async ({ page }) => {
    const errors = await mount(page, 412, 860);
    await open(page, 'quick-view', 'open-qv');
    await swipe(page, 'qv-header', 40);
    await swipe(page, 'qv-header', 100, 160);
    expect(await isOpen(page, 'quick-view-dialog')).toBe(true);
    await swipe(page, 'qv-header', 120);
    await expect.poll(() => isOpen(page, 'quick-view-dialog')).toBe(false);
    await expect(page.getByTestId('open-qv')).toBeFocused();
    expect(errors).toEqual([]);
  });

  test('thân sheet đang cuộn: vuốt xuống là cuộn, không đóng', async ({ page }) => {
    await mount(page, 412, 860);
    await open(page, 'quick-view', 'open-qv');
    await page.getByTestId('qv-body').evaluate((b) => (b.scrollTop = 200));
    await swipe(page, 'qv-long', 150);
    expect(await isOpen(page, 'quick-view-dialog')).toBe(true);
  });

  test('từ 48rem (dialog giữa màn) và drawer không data-sheet-below: vuốt không đóng', async ({ page }) => {
    await mount(page, 1024, 800);
    await open(page, 'quick-view', 'open-qv');
    await swipe(page, 'qv-header', 150);
    expect(await isOpen(page, 'quick-view-dialog')).toBe(true);
    await page.setViewportSize({ width: 412, height: 860 });
    await open(page, 'cart', 'open-cart');
    await swipe(page, 'cart-title', 150);
    expect(await isOpen(page, 'cart-dialog')).toBe(true);
  });
});

test.describe('ES1-T315 storefront', () => {
  test('modal-dialog được define trên mọi trang, 0 lỗi console (cần thẻ script trong layout, ES1-T452)', async ({ page }) => {
    const errors: string[] = [];
    const isShopPay403 = watchShopPay403(page);
    page.on('console', (msg) => {
      if (msg.type() !== 'error' || isShopPay403(msg)) return;
      if (IGNORE_CONSOLE.some((r) => r.test(msg.text()) || r.test(msg.location().url))) return;
      errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
    for (const path of ['/', '/collections/all', '/cart', '/search?q=a']) {
      await page.goto(path);
      await expectNotChallenged(page);
      await expect.poll(() => page.evaluate(() => !!customElements.get('modal-dialog'))).toBe(true);
      expect(await page.locator('script[src*="/modal-dialog.js"]').count()).toBe(1);
    }
    expect(errors).toEqual([]);
  });
});
