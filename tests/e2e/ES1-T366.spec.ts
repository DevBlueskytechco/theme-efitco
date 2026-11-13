// ES1-T366 (TE-6-R2-FE3): cột lọc + drawer lọc collection, nhóm lọc (docs/srs.md#TE-6 AC2, AC4, AC9, AC10; docs/ui-spec/collection.md §5).
// Phần "tĩnh": đọc file + fixture page.setContent với assets/base.css thật và token mặc định (space_base 4), không gọi store.
// Phần "store": cần collection có filter Search and Discovery (TE6_COLLECTION_HANDLE, fallback /collections/all); thiếu filter thì skip, không tính là đạt.
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T366.spec.ts
import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { expectNotChallenged } from './support/store-guard';
import { env } from './support/store-data';

const BASE = readFileSync('assets/base.css', 'utf8');
const CRITICAL = readFileSync('assets/critical.css', 'utf8');
const BLOCK = readFileSync('blocks/collection-filters.liquid', 'utf8');
const GROUP = readFileSync('snippets/filter-group.liquid', 'utf8');
const OPTION = readFileSync('snippets/filter-option.liquid', 'utf8');
const LOCALE = JSON.parse(readFileSync('locales/en.default.json', 'utf8'));

const START = '/** Lọc collection (TE-6 AC9, AC10';
const END = '/** Pagination (snippets/pagination.liquid';
const section = () => {
  const from = BASE.indexOf(START);
  return BASE.slice(from, BASE.indexOf(END, from));
};

// Token mặc định (settings_schema.json); css-variables.liquid là nguồn thật trên store.
const TOKENS = `:root{--space-1:4px;--space-2:8px;--space-3:12px;--space-4:16px;--space-5:24px;--space-6:32px;--space-7:48px;--space-8:120px;
--touch-target-min:24px;--page-margin:20px;--page-width:91rem;--header-height:80px;--radius-input:8px;--radius-button:8px;--radius-card:12px;--radius-pill:999px;
--color-background:#fff;--color-foreground:#1a1a1a;--color-muted:#6b6b6b;--color-muted-light:#808080;--color-border:#e5e5e5;--color-background-cream:#f5f5f1;
--color-background-alt:#f4f4f5;--color-background-alt-foreground:#1a1a1a;--color-background-dark:#1a1a1a;--color-background-dark-foreground:#fff;
--color-background-panel:#393942;--color-accent:#c8400e;--color-accent-foreground:#fff;--color-sale:#c8102e;--color-badge-new:#467a48;
--font-size-xs:.8125rem;--font-size-sm:.875rem;--font-size-base:1rem;--font-size-h3:1.5rem;--font-size-h2:2rem;--line-height-body:1.5;--line-height-heading:1.1;
--font-heading--family:serif;--font-heading--weight-display:800;--font-primary--family:sans-serif;
--motion-fast:150ms;--motion-base:250ms;--motion-slow:500ms;--motion-hero:1400ms;--ease-out:ease-out}`;

const option = (label: string, count: number, extra = '') =>
  `<li><label class="filter-option" data-testid="collection-filter-option"><input class="filter-option__input" type="checkbox" name="filter.p.vendor" value="${label}" ${extra} data-testid="collection-filter-input"><span class="filter-option__label">${label}</span><span class="filter-option__count">${count}</span></label></li>`;
const swatch = (label: string, extra = '') =>
  `<li><label class="filter-option" data-testid="collection-filter-option"><span class="filter-option__control"><input class="filter-option__input" type="checkbox" name="filter.v.option.color" value="${label}" ${extra} data-testid="collection-filter-input"><span class="filter-option__swatch" data-testid="collection-filter-swatch" style="--swatch-color: #1a1a1a;"></span></span><span class="filter-option__label">${label}</span><span class="filter-option__count">3</span></label></li>`;
const chevron = '<svg aria-hidden="true" class="site-header__svg-chevron" width="9" height="5" viewBox="0 0 9 5"><path d="M0 0h9L4.5 5z"/></svg>';

