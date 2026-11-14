// KHÔNG CHẮC: chưa chạy trên store (phiên QA không có PREVIEW_URL/STORE_PASSWORD), mới type-check bằng `playwright test --list`; chờ CI store-tests của PR, không báo đạt.
// ES1-T192 (TE-16-QA1): blog posts trang chủ, hàng 14 Figma 1:1022. Nguồn: docs/srs.md#TE-16 (SRS 0.5: AC1, AC-H26, AC-H27, D8), AC-H7, AC-H35 phần hàng 14.
// Test case: drafts/qa/ES1-T192/test-cases.md (TC-xx trong tên test).
// Tên file theo ticket (tests/e2e/TE-16.spec.ts). Gộp spec dev tests/e2e/ES1-T191.spec.ts theo ticket ("Gộp spec dev ES1-T191"): test cũ còn đúng SRS 0.5
// chuyển sang đây, test "2 bài ở 1280" đổi sang 292 × 389 theo TE-16 AC1 (drafts/dev-fe/ES1-T334/spec-updates.md §5); file cũ xoá để không trùng.
// Dữ liệu: blog figma-blog 5 bài (fixture ES1-T331, BA ES1-T173 §3.6). Bài biên (te16-edge, te16-zero) chưa có: test skip có lý do.
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/TE-16.spec.ts (project desktop + mobile Pixel 7).
import { test, expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { gotoStore } from './support/store-guard';
import { watchShopPay403 } from './support/console-guard';

const FIGMA = '/?view=figma';
const TE16 = '/?view=te16';
const TOL = 2; // SRS 0.5, ES1-T309 #4: lệch ≤ 2 px
const IGNORE_CONSOLE = [/shopifycloud|monorail|otlp-http|web-pixels|trekkie|shop\.app|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];
const NO_DATA = 'store chưa có blog figma-blog đủ bài (ES1-T178, fixture ES1-T331)';
const NO_EDGE = 'store chưa có blog te16-edge (4 bài biên) / te16-zero (0 bài) và band trong templates/index.te16.liquid (ES1-T460 dữ liệu, ES1-T459 band)';
const LIST_LABEL = 'Blog articles';

// BA drafts/ba/ES1-T173/home-content.md §3.6: số từ biết trước, D8 200 từ/phút làm tròn lên.
const ARTICLES: Record<string, { title: string; tag: string; words: number; readTime: string }> = {
  'figma-stretch-after-training': { title: 'How to stretch properly after training', tag: 'Exercises', words: 400, readTime: '2 min read' },
  'figma-home-gym-15m2': { title: 'Set up a perfect home gym in just 15m²', tag: 'Featured', words: 1000, readTime: '5 min read' },
  'figma-choose-adjustable-dumbbell': { title: 'How to choose the right adjustable dumbbell', tag: 'Articles', words: 1200, readTime: '6 min read' },
  'figma-eat-before-after-session': { title: 'What to eat before and after a heavy session', tag: 'Diet plans', words: 1400, readTime: '7 min read' },
  'figma-rubber-vs-urethane': { title: 'Rubber vs urethane: which plates last longer', tag: 'Diet plans', words: 1000, readTime: '5 min read' },
};

// TE-16 AC1, AC-H26: hàng ngang ≥ 5 bài (cao = rộng × 4/3).
const ROW = [
  { width: 360, height: 800, card: [252, 336] },
  { width: 768, height: 1024, card: [307, 410] },
  { width: 1280, height: 800, card: [271, 361] },
  { width: 1920, height: 1080, card: [336, 448] },
] as const;
// TE-16 AC1: ≤ 4 bài từ 80rem là lưới tĩnh 4 cột.
const GRID = [
  { width: 1280, height: 800, card: [292, 389] },
  { width: 1920, height: 1080, card: [336, 448] },
] as const;

type Box = { left: number; right: number; top: number; bottom: number; width: number; height: number };

const band = (page: Page, id: string) => page.getByTestId(`container-${id}`);
const readMinutes = (words: number) => Math.ceil(words / 200);

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

async function noHorizontalOverflow(page: Page, label: string) {
  const [scrollWidth, clientWidth] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  expect(scrollWidth, `${label}: trang tràn ngang`).toBeLessThanOrEqual(clientWidth);
}

/** Đo trong 1 lần evaluate, không boundingBox qua nhiều lần cuộn (ES1-T172). */
async function boxes(locator: Locator): Promise<Box[]> {
  return locator.evaluateAll((els) =>
    els.map((el) => {
      const r = el.getBoundingClientRect();
      return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height };
    }),
  );
}

