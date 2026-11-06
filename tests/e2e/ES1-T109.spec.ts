// KHÔNG CHẮC: spec chưa chạy (phiên viết không có preview, chưa type-check); scope-guard chặn dev-fe ghi tests/ → Orchestrator chép sang tests/e2e/ES1-T109.spec.ts.
// Ticket ES1-T109 TE-6-FE2: form filter GET, sort, drawer popover, badge (docs/srs.md#TE-6 AC2, AC3, AC4; drafts/techlead/ES1-T103/task-split.md D5, D6, D7, D11, D12; ES1-T104).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T109.spec.ts -g "AC2-markup|AC3-markup|AC4-markup|nojs"
// Dữ liệu (ES1-T105 chưa trả lời): thiếu TE6_* → dùng /collections/all, test cần filter skip khi trang không có collection-filter-group.
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { env } from './support/store-data';

const ALL = '/collections/all';
const ENV = {
  collection: env('TE6_COLLECTION_HANDLE'),
  noResultQuery: env('TE6_FILTER_NO_RESULT_QUERY'),
};
const MAIN = ENV.collection ? `/collections/${encodeURIComponent(ENV.collection)}` : ALL;
const NO_FILTERS = 'Trang không có filter (Search and Discovery, ES1-T105 #2)';

const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const text = `${m.text()} @ ${m.location().url}`;
    if (!IGNORE_CONSOLE.some((r) => r.test(text))) errors.push(text);
  });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  return errors;
}

