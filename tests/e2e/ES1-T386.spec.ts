// KHÔNG CHẮC: chưa chạy trên preview (máy QA không có PREVIEW_URL) — chờ CI store-tests, chưa báo đạt. Gift card phát hành/hết hạn/bị tắt chưa có trên store dev (ES1-T298) → fixme theo env.
// ES1-T386 (TE-21-R2-QA1): docs/srs.md#TE-21 AC1–AC17 (0.5, thay TE-9 AC2 0.4) — page, contact, 404, password, gift card ở 4 mốc 360/768/1280/1920, mọi trạng thái.
// Test case: drafts/qa/ES1-T386/test-cases.md (TC-xx, B-xx trong tên test). Phạm vi AC: drafts/qa/ES1-T386/ac-scope.md.
// Không viết trùng: kiểm tĩnh schema/locale/hook đã ở ES1-T383, ES1-T384, ES1-T407, ES1-T408; spec này phủ ma trận 4 mốc, trạng thái rỗng/lỗi/không JS/mất mạng,
// bàn phím, LCP, axe mọi mức, AC17 hai lớp nội dung. Gộp 5 màn 1 file theo ticket (1 story TE-21, 1 ticket QA).
// Ma trận 4 mốc dùng setViewportSize, chạy 1 lần ở project desktop; project mobile (Pixel 7) chạy nhóm B-09.
// Dữ liệu (env hoặc tests/e2e/store-data.json; thiếu → skip/fixme có lý do, KHÔNG tính đạt):
//   TE383_PAGE_PATH | TE403_PAGE_PATH   page mặc định có nội dung (bảng rộng, ảnh, link trong đoạn cho TC-04)
//   TE386_EMPTY_PAGE_PATH               page nội dung rỗng (TC-02)
//   TE383_CONTACT_PATH | TE407_CONTACT_PATH  page gán template contact (mặc định /pages/contact)
//   TS_GIFT_CARD_URL, TE386_GIFT_CARD_PARTIAL_URL, TE386_GIFT_CARD_EXPIRED_URL, TE386_GIFT_CARD_DISABLED_URL
//   TE386_STORE_STATE = new | configured   (AC17, fixture TE-17-R2-QA0)
// Phần JS do BE còn mở: ES1-T474 (contact), ES1-T443 (nút mắt password), ES1-T410 (QR, copy, print gift card) → fixme gắn mã.
// Bug đã biết: test.fail gắn mã (ES1-T486); đã gỡ: ES1-T487, ES1-T488, ES1-T386-B04 (ES1-T494), ES1-T386-B05 (ES1-T495); khi bug sửa test đỏ lại → gỡ test.fail.
import { test, expect, type Browser, type BrowserContext, type Locator, type Page } from './support/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { env } from './support/store-data';
import { expectNotChallenged, gotoStore, watchStore } from './support/store-guard';
import { newStoreContext } from './support/store-noise';
import { autoDeclineConsent } from './support/consent';

const WIDTHS = [360, 768, 1280, 1920] as const;
const VIEW_H = 900;
const MISSING = '/pages/es1-t386-khong-co';
const PAGE_PATH = env('TE383_PAGE_PATH', 'TE403_PAGE_PATH');
const EMPTY_PAGE = env('TE386_EMPTY_PAGE_PATH');
const CONTACT = env('TE383_CONTACT_PATH', 'TE407_CONTACT_PATH') ?? '/pages/contact';
const GIFT = {
  active: env('TS_GIFT_CARD_URL'),
  partial: env('TE386_GIFT_CARD_PARTIAL_URL'),
  expired: env('TE386_GIFT_CARD_EXPIRED_URL'),
  disabled: env('TE386_GIFT_CARD_DISABLED_URL'),
};
const STORE_STATE = env('TE386_STORE_STATE');
const NEWSLETTER_EMAIL = 'qa+es1-t386@example.com';
const QR_NAME = 'QR code, scan to redeem gift card';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');
const noComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const desktopOnly = (name: string) => test.skip(name !== 'desktop', 'ma trận 4 mốc dùng setViewportSize, chạy 1 lần ở project desktop');

async function rect(l: Locator) {
  const b = await l.boundingBox();
  expect(b, 'phần tử không hiển thị').not.toBeNull();
  return b!;
}

const css = (l: Locator, prop: string) => l.evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), prop);

// Màu thật của 1 biến CSS trên trang (dạng rgb/rgba như computed style trả về).
const resolveColor = (page: Page, value: string) =>
  page.evaluate((v) => {
    const probe = document.createElement('span');
    probe.style.color = v;
    document.body.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  }, value);

const noHScroll = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

