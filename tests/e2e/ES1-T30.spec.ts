// Ticket ES1-T30 (2727475000000133022) — TE-2 AC6–AC9 phần tương tác: assets/slideshow.js.
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T30.spec.ts
import { test, expect, type Page } from '@playwright/test';

const SPEED_SECONDS = 3; // min của setting autoplay_speed
const AFTER_TICK = (SPEED_SECONDS + 2) * 1000;

function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => {
    if (m.type() === 'error' && /slideshow/.test(m.location().url)) errors.push(m.text());
  });
  return errors;
}

// Setting autoplay mặc định tắt: đổi thuộc tính ngay trước connectedCallback thay vì đổi cấu hình store.
// Không dùng route.fetch: gọi lại store từ Node nhận trang bot protection "Your connection needs to be verified" (ES1-T171).
// Chỉ đổi thuộc tính markup đã có: block mất hook data-autoplay thì autoplay không bật và test fail.
async function enableAutoplay(page: Page) {
  await page.addInitScript(speed => {
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
}

async function open(page: Page) {
  await page.goto('/');
  await expect(page.getByTestId('slideshow')).toHaveAttribute('data-enhanced', '');
  const count = await page.getByTestId('slideshow-slide').count();
  expect(count, 'templates/index.liquid có từ 2 slide').toBeGreaterThanOrEqual(2);
  return count;
}

const activeIndex = (page: Page) =>
  page.getByTestId('slideshow-slide').evaluateAll(slides => slides.findIndex(s => !(s as HTMLElement).inert));

// Vùng header nằm đè hero nhưng không thuộc slideshow, nên rời chuột vẫn có pointerleave.
async function moveMouseAway(page: Page) {
  await page.mouse.move(page.viewportSize()!.width / 2, 2);
}

test.describe('ES1-T30 điều hướng', () => {
  test('next, prev, chấm đổi slide, aria-current và inert đi cùng nhau', async ({ page }, ti) => {
    test.skip(ti.project.name === 'mobile', 'Mobile ẩn next, back theo CTO 07/11; dot kiểm ở ES1-T235');
    const errors = trackErrors(page);
    const count = await open(page);
    const dots = page.getByTestId('slideshow-dot');
    await expect(dots).toHaveCount(count);
    await expect(dots.nth(0)).toHaveAttribute('aria-current', 'true');

    await page.getByTestId('slideshow-next').click();
    await expect.poll(() => activeIndex(page)).toBe(1);
    await expect(dots.nth(1)).toHaveAttribute('aria-current', 'true');
    await expect(dots.nth(0)).not.toHaveAttribute('aria-current');
    await expect(page.locator('[data-testid="slideshow-slide"]:not([inert])')).toHaveCount(1);

    await page.getByTestId('slideshow-prev').click();
    await expect.poll(() => activeIndex(page)).toBe(0);

    // Trang chủ không autoplay ẩn chấm theo Figma (CTO 07/11); chấm chỉ hiện khi bật autoplay
    if (await dots.nth(count - 1).isVisible()) {
      await dots.nth(count - 1).click();
      await expect.poll(() => activeIndex(page)).toBe(count - 1);
    }
    expect(errors).toEqual([]);
  });

  test('next ở slide cuối về đầu, prev ở đầu về cuối', async ({ page }, ti) => {
    test.skip(ti.project.name === 'mobile', 'Mobile ẩn next, back theo CTO 07/11; dot kiểm ở ES1-T235');
    const count = await open(page);
    await page.getByTestId('slideshow-prev').click();
    await expect.poll(() => activeIndex(page)).toBe(count - 1);
    await page.getByTestId('slideshow-next').click();
    await expect.poll(() => activeIndex(page)).toBe(0);
  });

  test('cuộn track như vuốt cũng cập nhật chấm', async ({ page }) => {
    await open(page);
    const track = page.getByTestId('slideshow-track');
    await track.evaluate(el => el.scrollTo({ left: el.clientWidth, behavior: 'instant' }));
    await expect.poll(() => activeIndex(page)).toBe(1);
    await expect(page.getByTestId('slideshow-dot').nth(1)).toHaveAttribute('aria-current', 'true');
  });

  test('Tab không vào slide ẩn; track bỏ tabindex', async ({ page }) => {
    await open(page);
    await expect(page.getByTestId('slideshow-track')).not.toHaveAttribute('tabindex');
    const inInertSlide = () =>
      page.evaluate(() => !!document.activeElement?.closest('[data-testid="slideshow-slide"][inert]'));
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press('Tab');
      expect(await inInertSlide(), `Tab lần ${i + 1} vào slide ẩn`).toBe(false);
    }
  });

  test('a11y: nhãn slide, nhãn chấm, live region báo khi đổi slide', async ({ page }, ti) => {
    test.skip(ti.project.name === 'mobile', 'Mobile ẩn next, back theo CTO 07/11; dot kiểm ở ES1-T235');
    const count = await open(page);
    const root = page.getByTestId('slideshow');
    const slides = page.getByTestId('slideshow-slide');
    const label = (await root.getAttribute('data-label-slide'))!;
    const slideLabel = (index: number) => label.replace('[index]', String(index)).replace('[total]', String(count));
    await expect(slides.nth(0)).toHaveAttribute('aria-label', slideLabel(1));
    await expect(slides.nth(1)).toHaveAttribute('aria-label', slideLabel(2));
    const dotLabel = (await root.getAttribute('data-label-dot'))!.replace('[index]', '2');
    await expect(page.getByTestId('slideshow-dot').nth(1)).toHaveAttribute('aria-label', dotLabel);

    const live = page.getByTestId('slideshow-live');
    await expect(live).toBeEmpty();
    await page.getByTestId('slideshow-next').click();
    await expect(live).toHaveText(slideLabel(2));
    await expect(live).toHaveAttribute('aria-live', 'polite');
  });

  test('còn 1 slide: ẩn nút và chấm, connect lại không nhân đôi chấm', async ({ page }) => {
    await enableAutoplay(page);
    const count = await open(page);
    const reconnect = () =>
      page.getByTestId('slideshow').evaluate(el => {
        const parent = el.parentElement!;
        el.remove();
        parent.append(el);
      });

    await reconnect();
    await expect(page.getByTestId('slideshow-dot')).toHaveCount(count);

    await page.getByTestId('slideshow').evaluate(el => {
      el.querySelectorAll('[data-testid="slideshow-slide"]:not(:first-child)').forEach(s => s.remove());
    });
    await reconnect();
    const root = page.getByTestId('slideshow');
    await expect(root).toHaveAttribute('data-enhanced', '');
    await expect(root).not.toHaveAttribute('data-multiple');
    await expect(page.getByTestId('slideshow-next')).toBeHidden();
    await expect(page.getByTestId('slideshow-prev')).toBeHidden();
    await expect(page.getByTestId('slideshow-dot')).toHaveCount(0);
    await expect(page.getByTestId('slideshow-slide').first()).not.toHaveAttribute('inert');
  });

  test('không tải được slideshow.js: vẫn cuộn được, controls ẩn', async ({ page }) => {
    await page.route('**/slideshow*.js*', r => r.abort());
    await page.goto('/');
    const root = page.getByTestId('slideshow');
    await expect(root).not.toHaveAttribute('data-enhanced');
    await expect(page.getByTestId('slideshow-controls')).toBeHidden();
    const track = page.getByTestId('slideshow-track');
    await expect(track).toHaveAttribute('tabindex', '0');
    const left = await track.evaluate(async el => {
      el.scrollTo({ left: el.clientWidth, behavior: 'instant' });
      await new Promise(resolve => requestAnimationFrame(resolve));
      return el.scrollLeft;
    });
    expect(left).toBeGreaterThan(0);
  });
});

test.describe('ES1-T30 autoplay', () => {
  test('mặc định tắt: đứng yên 8s, không có data-playing nếu không có video', async ({ page }) => {
    await open(page);
    await page.waitForTimeout(8000);
    expect(await activeIndex(page)).toBe(0);
    if ((await page.locator('slideshow-carousel video').count()) === 0) {
      await expect(page.getByTestId('slideshow')).not.toHaveAttribute('data-playing');
      await expect(page.getByTestId('slideshow-pause')).toBeHidden();
    }
  });

  test('bật autoplay thì tự chuyển, live region tắt báo, pause dừng hẳn, play chạy lại', async ({ page }) => {
    await enableAutoplay(page);
    await open(page);
    const root = page.getByTestId('slideshow');
    const pause = page.getByTestId('slideshow-pause');
    await expect(root).toHaveAttribute('data-playing', 'true');
    await expect(page.getByTestId('slideshow-live')).toHaveAttribute('aria-live', 'off');
    await expect.poll(() => activeIndex(page), { timeout: AFTER_TICK }).toBe(1);

    await pause.click();
    await moveMouseAway(page);
    await expect(root).toHaveAttribute('data-playing', 'false');
    await expect(pause).toHaveAttribute('aria-label', (await root.getAttribute('data-label-play'))!);
    await page.waitForTimeout(AFTER_TICK);
    expect(await activeIndex(page), 'đã pause thì rời chuột không chạy lại').toBe(1);

    await pause.click();
    await moveMouseAway(page);
    await expect(root).toHaveAttribute('data-playing', 'true');
    await expect(pause).toHaveAttribute('aria-label', (await root.getAttribute('data-label-pause'))!);
    await expect.poll(() => activeIndex(page), { timeout: AFTER_TICK }).not.toBe(1);
  });

  test('hover giữ, rời chuột chạy lại', async ({ page }, ti) => {
    test.skip(ti.project.name !== 'desktop', 'desktop');
    await enableAutoplay(page);
    await open(page);
    await page.getByTestId('slideshow-track').hover();
    await page.waitForTimeout(AFTER_TICK);
    expect(await activeIndex(page)).toBe(0);
    await expect(page.getByTestId('slideshow')).toHaveAttribute('data-playing', 'true');
    await moveMouseAway(page);
    await expect.poll(() => activeIndex(page), { timeout: AFTER_TICK }).toBe(1);
  });

  test('focus bàn phím trong block giữ, rời focus chạy lại', async ({ page }, ti) => {
    // ES1-T300: mobile ẩn next, back (docs/design/decisions.md 07/11, base.css @media max-width 47.99rem): focus nút pause (bật autoplay thì hiện) thay cho nút ẩn.
    const target = page.getByTestId(ti.project.name === 'mobile' ? 'slideshow-pause' : 'slideshow-next');
    await enableAutoplay(page);
    await open(page);
    await expect(target).toBeVisible();
    await target.focus();
    await page.waitForTimeout(AFTER_TICK);
    expect(await activeIndex(page)).toBe(0);
    await target.blur();
    await expect.poll(() => activeIndex(page), { timeout: AFTER_TICK }).toBe(1);
  });

  test('tab ẩn thì dừng', async ({ page }) => {
    await enableAutoplay(page);
    await open(page);
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { value: true, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForTimeout(AFTER_TICK);
    expect(await activeIndex(page)).toBe(0);
  });

  test('ra khỏi viewport thì dừng', async ({ page }) => {
    await enableAutoplay(page);
    await open(page);
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
    const box = await page.getByTestId('slideshow').boundingBox();
    test.skip(box!.y + box!.height > 0, 'trang chủ không đủ cao để đưa slideshow ra khỏi viewport');
    await page.waitForTimeout(AFTER_TICK);
    expect(await activeIndex(page)).toBe(0);
  });

  test('reduced-motion: không tự chạy, nút ở trạng thái play, next nhảy ngay', async ({ page }, ti) => {
    test.skip(ti.project.name === 'mobile', 'Mobile ẩn next, back theo CTO 07/11; dot kiểm ở ES1-T235');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await enableAutoplay(page);
    await open(page);
    await expect(page.getByTestId('slideshow')).toHaveAttribute('data-playing', 'false');
    await page.waitForTimeout(AFTER_TICK);
    expect(await activeIndex(page)).toBe(0);

    await page.getByTestId('slideshow-next').click();
    await expect.poll(() => activeIndex(page)).toBe(1);
    const video = page.locator('slideshow-carousel video').first();
    if ((await video.count()) > 0) {
      expect(await video.evaluate(el => (el as HTMLVideoElement).paused)).toBe(true);
    }
  });
});
