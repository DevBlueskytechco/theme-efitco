// KHÔNG CHẮC: spec chưa chạy (sandbox agent không mở được trình duyệt, không có node_modules) → chờ CI. Tên feature Shopify.loadFeatures 'model-viewer-ui' 1.0 + Shopify.ModelViewerUI theo cách Dawn dùng, chưa đối chiếu shopify.dev trong phiên.
// Ticket ES1-T69 TE-4-BE3: assets/product-media.js (docs/srs.md#TE-4 AC1, NFR-6; drafts/techlead/ES1-T59/task-split.md D2, D6, D9, D10).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... TE4_MEDIA_HANDLE=... TE4_VARIANTS_HANDLE=... npx playwright test tests/e2e/ES1-T69.spec.ts -g "AC1"
// Thiếu env → tests/e2e/store-data.json (ES1-T78); vẫn thiếu → skip có lý do.
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { env } from './support/store-data';

const T = {
  root: 'product-media',
  list: 'product-media-list',
  item: 'product-media-item',
  video: 'product-media-video',
  external: 'product-media-external-video',
  externalTemplate: 'product-media-external-video-template',
  model: 'product-media-model',
  thumbs: 'product-media-thumbnails',
  thumb: 'product-media-thumbnail',
  zoomLink: 'product-media-zoom-link',
  dialog: 'product-media-zoom-dialog',
  zoomImage: 'product-media-zoom-image',
  close: 'product-media-zoom-close',
  option: 'product-option',
  optionValue: 'product-option-value',
  form: 'product-form',
} as const;

const ENV = {
  media: env('TE4_MEDIA_HANDLE'),
  variants: env('TE4_VARIANTS_HANDLE'),
};

const ROOT = process.cwd();
const read = (f: string) => readFileSync(join(ROOT, f), 'utf8');
const JS = read('assets/product-media.js');
const BLOCK = read('blocks/product-media.liquid');
// D9: JS trang sản phẩm. product-recommendations.js chưa có thì tính trần 3072 B.
const PRODUCT_PAGE_JS: Array<[string, number]> = [
  ['assets/header-menu.js', 0],
  ['assets/header-sticky.js', 0],
  ['assets/product-variant-picker.js', 0],
  ['assets/product-form.js', 0],
  ['assets/product-media.js', 0],
  ['assets/product-recommendations.js', 3072],
];

const EXTERNAL_HOSTS = /youtube\.com|youtube-nocookie\.com|ytimg\.com|vimeo\.com|vimeocdn\.com/i;
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|cdn\.shopify\.com\/s\/(trekkie|javascripts)|youtube|vimeo|ytimg|model-viewer/i];
const seriousOrCritical = (v: { impact?: string | null }) => ['serious', 'critical'].includes(v.impact ?? '');

type JsProduct = {
  media: Array<{ id: number; media_type: string }>;
  options: Array<{ name: string }>;
  variants: Array<{ id: number; options: string[]; featured_media: { id: number } | null }>;
};

const tid = (page: Page, id: string) => page.getByTestId(id);
const productPath = (handle: string) => `/products/${handle}`;
const itemOf = (page: Page, mediaId: string | number) => page.locator(`[data-testid="${T.item}"][data-media-id="${mediaId}"]`);
const thumbOf = (page: Page, mediaId: string | number) => page.locator(`[data-testid="${T.thumb}"][data-media-id="${mediaId}"]`);

