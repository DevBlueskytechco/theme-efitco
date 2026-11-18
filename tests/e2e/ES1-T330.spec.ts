// KHÔNG CHẮC: spec chưa chạy (lượt agent không có STORE_PASSWORD, Chromium bị sandbox chặn) → chờ CI store-tests. Test case:
// drafts/qa/ES1-T330/test-cases.md (TC-xx), phạm vi AC drafts/qa/ES1-T330/ac-scope.md. Nguồn docs/srs.md#TE-22 AC1–AC14 (0.5), #TE-1 AC2, AC7.
// Ticket ES1-T330 TE-22-R2-QA1: mega A/B/C bàn phím + Esc, cấp 3, scrim, breadcrumb + JSON-LD. Một file vì ticket gộp mega + breadcrumb.
// Không lặp ES1-T329 (hover, đổi mục, rê/bấm scrim, Enter/Space/Esc, Tab hết panel, lỗi mạng), ES1-T323 (drawer fixture),
// ES1-T326 (snippet breadcrumb tĩnh + CSS banner fixture), TE-1 TC-38–40 (lang/meta) — các spec đó vẫn phải xanh.
// Skip có lý do: TE-22-R2-FE3 cắt R1 (ES1-T328) → TC-14/15/17/19/20; template chưa gọi snippet breadcrumb → TC-32..39 theo template.
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T330.spec.ts
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { test, expect, type Locator, type Page, type TestInfo } from './support/test';
import { expectNotChallenged, gotoStore } from './support/store-guard';
import { env } from './support/store-data';

const ROOT = process.cwd();
const read = (f: string) => readFileSync(join(ROOT, f), 'utf8');
const BASE_URL = process.env.STORE_ORIGIN || (process.env.PREVIEW_URL ? new URL(process.env.PREVIEW_URL).origin : undefined);
const LOCALE = JSON.parse(read('locales/en.default.json'));
const HEADER_LOCALE = LOCALE.blocks.header as Record<string, string>;
const HOME = LOCALE.general.breadcrumb.home as string;
const COLLECTIONS = LOCALE.collections.title as string;
const SEARCH = LOCALE.search.title as string;
const QUIZ_TRAIL = 'Your Gear Shortlist'; // SRS TE-22 AC9, quiz-result.md §6
const HEADER = read('blocks/header.liquid');
const FE3 = /menu_featured_product/.test(HEADER);
const FE3_CUT = 'TE-22-R2-FE3 (ES1-T328) CẮT khỏi R1 (CTO 11/11): chưa có ảnh danh mục, card sản phẩm, setting menu_featured_product';
const NO_MEGA = 'main-menu store dev cần mục mega (cấp 2 toàn collection hoặc có cấp 3), ES1-T271/ES1-T298';
const LONG = 'Adjustable Dumbbell Pair With Quick Dial And Storage Tray XL Pro';
const LONG_TOKEN = 'AdjustableDumbbellPairWithQuickDialAndStorageTrayXLProEdition64';
const COLLECTION_URL = /^(?:\/[a-z]{2}(?:-[a-z]{2})?)?\/collections\/[^/?#]+$/i;

const isDesktop = (ti: TestInfo) => ti.project.name === 'desktop';
const tid = (scope: Page | Locator, id: string) => scope.getByTestId(id);
const near = (a: number, b: number, tol = 1) => Math.abs(a - b) <= tol;

// ---------- helpers mega ----------
async function open(page: Page, path = '/', waitUntil: 'load' | 'domcontentloaded' = 'load') {
  await gotoStore(page, path, { waitUntil });
}
async function menuReady(page: Page) {
  await page.waitForFunction(() => !!customElements.get('header-menu'));
}
const nav = (page: Page) => tid(page, 'header-menu');
const navItems = (page: Page) => nav(page).getByTestId('header-menu-item');
const itemsOf = (page: Page, kind: 'columns' | 'tiles' | 'C') =>
  navItems(page).filter({ has: page.locator(kind === 'C' ? 'details:not([data-mega])' : `details[data-mega="${kind}"]`) });
function parts(item: Locator) {
  return {
    item,
    details: item.locator(':scope > details'),
    toggle: item.getByTestId('header-menu-toggle'),
    panel: item.getByTestId('header-mega-panel'),
    submenu: item.getByTestId('header-submenu'),
    scrim: item.getByTestId('header-scrim'),
  };
}
async function need(page: Page, kind: 'columns' | 'tiles' | 'C' | 'mega', min = 1) {
  const n = kind === 'mega' ? await navItems(page).filter({ has: page.locator('details[data-mega]') }).count() : await itemsOf(page, kind).count();
  test.skip(n < min, `${NO_MEGA} (cần ≥ ${min} mục ${kind})`);
}
const firstMega = (page: Page) => parts(navItems(page).filter({ has: page.locator('details[data-mega]') }).first());

/** Màu thật của một biến CSS (đổi được trong settings), dạng getComputedStyle. */
const cssVarColor = (page: Page, name: string) =>
  page.evaluate((n) => {
    const el = document.createElement('i');
    el.style.color = `var(${n})`;
    document.body.append(el);
    const c = getComputedStyle(el).color;
    el.remove();
    return c;
  }, name);

/** Dữ liệu menu đọc từ drawer (cùng link_list với nav desktop, cùng thứ tự). */
type MenuData = { title: string; viewAll: string; children: { title: string; path: string; grand: string[] }[] }[];
const menuData = (page: Page): Promise<MenuData> =>
  page.evaluate(() =>
    [...document.querySelectorAll('[data-testid="header-drawer"] [data-testid="header-menu-item"]')].map((li) => {
      const sub = li.querySelector('[data-testid="header-drawer-submenu"]');
      const rows = sub ? [...sub.children] : [];
      const title = (li.querySelector('[data-testid="header-drawer-accordion-toggle"]') ?? li.querySelector('a'))?.textContent?.trim() ?? '';
      return {
        title,
        viewAll: rows[0]?.querySelector('a')?.textContent?.trim() ?? '',
        children: rows.slice(1).map((row) => {
          const a = row.querySelector('a')!;
          return { title: a.textContent!.trim(), path: new URL(a.href).pathname, grand: [...row.querySelectorAll(':scope ul a')].map((g) => g.textContent!.trim()) };
        }),
      };
    }),
  );

// ---------- helpers breadcrumb ----------
type Crumb = { name: string; path?: string };
const fileHas = (f: string, re: RegExp) => existsSync(join(ROOT, f)) && re.test(read(f));
/** Template (và block nó gọi) có render snippet breadcrumb chưa. */
function breadcrumbWired(template: string): boolean {
  const src = read(`templates/${template}.liquid`);
  const blocks = [...src.matchAll(/\{%-?\s*block '([^']+)'/g)].map((m) => `blocks/${m[1]}.liquid`);
  return [`templates/${template}.liquid`, ...blocks].some((f) => fileHas(f, /render 'breadcrumb'/));
}
const WIRING: Record<string, string> = {
  collection: 'TE-6-R2-FE2',
  product: 'TE-4-R2-FE3',
  blog: 'TE-20-R2-FE1',
  article: 'TE-20-R2-FE2 (ES1-T382)',
  page: 'TE-21-R2-FE1',
  search: 'ES1-T128 (ES1-T436 #1)',
  'list-collections': 'TE-6-R2-FE4',
  'collection.quiz': 'ES1-T387 (ES1-T436 #1)',
};
function needWired(template: string) {
  test.skip(!breadcrumbWired(template), `templates/${template}.liquid chưa gọi snippet breadcrumb — chờ ${WIRING[template]}`);
}

const breadcrumbState = (page: Page) =>
  page.evaluate(() => {
    let parseErrors = 0;
    const lists = [...document.querySelectorAll('script[type="application/ld+json"]')]
      .map((s) => {
        try {
          return JSON.parse(s.textContent || '');
        } catch {
          parseErrors++;
          return null;
        }
      })
      .flatMap((d) => (Array.isArray(d) ? d : [d]))
      .filter((d) => d && d['@type'] === 'BreadcrumbList');
    const navs = document.querySelectorAll('nav[aria-label="Breadcrumb"]').length;
    return { navs, lists, parseErrors };
  });

const h1Text = async (page: Page) => (await page.getByRole('heading', { level: 1 }).first().innerText()).replace(/\s+/g, ' ').trim();

/** TC-40 + TC-44: cấu trúc, chữ, link, số đo breadcrumb và BreadcrumbList khớp phần hiển thị. */
async function expectTrail(page: Page, expected: Crumb[]) {
  const bc = tid(page, 'breadcrumb');
  await expect(bc).toHaveCount(1);
  await expect(bc).toHaveAttribute('aria-label', LOCALE.general.breadcrumb.label);
  const items = bc.locator(':scope > ol > li');
  await expect(items).toHaveCount(expected.length);
  const shown = (await items.allInnerTexts()).map((t) => t.replace(/\s+/g, ' ').trim());
  expect(shown, 'chữ breadcrumb').toEqual(expected.map((c) => c.name));
  // Mục cuối: span aria-current, không link
  const current = tid(bc, 'breadcrumb-current');
  await expect(current).toHaveAttribute('aria-current', 'page');
  expect(await current.evaluate((el) => el.tagName)).toBe('SPAN');
  await expect(items.last().locator('a')).toHaveCount(0);
  // Mục khác: link đúng URL, cao ≥ 44, chữ 14, màu muted (trắng trong banner)
  const inBanner = await bc.evaluate((el) => !!el.closest('.page-banner'));
  const muted = inBanner ? await cssVarColor(page, '--color-background-dark-foreground') : await cssVarColor(page, '--color-muted');
  expect(await bc.evaluate((el) => getComputedStyle(el).fontSize)).toBe('14px');
  for (let i = 0; i < expected.length - 1; i++) {
    const link = items.nth(i).locator('a');
    await expect(link).toHaveCount(1);
    const href = await link.evaluate((a) => new URL((a as HTMLAnchorElement).href).pathname);
    if (expected[i].path) expect(href, `href mục ${i + 1}`).toBe(expected[i].path);
    expect((await link.boundingBox())!.height, `link "${expected[i].name}" cao ≥ 44`).toBeGreaterThanOrEqual(44);
    expect(await link.evaluate((a) => getComputedStyle(a).color)).toBe(muted);
  }
  // JSON-LD (TC-44)
  const state = await breadcrumbState(page);
  expect(state.parseErrors, 'khối ld+json lỗi cú pháp').toBe(0);
  expect(state.lists, 'đúng 1 BreadcrumbList').toHaveLength(1);
  const list = state.lists[0];
  expect(String(list['@context'])).toMatch(/^https?:\/\/schema\.org\/?$/);
  const ld = list.itemListElement as { '@type': string; position: number; name: string; item?: string }[];
  expect(ld.map((i) => i.position)).toEqual(expected.map((_, i) => i + 1));
  expect(ld.map((i) => i['@type'])).toEqual(expected.map(() => 'ListItem'));
  expect(ld.map((i) => i.name), 'name JSON-LD = chữ hiển thị (đủ tên)').toEqual(shown);
  const hrefs = await items.locator('a').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).href));
  expect(ld.slice(0, -1).map((i) => i.item), 'item = URL tuyệt đối của link').toEqual(hrefs);
  const last = ld[ld.length - 1].item;
  if (last) expect(new URL(last).pathname).toBe(new URL(page.url()).pathname);
}

