// KHÔNG CHẮC: spec chưa chạy trên preview (phiên QA không có PREVIEW_URL/STORE_PASSWORD); kết quả thật lấy từ CI e2e trên PR, chưa báo đạt.
// Ticket ES1-T112 TE-6-QA1: trang collection + list-collections, docs/srs.md#TE-6 AC1–AC7 (0.4) + phần 0.5 mà AC1/AC4/AC5 trỏ tới (AC10 focus, AC14 empty, AC15).
// Test case: drafts/qa/ES1-T112/test-cases.md (TC-xx trong tên test). Phạm vi: drafts/techlead/ES1-T307/task-split.md §3 dòng ES1-T112.
// Gộp: ES1-T108 (FE1), ES1-T109 (FE2), ES1-T110 (BE1, gồm ES1-T111) thành 1 file theo ticket; 3 file cũ đã xoá. Tên file theo CONVENTION.md mục Test (tests/e2e/<ticket>.spec.ts).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T112.spec.ts (project desktop + mobile Pixel 7). Mốc 360/768/1280/1920 bằng setViewportSize.
// Dữ liệu: support/store-data.ts (TE6_COLLECTION_HANDLE, TE6_EMPTY_COLLECTION_HANDLE, TE6_IMAGE_COLLECTION_HANDLE, TE6_FILTER_NO_RESULT_QUERY); thiếu thì /collections/all hoặc skip có lý do.
// Mọi test có trang đi qua fixture `guard` (support/store-guard.ts watchStore): 0 console error, 0 pageerror; script nền tảng Shopify, 429, Cloudflare bỏ qua.
import { test as base, expect, type Locator, type Page, type Request, type Route } from './support/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { env } from './support/store-data';
import { expectNotChallenged, gotoStore, watchStore, type StoreWatch } from './support/store-guard';
import { productData } from './support/product-data';
import { newStoreContext } from './support/store-noise';

const ALL = '/collections/all';
const LIST = '/collections';
const PAGE_SIZE = 24;
const MAX_PAGES = 5;
const ENV = {
  collection: env('TE6_COLLECTION_HANDLE'),
  empty: env('TE6_EMPTY_COLLECTION_HANDLE'),
  image: env('TE6_IMAGE_COLLECTION_HANDLE'),
  noResultQuery: env('TE6_FILTER_NO_RESULT_QUERY'),
};
const MAIN = ENV.collection ? `/collections/${encodeURIComponent(ENV.collection)}` : ALL;
const NO_FILTERS = 'Trang không có collection-filter-group (Search and Discovery tắt, ES1-T105 #2)';
const NO_PAGES = `${ALL} không quá 24 sản phẩm (store dev có 2 065, ES1-T417)`;
const WIDTHS = [360, 768, 1280, 1920] as const;
/** Tuỳ chọn context theo project (thiết bị, baseURL, cookie mật khẩu) cho trang phụ mở bằng browser.newContext. */
const STORE_CONTEXT = () => {
  const { baseURL, storageState, viewport, userAgent, deviceScaleFactor, isMobile, hasTouch } = test.info().project.use;
  return { baseURL, storageState, viewport, userAgent, deviceScaleFactor, isMobile, hasTouch };
};

const test = base.extend<{ guard: StoreWatch }>({
  guard: async ({ page }, use) => {
    const watch = watchStore(page);
    await use(watch);
    await watch.finish();
  },
});

// ---------- helper ----------
const T = (id: string) => `[data-testid="${id}"]`;
const root = (page: Page) => page.locator('collection-filters');
const groups = (page: Page) => page.getByTestId('collection-filter-group');
const hasFilters = async (page: Page) => (await groups(page).count()) > 0;
const openInputs = (page: Page) => page.locator(`${T('collection-filter-input')}:not(:checked):not(:disabled)`);
const inputBy = (page: Page, name: string, value: string) => page.locator(`${T('collection-filter-input')}[name="${name}"][value="${value}"]`).first();
const label = (page: Page) => page.getByTestId('collection-results').getAttribute('data-results-label');
const resultCount = async (page: Page) => Number(((await label(page)) ?? '').replace(/\D/g, ''));
const hrefs = (page: Page) =>
  page.getByTestId('collection-product').evaluateAll((els) => els.map((el) => el.querySelector('a[href]')?.getAttribute('href') ?? ''));
const noHorizontalScroll = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
const gridColumns = (grid: Locator) => grid.evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length);
const size = async (page: Page, width: number) => page.setViewportSize({ width, height: 900 });
// Nút tắt: code dùng -disabled, pagination.md §10 ghi giữ testid cũ → nhận cả hai, phân biệt bằng aria-disabled.
const prevDisabled = (page: Page) => page.getByTestId(/^pagination-previous(-disabled)?$/).and(page.locator('[aria-disabled="true"]'));
const nextDisabled = (page: Page) => page.getByTestId(/^pagination-next(-disabled)?$/).and(page.locator('[aria-disabled="true"]'));
const prevLink = (page: Page) => page.locator(`a${T('pagination-previous')}`);
const nextLink = (page: Page) => page.locator(`a${T('pagination-next')}`);

async function expectAxeClean(page: Page, include: string) {
  await expectNotChallenged(page);
  const r = await new AxeBuilder({ page }).include(include).analyze();
  const bad = r.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? ''));
  expect(bad.map((v) => `${v.impact} ${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`), `axe serious/critical trong ${include}`).toEqual([]);
}

/** Request partial do JS gửi: fetch, cùng pathname với trang, không tính hop redirect. */
const isPartial = (path: string) => (r: Request) =>
  r.resourceType() === 'fetch' && decodeURI(new URL(r.url()).pathname) === decodeURI(path) && !r.redirectedFrom();
/** Chặn request partial của trang (predicate thay glob: pathname có ký tự mã hoá). Document đi tiếp. */
const routePartials = (page: Page, path: string, handler: (route: Route) => Promise<void> | void) =>
  page.route(
    (url) => decodeURI(url.pathname) === decodeURI(path) && url.search !== '',
    (route) => (route.request().resourceType() === 'fetch' ? handler(route) : route.continue()),
  );

/** Mốc trên window: còn nguyên nghĩa là không điều hướng. */
const mark = (page: Page) => page.evaluate(() => ((window as unknown as { __t112: number }).__t112 = 1));
const marked = (page: Page) => page.evaluate(() => (window as unknown as { __t112?: number }).__t112 === 1);

async function enhanced(page: Page) {
  await expectNotChallenged(page);
  await expect(root(page)).toHaveAttribute('data-enhanced', '');
}

/** Có JS: dưới 64rem mở drawer, từ 64rem form là cột trái. */
async function openFilters(page: Page) {
  await enhanced(page);
  const button = page.getByTestId('collection-filter-open');
  if (await button.isVisible()) {
    await page.waitForFunction(() => !!customElements.get('modal-dialog'));
    await button.click();
    await expect(page.getByTestId('collection-filter-drawer')).toBeVisible();
  }
}

/** Chờ JS áp xong: aria-busy gỡ và live region có chữ. */
async function settled(page: Page) {
  await expect(root(page)).not.toHaveAttribute('aria-busy', 'true', { timeout: 15_000 });
  await expect(page.getByTestId('collection-status')).not.toBeEmpty();
}

async function closeDrawerIfOpen(page: Page) {
  const close = page.getByTestId('collection-filter-close');
  if (await close.isVisible()) await close.click();
}

/** Số trang cuối từ "Page X of Y" (có ở mọi mốc trong DOM, chỉ ẩn bằng CSS từ 48rem). */
async function lastPage(page: Page) {
  const text = (await page.getByTestId('pagination-status').textContent()) ?? '';
  return Number(text.match(/of\s+(\d+)/)?.[1] ?? NaN);
}

/**
 * Hộp nút Previous/Next trong ô của nó: x so với <li> chứa nút, y so với <nav> (trang 1 và 2 có tên card khác dài nên
 * vị trí tuyệt đối theo trục dọc khác nhau), cộng rộng của <li>. Không so x với <nav>: hàng căn giữa từ 48rem
 * (pagination.md §4) nên trang 2 có thêm 1 số trang ("1 2 3 … N" so với "1 2 … N") làm cả hàng dịch nửa (44 + gap),
 * đúng thiết kế. CLS 0 (§3, §7) = nút tắt giữ đúng ô của link, không phải cùng toạ độ giữa 2 trang.
 */
