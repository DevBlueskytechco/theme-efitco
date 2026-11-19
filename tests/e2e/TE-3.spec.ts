// KHÔNG CHẮC: spec chưa chạy trên preview và chưa type-check (không có node_modules, PREVIEW_URL, STORE_PASSWORD trong phiên viết). Kết quả thật lấy từ CI e2e trên PR.
// Ticket ES1-T53 (2727475000000142027): TE-3-QA1, E2E featured collection + product card, docs/srs.md#TE-3 AC1–AC8 + quy tắc Hết hàng.
// Gộp và thay tests/e2e/ES1-T50.spec.ts, ES1-T51.spec.ts, ES1-T52.spec.ts. Test case: drafts/qa/ES1-T53/test-cases.md (tên test bắt đầu bằng ID TC).
// ES1-T74: mọi .js / products.json lấy bằng fetch trong trang (inPageJson), cùng market/tiền với card; market runner ghi vào annotation "market" + stdout. Xem drafts/qa/ES1-T74/test-cases.md.
// ES1-T441 (theo ES1-T337, docs/srs.md#TE-3 AC2, AC6, AC8, AC13): swatch card là chỉ báo <div aria-hidden> gồm <span data-selected>, không radio.
//   Viết lại: TC-10/11, TC-15, TC-16, TC-51, TC-52, TC-54, TC-55, TC-56, TC-70, TC-71, B-01, B-02. Thêm TC-18. Bỏ (hành vi đã gỡ, ES1-T338 xoá product-swatch.js):
//   TC-12, TC-13, TC-14, TC-17, TC-33, TC-72, B-03. Phần static, sold out, AC8 dòng biến thể ở tests/e2e/ES1-T441.spec.ts. Test case: drafts/qa/ES1-T441/test-cases.md.
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/TE-3.spec.ts
// Dữ liệu (không hardcode handle): TE3_SALE_HANDLE, TE3_SMALL_PRICE_HANDLE, TE3_VARIES_HANDLE, TE3_UNIT_PRICE_HANDLE,
//   TE3_SWATCH_HANDLE, T337_MANY_COLORS_HANDLE (ES1-T441, > 4 giá trị có swatch gốc), TE3_SOLD_OUT_HANDLE, TE3_AC8_VARIANT_ID, TE3_AC8_PATH.
//   Không đặt thì tự tìm card đầu tiên có testid, không có thì skip. (TE3_BADGE_SWATCH_HANDLE của TC-17 không còn dùng, ES1-T441.)
// Setting block khác mặc định: EXPECT_PRODUCTS_TO_SHOW, EXPECT_COLUMNS_DESKTOP, EXPECT_VIEW_ALL=header|bottom, EXPECT_VIEW_ALL_PATH.
import { test, expect, type Locator, type Page, type TestInfo } from './support/test';
import { getJson } from './support/http';
import { pageJson, requireJson } from './support/product-data';
import AxeBuilder from '@axe-core/playwright';
import { clickAndLoad, expectLoaded, expectNotChallenged } from './support/store-guard';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { watchShopPay403 } from './support/console-guard';
// ES1-T434: handle cố định đọc qua store-data (env → tests/e2e/store-data.json), xem drafts/qa/ES1-T434/test-cases.md.
import { env } from './support/store-data';

const T = {
  container: 'container-home-featured-collection',
  block: 'featured-collection',
  heading: 'featured-collection-heading',
  grid: 'featured-collection-grid',
  viewAll: 'featured-collection-view-all',
  placeholder: 'featured-collection-placeholder',
  collection: 'collection-products',
  card: 'product-card',
  image: 'product-card-image',
  title: 'product-card-title',
  sale: 'product-card-badge-sale',
  soldOut: 'product-card-badge-sold-out',
  swatches: 'product-card-swatches',
  swatch: 'product-card-swatch',
  more: 'product-card-swatch-more',
  noImage: 'product-card-placeholder-image',
  price: 'price',
  regular: 'price-regular',
  compare: 'price-compare',
  range: 'price-range',
  unit: 'price-unit',
} as const;

const HOME = '/';
const ALL = '/collections/all';
const PAGES = [HOME, ALL] as const;
const PAGE_SIZE = 20; // templates/collection.liquid paginate by 20
const MAX_PAGES = 5;
// ES1-T417 (CTO 11/11, ES1-T178 mục N): store dev 2065 sản phẩm, thứ tự mặc định theo tên đẩy sản phẩm TE4 ra vị trí > 2000,
// ngoài MAX_PAGES trang đầu → test skip từ 03/11. Mọi lần đọc /collections/all để tìm dữ liệu dùng sort_by=created-descending cố định.
const SORT = 'sort_by=created-descending';
const allPage = (n = 1) => (n === 1 ? `${ALL}?${SORT}` : `${ALL}?${SORT}&page=${n}`);
// ES1-T441: phần tử của bản radio cũ, hàng chỉ báo không được có.
const LEGACY = 'input, label, fieldset, legend, product-swatch, a, button, select, textarea, [tabindex], [href]';
const SELECTED = `[data-testid="${T.swatch}"][data-selected]`;
const TWO_SWATCHES = `[data-testid="${T.swatch}"] + [data-testid="${T.swatch}"]`;
const AC13_WIDTHS = [360, 768, 1280, 1920] as const;

const ENV = {
  sale: process.env.TE3_SALE_HANDLE,
  small: process.env.TE3_SMALL_PRICE_HANDLE,
  varies: process.env.TE3_VARIES_HANDLE,
  unit: process.env.TE3_UNIT_PRICE_HANDLE,
  swatch: env('TE3_SWATCH_HANDLE'), // ES1-T434: đọc cả store-data.json
  // ES1-T441: sản phẩm > 4 giá trị có swatch gốc (TE-3 AC13); thiếu thì tự dò card có "+N".
  manyColors: env('T337_MANY_COLORS_HANDLE', 'TE3_MANY_COLORS_HANDLE'),
  // ES1-T434: demo-many-variants (ES1-T298 D3: Weight × Pack × Color, 304 biến thể) không dùng khi tự dò card swatch.
  many: env('TE4_MANY_VARIANTS_HANDLE'),
  soldOut: process.env.TE3_SOLD_OUT_HANDLE,
  ac8Variant: process.env.TE3_AC8_VARIANT_ID,
  ac8Path: process.env.TE3_AC8_PATH || HOME,
};
const LIMIT = Number(process.env.EXPECT_PRODUCTS_TO_SHOW ?? 4);
const DESKTOP_COLUMNS = Number(process.env.EXPECT_COLUMNS_DESKTOP ?? 4);
const VIEW_ALL = process.env.EXPECT_VIEW_ALL ?? '';
const VIEW_ALL_PATH = process.env.EXPECT_VIEW_ALL_PATH || ALL;

// Giống smoke.spec.ts: lỗi console không thuộc theme.
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|shopifysvc\.com|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];

const ROOT = process.cwd();
const isMobile = (ti: TestInfo) => ti.project.name === 'mobile';
const seriousOrCritical = (v: { impact?: string | null }) => ['serious', 'critical'].includes(v.impact ?? '');

type JsVariant = {
  id: number;
  price: number;
  compare_at_price: number | null;
  available: boolean;
  options: string[];
  featured_image: { src: string; alt: string | null } | null;
  unit_price?: number | null;
};
type JsProduct = {
  id: number;
  handle: string;
  title: string;
  available: boolean;
  price_min: number;
  price_max: number;
  price_varies: boolean;
  options: Array<{ name: string; position: number; values: string[] }>;
  variants: JsVariant[];
};

// ---------- helpers ----------

