#!/usr/bin/env python3
"""ES1-T100: tạo overlay spec từ tests/e2e hiện tại. Thay thế chính xác, sai 1 chuỗi là dừng."""
import shutil
import sys
from pathlib import Path

ROOT = Path(sys.argv[1])
OUT = Path(sys.argv[2])


def edit(name, pairs):
    src = ROOT / 'tests/e2e' / name
    text = src.read_text(encoding='utf-8')
    for old, new in pairs:
        if text.count(old) < 1:
            sys.exit(f'{name}: không thấy chuỗi: {old[:70]}')
        text = text.replace(old, new)
    dst = OUT / 'tests/e2e' / name
    dst.parent.mkdir(parents=True, exist_ok=True)
    dst.write_text(text, encoding='utf-8')


edit('TE-4.spec.ts', [
    ("// So tiền: .js lấy bằng fetch trong trang để cùng market (ES1-T74). Nhóm nojs không chạy script trong trang: chỉ assertion locator, .js qua page.request và chỉ so id.",
     "// So tiền: .js lấy bằng fetch trong trang để cùng market (ES1-T74). Nhóm nojs không chạy script trong trang: sản phẩm đọc JSON nhúng variant-json, giỏ đọc qua context phụ (ES1-T100, support/product-data.ts)."),
    ("import { getJson } from './support/http';\n",
     "import { pageJson, productDataNoScript, readCartJson, readCartNoScript, requireJson } from './support/product-data';\n"),
    ("""  const r = await page.evaluate(async (path) => {
    const cart = await fetch('/cart.js', { credentials: 'same-origin' }).then((x) => (x.ok ? x.json() : null)).catch(() => null);
    const res = await fetch(path, { credentials: 'same-origin', headers: { Accept: 'application/json' } });
    return {
      ok: res.ok,
      status: res.status,
      body: res.ok ? await res.json().catch(() => null) : null,
      active: (window as Win).Shopify?.currency?.active ?? null,
      cart: cart?.currency ?? null,
    };
  }, `${productPath(handle)}.js`);
  test.info().annotations.push({ type: 'market', description: `Shopify.currency.active=${r.active} cart.js currency=${r.cart}` });
  test.skip(!!r.active && !!r.cart && r.active !== r.cart, `Tiền hiển thị (${r.active}) khác tiền cart.js (${r.cart})`);
  expect(r.ok && !!r.body, `${handle}.js trong trang trả ${r.status}`).toBeTruthy();
  return r.body as JsProduct;
}
""",
     """  const active = await page.evaluate(() => (window as Win).Shopify?.currency?.active ?? null);
  const cart = (await pageJson<{ currency?: string }>(page, '/cart.js')).body?.currency ?? null;
  test.info().annotations.push({ type: 'market', description: `Shopify.currency.active=${active} cart.js currency=${cart}` });
  test.skip(!!active && !!cart && active !== cart, `Tiền hiển thị (${active}) khác tiền cart.js (${cart})`);
  return requireJson(await pageJson<JsProduct>(page, `${productPath(handle)}.js`), `${handle}.js`);
}
"""),
    ("""// Nhóm nojs: không chạy được fetch trong trang. Chỉ dùng id/available, không so tiền.
async function productJsNoScript(page: Page, handle: string): Promise<JsProduct> {
  const r = await getJson<JsProduct>(page.request, `${productPath(handle)}.js`);
  test.skip(r.status === 429, `Shopify trả 429 cho ${handle}.js sau khi thử lại (giới hạn store dev)`);
  expect(r.ok, `${handle}.js trả ${r.status}`).toBeTruthy();
  return r.body as JsProduct;
}

async function cartItems(page: Page) {
  const r = await getJson<{ items: Array<{ variant_id: number; quantity: number; properties: Record<string, string> | null }> }>(page.request, '/cart.js');
  test.skip(r.status === 429, 'Shopify trả 429 cho /cart.js sau khi thử lại (giới hạn store dev)');
  expect(r.ok, `/cart.js trả ${r.status}`).toBeTruthy();
  return r.body!.items;
}
""",
     """type CartJs = { items: Array<{ variant_id: number; quantity: number; properties: Record<string, string> | null }> };
const cartItems = async (page: Page) => (await readCartJson<CartJs>(page)).items;
// Nhóm nojs: không fetch trong trang được.
const cartItemsNoScript = async (page: Page) => (await readCartNoScript<CartJs>(page)).items;
"""),
    ("// Không dùng page.evaluate / locator.evaluate: JS tắt, chỉ assertion locator và page.request.",
     "// Không dùng page.evaluate / locator.evaluate trên trang tắt JS: chỉ assertion locator, page.request (POST giỏ) và helper *NoScript (ES1-T100)."),
    ("const js = await productJsNoScript(page, handle);", "const js = await productDataNoScript(page, handle);"),
    ("expect((await cartItems(page)).map((i) => i.variant_id)).toEqual([target.id]);",
     "expect((await cartItemsNoScript(page)).map((i) => i.variant_id)).toEqual([target.id]);"),
    ("const props = (await cartItems(page))[0]?.properties ?? {};",
     "const props = (await cartItemsNoScript(page))[0]?.properties ?? {};"),
    ("expect((await cartItems(page)).map((i) => i.variant_id)).toEqual([id]);",
     "expect((await cartItemsNoScript(page)).map((i) => i.variant_id)).toEqual([id]);"),
])

