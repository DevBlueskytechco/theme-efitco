// KHÔNG CHẮC: spec chưa chạy, chưa type-check trong phiên viết (không có PREVIEW_URL, STORE_PASSWORD; lệnh npx cần duyệt) → kết quả lấy từ
// CI store-tests của PR, chưa báo đạt. Điểm chưa chắc khác: drafts/qa/ES1-T122/test-cases.md mục KHÔNG CHẮC.
// Ticket ES1-T122 TE-7-QA1: 4 block nội dung (testimonials, FAQ, image with text, multicolumn) và Custom Liquid, desktop + Pixel 7 + không JS.
// AC: docs/srs.md#TE-7 bản 0.5 AC1–AC7 (comment CTO 11/11: viết theo SRS 0.5). Test case: drafts/qa/ES1-T122/test-cases.md (TC-xx, TB-xx).
// Gộp: spec cấp story thay cho việc chạy rời ES1-T118..T121 (ticket: "gộp spec dev thành 1 file"); không xoá 4 file đó trong lượt này
// (regression đang chạy trên develop). Không lặp: ES1-T342 (số đo why/FAQ 360/768/1280), ES1-T179 (AC-H24, AC-H25), ES1-T335 (scroll-buttons.js).
// Bug đã biết chạy test.fail(<ticket bug>): ES1-T604 (copy mockup làm default), ES1-T605 (default chữ multicolumn), ES1-T606 (nút tắt opacity),
// ES1-T607 (tên sao). Bug sửa xong → "unexpected pass" → bỏ dòng test.fail.
// Mốc 360/768/1280/1920 đặt bằng setViewportSize ở project desktop; project mobile (Pixel 7) chạy nhóm "Pixel 7" và nhóm không JS.
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... [FRESH_THEME_ID=<id>] npx playwright test tests/e2e/ES1-T122.spec.ts
// Nhóm tĩnh không cần store: npx playwright test ES1-T122.spec.ts --config=drafts/qa/ES1-T122/pw-static.config.mjs -g "ES1-T122 tĩnh"
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { test, expect, type Locator, type Page } from './support/test';
import { expectNotChallenged, gotoStore } from './support/store-guard';
import { isResource429Log, watchShopPay403 } from './support/console-guard';
import { fixtureApplied, loadHomeFixture } from './support/home-fixture';
import { visibleImagesLoaded } from './support/page-ready';
import { newStoreContext } from './support/store-noise';

const ROOT = process.cwd();
const read = (...p: string[]) => readFileSync(join(ROOT, ...p), 'utf8');
type Json = Record<string, unknown>;
const LOCALE = JSON.parse(read('locales', 'en.default.json')) as Json;
const lookup = (obj: Json, key: string): unknown => key.split('.').reduce<unknown>((o, k) => (o && typeof o === 'object' ? (o as Json)[k] : undefined), obj);
const T_REVIEWS = (LOCALE.blocks as Json).testimonials as Record<string, string>;

const TE7 = '/?view=te7';
const HOME = '/';
const WIDTHS = [360, 768, 1280, 1920] as const;
type Width = (typeof WIDTHS)[number];
const BELOW_80 = [360, 768] as const;
const FROM_48 = [768, 1280, 1920] as const;
const TOL = 2;
const FRESH_THEME_ID = process.env.FRESH_THEME_ID;

const BUG = {
  copy: 'ES1-T604 (BUG-ES1-T122-01): templates/index.liquid truyền copy mockup từ locale làm default_* (TE-7 AC5)',
  defaults: 'ES1-T605 (BUG-ES1-T122-02): multicolumn, multicolumn-column có default chữ (TE-7 AC5, ADR 0011 mục 3)',
  disabled: 'ES1-T606 (BUG-ES1-T122-03): nút tắt dùng opacity 0.35 thay cặp màu disabled (TE-7 AC6)',
  stars: 'ES1-T607 (BUG-ES1-T122-04): tên sao "Rated {n} out of 5" thay "{n} out of 5 stars" (TE-7 AC6)',
} as const;

// 8 block của TE-7 (4 block nội dung + con + Custom Liquid) và loại block trong fixture có copy mockup.
const TE7_BLOCKS = ['testimonials', 'testimonial-item', 'faq', 'faq-item', 'image-with-text', 'multicolumn', 'multicolumn-column', 'custom-liquid'] as const;
const TE7_TYPES = new Set<string>(TE7_BLOCKS);
const HOME_TE7 = ['home-inspiration', 'home-testimonials', 'home-why-choose', 'home-faq'] as const;

// ---------- helper ----------
const tid = (scope: Page | Locator, id: string) => scope.getByTestId(id);
const band = (page: Page, id: string) => page.getByTestId(`container-${id}`);
const review = (page: Page, id: string) => page.locator(`[data-testimonial-id="${id}"]`);
const faqItem = (page: Page, id: string) => page.locator(`[data-faq-item-id="${id}"]`);
const question = (page: Page, id: string) => tid(faqItem(page, id), 'faq-question');
const isOpen = (page: Page, id: string) => faqItem(page, id).evaluate((el) => (el as HTMLDetailsElement).open);
const heightOf = (width: number) => (width === 1920 ? 1080 : 900);

const desktopOnly = (name: string) => test.skip(name !== 'desktop', 'mốc đặt bằng setViewportSize, chạy ở project desktop');
const mobileOnly = (name: string) => test.skip(name !== 'mobile', 'chạy trên Pixel 7 (project mobile)');

// Script nền tảng Shopify không phải lỗi theme (ES1-T121 AC4).
const IGNORE_CONSOLE = /shopifycloud|monorail|web-pixels|trekkie|shop\.app|shopifysvc\.com|otlp-http|cdn\.shopify\.com\/s\/(trekkie|javascripts)|status of 429/i;
const ALLOW = new WeakMap<Page, RegExp[]>();
const allowConsole = (page: Page, re: RegExp) => ALLOW.set(page, [...(ALLOW.get(page) ?? []), re]);

function watchConsole(page: Page): string[] {
  const errors: string[] = [];
  const isShopPay403 = watchShopPay403(page);
  page.on('console', (msg) => {
    if (msg.type() !== 'error' || isShopPay403(msg) || isResource429Log(msg)) return;
    const text = msg.text();
    const url = msg.location().url;
    if (IGNORE_CONSOLE.test(text) || IGNORE_CONSOLE.test(url)) return;
    if ((ALLOW.get(page) ?? []).some((re) => re.test(text) || re.test(url))) return;
    errors.push(`${text} @ ${url}`);
  });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  return errors;
}

// DoD: 0 console error, 0 pageerror mọi test có trang.
function guardConsole() {
  let errors: string[] = [];
  test.beforeEach(async ({ page }) => {
    errors = watchConsole(page);
  });
  test.afterEach(async ({}, info) => {
    if (info.status === 'skipped') return;
    expect(errors, '0 console error, 0 pageerror').toEqual([]);
  });
}

async function open(page: Page, path: string, width?: Width | number) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  if (width) await page.setViewportSize({ width, height: heightOf(width) });
  await gotoStore(page, path);
  await expectNotChallenged(page);
}

type Box = { x: number; y: number; width: number; height: number };
// Toạ độ theo trang (cộng scroll), như ES1-T342: so 2 hộp đo ở 2 lần cuộn khác nhau vẫn đúng.
const box = async (l: Locator): Promise<Box> => {
  await l.scrollIntoViewIfNeeded();
  const b = await l.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return r.width || r.height ? { x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height } : null;
  });
  expect(b, 'phần tử có hộp hiển thị').not.toBeNull();
  return b!;
};
// Hộp theo khung nhìn (không cuộn): dùng cho phần tử trong hàng cuộn ngang.
const viewBox = (l: Locator) => l.evaluate((el) => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; });
const near = (actual: number, expected: number, label: string, tol = TOL) =>
  expect(Math.abs(actual - expected), `${label}: ${actual.toFixed(1)} ≈ ${expected}`).toBeLessThanOrEqual(tol);
const overlap = (a: Box, b: Box) => a.x < b.x + b.width - 1 && b.x < a.x + a.width - 1 && a.y < b.y + b.height - 1 && b.y < a.y + a.height - 1;

async function noPageOverflow(page: Page) {
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(over, 'trang không cuộn ngang').toBeLessThanOrEqual(0);
}

// Màu computed của một biến CSS (đọc qua phần tử tạm trong body).
async function cssColor(page: Page, name: string): Promise<string> {
  return page.evaluate((v) => {
    const probe = document.createElement('div');
    probe.style.color = `var(${v})`;
    document.body.append(probe);
    const value = getComputedStyle(probe).color;
    probe.remove();
    return value;
  }, name);
}

