// KHÔNG CHẮC: spec chưa chạy, chưa type-check (phiên viết không mở được Chrome; chờ CI).
// Ticket ES1-T223: featured-product-status có nội dung sau đổi variant (docs/srs.md#TE-13 AC-H22). Test gốc: tests/e2e/ES1-T158.spec.ts:315.
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T223.spec.ts
// ES1-T350 (ADR 0008): không còn JSON danh sách biến thể; biến thể lấy từ /products/<handle>.js trong trang, chọn theo tên trong nhãn.
// Status đọc products.variant.loaded "[giá trị], [giá], [tồn]": so giá đang hiện của band thay vì price_html.
import { test, expect, type Locator, type Page } from './support/test';
import { pageJson, requireJson } from './support/product-data';
import { chooseOptions, optionValue } from './support/variant-picker';

const TE13 = '/?view=te13';
const STATES = '/?view=te13-states';

type Variant = { id: number; options: string[]; available: boolean; price: number };

const band = (page: Page, id: string) => page.getByTestId(`container-${id}`);
// Tiền trên trang → cents (như TE-4.spec.ts).
function cents(value: string): number {
  const m = value.match(/\d[\d.,\s  ']*/);
  if (!m) return NaN;
  const t = m[0].replace(/[\s  ']/g, '').replace(/[.,]+$/, '');
  const last = Math.max(t.lastIndexOf('.'), t.lastIndexOf(','));
  const n = last >= 0 && t.length - last - 1 !== 3 ? Number(`${t.slice(0, last).replace(/[.,]/g, '')}.${t.slice(last + 1)}`) : Number(t.replace(/[.,]/g, ''));
  return Math.round(n * 100);
}
const priceText = async (scope: Locator) => ((await scope.getByTestId('featured-product-price').getByTestId('price-regular').first().textContent()) ?? '').trim();

async function open(page: Page, url: string, bandId: string) {
  const scope = band(page, bandId);
  await page.goto(url);
  await scope.getByTestId('featured-product').scrollIntoViewIfNeeded();
  const picker = scope.getByTestId('product-variant-picker');
  test.skip((await picker.count()) === 0, 'Sản phẩm không có nhiều variant');
  // ES1-T344 (ADR 0010): picker + product-form của featured nạp khi tương tác vùng mua (không theo viewport); picker ẩn tới khi defined.
  await scope.getByTestId('featured-product-add').hover();
  await expect(picker).toBeVisible();
  return scope;
}

async function other(scope: Locator, want: (v: Variant) => boolean) {
  const id = Number(await scope.locator('input[type="hidden"][name="id"]').inputValue());
  const path = (await scope.locator('product-form').getAttribute('data-product-url'))!.split('?')[0];
  const { variants } = requireJson(await pageJson<{ variants: Variant[] }>(scope.page(), `${path}.js`), `${path}.js`);
  return variants.find((v) => v.id !== id && want(v));
}

async function choose(scope: Locator, variant: Variant) {
  await chooseOptions(scope, variant.options);
  await expect(scope.locator('input[type="hidden"][name="id"]')).toHaveValue(String(variant.id));
}

test.describe('ES1-T223 featured-product-status sau đổi variant', () => {
  test('1 block, partial: status đọc đúng giá variant mới', async ({ page }) => {
    const scope = await open(page, TE13, 'te13-a');
    const next = await other(scope, (v) => v.available);
    test.skip(!next, 'Cần 2 variant còn hàng');
    await choose(scope, next!);
    await expect(scope.locator('product-form')).not.toHaveAttribute('aria-busy', /.*/);
    const price = await priceText(scope);
    expect(cents(price), 'giá hiện là giá biến thể mới').toBe(next!.price);
    await expect(scope.getByTestId('featured-product-status')).toContainText(price);
  });

  // ES1-T350 AC15: lỗi tải thì giữ biến thể cũ (không đổi id), báo lỗi ở role=alert của option; status không đọc giá của biến thể chưa tải.
  test('1 block, partial lỗi: giữ giá + id cũ, alert có chữ, status không báo giá sai, không kẹt aria-busy', async ({ page }) => {
    await page.route((url) => url.searchParams.get('view') === 'featured-product', (route) => route.abort());
    const scope = await open(page, TE13, 'te13-a');
    const id = await scope.locator('input[type="hidden"][name="id"]').inputValue();
    const price = await priceText(scope);
    const next = await other(scope, (v) => v.available);
    test.skip(!next, 'Cần 2 variant còn hàng');
    const fieldsets = scope.getByTestId('product-option');
    for (const [i, name] of next!.options.entries()) {
      const label = optionValue(fieldsets.nth(i), name);
      if (await label.locator('input').isChecked()) continue;
      await label.click();
      break;
    }
    await expect(scope.locator('product-form')).not.toHaveAttribute('aria-busy', /.*/);
    await expect(scope.getByTestId('product-option-error').filter({ hasText: /\S/ })).toHaveCount(1);
    await expect(scope.locator('input[type="hidden"][name="id"]')).toHaveValue(id);
    expect(await priceText(scope)).toBe(price);
    // Không còn "Loading …" của lần tải lỗi; lỗi do alert của option đọc.
    await expect(scope.getByTestId('featured-product-status')).toBeEmpty();
  });

  test('1 block, variant hết hàng: status có chữ Sold out', async ({ page }) => {
    const scope = await open(page, TE13, 'te13-a');
    const next = await other(scope, (v) => !v.available);
    test.skip(!next, 'Cần 1 variant hết hàng');
    await choose(scope, next!);
    const label = await scope.locator('product-form').getAttribute('data-label-sold-out');
    await expect(scope.getByTestId('featured-product-status')).toContainText(label ?? 'Sold out');
  });

  test('nhiều block (D4): chỉ status của block đó có nội dung', async ({ page }) => {
    const scope = await open(page, STATES, 'te13-b');
    const next = await other(scope, (v) => v.available);
    test.skip(!next, 'Cần 2 variant còn hàng');
    await choose(scope, next!);
    await expect(scope.locator('product-form')).not.toHaveAttribute('aria-busy', /.*/);
    const price = await priceText(scope);
    expect(cents(price)).toBe(next!.price);
    await expect(scope.getByTestId('featured-product-status')).toContainText(price);
    await expect(band(page, 'te13-a').getByTestId('featured-product-status')).toBeEmpty();
  });
});
