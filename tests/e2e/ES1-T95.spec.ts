// KHÔNG CHẮC: nhóm "[#219]" chỉ chạy khi blocks/cart-drawer.liquid có partial cart-drawer-footer (markup ES1-T368, PR #219);
// develop trước merge #219 thì skip có lý do, QA chạy lại sau merge (ES1-T463). Chưa chạy trên preview ở phiên viết.
// Ticket ES1-T95 TE-5-FE2: markup cart drawer. Sửa theo ES1-T463 (CTO 14/11, ES1-T453): thiết kế mới ES1-T368.
// AC thay vào (docs/srs.md#TE-5 0.5):
//   AC1 (khung theo AC15), AC4 (chi tiết AC19), AC6, AC8 (ghi chú đơn ngoài partial), AC15 (90% / 420 / 480, header 72 h2 + pill
//   + View cart + nút đóng, thân cuộn riêng, chân panel có Checkout), AC19 (drawer rỗng: khối rỗng, không chân panel).
//   ES1-T453 #1: data-partials drawer = "cart-drawer cart-drawer-count cart-drawer-footer cart-count"; cart-checkout trong cart-drawer-footer.
//   Đã bỏ (thiết kế cũ D2/D6/D11 ES1-T89): rộng 100% / 448, data-partials "cart-drawer cart-count", cart-checkout trong cart-drawer-body,
//   schema cart-drawer không settings, đúng 1 h2 trong dialog (giỏ rỗng có thêm h2 "Your Cart Is Empty").
//   Test case: drafts/qa/ES1-T463/test-cases.md (T95-xx).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... [EXPECT_CART_TYPE=page] npx playwright test tests/e2e/ES1-T95.spec.ts
// Mở thử bằng thuộc tính open (hành vi JS mở/đóng/focus do ES1-T96/T98 kiểm). EXPECT_CART_TYPE=page chỉ đặt khi preview có cart_type page (D12).
import { test, expect, type APIRequestContext, type Browser, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { clickAndLoad, expectJsonAllowed, expectNotChallenged, expectStoreAllowed, gotoStore, skipIfStoreBlocked } from './support/store-guard';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { env } from './support/store-data';
import { getJson } from './support/http';
import { CART, cartApi, skip429 } from './support/cart-api';

type Product = { variants: { id: number; available: boolean }[] };

const ENV = {
  product: env('TE4_VARIANTS_HANDLE', 'TE4_SINGLE_HANDLE'),
  pageMode: process.env.EXPECT_CART_TYPE === 'page',
};

// Gate markup #219: đọc nguồn block trong cùng checkout CI với theme preview, nên sau merge #219 nhóm này bắt buộc chạy.
const DRAWER_SOURCE = readFileSync(join(process.cwd(), 'blocks/cart-drawer.liquid'), 'utf8');
const MARKUP_T368 = /\{%-?\s*partial\s+'cart-drawer-footer'/.test(DRAWER_SOURCE);
const WAIT_219 = 'CHỜ PR #219 (ES1-T368): blocks/cart-drawer.liquid chưa có partial cart-drawer-footer; QA chạy lại sau merge (ES1-T463)';

const tid = (page: Page, id: string) => page.getByTestId(id);

async function addToCart(request: APIRequestContext, handle: string) {
  const r = await getJson<Product>(request, `/products/${handle}.js`);
  expectJsonAllowed(r, `/products/${handle}.js`);
  if (r.status === 429) skip429(`Shopify trả 429 cho ${handle}.js sau khi thử lại (giới hạn store dev)`);
  expect(r.ok, `/products/${handle}.js trả ${r.status}`).toBeTruthy();
  const variant = (r.body as Product).variants.find((v) => v.available);
  test.skip(!variant, `${handle} không có variant bán được`);
  const res = await cartApi(request, CART.add, { data: { id: variant!.id, quantity: 1 } });
  expectStoreAllowed(res);
  expect(res.ok(), `${CART.add} trả ${res.status()}`).toBeTruthy();
}

// reduced motion: đo và chụp không dính animation trượt vào.
async function forceOpen(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await tid(page, 'cart-drawer-dialog').evaluate((el) => el.setAttribute('open', ''));
}

async function expectNoSeriousAxe(page: Page) {
  await expectNotChallenged(page);
  const { violations } = await new AxeBuilder({ page }).include('[data-testid="cart-drawer-dialog"]').analyze();
  const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(serious.map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
}

async function noJsPage(browser: Browser) {
  const use = test.info().project.use;
  const context = await browser.newContext({
    javaScriptEnabled: false,
    storageState: 'tests/setup/state.json',
    baseURL: use.baseURL,
    ...(use.viewport ? { viewport: use.viewport } : {}),
    ...(use.userAgent ? { userAgent: use.userAgent } : {}),
    ...(use.isMobile !== undefined ? { isMobile: use.isMobile, hasTouch: use.hasTouch } : {}),
  });
  return { context, page: await context.newPage() };
}

// AC15: 90% dưới 48rem, 420 từ 48rem, 480 từ 80rem (ES1-T313, foundation §15).
const expectedWidth = (width: number) => (width < 768 ? width * 0.9 : width < 1280 ? 420 : 480);

test.describe('ES1-T95 TE-5 cart drawer', () => {
  test('T95-01 AC1-markup đúng 1 cart-drawer sau footer, ngoài container, mọi trang', async ({ page }) => {
    for (const path of ['/', '/collections/all', '/search?q=a', '/cart', ...(ENV.product ? [`/products/${ENV.product}`] : [])]) {
      await gotoStore(page, path);
      await expect(tid(page, 'cart-drawer'), path).toHaveCount(1);
      const parent = await tid(page, 'cart-drawer').evaluate((el) => el.parentElement?.tagName);
      expect(parent, `${path}: cart-drawer nằm trực tiếp trong body`).toBe('BODY');
      await expect(tid(page, 'cart-drawer'), path).toHaveAttribute('data-cart-url', /\/cart$/);
      await expect(tid(page, 'cart-drawer'), path).toHaveAttribute('data-items-src', /cart-items\.js/);
    }
  });

  test('T95-02 AC1-markup dialog đóng, đủ hook, tên từ h2', async ({ page }) => {
    test.skip(ENV.pageMode, 'Preview đặt cart_type page: không có dialog');
    await gotoStore(page, '/');
    const dialog = tid(page, 'cart-drawer-dialog');
    await expect(tid(page, 'cart-drawer')).toHaveAttribute('data-mode', 'drawer');
    await expect(dialog).toHaveCount(1);
    await expect(dialog).toBeHidden();
    await expect(dialog).toHaveAttribute('scroll-lock', '');
    await expect(dialog).not.toHaveAttribute('open', /.*/);

    // Tên dialog từ h2 tiêu đề (giỏ rỗng có thêm h2 khối rỗng theo AC19, nên không đếm h2).
    const heading = tid(page, 'cart-drawer-heading');
    expect(await heading.evaluate((el) => el.tagName)).toBe('H2');
    const headingId = await heading.getAttribute('id');
    await expect(dialog).toHaveAttribute('aria-labelledby', headingId!);

    const items = tid(page, 'cart-items');
    for (const attr of ['data-partials', 'data-cart-change-url', 'data-cart-url', 'data-label-updated', 'data-label-removed', 'data-label-error', 'data-label-quantity-adjusted']) {
      await expect(items).toHaveAttribute(attr, /.+/);
    }
    await expect(tid(page, 'cart-items-status')).toHaveAttribute('role', 'status');
    await expect(tid(page, 'cart-items-error')).toHaveAttribute('role', 'alert');
    await expect(tid(page, 'cart-form')).toHaveAttribute('id', 'cart-form-drawer');

    // Dialog đóng = display none: Playwright trả tên truy cập rỗng cho phần tử ẩn → kiểm aria-label, rồi mở để kiểm tên thật.
    const close = tid(page, 'cart-drawer-close');
    await expect(close).toHaveAttribute('aria-label', /\S/);
    await forceOpen(page);
    await expect(close).toHaveAccessibleName(/\S/);
    const link = tid(page, 'header-cart-link');
    await expect(link).toHaveAttribute('data-cart-link', '');
    await expect(link).toHaveAttribute('aria-haspopup', 'dialog');
  });

  test('T95-03 [#219] AC15, ES1-T453: 4 partial, header View cart, vùng Added to cart, role status/alert đứng đầu cart-items', async ({ page }) => {
    test.skip(ENV.pageMode, 'Preview đặt cart_type page: không có dialog');
    test.skip(!MARKUP_T368, WAIT_219);
    await gotoStore(page, '/');
    const items = tid(page, 'cart-items');
    await expect(items).toHaveAttribute('data-partials', 'cart-drawer cart-drawer-count cart-drawer-footer cart-count');
    // cart-items.js ghi vào role status / alert đầu tiên trong cart-items: phải là 2 vùng chung, không phải vùng Added to cart.
    const firstStatus = await items.evaluate((el) => el.querySelector('[role="status"]')?.getAttribute('data-testid'));
    const firstAlert = await items.evaluate((el) => el.querySelector('[role="alert"]')?.getAttribute('data-testid'));
    expect(firstStatus).toBe('cart-items-status');
    expect(firstAlert).toBe('cart-items-error');

    await expect(tid(page, 'cart-drawer-view-cart')).toHaveAttribute('href', /\/cart$/);
    const added = tid(page, 'cart-drawer-added');
    await expect(added).toHaveAttribute('role', 'status');
    await expect(added.locator('[data-cart-added]')).toHaveAttribute('hidden', '');
    await expect(added.locator('[data-cart-added-item]')).toHaveCount(1);
    // Vùng Added to cart nằm ngoài partial cart-drawer (không bị refresh xoá), đầu thân.
    await expect(tid(page, 'cart-drawer-body').getByTestId('cart-drawer-added')).toHaveCount(0);

    await forceOpen(page);
    await expect(tid(page, 'cart-drawer-heading')).toBeVisible();
    await expect(tid(page, 'cart-drawer-view-cart')).toBeVisible();
    await expect(tid(page, 'cart-drawer-close')).toBeVisible();
    const viewCart = (await tid(page, 'cart-drawer-view-cart').boundingBox())!;
    expect(viewCart.height, 'View cart cao ≥ 44').toBeGreaterThanOrEqual(43.5);
    const close = (await tid(page, 'cart-drawer-close').boundingBox())!;
    expect(Math.round(close.width), 'nút đóng 48').toBe(48);
    expect(Math.round(close.height), 'nút đóng 48').toBe(48);
  });

  test('T95-04 [#219] AC1, AC15: giỏ có hàng: dòng trong partial, pill n items, Checkout trong chân panel, accelerated ngoài partial, axe', async ({ page }) => {
    test.skip(ENV.pageMode, 'Preview đặt cart_type page: không có dialog');
    test.skip(!MARKUP_T368, WAIT_219);
    test.skip(!ENV.product, 'Thiếu TE4_VARIANTS_HANDLE / TE4_SINGLE_HANDLE');
    // ES1-T300 (CTO 11/11 16:12): Cloudflare 429 tại /products/<handle>.js = môi trường store dev → skip có lý do; lỗi khác vẫn fail.
    await skipIfStoreBlocked('ES1-T300: store dev chặn /products/<handle>.js, Cart API hoặc trang / (môi trường)', async () => {
      await addToCart(page.request, ENV.product!);
      await gotoStore(page, '/');
      const body = tid(page, 'cart-drawer-body');
      await expect(body).toHaveAttribute('data-item-count', '1');
      await expect(body.getByTestId('cart-line')).toHaveCount(1);
      await expect(body.getByTestId('cart-checkout'), 'Checkout không còn trong partial cart-drawer').toHaveCount(0);

      const footer = tid(page, 'cart-drawer-footer');
      const checkout = footer.getByTestId('cart-checkout');
      await expect(checkout).toHaveCount(1);
      await expect(checkout).toHaveAttribute('form', 'cart-form-drawer');
      await expect(footer.getByTestId('cart-summary')).toHaveCount(1);
      await expect(tid(page, 'cart-drawer-count')).not.toHaveAttribute('hidden', /.*/);
      await expect(tid(page, 'cart-drawer-count')).toContainText('1');

      const accelerated = tid(page, 'cart-drawer-accelerated');
      await expect(body.getByTestId('cart-drawer-accelerated')).toHaveCount(0);
      if (await accelerated.count()) {
        await expect(accelerated).toHaveAttribute('data-cart-accelerated', '');
        await expect(footer.getByTestId('cart-drawer-accelerated')).toHaveCount(1);
        await expect(accelerated).not.toHaveAttribute('hidden', /.*/);
      }

      await forceOpen(page);
      await expect(tid(page, 'cart-drawer-dialog')).toBeVisible();
      await expect(checkout).toBeVisible();
      await expect(footer).toBeVisible();
      await expectNoSeriousAxe(page);
    });
  });

  test('T95-05 AC4, AC19: giỏ rỗng: thông báo + CTA, không Checkout, accelerated ẩn, axe khi ép open', async ({ page }) => {
    test.skip(ENV.pageMode, 'Preview đặt cart_type page: không có dialog');
    await gotoStore(page, '/');
    await forceOpen(page);
    await expect(tid(page, 'cart-empty')).toBeVisible();
    await expect(tid(page, 'cart-empty-cta')).toBeVisible();
    await expect(tid(page, 'cart-checkout')).toHaveCount(0);
    const accelerated = tid(page, 'cart-drawer-accelerated');
    if (await accelerated.count()) await expect(accelerated).toBeHidden();
    await expectNoSeriousAxe(page);
  });

  test('T95-06 [#219] AC19: drawer rỗng không chân panel, không pill, không ghi chú, tối đa 2 sản phẩm gợi ý', async ({ page }) => {
    test.skip(ENV.pageMode, 'Preview đặt cart_type page: không có dialog');
    test.skip(!MARKUP_T368, WAIT_219);
    await gotoStore(page, '/');
    await forceOpen(page);
    await expect(tid(page, 'cart-drawer-body')).toHaveAttribute('data-item-count', '0');
    await expect(tid(page, 'cart-empty-heading')).toBeVisible();
    await expect(tid(page, 'cart-summary')).toHaveCount(0);
    await expect(tid(page, 'cart-drawer-footer'), 'không có chân panel khi rỗng').toBeHidden();
    await expect(tid(page, 'cart-drawer-count')).toBeHidden();
    await expect(tid(page, 'cart-free-shipping')).toHaveCount(0);
    const note = tid(page, 'cart-drawer-note');
    if (await note.count()) await expect(note, 'ghi chú ẩn khi giỏ rỗng').toBeHidden();
    // empty_cart_products trống (mặc định) → không hàng nào; store dev có chọn → ≤ 2.
    const bestsellers = tid(page, 'cart-drawer-bestsellers');
    if (await bestsellers.count()) expect(await bestsellers.locator('li').count()).toBeLessThanOrEqual(2);
  });

  test('T95-07 [#219] AC8: ghi chú đơn details đóng sẵn, ngoài partial, textarea note thuộc cart-form-drawer, có label', async ({ page }) => {
    test.skip(ENV.pageMode, 'Preview đặt cart_type page: không có dialog');
    test.skip(!MARKUP_T368, WAIT_219);
    await gotoStore(page, '/');
    const note = tid(page, 'cart-drawer-note');
    test.skip((await note.count()) === 0, 'Store dev tắt show_order_note (mặc định bật): AC8 nhánh tắt, không kiểm được phần có ghi chú');
    expect(await note.evaluate((el) => el.tagName)).toBe('DETAILS');
    await expect(note).not.toHaveAttribute('open', /.*/);
    await expect(tid(page, 'cart-drawer-body').getByTestId('cart-drawer-note'), 'ghi chú ngoài partial cart-drawer').toHaveCount(0);
    const input = tid(page, 'cart-drawer-note-input');
    await expect(input).toHaveAttribute('name', 'note');
    await expect(input).toHaveAttribute('form', 'cart-form-drawer');
    await expect(input).toHaveAttribute('data-note', '');
    const inputId = await input.getAttribute('id');
    await expect(page.locator(`label[for="${inputId}"]`)).toHaveCount(1);
  });

  test('T95-08 [#219] AC15: rộng 90% / 420 / 480 bám cạnh cuối, cao toàn màn, thân cuộn riêng, ảnh 360/768/1280/1920', async ({ page }) => {
    test.skip(ENV.pageMode, 'Preview đặt cart_type page: không có dialog');
    test.skip(!MARKUP_T368, WAIT_219);
    test.skip(!ENV.product, 'Thiếu TE4_VARIANTS_HANDLE / TE4_SINGLE_HANDLE');
    // ES1-T300 (CTO 11/11 16:12): Cloudflare 429 = môi trường store dev → skip có lý do; lỗi khác vẫn fail.
    await skipIfStoreBlocked('ES1-T300: store dev chặn /products/<handle>.js, Cart API hoặc trang / (môi trường)', async () => {
      await addToCart(page.request, ENV.product!);
      for (const width of [360, 768, 1280, 1920]) {
        await page.setViewportSize({ width, height: 800 });
        await gotoStore(page, '/');
        await forceOpen(page);
        const box = await tid(page, 'cart-drawer-dialog').boundingBox();
        expect(box, `${width}: dialog có kích thước`).not.toBeNull();
        expect(Math.round(box!.height), `${width}: cao toàn màn`).toBe(800);
        expect(Math.abs(box!.x + box!.width - width), `${width}: bám cạnh cuối`).toBeLessThanOrEqual(1);
        expect(Math.abs(box!.width - expectedWidth(width)), `${width}: rộng ${expectedWidth(width)}`).toBeLessThanOrEqual(1);
        const overflow = await page.locator('[data-testid="cart-drawer-dialog"] .drawer__body').evaluate((el) => getComputedStyle(el).overflowY);
        expect(overflow, `${width}: thân cuộn riêng`).toBe('auto');
        // Chân panel là flex item dưới thân (không dính đè trong thân): đáy thân ≤ đỉnh chân.
        const bodyBox = (await page.locator('[data-testid="cart-drawer-dialog"] .drawer__body').boundingBox())!;
        const footBox = (await tid(page, 'cart-drawer-footer').boundingBox())!;
        expect(bodyBox.y + bodyBox.height, `${width}: thân không nằm dưới chân`).toBeLessThanOrEqual(footBox.y + 0.5);
        await test.info().attach(`cart-drawer-${width}.png`, { body: await page.screenshot(), contentType: 'image/png' });
      }
    });
  });

  test('T95-09 AC1-markup /cart: không dialog, data-mode none, cart link không có hook drawer', async ({ page }) => {
    await gotoStore(page, '/cart');
    await expect(tid(page, 'cart-drawer')).toHaveAttribute('data-mode', 'none');
    await expect(page.locator('cart-drawer dialog')).toHaveCount(0);
    await expect(tid(page, 'cart-drawer-dialog')).toHaveCount(0);
    await expect(tid(page, 'cart-items')).toHaveAttribute('data-partials', 'cart-page cart-count');
    const link = tid(page, 'header-cart-link');
    await expect(link).not.toHaveAttribute('data-cart-link', /.*/);
    await expect(link).not.toHaveAttribute('aria-haspopup', /.*/);
  });

  test('T95-10 AC6-markup cart_type page: mọi trang data-mode none, không dialog', async ({ page }) => {
    test.skip(!ENV.pageMode, 'Cần preview đặt cart_type page + EXPECT_CART_TYPE=page (D12)');
    await gotoStore(page, '/');
    await expect(tid(page, 'cart-drawer')).toHaveAttribute('data-mode', 'none');
    await expect(page.locator('cart-drawer dialog')).toHaveCount(0);
    await expect(tid(page, 'header-cart-link')).not.toHaveAttribute('data-cart-link', /.*/);
  });

  test('T95-11 [#219] AC8, AC19, bảng setting TE-5: schema có show_order_note (checkbox, true), empty_cart_products (collection), không presets', () => {
    test.skip(!MARKUP_T368, WAIT_219);
    const schema = JSON.parse(DRAWER_SOURCE.split('{% schema %}')[1].split('{% endschema %}')[0]) as {
      settings?: { id: string; type: string; default?: unknown }[];
      presets?: unknown;
    };
    expect(schema.presets).toBeUndefined();
    const byId = Object.fromEntries((schema.settings ?? []).map((s) => [s.id, s]));
    expect(byId.show_order_note?.type).toBe('checkbox');
    expect(byId.show_order_note?.default).toBe(true);
    expect(byId.empty_cart_products?.type).toBe('collection');
    expect(byId.empty_cart_products?.default, 'theme mới cài trống (ES1-T308 #1)').toBeUndefined();
  });

  test('T95-12 CSS drawer: 0 literal màu, chỉ logical properties, có reduced-motion', () => {
    const css = readFileSync(join(process.cwd(), 'assets/base.css'), 'utf8');
    // ES1-T217: mục kế sau drawer là Image with text; toàn file do ES1-T217.spec.ts kiểm.
    const part = css.slice(css.indexOf('/** Cart drawer (TE-5'), css.indexOf('/** Image with text (TE-7'));
    expect(part.length).toBeGreaterThan(0);
    expect(part.match(/#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(/gi)).toBeNull();
    expect(part.match(/^\s*(left|right|top|bottom|width|height|(margin|padding)-(left|right|top|bottom))\s*:/gm)).toBeNull();
    expect(part).toContain('prefers-reduced-motion: no-preference');
  });

  test.describe('nojs', () => {
    test('T95-13 nojs dialog đóng, cart link tới /cart', async ({ browser }) => {
      const { context, page } = await noJsPage(browser);
      // ES1-T229: tắt JS thì Chromium tải cả ảnh lazy, domcontentloaded để không hết giờ vì ảnh (ES1-T224).
      await gotoStore(page, '/', { waitUntil: 'domcontentloaded' });
      const dialog = tid(page, 'cart-drawer-dialog');
      if (await dialog.count()) await expect(dialog).toBeHidden();
      const link = tid(page, 'header-cart-link');
      await expect(link).toHaveAttribute('href', /\/cart$/);
      await clickAndLoad(page, () => link.click());
      await expect(page).toHaveURL(/\/cart$/);
      await expect(tid(page, 'cart-page')).toBeVisible();
      await context.close();
    });
  });
});
