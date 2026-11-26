// KHÔNG CHẮC: spec chưa chạy trên preview (phiên QA không có PREVIEW_URL/STORE_PASSWORD); chờ CI store-tests của PR, chưa báo đạt.
// Ticket ES1-T159 TE-13-QA1: test nghiệm thu story TE-13 (docs/srs.md#TE-13 bản 0.5: AC1–AC8, AC-H21, AC-H22, AC-H23; TE-4 AC17, AC32 qua component chung).
// Tên file theo key ES1-T159 (Orchestrator), tiêu đề ticket ghi tests/e2e/TE-13.spec.ts. Không gộp với ES1-T156/157/158/344 (spec dev từng task):
// file này kiểm theo AC ở mức story, case trùng ý đã có ở spec dev thì chỉ giữ phần nghiệm thu (giá trị, trạng thái quan sát được), không lặp hợp đồng hook.
// Test case: drafts/qa/ES1-T159/test-cases.md (TC-xx trong tên test). Template kiểm thử: /?view=te13, /?view=te13-states, /?view=te13-featured.
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T159.spec.ts (project desktop + mobile Pixel 7).
import { existsSync, readFileSync, statSync } from 'node:fs';
import { test, expect, type Locator, type Page, type Request } from './support/test';
import AxeBuilder from '@axe-core/playwright';
import { CART_GLOB, themeAdd } from './support/cart-api';
import { watchShopPay403 } from './support/console-guard';
import { pageJson, readCartJson, readCartNoScript, requireJson } from './support/product-data';
import { chooseOptions } from './support/variant-picker';
import { clickAndLoad, expectNotChallenged, gotoStore, skipIfStoreBlocked, waitStoreCooldown } from './support/store-guard';
import { env } from './support/store-data';
import { fixtureApplied } from './support/home-fixture';

const HOME = '/';
const TE13 = '/?view=te13';
const STATES = '/?view=te13-states';
const FEATURED = '/?view=te13-featured';
const CD = 'featured-product-countdown';
const FAKE_VIDEO = 'https://cdn.shopify.com/videos/c/vp/es1-t159/fake.mp4';
const EMBED = /youtube-nocookie\.com|player\.vimeo\.com|youtube\.com\/embed/;
const VIDEO_FILE = /\.(mp4|m3u8|webm|mov)(\?|$)|\/videos\//;
const MODULES = ['featured-product', 'video-carousel', 'product-form', 'product-variant-picker', 'sale-countdown'] as const;
const IGNORE_CONSOLE = [
  /shopifycloud|monorail|web-pixels|trekkie|shop\.app|otlp-http|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i,
  /Failed to resolve module specifier "?@shopify\/partial-rendering/,
];
const LOCALE = JSON.parse(readFileSync('locales/en.default.json', 'utf8'));
const L = {
  add: LOCALE.blocks.product_form.add_to_cart as string,
  soldOut: LOCALE.blocks.product_form.sold_out as string,
  viewDetail: LOCALE.blocks.featured_product.view_detail as string,
  ended: LOCALE.blocks.sale_countdown.ended as string,
  pause: LOCALE.blocks.video_card.pause as string,
  play: LOCALE.blocks.video_card.play as string,
  errorProduct: LOCALE.blocks.video_card.error_product as string,
};

type Variant = { id: number; options: string[]; available: boolean; price: number; compare_at_price: number | null; featured_media?: { id: number } | null };
type Product = { id: number; handle: string; title: string; url?: string; variants: Variant[]; media?: { media_type: string }[] };

