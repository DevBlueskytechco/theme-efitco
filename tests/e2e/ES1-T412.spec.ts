// KHÔNG CHẮC: (1) spec chưa chạy trên STORE_URL (phiên QA không có PREVIEW_URL/STORE_PASSWORD) → chưa báo đạt, chờ store-tests trên PR.
// (2) `--grep @static` không cần store nhưng playwright.config.ts globalSetup (tests/setup/password.ts) đọc PREVIEW_URL → thiếu thì lỗi trước khi vào test;
//     đã hỏi Tech Lead ở ES1-T534 mục 2. Ngoài phạm vi QA sửa config. Đã chạy @static bằng config tạm không globalSetup: 15 pass, 1 fixme.
// (3) AC10 toàn cây: snippets/product-card.liquid:225 (ảnh hover card) còn `where: 'media_type', 'image'`, trái ADR 0012 mục Đo nhưng ngoài 3 nơi §4 yêu cầu → fixme chờ Tech Lead.
//
// ES1-T412 TS-QA1: kiểm tuân thủ Theme Store cho ES1-T304 (drafts/techlead/ES1-T304/task-split.md §3 TS-QA1, §4; ADR 0011 Đo, ADR 0012 Đo).
// Một file, 2 nhóm theo ticket: @static (đọc repo bằng fs, không mở trang) và store dev (desktop + Pixel 7, nojs khi trang render server).
// Không trùng spec task con: ES1-T403/T404/T407/T408/T410 kiểm chi tiết từng task; file này là bộ hồi quy tuân thủ ở mức mục Shopify,
// chạy ở mọi PR để task REQ-0002 sau không làm vỡ lại. Mỗi test ghi: AC (drafts/qa/ES1-T412/ac-list.md), mục Shopify, audit, task TS-*.
// Chạy: npx playwright test tests/e2e/ES1-T412.spec.ts --grep @static --project=desktop
//       PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T412.spec.ts
// Dữ liệu store (env hoặc tests/e2e/store-data.json), thiếu → fixme có lý do:
//   TS_GIFT_CARD_URL           gift card phát hành trên store dev (ES1-T298)
//   TS_BLOG_NO_EXCERPT_PATH    blog có bài không excerpt nhưng có content (fallback TE407_BLOG_PATH)
//   TS_PAYMENT_ICON_COUNT      số cổng thanh toán bật trong admin (shop.enabled_payment_types.size)
//   TE407_ARTICLE_PATH         bài trên blog bật comment + duyệt (mặc định /blogs/te20-no-tag/te20-no-tag-01, MODERATED, ES1-T385)
//   TE407_CONTACT_PATH         page gán template contact (mặc định /pages/contact)
//   TE403_PAGE_PATH            page có h5, h6 trong nội dung (/pages/te403-rte)
//   TE4_MEDIA_HANDLE           sản phẩm đủ 4 loại media (media-dủ-loại), mở qua ?view=featured-product
import { test, expect, type Locator, type Page } from './support/test';
import { newStoreContext } from './support/store-noise';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { env } from './support/store-data';
import { expectNotChallenged, gotoStore } from './support/store-guard';
import { watchShopPay403 } from './support/console-guard';

