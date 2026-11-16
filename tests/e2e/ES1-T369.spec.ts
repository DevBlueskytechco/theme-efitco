// ES1-T369 (TE-5-R2-FE2): cart page — lưới 5 cột, đầu trang, panel tóm tắt, thanh checkout dính, quantity rule, volume,
// empty Bestsellers (docs/srs.md#TE-5 AC5, AC9, AC10; AC14, AC17, AC19 phần markup; docs/ui-spec/cart.md §1–§3, §5).
// Tĩnh: đọc file + fixture page.setContent với assets/base.css, assets/critical.css thật và token mặc định (space_base 4),
// không gọi store. Phần cần dữ liệu store (B2B quantity rule, price break, selling plan) do ES1-T99 kiểm (mockup nếu
// store không bật B2B, ES1-T297 #1).
// Chạy: npx playwright test tests/e2e/ES1-T369.spec.ts
import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const read = (path: string) => readFileSync(path, 'utf8');
const BASE = read('assets/base.css');
const CRITICAL = read('assets/critical.css');
const PAGE = read('blocks/cart-page.liquid');
const LINES = read('snippets/cart-lines.liquid');
const SUMMARY = read('snippets/cart-summary.liquid');
const LOCALE = JSON.parse(read('locales/en.default.json'));
const SCHEMA_LOCALE = JSON.parse(read('locales/en.default.schema.json'));

const schemaOf = (liquid: string) => JSON.parse(liquid.split('{% schema %}')[1].split('{% endschema %}')[0]);
const cartCss = () => BASE.slice(BASE.indexOf('/** Cart (TE-5'), BASE.indexOf('/** Image with text (TE-7'));

const TOKENS = `:root{--space-1:4px;--space-2:8px;--space-3:12px;--space-4:16px;--space-5:24px;--space-6:32px;--space-7:48px;--space-8:120px;
--page-margin:20px;--page-width:91rem;--header-height:80px;--radius-input:8px;--radius-button:4px;--radius-card:12px;--radius-pill:999px;
--color-background:#fff;--color-foreground:#1a1a1a;--color-muted:#6b6b6b;--color-muted-light:#808080;--color-border:#e5e5e5;
--color-background-cream:#f5f5f1;--color-background-cream-foreground:#1a1a1a;--color-background-alt:#f4f4f5;--color-background-alt-foreground:#1a1a1a;
--color-background-dark:#1a1a1a;--color-background-dark-foreground:#fff;--color-background-panel:#393942;--color-accent:#c8400e;
--color-accent-foreground:#fff;--color-sale:#c8102e;--color-badge-new:#4b824d;
--font-size-xs:.8125rem;--font-size-sm:.875rem;--font-size-base:1rem;--font-size-lg:1.125rem;--font-size-h3:1.5rem;--font-size-h2:2rem;--font-size-h1:3rem;
--line-height-body:1.5;--line-height-heading:1.1;--font-heading--family:serif;--font-heading--weight:700;--font-heading--weight-display:800;
--font-primary--family:sans-serif;--motion-fast:150ms;--motion-base:250ms;--motion-slow:500ms;--ease-out:ease-out}`;

const icon = '<svg viewBox="0 0 24 24" aria-hidden="true"></svg>';
const line = (n: number, rule = false) => `
<li class="cart-line" data-line-key="k${n}" data-testid="cart-line">
  <a class="cart-line__media" href="#" tabindex="-1" aria-hidden="true"><span class="cart-line__image" data-testid="cart-line-image">${icon}</span></a>
  <div class="cart-line__details">
    <a class="cart-line__title" href="#" data-testid="cart-line-title">Iron Core Kettlebell ${n}</a>
    <div class="price cart-line__price"><span class="price__current" data-testid="cart-line-price">$119.00</span></div>
    ${rule ? '<p class="cart-line__volume" data-testid="cart-line-volume">' + icon + 'Volume pricing applied</p><p id="q' + n + '-rule" class="cart-line__rule" data-testid="cart-line-quantity-rule"><span>Min 6</span><span>Increments of 6</span></p>' : ''}
  </div>
  <div class="cart-line__controls">
    <label class="visually-hidden" for="q${n}">Quantity</label>
    <div class="cart-line__stepper">
      <button class="cart-line__step" type="button" aria-label="Decrease" data-testid="cart-line-decrease">${icon}</button>
      <input id="q${n}" class="cart-line__quantity" type="number" name="updates[]" value="2" min="0" data-testid="cart-line-quantity">
      <button class="cart-line__step" type="button" aria-label="Increase" data-testid="cart-line-increase">${icon}</button>
    </div>
    <a class="cart-line__remove" href="#" aria-label="Remove" data-testid="cart-line-remove">${icon}</a>
  </div>
  <p class="cart-line__total"><span data-testid="cart-line-total">$238.00</span></p>
  <p class="cart-line__error" data-testid="cart-line-error" hidden>${icon}<span>Enter a multiple of 6.</span></p>
</li>`;