/** TC-47: đúng 1 h1; có page-title thì eyebrow → h1 → meta theo DOM. */
async function expectHeadingOrder(page: Page) {
  await expect(page.locator('h1')).toHaveCount(1);
  const ok = await page.evaluate(() => {
    const pt = document.querySelector('[data-testid="page-title"]');
    if (!pt) return true;
    const seq = ['.page-title__eyebrow', 'h1', '.page-title__meta'].map((s) => pt.querySelector(s)).filter(Boolean) as Element[];
    return seq.every((el, i) => i === 0 || !!(seq[i - 1].compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING));
  });
  expect(ok, 'eyebrow → h1 → meta').toBe(true);
}

/** Bài viết mẫu: env trước, không có thì link bài đầu tiên trên trang chủ. */
async function articlePath(page: Page): Promise<string | undefined> {
  const fromEnv = env('TE330_ARTICLE_PATH', 'TE382_ARTICLE_PATH', 'TE407_ARTICLE_PATH');
  if (fromEnv) return fromEnv;
  await open(page, '/');
  const hrefs = await page.locator('a[href*="/blogs/"]').evaluateAll((as) => as.map((a) => new URL((a as HTMLAnchorElement).href).pathname));
  return hrefs.find((p) => /^\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?blogs\/[^/]+\/(?!tagged\/)[^/]+$/.test(p));
}

// =====================================================================================
test.describe('ES1-T330 tĩnh', () => {
  test.beforeEach(({}, ti) => test.skip(!isDesktop(ti), 'tĩnh, chạy 1 lần'));

  test('TC-31 AC8 menu trống: nút menu, drawer, nav trong has_menu; placeholder chỉ ở design_mode; logo + icon ngoài nhánh', () => {
    const body = HEADER.slice(HEADER.indexOf('{% enddoc %}'));
    expect(body).toMatch(/if menu\.links\.size > 0\s+assign has_menu = true/);
    const drawerAt = body.indexOf('data-testid="header-drawer-toggle"');
    const firstIf = body.lastIndexOf('{% if has_menu %}', drawerAt);
    expect(firstIf, 'nút menu nằm trong {% if has_menu %}').toBeGreaterThan(-1);
    expect(body.indexOf('{% endif %}', firstIf)).toBeGreaterThan(body.indexOf('data-testid="header-drawer"'));
    expect(body).toMatch(/\{% if has_menu %\}\s*<nav class="site-header__nav"[\s\S]*?<\/nav>\s*\{% elsif request\.design_mode %\}\s*<p class="site-header__placeholder">\{\{ 'blocks\.header\.menu_placeholder' \| t \}\}<\/p>\s*\{% endif %\}/);
    expect(HEADER_LOCALE.menu_placeholder).toBeTruthy();
    // Logo nằm sau {% endif %} đóng nhánh drawer; icon nằm sau {% endif %} đóng nhánh nav/placeholder
    const drawerEnd = body.indexOf('{% endif %}', body.indexOf('</details>', body.indexOf('</modal-dialog>')));
    const navEnd = body.indexOf('{% endif %}', body.indexOf("'blocks.header.menu_placeholder'"));
    expect(body.indexOf('data-testid="header-logo"'), 'logo ngoài nhánh has_menu').toBeGreaterThan(drawerEnd);
    expect(body.indexOf('data-testid="header-logo"')).toBeLessThan(body.indexOf('{% if has_menu %}', drawerEnd));
    expect(body.indexOf('class="site-header__icons"'), 'icon ngoài nhánh has_menu').toBeGreaterThan(navEnd);
  });

  test('TC-48 AC14 theme mới cài: menu default main-menu, không default sản phẩm nổi bật, 0 handle figma- trong code header', () => {
    const schema = JSON.parse(HEADER.slice(HEADER.indexOf('{% schema %}') + 12, HEADER.indexOf('{% endschema %}')));
    const byId = Object.fromEntries((schema.settings as { id?: string }[]).filter((s) => s.id).map((s) => [s.id, s])) as Record<string, { type: string; default?: unknown }>;
    expect(byId.menu).toMatchObject({ type: 'link_list', default: 'main-menu' });
    if (byId.menu_featured_product) {
      expect(byId.menu_featured_product.type).toBe('product');
      expect(byId.menu_featured_product.default).toBeUndefined();
    }
    if (byId.menu_collection_images) expect(byId.menu_collection_images).toMatchObject({ type: 'checkbox', default: true });
    const files = ['blocks/header.liquid', 'snippets/header-mega-group.liquid', 'snippets/header-drawer-head.liquid', 'snippets/header-icon.liquid', 'assets/header-menu.js', 'assets/header-drawer.js'];
    for (const f of files.filter((x) => existsSync(join(ROOT, x)))) expect(read(f), `${f} có handle figma-`).not.toMatch(/figma-/);
  });

  test('TC-41 AC9 AC12 password, gift card, 404 không gọi breadcrumb (tĩnh); snippet ngoài 7 loại template thì has_trail false', () => {
    for (const f of ['templates/password.liquid', 'templates/gift_card.liquid', 'templates/404.liquid', 'layout/password.liquid', 'templates/index.liquid', 'templates/cart.liquid']) {
      if (existsSync(join(ROOT, f))) expect(read(f), f).not.toMatch(/render 'breadcrumb'/);
    }
    const snippet = read('snippets/breadcrumb.liquid');
    expect(snippet).toMatch(/else\s+assign has_trail = false/);
    expect(snippet).not.toMatch(/when '(index|cart|404|password|gift_card)'/);
  });

  test('B-01 breadcrumb rỗng tên thì không nav, không JSON-LD (cùng nhánh)', () => {
    const snippet = read('snippets/breadcrumb.liquid');
    const ifAt = snippet.indexOf('{%- if has_trail and current_title != blank -%}');
    expect(ifAt).toBeGreaterThan(-1);
    expect(snippet.indexOf('<nav')).toBeGreaterThan(ifAt);
    expect(snippet.indexOf('application/ld+json')).toBeGreaterThan(ifAt);
    expect(snippet.lastIndexOf('{%- endif -%}')).toBeGreaterThan(snippet.indexOf('</script>'));
  });
});

