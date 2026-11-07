// KHÔNG CHẮC: spec chưa chạy (không có preview trong sandbox, chưa type-check); scope-guard chặn dev-fe ghi tests/ → Orchestrator chép sang tests/e2e/ES1-T128.spec.ts.
// Ticket ES1-T128 TE-8-FE1: trang search nhóm theo object_type, paginate 24, filter + sort dùng chung TE-6, 0 kết quả (docs/srs.md#TE-8 AC2, AC3; drafts/techlead/ES1-T123/task-split.md D1–D4, D9; ES1-T124 #4 #5).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T128.spec.ts -g "AC2|AC3|nojs"
// Dữ liệu: ES1-T125 chưa có TE8_* → q mặc định 'a' (như TE-1), từ khoá 0 kết quả mặc định là chuỗi ngẫu nhiên. Test cần filter / trang 2 skip có lý do.
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { expectNotChallenged } from './support/store-guard';
import { env } from './support/store-data';
import { watchShopPay403 } from './support/console-guard';

const Q = {
  all: env('TE8_QUERY_ALL') || 'a',
  paged: env('TE8_QUERY_PAGED') || 'a',
  filter: env('TE8_QUERY_FILTER') || 'a',
  none: env('TE8_QUERY_NONE') || 'zzqx8128nomatch',
};
const TYPES = 'product,article,page';
const ORDER = ['product', 'article', 'page'];
const PAGE_SIZE = 24;

const searchUrl = (q: string, extra = '') =>
  `/search?q=${encodeURIComponent(q)}&type=${encodeURIComponent(TYPES)}&options%5Bprefix%5D=last${extra}`;

const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  const isShopPay403 = watchShopPay403(page);
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    if (isShopPay403(m)) return;
    const text = `${m.text()} @ ${m.location().url}`;
    if (!IGNORE_CONSOLE.some((r) => r.test(text))) errors.push(text);
  });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  return errors;
}

