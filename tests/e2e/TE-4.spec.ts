// KHÔNG CHẮC: spec CHƯA chạy trên store (sandbox không mở được Chromium, host store bị từ chối) → kết quả thật chờ CI. Mới qua playwright --list; chưa type-check (không có typescript).
// Ticket ES1-T70 TE-4-QA1: E2E trang sản phẩm AC1-AC12, gộp hành vi của spec dev ES1-T62..T69, T85, T87 + shopify:product:view (ES1-T76).
// Test case: drafts/qa/ES1-T70/test-cases.md. Tên test: "AC<n> TC-<id> ...". Nhóm không JS có chữ "nojs".
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/TE-4.spec.ts [-g "AC2 |nojs"]
// Dữ liệu: env TE4_* không rỗng, rồi tests/e2e/store-data.json (ES1-T78); thiếu → skip có lý do. Handle có dấu: so pathname sau decodeURIComponent.
// So tiền: .js lấy bằng fetch trong trang để cùng market (ES1-T74). Nhóm nojs không chạy script trong trang: sản phẩm đọc JSON nhúng variant-json, giỏ đọc qua context phụ (ES1-T100, support/product-data.ts).
import { test as base, expect, type Page, type Request, type Route } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { env } from './support/store-data';
import { pageJson, productDataNoScript, readCartJson, readCartNoScript, requireJson } from './support/product-data';
import { CART, CART_GLOB } from './support/cart-api';
import { watchShopPay403 } from './support/console-guard';

// DoD: 0 console error trên mọi test. Fixture tự chạy, kiểm sau mỗi test.
// Bỏ qua: script Shopify/analytics, YouTube/Vimeo/model-viewer (nguồn ngoài theme) và 429 (giới hạn store dev).
const IGNORE_CONSOLE = /shopifycloud|monorail|web-pixels|trekkie|shop\.app|shopifysvc\.com|cdn\.shopify\.com\/s\/(trekkie|javascripts)|youtube|vimeo|ytimg|model-viewer|status of 429/i;
// route.abort()/fulfill lỗi: Chrome tự log "Failed to load resource" (log mạng, không phải lỗi JS theme). Chỉ test lỗi mạng mới bật cờ này.
const NETWORK_LOG = /Failed to load resource/i;

type ConsoleGuard = { allowNetworkLog: () => void };

const test = base.extend<{ consoleGuard: ConsoleGuard }>({
  consoleGuard: [
    async ({ page }, use, info) => {
      const errors: string[] = [];
      let allowNetwork = false;
      const isShopPay403 = watchShopPay403(page);
      page.on('console', (msg) => {
        if (msg.type() !== 'error') return;
        if (isShopPay403(msg)) return;
        const text = msg.text();
        const source = msg.location().url;
        if (IGNORE_CONSOLE.test(text) || IGNORE_CONSOLE.test(source)) return;
        if (allowNetwork && NETWORK_LOG.test(text)) return;
        // ES1-T96: thêm giỏ thành công mở drawer, drawer import assets/cart-items.js (ES1-T97, chưa có thì 404). Chỉ bỏ log mạng của đúng file này.
        if (NETWORK_LOG.test(text) && /\/cart-items\.js/.test(source)) return;
        errors.push(`${text} @ ${source}`);
      });
      page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
      await use({ allowNetworkLog: () => (allowNetwork = true) });
      if (info.status !== 'skipped') expect(errors, `console error:\n${errors.join('\n')}`).toEqual([]);
    },
    { auto: true },
  ],
});

const DATA = {
  media: env('TE4_MEDIA_HANDLE'),
  variants: env('TE4_VARIANTS_HANDLE'),
  options: env('TE4_OPTIONS_HANDLE', 'TE4_VARIANTS_HANDLE'),
  noMedia: env('TE4_NO_MEDIA_HANDLE'),
  single: env('TE4_SINGLE_HANDLE'),
  soldOut: env('TE4_SOLD_OUT_HANDLE'),
  digital: env('TE4_DIGITAL_HANDLE'),
  giftCard: env('TE4_GIFT_CARD_HANDLE'),
  sellingPlan: env('TE4_SELLING_PLAN_HANDLE'),
  unitPrice: env('TE4_UNIT_PRICE_HANDLE'),
  sale: env('TE4_SWATCH_SALE_HANDLE'),
  smallPrice: env('TE4_SALE_SMALL_PRICE_HANDLE'),
  pickup: env('TE4_PICKUP_HANDLE'),
  taxCountry: env('TE4_TAX_INCLUDED_COUNTRY'),
};

// Object thay vì tham số handle mặc định: handle undefined phải skip, không rơi về sản phẩm khác.
type Source = { handle: string | undefined; reason: string };
const SRC = {
  variants: { handle: DATA.variants, reason: 'TE4_VARIANTS_HANDLE' },
  options: { handle: DATA.options, reason: 'TE4_OPTIONS_HANDLE / TE4_VARIANTS_HANDLE (từ 2 option)' },
  sale: { handle: DATA.sale, reason: 'TE4_SWATCH_SALE_HANDLE' },
  single: { handle: DATA.single, reason: 'TE4_SINGLE_HANDLE' },
  giftCard: { handle: DATA.giftCard, reason: 'TE4_GIFT_CARD_HANDLE' },
  sellingPlan: { handle: DATA.sellingPlan, reason: 'TE4_SELLING_PLAN_HANDLE' },
} satisfies Record<string, Source>;

const T = {
  main: 'container-product-main',
  related: 'container-product-related',
  complementary: 'container-product-complementary',
  media: 'product-media',
  mediaList: 'product-media-list',
  mediaItem: 'product-media-item',
  mediaImage: 'product-media-image',
  mediaVideo: 'product-media-video',
  mediaExternal: 'product-media-external-video',
  mediaExternalTemplate: 'product-media-external-video-template',
  mediaModel: 'product-media-model',
  mediaPlaceholder: 'product-media-placeholder',
  thumbs: 'product-media-thumbnails',
  thumb: 'product-media-thumbnail',
  zoomLink: 'product-media-zoom-link',
  zoomDialog: 'product-media-zoom-dialog',
  zoomImage: 'product-media-zoom-image',
  zoomClose: 'product-media-zoom-close',
  info: 'product-info',
  viewEvent: 'product-view-event',
  title: 'product-title',
  vendor: 'product-vendor',
  price: 'product-price',
  priceRegular: 'price-regular',
  priceCompare: 'price-compare',
  priceUnit: 'price-unit',
  notes: 'product-notes',
  noteTax: 'product-note-tax',
  noteShipping: 'product-note-shipping',
  description: 'product-description',
  structuredData: 'product-structured-data',
  sticky: 'product-sticky-bar',
  stickyTitle: 'product-sticky-bar-title',
  stickyPrice: 'product-sticky-bar-price',
  stickyAdd: 'product-sticky-bar-add',
  form: 'product-form',
  picker: 'product-variant-picker',
  option: 'product-option',
  optionValue: 'product-option-value',
  variantId: 'product-form-variant-id',
  variantSelect: 'product-variant-select',
  quantity: 'product-quantity',
  plans: 'product-selling-plans',
  plan: 'product-selling-plan',
  giftToggle: 'product-gift-card-toggle',
  giftEmail: 'product-gift-card-email',
  giftName: 'product-gift-card-name',
  giftMessage: 'product-gift-card-message',
  giftSendOn: 'product-gift-card-send-on',
  inventory: 'product-inventory',
  add: 'product-form-add',
  payment: 'product-payment-button',
  installments: 'product-installments',
  pickup: 'product-pickup',
  pickupDetails: 'product-pickup-details',
  status: 'product-form-status',
  error: 'product-form-error',
  recs: 'product-recommendations',
  recsHeading: 'product-recommendations-heading',
  recsList: 'product-recommendations-list',
  recsTemplate: 'product-recommendations-template',
  recsPlaceholder: 'product-recommendations-placeholder',
  card: 'product-recommendations-card',
  cardTitle: 'product-recommendations-card-title',
  cardPrice: 'product-recommendations-card-price',
  cardSoldOut: 'product-recommendations-card-sold-out',
} as const;

const GIFT_FIELDS = [T.giftEmail, T.giftName, T.giftMessage, T.giftSendOn];
const TAX_NOTES = ['Taxes and duties included.', 'Taxes included.', 'Duties included. Taxes calculated at checkout.', 'Taxes calculated at checkout.'];
const EXTERNAL_HOSTS = /youtube\.com|youtube-nocookie\.com|ytimg\.com|vimeo\.com|vimeocdn\.com/i;
const REC = /\/recommendations\/products\.json/;
const REC_GLOB = '**/recommendations/products.json*';
const ADD_GLOB = CART_GLOB.add;
const EVENT_VIEW = 'shopify:product:view';
const EVENT_SELECT = 'shopify:product:select';
const EVENT_CART = 'shopify:cart:lines-update';
const MOCK_422 = { status: 422, message: 'Cart Error', description: 'ES1-T70 mock: You can only add 0 of this item to your cart.' };

type JsVariant = {
  id: number;
  available: boolean;
  options: string[];
  price: number;
  compare_at_price: number | null;
  unit_price?: number | null;
  requires_shipping: boolean;
  featured_media: { id: number } | null;
};
type JsProduct = {
  id: number;
  handle: string;
  title: string;
  vendor: string;
  description: string | null;
  options: Array<{ name: string; position: number; values: string[] }>;
  variants: JsVariant[];
  media: Array<{ id: number; media_type: string; width: number; height: number }>;
  requires_selling_plan?: boolean;
  featured_image: string | null;
  available: boolean;
};
type Win = Window & {
  __te4?: number;
  Shopify?: { currency?: { active?: string }; actions?: Record<string, unknown>; ModelViewerUI?: unknown };
};
type CapturedEvent = {
  type: string;
  target?: string;
  context?: string;
  handle?: string;
  productId?: string;
  selectedOptions?: Array<{ name: string; value: string }>;
  action?: string;
  lines?: Array<{ merchandiseId: string; quantity: number }>;
  addSentBefore?: boolean;
  cart?: string | null;
  userErrors?: Array<{ message: string }>;
  warnings?: unknown[];
  settled?: boolean;
  variant?: { id: string; availableForSale: boolean; price: { amount: string; currencyCode: string } } | null;
  rejected?: string;
};

const tid = (page: Page, id: string) => page.getByTestId(id);
const productPath = (handle: string, query = '') => `/products/${handle}${query}`;
const isCart = (url: URL) => /\/cart\/?$/.test(url.pathname);
const mediaItem = (page: Page, id: string | number) => page.locator(`[data-testid="${T.mediaItem}"][data-media-id="${id}"]`);
const thumbOf = (page: Page, id: string | number) => page.locator(`[data-testid="${T.thumb}"][data-media-id="${id}"]`);
const recsIn = (page: Page, container: string) => tid(page, container).getByTestId(T.recs);
const partialUrl = (handle: string) => (url: URL) => decodeURIComponent(url.pathname).endsWith(productPath(handle)) && url.searchParams.has('variant');

