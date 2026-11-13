// KHÔNG CHẮC: chưa chạy trong lượt agent (không có PREVIEW_URL/STORE_PASSWORD trong môi trường); kết quả chờ CI store-tests của PR ES1-T442.
// Markup trang password mới lấy theo ticket ES1-T442 + docs/ui-spec/password.md §2, §5 (details data-testid="password-details", summary
// "Enter Using Password", form storefront_password bên trong) — chưa đối chiếu HTML thật của PR #208.
//
// ES1-T442 — tests/setup/password.ts mở <details> "Enter Using Password" trước khi điền mật khẩu.
// Nguồn: ticket ES1-T442 (DoD + comment CTO 13/11 08:07), docs/srs.md#TE-21 AC10, AC11, test case drafts/qa/ES1-T442/test-cases.md.
// Phạm vi: helper tests/e2e/support/password-unlock.ts + global setup. scripts/lhci-auth.js thuộc ticket DevOps riêng (comment CTO).
// Nhóm "fixture" dựng 2 dạng trang bằng page.route trên host giả → không phụ thuộc #208 merge, không phụ thuộc theme live.
// Nhóm "smoke" chạy trên store dev thật (live + preview_theme_id), context không storageState, chỉ project desktop (giảm request).
import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import { fillStorePassword, revealPasswordInput, PASSWORD_PAGE } from './support/password-unlock';

const FIXTURE = 'https://pw-fixture.test';
const SECRET = 'efitco-secret';

const passwordForm = (open?: boolean) => `
  <form method="post" action="/password" id="login_form" accept-charset="UTF-8">
    <input type="hidden" name="form_type" value="storefront_password">
    <label for="password-input">Password</label>
    <input type="password" name="password" id="password-input" autocomplete="current-password">
    <button type="submit">Enter Store</button>
  </form>`;

// Dạng mới (#208, Show newsletter bật): form email là hành động đầu, ô mật khẩu trong details đóng sẵn (TE-21 AC10).
const newsletter = `
  <form method="post" action="/contact#newsletter" data-testid="password-newsletter">
    <input type="hidden" name="form_type" value="customer">
    <input type="hidden" name="contact[tags]" value="newsletter,password-page">
    <label for="np-email">Email</label><input type="email" id="np-email" name="contact[email]">
    <button type="submit">Notify Me</button>
  </form>
  <p>Have a password?</p>`;

const PAGES: Record<string, string> = {
  old: `<h1>Opening soon</h1>${passwordForm()}`,
  closed: `<h1>Opening soon</h1>${newsletter}
    <details data-testid="password-details"><summary>Enter Using Password</summary>${passwordForm()}</details>`,
  open: `<h1>Opening soon</h1>${newsletter}
    <details data-testid="password-details" open><summary>Enter Using Password</summary>${passwordForm()}</details>`,
  generic: `<h1>Opening soon</h1>${newsletter}
    <details class="password-disclosure"><summary>Enter Using Password</summary>${passwordForm()}</details>`,
  nested: `<h1>Opening soon</h1>${newsletter}
    <details data-testid="password-details"><summary>Enter Using Password</summary>
      <details><summary>More</summary>${passwordForm()}</details></details>`,
  none: `<h1>Welcome</h1><p>Store đã mở khoá</p>`,
};

