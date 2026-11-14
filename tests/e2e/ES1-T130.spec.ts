// KHÔNG CHẮC: spec chưa chạy, chưa type-check (phiên viết không có trình duyệt, preview, node). Kết quả thật lấy từ CI.
// Ticket ES1-T130 TE-8-BE1: assets/search-loader.js (≤ 256 B) + assets/predictive-search.js (≤ 6 656 B), docs/srs.md TE-8 AC1, NFR-4.
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T130.spec.ts -g "AC1"
// Phần lớn test mock /search/suggest.json bằng page.route để kiểm hành vi tất định (debounce, huỷ, phím, lỗi).
// Test dữ liệu thật dùng TE8_QUERY_ALL (ES1-T125, env hoặc tests/e2e/store-data.json); thiếu thì skip có lý do.
import { readFileSync, statSync } from 'node:fs';
import { test, expect, type Page, type Request } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { expectNotChallenged } from './support/store-guard';
import { watchShopPay403 } from './support/console-guard';
import { env } from './support/store-data';

const T = {
  link: 'header-search-link',
  root: 'predictive-search',
  dialog: 'predictive-search-dialog',
  form: 'predictive-search-form',
  input: 'predictive-search-input',
  submit: 'predictive-search-submit',
  clear: 'predictive-search-clear',
  listbox: 'predictive-search-listbox',
  group: 'predictive-search-group',
  option: 'predictive-search-option',
  all: 'predictive-search-all',
  status: 'predictive-search-status',
};

const LOADER = 'assets/search-loader.js';
const MODULE_FILE = 'assets/predictive-search.js';
const HEADER = 'blocks/header.liquid';
const SNIPPET = 'snippets/predictive-search.liquid';
const SUGGEST = /\/search\/suggest\.json/;
const MODULE = /\/predictive-search\.js/;
const IMAGE = /\/te130-fixture\.png/;
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|shopifysvc\.com|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];
// PNG 1×1 trong suốt: ảnh sản phẩm mock, không gọi CDN
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');

// Tên có thẻ HTML: JS phải gán textContent, không tạo phần tử
const XSS_TITLE = 'Bench <img src=x data-te130-xss> One';

type Results = Partial<Record<'products' | 'collections' | 'pages' | 'articles', Array<Record<string, unknown>>>>;

const FIXTURE: Results = {
  products: [
    { title: XSS_TITLE, url: '/collections/all?_pos=1&_psq=bench', price: '1234.50', image: '/cdn/shop/files/te130-fixture.png?v=1', available: true },
    { title: 'Bench Two', url: '/collections/all?_pos=2', price: '0.99', image: null, available: false },
  ],
  collections: [{ title: 'Benches', url: '/collections/all' }],
  pages: [{ title: 'Bench care', url: '/pages/contact' }],
  articles: [{ title: 'Bench guide', url: '/blogs/news' }],
};
const FIXTURE_OPTIONS = 2 + 1 + 1 + 1;

const tid = (page: Page, id: string) => page.getByTestId(id);
const isDesktop = () => test.info().project.name === 'desktop';

