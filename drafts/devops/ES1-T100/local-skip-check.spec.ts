// Chỉ chạy cục bộ (không đưa vào tests/e2e: dòng log 'trả 429' sẽ làm sai số đếm trên CI). Kết quả mong đợi: 1 skipped, có dòng log.
import { test } from '@playwright/test';
import { requireJson } from './overlay/tests/e2e/support/product-data';
test('requireJson: 429 → skip có lý do', () => {
  requireJson({ ok: false, status: 429, body: null }, '/cart.js');
  throw new Error('không tới đây: test.skip phải dừng test');
});
