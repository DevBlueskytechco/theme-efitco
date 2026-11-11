// ES1-T300: tự kiểm helper skipIfStoreBlocked (tests/e2e/support/store-guard.ts), không cần store.
// Kỳ vọng: B1 skipped, B2 skipped, B3 failed (lỗi khác ném lại), B4 passed. Chạy: npx playwright test -c drafts/qa/ES1-T300/repro/pw.repro.config.ts skip-blocked
import { test, expect } from '@playwright/test';
import { CLOUDFLARE_BLOCKED, skipIfStoreBlocked } from '../../../../tests/e2e/support/store-guard';

test('B1 Cloudflare chặn → skip', async () => {
  await skipIfStoreBlocked('repro', async () => {
    throw new Error(`${CLOUDFLARE_BLOCKED} (cf-mitigated, status 429) tại https://x/?view=te13.`);
  });
});

test('B2 429 sau thử lại → skip', async () => {
  await skipIfStoreBlocked('repro', async () => {
    throw new Error('store trả 429 cho https://x/cart/add: giới hạn store dev, không phải lỗi code');
  });
});

test('B3 assertion thật vẫn fail', async () => {
  await skipIfStoreBlocked('repro', async () => {
    expect(1, 'lỗi code giả').toBe(2);
  });
});

test('B4 luồng chạy xong trả kết quả', async () => {
  expect(await skipIfStoreBlocked('repro', async () => 42)).toBe(42);
});
