// KHÔNG CHẮC: spec chưa chạy, chưa type-check (sandbox agent không mở trình duyệt, không gọi mạng) → chờ CI.
// Ticket ES1-T410 TS-BE1: assets/gift-card-qr.js (mới), 2 thẻ script trong templates/gift_card.liquid, assets/product-media.js nhiều instance,
// assets/featured-product.js bỏ phần media, data-lazy-module trên gallery featured (drafts/techlead/ES1-T304/task-split.md §2, §3, D3, D6; ADR 0010, ADR 0012).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T410.spec.ts
// Nhóm @static đọc repo, không cần store. Gift card: TS_GIFT_CARD_URL (ES1-T298), chưa có → test.fixme.
// Featured có YouTube: store chưa cấu hình thì test chèn 1 item external_video theo đúng markup snippets/product-media-item.liquid.
import { readFileSync, statSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect, type Locator, type Page } from './support/test';
import { env } from './support/store-data';
import { watchShopPay403 } from './support/console-guard';
import { expectNotChallenged } from './support/store-guard';

const ROOT = process.cwd();
const read = (f: string) => readFileSync(join(ROOT, f), 'utf8');
const size = (f: string) => statSync(join(ROOT, f)).size;

const TE13 = '/?view=te13';
const STATES = '/?view=te13-states';
const VARIANTS = env('TE4_VARIANTS_HANDLE');
const GIFT = env('TS_GIFT_CARD_URL');
const QR_NAME = 'QR code, scan to redeem gift card';
const EMBED = /youtube(-nocookie)?\.com\/embed|player\.vimeo\.com/;
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|shopifysvc\.com|cdn\.shopify\.com\/s\/(trekkie|javascripts)|youtube|vimeo|ytimg|model-viewer/i];

