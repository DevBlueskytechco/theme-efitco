// KHÔNG CHẮC: spec chưa chạy trên trình duyệt (sandbox phiên Dev FE chặn Chromium), chưa type-check; chờ CI.
// Ticket ES1-T387 TE-11-R2-FE1: popup kết quả quiz (markup + CSS), trang ?view=quiz (docs/srs.md TE-11 AC3, AC5, AC8, AC9; docs/ui-spec/quiz-result.md).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T387.spec.ts
// Nhóm "static" và "fixture" không gọi store. Nhóm "store" cần preview; test cần sản phẩm skip khi thiếu TE11_TAGS_READY + TE11_QUIZ_COLLECTION (ES1-T417).
// Hành vi JS của popup (Esc, scrim, trả focus, Add To Cart giữ popup, quick view nhúng) là TE-11-R2-BE1, không kiểm ở đây.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { expectNotChallenged } from './support/store-guard';
import { env } from './support/store-data';

const read = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');
const noComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
const storeData = () => JSON.parse(read('tests/e2e/store-data.json')) as Record<string, unknown>;
const tagsReady = () => env('TE11_TAGS_READY') === 'true' || storeData().TE11_TAGS_READY === true;
const QUIZ = env('TE11_QUIZ_COLLECTION') ?? (storeData().TE11_QUIZ_COLLECTION as string | undefined);
const quizReady = () => tagsReady() && !!QUIZ;
const QUIZ_SKIP = 'TE11_TAGS_READY chưa true hoặc thiếu TE11_QUIZ_COLLECTION (ES1-T178, ES1-T417)';
const QUIZ_PATH = `/collections/${encodeURIComponent(QUIZ ?? 'all')}`;
// ES1-T178: te11-quiz có 7 sản phẩm gắn tag; upper+beginner+home = 5, core+beginner+home = 1
const MANY_TAGS = 'quiz-upper+quiz-beginner+quiz-home';
const ONE_TAGS = 'quiz-core+quiz-beginner+quiz-home';
const NO_TAGS = '/collections/all?view=quiz';

const tid = (page: Page, id: string) => page.getByTestId(id);
const desktopOnce = (name: string) => test.skip(name !== 'desktop', 'không cần store, chạy 1 lần');

