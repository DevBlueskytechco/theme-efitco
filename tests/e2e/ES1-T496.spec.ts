// KHÔNG CHẮC: spec chưa chạy (phiên viết không có trình duyệt, preview, node_modules) → chờ CI.
// Ticket ES1-T496 (bug ES1-T386-B01, nối FE ES1-T486; TE-21 AC7, docs/ui-spec/404.md §5 "Đang gõ"):
// gõ ≥ 2 ký tự (trim) vào ô tìm 404 → chép giá trị sang #PredictiveSearchInput, mở <modal-dialog data-layer="search"> của header
// với opener là ô 404 (đóng lớp thì focus về ô 404), import predictive-search.js từ data-search-handoff.
// < 2 ký tự, không lớp header, modal-dialog.js chưa định nghĩa: không làm gì, form vẫn GET /search?q=. Không tự focus khi tải.
// Nhóm tĩnh và trang giả (page.route, JS đọc từ repo) không gọi store. Nhóm storefront chạy trên PREVIEW_URL (trang 404 thật).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T496.spec.ts
import { readFileSync } from 'node:fs';
import { test, expect, type Page } from './support/test';
import { gotoStore } from './support/store-guard';
import { watchShopPay403 } from './support/console-guard';

const read = (f: string) => readFileSync(f, 'utf8');
const size = (f: string) => Buffer.byteLength(read(`assets/${f}`));
const MISSING = '/pages/es1-t496-khong-co';
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|shopifysvc\.com|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];
const desktopOnly = (name: string) => test.skip(name !== 'desktop', 'chạy 1 lần ở project desktop');

