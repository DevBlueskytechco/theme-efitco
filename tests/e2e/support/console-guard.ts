// ES1-T171: bộ lọc console dùng chung cho iframe Shop Pay. Accelerated checkout trong cart drawer (ES1-T95) và trang sản phẩm
// nhúng iframe shop.app/pay; shop.app trả 403 cho trình duyệt CI nên Chrome log "status of 403" với vị trí chrome-error://.
// Chỉ bỏ qua khi đủ cả 3: type error, đúng dạng log đó, và đã thấy response 403 từ https://shop.app/. 403 của theme giữ nguyên
// vị trí trang nên vẫn fail. Gọi trước page.goto để không lỡ response.
// ES1-T203: mọi guard đều đi qua hàm dưới, nên log từ script thử thách Cloudflare được bỏ qua ở một chỗ. Bị chặn hay không do support/store-guard.ts báo.
import type { ConsoleMessage, Page } from '@playwright/test';

const CLOUDFLARE_SOURCE = /\/cdn-cgi\/challenge-platform|challenges\.cloudflare\.com/;

export const isCloudflareLog = (msg: Pick<ConsoleMessage, 'text' | 'location'>) => CLOUDFLARE_SOURCE.test(msg.location().url) || CLOUDFLARE_SOURCE.test(msg.text());

// ES1-T217: Chrome tự log mỗi tài nguyên bị store trả 429 (run 42209030471: 64 dòng). Đó là giới hạn store dev, không phải lỗi theme.
// Chỉ khớp đúng log mạng của Chrome, không khớp status khác hay lỗi JS có nhắc tới 429. Hành vi khi request hỏng vẫn do assert của từng test kiểm.
export const isResource429Log = (msg: Pick<ConsoleMessage, 'type' | 'text'>) =>
  msg.type() === 'error' && /^Failed to load resource: the server responded with a status of 429\b/.test(msg.text());

export function watchShopPay403(page: Pick<Page, 'on'>): (msg: ConsoleMessage) => boolean {
  let blocked = false;
  page.on('response', (r) => {
    if (r.status() === 403 && r.url().startsWith('https://shop.app/')) blocked = true;
  });
  return (msg) =>
    isCloudflareLog(msg) || isResource429Log(msg) || (blocked && msg.type() === 'error' && /status of 403/.test(msg.text()) && msg.location().url.startsWith('chrome-error://'));
}
