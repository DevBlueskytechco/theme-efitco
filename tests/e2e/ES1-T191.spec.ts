// KHÔNG CHẮC: spec chưa chạy (phiên viết không có preview, chưa type-check, CI đang tắt e2e theo CTO 06/11); scope-guard chặn dev-fe ghi tests/ → Orchestrator chép sang tests/e2e/ES1-T191.spec.ts.
// Ticket ES1-T191 TE-16-FE1: blocks/blog-posts + snippets/article-card, hàng 14 Figma 1:1022 (AC-H26, AC-H27).
// Card đo 336 x 448 theo snapshot và comment Designer trên ticket, không phải 300 x 448 của tiêu đề ticket và AC-H26.
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T191.spec.ts
// Blog figma-blog do ES1-T178 nhập: thiếu thì các test cần bài skip có lý do.
import { test, expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { expectNotChallenged } from './support/store-guard';
import { readFileSync } from 'node:fs';
import { watchShopPay403 } from './support/console-guard';

const FIGMA = '/?view=figma';
const TE16 = '/?view=te16';
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];
const NO_DATA = 'store chưa có blog figma-blog đủ bài (ES1-T178)';

// Bảng BA drafts/ba/ES1-T173/home-content.md mục 3.6: số từ là bội 200 nên ra đúng số Figma.
const ARTICLES = [
  { handle: 'figma-stretch-after-training', title: 'How to stretch properly after training', tag: 'Exercises', readTime: '2 min read' },
  { handle: 'figma-home-gym-15m2', title: 'Set up a perfect home gym in just 15m²', tag: 'Featured', readTime: '5 min read' },
  { handle: 'figma-choose-adjustable-dumbbell', title: 'How to choose the right adjustable dumbbell', tag: 'Articles', readTime: '6 min read' },
  { handle: 'figma-eat-before-after-session', title: 'What to eat before and after a heavy session', tag: 'Diet plans', readTime: '7 min read' },
  { handle: 'figma-rubber-vs-urethane', title: 'Rubber vs urethane: which plates last longer', tag: 'Diet plans', readTime: '5 min read' },
];

const band = (page: Page, id: string) => page.getByTestId(`container-${id}`);

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

async function noHorizontalOverflow(page: Page) {
  const [scrollWidth, clientWidth] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
}

/** Đo trong cùng 1 evaluate, không dùng boundingBox qua nhiều lần cuộn (ES1-T172). */
async function sizes(cards: Locator) {
  return cards.evaluateAll((els) =>
    els.map((el) => {
      const box = el.getBoundingClientRect();
      return { width: Math.round(box.width), height: Math.round(box.height) };
    }),
  );
}

async function skipWithoutArticles(page: Page, cards: Locator, need: number) {
  const count = await cards.count();
  test.skip(count < need, `${NO_DATA}: có ${count}, cần ${need}, trang ${page.url()}`);
}

