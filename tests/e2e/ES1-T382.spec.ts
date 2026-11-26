// ES1-T382 TE-20-R2-FE2: trang bài viết = 3 container (article-main, article-comments, related-articles).
// SRS 0.5 TE-20 AC9–AC15 (thay TE-9 AC3, TE-6 AC6 bản 0.4), sổ 10/11 A1–A3, docs/ui-spec/article.md.
// Nhóm "tĩnh" đọc repo (không store). Nhóm "fixture" dựng markup + base.css thật ở 360/768/1280 (Chromium, không store).
// Nhóm "store" cần dữ liệu (env hoặc tests/e2e/store-data.json), thiếu thì fixme (không tính đạt):
//   TE382_ARTICLE_PATH           bài có ảnh bìa, ≥ 1 tag, blog bật bình luận, blog ≥ 2 bài (vd /blogs/news/bai-mau)
//   TE382_ARTICLE_NO_COVER_PATH  bài không ảnh bìa
// hCaptcha sau submit (/challenge hoặc invisible) → skip có lý do, chạy tay ghi PR (như ES1-T407).
import { test, expect, type Page } from './support/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { env } from './support/store-data';
import { expectNotChallenged } from './support/store-guard';

const read = (p: string) => readFileSync(p, 'utf8');
const noComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');

