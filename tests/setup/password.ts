import { chromium } from '@playwright/test';
export default async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto(process.env.PREVIEW_URL!);
  if (await p.locator('form[action*="password"]').count()) {
    await p.fill('input[type="password"]', process.env.STORE_PASSWORD || '');
    await p.locator('form[action*="password"] button, form[action*="password"] input[type=submit]').first().click();
  }
  await p.context().storageState({ path: 'tests/setup/state.json' }); await b.close();
};