const band = (page: Page, id: string) => page.getByTestId(`container-${id}`);
const featured = (page: Page, id: string) => band(page, id).getByTestId('featured-product');
const carousel = (page: Page, id = 'te13-video') => band(page, id).getByTestId('video-carousel');
const card = (page: Page, n: number) => page.locator(`[data-video-card-id="te13-video-${n}"]`).locator('video-card');
const box = (el: Locator) => el.evaluate((n) => { const r = n.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
const near = (actual: number, expected: number, tol = 2) => expect(Math.abs(actual - expected), `${actual} ≈ ${expected} ± ${tol}`).toBeLessThanOrEqual(tol);

// Tiền trên trang → cents (cùng quy tắc ES1-T158).
function cents(value: string | null): number {
  const m = (value ?? '').match(/\d[\d.,\s  ']*/);
  if (!m) return NaN;
  const t = m[0].replace(/[\s  ']/g, '').replace(/[.,]+$/, '');
  const last = Math.max(t.lastIndexOf('.'), t.lastIndexOf(','));
  const n = last >= 0 && t.length - last - 1 !== 3 ? Number(`${t.slice(0, last).replace(/[.,]/g, '')}.${t.slice(last + 1)}`) : Number(t.replace(/[.,]/g, ''));
  return Math.round(n * 100);
}

function watchConsole(page: Page) {
  const errors: string[] = [];
  const isShopPay403 = watchShopPay403(page);
  page.on('console', (msg) => {
    if (msg.type() !== 'error' || isShopPay403(msg)) return;
    // Lỗi mạng do chính test tạo (route.abort tệp video, embed, module bị chặn).
    if (/Failed to load resource|net::ERR_FAILED/.test(msg.text()) && /fake\.mp4|\/videos\/|youtube|vimeo|\/assets\//.test(msg.location().url)) return;
    if (IGNORE_CONSOLE.some((r) => r.test(msg.text()) || r.test(msg.location().url))) return;
    errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

/** Chạy fn khi HTML parse xong, trước module (deferred). Chỉ trang chính. */
async function beforeModules(page: Page, fn: (arg: unknown) => void, arg?: unknown) {
  await page.addInitScript({
    content: `if (window === window.top) document.addEventListener('readystatechange', () => (${fn.toString()})(${JSON.stringify(arg ?? null)}), { once: true });`,
  });
}

const setEnd = (page: Page, end: number) =>
  beforeModules(page, (v) => { for (const el of document.querySelectorAll('[data-sale-countdown]')) (el as HTMLElement).dataset.end = String(v); }, end);

async function axeSerious(page: Page) {
  await expectNotChallenged(page);
  const r = await new AxeBuilder({ page }).analyze();
  return r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
}

const cellValues = (frame: Locator) => frame.locator('[data-countdown-unit]:not([hidden]) [data-countdown-value]').allTextContents();
const secondsOf = (vals: string[]) => vals.reduce((s, v, i, all) => s + Number(v) * [86400, 3600, 60, 1].slice(-all.length)[i], 0);

/** Đồng hồ giả + data-end = now + left; mở band te13-a của STATES, cuộn tới countdown, chờ module đếm. */
async function openCountdown(page: Page, left: number, url = STATES) {
  const start = Date.now();
  const end = Math.floor(start / 1000) + left;
  await page.clock.install({ time: start });
  await setEnd(page, end);
  await gotoStore(page, url);
  const frame = featured(page, 'te13-a').getByTestId(CD);
  test.skip((await frame.count()) === 0, 'Band A không có giá gạch ở biến thể đầu (te13-featured chưa publish, sale-gia-nhỏ hết sale; ES1-T153)');
  await frame.scrollIntoViewIfNeeded();
  await expect.poll(() => page.evaluate(() => !!customElements.get('sale-countdown'))).toBe(true);
  await expect(frame).toBeInViewport();
  return { frame, end };
}

async function readProduct(scope: Locator): Promise<Product> {
  const url = (await scope.locator('product-form').getAttribute('data-product-url')) ?? (await scope.getByTestId('featured-product-view-detail').getAttribute('href'))!;
  const path = url.split('?')[0];
  const p = requireJson(await pageJson<Product>(scope.page(), `${path}.js`), `${path}.js`);
  return { ...p, url: path };
}
const currentId = async (scope: Locator) => Number(await scope.locator('form input[type="hidden"][name="id"]').inputValue());
const wakeBuy = (scope: Locator) => scope.getByTestId('featured-product-add').hover();
// Form chứa nút mua. filter({ has: scope.getByTestId(...) }) sai: locator con tính lại từ container-… bên trong form nên không khớp (CI 45265403257).
const buyForm = (scope: Locator) => scope.locator('form:has([data-testid="featured-product-add"])');

/** Giá, giá gạch, % giảm của scope khớp biến thể (TE-13 AC2). */
async function expectPrice(scope: Locator, v: Variant) {
  const price = scope.getByTestId('featured-product-price');
  await expect.poll(async () => cents(await price.getByTestId('price-regular').first().textContent())).toBe(v.price);
  const onSale = !!v.compare_at_price && v.compare_at_price > v.price;
  await expect(price.getByTestId('price-compare')).toHaveCount(onSale ? 1 : 0);
  await expect(scope.getByTestId('featured-product-discount')).toHaveCount(onSale ? 1 : 0);
  if (onSale) {
    expect(cents(await price.getByTestId('price-compare').first().textContent())).toBe(v.compare_at_price);
    const pct = Math.round(((v.compare_at_price! - v.price) * 100) / v.compare_at_price!);
    if (pct > 0) await expect(scope.getByTestId('featured-product-discount')).toContainText(`${pct}%`);
  }
}

/** Thẻ YouTube thành thẻ video Shopify với tệp giả (store có thể chưa có video, ES1-T153). */
const fakeShopifyCard = (page: Page, n: number) =>
  beforeModules(page, (v) => {
    const { n, src } = v as { n: number; src: string };
    const el = document.querySelector(`[data-video-card-id="te13-video-${n}"] video-card`) as HTMLElement | null;
    // Thẻ đã là video Shopify thật thì giữ nguyên (TC-32 gọi trước lần tải duy nhất, không mở trang 2 lần).
    if (!el || el.dataset.videoKind === 'shopify') return;
    el.dataset.videoKind = 'shopify';
    el.querySelector('template')!.innerHTML = `<video class="video-card__media" playsinline preload="metadata" aria-label="Demo"><source src="${src}" type="video/mp4"></video>`;
    if (!el.querySelector('[data-video-toggle]')) {
      const b = document.createElement('button');
      b.type = 'button'; b.hidden = true; b.setAttribute('data-video-toggle', ''); b.setAttribute('data-testid', 'video-card-toggle');
      b.dataset.labelPlay = 'Play'; b.dataset.labelPause = 'Pause';
      el.querySelector('[data-video-template]')!.before(b);
    }
  }, { n, src: FAKE_VIDEO });

/** Không có tệp thật: stub play/pause, paused đọc theo cờ. */
const stubMedia = (page: Page) =>
  page.addInitScript(() => {
    HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) { (this as unknown as { __on: boolean }).__on = true; this.dispatchEvent(new Event('play')); return Promise.resolve(); };
    HTMLMediaElement.prototype.pause = function (this: HTMLMediaElement) { (this as unknown as { __on: boolean }).__on = false; this.dispatchEvent(new Event('pause')); };
    Object.defineProperty(HTMLMediaElement.prototype, 'paused', { get(this: { __on?: boolean }) { return !this.__on; } });
  });

// =====================================================================================================================
// AC1 (R8) + TE-4 AC17, AC32, AC-H23: countdown chung trên featured product. Đồng hồ bằng page.clock.
// =====================================================================================================================
test.describe('ES1-T159 AC1 countdown', () => {
  test('TC-01 AC1 còn hạn: data-end khớp giờ store (offset ghi vào annotation), ≥ 24 giờ 4 ô, số Liquid khớp còn lại', async ({ page }) => {
    await gotoStore(page, STATES);
    const frame = featured(page, 'te13-a').getByTestId(CD);
    test.skip((await frame.count()) === 0, 'Band A không có giá gạch (ES1-T153)');
    const expected = Number(await page.getByTestId('te13-meta').getAttribute('data-expected-end'));
    const end = Number(await frame.getAttribute('data-end'));
    const datetime = (await frame.getByTestId(`${CD}-ends-on`).locator('time').getAttribute('datetime')) ?? '';
    const offset = datetime.match(/[+-]\d{4}$/)?.[0] ?? 'không đọc được';
    test.info().annotations.push({ type: 'store-offset', description: `${offset} (time[datetime]=${datetime}, data-end=${end}, expected=${expected})` });
    // Sản phẩm có metafield custom.sale_ends_at thì ngày lấy từ metafield (TC-13), không so với setting.
    const handle = (await readProduct(featured(page, 'te13-a'))).handle;
    if (handle !== 'te13-featured') expect(end, 'setting countdown_end (YYYY-MM-DD HH:MM giờ store) → epoch theo offset store').toBe(expected);
    expect(new Date(datetime).getTime() / 1000).toBe(end);
    await expect(frame).toHaveAttribute('role', 'timer');
    await expect(frame.getByTestId(`${CD}-days`)).toBeVisible();
    const vals = await cellValues(frame);
    expect(vals).toHaveLength(4);
    near(secondsOf(vals), end - Date.now() / 1000, 90); // số in lúc render ở server, trang có thể cache ≤ 1 phút
  });

  test('TC-02 AC1 quá hạn lúc render: 0 phần tử countdown, không chừa chỗ (band B)', async ({ page }) => {
    await gotoStore(page, STATES);
    await expect(featured(page, 'te13-b')).toBeVisible();
    await expect(featured(page, 'te13-b').locator('sale-countdown, [data-sale-countdown]')).toHaveCount(0);
  });

  test('TC-03 AC1 không có ngày ở cả 2 nguồn: 0 countdown dù đang sale (band E)', async ({ page }) => {
    await gotoStore(page, STATES);
    test.skip((await band(page, 'te13-e').count()) === 0, 'Band E không render');
    await expect(featured(page, 'te13-e').locator('[data-sale-countdown]')).toHaveCount(0);
  });

  test('TC-04 AC1 AC7 sai định dạng: storefront 0 countdown, 0 thông báo editor (band D)', async ({ page }) => {
    await gotoStore(page, STATES);
    await expect(featured(page, 'te13-d').locator('[data-sale-countdown]')).toHaveCount(0);
    await expect(featured(page, 'te13-d').getByTestId(`${CD}-notice`)).toHaveCount(0);
  });

  test('TC-05 AC1 biến thể hết hàng: 0 countdown, nút Sold out disabled (band C)', async ({ page }) => {
    await gotoStore(page, STATES);
    const c = featured(page, 'te13-c');
    await expect(c.locator('[data-sale-countdown]')).toHaveCount(0);
    await expect(c.getByTestId('featured-product-add')).toBeDisabled();
    await expect(c.getByTestId('featured-product-add')).toHaveText(new RegExp(L.soldOut, 'i'));
  });

  test('TC-06 AC1 trang cache: đồng hồ khách đã qua data-end khi JS chạy → K3 ngay, không số âm', async ({ page }) => {
    const { frame } = await openCountdown(page, -30);
    await expect(frame).toHaveAttribute('data-state', 'ended');
    await expect(frame).toHaveText(L.ended);
    await expect(frame.locator('[data-countdown-value]')).toHaveCount(0);
  });

  test('TC-07 AC1 qua giờ kết thúc khi đang xem: K3, giữ khung, giá và nút giữ, không tự tải lại, không đếm lại', async ({ page }) => {
    const { frame } = await openCountdown(page, 4);
    const scope = featured(page, 'te13-a');
    const before = await box(frame);
    const price = await scope.getByTestId('featured-product-price').textContent();
    let navigations = 0;
    page.on('framenavigated', (f) => { if (f === page.mainFrame()) navigations += 1; });
    await page.clock.runFor(6000);
    await expect(frame).toHaveText(L.ended);
    near((await box(frame)).h, before.h);
    await page.clock.runFor(10_000);
    await expect(frame).toHaveText(L.ended);
    await expect(scope.getByTestId('featured-product-price')).toHaveText(price ?? '');
    await expect(scope.getByTestId('featured-product-add')).toBeEnabled();
    expect(navigations).toBe(0);
  });

  // Đồng hồ thật, không page.clock: CI 45265403257 lần tải thứ 2 dưới đồng hồ giả bị Cloudflare trả màn thử thách (4/4 lần),
  // page.reload() không qua guard nên báo "không thấy countdown". Tải lại bằng gotoStore cùng URL: bị chặn thì báo Cloudflare.
  test('TC-08 AC1 TE-4 AC17 reload không reset; xoá storage không đổi kết quả', async ({ page }) => {
    const end = Math.floor(Date.now() / 1000) + 3 * 86400 + 3600;
    await setEnd(page, end);
    await gotoStore(page, STATES);
    const frame = featured(page, 'te13-a').getByTestId(CD);
    test.skip((await frame.count()) === 0, 'Band A không có giá gạch ở biến thể đầu (ES1-T153)');
    await frame.scrollIntoViewIfNeeded();
    await expect.poll(() => page.evaluate(() => !!customElements.get('sale-countdown'))).toBe(true);
    const left = () => page.evaluate((e) => Math.floor(e - Date.now() / 1000), end);
    await expect.poll(async () => Math.abs(secondsOf(await cellValues(frame)) - (await left()))).toBeLessThanOrEqual(2);
    await page.waitForTimeout(2000);
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
    // Bản chất test cần lần tải thứ 2. Shard đã bị 429/thử thách thì chờ hết đợt chặn (ES1-T477 a) trước khi tải lại; chưa bị chặn thì không chờ.
    await waitStoreCooldown('TC-08 tải lại /?view=te13-states');
    await gotoStore(page, STATES);
    await frame.scrollIntoViewIfNeeded();
    await expect.poll(() => page.evaluate(() => !!customElements.get('sale-countdown'))).toBe(true);
    await expect.poll(async () => Math.abs(secondsOf(await cellValues(frame)) - (await left()))).toBeLessThanOrEqual(2);
    const keys = await page.evaluate(() => [...Object.keys(localStorage), ...Object.keys(sessionStorage)]);
    expect(keys.filter((k) => /countdown|deadline|timer|sale/i.test(k))).toEqual([]);
  });

  test('TC-09 AC-H23 dưới 24 giờ: ô ngày ẩn, 3 ô 2 chữ số giảm mỗi giây', async ({ page }) => {
    const { frame } = await openCountdown(page, 5 * 3600 + 120);
    await expect(frame.getByTestId(`${CD}-days`)).toBeHidden();
    const a = await cellValues(frame);
    expect(a).toHaveLength(3);
    for (const v of a) expect(v).toMatch(/^\d{2}$/);
    await page.clock.runFor(1000);
    await expect.poll(async () => secondsOf(a) - secondsOf(await cellValues(frame))).toBe(1);
    await page.clock.runFor(3000);
    await expect.poll(async () => secondsOf(a) - secondsOf(await cellValues(frame))).toBe(4);
  });

  test('TC-10 TE-4 AC32 dưới 1 giờ: data-state ending, ô nền accent, kích thước ô không đổi', async ({ page }) => {
    const { frame } = await openCountdown(page, 3700);
    await expect(frame).toHaveAttribute('data-state', 'running');
    const cell = frame.getByTestId(`${CD}-seconds`);
    const size = await box(cell);
    await page.clock.runFor(200_000);
    await expect(frame).toHaveAttribute('data-state', 'ending');
    const { bg, accent } = await cell.evaluate((el) => {
      const probe = document.createElement('span');
      probe.style.backgroundColor = 'var(--color-accent)';
      document.body.append(probe);
      const accent = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return { bg: getComputedStyle(el).backgroundColor, accent };
    });
    expect(bg).toBe(accent);
    near((await box(cell)).w, size.w, 0.5);
    near((await box(cell)).h, size.h, 0.5);
    await expect(cell.locator('[data-countdown-value]')).toHaveText(/^\d{2}$/);
  });

  test('TC-11 AC1 a11y: role timer có tên là câu ngày kết thúc, ô số aria-hidden, không aria-live', async ({ page }) => {
    const { frame } = await openCountdown(page, 2 * 86400);
    const id = await frame.getAttribute('aria-labelledby');
    expect(id).toBeTruthy();
    await expect(page.locator(`[id="${id}"]`)).toContainText(/\d/);
    await expect(frame.locator('.sale-countdown__units')).toHaveAttribute('aria-hidden', 'true');
    await expect(frame.locator('[aria-live]')).toHaveCount(0);
    await expect(frame).not.toHaveAttribute('aria-live', /.+/);
  });

  test('TC-12 AC1 metafield thắng setting: te13-featured có custom.sale_ends_at thì data-end ≠ ngày setting', async ({ page }) => {
    test.skip(env('TE13_METAFIELDS_READY') !== 'true', 'TE13_METAFIELDS_READY chưa bật: te13-featured gỡ khỏi Online Store (store-data.json, ES1-T153)');
    await gotoStore(page, FEATURED);
    const meta = page.getByTestId('te13-meta');
    test.skip((await meta.getAttribute('data-product-handle')) !== 'te13-featured', 'te13-featured không render');
    const frame = featured(page, 'te13-f').getByTestId(CD);
    test.skip((await frame.count()) === 0, 'metafield custom.sale_ends_at của te13-featured đã qua hạn hoặc thiếu');
    expect(Number(await frame.getAttribute('data-end'))).not.toBe(Number(await meta.getAttribute('data-expected-end')));
  });

  test('TC-13 AC1 1 band: đổi sang biến thể không giá gạch thì countdown ẩn', async ({ page }) => {
    test.fixme(true, 'ES1-T600 (Tech Lead chưa chốt): slot countdown không nằm trong partial, 1 band đổi biến thể không làm mới countdown');
    await gotoStore(page, TE13);
  });
});

// =====================================================================================================================
// AC2 + AC-H22 + AC6 phần trạng thái: featured product.
// =====================================================================================================================
test.describe('ES1-T159 AC2 featured product', () => {
  test('TC-14 AC2 gallery: mọi media (≤ 8), từ 2 media có thumbnail là link trong trang tới đúng media', async ({ page }) => {
    await gotoStore(page, TE13);
    const scope = featured(page, 'te13-a');
    const p = await readProduct(scope);
    const total = Math.min(p.media?.length ?? 0, 8);
    if (total > 0) await expect(scope.getByTestId('featured-product-media-item')).toHaveCount(total);
    test.skip(total < 2, 'Sản phẩm band A dưới 2 media');
    const thumbs = scope.getByTestId('featured-product-thumbnail');
    await expect(thumbs).toHaveCount(total);
    for (let i = 0; i < total; i++) {
      const href = (await thumbs.nth(i).getAttribute('href'))!;
      expect(href).toMatch(/^#FeaturedMedia-/);
      await expect(page.locator(href)).toHaveCount(1);
    }
  });

  test('TC-15 AC2 rich media: video/3D là poster + nút, không autoplay, external trong template', async ({ page }) => {
    await gotoStore(page, TE13);
    const rich = page.locator('featured-product').getByTestId('featured-product-media-item').and(page.locator('[data-media-type="video"], [data-media-type="external_video"], [data-media-type="model"]'));
    test.skip((await rich.count()) === 0, 'Sản phẩm featured trên template kiểm thử chỉ có ảnh (variant-co-ảnh-rieng); rich media dùng chung product-media-item (ADR 0012), kiểm ở spec PDP');
    // Video Shopify: poster, preload none, không autoplay; external: iframe nằm trong template tới khi bấm.
    await expect(page.locator('featured-product video[autoplay]')).toHaveCount(0);
    await expect(page.locator('featured-product iframe')).toHaveCount(0);
    for (const v of await page.locator('featured-product video').all()) await expect(v).toHaveAttribute('preload', 'none');
  });

  test('TC-16 AC2 giá, giá gạch, % giảm khớp /products/{handle}.js biến thể đang chọn', async ({ page }) => {
    await gotoStore(page, TE13);
    const scope = featured(page, 'te13-a');
    const p = await readProduct(scope);
    const id = await currentId(scope);
    const v = p.variants.find((x) => x.id === id);
    expect(v, `biến thể ${id} có trong ${p.handle}.js`).toBeTruthy();
    await expectPrice(scope, v!);
  });

  test('TC-17 AC2 AC6 không sale: không giá gạch, không badge % (band nào có biến thể đầu không sale)', async ({ page }) => {
    await gotoStore(page, STATES);
    let checked = 0;
    for (const bandId of ['te13-b', 'te13-d']) {
      const scope = featured(page, bandId);
      if ((await scope.count()) === 0) continue;
      const p = await readProduct(scope);
      const variantId = await currentId(scope);
      const selected = p.variants.find((x) => x.id === variantId);
      if (!selected || (selected.compare_at_price && selected.compare_at_price > selected.price)) continue;
      await expect.poll(async () => cents(await scope.getByTestId('price-regular').first().textContent())).toBe(selected.price);
      await expect(scope.getByTestId('featured-product-discount')).toHaveCount(0);
      await expect(scope.getByTestId('price-compare')).toHaveCount(0);
      checked += 1;
    }
    test.skip(checked === 0, 'Band B, D đều đang sale: không có dữ liệu không sale');
  });

  test('TC-18 AC2 AC6 có metafield: rating trên thang 5, số đánh giá, bảng spec chỉ dòng có giá trị', async ({ page }) => {
    test.skip(env('TE13_METAFIELDS_READY') !== 'true', 'TE13_METAFIELDS_READY chưa bật (ES1-T153, store-data.json)');
    await gotoStore(page, FEATURED);
    const scope = featured(page, 'te13-f');
    await expect(scope.getByTestId('featured-product-rating')).toBeVisible();
    await expect(scope.getByTestId('featured-product-rating')).toContainText(/\(\d(\.\d)?\)/);
    await expect(scope.getByTestId('featured-product-rating-count')).toContainText(/\d+ reviews?/);
    const rows = scope.getByTestId('featured-product-spec');
    const n = await rows.count();
    expect(n).toBeGreaterThan(0);
    expect(n).toBeLessThanOrEqual(4);
    for (let i = 0; i < n; i++) await expect(rows.nth(i).locator('td')).not.toHaveText('');
  });

  test('TC-19 AC2 AC6 không metafield: không hàng sao, không bảng spec dù có nhãn', async ({ page }) => {
    await gotoStore(page, TE13);
    const scope = featured(page, 'te13-a');
    test.skip((await readProduct(scope)).handle === 'te13-featured', 'Band A dùng sản phẩm có metafield');
    await expect(scope.getByTestId('featured-product-rating')).toHaveCount(0);
    await expect(scope.getByTestId('featured-product-specs')).toHaveCount(0);
  });

  test('TC-20 AC2 AC6 hết hàng: nút primary disabled "Sold out", View detail vẫn tới product.url, tên có " of {product}"', async ({ page }) => {
    await gotoStore(page, STATES);
    const scope = featured(page, 'te13-c');
    const p = await readProduct(scope);
    await expect(scope.getByTestId('featured-product-add')).toBeDisabled();
    const detail = scope.getByTestId('featured-product-view-detail');
    await expect(detail).toBeEnabled();
    expect(new URL((await detail.getAttribute('href'))!, page.url()).pathname).toBe(new URL(p.url!, page.url()).pathname);
    await expect(detail).toHaveAccessibleName(new RegExp(`of ${p.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
  });

  test('TC-21 AC2 nhãn nút sentence case "Add to cart", "View details" (SRS 0.5, content.md §8)', async ({ page }) => {
    test.skip(L.add !== 'Add to cart' || L.viewDetail !== 'View details', `Locale còn "${L.add}" / "${L.viewDetail}": chờ ES1-T578 (FE đổi sentence case)`);
    await gotoStore(page, TE13);
    const scope = featured(page, 'te13-a');
    await expect(scope.getByTestId('featured-product-add')).toHaveText('Add to cart');
    await expect(scope.getByTestId('featured-product-view-detail')).toContainText('View details');
  });

  test('TC-22 AC2 AC-H22 đổi biến thể: giá, nút, ảnh cập nhật; URL trang không đổi, không reload', async ({ page }) => {
    await gotoStore(page, TE13);
    const scope = featured(page, 'te13-a');
    await scope.scrollIntoViewIfNeeded();
    const picker = scope.getByTestId('product-variant-picker');
    test.skip((await picker.count()) === 0, 'Sản phẩm band A không có nhiều biến thể');
    await wakeBuy(scope);
    const p = await readProduct(scope);
    const id = await currentId(scope);
    const cur = p.variants.find((v) => v.id === id);
    const others = p.variants.filter((v) => v.id !== id && v.available);
    // Ưu tiên biến thể có ảnh riêng khác ảnh hiện tại (variant-co-ảnh-rieng) để kiểm "ảnh cập nhật".
    const next = others.find((v) => v.featured_media && v.featured_media.id !== cur?.featured_media?.id) ?? others[0];
    test.skip(!next, 'Cần 2 biến thể còn hàng');
    const url = page.url();
    let navigations = 0;
    page.on('framenavigated', (f) => { if (f === page.mainFrame()) navigations += 1; });
    await chooseOptions(scope, next!.options);
    await expect(scope.locator('form input[type="hidden"][name="id"]')).toHaveValue(String(next!.id));
    await expectPrice(scope, next!);
    await expect(scope.getByTestId('featured-product-add')).toBeEnabled();
    if (next!.featured_media && next!.featured_media.id !== cur?.featured_media?.id) {
      const thumb = scope.locator(`[data-testid="featured-product-thumbnail"][data-media-id="${next!.featured_media.id}"]`);
      if (await thumb.count()) await expect(thumb).toHaveAttribute('aria-current', 'true');
      await expect(scope.locator(`[data-testid="featured-product-media-item"][data-media-id="${next!.featured_media.id}"]`)).toBeInViewport({ ratio: 0.5 });
    } else test.info().annotations.push({ type: 'AC-H22 ảnh', description: 'Không có biến thể còn hàng có ảnh riêng: chưa kiểm ảnh cập nhật' });
    expect(page.url()).toBe(url);
    expect(navigations).toBe(0);
  });

  test('TC-23 AC2 AC-H22 thêm giỏ thật đúng biến thể (cart_type theo setting), số giỏ tăng', async ({ page }) => {
    await skipIfStoreBlocked('store dev chặn luồng thêm giỏ thật /?view=te13 (môi trường, ES1-T300)', async () => {
      await gotoStore(page, TE13);
      const scope = featured(page, 'te13-a');
      const add = scope.getByTestId('featured-product-add');
      test.skip(await add.isDisabled(), 'Biến thể đầu hết hàng');
      const id = await currentId(scope);
      const type = await scope.locator('product-form').getAttribute('data-cart-type');
      await wakeBuy(scope);
      await expect.poll(() => page.evaluate(() => !!customElements.get('product-form'))).toBe(true);
      await themeAdd(page, () => add.click(), async () => {
        await gotoStore(page, TE13);
        await wakeBuy(scope);
      });
      await expect.poll(async () => (await readCartJson<{ items: { variant_id: number }[] }>(page)).items.map((i) => i.variant_id)).toContain(id);
      if (type === 'page') await expect(page).toHaveURL(/\/cart(\?|$)/);
      else {
        await expect(page.getByTestId('cart-drawer-dialog')).toBeVisible();
        await expect(page.getByTestId('header-cart-count')).toHaveText('1');
      }
    });
  });

  test('TC-24 AC2 chế độ còn lại của cart_type (đổi data-cart-type trước module): page → /cart, drawer → drawer', async ({ page }) => {
    await skipIfStoreBlocked('store dev chặn luồng thêm giỏ thật (môi trường)', async () => {
      await gotoStore(page, TE13);
      const original = await featured(page, 'te13-a').locator('product-form').getAttribute('data-cart-type');
      const other = original === 'page' ? 'drawer' : 'page';
      test.info().annotations.push({ type: 'cart_type', description: `setting store: ${original}; kiểm thêm: ${other} (giả bằng thuộc tính, không đổi setting)` });
      await beforeModules(page, (v) => { for (const el of document.querySelectorAll('featured-product product-form')) (el as HTMLElement).dataset.cartType = String(v); }, other);
      await gotoStore(page, TE13);
      const scope = featured(page, 'te13-a');
      const add = scope.getByTestId('featured-product-add');
      test.skip(await add.isDisabled(), 'Biến thể đầu hết hàng');
      await wakeBuy(scope);
      await expect.poll(() => page.evaluate(() => !!customElements.get('product-form'))).toBe(true);
      await themeAdd(page, () => add.click(), async () => { await gotoStore(page, TE13); await wakeBuy(scope); });
      if (other === 'page') await expect(page).toHaveURL(/\/cart(\?|$)/);
      else await expect(page.getByTestId('cart-drawer-dialog')).toBeVisible();
    });
  });

  // Hợp đồng product-form (ES1-T67 AC8, assets/product-form.js, ES1-T85): lỗi mạng/5xx khi POST Cart API add → submit form thường,
  // không giữ khách ở nút kèm thông báo. POST /cart/add thường bị route.fulfill giả: store dev Cloudflare chặn POST thật (CI 45265403257).
  test('TC-25 AC2 lỗi mạng khi thêm giỏ (route.abort Cart API add): rơi về POST form thường đúng biến thể, không pageerror', async ({ page }) => {
    const errors = watchConsole(page);
    await page.route(CART_GLOB.add, (r) => r.abort());
    await page.route(/\/cart\/add(\?|$)/, (r) => r.fulfill({ contentType: 'text/html', body: '<!doctype html><title>cart add (giả)</title>' }));
    await gotoStore(page, TE13);
    const scope = featured(page, 'te13-a');
    const add = scope.getByTestId('featured-product-add');
    test.skip(await add.isDisabled(), 'Biến thể đầu hết hàng');
    const id = await currentId(scope);
    await wakeBuy(scope);
    await expect.poll(() => page.evaluate(() => !!customElements.get('product-form'))).toBe(true);
    const ajax = page.waitForRequest((r) => /\/cart\/add\.js(\?|$)/.test(r.url()) && r.method() === 'POST');
    const native = page.waitForRequest((r) => /\/cart\/add(\?|$)/.test(r.url()) && r.method() === 'POST' && r.isNavigationRequest());
    await add.click();
    await ajax;
    const post = await native;
    expect(post.postData() ?? '', 'form thường gửi id biến thể đang chọn').toContain(String(id));
    expect(errors.filter((e) => e.startsWith('pageerror'))).toEqual([]);
  });

  test('TC-26 AC-H22 trang chủ (fixture): Add to cart mở drawer, số giỏ tăng đúng', async ({ page }) => {
    await skipIfStoreBlocked('store dev chặn luồng thêm giỏ thật / (môi trường)', async () => {
      await gotoStore(page, HOME);
      test.skip(!(await fixtureApplied(page)), 'store dev chưa áp fixture nội dung Figma (ES1-T331): trang chủ chưa có featured product');
      const scope = band(page, 'home-featured-product');
      const add = scope.getByTestId('featured-product-add');
      test.skip(await add.isDisabled(), 'Biến thể đầu của sản phẩm featured hết hàng');
      // Trang chủ dùng hide_options (Figma 1:759): không có bộ chọn để đổi biến thể — hỏi ở ES1-T608.
      await expect(scope.getByTestId('product-variant-picker')).toHaveCount(0);
      const id = await currentId(scope);
      await wakeBuy(scope);
      await expect.poll(() => page.evaluate(() => !!customElements.get('product-form'))).toBe(true);
      await themeAdd(page, () => add.click(), async () => { await gotoStore(page, HOME); await wakeBuy(scope); });
      await expect.poll(async () => (await readCartJson<{ items: { variant_id: number }[] }>(page)).items.map((i) => i.variant_id)).toContain(id);
      if ((await scope.locator('product-form').getAttribute('data-cart-type')) !== 'page') {
        await expect(page.getByTestId('cart-drawer-dialog')).toBeVisible();
        await expect(page.getByTestId('header-cart-count')).toHaveText('1');
      }
    });
  });
});

// =====================================================================================================================
// AC3, AC4: video carousel.
// =====================================================================================================================
test.describe('ES1-T159 AC3 AC4 video carousel', () => {
  test('TC-27 AC3 tối đa 8 thẻ; bộ 8 render đủ 8; poster có sẵn ở thẻ có ảnh', async ({ page }) => {
    await gotoStore(page, TE13);
    await expect(carousel(page).getByTestId('video-card')).toHaveCount(8);
    await expect(carousel(page, 'te13-video-mixed').getByTestId('video-card')).toHaveCount(1);
    await expect(band(page, 'te13-video-empty').getByTestId('video-carousel')).toHaveCount(0);
    await expect(card(page, 5).getByTestId('video-card-poster').locator('img')).toHaveCount(1);
  });

  test('TC-28 AC3 lazy theo viewport: 0 request video/iframe khi tải; tới khung mới có thẻ video Shopify; embed 0 request tới khi bấm', async ({ page }) => {
    const requests: string[] = [];
    page.on('request', (r: Request) => { if (VIDEO_FILE.test(r.url()) || EMBED.test(r.url())) requests.push(r.url()); });
    await beforeModules(page, () => {
      const s = document.createElement('style');
      s.textContent = '[data-testid="container-te13-video"]{margin-block-start:400vh}';
      document.head.append(s);
    });
    await gotoStore(page, TE13);
    await page.waitForTimeout(500);
    expect(requests, 'chưa vào viewport').toEqual([]);
    await expect(carousel(page).locator('video, iframe')).toHaveCount(0);
    await carousel(page).scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    expect(requests.filter((u) => EMBED.test(u)), 'YouTube/Vimeo chưa bấm').toEqual([]);
    if ((await card(page, 1).getAttribute('data-video-kind')) === 'shopify') await expect(card(page, 1).locator('video')).toHaveCount(1);
  });

  test('TC-29 AC3 không tự chạy kể cả tắt tiếng: không thuộc tính autoplay, video paused trước khi bấm', async ({ page }) => {
    await gotoStore(page, TE13);
    await carousel(page).scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    await expect(carousel(page).locator('video[autoplay], video[muted][autoplay]')).toHaveCount(0);
    const states = await carousel(page).locator('video').evaluateAll((els) => els.map((v) => (v as HTMLVideoElement).paused));
    expect(states.every(Boolean)).toBe(true);
  });

  test('TC-30 AC3 bấm poster YouTube: tải iframe nocookie tại chỗ (request chỉ sau khi bấm), thẻ khác vẫn poster', async ({ page }) => {
    const embeds: string[] = [];
    await page.route(EMBED, (r) => { embeds.push(r.request().url()); return r.fulfill({ contentType: 'text/html', body: '<!doctype html><title>embed</title>' }); });
    await gotoStore(page, TE13);
    const c2 = card(page, 2);
    await c2.scrollIntoViewIfNeeded();
    await expect.poll(() => page.evaluate(() => !!customElements.get('video-card'))).toBe(true);
    expect(embeds).toEqual([]);
    await c2.getByTestId('video-card-poster').click();
    await expect(c2.locator('iframe')).toHaveAttribute('src', /youtube-nocookie\.com\/embed\//);
    await expect.poll(() => embeds.length).toBeGreaterThan(0);
    expect(page.url()).toContain('view=te13');
    await expect(card(page, 3).getByTestId('video-card-poster')).toBeVisible();
  });

  test('TC-31 AC3 3 ô số liệu chỉ trên template kiểm thử: đủ 3 ô; ô thiếu value ẩn', async ({ page }) => {
    await gotoStore(page, TE13);
    await expect(carousel(page).getByTestId('video-carousel-stat')).toHaveCount(3);
    await expect(carousel(page).getByTestId('video-carousel-stat').first()).toContainText('360+');
    await expect(carousel(page, 'te13-video-mixed').getByTestId('video-carousel-stat')).toHaveCount(1);
  });

  test('TC-32 AC4 tệp video lỗi: poster + link sản phẩm, thẻ giữ kích thước, chữ "Video unavailable. View {title}", thẻ khác không ảnh hưởng', async ({ page }) => {
    const errors = watchConsole(page);
    // 1 lần tải: CI 45265403257 lần mở /?view=te13 thứ 2 trong test bị Cloudflare chặn (4/4 lần).
    await fakeShopifyCard(page, 1);
    await page.route((u) => VIDEO_FILE.test(u.toString()), (r) => r.abort());
    await page.route(EMBED, (r) => r.fulfill({ contentType: 'text/html', body: '<!doctype html><title>embed</title>' }));
    await gotoStore(page, TE13);
    const c1 = card(page, 1);
    const productUrl = await c1.getAttribute('data-product-url');
    await c1.scrollIntoViewIfNeeded();
    const size = await box(c1.getByTestId('video-card-frame'));
    // Vào khung thì thẻ Shopify tạo <video preload=metadata>; tệp bị abort → lỗi, không cần bấm (bấm sau lỗi là đi theo link).
    await expect(c1).toHaveAttribute('data-video-error', '');
    await expect(c1.getByTestId('video-card-poster')).toBeVisible();
    if (productUrl) {
      await expect(c1.getByTestId('video-card-poster')).toHaveAttribute('href', productUrl);
      // {title} là card_title của blocks/video-card.liquid: alt video, không có mới tới tên sản phẩm (CI 45330318088: thẻ video thật
      // "Media đủ loại" gắn sản phẩm "Sale giá nhỏ"). Lấy title từ chuỗi Liquid in sẵn, đối chiếu tên nút play của cùng thẻ.
      const productTitle = (await c1.getByTestId('video-card-product-title').textContent())?.trim() ?? '';
      const [pre, post] = L.errorProduct.split('{{ title }}');
      const labelError = (await c1.getAttribute('data-label-error')) ?? '';
      expect(labelError.startsWith(pre) && labelError.endsWith(post), `data-label-error "${labelError}" theo locale error_product`).toBe(true);
      const title = labelError.slice(pre.length, labelError.length - post.length).trim();
      expect(title, 'title không rỗng').not.toBe('');
      const playLabel = await c1.getByTestId('video-card-toggle').getAttribute('data-label-play');
      // Thẻ thật: nút play Liquid in "Play video: {title}" cùng card_title. Thẻ giả (fakeShopifyCard, nút "Play" không title): title là alt hoặc tên sản phẩm.
      if (playLabel !== 'Play') expect(playLabel).toBe(L.play.replace('{{ title }}', title));
      else test.info().annotations.push({ type: 'TC-32 title thẻ giả', description: `${title} (tên sản phẩm: ${productTitle})` });
      await expect(c1.locator('[data-video-label]')).toHaveText(L.errorProduct.replace('{{ title }}', title));
    }
    await expect(c1.locator('video')).toHaveCount(0);
    near((await box(c1.getByTestId('video-card-frame'))).w, size.w, 1);
    near((await box(c1.getByTestId('video-card-frame'))).h, size.h, 1);
    if (productUrl) await expect(c1.getByTestId('video-card-product-title')).toHaveAttribute('href', productUrl);
    // Thẻ khác vẫn chạy.
    const c2 = card(page, 2);
    await c2.scrollIntoViewIfNeeded();
    await c2.getByTestId('video-card-poster').click();
    await expect(c2.locator('iframe')).toHaveCount(1);
    expect(await axeSerious(page), 'axe khi video lỗi').toEqual([]);
    expect(errors.filter((e) => e.startsWith('pageerror'))).toEqual([]);
  });
});

// =====================================================================================================================
// AC5 + ADR 0006/0010: JS thực tải. Lighthouse chạy bằng npx lhci autorun (ghi số vào test-cases.md).
// =====================================================================================================================
test.describe('ES1-T159 AC5 ngân sách JS', () => {
  for (const path of [HOME, TE13]) {
    test(`TC-33 AC5 ${path}: JS theme tải sẵn ≤ 40 960 B, sau cuộn hết trang ≤ 65 536 B`, async ({ page }) => {
      // ADR 0006: chỉ JS của theme (/t/<id>/assets/*.js), không tính script Shopify (load_feature, origin_trials,
      // shop_events_listener, partial_rendering, webmcp… cũng có /assets/ trong URL; CI 45265403257 đếm nhầm vào, 52 718 B).
      // Mỗi file lấy số lớn nhất của decodedBodySize, transferSize và `wc -c` tệp trong repo (ADR 0010 mục Đo), mỗi file 1 lần.
      const sum = async () => {
        const entries = await page.evaluate(() => (performance.getEntriesByType('resource') as PerformanceResourceTiming[])
          .map((e) => [e.name, Math.max(e.decodedBodySize || 0, e.transferSize || 0, e.encodedBodySize || 0)] as [string, number]));
        const files = new Map<string, number>();
        for (const [url, bytes] of entries) {
          const m = url.match(/\/t\/\d+\/assets\/([^/?#]+\.js)(?:[?#]|$)/);
          if (!m) continue;
          const local = existsSync(`assets/${m[1]}`) ? statSync(`assets/${m[1]}`).size : 0;
          files.set(m[1], Math.max(files.get(m[1]) ?? 0, bytes, local));
        }
        return { bytes: [...files.values()].reduce((a, b) => a + b, 0), files: [...files].map(([f, b]) => `${f} ${b}`) };
      };
      await gotoStore(page, path, { waitUntil: 'load' });
      // Tính cả import() lười đã kích lúc tải (phần tử trong 200px khung nhìn đầu), cùng cách ES1-T316.
      await page.waitForLoadState('networkidle');
      const pre = await sum();
      expect(pre.files.length, 'đọc được JS theme /t/<id>/assets/ trong Resource Timing').toBeGreaterThan(0);
      for (let y = 0; y < 40; y++) {
        await page.mouse.wheel(0, 800);
        await page.waitForTimeout(120);
        if (await page.evaluate(() => innerHeight + scrollY >= document.body.scrollHeight - 2)) break;
      }
      await page.waitForTimeout(1500);
      const post = await sum();
      test.info().annotations.push({ type: 'js-bytes', description: `${path}: tải sẵn ${pre.bytes} B [${pre.files.join(', ')}]; sau cuộn ${post.bytes} B [${post.files.join(', ')}]` });
      expect(pre.bytes).toBeLessThanOrEqual(40_960);
      expect(post.bytes).toBeLessThanOrEqual(65_536);
    });
  }
});

// =====================================================================================================================
// AC6, AC8, AC-H21: đo khối theo mốc (lệch ≤ 2 px). Chỉ chạy ở project desktop, đặt viewport từng mốc.
// =====================================================================================================================
test.describe('ES1-T159 AC6 AC8 đo theo mốc', () => {
  test.skip(({ isMobile }) => isMobile, 'Đo mốc đặt viewport riêng, chạy 1 lần ở project desktop');

  test('TC-34 AC6 360: 1 cột, ảnh 320 × 320, 2 nút dọc rộng hết cột, countdown Compact (ô 40, số 16)', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await gotoStore(page, STATES);
    const scope = featured(page, 'te13-a');
    const media = await box(scope.getByTestId('featured-product-media-item').first());
    near(media.w, 320); near(media.h, 320);
    const add = await box(scope.getByTestId('featured-product-add'));
    const detail = await box(scope.getByTestId('featured-product-view-detail'));
    expect(detail.y).toBeGreaterThan(add.y + add.h - 1);
    near(add.w, detail.w);
    near(add.w, 320);
    const frame = scope.getByTestId(CD);
    if (await frame.count()) {
      const cell = await box(frame.getByTestId(`${CD}-seconds`));
      near(cell.h, 40);
      expect(await frame.getByTestId(`${CD}-seconds`).evaluate((el) => getComputedStyle(el).fontSize)).toBe('16px');
    }
  });

  test('TC-35 AC6 768: ảnh 728 × 546 (4:3), spec 2 cột, 2 nút cùng hàng, countdown Regular (ô 44, số 18)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await gotoStore(page, STATES);
    const scope = featured(page, 'te13-a');
    const media = await box(scope.getByTestId('featured-product-media-item').first());
    near(media.w, 728); near(media.h, 546);
    const add = await box(scope.getByTestId('featured-product-add'));
    const detail = await box(scope.getByTestId('featured-product-view-detail'));
    near(add.y, detail.y);
    const frame = scope.getByTestId(CD);
    if (await frame.count()) {
      near((await box(frame.getByTestId(`${CD}-seconds`))).h, 44);
      expect(await frame.getByTestId(`${CD}-seconds`).evaluate((el) => getComputedStyle(el).fontSize)).toBe('18px');
    }
    const row = scope.getByTestId('featured-product-spec').first();
    if (await row.count()) near((await box(row.locator('th'))).y, (await box(row.locator('td'))).y);
  });

  test('TC-36 AC6 1280: 2 cột 580 | 80 | 580, ảnh 580 × 566', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoStore(page, STATES);
    const scope = featured(page, 'te13-a');
    const gallery = await box(scope.locator('product-media-gallery'));
    const details = await box(scope.locator('.featured-product__details'));
    near(gallery.w, 580); near(details.w, 580);
    near(details.x - (gallery.x + gallery.w), 80);
    const media = await box(scope.getByTestId('featured-product-media-item').first());
    near(media.w, 580); near(media.h, 566);
  });

  for (const w of [360, 768, 1280]) {
    test(`TC-37 AC8 ${w}: thẻ ${w === 360 ? 252 : 264}px, nút/thanh tiến trình đúng mốc, lộ thẻ kế`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: 900 });
      await gotoStore(page, TE13);
      const list = carousel(page).getByTestId('video-carousel-list');
      await list.scrollIntoViewIfNeeded();
      await expect.poll(() => page.evaluate(() => !!customElements.get('scroll-buttons'))).toBe(true);
      const cards = carousel(page).getByTestId('video-card-frame');
      const c1 = await box(cards.nth(0));
      near(c1.w, w === 360 ? 252 : 264);
      if (w === 360) {
        near(c1.h, 448);
        const c2 = await box(cards.nth(1));
        near(Math.min(w, c2.x + c2.w) - c2.x, 72);
        await expect(carousel(page).getByTestId('video-carousel-prev')).toBeHidden();
        await expect(carousel(page).getByTestId('video-carousel-next')).toBeHidden();
      } else {
        const prev = carousel(page).getByTestId('video-carousel-prev');
        const next = carousel(page).getByTestId('video-carousel-next');
        await expect(next).toBeVisible();
        await expect(next).toHaveAccessibleName('Next videos');
        await expect(prev).toHaveAccessibleName('Previous videos');
        near((await box(next)).w, 52); near((await box(next)).h, 52);
      }
      await expect(carousel(page).getByTestId('carousel-progress')).toBeVisible();
      if (w === 1280) {
        const c5 = await box(cards.nth(4));
        const c4 = await box(cards.nth(3));
        expect(c4.x + c4.w).toBeLessThanOrEqual(w);
        expect((Math.min(w, c5.x + c5.w) - c5.x) / c5.w).toBeGreaterThanOrEqual(0.25);
      }
    });
  }

  test('TC-38 AC8 nút play 52 giữa poster; thanh sản phẩm là link riêng ≥ 44px, tên không "…"', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoStore(page, TE13);
    const c = card(page, 6);
    await c.scrollIntoViewIfNeeded();
    const play = await box(c.getByTestId('video-card-play'));
    const frame = await box(c.getByTestId('video-card-frame'));
    near(play.w, 52); near(play.h, 52);
    near(play.x + play.w / 2, frame.x + frame.w / 2);
    near(play.y + play.h / 2, frame.y + frame.h / 2);
    const link = c.getByTestId('video-card-product-title');
    // Vùng bấm của link là ::after inset 0 phủ cả hàng sản phẩm (base.css .video-card__product-title::after), không phải hộp chữ:
    // đo khối chứa của ::after và hit-test 3 điểm (2 góc, giữa) đều trúng link. Hộp chữ 26px (CI 45265403257) không phải vùng bấm.
    await link.scrollIntoViewIfNeeded();
    const hit = await link.evaluate((el) => {
      const row = (el as HTMLElement).offsetParent as HTMLElement | null;
      if (!row || getComputedStyle(el, '::after').position !== 'absolute') return { h: 0, hits: [false] };
      const r = row.getBoundingClientRect();
      const pts = [[r.left + 3, r.top + 3], [r.left + r.width / 2, r.top + r.height / 2], [r.right - 3, r.bottom - 3]];
      return { h: r.height, hits: pts.map(([x, y]) => document.elementFromPoint(x, y)?.closest('a') === el) };
    });
    expect(hit.h, 'chiều cao vùng bấm link sản phẩm').toBeGreaterThanOrEqual(44);
    expect(hit.hits, 'mọi điểm trong hàng sản phẩm trúng link').toEqual(hit.hits.map(() => true));
    const cut = await link.evaluate((el) => ({ over: getComputedStyle(el).textOverflow, clipped: el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1 }));
    expect(cut.over).not.toBe('ellipsis');
    expect(cut.clipped).toBe(false);
  });

  test('TC-39 AC8 bấm video Shopify: phát tại chỗ, tên nút đổi "Pause video: {title}"', async ({ page }) => {
    await stubMedia(page);
    await page.route(FAKE_VIDEO, () => {});
    await gotoStore(page, TE13);
    const real = (await card(page, 1).getAttribute('data-video-kind')) === 'shopify';
    if (!real) { await fakeShopifyCard(page, 1); await gotoStore(page, TE13); }
    const c1 = card(page, 1);
    await c1.scrollIntoViewIfNeeded();
    await expect.poll(() => page.evaluate(() => !!customElements.get('video-card'))).toBe(true);
    await c1.getByTestId('video-card-poster').click();
    const toggle = c1.getByTestId('video-card-toggle');
    await expect(toggle).toBeVisible();
    if (real) {
      const title = (await c1.locator('[data-video-label]').textContent())?.replace(/^.*?:\s*/, '').trim() ?? '';
      await expect(toggle).toHaveAccessibleName(L.pause.replace('{{ title }}', title));
    } else await expect(toggle).toHaveAccessibleName('Pause');
    expect(await axeSerious(page), 'axe khi video chạy').toEqual([]);
  });

  test('TC-40 AC-H21 1920 trang chủ (fixture): 6 thẻ 264 × 554, không số liệu, link, nhãn; poster, bấm mới chạy', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await gotoStore(page, HOME);
    test.skip(!(await fixtureApplied(page)), 'store dev chưa áp fixture nội dung Figma (ES1-T331)');
    const root = band(page, 'home-video-carousel').getByTestId('video-carousel');
    await expect(root.getByTestId('video-card')).toHaveCount(6);
    for (let i = 0; i < 6; i++) {
      const b = await box(root.getByTestId('video-card').nth(i));
      near(b.w, 264); near(b.h, 554);
    }
    await expect(root.getByTestId('video-carousel-stat')).toHaveCount(0);
    await expect(root.getByTestId('video-carousel-link')).toHaveCount(0);
    await expect(root.getByTestId('video-carousel-subheading')).toHaveCount(0);
    await expect(root.locator('video, iframe')).toHaveCount(0);
    await expect(root.getByTestId('video-card-poster').first()).toBeVisible();
  });

  test('TC-41 AC-H23 trang chủ (fixture): countdown < 24 giờ ẩn ô ngày; quá hạn thì không có', async ({ page }) => {
    await gotoStore(page, HOME);
    test.skip(!(await fixtureApplied(page)), 'store dev chưa áp fixture nội dung Figma (ES1-T331)');
    const frame = band(page, 'home-featured-product').getByTestId(CD);
    test.skip((await frame.count()) === 0, 'Sản phẩm featured không có ngày còn hạn hoặc không giá gạch: không có countdown (đúng R8), dữ liệu < 24 giờ chưa có');
    const left = Number(await frame.getAttribute('data-end')) - Date.now() / 1000;
    test.skip(left >= 86400, `metafield còn ${Math.round(left / 3600)} giờ, không thuộc case < 24 giờ`);
    await expect(frame.getByTestId(`${CD}-days`)).toBeHidden();
  });
});

// =====================================================================================================================
// Bàn phím (R12).
// =====================================================================================================================
test.describe('ES1-T159 bàn phím', () => {
  test.skip(({ isMobile }) => isMobile, 'Pixel 7 không có bàn phím vật lý');

  test('TC-42 Tab qua thumbnail, bộ chọn, Add to cart, View detail theo thứ tự', async ({ page }) => {
    await gotoStore(page, TE13);
    const scope = featured(page, 'te13-a');
    const order: string[] = [];
    await scope.getByTestId('featured-product-media').focus();
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press('Tab');
      const t = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el?.closest('featured-product')) return 'out';
        return el.dataset.testid ?? (el.closest('[data-testid]') as HTMLElement | null)?.dataset.testid ?? el.tagName;
      });
      if (t === 'out') break;
      order.push(t);
    }
    if ((await scope.getByTestId('featured-product-thumbnail').count()) > 1) expect(order).toContain('featured-product-thumbnail');
    if (await scope.getByTestId('product-variant-picker').count()) expect(order.some((t) => /product-option/.test(t))).toBe(true);
    const iAdd = order.indexOf('featured-product-add');
    const iDetail = order.indexOf('featured-product-view-detail');
    expect(iAdd).toBeGreaterThanOrEqual(0);
    expect(iDetail).toBeGreaterThan(iAdd);
  });

  test('TC-43 Tab tới poster từng thẻ; Enter trên poster external chạy video tại chỗ, focus vào iframe', async ({ page }) => {
    await page.route(EMBED, (r) => r.fulfill({ contentType: 'text/html', body: '<!doctype html><title>embed</title>' }));
    await gotoStore(page, TE13);
    const posters = carousel(page).getByTestId('video-card-poster');
    const n = await posters.count();
    await carousel(page).getByTestId('video-carousel-list').focus();
    const reached = new Set<number>();
    for (let i = 0; i < n * 3 && reached.size < n; i++) {
      await page.keyboard.press('Tab');
      const idx = await posters.evaluateAll((els) => els.indexOf(document.activeElement as Element));
      if (idx >= 0) reached.add(idx);
    }
    expect(reached.size).toBe(n);
    const c2 = card(page, 2);
    await expect.poll(() => page.evaluate(() => !!customElements.get('video-card'))).toBe(true);
    await c2.getByTestId('video-card-poster').focus();
    await page.keyboard.press('Enter');
    await expect(c2.locator('iframe')).toBeFocused();
  });

  test('TC-44 Danh sách video nhận focus, phím mũi tên cuộn ngang', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoStore(page, TE13);
    const list = carousel(page).getByTestId('video-carousel-list');
    await list.focus();
    await expect(list).toBeFocused();
    const before = await list.evaluate((el) => el.scrollLeft);
    for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowRight');
    await expect.poll(() => list.evaluate((el) => el.scrollLeft)).toBeGreaterThan(before);
  });
});

// =====================================================================================================================
// Không JS.
// =====================================================================================================================
test.describe('ES1-T159 nojs', () => {
  test.use({ javaScriptEnabled: false });

  test('TC-45 nojs: không thấy countdown (không số đứng yên), khối không chiếm chỗ', async ({ page }) => {
    await gotoStore(page, STATES, { waitUntil: 'domcontentloaded' });
    const host = featured(page, 'te13-a').locator('sale-countdown');
    if (await host.count()) {
      await expect(host).toBeHidden();
      expect((await box(host)).h).toBe(0);
    }
    await expect(page.locator('[data-sale-countdown]:visible')).toHaveCount(0);
  });

  test('TC-46 nojs: thumbnail là link trong trang, bấm thì URL có hash tới media', async ({ page }) => {
    await gotoStore(page, TE13, { waitUntil: 'domcontentloaded' });
    const thumbs = featured(page, 'te13-a').getByTestId('featured-product-thumbnail');
    test.skip((await thumbs.count()) < 2, 'Sản phẩm band A dưới 2 media');
    const href = (await thumbs.nth(1).getAttribute('href'))!;
    await thumbs.nth(1).click();
    await expect(page).toHaveURL(new RegExp(`${href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`));
    await expect(page.locator(href)).toBeAttached();
  });

  test('TC-47 nojs: thêm giỏ bằng form POST đúng biến thể hiện tại', async ({ page }) => {
    await skipIfStoreBlocked('store dev chặn POST /cart/add (môi trường)', async () => {
      await gotoStore(page, TE13, { waitUntil: 'domcontentloaded' });
      const scope = featured(page, 'te13-a');
      const add = scope.getByTestId('featured-product-add');
      test.skip(await add.isDisabled(), 'Biến thể hiện tại hết hàng');
      const form = buyForm(scope);
      await expect(form).toHaveAttribute('method', /post/i);
      expect(await form.getAttribute('action')).toMatch(/\/cart\/add/);
      await expect(scope.locator('select[name="id"]')).toHaveCount(0);
      const id = await currentId(scope);
      // clickAndLoad: POST bị Cloudflare thử thách thì báo "bị Cloudflare chặn" (skipIfStoreBlocked nhận), không treo waitForURL.
      await clickAndLoad(page, () => add.click());
      await expect(page).toHaveURL(/\/cart(\?|$)/);
      const cart = await readCartNoScript<{ items: { variant_id: number }[] }>(page);
      expect(cart.items.map((i) => i.variant_id)).toContain(id);
    });
  });

  test('TC-48 nojs: poster là link (YouTube/Vimeo tới trang video, Shopify tới sản phẩm); link sản phẩm bấm được', async ({ page }) => {
    await gotoStore(page, TE13, { waitUntil: 'domcontentloaded' });
    await expect(card(page, 2).getByTestId('video-card-poster')).toHaveAttribute('href', /youtube\.com\/watch\?v=/);
    await expect(card(page, 3).getByTestId('video-card-poster')).toHaveAttribute('href', /vimeo\.com\/\d+/);
    if ((await card(page, 1).getAttribute('data-video-kind')) === 'shopify') {
      await expect(card(page, 1).getByTestId('video-card-poster')).toHaveAttribute('href', (await card(page, 1).getAttribute('data-product-url'))!);
    }
    await expect(carousel(page).locator('video, iframe')).toHaveCount(0);
    const link = card(page, 6).getByTestId('video-card-product-title');
    const href = (await link.getAttribute('href'))!;
    await link.click();
    await expect(page).toHaveURL(new RegExp(`${href.split('?')[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
  });
});

// =====================================================================================================================
// Module lỗi: chặn cả 5 file JS của TE-13 cùng lúc.
// CI 45265403257, 45330318088: chặn lần lượt từng module = 5 test × 2 lần mở trang (10 lần mỗi project) liên tiếp làm store dev bật Cloudflare (cf-mitigated).
// 5 module không import nhau (chỉ customElements, sự kiện DOM); fallback của mỗi module (form POST, poster href) không cần module khác,
// nên chặn cùng lúc vẫn kiểm đủ từng fallback. 2 test, mỗi test mở 1 trang: STATES (form band A, trạng thái countdown), TE13 (form, poster).
// =====================================================================================================================
test.describe('ES1-T159 module lỗi', () => {
  // Chặn 5 module, ghi module nào đã thật sự được gọi (module nạp lười theo viewport hoặc tương tác).
  const blockModules = async (page: Page) => {
    const aborted = new Set<string>();
    await page.route(new RegExp(`/assets/(${MODULES.join('|')})\\.js`), (r) => {
      aborted.add(new URL(r.request().url()).pathname.replace(/^.*\//, '').replace(/\.js$/, ''));
      return r.abort();
    });
    return aborted;
  };
  const noteAborted = (aborted: Set<string>) => test.info().annotations.push({ type: 'module bị chặn', description: [...aborted].sort().join(', ') || '(không)' });

  test(`TC-49 chặn ${MODULES.join(', ')}.js trên STATES: form mua có action POST, 0 pageerror`, async ({ page }) => {
    const errors = watchConsole(page);
    const aborted = await blockModules(page);
    await gotoStore(page, STATES);
    const scope = featured(page, 'te13-a');
    await scope.scrollIntoViewIfNeeded();
    await wakeBuy(scope);
    await expect(buyForm(scope)).toHaveAttribute('method', /post/i);
    // featured-product.js, sale-countdown.js gắn vô điều kiện, nạp theo viewport: phải đã bị gọi và chặn, không thì test không kiểm gì.
    await expect.poll(() => ['featured-product', 'sale-countdown'].filter((m) => !aborted.has(m)), 'module chưa bị gọi').toEqual([]);
    const frame = scope.getByTestId(CD);
    // KHÔNG CHẮC (ES1-T608): ui-spec countdown §5 K0 in số Liquid ngay; module lỗi thì số đứng yên. Ghi trạng thái, chưa assert.
    test.info().annotations.push({ type: 'sale-countdown lỗi', description: `khung ${await frame.count() ? (await frame.isVisible() ? 'hiện (số đứng yên)' : 'ẩn') : 'không có'}` });
    noteAborted(aborted);
    expect(errors.filter((e) => e.startsWith('pageerror'))).toEqual([]);
  });

  test(`TC-49 chặn ${MODULES.join(', ')}.js trên TE13: form mua POST, poster vẫn là link, bấm đi theo link, 0 pageerror`, async ({ page }) => {
    const errors = watchConsole(page);
    const aborted = await blockModules(page);
    await page.route(EMBED, (r) => r.abort());
    const stub = { contentType: 'text/html', body: '<!doctype html><title>watch</title>' };
    await page.route(/youtube\.com\/watch/, (r) => r.fulfill(stub));
    // ES1-T617: storefront Shopify có lúc đổi link ra ngoài thành /url?q=<href>&trigger=click (307 về chính nó rồi store dev trả 429 cf-mitigated),
    // nên request youtube không bao giờ tới (CI 45530422209 mobile). Trả trang giả tại chỗ: không chạm store, không gặp thử thách.
    await page.route((u) => u.pathname === '/url' && u.searchParams.has('q'), (r) => r.fulfill(stub));
    await gotoStore(page, TE13);
    const scope = featured(page, 'te13-a');
    await scope.scrollIntoViewIfNeeded();
    await wakeBuy(scope);
    await expect(buyForm(scope)).toHaveAttribute('method', /post/i);
    await carousel(page).scrollIntoViewIfNeeded();
    await expect.poll(() => aborted.has('video-carousel'), 'video-carousel.js đã bị gọi và chặn').toBe(true);
    const poster = card(page, 2).getByTestId('video-card-poster');
    await expect(poster).toHaveAttribute('href', /youtube\.com\/watch/);
    const href = (await poster.getAttribute('href'))!;
    const store = new URL(page.url()).origin;
    // Không module: bấm poster đi theo link (không chặn mặc định) = khung chính điều hướng tới đúng href,
    // trực tiếp hoặc qua bộ chuyển hướng link ra ngoài của Shopify (/url?q=href, cùng origin store).
    const followsHref = (r: Request) => {
      if (!r.isNavigationRequest() || r.frame() !== page.mainFrame()) return false;
      if (r.url() === href) return true;
      const u = new URL(r.url());
      return u.origin === store && u.pathname === '/url' && u.searchParams.get('q') === href;
    };
    const [req] = await Promise.all([page.waitForRequest(followsHref, { timeout: 15_000 }).catch(() => null), poster.click()]);
    expect(req, `poster đi theo href khi video-carousel.js lỗi (${href})`).not.toBeNull();
    noteAborted(aborted);
    expect(errors.filter((e) => e.startsWith('pageerror'))).toEqual([]);
  });

  test('TC-50 chặn product-form.js: bấm Add to cart vẫn thêm giỏ bằng form POST (tới /cart)', async ({ page }) => {
    await skipIfStoreBlocked('store dev chặn POST /cart/add (môi trường)', async () => {
      await page.route(/\/assets\/product-form\.js/, (r) => r.abort());
      await gotoStore(page, TE13);
      const scope = featured(page, 'te13-a');
      const add = scope.getByTestId('featured-product-add');
      test.skip(await add.isDisabled(), 'Biến thể đầu hết hàng');
      const id = await currentId(scope);
      await scope.scrollIntoViewIfNeeded();
      await clickAndLoad(page, () => add.click());
      await expect(page).toHaveURL(/\/cart(\?|$)/);
      const cart = await readCartJson<{ items: { variant_id: number }[] }>(page);
      expect(cart.items.map((i) => i.variant_id)).toContain(id);
    });
  });
});

// =====================================================================================================================
// Chất lượng: axe lúc tải, 0 console error.
// =====================================================================================================================
test.describe('ES1-T159 chất lượng', () => {
  test('TC-51 /?view=te13 lúc tải và sau cuộn: axe 0 serious/critical, 0 console error', async ({ page }) => {
    const errors = watchConsole(page);
    await page.route(EMBED, (r) => r.abort());
    await gotoStore(page, TE13, { waitUntil: 'load' });
    expect(await axeSerious(page), 'axe lúc tải').toEqual([]);
    await carousel(page).scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    expect(await axeSerious(page), 'axe sau cuộn').toEqual([]);
    expect(errors).toEqual([]);
  });
});