// =====================================================================================
test.describe('ES1-T330 mega từ 80rem', () => {
  // Skip trước, không xin fixture page: test bị skip không mở trình duyệt
  test.beforeEach(({}, ti) => {
    test.skip(!BASE_URL, 'cần PREVIEW_URL hoặc STORE_ORIGIN');
    test.skip(!isDesktop(ti), 'desktop');
  });
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
  });

  for (const width of [1280, 1920]) {
    test(`TC-01 AC1 ${width}: hover mở panel ngay dưới header 80, header giữ nền, trigger trắng + chevron 180°, scrim 50% từ đáy header`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await open(page);
      await menuReady(page);
      await need(page, 'mega');
      const header = tid(page, 'header');
      const bg = await header.evaluate((el) => getComputedStyle(el).backgroundColor + getComputedStyle(el).backgroundImage);
      const { toggle, panel, scrim } = firstMega(page);
      await toggle.hover();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      await expect(panel).toBeVisible();
      await expect(scrim).toBeVisible();
      await page.waitForTimeout(400); // hết hiệu ứng mở 250ms
      const h = (await header.boundingBox())!;
      expect(Math.round(h.height), 'header cao 80 khi panel mở').toBe(80);
      const bottom = h.y + h.height;
      expect(near((await panel.boundingBox())!.y, bottom), 'đỉnh panel = đáy header').toBe(true);
      expect(near((await scrim.boundingBox())!.y, bottom), 'đỉnh scrim = đáy header').toBe(true);
      expect(await header.evaluate((el) => getComputedStyle(el).backgroundColor + getComputedStyle(el).backgroundImage), 'nền header không đổi').toBe(bg);
      expect(await toggle.evaluate((el) => getComputedStyle(el).color)).toBe(await cssVarColor(page, '--color-background-dark-foreground'));
      expect(await toggle.locator('svg').first().evaluate((el) => getComputedStyle(el).rotate)).toBe('180deg');
      expect(await scrim.evaluate((el) => getComputedStyle(el).backgroundColor)).toMatch(/(,\s*0\.5\)|\/\s*0\.5\))$/);
    });
  }

  test('TC-02 AC1 Space trên trigger đóng thì mở, trang không cuộn (B-05)', async ({ page }) => {
    await open(page);
    await menuReady(page);
    await need(page, 'mega');
    const { toggle, panel } = firstMega(page);
    await toggle.focus();
    const y = await page.evaluate(() => scrollY);
    await page.keyboard.press('Space');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(panel).toBeVisible();
    expect(await page.evaluate(() => scrollY)).toBe(y);
  });

  test('TC-03 AC1 đang mở, rê sang mục cấp 1 không có con thì panel đóng', async ({ page }) => {
    await open(page);
    await menuReady(page);
    await need(page, 'mega');
    const plain = navItems(page).filter({ hasNot: page.locator('details') });
    test.skip((await plain.count()) === 0, 'main-menu không có mục cấp 1 không con');
    const { toggle, panel } = firstMega(page);
    await toggle.hover();
    await expect(panel).toBeVisible();
    await plain.first().getByRole('link').hover();
    await expect(panel).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('TC-04 AC1 bấm lại trigger đóng; panel không bẫy focus: Shift+Tab về trigger rồi ra ngoài thì đóng', async ({ page }) => {
    await open(page);
    await menuReady(page);
    await need(page, 'mega');
    const { toggle, panel } = firstMega(page);
    await toggle.click();
    await expect(panel).toBeVisible();
    await toggle.click();
    await expect(panel).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(panel).toBeVisible();
    await panel.getByRole('link').first().focus();
    await page.keyboard.press('Shift+Tab');
    await expect(toggle).toBeFocused();
    await expect(panel).toBeVisible();
    await page.keyboard.press('Shift+Tab');
    await expect(panel).toBeHidden();
    expect(await panel.evaluate((el) => el.contains(document.activeElement))).toBe(false);
  });

  test('TC-07 AC2 kiểu panel theo dữ liệu menu: cấp 3 → columns, toàn collection → tiles, còn lại dropdown C', async ({ page }) => {
    await open(page);
    const data = await menuData(page);
    const kinds = await navItems(page).evaluateAll((lis) =>
      lis.map((li) => {
        const d = li.querySelector(':scope > details') as HTMLElement | null;
        return d ? d.dataset.mega ?? 'C' : 'link';
      }),
    );
    expect(kinds.length, 'nav desktop và drawer cùng số mục').toBe(data.length);
    test.skip(!data.some((d) => d.children.length), 'main-menu không có mục có con');
    const expected = data.map((d) =>
      !d.children.length ? 'link' : d.children.some((c) => c.grand.length) ? 'columns' : d.children.every((c) => COLLECTION_URL.test(c.path)) ? 'tiles' : 'C',
    );
    expect(kinds).toEqual(expected);
  });

  test('TC-08 AC2 kiểu A: View all đầu cột 1, con không cấp 3 ngay sau, mỗi cột tiêu đề link + ul labelledby, cột 5 xuống hàng', async ({ page }) => {
    await open(page);
    await menuReady(page);
    await need(page, 'columns');
    const index = (await navItems(page).evaluateAll((lis) => lis.map((li) => li.querySelector(':scope > details')?.getAttribute('data-mega')))).indexOf('columns');
    const data = (await menuData(page))[index];
    const { toggle, panel } = parts(navItems(page).nth(index));
    await toggle.click();
    await expect(panel).toBeVisible();
    const cols = panel.getByTestId('header-mega-column');
    const groups = data.children.filter((c) => c.grand.length);
    const loose = data.children.filter((c) => !c.grand.length);
    await expect(cols).toHaveCount(Math.max(1, groups.length));
    const col1 = await cols.first().getByRole('link').allInnerTexts();
    expect(col1[0].trim()).toMatch(/^View all /);
    expect(col1.slice(1, 1 + loose.length).map((t) => t.trim()), 'con không cấp 3 ngay sau View all').toEqual(loose.map((c) => c.title));
    // Mỗi nhóm: tiêu đề link có id, ul aria-labelledby trỏ tiêu đề, link cấp 3 đủ, không h*
    const shape = await panel.evaluate((el) =>
      [...el.querySelectorAll('ul[aria-labelledby]')].map((ul) => {
        const title = document.getElementById(ul.getAttribute('aria-labelledby')!);
        return { tag: title?.tagName, title: title?.textContent?.trim(), links: [...ul.querySelectorAll('a')].map((a) => a.textContent!.trim()) };
      }),
    );
    expect(shape.map((s) => s.tag)).toEqual(groups.map(() => 'A'));
    expect(shape.map((s) => s.title)).toEqual(groups.map((g) => g.title));
    expect(shape.map((s) => s.links)).toEqual(groups.map((g) => g.grand));
    const ys = await cols.evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
    for (let i = 1; i < Math.min(4, ys.length); i++) expect(ys[i], `cột ${i + 1} cùng hàng cột 1`).toBe(ys[0]);
    for (let i = 4; i < ys.length; i++) expect(ys[i], `cột ${i + 1} xuống hàng`).toBeGreaterThan(ys[0]);
  });

  test('TC-09 AC2 kiểu B: tiêu đề = mục cha, View all, ô tên + số sản phẩm, 5 ô một hàng, ô 6–10 hàng 2, không cắt', async ({ page }) => {
    await open(page);
    await menuReady(page);
    await need(page, 'tiles');
    const index = (await navItems(page).evaluateAll((lis) => lis.map((li) => li.querySelector(':scope > details')?.getAttribute('data-mega')))).indexOf('tiles');
    const data = (await menuData(page))[index];
    const { toggle, panel } = parts(navItems(page).nth(index));
    await toggle.click();
    await expect(panel).toBeVisible();
    const tiles = panel.locator('ul[aria-labelledby] > li > a');
    await expect(tiles).toHaveCount(data.children.length);
    const heading = await panel.evaluate((el) => {
      const ul = el.querySelector('ul[aria-labelledby]')!;
      const t = document.getElementById(ul.getAttribute('aria-labelledby')!)!;
      return { tag: t.tagName, text: t.textContent!.trim() };
    });
    expect(heading.tag).not.toMatch(/^H[1-6]$/);
    expect(heading.text).toBe(data.title);
    await expect(panel.getByRole('link', { name: /^View all / })).toHaveCount(1);
    const texts = (await tiles.allInnerTexts()).map((t) => t.replace(/\s+/g, ' ').trim());
    texts.forEach((t, i) => expect(t).toMatch(new RegExp(`^${data.children[i].title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\d+ Products?$`)));
    const ys = await tiles.evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
    for (let i = 1; i < Math.min(5, ys.length); i++) expect(ys[i]).toBe(ys[0]);
    for (let i = 5; i < Math.min(10, ys.length); i++) expect(ys[i], `ô ${i + 1} hàng 2`).toBeGreaterThan(ys[0]);
  });

  test('TC-10 AC2 kiểu C: dropdown ul, không panel mega, không scrim', async ({ page }) => {
    await open(page);
    await menuReady(page);
    await need(page, 'C');
    const { toggle, submenu, item } = parts(itemsOf(page, 'C').first());
    await toggle.click();
    await expect(submenu).toBeVisible();
    expect(await submenu.evaluate((el) => el.tagName)).toBe('UL');
    await expect(item.getByTestId('header-mega-panel')).toHaveCount(0);
    await expect(item.getByTestId('header-scrim')).toHaveCount(0);
  });

  test('TC-11 AC2 1280×560: panel cao tối đa 100dvh − 80, cuộn riêng; không cắt link so với drawer', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 560 });
    await open(page);
    await menuReady(page);
    await need(page, 'mega');
    const data = await menuData(page);
    const kinds = await navItems(page).evaluateAll((lis) => lis.map((li) => li.querySelector(':scope > details')?.getAttribute('data-mega') ?? ''));
    const sizes = data.map((d, i) => (kinds[i] ? 1 + d.children.reduce((n, c) => n + 1 + c.grand.length, 0) : -1));
    const index = sizes.indexOf(Math.max(...sizes));
    const { toggle, panel } = parts(navItems(page).nth(index));
    await toggle.click();
    await expect(panel).toBeVisible();
    await expect(panel.getByRole('link')).toHaveCount(sizes[index]);
    const box = (await panel.boundingBox())!;
    expect(box.y + box.height).toBeLessThanOrEqual(560 + 1);
    const m = await panel.evaluate((el) => ({ sh: el.scrollHeight, ch: el.clientHeight, oy: getComputedStyle(el).overflowY }));
    expect(m.oy).toMatch(/auto|scroll/);
    if (m.sh > m.ch + 1) {
      await panel.evaluate((el) => el.scrollBy(0, 200));
      expect(await panel.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
    }
  });

  test('TC-18 AC5 setting trống: không card ở panel và drawer, lưới cột A 4 track phủ đủ bề rộng', async ({ page }) => {
    await open(page);
    await menuReady(page);
    await expect(tid(page, 'header-mega-promo')).toHaveCount(0);
    await expect(tid(page, 'header-drawer-promo')).toHaveCount(0);
    await need(page, 'columns');
    const { toggle, submenu } = parts(itemsOf(page, 'columns').first());
    await toggle.click();
    await expect(submenu).toBeVisible();
    const g = await submenu.evaluate((el) => {
      const cs = getComputedStyle(el);
      const tracks = cs.gridTemplateColumns.split(' ').map(parseFloat);
      return { tracks, gap: parseFloat(cs.columnGap), width: el.clientWidth };
    });
    expect(g.tracks).toHaveLength(4);
    expect(near(g.tracks.reduce((a, b) => a + b, 0) + g.gap * 3, g.width, 2)).toBe(true);
  });

  test('TC-21 AC6 1280: tải trang mọi details header đóng, ảnh menu lazy có kích thước, 0 request ảnh menu trước khi mở', async ({ page }) => {
    await open(page);
    expect(await tid(page, 'header').evaluate((h) => [...h.querySelectorAll('details')].filter((d) => d.open).length)).toBe(0);
    const imgs = await page.evaluate(() =>
      [...document.querySelectorAll('[data-testid="header-menu"] img, [data-testid="header-drawer"] img')].map((i) => ({
        src: (i as HTMLImageElement).currentSrc || (i as HTMLImageElement).src,
        loading: i.getAttribute('loading'),
        w: i.getAttribute('width'),
        h: i.getAttribute('height'),
        fp: i.getAttribute('fetchpriority'),
      })),
    );
    for (const i of imgs) {
      expect(i.loading, i.src).toBe('lazy');
      expect(i.w && i.h, `${i.src} thiếu width/height`).toBeTruthy();
      expect(i.fp, `${i.src} có fetchpriority`).toBeNull();
    }
    const loaded = await page.evaluate((srcs) => performance.getEntriesByType('resource').filter((e) => srcs.some((s) => s && e.name.split('?')[0] === s.split('?')[0])).length, imgs.map((i) => i.src));
    expect(loaded, 'ảnh menu tải trước khi mở').toBe(0);
    if (!imgs.length) test.info().annotations.push({ type: 'data', description: 'menu chưa có ảnh (FE3 cắt R1) — chỉ kiểm details đóng' });
  });

  test('TC-22 AC6 mọi link menu (cả cấp 3) có trong HTML server khi đóng; link cấp 3 drawer có trong nav desktop', async ({ page }) => {
    const res = await page.goto('/');
    await expectNotChallenged(page);
    expect(res?.status(), 'store trả 429/lỗi cho /').toBe(200);
    const html = (await res?.text()) ?? '';
    const server = await page.evaluate((h) => {
      const doc = new DOMParser().parseFromString(h, 'text/html');
      return [...doc.querySelectorAll('[data-testid="header-menu"] a[href]')].map((a) => a.getAttribute('href'));
    }, html);
    const live = await nav(page).locator('a[href]').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
    expect(server.length, 'HTML server có link menu').toBeGreaterThan(0);
    expect(server).toEqual(live);
    const data = await menuData(page);
    const navTexts = await nav(page).locator('a').evaluateAll((as) => as.map((a) => a.textContent!.trim()));
    for (const g of data.flatMap((d) => d.children.flatMap((c) => c.grand))) expect(navTexts, `thiếu link cấp 3 "${g}" trong nav desktop`).toContain(g);
  });

  for (const path of ['/', '/collections/all']) {
    test(`TC-23 AC6 ${path}: LCP không thuộc menu; mở panel bằng hover CLS = 0`, async ({ page }) => {
      await page.addInitScript(() => {
        (window as unknown as { __lcp: Element | null }).__lcp = null;
        new PerformanceObserver((l) => {
          for (const e of l.getEntries()) (window as unknown as { __lcp: Element | null }).__lcp = (e as unknown as { element: Element | null }).element;
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      });
      await open(page, path);
      await menuReady(page);
      await page.waitForTimeout(1000);
      // TE-22 AC6: LCP không thuộc menu (nav desktop, drawer); logo trong header không phải menu
      const lcp = await page.evaluate(() => {
        const el = (window as unknown as { __lcp: Element | null }).__lcp;
        return el ? { inMenu: !!el.closest('[data-testid="header-menu"], [data-testid="header-drawer"]'), desc: `${el.tagName}.${el.className}` } : null;
      });
      expect(lcp?.inMenu, `phần tử LCP thuộc menu: ${lcp?.desc}`).not.toBe(true);
      await need(page, 'mega');
      await page.evaluate(() => {
        (window as unknown as { __cls: number }).__cls = 0;
        new PerformanceObserver((l) => {
          for (const e of l.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) if (!e.hadRecentInput) (window as unknown as { __cls: number }).__cls += e.value;
        }).observe({ type: 'layout-shift' });
      });
      const { toggle, panel } = firstMega(page);
      await toggle.hover();
      await expect(panel).toBeVisible();
      await page.waitForTimeout(500);
      expect(await page.evaluate(() => (window as unknown as { __cls: number }).__cls)).toBeLessThanOrEqual(0.0001);
    });
  }

  test('TC-24 AC7 ngữ nghĩa: 2 nav khác tên, 0 h* trong menu, ul[aria-labelledby] và aria-controls trỏ id có thật (B-06)', async ({ page }) => {
    await open(page);
    const s = await page.evaluate(() => {
      // Phạm vi menu (nav desktop + drawer): dialog search trong header có h2 "Search" theo TE-8 AC9
      const menus = [...document.querySelectorAll('[data-testid="header-menu"], [data-testid="header-drawer"]')];
      const all = (sel: string) => menus.flatMap((m) => [...m.querySelectorAll(sel)]);
      return {
        main: document.querySelectorAll('nav[aria-label="Main menu"]').length,
        mobile: document.querySelectorAll('nav[aria-label="Mobile menu"]').length,
        headings: all('h1,h2,h3,h4,h5,h6').length,
        labelled: all('ul[aria-labelledby]').map((ul) => document.getElementById(ul.getAttribute('aria-labelledby')!)?.tagName ?? 'MISSING'),
        controls: all('summary[aria-controls]').map((s) => !!document.getElementById(s.getAttribute('aria-controls')!)),
      };
    });
    expect(HEADER_LOCALE.menu_label).toBe('Main menu');
    expect(HEADER_LOCALE.drawer_menu_label).toBe('Mobile menu');
    expect(s.main).toBe(1);
    expect(s.mobile).toBe(1);
    expect(s.headings, 'menu không dùng h*').toBe(0);
    for (const tag of s.labelled) expect(tag).not.toMatch(/MISSING|^H[1-6]$/);
    expect(s.controls.every(Boolean), 'aria-controls trỏ id không tồn tại').toBe(true);
  });

  test('TC-25 AC7 thứ tự Tab: panel đóng thì link trong không nhận focus; mở thì sau link cuối tới mục cấp 1 kế tiếp', async ({ page }) => {
    await open(page);
    await menuReady(page);
    await need(page, 'mega');
    const items = navItems(page);
    const index = (await items.evaluateAll((lis) => lis.map((li) => !!li.querySelector('details[data-mega]')))).indexOf(true);
    test.skip(index === (await items.count()) - 1, 'mục mega là mục cuối, không có mục cấp 1 kế tiếp');
    const { toggle, panel } = parts(items.nth(index));
    const next = items.nth(index + 1);
    await toggle.focus();
    await page.keyboard.press('Tab');
    expect(await next.evaluate((el) => el.contains(document.activeElement)), 'panel đóng: Tab sang mục kế tiếp').toBe(true);
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(panel).toBeVisible();
    const n = await panel.locator('a[href]').count();
    for (let i = 0; i < n; i++) await page.keyboard.press('Tab');
    expect(await panel.evaluate((el) => el.contains(document.activeElement)), 'đang ở link cuối panel').toBe(true);
    await page.keyboard.press('Tab');
    expect(await next.evaluate((el) => el.contains(document.activeElement)), 'sau link cuối là mục cấp 1 kế tiếp').toBe(true);
  });

  test('TC-26 AC7 trang hiện tại: link panel aria-current="page" gạch chân 2px', async ({ page }) => {
    await open(page);
    await need(page, 'mega');
    const { panel } = firstMega(page);
    const href = await panel.locator('a[href]').evaluateAll((as) =>
      as.map((a) => (a as HTMLAnchorElement).getAttribute('href')!).find((h) => h.startsWith('/') && !/\/collections\/?$/.test(h)),
    );
    test.skip(!href, 'panel không có link nội bộ');
    await open(page, href!);
    await menuReady(page);
    const current = nav(page).locator('a[aria-current="page"]').first();
    test.skip((await current.count()) === 0, `Shopify không đánh dấu current cho ${href}`);
    const ownerIndex = await navItems(page).evaluateAll((lis) => lis.findIndex((li) => !!li.querySelector('a[aria-current="page"]')));
    const owner = parts(navItems(page).nth(ownerIndex));
    if (await owner.toggle.count()) await owner.toggle.click();
    await expect(current).toBeVisible();
    const d = await current.evaluate((el) => ({ line: getComputedStyle(el).textDecorationLine, th: getComputedStyle(el).textDecorationThickness }));
    expect(d.line).toContain('underline');
    expect(d.th).toBe('2px');
  });

  test('TC-27 AC7 focus trên thanh tối: outline trắng (dark-foreground) 2px', async ({ page }) => {
    await open(page);
    await need(page, 'mega');
    const { toggle } = firstMega(page);
    await toggle.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await expect(toggle).toBeFocused();
    const o = await toggle.evaluate((el) => ({ style: getComputedStyle(el).outlineStyle, width: getComputedStyle(el).outlineWidth, color: getComputedStyle(el).outlineColor }));
    expect(o.style).not.toBe('none');
    expect(o.width).toBe('2px');
    expect(o.color).toBe(await cssVarColor(page, '--color-background-dark-foreground'));
  });

  test('TC-28 AC7 vùng chạm: mục cấp 1 cao ≥ 44, link trong panel A/B/C cao ≥ 40 (bug ES1-T330-B01)', async ({ page }) => {
    await open(page);
    await menuReady(page);
    const top = await navItems(page).evaluateAll((lis) =>
      lis.map((li) => {
        const el = li.querySelector(':scope > details > summary, :scope > a')!;
        return { text: el.textContent!.trim(), h: el.getBoundingClientRect().height };
      }),
    );
    const small: string[] = top.filter((t) => t.h < 44 - 0.5).map((t) => `cấp 1 "${t.text}" ${t.h}px`);
    const count = await navItems(page).count();
    for (let i = 0; i < count; i++) {
      const p = parts(navItems(page).nth(i));
      if (!(await p.toggle.count())) continue;
      await p.toggle.click();
      await expect(p.submenu).toBeVisible();
      const links = await p.submenu.locator('a').evaluateAll((as) => as.map((a) => ({ text: a.textContent!.trim(), h: a.getBoundingClientRect().height })));
      small.push(...links.filter((l) => l.h < 40 - 0.5).map((l) => `panel "${l.text}" ${l.h}px`));
      await p.toggle.click();
    }
    expect(small, 'vùng chạm dưới ngưỡng TE-22 AC7').toEqual([]);
  });

  test('TC-29 AC7 prefers-reduced-motion: panel, scrim không animation, không translate/scale; link hover không dịch', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    await menuReady(page);
    await need(page, 'mega');
    const { toggle, panel, scrim } = firstMega(page);
    await toggle.click();
    await expect(panel).toBeVisible();
    for (const el of [panel, scrim]) {
      const m = await el.evaluate((e) => ({ anims: e.getAnimations().length, tr: getComputedStyle(e).translate, tf: getComputedStyle(e).transform, sc: getComputedStyle(e).scale }));
      expect(m).toEqual({ anims: 0, tr: 'none', tf: 'none', sc: 'none' });
    }
    const link = panel.getByRole('link').last();
    await link.hover();
    await page.waitForTimeout(200);
    expect(await link.evaluate((e) => [getComputedStyle(e).translate, getComputedStyle(e).transform])).toEqual(['none', 'none']);
  });

  test('TC-30 AC7 axe 1280 panel mega mở: 0 vi phạm serious/critical trong header', async ({ page }) => {
    await open(page);
    await menuReady(page);
    await need(page, 'mega');
    const { toggle, panel } = firstMega(page);
    await toggle.click();
    await expect(panel).toBeVisible();
    await expectNotChallenged(page);
    const axe = await new AxeBuilder({ page }).include('[data-testid="header"]').analyze();
    const bad = axe.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
  });

  test('TC-49 AC14 store dev đã cấu hình: Shop kiểu A, Collection kiểu B 5 ô', async ({ page }) => {
    await open(page);
    const shop = navItems(page).filter({ has: page.getByTestId('header-menu-toggle').filter({ hasText: /^\s*Shop\s*$/i }) });
    const coll = navItems(page).filter({ has: page.getByTestId('header-menu-toggle').filter({ hasText: /^\s*Collections?\s*$/i }) });
    test.skip((await shop.count()) === 0 || (await coll.count()) === 0, 'store dev chưa cấu hình menu Shop/Collection (ES1-T298)');
    const shopData = (await menuData(page)).find((d) => /^Shop$/i.test(d.title));
    await expect(coll.locator(':scope > details')).toHaveAttribute('data-mega', 'tiles');
    await expect(coll.getByTestId('header-mega-panel').locator('ul[aria-labelledby] > li')).toHaveCount(5);
    // Shop kiểu A cần store có cấp 3 (AC14 Given, ES1-T298); chưa có thì chỉ bỏ phần Shop, giữ kiểm Collection.
    test.skip(!shopData?.children.some((c) => c.grand.length), 'store dev: Shop chưa có cấp 3 (Categories, Training Level, Featured) — AC14 Given chưa đạt, chờ ES1-T298');
    await expect(shop.locator(':scope > details')).toHaveAttribute('data-mega', 'columns');
    if (FE3) await expect(shop.getByTestId('header-mega-promo')).toHaveCount(1);
  });

  test('TC-17 AC5 card sản phẩm nổi bật ở panel A đầu tiên', async ({ page }) => {
    test.skip(!FE3, FE3_CUT);
    await open(page);
    await menuReady(page);
    await need(page, 'columns');
    const { toggle, panel } = parts(itemsOf(page, 'columns').first());
    await toggle.click();
    const promo = panel.getByTestId('header-mega-promo');
    test.skip((await promo.count()) === 0, 'store dev chưa chọn "Featured product in menu"');
    await expect(promo).toHaveCount(1);
    await expect(promo.getByText(HEADER_LOCALE.featured ?? 'Featured', { exact: true })).toBeVisible();
    await expect(promo.locator('img')).toHaveAttribute('loading', 'lazy');
  });

  test('TC-19 TC-20 AC5 tắt ảnh: B thành C; collection không ảnh / 0 sản phẩm', async () => {
    test.skip(!FE3, FE3_CUT);
    test.skip(true, 'cần đổi setting menu_collection_images trên store dev và collection không ảnh/0 sản phẩm trong menu — chạy tay khi FE3 vào R2');
  });
});

