// KHÔNG CHẮC: spec chưa chạy trên preview (phiên BE không có trình duyệt, không gọi mạng); chờ CI.
// Ticket ES1-T340 TE-12-R2-BE1: assets/bundle-form.js, thanh dính bundle < 48rem.
// AC: docs/srs.md TE-12 AC1, AC3, AC6 (HB1), AC7 (HB2); docs/ui-spec/index-mobile-b.md §1.1; docs/ui-spec/layers.md §2.
// CTO 21/11 (ES1-T340): 0 món thì nút panel và nút thanh có disabled thật (có JS).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T340.spec.ts
// Trang ?view=te12: bundle đầu có bậc 2:10, 3:15; bundle thứ hai không bậc. Project mobile (Pixel 7, 412 px) < 48rem có thanh; desktop không.
import { test, expect, type Browser, type Locator, type Page } from './support/test';
import { readFileSync } from 'node:fs';
import { test as mockTest } from './support/cart-mock';
import { newStoreContext } from './support/store-noise';
import { gotoStore, watchStore } from './support/store-guard';

const TE12 = '/?view=te12';
const JS_FILE = 'assets/bundle-form.js';
const BAR_OFFSET = 72;

const bundle = (page: Page, container = 'container-te12-bundle') => page.getByTestId(container).getByTestId('bundle-builder');
const bar = (root: Locator) => root.getByTestId('bundle-sticky-bar');
const available = (root: Locator) => root.locator('[data-testid="bundle-builder-input"]:not([disabled])');
const bottomBar = (page: Page) => page.evaluate(() => document.documentElement.dataset.bottomBar ?? null);

// Thanh hiện thật: CSS bật visibility theo html[data-bottom-bar="bundle"] (bundle-builder.css)
const barShown = (root: Locator) => bar(root).evaluate((el) => !el.hidden && !el.inert && getComputedStyle(el).visibility === 'visible');

async function ready(root: Locator) {
  await root.scrollIntoViewIfNeeded();
  await expect(root).toHaveAttribute('data-enhanced', '');
}

// Tick bằng click() của DOM: không cuộn trang, không đổi trạng thái thanh
const tick = (input: Locator) => input.evaluate((el: HTMLInputElement) => el.click());

// Đỉnh lưới ở đầu màn: lưới trong màn, mép trên panel còn dưới đỉnh thanh (nếu lưới đủ cao)
async function toGrid(page: Page, root: Locator) {
  return root.evaluate(async (el, offset) => {
    const grid = el.querySelector('fieldset')!;
    const panel = el.querySelector('[role=group]')!;
    scrollTo({ top: scrollY + grid.getBoundingClientRect().top - 120, behavior: 'instant' });
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    return panel.getBoundingClientRect().top > innerHeight - offset;
  }, BAR_OFFSET);
}

