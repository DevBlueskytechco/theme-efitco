// KHÔNG CHẮC: spec chưa chạy, chưa type-check (phiên dev-fe không có PREVIEW_URL, STORE_PASSWORD; globalSetup cần preview); scope-guard chặn dev-fe ghi tests/ → Orchestrator chép sang tests/e2e/ES1-T342.spec.ts.
// Ticket ES1-T342 TE-17-R2-FE3: featured product, why choose (image-with-text split), FAQ ở 360 / 768 / 1280; partial featured-product (ADR 0008).
// AC: TE-13 AC2, AC6 (số đo), AC-H22 (phần markup partial), TE-7 AC2, AC3, AC7.
// Nguồn số đo: docs/ui-spec/index-mobile-b.md §2, §5, §7; docs/ui-spec/index-1280.md §1 khối 10, 13, 15, §2.6. Sai số 2 px (ES1-T309 #4).
// Dữ liệu: featured ở /?view=te13-states band a (sản phẩm có ảnh); why ở /?view=te7 band te7-iwt-left; FAQ ở /?view=te7 band te7-faq.
// Đo bố cục chỉ chạy project desktop (đổi viewport tay). Thiếu ảnh/spec/sản phẩm thì skip có lý do, không coi là đạt.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect, type Locator, type Page } from './support/test';
import { expectNotChallenged, gotoStore } from './support/store-guard';
import { env } from './support/store-data';

const ROOT = process.cwd();
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');
const TOL = 2;
const TE13 = '/?view=te13-states';
const TE7 = '/?view=te7';

type Box = { x: number; y: number; width: number; height: number };
const tid = (scope: Page | Locator, id: string) => scope.getByTestId(id);
const band = (page: Page, id: string) => page.getByTestId(`container-${id}`);
const box = async (l: Locator): Promise<Box> => {
  await l.scrollIntoViewIfNeeded();
  const b = await l.boundingBox();
  expect(b, 'phần tử có hộp hiển thị').not.toBeNull();
  return b!;
};
const near = (actual: number, expected: number, label: string) =>
  expect(Math.abs(actual - expected), `${label}: ${actual} ≈ ${expected}`).toBeLessThanOrEqual(TOL);

async function open(page: Page, path: string, width: number) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width, height: 900 });
  await gotoStore(page, path);
  await expectNotChallenged(page);
}

async function noOverflow(page: Page) {
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(over, 'không cuộn ngang').toBeLessThanOrEqual(0);
}

