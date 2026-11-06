// KHÔNG CHẮC: spec chưa chạy (sandbox agent không mở trình duyệt) → chờ CI. Shape event theo DoD ES1-T76 (event.product.handle, event.context); đọc thêm event.detail.* phòng thư viện CDN để payload trong detail.
// Ticket ES1-T76 (TE-4 AC12): shopify:product:view bằng <s-view-event> + standard_event_data. Không JS theme: phần tử do assets/standard-events.js (ES1-T81) định nghĩa.
// Scope-guard chặn dev-fe ghi tests/ → Orchestrator chép sang tests/e2e/ES1-T76.spec.ts.
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... TE4_VARIANTS_HANDLE=... [TE4_VIEW_COLLECTION=all] npx playwright test tests/e2e/ES1-T76.spec.ts
import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');
const HANDLE = process.env.TE4_VARIANTS_HANDLE;
const COLLECTION = process.env.TE4_VIEW_COLLECTION || 'all';
const EVENT = 'shopify:product:view';

type ViewRecord = { handle: string | null; context: string | null };

// Gắn listener trước khi script trang chạy (s-view-event có thể bắn ngay khi được define).
async function recordViews(page: Page) {
  await page.addInitScript((name) => {
    const w = window as unknown as { __views: unknown[] };
    w.__views = [];
    document.addEventListener(name, (e) => {
      const ev = e as Event & { product?: { handle?: string }; context?: string; detail?: { product?: { handle?: string }; context?: string } };
      w.__views.push({
        handle: ev.product?.handle ?? ev.detail?.product?.handle ?? null,
        context: ev.context ?? ev.detail?.context ?? null,
      });
    });
  }, EVENT);
}

const views = (page: Page) => page.evaluate(() => (window as unknown as { __views: ViewRecord[] }).__views);

test.describe('ES1-T76 tĩnh', () => {
  test('product-info bọc nội dung bằng <s-view-event> context page', () => {
    const liquid = read('blocks/product-info.liquid');
    expect(liquid).toMatch(/<s-view-event[\s\S]*?view-event-payload='\{\{ product \| standard_event_data: "view", context: "page" \| escape \}\}'/);
    expect(liquid).toContain('</s-view-event>');
  });

  test('product-card bọc card bằng <s-view-event> trigger intersect, context theo card_context', () => {
    const liquid = read('snippets/product-card.liquid');
    expect(liquid).toMatch(/<s-view-event[\s\S]*?view-event-trigger="intersect"/);
    expect(liquid).toMatch(/standard_event_data: "view", context: view_context \| escape/);
    expect(liquid).toMatch(/@param \{string\} \[card_context\]/);
    expect(liquid).toContain('</s-view-event>');
  });

  test('product-form có data-label-added + key locale Added to cart', () => {
    expect(read('blocks/product-form.liquid')).toMatch(/data-label-added="\{\{ label_added \| escape \}\}"/);
    const en = JSON.parse(read('locales/en.default.json'));
    expect(en.blocks.product_form.added_to_cart).toBe('Added to cart');
  });
});

test.describe('ES1-T76 storefront', () => {
  test('trang sản phẩm: document nhận shopify:product:view, handle đúng, context page', async ({ page }) => {
    test.skip(!HANDLE, 'Thiếu TE4_VARIANTS_HANDLE');
    await recordViews(page);
    await page.goto(`/products/${HANDLE}`);
    await expect(page.getByTestId('product-view-event')).toBeAttached();
    await expect.poll(() => views(page).then((v) => v.filter((r) => r.context === 'page'))).toEqual([
      { handle: HANDLE, context: 'page' },
    ]);
  });

  test('trang sản phẩm: payload trên s-view-event là JSON hợp lệ', async ({ page }) => {
    test.skip(!HANDLE, 'Thiếu TE4_VARIANTS_HANDLE');
    await page.goto(`/products/${HANDLE}`);
    const raw = await page.getByTestId('product-view-event').getAttribute('view-event-payload');
    expect(() => JSON.parse(raw ?? '')).not.toThrow();
    expect(raw).toContain(HANDLE as string);
  });

  test('product-form: data-label-added có chữ', async ({ page }) => {
    test.skip(!HANDLE, 'Thiếu TE4_VARIANTS_HANDLE');
    await page.goto(`/products/${HANDLE}`);
    await expect(page.getByTestId('product-form')).toHaveAttribute('data-label-added', /\S/);
  });

  test('collection: card bắn shopify:product:view context collection khi cuộn tới', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await recordViews(page);
    await page.goto(`/collections/${COLLECTION}`);
    const cards = page.getByTestId('product-card-view-event');
    const count = await cards.count();
    test.skip(count < 2, 'Collection cần ≥ 2 sản phẩm');

    const last = cards.nth(count - 1);
    const lastHandle = await last.locator('[data-testid="product-card-title"]').getAttribute('href').then((h) => h?.match(/\/products\/([^/?#]+)/)?.[1] ?? null);

    // Card cuối dưới màn hình đầu: chưa bắn trước khi cuộn (bỏ qua nếu lưới quá ngắn).
    const belowFold = await last.evaluate((el) => el.getBoundingClientRect().top > window.innerHeight);
    if (belowFold) {
      await expect.poll(() => views(page).then((v) => v.some((r) => r.context === 'collection'))).toBe(true);
      expect((await views(page)).filter((r) => r.handle === lastHandle)).toEqual([]);
    }

    await last.scrollIntoViewIfNeeded();
    await expect.poll(() => views(page).then((v) => v.filter((r) => r.handle === lastHandle && r.context === 'collection').length)).toBeGreaterThan(0);
    expect((await views(page)).every((r) => r.context === 'collection')).toBe(true);
  });
});
