// ES1-T163: mọi lời gọi Cart API của spec đi qua đây. 429 → chờ tăng dần rồi thử lại, hết lượt mới skip.
// Lý do: skip ngay khi 429 (ES1-T100) làm 18/19 test ES1-T96 skip mà gate vẫn xanh (run 42145228634, mobile-1).
// Giữ APIRequestContext: POST bằng fetch trong trang kích hoạt Cloudflare challenge cả phiên (CI #82).
// Đọc giỏ của trang đang mở vẫn dùng readCartJson (support/product-data.ts): cùng market với HTML (ES1-T74).
// Log: '[cartApi] 429 lần' = 1 lần bị 429, 'trả 429' = 1 test skip; scripts/e2e-429-count.sh đếm 2 loại theo job (mỗi job 1 shard).
// ES1-T201: tổng kết theo spec in cuối shard (support/report-429.ts). Không gọi CART.clear trong spec: mỗi test có context mới, giỏ đã rỗng.
import { test, type APIRequestContext, type APIResponse, type Page, type Response } from '@playwright/test';
import { basename } from 'node:path';
import { record429 } from './report-429';

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

// Chờ 2, 4, 8 s (14 s), không vượt 15 s.
export const MAX_WAITS = 3;
export const MAX_TOTAL_WAIT_MS = 15_000;
const BASE_WAIT_MS = 2000;

// attempt tính từ 1, chờ tăng dần. Retry-After hợp lệ lớn hơn thì theo Retry-After; thiếu hoặc không phải số dương (kể cả dạng ngày HTTP) thì bỏ qua.
// Không vượt phần ngân sách chờ còn lại.
export function retryDelayMs(retryAfter: string | undefined, waitedMs: number, attempt = 1): number {
  const seconds = Number(retryAfter);
  const asked = Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : 0;
  const wanted = Math.max(asked, BASE_WAIT_MS * 2 ** (attempt - 1));
  return Math.max(0, Math.min(wanted, MAX_TOTAL_WAIT_MS - waitedMs));
}

// 429 sau khi đã thử lại: 1 dòng log + 1 dòng tổng kết + skip có lý do.
export function skip429(reason: string): never {
  const spec = basename(test.info().file);
  console.log(`[cartApi] Shopify trả 429, skip: ${reason} (${spec})`);
  record429('skip', spec);
  test.skip(true, reason);
  throw new Error(reason); // test.skip(true) đã ném, dòng này chỉ để TypeScript hiểu never.
}

// Ghi nhận 1 lần 429, chờ theo lượt; hết lượt thì skip. Trả tổng thời gian đã chờ.
async function wait429(res: { headers(): Record<string, string> }, path: string, tries: number, waited: number): Promise<number> {
  const info = test.info();
  const retryAfter = res.headers()['retry-after'];
  console.log(`[cartApi] 429 lần ${tries}: ${path} Retry-After=${retryAfter ?? 'không có'}`);
  record429('hit', basename(info.file));
  const delay = tries <= MAX_WAITS ? retryDelayMs(retryAfter, waited, tries) : 0;
  if (delay === 0) skip429(`429 sau ${tries} lần thử: ${path}`);
  // Thời gian chờ không tính vào timeout test: hook và test dùng chung 30 s, nếu không sẽ thành fail timeout thay vì skip.
  if (info.timeout > 0) info.setTimeout(info.timeout + delay);
  await new Promise((r) => setTimeout(r, delay));
  return waited + delay;
}

// path /cart.js mặc định GET, còn lại POST. Trả response mọi status khác 429; caller tự kiểm res.ok().
// Page → page.request (chung cookie giỏ với trang).
export async function cartApi(target: Page | APIRequestContext, path: CartPath, init: CartInit = {}): Promise<APIResponse> {
  return fetchRetry429(target, path, { method: path === CART.read ? 'GET' : 'POST', ...init });
}

// ES1-T171: cùng quy tắc 429 cho request không phải Cart API (TC-06 của ES1-T45: đích của CTA, asset). Mặc định GET.
// Giữ tiền tố log [cartApi] để scripts/e2e-429-count.sh đếm chung.
export async function fetchRetry429(target: Page | APIRequestContext, path: string, options: CartInit = {}): Promise<APIResponse> {
  const request = 'request' in target ? target.request : target;
  let waited = 0;
  for (let tries = 1; ; tries++) {
    const res = await request.fetch(path, options);
    if (res.status() !== 429) return res;
    waited = await wait429(res, path, tries, waited);
  }
}

// ES1-T201: bấm nút thêm giỏ thật, /cart/add.js do theme gửi. 429 thì theme báo lỗi hoặc submit form thường, nên phải mở lại trang (reopen) rồi bấm lại.
// Không dùng route.fetch: gọi lại store từ Node nhận trang bot protection (ES1-T171).
export async function themeAdd(page: Page, click: () => Promise<void>, reopen: () => Promise<void>): Promise<void> {
  let waited = 0;
  for (let tries = 1; ; tries++) {
    const response = page.waitForResponse((r: Response) => r.url().includes(CART.add) && r.request().method() === 'POST');
    await click();
    const res = await response;
    if (res.status() !== 429) return;
    waited = await wait429(res, CART.add, tries, waited);
    await reopen();
  }
}
