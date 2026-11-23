// KHÔNG CHẮC: spec chưa chạy, chưa type-check (phiên viết không có trình duyệt và preview; CTO 06/11: e2e tắt tới khi trang chủ xong).
// Ticket ES1-T158 TE-13-BE1: assets/featured-product.js, video-carousel.js, product-variant-picker.js (docs/srs.md#TE-13 AC1-AC4, AC-H22, AC-H23; drafts/techlead/ES1-T142/task-split.md D2, D4, D5, D6, D8, D10; plan ES1-T169 D4).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T158.spec.ts -g "AC1|AC2|AC3|AC4"
// /?view=te13: 1 featured product, partial. /?view=te13-states: nhiều block (D4): tên partial trùng nên band tự thay giá, JSON 1 biến thể, nút (featured-product.js swap).
// ES1-T350 (ADR 0008): không còn JSON danh sách biến thể; radio value = id option value, gửi ?option_values=. Dữ liệu biến thể từ /products/<handle>.js trong trang (ES1-T74).
// Đổi HTML bằng init script ở readystatechange đầu tiên (trước khi module chạy), không dùng route.fetch: store có thể trả trang chặn cho request lặp (plan ES1-T169 nhóm A).
// Video: store có thể chưa có video Shopify (ES1-T153) nên đổi thẻ YouTube thành thẻ kind shopify với URL giả; play, pause của media được stub vì không có tệp thật.
import { readFileSync, statSync } from 'node:fs';
import { test, expect, type Locator, type Page, type Request } from './support/test';
import AxeBuilder from '@axe-core/playwright';
import { CART_GLOB, themeAdd } from './support/cart-api';
import { watchShopPay403 } from './support/console-guard';
import { pageJson, readCartJson, requireJson } from './support/product-data';
import { checkedNames, chooseOptions, legendNames, setCheckedByName } from './support/variant-picker';
import { gotoStore, watchStore, expectNotChallenged, skipIfStoreBlocked } from './support/store-guard';

const TE13 = '/?view=te13';
const STATES = '/?view=te13-states';
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];
const MODULES = { featured: /\/featured-product\.js/, video: /\/video-carousel\.js/, form: /\/product-form\.js/, picker: /\/product-variant-picker\.js/ };
const FAKE_VIDEO = 'https://cdn.shopify.com/videos/c/vp/es1-t158/fake.mp4';
const EMBED = /youtube-nocookie\.com|player\.vimeo\.com/;
const COUNTDOWN = 'featured-product-countdown';

type Variant = { id: number; options: string[]; available: boolean; price: number; compare_at_price: number | null; featured_media: { id: number } | null };
type Units = { days: string; hours: string; minutes: string; seconds: string };

