// KHÔNG CHẮC: spec chưa chạy trong phiên viết (sandbox không có Chromium, PREVIEW_URL, STORE_PASSWORD); kết quả thật lấy từ CI e2e của PR.
// Ticket ES1-T324 TE-1-R2-BE2: assets/localization-picker.js (mới, ≤ 4 096 B, nạp lười khi tương tác; ADR 0010)
// + assets/localization-list.js (bàn phím, ô tìm > 10 nước, đang đổi, lỗi; import từ data-list-src).
// AC: docs/srs.md TE-1 AC10; docs/ui-spec/localization.md §4–§7 (popover ≥ 48rem, sheet 2 tab < 48rem, cấp 2 drawer có tab,
// ô tìm > 10 nước lọc theo tên + tiền tệ bỏ dấu, ↑ ↓ Enter Esc, mục hiện tại không gửi, đang đổi L9, lỗi L10, không JS vẫn đổi).
// Hợp đồng markup FE: snippets/localization-lists.liquid, blocks/footer.liquid, blocks/header.liquid {% doc %} (ES1-T322, TE-1-R2-FE5).
// Hành vi: fixture dựng lại markup footer + cấp 2 drawer trên origin giả https://theme.test (page.route phục vụ assets/ thật:
// critical.css, base.css, lazy-module.js, modal-dialog.js, localization-picker.js, localization-list.js); POST /localization bị chặn và ghi lại.
// Storefront: trang chủ preview, skip khi store dev chỉ bán 1 nước + 1 ngôn ngữ.
// Chạy: npx playwright test tests/e2e/ES1-T324.spec.ts (storefront: PREVIEW_URL=... STORE_PASSWORD=...)
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect, type Page } from './support/test';
import AxeBuilder from '@axe-core/playwright';
import { expectNotChallenged } from './support/store-guard';
import { watchShopPay403 } from './support/console-guard';

const PICKER_JS = 'assets/localization-picker.js';
const LIST_JS = 'assets/localization-list.js';
const PICKER = readFileSync(PICKER_JS, 'utf8');
const LIST = readFileSync(LIST_JS, 'utf8');
const FOOTER = readFileSync('blocks/footer.liquid', 'utf8');
const HEADER = readFileSync('blocks/header.liquid', 'utf8');
const SNIPPET = readFileSync('snippets/localization-lists.liquid', 'utf8');
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|shopifysvc\.com|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];

const ORIGIN = 'https://theme.test';
const TOKENS = `:root{--space-1:4px;--space-2:8px;--space-3:12px;--space-4:16px;--space-5:24px;--space-6:32px;--space-7:48px;--space-8:120px;
--page-margin:20px;--page-width:91rem;--header-height:80px;--radius-input:8px;--radius-button:8px;--radius-card:12px;--radius-pill:999px;
--color-background:#fff;--color-foreground:#1a1a1a;--color-muted:#5c5c5c;--color-muted-light:#6e6e6e;--color-border:#e5e5e5;
--color-background-alt:#f4f4f5;--color-background-dark:#1a1a1a;--color-background-dark-foreground:#fff;--color-accent:#b5380b;--color-sale:#b42318;
--font-size-sm:.875rem;--font-size-base:1rem;--font-size-lg:1.125rem;--font-size-h3:1.5rem;--font-size-h2:2rem;--line-height-heading:1.1;
--font-heading--family:serif;--font-heading--weight:700;--font-heading--weight-display:800;--font-primary--family:sans-serif;
--motion-fast:150ms;--motion-base:250ms;--motion-slow:500ms;--ease-out:ease-out}`;

// 12 nước (> 10 → ô tìm), US hiện tại; tên có dấu và tên chứa "land", "ca"
const COUNTRIES: Array<[string, string, string]> = [
  ['CA', 'Canada', 'CAD $'], ['CI', 'Côte d’Ivoire', 'XOF Fr'], ['FR', 'France', 'EUR €'], ['IE', 'Ireland', 'EUR €'],
  ['JM', 'Jamaica', 'JMD $'], ['NL', 'Netherlands', 'EUR €'], ['NZ', 'New Zealand', 'NZD $'], ['NO', 'Norway', 'NOK kr'],
  ['SE', 'Sweden', 'SEK kr'], ['GB', 'United Kingdom', 'GBP £'], ['US', 'United States', 'USD $'], ['VN', 'Vietnam', 'VND ₫'],
];
const LANGUAGES: Array<[string, string]> = [['en', 'English'], ['fr', 'Français']];

