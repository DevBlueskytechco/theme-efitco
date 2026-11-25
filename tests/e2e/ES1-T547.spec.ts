// ES1-T547: bảng .rte không cuộn ngang khi ≤ 4 cột, .table-wrap cho bảng rộng (kit V46, foundation #h-rte, #h-data-table).
// Tĩnh (không store): npx playwright test tests/e2e/ES1-T547.spec.ts -g "tĩnh"
// Store: TE547_ARTICLE_PATH (vd /blogs/news/rte-table) là bài có bảng 3 cột và 1 bảng bọc <div class="table-wrap">; thiếu thì skip, không coi là đạt.
import { test, expect, type Page } from './support/test';
import { readFileSync } from 'node:fs';
import { env } from './support/store-data';
import { expectNotChallenged } from './support/store-guard';

const read = (path: string) => readFileSync(path, 'utf8');
const noComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');

// Token tối thiểu thay cho snippets/css-variables.liquid (không render được Liquid khi chạy tĩnh)
const TOKENS = `:root{--font-size-base:1rem;--font-size-sm:.875rem;--line-height-sm:1.4286;--font-size-h2:2rem;--font-size-h3:1.5rem;--line-height-heading:1.1;--line-height-body:1.5;--space-1:4px;--space-2:8px;--space-3:12px;--space-4:16px;--space-5:24px;--space-6:32px;--space-7:48px;--radius-card:12px;--color-muted:#666;--color-border:#e5e5e5;--color-background-alt:#f4f4f5;--color-accent:#b24d1f;--font-primary--family:sans-serif;--font-heading--family:serif}`;

const row = (cells: string[], tag = 'td') => `<tr>${cells.map((c) => `<${tag}>${c}</${tag}>`).join('')}</tr>`;
const long = 'Organic Hass avocado from Michoacán, hand picked and ripened';
const narrow = `<table data-t="narrow"><thead>${row(['Size', 'Weight', 'Origin'], 'th')}</thead><tbody>${row([long, '250 g', long])}${row(['L', '300 g', 'x'.repeat(60)])}</tbody></table>`;
const wide = `<div class="table-wrap"><table data-t="wide"><thead>${row(['A', 'B', 'C', 'D', 'E', 'F'], 'th')}</thead><tbody>${row(['1', '2', '3', '4', '5', '6'])}${row(['7', '8', '9', '10', '11', '12'])}</tbody></table></div>`;

async function fixture(page: Page) {
  await page.setContent(`<!doctype html><html lang="en"><head><title>rte table</title><style>${TOKENS}</style><style>${read('assets/critical.css')}</style><style>${noComments(read('assets/base.css'))}</style></head>
<body><main><div class="rte"><p>Intro</p>${narrow}${wide}</div></main></body></html>`);
}

test.describe('ES1-T547 tĩnh', () => {
  test.beforeEach(({}, ti) => { test.skip(ti.project.name !== 'desktop', 'tĩnh, chạy 1 lần (viewport đặt tay)'); });

  test('rule .rte table không còn display block / overflow-x', () => {
    const css = noComments(read('assets/base.css'));
    const body = css.match(/\.rte table\s*\{([^}]*)\}/)![1];
    expect(body).not.toMatch(/display:\s*block/);
    expect(body).not.toMatch(/overflow-x/);
    expect(css).toMatch(/\.table-wrap\s*\{[^}]*overflow-x:\s*auto/);
  });

  for (const width of [360, 1280]) {
    test(`AC1–AC3 @${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await fixture(page);
      // AC1: bảng 3 cột vừa cột .rte, chữ xuống dòng trong ô
      const n = await page.locator('[data-t="narrow"]').evaluate((el) => {
        const rte = el.closest('.rte')!;
        const cell = el.querySelector('tbody td') as HTMLElement;
        return {
          display: getComputedStyle(el).display,
          fits: el.scrollWidth <= rte.clientWidth,
          wraps: cell.getBoundingClientRect().height > parseFloat(getComputedStyle(cell).lineHeight) * 1.5,
        };
      });
      expect(n.display).toBe('table');
      expect(n.fits, 'scrollWidth bảng ≤ clientWidth .rte').toBe(true);
      if (width === 360) expect(n.wraps, 'chữ xuống dòng trong ô').toBe(true);
      // AC2: .table-wrap cuộn ngang trong khung bo 12 ở 360, trang không cuộn
      const w = await page.locator('.table-wrap').evaluate((el) => {
        const s = getComputedStyle(el);
        return { overflowX: s.overflowX, radius: s.borderTopLeftRadius, scrolls: el.scrollWidth > el.clientWidth };
      });
      expect(w.overflowX).toBe('auto');
      expect(w.radius).toBe('12px');
      if (width === 360) expect(w.scrolls, 'bảng rộng cuộn trong .table-wrap').toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      // AC3: th nền --color-background-alt, td đệm 12 / 16, viền chỉ cạnh dưới; hàng cuối trong .table-wrap không viền
      const th = await page.locator('[data-t="narrow"] th').first().evaluate((el) => getComputedStyle(el).backgroundColor);
      expect(th).toBe('rgb(244, 244, 245)');
      const td = await page.locator('[data-t="narrow"] td').first().evaluate((el) => {
        const s = getComputedStyle(el);
        return { padding: s.padding, top: s.borderTopWidth, start: s.borderLeftWidth, end: s.borderBottomWidth, va: s.verticalAlign, fs: s.fontSize };
      });
      expect(td).toEqual({ padding: '12px 16px', top: '0px', start: '0px', end: '1px', va: 'top', fs: '14px' });
      const last = await page.locator('[data-t="wide"] tbody tr:last-child td').first().evaluate((el) => getComputedStyle(el).borderBottomWidth);
      expect(last).toBe('0px');
    });
  }
});

test.describe('ES1-T547 store', () => {
  const PATH = env('TE547_ARTICLE_PATH');
  for (const width of [360, 1280]) {
    test(`AC1/AC2 bài viết @${width}`, async ({ page }) => {
      test.skip(!PATH, 'thiếu TE547_ARTICLE_PATH: bài có bảng 3 cột và bảng trong .table-wrap');
      await page.setViewportSize({ width, height: 800 });
      await page.goto(PATH!);
      await expectNotChallenged(page);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'trang không cuộn ngang').toBe(true);
      for (const table of await page.locator('.rte table').all()) {
        const r = await table.evaluate((el) => {
          const wrap = el.closest('.table-wrap');
          if (wrap) return { ok: getComputedStyle(wrap).overflowX === 'auto' };
          return { ok: el.scrollWidth <= el.closest('.rte')!.clientWidth };
        });
        expect(r.ok).toBe(true);
      }
    });
  }
});