// =====================================================================================
test.describe('ES1-T330 mega cảm ứng từ 80rem', () => {
  test.use({ hasTouch: true });
  test.beforeEach(({}, ti) => {
    test.skip(!BASE_URL, 'cần PREVIEW_URL hoặc STORE_ORIGIN');
    test.skip(!isDesktop(ti), 'desktop có touch');
  });

  test('TC-05 AC1 1280 cảm ứng: chạm mở, chạm lại đóng, không mở do pointerover', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await open(page);
    await menuReady(page);
    await need(page, 'mega');
    const { toggle, panel } = firstMega(page);
    await toggle.tap();
    await expect(panel).toBeVisible();
    await page.waitForTimeout(400); // quá trễ hover 150ms: không bị timer hover đóng/mở lại
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await toggle.tap();
    await expect(panel).toBeHidden();
    await page.waitForTimeout(400);
    await expect(panel).toBeHidden();
  });
});

// =====================================================================================
test.describe('ES1-T330 mega không JS', () => {
  test.use({ javaScriptEnabled: false });
  test.beforeEach(({}, ti) => {
    test.skip(!BASE_URL, 'cần PREVIEW_URL hoặc STORE_ORIGIN');
    test.skip(!isDesktop(ti), 'desktop');
  });

  test('TC-06 AC1 không JS: bấm trigger mở, bấm lại đóng, bấm scrim đóng', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await open(page, '/', 'domcontentloaded');
    await need(page, 'mega');
    const { toggle, panel } = firstMega(page);
    await toggle.click();
    await expect(panel.getByRole('link').first()).toBeVisible();
    await toggle.click();
    await expect(panel).toBeHidden();
    await toggle.click();
    await expect(panel).toBeVisible();
    const box = (await panel.boundingBox())!;
    const y = Math.min(box.y + box.height + 40, 895);
    test.skip(y <= box.y + box.height, 'panel cao kín khung nhìn, không còn vùng scrim');
    await page.mouse.click(640, y);
    await expect(panel).toBeHidden();
  });
});

