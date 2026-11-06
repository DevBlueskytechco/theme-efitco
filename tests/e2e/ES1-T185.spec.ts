// KHÔNG CHẮC: spec chưa chạy, chưa type-check (phiên viết không có trình duyệt và preview; CTO 06/11: e2e tắt tới khi trang chủ xong).
// Ticket ES1-T185 TE-15-BE1: assets/scroll-buttons.js qua lazy-module (docs/srs.md AC-H8, AC-H9 phần JS; plan ES1-T169 D6).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T185.spec.ts tests/e2e/ES1-T184.spec.ts
// Dùng /?view=te15 (collection all, không cần dữ liệu nhập). Nút chỉ hiện từ 48rem nên test bấm đặt viewport 1024 ở cả desktop và Pixel 7:
// 1024 còn đủ chỗ cuộn nhiều card; 1920 chỉ cuộn được dưới 1 card vì khung cuộn chặn ở cuối.
import { readFileSync, statSync } from 'node:fs';
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { watchShopPay403 } from './support/console-guard';

const TE15 = '/?view=te15';
const JS_FILE = 'assets/scroll-buttons.js';
const LIQUID_FILE = 'blocks/collection-list.liquid';
const MODULE = /\/scroll-buttons\.js/;
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];

const band = (page: Page, id: string) => page.getByTestId(`container-${id}`);
const five = (page: Page) => band(page, 'te15-five');
const root = (page: Page) => five(page).locator('scroll-buttons');
const track = (page: Page) => five(page).getByTestId('collection-list-track');
const prev = (page: Page) => five(page).getByTestId('collection-list-prev');
const next = (page: Page) => five(page).getByTestId('collection-list-next');
const scrollLeft = (page: Page) => track(page).evaluate((el) => el.scrollLeft);
const maxScroll = (page: Page) => track(page).evaluate((el) => el.scrollWidth - el.clientWidth);

/** Độ dài 1 card: rộng card đầu cộng gap, đo độc lập với JS của theme. */
const cardStep = (page: Page) =>
  track(page).evaluate((el) => el.children[0].getBoundingClientRect().width + parseFloat(getComputedStyle(el).columnGap));

function watchConsole(page: Page) {
  const errors: string[] = [];
  const isShopPay403 = watchShopPay403(page);
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    if (isShopPay403(msg)) return;
    if (IGNORE_CONSOLE.some((r) => r.test(msg.text()) || r.test(msg.location().url))) return;
    errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

async function open(page: Page, width = 1024) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(TE15);
  await expect(root(page)).toHaveAttribute('data-enhanced', '');
}

const expectScrolled = (page: Page, value: number) => expect.poll(() => scrollLeft(page)).toBeCloseTo(value, 0);

/** Đẩy mọi danh sách xuống xa viewport, không cần thêm template kiểm thử. */
async function pushListsFarBelow(page: Page) {
  await page.route(/view=te15/, async (route) => {
    if (route.request().resourceType() !== 'document') return route.fallback();
    const response = await route.fetch();
    const body = (await response.text()).replace('</head>', '<style>[data-testid="collection-list"]{margin-block-start:400vh}</style></head>');
    await route.fulfill({ response, body });
  });
}

test.describe('ES1-T185 tĩnh', () => {
  test('trần 768 B, không fetch, hook khớp giữa Liquid và JS', () => {
    expect(statSync(JS_FILE).size).toBeLessThanOrEqual(768);
    const js = readFileSync(JS_FILE, 'utf8');
    expect(js).not.toMatch(/fetch|partials|console\./);
    const liquid = readFileSync(LIQUID_FILE, 'utf8');
    expect(js).toContain('"scroll-buttons"');
    expect(liquid).toContain('<scroll-buttons');
    expect(js).toContain('[data-scroll-${h}]');
    for (const hook of ['track', 'prev', 'next']) {
      expect(js).toContain(`"${hook}"`);
      expect(liquid).toContain(`data-scroll-${hook}`);
    }
    expect(liquid).toContain(`data-lazy-module="{{ 'scroll-buttons.js' | asset_url }}"`);
  });

  test('block chỉ thêm 1 thẻ script là lazy-module', () => {
    expect(readFileSync(LIQUID_FILE, 'utf8').match(/<script[^>]*>/g)).toEqual([`<script src="{{ 'lazy-module.js' | asset_url }}" type="module">`]);
  });
});

