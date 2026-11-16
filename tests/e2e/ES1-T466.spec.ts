// ES1-T466 (TE-2, CTO 14/11 ES1-T458): nút pause slideshow ẩn khi JS đặt disabled (dưới 80rem, không video, TE-2 AC8).
// base.css chỉ hiện .slideshow__pause khi slideshow-carousel[data-enhanced] và nút :enabled, nên không tranh specificity
// với rule cũ [data-enhanced][data-multiple][data-autoplay='true'].
// Phần fixture: page.setContent với assets/base.css thật, không cần store. Phần store: autoplay bật bằng thuộc tính markup
// sẵn có ngay trước connectedCallback (như ES1-T30, ES1-T333), không đổi cấu hình store.
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T466.spec.ts --project=desktop
import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { watchShopPay403 } from './support/console-guard';

const BASE = readFileSync('assets/base.css', 'utf8');
const CRITICAL = readFileSync('assets/critical.css', 'utf8');

const VIEWPORTS = {
  360: { width: 360, height: 780 },
  768: { width: 768, height: 1024 },
  1280: { width: 1280, height: 800 },
} as const;

// Token mặc định (config/settings_schema.json); css-variables.liquid là nguồn thật trên store.
const TOKENS = `:root{--space-1:4px;--space-2:8px;--space-3:12px;--space-4:16px;--space-5:24px;--space-6:32px;
--page-margin:20px;--page-width:91rem;--color-background:#fff;--color-foreground:#1a1a1a;--color-border:#e5e5e5;
--color-background-dark-foreground:#fff;--radius-hero:12px}`;

type Root = { enhanced?: boolean; multiple?: boolean; autoplay?: boolean; video?: boolean; disabled: boolean };

const carousel = (id: string, { enhanced = true, multiple = true, autoplay = true, video = false, disabled }: Root) => `
<slideshow-carousel class="slideshow" data-testid="${id}" data-autoplay="${autoplay}"${enhanced ? ' data-enhanced' : ''}${multiple ? ' data-multiple' : ''}>
  <div class="slideshow__frame">
    <div class="slideshow__track">${video ? '<video muted></video>' : ''}</div>
    <div class="slideshow__controls">
      <button type="button" class="slideshow__arrow slideshow__arrow--prev" aria-label="Previous" data-testid="${id}-prev"></button>
      <button type="button" class="slideshow__arrow slideshow__arrow--next" aria-label="Next" data-testid="${id}-next"></button>
      <div class="slideshow__dots" data-testid="${id}-dots"><button type="button" class="slideshow__dot" aria-label="Slide 1"></button></div>
      <button type="button" class="slideshow__pause" aria-label="Play" data-testid="${id}-pause"${disabled ? ' disabled' : ''}></button>
    </div>
  </div>
</slideshow-carousel>`;

const FIXTURE = [
  carousel('off', { disabled: true }), // dưới 80rem, autoplay bật, không video: JS đặt disabled
  carousel('on', { disabled: false }), // từ 80rem, autoplay chạy
  carousel('video', { multiple: false, autoplay: false, video: true, disabled: false }), // 1 slide video
  carousel('nojs', { enhanced: false, disabled: false }), // slideshow.js không tải
].join('');

const mount = async (page: Page, width: keyof typeof VIEWPORTS) => {
  await page.setViewportSize(VIEWPORTS[width]);
  await page.setContent(`<!doctype html><html><head><style>${TOKENS}${CRITICAL}${BASE}</style></head><body>${FIXTURE}</body></html>`);
};