const LABELS = `data-label-status="[count] countries found" data-label-status-one="1 country found"
  data-label-no-results="No countries match “[query]”. Check the spelling or clear the search."
  data-label-error="We couldn't switch to [name]. Check your connection and try again." data-label-updating="Switching to [name]"`;

/** Như snippets/localization-lists.liquid render (id, testid theo nơi gọi). */
function lists(id: string, testid: string, countries = COUNTRIES) {
  const search = countries.length > 10;
  return `<div class="localization localization--both">
  <div class="alert localization__error" role="alert" data-localization-error data-testid="${testid}-localization-error" hidden>
    <div class="alert__body"><p class="alert__text" data-localization-error-text></p>
      <button type="button" class="button button--secondary localization__retry" data-localization-retry>Try Again</button></div></div>
  <div class="localization__tabs" role="tablist" aria-label="Country and language">
    <button type="button" class="localization__tab" role="tab" id="${id}LocalizationTabCountry" aria-controls="${id}CountryGroup" aria-selected="true">Country/region</button>
    <button type="button" class="localization__tab" role="tab" id="${id}LocalizationTabLanguage" aria-controls="${id}LanguageGroup" aria-selected="false" tabindex="-1">Language</button>
  </div>
  <div class="localization__group" id="${id}CountryGroup" data-localization-group="country" data-testid="${testid}-country-selector">
    ${search ? `<label class="localization__label" id="${id}CountryLabel" for="${id}CountrySearch">Country/region</label>
    <div class="localization__search" data-localization-search hidden>
      <input class="localization__search-input" id="${id}CountrySearch" type="search" autocomplete="off" placeholder="Search countries"
        aria-controls="${id}CountryList" aria-describedby="${id}CountryStatus" data-testid="${testid}-country-search">
      <button type="button" class="localization__clear" aria-label="Clear search" data-localization-clear hidden>×</button>
    </div>` : `<p class="localization__label" id="${id}CountryLabel">Country/region</p>`}
    <ul class="localization__list" id="${id}CountryList" aria-labelledby="${id}CountryLabel">
      ${countries.map(([code, name, cur]) => `<li><button class="localization__option" type="submit" name="country_code" value="${code}"
        data-testid="${testid}-country-option"${code === 'US' ? ' aria-current="true"' : ''}><span class="localization__name">${name}</span>
        <span class="localization__currency">${cur}</span></button></li>`).join('')}
    </ul>
    ${search ? `<div class="localization__empty" data-localization-empty hidden><p class="localization__empty-text" data-localization-empty-text></p>
      <button type="button" class="localization__empty-clear" data-localization-clear>Clear search</button></div>
    <p class="visually-hidden" id="${id}CountryStatus" role="status" data-testid="${testid}-country-status"></p>` : ''}
  </div>
  <div class="localization__group" id="${id}LanguageGroup" data-localization-group="language" data-testid="${testid}-language-selector">
    <p class="localization__label" id="${id}LanguageLabel">Language</p>
    <ul class="localization__list" aria-labelledby="${id}LanguageLabel">
      ${LANGUAGES.map(([code, name]) => `<li><button class="localization__option" type="submit" name="language_code" value="${code}" lang="${code}" dir="auto"
        data-testid="${testid}-language-option"${code === 'en' ? ' aria-current="true"' : ''}><span class="localization__name">${name}</span></button></li>`).join('')}
    </ul>
  </div>
</div>`;
}

const host = (body: string) => `<localization-picker data-lazy-module="/assets/localization-picker.js?v=324" data-lazy-on="interaction"
  data-list-src="/assets/localization-list.js?v=324" data-country-count="${COUNTRIES.length}" ${LABELS}>${body}</localization-picker>`;

const form = (id: string, inner: string) => `<form method="post" action="/localization" id="${id}" accept-charset="UTF-8">
  <input type="hidden" name="form_type" value="localization"><input type="hidden" name="utf8" value="✓">
  <input type="hidden" name="_method" value="put"><input type="hidden" name="return_to" value="/">${inner}</form>`;

