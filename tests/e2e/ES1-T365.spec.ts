// ES1-T365 (TE-6-R2-FE2): trang collection: đầu trang (breadcrumb, h1, .page-banner LCP), lưới 12 cột 3/9, thanh công cụ
// (số kết quả, Sort, dính dưới 64rem), chip lọc trong partial collection-products, empty state 3 loại, ?page= vượt, phân trang chung.
// AC: TE-6 AC1, AC3, AC6, AC7 (SRS 0.4/0.5; AC1 0.5 trỏ AC8, AC13, AC14; thêm AC11, AC12 phần markup/CSS).
// Phần tĩnh + fixture: đọc file, dựng markup như block xuất, page.setContent với critical.css + base.css thật và token mặc định
// (space_base 4). Phần store: cần PREVIEW_URL/STORE_ORIGIN; dữ liệu thiếu (filter, banner) thì skip có lý do, không tính là đạt.
// Chạy: npx playwright test tests/e2e/ES1-T365.spec.ts --project=desktop
import { test, expect, type Page } from './support/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync, readdirSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { expectNotChallenged } from './support/store-guard';
import { env } from './support/store-data';

const BASE = readFileSync('assets/base.css', 'utf8');
// ES1-T478 (ADR 0013): CSS trang collection ở assets/collection.css, nạp sau base.css trên collection/search/list-collections
const COLLECTION = readFileSync('assets/collection.css', 'utf8');
const CRITICAL = readFileSync('assets/critical.css', 'utf8');
const TEMPLATE = readFileSync('templates/collection.liquid', 'utf8');
const BANNER = readFileSync('blocks/collection-banner.liquid', 'utf8');
const PRODUCTS = readFileSync('blocks/collection-products.liquid', 'utf8');
const LOCALE_RAW = readFileSync('locales/en.default.json', 'utf8');
const LOCALE = JSON.parse(LOCALE_RAW);
const BASE_URL = process.env.STORE_ORIGIN || (process.env.PREVIEW_URL ? new URL(process.env.PREVIEW_URL).origin : undefined);
const MAIN = env('TE6_COLLECTION_HANDLE') ? `/collections/${encodeURIComponent(env('TE6_COLLECTION_HANDLE')!)}` : '/collections/all';
const IMAGE = env('TE6_IMAGE_COLLECTION_HANDLE');

const START = '/** Collection page (TE-6';
const END = '/** Lọc collection (TE-6 AC9, AC10';
const section = () => {
  const from = COLLECTION.indexOf(START);
  return COLLECTION.slice(from, COLLECTION.indexOf(END, from));
};
const body = (src: string) => src.slice(src.indexOf('{% enddoc %}'));
const schema = (src: string) => JSON.parse(src.match(/{% schema %}([\s\S]*?){% endschema %}/)![1]);

// Token mặc định (settings_schema.json); css-variables.liquid là nguồn thật trên store.
const TOKENS = `:root{--space-1:4px;--space-2:8px;--space-3:12px;--space-4:16px;--space-5:24px;--space-6:32px;--space-7:48px;--space-8:120px;
--touch-target-min:24px;--page-margin:20px;--page-width:91rem;--header-height:80px;--radius-input:8px;--radius-button:8px;--radius-card:12px;--radius-pill:999px;
--color-background:#fff;--color-foreground:#1a1a1a;--color-muted:#6b6b6b;--color-muted-light:#808080;--color-border:#e5e5e5;--color-background-cream:#f5f5f1;
--color-background-alt:#f4f4f5;--color-background-alt-foreground:#1a1a1a;--color-background-dark:#1a1a1a;--color-background-dark-foreground:#fff;
--color-accent:#c8400e;--color-accent-foreground:#fff;--color-sale:#c8102e;
--font-size-xs:.8125rem;--font-size-sm:.875rem;--font-size-base:1rem;--font-size-h3:1.5rem;--font-size-h2:2rem;--font-size-h1:2rem;--line-height-body:1.5;--line-height-heading:1.1;
--font-heading--family:serif;--font-heading--weight:700;--font-heading--weight-display:800;--font-primary--family:sans-serif;
--motion-fast:150ms;--motion-base:250ms;--motion-slow:500ms;--motion-hero:1400ms;--ease-out:ease-out}`;