// Phần tử LCP sau khi tải, trước mọi thao tác. testids: testid của phần tử và các tổ tiên.
// Không dùng setTimeout trong trang (TC-18 cài page.clock): đọc lần giao buffered đầu tiên; hết 5 s phía Node thì coi như không có LCP.
async function lcp(page: Page): Promise<{ tag: string; testids: string[] }> {
  await page.waitForLoadState('load');
  const reading = page.evaluate(
    () =>
      new Promise<{ tag: string; testids: string[] }>((resolve) => {
        new PerformanceObserver((list, observer) => {
          const entries = list.getEntries();
          const last = (entries[entries.length - 1] as PerformanceEntry & { element?: Element | null }).element ?? null;
          observer.disconnect();
          const testids: string[] = [];
          for (let n: Element | null = last; n; n = n.parentElement) {
            const id = n.getAttribute('data-testid');
            if (id) testids.push(id);
          }
          resolve({ tag: last ? last.tagName.toLowerCase() : '', testids });
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      }),
  );
  const none = new Promise<{ tag: string; testids: string[] }>((resolve) => setTimeout(() => resolve({ tag: '(không có LCP)', testids: [] }), 5_000));
  return Promise.race([reading, none]);
}

// Accessibility 100 (AC6, AC16): 0 vi phạm mọi mức. Bỏ khung preview và banner consent của Shopify (không phải theme).
async function axeViolations(page: Page, include?: string) {
  await expectNotChallenged(page);
  const builder = new AxeBuilder({ page }).exclude('#preview-bar-iframe').exclude('#PBarNextFrameWrapper').exclude('#shopify-pc__banner');
  if (include) builder.include(include);
  const { violations } = await builder.analyze();
  return violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(', ')}`);
}

// Phần tử a đứng trước b trong DOM.
async function before(a: Locator, b: Locator) {
  const other = await b.elementHandle();
  return a.evaluate((el, o) => !!o && (el.compareDocumentPosition(o) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0, other);
}

// Submit form có điều hướng; hCaptcha của Shopify chặn → skip có lý do (chạy tay, ghi báo cáo), như ES1-T407.
async function submitAndLoad(page: Page, submit: () => Promise<unknown>) {
  const navigated = page
    .waitForEvent('framenavigated', { predicate: (f) => f === page.mainFrame(), timeout: 15_000 })
    .then(() => true, () => false);
  await submit();
  const moved = await navigated;
  if (moved) await page.waitForLoadState('domcontentloaded');
  const captcha = (await page.locator('iframe[src*="hcaptcha"]').count()) > 0;
  test.skip(/^\/challenge/.test(new URL(page.url()).pathname) || (!moved && captcha), 'hCaptcha chặn submit tự động: chạy tay, ghi báo cáo');
  expect(moved, 'submit không điều hướng và không có hCaptcha').toBe(true);
}

async function openAt(page: Page, path: string, width: number, height = VIEW_H) {
  await page.setViewportSize({ width, height });
  await gotoStore(page, path);
}

async function openContact(page: Page, width: number, height = VIEW_H) {
  await page.setViewportSize({ width, height });
  const res = await page.goto(CONTACT);
  test.fixme(res?.status() === 404, `ES1-T383: thiếu page ${CONTACT} gán template contact`);
  await expectNotChallenged(page);
  test.fixme((await page.getByTestId('contact-page').count()) === 0, `ES1-T383: page ${CONTACT} chưa gán template contact`);
}

// Trang password: context mới không cookie mở khoá, giữ theme preview qua query (như ES1-T384, ES1-T408).
async function openPassword(browser: Browser, width: number, js = true, height = VIEW_H): Promise<{ context: BrowserContext; page: Page }> {
  const preview = process.env.PREVIEW_URL;
  test.skip(!preview, 'thiếu PREVIEW_URL');
  const context = await newStoreContext(browser, { viewport: { width, height }, javaScriptEnabled: js });
  const page = await context.newPage();
  if (js) await autoDeclineConsent(page);
  const url = new URL(preview!);
  await page.goto(`${url.origin}/password${url.search}`);
  if (js) await expectNotChallenged(page);
  if (!new URL(page.url()).pathname.startsWith('/password')) {
    await context.close();
    test.skip(true, 'store dev không bật mật khẩu');
  }
  return { context, page };
}

async function openDetails(page: Page) {
  const details = page.getByTestId('password-details');
  if ((await details.getAttribute('open')) === null) await details.locator('summary').click();
  await expect(page.getByTestId('password-input')).toBeVisible();
}

async function submitWrongPassword(page: Page) {
  await openDetails(page);
  await page.getByTestId('password-input').fill('es1-t386-sai');
  await Promise.all([page.waitForEvent('framenavigated', { predicate: (f) => f === page.mainFrame() }), page.getByTestId('password-submit').click()]);
  await page.waitForLoadState('domcontentloaded');
}

const PLACEHOLDERS = ['page-empty-hint', 'contact-aside-placeholder', 'not-found-categories-placeholder', 'faq-item-placeholder', 'featured-collection-placeholder'];
async function expectNoEditorPlaceholders(page: Page) {
  for (const id of PLACEHOLDERS) await expect(page.getByTestId(id), `B-07 ${id} chỉ có trong editor`).toHaveCount(0);
}

// ---------------------------------------------------------------- tĩnh
test.describe('ES1-T386 tĩnh', () => {
  test.beforeEach(({}, ti) => { desktopOnly(ti.project.name); });

  test('TC-03 AC1 câu gợi ý page rỗng chỉ trong design_mode, nội dung bọc .rte', () => {
    for (const f of ['templates/page.liquid', 'templates/page.contact.liquid']) {
      const src = read(f);
      expect(src, f).toMatch(/if page\.content != blank -%\}\s*<div class="rte[^"]*" data-testid="page-content"/);
      expect(src, f).toMatch(/elsif request\.design_mode -%\}\s*<p class="page-reading__hint[^"]*" data-testid="page-empty-hint"/);
    }
  });

  test('TC-13 AC5 lỗi chung: nhánh form.errors contains form in .alert role=alert, giữ dữ liệu đã nhập', () => {
    const src = read('blocks/contact-form.liquid');
    expect(src).toMatch(/if form\.errors contains 'form'[\s\S]*?assign form_error = true/);
    expect(src).toMatch(/if form_error -%\}\s*<div class="alert contact-form__alert" role="alert" data-testid="contact-form-error">[\s\S]*?'contact\.error_form_title' \| t[\s\S]*?'contact\.error_form_text' \| t/);
    expect(src).toMatch(/value="\{\{ name_value \}\}"/);
    expect(src).toMatch(/value="\{\{ email_value \}\}"/);
    expect(src).toContain('{{ form.body }}</textarea>');
  });

  test('TC-43 AC14 nguồn gift card: QR, Wallet, Copy chỉ khi còn hiệu lực; Contact Us chỉ khi hết hạn/bị tắt', () => {
    const src = read('templates/gift_card.liquid');
    expect(src).toMatch(/if gift_card\.expired or gift_card\.enabled == false\s*\n\s*assign inactive = true/);
    expect(src).toMatch(/unless gift_card\.expired or gift_card\.enabled == false -%\}\s*<div class="gift-card__pay">[\s\S]*?data-gift-card-qr/);
    expect(src).toMatch(/unless inactive -%\}\s*<button[\s\S]*?data-gift-card-copy/);
    const actions = src.slice(src.indexOf('<div class="gift-card__actions">'));
    const at = (s: string) => actions.indexOf(s);
    const order = [at('{%- if inactive -%}'), at('data-testid="gift-card-contact"'), at('{%- else -%}'), at('data-testid="gift-card-wallet"'), at('data-testid="gift-card-start"')];
    order.forEach((i) => expect(i).toBeGreaterThan(-1));
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    expect(src).toMatch(/if gift_card\.pass_url -%\}\s*<a href="\{\{ gift_card\.pass_url \}\}"/);
    // AC14: câu bị tắt và câu hết hạn tách riêng, hết hạn kèm ngày
    expect(src).toMatch(/if gift_card\.enabled == false -%\}[\s\S]*?'gift_card\.disabled' \| t[\s\S]*?else -%\}[\s\S]*?'gift_card\.expired' \| t[\s\S]*?'gift_card\.expired_text' \| t: date:/);
  });

  test('TC-50 AC17 theme mới cài: không figma-*, setting chữ/ảnh/menu default trống, contact không câu hỏi mẫu, 404 không collection', () => {
    for (const f of ['templates/page.liquid', 'templates/page.contact.liquid', 'templates/404.liquid', 'templates/password.liquid', 'templates/gift_card.liquid', 'blocks/not-found.liquid', 'blocks/password-hero.liquid', 'blocks/contact-form.liquid', 'blocks/contact-aside.liquid']) {
      expect(read(f), f).not.toMatch(/figma-|efx-/);
    }
    const settings = (f: string) => {
      const s = JSON.parse(read(f).split('{% schema %}')[1].split('{% endschema %}')[0]) as { settings: { id: string; default?: unknown }[] };
      return Object.fromEntries(s.settings.map((x) => [x.id, x]));
    };
    const nf = settings('blocks/not-found.liquid');
    for (const id of ['heading', 'text', 'category_menu']) expect(nf[id].default, `not-found.${id}`).toBeUndefined();
    const ph = settings('blocks/password-hero.liquid');
    for (const id of ['eyebrow', 'heading', 'image']) expect(ph[id].default, `password-hero.${id}`).toBeUndefined();
    expect(settings('blocks/contact-form.liquid').heading.default).toBeUndefined();
    const contact = read('templates/page.contact.liquid');
    expect(contact.match(/block 'faq-item', id: 'contact-faq-\d'[^%]*%\}/g) ?? []).toHaveLength(5);
    expect(contact).not.toMatch(/block 'faq-item'[^%]*(question|answer):/);
    const nfTemplate = read('templates/404.liquid');
    expect(nfTemplate).not.toMatch(/block 'featured-collection'[^%]*\bcollection(_\d)?:/);
    // locale fallback có sẵn
    const t = JSON.parse(read('locales/en.default.json'));
    expect(t['404'].heading).toBe('Page Not Found');
    expect(t.password.title).toBeTruthy();
    expect(t.blocks.contact_form.heading).toBe('Send Us A Message');
  });

  // featured-collection dùng chung trang chủ (range 4–12); bảng setting TE-21 ghi 4–8 cho 404: kiểm phủ được 4–8, default 4.
  test('B-02 featured-collection 404: Products to show phủ 4–8, default 4; danh mục tối đa 6', () => {
    const s = JSON.parse(read('blocks/featured-collection.liquid').split('{% schema %}')[1].split('{% endschema %}')[0]) as { settings: { id: string; type: string; min?: number; max?: number; default?: number }[] };
    const range = s.settings.find((x) => x.id === 'products_to_show');
    expect(range, 'thiếu setting products_to_show').toBeTruthy();
    expect(range!.min).toBeLessThanOrEqual(4);
    expect(range!.max).toBeGreaterThanOrEqual(8);
    expect(range!.default).toBe(4);
    expect(read('blocks/not-found.liquid')).toContain('limit: 6');
  });
});

// ---------------------------------------------------------------- kiểm mockup gift card (dữ liệu chưa có, ES1-T298)
// Fixture dựng theo class của templates/gift_card.liquid + assets/base.css thật. Không thay cho TC-38..TC-46 trên store.
const TOKENS = `:root{--font-size-xs:.8125rem;--font-size-sm:.875rem;--font-size-base:1rem;--font-size-lg:1.125rem;--font-size-h3:1.5rem;--font-size-h2:2rem;--font-size-h1:3rem;--font-size-display:clamp(3rem,1rem + 7vw,6.25rem);--line-height-body:1.5;--line-height-heading:1.1;--space-1:4px;--space-2:8px;--space-3:12px;--space-4:16px;--space-5:24px;--space-6:32px;--space-7:48px;--space-8:120px;--header-height:80px;--page-width:1456px;--page-margin:20px;--radius-input:8px;--radius-button:8px;--radius-card:12px;--radius-pill:999px;--figma-radius-4:4px;--figma-radius-16:16px;--color-background:#fff;--color-foreground:#1a1a1a;--color-muted:#5c5c5c;--color-muted-light:#757575;--color-border:#e5e5e5;--color-background-alt:#f5f5f5;--color-background-alt-foreground:#1a1a1a;--color-background-dark:#1a1a1a;--color-background-dark-foreground:#fff;--color-muted-on-dark:#9e9e9e;--color-accent:#c8400e;--color-accent-foreground:#fff;--color-sale:#c62828;--color-badge-new:#467a48;--font-primary--family:sans-serif;--font-heading--family:serif;--font-heading--weight:700;--font-heading--weight-display:800;--motion-fast:150ms;--ease-out:ease-out}`;

const giftFixture = (inactive: boolean) => `
<header class="gift-card__bar"><a class="gift-card__logo" href="/" data-testid="gift-card-logo"><span class="gift-card__logo-text">Efitco</span></a></header>
<main class="gift-card">
  <div class="gift-card__intro"><p class="gift-card__eyebrow">Gift card</p><h1 class="gift-card__title">Your Efitco Gift Card</h1></div>
  <div class="gift-card__layout">
    <div class="gift-card__card${inactive ? ' gift-card__card--inactive' : ''}" data-testid="gift-card-card">
      <div class="gift-card__card-top"><span class="gift-card__card-name">Efitco</span><span class="gift-card__pill">${inactive ? 'Expired' : 'Gift card'}</span></div>
      <p class="gift-card__balance" data-testid="gift-card-balance"><span class="gift-card__balance-label">Balance</span>${inactive ? '<s class="gift-card__amount">$50.00</s>' : '<span class="gift-card__amount">$25.00</span><span class="gift-card__initial">of $50.00 initial value</span>'}</p>
    </div>
    <div class="gift-card__panel">
      ${inactive ? '<div class="alert" role="alert" data-testid="gift-card-alert"><span class="alert__icon"><svg width="16" height="16" aria-hidden="true"><circle cx="8" cy="8" r="7"/></svg></span><div class="alert__body"><p class="alert__title">This gift card has expired</p></div></div>' : ''}
      <div class="gift-card__code-group"><p class="gift-card__code-label">Gift card code</p><p class="gift-card__code" data-testid="gift-card-code">7H3K 9QXF 2M8P 4LDW</p>${inactive ? '' : '<button type="button" class="button button--secondary gift-card__copy" data-testid="gift-card-copy">Copy Code</button>'}</div>
      ${inactive ? '' : '<div class="gift-card__pay"><div class="gift-card__qr" data-testid="gift-card-qr"><p class="gift-card__qr-fallback" data-testid="gift-card-qr-fallback">Enter the code at checkout</p></div><div class="gift-card__pay-text"><p class="gift-card__pay-title">Pay in store</p></div></div>'}
      <div class="gift-card__actions">${inactive ? '<a class="button button--secondary" href="/pages/contact" data-testid="gift-card-contact">Contact Us</a>' : '<a class="button gift-card__start" href="/" data-testid="gift-card-start">Start Shopping</a><button type="button" class="button button--secondary gift-card__print" data-testid="gift-card-print">Print Gift Card</button>'}</div>
    </div>
  </div>
</main>`;

async function giftCardFixture(page: Page, inactive: boolean) {
  await page.setContent(`<!doctype html><html lang="en"><head><title>gift card</title><style>${TOKENS}</style><style>${read('assets/critical.css')}</style><style>${noComments(read('assets/base.css'))}</style><style>${noComments(read('assets/aux.css'))}</style></head><body class="template-gift-card">${giftFixture(inactive)}</body></html>`);
}

test.describe('ES1-T386 kiểm mockup gift card', () => {
  test.beforeEach(({}, ti) => { desktopOnly(ti.project.name); });

  for (const width of WIDTHS) {
    test(`TC-43 AC14, TC-46 AC13/AC15 mockup @${width}: thẻ inactive xám + gạch số dư; QR 144; logo link ≥ 44; bố cục 1/2 cột`, async ({ page }) => {
      await page.setViewportSize({ width, height: VIEW_H });
      await giftCardFixture(page, false);
      const qr = await rect(page.getByTestId('gift-card-qr'));
      expect(Math.abs(qr.width - 144), 'QR rộng 144').toBeLessThanOrEqual(1);
      expect(Math.abs(qr.height - 144), 'QR cao 144').toBeLessThanOrEqual(1);
      expect((await rect(page.getByTestId('gift-card-logo'))).height).toBeGreaterThanOrEqual(44);
      const card = await rect(page.getByTestId('gift-card-card'));
      const code = await rect(page.getByTestId('gift-card-code'));
      if (width >= 1024) expect(code.x, 'từ 64rem panel bên phải thẻ').toBeGreaterThanOrEqual(card.x + card.width - 1);
      else expect(code.y, 'dưới 64rem panel dưới thẻ').toBeGreaterThanOrEqual(card.y + card.height - 1);
      expect(await noHScroll(page)).toBe(true);

      await giftCardFixture(page, true);
      const inactiveCard = page.getByTestId('gift-card-card');
      expect(await css(inactiveCard, 'filter')).toBe('grayscale(1)');
      expect(await css(page.getByTestId('gift-card-balance').locator('s'), 'text-decoration-line')).toContain('line-through');
      await expect(page.getByTestId('gift-card-alert').locator('svg')).toHaveCount(1);
      expect(await noHScroll(page)).toBe(true);
    });
  }

  test('TC-45 AC15 mockup bản in: ẩn thanh trên, nút; thẻ nền trắng chữ đen; giữ mã và QR', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: VIEW_H });
    await giftCardFixture(page, false);
    await page.emulateMedia({ media: 'print' });
    await expect(page.getByTestId('gift-card-logo')).toBeHidden();
    await expect(page.getByTestId('gift-card-copy')).toBeHidden();
    await expect(page.getByTestId('gift-card-start')).toBeHidden();
    await expect(page.getByTestId('gift-card-print')).toBeHidden();
    const card = page.getByTestId('gift-card-card');
    expect(await css(card, 'background-color')).toBe(await resolveColor(page, 'var(--color-background)'));
    expect(await css(card, 'color')).toBe(await resolveColor(page, 'var(--color-foreground)'));
    await expect(page.getByTestId('gift-card-code')).toBeVisible();
    await expect(page.getByTestId('gift-card-qr')).toBeVisible();
  });
});

