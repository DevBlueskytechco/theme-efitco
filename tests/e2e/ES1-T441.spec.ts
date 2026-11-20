// KHÔNG CHẮC: spec chưa chạy, chưa type-check (phiên QA không có node_modules, PREVIEW_URL, STORE_PASSWORD). Kết quả thật lấy từ CI e2e trên PR.
// Ticket ES1-T441: phần riêng của drafts/dev-fe/ES1-T337/ES1-T337.spec.ts chép sang tests/e2e (docs/srs.md#TE-3 AC2, AC6, AC8, AC13; foundation §9 sold out).
// Tách khỏi TE-3.spec.ts vì đây là kiểm tĩnh file repo + quy tắc hiển thị của snippet ES1-T337; phần trùng TE-3 (aria-hidden, Tab rời card,
// tên link ", N colors", 3 + "+N", 32 × 16 cách 4) đã viết lại trong TE-3.spec.ts TC-10/11, TC-16, TC-51, TC-52, TC-54, TC-56, không chép lại.
// Bỏ so với bản ES1-T337: assertion vùng chạm ::after ≥ 44 × 44 (TE-3 AC6 0.3: chỉ báo không có yêu cầu vùng chạm).
// Test case: drafts/qa/ES1-T441/test-cases.md (tên test bắt đầu bằng ID).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T441.spec.ts
// Dữ liệu (env → tests/e2e/store-data.json): TE3_SWATCH_HANDLE, T337_MANY_COLORS_HANDLE (> 4 giá trị có swatch gốc), TE3_SOLD_OUT_HANDLE | TE4_SOLD_OUT_HANDLE,
//   TE3_AC8_VARIANT_ID + TE3_AC8_PATH. Thiếu thì tự dò 5 trang đầu /collections/all?sort_by=created-descending; không có thì skip có lý do, không coi là đạt.
import { test, expect, type Page, type Locator, type TestInfo } from './support/test';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { expectNotChallenged } from './support/store-guard';
import { pageJson, requireJson } from './support/product-data';
import { env } from './support/store-data';

const ROOT = process.cwd();
const ALL = '/collections/all';
const SORT = 'sort_by=created-descending'; // ES1-T417
const PAGE_SIZE = 20;
const MAX_PAGES = 5;
const T = {
  collection: 'collection-products',
  card: 'product-card',
  title: 'product-card-title',
  variantTitle: 'product-card-variant-title',
  swatches: 'product-card-swatches',
  swatch: 'product-card-swatch',
  more: 'product-card-swatch-more',
  image: 'product-card-image',
  soldOut: 'product-card-badge-sold-out',
} as const;
const SELECTED = `[data-testid="${T.swatch}"][data-selected]`;

const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');
const norm = (s: string | null) => (s ?? '').replace(/\s+/g, ' ').trim();
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const staticOnly = (ti: TestInfo) => test.skip(ti.project.name !== 'desktop', 'static, chạy 1 lần ở desktop');

type JsOption = { name: string; position: number; values: string[] };
type JsProduct = { handle: string; title: string; options: JsOption[]; variants: { id: number; title: string; available: boolean; options: string[] }[] };

// ---------- static (đọc file repo) ----------

