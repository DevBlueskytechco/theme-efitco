// KHÔNG CHẮC: spec chưa chạy, chưa type-check (phiên viết không có node_modules, PREVIEW_URL, STORE_PASSWORD); scope-guard chặn dev-fe ghi tests/ → Orchestrator chép sang tests/e2e/ES1-T404.spec.ts.
// Ticket ES1-T404 TS-FE6: swatch chỉ value.swatch, Sale badge theo compare_at_price_max, 11 nhãn setting §14.
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T404.spec.ts
// Nhóm @static đọc file repo, không cần store. Nhóm store: T404_SALE_SECOND_HANDLE (sản phẩm biến thể mặc định không sale, biến thể khác sale);
// không đặt thì tự tìm trong /products.json, không có thì skip có lý do (không coi là đạt).
import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expectNotChallenged } from './support/store-guard';
import { pageJson, requireJson } from './support/product-data';

const ROOT = process.cwd();
const ALL = '/collections/all';
const PAGE_SIZE = 20; // templates/collection.liquid paginate by 20
const MAX_PAGES = 5;
const CARD = '[data-testid="product-card"]';

type JsonVariant = { id: number; price: string; compare_at_price: string | null; available: boolean };
type JsonProduct = { id: number; handle: string; variants: JsonVariant[] };

const cents = (s: string | null) => Math.round(Number(s ?? 0) * 100);
const onSale = (v: JsonVariant) => cents(v.compare_at_price) > cents(v.price);

test.describe('ES1-T404 @static', () => {
  const card = readFileSync(join(ROOT, 'snippets/product-card.liquid'), 'utf8');
  const schema = readFileSync(join(ROOT, 'locales/en.default.schema.json'), 'utf8');

  test('Mục 4/7: không còn metafield custom.swatch_colors, swatch chỉ từ value.swatch', () => {
    expect(card).not.toMatch(/swatch_colors/);
    expect(card).toMatch(/value\.swatch\.color/);
    expect(card).toMatch(/value\.swatch\.image/);
  });

  test('Mục 7 Collection: card không variant dùng compare_at_price_max > price_min', () => {
    expect(card).toMatch(/variant == blank and product\.compare_at_price_max > product\.price_min/);
  });

  test('Mục 14: không còn nhãn "Eyebrow", "Title", "Show Verified"', () => {
    expect(schema).not.toMatch(/"Eyebrow"|"Title"|Show Verified/);
    const labels = JSON.parse(schema).labels as Record<string, string>;
    expect(labels.collection_card_title).toBe('Heading');
    expect(labels.level_card_title).toBe('Heading');
    expect(labels.testimonial_verified).toBe('Show verified label');
    for (const k of ['blog_posts_eyebrow', 'image_with_text_eyebrow', 'multicolumn_eyebrow', 'shop_by_level_eyebrow', 'testimonials_eyebrow']) {
      expect(labels[k], k).toBe('Subheading');
    }
    // Block đã có setting subheading riêng (quiz dùng labels.eyebrow, slideshow-slide, video-carousel).
    for (const k of ['eyebrow', 'slide_eyebrow', 'video_carousel_eyebrow']) {
      expect(labels[k], k).toBe('Text above heading');
    }
  });
});

// Sản phẩm: biến thể đầu tiên còn hàng (selected_or_first_available_variant) không sale, có biến thể khác sale.
async function saleSecondHandle(page: Page): Promise<string | null> {
  const env = process.env.T404_SALE_SECOND_HANDLE;
  if (env) return env;
  const r = requireJson(await pageJson<{ products: JsonProduct[] }>(page, '/products.json?limit=250'), '/products.json');
  const hit = r.products.find(p => {
    const first = p.variants.find(v => v.available);
    return first && !onSale(first) && p.variants.some(v => v !== first && onSale(v));
  });
  return hit?.handle ?? null;
}

test.describe('ES1-T404 store', () => {
  test('Mục 7 Collection: chỉ biến thể thứ 2 sale vẫn có badge Sale trên /collections/all', async ({ page }) => {
    await page.goto('/');
    await expectNotChallenged(page);
    const handle = await saleSecondHandle(page);
    test.skip(!handle, 'Store không có sản phẩm mà chỉ biến thể khác biến thể mặc định giảm giá; đặt T404_SALE_SECOND_HANDLE');

    let found = false;
    for (let n = 1; n <= MAX_PAGES && !found; n++) {
      // Claude Code 12/11: sort_by=created-descending cố định (quy ước ES1-T417) — dữ liệu ES1-T298 đẩy card khỏi 5 trang đầu theo thứ tự mặc định.
      const res = await page.goto(`${ALL}?sort_by=created-descending${n > 1 ? `&page=${n}` : ''}`);
      expect(res?.status(), `${ALL} trang ${n}`).toBeLessThan(400);
      await expectNotChallenged(page);
      const cards = page.locator(CARD);
      const count = await cards.count();
      const card = page.locator(`${CARD}:has([data-testid="product-card-title"][href*="/products/${encodeURI(handle!)}"])`).first();
      if (await card.count()) {
        found = true;
        await card.scrollIntoViewIfNeeded();
        const badge = card.locator('[data-card-badge]');
        await expect(badge).toBeVisible();
        await expect(badge).toHaveAttribute('data-badge', 'sale');
        await expect(badge).toHaveAttribute('data-testid', 'product-card-badge-sale');
        await expect(badge).toHaveText('Sale');
        // Swatch của biến thể card giữ badge card, chọn lại thì badge như lúc tải.
        const checked = card.locator('input[type="radio"][data-variant-id]:checked');
        if (await checked.count()) {
          await expect(checked).toHaveAttribute('data-badge', 'sale');
          await expect(checked).toHaveAttribute('data-badge-label', 'Sale');
        }
      }
      if (count < PAGE_SIZE) break;
    }
    expect(found, `card ${handle} trong ${MAX_PAGES} trang đầu ${ALL}`).toBe(true);
  });

  test('Mục 4: swatch có style từ value.swatch (màu hoặc ảnh), không swatch rỗng', async ({ page }) => {
    const res = await page.goto(ALL);
    expect(res?.status()).toBeLessThan(400);
    await expectNotChallenged(page);
    const swatches = page.locator('[data-testid="product-card-swatch"]');
    test.skip((await swatches.count()) === 0, `Không có card có swatch trên ${ALL} (cần option có value.swatch ở mọi giá trị)`);
    const styles = await swatches.evaluateAll(els => els.map(el => el.getAttribute('style') ?? ''));
    for (const s of styles) expect(s).toMatch(/--swatch-(color|image):/);
  });
});
