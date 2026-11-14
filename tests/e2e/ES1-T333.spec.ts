// Ticket ES1-T333 — TE-2-R2-BE1: assets/slideshow.js, TE-2 AC7–AC9 (autoplay chỉ từ 80rem, điều khiển theo mốc, a11y carousel).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T333.spec.ts
import { test, expect, type Page } from '@playwright/test';

const SPEED_SECONDS = 3; // min của setting autoplay_speed
const AFTER_TICK = (SPEED_SECONDS + 2) * 1000;
const TWO_TICKS = SPEED_SECONDS * 2 * 1000 + 1000;

const VIEWPORTS = {
  360: { width: 360, height: 780 },
  768: { width: 768, height: 1024 },
  1280: { width: 1280, height: 800 },
  1920: { width: 1920, height: 1080 },
} as const;

function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => {
    if (m.type() === 'error' && /slideshow/.test(m.location().url)) errors.push(m.text());
  });
  return errors;
}

// Như ES1-T30: bật autoplay bằng thuộc tính markup sẵn có ngay trước connectedCallback, không đổi cấu hình store.
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

const hasVideo = async (page: Page) => (await page.locator('slideshow-carousel video').count()) > 0;

async function moveMouseAway(page: Page) {
  await page.mouse.move(page.viewportSize()!.width / 2, 2);
}

test.describe('ES1-T333 AC8 autoplay theo mốc', () => {
  // Chỉ chạy ở project desktop, đặt viewport tường minh cho từng mốc
  test.beforeEach(({}, ti) => test.skip(ti.project.name !== 'desktop', 'đặt viewport trong test'));

  for (const width of [1280, 1920] as const) {
    test(`${width}: autoplay bật thì tự đổi slide, nút pause bật được`, async ({ page }) => {
      const errors = trackErrors(page);
      await page.setViewportSize(VIEWPORTS[width]);
      await enableAutoplay(page);
      await open(page);
      await moveMouseAway(page);
      const root = page.getByTestId('slideshow');
      const pause = page.getByTestId('slideshow-pause');
      await expect(root).toHaveAttribute('data-playing', 'true');
      await expect(pause).toBeVisible();
      await expect(pause).toBeEnabled();
      await expect(pause).toHaveAttribute('aria-label', (await root.getAttribute('data-label-pause'))!);
      await expect.poll(() => activeIndex(page), { timeout: AFTER_TICK }).toBe(1);
      expect(errors).toEqual([]);
    });
  }

  for (const width of [360, 768] as const) {
    test(`${width}: autoplay bật nhưng sau 2 lần khoảng thời gian vẫn ở slide 1`, async ({ page }) => {
      const errors = trackErrors(page);
      await page.setViewportSize(VIEWPORTS[width]);
      await enableAutoplay(page);
      await open(page);
      await moveMouseAway(page);
      await page.waitForTimeout(TWO_TICKS);
      expect(await activeIndex(page)).toBe(0);
      await expect(page.getByTestId('slideshow-live')).toHaveAttribute('aria-live', 'polite');
      if (!(await hasVideo(page))) {
        await expect(page.getByTestId('slideshow')).not.toHaveAttribute('data-playing');
        await expect(page.getByTestId('slideshow-pause')).toBeDisabled();
      }
      expect(errors).toEqual([]);
    });
  }

  test('đổi cỡ 1280 → 768 thì dừng, về 1280 thì chạy lại', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS[1280]);
    await enableAutoplay(page);
    await open(page);
    await moveMouseAway(page);
    await expect(page.getByTestId('slideshow')).toHaveAttribute('data-playing', 'true');

    await page.setViewportSize(VIEWPORTS[768]);
    await moveMouseAway(page);
    const start = await activeIndex(page);
    await page.waitForTimeout(TWO_TICKS);
    expect(await activeIndex(page), 'dưới 80rem không tự đổi').toBe(start);

    await page.setViewportSize(VIEWPORTS[1280]);
    await moveMouseAway(page);
    await expect(page.getByTestId('slideshow')).toHaveAttribute('data-playing', 'true');
    await expect.poll(() => activeIndex(page), { timeout: AFTER_TICK }).not.toBe(start);
  });

  test('1280 reduced-motion: không tự chạy, nút ở trạng thái play', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS[1280]);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await enableAutoplay(page);
    await open(page);
    const root = page.getByTestId('slideshow');
    await expect(root).toHaveAttribute('data-playing', 'false');
    await expect(page.getByTestId('slideshow-pause')).toHaveAttribute('aria-label', (await root.getAttribute('data-label-play'))!);
    await page.waitForTimeout(AFTER_TICK);
    expect(await activeIndex(page)).toBe(0);
  });
});