// Hàng testimonials đã được scroll-buttons.js nâng cấp (nạp lười khi tới gần khung nhìn).
async function enhanced(scope: Locator) {
  const root = tid(scope, 'testimonials');
  await root.scrollIntoViewIfNeeded();
  await expect(root, 'scroll-buttons.js chưa nâng cấp hàng').toHaveAttribute('data-enhanced', '', { timeout: 15_000 });
  return root;
}

// Tab thật vào phần tử: chèn 1 nút neo ngay trước `before` (mặc định chính phần tử), focus neo rồi Tab.
// Câu FAQ: neo đặt trước <details>, vì phần tử con không phải summary của details đóng bị ẩn.
async function tabInto(page: Page, target: Locator, before: Locator = target) {
  await before.evaluate((el) => {
    document.getElementById('es1-t122-anchor')?.remove();
    const anchor = document.createElement('button');
    anchor.id = 'es1-t122-anchor';
    anchor.type = 'button';
    anchor.textContent = 'anchor';
    el.before(anchor);
    anchor.focus();
  });
  await page.keyboard.press('Tab');
  await expect(target).toBeFocused();
}

const focusRing = (l: Locator) =>
  l.evaluate((el) => {
    const s = getComputedStyle(el);
    return { visible: el.matches(':focus-visible'), style: s.outlineStyle, width: parseFloat(s.outlineWidth) };
  });

async function expectFocusVisible(l: Locator) {
  const ring = await focusRing(l);
  expect(ring.visible, ':focus-visible').toBe(true);
  expect(ring.style, 'outline').not.toBe('none');
  expect(ring.width, 'outline dày > 0').toBeGreaterThan(0);
}