// ---------------------------------------------------------------- page mặc định (AC1, AC2, AC6)
test.describe('ES1-T386 page', () => {
  test.beforeEach(({}, ti) => { desktopOnly(ti.project.name); });

  for (const width of WIDTHS) {
    test(`TC-01 AC1, TC-15 AC6 page mặc định @${width}: breadcrumb, 1 h1, .rte, cột 720 giữa, đoạn 16/1.7 ≤ 65ch, axe 0`, async ({ page }) => {
      test.skip(!PAGE_PATH, 'thiếu TE383_PAGE_PATH/TE403_PAGE_PATH: page mặc định có nội dung');
      await openAt(page, PAGE_PATH!, width);
      const h1 = page.locator('h1');
      await expect(h1).toHaveCount(1);
      const title = ((await page.getByTestId('page-title-heading').textContent()) ?? '').trim();
      expect(title).not.toBe('');
      await expect(page.getByTestId('breadcrumb')).toContainText('Home');
      await expect(page.getByTestId('breadcrumb-current')).toHaveText(title);
      const rte = page.getByTestId('page-content');
      await expect(rte).toHaveClass(/\brte\b/);

      const col = await rect(page.getByTestId('page'));
      const vw = await page.evaluate(() => document.documentElement.clientWidth);
      expect(Math.abs(col.x + col.width / 2 - vw / 2), 'cột căn giữa').toBeLessThanOrEqual(1);
      if (width >= 768) expect(Math.abs(col.width - 720), 'cột đọc 720').toBeLessThanOrEqual(1);
      else expect(col.width).toBeLessThan(vw);

      const p = rte.locator('p').first();
      if (await p.count()) {
        expect(await css(p, 'font-size')).toBe('16px');
        expect(parseFloat(await css(p, 'line-height'))).toBeCloseTo(27.2, 0);
        const within65ch = await p.evaluate((el) => {
          const probe = document.createElement('span');
          probe.style.cssText = 'display:inline-block;inline-size:65ch;block-size:0';
          el.append(probe);
          const limit = probe.getBoundingClientRect().width;
          probe.remove();
          return el.getBoundingClientRect().width <= limit + 1;
        });
        expect(within65ch, 'đoạn rộng ≤ 65ch').toBe(true);
      }
      await expectNoEditorPlaceholders(page);
      expect(await noHScroll(page)).toBe(true);
      expect(await axeViolations(page, 'main')).toEqual([]);
    });
  }

  test('TC-02 AC1 page rỗng: chỉ h1, không khung .rte rỗng, không câu gợi ý trên storefront (360, 1280)', async ({ page }) => {
    test.skip(!EMPTY_PAGE, 'thiếu TE386_EMPTY_PAGE_PATH: page có nội dung rỗng');
    for (const width of [360, 1280]) {
      await openAt(page, EMPTY_PAGE!, width);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.getByTestId('page-content')).toHaveCount(0);
      await expect(page.locator('main .rte')).toHaveCount(0);
      await expect(page.getByTestId('page-empty-hint')).toHaveCount(0);
    }
  });

  for (const [width, height, label] of [[360, 800, '360'], [640, 400, '1280 phóng 200%']] as const) {
    test(`TC-04 AC2 nội dung page @${label}: không cuộn ngang, bảng cuộn trong khung, link gạch chân, ảnh lazy`, async ({ page }) => {
      test.skip(!PAGE_PATH, 'thiếu TE383_PAGE_PATH/TE403_PAGE_PATH');
      await openAt(page, PAGE_PATH!, width, height);
      const rte = page.getByTestId('page-content');
      expect(await noHScroll(page), 'trang không cuộn ngang').toBe(true);
      const table = rte.locator('table').first();
      if (await table.count()) {
        const scroller = await table.evaluate((el) => {
          for (let n: Element | null = el; n && !n.matches('[data-testid="page-content"]'); n = n.parentElement) {
            const o = getComputedStyle(n).overflowX;
            if (o === 'auto' || o === 'scroll') return { ok: true, wider: n.scrollWidth > n.clientWidth };
          }
          return { ok: false, wider: false };
        });
        expect(scroller.ok, 'bảng có khung cuộn ngang riêng').toBe(true);
      } else test.info().annotations.push({ type: 'thiếu dữ liệu', description: 'page không có bảng: phần bảng của AC2 chưa kiểm' });
      for (const img of await rte.locator('img').all()) await expect(img).toHaveAttribute('loading', 'lazy');
      const link = rte.locator('p a').first();
      if (await link.count()) expect(await css(link, 'text-decoration-line')).toContain('underline');
      else test.info().annotations.push({ type: 'thiếu dữ liệu', description: 'page không có link trong đoạn' });
    });
  }
});