function watchConsole(page: Page) {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    if (IGNORE_CONSOLE.some((r) => r.test(msg.text()) || r.test(msg.location().url))) return;
    errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

// ES1-T74: lấy .js trong trang để cùng market với trang.
async function productJs(page: Page, handle: string): Promise<JsProduct> {
  return page.evaluate(async (path) => {
    const res = await fetch(`${path}.js`, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`${path}.js trả ${res.status}`);
    return res.json();
  }, productPath(handle));
}

async function openMedia(page: Page) {
  test.skip(!ENV.media, 'thiếu TE4_MEDIA_HANDLE (ảnh + video + external + 3D)');
  await page.goto(productPath(ENV.media!));
  await page.waitForFunction(() => !!customElements.get('product-media-gallery'));
}

const currentThumbs = (page: Page) => tid(page, T.thumbs).locator('[aria-current="true"]');

// Media ở trong khung gallery: dưới 64rem list cuộn ngang (trang không cuộn theo), từ 64rem xếp dọc (trang cuộn).
async function expectInFrame(page: Page, mediaId: string | number) {
  await expect
    .poll(() =>
      itemOf(page, mediaId).evaluate((li) => {
        const list = li.parentElement!;
        const r = li.getBoundingClientRect();
        if (list.scrollWidth > list.clientWidth) {
          const l = list.getBoundingClientRect();
          return Math.abs(r.left - l.left) < 2;
        }
        const visible = Math.min(r.bottom, innerHeight) - Math.max(r.top, 0);
        return visible >= Math.min(r.height, innerHeight) * 0.5;
      })
    )
    .toBe(true);
}

test.describe('ES1-T69 TE-4 product-media.js', () => {
  test('contract: bundle, thẻ script, testid JS dùng có trong block, ngân sách D9', () => {
    expect(Buffer.byteLength(JS), 'product-media.js tối đa 6144 B').toBeLessThanOrEqual(6144);
    expect(BLOCK).toMatch(/<script src="{{ 'product-media\.js' \| asset_url }}" type="module"><\/script>/);
    expect((BLOCK.match(/product-media\.js/g) ?? []).length, '1 thẻ script').toBe(1);
    for (const id of [...JS.matchAll(/(?:testid="|testid === ")([a-z-]+)"/g)].map((m) => m[1])) {
      expect(BLOCK, `block thiếu data-testid ${id}`).toContain(`data-testid="${id}"`);
    }
    expect(BLOCK).toContain('<product-media-gallery');
    expect(JS).toContain('customElements.define("product-media-gallery"');
    // Không request ngoài Shopify CDN (NFR-6): JS không chứa URL tuyệt đối.
    expect(JS).not.toMatch(/https?:\/\//);
    const total = PRODUCT_PAGE_JS.reduce((sum, [f, cap]) => {
      try {
        return sum + Buffer.byteLength(read(f));
      } catch {
        return sum + cap;
      }
    }, 0);
    expect(total, 'D9: JS trang sản phẩm tối đa 30046 B').toBeLessThanOrEqual(30046);
  });

  test('AC1 zoom: bấm ảnh mở dialog ảnh 2048, Esc đóng, focus về link; nút đóng cũng trả focus; axe 0 serious', async ({ page }) => {
    const errors = watchConsole(page);
    await openMedia(page);
    const link = tid(page, T.zoomLink).first();
    const href = (await link.getAttribute('href'))!;
    const dialog = tid(page, T.dialog);
    const img = tid(page, T.zoomImage);
    const url0 = page.url();

    await link.click();
    await expect(dialog).toHaveAttribute('open', /.*/);
    expect(page.url(), 'không điều hướng sang ảnh').toBe(url0);
    await expect(img).toBeVisible();
    expect(new URL((await img.getAttribute('src'))!, url0).toString()).toBe(new URL(href, url0).toString());
    await expect(img).toHaveAttribute('width', '2048');
    await expect(img).toHaveAttribute('height', /^\d+$/);
    const axe = await new AxeBuilder({ page }).include(`[data-testid="${T.dialog}"]`).analyze();
    expect(axe.violations.filter(seriousOrCritical).map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);

    await page.keyboard.press('Escape');
    await expect(dialog).not.toHaveAttribute('open', /.*/);
    await expect(link).toBeFocused();

    await link.press('Enter');
    await expect(dialog).toHaveAttribute('open', /.*/);
    await tid(page, T.close).click();
    await expect(dialog).not.toHaveAttribute('open', /.*/);
    await expect(link).toBeFocused();
    expect(errors).toEqual([]);
  });

  test('AC1 thumbnail: bấm đổi media trong khung, aria-current đúng 1 thumbnail, URL không đổi hash', async ({ page }) => {
    const errors = watchConsole(page);
    await openMedia(page);
    const thumbs = tid(page, T.thumb);
    const count = await thumbs.count();
    test.skip(count < 2, 'cần từ 2 media');
    await expect(currentThumbs(page)).toHaveCount(1);
    await expect(thumbs.first()).toHaveAttribute('aria-current', 'true');

    const last = thumbs.nth(count - 1);
    const id = (await last.getAttribute('data-media-id'))!;
    await last.click();
    await expect(itemOf(page, id)).toBeInViewport({ ratio: 0.5 });
    await expect(last).toHaveAttribute('aria-current', 'true');
    await expect(currentThumbs(page)).toHaveCount(1);
    expect(new URL(page.url()).hash).toBe('');
    expect(errors).toEqual([]);
  });

  test('AC1 video Shopify: pause khi rời khung', async ({ page }) => {
    const errors = watchConsole(page);
    await openMedia(page);
    const video = tid(page, T.video).first();
    test.skip((await video.count()) === 0, 'TE4_MEDIA_HANDLE không có video Shopify');
    const li = page.locator(`[data-testid="${T.item}"]:has([data-testid="${T.video}"])`).first();
    const id = (await li.getAttribute('data-media-id'))!;
    await thumbOf(page, id).click();
    await expect(li).toBeInViewport({ ratio: 0.5 });

    // Chromium của Playwright không phát được H.264: giả lập đang phát, đếm lời gọi pause().
    await video.locator('video').evaluate((v: HTMLVideoElement) => {
      let paused = false;
      Object.defineProperty(v, 'paused', { configurable: true, get: () => paused });
      v.pause = () => {
        paused = true;
        (window as unknown as { __t69Pause: number }).__t69Pause = 1;
      };
    });
    const other = page.locator(`[data-testid="${T.thumb}"]:not([data-media-id="${id}"])`).first();
    const otherId = (await other.getAttribute('data-media-id'))!;
    await other.click();
    await expectInFrame(page, otherId);
    // Xếp dọc (64rem+): media khác có thể vẫn chạm khung → cuộn trang qua hẳn video.
    await li.evaluate((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth) window.scrollBy(0, r.bottom + 1);
    });
    await expect(li).not.toBeInViewport();
    await expect.poll(() => page.evaluate(() => (window as unknown as { __t69Pause?: number }).__t69Pause)).toBe(1);
    expect(errors).toEqual([]);
  });

  test('AC1 external video: không request YouTube/Vimeo trước khi bấm; bấm poster → iframe từ template, focus vào iframe', async ({ page }) => {
    const errors = watchConsole(page);
    const external: string[] = [];
    page.on('request', (r) => {
      if (EXTERNAL_HOSTS.test(new URL(r.url()).hostname)) external.push(r.url());
    });
    await openMedia(page);
    const poster = tid(page, T.external).first();
    test.skip((await poster.count()) === 0, 'TE4_MEDIA_HANDLE không có external video');
    const id = (await poster.getAttribute('data-media-id'))!;
    const li = itemOf(page, id);
    await thumbOf(page, id).click();
    await expect(li).toBeInViewport({ ratio: 0.5 });
    await page.waitForLoadState('load');
    expect(external, `request YouTube/Vimeo trước khi bấm: ${external.join(', ')}`).toEqual([]);
    await expect(li.locator('iframe')).toHaveCount(0);

    const url0 = page.url();
    await poster.click();
    const frame = li.locator('iframe');
    await expect(frame).toHaveCount(1);
    await expect(frame).toHaveAttribute('src', EXTERNAL_HOSTS);
    await expect(frame).toHaveAttribute('title', /.+/);
    expect(page.url(), 'không điều hướng sang YouTube/Vimeo').toBe(url0);
    await expect(li.getByTestId(T.external)).toHaveCount(0);
    expect(await page.evaluate(() => document.activeElement?.tagName)).toBe('IFRAME');
    await expect.poll(() => external.length).toBeGreaterThan(0);
    expect(errors).toEqual([]);
  });

  test('AC1 3D: model vào khung → Shopify.loadFeatures nạp model-viewer + UI từ Shopify CDN', async ({ page }) => {
    const errors = watchConsole(page);
    const foreign: string[] = [];
    page.on('request', (r) => {
      const u = new URL(r.url());
      if (/model-viewer/i.test(u.pathname) && !/(^|\.)(shopify|shopifycdn|shopifycloud)\.com$/.test(u.hostname)) foreign.push(r.url());
    });
    await openMedia(page);
    const model = tid(page, T.model).first();
    test.skip((await model.count()) === 0, 'TE4_MEDIA_HANDLE không có model 3D');
    const li = page.locator(`[data-testid="${T.item}"]:has([data-testid="${T.model}"])`).first();
    await thumbOf(page, (await li.getAttribute('data-media-id'))!).click();
    await expect(li).toBeInViewport({ ratio: 0.5 });
    await expect.poll(() => page.evaluate(() => !!customElements.get('model-viewer')), { timeout: 15_000 }).toBe(true);
    await expect
      .poll(() => page.evaluate(() => typeof (window as unknown as { Shopify?: { ModelViewerUI?: unknown } }).Shopify?.ModelViewerUI), { timeout: 15_000 })
      .toBe('function');
    expect(foreign, 'model-viewer chỉ từ Shopify CDN (NFR-6)').toEqual([]);
    expect(errors).toEqual([]);
  });

  test('AC1 đổi variant: cuộn tới featured_media của variant, aria-current theo, focus giữ ở radio', async ({ page }) => {
    const errors = watchConsole(page);
    test.skip(!ENV.variants, 'thiếu TE4_VARIANTS_HANDLE (variant có ảnh riêng)');
    await page.goto(productPath(ENV.variants!));
    await page.waitForFunction(() => !!customElements.get('product-media-gallery') && !!customElements.get('product-variant-picker'));
    const product = await productJs(page, ENV.variants!);
    const firstId = await tid(page, T.item).first().getAttribute('data-media-id');
    const variant = product.variants.find((v) => v.featured_media && String(v.featured_media.id) !== firstId);
    test.skip(!variant, 'không có variant mang featured_media khác media đầu');
    const mediaId = variant!.featured_media!.id;
    await expect(itemOf(page, mediaId)).toHaveCount(1);

    const fieldsets = tid(page, T.option);
    for (let i = 0; i < variant!.options.length; i += 1) {
      const value = fieldsets.nth(i).getByTestId(T.optionValue).filter({
        has: page.locator(`input[type="radio"][value=${JSON.stringify(variant!.options[i])}]`),
      });
      if (!(await value.locator('input[type="radio"]').isChecked())) await value.click();
    }
    await expectInFrame(page, mediaId);
    if (await tid(page, T.thumbs).count()) await expect(thumbOf(page, mediaId)).toHaveAttribute('aria-current', 'true');
    // Không cướp focus: focus không nhảy sang gallery.
    expect(await page.evaluate(() => !!document.activeElement?.closest('product-media-gallery'))).toBe(false);
    await expect(tid(page, T.form)).not.toHaveAttribute('aria-busy', 'true');
    expect(errors).toEqual([]);
  });
});