const card = (n: number) =>
  `<li class="collection-products__item" data-testid="card-${n}"><div style="aspect-ratio:1"></div><h2>Product ${n}</h2></li>`;
const chip = (group: string, value: string) =>
  `<li><a class="collection-chips__chip" href="#" aria-label="Remove filter ${group} ${value}" data-testid="chip"><span class="collection-chips__group">${group}:</span><span>${value}</span><svg viewBox="0 0 20 20" aria-hidden="true"></svg></a></li>`;

// Bản rút gọn đúng cấu trúc blocks/collection-filters + blocks/collection-products xuất ra, trong .block-container.
const FIXTURE = ({ filters = true, chips = true } = {}) => `
<div class="block-container">
<collection-filters class="collection-layout">
<div class="collection-filters">
<modal-dialog data-layer="filter">
<dialog class="drawer collection-filters__drawer" id="collection-filter-drawer" popover aria-labelledby="t" data-testid="drawer" ${filters ? '' : 'hidden'}>
  <div class="drawer__header collection-filters__header" data-testid="filter-header"><h2 class="drawer__title collection-filters__title" id="t">Filters</h2></div>
  <form class="collection-filters__form" id="collection-filter-form"><div class="collection-filters__panel"><div class="drawer__body collection-filters__body"></div></div></form>
</dialog>
</modal-dialog>
</div>
<div class="collection-products" style="--columns: 3; --columns-tablet: 3; --columns-mobile: 2;" data-testid="collection-products">
  <div class="collection-toolbar" data-testid="collection-toolbar">
    <button class="button button--secondary collection-toolbar__filter" type="button" data-testid="collection-filter-open" ${filters ? '' : 'hidden'}>
      <svg class="status-icon" viewBox="0 0 24 24" aria-hidden="true"></svg><span>Filter</span>
      <span class="collection-toolbar__count"><span class="collection-toolbar__badge" aria-hidden="true" data-testid="badge">2</span><span class="visually-hidden">2 filters applied</span></span>
    </button>
    <p class="collection-toolbar__results" tabindex="-1" data-testid="collection-count"><span class="collection-toolbar__number" data-testid="number">36</span> products</p>
    <div class="collection-toolbar__sort" data-testid="sort-wrap">
      <label class="collection-toolbar__sort-label" for="collection-sort" data-testid="sort-label">Sort by</label>
      <select class="collection-toolbar__select" id="collection-sort" data-testid="collection-sort"><option>Best selling</option><option>Price, low to high</option></select>
    </div>
    <div class="visually-hidden" role="status"></div>
  </div>
  <div class="collection-products__results" data-testid="collection-results">
    ${chips ? `<ul class="collection-chips" role="list" aria-label="Active filters" data-testid="chips">${chip('Color', 'Black')}${chip('Price', '$50.00–$400.00')}${chip('Brand', 'A-Very-Long-Vendor-Name-Without-Spaces-Over-Thirty')}<li><a class="collection-chips__clear" href="#" data-testid="chips-clear">Clear all</a></li></ul>` : ''}
    <ul class="collection-products__grid" role="list" data-testid="collection-grid">${[1, 2, 3, 4, 5, 6].map(card).join('')}</ul>
    <nav class="pagination" aria-label="Pagination" data-testid="pagination"><ul class="pagination__list" role="list"><li class="pagination__status">Page 1 of 2</li></ul></nav>
  </div>
</div>
</collection-filters>
</div>`;

const mount = async (page: Page, width: number, opts?: { filters?: boolean; chips?: boolean }) => {
  await page.setViewportSize({ width, height: 900 });
  await page.setContent(`<!doctype html><html><head><style>${TOKENS}${CRITICAL}${BASE}${COLLECTION}</style></head><body>${FIXTURE(opts)}</body></html>`);
};
const box = async (page: Page, id: string) => (await page.getByTestId(id).first().boundingBox())!;
const css = (page: Page, id: string, prop: string, pseudo: string | null = null) =>
  page.getByTestId(id).first().evaluate((el, [p, ps]) => getComputedStyle(el, ps).getPropertyValue(p!), [prop, pseudo] as const);
