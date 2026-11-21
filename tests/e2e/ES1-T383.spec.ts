// ES1-T383 (TE-21-R2-FE1): page mặc định (TE-21 AC1, AC2) + page.contact (AC3–AC6, AC17 phần contact), docs/ui-spec/page.md.
// Nhóm "tĩnh" đọc file repo và dựng fixture bằng assets/*.css, không cần store (chạy 1 lần ở project desktop).
// Nhóm store chạy trên PREVIEW_URL. Thiếu dữ liệu → skip/fixme, KHÔNG tính đạt:
//   TE383_PAGE_PATH     page dùng template mặc định có bảng rộng, ảnh, link trong đoạn (vd /pages/our-story)
//   TE383_CONTACT_PATH  page gán template "contact" (mặc định /pages/contact; dùng chung TE407_CONTACT_PATH)
// Validation inline khi rời trường, aria-busy lúc gửi, focus vào hộp tóm tắt (AC4, AC5 phần có JS) là việc Dev BE: chưa test ở đây.
import { test, expect, type Page } from './support/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { env } from './support/store-data';
import { expectNotChallenged } from './support/store-guard';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');
const schema = (p: string) => JSON.parse(read(p).split('{% schema %}')[1].split('{% endschema %}')[0]);
const noComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');

// Token tối thiểu thay snippets/css-variables.liquid (không render Liquid khi chạy tĩnh); space_base = 4
const TOKENS = `:root{--font-size-xs:.8125rem;--font-size-sm:.875rem;--font-size-base:1rem;--font-size-lg:1.125rem;--font-size-h3:1.5rem;--font-size-h2:2rem;--font-size-h1:3rem;--line-height-body:1.5;--line-height-heading:1.1;--space-1:4px;--space-2:8px;--space-3:12px;--space-4:16px;--space-5:24px;--space-6:32px;--space-7:48px;--space-8:120px;--header-height:80px;--page-width:1456px;--page-margin:20px;--radius-input:8px;--radius-button:8px;--radius-card:12px;--radius-pill:999px;--color-background:#fff;--color-foreground:#1a1a1a;--color-muted:#5c5c5c;--color-muted-light:#757575;--color-border:#e5e5e5;--color-background-alt:#f5f5f5;--color-background-alt-foreground:#1a1a1a;--color-accent:#c8400e;--color-accent-foreground:#fff;--color-sale:#c62828;--color-badge-new:#467a48;--font-primary--family:sans-serif;--font-heading--family:serif;--font-heading--weight:700;--font-heading--weight-display:800;--motion-fast:150ms;--ease-out:ease-out}`;

const CONTACT_FIXTURE = `
<section class="block-container"><nav class="breadcrumb"><ol class="breadcrumb__list"><li class="breadcrumb__item"><a class="breadcrumb__link" href="#">Home</a></li><li class="breadcrumb__item"><span class="breadcrumb__current" aria-current="page">Contact Us</span></li></ol></nav>
<div class="page-title"><h1 class="page-title__heading">Contact Us</h1></div>
<div class="contact" data-testid="contact-page">
  <div class="contact__main">
    <div class="rte contact__intro"><p>Intro</p></div>
    <div class="contact-form"><form class="contact-form__form" data-testid="contact-form">
      <div class="contact-form__head"><h2 class="contact-form__heading">Send Us A Message</h2><p class="contact-form__required">* Required fields</p></div>
      <div class="contact-form__summary" role="alert" tabindex="-1" data-testid="contact-errors" hidden></div>
      <div class="contact-form__fields">
        <div class="form-field" data-f="name"><label class="form-field__label" for="ContactName">Name</label><input class="form-field__input" id="ContactName"><p id="ContactNameError" class="form-field__error" hidden>Enter your name.</p></div>
        <div class="form-field" data-f="email"><label class="form-field__label" for="ContactEmail">Email</label><input class="form-field__input" id="ContactEmail" type="email"></div>
        <div class="form-field contact-form__field--full" data-f="body"><label class="form-field__label" for="ContactBody">Message</label><textarea class="form-field__input form-field__input--textarea" id="ContactBody"></textarea></div>
      </div>
      <button class="button contact-form__submit" type="submit" data-testid="contact-submit"><span class="button__label">Send Message</span></button>
    </form></div>
  </div>
  <aside class="contact-aside" aria-labelledby="h" data-testid="contact-aside"><div class="contact-aside__header"><p class="contact-aside__eyebrow">Questions and Answers</p><h2 id="h" class="contact-aside__heading">Quick Answers</h2></div>
    <div class="contact-aside__list"><details class="faq-item" open><summary class="faq-item__summary"><h3 class="faq-item__question">Q1</h3></summary><div class="faq-item__answer"><p>A1</p></div></details><details class="faq-item"><summary class="faq-item__summary"><h3 class="faq-item__question">Q2</h3></summary></details></div>
  </aside>
</div></section>`;

