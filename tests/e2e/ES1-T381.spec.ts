// KHÔNG CHẮC: spec chưa chạy ở phiên dev-fe (không preview, không chạy playwright); chờ CI.
// ES1-T381 TE-20-R2-FE1: blocks/blog-articles (mới), templates/blog, snippets/article-card; AC TE-20 AC1–AC8 (SRS 0.5), blog.md B1–B3.
// Tĩnh (không store): npx playwright test tests/e2e/ES1-T381.spec.ts -g "tĩnh"
// Store cần dữ liệu (store-data.json hoặc env), thiếu → fixme, không tính đạt:
//   TE381_BLOG_PATH        blog ≥ 2 bài, ≥ 1 tag, có bài có ảnh (vd /blogs/figma-blog)
//   TE381_TAG_PATH         trang tag có bài (vd /blogs/figma-blog/tagged/diet-plans)
//   TE381_EMPTY_TAG_PATH   trang tag không còn bài (vd /blogs/figma-blog/tagged/khong-co)
//   TE381_PAGED_BLOG_PATH  blog có số bài > Articles per page (trang 2: ?page=2)
import { test, expect, type Page } from './support/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { env } from './support/store-data';
import { expectNotChallenged } from './support/store-guard';
import { newStoreContext } from './support/store-noise';

const read = (p: string) => readFileSync(p, 'utf8');
const noComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');

