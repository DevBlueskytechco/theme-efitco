// KHÔNG CHẮC: spec chưa chạy, chưa type-check (phiên viết không có trình duyệt và preview; CTO 06/11: e2e tắt tới khi trang chủ xong).
// Ticket ES1-T158 TE-13-BE1: assets/featured-product.js, video-carousel.js, product-variant-picker.js (docs/srs.md#TE-13 AC1-AC4, AC-H22, AC-H23; drafts/techlead/ES1-T142/task-split.md D2, D4, D5, D6, D8, D10; plan ES1-T169 D4).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T158.spec.ts -g "AC1|AC2|AC3|AC4"
// /?view=te13: 1 featured product, partial. /?view=te13-states: nhiều block, JSON (D4).
// Đổi HTML bằng init script ở readystatechange đầu tiên (trước khi module chạy), không dùng route.fetch: store có thể trả trang chặn cho request lặp (plan ES1-T169 nhóm A).
// Video: store có thể chưa có video Shopify (ES1-T153) nên đổi thẻ YouTube thành thẻ kind shopify với URL giả; play, pause của media được stub vì không có tệp thật.
import { readFileSync, statSync } from 'node:fs';
import { test, expect, type Locator, type Page, type Request } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { themeAdd } from './support/cart-api';
import { watchShopPay403 } from './support/console-guard';
import { readCartJson } from './support/product-data';
import { gotoStore, watchStore } from './support/store-guard';

const TE13 = '/?view=te13';
const STATES = '/?view=te13-states';
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];
const MODULES = { featured: /\/featured-product\.js/, video: /\/video-carousel\.js/, form: /\/product-form\.js/, picker: /\/product-variant-picker\.js/ };
const FAKE_VIDEO = 'https://cdn.shopify.com/videos/c/vp/es1-t158/fake.mp4';
const EMBED = /youtube-nocookie\.com|player\.vimeo\.com/;
const COUNTDOWN = 'featured-product-countdown';

type Variant = { id: number; options: string[]; available: boolean; price_html: string; featured_media: number | null };
type Units = { days: string; hours: string; minutes: string; seconds: string };

const band = (page: Page, id: string) => page.getByTestId(`container-${id}`);
const card = (page: Page, n: number) => page.locator(`[data-video-card-id="te13-video-${n}"]`).locator('video-card');
const isFetch = (request: Request) => new URL(request.url()).searchParams.get('view') === 'featured-product';
const text = (html: string) => html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

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
  if (left > 0) {
    // Timer chỉ chạy khi khung trong viewport; Pixel 7 có gallery ở trên. Observer chạy theo frame thật.
    await box.scrollIntoViewIfNeeded();
    await expect(box).toBeInViewport();
    await page.waitForTimeout(300);
  }
  return { root, box, end };
}

/** Dừng đồng hồ từ thời điểm hiện tại: tải trang có thể lâu nên không tính từ lúc install. */
async function pause(page: Page) {
  await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 1000);
}

const readVariants = async (scope: Locator) =>
  JSON.parse((await scope.locator('script[data-product-variants]').textContent()) ?? '{}').variants as Variant[];

async function otherVariant(scope: Locator, want: (v: Variant) => boolean = (v) => v.available) {
  const id = Number(await scope.locator('input[type="hidden"][name="id"]').inputValue());
  const variants = await readVariants(scope);
  return { current: variants.find((v) => v.id === id)!, next: variants.find((v) => v.id !== id && want(v)) };
}

async function choose(scope: Locator, variant: Variant) {
  const fieldsets = scope.getByTestId('product-option');
  for (let i = 0; i < variant.options.length; i += 1) {
    const selector = `input[type="radio"][value="${variant.options[i].replace(/"/g, '\\"')}"]`;
    if (await fieldsets.nth(i).locator(selector).isChecked()) continue;
    await fieldsets.nth(i).getByTestId('product-option-value').filter({ has: scope.page().locator(selector) }).click();
  }
}

async function openPicker(page: Page, url: string, bandId: string) {
  const scope = band(page, bandId);
  await page.goto(url);
  await scope.getByTestId('featured-product').scrollIntoViewIfNeeded();
  const picker = scope.getByTestId('product-variant-picker');
  test.skip((await picker.count()) === 0, 'Sản phẩm không có nhiều variant');
  await expect(picker).toBeVisible();
  return scope;
}