test.describe('ES1-T185 nạp qua lazy-module', () => {
  test('không tải file khi block còn xa viewport, tới gần mới tải rồi đặt data-enhanced', async ({ page }) => {
    const loaded: string[] = [];
    page.on('request', (request) => {
      if (MODULE.test(request.url())) loaded.push(request.url());
    });
    await pushListsFarBelow(page);
    await page.goto(TE15);
    await page.waitForLoadState('load');
    await expect.poll(() => page.evaluate(() => performance.getEntriesByType('resource').some((e) => e.name.includes('lazy-module.js')))).toBe(true);
    expect(loaded).toEqual([]);
    await expect(root(page)).not.toHaveAttribute('data-enhanced', '');

    await root(page).scrollIntoViewIfNeeded();
    await expect.poll(() => loaded.length).toBeGreaterThan(0);
    await expect(root(page)).toHaveAttribute('data-enhanced', '');
  });

  test('2 danh sách trên 1 trang: file chỉ tải 1 lần, cả 2 đều nâng cấp', async ({ page }) => {
    const loaded: string[] = [];
    page.on('request', (request) => {
      if (MODULE.test(request.url())) loaded.push(request.url());
    });
    await open(page);
    await expect(band(page, 'te15-one').locator('scroll-buttons')).toHaveAttribute('data-enhanced', '');
    expect(loaded).toHaveLength(1);
  });

  test('không dịch chuyển bố cục khi module nâng cấp', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 900 });
    let release = () => {};
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route(MODULE, async (route) => {
      await held;
      await route.continue();
    });
    await page.goto(TE15);
    await expect(root(page)).not.toHaveAttribute('data-enhanced', '');
    const before = await track(page).boundingBox();
    release();
    await expect(root(page)).toHaveAttribute('data-enhanced', '');
    const after = await track(page).boundingBox();
    expect(after!.y).toBe(before!.y);
    expect(after!.height).toBe(before!.height);
  });
});

test.describe('ES1-T185 next, back', () => {
  test('bấm next, back cuộn đúng 1 card', async ({ page }) => {
    await open(page);
    const step = await cardStep(page);
    expect(await maxScroll(page)).toBeGreaterThan(step * 2);

    await next(page).click();
    await expectScrolled(page, step);
    await next(page).click();
    await expectScrolled(page, step * 2);
    await prev(page).click();
    await expectScrolled(page, step);
    await prev(page).click();
    await expectScrolled(page, 0);
  });

  test('smooth bình thường, reduced-motion thì không smooth', async ({ page }) => {
    await page.addInitScript(() => {
      const calls: (ScrollBehavior | undefined)[] = [];
      (window as unknown as { __scrollCalls: typeof calls }).__scrollCalls = calls;
      const original = Element.prototype.scrollBy as (options: ScrollToOptions) => void;
      Element.prototype.scrollBy = function (this: Element, options: ScrollToOptions) {
        calls.push(options.behavior);
        original.call(this, options);
      } as typeof Element.prototype.scrollBy;
    });
    const lastCall = () => page.evaluate(() => (window as unknown as { __scrollCalls: (ScrollBehavior | undefined)[] }).__scrollCalls.at(-1));

    await open(page);
    await next(page).click();
    expect(await lastCall()).toBe('smooth');

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await next(page).click();
    expect(await lastCall()).not.toBe('smooth');
  });
});

test.describe('ES1-T185 ẩn nút', () => {
  test('ở đầu ẩn back, giữa hiện cả 2, ở cuối ẩn next', async ({ page }) => {
    await open(page);
    await expect(prev(page)).toBeHidden();
    await expect(next(page)).toBeVisible();

    await next(page).click();
    await expect(prev(page)).toBeVisible();
    await expect(next(page)).toBeVisible();

    await track(page).evaluate((el) => el.scrollTo({ left: el.scrollWidth }));
    await expect(next(page)).toBeHidden();
    await expect(prev(page)).toBeVisible();
    await expect.poll(async () => Math.abs((await maxScroll(page)) - (await scrollLeft(page)))).toBeLessThanOrEqual(1);
  });

  test('không tràn: 1 card ẩn cả 2 nút, vẫn đặt data-enhanced', async ({ page }) => {
    await open(page);
    const one = band(page, 'te15-one');
    await expect(one.locator('scroll-buttons')).toHaveAttribute('data-enhanced', '');
    await expect(one.getByTestId('collection-list-prev')).toBeHidden();
    await expect(one.getByTestId('collection-list-next')).toBeHidden();
  });

  test('đổi cỡ màn hình tính lại: đang ở cuối, thu hẹp thì next hiện lại', async ({ page }) => {
    await open(page, 1920);
    await track(page).evaluate((el) => el.scrollTo({ left: el.scrollWidth }));
    await expect(next(page)).toBeHidden();
    await page.setViewportSize({ width: 1024, height: 900 });
    await expect(next(page)).toBeVisible();
  });

  test('360: nút không hiện dù đã nâng cấp, vẫn cuộn được', async ({ page }) => {
    await open(page, 360);
    await expect(prev(page)).toBeHidden();
    await expect(next(page)).toBeHidden();
    // Quá nửa card: dưới nửa card thì scroll-snap mandatory kéo về 0.
    await track(page).evaluate((el) => el.scrollBy({ left: el.children[0].clientWidth }));
    await expect.poll(() => scrollLeft(page)).toBeGreaterThan(0);
  });
});

