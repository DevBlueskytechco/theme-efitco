// ES1-T475: bớt request tới store dev, nơi Cloudflare bật thử thách 429 cho IP runner sau khoảng 17 phút mỗi shard (chẩn đoán ES1-T470).
// Chỉ trả giả (fulfill) 4 nguồn Shopify không phục vụ test, chỉ trên host store (ES1-T477 thêm nguồn thứ 5 trên shop.app, xem dưới): iframe login_with_shop của <shopify-account>, preloads.js của content_for_header,
// monorail và /api/collect (analytics). Không abort: abort sinh log "Failed to load resource" và pageerror (đã thử khi lập kế hoạch ES1-T475).
// Không chặn: graphql, shop-js/account.js, privacy-banner, /recommendations, checkout-web, /cdn-cgi. Không khớp theo path trên mọi host: trang giả (store.test, stub.test)
// và route shop.app của ES1-T171 giữ nguyên. page.route của spec được ưu tiên hơn context.route nên mock của spec không bị ảnh hưởng.
// ES1-T477: thêm iframe shop.app/pay/hop (Shop Pay nhận diện người mua) — host shop.app, khớp đúng path. Hop trả 302 về /services/login_with_shop/buyer/callback
// của store; Playwright chỉ đưa request đầu của chuỗi redirect vào route, nên callback đi thẳng tới store dù khớp tiền tố login_with_shop (run 43885902358
// lượt 1: callback 429 cf-mitigated trong ES1-T203 TC-20). Trả giả hop thì không có redirect, không có callback.
// Test cần AC analytics sau này thì test.use({ stubNoise: false }) (support/test.ts).
// Đánh đổi: context có route thì Playwright tắt HTTP cache, /cdn tải lại ở mỗi lần điều hướng; đo bằng [req-tong-ket] cuối shard (support/report-429.ts).
import { test, type Browser, type BrowserContext, type BrowserContextOptions, type Request } from '@playwright/test';
import { basename } from 'node:path';
import { emptyReqCounts, recordReq, type ReqCounts, type ReqKind } from './report-429';

export type NoiseKind = 'login_with_shop' | 'preloads' | 'monorail' | 'collect' | 'shop_hop';
export type NoiseCounts = Record<NoiseKind, number>;

// Khớp đầu đường dẫn cho login_with_shop, monorail; khớp đúng cho preloads.js, /api/collect, shop.app/pay/hop. Host khác store (trừ shop.app/pay/hop) → null.
export function noiseKind(url: URL, storeHost: string): NoiseKind | null {
  if (url.hostname === 'shop.app') return url.pathname === '/pay/hop' ? 'shop_hop' : null;
  if (url.hostname !== storeHost) return null;
  const path = url.pathname;
  if (path.startsWith('/services/login_with_shop/')) return 'login_with_shop';
  if (path === '/checkouts/internal/preloads.js') return 'preloads';
  if (path.startsWith('/.well-known/shopify/monorail/')) return 'monorail';
  if (path === '/api/collect') return 'collect';
  return null;
}

// Body trả giả. Iframe có lang và title để axe (quét cả iframe) không báo vi phạm của trang rỗng.
const FAKE: Record<NoiseKind, { status: number; contentType?: string; body?: string }> = {
  login_with_shop: { status: 200, contentType: 'text/html', body: '<!doctype html><html lang="en"><title>login_with_shop</title></html>' },
  preloads: { status: 200, contentType: 'text/javascript', body: '' },
  monorail: { status: 204 },
  collect: { status: 204 },
  shop_hop: { status: 200, contentType: 'text/html', body: '<!doctype html><html lang="en"><title>shop_hop</title></html>' },
};

const NOISE = new WeakMap<BrowserContext, NoiseCounts>();

const hostOf = (baseURL: string | undefined) => {
  try {
    return baseURL ? new URL(baseURL).hostname : null;
  } catch {
    return null;
  }
};

const specName = () => {
  try {
    return basename(test.info().file);
  } catch {
    return '';
  }
};

// Số lần mỗi nguồn đã bị trả giả trong context; context chưa gắn stub → undefined.
export const noiseCounts = (context: BrowserContext): NoiseCounts | undefined => NOISE.get(context);

export async function stubStoreNoise(context: BrowserContext, baseURL: string | undefined): Promise<void> {
  const storeHost = hostOf(baseURL);
  if (!storeHost || NOISE.has(context)) return;
  const counts: NoiseCounts = { login_with_shop: 0, preloads: 0, monorail: 0, collect: 0, shop_hop: 0 };
  NOISE.set(context, counts);
  await context.route(
    (url) => noiseKind(url, storeHost) !== null,
    (route) => {
      const kind = noiseKind(new URL(route.request().url()), storeHost)!;
      counts[kind]++;
      return route.fulfill(FAKE[kind]);
    },
  );
}

// Loại request: doc, dyn (store, không phải /cdn), cdn (/cdn của store), 3p (host khác), challenge (/cdn-cgi, challenges.cloudflare.com), stubbed (trả giả ở trên).
export function requestKind(request: Pick<Request, 'url' | 'resourceType'>, storeHost: string, stubbed: boolean): ReqKind | null {
  let url: URL;
  try {
    url = new URL(request.url());
  } catch {
    return null;
  }
  if (!/^https?:$/.test(url.protocol)) return null;
  if (url.hostname === 'challenges.cloudflare.com') return 'challenge';
  if (stubbed && noiseKind(url, storeHost)) return 'stubbed';
  if (url.hostname !== storeHost) return '3p';
  if (url.pathname.startsWith('/cdn-cgi/')) return 'challenge';
  if (request.resourceType() === 'document') return 'doc';
  return url.pathname.startsWith('/cdn/') ? 'cdn' : 'dyn';
}

// Đếm request của context, ghi vào [req-tong-ket] khi gọi hàm trả về hoặc khi context đóng (1 lần).
export function countStoreRequests(context: BrowserContext, baseURL: string | undefined): () => void {
  const storeHost = hostOf(baseURL);
  if (!storeHost) return () => {};
  const spec = specName();
  const counts: ReqCounts = emptyReqCounts();
  context.on('request', (request) => {
    const kind = requestKind(request, storeHost, NOISE.has(context));
    if (kind) counts[kind]++;
  });
  let done = false;
  const flush = () => {
    if (done || !spec) return;
    done = true;
    recordReq(spec, counts);
  };
  context.once('close', flush);
  return flush;
}

// Chỗ duy nhất được gọi browser.newContext (ES1-T475 kiểm tĩnh). Origin store: options.baseURL, không có thì baseURL của project.
export async function newStoreContext(browser: Browser, options: BrowserContextOptions = {}): Promise<BrowserContext> {
  const context = await browser.newContext(options);
  const baseURL = options.baseURL ?? test.info().project.use.baseURL;
  // JS tắt: không gắn stub (xem support/test.ts — route chặn điều hướng POST làm huỷ view transition).
  if (options.javaScriptEnabled !== false) await stubStoreNoise(context, baseURL);
  countStoreRequests(context, baseURL);
  return context;
}
