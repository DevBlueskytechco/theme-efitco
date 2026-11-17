// KHÔNG CHẮC: spec chưa chạy, chưa type-check (phiên viết không có node_modules, PREVIEW_URL, STORE_PASSWORD); scope-guard chặn dev-fe ghi tests/ → Orchestrator chép sang tests/e2e/ES1-T337.spec.ts.
// Ticket ES1-T337 TE-3-R2-FE1: swatch card là chỉ báo (TE-3 AC2, AC6, AC13 VP2), dòng variant.title + swatch đang chọn (AC8), ảnh mờ khi sold out (foundation §9).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T337.spec.ts
// Nhóm @static đọc file repo. Nhóm store tự dò card trên /collections/all?sort_by=created-descending (5 trang); env ưu tiên:
// TE3_SWATCH_HANDLE (card ≥ 2 swatch), T337_MANY_COLORS_HANDLE (> 4 giá trị có swatch), TE3_SOLD_OUT_HANDLE, TE3_AC8_PATH + TE3_AC8_VARIANT_ID.
// Thiếu dữ liệu → skip có lý do, không coi là đạt.
import { test, expect, type Page, type Locator } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expectNotChallenged } from './support/store-guard';
import { env } from './support/store-data';

const ROOT = process.cwd();
const ALL = '/collections/all';
const SORT = '?sort_by=created-descending';
const PAGE_SIZE = 20;
const MAX_PAGES = 5;
const T = {
  card: 'product-card',
  title: 'product-card-title',
  variantTitle: 'product-card-variant-title',
  swatches: 'product-card-swatches',
  swatch: 'product-card-swatch',
  more: 'product-card-swatch-more',
  image: 'product-card-image',
  soldOut: 'product-card-badge-sold-out',
} as const;

const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');
const norm = (s: string | null) => (s ?? '').replace(/\s+/g, ' ').trim();

test.describe('ES1-T337 @static', () => {
  const card = read('snippets/product-card.liquid');
  const css = read('assets/base.css');
  const locale = JSON.parse(read('locales/en.default.json'));

  test('AC2: không <product-swatch>, không radio/input, không lặp product.variants (ADR 0008)', () => {
    expect(card).not.toMatch(/<product-swatch|<\/product-swatch>/);
    expect(card).not.toMatch(/<input|<label|<fieldset|data-price-for/);
    expect(card).not.toMatch(/for\s+\w+\s+in\s+product\.variants/);
    expect(card).toMatch(/class="product-card__swatches"\s+aria-hidden="true"/);
  });

  test('AC2: tên link có ", N colors" qua locale số nhiều', () => {
    expect(card).toMatch(/'products\.card\.color_count'\s*\|\s*t:\s*count:\s*swatch_count/);
    expect(locale.products.card.color_count).toEqual({ one: ', {{ count }} color', other: ', {{ count }} colors' });
  });

  test('AC13 VP2: ≤ 4 hiện hết, > 4 hiện 3 + "+N"', () => {
    expect(card).toMatch(/assign swatch_visible = 4\s+if swatch_count > 4\s+assign swatch_visible = 3/);
    expect(card).toMatch(/assign swatch_more = swatch_count \| minus: swatch_visible/);
  });

  test('CSS: không còn style radio cũ, không hover swatch, ảnh sold out 0.6', () => {
    expect(css).not.toMatch(/product-card__swatch-input|^product-swatch/m);
    expect(css).not.toMatch(/\.product-card__swatch:hover/);
    expect(css).toMatch(/\.product-card\[data-sold-out\] \.product-card__image,[\s\S]{0,120}opacity: 0\.6/);
  });

  test('Nơi gọi không còn id_prefix; bundle tắt dòng biến thể', () => {
    for (const f of ['blocks/featured-collection.liquid', 'blocks/collection-products.liquid', 'blocks/quiz.liquid', 'blocks/bundle-builder.liquid']) {
      expect(read(f), f).not.toMatch(/id_prefix:/);
    }
    expect(read('blocks/bundle-builder.liquid')).toMatch(/show_variant_title: false/);
  });
});

type JsonOption = { name: string; values: string[] };
type JsonProduct = { handle: string; options: JsonOption[]; variants: { id: number; title: string; available: boolean }[] };

