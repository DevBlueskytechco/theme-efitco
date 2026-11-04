// KHÔNG CHẮC: spec chưa chạy (không preview, không node_modules trong phiên viết); scope-guard chặn dev-fe ghi tests/ → Orchestrator chép sang tests/e2e/ES1-T62.spec.ts.
// Ticket ES1-T62 TE-4-FE1: gallery trang sản phẩm (docs/srs.md#TE-4 AC1, drafts/techlead/ES1-T59/task-split.md D1, D2, D10, D11).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... TE4_MEDIA_HANDLE=... TE4_VARIANTS_HANDLE=... npx playwright test tests/e2e/ES1-T62.spec.ts -g "AC1"
// Dữ liệu: TE4_MEDIA_HANDLE (ảnh + video + external + 3D), TE4_VARIANTS_HANDLE (variant có featured_media khác media đầu),
//   TE4_NO_MEDIA_HANDLE (tuỳ chọn, sản phẩm không media). Thiếu env → tests/e2e/store-data.json (ES1-T78); vẫn thiếu → skip có lý do.
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { env } from './support/store-data';
import { getJson } from './support/http';

const T = {
  main: 'container-product-main',
  related: 'container-product-related',
  complementary: 'container-product-complementary',
  root: 'product-media',
  list: 'product-media-list',
  item: 'product-media-item',
  image: 'product-media-image',
  video: 'product-media-video',
  external: 'product-media-external-video',
  externalTemplate: 'product-media-external-video-template',
  model: 'product-media-model',
  placeholder: 'product-media-placeholder',
  thumbs: 'product-media-thumbnails',
  thumb: 'product-media-thumbnail',
  zoomLink: 'product-media-zoom-link',
  dialog: 'product-media-zoom-dialog',
  zoomImage: 'product-media-zoom-image',
  close: 'product-media-zoom-close',
} as const;

const ENV = {
  media: env('TE4_MEDIA_HANDLE'),
  variants: env('TE4_VARIANTS_HANDLE'),
  noMedia: env('TE4_NO_MEDIA_HANDLE'),
};

const tid = (page: Page, id: string) => page.getByTestId(id);
const productPath = (handle: string, query = '') => `/products/${handle}${query}`;
const EXTERNAL_HOSTS = /youtube\.com|youtube-nocookie\.com|ytimg\.com|vimeo\.com|vimeocdn\.com/i;

type JsMedia = { id: number; media_type: string; position: number };
type JsProduct = {
  media: JsMedia[];
  variants: Array<{ id: number; featured_media: { id: number } | null }>;
};

async function productJs(page: Page, handle: string): Promise<JsProduct> {
  const r = await getJson<JsProduct>(page.request, `/products/${handle}.js`);
  expect(r.ok, `/products/${handle}.js trả ${r.status}`).toBeTruthy();
  return r.body as JsProduct;
}