// Bản rút gọn đúng cấu trúc HTML mà blocks/collection-filters.liquid + filter-group + filter-option xuất ra.
const FIXTURE = (enhanced: boolean, clear: boolean) => `
<collection-filters class="collection-layout" ${enhanced ? 'data-enhanced' : ''}>
<div class="collection-filters" data-testid="collection-filters">
<modal-dialog data-layer="filter">
<dialog class="drawer collection-filters__drawer" id="collection-filter-drawer" popover aria-labelledby="collection-filter-title" data-testid="collection-filter-drawer">
  <div class="drawer__header collection-filters__header" data-testid="fx-header">
    <h2 class="drawer__title collection-filters__title" id="collection-filter-title">Filters</h2>
    <button class="close-button collection-filters__close" type="button" popovertarget="collection-filter-drawer" popovertargetaction="hide" aria-label="Close filters" data-testid="collection-filter-close"><svg viewBox="0 0 20 20"></svg></button>
  </div>
  <form class="collection-filters__form" id="collection-filter-form" method="get" action="#" novalidate data-testid="collection-filter-form">
    <div class="collection-filters__panel">
      <div class="drawer__body collection-filters__body" data-testid="fx-body">
        <p class="collection-filters__status" role="status" data-testid="collection-filter-status">1 filter applied · 10 products</p>
        <div class="collection-filters__groups">
          <details class="filter-group" open data-filter-param="filter.v.option.color" data-testid="collection-filter-group">
            <summary class="filter-group__summary" data-testid="fx-summary"><span class="filter-group__label">Color</span><span class="filter-group__selected" data-testid="collection-filter-selected">1 selected</span>${chevron}</summary>
            <div class="filter-group__body">
              <ul class="filter-group__options" role="list">${swatch('Black', 'checked')}${swatch('Green')}${swatch('Gray')}${swatch('Beige')}${swatch('White')}${swatch('Gold', 'disabled')}</ul>
              <details class="filter-group__more">
                <summary class="filter-group__more-toggle" data-testid="collection-filter-more"><span class="filter-group__more-show">Show 4 more</span><span class="filter-group__more-hide">Show less</span><span class="visually-hidden">Color options</span></summary>
                <ul class="filter-group__options" role="list">${swatch('Red')}${swatch('Blue')}${swatch('Pink')}${swatch('Navy')}</ul>
              </details>
            </div>
          </details>
          <details class="filter-group" open data-filter-param="filter.v.price" data-testid="collection-filter-group">
            <summary class="filter-group__summary"><span class="filter-group__label">Price</span>${chevron}</summary>
            <div class="filter-group__body"><div class="filter-group__price">
              <div class="filter-group__price-field"><label class="filter-group__price-label" for="filter-v-price-min">Min price</label><div class="filter-group__money" data-testid="fx-money"><span class="filter-group__currency" aria-hidden="true">$</span><input class="filter-group__price-input" id="filter-v-price-min" type="number" name="filter.v.price.gte" min="0" max="1000" step="any" placeholder="0" aria-describedby="filter-v-price-hint" data-testid="collection-filter-price-min"></div></div>
              <div class="filter-group__price-field"><label class="filter-group__price-label" for="filter-v-price-max">Max price</label><div class="filter-group__money"><span class="filter-group__currency" aria-hidden="true">$</span><input class="filter-group__price-input" id="filter-v-price-max" type="number" name="filter.v.price.lte" min="0" max="1000" step="any" placeholder="1000" aria-describedby="filter-v-price-hint" data-testid="collection-filter-price-max"></div></div>
              <p class="filter-group__price-hint" id="filter-v-price-hint" data-testid="collection-filter-price-hint">Highest price is $1,000.00</p>
              <p class="filter-group__price-error" id="filter-v-price-error" hidden data-testid="collection-filter-price-error"><svg viewBox="0 0 24 24"></svg><span>Min price can't be higher than max price.</span></p>
            </div></div>
          </details>
          <details class="filter-group" open data-filter-param="filter.p.vendor" data-testid="collection-filter-group">
            <summary class="filter-group__summary"><span class="filter-group__label">Brand</span>${chevron}</summary>
            <div class="filter-group__body"><ul class="filter-group__options" role="list">${option('Efitco', 22, 'checked')}${option('Other', 0, 'disabled')}</ul></div>
          </details>
        </div>
      </div>
      <div class="drawer__footer collection-filters__footer" data-testid="fx-footer">
        ${clear ? '<a class="button button--secondary collection-filters__clear" href="#" data-testid="collection-filter-clear">Clear all</a>' : ''}
        <button class="button collection-filters__apply" type="submit" data-testid="collection-filter-apply">Show 10 products</button>
      </div>
    </div>
  </form>
</dialog>
</modal-dialog>
</div>
<div class="collection-products" data-testid="collection-products">Products</div>
</collection-filters>`;