test.describe('ES1-T381 tĩnh', () => {
  test.beforeEach(({}, ti) => { test.skip(ti.project.name !== 'desktop', 'tĩnh, chạy 1 lần'); });

  test('template: container + blog-articles, không markup thô, không default_pagination', () => {
    const src = read('templates/blog.liquid');
    expect(src).toMatch(/\{% block 'container', id: 'blog-main' %\}\s*\{% block 'blog-articles' %\}\{% endblock %\}\s*\{% endblock %\}/);
    expect(src).not.toMatch(/default_pagination|<h1|paginate/);
  });

  test('block: doc, schema không presets, shopify_attributes, settings đúng bảng SRS TE-20', () => {
    const src = read('blocks/blog-articles.liquid');
    expect(src).toContain('{% doc %}');
    expect(src).toContain('{{ block.shopify_attributes }}');
    expect(src).not.toMatch(/"presets"|<script|data-lazy-module|role="tab"/);
    const schema = JSON.parse(src.split('{% schema %}')[1].split('{% endschema %}')[0]);
    const byId = Object.fromEntries(schema.settings.map((s: { id: string }) => [s.id, s]));
    expect(Object.keys(byId)).toEqual(['eyebrow', 'show_topic_filter', 'feature_newest', 'articles_per_page', 'show_excerpt', 'show_date', 'show_reading_time']);
    expect(byId.eyebrow.default).toBeUndefined(); // ES1-T308 #1: theme mới cài, eyebrow rỗng
    expect(byId.articles_per_page).toMatchObject({ type: 'range', min: 6, max: 24, step: 3, default: 9 });
    for (const id of ['show_topic_filter', 'feature_newest', 'show_excerpt', 'show_date', 'show_reading_time']) expect(byId[id].default, id).toBe(true);
    for (const s of schema.settings) expect(s.label, s.id).toMatch(/^t:/);
  });

  test('block: breadcrumb, page-title, nav link + aria-current, bài nổi bật 30 từ, phân trang #blog-grid, empty state', () => {
    const src = read('blocks/blog-articles.liquid');
    expect(src).toContain("render 'breadcrumb'");
    expect(src).toContain("render 'page-title', title: blog.title, eyebrow: block.settings.eyebrow, meta: count_label");
    expect(src).toContain("aria-label=\"{{ 'blog.topics_label' | t }}\"");
    expect(src).toContain('href="{{ blog.url }}/tagged/{{ tag_handle }}"');
    expect(src).toContain('{% if tag_handles contains tag_key %}');
    expect(src).toContain('aria-current="page"');
    expect(src).toContain('featured.excerpt_or_content | strip_html | truncatewords: 30');
    expect(src).toMatch(/loading: 'eager',\s*fetchpriority: 'high'/);
    expect(src).toContain("render 'pagination', paginate: paginate, anchor: '#blog-grid'");
    expect(src).toContain('id="blog-grid"');
    expect(src).toContain('button_url: routes.all_products_collection_url');
    expect(src).toContain('button_url: blog.url');
    expect(src).toContain("heading_tag: 'h2', show_date: block.settings.show_date");
  });

  test('card: heading_tag, show_date, excerpt 20 từ; trang chủ (AC8) gọi card không tham số mới', () => {
    const card = read('snippets/article-card.liquid');
    expect(card).toContain('article.excerpt_or_content | strip_html | truncatewords: 20');
    expect(card).toContain("time_tag: format: 'date'");
    expect(card).toMatch(/assign card_heading = 'h3'/);
    expect(read('blocks/blog-posts.liquid')).toContain("{% render 'article-card', article: post %}");
  });

  test('CSS: không line-clamp/ellipsis ở tiêu đề, trích đoạn; override #999 chỉ ở .blog-posts', () => {
    const css = noComments(read('assets/base.css'));
    for (const rule of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      if (/article-card__(title|excerpt)|blog-articles__featured-(title|excerpt)/.test(rule[1])) {
        expect(rule[2], rule[1]).not.toMatch(/line-clamp|text-overflow:\s*ellipsis/);
      }
    }
    expect(css).toContain('.blog-posts .article-card__read-time { color: var(--figma-999999)');
    expect(css).not.toMatch(/\n\s*\.article-card__read-time \{ color: var\(--figma-999999\)/);
  });

  test('locale: khoá blog.* mới, 1 nhóm blog, số ít/nhiều', () => {
    const raw = read('locales/en.default.json');
    expect(raw.match(/^ {2}"blog": \{/gm)?.length).toBe(1);
    const t = JSON.parse(raw).blog;
    expect(t.articles_count).toEqual({ one: '{{ count }} article', other: '{{ count }} articles' });
    expect(t.tagged_count.other).toBe('{{ count }} articles tagged {{ tag }}');
    expect(t.empty_heading).toBe('No Articles Yet');
    expect(t.empty_button).toBe('Explore Equipment');
    expect(t.empty_tag_heading).toBe('No Articles On This Topic');
    expect(t.empty_tag_button).toBe('View All Articles');
    expect(JSON.stringify(t)).not.toMatch(/Efitco/);
  });
});

async function open(page: Page, key: string, why: string) {
  const path = env(key);
  test.fixme(!path, `thiếu ${key} (${why})`);
  await page.goto(path!);
  await expectNotChallenged(page);
}

async function noHorizontalOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
}

test.describe('ES1-T381 store', () => {
  test('AC1, AC6, AC7: thứ tự, 1 h1, nav, bài nổi bật là ảnh eager duy nhất, card h2 + trích đoạn + time', async ({ page }) => {
    await open(page, 'TE381_BLOG_PATH', 'blog ≥ 2 bài, có tag');
    const root = page.getByTestId('blog-articles');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(root.getByTestId('breadcrumb')).toBeVisible();
    const nav = root.getByRole('navigation', { name: 'Blog topics' });
    await expect(nav).toBeVisible();
    await expect(nav.getByRole('link').first()).toHaveAttribute('aria-current', 'page');
    await expect(nav.locator('[role="tab"]')).toHaveCount(0);
    const featured = root.getByTestId('blog-articles-featured');
    await expect(featured).toBeVisible();
    await expect(featured.getByRole('link')).toHaveCount(1);
    await expect(featured.locator('h2')).toHaveCount(1);
    const eager = page.locator('main img[loading="eager"]');
    await expect(eager).toHaveCount((await featured.locator('img').count()) > 0 ? 1 : 0);
    if ((await featured.locator('img').count()) > 0) await expect(featured.locator('img')).toHaveAttribute('fetchpriority', 'high');
    const cards = root.getByTestId('blog-articles-grid').getByTestId('article-card');
    expect(await cards.count()).toBeGreaterThan(0);
    await expect(cards.first().locator('h2')).toHaveCount(1);
    await expect(cards.first().getByRole('link')).toHaveCount(1);
    await expect(cards.first().locator('time[datetime]')).toHaveCount(1);
    for (const img of await cards.locator('img').all()) await expect(img).toHaveAttribute('loading', 'lazy');
  });

  for (const [width, cols] of [[360, 1], [768, 2], [1024, 3], [1280, 4]] as const) {
    test(`AC2 lưới ${cols} cột ở ${width}, trang không cuộn ngang`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await open(page, 'TE381_BLOG_PATH', 'blog ≥ 2 bài');
      const grid = page.getByTestId('blog-articles-grid');
      const columns = await grid.evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length);
      expect(columns).toBe(cols);
      await noHorizontalOverflow(page);
    });
  }

  test('AC3: trang tag: breadcrumb 3 mục, tab tag aria-current, không bài nổi bật, card đầu eager + high', async ({ page }) => {
    await open(page, 'TE381_TAG_PATH', 'trang tag có bài');
    await expect(page.getByTestId('breadcrumb').locator('li')).toHaveCount(3);
    await expect(page.getByRole('navigation', { name: 'Blog topics' }).locator('[aria-current="page"]')).toHaveCount(1);
    await expect(page.getByTestId('blog-articles-featured')).toHaveCount(0);
    await expect(page.locator('.page-title__meta')).toContainText('tagged');
    const first = page.getByTestId('article-card').first().locator('img');
    if (await first.count()) {
      await expect(first).toHaveAttribute('loading', 'eager');
      await expect(first).toHaveAttribute('fetchpriority', 'high');
    }
  });

  test('AC4: tag không còn bài → giữ nav, h2 No Articles On This Topic, View All Articles', async ({ page }) => {
    await open(page, 'TE381_EMPTY_TAG_PATH', 'trang tag không còn bài');
    await expect(page.getByRole('navigation', { name: 'Blog topics' })).toBeVisible();
    await expect(page.getByTestId('blog-articles-empty-heading')).toHaveText('No Articles On This Topic');
    await expect(page.getByTestId('blog-articles-empty-button')).toHaveText('View All Articles');
  });

  test('AC5: phân trang neo #blog-grid, trang 2 không có bài nổi bật', async ({ page }) => {
    await open(page, 'TE381_PAGED_BLOG_PATH', 'blog nhiều hơn Articles per page');
    await expect(page.getByTestId('pagination-next')).toHaveAttribute('href', /#blog-grid$/);
    await page.getByTestId('pagination-next').click();
    await expect(page.getByTestId('blog-articles-featured')).toHaveCount(0);
  });

  test('AC3 không JS: lọc bằng link', async ({ browser }) => {
    const path = env('TE381_BLOG_PATH');
    test.fixme(!path, 'thiếu TE381_BLOG_PATH');
    const ctx = await newStoreContext(browser, { javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto(path!);
    const tag = page.getByRole('navigation', { name: 'Blog topics' }).getByRole('link').nth(1);
    test.skip((await tag.count()) === 0, 'blog không có tag');
    await tag.click();
    await expect(page).toHaveURL(/\/tagged\//);
    await expect(page.getByTestId('blog-articles-featured')).toHaveCount(0);
    await ctx.close();
  });

  test('axe: 0 serious/critical trên trang blog', async ({ page }) => {
    await open(page, 'TE381_BLOG_PATH', 'blog ≥ 2 bài');
    await expectNotChallenged(page);
    const { violations } = await new AxeBuilder({ page }).include('[data-testid="blog-articles"]').analyze();
    expect(violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
  });
});
