import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
for (const path of ['/', '/collections/all', '/search?q=a', '/cart', '/pages/contact', '/404-x']) {
  test(`smoke ${path}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', m => m.type() === 'error' && errors.push(m.text()));
    await page.goto(path);
    await expect(page.locator('main')).toBeVisible();
    expect(errors, 'console errors').toEqual([]);
    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations.filter(v => ['serious','critical'].includes(v.impact || ''))).toEqual([]);
  });
}
