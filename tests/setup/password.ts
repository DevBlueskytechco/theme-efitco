import { chromium } from '@playwright/test';
import { printSummary429, startLog429 } from '../e2e/support/report-429';
import { declineConsentBanner } from '../e2e/support/consent';
import { fillStorePassword } from '../e2e/support/password-unlock';
// Mở khoá password store dev, rồi mở PREVIEW_URL (?preview_theme_id=...) để phiên giữ theme preview cho mọi trang test.
export default async () => {
  startLog429();
  const preview = process.env.PREVIEW_URL!;
  const origin = new URL(preview).origin;
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto(`${origin}/password`);
  // ES1-T442: trang password mới (ES1-T384, PR #208) thu ô mật khẩu trong <details> "Enter Using Password" đóng sẵn → mở rồi mới điền; trang cũ điền thẳng.
  const pw = await fillStorePassword(p, process.env.STORE_PASSWORD || '');
  console.log(`[state] trang password: ${pw === 'opened' ? 'ô trong <details>, đã mở' : pw === 'visible' ? 'ô hiện sẵn' : 'không có ô (đã mở khoá)'}`);
  if (pw !== 'absent') {
    // Chờ POST /password xong và Shopify chuyển hướng ra khỏi /password — nếu không cookie mở khoá chưa được ghi
    await Promise.all([
      p.waitForURL((u) => !u.pathname.startsWith('/password'), { timeout: 30_000 }),
      p.locator('form[action*="password"]').evaluate((f: HTMLFormElement) => f.submit()),
    ]);
  }
  await p.goto(preview);
  if (new URL(p.url()).pathname.startsWith('/password')) {
    throw new Error('Không mở khoá được store: kiểm STORE_PASSWORD (secret GitHub / .env)');
  }
  // ES1-T434: banner consent Shopify (market EU từ ES1-T298) che footer/PDP đáy → Decline một lần, cookie _tracking_consent vào state.json.
  const consent = await declineConsentBanner(p);
  console.log(`[state] banner consent: ${consent}`);
  // ES1-T201: spec dựa vào giỏ rỗng ở mỗi context mới, không gọi /cart/clear.js. Có cookie cart thì mọi test dùng chung 1 giỏ: xoá và ghi log. Chỉ in tên cookie.
  const cookies = await p.context().cookies();
  const hasCart = cookies.some((c) => c.name === 'cart');
  console.log(`[state] cookie: ${cookies.map((c) => c.name).join(' ')} | cookie cart: ${hasCart ? 'có, đã xoá' : 'không'}`);
  if (hasCart) await p.context().clearCookies({ name: 'cart' });
  await p.context().storageState({ path: 'tests/setup/state.json' }); await b.close();
  // Hàm trả về là global teardown: in tổng kết 429 theo spec ở cuối shard.
  return printSummary429;
};