async function expectNoSeriousAxe(page: Page) {
  await expectNotChallenged(page);
  const { violations } = await new AxeBuilder({ page }).analyze();
  const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(serious.map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
}

test.describe('ES1-T387 static', () => {
  test.beforeEach(({}, ti) => desktopOnce(ti.project.name));

  test('AC9 schema: results_popup mặc định true, empty_text không default', () => {
    const src = read('blocks/quiz.liquid');
    const schema = JSON.parse(src.slice(src.indexOf('{% schema %}') + 12, src.indexOf('{% endschema %}')));
    const byId = Object.fromEntries(schema.settings.map((s: { id: string }) => [s.id, s]));
    expect(byId.results_popup.default).toBe(true);
    expect(byId.empty_text.default ?? '').toBe('');
    expect(schema.presets).toBeUndefined();
  });

  test('AC3 AC5 markup popup: modal-dialog lớp quiz, dialog có tiêu đề + mô tả, 2 partial', () => {
    const src = read('blocks/quiz.liquid');
    expect(src).toContain('<modal-dialog data-layer="quiz" data-sheet-below="48rem"');
    expect(src).toMatch(/<dialog[\s\S]*?aria-labelledby="\{\{ results_title_id \}\}"[\s\S]*?aria-describedby="\{\{ status_id \}\}"/);
    expect(src).toContain("{% partial 'quiz-results' %}");
    expect(src).toContain("{% partial 'quiz-results-actions' %}");
    expect(src.match(/\{% partial 'quiz-results-actions' %\}/g)).toHaveLength(1);
    expect(src).toMatch(/role="status"[^>]*data-quiz-results-status/);
    const code = src.replace(/\{% doc %\}[\s\S]*?\{% enddoc %\}/, '');
    expect(code).not.toMatch(/product\.variants\b(?!_count)|\| json|variant-json/);
  });

  test('AC8 template ?view=quiz: breadcrumb, block results_view, không h1 trong template', () => {
    const src = read('templates/collection.quiz.liquid');
    expect(src).toContain('aria-label="{{ \'blocks.quiz.breadcrumb\' | t }}"');
    expect(src).toContain('aria-current="page"');
    expect(src).toContain("results_view: true");
    expect(src).toContain("retake_anchor: 'quiz'");
    expect(src).not.toContain('<h1');
  });

  test('locale: chuỗi kết quả quiz', () => {
    const quiz = JSON.parse(read('locales/en.default.json')).blocks.quiz;
    expect(quiz.results_heading).toBe('Your Gear Shortlist');
    expect(quiz.empty_heading).toBe('No Exact Match');
    expect(quiz.results_summary).toEqual({ one: expect.stringContaining('{{ count }}'), other: expect.stringContaining('{{ answers }}') });
    expect(quiz.view_all).toContain('{{ total }}');
    expect(quiz.empty_cta).toBeUndefined();
  });

  // Trần 49 152 chưa đạt ở develop (50 805 B sau T332, [Q] ES1-T454); CTO 13/11: PR này không được tăng base.css so với develop
  test('CSS: popup cũ (literal figma, px) đã xoá; mục quiz 0 màu literal, 0 z-index số; gzip ≤ develop 50 805', () => {
    const css = read('assets/base.css');
    expect(css).not.toContain('.quiz__dialog-close');
    expect(css).not.toContain('quiz-results-title');
    expect(css).not.toContain('motion-shimmer');
    const clean = noComments(css);
    // Chỉ mục của ticket này (kết quả, popup, trang); .quiz__form/.quiz__subheading đè Figma ở mục home là việc khác
    const quizRules = clean.split('}').filter((r) => /\.quiz(__results|__answer|__loading|__skeleton|__card|__notice|__quick-view|__shortlist|__dialog|__empty|__error|-page)/.test(r)).join('}');
    expect(quizRules).not.toMatch(/#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(|--figma-/i);
    expect(quizRules).not.toMatch(/z-index\s*:\s*-?\d/);
    expect(quizRules).not.toMatch(/(^|[\s;{])(left|right|top|bottom|margin-left|margin-right|padding-left|padding-right)\s*:/m);
    expect(css).not.toContain('motion-breathe');
    expect(gzipSync(css).length).toBeLessThanOrEqual(50805);
  });

  test('index.te11 truyền collection te11-quiz, giữ panel dưới bước (ES1-T139)', () => {
    const src = read('templates/index.te11.liquid');
    expect(src).toContain("collection: collections['te11-quiz']");
    expect(src).toContain('results_popup: false');
  });
});

// Fixture: markup như blocks/quiz.liquid render (popup), base.css thật, token mặc định settings_schema (space_base 4).
const TOKENS = `:root{--space-1:4px;--space-2:8px;--space-3:12px;--space-4:16px;--space-5:24px;--space-6:32px;--space-7:48px;
--page-margin:20px;--radius-input:8px;--radius-button:8px;--radius-card:12px;--radius-pill:999px;
--color-background:#fff;--color-foreground:#1a1a1a;--color-muted:#6b6b6b;--color-muted-light:#808080;--color-border:#e5e5e5;
--color-background-alt:#f4f4f5;--color-background-sand:#f1ebe0;--color-accent:#c8400e;--color-accent-on-sand:#b4390c;--color-accent-foreground:#fff;
--color-sale:#c8102e;--color-badge-new:#467a48;--color-background-dark:#1a1a1a;--color-background-dark-foreground:#fff;--color-background-panel:#393942;
--font-size-sm:.875rem;--font-size-base:1rem;--font-size-h3:1.5rem;--font-size-h2:2rem;--line-height-body:1.5;--line-height-heading:1.1;
--font-heading--family:serif;--font-heading--weight-display:800;--motion-fast:150ms;--motion-base:250ms;--motion-hero:1400ms;--ease-out:ease-out}`;

const card = (n: number) => `<li class="quiz__results-item"><div class="product-card"><h2 class="product-card__title"><a href="#">P${n}</a></h2></div>
<div class="quiz__card-action"><form class="quiz__card-form"><button class="button button--secondary quiz__card-button" data-testid="quiz-card-add">Add To Cart</button>
<p class="quiz__card-error" role="alert"></p></form></div></li>`;

const DIALOG = (busy: boolean) => `
<dialog class="dialog dialog--l quiz__dialog" aria-labelledby="t" aria-describedby="s" data-testid="quiz-dialog">
  <button class="close-button dialog__close" aria-label="Close">x</button>
  <div class="quiz__results" ${busy ? 'aria-busy="true"' : ''} data-quiz-results-panel>
    <div class="quiz__results-header dialog__header">
      <h2 class="quiz__results-heading dialog__title" id="t" tabindex="-1">Your Gear Shortlist</h2>
      <ul class="quiz__answers" role="list" aria-label="Your answers" data-testid="quiz-answers"><li class="quiz__answer">Lower body</li></ul>
      <p class="quiz__results-status" id="s" role="status"><span class="quiz__loading" data-testid="loading"><span class="spinner"></span>Matching your gear…</span><span data-quiz-results-status-text>5 products match all 3 answers.</span></p>
    </div>
    <div class="quiz__results-main dialog__body">
      <div class="quiz__notice-region" role="status" data-testid="quiz-notice"></div>
      <ul class="quiz__results-grid quiz__skeleton" role="list" aria-hidden="true" data-testid="quiz-skeleton"><li class="skeleton-card"><span class="skeleton skeleton--media"></span></li></ul>
      <div class="quiz__results-body" data-testid="quiz-results">${busy ? '' : `<ul class="quiz__results-grid" role="list" data-testid="quiz-results-grid">${[1, 2, 3, 4].map(card).join('')}</ul>`}</div>
      <div class="empty-state quiz__empty" hidden data-testid="quiz-empty"></div>
    </div>
    <div class="dialog__footer quiz__dialog-actions">
      <button class="button button--secondary" data-testid="quiz-restart">Retake Quiz</button>
      <div class="quiz__results-actions">${busy ? '' : '<a class="button" href="#" data-testid="quiz-view-all">View All 5 Matches</a>'}</div>
    </div>
  </div>
</dialog>`;

async function fixture(page: Page, busy: boolean, width: number) {
  await page.setViewportSize({ width, height: 900 });
  await page.setContent(`<!doctype html><html lang="en"><head><title>quiz</title><style>${TOKENS}</style><style>${read('assets/critical.css')}</style><style>${read('assets/base.css')}</style></head><body><main><h1>Home</h1>${DIALOG(busy)}</main></body></html>`);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.evaluate(() => (document.querySelector('dialog') as HTMLDialogElement).showModal());
}

test.describe('ES1-T387 fixture (CSS thật, không store)', () => {
  test.beforeEach(({}, ti) => desktopOnce(ti.project.name));

  test('AC3 2a đang tìm: skeleton + spinner, chân chỉ Retake, không card cũ', async ({ page }) => {
    await fixture(page, true, 1280);
    await expect(tid(page, 'quiz-skeleton')).toBeVisible();
    await expect(tid(page, 'loading')).toBeVisible();
    await expect(page.locator('[data-quiz-results-status-text]')).toBeHidden();
    await expect(tid(page, 'quiz-restart')).toBeVisible();
    await expect(tid(page, 'quiz-view-all')).toHaveCount(0);
  });

  test('AC3 có kết quả: skeleton ẩn, lưới 4 cột từ 48rem, 2 cột dưới 48rem, dialog L ≤ 1120', async ({ page }) => {
    await fixture(page, false, 1280);
    await expect(tid(page, 'quiz-skeleton')).toBeHidden();
    await expect(tid(page, 'loading')).toBeHidden();
    await expect(tid(page, 'quiz-view-all')).toBeVisible();
    const cols = (p: Page) => p.getByTestId('quiz-results-grid').evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length);
    expect(await cols(page)).toBe(4);
    expect(await tid(page, 'quiz-dialog').evaluate((el) => el.offsetWidth)).toBeLessThanOrEqual(1120);
    await page.setViewportSize({ width: 768, height: 1024 });
    expect(await cols(page)).toBe(4);
    await page.setViewportSize({ width: 360, height: 760 });
    expect(await cols(page)).toBe(2);
    // Sheet < 48rem: rộng hết màn, sát đáy
    const box = await tid(page, 'quiz-dialog').evaluate((el) => ({ w: el.offsetWidth, bottom: Math.round(el.getBoundingClientRect().bottom) }));
    expect(box).toEqual({ w: 360, bottom: 760 });
  });

  test('AC3 nút card cao ≥ 44, vùng live rỗng không thêm khoảng', async ({ page }) => {
    await fixture(page, false, 360);
    for (const h of await tid(page, 'quiz-card-add').evaluateAll((els) => els.map((el) => el.getBoundingClientRect().height))) {
      expect(h).toBeGreaterThanOrEqual(44);
    }
    expect(await tid(page, 'quiz-notice').evaluate((el) => getComputedStyle(el).position)).toBe('absolute');
  });

  test('AC5 axe 0 serious trong dialog mở', async ({ page }) => {
    await fixture(page, false, 1280);
    await expectNotChallenged(page);
    const { violations } = await new AxeBuilder({ page }).include('dialog').analyze();
    expect(violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([]);
  });
});

test.describe('ES1-T387 store', () => {
  test('AC8 ?view=quiz không tag: 1 h1 "Your Gear Shortlist", breadcrumb, empty "No Exact Match" + 2 đích', async ({ page }) => {
    const res = await page.goto(NO_TAGS);
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText('Your Gear Shortlist');
    await expect(tid(page, 'quiz-page-eyebrow')).toHaveText(/product finder/i);
    const crumb = page.getByRole('navigation', { name: 'Breadcrumb' });
    await expect(crumb.locator('[aria-current="page"]')).toHaveText('Your Gear Shortlist');
    await expect(tid(page, 'quiz-empty')).toBeVisible();
    await expect(tid(page, 'quiz-empty-heading')).toHaveText('No Exact Match');
    await expect(tid(page, 'quiz-empty-retake')).toHaveAttribute('href', /\/#quiz$/);
    await expect(tid(page, 'quiz-empty-cta')).toHaveAttribute('href', /\/collections\/all$/);
    await expect(tid(page, 'quiz-view-all')).toHaveCount(0);
    await expectNoSeriousAxe(page);
  });

  test('AC8 nojs: trang kết quả đọc được không cần JS', async ({ browser }) => {
    const use = test.info().project.use;
    const context = await browser.newContext({ javaScriptEnabled: false, storageState: 'tests/setup/state.json', baseURL: use.baseURL });
    const page = await context.newPage();
    await page.goto(NO_TAGS);
    await expect(page.locator('h1')).toHaveText('Your Gear Shortlist');
    await expect(tid(page, 'quiz-empty')).toBeVisible();
    await context.close();
  });

  test('AC3 AC8 nhiều kết quả: ≤ 4 card h2, còn hàng trước, pill bỏ quiz-, View All N tới URL tag, ảnh đầu eager', async ({ page }) => {
    test.skip(!quizReady(), QUIZ_SKIP);
    await page.goto(`${QUIZ_PATH}/${MANY_TAGS}?view=quiz`);
    const grid = tid(page, 'quiz-results-grid');
    await expect(grid.locator('h2')).toHaveCount(4);
    await expect(tid(page, 'quiz-results-summary')).toHaveText(/^\d+ products match all 3 answers\. Showing the top 4\.$/);
    await expect(tid(page, 'quiz-answer')).toHaveText(['Upper', 'Beginner', 'Home']);
    const all = tid(page, 'quiz-view-all');
    await expect(all).toHaveText(/View All \d+ Matches/);
    expect(new URL((await all.getAttribute('href'))!, page.url()).pathname).toBe(`${QUIZ_PATH}/${MANY_TAGS}`);
    await expect(tid(page, 'quiz-shop-all')).toHaveCount(0);
    await expect(tid(page, 'quiz-page-retake')).toHaveAttribute('href', /\/#quiz$/);
    const loading = await grid.locator('img.product-card__image').evaluateAll((imgs) => imgs.map((i) => i.getAttribute('loading')));
    expect(loading[0]).toBe('eager');
    expect(loading.slice(1).every((l) => l === 'lazy')).toBe(true);
    // Còn hàng trước: sau card Sold Out không còn card mua được
    const kinds = await grid.locator('.quiz__card-action > *').evaluateAll((els) => els.map((el) => el.getAttribute('data-testid')));
    const firstSold = kinds.indexOf('quiz-card-sold-out');
    if (firstSold >= 0) expect(kinds.slice(firstSold).every((k) => k === 'quiz-card-sold-out')).toBe(true);
    for (const k of kinds) expect(['quiz-card-form', 'quiz-card-choose', 'quiz-card-sold-out']).toContain(k);
    await expectNoSeriousAxe(page);
  });

  test('AC3 ≤ 4 kết quả: "Shop All Equipment" thay "View All"', async ({ page }) => {
    test.skip(!quizReady(), QUIZ_SKIP);
    await page.goto(`${QUIZ_PATH}/${ONE_TAGS}?view=quiz`);
    await expect(tid(page, 'product-card')).toHaveCount(1);
    await expect(tid(page, 'quiz-results-summary')).toHaveText('1 product matches all 3 answers.');
    await expect(tid(page, 'quiz-shop-all')).toBeVisible();
    await expect(tid(page, 'quiz-view-all')).toHaveCount(0);
  });

  test('AC5 trang chủ: popup đóng lúc tải, đúng lớp quiz, tiêu đề tabindex -1, 0 serious axe', async ({ page }) => {
    await page.goto('/');
    const quiz = tid(page, 'quiz').first();
    test.skip((await quiz.count()) === 0, 'Trang chủ chưa có quiz (fixture store dev)');
    const dialog = page.locator('modal-dialog[data-layer="quiz"] > dialog[data-testid="quiz-dialog"]');
    await expect(dialog).toHaveCount(1);
    await expect(dialog).not.toHaveAttribute('open', /.*/);
    const titleId = await dialog.getAttribute('aria-labelledby');
    await expect(page.locator(`#${titleId}`)).toHaveAttribute('tabindex', '-1');
    await expect(page.locator(`#${await dialog.getAttribute('aria-describedby')}`)).toHaveAttribute('role', 'status');
    await expectNoSeriousAxe(page);
  });
});
