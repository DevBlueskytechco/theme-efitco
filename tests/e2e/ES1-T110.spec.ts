// KHÔNG CHẮC: spec chưa chạy (phiên agent không có trình duyệt, chưa type-check bằng tsc). Kết quả thật lấy từ CI e2e trên PR.
// Ticket ES1-T110 TE-6-BE1: assets/collection-filters.js, lọc, sort, phân trang không reload qua 3 partial (docs/srs.md#TE-6 AC1, AC2, AC3;
// drafts/techlead/ES1-T103/task-split.md D7, D8, D10, D11).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T110.spec.ts -g "AC1|AC2|AC3"
// Dữ liệu: TE6_COLLECTION_HANDLE (ES1-T105), thiếu thì /collections/all. Test cần filter, phân trang, swatch skip có lý do khi store không có.
// Request partial: fetch (resourceType fetch) tới đúng pathname của collection; tải cả trang là document.
import { test, expect, type Page, type Request, type Route } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expectNotChallenged } from './support/store-guard';
import { env } from './support/store-data';
import { watchShopPay403 } from './support/console-guard';

const ALL = '/collections/all';
const HANDLE = env('TE6_COLLECTION_HANDLE');
const MAIN = HANDLE ? `/collections/${encodeURIComponent(HANDLE)}` : ALL;
const NO_FILTERS = 'Trang không có filter (Search and Discovery, ES1-T105 #2)';
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  const isShopPay403 = watchShopPay403(page);
  page.on('console', (m) => {
    if (m.type() !== 'error' || isShopPay403(m)) return;
    const text = `${m.text()} @ ${m.location().url}`;
    // route.abort sinh log mạng của Chrome cho chính request bị huỷ: đó là kịch bản test, không phải lỗi theme.
    if (/net::ERR_(FAILED|ABORTED)|Failed to fetch/.test(text)) return;
    if (!IGNORE_CONSOLE.some((r) => r.test(text))) errors.push(text);
  });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  return errors;
}

const groups = (page: Page) => page.getByTestId('collection-filter-group');
const hasFilters = async (page: Page) => (await groups(page).count()) > 0;
const openInputs = (page: Page) => page.locator('[data-testid="collection-filter-input"]:not(:checked):not(:disabled)');
const root = (page: Page) => page.locator('collection-filters');

/** Request partial do JS gửi: fetch, cùng pathname với trang, không tính hop redirect. */
const isPartial = (path: string) => (r: Request) =>
  r.resourceType() === 'fetch' && decodeURI(new URL(r.url()).pathname) === decodeURI(path) && !r.redirectedFrom();

/** Mốc trên window: còn nguyên nghĩa là không navigate. */
async function mark(page: Page) {
  await page.evaluate(() => ((window as unknown as { __t110: number }).__t110 = 1));
}
/** Chặn request partial của trang (predicate thay glob: pathname có ký tự mã hoá). */
const routePartials = (page: Page, path: string, handler: (route: Route) => Promise<void> | void) =>
  page.route(
    (url) => decodeURI(url.pathname) === decodeURI(path) && url.search !== '',
    (route) => (route.request().resourceType() === 'fetch' ? handler(route) : route.continue()),
  );

const marked = (page: Page) => page.evaluate(() => (window as unknown as { __t110?: number }).__t110 === 1);

async function open(page: Page) {
  await expectNotChallenged(page);
  await expect(root(page)).toHaveAttribute('data-enhanced', '');
  const button = page.getByTestId('collection-filter-open');
  if (await button.isVisible()) {
    await button.click();
    await expect(page.getByTestId('collection-filter-drawer')).toBeVisible();
  }
}

/** Chờ JS áp xong: aria-busy gỡ và live region có chữ. */
async function settled(page: Page) {
  await expect(root(page)).not.toHaveAttribute('aria-busy', 'true', { timeout: 15_000 });
  await expect(page.getByTestId('collection-status')).not.toBeEmpty();
}

const hrefs = (page: Page) =>
  page.getByTestId('collection-product').evaluateAll((els) => els.map((el) => el.querySelector('a[href]')?.getAttribute('href') ?? ''));
const label = (page: Page) => page.getByTestId('collection-results').getAttribute('data-results-label');

