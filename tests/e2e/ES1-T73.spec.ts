// KHÔNG CHẮC: spec chưa chạy trên preview và chưa type-check (không có node_modules, trình duyệt trong sandbox agent). Kết quả thật lấy từ CI e2e trên PR.
// Ticket ES1-T73 (bug TE-3 AC2, TC-15 TE-3.spec.ts): sau khi trình duyệt khôi phục form (Back / reload / bfcache),
// link card, ảnh, giá, badge phải theo radio swatch đang checked. assets/product-swatch.js đồng bộ lại ở window 'pageshow'.
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T73.spec.ts
// Dữ liệu: card ≥ 2 swatch trên /collections/all (5 trang đầu) hoặc TE3_SWATCH_HANDLE; không có thì skip.
import { test, expect, type Locator, type Page, type TestInfo } from '@playwright/test';

const ALL = '/collections/all';
const PAGE_SIZE = 20;
const MAX_PAGES = 5;
const SWATCH = 'input[type="radio"][data-variant-id]';
const T = { collection: 'collection-products', card: 'product-card', title: 'product-card-title', swatch: 'product-card-swatch' } as const;
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];

function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
  page.on('console', m => {
    if (m.type() !== 'error') return;
    const text = `${m.text()} @ ${m.location().url}`;
    if (!IGNORE_CONSOLE.some(r => r.test(text))) errors.push(text);
  });
  return errors;
}

// Card ≥ 2 radio swatch; trả product id để tìm lại sau khi điều hướng.
async function swatchCard(page: Page): Promise<string | null> {
  const handle = process.env.TE3_SWATCH_HANDLE;
  for (let n = 1; n <= MAX_PAGES; n++) {
    const res = await page.goto(n === 1 ? ALL : `${ALL}?page=${n}`);
    if (!res || res.status() >= 400) return null;
    const cards = page.getByTestId(T.collection).getByTestId(T.card);
    const count = await cards.count();
    if (!count) return null;
    const found = handle ? cards.filter({ has: page.locator(`a[data-testid="${T.title}"][href*="/products/${handle}"]`) }) : cards;
    for (let i = 0; i < (await found.count()); i++) {
      const card = found.nth(i);
      if ((await card.locator(SWATCH).count()) >= 2) return card.getAttribute('data-product-id');
    }
    if (count < PAGE_SIZE) return null;
  }
  return null;
}

const cardById = (page: Page, id: string) =>
  page.getByTestId(T.collection).locator(`[data-testid="${T.card}"][data-product-id="${id}"]`).first();

async function waitSwatchDefined(page: Page) {
  await page.waitForFunction(() => customElements.get('product-swatch') !== undefined);
}

async function checkedIndex(card: Locator): Promise<number> {
  return card.locator(SWATCH).evaluateAll(els => els.findIndex(e => (e as HTMLInputElement).checked));
}

async function pick(card: Locator, index: number, ti: TestInfo) {
  const label = card.getByTestId(T.swatch).nth(index);
  await label.scrollIntoViewIfNeeded();
  if (ti.project.name === 'mobile') await label.tap();
  else await label.click();
}

// Bất biến: mọi a[data-card-link] = data-variant-url của radio checked; ảnh = data-image-src (nếu có).
async function expectInSync(card: Locator) {
  const checked = card.locator(`${SWATCH}:checked`);
  await expect(checked).toHaveCount(1);
  const data = await checked.evaluate(el => ({ ...(el as HTMLInputElement).dataset }));
  expect(data.variantUrl, 'radio có data-variant-url').toBeTruthy();
  const links = card.locator('a[data-card-link]');
  const n = await links.count();
  expect(n, 'card có a[data-card-link]').toBeGreaterThan(0);
  for (let i = 0; i < n; i++) {
    await expect(links.nth(i), `link ${i} = variant của radio đang checked`).toHaveAttribute('href', data.variantUrl!);
  }
  await expect(card.getByTestId(T.title)).toHaveAttribute('href', data.variantUrl!);
  if (data.imageSrc) await expect(card.locator('img[data-card-image]')).toHaveAttribute('src', data.imageSrc);
}

test.describe('ES1-T73 product-swatch đồng bộ sau khi khôi phục form', () => {
  test('TC-1 Back từ trang sản phẩm: link, ảnh theo swatch đang checked', async ({ page }, ti) => {
    const errors = trackErrors(page);
    const id = await swatchCard(page);
    test.skip(!id, `Không có card ≥ 2 swatch trên ${ALL}`);
    await waitSwatchDefined(page);
    const card = cardById(page, id!);
    const to = (await checkedIndex(card)) === 1 ? 0 : 1;
    await pick(card, to, ti);
    await expect(card.locator(SWATCH).nth(to)).toBeChecked();
    await expectInSync(card);

    await card.getByTestId(T.title).click();
    await page.waitForURL(/\/products\//);
    await page.goBack();
    await waitSwatchDefined(page);
    await page.waitForLoadState('load');
    const again = cardById(page, id!);
    await expect(again).toBeVisible();
    await expectInSync(again);
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('TC-2 Reload sau khi đổi swatch: link khớp radio checked (khôi phục hay không)', async ({ page }, ti) => {
    const errors = trackErrors(page);
    const id = await swatchCard(page);
    test.skip(!id, `Không có card ≥ 2 swatch trên ${ALL}`);
    await waitSwatchDefined(page);
    const card = cardById(page, id!);
    await pick(card, (await checkedIndex(card)) === 1 ? 0 : 1, ti);
    await page.reload();
    await waitSwatchDefined(page);
    await page.waitForLoadState('load');
    await expectInSync(cardById(page, id!));
    expect(errors, errors.join('\n')).toEqual([]);
  });

  // Mô phỏng tất định: trình duyệt khôi phục radio (không bắn change) rồi bắn pageshow → JS phải đồng bộ.
  test('TC-3 pageshow đồng bộ radio bị đổi không qua change', async ({ page }) => {
    const errors = trackErrors(page);
    const id = await swatchCard(page);
    test.skip(!id, `Không có card ≥ 2 swatch trên ${ALL}`);
    await waitSwatchDefined(page);
    await page.waitForLoadState('load');
    const card = cardById(page, id!);
    const to = (await checkedIndex(card)) === 1 ? 0 : 1;
    const target = card.locator(SWATCH).nth(to);
    const want = await target.getAttribute('data-variant-url');
    const isDefault = await target.evaluate(el => (el as HTMLInputElement).defaultChecked);
    test.skip(isDefault, 'radio đích là mặc định, không có gì để đồng bộ');

    await target.evaluate(el => { (el as HTMLInputElement).checked = true; });
    await expect(card.getByTestId(T.title), 'chưa có change: href vẫn mặc định').not.toHaveAttribute('href', want!);
    await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
    await expectInSync(card);
    expect(errors, errors.join('\n')).toEqual([]);
  });
});