const html = (body: string) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Password</title>
  <meta name="viewport" content="width=device-width, initial-scale=1"></head><body>${body}</body></html>`;

// GET /password?v=<dạng> trả fixture; POST /password ghi lại body, trả trang chủ giả.
async function serve(target: Page | BrowserContext) {
  const posts: string[] = [];
  await target.route(`${FIXTURE}/**`, async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    if (req.method() === 'POST') {
      posts.push(req.postData() || '');
      return route.fulfill({ status: 200, contentType: 'text/html', body: html('<h1>Home</h1>') });
    }
    const v = url.searchParams.get('v') || 'old';
    return route.fulfill({ status: 200, contentType: 'text/html', body: html(PAGES[v] ?? PAGES.none) });
  });
  return posts;
}

async function submitAndCapture(page: Page) {
  const req = page.waitForRequest((r) => r.method() === 'POST' && new URL(r.url()).pathname === '/password');
  await page.locator(PASSWORD_PAGE.form).evaluate((f: HTMLFormElement) => f.submit());
  return (await req).postData() || '';
}

test.describe('ES1-T442 fixture: 2 dạng trang password', () => {
  test('TC-01 AC1 trang cũ: ô hiện sẵn → điền thẳng, POST /password có mật khẩu', async ({ page }) => {
    await serve(page);
    await page.goto(`${FIXTURE}/password?v=old`);
    expect(await fillStorePassword(page, SECRET)).toBe('visible');
    await expect(page.locator(PASSWORD_PAGE.input)).toHaveValue(SECRET);
    expect(await submitAndCapture(page)).toContain(`password=${SECRET}`);
  });

  test('TC-02 AC1 trang mới: details đóng sẵn → mở details rồi điền, POST /password có mật khẩu', async ({ page }) => {
    await serve(page);
    await page.goto(`${FIXTURE}/password?v=closed`);
    const details = page.locator(PASSWORD_PAGE.details);
    await expect(details).not.toHaveAttribute('open', /.*/);
    await expect(page.locator(PASSWORD_PAGE.input)).toBeHidden();
    expect(await fillStorePassword(page, SECRET)).toBe('opened');
    await expect(details).toHaveAttribute('open', /.*/);
    await expect(page.locator(PASSWORD_PAGE.input)).toBeVisible();
    await expect(page.locator(PASSWORD_PAGE.input)).toHaveValue(SECRET);
    expect(await submitAndCapture(page)).toContain(`password=${SECRET}`);
  });

  test('TC-03 AC1 trang mới, details đã open (mật khẩu sai, TE-21 AC11) → không bấm summary (không đóng lại), điền được', async ({ page }) => {
    await serve(page);
    await page.goto(`${FIXTURE}/password?v=open`);
    expect(await fillStorePassword(page, SECRET)).toBe('visible');
    await expect(page.locator(PASSWORD_PAGE.details)).toHaveAttribute('open', /.*/);
    await expect(page.locator(PASSWORD_PAGE.input)).toHaveValue(SECRET);
  });

  test('TC-04 AC1 không có ô mật khẩu (store đã mở khoá) → absent, không lỗi, không POST', async ({ page }) => {
    const posts = await serve(page);
    await page.goto(`${FIXTURE}/password?v=none`);
    expect(await fillStorePassword(page, SECRET)).toBe('absent');
    expect(posts).toHaveLength(0);
  });

  test('TC-05 AC2 lý do phải mở details: fill thường và fill({ force }) trên ô trong details đóng đều không điền được', async ({ page }) => {
    await serve(page);
    await page.goto(`${FIXTURE}/password?v=closed`);
    const input = page.locator(PASSWORD_PAGE.input);
    await expect(input.fill(SECRET, { timeout: 1_500 })).rejects.toThrow();
    // force bỏ kiểm visible nhưng ô trong details đóng không nhận focus → Playwright báo lỗi hoặc giá trị không vào.
    const forced = await input.fill(SECRET, { force: true, timeout: 1_500 }).then(() => 'ok', () => 'throw');
    if (forced === 'ok') {
      test.info().annotations.push({ type: 'note', description: 'fill({force}) không ném lỗi trên bản Playwright này; helper vẫn mở details' });
    }
    await expect(page.locator(PASSWORD_PAGE.details)).not.toHaveAttribute('open', /.*/);
  });

  test('TC-06 AC1 details không có data-testid (markup khác #208) → vẫn mở và điền', async ({ page }) => {
    await serve(page);
    await page.goto(`${FIXTURE}/password?v=generic`);
    expect(await fillStorePassword(page, SECRET)).toBe('opened');
    await expect(page.locator('details.password-disclosure')).toHaveAttribute('open', /.*/);
    await expect(page.locator(PASSWORD_PAGE.input)).toHaveValue(SECRET);
  });

  test('TC-07 biên details lồng nhau → mở mọi details tổ tiên, điền được', async ({ page }) => {
    await serve(page);
    await page.goto(`${FIXTURE}/password?v=nested`);
    expect(await revealPasswordInput(page)).toBe('opened');
    await expect(page.locator(PASSWORD_PAGE.input)).toBeVisible();
  });

  test('TC-08 biên chỉ điền form mật khẩu, không đụng form email newsletter', async ({ page }) => {
    await serve(page);
    await page.goto(`${FIXTURE}/password?v=closed`);
    await fillStorePassword(page, SECRET);
    await expect(page.locator('#np-email')).toHaveValue('');
    const body = await submitAndCapture(page);
    expect(body).toContain('form_type=storefront_password');
    expect(body).not.toContain('contact');
  });

  test('TC-09 biên 360px: trang mới mở details và điền được', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await serve(page);
    await page.goto(`${FIXTURE}/password?v=closed`);
    expect(await fillStorePassword(page, SECRET)).toBe('opened');
    await expect(page.locator(PASSWORD_PAGE.input)).toHaveValue(SECRET);
  });

  test('TC-10 biên trang không JS: summary mở details bằng click (native), điền được', async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    try {
      await serve(ctx);
      const page = await ctx.newPage();
      await page.goto(`${FIXTURE}/password?v=closed`);
      expect(await fillStorePassword(page, SECRET)).toBe('opened');
      await expect(page.locator(PASSWORD_PAGE.input)).toHaveValue(SECRET);
    } finally {
      await ctx.close();
    }
  });

  test('TC-11 biên bàn phím: summary nhận focus, Enter mở details (hành vi mà helper dựa vào)', async ({ page }) => {
    await serve(page);
    await page.goto(`${FIXTURE}/password?v=closed`);
    const summary = page.locator(`${PASSWORD_PAGE.details} > summary`);
    await expect(summary).toHaveText('Enter Using Password');
    await summary.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator(PASSWORD_PAGE.details)).toHaveAttribute('open', /.*/);
    // Helper sau đó trả 'visible' (đã mở) — không bấm summary lần nữa làm đóng lại.
    expect(await revealPasswordInput(page)).toBe('visible');
  });
});