// ---------------------------------------------------------------- contact (AC3–AC6)
test.describe('ES1-T386 contact', () => {
  test.beforeEach(({}, ti) => { desktopOnly(ti.project.name); });

  for (const width of WIDTHS) {
    test(`TC-05 AC3, TC-06 AC3, TC-15 AC6 contact @${width}: thứ tự DOM, 3 trường, bố cục, vùng chạm, axe 0`, async ({ page }) => {
      await openContact(page, width);
      // TC-05
      await expect(page.locator('h1')).toHaveCount(1);
      const chain = ['breadcrumb', 'page-title-heading', 'page-content', 'contact-form', 'contact-aside'];
      const present: Locator[] = [];
      for (const id of chain) if (await page.getByTestId(id).count()) present.push(page.getByTestId(id).first());
      for (let i = 1; i < present.length; i++) expect(await before(present[i - 1], present[i]), `thứ tự DOM ${i}`).toBe(true);
      const form = page.getByTestId('contact-form');
      await expect(form.locator('input:not([type="hidden"]), textarea, select')).toHaveCount(3);
      await expect(form.locator('[name*="phone" i], [name*="subject" i]')).toHaveCount(0);
      await expect(page.getByTestId('contact-form-heading')).not.toHaveText('');
      await expect(form.getByText('* Required fields')).toBeVisible();
      await expect(page.locator('#ContactBodyHint')).toContainText('order number');
      await expect(page.getByTestId('contact-submit')).toHaveText('Send Message');
      // TC-15: label, autocomplete, type, vùng chạm
      for (const id of ['ContactName', 'ContactEmail', 'ContactBody']) await expect(page.locator(`label[for="${id}"]`)).toHaveCount(1);
      await expect(page.locator('#ContactName')).toHaveAttribute('autocomplete', 'name');
      await expect(page.locator('#ContactEmail')).toHaveAttribute('autocomplete', 'email');
      await expect(page.locator('#ContactEmail')).toHaveAttribute('type', 'email');
      const min = width >= 1024 ? 52 : 48;
      for (const sel of ['#ContactName', '#ContactEmail']) expect((await rect(page.locator(sel))).height, sel).toBeGreaterThanOrEqual(min - 0.5);
      expect((await rect(page.getByTestId('contact-submit'))).height).toBeGreaterThanOrEqual(min - 0.5);
      // TC-06: bố cục
      const name = await rect(page.locator('#ContactName'));
      const email = await rect(page.locator('#ContactEmail'));
      const body = await rect(page.locator('#ContactBody'));
      if (width < 768) expect(email.y, '360: Email dưới Name').toBeGreaterThanOrEqual(name.y + name.height - 1);
      else expect(Math.abs(email.y - name.y), 'từ 768: Name, Email cùng hàng').toBeLessThanOrEqual(1);
      expect(body.y).toBeGreaterThan(name.y);
      const aside = page.getByTestId('contact-aside');
      if (await aside.count()) {
        const asideBox = await rect(aside);
        const block = await rect(page.getByTestId('contact-form-block'));
        if (width < 1280) {
          expect(asideBox.y, '1 cột: aside sau form').toBeGreaterThanOrEqual(block.y + block.height - 1);
        } else {
          const grid = await rect(page.getByTestId('contact-page'));
          const col = (grid.width - 11 * 24) / 12;
          expect(Math.abs(asideBox.x - (grid.x + 8 * (col + 24))), 'aside bắt đầu cột 9').toBeLessThanOrEqual(2);
          expect(Math.abs(asideBox.width - (4 * col + 3 * 24)), 'aside rộng 4 cột').toBeLessThanOrEqual(2);
          expect(Math.abs(block.width - (7 * col + 6 * 24)), 'form rộng 7 cột').toBeLessThanOrEqual(2);
        }
        const summary = aside.locator('summary').first();
        expect((await rect(summary)).height, 'summary ≥ 56').toBeGreaterThanOrEqual(56);
      } else test.info().annotations.push({ type: 'trạng thái', description: 'không aside (faq-item chưa có câu hỏi: theme mới cài, AC17)' });
      await expectNoEditorPlaceholders(page);
      expect(await noHScroll(page)).toBe(true);
      expect(await axeViolations(page, 'main')).toEqual([]);
    });
  }

  for (const width of [1280, 1920]) {
    test(`TC-07 AC3 aside dính cách đỉnh 104 khi cuộn @${width}`, async ({ page }) => {
      await openContact(page, width, 700);
      const aside = page.getByTestId('contact-aside');
      test.skip((await aside.count()) === 0, 'store chưa cấu hình câu FAQ: không aside');
      expect(await css(aside, 'position')).toBe('sticky');
      const headerSticky = (await page.locator('[data-testid="header"][data-sticky]').count()) > 0;
      const expected = headerSticky ? 104 : 24;
      if (!headerSticky) test.info().annotations.push({ type: 'cấu hình', description: 'header không dính: kỳ vọng 24 thay 104' });
      expect(parseFloat(await css(aside, 'top'))).toBeCloseTo(expected, 0);
      const state = await aside.evaluate((el) => {
        const grid = el.parentElement!;
        const top = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo(0, top - 50);
        return { asideH: el.getBoundingClientRect().height, gridBottom: grid.getBoundingClientRect().bottom };
      });
      if (state.gridBottom > expected + state.asideH + 1) {
        await expect.poll(async () => Math.round((await aside.boundingBox())!.y)).toBeGreaterThanOrEqual(expected - 2);
        expect(Math.abs((await rect(aside)).y - expected)).toBeLessThanOrEqual(2);
      } else test.info().annotations.push({ type: 'thiếu dữ liệu', description: 'aside cao hơn phần còn lại của lưới: không có đoạn dính để đo' });
    });
  }

  test('TC-08 AC3 aside: câu đầu mở sẵn, Enter trên summary mở câu 2 và câu 1 vẫn mở; tên aside; link chính sách /policies/', async ({ page }) => {
    await openContact(page, 1280);
    const aside = page.getByTestId('contact-aside');
    test.skip((await aside.count()) === 0, 'store chưa cấu hình câu FAQ: không aside');
    await expect(aside).toHaveAttribute('aria-labelledby', 'ContactAsideHeading');
    const heading = ((await page.getByTestId('contact-aside-heading').textContent()) ?? '').trim();
    await expect(page.getByRole('complementary', { name: heading })).toHaveCount(1);
    const items = aside.getByTestId('faq-item');
    await expect(items.first()).toHaveAttribute('open', '');
    if ((await items.count()) > 1) {
      await items.nth(1).locator('summary').focus();
      await page.keyboard.press('Enter');
      await expect(items.nth(1)).toHaveAttribute('open', '');
      await expect(items.first()).toHaveAttribute('open', '');
    }
    for (const link of await aside.getByTestId('contact-aside-policy').all()) await expect(link).toHaveAttribute('href', /\/policies\//);
  });

  test('TC-09 AC3 câu quyền riêng tư: có thì link privacy policy', async ({ page }) => {
    await openContact(page, 1280);
    const note = page.getByTestId('contact-privacy');
    if (await note.count()) await expect(note.locator('a')).toHaveAttribute('href', /\/policies\/privacy-policy/);
    else test.info().annotations.push({ type: 'trạng thái', description: 'không câu privacy: shop chưa có privacy policy hoặc setting tắt' });
  });

  // Shopify chỉ trả lỗi cho trường nó kiểm phía server (chắc chắn có email); trường nào Shopify trả lỗi thì kiểm đủ trạng thái lỗi của trường đó.
  test('TC-10 AC4 không JS (POST thường): gửi rỗng → tóm tắt "Check {n} field(s)" có link từng trường lỗi, ô lỗi aria-invalid + câu + icon + viền màu lỗi, ×4 mốc', async ({ page }) => {
    await openContact(page, 360);
    const form = page.getByTestId('contact-form');
    await form.evaluate((f: HTMLFormElement) => (f.noValidate = true));
    await submitAndLoad(page, () => page.getByTestId('contact-submit').click());
    await expectNotChallenged(page);
    const summary = page.getByTestId('contact-errors');
    await expect(summary).toBeVisible();
    await expect(summary).toHaveAttribute('role', 'alert');
    const links = summary.getByRole('link');
    const hrefs = await links.evaluateAll((els) => els.filter((el) => (el as HTMLElement).offsetParent !== null).map((el) => el.getAttribute('href')));
    expect(hrefs, 'Shopify luôn trả lỗi email trống').toContain('#ContactEmail');
    await expect(summary).toContainText(hrefs.length === 1 ? 'Check 1 field' : `Check ${hrefs.length} fields`);
    test.info().annotations.push({ type: 'server', description: `Shopify trả lỗi cho: ${hrefs.join(', ')}` });
    const sale = await resolveColor(page, 'var(--color-sale)');
    const fields = ([
      ['ContactName', 'contact-name-error', 'Enter your name.'],
      ['ContactEmail', 'contact-email-error', 'Enter an email like name@example.com.'],
      ['ContactBody', 'contact-body-error', 'Enter a message.'],
    ] as [string, string, string][]).filter(([id]) => hrefs.includes(`#${id}`));
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: VIEW_H });
      for (const [id, testid, text] of fields) {
        const input = page.locator(`#${id}`);
        await expect(input, `${id} @${width}`).toHaveAttribute('aria-invalid', 'true');
        await expect(input).toHaveAttribute('aria-describedby', new RegExp(`${id}Error`));
        const error = page.getByTestId(testid);
        await expect(error).toBeVisible();
        await expect(error).toHaveText(text);
        await expect(error.locator('svg')).toHaveCount(1);
        expect(await css(input, 'border-top-color'), `${id} viền màu lỗi`).toBe(sale);
        expect(await css(input, 'box-shadow'), `${id} viền 2px (1px + inset 1px)`).toMatch(/inset/);
      }
      expect(await noHScroll(page), `@${width}`).toBe(true);
    }
    await summary.locator('a[href="#ContactEmail"]').click();
    await expect(page).toHaveURL(/#ContactEmail$/);
    await expect(page.locator('#ContactEmail')).toBeInViewport();
  });

  test.fixme('TC-11 AC4 có JS: rời trường sai hiện lỗi ngay; gửi có lỗi thì tóm tắt nhận focus — chờ ES1-T474', async ({ page }) => {
    await openContact(page, 1280);
    await page.locator('#ContactEmail').fill('abc');
    await page.keyboard.press('Tab');
    await expect(page.locator('#ContactEmail')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByTestId('contact-email-error')).toBeVisible();
    await page.getByTestId('contact-submit').click();
    await expect(page.getByTestId('contact-errors')).toBeFocused();
    await expect(page.getByTestId('contact-errors')).toContainText(/Check [23] fields/);
  });

  test('TC-12 AC5 gửi hợp lệ: hộp role=status thay form, Continue Shopping secondary', async ({ page }) => {
    await openContact(page, 1280);
    await page.locator('#ContactName').fill('QA ES1-T386');
    await page.locator('#ContactEmail').fill('qa+es1-t386@example.com');
    await page.locator('#ContactBody').fill('ES1-T386 TC-12 kiểm hộp thành công (QA tự động, bỏ qua).');
    await submitAndLoad(page, () => page.getByTestId('contact-submit').click());
    await expectNotChallenged(page);
    const status = page.getByTestId('contact-status');
    await expect(status).toHaveAttribute('role', 'status');
    await expect(status).toContainText('Thanks for contacting us');
    await expect(page.locator('#ContactName, #ContactEmail, #ContactBody')).toHaveCount(0);
    const cont = page.getByTestId('contact-continue');
    await expect(cont).toHaveText('Continue Shopping');
    await expect(cont).toHaveClass(/button--secondary/);
  });

  test.fixme('TC-12 AC5 hộp thành công nhận focus sau khi tải lại — chờ ES1-T474 mục 4', async ({ page }) => {
    await openContact(page, 1280);
    await expect(page.getByTestId('contact-status')).toBeFocused();
  });

  test.fixme('TC-14 AC5 đang gửi: nút aria-busy giữ bề rộng, trường readonly, live "Sending your message…" — chờ ES1-T474', async ({ page }) => {
    await openContact(page, 1280);
    await page.route(/\/contact(\?|$)/, () => { /* treo POST để giữ trạng thái đang gửi */ });
    await page.locator('#ContactName').fill('QA');
    await page.locator('#ContactEmail').fill('qa+es1-t386@example.com');
    await page.locator('#ContactBody').fill('ES1-T386 TC-14');
    const submit = page.getByTestId('contact-submit');
    const w = (await rect(submit)).width;
    await submit.click();
    await expect(submit).toHaveAttribute('aria-busy', 'true');
    expect(Math.abs((await rect(submit)).width - w)).toBeLessThanOrEqual(1);
    for (const id of ['ContactName', 'ContactEmail', 'ContactBody']) await expect(page.locator(`#${id}`)).toHaveAttribute('readonly', '');
    await expect(page.getByTestId('contact-live')).toHaveText('Sending your message…');
  });

  test('TC-16 AC6 không JS: page và contact đủ nội dung, form POST /contact, summary mở được (360, 1280)', async ({ browser }) => {
    const context = await newStoreContext(browser, { javaScriptEnabled: false, storageState: 'tests/setup/state.json' });
    try {
      const page = await context.newPage();
      for (const width of [360, 1280]) {
        await page.setViewportSize({ width, height: VIEW_H });
        if (PAGE_PATH) {
          await page.goto(PAGE_PATH, { waitUntil: 'domcontentloaded' });
          await expect(page.locator('h1')).toHaveCount(1);
          await expect(page.getByTestId('page-content')).toBeVisible();
          expect(await noHScroll(page)).toBe(true);
        }
        const res = await page.goto(CONTACT, { waitUntil: 'domcontentloaded' });
        test.fixme(res?.status() === 404 || (await page.getByTestId('contact-page').count()) === 0, `ES1-T383: thiếu page ${CONTACT} gán template contact`);
        const form = page.getByTestId('contact-form');
        await expect(form).toHaveAttribute('method', /post/i);
        await expect(form).toHaveAttribute('action', /\/contact/);
        await expect(page.getByTestId('contact-submit')).toBeVisible();
        const second = page.getByTestId('contact-aside').getByTestId('faq-item').nth(1);
        if (await second.count()) {
          await second.locator('summary').click();
          await expect(second).toHaveAttribute('open', '');
        }
        expect(await noHScroll(page)).toBe(true);
      }
    } finally {
      await context.close();
    }
  });

  test('B-04 bàn phím contact 1280: Name → Email → Message → (privacy) → Send Message, không nhảy sang aside', async ({ page }) => {
    await openContact(page, 1280);
    await page.locator('#ContactName').focus();
    const seen: string[] = [];
    for (let i = 0; i < 6; i++) {
      seen.push(await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        return el?.id || el?.getAttribute('data-testid') || (el?.closest('[data-testid]')?.getAttribute('data-testid') ?? '') + ':' + (el?.tagName ?? '');
      }));
      if (seen.at(-1) === 'contact-submit') break;
      await page.keyboard.press('Tab');
    }
    expect(seen.slice(0, 3)).toEqual(['ContactName', 'ContactEmail', 'ContactBody']);
    expect(seen.at(-1)).toBe('contact-submit');
    expect(seen.filter((s) => s.startsWith('contact-aside') || s.startsWith('faq-item'))).toEqual([]);
  });

  test('B-06 contact 640 × 400 (1280 phóng 200%): không cuộn ngang, form 1 cột', async ({ page }) => {
    await openContact(page, 640, 400);
    expect(await noHScroll(page)).toBe(true);
    const aside = page.getByTestId('contact-aside');
    if (await aside.count()) {
      const block = await rect(page.getByTestId('contact-form-block'));
      expect((await rect(aside)).y).toBeGreaterThanOrEqual(block.y + block.height - 1);
    }
  });
});

