// ES1-T326 (TE-22-R2-FE1): snippet breadcrumb + JSON-LD BreadcrumbList, snippet page-title, .page-banner (lớp tối 75% → 60%).
// Phần tĩnh + fixture: đọc file, dựng markup đúng như snippet xuất bằng page.setContent với assets/base.css thật và token
// mặc định của config/settings_schema.json (space_base 4). Phần store: chỉ chạy khi có PREVIEW_URL/STORE_ORIGIN.
// Snippet chưa có template gọi (TE-6-R2-FE2, TE-4-R2-FE3, TE-20/TE-21 gắn sau): trang store chỉ kiểm "không breadcrumb thì
// không BreadcrumbList" và "có breadcrumb thì đúng 1 BreadcrumbList khớp chữ"; đủ 3 dạng do TE-22-R2-QA1 kiểm khi đã gắn.
// Chạy: npx playwright test tests/e2e/ES1-T326.spec.ts --project=desktop
import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { expectNotChallenged } from './support/store-guard';

const BASE = readFileSync('assets/base.css', 'utf8');
const CRITICAL = readFileSync('assets/critical.css', 'utf8');
const BREADCRUMB = readFileSync('snippets/breadcrumb.liquid', 'utf8');
const PAGE_TITLE = readFileSync('snippets/page-title.liquid', 'utf8');
const START = '/** Breadcrumb, tiêu đề trang, banner trang con (TE-22-R2-FE1';
const END = '/** Collection page (TE-6';
const section = () => {
  const from = BASE.indexOf(START);
  return BASE.slice(from, BASE.indexOf(END, from));
};
const body = (src: string) => src.slice(src.indexOf('{% enddoc %}'));
const BASE_URL = process.env.STORE_ORIGIN || (process.env.PREVIEW_URL ? new URL(process.env.PREVIEW_URL).origin : undefined);

// Token mặc định (settings_schema.json); css-variables.liquid là nguồn thật trên store.
const TOKENS = `:root{--space-1:4px;--space-2:8px;--space-3:12px;--space-4:16px;--space-5:24px;--space-6:32px;--space-7:48px;--space-8:120px;
--page-margin:20px;--page-width:91rem;--header-height:80px;--radius-input:8px;--radius-button:8px;--radius-card:12px;--radius-pill:999px;
--color-background:#fff;--color-foreground:#1a1a1a;--color-muted:#6b6b6b;--color-muted-light:#808080;--color-border:#e5e5e5;
--color-background-alt:#f4f4f5;--color-background-dark:#1a1a1a;--color-background-dark-foreground:#fff;--color-accent:#c8400e;
--font-size-xs:.8125rem;--font-size-sm:.875rem;--font-size-base:1rem;--font-size-h1:2rem;--line-height-body:1.5;--line-height-heading:1.1;
--font-heading--family:serif;--font-heading--weight:700;--font-heading--weight-display:800;--font-primary--family:sans-serif;
--motion-fast:150ms;--motion-base:250ms;--motion-slow:500ms;--ease-out:ease-out}`;

// 60 ký tự không khoảng trắng: phải xuống dòng, không "…" (AC10)
const LONG = 'Adjustable-Dumbbell-Pair-With-Quick-Dial-And-Storage-Tray-XL';
const WHITE_IMG = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080"><rect width="100%" height="100%" fill="#fff"/></svg>')}`;
const trail = (prefix: string) => `
<nav class="breadcrumb" aria-label="Breadcrumb" data-testid="${prefix}">
  <ol class="breadcrumb__list">
    <li class="breadcrumb__item"><a class="breadcrumb__link" href="#" data-testid="${prefix}-home">Home</a></li>
    <li class="breadcrumb__item" data-testid="${prefix}-middle"><a class="breadcrumb__link" href="#">Collections</a></li>
    <li class="breadcrumb__item"><span class="breadcrumb__current" aria-current="page" data-testid="${prefix}-current">${LONG}</span></li>
  </ol>
</nav>`;
const FIXTURE = `
<div class="plain">${trail('bc')}
  <div class="page-title" data-testid="pt"><p class="page-title__eyebrow" data-testid="pt-eyebrow">Shop</p><h1 class="page-title__heading" data-testid="pt-h1">${LONG}</h1><p class="page-title__meta" data-testid="pt-meta">12 products</p></div>
</div>
<div class="page-banner" data-testid="banner">
  <div class="image page-banner__media" data-testid="banner-media"><img src="${WHITE_IMG}" width="1920" height="1080" alt=""></div>
  <div class="page-banner__content" data-testid="banner-content">${trail('bn')}
    <div class="page-title"><h2 class="page-title__heading" data-testid="bn-title">Strength Training</h2></div>
  </div>
</div>`;

