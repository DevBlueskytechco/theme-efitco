import { chromium } from '@playwright/test';
import { printSummary429, startLog429 } from '../e2e/support/report-429';
import { declineConsent, verifyConsentState } from '../e2e/support/consent';
import { unlockAndOpenPreview } from '../e2e/support/password-unlock';
// Mở khoá password store dev, rồi mở PREVIEW_URL (?preview_theme_id=...) để phiên giữ theme preview cho mọi trang test.
const STATE = 'tests/setup/state.json';
export default async () => {
  startLog429();
  const preview = process.env.PREVIEW_URL!;
  const origin = new URL(preview).origin;
  const b = await chromium.launch(); const p = await b.newPage();
  // ES1-T442: trang password mới (ES1-T384, PR #208) thu ô mật khẩu trong <details> "Enter Using Password" đóng sẵn → mở rồi mới điền; trang cũ điền thẳng.
  const pw = await unlockAndOpenPreview(p, preview, process.env.STORE_PASSWORD || '');
  console.log(`[state] trang password: ${pw === 'opened' ? 'ô trong <details>, đã mở' : pw === 'visible' ? 'ô hiện sẵn' : 'không có ô (đã mở khoá)'}`);
  // ES1-T492 (thay cách ES1-T434): banner consent Shopify (preview mode luôn vẽ, ES1-T491) che footer/PDP đáy.
  // Ghi "từ chối mọi mục" bằng Shopify.customerPrivacy.setTrackingConsent (không chờ banner nạp muộn, không dựa tên cookie);
  // API lỗi thì bấm Decline trên banner. Lựa chọn vào state.json qua storageState bên dưới.
  const before = new Set((await p.context().cookies()).map((c) => `${c.name}=${c.value}`));
  const consent = await declineConsent(p);
  console.log(`[state] consent: ${consent.result}${consent.error ? ` (API: ${consent.error})` : ''}`);
  // ES1-T201: spec dựa vào giỏ rỗng ở mỗi context mới, không gọi /cart/clear.js. Có cookie cart thì mọi test dùng chung 1 giỏ: xoá và ghi log. Chỉ in tên cookie.
  const cookies = await p.context().cookies();
  const hasCart = cookies.some((c) => c.name === 'cart');
  const changed = cookies.filter((c) => !before.has(`${c.name}=${c.value}`)).map((c) => c.name);
  console.log(`[state] cookie: ${cookies.map((c) => c.name).join(' ')} | đổi sau consent: ${changed.join(' ') || 'không'} | cookie cart: ${hasCart ? 'có, đã xoá' : 'không'}`);
  if (hasCart) await p.context().clearCookies({ name: 'cart' });
  await p.context().storageState({ path: STATE });
  // ES1-T492: kiểm lại bằng context mới từ state.json (như context của spec). Banner còn hiện thì Decline ở đó và ghi đè state.json 1 lần.
  // Không ném lỗi: spec có autoDeclineConsent vẫn chạy; spec đo vùng đáy (ES1-T314) tự chặn script banner.
  const verify = await verifyConsentState(await b.newContext({ storageState: STATE }), STATE, `${origin}/`);
  console.log(`[state] consent kiểm lại: ${verify.result} | shouldShowBanner=${verify.api.shouldShowBanner} | visitorConsent=${JSON.stringify(verify.api.visitorConsent)}`);
  if (verify.result === 'banner-shown') console.warn('[state] CẢNH BÁO: context từ state.json vẫn thấy banner consent, Decline không được — spec vùng đáy có thể đỏ (ES1-T492)');
  await b.close();
  // Hàm trả về là global teardown: in tổng kết 429 theo spec ở cuối shard.
  return printSummary429;
};
