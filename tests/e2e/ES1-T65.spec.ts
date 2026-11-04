// KHÔNG CHẮC: spec chưa chạy (không preview, không node_modules trong phiên viết); scope-guard chặn dev-fe ghi tests/ → Orchestrator chép sang tests/e2e/ES1-T65.spec.ts.
// Ticket ES1-T65 TE-4-FE4: product recommendations markup (docs/srs.md#TE-4 AC7; drafts/techlead/ES1-T59/task-split.md D7, D10, D11).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... TE4_VARIANTS_HANDLE=... npx playwright test tests/e2e/ES1-T65.spec.ts -g "AC7-markup"
// Kiểm trong context tắt JS: sau khi BE4 (ES1-T68) merge, JS có thể bỏ hidden khi có kết quả; markup server luôn hidden.
import { test, expect, type Page, type Browser } from '@playwright/test';
import { env } from './support/store-data';
import { getJson } from './support/http';

const T = {
  root: 'product-recommendations',
  heading: 'product-recommendations-heading',
  list: 'product-recommendations-list',
  template: 'product-recommendations-template',
  placeholder: 'product-recommendations-placeholder',
  card: 'product-recommendations-card',
  cardTitle: 'product-recommendations-card-title',
  cardPrice: 'product-recommendations-card-price',
  cardSoldOut: 'product-recommendations-card-sold-out',
} as const;

const ENV = { variants: env('TE4_VARIANTS_HANDLE') };

const tid = (page: Page, id: string) => page.getByTestId(id);
const productPath = (handle: string) => `/products/${handle}`;

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

async function productId(page: Page, handle: string): Promise<number> {
  const r = await getJson<{ id: number }>(page.request, `/products/${handle}.js`);
  expect(r.ok, `/products/${handle}.js trả ${r.status}`).toBeTruthy();
  return r.body!.id;
}

test.describe('ES1-T65 TE-4 product recommendations', () => {
  test('AC7-markup 2 root hidden trong container related / complementary, data hook đúng', async ({ browser }) => {
    test.skip(!ENV.variants, 'thiếu TE4_VARIANTS_HANDLE');
    const { context, page } = await noJsPage(browser);
    await page.goto(productPath(ENV.variants!));
    const id = await productId(page, ENV.variants!);

    const roots = tid(page, T.root);
    await expect(roots).toHaveCount(2);

    for (const [container, intent] of [
      ['container-product-related', 'related'],
      ['container-product-complementary', 'complementary'],
    ] as const) {
      const root = tid(page, container).getByTestId(T.root);
      await expect(root).toHaveCount(1);
      expect(await root.evaluate((el) => el.tagName.toLowerCase())).toBe('product-recommendations');
      await expect(root).toHaveAttribute('hidden', '');
      await expect(root).toBeHidden();
      await expect(root).toHaveAttribute('data-intent', intent);
      // routes.product_recommendations_url: /recommendations/products, có tiền tố locale nếu có
      await expect(root).toHaveAttribute('data-url', /^\/([a-z]{2}(-[a-z]{2})?\/)?recommendations\/products$/i);
      await expect(root).toHaveAttribute('data-product-id', String(id));
      const limit = Number(await root.getAttribute('data-limit'));
      expect(limit).toBeGreaterThanOrEqual(2);
      expect(limit).toBeLessThanOrEqual(8);
      await expect(root).toHaveAttribute('data-money-format', /\{\{\s*amount\w*\s*\}\}/);
      await expect(root.getByTestId(T.heading)).toHaveText(/.+/);
      await expect(root.getByTestId(T.list)).toHaveCount(1);
      expect(await root.getByTestId(T.list).evaluate((el) => el.children.length)).toBe(0);
      await expect(root.getByTestId(T.placeholder)).toHaveCount(0);
    }
    await context.close();
  });

  test('AC7-markup template chứa 1 card đủ 4 testid, ảnh lazy có width/height, badge Sold out ẩn', async ({ browser }) => {
    test.skip(!ENV.variants, 'thiếu TE4_VARIANTS_HANDLE');
    const { context, page } = await noJsPage(browser);
    await page.goto(productPath(ENV.variants!));

    const templates = tid(page, T.template);
    await expect(templates).toHaveCount(2);
    for (let i = 0; i < 2; i++) {
      const info = await templates.nth(i).evaluate((el, ids) => {
        const content = (el as HTMLTemplateElement).content;
        const img = content.querySelector('img[data-card-image]');
        const badge = content.querySelector(`[data-testid="${ids.cardSoldOut}"]`);
        return {
          tag: el.tagName.toLowerCase(),
          items: content.children.length,
          cards: content.querySelectorAll(`[data-testid="${ids.card}"]`).length,
          title: content.querySelectorAll(`[data-testid="${ids.cardTitle}"]`).length,
          price: content.querySelectorAll(`[data-testid="${ids.cardPrice}"]`).length,
          soldOut: badge ? 1 : 0,
          soldOutHidden: badge?.hasAttribute('hidden') ?? false,
          soldOutText: badge?.textContent?.trim() ?? '',
          titleIsLink: content.querySelector(`[data-testid="${ids.cardTitle}"]`)?.tagName.toLowerCase() === 'a',
          img: img
            ? { width: img.getAttribute('width'), height: img.getAttribute('height'), loading: img.getAttribute('loading'), alt: img.getAttribute('alt') }
            : null,
          swatches: content.querySelectorAll('input[type="radio"]').length,
          priceLabels: content.querySelectorAll('.price .visually-hidden').length,
        };
      }, T);
      expect(info.tag).toBe('template');
      expect(info.items).toBe(1);
      expect(info.cards).toBe(1);
      expect(info.title).toBe(1);
      expect(info.price).toBe(1);
      expect(info.soldOut).toBe(1);
      expect(info.soldOutHidden).toBe(true);
      expect(info.soldOutText).toBe('Sold out');
      expect(info.titleIsLink).toBe(true);
      expect(info.img).not.toBeNull();
      expect(Number(info.img!.width)).toBeGreaterThan(0);
      expect(Number(info.img!.height)).toBeGreaterThan(0);
      expect(info.img!.loading).toBe('lazy');
      expect(info.img!.alt).toBe('');
      expect(info.swatches).toBe(0);
      expect(info.priceLabels).toBeGreaterThanOrEqual(2);
    }
    await context.close();
  });
});