// ---------------------------------------------------------------- 404 (AC7, AC8, AC16)
test.describe('ES1-T386 404', () => {
  test.beforeEach(({}, ti) => { desktopOnly(ti.project.name); });

  // TC-24 tách riêng để bug LCP không che các kiểm khác của 404. Căn cứ: srs TE-21 AC8, AC16 "LCP: 404 là h1"; 404.md §8 "h1 … ở mọi mốc".
  // ES1-T386-B04 (sửa ở ES1-T494): noise header/announcement vẽ bằng border-image fill thay background-image → không còn là ứng viên LCP.
  for (const width of WIDTHS) {
    test(`TC-24 AC8/AC16 404 @${width}: LCP là h1`, async ({ page }) => {
      await page.setViewportSize({ width, height: VIEW_H });
      await page.goto(MISSING);
      await expectNotChallenged(page);
      const paint = await lcp(page);
      expect(paint.testids, `LCP <${paint.tag}> phải là h1`).toContain('not-found-heading');
    });
  }

  for (const width of WIDTHS) {
    test(`TC-18 AC7, TC-22 AC8, TC-23 AC8, TC-47 AC16 404 @${width}: khối chính, không popup, danh mục, sản phẩm, axe 0`, async ({ page }) => {
      await page.setViewportSize({ width, height: VIEW_H });
      await page.clock.install();
      const res = await page.goto(MISSING);
      await expectNotChallenged(page);
      // TC-18
      expect(res?.status()).toBe(404);
      await expect(page.getByTestId('breadcrumb')).toHaveCount(0);
      const block = page.getByTestId('not-found');
      await expect(block.getByText('Error 404', { exact: true })).toBeVisible();
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.getByTestId('not-found-heading')).not.toHaveText('');
      await expect(page.getByTestId('not-found-heading').locator('xpath=following-sibling::p[1]')).not.toHaveText('');
      const search = page.getByTestId('not-found-search');
      await expect(search).toHaveAttribute('role', 'search');
      await expect(search).toHaveAttribute('method', /get/i);
      await expect(search).toHaveAttribute('action', /\/search$/);
      await expect(page.getByRole('search', { name: 'Search the store' })).toHaveCount(1);
      const input = page.getByTestId('not-found-search-input');
      await expect(input).toHaveAttribute('type', 'search');
      await expect(input).toHaveAttribute('name', 'q');
      await expect(page.getByTestId('not-found-search-submit')).toHaveAccessibleName('Search');
      const home = page.getByTestId('not-found-home');
      await expect(home).toHaveText('Back To Homepage');
      await expect(home).toHaveAttribute('href', '/');
      expect(await page.evaluate(() => document.activeElement?.id)).not.toBe('NotFoundSearchInput');
      await page.clock.runFor(60_000);
      await expect(page.locator('dialog[open]')).toHaveCount(0);
      await expect(page.locator('html[data-layer-open]')).toHaveCount(0);
      // TC-22
      const cats = page.getByTestId('not-found-categories');
      if (await cats.count()) {
        await expect(cats).toHaveAttribute('aria-labelledby', /.+/);
        const links = cats.locator('ul').getByTestId('not-found-category');
        const n = await links.count();
        expect(n).toBeGreaterThan(0);
        expect(n, 'B-01 tối đa 6').toBeLessThanOrEqual(6);
        for (const link of await links.all()) {
          expect((await rect(link)).height).toBeGreaterThanOrEqual(44);
          if (/\/collections\//.test((await link.getAttribute('href')) ?? '')) await expect(link).toContainText(/\d+ products?/);
        }
      } else test.info().annotations.push({ type: 'trạng thái', description: 'Category menu trống: không hàng link' });
      // TC-23
      const products = page.getByTestId('container-not-found-products').getByTestId('featured-collection');
      if (await products.count()) {
        await expect(products.getByTestId('featured-collection-heading')).toHaveJSProperty('tagName', 'H2');
        await expect(products.getByTestId('featured-collection-view-all')).toHaveAttribute('href', /\/collections\/all$/);
        const cards = products.getByTestId('product-card');
        const c = await cards.count();
        expect(c).toBeGreaterThanOrEqual(1);
        expect(c, 'B-02 tối đa 8').toBeLessThanOrEqual(8);
        for (const img of await products.locator('img').all()) await expect(img).toHaveAttribute('loading', 'lazy');
      } else {
        test.info().annotations.push({ type: 'trạng thái', description: 'chưa chọn collection: không section sản phẩm' });
        await expect(page.getByTestId('not-found-search-input')).toBeVisible();
        await expect(home).toBeVisible();
      }
      await expectNoEditorPlaceholders(page);
      expect(await noHScroll(page)).toBe(true);
      // TC-47
      expect(await axeViolations(page)).toEqual([]);
    });
  }

  test('TC-19 AC7 360 × 640: màn đầu thấy eyebrow, h1, mô tả, ô tìm, nút về trang chủ', async ({ page }) => {
    await openAt(page, MISSING, 360, 640);
    const heading = page.getByTestId('not-found-heading');
    const parts = [page.getByTestId('not-found').getByText('Error 404', { exact: true }), heading, heading.locator('xpath=following-sibling::p[1]'), page.getByTestId('not-found-search-input'), page.getByTestId('not-found-home')];
    for (const part of parts) {
      const b = await rect(part);
      expect(b.y + b.height).toBeLessThanOrEqual(640);
    }
    expect(await noHScroll(page)).toBe(true);
  });

  test('TC-20 AC7 gõ ≥ 2 ký tự vào ô tìm 404 → gợi ý predictive như TE-8 AC1 (bug ES1-T486)', async ({ page }) => {
    test.fail(true, 'ES1-T486: ô tìm 404 chưa nối predictive search');
    await openAt(page, MISSING, 1280);
    const suggest = page.waitForRequest(/\/search\/suggest/, { timeout: 5_000 });
    await page.getByTestId('not-found-search-input').pressSequentially('du', { delay: 50 });
    await suggest;
    await expect(page.getByTestId('predictive-search-listbox')).toBeVisible();
  });

  for (const width of [360, 1280]) {
    test(`TC-21 AC7 bàn phím @${width}: Tab ô tìm → nút Search → Back To Homepage, outline khi focus, Enter sang /search`, async ({ page }) => {
      await openAt(page, MISSING, width);
      const input = page.getByTestId('not-found-search-input');
      await input.focus();
      const field = input.locator('xpath=..');
      expect(await css(field, 'outline-style')).toBe('solid');
      await page.keyboard.press('Tab');
      await expect(page.getByTestId('not-found-search-submit')).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(page.getByTestId('not-found-home')).toBeFocused();
      await input.fill('a');
      await Promise.all([page.waitForURL(/\/search\?.*q=a/), input.press('Enter')]);
      await expectNotChallenged(page);
    });
  }

  test('B-03 mất mạng JS: chặn mọi /assets/*.js, contact và 404 vẫn dùng được (360)', async ({ page }) => {
    await page.route(/\/assets\/.*\.js(\?|$)/, (r) => r.abort());
    await openContact(page, 360);
    await expect(page.getByTestId('contact-form')).toHaveAttribute('method', /post/i);
    await expect(page.getByTestId('contact-submit')).toBeVisible();
    expect(await noHScroll(page)).toBe(true);
    await openAt(page, MISSING, 360);
    const input = page.getByTestId('not-found-search-input');
    await input.fill('a');
    await Promise.all([page.waitForURL(/\/search\?.*q=a/), input.press('Enter')]);
  });
});