// Rút gọn đúng cấu trúc blocks/cart-page.liquid + cart-lines + cart-summary xuất ra (giỏ 3 dòng, có JS: stepper hiện, thanh dính hiện).
const FIXTURE = (stickyHidden: boolean) => `
<main><div class="page-width" style="max-inline-size:none"><div class="cart-page" data-testid="cart-page">
<cart-items class="cart-items cart-page__items" data-testid="cart-items">
  <h1 class="cart-page__heading" tabindex="-1" data-testid="cart-page-heading">Cart</h1>
  <div class="visually-hidden" role="status" data-testid="cart-items-status"></div>
  <div class="cart-items__error" role="alert" data-testid="cart-items-error"></div>
  <div class="cart-page__body" data-item-count="3" data-testid="cart-page-body">
    <p class="cart-page__count" data-testid="cart-page-count">3 items</p>
    <a class="cart-page__continue" href="#" data-testid="cart-page-continue"><svg class="slideshow-icon slideshow-icon--arrow" width="16" height="14"></svg>Continue shopping</a>
    <form id="cart-form-page" class="cart-page__form" data-testid="cart-form">
      <div class="cart-page__main" data-testid="fx-main">
        <div class="cart-lines__head" aria-hidden="true" data-testid="cart-lines-head"><span>Product</span><span>Quantity</span><span>Total</span></div>
        <ul class="cart-lines" role="list" data-testid="cart-lines">${line(1)}${line(2, true)}${line(3)}</ul>
      </div>
      <div class="cart-summary cart-summary--page" data-testid="cart-summary">
        <div class="cart-summary__head"><h2 class="cart-summary__title">Order Summary</h2><span class="cart-summary__badge" data-testid="cart-summary-count">3 Items</span></div>
        <p class="cart-summary__row"><span>Subtotal</span><span data-testid="cart-subtotal">$714.00</span></p>
        <p class="cart-summary__row"><span>Shipping</span><span class="cart-summary__muted" data-testid="fx-shipping">Calculated at checkout</span></p>
        <p class="cart-summary__row cart-summary__row--total cart-summary__row--divided"><span>Total</span><span class="cart-summary__total" data-testid="cart-total">$714.00</span></p>
        <p class="cart-summary__note" data-testid="cart-tax-note">Taxes and shipping calculated at checkout.</p>
        <button class="button cart-summary__checkout" type="submit" name="checkout" form="cart-form-page" data-testid="cart-checkout">Checkout</button>
      </div>
    </form>
    <aside class="cart-sticky-checkout" aria-label="Cart total and checkout" data-testid="cart-sticky-checkout" ${stickyHidden ? 'hidden' : ''}>
      <p class="cart-sticky-checkout__total"><span>Total</span><strong>$714.00</strong></p>
      <button class="button cart-sticky-checkout__button" type="submit" name="checkout" form="cart-form-page" data-testid="cart-sticky-checkout-button">Checkout</button>
    </aside>
  </div>
  <div class="cart-page__accelerated" data-cart-accelerated data-testid="cart-page-accelerated"><p class="cart-page__or">or pay with</p></div>
  <div class="cart-page__note" data-testid="fx-note">
    <label class="cart-page__note-label" for="cart-note">Order note</label>
    <textarea id="cart-note" class="cart-page__note-input" name="note" form="cart-form-page" aria-describedby="cart-note-hint" data-testid="cart-page-note"></textarea>
    <p id="cart-note-hint" class="cart-page__note-hint">Optional.</p>
  </div>
</cart-items>
</div></div></main>`;