function watchConsole(page: Page) {
  const errors: string[] = [];
  const isShopPay403 = watchShopPay403(page);
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    if (isShopPay403(msg)) return;
    // Request do test tự huỷ (route.abort) sinh log mạng của trình duyệt, không phải lỗi theme.
    if (/Failed to load resource/.test(msg.text()) && /qrcode|youtube|vimeo/.test(msg.location().url)) return;
    if (IGNORE_CONSOLE.some((r) => r.test(msg.text()) || r.test(msg.location().url))) return;
    errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

// Không tải YouTube/Vimeo thật: iframe nhận trang rỗng.
const stubEmbeds = (page: Page) => page.route(EMBED, (r) => r.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>stub</title>' }));

const featuredGallery = (scope: Page | Locator) => scope.getByTestId('featured-product').locator('product-media-gallery').first();

async function upgraded(page: Page, gallery: Locator) {
  await gallery.scrollIntoViewIfNeeded();
  await expect.poll(() => page.evaluate(() => Boolean(customElements.get('product-media-gallery')))).toBe(true);
}

/** Item external_video đầu tiên của gallery featured; store chưa có thì chèn vào item đầu (markup như snippet). */
async function externalItem(gallery: Locator): Promise<Locator> {
  const real = gallery.locator('li[data-media-type="external_video"]');
  if (await real.count()) return real.first();
  await gallery.locator('li[data-media-id][data-media-type]').first().evaluate((li) => {
    const id = (li as HTMLElement).dataset.mediaId;
    (li as HTMLElement).dataset.mediaType = 'external_video';
    // min-block-size: item chèn không có ảnh poster, cần vùng bấm được.
    li.innerHTML = `<a class="product-media__external" style="display:block;min-block-size:120px" href="https://www.youtube.com/watch?v=es1t410" data-media-id="${id}" data-testid="product-media-external-video"><span class="visually-hidden">Play</span></a><template data-media-id="${id}" data-testid="product-media-external-video-template"><iframe class="product-media__iframe" src="https://www.youtube-nocookie.com/embed/es1t410?autoplay=1" title="ES1-T410"></iframe></template>`;
  });
  return gallery.locator('li[data-media-type="external_video"]').first();
}

/** Phát theme:variant:change từ element target với featuredMediaId. */
const dispatchVariant = (target: Locator, featuredMediaId: string) =>
  target.evaluate((el, id) => el.dispatchEvent(new CustomEvent('theme:variant:change', { bubbles: true, detail: { variantId: 1, featuredMediaId: Number(id) } })), featuredMediaId);

/** Element giả ngoài gallery mang data-product-id (giả bộ chọn PDP / quickview), gắn vào body hoặc vào wrapper. */
async function fakePicker(page: Page, productId: string, wrapper: 'none' | 'dialog') {
  await page.evaluate(
    ([pid, w]) => {
      const host = document.createElement(w === 'dialog' ? 'dialog' : 'div');
      host.id = 'es1-t410-probe';
      const picker = document.createElement('div');
      picker.dataset.productId = pid;
      picker.id = 'es1-t410-picker';
      host.append(picker);
      document.body.append(host);
    },
    [productId, wrapper] as const
  );
  return page.locator('#es1-t410-picker');
}

// evaluate, không getAttribute của locator: chưa có thumbnail hiện tại thì trả null ngay, không chờ timeout.
const currentId = (gallery: Locator) =>
  gallery.evaluate((g) => g.querySelector('a[href^="#"][data-media-id][aria-current="true"]')?.getAttribute('data-media-id') ?? null);

// ---------------------------------------------------------------- tĩnh
test.describe('ES1-T410 @static', () => {
  test('trần byte: gift-card-qr ≤ 1 024, product-media ≤ 4 407, featured-product < 2 290, mọi file ≤ 8 192', () => {
    expect(size('assets/gift-card-qr.js')).toBeLessThanOrEqual(1024);
    expect(size('assets/product-media.js')).toBeLessThanOrEqual(4407);
    expect(size('assets/featured-product.js')).toBeLessThan(2290);
    for (const f of readdirSync(join(ROOT, 'assets')).filter((n) => n.endsWith('.js'))) {
      expect(size(`assets/${f}`), f).toBeLessThanOrEqual(8192);
    }
  });

  test('không console, không storage, không fetch tự viết, guard customElements', () => {
    for (const f of ['assets/gift-card-qr.js', 'assets/product-media.js', 'assets/featured-product.js']) {
      const js = read(f);
      expect(js, f).not.toMatch(/console\.|localStorage|sessionStorage|document\.cookie|https?:\/\//);
      // ES1-T350 D4 (ADR 0008): featured-product.js swap() fetch ?view=featured-product&option_values= khi ≥ 2 band; 2 file media không fetch.
      if (!f.endsWith('featured-product.js')) expect(js, f).not.toMatch(/fetch\(/);
    }
    expect(read('assets/product-media.js')).toMatch(/customElements\.get\("product-media-gallery"\) \|\|/);
  });

  test('gift card: đúng 2 thẻ script (vendor/qrcode.js defer + module), hook QR có trong template', () => {
    const src = read('templates/gift_card.liquid');
    expect(src.match(/<script[^>]*>/g)).toEqual([
      `<script src="{{ 'vendor/qrcode.js' | shopify_asset_url }}" defer>`,
      `<script src="{{ 'gift-card-qr.js' | asset_url }}" type="module">`,
    ]);
    expect(src).not.toMatch(/\| script_tag/);
    const js = read('assets/gift-card-qr.js');
    for (const hook of ['data-gift-card-qr', 'data-gift-card-copy', 'data-gift-card-status', 'data-gift-card-print', 'data-testid=gift-card-qr-fallback']) {
      expect(js, hook).toContain(hook);
    }
    for (const hook of ['data-gift-card-qr', 'data-identifier=', 'data-label=', 'data-gift-card-copy=', 'data-label-copied=', 'data-label-status=', 'data-gift-card-status', 'data-gift-card-print', 'data-testid="gift-card-qr-fallback"']) {
      expect(src, hook).toContain(hook);
    }
    // Bọc kiểm tra thư viện: thiếu QRCode thì không gọi (0 lỗi console).
    expect(js).toMatch(/window\.QRCode/);
  });

  test('product-media.js: truy vấn trong this, lọc theme:variant:change theo data-product-id', () => {
    const js = read('assets/product-media.js');
    expect(js).not.toMatch(/document\.querySelector/);
    expect(js).not.toMatch(/data-testid="product-media-list"|data-testid="product-media-thumbnail"/);
    expect(js).toMatch(/\[data-product-id\]/);
    expect(js).toMatch(/dataset\.productId/);
    // Featured và PDP đều có data-product-id trên gallery.
    expect(read('blocks/product-media.liquid')).toMatch(/<product-media-gallery[^>]*data-product-id="{{ product\.id }}"/);
    expect(read('blocks/featured-product.liquid')).toMatch(/<product-media-gallery[^>]*data-product-id="{{ featured\.id }}"/);
  });

  test('featured: gallery có data-lazy-module product-media.js, không thêm thẻ script; featured-product.js bỏ phần media', () => {
    const liquid = read('blocks/featured-product.liquid');
    expect(liquid).toMatch(/<product-media-gallery[^>]*data-lazy-module="{{ 'product-media\.js' \| asset_url }}"/);
    expect(liquid.match(/<script[^>]*>/g)).toEqual([`<script src="{{ 'lazy-module.js' | asset_url }}" type="module">`]);
    const js = read('assets/featured-product.js');
    expect(js).not.toMatch(/data-featured-media-id|aria-?[cC]urrent|scrollTo/);
  });
});

// ---------------------------------------------------------------- featured product (trang chủ test)
test.describe('ES1-T410 featured media', () => {
  test('nạp lười: không thẻ script product-media.js, gallery vào khung thì define', async ({ page }) => {
    const errors = watchConsole(page);
    await page.goto(TE13);
    await expectNotChallenged(page);
    const gallery = featuredGallery(page);
    test.skip((await gallery.count()) === 0, 'te13 chưa chọn sản phẩm cho featured product');
    await expect(page.locator('script[src*="product-media.js"]')).toHaveCount(0);
    await expect(gallery).toHaveAttribute('data-lazy-module', /product-media(\.[^/]*)?\.js/);
    await upgraded(page, gallery);
    expect(errors).toEqual([]);
  });

  test('bấm Play YouTube thì iframe nạp; đổi media thì iframe dừng (poster quay lại)', async ({ page }) => {
    const errors = watchConsole(page);
    await stubEmbeds(page);
    await page.goto(TE13);
    await expectNotChallenged(page);
    const gallery = featuredGallery(page);
    test.skip((await gallery.count()) === 0, 'te13 chưa chọn sản phẩm cho featured product');
    await upgraded(page, gallery);
    const item = await externalItem(gallery);
    const poster = item.getByTestId('product-media-external-video');
    await poster.scrollIntoViewIfNeeded();
    await poster.click();
    const frame = item.locator('iframe');
    await expect(frame).toHaveCount(1);
    await expect(frame).toHaveAttribute('src', EMBED);
    await expect(poster).toHaveCount(0);

    const id = await item.getAttribute('data-media-id');
    const other = gallery.locator(`a[href^="#"][data-media-id]:not([data-media-id="${id}"])`).first();
    test.skip((await other.count()) === 0, 'Sản phẩm featured cần từ 2 media để đổi media');
    const before = page.url();
    await other.click();
    await expect(item.locator('iframe')).toHaveCount(0);
    await expect(item.getByTestId('product-media-external-video')).toHaveCount(1);
    await expect(other).toHaveAttribute('aria-current', 'true');
    expect(page.url()).toBe(before);
    expect(errors).toEqual([]);
  });

  test('bộ chọn ngoài featured (giả PDP, cùng product id) không đổi ảnh featured; bộ chọn của featured thì đổi', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(TE13);
    await expectNotChallenged(page);
    const gallery = featuredGallery(page);
    test.skip((await gallery.count()) === 0, 'te13 chưa chọn sản phẩm cho featured product');
    await upgraded(page, gallery);
    const thumbs = gallery.locator('a[href^="#"][data-media-id]');
    test.skip((await thumbs.count()) < 2, 'Sản phẩm featured cần từ 2 media');
    const pid = (await gallery.getAttribute('data-product-id'))!;
    const target = (await thumbs.nth(1).getAttribute('data-media-id'))!;
    const list = gallery.locator('ul').first();
    await expect.poll(() => currentId(gallery)).not.toBeNull();
    const startId = await currentId(gallery);
    const startLeft = await list.evaluate((el) => el.scrollLeft);

    await dispatchVariant(await fakePicker(page, pid, 'none'), target);
    await page.waitForTimeout(300);
    expect(await currentId(gallery)).toBe(startId);
    expect(await list.evaluate((el) => el.scrollLeft)).toBe(startLeft);

    const form = page.getByTestId('featured-product').first().locator('product-form');
    test.skip((await form.count()) === 0, 'Featured không có form (sản phẩm cần selling plan)');
    await dispatchVariant(form, target);
    await expect.poll(() => currentId(gallery)).toBe(target);
  });

  test('2 featured cùng trang: bấm thumbnail block A không đổi block B', async ({ page }) => {
    const errors = watchConsole(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(STATES);
    await expectNotChallenged(page);
    const galleries = page.getByTestId('featured-product').locator('product-media-gallery');
    test.skip((await galleries.count()) < 2, 'te13-states cần 2 featured product có sản phẩm');
    const [a, b] = [galleries.nth(0), galleries.nth(1)];
    await upgraded(page, a);
    await b.scrollIntoViewIfNeeded();
    await a.scrollIntoViewIfNeeded();
    const thumbsA = a.locator('a[href^="#"][data-media-id]');
    test.skip((await thumbsA.count()) < 2, 'Block A cần từ 2 media');
    const bCurrent = await currentId(b);
    const bLeft = await b.locator('ul').first().evaluate((el) => el.scrollLeft);
    await thumbsA.nth(1).click();
    await expect(thumbsA.nth(1)).toHaveAttribute('aria-current', 'true');
    expect(await currentId(b)).toBe(bCurrent);
    expect(await b.locator('ul').first().evaluate((el) => el.scrollLeft)).toBe(bLeft);
    expect(errors).toEqual([]);
  });
});

// ---------------------------------------------------------------- PDP vẫn chạy như cũ, không nhận bộ chọn của featured/quickview
test.describe('ES1-T410 PDP', () => {
  test('bộ chọn trong dialog (giả quickview, cùng product id) không đổi gallery PDP; bộ chọn PDP thì đổi', async ({ page }) => {
    test.skip(!VARIANTS, 'thiếu TE4_VARIANTS_HANDLE');
    const errors = watchConsole(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/products/${VARIANTS}`);
    await expectNotChallenged(page);
    const gallery = page.getByTestId('product-media');
    await expect.poll(() => page.evaluate(() => Boolean(customElements.get('product-media-gallery')))).toBe(true);
    const thumbs = gallery.getByTestId('product-media-thumbnail');
    test.skip((await thumbs.count()) < 2, 'PDP cần từ 2 media');
    const pid = (await gallery.getAttribute('data-product-id'))!;
    const target = (await thumbs.last().getAttribute('data-media-id'))!;
    await expect.poll(() => currentId(gallery)).not.toBeNull();
    const startId = await currentId(gallery);
    test.skip(startId === target, 'Media cuối đang là media hiện tại');

    await dispatchVariant(await fakePicker(page, pid, 'dialog'), target);
    await page.waitForTimeout(300);
    expect(await currentId(gallery)).toBe(startId);

    await dispatchVariant(page.getByTestId('product-form').first(), target);
    await expect.poll(() => currentId(gallery)).toBe(target);
    expect(errors).toEqual([]);
  });

  test('thumbnail PDP vẫn đổi aria-current, không đổi URL', async ({ page }) => {
    test.skip(!VARIANTS, 'thiếu TE4_VARIANTS_HANDLE');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/products/${VARIANTS}`);
    await expectNotChallenged(page);
    await expect.poll(() => page.evaluate(() => Boolean(customElements.get('product-media-gallery')))).toBe(true);
    const thumbs = page.getByTestId('product-media-thumbnail');
    test.skip((await thumbs.count()) < 2, 'PDP cần từ 2 media');
    const before = page.url();
    await thumbs.nth(1).click();
    await expect(thumbs.nth(1)).toHaveAttribute('aria-current', 'true');
    await expect(thumbs.first()).not.toHaveAttribute('aria-current', /.*/);
    expect(page.url()).toBe(before);
  });
});

// ---------------------------------------------------------------- gift card
test.describe('ES1-T410 gift card', () => {
  test('QR là img/canvas ≥ 120 × 120, tên truy cập, ẩn chữ dự phòng; 0 lỗi console', async ({ page }) => {
    test.fixme(!GIFT, 'ES1-T298: store dev chưa có gift card phát hành (TS_GIFT_CARD_URL)');
    const errors = watchConsole(page);
    await page.goto(GIFT!);
    const qr = page.getByTestId('gift-card-qr');
    const drawn = qr.locator('img:visible, canvas:visible').first();
    await expect(drawn).toBeVisible();
    const box = await drawn.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(120);
    expect(box!.height).toBeGreaterThanOrEqual(120);
    await expect(qr.getByRole('img', { name: QR_NAME })).toBeVisible();
    await expect(page.getByTestId('gift-card-qr-fallback')).toBeHidden();
    expect(errors).toEqual([]);
  });

  test('Copy Code: hiện nút, chép mã, nhãn Copied 2 s, status đọc câu đã chép', async ({ page }) => {
    test.fixme(!GIFT, 'ES1-T298: thiếu TS_GIFT_CARD_URL');
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.clock.install();
    await page.goto(GIFT!);
    const copy = page.getByTestId('gift-card-copy');
    await expect(copy).toBeVisible();
    const label = (await copy.textContent())!.trim();
    const code = ((await page.getByTestId('gift-card-code').textContent()) ?? '').replace(/\s+/g, '');
    await copy.click();
    expect((await page.evaluate(() => navigator.clipboard.readText())).replace(/\s+/g, '')).toBe(code);
    await expect(copy).toHaveText('Copied');
    await expect(page.locator('[data-gift-card-status]')).toHaveText('Gift card code copied');
    await page.clock.runFor(2_100);
    await expect(copy).toHaveText(label);
  });

  test('Print: hiện nút, bấm gọi window.print', async ({ page }) => {
    test.fixme(!GIFT, 'ES1-T298: thiếu TS_GIFT_CARD_URL');
    await page.addInitScript(() => {
      (window as unknown as { printed: number }).printed = 0;
      window.print = () => void (window as unknown as { printed: number }).printed++;
    });
    await page.goto(GIFT!);
    const print = page.getByTestId('gift-card-print');
    await expect(print).toBeVisible();
    await print.click();
    expect(await page.evaluate(() => (window as unknown as { printed: number }).printed)).toBe(1);
  });

  test('vendor/qrcode.js lỗi mạng: giữ chữ dự phòng, Copy/Print vẫn chạy, 0 lỗi console theme', async ({ page }) => {
    test.fixme(!GIFT, 'ES1-T298: thiếu TS_GIFT_CARD_URL');
    const errors = watchConsole(page);
    await page.route(/vendor\/qrcode(\.min)?\.js/, (r) => r.abort());
    await page.goto(GIFT!);
    await expect(page.getByTestId('gift-card-copy')).toBeVisible();
    await expect(page.getByTestId('gift-card-qr-fallback')).toBeVisible();
    await expect(page.getByTestId('gift-card-qr').locator('img, canvas')).toHaveCount(0);
    expect(errors).toEqual([]);
  });
});