test.describe('ES1-T191 tĩnh', () => {
  test('blog-posts đứng ngay trước FAQ ở cả index và index.figma', () => {
    for (const file of ['templates/index.liquid', 'templates/index.figma.liquid']) {
      const names = [...readFileSync(file, 'utf8').matchAll(/\{%-?\s*block\s+'([a-z-]+)'/g)].map((m) => m[1]).filter((name) => name !== 'container');
      expect(names[names.indexOf('faq') - 1], file).toBe('blog-posts');
    }
  });

  // CTO 09/11 (tong_hop.docx #3, ES1-T250): blog chuyển bằng next, back. Block chỉ nạp scroll-buttons qua lazy-module; card vẫn 0 JS.
  test('JS chỉ là scroll-buttons qua lazy-module; CSS: 0 màu literal, 0 thuộc tính vật lý trong mục blog', () => {
    const block = readFileSync('blocks/blog-posts.liquid', 'utf8');
    expect(block.match(/<script[^>]*>/g)).toEqual([`<script src="{{ 'lazy-module.js' | asset_url }}" type="module">`]);
    expect(block.match(/data-lazy-module="[^"]*"/g)).toEqual([`data-lazy-module="{{ 'scroll-buttons.js' | asset_url }}"`]);
    expect(readFileSync('snippets/article-card.liquid', 'utf8')).not.toMatch(/<script|data-lazy-module/);
    const css = readFileSync('assets/base.css', 'utf8');
    const start = css.indexOf('/** Blog posts (TE-16');
    const end = css.indexOf('/** Testimonials (TE-7');
    expect(start).toBeGreaterThan(0);
    const section = css.slice(start, end).replace(/\/\*[\s\S]*?\*\//g, '');
    expect(section).not.toMatch(/#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(/i);
    expect(section).not.toMatch(/(^|[\s;{])(left|right|top|bottom|margin-(left|right|top|bottom)|padding-(left|right|top|bottom))\s*:/);
  });
});

test.describe('ES1-T191 rỗng', () => {
  test('blog không tồn tại: không band, không card, 0 console error', async ({ page }) => {
    const errors = watchConsole(page);
    await page.goto(TE16);
    await expect(band(page, 'te16-empty')).toHaveCount(0);
    expect(errors).toEqual([]);
  });
});

test.describe('ES1-T191 có bài', () => {
  test('dưới số mặc định: hiện đúng số bài, cỡ card không đổi', async ({ page }) => {
    await page.goto(TE16);
    const cards = band(page, 'te16-two').getByTestId('article-card');
    await skipWithoutArticles(page, cards, 2);
    await expect(cards).toHaveCount(2);
    if (page.viewportSize()!.width >= 1024) {
      expect(await sizes(cards)).toEqual([
        { width: 336, height: 448 },
        { width: 336, height: 448 },
      ]);
    }
  });

  test('bài không có ảnh: khung giữ nguyên cỡ, chữ vẫn hiện', async ({ page }) => {
    await page.goto(TE16);
    const cards = band(page, 'te16-two').getByTestId('article-card');
    await skipWithoutArticles(page, cards, 1);
    const before = await sizes(cards);
    // Store không có bài thiếu ảnh (bảng BA): gỡ ảnh để kiểm khung, nhánh if article.image của Liquid không được phủ ở đây.
    await cards.getByTestId('article-card-image').evaluateAll((els) => els.forEach((el) => el.remove()));
    expect(await sizes(cards)).toEqual(before);
    await expect(cards.first().getByTestId('article-card-title')).toBeVisible();
  });

});

test.describe('ES1-T191 không JS', () => {
  test.use({ javaScriptEnabled: false });

  test('danh sách tràn ở 1920, là khung cuộn, nhận focus bàn phím', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(FIGMA);
    const root = band(page, 'figma-blog-posts');
    await skipWithoutArticles(page, root.getByTestId('article-card'), 5);
    const list = root.getByTestId('blog-posts-list');
    await expect(list).toHaveCSS('overflow-x', 'auto');
    await expect(list).toHaveAttribute('tabindex', '0');
    await expect(list).toHaveAttribute('aria-label', /.+/);
    const box = await list.boundingBox();
    const lastCard = await root.getByTestId('article-card').last().boundingBox();
    expect(lastCard!.x + lastCard!.width).toBeGreaterThan(box!.x + box!.width);
  });
});

test.describe('ES1-T191 cổng Figma', () => {
  test('5 card đúng cỡ, link, nhãn, tiêu đề, thời gian đọc; thẻ thứ 5 tràn ở 1920', async ({ page }) => {
    const errors = watchConsole(page);
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(FIGMA);
    const root = band(page, 'figma-blog-posts');
    const cards = root.getByTestId('article-card');
    await skipWithoutArticles(page, cards, 5);
    await expect(cards).toHaveCount(5);
    await expect(root.getByTestId('blog-posts-eyebrow')).toHaveText('From the Efitco blog');
    await expect(root.getByTestId('blog-posts-heading')).toHaveText('Training Tips & Inspiration');

    expect(await sizes(cards)).toEqual(Array(5).fill({ width: 336, height: 448 }));

    for (const [index, article] of ARTICLES.entries()) {
      const card = cards.nth(index);
      await expect(card.getByTestId('article-card-title')).toHaveText(article.title);
      await expect(card.getByTestId('article-card-tag')).toHaveText(article.tag);
      // D8: số từ bội 200, nên bài A1 400 từ phải ra đúng 2 min read.
      await expect(card.getByTestId('article-card-read-time')).toHaveText(article.readTime);
      await expect(card.getByTestId('article-card-link')).toHaveAttribute('href', new RegExp(`/${article.handle}$`));
    }

    const [scrollWidth, clientWidth] = await root
      .getByTestId('blog-posts-list')
      .evaluate((el) => [el.scrollWidth, el.clientWidth]);
    expect(scrollWidth).toBeGreaterThan(clientWidth);
    await noHorizontalOverflow(page);
    expect(errors).toEqual([]);
  });

  test('ảnh card đều lazy', async ({ page }) => {
    await page.goto(FIGMA);
    const images = band(page, 'figma-blog-posts').locator('[data-testid="article-card-image"] img');
    test.skip((await images.count()) === 0, NO_DATA);
    const loading = await images.evaluateAll((els) => els.map((el) => el.getAttribute('loading')));
    expect(new Set(loading)).toEqual(new Set(['lazy']));
  });

  for (const [width, cardWidth, cardHeight] of [
    [360, 252, 336],
    [768, 307, 410],
  ] as const) {
    test(`${width}: card theo ES1-T174, trang không tràn ngang`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(FIGMA);
      const cards = band(page, 'figma-blog-posts').getByTestId('article-card');
      await skipWithoutArticles(page, cards, 1);
      const [first] = await sizes(cards);
      expect(Math.abs(first.width - cardWidth)).toBeLessThanOrEqual(1);
      expect(Math.abs(first.height - cardHeight)).toBeLessThanOrEqual(1);
      await noHorizontalOverflow(page);
    });
  }

  test('axe: 0 serious trong band', async ({ page }) => {
    await page.goto(FIGMA);
    const root = band(page, 'figma-blog-posts');
    test.skip((await root.count()) === 0, NO_DATA);
    await expectNotChallenged(page);
    const { violations } = await new AxeBuilder({ page }).include('[data-testid="container-figma-blog-posts"]').analyze();
    const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious.map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
  });
});
