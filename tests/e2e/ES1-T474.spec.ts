// KHÔNG CHẮC: spec chưa chạy (phiên viết không có trình duyệt, preview, node_modules) → chờ CI. Trần byte contact-form.js do Tech Lead chốt: tạm 6 144 B.
// Ticket ES1-T474 (TE-21 AC4, AC5; docs/ui-spec/page.md §6 S2–S4), hook từ ES1-T383 (blocks/contact-form.liquid):
//   1. rời trường sai: câu lỗi hiện, aria-invalid, aria-describedby trỏ câu lỗi (textarea giữ #ContactBodyHint đầu); sửa đúng thì gỡ;
//   2. gửi có lỗi: chặn gửi, tóm tắt "Check {n} field(s)" + mục từng trường, focus tóm tắt;
//   3. gửi hợp lệ: nút aria-busy (giữ bề rộng), trường readonly, live "Sending your message…"; bấm lần 2 không gửi lại;
//   4. tải lại sau gửi: focus hộp thành công hoặc tóm tắt lỗi (không autofocus, không trong editor).
// Nạp: lazy-module.js import contact-form.js ở tương tác đầu với form; trạng thái lỗi trường / thành công nạp ngay.
// Nhóm tĩnh và trang giả (page.route, JS đọc từ repo) không gọi store. Nhóm storefront chạy trên PREVIEW_URL, không gửi thư thật:
//   TE383_CONTACT_PATH | TE407_CONTACT_PATH  page gán template contact (mặc định /pages/contact)
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T474.spec.ts
import { readFileSync } from 'node:fs';
import { test, expect, type Page } from './support/test';
import { gotoStore, expectNotChallenged } from './support/store-guard';
import { watchShopPay403 } from './support/console-guard';
import { env } from './support/store-data';

const read = (f: string) => readFileSync(f, 'utf8');
const size = (f: string) => Buffer.byteLength(read(`assets/${f}`));
const CEILING = 6144;
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|shopifysvc\.com|hcaptcha|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];
const desktopOnly = (name: string) => test.skip(name !== 'desktop', 'chạy 1 lần ở project desktop');
const CONTACT = env('TE383_CONTACT_PATH', 'TE407_CONTACT_PATH') ?? '/pages/contact';
const FIELDS = ['ContactName', 'ContactEmail', 'ContactBody'] as const;