test.describe('ES1-T441 static', () => {
  test('S-01 AC2: product-card không <product-swatch>, không radio/label/fieldset, không lặp product.variants (ADR 0008), hàng aria-hidden', ({}, ti) => {
    staticOnly(ti);
    const card = read('snippets/product-card.liquid');
    expect(card).not.toMatch(/<product-swatch|<\/product-swatch>/);
    expect(card).not.toMatch(/<input|<label|<fieldset|<legend|data-price-for/);
    expect(card).not.toMatch(/for\s+\w+\s+in\s+product\.variants/);
    expect(card).toMatch(/class="product-card__swatches"\s+aria-hidden="true"/);
    expect(card).toMatch(/data-testid="product-card-swatch-more"/);
    expect(card, '"+N" không phải link').not.toMatch(/<a[^>]*product-card-swatch-more/);
  });

  test('S-02 AC2: tên link có ", N colors" qua locale số nhiều', ({}, ti) => {
    staticOnly(ti);
    const card = read('snippets/product-card.liquid');
    const locale = JSON.parse(read('locales/en.default.json'));
    expect(card).toMatch(/'products\.card\.color_count'\s*\|\s*t:\s*count:\s*swatch_count/);
    expect(locale.products.card.color_count).toEqual({ one: ', {{ count }} color', other: ', {{ count }} colors' });
    expect(locale.products.card.more_swatches).toBe('+{{ count }}');
  });

  test('S-03 AC13: ≤ 4 hiện hết, > 4 hiện 3 + "+N"', ({}, ti) => {
    staticOnly(ti);
    const card = read('snippets/product-card.liquid');
    expect(card).toMatch(/assign swatch_visible = 4\s+if swatch_count > 4\s+assign swatch_visible = 3/);
    expect(card).toMatch(/assign swatch_more = swatch_count \| minus: swatch_visible/);
  });

  test('S-04 AC2 AC6: CSS không còn style radio, không hover swatch, hàng pointer-events none; ảnh sold out 0.6', ({}, ti) => {
    staticOnly(ti);
    const css = read('assets/base.css');
    expect(css).not.toMatch(/product-card__swatch-input|^product-swatch/m);
    expect(css).not.toMatch(/\.product-card__swatch:hover/);
    expect(css).toMatch(/\.product-card__swatches\s*\{[^}]*pointer-events:\s*none/);
    expect(css).toMatch(/\.product-card\[data-sold-out\] \.product-card__image,[\s\S]{0,120}opacity: 0\.6/);
  });

  test('S-05 AC2: nơi gọi product-card không truyền id_prefix; bundle tắt swatch và dòng biến thể', ({}, ti) => {
    staticOnly(ti);
    for (const f of ['blocks/featured-collection.liquid', 'blocks/collection-products.liquid', 'blocks/quiz.liquid', 'blocks/bundle-builder.liquid', 'blocks/cart-page.liquid']) {
      if (existsSync(join(ROOT, f))) expect(read(f), f).not.toMatch(/id_prefix:/);
    }
    const bundle = read('blocks/bundle-builder.liquid');
    expect(bundle).toMatch(/show_swatches: false/);
    expect(bundle).toMatch(/show_variant_title: false/);
  });

  test('S-06 AC2 (ES1-T338, ADR 0010): không còn assets/product-swatch.js, không file Liquid nào nhắc product-swatch', ({}, ti) => {
    staticOnly(ti);
    expect(existsSync(join(ROOT, 'assets/product-swatch.js'))).toBe(false);
    const hits: string[] = [];
    for (const dir of ['blocks', 'snippets', 'layout', 'templates']) {
      for (const f of readdirSync(join(ROOT, dir)).filter(n => n.endsWith('.liquid'))) {
        if (/product-swatch(\.js|\b(?!-))/.test(read(`${dir}/${f}`).replace(/product-swatch-[\w-]+/g, ''))) hits.push(`${dir}/${f}`);
      }
    }
    expect(hits).toEqual([]);
  });
});

// ---------- store ----------

async function productJs(page: Page, handle: string): Promise<JsProduct> {
  return requireJson(await pageJson<JsProduct>(page, `/products/${encodeURIComponent(handle)}.js`), `/products/${handle}.js (fetch trong trang)`);
}