const mount = async (page: Page, width: number) => {
  await page.setViewportSize({ width, height: 900 });
  await page.setContent(`<!doctype html><html><head><style>${TOKENS}${CRITICAL}${BASE}</style></head><body>${FIXTURE}</body></html>`);
};
const box = async (page: Page, id: string) => (await page.getByTestId(id).boundingBox())!;
const css = (page: Page, id: string, prop: string, pseudo: string | null = null) =>
  page.getByTestId(id).evaluate((el, [p, ps]) => getComputedStyle(el, ps).getPropertyValue(p!), [prop, pseudo] as const);

test.describe('ES1-T326 tĩnh', () => {
  test.beforeEach(({}, ti) => { test.skip(ti.project.name !== 'desktop', 'tĩnh, chạy 1 lần'); });

  test('TC-01 breadcrumb: nav + ol, mục cuối span aria-current, link qua routes.* / URL đối tượng, chuỗi qua | t', () => {
    const src = body(BREADCRUMB);
    expect(src).toContain(`<nav class="breadcrumb" aria-label="{{ 'general.breadcrumb.label' | t }}" data-testid="breadcrumb">`);
    expect(src).toContain('<ol class="breadcrumb__list">');
    expect(src).toMatch(/<span class="breadcrumb__current" aria-current="page"/);
    expect(src).toContain('href="{{ routes.root_url }}"');
    expect(src).toContain('routes.collections_url');
    expect(src).not.toMatch(/href="\/|'\/(collections|blogs|pages|search)/);
    expect(src).not.toMatch(/truncate|ellipsis/);
    const locale = JSON.parse(readFileSync('locales/en.default.json', 'utf8'));
    expect(locale.general.breadcrumb).toEqual({ home: 'Home', label: 'Breadcrumb' });
    expect(locale.collections.title).toBe('Collections');
    expect(locale.search.title).toBe('Search');
  });

  test('TC-02 breadcrumb chỉ ở 7 loại template, không ở index/cart/404/password/gift_card', () => {
    const src = body(BREADCRUMB);
    const whens = [...src.matchAll(/when '([^']+)'/g)].map((m) => m[1]).sort();
    expect(whens).toEqual(['article', 'blog', 'collection', 'list-collections', 'page', 'product', 'search']);
    expect(src).toMatch(/else\s+assign has_trail = false/);
    expect(src).toMatch(/\{%- if has_trail and current_title != blank -%\}/);
    // ?view=quiz: Home / {title}, không mục Collections
    expect(src).toMatch(/unless template\.suffix == 'quiz'/);
  });

  test('TC-03 JSON-LD BreadcrumbList cùng biến với phần hiển thị, URL tuyệt đối, chỉ trong nhánh có breadcrumb', () => {
    const src = body(BREADCRUMB);
    expect(src.match(/application\/ld\+json/g)).toHaveLength(1);
    expect(src.match(/"@type": "BreadcrumbList"/g)).toHaveLength(1);
    const jsonLd = src.slice(src.indexOf('<script type="application/ld+json"'), src.indexOf('</script>'));
    expect(jsonLd).toContain('"name": {{ home_title | json }}');
    expect(jsonLd).toContain('"item": {{ origin_root | json }}');
    expect(jsonLd).toContain('"name": {{ middle_title | json }}');
    expect(jsonLd).toContain('"item": {{ middle_item | json }}');
    expect(jsonLd).toContain('"name": {{ current_title | json }}');
    expect(src).toContain('assign origin_root = request.origin | append: routes.root_url');
    expect(src).toContain('assign middle_item = request.origin | append: middle_url');
    expect(src.indexOf('<script type="application/ld+json"')).toBeLessThan(src.lastIndexOf('{%- endif -%}'));
  });

  test('TC-04 page-title: eyebrow → h1 → meta, đúng 1 h1, rỗng thì không thẻ', () => {
    const src = body(PAGE_TITLE);
    expect(src.match(/<h1\b/g)).toHaveLength(1);
    const order = ['page-title__eyebrow', 'page-title__heading', 'page-title__meta'].map((c) => src.indexOf(c));
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(src).toContain('{%- if title != blank -%}');
    expect(src).toContain('{%- if eyebrow != blank %}');
    expect(src).toContain('{%- if meta != blank %}');
  });

  test('TC-05 CSS mục mới: 0 màu literal, 0 thuộc tính vật lý, 0 z-index số, không ellipsis; gradient 75% → 60%; ngân sách', () => {
    const raw = section();
    const cssText = raw.replace(/\/\*[\s\S]*?\*\//g, '');
    expect(cssText.length).toBeGreaterThan(1000);
    expect(cssText).not.toMatch(/#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(|:\s*(white|black)\b/i);
    expect(cssText).not.toMatch(/(^|[\s;{])(left|right|top|bottom|width|height|(margin|padding)-(left|right|top|bottom))\s*:/m);
    expect(cssText).not.toMatch(/z-index|text-overflow|line-clamp/);
    expect(cssText).toMatch(/color-mix\(in srgb, var\(--color-background-dark\) 75%, transparent\),\s*color-mix\(in srgb, var\(--color-background-dark\) 60%, transparent\) 50%/);
    expect(gzipSync(BASE).length).toBeLessThanOrEqual(49152);
    expect(Buffer.byteLength(CRITICAL)).toBeLessThanOrEqual(10240);
  });

  for (const width of [360, 768, 1280]) {
    test(`TC-06 ${width}: link cao 44, mục cuối dài xuống dòng đủ chữ, không tràn ngang`, async ({ page }) => {
      await mount(page, width);
      expect((await box(page, 'bc-home')).height).toBeGreaterThanOrEqual(44);
      expect(await css(page, 'bc-current', 'text-overflow')).not.toBe('ellipsis');
      expect(await page.getByTestId('bc-current').textContent()).toBe(LONG);
      const current = await box(page, 'bc-current');
      expect(current.x + current.width).toBeLessThanOrEqual(width);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      if (width === 360) expect(current.height).toBeGreaterThan(20);
    });
  }

  test('TC-07 màu breadcrumb nền trắng: link muted, mục cuối foreground 500, dấu "/" muted-light không đọc', async ({ page }) => {
    await mount(page, 1280);
    expect(await css(page, 'bc-home', 'color')).toBe('rgb(107, 107, 107)');
    expect(await css(page, 'bc-current', 'color')).toBe('rgb(26, 26, 26)');
    expect(await css(page, 'bc-current', 'font-weight')).toBe('500');
    expect(await css(page, 'bc-middle', 'content', '::before')).toMatch(/"\/"/);
    expect(await css(page, 'bc-middle', 'color', '::before')).toBe('rgb(128, 128, 128)');
    expect(await css(page, 'bc', 'font-size')).toBe('14px');
    await page.getByTestId('bc-home').hover();
    await expect(page.getByTestId('bc-home')).toHaveCSS('color', 'rgb(26, 26, 26)');
  });

  test('TC-08 page-title: thứ tự eyebrow → h1 → meta; đệm 16/48 dưới 64rem, 24/64 từ 64rem; breadcrumb đệm 16 → 24', async ({ page }) => {
    await mount(page, 360);
    const [e, h, m] = [await box(page, 'pt-eyebrow'), await box(page, 'pt-h1'), await box(page, 'pt-meta')];
    expect(e.y).toBeLessThan(h.y);
    expect(h.y).toBeLessThan(m.y);
    expect(await css(page, 'pt', 'padding-block-start')).toBe('16px');
    expect(await css(page, 'pt', 'padding-block-end')).toBe('48px');
    expect(await css(page, 'bc', 'padding-block-start')).toBe('16px');
    await mount(page, 1280);
    expect(await css(page, 'pt', 'padding-block-start')).toBe('24px');
    expect(await css(page, 'pt', 'padding-block-end')).toBe('64px');
    expect(await css(page, 'bc', 'padding-block-start')).toBe('24px');
  });

  test('TC-09 banner 360: cách header 16, cao ≥ 280, bo 16, ảnh phủ, chữ đáy trên lớp tối, chữ trắng', async ({ page }) => {
    await mount(page, 360);
    const banner = await box(page, 'banner');
    expect(await css(page, 'banner', 'margin-block-start')).toBe('16px');
    expect(banner.height).toBeGreaterThanOrEqual(280);
    expect(await css(page, 'banner', 'border-start-start-radius')).toBe('16px');
    expect(await box(page, 'banner-media')).toMatchObject({ x: banner.x, y: banner.y, width: banner.width, height: banner.height });
    const content = await box(page, 'banner-content');
    expect(Math.round(content.y + content.height)).toBe(Math.round(banner.y + banner.height));
    expect(await css(page, 'banner-content', 'padding-block-start')).toBe('32px');
    expect(await css(page, 'banner-content', 'padding-inline-start')).toBe('24px');
    for (const id of ['bn-home', 'bn-current', 'bn-title']) expect(await css(page, id, 'color')).toBe('rgb(255, 255, 255)');
    const overlay = await css(page, 'banner-media', 'background-image', '::after');
    expect(overlay).toContain('linear-gradient');
    expect(overlay).toMatch(/0\.75\)/);
    expect(overlay).toMatch(/0\.6\) 50%/);
    // Chữ vẽ trên lớp tối (không z-index): điểm giữa tiêu đề trúng chính tiêu đề
    const t = await box(page, 'bn-title');
    const hit = await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.getAttribute('data-testid'), [t.x + 4, t.y + t.height / 2]);
    expect(hit).toBe('bn-title');
  });

  test('TC-10 banner 1280: cách header 24, cao ≥ 360, đệm chữ 48', async ({ page }) => {
    await mount(page, 1280);
    expect(await css(page, 'banner', 'margin-block-start')).toBe('24px');
    expect((await box(page, 'banner')).height).toBeGreaterThanOrEqual(360);
    expect(await css(page, 'banner-content', 'padding-block-start')).toBe('48px');
    expect(await css(page, 'banner-content', 'padding-inline-start')).toBe('48px');
  });
});

test.describe('ES1-T326 store', () => {
  test.beforeEach(({}, ti) => {
    test.skip(!BASE_URL, 'cần PREVIEW_URL hoặc STORE_ORIGIN');
    test.skip(ti.project.name !== 'desktop', 'HTML giống nhau ở 2 project');
  });

  const breadcrumbState = (page: Page) =>
    page.evaluate(() => {
      const lists = [...document.querySelectorAll('script[type="application/ld+json"]')]
        .map((s) => { try { return JSON.parse(s.textContent || ''); } catch { return null; } })
        .filter((d) => d && d['@type'] === 'BreadcrumbList');
      const nav = document.querySelectorAll('nav[aria-label="Breadcrumb"]');
      const names = [...document.querySelectorAll('nav[aria-label="Breadcrumb"] li')].map((li) => li.textContent!.trim());
      return { navs: nav.length, lists, names };
    });

  for (const path of ['/', '/cart']) {
    test(`TC-11 ${path}: không breadcrumb, không BreadcrumbList`, async ({ page }) => {
      await page.goto(path);
      await expectNotChallenged(page);
      const state = await breadcrumbState(page);
      expect(state.navs).toBe(0);
      expect(state.lists).toHaveLength(0);
    });
  }

  test('TC-12 /collections/all: có breadcrumb thì đúng 1 BreadcrumbList khớp tên và thứ tự; không có thì 0', async ({ page }) => {
    await page.goto('/collections/all');
    await expectNotChallenged(page);
    const state = await breadcrumbState(page);
    if (state.navs === 0) {
      expect(state.lists).toHaveLength(0);
      test.info().annotations.push({ type: 'skip-data', description: 'template collection chưa gọi snippet breadcrumb (TE-6-R2-FE2)' });
      return;
    }
    expect(state.navs).toBe(1);
    expect(state.lists).toHaveLength(1);
    const items = state.lists[0].itemListElement as { position: number; name: string; item?: string }[];
    expect(items.map((i) => i.name)).toEqual(state.names);
    expect(items.map((i) => i.position)).toEqual(items.map((_, i) => i + 1));
    expect(items.slice(0, -1).every((i) => /^https?:\/\//.test(i.item ?? ''))).toBe(true);
  });
});
