// Gọi JSON storefront có thử lại khi Shopify giới hạn tần suất (429) hoặc lỗi tạm 5xx/403 bot.
// CI #67 (ES1-T78): nhiều spec gọi /products/<handle>.js cùng lúc → 429 làm test fail sai.
// CI #80: 4 lần, chờ 1/2/4 s, Retry-After tối đa 5 s → tổng ≤ ~11 s, còn chỗ trong timeout 30 s của test
// (5 lần tới 12 s làm test timeout thay vì skip có lý do). Giảm request chủ yếu nhờ cache file bên dưới.
import type { APIRequestContext } from '@playwright/test';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const RETRY = new Set([403, 429, 500, 502, 503, 504]);

// /products/<handle>.js không đổi trong 1 lượt chạy: cache theo worker để giảm request (Shopify trả 429 khi gọi dồn).
// Thêm cache file dùng chung mọi worker trong runner (retry sinh worker mới, mất Map): mỗi handle 1 request/runner.
const CACHE = new Map<string, unknown>();
const DIR = join(tmpdir(), 'efitco-e2e-json');
const file = (path: string) => join(DIR, encodeURIComponent(path) + '.json');
function fromDisk(path: string): unknown {
  try { return existsSync(file(path)) ? JSON.parse(readFileSync(file(path), 'utf8')) : undefined; } catch { return undefined; }
}
function toDisk(path: string, body: unknown) {
  try { mkdirSync(DIR, { recursive: true }); writeFileSync(file(path), JSON.stringify(body)); } catch { /* cache là tối ưu, lỗi ghi bỏ qua */ }
}

// challenged (ES1-T229): lần trả cuối có header cf-mitigated, để store-guard báo Cloudflare thay vì 'trả 403'.
export async function getJson<T>(request: APIRequestContext, path: string, attempts = 4): Promise<{ ok: boolean; status: number; body: T | null; challenged?: boolean }> {
  const cacheable = /^\/products\/[^/]+\.js$/.test(path);
  if (cacheable && CACHE.has(path)) return { ok: true, status: 200, body: CACHE.get(path) as T };
  if (cacheable) {
    const disk = fromDisk(path);
    if (disk !== undefined) { CACHE.set(path, disk); return { ok: true, status: 200, body: disk as T }; }
  }
  let status = 0;
  let challenged = false;
  for (let i = 0; i < attempts; i++) {
    // Handle có dấu: encode như trình duyệt (đường dẫn UTF-8 thô bị store dev trả 429 liên tục)
    const res = await request.get(/%[0-9A-F]{2}/i.test(path) ? path : encodeURI(path), { headers: { Accept: 'application/json' } });
    status = res.status();
    challenged = res.headers()['cf-mitigated'] === 'challenge';
    if (res.ok()) {
      // /products/<handle>.js trả content-type JavaScript nhưng body là JSON: parse body, không dựa content-type.
      const text = await res.text();
      try {
        const body = JSON.parse(text) as T;
        if (cacheable) { CACHE.set(path, body); toDisk(path, body); }
        return { ok: true, status, body };
      } catch { /* HTML (trang chặn/challenge) → thử lại */ }
    } else if (!RETRY.has(status)) return { ok: false, status, body: null };
    const after = Number(res.headers()['retry-after']);
    await new Promise(r => setTimeout(r, Number.isFinite(after) && after > 0 ? Math.min(after, 5) * 1000 : 1000 * 2 ** i));
  }
  return { ok: false, status, body: null, challenged };
}