// Tiền trên trang → cents (đồng bộ TE-3.spec.ts), chịu được "Tk 1,000.00" và "1.000,00 ₫".
function cents(text: string | null): number {
  const m = (text ?? '').match(/\d[\d.,\s  ']*/);
  if (!m) return NaN;
  const t = m[0].replace(/[\s  ']/g, '').replace(/[.,]+$/, '');
  const last = Math.max(t.lastIndexOf('.'), t.lastIndexOf(','));
  const value = last >= 0 && t.length - last - 1 !== 3 ? Number(`${t.slice(0, last).replace(/[.,]/g, '')}.${t.slice(last + 1)}`) : Number(t.replace(/[.,]/g, ''));
  return Math.round(value * 100);
}

async function open(page: Page, handle: string | undefined, reason: string, query = '') {
  test.skip(!handle, `Thiếu dữ liệu ${reason}`);
  await page.goto(productPath(handle!, query));
  return handle!;
}

async function ready(page: Page, ...elements: string[]) {
  await page.waitForFunction((names) => names.every((n) => !!customElements.get(n)), elements);
}

// ES1-T74: fetch trong trang, cùng market với giá trên trang. Tiền trang khác cart.js → skip có lý do (giống ES1-T63).
async function productJs(page: Page, handle: string): Promise<JsProduct> {
  const active = await page.evaluate(() => (window as Win).Shopify?.currency?.active ?? null);
  const cart = (await pageJson<{ currency?: string }>(page, '/cart.js')).body?.currency ?? null;
  test.info().annotations.push({ type: 'market', description: `Shopify.currency.active=${active} cart.js currency=${cart}` });
  test.skip(!!active && !!cart && active !== cart, `Tiền hiển thị (${active}) khác tiền cart.js (${cart})`);
  return requireJson(await pageJson<JsProduct>(page, `${productPath(handle)}.js`), `${handle}.js`);
}

type CartJs = { items: Array<{ variant_id: number; quantity: number; properties: Record<string, string> | null }> };
const cartItems = async (page: Page) => (await readCartJson<CartJs>(page)).items;
// Nhóm nojs: không fetch trong trang được.
const cartItemsNoScript = async (page: Page) => (await readCartNoScript<CartJs>(page)).items;

function optionValue(page: Page, index: number, value: string) {
  return tid(page, T.option).nth(index).getByTestId(T.optionValue).filter({
    has: page.locator(`input[type="radio"][value=${JSON.stringify(value)}]`),
  });
}

async function selectOptions(page: Page, options: string[]) {
  for (const [i, value] of options.entries()) {
    const label = optionValue(page, i, value);
    if (!(await label.locator('input[type="radio"]').isChecked())) await label.click();
  }
}

const settled = (page: Page) => expect(tid(page, T.form)).not.toHaveAttribute('aria-busy', 'true');
const currentId = async (page: Page) => Number(await tid(page, T.variantId).inputValue());
const markNoReload = (page: Page) => page.evaluate(() => ((window as Win).__te4 = 1));
const stayed = (page: Page) => page.evaluate(() => (window as Win).__te4 === 1);

function missingCombo(product: JsProduct) {
  const combos = product.options.reduce<string[][]>((acc, o) => acc.flatMap((c) => o.values.map((v) => [...c, v])), [[]]);
  return combos.find((c) => !product.variants.some((v) => v.options.every((o, i) => o === c[i])));
}

// Sản phẩm có picker + dữ liệu .js; đặt cờ để phát hiện reload.
async function openPicker(page: Page, src: Source = SRC.options) {
  const h = await open(page, src.handle, src.reason);
  await expect(tid(page, T.picker)).toBeVisible();
  await ready(page, 'product-variant-picker');
  const product = await productJs(page, h);
  await markNoReload(page);
  return { handle: h, product };
}

async function expectVariantUi(page: Page, variant: JsVariant) {
  await expect(tid(page, T.variantId)).toHaveValue(String(variant.id));
  await expect.poll(() => new URL(page.url()).searchParams.get('variant')).toBe(String(variant.id));
  await settled(page);

  const price = tid(page, T.price);
  await expect.poll(async () => cents(await price.getByTestId(T.priceRegular).first().textContent())).toBe(variant.price);
  if (variant.compare_at_price && variant.compare_at_price > variant.price) {
    expect(cents(await price.getByTestId(T.priceCompare).first().textContent())).toBe(variant.compare_at_price);
  } else {
    await expect(price.getByTestId(T.priceCompare)).toHaveCount(0);
  }
  if (variant.unit_price) {
    expect(cents(await price.getByTestId(T.priceUnit).first().textContent())).toBe(variant.unit_price);
  } else {
    await expect(price.getByTestId(T.priceUnit)).toHaveCount(0);
  }

  await expect(tid(page, T.inventory)).toHaveAttribute('data-state', variant.available ? 'in_stock' : 'sold_out');
  for (const id of [T.add, T.stickyAdd]) {
    if (variant.available) await expect(tid(page, id)).toBeEnabled();
    else await expect(tid(page, id)).toBeDisabled();
  }
  expect(await stayed(page), 'trang không được reload').toBe(true);
}

async function buttonsSnapshot(page: Page) {
  const add = tid(page, T.add);
  const inventory = tid(page, T.inventory);
  const sticky = tid(page, T.stickyAdd);
  return {
    disabled: await add.isDisabled(),
    text: (await add.textContent())?.trim(),
    state: await inventory.getAttribute('data-state'),
    inventory: (await inventory.textContent())?.trim(),
    sticky: { disabled: await sticky.isDisabled(), text: (await sticky.textContent())?.trim() },
  };
}

async function onPartial(page: Page, handle: string, handler: (route: Route) => Promise<void> | void) {
  await page.route(partialUrl(handle), (route) => (['fetch', 'xhr'].includes(route.request().resourceType()) ? handler(route) : route.continue()));
}

async function expectNoSerious(page: Page, ...testIds: string[]) {
  let builder = new AxeBuilder({ page });
  for (const id of testIds) builder = builder.include(`[data-testid="${id}"]`);
  const result = await builder.analyze();
  const bad = result.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? ''));
  expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
}

// FormData → multipart; field nằm trong name="...".
function fields(req: Request) {
  const body = req.postData() ?? '';
  return [...body.matchAll(/name="([^"]+)"\r?\n\r?\n([^\r\n]*)/g)].reduce<Record<string, string>>((acc, m) => ((acc[m[1]] = m[2]), acc), {});
}

async function mockAdd(page: Page) {
  const requests: Request[] = [];
  await page.route(ADD_GLOB, async (route) => {
    requests.push(route.request());
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 1, variant_id: 1, quantity: 1 }) });
  });
  return requests;
}

async function openBuyable(page: Page, src: Source = SRC.variants) {
  const h = await open(page, src.handle, src.reason);
  await expect(tid(page, T.form)).toHaveCount(1);
  await ready(page, 'product-form', 'product-sticky-bar');
  test.skip(await tid(page, T.add).isDisabled(), `Variant mặc định của ${h} hết hàng, không thêm giỏ được`);
  await markNoReload(page);
  return h;
}

// Có <cart-drawer> (TE-5) và cart type drawer → chuyển /cart không còn đúng; AC8 ở đây chỉ kiểm /cart.
async function skipIfDrawer(page: Page) {
  const type = await tid(page, T.form).getAttribute('data-cart-type');
  test.skip(type !== 'page' && (await page.locator('cart-drawer').count()) > 0, 'Có cart-drawer + cart type drawer: mở drawer thuộc TE-5');
}

// Viewport mobile: Pixel 7 giữ nguyên, project desktop thu về 390.
async function mobileWidth(page: Page) {
  if ((page.viewportSize()?.width ?? 0) >= 768) await page.setViewportSize({ width: 390, height: 844 });
}

async function scrollPastAdd(page: Page) {
  const passed = await tid(page, T.add).evaluate((b) => {
    window.scrollTo({ top: b.getBoundingClientRect().bottom + window.scrollY + 40, behavior: 'instant' });
    return b.getBoundingClientRect().bottom <= 0;
  });
  test.skip(!passed, 'Trang không đủ dài để cuộn qua nút chính');
}

// Listener capture trên document, gắn trước script trang. Lưu sessionStorage vì luồng thêm giỏ chuyển sang /cart.
async function captureEvents(page: Page, types: string[]) {
  await page.addInitScript(({ names, addPath }) => {
    // Đọc sessionStorage muộn: init script chạy cả ở about:blank, nơi sessionStorage có thể ném lỗi.
    let events: CapturedEvent[] | null = null;
    const list = () => (events ??= JSON.parse(sessionStorage.getItem('__te4Events') ?? '[]') as CapturedEvent[]);
    const save = () => sessionStorage.setItem('__te4Events', JSON.stringify(list()));
    for (const type of names) {
      document.addEventListener(
        type,
        (e) => {
          const ev = e as CustomEvent & Record<string, unknown>;
          const d = ((ev.detail as Record<string, unknown> | null)?.product || (ev.detail as Record<string, unknown> | null)?.lines ? ev.detail : ev) as Record<string, unknown>;
          const product = d.product as { id?: string; handle?: string } | undefined;
          const entry: CapturedEvent = {
            type,
            target: (e.target as Element)?.tagName?.toLowerCase(),
            context: d.context as string | undefined,
            handle: product?.handle,
            productId: product?.id,
            selectedOptions: d.selectedOptions as CapturedEvent['selectedOptions'],
            action: d.action as string | undefined,
            lines: d.lines as CapturedEvent['lines'],
            addSentBefore: performance.getEntriesByType('resource').some((r) => r.name.includes(addPath)),
          };
          list().push(entry);
          save();
          if (d.promise) {
            Promise.resolve(d.promise as Promise<{ variant?: CapturedEvent['variant']; cart?: unknown; userErrors?: CapturedEvent['userErrors']; warnings?: unknown[] }>).then(
              (r) => {
                entry.settled = true;
                entry.variant = r?.variant;
                entry.userErrors = r?.userErrors;
                entry.warnings = r?.warnings;
                try {
                  entry.cart = r?.cart == null ? null : JSON.stringify(r.cart);
                } catch {
                  entry.cart = '[unserializable]';
                }
                save();
              },
              (err) => {
                entry.rejected = String(err);
                save();
              }
            );
          }
        },
        true
      );
    }
  }, { names: types, addPath: CART.add });
}

// Đang chuyển trang thì evaluate có thể ném "context destroyed" → [] để poll thử lại.
const captured = (page: Page, type: string) =>
  page
    .evaluate((t) => (JSON.parse(sessionStorage.getItem('__te4Events') ?? '[]') as CapturedEvent[]).filter((e) => e.type === t), type)
    .catch(() => [] as CapturedEvent[]);

