// Gọi JSON storefront có thử lại khi Shopify giới hạn tần suất (429) hoặc lỗi tạm 5xx/403 bot.
// CI #67 (ES1-T78): nhiều spec gọi /products/<handle>.js cùng lúc → 429 làm test fail sai.
// CI #80 (4 runner shard): 3 lần ~4,5 s chưa đủ → 5 lần, chờ 1,5/3/6/12 s, Retry-After tối đa 15 s.
import type { APIRequestContext } from '@playwright/test';

const RETRY = new Set([403, 429, 500, 502, 503, 504]);

// /products/<handle>.js không đổi trong 1 lượt chạy: cache theo worker để giảm request (Shopify trả 429 khi gọi dồn).
const CACHE = new Map<string, unknown>();

export async function getJson<T>(request: APIRequestContext, path: string, attempts = 5): Promise<{ ok: boolean; status: number; body: T | null }> {
  const cacheable = /^\/products\/[^/]+\.js$/.test(path);
  if (cacheable && CACHE.has(path)) return { ok: true, status: 200, body: CACHE.get(path) as T };
  let status = 0;
  for (let i = 0; i < attempts; i++) {
    const res = await request.get(path, { headers: { Accept: 'application/json' } });
    status = res.status();
    if (res.ok()) {
      // /products/<handle>.js trả content-type JavaScript nhưng body là JSON: parse body, không dựa content-type.
      const text = await res.text();
      try {
        const body = JSON.parse(text) as T;
        if (cacheable) CACHE.set(path, body);
        return { ok: true, status, body };
      } catch { /* HTML (trang chặn/challenge) → thử lại */ }
    } else if (!RETRY.has(status)) return { ok: false, status, body: null };
    const after = Number(res.headers()['retry-after']);
    await new Promise(r => setTimeout(r, Number.isFinite(after) && after > 0 ? Math.min(after, 15) * 1000 : 1500 * 2 ** i));
  }
  return { ok: false, status, body: null };
}
