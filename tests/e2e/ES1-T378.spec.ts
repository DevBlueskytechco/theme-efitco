// KHÔNG CHẮC: spec chưa chạy, chưa type-check (phiên viết không có trình duyệt, preview, node). Kết quả thật lấy từ CI.
// Ticket ES1-T378 TE-8-R2-BE1 (docs/srs.md TE-8 AC1; docs/ui-spec/predictive-search.md §2, §4, §6, §8; hook: {% doc %} snippets/predictive-search.liquid).
// JS: assets/predictive-search.js (lõi, ≤ 6 912 B, ADR 0010) + assets/predictive-search-results.js (vẽ nhóm, tab, nút chân; ≤ 8 192 B, import() khi connect).
// Không lặp ES1-T130 (debounce, huỷ, ↑↓ Enter Esc, nút xoá, lỗi tải module) và ES1-T131 (TC-05..TC-24 tab, khám phá, trạng thái):
// spec này kiểm hợp đồng hook BE ↔ FE và phần chỉ BE1 làm: data-tab, aria-labelledby tabpanel, roving tabindex, bỏ qua option ẩn,
// sale/badge/hết hàng, ngày bài viết, skeleton/spinner, CSS tầng 5 một link, module results lỗi tải.
// Mock /search/suggest.json bằng page.route. Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T378.spec.ts
import { readFileSync, statSync } from 'node:fs';
import { test, expect, type Page, type Request } from './support/test';
import AxeBuilder from '@axe-core/playwright';
import { expectNotChallenged, gotoStore, watchStore } from './support/store-guard';

const CORE = 'assets/predictive-search.js';
const RESULTS = 'assets/predictive-search-results.js';
const SNIPPET = 'snippets/predictive-search.liquid';
const SUGGEST = /\/search\/suggest\.json/;
const RESULTS_URL = /\/predictive-search-results\.js/;

const T = {
  link: 'header-search-link',
  root: 'predictive-search',
  dialog: 'predictive-search-dialog',
  input: 'predictive-search-input',
  tabs: 'predictive-search-tabs',
  body: 'predictive-search-body',
  hint: 'predictive-search-hint',
  skeleton: 'predictive-search-skeleton',
  listbox: 'predictive-search-listbox',
  group: 'predictive-search-group',
  option: 'predictive-search-option',
  empty: 'predictive-search-empty',
  error: 'predictive-search-error',
  discover: 'predictive-search-discover',
  all: 'predictive-search-all',
  status: 'predictive-search-status',
};

type Item = Record<string, unknown>;
type Results = Partial<Record<'queries' | 'products' | 'collections' | 'articles' | 'pages', Item[]>>;

const product = (i: number, extra: Item = {}): Item => ({
  title: `Bench ${i}`,
  url: `/collections/all?_pos=${i}`,
  price: '10.00',
  compare_at_price_max: '0.00',
  image: null,
  available: true,
  ...extra,
});
const range = (n: number) => Array.from({ length: n }, (_, i) => i + 1);
const query = (text: string): Item => ({ text, styled_text: text, url: `/search?q=${encodeURIComponent(text)}` });
const FULL: Results = {
  queries: range(6).map((i) => query(`bench ${i}`)),
  products: range(8).map((i) => product(i)),
  collections: range(5).map((i) => ({ title: `Benches ${i}`, url: '/collections/all' })),
  articles: [{ title: 'Bench guide', url: '/blogs/news', published_at: '2026-03-05T10:00:00Z', image: null }],
  pages: [],
};

const tid = (page: Page, id: string) => page.getByTestId(id);
const isDesktop = () => test.info().project.name === 'desktop';
const groupOf = (page: Page, key: string) => tid(page, T.group).and(page.locator(`[data-predictive-group="${key}"]`));

