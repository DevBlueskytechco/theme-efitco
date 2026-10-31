import { chromium } from '@playwright/test';
// Mở khoá password store dev, rồi mở PREVIEW_URL (?preview_theme_id=...) để phiên giữ theme preview cho mọi trang test.
export default async () => {
  const preview = process.env.PREVIEW_URL!;
  const origin = new URL(preview).origin;
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto(`${origin}/password`);
  if (await p.locator('form[action*="password"] input[type="password"]').count()) {
    await p.fill('form[action*="password"] input[type="password"]', process.env.STORE_PASSWORD || '');
    // Chờ POST /password xong và Shopify chuyển hướng ra khỏi /password — nếu không cookie mở khoá chưa được ghi
    await Promise.all([
      p.waitForURL((u) => !u.pathname.startsWith('/password'), { timeout: 30_000 }),
      p.locator('form[action*="password"]').evaluate((f: HTMLFormElement) => f.submit()),
    ]);
  }
  await p.goto(preview);
  if (new URL(p.url()).pathname.startsWith('/password')) {
    throw new Error('Không mở khoá được store: kiểm STORE_PASSWORD (secret GitHub / .env)');
  }
  await p.context().storageState({ path: 'tests/setup/state.json' }); await b.close();
};
