// Gọi JSON storefront có thử lại khi Shopify giới hạn tần suất (429) hoặc lỗi tạm 5xx/403 bot.
// CI #67 (ES1-T78): nhiều spec gọi /products/<handle>.js cùng lúc → 429 làm test fail sai.
import type { APIRequestContext } from '@playwright/test';

const RETRY = new Set([403, 429, 500, 502, 503, 504]);

export async function getJson<T>(request: APIRequestContext, path: string, attempts = 5): Promise<{ ok: boolean; status: number; body: T | null }> {
  let status = 0;
  for (let i = 0; i < attempts; i++) {
    const res = await request.get(path, { headers: { Accept: 'application/json' } });
    status = res.status();
    const type = res.headers()['content-type'] ?? '';
    if (res.ok() && type.includes('json')) return { ok: true, status, body: (await res.json()) as T };
    if (!RETRY.has(status) && !(res.ok() && !type.includes('json'))) return { ok: false, status, body: null };
    const after = Number(res.headers()['retry-after']);
    await new Promise(r => setTimeout(r, Number.isFinite(after) && after > 0 ? Math.min(after, 10) * 1000 : 1000 * 2 ** i));
  }
  return { ok: false, status, body: null };
}
