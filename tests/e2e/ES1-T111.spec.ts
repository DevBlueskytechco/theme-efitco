// KHÔNG CHẮC: spec chưa chạy (phiên agent không có trình duyệt, chưa type-check bằng tsc). Kết quả thật lấy từ CI e2e trên PR.
// Ticket ES1-T111 TE-6-BE2 (gộp vào ES1-T110, CTO 11/11): assets/collection-filters.js, drawer showModal + bàn phím,
// đóng modal khi lên 64rem, theme editor block select, ô giá debounce 400 ms + chặn min > max (docs/srs.md#TE-6 AC2, AC4;
// docs/ui-spec/collection.md §5.2, §5.3; snippets/filter-group.liquid {% doc %}).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T111.spec.ts -g "AC2-price|AC4"
// Dữ liệu: TE6_COLLECTION_HANDLE (ES1-T105), thiếu thì /collections/all. Không có filter giá / filter thì skip có lý do.
import { test, expect, type Page, type Request } from './support/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expectNotChallenged } from './support/store-guard';
import { env } from './support/store-data';
import { watchShopPay403 } from './support/console-guard';

const HANDLE = env('TE6_COLLECTION_HANDLE');
const MAIN = HANDLE ? `/collections/${encodeURIComponent(HANDLE)}` : '/collections/all';
const NO_FILTERS = 'Trang không có filter (Search and Discovery, ES1-T105 #2)';
const NO_PRICE = 'Không có filter giá (ES1-T105 #2)';
const GTE = 'filter.v.price.gte';
const LTE = 'filter.v.price.lte';
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  const isShopPay403 = watchShopPay403(page);
  page.on('console', (m) => {
    if (m.type() !== 'error' || isShopPay403(m)) return;
    const text = `${m.text()} @ ${m.location().url}`;
    // route.abort sinh log mạng của Chrome cho chính request bị huỷ: kịch bản test, không phải lỗi theme.
    if (/net::ERR_(FAILED|ABORTED)|Failed to fetch/.test(text)) return;
    if (!IGNORE_CONSOLE.some((r) => r.test(text))) errors.push(text);
  });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  return errors;
}

const root = (page: Page) => page.locator('collection-filters');
const drawer = (page: Page) => page.getByTestId('collection-filter-drawer');
const opener = (page: Page) => page.getByTestId('collection-filter-open');
const hasFilters = async (page: Page) => (await page.getByTestId('collection-filter-group').count()) > 0;
const openInputs = (page: Page) => page.locator('[data-testid="collection-filter-input"]:not(:checked):not(:disabled)');
const isPartial = (path: string) => (r: Request) =>
  r.resourceType() === 'fetch' && decodeURI(new URL(r.url()).pathname) === decodeURI(path) && !r.redirectedFrom();
const isModal = (page: Page) => drawer(page).evaluate((d) => (d as HTMLDialogElement).open && d.matches(':modal'));

async function ready(page: Page) {
  await expectNotChallenged(page);
  await expect(root(page)).toHaveAttribute('data-enhanced', '');
  await page.waitForFunction(() => !!customElements.get('modal-dialog'));
}

async function settled(page: Page) {
  await expect(root(page)).not.toHaveAttribute('aria-busy', 'true', { timeout: 15_000 });
  await expect(page.getByTestId('collection-status')).not.toBeEmpty();
}

/** Mở drawer bằng bàn phím khi < 64rem; từ 64rem form là cột trái, không cần mở. */
async function openByKeyboard(page: Page) {
  if (!(await opener(page).isVisible())) return;
  await opener(page).focus();
  await page.keyboard.press('Enter');
  await expect(drawer(page)).toBeVisible();
}

/** Đặt 2 ô cùng lúc rồi phát 1 sự kiện input: không có khoảng hở để debounce chạy với giá trị dở. */
const setPrices = (page: Page, lo: string, hi: string) =>
  page.evaluate(([lo, hi]) => {
    const [a, b] = ['min', 'max'].map((s) => document.querySelector<HTMLInputElement>(`[data-testid="collection-filter-price-${s}"]`)!);
    a.value = lo;
    b.value = hi;
    b.focus();
    b.dispatchEvent(new Event('input', { bubbles: true }));
  }, [lo, hi]);