const mount = async (page: Page, width: number, { enhanced = false, clear = true } = {}) => {
  await page.setViewportSize({ width, height: 900 });
  await page.setContent(`<!doctype html><html><head><style>${TOKENS}${CRITICAL}${BASE}</style></head><body>${FIXTURE(enhanced, clear)}</body></html>`);
};
const box = async (page: Page, id: string) => (await page.getByTestId(id).first().boundingBox())!;
// Mở popover rồi chờ transition trượt vào xong: boundingBox đo cả translate (bài học ES1-T313 TC-05).
const openDrawer = (page: Page) =>
  page.evaluate(async () => {
    const d = document.getElementById('collection-filter-drawer') as HTMLDialogElement;
    d.showPopover();
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    await Promise.allSettled(d.getAnimations({ subtree: true }).map((a) => a.finished));
  });

test.describe('ES1-T366 tĩnh', () => {
  test.beforeEach(({}, ti) => {
    test.skip(ti.project.name !== 'desktop', 'tĩnh, chạy 1 lần');
  });

  test('TC-01 mục CSS lọc: 0 màu literal, 0 thuộc tính vật lý, 0 z-index số, CSS cũ đã gỡ', () => {
    const css = section().replace(/\/\*[\s\S]*?\*\//g, '');
    expect(css.length).toBeGreaterThan(1000);
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(|:\s*(white|black)\b/i);
    expect(css).not.toMatch(/(^|[\s;{])(left|right|top|bottom|width|height|(margin|padding)-(left|right|top|bottom))\s*:/m);
    expect(css).not.toMatch(/z-index:\s*-?\d/);
    // Drawer lọc dùng .drawer chung: không còn khung riêng 28rem, nút Apply ẩn khi có JS ở mọi mốc
    expect(BASE).not.toContain('inline-size: 28rem');
    expect(BASE).not.toMatch(/\.collection-filters__drawer:popover-open/);
    expect(BASE).toContain('.drawer:is([open], :popover-open)');
  });

  test('TC-02 markup: lớp filter, drawer chung, partial gồm thân + chân, chuỗi qua | t', () => {
    expect(BLOCK).toContain('<modal-dialog data-layer="filter">');
    expect(BLOCK).toMatch(/class="drawer collection-filters__drawer"[\s\S]*?\bpopover\b/);
    expect(BLOCK).not.toContain('scroll-lock');
    const partial = BLOCK.slice(BLOCK.indexOf("{% partial 'collection-filters' %}"), BLOCK.indexOf('{% endpartial %}'));
    for (const id of ['collection-filter-status', 'collection-filter-clear', 'collection-filter-apply']) expect(partial).toContain(`data-testid="${id}"`);
    expect(partial).toContain("'blocks.collection_filters.show_results' | t: count: collection.products_count");
    expect(BLOCK).toContain("append: '?sort_by='");
    expect(GROUP).toContain('assign visible_limit = 6');
    expect(GROUP).toContain('class="filter-group__more"');
    expect(GROUP.match(/render 'filter-option'/g)).toHaveLength(2);
    expect(OPTION).toContain('value.count == 0 and value.active == false');
    const t = LOCALE.blocks.collection_filters;
    for (const k of ['selected', 'show_more', 'show_less', 'show_more_label', 'price_highest', 'status', 'show_results']) expect(t[k], k).toBeTruthy();
    expect(t.apply).toBeUndefined();
  });

  test('TC-03 360: drawer 90%, header 72, đóng 48, chân sát đáy 2 nút, nhóm 52, dòng 44, checkbox 20, swatch 24', async ({ page }) => {
    await mount(page, 360);
    await openDrawer(page);
    const drawer = await box(page, 'collection-filter-drawer');
    expect(drawer.width).toBe(324);
    expect(drawer.x).toBe(0);
    expect((await box(page, 'fx-header')).height).toBeGreaterThanOrEqual(72);
    expect(await box(page, 'collection-filter-close')).toMatchObject({ width: 48, height: 48 });
    const footer = await box(page, 'fx-footer');
    expect(Math.round(footer.y + footer.height)).toBe(900);
    const clear = await box(page, 'collection-filter-clear');
    const apply = await box(page, 'collection-filter-apply');
    expect(Math.round(clear.y)).toBe(Math.round(apply.y));
    expect(apply.width).toBeGreaterThan(clear.width);
    // Thân cuộn riêng, chân không trượt theo
    expect(await page.getByTestId('fx-body').evaluate((el) => getComputedStyle(el).overflowY)).toBe('auto');
    expect((await box(page, 'fx-summary')).height).toBe(52);
    expect((await box(page, 'collection-filter-option')).height).toBeGreaterThanOrEqual(44);
    expect(await box(page, 'collection-filter-swatch')).toMatchObject({ width: 24, height: 24 });
    const brandInput = page.locator('input[name="filter.p.vendor"]').first();
    expect(await brandInput.boundingBox()).toMatchObject({ width: 20, height: 20 });
    await expect(page.getByTestId('collection-filter-status')).toBeVisible();
  });

  test('TC-04 trạng thái giá trị: chọn đậm 600, đếm 0 gạch ngang + muted, swatch chọn có vòng accent', async ({ page }) => {
    await mount(page, 1280);
    const label = (v: string) => page.locator(`input[value="${v}"]`).locator('xpath=ancestor::label').locator('.filter-option__label');
    expect(await label('Efitco').evaluate((el) => getComputedStyle(el).fontWeight)).toBe('600');
    const disabled = await label('Other').evaluate((el) => ({ deco: getComputedStyle(el).textDecorationLine, color: getComputedStyle(el).color }));
    expect(disabled.deco).toContain('line-through');
    expect(disabled.color).toBe('rgb(107, 107, 107)');
    const ring = await page.getByTestId('collection-filter-swatch').first().evaluate((el) => getComputedStyle(el).boxShadow);
    expect(ring).toContain('rgb(200, 64, 14)');
  });

  test('TC-05 768: drawer 420', async ({ page }) => {
    await mount(page, 768);
    await openDrawer(page);
    expect((await box(page, 'collection-filter-drawer')).width).toBe(420);
  });

  test('TC-06 1280: cột trái tĩnh, không nút đóng, không dòng status; có JS thì ẩn nút submit, chân rỗng ẩn', async ({ page }) => {
    await mount(page, 1280);
    const drawer = page.getByTestId('collection-filter-drawer');
    await expect(drawer).toBeVisible();
    const style = await drawer.evaluate((el) => ({ pos: getComputedStyle(el).position, op: getComputedStyle(el).opacity, tr: getComputedStyle(el).translate }));
    expect(style).toMatchObject({ pos: 'static', op: '1' });
    expect(['none', '0px']).toContain(style.tr);
    await expect(page.getByTestId('collection-filter-close')).toBeHidden();
    await expect(page.getByTestId('collection-filter-status')).toBeHidden();
    await expect(page.getByTestId('collection-filter-apply')).toBeVisible();
    expect(await page.getByTestId('fx-header').evaluate((el) => getComputedStyle(el).borderBlockEndColor)).toBe('rgb(26, 26, 26)');

    await mount(page, 1280, { enhanced: true });
    await expect(page.getByTestId('collection-filter-apply')).toBeHidden();
    await expect(page.getByTestId('collection-filter-clear')).toBeVisible();

    await mount(page, 1280, { enhanced: true, clear: false });
    await expect(page.getByTestId('fx-footer')).toBeHidden();
  });

  test('TC-07 "Show N more" mở được không cần JS, đổi chữ "Show less", 4 giá trị hiện', async ({ page }) => {
    await mount(page, 1280);
    const more = page.getByTestId('collection-filter-more');
    await expect(more).toHaveText(/Show 4 more\s*Color options/, { useInnerText: true });
    expect((await more.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await expect(page.locator('input[value="Navy"]')).toBeHidden();
    await more.click();
    await expect(more.locator('.filter-group__more-hide')).toBeVisible();
    await expect(more.locator('.filter-group__more-show')).toBeHidden();
    await expect(page.locator('input[value="Navy"]')).toBeAttached();
    expect((await page.locator('input[value="Navy"]').locator('xpath=ancestor::label').boundingBox())!.height).toBeGreaterThanOrEqual(44);
  });

  test('TC-08 giá: label thật, tiền tố aria-hidden, gợi ý; aria-invalid → viền lỗi 2px, câu lỗi hiện', async ({ page }) => {
    await mount(page, 1280);
    const min = page.getByTestId('collection-filter-price-min');
    expect(await min.evaluate((el) => (el as HTMLInputElement).labels?.[0]?.textContent?.trim())).toBe('Min price');
    await expect(page.getByTestId('collection-filter-price-hint')).toBeVisible();
    await expect(page.getByTestId('collection-filter-price-error')).toBeHidden();
    expect(await page.getByTestId('fx-money').evaluate((el) => getComputedStyle(el).borderTopWidth)).toBe('1px');
    await page.evaluate(() => {
      const err = document.getElementById('filter-v-price-error')!;
      err.hidden = false;
      for (const i of document.querySelectorAll('.filter-group__price-input')) {
        i.setAttribute('aria-invalid', 'true');
        i.setAttribute('aria-describedby', 'filter-v-price-hint filter-v-price-error');
      }
    });
    const money = await page.getByTestId('fx-money').evaluate((el) => ({ w: getComputedStyle(el).borderTopWidth, c: getComputedStyle(el).borderTopColor }));
    expect(money).toEqual({ w: '2px', c: 'rgb(200, 16, 46)' });
    await expect(page.getByTestId('collection-filter-price-error')).toBeVisible();
  });
});

const ALL = '/collections/all';
const HANDLE = env('TE6_COLLECTION_HANDLE');
const MAIN = HANDLE ? `/collections/${encodeURIComponent(HANDLE)}` : ALL;
const NO_FILTERS = 'Trang không có filter (Search and Discovery, ES1-T105 #2): skip, không tính là đạt';
const hasFilters = async (page: Page) => (await page.getByTestId('collection-filter-group').count()) > 0;

test.describe('ES1-T366 store', () => {
  test('AC9 nhóm: summary 52, "N selected" khi có giá trị chọn, dòng status và "Show N products" đúng số', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(MAIN);
    await expectNotChallenged(page);
    test.skip(!(await hasFilters(page)), NO_FILTERS);
    const summary = page.locator('.filter-group__summary').first();
    expect(Math.round((await summary.boundingBox())!.height)).toBe(52);
    await expect(page.getByTestId('collection-filter-selected')).toHaveCount(0);

    const input = page.locator('[data-testid="collection-filter-input"]:not(:disabled)').first();
    const name = (await input.getAttribute('name'))!;
    const value = (await input.getAttribute('value'))!;
    const sort = await page.getByTestId('collection-sort').locator('option').nth(1).getAttribute('value');
    await page.goto(`${MAIN}?${encodeURIComponent(name)}=${encodeURIComponent(value)}&sort_by=${encodeURIComponent(sort!)}`);
    await expect(page.getByTestId('collection-filter-selected').first()).toHaveText(/^1 selected$/);
    const apply = page.getByTestId('collection-filter-apply');
    await expect(apply).toHaveText(/^Show \d+ products?$/);
    const status = page.getByTestId('collection-filter-status');
    await expect(status).toHaveAttribute('role', 'status');
    expect(await status.textContent()).toMatch(/^1 filter applied · \d+ products?$/);
    const n = Number((await apply.textContent())!.replace(/\D/g, ''));
    expect((await status.textContent())!.endsWith(`${n} ${n === 1 ? 'product' : 'products'}`)).toBe(true);
    const clear = page.getByTestId('collection-filter-clear');
    expect(await clear.getAttribute('href')).toContain(`sort_by=${encodeURIComponent(sort!)}`);
    expect(await clear.getAttribute('href')).not.toContain('filter.');
  });

  test('AC9 nhóm > 6 giá trị: 6 đầu + "Show N more" có tên nhóm ẩn', async ({ page }) => {
    await page.goto(MAIN);
    await expectNotChallenged(page);
    test.skip(!(await hasFilters(page)), NO_FILTERS);
    const more = page.getByTestId('collection-filter-more').first();
    test.skip((await more.count()) === 0, 'Không có nhóm > 6 giá trị trên store dev: skip, không tính là đạt');
    const group = page.getByTestId('collection-filter-group').filter({ has: more });
    const visible = group.locator(':scope > .filter-group__body > .filter-group__options > li');
    expect(await visible.count()).toBe(6);
    await expect(more).toHaveText(/Show \d+ more/);
    await expect(more.locator('.visually-hidden')).toHaveText(/ options$/);
  });

  test.describe('nojs', () => {
    test.use({ javaScriptEnabled: false });

    test('AC10 360: drawer popover, chân dính, "Show N products" là submit, Clear all có khi đã lọc', async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 800 });
      await page.goto(MAIN);
      await expectNotChallenged(page);
      test.skip(!(await hasFilters(page)), NO_FILTERS);
      await page.getByTestId('collection-filter-open').click();
      const drawer = page.getByTestId('collection-filter-drawer');
      await expect(drawer).toBeVisible();
      expect(Math.round((await drawer.boundingBox())!.width)).toBe(324);
      await expect(page.getByTestId('collection-filter-clear')).toHaveCount(0);
      const apply = page.getByTestId('collection-filter-apply');
      const applyBox = (await apply.boundingBox())!;
      expect(applyBox.y + applyBox.height).toBeLessThanOrEqual(800);
      expect(applyBox.y + applyBox.height).toBeGreaterThan(800 - 100);
      await expect(apply).toHaveAttribute('type', 'submit');

      await page.locator('[data-testid="collection-filter-input"]:not(:disabled)').first().check();
      await apply.click();
      await expect(page).toHaveURL(/filter\./);
      await page.getByTestId('collection-filter-open').click();
      await expect(page.getByTestId('collection-filter-clear')).toBeVisible();
    });
  });
});
