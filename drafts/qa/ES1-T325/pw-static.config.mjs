// ES1-T325: chạy nhóm test tĩnh của tests/e2e/ES1-T325.spec.ts không cần store (bỏ globalSetup password).
// npx playwright test ES1-T325.spec.ts --config=drafts/qa/ES1-T325/pw-static.config.mjs -g "ES1-T325 tĩnh"
export default {
  testDir: '../../../tests/e2e',
  projects: [{ name: 'desktop' }],
  reporter: 'list',
};