const box = (l: Locator) =>
  l.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const li = el.closest('li')!.getBoundingClientRect();
    const n = el.closest('nav')!.getBoundingClientRect();
    return { x: r.x - li.x, y: r.y - n.y, w: r.width, h: r.height, slot: li.width };
  });

// =====================================================================
test.describe('ES1-T112 AC1 trang collection', () => {
  test('TC-01 AC1: 1 h1 là tên collection, HTTP 200, axe sạch, 0 console error', async ({ page, guard }) => {
    const res = await page.goto(MAIN);
    expect(res?.status(), `HTTP ${MAIN}`).toBe(200);
    await expectNotChallenged(page);
    await expect(page.locator('h1')).toHaveCount(1);
    const h1 = page.getByTestId('collection-banner').getByTestId('page-title-heading');
    await expect(h1).toBeVisible();
    await expect(h1).not.toBeEmpty();
    await expectAxeClean(page, 'main');
    void guard;
  });

  test('TC-02 AC1 ảnh: banner eager + fetchpriority high, focal (object-position), không crop, card lazy', async ({ page, guard }) => {
    test.skip(!ENV.image, 'Thiếu TE6_IMAGE_COLLECTION_HANDLE (ES1-T105 #5)');
    await gotoStore(page, `/collections/${encodeURIComponent(ENV.image!)}`);
    const img = page.getByTestId('collection-banner-image').locator('img').first();
    await expect(img).toHaveAttribute('loading', 'eager');
    await expect(img).toHaveAttribute('fetchpriority', 'high');
    // Admin không đặt focal cho ảnh collection (kiểm 18/11): có style thì phải là object-position.
    const style = await img.getAttribute('style');
    if (style) expect(style).toMatch(/object-position/);
    expect(await img.evaluate((el) => getComputedStyle(el).objectFit)).toBe('cover');
    expect(await img.getAttribute('src')).not.toMatch(/crop=/);
    // Mô tả có 2 bản (trên ảnh ≥ 48rem, dưới ảnh < 48rem), CSS chỉ hiện 1
    if ((await page.getByTestId('collection-banner-description').count()) > 0) {
      await expect(page.locator(`${T('collection-banner-description')}:visible`)).toHaveCount(1);
    }
    await expect(page.getByTestId('product-card-image').and(page.locator('[loading="eager"]'))).toHaveCount(0);
    void guard;
  });

  test('TC-03 AC1 không banner: columns_desktop card đầu eager, còn lại lazy', async ({ page, guard }) => {
    await gotoStore(page, MAIN);
    test.skip((await page.getByTestId('collection-banner-image').count()) > 0, `${MAIN} có ảnh banner`);
    const items = page.getByTestId('collection-product');
    test.skip((await items.count()) === 0, `${MAIN} không có sản phẩm`);
    const columns = Number(await page.getByTestId('collection-products').evaluate((el) => (el as HTMLElement).style.getPropertyValue('--columns')));
    expect(columns).toBeGreaterThan(0);
    const loading = await items.evaluateAll((els) => els.map((li) => li.querySelector('[data-testid="product-card-image"]')?.getAttribute('loading') ?? null));
    expect(loading.slice(0, columns).every((v) => v === 'eager' || v === null), loading.join(',')).toBe(true);
    expect(loading.slice(columns).every((v) => v === 'lazy' || v === null), loading.join(',')).toBe(true);
    void guard;
  });

  test('TC-04 AC1 lưới 4 mốc: 2/3/3/3 cột, ≤ 24 card như TE-3 (h2), số kết quả, không cuộn ngang', async ({ page, guard }) => {
    await size(page, 360);
    await gotoStore(page, MAIN);
    const cards = page.getByTestId('collection-product');
    const count = await cards.count();
    test.skip(count === 0, `${MAIN} không có sản phẩm`);
    expect(count).toBeLessThanOrEqual(PAGE_SIZE);
    for (const card of await cards.all()) await expect(card.getByTestId('product-card')).toHaveCount(1);
    await expect(cards.first().getByTestId('product-card-title')).not.toBeEmpty();
    await expect(cards.first().locator('h2')).toHaveCount(1);
    const results = await label(page);
    expect(results, 'data-results-label').toMatch(/\d/);
    await expect(page.getByTestId('collection-count')).toHaveText(results!);

    // Default: Columns on desktop 3 (SRS 0.5 bảng setting), Columns on mobile 2 (quyết định 27/10)
    const expected: Record<(typeof WIDTHS)[number], number> = { 360: 2, 768: 3, 1280: 3, 1920: 3 };
    for (const width of WIDTHS) {
      await size(page, width);
      expect(await gridColumns(page.getByTestId('collection-grid')), `${width}`).toBe(expected[width]);
      expect(await noHorizontalScroll(page), `không cuộn ngang ở ${width}`).toBe(true);
    }
    void guard;
  });

  test('TC-05 AC1 CSS cột theo setting: --columns 2/4 ở 1280, 1920; --columns-mobile 1 ở 360', async ({ page, guard }) => {
    // Preview chỉ có default (ticket): đổi biến trên DOM để kiểm CSS; đổi setting thật trong editor là bằng chứng tay.
    await gotoStore(page, MAIN);
    test.skip((await page.getByTestId('collection-grid').count()) === 0, `${MAIN} không có sản phẩm`);
    const grid = page.getByTestId('collection-grid');
    const setVar = (name: string, value: string) =>
      page.getByTestId('collection-products').evaluate((el, [n, v]) => (el as HTMLElement).style.setProperty(n, v), [name, value]);
    for (const width of [1280, 1920]) {
      await size(page, width);
      for (const n of ['2', '4']) {
        await setVar('--columns', n);
        expect(await gridColumns(grid), `${width} --columns ${n}`).toBe(Number(n));
      }
    }
    await size(page, 360);
    await setVar('--columns-mobile', '1');
    expect(await gridColumns(grid), '360 --columns-mobile 1').toBe(1);
    await setVar('--columns-mobile', '2');
    expect(await gridColumns(grid), '360 --columns-mobile 2').toBe(2);
    void guard;
  });

  // ES1-T417: sắp theo tên thì sản phẩm hết hàng ở vị trí > 2000 → duyệt created-descending cố định.
  test('TC-06 AC1 + mục 3 hết hàng: card vẫn hiện, có badge Sold out', async ({ page, guard }) => {
    test.slow();
    const sorted = (path: string, n: number) => `${path}?sort_by=created-descending${n === 1 ? '' : `&page=${n}`}`;
    for (const path of [...new Set([MAIN, ALL])]) {
      for (let n = 1; n <= MAX_PAGES; n++) {
        await gotoStore(page, sorted(path, n));
        const cards = page.getByTestId('collection-product');
        const badge = cards.getByTestId('product-card-badge-sold-out').first();
        if (await badge.count()) {
          await expect(badge).toBeVisible();
          await expect(badge).toHaveText(/\S/);
          return;
        }
        if ((await cards.count()) < PAGE_SIZE) break;
      }
    }
    void guard;
    test.skip(true, `Không có sản phẩm hết hàng trong ${MAX_PAGES} trang đầu ${MAIN} và ${ALL} (sort_by=created-descending)`);
  });

  test('TC-07 AC1 + AC14 rỗng: "No Products Here Yet", Shop All Products, Browse collections, toolbar ẩn, axe sạch', async ({ page, guard }) => {
    test.skip(!ENV.empty, 'Thiếu TE6_EMPTY_COLLECTION_HANDLE (ES1-T105 #4)');
    await gotoStore(page, `/collections/${encodeURIComponent(ENV.empty!)}`);
    await expect(page.getByTestId('collection-empty')).toBeVisible();
    await expect(page.getByTestId('collection-empty-heading')).toHaveText('No Products Here Yet');
    await expect(page.getByTestId('collection-empty-button')).toHaveText('Shop All Products');
    await expect(page.getByTestId('collection-empty-button')).toHaveAttribute('href', /\/collections\/all$/);
    await expect(page.getByTestId('collection-empty-link')).toHaveAttribute('href', /\/collections\/?$/);
    await expect(page.getByTestId('collection-grid')).toHaveCount(0);
    await expect(page.getByTestId('pagination')).toHaveCount(0);
    await expect(page.getByTestId('collection-toolbar')).toBeHidden();
    await expect(page.getByTestId('collection-filter-open')).toBeHidden();
    await expect(page.getByTestId('collection-sort')).toBeHidden();
    await expectAxeClean(page, 'main');
    void guard;
  });
});