test.describe('ES1-T110', () => {
  test('AC2 tick filter: URL và lưới đổi, không navigate, badge 1, status có số, aria-busy bật rồi gỡ', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(MAIN);
    test.skip(!(await hasFilters(page)), NO_FILTERS);
    await open(page);
    await mark(page);
    const path = new URL(page.url()).pathname;

    // Giữ request 400 ms để kịp thấy aria-busy
    await routePartials(page, path, async (route) => {
      await new Promise((r) => setTimeout(r, 400));
      await route.continue().catch(() => {});
    });
    const input = openInputs(page).first();
    const name = (await input.getAttribute('name'))!;
    const value = (await input.getAttribute('value'))!;
    const request = page.waitForRequest(isPartial(path));
    await input.check();
    await expect(root(page)).toHaveAttribute('aria-busy', 'true');
    await request;
    await settled(page);

    const url = new URL(page.url());
    expect(url.searchParams.getAll(name)).toContain(value);
    expect(url.searchParams.has('page')).toBe(false);
    expect(await marked(page), 'không navigate').toBe(true);
    await expect(page.getByTestId('collection-filter-count')).toHaveText('1');
    await expect(page.getByTestId('collection-status')).toHaveText(/\d/);
    await expect(page.getByTestId('collection-status')).toHaveText((await label(page))!);
    await expect(page.locator(`[data-testid="collection-filter-input"][name="${name}"][value="${value}"]`).first()).toBeChecked();
    await expect(page.getByTestId('collection-filter-clear')).toBeVisible();
    // Nút Apply ẩn khi có JS
    await expect(page.getByTestId('collection-filter-apply')).toBeHidden();
    // Đổi filter không đổi focus về lưới
    expect(await page.evaluate(() => document.activeElement?.matches('[data-results-label]'))).toBe(false);
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('AC2 Clear all bỏ tick mọi input, URL không còn filter', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(MAIN);
    test.skip(!(await hasFilters(page)), NO_FILTERS);
    await open(page);
    await mark(page);
    await openInputs(page).first().check();
    await settled(page);

    await page.getByTestId('collection-filter-clear').click();
    await expect(page.getByTestId('collection-filter-clear')).toHaveCount(0);
    await settled(page);
    const params = [...new URL(page.url()).searchParams.keys()];
    expect(params.filter((k) => k.startsWith('filter.'))).toEqual([]);
    await expect(page.locator('[data-testid="collection-filter-input"]:checked')).toHaveCount(0);
    await expect(page.getByTestId('collection-filter-count')).toHaveCount(0);
    expect(await marked(page)).toBe(true);
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('AC2 đổi nhanh 3 filter: request cũ bị huỷ, chỉ còn kết quả cuối', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(MAIN);
    test.skip(!(await hasFilters(page)), NO_FILTERS);
    test.skip((await openInputs(page).count()) < 2, 'Cần ít nhất 2 option lọc');
    await open(page);
    await mark(page);
    const path = new URL(page.url()).pathname;
    await routePartials(page, path, async (route) => {
      await new Promise((r) => setTimeout(r, 1_000));
      await route.continue().catch(() => {});
    });
    const failed: string[] = [];
    page.on('requestfailed', (r) => {
      if (isPartial(path)(r)) failed.push(r.url());
    });

    // Khoá theo name + value: sau apply thứ tự :not(:disabled) có thể đổi
    const pick = async (i: number) => {
      const el = openInputs(page).nth(i);
      const n = (await el.getAttribute('name'))!;
      const v = (await el.getAttribute('value'))!;
      return [n, v, page.locator(`[data-testid="collection-filter-input"][name="${n}"][value="${v}"]`).first()] as const;
    };
    const [nameA, valueA, a] = await pick(0);
    const [nameB, valueB, b] = await pick(1);
    await a.check();
    await b.check();
    await a.uncheck();
    await settled(page);

    const params = new URL(page.url()).searchParams;
    expect(params.getAll(nameB)).toContain(valueB);
    expect(params.getAll(nameA)).not.toContain(valueA);
    expect(failed.length, 'ít nhất 2 request cũ bị huỷ').toBeGreaterThanOrEqual(2);
    await expect(page.locator(`[data-testid="collection-filter-input"][name="${nameB}"][value="${valueB}"]`).first()).toBeChecked();
    await expect(page.locator(`[data-testid="collection-filter-input"][name="${nameA}"][value="${valueA}"]`).first()).not.toBeChecked();
    expect(await marked(page)).toBe(true);
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('AC2 mở URL đã lọc trực tiếp ra cùng kết quả với URL do JS tạo', async ({ page }) => {
    test.slow();
    await page.goto(MAIN);
    test.skip(!(await hasFilters(page)), NO_FILTERS);
    await open(page);
    await openInputs(page).first().check();
    await settled(page);
    const url = page.url();
    const jsLabel = await label(page);
    const jsHrefs = await hrefs(page);
    const jsChecked = await page.locator('[data-testid="collection-filter-input"]:checked').count();

    await page.goto(url);
    await expectNotChallenged(page);
    expect(await label(page)).toBe(jsLabel);
    expect(await hrefs(page)).toEqual(jsHrefs);
    expect(await page.locator('[data-testid="collection-filter-input"]:checked').count()).toBe(jsChecked);
  });

  test('AC2 route.abort partial: tải cả trang, 0 pageerror', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(MAIN);
    test.skip(!(await hasFilters(page)), NO_FILTERS);
    await open(page);
    await mark(page);
    const path = new URL(page.url()).pathname;
    await routePartials(page, path, (route) => route.abort('failed'));

    const input = openInputs(page).first();
    const name = (await input.getAttribute('name'))!;
    const value = (await input.getAttribute('value'))!;
    const nav = page.waitForEvent('framenavigated', (f) => f === page.mainFrame() && new URL(f.url()).searchParams.getAll(name).includes(value));
    await input.check();
    await nav;
    await page.waitForLoadState('domcontentloaded');
    await expectNotChallenged(page);
    expect(await marked(page), 'đã tải cả trang').toBe(false);
    await expect(page.locator(`[data-testid="collection-filter-input"][name="${name}"][value="${value}"]`).first()).toBeChecked();
    expect(errors.filter((e) => e.startsWith('pageerror')), errors.join('\n')).toEqual([]);
  });

  test('AC2 axe 0 serious sau khi áp filter', async ({ page }) => {
    await page.goto(MAIN);
    test.skip(!(await hasFilters(page)), NO_FILTERS);
    await open(page);
    await openInputs(page).first().check();
    await settled(page);
    await expectNotChallenged(page); // ES1-T217 TC-03: kiểm màn thử thách ngay trước khi quét (Claude Code 12/11)
    const r = await new AxeBuilder({ page }).include('collection-filters').analyze();
    const bad = r.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? ''));
    expect(bad.map((v) => `${v.impact} ${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
  });

  test('AC2 swatch trên card vẫn đổi ảnh sau khi apply', async ({ page }) => {
    await page.goto(MAIN);
    await expectNotChallenged(page);
    await expect(root(page)).toHaveAttribute('data-enhanced', '');
    // Sort đi qua cùng luồng apply với filter mà không làm rỗng lưới
    const sort = page.getByTestId('collection-sort');
    const options = sort.locator('option:not([selected])');
    test.skip((await options.count()) === 0, 'Chỉ có 1 cách sort');
    await sort.selectOption((await options.first().getAttribute('value'))!);
    await settled(page);

    const card = page.getByTestId('product-card').filter({ has: page.locator('input[data-image-src]:not(:checked)') }).first();
    test.skip((await card.count()) === 0, 'Không có card nhiều swatch có ảnh (TE3_SWATCH_HANDLE)');
    const target = card.locator('input[data-image-src]:not(:checked)').first();
    const src = (await target.getAttribute('data-image-src'))!;
    const id = (await target.getAttribute('id'))!;
    await card.locator(`label[for="${id}"]`).click();
    await expect(card.getByTestId('product-card-image')).toHaveAttribute('src', src);
  });

  test('AC3 sort: sort_by đổi, thứ tự đổi, filter còn, không navigate', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(MAIN);
    await expectNotChallenged(page);
    await expect(root(page)).toHaveAttribute('data-enhanced', '');
    await mark(page);
    let name = '';
    let value = '';
    if (await hasFilters(page)) {
      await open(page);
      const input = openInputs(page).first();
      name = (await input.getAttribute('name'))!;
      value = (await input.getAttribute('value'))!;
      await input.check();
      await settled(page);
      const close = page.getByTestId('collection-filter-close');
      if (await close.isVisible()) await close.click();
    }
    const before = await hrefs(page);
    const sort = page.getByTestId('collection-sort');
    const values = await sort.locator('option').evaluateAll((els) => els.map((el) => (el as HTMLOptionElement).value));
    const current = await sort.inputValue();
    // Chọn cách sort cho thứ tự khác: thử lần lượt, ưu tiên price
    const order = [...values.filter((v) => v !== current && v.startsWith('price')), ...values.filter((v) => v !== current && !v.startsWith('price'))];
    let changed = false;
    for (const v of order) {
      await sort.selectOption(v);
      await expect.poll(() => new URL(page.url()).searchParams.get('sort_by')).toBe(v);
      await settled(page);
      await expect(sort).toHaveValue(v);
      if (name) expect(new URL(page.url()).searchParams.getAll(name)).toContain(value);
      if (JSON.stringify(await hrefs(page)) !== JSON.stringify(before)) {
        changed = true;
        break;
      }
    }
    test.skip(!changed && before.length < 2, 'Ít hơn 2 sản phẩm, không thấy được thứ tự');
    expect(changed, 'có cách sort làm đổi thứ tự').toBe(true);
    expect(await marked(page)).toBe(true);
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('AC1 page 2 không reload: giữ filter và sort, focus vào kết quả', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(MAIN);
    await expectNotChallenged(page);
    await expect(root(page)).toHaveAttribute('data-enhanced', '');
    const sortValue = await page.getByTestId('collection-sort').inputValue();
    test.skip((await page.getByTestId('pagination-next').count()) === 0, 'Collection không quá 24 sản phẩm');
    await mark(page);
    const before = await hrefs(page);
    const href = (await page.getByTestId('pagination-next').getAttribute('href'))!;

    await page.getByTestId('pagination-next').click();
    await expect.poll(() => new URL(page.url()).searchParams.get('page')).toBe('2');
    await settled(page);
    expect(new URL(page.url()).href).toBe(new URL(href, page.url()).href);
    expect(await marked(page), 'không navigate').toBe(true);
    expect(await hrefs(page)).not.toEqual(before);
    await expect(page.getByTestId('pagination-current')).toHaveText('2');
    expect(await page.evaluate(() => document.activeElement?.matches('[data-results-label]'))).toBe(true);
    await expect(page.getByTestId('collection-results')).toHaveAttribute('tabindex', '-1');
    await expect(page.getByTestId('collection-results')).toBeInViewport();
    await expect(page.getByTestId('collection-sort')).toHaveValue(sortValue);
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('AC1 page 2 sau khi lọc vẫn giữ filter', async ({ page }) => {
    await page.goto(MAIN);
    test.skip(!(await hasFilters(page)), NO_FILTERS);
    await open(page);
    await mark(page);
    const input = openInputs(page).first();
    const name = (await input.getAttribute('name'))!;
    const value = (await input.getAttribute('value'))!;
    await input.check();
    await settled(page);
    test.skip((await page.getByTestId('pagination-next').count()) === 0, 'Kết quả lọc không quá 24 sản phẩm');
    const close = page.getByTestId('collection-filter-close');
    if (await close.isVisible()) await close.click();

    await page.getByTestId('pagination-next').click();
    await expect.poll(() => new URL(page.url()).searchParams.get('page')).toBe('2');
    await settled(page);
    expect(new URL(page.url()).searchParams.getAll(name)).toContain(value);
    await expect(page.locator(`[data-testid="collection-filter-input"][name="${name}"][value="${value}"]`).first()).toBeChecked();
    expect(await marked(page)).toBe(true);
  });
});

test.describe('ES1-T110 contract', () => {
  const js = readFileSync(join(process.cwd(), 'assets/collection-filters.js'), 'utf8');
  const filters = readFileSync(join(process.cwd(), 'blocks/collection-filters.liquid'), 'utf8');
  const products = readFileSync(join(process.cwd(), 'blocks/collection-products.liquid'), 'utf8');

  test('AC2 contract: 3 tên partial khớp Liquid, bundle tối đa 5248 B, script ngoài partial', () => {
    for (const [name, liquid] of [['collection-products', products], ['collection-filters', filters], ['collection-filter-count', products]] as const) {
      expect(js).toContain(`"${name}"`);
      expect(liquid).toContain(`{% partial '${name}' %}`);
    }
    expect(Buffer.byteLength(js)).toBeLessThanOrEqual(5248);
    const script = filters.indexOf("'collection-filters.js' | asset_url");
    expect(script).toBeGreaterThan(filters.indexOf('{% endpartial %}'));
    expect(js).not.toMatch(/pushState/);
    expect(js).toMatch(/customElements\.get\("collection-filters"\)/);
  });
});