async function toPanel(root: Locator) {
  await root.evaluate(async (el) => {
    const panel = el.querySelector('[role=group]')!;
    scrollTo({ top: scrollY + panel.getBoundingClientRect().top - 120, behavior: 'instant' });
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
}

test.describe('ES1-T340 tĩnh', () => {
  test.beforeEach(({}, info) => {
    test.skip(info.project.name !== 'desktop', 'tĩnh, chạy 1 lần');
  });

  const js = readFileSync(JS_FILE, 'utf8');
  const block = readFileSync('blocks/bundle-builder.liquid', 'utf8');

  test('trần 7168 B (ADR 0010, gồm thanh bundle), không import tĩnh, không console, không nghe scroll, guard define', () => {
    expect(Buffer.byteLength(js)).toBeLessThanOrEqual(7168);
    expect(js).not.toMatch(/^import /m);
    expect(js).not.toMatch(/console\.|innerHTML|"scroll"|'scroll'|style\.(display|top|bottom|transform)/);
    expect(js).toContain('IntersectionObserver');
    expect(js).toContain('customElements.get("bundle-form")');
  });

  test('hook thanh khớp markup FE (ES1-T339)', () => {
    for (const hook of ['bar', 'bar-count', 'bar-total', 'bar-submit', 'bar-error']) {
      expect(js).toContain(`("${hook}"`);
      expect(block).toContain(`data-bundle-${hook}`);
    }
    expect(block).toMatch(/data-bundle-bar\s[^>]*hidden/);
    expect(js).toContain('"[data-bundle-bar]"');
  });

  test('chỉ gắn data-bottom-bar="bundle", chỉ gỡ khi giá trị là bundle; đo --bundle-bar-height', () => {
    expect(js.match(/bottomBar = "([a-z]+)"/g)).toEqual(['bottomBar = "bundle"']);
    expect(js).toContain('html.dataset.bottomBar == "bundle") delete html.dataset.bottomBar');
    expect(js).toContain('--bundle-bar-height');
  });

  test('lazy-module: block giữ đúng 1 thẻ script, không nạp thẳng bundle-form.js', () => {
    expect(block.match(/<script\b/g)).toHaveLength(1);
    expect(block).toContain(`data-lazy-module="{{ 'bundle-form.js' | asset_url }}"`);
  });
});

test.describe('ES1-T340 nút 0 món (mọi project)', () => {
  test('AC6 AC8 0 món: nút panel và nút thanh disabled thật; chọn 1 thì bật; bỏ thì tắt lại', async ({ page }) => {
    const watch = watchStore(page);
    await gotoStore(page, TE12);
    const root = bundle(page);
    await ready(root);
    const inputs = await available(root).all();
    test.skip(inputs.length < 1, 'Collection cần ít nhất 1 sản phẩm còn hàng');
    const buttons = [root.getByTestId('bundle-builder-submit'), root.getByTestId('bundle-sticky-bar-add')];
    for (const b of buttons) await expect(b).toBeDisabled();
    await tick(inputs[0]);
    for (const b of buttons) await expect(b).toBeEnabled();
    await tick(inputs[0]);
    for (const b of buttons) await expect(b).toBeDisabled();
    await watch.finish();
  });
});

test.describe('ES1-T340 thanh dính', () => {
  let finish: () => Promise<void>;

  test.beforeEach(async ({ page }) => {
    finish = watchStore(page).finish;
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test.afterEach(async ({}, info) => {
    if (info.status !== 'skipped') await finish();
  });

  test('AC6 desktop ≥ 48rem: không có thanh, không gắn data-bottom-bar', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'chỉ desktop');
    await gotoStore(page, TE12);
    const root = bundle(page);
    await ready(root);
    await toGrid(page, root);
    await expect(bar(root)).toBeHidden();
    expect(await bottomBar(page)).toBeNull();
    expect(await page.evaluate(() => getComputedStyle(document.body).paddingBlockEnd)).toBe('0px');
  });

  test.describe('mobile < 48rem', () => {
    test.beforeEach(({}, info) => {
      test.skip(info.project.name !== 'mobile', 'thanh chỉ có dưới 48rem');
    });

    test('AC6 lúc tải và ở khối trên: thanh ẩn; lưới trong màn: hiện, html[data-bottom-bar=bundle], body chừa chỗ', async ({ page }) => {
      // te12 đặt bundle ngay dưới header: ở 412 × 839 lưới đã trong màn lúc tải nên thanh hiện đúng AC6 (CI PR #338).
      // Màn thấp 300 thì lưới còn dưới vạch đỉnh thanh: đúng trạng thái "lưới chưa vào màn".
      const size = page.viewportSize()!;
      await page.setViewportSize({ width: size.width, height: 300 });
      await gotoStore(page, TE12);
      const root = bundle(page);
      await expect(root).toHaveAttribute('data-enhanced', '');
      const gridBelow = await root.evaluate((el, offset) => el.querySelector('fieldset')!.getBoundingClientRect().top > innerHeight - offset, BAR_OFFSET);
      test.skip(!gridBelow, 'Lưới đã trong màn 300 lúc tải');
      expect(await bottomBar(page)).toBeNull();
      await expect(bar(root)).toBeHidden();
      await page.setViewportSize(size);
      await ready(root);
      test.skip(!(await toGrid(page, root)), 'Lưới thấp hơn màn: panel đã vào vùng trên thanh');
      await expect.poll(() => barShown(root)).toBe(true);
      expect(await bottomBar(page)).toBe('bundle');
      await expect(bar(root)).toHaveAttribute('aria-label', /.+/);
      expect(await bar(root).evaluate((el) => el.tagName)).toBe('ASIDE');
      const padding = await page.evaluate(() => parseFloat(getComputedStyle(document.body).paddingBlockEnd));
      expect(padding).toBeGreaterThan(0);
    });

    test('AC6 mép trên panel vào vùng trên thanh: thanh ẩn, inert; cuộn qua hết khối: ẩn; cuộn lại lưới: hiện', async ({ page }) => {
      await gotoStore(page, TE12);
      const root = bundle(page);
      await ready(root);
      test.skip(!(await toGrid(page, root)), 'Lưới thấp hơn màn');
      await expect.poll(() => barShown(root)).toBe(true);

      await toPanel(root);
      await expect.poll(() => barShown(root)).toBe(false);
      await expect(bar(root)).toHaveJSProperty('inert', true);
      // Bundle thứ hai của te12 nằm ngay dưới: lưới của nó vào màn thì thanh của nó hiện (tối đa 1 thanh), html giữ "bundle" (CI PR #338).
      const others = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('[data-bundle-bar]')].filter((b) => !b.hidden && !b.inert).length);
      expect(others, 'tối đa 1 thanh, không phải thanh của khối này').toBeLessThanOrEqual(1);
      expect(await bottomBar(page)).toBe(others ? 'bundle' : null);
      // Thanh không che panel: đỉnh panel nằm trên vùng thanh
      const top = await root.getByTestId('bundle-builder-panel').evaluate((el) => el.getBoundingClientRect().top);
      expect(top).toBeLessThan(await page.evaluate(() => innerHeight) - BAR_OFFSET);

      await root.evaluate((el) => scrollTo({ top: scrollY + el.getBoundingClientRect().bottom + 200, behavior: 'instant' }));
      await expect.poll(() => barShown(root)).toBe(false);

      await toGrid(page, root);
      await expect.poll(() => barShown(root)).toBe(true);
    });

    test('AC6 số món, tổng của thanh theo panel; 1 món dùng count_one; 0 món "0 …" và tổng 0', async ({ page }) => {
      await gotoStore(page, TE12);
      const root = bundle(page);
      await ready(root);
      const inputs = await available(root).all();
      test.skip(inputs.length < 3, 'Collection cần ít nhất 3 sản phẩm còn hàng');
      test.skip(!(await toGrid(page, root)), 'Lưới thấp hơn màn');
      await expect.poll(() => barShown(root)).toBe(true);
      const count = root.getByTestId('bundle-sticky-bar-count');
      const total = root.getByTestId('bundle-sticky-bar-total');
      const panelCount = root.getByTestId('bundle-builder-count');
      const panelTotal = root.getByTestId('bundle-builder-total');
      const same = async () => {
        await expect(count).toHaveText((await panelCount.textContent())!.trim());
        await expect(total).toHaveText((await panelTotal.textContent())!.trim());
      };
      await expect(count).toHaveText(/^0\s/);
      await expect(total).toHaveText(/0[.,]00/);
      await same();

      await tick(inputs[0]);
      await expect(count).toHaveText(/^1\s/);
      await same();
      for (const input of inputs.slice(1, 3)) await tick(input);
      await expect(count).toHaveText(/^3\s/);
      await same();
      expect(await barShown(root)).toBe(true);
    });

    test('AC6 focus trong thanh: giữ hiện khi panel vào màn, focus rời thì ẩn', async ({ page }) => {
      await gotoStore(page, TE12);
      const root = bundle(page);
      await ready(root);
      const inputs = await available(root).all();
      test.skip(inputs.length < 1, 'Collection cần ít nhất 1 sản phẩm còn hàng');
      test.skip(!(await toGrid(page, root)), 'Lưới thấp hơn màn');
      await tick(inputs[0]);
      await expect.poll(() => barShown(root)).toBe(true);
      const add = root.getByTestId('bundle-sticky-bar-add');
      await add.focus();
      await expect(add).toBeFocused();

      await toPanel(root);
      await page.evaluate(() => new Promise((r) => setTimeout(r, 300)));
      expect(await barShown(root)).toBe(true);
      await expect(add).toBeFocused();

      await root.getByTestId('bundle-builder-submit').focus();
      await expect.poll(() => barShown(root)).toBe(false);
    });

    test('AC7 HB2 --bundle-bar-height bằng chiều cao đo thật của thanh', async ({ page }) => {
      await gotoStore(page, TE12);
      const root = bundle(page);
      await ready(root);
      test.skip(!(await toGrid(page, root)), 'Lưới thấp hơn màn');
      await expect.poll(() => barShown(root)).toBe(true);
      const [measured, variable, bottom] = await bar(root).evaluate((el) => [
        el.offsetHeight,
        parseFloat(document.documentElement.style.getPropertyValue('--bundle-bar-height')),
        parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--bottom-bar-height')),
      ]);
      expect(variable).toBe(measured);
      expect(measured).toBeGreaterThanOrEqual(BAR_OFFSET);
      expect(Number.isNaN(bottom) ? measured : bottom).toBe(measured);
    });

    test('AC6 AC7 lớp modal mở: thanh ẩn dưới scrim (page-layers gắn data-layer-open), đóng thì hiện lại', async ({ page }) => {
      await gotoStore(page, TE12);
      const root = bundle(page);
      await ready(root);
      test.skip(!(await toGrid(page, root)), 'Lưới thấp hơn màn');
      await expect.poll(() => barShown(root)).toBe(true);
      // Dialog modal thật: page-layers.js (ES1-T314) đếm :modal
      await page.evaluate(() => {
        const dialog = document.createElement('dialog');
        dialog.id = 'es1-t340-layer';
        document.body.append(dialog);
        dialog.showModal();
      });
      await expect(page.locator('html')).toHaveAttribute('data-layer-open', '');
      await expect.poll(() => barShown(root)).toBe(false);
      await page.evaluate(() => {
        const dialog = document.getElementById('es1-t340-layer') as HTMLDialogElement;
        dialog.close();
        dialog.remove();
      });
      await expect.poll(() => barShown(root)).toBe(true);
    });

    test('2 bundle trên trang: mỗi lúc tối đa 1 thanh hiện', async ({ page }) => {
      await gotoStore(page, TE12);
      const first = bundle(page);
      const second = bundle(page, 'container-te12-bundle-no-tiers');
      await ready(second);
      const secondOk = await toGrid(page, second);
      await ready(first);
      test.skip(!secondOk || !(await toGrid(page, first)), 'Lưới thấp hơn màn');
      await expect.poll(() => barShown(first)).toBe(true);
      const visible = await page.locator('[data-bundle-bar]').evaluateAll((els) => els.filter((el) => getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility === 'visible').length);
      expect(visible).toBe(1);
    });
  });
});

