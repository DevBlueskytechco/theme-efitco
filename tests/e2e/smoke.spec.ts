import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Trang có sẵn trên mọi store (không phụ thuộc dữ liệu): /pages/contact chỉ có khi merchant tạo trang → bỏ khỏi smoke.
const PAGES: { path: string; status: number }[] = [
  { path: '/', status: 200 },
  { path: '/collections/all', status: 200 },
  { path: '/search?q=a', status: 200 },
  { path: '/cart', status: 200 },
  { path: '/404-smoke-test', status: 404 },
];

// Lỗi console không thuộc theme: script Shopify chèn (preview bar, pixel, analytics) và chính response 404 của trang 404.
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i,
  /Failed to load resource: the server responded with a status of 404/];

for (const { path, status } of PAGES) {
  test(`smoke ${path}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => {
      if (m.type() !== 'error') return;
      const text = `${m.text()} @ ${m.location().url}`;
      if (!IGNORE_CONSOLE.some((r) => r.test(text))) errors.push(text);
    });
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

    const res = await page.goto(path);
    expect(res?.status(), `HTTP status ${path}`).toBe(status);
    expect(new URL(page.url()).pathname, 'không được kẹt ở trang password').not.toMatch(/^\/password/);
    await expect(page.locator('main')).toBeVisible();

    expect(errors, `console errors trên ${path}:\n${errors.join('\n')}`).toEqual([]);

    const axe = await new AxeBuilder({ page }).analyze();
    const bad = axe.violations.filter((v) => ['serious', 'critical'].includes(v.impact || ''));
    // In rõ rule + selector để biết sửa ở block nào
    const report = bad.map((v) => `${v.impact} ${v.id}: ${v.help}\n    ` + v.nodes.slice(0, 5).map((n) => n.target.join(' ')).join('\n    ')).join('\n');
    expect(bad.length, `axe serious/critical trên ${path}:\n${report}`).toBe(0);
  });
}