// Tiền đọc trên trang → số theo đơn vị chính. Dấu phân cách cuối có đúng 3 chữ số sau thì là hàng nghìn (VND, "1,200"), ngược lại là thập phân.
function money(s: string | null): number {
  const m = (s ?? '').match(/\d[\d.,\s  ']*/);
  if (!m) return NaN;
  const t = m[0].replace(/[\s  ']/g, '').replace(/[.,]+$/, '');
  const last = Math.max(t.lastIndexOf('.'), t.lastIndexOf(','));
  if (last >= 0 && t.length - last - 1 !== 3) {
    return Number(`${t.slice(0, last).replace(/[.,]/g, '')}.${t.slice(last + 1)}`);
  }
  return Number(t.replace(/[.,]/g, ''));
}

// round-half-up của (compare − price) × 100 / compare, số nguyên (cents) → không sai số dấu phẩy động.
function salePercent(compareCents: number, priceCents: number): number {
  return Math.floor((2 * (compareCents - priceCents) * 100 + compareCents) / (2 * compareCents));
}
const badgeText = (pct: number) => (pct > 0 ? `-${pct}%` : 'Sale');
const toCents = (n: number) => Math.round(n * 100);
const norm = (s: string | null) => (s ?? '').replace(/\s+/g, ' ').trim();
const fileName = (url: string) => new URL(url, 'https://x.invalid').pathname.split('/').pop() ?? '';

function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
  const isShopPay403 = watchShopPay403(page);
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    if (isShopPay403(m)) return;
    const text = `${m.text()} @ ${m.location().url}`;
    if (!IGNORE_CONSOLE.some(r => r.test(text))) errors.push(text);
  });
  return errors;
}

function blockSchema(): { presets?: unknown; settings: Array<Record<string, unknown> & { id?: string; type: string }> } {
  const src = readFileSync(join(ROOT, 'blocks', 'featured-collection.liquid'), 'utf8');
  const m = src.match(/{%-?\s*schema\s*-?%}([\s\S]*?){%-?\s*endschema\s*-?%}/);
  expect(m, 'featured-collection.liquid không có schema').not.toBeNull();
  return JSON.parse(m![1]);
}

// ES1-T74: JSON so tiền lấy bằng fetch TRONG trang (cùng cookie localization/cart, IP, header với HTML card) → cùng market, cùng tiền với card.
// Không dùng page.request: CI PR #63 card hiện Tk (BDT) còn .js qua page.request trả giá market/tiền khác → TC-30 lệch 255900.
// Không ghim market US (POST /localization): phụ thuộc danh sách market của store dev và bỏ qua đúng case runner gặp.
type InPage<J> = { ok: boolean; status: number; body: J | null };
async function inPageJson<J>(page: Page, path: string): Promise<InPage<J>> {
  if (!/^https?:/.test(page.url())) await page.goto(ALL); // fetch tương đối cần origin store
  return pageJson<J>(page, path); // ES1-T100: thử lại 429 trong trang
}

type MoneyCtx = { country: string | null; active: string | null; rate: string | null; cart: string | null };
async function moneyContext(page: Page): Promise<MoneyCtx> {
  if (!/^https?:/.test(page.url())) await page.goto(ALL);
  return page.evaluate(async () => {
    const s = (window as unknown as { Shopify?: { country?: string; currency?: { active?: string; rate?: string } } }).Shopify ?? {};
    const cart = await fetch('/cart.js', { credentials: 'same-origin' }).then(r => (r.ok ? r.json() : null)).catch(() => null);
    return { country: s.country ?? null, active: s.currency?.active ?? null, rate: s.currency?.rate ?? null, cart: cart?.currency ?? null };
  });
}
const fmtCtx = (c: MoneyCtx) => `country=${c.country} Shopify.currency.active=${c.active} rate=${c.rate} cart.js currency=${c.cart}`;

// Ghi market/tiền runner nhận vào annotation (HTML report) + stdout 1 lần mỗi project; tiền trang khác tiền cart.js thì skip có lý do, không fail sai.
const checkedCtx = new WeakMap<Page, MoneyCtx>();
const loggedProjects = new Set<string>();
async function requireSameCurrency(page: Page): Promise<MoneyCtx> {
  const hit = checkedCtx.get(page);
  if (hit) return hit;
  const ctx = await moneyContext(page);
  const ti = test.info();
  ti.annotations.push({ type: 'market', description: fmtCtx(ctx) });
  if (!loggedProjects.has(ti.project.name)) {
    loggedProjects.add(ti.project.name);
    console.log(`[ES1-T74 market ${ti.project.name}] ${fmtCtx(ctx)}`);
  }
  test.skip(!!ctx.active && !!ctx.cart && ctx.active !== ctx.cart, `Tiền hiển thị (${ctx.active}) khác tiền cart.js (${ctx.cart}): .js không cùng đơn vị với card, không so được`);
  checkedCtx.set(page, ctx);
  return ctx;
}

async function storeProductCount(page: Page): Promise<number | null> {
  const r = await inPageJson<{ products?: unknown[] }>(page, '/products.json?limit=250');
  return r.body?.products ? r.body.products.length : null;
}

async function productJs(page: Page, handle: string): Promise<JsProduct> {
  await requireSameCurrency(page);
  return requireJson(await inPageJson<JsProduct>(page, `/products/${handle}.js`), `/products/${handle}.js (fetch trong trang)`);
}

async function handleOf(card: Locator): Promise<string> {
  const href = await card.getByTestId(T.title).getAttribute('href');
  const m = (href ?? '').match(/\/products\/([^/?#]+)/);
  expect(m, `href tiêu đề không có /products/<handle>: ${href}`).not.toBeNull();
  return decodeURIComponent(m![1]);
}

async function variantIdOf(card: Locator): Promise<number | null> {
  const href = await card.getByTestId(T.title).getAttribute('href');
  const m = (href ?? '').match(/[?&]variant=(\d+)/);
  return m ? Number(m[1]) : null;
}

// Mở / và trả lưới featured collection; store không có sản phẩm thì skip.
async function openHome(page: Page): Promise<Locator> {
  const res = await page.goto(HOME);
  expect(res?.status(), 'HTTP /').toBeLessThan(400);
  const block = page.getByTestId(T.block);
  if ((await block.count()) === 0) {
    const total = await storeProductCount(page);
    test.skip(total === 0, 'Store không có sản phẩm: block không render ở storefront (AC5)');
  }
  await expect(block, 'trang chủ có featured-collection (default_collection all)').toHaveCount(1);
  await expect(page.getByTestId(T.container).getByTestId(T.block)).toHaveCount(1);
  await block.scrollIntoViewIfNeeded();
  return block;
}

async function cardsOn(page: Page, path: string): Promise<Locator> {
  if (path === HOME) return (await openHome(page)).getByTestId(T.card);
  const res = await page.goto(path === ALL ? allPage() : path); // ES1-T417: trang đầu theo sort cố định
  expect(res?.status(), `HTTP ${path}`).toBeLessThan(400);
  const cards = page.getByTestId(T.collection).getByTestId(T.card);
  test.skip((await cards.count()) === 0, `${path} không có sản phẩm`);
  return cards;
}

function byHandle(page: Page, cards: Locator, handle: string): Locator {
  const sel = `a[data-testid="${T.title}"][href*="/products/${handle}?"], a[data-testid="${T.title}"][href$="/products/${handle}"]`;
  return cards.filter({ has: page.locator(sel) });
}

// Tìm card trên /collections/all (tối đa MAX_PAGES trang). handle có giá trị → tìm theo handle (testid kiểm sau, thiếu là fail thật);
// không có handle → card đầu tiên có testid. Trả null khi không có.
async function findCard(page: Page, testid: string | null, handle?: string, without?: string): Promise<Locator | null> {
  for (let n = 1; n <= MAX_PAGES; n++) {
    const res = await page.goto(allPage(n)); // ES1-T417: sort_by=created-descending
    if (!res || res.status() >= 400) return null;
    const cards = page.getByTestId(T.collection).getByTestId(T.card);
    const count = await cards.count();
    if (!count) return null;
    let found = handle ? byHandle(page, cards, handle) : cards;
    if (!handle && testid) found = found.filter({ has: page.getByTestId(testid) });
    if (!handle && without) found = found.filter({ hasNot: page.getByTestId(without) });
    if (await found.count()) {
      const card = found.first();
      await card.scrollIntoViewIfNeeded();
      return card;
    }
    if (count < PAGE_SIZE) return null;
  }
  return null;
}

async function requireCard(page: Page, testid: string | null, handle: string | undefined, what: string, without?: string): Promise<Locator> {
  const card = await findCard(page, testid, handle, without);
  test.skip(!card, handle ? `Không thấy sản phẩm ${handle} (${what}) trong ${MAX_PAGES} trang đầu ${ALL}` : `Không có ${what} trên ${ALL} (dữ liệu TE-9 AC4)`);
  if (handle && testid) await expect(card!.getByTestId(testid), `${handle} phải có ${testid} (${what})`).toHaveCount(1);
  return card!;
}

// Card có ≥ 2 chỉ báo swatch trên path (env TE3_SWATCH_HANDLE ưu tiên).
// ES1-T434: PR #191 TC-10 đỏ vì card swatch đầu tiên là demo-many-variants (mới nhất); khi tự dò bỏ sản phẩm này, lỗi riêng kiểm ở TC-10c.
function withoutMany(page: Page, cards: Locator): Locator {
  return ENV.many ? cards.filter({ hasNot: page.locator(`a[data-testid="${T.title}"][href*="/products/${ENV.many}"]`) }) : cards;
}

async function swatchCard(page: Page, path: string): Promise<Locator | null> {
  const two = page.locator(TWO_SWATCHES);
  if (path === ALL) {
    if (ENV.swatch) {
      const card = await findCard(page, null, ENV.swatch);
      if (!card || (await card.getByTestId(T.swatch).count()) < 2) return null;
      return card;
    }
    // findCard dừng ở trang có card swatch đầu tiên; lấy card swatch đầu trên trang đó, trừ TE4_MANY_VARIANTS_HANDLE (ES1-T434).
    if (!(await findCard(page, T.swatches))) return null;
    const card = withoutMany(page, page.getByTestId(T.collection).getByTestId(T.card)).filter({ has: two }).first();
    if (!(await card.count())) return null;
    await card.scrollIntoViewIfNeeded();
    return card;
  }
  const cards = await cardsOn(page, path);
  const card = (ENV.swatch ? byHandle(page, cards, ENV.swatch) : withoutMany(page, cards)).filter({ has: two }).first();
  if (!(await card.count())) return null;
  await card.scrollIntoViewIfNeeded();
  return card;
}

// Tên giá trị nằm trong span visually-hidden của từng chỉ báo.
async function swatchNames(card: Locator): Promise<string[]> {
  return (await card.getByTestId(T.swatch).allTextContents()).map(norm);
}

// Option của chỉ báo = option > 1 giá trị chứa đủ các tên đang hiện (snippet: option đầu mà mọi giá trị có swatch gốc).
function swatchOption(p: JsProduct, names: string[]) {
  const option = p.options.find(o => o.values.length > 1 && names.every(n => o.values.includes(n)));
  expect(option, `${p.handle}.js có option chứa ${names.join(', ')}`).toBeTruthy();
  return option!;
}

async function selectedName(card: Locator): Promise<string> {
  const sel = card.locator(SELECTED);
  await expect(sel, 'đúng 1 chỉ báo data-selected').toHaveCount(1);
  return norm(await sel.textContent());
}

// Màu đã tính của một biến CSS, để so với computed color của phần tử.
async function cssColor(page: Page, variable: string): Promise<string> {
  return page.evaluate((v) => {
    const probe = document.createElement('span');
    probe.style.color = `var(${v})`;
    document.body.append(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    return c;
  }, variable);
}

async function axeBad(page: Page, include: string) {
  await expectNotChallenged(page);
  const r = await new AxeBuilder({ page }).include(include).analyze();
  return r.violations.filter(seriousOrCritical).map(v => `${v.impact} ${v.id}: ${v.nodes.slice(0, 3).map(n => n.target.join(' ')).join(' | ')}`);
}

const scopeOf = (path: string) => (path === HOME ? `[data-testid="${T.block}"]` : `[data-testid="${T.collection}"]`);

// ---------- tests ----------

test.describe('ES1-T53 TE-3 featured collection + product card', () => {
  // AC1
  const viewports = [
    { width: 360, height: 800, columns: 2 },
    { width: 767, height: 1024, columns: 2 },
    { width: 768, height: 1024, columns: 3 },
    { width: 1279, height: 900, columns: 3 },
    { width: 1280, height: 900, columns: DESKTOP_COLUMNS },
  ];
  for (const vp of viewports) {
    test(`TC-01 TC-02 AC1: ${vp.width}px lưới ${vp.columns} cột, số card = min(${LIMIT}, số sản phẩm), không tràn ngang`, async ({ page }, ti) => {
      test.skip(isMobile(ti), 'Breakpoint đo ở project desktop; mobile xem TC-03');
      await page.setViewportSize({ width: vp.width, height: vp.height });
      const block = await openHome(page);
      const grid = block.getByTestId(T.grid);
      expect(await grid.evaluate(el => el.tagName)).toBe('UL');
      const cols = await grid.evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length);

      const items = grid.locator(':scope > li');
      const total = await storeProductCount(page);
      if (total !== null) await expect(items).toHaveCount(Math.min(LIMIT, total));
      const n = await items.count();
      expect(n).toBeGreaterThan(0);
      expect(n).toBeLessThanOrEqual(12);
      // ES1-T174: đúng 4 card thì 4 cột từ 48rem, không để 1 card lẻ; từ 80rem theo columns_desktop
      const wantCols = n === 4 && vp.width >= 768 && vp.width < 1280 ? 4 : vp.columns;
      expect(cols, `số cột ở ${vp.width}px với ${n} card`).toBe(wantCols);
      for (let i = 0; i < n; i++) await expect(items.nth(i).getByTestId(T.card)).toHaveCount(1);

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, 'không tràn ngang').toBeLessThanOrEqual(0);
    });
  }

  test('TC-03 AC1: Pixel 7 lưới 2 cột, không tràn ngang', async ({ page }, ti) => {
    test.skip(!isMobile(ti), 'Chỉ project mobile');
    const block = await openHome(page);
    const cols = await block.getByTestId(T.grid).evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length);
    expect(cols).toBe(2);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('TC-04 AC1: schema products_to_show 4–12 (4, D7), columns_desktop 3–5 (4), không presets', async ({}, ti) => {
    test.skip(isMobile(ti), 'static, chạy 1 lần ở desktop');
    const schema = blockSchema();
    expect(schema.presets, 'không presets (AGENTS.md)').toBeUndefined();
    const byId = Object.fromEntries(schema.settings.filter(s => s.id).map(s => [s.id!, s]));
    expect(byId.collection?.type).toBe('collection');
    expect(byId.products_to_show).toMatchObject({ type: 'range', min: 4, max: 12, step: 1, default: 4 });
    expect(byId.columns_desktop).toMatchObject({ type: 'range', min: 3, max: 5, default: 4 });
  });

  test('TC-05 AC1: heading H2 gắn aria-labelledby, tiêu đề card H3', async ({ page }) => {
    const block = await openHome(page);
    const heading = block.getByTestId(T.heading);
    test.skip((await heading.count()) === 0, 'Merchant đã xoá heading');
    expect(await heading.evaluate(el => el.tagName)).toBe('H2');
    const id = await heading.getAttribute('id');
    expect(id).toBeTruthy();
    await expect(block).toHaveAttribute('aria-labelledby', id!);
    const tag = await block.getByTestId(T.title).first().evaluate(el => el.parentElement?.tagName);
    expect(tag).toBe('H3');
  });

  test('TC-06 AC1: ảnh card trên / lazy, sizes theo số cột, có width/height', async ({ page }) => {
    const block = await openHome(page);
    const img = block.getByTestId(T.image).first();
    test.skip((await img.count()) === 0, 'Card đầu không có ảnh');
    await expect(img).toHaveAttribute('loading', 'lazy');
    await expect(img).toHaveAttribute('sizes', new RegExp(`calc\\(1416px / ${DESKTOP_COLUMNS}\\)`));
    await expect(img).toHaveAttribute('width', /^\d+$/);
    await expect(img).toHaveAttribute('height', /^\d+$/);
  });

  // AC2 (0.3, foundation §9) + AC13 (0.5, VP2). ES1-T441: thay bản radio trong fieldset/legend (trái AC2 0.3) bằng chỉ báo ES1-T337.
  for (const path of PAGES) {
    test(`TC-10 TC-11 AC2 AC13: swatch là chỉ báo aria-hidden, không control, ≤ 4 hoặc 3 + "+N", 1 data-selected, có màu/ảnh (${path})`, async ({ page }) => {
      const card = await swatchCard(page, path);
      test.skip(!card, `Không có card ≥ 2 swatch trên ${path}; đặt TE3_SWATCH_HANDLE`);
      const row = card!.getByTestId(T.swatches);
      expect(await row.evaluate(el => el.tagName), 'hàng chỉ báo là DIV, không FIELDSET').toBe('DIV');
      await expect(row).toHaveAttribute('aria-hidden', 'true');
      await expect(row.locator(LEGACY), 'không radio, label, legend, product-swatch, link, phần tử focus được').toHaveCount(0);
      expect(await row.evaluate(el => getComputedStyle(el).pointerEvents), 'không bấm được').toBe('none');
      await expect(card!.getByRole('radio'), 'card không có radio').toHaveCount(0);

      const swatches = row.getByTestId(T.swatch);
      const n = await swatches.count();
      if (await row.getByTestId(T.more).count()) {
        expect(n, 'có "+N" thì đúng 3 chỉ báo').toBe(3);
      } else {
        expect(n).toBeGreaterThanOrEqual(2);
        expect(n, 'không "+N" thì ≤ 4 chỉ báo').toBeLessThanOrEqual(4);
      }
      await expect(row.locator(SELECTED)).toHaveCount(1);
      for (let i = 0; i < n; i++) {
        await expect(swatches.nth(i), 'swatch.color hoặc swatch.image').toHaveAttribute('style', /--swatch-(color|image):/);
        expect(norm(await swatches.nth(i).textContent()).length, 'chỉ báo có tên value ẩn').toBeGreaterThan(0);
      }
      await expect(card!.locator('img[data-card-image], [data-testid="product-card-placeholder-image"]')).toHaveCount(1);
      await expect(card!.locator('[data-card-price]')).toHaveCount(1);
    });

    // ES1-T441: TC-12, TC-33 (bấm swatch đổi ảnh/giá) và TC-13 (Tab vào nhóm radio, ArrowRight) bỏ: AC2 0.3 swatch không bấm được,
    // ES1-T338 đã xoá product-swatch.js. Hành vi thay thế: TC-18 (bấm không làm gì), TC-51/TC-52 (Tab rời card, không dừng trong hàng chỉ báo).

    test(`TC-52 AC2 AC6: mọi hàng chỉ báo trên trang aria-hidden, 0 phần tử nhận focus, Tab không dừng trong hàng (${path})`, async ({ page }) => {
      const cards = await cardsOn(page, path);
      const rows = cards.getByTestId(T.swatches);
      const n = await rows.count();
      test.skip(n === 0, `Không có card có swatch trên ${path}`);
      for (let i = 0; i < n; i++) await expect(rows.nth(i)).toHaveAttribute('aria-hidden', 'true');
      const focusable = await page.evaluate(() =>
        [...document.querySelectorAll('[data-testid="product-card-swatches"] *')].filter(el => (el as HTMLElement).tabIndex >= 0).length);
      expect(focusable, 'phần tử tabIndex ≥ 0 trong hàng chỉ báo').toBe(0);

      // Tab qua tối đa 3 card có swatch: không lần nào focus nằm trong hàng chỉ báo.
      const withRow = cards.filter({ has: page.getByTestId(T.swatches) });
      const steps = Math.min(await withRow.count(), 3) * 3;
      await withRow.first().getByTestId(T.title).focus();
      for (let i = 0; i < steps; i++) {
        await page.keyboard.press('Tab');
        const inRow = await page.evaluate(() => !!document.activeElement?.closest('[data-testid="product-card-swatches"]'));
        expect(inRow, `Tab lần ${i + 1} vào hàng chỉ báo`).toBe(false);
      }
    });

    // ES1-T441: chỉ chạy axe 1 lần, không còn trạng thái "sau đổi swatch".
    test(`TC-55 AC6: axe 0 serious/critical trong vùng TE-3 (${path})`, async ({ page }) => {
      const cards = await cardsOn(page, path);
      await expect(cards.first()).toBeVisible();
      const rows = await cards.getByTestId(T.swatches).count();
      test.info().annotations.push({ type: 'TC-55', description: `${rows} hàng chỉ báo swatch trong vùng ${path}` });
      expect(await axeBad(page, scopeOf(path))).toEqual([]);
    });

    test(`B-05 B-07 AC2: 0 console error khi tải, không id trùng (${path})`, async ({ page }) => {
      const errors = trackErrors(page);
      await cardsOn(page, path);
      await page.waitForLoadState('load');
      const dup = await page.evaluate(() => {
        const ids = [...document.querySelectorAll('[id]')].map(e => e.id);
        return [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
      });
      expect(dup, 'id trùng').toEqual([]);
      expect(errors, errors.join('\n')).toEqual([]);
    });
  }

  // ES1-T441: TC-14 (gỡ/gắn lại card rồi đổi swatch) bỏ: không còn JS trên card.

  // ES1-T441: thay cho TC-12. AC2 0.3: swatch "không bấm được"; điểm giữa chỉ báo không trúng control nào, bấm/chạm không đổi gì.
  test('TC-18 AC2: bấm hoặc chạm chỉ báo swatch chưa chọn không mở trang, không đổi chọn, link, ảnh; 0 lỗi', async ({ page }, ti) => {
    const errors = trackErrors(page);
    const card = await swatchCard(page, ALL);
    test.skip(!card, `Không có card ≥ 2 swatch trên ${ALL}; đặt TE3_SWATCH_HANDLE`);
    const title = card!.getByTestId(T.title);
    const before = {
      url: page.url(),
      href: await title.getAttribute('href'),
      selected: await selectedName(card!),
      src: (await card!.getByTestId(T.image).count()) ? await card!.getByTestId(T.image).getAttribute('src') : null,
    };
    const target = card!.locator(`[data-testid="${T.swatch}"]:not([data-selected])`).first();
    const box = await target.boundingBox();
    expect(box, 'chỉ báo chưa chọn có kích thước').not.toBeNull();
    const x = box!.x + box!.width / 2;
    const y = box!.y + box!.height / 2;
    const hit = await page.evaluate(([px, py]) => {
      const el = document.elementFromPoint(px, py);
      return el?.closest('a, button, input, label, select, [tabindex], [role="radio"]')?.outerHTML.slice(0, 120) ?? null;
    }, [x, y]);
    expect(hit, 'điểm giữa chỉ báo không trúng control').toBeNull();

    if (isMobile(ti)) await page.touchscreen.tap(x, y);
    else await page.mouse.click(x, y);
    await page.waitForLoadState('domcontentloaded');
    expect(page.url(), 'URL giữ nguyên').toBe(before.url);
    await expect(title).toHaveAttribute('href', before.href!);
    expect(await selectedName(card!), 'chỉ báo đang chọn không đổi').toBe(before.selected);
    if (before.src) await expect(card!.getByTestId(T.image)).toHaveAttribute('src', before.src);
    expect(errors, errors.join('\n')).toEqual([]);
  });

  // ES1-T441 (thay bản radio, ES1-T73): Back từ trang sản phẩm, card render lại đúng như lúc tải (không có trạng thái khách đổi).
  test('TC-15 AC2 AC8: Back từ trang sản phẩm, link card và chỉ báo đang chọn giữ như lúc tải', async ({ page }) => {
    const card = await swatchCard(page, ALL);
    test.skip(!card, `Không có card ≥ 2 swatch trên ${ALL}; đặt TE3_SWATCH_HANDLE`);
    const productId = await card!.getAttribute('data-product-id');
    const href = await card!.getByTestId(T.title).getAttribute('href');
    const selected = await selectedName(card!);
    // ES1-T229: điều hướng qua store-guard, bị Cloudflare chặn thì fail nêu rõ, không thành "không khớp".
    await clickAndLoad(page, () => card!.getByTestId(T.title).click());
    await page.waitForURL(/\/products\//);
    await expectLoaded(page, await page.goBack());
    const again = page.getByTestId(T.collection).locator(`[data-testid="${T.card}"][data-product-id="${productId}"]`).first();
    await expect(again).toBeVisible();
    await expect(again.getByTestId(T.title), 'href tiêu đề như lúc tải').toHaveAttribute('href', href!);
    expect(await selectedName(again), 'chỉ báo đang chọn như lúc tải').toBe(selected);
    await expect(again.getByTestId(T.swatches)).toHaveAttribute('aria-hidden', 'true');
  });

  // ES1-T441: TC-17 (đổi swatch thì badge đổi theo variant, ES1-T57) bỏ: không còn đổi swatch trên card. Badge theo variant card kiểm ở TC-20–TC-25, TC-80.

  // ES1-T441 (ticket: TC-16 còn kỳ vọng 5 swatch + legend + "+N" là link tabindex -1). docs/srs.md#TE-3 AC13 (0.5, VP2, variant-picker.md §9):
  // N > 4 thì 3 chỉ báo + "+{N − 3}" 14px --color-muted, tên link ghi tổng N, hàng không tràn card 152 ở 360; kiểm ở 360/768/1280/1920.
  // "+N" là span trong hàng aria-hidden, không phải link. Dữ liệu: T337_MANY_COLORS_HANDLE (sản phẩm > 4 giá trị có swatch gốc), thiếu thì tự dò.
  for (const width of AC13_WIDTHS) {
    test(`TC-16 AC2 AC13: ${width}px hơn 4 màu thì 3 chỉ báo + "+N" (span), không tràn card, link ghi tổng N màu`, async ({ page }, ti) => {
      test.skip(isMobile(ti), 'Đổi viewport ở project desktop');
      await page.setViewportSize({ width, height: 900 });
      const card = await requireCard(page, T.more, ENV.manyColors, 'sản phẩm > 4 giá trị có swatch gốc (T337_MANY_COLORS_HANDLE)');
      const handle = await handleOf(card);
      const p = await productJs(page, handle);
      const row = card.getByTestId(T.swatches);
      const swatches = row.getByTestId(T.swatch);
      await expect(swatches).toHaveCount(3);
      const option = swatchOption(p, await swatchNames(card));
      const total = option.values.length;
      expect(total, `${handle}: option ${option.name} > 4 giá trị`).toBeGreaterThan(4);

      await expect(row).toHaveAttribute('aria-hidden', 'true');
      await expect(row.locator(LEGACY), 'hàng chỉ báo không có control').toHaveCount(0);
      const more = row.getByTestId(T.more);
      await expect(more).toHaveText(`+${total - 3}`);
      expect(await more.evaluate(el => el.tagName), '"+N" là SPAN, không phải link').toBe('SPAN');
      const style = await more.evaluate(el => ({ size: getComputedStyle(el).fontSize, color: getComputedStyle(el).color }));
      expect(style.size, '"+N" 14px').toBe('14px');
      expect(style.color, '"+N" màu --color-muted').toBe(await cssColor(page, '--color-muted'));
      await expect(card.getByTestId(T.title)).toHaveAccessibleName(new RegExp(`, ${total} colors$`));
      await expect(row.locator(SELECTED), 'chỉ báo variant card luôn hiện (AC8)').toHaveCount(1);

      // 3 chỉ báo và "+N" cùng một hàng, không vượt mép phải card.
      const geo = await row.evaluate((el) => {
        const card = el.closest('[data-testid="product-card"]')!.getBoundingClientRect();
        const items = [...el.querySelectorAll('[data-testid="product-card-swatch"], [data-testid="product-card-swatch-more"]')].map(n => n.getBoundingClientRect());
        return {
          spread: Math.max(...items.map(r => r.top + r.height / 2)) - Math.min(...items.map(r => r.top + r.height / 2)),
          overRight: Math.max(...items.map(r => r.right)) - card.right,
          overRow: el.scrollWidth - el.clientWidth,
          cardWidth: card.width,
        };
      });
      expect(geo.spread, 'chỉ báo và +N cùng hàng').toBeLessThanOrEqual(2);
      expect(geo.overRight, 'không vượt mép phải card').toBeLessThanOrEqual(0.5);
      expect(geo.overRow, 'hàng không tràn ngang').toBeLessThanOrEqual(0);
      test.info().annotations.push({ type: 'TC-16', description: `${width}px card rộng ${Math.round(geo.cardWidth)}px (${handle})` });
    });
  }

  // ES1-T434 (bug ES1-T434-B01): docs/srs.md#TE-3 AC2 "swatch lấy từ option value của option màu".
  // demo-many-variants: Weight (40 giá trị) × Pack × Color (Black, Gray, Red, Blue), metafield custom.swatch_colors 4 màu, không swatch gốc.
  // product-card.liquid:131-141 lấy option đầu có > 1 giá trị khi có metafield → swatch là Weight → test ĐỎ CÓ CHỦ ĐÍCH tới khi
  // ES1-T404 (TS-FE6) bỏ custom.swatch_colors: Color không có swatch gốc thì card không có swatch → đạt. Không tự dò, URL sort riêng của test này.
  test('TC-10c AC2: swatch card chỉ lấy giá trị của option màu, không lấy option đầu (TE4_MANY_VARIANTS_HANDLE)', async ({ page }) => {
    test.skip(!ENV.many, 'Thiếu TE4_MANY_VARIANTS_HANDLE (store-data.json)');
    let card: Locator | null = null;
    for (let n = 1; n <= 2 && !card; n++) {
      const res = await page.goto(`${ALL}?sort_by=created-descending${n > 1 ? `&page=${n}` : ''}`);
      expect(res?.status(), `HTTP ${ALL}`).toBeLessThan(400);
      const found = byHandle(page, page.getByTestId(T.collection).getByTestId(T.card), ENV.many!);
      if (await found.count()) card = found.first();
    }
    test.skip(!card, `Không thấy ${ENV.many} trong 2 trang đầu ${ALL}?sort_by=created-descending`);
    const p = await productJs(page, ENV.many!);
    const color = p.options.find(o => /colou?r/i.test(o.name));
    expect(color, `dữ liệu store: ${ENV.many}.js không có option Color (ES1-T298 D3)`).toBeTruthy();
    const names = await card!.getByTestId(T.swatch).evaluateAll(els => els.map(el => (el.textContent ?? '').replace(/\s+/g, ' ').trim()));
    const wrong = names.filter(name => !color!.values.includes(name));
    expect(wrong, `swatch card ${ENV.many} lấy giá trị ngoài option ${color!.name} (${color!.values.join(', ')}): product-card.liquid:134-141`).toEqual([]);
  });

  // AC3
  for (const path of PAGES) {
    test(`TC-20 AC3: card sale có giá gạch thẻ S và badge % làm tròn từ giá trên trang (${path})`, async ({ page }) => {
      let card: Locator | null;
      if (path === ALL) {
        // Card sale giá cố định; sale + khoảng giá (AC3 x AC4) kiểm ở TC-25 chờ ES1-T56.
        card = await findCard(page, ENV.sale ? null : T.sale, ENV.sale, T.range);
      } else {
        const cards = await cardsOn(page, HOME);
        const c = (ENV.sale ? byHandle(page, cards, ENV.sale) : cards.filter({ has: page.getByTestId(T.sale) }).filter({ hasNot: page.getByTestId(T.range) })).first();
        card = (await c.count()) ? c : null;
      }
      test.skip(!card, `Không có sản phẩm sale trên ${path}`);
      await expect(card!.getByTestId(T.sale)).toHaveCount(1);
      const price = money(await card!.getByTestId(T.regular).textContent());
      const compare = money(await card!.getByTestId(T.compare).textContent());
      expect(compare).toBeGreaterThan(price);
      expect(await card!.getByTestId(T.compare).evaluate(el => el.tagName)).toBe('S');
      const pct = salePercent(toCents(compare), toCents(price));
      await expect(card!.getByTestId(T.sale)).toHaveText(badgeText(pct));
    });
  }

  test('TC-21 AC3: mọi card sale trang đầu khớp % tính bằng cents từ /products/<handle>.js', async ({ page }) => {
    const cards = await cardsOn(page, ALL);
    const sale = cards.filter({ has: page.getByTestId(T.sale) }).filter({ hasNot: page.getByTestId(T.range) });
    const n = Math.min(await sale.count(), 12);
    test.skip(n === 0, `Không có card sale trên trang đầu ${ALL}`);
    for (let i = 0; i < n; i++) {
      const card = sale.nth(i);
      const handle = await handleOf(card);
      const p = await productJs(page, handle);
      const vid = await variantIdOf(card);
      const v = p.variants.find(x => x.id === vid) ?? p.variants.find(x => x.available) ?? p.variants[0];
      expect(v.compare_at_price ?? 0, `${handle}: compare_at > price`).toBeGreaterThan(v.price);
      await expect(card.getByTestId(T.sale), handle).toHaveText(badgeText(salePercent(v.compare_at_price!, v.price)));
      expect(toCents(money(await card.getByTestId(T.regular).textContent())), `${handle}: giá bán`).toBe(v.price);
      expect(toCents(money(await card.getByTestId(T.compare).textContent())), `${handle}: giá gạch`).toBe(v.compare_at_price);
    }
  });

  test('TC-22 AC3: sale giá nhỏ (compare_at dưới 1000 cents) tính % đúng', async ({ page }) => {
    let handle = ENV.small;
    if (!handle) {
      // Chỉ để chọn ứng viên; phép so % dùng .js trong trang (cùng tiền với card), ứng viên lệch tiền cũng không fail sai.
      const r = await inPageJson<{ products?: Array<{ handle: string; variants: Array<{ price: string; compare_at_price: string | null; available: boolean }> }> }>(page, '/products.json?limit=250');
      const data = r.body;
      const hit = (data?.products ?? []).find(p => {
        const v = p.variants.find(x => x.available) ?? p.variants[0];
        const c = Number(v?.compare_at_price ?? 0);
        return v && c > Number(v.price) && toCents(c) < 1000;
      });
      handle = hit?.handle;
    }
    test.skip(!handle, 'Store không có sản phẩm sale giá nhỏ (compare_at dưới 1000 cents)');
    const card = await requireCard(page, T.sale, handle, 'sale giá nhỏ');
    const p = await productJs(page, handle!);
    const vid = await variantIdOf(card);
    const v = p.variants.find(x => x.id === vid)!;
    expect(v, `variant ${vid}`).toBeTruthy();
    await expect(card.getByTestId(T.sale)).toHaveText(badgeText(salePercent(v.compare_at_price!, v.price)));
  });

  test('TC-23 AC3: card còn hàng không sale thì không badge, không giá gạch', async ({ page }) => {
    const cards = await cardsOn(page, ALL);
    const plain = cards
      .filter({ hasNot: page.getByTestId(T.sale) })
      .filter({ hasNot: page.getByTestId(T.soldOut) })
      .filter({ hasNot: page.getByTestId(T.range) })
      .first();
    test.skip((await plain.count()) === 0, 'Mọi card trang đầu đều sale, hết hàng hoặc giá thay đổi');
    await expect(plain.getByTestId(T.compare)).toHaveCount(0);
    await expect(plain.getByTestId(T.regular)).toHaveCount(1);
  });

  test('TC-24 AC3: giá sale có nhãn ẩn cho screen reader', async ({ page }) => {
    const card = await requireCard(page, T.sale, ENV.sale, 'sản phẩm sale giá cố định', T.range);
    const text = norm(await card.getByTestId(T.price).textContent());
    expect(text).toContain('Sale price');
    expect(text).toContain('Regular price');
    expect(norm(await card.getByTestId(T.regular).textContent())).not.toMatch(/price/i);
    expect(norm(await card.getByTestId(T.compare).textContent())).not.toMatch(/price/i);
  });

  // AC3 x AC4: giá thay đổi + variant card đang sale. CTO 3/11: hiện khoảng giá kèm nhãn ẩn 'Sale price' và giá gạch compare_at_price của variant card (ES1-T56).
  test('TC-25 AC3 AC4: card sale có khoảng giá vẫn có giá gạch và nhãn Sale price', async ({ page }) => {
    const cards = await cardsOn(page, ALL);
    const card = cards.filter({ has: page.getByTestId(T.range) }).filter({ has: page.getByTestId(T.sale) }).first();
    test.skip((await card.count()) === 0, `Không có sản phẩm sale có khoảng giá trên trang đầu ${ALL}`);
    await expect(card.getByTestId(T.compare)).toHaveCount(1);
    expect(await card.getByTestId(T.compare).evaluate(el => el.tagName)).toBe('S');
    expect(await card.getByTestId(T.price).getAttribute('class')).toContain('price--on-sale');
    expect(norm(await card.getByTestId(T.price).textContent())).toContain('Sale price');
    const p = await productJs(page, await handleOf(card));
    const vid = await variantIdOf(card);
    const v = p.variants.find(x => x.id === vid) ?? p.variants.find(x => x.available) ?? p.variants[0];
    expect(toCents(money(await card.getByTestId(T.compare).textContent())), 'giá gạch = compare_at_price variant card').toBe(v.compare_at_price);
  });

  // Hết hàng (SRS mục 3)
  test('TC-80 AC3: hết hàng vẫn có card, badge Sold out, không badge sale', async ({ page }) => {
    const card = await requireCard(page, T.soldOut, ENV.soldOut, 'sản phẩm hết hàng');
    await expect(card.getByTestId(T.soldOut)).toHaveText('Sold out');
    await expect(card.getByTestId(T.sale)).toHaveCount(0);
    const p = await productJs(page, await handleOf(card));
    expect(p.available).toBe(false);
  });

  test('TC-81 AC1: sản phẩm hết hàng trong các sản phẩm đầu vẫn có trên trang chủ', async ({ page }) => {
    const cards = await cardsOn(page, HOME);
    const sold = ENV.soldOut ? byHandle(page, cards, ENV.soldOut) : cards.filter({ has: page.getByTestId(T.soldOut) });
    test.skip((await sold.count()) === 0, 'Không có sản phẩm hết hàng trong lưới trang chủ');
    await expect(sold.first().getByTestId(T.soldOut)).toHaveText('Sold out');
  });

  // AC4
  test('TC-30 AC4: price_varies hiện khoảng min – max khớp .js', async ({ page }) => {
    const card = await requireCard(page, T.range, ENV.varies, 'sản phẩm giá thay đổi theo biến thể');
    const text = norm(await card.getByTestId(T.range).textContent());
    const parts = text.split(' – ');
    expect(parts, `dạng "min – max": ${text}`).toHaveLength(2);
    const [min, max] = parts.map(money);
    expect(max).toBeGreaterThan(min);
    const p = await productJs(page, await handleOf(card));
    expect(p.price_varies).toBe(true);
    expect(Math.abs(toCents(min) - p.price_min)).toBeLessThanOrEqual(1);
    expect(Math.abs(toCents(max) - p.price_max)).toBeLessThanOrEqual(1);
  });

  // ES1-T74: chốt nguồn so tiền. Card, Shopify.currency và cart.js cùng tiền; ghi lại page.request có lệch không (chỉ chẩn đoán, không assert).
  test('TC-34 AC3 AC4: card và .js trong trang cùng market, cùng tiền', async ({ page }) => {
    const cards = await cardsOn(page, ALL);
    const ctx = await moneyContext(page);
    test.info().annotations.push({ type: 'market', description: fmtCtx(ctx) });
    expect(ctx.active, 'window.Shopify.currency.active có giá trị').toMatch(/^[A-Z]{3}$/);
    expect(ctx.cart, 'cart.js currency = tiền đang hiển thị').toBe(ctx.active);
    const card = cards.first();
    const handle = await handleOf(card);
    const inPage = await productJs(page, handle);
    const vid = await variantIdOf(card);
    const v = inPage.variants.find(x => x.id === vid) ?? inPage.variants.find(x => x.available) ?? inPage.variants[0];
    const shown = (await card.getByTestId(T.range).count())
      ? money(norm(await card.getByTestId(T.range).textContent()).split(' – ')[0])
      : money(await card.getByTestId(T.regular).textContent());
    const want = (await card.getByTestId(T.range).count()) ? inPage.price_min : v.price;
    expect(Math.abs(toCents(shown) - want), `${handle}: giá card = .js trong trang (${ctx.active})`).toBeLessThanOrEqual(1);

    // Chủ đích gọi qua APIRequestContext để so với in-page; 1 lần, không thử lại, lỗi/429 chỉ ghi 'lỗi'.
    const viaRequest = await getJson<JsProduct>(page.request, `/products/${handle}.js`, 1).then(r => r.body).catch(() => null);
    test.info().annotations.push({
      type: 'page.request .js',
      description: `${handle}: in-page price_min=${inPage.price_min}, page.request price_min=${viaRequest?.price_min ?? 'lỗi'}${viaRequest && viaRequest.price_min !== inPage.price_min ? ' (LỆCH: nguyên nhân TC-30 cũ)' : ''}`,
    });
  });

  test('TC-31 AC4: unit price hiện "giá/đơn vị" và có nhãn ẩn', async ({ page }) => {
    const card = await requireCard(page, T.unit, ENV.unit, 'sản phẩm có unit price');
    await expect(card.getByTestId(T.unit)).toHaveText(/\d.*\/\s*\d*\s*\S+/);
    expect(norm(await card.getByTestId(T.price).textContent())).toContain('Unit price');
    const p = await productJs(page, await handleOf(card));
    const vid = await variantIdOf(card);
    const v = p.variants.find(x => x.id === vid) ?? p.variants[0];
    expect(v.unit_price ?? null, 'variant có unit_price trong .js').not.toBeNull();
  });

  test('TC-32 AC4: giá không đổi theo biến thể thì không có khoảng giá', async ({ page }) => {
    const cards = await cardsOn(page, ALL);
    const fixed = cards.filter({ hasNot: page.getByTestId(T.range) }).first();
    test.skip((await fixed.count()) === 0, 'Mọi card trang đầu đều price_varies');
    await expect(fixed.getByTestId(T.regular)).toHaveCount(1);
    const p = await productJs(page, await handleOf(fixed));
    expect(p.price_varies).toBe(false);
  });

  // AC5
  test('TC-40 AC5: storefront không có placeholder, block có thì có card', async ({ page }) => {
    await page.goto(HOME);
    await expect(page.getByTestId(T.placeholder)).toHaveCount(0);
    const block = page.getByTestId(T.block);
    if (await block.count()) {
      expect(await block.getByTestId(T.card).count()).toBeGreaterThan(0);
    }
  });

  test('TC-41 AC5: Liquid chỉ render placeholder trong design_mode', async ({}, ti) => {
    test.skip(isMobile(ti), 'static, chạy 1 lần ở desktop');
    const src = readFileSync(join(ROOT, 'blocks', 'featured-collection.liquid'), 'utf8');
    expect(src).toMatch(/if\s+has_products\s+or\s+request\.design_mode/);
    expect(src).toMatch(/data-testid="featured-collection-placeholder"/);
    expect(src).toMatch(/'blocks\.featured_collection\.placeholder'\s*\|\s*t/);
  });

  // AC6
  for (const path of PAGES) {
    test(`TC-50 TC-53 AC6: link trùng ra khỏi tab order, ảnh có alt (${path})`, async ({ page }) => {
      const cards = await cardsOn(page, path);
      const hidden = await cards.locator('a[aria-hidden="true"]').evaluateAll(els => els.map(e => e.getAttribute('tabindex')));
      for (const t of hidden) expect(t, 'link aria-hidden có tabindex -1').toBe('-1');
      const n = await cards.count();
      for (let i = 0; i < n; i++) {
        await expect(cards.nth(i).locator('a:not([tabindex="-1"])'), 'mỗi card 1 link focus được').toHaveCount(1);
      }
      const alts = await cards.getByTestId(T.image).evaluateAll(els => els.map(e => e.getAttribute('alt') ?? ''));
      for (const alt of alts) expect(alt.trim().length, 'alt khác rỗng').toBeGreaterThan(0);

      const first = cards.filter({ has: page.getByTestId(T.image) }).first();
      if (await first.count()) {
        const p = await productJs(page, await handleOf(first));
        const vid = await variantIdOf(first);
        const v = p.variants.find(x => x.id === vid);
        // Card: ảnh variant, không có thì ảnh đại diện sản phẩm; alt = alt của ảnh đó, trống mới dùng tên sản phẩm.
        const want = v?.featured_image?.alt || (v?.featured_image ? '' : (p as any).media?.[0]?.alt) || p.title;
        await expect(first.getByTestId(T.image)).toHaveAttribute('alt', want);
      }
    });
  }

  // ES1-T441 (ticket: TC-51 còn kỳ vọng Tab sau tiêu đề vào nhóm swatch). docs/srs.md#TE-3 AC6 0.3: swatch không nhận focus → Tab rời card.
  // AC9: nếu card có nút Quick View thì đó là tab stop duy nhất được phép sau tiêu đề trong card (button), sau đó rời card.
  test('TC-51 AC6: Tab tới tiêu đề có focus thấy được, Tab tiếp không vào hàng swatch và rời card', async ({ page }) => {
    const cards = await cardsOn(page, HOME);
    const card = cards.filter({ has: page.getByTestId(T.swatches) }).first();
    const target = (await card.count()) ? card : cards.first();
    test.info().annotations.push({ type: 'TC-51', description: (await card.count()) ? 'card có swatch' : 'trang chủ không có card swatch: đo card đầu' });
    const title = target.getByTestId(T.title);
    await title.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await expect(title).toBeFocused();
    const ring = await title.evaluate(el => {
      const s = getComputedStyle(el);
      return { style: s.outlineStyle, width: parseFloat(s.outlineWidth) };
    });
    expect(ring.style).not.toBe('none');
    expect(ring.width).toBeGreaterThanOrEqual(2);

    const productId = await target.getAttribute('data-product-id');
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Tab');
      const where = await page.evaluate(() => {
        const a = document.activeElement;
        return {
          inRow: !!a?.closest('[data-testid="product-card-swatches"]'),
          card: a?.closest('[data-testid="product-card"]')?.getAttribute('data-product-id') ?? null,
          tag: a?.tagName ?? '',
        };
      });
      expect(where.inRow, 'Tab sau tiêu đề không vào hàng swatch').toBe(false);
      if (where.card !== productId) return; // đã rời card
      expect(where.tag, 'tab stop trong card sau tiêu đề chỉ có thể là nút Quick View (AC9)').toBe('BUTTON');
    }
    throw new Error('Tab 3 lần vẫn chưa rời card');
  });

  // ES1-T441: TC-52 cũ (radio focus-visible có viền) bỏ; TC-52 mới ở vòng PAGES phía trên.

  // ES1-T441: docs/srs.md#TE-3 AC6 0.3: swatch giữ 32 × 16 cách 4, không phải control nên không có yêu cầu vùng chạm (bỏ vùng bấm 44px D7).
  for (const width of AC13_WIDTHS) {
    test(`TC-54 AC6: ${width}px chỉ báo swatch 32 × 16 cách 4, không đo vùng chạm (${ALL})`, async ({ page }, ti) => {
      test.skip(isMobile(ti), 'Đổi viewport ở project desktop');
      await page.setViewportSize({ width, height: 900 });
      const card = await swatchCard(page, ALL);
      test.skip(!card, `Không có card ≥ 2 swatch trên ${ALL}; đặt TE3_SWATCH_HANDLE`);
      for (const sw of await card!.getByTestId(T.swatch).all()) {
        const s = await sw.evaluate(el => {
          const r = el.getBoundingClientRect();
          const pill = getComputedStyle(el, '::before');
          return { w: r.width, h: r.height, pw: parseFloat(pill.width), ph: parseFloat(pill.height) };
        });
        expect(Math.round(s.w), 'chỉ báo rộng 32').toBe(32);
        expect(Math.round(s.h), 'chỉ báo cao 16').toBe(16);
        expect(Math.round(s.pw), 'hình pill rộng 32').toBe(32);
        expect(Math.round(s.ph), 'hình pill cao 16').toBe(16);
      }
      expect(await card!.getByTestId(T.swatches).evaluate(el => getComputedStyle(el).columnGap), 'cách 4').toBe('4px');
    });
  }

  for (const path of PAGES) {
    test(`TC-54 AC6: tiêu đề ≥ 24px hoặc đủ khoảng cách, nút Xem tất cả ≥ 24px (${path})`, async ({ page }) => {
      await cardsOn(page, path);
      const view = page.getByTestId(T.viewAll);
      if (await view.count()) expect((await view.boundingBox())!.height).toBeGreaterThanOrEqual(24);

      const failing = await page.evaluate((scope) => {
        const root = document.querySelector(scope);
        if (!root) return ['không có vùng'];
        // ES1-T441: chỉ báo swatch không phải target (AC6 0.3), chỉ so giữa các link tiêu đề.
        const targets = [...root.querySelectorAll('[data-testid="product-card-title"]')]
          .map(el => ({ el, r: el.getBoundingClientRect() }))
          .filter(t => t.r.width > 0 && t.r.height > 0);
        const small = (r: DOMRect) => r.width < 24 || r.height < 24;
        const center = (r: DOMRect) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
        const distToRect = (p: { x: number; y: number }, r: DOMRect) =>
          Math.hypot(Math.max(r.left - p.x, 0, p.x - r.right), Math.max(r.top - p.y, 0, p.y - r.bottom));
        const bad: string[] = [];
        for (const t of targets) {
          if (t.el.getAttribute('data-testid') !== 'product-card-title' || !small(t.r)) continue;
          const c = center(t.r);
          for (const o of targets) {
            if (o === t) continue;
            const ok = small(o.r) ? Math.hypot(c.x - center(o.r).x, c.y - center(o.r).y) >= 24 : distToRect(c, o.r) >= 12;
            if (!ok) { bad.push(`${t.el.textContent?.trim()} (${Math.round(t.r.width)}×${Math.round(t.r.height)})`); break; }
          }
        }
        return bad;
      }, scopeOf(path));
      expect(failing, 'tiêu đề dưới 24px và chạm vùng 24px của target khác (WCAG 2.5.8)').toEqual([]);
    });
  }

  // ES1-T441: docs/srs.md#TE-3 AC2 0.3 (tên link có thêm số màu), AC6. Không còn group/legend/radio.
  test('TC-56 AC2 AC6: tên truy cập: 1 link, tên = tiêu đề + ", N colors"; không group, không radio trong card', async ({ page }) => {
    const card = await swatchCard(page, ALL);
    test.skip(!card, `Không có card ≥ 2 swatch trên ${ALL}; đặt TE3_SWATCH_HANDLE`);
    const p = await productJs(page, await handleOf(card!));
    const total = swatchOption(p, await swatchNames(card!)).values.length;
    const links = card!.getByRole('link');
    await expect(links, 'link ảnh aria-hidden, chỉ còn link tiêu đề').toHaveCount(1);
    await expect(links.first()).toHaveAccessibleName(`${p.title}, ${total} colors`);
    await expect(card!.getByRole('group')).toHaveCount(0);
    await expect(card!.getByRole('radio')).toHaveCount(0);
    await expect(card!.getByRole('radiogroup')).toHaveCount(0);
  });

  // AC7
  test('TC-60 TC-61 AC7: nút Xem tất cả theo setting (mặc định không có)', async ({ page }) => {
    const block = await openHome(page);
    const button = block.getByTestId(T.viewAll);
    if (!VIEW_ALL) {
      await expect(button, 'show_view_all mặc định false').toHaveCount(0);
      return;
    }
    await expect(button).toHaveCount(1);
    await expect(button).toHaveAccessibleName(/^View all products in \S/);
    expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(24);
    const pos = await button.evaluate(el => {
      const grid = el.closest('[data-testid="featured-collection"]')!.querySelector('[data-testid="featured-collection-grid"]')!;
      return el.compareDocumentPosition(grid) & Node.DOCUMENT_POSITION_FOLLOWING ? 'header' : 'bottom';
    });
    expect(pos).toBe(VIEW_ALL);
  });

  test('TC-62 AC7: bấm Xem tất cả tới collection.url', async ({ page }) => {
    test.skip(!VIEW_ALL, 'show_view_all tắt (mặc định); đặt EXPECT_VIEW_ALL khi store đã bật');
    const block = await openHome(page);
    const button = block.getByTestId(T.viewAll);
    expect(new URL((await button.getAttribute('href'))!, page.url()).pathname).toMatch(new RegExp(`${VIEW_ALL_PATH}$`));
    const nav = page.waitForResponse(r => r.request().isNavigationRequest() && r.request().frame() === page.mainFrame());
    await button.click();
    expect((await nav).status()).toBeLessThan(400);
    await page.waitForURL(u => new RegExp(`${VIEW_ALL_PATH}$`).test(u.pathname));
  });

  test('TC-63 AC7: schema show_view_all false, view_all_position header/bottom (bottom)', async ({}, ti) => {
    test.skip(isMobile(ti), 'static, chạy 1 lần ở desktop');
    const byId = Object.fromEntries(blockSchema().settings.filter(s => s.id).map(s => [s.id!, s]));
    expect(byId.show_view_all).toMatchObject({ type: 'checkbox', default: false });
    expect(byId.view_all_position).toMatchObject({ type: 'select', default: 'bottom' });
    expect((byId.view_all_position.options as Array<{ value: string }>).map(o => o.value).sort()).toEqual(['bottom', 'header']);
  });

  // AC8
  // ES1-T441: "swatch chọn sẵn" = chỉ báo data-selected (không còn radio checked, không legend).
  test('TC-70 AC8: phần tử product dùng variant còn hàng đầu tiên, chỉ báo data-selected đúng value', async ({ page }) => {
    const cards = await cardsOn(page, HOME);
    const card = (ENV.swatch ? byHandle(page, cards, ENV.swatch) : cards.filter({ has: page.getByTestId(T.swatches) })).first();
    const target = (await card.count()) ? card : cards.first();
    const p = await productJs(page, await handleOf(target));
    const want = p.variants.find(v => v.available) ?? p.variants[0];
    expect(await variantIdOf(target), 'link ?variant= = selected_or_first_available_variant').toBe(want.id);
    if (await target.getByTestId(T.swatches).count()) {
      const opt = swatchOption(p, await swatchNames(target));
      expect(await selectedName(target), `data-selected = ${opt.name} của variant card`).toBe(want.options[opt.position - 1]);
    }
  });

  test('TC-71 AC8: card phần tử variant theo đúng variant (ảnh, giá, link, swatch)', async ({ page }) => {
    test.skip(!ENV.ac8Variant, 'Chưa có collection đa nguồn chứa variant trên store dev (ES1-T48 #6): AC8 N/A');
    await page.goto(ENV.ac8Path);
    const id = ENV.ac8Variant!;
    const card = page.getByTestId(T.card).filter({ has: page.locator(`a[data-testid="${T.title}"][href*="variant=${id}"]`) }).first();
    await expect(card, `card có ?variant=${id} trên ${ENV.ac8Path}`).toHaveCount(1);
    await card.scrollIntoViewIfNeeded();
    const hrefs = await card.locator('a[data-card-link]').evaluateAll(els => els.map(a => a.getAttribute('href') ?? ''));
    for (const h of hrefs) expect(h).toMatch(new RegExp(`[?&]variant=${id}\\b`));
    const p = await productJs(page, await handleOf(card));
    const v = p.variants.find(x => String(x.id) === id)!;
    expect(v, `variant ${id} trong .js`).toBeTruthy();
    if (v.featured_image && (await card.getByTestId(T.image).count())) {
      expect(fileName((await card.getByTestId(T.image).getAttribute('src'))!)).toBe(fileName(v.featured_image.src));
    }
    await expect(card.getByTestId(T.range), 'card variant không hiện khoảng giá').toHaveCount(0);
    expect(toCents(money(await card.getByTestId(T.regular).textContent()))).toBe(v.price);
    if (await card.getByTestId(T.swatches).count()) {
      const opt = swatchOption(p, await swatchNames(card));
      expect(await selectedName(card), `data-selected = ${opt.name} của variant ${id}`).toBe(v.options[opt.position - 1]);
      await expect(card.getByTestId(T.swatches), 'chỉ báo, không bấm').toHaveAttribute('aria-hidden', 'true');
    }
  });

  // ES1-T441: TC-72 (card variant đổi swatch rồi chọn lại) bỏ: AC8 0.3 "chỉ báo, không bấm".

  // Biên. ES1-T441: B-02 cũ (chặn product-swatch.js, radio vẫn chọn) và B-03 (offline đổi swatch) bỏ; ES1-T338 xoá product-swatch.js (ADR 0010).
  test('B-02 AC2: trang có card swatch không tải product-swatch.js, không có <product-swatch>', async ({ page }) => {
    const swatchJs: string[] = [];
    page.on('request', r => { if (/product-swatch[^/]*\.js/.test(r.url())) swatchJs.push(r.url()); });
    const card = await swatchCard(page, ALL);
    test.skip(!card, `Không có card ≥ 2 swatch trên ${ALL}; đặt TE3_SWATCH_HANDLE`);
    await page.waitForLoadState('load');
    expect(swatchJs, 'request product-swatch*.js').toEqual([]);
    await expect(page.locator('product-swatch')).toHaveCount(0);
    await expect(card!.getByTestId(T.title)).toBeVisible();
    await expect(card!.getByTestId(T.price)).toBeVisible();
  });

  test('B-06 AC6: sản phẩm không ảnh có placeholder SVG, tiêu đề và giá vẫn hiện', async ({ page }) => {
    const card = await findCard(page, T.noImage);
    test.skip(!card, `Không có sản phẩm không ảnh trên ${ALL}`);
    await expect(card!.getByTestId(T.noImage).locator('svg')).toHaveCount(1);
    await expect(card!.getByTestId(T.title)).toBeVisible();
    await expect(card!.getByTestId(T.price)).toBeVisible();
  });
});

test.describe('ES1-T53 TE-3 không JS (NFR-4)', () => {
  test.use({ javaScriptEnabled: false });

  // Chỉ assertion locator, không evaluate trong trang.
  // ES1-T441: không còn radio để đổi; không JS card vẫn đủ: 1 link, hàng chỉ báo aria-hidden, 1 data-selected, link có ?variant=.
  test('B-01 AC2 AC12: tắt JS, card render đủ, hàng chỉ báo như khi có JS, card là link tới trang sản phẩm', async ({ page }) => {
    await page.goto(allPage()); // ES1-T417: sort_by=created-descending
    const cards = page.getByTestId(T.collection).getByTestId(T.card);
    test.skip((await cards.count()) === 0, `${ALL} không có sản phẩm`);
    await expect(cards.first().getByTestId(T.title)).toBeVisible();
    await expect(cards.first().getByTestId(T.price)).toBeVisible();
    const card = (ENV.swatch ? byHandle(page, cards, ENV.swatch) : cards.filter({ has: page.locator(TWO_SWATCHES) })).first();
    test.skip((await card.count()) === 0, `Không có card ≥ 2 swatch trên trang đầu ${ALL}`);
    await expect(card.getByTestId(T.title)).toHaveAttribute('href', /\/products\/[^?#]+(\?variant=\d+)?$/);
    await expect(card.getByRole('link')).toHaveCount(1);
    await expect(card.getByTestId(T.swatches)).toHaveAttribute('aria-hidden', 'true');
    await expect(card.getByTestId(T.swatches).locator(LEGACY)).toHaveCount(0);
    await expect(card.locator(SELECTED)).toHaveCount(1);
  });
});