// =====================================================================================
test.describe('ES1-T330 drawer cấp 3 dưới 80rem', () => {
  test.beforeEach(({}, ti) => {
    test.skip(!BASE_URL, 'cần PREVIEW_URL hoặc STORE_ORIGIN');
    test.skip(isDesktop(ti), 'mobile');
  });

  async function openLevel3(page: Page) {
    await open(page);
    const toggle = tid(page, 'header-drawer-toggle');
    test.skip((await toggle.count()) === 0, 'menu trống');
    const data = await menuData(page);
    const index = data.findIndex((d) => d.children.some((c) => c.grand.length));
    test.skip(index < 0, `${NO_MEGA} (cần mục có cấp 3)`);
    await toggle.click();
    await page.waitForFunction(() => !!customElements.get('header-drawer'));
    const drawer = tid(page, 'header-drawer');
    await expect(drawer).toBeVisible();
    const item = drawer.getByTestId('header-menu-item').nth(index);
    const row = item.getByTestId('header-drawer-accordion-toggle');
    await row.click();
    const level = item.getByTestId('header-drawer-level');
    await expect(level).toBeVisible();
    return { drawer, row, level, data: data[index] };
  }

  for (const width of [360, 768]) {
    test(`TC-13 AC4 ${width}: cấp 2 có tiêu đề, View all 52, nhóm cấp 3 (tiêu đề link 44, link 48), 0 h*, không tràn (B-04)`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      const { drawer, level, data } = await openLevel3(page);
      await page.waitForTimeout(300);
      const m = await level.evaluate((el) => {
        const sub = el.querySelector('[data-testid="header-drawer-submenu"]')!;
        const viewAll = sub.querySelector(':scope > li > a')!;
        const groups = [...sub.querySelectorAll('ul[aria-labelledby]')].map((ul) => {
          const t = document.getElementById(ul.getAttribute('aria-labelledby')!)!;
          return { tag: t.tagName, title: t.textContent!.trim(), th: t.getBoundingClientRect().height, links: [...ul.querySelectorAll('a')].map((a) => a.getBoundingClientRect().height) };
        });
        return { title: el.querySelector('[id]')?.textContent?.trim() ?? '', viewAll: viewAll.textContent!.trim(), vh: viewAll.getBoundingClientRect().height, groups };
      });
      expect(m.viewAll).toMatch(/^View all /);
      expect(m.vh, 'hàng View all ≥ 52').toBeGreaterThanOrEqual(52 - 0.5);
      const expectedGroups = data.children.filter((c) => c.grand.length);
      expect(m.groups.map((g) => g.title)).toEqual(expectedGroups.map((g) => g.title));
      for (const g of m.groups) {
        expect(g.tag, 'tiêu đề nhóm là link').toBe('A');
        expect(g.th, `tiêu đề nhóm "${g.title}" ≥ 44`).toBeGreaterThanOrEqual(44 - 0.5);
        for (const h of g.links) expect(h, `link cấp 3 trong "${g.title}" ≥ 48`).toBeGreaterThanOrEqual(48 - 0.5);
      }
      await expect(level.getByText(data.title, { exact: true }).first()).toBeVisible();
      expect(await drawer.evaluate((el) => el.querySelectorAll('h1,h2,h3,h4,h5,h6').length)).toBe(0);
      expect(await level.evaluate((el) => el.scrollWidth <= el.clientWidth + 1), 'cấp 2 tràn ngang').toBe(true);
    });
  }

  test('TC-50 TE-1 AC2 768: chạm mục có cấp 3 → cấp 2, focus Back "Back to menu" ≥ 44; Back → về cấp 1, focus về hàng', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 900 });
    const { row, level } = await openLevel3(page);
    const back = level.getByTestId('header-drawer-back');
    await expect(back).toBeFocused();
    await expect(back).toHaveAccessibleName(HEADER_LOCALE.back_label);
    expect((await back.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await back.click();
    await expect(level).toBeHidden();
    await expect(row).toBeFocused();
  });

  test('TC-30 AC7 axe 360 drawer cấp 2 có cấp 3 mở: 0 serious/critical', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await openLevel3(page);
    await expectNotChallenged(page);
    const axe = await new AxeBuilder({ page }).include('[data-testid="header-drawer"]').analyze();
    const bad = axe.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
  });

  test('TC-21 AC6 360: drawer đóng khi tải, details trong drawer đóng', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await open(page);
    await expect(tid(page, 'header-drawer')).toBeHidden();
    expect(await tid(page, 'header').evaluate((h) => [...h.querySelectorAll('details')].filter((d) => d.open).length)).toBe(0);
  });

  test('TC-14 TC-15 AC4 AC5 kiểu B hàng 72 ảnh 56; card cuối cấp 2', async () => {
    test.skip(!FE3, FE3_CUT);
    test.skip(true, 'FE3 vào R2: bổ sung đo hàng collection 72/ảnh 56 và header-drawer-promo theo navigation.md §5.3');
  });
});