function expectSize(box: Box, [width, height]: readonly [number, number], label: string) {
  expect(Math.abs(box.width - width), `${label} rộng ${box.width.toFixed(1)}, cần ${width}`).toBeLessThanOrEqual(TOL);
  expect(Math.abs(box.height - height), `${label} cao ${box.height.toFixed(1)}, cần ${height}`).toBeLessThanOrEqual(TOL);
}

const intersects = (a: Box, b: Box) => a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5;

async function skipWithoutArticles(page: Page, cards: Locator, need: number) {
  const count = await cards.count();
  test.skip(count < need, `${NO_DATA}: có ${count}, cần ${need}, trang ${page.url()}`);
}

async function skipWithoutEdge(page: Page) {
  test.skip((await band(page, 'te16-edge').count()) === 0, NO_EDGE);
}

function cardByHandle(scope: Locator, handle: string) {
  return scope.getByTestId('article-card').filter({ has: scope.page().locator(`[data-testid="article-card-link"][href$="/${handle}"]`) });
}

/** Có JS: module scroll-buttons nạp lười khi band vào màn; chờ data-enhanced. */
async function waitEnhanced(root: Locator) {
  await root.scrollIntoViewIfNeeded();
  await expect(root.getByTestId('blog-posts')).toHaveAttribute('data-enhanced', '');
}

async function handlesOf(cards: Locator) {
  return cards.getByTestId('article-card-link').evaluateAll((els) => els.map((el) => (el.getAttribute('href') ?? '').split('?')[0].split('/').pop()));
}

/** TC-12–TC-14, TC-01 (cỡ), TC-23: bảng hàng ngang dùng chung cho có JS và không JS. */
async function checkRow(page: Page, js: boolean) {
  const root = band(page, 'figma-blog-posts');
  const cards = root.getByTestId('article-card');
  await skipWithoutArticles(page, cards, 5);
  await expect(cards).toHaveCount(5);
  const list = root.getByTestId('blog-posts-list');
  for (const { width, height, card } of ROW) {
    const label = `${js ? 'JS' : 'không JS'} ${width}`;
    await page.setViewportSize({ width, height });
    if (js) await waitEnhanced(root);
    const all = await boxes(cards);
    expectSize(all[0], card, `${label} card 1`);
    const state = await list.evaluate((el) => ({
      display: getComputedStyle(el).display,
      overflowX: getComputedStyle(el).overflowX,
      scrollable: el.scrollWidth > el.clientWidth,
    }));
    expect(state, label).toEqual({ display: 'flex', overflowX: 'auto', scrollable: true });
    await expect(list).toHaveAttribute('tabindex', '0');
    await expect(list).toHaveAttribute('aria-label', LIST_LABEL);
    if (width === 360) expect(all[1].left, `${label}: thấy mép card kế`).toBeLessThan(360);
    if (width === 1280) expect(1280 - all[4].left, `${label}: thấy ≥ 25% card 5`).toBeGreaterThanOrEqual(all[4].width * 0.25);
    const nav = root.getByTestId('blog-posts-nav');
    const progress = root.getByTestId('carousel-progress');
    if (!js) {
      await expect(nav, `${label}: không JS không nút`).toBeHidden();
      await expect(progress, `${label}: không JS không tiến trình`).toBeHidden();
    } else if (width === 360) {
      await expect(nav, `${label}: 360 không nút`).toBeHidden();
      await expect(progress, `${label}: 360 có tiến trình`).toBeVisible();
    } else {
      await expect(root.getByTestId('blog-posts-next'), `${label}: có nút next`).toBeVisible();
      await expect(progress, `${label}: có tiến trình`).toBeVisible();
    }
    await noHorizontalOverflow(page, label);
  }
}