// =====================================================================
test.describe('ES1-T112 AC2 lọc (markup)', () => {
  test('TC-08 AC2: form GET đúng action, nhóm details open filter.*, giá trị là label + checkbox, đếm 0 thì disabled', async ({ page, guard }) => {
    await size(page, 1280);
    await gotoStore(page, MAIN);
    const form = page.getByTestId('collection-filter-form');
    await expect(form).toHaveCount(1);
    await expect(form).toHaveAttribute('method', 'get');
    expect(decodeURI((await form.getAttribute('action')) ?? '')).toBe(decodeURI(new URL(page.url()).pathname));
    await expect(page.getByTestId('collection-status')).toHaveAttribute('role', 'status');
    test.skip(!(await hasFilters(page)), NO_FILTERS);

    for (const g of await groups(page).evaluateAll((els) => els.map((el) => ({ tag: el.tagName, open: (el as HTMLDetailsElement).open, param: el.getAttribute('data-filter-param') })))) {
      expect(g.tag).toBe('DETAILS');
      expect(g.open, g.param ?? '').toBe(true);
      expect(g.param).toMatch(/^filter\./);
    }
    const options = await page.getByTestId('collection-filter-option').evaluateAll((els) =>
      els.map((el) => {
        const input = el.querySelector('input') as HTMLInputElement;
        return { tag: el.tagName, type: input.type, name: input.name, value: input.value, checked: input.checked, disabled: input.disabled, count: Number(el.querySelector('.filter-option__count')?.textContent) };
      }),
    );
    expect(options.length).toBeGreaterThan(0);
    for (const o of options) {
      expect(o.tag).toBe('LABEL');
      expect(o.type).toBe('checkbox');
      expect(o.name).toMatch(/^filter\./);
      expect(o.value).not.toBe('');
      expect(o.disabled, `${o.name}=${o.value}`).toBe(o.count === 0 && !o.checked);
    }
    void guard;
  });

  test('TC-09 AC2 swatch: chấm ≥ 24px, input vẫn là checkbox', async ({ page, guard }) => {
    await size(page, 1280);
    await gotoStore(page, MAIN);
    const swatch = page.getByTestId('collection-filter-swatch').first();
    test.skip((await swatch.count()) === 0, 'Không có filter swatch (ES1-T105 #2)');
    const b = (await swatch.boundingBox())!;
    expect(b.width).toBeGreaterThanOrEqual(24);
    expect(b.height).toBeGreaterThanOrEqual(24);
    await expect(page.getByTestId('collection-filter-option').filter({ has: swatch }).getByTestId('collection-filter-input')).toHaveAttribute('type', 'checkbox');
    void guard;
  });

  test('TC-10 AC2 giá: 2 input number có label, min 0, step any, max = range_max, name gte/lte', async ({ page, guard }) => {
    await size(page, 1280);
    await gotoStore(page, MAIN);
    const min = page.getByTestId('collection-filter-price-min');
    test.skip((await min.count()) === 0, 'Không có filter giá (ES1-T105 #2)');
    for (const input of [min, page.getByTestId('collection-filter-price-max')]) {
      await expect(input).toHaveAttribute('type', 'number');
      await expect(input).toHaveAttribute('min', '0');
      await expect(input).toHaveAttribute('step', 'any');
      await expect(input).toHaveAttribute('name', /^filter\.v\.price\.(gte|lte)$/);
      await expect(input).toHaveAttribute('max', /^\d+(\.\d+)?$/);
      expect((await input.evaluate((el) => (el as HTMLInputElement).labels?.[0]?.textContent ?? '')).trim()).not.toBe('');
    }
    void guard;
  });
});