// ---------------------------------------------------------------- password (AC9–AC12, AC16)
test.describe('ES1-T386 password', () => {
  test.beforeEach(({}, ti) => { desktopOnly(ti.project.name); });

  for (const width of WIDTHS) {
    test(`TC-48 AC16, TC-25 AC9, TC-35 AC12, TC-37 AC12, TC-26 AC10, TC-47 AC16 password @${width}: LCP, nền tối, logo, ảnh, newsletter, details, axe 0`, async ({ browser }) => {
      const { context, page } = await openPassword(browser, width);
      try {
        const media = page.getByTestId('password-media');
        const img = media.locator('img');
        const hasImage = (await img.count()) > 0;
        // TC-48
        const paint = await lcp(page);
        if (width >= 1024 && hasImage) expect(paint.testids, `LCP <${paint.tag}> phải là ảnh`).toContain('password-media');
        else expect(paint.testids, `LCP <${paint.tag}> phải là h1`).toContain('password-heading');
        // TC-25
        const body = page.locator('body');
        await expect(body).toHaveClass(/template-password/);
        expect(await css(body, 'background-color')).toBe(await resolveColor(page, 'var(--color-background-dark)'));
        expect(await css(body, 'background-image')).toContain('noise-dark');
        for (const id of ['header', 'footer', 'announcement-bar']) await expect(page.getByTestId(id)).toHaveCount(0);
        await expect(page.locator('header, footer')).toHaveCount(0);
        const logo = page.getByTestId('password-logo');
        expect(Math.abs((await rect(logo)).height - 80)).toBeLessThanOrEqual(1);
        await expect(logo.locator('a')).toHaveCount(0);
        if (await logo.locator('img').count()) expect(await logo.locator('img').getAttribute('alt')).toBeTruthy();
        else await expect(logo).not.toHaveText('');
        await expect(page.locator('h1')).toHaveCount(1);
        const em = page.getByTestId('password-heading').locator('em');
        if (await em.count()) expect(await css(em.first(), 'color')).toBe(await resolveColor(page, 'var(--color-accent)'));
        await expect(page.getByText('Are you the store owner?')).toBeVisible();
        await expect(page.getByRole('link', { name: 'Log in here' })).toHaveAttribute('href', '/admin');
        await expect(page.getByRole('link', { name: /shopify/i })).toHaveCount(1);
        // TC-35
        const heading = await rect(page.getByTestId('password-heading'));
        const bar = await rect(logo);
        if (hasImage) {
          await expect(img).toHaveAttribute('alt', '');
          await expect(img).toHaveAttribute('loading', 'eager');
          expect(await img.evaluate((el) => getComputedStyle(el.closest('.image') ?? el).borderTopLeftRadius)).toBe('16px');
          const m = await rect(media);
          expect(m.y, 'ảnh dưới thanh 80').toBeGreaterThanOrEqual(bar.y + bar.height - 1);
          if (width >= 1024) {
            // ES1-T487: ưu tiên cao chỉ ở desktop qua <link rel=preload media="(min-width: 64rem)">, ảnh không fetchpriority.
            const preload = page.getByTestId('password-media-preload');
            await expect(preload).toHaveAttribute('fetchpriority', 'high');
            await expect(preload).toHaveAttribute('media', /min-width:\s*64rem/);
            expect(m.x, 'từ 64rem ảnh bên phải').toBeGreaterThanOrEqual(heading.x + heading.width - 1);
          } else expect(m.y, 'dưới 64rem ảnh sau nội dung').toBeGreaterThan(heading.y + heading.height);
        } else if (width >= 1024) {
          await expect(media).toBeVisible();
          expect(await css(media, 'background-color')).not.toMatch(/^rgba\(0, 0, 0, 0\)$|^transparent$/);
        } else if (width < 768) {
          await expect(media).toBeHidden();
        }
        // TC-37 màu chữ phụ
        const muted = await resolveColor(page, 'var(--color-muted-on-dark)');
        const footerText = page.getByText('Are you the store owner?');
        expect(await css(footerText, 'color')).toBe(muted);
        // TC-26
        const newsletter = page.getByTestId('password-newsletter');
        if (await newsletter.count()) {
          const divider = page.getByText('Have a password?', { exact: true });
          expect(await before(newsletter, divider)).toBe(true);
          expect(await before(divider, page.getByTestId('password-details'))).toBe(true);
          await expect(page.locator('label[for="PasswordNewsletterEmail"]')).toHaveText('Email');
          await expect(page.locator('label[for="PasswordNewsletterEmail"]')).toBeVisible();
          await expect(page.getByTestId('password-newsletter-submit')).toHaveText('Notify Me');
          await expect(page.getByText('No spam. Unsubscribe anytime.')).toBeVisible();
          expect(await css(page.getByText('No spam. Unsubscribe anytime.'), 'color')).toBe(muted);
          const input = await rect(page.getByTestId('password-newsletter-email'));
          const submit = await rect(page.getByTestId('password-newsletter-submit'));
          if (width < 768) expect(submit.y, '360: nút dưới ô').toBeGreaterThanOrEqual(input.y + input.height - 1);
          else expect(Math.abs(submit.y - input.y), 'từ 768: ô và nút cùng hàng').toBeLessThanOrEqual(1);
          await expect(page.getByTestId('password-details')).not.toHaveAttribute('open', '');
        } else test.info().annotations.push({ type: 'cấu hình', description: 'Show newsletter tắt: TC-29' });
        expect(await noHScroll(page)).toBe(true);
        // TC-47 trước khi mở details (trạng thái mặc định)
        expect(await axeViolations(page)).toEqual([]);
        await openDetails(page);
        await expect(page.locator('label[for="PasswordInput"]')).toHaveText('Password');
        await expect(page.getByTestId('password-input')).toHaveAttribute('autocomplete', 'current-password');
        await expect(page.getByTestId('password-submit')).toHaveText('Enter Store');
        await expect(page.getByText('Enter Using Password')).toBeVisible();
        expect(await axeViolations(page)).toEqual([]);
      } finally {
        await context.close();
      }
    });
  }

  for (const width of [360, 1280]) {
    test(`TC-27 AC10 email sai @${width}: câu lỗi chữ trắng + icon dưới ô, ô viền 2px; TC-37 focus outline trắng 2px`, async ({ browser }) => {
      const { context, page } = await openPassword(browser, width);
      try {
        const input = page.getByTestId('password-newsletter-email');
        test.skip((await input.count()) === 0, 'Show newsletter tắt');
        // TC-37: Tab tới ô email
        for (let i = 0; i < 10 && !(await input.evaluate((el) => el === document.activeElement)); i++) await page.keyboard.press('Tab');
        await expect(input).toBeFocused();
        expect(await css(input, 'outline-style')).toBe('solid');
        expect(await css(input, 'outline-width')).toBe('2px');
        expect(await css(input, 'outline-color')).toBe(await resolveColor(page, 'var(--color-background-dark-foreground)'));
        await input.fill('abc');
        await page.keyboard.press('Tab');
        const error = page.getByTestId('password-newsletter').getByText('Enter an email like name@example.com.');
        await expect(error).toBeVisible();
        expect(await css(error, 'color')).toBe(await resolveColor(page, 'var(--color-background-dark-foreground)'));
        expect(await error.evaluate((el) => getComputedStyle(el, '::before').content)).toBe('"!"');
        expect(await css(input, 'border-top-width')).toBe('2px');
        const e = await rect(error);
        const i = await rect(input);
        expect(e.y, 'câu lỗi dưới ô').toBeGreaterThanOrEqual(i.y + i.height - 1);
      } finally {
        await context.close();
      }
    });
  }

  test('TC-28 AC10 email hợp lệ (cố định, lần sau là "đã đăng ký"): hộp role=status "You\'re on the list" thay form', async ({ browser }) => {
    const { context, page } = await openPassword(browser, 1280);
    try {
      const input = page.getByTestId('password-newsletter-email');
      test.skip((await input.count()) === 0, 'Show newsletter tắt');
      await input.fill(NEWSLETTER_EMAIL);
      await submitAndLoad(page, () => page.getByTestId('password-newsletter-submit').click());
      await expectNotChallenged(page);
      const ok = page.getByTestId('password-newsletter-success');
      await expect(ok).toHaveAttribute('role', 'status');
      await expect(ok).toContainText("You're on the list");
      await expect(page.getByTestId('password-newsletter-email')).toHaveCount(0);
      test.info().annotations.push({ type: 'kiểm tay', description: `admin: khách ${NEWSLETTER_EMAIL} có tag newsletter, password-page` });
    } finally {
      await context.close();
    }
  });

  test('TC-29 AC10 Show newsletter tắt: không form email, không dải, details mở sẵn', async ({ browser }) => {
    const { context, page } = await openPassword(browser, 1280);
    try {
      test.skip((await page.getByTestId('password-newsletter').count()) > 0, 'preview đang bật Show newsletter (mặc định): cần preview cấu hình tắt');
      await expect(page.getByText('Have a password?', { exact: true })).toHaveCount(0);
      await expect(page.getByTestId('password-details')).toHaveAttribute('open', '');
      await expect(page.getByTestId('password-input')).toBeVisible();
    } finally {
      await context.close();
    }
  });

  for (const width of [360, 1280]) {
    test(`TC-30 AC10/AC11 không JS @${width}: 2 form POST, summary mở được, không nút mắt, sai mật khẩu hiện lỗi`, async ({ browser }) => {
      const { context, page } = await openPassword(browser, width, false);
      try {
        const nl = page.getByTestId('password-newsletter');
        if (await nl.count()) await expect(nl).toHaveAttribute('method', /post/i);
        await expect(page.locator('form#PasswordForm')).toHaveAttribute('method', /post/i);
        await openDetails(page);
        await expect(page.getByTestId('password-toggle')).toBeHidden();
        await page.getByTestId('password-input').fill('es1-t386-sai');
        await Promise.all([page.waitForEvent('framenavigated', { predicate: (f) => f === page.mainFrame() }), page.getByTestId('password-submit').click()]);
        await page.waitForLoadState('domcontentloaded');
        await expect(page.getByTestId('password-details')).toHaveAttribute('open', '');
        await expect(page.getByTestId('password-error')).toBeVisible();
        expect(await noHScroll(page)).toBe(true);
      } finally {
        await context.close();
      }
    });
  }

  test('TC-31 AC11 sai mật khẩu ×4: details mở, aria-invalid, viền 2px màu lỗi, câu lỗi trắng + icon', async ({ browser }) => {
    const { context, page } = await openPassword(browser, 360);
    try {
      await submitWrongPassword(page);
      const sale = await resolveColor(page, 'var(--color-sale)');
      const white = await resolveColor(page, 'var(--color-background-dark-foreground)');
      for (const width of WIDTHS) {
        await page.setViewportSize({ width, height: VIEW_H });
        await expect(page.getByTestId('password-details'), `@${width}`).toHaveAttribute('open', '');
        const input = page.getByTestId('password-input');
        await expect(input).toHaveAttribute('aria-invalid', 'true');
        await expect(input).toHaveAttribute('aria-describedby', 'PasswordError');
        expect(await css(input, 'border-top-width')).toBe('2px');
        expect(await css(input, 'border-top-color')).toBe(sale);
        const error = page.getByTestId('password-error');
        await expect(error).toHaveText('That password is incorrect. Check the spelling and try again.');
        await expect(error).toHaveAttribute('role', 'alert');
        expect(await css(error, 'color')).toBe(white);
        expect(await error.evaluate((el) => getComputedStyle(el, '::before').content)).toBe('"!"');
        expect(await noHScroll(page)).toBe(true);
      }
    } finally {
      await context.close();
    }
  });

  test('TC-32 AC11 sai mật khẩu: focus vào ô mật khẩu sau khi tải lại (bug ES1-T488)', async ({ browser }) => {
    const { context, page } = await openPassword(browser, 1280);
    try {
      await submitWrongPassword(page);
      await expect(page.getByTestId('password-input')).toBeFocused({ timeout: 2_000 });
    } finally {
      await context.close();
    }
  });

  test('TC-33 AC11 đúng mật khẩu → vào storefront', async ({ browser }) => {
    test.skip(!process.env.STORE_PASSWORD, 'thiếu STORE_PASSWORD');
    const { context, page } = await openPassword(browser, 1280);
    try {
      await openDetails(page);
      await page.getByTestId('password-input').fill(process.env.STORE_PASSWORD!);
      await Promise.all([page.waitForURL((u) => !u.pathname.startsWith('/password'), { timeout: 30_000 }), page.getByTestId('password-submit').click()]);
      await expectNotChallenged(page);
      await expect(page.getByTestId('header')).toBeVisible();
    } finally {
      await context.close();
    }
  });

  test('TC-34 AC11 nút mắt có JS: Show password ↔ Hide password, aria-pressed, type text, 44px', async ({ browser }) => {
    const { context, page } = await openPassword(browser, 1280);
    try {
      await openDetails(page);
      const toggle = page.getByTestId('password-toggle');
      test.fixme(await toggle.isHidden(), 'ES1-T443: JS nút mắt chưa có (nút còn hidden)');
      const b = await rect(toggle);
      expect(b.width).toBeGreaterThanOrEqual(44);
      expect(b.height).toBeGreaterThanOrEqual(44);
      await expect(toggle).toHaveAccessibleName('Show password');
      await expect(toggle).toHaveAttribute('aria-pressed', 'false');
      await toggle.click();
      await expect(toggle).toHaveAccessibleName('Hide password');
      await expect(toggle).toHaveAttribute('aria-pressed', 'true');
      await expect(page.getByTestId('password-input')).toHaveAttribute('type', 'text');
      await toggle.click();
      await expect(page.getByTestId('password-input')).toHaveAttribute('type', 'password');
    } finally {
      await context.close();
    }
  });

  for (const width of [360, 768]) {
    test(`TC-36 AC12 ảnh password dưới 64rem không fetchpriority @${width} (bug ES1-T487)`, async ({ browser }) => {
      const { context, page } = await openPassword(browser, width);
      try {
        const img = page.getByTestId('password-media').locator('img');
        test.skip((await img.count()) === 0, 'chưa chọn ảnh password');
        await expect(img).toHaveAttribute('loading', 'eager');
        expect(await img.getAttribute('fetchpriority')).not.toBe('high');
      } finally {
        await context.close();
      }
    });
  }
});

