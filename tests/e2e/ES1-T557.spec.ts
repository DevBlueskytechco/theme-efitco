// KHÔNG CHẮC: spec chưa chạy, chưa type-check (sandbox agent không mở trình duyệt, không gọi mạng) → chờ CI.
// Ticket ES1-T557: cuộn và phím mũi tên theo hướng văn bản (foundation §34, điều kiện 3 bật RTL).
// Theme chưa có locale RTL: ép dir="rtl" trên <html> trong HTML trả về (cách ES1-T335) để module nâng cấp trên bố cục RTL từ đầu.
// - collection-tabs.js: RTL ArrowLeft = tab sau, ArrowRight = tab trước; Home/End giữ (sửa).
// - slideshow.js: next/prev/chấm/autoplay theo rect, chấm theo IntersectionObserver (kiểm, không sửa).
// - scroll-extras.js: kéo theo toạ độ vật lý, snap theo bước offsetLeft (âm ở RTL), --scroll-pos = |scrollLeft| / max (kiểm, không sửa).
// - product-media.js: thumbnail cuộn list theo rect (kiểm, không sửa).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T557.spec.ts tests/e2e/ES1-T335.spec.ts tests/e2e/ES1-T333.spec.ts tests/e2e/ES1-T189.spec.ts
// Dữ liệu: / (slideshow ≥ 2 slide), /?view=figma (featured-collection có tab), /?view=te15 (te15-five tràn ở 1024), TE4_MEDIA_HANDLE (≥ 5 media).
import { readFileSync, statSync } from 'node:fs';
import { test, expect, type Page } from './support/test';
import { env } from './support/store-data';
import { watchShopPay403 } from './support/console-guard';
import { expectNotChallenged } from './support/store-guard';

const MEDIA = env('TE4_MEDIA_HANDLE');
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|shopifysvc\.com|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];
const SPEED_SECONDS = 3; // min của setting autoplay_speed (như ES1-T333)

const desktopOnly = ({}, ti: { project: { name: string } }) =>
  test.skip(ti.project.name !== 'desktop', 'đặt viewport, chuột trong test: chạy ở desktop');

/** Ép dir="rtl" trên <html> của document khung chính.
 * Chỉ khung chính: iframe Shop Pay (login_with_shop/authorize, 302 sang shop.app) tải muộn, route.fetch còn treo khi test xong
 * → "route.fetch: Test ended" thành lỗi ngoài test, job đỏ dù test qua (CI PR #326). */
async function forceRtl(page: Page) {
  await page.route('**/*', async (route) => {
    const request = route.request();
    if (request.resourceType() !== 'document' || request.frame() !== page.mainFrame()) return route.fallback();
    const response = await route.fetch();
    const body = (await response.text()).replace(/<html\b/, '<html dir="rtl"');
    await route.fulfill({ response, body });
  });
}

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

async function expectRtl(page: Page) {
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
}

