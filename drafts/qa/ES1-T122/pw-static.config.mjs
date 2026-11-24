// ES1-T122: chạy nhóm tĩnh của tests/e2e/ES1-T122.spec.ts không cần store (bỏ globalSetup password).
// npx playwright test ES1-T122.spec.ts --config=drafts/qa/ES1-T122/pw-static.config.mjs -g "ES1-T122 tĩnh"
export default {
  testDir: '../../../tests/e2e',
  projects: [{ name: 'desktop' }],
  reporter: 'list',
};