const band = (page: Page, id: string) => page.getByTestId(`container-${id}`);
const card = (page: Page, n: number) => page.locator(`[data-video-card-id="te13-video-${n}"]`).locator('video-card');
const isFetch = (request: Request) => new URL(request.url()).searchParams.get('view') === 'featured-product';
// Tiền trên trang → cents (như TE-4.spec.ts).
function cents(value: string | null): number {
  const m = (value ?? '').match(/\d[\d.,\s  ']*/);
  if (!m) return NaN;
  const t = m[0].replace(/[\s  ']/g, '').replace(/[.,]+$/, '');
  const last = Math.max(t.lastIndexOf('.'), t.lastIndexOf(','));
  const n = last >= 0 && t.length - last - 1 !== 3 ? Number(`${t.slice(0, last).replace(/[.,]/g, '')}.${t.slice(last + 1)}`) : Number(t.replace(/[.,]/g, ''));
  return Math.round(n * 100);
}
const isOptionFetch = (request: Request) => isFetch(request) && new URL(request.url()).searchParams.has('option_values');

function watchConsole(page: Page) {
  const errors: string[] = [];
  const isShopPay403 = watchShopPay403(page);
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    if (isShopPay403(msg)) return;
    // Tệp video bị route.abort, iframe embed bị chặn: log mạng do test tạo ra.
    if (/Failed to load resource/.test(msg.text()) && /fake\.mp4|youtube|vimeo/.test(msg.location().url)) return;
    if (IGNORE_CONSOLE.some((r) => r.test(msg.text()) || r.test(msg.location().url))) return;
    errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

/** Chạy fn khi HTML đã parse xong, trước module (deferred). */
async function beforeModules(page: Page, fn: (arg: unknown) => void, arg?: unknown) {
  // Init script chạy cả trong iframe: chỉ đổi trang chính.
  await page.addInitScript({
    content: `if (window === window.top) document.addEventListener('readystatechange', () => (${fn.toString()})(${JSON.stringify(arg ?? null)}), { once: true });`,
  });
}

const setEnd = (page: Page, end: number) =>
  beforeModules(
    page,
    (value) => {
      for (const el of document.querySelectorAll('[data-end]')) (el as HTMLElement).dataset.end = String(value);
    },
    end,
  );

const pushFarBelow = (page: Page) =>
  beforeModules(page, () => {
    const style = document.createElement('style');
    style.textContent = 'featured-product,[data-testid="video-carousel"]{margin-block-start:400vh}';
    document.head.append(style);
  });

/** Thẻ YouTube thành thẻ video Shopify giả; đặt trước module. */
const fakeShopifyCards = (page: Page, ids: number[]) =>
  beforeModules(
    page,
    (value) => {
      const { ids, src } = value as { ids: number[]; src: string };
      for (const n of ids) {
        const el = document.querySelector(`[data-video-card-id="te13-video-${n}"] video-card`) as HTMLElement;
        el.dataset.videoKind = 'shopify';
        el.querySelector('template')!.innerHTML = `<video class="video-card__media" controls playsinline preload="metadata" aria-label="Demo"><source src="${src}" type="video/mp4"></video>`;
      }
    },
    { ids, src: FAKE_VIDEO },
  );

/** Không có tệp thật: stub play, pause, đếm số lần play. */
const stubMedia = (page: Page) =>
  page.addInitScript(() => {
    const state = { plays: 0 };
    (window as unknown as { __media: typeof state }).__media = state;
    const proto = HTMLMediaElement.prototype as unknown as { __on?: boolean };
    HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) {
      state.plays += 1;
      (this as unknown as { __on: boolean }).__on = true;
      this.dispatchEvent(new Event('play'));
      return Promise.resolve();
    };
    HTMLMediaElement.prototype.pause = function (this: HTMLMediaElement) {
      (this as unknown as { __on: boolean }).__on = false;
    };
    Object.defineProperty(proto, 'paused', {
      get(this: { __on?: boolean }) {
        return !this.__on;
      },
    });
  });

const plays = (page: Page) => page.evaluate(() => (window as unknown as { __media: { plays: number } }).__media.plays);
const height = (el: Locator) => el.evaluate((node) => node.getBoundingClientRect().height);
const isPaused = (scope: Locator) => scope.locator('video').evaluate((el) => (el as HTMLVideoElement).paused);

// Yêu cầu tệp giả treo: không có error, không có tải.
const holdVideo = (page: Page) => page.route(FAKE_VIDEO, () => {});

async function units(box: Locator): Promise<Units> {
  const read = async (name: string) => (await box.getByTestId(`${COUNTDOWN}-${name}`).locator('[data-countdown-value]').textContent()) ?? '';
  return { days: await read('days'), hours: await read('hours'), minutes: await read('minutes'), seconds: await read('seconds') };
}

const fromClock = (page: Page, end: number) =>
  page.evaluate((value) => {
    const s = Math.trunc(value - Date.now() / 1000);
    const pad = (n: number) => String(Math.floor(n)).padStart(2, '0');
    return { days: pad(s / 86400), hours: pad((s % 86400) / 3600), minutes: pad((s % 3600) / 60), seconds: pad(s % 60) };
  }, end);

const total = (u: Units) => Number(u.days) * 86400 + Number(u.hours) * 3600 + Number(u.minutes) * 60 + Number(u.seconds);

/** Đồng hồ giả, data-end cố định theo đồng hồ đó. Band A cần có khung countdown. */
async function openCountdown(page: Page, left: number) {
  const start = Date.now();
  const end = Math.floor(start / 1000) + left;
  await page.clock.install({ time: start });
  await setEnd(page, end);
  await page.goto(TE13);
  const root = band(page, 'te13-a').getByTestId('featured-product');
  const box = root.getByTestId(COUNTDOWN);
  test.skip((await box.count()) === 0, 'Sản phẩm band A không có giá gạch ở variant đầu (te13-featured, ES1-T153)');
  await expect(root).toHaveAttribute('data-enhanced', '');
  // ES1-T344 (ADR 0009): đếm ở assets/sale-countdown.js, nạp lười khi .featured-product__summary gần khung nhìn.
  // Timer chỉ chạy khi khung trong viewport; Pixel 7 có gallery ở trên. Observer chạy theo frame thật.
  await box.scrollIntoViewIfNeeded();
  await expect.poll(() => page.evaluate(() => !!customElements.get('sale-countdown'))).toBe(true);
  if (left > 0) {
    await expect(box).toBeInViewport();
    await page.waitForTimeout(300);
  }
  return { root, box, end };
}

/** Dừng đồng hồ từ thời điểm hiện tại: tải trang có thể lâu nên không tính từ lúc install. */
async function pause(page: Page) {
  await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 1000);
}

async function readVariants(scope: Locator) {
  const path = (await scope.locator('product-form').getAttribute('data-product-url'))!.split('?')[0];
  return requireJson(await pageJson<{ variants: Variant[] }>(scope.page(), `${path}.js`), `${path}.js`).variants;
}

async function otherVariant(scope: Locator, want: (v: Variant) => boolean = (v) => v.available) {
  const id = Number(await scope.locator('input[type="hidden"][name="id"]').inputValue());
  const variants = await readVariants(scope);
  return { current: variants.find((v) => v.id === id)!, next: variants.find((v) => v.id !== id && want(v)) };
}

/** Chọn biến thể, trả số lần bấm thật (= số request ?option_values= phải có). */
function choose(scope: Locator, variant: Variant) {
  return chooseOptions(scope, variant.options);
}

/** Giá, % giảm của band khớp biến thể (thay so price_html của JSON cũ). */
async function expectPrice(scope: Locator, variant: Variant) {
  const price = scope.getByTestId('featured-product-price');
  await expect.poll(async () => cents(await price.getByTestId('price-regular').first().textContent())).toBe(variant.price);
  await expect(scope.getByTestId('featured-product-discount')).toHaveCount(variant.compare_at_price && variant.compare_at_price > variant.price ? 1 : 0);
}

// ES1-T344 (ADR 0010 bảng trang chủ): picker + product-form của featured nạp lười theo tương tác vùng mua
// (pointerenter/focusin/touchstart), không theo viewport như ES1-T139. Rê vào nút mua: pointerenter tới cả
// product-form và .featured-product__details (chứa picker). Markup picker hiện từ khi featured-product defined
// (featured-product.css), module picker chỉ nạp khi tương tác: test đổi lựa chọn phải tương tác trước.
async function wakeBuy(scope: Locator) {
  await scope.getByTestId('featured-product-add').hover();
}

async function openPicker(page: Page, url: string, bandId: string) {
  const scope = band(page, bandId);
  await page.goto(url);
  await scope.getByTestId('featured-product').scrollIntoViewIfNeeded();
  const picker = scope.getByTestId('product-variant-picker');
  test.skip((await picker.count()) === 0, 'Sản phẩm không có nhiều variant');
  await wakeBuy(scope);
  await expect(picker).toBeVisible();
  return scope;
}

test.describe('ES1-T158 tĩnh', () => {
  test('AC2 trần byte, không storage, không log, hook khớp Liquid', () => {
    for (const [file, max] of [['assets/featured-product.js', 2304], ['assets/video-carousel.js', 3300], ['assets/product-variant-picker.js', 7168]] as const) {
      expect(statSync(file).size, file).toBeLessThanOrEqual(max);
      expect(readFileSync(file, 'utf8'), file).not.toMatch(/localStorage|sessionStorage|document\.cookie|console\./);
    }
    const js = readFileSync('assets/featured-product.js', 'utf8');
    expect(js).not.toMatch(/searchParams|location/); // Không nhận tham số reset (R8).
    expect(readFileSync('assets/video-carousel.js', 'utf8')).not.toMatch(/autoplay|\.play\(\)[^.]/);
  });

  test('AC3 chỉ thêm 1 thẻ script lazy-module; design_mode không nạp form, picker', () => {
    const featured = readFileSync('blocks/featured-product.liquid', 'utf8');
    const carousel = readFileSync('blocks/video-carousel.liquid', 'utf8');
    const lazy = [`<script src="{{ 'lazy-module.js' | asset_url }}" type="module">`];
    expect(featured.match(/<script[^>]*>/g)).toEqual(lazy);
    expect(carousel.match(/<script[^>]*>/g)).toEqual(lazy);
    expect(featured).toContain(`data-lazy-module="{{ 'featured-product.js' | asset_url }}"`);
    expect(carousel).toContain(`data-lazy-module="{{ 'video-carousel.js' | asset_url }}"`);
    expect(featured).toMatch(/{% unless request\.design_mode %}\s*data-lazy-module="{{ 'product-form\.js' \| asset_url }}"\s*{% endunless %}/);
    expect(featured).toMatch(/{% unless request\.design_mode or featured\.requires_selling_plan %}\s*data-lazy-module="{{ 'product-variant-picker\.js' \| asset_url }}"\s*{% endunless %}/);
    // Picker display none khi chưa defined (base.css): observer không bao giờ báo giao, module sẽ không nạp.
    expect(readFileSync('snippets/product-variant-picker.liquid', 'utf8')).not.toMatch(/data-lazy-module=/);
  });

  // ES1-T350 review #1 (ADR 0008 mục 3): bộ chọn của featured nằm trong partial product-options (snippet bọc khi regions có tên này).
  test('AC2 contract partial: 3 tên trong data-regions khớp {% partial %} của block + product-options của snippet', () => {
    const liquid = readFileSync('blocks/featured-product.liquid', 'utf8');
    const snippet = readFileSync('snippets/product-variant-picker.liquid', 'utf8');
    const regions = liquid.match(/regions: '([^']+)'/)?.[1].split(' ').sort();
    expect(regions).toEqual(['product-buy-buttons', 'product-options', 'product-price']);
    expect(snippet).toMatch(/{%-?\s*if fetch_url == blank or regions contains 'product-options'\s*-?%}\s*{%-?\s*partial 'product-options'/);
    expect(regions).toEqual([...liquid.matchAll(/{%-?\s*partial\s+'([^']+)'/g)].map((m) => m[1]).concat('product-options').sort());
  });
});

test.describe('ES1-T158 AC1 countdown', () => {
  test('AC1 số giảm đúng theo đồng hồ, không cộng dồn', async ({ page }) => {
    const { box, end } = await openCountdown(page, 90061);
    await pause(page);
    await page.clock.runFor(1000);
    const first = await units(box);
    expect(first).toEqual(await fromClock(page, end));
    await expect(box).toBeVisible();

    await page.clock.runFor(1000);
    const second = await units(box);
    expect(total(first) - total(second)).toBe(1);
    await page.clock.runFor(60000);
    expect(total(second) - total(await units(box))).toBe(60);
  });

  test('AC1 AC-H23 dưới 1 ngày: ô ngày ẩn, 3 ô còn lại 2 chữ số', async ({ page }) => {
    const { box } = await openCountdown(page, 3 * 3600 + 5);
    await expect(box.getByTestId(`${COUNTDOWN}-days`)).toBeHidden();
    for (const name of ['hours', 'minutes', 'seconds']) {
      await expect(box.getByTestId(`${COUNTDOWN}-${name}`)).toBeVisible();
      await expect(box.getByTestId(`${COUNTDOWN}-${name}`).locator('[data-countdown-value]')).toHaveText(/^\d{2}$/);
      await expect(box.getByTestId(`${COUNTDOWN}-${name}`).locator('.visually-hidden')).not.toBeEmpty();
    }
  });

  test('AC1 reload không reset; 0 khoá countdown trong storage', async ({ page }) => {
    const { box, end } = await openCountdown(page, 90061);
    await pause(page);
    await page.clock.runFor(1000);
    const before = await units(box);
    await page.reload();
    await expect(band(page, 'te13-a').getByTestId('featured-product')).toHaveAttribute('data-enhanced', '');
    const after = await units(box);
    expect(after).toEqual(await fromClock(page, end));
    expect(total(after)).toBeLessThanOrEqual(total(before));

    const keys = await page.evaluate(() => [...Object.keys(localStorage), ...Object.keys(sessionStorage), document.cookie]);
    expect(keys.filter((key) => /countdown|featured|deadline|timer/i.test(key))).toEqual([]);
  });

  // ES1-T344: ADR 0009 / TE-4 AC17 K3 thay hành vi ẩn khung cũ: giữ khung, chữ "This sale has ended", không đếm lại.
  test('AC1 tua qua giờ kết thúc: K3 ended, không đếm lại kể cả khi đồng hồ chạy tiếp', async ({ page }) => {
    const { box } = await openCountdown(page, 120);
    await expect(box).toBeVisible();
    await page.clock.fastForward(121000);
    await expect(box).toHaveAttribute('data-state', 'ended');
    await expect(box).toBeVisible();
    await expect(box.locator('[data-countdown-unit]')).toHaveCount(0);
    await page.clock.fastForward(60000);
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
    await expect(box).toHaveAttribute('data-state', 'ended');
    await expect(box.locator('[data-countdown-unit]')).toHaveCount(0);
  });

  test('AC1 đồng hồ đã quá hạn khi tải (trang cache): chuyển ngay K3, vẫn data-enhanced', async ({ page }) => {
    const { root, box } = await openCountdown(page, -5);
    await expect(root).toHaveAttribute('data-enhanced', '');
    await expect(box).toHaveAttribute('data-state', 'ended');
    await expect(box.locator('[data-countdown-unit]')).toHaveCount(0);
  });

  test('AC1 tab ẩn thì dừng, quay lại tính lại ngay', async ({ page }) => {
    const { box, end } = await openCountdown(page, 90061);
    await pause(page);
    await page.clock.runFor(1000);
    const setHidden = (hidden: boolean) =>
      page.evaluate((value) => {
        Object.defineProperty(document, 'hidden', { configurable: true, get: () => value });
        document.dispatchEvent(new Event('visibilitychange'));
      }, hidden);

    await setHidden(true);
    const frozen = await units(box);
    await page.clock.runFor(10000);
    expect(await units(box)).toEqual(frozen);

    await setHidden(false);
    expect(await units(box)).toEqual(await fromClock(page, end));
  });

  test('AC1 ra khỏi khung thì dừng, vào lại tính lại ngay', async ({ page }) => {
    const { box, end } = await openCountdown(page, 90061);
    await pause(page);
    await page.clock.runFor(1000);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(box).not.toBeInViewport();
    await page.waitForTimeout(300); // Observer chạy theo frame thật.
    const frozen = await units(box);
    await page.clock.runFor(10000);
    expect(await units(box)).toEqual(frozen);

    await box.scrollIntoViewIfNeeded();
    await expect.poll(async () => JSON.stringify(await units(box))).toBe(JSON.stringify(await fromClock(page, end)));
  });

  test('AC1 không có khung countdown: gallery vẫn chạy, có data-enhanced', async ({ page }) => {
    await page.goto(STATES);
    const scope = band(page, 'te13-e');
    await scope.getByTestId('featured-product').scrollIntoViewIfNeeded();
    await expect(scope.getByTestId(COUNTDOWN)).toHaveCount(0);
    await expect(scope.getByTestId('featured-product')).toHaveAttribute('data-enhanced', '');
  });
});

test.describe('ES1-T158 AC2 1 block: partial', () => {
  test('AC2 AC-H22 đổi variant: giá, % giảm, nút, id, legend đổi; URL giữ; 1 request view=featured-product mỗi lần bấm, 3 partial', async ({ page }) => {
    const errors = watchConsole(page);
    const requests: Request[] = [];
    page.on('request', (request) => {
      if (isFetch(request)) requests.push(request);
    });
    const scope = await openPicker(page, TE13, 'te13-a');
    const before = page.url();
    const { next } = await otherVariant(scope);
    test.skip(!next, 'Cần 2 variant còn hàng');

    const clicks = await choose(scope, next!);
    expect(clicks, 'biến thể khác cần ≥ 1 lần bấm').toBeGreaterThan(0);
    await expect(scope.locator('input[type="hidden"][name="id"]')).toHaveValue(String(next!.id));
    await expect(scope.locator('product-form')).not.toHaveAttribute('aria-busy', /.*/);
    // Đúng 1 request ?option_values= mỗi lần bấm, không request thừa (kể cả request bị huỷ khi bấm liên tiếp).
    expect(requests.filter(isOptionFetch)).toHaveLength(clicks);
    expect(requests.filter((r) => !isOptionFetch(r))).toHaveLength(0);
    // Legend và trạng thái giá trị do server làm mới qua partial product-options (review #1).
    expect(await legendNames(scope)).toEqual(next!.options);
    expect(await checkedNames(scope)).toEqual(next!.options);

    const url = new URL(requests.at(-1)!.url());
    expect(url.pathname).toMatch(/\/products\//);
    expect(url.searchParams.has('variant'), 'ADR 0008: gửi option_values, không gửi variant').toBe(false);
    expect(url.searchParams.get('option_values')!.split(',')).toEqual(
      await scope.getByTestId('product-variant-picker').locator('input[type="radio"]:checked').evaluateAll((els) => els.map((e) => e.getAttribute('data-option-value-id')))
    );
    // Không thấy tên partial trong URL thì 4 kiểm tra dưới luôn qua: tên thật do data-regions quyết (test contract ở nhóm tĩnh).
    for (const name of ['product-installments', 'product-pickup', 'product-selling-plans', 'product-sticky-bar']) expect(decodeURIComponent(url.href)).not.toContain(name);
    await expect(scope.getByTestId('product-variant-picker')).toHaveAttribute('data-regions', 'product-options product-price product-buy-buttons');

    await expectPrice(scope, next!);
    await expect(scope.getByTestId('featured-product-add')).toBeEnabled();
    await expect(scope.getByTestId('featured-product-status')).not.toBeEmpty();
    expect(page.url()).toBe(before);
    expect(errors).toEqual([]);
  });

  test('AC2 route.abort: nút không kẹt, không aria-busy, không pageerror', async ({ page }) => {
    const errors = watchConsole(page);
    await page.route((url) => url.searchParams.get('view') === 'featured-product', (route) => route.abort());
    const scope = await openPicker(page, TE13, 'te13-a');
    const { next } = await otherVariant(scope);
    test.skip(!next, 'Cần 2 variant còn hàng');
    const add = scope.getByTestId('featured-product-add');
    const label = await add.locator('.product-form__add-label').textContent();
    const id = await scope.locator('input[type="hidden"][name="id"]').inputValue();
    const price = await scope.getByTestId('featured-product-price').innerHTML();

    await choose(scope, next!);
    // ES1-T350 AC15: lỗi thì giữ biến thể cuối đã tải (id, giá), có alert + Try Again; không kẹt.
    await expect(scope.getByTestId('product-option-error').filter({ hasText: /\S/ })).toHaveCount(1);
    await expect(scope.getByTestId('product-option-retry').filter({ visible: true })).toHaveCount(1);
    await expect(scope.locator('input[type="hidden"][name="id"]')).toHaveValue(id);
    expect(await scope.getByTestId('featured-product-price').innerHTML()).toBe(price);
    await expect(scope.locator('product-form')).not.toHaveAttribute('aria-busy', /.*/);
    await expect(add).toBeEnabled();
    await expect(add).not.toHaveAttribute('aria-disabled', 'true');
    await expect(add.locator('.product-form__add-label')).toHaveText(label ?? '');
    expect(errors.filter((e) => e.startsWith('pageerror'))).toEqual([]);
  });

  test('AC2 AC-H22 thêm giỏ thật đúng variant, số giỏ tăng', async ({ page }) => {
    // ES1-T300 (CTO 11/11 mục 4): run 42805384493, 42978078054 đỏ ở đây do 'bị Cloudflare chặn (cf-mitigated, status 429)' tại /?view=te13 = môi trường store dev → skip có lý do, không fail gate.
    await skipIfStoreBlocked('ES1-T300: store dev chặn luồng thêm giỏ thật /?view=te13 (môi trường)', async () => {
    const watch = watchStore(page);
    await gotoStore(page, TE13);
    const scope = band(page, 'te13-a');
    const ready = async () => {
      await wakeBuy(scope); // ES1-T344: picker nạp khi tương tác (ADR 0010).
      await expect(scope.getByTestId('product-variant-picker')).toBeVisible();
    };
    await ready();
    const { next } = await otherVariant(scope);
    test.skip(!next, 'Cần 2 variant còn hàng');
    await choose(scope, next!);
    const add = scope.getByTestId('featured-product-add');
    await expect(scope.locator('input[type="hidden"][name="id"]')).toHaveValue(String(next!.id));

    await themeAdd(page, () => add.click(), async () => {
      await gotoStore(page, TE13);
      await ready();
      await choose(scope, next!);
    });
    await expect.poll(async () => (await readCartJson<{ items: { variant_id: number }[] }>(page)).items.map((i) => i.variant_id)).toEqual([next!.id]);
    if (await page.getByTestId('cart-drawer-dialog').count()) await expect(page.getByTestId('cart-drawer-dialog')).toBeVisible();
    await expect(page.getByTestId('header-cart-count')).toHaveText('1');
    await watch.finish();
    });
  });

  test('AC2 lỗi 422 hiện trong vùng alert, nút bật lại', async ({ page }) => {
    const message = 'ES1-T158 mock: all in your cart.';
    await page.route(CART_GLOB.add, (route) => route.fulfill({ status: 422, contentType: 'application/json', body: JSON.stringify({ status: 422, message: 'Cart Error', description: message }) }));
    await page.goto(TE13);
    const scope = band(page, 'te13-a');
    const root = scope.locator('product-form');
    const add = scope.getByTestId('featured-product-add');
    test.skip(await add.isDisabled(), 'Variant đầu hết hàng');
    await wakeBuy(scope); // ES1-T344 (ADR 0010): product-form nạp khi tương tác vùng mua, không theo viewport.
    await expect.poll(() => root.evaluate(() => Boolean(customElements.get('product-form')))).toBe(true);
    await add.click();
    await expect(scope.getByTestId('featured-product-error')).toHaveText(message);
    await expect(add).toBeEnabled();
  });

  test('AC2 lựa chọn đổi trước khi module nạp (picker bị giữ): id đúng, POST đúng variant', async ({ page }) => {
    // Khách bấm radio trước khi module nạp (picker đã hiện, ES1-T344) hoặc trình duyệt khôi phục form. Đổi checked bằng script.
    let release = () => {};
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route(MODULES.picker, async (route) => {
      await held;
      await route.continue();
    });
    const posted: string[] = [];
    await page.route(CART_GLOB.add, (route) => {
      posted.push(route.request().postData() ?? '');
      return route.fulfill({ status: 422, contentType: 'application/json', body: JSON.stringify({ description: 'ES1-T158 mock' }) });
    });
    await page.goto(TE13);
    const scope = band(page, 'te13-a');
    test.skip((await scope.getByTestId('product-variant-picker').count()) === 0, 'Sản phẩm không có nhiều variant');
    const { next } = await otherVariant(scope);
    test.skip(!next, 'Cần 2 variant còn hàng');
    await scope.getByTestId('featured-product-add').scrollIntoViewIfNeeded();

    await setCheckedByName(scope.getByTestId('product-variant-picker'), next!.options);
    // ES1-T344 (ADR 0010): picker, form nạp khi tương tác vùng mua; picker bị giữ ở route trên.
    await wakeBuy(scope);
    await expect.poll(() => page.evaluate(() => Boolean(customElements.get('product-variant-picker')))).toBe(false);
    release();
    await expect(scope.locator('input[type="hidden"][name="id"]')).toHaveValue(String(next!.id));

    await expect.poll(() => page.evaluate(() => Boolean(customElements.get('product-form')))).toBe(true);
    await scope.getByTestId('featured-product-add').click();
    await expect.poll(() => posted.length).toBe(1);
    expect(posted[0]).toMatch(new RegExp(`name="id"\\r?\\n\\r?\\n${next!.id}\\r?\\n`));
  });

  // ES1-T350: JSON danh sách biến thể (price_html) đã bỏ (NFR-7). Thay bằng: band chỉ có JSON 1 biến thể, khớp id gửi giỏ và giá server.
  test('AC2 NFR-7: không JSON danh sách biến thể; JSON biến thể đang chọn khớp hidden id và giá', async ({ page }) => {
    await page.goto(TE13);
    const scope = band(page, 'te13-a');
    test.skip((await scope.getByTestId('product-variant-picker').count()) === 0, 'Sản phẩm không có nhiều variant');
    await expect(scope.locator('script[data-product-variants]')).toHaveCount(0);
    const json = scope.locator('script[data-selected-variant]');
    await expect(json).toHaveCount(1);
    const v = JSON.parse((await json.textContent()) ?? 'null') as Variant;
    expect(String(v.id)).toBe(await scope.locator('input[type="hidden"][name="id"]').inputValue());
    expect(cents(await scope.getByTestId('featured-product-price').getByTestId('price-regular').first().textContent())).toBe(v.price);
  });

  test('AC2 thumbnail: reduced-motion cuộn auto, aria-current đổi, URL không đổi', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(TE13);
    const scope = band(page, 'te13-a');
    const root = scope.getByTestId('featured-product');
    await expect(root).toHaveAttribute('data-enhanced', '');
    const thumbs = scope.getByTestId('featured-product-thumbnail');
    test.skip((await thumbs.count()) < 2, 'Sản phẩm cần từ 2 ảnh');
    await expect(thumbs.first()).toHaveAttribute('aria-current', 'true');
    const before = page.url();

    await thumbs.nth(1).click();
    await expect(thumbs.nth(1)).toHaveAttribute('aria-current', 'true');
    await expect(thumbs.first()).not.toHaveAttribute('aria-current', /.*/);
    const list = scope.getByTestId('featured-product-media');
    await expect.poll(() => list.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
    expect(page.url()).toBe(before);
  });

  test('AC2 AC-H22 đổi variant có ảnh riêng: gallery cuộn tới ảnh, aria-current đổi', async ({ page }) => {
    const scope = await openPicker(page, TE13, 'te13-a');
    const thumbs = scope.getByTestId('featured-product-thumbnail');
    const ids = await thumbs.evaluateAll((els) => els.map((el) => Number((el as HTMLElement).dataset.featuredMediaId)));
    const { next } = await otherVariant(scope, (v) => v.available && ids.indexOf(v.featured_media?.id ?? 0) > 0);
    test.skip(!next, 'Cần variant còn hàng có ảnh riêng, không phải ảnh đầu');
    await choose(scope, next!);
    await expect(scope.locator(`a[data-featured-media-id="${next!.featured_media!.id}"]`)).toHaveAttribute('aria-current', 'true');
    await expect.poll(() => scope.getByTestId('featured-product-media').evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
  });
});

test.describe('ES1-T158 AC2 nhiều block: band tự thay (D4)', () => {
  // ES1-T350: không còn JSON danh sách biến thể → band B hỏi server 1 lần (?option_values=) và chỉ thay vùng của nó (trước: 0 fetch, đọc JSON).
  test('AC2 đổi variant band B: giá và nút đổi theo server, chỉ band B đổi, URL giữ', async ({ page }) => {
    const errors = watchConsole(page);
    const requests: string[] = [];
    page.on('request', (request) => {
      if (isFetch(request)) requests.push(request.url());
    });
    const scope = await openPicker(page, STATES, 'te13-b');
    const before = page.url();
    const { next } = await otherVariant(scope);
    test.skip(!next, 'Cần 2 variant còn hàng');
    const otherPrice = await band(page, 'te13-a').getByTestId('featured-product-price').innerHTML();
    const otherId = await band(page, 'te13-a').locator('input[type="hidden"][name="id"]').inputValue();
    const otherLegend = await legendNames(band(page, 'te13-a'));

    const clicks = await choose(scope, next!);
    await expect(scope.locator('input[type="hidden"][name="id"]')).toHaveValue(String(next!.id));
    await expectPrice(scope, next!);
    await expect(scope.getByTestId('featured-product-add')).toBeEnabled();
    await expect(scope.locator('product-form')).not.toHaveAttribute('aria-busy', /.*/);

    expect(await band(page, 'te13-a').getByTestId('featured-product-price').innerHTML()).toBe(otherPrice);
    expect(await band(page, 'te13-a').locator('input[type="hidden"][name="id"]').inputValue()).toBe(otherId);
    expect(await legendNames(band(page, 'te13-a'))).toEqual(otherLegend);
    // Band B: fieldset do swap() thay từ server → legend theo lựa chọn mới (review #1).
    expect(await legendNames(scope)).toEqual(next!.options);
    expect(await checkedNames(scope)).toEqual(next!.options);
    expect(clicks, 'biến thể khác cần ≥ 1 lần bấm').toBeGreaterThan(0);
    expect(requests, 'mỗi lần bấm đúng 1 request ?option_values=').toHaveLength(clicks);
    for (const r of requests) expect(new URL(r).searchParams.has('option_values')).toBe(true);
    expect(page.url()).toBe(before);
    expect(errors).toEqual([]);
  });

  test('AC2 variant hết hàng: nút disabled, nhãn Sold out; chọn lại còn hàng thì bật', async ({ page }) => {
    const scope = await openPicker(page, STATES, 'te13-b');
    const { current, next } = await otherVariant(scope, (v) => !v.available);
    test.skip(!next || !current.available, 'Cần 1 variant hết hàng và variant đầu còn hàng');
    const add = scope.getByTestId('featured-product-add');
    await choose(scope, next!);
    await expect(add).toBeDisabled();
    await expect(add.locator('.product-form__add-label')).toHaveText('Sold out');
    await choose(scope, current);
    await expect(add).toBeEnabled();
    await expect(add.locator('.product-form__add-label')).toHaveText('Add To Cart');
  });
});

test.describe('ES1-T158 AC3 lazy', () => {
  test('AC3 block còn xa: 0 file module; tới gần mới tải', async ({ page }) => {
    const loaded: string[] = [];
    page.on('request', (request) => {
      if (Object.values(MODULES).some((m) => m.test(request.url()))) loaded.push(request.url());
    });
    await pushFarBelow(page);
    await page.goto(TE13);
    await page.waitForLoadState('load');
    await expect.poll(() => page.evaluate(() => performance.getEntriesByType('resource').some((e) => e.name.includes('lazy-module.js')))).toBe(true);
    expect(loaded).toEqual([]);

    await band(page, 'te13-a').getByTestId('featured-product').scrollIntoViewIfNeeded();
    await expect(band(page, 'te13-a').getByTestId('featured-product')).toHaveAttribute('data-enhanced', '');
    expect(loaded.some((url) => MODULES.featured.test(url))).toBe(true);
    // ES1-T344 (ADR 0010): tới gần chỉ nạp featured-product.js (+ sale-countdown.js); form, picker chờ tương tác vùng mua.
    expect(loaded.some((url) => MODULES.form.test(url) || MODULES.picker.test(url))).toBe(false);
    await wakeBuy(band(page, 'te13-a'));
    await expect.poll(() => loaded.some((url) => MODULES.form.test(url))).toBe(true);
    expect(loaded.some((url) => MODULES.video.test(url))).toBe(false);

    await band(page, 'te13-video').getByTestId('video-carousel').scrollIntoViewIfNeeded();
    await expect.poll(() => loaded.some((url) => MODULES.video.test(url))).toBe(true);
  });

  // ES1-T344 (ADR 0010): có JS, trước tương tác, markup picker đã hiện (không chờ rê chuột), giữ chỗ từ đầu (CLS 0),
  // đúng 1 bộ chọn (không select biến thể), module picker, form chưa nạp.
  test('AC3 trước tương tác: picker nhìn thấy, giữ chỗ từ đầu, 1 bộ chọn, module picker chưa nạp', async ({ page }) => {
    const loaded: string[] = [];
    page.on('request', (request) => {
      if (Object.values(MODULES).some((m) => m.test(request.url()))) loaded.push(request.url());
    });
    let release = () => {};
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route(MODULES.featured, async (route) => {
      await held;
      await route.continue();
    });
    await page.goto(TE13);
    const scope = band(page, 'te13-a');
    const picker = scope.getByTestId('product-variant-picker');
    test.skip((await picker.count()) === 0, 'Sản phẩm không có nhiều variant');
    await expect(picker).toHaveCount(1);
    await scope.getByTestId('featured-product').scrollIntoViewIfNeeded();
    await expect.poll(() => loaded.some((url) => MODULES.featured.test(url))).toBe(true);
    // featured-product chưa defined: picker chưa hiện nhưng đã chiếm chỗ.
    const before = await height(picker);
    expect(before).toBeGreaterThan(0);
    await expect(picker).toBeHidden();
    release();
    await expect(scope.getByTestId('featured-product')).toHaveAttribute('data-enhanced', '');
    await expect(picker).toBeVisible();
    await expect(picker.getByTestId('product-option').first()).toBeVisible();
    expect(await height(picker)).toBe(before);
    expect(await picker.locator('input[type="radio"]:checked').count()).toBeGreaterThan(0);
    await expect(scope.locator('select[name="id"], noscript')).toHaveCount(0);
    expect(await page.evaluate(() => Boolean(customElements.get('product-variant-picker')))).toBe(false);
    expect(loaded.some((url) => MODULES.picker.test(url) || MODULES.form.test(url))).toBe(false);
  });

  test('AC3 trong khung có thẻ video, ngoài khung thì chưa; không có video tự chạy', async ({ page }) => {
    await stubMedia(page);
    await holdVideo(page);
    await fakeShopifyCards(page, [2, 8]);
    await page.goto(TE13);
    const inView = card(page, 2);
    await inView.scrollIntoViewIfNeeded();
    await expect(inView.locator('video')).toHaveCount(1);
    await expect(card(page, 8)).not.toBeInViewport();
    await expect(card(page, 8).locator('video')).toHaveCount(0);
    expect(await plays(page)).toBe(0);
    expect(await isPaused(inView)).toBe(true);

    // Vào rồi ra rồi vào: vẫn đúng 1 thẻ.
    await page.evaluate(() => window.scrollTo(0, 0));
    await inView.scrollIntoViewIfNeeded();
    await expect(inView.locator('video')).toHaveCount(1);
  });

  test('AC3 video Shopify thật: có thẻ video khi vào khung, không tự chạy (TE13_VIDEO_READY)', async ({ page }) => {
    await page.goto(TE13);
    const first = card(page, 1);
    test.skip((await first.getAttribute('data-video-kind')) !== 'shopify', 'media-dủ-loại chưa có video Shopify (ES1-T153)');
    await first.scrollIntoViewIfNeeded();
    await expect(first.locator('video')).toHaveCount(1);
    expect(await isPaused(first)).toBe(true);
  });

  test('AC3 bấm poster Shopify: play có tiếng, poster ẩn; rời khung thì paused', async ({ page }) => {
    await stubMedia(page);
    await holdVideo(page);
    await fakeShopifyCards(page, [2]);
    await page.goto(TE13);
    const scope = card(page, 2);
    await scope.scrollIntoViewIfNeeded();
    await expect(scope.locator('video')).toHaveCount(1);
    await scope.getByTestId('video-card-poster').click();
    await expect(scope.getByTestId('video-card-poster')).toBeHidden();
    expect(await plays(page)).toBe(1);
    expect(await isPaused(scope)).toBe(false);
    expect(await scope.locator('video').evaluate((el) => (el as HTMLVideoElement).muted)).toBe(false);

    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(scope).not.toBeInViewport();
    await expect.poll(() => isPaused(scope)).toBe(true);
  });

  test('AC3 2 thẻ không cùng chạy', async ({ page }) => {
    await stubMedia(page);
    await holdVideo(page);
    await fakeShopifyCards(page, [2, 3]);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(TE13);
    const [a, b] = [card(page, 2), card(page, 3)];
    await a.scrollIntoViewIfNeeded();
    await expect(a.locator('video')).toHaveCount(1);
    await expect(b.locator('video')).toHaveCount(1);
    await a.getByTestId('video-card-poster').click();
    await b.getByTestId('video-card-poster').click();
    expect(await isPaused(b)).toBe(false);
    expect(await isPaused(a)).toBe(true);
  });

  test('AC3 external: 0 request iframe tới khi bấm; bấm thì iframe thay poster, focus; rời khung trả poster', async ({ page }) => {
    const requests: string[] = [];
    await page.route(EMBED, (route) => {
      requests.push(route.request().url());
      return route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Embed</title>' });
    });
    await page.goto(TE13);
    const scope = card(page, 2);
    await scope.scrollIntoViewIfNeeded();
    await page.waitForLoadState('load');
    await expect.poll(() => page.evaluate(() => Boolean(customElements.get('video-card')))).toBe(true);
    await expect(scope.locator('iframe')).toHaveCount(0);
    expect(requests).toEqual([]);

    await scope.getByTestId('video-card-poster').click();
    await expect(scope.locator('iframe')).toBeFocused();
    await expect(scope.getByTestId('video-card-poster')).toHaveCount(0);
    await expect.poll(() => requests.length).toBeGreaterThan(0);
    expect(page.url()).toContain('view=te13');

    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(scope.locator('iframe')).toHaveCount(0);
    await expect(scope.getByTestId('video-card-poster')).toHaveCount(1);
  });

  test('AC3 phím bổ trợ không chặn link', async ({ page }) => {
    await page.goto(TE13);
    const scope = card(page, 2);
    await scope.scrollIntoViewIfNeeded();
    await expect.poll(() => page.evaluate(() => Boolean(customElements.get('video-card')))).toBe(true);
    const prevented = await scope.getByTestId('video-card-poster').evaluate((el) => {
      let result = true;
      window.addEventListener(
        'click',
        (e) => {
          result = e.defaultPrevented;
          e.preventDefault();
        },
        { once: true },
      );
      el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true }));
      return result;
    });
    expect(prevented).toBe(false);
    await expect(scope.locator('iframe')).toHaveCount(0);
  });

  test('AC3 module nâng cấp không dịch chuyển thẻ', async ({ page }) => {
    let release = () => {};
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route(MODULES.video, async (route) => {
      await held;
      await route.continue();
    });
    await page.goto(TE13);
    const frame = card(page, 2).getByTestId('video-card-frame');
    await frame.scrollIntoViewIfNeeded();
    const before = await frame.boundingBox();
    release();
    await expect.poll(() => page.evaluate(() => Boolean(customElements.get('video-card')))).toBe(true);
    expect(await frame.boundingBox()).toEqual(before);
  });
});

test.describe('ES1-T158 AC4 lỗi video', () => {
  async function failing(page: Page, n: number) {
    await fakeShopifyCards(page, [n]);
    await page.route(FAKE_VIDEO, (route) => route.abort());
    await page.goto(TE13);
    const scope = card(page, n);
    const frame = scope.getByTestId('video-card-frame');
    await frame.scrollIntoViewIfNeeded();
    const size = await frame.boundingBox();
    await expect(scope).toHaveAttribute('data-video-error', '');
    return { scope, frame, size };
  }

  test('AC4 route.abort tệp video: poster còn, link sản phẩm, kích thước không đổi, chữ ẩn đổi, play ẩn; axe 0 serious', async ({ page }) => {
    const errors = watchConsole(page);
    const { scope, frame, size } = await failing(page, 2);
    const poster = scope.getByTestId('video-card-poster');
    await expect(poster).toBeVisible();
    await expect(scope.locator('video')).toHaveCount(0);
    const product = await scope.getAttribute('data-product-url');
    expect(await poster.getAttribute('href')).toBe(product);
    await expect(poster.locator('[data-video-label]')).toHaveText((await scope.getAttribute('data-label-error')) ?? '');
    await expect(scope.getByTestId('video-card-play')).toBeHidden();
    const after = await frame.boundingBox();
    expect(after?.width).toBe(size?.width);
    expect(after?.height).toBe(size?.height);

    await expectNotChallenged(page);
    const { violations } = await new AxeBuilder({ page }).include('[data-testid="video-carousel"]').analyze();
    expect(violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
    expect(errors).toEqual([]);
  });

  test('AC4 không có product: giữ poster và href, play ẩn', async ({ page }) => {
    // ES1-T223: lưu href gốc trước module, không mở trang 2 lần: test có 2 lần goto hết giờ hoặc bị store chặn ở lần 2 (dòng 5).
    await beforeModules(page, () => {
      const href = document.querySelector('[data-video-card-id="te13-video-4"] [data-video-poster]')?.getAttribute('href');
      document.documentElement.dataset.originalHref = href ?? '';
    });
    const { scope } = await failing(page, 4);
    const original = await page.locator('html').getAttribute('data-original-href');
    expect(original).toMatch(/^https:\/\/www\.youtube\.com\/watch\?v=/);
    const poster = scope.getByTestId('video-card-poster');
    await expect(poster).toBeVisible();
    await expect(poster).toHaveAttribute('href', original ?? '');
    await expect(scope.getByTestId('video-card-play')).toBeHidden();
  });

  test('AC4 đã lỗi: bấm poster đi theo link, không tạo lại video', async ({ page }) => {
    const { scope } = await failing(page, 2);
    await scope.getByTestId('video-card-poster').click();
    await expect(page).toHaveURL(/\/products\//);
  });

  test('AC4 lỗi sau khi bấm: poster hiện lại, không kẹt', async ({ page }) => {
    await stubMedia(page);
    await fakeShopifyCards(page, [2]);
    let abort = () => {};
    const go = new Promise<void>((resolve) => {
      abort = resolve;
    });
    await page.route(FAKE_VIDEO, async (route) => {
      await go;
      await route.abort();
    });
    await page.goto(TE13);
    const scope = card(page, 2);
    await scope.scrollIntoViewIfNeeded();
    await expect(scope.locator('video')).toHaveCount(1);
    await scope.getByTestId('video-card-poster').click();
    await expect(scope.getByTestId('video-card-poster')).toBeHidden();
    abort();
    await expect(scope).toHaveAttribute('data-video-error', '');
    await expect(scope.getByTestId('video-card-poster')).toBeVisible();
  });
});

test.describe('ES1-T158 chất lượng', () => {
  test('AC3 đang chạy: axe 0 serious, 0 pageerror, 0 console error', async ({ page }) => {
    const errors = watchConsole(page);
    await stubMedia(page);
    await holdVideo(page);
    await fakeShopifyCards(page, [2]);
    await page.goto(TE13);
    const scope = card(page, 2);
    await scope.scrollIntoViewIfNeeded();
    await expect(scope.locator('video')).toHaveCount(1);
    await scope.getByTestId('video-card-poster').click();
    await expectNotChallenged(page);
    const { violations } = await new AxeBuilder({ page }).include('[data-testid="video-carousel"]').include('[data-testid="featured-product"]').analyze();
    expect(violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
    expect(errors).toEqual([]);
  });
});