async function expectAxeClean(page: Page, include: string) {
  const r = await new AxeBuilder({ page }).include(include).analyze();
  const bad = r.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? ''));
  const report = bad.map((v) => `${v.impact} ${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
  expect(report, `axe serious/critical trong ${include}`).toEqual([]);
}

const groups = (page: Page) => page.getByTestId('collection-filter-group');
const hasFilters = async (page: Page) => (await groups(page).count()) > 0;

/** Số sản phẩm tổng, đọc từ chữ đã dịch trong data-results-label (số đầu tiên). */
async function resultCount(page: Page): Promise<number> {
  const label = await page.getByTestId('collection-results').getAttribute('data-results-label');
  return Number((label ?? '').replace(/[^\d]/g, ''));
}

/** Input lọc đầu tiên chưa tick, không disabled. */
const firstOpenInput = (page: Page) =>
  page.locator('[data-testid="collection-filter-input"]:not(:checked):not(:disabled)').first();

async function openDrawer(page: Page) {
  await page.getByTestId('collection-filter-open').click();
  await expect(page.getByTestId('collection-filter-drawer')).toBeVisible();
}

test.describe('ES1-T109 markup', () => {
  test('AC2-markup form GET, hook BE, live region, nhãn lỗi giá', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(MAIN);
    const path = new URL(page.url()).pathname;
    const form = page.locator('#collection-filter-form');
    await expect(form).toHaveCount(1);
    await expect(form).toHaveAttribute('method', 'get');
    expect(decodeURI(await form.getAttribute('action') ?? '')).toBe(decodeURI(path));
    await expect(form).toHaveAttribute('data-testid', 'collection-filter-form');
    await expect(form).toHaveAttribute('data-collection-handle', /\S/);
    await expect(form).toHaveAttribute('data-products-count', /^\d+$/);
    await expect(form).toHaveAttribute('data-collection-id', /^\d*$/);

    const element = page.locator('collection-filters');
    await expect(element).toHaveAttribute('data-label-price-invalid', /\S/);
    await expect(element).not.toHaveAttribute('data-label-error');

    const status = page.getByTestId('collection-status');
    await expect(status).toHaveAttribute('role', 'status');
    await expect(status).toBeEmpty();
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('AC2-markup nhóm filter: details mở, data-filter-param, input trong label, disabled đúng', async ({ page }) => {
    await page.goto(MAIN);
    test.skip(!(await hasFilters(page)), NO_FILTERS);
    await page.setViewportSize({ width: 1280, height: 800 });

    const report = await groups(page).evaluateAll((els) =>
      els.map((el) => ({
        tag: el.tagName,
        open: (el as HTMLDetailsElement).open,
        param: el.getAttribute('data-filter-param'),
      })),
    );
    for (const g of report) {
      expect(g.tag).toBe('DETAILS');
      expect(g.open).toBe(true);
      expect(g.param).toMatch(/^filter\./);
    }

    const options = await page.getByTestId('collection-filter-option').evaluateAll((els) =>
      els.map((el) => {
        const input = el.querySelector('input') as HTMLInputElement;
        return {
          tag: el.tagName,
          type: input.type,
          name: input.name,
          value: input.value,
          checked: input.checked,
          disabled: input.disabled,
          count: Number(el.querySelector('.filter-option__count')?.textContent),
        };
      }),
    );
    for (const o of options) {
      expect(o.tag).toBe('LABEL');
      expect(o.type).toBe('checkbox');
      expect(o.name).toMatch(/^filter\./);
      expect(o.value).not.toBe('');
      expect(o.disabled, `${o.name}=${o.value}`).toBe(o.count === 0 && !o.checked);
    }
  });

  test('AC2-markup swatch: ô 24px, input vẫn là checkbox', async ({ page }) => {
    await page.goto(MAIN);
    const swatch = page.getByTestId('collection-filter-swatch').first();
    test.skip((await swatch.count()) === 0, 'Không có filter swatch (ES1-T105 #2)');
    await page.setViewportSize({ width: 1280, height: 800 });
    const box = await swatch.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(24);
    expect(box?.height).toBeGreaterThanOrEqual(24);
    const input = page.getByTestId('collection-filter-option').filter({ has: swatch }).getByTestId('collection-filter-input');
    await expect(input).toHaveAttribute('type', 'checkbox');
  });

  test('AC2-markup giá: 2 input number có label, min 0, max theo range, đơn vị tiền chính', async ({ page }) => {
    await page.goto(MAIN);
    const min = page.getByTestId('collection-filter-price-min');
    test.skip((await min.count()) === 0, 'Không có filter giá (ES1-T105 #2)');
    await page.setViewportSize({ width: 1280, height: 800 });
    const max = page.getByTestId('collection-filter-price-max');
    for (const input of [min, max]) {
      await expect(input).toHaveAttribute('type', 'number');
      await expect(input).toHaveAttribute('min', '0');
      await expect(input).toHaveAttribute('step', 'any');
      await expect(input).toHaveAttribute('name', /^filter\.v\.price\.(gte|lte)$/);
      await expect(input).toHaveAttribute('max', /^\d+(\.\d+)?$/);
      expect((await input.evaluate((el) => (el as HTMLInputElement).labels?.[0]?.textContent ?? '')).trim()).not.toBe('');
    }
  });

  test('AC3-markup sort: select gắn form, ngoài form về DOM, đúng option mặc định', async ({ page }) => {
    await page.goto(MAIN);
    const sort = page.getByTestId('collection-sort');
    await expect(sort).toHaveAttribute('name', 'sort_by');
    await expect(sort).toHaveAttribute('form', 'collection-filter-form');
    expect(await sort.evaluate((el) => (el as HTMLSelectElement).form?.id)).toBe('collection-filter-form');
    expect(await sort.locator('option').count()).toBeGreaterThan(1);
    expect(await sort.evaluate((el) => (el as HTMLSelectElement).labels?.length)).toBe(1);
    // Có JS: nút Apply của sort nằm trong noscript nên không có phần tử
    await expect(page.getByTestId('collection-sort-apply')).toHaveCount(0);

    const value = await sort.locator('option').nth(1).getAttribute('value');
    await page.goto(`${MAIN}?sort_by=${encodeURIComponent(value!)}`);
    await expect(page.getByTestId('collection-sort')).toHaveValue(value!);
  });

  test('AC4-markup 1280: form là cột trái, không có nút mở và nút đóng', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(MAIN);
    test.skip(!(await hasFilters(page)), NO_FILTERS);
    const form = page.getByTestId('collection-filter-form');
    await expect(form).toBeVisible();
    await expect(page.getByTestId('collection-filter-open')).toBeHidden();
    await expect(page.getByTestId('collection-filter-close')).toBeHidden();
    const formBox = (await form.boundingBox())!;
    const gridBox = (await page.getByTestId('collection-products').boundingBox())!;
    expect(formBox.x + formBox.width).toBeLessThanOrEqual(gridBox.x);
    expect(await page.getByTestId('collection-filter-drawer').evaluate((el) => getComputedStyle(el).position)).toBe('static');
    await expectAxeClean(page, 'main');
  });

  test('AC4-markup 360: drawer mở đóng, chạm 44px, axe sạch khi mở, form ẩn khi đóng', async ({ page }) => {
    const errors = watchErrors(page);
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto(MAIN);
    test.skip(!(await hasFilters(page)), NO_FILTERS);
    const open = page.getByTestId('collection-filter-open');
    const drawer = page.getByTestId('collection-filter-drawer');
    await expect(drawer).toBeHidden();
    const openBox = (await open.boundingBox())!;
    expect(openBox.height).toBeGreaterThanOrEqual(44);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), 'không tràn ngang').toBe(true);

    await openDrawer(page);
    const closeBox = (await page.getByTestId('collection-filter-close').boundingBox())!;
    expect(closeBox.height).toBeGreaterThanOrEqual(44);
    expect(closeBox.width).toBeGreaterThanOrEqual(44);
    await expectAxeClean(page, '[data-testid="collection-filter-drawer"]');

    await page.getByTestId('collection-filter-close').click();
    await expect(drawer).toBeHidden();
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('AC4-markup không có filter: không có nút mở, sort vẫn gắn form', async ({ page }) => {
    await page.goto(ALL);
    test.skip(await hasFilters(page), `${ALL} có filter`);
    await page.setViewportSize({ width: 360, height: 800 });
    await expect(page.getByTestId('collection-filter-open')).toBeHidden();
    await expect(page.getByTestId('collection-filter-drawer')).toBeHidden();
    expect(await page.getByTestId('collection-sort').evaluate((el) => (el as HTMLSelectElement).form?.id)).toBe('collection-filter-form');
  });
});

test.describe('ES1-T109 nojs', () => {
  test.use({ javaScriptEnabled: false });

  test('nojs sort + Apply: URL có sort_by, chạy cả khi không có filter', async ({ page }) => {
    await page.goto(MAIN);
    const sort = page.getByTestId('collection-sort');
    const value = await sort.locator('option:not([selected])').first().getAttribute('value');
    await sort.selectOption(value!);
    await page.getByTestId('collection-sort-apply').click();
    await expect(page).toHaveURL(new RegExp(`[?&]sort_by=${value}\\b`));
    await expect(page.getByTestId('collection-sort')).toHaveValue(value!);
  });

  test('nojs filter + Apply ở 1280: URL có param_name, kết quả không tăng, Clear all xoá', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(MAIN);
    test.skip(!(await hasFilters(page)), NO_FILTERS);
    await expect(page.getByTestId('collection-filter-clear')).toHaveCount(0);
    const before = await resultCount(page);

    const input = firstOpenInput(page);
    const name = (await input.getAttribute('name'))!;
    const value = (await input.getAttribute('value'))!;
    await input.check();
    await page.getByTestId('collection-filter-apply').click();

    const url = new URL(page.url());
    expect(url.searchParams.getAll(name)).toContain(value);
    expect(await resultCount(page)).toBeLessThanOrEqual(before);
    await expect(page.locator(`[data-testid="collection-filter-input"][value="${value}"]`).first()).toBeChecked();

    const clear = page.getByTestId('collection-filter-clear');
    await expect(clear).toBeVisible();
    await clear.click();
    expect(new URL(page.url()).search).toBe('');
    await expect(page.locator('[data-testid="collection-filter-input"]:checked')).toHaveCount(0);
  });

  test('nojs sort giữ filter đang áp', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(MAIN);
    test.skip(!(await hasFilters(page)), NO_FILTERS);
    const input = firstOpenInput(page);
    const name = (await input.getAttribute('name'))!;
    const value = (await input.getAttribute('value'))!;
    await input.check();
    await page.getByTestId('collection-filter-apply').click();

    const sort = page.getByTestId('collection-sort');
    const sortValue = await sort.locator('option:not([selected])').first().getAttribute('value');
    await sort.selectOption(sortValue!);
    await page.getByTestId('collection-sort-apply').click();

    const params = new URL(page.url()).searchParams;
    expect(params.get('sort_by')).toBe(sortValue);
    expect(params.getAll(name)).toContain(value);
  });

  test('nojs giá min max: URL có 2 tham số, giá trị giữ lại, kết quả không tăng', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(MAIN);
    const min = page.getByTestId('collection-filter-price-min');
    test.skip((await min.count()) === 0, 'Không có filter giá (ES1-T105 #2)');
    const max = page.getByTestId('collection-filter-price-max');
    const ceiling = Number(await max.getAttribute('max'));
    test.skip(!(ceiling > 0), 'range_max bằng 0');
    const before = await resultCount(page);
    const top = String(Math.floor(ceiling / 2));

    await min.fill('0');
    await max.fill(top);
    await page.getByTestId('collection-filter-apply').click();

    const params = new URL(page.url()).searchParams;
    expect(params.get('filter.v.price.gte')).toBe('0');
    expect(params.get('filter.v.price.lte')).toBe(top);
    expect(Number(await page.getByTestId('collection-filter-price-max').inputValue())).toBe(Number(top));
    expect(await resultCount(page)).toBeLessThanOrEqual(before);
  });

  test('nojs 360: nút Filter mở được drawer, đóng được, badge đúng số, tên truy cập có số', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto(MAIN);
    test.skip(!(await hasFilters(page)), NO_FILTERS);
    await expect(page.getByTestId('collection-filter-count')).toHaveCount(0);

    await openDrawer(page);
    await page.getByTestId('collection-filter-close').click();
    await expect(page.getByTestId('collection-filter-drawer')).toBeHidden();

    await openDrawer(page);
    await firstOpenInput(page).check();
    await page.getByTestId('collection-filter-apply').click();

    const open = page.getByTestId('collection-filter-open');
    await expect(page.getByTestId('collection-filter-count')).toHaveText('1');
    await expect(open).toHaveAccessibleName(/1/);
    await expect(page.getByTestId('collection-filter-drawer')).toBeHidden();
  });

  test('nojs badge: tick 1 option + giá thì đếm 2', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto(MAIN);
    const max = page.getByTestId('collection-filter-price-max');
    test.skip((await max.count()) === 0, 'Không có filter giá (ES1-T105 #2)');
    await openDrawer(page);
    await firstOpenInput(page).check();
    await max.fill(String(await max.getAttribute('max')));
    await page.getByTestId('collection-filter-apply').click();
    await expect(page.getByTestId('collection-filter-count')).toHaveText('2');
  });

  test('nojs lọc ra 0 sản phẩm: thông báo và link collection-empty-clear thay CTA', async ({ page }) => {
    test.skip(!ENV.noResultQuery, 'Thiếu TE6_FILTER_NO_RESULT_QUERY (ES1-T105 #3)');
    await page.goto(`${MAIN}?${ENV.noResultQuery}`);
    await expect(page.getByTestId('collection-empty')).toBeVisible();
    await expect(page.getByTestId('collection-empty-cta')).toHaveCount(0);
    const clear = page.getByTestId('collection-empty-clear');
    await clear.click();
    expect(new URL(page.url()).search).toBe('');
  });
});