function watchConsole(page: Page) {
  const errors: string[] = [];
  const isShopPay403 = watchShopPay403(page);
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    if (isShopPay403(msg)) return;
    if (IGNORE_CONSOLE.some((r) => r.test(msg.text()) || r.test(msg.location().url))) return;
    // Chrome tự log request hỏng do test cố ý gây (route.abort, 429 mock): log mạng của trình duyệt, không phải console.* của theme
    if (/^Failed to load resource/.test(msg.text()) && (SUGGEST.test(msg.location().url) || MODULE.test(msg.location().url))) return;
    // Kèm URL nguồn: CI chỉ có log, cần biết lỗi từ trang nào, file nào
    errors.push(`${msg.text()} @ ${msg.location().url || page.url()}`);
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

/** Mock gợi ý. results theo q; trả danh sách request (đã gửi) để đếm. */
async function mockSuggest(page: Page, results: (q: string) => Results = () => FIXTURE, delay: (q: string) => number = () => 0) {
  const requests: Request[] = [];
  page.on('request', (r) => SUGGEST.test(r.url()) && requests.push(r));
  await page.route(IMAGE, (route) => route.fulfill({ contentType: 'image/png', body: PNG }));
  await page.route(SUGGEST, async (route) => {
    const q = new URL(route.request().url()).searchParams.get('q') ?? '';
    const wait = delay(q);
    if (wait) await new Promise((r) => setTimeout(r, wait));
    // Request đã bị trang huỷ thì fulfill ném lỗi: bỏ qua
    await route.fulfill({ json: { resources: { results: results(q) } } }).catch(() => {});
  });
  return requests;
}

async function openSearch(page: Page) {
  await page.goto('/');
  await expectNotChallenged(page);
  await tid(page, T.link).click();
  await expect(tid(page, T.dialog)).toBeVisible();
  await page.waitForFunction(() => !!customElements.get('predictive-search'));
}

async function typeAndWaitList(page: Page, text: string) {
  await tid(page, T.input).fill(text);
  await expect(tid(page, T.listbox)).toBeVisible();
}

const activeId = (page: Page) => tid(page, T.input).getAttribute('aria-activedescendant');

test.describe('ES1-T130 tĩnh', () => {
  test.beforeEach(() => test.skip(!isDesktop(), 'static, chạy 1 lần'));

  test('AC1 trần byte 256 và 6656, loader không comment', () => {
    expect(statSync(LOADER).size).toBeLessThanOrEqual(256);
    expect(statSync(MODULE_FILE).size).toBeLessThanOrEqual(6656);
    const loader = readFileSync(LOADER, 'utf8');
    expect(loader).not.toMatch(/\/\/|\/\*/);
    expect(loader).toContain('[data-search-src]');
  });

  test('AC1 header: script loader luôn có, không script predictive-search, link có data-search-src', () => {
    const header = readFileSync(HEADER, 'utf8');
    const scripts = header.match(/<script[^>]*>/g) ?? [];
    expect(scripts).toContain(`<script src="{{ 'search-loader.js' | asset_url }}" type="module">`);
    expect(scripts.join('\n')).not.toMatch(/predictive-search/);
    // Loader ngoài mọi {% if %}: dòng script không thụt lề
    expect(header).toMatch(/^<script src="\{\{ 'search-loader\.js' \| asset_url \}\}" type="module"><\/script>$/m);
    expect(header).toContain(`data-search-src="{{ 'predictive-search.js' | asset_url }}"`);
  });

  test('AC1 contract JS ↔ snippet: tên element, hook, không innerHTML, không partial, không console', () => {
    const js = readFileSync(MODULE_FILE, 'utf8');
    const snippet = readFileSync(SNIPPET, 'utf8');
    expect(js).toContain("customElements.get('predictive-search')");
    expect(snippet).toContain('<predictive-search');
    expect(snippet).toContain('assets/predictive-search.js');
    expect(js).not.toMatch(/innerHTML|insertAdjacentHTML|partials|section_id|console\.|dispatchEvent/);
    for (const hook of ['data-predictive-group', 'data-predictive-options', 'data-predictive-template', 'predictive-search-all']) {
      expect(js, hook).toContain(hook);
      expect(snippet, hook).toContain(hook);
    }
    for (const field of ['title', 'price', 'image']) {
      expect(snippet).toContain(`data-predictive-${field}`);
      expect(js).toContain(`'${field}'`);
    }
    for (const label of ['labelAll', 'labelCount', 'labelEmpty', 'moneyFormat', 'url']) expect(js).toContain(`.${label}`);
    for (const attr of ['data-label-all', 'data-label-count', 'data-label-empty', 'data-money-format', 'data-url']) expect(snippet).toContain(attr);
  });
});

test.describe('ES1-T130 predictive search', () => {
  test('AC1 trước click không tải predictive-search.js, click mở dialog, href vẫn /search', async ({ page }) => {
    const loaded: string[] = [];
    page.on('request', (r) => MODULE.test(r.url()) && loaded.push(r.url()));
    const errors = watchConsole(page);
    await page.goto('/');
    await expectNotChallenged(page);
    await page.waitForLoadState('load');
    expect(loaded, 'predictive-search.js nạp trước click').toEqual([]);
    await expect(page.locator('script[src*="predictive-search.js"]')).toHaveCount(0);

    const link = tid(page, T.link);
    await expect(link).toHaveAttribute('href', /\/search$/);
    const before = page.url();
    await link.click();
    await expect(tid(page, T.dialog)).toBeVisible();
    await expect(tid(page, T.input)).toBeFocused();
    expect(page.url()).toBe(before);
    await expect.poll(() => loaded.length).toBe(1);
    await page.waitForFunction(() => !!customElements.get('predictive-search'));
    expect(errors).toEqual([]);
  });

  test('AC1 1 ký tự không fetch; gõ nhanh 3 ký tự chỉ 1 request sau 300ms', async ({ page }) => {
    const requests = await mockSuggest(page);
    await openSearch(page);
    const input = tid(page, T.input);
    await input.pressSequentially('b');
    await page.waitForTimeout(700);
    expect(requests, '1 ký tự không được fetch').toHaveLength(0);
    await expect(tid(page, T.listbox)).toBeHidden();

    await input.fill('');
    await input.pressSequentially('ben', { delay: 60 });
    const typedAt = Date.now();
    await expect.poll(() => requests.length).toBe(1);
    const firedAt = Date.now();
    expect(firedAt - typedAt, 'debounce 300ms').toBeGreaterThanOrEqual(250);
    await page.waitForTimeout(700);
    expect(requests).toHaveLength(1);
    const url = new URL(requests[0].url());
    expect(url.searchParams.get('q')).toBe('ben');
    expect(url.searchParams.get('resources[type]')).toBe('product,collection,page,article');
    await expect(tid(page, T.listbox)).toBeVisible();
    await expect(tid(page, T.input)).toHaveAttribute('aria-expanded', 'true');
  });

  test('AC1 request cũ bị huỷ khi gõ tiếp, chỉ áp kết quả mới nhất', async ({ page }) => {
    const stale: Results = { products: [{ title: 'STALE RESULT', url: '/collections/all', price: '1.00', image: null }] };
    const requests = await mockSuggest(page, (q) => (q === 'be' ? stale : FIXTURE), (q) => (q === 'be' ? 2500 : 0));
    const failed: string[] = [];
    page.on('requestfailed', (r) => SUGGEST.test(r.url()) && failed.push(new URL(r.url()).searchParams.get('q') ?? ''));
    await openSearch(page);
    const input = tid(page, T.input);
    await input.fill('be');
    await expect.poll(() => requests.length).toBe(1);
    await expect(tid(page, T.listbox)).toHaveAttribute('aria-busy', 'true');
    await input.pressSequentially('n');
    await expect.poll(() => failed).toEqual(['be']);
    await expect(tid(page, T.listbox)).toBeVisible();
    await expect(tid(page, T.all)).toContainText('ben');
    await page.waitForTimeout(2800);
    await expect(tid(page, T.listbox)).not.toContainText('STALE RESULT');
    await expect(tid(page, T.listbox)).not.toHaveAttribute('aria-busy', /.*/);
  });

  test('AC1 render 4 nhóm từ JSON: ảnh, tên, giá; textContent; dòng all; status', async ({ page }) => {
    await mockSuggest(page);
    const errors = watchConsole(page);
    await openSearch(page);
    await typeAndWaitList(page, 'bench');

    const groups = await tid(page, T.group).evaluateAll((els) =>
      els.map((g) => [g.getAttribute('data-predictive-group'), (g as HTMLElement).hidden, g.querySelectorAll('[role="option"]').length])
    );
    expect(groups).toEqual([
      ['products', false, 2],
      ['collections', false, 1],
      ['pages', false, 1],
      ['articles', false, 1],
    ]);

    const first = tid(page, T.option).first();
    await expect(first).toHaveText(new RegExp(XSS_TITLE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    await expect(page.locator('[data-te130-xss]')).toHaveCount(0);
    await expect(first).toHaveAttribute('href', /\/collections\/all\?_pos=1/);
    const img = first.locator('img');
    await expect(img).toHaveAttribute('srcset', /width=64 64w/);
    await expect(img).toHaveAttribute('srcset', /width=128 128w/);
    await expect(img).toHaveAttribute('alt', '');
    await expect(first.locator('[data-predictive-price]')).toHaveText(/1.?234/);
    // Sản phẩm không ảnh: không có thẻ img vỡ
    await expect(tid(page, T.option).nth(1).locator('img')).toHaveCount(0);
    await expect(tid(page, T.option).nth(1).locator('[data-predictive-price]')).toHaveText(/0[.,]99/);

    // id duy nhất cho aria-activedescendant
    const ids = await tid(page, T.listbox).locator('[role="option"]').evaluateAll((els) => els.map((e) => e.id));
    expect(ids.every(Boolean)).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);

    const all = tid(page, T.all);
    await expect(all).toBeVisible();
    const href = new URL((await all.getAttribute('href'))!, page.url());
    expect(href.pathname).toMatch(/\/search$/);
    expect(href.searchParams.get('q')).toBe('bench');
    expect(href.searchParams.get('type')).toBe('product,article,page');
    const labelAll = (await tid(page, T.root).getAttribute('data-label-all'))!;
    await expect(all).toHaveText(labelAll.replace('%s', 'bench'));

    const labelCount = (await tid(page, T.root).getAttribute('data-label-count'))!;
    await expect(tid(page, T.status)).toHaveText(labelCount.replace('%n', String(FIXTURE_OPTIONS)));
    await expect(tid(page, T.input)).toHaveAttribute('aria-expanded', 'true');
    expect(errors).toEqual([]);
  });

  test('AC1 0 kết quả: nhóm ẩn, chỉ còn dòng all, status đọc câu rỗng', async ({ page }) => {
    await mockSuggest(page, () => ({ products: [], collections: [], pages: [], articles: [] }));
    await openSearch(page);
    await typeAndWaitList(page, 'zzqx');
    await expect(tid(page, T.option)).toHaveCount(0);
    for (const g of await tid(page, T.group).all()) await expect(g).toBeHidden();
    await expect(tid(page, T.all)).toBeVisible();
    const labelEmpty = (await tid(page, T.root).getAttribute('data-label-empty'))!;
    await expect(tid(page, T.status)).toHaveText(labelEmpty.replace('%s', 'zzqx'));
  });

  test('AC1 Xuống, Lên đi qua option, cuộn vòng; aria-activedescendant đúng; focus ở input', async ({ page }) => {
    await mockSuggest(page);
    await openSearch(page);
    await typeAndWaitList(page, 'bench');
    const input = tid(page, T.input);
    const options = page.locator(`[data-testid="${T.listbox}"] [role="option"]`);
    const count = await options.count();
    expect(count).toBe(FIXTURE_OPTIONS + 1);

    await input.press('ArrowDown');
    const firstId = await options.first().getAttribute('id');
    expect(await activeId(page)).toBe(firstId);
    await expect(options.first()).toHaveAttribute('aria-selected', 'true');
    await expect(input).toBeFocused();

    await input.press('ArrowUp');
    expect(await activeId(page), 'Lên từ đầu về cuối').toBe(await options.last().getAttribute('id'));
    await expect(options.last()).toHaveAttribute('aria-selected', 'true');
    await expect(options.first()).toHaveAttribute('aria-selected', 'false');

    await input.press('ArrowDown');
    expect(await activeId(page), 'Xuống từ cuối về đầu').toBe(firstId);
    await input.press('ArrowDown');
    expect(await activeId(page)).toBe(await options.nth(1).getAttribute('id'));
    await expect(page.locator('[role="option"][aria-selected="true"]')).toHaveCount(1);
    await expect(input).toBeFocused();

    // Gõ tiếp: bỏ chọn
    await input.pressSequentially('e');
    expect(await activeId(page)).toBeNull();
  });

  test('AC1 Enter trên option sang đúng URL', async ({ page }) => {
    await mockSuggest(page);
    await openSearch(page);
    await typeAndWaitList(page, 'bench');
    await tid(page, T.input).press('ArrowDown');
    await Promise.all([page.waitForURL((u) => u.pathname.endsWith('/collections/all')), tid(page, T.input).press('Enter')]);
    expect(new URL(page.url()).searchParams.get('_pos')).toBe('1');
  });

  test('AC1 Enter không chọn option sang /search?q', async ({ page }) => {
    await mockSuggest(page);
    await openSearch(page);
    await typeAndWaitList(page, 'bench');
    await Promise.all([page.waitForURL((u) => u.pathname.endsWith('/search')), tid(page, T.input).press('Enter')]);
    expect(new URL(page.url()).searchParams.get('q')).toBe('bench');
  });

  test('AC1 Esc 2 bước: đóng list rồi đóng dialog, focus về link', async ({ page }) => {
    await mockSuggest(page);
    await openSearch(page);
    await typeAndWaitList(page, 'bench');
    await tid(page, T.input).press('ArrowDown');
    await tid(page, T.input).press('Escape');
    await expect(tid(page, T.listbox)).toBeHidden();
    await expect(tid(page, T.dialog)).toBeVisible();
    await expect(tid(page, T.input)).toHaveAttribute('aria-expanded', 'false');
    expect(await activeId(page)).toBeNull();
    await expect(tid(page, T.input)).toBeFocused();
    // Esc 2 đóng dialog, không xoá chữ (Chrome mặc định xoá ô type=search khi Esc)
    await tid(page, T.input).press('Escape');
    await expect(tid(page, T.dialog)).toBeHidden();
    await expect(tid(page, T.input)).toHaveValue('bench');
    await expect(tid(page, T.link)).toBeFocused();
  });

  test('AC1 đóng dialog huỷ request đang chờ; mở lại giữ chữ và gợi ý chạy lại', async ({ page }) => {
    const requests = await mockSuggest(page);
    await openSearch(page);
    await tid(page, T.input).fill('bench');
    await tid(page, T.input).press('Escape');
    await expect(tid(page, T.dialog)).toBeHidden();
    await page.waitForTimeout(700);
    expect(requests, 'đóng trong lúc debounce thì không fetch').toHaveLength(0);
    await tid(page, T.link).click();
    await expect(tid(page, T.input)).toHaveValue('bench');
    await expect(tid(page, T.listbox)).toBeVisible();
    expect(requests).toHaveLength(1);
  });

  test('AC1 nút xoá: list ẩn, focus về ô', async ({ page }) => {
    await mockSuggest(page);
    await openSearch(page);
    await typeAndWaitList(page, 'bench');
    await tid(page, T.clear).click();
    await expect(tid(page, T.input)).toHaveValue('');
    await expect(tid(page, T.listbox)).toBeHidden();
    await expect(tid(page, T.status)).toBeEmpty();
    await expect(tid(page, T.input)).toBeFocused();
  });

  test('AC1 360 popup full màn khi mở bằng link', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expectNotChallenged(page);
    test.skip((await tid(page, T.dialog).getAttribute('data-style')) !== 'popup', 'store đang chọn drawer');
    await tid(page, T.link).click();
    const box = (await tid(page, T.dialog).boundingBox())!;
    expect(box.x).toBeCloseTo(0, 0);
    expect(box.y).toBeCloseTo(0, 0);
    expect(box.width).toBeCloseTo(360, 0);
    expect(box.height).toBeCloseTo(780, 0);
  });

  for (const mode of ['abort', '429'] as const) {
    test(`AC1 lỗi ${mode} trên URL gợi ý: list ẩn, 0 lỗi console, submit vẫn chạy`, async ({ page }) => {
      const errors = watchConsole(page);
      let hits = 0;
      await page.route(SUGGEST, (route) => {
        hits++;
        return mode === 'abort'
          ? route.abort('failed')
          : route.fulfill({ status: 429, headers: { 'Retry-After': '1' }, json: { status: '429', message: 'Too many requests', description: 'Throttled' } });
      });
      await openSearch(page);
      await tid(page, T.input).fill('bench');
      await expect.poll(() => hits).toBe(1);
      await page.waitForTimeout(500);
      await expect(tid(page, T.listbox)).toBeHidden();
      await expect(tid(page, T.input)).toHaveAttribute('aria-expanded', 'false');
      await expect(tid(page, T.listbox)).not.toHaveAttribute('aria-busy', /.*/);
      expect(hits, 'không retry').toBe(1);
      // NFR-4: lỗi console do request gợi ý hỏng; kiểm trước khi rời trang, lỗi của trang /search thuộc spec trang search
      expect(errors).toEqual([]);
      await Promise.all([page.waitForURL((u) => u.pathname.endsWith('/search')), tid(page, T.submit).click()]);
      expect(new URL(page.url()).searchParams.get('q')).toBe('bench');
    });
  }

  test('AC1 predictive-search.js lỗi tải: dialog vẫn mở, submit vẫn chạy', async ({ page }) => {
    const errors = watchConsole(page);
    let moduleFailed = false;
    page.on('requestfailed', (r) => MODULE.test(r.url()) && (moduleFailed = true));
    await page.route(MODULE, (route) => route.abort('failed'));
    await page.goto('/');
    await expectNotChallenged(page);
    await tid(page, T.link).click();
    await expect(tid(page, T.dialog)).toBeVisible();
    await expect.poll(() => moduleFailed).toBe(true);
    await tid(page, T.input).fill('bench');
    expect(await page.evaluate(() => !!customElements.get('predictive-search'))).toBe(false);
    // Kiểm console trước khi rời trang: lỗi của trang /search thuộc spec trang search
    expect(errors).toEqual([]);
    await Promise.all([page.waitForURL((u) => u.pathname.endsWith('/search')), tid(page, T.submit).click()]);
    expect(new URL(page.url()).searchParams.get('q')).toBe('bench');
  });

  test('AC1 Ctrl/Cmd click link mở tab mới, không mở dialog', async ({ page }) => {
    test.skip(!isDesktop(), 'thiết bị cảm ứng không có Ctrl/Cmd click');
    await page.goto('/');
    await expectNotChallenged(page);
    const before = page.url();
    const [tab] = await Promise.all([page.context().waitForEvent('page'), tid(page, T.link).click({ modifiers: ['ControlOrMeta'] })]);
    await tab.waitForURL((u) => u.pathname.endsWith('/search'));
    await tab.close();
    await expect(tid(page, T.dialog)).toBeHidden();
    expect(page.url()).toBe(before);
  });

  test('AC1 axe 0 serious khi list mở và có option active', async ({ page }) => {
    await mockSuggest(page);
    await openSearch(page);
    await typeAndWaitList(page, 'bench');
    await tid(page, T.input).press('ArrowDown');
    const { violations } = await new AxeBuilder({ page }).include(`[data-testid="${T.dialog}"]`).analyze();
    const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious.map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
  });

  test('AC1 dữ liệu thật: đủ 4 nhóm với TE8_QUERY_ALL, product có ảnh, tên, giá', async ({ page }) => {
    const query = env('TE8_QUERY_ALL');
    test.skip(!query, 'chưa có TE8_QUERY_ALL (ES1-T125: khoá chưa ghi vào store-data.json)');
    const errors = watchConsole(page);
    await openSearch(page);
    await typeAndWaitList(page, query!);
    for (const key of ['products', 'collections', 'pages', 'articles']) {
      await expect(tid(page, T.root).locator(`[data-predictive-group="${key}"]`), key).toBeVisible();
    }
    const product = tid(page, T.root).locator('[data-predictive-group="products"] [role="option"]').first();
    await expect(product.locator('[data-predictive-title]')).toHaveText(/\S/);
    await expect(product.locator('[data-predictive-price]')).toHaveText(/\d/);
    await expect(product.locator('img')).toHaveAttribute('srcset', /width=64/);
    expect(errors).toEqual([]);
  });
});