test.describe('ES1-T382 tĩnh', () => {
  test.beforeEach(({}, ti) => { test.skip(ti.project.name !== 'desktop', 'tĩnh, chạy 1 lần'); });

  test('template: 3 container có id riêng, mỗi container 1 block, không script', () => {
    const src = read('templates/article.liquid');
    for (const [id, block] of [['article-main', 'article-main'], ['article-comments', 'article-comments'], ['article-related', 'related-articles']]) {
      expect(src, id).toMatch(new RegExp(`block 'container', id: '${id}'[^%]*%\\}\\s*\\{% block '${block}' %\\}\\{% endblock %\\}`));
    }
    expect(src).not.toMatch(/<script|\{% schema/);
  });

  test('block chung: doc, schema không presets, shopify_attributes, placeholder chỉ trong editor', () => {
    for (const f of ['article-main', 'article-comments', 'related-articles']) {
      const src = read(`blocks/${f}.liquid`);
      expect(src, f).toMatch(/^\{% doc %\}/);
      expect(src, f).toContain('{% schema %}');
      expect(src, f).not.toContain('"presets"');
      expect(src, f).toContain('{{ block.shopify_attributes }}');
      expect(src, f).toMatch(/elsif request\.design_mode/);
      // ES1-T473 (D6): BE thêm lazy-module vào article-comments, related-articles; kiểm ở tests/e2e/ES1-T473.spec.ts
      if (f === 'article-main') expect(src, f).not.toMatch(/<script src|data-lazy-module/);
    }
  });

  test('AC9, AC10, AC14 article-main: ảnh bìa eager chỉ khi bật + có ảnh, breadcrumb, page-title, .rte, Topics, Back to, 1 BlogPosting', () => {
    const src = read('blocks/article-main.liquid');
    for (const id of ['show_cover_image', 'show_author', 'show_date', 'show_reading_time', 'show_topics']) {
      expect(src, id).toMatch(new RegExp(`"id": "${id}",[\\s\\S]*?"default": true`));
    }
    expect(src).toMatch(/if block\.settings\.show_cover_image and article\.image != blank/);
    expect(src.match(/loading: 'eager'/g)).toHaveLength(1);
    expect(src).toMatch(/if show_cover[\s\S]*?fetchpriority: 'high'[\s\S]*?endif/);
    expect(src).toContain("render 'breadcrumb'");
    expect(src).toContain("render 'page-title', title: article.title");
    expect(src).toMatch(/class="rte"[^>]*>\s*\{\{-? article\.content/);
    expect(src).toContain("'blog.topics' | t");
    expect(src).toContain("'blog.back_to_blog' | t: blog: blog.title");
    expect(src).toContain('time_tag');
    expect(src.match(/"@type": "BlogPosting"/g)).toHaveLength(1);
    for (const key of ['"headline"', '"datePublished"', '"author"', '"image"']) expect(src).toContain(key);
  });

  test('AC11, AC12 article-comments: chỉ khi comments_enabled, paginate 10 + pagination chung #comments, form lỗi theo trường', () => {
    const src = read('blocks/article-comments.liquid');
    expect(src).toMatch(/\{%- if blog\.comments_enabled\? and article != blank -%\}/);
    expect(src).toContain('{% paginate article.comments by 10, window_size: 1 %}');
    expect(src).toMatch(/'blog\.comments_pagination_label' \| t[\s\S]*render 'pagination', paginate: paginate, label: comments_label, anchor: '#comments'/);
    expect(src).toMatch(/<ol\s[^>]*class="article-comments__list"/);
    expect(src).toContain("'blog.comments_count' | t: count: article.comments_count");
    expect(src).toContain("'blog.no_comments' | t");
    expect(src).toMatch(/if blog\.moderated\?[\s\S]*'blog\.comment_moderated_note' \| t/);
    expect(src).toMatch(/role="alert"[\s\S]*?id="CommentFormErrors"/);
    expect(src).toContain("'blog.comment_errors_summary' | t: count: field_errors");
    for (const [id, auto] of [['CommentAuthor', 'name'], ['CommentEmail', 'email']]) {
      expect(src).toContain(`<label for="${id}"`);
      expect(src).toMatch(new RegExp(`id="${id}"[\\s\\S]*?autocomplete="${auto}"`));
    }
    expect(src).toContain('<label for="CommentBody"');
    for (const err of ['CommentAuthorError', 'CommentEmailError', 'CommentBodyError']) expect(src).toContain(`aria-describedby="${err}`);
    expect(src).toContain('aria-describedby="CommentEmailHint"');
    expect(src).toContain("'blog.email_hint' | t");
    expect(src).not.toContain('default_errors');
  });

  test('AC13, AC15 related-articles: bỏ bài đang xem, cùng tag trước, setting 2–8 mặc định 4, chữ default rỗng', () => {
    const src = read('blocks/related-articles.liquid');
    expect(src).toMatch(/<scroll-buttons\s/);
    expect(src).toContain('data-scroll-track');
    expect(src).toMatch(/post\.id != article\.id and post\.tags contains first_tag/);
    expect(src).toMatch(/if post\.id == article\.id\s*continue/);
    expect(src).toMatch(/if article != blank and other_count > 0/);
    expect(src).toMatch(/"id": "articles_to_show",[\s\S]*?"min": 2,[\s\S]*?"max": 8,[\s\S]*?"default": 4/);
    const schema = JSON.parse(src.split('{% schema %}')[1].split('{% endschema %}')[0]);
    for (const s of schema.settings.filter((x: { type: string }) => x.type === 'text')) expect(s.default, s.id).toBeUndefined();
    expect(src).toContain("'blog.related_heading' | t");
    expect(src).toContain("render 'article-card', article: post");
  });

  test('locale: khoá mới trong nhóm blog, số ít/nhiều, không trùng nhóm, nhãn schema t:', () => {
    const raw = read('locales/en.default.json');
    expect(raw.match(/^ {2}"blog": \{/gm)?.length).toBe(1);
    const t = JSON.parse(raw).blog;
    expect(t.comments_count).toEqual({ one: '{{ count }} Comment', other: '{{ count }} Comments' });
    expect(t.comment_errors_summary.other).toBe('Check {{ count }} fields');
    expect(t.comment_moderated_note).toBe('Comments are reviewed before they appear.');
    expect(t.email_hint).toBe('Not published.');
    expect(t.comment_form_submit).toBe('Post Comment');
    expect(t.comments_pagination_label).toBe('Comment pages');
    expect(t.back_to_blog).toBe('Back to {{ blog }}');
    expect(t.related_heading).not.toMatch(/Efitco/i);
    const schema = JSON.parse(read('locales/en.default.schema.json'));
    for (const k of ['article_show_cover_image', 'article_show_author', 'article_show_date', 'article_show_reading_time', 'article_show_topics']) {
      expect(schema.labels[k], k).toBeTruthy();
    }
    expect(schema.general.article_comments).toBeTruthy();
    expect(schema.general.related_articles).toBeTruthy();
  });

  test('CSS: mục bài viết chỉ dùng token, thuộc tính logical', () => {
    // ES1-T478 (ADR 0013): CSS trang bài viết ở assets/aux.css
    const css = noComments(read('assets/aux.css'));
    const start = css.indexOf('.image.article-main__cover {');
    const end = css.indexOf('aspect-ratio: 2 / 1; } }');
    expect(start).toBeGreaterThan(0);
    expect(end).toBeGreaterThan(start);
    const part = css.slice(start, end);
    expect(part).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i);
    expect(part).not.toMatch(/(^|[;{\s])(left|right|top|bottom|margin-left|margin-right|padding-left|padding-right|width|height)\s*:/);
    expect(part).not.toMatch(/z-index/);
  });
});

// Token tối thiểu thay cho snippets/css-variables.liquid (Liquid không render khi chạy fixture)
const TOKENS = `:root{--page-width:1440px;--page-margin:20px;--content-width:min(calc(var(--page-width) - var(--page-margin) * 2),calc(100% - var(--page-margin) * 2));--font-size-xs:.8125rem;--font-size-sm:.875rem;--font-size-base:1rem;--font-size-lg:1.125rem;--font-size-h1:3rem;--font-size-h2:2rem;--font-size-h3:1.5rem;--line-height-heading:1.1;--line-height-body:1.5;--space-1:4px;--space-2:8px;--space-3:12px;--space-4:16px;--space-5:24px;--space-6:32px;--space-7:48px;--space-8:120px;--radius-card:12px;--radius-input:8px;--radius-button:8px;--radius-pill:999px;--color-background:#fff;--color-foreground:#1a1a1a;--color-muted:#555;--color-muted-light:#6b6b6b;--color-border:#e5e5e5;--color-accent:#c8400e;--color-accent-foreground:#fff;--color-background-alt:#f5f5f5;--color-background-alt-foreground:#1a1a1a;--color-background-dark:#1a1a1a;--color-background-dark-foreground:#fff;--color-sale:#c00;--color-badge-new:#2e7d32;--motion-fast:150ms;--motion-base:250ms;--ease-out:ease-out;--font-primary--family:sans-serif;--font-heading--family:serif}`;

async function fixture(page: Page) {
  const longTitle = 'Supercalifragilisticexpialidociousandmoretext'.repeat(2);
  await page.setContent(`<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>fixture</title><style>${TOKENS}</style><style>${read('assets/critical.css')}</style><style>${noComments(read('assets/base.css'))}</style><style>${noComments(read('assets/aux.css'))}</style></head>
<body><main>
<article class="block-container"><div class="article-main">
  <div class="image article-main__cover" data-testid="article-cover"><img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" width="1800" height="828" alt="Cover"></div>
  <div class="article-main__column"><header class="article-main__header">
    <nav class="breadcrumb" aria-label="Breadcrumb"><ol class="breadcrumb__list"><li class="breadcrumb__item"><a class="breadcrumb__link" href="#">Home</a></li><li class="breadcrumb__item"><span class="breadcrumb__current" aria-current="page">${longTitle}</span></li></ol></nav>
    <a class="article-main__tag" href="#t" data-testid="article-main-tag">Exercises</a>
    <div class="page-title"><h1 class="page-title__heading">${longTitle}</h1></div>
    <p class="article-main__meta"><span class="article-main__meta-item"><time>Nov 5, 2026</time></span><span class="article-main__meta-item">By A</span></p>
  </header><div class="rte"><p>Text</p></div>
  <footer class="article-main__end"><a class="article-main__back" href="#b" data-testid="article-main-back"><span class="article-main__back-label">Back to blog</span></a></footer></div>
</div></article>
<section class="block-container"><div class="article-comments" id="comments"><h2>2 Comments</h2>
  <form class="comment-form"><div class="comment-form__fields">
    <div class="form-field" data-f="name"><label class="form-field__label" for="a">Name</label><input class="form-field__input" id="a"></div>
    <div class="form-field" data-f="email"><label class="form-field__label" for="b">Email</label><input class="form-field__input" id="b"></div>
    <div class="form-field comment-form__body" data-f="body"><label class="form-field__label" for="c">Comment</label><textarea class="form-field__input" id="c"></textarea></div>
  </div><div class="comment-form__actions"><button class="button" type="submit">Post Comment</button></div></form>
</div></section>
</main></body></html>`);
}

const box = (page: Page, sel: string) => page.locator(sel).first().evaluate((el) => {
  const r = el.getBoundingClientRect();
  return { x: r.x, y: r.y, w: r.width, h: r.height };
});

test.describe('ES1-T382 fixture', () => {
  for (const [vw, ratio] of [[360, 4 / 3], [768, 16 / 9], [1280, 2]] as const) {
    test(`${vw}: tỉ lệ ảnh bìa, cột đọc ≤ 736, vùng chạm, form, không cuộn ngang`, async ({ page }) => {
      await page.setViewportSize({ width: vw, height: 900 });
      await fixture(page);
      const cover = await box(page, '.article-main__cover');
      expect(Math.abs(cover.w / cover.h - ratio)).toBeLessThan(0.02);
      const radius = await page.locator('.article-main__cover').evaluate((el) => getComputedStyle(el).borderTopLeftRadius);
      expect(radius).toBe('16px');
      const column = await box(page, '.article-main__column');
      expect(column.w).toBeLessThanOrEqual(736);
      if (vw >= 1280) expect(column.w).toBe(736);
      const tagHit = await page.locator('.article-main__tag').evaluate((el) => {
        const r = el.getBoundingClientRect();
        const a = getComputedStyle(el, '::after');
        return r.height - parseFloat(a.insetBlockStart) * 2;
      });
      expect(tagHit).toBeGreaterThanOrEqual(44);
      expect((await box(page, '.article-main__back')).h).toBeGreaterThanOrEqual(44);
      const name = await box(page, '[data-f=name]');
      const email = await box(page, '[data-f=email]');
      if (vw >= 768) expect(Math.round(email.y)).toBe(Math.round(name.y));
      else expect(email.y).toBeGreaterThan(name.y);
      const button = await box(page, '.comment-form__actions .button');
      if (vw < 768) expect(button.w).toBeGreaterThan(column.w - 2);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    });
  }
});

/** Như ES1-T407: chờ khung chính điều hướng; hCaptcha → skip có lý do. */
async function submitAndLoad(page: Page, submit: () => Promise<unknown>) {
  const navigated = page
    .waitForEvent('framenavigated', { predicate: (f) => f === page.mainFrame(), timeout: 15_000 })
    .then(() => true, () => false);
  await submit();
  const moved = await navigated;
  if (moved) await page.waitForLoadState('domcontentloaded');
  const captcha = (await page.locator('iframe[src*="hcaptcha"]').or(page.getByRole('img', { name: /hCaptcha/i })).count()) > 0;
  test.skip(/^\/challenge/.test(new URL(page.url()).pathname) || (!moved && captcha), 'hCaptcha chặn submit tự động: chạy tay, ghi PR');
  expect(moved, 'submit không điều hướng và không có hCaptcha').toBe(true);
  await expectNotChallenged(page);
}

test.describe('ES1-T382 store', () => {
  const ARTICLE = env('TE382_ARTICLE_PATH');
  const NO_COVER = env('TE382_ARTICLE_NO_COVER_PATH');

  test('AC9, AC10, AC13, AC14: 1 h1, ảnh bìa là ảnh eager duy nhất, breadcrumb, 1 BlogPosting + 1 BreadcrumbList, bài liên quan không gồm bài đang xem', async ({ page }) => {
    test.fixme(!ARTICLE, 'thiếu TE382_ARTICLE_PATH');
    await page.goto(ARTICLE!);
    await expectNotChallenged(page);
    await expect(page.locator('h1')).toHaveCount(1);
    const cover = page.getByTestId('article-cover').locator('img');
    await expect(cover).toHaveAttribute('fetchpriority', 'high');
    await expect(cover).toHaveAttribute('loading', 'eager');
    await expect(cover).toHaveAttribute('alt', /.*/);
    await expect(page.locator('img[loading="eager"]')).toHaveCount(1);
    await expect(page.getByTestId('breadcrumb')).toBeVisible();
    const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
    const types = ld.map((s) => (JSON.parse(s) as { '@type': string })['@type']);
    expect(types.filter((x) => x === 'BlogPosting')).toHaveLength(1);
    expect(types.filter((x) => x === 'BreadcrumbList')).toHaveLength(1);
    await expect(page.getByTestId('article-main-tag')).toHaveAttribute('href', /\/tagged\//);
    const related = page.getByTestId('related-articles');
    if (await related.count()) {
      const hrefs = await related.getByTestId('article-card-link').evaluateAll((els) => els.map((e) => new URL((e as HTMLAnchorElement).href).pathname));
      expect(hrefs.length).toBeGreaterThan(0);
      expect(hrefs.length).toBeLessThanOrEqual(8);
      expect(hrefs).not.toContain(new URL(page.url()).pathname);
      await expect(related.locator('h3')).toHaveCount(hrefs.length);
    }
    await expectNotChallenged(page);
    const { violations } = await new AxeBuilder({ page }).include('main').analyze();
    expect(violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
  });

  test('AC9: bài không ảnh bìa → không khung ảnh, không ảnh eager', async ({ page }) => {
    test.fixme(!NO_COVER, 'thiếu TE382_ARTICLE_NO_COVER_PATH');
    await page.goto(NO_COVER!);
    await expectNotChallenged(page);
    await expect(page.getByTestId('article-cover')).toHaveCount(0);
    await expect(page.locator('main img[loading="eager"]')).toHaveCount(0);
  });

  test('AC12: gửi thiếu trường → hộp "Check n fields" role=alert, lỗi inline, giữ chữ', async ({ page }) => {
    test.fixme(!ARTICLE, 'thiếu TE382_ARTICLE_PATH');
    await page.goto(ARTICLE!);
    await expectNotChallenged(page);
    const form = page.getByTestId('comment-form');
    test.skip((await form.count()) === 0, 'blog của bài chưa bật bình luận');
    await expect(page.locator('#comments h2').first()).toHaveText(/Comment/);
    await form.evaluate((f: HTMLFormElement) => (f.noValidate = true));
    await form.locator('#CommentAuthor').fill('QA ES1-T382');
    await submitAndLoad(page, () => form.getByTestId('comment-submit').click());
    const errors = page.getByTestId('comment-errors');
    await expect(errors).toHaveAttribute('role', 'alert');
    await expect(errors).toContainText(/Check \d+ fields?/);
    await expect(page.locator('#CommentEmail')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#CommentEmail')).toHaveAttribute('aria-describedby', /CommentEmailError/);
    await expect(page.locator('#CommentAuthor')).toHaveValue('QA ES1-T382');
  });
});