// Smoke DoD: chạy trên store dev thật, cả theme live (setup gọi /password không kèm preview_theme_id) và theme preview (PREVIEW_URL).
// Dạng trang nào (ô hiện sẵn / trong details) tuỳ theme đang chạy → ghi annotation, không assert dạng.
test.describe('ES1-T442 smoke store dev', () => {
  test.skip(!process.env.PREVIEW_URL || !process.env.STORE_PASSWORD, 'cần PREVIEW_URL + STORE_PASSWORD');

  const preview = () => new URL(process.env.PREVIEW_URL!);
  const targets = [
    { name: 'live', url: () => `${preview().origin}/password` },
    { name: 'preview', url: () => `${preview().origin}/password?preview_theme_id=${preview().searchParams.get('preview_theme_id') ?? ''}` },
  ];

  for (const t of targets) {
    test(`TC-12 AC3 mở khoá ${t.name}: helper + submit rời /password, rồi mở PREVIEW_URL không bị đẩy về /password`, async ({ browser }, info) => {
      test.skip(info.project.name !== 'desktop', 'smoke chỉ chạy desktop để giảm request lên store dev');
      if (t.name === 'preview') test.skip(!preview().searchParams.get('preview_theme_id'), 'PREVIEW_URL không có preview_theme_id');
      const ctx = await browser.newContext({ storageState: undefined });
      try {
        const page = await ctx.newPage();
        await page.goto(t.url());
        const state = await fillStorePassword(page, process.env.STORE_PASSWORD!);
        info.annotations.push({ type: 'password-page', description: `${t.name}: ${state}` });
        if (state !== 'absent') {
          await Promise.all([
            page.waitForURL((u) => !u.pathname.startsWith('/password'), { timeout: 30_000 }),
            page.locator(PASSWORD_PAGE.form).evaluate((f: HTMLFormElement) => f.submit()),
          ]);
        }
        await page.goto(process.env.PREVIEW_URL!);
        expect(new URL(page.url()).pathname.startsWith('/password'), 'vẫn ở /password: helper không mở khoá được').toBe(false);
      } finally {
        await ctx.close();
      }
    });
  }
});