// ---------------------------------------------------------------- tĩnh
test.describe('ES1-T557 tĩnh', () => {
  test.beforeEach(desktopOnly);

  test('AC6 byte: collection-tabs ≤ 1 792, slideshow, scroll-extras, product-media ≤ 8 192', () => {
    expect(statSync('assets/collection-tabs.js').size).toBeLessThanOrEqual(1792);
    for (const f of ['assets/slideshow.js', 'assets/scroll-extras.js', 'assets/product-media.js', 'assets/collection-tabs.js']) {
      expect(statSync(f).size, f).toBeLessThanOrEqual(8192);
    }
  });

  test('hướng lấy từ :dir(rtl) hoặc rect, không dấu cố định theo LTR', () => {
    const tabs = readFileSync('assets/collection-tabs.js', 'utf8');
    expect(tabs).toContain(':dir(rtl)');
    expect(tabs).toMatch(/ArrowRight: i \+ d, ArrowLeft: i - d/);
    expect(tabs).not.toMatch(/console\./);
    expect(readFileSync('assets/slideshow.js', 'utf8')).toMatch(/getBoundingClientRect\(\)\.left - this\.#track\.getBoundingClientRect\(\)\.left/);
    expect(readFileSync('assets/product-media.js', 'utf8')).toMatch(/li\.getBoundingClientRect\(\)\.left - l\.getBoundingClientRect\(\)\.left/);
    expect(readFileSync('assets/scroll-extras.js', 'utf8')).toContain('Math.abs(t.scrollLeft)');
  });
});

// ---------------------------------------------------------------- tab collection
test.describe('ES1-T557 AC1 tab collection', () => {
  const block = (page: Page) => page.getByTestId('featured-collection');
  const tab = (page: Page, i: number) => block(page).getByTestId('featured-collection-tab').nth(i);

  async function open(page: Page) {
    const res = await page.goto('/?view=figma');
    expect(res?.status()).toBeLessThan(400);
    const count = await block(page).getByTestId('featured-collection-tab').count();
    test.skip(count < 3, `Chỉ có ${count} tab: thiếu collection figma-tab-* (ES1-T178)`);
    await block(page).getByTestId('featured-collection-tabs').scrollIntoViewIfNeeded();
    await expect(block(page).getByTestId('featured-collection-tabs')).toHaveAttribute('role', 'tablist');
    return count;
  }

  test('RTL: tab 1 focus, ArrowLeft → tab 2; ArrowRight → tab 1; ArrowRight ở tab 1 → tab cuối; Home/End giữ', async ({ page }) => {
    const errors = watchConsole(page);
    await forceRtl(page);
    const count = await open(page);
    await expectRtl(page);
    await tab(page, 0).focus();
    await page.keyboard.press('ArrowLeft');
    await expect(tab(page, 1)).toHaveAttribute('aria-selected', 'true');
    await expect(tab(page, 1)).toBeFocused();
    await expect(tab(page, 0)).toHaveAttribute('aria-selected', 'false');
    await page.keyboard.press('ArrowRight');
    await expect(tab(page, 0)).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('ArrowRight');
    await expect(tab(page, count - 1)).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('ArrowLeft');
    await expect(tab(page, 0)).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('End');
    await expect(tab(page, count - 1)).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('Home');
    await expect(tab(page, 0)).toHaveAttribute('aria-selected', 'true');
    await expect(tab(page, 0)).toBeFocused();
    expect(errors).toEqual([]);
  });

  test('LTR không đổi: ArrowRight → tab 2, ArrowLeft → tab 1', async ({ page }) => {
    await open(page);
    await tab(page, 0).focus();
    await page.keyboard.press('ArrowRight');
    await expect(tab(page, 1)).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('ArrowLeft');
    await expect(tab(page, 0)).toHaveAttribute('aria-selected', 'true');
  });
});

// ---------------------------------------------------------------- slideshow
test.describe('ES1-T557 AC2 slideshow RTL', () => {
  const slides = (page: Page) => page.getByTestId('slideshow-slide');
  const activeIndex = (page: Page) =>
    slides(page).evaluateAll((all) => all.findIndex((s) => !(s as HTMLElement).inert));
  /** Slide i nằm trong khung track (sai số 2px). */
  const inFrame = (page: Page, i: number) =>
    slides(page).nth(i).evaluate((el) => {
      const r = el.getBoundingClientRect();
      const t = el.closest('[data-testid="slideshow-track"]')!.getBoundingClientRect();
      return r.left >= t.left - 2 && r.right <= t.right + 2;
    });

  async function open(page: Page) {
    await page.goto('/');
    await expectRtl(page);
    await expect(page.getByTestId('slideshow')).toHaveAttribute('data-enhanced', '');
    const count = await slides(page).count();
    test.skip(count < 2, 'templates/index.liquid cần từ 2 slide');
    return count;
  }

  // Mũi tên chỉ hiện từ 48rem, chấm chỉ dưới 48rem (ES1-T333 AC7): next/prev đo ở 1280, chấm đo ở 360.
  test('1280: next → slide 2 inert=false, chấm 2 aria-current, track cuộn âm; prev từ slide 1 → slide cuối', async ({ page }) => {
    desktopOnly({}, test.info());
    await page.setViewportSize({ width: 1280, height: 800 });
    const errors = watchConsole(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await forceRtl(page);
    const count = await open(page);
    const dots = page.getByTestId('slideshow-dot');
    await expect.poll(() => activeIndex(page)).toBe(0);

    await page.getByTestId('slideshow-next').click();
    await expect.poll(() => activeIndex(page)).toBe(1);
    expect(await slides(page).nth(1).evaluate((el) => (el as HTMLElement).inert)).toBe(false);
    await expect(dots.nth(1)).toHaveAttribute('aria-current', 'true');
    await expect(dots.nth(0)).not.toHaveAttribute('aria-current', /.*/);
    expect(await inFrame(page, 1)).toBe(true);
    expect(await page.getByTestId('slideshow-track').evaluate((el) => el.scrollLeft)).toBeLessThan(0);

    // Về slide 1 bằng prev, rồi prev vòng về slide cuối
    await page.getByTestId('slideshow-prev').click();
    await expect.poll(() => activeIndex(page)).toBe(0);
    await expect(dots.nth(0)).toHaveAttribute('aria-current', 'true');
    await page.getByTestId('slideshow-prev').click();
    await expect.poll(() => activeIndex(page)).toBe(count - 1);
    await expect(dots.nth(count - 1)).toHaveAttribute('aria-current', 'true');
    expect(await inFrame(page, count - 1)).toBe(true);
    expect(errors).toEqual([]);
  });

  test('360: bấm chấm 2 → slide 2 inert=false, aria-current, track cuộn âm; chấm 1 về đầu', async ({ page }) => {
    desktopOnly({}, test.info());
    await page.setViewportSize({ width: 360, height: 800 });
    const errors = watchConsole(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await forceRtl(page);
    await open(page);
    const dots = page.getByTestId('slideshow-dot');
    await expect.poll(() => activeIndex(page)).toBe(0);

    await dots.nth(1).click();
    await expect.poll(() => activeIndex(page)).toBe(1);
    await expect(dots.nth(1)).toHaveAttribute('aria-current', 'true');
    expect(await inFrame(page, 1)).toBe(true);
    expect(await page.getByTestId('slideshow-track').evaluate((el) => el.scrollLeft)).toBeLessThan(0);

    await dots.nth(0).click();
    await expect.poll(() => activeIndex(page)).toBe(0);
    await expect(dots.nth(0)).toHaveAttribute('aria-current', 'true');
    expect(await inFrame(page, 0)).toBe(true);
    expect(errors).toEqual([]);
  });

  test('1280: autoplay RTL chạy sang slide 2', async ({ page }) => {
    desktopOnly({}, test.info());
    await page.setViewportSize({ width: 1280, height: 800 });
    // Như ES1-T333: bật autoplay bằng thuộc tính markup ngay trước connectedCallback, không đổi cấu hình store
    await page.addInitScript((speed) => {
      const define = customElements.define;
      customElements.define = function (name, element, options) {
        if (name === 'slideshow-carousel') {
          const connected = element.prototype.connectedCallback;
          element.prototype.connectedCallback = function (this: HTMLElement) {
            if (this.hasAttribute('data-autoplay')) this.setAttribute('data-autoplay', 'true');
            if (this.hasAttribute('data-autoplay-speed')) this.setAttribute('data-autoplay-speed', String(speed));
            connected.call(this);
          };
        }
        define.call(customElements, name, element, options);
      };
    }, SPEED_SECONDS);
    await forceRtl(page);
    await open(page);
    await page.mouse.move(640, 2);
    await expect(page.getByTestId('slideshow')).toHaveAttribute('data-playing', 'true');
    await expect.poll(() => activeIndex(page), { timeout: (SPEED_SECONDS + 2) * 1000 }).toBe(1);
    // Autoplay cuộn mượt (không reduced motion): inert đổi khi IntersectionObserver thấy slide 2, khung tới đích sau đó
    await expect.poll(() => inFrame(page, 1)).toBe(true);
    await expect(page.getByTestId('slideshow-dot').nth(1)).toHaveAttribute('aria-current', 'true');
  });
});

// ---------------------------------------------------------------- hàng cuộn
test.describe('ES1-T557 AC3 hàng cuộn RTL', () => {
  test.beforeEach(desktopOnly);

  const band = (page: Page) => page.getByTestId('container-te15-five');
  const track = (page: Page) => band(page).getByTestId('collection-list-track');
  const bar = (page: Page) => band(page).getByTestId('carousel-progress');
  const pos = (page: Page) => bar(page).evaluate((el) => Number((el as HTMLElement).style.getPropertyValue('--scroll-pos') || NaN));

  async function open(page: Page) {
    await page.setViewportSize({ width: 1024, height: 900 });
    await forceRtl(page);
    await page.goto('/?view=te15');
    await expectRtl(page);
    await band(page).scrollIntoViewIfNeeded();
    await expect(band(page).locator('scroll-buttons')).toHaveAttribute('data-enhanced', '');
    // scroll-extras.js (motion.js nạp gần viewport) đã gắn tiến trình
    await expect.poll(() => pos(page)).toBe(0);
  }

  test('kéo chuột 300px về phía cuối hàng, thả → snap đúng card, --scroll-pos 0 → > 0; cuối hàng = 1', async ({ page }) => {
    const errors = watchConsole(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    const box = (await track(page).boundingBox())!;
    const y = box.y + box.height / 2;
    // RTL: cuối hàng nằm bên trái, kéo nội dung sang phải để tiến về cuối hàng
    const x = box.x + box.width / 2 - 150;
    await page.mouse.move(x, y);
    await page.mouse.down();
    for (let i = 1; i <= 10; i++) await page.mouse.move(x + i * 30, y);
    await page.mouse.up();

    await expect(track(page)).not.toHaveAttribute('data-dragging', '');
    const snap = () =>
      track(page).evaluate((t) => {
        const [a, b] = t.children as unknown as HTMLElement[];
        const step = Math.abs(b.offsetLeft - a.offsetLeft);
        const x = Math.abs(t.scrollLeft);
        const max = t.scrollWidth - t.clientWidth;
        const rest = x % step;
        return { x, atCard: rest < 2 || step - rest < 2 || x > max - 2, negative: t.scrollLeft < 0 };
      });
    await expect.poll(async () => (await snap()).atCard).toBe(true);
    const s = await snap();
    expect(s.negative).toBe(true);
    expect(s.x).toBeGreaterThan(0);
    await expect.poll(() => pos(page)).toBeGreaterThan(0);

    await track(page).evaluate((t) => t.scrollTo({ left: -(t.scrollWidth - t.clientWidth), behavior: 'auto' }));
    await expect.poll(() => pos(page)).toBeCloseTo(1, 2);
    expect(errors).toEqual([]);
  });

  test('next của scroll-buttons vẫn cuộn về âm, tiến trình tăng (ES1-T335)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    await expect(band(page).getByTestId('collection-list-prev')).toHaveAttribute('aria-disabled', 'true');
    await band(page).getByTestId('collection-list-next').click();
    await expect.poll(() => track(page).evaluate((el) => el.scrollLeft)).toBeLessThan(0);
    await expect.poll(() => pos(page)).toBeGreaterThan(0);
    await expect(band(page).getByTestId('collection-list-prev')).toHaveAttribute('aria-disabled', 'false');
  });
});

// ---------------------------------------------------------------- PDP thumbnail
test.describe('ES1-T557 AC4 PDP thumbnail RTL', () => {
  test('dưới 64rem: chọn thumbnail 5 → ô 5 nằm trong khung list, thumbnail 5 aria-current', async ({ page }) => {
    test.skip(!MEDIA, 'thiếu TE4_MEDIA_HANDLE');
    const errors = watchConsole(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await forceRtl(page);
    await page.goto(`/products/${MEDIA}`);
    await expectNotChallenged(page);
    await expectRtl(page);
    await expect.poll(() => page.evaluate(() => Boolean(customElements.get('product-media-gallery')))).toBe(true);
    const gallery = page.getByTestId('product-media').first();
    const thumbs = gallery.getByTestId('product-media-thumbnail');
    test.skip((await thumbs.count()) < 5, 'sản phẩm cần từ 5 media');

    const thumb = thumbs.nth(4);
    const id = (await thumb.getAttribute('data-media-id'))!;
    const before = page.url();
    await thumb.click();
    await expect(thumb).toHaveAttribute('aria-current', 'true');
    const inFrame = () =>
      gallery.locator(`[data-testid="product-media-item"][data-media-id="${id}"]`).evaluate((li) => {
        const r = li.getBoundingClientRect();
        const l = li.parentElement!.getBoundingClientRect();
        return r.left >= l.left - 2 && r.right <= l.right + 2;
      });
    await expect.poll(inFrame).toBe(true);
    expect(await gallery.getByTestId('product-media-list').evaluate((el) => el.scrollLeft)).toBeLessThan(0);
    expect(page.url()).toBe(before);
    expect(errors).toEqual([]);
  });
});

// ---------------------------------------------------------------- ảnh so #h-rtl
test.describe('ES1-T557 ảnh trang chủ RTL', () => {
  for (const width of [360, 1280]) {
    test(`${width}: chụp trang chủ dir=rtl (slideshow, hàng cuộn) để so foundation.html #h-rtl`, async ({ page }, ti) => {
      desktopOnly({}, ti);
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await forceRtl(page);
      await page.goto('/');
      await expectRtl(page);
      await expect(page.getByTestId('slideshow')).toHaveAttribute('data-enhanced', '');
      await ti.attach(`home-rtl-${width}-slideshow`, { body: await page.getByTestId('slideshow').screenshot(), contentType: 'image/png' });
      const row = page.locator('scroll-buttons').first();
      if (await row.count()) {
        await row.scrollIntoViewIfNeeded();
        await expect(row).toHaveAttribute('data-enhanced', '');
        await ti.attach(`home-rtl-${width}-row`, { body: await row.screenshot(), contentType: 'image/png' });
      }
    });
  }
});