edit('ES1-T94.spec.ts', [
    ("import { test, expect, type APIRequestContext, type Browser, type Page } from '@playwright/test';",
     "import { test, expect, type Browser, type Page } from '@playwright/test';"),
    ("import { getJson } from './support/http';\n",
     "import { pageJson, productData, productDataNoScript, readCartJson, readCartNoScript, requireJson } from './support/product-data';\n"),
    ("""async function readProduct(request: APIRequestContext, handle: string): Promise<Product> {
  // getJson: cache file + thử lại + encode handle có dấu (store dev trả 429 khi gọi dồn, CI #80)
  const r = await getJson<Product>(request, `/products/${handle}.js`);
  test.skip(r.status === 429, `Shopify trả 429 cho ${handle}.js sau khi thử lại (giới hạn store dev)`);
  expect(r.ok, `/products/${handle}.js trả ${r.status}`).toBeTruthy();
  return r.body as Product;
}

async function readCart(request: APIRequestContext): Promise<Cart> {
  const r = await getJson<Cart>(request, '/cart.js');
  test.skip(r.status === 429, 'Shopify trả 429 cho /cart.js sau khi thử lại (giới hạn store dev)');
  expect(r.ok, `/cart.js trả ${r.status}`).toBeTruthy();
  return r.body as Cart;
}

async function addToCart(request: APIRequestContext, handle: string, quantity = 1, usePlan = false) {
  const product = await readProduct(request, handle);
  const variant = product.variants.find((v) => v.available && (!usePlan || v.selling_plan_allocations?.length));
  test.skip(!variant, `${handle} không có variant bán được`);
  const data: Record<string, unknown> = { id: variant!.id, quantity };
  if (usePlan) data.selling_plan = variant!.selling_plan_allocations![0].selling_plan_id;
  const res = await request.post('/cart/add.js', { data });
  expect(res.ok(), `/cart/add.js trả ${res.status()}`).toBeTruthy();
  return variant!;
}
""",
     """// ES1-T100: đọc từ trang sản phẩm đã mở (support/product-data.ts), không gọi .js bằng page.request (store dev trả 429, PR #81).
const readCart = (page: Page) => readCartJson<Cart>(page);

async function postLine(page: Page, handle: string, product: Product, quantity: number, usePlan: boolean) {
  const variant = product.variants.find((v) => v.available && (!usePlan || v.selling_plan_allocations?.length));
  test.skip(!variant, `${handle} không có variant bán được`);
  const data: Record<string, unknown> = { id: variant!.id, quantity };
  if (usePlan) data.selling_plan = variant!.selling_plan_allocations![0].selling_plan_id;
  const res = await page.request.post('/cart/add.js', { data });
  expect(res.ok(), `/cart/add.js trả ${res.status()}`).toBeTruthy();
  return variant!;
}

async function addToCart(page: Page, handle: string, quantity = 1, usePlan = false) {
  await page.goto(`/products/${handle}`);
  // selling plan không có trong JSON nhúng variant-json
  const product: Product = usePlan
    ? requireJson(await pageJson<Product>(page, `/products/${handle}.js`), `/products/${handle}.js`)
    : await productData(page, handle);
  return postLine(page, handle, product, quantity, usePlan);
}

async function addToCartNoScript(page: Page, handle: string) {
  await page.goto(`/products/${handle}`);
  return postLine(page, handle, await productDataNoScript(page, handle), 1, false);
}
"""),
    ("await addToCart(page.request, ENV.product!, 2);", "await addToCart(page, ENV.product!, 2);"),
    ("await addToCart(page.request, ENV.sellingPlan!, 1, true);", "await addToCart(page, ENV.sellingPlan!, 1, true);"),
    ("await addToCart(page.request, ENV.unitPrice!);", "await addToCart(page, ENV.unitPrice!);"),
    ("const variant = await addToCart(page.request, ENV.product!);", "const variant = await addToCart(page, ENV.product!);"),
    ("await addToCart(page.request, ENV.product!);", "await addToCart(page, ENV.product!);"),
    ("await readCart(page.request)", "await readCart(page)"),
    ("await addToCart(context.request, ENV.product!);", "await addToCartNoScript(page, ENV.product!);"),
    ("const cart = await readCart(context.request);", "const cart = await readCartNoScript<Cart>(page);"),
    ("expect((await readCart(context.request)).item_count).toBe(0);", "expect((await readCartNoScript<Cart>(page)).item_count).toBe(0);"),
    ("expect((await readCart(context.request)).note).toBe('ES1-T94 checkout note');", "expect((await readCartNoScript<Cart>(page)).note).toBe('ES1-T94 checkout note');"),
])