async function expectNoSeriousAxe(page: Page, label: string) {
  await expectNotChallenged(page);
  const { violations } = await new AxeBuilder({ page }).analyze();
  const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(', ')}`), `axe ${label}`).toEqual([]);
}

// Cây accessibility Chromium qua CDP (ES1-T119): trạng thái expanded của summary.
async function expandedByName(page: Page): Promise<Map<string, boolean>> {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Accessibility.enable');
  const { nodes } = await cdp.send('Accessibility.getFullAXTree');
  await cdp.detach();
  const map = new Map<string, boolean>();
  for (const node of nodes) {
    const expanded = node.properties?.find((p) => p.name === 'expanded');
    const name = node.name?.value;
    if (expanded && typeof name === 'string') map.set(name.trim(), Boolean(expanded.value.value));
  }
  return map;
}

// Copy mockup = chữ của 4 block TE-7 trong fixture nội dung Figma (tests/fixtures/home-figma.json, ES1-T331).
const norm = (s: string) =>
  s.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&#39;|&rsquo;/g, "'").replace(/\s+/g, ' ').trim().toLowerCase();
const RESOURCE_KEY = /^(image|accent_image_\d|product|collection|blog|video|video_url|poster|menu|logo)$/;
function mockupCopy(): string[] {
  const fixture = loadHomeFixture();
  const copy = fixture.blocks
    .filter((b) => TE7_TYPES.has(b.type))
    .flatMap((b) => Object.entries(b.settings ?? {}))
    .filter(([key, value]) => typeof value === 'string' && !RESOURCE_KEY.test(key) && !value.startsWith('shopify://'))
    .map(([, value]) => norm(String(value)))
    .filter((text) => text.length >= 4);
  return [...new Set(copy)];
}
// Trùng copy: bằng nhau, hoặc chuỗi dài (≥ 12 ký tự) nằm trong chuỗi kia.
const sameCopy = (a: string, b: string) => a === b || (a.length >= 12 && b.includes(a)) || (b.length >= 12 && a.includes(b));
// Copy có trong chữ trang: so theo ranh giới từ để chữ ngắn ("products") không khớp nhầm giữa từ khác.
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const containsCopy = (text: string, copy: string) => new RegExp(`(^|[^a-z0-9])${escapeRe(copy)}($|[^a-z0-9])`).test(text);

const schemaOf = (name: string) => {
  const m = read('blocks', `${name}.liquid`).match(/\{%-?\s*schema\s*-?%\}([\s\S]*?)\{%-?\s*endschema\s*-?%\}/);
  expect(m, `${name} có schema`).not.toBeNull();
  return JSON.parse(m![1]) as { settings?: Array<{ type: string; id: string; default?: unknown }> };
};
const TEXT_TYPES = new Set(['text', 'textarea', 'richtext', 'inline_richtext', 'html', 'liquid']);

// Tên file JS theme đã tải (đường /t/<id>/assets/<file>.js) và cỡ nén.
const themeScripts = (page: Page) =>
  page.evaluate(() =>
    (performance.getEntriesByType('resource') as PerformanceResourceTiming[])
      .map((e) => ({ m: e.name.match(/\/t\/\d+\/assets\/([^/?#]+\.js)(?:[?#]|$)/), size: e.encodedBodySize || e.transferSize }))
      .filter((e) => e.m)
      .map((e) => ({ file: e.m![1], size: e.size })),
  );

async function scrollThrough(page: Page) {
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = await page.evaluate(() => innerHeight);
  for (let y = 0; y <= total; y += step) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
    await page.waitForTimeout(150);
  }
}

// ======================================================================
test.describe('ES1-T122 tĩnh', () => {
  test.beforeEach(({}, info) => desktopOnly(info.project.name));

  test('TC-19 AC5 schema 8 block: setting chữ không có default (rỗng thì ẩn)', () => {
    test.fail(true, BUG.defaults);
    const withDefault = TE7_BLOCKS.flatMap((name) =>
      (schemaOf(name).settings ?? [])
        .filter((s) => TEXT_TYPES.has(s.type) && typeof s.default === 'string' && s.default.trim() !== '')
        .map((s) => `${name}.${s.id} = "${String(s.default)}"`),
    );
    expect(withDefault).toEqual([]);
  });

  test('TC-19 AC5 không Lorem Ipsum trong 8 block, locale, index.liquid; default không trùng copy mockup', () => {
    for (const name of TE7_BLOCKS) expect(read('blocks', `${name}.liquid`), name).not.toMatch(/lorem|ipsum/i);
    expect(read('locales', 'en.default.json')).not.toMatch(/lorem ipsum/i);
    expect(read('templates', 'index.liquid')).not.toMatch(/lorem|ipsum/i);
    const copy = mockupCopy();
    expect(copy.length, 'fixture có copy 4 block').toBeGreaterThan(10);
    const hits = TE7_BLOCKS.flatMap((name) =>
      (schemaOf(name).settings ?? [])
        .filter((s) => typeof s.default === 'string' && copy.some((c) => sameCopy(c, norm(String(s.default)))))
        .map((s) => `${name}.${s.id}`),
    );
    expect(hits, 'default schema trùng copy mockup').toEqual([]);
  });

  test('TC-20 AC5 index.liquid không truyền copy mockup làm default_* cho block TE-7', () => {
    test.fail(true, BUG.copy);
    const index = read('templates', 'index.liquid');
    const assigns = new Map([...index.matchAll(/assign\s+(\w+)\s*=\s*'([\w.]+)'\s*\|\s*t\b/g)].map((m) => [m[1], m[2]]));
    const calls = [...index.matchAll(/\{%-?\s*block\s+'([\w-]+)'([\s\S]*?)-?%\}/g)].filter((m) => TE7_TYPES.has(m[1]));
    expect(calls.length, 'index.liquid gọi block TE-7').toBeGreaterThan(0);
    const passed = calls.flatMap((m) => [
      ...[...m[2].matchAll(/(default_\w+)\s*:\s*(\w+)\b(?!')/g)].map((p) => ({ block: m[1], param: p[1], value: assigns.has(p[2]) ? String(lookup(LOCALE, assigns.get(p[2])!) ?? '') : '' , source: assigns.get(p[2]) ?? p[2] })),
      ...[...m[2].matchAll(/(default_\w+)\s*:\s*'([^']*)'/g)].map((p) => ({ block: m[1], param: p[1], value: p[2], source: 'literal' })),
    ]);
    const copy = mockupCopy();
    const hits = passed
      .filter((p) => p.value && copy.some((c) => sameCopy(c, norm(p.value))))
      .map((p) => `${p.block}.${p.param} ← ${p.source}: "${norm(p.value)}"`);
    expect(hits).toEqual([]);
  });

  test('TC-23 AC5 Custom Liquid: setting kiểu liquid; index.liquid không gọi custom-liquid, multicolumn (CR-5)', () => {
    const settings = schemaOf('custom-liquid').settings ?? [];
    expect(settings.some((s) => s.type === 'liquid' && s.id === 'custom_liquid')).toBe(true);
    const index = read('templates', 'index.liquid');
    expect(index).not.toMatch(/block\s+'custom-liquid'/);
    expect(index).not.toMatch(/block\s+'multicolumn(-column)?'/);
  });

  test('TC-37 AC7 image-with-text: nút chỉ in khi button_label có chữ; ảnh nhỏ rỗng bị bỏ', () => {
    const src = read('blocks', 'image-with-text.liquid');
    expect(src).toMatch(/\{%-?\s*if button_label != blank\s*-?%\}\s*<a[^>]*data-testid="image-with-text-button"/);
    for (const n of [1, 2, 3]) expect(src, `accent_image_${n}`).toMatch(new RegExp(`if (is_banner and )?accent_image_${n} != blank`));
  });

  // data-motion-src (motion-scrub.js ở banner, scroll-extras.js ở hàng ngang) là lớp chuyển động chung motion.js (ES1-T250, ES1-T485),
  // không phải JS của TE-7: cho phép, ghi annotation. Cấm <script> và data-lazy-module riêng.
  test('TC-40 AC1, AC2 không JS mới: 7 block không script, testimonials chỉ lazy-module + scroll-buttons (+ scroll-extras của motion.js)', () => {
    for (const name of TE7_BLOCKS.filter((n) => n !== 'testimonials')) {
      const src = read('blocks', `${name}.liquid`);
      expect(src, `${name} không <script>`).not.toMatch(/<script/i);
      expect(src, `${name} không data-lazy-module`).not.toMatch(/data-lazy-module/);
      const js = [...src.matchAll(/(data-[\w-]+)="\{\{\s*'([\w-]+\.js)'\s*\|\s*asset_url\s*\}\}"/g)].map((m) => `${m[1]}=${m[2]}`);
      expect(js.filter((j) => !j.startsWith('data-motion-src=')), `${name} chỉ hook motion.js`).toEqual([]);
      if (js.length) test.info().annotations.push({ type: 'motion', description: `${name}: ${js.join(', ')}` });
    }
    const testimonials = read('blocks', 'testimonials.liquid');
    const assets = [...testimonials.matchAll(/'([\w-]+\.js)'\s*\|\s*asset_url/g)].map((m) => m[1]).sort();
    expect(assets).toEqual(['lazy-module.js', 'scroll-buttons.js', 'scroll-extras.js']);
    expect(testimonials).toMatch(/data-lazy-module="\{\{ 'scroll-buttons\.js' \| asset_url \}\}"/);
    expect(read('blocks', 'faq.liquid'), 'FAQ là details/summary, không JS').toMatch(/No JavaScript/);
    expect(read('blocks', 'faq-item.liquid')).toMatch(/<details class="faq-item"/);
    expect(read('blocks', 'faq-item.liquid')).toMatch(/<summary/);
  });

  test('TB-02 AC5 placeholder chỉ in trong nhánh request.design_mode', () => {
    const bad: string[] = [];
    for (const name of TE7_BLOCKS) {
      const src = read('blocks', `${name}.liquid`);
      for (const m of src.matchAll(/data-testid="([\w-]+-placeholder)"/g)) {
        const before = src.slice(0, m.index);
        const tags = [...before.matchAll(/\{%-?\s*(if|elsif|else)\b([^%]*)-?%\}/g)];
        const last = tags[tags.length - 1];
        if (!last || !/request\.design_mode/.test(last[2])) bad.push(`${name}: ${m[1]}`);
      }
    }
    expect(bad).toEqual([]);
  });
});

// ======================================================================
test.describe('ES1-T122 AC1 testimonials hàng ngang', () => {
  test.beforeEach(({}, info) => desktopOnly(info.project.name));
  guardConsole();

  for (const width of WIDTHS) {
    test(`TC-01 AC1 ${width}: 1, 4, 6 mục 1 hàng ngang, không thanh cuộn trình duyệt, trang không cuộn ngang`, async ({ page }) => {
      await open(page, TE7, width);
      for (const [id, count] of [['te7-testimonials', 4], ['te7-testimonials-one', 1], ['te7-testimonials-six', 6]] as const) {
        const scope = band(page, id);
        await scope.scrollIntoViewIfNeeded();
        const items = tid(scope, 'testimonial-item');
        await expect(items, id).toHaveCount(count);
        const tops = await items.evaluateAll((els) => els.map((e) => e.getBoundingClientRect().top));
        expect(Math.max(...tops) - Math.min(...tops), `${id}: mọi card cùng 1 hàng`).toBeLessThanOrEqual(1);
        const list = await tid(scope, 'testimonials-list').evaluate((el) => {
          const s = getComputedStyle(el);
          return { display: s.display, wrap: s.flexWrap, overflowX: s.overflowX, scrollbar: s.scrollbarWidth };
        });
        expect(list, id).toEqual({ display: 'flex', wrap: 'nowrap', overflowX: 'auto', scrollbar: 'none' });
      }
      await noPageOverflow(page);
    });
  }

  for (const width of FROM_48) {
    test(`TC-02 AC1 ${width}: nút tròn 52 ở đầu khối, trắng viền border, rê chuột cam; thanh tiến trình mảnh`, async ({ page }) => {
      await open(page, TE7, width);
      const scope = band(page, 'te7-testimonials');
      const root = await enhanced(scope);
      expect(await root.getAttribute('data-static'), 'hàng 4 mục tràn khung').toBeNull();
      const prev = tid(scope, 'testimonials-prev');
      const next = tid(scope, 'testimonials-next');
      await expect(prev).toBeVisible();
      await expect(next).toBeVisible();
      await expect(prev).toHaveAccessibleName(T_REVIEWS.previous);
      await expect(next).toHaveAccessibleName(T_REVIEWS.next);
      for (const b of [prev, next]) {
        const r = await box(b);
        near(r.width, 52, 'nút rộng', 1);
        near(r.height, 52, 'nút cao', 1);
      }
      const nav = await box(tid(scope, 'testimonials-nav'));
      const list = await box(tid(scope, 'testimonials-list'));
      expect(nav.y + nav.height, 'nút ở đầu khối, trên hàng card').toBeLessThanOrEqual(list.y + 1);

      const look = () => next.evaluate((el) => ({ bg: getComputedStyle(el).backgroundColor, border: getComputedStyle(el).borderTopColor }));
      expect(await look()).toEqual({ bg: await cssColor(page, '--color-background'), border: await cssColor(page, '--color-border') });
      await next.hover();
      const accent = await cssColor(page, '--color-accent');
      await expect.poll(async () => (await look()).bg, { message: 'rê chuột: nền cam' }).toBe(accent);

      const progress = tid(scope, 'carousel-progress');
      await expect(progress).toBeVisible();
      expect((await box(progress)).height, 'thanh tiến trình mảnh').toBeLessThanOrEqual(4);
    });
  }

  test('TC-03 AC1 360: không nút, có thanh tiến trình, cuộn hàng thì tiến trình chạy', async ({ page }) => {
    await open(page, TE7, 360);
    const scope = band(page, 'te7-testimonials');
    await enhanced(scope);
    await expect(tid(scope, 'testimonials-nav')).toBeHidden();
    await expect(tid(scope, 'testimonials-prev')).toBeHidden();
    const progress = tid(scope, 'carousel-progress');
    await expect(progress).toBeVisible();
    const pos = () => progress.evaluate((el) => parseFloat(getComputedStyle(el).getPropertyValue('--scroll-pos') || '0'));
    await expect.poll(() => progress.evaluate((el) => getComputedStyle(el).getPropertyValue('--scroll-size').trim()), { message: 'scroll-extras.js gắn tiến trình' }).not.toBe('');
    await tid(scope, 'testimonials-list').evaluate((el) => el.scrollBy({ left: 300, behavior: 'instant' }));
    await expect.poll(pos, { message: '--scroll-pos tăng' }).toBeGreaterThan(0);
  });

  test('TC-04 AC1 1280: 3 card trọn, card 4 lộ ≥ 25% (4 mục và 6 mục)', async ({ page }) => {
    await open(page, TE7, 1280);
    for (const id of ['te7-testimonials', 'te7-testimonials-six']) {
      const scope = band(page, id);
      await scope.scrollIntoViewIfNeeded();
      const cards = await tid(scope, 'testimonial-item').evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return { x: r.left, w: r.width }; }));
      const vw = await page.evaluate(() => document.documentElement.clientWidth);
      expect(cards[2].x + cards[2].w, `${id}: card 3 trọn`).toBeLessThanOrEqual(vw + 1);
      expect(vw - cards[3].x, `${id}: card 4 lộ ≥ 25%`).toBeGreaterThanOrEqual(cards[3].w * 0.25);
      expect(cards[3].x + cards[3].w, `${id}: card 4 không trọn`).toBeGreaterThan(vw);
    }
  });

  for (const width of WIDTHS) {
    test(`TC-05 AC1 ${width}: hàng vừa khung (1 mục) là lưới tĩnh, không nút, không tiến trình`, async ({ page }) => {
      await open(page, TE7, width);
      const scope = band(page, 'te7-testimonials-one');
      const root = await enhanced(scope);
      await expect(root).toHaveAttribute('data-static', '');
      await expect(tid(scope, 'testimonials-prev')).toBeHidden();
      await expect(tid(scope, 'testimonials-next')).toBeHidden();
      await expect(tid(scope, 'carousel-progress')).toBeHidden();
    });
  }

  test('TC-06 AC1 mỗi mục có quote/tên, sao 0–5 role img, ảnh tuỳ chọn', async ({ page }) => {
    await open(page, TE7, 1280);
    for (const scope of [band(page, 'te7-testimonials'), band(page, 'te7-testimonials-six')]) {
      for (const item of await tid(scope, 'testimonial-item').all()) {
        expect((await tid(item, 'testimonial-quote').count()) + (await tid(item, 'testimonial-author').count()), 'quote hoặc tên').toBeGreaterThan(0);
        const stars = tid(item, 'testimonial-rating');
        await expect(stars).toHaveRole('img');
        await expect(stars.locator('svg')).toHaveCount(5);
        await expect(stars.locator('svg[aria-hidden="true"]')).toHaveCount(5);
      }
    }
    for (const [id, filled] of [['te7-six-1', 0], ['te7-figma-2', 4], ['te7-figma-1', 5]] as const) {
      const n = await tid(review(page, id), 'testimonial-rating').locator('svg').evaluateAll((els) => els.filter((e) => e.classList.contains('rating-stars__star--filled')).length);
      expect(n, `${id} sao đầy`).toBe(filled);
    }
    await expect(tid(review(page, 'te7-six-2'), 'testimonial-image')).toHaveCount(0);
    test.skip((await tid(review(page, 'te7-figma-1'), 'testimonial-image').count()) === 0, 'collections.all không có ảnh cho sản phẩm 1');
    await expect(tid(review(page, 'te7-figma-1'), 'testimonial-image').locator('img')).toHaveCount(1);
  });
});

// ======================================================================
test.describe('ES1-T122 AC2 FAQ', () => {
  test.beforeEach(({}, info) => desktopOnly(info.project.name));
  guardConsole();

  test('TC-08 AC2 1, 3, 5, 10 câu là details/summary, câu không trả lời không có vùng trả lời', async ({ page }) => {
    await open(page, TE7, 1280);
    for (const [id, count] of [['te7-faq-one', 1], ['te7-faq-multiple', 3], ['te7-faq', 5], ['te7-faq-ten', 10]] as const) {
      const items = tid(band(page, id), 'faq-item');
      await expect(items, id).toHaveCount(count);
      const shape = await items.evaluateAll((els) => els.map((e) => `${e.tagName}>${e.firstElementChild?.tagName}>${e.firstElementChild?.firstElementChild?.tagName}`));
      expect(new Set(shape), id).toEqual(new Set(['DETAILS>SUMMARY>H3']));
    }
    await expect(tid(faqItem(page, 'te7-faq-many-3'), 'faq-answer')).toHaveCount(0);
  });

  for (const width of [360, 1280] as const) {
    test(`TC-09 AC2 ${width}: Tab tới câu hỏi, focus thấy rõ, Enter và Space mở/đóng`, async ({ page }) => {
      await open(page, TE7, width);
      const summary = question(page, 'te7-faq-figma-3');
      await summary.scrollIntoViewIfNeeded();
      await tabInto(page, summary, faqItem(page, 'te7-faq-figma-3'));
      await expectFocusVisible(summary);
      expect(await isOpen(page, 'te7-faq-figma-3')).toBe(false);
      for (const [key, open] of [['Enter', true], ['Enter', false], ['Space', true], ['Space', false]] as const) {
        await page.keyboard.press(key);
        await expect.poll(() => isOpen(page, 'te7-faq-figma-3'), { message: `${key} → ${open ? 'mở' : 'đóng'}` }).toBe(open);
      }
    });
  }

  test('TC-10 AC2 trình đọc màn hình: trạng thái mở/đóng trong cây accessibility', async ({ page }) => {
    await open(page, TE7, 1280);
    const q1 = 'How long does shipping take?';
    const q2 = 'Are adjustable dumbbells easy for beginners?';
    const before = await expandedByName(page);
    expect(before.get(q1), 'câu 1 mở').toBe(true);
    expect(before.get(q2), 'câu 2 đóng').toBe(false);
    await question(page, 'te7-faq-figma-2').click();
    await expect.poll(() => isOpen(page, 'te7-faq-figma-2')).toBe(true);
    const after = await expandedByName(page);
    expect(after.get(q1), 'câu 1 đóng').toBe(false);
    expect(after.get(q2), 'câu 2 mở').toBe(true);
  });

  test('TC-11 AC2 allow_multiple tắt: 1 câu mở, chung name; bật: nhiều câu mở, không name', async ({ page }) => {
    await open(page, TE7, 1280);
    const names = await tid(band(page, 'te7-faq'), 'faq-item').evaluateAll((els) => els.map((e) => e.getAttribute('name')));
    expect(new Set(names).size).toBe(1);
    expect(names[0]).toMatch(/^faq-.+/);
    await question(page, 'te7-faq-figma-2').click();
    await expect.poll(() => isOpen(page, 'te7-faq-figma-1')).toBe(false);
    await expect(band(page, 'te7-faq').locator('details[open]')).toHaveCount(1);

    await expect(band(page, 'te7-faq-multiple').locator('details[name]')).toHaveCount(0);
    await question(page, 'te7-faq-many-2').click();
    await expect.poll(() => isOpen(page, 'te7-faq-many-2')).toBe(true);
    expect(await isOpen(page, 'te7-faq-many-1'), 'câu 1 vẫn mở').toBe(true);
  });
});

// ======================================================================
test.describe('ES1-T122 AC3 image with text', () => {
  test.beforeEach(({}, info) => desktopOnly(info.project.name));
  guardConsole();

  async function sides(page: Page, id: string) {
    const scope = band(page, id);
    test.skip((await tid(scope, 'image-with-text-image').count()) === 0, `${id} chưa có ảnh chính (collections.all không có ảnh)`);
    return { image: await box(tid(scope, 'image-with-text-image')), content: await box(tid(scope, 'image-with-text-content')) };
  }

  for (const width of [1280, 1920] as const) {
    test(`TC-13 AC3 ${width}: image_position left / right đúng phía`, async ({ page }) => {
      await open(page, TE7, width);
      const left = await sides(page, 'te7-iwt-left');
      expect(left.image.x + left.image.width, 'left: ảnh trái chữ').toBeLessThanOrEqual(left.content.x + 1);
      const right = await sides(page, 'te7-iwt-right');
      expect(right.content.x + right.content.width, 'right: chữ trái ảnh').toBeLessThanOrEqual(right.image.x + 1);
    });
  }

  for (const width of BELOW_80) {
    test(`TC-14 AC3 ${width}: ảnh trên chữ cho cả left và right`, async ({ page }) => {
      await open(page, TE7, width);
      for (const id of ['te7-iwt-left', 'te7-iwt-right']) {
        const { image, content } = await sides(page, id);
        expect(content.y, `${id}: chữ dưới ảnh`).toBeGreaterThanOrEqual(image.y + image.height - 1);
        near(image.width, width, `${id}: ảnh rộng hết khung`);
      }
      await noPageOverflow(page);
    });
  }

  for (const width of WIDTHS) {
    test(`TC-15 AC3 ${width}: heading h2, richtext, nút tới /collections/all`, async ({ page }) => {
      await open(page, TE7, width);
      const scope = band(page, 'te7-iwt-left');
      await scope.scrollIntoViewIfNeeded();
      const heading = tid(scope, 'image-with-text-heading');
      await expect(heading).toBeVisible();
      expect(await heading.evaluate((el) => el.tagName)).toBe('H2');
      await expect(tid(scope, 'image-with-text-body').locator('p').first()).toBeVisible();
      const button = tid(scope, 'image-with-text-button');
      await expect(button).toBeVisible();
      await expect(button).toHaveAttribute('href', /\/collections\/all\/?$/);
      expect((await box(button)).height, 'nút cao ≥ 44').toBeGreaterThanOrEqual(44);
    });
  }

  test('TC-16 AC3 chưa chọn ảnh chính: không khung rỗng, chữ chiếm cả hàng', async ({ page }) => {
    await open(page, TE7, 1280);
    const scope = band(page, 'te7-iwt-no-image');
    await expect(tid(scope, 'image-with-text-image')).toHaveCount(0);
    await expect(tid(scope, 'image-with-text-image-placeholder')).toHaveCount(0);
    await expect(tid(scope, 'image-with-text-heading')).toBeVisible();
    const block = await box(tid(scope, 'image-with-text'));
    const content = await box(tid(scope, 'image-with-text-content'));
    expect(content.x - block.x, 'chữ không chừa cột ảnh: bắt đầu trong 15% đầu khối').toBeLessThanOrEqual(block.width * 0.15);
  });
});

// ======================================================================
test.describe('ES1-T122 AC4 multicolumn', () => {
  test.beforeEach(({}, info) => desktopOnly(info.project.name));
  guardConsole();

  async function grid(scope: Locator) {
    const boxes = await tid(scope, 'multicolumn-column').evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y) }; }));
    return { count: boxes.length, cols: new Set(boxes.map((b) => b.x)).size, rows: new Set(boxes.map((b) => b.y)).size };
  }

  for (const width of WIDTHS) {
    test(`TC-17 AC4 ${width}: 2, 3, 4 cột — 360 1 cột, 768 2 cột, từ 1280 1 hàng`, async ({ page }) => {
      await open(page, TE7, width);
      for (const [id, n] of [['te7-multicolumn-two', 2], ['te7-multicolumn-three', 3], ['te7-multicolumn-four', 4]] as const) {
        const expected = width === 360 ? { count: n, cols: 1, rows: n } : width === 768 ? { count: n, cols: 2, rows: Math.ceil(n / 2) } : { count: n, cols: n, rows: 1 };
        expect(await grid(band(page, id)), `${id} ở ${width}`).toEqual(expected);
      }
      await noPageOverflow(page);
    });
  }

  test('TC-18 AC4 mỗi cột: icon hoặc ảnh, heading h3, text, link', async ({ page }) => {
    await open(page, TE7, 1280);
    for (const id of ['te7-multicolumn-two', 'te7-multicolumn-three', 'te7-multicolumn-four']) {
      const scope = band(page, id);
      if (id === 'te7-multicolumn-three' && (await tid(scope, 'multicolumn-image').count()) === 0) {
        test.info().annotations.push({ type: 'skip-band', description: 'te7-multicolumn-three: collections.all không có ảnh, bỏ band cột ảnh' });
        continue;
      }
      for (const column of await tid(scope, 'multicolumn-column').all()) {
        const media = (await tid(column, 'multicolumn-icon').count()) + (await tid(column, 'multicolumn-image').count());
        expect(media, 'icon hoặc ảnh (không cả hai)').toBe(1);
        expect(await tid(column, 'multicolumn-column-heading').evaluate((el) => el.tagName)).toBe('H3');
        await expect(tid(column, 'multicolumn-text')).toBeVisible();
        await expect(tid(column, 'multicolumn-link')).toHaveAttribute('href', /\/collections(\/all)?\/?$/);
      }
    }
    await expect(tid(page.locator('[data-multicolumn-column-id="te7-mc-two-2"]'), 'multicolumn-link')).toHaveAttribute('href', /\/collections\/?$/);
  });
});

// ======================================================================
test.describe('ES1-T122 AC5 nội dung mặc định, Custom Liquid', () => {
  test.beforeEach(({}, info) => desktopOnly(info.project.name));
  guardConsole();

  // Theme mới cài: FRESH_THEME_ID, hoặc / khi store chưa áp fixture.
  async function openFresh(page: Page, width: Width) {
    if (FRESH_THEME_ID) {
      await open(page, `/?preview_theme_id=${FRESH_THEME_ID}`, width);
      return;
    }
    await open(page, HOME, width);
    test.skip(await fixtureApplied(page), 'store dev đã áp fixture ES1-T331, không có FRESH_THEME_ID: không có theme mới cài để kiểm');
  }

  const bandText = async (page: Page) => {
    const texts: string[] = [];
    for (const id of HOME_TE7) if ((await band(page, id).count()) > 0) texts.push(norm(await band(page, id).innerText()));
    return texts.join(' | ');
  };

  for (const width of [360, 1920] as const) {
    test(`TC-21 AC5 ${width} theme mới cài: không review, FAQ mẫu, không chữ hướng dẫn, không placeholder, không Verified`, async ({ page }) => {
      await openFresh(page, width);
      await expect(band(page, 'home-testimonials')).toHaveCount(0);
      await expect(band(page, 'home-faq')).toHaveCount(0);
      await expect(page.locator('[data-testid$="-placeholder"]')).toHaveCount(0);
      await expect(tid(page, 'testimonial-verified')).toHaveCount(0);
      const text = await bandText(page);
      for (const s of ['lorem', 'add a ', 'customer name', '360+', 'e. johnson']) expect(text, s).not.toContain(s);
    });

    test(`TC-21 AC5 ${width} theme mới cài: band TE-7 không chứa copy mockup`, async ({ page }) => {
      await openFresh(page, width);
      test.fail(true, BUG.copy);
      const text = await bandText(page);
      const found = mockupCopy().filter((c) => c.length >= 8 && containsCopy(text, c));
      expect(found).toEqual([]);
    });
  }

  test('TC-22 AC5 eyebrow rỗng thì ẩn; band toàn rỗng không render; 0 placeholder', async ({ page }) => {
    await open(page, TE7, 1280);
    await expect(tid(band(page, 'te7-iwt-banner'), 'image-with-text')).toHaveCount(1);
    await expect(tid(band(page, 'te7-iwt-banner'), 'image-with-text-eyebrow')).toHaveCount(0);
    for (const id of ['te7-iwt-empty', 'te7-multicolumn-empty', 'te7-testimonials-empty', 'te7-faq-empty', 'te7-custom-liquid-empty']) {
      await expect(band(page, id), `${id} không render`).toHaveCount(0);
    }
    await expect(page.locator('[data-testid$="-placeholder"]')).toHaveCount(0);
  });

  test('TC-23 AC5 Custom Liquid chạy trên te7; trang chủ không có Custom Liquid, multicolumn', async ({ page }) => {
    await open(page, TE7, 1280);
    const shopName = (await band(page, 'te7-title').locator('h1').innerText()).trim();
    const block = tid(band(page, 'te7-custom-liquid'), 'custom-liquid');
    await expect(block).toHaveText(`Custom Liquid runs on ${shopName}`);
    expect(await block.innerHTML()).not.toContain('{{');

    await open(page, HOME, 1280);
    for (const id of ['custom-liquid', 'multicolumn', 'multicolumn-column']) await expect(tid(page, id), id).toHaveCount(0);
    for (const id of ['home-custom-liquid', 'home-multicolumn']) await expect(band(page, id), id).toHaveCount(0);
  });
});

// ======================================================================
test.describe('ES1-T122 AC6 testimonials đo và a11y', () => {
  test.beforeEach(({}, info) => desktopOnly(info.project.name));
  guardConsole();

  // Ảnh 16 / 9 (foundation §36, ES1-T580): cao = rộng × 9 / 16.
  const SIZE: Record<Width, [number, number]> = { 360: [272, 153], 768: [307, 172.7], 1280: [360, 202.5], 1920: [456, 256.5] };

  for (const width of WIDTHS) {
    test(`TC-24 AC6 ${width}: card ${SIZE[width][0]}, ảnh ${SIZE[width][0]} × ${SIZE[width][1]}`, async ({ page }) => {
      await open(page, TE7, width);
      const scope = band(page, 'te7-testimonials');
      await scope.scrollIntoViewIfNeeded();
      const first = review(page, 'te7-figma-1');
      test.skip((await tid(first, 'testimonial-image').count()) === 0, 'collections.all không có ảnh cho review 1');
      const card = await viewBox(first);
      const image = await viewBox(tid(first, 'testimonial-image').locator('img'));
      near(card.width, SIZE[width][0], 'card rộng');
      near(image.width, SIZE[width][0], 'ảnh rộng');
      near(image.height, SIZE[width][1], 'ảnh cao');
      if (width === 360) {
        const second = await viewBox(review(page, 'te7-figma-2'));
        expect(second.x, 'thấy mép card kế').toBeLessThan(360);
      }
    });

    test(`TC-25 AC6 ${width}: sao ${width < 1280 ? 'hàng riêng dưới tên' : 'cùng hàng tên, Verified'}`, async ({ page }) => {
      await open(page, TE7, width);
      const item = review(page, 'te7-figma-1');
      await item.scrollIntoViewIfNeeded();
      const author = await viewBox(tid(item, 'testimonial-author'));
      const rating = await viewBox(tid(item, 'testimonial-rating'));
      const cy = (b: { y: number; height: number }) => b.y + b.height / 2;
      if (width < 1280) {
        expect(rating.y, 'sao dưới tên').toBeGreaterThanOrEqual(author.y + author.height - 1);
      } else {
        const verified = await viewBox(tid(item, 'testimonial-verified'));
        near(cy(rating), cy(author), 'sao cùng hàng tên', 4);
        near(cy(verified), cy(author), 'Verified cùng hàng tên', 4);
      }
    });

    test(`TC-26 AC6 ${width}: card trong hàng cao bằng nhau`, async ({ page }) => {
      await open(page, TE7, width);
      for (const id of ['te7-testimonials', 'te7-testimonials-six']) {
        const heights = await tid(band(page, id), 'testimonial-item').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height));
        expect(Math.max(...heights) - Math.min(...heights), `${id} cao bằng nhau`).toBeLessThanOrEqual(1);
      }
    });
  }

  test('TC-27 AC6 không ảnh: bắt đầu từ thân; không sản phẩm: không gạch, không hàng sản phẩm', async ({ page }) => {
    await open(page, TE7, 1280);
    for (const id of ['te7-six-2', 'te7-six-4']) {
      const item = review(page, id);
      await expect(tid(item, 'testimonial-image')).toHaveCount(0);
      const gap = await item.evaluate((el) => (el.firstElementChild as HTMLElement).getBoundingClientRect().top - el.getBoundingClientRect().top);
      expect(Math.abs(gap), `${id}: thân ở đỉnh card`).toBeLessThanOrEqual(1);
    }
    for (const id of ['te7-six-3', 'te7-six-4']) {
      const item = review(page, id);
      await expect(tid(item, 'testimonial-product')).toHaveCount(0);
      const ruled = await item.evaluate((el) =>
        [...el.querySelectorAll('*')].filter((n) => parseFloat(getComputedStyle(n).borderTopWidth) > 0 || parseFloat(getComputedStyle(n).borderBlockStartWidth) > 0).map((n) => n.getAttribute('data-testid') ?? n.tagName),
      );
      expect(ruled, `${id}: không gạch ngăn`).toEqual([]);
    }
  });

  test('TC-28 AC6 sao role img, tên "{n} out of 5 stars"', async ({ page }) => {
    test.fail(true, BUG.stars);
    await open(page, TE7, 1280);
    for (const [id, n] of [['te7-six-1', 0], ['te7-figma-2', 4], ['te7-figma-1', 5]] as const) {
      const stars = tid(review(page, id), 'testimonial-rating');
      await expect(stars).toHaveRole('img');
      await expect(stars).toHaveAccessibleName(new RegExp(`(^|\\s)${n} out of 5 stars$`));
    }
  });

  test('TC-29 AC6 1280: nút đầu/cuối aria-disabled="true", vẫn hiện, giữ chỗ', async ({ page }) => {
    await open(page, TE7, 1280);
    const scope = band(page, 'te7-testimonials');
    await enhanced(scope);
    const prev = tid(scope, 'testimonials-prev');
    const next = tid(scope, 'testimonials-next');
    await expect(prev).toHaveAttribute('aria-disabled', 'true');
    await expect(next).toHaveAttribute('aria-disabled', 'false');
    const at = await box(prev);
    await tid(scope, 'testimonials-list').evaluate((el) => el.scrollTo({ left: el.scrollWidth, behavior: 'instant' }));
    await expect(next).toHaveAttribute('aria-disabled', 'true');
    await expect(prev).toHaveAttribute('aria-disabled', 'false');
    await expect(next).toBeVisible();
    const after = await box(prev);
    near(after.x, at.x, 'nút không nhảy chỗ', 1);
  });

  test('TC-30 AC6 1280: nút tắt dùng cặp màu disabled, không opacity', async ({ page }) => {
    await open(page, TE7, 1280);
    const scope = band(page, 'te7-testimonials');
    await enhanced(scope);
    const prev = tid(scope, 'testimonials-prev');
    await expect(prev).toHaveAttribute('aria-disabled', 'true');
    const look = await prev.evaluate((el) => ({
      opacity: getComputedStyle(el).opacity,
      border: getComputedStyle(el).borderTopColor,
      background: getComputedStyle(el).backgroundColor,
      icon: getComputedStyle(el.querySelector('svg') ?? el).color,
    }));
    expect(look).toEqual({
      opacity: '1',
      border: await cssColor(page, '--color-border'),
      background: await cssColor(page, '--color-background'),
      icon: await cssColor(page, '--color-muted-light'),
    });
  });

  for (const width of WIDTHS) {
    test(`TC-31 AC6 ${width}: ul "Customer reviews" tabindex 0, Tab vào hàng, focus thấy rõ, mũi tên cuộn`, async ({ page }) => {
      await open(page, TE7, width);
      const list = tid(band(page, 'te7-testimonials'), 'testimonials-list');
      await list.scrollIntoViewIfNeeded();
      expect(await list.evaluate((el) => el.tagName)).toBe('UL');
      await expect(list).toHaveAttribute('tabindex', '0');
      await expect(list).toHaveAccessibleName(T_REVIEWS.list_label);
      expect(T_REVIEWS.list_label).toBe('Customer reviews');
      await tabInto(page, list);
      await expectFocusVisible(list);
      await page.keyboard.press('ArrowRight');
      await expect.poll(() => list.evaluate((el) => Math.abs(el.scrollLeft)), { message: 'ArrowRight cuộn hàng' }).toBeGreaterThan(0);
    });
  }
});

// ======================================================================
test.describe('ES1-T122 AC7 dưới 80rem: why, FAQ, Make fitness', () => {
  test.beforeEach(({}, info) => desktopOnly(info.project.name));
  guardConsole();

  async function settle(page: Page, scope: Locator) {
    await scope.scrollIntoViewIfNeeded();
    await expect.poll(() => visibleImagesLoaded(scope), { message: 'ảnh đang hiện tải xong', timeout: 15_000 }).toBe(true);
  }
  const loaded = (l: Locator) => l.locator('img').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0);

  for (const width of BELOW_80) {
    test(`TC-32 AC7 ${width}: why ảnh lớn trên chữ, eyebrow --color-muted-on-dark`, async ({ page }) => {
      await open(page, TE7, width);
      const scope = band(page, 'te7-iwt-left');
      const eyebrow = tid(scope, 'image-with-text-eyebrow');
      await expect(eyebrow).toBeVisible();
      expect(await eyebrow.evaluate((el) => getComputedStyle(el).color)).toBe(await cssColor(page, '--color-muted-on-dark'));
      test.skip((await tid(scope, 'image-with-text-image').count()) === 0, 'te7-iwt-left chưa có ảnh chính');
      const image = await box(tid(scope, 'image-with-text-image'));
      const content = await box(tid(scope, 'image-with-text-content'));
      expect(content.y, 'chữ dưới ảnh').toBeGreaterThanOrEqual(image.y + image.height - 1);
    });
  }

  test('TC-33 AC7 why: 360 ảnh nhỏ không hiện, không tải; 768 hiện', async ({ page }) => {
    await open(page, TE7, 360);
    let scope = band(page, 'te7-iwt-left');
    const accents = tid(scope, 'image-with-text-accent');
    test.skip((await accents.count()) < 2, 'te7-iwt-left chưa có 2 ảnh nhỏ');
    await settle(page, scope);
    for (const accent of await accents.all()) {
      await expect(accent).toBeHidden();
      expect(await loaded(accent), 'ảnh nhỏ không tải ở 360').toBe(false);
    }
    await open(page, TE7, 768);
    scope = band(page, 'te7-iwt-left');
    await settle(page, scope);
    for (const accent of await tid(scope, 'image-with-text-accent').all()) await expect(accent).toBeVisible();
  });

  for (const width of BELOW_80) {
    test(`TC-34 AC7 ${width}: FAQ accordion trước ảnh, hàng ≥ 56, icon cùng màu chữ (đóng muted, mở foreground)`, async ({ page }) => {
      await open(page, TE7, width);
      const scope = band(page, 'te7-faq');
      if ((await tid(scope, 'faq-image').count()) > 0) {
        const list = await box(tid(scope, 'faq-list'));
        expect((await box(tid(scope, 'faq-image'))).y, 'nhóm ảnh sau accordion').toBeGreaterThanOrEqual(list.y + list.height - 1);
      }
      const muted = await cssColor(page, '--color-muted');
      const fg = await cssColor(page, '--color-foreground');
      const paint = (l: Locator) => l.evaluate((el) => ({ text: getComputedStyle(el).color, icon: getComputedStyle(el, '::before').borderTopColor }));
      for (const summary of await tid(scope, 'faq-question').all()) expect((await box(summary)).height, 'hàng ≥ 56').toBeGreaterThanOrEqual(56);
      const closed = await paint(question(page, 'te7-faq-figma-2'));
      expect(closed, 'câu đóng').toEqual({ text: muted, icon: muted });
      const opened = await paint(question(page, 'te7-faq-figma-1'));
      expect(opened, 'câu mở').toEqual({ text: fg, icon: fg });
      await question(page, 'te7-faq-figma-2').click();
      await expect.poll(async () => (await paint(question(page, 'te7-faq-figma-2'))).icon, { message: 'mở câu 2: icon thành foreground' }).toBe(fg);
    });
  }

  test('TC-35 AC7 ô số chỉ render khi setting bật và có chữ', async ({ page }) => {
    await open(page, TE7, 768);
    const d1 = band(page, 'te7-d1-faq');
    await expect(tid(d1, 'faq-stat-1')).toHaveCount(1);
    await expect(tid(d1, 'faq-stat-2'), 'show_stat_2 tắt dù có chữ mẫu').toHaveCount(0);
    const one = band(page, 'te7-faq-one');
    await expect(tid(one, 'faq-stat-1')).toHaveCount(0);
    await expect(tid(one, 'faq-stat-2')).toHaveCount(0);
    const ten = band(page, 'te7-faq-ten');
    await expect(tid(ten, 'faq-stat-1')).toBeVisible();
    await expect(tid(ten, 'faq-stat-2')).toHaveCount(0);
  });

  test('TC-36 AC7 Make fitness: 360 hiện 2 ảnh, ảnh còn lại không tải; 768 hiện 3; ảnh không đè chữ; thiếu ảnh bỏ ô', async ({ page }) => {
    for (const width of BELOW_80) {
      await open(page, TE7, width);
      const scope = band(page, 'te7-iwt-banner');
      const accents = tid(scope, 'image-with-text-accent');
      test.skip((await accents.count()) < 3, 'te7-iwt-banner chưa có đủ 3 ảnh');
      await settle(page, scope);
      const visible: Box[] = [];
      let hidden = 0;
      for (const accent of await accents.all()) {
        if (await accent.isVisible()) visible.push(await box(accent));
        else {
          hidden += 1;
          expect(await loaded(accent), `${width}: ảnh ẩn không tải`).toBe(false);
        }
      }
      expect({ visible: visible.length, hidden }, `${width}`).toEqual(width === 360 ? { visible: 2, hidden: 1 } : { visible: 3, hidden: 0 });
      for (const t of ['image-with-text-heading', 'image-with-text-body', 'image-with-text-button']) {
        const text = await box(tid(scope, t));
        for (const img of visible) expect(overlap(img, text), `${width}: ảnh đè ${t}`).toBe(false);
      }
    }
    await expect(tid(band(page, 'te7-iwt-banner-one'), 'image-with-text-accent')).toHaveCount(1);
  });
});

// ======================================================================
test.describe('ES1-T122 trang chủ, axe, JS, biên', () => {
  test.beforeEach(({}, info) => desktopOnly(info.project.name));
  guardConsole();

  for (const width of [1280, 360] as const) {
    test(`TC-38 AC1, AC2, AC3, AC5 ${width}: trang chủ đúng thứ tự Figma, không multicolumn/Custom Liquid, không band TE-7 trống`, async ({ page }) => {
      await open(page, HOME, width);
      const fixture = loadHomeFixture();
      const applied = await fixtureApplied(page);
      const rowIds = fixture.rows.map((r) => r.testid);
      if (applied) for (const id of HOME_TE7) await expect(band(page, id), `${id} có mặt (fixture)`).toHaveCount(1);
      else {
        test.info().annotations.push({ type: 'home', description: 'store chưa áp fixture ES1-T331: kiểm nhánh theme mới cài' });
        await expect(band(page, 'home-testimonials')).toHaveCount(0);
        await expect(band(page, 'home-faq')).toHaveCount(0);
      }
      const order = await page.evaluate((ids) => {
        const seen: string[] = [];
        for (const el of document.querySelectorAll('[data-testid]')) {
          const t = el.getAttribute('data-testid')!;
          if (ids.includes(t) && !seen.includes(t)) seen.push(t);
        }
        return seen;
      }, rowIds);
      expect(order, 'thứ tự band theo hàng Figma').toEqual(rowIds.filter((id) => order.includes(id)));
      for (const id of ['home-custom-liquid', 'home-multicolumn']) await expect(band(page, id)).toHaveCount(0);
      for (const id of HOME_TE7) {
        if ((await band(page, id).count()) === 0) continue;
        const state = await band(page, id).evaluate((el) => ({
          height: el.getBoundingClientRect().height,
          content: [...el.querySelectorAll('*')].some((n) => {
            const r = n.getBoundingClientRect();
            return r.width > 0 && r.height > 0 && getComputedStyle(n).visibility !== 'hidden' && (n.tagName === 'IMG' || (n.textContent ?? '').trim() !== '');
          }),
        }));
        expect(state.height, `${id} cao > 0`).toBeGreaterThan(0);
        expect(state.content, `${id} có nội dung hiện`).toBe(true);
      }
    });
  }

  test('TC-39 AC1, AC2 axe 0 serious: trang chủ, te7 FAQ đóng và mở', async ({ page }) => {
    await open(page, HOME, 1280);
    await scrollThrough(page);
    await expectNoSeriousAxe(page, '/');
    await open(page, TE7, 1280);
    await scrollThrough(page);
    await expectNoSeriousAxe(page, 'te7 FAQ đóng');
    await question(page, 'te7-faq-figma-2').click();
    await question(page, 'te7-faq-many-2').click();
    await expect.poll(() => isOpen(page, 'te7-faq-figma-2')).toBe(true);
    await expectNoSeriousAxe(page, 'te7 FAQ mở');
  });

  test('TC-40 AC1, AC2 JS: không file JS riêng cho TE-7; trang chủ tải sẵn ≤ 40 960 B, sau cuộn ≤ 65 536 B', async ({ page }) => {
    const sum = (list: Array<{ size: number }>) => list.reduce((a, b) => a + b.size, 0);
    const TE7_JS = /faq|testimonial|multicolumn|image-with-text|custom-liquid/i;
    await open(page, HOME, 1280);
    await page.waitForLoadState('load');
    const initial = await themeScripts(page);
    await scrollThrough(page);
    const scrolled = await themeScripts(page);
    test.info().annotations.push({ type: 'js', description: `/ tải sẵn ${sum(initial)} B (${initial.map((s) => s.file).join(', ')}); sau cuộn ${sum(scrolled)} B` });
    expect(sum(initial), 'tải sẵn ≤ 40 960 B (ADR 0006, 0010)').toBeLessThanOrEqual(40_960);
    expect(sum(scrolled), 'sau cuộn ≤ 65 536 B').toBeLessThanOrEqual(65_536);
    expect(scrolled.map((s) => s.file).filter((f) => TE7_JS.test(f))).toEqual([]);

    await open(page, TE7, 1280);
    await scrollThrough(page);
    const te7 = await themeScripts(page);
    expect(te7.map((s) => s.file).filter((f) => TE7_JS.test(f)), 'te7 không có JS riêng cho 4 block').toEqual([]);
    expect(te7.some((s) => s.file === 'scroll-buttons.js'), 'testimonials dùng scroll-buttons.js có sẵn').toBe(true);
  });

  test('TB-01 AC1 mất mạng: scroll-buttons.js lỗi tải, hàng vẫn cuộn bằng bàn phím, nút không vào Tab', async ({ page }) => {
    allowConsole(page, /scroll-buttons|Failed to load resource|net::ERR_FAILED|Failed to fetch dynamically imported module/i);
    await page.route(/\/assets\/scroll-buttons\.js/, (route) => route.abort());
    const failed = page.waitForEvent('requestfailed', { predicate: (r) => r.url().includes('scroll-buttons.js'), timeout: 20_000 });
    await open(page, TE7, 1280);
    const scope = band(page, 'te7-testimonials');
    await scope.scrollIntoViewIfNeeded();
    await failed;
    expect(await tid(scope, 'testimonials').getAttribute('data-enhanced')).toBeNull();
    await expect(tid(scope, 'testimonials-prev')).toBeHidden();
    await expect(tid(scope, 'testimonials-next')).toBeHidden();
    const list = tid(scope, 'testimonials-list');
    await tabInto(page, list);
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => list.evaluate((el) => Math.abs(el.scrollLeft))).toBeGreaterThan(0);
  });

  test('TB-04 AC1, AC2 tối đa 360: 6 review 1 hàng cuộn được, 10 câu mỗi hàng ≥ 56, không tràn ngang', async ({ page }) => {
    await open(page, TE7, 360);
    const six = tid(band(page, 'te7-testimonials-six'), 'testimonials-list');
    expect(await six.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
    for (const summary of await tid(band(page, 'te7-faq-ten'), 'faq-question').all()) expect((await box(summary)).height).toBeGreaterThanOrEqual(56);
    await noPageOverflow(page);
  });

  test('TB-02, TB-05 AC5 storefront: 0 placeholder, không ảnh hỏng khi thiếu resource', async ({ page }) => {
    await open(page, TE7, 1280);
    await expect(page.locator('[data-testid$="-placeholder"]')).toHaveCount(0);
    const broken = await page.evaluate(() => [...document.querySelectorAll('main img')].filter((img) => !(img.getAttribute('src') || img.getAttribute('srcset'))).length);
    expect(broken, 'img không có src').toBe(0);
  });
});

// ======================================================================
test.describe('ES1-T122 Pixel 7', () => {
  test.beforeEach(({}, info) => mobileOnly(info.project.name));
  guardConsole();

  test('TC-07 AC1 Pixel 7: vuốt ngang hàng review, không nút, có tiến trình', async ({ page }) => {
    await open(page, TE7);
    const scope = band(page, 'te7-testimonials');
    await enhanced(scope);
    await expect(tid(scope, 'testimonials-nav')).toBeHidden();
    await expect(tid(scope, 'carousel-progress')).toBeVisible();
    const list = tid(scope, 'testimonials-list');
    const b = await viewBox(list);
    const start = { x: Math.round(b.x + b.width * 0.7), y: Math.round(b.y + Math.min(b.height / 2, 200)) };
    // Điểm chạm phải nằm trong hàng (không bị header, lớp phủ che): vuốt trượt chỗ khác thì báo rõ, không thành scrollLeft 0 khó hiểu.
    expect(await list.evaluate((el, p) => el.contains(document.elementFromPoint(p.x, p.y)), start), 'điểm chạm nằm trong hàng review').toBe(true);
    // Vuốt bằng chuỗi touchStart → 10 touchMove (22 px/bước, 220 px) → touchEnd qua Input.dispatchTouchEvent (đường Playwright touchscreen dùng).
    // Không dùng Input.synthesizeScrollGesture: CI Linux (run 45265394543) gửi xong gesture mà khung hình không đổi, scrollLeft 0;
    // cùng DOM + CSS + JS lấy từ trace run đó chạy lại Pixel 7 thì cả 2 cách đều cuộn 332 → lỗi ở cách bơm gesture, không ở theme.
    const cdp = await page.context().newCDPSession(page);
    const at = (x: number) => [{ x, y: start.y, id: 1 }];
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: at(start.x) });
    for (let i = 1; i <= 10; i++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: at(start.x - i * 22) });
      await page.waitForTimeout(16);
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await cdp.detach();
    await expect.poll(() => list.evaluate((el) => Math.abs(el.scrollLeft)), { message: 'vuốt cuộn hàng' }).toBeGreaterThan(0);
  });

  test('TB-03 AC1, AC2, AC3, AC4 Pixel 7: multicolumn 1 cột, ảnh trên chữ, chạm câu FAQ mở/đóng', async ({ page }) => {
    await open(page, TE7);
    const cols = await tid(band(page, 'te7-multicolumn-four'), 'multicolumn-column').evaluateAll((els) => new Set(els.map((e) => Math.round(e.getBoundingClientRect().x))).size);
    expect(cols, 'multicolumn 1 cột').toBe(1);
    const left = band(page, 'te7-iwt-left');
    if ((await tid(left, 'image-with-text-image').count()) > 0) {
      const image = await box(tid(left, 'image-with-text-image'));
      expect((await box(tid(left, 'image-with-text-content'))).y).toBeGreaterThanOrEqual(image.y + image.height - 1);
    }
    await question(page, 'te7-faq-figma-2').scrollIntoViewIfNeeded();
    await question(page, 'te7-faq-figma-2').tap();
    await expect.poll(() => isOpen(page, 'te7-faq-figma-2')).toBe(true);
    expect(await isOpen(page, 'te7-faq-figma-1'), 'chỉ 1 câu mở').toBe(false);
    await noPageOverflow(page);
  });

  test('TC-09 AC2 Pixel 7: Enter/Space trên câu hỏi (bàn phím ngoài)', async ({ page }) => {
    await open(page, TE7);
    const summary = question(page, 'te7-faq-figma-3');
    await summary.scrollIntoViewIfNeeded();
    await tabInto(page, summary, faqItem(page, 'te7-faq-figma-3'));
    await page.keyboard.press('Enter');
    await expect.poll(() => isOpen(page, 'te7-faq-figma-3')).toBe(true);
    await page.keyboard.press('Space');
    await expect.poll(() => isOpen(page, 'te7-faq-figma-3')).toBe(false);
  });
});

// ======================================================================
// Không JS: TE-7 không có JS cho FAQ, image with text, multicolumn, Custom Liquid → kết quả phải giống nhóm có JS (ticket ES1-T122).
test.describe('ES1-T122 không JS', () => {
  test.use({ javaScriptEnabled: false });
  guardConsole();

  async function openNoJs(page: Page, isDesktop: boolean, path = TE7) {
    if (isDesktop) await page.setViewportSize({ width: 1280, height: 900 });
    await gotoStore(page, path);
    await expectNotChallenged(page);
  }

  const snapshot = (page: Page) =>
    page.evaluate(() => {
      const all = (sel: string, root: ParentNode = document) => [...root.querySelectorAll(sel)];
      const by = (t: string) => all(`[data-testid="${t}"]`);
      const hrefs = (el: Element) => all('a[href]', el).map((a) => a.getAttribute('href'));
      return {
        bands: all('[data-testid^="container-te7-"]').map((e) => e.getAttribute('data-testid')),
        reviews: by('testimonial-item').map((e) => [e.getAttribute('data-testimonial-id'), ...hrefs(e)].join('|')),
        faq: by('faq-item').map((e) => [e.getAttribute('data-faq-item-id'), (e as HTMLDetailsElement).open, e.getAttribute('name') ?? ''].join('|')),
        iwt: by('image-with-text').map((e) => [e.getAttribute('data-image-with-text-id'), ...hrefs(e)].join('|')),
        columns: by('multicolumn-column').map((e) => [e.getAttribute('data-multicolumn-column-id'), ...hrefs(e)].join('|')),
        customLiquid: by('custom-liquid').map((e) => (e.textContent ?? '').replace(/\s+/g, ' ').trim()),
      };
    });

  test('TC-41 AC1, AC2, AC3, AC4 không JS: cấu trúc 4 block và Custom Liquid giống nhóm có JS', async ({ page, browser, baseURL }, info) => {
    const isDesktop = info.project.name === 'desktop';
    await openNoJs(page, isDesktop);
    const noJs = await snapshot(page);
    const use = info.project.use;
    const device = { viewport: use.viewport, deviceScaleFactor: use.deviceScaleFactor, isMobile: use.isMobile, hasTouch: use.hasTouch, userAgent: use.userAgent };
    const context = await newStoreContext(browser, { ...device, baseURL, storageState: 'tests/setup/state.json', javaScriptEnabled: true, ...(isDesktop ? { viewport: { width: 1280, height: 900 } } : {}) });
    try {
      const withJs = await context.newPage();
      await gotoStore(withJs, TE7);
      await expectNotChallenged(withJs);
      expect(noJs).toEqual(await snapshot(withJs));
    } finally {
      await context.close();
    }
    expect(noJs.reviews.length).toBeGreaterThan(0);
    expect(noJs.faq.length).toBeGreaterThan(0);
  });

  test('TC-12 AC2 không JS: bấm mở/đóng, 1 câu mở khi tắt allow_multiple, nhiều câu khi bật, Enter/Space', async ({ page }, info) => {
    await openNoJs(page, info.project.name === 'desktop');
    await question(page, 'te7-faq-figma-2').click();
    await expect.poll(() => isOpen(page, 'te7-faq-figma-2')).toBe(true);
    expect(await isOpen(page, 'te7-faq-figma-1')).toBe(false);
    await question(page, 'te7-faq-many-2').click();
    await expect.poll(() => isOpen(page, 'te7-faq-many-2')).toBe(true);
    expect(await isOpen(page, 'te7-faq-many-1')).toBe(true);
    const summary = question(page, 'te7-faq-figma-3');
    await summary.focus();
    await page.keyboard.press('Enter');
    await expect.poll(() => isOpen(page, 'te7-faq-figma-3')).toBe(true);
    await page.keyboard.press('Space');
    await expect.poll(() => isOpen(page, 'te7-faq-figma-3')).toBe(false);
  });

  test('TC-41 AC1 không JS: hàng review cuộn bằng bàn phím, không nút, không tiến trình', async ({ page }, info) => {
    await openNoJs(page, info.project.name === 'desktop');
    const scope = band(page, 'te7-testimonials');
    await expect(tid(scope, 'testimonials-prev')).toBeHidden();
    await expect(tid(scope, 'carousel-progress')).toBeHidden();
    const list = tid(scope, 'testimonials-list');
    await list.scrollIntoViewIfNeeded();
    await list.focus();
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => list.evaluate((el) => Math.abs(el.scrollLeft))).toBeGreaterThan(0);
  });

  test('TC-41 AC3, AC4 không JS: nút image with text và link multicolumn đi được', async ({ page }, info) => {
    const isDesktop = info.project.name === 'desktop';
    await openNoJs(page, isDesktop);
    await Promise.all([page.waitForURL(/\/collections\/all\/?(\?|$)/), tid(band(page, 'te7-iwt-left'), 'image-with-text-button').click()]);
    await openNoJs(page, isDesktop);
    await Promise.all([page.waitForURL(/\/collections\/?(\?|$)/), tid(page.locator('[data-multicolumn-column-id="te7-mc-two-2"]'), 'multicolumn-link').click()]);
  });
});