test.describe('ES1-T62 TE-4 gallery', () => {
  test('AC1 khung: 3 container + root product-media trên trang sản phẩm', async ({ page }) => {
    test.skip(!ENV.media, 'thiếu TE4_MEDIA_HANDLE');
    await page.goto(productPath(ENV.media!));
    for (const id of [T.main, T.related, T.complementary]) await expect(tid(page, id)).toHaveCount(1);
    const root = tid(page, T.root);
    await expect(root).toHaveCount(1);
    expect(await root.evaluate(el => el.tagName.toLowerCase())).toBe('product-media-gallery');
    await expect(tid(page, T.main).getByTestId(T.root)).toHaveCount(1);
    // Không còn markup Skeleton cũ (select variant, quantity type=text)
    await expect(page.locator('form[action*="/cart/add"] input[name="quantity"][type="text"]')).toHaveCount(0);
  });

  test('AC1 đủ 4 loại media, id/data-* đúng, không request YouTube/Vimeo lúc tải', async ({ page }) => {
    test.skip(!ENV.media, 'thiếu TE4_MEDIA_HANDLE');
    const external: string[] = [];
    page.on('request', r => {
      if (EXTERNAL_HOSTS.test(new URL(r.url()).hostname)) external.push(r.url());
    });
    await page.goto(productPath(ENV.media!));
    await page.waitForLoadState('load');

    const items = tid(page, T.item);
    const js = await productJs(page, ENV.media!);
    await expect(items).toHaveCount(js.media.length);
    for (const type of ['image', 'video', 'external_video', 'model']) {
      await expect(page.locator(`[data-testid="${T.item}"][data-media-type="${type}"]`), `thiếu media ${type}`).not.toHaveCount(0);
    }
    for (const el of await items.all()) {
      const mediaId = await el.getAttribute('data-media-id');
      expect(mediaId).toMatch(/^\d+$/);
      await expect(el).toHaveAttribute('id', `ProductMedia-${mediaId}`);
    }
    await expect(tid(page, T.image).first()).toBeVisible();
    await expect(tid(page, T.video).locator('video').first()).toHaveAttribute('preload', 'none');
    await expect(tid(page, T.video).locator('video').first()).toHaveAttribute('controls', /.*/);
    await expect(tid(page, T.video).locator('video').first()).toHaveAttribute('poster', /.+/);
    await expect(tid(page, T.external).first()).toHaveAttribute('href', EXTERNAL_HOSTS);
    await expect(tid(page, T.model).locator('model-viewer')).not.toHaveCount(0);

    // External video: iframe chỉ nằm trong template.content, không có iframe trong DOM
    await expect(tid(page, T.externalTemplate)).not.toHaveCount(0);
    expect(await tid(page, T.externalTemplate).first().evaluate(t => (t as HTMLTemplateElement).content.querySelectorAll('iframe').length)).toBe(1);
    await expect(tid(page, T.list).locator('iframe')).toHaveCount(0);
    expect(external, `request tới YouTube/Vimeo lúc tải: ${external.join(', ')}`).toEqual([]);
  });

  test('AC1 LCP: chỉ media đầu eager + fetchpriority high, còn lại lazy', async ({ page }) => {
    test.skip(!ENV.media, 'thiếu TE4_MEDIA_HANDLE');
    await page.goto(productPath(ENV.media!));
    const imgs = tid(page, T.list).locator('img');
    const first = tid(page, T.item).first().locator('img').first();
    await expect(first).toHaveAttribute('loading', 'eager');
    await expect(first).toHaveAttribute('fetchpriority', 'high');
    await expect(tid(page, T.list).locator('img[fetchpriority="high"]')).toHaveCount(1);
    const rest = await tid(page, T.item).locator('img').all();
    for (const img of rest.slice(1)) await expect(img).toHaveAttribute('loading', 'lazy');
    expect(await imgs.count()).toBeGreaterThan(0);
  });

  test('AC1 zoom link trỏ ảnh 2048, dialog trống + nút đóng có sẵn', async ({ page }) => {
    test.skip(!ENV.media, 'thiếu TE4_MEDIA_HANDLE');
    await page.goto(productPath(ENV.media!));
    const link = tid(page, T.zoomLink).first();
    const href = await link.getAttribute('href');
    expect(href).toMatch(/[?&]width=2048/);
    const res = await page.request.get(new URL(href!, page.url()).toString());
    expect(res.ok()).toBeTruthy();
    expect(res.headers()['content-type']).toMatch(/^image\//);
    await expect(link).toHaveAccessibleName(/.+/);

    const dialog = tid(page, T.dialog);
    await expect(dialog).toHaveCount(1);
    await expect(dialog).not.toHaveAttribute('open', /.*/);
    await expect(dialog.getByTestId(T.zoomImage)).toHaveCount(1);
    // dialog đang đóng nên tên truy cập tính ra rỗng: kiểm nhãn thật trên nút (aria-label hoặc chữ ẩn).
    expect(await dialog.getByTestId(T.close).evaluate(el => (el.getAttribute('aria-label') || el.textContent || '').trim())).not.toBe('');
  });

  test('AC1 thumbnail không JS: anchor tới ProductMedia-{id}, không aria-current tĩnh', async ({ browser }) => {
    test.skip(!ENV.media, 'thiếu TE4_MEDIA_HANDLE');
    const context = await browser.newContext({ javaScriptEnabled: false, storageState: 'tests/setup/state.json', baseURL: test.info().project.use.baseURL, ...(test.info().project.use.viewport ? { viewport: test.info().project.use.viewport } : {}) });
    const page = await context.newPage();
    await page.goto(productPath(ENV.media!));
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
    await context.close();
  });

  test('AC1 1 media hoặc không media: không thumbnail; không media → placeholder', async ({ page }) => {
    test.skip(!ENV.noMedia, 'thiếu TE4_NO_MEDIA_HANDLE');
    await page.goto(productPath(ENV.noMedia!));
    await expect(tid(page, T.placeholder)).toHaveCount(1);
    await expect(tid(page, T.placeholder).locator('svg')).toHaveCount(1);
    await expect(tid(page, T.thumbs)).toHaveCount(0);
    await expect(tid(page, T.dialog)).toHaveCount(0);
  });

  test('AC1 ?variant= có featured_media → media đó đứng đầu, không trùng', async ({ page }) => {
    test.skip(!ENV.variants, 'thiếu TE4_VARIANTS_HANDLE');
    await page.goto(productPath(ENV.variants!));
    const js = await productJs(page, ENV.variants!);
    const firstMediaId = js.media[0]?.id;
    const variant = js.variants.find(v => v.featured_media && v.featured_media.id !== firstMediaId);
    test.skip(!variant, 'TE4_VARIANTS_HANDLE không có variant mang featured_media khác media đầu');

    await page.goto(productPath(ENV.variants!, `?variant=${variant!.id}`));
    const items = tid(page, T.item);
    await expect(items.first()).toHaveAttribute('data-media-id', String(variant!.featured_media!.id));
    await expect(page.locator(`[data-testid="${T.item}"][data-media-id="${variant!.featured_media!.id}"]`)).toHaveCount(1);
    await expect(items).toHaveCount(js.media.length);
  });

  test('AC1 axe 0 serious/critical trên trang sản phẩm', async ({ page }) => {
    test.skip(!ENV.media, 'thiếu TE4_MEDIA_HANDLE');
    await page.goto(productPath(ENV.media!));
    const r = await new AxeBuilder({ page }).include(`[data-testid="${T.main}"]`).analyze();
    const bad = r.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? ''));
    expect(bad.map(v => `${v.id}: ${v.nodes.map(n => n.target.join(' ')).join(' | ')}`)).toEqual([]);
  });
});