// ---------- AC1 gallery ----------
test.describe('ES1-T70 TE-4 AC1 gallery', () => {
  test('AC1 TC-101 khung: 3 container, root product-media-gallery', async ({ page }) => {
    await open(page, DATA.media, 'TE4_MEDIA_HANDLE');
    for (const id of [T.main, T.related, T.complementary]) await expect(tid(page, id)).toHaveCount(1);
    await expect(tid(page, T.main).getByTestId(T.media)).toHaveCount(1);
    expect(await tid(page, T.media).evaluate((el) => el.tagName.toLowerCase())).toBe('product-media-gallery');
  });

  test('AC1 TC-102 đủ ảnh, video, external, 3D; không request YouTube/Vimeo lúc tải', async ({ page }) => {
    const external: string[] = [];
    page.on('request', (r) => {
      if (EXTERNAL_HOSTS.test(new URL(r.url()).hostname)) external.push(r.url());
    });
    const handle = await open(page, DATA.media, 'TE4_MEDIA_HANDLE');
    await page.waitForLoadState('load');
    const js = await productJs(page, handle);
    const items = tid(page, T.mediaItem);
    await expect(items).toHaveCount(js.media.length);
    for (const type of ['image', 'video', 'external_video', 'model']) {
      await expect(page.locator(`[data-testid="${T.mediaItem}"][data-media-type="${type}"]`), `thiếu media ${type}`).not.toHaveCount(0);
    }
    for (const el of await items.all()) {
      const id = await el.getAttribute('data-media-id');
      await expect(el).toHaveAttribute('id', `ProductMedia-${id}`);
    }
    await expect(tid(page, T.mediaImage).first()).toBeVisible();
    const video = tid(page, T.mediaVideo).locator('video').first();
    await expect(video).toHaveAttribute('preload', 'none');
    await expect(video).toHaveAttribute('controls', /.*/);
    await expect(video).toHaveAttribute('poster', /.+/);
    await expect(tid(page, T.mediaExternal).first()).toHaveAttribute('href', EXTERNAL_HOSTS);
    await expect(tid(page, T.mediaModel).locator('model-viewer')).not.toHaveCount(0);
    expect(await tid(page, T.mediaExternalTemplate).first().evaluate((t) => (t as HTMLTemplateElement).content.querySelectorAll('iframe').length)).toBe(1);
    await expect(tid(page, T.mediaList).locator('iframe')).toHaveCount(0);
    expect(external, `request tới YouTube/Vimeo lúc tải: ${external.join(', ')}`).toEqual([]);
  });

  test('AC1 TC-103 LCP: chỉ media đầu eager + fetchpriority high, còn lại lazy', async ({ page }) => {
    await open(page, DATA.media, 'TE4_MEDIA_HANDLE');
    const first = tid(page, T.mediaItem).first().locator('img').first();
    await expect(first).toHaveAttribute('loading', 'eager');
    await expect(first).toHaveAttribute('fetchpriority', 'high');
    await expect(tid(page, T.mediaList).locator('img[fetchpriority="high"]')).toHaveCount(1);
    for (const img of (await tid(page, T.mediaItem).locator('img').all()).slice(1)) await expect(img).toHaveAttribute('loading', 'lazy');
  });

  test('AC1 TC-104 zoom: bấm mở dialog ảnh 2048, Esc đóng, focus về link; nút đóng trả focus; axe dialog 0 serious', async ({ page }) => {
    await open(page, DATA.media, 'TE4_MEDIA_HANDLE');
    await ready(page, 'product-media-gallery');
    const link = tid(page, T.zoomLink).first();
    const href = (await link.getAttribute('href'))!;
    expect(href).toMatch(/[?&]width=2048/);
    await expect(link).toHaveAccessibleName(/.+/);
    const dialog = tid(page, T.zoomDialog);
    const img = tid(page, T.zoomImage);
    await expect(dialog).not.toHaveAttribute('open', /.*/);
    const url0 = page.url();

    await link.click();
    await expect(dialog).toHaveAttribute('open', /.*/);
    expect(page.url(), 'không điều hướng sang ảnh').toBe(url0);
    await expect(img).toBeVisible();
    expect(new URL((await img.getAttribute('src'))!, url0).toString()).toBe(new URL(href, url0).toString());
    await expect(img).toHaveAttribute('width', '2048');
    await expect(tid(page, T.zoomClose)).toHaveAccessibleName(/.+/);
    await expectNoSerious(page, T.zoomDialog);

    await page.keyboard.press('Escape');
    await expect(dialog).not.toHaveAttribute('open', /.*/);
    await expect(link).toBeFocused();

    await link.press('Enter');
    await expect(dialog).toHaveAttribute('open', /.*/);
    await tid(page, T.zoomClose).click();
    await expect(dialog).not.toHaveAttribute('open', /.*/);
    await expect(link).toBeFocused();
  });

  test('AC1 TC-105 thumbnail: bấm đổi media, aria-current đúng 1 thumbnail, URL không đổi hash', async ({ page }) => {
    await open(page, DATA.media, 'TE4_MEDIA_HANDLE');
    await ready(page, 'product-media-gallery');
    const thumbs = tid(page, T.thumb);
    const count = await thumbs.count();
    test.skip(count < 2, 'Cần từ 2 media');
    const current = tid(page, T.thumbs).locator('[aria-current="true"]');
    await expect(current).toHaveCount(1);
    await expect(thumbs.first()).toHaveAttribute('aria-current', 'true');
    const last = thumbs.nth(count - 1);
    const id = (await last.getAttribute('data-media-id'))!;
    await last.click();
    await expect(mediaItem(page, id)).toBeInViewport({ ratio: 0.5 });
    await expect(last).toHaveAttribute('aria-current', 'true');
    await expect(current).toHaveCount(1);
    expect(new URL(page.url()).hash).toBe('');
  });

  test('AC1 TC-106 video Shopify: pause khi rời khung', async ({ page }) => {
    await open(page, DATA.media, 'TE4_MEDIA_HANDLE');
    await ready(page, 'product-media-gallery');
    const video = tid(page, T.mediaVideo).first();
    test.skip((await video.count()) === 0, 'TE4_MEDIA_HANDLE không có video Shopify');
    const li = page.locator(`[data-testid="${T.mediaItem}"]:has([data-testid="${T.mediaVideo}"])`).first();
    const id = (await li.getAttribute('data-media-id'))!;
    await thumbOf(page, id).click();
    await expect(li).toBeInViewport({ ratio: 0.5 });
    // Chromium của Playwright không phát được H.264: giả lập đang phát, đếm lời gọi pause().
    await video.locator('video').evaluate((v: HTMLVideoElement) => {
      let paused = false;
      Object.defineProperty(v, 'paused', { configurable: true, get: () => paused });
      v.pause = () => {
        paused = true;
        (window as Win).__te4 = 2;
      };
    });
    await page.locator(`[data-testid="${T.thumb}"]:not([data-media-id="${id}"])`).first().click();
    // Xếp dọc (từ 64rem): media khác có thể vẫn chạm khung → cuộn trang qua hẳn video.
    await li.evaluate((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth) window.scrollBy({ top: r.bottom + 1, behavior: 'instant' });
    });
    await expect(li).not.toBeInViewport();
    await expect.poll(() => page.evaluate(() => (window as Win).__te4)).toBe(2);
  });

  test('AC1 TC-107 external video: bấm poster mới nạp iframe, focus vào iframe, không điều hướng', async ({ page }) => {
    const external: string[] = [];
    page.on('request', (r) => {
      if (EXTERNAL_HOSTS.test(new URL(r.url()).hostname)) external.push(r.url());
    });
    await open(page, DATA.media, 'TE4_MEDIA_HANDLE');
    await ready(page, 'product-media-gallery');
    const poster = tid(page, T.mediaExternal).first();
    test.skip((await poster.count()) === 0, 'TE4_MEDIA_HANDLE không có external video');
    const id = (await poster.getAttribute('data-media-id'))!;
    const li = mediaItem(page, id);
    await thumbOf(page, id).click();
    await expect(li).toBeInViewport({ ratio: 0.5 });
    await page.waitForLoadState('load');
    expect(external, 'request YouTube/Vimeo trước khi bấm').toEqual([]);
    await expect(li.locator('iframe')).toHaveCount(0);
    const url0 = page.url();
    await poster.click();
    const frame = li.locator('iframe');
    await expect(frame).toHaveCount(1);
    await expect(frame).toHaveAttribute('src', EXTERNAL_HOSTS);
    await expect(frame).toHaveAttribute('title', /.+/);
    expect(page.url()).toBe(url0);
    expect(await page.evaluate(() => document.activeElement?.tagName)).toBe('IFRAME');
    await expect.poll(() => external.length).toBeGreaterThan(0);
  });

  test('AC1 TC-108 3D: vào khung thì nạp model-viewer + UI chỉ từ Shopify CDN', async ({ page }) => {
    const foreign: string[] = [];
    page.on('request', (r) => {
      const u = new URL(r.url());
      const cdn = /(^|\.)(shopify|shopifycdn|shopifycloud)\.com$/.test(u.hostname) || u.pathname.startsWith('/cdn/shopifycloud/');
      if (/model-viewer/i.test(u.pathname) && !cdn) foreign.push(r.url());
    });
    await open(page, DATA.media, 'TE4_MEDIA_HANDLE');
    await ready(page, 'product-media-gallery');
    test.skip((await tid(page, T.mediaModel).count()) === 0, 'TE4_MEDIA_HANDLE không có model 3D');
    const li = page.locator(`[data-testid="${T.mediaItem}"]:has([data-testid="${T.mediaModel}"])`).first();
    await thumbOf(page, (await li.getAttribute('data-media-id'))!).click();
    await expect(li).toBeInViewport({ ratio: 0.5 });
    await expect.poll(() => page.evaluate(() => !!customElements.get('model-viewer')), { timeout: 15_000 }).toBe(true);
    await expect.poll(() => page.evaluate(() => typeof (window as Win).Shopify?.ModelViewerUI), { timeout: 15_000 }).toBe('function');
    expect(foreign, 'model-viewer chỉ từ Shopify CDN (NFR-6)').toEqual([]);
  });

  test('AC1 TC-109 ?variant= có featured_media: media đó đứng đầu, không trùng', async ({ page }) => {
    const handle = await open(page, DATA.variants, 'TE4_VARIANTS_HANDLE');
    const js = await productJs(page, handle);
    const variant = js.variants.find((v) => v.featured_media && v.featured_media.id !== js.media[0]?.id);
    test.skip(!variant, 'Không có variant mang featured_media khác media đầu');
    await page.goto(productPath(handle, `?variant=${variant!.id}`));
    await expect(tid(page, T.mediaItem).first()).toHaveAttribute('data-media-id', String(variant!.featured_media!.id));
    await expect(mediaItem(page, variant!.featured_media!.id)).toHaveCount(1);
    await expect(tid(page, T.mediaItem)).toHaveCount(js.media.length);
  });

  test('AC1 TC-110 đổi variant: gallery tới featured_media, aria-current theo, focus không nhảy sang gallery', async ({ page }) => {
    const handle = await open(page, DATA.variants, 'TE4_VARIANTS_HANDLE');
    await ready(page, 'product-media-gallery', 'product-variant-picker');
    const js = await productJs(page, handle);
    const firstId = await tid(page, T.mediaItem).first().getAttribute('data-media-id');
    const variant = js.variants.find((v) => v.featured_media && String(v.featured_media.id) !== firstId);
    test.skip(!variant, 'Không có variant mang featured_media khác media đầu');
    const id = variant!.featured_media!.id;
    await selectOptions(page, variant!.options);
    await expect
      .poll(() =>
        mediaItem(page, id).evaluate((li) => {
          const list = li.parentElement!;
          const r = li.getBoundingClientRect();
          if (list.scrollWidth > list.clientWidth) return Math.abs(r.left - list.getBoundingClientRect().left) < 2;
          return Math.min(r.bottom, innerHeight) - Math.max(r.top, 0) >= Math.min(r.height, innerHeight) * 0.5;
        })
      )
      .toBe(true);
    if (await tid(page, T.thumbs).count()) await expect(thumbOf(page, id)).toHaveAttribute('aria-current', 'true');
    expect(await page.evaluate(() => !!document.activeElement?.closest('product-media-gallery'))).toBe(false);
    await settled(page);
  });

  test('AC1 TC-111 biên: sản phẩm không media có placeholder, không thumbnail, không dialog', async ({ page }) => {
    await open(page, DATA.noMedia, 'TE4_NO_MEDIA_HANDLE');
    await expect(tid(page, T.mediaPlaceholder)).toHaveCount(1);
    await expect(tid(page, T.mediaPlaceholder).locator('svg')).toHaveCount(1);
    await expect(tid(page, T.thumbs)).toHaveCount(0);
    await expect(tid(page, T.zoomDialog)).toHaveCount(0);
  });
});

