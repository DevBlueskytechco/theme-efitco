// KHÔNG CHẮC: spec chưa chạy (phiên viết không có preview, chưa type-check, CI đang tắt e2e theo CTO 06/11); scope-guard chặn dev-fe ghi tests/ → Orchestrator chép sang tests/e2e/ES1-T157.spec.ts.
// Ticket ES1-T157 TE-13-FE2: video carousel markup (TE-13 AC3, AC4; drafts/techlead/ES1-T142/task-split.md D1, D6, D7, D9, D10, D11; plan ES1-T169 D4; AC-H21 phần markup).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T157.spec.ts -g "AC3-markup|AC4-markup|nojs"
// JS của BE1 ở tests/e2e/ES1-T158.spec.ts: bấm mới chạy, lỗi video. Test "0 video" chặn file module vì module clone video khi vào khung. Video Shopify cần media-dủ-loại có video (ES1-T153): thiếu thì skip có lý do.
import { readFileSync } from 'node:fs';
import { test, expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { watchShopPay403 } from './support/console-guard';

const TE13 = '/?view=te13';
const FIGMA = '/?view=figma';
const HOME = '/';
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];
const VIDEO_REQUEST = /youtube|youtu\.be|vimeo|\.mp4|\.m3u8|\.webm/i;

const band = (page: Page, id: string) => page.getByTestId(`container-${id}`);
const card = (page: Page, id: string) => page.locator(`[data-video-card-id="${id}"]`);

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

/** Nội dung thẻ template không nằm trong DOM thường nên đọc qua .content. */
function templateInfo(scope: Locator) {
  return scope.getByTestId('video-card-template').evaluate((el) => {
    const content = (el as HTMLTemplateElement).content;
    const video = content.querySelector('video');
    const iframe = content.querySelector('iframe');
    return {
      video: video
        ? {
            autoplay: video.hasAttribute('autoplay'),
            muted: video.hasAttribute('muted'),
            controls: video.hasAttribute('controls'),
            playsinline: video.hasAttribute('playsinline'),
            preload: video.getAttribute('preload'),
            poster: video.hasAttribute('poster'),
            sources: [...content.querySelectorAll('source')].map((s) => s.getAttribute('src')),
          }
        : null,
      iframe: iframe ? { src: iframe.getAttribute('src'), title: iframe.getAttribute('title'), allow: iframe.getAttribute('allow') } : null,
    };
  });
}

