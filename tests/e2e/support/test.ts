// ES1-T475: test dùng chung cho mọi spec (import { test, expect } from './support/test'). Context của fixture page/context được trả giả 4 nguồn nhiễu
// của store và đếm request vào [req-tong-ket] (support/store-noise.ts). Context tự tạo trong spec đi qua newStoreContext.
// Ghi đè fixture context thay cho fixture auto: test tĩnh không dùng page thì không phải tạo context.
// Test cần AC analytics (monorail, /api/collect) hoặc iframe login_with_shop thật: test.use({ stubNoise: false }). JS tắt thì không gắn stub.
import { test as base } from '@playwright/test';
import { countStoreRequests, stubStoreNoise } from './store-noise';

export * from '@playwright/test';

export const test = base.extend<{ stubNoise: boolean }>({
  stubNoise: [true, { option: true }],
  context: async ({ context, baseURL, stubNoise, javaScriptEnabled }, use) => {
    // JS tắt (nhóm nojs): 4 nguồn nhiễu đều do JS nạp nên không có; context.route lại chặn cả điều hướng POST,
    // Chromium huỷ cross-document view transition ("ViewTransition opt-in disabled") → pageerror. Không gắn stub.
    if (stubNoise && javaScriptEnabled !== false) await stubStoreNoise(context, baseURL);
    const flush = countStoreRequests(context, baseURL);
    await use(context);
    flush();
  },
});