test.describe('ES1-T158 tĩnh', () => {
  test('AC2 trần byte, không storage, không log, hook khớp Liquid', () => {
    for (const [file, max] of [['assets/featured-product.js', 2304], ['assets/video-carousel.js', 2560], ['assets/product-variant-picker.js', 7168]] as const) {
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

  test('AC2 contract partial: 2 tên trong data-regions khớp {% partial %} của block', () => {
    const liquid = readFileSync('blocks/featured-product.liquid', 'utf8');
    const regions = liquid.match(/regions: '([^']+)'/)?.[1].split(' ').sort();
    expect(regions).toEqual([...liquid.matchAll(/{%-?\s*partial\s+'([^']+)'/g)].map((m) => m[1]).sort());
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

  test('AC1 tua qua giờ kết thúc: hidden, không hiện lại kể cả khi đồng hồ chạy tiếp', async ({ page }) => {
    const { box } = await openCountdown(page, 120);
    await expect(box).toBeVisible();
    await page.clock.fastForward(121000);
    await expect(box).toBeHidden();
    await expect(box).toHaveAttribute('hidden', '');
    await page.clock.fastForward(60000);
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
    await expect(box).toHaveAttribute('hidden', '');
  });

  test('AC1 đồng hồ đã quá hạn khi tải (trang cache): không bao giờ hiện, vẫn data-enhanced', async ({ page }) => {
    const { root, box } = await openCountdown(page, -5);
    await expect(root).toHaveAttribute('data-enhanced', '');
    await expect(box).toHaveAttribute('hidden', '');
    await expect(box).toBeHidden();
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
  test('AC2 AC-H22 đổi variant: giá, % giảm, nút, id đổi; URL giữ; request view=featured-product, 2 partial', async ({ page }) => {
    const errors = watchConsole(page);
    const requests: Request[] = [];
    page.on('request', (request) => {
      if (isFetch(request)) requests.push(request);
    });
    const scope = await openPicker(page, TE13, 'te13-a');
    const before = page.url();
    const { next } = await otherVariant(scope);
    test.skip(!next, 'Cần 2 variant còn hàng');

    await choose(scope, next!);
    await expect(scope.locator('input[type="hidden"][name="id"]')).toHaveValue(String(next!.id));
    await expect.poll(() => requests.length).toBe(1);
    await expect(scope.locator('product-form')).not.toHaveAttribute('aria-busy', /.*/);

    const url = new URL(requests[0].url());
    expect(url.pathname).toMatch(/\/products\//);
    expect(url.searchParams.get('variant')).toBe(String(next!.id));
    // Không thấy tên partial trong URL thì 4 kiểm tra dưới luôn qua: tên thật do data-regions quyết (test contract ở nhóm tĩnh).
    for (const name of ['product-installments', 'product-pickup', 'product-selling-plans', 'product-sticky-bar']) expect(decodeURIComponent(requests[0].url())).not.toContain(name);
    await expect(scope.getByTestId('product-variant-picker')).toHaveAttribute('data-regions', 'product-price product-buy-buttons');

    await expect(scope.getByTestId('featured-product-price')).toHaveText(text(next!.price_html));
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

    await choose(scope, next!);
    await expect(scope.locator('input[type="hidden"][name="id"]')).toHaveValue(String(next!.id));
    await expect(scope.locator('product-form')).not.toHaveAttribute('aria-busy', /.*/);
    await expect(add).toBeEnabled();
    await expect(add.locator('.product-form__add-label')).toHaveText(label ?? '');
    expect(errors.filter((e) => e.startsWith('pageerror'))).toEqual([]);
  });

  test('AC2 AC-H22 thêm giỏ thật đúng variant, số giỏ tăng', async ({ page }) => {
    const watch = watchStore(page);
    await gotoStore(page, TE13);
    const scope = band(page, 'te13-a');
    const ready = async () => {
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

  test('AC2 lỗi 422 hiện trong vùng alert, nút bật lại', async ({ page }) => {
    const message = 'ES1-T158 mock: all in your cart.';
    await page.route('**/cart/add.js', (route) => route.fulfill({ status: 422, contentType: 'application/json', body: JSON.stringify({ status: 422, message: 'Cart Error', description: message }) }));
    await page.goto(TE13);
    const scope = band(page, 'te13-a');
    const root = scope.locator('product-form');
    const add = scope.getByTestId('featured-product-add');
    test.skip(await add.isDisabled(), 'Variant đầu hết hàng');
    await add.scrollIntoViewIfNeeded(); // Module nạp khi gần viewport.
    await expect.poll(() => root.evaluate(() => Boolean(customElements.get('product-form')))).toBe(true);
    await add.click();
    await expect(scope.getByTestId('featured-product-error')).toHaveText(message);
    await expect(add).toBeEnabled();
  });

  test('AC2 lựa chọn đổi trước khi module nạp (picker bị giữ): id đúng, POST đúng variant', async ({ page }) => {
    // CSS ẩn picker khi chưa defined nên khách không bấm được; tình huống thật là trình duyệt khôi phục form. Đổi checked bằng script.
    let release = () => {};
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route(MODULES.picker, async (route) => {
      await held;
      await route.continue();
    });
    const posted: string[] = [];
    await page.route('**/cart/add.js', (route) => {
      posted.push(route.request().postData() ?? '');
      return route.fulfill({ status: 422, contentType: 'application/json', body: JSON.stringify({ description: 'ES1-T158 mock' }) });
    });
    await page.goto(TE13);
    const scope = band(page, 'te13-a');
    test.skip((await scope.getByTestId('product-variant-picker').count()) === 0, 'Sản phẩm không có nhiều variant');
    const { next } = await otherVariant(scope);
    test.skip(!next, 'Cần 2 variant còn hàng');
    await scope.getByTestId('featured-product-add').scrollIntoViewIfNeeded(); // Module nạp khi gần viewport.

    await scope.getByTestId('product-variant-picker').evaluate((el, options) => {
      el.querySelectorAll('fieldset').forEach((fieldset, i) => {
        for (const input of fieldset.querySelectorAll('input[type="radio"]')) (input as HTMLInputElement).checked = (input as HTMLInputElement).value === options[i];
      });
    }, next!.options);
    release();
    await expect(scope.locator('input[type="hidden"][name="id"]')).toHaveValue(String(next!.id));

    await expect.poll(() => page.evaluate(() => Boolean(customElements.get('product-form')))).toBe(true);
    await scope.getByTestId('featured-product-add').click();
    await expect.poll(() => posted.length).toBe(1);
    expect(posted[0]).toMatch(new RegExp(`name="id"\\r?\\n\\r?\\n${next!.id}\\r?\\n`));
  });

  test('AC2 price_html trong JSON trùng markup server của region product-price', async ({ page }) => {
    await page.goto(TE13);
    const scope = band(page, 'te13-a');
    test.skip((await scope.locator('script[data-product-variants]').count()) === 0, 'Sản phẩm không có nhiều variant');
    const { current } = await otherVariant(scope);
    // Qua DOM để so cùng dạng serialize (entity, thuộc tính), chỉ bỏ khoảng trắng giữa thẻ.
    const normal = (html: string) =>
      page.evaluate((value) => {
        const box = document.createElement('div');
        box.innerHTML = value;
        return box.innerHTML.replace(/>\s+</g, '><').trim();
      }, html);
    const server = await scope.getByTestId('featured-product-price').innerHTML();
    expect(await normal(current.price_html)).toBe(await normal(server));
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
    const { next } = await otherVariant(scope, (v) => v.available && ids.indexOf(v.featured_media ?? 0) > 0);
    test.skip(!next, 'Cần variant còn hàng có ảnh riêng, không phải ảnh đầu');
    await choose(scope, next!);
    await expect(scope.locator(`a[data-featured-media-id="${next!.featured_media}"]`)).toHaveAttribute('aria-current', 'true');
    await expect.poll(() => scope.getByTestId('featured-product-media').evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
  });
});

test.describe('ES1-T158 AC2 nhiều block: JSON (D4)', () => {
  test('AC2 đổi variant band B: 0 fetch, giá và nút đổi theo JSON, band khác giữ nguyên', async ({ page }) => {
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

    await choose(scope, next!);
    await expect(scope.locator('input[type="hidden"][name="id"]')).toHaveValue(String(next!.id));
    await expect(scope.getByTestId('featured-product-price')).toHaveText(text(next!.price_html));
    await expect(scope.getByTestId('featured-product-add')).toBeEnabled();
    await expect(scope.locator('product-form')).not.toHaveAttribute('aria-busy', /.*/);

    expect(await band(page, 'te13-a').getByTestId('featured-product-price').innerHTML()).toBe(otherPrice);
    expect(await band(page, 'te13-a').locator('input[type="hidden"][name="id"]').inputValue()).toBe(otherId);
    expect(requests).toEqual([]);
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
    await expect(add.locator('.product-form__add-label')).toHaveText('Add to cart');
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
    await expect.poll(() => loaded.some((url) => MODULES.form.test(url))).toBe(true);
    expect(loaded.some((url) => MODULES.video.test(url))).toBe(false);

    await band(page, 'te13-video').getByTestId('video-carousel').scrollIntoViewIfNeeded();
    await expect.poll(() => loaded.some((url) => MODULES.video.test(url))).toBe(true);
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

    const { violations } = await new AxeBuilder({ page }).include('[data-testid="video-carousel"]').analyze();
    expect(violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
    expect(errors).toEqual([]);
  });

  test('AC4 không có product: giữ poster và href, play ẩn', async ({ page }) => {
    await page.goto(TE13); // Đọc href gốc trước khi đổi thẻ.
    const original = await card(page, 4).getByTestId('video-card-poster').getAttribute('href');
    const { scope } = await failing(page, 4);
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
    const { violations } = await new AxeBuilder({ page }).include('[data-testid="video-carousel"]').include('[data-testid="featured-product"]').analyze();
    expect(violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
    expect(errors).toEqual([]);
  });
});