// ---------- AC2 variant ----------
test.describe('ES1-T70 TE-4 AC2 variant', () => {
  test('AC2 TC-201 first available load mặc định: radio, hidden id, tồn, nút khớp', async ({ page }) => {
    const handle = await open(page, DATA.options, 'TE4_OPTIONS_HANDLE');
    const js = await productJs(page, handle);
    const first = js.variants.find((v) => v.available) ?? js.variants[0];
    await expect(tid(page, T.variantId)).toHaveValue(String(first.id));
    for (const [i, value] of first.options.entries()) {
      await expect(tid(page, T.option).nth(i).locator(`input[name="option-${i + 1}"]:checked`)).toHaveAttribute('value', value);
    }
    await expect(tid(page, T.inventory)).toHaveAttribute('data-state', first.available ? 'in_stock' : 'sold_out');
    expect(await tid(page, T.picker).evaluate((el) => el.closest('form') === null), 'radio không bị submit').toBe(true);
  });

  test('AC2 TC-202 đổi option: giá, compare, unit, tồn, nút, ?variant= đổi không reload; cả còn và hết hàng', async ({ page }) => {
    const { product } = await openPicker(page);
    const start = await currentId(page);
    const others = product.variants.filter((v) => v.id !== start);
    test.skip(others.length === 0, 'Sản phẩm chỉ có 1 variant');
    const picks = [others.find((v) => v.available), others.find((v) => !v.available)].filter(Boolean) as JsVariant[];
    for (const variant of picks) {
      await selectOptions(page, variant.options);
      await expectVariantUi(page, variant);
    }
    const last = picks[picks.length - 1];
    for (let i = 0; i < product.options.length; i += 1) {
      for (const input of await tid(page, T.option).nth(i).locator('input[type="radio"]').all()) {
        const value = await input.getAttribute('value');
        const ok = product.variants.some((v) => v.available && v.options.every((o, j) => o === (j === i ? value : last.options[j])));
        await expect(input).toHaveAttribute('data-available', String(ok));
      }
    }
  });

  test('AC2 TC-203 giá gạch hiện/ẩn theo variant sale và không sale', async ({ page }) => {
    const { product } = await openPicker(page, SRC.sale);
    const sale = product.variants.find((v) => v.available && v.compare_at_price && v.compare_at_price > v.price);
    const plain = product.variants.find((v) => v.available && !(v.compare_at_price && v.compare_at_price > v.price));
    test.skip(!sale || !plain, 'TE4_SWATCH_SALE_HANDLE cần 1 variant sale và 1 variant không sale còn hàng');
    // Mọi lượt đều là lần chọn thật: bắt đầu từ variant khác variant đang hiện.
    const order = (await currentId(page)) === plain!.id ? [sale!, plain!] : [plain!, sale!];
    for (const variant of order) {
      await selectOptions(page, variant.options);
      await expectVariantUi(page, variant);
    }
  });

  test('AC2 TC-204 unit price hiện dạng giá/đơn vị và theo variant', async ({ page }) => {
    const handle = await open(page, DATA.unitPrice, 'TE4_UNIT_PRICE_HANDLE');
    const js = await productJs(page, handle);
    const unit = tid(page, T.price).getByTestId(T.priceUnit);
    const first = js.variants.find((v) => v.available) ?? js.variants[0];
    test.skip(!first.unit_price, 'Variant mặc định của TE4_UNIT_PRICE_HANDLE không có unit_price');
    await expect(unit).toContainText('/');
    expect(cents(await unit.textContent())).toBe(first.unit_price);
    const other = js.variants.find((v) => v.id !== first.id);
    if (other && (await tid(page, T.picker).count())) {
      await ready(page, 'product-variant-picker');
      await markNoReload(page);
      await selectOptions(page, other.options);
      await expectVariantUi(page, other);
    }
  });

  test('AC2 TC-205 tổ hợp không tồn tại: nút disabled + Unavailable, không fetch partial, live region báo', async ({ page }) => {
    const { handle, product } = await openPicker(page);
    const missing = missingCombo(product);
    test.skip(product.options.length < 2 || !missing, 'Cần sản phẩm 2 option có tổ hợp không tồn tại');
    const isPartial = partialUrl(handle);
    const partials: string[] = [];
    page.on('request', (r) => {
      if (['fetch', 'xhr'].includes(r.resourceType()) && isPartial(new URL(r.url()))) partials.push(r.url());
    });
    const clicks: Array<[number, string]> = [];
    for (const [i, value] of missing!.entries()) {
      if (!(await optionValue(page, i, value).locator('input').isChecked())) clicks.push([i, value]);
    }
    for (const [i, value] of clicks.slice(0, -1)) await optionValue(page, i, value).click();
    await settled(page);
    partials.length = 0;
    const [i, value] = clicks[clicks.length - 1];
    await optionValue(page, i, value).click();

    const label = (await tid(page, T.form).getAttribute('data-label-unavailable')) ?? '';
    await expect(tid(page, T.add)).toBeDisabled();
    await expect(tid(page, T.add)).toHaveText(label);
    await expect(tid(page, T.inventory)).toHaveAttribute('data-state', 'unavailable');
    await expect(tid(page, T.stickyAdd)).toBeDisabled();
    await expect(tid(page, T.status)).toHaveText(label);
    await page.waitForTimeout(500);
    expect(partials, 'tổ hợp không tồn tại không được fetch').toEqual([]);
    expect(product.variants.some((v) => String(v.id) === new URL(page.url()).searchParams.get('variant')) || !new URL(page.url()).searchParams.get('variant')).toBe(true);
  });

  test('AC2 TC-206 ?variant= deep link: radio, hidden id, tồn theo variant; hết hàng thì nút disabled', async ({ page }) => {
    const handle = await open(page, DATA.options, 'TE4_OPTIONS_HANDLE');
    const js = await productJs(page, handle);
    const target = js.variants.find((v) => !v.available) ?? js.variants[1];
    test.skip(!target, 'Cần từ 2 variant');
    await page.goto(productPath(handle, `?variant=${target.id}`));
    await expect(tid(page, T.variantId)).toHaveValue(String(target.id));
    for (const [i, value] of target.options.entries()) {
      await expect(tid(page, T.option).nth(i).locator('input[type="radio"]:checked')).toHaveAttribute('value', value);
    }
    if (target.available) await expect(tid(page, T.add)).toBeEnabled();
    else {
      await expect(tid(page, T.add)).toBeDisabled();
      await expect(tid(page, T.inventory)).toHaveAttribute('data-state', 'sold_out');
    }
  });

  test('AC2 TC-207 biên: ?variant= sai id thì về first available', async ({ page }) => {
    const handle = await open(page, DATA.options, 'TE4_OPTIONS_HANDLE', '?variant=1');
    const js = await productJs(page, handle);
    await expect(tid(page, T.variantId)).toHaveValue(String((js.variants.find((v) => v.available) ?? js.variants[0]).id));
  });

  test('AC2 TC-208 biên hết hàng toàn bộ: nút chính và sticky disabled, nhãn Sold out', async ({ page }) => {
    await open(page, DATA.soldOut, 'TE4_SOLD_OUT_HANDLE');
    await expect(tid(page, T.add)).toBeDisabled();
    await expect(tid(page, T.add)).toHaveText('Sold out');
    await expect(tid(page, T.inventory)).toHaveAttribute('data-state', 'sold_out');
    await expect(tid(page, T.inventory)).toHaveText('Sold out');
    await expect(tid(page, T.stickyAdd)).toBeDisabled();
    await expect(tid(page, T.stickyAdd)).toHaveText('Sold out');
  });

  test('AC2 TC-209 mất mạng partial (route.abort): nút + tồn về trạng thái đã render, aria-busy gỡ', async ({ page, consoleGuard }) => {
    consoleGuard.allowNetworkLog();
    const { handle, product } = await openPicker(page);
    const start = await currentId(page);
    const startVariant = product.variants.find((v) => v.id === start);
    const target = product.variants.find((v) => v.id !== start && v.available !== startVariant?.available) ?? product.variants.find((v) => v.id !== start);
    test.skip(!target, 'Sản phẩm chỉ có 1 variant');
    const before = await buttonsSnapshot(page);
    await onPartial(page, handle, (route) => route.abort('failed'));
    await selectOptions(page, target!.options);
    await settled(page);
    expect(await buttonsSnapshot(page)).toEqual(before);
  });

  test('AC2 TC-210 mất mạng sau khi đi qua tổ hợp không tồn tại: không kẹt Unavailable (ES1-T87)', async ({ page, consoleGuard }) => {
    consoleGuard.allowNetworkLog();
    const { handle, product } = await openPicker(page);
    const missing = missingCombo(product);
    test.skip(product.options.length < 2 || !missing, 'Cần sản phẩm 2 option có tổ hợp không tồn tại');
    const start = await currentId(page);
    const other = product.variants.find((v) => v.id !== start)!;
    const before = await buttonsSnapshot(page);
    await onPartial(page, handle, (route) => route.abort());
    await selectOptions(page, missing!);
    await expect(tid(page, T.inventory)).toHaveAttribute('data-state', 'unavailable');
    await selectOptions(page, other.options);
    await settled(page);
    expect(await buttonsSnapshot(page)).toEqual(before);
    await expect(tid(page, T.variantId)).toHaveValue(String(other.id));
  });

  test('AC2 TC-211 request đang chạy bị tổ hợp không tồn tại huỷ: giữ Unavailable (ES1-T87)', async ({ page, consoleGuard }) => {
    consoleGuard.allowNetworkLog();
    const { handle, product } = await openPicker(page);
    const missing = missingCombo(product);
    test.skip(product.options.length < 2 || !missing, 'Cần sản phẩm 2 option có tổ hợp không tồn tại');
    const start = await currentId(page);
    const other = product.variants.find((v) => v.id !== start)!;
    const DELAY = 1500;
    await onPartial(page, handle, async (route) => {
      await new Promise((r) => setTimeout(r, DELAY));
      await route.continue().catch(() => {});
    });
    await selectOptions(page, other.options);
    await expect(tid(page, T.form)).toHaveAttribute('aria-busy', 'true');
    await selectOptions(page, missing!);
    await settled(page);
    await page.waitForTimeout(DELAY + 500);
    const label = (await tid(page, T.form).getAttribute('data-label-unavailable')) ?? '';
    await expect(tid(page, T.add)).toBeDisabled();
    await expect(tid(page, T.add)).toHaveText(label);
    await expect(tid(page, T.inventory)).toHaveAttribute('data-state', 'unavailable');
    await expect(tid(page, T.stickyAdd)).toBeDisabled();
  });

  test('AC2 TC-212 keyboard: mũi tên đổi radio, focus giữ trên radio, label có viền focus, URL đổi', async ({ page }) => {
    const { product } = await openPicker(page);
    const values = product.options[0].values;
    test.skip(values.length < 2, 'Option đầu cần từ 2 giá trị');
    const checked = tid(page, T.option).first().locator('input[type="radio"]:checked');
    const startValue = await checked.getAttribute('value');
    await checked.focus();
    await page.keyboard.press('ArrowRight');
    await expect(checked).not.toHaveAttribute('value', startValue ?? '');
    const newValue = (await checked.getAttribute('value'))!;
    await settled(page);
    expect(await page.evaluate(() => (document.activeElement as HTMLInputElement | null)?.value)).toBe(newValue);
    const outline = await optionValue(page, 0, newValue).evaluate((el) => getComputedStyle(el).outlineStyle);
    expect(outline).not.toBe('none');
    expect(await stayed(page)).toBe(true);
  });

  test('AC2 TC-213 screen reader: live region báo tồn kho sau đổi variant', async ({ page }) => {
    const { product } = await openPicker(page);
    const start = await currentId(page);
    const target = product.variants.find((v) => v.id !== start);
    test.skip(!target, 'Sản phẩm chỉ có 1 variant');
    await selectOptions(page, target!.options);
    await settled(page);
    await expect(tid(page, T.status)).toHaveAttribute('role', 'status');
    await expect(tid(page, T.status)).toHaveAttribute('aria-live', 'polite');
    await expect(tid(page, T.status)).toHaveText(target!.available ? 'In stock' : 'Sold out');
    await expect(tid(page, T.error)).toHaveAttribute('role', 'alert');
    await expect(tid(page, T.error)).toHaveText('');
  });

  test('AC2 TC-215 biên giá nhỏ: giá và giá gạch khớp .js, không sai do làm tròn', async ({ page }) => {
    const handle = await open(page, DATA.smallPrice, 'TE4_SALE_SMALL_PRICE_HANDLE');
    const js = await productJs(page, handle);
    const first = js.variants.find((v) => v.available) ?? js.variants[0];
    const price = tid(page, T.price);
    expect(cents(await price.getByTestId(T.priceRegular).first().textContent())).toBe(first.price);
    test.skip(!first.compare_at_price || first.compare_at_price <= first.price, 'Variant mặc định không sale');
    expect(cents(await price.getByTestId(T.priceCompare).first().textContent())).toBe(first.compare_at_price);
  });

  test('AC2 TC-214 axe 0 serious trước và sau đổi variant', async ({ page }) => {
    const { product } = await openPicker(page);
    await expectNoSerious(page, T.main);
    const start = await currentId(page);
    const target = product.variants.find((v) => v.id !== start);
    test.skip(!target, 'Sản phẩm chỉ có 1 variant');
    await selectOptions(page, target!.options);
    await settled(page);
    await expectNoSerious(page, T.main);
  });
});