async function mount(page: Page, width: number, stickyHidden = true) {
  await page.setViewportSize({ width, height: 900 });
  await page.setContent(
    `<!doctype html><html lang="en"><head><title>cart</title><style>${TOKENS}</style><style>${CRITICAL}</style><style>${BASE}</style>
<style>body{margin:0}.page-width{padding-inline:var(--page-margin)}</style></head><body>${FIXTURE(stickyHidden)}</body></html>`,
  );
}
const box = async (page: Page, id: string, nth = 0) => (await page.getByTestId(id).nth(nth).boundingBox())!;

test.describe('ES1-T369 hợp đồng tĩnh', () => {
  test('cart-page: partial, hook BE, h1 trước live region, note ngoài partial, thanh dính hidden', () => {
    expect(PAGE).toContain('data-partials="cart-page cart-count"');
    expect(PAGE).toContain('data-label-updating=');
    const partial = PAGE.slice(PAGE.indexOf("{% partial 'cart-page' %}"), PAGE.indexOf('{% endpartial %}'));
    expect(PAGE.indexOf('data-testid="cart-page-heading"')).toBeLessThan(PAGE.indexOf('data-testid="cart-items-status"'));
    expect(PAGE.indexOf('<cart-items')).toBeLessThan(PAGE.indexOf('data-testid="cart-page-heading"'));
    expect(partial).not.toContain('cart-page-heading');
    for (const id of ['cart-page-count', 'cart-page-continue', 'cart-sticky-checkout', 'cart-sticky-checkout-button', 'cart-page-bestsellers']) {
      expect(partial, id).toContain(`data-testid="${id}"`);
    }
    expect(partial).not.toContain('cart-page-note');
    expect(partial).not.toContain('cart-page-accelerated');
    expect(partial).toMatch(/<aside[\s\S]*?aria-label="\{\{ 'cart\.sticky_checkout_label' \| t \}\}"[\s\S]*?hidden\s*>/);
    expect(partial).toContain('routes.all_products_collection_url');
    expect(PAGE).toContain('aria-describedby="cart-note-hint"');
    expect(PAGE).toContain('<p class="cart-page__or">');
    // Hai nút Checkout: chỉ 1 testid cart-checkout (tests ES1-T94, T97 dùng locator strict).
    expect([...(PAGE + SUMMARY).matchAll(/data-testid="cart-checkout"/g)]).toHaveLength(1);
  });

  test('cart-page schema: empty_cart_collection trống, show_sticky_checkout true, không presets, nhãn có locale', () => {
    const schema = schemaOf(PAGE);
    expect(schema.presets).toBeUndefined();
    const byId = Object.fromEntries(schema.settings.map((s: { id: string }) => [s.id, s]));
    expect(byId.empty_cart_collection.type).toBe('collection');
    expect(byId.empty_cart_collection.default, 'theme mới cài trống (ES1-T308 #1)').toBeUndefined();
    expect(byId.show_sticky_checkout.type).toBe('checkbox');
    expect(byId.show_sticky_checkout.default).toBe(true);
    for (const s of schema.settings) {
      const [group, key] = s.label.replace('t:', '').split('.');
      expect(SCHEMA_LOCALE[group][key], s.label).toBeTruthy();
      const [igroup, ikey] = s.info.replace('t:', '').split('.');
      expect(SCHEMA_LOCALE[igroup][ikey], s.info).toBeTruthy();
    }
  });

  test('cart-lines AC9: rule rút gọn, step/max chỉ khi có rule, min 0 giữ, lỗi dòng hidden; volume; hàng tiêu đề aria-hidden', () => {
    expect(LINES).toContain('data-testid="cart-line-quantity-rule"');
    expect(LINES).toContain('data-testid="cart-line-volume"');
    expect(LINES).toMatch(/data-testid="cart-line-error"\s+hidden/);
    expect(LINES).toContain('min="0"');
    expect(LINES).toMatch(/\{% if has_rule %\}\s*step="\{\{ rule_increment \}\}"/);
    for (const hook of ['data-quantity-rule', 'data-quantity-min=', 'data-quantity-max=', 'data-quantity-step=', 'data-cart-line-error', 'aria-describedby="{{ quantity_id }}-rule"']) {
      expect(LINES, hook).toContain(hook);
    }
    expect(LINES).toContain('item.quantity <= rule_min');
    expect(LINES).toMatch(/class="cart-lines__head" aria-hidden="true"/);
    // ADR 0008: không lặp product.variants.
    expect(LINES).not.toMatch(/for \w+ in [\w.]*product\.variants/);
    // Thứ tự AC12: giá → volume → rule → stepper → thành tiền → lỗi dòng.
    const order = ['cart-line-price', 'cart-line-volume', 'cart-line-quantity-rule', 'cart-line-decrease', 'cart-line-remove', 'cart-line-total', 'cart-line-error'];
    const at = order.map((id) => LINES.indexOf(`data-testid="${id}"`));
    expect(at).toEqual([...at].sort((a, b) => a - b));
  });

  test('cart-summary AC14: đầu panel, Shipping, Secure checkout, icon thanh toán chỉ ở page', () => {
    for (const id of ['cart-summary-heading', 'cart-summary-count', 'cart-shipping', 'cart-secure', 'cart-payment-icons']) {
      expect(SUMMARY, id).toContain(`data-testid="${id}"`);
    }
    expect(SUMMARY).toContain('payment_type_svg_tag');
    expect(SUMMARY).toContain("{%- if context == 'page' -%}");
  });

  test('locale: key mới có trong nhóm cart, không trùng key trong nhóm', () => {
    const cart = LOCALE.cart;
    for (const key of ['continue_shopping_link', 'empty_eyebrow', 'express_divider', 'note_page_hint', 'product_column', 'quantity_column',
      'quantity_rule_error', 'quantity_rule_error_no_max', 'quantity_rule_increment', 'quantity_rule_max', 'quantity_rule_min', 'secure_checkout',
      'shipping', 'shipping_at_checkout_short', 'sticky_checkout_label', 'summary_title', 'updating', 'volume_pricing_applied']) {
      expect(cart[key], key).toBeTruthy();
    }
    expect(cart.item_count_badge.one).toContain('{{ count }}');
    const raw = read('locales/en.default.json');
    const block = raw.slice(raw.indexOf('"cart": {'), raw.indexOf('"customers": {'));
    const keys = [...block.matchAll(/^ {4}"([a-z_]+)":/gm)].map((m) => m[1]);
    expect(keys.length).toBe(new Set(keys).size);
  });

  test('CSS cart: 0 literal màu, chỉ logical, z-index qua --layer-*, base.css ≤ 53 248 B gzip', () => {
    const css = cartCss();
    expect(css.match(/#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(/gi)).toBeNull();
    expect(css.match(/^\s*(left|right|top|bottom|width|height|(margin|padding)-(left|right|top|bottom))\s*:/gm)).toBeNull();
    expect(css.match(/z-index:\s*\d/g)).toBeNull();
    const size = gzipSync(BASE).length;
    test.info().annotations.push({ type: 'base.css gzip', description: String(size) });
    expect(size).toBeLessThanOrEqual(53248);
  });
});

test.describe('ES1-T369 bố cục (fixture, base.css thật)', () => {
  test('1280: cột dòng hàng 795 + panel 397 gap 48, panel dính, hàng 5 cột, thanh dính không hiện', async ({ page }) => {
    await mount(page, 1280, false);
    const main = await box(page, 'fx-main');
    const summary = await box(page, 'cart-summary');
    expect(Math.abs(main.width - 795)).toBeLessThanOrEqual(2);
    expect(Math.abs(summary.width - 397)).toBeLessThanOrEqual(2);
    expect(Math.abs(summary.x - (main.x + main.width) - 48)).toBeLessThanOrEqual(2);
    expect(Math.abs(summary.y - main.y)).toBeLessThanOrEqual(2);
    expect(await page.getByTestId('cart-summary').evaluate((el) => getComputedStyle(el).position)).toBe('sticky');
    // Đầu trang: h1 · số món cùng hàng, link quay lại bên phải cùng hàng.
    const h1 = await box(page, 'cart-page-heading');
    const count = await box(page, 'cart-page-count');
    const back = await box(page, 'cart-page-continue');
    expect(count.x).toBeGreaterThan(h1.x + h1.width);
    expect(back.y).toBeLessThan(main.y);
    expect(Math.abs(back.x + back.width - (summary.x + summary.width))).toBeLessThanOrEqual(2);
    // 5 cột: ảnh 120, số lượng, thành tiền, xoá cùng hàng.
    const media = await page.locator('.cart-line__media').first().boundingBox();
    expect(Math.round(media!.width)).toBe(120);
    const stepper = await box(page, 'cart-line-decrease');
    const remove = await box(page, 'cart-line-remove');
    const total = await box(page, 'cart-line-total');
    expect(Math.abs(stepper.y - remove.y)).toBeLessThanOrEqual(1);
    expect(remove.x).toBeGreaterThan(total.x);
    await expect(page.getByTestId('cart-lines-head')).toBeVisible();
    await expect(page.getByTestId('cart-sticky-checkout')).toBeHidden();
    // Ghi chú cột trái dưới dòng hàng, accelerated cột phải.
    const note = await box(page, 'fx-note');
    const accelerated = await box(page, 'cart-page-accelerated');
    expect(note.y).toBeGreaterThan(main.y + main.height - 1);
    expect(Math.abs(accelerated.x - summary.x)).toBeLessThanOrEqual(2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(1280);
  });

  test('768: 5 cột (ảnh 120, xoá 44), panel dưới full width, Checkout 48', async ({ page }) => {
    await mount(page, 768);
    const main = await box(page, 'fx-main');
    const summary = await box(page, 'cart-summary');
    expect(Math.abs(summary.width - main.width)).toBeLessThanOrEqual(1);
    expect(summary.y).toBeGreaterThan(main.y + main.height - 1);
    const media = await page.locator('.cart-line__media').first().boundingBox();
    expect(Math.round(media!.width)).toBe(120);
    const remove = await box(page, 'cart-line-remove');
    expect(Math.round(remove.width)).toBe(44);
    expect(Math.round((await box(page, 'cart-checkout')).height)).toBe(48);
    await expect(page.getByTestId('cart-lines-head')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(768);
  });

  test('360: ảnh 88, xoá trên hàng tên, stepper cạnh thành tiền, thứ tự dòng hàng → panel → accelerated → ghi chú, thanh dính 48', async ({ page }) => {
    await mount(page, 360, false);
    const media = await page.locator('.cart-line__media').first().boundingBox();
    expect(Math.round(media!.width)).toBe(88);
    const title = await box(page, 'cart-line-title');
    const remove = await box(page, 'cart-line-remove');
    const stepper = await box(page, 'cart-line-decrease');
    const total = await box(page, 'cart-line-total');
    expect(remove.y).toBeLessThan(stepper.y);
    expect(remove.x).toBeGreaterThan(title.x);
    expect(total.x).toBeGreaterThan(stepper.x);
    await expect(page.getByTestId('cart-lines-head')).toBeHidden();
    const ys = await Promise.all(['fx-main', 'cart-summary', 'cart-page-accelerated', 'fx-note'].map(async (id) => (await box(page, id)).y));
    expect(ys).toEqual([...ys].sort((a, b) => a - b));
    // Rule rút gọn và volume hiện trong cột thông tin.
    await expect(page.getByTestId('cart-line-quantity-rule')).toBeVisible();
    await expect(page.getByTestId('cart-line-volume')).toBeVisible();
    await expect(page.getByTestId('cart-line-error')).toBeHidden();
    const bar = page.getByTestId('cart-sticky-checkout');
    await expect(bar).toBeVisible();
    expect(await bar.evaluate((el) => getComputedStyle(el).position)).toBe('fixed');
    expect(Math.round((await box(page, 'cart-sticky-checkout-button')).height)).toBe(48);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  });

  test('thanh dính render với hidden thì không hiện (không JS)', async ({ page }) => {
    await mount(page, 360, true);
    await expect(page.getByTestId('cart-sticky-checkout')).toBeHidden();
  });
});