function watchConsole(page: Page) {
  const errors: string[] = [];
  const isShopPay403 = watchShopPay403(page);
  page.on('console', (msg) => {
    if (msg.type() !== 'error' || isShopPay403(msg)) return;
    if (IGNORE_CONSOLE.some((r) => r.test(msg.text()) || r.test(msg.location().url))) return;
    errors.push(`${msg.text()} @ ${msg.location().url}`);
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

// ---------- Tĩnh ----------
test.describe('ES1-T474 tĩnh', () => {
  test.beforeEach(({}, ti) => desktopOnly(ti.project.name));

  test(`contact-form.js ≤ ${CEILING} B (≤ 8 192), không console/fetch/import tĩnh/style inline/autofocus`, () => {
    const js = read('assets/contact-form.js');
    expect(size('contact-form.js')).toBeLessThanOrEqual(CEILING);
    expect(js).not.toMatch(/console\.|fetch\(|\.style\b|autofocus|innerHTML|import\.meta/);
    expect(js).not.toMatch(/^\s*import\s/m);
    expect(js).not.toMatch(/customElements\.define|document\.createElement/);
    for (const hook of ['form[data-contact-form]', '[data-contact-summary]', '[data-contact-summary-for]', '[data-contact-summary-title]', '[data-contact-live]', 'labelSending', '"data-label-"', '.contact-form__status', 'aria-busy', 'readOnly', 'designMode']) {
      expect(js, hook).toContain(hook);
    }
    expect(size('lazy-module.js'), 'ES1-T316: lazy-module.js không đổi trần').toBeLessThanOrEqual(768);
  });

  test('contact-form.liquid: form có data-lazy-module + data-lazy-on="interaction"; script nạp ngay chỉ ở nhánh thành công và khi có lỗi trường; 1 lazy-module', () => {
    const src = read('blocks/contact-form.liquid');
    expect(src).toContain("assign contact_form_js = 'contact-form.js' | asset_url");
    const formTag = src.slice(src.indexOf("{%- form 'contact'"), src.indexOf('-%}', src.indexOf("{%- form 'contact'")));
    expect(formTag).toContain('data-lazy-module: contact_form_js');
    expect(formTag).toContain("data-lazy-on: 'interaction'");
    expect(formTag).toContain('data-contact-form');
    expect(src.match(/<script\b/g)).toHaveLength(3);
    expect(src.match(/<script src="\{\{ contact_form_js \}\}" type="module"><\/script>/g)).toHaveLength(2);
    expect(src.match(/<script src="\{\{ 'lazy-module\.js' \| asset_url \}\}" type="module"><\/script>/g)).toHaveLength(1);
    const success = src.slice(src.indexOf('{%- if form.posted_successfully? -%}'), src.indexOf('{%- else -%}', src.indexOf('{%- if form.posted_successfully? -%}')));
    expect(success).toContain('<script src="{{ contact_form_js }}"');
    expect(src).toMatch(/if field_error_count > 0 -%\}\s*<script src="\{\{ contact_form_js \}\}" type="module"><\/script>/);
    expect(src.indexOf("'lazy-module.js'")).toBeGreaterThan(src.indexOf('{%- endform -%}'));
    expect(src.replace(/\{% doc %\}[\s\S]*?\{% enddoc %\}/, '')).not.toMatch(/autofocus|novalidate/);
    expect(read('templates/page.contact.liquid')).not.toMatch(/<script/);
  });
});

// ---------- Trang giả: hành vi JS, không gọi store ----------
const ORIGIN = 'https://theme474.test';
type State = 'fresh' | 'errors' | 'success';

function contactHtml(state: State, { designMode = false } = {}) {
  const err = state === 'errors';
  const li = (id: string, text: string) => `<li data-contact-summary-for="${id}"${err && id === 'ContactEmail' ? '' : ' hidden'}><a href="#${id}" data-testid="contact-error-summary-link">${text}</a></li>`;
  const eager = '<script src="/assets/contact-form.js?v=1" type="module"></script>';
  const inner =
    state === 'success'
      ? `<div class="alert alert--success contact-form__status" role="status" tabindex="-1" data-testid="contact-status"><p>Thanks for contacting us</p><a class="button button--secondary" href="/collections/all" data-testid="contact-continue">Continue Shopping</a></div>${eager}`
      : `<h2>Send Us A Message</h2>
<div class="alert contact-form__summary" role="alert" tabindex="-1" data-contact-summary data-label-1="Check 1 field" data-label-2="Check 2 fields" data-label-3="Check 3 fields" data-testid="contact-errors"${err ? '' : ' hidden'}>
<p class="alert__title" data-contact-summary-title>${err ? 'Check 1 field' : ''}</p>
<ul role="list">${li('ContactName', 'Enter your name.')}${li('ContactEmail', 'Enter an email like name@example.com.')}${li('ContactBody', 'Enter a message.')}</ul></div>
<label for="ContactName">Name</label><input type="text" name="contact[name]" id="ContactName" value="${err ? 'QA' : ''}" required aria-required="true">
<p id="ContactNameError" data-testid="contact-name-error" hidden>Enter your name.</p>
<label for="ContactEmail">Email</label><input type="email" name="contact[email]" id="ContactEmail" value="${err ? 'abc' : ''}" required aria-required="true"${err ? ' aria-invalid="true" aria-describedby="ContactEmailError"' : ''}>
<p id="ContactEmailError" data-testid="contact-email-error"${err ? '' : ' hidden'}>Enter an email like name@example.com.</p>
<label for="ContactBody">Message</label><textarea name="contact[body]" id="ContactBody" required aria-required="true" aria-describedby="ContactBodyHint">${err ? 'Hello' : ''}</textarea>
<p id="ContactBodyHint">Include your order number.</p>
<p id="ContactBodyError" data-testid="contact-body-error" hidden>Enter a message.</p>
<button type="submit" class="button contact-form__submit" data-testid="contact-submit" style="padding:12px 24px"><span class="button__label">Send Message</span></button>
<div class="visually-hidden" role="status" data-contact-live data-testid="contact-live"></div>${err ? eager : ''}`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>ES1-T474</title>
<style>.button[aria-busy='true']{position:relative;color:transparent}.button[aria-busy='true']>*{visibility:hidden}</style>
${designMode ? '<script>window.Shopify = { designMode: true };</script>' : ''}</head><body>
<a href="/" data-testid="skip">Home</a><h1>Contact Us</h1>
<div class="contact-form" data-testid="contact-form-block">
<form method="post" action="/contact#ContactForm" id="ContactForm" accept-charset="UTF-8" class="contact-form__form" data-contact-form data-label-sending="Sending your message…" data-lazy-module="/assets/contact-form.js?v=1" data-lazy-on="interaction" data-testid="contact-form">
<input type="hidden" name="form_type" value="contact"><input type="hidden" name="utf8" value="✓">
${inner}
</form>
<script src="/assets/lazy-module.js?v=1" type="module"></script>
</div></body></html>`;
}

type Hits = { module: number; posts: number; release: () => void };

async function openFake(page: Page, state: State = 'fresh', opts: { designMode?: boolean; holdModule?: boolean } = {}): Promise<Hits> {
  let release = () => {};
  const gate = opts.holdModule ? new Promise<void>((r) => (release = r)) : Promise.resolve();
  const hits: Hits = { module: 0, posts: 0, release: () => release() };
  await page.route(`${ORIGIN}/**`, async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    if (url.pathname.startsWith('/assets/')) {
      const file = url.pathname.slice('/assets/'.length);
      if (!['contact-form.js', 'lazy-module.js'].includes(file)) return route.fulfill({ status: 404, body: '' });
      if (file === 'contact-form.js') {
        hits.module++;
        await gate;
      }
      return route.fulfill({ body: read(`assets/${file}`), contentType: 'text/javascript' });
    }
    if (req.method() === 'POST' && url.pathname === '/contact') {
      hits.posts++;
      return; // treo: giữ trạng thái đang gửi
    }
    return route.fulfill({ body: contactHtml(state, opts), contentType: 'text/html; charset=utf-8' });
  });
  // Module script nạp ngay (errors, success) bị giữ thì load cũng chờ: chỉ chờ HTML tới. fresh: chờ load để lazy-module đã gắn listener
  await page.goto(`${ORIGIN}/pages/contact`, { waitUntil: opts.holdModule && state !== 'fresh' ? 'commit' : 'load' });
  await page.getByTestId('contact-form').waitFor({ state: 'attached' });
  return hits;
}

/** Tương tác đầu (focusin) để lazy-module nạp contact-form.js, chờ module chạy xong. */
async function upgrade(page: Page, hits: Hits) {
  await page.locator('#ContactName').focus();
  await expect.poll(() => hits.module).toBe(1);
  await page.waitForFunction(() => performance.getEntriesByType('resource').some((e) => e.name.includes('contact-form.js')));
  await page.waitForTimeout(100);
}

test.describe('ES1-T474 trang giả', () => {
  test.beforeEach(({}, ti) => desktopOnly(ti.project.name));

  test('TC-01 tải trang: chưa nạp contact-form.js, không focus gì; tương tác đầu với form mới nạp, 1 lần', async ({ page }) => {
    const errors = watchConsole(page);
    const hits = await openFake(page);
    await page.waitForTimeout(400);
    expect(hits.module).toBe(0);
    expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
    await upgrade(page, hits);
    await page.locator('#ContactEmail').focus();
    await page.waitForTimeout(200);
    expect(hits.module).toBe(1);
    expect(errors).toEqual([]);
  });

  test('TC-02 AC4 rời trường email sai: câu lỗi, aria-invalid, describedby; gõ đúng thì gỡ ngay', async ({ page }) => {
    const errors = watchConsole(page);
    const hits = await openFake(page);
    await upgrade(page, hits);
    const email = page.locator('#ContactEmail');
    await email.fill('abc');
    await page.keyboard.press('Tab');
    await expect(email).toHaveAttribute('aria-invalid', 'true');
    await expect(email).toHaveAttribute('aria-describedby', 'ContactEmailError');
    await expect(page.getByTestId('contact-email-error')).toBeVisible();
    await expect(page.getByTestId('contact-errors'), 'tóm tắt chỉ mở khi gửi').toBeHidden();
    await email.focus();
    await page.keyboard.type('@example.com');
    await expect(email).not.toHaveAttribute('aria-invalid', /.*/);
    await expect(email).not.toHaveAttribute('aria-describedby', /.*/);
    await expect(page.getByTestId('contact-email-error')).toBeHidden();
    expect(errors).toEqual([]);
  });

  test('TC-03 AC4 rời trường rỗng/khoảng trắng: name lỗi; textarea giữ #ContactBodyHint đầu, thêm/gỡ #ContactBodyError', async ({ page }) => {
    const hits = await openFake(page);
    await upgrade(page, hits);
    const name = page.locator('#ContactName');
    await name.fill('   ');
    await page.keyboard.press('Tab');
    await expect(name).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByTestId('contact-name-error')).toBeVisible();
    const body = page.locator('#ContactBody');
    await body.focus();
    await page.keyboard.press('Tab');
    await expect(body).toHaveAttribute('aria-describedby', 'ContactBodyHint ContactBodyError');
    await expect(body).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByTestId('contact-body-error')).toBeVisible();
    await body.fill('Order #1001');
    await expect(body).toHaveAttribute('aria-describedby', 'ContactBodyHint');
    await expect(page.getByTestId('contact-body-error')).toBeHidden();
  });

  test('TC-04 AC4 gửi rỗng: không POST, tóm tắt "Check 3 fields" nhận focus, 3 mục; sửa 1 trường → "Check 2 fields"', async ({ page }) => {
    const errors = watchConsole(page);
    const hits = await openFake(page);
    await upgrade(page, hits);
    await page.getByTestId('contact-submit').click();
    const summary = page.getByTestId('contact-errors');
    await expect(summary).toBeVisible();
    await expect(summary).toBeFocused();
    await expect(summary).toContainText('Check 3 fields');
    await expect(summary.locator('li:not([hidden])')).toHaveCount(3);
    for (const id of FIELDS) {
      await expect(page.locator(`#${id}`)).toHaveAttribute('aria-invalid', 'true');
      await expect(page.locator(`#${id}Error`)).toBeVisible();
    }
    await page.locator('#ContactName').fill('QA');
    await expect(summary.locator('[data-contact-summary-for="ContactName"]')).toBeHidden();
    await expect(summary).toContainText('Check 2 fields');
    await page.waitForTimeout(200);
    expect(hits.posts).toBe(0);
    expect(errors).toEqual([]);
  });

  test('TC-05 AC4 chỉ name toàn khoảng trắng (trình duyệt cho qua required): vẫn chặn, "Check 1 field", focus tóm tắt', async ({ page }) => {
    const hits = await openFake(page);
    await upgrade(page, hits);
    await page.locator('#ContactName').fill('   ');
    await page.locator('#ContactEmail').fill('qa@example.com');
    await page.locator('#ContactBody').fill('Hello');
    await page.locator('#ContactBody').press('Tab');
    await page.getByTestId('contact-submit').click();
    const summary = page.getByTestId('contact-errors');
    await expect(summary).toBeFocused();
    await expect(summary).toContainText('Check 1 field');
    await expect(summary.locator('li:not([hidden])')).toHaveCount(1);
    expect(hits.posts).toBe(0);
  });

  test('TC-06 AC5 gửi hợp lệ: 1 POST, nút aria-busy giữ bề rộng, 3 trường readonly, live "Sending your message…"; bấm lần 2 không gửi lại', async ({ page }) => {
    const errors = watchConsole(page);
    const hits = await openFake(page);
    await upgrade(page, hits);
    await page.locator('#ContactName').fill('QA');
    await page.locator('#ContactEmail').fill('qa@example.com');
    await page.locator('#ContactBody').fill('Hello');
    const submit = page.getByTestId('contact-submit');
    const w = (await submit.boundingBox())!.width;
    await submit.click();
    await expect(submit).toHaveAttribute('aria-busy', 'true');
    expect(Math.abs((await submit.boundingBox())!.width - w)).toBeLessThanOrEqual(1);
    for (const id of FIELDS) await expect(page.locator(`#${id}`)).toHaveAttribute('readonly', '');
    await expect(page.getByTestId('contact-live')).toHaveText('Sending your message…');
    await expect(page.getByTestId('contact-errors')).toBeHidden();
    await expect.poll(() => hits.posts).toBe(1);
    await submit.click({ force: true });
    await page.waitForTimeout(300);
    expect(hits.posts, 'không gửi 2 thư').toBe(1);
    expect(errors).toEqual([]);
  });

  test('TC-07 AC5 quay lại từ bfcache (pageshow persisted): bỏ aria-busy, readonly, live rỗng', async ({ page }) => {
    const hits = await openFake(page);
    await upgrade(page, hits);
    await page.locator('#ContactName').fill('QA');
    await page.locator('#ContactEmail').fill('qa@example.com');
    await page.locator('#ContactBody').fill('Hello');
    // Chặn điều hướng để giữ trang; trạng thái gửi đặt bởi submit event
    await page.evaluate(() => document.querySelector('form')!.addEventListener('submit', (e) => e.preventDefault()));
    await page.getByTestId('contact-submit').click();
    await expect(page.getByTestId('contact-submit')).toHaveAttribute('aria-busy', 'true');
    await page.evaluate(() => dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
    await expect(page.getByTestId('contact-submit')).not.toHaveAttribute('aria-busy', /.*/);
    for (const id of FIELDS) await expect(page.locator(`#${id}`)).not.toHaveAttribute('readonly', /.*/);
    await expect(page.getByTestId('contact-live')).toHaveText('');
  });

  test('TC-08 form novalidate (như không JS, ES1-T386 TC-10): gửi rỗng vẫn POST để Shopify kiểm', async ({ page }) => {
    const hits = await openFake(page);
    await upgrade(page, hits);
    await page.getByTestId('contact-form').evaluate((f: HTMLFormElement) => (f.noValidate = true));
    await page.getByTestId('contact-submit').click();
    await expect.poll(() => hits.posts).toBe(1);
    await expect(page.getByTestId('contact-errors')).toBeHidden();
  });

  test('TC-09 module nạp trễ: trường đã rời với giá trị sai hiện lỗi khi module chạy; trường đang focus không bị đánh lỗi', async ({ page }) => {
    const hits = await openFake(page, 'fresh', { holdModule: true });
    await page.locator('#ContactEmail').fill('abc');
    await page.locator('#ContactName').focus();
    await expect.poll(() => hits.module).toBe(1);
    hits.release();
    await expect(page.locator('#ContactEmail')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByTestId('contact-email-error')).toBeVisible();
    await expect(page.locator('#ContactName')).not.toHaveAttribute('aria-invalid', /.*/);
    await expect(page.locator('#ContactName')).toBeFocused();
  });

  test('TC-10 AC4 tải lại sau gửi có lỗi trường: nạp ngay (không tương tác), focus tóm tắt; không autofocus', async ({ page }) => {
    const errors = watchConsole(page);
    const hits = await openFake(page, 'errors');
    await expect(page.getByTestId('contact-errors')).toBeFocused();
    expect(hits.module).toBe(1);
    expect(await page.locator('[autofocus]').count()).toBe(0);
    // Liquid đã đánh lỗi email; module không gỡ
    await expect(page.locator('#ContactEmail')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByTestId('contact-errors')).toContainText('Check 1 field');
    expect(errors).toEqual([]);
  });

  test('TC-11 AC5 tải lại sau gửi thành công: hộp role=status nhận focus', async ({ page }) => {
    const errors = watchConsole(page);
    await openFake(page, 'success');
    const status = page.getByTestId('contact-status');
    await expect(status).toBeFocused();
    await expect(status).toHaveAttribute('role', 'status');
    expect(errors).toEqual([]);
  });

  test('TC-12 theme editor (Shopify.designMode): không tự focus khi tải', async ({ page }) => {
    const hits = await openFake(page, 'success', { designMode: true });
    await expect.poll(() => hits.module).toBe(1);
    await page.waitForTimeout(300);
    await expect(page.getByTestId('contact-status')).not.toBeFocused();
  });

  test('TC-13 người dùng đã focus chỗ khác trước khi module chạy: không giật focus', async ({ page }) => {
    const hits = await openFake(page, 'errors', { holdModule: true });
    await page.getByTestId('skip').focus();
    hits.release();
    await page.waitForFunction(() => performance.getEntriesByType('resource').some((e) => e.name.includes('contact-form.js')));
    await page.waitForTimeout(200);
    await expect(page.getByTestId('skip')).toBeFocused();
  });
});

// ---------- Storefront (PREVIEW_URL): không gửi thư thật ----------
async function openContact(page: Page) {
  test.skip(!process.env.PREVIEW_URL && !process.env.STORE_ORIGIN, 'thiếu PREVIEW_URL');
  await gotoStore(page, CONTACT);
  await expectNotChallenged(page);
  test.fixme((await page.getByTestId('contact-form').count()) === 0, `ES1-T383: page ${CONTACT} chưa gán template contact`);
}

async function upgradeStore(page: Page) {
  const loaded = page.waitForResponse((r) => /\/assets\/contact-form\.js/.test(r.url()));
  await page.locator('#ContactName').focus();
  await loaded;
  await page.waitForTimeout(200);
}

test.describe('ES1-T474 storefront', () => {
  test('TC-S1 contact: chưa nạp contact-form.js khi tải; rời trường sai hiện lỗi; gửi có lỗi thì tóm tắt nhận focus, không điều hướng', async ({ page }) => {
    const errors = watchConsole(page);
    const requested: string[] = [];
    page.on('request', (r) => requested.push(r.url()));
    await openContact(page);
    expect(requested.some((u) => /\/assets\/contact-form\.js/.test(u)), 'nạp lười theo tương tác').toBe(false);
    await upgradeStore(page);
    const email = page.locator('#ContactEmail');
    await email.fill('abc');
    await page.keyboard.press('Tab');
    await expect(email).toHaveAttribute('aria-invalid', 'true');
    await expect(email).toHaveAttribute('aria-describedby', /ContactEmailError/);
    await expect(page.getByTestId('contact-email-error')).toBeVisible();
    await page.locator('#ContactName').fill('');
    await page.locator('#ContactBody').fill('');
    const url = page.url();
    await page.getByTestId('contact-submit').click();
    const summary = page.getByTestId('contact-errors');
    await expect(summary).toBeFocused();
    await expect(summary).toContainText('Check 3 fields');
    expect(page.url()).toBe(url);
    expect(errors).toEqual([]);
  });

  test('TC-S2 contact: gửi hợp lệ (POST bị giữ, không tới Shopify) → aria-busy giữ bề rộng, readonly, live', async ({ page }) => {
    const errors = watchConsole(page);
    await openContact(page);
    await upgradeStore(page);
    let posted = 0;
    await page.route(/\/contact(\?|#|$)/, (route) => {
      if (route.request().method() !== 'POST') return route.continue();
      posted++; // treo, không gửi thư thật
    });
    await page.locator('#ContactName').fill('QA ES1-T474');
    await page.locator('#ContactEmail').fill('qa+es1-t474@example.com');
    await page.locator('#ContactBody').fill('ES1-T474 TC-S2');
    const submit = page.getByTestId('contact-submit');
    const w = (await submit.boundingBox())!.width;
    await submit.click();
    await expect(submit).toHaveAttribute('aria-busy', 'true');
    expect(Math.abs((await submit.boundingBox())!.width - w)).toBeLessThanOrEqual(1);
    for (const id of FIELDS) await expect(page.locator(`#${id}`)).toHaveAttribute('readonly', '');
    await expect(page.getByTestId('contact-live')).toHaveText('Sending your message…');
    // hCaptcha của Shopify có thể chặn submit trước khi POST: ghi nhận, không tính lỗi theme
    if (!posted) test.info().annotations.push({ type: 'server', description: 'chưa thấy POST (hCaptcha giữ submit?)' });
    expect(errors).toEqual([]);
  });
});