test.describe('ES1-T342 @static', () => {
  test.beforeEach(({}, info) => { test.skip(info.project.name !== 'desktop', 'tĩnh, chạy 1 lần'); });

  test('ADR 0008: featured product có đúng 1 partial featured-product, picker xin đúng vùng đó', () => {
    const liquid = read('blocks/featured-product.liquid');
    const names = [...liquid.matchAll(/{%-?\s*partial\s+'([^']+)'/g)].map((m) => m[1]);
    expect(names).toEqual(['featured-product']);
    expect(liquid).toContain("regions: 'featured-product'");
    expect(liquid).not.toMatch(/product-price|product-buy-buttons/);
    expect(read('templates/product.featured-product.liquid')).not.toMatch(/product-price|product-buy-buttons/);
  });

  test('TE-13 AC6: "View Detail" có chữ ẩn " of {product}" từ locale', () => {
    const locale = JSON.parse(read('locales/en.default.json'));
    expect(locale.blocks.featured_product.view_detail_suffix).toBe('of {{ product }}');
    const liquid = read('blocks/featured-product.liquid');
    expect(liquid.match(/<span class="visually-hidden"> {{ view_detail_suffix }}<\/span>/g)).toHaveLength(2);
  });
});

test.describe('ES1-T342 featured product (TE-13 AC6)', () => {
  test.beforeEach(({}, info) => { test.skip(info.project.name !== 'desktop', 'đo bố cục ở project desktop'); });

  async function featured(page: Page, width: number) {
    await open(page, TE13, width);
    const scope = band(page, 'te13-a');
    test.skip((await tid(scope, 'featured-product').count()) === 0, 'band te13-a chưa có sản phẩm');
    return scope;
  }

  test('360: ảnh 320 × 320, nút xếp dọc rộng hết cột, primary trên', async ({ page }) => {
    const scope = await featured(page, 360);
    const item = await box(tid(scope, 'featured-product-media-item').first());
    near(item.width, 320, 'ảnh rộng');
    near(item.height, 320, 'ảnh cao');
    const add = await box(tid(scope, 'featured-product-add'));
    const detail = await box(tid(scope, 'featured-product-view-detail'));
    near(add.width, 320, 'nút Add rộng');
    near(detail.width, 320, 'nút View Detail rộng');
    near(detail.y - (add.y + add.height), 12, 'cách nhau 12');
    await noOverflow(page);
  });

  test('360: bảng thông số mỗi hàng nhãn trên, giá trị dưới', async ({ page }) => {
    const scope = await featured(page, 360);
    const rows = tid(scope, 'featured-product-spec');
    test.skip((await rows.count()) === 0, 'sản phẩm band a chưa có metafield custom.spec_n (TE13_METAFIELDS_READY)');
    const label = await box(rows.first().locator('th'));
    const value = await box(rows.first().locator('td'));
    expect(value.y).toBeGreaterThanOrEqual(label.y + label.height - 1);
    near(value.x, label.x, 'giá trị thẳng mép nhãn');
  });

  test('768: ảnh 728 × 546 (4:3), 2 nút cùng 1 hàng, bảng 2 cột', async ({ page }) => {
    const scope = await featured(page, 768);
    const item = await box(tid(scope, 'featured-product-media-item').first());
    near(item.width, 728, 'ảnh rộng');
    near(item.height, 546, 'ảnh cao');
    const add = await box(tid(scope, 'featured-product-add'));
    const detail = await box(tid(scope, 'featured-product-view-detail'));
    near(detail.y, add.y, 'cùng hàng');
    const rows = tid(scope, 'featured-product-spec');
    if (await rows.count()) {
      const label = await box(rows.first().locator('th'));
      const value = await box(rows.first().locator('td'));
      expect(value.x).toBeGreaterThan(label.x + label.width - 1);
    }
    await noOverflow(page);
  });

  test('1280: 2 cột 580 | 80 | 580, ảnh 580 × 566', async ({ page }) => {
    const scope = await featured(page, 1280);
    const item = await box(tid(scope, 'featured-product-media-item').first());
    near(item.x, 20, 'mép trái nội dung');
    near(item.width, 580, 'ảnh rộng');
    near(item.height, 566, 'ảnh cao');
    const title = await box(tid(scope, 'featured-product-title'));
    near(title.x, 680, 'cột chi tiết bắt đầu sau khoảng 80');
  });

  test('View Detail: tên truy cập gồm tên sản phẩm', async ({ page }) => {
    const scope = await featured(page, 1280);
    const title = (await tid(scope, 'featured-product-title').textContent())?.trim() ?? '';
    await expect(tid(scope, 'featured-product-view-detail')).toHaveAccessibleName(`View Detail of ${title}`);
  });

  test('AC-H22 markup: ?view=featured-product trả 1 vùng featured-product-region chứa giá và nút', async ({ page }) => {
    const handle = env('TE4_VARIANTS_HANDLE');
    test.skip(!handle, 'Thiếu TE4_VARIANTS_HANDLE');
    await gotoStore(page, `/products/${handle}?view=featured-product`);
    const region = page.getByTestId('featured-product-region');
    await expect(region).toHaveCount(1);
    await expect(tid(region, 'featured-product-price')).toHaveCount(1);
    await expect(tid(region, 'featured-product-add')).toHaveCount(1);
    await expect(page.getByTestId('product-variant-picker')).toHaveAttribute('data-regions', 'featured-product');
  });
});

test.describe('ES1-T342 why choose (TE-7 AC3, AC7)', () => {
  test.beforeEach(({}, info) => { test.skip(info.project.name !== 'desktop', 'đo bố cục ở project desktop'); });

  async function why(page: Page, width: number) {
    await open(page, TE7, width);
    const scope = band(page, 'te7-iwt-left');
    test.skip((await tid(scope, 'image-with-text-image').count()) === 0, 'te7-iwt-left chưa có ảnh chính');
    return scope;
  }

  test('360: ảnh 360 × 360 trên chữ, 2 ảnh nhỏ ẩn và không tải', async ({ page }) => {
    const scope = await why(page, 360);
    const image = await box(tid(scope, 'image-with-text-image'));
    near(image.width, 360, 'ảnh rộng');
    near(image.height, 360, 'ảnh cao');
    const content = await box(tid(scope, 'image-with-text-content'));
    expect(content.y).toBeGreaterThanOrEqual(image.y + image.height - 1);
    const accents = tid(scope, 'image-with-text-accent');
    for (const accent of await accents.all()) {
      await expect(accent).toBeHidden();
      expect(await accent.locator('img').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0), 'ảnh nhỏ không tải').toBe(false);
    }
    await noOverflow(page);
  });

  test('768: ảnh 768 × 576, ảnh nhỏ 168 đè đáy ảnh lớn 40 và 100 góc dưới', async ({ page }) => {
    const scope = await why(page, 768);
    const image = await box(tid(scope, 'image-with-text-image'));
    near(image.width, 768, 'ảnh rộng');
    near(image.height, 576, 'ảnh cao');
    const accents = tid(scope, 'image-with-text-accent');
    test.skip((await accents.count()) < 2, 'te7-iwt-left chưa có 2 ảnh nhỏ');
    const first = await box(accents.nth(0));
    const second = await box(accents.nth(1));
    near(first.width, 168, 'ảnh nhỏ 1');
    near(image.y + image.height - first.y, 40, 'đè đáy ảnh lớn');
    near(first.x + first.width, 748, 'mép cuối ảnh nhỏ 1');
    near(second.width, 100, 'ảnh nhỏ 2');
    near(second.x + second.width, 716, 'ảnh nhỏ 2 cách mép cuối 32');
    const heading = await box(tid(scope, 'image-with-text-heading'));
    expect(heading.x + heading.width, 'tiêu đề không đè ảnh nhỏ 1').toBeLessThanOrEqual(first.x + 1);
    await noOverflow(page);
  });

  test('1280: ảnh 600 rộng, chữ từ x 680, display 80, ảnh nhỏ 134 và 80', async ({ page }) => {
    const scope = await why(page, 1280);
    const image = await box(tid(scope, 'image-with-text-image'));
    near(image.x, 0, 'ảnh tràn trái');
    near(image.width, 600, 'ảnh rộng');
    const heading = tid(scope, 'image-with-text-heading');
    near((await box(heading)).x, 680, 'chữ cách ảnh 80');
    expect(await heading.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))).toBeCloseTo(80, 0);
    const accents = tid(scope, 'image-with-text-accent');
    if ((await accents.count()) === 2) {
      near((await box(accents.nth(0))).width, 134, 'ảnh nhỏ 1');
      near((await box(accents.nth(1))).width, 80, 'ảnh nhỏ 2');
    }
  });
});