test.describe('ES1-T157 tĩnh', () => {
  test('AC3-markup template: 8 video-card ngay sau featured-product, ở cả index và index.figma', () => {
    for (const file of ['templates/index.liquid', 'templates/index.figma.liquid']) {
      const names = [...readFileSync(file, 'utf8').matchAll(/\{%-?\s*block\s+'([a-z-]+)'/g)]
        .map((m) => m[1])
        .filter((name) => name !== 'container');
      const start = names.indexOf('video-carousel');
      expect(names[start - 1], file).toBe('featured-product');
      expect(names.slice(start + 1, start + 10), file).toEqual([...Array(8).fill('video-card'), 'testimonials']);
    }
  });

  test('AC3-markup 0 JS để cuộn, 0 autoplay ngoài URL embed; CSS: 0 màu literal, 0 thuộc tính vật lý', () => {
    const cardSource = readFileSync('blocks/video-card.liquid', 'utf8');
    expect(cardSource).not.toMatch(/<video[^>]*\s(autoplay|muted|poster)/);
    expect(cardSource).not.toMatch(/https:\/\/www\.youtube\.com\/embed/);

    const css = readFileSync('assets/base.css', 'utf8');
    const start = css.indexOf('/** Video carousel (TE-13');
    const end = css.indexOf('/** Gift card template */');
    expect(start).toBeGreaterThan(0);
    const section = css.slice(start, end).replace(/\/\*[\s\S]*?\*\//g, '');
    expect(section).not.toMatch(/#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(/i);
    expect(section).not.toMatch(/(^|[\s;{])(left|right|top|bottom|margin-left|margin-right|padding-left|padding-right)\s*:/m);
  });
});

test.describe('ES1-T157 TE-13 video carousel', () => {
  test('AC3-markup bộ 8 thẻ đúng 8; thẻ không nguồn không render; band không nguồn không có', async ({ page }) => {
    const errors = watchConsole(page);
    await page.goto(TE13);
    await expect(band(page, 'te13-video').getByTestId('video-card')).toHaveCount(8);
    await expect(band(page, 'te13-video-mixed').getByTestId('video-card')).toHaveCount(1);
    await expect(band(page, 'te13-video-empty')).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test('AC3-markup 3 ô số liệu đúng text, ô thiếu value ẩn; copy, link, danh sách cuộn được bằng phím', async ({ page }) => {
    await page.goto(TE13);
    const carousel = band(page, 'te13-video').getByTestId('video-carousel');
    const stats = carousel.getByTestId('video-carousel-stat');
    await expect(stats).toHaveCount(3);
    await expect(stats.nth(0)).toContainText('360+');
    await expect(stats.nth(0)).toContainText('How-to reels');
    await expect(stats.nth(1)).toContainText('1:15');
    await expect(stats.nth(1)).toContainText('Average length');
    await expect(stats.nth(2)).toContainText('4K');
    await expect(stats.nth(2)).toContainText('Shot in studio');
    await expect(band(page, 'te13-video-mixed').getByTestId('video-carousel-stat')).toHaveCount(1);

    await expect(carousel.getByTestId('video-carousel-eyebrow')).toHaveText('Video demo');
    await expect(carousel.getByTestId('video-carousel-heading')).toHaveText('See Real Equipment In Action, Before You Buy');
    await expect(carousel.getByTestId('video-carousel-subheading')).toHaveText('Short vertical demos. See it move before you buy.');
    await expect(carousel.getByTestId('video-carousel-link')).toHaveText('View Preset Bundles');

    const list = carousel.getByTestId('video-carousel-list');
    await expect(list).toHaveAttribute('tabindex', '0');
    await expect(list).toHaveAttribute('aria-label', /.+/);
    const snap = await list.evaluate((el) => getComputedStyle(el).scrollSnapType);
    expect(snap).toContain('x');
  });

  test('AC3-markup 0 video, 0 iframe ngoài template; 0 request video khi tải và cuộn hết trang', async ({ page }) => {
    const requests: string[] = [];
    page.on('request', (request) => {
      if (VIDEO_REQUEST.test(request.url())) requests.push(request.url());
    });
    await page.route(/\/video-carousel\.js/, (route) => route.abort());
    await page.goto(TE13);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForLoadState('load');

    await expect(page.locator('video-card video, video-card iframe')).toHaveCount(0);
    expect(requests).toEqual([]);
  });

  test('AC3-markup poster lazy, alt rỗng; template không autoplay, host embed đúng, iframe có title', async ({ page }) => {
    await page.goto(TE13);
    const scope = band(page, 'te13-video');
    const images = scope.getByTestId('video-card-poster').locator('img');
    const count = await images.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i += 1) {
      await expect(images.nth(i)).toHaveAttribute('loading', 'lazy');
      await expect(images.nth(i)).toHaveAttribute('alt', '');
    }

    const cards = scope.getByTestId('video-card');
    for (let i = 0; i < 8; i += 1) {
      const info = await templateInfo(cards.nth(i));
      if (info.iframe) {
        expect(info.iframe.src).toMatch(/^https:\/\/(www\.youtube-nocookie\.com\/embed\/|player\.vimeo\.com\/video\/)[^?]+\?autoplay=1/);
        expect(info.iframe.title).toBeTruthy();
        expect(info.iframe.allow).toContain('autoplay');
      }
      if (info.video) {
        expect(info.video).toMatchObject({ autoplay: false, muted: false, poster: false, controls: true, playsinline: true, preload: 'metadata' });
      }
    }
  });

  test('AC3-markup video Shopify: template có source, thắng video_url (TE13_VIDEO_READY)', async ({ page }) => {
    await page.goto(TE13);
    const first = card(page, 'te13-video-1').getByTestId('video-card');
    const kind = await first.getAttribute('data-video-kind');
    test.skip(kind !== 'shopify', 'media-dủ-loại chưa có video Shopify (ES1-T153, TE13_VIDEO_READY)');
    const info = await templateInfo(first);
    expect(info.iframe).toBeNull();
    expect(info.video?.sources.length).toBeGreaterThan(0);
  });

  test('AC3-markup hook BE1: kind, label lỗi, product url; badge chỉ có khi có setting', async ({ page }) => {
    await page.goto(TE13);
    const youtube = card(page, 'te13-video-2').getByTestId('video-card');
    await expect(youtube).toHaveAttribute('data-video-kind', 'external');
    await expect(youtube).toHaveAttribute('data-label-error', /.+/);
    await expect(youtube).toHaveAttribute('data-product-url', /\/products\//);
    await expect(youtube.locator('[data-video-poster]')).toHaveCount(1);
    await expect(youtube.locator('[data-video-template]')).toHaveCount(1);
    await expect(youtube.getByTestId('video-card-badge')).toHaveText('Dumbbells');
    await expect(youtube.getByTestId('video-card-play').locator('svg')).toHaveAttribute('aria-hidden', 'true');

    const noProduct = card(page, 'te13-video-4').getByTestId('video-card');
    await expect(noProduct).not.toHaveAttribute('data-product-url', /.*/);
    await expect(noProduct.getByTestId('video-card-product')).toHaveCount(0);
    await expect(noProduct.getByTestId('video-card-badge')).toHaveCount(0);
  });

  test('AC4-markup khung giữ tỉ lệ 264 / 470 và nền tối khi không có poster', async ({ page }) => {
    await page.goto(TE13);
    const frame = card(page, 'te13-video-4').getByTestId('video-card-frame');
    await expect(frame.locator('img')).toHaveCount(0);
    const box = await frame.boundingBox();
    expect(box).not.toBeNull();
    expect(Math.abs(box!.width / box!.height - 264 / 470)).toBeLessThan(0.01);
    const colors = await frame.evaluate((el) => {
      const probe = document.createElement('div');
      probe.style.backgroundColor = 'var(--color-background-dark)';
      el.appendChild(probe);
      const expected = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return { actual: getComputedStyle(el).backgroundColor, expected };
    });
    expect(colors.actual).toBe(colors.expected);
  });

  test('AC4-markup hàng sản phẩm: ảnh tròn lazy, tên là link, giá', async ({ page }) => {
    await page.goto(TE13);
    const row = card(page, 'te13-video-2').getByTestId('video-card-product');
    const image = row.getByTestId('video-card-product-image').locator('img');
    await expect(image).toHaveAttribute('loading', 'lazy');
    await expect(row.getByTestId('video-card-product-title')).toHaveAttribute('href', /\/products\//);
    await expect(row.getByTestId('price')).toHaveCount(1);
  });

  test('AC3-markup axe 0 serious, 0 console error trên /?view=te13', async ({ page }) => {
    const errors = watchConsole(page);
    await page.goto(TE13);
    const { violations } = await new AxeBuilder({ page }).analyze();
    const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious.map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
    expect(errors).toEqual([]);
  });

  test('AC3-markup trang chủ chưa cấu hình: không có video carousel, không có band rỗng', async ({ page }) => {
    await page.goto(HOME);
    await expect(band(page, 'home-video-carousel')).toHaveCount(0);
    await expect(page.getByTestId('video-carousel')).toHaveCount(0);
  });
});

test.describe('ES1-T157 AC-H21 phần markup trên /?view=figma', () => {
  test.use({ viewport: { width: 1920, height: 1080 } });
  test.skip(({ isMobile }) => isMobile, 'Figma chỉ có 1920');

  test('AC3-markup 6 thẻ 264 x 554, copy 1:817, không có số liệu, link, nhãn', async ({ page }) => {
    await page.goto(FIGMA);
    const scope = band(page, 'figma-video-carousel');
    const cards = scope.getByTestId('video-card');
    await expect(cards).toHaveCount(6);
    await expect(scope.getByTestId('video-carousel-eyebrow')).toHaveText('Video demo');
    await expect(scope.getByTestId('video-carousel-heading')).toHaveText('See Real Equipment In Action, Before You Buy');
    for (const id of ['video-carousel-stat', 'video-carousel-link', 'video-carousel-subheading', 'video-card-badge']) {
      await expect(scope.getByTestId(id), id).toHaveCount(0);
    }
    const first = await cards.first().boundingBox();
    expect(Math.round(first!.width)).toBe(264);
    // Tên dài hơn 1 dòng không đổi cao vì tên cắt 1 dòng; thiếu product thì thẻ chỉ cao 470.
    expect(Math.round(first!.height)).toBe(554);
    const frame = await cards.first().getByTestId('video-card-frame').boundingBox();
    expect(Math.round(frame!.height)).toBe(470);
  });
});

test.describe('ES1-T157 nojs', () => {
  test.use({ javaScriptEnabled: false });

  test('nojs poster là link tới đúng href', async ({ page }) => {
    await page.goto(TE13);
    await expect(card(page, 'te13-video-2').getByTestId('video-card-poster')).toHaveAttribute(
      'href',
      /^https:\/\/www\.youtube\.com\/watch\?v=.+/,
    );
    await expect(card(page, 'te13-video-3').getByTestId('video-card-poster')).toHaveAttribute('href', /^https:\/\/vimeo\.com\/.+/);

    const first = card(page, 'te13-video-1').getByTestId('video-card');
    const kind = await first.getAttribute('data-video-kind');
    test.skip(kind !== 'shopify', 'media-dủ-loại chưa có video Shopify (ES1-T153, TE13_VIDEO_READY)');
    await expect(first.getByTestId('video-card-poster')).toHaveAttribute('href', /\/products\//);
  });

  test('nojs hàng sản phẩm bấm được', async ({ page }) => {
    await page.goto(TE13);
    const title = card(page, 'te13-video-2').getByTestId('video-card-product-title');
    const href = await title.getAttribute('href');
    expect(href).toMatch(/\/products\//);
    await title.click();
    await expect(page).toHaveURL(/\/products\//);
  });

  test('nojs cuộn ngang được', async ({ page }) => {
    await page.goto(TE13);
    const list = band(page, 'te13-video').getByTestId('video-carousel-list');
    const before = await list.evaluate((el) => {
      el.scrollLeft = 500;
      return { scrollLeft: el.scrollLeft, canScroll: el.scrollWidth > el.clientWidth };
    });
    expect(before.canScroll).toBe(true);
    expect(before.scrollLeft).toBeGreaterThan(0);
    const [scrollWidth, clientWidth] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });
});