const ROOT = process.cwd();
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');
const list = (dir: string, ext = '.liquid') => readdirSync(join(ROOT, dir)).filter((f) => f.endsWith(ext)).map((f) => `${dir}/${f}`);
const noCssComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const noLiquidComments = (src: string) => src.replace(/\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g, '').replace(/\{%-?\s*#[^%]*-?%\}/g, '');

/** Dòng khớp regex, dạng `file:dòng: nội dung`, để báo lỗi chỉ đúng chỗ. */
function hits(files: string[], re: RegExp, strip = noLiquidComments): string[] {
  const out: string[] = [];
  for (const f of files) {
    strip(read(f)).split('\n').forEach((line, i) => { if (re.test(line)) out.push(`${f}:${i + 1}: ${line.trim()}`); });
  }
  return out;
}

// Template test (index.*.liquid) bị loại khỏi gói release (D8, ADR 0011 mục 6, TS-OPS1) → không tính vào §22.
const TEST_TEMPLATE = /^templates\/index\.[^/]+\.liquid$/;
const RELEASE_TEMPLATES = () => list('templates').filter((f) => !TEST_TEMPLATE.test(f));
const LAYOUTS = () => list('layout');
const THEME_LIQUID = () => ['blocks', 'snippets', 'layout', 'templates'].flatMap((d) => list(d));
const CSS_FILES = () => list('assets', '.css');
const TITLE_SELECTORS = ['.product-card__title', '.article-card__title', '.video-card__product-title', '.product-sticky-bar__title'];

const tag = (shopify: string, audit: string, task: string) => [
  { type: 'shopify', description: shopify },
  { type: 'audit', description: audit },
  { type: 'task', description: task },
];

// ================================================================ @static — đọc repo, không cần store
test.describe('ES1-T412 @static', () => {
  test.beforeEach(({}, ti) => { test.skip(ti.project.name !== 'desktop', 'tĩnh, chạy 1 lần ở project desktop'); });

  test('AC1 TC-01 §22 §8: index.liquid + layout không tài nguyên demo, countdown giả, Verified demo', () => {
    test.info().annotations.push(...tag('§22 Demo store resources, §8 Accurate claims', 'B#48, B#51, C1, C6', 'TS-FE3 (ES1-T405)'));
    const re = /collections\['|all_products\['|images\['|metafields\.custom|23:59|home_demo|default_verified/;
    expect(hits(['templates/index.liquid', ...LAYOUTS()], re)).toEqual([]);
  });

  test('AC1 TC-02 §22 (ADR 0011 Đo): mọi template release + layout không handle/ảnh/metafield/video demo', () => {
    test.info().annotations.push(...tag('§22 Demo store resources', 'B#48, B#51', 'TS-FE3 (ES1-T405)'));
    const re = /collections\['|all_products\['|images\['|metafields\.custom|23:59|home_demo|default_verified|figma-|efx-|aqz-KE-bpKQ|demo_video|demo_countdown_end/;
    expect(hits([...RELEASE_TEMPLATES(), ...LAYOUTS()], re)).toEqual([]);
  });

  test('AC2 TC-03 §14: không còn logo-efitco (file + lời gọi)', () => {
    test.info().annotations.push(...tag('§14 Theme settings: logo fallback shop name', 'C10', 'TS-FE1 (ES1-T401)'));
    expect(existsSync(join(ROOT, 'snippets/logo-efitco.liquid'))).toBe(false);
    expect(hits(THEME_LIQUID(), /logo-efitco/, (s) => s)).toEqual([]);
  });

  test('AC2 TC-04 §14: header/footer/password/gift card fallback shop.name khi không có logo', () => {
    test.info().annotations.push(...tag('§14 logo fallback, §7 Password, §7 Gift card', 'C10, A#63', 'TS-FE1 (ES1-T401), TS-FE8 (ES1-T408)'));
    for (const f of ['blocks/header.liquid', 'blocks/footer.liquid']) {
      const src = read(f);
      expect(src, f).toMatch(/assign logo = block\.settings\.logo \| default: settings\.logo/);
      expect(src, f).toMatch(/\{%-? else -?%\}\s*<span class="site-(header|footer)__logo-text">\{\{ shop\.name \| escape \}\}<\/span>/);
    }
    expect(read('blocks/password-hero.liquid')).toMatch(/if settings\.logo != blank[\s\S]*?alt: shop\.name[\s\S]*?\{%-? else -?%\}\s*<span class="password-logo__text">\{\{ shop\.name \| escape \}\}<\/span>/);
    expect(read('templates/password.liquid')).toMatch(/password-hero/);
    expect(read('templates/gift_card.liquid')).toMatch(/if settings\.logo != blank[\s\S]*?alt: shop\.name[\s\S]*?\{%-? else -?%\}\s*<span class="gift-card__logo-text">\{\{ shop_name \}\}<\/span>/);
  });

  test('AC3 TC-05 §13 §14: settings_data không social_, free_shipping; current rỗng', () => {
    test.info().annotations.push(...tag('§13 Social, §14 Theme settings defaults', 'B#43, C11', 'TS-FE1 (ES1-T401)'));
    const raw = read('config/settings_data.json');
    expect(raw).not.toMatch(/social_|free_shipping/);
    const json = JSON.parse(raw.replace(/^\s*\/\*[\s\S]*?\*\//, ''));
    expect(json.current).toEqual({});
  });

  test('AC4 TC-06 §14: settings_schema có logo + favicon (image_picker); <link rel=icon> chỉ in khi có, ở theme + password', () => {
    test.info().annotations.push(...tag('§14 Favicon, logo', 'C9, C10', 'TS-FE1 (ES1-T401)'));
    const schema = JSON.parse(read('config/settings_schema.json')) as Array<{ settings?: Array<{ id?: string; type?: string; default?: unknown }> }>;
    const settings = schema.flatMap((g) => g.settings ?? []);
    for (const id of ['logo', 'favicon']) {
      const s = settings.find((x) => x.id === id);
      expect(s, id).toBeTruthy();
      expect(s!.type, id).toBe('image_picker');
      expect(s!.default, id).toBeUndefined();
    }
    for (const f of ['layout/theme.liquid', 'layout/password.liquid']) {
      expect(read(f), f).toMatch(/\{%-? if settings\.favicon != blank -?%\}\s*<link rel="icon"[^>]*href="\{\{ settings\.favicon \| image_url: width: 32, height: 32 \}\}"/);
    }
  });

  test('AC5 TC-07 §8: tier_*_percent default 0 ở bundle-builder, shop-the-look', () => {
    test.info().annotations.push(...tag('§8 Accurate claims (no fake discount)', 'C3', 'TS-FE4 (ES1-T406)'));
    for (const f of ['blocks/bundle-builder.liquid', 'blocks/shop-the-look.liquid']) {
      const schema = JSON.parse(read(f).split('{% schema %}')[1].split('{% endschema %}')[0]) as { settings: Array<{ id?: string; default?: unknown }> };
      const tiers = schema.settings.filter((s) => /^tier_\d+_percent$/.test(s.id ?? ''));
      expect(tiers.length, f).toBeGreaterThanOrEqual(3);
      for (const s of tiers) expect(s.default, `${f} ${s.id}`).toBe(0);
    }
  });

  test('AC6 TC-08 §8 §14: locales không claim/số liệu mẫu, chính tả aRE, &nbsp;', () => {
    test.info().annotations.push(...tag('§8 Accurate claims, §14 Default content', 'C4, N1, N2, N13', 'TS-FE2 (ES1-T402), TS-FE4 (ES1-T406)'));
    for (const f of list('locales', '.json')) {
      expect(hits([f], /10,000|15%|Warranty|aRE|&nbsp;/, (s) => s), f).toEqual([]);
    }
  });

  test('AC7 TC-09 §7 Layout: footer không efx-pay/figma_pay; payment icon chỉ từ shop.enabled_payment_types', () => {
    test.info().annotations.push(...tag('§7 Layout: payment icons', 'A#37', 'TS-FE2 (ES1-T402)'));
    const src = read('blocks/footer.liquid');
    expect(src).not.toMatch(/efx-pay|figma_pay/);
    expect(src).toMatch(/for type in shop\.enabled_payment_types[\s\S]*?type \| payment_type_svg_tag/);
    expect(read('blocks/footer.liquid')).not.toMatch(/15%/);
  });

  test('AC8 TC-10 §7 Blog: trang blog dùng excerpt_or_content (template → block → card)', () => {
    test.info().annotations.push(...tag('§7 Blog: article.excerpt_or_content', 'B#18', 'TS-FE7 (ES1-T407), TE-20-R2-FE1 (ES1-T381)'));
    // ES1-T381 chuyển markup blog.liquid sang blocks/blog-articles + snippets/article-card: kiểm cả chuỗi, không chỉ blog.liquid.
    const tpl = read('templates/blog.liquid');
    expect(tpl).toContain("{% block 'blog-articles' %}");
    const chain = tpl + read('blocks/blog-articles.liquid') + read('snippets/article-card.liquid');
    expect(chain).toMatch(/\.excerpt_or_content \| strip_html \| truncatewords:/);
    expect(chain).not.toMatch(/\{\{-? (article|post|featured)\.excerpt -?\}\}/);
  });

  test('AC9 TC-11 §7 Page: tồn tại templates/page.contact.liquid có form contact', () => {
    test.info().annotations.push(...tag('§7 Page: contact template', 'B#6', 'TS-FE7 (ES1-T407), TE-21-R2-FE1 (ES1-T383)'));
    expect(existsSync(join(ROOT, 'templates/page.contact.liquid'))).toBe(true);
    expect(read('templates/page.contact.liquid') + read('blocks/contact-form.liquid')).toMatch(/form 'contact'/);
  });

  test('AC10 TC-12 §4 rich media: PDP, featured, quickview, snippet media không lọc media_type', () => {
    test.info().annotations.push(...tag('§4 Rich media (product, featured product, quick view)', 'A#22, A#23', 'TS-FE9 (ES1-T409)'));
    const files = ['blocks/product-media.liquid', 'blocks/featured-product.liquid', 'snippets/product-media-item.liquid',
      ...RELEASE_TEMPLATES().filter((f) => /quick-view|featured-product/.test(f))];
    expect(hits(files, /where: 'media_type'/)).toEqual([]);
    for (const f of ['blocks/product-media.liquid', 'blocks/featured-product.liquid']) {
      expect(read(f), f).toMatch(/render 'product-media-item'/);
    }
  });

  test('AC10 TC-13 §4 (ADR 0012 Đo): toàn bộ blocks/snippets/templates release không where: media_type', () => {
    test.info().annotations.push(...tag('§4 Rich media', 'A#22', 'TS-FE9 (ES1-T409)'));
    const found = hits([...list('blocks'), ...list('snippets'), ...RELEASE_TEMPLATES()], /where: 'media_type'/);
    // Chỉ còn product-card hover (ảnh thứ 2 của card) → chờ Tech Lead chốt: sửa code hay sửa ADR 0012 Đo (ES1-T534 mục 1).
    test.fixme(found.length === 1 && found[0].startsWith('snippets/product-card.liquid:'), `ADR 0012 Đo vs product-card hover: ${found[0]} — chờ Tech Lead (ES1-T534)`);
    expect(found).toEqual([]);
  });

  test('AC11 TC-14 §7 Collection/Blog: không line-clamp/ellipsis/nowrap trên 4 selector tên', () => {
    test.info().annotations.push(...tag('§7 Collection, Blog: titles not truncated', 'B#21, B#52, A#41, A#42', 'TS-FE5 (ES1-T403)'));
    const bad: string[] = [];
    for (const f of CSS_FILES()) {
      const css = noCssComments(read(f));
      for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
        const selector = m[1].trim();
        if (!TITLE_SELECTORS.some((s) => selector.includes(s))) continue;
        if (/line-clamp|text-overflow:\s*ellipsis|-webkit-box-orient|white-space:\s*nowrap/.test(m[2])) bad.push(`${f}: ${selector}`);
      }
    }
    expect(bad).toEqual([]);
  });

  test('AC12 TC-15 §4: product-card không metafield swatch_colors, swatch từ value.swatch', () => {
    test.info().annotations.push(...tag('§4 Swatches (swatch.color / swatch.image)', 'A#36', 'TS-FE6 (ES1-T404)'));
    const src = read('snippets/product-card.liquid');
    expect(src).not.toMatch(/swatch_colors/);
    expect(src).toMatch(/value\.swatch\.(color|image)/);
  });

  test('AC13 TC-16 §14: locales schema không nhãn "Eyebrow", "Title"', () => {
    test.info().annotations.push(...tag('§14 Setting labels', 'N4, N5, N7', 'TS-FE6 (ES1-T404)'));
    expect(hits(['locales/en.default.schema.json'], /"Eyebrow"|"Title"/, (s) => s)).toEqual([]);
  });
});

// ================================================================ store dev
const IGNORE_CONSOLE = /shopifycloud|monorail|web-pixels|trekkie|shop\.app|shopifysvc\.com|otlp-http|cdn\.shopify\.com\/s\/(trekkie|javascripts)|youtube|vimeo|ytimg|model-viewer|status of 429/i;
function watchConsole(page: Page) {
  const errors: string[] = [];
  const isShopPay403 = watchShopPay403(page);
  page.on('console', (msg) => {
    if (msg.type() !== 'error' || isShopPay403(msg)) return;
    if (IGNORE_CONSOLE.test(msg.text()) || IGNORE_CONSOLE.test(msg.location().url)) return;
    errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

const shopName = (page: Page) => page.locator('meta[property="og:site_name"]').getAttribute('content').then((v) => (v ?? '').trim());
const origin = () => process.env.STORE_ORIGIN || (process.env.PREVIEW_URL ? new URL(process.env.PREVIEW_URL).origin : '');
const NOJS = { javaScriptEnabled: false, storageState: 'tests/setup/state.json' } as const;

/** Mở trang bằng context tắt JS (trang render server). */
async function nojsPage(browser: import('@playwright/test').Browser, path: string) {
  const context = await newStoreContext(browser, NOJS);
  const page = await context.newPage();
  const res = await page.goto(new URL(path, origin()).href, { waitUntil: 'domcontentloaded' });
  await expectNotChallenged(page);
  return { context, page, res };
}

test.describe('ES1-T412 store — layout (favicon, logo, footer)', () => {
  test('AC14 TC-17 §14: có favicon thì đúng 1 <link rel=icon> trả 200 ảnh; không có thì không in thẻ rỗng', async ({ page, request }) => {
    test.info().annotations.push(...tag('§14 Favicon', 'C9', 'TS-FE1 (ES1-T401)'));
    await gotoStore(page, '/');
    const icons = page.locator('link[rel="icon"]');
    const n = await icons.count();
    expect(n).toBeLessThanOrEqual(1);
    if (n === 0) {
      test.info().annotations.push({ type: 'data', description: 'store dev chưa chọn favicon: chỉ kiểm không in thẻ rỗng' });
      expect(await page.locator('link[rel~="icon"][href=""]').count()).toBe(0);
      return;
    }
    const href = (await icons.getAttribute('href'))!;
    expect(href).toMatch(/width=32/);
    const res = await request.get(new URL(href, page.url()).href);
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toMatch(/^image\//);
  });

  test('AC15 TC-18 §14: header-logo, footer-logo = shop.name khi không có logo; có logo thì aria-label = shop.name', async ({ page }) => {
    test.info().annotations.push(...tag('§14 Logo fallback shop name', 'C10', 'TS-FE1 (ES1-T401)'));
    await gotoStore(page, '/');
    const name = await shopName(page);
    expect(name).not.toBe('');
    const header = page.getByTestId('header-logo');
    await expect(header).toBeVisible();
    await expect(header).toHaveAttribute('href', '/');
    const hasImg = (await header.locator('img').count()) > 0;
    if (hasImg) {
      await expect(header).toHaveAttribute('aria-label', name);
      test.fixme(true, 'preview đang có logo (fixture ES1-T331): nhánh không logo cần preview/theme chưa chọn logo — chạy tay, ghi PR');
    }
    await expect(header).toHaveText(name);
    await expect(header).not.toContainText(/EFITCO/);
    const footer = page.getByTestId('footer-logo');
    if ((await footer.locator('img').count()) === 0) await expect(footer).toHaveText(name);
  });

  test('AC15 TC-19 §14 nojs: header-logo vẫn có tên shop hoặc ảnh có tên truy cập', async ({ browser }) => {
    test.info().annotations.push(...tag('§14 Logo fallback shop name', 'C10', 'TS-FE1 (ES1-T401)'));
    test.skip(test.info().project.name !== 'desktop', 'render server, kiểm 1 lần');
    const { context, page } = await nojsPage(browser, '/');
    const name = await shopName(page);
    const header = page.getByTestId('header-logo');
    if ((await header.locator('img').count()) === 0) await expect(header).toHaveText(name);
    else await expect(header).toHaveAttribute('aria-label', name);
    await context.close();
  });

  test('AC16 TC-20 §7 Layout: payment icon là SVG full color, mỗi cổng 1 icon, không ảnh efx-pay', async ({ page }) => {
    test.info().annotations.push(...tag('§7 Layout: payment icons from shop.enabled_payment_types', 'A#37', 'TS-FE2 (ES1-T402)'));
    await gotoStore(page, '/');
    const footer = page.getByTestId('footer');
    await footer.scrollIntoViewIfNeeded();
    expect(await page.content()).not.toMatch(/efx-pay|figma_pay/);
    const icons = footer.getByTestId('footer-payment-icon');
    const n = await icons.count();
    test.fixme(n === 0, 'store dev không bật cổng thanh toán hoặc tắt show_payment_icons: không có icon để kiểm');
    const info = await icons.evaluateAll((els) => els.map((li) => {
      const svg = li.querySelector('svg');
      const s = getComputedStyle(li);
      const svgStyle = svg ? getComputedStyle(svg) : null;
      return {
        svgs: li.querySelectorAll('svg').length,
        imgs: li.querySelectorAll('img').length,
        title: svg?.querySelector('title')?.textContent?.trim() ?? svg?.getAttribute('aria-labelledby') ?? '',
        filter: `${s.filter}|${svgStyle?.filter ?? ''}`,
        opacity: Math.min(Number(s.opacity), Number(svgStyle?.opacity ?? 1)),
      };
    }));
    for (const i of info) {
      expect(i.svgs).toBe(1);
      expect(i.imgs).toBe(0);
      expect(i.filter).toBe('none|none');
      expect(i.opacity).toBe(1);
    }
    expect(new Set(info.map((i) => i.title)).size, 'không trùng cổng').toBe(info.length);
  });

  test('AC16 TC-21 §7 Layout: số footer-payment-icon = số cổng bật trong admin', async ({ page }) => {
    test.info().annotations.push(...tag('§7 Layout: payment icons', 'A#37', 'TS-FE2 (ES1-T402)'));
    const expected = env('TS_PAYMENT_ICON_COUNT');
    test.fixme(!expected, 'thiếu TS_PAYMENT_ICON_COUNT (số shop.enabled_payment_types lấy từ admin store dev) — storefront không lộ số cổng');
    await gotoStore(page, '/');
    await expect(page.getByTestId('footer').getByTestId('footer-payment-icon')).toHaveCount(Number(expected));
  });

  test('AC17 TC-22 §8: nút newsletter footer không chứa "15%"; setting rỗng thì nhãn locale "Subscribe"', async ({ page }) => {
    test.info().annotations.push(...tag('§8 Accurate claims', 'C4', 'TS-FE2 (ES1-T402)'));
    await gotoStore(page, '/');
    const footer = page.getByTestId('footer');
    const submit = footer.getByTestId('footer-newsletter-submit');
    await expect(submit).toBeVisible();
    await expect(submit).not.toContainText('15%');
    await expect(footer).not.toContainText(/Get 15% Off/i);
    // Setting footer chưa áp (default rỗng) ⇔ không phần tử nào chỉ render từ setting (support/home-fixture.ts footerSettingsApplied).
    const applied = (await Promise.all(['footer-description', 'footer-newsletter-heading', 'footer-newsletter-text', 'footer-trust-item']
      .map((id) => footer.getByTestId(id).count()))).some((c) => c > 0);
    if (!applied) await expect(submit).toHaveText('Subscribe');
    else test.info().annotations.push({ type: 'data', description: 'setting footer đã áp: chỉ kiểm không "15%"' });
  });
});

test.describe('ES1-T412 store — trang phụ (404, password, gift card)', () => {
  test('AC18 TC-23 §7 404: form search tới /search có ô search + nhãn, link về /', async ({ page }) => {
    test.info().annotations.push(...tag('§7 404: search + home link', 'B#32', 'TS-FE8 (ES1-T408)'));
    const res = await page.goto('/es1-t412-khong-ton-tai');
    await expectNotChallenged(page);
    expect(res?.status()).toBe(404);
    const form = page.locator('main form[action$="/search"]');
    const input = form.locator('input[type="search"][name="q"]');
    await expect(input).toBeVisible();
    await expect(page.getByRole('searchbox', { name: 'Search the store' }).first()).toBeVisible();
    await expect(page.getByTestId('not-found-home')).toHaveAttribute('href', '/');
  });

  test('AC18 TC-24 §7 404 nojs: form và link vẫn có (render server)', async ({ browser }) => {
    test.info().annotations.push(...tag('§7 404', 'B#32', 'TS-FE8 (ES1-T408)'));
    test.skip(test.info().project.name !== 'desktop', 'render server, kiểm 1 lần');
    const { context, page, res } = await nojsPage(browser, '/es1-t412-khong-ton-tai');
    expect(res?.status()).toBe(404);
    await expect(page.locator('main form[action$="/search"] input[type="search"][name="q"]')).toBeVisible();
    await expect(page.locator('main a[href="/"]').first()).toBeVisible();
    await context.close();
  });

  test('AC19 TC-25 §7 Password: logo (alt) hoặc chữ shop.name, nằm trên h1', async ({ browser }) => {
    test.info().annotations.push(...tag('§7 Password: logo or shop name', 'A#63', 'TS-FE1 (ES1-T401), TS-FE8 (ES1-T408)'));
    const preview = process.env.PREVIEW_URL;
    test.skip(!preview, 'thiếu PREVIEW_URL');
    // Context mới không cookie mở khoá, giữ theme preview qua query.
    const context = await newStoreContext(browser);
    const page = await context.newPage();
    const url = new URL(preview!);
    await page.goto(`${url.origin}/password${url.search}`);
    test.fixme(!new URL(page.url()).pathname.startsWith('/password'), 'store dev không bật mật khẩu → không có trang password để kiểm');
    const name = await shopName(page);
    const logo = page.getByTestId('password-logo');
    await expect(logo).toBeVisible();
    const img = logo.locator('img');
    if (await img.count()) expect(((await img.getAttribute('alt')) ?? '').trim()).not.toBe('');
    else await expect(logo).toContainText(name);
    const [l, h] = await Promise.all([logo.boundingBox(), page.locator('h1').first().boundingBox()]);
    expect(l!.y).toBeLessThan(h!.y);
    await context.close();
  });

  const GIFT = env('TS_GIFT_CARD_URL');

  test('AC20 TC-26 §7 Gift card: QR (img/canvas) ≥ 120 × 120, mã hiện, 1 meta viewport', async ({ page }) => {
    test.info().annotations.push(...tag('§7 Gift card: QR code ≥ 120px', 'A#60', 'TS-FE8 (ES1-T408), TS-BE1 (ES1-T410)'));
    test.fixme(!GIFT, 'ES1-T298: store dev chưa có gift card phát hành (TS_GIFT_CARD_URL)');
    const errors = watchConsole(page);
    await page.goto(GIFT!);
    await expectNotChallenged(page);
    const drawn = page.getByTestId('gift-card-qr').locator('img:visible, canvas:visible').first();
    await expect(drawn).toBeVisible();
    const box = await drawn.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(120);
    expect(box!.height).toBeGreaterThanOrEqual(120);
    await expect(page.getByTestId('gift-card-code')).toBeVisible();
    await expect(page.locator('meta[name="viewport"]')).toHaveCount(1);
    expect(errors).toEqual([]);
  });

  test('AC20 TC-27 §7 Gift card nojs: khung QR ≥ 120 × 120 giữ chữ dự phòng', async ({ browser }) => {
    test.info().annotations.push(...tag('§7 Gift card', 'A#60', 'TS-FE8 (ES1-T408)'));
    test.fixme(!GIFT, 'ES1-T298: store dev chưa có gift card phát hành (TS_GIFT_CARD_URL)');
    test.skip(test.info().project.name !== 'desktop', 'render server, kiểm 1 lần');
    const { context, page } = await nojsPage(browser, GIFT!);
    const frame = page.getByTestId('gift-card-qr');
    const box = await frame.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(120);
    expect(box!.height).toBeGreaterThanOrEqual(120);
    await expect(page.getByTestId('gift-card-qr-fallback')).toHaveText('Enter the code at checkout');
    await context.close();
  });
});

/**
 * Submit rồi chờ khung chính điều hướng (cùng cách ES1-T407: POST có thể về đúng URL cũ nên chờ framenavigated).
 * hCaptcha của Shopify (/challenge hoặc invisible giữ submit) → skip có lý do, chạy tay ghi PR; không phải 429.
 */
async function submitAndLoad(page: Page, submit: () => Promise<unknown>) {
  const navigated = page.waitForEvent('framenavigated', { predicate: (f) => f === page.mainFrame(), timeout: 15_000 }).then(() => true, () => false);
  await submit();
  const moved = await navigated;
  if (moved) await page.waitForLoadState('domcontentloaded');
  const captcha = (await page.locator('iframe[src*="hcaptcha"]').count()) > 0;
  test.skip(/^\/challenge/.test(new URL(page.url()).pathname) || (!moved && captcha), 'hCaptcha chặn submit tự động: chạy tay, ghi PR');
  expect(moved, 'submit không điều hướng và không có hCaptcha').toBe(true);
  await expectNotChallenged(page);
}

test.describe('ES1-T412 store — blog, article, contact', () => {
  test('AC21 TC-28 §7 Blog: bài không excerpt vẫn có trích đoạn (từ content)', async ({ page }) => {
    test.info().annotations.push(...tag('§7 Blog: article.excerpt_or_content', 'B#18', 'TS-FE7 (ES1-T407)'));
    const path = env('TS_BLOG_NO_EXCERPT_PATH', 'TE407_BLOG_PATH');
    test.fixme(!path, 'thiếu TS_BLOG_NO_EXCERPT_PATH: bài te20-* đều có summary (drafts/claude-code/ES1-T385) — cần 1 bài không excerpt, có content');
    await gotoStore(page, path!);
    const cards = page.getByTestId('blog-articles-grid').getByTestId('article-card');
    const n = await cards.count();
    expect(n).toBeGreaterThan(0);
    for (let i = 0; i < n; i++) await expect(cards.nth(i).getByTestId('article-card-excerpt')).not.toHaveText('');
  });

  test('AC21 TC-29 §7 Blog: blog nhiều bài, mọi card có trích đoạn', async ({ page }) => {
    test.info().annotations.push(...tag('§7 Blog', 'B#18', 'TS-FE7 (ES1-T407)'));
    await gotoStore(page, env('TE385_PAGED_BLOG_PATH') ?? '/blogs/te20-paged');
    const cards = page.getByTestId('blog-articles-grid').getByTestId('article-card');
    const n = await cards.count();
    expect(n).toBeGreaterThan(0);
    for (let i = 0; i < n; i++) await expect(cards.nth(i).getByTestId('article-card-excerpt')).not.toHaveText('');
  });

  test('AC22 TC-30 §7 Article: POST comment blog duyệt → [role=status] tabindex=-1 chữ chờ duyệt', async ({ page }) => {
    test.info().annotations.push(...tag('§7 Article: comment posted/moderated message', 'B#24', 'TS-FE7 (ES1-T407)'));
    test.skip(test.info().project.name !== 'desktop', 'ghi dữ liệu store (comment chờ duyệt): chạy 1 lần');
    await gotoStore(page, env('TE407_ARTICLE_PATH') ?? '/blogs/te20-no-tag/te20-no-tag-01');
    const form = page.getByTestId('comment-form');
    test.fixme((await form.count()) === 0, 'bài không có form comment (blog tắt bình luận) — đặt TE407_ARTICLE_PATH');
    await form.locator('#CommentAuthor').fill('QA ES1-T412');
    await form.locator('#CommentEmail').fill('qa+es1-t412@example.com');
    await form.locator('#CommentBody').fill(`ES1-T412 kiểm thông báo duyệt ${Date.now()}`);
    await submitAndLoad(page, () => form.getByTestId('comment-submit').click());
    const status = page.getByTestId('comment-status');
    await expect(status).toHaveAttribute('role', 'status');
    await expect(status).toHaveAttribute('tabindex', '-1');
    await expect(status).toContainText('Thanks, your comment is in review');
  });

  test('AC23 TC-31 §7 Page contact: thiếu email → lỗi gắn ô; đủ → hộp thành công role=status', async ({ page }) => {
    test.info().annotations.push(...tag('§7 Page: contact form', 'B#6', 'TS-FE7 (ES1-T407)'));
    test.skip(test.info().project.name !== 'desktop', 'gửi form thật (email tới shop): chạy 1 lần');
    const path = env('TE407_CONTACT_PATH') ?? '/pages/contact';
    const res = await page.goto(path);
    await expectNotChallenged(page);
    test.fixme(res?.status() === 404, `thiếu page ${path} gán template contact`);
    const form = page.getByTestId('contact-form');
    test.fixme((await form.count()) === 0, `page ${path} chưa gán template contact`);
    await form.evaluate((f: HTMLFormElement) => (f.noValidate = true));
    await form.locator('#ContactBody').fill('ES1-T412 thiếu email');
    await submitAndLoad(page, () => form.getByTestId('contact-submit').click());
    await expect(page.getByTestId('contact-errors')).toBeVisible();
    await expect(page.locator('#ContactEmail')).toHaveAttribute('aria-invalid', 'true');
    const again = page.getByTestId('contact-form');
    await again.locator('#ContactEmail').fill('qa+es1-t412@example.com');
    await submitAndLoad(page, () => again.getByTestId('contact-submit').click());
    const status = page.getByTestId('contact-status');
    await expect(status).toHaveAttribute('role', 'status');
    await expect(status).toContainText('Thanks for contacting us');
  });
});

/**
 * Đổ tên dài (≈ 40 từ, có 1 từ 40 ký tự) vào phần tử tên rồi đo: không line-clamp, không ellipsis, không tràn ẩn.
 * Không dựa dữ liệu store có tên dài sẵn. Phần tử chưa có layout (ẩn) thì chỉ kiểm computed style.
 */
async function expectTitleNotTruncated(title: Locator) {
  const r = await title.evaluate((el) => {
    const target = (el.querySelector('a') ?? el) as HTMLElement;
    target.textContent = `${'Adjustable Kettlebell Competition Grade '.repeat(10)}Supercalifragilisticexpialidocious12345678`;
    const s = getComputedStyle(el);
    const t = getComputedStyle(target);
    const box = el as HTMLElement;
    return {
      clamp: s.getPropertyValue('-webkit-line-clamp') || 'none',
      clampInner: t.getPropertyValue('-webkit-line-clamp') || 'none',
      overflow: `${s.textOverflow}|${t.textOverflow}`,
      whiteSpace: s.whiteSpace,
      laidOut: box.getClientRects().length > 0 && box.clientHeight > 0,
      sh: box.scrollHeight, ch: box.clientHeight, sw: box.scrollWidth, cw: box.clientWidth,
      oy: s.overflowY, ox: s.overflowX,
    };
  });
  expect(r.clamp).toBe('none');
  expect(r.clampInner).toBe('none');
  expect(r.overflow).not.toMatch(/ellipsis/);
  expect(r.whiteSpace).not.toMatch(/nowrap/);
  if (r.laidOut) {
    // ticket: scrollHeight ≤ clientHeight. Tràn có overflow visible vẫn đọc được, nhưng spec yêu cầu khung giãn theo chữ.
    expect(r.sh, `scrollHeight ${r.sh} > clientHeight ${r.ch} (overflow-y ${r.oy})`).toBeLessThanOrEqual(r.ch + 1);
    if (r.ox !== 'visible') expect(r.sw).toBeLessThanOrEqual(r.cw + 1);
  }
}

test.describe('ES1-T412 store — chữ, tương phản, tên không cắt', () => {
  test('AC24 TC-32 §12 §8: .rte h5 ≠ h6 (computed font-size hoặc text-transform)', async ({ page }) => {
    test.info().annotations.push(...tag('§8 Consistent rich text, §12 heading levels', 'C7, B#36, B#34, B#35', 'TS-FE5 (ES1-T403)'));
    const path = env('TE403_PAGE_PATH');
    test.fixme(!path, 'thiếu TE403_PAGE_PATH: page có h5, h6 trong nội dung');
    await gotoStore(page, path!);
    const rte = page.locator('.rte').filter({ has: page.locator('h5') }).filter({ has: page.locator('h6') }).first();
    await expect(rte).toBeVisible();
    const get = (t: string) => rte.locator(t).first().evaluate((el) => {
      const s = getComputedStyle(el);
      return `${s.fontSize}|${s.textTransform}|${s.letterSpacing}`;
    });
    const [h5, h6] = [await get('h5'), await get('h6')];
    expect(h5).not.toBe(h6);
    expect(h6.split('|')[1]).toBe('uppercase');
  });

  test('AC25 TC-33 §12: quiz .quiz-option__mark chưa chọn: viền ≥ 3:1 với nền', async ({ page }) => {
    test.info().annotations.push(...tag('§12 Accessibility: non-text contrast ≥ 3:1', 'C8', 'TS-FE5 (ES1-T403)'));
    await gotoStore(page, '/?view=te11');
    const marks = page.locator('.quiz-option:not(:has(:checked)):not(:has([data-sample-choice])) .quiz-option__mark');
    test.fixme((await marks.count()) === 0, 'store không có quiz ở ?view=te11 (TE11_QUIZ_COLLECTION)');
    // Hàm tính đặt trong evaluate (không new Function: CSP storefront có thể chặn eval).
    const ratios = await marks.evaluateAll((els) => {
      const rgb = (c: string) => (c.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
      const lum = ([r, g, b]: number[]) => {
        const f = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      return els.filter((el) => el.getClientRects().length > 0).map((el) => {
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
    });
    expect(ratios.length).toBeGreaterThan(0);
    for (const r of ratios) expect(r).toBeGreaterThanOrEqual(3);
  });

  test('AC26 TC-34 §7 Collection: tên sản phẩm dài trên card /collections/all không bị cắt', async ({ page }) => {
    test.info().annotations.push(...tag('§7 Collection: product titles not truncated', 'B#21, A#42', 'TS-FE5 (ES1-T403)'));
    await gotoStore(page, '/collections/all');
    const title = page.locator('.product-card__title').first();
    await expect(title).toBeVisible();
    await expectTitleNotTruncated(title);
  });

  test('AC26 TC-35 §7 Blog: tên bài dài trên article-card không bị cắt', async ({ page }) => {
    test.info().annotations.push(...tag('§7 Blog: article titles not truncated', 'B#52', 'TS-FE5 (ES1-T403)'));
    await gotoStore(page, env('TE385_PAGED_BLOG_PATH') ?? '/blogs/te20-paged');
    const title = page.locator('.article-card__title').first();
    await expect(title).toBeVisible();
    await expectTitleNotTruncated(title);
  });

  test('AC26 TC-36 §7: tên sản phẩm trên video-card và sticky bar PDP không bị cắt', async ({ page }) => {
    test.info().annotations.push(...tag('§7 Product titles not truncated', 'A#41', 'TS-FE5 (ES1-T403)'));
    await gotoStore(page, '/?view=te13');
    const video = page.locator('.video-card__product-title').first();
    test.fixme((await video.count()) === 0, 'te13 không có video-card gắn sản phẩm');
    await video.scrollIntoViewIfNeeded();
    await expectTitleNotTruncated(video);

    const handle = env('TE4_VARIANTS_HANDLE') ?? 'variant-co-ảnh-rieng';
    await gotoStore(page, `/products/${encodeURI(handle)}`);
    const sticky = page.locator('.product-sticky-bar__title').first();
    test.fixme((await sticky.count()) === 0, 'PDP không có sticky bar');
    await page.mouse.wheel(0, 2500);
    await expectTitleNotTruncated(sticky);
  });
});

test.describe('ES1-T412 store — featured product rich media, focal point', () => {
  const EMBED = /youtube(-nocookie)?\.com\/embed|player\.vimeo\.com/;
  const MEDIA = env('TE4_MEDIA_HANDLE') ?? 'media-dủ-loại';
  // templates/product.featured-product.liquid render đúng block featured-product với sản phẩm của URL → dữ liệu thật, không chèn markup.
  const FEATURED = `/products/${encodeURI(MEDIA)}?view=featured-product`;

  test('AC27 TC-37 §4: featured product render video/YouTube/3D (không chỉ ảnh), video không tự chạy', async ({ page }) => {
    test.info().annotations.push(...tag('§4 Rich media in featured product', 'A#22', 'TS-FE9 (ES1-T409), TS-BE1 (ES1-T410)'));
    const errors = watchConsole(page);
    await gotoStore(page, FEATURED);
    const featured = page.getByTestId('featured-product').first();
    await expect(featured).toBeVisible();
    const types = await featured.getByTestId('featured-product-media-item').evaluateAll((els) => els.map((el) => el.getAttribute('data-media-type')));
    test.fixme(!types.some((t) => t && t !== 'image'), `${MEDIA} không có media ngoài ảnh (TE13_VIDEO_READY)`);
    expect(types.length).toBeLessThanOrEqual(8);
    if (types.includes('video')) {
      const video = featured.getByTestId('product-media-video').locator('video').first();
      await expect(video).toHaveCount(1);
      expect(await video.getAttribute('autoplay')).toBeNull();
      expect(await video.getAttribute('preload')).toBe('none');
    }
    if (types.includes('external_video')) await expect(featured.getByTestId('product-media-external-video').first()).toHaveCount(1);
    if (types.includes('model')) await expect(featured.getByTestId('product-media-model').first()).toHaveCount(1);
    // Chưa bấm: không iframe nào nạp.
    await expect(featured.locator('iframe')).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test('AC27 TC-38 §4: bấm Play YouTube/Vimeo trên featured thì iframe nạp, không rời trang', async ({ page }) => {
    test.info().annotations.push(...tag('§4 Rich media in featured product', 'A#22', 'TS-BE1 (ES1-T410)'));
    const errors = watchConsole(page);
    await page.route(EMBED, (r) => r.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>stub</title>' }));
    await gotoStore(page, FEATURED);
    const featured = page.getByTestId('featured-product').first();
    const item = featured.locator('li[data-media-type="external_video"]').first();
    test.fixme((await item.count()) === 0, `${MEDIA} không có external_video`);
    const gallery = featured.locator('product-media-gallery').first();
    await gallery.scrollIntoViewIfNeeded();
    await expect.poll(() => page.evaluate(() => Boolean(customElements.get('product-media-gallery')))).toBe(true);
    await item.scrollIntoViewIfNeeded();
    const before = page.url();
    const poster = item.getByTestId('product-media-external-video');
    // Ảnh đang hiện có thể là media khác trong carousel: bấm thumbnail của item trước nếu có.
    const id = await item.getAttribute('data-media-id');
    const thumb = featured.locator(`a[href^="#"][data-media-id="${id}"]`).first();
    if ((await thumb.count()) && !(await poster.isVisible())) await thumb.click();
    await poster.click();
    await expect(item.locator('iframe')).toHaveCount(1);
    await expect(item.locator('iframe')).toHaveAttribute('src', EMBED);
    expect(page.url()).toBe(before);
    expect(errors).toEqual([]);
  });

  test('AC28 TC-39 §4 focal point (A#11): ảnh có focal lệch tâm không bị cắt server crop=center', async ({ page }) => {
    test.info().annotations.push(...tag('§4 Image focal points', 'A#11 (NÊN, KHÔNG CHẮC)', 'nợ ES1-T304 §4 — QA kiểm, lệch thì mở bug'));
    const offCenter: { block: string; src: string; pos: string }[] = [];
    for (const path of ['/', '/?view=te12', '/?view=te13']) {
      await gotoStore(page, path);
      const found = await page.locator('[data-testid="image-with-text"] img, [data-testid="shop-the-look"] img, [data-testid="featured-product"] img').evaluateAll((imgs) =>
        imgs.map((img) => ({
          block: img.closest('[data-testid]')?.getAttribute('data-testid') ?? '',
          src: (img as HTMLImageElement).currentSrc || img.getAttribute('src') || '',
          pos: (img as HTMLElement).style.objectPosition,
        })).filter((i) => i.pos && !/^50% 50%$|^center( center)?$/.test(i.pos)));
      offCenter.push(...found);
    }
    test.fixme(offCenter.length === 0, 'store dev chưa có ảnh đặt focal point lệch tâm trong image-with-text/shop-the-look/featured (admin đặt focal trên file ảnh)');
    const cropped = offCenter.filter((i) => /[?&]crop=center\b/.test(i.src));
    expect(cropped, 'ảnh có focal lệch tâm nhưng URL cắt server crop=center → focal bị bỏ (A#11)').toEqual([]);
  });
});