mockTest.describe('ES1-T340 thêm giỏ từ thanh (mock)', () => {
  mockTest.beforeEach(async ({ page }, info) => {
    mockTest.skip(info.project.name !== 'mobile', 'thanh chỉ có dưới 48rem');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => {
      const log: Array<{ source?: string; opener?: string }> = [];
      (window as unknown as { __t340: typeof log }).__t340 = log;
      document.addEventListener('theme:cart:updated', (e) => {
        const { source, opener } = (e as CustomEvent).detail ?? {};
        log.push({ source, opener: opener?.dataset?.testid });
      });
    });
  });

  async function openBar(page: Page, goto: (path: string) => Promise<void>, picks = 2) {
    await goto(TE12);
    const root = bundle(page);
    await ready(root);
    const inputs = await available(root).all();
    mockTest.skip(inputs.length < picks, `Collection cần ít nhất ${picks} sản phẩm còn hàng`);
    mockTest.skip(!(await toGrid(page, root)), 'Lưới thấp hơn màn');
    const chosen = inputs.slice(0, picks);
    for (const input of chosen) await tick(input);
    await expect.poll(() => barShown(root)).toBe(true);
    const ids = await Promise.all(chosen.map(async (input) => Number(await input.getAttribute('value'))));
    return { root, ids, add: root.getByTestId('bundle-sticky-bar-add'), submit: root.getByTestId('bundle-builder-submit') };
  }

  mockTest('AC3 AC6 nút thanh: 1 POST items[] như nút panel; đang thêm 2 nút aria-busy + disabled; drawer mở, opener là nút thanh', async ({ page, cart }) => {
    const { ids, add, submit } = await openBar(page, (p) => cart.goto(p));
    mockTest.skip((await page.getByTestId('cart-drawer-dialog').count()) === 0, 'Preview đặt cart_type page');
    const release = cart.hold('add');
    await add.click();
    for (const b of [add, submit]) {
      await expect(b).toHaveAttribute('aria-busy', 'true');
      await expect(b).toBeDisabled();
    }
    release();
    await expect(page.getByTestId('cart-drawer-dialog')).toBeVisible();
    expect(cart.calls.add).toEqual([{ items: ids.map((id) => ({ id, quantity: 1 })) }]);
    const log = await page.evaluate(() => (window as unknown as { __t340: unknown[] }).__t340);
    expect(log).toEqual([{ source: 'bundle-form', opener: 'bundle-sticky-bar-add' }]);
    for (const b of [add, submit]) await expect(b).not.toHaveAttribute('aria-busy', /.*/);
  });

  mockTest('AC6 lỗi 422 khi thanh hiện: alert trong thanh, panel trống; thanh cao lên, --bundle-bar-height theo; đổi lựa chọn thì xoá', async ({ page, cart, guard }) => {
    guard.allowNetworkLog();
    const { root, add } = await openBar(page, (p) => cart.goto(p));
    const message = "The product 'ES1-T340 mock' is already sold out.";
    const before = await bar(root).evaluate((el) => el.offsetHeight);
    cart.respond('add', { status: 422, json: { status: 422, message: 'Cart Error', description: message }, times: 1 });
    await add.click();
    const barError = root.getByTestId('bundle-sticky-bar-error');
    await expect(barError).toHaveText(message);
    await expect(barError).toHaveAttribute('role', 'alert');
    await expect(root.getByTestId('bundle-builder-error')).toBeEmpty();
    await expect(page.getByTestId('cart-drawer-dialog')).toBeHidden();
    await expect(add).toBeEnabled();
    const [after, variable] = await bar(root).evaluate((el) => [el.offsetHeight, parseFloat(document.documentElement.style.getPropertyValue('--bundle-bar-height'))]);
    expect(after).toBeGreaterThan(before);
    expect(variable).toBe(after);

    await tick(available(root).first());
    await expect(barError).toBeEmpty();
    await expect(root.getByTestId('bundle-builder-error')).toBeEmpty();
  });

  mockTest('AC6 lỗi khi thanh ẩn (bấm nút panel): alert dưới panel, thanh trống', async ({ page, cart, guard }) => {
    guard.allowNetworkLog();
    const { root, submit } = await openBar(page, (p) => cart.goto(p));
    cart.respond('add', { status: 500, html: '<h1>Server error</h1>', times: 1 });
    await toPanel(root);
    await expect.poll(() => barShown(root)).toBe(false);
    await submit.click();
    await expect(root.getByTestId('bundle-builder-error')).toHaveText((await root.getAttribute('data-label-error'))!);
    await expect(root.getByTestId('bundle-sticky-bar-error')).toBeEmpty();
    expect(cart.calls.add).toHaveLength(1);
  });
});

test.describe('ES1-T340 không JS', () => {
  async function noJsPage(browser: Browser) {
    const use = test.info().project.use;
    const context = await newStoreContext(browser, {
      javaScriptEnabled: false,
      storageState: 'tests/setup/state.json',
      baseURL: use.baseURL,
      ...(use.viewport ? { viewport: use.viewport } : {}),
      ...(use.userAgent ? { userAgent: use.userAgent } : {}),
      ...(use.isMobile !== undefined ? { isMobile: use.isMobile, hasTouch: use.hasTouch } : {}),
    });
    return { context, page: await context.newPage() };
  }

  test('AC6 không JS: thanh không hiện ở mọi vị trí cuộn, nút panel vẫn là submit của form', async ({ browser }) => {
    const { context, page } = await noJsPage(browser);
    await page.goto(TE12);
    const root = bundle(page);
    await root.scrollIntoViewIfNeeded();
    await root.getByTestId('bundle-builder-list').scrollIntoViewIfNeeded();
    await expect(bar(root)).toBeHidden();
    expect(await bottomBar(page)).toBeNull();
    await expect(root.getByTestId('bundle-builder-submit')).toHaveAttribute('type', 'submit');
    await context.close();
  });
});