// ---------- AC3 nội dung ----------
test.describe('ES1-T70 TE-4 AC3 nội dung', () => {
  test('AC3 TC-301 title đầy đủ trong h1 duy nhất, vendor, giá, mô tả', async ({ page }) => {
    const handle = await open(page, DATA.variants, 'TE4_VARIANTS_HANDLE');
    const js = await productJs(page, handle);
    await expect(tid(page, T.title)).toHaveText(js.title);
    expect(await tid(page, T.title).evaluate((el) => el.tagName)).toBe('H1');
    await expect(page.locator('h1')).toHaveCount(1);
    if (js.vendor) await expect(tid(page, T.vendor)).toHaveText(js.vendor);
    await expect(tid(page, T.price).getByTestId('price')).toBeVisible();
    if (js.description?.trim()) await expect(tid(page, T.description)).toBeVisible();
    else await expect(tid(page, T.description)).toHaveCount(0);
  });

  test('AC3 TC-302 tên option và giá trị đúng theo sản phẩm, fieldset + legend', async ({ page }) => {
    const handle = await open(page, DATA.options, 'TE4_OPTIONS_HANDLE');
    const js = await productJs(page, handle);
    const options = tid(page, T.option);
    await expect(options).toHaveCount(js.options.length);
    for (const [i, option] of js.options.entries()) {
      await expect(options.nth(i).locator('legend')).toHaveText(option.name);
      const radios = options.nth(i).locator('input[type="radio"]');
      await expect(radios).toHaveCount(option.values.length);
      for (const [j, value] of option.values.entries()) {
        await expect(radios.nth(j)).toHaveAttribute('value', value);
        await expect(radios.nth(j)).toHaveAccessibleName(value);
      }
    }
  });

  test('AC3 TC-303 ghi chú thuế là 1 trong 4 chuỗi locale', async ({ page }) => {
    await open(page, DATA.variants, 'TE4_VARIANTS_HANDLE');
    expect(TAX_NOTES).toContain((await tid(page, T.noteTax).innerText()).trim());
  });

  test('AC3 TC-304 số lượng: input number min 1 value 1 có nhãn; nhập 3 thì gửi quantity 3', async ({ page }) => {
    await openBuyable(page);
    const qty = tid(page, T.quantity);
    await expect(qty).toHaveAttribute('type', 'number');
    await expect(qty).toHaveAttribute('name', 'quantity');
    await expect(qty).toHaveAttribute('min', '1');
    await expect(qty).toHaveValue('1');
    await expect(qty).toHaveAccessibleName('Quantity');
    await qty.fill('3');
    const requests = await mockAdd(page);
    await tid(page, T.add).click();
    await expect.poll(() => requests.length).toBe(1);
    expect(fields(requests[0]).quantity).toBe('3');
  });

  test('AC3 TC-305 biên: quantity 0 bị chặn, không gửi cart/add.js', async ({ page }) => {
    await openBuyable(page);
    const requests = await mockAdd(page);
    await tid(page, T.quantity).fill('0');
    await tid(page, T.add).click();
    await page.waitForTimeout(500);
    expect(requests).toHaveLength(0);
    expect(await tid(page, T.quantity).evaluate((el: HTMLInputElement) => el.validity.rangeUnderflow)).toBe(true);
    expect(await stayed(page)).toBe(true);
  });

  test('AC3 TC-306 mobile 360px: trang không tràn ngang; option, nút, quantity từ 24px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await open(page, DATA.options, 'TE4_OPTIONS_HANDLE');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    for (const el of [...(await tid(page, T.optionValue).all()), tid(page, T.add), tid(page, T.quantity)]) {
      const box = await el.boundingBox();
      expect(box, 'phần tử phải hiện').not.toBeNull();
      expect(box!.width).toBeGreaterThanOrEqual(24);
      expect(box!.height).toBeGreaterThanOrEqual(24);
    }
  });
});