function watchConsole(page: Page) {
  const errors: string[] = [];
  const isShopPay403 = watchShopPay403(page);
  page.on('console', (msg) => {
    if (msg.type() !== 'error' || isShopPay403(msg)) return;
    if (IGNORE_CONSOLE.some((r) => r.test(msg.text()) || r.test(msg.location().url))) return;
    // Chính response 404 của tài liệu trang 404 (như smoke.spec.ts), chỉ đúng URL MISSING; 404 tài nguyên khác vẫn tính.
    if (/status of 404/.test(msg.text()) && msg.location().url.split(/[?#]/)[0].endsWith(MISSING)) return;
    errors.push(`${msg.text()} @ ${msg.location().url}`);
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

// ---------- Tĩnh ----------
test.describe('ES1-T496 tĩnh', () => {
  test.beforeEach(({}, ti) => desktopOnly(ti.project.name));

  test('search-handoff.js ≤ 1 536 B, import() qua dataset, không console/fetch/import tĩnh', () => {
    const js = read('assets/search-handoff.js');
    expect(size('search-handoff.js')).toBeLessThanOrEqual(1536);
    expect(js).toContain('import(form.dataset.searchHandoff)');
    expect(js).toContain('modal-dialog[data-layer="search"]');
    expect(js).toContain('#PredictiveSearchInput');
    expect(js).toMatch(/\.trim\(\)\.length < 2/);
    expect(js).not.toMatch(/console\.|fetch\(|\.focus\(|import\.meta/);
    expect(js).not.toMatch(/^\s*import\s[^(]/m);
  });

  test('not-found.liquid: 1 thẻ script search-handoff trong nhánh show_search, hook giữ nguyên, không autofocus, không data-search-src', () => {
    const src = read('blocks/not-found.liquid');
    expect(src.match(/<script/g)).toHaveLength(1);
    const branch = src.slice(src.indexOf('{%- if block.settings.show_search -%}'), src.indexOf('{%- endif -%}', src.indexOf('</form>')));
    expect(branch).toContain(`<script src="{{ 'search-handoff.js' | asset_url }}" type="module"></script>`);
    expect(branch).toContain(`data-search-handoff="{{ 'predictive-search.js' | asset_url }}"`);
    // Bỏ {% doc %} (FE ES1-T486 đã merge ghi "Not data-search-src" để giải thích) — chỉ kiểm markup.
    expect(src.replace(/\{% doc %\}[\s\S]*?\{% enddoc %\}/, '')).not.toMatch(/autofocus|data-search-src/);
    expect(read('templates/404.liquid')).not.toMatch(/<script/);
  });

  test('ES1-T130 không đổi: search-loader.js ≤ 256 B, chỉ nghe click', () => {
    const loader = read('assets/search-loader.js');
    expect(size('search-loader.js')).toBeLessThanOrEqual(256);
    expect(loader.match(/addEventListener\("(\w+)"/g)).toEqual(['addEventListener("click"']);
    expect(loader).not.toContain('searchHandoff');
  });
});

// ---------- Trang giả: hành vi JS, không gọi store ----------
const ORIGIN = 'https://theme496.test';
const SUGGEST = {
  resources: {
    results: {
      products: [{ title: 'Dumbbell 10 kg', url: '/products/dumbbell', price: '19.00', image: '' }],
      collections: [],
      pages: [],
      articles: [],
    },
  },
};

function fakeHtml({ layer = true, modal = true } = {}) {
  const dialog = `<modal-dialog data-layer="search"><dialog class="drawer" aria-labelledby="PredictiveSearchTitle" data-testid="predictive-search-dialog">
<predictive-search data-testid="predictive-search" data-url="/search/suggest" data-results-src="/assets/predictive-search-results.js?v=1" data-money-format="\${{amount}}" data-label-count="%n results" data-label-empty="No results for %s" data-label-all="View all results for %s">
<h2 id="PredictiveSearchTitle">Search</h2>
<form action="/search" method="get" role="search" data-testid="predictive-search-form">
<label for="PredictiveSearchInput">Search</label>
<input id="PredictiveSearchInput" type="search" name="q" value="" autofocus autocomplete="off" role="combobox" aria-expanded="false" aria-controls="PredictiveSearchListbox" aria-autocomplete="list" data-testid="predictive-search-input">
</form>
<div role="status" data-testid="predictive-search-status"></div>
<div id="PredictiveSearchListbox" role="listbox" aria-label="Suggestions" hidden data-testid="predictive-search-listbox">
<div role="group" aria-labelledby="G-products" hidden data-predictive-group="products"><div id="G-products">Products</div><div data-predictive-options></div></div>
<a href="/search" role="option" tabindex="-1" aria-selected="false" data-testid="predictive-search-all">View all</a>
</div>
<template data-predictive-template="product"><a href="/search" role="option" tabindex="-1" aria-selected="false" data-testid="predictive-search-option"><img alt="" width="64" height="64" data-predictive-image><span data-predictive-title></span><span data-predictive-price></span></a></template>
<template data-predictive-template="link"><a href="/search" role="option" tabindex="-1" aria-selected="false" data-testid="predictive-search-option"><span data-predictive-title></span></a></template>
</predictive-search></dialog></modal-dialog>`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>ES1-T496</title></head><body>
<header>${layer ? `<a href="/search" data-search-src="/assets/predictive-search.js">Search</a>${dialog}` : ''}</header>
<main><h1>Page Not Found</h1>
<form action="/search" method="get" role="search" data-testid="not-found-search" data-search-handoff="/assets/predictive-search.js?v=1">
<label for="NotFoundSearchInput">Search the store</label>
<input id="NotFoundSearchInput" type="search" name="q" autocomplete="off" data-testid="not-found-search-input">
<button type="submit" data-testid="not-found-search-submit">Search</button>
</form>
<script src="/assets/search-handoff.js" type="module"></script></main>
${modal ? '<script src="/assets/modal-dialog.js" type="module"></script>' : ''}
</body></html>`;
}

async function openFake(page: Page, options?: { layer?: boolean; modal?: boolean }) {
  const hits = { suggest: [] as string[], predictive: 0 };
  await page.route(`${ORIGIN}/**`, (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.startsWith('/assets/')) {
      const file = url.pathname.slice('/assets/'.length);
      // ES1-T378: predictive-search.js import() predictive-search-results.js theo data-results-src (ES1-T485) để vẽ nhóm
      if (!['search-handoff.js', 'modal-dialog.js', 'predictive-search.js', 'predictive-search-results.js'].includes(file)) return route.fulfill({ status: 404, body: '' });
      if (file === 'predictive-search.js') hits.predictive++;
      return route.fulfill({ body: read(`assets/${file}`), contentType: 'text/javascript' });
    }
    if (url.pathname === '/search/suggest.json') {
      hits.suggest.push(url.searchParams.get('q') ?? '');
      return route.fulfill({ json: SUGGEST });
    }
    if (url.pathname === '/search') return route.fulfill({ body: '<!doctype html><title>Search</title><h1>Search</h1>', contentType: 'text/html' });
    return route.fulfill({ body: fakeHtml(options), contentType: 'text/html; charset=utf-8' });
  });
  await page.goto(`${ORIGIN}/pages/khong-co`);
  if (options?.modal !== false && options?.layer !== false) await page.waitForFunction(() => !!customElements.get('modal-dialog'));
  return hits;
}

test.describe('ES1-T496 trang giả', () => {
  test.beforeEach(({}, ti) => desktopOnly(ti.project.name));

  test('TC-01 tải trang: ô 404 không focus, lớp đóng, chưa tải predictive-search.js', async ({ page }) => {
    const errors = watchConsole(page);
    const hits = await openFake(page);
    await expect(page.getByTestId('not-found-search-input')).not.toBeFocused();
    await expect(page.locator('dialog[open]')).toHaveCount(0);
    expect(hits.predictive).toBe(0);
    expect(errors).toEqual([]);
  });

  test('TC-02 gõ 1 ký tự: không mở lớp; ký tự 2: chép giá trị, mở lớp, gợi ý predictive, focus cuối chữ trong ô header', async ({ page }) => {
    const errors = watchConsole(page);
    const hits = await openFake(page);
    const input = page.getByTestId('not-found-search-input');
    await input.focus();
    await page.keyboard.type('d');
    await page.waitForTimeout(400);
    await expect(page.locator('dialog[open]')).toHaveCount(0);
    expect(hits.predictive).toBe(0);
    await page.keyboard.type('u');
    const field = page.getByTestId('predictive-search-input');
    await expect(page.getByTestId('predictive-search-dialog')).toHaveAttribute('open', '');
    await expect(field).toBeFocused();
    await expect(field).toHaveValue('du');
    expect(await field.evaluate((el: HTMLInputElement) => [el.selectionStart, el.selectionEnd])).toEqual([2, 2]);
    await expect(page.getByTestId('predictive-search-listbox')).toBeVisible();
    await expect(page.getByTestId('predictive-search-option')).toHaveText(/Dumbbell 10 kg/);
    expect(hits.suggest).toContain('du');
    expect(hits.predictive).toBe(1);
    // gõ tiếp trong ô header: predictive-search.js nhận như TE-8 AC1
    await page.keyboard.type('m');
    await expect.poll(() => hits.suggest).toContain('dum');
    expect(errors).toEqual([]);
  });

  test('TC-03 khoảng trắng không tính: " d " không mở lớp', async ({ page }) => {
    await openFake(page);
    await page.getByTestId('not-found-search-input').fill(' d ');
    await page.waitForTimeout(400);
    await expect(page.locator('dialog[open]')).toHaveCount(0);
  });

  test('TC-04 Esc 1 đóng gợi ý, Esc 2 đóng lớp, focus về ô 404; gõ lại mở lớp lần nữa', async ({ page }) => {
    const errors = watchConsole(page);
    const hits = await openFake(page);
    const input = page.getByTestId('not-found-search-input');
    await input.pressSequentially('du', { delay: 50 });
    await expect(page.getByTestId('predictive-search-listbox')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('predictive-search-listbox')).toBeHidden();
    await page.keyboard.press('Escape');
    await expect(page.locator('dialog[open]')).toHaveCount(0);
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('du');
    await page.keyboard.type('b');
    await expect(page.getByTestId('predictive-search-dialog')).toHaveAttribute('open', '');
    await expect(page.getByTestId('predictive-search-input')).toHaveValue('dub');
    await expect.poll(() => hits.suggest).toContain('dub');
    expect(hits.predictive, 'module tải 1 lần').toBe(1);
    expect(errors).toEqual([]);
  });

  test('TC-05 IME: input đang soạn (isComposing) không mở; compositionend mở', async ({ page }) => {
    await openFake(page);
    const input = page.getByTestId('not-found-search-input');
    await input.evaluate((el: HTMLInputElement) => {
      el.value = 'đu';
      el.dispatchEvent(new InputEvent('input', { bubbles: true, isComposing: true }));
    });
    await page.waitForTimeout(200);
    await expect(page.locator('dialog[open]')).toHaveCount(0);
    await input.evaluate((el) => el.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: 'đu' })));
    await expect(page.getByTestId('predictive-search-dialog')).toHaveAttribute('open', '');
    await expect(page.getByTestId('predictive-search-input')).toHaveValue('đu');
  });

  test('TC-06 không có lớp search header: gõ không lỗi, Enter GET /search?q=', async ({ page }) => {
    const errors = watchConsole(page);
    const hits = await openFake(page, { layer: false });
    const input = page.getByTestId('not-found-search-input');
    await input.pressSequentially('du', { delay: 50 });
    expect(hits.predictive).toBe(0);
    await Promise.all([page.waitForURL(/\/search\?q=du$/), input.press('Enter')]);
    expect(errors).toEqual([]);
  });

  test('TC-07 modal-dialog.js chưa định nghĩa: không mở, không lỗi, Enter GET /search?q=', async ({ page }) => {
    const errors = watchConsole(page);
    const hits = await openFake(page, { modal: false });
    const input = page.getByTestId('not-found-search-input');
    await input.pressSequentially('du', { delay: 50 });
    await expect(page.locator('dialog[open]')).toHaveCount(0);
    expect(hits.predictive).toBe(0);
    await Promise.all([page.waitForURL(/\/search\?q=du$/), input.press('Enter')]);
    expect(errors).toEqual([]);
  });

  test('TC-08 input khác (không name="q" hoặc form không data-search-handoff): không mở', async ({ page }) => {
    await openFake(page);
    await page.evaluate(() => {
      const f = document.createElement('form');
      f.innerHTML = '<input name="q" data-testid="other-q"><input name="email" data-testid="other-email">';
      document.body.append(f);
      const g = document.querySelector('[data-testid="not-found-search"]')!;
      g.insertAdjacentHTML('beforeend', '<input name="note" data-testid="handoff-other">');
    });
    for (const id of ['other-q', 'other-email', 'handoff-other']) await page.getByTestId(id).fill('dumbbell');
    await page.waitForTimeout(300);
    await expect(page.locator('dialog[open]')).toHaveCount(0);
  });
});

// ---------- Storefront (PREVIEW_URL) ----------
test.describe('ES1-T496 storefront 404', () => {
  test.beforeEach(({}, ti) => desktopOnly(ti.project.name));

  test('TC-09 1280: gõ "du" → /search/suggest, listbox hiện; Esc ×2 → focus về ô 404; 0 lỗi console', async ({ page }) => {
    const errors = watchConsole(page);
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoStore(page, MISSING);
    const input = page.getByTestId('not-found-search-input');
    test.skip((await input.count()) === 0, 'Show search tắt ở block not-found');
    test.skip((await page.locator('modal-dialog[data-layer="search"]').count()) === 0, 'header không có lớp search');
    await expect(page.getByTestId('not-found-search')).toHaveAttribute('data-search-handoff', /predictive-search\.js\?v=/);
    await expect(input).not.toBeFocused();
    await page.waitForFunction(() => !!customElements.get('modal-dialog'));
    const suggest = page.waitForRequest(/\/search\/suggest/, { timeout: 5_000 });
    await input.pressSequentially('du', { delay: 50 });
    await suggest;
    await expect(page.getByTestId('predictive-search-dialog')).toHaveAttribute('open', '');
    await expect(page.getByTestId('predictive-search-input')).toHaveValue('du');
    await expect(page.getByTestId('predictive-search-listbox')).toBeVisible();
    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');
    await expect(page.locator('modal-dialog[data-layer="search"] > dialog[open]')).toHaveCount(0);
    await expect(input).toBeFocused();
    expect(errors).toEqual([]);
  });
});