async function productJs(page: Page, handle: string): Promise<JsonProduct> {
  const res = await page.request.get(`/products/${encodeURIComponent(handle)}.js`);
  expect(res.status(), `/products/${handle}.js`).toBeLessThan(400);
  return res.json();
}

async function handleOf(card: Locator): Promise<string> {
  const href = (await card.getByTestId(T.title).getAttribute('href')) ?? '';
  return decodeURIComponent(href.split('/products/')[1].split(/[?#]/)[0]);
}

// Card đầu tiên thoả `filter` trong 5 trang đầu; handle cho trước thì tìm đúng handle.
async function findCard(page: Page, has: string | null, handle?: string): Promise<Locator | null> {
  for (let n = 1; n <= MAX_PAGES; n++) {
    const res = await page.goto(`${ALL}${SORT}${n > 1 ? `&page=${n}` : ''}`);
    expect(res?.status(), `${ALL} trang ${n}`).toBeLessThan(400);
    await expectNotChallenged(page);
    let cards = page.getByTestId(T.card);
    const count = await cards.count();
    if (handle) cards = cards.filter({ has: page.locator(`a[data-testid="${T.title}"][href*="/products/${encodeURI(handle)}"]`) });
    if (has) cards = cards.filter({ has: page.locator(has) });
    if (await cards.count()) {
      const card = cards.first();
      await card.scrollIntoViewIfNeeded();
      return card;
    }
    if (count < PAGE_SIZE) break;
  }
  return null;
}

test.describe('ES1-T337 store', () => {
  test('AC2 AC6: hàng swatch aria-hidden, 0 phần tử focus được trong card ngoài link tiêu đề', async ({ page }) => {
    const card = await findCard(page, `[data-testid="${T.swatch}"]:nth-child(2)`, env('TE3_SWATCH_HANDLE'));
    test.skip(!card, `Không có card ≥ 2 swatch trên ${ALL}; đặt TE3_SWATCH_HANDLE`);
    const row = card!.getByTestId(T.swatches);
    await expect(row).toHaveAttribute('aria-hidden', 'true');
    await expect(row.locator('a, button, input, label, [tabindex]')).toHaveCount(0);
    expect(await row.evaluate(el => getComputedStyle(el).pointerEvents)).toBe('none');
    await expect(card!.locator('a:not([tabindex="-1"]), button, input')).toHaveCount(1);

    // Tab từ tiêu đề ra khỏi card (swatch không nhận focus)
    const title = card!.getByTestId(T.title);
    await title.focus();
    await page.keyboard.press('Tab');
    const inCard = await card!.evaluate(el => el.contains(document.activeElement));
    expect(inCard, 'Tab sau tiêu đề rời card').toBe(false);
  });

  test('AC2 AC13: tên link ghi tổng N màu; ≤ 4 hiện hết, > 4 hiện 3 + "+N"; 1 swatch data-selected; pill 32 × 16 cách 4', async ({ page }) => {
    const card = await findCard(page, `[data-testid="${T.swatch}"]:nth-child(2)`, env('TE3_SWATCH_HANDLE'));
    test.skip(!card, `Không có card ≥ 2 swatch trên ${ALL}; đặt TE3_SWATCH_HANDLE`);
    const p = await productJs(page, await handleOf(card!));
    const names = await card!.getByTestId(T.swatch).evaluateAll(els => els.map(el => (el.textContent ?? '').replace(/\s+/g, ' ').trim()));
    const option = p.options.find(o => names.every(n => o.values.includes(n)));
    expect(option, `option chứa ${names.join(', ')}`).toBeTruthy();
    const n = option!.values.length;

    await expect(card!.getByTestId(T.title)).toHaveAccessibleName(new RegExp(`, ${n} colors$`));
    await expect(card!.getByTestId(T.swatch)).toHaveCount(n <= 4 ? n : 3);
    if (n > 4) await expect(card!.getByTestId(T.more)).toHaveText(`+${n - 3}`);
    else await expect(card!.getByTestId(T.more)).toHaveCount(0);
    await expect(card!.locator(`[data-testid="${T.swatch}"][data-selected]`)).toHaveCount(1);

    const box = await card!.getByTestId(T.swatch).first().boundingBox();
    expect(Math.round(box!.width)).toBe(32);
    expect(Math.round(box!.height)).toBe(16);
    const row = await card!.getByTestId(T.swatches).evaluate(el => ({ gap: getComputedStyle(el).columnGap, over: el.scrollWidth - el.clientWidth }));
    expect(row.gap).toBe('4px');
    expect(row.over, 'hàng chỉ báo không tràn ngang card').toBeLessThanOrEqual(0);

    // TE-3 TC-54 (D7): vùng chạm ::after 44 × 44, từ 1280 rộng 36; pill ::before giữ 32 × 16; tick là phần tử con
    const minW = (page.viewportSize()?.width ?? 0) >= 1280 ? 36 : 44;
    for (const sw of await card!.getByTestId(T.swatch).all()) {
      const s = await sw.evaluate(el => {
        const a = getComputedStyle(el, '::after');
        const b = getComputedStyle(el, '::before');
        return { aw: parseFloat(a.width), ah: parseFloat(a.height), bw: parseFloat(b.width), bh: parseFloat(b.height) };
      });
      expect(s.aw).toBeGreaterThanOrEqual(minW);
      expect(s.ah).toBeGreaterThanOrEqual(44);
      expect(Math.round(s.bw)).toBe(32);
      expect(Math.round(s.bh)).toBe(16);
    }
    await expect(card!.locator(`[data-testid="${T.swatch}"][data-selected] .product-card__swatch-tick`)).toHaveCount(1);
  });

  test('AC13 VP2: sản phẩm > 4 màu có 3 chỉ báo + "+N"', async ({ page }) => {
    const card = await findCard(page, `[data-testid="${T.more}"]`, env('T337_MANY_COLORS_HANDLE'));
    test.skip(!card, `Không có sản phẩm > 4 giá trị có swatch trên ${ALL}; đặt T337_MANY_COLORS_HANDLE`);
    const p = await productJs(page, await handleOf(card!));
    await expect(card!.getByTestId(T.swatch)).toHaveCount(3);
    const more = norm(await card!.getByTestId(T.more).textContent());
    const n = 3 + Number(more.replace('+', ''));
    expect(p.options.some(o => o.values.length === n), `option ${n} giá trị trong ${p.handle}.js`).toBe(true);
    await expect(card!.getByTestId(T.title)).toHaveAccessibleName(new RegExp(`, ${n} colors$`));
  });

  test('Sold out: ảnh card opacity 0.6, badge Sold out, giá giữ', async ({ page }) => {
    const card = await findCard(page, `[data-testid="${T.soldOut}"]`, env('TE3_SOLD_OUT_HANDLE', 'TE4_SOLD_OUT_HANDLE'));
    test.skip(!card, `Không có card hết hàng trên ${ALL}; đặt TE3_SOLD_OUT_HANDLE`);
    await expect(card!).toHaveAttribute('data-sold-out', '');
    const img = card!.getByTestId(T.image);
    test.skip((await img.count()) === 0, 'Card hết hàng không có ảnh');
    expect(await img.evaluate(el => getComputedStyle(el).opacity)).toBe('0.6');
    await expect(card!.locator('[data-card-price]')).not.toBeEmpty();
  });

  test('AC8: card nhận variant có link ?variant=, dòng variant.title, swatch của variant đang chọn', async ({ page }) => {
    const id = process.env.TE3_AC8_VARIANT_ID;
    test.skip(!id, 'Thiếu TE3_AC8_VARIANT_ID (collection đa nguồn có phần tử là variant)');
    const res = await page.goto(process.env.TE3_AC8_PATH || '/');
    expect(res?.status()).toBeLessThan(400);
    await expectNotChallenged(page);
    const card = page.getByTestId(T.card).filter({ has: page.locator(`a[data-testid="${T.title}"][href*="variant=${id}"]`) }).first();
    await expect(card).toHaveCount(1);
    const p = await productJs(page, await handleOf(card));
    const v = p.variants.find(x => String(x.id) === id)!;
    if (p.variants.length > 1) {
      await expect(card.getByTestId(T.variantTitle)).toHaveText(v.title);
      await expect(card.getByTestId(T.title)).toHaveAccessibleName(new RegExp(`, ${v.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
    }
    const selected = card.locator(`[data-testid="${T.swatch}"][data-selected]`);
    if (await card.getByTestId(T.swatches).count()) {
      await expect(selected).toHaveCount(1);
      expect(v.title.split(' / ')).toContain(norm(await selected.textContent()));
    }
  });
});
