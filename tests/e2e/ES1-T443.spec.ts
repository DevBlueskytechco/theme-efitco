// KHÔNG CHẮC: spec chưa chạy (phiên viết không có trình duyệt, preview, node_modules) → chờ CI.
// Ticket ES1-T443 (TE-21 AC11, docs/ui-spec/password.md §5 "Hiện mật khẩu", S4 "Đang gửi", §8 ≤ 1 KB; hook FE ES1-T384):
// - assets/password-page.js gỡ hidden của button[data-password-toggle]; bấm → #PasswordInput đổi password ↔ text,
//   aria-pressed false ↔ true, aria-label theo data-label-show / data-label-hide (thiếu nhãn thì giữ nhãn cũ).
// - submit hợp lệ (password-submit, password-newsletter-submit): submitter aria-busy="true" (spinner CSS .button[aria-busy]),
//   submit lần 2 khi đang gửi bị chặn; quay lại từ bfcache gỡ aria-busy. Không JS: nút mắt ẩn, form vẫn gửi.
// Nhóm tĩnh và trang giả (page.route, JS đọc từ repo) không gọi store. Nhóm storefront chạy trên PREVIEW_URL /password
// (context mới, chưa mở khoá; skip khi store dev không bật mật khẩu).
// Chạy: PREVIEW_URL=... npx playwright test tests/e2e/ES1-T443.spec.ts
import { readFileSync } from 'node:fs';
import { test, expect, type Page } from './support/test';
import { newStoreContext } from './support/store-noise';
import { expectNotChallenged } from './support/store-guard';
import { watchShopPay403 } from './support/console-guard';

const read = (f: string) => readFileSync(f, 'utf8');
const JS = 'assets/password-page.js';
const BLOCK = 'blocks/password-hero.liquid';
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|shopifysvc\.com|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];
const desktopOnly = (name: string) => test.skip(name !== 'desktop', 'chạy 1 lần ở project desktop');