test.describe('ES1-T330 drawer không JS', () => {
  test.use({ javaScriptEnabled: false });
  test.beforeEach(({}, ti) => {
    test.skip(!BASE_URL, 'cần PREVIEW_URL hoặc STORE_ORIGIN');
    test.skip(isDesktop(ti), 'mobile');
  });

  test('TC-16 TC-51 AC4 TE-1 AC2 360 không JS: accordion tại chỗ hiện đủ cấp 2 + cấp 3, không Back', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await open(page, '/', 'domcontentloaded');
    const toggle = tid(page, 'header-drawer-toggle');
    test.skip((await toggle.count()) === 0, 'menu trống');
    const data = await menuData(page);
    const index = data.findIndex((d) => d.children.some((c) => c.grand.length));
    test.skip(index < 0, `${NO_MEGA} (cần mục có cấp 3)`);
    await toggle.click();
    const drawer = tid(page, 'header-drawer');
    await expect(drawer).toBeVisible();
    const item = drawer.getByTestId('header-menu-item').nth(index);
    await item.getByTestId('header-drawer-accordion-toggle').click();
    const sub = item.getByTestId('header-drawer-submenu');
    await expect(sub).toBeVisible();
    const all = [...data[index].children.map((c) => c.title), ...data[index].children.flatMap((c) => c.grand)];
    for (const t of all) await expect(sub.getByRole('link', { name: t, exact: true }).first()).toBeVisible();
    await expect(item.getByTestId('header-drawer-back')).toBeHidden();
  });
});

