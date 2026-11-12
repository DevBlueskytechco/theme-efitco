// KHÔNG CHẮC: spec chưa chạy trên preview (phiên viết không có trình duyệt, không gọi mạng); chờ CI.
// Ticket ES1-T316 TE-10-R2-BE3: motion.js ≤ 6 144 B (tách motion-scrub.js nạp lười, scroll-extras nạp gần viewport),
// lazy-module.js ≤ 768 B + data-lazy-on="interaction". AC: AC-H31, TE-2 AC10, ADR 0006/0010.
// Playwright đặt navigator.webdriver nên motion.js tắt chuyển động; test chuyển động giả lập trình duyệt thường (như ES1-T235).
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { test, expect, type Page } from '@playwright/test';
import { watchShopPay403 } from './support/console-guard';

const asUser = () => Object.defineProperty(navigator, 'webdriver', { get: () => false });
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];
const size = (file: string) => statSync(`assets/${file}`).size;

function watchConsole(page: Page) {
  const errors: string[] = [];
  const isShopPay403 = watchShopPay403(page);
  page.on('console', (msg) => {
    if (msg.type() !== 'error' || isShopPay403(msg)) return;
    if (IGNORE_CONSOLE.some((r) => r.test(msg.text()) || r.test(msg.location().url))) return;
    errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

/** Ghi lại URL các file JS theme được tải (theo tên file). */
function watchAssets(page: Page) {
  const loaded = new Set<string>();
  page.on('request', (r) => {
    const m = r.url().match(/\/([\w-]+\.js)(\?|$)/);
    if (m && r.url().includes('/assets/')) loaded.add(m[1]);
  });
  return loaded;
}

/** Cuộn từng màn tới cuối trang, đủ để IntersectionObserver kịp chạy. */
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

test.describe('ES1-T316 tĩnh', () => {
  test('trần byte: motion 6 144, lazy-module 768, mọi file ≤ 8 192', () => {
    expect(size('motion.js')).toBeLessThanOrEqual(6144);
    expect(size('lazy-module.js')).toBeLessThanOrEqual(768);
    for (const file of readdirSync('assets').filter((f) => f.endsWith('.js'))) {
      expect(size(file), file).toBeLessThanOrEqual(8192);
    }
  });

  test('không console, không import tĩnh, không fetch tự viết', () => {
    for (const file of ['motion.js', 'motion-scrub.js', 'lazy-module.js']) {
      const js = readFileSync(`assets/${file}`, 'utf8');
      expect(js, file).not.toMatch(/console\.|fetch\(/);
      expect(js, file).not.toMatch(/^\s*import\s[^(]/m);
    }
  });

  test('motion-scrub, scroll-extras chỉ nạp động từ motion.js, không thêm thẻ script', () => {
    const motion = readFileSync('assets/motion.js', 'utf8');
    expect(motion).toContain('import(new URL("motion-scrub.js", import.meta.url))');
    expect(motion).toContain('import(new URL("scroll-extras.js", import.meta.url))');
    const theme = readFileSync('layout/theme.liquid', 'utf8');
    expect(theme.match(/'motion\.js'/g)).toHaveLength(1);
    for (const dir of ['layout', 'blocks', 'snippets', 'templates']) {
      for (const file of readdirSync(dir)) {
        expect(readFileSync(`${dir}/${file}`, 'utf8'), `${dir}/${file}`).not.toMatch(/motion-scrub\.js|'scroll-extras\.js'/);
      }
    }
  });

  test('lazy-module nhận data-lazy-on="interaction" với pointerenter, focusin, touchstart', () => {
    const js = readFileSync('assets/lazy-module.js', 'utf8');
    expect(js).toContain('lazyOn !== "interaction"');
    for (const type of ['pointerenter', 'focusin', 'touchstart']) expect(js).toContain(`"${type}"`);
  });

  test('reveal bỏ qua slideshow (TE-2 AC10)', () => {
    expect(readFileSync('assets/motion.js', 'utf8')).toMatch(/const skip = "\.slideshow,/);
  });
});

test.describe('ES1-T316 lazy-module interaction', () => {
  /** Gắn data-lazy-on="interaction" cho quiz-finder.js trong HTML trang chủ (chưa block nào dùng, TE-13-R2-BE1 sẽ dùng). */
  async function quizOnInteraction(page: Page) {
    await page.route((url) => url.pathname === '/', async (route) => {
      if (route.request().resourceType() !== 'document') return route.fallback();
      const response = await route.fetch();
      const body = (await response.text()).replace(/(data-lazy-module="[^"]*quiz-finder\.js[^"]*")/, '$1 data-lazy-on="interaction"');
      await route.fulfill({ response, body });
    });
  }

  test('vào viewport chưa tải; focus trong element thì tải', async ({ page }) => {
    const errors = watchConsole(page);
    const loaded = watchAssets(page);
    await quizOnInteraction(page);
    await page.goto('/');
    const quiz = page.getByTestId('quiz').first();
    test.skip((await quiz.count()) === 0 || (await quiz.getAttribute('data-lazy-on')) !== 'interaction', 'Trang chủ không có quiz nạp quiz-finder.js');
    await quiz.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    expect(loaded.has('quiz-finder.js')).toBe(false);
    await quiz.locator('input, button, a, select').first().focus();
    await expect.poll(() => loaded.has('quiz-finder.js')).toBe(true);
    expect(errors).toEqual([]);
  });

  test('hover chuột tải module (desktop)', async ({ page }, ti) => {
    test.skip(ti.project.name !== 'desktop', 'pointerenter bằng chuột');
    const loaded = watchAssets(page);
    await quizOnInteraction(page);
    await page.goto('/');
    const quiz = page.getByTestId('quiz').first();
    test.skip((await quiz.count()) === 0 || (await quiz.getAttribute('data-lazy-on')) !== 'interaction', 'Trang chủ không có quiz nạp quiz-finder.js');
    await quiz.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    expect(loaded.has('quiz-finder.js')).toBe(false);
    await quiz.hover();
    await expect.poll(() => loaded.has('quiz-finder.js')).toBe(true);
  });

  test('mặc định vẫn nạp theo viewport', async ({ page }) => {
    const loaded = watchAssets(page);
    await page.goto('/');
    const quiz = page.getByTestId('quiz').first();
    test.skip((await quiz.count()) === 0 || !(await quiz.getAttribute('data-lazy-module')), 'Trang chủ không có quiz nạp quiz-finder.js');
    await quiz.scrollIntoViewIfNeeded();
    await expect.poll(() => loaded.has('quiz-finder.js')).toBe(true);
  });
});

test.describe('ES1-T316 motion', () => {
  test('hero không reveal, chữ ảnh hiện ngay (TE-2 AC10)', async ({ page }) => {
    await page.addInitScript(asUser);
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'on');
    const hero = page.getByTestId('slideshow').first();
    test.skip((await hero.count()) === 0, 'Trang chủ không có slideshow');
    await expect(hero.locator('[data-reveal]')).toHaveCount(0);
    await expect(hero).not.toHaveAttribute('data-reveal', /.*/);
  });

  test('reveal phần dưới màn hình vẫn chạy, xong thì gỡ thuộc tính', async ({ page }) => {
    await page.addInitScript(asUser);
    await page.goto('/');
    await expect(page.locator('[data-reveal="wait"]').first()).toBeAttached();
    // Đánh dấu 1 phần tử để locator không trượt sang phần tử khác khi data-reveal đổi
    await page.locator('[data-reveal="wait"]').first().evaluate((el) => el.setAttribute('data-t316', ''));
    const item = page.locator('[data-t316]');
    await item.scrollIntoViewIfNeeded();
    await expect(item).toHaveCSS('opacity', '1', { timeout: 5000 });
    await expect(item).not.toHaveAttribute('data-reveal', /.*/, { timeout: 5000 });
  });

  test('motion-scrub.js chỉ tải khi khối banner tới gần, tách chữ theo từ', async ({ page }) => {
    const errors = watchConsole(page);
    const loaded = watchAssets(page);
    await page.addInitScript(asUser);
    await page.goto('/');
    const banner = page.locator('.image-with-text--banner').first();
    test.skip((await banner.count()) === 0, 'Trang chủ không có image with text dạng banner');
    const far = await banner.evaluate((el) => el.getBoundingClientRect().top > innerHeight * 2.2);
    if (far) expect(loaded.has('motion-scrub.js')).toBe(false);
    await banner.scrollIntoViewIfNeeded();
    await expect.poll(() => loaded.has('motion-scrub.js')).toBe(true);
    const heading = banner.getByTestId('image-with-text-heading');
    await expect(heading).toHaveAttribute('data-scrub', '');
    await expect(heading.locator('.motion-word').first()).toBeAttached();
    const text = await heading.textContent();
    expect(text?.replace(/\s+/g, ' ').trim().length).toBeGreaterThan(0);
    expect(errors).toEqual([]);
  });

  test('scroll-extras.js tải khi hàng cuộn ngang tới gần, cả khi giảm chuyển động', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce', storageState: 'tests/setup/state.json', baseURL: process.env.STORE_ORIGIN || (process.env.PREVIEW_URL ? new URL(process.env.PREVIEW_URL).origin : undefined) });
    const page = await context.newPage();
    const loaded = watchAssets(page);
    await page.goto('/');
    const row = page.locator('scroll-buttons').first();
    test.skip((await row.count()) === 0, 'Trang chủ không có hàng cuộn ngang');
    await row.scrollIntoViewIfNeeded();
    await expect.poll(() => loaded.has('scroll-extras.js')).toBe(true);
    expect(loaded.has('motion-scrub.js')).toBe(false);
    await expect(page.locator('html')).not.toHaveAttribute('data-motion', 'on');
    await context.close();
  });

  test('bản tin: email sai thì báo lỗi của theme, sửa đúng thì gỡ lỗi', async ({ page }) => {
    await page.goto('/');
    const form = page.getByTestId('footer-newsletter-form');
    test.skip((await form.count()) === 0, 'Footer không có bản tin');
    const email = page.getByTestId('footer-newsletter-email');
    await email.fill('abc');
    await page.getByTestId('footer-newsletter-submit').click();
    await expect(form).toHaveAttribute('data-invalid', '');
    await expect(email).toHaveAttribute('aria-invalid', 'true');
    await expect(email).toBeFocused();
    await expect(page.getByTestId('footer-newsletter-invalid')).toBeVisible();
    await email.fill('a@example.com');
    await expect(form).not.toHaveAttribute('data-invalid', '');
    await expect(email).not.toHaveAttribute('aria-invalid', /.*/);
  });

  test('cuộn hết trang chủ không lỗi console; ghi JS tải sẵn và sau cuộn (AC-H31)', async ({ page }) => {
    const errors = watchConsole(page);
    await page.addInitScript(asUser);
    await page.goto('/');
    await page.waitForLoadState('load');
    const sum = () =>
      page.evaluate(() =>
        (performance.getEntriesByType('resource') as PerformanceResourceTiming[])
          .filter((e) => /\/assets\/[^?]+\.js(\?|$)/.test(e.name))
          .reduce((n, e) => n + (e.decodedBodySize || 0), 0),
      );
    const preload = await sum();
    await scrollToEnd(page);
    await page.waitForLoadState('networkidle');
    const after = await sum();
    test.info().annotations.push({ type: 'js-bytes', description: `tải sẵn ${preload} B, sau cuộn ${after} B` });
    // decodedBodySize = 0 khi CDN không gửi Timing-Allow-Origin: chỉ ghi, đo chặn ở CI ES1-T177.
    // Sau cuộn (≤ 65 536) chỉ ghi: còn chờ TE-13-R2-BE1 (featured product lười interaction), TE-3-R2-BE2 (gỡ product-swatch).
    if (preload > 0) expect(preload).toBeLessThanOrEqual(40960);
    expect(errors).toEqual([]);
  });
});