edit('TE-3.spec.ts', [
    ("""  return page.evaluate(async p => {
    const r = await fetch(p, { credentials: 'same-origin', headers: { Accept: 'application/json' } });
    return { ok: r.ok, status: r.status, body: r.ok ? await r.json().catch(() => null) : null };
  }, path);
}
""",
     """  return pageJson<J>(page, path); // ES1-T100: thử lại 429 trong trang
}
"""),
    ("""  const r = await inPageJson<JsProduct>(page, `/products/${handle}.js`);
  expect(r.ok && !!r.body, `/products/${handle}.js (fetch trong trang) trả ${r.status}`).toBe(true);
  return r.body!;
""",
     """  return requireJson(await inPageJson<JsProduct>(page, `/products/${handle}.js`), `/products/${handle}.js (fetch trong trang)`);
"""),
    ("""    const viaRequest = await page.request.get(`/products/${handle}.js`).then(r => (r.ok() ? r.json() : null)).catch(() => null) as JsProduct | null;
""",
     """    // Chủ đích gọi qua APIRequestContext để so với in-page; 1 lần, không thử lại, lỗi/429 chỉ ghi 'lỗi'.
    const viaRequest = await getJson<JsProduct>(page.request, `/products/${handle}.js`, 1).then(r => r.body).catch(() => null);
"""),
])

edit('TE-1.spec.ts', [
    ("""  const res = await page.request.get('/products.json?limit=50');
  if (!res.ok()) return null;
  const data = (await res.json().catch(() => null)) as { products?: Array<{ handle: string; body_html: string | null; images: unknown[]; variants: Array<{ id: number; available: boolean }> }> } | null;
""",
     """  // ES1-T100: fetch trong trang, trang chưa mở thì mở trang chủ trước
  if (!/^https?:/.test(page.url())) await page.goto('/');
  const res = await pageJson<{ products?: Array<{ handle: string; body_html: string | null; images: unknown[]; variants: Array<{ id: number; available: boolean }> }> }>(page, '/products.json?limit=50');
  if (!res.ok) return null;
  const data = res.body;
"""),
])

# Import: chèn sau dòng import @playwright/test đầu tiên của từng spec
for name, line in [
    ('TE-3.spec.ts', "import { getJson } from './support/http';\nimport { pageJson, requireJson } from './support/product-data';\n"),
    ('TE-1.spec.ts', "import { pageJson } from './support/product-data';\n"),
]:
    path = OUT / 'tests/e2e' / name
    lines = path.read_text(encoding='utf-8').splitlines(keepends=True)
    idx = next(i for i, l in enumerate(lines) if "from '@playwright/test'" in l)
    lines.insert(idx + 1, line)
    path.write_text(''.join(lines), encoding='utf-8')

conv_src = (ROOT / 'CONVENTION.md').read_text(encoding='utf-8')
marker = "Playwright trong `tests/e2e/<ticket>.spec.ts`.\n"
if marker not in conv_src:
    sys.exit('CONVENTION.md: không thấy mục Test')
(OUT / 'CONVENTION.md').write_text(conv_src.replace(marker, marker + "Spec đọc JSON storefront (`/products/*.js`, `/cart.js`, `/products.json`) dùng `tests/e2e/support/product-data.ts`, không `request.get` thẳng: store dev trả 429 cho request ngoài trình duyệt (ES1-T100).\n"), encoding='utf-8')