const FIXTURE = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>ES1-T324</title>
<link rel="stylesheet" href="/assets/critical.css"><link rel="stylesheet" href="/assets/base.css"><style>${TOKENS}</style></head>
<body>
<main id="MainContent"><a href="#page" data-testid="page-link">Page link</a><p style="block-size:1200px">Page</p></main>
<section class="drawer-fixture" data-testid="drawer-fixture">
  ${host(form('HeaderDrawerLocalizationForm', `<details data-testid="header-drawer-localization">
    <summary class="site-header__drawer-row site-header__drawer-locale" aria-controls="HeaderDrawerLocalization">USD / EN</summary>
    <div class="site-header__drawer-level" id="HeaderDrawerLocalization" role="group" aria-labelledby="HeaderDrawerLocalizationTitle" data-drawer-level="2" data-testid="header-drawer-level">
      <p id="HeaderDrawerLocalizationTitle">Country and language</p>${lists('HeaderDrawer', 'header-drawer')}</div></details>`))}
</section>
<footer class="site-footer full-width" data-testid="footer"><div class="site-footer__bottom"><div class="site-footer__commerce-group">
  ${host(form('footer-localization', `<details class="site-footer__disclosure">
    <summary class="site-footer__summary" id="FooterLocalizationToggle" aria-controls="FooterLocalizationPanel" data-testid="footer-localization-toggle">
      <span class="site-footer__hidden-label">Change country and language:</span><span class="site-footer__locale-code">USD / EN</span>
      <span class="site-footer__hidden-label">, United States, English</span></summary>
    <modal-dialog data-layer="localization" data-sheet-below="48rem" data-return-focus="FooterLocalizationToggle">
      <dialog class="dialog site-footer__panel site-footer__panel--both site-footer__panel--tall" id="FooterLocalizationPanel" aria-labelledby="FooterLocalizationTitle" data-testid="footer-localization-panel">
        <div class="dialog__header site-footer__panel-header"><p class="dialog__title" id="FooterLocalizationTitle">Country and language</p>
          <button type="button" class="close-button dialog__close" aria-label="Close country and language">×</button></div>
        <div class="dialog__body site-footer__panel-body">${lists('Footer', 'footer')}</div>
      </dialog>
    </modal-dialog></details>`))}
  <script src="/assets/lazy-module.js?v=1" type="module"></script>
</div></div></footer>
<script src="/assets/modal-dialog.js" type="module"></script>
</body></html>`;

type MountOptions = { failList?: boolean; holdPost?: boolean; noJs?: boolean };

async function mount(page: Page, opts: MountOptions = {}) {
  const errors: string[] = [];
  const requests: string[] = [];
  const posts: string[] = [];
  let release = () => {};
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => m.type() === 'error' && !/Failed to load resource|ERR_INTERNET_DISCONNECTED/.test(m.text()) && errors.push(m.text()));
  await page.route(`${ORIGIN}/**`, async (route) => {
    const req = route.request();
    const { pathname } = new URL(req.url());
    if (pathname === '/localization' && req.method() === 'POST') {
      posts.push(req.postData() ?? '');
      if (opts.holdPost) await new Promise<void>((r) => (release = r));
      // Trang đích như mọi trang theme: meta viewport + base.css (cùng opt-in @view-transition), không thì Chromium báo pageerror
      // "ViewTransition opt-in disabled" / "Viewport size changed"
      return route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>switched</title><link rel="stylesheet" href="/assets/base.css"><p data-testid="switched">ok</p>' });
    }
    if (!pathname.startsWith('/assets/')) return route.fulfill({ body: FIXTURE, contentType: 'text/html; charset=utf-8' });
    const name = pathname.slice('/assets/'.length);
    requests.push(name);
    if (name === 'localization-list.js' && opts.failList) return route.abort();
    const file = join('assets', name);
    if (!/^[\w.-]+$/.test(name) || !existsSync(file)) return route.fulfill({ status: 404, body: '' });
    const type = name.endsWith('.css') ? 'text/css' : name.endsWith('.js') ? 'text/javascript' : 'application/octet-stream';
    return route.fulfill({ body: readFileSync(file), contentType: type });
  });
  await page.goto(`${ORIGIN}/`);
  if (!opts.noJs) await page.waitForFunction(() => !!customElements.get('modal-dialog'));
  return { errors, requests, posts, release: () => release() };
}

const footer = (page: Page) => page.getByTestId('footer');
const toggleOf = (page: Page) => page.getByTestId('footer-localization-toggle');
const panelOf = (page: Page) => page.getByTestId('footer-localization-panel');
const detailsOpen = (page: Page) => toggleOf(page).evaluate((s) => (s.parentElement as HTMLDetailsElement).open);
const isModal = (page: Page) => panelOf(page).evaluate((d) => d.matches(':modal'));
const search = (page: Page) => footer(page).getByTestId('footer-country-search');
const visibleCountries = (page: Page) =>
  footer(page).getByTestId('footer-country-option').evaluateAll((bs) =>
    bs.filter((b) => !(b.parentElement as HTMLElement).hidden).map((b) => b.querySelector('.localization__name')!.textContent!.trim()));
const isDesktop = (page: Page) => page.viewportSize()!.width >= 768;

/** Focus nút gộp (focusin → lazy-module nạp), chờ define + list module bỏ hidden ô tìm. */
async function enhance(page: Page) {
  await toggleOf(page).focus();
  await page.waitForFunction(() => !!customElements.get('localization-picker'));
  await expect(footer(page).locator('[data-localization-search]')).not.toHaveAttribute('hidden', '');
}