/** Giá dạng 1,234.56 (store dev USD). Định dạng khác trả null để bỏ qua. */
const money = (s: string) => {
  const m = s.replace(/\s/g, '').match(/\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+(?:\.\d+)?/);
  return m ? Number(m[0].replace(/,/g, '')) : null;
};

test.describe('ES1-T111 store', () => {
  test('AC4 360 bàn phím: Enter mở modal, Tab không thoát drawer, Esc đóng, focus về nút Filter', async ({ page }) => {
    const errors = watchErrors(page);
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto(MAIN);
    test.skip(!(await hasFilters(page)), NO_FILTERS);
    await ready(page);
    await openByKeyboard(page);
    expect(await isModal(page), 'showModal, không phải popover').toBe(true);
    expect(await drawer(page).evaluate((d) => !d.hasAttribute('popover'))).toBe(true);

    // showModal làm phần trang ngoài dialog inert: Tab chỉ đi trong drawer (hoặc ra chrome trình duyệt = body), không vào phần tử trang
    let inside = 0;
    for (let i = 0; i < 25; i++) {
      await page.keyboard.press('Tab');
      const where = await drawer(page).evaluate((d) => (d.contains(document.activeElement) ? 'in' : document.activeElement === document.body || !document.activeElement ? 'chrome' : 'out'));
      expect(where, `Tab lần ${i + 1}`).not.toBe('out');
      if (where === 'in') inside++;
    }
    expect(inside).toBeGreaterThan(0);
    await page.keyboard.press('Escape');
    await expect(drawer(page)).toBeHidden();
    await expect(opener(page)).toBeFocused();
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('AC4 360 lọc trong drawer: drawer giữ mở, badge cập nhật, axe 0 serious khi drawer mở', async ({ page }) => {
    const errors = watchErrors(page);
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto(MAIN);
    test.skip(!(await hasFilters(page)), NO_FILTERS);
    await ready(page);
    await openByKeyboard(page);
    await openInputs(page).first().check();
    await settled(page);
    await expect(drawer(page)).toBeVisible();
    expect(await isModal(page)).toBe(true);
    await expect(page.getByTestId('collection-filter-count')).toHaveText('1');
    // Focus không bị kéo ra khỏi drawer sau apply
    expect(await drawer(page).evaluate((d) => d.contains(document.activeElement))).toBe(true);

    await expectNotChallenged(page); // ES1-T217 TC-03: kiểm màn thử thách ngay trước khi quét
    const r = await new AxeBuilder({ page }).include('#collection-filter-drawer').analyze();
    const bad = r.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? ''));
    expect(bad.map((v) => `${v.impact} ${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('AC4 đang mở ở 360, đổi lên 1280: hết modal, form hiện ở cột trái', async ({ page }) => {
    const errors = watchErrors(page);
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto(MAIN);
    test.skip(!(await hasFilters(page)), NO_FILTERS);
    await ready(page);
    await openByKeyboard(page);
    expect(await isModal(page)).toBe(true);

    await page.setViewportSize({ width: 1280, height: 800 });
    await expect.poll(() => isModal(page)).toBe(false);
    await expect(page.getByTestId('collection-filter-form')).toBeVisible();
    await expect(opener(page)).toBeHidden();
    // Không còn inert ngoài dialog: lưới nhận click / focus
    expect(await page.evaluate(() => !!document.querySelector('dialog:modal'))).toBe(false);
    await page.getByTestId('collection-sort').focus();
    await expect(page.getByTestId('collection-sort')).toBeFocused();
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('AC4 route.abort collection-filters.js: popover vẫn mở, form vẫn submit', async ({ page }) => {
    await page.route(/\/collection-filters\.js(\?|$)/, (r) => r.abort('failed'));
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto(MAIN);
    test.skip(!(await hasFilters(page)), NO_FILTERS);
    await expectNotChallenged(page);
    await expect(root(page)).not.toHaveAttribute('data-enhanced', '');
    await opener(page).click();
    await expect(drawer(page)).toBeVisible();
    expect(await drawer(page).evaluate((d) => d.matches(':popover-open'))).toBe(true);
    const input = openInputs(page).first();
    const name = (await input.getAttribute('name'))!;
    const value = (await input.getAttribute('value'))!;
    await input.check();
    await Promise.all([page.waitForURL((u) => u.searchParams.getAll(name).includes(value)), page.getByTestId('collection-filter-apply').click()]);
    await expect(page.getByTestId('collection-filter-count')).toHaveText('1');
  });

  test('AC2-price min, max: URL có 2 tham số, kết quả trong khoảng; xoá ô thì tham số mất', async ({ page }) => {
    const errors = watchErrors(page);
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(MAIN);
    const min = page.getByTestId('collection-filter-price-min');
    const max = page.getByTestId('collection-filter-price-max');
    test.skip((await min.count()) === 0, NO_PRICE);
    await ready(page);
    const ceiling = Number(await max.getAttribute('max'));
    test.skip(!(ceiling > 1), 'range_max quá nhỏ');
    const lo = String(Math.floor(ceiling / 4));
    const hi = String(Math.floor(ceiling / 2));

    await min.fill(lo);
    await max.fill(hi);
    await expect.poll(() => new URL(page.url()).searchParams.get(LTE), { timeout: 15_000 }).toBe(hi);
    await settled(page);
    const params = new URL(page.url()).searchParams;
    expect(params.get(GTE)).toBe(lo);
    expect(params.get(LTE)).toBe(hi);
    expect(Number(await min.inputValue())).toBe(Number(lo));
    expect(Number(await max.inputValue())).toBe(Number(hi));
    // Card một giá (price-regular): mọi biến thể cùng giá nên phải nằm trong khoảng
    for (const text of await page.getByTestId('product-card').getByTestId('price-regular').allTextContents()) {
      const v = money(text);
      if (v !== null) expect(v, text).toBeGreaterThanOrEqual(Number(lo));
      if (v !== null) expect(v, text).toBeLessThanOrEqual(Number(hi));
    }

    await min.fill('');
    await expect.poll(() => new URL(page.url()).searchParams.has(GTE), { timeout: 15_000 }).toBe(false);
    await settled(page);
    expect(new URL(page.url()).searchParams.get(LTE)).toBe(hi);
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('AC2-price min > max: không gửi request, lỗi hiện khi rời ô, aria-invalid', async ({ page }) => {
    const errors = watchErrors(page);
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(MAIN);
    const min = page.getByTestId('collection-filter-price-min');
    const max = page.getByTestId('collection-filter-price-max');
    test.skip((await min.count()) === 0, NO_PRICE);
    await ready(page);
    const path = new URL(page.url()).pathname;
    let sent = 0;
    page.on('request', (r) => isPartial(path)(r) && sent++);
    const url = page.url();

    await setPrices(page, '50', '10');
    await page.waitForTimeout(800);
    await max.press('Enter');
    await expect(page.getByTestId('collection-filter-price-error')).toBeVisible();
    await expect(min).toHaveAttribute('aria-invalid', 'true');
    await expect(max).toHaveAttribute('aria-invalid', 'true');
    await expect(max).toHaveAttribute('aria-describedby', /-error/);
    expect(sent).toBe(0);
    expect(page.url()).toBe(url);

    // Sửa lại hợp lệ: lỗi gỡ ngay, áp sau debounce
    await max.fill('100');
    await expect(page.getByTestId('collection-filter-price-error')).toBeHidden();
    await expect(max).not.toHaveAttribute('aria-invalid', 'true');
    await expect.poll(() => new URL(page.url()).searchParams.get(LTE), { timeout: 15_000 }).toBe('100');
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('AC2-price gõ nhanh: chỉ 1 request hoàn tất', async ({ page }) => {
    const errors = watchErrors(page);
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(MAIN);
    const max = page.getByTestId('collection-filter-price-max');
    test.skip((await max.count()) === 0, NO_PRICE);
    await ready(page);
    const ceiling = Math.floor(Number(await max.getAttribute('max')));
    test.skip(!(ceiling >= 10), 'range_max quá nhỏ');
    const path = new URL(page.url()).pathname;
    const done: string[] = [];
    page.on('requestfinished', (r) => isPartial(path)(r) && done.push(r.url()));

    await max.click();
    await max.pressSequentially(String(ceiling), { delay: 60 });
    await expect.poll(() => new URL(page.url()).searchParams.get(LTE), { timeout: 15_000 }).toBe(String(ceiling));
    await settled(page);
    await page.waitForTimeout(600);
    expect(done.length, done.join('\n')).toBe(1);
    await expect(max).toBeFocused();
    expect(errors, errors.join('\n')).toEqual([]);
  });
});

test.describe('ES1-T111 contract', () => {
  const js = readFileSync(join(process.cwd(), 'assets/collection-filters.js'), 'utf8');
  const modal = readFileSync(join(process.cwd(), 'assets/modal-dialog.js'), 'utf8');
  const group = readFileSync(join(process.cwd(), 'snippets/filter-group.liquid'), 'utf8');

  test('AC2-price contract: hook Liquid khớp JS, file tối đa 8192 B', () => {
    for (const id of ['collection-filter-price-min', 'collection-filter-price-max', 'collection-filter-price-error']) expect(group).toContain(`data-testid="${id}"`);
    expect(js).toContain('"collection-filter-price-"');
    // Trần 8 192 B: drafts/techlead/ES1-T307/task-split.md §3 dòng ES1-T110 + ES1-T111 (CTO 11/11), thay 7168 / 7296 của bản cũ.
    expect(Buffer.byteLength(js)).toBeLessThanOrEqual(8192);
    expect(js).not.toMatch(/console\./);
  });

  // partials giả: đếm fetch; apply làm như server: ghi lại nhãn kết quả, value/checked mặc định theo URL đã fetch
  const APPLY = `async () => {
    const q = new URL(window.__u).searchParams;
    document.querySelector("[data-results-label]").setAttribute("data-results-label", "3 products");
    for (const i of document.querySelectorAll("#collection-filter-form input[name]"))
      i.type == "checkbox" ? i.toggleAttribute("checked", q.getAll(i.name).includes(i.value)) : i.setAttribute("value", q.get(i.name) ?? "");
  }`;
  const body = js
    .replace(/^import .*$/m, `const partials = { fetch: (...a) => (window.__f = (window.__f || 0) + 1, window.__u = a.at(-1).url, Promise.resolve({})), apply: ${APPLY} };`)
    .replace(/https:\/\/cdn\.shopify\.com[^"]*/, 'data:text/javascript,');
  const FIX = 'http://fixture.test/collections/x';
  // CSS tối thiểu như assets/collection.css: từ 64rem nút Filter ẩn, dialog là cột tĩnh
  const html = `<!doctype html><style>@media (min-width:64rem){[data-testid=collection-filter-open]{display:none}#collection-filter-drawer:not([hidden]){display:block;position:static}}</style><body><collection-filters>
    <div data-testid="fx-block"><modal-dialog data-layer="filter"><dialog id="collection-filter-drawer" popover aria-labelledby="t"><h2 id="t">Filters</h2>
      <button class="close-button" type="button" popovertarget="collection-filter-drawer" popovertargetaction="hide" data-testid="collection-filter-close">x</button>
      <form id="collection-filter-form" novalidate>
        <input type="checkbox" name="filter.v.a" value="1" data-testid="in">
        <label for="lo">Min</label><input id="lo" type="number" name="filter.v.price.gte" step="any" aria-describedby="hint" data-testid="collection-filter-price-min">
        <label for="hi">Max</label><input id="hi" type="number" name="filter.v.price.lte" step="any" aria-describedby="hint" data-testid="collection-filter-price-max">
        <p id="hint">Highest price is $100.00</p><p id="err" hidden data-testid="collection-filter-price-error">Min price can't be higher than max price.</p>
        <button type="submit" data-testid="collection-filter-apply">Show 3 products</button>
      </form>
    </dialog></modal-dialog></div>
    <button type="button" popovertarget="collection-filter-drawer" data-testid="collection-filter-open">Filter</button>
    <div data-results-label="3 products"></div><div role="status" data-testid="collection-status"></div>
  </collection-filters></body>`;

  async function fixture(page: Page, width = 360) {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.setViewportSize({ width, height: 800 });
    await page.route(FIX, (r) => r.fulfill({ contentType: 'text/html', body: html }));
    await page.goto(FIX);
    await page.addScriptTag({ content: modal, type: 'module' });
    await page.addScriptTag({ content: body, type: 'module' });
    await expect(page.locator('collection-filters')).toHaveAttribute('data-enhanced', '');
    return errors;
  }
  const fetches = (page: Page) => page.evaluate(() => (window as unknown as { __f?: number }).__f ?? 0);
  const search = (page: Page) => page.evaluate(() => location.search);

  test('AC2-price tĩnh: gõ nhanh 1 fetch sau 400 ms, Enter áp ngay, ô rỗng bỏ khỏi URL', async ({ page }) => {
    const errors = await fixture(page, 1280);
    const lo = page.getByTestId('collection-filter-price-min');
    const hi = page.getByTestId('collection-filter-price-max');
    await hi.pressSequentially('250', { delay: 50 });
    expect(await fetches(page), 'chưa hết debounce').toBe(0);
    await expect.poll(() => fetches(page)).toBe(1);
    await page.waitForTimeout(500);
    expect(await fetches(page)).toBe(1);
    await expect.poll(() => search(page)).toBe('?filter.v.price.lte=250');

    await lo.fill('20.40');
    await lo.press('Enter');
    expect(await fetches(page), 'Enter không chờ debounce').toBe(2);
    await expect.poll(() => search(page)).toBe('?filter.v.price.gte=20.40&filter.v.price.lte=250');
    // Ô rỗng bỏ khỏi URL
    await hi.fill('');
    await hi.press('Enter');
    await expect.poll(() => search(page)).toBe('?filter.v.price.gte=20.40');
    await page.waitForTimeout(500);
    expect(await fetches(page), 'debounce đã huỷ khi Enter').toBe(3);
    expect(errors).toEqual([]);
  });

  test('AC2-price tĩnh: min > max không fetch, lỗi khi rời ô, sửa thì gỡ', async ({ page }) => {
    const errors = await fixture(page, 1280);
    const lo = page.getByTestId('collection-filter-price-min');
    const hi = page.getByTestId('collection-filter-price-max');
    const err = page.getByTestId('collection-filter-price-error');
    await setPrices(page, '50', '10');
    await page.waitForTimeout(600);
    expect(await fetches(page)).toBe(0);
    await expect(err).toBeHidden(); // chưa rời ô
    await hi.blur();
    await expect(err).toBeVisible();
    for (const i of [lo, hi]) {
      await expect(i).toHaveAttribute('aria-invalid', 'true');
      await expect(i).toHaveAttribute('aria-describedby', 'hint err');
    }
    // Enter, submit, đổi filter khác đều không fetch khi giá sai
    await hi.press('Enter');
    await page.getByTestId('in').check();
    await page.getByTestId('collection-filter-apply').click();
    expect(await fetches(page)).toBe(0);

    await hi.fill('60');
    await expect(err).toBeHidden();
    for (const i of [lo, hi]) {
      await expect(i).not.toHaveAttribute('aria-invalid');
      await expect(i).toHaveAttribute('aria-describedby', 'hint');
    }
    await expect.poll(() => fetches(page)).toBe(1);
    expect(errors).toEqual([]);
  });

  test('AC4 tĩnh: mở ở 360 rồi lên 1280 thì đóng modal; block select mở, deselect đóng', async ({ page }) => {
    const errors = await fixture(page);
    const d = page.locator('#collection-filter-drawer');
    await page.getByTestId('collection-filter-open').focus();
    await page.keyboard.press('Enter');
    expect(await d.evaluate((g) => g.matches(':modal'))).toBe(true);
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect.poll(() => d.evaluate((g) => (g as HTMLDialogElement).open)).toBe(false);

    // Theme editor: chỉ mở khi nút Filter hiện (< 64rem)
    const fire = (t: string) => page.getByTestId('fx-block').evaluate((el, t) => el.dispatchEvent(new CustomEvent('shopify:block:' + t, { bubbles: true })), t);
    await fire('select');
    expect(await d.evaluate((g) => (g as HTMLDialogElement).open)).toBe(false);
    await page.setViewportSize({ width: 360, height: 800 });
    await fire('select');
    await expect.poll(() => d.evaluate((g) => g.matches(':modal'))).toBe(true);
    await fire('deselect');
    await expect.poll(() => d.evaluate((g) => (g as HTMLDialogElement).open)).toBe(false);
    expect(errors).toEqual([]);
  });

  test('AC4 tĩnh: gõ giá trong drawer không đóng drawer, focus giữ ở ô', async ({ page }) => {
    const errors = await fixture(page);
    await page.getByTestId('collection-filter-open').click();
    const hi = page.getByTestId('collection-filter-price-max');
    await hi.fill('80');
    await hi.press('Enter');
    expect(await fetches(page)).toBe(1);
    await expect(page.locator('#collection-filter-drawer')).toBeVisible();
    await expect(hi).toBeFocused();
    expect(errors).toEqual([]);
  });
});
