// ES1-T370: chạy spec fixture (origin giả, mọi request qua page.route, không gọi store) ở máy dev, không cần PREVIEW_URL.
// Bỏ globalSetup mở khoá store của playwright.config.ts. Chạy: npx playwright test -c drafts/dev-be/ES1-T370/pw-fixture.config.mjs ES1-T370
export default {
  testDir: '../../../tests/e2e',
  reporter: 'list',
  outputDir: './pw-out',
  use: { browserName: 'chromium', viewport: { width: 1280, height: 720 }, trace: 'off', screenshot: 'off' },
  projects: [{ name: 'desktop' }],
};
