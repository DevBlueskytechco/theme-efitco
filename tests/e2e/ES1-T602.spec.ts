// KHÔNG CHẮC: spec chưa chạy, chưa type-check (phiên viết không có trình duyệt và preview); chờ CI.
// Ticket ES1-T602 (theo review #331 ES1-T344; TE-13 AC2, AC-H22): featured product, picker nạp lười theo tương tác (ADR 0010).
// Khách đổi radio rồi bấm Add trước khi product-variant-picker.js defined → assets/product-form.js ready() khoá nút, chờ
// customElements.whenDefined + picker tải xong lựa chọn (aria-busy trên product-form gỡ) rồi mới dựng FormData.
// id không đổi sau khi chờ (lỗi tải, tổ hợp không tồn tại, 9 s không có picker) → không POST.
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T602.spec.ts
// POST thêm giỏ (Cart API add) luôn bị mock 422 (đếm body, không đụng giỏ thật của store).
import { readFileSync, statSync } from 'node:fs';
import { test, expect, type Locator, type Page } from './support/test';
import { CART_GLOB } from './support/cart-api';
import { pageJson, requireJson } from './support/product-data';
import { setCheckedByName } from './support/variant-picker';

const TE13 = '/?view=te13';
const PICKER_JS = /\/product-variant-picker\.js/;
const FORM = 'assets/product-form.js';
const read = (f: string) => readFileSync(f, 'utf8');

type Variant = { id: number; options: string[]; available: boolean };

const band = (page: Page) => page.getByTestId('container-te13-a');
const hiddenId = (scope: Locator) => scope.locator('input[type="hidden"][name="id"]');
const defined = (page: Page, name: string) => page.evaluate((n) => Boolean(customElements.get(n)), name);

async function otherVariant(scope: Locator) {
  const path = (await scope.locator('product-form').getAttribute('data-product-url'))!.split('?')[0];
  const variants = requireJson(await pageJson<{ variants: Variant[] }>(scope.page(), `${path}.js`), `${path}.js`).variants;
  const id = Number(await hiddenId(scope).inputValue());
  return variants.find((v) => v.id !== id && v.available);
}

/** Giữ request product-variant-picker.js tới khi release(). */
async function holdPicker(page: Page) {
  let release = () => {};
  const held = new Promise<void>((r) => (release = r));
  await page.route(PICKER_JS, async (route) => {
    await held;
    await route.continue();
  });
  return () => release();
}

/** Mock 422 cho Cart API add, trả danh sách body đã POST. */
async function mockAdd(page: Page) {
  const posted: string[] = [];
  await page.route(CART_GLOB.add, (route) => {
    posted.push(route.request().postData() ?? '');
    return route.fulfill({ status: 422, contentType: 'application/json', body: JSON.stringify({ description: 'ES1-T602 mock' }) });
  });
  return posted;
}

const idInBody = (id: number | string) => new RegExp(`name="id"\\r?\\n\\r?\\n${id}\\r?\\n`);

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  return errors;
}

/** Mở TE13, product-form defined, picker bị giữ (chưa defined). */
async function openHeld(page: Page) {
  const release = await holdPicker(page);
  const posted = await mockAdd(page);
  await page.goto(TE13);
  const scope = band(page);
  test.skip((await scope.getByTestId('product-variant-picker').count()) === 0, 'Sản phẩm không có nhiều variant');
  const add = scope.getByTestId('featured-product-add');
  test.skip(await add.isDisabled(), 'Variant đầu hết hàng');
  await add.scrollIntoViewIfNeeded();
  const next = await otherVariant(scope);
  test.skip(!next, 'Cần 2 variant còn hàng');
  // ES1-T344: rê vào vùng mua → lazy-module nạp product-form.js và picker (picker bị giữ).
  await add.hover();
  await expect.poll(() => defined(page, 'product-form')).toBe(true);
  expect(await defined(page, 'product-variant-picker')).toBe(false);
  return { scope, add, next: next!, release, posted };
}

