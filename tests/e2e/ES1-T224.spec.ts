// KHÔNG CHẮC: test axe trên store chưa chạy trong phiên QA (store và api.github.com bị từ chối), chờ CI. Các test còn lại không cần store.
// Ticket ES1-T224 TE-17-QA5. Gồm 2 phần:
// - Axe cả trang / và /?view=figma: gộp từ T179, T180, T182, cùng DOM, bớt 4 lần tải trang mỗi project.
// - Kiểm các helper và điều kiện chờ của ticket trên trang giả với CSS thật, không gọi store.
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T224.spec.ts
import { readFileSync } from 'node:fs';
import { test, expect, type Page, type Response } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { visibleImagesLoaded } from './support/page-ready';
import { CLOUDFLARE_BLOCKED, expectNotChallenged, expectStoreAllowed, gotoStore, isStoreRefresh, watchStore } from './support/store-guard';

const ORIGIN = 'https://stub.test';
const read = (path: string) => readFileSync(path, 'utf8');
const css = (path: string) => read(`assets/${path}`);
const TOKENS = ':root{--page-width:91rem;--content-width:1400px;--page-margin:20px;--space-1:4px;--space-2:8px;--space-3:12px;--space-4:16px;--space-5:24px;--space-6:32px;--space-7:48px;--space-8:120px;--radius-card:12px}';
const shell = (body: string) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>stub</title><style>${TOKENS}</style><link rel="stylesheet" href="/critical.css"><link rel="stylesheet" href="/base.css"></head><body><main>${body}</main></body></html>`;
const CHALLENGE = '<!doctype html><html><head><title>Just a moment...</title><meta http-equiv="refresh" content="360"></head><body><div id="challenge-stage">Enable JavaScript and cookies to continue</div></body></html>';
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAEAQH/7yMK/gAAAABJRU5ErkJggg==', 'base64');

const REVIEWS = `<div class="block-container"><div class="testimonials"><div class="testimonials__header"><h2 data-testid="testimonials-heading">Reviews</h2></div>
<ul class="testimonials__list" role="list" tabindex="0" data-testid="testimonials-list">${[1, 2, 3, 4].map((n) => `<li class="testimonial-item" data-testid="testimonial-item">Review ${n}</li>`).join('')}</ul></div></div><div style="height:3000px"></div>`;
const BANNER = '<div class="image-with-text image-with-text--banner"><h2 class="image-with-text__heading" data-testid="heading"><strong>Make</strong> fitness a<br> natural part of<br> your everyday life !</h2></div>';
const FORM = `<form method="post" action="/cart/add"><input type="hidden" name="id" value="11"><button type="submit" data-testid="add">Add</button></form>`;

// Trang giả: CSS thật, thêm trang theo path. Mọi request khác trả 404.
async function fakeStore(page: Page, pages: Record<string, () => { status?: number; headers?: Record<string, string>; body: string }>) {
  await page.route(`${ORIGIN}/**`, async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('.css')) return route.fulfill({ contentType: 'text/css', body: css(path.slice(1)) });
    const make = pages[path];
    if (make) return route.fulfill({ contentType: 'text/html', ...make() });
    return route.fulfill({ status: 404, body: '' });
  });
}

// Màn thử thách giả không được tính vào [429-tong-ket].
function isolateReport() {
  let saved: string | undefined;
  test.beforeEach(() => {
    saved = process.env.E2E_429_LOG;
    delete process.env.E2E_429_LOG;
  });
  test.afterEach(() => {
    if (saved !== undefined) process.env.E2E_429_LOG = saved;
  });
}

test.describe('ES1-T224 axe gộp', () => {
  // Bị chặn thì thử lại chỉ thêm lần tải trang vào store đang chặn.
  test.describe.configure({ retries: 0 });

  test('axe 0 serious, 0 console error trên / và /?view=figma (gộp T179, T180, T182)', async ({ page }) => {
    const watch = watchStore(page);
    const serious: string[] = [];
    for (const url of ['/', '/?view=figma']) {
      await gotoStore(page, url);
      await expectNotChallenged(page);
      const { violations } = await new AxeBuilder({ page }).analyze();
      for (const v of violations) {
        if (v.impact === 'serious' || v.impact === 'critical') serious.push(`${url} ${v.id}: ${v.nodes[0]?.target}`);
      }
    }
    expect(serious).toEqual([]);
    await watch.finish();
  });
});

test.describe('ES1-T224 quy ước spec (tĩnh)', () => {
  test.beforeEach(({}, info) => { test.skip(info.project.name !== 'desktop', 'tĩnh, chạy 1 lần'); });

  test('TC-01 isStoreRefresh: chỉ cùng origin, cùng pathname; error-analytics của Shopify không tính', () => {
    const home = 'https://hoa-qua-nhap-khau.myshopify.com/';
    expect(isStoreRefresh('https://hoa-qua-nhap-khau.myshopify.com/?sections=x', home)).toBe(true);
    expect(isStoreRefresh('https://error-analytics-sessions-production.shopifysvc.com/', home)).toBe(false);
    expect(isStoreRefresh('https://hoa-qua-nhap-khau.myshopify.com/cart.js', home)).toBe(false);
    expect(isStoreRefresh('https://hoa-qua-nhap-khau.myshopify.com/cart', 'https://hoa-qua-nhap-khau.myshopify.com/cart')).toBe(true);
  });

  test('TC-02 ES1-T203: bộ đếm refresh, route lỗi refresh đi qua isStoreRefresh', () => {
    const spec = read('tests/e2e/ES1-T203.spec.ts');
    expect(spec).toContain('isStoreRefresh(r.url(), pageUrl)');
    expect(spec).toContain('isStoreRefresh(url.href, pageUrl)');
    expect(spec).not.toMatch(/url\.pathname === path|\.pathname === path\)/);
  });

  test('TC-03 ES1-T188 không dùng networkidle', () => {
    expect(read('tests/e2e/ES1-T188.spec.ts')).not.toMatch(/waitForLoadState\('networkidle'\)/);
  });

  test('TC-04 axe gộp: T179, T180, T182 không còn quét cả trang, test gộp không skip, vẫn báo Cloudflare', () => {
    for (const file of ['ES1-T179', 'ES1-T180', 'ES1-T182']) {
      const spec = read(`tests/e2e/${file}.spec.ts`);
      expect(spec, file).not.toContain('AxeBuilder');
      expect(spec, file).toContain('tests/e2e/ES1-T224.spec.ts');
    }
    const merged = read('tests/e2e/ES1-T224.spec.ts');
    const block = merged.slice(merged.indexOf("test.describe('ES1-T224 axe gộp'"), merged.indexOf("test.describe('ES1-T224 quy ước spec"));
    expect(block).not.toMatch(/test\.(skip|fixme)\(/);
    expect(block).toContain('gotoStore(page, url)');
    expect(block).toContain('watch.finish()');
  });

  test('TC-05 ES1-T179 AC-H24 đo mũi tên thật tới hết card 4, không còn End', () => {
    const spec = read('tests/e2e/ES1-T179.spec.ts');
    expect(spec).not.toContain("press('End')");
    expect(spec).toContain("press('ArrowRight')");
    expect(spec).toMatch(/lastCard\.evaluate[\s\S]{0,120}toBeLessThanOrEqual\(page\.viewportSize\(\)!\.width\)/);
  });
});

test.describe('ES1-T224 trang giả, CSS thật', () => {
  isolateReport();

  test('TC-06 AC-H24: mũi tên thật cuộn danh sách 1920 tới hết card 4, focus giữ, trang không cuộn', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await fakeStore(page, { '/reviews': () => ({ body: shell(REVIEWS) }) });
    await page.goto(`${ORIGIN}/reviews`);
    const list = page.getByTestId('testimonials-list');
    await list.focus();
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => list.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
    const last = page.getByTestId('testimonial-item').last();
    await expect(async () => {
      await page.keyboard.press('ArrowRight');
      expect(await last.evaluate((el) => el.getBoundingClientRect().right)).toBeLessThanOrEqual(1920);
    }).toPass({ timeout: 10_000 });
    await expect(list).toBeFocused();
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });

  test('TC-07 hàng 8: đổi cỡ không tải lại vẫn áp đúng br 1920 inline, 360 none', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    let loads = 0;
    await fakeStore(page, { '/banner': () => { loads += 1; return { body: shell(BANNER) }; } });
    await page.goto(`${ORIGIN}/banner`);
    const breaks = (el: Element) => [...el.querySelectorAll('br')].map((br) => getComputedStyle(br).display);
    const heading = page.getByTestId('heading');
    expect(await heading.evaluate(breaks)).toEqual(['inline', 'inline']);
    await page.setViewportSize({ width: 360, height: 740 });
    expect(await heading.evaluate(breaks)).toEqual(['none', 'none']);
    expect(await heading.innerText()).not.toMatch(/fitnessa|youreveryday/i);
    expect(loads).toBe(1);
  });

  test('TC-08 visibleImagesLoaded: false khi ảnh trong màn hình đang tải, bỏ qua ảnh ẩn, true khi xong; không cần mạng yên', async ({ page }) => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    await fakeStore(page, { '/images': () => ({ body: shell('<div data-testid="scope"><img src="/slow.png" width="50" height="50" alt=""><img src="/hidden.png" style="display:none" alt=""></div><script>fetch("/forever")</script>') }) });
    // Đăng ký sau fakeStore: route đăng ký sau được xét trước.
    await page.route(`${ORIGIN}/slow.png`, async (route) => { await gate; await route.fulfill({ contentType: 'image/png', body: PNG }); });
    // Request không bao giờ xong, đóng vai video, Shop giữ kết nối.
    await page.route(`${ORIGIN}/forever`, () => {});
    await page.goto(`${ORIGIN}/images`, { waitUntil: 'domcontentloaded' });
    const scope = page.getByTestId('scope');
    await expect(scope.locator('img').first()).toBeAttached();
    expect(await visibleImagesLoaded(scope)).toBe(false);
    release();
    await expect.poll(() => visibleImagesLoaded(scope)).toBe(true);
    await expect(page.waitForLoadState('networkidle', { timeout: 1500 }), 'mạng vẫn chưa yên').rejects.toThrow();
  });

  test.describe('tắt JS', () => {
    test.use({ javaScriptEnabled: false });

    test('TC-09 POST /cart/add bị thử thách: nêu Cloudflare, URL đó không qua được điều kiện chờ /cart', async ({ page }) => {
      await fakeStore(page, {
        '/form': () => ({ body: shell(FORM) }),
        '/cart/add': () => ({ status: 403, headers: { 'cf-mitigated': 'challenge' }, body: CHALLENGE }),
      });
      await page.goto(`${ORIGIN}/form`);
      const isCartAdd = (res: Response) => res.request().method() === 'POST' && new URL(res.url()).pathname.endsWith('/cart/add');
      const [post] = await Promise.all([page.waitForResponse(isCartAdd), page.getByTestId('add').click()]);
      expect(() => expectStoreAllowed(post)).toThrow(CLOUDFLARE_BLOCKED);
      await page.waitForLoadState('domcontentloaded');
      expect(new URL(page.url()).pathname.endsWith('/cart')).toBe(false);
      await expect(expectNotChallenged(page)).rejects.toThrow(CLOUDFLARE_BLOCKED);
    });

    test('TC-10 gotoStore domcontentloaded: không chờ ảnh treo, vẫn nhận màn thử thách', async ({ page }) => {
      await fakeStore(page, {
        '/slow': () => ({ body: shell('<img src="/never.png" width="10" height="10" alt=""><p data-testid="ready">ok</p>') }),
        '/blocked': () => ({ status: 403, headers: { 'cf-mitigated': 'challenge' }, body: CHALLENGE }),
      });
      await page.route(`${ORIGIN}/never.png`, () => {});
      await gotoStore(page, `${ORIGIN}/slow`, { waitUntil: 'domcontentloaded' });
      await expect(page.getByTestId('ready')).toBeVisible();
      await expect(gotoStore(page, `${ORIGIN}/blocked`, { waitUntil: 'domcontentloaded' })).rejects.toThrow(CLOUDFLARE_BLOCKED);
    });
  });
});