async function openFooter(page: Page) {
  await enhance(page);
  await toggleOf(page).click();
  await expect.poll(() => detailsOpen(page)).toBe(true);
  await expect(toggleOf(page)).toHaveAttribute('aria-expanded', 'true');
}

async function axeSerious(page: Page, include: string) {
  // Popover mở bằng motion-fade (base.css): quét giữa lúc mờ dần thì axe đo sai tương phản → chờ hết animation
  await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished.catch(() => {}))));
  await expectNotChallenged(page);
  const r = await new AxeBuilder({ page }).include(include).analyze();
  return r.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? '')).map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
}

// ---------- Tĩnh ----------
test.describe('ES1-T324 tĩnh', () => {
  test.beforeEach(({}, ti) => test.skip(ti.project.name !== 'desktop', 'tĩnh, chạy 1 lần'));

  test('trần byte (ADR 0010: localization-picker ≤ 4 096; mỗi file ≤ 8 192), không console/fetch/partials/import tĩnh, không tạo DOM, không style inline, guard define', () => {
    expect(statSync(PICKER_JS).size, 'localization-picker.js').toBeLessThanOrEqual(4096);
    expect(statSync(LIST_JS).size, 'localization-list.js').toBeLessThanOrEqual(8192);
    for (const [name, src] of [['picker', PICKER], ['list', LIST]] as const) {
      expect(src, name).not.toMatch(/console\.|fetch\(|partials|^\s*import\s|innerHTML|insertAdjacent|createElement|\.style\b|showModal/m);
    }
    expect(PICKER).toContain('if (!customElements.get("localization-picker")) customElements.define("localization-picker"');
    // ES1-T485: URL có ?v= từ asset_url trên host, không import.meta.url; lỗi import bỏ qua êm
    expect(PICKER).toContain('if (this.dataset.listSrc) import(this.dataset.listSrc)');
    expect(PICKER).toContain('() => {})');
    expect(PICKER).not.toMatch(/import\.meta/);
    for (const hook of ['modal-dialog', '"modal:close"', '.open(this.sum)', 'data-tabs', 'aria-expanded', '"tabpanel"', 'disconnectedCallback'])
      expect(PICKER, hook).toContain(hook);
    for (const hook of ['[data-localization-search]', '[data-localization-clear]', '[data-localization-empty]', '[data-localization-empty-text]',
      '[data-localization-error]', '[data-localization-error-text]', '[data-localization-retry]', '"pageshow"', 'navigator.onLine', 'requestSubmit'])
      expect(LIST, hook).toContain(hook);
  });

  test('hợp đồng markup: host footer + drawer nạp lười, 1 thẻ lazy-module, không thẻ script localization-*; hook snippet khớp JS', () => {
    for (const [name, src] of [['footer', FOOTER], ['header', HEADER]] as const) {
      // Thẻ thật (có thuộc tính); {% doc %} nhắc "<localization-picker>" không thuộc tính
      const tags = src.match(/<localization-picker\s[^>]*>/g) ?? [];
      expect(tags, name).toHaveLength(1);
      const tag = tags[0];
      expect(tag, name).toContain(`data-lazy-module="{{ 'localization-picker.js' | asset_url }}"`);
      expect(tag, name).toContain('data-lazy-on="interaction"');
      expect(tag, name).toContain(`data-list-src="{{ 'localization-list.js' | asset_url }}"`);
      for (const l of ['status', 'status-one', 'no-results', 'error', 'updating']) expect(tag, `${name} data-label-${l}`).toContain(`data-label-${l}=`);
      expect(src.match(/<script src="\{\{ 'lazy-module\.js' \| asset_url \}\}" type="module"><\/script>/g) ?? [], name).toHaveLength(1);
      expect(src, name).not.toMatch(/<script[^>]+localization-(picker|list)\.js/);
      expect(src, name).not.toMatch(/modulepreload[^>]*localization-/);
    }
    expect(FOOTER).toContain('<modal-dialog data-layer="localization" data-sheet-below="48rem"');
    for (const hook of ['data-localization-search', 'data-localization-clear', 'data-localization-empty', 'data-localization-empty-text',
      'data-localization-error', 'data-localization-error-text', 'data-localization-retry', 'role="tablist"', 'role="tab"', 'role="status"',
      'name="country_code"', 'name="language_code"', 'aria-controls="{{ id }}CountryList"', 'aria-controls="{{ id }}CountryGroup"',
      'aria-controls="{{ id }}LanguageGroup"', '{{ testid }}-localization-error', '{{ testid }}-country-search', '{{ testid }}-country-status'])
      expect(SNIPPET, hook).toContain(hook);
  });
});

// ---------- Hành vi (fixture) ----------
test.describe('ES1-T324 fixture', () => {
  test('nạp lười: chưa tương tác thì không tải; focus nút gộp tải picker + list đúng 1 lần, URL có ?v=', async ({ page }) => {
    const { requests, errors } = await mount(page);
    await page.waitForTimeout(300);
    expect(requests.filter((r) => r.startsWith('localization-'))).toEqual([]);
    await enhance(page);
    expect(requests.filter((r) => r === 'localization-picker.js')).toHaveLength(1);
    expect(requests.filter((r) => r === 'localization-list.js')).toHaveLength(1);
    await expect(toggleOf(page)).toHaveAttribute('aria-expanded', 'false');
    await expect(toggleOf(page)).toHaveAttribute('data-layer', 'localization');
    expect(errors).toEqual([]);
  });

  test('≥ 48rem popover: 2 cột, không tab, focus ô tìm; Tab ra ngoài đóng; < 48rem sheet modal 2 tab, × đóng trả focus', async ({ page }) => {
    const { errors } = await mount(page);
    await openFooter(page);
    const country = footer(page).getByTestId('footer-country-selector');
    const language = footer(page).getByTestId('footer-language-selector');
    if (isDesktop(page)) {
      expect(await isModal(page)).toBe(false);
      await expect(footer(page).locator('localization-picker')).not.toHaveAttribute('data-tabs', '');
      await expect(footer(page).getByRole('tab').first()).toBeHidden();
      await expect(country).toBeVisible();
      await expect(language).toBeVisible();
      await expect(search(page)).toBeFocused();
      expect(await axeSerious(page, '[data-testid="footer"]'), 'axe popover').toEqual([]);
      // Tab ra khỏi bảng (focusout) đóng popover
      await footer(page).getByTestId('footer-language-option').last().focus();
      await page.getByTestId('page-link').focus();
      await expect.poll(() => detailsOpen(page)).toBe(false);
      await expect(toggleOf(page)).toHaveAttribute('aria-expanded', 'false');
    } else {
      await expect.poll(() => isModal(page)).toBe(true);
      const pick = footer(page).locator('localization-picker');
      await expect(pick).toHaveAttribute('data-tabs', '');
      const [tabC, tabL] = [page.locator('#FooterLocalizationTabCountry'), page.locator('#FooterLocalizationTabLanguage')];
      await expect(tabC).toBeVisible();
      await expect(country).toHaveAttribute('role', 'tabpanel');
      await expect(country).toHaveAttribute('aria-labelledby', 'FooterLocalizationTabCountry');
      await expect(country).toBeVisible();
      await expect(language).toBeHidden();
      await tabL.click();
      await expect(tabL).toHaveAttribute('aria-selected', 'true');
      await expect(tabC).toHaveAttribute('aria-selected', 'false');
      await expect(tabC).toHaveAttribute('tabindex', '-1');
      await expect(language).toBeVisible();
      await expect(country).toBeHidden();
      await page.keyboard.press('ArrowLeft');
      await expect(tabC).toBeFocused();
      await expect(country).toBeVisible();
      await page.keyboard.press('End');
      await expect(tabL).toBeFocused();
      await page.keyboard.press('Home');
      await expect(tabC).toBeFocused();
      expect(await axeSerious(page, '[data-testid="footer-localization-panel"]'), 'axe sheet').toEqual([]);
      await panelOf(page).getByRole('button', { name: 'Close country and language' }).click();
      await expect.poll(() => isModal(page)).toBe(false);
      await expect.poll(() => detailsOpen(page)).toBe(false);
      await expect(toggleOf(page)).toBeFocused();
      await expect(toggleOf(page)).toHaveAttribute('aria-expanded', 'false');
      await expect(pick).not.toHaveAttribute('data-tabs', '');
      await expect(country).not.toHaveAttribute('role', 'tabpanel');
      await expect(language).not.toHaveAttribute('hidden', '');
    }
    expect(errors).toEqual([]);
  });

  test('< 48rem: Esc đóng sheet; đã mở trước khi nâng cấp (chạm lần đầu) thì chuyển thành sheet', async ({ page }) => {
    test.skip(isDesktop(page), 'sheet chỉ dưới 48rem');
    const { errors } = await mount(page);
    // Mở details bằng tay khi chưa có JS picker, rồi nâng cấp
    await toggleOf(page).evaluate((s) => ((s.parentElement as HTMLDetailsElement).open = true));
    await enhance(page);
    await expect.poll(() => isModal(page)).toBe(true);
    await expect(footer(page).locator('localization-picker')).toHaveAttribute('data-tabs', '');
    await page.keyboard.press('Escape');
    await expect.poll(() => isModal(page)).toBe(false);
    await expect.poll(() => detailsOpen(page)).toBe(false);
    expect(errors).toEqual([]);
  });

  test('ô tìm: lọc bỏ dấu, tên + tiền tệ, khớp đầu tên lên trước; status sau 300 ms; không kết quả; × và Clear search; Esc xoá chữ không đóng', async ({ page }) => {
    const { errors } = await mount(page);
    await openFooter(page);
    const input = search(page);
    const status = footer(page).getByTestId('footer-country-status');
    const clearX = footer(page).locator('[data-localization-search] [data-localization-clear]');
    await expect(clearX).toBeHidden();
    await input.fill('land');
    expect(await visibleCountries(page)).toEqual(['Ireland', 'Netherlands', 'New Zealand']);
    await expect(status).toHaveText('3 countries found');
    await expect(clearX).toBeVisible();
    await input.fill('cote');
    expect(await visibleCountries(page)).toEqual(['Côte d’Ivoire']);
    await expect(status).toHaveText('1 country found');
    await input.fill('ca');
    expect((await visibleCountries(page))[0], 'khớp đầu tên lên trước').toBe('Canada');
    expect(await visibleCountries(page)).toContain('Jamaica');
    await input.fill('nzd');
    expect(await visibleCountries(page)).toEqual(['New Zealand']);
    await input.fill('zzz');
    expect(await visibleCountries(page)).toEqual([]);
    const empty = footer(page).locator('[data-localization-empty]');
    await expect(empty).toBeVisible();
    await expect(empty).toContainText('No countries match “zzz”');
    await empty.getByRole('button', { name: 'Clear search' }).click();
    await expect(input).toHaveValue('');
    await expect(input).toBeFocused();
    expect(await visibleCountries(page)).toHaveLength(COUNTRIES.length);
    expect((await visibleCountries(page))[0], 'thứ tự gốc').toBe('Canada');
    await expect(empty).toBeHidden();
    await input.fill('swe');
    await page.keyboard.press('Escape');
    await expect(input).toHaveValue('');
    expect(await detailsOpen(page), 'Esc có chữ chỉ xoá chữ').toBe(true);
    if (!isDesktop(page)) expect(await isModal(page)).toBe(true);
    expect(errors).toEqual([]);
  });

  test('bàn phím: ↓ từ ô tìm vào mục đầu, ↑ ở mục đầu về ô tìm, End/Home, gõ chữ trong danh sách về ô tìm; ngôn ngữ type-ahead; Enter 1 kết quả thì chọn', async ({ page }) => {
    const { errors, posts } = await mount(page);
    await openFooter(page);
    const input = search(page);
    const opts = footer(page).getByTestId('footer-country-option');
    await input.focus();
    await page.keyboard.press('ArrowDown');
    await expect(opts.first()).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(opts.nth(1)).toBeFocused();
    await page.keyboard.press('End');
    await expect(opts.last()).toBeFocused();
    await page.keyboard.press('Home');
    await expect(opts.first()).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await expect(input).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.type('n');
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('n');
    // Enter khi nhiều kết quả: không gửi
    await page.keyboard.press('Enter');
    expect(posts).toEqual([]);
    if (!isDesktop(page)) await page.locator('#FooterLocalizationTabLanguage').click();
    const lang = footer(page).getByTestId('footer-language-option');
    await lang.first().focus();
    await page.keyboard.press('f');
    await expect(lang.nth(1)).toBeFocused();
    if (!isDesktop(page)) await page.locator('#FooterLocalizationTabCountry').click();
    await input.fill('swed');
    await input.press('Enter');
    await expect.poll(() => posts.length).toBe(1);
    expect(posts[0]).toContain('country_code=SE');
    expect(errors).toEqual([]);
  });

  test('chọn: mục hiện tại không gửi, đóng bảng; mục khác gửi form localization, đang đổi: aria-busy sau 300 ms, mục khác aria-disabled, status', async ({ page }) => {
    const { errors, posts, release } = await mount(page, { holdPost: true });
    await openFooter(page);
    const opts = footer(page).getByTestId('footer-country-option');
    await opts.and(page.locator('[value="US"]')).click();
    await expect.poll(() => detailsOpen(page)).toBe(false);
    expect(posts).toEqual([]);
    await expect(toggleOf(page)).toBeFocused();

    await toggleOf(page).click();
    await expect.poll(() => detailsOpen(page)).toBe(true);
    // POST bị giữ = điều hướng đang chờ: Playwright treo mọi locator / evaluate trên khung tới khi điều hướng xong,
    // nên trạng thái đang đổi (L9) được trang tự báo ra qua MutationObserver + exposeFunction, kèm thời điểm so với lúc gửi.
    const snaps: Array<{ t: number; form: string | null; fr: string | null; ca: string | null; status: string }> = [];
    await page.exposeFunction('__l9', (s: (typeof snaps)[number]) => snaps.push(s));
    await page.evaluate(() => {
      const f = document.querySelector('footer form')!;
      const a = (sel: string, n: string) => f.querySelector(sel)!.getAttribute(n);
      let t0 = 0;
      f.addEventListener('submit', () => (t0 = performance.now()), { capture: true });
      new MutationObserver(() => (window as unknown as { __l9: (s: unknown) => void }).__l9({
        t: performance.now() - t0, form: f.getAttribute('aria-busy'), fr: a('[value="FR"]', 'aria-busy'), ca: a('[value="CA"]', 'aria-disabled'),
        status: f.querySelector('[data-testid="footer-country-status"]')!.textContent!,
      })).observe(f, { subtree: true, attributes: true, childList: true, characterData: true });
    });
    const fr = opts.and(page.locator('[value="FR"]'));
    await fr.click({ noWaitAfter: true });
    await expect.poll(() => posts.length).toBe(1);
    expect(posts[0]).toContain('country_code=FR');
    expect(posts[0]).toContain('form_type=localization');
    await expect.poll(() => snaps.at(-1)?.fr).toBe('true');
    const busy = snaps.at(-1)!;
    expect(busy.t, 'spinner hàng chọn chỉ sau 300 ms').toBeGreaterThanOrEqual(290);
    expect(busy).toMatchObject({ form: 'true', ca: 'true', status: 'Switching to France' });
    release();
    await expect(page.getByTestId('switched')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('mất mạng: không gửi, footer-localization-error role=alert + tên nước, hàng bấm lại được; có mạng thì Try Again gửi lại', async ({ page, context }) => {
    const { errors, posts } = await mount(page);
    await openFooter(page);
    const err = footer(page).getByTestId('footer-localization-error');
    await expect(err).toBeHidden();
    await context.setOffline(true);
    const ca = footer(page).getByTestId('footer-country-option').and(page.locator('[value="CA"]'));
    await ca.click();
    await expect(err).toBeVisible();
    await expect(err).toHaveAttribute('role', 'alert');
    await expect(err).toContainText("We couldn't switch to Canada");
    expect(posts).toEqual([]);
    await expect(footer(page).locator('[aria-disabled="true"], [aria-busy="true"]')).toHaveCount(0);
    await context.setOffline(false);
    await err.getByRole('button', { name: 'Try Again' }).click();
    await expect.poll(() => posts.length).toBe(1);
    expect(posts[0]).toContain('country_code=CA');
    expect(errors).toEqual([]);
  });

  test('cấp 2 drawer (không <modal-dialog>): tab luôn bật khi có 2 danh sách, mục hiện tại đóng cấp 2 và trả focus hàng gộp', async ({ page }) => {
    const { errors } = await mount(page);
    const row = page.getByTestId('header-drawer-localization').locator('summary');
    await row.focus();
    await page.waitForFunction(() => !!customElements.get('localization-picker'));
    const pick = page.getByTestId('drawer-fixture').locator('localization-picker');
    await expect(pick).toHaveAttribute('data-tabs', '');
    await row.click();
    await expect(page.getByTestId('header-drawer-country-selector')).toHaveAttribute('role', 'tabpanel');
    await expect(page.getByTestId('header-drawer-language-selector')).toBeHidden();
    await page.getByTestId('header-drawer-country-option').and(page.locator('[aria-current="true"]')).click();
    await expect.poll(() => row.evaluate((s) => (s.parentElement as HTMLDetailsElement).open)).toBe(false);
    await expect(row).toBeFocused();
    expect(errors).toEqual([]);
  });

  test('list module lỗi tải: picker vẫn mở/đóng, ô tìm giữ hidden, chọn vẫn gửi form, 0 lỗi JS', async ({ page }) => {
    const { errors, posts } = await mount(page, { failList: true });
    await toggleOf(page).focus();
    await page.waitForFunction(() => !!customElements.get('localization-picker'));
    await toggleOf(page).click();
    await expect.poll(() => detailsOpen(page)).toBe(true);
    await expect(footer(page).locator('[data-localization-search]')).toHaveAttribute('hidden', '');
    if (!isDesktop(page)) await expect.poll(() => isModal(page)).toBe(true);
    await footer(page).getByTestId('footer-country-option').and(page.locator('[value="NO"]')).click();
    await expect.poll(() => posts.length).toBe(1);
    expect(errors.filter((e) => e.startsWith('pageerror'))).toEqual([]);
  });
});

test.describe('ES1-T324 fixture không JS', () => {
  test.use({ javaScriptEnabled: false });

  test('không JS: details mở danh sách, ô tìm và tab ẩn, bấm mục gửi form localization', async ({ page }) => {
    const { posts: seen, requests } = await mount(page, { noJs: true });
    await toggleOf(page).click();
    await expect(footer(page).getByTestId('footer-country-selector')).toBeVisible();
    await expect(footer(page).locator('[data-localization-search]')).toBeHidden();
    await expect(footer(page).getByRole('tab').first()).toBeHidden();
    await footer(page).getByTestId('footer-country-option').and(page.locator('[value="FR"]')).click();
    await expect.poll(() => seen.length).toBe(1);
    expect(seen[0]).toContain('country_code=FR');
    expect(requests.filter((r) => r.startsWith('localization-'))).toEqual([]);
  });
});

// ---------- Storefront (preview) ----------
test.describe('ES1-T324 storefront', () => {
  test('footer: chưa tương tác không tải localization-*.js; mở đúng popover (≥ 48rem) / sheet (< 48rem); axe; 0 lỗi console', async ({ page }) => {
    const errors: string[] = [];
    const isShopPay403 = watchShopPay403(page);
    page.on('console', (msg) => {
      if (msg.type() !== 'error' || isShopPay403(msg)) return;
      if (IGNORE_CONSOLE.some((r) => r.test(msg.text()) || r.test(msg.location().url))) return;
      errors.push(`${msg.text()} @ ${msg.location().url}`);
    });
    page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
    const loaded: string[] = [];
    page.on('request', (r) => /\/localization-(picker|list)\.js/.test(r.url()) && loaded.push(r.url()));
    await page.goto('/');
    await expectNotChallenged(page);
    test.skip((await toggleOf(page).count()) === 0, 'store dev bán 1 nước + 1 ngôn ngữ');
    expect(await page.locator('script[src*="localization-picker"], script[src*="localization-list"]').count(), 'không thẻ script riêng').toBe(0);
    expect(loaded, 'chưa tương tác').toEqual([]);
    await toggleOf(page).scrollIntoViewIfNeeded();
    await toggleOf(page).focus();
    await page.waitForFunction(() => !!customElements.get('localization-picker'));
    expect(loaded.every((u) => /[?&]v=/.test(u)), 'URL asset_url có ?v=').toBe(true);
    await toggleOf(page).click();
    await expect.poll(() => detailsOpen(page)).toBe(true);
    await expect(toggleOf(page)).toHaveAttribute('aria-expanded', 'true');
    expect(await isModal(page)).toBe(!isDesktop(page));
    expect(await axeSerious(page, '[data-testid="footer"]'), 'axe').toEqual([]);
    await page.keyboard.press('Escape');
    await expect.poll(() => detailsOpen(page)).toBe(false);
    expect(errors).toEqual([]);
  });
});