async function expectAxeClean(page: Page, include = 'main') {
  await expectNotChallenged(page);
  const r = await new AxeBuilder({ page }).include(include).analyze();
  const bad = r.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? ''));
  const report = bad.map((v) => `${v.impact} ${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
  expect(report, `axe serious/critical trong ${include}`).toEqual([]);
}

/** Tổng kết quả, số đầu tiên trong data-results-label (đã dịch). */
async function resultTotal(page: Page): Promise<number> {
  const label = await page.locator('[data-results-label]').getAttribute('data-results-label');
  return Number((label ?? '').replace(/[^\d]/g, ''));
}

const items = (page: Page) =>
  page.locator('[data-testid="search-results-product"], [data-testid="search-results-article"], [data-testid="search-results-page"]');

const hasFilters = async (page: Page) => (await page.getByTestId('collection-filter-group').count()) > 0;

test.describe('ES1-T128 markup', () => {
  test('AC3 form GET: action search, label, input ẩn type và options[prefix], 1 h1', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto('/search');
    await expectNotChallenged(page);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.getByTestId('search-title')).toBeVisible();

    const form = page.getByTestId('search-form');
    await expect(form).toHaveAttribute('method', 'get');
    await expect(form).toHaveAttribute('role', 'search');
    expect(new URL((await form.getAttribute('action'))!, page.url()).pathname).toMatch(/\/search$/);

    const input = page.getByTestId('search-input');
    await expect(input).toHaveAttribute('name', 'q');
    expect(await input.evaluate((el) => (el as HTMLInputElement).labels?.length)).toBe(1);
    await expect(input).toHaveAccessibleName(/\S/);
    await expect(form.locator('input[type="hidden"][name="type"]')).toHaveValue(TYPES);
    await expect(form.locator('input[type="hidden"][name="options[prefix]"]')).toHaveValue('last');

    // Chưa tìm: không có vùng kết quả
    await expect(page.getByTestId('search-results')).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test('AC2 nhóm theo object_type đúng thứ tự, nhóm có heading, tổng phần tử đúng page_size', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(searchUrl(Q.all));
    await expectNotChallenged(page);
    const total = await resultTotal(page);
    test.skip(total === 0, `q=${Q.all} không có kết quả (ES1-T125)`);

    const groups = page.getByTestId('search-results-group');
    const types = await groups.evaluateAll((els) => els.map((el) => el.getAttribute('data-object-type')));
    expect(types.length).toBeGreaterThan(0);
    expect(types, 'thứ tự product, article, page').toEqual(ORDER.filter((t) => types.includes(t)));
    expect(new Set(types).size, 'mỗi loại 1 nhóm').toBe(types.length);

    for (const type of types) {
      const group = groups.and(page.locator(`[data-object-type="${type}"]`));
      await expect(group.getByTestId('search-results-group-heading')).toHaveCount(1);
      await expect(group.locator('h2')).toHaveCount(1);
      expect(await group.getByTestId(`search-results-${type}`).count(), `nhóm ${type} rỗng thì không được render`).toBeGreaterThan(0);
    }

    expect(await items(page).count()).toBe(Math.min(PAGE_SIZE, total));
    await expect(page.getByTestId('search-results-count')).toContainText(String(total));
    await expect(page.locator('[data-results-label]')).toHaveCount(1);
    await expect(page.getByTestId('collection-status')).toHaveAttribute('role', 'status');

    // Product dùng product card, heading h3
    const product = page.getByTestId('search-results-product').first();
    if (await product.count()) {
      await expect(product.getByTestId('product-card')).toHaveCount(1);
      await expect(product.locator('h3 [data-testid="product-card-title"]')).toHaveCount(1);
    }
    expect(errors).toEqual([]);
  });

  test('AC2 axe trang có kết quả và trang 0 kết quả', async ({ page }) => {
    await page.goto(searchUrl(Q.all));
    await expectAxeClean(page);
    await page.goto(searchUrl(Q.none));
    await expectAxeClean(page);
  });

  test('AC2 axe drawer filter mở ở 360', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto(searchUrl(Q.filter));
    await expectNotChallenged(page);
    test.skip(!(await hasFilters(page)), `search.filters rỗng với q=${Q.filter} (ES1-T125)`);
    await page.getByTestId('collection-filter-open').click();
    await expect(page.getByTestId('collection-filter-drawer')).toBeVisible();
    await expectAxeClean(page, '#collection-filter-drawer');
  });

  test('AC2 q chứa thẻ HTML hiển thị như chữ, không tạo phần tử', async ({ page }) => {
    const errors = watchErrors(page);
    let dialog = false;
    page.on('dialog', async (d) => { dialog = true; await d.dismiss(); });
    const payload = '<img src=x onerror=alert(1)>';
    await page.goto(searchUrl(payload));
    await expectNotChallenged(page);
    const main = page.locator('main');
    await expect(main.locator('img[src="x"]')).toHaveCount(0);
    const message = page.getByTestId('search-results-empty').or(page.getByTestId('search-results-count'));
    await expect(message.first()).toContainText(payload);
    await expect(page.getByTestId('search-input')).toHaveValue(payload);
    expect(dialog, 'onerror không được chạy').toBe(false);
    expect(errors.filter((e) => e.startsWith('pageerror'))).toEqual([]);
  });

  test('AC2 q có dấu và & hiển thị đúng, không thấy mã amp', async ({ page }) => {
    const q = 'Tạ & đơn';
    await page.goto(searchUrl(q));
    await expectNotChallenged(page);
    const message = page.getByTestId('search-results-empty').or(page.getByTestId('search-results-count')).first();
    await expect(message).toContainText(q);
    expect(await message.textContent()).not.toContain('&amp;');
    await expect(page.getByTestId('search-input')).toHaveValue(q);
  });
});

test.describe('ES1-T128 nojs', () => {
  test.use({ javaScriptEnabled: false });

  test('nojs AC3 submit form ra kết quả, URL giữ q và type', async ({ page }) => {
    await page.goto('/search');
    await expectNotChallenged(page);
    await page.getByTestId('search-input').fill(Q.all);
    await page.getByTestId('search-submit').click();
    await page.waitForURL(/\/search\?/);
    const params = new URL(page.url()).searchParams;
    expect(params.get('q')).toBe(Q.all);
    expect(params.get('type')).toBe(TYPES);
    expect(params.get('options[prefix]')).toBe('last');
    await expect(page.getByTestId('search-results')).toBeVisible();
    await expect(page.getByTestId('search-input')).toHaveValue(Q.all);
  });

  test('nojs AC2 trang 2 giữ q và type, số phần tử là phần còn lại hoặc page_size', async ({ page }) => {
    await page.goto(searchUrl(Q.paged));
    await expectNotChallenged(page);
    const total = await resultTotal(page);
    const next = page.getByTestId('pagination-next');
    test.skip((await next.count()) === 0, `q=${Q.paged} không quá ${PAGE_SIZE} kết quả (TE8_QUERY_PAGED, ES1-T125)`);
    await next.click();
    await page.waitForURL(/[?&]page=2\b/);
    const params = new URL(page.url()).searchParams;
    expect(params.get('q')).toBe(Q.paged);
    expect(params.get('type')).toBe(TYPES);
    await expect(page.getByTestId('pagination-current')).toHaveText('2');
    expect(await items(page).count()).toBe(Math.min(PAGE_SIZE, total - PAGE_SIZE));
  });

  test('nojs AC2 sort + Apply: URL có sort_by, q còn', async ({ page }) => {
    await page.goto(searchUrl(Q.all));
    await expectNotChallenged(page);
    test.skip((await page.getByTestId('search-results').count()) === 0, 'Không có vùng kết quả');
    const sort = page.getByTestId('collection-sort');
    expect(await sort.evaluate((el) => (el as HTMLSelectElement).form?.id)).toBe('collection-filter-form');
    const value = await sort.locator('option:not([selected])').first().getAttribute('value');
    test.skip(!value, 'Chỉ có 1 cách sắp xếp');
    await sort.selectOption(value!);
    await page.getByTestId('collection-sort-apply').click();
    await page.waitForURL(/sort_by=/);
    const params = new URL(page.url()).searchParams;
    expect(params.get('sort_by')).toBe(value);
    expect(params.get('q')).toBe(Q.all);
    expect(params.get('type')).toBe(TYPES);
    await expect(page.getByTestId('collection-sort')).toHaveValue(value!);
  });

  test('nojs AC2 filter + Apply ở 1280 thu hẹp kết quả, q còn, Clear all giữ q', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(searchUrl(Q.filter));
    await expectNotChallenged(page);
    test.skip(!(await hasFilters(page)), `search.filters rỗng với q=${Q.filter} (TE8_QUERY_FILTER, ES1-T125)`);
    const form = page.locator('#collection-filter-form');
    await expect(form).not.toHaveAttribute('data-collection-handle');
    const before = await resultTotal(page);
    const input = page.locator('[data-testid="collection-filter-input"]:not(:checked):not(:disabled)').first();
    test.skip((await input.count()) === 0, 'Không có option lọc nào chọn được');
    await input.check();
    await page.getByTestId('collection-filter-apply').click();
    await page.waitForURL(/filter\./);
    const params = new URL(page.url()).searchParams;
    expect(params.get('q')).toBe(Q.filter);
    expect(params.get('type')).toBe(TYPES);
    expect(await resultTotal(page)).toBeLessThanOrEqual(before);
    await expect(page.getByTestId('collection-filter-count')).toHaveText('1');

    await page.getByTestId('collection-filter-clear').click();
    const cleared = new URL(page.url()).searchParams;
    expect(cleared.get('q')).toBe(Q.filter);
    expect([...cleared.keys()].some((k) => k.startsWith('filter.'))).toBe(false);
  });

  test('nojs AC2 từ khoá không có kết quả: thông báo + link tất cả sản phẩm', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(searchUrl(Q.none));
    await expectNotChallenged(page);
    await expect(page.getByTestId('search-results-empty')).toBeVisible();
    await expect(page.getByTestId('search-results-empty')).toContainText(Q.none);
    const cta = page.getByTestId('search-results-empty-cta');
    expect(new URL((await cta.getAttribute('href'))!, page.url()).pathname).toMatch(/\/collections\/all$/);
    await expect(page.getByTestId('search-results-group')).toHaveCount(0);
    await expect(page.getByTestId('collection-empty-clear')).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test('nojs AC2 360: drawer mở và đóng được', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto(searchUrl(Q.filter));
    await expectNotChallenged(page);
    test.skip(!(await hasFilters(page)), `search.filters rỗng với q=${Q.filter} (ES1-T125)`);
    const drawer = page.getByTestId('collection-filter-drawer');
    await expect(drawer).toBeHidden();
    await page.getByTestId('collection-filter-open').click();
    await expect(drawer).toBeVisible();
    await page.getByTestId('collection-filter-close').click();
    await expect(drawer).toBeHidden();
  });
});
