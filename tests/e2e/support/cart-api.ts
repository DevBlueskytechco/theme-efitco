// ES1-T163: mọi lời gọi Cart API của spec đi qua đây. 429 → chờ theo Retry-After rồi thử lại, hết lượt mới skip.
// Lý do: skip ngay khi 429 (ES1-T100) làm 18/19 test ES1-T96 skip mà gate vẫn xanh (run 42145228634, mobile-1).
// Giữ APIRequestContext: POST bằng fetch trong trang kích hoạt Cloudflare challenge cả phiên (CI #82).
// Đọc giỏ của trang đang mở vẫn dùng readCartJson (support/product-data.ts): cùng market với HTML (ES1-T74).
// Log: '[cartApi] 429 lần' = 1 lần bị 429, 'trả 429' = 1 test skip; scripts/e2e-429-count.sh đếm 2 loại theo job (mỗi job 1 shard).
import { test, type APIRequestContext, type APIResponse, type Page } from '@playwright/test';

export const CART = {
  add: '/cart/add.js',
  change: '/cart/change.js',
  clear: '/cart/clear.js',
  update: '/cart/update.js',
  read: '/cart.js',
} as const;

// Pattern cho page.route: mock hoặc quan sát request do theme gửi, không phải lời gọi của spec.
export const CART_GLOB = { add: `**${CART.add}`, change: `**${CART.change}` } as const;

export type CartPath = (typeof CART)[keyof typeof CART];
export type CartInit = NonNullable<Parameters<APIRequestContext['fetch']>[1]>;

export const MAX_WAITS = 2;
export const MAX_TOTAL_WAIT_MS = 15_000;
const DEFAULT_RETRY_AFTER_S = 2;

// Thiếu, không phải số dương (kể cả dạng ngày HTTP) → mặc định 2 s. Không vượt phần ngân sách chờ còn lại.
export function retryDelayMs(retryAfter: string | undefined, waitedMs: number): number {
  const seconds = Number(retryAfter);
  const wanted = (Number.isFinite(seconds) && seconds > 0 ? seconds : DEFAULT_RETRY_AFTER_S) * 1000;
  return Math.max(0, Math.min(wanted, MAX_TOTAL_WAIT_MS - waitedMs));
}

// path /cart.js mặc định GET, còn lại POST. Trả response mọi status khác 429; caller tự kiểm res.ok().
// Page → page.request (chung cookie giỏ với trang).
export async function cartApi(target: Page | APIRequestContext, path: CartPath, init: CartInit = {}): Promise<APIResponse> {
  const request = 'request' in target ? target.request : target;
  const options = { method: path === CART.read ? 'GET' : 'POST', ...init };
  const info = test.info();
  let waited = 0;
  for (let tries = 1; ; tries++) {
    const res = await request.fetch(path, options);
    if (res.status() !== 429) return res;
    const retryAfter = res.headers()['retry-after'];
    console.log(`[cartApi] 429 lần ${tries}: ${path} Retry-After=${retryAfter ?? 'không có'}`);
    const delay = tries <= MAX_WAITS ? retryDelayMs(retryAfter, waited) : 0;
    if (delay === 0) {
      const reason = `429 sau ${tries} lần thử: ${path}`;
      console.log(`[cartApi] Shopify trả 429, skip: ${reason}`);
      test.skip(true, reason);
      return res;
    }
    // Thời gian chờ không tính vào timeout test: hook và test dùng chung 30 s, nếu không sẽ thành fail timeout thay vì skip.
    if (info.timeout > 0) info.setTimeout(info.timeout + delay);
    await new Promise((r) => setTimeout(r, delay));
    waited += delay;
  }
}