// ---------- AC4 checkout nhanh, pickup, selling plan ----------
test.describe('ES1-T70 TE-4 AC4 checkout nhanh, pickup, selling plan', () => {
  test('AC4 TC-401 payment_button mặc định bật, trong form, theme không đè màu khung', async ({ page }) => {
    await open(page, DATA.variants, 'TE4_VARIANTS_HANDLE');
    const pay = tid(page, T.payment);
    await expect(pay).toHaveCount(1);
    await expect(pay.locator('*')).not.toHaveCount(0);
    expect(await pay.evaluate((el) => el.closest('form')?.getAttribute('id') ?? '')).toMatch(/^product-form-\d+$/);
    expect(await pay.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgba(0, 0, 0, 0)');
  });

  test('AC4 TC-402 installments partial có mặt; ghi annotation khi shop chưa bật Shop Pay Installments', async ({ page }) => {
    await open(page, DATA.variants, 'TE4_VARIANTS_HANDLE');
    const box = tid(page, T.installments);
    await expect(box).toHaveCount(1);
    if ((await box.locator('shopify-payment-terms').count()) === 0) {
      test.info().annotations.push({ type: 'data', description: 'Shop chưa render shopify-payment-terms: banner kiểm tay trên store bật Shop Pay Installments (TC-403)' });
    }
  });

  test('AC4 TC-404 đổi variant: partial installments, payment_button vẫn còn', async ({ page }) => {
    const { product } = await openPicker(page);
    const start = await currentId(page);
    const target = product.variants.find((v) => v.id !== start);
    test.skip(!target, 'Sản phẩm chỉ có 1 variant');
    await selectOptions(page, target!.options);
    await settled(page);
    await expect(tid(page, T.installments)).toHaveCount(1);
    await expect(tid(page, T.payment).locator('*')).not.toHaveCount(0);
  });

  test('AC4 TC-405 selling plan: radio name selling_plan, 1 lựa chọn checked, One-time trừ khi requires_selling_plan, có giá', async ({ page }) => {
    const handle = await open(page, DATA.sellingPlan, 'TE4_SELLING_PLAN_HANDLE');
    const js = await productJs(page, handle);
    const group = tid(page, T.plans);
    await expect(group).toHaveCount(1);
    await expect(group.locator('input[name="selling_plan"]:checked')).toHaveCount(1);
    await expect(group.locator('input[name="selling_plan"][value=""]')).toHaveCount(js.requires_selling_plan ? 0 : 1);
    for (const label of await tid(page, T.plan).all()) await expect(label).toContainText(/\d/);
  });

  test('AC4 TC-406 chọn selling plan: URL có selling_plan, giữ chọn sau partial', async ({ page }) => {
    await open(page, DATA.sellingPlan, 'TE4_SELLING_PLAN_HANDLE');
    const plans = tid(page, T.plan).filter({ has: page.locator('input[name="selling_plan"]:not([value=""])') });
    test.skip((await plans.count()) === 0, 'Sản phẩm không có selling plan');
    test.skip((await tid(page, T.picker).count()) === 0, 'Sản phẩm 1 variant: picker không render, JS không đồng bộ URL');
    await ready(page, 'product-variant-picker');
    const value = await plans.first().locator('input').getAttribute('value');
    await plans.first().click();
    await expect.poll(() => new URL(page.url()).searchParams.get('selling_plan')).toBe(value);
    await settled(page);
    await expect(tid(page, T.plans).locator('input[name="selling_plan"]:checked')).toHaveAttribute('value', value ?? '');
  });

  test('AC4 TC-407 thêm giỏ gửi selling_plan đã chọn; One-time không gửi selling_plan', async ({ page, consoleGuard }) => {
    consoleGuard.allowNetworkLog();
    await openBuyable(page, SRC.sellingPlan);
    const plans = tid(page, T.plan).filter({ has: page.locator('input[name="selling_plan"]:not([value=""])') });
    test.skip((await plans.count()) === 0, 'Sản phẩm không có selling plan');
    const oneTime = tid(page, T.plan).filter({ has: page.locator('input[name="selling_plan"][value=""]') });
    test.skip((await oneTime.count()) === 0, 'Sản phẩm requires_selling_plan: không có One-time');
    const requests: Request[] = [];
    // Trả 422 để form ở lại trang, gửi được lần 2.
    await page.route(ADD_GLOB, async (route) => {
      requests.push(route.request());
      await route.fulfill({ status: 422, contentType: 'application/json', body: JSON.stringify(MOCK_422) });
    });

    await oneTime.click();
    await tid(page, T.add).click();
    await expect(tid(page, T.error)).toHaveText(MOCK_422.description);
    expect(Object.keys(fields(requests[0]))).not.toContain('selling_plan');

    const value = await plans.first().locator('input').getAttribute('value');
    await plans.first().click();
    await settled(page);
    await tid(page, T.add).click();
    await expect.poll(() => requests.length).toBe(2);
    expect(fields(requests[1]).selling_plan).toBe(value);
  });

  test('AC4 TC-408 pickup: có location pick_up_enabled thì hiện, details mở được', async ({ page }) => {
    await open(page, DATA.pickup, 'TE4_PICKUP_HANDLE');
    await expect(tid(page, T.pickup)).toHaveCount(1);
    await expect(tid(page, T.pickup)).toContainText(/Pickup/);
    const details = tid(page, T.pickupDetails);
    if (await details.count()) {
      expect(await details.evaluate((el) => el.tagName.toLowerCase())).toBe('details');
      await details.locator('summary').click();
      await expect(details.locator('li').first()).toBeVisible();
    }
  });

  test('AC4 TC-409 mất mạng partial không làm mất installments, pickup, selling plan', async ({ page, consoleGuard }) => {
    consoleGuard.allowNetworkLog();
    const handle = await open(page, DATA.pickup, 'TE4_PICKUP_HANDLE');
    test.skip((await tid(page, T.picker).count()) === 0, 'TE4_PICKUP_HANDLE chỉ có 1 variant: không đổi variant được');
    await ready(page, 'product-variant-picker');
    const product = await productJs(page, handle);
    const start = await currentId(page);
    const target = product.variants.find((v) => v.id !== start);
    test.skip(!target, 'Sản phẩm chỉ có 1 variant');
    await onPartial(page, handle, (route) => route.abort());
    await selectOptions(page, target!.options);
    await settled(page);
    await expect(tid(page, T.installments)).toHaveCount(1);
    await expect(tid(page, T.pickup)).toHaveCount(1);
    await expect(tid(page, T.payment).locator('*')).not.toHaveCount(0);
  });
});

// ---------- AC5 sticky bar ----------
test.describe('ES1-T70 TE-4 AC5 sticky bar', () => {
  test('AC5 TC-501 mobile: cuộn qua nút chính thì hiện tên, giá, nút; cuộn về thì ẩn', async ({ page }) => {
    await mobileWidth(page);
    await openBuyable(page);
    const sticky = tid(page, T.sticky);
    const html = page.locator('html');
    await expect(sticky).toBeHidden();
    await expect(html).not.toHaveAttribute('data-sticky-bar-visible');
    await scrollPastAdd(page);
    await expect(sticky).toBeVisible();
    await expect(html).toHaveAttribute('data-sticky-bar-visible');
    await expect(tid(page, T.stickyTitle)).toBeVisible();
    await expect(tid(page, T.stickyPrice)).toBeVisible();
    await expect(tid(page, T.stickyAdd)).toBeEnabled();
    await tid(page, T.add).evaluate((b) => b.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await expect(sticky).toBeHidden();
    await expect(html).not.toHaveAttribute('data-sticky-bar-visible');
  });

  test('AC5 TC-502 mobile: nút sticky gửi form chính đúng variant qua cart/add.js', async ({ page }) => {
    await mobileWidth(page);
    await openBuyable(page);
    await skipIfDrawer(page);
    await scrollPastAdd(page);
    const variantId = await tid(page, T.variantId).inputValue();
    const requests = await mockAdd(page);
    await tid(page, T.stickyAdd).click();
    await page.waitForURL(isCart);
    expect(requests).toHaveLength(1);
    expect(fields(requests[0]).id).toBe(variantId);
    expect(Number(fields(requests[0]).quantity)).toBeGreaterThanOrEqual(1);
  });

  test('AC5 TC-503 mobile: đổi variant thì giá sticky khớp giá chính', async ({ page }) => {
    await mobileWidth(page);
    const { product } = await openPicker(page);
    const start = await currentId(page);
    const target = product.variants.find((v) => v.id !== start && v.available) ?? product.variants.find((v) => v.id !== start);
    test.skip(!target, 'Sản phẩm chỉ có 1 variant');
    await selectOptions(page, target!.options);
    await settled(page);
    await expect.poll(async () => cents(await tid(page, T.stickyPrice).getByTestId(T.priceRegular).first().textContent())).toBe(target!.price);
    await expect(tid(page, T.stickyAdd)).toHaveText(target!.available ? 'Add to cart' : 'Sold out');
  });

  test('AC5 TC-504 biên 360px: sticky nằm trong màn, không tràn ngang', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await openBuyable(page);
    await scrollPastAdd(page);
    const sticky = tid(page, T.sticky);
    await expect(sticky).toBeVisible();
    expect(await sticky.evaluate((el) => getComputedStyle(el).position)).toBe('fixed');
    const box = (await sticky.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(360);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });

  test('AC5 TC-505 1280px: cuộn hết trang, sticky không hiện', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openBuyable(page);
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
    await page.waitForTimeout(300);
    await expect(tid(page, T.sticky)).toBeHidden();
    await expect(page.locator('html')).not.toHaveAttribute('data-sticky-bar-visible');
  });
});

// ---------- AC6 gift card ----------
test.describe('ES1-T70 TE-4 AC6 gift card', () => {
  test('AC6 TC-601 4 field ẩn tới khi tick, đúng name và ràng buộc, có nhãn', async ({ page }) => {
    await open(page, DATA.giftCard, 'TE4_GIFT_CARD_HANDLE');
    await ready(page, 'product-form');
    const toggle = tid(page, T.giftToggle);
    await expect(toggle).toHaveAttribute('name', 'properties[__shopify_send_gift_card_to_customer]');
    await expect(tid(page, T.giftEmail)).toBeHidden();
    await toggle.check();
    await expect(tid(page, T.giftEmail)).toBeVisible();
    await expect(tid(page, T.giftEmail)).toHaveAttribute('type', 'email');
    await expect(tid(page, T.giftEmail)).toHaveAttribute('name', 'properties[Recipient email]');
    await expect(tid(page, T.giftName)).toHaveAttribute('name', 'properties[Recipient name]');
    await expect(tid(page, T.giftMessage)).toHaveAttribute('name', 'properties[Message]');
    await expect(tid(page, T.giftMessage)).toHaveAttribute('maxlength', '200');
    const sendOn = tid(page, T.giftSendOn);
    await expect(sendOn).toHaveAttribute('type', 'date');
    await expect(sendOn).toHaveAttribute('name', 'properties[Send on]');
    const days = (Date.parse((await sendOn.getAttribute('max'))!) - Date.parse((await sendOn.getAttribute('min'))!)) / 86_400_000;
    expect(days).toBe(90);
    for (const id of GIFT_FIELDS) await expect(tid(page, id)).toHaveAccessibleName(/.+/);
  });

  test('AC6 TC-602 tick: gửi 4 field + __shopify_offset đúng múi giờ', async ({ page }) => {
    await openBuyable(page, SRC.giftCard);
    await tid(page, T.giftToggle).check();
    for (const id of GIFT_FIELDS) await expect(tid(page, id)).toBeEnabled();
    await tid(page, T.giftEmail).fill('es1-t70@example.com');
    await tid(page, T.giftName).fill('ES1-T70');
    await tid(page, T.giftMessage).fill('Hello');
    const min = (await tid(page, T.giftSendOn).getAttribute('min'))!;
    await tid(page, T.giftSendOn).fill(min);
    const requests = await mockAdd(page);
    await tid(page, T.add).click();
    await expect.poll(() => requests.length).toBe(1);
    const sent = fields(requests[0]);
    expect(sent['properties[__shopify_send_gift_card_to_customer]']).toBe('on');
    expect(sent['properties[Recipient email]']).toBe('es1-t70@example.com');
    expect(sent['properties[Recipient name]']).toBe('ES1-T70');
    expect(sent['properties[Message]']).toBe('Hello');
    expect(sent['properties[Send on]']).toBe(min);
    expect(sent['properties[__shopify_offset]']).toBe(await page.evaluate(() => String(new Date().getTimezoneOffset())));
  });

  test('AC6 TC-603 bỏ tick: field disabled, không gửi recipient và offset', async ({ page }) => {
    await openBuyable(page, SRC.giftCard);
    for (const id of GIFT_FIELDS) await expect(tid(page, id)).toBeDisabled();
    await tid(page, T.giftToggle).check();
    await tid(page, T.giftEmail).fill('es1-t70@example.com');
    await tid(page, T.giftToggle).uncheck();
    for (const id of GIFT_FIELDS) await expect(tid(page, id)).toBeDisabled();
    const requests = await mockAdd(page);
    await tid(page, T.add).click();
    await expect.poll(() => requests.length).toBe(1);
    const sent = fields(requests[0]);
    expect(Object.keys(sent).filter((k) => /Recipient|Message|Send on|__shopify_offset|__shopify_send_gift_card/.test(k))).toEqual([]);
    expect(sent.id).toBeTruthy();
  });

  test('AC6 TC-604 biên: message dài hơn 200 ký tự bị cắt ở 200', async ({ page }) => {
    await open(page, DATA.giftCard, 'TE4_GIFT_CARD_HANDLE');
    await ready(page, 'product-form');
    await tid(page, T.giftToggle).check();
    await tid(page, T.giftMessage).pressSequentially('x'.repeat(205));
    await expect(tid(page, T.giftMessage)).toHaveValue('x'.repeat(200));
  });

  test('AC6 TC-605 axe 0 serious khi form gift card mở', async ({ page }) => {
    await open(page, DATA.giftCard, 'TE4_GIFT_CARD_HANDLE');
    await ready(page, 'product-form');
    await tid(page, T.giftToggle).check();
    await expectNoSerious(page, T.form);
  });
});

// ---------- AC7 recommendations ----------
test.describe('ES1-T70 TE-4 AC7 recommendations', () => {
  // Ghi request theo intent từ trước goto; reach cuộn tới container (root hidden không có box) rồi chờ request.
  async function openRecs(page: Page) {
    const seen = new Map<string, Request>();
    page.on('request', (r) => {
      if (REC.test(r.url())) seen.set(new URL(r.url()).searchParams.get('intent') ?? '', r);
    });
    await open(page, DATA.variants, 'TE4_VARIANTS_HANDLE');
    await expect(tid(page, T.recs)).toHaveCount(2);
    await ready(page, 'product-recommendations');
    return async (container: string, intent: string) => {
      await tid(page, container).evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
      await expect.poll(() => seen.has(intent), { timeout: 15_000, message: `không có request intent=${intent}` }).toBe(true);
      return seen.get(intent)!;
    };
  }

  test('AC7 TC-701 template card đủ testid, ảnh lazy có width/height, badge Sold out ẩn, không swatch', async ({ page }) => {
    await open(page, DATA.variants, 'TE4_VARIANTS_HANDLE');
    const templates = tid(page, T.recsTemplate);
    await expect(templates).toHaveCount(2);
    for (let i = 0; i < 2; i += 1) {
      const info = await templates.nth(i).evaluate((el, ids) => {
        const c = (el as HTMLTemplateElement).content;
        const img = c.querySelector('img[data-card-image]');
        const badge = c.querySelector(`[data-testid="${ids.cardSoldOut}"]`);
        const count = (id: string) => c.querySelectorAll(`[data-testid="${id}"]`).length;
        return {
          cards: count(ids.card),
          titles: count(ids.cardTitle),
          prices: count(ids.cardPrice),
          badgeHidden: badge?.hasAttribute('hidden') ?? false,
          titleTag: c.querySelector(`[data-testid="${ids.cardTitle}"]`)?.tagName.toLowerCase(),
          width: Number(img?.getAttribute('width')),
          height: Number(img?.getAttribute('height')),
          loading: img?.getAttribute('loading'),
          swatches: c.querySelectorAll('input[type="radio"]').length,
        };
      }, T);
      expect(info).toMatchObject({ cards: 1, titles: 1, prices: 1, badgeHidden: true, titleTag: 'a', loading: 'lazy', swatches: 0 });
      expect(info.width).toBeGreaterThan(0);
      expect(info.height).toBeGreaterThan(0);
    }
  });

  test('AC7 TC-702 related có card, giá card khớp giá trang sản phẩm đích, axe 0 serious', async ({ page }) => {
    const reach = await openRecs(page);
    const root = recsIn(page, T.related);
    const limit = Number(await root.getAttribute('data-limit'));
    const productId = await root.getAttribute('data-product-id');
    const res = await (await reach(T.related, 'related')).response();
    expect(res, 'request related không có response').not.toBeNull();
    const url = new URL(res!.url());
    expect(url.searchParams.get('product_id')).toBe(productId);
    expect(url.searchParams.get('limit')).toBe(String(limit));
    const body = (await res!.json()) as { products: JsProduct[] };
    test.skip(!body.products?.length, 'Store chưa có related cho sản phẩm này (API trả 0)');

    await expect(root).toBeVisible();
    await expect(root.getByTestId(T.recsHeading)).toHaveText(/.+/);
    const cards = root.getByTestId(T.recsList).getByTestId(T.card);
    await expect(cards).toHaveCount(Math.min(body.products.length, limit));
    const first = cards.first();
    const p = body.products[0];
    await expect(first.getByTestId(T.cardTitle)).toHaveText(p.title);
    const href = (await first.getByTestId(T.cardTitle).getAttribute('href'))!;
    expect(decodeURIComponent(new URL(href, page.url()).pathname)).toContain(`/products/${p.handle}`);
    const img = first.locator('img[data-card-image]');
    if (p.featured_image) await expect(img).toHaveAttribute('src', /.+/);
    else await expect(img).toHaveCount(0);
    await expect(first.getByTestId(T.cardSoldOut)).toBeVisible({ visible: p.available === false });
    await expectNoSerious(page, T.related);

    const cardPrice = ((await first.locator('[data-card-price-current]').textContent()) ?? '').trim();
    expect(cardPrice).not.toBe('');
    await page.goto(href);
    const pagePrice = ((await tid(page, T.price).getByTestId(T.priceRegular).first().textContent()) ?? '').replace(/\s+/g, ' ').trim();
    expect(cardPrice).toBe(pagePrice);
  });

  test('AC7 TC-703 complementary thật: có kết quả thì hiện card, 0 kết quả thì hidden', async ({ page }) => {
    const reach = await openRecs(page);
    const root = recsIn(page, T.complementary);
    const res = await (await reach(T.complementary, 'complementary')).response();
    const products = res?.ok() ? (((await res.json()) as { products?: JsProduct[] }).products ?? []) : [];
    if (products.length) {
      await expect(root).toBeVisible();
      await expect(root.getByTestId(T.card).first()).toBeVisible();
    } else {
      test.info().annotations.push({ type: 'data', description: 'Complementary trả 0 kết quả: nhánh có card chưa được kiểm trên dữ liệu thật (có TC-708 mock)' });
      await page.waitForTimeout(500);
      await expect(root).toHaveAttribute('hidden', '');
      await expect(root.getByTestId(T.recsList).locator('> *')).toHaveCount(0);
    }
  });

  for (const [id, name, handler] of [
    ['TC-704', 'route.abort', (r: Route) => r.abort()],
    ['TC-705', '0 kết quả', (r: Route) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"products":[]}' })],
    ['TC-706', 'HTTP 500', (r: Route) => r.fulfill({ status: 500, contentType: 'application/json', body: '{}' })],
    ['TC-707', 'JSON hỏng', (r: Route) => r.fulfill({ status: 200, contentType: 'application/json', body: '<html>' })],
  ] as const) {
    test(`AC7 ${id} ${name}: cả 2 khối giữ hidden`, async ({ page, consoleGuard }) => {
      consoleGuard.allowNetworkLog();
      await page.route(REC_GLOB, handler);
      const reach = await openRecs(page);
      for (const [container, intent] of [[T.related, 'related'], [T.complementary, 'complementary']] as const) {
        await reach(container, intent);
        await page.waitForTimeout(500);
        const root = recsIn(page, container);
        await expect(root).toBeHidden();
        await expect(root).toHaveAttribute('hidden', '');
        await expect(root.getByTestId(T.recsList).locator('> *')).toHaveCount(0);
      }
    });
  }

  test('AC7 TC-708 mock: giá gạch, badge Sold out, width/height ảnh từ JSON, cùng định dạng tiền Liquid', async ({ page }) => {
    const handle = await open(page, DATA.variants, 'TE4_VARIANTS_HANDLE');
    const src = await productJs(page, handle);
    const mock = { ...src, url: productPath(src.handle), available: false, variants: src.variants.map((v) => ({ ...v, compare_at_price: v.price + 12345 })) };
    const media = src.media?.find((m) => m.media_type === 'image');
    await page.route(REC_GLOB, (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [mock] }) }));
    const reach = await openRecs(page);
    const liquidPrice = ((await tid(page, T.price).getByTestId(T.priceRegular).first().textContent()) ?? '').replace(/\s+/g, ' ').trim();
    const root = recsIn(page, T.related);
    await reach(T.related, 'related');
    await expect(root).toBeVisible();
    const card = root.getByTestId(T.card);
    await expect(card).toHaveCount(1);
    await expect(card.locator('[data-card-price]')).toHaveClass(/price--on-sale/);
    await expect(card.locator('[data-card-price-current]')).toHaveText(liquidPrice);
    const compare = ((await card.locator('[data-card-price-compare]').textContent()) ?? '').trim();
    const shape = (s: string) => s.replace(/\d/g, '').replace(/[.,\s]/g, '');
    expect(shape(compare)).toBe(shape(liquidPrice));
    await expect(card.getByTestId(T.cardSoldOut)).toBeVisible();
    if (src.featured_image && media) {
      const img = card.locator('img[data-card-image]');
      await expect(img).toHaveAttribute('width', String(media.width));
      await expect(img).toHaveAttribute('height', String(media.height));
      await expect(img).toHaveAttribute('loading', 'lazy');
    }
  });

  test('AC7 TC-709 không request recommendations trước LCP', async ({ page }) => {
    await open(page, DATA.variants, 'TE4_VARIANTS_HANDLE');
    await page.waitForLoadState('load');
    const timing = await page.evaluate(
      () =>
        new Promise<{ lcp: number; recs: number[] }>((resolve) => {
          let lcp = 0;
          new PerformanceObserver((list) => {
            for (const e of list.getEntries()) lcp = Math.max(lcp, e.startTime);
          }).observe({ type: 'largest-contentful-paint', buffered: true });
          setTimeout(() => {
            resolve({
              lcp,
              recs: performance.getEntriesByType('resource').filter((e) => /\/recommendations\/products\.json/.test(e.name)).map((e) => e.startTime),
            });
          }, 1000);
        })
    );
    expect(timing.lcp).toBeGreaterThan(0);
    for (const start of timing.recs) expect(start, 'request recommendations bắt đầu trước LCP').toBeGreaterThanOrEqual(timing.lcp);
  });
});

