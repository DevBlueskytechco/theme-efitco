KHÔNG CHẮC: (1) Spec chưa chạy cục bộ: không có node_modules, PREVIEW_URL, log CI (api.github.com bị chặn). Đã kiểm: bỏ type rồi `node --check` đạt. Kết quả thật chờ CI e2e trên PR. (2) Chưa biết vì sao page.request nhận market khác trang, vì cùng cookie jar và IP. Annotation TC-34 trên CI sẽ cho biết. (3) Chưa xác minh `/products.json` trả giá theo tiền market hay tiền shop. TC-22 chỉ dùng nó để chọn ứng viên, phép so dùng `.js` trong trang. (4) Spec ES1-T63 chưa merge, nằm trên nhánh feature/ai-ES1-T63, nên không sửa được trên nhánh này. Đoạn thay thế ở cuối file.

# ES1-T74: TE-3 TC-30 so khoảng giá card với .js sai khi market khác tiền tệ
Nguồn: ticket ES1-T74 (CI PR #63 run 41612768574, desktop). Card /collections/all hiện "Tk 2,600.00 – Tk 99,400.00" (BDT), `.js` lấy qua `page.request` trả giá khác. |toCents(min) − price_min| = 255900.
Phạm vi sửa: tests/e2e/TE-3.spec.ts, drafts/qa/ES1-T53/test-cases.md. Không tạo tests/e2e/ES1-T74.spec.ts vì ticket chỉ cho sửa TE-3.spec.ts; tách file sẽ trùng test.

## Quyết định (mục 1 ticket): fetch trong trang, không ghim market US
- Chọn: `inPageJson(page, path)` = `page.evaluate(fetch(path, { credentials: 'same-origin' }))`. Request đi từ chính trang card nên cùng cookie localization/cart, IP và header (UA, Accept-Language) với HTML. `.js` vì vậy cùng market, cùng tiền với card, kể cả khi market làm tròn giá (2,600.00 là số tròn).
- Không chọn POST /localization country_code=US hoặc ?country=US vì: (a) phụ thuộc danh sách market của store dev, US bị gỡ là test vỡ; (b) bỏ qua đúng tình huống runner gặp (khách ở market khác); (c) thêm 1 request ghi trạng thái trước mỗi test.
- Ràng buộc: trang phải có origin store. Helper tự `goto /collections/all` nếu đang about:blank (TC-22 gọi products.json trước khi điều hướng). Không dùng trong describe tắt JS (B-01 không gọi productJs).

## Mục 2: cùng nguồn cho mọi phép so tiền
- `productJs` (TC-17, TC-21, TC-22, TC-25, TC-30, TC-53, TC-71, TC-34) và `storeProductCount`, products.json của TC-22 đều đi qua `inPageJson`. Spec không còn `page.request` cho dữ liệu so sánh, chỉ còn 1 lần trong TC-34 để chẩn đoán, không assert.
- `requireSameCurrency` chạy trước lần so đầu tiên của mỗi test: đọc `Shopify.country`, `Shopify.currency.active`, `Shopify.currency.rate`, `/cart.js` currency. Ghi annotation `market` (HTML report) và in stdout 1 lần mỗi project (`[ES1-T74 market desktop] ...`). Nếu `currency.active` khác `cart.js currency` thì skip có lý do. Không quy đổi theo rate, vì `.js` trong trang theo tiền cart và rate chỉ cần khi 2 nguồn khác tiền, mà trường hợp này đã skip.
- TC-20 và badge % trên card chỉ so giá đọc trên trang với nhau nên không đổi. Badge % ở TC-17/21/22 so với `.js` trong trang, cùng tiền với Liquid.

## Mục 3: spec TE-4
| Spec | productJs dùng cho | So tiền | Việc |
| --- | --- | --- | --- |
| tests/e2e/ES1-T62.spec.ts | media, featured_media | không | Không sửa |
| tests/e2e/ES1-T64.spec.ts | id, options, variants.available, cart | không | Không sửa |
| feature/ai-ES1-T63:tests/e2e/ES1-T63.spec.ts | AC11 `offer.price` toBeCloseTo `variant.price / 100` | có, cùng lỗi | Cần sửa trên nhánh ES1-T63. Đoạn thay thế ở cuối, đã comment vào ticket ES1-T63 |

## Test case
| ID | AC | Given | When | Then | Loại | Ưu tiên | Trạng thái |
| --- | --- | --- | --- | --- | --- | --- | --- |
| R-01 | AC4 | Runner ở market BDT (CI PR #63), sản phẩm `price_varies` trên /collections/all | Chạy TC-30 | min, max của `price-range` khớp price_min, price_max của `.js` lấy trong trang (sai số 1 cent); test chạy thật, không skip | E2E | P1 | chạy (TC-30) |
| R-02 | AC3, AC4 | Runner ở market bất kỳ | Chạy TC-34 | `Shopify.currency.active` là mã 3 chữ; `cart.js` currency = currency.active; giá card đầu khớp `.js` trong trang; annotation ghi country/currency/rate và price_min qua page.request (chỉ chẩn đoán) | E2E | P1 | chạy (TC-34) |
| R-03 | AC3 | Như R-01, card sale giá cố định | Chạy TC-21 | Giá bán, giá gạch, % badge khớp `.js` trong trang theo đúng tiền đang hiển thị | E2E | P1 | có điều kiện (TC-21) |
| R-04 | AC3 | Market USD (máy CTO), ví dụ amazing-aluminum-bag-collection10 | Chạy TC-30 | $25.98 – $366.91 khớp 2598/36691 như trước. Không hồi quy | E2E | P1 | chạy |
| R-05 | AC3, AC4 | `Shopify.currency.active` khác `cart.js` currency (giả lập, không có trên store dev) | Gọi productJs | Test skip với lý do "Tiền hiển thị (X) khác tiền cart.js (Y)", không fail | E2E | P3 | có điều kiện (helper) |
| R-06 | AC3 | Market BDT, không có sale nào compare_at dưới 1000 minor units (10 Tk) | Chạy TC-22 | Ứng viên lấy từ products.json trong trang; không có thì skip có lý do; có thì so với `.js` trong trang, không fail sai | E2E | P2 | có điều kiện (TC-22) |
| R-07 | AC6 | Tắt JS (describe NFR-4) | Chạy B-01 | Không gọi page.evaluate hay fetch trong trang; B-01 không đổi | E2E | P2 | chạy (B-01) |
| R-08 | AC4 | Tiền có 3 số thập phân (KWD, BHD) | `money()` đọc "1.500" | Hạn chế đã biết: `money()` coi 3 chữ số sau dấu là hàng nghìn. Store dev không có market này (BD, BB, BY, CA, US đều 2 số lẻ) nên ngoài phạm vi | static | P4 | N/A |

## Gợi ý mô tả PR (market/currency runner nhận)
CI PR #63 runner render /collections/all ở market BDT ("Tk"), trong khi `.js` qua `page.request` trả giá market/tiền khác nên TC-30 lệch 255900 minor units. Sau sửa, `.js` lấy bằng fetch trong trang nên cùng market. Market thật của runner xem ở dòng stdout `[ES1-T74 market desktop|mobile] country=.. Shopify.currency.active=.. rate=.. cart.js currency=..` và annotation `market` / `page.request .js` của TC-34 trong HTML report. Orchestrator dán giá trị đó vào PR sau khi CI chạy.

## Đoạn thay thế cho ES1-T63 (nhánh feature/ai-ES1-T63, tests/e2e/ES1-T63.spec.ts)
Thay hàm `productJs` hiện tại (đang dùng `page.request.get`) bằng:
```ts
// ES1-T74: fetch trong trang → .js cùng market, cùng tiền với giá và JSON-LD trên trang. Tiền trang khác cart.js thì skip có lý do.
async function productJs(page: Page, handle: string): Promise<JsProduct> {
  if (!/^https?:/.test(page.url())) await page.goto(productPath(handle));
  const r = await page.evaluate(async (p) => {
    const s = (window as unknown as { Shopify?: { currency?: { active?: string } } }).Shopify ?? {};
    const cart = await fetch('/cart.js', { credentials: 'same-origin' }).then((x) => (x.ok ? x.json() : null)).catch(() => null);
    const res = await fetch(p, { credentials: 'same-origin', headers: { Accept: 'application/json' } });
    return { ok: res.ok, status: res.status, body: res.ok ? await res.json().catch(() => null) : null, active: s.currency?.active ?? null, cart: cart?.currency ?? null };
  }, `/products/${handle}.js`);
  test.info().annotations.push({ type: 'market', description: `Shopify.currency.active=${r.active} cart.js currency=${r.cart}` });
  test.skip(!!r.active && !!r.cart && r.active !== r.cart, `Tiền hiển thị (${r.active}) khác tiền cart.js (${r.cart})`);
  expect(r.ok && !!r.body, `/products/${handle}.js (fetch trong trang) trả ${r.status}`).toBeTruthy();
  return r.body as JsProduct;
}
```
Các test gọi productJs trước `page.goto` vẫn chạy, vì hàm tự điều hướng tới trang sản phẩm. Thêm vào AC11: `expect(offer.priceCurrency).toBe(r.active)` nếu muốn khoá tiền JSON-LD theo market (cần trả `active` ra ngoài, để Dev/QA ES1-T63 quyết).

## Tự kiểm tra
- `node module.stripTypeScriptTypes` + `node --check` tests/e2e/TE-3.spec.ts: đạt.
- `grep page.request tests/e2e/TE-3.spec.ts`: chỉ còn 1 chỗ, ở TC-34 để chẩn đoán.
- ac_coverage docs/srs.md#TE-3 với drafts/qa/ES1-T53/test-cases.md: xem kết quả trong ticket.
