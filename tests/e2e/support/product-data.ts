// ES1-T100: đọc dữ liệu sản phẩm/giỏ từ trang đã mở, không qua APIRequestContext.
// CI PR #81: store dev trả 429 cho /products/<handle>.js và /cart.js gọi bằng page.request → test skip. Fetch trong trang cùng cookie/market với trình duyệt (ES1-T74).
// Thứ tự: JSON nhúng (snippets/variant-json.liquid, chỉ có khi sản phẩm có nhiều variant) → fetch trong trang → getJson khi trang chưa mở.
// Trang tắt JS (nhóm nojs): không fetch trong trang được, dùng hàm *NoScript.
// 429 sau khi thử lại: vẫn skip có lý do + 1 dòng log 'trả 429' để scripts/e2e-429-count.sh đếm trên CI.
import { expect, test, type Page } from '@playwright/test';
import { basename } from 'node:path';
import { getJson } from './http';
import { record429 } from './report-429';
import { expectJsonAllowed, expectNotChallenged } from './store-guard';

export type JsonResult<T> = { ok: boolean; status: number; body: T | null; challenged?: boolean };
export type ProductVariant = { id: number; available: boolean; price: number };
export type ProductData = { id: number; handle: string; variants: ProductVariant[] };

const isOpen = (page: Page) => /^https?:/.test(page.url());
const sameHandle = (a: string, b: string) => decodeURIComponent(a).toLowerCase() === decodeURIComponent(b).toLowerCase();

// Cùng quy tắc thử lại với getJson: 4 lần, chờ 1/2/4 s, Retry-After tối đa 5 s. /cart.js luôn no-store, giỏ đổi trong test.
export async function pageJson<T>(page: Page, path: string, attempts = 4): Promise<JsonResult<T>> {
  if (!isOpen(page)) return getJson<T>(page.request, path, attempts);
  return page.evaluate(async ({ path, attempts }) => {
    const retry = [403, 429, 500, 502, 503, 504];
    let status = 0;
    for (let i = 0; i < attempts; i++) {
      let after = NaN;
      try {
        const res = await fetch(path, {
          credentials: 'same-origin',
          cache: path.includes('/cart') ? 'no-store' : 'default',
          headers: { Accept: 'application/json' },
        });
        status = res.status;
        if (res.ok) {
          // /products/<handle>.js trả content-type JavaScript nhưng body là JSON; HTML (trang chặn) → thử lại.
          try { return { ok: true, status, body: JSON.parse(await res.text()) }; } catch { /* thử lại */ }
        } else if (!retry.includes(status)) return { ok: false, status, body: null };
        after = Number(res.headers.get('retry-after'));
      } catch { status = 0; }
      if (i < attempts - 1) await new Promise((r) => setTimeout(r, after > 0 ? Math.min(after, 5) * 1000 : 1000 * 2 ** i));
    }
    return { ok: false, status, body: null };
  }, { path, attempts }) as Promise<JsonResult<T>>;
}

// Lấy body; 429 sau khi thử lại → skip có lý do; lỗi khác → fail.
export function requireJson<T>(r: JsonResult<T>, label: string): T {
  expectJsonAllowed(r, label);
  if (r.status === 429) {
    const reason = `Shopify trả 429 cho ${label} sau khi thử lại (giới hạn store dev)`;
    console.log(`[ES1-T100] ${reason} (${basename(test.info().file)})`);
    record429('skip', basename(test.info().file));
    test.skip(true, reason);
  }
  expect(r.ok && r.body !== null, `${label} trả ${r.status}`).toBeTruthy();
  return r.body as T;
}

// JSON nhúng của trang sản phẩm đang mở; không có (1 variant, trang khác, khác handle) → null. Đọc qua locator nên chạy được khi tắt JS.
export async function embeddedProduct(page: Page, handle: string): Promise<ProductData | null> {
  if (!isOpen(page)) return null;
  const script = page.locator('script[data-product-variants]');
  if ((await script.count()) === 0) return null;
  try {
    const data = JSON.parse((await script.first().textContent()) ?? '') as { product: { id: number; handle: string }; variants: ProductVariant[] };
    return sameHandle(data.product.handle, handle) ? { id: data.product.id, handle: data.product.handle, variants: data.variants } : null;
  } catch { return null; }
}

// Trang bật JS. Trường ngoài id/handle/variants(id, available, price), ví dụ selling plan: pageJson('/products/<handle>.js').
export async function productData(page: Page, handle: string): Promise<ProductData> {
  return (await embeddedProduct(page, handle)) ?? requireJson(await pageJson<ProductData>(page, `/products/${handle}.js`), `/products/${handle}.js`);
}

// Trang tắt JS: JSON nhúng, không có thì getJson (fallback duy nhất còn lại qua APIRequestContext).
export async function productDataNoScript(page: Page, handle: string): Promise<ProductData> {
  return (await embeddedProduct(page, handle)) ?? requireJson(await getJson<ProductData>(page.request, `/products/${handle}.js`), `/products/${handle}.js`);
}

export async function readCartJson<T>(page: Page): Promise<T> {
  return requireJson(await pageJson<T>(page, '/cart.js'), '/cart.js');
}

// Trang tắt JS: mở context phụ bật JS, chép cookie (cart, password, preview_theme_id) từ context đang test rồi fetch trong trang đó. Chỉ đọc, không đổi giỏ.
export async function readCartNoScript<T>(page: Page): Promise<T> {
  const context = page.context();
  const sibling = await context.browser()!.newContext({ storageState: await context.storageState() });
  try {
    const helper = await sibling.newPage();
    await helper.goto(new URL('/cart', page.url()).toString(), { waitUntil: 'domcontentloaded' });
    await expectNotChallenged(helper);
    return await readCartJson<T>(helper);
  } finally {
    await sibling.close();
  }
}