test.describe('ES1-T333 AC7 điều khiển theo mốc', () => {
  test.beforeEach(({}, ti) => test.skip(ti.project.name !== 'desktop', 'đặt viewport trong test'));

  test('360: chấm 44 × 44, không mũi tên; bấm chấm đổi slide, aria-current, inert', async ({ page }) => {
    const errors = trackErrors(page);
    await page.setViewportSize(VIEWPORTS[360]);
    const count = await open(page);
    await expect(page.getByTestId('slideshow-next')).toBeHidden();
    await expect(page.getByTestId('slideshow-prev')).toBeHidden();
    const dots = page.getByTestId('slideshow-dot');
    await expect(dots).toHaveCount(count);
    const box = await dots.nth(1).boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
    await expect(dots.nth(0)).toHaveAttribute('aria-current', 'true');

    await dots.nth(1).click();
    await expect.poll(() => activeIndex(page)).toBe(1);
    await expect(dots.nth(1)).toHaveAttribute('aria-current', 'true');
    await expect(dots.nth(0)).not.toHaveAttribute('aria-current');
    await expect(page.locator('[data-testid="slideshow-slide"]:not([inert])')).toHaveCount(1);
    expect(errors).toEqual([]);
  });

  for (const width of [768, 1280, 1920] as const) {
    test(`${width}: 2 nút tròn 52, không chấm; next/prev đổi slide`, async ({ page }) => {
      await page.setViewportSize(VIEWPORTS[width]);
      await open(page);
      const next = page.getByTestId('slideshow-next');
      await expect(next).toBeVisible();
      await expect(page.getByTestId('slideshow-prev')).toBeVisible();
      await expect(page.getByTestId('slideshow-dots')).toBeHidden();
      const box = await next.boundingBox();
      expect(Math.round(box!.width)).toBe(52);
      expect(Math.round(box!.height)).toBe(52);

      await next.click();
      await expect.poll(() => activeIndex(page)).toBe(1);
      await page.getByTestId('slideshow-prev').click();
      await expect.poll(() => activeIndex(page)).toBe(0);
    });
  }

  test('vuốt (cuộn track) đổi slide và cập nhật inert', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS[360]);
    await open(page);
    await page.getByTestId('slideshow-track').evaluate(el => el.scrollTo({ left: el.clientWidth, behavior: 'instant' }));
    await expect.poll(() => activeIndex(page)).toBe(1);
    await expect(page.getByTestId('slideshow-dot').nth(1)).toHaveAttribute('aria-current', 'true');
  });
});

test.describe('ES1-T333 AC9 trình đọc màn hình', () => {
  test('root region carousel có nhãn; slide group "n / tổng"; nút có tên', async ({ page }) => {
    const errors = trackErrors(page);
    const count = await open(page);
    const root = page.getByTestId('slideshow');
    await expect(root).toHaveAttribute('role', 'region');
    await expect(root).toHaveAttribute('aria-roledescription', 'carousel');
    await expect(root).toHaveAttribute('aria-label', /\S/);

    const label = (await root.getAttribute('data-label-slide'))!;
    const slides = page.getByTestId('slideshow-slide');
    for (let i = 0; i < count; i++) {
      const slide = slides.nth(i);
      await expect(slide).toHaveAttribute('role', 'group');
      await expect(slide).toHaveAttribute('aria-roledescription', 'slide');
      await expect(slide).toHaveAttribute(
        'aria-label',
        label.replace('[index]', String(i + 1)).replace('[total]', String(count)),
      );
    }

    for (const id of ['slideshow-prev', 'slideshow-next', 'slideshow-pause']) {
      await expect(page.getByTestId(id)).toHaveAttribute('aria-label', /\S/);
    }
    const dots = page.getByTestId('slideshow-dot');
    for (let i = 0; i < count; i++) {
      await expect(dots.nth(i)).toHaveAttribute('aria-label', /\S/);
    }
    expect(errors).toEqual([]);
  });

  test('connect lại (editor render lại) không nhân đôi chấm, pause vẫn disabled dưới 80rem', async ({ page }, ti) => {
    test.skip(ti.project.name !== 'mobile', 'cần dưới 80rem');
    await enableAutoplay(page);
    const count = await open(page);
    const root = page.getByTestId('slideshow');
    await root.evaluate(el => {
      const parent = el.parentElement!;
      el.remove();
      parent.append(el);
    });
    await expect(page.getByTestId('slideshow-dot')).toHaveCount(count);
    if (!(await hasVideo(page))) {
      await expect(page.getByTestId('slideshow-pause')).toBeDisabled();
    }
  });
});
