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
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|shopifysvc\.com|cdn\.shopify\.com\/s\/(trekkie|javascripts)|youtube|vimeo|ytimg|model-viewer/i];
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
    expect((BLOCK.match(/<script[^>]*product-media\.js/g) ?? []).length, '1 thẻ script').toBe(1); // doc comment được phép nhắc tên file
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

});