// ---------------------------------------------------------------- gift card (AC13–AC16)
async function openGift(page: Page, url: string, width: number) {
  await page.setViewportSize({ width, height: VIEW_H });
  await gotoStore(page, url);
}

async function expectInactive(page: Page, title: string) {
  const card = page.getByTestId('gift-card-card');
  expect(await css(card, 'filter')).toBe('grayscale(1)');
  await expect(page.getByTestId('gift-card-balance').locator('s')).toHaveCount(1);
  await expect(card.getByText('Expired', { exact: true })).toBeVisible();
  const alert = page.getByTestId('gift-card-alert');
  await expect(alert).toHaveAttribute('role', 'alert');
  await expect(alert).toContainText(title);
  await expect(alert.locator('svg')).toHaveCount(1);
  for (const id of ['gift-card-qr', 'gift-card-wallet', 'gift-card-copy', 'gift-card-print', 'gift-card-start']) await expect(page.getByTestId(id), id).toHaveCount(0);
  const contact = page.getByTestId('gift-card-contact');
  await expect(contact).toHaveText('Contact Us');
  await expect(contact).toHaveClass(/button--secondary/);
  await expect(page.getByTestId('gift-card-code')).toBeVisible();
  await expect(page.getByTestId('gift-card-code')).not.toHaveText('');
}

test.describe('ES1-T386 gift card', () => {
  test.beforeEach(({}, ti) => { desktopOnly(ti.project.name); });

  for (const width of WIDTHS) {
    test(`TC-48 AC16, TC-38 AC13, TC-47 AC16 gift card còn hiệu lực @${width}: LCP chữ, head, thanh, logo link, thẻ CSS, Wallet, Start Shopping, bố cục, axe 0`, async ({ page }) => {
      test.fixme(!GIFT.active, 'ES1-T298: store dev chưa có gift card phát hành (TS_GIFT_CARD_URL)');
      await openGift(page, GIFT.active!, width);
      // TC-48
      const paint = await lcp(page);
      expect(paint.tag, 'LCP không phải ảnh lớn').not.toBe('img');
      // TC-38
      await expect(page.locator('meta[name="viewport"]')).toHaveCount(1);
      await expect(page.locator('meta[name="robots"][content="noindex"]')).toHaveCount(1);
      for (const id of ['header', 'footer', 'announcement-bar']) await expect(page.getByTestId(id)).toHaveCount(0);
      const logo = page.getByTestId('gift-card-logo');
      await expect(logo).toHaveAttribute('href', '/');
      expect((await rect(logo)).height).toBeGreaterThanOrEqual(44);
      const bar = await rect(logo.locator('xpath=..'));
      expect(Math.abs(bar.height - 80)).toBeLessThanOrEqual(1);
      await expect(page.locator('h1')).toHaveCount(1);
      const card = page.getByTestId('gift-card-card');
      for (const img of await card.locator('img').all()) expect((await rect(img)).width, 'thẻ dựng CSS, chỉ logo nhỏ').toBeLessThanOrEqual(200);
      await expect(page.getByTestId('gift-card-balance')).toContainText(/\d/);
      await expect(page.getByTestId('gift-card-code')).not.toHaveText('');
      await expect(card.getByText('Expired', { exact: true })).toHaveCount(0);
      const wallet = page.getByTestId('gift-card-wallet');
      if (await wallet.count()) {
        await expect(wallet.locator('img')).toHaveAttribute('src', /gift-card\/add-to-apple-wallet\.svg/);
        expect((await rect(wallet.locator('img'))).height).toBeGreaterThanOrEqual(44);
      } else test.info().annotations.push({ type: 'trạng thái', description: 'không pass_url: không nút Wallet' });
      const start = page.getByTestId('gift-card-start');
      await expect(start).toHaveText('Start Shopping');
      await expect(start).toHaveAttribute('href', '/');
      const c = await rect(card);
      const code = await rect(page.getByTestId('gift-card-code'));
      if (width >= 1024) expect(code.x).toBeGreaterThanOrEqual(c.x + c.width - 1);
      else expect(code.y).toBeGreaterThanOrEqual(c.y + c.height - 1);
      expect(await noHScroll(page)).toBe(true);
      // TC-47
      expect(await axeViolations(page)).toEqual([]);
    });
  }

  for (const width of [360, 1280]) {
    test(`TC-39 AC13 QR ≥ 120 có tên truy cập @${width}`, async ({ page }) => {
      test.fixme(!GIFT.active, 'ES1-T298: store dev chưa có gift card phát hành (TS_GIFT_CARD_URL)');
      await openGift(page, GIFT.active!, width);
      const qr = page.getByTestId('gift-card-qr');
      const b = await rect(qr);
      expect(b.width).toBeGreaterThanOrEqual(120);
      expect(b.height).toBeGreaterThanOrEqual(120);
      const drawn = qr.locator('img, canvas');
      test.fixme((await drawn.count()) === 0, 'ES1-T410: QR chưa được vẽ (gift-card-qr.js)');
      await expect(qr.getByRole('img', { name: QR_NAME })).toBeVisible();
      await expect(page.getByTestId('gift-card-qr-fallback')).toBeHidden();
    });
  }

  test('TC-40 AC13 dùng một phần: số dư kèm "of … initial value"', async ({ page }) => {
    test.fixme(!GIFT.partial, 'ES1-T298: thiếu TE386_GIFT_CARD_PARTIAL_URL');
    await openGift(page, GIFT.partial!, 1280);
    await expect(page.getByTestId('gift-card-balance')).toContainText(/of .+ initial value/);
  });

  for (const width of WIDTHS) {
    test(`TC-41 AC14 hết hạn @${width}: xám, gạch số dư, pill Expired, alert + ngày, không QR/Wallet/Copy, Contact Us, mã vẫn hiện`, async ({ page }) => {
      test.fixme(!GIFT.expired, 'ES1-T298: thiếu TE386_GIFT_CARD_EXPIRED_URL');
      await openGift(page, GIFT.expired!, width);
      await expectInactive(page, 'This gift card has expired');
      await expect(page.getByTestId('gift-card-alert')).toContainText('It expired on');
      expect(await noHScroll(page)).toBe(true);
    });
  }

  for (const width of [360, 1280]) {
    test(`TC-42 AC14 bị tắt @${width}: câu riêng "This gift card is no longer active"`, async ({ page }) => {
      test.fixme(!GIFT.disabled, 'ES1-T298: thiếu TE386_GIFT_CARD_DISABLED_URL');
      await openGift(page, GIFT.disabled!, width);
      await expectInactive(page, 'This gift card is no longer active');
      await expect(page.getByTestId('gift-card-alert')).not.toContainText('expired');
    });
  }

  test('TC-44 AC15 Copy Code: clipboard, nhãn Copied 2 s, status "Gift card code copied"', async ({ page }) => {
    test.fixme(!GIFT.active, 'ES1-T298: thiếu TS_GIFT_CARD_URL');
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.clock.install();
    await openGift(page, GIFT.active!, 1280);
    const copy = page.getByTestId('gift-card-copy');
    test.fixme(await copy.isHidden(), 'ES1-T410: JS copy chưa có (nút còn hidden)');
    const code = ((await page.getByTestId('gift-card-code').textContent()) ?? '').replace(/\s+/g, '');
    await copy.click();
    expect((await page.evaluate(() => navigator.clipboard.readText())).replace(/\s+/g, '')).toBe(code);
    await expect(copy).toContainText('Copied');
    await expect(page.getByRole('status').filter({ hasText: 'Gift card code copied' })).toHaveCount(1);
    await page.clock.runFor(2_100);
    await expect(copy).toHaveText('Copy Code');
  });

  test('TC-45 AC15 bản in trên store: ẩn thanh, nút; thẻ trắng chữ đen; giữ mã, QR', async ({ page }) => {
    test.fixme(!GIFT.active, 'ES1-T298: thiếu TS_GIFT_CARD_URL');
    await openGift(page, GIFT.active!, 1280);
    await page.emulateMedia({ media: 'print' });
    for (const id of ['gift-card-logo', 'gift-card-copy', 'gift-card-start', 'gift-card-print', 'gift-card-wallet']) {
      if (await page.getByTestId(id).count()) await expect(page.getByTestId(id), id).toBeHidden();
    }
    const card = page.getByTestId('gift-card-card');
    expect(await css(card, 'background-color')).toBe(await resolveColor(page, 'var(--color-background)'));
    expect(await css(card, 'color')).toBe(await resolveColor(page, 'var(--color-foreground)'));
    await expect(page.getByTestId('gift-card-code')).toBeVisible();
    await expect(page.getByTestId('gift-card-qr')).toBeVisible();
  });

  for (const width of WIDTHS) {
    test(`TC-46 AC15 không JS @${width}: không Copy/Print, khung QR 144 giữ "Enter the code at checkout"`, async ({ browser }) => {
      test.fixme(!GIFT.active, 'ES1-T298: thiếu TS_GIFT_CARD_URL');
      const context = await newStoreContext(browser, { javaScriptEnabled: false, storageState: 'tests/setup/state.json', viewport: { width, height: VIEW_H } });
      try {
        const page = await context.newPage();
        await page.goto(new URL(GIFT.active!, process.env.STORE_ORIGIN || new URL(process.env.PREVIEW_URL!).origin).href, { waitUntil: 'domcontentloaded' });
        await expect(page.getByTestId('gift-card-copy')).toBeHidden();
        await expect(page.getByTestId('gift-card-print')).toBeHidden();
        const qr = await rect(page.getByTestId('gift-card-qr'));
        expect(Math.abs(qr.width - 144)).toBeLessThanOrEqual(1);
        expect(Math.abs(qr.height - 144)).toBeLessThanOrEqual(1);
        await expect(page.getByTestId('gift-card-qr-fallback')).toHaveText('Enter the code at checkout');
        await expect(page.getByTestId('gift-card-qr-fallback')).toBeVisible();
      } finally {
        await context.close();
      }
    });
  }

  test('TC-46 AC15 script QR tải lỗi (route.abort): giữ chữ dự phòng, không Copy/Print, 0 console error theme', async ({ page }) => {
    test.fixme(!GIFT.active, 'ES1-T298: thiếu TS_GIFT_CARD_URL');
    const watch = watchStore(page);
    watch.allowNetworkLog();
    await page.route(/qrcode(\.min)?\.js|gift-card-qr\.js/, (r) => r.abort());
    await openGift(page, GIFT.active!, 360);
    await expect(page.getByTestId('gift-card-copy')).toBeHidden();
    await expect(page.getByTestId('gift-card-print')).toBeHidden();
    await expect(page.getByTestId('gift-card-qr-fallback')).toBeVisible();
    await expect(page.getByTestId('gift-card-qr-fallback')).toHaveText('Enter the code at checkout');
    await watch.finish();
  });
});

