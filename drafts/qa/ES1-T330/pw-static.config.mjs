// ES1-T330: chạy nhóm test tĩnh của tests/e2e/ES1-T330.spec.ts không cần store (bỏ globalSetup password).
// npx playwright test ES1-T330.spec.ts --config=drafts/qa/ES1-T330/pw-static.config.mjs -g "ES1-T330 tĩnh"
export default {
  testDir: '../../../tests/e2e',
  projects: [{ name: 'desktop' }],
  reporter: 'list',
};