/** TC-06, TC-23: 2 bài (articles_to_show 2) từ 80rem là lưới tĩnh 4 cột, cỡ card không giãn. */
async function checkGrid(page: Page, id: string, count: number) {
  const root = band(page, id);
  const cards = root.getByTestId('article-card');
  await expect(cards).toHaveCount(count);
  const list = root.getByTestId('blog-posts-list');
  for (const { width, height, card } of GRID) {
    await page.setViewportSize({ width, height });
    await expect(list).toHaveCSS('display', 'grid');
    for (const [i, box] of (await boxes(cards)).entries()) expectSize(box, card, `${id} ${width} card ${i + 1}`);
    await expect(root.getByTestId('blog-posts-nav')).toBeHidden();
    await expect(root.getByTestId('carousel-progress')).toBeHidden();
    await noHorizontalOverflow(page, `${id} ${width}`);
  }
}

/** TC-21, TC-22: Tab vào danh sách, mũi tên cuộn, card focus được. */
async function checkKeyboard(page: Page) {
  await page.setViewportSize({ width: 1920, height: 1080 });
  const root = band(page, 'figma-blog-posts');
  await skipWithoutArticles(page, root.getByTestId('article-card'), 5);
  const list = root.getByTestId('blog-posts-list');
  await root.scrollIntoViewIfNeeded();
  // Điểm xuất phát ngay trước danh sách: h2 của band (tabindex -1 chỉ để đặt focus, không nằm trong thứ tự Tab).
  await root.getByTestId('blog-posts-heading').evaluate((el) => {
    el.setAttribute('tabindex', '-1');
    (el as HTMLElement).focus();
  });
  let reached = false;
  for (let i = 0; i < 3 && !reached; i++) {
    await page.keyboard.press('Tab');
    reached = await list.evaluate((el) => el === document.activeElement);
  }
  expect(reached, 'Tab từ h2 tới blog-posts-list trong ≤ 3 lần').toBe(true);
  for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowRight');
  await expect.poll(() => list.evaluate((el) => el.scrollLeft), { message: 'phím mũi tên cuộn danh sách' }).toBeGreaterThan(0);
  await page.keyboard.press('Tab');
  const focused = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    return { testid: el?.dataset.testid, inList: !!el?.closest('[data-testid="blog-posts-list"]'), outline: el ? getComputedStyle(el).outlineStyle : 'none' };
  });
  expect(focused).toEqual({ testid: 'article-card-link', inList: true, outline: expect.not.stringMatching(/^none$/) });
}