// ADR 0014 (ES1-T566): contact-aside in link assets/faq.css trong body, tức nạp sau aux.css ở <head>; fixture giữ đúng thứ tự đó
async function fixture(page: Page, body: string) {
  await page.setContent(`<!doctype html><html lang="en"><head><title>contact</title><style>${TOKENS}</style><style>${read('assets/critical.css')}</style><style>${noComments(read('assets/base.css'))}</style><style>${noComments(read('assets/aux.css'))}</style></head><body><main><style>${noComments(read('assets/faq.css'))}</style>${body}</main></body></html>`);
}

const box = async (page: Page, selector: string) => (await page.locator(selector).first().boundingBox())!;

test.describe('ES1-T383 tĩnh', () => {
  test.beforeEach(({}, ti) => { test.skip(ti.project.name !== 'desktop', 'tĩnh, chạy 1 lần'); });

  test('AC1, AC2 page.liquid: breadcrumb, page-title (1 h1), .rte page.content, ảnh lazy, gợi ý chỉ trong editor', () => {
    const src = read('templates/page.liquid');
    expect(src).toMatch(/render 'breadcrumb'[\s\S]*render 'page-title', title: page\.title[\s\S]*class="rte"/);
    expect(src).toMatch(/class="rte"[^>]*>\s*\{\{-? page\.content \| replace: '<img ', '<img loading="lazy" decoding="async" '/);
    expect(src).toMatch(/elsif request\.design_mode -%\}\s*<p class="page-reading__hint"/);
    expect(src).not.toMatch(/<h1/);
  });

  test('AC3 page.contact: thứ tự breadcrumb → h1 → intro → contact-form → contact-aside (5 faq-item, câu đầu mở, không câu mẫu)', () => {
    const src = read('templates/page.contact.liquid');
    const order = ["render 'breadcrumb'", "render 'page-title'", 'class="rte contact__intro"', "block 'contact-form'", "block 'contact-aside'"].map((s) => src.indexOf(s));
    order.forEach((i) => expect(i).toBeGreaterThan(-1));
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    expect(src.match(/block 'faq-item', id: 'contact-faq-\d'/g)).toHaveLength(5);
    expect(src).toMatch(/id: 'contact-faq-1', open: true/);
    expect(src).not.toMatch(/default_question|default_answer|figma-/);
    expect(src).not.toMatch(/<script|\{% schema %\}/);
  });

  test('AC3, AC6 contact-form: setting đúng bảng SRS, 3 trường, label for, autocomplete, không phone/subject', () => {
    const s = schema('blocks/contact-form.liquid');
    expect(s.presets).toBeUndefined();
    const by = Object.fromEntries(s.settings.map((x: { id: string }) => [x.id, x]));
    expect(by.heading.type).toBe('text');
    expect(by.heading.default).toBeUndefined();
    expect(by.show_privacy_note).toMatchObject({ type: 'checkbox', default: true });
    const src = read('blocks/contact-form.liquid');
    expect(src).toContain("{%- form 'contact'");
    expect(src).toContain('{{ block.shopify_attributes }}');
    for (const [id, name, auto] of [['ContactName', 'contact[name]', 'name'], ['ContactEmail', 'contact[email]', 'email'], ['ContactBody', 'contact[body]', '']]) {
      expect(src, id).toContain(`<label for="${id}"`);
      expect(src, id).toContain(`name="${name}"`);
      if (auto) expect(src, id).toMatch(new RegExp(`id="${id}"[\\s\\S]*?autocomplete="${auto}"`));
      expect(src, id).toMatch(new RegExp(`id="${id}"[\\s\\S]*?required\\s+aria-required="true"`));
    }
    expect(src.match(/name="contact\[/g)).toHaveLength(3);
    expect(src).not.toMatch(/contact\[(phone|subject)\]/);
    expect(src).toContain('type="email"');
    expect(src).toMatch(/aria-describedby="ContactBodyHint\{% if body_error %\} ContactBodyError/);
    expect(src).toMatch(/aria-describedby="ContactEmailError"/);
    expect(src).toContain('shop.privacy_policy');
    expect(src).not.toMatch(/autofocus|novalidate/);
    // ES1-T474: script do BE đặt, chỉ lazy-module.js + contact-form.js, không inline
    const scripts = [...src.matchAll(/<script\b[^>]*>/g)].map((m) => m[0]);
    for (const tag of scripts) expect(tag).toMatch(/src="\{\{ (contact_form_js|'lazy-module\.js' \| asset_url) \}\}" type="module"/);
  });

  test('AC4, AC5 contact-form: tóm tắt lỗi role=alert, lỗi chung .alert, thành công role=status + Continue Shopping', () => {
    const src = read('blocks/contact-form.liquid');
    expect(src).toMatch(/class="alert contact-form__summary"\s+role="alert"\s+tabindex="-1"/);
    expect(src).toMatch(/'contact\.check_fields' \| t: count: field_error_count/);
    expect(src).toMatch(/href="#ContactName"[\s\S]*href="#ContactEmail"[\s\S]*href="#ContactBody"/);
    expect(src).toMatch(/form\.errors contains 'form'[\s\S]*class="alert contact-form__alert" role="alert"/);
    expect(src).toMatch(/form\.posted_successfully\?[\s\S]*role="status" tabindex="-1" data-testid="contact-status"[\s\S]*'contact\.continue_shopping' \| t/);
    expect(src).toMatch(/value="\{\{ name_value \}\}"[\s\S]*value="\{\{ email_value \}\}"[\s\S]*\{\{ form\.body \}\}<\/textarea>/);
    for (const hook of ['data-contact-form', 'data-label-sending', 'data-contact-live', 'data-contact-summary', 'data-contact-summary-title', 'data-contact-summary-for="ContactName"']) {
      expect(src, hook).toContain(hook);
    }
  });

  test('AC3 contact-aside: aside có tên, không câu hỏi thì không aside, link chính sách từ shop.policies', () => {
    const s = schema('blocks/contact-aside.liquid');
    expect(s.presets).toBeUndefined();
    const src = read('blocks/contact-aside.liquid');
    expect(src).toMatch(/if items != blank -%\}\s*<aside[\s\S]*aria-labelledby="ContactAsideHeading"/);
    expect(src).toContain('id="ContactAsideHeading"');
    expect(src).toContain('shop.shipping_policy');
    expect(src).toContain('shop.refund_policy');
    expect(src).toContain('elsif request.design_mode');
    expect(src).not.toMatch(/name="faq-|<script/);
  });

  test('locale: đủ key contact, nhóm không trùng; schema label', () => {
    const raw = read('locales/en.default.json');
    for (const g of ['contact', 'page', 'blocks']) expect(raw.match(new RegExp(`^ {2}"${g}": \\{`, 'gm')), g).toHaveLength(1);
    const t = JSON.parse(raw);
    expect(t.contact.submit).toBe('Send Message');
    expect(t.contact.required_note).toBe('* Required fields');
    expect(t.contact.error_name).toBe('Enter your name.');
    expect(t.contact.error_email).toBe('Enter an email like name@example.com.');
    expect(t.contact.error_body).toBe('Enter a message.');
    expect(t.contact.error_form_title).toBe("Your message wasn't sent");
    expect(t.contact.continue_shopping).toBe('Continue Shopping');
    expect(t.contact.check_fields.other).toBe('Check {{ count }} fields');
    expect(t.blocks.contact_form.heading).toBe('Send Us A Message');
    expect(t.blocks.contact_aside.eyebrow).toBe('Questions and Answers');
    expect(t.page.empty_hint).toBeTruthy();
    const sc = JSON.parse(read('locales/en.default.schema.json'));
    expect(sc.general.contact_form).toBeTruthy();
    expect(sc.general.contact_aside).toBeTruthy();
    expect(sc.labels.contact_form_show_privacy_note).toBe('Show privacy note');
  });

  test('AC3 bố cục 1280: lưới 12 cột, form cột 1–7, aside 9–12 dính cách đỉnh 24 (+ header dính 80 = 104)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await fixture(page, CONTACT_FIXTURE);
    const grid = await box(page, '.contact');
    const main = await box(page, '.contact__main');
    const aside = await box(page, '.contact-aside');
    const col = (grid.width - 11 * 24) / 12;
    expect(Math.abs(main.width - (7 * col + 6 * 24))).toBeLessThanOrEqual(2);
    expect(Math.abs(aside.x - (grid.x + 8 * (col + 24)))).toBeLessThanOrEqual(2);
    expect(Math.abs(aside.width - (4 * col + 3 * 24))).toBeLessThanOrEqual(2);
    const sticky = await page.locator('.contact-aside').evaluate((el) => [getComputedStyle(el).position, getComputedStyle(el).insetBlockStart]);
    expect(sticky).toEqual(['sticky', '24px']);
    // Name, Email 2 cột; Message cả hàng; nút 52, câu hỏi 18/600, hàng ≥ 56
    const name = await box(page, '[data-f="name"]');
    const email = await box(page, '[data-f="email"]');
    const body = await box(page, '[data-f="body"]');
    expect(Math.abs(name.y - email.y)).toBeLessThanOrEqual(1);
    expect(Math.abs(body.width - main.width)).toBeLessThanOrEqual(2);
    expect((await box(page, '#ContactName')).height).toBeGreaterThanOrEqual(52);
    expect((await box(page, '[data-testid="contact-submit"]')).height).toBeGreaterThanOrEqual(52);
    const q = await page.locator('.contact-aside .faq-item__question').first().evaluate((el) => [getComputedStyle(el).fontSize, getComputedStyle(el).fontWeight]);
    expect(q).toEqual(['18px', '600']);
    expect((await box(page, '.contact-aside .faq-item__summary')).height).toBeGreaterThanOrEqual(56);
    expect(await page.locator('[data-testid="contact-errors"]').isVisible()).toBe(false);
    expect(await page.locator('#ContactNameError').isVisible()).toBe(false);
  });

  test('AC3, AC6 bố cục 360 và 768: 1 cột intro → form → aside; 768 Name/Email 2 cột; ô và nút 48; không cuộn ngang', async ({ page }) => {
    for (const width of [360, 768]) {
      await page.setViewportSize({ width, height: 900 });
      await fixture(page, CONTACT_FIXTURE);
      const main = await box(page, '.contact__main');
      const aside = await box(page, '.contact-aside');
      expect(aside.y, `${width}`).toBeGreaterThan(main.y + main.height - 1);
      const name = await box(page, '[data-f="name"]');
      const email = await box(page, '[data-f="email"]');
      if (width === 360) expect(email.y).toBeGreaterThan(name.y + name.height - 1);
      else expect(Math.abs(name.y - email.y)).toBeLessThanOrEqual(1);
      expect((await box(page, '#ContactEmail')).height).toBeGreaterThanOrEqual(48);
      const submit = await box(page, '[data-testid="contact-submit"]');
      expect(submit.height).toBeGreaterThanOrEqual(48);
      if (width === 360) expect(Math.abs(submit.width - main.width)).toBeLessThanOrEqual(2);
      else expect(submit.width).toBeGreaterThanOrEqual(200);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
  });

  test('AC1 cột đọc page: 720 căn giữa từ 768, full ở 360', async ({ page }) => {
    const body = `<section class="block-container"><div class="page-reading"><div class="page-title"><h1>Our Story</h1></div><div class="rte"><p>${'Text '.repeat(80)}</p><table><tr><td>${'x'.repeat(300)}</td></tr></table></div></div></section>`;
    for (const [width, expected] of [[360, 320], [768, 720], [1280, 720]]) {
      await page.setViewportSize({ width, height: 800 });
      await fixture(page, body);
      const col = await box(page, '.page-reading');
      expect(Math.abs(col.width - expected), `${width}`).toBeLessThanOrEqual(1);
      expect(Math.abs(col.x - (width - col.width) / 2), `${width}`).toBeLessThanOrEqual(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
  });
});

test.describe('ES1-T383 store', () => {
  const PAGE = env('TE383_PAGE_PATH');
  const CONTACT = env('TE383_CONTACT_PATH', 'TE407_CONTACT_PATH') ?? '/pages/contact';

  async function openContact(page: Page) {
    const res = await page.goto(CONTACT);
    test.fixme(res?.status() === 404, `thiếu page ${CONTACT} gán template contact`);
    await expectNotChallenged(page);
    test.fixme((await page.getByTestId('contact-page').count()) === 0, `page ${CONTACT} chưa gán template contact`);
  }

  test('AC3: thứ tự DOM breadcrumb → h1 → intro → form → aside; 1 h1; 3 trường; nút Send Message', async ({ page }) => {
    await openContact(page);
    await expect(page.locator('h1')).toHaveCount(1);
    const order = await page.evaluate(() => {
      const ids = ['breadcrumb', 'page-title-heading', 'page-content', 'contact-form', 'contact-aside'];
      const els = ids.map((id) => document.querySelector(`[data-testid="${id}"]`)).filter(Boolean) as Element[];
      return els.every((el, i) => i === 0 || (els[i - 1].compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0);
    });
    expect(order).toBe(true);
    const form = page.getByTestId('contact-form');
    await expect(form.locator('input:not([type="hidden"]), textarea')).toHaveCount(3);
    await expect(form.locator('[name="contact[phone]"], [name*="subject"]')).toHaveCount(0);
    await expect(page.getByTestId('contact-submit')).toHaveText('Send Message');
    await expect(page.getByTestId('contact-form-heading')).not.toHaveText('');
    await expect(page.locator('#ContactBody')).toHaveAttribute('aria-describedby', /ContactBodyHint/);
  });

  test('AC3, AC17: aside chỉ khi có câu hỏi; có thì câu đầu mở, mở được nhiều câu, link chính sách', async ({ page }) => {
    await openContact(page);
    const aside = page.getByTestId('contact-aside');
    if ((await aside.count()) === 0) {
      await expect(page.locator('aside')).toHaveCount(0);
      test.skip(true, 'store chưa cấu hình 5 câu FAQ (theme mới cài: không aside, AC17); phần còn lại cần store dev đã cấu hình');
    }
    await expect(aside).toHaveAttribute('aria-labelledby', 'ContactAsideHeading');
    const items = aside.getByTestId('faq-item');
    await expect(items.first()).toHaveAttribute('open', '');
    if ((await items.count()) > 1) {
      await items.nth(1).locator('summary').click();
      await expect(items.first()).toHaveAttribute('open', '');
      await expect(items.nth(1)).toHaveAttribute('open', '');
    }
    for (const link of await aside.getByTestId('contact-aside-policy').all()) {
      await expect(link).toHaveAttribute('href', /\/policies\//);
    }
  });

  test('AC6: axe 0 vi phạm, vùng chạm ô/nút 48 dưới 64rem, 52 từ 64rem, summary ≥ 56', async ({ page }) => {
    await openContact(page);
    const min = (page.viewportSize()?.width ?? 0) >= 1024 ? 52 : 48;
    for (const sel of ['#ContactName', '#ContactEmail', '[data-testid="contact-submit"]']) {
      expect((await page.locator(sel).boundingBox())!.height, sel).toBeGreaterThanOrEqual(min - 0.5);
    }
    const summary = page.locator('[data-testid="contact-aside"] .faq-item__summary').first();
    if (await summary.count()) expect((await summary.boundingBox())!.height).toBeGreaterThanOrEqual(56);
    await expectNotChallenged(page);
    const { violations } = await new AxeBuilder({ page }).include('[data-testid="contact-page"]').analyze();
    expect(violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
  });

  test('AC4 lỗi do Shopify trả (đường không JS): thiếu email → tóm tắt "Check 1 field" có link tới #ContactEmail, giữ dữ liệu', async ({ page }) => {
    await openContact(page);
    const form = page.getByTestId('contact-form');
    await form.locator('#ContactName').fill('QA ES1-T383');
    await form.locator('#ContactBody').fill('ES1-T383 thiếu email');
    // Bỏ validation trình duyệt để server trả form.errors (theme chưa có JS form liên hệ: submit là POST thường)
    await form.evaluate((f: HTMLFormElement) => (f.noValidate = true));
    const navigated = page
      .waitForEvent('framenavigated', { predicate: (f) => f === page.mainFrame(), timeout: 15_000 })
      .then(() => true, () => false);
    await form.getByTestId('contact-submit').click();
    const moved = await navigated;
    if (moved) await page.waitForLoadState('domcontentloaded');
    const captcha = (await page.locator('iframe[src*="hcaptcha"]').count()) > 0;
    test.skip(/^\/challenge/.test(new URL(page.url()).pathname) || (!moved && captcha), 'hCaptcha chặn submit tự động: chạy tay, ghi PR');
    expect(moved, 'submit không điều hướng và không có hCaptcha').toBe(true);
    await expectNotChallenged(page);
    const summary = page.getByTestId('contact-errors');
    await expect(summary).toBeVisible();
    await expect(summary).toHaveAttribute('role', 'alert');
    await expect(summary).toContainText('Check 1 field');
    await expect(summary.locator('a[href="#ContactEmail"]')).toBeVisible();
    await expect(page.locator('#ContactEmail')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByTestId('contact-email-error')).toBeVisible();
    await expect(page.locator('#ContactBody')).toHaveValue('ES1-T383 thiếu email');
    await expect(page.locator('#ContactName')).toHaveValue('QA ES1-T383');
  });

  test('AC1, AC2 page mặc định: breadcrumb Home / title, 1 h1, .rte, ảnh lazy, link gạch chân, không cuộn ngang', async ({ page }) => {
    test.skip(!PAGE, 'thiếu TE383_PAGE_PATH: page mặc định có bảng rộng, ảnh, link trong đoạn');
    await page.goto(PAGE!);
    await expectNotChallenged(page);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.getByTestId('breadcrumb-current')).toHaveText((await page.locator('h1').textContent())!.trim());
    const rte = page.getByTestId('page-content');
    await expect(rte).toHaveClass(/\brte\b/);
    for (const img of await rte.locator('img').all()) await expect(img).toHaveAttribute('loading', 'lazy');
    const link = rte.locator('p a').first();
    if (await link.count()) expect(await link.evaluate((el) => getComputedStyle(el).textDecorationLine)).toContain('underline');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    if ((page.viewportSize()?.width ?? 0) >= 768) {
      expect(Math.round((await page.getByTestId('page').boundingBox())!.width)).toBe(720);
    }
  });
});