test.describe('ES1-T342 FAQ (TE-7 AC2, AC7)', () => {
  test.beforeEach(({}, info) => { test.skip(info.project.name !== 'desktop', 'đo bố cục ở project desktop'); });

  async function faq(page: Page, width: number) {
    await open(page, TE7, width);
    const scope = band(page, 'te7-faq');
    test.skip((await tid(scope, 'faq-image').count()) === 0 || (await tid(scope, 'faq-stat-2').count()) === 0, 'te7-faq chưa có ảnh và 2 ô số');
    return scope;
  }

  for (const width of [360, 768]) {
    test(`${width}: hàng câu hỏi ≥ 56, icon +/− cùng màu chữ câu hỏi`, async ({ page }) => {
      const scope = await faq(page, width);
      for (const summary of await tid(scope, 'faq-question').all()) {
        expect((await box(summary)).height).toBeGreaterThanOrEqual(56);
        const [text, icon] = await summary.evaluate((el) => [getComputedStyle(el).color, getComputedStyle(el, '::before').borderBlockStartColor]);
        expect(icon).toBe(text);
      }
    });
  }

  test('360: accordion → ảnh; 2 ô 142 đè đáy ảnh 48, lùi 12 mỗi bên', async ({ page }) => {
    const scope = await faq(page, 360);
    const list = await box(tid(scope, 'faq-list'));
    const image = await box(tid(scope, 'faq-image'));
    const s1 = await box(tid(scope, 'faq-stat-1'));
    const s2 = await box(tid(scope, 'faq-stat-2'));
    expect(image.y).toBeGreaterThanOrEqual(list.y + list.height);
    near(image.width, 320, 'ảnh rộng');
    near(image.height, 341, 'ảnh cao (509 / 542)');
    near(image.y + image.height - s1.y, 48, 'ô đè đáy ảnh');
    near(s1.x, image.x + 12, 'ô 1 lùi 12');
    near(s1.width, 142, 'ô 1');
    near(s2.x + s2.width, image.x + image.width - 12, 'ô 2 lùi 12');
    near(s2.x - (s1.x + s1.width), 12, 'gap 12');
    await noOverflow(page);
  });

  test('768: ảnh 553 × 589 sát mép cuối; hàng ô 582 mép đầu 0, mỗi ô 285, cách đáy ảnh 7.5%', async ({ page }) => {
    const scope = await faq(page, 768);
    const image = await box(tid(scope, 'faq-image'));
    const s1 = await box(tid(scope, 'faq-stat-1'));
    const s2 = await box(tid(scope, 'faq-stat-2'));
    near(image.width, 553, 'ảnh rộng');
    near(image.x + image.width, 748, 'ảnh sát mép cuối');
    near(s1.x, 20, 'ô 1 mép đầu 0');
    near(s1.width, 285, 'ô 1');
    near(s2.x + s2.width, 20 + 582, 'hàng ô 582');
    near(image.y + image.height - (s1.y + s1.height), image.height * 0.075, 'cách đáy 7.5%');
    await noOverflow(page);
  });

  test('1280: 580 | 80 | 580, ảnh 442 × 471, ô 225 cách đáy 40', async ({ page }) => {
    const scope = await faq(page, 1280);
    const list = await box(tid(scope, 'faq-list'));
    const image = await box(tid(scope, 'faq-image'));
    const s1 = await box(tid(scope, 'faq-stat-1'));
    near(list.width, 580, 'cột câu hỏi');
    near(image.width, 442, 'ảnh rộng');
    near(image.height, 471, 'ảnh cao');
    near(image.x + image.width, 1260, 'ảnh sát mép cuối');
    near(s1.x, 680, 'ô 1 mép đầu cột');
    near(s1.width, 225, 'ô 1');
    near(image.y + image.height - (s1.y + s1.height), 40, 'cách đáy 40');
  });
});