test.describe('TE-16 tĩnh', () => {
  test('TC-27 AC-H26: blog-posts đứng ngay trước faq ở index và index.figma', () => {
    for (const file of ['templates/index.liquid', 'templates/index.figma.liquid']) {
      const names = [...readFileSync(file, 'utf8').matchAll(/\{%-?\s*block\s+'([a-z-]+)'/g)].map((m) => m[1]).filter((name) => name !== 'container');
      expect(names[names.indexOf('faq') - 1], file).toBe('blog-posts');
    }
  });

  // CTO 09/11 (ES1-T250): blog chuyển bằng next, back. Block chỉ nạp scroll-buttons qua lazy-module; card 0 JS.
  test('TC-28 AC-H26: JS chỉ scroll-buttons qua lazy-module; CSS blog 0 màu literal, 0 thuộc tính vật lý', () => {
    const block = readFileSync('blocks/blog-posts.liquid', 'utf8');
    expect(block.match(/<script[^>]*>/g)).toEqual([`<script src="{{ 'lazy-module.js' | asset_url }}" type="module">`]);
    expect(block.match(/data-lazy-module="[^"]*"/g)).toEqual([`data-lazy-module="{{ 'scroll-buttons.js' | asset_url }}"`]);
    expect(readFileSync('snippets/article-card.liquid', 'utf8')).not.toMatch(/<script|data-lazy-module/);
    const css = readFileSync('assets/base.css', 'utf8');
    const start = css.indexOf('/** Blog posts (TE-16');
    const end = css.indexOf('/** Testimonials (TE-7', start);
    expect(start).toBeGreaterThan(0);
    const section = css.slice(start, end).replace(/\/\*[\s\S]*?\*\//g, '');
    expect(section).not.toMatch(/#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(/i);
    expect(section).not.toMatch(/(^|[\s;{])(left|right|top|bottom|margin-(left|right|top|bottom)|padding-(left|right|top|bottom))\s*:/);
  });

  test('TC-11 AC-H27 D8: 200 từ/phút làm tròn lên, ẩn dòng khi 0 phút, locale có one và other', () => {
    const snippet = readFileSync('snippets/article-card.liquid', 'utf8');
    expect(snippet).toMatch(/word_count\s*\|\s*plus:\s*199\s*\|\s*divided_by:\s*200/);
    expect(snippet).toMatch(/\{%-?\s*if read_minutes > 0\s*-?%\}[\s\S]*article-card-read-time[\s\S]*\{%-?\s*endif/);
    const locale = JSON.parse(readFileSync('locales/en.default.json', 'utf8'));
    const readTime = locale.blocks.blog_posts.read_time;
    expect(readTime.one).toContain('{{ count }}');
    expect(readTime.other).toContain('{{ count }}');
    // Bảng BA: công thức ra đúng số Figma.
    for (const article of Object.values(ARTICLES)) expect(`${readMinutes(article.words)} min read`).toBe(article.readTime);
  });
});

test.describe('TE-16 có JS, 5 bài (figma-blog)', () => {
  test('TC-01, TC-02, TC-08 AC-H26, AC-H27: 1920 5 card 336 × 448, ảnh, nhãn, tiêu đề, thời gian đọc đúng D8; 0 console error', async ({ page }) => {
    const errors = watchConsole(page);
    await page.setViewportSize({ width: 1920, height: 1080 });
    await gotoStore(page, FIGMA);
    const root = band(page, 'figma-blog-posts');
    const cards = root.getByTestId('article-card');
    await skipWithoutArticles(page, cards, 5);
    await expect(cards).toHaveCount(5);
    await expect(root.getByTestId('blog-posts-eyebrow')).toHaveText('From the Efitco blog');
    await expect(root.getByTestId('blog-posts-heading')).toHaveText('Training Tips & Inspiration');
    for (const [i, box] of (await boxes(cards)).entries()) expectSize(box, [336, 448], `1920 card ${i + 1}`);

    expect((await handlesOf(cards)).sort()).toEqual(Object.keys(ARTICLES).sort());
    for (const [handle, article] of Object.entries(ARTICLES)) {
      const card = cardByHandle(root, handle);
      await expect(card, handle).toHaveCount(1);
      const img = card.getByTestId('article-card-image').locator('img');
      await expect(img, `${handle}: có ảnh`).toHaveCount(1);
      await expect(img).toHaveAttribute('src', /.+/);
      await expect(img).toHaveAttribute('alt', '');
      await expect(img).toHaveAttribute('loading', 'lazy');
      await expect(card.getByTestId('article-card-tag')).toHaveText(article.tag);
      await expect(card.getByTestId('article-card-title')).toHaveText(article.title);
      await expect(card.getByTestId('article-card-read-time')).toHaveText(article.readTime);
    }
    expect(errors).toEqual([]);
  });

  test('TC-03 AC-H26: card link tới đúng bài', async ({ page }) => {
    await gotoStore(page, FIGMA);
    const root = band(page, 'figma-blog-posts');
    const cards = root.getByTestId('article-card');
    await skipWithoutArticles(page, cards, 5);
    for (const handle of Object.keys(ARTICLES)) {
      await expect(cardByHandle(root, handle).getByTestId('article-card-link')).toHaveAttribute('href', new RegExp(`/blogs/figma-blog/${handle}(\\?.*)?$`));
    }
    const first = cards.first().getByTestId('article-card-link');
    const href = (await first.getAttribute('href'))!.split('?')[0];
    await first.scrollIntoViewIfNeeded();
    await Promise.all([page.waitForURL((url) => url.pathname.endsWith(href)), first.click()]);
    await expect(page.getByTestId('article-content')).toBeVisible();
  });

  test('TC-04 AC-H26: 1920 hàng tràn thì cuộn được, card 5 vào khung khi cuộn hết, trang không tràn ngang', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await gotoStore(page, FIGMA);
    const root = band(page, 'figma-blog-posts');
    const cards = root.getByTestId('article-card');
    await skipWithoutArticles(page, cards, 5);
    const list = root.getByTestId('blog-posts-list');
    await expect(list).toHaveCSS('overflow-x', 'auto');
    const [listBox] = await boxes(list);
    const before = await boxes(cards);
    expect(before[4].right, 'card 5 vượt mép phải danh sách').toBeGreaterThan(listBox.right);
    await list.evaluate((el) => el.scrollTo({ left: el.scrollWidth, behavior: 'instant' }));
    await expect.poll(async () => (await boxes(cards))[4].right, { message: 'card 5 vào khung sau khi cuộn hết' }).toBeLessThanOrEqual(listBox.right + 1);
    await noHorizontalOverflow(page, '1920');
  });

  test('TC-05 AC-H26: bấm next cuộn hàng, prev hiện sau khi cuộn', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await gotoStore(page, FIGMA);
    const root = band(page, 'figma-blog-posts');
    await skipWithoutArticles(page, root.getByTestId('article-card'), 5);
    await waitEnhanced(root);
    const list = root.getByTestId('blog-posts-list');
    const next = root.getByTestId('blog-posts-next');
    await expect(next).toBeVisible();
    await expect(next).toHaveAttribute('aria-label', 'Next articles');
    await next.click();
    await expect.poll(() => list.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
    await expect(root.getByTestId('blog-posts-prev')).toBeVisible();
    await expect(root.getByTestId('blog-posts-prev')).toHaveAttribute('aria-label', 'Previous articles');
  });

  test('TC-12, TC-13, TC-14 AC1: 360 / 768 / 1280 / 1920 cỡ card, mép card kế, nút, tiến trình, không tràn ngang', async ({ page }) => {
    await gotoStore(page, FIGMA);
    await checkRow(page, true);
  });

  test('TC-13 AC1: 768 nút tròn 52, nhãn đúng', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await gotoStore(page, FIGMA);
    const root = band(page, 'figma-blog-posts');
    await skipWithoutArticles(page, root.getByTestId('article-card'), 5);
    await waitEnhanced(root);
    const next = root.getByTestId('blog-posts-next');
    await expect(next).toHaveAttribute('aria-label', 'Next articles');
    await expect(root.getByTestId('blog-posts-prev')).toHaveAttribute('aria-label', 'Previous articles');
    const [box] = await boxes(next);
    expectSize(box, [52, 52], '768 nút next');
  });

  test('TC-16 AC1: tiêu đề hiện đủ, không cắt, không "…" ở 4 mốc', async ({ page }) => {
    await gotoStore(page, FIGMA);
    const titles = band(page, 'figma-blog-posts').getByTestId('article-card-title');
    await skipWithoutArticles(page, band(page, 'figma-blog-posts').getByTestId('article-card'), 5);
    for (const { width, height } of ROW) {
      await page.setViewportSize({ width, height });
      const states = await titles.evaluateAll((els) =>
        els.map((el) => {
          const s = getComputedStyle(el);
          return { text: el.textContent ?? '', clipped: el.scrollHeight > el.clientHeight + 1, ellipsis: s.textOverflow === 'ellipsis', clamp: s.getPropertyValue('-webkit-line-clamp') };
        }),
      );
      for (const s of states) {
        expect(s.text, `${width}`).not.toContain('…');
        expect(s.clipped, `${width} ${s.text}: bị cắt`).toBe(false);
        expect(s.ellipsis, `${width} ${s.text}`).toBe(false);
        expect(['none', ''], `${width} ${s.text}: line-clamp`).toContain(s.clamp);
      }
    }
  });

  test('TC-26 AC-H35: 360, 768 không chồng chữ trong card và header, nút ≥ 44', async ({ page }) => {
    await gotoStore(page, FIGMA);
    const root = band(page, 'figma-blog-posts');
    const cards = root.getByTestId('article-card');
    await skipWithoutArticles(page, cards, 5);
    for (const { width, height } of ROW.filter((r) => r.width <= 768)) {
      await page.setViewportSize({ width, height });
      await waitEnhanced(root);
      const overlaps = await cards.evaluateAll((els) =>
        els.map((card) => {
          const r = (id: string) => {
            const b = card.querySelector(`[data-testid="${id}"]`)?.getBoundingClientRect();
            return b ? { left: b.left, right: b.right, top: b.top, bottom: b.bottom, width: b.width, height: b.height } : null;
          };
          return { tag: r('article-card-tag'), title: r('article-card-title'), time: r('article-card-read-time') };
        }),
      );
      for (const [i, o] of overlaps.entries()) {
        if (o.tag && o.title) expect(intersects(o.tag, o.title), `${width} card ${i + 1}: tag chồng tiêu đề`).toBe(false);
        if (o.title && o.time) expect(intersects(o.title, o.time), `${width} card ${i + 1}: tiêu đề chồng thời gian đọc`).toBe(false);
      }
      const [heading] = await boxes(root.getByTestId('blog-posts-heading'));
      const [eyebrow] = await boxes(root.getByTestId('blog-posts-eyebrow'));
      expect(intersects(eyebrow, heading), `${width}: eyebrow chồng h2`).toBe(false);
      if (width >= 768) {
        for (const id of ['blog-posts-prev', 'blog-posts-next']) {
          const [btn] = await boxes(root.getByTestId(id));
          expect(intersects(btn, heading), `${width}: ${id} chồng h2`).toBe(false);
          expect(Math.min(btn.width, btn.height), `${width}: ${id} ≥ 44`).toBeGreaterThanOrEqual(44);
        }
      }
    }
  });

  test('TC-20 AC-H26: mất mạng ảnh, card giữ khung 336 × 448, chữ vẫn hiện, nền tối', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));
    await page.route('**/*', (route) => (route.request().resourceType() === 'image' ? route.abort() : route.continue()));
    await page.setViewportSize({ width: 1920, height: 1080 });
    await gotoStore(page, FIGMA);
    const root = band(page, 'figma-blog-posts');
    const cards = root.getByTestId('article-card');
    await skipWithoutArticles(page, cards, 5);
    await root.scrollIntoViewIfNeeded();
    for (const [i, box] of (await boxes(cards)).entries()) expectSize(box, [336, 448], `mất ảnh card ${i + 1}`);
    await expect(cards.first().getByTestId('article-card-title')).toBeVisible();
    await expect(cards.first().getByTestId('article-card-read-time')).toBeVisible();
    const bg = await cards.getByTestId('article-card-link').evaluateAll((els) => els.map((el) => getComputedStyle(el).backgroundColor));
    for (const color of bg) expect(color, 'nền card khi không có ảnh').not.toBe('rgba(0, 0, 0, 0)');
    expect(pageErrors).toEqual([]);
  });

  test('TC-21 AC-H26: bàn phím Tab vào danh sách, mũi tên cuộn, card focus được', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Pixel 7 không có bàn phím vật lý; kiểm ở project desktop');
    await gotoStore(page, FIGMA);
    await waitEnhanced(band(page, 'figma-blog-posts')).catch(() => undefined);
    await checkKeyboard(page);
  });

  test('TC-24 AC-H26: cây a11y: list "Blog articles" 5 mục, mỗi card 1 link mang tên bài', async ({ page }) => {
    await gotoStore(page, FIGMA);
    const root = band(page, 'figma-blog-posts');
    const cards = root.getByTestId('article-card');
    await skipWithoutArticles(page, cards, 5);
    const list = root.getByRole('list', { name: LIST_LABEL });
    await expect(list).toHaveCount(1);
    await expect(list.getByRole('listitem')).toHaveCount(5);
    for (const [handle, article] of Object.entries(ARTICLES)) {
      const links = cardByHandle(root, handle).getByRole('link');
      await expect(links, handle).toHaveCount(1);
      await expect(links).toHaveAccessibleName(new RegExp(article.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    }
  });

  test('TC-25 AC-H7: axe 0 serious trong band ở /?view=figma và /?view=te16', async ({ page }) => {
    for (const [path, id] of [
      [FIGMA, 'figma-blog-posts'],
      [TE16, 'te16-two'],
    ] as const) {
      await gotoStore(page, path);
      const root = band(page, id);
      test.skip((await root.count()) === 0, NO_DATA);
      const { violations } = await new AxeBuilder({ page }).include(`[data-testid="container-${id}"]`).analyze();
      const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(serious.map((v) => `${path} ${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
    }
  });
});

test.describe('TE-16 dưới 5 bài, rỗng (index.te16)', () => {
  test('TC-07 AC-H27: blog không tồn tại thì không band, không placeholder, 0 console error', async ({ page }) => {
    const errors = watchConsole(page);
    await gotoStore(page, TE16);
    await expect(band(page, 'te16-empty')).toHaveCount(0);
    await expect(page.getByTestId('blog-posts-placeholder')).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test('TC-06 AC-H27, AC1: 2 bài hiện đúng 2 card, lưới tĩnh 292 × 389 (1280) / 336 × 448 (1920)', async ({ page }) => {
    await gotoStore(page, TE16);
    await skipWithoutArticles(page, band(page, 'te16-two').getByTestId('article-card'), 2);
    await checkGrid(page, 'te16-two', 2);
  });

  test('TC-15 AC1, AC-H27: blog 4 bài hiện 4 card, lưới tĩnh', async ({ page }) => {
    await gotoStore(page, TE16);
    await skipWithoutEdge(page);
    await checkGrid(page, 'te16-edge', 4);
  });

  test('TC-09, TC-10 AC-H27 D8: 201 từ làm tròn lên 2, 150 từ ra "1 min read"', async ({ page }) => {
    await gotoStore(page, TE16);
    await skipWithoutEdge(page);
    const edge = band(page, 'te16-edge');
    await expect(cardByHandle(edge, 'te16-round-up').getByTestId('article-card-read-time')).toHaveText(`${readMinutes(201)} min read`);
    await expect(cardByHandle(edge, 'te16-one-minute').getByTestId('article-card-read-time')).toHaveText(`${readMinutes(150)} min read`);
  });

  test('TC-17 AC-H27: bài không có nội dung thì ẩn dòng thời gian đọc', async ({ page }) => {
    await gotoStore(page, TE16);
    await skipWithoutEdge(page);
    const card = cardByHandle(band(page, 'te16-edge'), 'te16-no-content');
    await expect(card).toHaveCount(1);
    await expect(card.getByTestId('article-card-title')).toBeVisible();
    await expect(card.getByTestId('article-card-read-time')).toHaveCount(0);
  });

  test('TC-18 AC1: bài không ảnh, không tag giữ khung, nền tối, không pill', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await gotoStore(page, TE16);
    await skipWithoutEdge(page);
    const edge = band(page, 'te16-edge');
    const bare = cardByHandle(edge, 'te16-no-image');
    await expect(bare.getByTestId('article-card-image')).toHaveCount(0);
    await expect(bare.getByTestId('article-card-tag')).toHaveCount(0);
    await expect(bare.getByTestId('article-card-title')).toBeVisible();
    const [withImage] = await boxes(cardByHandle(edge, 'te16-one-minute'));
    const [noImage] = await boxes(bare);
    expectSize(noImage, [withImage.width, withImage.height], 'card không ảnh so card có ảnh');
    const bg = await bare.getByTestId('article-card-link').evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('TC-19 AC-H27: blog có nhưng 0 bài thì không band, không placeholder', async ({ page }) => {
    await gotoStore(page, TE16);
    await skipWithoutEdge(page);
    await expect(band(page, 'te16-zero')).toHaveCount(0);
    await expect(page.getByTestId('blog-posts-placeholder')).toHaveCount(0);
  });
});

test.describe('TE-16 không JS', () => {
  test.use({ javaScriptEnabled: false });

  test('TC-23 AC1, AC-H26: hàng ngang 4 mốc giống có JS, không nút, không tiến trình', async ({ page }) => {
    await gotoStore(page, FIGMA, { waitUntil: 'domcontentloaded' });
    await checkRow(page, false);
  });

  test('TC-23 AC-H27: 2 bài lưới tĩnh giống có JS', async ({ page }) => {
    await gotoStore(page, TE16, { waitUntil: 'domcontentloaded' });
    await skipWithoutArticles(page, band(page, 'te16-two').getByTestId('article-card'), 2);
    await checkGrid(page, 'te16-two', 2);
  });

  test('TC-22 AC-H26: bàn phím Tab vào danh sách, mũi tên cuộn, card focus được (không JS)', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Pixel 7 không có bàn phím vật lý; kiểm ở project desktop');
    await gotoStore(page, FIGMA, { waitUntil: 'domcontentloaded' });
    await checkKeyboard(page);
  });

  test('TC-01 AC-H26: 1920 nội dung card giống có JS (5 card, link, tag, tiêu đề, thời gian đọc)', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await gotoStore(page, FIGMA, { waitUntil: 'domcontentloaded' });
    const root = band(page, 'figma-blog-posts');
    await skipWithoutArticles(page, root.getByTestId('article-card'), 5);
    for (const [handle, article] of Object.entries(ARTICLES)) {
      const card = cardByHandle(root, handle);
      await expect(card.getByTestId('article-card-tag')).toHaveText(article.tag);
      await expect(card.getByTestId('article-card-title')).toHaveText(article.title);
      await expect(card.getByTestId('article-card-read-time')).toHaveText(article.readTime);
    }
  });
});