function watchConsole(page: Page) {
  const errors: string[] = [];
  const isShopPay403 = watchShopPay403(page);
  page.on('console', (msg) => {
    if (msg.type() !== 'error' || isShopPay403(msg)) return;
    if (IGNORE_CONSOLE.some((r) => r.test(msg.text()) || r.test(msg.location().url))) return;
    // /password của store khoá trả 401 cho tài liệu (sổ 10/11): log mạng của chính tài liệu, không phải lỗi theme
    if (/status of 401/.test(msg.text()) && /^https?:\/\/[^/]+\/password(\?|$)/.test(msg.location().url)) return;
    errors.push(`${msg.text()} @ ${msg.location().url}`);
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

// ---------- Tĩnh (contract với markup FE ES1-T384) ----------
test.describe('ES1-T443 tĩnh', () => {
  test.beforeEach(({}, ti) => desktopOnly(ti.project.name));

  test('password-page.js ≤ 1 024 B (password.md §8), không console/fetch/import/style inline', () => {
    const js = read(JS);
    expect(Buffer.byteLength(js)).toBeLessThanOrEqual(1024);
    expect(js).toContain('[data-password-toggle]');
    expect(js).toContain('aria-controls');
    expect(js).toMatch(/labelHide/);
    expect(js).toMatch(/labelShow/);
    expect(js).toContain('aria-busy');
    expect(js).not.toMatch(/console\.|fetch\(|import\(|\.style\b|innerHTML|customElements/);
    expect(js).not.toMatch(/^\s*import\s/m);
  });

  test('password-hero.liquid: đúng 1 thẻ script password-page.js; hook FE giữ nguyên', () => {
    const src = read(BLOCK);
    expect(src.match(/<script/g)).toHaveLength(1);
    expect(src).toContain(`<script src="{{ 'password-page.js' | asset_url }}" type="module"></script>`);
    const toggle = src.match(/<button\s[^>]*data-password-toggle[^>]*>/)?.[0] ?? '';
    for (const hook of [
      'type="button"',
      'aria-pressed="false"',
      'aria-controls="PasswordInput"',
      'data-password-toggle',
      `data-label-show="{{ 'password.show_password' | t }}"`,
      `data-label-hide="{{ 'password.hide_password' | t }}"`,
      'data-testid="password-toggle"',
    ]) {
      expect(toggle, hook).toContain(hook);
    }
    expect(toggle).toMatch(/\n\s*hidden\s*>/);
    expect(src).toContain('id="PasswordInput"');
    expect(src).toMatch(/class="button password-hero__submit" type="submit" data-testid="password-newsletter-submit"/);
    expect(src).toMatch(/class="button password-hero__enter" type="submit" data-testid="password-submit"/);
    expect(read('layout/password.liquid')).not.toMatch(/<script/);
    expect(read('templates/password.liquid')).not.toMatch(/<script/);
  });

  test('locale có nhãn show/hide; CSS spinner .button[aria-busy] và [hidden] của nút mắt có sẵn', () => {
    const t = JSON.parse(read('locales/en.default.json'));
    expect(t.password.show_password).toBe('Show password');
    expect(t.password.hide_password).toBe('Hide password');
    expect(read('assets/base.css')).toContain(".button[aria-busy='true']::after");
    expect(read('assets/aux.css')).toMatch(/\.password-hero__toggle\[hidden\] \{\s*display: none;/);
  });
});

// ---------- Trang giả: hành vi JS, không gọi store ----------
const ORIGIN = 'https://theme443.test';

function fakeHtml({ labels = true } = {}) {
  const label = labels ? 'data-label-show="Show password" data-label-hide="Hide password"' : 'data-label-show="Show password"';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>ES1-T443</title></head><body class="template-password"><main>
<div class="password-hero" data-testid="password-hero">
<form method="post" action="/contact#PasswordNewsletter" id="PasswordNewsletter" data-testid="password-newsletter">
<label for="PasswordNewsletterEmail">Email</label>
<input id="PasswordNewsletterEmail" type="email" name="contact[email]" required data-testid="password-newsletter-email">
<button class="button password-hero__submit" type="submit" data-testid="password-newsletter-submit"><span>Notify Me</span></button>
</form>
<form method="post" action="/password" id="PasswordForm">
<details data-testid="password-details" open><summary>Enter Using Password</summary>
<label for="PasswordInput">Password</label>
<div><input id="PasswordInput" type="password" name="password" autocomplete="current-password" required data-testid="password-input">
<button type="button" aria-pressed="false" aria-controls="PasswordInput" aria-label="Show password" data-password-toggle ${label} data-testid="password-toggle" hidden>eye</button></div>
<button class="button password-hero__enter" type="submit" data-testid="password-submit">Enter Store</button>
</details></form>
<script src="/assets/password-page.js" type="module"></script>
</div></main></body></html>`;
}

const SENT = '<!doctype html><html lang="en"><title>Sent</title><h1>Sent</h1></html>';

async function openFake(page: Page, options?: { labels?: boolean; delay?: number; js?: boolean }) {
  const posts: string[] = [];
  await page.route(`${ORIGIN}/**`, async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    if (url.pathname === '/assets/password-page.js') return route.fulfill({ body: read(JS), contentType: 'text/javascript' });
    if (req.method() === 'POST') {
      posts.push(url.pathname);
      await new Promise((r) => setTimeout(r, options?.delay ?? 1500));
      return route.fulfill({ body: SENT, contentType: 'text/html' });
    }
    return route.fulfill({ body: fakeHtml(options), contentType: 'text/html; charset=utf-8' });
  });
  await page.goto(`${ORIGIN}/password`);
  if (options?.js !== false) await expect(page.getByTestId('password-toggle')).toBeVisible();
  return posts;
}

test.describe('ES1-T443 trang giả', () => {
  test.beforeEach(({}, ti) => desktopOnly(ti.project.name));

  test('TC-01 tải trang: nút mắt hiện, ô vẫn type=password, aria-pressed=false', async ({ page }) => {
    const errors = watchConsole(page);
    await openFake(page);
    await expect(page.getByTestId('password-input')).toHaveAttribute('type', 'password');
    await expect(page.getByTestId('password-toggle')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByTestId('password-toggle')).toHaveAccessibleName('Show password');
    expect(errors).toEqual([]);
  });

  test('TC-02 bấm: hiện chữ, aria-pressed=true, nhãn "Hide password"; bấm lại về như cũ; giá trị giữ nguyên', async ({ page }) => {
    const errors = watchConsole(page);
    await openFake(page);
    const input = page.getByTestId('password-input');
    const toggle = page.getByTestId('password-toggle');
    await input.fill('es1-t443');
    await toggle.click();
    await expect(input).toHaveAttribute('type', 'text');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(toggle).toHaveAccessibleName('Hide password');
    await expect(toggle).toBeFocused();
    await toggle.click();
    await expect(input).toHaveAttribute('type', 'password');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(toggle).toHaveAccessibleName('Show password');
    await expect(input).toHaveValue('es1-t443');
    expect(errors).toEqual([]);
  });

  test('TC-03 chỉ bàn phím: Tab tới nút mắt, Space và Enter đổi trạng thái, không submit form', async ({ page }) => {
    const posts = await openFake(page);
    await page.getByTestId('password-input').focus();
    await page.keyboard.press('Tab');
    const toggle = page.getByTestId('password-toggle');
    await expect(toggle).toBeFocused();
    await page.keyboard.press('Space');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(posts).toEqual([]);
  });

  test('TC-04 thiếu data-label-hide: nhãn giữ "Show password", không "undefined", không lỗi console', async ({ page }) => {
    const errors = watchConsole(page);
    await openFake(page, { labels: false });
    const toggle = page.getByTestId('password-toggle');
    await toggle.click();
    await expect(page.getByTestId('password-input')).toHaveAttribute('type', 'text');
    await expect(toggle).toHaveAttribute('aria-label', 'Show password');
    expect(errors).toEqual([]);
  });

  test('TC-05 aria-controls trỏ id không có: bấm không lỗi, không đổi aria-pressed', async ({ page }) => {
    const errors = watchConsole(page);
    await openFake(page);
    const toggle = page.getByTestId('password-toggle');
    await toggle.evaluate((b) => b.setAttribute('aria-controls', 'Khong-co'));
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(errors).toEqual([]);
  });

  test('TC-06 submit mật khẩu: password-submit aria-busy=true khi đang gửi; bấm lần 2 không gửi thêm', async ({ page }) => {
    const errors = watchConsole(page);
    const posts = await openFake(page, { delay: 2000 });
    await page.getByTestId('password-input').fill('es1-t443');
    const submit = page.getByTestId('password-submit');
    await submit.click();
    await expect(submit).toHaveAttribute('aria-busy', 'true');
    // Không có chặn thì Chrome huỷ POST đầu và gửi POST thứ 2
    await submit.click({ timeout: 1000 }).catch(() => {});
    await expect(page.locator('h1')).toHaveText('Sent', { timeout: 10_000 });
    expect(posts).toEqual(['/password']);
    expect(errors).toEqual([]);
  });

  test('TC-07 newsletter: Enter trong ô email đặt aria-busy cho password-newsletter-submit; ô mật khẩu không bị đụng', async ({ page }) => {
    const posts = await openFake(page, { delay: 2000 });
    await page.getByTestId('password-newsletter-email').fill('qa@example.com');
    await page.getByTestId('password-newsletter-email').press('Enter');
    await expect(page.getByTestId('password-newsletter-submit')).toHaveAttribute('aria-busy', 'true');
    await expect(page.getByTestId('password-submit')).not.toHaveAttribute('aria-busy');
    await expect.poll(() => posts).toEqual(['/contact']);
  });

  test('TC-08 email trống/sai: trình duyệt chặn submit, không aria-busy, không POST', async ({ page }) => {
    const posts = await openFake(page);
    await page.getByTestId('password-newsletter-submit').click();
    await page.getByTestId('password-newsletter-email').fill('sai-email');
    await page.getByTestId('password-newsletter-submit').click();
    await page.waitForTimeout(300);
    await expect(page.getByTestId('password-newsletter-submit')).not.toHaveAttribute('aria-busy');
    expect(posts).toEqual([]);
  });

  test('TC-09 pageshow persisted (quay lại từ bfcache): gỡ aria-busy, nút gửi lại được', async ({ page }) => {
    await openFake(page);
    const submit = page.getByTestId('password-submit');
    await submit.evaluate((b) => b.setAttribute('aria-busy', 'true'));
    await page.evaluate(() => dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
    await expect(submit).not.toHaveAttribute('aria-busy');
  });

  test('TC-10 editor render lại block (shopify:section:load): nút mắt mới được gỡ hidden, 1 lần bấm = 1 lần đổi', async ({ page }) => {
    await openFake(page);
    await page.evaluate(() => {
      const old = document.querySelector('[data-testid="password-hero"]')!;
      old.outerHTML = old.outerHTML.replace('data-testid="password-toggle"', 'data-testid="password-toggle" hidden').replace(/aria-pressed="true"/, 'aria-pressed="false"');
      document.dispatchEvent(new CustomEvent('shopify:section:load', { bubbles: true }));
    });
    const toggle = page.getByTestId('password-toggle');
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(page.getByTestId('password-input')).toHaveAttribute('type', 'text');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  });
});

test.describe('ES1-T443 trang giả không JS', () => {
  test.use({ javaScriptEnabled: false });
  test.beforeEach(({}, ti) => desktopOnly(ti.project.name));

  test('TC-11 không JS: nút mắt ẩn, form mật khẩu vẫn gửi', async ({ page }) => {
    const posts = await openFake(page, { js: false, delay: 0 });
    await expect(page.getByTestId('password-toggle')).toBeHidden();
    await expect(page.getByTestId('password-input')).toHaveAttribute('type', 'password');
    await page.getByTestId('password-input').fill('es1-t443');
    await page.getByTestId('password-submit').click();
    await expect(page.locator('h1')).toHaveText('Sent', { timeout: 10_000 });
    expect(posts).toEqual(['/password']);
  });
});

// ---------- Storefront (PREVIEW_URL /password, context chưa mở khoá) ----------
test.describe('ES1-T443 storefront password', () => {
  test.beforeEach(({}, ti) => desktopOnly(ti.project.name));

  test('TC-12 nút mắt hiện, vùng chạm ≥ 44 ở 360, đổi type/aria-pressed/nhãn; sai mật khẩu: aria-busy lúc gửi, trang lỗi không treo spinner; 0 lỗi console', async ({ browser }) => {
    const preview = process.env.PREVIEW_URL;
    test.skip(!preview, 'thiếu PREVIEW_URL');
    const context = await newStoreContext(browser, { viewport: { width: 360, height: 800 } });
    const page = await context.newPage();
    const errors = watchConsole(page);
    const url = new URL(preview!);
    await page.goto(`${url.origin}/password${url.search}`);
    test.skip(!new URL(page.url()).pathname.startsWith('/password'), 'store dev không bật mật khẩu');
    await expectNotChallenged(page);
    const details = page.getByTestId('password-details');
    if ((await details.getAttribute('open')) === null) await details.locator('summary').click();
    const input = page.getByTestId('password-input');
    const toggle = page.getByTestId('password-toggle');
    await expect(toggle).toBeVisible();
    const box = (await toggle.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
    await input.fill('es1-t443-sai');
    await toggle.click();
    await expect(input).toHaveAttribute('type', 'text');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(toggle).toHaveAccessibleName('Hide password');
    await toggle.click();
    await expect(input).toHaveAttribute('type', 'password');
    await expect(toggle).toHaveAccessibleName('Show password');
    // Ghi aria-busy ngay sau listener của password-page.js (listener window đăng ký sau chạy sau), giữ qua lần tải lại
    await page.evaluate(() => addEventListener('submit', (e) => sessionStorage.setItem('es1-t443-busy', String(e.submitter?.getAttribute('aria-busy')))));
    await Promise.all([page.waitForLoadState('load'), page.getByTestId('password-submit').click()]);
    await expect(page.getByTestId('password-error')).toBeVisible();
    expect(await page.evaluate(() => sessionStorage.getItem('es1-t443-busy'))).toBe('true');
    await expect(page.getByTestId('password-submit')).not.toHaveAttribute('aria-busy');
    await expect(page.getByTestId('password-toggle')).toBeVisible();
    await expect(page.getByTestId('password-toggle')).toHaveAttribute('aria-pressed', 'false');
    expect(errors).toEqual([]);
    await context.close();
  });
});