// ---------- AC8 thêm giỏ (chỉ /cart; drawer là TE-5) ----------
test.describe('ES1-T70 TE-4 AC8 thêm giỏ', () => {
  test('AC8 TC-801 thành công: chuyển /cart, có theme:cart:updated, giỏ có đúng variant', async ({ page }) => {
    await page.addInitScript(() => {
      document.addEventListener('theme:cart:updated', (e) => sessionStorage.setItem('__te4Cart', JSON.stringify((e as CustomEvent).detail ?? null)));
    });
    await openBuyable(page);
    await skipIfDrawer(page);
    const variantId = await currentId(page);
    const add = page.waitForResponse((r) => r.url().includes(CART.add) && r.request().method() === 'POST');
    await tid(page, T.add).click();
    expect((await add).status()).toBe(200);
    await page.waitForURL(isCart);
    const detail = JSON.parse((await page.evaluate(() => sessionStorage.getItem('__te4Cart'))) ?? 'null');
    expect(detail?.source).toBe('product-form');
    expect(detail?.item?.variant_id).toBe(variantId);
    expect((await cartItems(page)).some((i) => i.variant_id === variantId)).toBeTruthy();
  });

  test('AC8 TC-802 thành công: shopify:cart:lines-update action add, GID đúng, dispatch trước POST, promise resolve cart', async ({ page }) => {
    await captureEvents(page, [EVENT_CART]);
    await openBuyable(page);
    const variantId = await currentId(page);
    await tid(page, T.add).click();
    await expect.poll(async () => (await captured(page, EVENT_CART)).at(-1)?.settled, { timeout: 10_000 }).toBe(true);
    const e = (await captured(page, EVENT_CART)).at(-1)!;
    expect(e.action).toBe('add');
    expect(e.context).toBe('product');
    expect(e.target).toBe('product-form');
    expect(e.addSentBefore, 'event phải bắn trước POST').toBe(false);
    expect(e.lines?.[0]?.merchandiseId).toBe(`gid://shopify/ProductVariant/${variantId}`);
    expect(e.lines?.[0]?.quantity).toBeGreaterThanOrEqual(1);
    expect(e.userErrors).toEqual([]);
    expect(e.warnings).toEqual([]);
    expect(e.cart).toContain(String(variantId));
    expect(e.rejected).toBeUndefined();
  });

  test('AC8 TC-807 lỗi 422: shopify:cart:lines-update resolve userErrors từ API, không reject', async ({ page, consoleGuard }) => {
    consoleGuard.allowNetworkLog();
    await captureEvents(page, [EVENT_CART]);
    await openBuyable(page);
    await page.route(ADD_GLOB, (route) => route.fulfill({ status: 422, contentType: 'application/json', body: JSON.stringify(MOCK_422) }));
    await tid(page, T.add).click();
    await expect(tid(page, T.error)).toHaveText(MOCK_422.description);
    await expect.poll(async () => (await captured(page, EVENT_CART)).at(-1)?.settled, { timeout: 10_000 }).toBe(true);
    const e = (await captured(page, EVENT_CART)).at(-1)!;
    expect(e.userErrors).toEqual([{ message: MOCK_422.description }]);
    expect(e.rejected).toBeUndefined();
  });

  test('AC8 TC-803 lỗi 422: description API vào role=alert, nút khoá khi gửi rồi mở lại, không chuyển trang', async ({ page, consoleGuard }) => {
    consoleGuard.allowNetworkLog();
    await openBuyable(page);
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    await page.route(ADD_GLOB, async (route) => {
      await gate;
      await route.fulfill({ status: 422, contentType: 'application/json', body: JSON.stringify(MOCK_422) });
    });
    const add = tid(page, T.add);
    await add.click();
    await expect(add).toBeDisabled();
    await expect(add).toHaveAttribute('aria-busy', 'true');
    release();
    await expect(tid(page, T.error)).toHaveText(MOCK_422.description);
    await expect(add).toBeEnabled();
    await expect(add).not.toHaveAttribute('aria-busy');
    expect(await stayed(page)).toBe(true);

    await page.unroute(ADD_GLOB);
    await page.route(ADD_GLOB, (route) => route.fulfill({ status: 422, contentType: 'application/json', body: JSON.stringify({ ...MOCK_422, description: 'second' }) }));
    await add.click();
    await expect(tid(page, T.error)).toHaveText('second');
  });

  test('AC8 TC-804 mất mạng (route.abort): không lỗi JS, rơi về submit form thường, tới /cart', async ({ page, consoleGuard }) => {
    consoleGuard.allowNetworkLog();
    await openBuyable(page);
    const variantId = await currentId(page);
    await page.route(ADD_GLOB, (route) => route.abort());
    await tid(page, T.add).click();
    await page.waitForURL(isCart);
    expect((await cartItems(page)).some((i) => i.variant_id === variantId)).toBeTruthy();
  });

  test('AC8 TC-805 HTTP 500 không có JSON: rơi về submit form thường, tới /cart', async ({ page, consoleGuard }) => {
    consoleGuard.allowNetworkLog();
    await openBuyable(page);
    await page.route(ADD_GLOB, (route) => route.fulfill({ status: 500, contentType: 'text/html', body: '<html></html>' }));
    await tid(page, T.add).click();
    await page.waitForURL(isCart);
  });

  test('AC8 TC-806 keyboard: Enter trên nút Add to cart gửi cart/add.js đúng 1 lần', async ({ page }) => {
    await openBuyable(page);
    await skipIfDrawer(page);
    const requests = await mockAdd(page);
    await tid(page, T.add).focus();
    await page.keyboard.press('Enter');
    await page.waitForURL(isCart);
    expect(requests).toHaveLength(1);
  });
});

// ---------- AC9 sản phẩm số, 1 variant ----------
test.describe('ES1-T70 TE-4 AC9 sản phẩm số, 1 variant', () => {
  test('AC9 TC-901 sản phẩm cần vận chuyển: có ghi chú vận chuyển', async ({ page }) => {
    const handle = await open(page, DATA.variants, 'TE4_VARIANTS_HANDLE');
    const js = await productJs(page, handle);
    const first = js.variants.find((v) => v.available) ?? js.variants[0];
    test.skip(!first.requires_shipping, 'Variant mặc định không cần vận chuyển');
    await expect(tid(page, T.noteShipping)).toBeVisible();
    await expect(tid(page, T.noteShipping)).toContainText('calculated at checkout');
  });

  test('AC9 TC-902 sản phẩm số: không ghi chú vận chuyển, không pickup, vẫn có form', async ({ page }) => {
    const handle = await open(page, DATA.digital, 'TE4_DIGITAL_HANDLE');
    const js = await productJs(page, handle);
    expect((js.variants.find((v) => v.available) ?? js.variants[0]).requires_shipping, 'dữ liệu: TE4_DIGITAL_HANDLE phải requires_shipping false').toBe(false);
    await expect(tid(page, T.notes)).toBeVisible();
    await expect(tid(page, T.noteShipping)).toHaveCount(0);
    await expect(tid(page, T.form)).toHaveCount(1);
    await expect(tid(page, T.pickup)).toHaveCount(0);
  });

  test('AC9 TC-903 sản phẩm 1 variant: không picker, có hidden id, thêm giỏ đúng variant', async ({ page }) => {
    const handle = await openBuyable(page, SRC.single);
    const js = await productJs(page, handle);
    expect(js.variants, 'dữ liệu: TE4_SINGLE_HANDLE phải có 1 variant').toHaveLength(1);
    await expect(tid(page, T.picker)).toHaveCount(0);
    await expect(tid(page, T.option)).toHaveCount(0);
    await expect(tid(page, T.variantId)).toHaveValue(String(js.variants[0].id));
    const requests = await mockAdd(page);
    await tid(page, T.add).click();
    await expect.poll(() => requests.length).toBe(1);
    expect(fields(requests[0]).id).toBe(String(js.variants[0].id));
  });
});

// ---------- AC10 thuế, phí theo market ----------
test.describe('ES1-T70 TE-4 AC10 thuế theo market', () => {
  test('AC10 TC-1001 market gồm thuế (?country=): hiện ghi chú đã gồm thuế', async ({ page }) => {
    test.skip(!DATA.taxCountry, 'Thiếu dữ liệu TE4_TAX_INCLUDED_COUNTRY');
    await open(page, DATA.variants, 'TE4_VARIANTS_HANDLE', `?country=${DATA.taxCountry}`);
    await expect(tid(page, T.noteTax)).toHaveText(/^Taxes( and duties)? included\.$/);
  });

  test('AC10 TC-1002 ghi chú thuế giữ nguyên sau đổi variant (nằm trong partial product-price)', async ({ page }) => {
    const { product } = await openPicker(page);
    const before = (await tid(page, T.noteTax).innerText()).trim();
    const start = await currentId(page);
    const target = product.variants.find((v) => v.id !== start);
    test.skip(!target, 'Sản phẩm chỉ có 1 variant');
    await selectOptions(page, target!.options);
    await settled(page);
    await expect(tid(page, T.noteTax)).toHaveText(before);
  });
});

// ---------- AC11 JSON-LD ----------
type Offer = { '@type': string; price: number; priceCurrency: string; availability: string; url: string };
type LdProduct = { '@type': string; name: string; url: string; image?: string[]; description?: string; brand?: { name: string }; offers: Offer[] };

