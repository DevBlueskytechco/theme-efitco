// KHÔNG CHẮC: spec chưa chạy, chưa type-check (phiên viết không mở được Chrome; chờ CI).
// Ticket ES1-T223: featured-product-status có nội dung sau đổi variant (docs/srs.md#TE-13 AC-H22). Test gốc: tests/e2e/ES1-T158.spec.ts:315.
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T223.spec.ts
import { test, expect, type Locator, type Page } from '@playwright/test';

const TE13 = '/?view=te13';
const STATES = '/?view=te13-states';

type Variant = { id: number; options: string[]; available: boolean; price_html: string };

const band = (page: Page, id: string) => page.getByTestId(`container-${id}`);
const text = (html: string) => html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

async function open(page: Page, url: string, bandId: string) {
  const scope = band(page, bandId);
  await page.goto(url);
  await scope.getByTestId('featured-product').scrollIntoViewIfNeeded();
  const picker = scope.getByTestId('product-variant-picker');
  test.skip((await picker.count()) === 0, 'Sản phẩm không có nhiều variant');
  await expect(picker).toBeVisible();
  return scope;
}

async function other(scope: Locator, want: (v: Variant) => boolean) {
  const id = Number(await scope.locator('input[type="hidden"][name="id"]').inputValue());
  const { variants } = JSON.parse((await scope.locator('script[data-product-variants]').textContent()) ?? '{}') as { variants: Variant[] };
  return variants.find((v) => v.id !== id && want(v));
}

async function choose(scope: Locator, variant: Variant) {
  const fieldsets = scope.getByTestId('product-option');
  for (let i = 0; i < variant.options.length; i += 1) {
    const selector = `input[type="radio"][value="${variant.options[i].replace(/"/g, '\\"')}"]`;
    if (await fieldsets.nth(i).locator(selector).isChecked()) continue;
    await fieldsets.nth(i).getByTestId('product-option-value').filter({ has: scope.page().locator(selector) }).click();
  }
  await expect(scope.locator('input[type="hidden"][name="id"]')).toHaveValue(String(variant.id));
}

test.describe('ES1-T223 featured-product-status sau đổi variant', () => {
  test('1 block, partial: status đọc đúng giá variant mới', async ({ page }) => {
    const scope = await open(page, TE13, 'te13-a');
    const next = await other(scope, (v) => v.available);
    test.skip(!next, 'Cần 2 variant còn hàng');
    await choose(scope, next!);
    await expect(scope.getByTestId('featured-product-status')).toHaveText(text(next!.price_html));
  });

  test('1 block, partial lỗi: status vẫn có giá, không kẹt aria-busy', async ({ page }) => {
    await page.route((url) => url.searchParams.get('view') === 'featured-product', (route) => route.abort());
    const scope = await open(page, TE13, 'te13-a');
    const next = await other(scope, (v) => v.available);
    test.skip(!next, 'Cần 2 variant còn hàng');
    await choose(scope, next!);
    await expect(scope.locator('product-form')).not.toHaveAttribute('aria-busy', /.*/);
    await expect(scope.getByTestId('featured-product-status')).toHaveText(text(next!.price_html));
  });

  test('1 block, variant hết hàng: status có chữ Sold out', async ({ page }) => {
    const scope = await open(page, TE13, 'te13-a');
    const next = await other(scope, (v) => !v.available);
    test.skip(!next, 'Cần 1 variant hết hàng');
    await choose(scope, next!);
    const label = await scope.locator('product-form').getAttribute('data-label-sold-out');
    await expect(scope.getByTestId('featured-product-status')).toContainText(label ?? 'Sold out');
  });

  test('nhiều block, JSON: chỉ status của block đó có nội dung', async ({ page }) => {
    const scope = await open(page, STATES, 'te13-b');
    const next = await other(scope, (v) => v.available);
    test.skip(!next, 'Cần 2 variant còn hàng');
    await choose(scope, next!);
    await expect(scope.getByTestId('featured-product-status')).toHaveText(text(next!.price_html));
    await expect(band(page, 'te13-a').getByTestId('featured-product-status')).toBeEmpty();
  });
});
