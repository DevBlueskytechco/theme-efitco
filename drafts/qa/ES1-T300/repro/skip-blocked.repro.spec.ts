// ES1-T300: tự kiểm helper skipIfStoreBlocked (tests/e2e/support/store-guard.ts), không cần store.
// Kỳ vọng: B1, B2 skipped; B3 failed (lỗi khác ném lại); B4 passed; B5, B6 skipped; B7 failed. Chạy: npx playwright test -c drafts/qa/ES1-T300/repro/pw.repro.config.ts skip-blocked
import { test, expect } from '@playwright/test';
import { CLOUDFLARE_BLOCKED, expectJsonAllowed, expectStoreAllowed, skipIfStoreBlocked } from '../../../../tests/e2e/support/store-guard';

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

// Lượt 4 (CTO 11/11 16:12): đường ném lỗi thật của ES1-T95 (expectJsonAllowed, /products/<handle>.js) và ES1-T190 (expectStoreAllowed, HTTP /?view=figma).
const fakeRes = (status: number, headers: Record<string, string> = {}) => ({ status: () => status, headers: () => headers, url: () => 'https://x/?view=figma' });

test('B5 T95 /products/<handle>.js cf-mitigated → skip', async () => {
  await skipIfStoreBlocked('repro', async () => expectJsonAllowed({ challenged: true, status: 429 }, '/products/variant-co-anh-rieng.js'));
});

test('B6 T190 /?view=figma 429 → skip', async () => {
  await skipIfStoreBlocked('repro', async () => expectStoreAllowed(fakeRes(429)));
});

test('B7 T190 /?view=figma 500 vẫn fail', async () => {
  await skipIfStoreBlocked('repro', async () => {
    const res = fakeRes(500);
    expectStoreAllowed(res);
    expect(res.status(), 'HTTP /?view=figma').toBeLessThan(400);
  });
});
