// KHÔNG CHẮC: spec chưa chạy (phiên dev-fe không có preview, chưa type-check); scope-guard chặn dev-fe ghi tests/ → Orchestrator/QA chép sang tests/e2e/ES1-T403.spec.ts (import ./support/* theo vị trí đó).
// ES1-T403 TS-FE5: .rte chung, h5 ≠ h6, không cắt tên 3 chỗ, viền radio quiz ≥ 3:1 (task-split ES1-T304 D4, D5; foundation §28).
// Chạy tĩnh (không store): npx playwright test tests/e2e/ES1-T403.spec.ts -g "tĩnh"
// Store: PREVIEW_URL=... npx playwright test tests/e2e/ES1-T403.spec.ts. TE403_PAGE_PATH (vd /pages/rte-demo) là page có h5, h6 trong nội dung; thiếu thì test đó skip, không coi là đạt.
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { env } from './support/store-data';
import { expectNotChallenged } from './support/store-guard';

const read = (path: string) => readFileSync(path, 'utf8');
const noComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');

// Token tối thiểu thay cho snippets/css-variables.liquid (không render được Liquid khi chạy tĩnh)
const TOKENS = `:root{--font-size-base:1rem;--font-size-lg:1.125rem;--font-size-sm:.875rem;--font-size-h2:2rem;--font-size-h3:1.5rem;--font-size-h1:3rem;--line-height-heading:1.1;--line-height-body:1.5;--space-1:4px;--space-2:8px;--space-3:12px;--space-4:16px;--space-5:24px;--space-6:32px;--space-7:48px;--radius-card:12px;--color-muted:#666;--color-border:#e5e5e5;--color-accent:#b24d1f;--font-primary--family:sans-serif;--font-heading--family:serif}`;

async function rteFixture(page: Page) {
  await page.setContent(`<!doctype html><html lang="en"><head><title>rte</title><style>${TOKENS}</style><style>${read('assets/critical.css')}</style><style>${noComments(read('assets/base.css'))}</style></head>
<body><main><div class="rte"><h2>H2</h2><h3>H3</h3><h4>H4</h4><h5>H5</h5><h6>H6</h6><p>Text <a href="#a">link</a></p><ul><li>a</li></ul><blockquote>Quote</blockquote><table><tr><td>${'x'.repeat(400)}</td></tr></table><hr></div></main></body></html>`);
}

const style = (page: Page, selector: string) =>
  page.locator(selector).evaluate((el) => {
    const s = getComputedStyle(el);
    return { fontSize: s.fontSize, textTransform: s.textTransform, display: s.display, overflowX: s.overflowX };
  });

test.describe('ES1-T403 tĩnh', () => {
  test.beforeEach(({}, ti) => { test.skip(ti.project.name !== 'desktop', 'tĩnh, chạy 1 lần'); });

  test('D4 .rte bọc 4 chỗ rich text, rule cũ product-info__description đã xoá', () => {
    expect(read('templates/article.liquid')).toMatch(/class="rte"[^>]*>\s*\{\{-? article\.content/);
    expect(read('templates/page.liquid')).toMatch(/class="rte"[^>]*>\s*\{\{-? page\.content/);
    expect(read('blocks/collection-banner.liquid')).toMatch(/class="rte[ "][^>]*>\s*\{\{-? collection\.description/);
    expect(read('blocks/product-info.liquid')).toMatch(/class="rte"[^>]*>\s*\{\{-? product\.description/);
    expect(read('assets/base.css')).not.toContain('product-info__description');
  });

  test('D5 line-clamp / ellipsis chỉ còn ở tên shop (critical) và badge article-card__tag', () => {
    const hits: string[] = [];
    for (const file of ['assets/critical.css', 'assets/base.css']) {
      const css = noComments(read(file));
      for (const rule of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
        if (/line-clamp|text-overflow:\s*ellipsis/.test(rule[2])) hits.push(`${file}: ${rule[1].trim()}`);
      }
    }
    expect(hits.some((h) => /title/.test(h))).toBe(false);
    expect(hits.filter((h) => h.startsWith('assets/base.css'))).toEqual(['assets/base.css: .article-card__tag']);
  });

  test('C8 viền radio quiz không dùng #999 (2.85:1)', () => {
    const css = noComments(read('assets/base.css'));
    const marks = [...css.matchAll(/\.quiz-option__mark\s*\{([^}]*)\}/g)].map((m) => m[1]);
    expect(marks.length).toBeGreaterThan(0);
    for (const body of marks) expect(body).not.toContain('--figma-999999');
  });

  test('§28 h2–h5 giảm dần, h5 ≠ h6 trong .rte; bảng cuộn ngang, trang không tràn', async ({ page }) => {
    await rteFixture(page);
    const h5 = await style(page, '.rte h5');
    const h6 = await style(page, '.rte h6');
    expect(h5.fontSize).not.toBe(h6.fontSize);
    expect(h6.textTransform).toBe('uppercase');
    expect(h5.textTransform).not.toBe('uppercase');
    const sizes = await Promise.all(['h2', 'h3', 'h4', 'h5'].map(async (h) => parseFloat((await style(page, `.rte ${h}`)).fontSize)));
    expect(sizes).toEqual([...sizes].sort((a, b) => b - a));
    expect(new Set(sizes).size).toBe(4);
    const table = await style(page, '.rte table');
    expect(table.display).toBe('block');
    expect(table.overflowX).toBe('auto');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
});

test.describe('ES1-T403 store', () => {
  test('h5 ≠ h6 trong .rte của page', async ({ page }) => {
    const path = env('TE403_PAGE_PATH');
    test.skip(!path, 'thiếu TE403_PAGE_PATH: page có h5, h6 trong nội dung');
    await page.goto(path!);
    await expectNotChallenged(page);
    const rte = page.getByTestId('page-content');
    await expect(rte).toHaveClass(/\brte\b/);
    const get = (tag: string) => rte.locator(tag).first().evaluate((el) => `${getComputedStyle(el).fontSize}|${getComputedStyle(el).textTransform}`);
    expect(await get('h5')).not.toBe(await get('h6'));
  });

  test('quiz: axe color-contrast 0 serious, viền vòng chưa chọn ≥ 3:1 với nền option', async ({ page }) => {
    await page.goto('/?view=te11');
    const mark = page.locator('.quiz-option:not(:has(:checked)):not(:has([data-sample-choice])) .quiz-option__mark').first();
    test.skip((await mark.count()) === 0, 'store không có quiz ở ?view=te11');
    await expectNotChallenged(page);
    const { violations } = await new AxeBuilder({ page }).include('.quiz').withRules(['color-contrast']).analyze();
    expect(violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
    const ratio = await mark.evaluate((el) => {
      const rgb = (c: string) => (c.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
      const lum = ([r, g, b]: number[]) => {
        const f = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      let node: Element | null = el.parentElement;
      let bg = 'rgb(255, 255, 255)';
      while (node) {
        const c = getComputedStyle(node).backgroundColor;
        if (c && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) { bg = c; break; }
        node = node.parentElement;
      }
      const a = lum(rgb(getComputedStyle(el).borderTopColor));
      const b = lum(rgb(bg));
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    });
    expect(ratio).toBeGreaterThanOrEqual(3);
  });
});
