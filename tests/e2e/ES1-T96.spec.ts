// KHÔNG CHẮC: spec chưa chạy (phiên agent không mở được trình duyệt, không có node_modules) → chờ CI.
// Ticket ES1-T96 TE-5-BE1: assets/cart-drawer.js + assets/product-form.js (docs/srs.md#TE-5 AC1, AC6; TE-4 AC8; drafts/techlead/ES1-T89/task-split.md D7, D10, D11).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... [EXPECT_CART_TYPE=page] npx playwright test tests/e2e/ES1-T96.spec.ts -g "AC1|AC6|AC8"
// Preview chỉ có 1 giá trị cart_type: AC6 flip data-cart-type trên DOM; EXPECT_CART_TYPE=page chạy nhánh thật (D12).
import { test as base, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { env } from './support/store-data';
import { CART, CART_GLOB, cartApi } from './support/cart-api';
import { readCartJson } from './support/product-data';

type CartJs = { item_count: number; items: { key: string; variant_id: number; quantity: number }[] };
type Guard = { allowNetworkLog: () => void };

const HANDLE = env('TE4_VARIANTS_HANDLE', 'TE4_SINGLE_HANDLE');
const PAGE_MODE = process.env.EXPECT_CART_TYPE === 'page';
const ROOT = process.cwd();
const IGNORE_CONSOLE = /shopifycloud|monorail|web-pixels|trekkie|shop\.app|shopifysvc\.com|cdn\.shopify\.com\/s\/(trekkie|javascripts)|status of 429/i;
const NETWORK_LOG = /Failed to load resource/i;
// assets/cart-items.js thuộc ES1-T97, chưa có thì lần mở đầu import 404. Chỉ bỏ log mạng của đúng file này; lỗi JS vẫn bị bắt.
const ITEMS_ASSET = /\/cart-items\.js/;
const MOCK_422 = { status: 422, message: 'Cart Error', description: 'ES1-T96 mock: sold out.' };

const isCart = (url: URL) => /\/cart\/?$/.test(url.pathname);

const test = base.extend<{ guard: Guard }>({
  guard: [
    async ({ page }, use, info) => {
      const errors: string[] = [];
      let allowNetwork = false;
      page.on('console', (msg) => {
        if (msg.type() !== 'error') return;
        const text = msg.text();
        const source = msg.location().url;
        if (IGNORE_CONSOLE.test(text) || IGNORE_CONSOLE.test(source)) return;
        if (NETWORK_LOG.test(text) && (allowNetwork || ITEMS_ASSET.test(source))) return;
        errors.push(`${text} @ ${source}`);
      });
      page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
      await use({ allowNetworkLog: () => (allowNetwork = true) });
      if (info.status !== 'skipped') expect(errors, `console error:\n${errors.join('\n')}`).toEqual([]);
    },
    { auto: true },
  ],
});

const tid = (page: Page, id: string) => page.getByTestId(id);
const dialog = (page: Page) => tid(page, 'cart-drawer-dialog');
const add = (page: Page) => tid(page, 'product-form-add');
const stayed = (page: Page) => page.evaluate(() => (window as unknown as { __t96?: number }).__t96 === 1);

async function openProduct(page: Page, elements = ['product-form', 'cart-drawer']) {
  test.skip(!HANDLE, 'Thiếu TE4_VARIANTS_HANDLE / TE4_SINGLE_HANDLE');
  await page.goto(`/products/${HANDLE}`);
  await expect(tid(page, 'product-form')).toHaveCount(1);
  await page.waitForFunction((names) => names.every((n) => !!customElements.get(n)), elements);
  test.skip(await add(page).isDisabled(), 'Variant mặc định hết hàng, không thêm giỏ được');
  // Cờ trong window: còn thì trang chưa điều hướng.
  await page.evaluate(() => ((window as unknown as { __t96: number }).__t96 = 1));
}

async function openDrawerProduct(page: Page) {
  test.skip(PAGE_MODE, 'Preview đặt cart_type page: không có dialog');
  await openProduct(page);
}

// Mở bằng thêm giỏ; chờ partial xong và product-form mở khoá thì opener mới nhận focus được.
async function addAndOpen(page: Page) {
  await add(page).click();
  await expect(dialog(page)).toBeVisible();
  await expect(dialog(page)).not.toHaveAttribute('aria-busy', /.*/);
  await expect(add(page)).toBeEnabled();
}

async function expectModal(page: Page) {
  await expect(dialog(page)).toBeVisible();
  expect(await dialog(page).evaluate((el) => el.matches(':modal'))).toBe(true);
}

test.describe('ES1-T96 contract', () => {
  const read = (path: string) => readFileSync(join(ROOT, path), 'utf8');

  test('AC1 AC6 AC8 contract: bundle, thẻ script, partial, hook khớp markup', () => {
    const js = read('assets/cart-drawer.js');
    const form = read('assets/product-form.js');
    const block = read('blocks/cart-drawer.liquid');
    const header = read('blocks/header.liquid');
    expect(Buffer.byteLength(js), 'cart-drawer.js tối đa 2816 B').toBeLessThanOrEqual(2816);
    expect(Buffer.byteLength(form), 'product-form.js tối đa 6900 B').toBeLessThanOrEqual(6900);
    expect([...block.matchAll(/<script src="\{\{ 'cart-drawer\.js' \| asset_url \}\}" type="module"><\/script>/g)]).toHaveLength(1);
    expect(block).toMatch(/<cart-drawer\b/);
    expect(js).toContain('customElements.define("cart-drawer"');
    // Tên partial là rest args, khớp {% partial %} ở block và header.
    expect(js).toContain('partials.fetch("cart-drawer", "cart-count", {');
    expect(block).toContain("{% partial 'cart-drawer' %}");
    expect(header).toContain("{% partial 'cart-count' %}");
    for (const hook of ['data-mode=', 'data-items-src=', 'data-cart-url=', 'data-item-count=', 'data-cart-accelerated', 'name="updates[]"']) {
      expect(block + read('snippets/cart-lines.liquid'), `thiếu ${hook}`).toContain(hook);
    }
    expect(header).toContain('data-cart-link');
    // Import tĩnh giữa asset nhân đôi module (ES1-T81).
    expect(js).not.toMatch(/^import .*(\.js|\.\/)/m);
    expect(js).toContain('import(this.dataset.itemsSrc)');
    expect(form).toContain('opener: submitter');
    expect(form).toContain('!document.querySelector("cart-drawer dialog") || !customElements.get("cart-drawer")');
  });
});

test.describe('ES1-T96 TE-5 cart drawer', () => {
  test.beforeEach(async ({ page }) => {
    await cartApi(page, CART.clear);
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('AC1 thêm giỏ: dialog modal mở, có line vừa thêm, cart-count đúng, không điều hướng, axe', async ({ page }) => {
    await openDrawerProduct(page);
    const variantId = Number(await tid(page, 'product-form-variant-id').inputValue());
    await addAndOpen(page);
    await expectModal(page);
    expect(await stayed(page)).toBe(true);

    const cart = await readCartJson<CartJs>(page);
    const line = cart.items.find((i) => i.variant_id === variantId);
    expect(line, 'giỏ có variant vừa thêm').toBeTruthy();
    const body = tid(page, 'cart-drawer-body');
    await expect(body).toHaveAttribute('data-item-count', String(cart.item_count));
    await expect(body.getByTestId('cart-line')).toHaveCount(cart.items.length);
    await expect(body.getByTestId('cart-line-quantity')).toHaveValue(String(line!.quantity));
    await expect(tid(page, 'header-cart-count')).toHaveText(String(cart.item_count));
    await expect(body.getByTestId('cart-checkout')).toBeVisible();

    // Giỏ rỗng lúc tải → accelerated hidden; có hàng → hiện sau apply. Store không bật wallet thì không có wrapper.
    const wallet = tid(page, 'cart-drawer-accelerated');
    if (await wallet.count()) expect(await wallet.evaluate((el: HTMLElement) => el.hidden)).toBe(false);

    expect(await page.evaluate(() => !!document.activeElement?.closest('dialog')), 'focus trong dialog').toBe(true);
    const { violations } = await new AxeBuilder({ page }).include('[data-testid="cart-drawer-dialog"]').analyze();
    expect(violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
  });

  test('AC1 thêm lần 2 cùng variant: ô số lượng theo server, apply không giữ số cũ', async ({ page }) => {
    await openDrawerProduct(page);
    await addAndOpen(page);
    const quantity = tid(page, 'cart-line-quantity');
    await expect(quantity).toHaveValue(/^\d+$/);
    await page.keyboard.press('Escape');
    await expect(dialog(page)).toBeHidden();
    await addAndOpen(page);
    const cart = await readCartJson<CartJs>(page);
    expect(cart.items).toHaveLength(1);
    await expect(quantity).toHaveValue(String(cart.items[0].quantity));
    await expect(tid(page, 'header-cart-count')).toHaveText(String(cart.item_count));
  });

  test('AC1 Esc và nút đóng trả focus về nút thêm giỏ', async ({ page }) => {
    await openDrawerProduct(page);
    await addAndOpen(page);
    await page.keyboard.press('Escape');
    await expect(dialog(page)).toBeHidden();
    await expect(add(page)).toBeFocused();

    await addAndOpen(page);
    await tid(page, 'cart-drawer-close').click();
    await expect(dialog(page)).toBeHidden();
    await expect(add(page)).toBeFocused();
  });

  test('AC1 bấm backdrop đóng, bấm trong dialog không đóng', async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) < 768, 'Dưới 48rem drawer toàn màn, không có backdrop');
    await openDrawerProduct(page);
    await addAndOpen(page);
    await tid(page, 'cart-drawer-heading').click();
    await expect(dialog(page)).toBeVisible();
    await page.mouse.click(10, 300);
    await expect(dialog(page)).toBeHidden();
    await expect(add(page)).toBeFocused();
  });

  test('AC1 opener bị gỡ hoặc disabled: focus về cart link', async ({ page }) => {
    await openDrawerProduct(page);
    await addAndOpen(page);
    await add(page).evaluate((el: HTMLButtonElement) => (el.disabled = true));
    await page.keyboard.press('Escape');
    await expect(tid(page, 'header-cart-link')).toBeFocused();

    await add(page).evaluate((el: HTMLButtonElement) => (el.disabled = false));
    await addAndOpen(page);
    await add(page).evaluate((el) => el.remove());
    await page.keyboard.press('Escape');
    await expect(tid(page, 'header-cart-link')).toBeFocused();
  });

  test('AC1 cart link: chặn điều hướng, refresh rồi mở, Esc về link; sau khi partial thay link vẫn mở được', async ({ page }) => {
    await openDrawerProduct(page);
    for (let i = 0; i < 2; i++) {
      await tid(page, 'header-cart-link').click();
      await expectModal(page);
      expect(await stayed(page)).toBe(true);
      await page.keyboard.press('Escape');
      await expect(dialog(page)).toBeHidden();
      await expect(tid(page, 'header-cart-link')).toBeFocused();
    }
  });

  test('AC1 cart link bấm kèm phím bổ trợ: giữ hành vi trình duyệt', async ({ page }) => {
    await openDrawerProduct(page);
    const prevented = await tid(page, 'header-cart-link').evaluate((el) => {
      let result: boolean | null = null;
      // window chạy sau document: đọc kết quả rồi tự chặn để test không mở tab.
      window.addEventListener('click', (e) => { result = e.defaultPrevented; e.preventDefault(); }, { once: true });
      el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true }));
      return result;
    });
    expect(prevented).toBe(false);
    await expect(dialog(page)).toBeHidden();
  });

  test('AC1 cart-items.js: chưa tải trước khi mở, chỉ import 1 lần', async ({ page }) => {
    const requests: string[] = [];
    page.on('request', (r) => { if (ITEMS_ASSET.test(r.url())) requests.push(r.url()); });
    await openDrawerProduct(page);
    expect(requests).toHaveLength(0);
    await tid(page, 'header-cart-link').click();
    await expectModal(page);
    await expect.poll(() => requests.length).toBe(1);
    await page.keyboard.press('Escape');
    await tid(page, 'header-cart-link').click();
    await expectModal(page);
    expect(requests).toHaveLength(1);
  });

  test('AC1 refresh lỗi khi thêm giỏ: chuyển /cart, giỏ vẫn có hàng', async ({ page, guard }) => {
    guard.allowNetworkLog();
    await openDrawerProduct(page);
    const path = new URL(page.url()).pathname;
    await page.route((url) => url.pathname === path, (route) => (route.request().resourceType() === 'fetch' ? route.abort() : route.fallback()));
    await add(page).click();
    await page.waitForURL(isCart);
    expect((await readCartJson<CartJs>(page)).item_count).toBeGreaterThan(0);
  });

  test('AC1 lỗi 422: không mở drawer, lỗi ở role=alert', async ({ page, guard }) => {
    guard.allowNetworkLog();
    await openDrawerProduct(page);
    await page.route(CART_GLOB.add, (route) => route.fulfill({ status: 422, contentType: 'application/json', body: JSON.stringify(MOCK_422) }));
    await add(page).click();
    await expect(tid(page, 'product-form-error')).toHaveText(MOCK_422.description);
    await expect(dialog(page)).toBeHidden();
    expect(await stayed(page)).toBe(true);
  });

  test('AC1 event source cart-items: bỏ qua, không refresh, không mở', async ({ page }) => {
    await openDrawerProduct(page);
    const path = new URL(page.url()).pathname;
    let fetched = 0;
    page.on('request', (r) => { if (r.resourceType() === 'fetch' && new URL(r.url()).pathname === path) fetched++; });
    await page.evaluate(() => document.dispatchEvent(new CustomEvent('theme:cart:updated', { bubbles: true, detail: { source: 'cart-items' } })));
    await page.waitForTimeout(500);
    expect(fetched).toBe(0);
    await expect(dialog(page)).toBeHidden();
  });

  test('AC1 bfcache: refresh cart-count từ server, không mở; refresh lỗi không rời trang', async ({ page, guard }) => {
    guard.allowNetworkLog();
    await openDrawerProduct(page);
    const url = await tid(page, 'product-form').getAttribute('data-cart-add-url');
    const id = await tid(page, 'product-form-variant-id').inputValue();
    await page.evaluate(async ({ url, id }) => {
      await fetch(`${url}.js`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: Number(id), quantity: 1 }) });
    }, { url, id });
    const persisted = () => page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
    await persisted();
    await expect(tid(page, 'header-cart-count')).toHaveText(String((await readCartJson<CartJs>(page)).item_count));
    await expect(tid(page, 'cart-drawer-body')).toHaveAttribute('data-item-count', /^[1-9]/);
    await expect(dialog(page)).toBeHidden();

    const path = new URL(page.url()).pathname;
    await page.route((u) => u.pathname === path, (route) => (route.request().resourceType() === 'fetch' ? route.abort() : route.fallback()));
    await persisted();
    await expect(dialog(page)).not.toHaveAttribute('aria-busy', /.*/);
    expect(await stayed(page)).toBe(true);
  });

  test('AC1 theme editor: shopify:block:select mở, deselect đóng', async ({ page }) => {
    await openDrawerProduct(page);
    const fire = (type: string) => tid(page, 'cart-drawer').evaluate((el, t) => el.dispatchEvent(new CustomEvent(t, { bubbles: true })), type);
    await fire('shopify:block:select');
    await expectModal(page);
    await fire('shopify:block:deselect');
    await expect(dialog(page)).toBeHidden();
  });

  test('AC6 flip data-cart-type page: thêm giỏ chuyển /cart', async ({ page }) => {
    await openDrawerProduct(page);
    await tid(page, 'product-form').evaluate((el) => el.setAttribute('data-cart-type', 'page'));
    await add(page).click();
    await page.waitForURL(isCart);
    expect((await readCartJson<CartJs>(page)).item_count).toBeGreaterThan(0);
  });

  test('AC6 cart_type page thật: không dialog, thêm giỏ chuyển /cart', async ({ page }) => {
    test.skip(!PAGE_MODE, 'Cần preview đặt cart_type page + EXPECT_CART_TYPE=page (D12)');
    await openProduct(page);
    await expect(dialog(page)).toHaveCount(0);
    await add(page).click();
    await page.waitForURL(isCart);
  });

  test('AC6 trang /cart: data-mode none, cart link điều hướng thường, không lỗi', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForFunction(() => !!customElements.get('cart-drawer'));
    await expect(tid(page, 'cart-drawer')).toHaveAttribute('data-mode', 'none');
    await tid(page, 'header-cart-link').click();
    await page.waitForURL(isCart);
    await expect(tid(page, 'cart-page')).toBeVisible();
  });

  test('AC8 script drawer lỗi (route.abort cart-drawer.js): thêm giỏ vẫn chuyển /cart', async ({ page, guard }) => {
    guard.allowNetworkLog();
    await page.route(/\/cart-drawer\.js(\?|$)/, (route) => route.abort());
    await openProduct(page, ['product-form']);
    expect(await page.evaluate(() => !!customElements.get('cart-drawer'))).toBe(false);
    await add(page).click();
    await page.waitForURL(isCart);
    expect((await readCartJson<CartJs>(page)).item_count).toBeGreaterThan(0);
  });

  test('AC8 theme:cart:updated có opener là nút đã bấm', async ({ page }) => {
    await page.addInitScript(() => {
      document.addEventListener('theme:cart:updated', (e) => {
        (window as unknown as { __opener?: string | null }).__opener = (e as CustomEvent).detail?.opener?.getAttribute('data-testid') ?? null;
      });
    });
    await openDrawerProduct(page);
    await addAndOpen(page);
    expect(await page.evaluate(() => (window as unknown as { __opener?: string | null }).__opener)).toBe('product-form-add');
  });
});