// =====================================================================
test.describe('ES1-T112 AC2 lọc có JS', () => {
  test('TC-11 AC2: tick → partial fetch, aria-busy rồi gỡ, URL đổi, không reload, live region có số', async ({ page, guard }) => {
    await gotoStore(page, MAIN);
    test.skip(!(await hasFilters(page)), NO_FILTERS);
    await openFilters(page);
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
    expect(await marked(page), 'không điều hướng').toBe(true);
    await expect(inputBy(page, name, value)).toBeChecked();
    await expect(page.getByTestId('collection-filter-clear')).toBeVisible();
    await expect(page.getByTestId('collection-filter-count')).toHaveText('1');
    const results = (await label(page))!;
    expect(results).toMatch(/\d/);
    await expect(page.getByTestId('collection-status')).toHaveText(results);
    void guard;
  });

  test('TC-12 AC2: Clear all bỏ tick mọi input, URL không còn filter, không reload', async ({ page, guard }) => {
    await gotoStore(page, MAIN);
    test.skip(!(await hasFilters(page)), NO_FILTERS);
    await openFilters(page);
    await mark(page);
    await openInputs(page).first().check();
    await settled(page);
    await page.getByTestId('collection-filter-clear').click();
    await expect(page.getByTestId('collection-filter-clear')).toHaveCount(0);
    await settled(page);
    expect([...new URL(page.url()).searchParams.keys()].filter((k) => k.startsWith('filter.'))).toEqual([]);
    await expect(page.locator(`${T('collection-filter-input')}:checked`)).toHaveCount(0);
    await expect(page.getByTestId('collection-filter-count')).toHaveCount(0);
    expect(await marked(page)).toBe(true);
    void guard;
  });

  test('TC-13 AC2 đổi nhanh 3 lần: request cũ bị huỷ, chỉ còn kết quả cuối', async ({ page, guard }) => {
    guard.allowNetworkLog();
    await gotoStore(page, MAIN);
    test.skip(!(await hasFilters(page)), NO_FILTERS);
    test.skip((await openInputs(page).count()) < 2, 'Cần ít nhất 2 giá trị lọc');
    await openFilters(page);
    await mark(page);
    const path = new URL(page.url()).pathname;
    await routePartials(page, path, async (route) => {
      await new Promise((r) => setTimeout(r, 1_000));
      await route.continue().catch(() => {});
    });
    const failed: string[] = [];
    page.on('requestfailed', (r) => isPartial(path)(r) && failed.push(r.url()));
    // Khoá theo name + value: sau apply thứ tự :not(:disabled) có thể đổi
    const pick = async (i: number) => {
      const el = openInputs(page).nth(i);
      const n = (await el.getAttribute('name'))!;
      const v = (await el.getAttribute('value'))!;
      return [n, v, inputBy(page, n, v)] as const;
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
    await expect(inputBy(page, nameB, valueB)).toBeChecked();
    await expect(inputBy(page, nameA, valueA)).not.toBeChecked();
    expect(await marked(page)).toBe(true);
    void guard;
  });

  test('TC-14 AC2: mở thẳng URL do JS tạo ra cùng kết quả', async ({ page, guard }) => {
    test.slow();
    await gotoStore(page, MAIN);
    test.skip(!(await hasFilters(page)), NO_FILTERS);
    await openFilters(page);
    await openInputs(page).first().check();
    await settled(page);
    const url = page.url();
    const jsLabel = await label(page);
    const jsHrefs = await hrefs(page);
    const jsChecked = await page.locator(`${T('collection-filter-input')}:checked`).count();

    await gotoStore(page, url);
    expect(await label(page)).toBe(jsLabel);
    expect(await hrefs(page)).toEqual(jsHrefs);
    expect(await page.locator(`${T('collection-filter-input')}:checked`).count()).toBe(jsChecked);
    void guard;
  });

  test('TC-15 AC2 lỗi mạng: route.abort partial → tải cả trang tới URL có filter, 0 pageerror', async ({ page, guard }) => {
    guard.allowNetworkLog();
    await gotoStore(page, MAIN);
    test.skip(!(await hasFilters(page)), NO_FILTERS);
    await openFilters(page);
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
    await expect(inputBy(page, name, value)).toBeChecked();
    void guard;
  });

  test('TC-16 AC2 + AC4 lỗi mạng: collection-filters.js bị abort ở 360 → popover mở, form GET chạy, × đóng', async ({ page, guard }) => {
    guard.allowNetworkLog();
    await page.route(/\/assets\/collection-filters\.js/, (route) => route.abort('failed'));
    await size(page, 360);
    await gotoStore(page, MAIN);
    test.skip(!(await hasFilters(page)), NO_FILTERS);
    await expect(root(page)).not.toHaveAttribute('data-enhanced', '');
    const opener = page.getByTestId('collection-filter-open');
    const drawer = page.getByTestId('collection-filter-drawer');
    await opener.click();
    await expect(drawer).toBeVisible();
    await page.getByTestId('collection-filter-close').click();
    await expect(drawer).toBeHidden();

    await opener.click();
    await expect(drawer).toBeVisible();
    const input = openInputs(page).first();
    const name = (await input.getAttribute('name'))!;
    const value = (await input.getAttribute('value'))!;
    await input.check();
    await Promise.all([page.waitForURL((u) => u.searchParams.getAll(name).includes(value)), page.getByTestId('collection-filter-apply').click()]);
    await expectNotChallenged(page);
    await expect(inputBy(page, name, value)).toBeChecked();
    await expect(page.getByTestId('collection-filter-count')).toHaveText('1');
    void guard;
  });

  test('TC-17 AC2 giá ở 360: Max qua "Show N products", URL có lte, giá 3 card đầu ≤ Max (fetch trong trang)', async ({ page, guard }) => {
    await size(page, 360);
    await gotoStore(page, MAIN);
    const max = page.getByTestId('collection-filter-price-max');
    test.skip((await max.count()) === 0, 'Không có filter giá (ES1-T105 #2)');
    const ceiling = Number(await max.getAttribute('max'));
    test.skip(!(ceiling > 0), 'range_max bằng 0');
    const top = Math.floor(ceiling / 2);
    await openFilters(page);
    await max.fill(String(top));
    await page.getByTestId('collection-filter-apply').click();
    await expect.poll(() => new URL(page.url()).searchParams.get('filter.v.price.lte')).toBe(String(top));
    await settled(page);
    await expect(page.getByTestId('collection-filter-drawer')).toBeHidden();

    const rate = await page.evaluate(() => Number((window as unknown as { Shopify?: { currency?: { rate?: string } } }).Shopify?.currency?.rate ?? 1));
    test.skip(rate !== 1, `Runner ở market khác tiền shop (rate ${rate}): không so giá (KHÔNG CHẮC #5)`);
    const handles = (await hrefs(page)).slice(0, 3).map((h) => decodeURIComponent(new URL(h, page.url()).pathname.split('/products/')[1] ?? '')).filter(Boolean);
    for (const handle of handles) {
      const product = await productData(page, handle);
      const cheapest = Math.min(...product.variants.map((v) => v.price));
      expect(cheapest, `${handle} giá thấp nhất (cent) ≤ ${top}`).toBeLessThanOrEqual(top * 100);
    }
    void guard;
  });

  test('TC-18 AC2: axe 0 serious trong main sau khi lọc', async ({ page, guard }) => {
    await gotoStore(page, MAIN);
    test.skip(!(await hasFilters(page)), NO_FILTERS);
    await openFilters(page);
    await openInputs(page).first().check();
    await settled(page);
    await closeDrawerIfOpen(page);
    await expectAxeClean(page, 'main');
    void guard;
  });
});

// =====================================================================
test.describe('ES1-T112 AC3 sắp xếp', () => {
  test('TC-22 AC3: không sort_by → select chọn sẵn đúng 1 option và thứ tự = ?sort_by=<option đó> (default_sort_by)', async ({ page, guard }) => {
    test.slow();
    await gotoStore(page, MAIN);
    const sort = page.getByTestId('collection-sort');
    await expect(sort).toHaveAttribute('name', 'sort_by');
    await expect(sort).toHaveAttribute('form', 'collection-filter-form');
    expect(await sort.evaluate((el) => (el as HTMLSelectElement).labels?.[0]?.textContent?.trim())).toBe('Sort by');
    expect(await sort.locator('option').count()).toBeGreaterThan(1);
    await expect(sort.locator('option[selected]')).toHaveCount(1);
    const preset = (await sort.locator('option[selected]').getAttribute('value'))!;
    await expect(sort).toHaveValue(preset);
    // Có JS: nút Apply nằm trong noscript
    await expect(page.getByTestId('collection-sort-apply')).toHaveCount(0);
    const before = await hrefs(page);
    test.skip(before.length < 2, `${MAIN} ít hơn 2 sản phẩm`);

    await gotoStore(page, `${MAIN}?sort_by=${encodeURIComponent(preset)}`);
    expect(await hrefs(page), `thứ tự mặc định = sort_by=${preset}`).toEqual(before);
    void guard;
  });

  test('TC-23 AC3: ?sort_by=X → select hiện X', async ({ page, guard }) => {
    await gotoStore(page, MAIN);
    const value = await page.getByTestId('collection-sort').locator('option:not([selected])').first().getAttribute('value');
    await gotoStore(page, `${MAIN}?sort_by=${encodeURIComponent(value!)}`);
    await expect(page.getByTestId('collection-sort')).toHaveValue(value!);
    void guard;
  });

  test('TC-24 AC3 có JS: đổi sort → sort_by đổi, thứ tự đổi, filter giữ, không reload', async ({ page, guard }) => {
    await gotoStore(page, MAIN);
    await enhanced(page);
    await mark(page);
    let name = '';
    let value = '';
    if (await hasFilters(page)) {
      await openFilters(page);
      const input = openInputs(page).first();
      name = (await input.getAttribute('name'))!;
      value = (await input.getAttribute('value'))!;
      await input.check();
      await settled(page);
      await closeDrawerIfOpen(page);
    }
    const before = await hrefs(page);
    test.skip(before.length < 2, 'Ít hơn 2 sản phẩm, không thấy được thứ tự');
    const sort = page.getByTestId('collection-sort');
    const values = await sort.locator('option').evaluateAll((els) => els.map((el) => (el as HTMLOptionElement).value));
    const current = await sort.inputValue();
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
    expect(changed, 'có cách sort làm đổi thứ tự').toBe(true);
    expect(await marked(page), 'không điều hướng').toBe(true);
    void guard;
  });
});

// =====================================================================
test.describe('ES1-T112 AC4 drawer lọc', () => {
  for (const width of [360, 768]) {
    test(`TC-26 AC4 ${width}: nút Filter hiện cao ≥ 44, drawer ẩn, không cuộn ngang`, async ({ page, guard }) => {
      await size(page, width);
      await gotoStore(page, MAIN);
      test.skip(!(await hasFilters(page)), NO_FILTERS);
      const opener = page.getByTestId('collection-filter-open');
      await expect(opener).toBeVisible();
      expect((await opener.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      await expect(page.getByTestId('collection-filter-drawer')).toBeHidden();
      expect(await noHorizontalScroll(page)).toBe(true);
      void guard;
    });
  }

  for (const width of [1280, 1920]) {
    test(`TC-27 AC4 ${width}: form là cột trái tĩnh, không nút Filter/đóng, axe sạch`, async ({ page, guard }) => {
      await size(page, width);
      await gotoStore(page, MAIN);
      test.skip(!(await hasFilters(page)), NO_FILTERS);
      const form = page.getByTestId('collection-filter-form');
      await expect(form).toBeVisible();
      await expect(page.getByTestId('collection-filter-open')).toBeHidden();
      await expect(page.getByTestId('collection-filter-close')).toBeHidden();
      const f = (await form.boundingBox())!;
      const g = (await page.getByTestId('collection-grid').boundingBox())!;
      expect(f.x + f.width).toBeLessThanOrEqual(g.x);
      expect(await page.getByTestId('collection-filter-drawer').evaluate((el) => getComputedStyle(el).position)).toBe('static');
      await expectAxeClean(page, 'main');
      void guard;
    });
  }

  test('TC-28 AC4 + AC10 bàn phím 360: Enter mở modal, focus vào h2 Filters, data-layer-open, axe sạch', async ({ page, guard }) => {
    await size(page, 360);
    await gotoStore(page, MAIN);
    test.skip(!(await hasFilters(page)), NO_FILTERS);
    await enhanced(page);
    await page.waitForFunction(() => !!customElements.get('modal-dialog'));
    const opener = page.getByTestId('collection-filter-open');
    const drawer = page.getByTestId('collection-filter-drawer');
    await opener.focus();
    await page.keyboard.press('Enter');
    await expect(drawer).toBeVisible();
    expect(await drawer.evaluate((d) => (d as HTMLDialogElement).open && d.matches(':modal') && !d.hasAttribute('popover'))).toBe(true);
    // ES1-T480 (CTO 17/11): mở lớp modal thì focus vào tiêu đề aria-labelledby
    expect(await page.evaluate(() => document.activeElement?.id)).toBe(await drawer.getAttribute('aria-labelledby'));
    await expect(page.locator('html')).toHaveAttribute('data-layer-open', '');
    await expectAxeClean(page, T('collection-filter-drawer'));
    void guard;
  });

  test('TC-29 AC4 bàn phím: Tab 30 lần không thoát khỏi drawer', async ({ page, guard }) => {
    await size(page, 360);
    await gotoStore(page, MAIN);
    test.skip(!(await hasFilters(page)), NO_FILTERS);
    await openFilters(page);
    const escaped: string[] = [];
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Tab');
      // body/null = focus đang ở UI trình duyệt giữa 2 vòng, không phải phần tử trang
      const outside = await page.evaluate(() => {
        const a = document.activeElement;
        const d = document.getElementById('collection-filter-drawer');
        if (!a || a === document.body || d?.contains(a)) return null;
        return a.outerHTML.slice(0, 120);
      });
      if (outside) escaped.push(outside);
    }
    expect(escaped, 'phần tử ngoài drawer nhận focus').toEqual([]);
    void guard;
  });

  test('TC-30 AC4 đóng: Esc, chạm scrim, × đều đóng và trả focus về nút Filter, gỡ data-layer-open', async ({ page, guard }) => {
    await size(page, 360);
    await gotoStore(page, MAIN);
    test.skip(!(await hasFilters(page)), NO_FILTERS);
    const opener = page.getByTestId('collection-filter-open');
    const drawer = page.getByTestId('collection-filter-drawer');
    const html = page.locator('html');
    const closeWays: [string, () => Promise<void>][] = [
      ['Esc', () => page.keyboard.press('Escape')],
      ['scrim', async () => {
        // ES1-T583: drawer trượt vào 250 ms (--motion-base); đo boundingBox giữa lúc trượt ra x âm → điểm chạm rơi vào thân drawer khi trượt xong.
        // Chờ transition xong rồi mới đo, hợp đồng không đổi (chạm ngoài drawer = scrim).
        await drawer.evaluate((el) => Promise.allSettled(el.getAnimations().map((a) => a.finished)));
        const d = (await drawer.boundingBox())!;
        const vp = page.viewportSize()!;
        await page.mouse.click(Math.min(vp.width - 4, d.x + d.width + 12), vp.height / 2);
      }],
      ['×', () => page.getByTestId('collection-filter-close').click()],
    ];
    for (const [how, close] of closeWays) {
      await openFilters(page);
      await close();
      await expect(drawer, how).toBeHidden();
      await expect(opener, how).toBeFocused();
      await expect(html, how).not.toHaveAttribute('data-layer-open', '');
    }
    void guard;
  });

  test('TC-31 AC4 360: tick trong drawer → badge 1, tên nút có "1 filter applied", "Show N products" đóng, focus về nút', async ({ page, guard }) => {
    await size(page, 360);
    await gotoStore(page, MAIN);
    test.skip(!(await hasFilters(page)), NO_FILTERS);
    await openFilters(page);
    await mark(page);
    const drawer = page.getByTestId('collection-filter-drawer');
    const opener = page.getByTestId('collection-filter-open');
    const apply = page.getByTestId('collection-filter-apply');
    await expect(apply).toHaveText(/^Show \d+ products?$/);
    await openInputs(page).first().check();
    await settled(page);
    await expect(drawer).toBeVisible();
    await expect(page.getByTestId('collection-filter-count')).toHaveText('1');
    await expect(opener).toHaveAccessibleName(/1 filter applied/);
    await expect(apply).toHaveText(`Show ${await resultCount(page)} product${(await resultCount(page)) === 1 ? '' : 's'}`);

    let after = 0;
    const path = new URL(page.url()).pathname;
    page.on('request', (r) => isPartial(path)(r) && after++);
    await apply.click();
    await expect(drawer).toBeHidden();
    await expect(opener).toBeFocused();
    expect(after, 'đã áp nên không request mới').toBe(0);
    expect(await marked(page), 'không điều hướng').toBe(true);
    void guard;
  });

  test('TC-34 AC4 collection không filter: không nút Filter, drawer ẩn, Sort vẫn gắn form', async ({ page, guard }) => {
    await size(page, 360);
    await gotoStore(page, ALL);
    test.skip(await hasFilters(page), `${ALL} có filter: không dựng được trạng thái không filter`);
    await expect(page.getByTestId('collection-filter-open')).toBeHidden();
    await expect(page.getByTestId('collection-filter-drawer')).toBeHidden();
    expect(await page.getByTestId('collection-sort').evaluate((el) => (el as HTMLSelectElement).form?.id)).toBe('collection-filter-form');
    void guard;
  });
});

// =====================================================================
test.describe('ES1-T112 AC5 list-collections', () => {
  test('TC-35 AC5 + AC15: breadcrumb, 1 h1 Collections + meta, card ảnh/placeholder 336:220, h2, "{n} products", 1 link, axe sạch', async ({ page, guard }) => {
    const res = await page.goto(LIST);
    expect(res?.status(), `HTTP ${LIST}`).toBe(200);
    await expectNotChallenged(page);
    await expect(page.getByTestId('breadcrumb-current')).toHaveText(/Collections/);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.getByTestId('page-title-heading')).toHaveText('Collections');
    const cards = page.getByTestId('list-collections-card');
    const count = await cards.count();
    test.skip(count === 0, 'Store không có collection');
    expect(count).toBeLessThanOrEqual(PAGE_SIZE);
    if ((await page.getByTestId('pagination').count()) === 0) {
      await expect(page.getByTestId('page-title')).toContainText(`${count} collection${count === 1 ? '' : 's'}`);
    }
    for (const card of (await cards.all()).slice(0, 8)) {
      await expect(card.getByTestId('list-collections-card-image')).toHaveCount(1);
      await expect(card.locator('h2')).toHaveCount(1);
      await expect(card.getByTestId('list-collections-card-title')).not.toBeEmpty();
      await expect(card.getByTestId('list-collections-card-meta')).toHaveText(/^\d+ products?$/);
      await expect(card.locator('a[href]')).toHaveCount(1);
      expect(await card.getByTestId('list-collections-card-link').getAttribute('href')).toMatch(/\/collections\/[^/]+$/);
      const ratio = await card.getByTestId('list-collections-card-image').evaluate((el) => {
        const r = el.getBoundingClientRect();
        return r.width / r.height;
      });
      expect(ratio, 'tỉ lệ ảnh 336:220').toBeCloseTo(336 / 220, 1);
    }
    await expectAxeClean(page, 'main');
    void guard;
  });

  test('TC-36 AC5 + AC15 lưới 4 mốc: 2 / 3 / 4 / 4 cột, không cuộn ngang', async ({ page, guard }) => {
    await gotoStore(page, LIST);
    const grid = page.getByTestId('list-collections-grid');
    test.skip((await grid.count()) === 0, 'Store không có collection');
    const expected: Record<(typeof WIDTHS)[number], number> = { 360: 2, 768: 3, 1280: 4, 1920: 4 };
    for (const width of WIDTHS) {
      await size(page, width);
      expect(await gridColumns(grid), `${width}`).toBe(expected[width]);
      expect(await noHorizontalScroll(page), `không cuộn ngang ở ${width}`).toBe(true);
    }
    void guard;
  });

  test('TC-37 AC5 + AC15 LCP: 4 card đầu eager, chỉ card 1 fetchpriority high, còn lại lazy', async ({ page, guard }) => {
    await gotoStore(page, LIST);
    const cards = page.getByTestId('list-collections-card');
    test.skip((await cards.count()) === 0, 'Store không có collection');
    const imgs = await cards.evaluateAll((els) => els.map((li) => {
      const img = li.querySelector('img');
      return img ? { loading: img.getAttribute('loading'), priority: img.getAttribute('fetchpriority') } : null;
    }));
    imgs.forEach((img, i) => {
      if (!img) return; // placeholder không có img
      expect(img.loading, `card ${i + 1}`).toBe(i < 4 ? 'eager' : 'lazy');
      expect(img.priority, `card ${i + 1}`).toBe(i === 0 ? 'high' : null);
    });
    void guard;
  });

  test('TC-38 AC5 + AC6: phân trang chỉ khi > 24 collection', async ({ page, guard }) => {
    await gotoStore(page, LIST);
    const cards = await page.getByTestId('list-collections-card').count();
    const nav = page.getByTestId('pagination');
    if (cards < PAGE_SIZE) {
      await expect(nav).toHaveCount(0);
      return;
    }
    test.skip((await nav.count()) === 0, 'Đúng 24 collection, không có trang 2');
    await expect(nextLink(page)).toHaveAttribute('href', /[?&]page=2\b/);
    void guard;
  });

  test('TC-50 AC7 list-collections: ?page= vượt → không trang trắng, empty state + "Go to page 1"', async ({ page, guard }) => {
    // Bug theme, không nới: CI #286 đỏ đúng chỗ này; ES1-T525 #2 mặc định AC7 áp cho list-collections. Gỡ khi ES1-T562 merge.
    test.fail(true, 'ES1-T562: templates/list-collections.liquid thiếu nhánh ?page= vượt (BUG-ES1-T112-01)');
    const res = await page.goto(`${LIST}?page=9999`);
    expect(res?.status()).toBe(200);
    await expectNotChallenged(page);
    await expect(page.getByTestId('page-title-heading')).toHaveText('Collections');
    // AC7 + pagination.md §3: mọi danh sách nhiều trang; template chưa có nhánh này (ES1-T562, drafts/qa/ES1-T112/bugs/)
    const firstPage = page.getByRole('link', { name: 'Go to page 1' });
    await expect(firstPage).toBeVisible();
    await expect(firstPage).toHaveAttribute('href', /\/collections\/?(\?page=1)?$/);
    void guard;
  });
});

// =====================================================================
test.describe('ES1-T112 AC6 phân trang chung', () => {
  test('TC-40 AC6 1280 trang 1: nav "Pagination", Previous tắt giữ chỗ, Next 52 "Next page", current aria-current, axe', async ({ page, guard }) => {
    await size(page, 1280);
    await gotoStore(page, ALL);
    const nav = page.getByTestId('pagination');
    test.skip((await nav.count()) === 0, NO_PAGES);
    await expect(nav).toHaveAttribute('aria-label', 'Pagination');
    expect(await nav.evaluate((el) => el.tagName)).toBe('NAV');

    const prev = prevDisabled(page);
    await expect(prev).toHaveCount(1);
    await expect(prev).toBeVisible();
    await expect(prev).toHaveAttribute('role', 'link');
    await expect(prev).toHaveAccessibleName('Previous page');
    await expect(prev).not.toHaveAttribute('href');
    expect(await prev.evaluate((el) => (el as HTMLElement).tabIndex), 'không vào thứ tự Tab').toBe(-1);
    expect(Number(await prev.evaluate((el) => getComputedStyle(el).opacity))).toBeCloseTo(0.35, 2);
    await expect(prevLink(page)).toHaveCount(0);

    const next = nextLink(page);
    await expect(next).toHaveAccessibleName('Next page');
    await expect(next).toHaveAttribute('href', /[?&]page=2\b/);
    const b = (await next.boundingBox())!;
    expect(Math.round(b.width)).toBe(52);
    expect(Math.round(b.height)).toBe(52);

    const current = page.getByTestId('pagination-current');
    await expect(current).toHaveAttribute('aria-current', 'page');
    await expect(current).toHaveText('1');
    expect(await current.evaluate((el) => el.closest('a'))).toBeNull();
    await expect(page.getByTestId('pagination-page').first()).toBeVisible();
    await expect(page.getByTestId('pagination-status')).toBeHidden();
    await expectAxeClean(page, T('pagination'));
    void guard;
  });

  test('TC-41 AC6 theo mốc: 360 "Page 1 of N" + ẩn số; 768, 1920 hiện số (≥ 44), ẩn status', async ({ page, guard }) => {
    await size(page, 360);
    await gotoStore(page, ALL);
    test.skip((await page.getByTestId('pagination').count()) === 0, NO_PAGES);
    const status = page.getByTestId('pagination-status');
    await expect(status).toBeVisible();
    await expect(status).toHaveText(/^Page 1 of \d+$/);
    await expect(page.getByTestId('pagination-page').first()).toBeHidden();
    await expect(page.getByTestId('pagination-current')).toBeHidden();
    expect(await noHorizontalScroll(page)).toBe(true);
    for (const width of [768, 1920]) {
      await size(page, width);
      await expect(status, `${width}`).toBeHidden();
      const pageLink = page.getByTestId('pagination-page').first();
      await expect(pageLink, `${width}`).toBeVisible();
      const b = (await pageLink.boundingBox())!;
      expect(b.height, `${width} vùng chạm`).toBeGreaterThanOrEqual(44);
      expect(b.width, `${width} vùng chạm`).toBeGreaterThanOrEqual(44);
    }
    void guard;
  });

  test('TC-42 + TC-43 AC6 trang cuối: Next tắt, Previous là link; Previous trang 1 và 2 cùng vị trí (CLS 0)', async ({ page, guard }) => {
    await size(page, 1280);
    await gotoStore(page, ALL);
    test.skip((await page.getByTestId('pagination').count()) === 0, NO_PAGES);
    const last = await lastPage(page);
    expect(last).toBeGreaterThan(1);
    const placeholder = await box(prevDisabled(page));

    await gotoStore(page, `${ALL}?page=2`);
    const link = await box(prevLink(page));
    for (const k of ['x', 'y', 'w', 'h', 'slot'] as const) expect(Math.abs(link[k] - placeholder[k]), `Previous ${k}`).toBeLessThanOrEqual(1);

    await gotoStore(page, `${ALL}?page=${last}`);
    await expect(page.getByTestId('pagination-current')).toHaveText(String(last));
    const next = nextDisabled(page);
    await expect(next).toBeVisible();
    await expect(next).toHaveAccessibleName('Next page');
    await expect(next).not.toHaveAttribute('href');
    await expect(nextLink(page)).toHaveCount(0);
    await expect(prevLink(page)).toHaveAccessibleName('Previous page');
    await expect(prevLink(page)).toHaveAttribute('href', new RegExp(`[?&]page=${last - 1}\\b`));
    void guard;
  });

  test('TC-44 + TC-48 AC6 có JS: Next không reload, URL = href, focus vào vùng kết quả, sort giữ, axe phân trang trang 2', async ({ page, guard }) => {
    await gotoStore(page, ALL);
    await enhanced(page);
    test.skip((await nextLink(page).count()) === 0, NO_PAGES);
    const sortValue = await page.getByTestId('collection-sort').inputValue();
    await mark(page);
    const before = await hrefs(page);
    const href = (await nextLink(page).getAttribute('href'))!;
    await nextLink(page).click();
    await expect.poll(() => new URL(page.url()).searchParams.get('page')).toBe('2');
    await settled(page);
    expect(new URL(page.url()).href).toBe(new URL(href, page.url()).href);
    expect(await marked(page), 'không điều hướng').toBe(true);
    expect(await hrefs(page)).not.toEqual(before);
    await expect(page.getByTestId('pagination-current')).toHaveText('2');
    expect(await page.evaluate(() => !!document.activeElement?.closest('[data-results-label], [data-testid="collection-count"]')), 'focus vào vùng kết quả').toBe(true);
    await expect(page.getByTestId('collection-results')).toBeInViewport();
    await expect(page.getByTestId('collection-sort')).toHaveValue(sortValue);
    await expect(page.getByTestId('collection-status')).toHaveText(/\d/);
    await expectAxeClean(page, T('pagination'));
    void guard;
  });

  test('TC-45 AC6 có JS: sang trang 2 sau khi lọc vẫn giữ filter', async ({ page, guard }) => {
    await gotoStore(page, MAIN);
    test.skip(!(await hasFilters(page)), NO_FILTERS);
    await openFilters(page);
    await mark(page);
    const input = openInputs(page).first();
    const name = (await input.getAttribute('name'))!;
    const value = (await input.getAttribute('value'))!;
    await input.check();
    await settled(page);
    test.skip((await nextLink(page).count()) === 0, 'Kết quả lọc không quá 24 sản phẩm');
    await closeDrawerIfOpen(page);
    await nextLink(page).click();
    await expect.poll(() => new URL(page.url()).searchParams.get('page')).toBe('2');
    await settled(page);
    expect(new URL(page.url()).searchParams.getAll(name)).toContain(value);
    await expect(inputBy(page, name, value)).toBeChecked();
    expect(await marked(page)).toBe(true);
    void guard;
  });

  test('TC-47 AC6: danh sách 1 trang không render phân trang', async ({ page, guard }) => {
    for (const path of [...new Set([MAIN, LIST])]) {
      await gotoStore(page, path);
      const items = await page.getByTestId(path === LIST ? 'list-collections-card' : 'collection-product').count();
      if (items > 0 && items < PAGE_SIZE) {
        await expect(page.getByTestId('pagination'), path).toHaveCount(0);
        return;
      }
    }
    void guard;
    test.skip(true, `${MAIN} và ${LIST} đều đủ 24 mục`);
  });
});

// =====================================================================
test.describe('ES1-T112 AC7 ?page= vượt', () => {
  test('TC-49 AC7 có JS: /collections/all?page=9999 → "No Products on This Page" + "Go to page 1", không lưới, axe sạch', async ({ page, guard }) => {
    const res = await page.goto(`${ALL}?page=9999`);
    expect(res?.status()).toBe(200);
    await expectNotChallenged(page);
    const empty = page.getByTestId('collection-page-empty');
    await expect(empty).toBeVisible();
    await expect(page.getByTestId('collection-page-empty-heading')).toHaveText('No Products on This Page');
    const button = page.getByTestId('collection-page-empty-button');
    await expect(button).toHaveText('Go to page 1');
    await expect(button).toHaveAttribute('href', /\/collections\/all(\?page=1)?$/);
    await expect(page.getByTestId('collection-grid')).toHaveCount(0);
    await expect(page.getByTestId('pagination')).toHaveCount(0);
    await expectAxeClean(page, 'main');
    await button.click();
    await expect(page.getByTestId('collection-product').first()).toBeVisible();
    void guard;
  });
});

// =====================================================================
test.describe('ES1-T112 nojs', () => {
  test.use({ javaScriptEnabled: false });

  test('TC-19 AC2 nojs 1280: tick + Apply → URL có tham số, kết quả không tăng; Clear all về URL không query', async ({ page, guard }) => {
    await size(page, 1280);
    await gotoStore(page, MAIN);
    test.skip(!(await hasFilters(page)), NO_FILTERS);
    await expect(page.getByTestId('collection-filter-clear')).toHaveCount(0);
    const before = await resultCount(page);
    const input = openInputs(page).first();
    const name = (await input.getAttribute('name'))!;
    const value = (await input.getAttribute('value'))!;
    await input.check();
    await Promise.all([page.waitForURL((u) => u.searchParams.getAll(name).includes(value)), page.getByTestId('collection-filter-apply').click()]);
    await expectNotChallenged(page);
    expect(await resultCount(page)).toBeLessThanOrEqual(before);
    await expect(inputBy(page, name, value)).toBeChecked();
    const clear = page.getByTestId('collection-filter-clear');
    await expect(clear).toBeVisible();
    await Promise.all([page.waitForURL((u) => u.search === ''), clear.click()]);
    await expect(page.locator(`${T('collection-filter-input')}:checked`)).toHaveCount(0);
    void guard;
  });

  test('TC-20 AC2 nojs giá: min 0, max nửa range → 2 tham số, giữ giá trị, kết quả không tăng', async ({ page, guard }) => {
    await size(page, 1280);
    await gotoStore(page, MAIN);
    const min = page.getByTestId('collection-filter-price-min');
    test.skip((await min.count()) === 0, 'Không có filter giá (ES1-T105 #2)');
    const max = page.getByTestId('collection-filter-price-max');
    const ceiling = Number(await max.getAttribute('max'));
    test.skip(!(ceiling > 0), 'range_max bằng 0');
    const before = await resultCount(page);
    const top = String(Math.floor(ceiling / 2));
    await min.fill('0');
    await max.fill(top);
    await Promise.all([page.waitForURL((u) => u.searchParams.has('filter.v.price.lte')), page.getByTestId('collection-filter-apply').click()]);
    const params = new URL(page.url()).searchParams;
    expect(params.get('filter.v.price.gte')).toBe('0');
    expect(params.get('filter.v.price.lte')).toBe(top);
    expect(Number(await page.getByTestId('collection-filter-price-max').inputValue())).toBe(Number(top));
    expect(await resultCount(page)).toBeLessThanOrEqual(before);
    void guard;
  });

  test('TC-21 AC2 + AC14 nojs lọc ra 0: "No Matching Products", Clear filters về URL không filter', async ({ page, guard, browser }) => {
    test.skip(!ENV.noResultQuery, 'Thiếu TE6_FILTER_NO_RESULT_QUERY (ES1-T105 #3)');
    await gotoStore(page, `${MAIN}?${ENV.noResultQuery}`);
    await expect(page.getByTestId('collection-empty')).toBeVisible();
    await expect(page.getByTestId('collection-empty-heading')).toHaveText('No Matching Products');
    await expect(page.getByTestId('collection-empty-link')).toHaveCount(0);
    const clear = page.getByTestId('collection-empty-button');
    await expect(clear).toHaveText('Clear filters');
    await Promise.all([page.waitForURL((u) => ![...u.searchParams.keys()].some((k) => k.startsWith('filter.'))), clear.click()]);
    // axe chạy script trong trang: context tắt JS làm frame.evaluate treo tới timeout 30s (CI #286). Markup empty state do
    // Liquid in, giống hệt khi bật JS, nên quét axe ở context bật JS cùng URL lọc ra 0.
    const context = await newStoreContext(browser, { ...STORE_CONTEXT(), javaScriptEnabled: true });
    try {
      const withJs = await context.newPage();
      await gotoStore(withJs, `${MAIN}?${ENV.noResultQuery}`);
      await expect(withJs.getByTestId('collection-empty')).toBeVisible();
      await expectAxeClean(withJs, 'main');
    } finally {
      await context.close();
    }
    void guard;
  });

  test('TC-25 AC3 nojs: Apply sort → sort_by trong URL; sort giữ filter đang áp', async ({ page, guard }) => {
    await size(page, 1280);
    await gotoStore(page, MAIN);
    const sort = page.getByTestId('collection-sort');
    const value = (await sort.locator('option:not([selected])').first().getAttribute('value'))!;
    await sort.selectOption(value);
    await Promise.all([page.waitForURL((u) => u.searchParams.get('sort_by') === value), page.getByTestId('collection-sort-apply').click()]);
    await expect(page.getByTestId('collection-sort')).toHaveValue(value);

    if (!(await hasFilters(page))) return;
    const input = openInputs(page).first();
    const name = (await input.getAttribute('name'))!;
    const fv = (await input.getAttribute('value'))!;
    await input.check();
    await Promise.all([page.waitForURL((u) => u.searchParams.getAll(name).includes(fv)), page.getByTestId('collection-filter-apply').click()]);
    const other = (await page.getByTestId('collection-sort').locator('option:not([selected])').first().getAttribute('value'))!;
    await page.getByTestId('collection-sort').selectOption(other);
    await Promise.all([page.waitForURL((u) => u.searchParams.get('sort_by') === other), page.getByTestId('collection-sort-apply').click()]);
    expect(new URL(page.url()).searchParams.getAll(name)).toContain(fv);
    void guard;
  });

  test('TC-32 AC4 nojs 360: Filter mở/đóng popover; tick + "Show N products" → badge 1, tên nút có 1', async ({ page, guard }) => {
    await size(page, 360);
    await gotoStore(page, MAIN);
    test.skip(!(await hasFilters(page)), NO_FILTERS);
    const opener = page.getByTestId('collection-filter-open');
    const drawer = page.getByTestId('collection-filter-drawer');
    await expect(page.getByTestId('collection-filter-count')).toHaveCount(0);
    await opener.click();
    await expect(drawer).toBeVisible();
    await page.getByTestId('collection-filter-close').click();
    await expect(drawer).toBeHidden();

    await opener.click();
    await expect(drawer).toBeVisible();
    const input = openInputs(page).first();
    const name = (await input.getAttribute('name'))!;
    const value = (await input.getAttribute('value'))!;
    await input.check();
    await Promise.all([page.waitForURL((u) => u.searchParams.getAll(name).includes(value)), page.getByTestId('collection-filter-apply').click()]);
    await expect(page.getByTestId('collection-filter-count')).toHaveText('1');
    await expect(opener).toHaveAccessibleName(/1 filter applied/);
    await expect(drawer).toBeHidden();
    void guard;
  });

  test('TC-33 AC4 nojs 360: tick 1 giá trị + giá → badge 2', async ({ page, guard }) => {
    await size(page, 360);
    await gotoStore(page, MAIN);
    const max = page.getByTestId('collection-filter-price-max');
    test.skip((await max.count()) === 0, 'Không có filter giá (ES1-T105 #2)');
    test.skip((await openInputs(page).count()) === 0, 'Không có giá trị lọc dạng checkbox');
    await page.getByTestId('collection-filter-open').click();
    await openInputs(page).first().check();
    await max.fill(String(await max.getAttribute('max')));
    await Promise.all([page.waitForURL((u) => u.searchParams.has('filter.v.price.lte')), page.getByTestId('collection-filter-apply').click()]);
    await expect(page.getByTestId('collection-filter-count')).toHaveText('2');
    void guard;
  });

  test('TC-46 AC6 nojs: Next là link thường → trang 2 có card, current 2', async ({ page, guard }) => {
    await gotoStore(page, ALL);
    await expect(page.getByTestId('collection-banner').getByTestId('page-title-heading')).toBeVisible();
    const next = nextLink(page);
    test.skip((await next.count()) === 0, NO_PAGES);
    await Promise.all([page.waitForURL(/[?&]page=2\b/), next.click()]);
    await expectNotChallenged(page);
    await expect(page.getByTestId('pagination-current')).toHaveText('2');
    await expect(page.getByTestId('collection-product').first()).toBeVisible();
    await expect(prevLink(page)).toHaveAttribute('href', /\/collections\/all(\?page=1)?$/);
    void guard;
  });

  test('TC-49 AC7 nojs: ?page=9999 → empty state, "Go to page 1" về trang 1 có card', async ({ page, guard }) => {
    await gotoStore(page, `${ALL}?page=9999`);
    await expect(page.getByTestId('collection-page-empty')).toBeVisible();
    const button = page.getByTestId('collection-page-empty-button');
    await expect(button).toHaveText('Go to page 1');
    await Promise.all([page.waitForURL((u) => !u.searchParams.has('page') || u.searchParams.get('page') === '1'), button.click()]);
    await expect(page.getByTestId('collection-product').first()).toBeVisible();
    void guard;
  });

  test('TC-39 AC5 nojs: list-collections hiện, bấm giữa card tới trang collection', async ({ page, guard }) => {
    await gotoStore(page, LIST);
    const card = page.getByTestId('list-collections-card').first();
    test.skip((await card.count()) === 0, 'Store không có collection');
    await expect(card).toBeVisible();
    const href = (await card.getByTestId('list-collections-card-link').getAttribute('href'))!;
    // ES1-T367: bấm giữa card (ảnh) rơi vào ::after của link tên
    await Promise.all([page.waitForURL((u) => u.pathname === new URL(href, page.url()).pathname), card.click()]);
    await expect(page.getByTestId('collection-banner').getByTestId('page-title-heading')).toBeVisible();
    void guard;
  });
});

// =====================================================================
test.describe('ES1-T112 ngân sách JS (CTO 06/11, ADR 0006/0010)', () => {
  /** transferSize JS theme (/assets/*.js); 0 khi đọc từ cache thì lấy encodedBodySize. */
  const themeJsBytes = (page: Page) =>
    page.evaluate(() =>
      (performance.getEntriesByType('resource') as PerformanceResourceTiming[])
        .filter((e) => /\/assets\/[^/?#]+\.js(?:[?#]|$)/.test(e.name))
        .reduce((n, e) => n + (e.transferSize || e.encodedBodySize || 0), 0),
    );
  async function scrollToEnd(page: Page) {
    for (let i = 0; i < 60; i++) {
      const done = await page.evaluate(() => {
        scrollBy(0, innerHeight * 0.8);
        return innerHeight + scrollY >= document.documentElement.scrollHeight - 2;
      });
      await page.waitForTimeout(150);
      if (done) break;
    }
  }

  for (const path of [...new Set([ALL, MAIN])]) {
    test(`TC-53 ${path}: JS theme tải sẵn ≤ 40 960 B, sau cuộn hết ≤ 65 536 B`, async ({ page, guard }) => {
      await gotoStore(page, path, { waitUntil: 'load' });
      const preload = await themeJsBytes(page);
      expect(preload, 'tải sẵn').toBeLessThanOrEqual(40_960);
      await scrollToEnd(page);
      await page.waitForTimeout(500);
      expect(await themeJsBytes(page), 'sau cuộn').toBeLessThanOrEqual(65_536);
      void guard;
    });
  }
});

// =====================================================================
test.describe('ES1-T112 contract (tĩnh)', () => {
  const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

  // Trần 8 192 B: drafts/techlead/ES1-T307/task-split.md §3 dòng ES1-T110 (gộp T111), CTO 11/11.
  test('TC-51 AC2: 3 tên partial khớp Liquid, collection-filters.js ≤ 8 192 B, script ngoài partial, không pushState', () => {
    const js = read('assets/collection-filters.js');
    const filters = read('blocks/collection-filters.liquid');
    const products = read('blocks/collection-products.liquid');
    for (const [name, liquid] of [['collection-products', products], ['collection-filters', filters], ['collection-filter-count', products]] as const) {
      expect(js).toContain(`"${name}"`);
      expect(liquid).toContain(`{% partial '${name}' %}`);
    }
    expect(Buffer.byteLength(js)).toBeLessThanOrEqual(8192);
    expect(filters.indexOf("'collection-filters.js' | asset_url")).toBeGreaterThan(filters.indexOf('{% endpartial %}'));
    expect(js).not.toMatch(/pushState/);
    expect(js).toMatch(/customElements\.get\("collection-filters"\)/);
    expect(filters).toMatch(/<modal-dialog data-layer="filter">\s*<dialog[^>]*id="collection-filter-drawer"/);
  });

  test('TC-52 AC4 fixture: "Show N products" đã áp chỉ đóng, chưa áp fetch 1 lần; ×, Esc đóng; focus về nút Filter', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const js = read('assets/collection-filters.js');
    const modal = read('assets/modal-dialog.js');
    // partials giả: apply ghi lại nhãn kết quả như server (rỗng = chưa áp)
    const body = js
      .replace(/^import .*$/m, 'const partials = { fetch: () => (window.__f = (window.__f || 0) + 1, Promise.resolve({})), apply: async () => document.querySelector("[data-results-label]").setAttribute("data-results-label", "3 products") };')
      .replace(/https:\/\/cdn\.shopify\.com[^"]*/, 'data:text/javascript,');
    await page.setViewportSize({ width: 360, height: 800 });
    const FIX = 'http://fixture.test/collections/x';
    await page.route(FIX, (r) => r.fulfill({ contentType: 'text/html', body: `<!doctype html><body><collection-filters>
      <modal-dialog data-layer="filter"><dialog id="collection-filter-drawer" popover aria-labelledby="t"><h2 id="t">Filters</h2>
        <button class="close-button" type="button" popovertarget="collection-filter-drawer" popovertargetaction="hide" data-testid="collection-filter-close">x</button>
        <form id="collection-filter-form" novalidate><input type="checkbox" name="filter.v.a" value="1" data-testid="in"><button type="submit" data-testid="collection-filter-apply">Show 3 products</button></form>
      </dialog></modal-dialog>
      <button type="button" popovertarget="collection-filter-drawer" data-testid="collection-filter-open">Filter</button>
      <div data-results-label="3 products"></div><div role="status" data-testid="collection-status"></div>
    </collection-filters></body>` }));
    await page.goto(FIX);
    await page.addScriptTag({ content: modal, type: 'module' });
    await page.addScriptTag({ content: body, type: 'module' });
    await expect(page.locator('collection-filters')).toHaveAttribute('data-enhanced', '');
    const drawer = page.locator('#collection-filter-drawer');
    const opener = page.getByTestId('collection-filter-open');

    await opener.click();
    expect(await drawer.evaluate((d) => d.matches(':modal') && !d.hasAttribute('popover'))).toBe(true);
    await page.getByTestId('collection-filter-apply').click();
    await expect(drawer).toBeHidden();
    await expect(opener).toBeFocused();
    expect(await page.evaluate(() => (window as unknown as { __f?: number }).__f ?? 0)).toBe(0);

    await opener.click();
    await page.getByTestId('in').evaluate((el) => ((el as HTMLInputElement).checked = true));
    await page.getByTestId('collection-filter-apply').click();
    await expect(drawer).toBeHidden();
    await expect(opener).toBeFocused();
    expect(await page.evaluate(() => (window as unknown as { __f?: number }).__f)).toBe(1);
    expect(new URL(page.url()).search).toBe('?filter.v.a=1');
    await expect(page.getByTestId('collection-status')).toHaveText('3 products');
    await opener.click();
    await page.getByTestId('collection-filter-close').click();
    await expect(drawer).toBeHidden();
    await opener.click();
    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden();
    await expect(opener).toBeFocused();

    // Trang không có drawer/form (search chưa có filter): click không lỗi
    await page.setContent('<collection-filters><button data-testid="collection-filter-open">F</button><a data-testid="collection-filter-clear">x</a></collection-filters>');
    await page.addScriptTag({ content: body, type: 'module' });
    await page.getByTestId('collection-filter-open').click();
    expect(errors).toEqual([]);
  });
});