async function mockSuggest(page: Page, reply: (q: string, n: number) => Results | number = () => FULL, delay: (q: string) => number = () => 0) {
  const requests: Request[] = [];
  page.on('request', (r) => SUGGEST.test(r.url()) && requests.push(r));
  let n = 0;
  await page.route(SUGGEST, async (route) => {
    const q = new URL(route.request().url()).searchParams.get('q') ?? '';
    const r = reply(q, n++);
    const wait = delay(q);
    if (wait) await new Promise((res) => setTimeout(res, wait));
    if (typeof r === 'number') return route.fulfill({ status: r, body: 'error' }).catch(() => {});
    await route.fulfill({ json: { resources: { results: r } } }).catch(() => {});
  });
  return requests;
}

async function openSearch(page: Page) {
  await gotoStore(page, '/');
  await tid(page, T.link).click();
  await expect(tid(page, T.dialog)).toBeVisible();
  await page.waitForFunction(() => !!customElements.get('predictive-search'));
  // ADR 0014 mục 8: BE chèn <link> từ data-stylesheet, chờ file load
  await page.waitForFunction(() => {
    const href = document.querySelector<HTMLElement>('[data-testid="predictive-search"]')?.dataset.stylesheet;
    if (!href) return true;
    const url = new URL(href, location.href).href;
    return [...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')].some((l) => l.href === url && !!l.sheet);
  });
}

async function typeAndWait(page: Page, text: string) {
  await tid(page, T.input).fill(text);
  await expect(tid(page, T.input)).toHaveAttribute('aria-expanded', 'true');
}

// =====================================================================
test.describe('ES1-T378 tĩnh', () => {
  test.beforeEach(() => test.skip(!isDesktop(), 'đọc repo, chạy 1 lần'));

  test('AC1 trần byte: lõi ≤ 6 912 (ADR 0010), results ≤ 8 192', () => {
    expect(statSync(CORE).size).toBeLessThanOrEqual(6912);
    expect(statSync(RESULTS).size).toBeLessThanOrEqual(8192);
  });

  test('AC1 hợp đồng hook: mọi data-predictive-* JS dùng đều có trong snippet', () => {
    const js = readFileSync(CORE, 'utf8') + readFileSync(RESULTS, 'utf8');
    const snippet = readFileSync(SNIPPET, 'utf8');
    const hooks = new Set([...js.matchAll(/data-predictive-[a-z-]+/g)].map((m) => m[0]));
    // $('price-label') trong option(): tên ghép từ tiền tố
    for (const s of js.matchAll(/\$\('([a-z-]+)'\)/g)) hooks.add(`data-predictive-${s[1]}`);
    for (const hook of hooks) expect(snippet, hook).toContain(hook);
    for (const label of ['labelLoading', 'labelProducts', 'labelShopAll', 'shopAllUrl', 'labelSalePrice', 'stylesheet', 'resultsSrc']) {
      expect(js, label).toContain(`.${label}`);
      expect(snippet, label).toContain(`data-${label.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`);
    }
    for (const id of ['predictive-search-all']) expect(js).toContain(id);
    expect(js).not.toMatch(/innerHTML|insertAdjacentHTML|outerHTML|partials|section_id|console\.|dispatchEvent|localStorage/);
  });

  test('AC1 lõi import results theo data-results-src (asset_url, ES1-T485), không import tĩnh, không thẻ script cho results', () => {
    const core = readFileSync(CORE, 'utf8');
    expect(core).toContain('import(this.dataset.resultsSrc)');
    expect(core).not.toContain('import.meta.url');
    expect(readFileSync(SNIPPET, 'utf8')).toContain(`data-results-src="{{ 'predictive-search-results.js' | asset_url }}"`);
    expect(core).not.toMatch(/^import\s/m);
    expect(readFileSync(RESULTS, 'utf8')).not.toMatch(/^import\s/m);
    for (const f of ['blocks/header.liquid', SNIPPET, 'layout/theme.liquid']) expect(readFileSync(f, 'utf8'), f).not.toMatch(/<script[^>]+predictive-search-results|modulepreload[^>]*predictive-search-results/);
    expect(core).toContain("'resources[type]': 'query,product,collection,article,page'");
  });
});

// =====================================================================
test.describe('ES1-T378 predictive (mock)', () => {
  test('AC1 results module chỉ tải sau khi mở; CSS tầng 5 đúng 1 link, skeleton ẩn sau load', async ({ page }) => {
    const loaded: string[] = [];
    page.on('request', (r) => RESULTS_URL.test(r.url()) && loaded.push(r.url()));
    await gotoStore(page, '/');
    await page.waitForLoadState('load');
    expect(loaded, 'results nạp trước click').toEqual([]);
    await tid(page, T.link).click();
    await expect(tid(page, T.dialog)).toBeVisible();
    await expect.poll(() => loaded.length).toBe(1);
    const href = await tid(page, T.root).getAttribute('data-stylesheet');
    test.skip(!href, 'snippet chưa có data-stylesheet');
    const url = new URL(href!, page.url()).href;
    await page.waitForFunction((u) => [...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')].some((l) => l.href === u && !!l.sheet), url);
    expect(await page.evaluate((u) => [...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')].filter((l) => l.href === u).length, url)).toBe(1);
    await expect(tid(page, T.skeleton)).toBeHidden();
    // Đóng, mở lại: không chèn link thứ hai
    await tid(page, T.input).press('Escape');
    await tid(page, T.link).click();
    expect(await page.evaluate((u) => [...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')].filter((l) => l.href === u).length, url)).toBe(1);
  });

  test('AC1 1 ký tự: hint + aria-describedby + khám phá; 2 ký tự gỡ', async ({ page }) => {
    await mockSuggest(page);
    await openSearch(page);
    const input = tid(page, T.input);
    await input.fill('b');
    await expect(tid(page, T.hint)).toBeVisible();
    await expect(input).toHaveAttribute('aria-describedby', 'PredictiveSearchHint');
    await expect(tid(page, T.discover)).not.toHaveAttribute('hidden', /.*/);
    await typeAndWait(page, 'be');
    await expect(tid(page, T.hint)).toBeHidden();
    await expect(input).not.toHaveAttribute('aria-describedby', /.*/);
  });

  test('AC1 tải lần đầu: skeleton, spinner, aria-busy, status loading, nút chân có q; lần sau giữ kết quả, không skeleton', async ({ page }) => {
    await mockSuggest(page, () => FULL, (q) => (q === 'bench' || q === 'benchx' ? 1500 : 0));
    await openSearch(page);
    const root = tid(page, T.root);
    await tid(page, T.input).fill('bench');
    await expect(tid(page, T.skeleton)).toBeVisible();
    await expect(root.locator('[data-predictive-spinner]')).toBeVisible();
    await expect(tid(page, T.listbox)).toHaveAttribute('aria-busy', 'true');
    await expect(tid(page, T.status)).toHaveText((await root.getAttribute('data-label-loading'))!);
    expect(new URL((await tid(page, T.all).getAttribute('href'))!, page.url()).searchParams.get('q')).toBe('bench');
    await expect(tid(page, T.listbox)).toBeVisible({ timeout: 5000 });
    await expect(tid(page, T.skeleton)).toBeHidden();
    await expect(root.locator('[data-predictive-spinner]')).toBeHidden();

    await tid(page, T.input).pressSequentially('x');
    await page.waitForTimeout(600);
    await expect(root.locator('[data-predictive-spinner]')).toBeVisible();
    await expect(tid(page, T.skeleton), 'lần sau không skeleton').toBeHidden();
    await expect(tid(page, T.listbox)).toBeVisible();
    await expect(tid(page, T.listbox)).not.toHaveAttribute('aria-busy', /.*/, { timeout: 5000 });
  });

  test('AC1 tab: data-tab, roving tabindex, tabpanel aria-labelledby, đếm 8+; mũi tên trong ô bỏ qua option ẩn', async ({ page }) => {
    await mockSuggest(page);
    await openSearch(page);
    await typeAndWait(page, 'bench');
    const root = tid(page, T.root);
    const tabs = tid(page, T.tabs).getByRole('tab');
    await expect(root).toHaveAttribute('data-tab', 'all');
    await expect(tabs.filter({ hasText: /Products/ })).toContainText('8+');
    await expect(tabs.filter({ hasText: /Collections/ })).toContainText('5');
    await expect(tabs.filter({ hasText: /Pages/ })).toHaveCount(0);

    // Tab All: 4 + 4 + 3 + 1 option hiện; ↑ từ đầu về option hiện cuối (bài viết), không về option ẩn
    const visible = tid(page, T.listbox).locator('[role="option"]:visible');
    await expect(visible).toHaveCount(4 + 4 + 3 + 1);
    await tid(page, T.input).press('ArrowUp');
    expect(await tid(page, T.input).getAttribute('aria-activedescendant')).toBe(await visible.last().getAttribute('id'));

    const products = tabs.filter({ hasText: /Products/ });
    await products.click();
    await expect(root).toHaveAttribute('data-tab', 'products');
    await expect(products).toHaveAttribute('tabindex', '0');
    await expect(tabs.first()).toHaveAttribute('tabindex', '-1');
    await expect(tid(page, T.body)).toHaveAttribute('aria-labelledby', (await products.getAttribute('id'))!);
    await expect(visible).toHaveCount(8);
    await expect(tid(page, T.input)).not.toHaveAttribute('aria-activedescendant', /.*/);
    await products.press('ArrowLeft');
    await expect(tabs.first()).toHaveAttribute('aria-selected', 'true');
    await expect(tabs.first()).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await expect(tabs.last(), 'cuộn vòng').toHaveAttribute('aria-selected', 'true');
  });

  test('AC1 từ khoá gợi ý: <mark> phần đã gõ; Enter trên từ khoá chép vào ô, gợi ý chạy lại, không rời trang', async ({ page }) => {
    const requests = await mockSuggest(page);
    await openSearch(page);
    await typeAndWait(page, 'bench');
    const first = groupOf(page, 'queries').getByTestId(T.option).first();
    await expect(first.locator('mark')).toHaveText('bench');
    const before = page.url();
    await tid(page, T.input).press('ArrowDown');
    await tid(page, T.input).press('Enter');
    await expect(tid(page, T.input)).toHaveValue('bench 1');
    await expect(tid(page, T.input)).toBeFocused();
    await expect.poll(() => requests.map((r) => new URL(r.url()).searchParams.get('q'))).toContain('bench 1');
    expect(page.url()).toBe(before);
  });

  test('AC1 giá sale: giá gạch, badge -N%, data-on-sale, nhãn Sale price; hết hàng: data-unavailable, Sold out', async ({ page }) => {
    await mockSuggest(page, () => ({
      products: [product(1, { price: '75.00', compare_at_price_max: '100.00' }), product(2, { available: false, title: 'Bench sold' })],
    }));
    await openSearch(page);
    await typeAndWait(page, 'bench');
    const [sale, sold] = [tid(page, T.option).nth(0), tid(page, T.option).nth(1)];
    await expect(sale).toHaveAttribute('data-on-sale', '');
    await expect(sale.locator('[data-predictive-compare-group]')).not.toHaveAttribute('hidden', /.*/);
    await expect(sale.locator('[data-predictive-compare]')).toHaveText(/100/);
    await expect(sale.locator('[data-predictive-badge]')).toHaveText('-25%');
    await expect(sale.locator('[data-predictive-price-label]')).toHaveText((await tid(page, T.root).getAttribute('data-label-sale-price'))!);
    await expect(sold).toHaveAttribute('data-unavailable', '');
    await expect(sold.locator('[data-predictive-sold-out]')).not.toHaveAttribute('hidden', /.*/);
    await expect(sold.locator('[data-predictive-compare-group]')).toHaveAttribute('hidden', '');
  });

  test('AC1 bài viết: ngày đăng trong meta; collection không meta; không ảnh thì gỡ img', async ({ page }) => {
    await mockSuggest(page);
    await openSearch(page);
    await typeAndWait(page, 'bench');
    const article = groupOf(page, 'articles').getByTestId(T.option).first();
    await expect(article.locator('[data-predictive-meta]')).toHaveText(/2026/);
    await expect(article.locator('img')).toHaveCount(0);
    await expect(groupOf(page, 'collections').locator('[data-predictive-meta]')).toHaveCount(0);
  });

  test('AC1 0 kết quả: hộp rỗng điền từ khoá, khám phá, nút chân Shop all; 0 sản phẩm có bài: dòng no-products', async ({ page }) => {
    await mockSuggest(page, (q) => (q === 'zzqx' ? {} : { articles: FULL.articles }));
    await openSearch(page);
    const root = tid(page, T.root);
    await typeAndWait(page, 'zzqx');
    await expect(tid(page, T.empty)).toBeVisible();
    await expect(tid(page, T.empty).locator('[data-predictive-terms]')).toHaveText('zzqx');
    await expect(tid(page, T.tabs)).toBeHidden();
    await expect(tid(page, T.discover)).not.toHaveAttribute('hidden', /.*/);
    await expect(tid(page, T.all)).toHaveAttribute('href', (await root.getAttribute('data-shop-all-url'))!);
    await expect(tid(page, T.all)).toContainText((await root.getAttribute('data-label-shop-all'))!);

    await typeAndWait(page, 'guide');
    await expect(tid(page, T.empty)).toBeHidden();
    await expect(root.locator('[data-predictive-no-products]')).not.toHaveAttribute('hidden', /.*/);
    await expect(root.locator('[data-predictive-no-products] [data-predictive-terms]')).toHaveText('guide');
  });

  test('AC1 lỗi 500: alert + Try again focus về ô, gọi lại, lành thì hiện kết quả; 0 console error', async ({ page }) => {
    const watch = watchStore(page);
    watch.allowNetworkLog();
    const requests = await mockSuggest(page, (_q, n) => (n === 0 ? 500 : FULL));
    await openSearch(page);
    await tid(page, T.input).fill('bench');
    const error = tid(page, T.error);
    await expect(error).toBeVisible();
    await expect(error.locator('[data-predictive-terms]')).toHaveText('bench');
    await expect(tid(page, T.input)).toHaveAttribute('aria-expanded', 'false');
    await expect(tid(page, T.all)).toBeVisible();
    await error.locator('[data-retry]').click();
    await expect(tid(page, T.input)).toBeFocused();
    await expect.poll(() => requests.length).toBe(2);
    await expect(tid(page, T.listbox)).toBeVisible();
    await expect(error).toBeHidden();
    await watch.finish();
  });

  test('AC1 predictive-search-results.js lỗi tải: hộp lỗi, submit vẫn chạy, 0 pageerror', async ({ page }) => {
    const watch = watchStore(page);
    watch.allowNetworkLog();
    await page.route(RESULTS_URL, (route) => route.abort('failed'));
    await mockSuggest(page);
    await gotoStore(page, '/');
    await tid(page, T.link).click();
    await page.waitForFunction(() => !!customElements.get('predictive-search'));
    await tid(page, T.input).fill('bench');
    await expect(tid(page, T.root).locator('[data-predictive-error]')).not.toHaveAttribute('hidden', /.*/);
    await expect(tid(page, T.option)).toHaveCount(0);
    await watch.finish();
    await Promise.all([page.waitForURL((u) => u.pathname.endsWith('/search')), tid(page, T.input).press('Enter')]);
    expect(new URL(page.url()).searchParams.get('q')).toBe('bench');
  });

  test('AC1 axe 0 serious: tab Products chọn, option active; hộp lỗi', async ({ page }) => {
    await mockSuggest(page, (q) => (q === 'fail' ? 500 : FULL));
    await openSearch(page);
    await typeAndWait(page, 'bench');
    await tid(page, T.tabs).getByRole('tab').filter({ hasText: /Products/ }).click();
    await tid(page, T.input).press('ArrowDown');
    const scan = async (label: string) => {
      await expectNotChallenged(page);
      const { violations } = await new AxeBuilder({ page }).include(`[data-testid="${T.dialog}"]`).analyze();
      const bad = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(bad.map((v) => `${v.id}: ${v.nodes[0]?.target}`), label).toEqual([]);
    };
    await scan('tab Products');
    await tid(page, T.input).fill('fail');
    await expect(tid(page, T.error)).toBeVisible();
    await scan('lỗi');
  });
});