const noHorizontalScroll = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

test.describe('ES1-T365 tĩnh', () => {
  test.beforeEach(({}, ti) => { test.skip(ti.project.name !== 'desktop', 'tĩnh, chạy 1 lần'); });

  test('TC-01 template: banner → <collection-filters> [filters + products], không JSON template', () => {
    expect(readdirSync('templates').filter((f) => f.endsWith('.json'))).toEqual([]);
    const markup = TEMPLATE.slice(TEMPLATE.indexOf('%}') + 2); // bỏ comment dòng đầu
    const order = ["{% block 'collection-banner' %}", '<collection-filters', "{% block 'collection-filters' %}", "{% block 'collection-products' %}"].map((s) => markup.indexOf(s));
    expect(order.every((i) => i >= 0)).toBe(true);
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  test('TC-02 AC1/AC13 banner: breadcrumb + page-title, .page-banner LCP eager + high + alt rỗng, chỉ collection.image, .rte', () => {
    const src = body(BANNER);
    expect(src.match(/\{% render 'breadcrumb' %\}/g)).toHaveLength(2);
    expect(src.match(/\{% render 'page-title', title: collection\.title %\}/g)).toHaveLength(2);
    expect(src).not.toMatch(/<h1\b/);
    expect(src).toContain('<div class="page-banner">');
    expect(src).toMatch(/class: 'page-banner__media',[\s\S]*?image: collection\.image,[\s\S]*?loading: 'eager',\s*fetchpriority: 'high',\s*decorative: true/);
    expect(src).not.toContain('featured_image');
    expect(src).not.toMatch(/crop:/);
    expect(src).toMatch(/class="rte collection-banner__description[^"]*"[^>]*>\s*\{\{- collection\.description -\}\}/);
    expect(src).not.toMatch(/truncate|ellipsis|line-clamp/);
    expect(src).toContain('{%- if request.design_mode -%}');
    expect(schema(BANNER).presets).toBeUndefined();
  });

  test('TC-03 AC1/AC6 lưới + phân trang chung: paginate 24 window 1, card h2, snippet pagination không anchor/summary', () => {
    const src = body(PRODUCTS);
    expect(src).toContain('{% paginate collection.products by 24, window_size: 1 %}');
    expect(src).toContain("{% render 'pagination', paginate: paginate %}");
    expect(src).toContain("heading_level: 'h2'");
    expect(src).not.toMatch(/for variant in product\.variants|\| json/);
    const s = schema(PRODUCTS);
    expect(s.presets).toBeUndefined();
    expect(s.settings.map((x: { id: string }) => x.id)).toEqual(['columns_desktop', 'columns_mobile']);
    expect(s.settings[0]).toMatchObject({ type: 'select', default: '3' });
    expect(s.settings[1]).toMatchObject({ type: 'select', default: '2' });
  });

  test('TC-04 AC3 sort: select gốc label thật, form="collection-filter-form", sort_options, default_sort_by, noscript Apply', () => {
    const src = body(PRODUCTS);
    expect(src).toMatch(/<label class="collection-toolbar__sort-label" for="collection-sort">/);
    expect(src).toMatch(/<select[\s\S]*?id="collection-sort"[\s\S]*?name="sort_by"[\s\S]*?form="collection-filter-form"/);
    expect(src).toContain('{%- for option in collection.sort_options -%}');
    expect(src).toContain('assign current_sort = collection.sort_by | default: collection.default_sort_by');
    expect(src).toMatch(/<noscript>[\s\S]*?data-testid="collection-sort-apply"[\s\S]*?<\/noscript>/);
  });

  test('TC-05 AC12 chip trong partial collection-products: ul aria-label, url_to_remove, Clear all giữ sort', () => {
    const src = body(PRODUCTS);
    const partial = src.slice(src.indexOf("{% partial 'collection-products' %}"), src.lastIndexOf('{% endpartial %}'));
    expect(partial).toContain('aria-label="{{ chips_label | escape }}"');
    expect(partial).toContain('href="{{ value.url_to_remove }}"');
    expect(partial).toContain('href="{{ filter.url_to_remove }}"');
    expect(partial).toContain('href="{{ clear_url }}"');
    expect(partial.match(/aria-label="\{\{ chip_name \| escape \}\}"/g)).toHaveLength(2);
    expect(src).toMatch(/assign clear_url = clear_url \| append: '\?sort_by=' \| append: sort_param/);
    // Partial: tên phải trùng script BE (ES1-T110)
    for (const name of ['collection-products', 'collection-count', 'collection-filter-count']) {
      expect(src).toContain(`{% partial '${name}' %}`);
    }
  });

  test('TC-06 AC1/AC7/AC14 empty state: 3 loại qua snippet empty-state, URL qua routes.*, ?page= vượt có "Go to page 1"', () => {
    const src = body(PRODUCTS);
    expect(src.match(/\{% render 'empty-state',/g)).toHaveLength(4); // 3 loại + alert lỗi trong template
    expect(src).toContain('button_url: routes.all_products_collection_url');
    expect(src).toContain('link_url: routes.collections_url');
    expect(src).toContain('button_url: clear_url');
    expect(src).toContain('button_url: first_page_url');
    expect(src).toContain("testid: 'collection-page-empty'");
    expect(src).toMatch(/elsif collection\.products\.size == 0/);
    expect(src).not.toMatch(/href="\/(collections|search|cart)/);
    // Không sản phẩm nào: ẩn Filter + Sort
    expect(src).toMatch(/data-testid="collection-toolbar"\s*\{% if collection\.all_products_count == 0 %\}\s*hidden/);
    // Hook BE trạng thái tải / lỗi (ES1-T110)
    for (const hook of ['data-label-updating=', '<template data-collection-updating>', '<template data-collection-skeleton>', '<template data-collection-error>']) {
      expect(src).toContain(hook);
    }
  });

  test('TC-07 locale: chuỗi mới trong blocks.collection_products, không trùng key', () => {
    const p = LOCALE.blocks.collection_products;
    expect(p).toMatchObject({
      empty_heading: 'No Products Here Yet',
      empty_cta: 'Shop All Products',
      browse_collections: 'Browse collections',
      empty_filtered_heading: 'No Matching Products',
      empty_clear: 'Clear filters',
      page_first: 'Go to page 1',
      active_filters: 'Active filters',
      remove_filter: 'Remove filter {{ label }}: {{ value }}',
      updating: 'Updating products…',
      error_heading: "We couldn't update the products",
      sort_label: 'Sort by',
    });
    expect(p.results_count_html.other).toContain('{{ count }}');
    // Mọi khoá | t trong 2 block có trong locale
    const get = (key: string) => key.split('.').reduce((o: any, k) => (o ? o[k] : undefined), LOCALE);
    for (const src of [BANNER, PRODUCTS]) {
      for (const [, key] of src.matchAll(/'([a-z_.]+)' \| t\b/g)) expect(get(key), key).toBeDefined();
    }
    // Không trùng key trong khối collection_products (JSON.parse lấy key cuối, mất key đầu)
    const block = LOCALE_RAW.slice(LOCALE_RAW.indexOf('"collection_products": {'), LOCALE_RAW.indexOf('"faq": {'));
    const keys = [...block.matchAll(/^ {6}"([a-z_]+)":/gm)].map((m) => m[1]);
    expect(new Set(keys).size).toBe(keys.length);
  });

  test('TC-08 CSS mục collection: 0 màu literal, 0 thuộc tính vật lý, 0 z-index số; ngân sách base/critical', () => {
    const cssText = section().replace(/\/\*[\s\S]*?\*\//g, '');
    expect(cssText.length).toBeGreaterThan(2000);
    expect(cssText).not.toMatch(/#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(|:\s*(white|black)\b/i);
    expect(cssText).not.toMatch(/(^|[\s;{])(left|right|top|bottom|width|height|(margin|padding)-(left|right|top|bottom))\s*:/m);
    expect(cssText).not.toMatch(/z-index:\s*-?\d/);
    expect(cssText).not.toMatch(/\d+ms\b|\d+(\.\d+)?s\b\s*(ease|linear|;)/);
    for (const css of [BASE, COLLECTION]) expect(css).not.toMatch(/\.collection-banner__(image|title)\b|\.collection-products__(count|empty)\b/);
    // Trần ADR 0013 (ES1-T478): collection.css ≤ 16 384 B gzip; base.css ≤ 40 960 B gzip sau ES1-T566 (ADR 0014 mục 5)
    expect(gzipSync(BASE).length).toBeLessThanOrEqual(40960);
    expect(gzipSync(COLLECTION).length).toBeLessThanOrEqual(16384);
    expect(Buffer.byteLength(CRITICAL)).toBeLessThanOrEqual(10240);
  });

  test('TC-09 360: Filter + Sort hàng 1, số kết quả hàng 2, dính dưới header, lưới 2 × 152, chip ≥ 44 xuống dòng', async ({ page }) => {
    await mount(page, 360);
    const [filter, sort, count] = [await box(page, 'collection-filter-open'), await box(page, 'sort-wrap'), await box(page, 'collection-count')];
    expect(Math.abs(filter.y - sort.y)).toBeLessThan(2);
    expect(count.y).toBeGreaterThan(filter.y + filter.height - 1);
    expect(filter.height).toBeGreaterThanOrEqual(48);
    expect(await css(page, 'collection-toolbar', 'position')).toBe('sticky');
    expect(await css(page, 'collection-toolbar', 'background-color')).toBe('rgb(255, 255, 255)');
    expect((await box(page, 'card-1')).width).toBeCloseTo(152, 0);
    expect(await css(page, 'collection-grid', 'row-gap')).toBe('24px');
    expect(await css(page, 'collection-grid', 'column-gap')).toBe('16px');
    for (const c of await page.getByTestId('chip').all()) expect((await c.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    expect((await box(page, 'chips-clear')).height).toBeGreaterThanOrEqual(44);
    expect(await noHorizontalScroll(page)).toBe(true);
    // Số 600 foreground, chữ muted 14
    expect(await css(page, 'number', 'font-weight')).toBe('600');
    expect(await css(page, 'number', 'color')).toBe('rgb(26, 26, 26)');
    expect(await css(page, 'collection-count', 'color')).toBe('rgb(107, 107, 107)');
    // Sort: viền muted-light, chữ 16 (không zoom iOS), nhãn trong ô
    expect(await css(page, 'collection-sort', 'border-top-color')).toBe('rgb(128, 128, 128)');
    expect(await css(page, 'collection-sort', 'font-size')).toBe('16px');
    const label = await box(page, 'sort-label');
    const select = await box(page, 'collection-sort');
    expect(label.y).toBeGreaterThanOrEqual(select.y);
    expect(label.y + label.height).toBeLessThanOrEqual(select.y + select.height);
  });

  test('TC-10 768: [Filter] số [Sort 240] một hàng, lưới 3 × 232', async ({ page }) => {
    await mount(page, 768);
    const [filter, sort, count] = [await box(page, 'collection-filter-open'), await box(page, 'sort-wrap'), await box(page, 'collection-count')];
    expect(sort.width).toBeCloseTo(240, 0);
    expect(count.x).toBeGreaterThan(filter.x + filter.width);
    expect(sort.x).toBeGreaterThan(count.x);
    expect(Math.abs(count.y + count.height / 2 - (filter.y + filter.height / 2))).toBeLessThan(4);
    expect((await box(page, 'card-1')).width).toBeCloseTo(232, 0);
    expect(await css(page, 'collection-toolbar', 'position')).toBe('sticky');
  });

  // 1280: nội dung 1240, cột 12 = 81.33, lọc 3 cột + 2 gutter = 292, kết quả 924 từ x 336; 1920: 1416, lọc 336, kết quả 1056 từ x 612
  for (const [width, column, resultsX, resultsWidth, cardWidth] of [[1280, 292, 336, 924, 292], [1920, 336, 612, 1056, 336]] as const) {
    test(`TC-11 ${width} AC8: cột lọc ${column}, 3 card × ${cardWidth}, gap 24/40, toolbar không dính, gạch thẳng hàng`, async ({ page }) => {
      await mount(page, width);
      expect((await box(page, 'drawer')).width).toBeCloseTo(column, 0);
      const results = await box(page, 'collection-products');
      expect(results.x).toBeCloseTo(resultsX, 0);
      expect(results.width).toBeCloseTo(resultsWidth, 0);
      expect((await box(page, 'card-1')).width).toBeCloseTo(cardWidth, 0);
      expect(await css(page, 'collection-grid', 'row-gap')).toBe('40px');
      expect(await css(page, 'collection-grid', 'column-gap')).toBe('24px');
      expect(await page.getByTestId('collection-filter-open').isVisible()).toBe(false);
      expect(await css(page, 'collection-toolbar', 'position')).toBe('static');
      expect(await css(page, 'collection-toolbar', 'border-bottom-color')).toBe('rgb(26, 26, 26)');
      const toolbar = await box(page, 'collection-toolbar');
      const header = await box(page, 'filter-header');
      expect(Math.abs(toolbar.y + toolbar.height - (header.y + header.height))).toBeLessThan(2);
      expect((await box(page, 'sort-wrap')).width).toBeCloseTo(240, 0);
      for (const c of await page.getByTestId('chip').all()) expect((await c.boundingBox())!.height).toBeGreaterThanOrEqual(40);
      expect(await noHorizontalScroll(page)).toBe(true);
    });
  }

  test('TC-12 1280 không filter: kết quả 12/12, toolbar chỉ số + Sort', async ({ page }) => {
    await mount(page, 1280, { filters: false, chips: false });
    expect((await box(page, 'collection-products')).width).toBeCloseTo(1240, 0);
    const [count, sort] = [await box(page, 'collection-count'), await box(page, 'sort-wrap')];
    expect(sort.x).toBeGreaterThan(count.x);
  });

  test('TC-13 hover/focus: chip đảo đen, nút Filter đảo đen + badge trắng, focus outline accent', async ({ page }) => {
    await mount(page, 360);
    await page.getByTestId('chip').first().hover();
    await expect(page.getByTestId('chip').first()).toHaveCSS('background-color', 'rgb(26, 26, 26)');
    await expect(page.getByTestId('chip').first()).toHaveCSS('color', 'rgb(255, 255, 255)');
    await page.getByTestId('collection-filter-open').hover();
    await expect(page.getByTestId('collection-filter-open')).toHaveCSS('background-color', 'rgb(26, 26, 26)');
    await expect(page.getByTestId('badge')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await page.mouse.move(0, 0);
    await page.keyboard.press('Tab');
    await page.getByTestId('chip').first().focus();
    expect(await css(page, 'chip', 'outline-color')).toBe('rgb(200, 64, 14)');
  });
});

test.describe('ES1-T365 store', () => {
  test.beforeEach(({}, ti) => {
    test.skip(!BASE_URL, 'cần PREVIEW_URL hoặc STORE_ORIGIN');
  });

  test('TC-14 AC1/AC13: 1 h1 = tên collection, breadcrumb Home / Collections / tên, số kết quả, axe sạch', async ({ page }) => {
    const res = await page.goto(MAIN);
    expect(res?.status()).toBe(200);
    await expectNotChallenged(page);
    await expect(page.locator('h1')).toHaveCount(1);
    const h1 = page.getByTestId('collection-banner').getByTestId('page-title-heading');
    await expect(h1).toBeVisible();
    await expect(page.getByTestId('breadcrumb-current')).toHaveText((await h1.textContent())!.trim());
    await expect(page.getByTestId('breadcrumb').locator('li')).toHaveCount(3);
    const grid = page.getByTestId('collection-grid');
    test.skip((await grid.count()) === 0, `${MAIN} không có sản phẩm`);
    await expect(page.getByTestId('collection-count')).toBeVisible();
    const label = await page.getByTestId('collection-results').getAttribute('data-results-label');
    await expect(page.getByTestId('collection-count')).toHaveText(label!);
    await expectNotChallenged(page);
    const r = await new AxeBuilder({ page }).include('main').analyze();
    const bad = r.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? ''));
    expect(bad.map((v) => `${v.id}: ${v.nodes[0]?.target.join(' ')}`)).toEqual([]);
  });

  test('TC-15 AC7: ?page= vượt số trang → empty state + "Go to page 1" về trang 1, không lưới, HTTP 200', async ({ page }) => {
    const res = await page.goto(`${MAIN}?page=999`);
    expect(res?.status()).toBe(200);
    await expectNotChallenged(page);
    const empty = page.getByTestId('collection-page-empty');
    test.skip((await page.getByTestId('collection-empty').count()) > 0, `${MAIN} không có sản phẩm: empty state collection thay vì trang vượt`);
    await expect(empty).toBeVisible();
    await expect(page.getByTestId('collection-grid')).toHaveCount(0);
    await expect(page.getByTestId('pagination')).toHaveCount(0);
    const button = page.getByTestId('collection-page-empty-button');
    await expect(button).toHaveText('Go to page 1');
    await button.click();
    expect(new URL(page.url()).searchParams.get('page') ?? '1').toBe('1');
    await expect(page.getByTestId('collection-grid')).toBeVisible();
  });

  test('TC-16 AC6: phân trang chung — trang 1 Previous tắt giữ chỗ, Next là link page=2', async ({ page }) => {
    await page.goto(MAIN);
    const nav = page.getByTestId('pagination');
    test.skip((await nav.count()) === 0, `${MAIN} ≤ 24 sản phẩm`);
    await expect(page.getByTestId('pagination-previous-disabled')).toHaveAttribute('aria-disabled', 'true');
    await expect(page.getByTestId('pagination-next')).toHaveAttribute('href', /[?&]page=2\b/);
  });

  test('TC-17 AC1 LCP: có banner thì ảnh banner eager + high, alt rỗng, mọi card lazy; không banner thì hàng đầu eager', async ({ page }) => {
    await page.goto(IMAGE ? `/collections/${encodeURIComponent(IMAGE)}` : MAIN);
    const banner = page.getByTestId('collection-banner-image').locator('img');
    if (await banner.count()) {
      await expect(banner).toHaveAttribute('loading', 'eager');
      await expect(banner).toHaveAttribute('fetchpriority', 'high');
      await expect(banner).toHaveAttribute('alt', '');
      await expect(page.getByTestId('product-card-image').and(page.locator('[loading="eager"]'))).toHaveCount(0);
      await expect(page.locator('.page-banner').getByTestId('breadcrumb')).toHaveCount(1);
      return;
    }
    test.skip(!!IMAGE, 'TE6_IMAGE_COLLECTION_HANDLE không có ảnh');
    const first = page.getByTestId('product-card-image').first();
    test.skip((await first.count()) === 0, `${MAIN} không có ảnh card`);
    await expect(first).toHaveAttribute('loading', 'eager');
  });
});

test.describe('ES1-T365 nojs', () => {
  test.use({ javaScriptEnabled: false });
  test.beforeEach(({}, ti) => { test.skip(!BASE_URL, 'cần PREVIEW_URL hoặc STORE_ORIGIN'); });

  test('TC-18 AC12: chọn 1 giá trị lọc → chip "Remove filter …" là link, bấm bỏ lọc; Clear all về URL không filter', async ({ page }) => {
    await page.goto(MAIN);
    const input = page.locator('[data-testid="collection-filter-input"]:not(:disabled)').first();
    test.skip((await input.count()) === 0, 'Trang không có filter (Search and Discovery, ES1-T105 #2)');
    const [name, value] = [await input.getAttribute('name'), await input.getAttribute('value')];
    await page.goto(`${MAIN}?${encodeURIComponent(name!)}=${encodeURIComponent(value!)}`);
    const chips = page.getByTestId('collection-active-filters');
    await expect(chips).toHaveAttribute('aria-label', 'Active filters');
    const first = page.getByTestId('collection-chip').first();
    await expect(first).toHaveAttribute('aria-label', /^Remove filter .+: .+/);
    await expect(page.getByTestId('collection-chips-clear')).toHaveAttribute('href', /\/collections\//);
    await first.click();
    expect(new URL(page.url()).searchParams.has(name!)).toBe(false);
    await expect(page.getByTestId('collection-active-filters')).toHaveCount(0);
  });
});
