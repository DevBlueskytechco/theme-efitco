// ES1-T171: bộ lọc console dùng chung cho iframe Shop Pay. Accelerated checkout trong cart drawer (ES1-T95) và trang sản phẩm
// nhúng iframe shop.app/pay; shop.app trả 403 cho trình duyệt CI nên Chrome log "status of 403" với vị trí chrome-error://.
// Chỉ bỏ qua khi đủ cả 3: type error, đúng dạng log đó, và đã thấy response 403 từ https://shop.app/. 403 của theme giữ nguyên
// vị trí trang nên vẫn fail. Gọi trước page.goto để không lỡ response.
import type { ConsoleMessage, Page } from '@playwright/test';

export function watchShopPay403(page: Pick<Page, 'on'>): (msg: ConsoleMessage) => boolean {
  let blocked = false;
  page.on('response', (r) => {
    if (r.status() === 403 && r.url().startsWith('https://shop.app/')) blocked = true;
  });
  return (msg) =>
    blocked && msg.type() === 'error' && /status of 403/.test(msg.text()) && msg.location().url.startsWith('chrome-error://');
}