// =====================================================================================
test.describe('ES1-T330 View all', () => {
  test.beforeEach(({}, ti) => {
    test.skip(!BASE_URL, 'cần PREVIEW_URL hoặc STORE_ORIGIN');
    test.skip(!isDesktop(ti), 'HTML giống nhau ở 2 project');
  });

  test('TC-12 AC3 nhãn View all theo loại link cha ở panel và drawer, không "View all" trần', async ({ page }) => {
    await open(page);
    const rows = await page.evaluate(() => {
      const out: { where: string; parent: string; text: string; path: string }[] = [];
      document.querySelectorAll('[data-testid="header-menu"] [data-testid="header-menu-item"]').forEach((li) => {
        const parent = li.querySelector('[data-testid="header-menu-toggle"]')?.textContent?.trim() ?? '';
        const a = li.querySelector('[data-testid="header-mega-panel"] a');
        if (a) out.push({ where: 'panel', parent, text: a.textContent!.trim(), path: new URL((a as HTMLAnchorElement).href).pathname });
      });
      document.querySelectorAll('[data-testid="header-drawer"] [data-testid="header-menu-item"]').forEach((li) => {
        const parent = li.querySelector('[data-testid="header-drawer-accordion-toggle"]')?.textContent?.trim() ?? '';
        const a = li.querySelector('[data-testid="header-drawer-submenu"] > li > a');
        if (a) out.push({ where: 'drawer', parent, text: a.textContent!.trim(), path: new URL((a as HTMLAnchorElement).href).pathname });
      });
      return out;
    });
    test.skip(!rows.length, 'menu không có mục có con');
    const custom = (t: string) => HEADER_LOCALE.view_all.replace('{{ title }}', t);
    for (const r of rows) {
      const allowed = /\/collections\/all$/.test(r.path)
        ? [HEADER_LOCALE.view_all_products, custom(r.parent)]
        : /\/collections\/?$/.test(r.path)
          ? [HEADER_LOCALE.view_all_collections]
          : [custom(r.parent)];
      expect(allowed, `${r.where} "${r.parent}" (${r.path})`).toContain(r.text);
    }
    const bare = await tid(page, 'header').getByRole('link', { name: /^\s*View all\s*$/i, includeHidden: true }).count();
    expect(bare, 'link chỉ ghi "View all"').toBe(0);
  });
});