test.describe('ES1-T185 bàn phím', () => {
  test('Enter, Space bấm được nút', async ({ page }) => {
    await open(page);
    const step = await cardStep(page);
    await next(page).focus();
    await page.keyboard.press('Enter');
    await expectScrolled(page, step);
    await next(page).focus();
    await page.keyboard.press('Space');
    await expectScrolled(page, step * 2);
  });

  test('nút đang focus bị ẩn thì focus sang nút còn lại, không rơi về body', async ({ page }) => {
    await open(page);
    const step = await cardStep(page);

    await next(page).click();
    await expectScrolled(page, step);
    await prev(page).focus();
    await page.keyboard.press('Enter');
    await expect(prev(page)).toBeHidden();
    await expect(next(page)).toBeFocused();

    // Bấm bằng phím tới cuối: lần cuối nút next tự ẩn khi đang giữ focus. scroll-snap mandatory nên không nhảy thẳng tới sát cuối được.
    const max = await maxScroll(page);
    const presses = Math.ceil(max / step);
    for (let i = 1; i <= presses; i += 1) {
      await next(page).focus();
      await page.keyboard.press('Enter');
      await expectScrolled(page, Math.min(step * i, max));
    }
    await expect(next(page)).toBeHidden();
    await expect(prev(page)).toBeFocused();
  });
});

test.describe('ES1-T185 thiếu file JS', () => {
  test('chặn file: không data-enhanced, nút ẩn, vẫn cuộn tay được', async ({ page }) => {
    await page.route(MODULE, (route) => route.abort());
    await page.setViewportSize({ width: 1024, height: 900 });
    await page.goto(TE15);
    await page.waitForLoadState('load');
    await expect(root(page)).not.toHaveAttribute('data-enhanced', '');
    await expect(prev(page)).toBeHidden();
    await expect(next(page)).toBeHidden();

    // Khung cuộn vẫn nhận cuộn. Không dùng phím mũi tên: bước 40px kết hợp snap mandatory tuỳ trình duyệt, chưa đo.
    await track(page).evaluate((el) => el.scrollBy({ left: el.children[0].clientWidth }));
    await expect.poll(() => scrollLeft(page)).toBeGreaterThan(0);
  });
});

test.describe('ES1-T185 vòng đời', () => {
  test('gỡ khỏi DOM thì ngắt ResizeObserver; gắn lại vẫn chạy, không cuộn 2 lần', async ({ page }) => {
    await page.addInitScript(() => {
      const state = { active: 0 };
      (window as unknown as { __ro: typeof state }).__ro = state;
      const { observe, disconnect } = ResizeObserver.prototype;
      ResizeObserver.prototype.observe = function (this: ResizeObserver, target: Element, options?: ResizeObserverOptions) {
        if ((target as HTMLElement).dataset?.scrollTrack !== undefined) state.active += 1;
        observe.call(this, target, options);
      };
      ResizeObserver.prototype.disconnect = function (this: ResizeObserver) {
        state.active -= 1;
        disconnect.call(this);
      };
    });
    const active = () => page.evaluate(() => (window as unknown as { __ro: { active: number } }).__ro.active);

    await open(page);
    const before = await active();
    const step = await cardStep(page);

    await root(page).evaluate((el) => {
      const parent = el.parentElement!;
      el.remove();
      (window as unknown as { __parent: Element; __list: Element }).__parent = parent;
      (window as unknown as { __list: Element }).__list = el;
    });
    expect(await active()).toBe(before - 1);

    await page.evaluate(() => {
      const w = window as unknown as { __parent: Element; __list: Element };
      w.__parent.append(w.__list);
    });
    await expect.poll(active).toBe(before);
    await next(page).click();
    await expectScrolled(page, step);
  });
});

test.describe('ES1-T185 chất lượng', () => {
  test('0 console error, 0 pageerror, axe 0 serious sau khi bấm', async ({ page }) => {
    const errors = watchConsole(page);
    await open(page);
    await next(page).click();
    await expect(prev(page)).toBeVisible();
    const { violations } = await new AxeBuilder({ page }).analyze();
    const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious.map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
    expect(errors).toEqual([]);
  });
});