test.describe('ES1-T602 tĩnh', () => {
  test('trần byte: product-form.js ≤ 6900 (ES1-T96), ≤ 7168 (ADR 0010); featured-product.js, picker không đổi trần', () => {
    expect(statSync(FORM).size).toBeLessThanOrEqual(6900);
    expect(statSync('assets/featured-product.js').size).toBeLessThanOrEqual(1024);
    expect(statSync('assets/product-variant-picker.js').size).toBeLessThanOrEqual(7168);
    expect(read(FORM)).not.toMatch(/console\.|localStorage|sessionStorage/);
  });

  test('submit chờ picker trước khi dựng FormData; không import tĩnh module theme', () => {
    const js = read(FORM);
    expect(js).toContain('product-variant-picker:not(:defined)');
    expect(js).toContain('customElements.whenDefined(');
    expect(js).toMatch(/r\.checked != r\.defaultChecked/);
    const submit = js.slice(js.indexOf('async submit('));
    expect(submit.indexOf('await this.ready()')).toBeGreaterThan(0);
    expect(submit.indexOf('await this.ready()')).toBeLessThan(submit.indexOf('new FormData(this.form)'));
    expect(js).not.toMatch(/^import\s/m);
  });

  test('contract: picker nằm trong product-form, ngoài form; picker đặt aria-busy trên product-form và ghi input id', () => {
    const block = read('blocks/featured-product.liquid');
    const buy = block.slice(block.indexOf('<product-form'), block.indexOf('</product-form>'));
    expect(buy.indexOf("render 'product-variant-picker'")).toBeGreaterThan(0);
    expect(buy.indexOf("render 'product-variant-picker'")).toBeLessThan(buy.indexOf("form 'product'"));
    expect(buy).toContain('<input type="hidden" name="id" value="{{ current_variant.id }}">');
    expect(block).toMatch(/data-lazy-module="{{ 'product-variant-picker\.js' \| asset_url }}"\s*{% endunless %}\s*data-lazy-on="interaction"/);
    const picker = read('assets/product-variant-picker.js');
    expect(picker).toContain('this.root = this.closest("product-form")');
    expect(picker).toContain('"ariaBusy"');
    expect(picker).toContain('this.form.elements.id.value = v.id');
    // connectedCallback tự tải lựa chọn khác defaultChecked (product-form.js dựa vào đây).
    expect(picker).toMatch(/this\.loaded = this\.ids\(\(r\) => r\.defaultChecked\);\s*if \(this\.ids\(\) != `\$\{this\.loaded\}`\) this\.load\(this\.ids\(\)\);/);
  });
});

test.describe('ES1-T602 storefront /?view=te13', () => {
  test('đổi radio, bấm Add khi picker chưa defined: chờ, POST mang id biến thể mới', async ({ page }) => {
    const errors = watchErrors(page);
    const { scope, add, next, release, posted } = await openHeld(page);
    const before = await hiddenId(scope).inputValue();

    await setCheckedByName(scope.getByTestId('product-variant-picker'), next.options);
    await add.click();
    // Đang chờ picker: không POST, nút khoá + aria-busy.
    await expect(add).toHaveAttribute('aria-busy', 'true');
    await expect(add).toBeDisabled();
    await page.waitForTimeout(600);
    expect(posted).toHaveLength(0);
    expect(await hiddenId(scope).inputValue()).toBe(before);

    release();
    await expect.poll(() => posted.length).toBe(1);
    expect(posted[0]).toMatch(idInBody(next.id));
    await expect(hiddenId(scope)).toHaveValue(String(next.id));
    await expect(scope.getByTestId('featured-product-error')).toHaveText('ES1-T602 mock');
    await expect(scope.getByTestId('featured-product-add')).toBeEnabled();
    await expect(scope.getByTestId('featured-product-add')).not.toHaveAttribute('aria-busy', /.*/);
    expect(errors).toEqual([]);
  });

  test('bấm Add 2 lần khi đang chờ: chỉ 1 POST', async ({ page }) => {
    const { scope, add, next, release, posted } = await openHeld(page);
    await setCheckedByName(scope.getByTestId('product-variant-picker'), next.options);
    await add.click();
    // Nút đã disabled: gửi submit lần 2 bằng requestSubmit (như chạm đúp trên mobile trước khi disabled kịp vẽ).
    await scope.locator('form[id^="product-form-"]').evaluate((f) => (f as HTMLFormElement).requestSubmit());
    release();
    await expect.poll(() => posted.length).toBe(1);
    await page.waitForTimeout(800);
    expect(posted).toHaveLength(1);
    expect(posted[0]).toMatch(idInBody(next.id));
  });

  test('picker tải lựa chọn lỗi (route.abort): không POST biến thể cũ, Try again hiện, nút mở lại', async ({ page }) => {
    const errors = watchErrors(page);
    await page.route((url) => url.searchParams.get('view') === 'featured-product', (route) => route.abort());
    const { scope, add, next, release, posted } = await openHeld(page);
    const before = await hiddenId(scope).inputValue();

    await setCheckedByName(scope.getByTestId('product-variant-picker'), next.options);
    await add.click();
    release();
    await expect(scope.getByTestId('product-option-retry').filter({ visible: true })).toHaveCount(1);
    await expect(add).toBeEnabled();
    await expect(add).not.toHaveAttribute('aria-busy', /.*/);
    await page.waitForTimeout(600);
    expect(posted).toHaveLength(0);
    await expect(hiddenId(scope)).toHaveValue(before);
    expect(errors).toEqual([]);
  });

  test('không đổi radio: Add gửi ngay biến thể hiện tại, không chờ picker', async ({ page }) => {
    const { scope, add, release, posted } = await openHeld(page);
    const current = await hiddenId(scope).inputValue();
    await add.click();
    await expect.poll(() => posted.length).toBe(1);
    expect(posted[0]).toMatch(idInBody(current));
    expect(await defined(page, 'product-variant-picker')).toBe(false);
    release();
  });
});
