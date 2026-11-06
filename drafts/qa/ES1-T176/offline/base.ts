// ES1-T176: config chạy spec trên trang giả. Không globalSetup, không store. Đặt env trong config vì tiền tố env trước npx bị từ chối ngoài sandbox.
import { defineConfig, devices } from '@playwright/test';
import { resolve } from 'node:path';

export function make(mode: string, templateDir?: string) {
  process.env.STUB_MODE = mode;
  process.env.FIGMA_PROBE_ALL = '1';
  if (templateDir) process.env.ES1T176_TEMPLATE_DIR = resolve(templateDir);
  return defineConfig({
    testDir: resolve('tests/e2e'),
    testMatch: 'ES1-T176.spec.ts',
    outputDir: resolve('drafts/qa/ES1-T176/offline/test-results', mode),
    reporter: 'list',
    workers: 1,
    fullyParallel: true,
    use: { baseURL: 'http://127.0.0.1:4176' },
    projects: [{ name: 'desktop', use: { ...devices['Desktop Chrome'] } }],
    webServer: { command: 'node drafts/qa/ES1-T176/offline/stub-server.cjs', url: 'http://127.0.0.1:4176', reuseExistingServer: false, cwd: resolve('.'), env: { STUB_MODE: mode } },
  });
}