// =====================================================================================
test.describe('ES1-T330 breadcrumb', () => {
  test.beforeEach(({}, ti) => {
    test.skip(!BASE_URL, 'cần PREVIEW_URL hoặc STORE_ORIGIN');
    test.skip(!isDesktop(ti), 'HTML giống nhau ở 2 project; AC10 đo 4 mốc riêng');
  });

  test('TC-32 TC-40 TC-44 TC-47 AC9 AC12 AC13 collection: Home / Collections / {collection}', async ({ page }) => {
    needWired('collection');
    await open(page, '/collections/all');
    await expectTrail(page, [{ name: HOME, path: '/' }, { name: COLLECTIONS, path: '/collections' }, { name: await h1Text(page) }]);
    await expectHeadingOrder(page);
  });

  test('TC-33 TC-40 TC-44 AC9 AC12 sản phẩm trong collection và qua /products/', async ({ page }) => {
    needWired('product');
    let handle = env('TE1_PRODUCT_HANDLE');
    await open(page, '/collections/all');
    const collectionTitle = await h1Text(page);
    if (!handle) {
      const href = await page.locator('a[href*="/products/"]').first().getAttribute('href');
      handle = href?.split('/products/')[1]?.split(/[?#]/)[0];
    }
    test.skip(!handle, 'không tìm được sản phẩm trên /collections/all');
    await open(page, `/collections/all/products/${handle}`);
    const productTitle = await h1Text(page);
    await expectTrail(page, [{ name: HOME, path: '/' }, { name: collectionTitle, path: '/collections/all' }, { name: productTitle }]);
    await open(page, `/products/${handle}`);
    await expectTrail(page, [{ name: HOME, path: '/' }, { name: productTitle }]);
  });

  test('TC-35 TC-34 TC-40 TC-44 TC-47 AC9 AC12 AC13 bài viết, blog, trang tag', async ({ page }) => {
    const article = await articlePath(page);
    test.skip(!article, 'không có bài viết (TE330_ARTICLE_PATH hoặc link bài trên trang chủ)');
    const blog = article!.replace(/\/[^/]+$/, '');
    let blogTitle = '';
    if (breadcrumbWired('blog')) {
      await open(page, blog);
      blogTitle = await h1Text(page);
      await expectTrail(page, [{ name: HOME, path: '/' }, { name: blogTitle }]);
      await expectHeadingOrder(page);
    }
    needWired('article');
    await open(page, article!);
    const articleTitle = await h1Text(page);
    const trail = await tid(page, 'breadcrumb').locator(':scope > ol > li').allInnerTexts();
    blogTitle ||= trail[1]?.trim() ?? '';
    await expectTrail(page, [{ name: HOME, path: '/' }, { name: blogTitle, path: new URL(blog, BASE_URL).pathname }, { name: articleTitle }]);
    await expectHeadingOrder(page);
    const tag = page.locator('a[href*="/tagged/"]').first();
    if (breadcrumbWired('blog') && (await tag.count())) {
      const tagName = (await tag.innerText()).trim().replace(/^#/, '');
      await open(page, (await tag.getAttribute('href'))!);
      await expectTrail(page, [{ name: HOME, path: '/' }, { name: blogTitle, path: new URL(blog, BASE_URL).pathname }, { name: tagName }]);
    } else {
      test.info().annotations.push({ type: 'skip-part', description: `blog/tag: ${breadcrumbWired('blog') ? 'bài không có tag' : `templates/blog.liquid chưa gọi breadcrumb — chờ ${WIRING.blog}`}` });
    }
  });

  test('TC-36 TC-40 TC-44 TC-47 AC9 AC12 AC13 page: Home / {page}', async ({ page }) => {
    needWired('page');
    const path = env('TE403_PAGE_PATH');
    test.skip(!path, 'thiếu TE403_PAGE_PATH');
    await open(page, path!);
    await expectTrail(page, [{ name: HOME, path: '/' }, { name: await h1Text(page) }]);
    await expectHeadingOrder(page);
  });

  for (const path of ['/search', '/search?q=a']) {
    test(`TC-37 TC-40 TC-44 AC9 AC12 ${path}: Home / Search`, async ({ page }) => {
      needWired('search');
      await open(page, path);
      await expectTrail(page, [{ name: HOME, path: '/' }, { name: SEARCH }]);
    });
  }

  test('TC-38 TC-40 TC-44 AC9 AC12 list-collections: Home / Collections', async ({ page }) => {
    needWired('list-collections');
    await open(page, '/collections');
    await expectTrail(page, [{ name: HOME, path: '/' }, { name: COLLECTIONS }]);
  });

  test('TC-39 TC-40 TC-44 AC9 AC12 ?view=quiz: Home / Your Gear Shortlist', async ({ page }) => {
    needWired('collection.quiz');
    const quiz = env('TE11_QUIZ_COLLECTION');
    test.skip(!quiz, 'thiếu TE11_QUIZ_COLLECTION');
    await open(page, `/collections/${quiz}?view=quiz`);
    await expectTrail(page, [{ name: HOME, path: '/' }, { name: QUIZ_TRAIL }]);
  });

  for (const path of ['/', '/cart', '/pages/es1-t330-khong-ton-tai']) {
    test(`TC-41 TC-45 AC9 AC12 ${path}: không breadcrumb, không BreadcrumbList`, async ({ page }) => {
      await open(page, path);
      const s = await breadcrumbState(page);
      expect(s.navs).toBe(0);
      expect(s.lists).toHaveLength(0);
      await expect(tid(page, 'breadcrumb')).toHaveCount(0);
    });
  }

  test('TC-52 TE-1 AC7 trang có breadcrumb: html lang, title, description, 1 canonical, og, twitter', async ({ page }) => {
    const paths = ['/collections/all', '/collections'];
    const handle = env('TE1_PRODUCT_HANDLE');
    if (handle) paths.push(`/products/${handle}`);
    for (const path of paths) {
      await open(page, path);
      const h = await page.evaluate(() => ({
        lang: document.documentElement.lang,
        title: document.title,
        desc: document.querySelectorAll('meta[name="description"]').length,
        canonical: document.querySelectorAll('link[rel="canonical"]').length,
        ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content'),
        ogUrl: document.querySelector('meta[property="og:url"]')?.getAttribute('content'),
        tw: document.querySelector('meta[name="twitter:card"]')?.getAttribute('content'),
      }));
      expect(h.lang, path).toMatch(/^[a-z]{2}(-[A-Za-z]{2,})?$/);
      expect(h.title, path).not.toBe('');
      expect(h.canonical, path).toBe(1);
      expect(h.ogTitle, path).toBeTruthy();
      expect(h.ogUrl, path).toBeTruthy();
      expect(h.tw, path).toBeTruthy();
      expect(h.desc, path).toBeLessThanOrEqual(1);
    }
  });
});

// =====================================================================================
test.describe('ES1-T330 breadcrumb tên dài 4 mốc', () => {
  test.beforeEach(({}, ti) => {
    test.skip(!BASE_URL, 'cần PREVIEW_URL hoặc STORE_ORIGIN');
    test.skip(!isDesktop(ti), 'đo bằng setViewportSize');
  });

  /** HTML thật của trang có breadcrumb, tên cuối + h1 thay bằng chuỗi dài (kiểm mockup: store không có tên > 48 ký tự). */
  async function mountLong(page: Page, name: string) {
    const article = breadcrumbWired('article') ? await articlePath(page) : undefined;
    const path = article ?? '/collections';
    test.skip(!article && !breadcrumbWired('list-collections'), 'chưa trang nào gọi breadcrumb');
    await page.route(new URL(path, BASE_URL).href, async (route) => {
      const res = await route.fetch();
      const body = (await res.text())
        .replace(/(<span class="breadcrumb__current"[^>]*>)[^<]*/, `$1${name}`)
        .replace(/(<h1\b[^>]*>)[^<]*/, `$1${name}`);
      await route.fulfill({ response: res, body });
    });
    await open(page, path);
  }

  for (const width of [360, 768, 1280, 1920]) {
    test(`TC-42 AC10 ${width}: mục cuối và h1 hiện đủ tên dài, không "…", xuống dòng, không tràn ngang`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await mountLong(page, LONG);
      const current = tid(page, 'breadcrumb-current');
      await expect(current).toHaveText(LONG);
      const s = await current.evaluate((el) => ({ to: getComputedStyle(el).textOverflow, ws: getComputedStyle(el).whiteSpace, lh: parseFloat(getComputedStyle(el).lineHeight) || 20 }));
      expect(s.to).not.toBe('ellipsis');
      expect(s.ws).not.toMatch(/nowrap/);
      const box = (await current.boundingBox())!;
      expect(box.x + box.width).toBeLessThanOrEqual(width + 0.5);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      if (width === 360) expect(box.height, 'xuống dòng ở 360').toBeGreaterThan(s.lh * 1.5);
      await expect(page.getByRole('heading', { level: 1 }).first()).toHaveText(LONG);
    });
  }

  test('B-02 AC10 360: 1 token 64 ký tự không khoảng trắng vẫn xuống dòng, không tràn ngang', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 900 });
    await mountLong(page, LONG_TOKEN);
    const box = (await tid(page, 'breadcrumb-current').boundingBox())!;
    expect(box.x + box.width).toBeLessThanOrEqual(360.5);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  });
});

// =====================================================================================
test.describe('ES1-T330 banner collection', () => {
  test.beforeEach(({}, ti) => {
    test.skip(!BASE_URL, 'cần PREVIEW_URL hoặc STORE_ORIGIN');
    test.skip(!isDesktop(ti), 'đo bằng setViewportSize');
  });

  for (const [width, gap, minH] of [[360, 16, 280], [1280, 24, 360]] as const) {
    test(`TC-43 AC11 ${width}: banner cách header ${gap}, cao ≥ ${minH}, bo 16, chữ trắng trên lớp 75% → 60%, ảnh eager + fetchpriority high`, async ({ page }) => {
      const path = env('TE330_BANNER_COLLECTION_PATH');
      test.skip(!path, 'thiếu TE330_BANNER_COLLECTION_PATH (collection có ảnh)');
      await page.setViewportSize({ width, height: 900 });
      await open(page, path!);
      const bc = tid(page, 'breadcrumb');
      test.skip((await bc.count()) === 0 || !(await bc.evaluate((el) => !!el.closest('.page-banner'))), `banner chưa dùng .page-banner + breadcrumb — chờ ${WIRING.collection}`);
      const m = await bc.evaluate((el) => {
        const banner = el.closest('.page-banner')!;
        const media = banner.querySelector('.page-banner__media')!;
        const img = banner.querySelector('img');
        const header = document.querySelector('[data-testid="header"]')!.getBoundingClientRect();
        const b = banner.getBoundingClientRect();
        const h1 = banner.querySelector('h1');
        return {
          gap: Math.round(b.top - header.bottom),
          h: b.height,
          radius: getComputedStyle(banner).borderStartStartRadius,
          overlay: getComputedStyle(media, '::after').backgroundImage,
          colors: [...el.querySelectorAll('a, [aria-current]'), h1].filter(Boolean).map((x) => getComputedStyle(x!).color),
          loading: img?.getAttribute('loading'),
          fp: img?.getAttribute('fetchpriority'),
        };
      });
      const white = await cssVarColor(page, '--color-background-dark-foreground');
      expect(m.gap).toBe(gap);
      expect(m.h).toBeGreaterThanOrEqual(minH);
      expect(m.radius).toBe('16px');
      expect(m.overlay).toContain('linear-gradient');
      expect(m.overlay).toMatch(/0\.75\)/);
      expect(m.overlay).toMatch(/0\.6\)/);
      for (const c of m.colors) expect(c).toBe(white);
      expect(m.loading).toBe('eager');
      expect(m.fp).toBe('high');
    });
  }
});