async function handleOf(card: Locator): Promise<string> {
  const href = (await card.getByTestId(T.title).getAttribute('href')) ?? '';
  const m = href.match(/\/products\/([^/?#]+)/);
  expect(m, `href tiêu đề không có /products/<handle>: ${href}`).not.toBeNull();
  return decodeURIComponent(m![1]);
}

async function variantIdOf(card: Locator): Promise<number | null> {
  const m = ((await card.getByTestId(T.title).getAttribute('href')) ?? '').match(/[?&]variant=(\d+)/);
  return m ? Number(m[1]) : null;
}

// Card đầu tiên có phần tử `has` trong 5 trang đầu; handle cho trước thì tìm đúng handle (thiếu `has` là fail thật ở test).
async function findCard(page: Page, has: string, handle?: string, hasNot?: string): Promise<Locator | null> {
  for (let n = 1; n <= MAX_PAGES; n++) {
    const res = await page.goto(`${ALL}?${SORT}${n > 1 ? `&page=${n}` : ''}`);
    expect(res?.status(), `${ALL} trang ${n}`).toBeLessThan(400);
    await expectNotChallenged(page);
    const all = page.getByTestId(T.collection).getByTestId(T.card);
    const count = await all.count();
    let cards = handle ? all.filter({ has: page.locator(`a[data-testid="${T.title}"][href*="/products/${encodeURI(handle)}"]`) }) : all.filter({ has: page.locator(has) });
    if (!handle && hasNot) cards = cards.filter({ hasNot: page.locator(hasNot) });
    if (await cards.count()) {
      const card = cards.first();
      await card.scrollIntoViewIfNeeded();
      return card;
    }
    if (count < PAGE_SIZE) break;
  }
  return null;
}

async function swatchInfo(page: Page, card: Locator) {
  const p = await productJs(page, await handleOf(card));
  const names = (await card.getByTestId(T.swatch).allTextContents()).map(norm);
  const option = p.options.find(o => o.values.length > 1 && names.every(n => o.values.includes(n)));
  expect(option, `${p.handle}.js có option chứa ${names.join(', ')}`).toBeTruthy();
  const vid = await variantIdOf(card);
  const variant = p.variants.find(v => v.id === vid) ?? p.variants.find(v => v.available) ?? p.variants[0];
  return { p, names, option: option!, selected: variant.options[option!.position - 1] };
}

test.describe('ES1-T441 store', () => {
  test('T-01 AC2 AC13: N ≤ 4 thì đủ N chỉ báo đúng thứ tự giá trị option, không "+N"', async ({ page }) => {
    const card = await findCard(page, `[data-testid="${T.swatch}"] + [data-testid="${T.swatch}"]`, env('TE3_SWATCH_HANDLE'), `[data-testid="${T.more}"]`);
    test.skip(!card, `Không có card 2–4 swatch trên ${ALL}; đặt TE3_SWATCH_HANDLE`);
    test.skip((await card!.getByTestId(T.more).count()) > 0, 'TE3_SWATCH_HANDLE có > 4 giá trị: xem T-02');
    const { option, names, selected } = await swatchInfo(page, card!);
    expect(option.values.length).toBeLessThanOrEqual(4);
    expect(names, 'đủ N chỉ báo theo thứ tự option.values').toEqual(option.values);
    expect(norm(await card!.locator(SELECTED).textContent()), 'data-selected = value của variant card').toBe(selected);
  });

  test('T-02 AC8 AC13: N > 4 thì 3 chỉ báo; value của variant card luôn hiện, sau vị trí 3 thì chiếm chỗ thứ 3', async ({ page }) => {
    const card = await findCard(page, `[data-testid="${T.more}"]`, env('T337_MANY_COLORS_HANDLE', 'TE3_MANY_COLORS_HANDLE'));
    test.skip(!card, `Không có sản phẩm > 4 giá trị có swatch gốc trên ${ALL}; đặt T337_MANY_COLORS_HANDLE`);
    await expect(card!.getByTestId(T.more), 'sản phẩm dữ liệu phải có "+N"').toHaveCount(1);
    const { option, names, selected } = await swatchInfo(page, card!);
    const v = option.values;
    const idx = v.indexOf(selected);
    expect(idx, `${selected} trong ${option.name}`).toBeGreaterThanOrEqual(0);
    const want = idx < 3 ? v.slice(0, 3) : [v[0], v[1], selected];
    expect(names, `chỉ báo hiện (value đang chọn ở vị trí ${idx + 1})`).toEqual(want);
    expect(norm(await card!.locator(SELECTED).textContent())).toBe(selected);
    await expect(card!.getByTestId(T.more)).toHaveText(`+${v.length - 3}`);
    test.info().annotations.push({ type: 'T-02', description: `value đang chọn ở vị trí ${idx + 1}/${v.length}${idx < 3 ? ' (nhánh chiếm chỗ thứ 3 chưa được kiểm với dữ liệu này)' : ''}` });
  });

  test('T-03 foundation §9: card hết hàng có data-sold-out, ảnh opacity 0.6, badge Sold out, giá giữ', async ({ page }) => {
    const card = await findCard(page, `[data-testid="${T.soldOut}"]`, env('TE3_SOLD_OUT_HANDLE', 'TE4_SOLD_OUT_HANDLE'));
    test.skip(!card, `Không có card hết hàng trên ${ALL}; đặt TE3_SOLD_OUT_HANDLE`);
    await expect(card!).toHaveAttribute('data-sold-out', '');
    await expect(card!.getByTestId(T.soldOut)).toHaveText('Sold out');
    await expect(card!.locator('[data-card-price]')).not.toBeEmpty();
    const img = card!.getByTestId(T.image);
    test.skip((await img.count()) === 0, 'Card hết hàng không có ảnh');
    expect(await img.evaluate(el => getComputedStyle(el).opacity)).toBe('0.6');
  });

  test('T-04 AC8: card phần tử variant có link ?variant=, dòng variant.title, tên link có variant.title, chỉ báo của variant đó', async ({ page }) => {
    const id = env('TE3_AC8_VARIANT_ID');
    test.skip(!id, 'Thiếu TE3_AC8_VARIANT_ID: chưa có collection đa nguồn chứa variant trên store dev (ES1-T48 #6), AC8 N/A');
    const path = env('TE3_AC8_PATH') ?? '/';
    const res = await page.goto(path);
    expect(res?.status(), `HTTP ${path}`).toBeLessThan(400);
    await expectNotChallenged(page);
    const card = page.getByTestId(T.card).filter({ has: page.locator(`a[data-testid="${T.title}"][href*="variant=${id}"]`) }).first();
    await expect(card, `card ?variant=${id} trên ${path}`).toHaveCount(1);
    await card.scrollIntoViewIfNeeded();
    const p = await productJs(page, await handleOf(card));
    const v = p.variants.find(x => String(x.id) === id);
    expect(v, `variant ${id} trong .js`).toBeTruthy();
    if (p.variants.length > 1) {
      await expect(card.getByTestId(T.variantTitle)).toHaveText(v!.title);
      await expect(card.getByTestId(T.title)).toHaveAccessibleName(new RegExp(`^${escapeRe(p.title)}, ${escapeRe(v!.title)}`));
    } else {
      await expect(card.getByTestId(T.variantTitle)).toHaveCount(0);
    }
    if (await card.getByTestId(T.swatches).count()) {
      const sel = card.locator(SELECTED);
      await expect(sel).toHaveCount(1);
      expect(v!.options).toContain(norm(await sel.textContent()));
    }
  });

  test('T-05 AC8: phần tử product (không truyền variant) không có dòng variant.title', async ({ page }) => {
    const card = await findCard(page, `[data-testid="${T.swatches}"]`, env('TE3_SWATCH_HANDLE'));
    test.skip(!card, `Không có card swatch trên ${ALL}; đặt TE3_SWATCH_HANDLE`);
    await expect(card!.getByTestId(T.variantTitle)).toHaveCount(0);
  });
});