// ---------------------------------------------------------------- chung (AC16, AC17)
test.describe('ES1-T386 chung', () => {
  test.beforeEach(({}, ti) => { desktopOnly(ti.project.name); });

  test('TC-47 AC16 404, password, gift card có <title> (1280)', async ({ page, browser }) => {
    await openAt(page, MISSING, 1280);
    expect((await page.title()).trim(), '404 title').not.toBe('');
    const { context, page: pw } = await openPassword(browser, 1280);
    try {
      expect((await pw.title()).trim(), 'password title').not.toBe('');
    } finally {
      await context.close();
    }
    if (GIFT.active) {
      await openGift(page, GIFT.active, 1280);
      expect((await page.title()).trim(), 'gift card title').not.toBe('');
    } else test.info().annotations.push({ type: 'thiếu dữ liệu', description: 'ES1-T298: gift card chưa kiểm title' });
  });

  // Bug ES1-T386-B05 (ES1-T495) đã sửa: meta-tags luôn in meta description, dự phòng shop.description → shop.name.
  // 3 trang chung 1 nguyên nhân nên gộp 1 test, expect.soft để đo đủ cả 3.
  test('TC-47 AC16 404, password, gift card có meta description (1280), bug ES1-T386-B05', async ({ page, browser }) => {
    await openAt(page, MISSING, 1280);
    await expect.soft(page.locator('meta[name="description"]'), '404 meta description').toHaveCount(1);
    const { context, page: pw } = await openPassword(browser, 1280);
    try {
      await expect.soft(pw.locator('meta[name="description"]'), 'password meta description').toHaveCount(1);
    } finally {
      await context.close();
    }
    if (GIFT.active) {
      await openGift(page, GIFT.active, 1280);
      await expect.soft(page.locator('meta[name="description"]'), 'gift card meta description').toHaveCount(1);
    } else test.info().annotations.push({ type: 'thiếu dữ liệu', description: 'ES1-T298: gift card chưa kiểm meta description' });
  });

  test('TC-51 AC17 theme mới cài (TE386_STORE_STATE=new): heading locale, không aside, không danh mục/sản phẩm 404, không eyebrow/ảnh password', async ({ page, browser }) => {
    test.skip(STORE_STATE !== 'new', 'TE386_STORE_STATE khác "new": store dev đang cấu hình nội dung Figma (TC-52)');
    await openContact(page, 1280);
    await expect(page.getByTestId('contact-form-heading')).toHaveText('Send Us A Message');
    await expect(page.getByTestId('contact-aside')).toHaveCount(0);
    await openAt(page, MISSING, 1280);
    await expect(page.getByTestId('not-found-heading')).toHaveText('Page Not Found');
    await expect(page.getByTestId('not-found-heading').locator('xpath=following-sibling::p[1]')).toHaveText(JSON.parse(read('locales/en.default.json'))['404'].text);
    await expect(page.getByTestId('not-found-categories')).toHaveCount(0);
    await expect(page.getByTestId('product-card')).toHaveCount(0);
    const { context, page: pw } = await openPassword(browser, 1280);
    try {
      await expect(pw.getByTestId('password-heading')).toHaveText(JSON.parse(read('locales/en.default.json')).password.title);
      await expect(pw.getByTestId('password-heading').locator('xpath=preceding-sibling::p')).toHaveCount(0);
      await expect(pw.getByTestId('password-media').locator('img')).toHaveCount(0);
    } finally {
      await context.close();
    }
  });

  test('TC-52 AC17 store dev đã cấu hình (TE386_STORE_STATE=configured): contact 5 FAQ, 404 5 figma-cat + 4 sản phẩm, password Opening Soon + Level Up Your Fitness + ảnh', async ({ page, browser }) => {
    test.skip(STORE_STATE !== 'configured', 'TE386_STORE_STATE khác "configured": chưa áp fixture TE-17-R2-QA0');
    await openContact(page, 1280);
    await expect(page.getByTestId('contact-form-heading')).toHaveText('Send Us A Message');
    await expect(page.getByTestId('contact-aside').getByTestId('faq-item')).toHaveCount(5);
    await openAt(page, MISSING, 1280);
    const cats = page.getByTestId('not-found-category');
    await expect(cats).toHaveCount(5);
    for (const link of await cats.all()) {
      await expect(link).toHaveAttribute('href', /\/collections\/figma-cat-/);
      await expect(link).toContainText(/\d+ products?/);
    }
    await expect(page.getByTestId('container-not-found-products').getByTestId('product-card')).toHaveCount(4);
    const { context, page: pw } = await openPassword(browser, 1280);
    try {
      await expect(pw.getByText('Opening Soon', { exact: true })).toBeVisible();
      await expect(pw.getByTestId('password-heading')).toHaveText(/Level Up\s*Your Fitness/i);
      const em = pw.getByTestId('password-heading').locator('em');
      await expect(em).toHaveText(/Your Fitness/i);
      expect(await css(em, 'color')).toBe(await resolveColor(pw, 'var(--color-accent)'));
      await expect(pw.getByTestId('password-media').locator('img')).toHaveCount(1);
    } finally {
      await context.close();
    }
  });
});

// ---------------------------------------------------------------- thiết bị thật (B-09)
test.describe('ES1-T386 mobile', () => {
  test.beforeEach(({}, ti) => { test.skip(ti.project.name !== 'mobile', 'B-09 chỉ chạy ở project mobile (Pixel 7)'); });

  test('B-09 Pixel 7: contact, 404, password không cuộn ngang; nút chính ≥ 48', async ({ page, browser }) => {
    const res = await page.goto(CONTACT);
    await expectNotChallenged(page);
    if (res?.status() !== 404 && (await page.getByTestId('contact-page').count())) {
      expect(await noHScroll(page)).toBe(true);
      expect((await rect(page.getByTestId('contact-submit'))).height).toBeGreaterThanOrEqual(48);
    } else test.info().annotations.push({ type: 'thiếu dữ liệu', description: `ES1-T383: ${CONTACT} chưa gán template contact` });
    await gotoStore(page, MISSING);
    expect(await noHScroll(page)).toBe(true);
    expect((await rect(page.getByTestId('not-found-home'))).height).toBeGreaterThanOrEqual(48);
    const viewport = page.viewportSize()!;
    const { context, page: pw } = await openPassword(browser, viewport.width, true, viewport.height);
    try {
      expect(await noHScroll(pw)).toBe(true);
      const submit = pw.getByTestId('password-newsletter-submit');
      if (await submit.count()) expect((await rect(submit)).height).toBeGreaterThanOrEqual(48);
    } finally {
      await context.close();
    }
  });
});
