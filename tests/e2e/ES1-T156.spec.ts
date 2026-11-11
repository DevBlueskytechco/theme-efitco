// KHÔNG CHẮC: spec chưa chạy (phiên viết không có preview, chưa type-check); scope-guard chặn dev-fe ghi tests/ → Orchestrator chép sang tests/e2e/ES1-T156.spec.ts.
// Ticket ES1-T156 TE-13-FE1: featured product markup (docs/srs.md#TE-13 AC1, AC2; drafts/techlead/ES1-T142/task-split.md D2, D3, D4, D10, D11).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T156.spec.ts -g "AC1-markup|AC2|nojs"
// JS của BE1 ở tests/e2e/ES1-T158.spec.ts; test trạng thái trước nâng cấp chặn file module (ES1-T158).
import { readFileSync } from 'node:fs';
import { test, expect, type Locator, type Page, type Response } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { expectNotChallenged, expectStoreAllowed, gotoStore, skipIfStoreBlocked } from './support/store-guard';
import { env } from './support/store-data';
import { readCartNoScript } from './support/product-data';
import { watchShopPay403 } from './support/console-guard';

// Plan ES1-T169 D4: band A-E chuyển sang index.te13-states (ES1-T157).
const TE13 = '/?view=te13-states';
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];

const band = (page: Page, id: string) => page.getByTestId(`container-te13-${id}`);
const tid = (scope: Page | Locator, id: string) => scope.getByTestId(id);
const COUNTDOWN = 'featured-product-countdown';

// $1,234.50 hoặc 1.234,50 ₫ → số đơn vị nhỏ nhất, đủ để tính %.
const money = (text: string | null) => Number((text ?? '').replace(/[^\d]/g, ''));