test.describe('ES1-T70 TE-4 AC11 JSON-LD', () => {
  test('AC11 TC-1101 đúng 1 Product, offers đủ variant: price, priceCurrency, availability, url; brand, image', async ({ page }) => {
    const handle = await open(page, DATA.options, 'TE4_OPTIONS_HANDLE');
    const js = await productJs(page, handle);
    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(scripts.map((s) => JSON.parse(s)).filter((d) => d['@type'] === 'Product'), 'đúng 1 Product').toHaveLength(1);
    const ld = JSON.parse((await tid(page, T.structuredData).textContent()) ?? '') as LdProduct;
    expect(ld.name).toBe(js.title);
    expect(ld.url).toMatch(/^https:\/\//);
    if (js.vendor) expect(ld.brand?.name).toBe(js.vendor);
    if (js.media.length) expect(ld.image?.length, 'có media thì có image').toBeGreaterThan(0);
    expect(ld.image?.length ?? 0).toBeLessThanOrEqual(5);
    for (const src of ld.image ?? []) expect(src).toMatch(/^https:\/\/.*width=1200/);
    if (ld.description) expect(ld.description).not.toMatch(/<[a-z/]/i);
    const active = await page.evaluate(() => (window as Win).Shopify?.currency?.active ?? null);
    expect(ld.offers).toHaveLength(js.variants.length);
    js.variants.forEach((variant, i) => {
      const offer = ld.offers[i];
      expect(offer['@type']).toBe('Offer');
      expect(offer.price).toBeCloseTo(variant.price / 100, 2);
      if (active) expect(offer.priceCurrency).toBe(active);
      expect(offer.availability).toBe(variant.available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock');
      expect(offer.url).toMatch(new RegExp(`^https://.*variant=${variant.id}`));
    });
  });

  test('AC11 TC-1102 sản phẩm hết hàng: mọi offer OutOfStock', async ({ page }) => {
    await open(page, DATA.soldOut, 'TE4_SOLD_OUT_HANDLE');
    const ld = JSON.parse((await tid(page, T.structuredData).textContent()) ?? '') as LdProduct;
    expect(ld.offers.length).toBeGreaterThan(0);
    for (const offer of ld.offers) expect(offer.availability).toBe('https://schema.org/OutOfStock');
  });

  test('AC11 TC-1103 biên: sản phẩm không media vẫn parse được, name và offers đủ', async ({ page }) => {
    await open(page, DATA.noMedia, 'TE4_NO_MEDIA_HANDLE');
    const ld = JSON.parse((await tid(page, T.structuredData).textContent()) ?? '') as LdProduct;
    expect(ld.name).toBeTruthy();
    expect(ld.offers.length).toBeGreaterThan(0);
    expect(ld.image ?? []).toEqual([]);
  });
});

// ---------- AC12 event chuẩn (tên và shape theo CTO ES1-T75, doc đầu assets/product-variant-picker.js) ----------
test.describe('ES1-T70 TE-4 AC12 event chuẩn', () => {
  test('AC12 TC-1201 load: shopify:product:view đúng 1 lần context page, handle đúng', async ({ page }) => {
    await captureEvents(page, [EVENT_VIEW]);
    const handle = await open(page, DATA.variants, 'TE4_VARIANTS_HANDLE');
    await expect(tid(page, T.viewEvent)).toBeAttached();
    const js = await productJs(page, handle);
    await expect.poll(async () => (await captured(page, EVENT_VIEW)).filter((e) => e.context === 'page').length, { timeout: 15_000 }).toBe(1);
    await page.waitForTimeout(500);
    const views = (await captured(page, EVENT_VIEW)).filter((e) => e.context === 'page');
    expect(views).toHaveLength(1);
    expect(views[0].handle).toBe(js.handle);
  });

  test('AC12 TC-1202 load: payload s-view-event là JSON hợp lệ của đúng sản phẩm', async ({ page }) => {
    const handle = await open(page, DATA.variants, 'TE4_VARIANTS_HANDLE');
    const js = await productJs(page, handle);
    const raw = await tid(page, T.viewEvent).getAttribute('view-event-payload');
    expect(() => JSON.parse(raw ?? '')).not.toThrow();
    expect(raw?.includes(String(js.id)) || raw?.includes(js.handle), 'payload phải chứa id hoặc handle sản phẩm').toBe(true);
  });

  test('AC12 TC-1203 đổi option: shopify:product:select GID, selectedOptions, promise resolve variant; không bắn lúc load', async ({ page }) => {
    await captureEvents(page, [EVENT_SELECT]);
    const { product } = await openPicker(page);
    await ready(page, 'product-form');
    expect(await captured(page, EVENT_SELECT), 'không select lúc load').toEqual([]);
    const start = await currentId(page);
    const target = product.variants.find((v) => v.id !== start);
    test.skip(!target, 'Sản phẩm chỉ có 1 variant');
    await selectOptions(page, target!.options);
    await expectVariantUi(page, target!);
    const gid = `gid://shopify/ProductVariant/${target!.id}`;
    await expect.poll(async () => (await captured(page, EVENT_SELECT)).at(-1)?.variant?.id, { timeout: 10_000 }).toBe(gid);
    const last = (await captured(page, EVENT_SELECT)).at(-1)!;
    expect(last.productId).toBe(`gid://shopify/Product/${product.id}`);
    expect(last.handle).toBe(product.handle);
    expect(last.target).toBe('product-form');
    expect(last.selectedOptions).toEqual(product.options.map((o, i) => ({ name: o.name, value: target!.options[i] })));
    expect(last.variant?.availableForSale).toBe(target!.available);
    expect(Math.round(Number(last.variant?.price.amount) * 100)).toBe(target!.price);
    expect(last.rejected).toBeUndefined();
  });

  test('AC12 TC-1204 tổ hợp không tồn tại: promise resolve variant null, không reject', async ({ page }) => {
    await captureEvents(page, [EVENT_SELECT]);
    const { product } = await openPicker(page);
    const missing = missingCombo(product);
    test.skip(product.options.length < 2 || !missing, 'Cần sản phẩm 2 option có tổ hợp không tồn tại');
    await selectOptions(page, missing!);
    await expect(tid(page, T.add)).toBeDisabled();
    // Đi qua variant hợp lệ cũng bắn event: chờ event cuối là tổ hợp thiếu, không đọc ngay event trước đó.
    await expect
      .poll(async () => {
        const last = (await captured(page, EVENT_SELECT)).at(-1);
        return last?.settled ? last.variant : 'chưa xong';
      }, { timeout: 10_000 })
      .toBeNull();
    expect((await captured(page, EVENT_SELECT)).at(-1)!.rejected).toBeUndefined();
  });

  test('AC12 TC-1205 theme:variant:change có variantId và featuredMediaId cho gallery', async ({ page }) => {
    await page.addInitScript(() => {
      document.addEventListener('theme:variant:change', (e) => sessionStorage.setItem('__te4Change', JSON.stringify((e as CustomEvent).detail)));
    });
    const { product } = await openPicker(page);
    const start = await currentId(page);
    const target = product.variants.find((v) => v.id !== start);
    test.skip(!target, 'Sản phẩm chỉ có 1 variant');
    await selectOptions(page, target!.options);
    await expect.poll(() => page.evaluate(() => JSON.parse(sessionStorage.getItem('__te4Change') ?? 'null')?.variantId)).toBe(target!.id);
    const detail = await page.evaluate(() => JSON.parse(sessionStorage.getItem('__te4Change') ?? 'null'));
    expect(detail.featuredMediaId ?? null).toBe(target!.featured_media?.id ?? null);
  });

  test('AC12 TC-1206 CTO ES1-T75: không có action show variant, theme không gán Shopify.actions.showVariant', async ({ page }) => {
    await open(page, DATA.variants, 'TE4_VARIANTS_HANDLE');
    await ready(page, 'product-variant-picker');
    expect(await page.evaluate(() => typeof (window as Win).Shopify?.actions?.showVariant)).toBe('undefined');
  });
});

// ---------- nojs (NFR-4) ----------
// Không dùng page.evaluate / locator.evaluate trên trang tắt JS: chỉ assertion locator, page.request (POST giỏ) và helper *NoScript (ES1-T100).
test.describe('ES1-T70 TE-4 nojs', () => {
  test.use({ javaScriptEnabled: false });

  test('AC1 TC-151 nojs thumbnail là anchor tới media, không aria-current tĩnh, zoom link tới ảnh 2048', async ({ page }) => {
    await open(page, DATA.media, 'TE4_MEDIA_HANDLE');
    const thumbs = tid(page, T.thumb);
    const count = await thumbs.count();
    expect(count, 'cần từ 2 media để có thumbnail').toBeGreaterThan(1);
    await expect(tid(page, T.thumbs).locator('[aria-current]')).toHaveCount(0);
    await expect(thumbs.nth(1)).toHaveAccessibleName(`Load media 2 of ${count}`);
    const target = (await thumbs.nth(count - 1).getAttribute('href'))!;
    expect(target).toMatch(/^#ProductMedia-\d+$/);
    await thumbs.nth(count - 1).click();
    await expect(page).toHaveURL(new RegExp(`${target}$`));
    await expect(page.locator(target)).toBeInViewport({ ratio: 0.5 });
    await expect(tid(page, T.zoomLink).first()).toHaveAttribute('href', /[?&]width=2048/);
  });

  test('AC2 TC-251 nojs chọn variant thứ 2 trong select, submit: /cart.js đúng variant', async ({ page }) => {
    const handle = await open(page, DATA.variants, 'TE4_VARIANTS_HANDLE');
    const js = await productDataNoScript(page, handle);
    const target = js.variants.filter((v) => v.available)[1];
    test.skip(!target, 'TE4_VARIANTS_HANDLE cần từ 2 variant còn hàng');
    await expect(tid(page, T.picker)).toBeHidden();
    const select = tid(page, T.variantSelect);
    await expect(select).toBeVisible();
    await expect(select).toHaveAttribute('name', 'id');
    for (const v of js.variants.filter((x) => !x.available)) await expect(select.locator(`option[value="${v.id}"]`)).toBeDisabled();
    await select.selectOption(String(target.id));
    await tid(page, T.add).click();
    await page.waitForURL(isCart);
    expect((await cartItemsNoScript(page)).map((i) => i.variant_id)).toEqual([target.id]);
  });

  test('AC2 TC-252 nojs ?variant= render đúng variant trong select và hidden id', async ({ page }) => {
    const handle = await open(page, DATA.options, 'TE4_OPTIONS_HANDLE');
    const js = await productDataNoScript(page, handle);
    const target = js.variants.find((v) => v.available && v.id !== (js.variants.find((x) => x.available) ?? js.variants[0]).id);
    test.skip(!target, 'Cần từ 2 variant còn hàng');
    await page.goto(productPath(handle, `?variant=${target!.id}`));
    await expect(tid(page, T.variantId)).toHaveValue(String(target!.id));
    await expect(tid(page, T.variantSelect)).toHaveValue(String(target!.id));
  });

  test('AC2 TC-253 nojs sản phẩm hết hàng: nút disabled', async ({ page }) => {
    await open(page, DATA.soldOut, 'TE4_SOLD_OUT_HANDLE');
    await expect(tid(page, T.add)).toBeDisabled();
    await expect(tid(page, T.add)).toHaveText('Sold out');
  });

  test('AC5 TC-551 nojs sticky bar không hiện khi cuộn', async ({ page }) => {
    await open(page, DATA.variants, 'TE4_VARIANTS_HANDLE');
    await page.mouse.wheel(0, 3000);
    await expect(tid(page, T.sticky)).toBeHidden();
    await expect(tid(page, T.info)).toBeVisible();
  });

  test('AC6 TC-651 nojs gift card submit có 4 properties', async ({ page }) => {
    await open(page, DATA.giftCard, 'TE4_GIFT_CARD_HANDLE');
    await tid(page, T.giftToggle).check();
    await tid(page, T.giftEmail).fill('recipient@example.com');
    await tid(page, T.giftName).fill('Recipient Test');
    await tid(page, T.giftMessage).fill('Happy birthday');
    await tid(page, T.giftSendOn).fill((await tid(page, T.giftSendOn).getAttribute('min'))!);
    await tid(page, T.add).click();
    await page.waitForURL(isCart);
    const props = (await cartItemsNoScript(page))[0]?.properties ?? {};
    expect(props['Recipient email']).toBe('recipient@example.com');
    expect(props['Recipient name']).toBe('Recipient Test');
    expect(props['Message']).toBe('Happy birthday');
    expect(props['Send on']).toBeTruthy();
  });

  test('AC7 TC-751 nojs 2 khối recommendations hidden, data hook đúng, list rỗng', async ({ page }) => {
    const handle = await open(page, DATA.variants, 'TE4_VARIANTS_HANDLE');
    const js = await productDataNoScript(page, handle);
    await expect(tid(page, T.recs)).toHaveCount(2);
    for (const [container, intent] of [[T.related, 'related'], [T.complementary, 'complementary']] as const) {
      const root = recsIn(page, container);
      await expect(root).toHaveCount(1);
      await expect(root).toBeHidden();
      await expect(root).toHaveAttribute('hidden', '');
      await expect(root).toHaveAttribute('data-intent', intent);
      await expect(root).toHaveAttribute('data-url', /^\/([a-z]{2}(-[a-z]{2})?\/)?recommendations\/products$/i);
      await expect(root).toHaveAttribute('data-product-id', String(js.id));
      await expect(root).toHaveAttribute('data-money-format', /\{\{\s*amount\w*\s*\}\}/);
      await expect(root.getByTestId(T.recsList).locator('> *')).toHaveCount(0);
      await expect(root.getByTestId(T.recsPlaceholder)).toHaveCount(0);
    }
  });

  test('AC8 TC-851 nojs thêm giỏ không chọn gì: POST form thường, tới /cart, đúng variant mặc định', async ({ page }) => {
    await open(page, DATA.variants, 'TE4_VARIANTS_HANDLE');
    test.skip(await tid(page, T.add).isDisabled(), 'Variant mặc định hết hàng');
    const id = Number(await tid(page, T.variantSelect).inputValue());
    await tid(page, T.add).click();
    await page.waitForURL(isCart);
    expect((await cartItemsNoScript(page)).map((i) => i.variant_id)).toEqual([id]);
  });

  test('AC9 TC-951 nojs sản phẩm 1 variant: không picker, không select, có hidden id', async ({ page }) => {
    await open(page, DATA.single, 'TE4_SINGLE_HANDLE');
    await expect(tid(page, T.picker)).toHaveCount(0);
    await expect(tid(page, T.variantSelect)).toHaveCount(0);
    await expect(tid(page, T.variantId)).toHaveCount(1);
  });

  test('AC11 TC-1151 nojs JSON-LD có sẵn trong HTML server', async ({ page }) => {
    await open(page, DATA.variants, 'TE4_VARIANTS_HANDLE');
    const ld = JSON.parse((await tid(page, T.structuredData).textContent()) ?? '') as LdProduct;
    expect(ld['@type']).toBe('Product');
    expect(ld.offers.length).toBeGreaterThan(0);
  });
});
