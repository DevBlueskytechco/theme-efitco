import { chromium } from '@playwright/test';
// Mở khoá password store dev, rồi mở PREVIEW_URL (?preview_theme_id=...) để phiên giữ theme preview cho mọi trang test.
export default async () => {
  const preview = process.env.PREVIEW_URL!;
  const origin = new URL(preview).origin;
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto(`${origin}/password`);
  if (await p.locator('form[action*="password"]').count()) {
    await p.fill('input[type="password"]', process.env.STORE_PASSWORD || '');
    await Promise.all([p.waitForLoadState('load'), p.locator('form[action*="password"]').evaluate((f: HTMLFormElement) => f.submit())]);
  }
  await p.goto(preview);
  await p.context().storageState({ path: 'tests/setup/state.json' }); await b.close();
};