test.describe('ES1-T466 fixture base.css', () => {
  test.beforeEach(({}, ti) => test.skip(ti.project.name !== 'desktop', 'đặt viewport trong test'));

  test('rule hiện pause bám :enabled, bỏ selector autoplay/video cũ; base.css gzip trong trần tạm', () => {
    expect(BASE).toContain("slideshow-carousel[data-enhanced] .slideshow__pause:enabled {");
    expect(BASE).not.toContain("[data-autoplay='true'] .slideshow__pause");
    expect(BASE).not.toContain(':has(video) .slideshow__pause');
    // Trần tạm 53 248 B (CTO 14/11, ES1-T454) tới khi ES1-T317 merge
    expect(gzipSync(BASE).length).toBeLessThanOrEqual(53248);
  });

  for (const width of [360, 768, 1280] as const) {
    test(`${width}: disabled thì ẩn, enabled thì hiện, chưa enhanced thì ẩn`, async ({ page }) => {
      await mount(page, width);
      await expect(page.getByTestId('off-pause')).toBeHidden();
      await expect(page.getByTestId('on-pause')).toBeVisible();
      await expect(page.getByTestId('video-pause')).toBeVisible();
      await expect(page.getByTestId('nojs-pause')).toBeHidden();
    });
  }

  test('ẩn pause không đổi mũi tên, chấm theo mốc (TE-2 AC7)', async ({ page }) => {
    await mount(page, 360);
    await expect(page.getByTestId('off-dots')).toBeVisible();
    await expect(page.getByTestId('off-next')).toBeHidden();
    await mount(page, 768);
    await expect(page.getByTestId('off-next')).toBeVisible();
    await expect(page.getByTestId('off-dots')).toBeHidden();
  });
});

// ---------- Store ----------

const SPEED_SECONDS = 3; // min của setting autoplay_speed

function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  const ignore = watchShopPay403(page);
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => {
    if (m.type() !== 'error' || ignore(m)) return;
    if (/slideshow/.test(m.location().url)) errors.push(m.text());
  });
  return errors;
}

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
}

const hasVideo = async (page: Page) => (await page.locator('slideshow-carousel video').count()) > 0;

test.describe('ES1-T466 store: pause theo mốc khi autoplay bật', () => {
  test.beforeEach(({}, ti) => test.skip(ti.project.name !== 'desktop', 'đặt viewport trong test'));

  for (const width of [360, 768] as const) {
    test(`${width}: autoplay bật, không video → nút pause disabled và không hiện`, async ({ page }) => {
      const errors = trackErrors(page);
      await page.setViewportSize(VIEWPORTS[width]);
      await enableAutoplay(page);
      await open(page);
      test.skip(await hasVideo(page), 'trang chủ có video: pause điều khiển video nên hiện là đúng');
      const pause = page.getByTestId('slideshow-pause');
      await expect(pause).toBeDisabled();
      await expect(pause).toBeHidden();
      expect(await pause.boundingBox()).toBeNull();
      // Điều khiển còn lại giữ theo mốc (TE-2 AC7)
      if (width === 360) {
        await expect(page.getByTestId('slideshow-dots')).toBeVisible();
      } else {
        await expect(page.getByTestId('slideshow-next')).toBeVisible();
      }
      expect(errors).toEqual([]);
    });
  }

  test('1280: autoplay bật → nút pause hiện, bấm được', async ({ page }) => {
    const errors = trackErrors(page);
    await page.setViewportSize(VIEWPORTS[1280]);
    await enableAutoplay(page);
    await open(page);
    const pause = page.getByTestId('slideshow-pause');
    await expect(pause).toBeEnabled();
    await expect(pause).toBeVisible();
    await pause.click();
    await expect(page.getByTestId('slideshow')).toHaveAttribute('data-playing', 'false');
    await expect(pause).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('đổi cỡ 1280 → 768 → 1280: pause ẩn rồi hiện lại', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS[1280]);
    await enableAutoplay(page);
    await open(page);
    test.skip(await hasVideo(page), 'trang chủ có video: pause hiện ở mọi cỡ');
    const pause = page.getByTestId('slideshow-pause');
    await expect(pause).toBeVisible();
    await page.setViewportSize(VIEWPORTS[768]);
    await expect(pause).toBeHidden();
    await page.setViewportSize(VIEWPORTS[1280]);
    await expect(pause).toBeVisible();
  });

  test('360 có video → nút pause vẫn hiện, bấm được', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS[360]);
    await enableAutoplay(page);
    await open(page);
    test.skip(!(await hasVideo(page)), 'trang chủ store dev không có slide video (thiếu dữ liệu, không coi là đạt)');
    const pause = page.getByTestId('slideshow-pause');
    await expect(pause).toBeEnabled();
    await expect(pause).toBeVisible();
  });
});