function watchConsole(page: Page) {
  const errors: string[] = [];
  const isShopPay403 = watchShopPay403(page);
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    if (isShopPay403(msg)) return;
    if (IGNORE_CONSOLE.some((r) => r.test(msg.text()) || r.test(msg.location().url))) return;
    errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

async function onSale(scope: Locator) {
  return (await tid(scope, 'price-compare').count()) > 0;
}

test.describe('ES1-T156 TE-13 featured product', () => {
  test('AC1-markup band A sale còn hạn: khung, data-end đúng, 4 ô, role timer', async ({ page }) => {
    await page.goto(TE13);
    const a = band(page, 'a');
    await expect(tid(a, 'featured-product')).toBeAttached();
    test.skip(!(await onSale(a)), 'Sản phẩm band A không có giá gạch, cần te13-featured hoặc TE4_SALE_SMALL_PRICE_HANDLE đang sale');

    const box = tid(a, COUNTDOWN);
    await expect(box).toHaveCount(1);
    await expect(box).toHaveAttribute('role', 'timer');
    await expect(box).toHaveAttribute('aria-labelledby', /.+/);
    await expect(box).not.toHaveAttribute('aria-live', /.*/);

    const expected = Number(await tid(page, 'te13-meta').getAttribute('data-expected-end'));
    const end = Number(await box.getAttribute('data-end'));
    // Lệch đúng 3600 giây khi đổi giờ mùa hè rơi vào 48 giờ tới (ES1-T155 #7).
    expect([0, 3600]).toContain(Math.abs(end - expected));

    for (const unit of ['days', 'hours', 'minutes', 'seconds']) {
      const cell = tid(box, `${COUNTDOWN}-${unit}`);
      await expect(cell).toHaveAttribute('data-countdown-unit', unit);
      await expect(cell.locator('[data-countdown-value]')).toHaveText(/^\d{2,}$/);
      await expect(cell.locator('.visually-hidden')).not.toBeEmpty();
    }
    // 48 giờ nên còn ít nhất 1 ngày: ô ngày không hidden.
    await expect(tid(box, `${COUNTDOWN}-days`)).not.toHaveAttribute('hidden', /.*/);
  });

  test('AC1-markup quá hạn, sai định dạng, trống, hết hàng: 0 phần tử countdown', async ({ page }) => {
    await page.goto(TE13);
    for (const id of ['b', 'c', 'd', 'e']) {
      await expect(tid(band(page, id), 'featured-product')).toBeAttached();
      await expect(tid(band(page, id), COUNTDOWN), `band ${id}`).toHaveCount(0);
    }
  });

  test('AC1-markup chưa có data-enhanced: khung giữ chỗ nhưng không nhìn thấy', async ({ page }) => {
    await page.route(/\/featured-product\.js/, (route) => route.abort());
    await page.goto(TE13);
    const a = band(page, 'a');
    test.skip(!(await onSale(a)), 'Band A không sale');
    await expect(tid(a, 'featured-product')).not.toHaveAttribute('data-enhanced', /.*/);
    await expect(tid(a, COUNTDOWN)).toBeHidden();
    const box = await tid(a, COUNTDOWN).boundingBox();
    expect(box?.height ?? 0).toBeGreaterThan(0);
  });

  test('AC2 giá gạch và % giảm đúng, không sale thì không có badge', async ({ page }) => {
    await page.goto(TE13);
    for (const id of ['a', 'b', 'c', 'd', 'e']) {
      const scope = tid(band(page, id), 'featured-product-price');
      const discount = tid(scope, 'featured-product-discount');
      if (!(await tid(scope, 'price-compare').count())) {
        await expect(discount, `band ${id}`).toHaveCount(0);
        continue;
      }
      const compare = money(await tid(scope, 'price-compare').textContent());
      const price = money(await tid(scope, 'price-regular').textContent());
      expect(compare).toBeGreaterThan(price);
      const percent = Math.round(((compare - price) * 100) / compare);
      await expect(discount, `band ${id}`).toHaveText(percent > 0 ? `-${percent}%` : 'Sale');
    }
  });

  test('AC2 tiêu đề h2, eyebrow p, mô tả tối đa 50 từ không có thẻ', async ({ page }) => {
    await page.goto(TE13);
    const a = band(page, 'a');
    await expect(tid(a, 'featured-product-title')).toHaveJSProperty('tagName', 'H2');
    await expect(tid(a, 'featured-product-eyebrow')).toHaveJSProperty('tagName', 'P');
    const description = tid(a, 'featured-product-description');
    if (await description.count()) {
      const text = (await description.textContent()) ?? '';
      expect(text.trim().split(/\s+/).length).toBeLessThanOrEqual(50);
      expect(await description.locator('*').count()).toBe(0);
    }
  });

  test('AC2 hết hàng: nút disabled nhãn Sold out, View Detail vẫn tới sản phẩm', async ({ page }) => {
    await page.goto(TE13);
    const c = band(page, 'c');
    const add = tid(c, 'featured-product-add');
    await expect(add).toBeDisabled();
    await expect(add.locator('.product-form__add-label')).toHaveText('Sold out');
    await expect(tid(c, 'featured-product-view-detail')).toHaveAttribute('href', /\/products\//);
  });

  test('AC2 1 variant không có picker; nhiều variant có picker, data-fetch-url, data-regions', async ({ page }) => {
    await page.goto(TE13);
    await expect(tid(band(page, 'd'), 'product-variant-picker')).toHaveCount(0);
    const picker = tid(band(page, 'b'), 'product-variant-picker');
    await expect(picker).toHaveCount(1);
    await expect(picker).toHaveAttribute('data-fetch-url', /\/products\/.+\?view=featured-product$/);
    await expect(picker).toHaveAttribute('data-regions', 'product-price product-buy-buttons');
  });

  test('AC2 form đúng hợp đồng product-form.js', async ({ page }) => {
    await page.goto(TE13);
    const a = band(page, 'a');
    const root = a.locator('product-form');
    for (const attr of ['data-product-id', 'data-product-url', 'data-cart-add-url', 'data-cart-url', 'data-cart-type', 'data-label-add', 'data-label-added', 'data-label-sold-out', 'data-label-unavailable']) {
      await expect(root, attr).toHaveAttribute(attr, /.+/);
    }
    const productId = await root.getAttribute('data-product-id');
    const form = root.locator(`form#product-form-${productId}`);
    await expect(form).toHaveCount(1);
    await expect(form.locator('input[type="hidden"][name="id"]')).toHaveValue(/^\d+$/);
    await expect(tid(root, 'featured-product-status')).toHaveAttribute('role', 'status');
    await expect(tid(root, 'featured-product-error')).toHaveAttribute('role', 'alert');
    await expect(tid(a, 'featured-product-add')).toHaveAttribute('name', 'add');
  });

  test('AC2 gallery: chỉ ảnh, tối đa 8, lazy, từ 2 ảnh có thumbnail là link trong trang', async ({ page }) => {
    await page.goto(TE13);
    for (const id of ['a', 'b', 'c', 'd', 'e']) {
      const scope = band(page, id);
      const items = tid(scope, 'featured-product-media-item');
      const total = await items.count();
      expect(total, `band ${id}`).toBeLessThanOrEqual(8);
      const thumbs = tid(scope, 'featured-product-thumbnail');
      await expect(thumbs, `band ${id}`).toHaveCount(total > 1 ? total : 0);
      for (let i = 0; i < total; i++) {
        await expect(items.nth(i).locator('img')).toHaveAttribute('loading', 'lazy');
        await expect(items.nth(i)).toHaveAttribute('data-featured-media-id', /^\d+$/);
        if (total > 1) {
          const href = await thumbs.nth(i).getAttribute('href');
          expect(href).toBe(`#${await items.nth(i).getAttribute('id')}`);
        }
      }
    }
  });

  test('AC2 có metafield: rating, số đánh giá, 3 dòng spec khi 1 metafield trống', async ({ page }) => {
    test.skip(env('TE13_METAFIELDS_READY') !== 'true', 'TE13_METAFIELDS_READY chưa bật (ES1-T153)');
    await page.goto(TE13);
    const a = band(page, 'a');
    await expect(tid(a, 'featured-product-rating')).toContainText('(4.9)');
    await expect(tid(a, 'featured-product-rating-count')).toHaveText('341 reviews');
    await expect(tid(a, 'featured-product-spec')).toHaveCount(3);
    await expect(tid(a, 'featured-product-spec').locator('th').first()).toHaveAttribute('scope', 'row');
  });

  test('AC2 không có metafield: không có dòng rating, không có bảng', async ({ page }) => {
    await page.goto(TE13);
    // Band B có nhãn spec_1 nhưng sản phẩm không có metafield.
    const b = band(page, 'b');
    await expect(tid(b, 'featured-product-rating')).toHaveCount(0);
    await expect(tid(b, 'featured-product-specs')).toHaveCount(0);
  });

  test('AC2 ?view=featured-product có đúng 2 partial', async ({ page }) => {
    const liquid = readFileSync('blocks/featured-product.liquid', 'utf8');
    const names = [...liquid.matchAll(/{%-?\s*partial\s+'([^']+)'/g)].map((m) => m[1]).sort();
    expect(names).toEqual(['product-buy-buttons', 'product-price']);

    const handle = env('TE4_VARIANTS_HANDLE');
    test.skip(!handle, 'Thiếu TE4_VARIANTS_HANDLE');
    const response = await page.goto(`/products/${handle}?view=featured-product`);
    expect(response?.ok()).toBeTruthy();
    await expect(page.getByTestId('featured-product-price')).toHaveCount(1);
    await expect(page.getByTestId('featured-product-add')).toHaveCount(1);
    await expect(page.getByTestId('product-installments')).toHaveCount(0);
    await expect(page.getByTestId('product-pickup')).toHaveCount(0);
    await expect(page.getByTestId('product-selling-plans')).toHaveCount(0);
  });

  test('AC2 trang chủ đã nối dữ liệu (CTO 07/11): có featured product, không placeholder', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('featured-product')).toHaveCount(1);
    await expect(page.getByTestId('featured-product-placeholder')).toHaveCount(0);
    await expect(page.getByTestId('container-home-featured-product')).toHaveCount(1);
  });

  test('AC2 trang sản phẩm: picker không có 2 thuộc tính mới', async ({ page }) => {
    const handle = env('TE4_VARIANTS_HANDLE');
    test.skip(!handle, 'Thiếu TE4_VARIANTS_HANDLE');
    await page.goto(`/products/${handle}`);
    const picker = page.getByTestId('product-variant-picker');
    await expect(picker).toHaveCount(1);
    await expect(picker).not.toHaveAttribute('data-fetch-url', /.*/);
    await expect(picker).not.toHaveAttribute('data-regions', /.*/);
  });

  test('AC2 axe 0 serious, 0 console error trên /?view=te13', async ({ page }) => {
    const errors = watchConsole(page);
    await page.goto(TE13);
    await expectNotChallenged(page);
    const { violations } = await new AxeBuilder({ page }).analyze();
    const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious.map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
    expect(errors).toEqual([]);
  });
});

test.describe('ES1-T156 TE-13 nojs', () => {
  test.use({ javaScriptEnabled: false });

  test('nojs 0 countdown nhìn thấy', async ({ page }) => {
    await page.goto(TE13);
    const a = band(page, 'a');
    if (await tid(a, COUNTDOWN).count()) await expect(tid(a, COUNTDOWN)).toBeHidden();
  });

  test('nojs thumbnail là link trong trang', async ({ page }) => {
    await page.goto(TE13);
    const thumbs = page.getByTestId('featured-product-thumbnail');
    test.skip((await thumbs.count()) === 0, 'Không band nào có từ 2 ảnh');
    await expect(thumbs.first()).toHaveAttribute('href', /^#FeaturedMedia-/);
  });

  test('nojs select variant, form POST vào giỏ đúng variant', async ({ page }) => {
    // ES1-T224: tắt JS thì ảnh lazy tải ngay, nên không chờ load của trang nhiều band (repro R5). Mỗi bước có timeout riêng để CI nêu đúng bước treo; POST bị chặn báo Cloudflare, không thành timeout.
    // ES1-T300 (CTO 11/11 mục 4): run 42805384493, 42978078054 đỏ ở đây do 'bị Cloudflare chặn (cf-mitigated, status 429)' = môi trường store dev → skip có lý do, không fail gate.
    await skipIfStoreBlocked('ES1-T300: store dev chặn POST /cart/add không JS (môi trường)', () => nojsAddToCart(page));
  });
});

async function nojsAddToCart(page: Page) {
  await gotoStore(page, TE13, { waitUntil: 'domcontentloaded' });
  const b = band(page, 'b');
  await expect(tid(b, 'product-variant-picker')).toBeHidden();
  const select = tid(b, 'product-variant-select');
  await expect(select).toBeVisible();
  const values = await select.locator('option:not([disabled])').evaluateAll((els) => els.map((el) => (el as HTMLOptionElement).value));
  test.skip(values.length < 2, 'TE4_VARIANTS_HANDLE cần từ 2 variant còn hàng');
  await select.selectOption(values[1]);
  const isCartAdd = (res: Response) => res.request().method() === 'POST' && new URL(res.url()).pathname.endsWith('/cart/add');
  const [post] = await Promise.all([
    page.waitForResponse(isCartAdd, { timeout: 15_000 }),
    tid(b, 'featured-product-add').click({ timeout: 10_000 }),
  ]);
  expectStoreAllowed(post);
  expect(post.status(), 'POST /cart/add').toBeLessThan(400);
  // Regex /\/cart/ cũ khớp cả /cart/add, kể cả khi đang ở màn thử thách (repro R7).
  await page.waitForURL((url) => url.pathname.endsWith('/cart'), { waitUntil: 'domcontentloaded', timeout: 15_000 });
  await expectNotChallenged(page);
  const cart = await readCartNoScript<{ items: { variant_id: number }[] }>(page);
  expect(cart.items.map((i) => String(i.variant_id))).toEqual([values[1]]);
}
