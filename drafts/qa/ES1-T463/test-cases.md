KHÔNG CHẮC: (1) chưa chạy trên preview (máy agent không có PREVIEW_URL), chờ CI store-tests; (2) T95-03, T95-04, T95-06, T95-07, T95-08, T95-11 cần markup PR #219 (ES1-T368): gate theo nguồn `blocks/cart-drawer.liquid` có `{% partial 'cart-drawer-footer' %}`; trên develop hiện tại skip có lý do "CHỜ PR #219", QA chạy lại sau merge; (3) `assets/header-sticky.js` comment đầu file còn mô tả sentinel 80px + header trong suốt (BE, chỉ comment).

# ES1-T463 — TE-1 QA: sửa ES1-T16 (header tối + sentinel 1px) và ES1-T95 (cart drawer ES1-T368)
Nguồn: docs/srs.md#TE-1 AC9, AC-H29; docs/srs.md#TE-5 AC1, AC4, AC6, AC8, AC15, AC19, bảng setting TE-5; docs/ui-spec/announcement-bar.md §3, §4; mini-cart-quickview.md §1, §2; ticket ES1-T463, ES1-T439, ES1-T453; Figma 1:362 (header).
Spec: tests/e2e/ES1-T16.spec.ts, tests/e2e/ES1-T95.spec.ts (sửa file có sẵn theo ticket, không tạo spec trùng ES1-T463.spec.ts).

## Danh sách AC
- TE-1 AC9: header thanh tối 80 mọi trang, không đè ảnh; sticky_header bật, cuộn thì dính đỉnh, giữ nền tối, thêm bóng, chiều cao không đổi.
- AC-H29: đầu trang và khi cuộn header tối, đáy header ≤ đỉnh hero, nền không đổi khi cuộn.
- D8 / announcement-bar §4 (ES1-T439): data-scrolled gắn khi sentinel 1px trước container header ra khỏi khung: không bar thì cuộn > 1px, có bar 44 thì cuộn > 44.
- TE-5 AC1: drawer có dòng hàng, tổng, Checkout, accelerated; khung theo AC15.
- TE-5 AC4 / AC19: giỏ rỗng có khối rỗng + CTA; drawer không chân panel, không freeship; "Empty cart products" trống thì không hàng, chọn thì 2 hàng.
- TE-5 AC6: cart_type page thì không drawer.
- TE-5 AC8: Show order note bật (mặc định) có `<details>` đóng sẵn, label, textarea cùng `cart.note`, refresh không mất chữ.
- TE-5 AC15: rộng 90% / 420 / 480; header 72 h2 + pill + View cart 44 + nút đóng 48; thân cuộn riêng; chân panel có Checkout; vùng "Added to cart" role status.
- ES1-T453 #1: data-partials drawer = `cart-drawer cart-drawer-count cart-drawer-footer cart-count`; cart-checkout trong cart-drawer-footer.

Cột AC: 1 mã chính (TE-1 cho T16-xx, TE-5 cho T95-xx; khớp `ac-scope.md` cho `ac_coverage.py`); AC phụ ở cột Nguồn phụ.

| ID | AC | Nguồn phụ | Given | When | Then | Loại | Ưu tiên |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T16-01 | AC9 | TE-1 | `/`, sticky_header bật, JS chạy | cuộn qua sentinel + 100 rồi về 0 | `data-scrolled` gắn rồi bỏ; header nền `rgb(26,26,26)`, khác `--color-background` | E2E | P1 |
| T16-02 | AC9 | TE-1, AC-H29 | `/` | ở đầu trang và sau khi cuộn qua sentinel | nền `rgb(26,26,26)`, chữ trắng cả hai lúc, không trong suốt | E2E | P1 |
| T16-03 | AC9 | TE-1, D8 announcement-bar §4 | `/`, không announcement bar (bar thật bị gỡ khỏi DOM nếu store dev có) | cuộn 0 → 2 → 0 | sentinel y 0, header bắt đầu ngay tại sentinel; 0 chưa gắn; 2 gắn, header y 0, chiều cao không đổi, nền tối; về 0 bỏ | E2E | P1 |
| T16-04 | AC9 | TE-1, D8 announcement-bar §3, §4 | `/`, có bar ≥ 44 (bar thật hoặc khối 44px chèn trước sentinel khi store dev chưa bật bar) | cuộn đáy bar − 1 → đáy bar + 2 → 0 | sentinel = đáy bar; −1 chưa gắn, header chưa dính (y > 0); +2 gắn, header y 0, chiều cao không đổi; về 0 bỏ | E2E | P1 |
| T16-05 | AC9 | TE-1, AC-H29, TE-2 AC6, lỗi mạng | `header-sticky.js` bị `route.abort` | tải `/`, cuộn 400 | không `data-header-enhanced`, không `data-scrolled`; đỉnh main ≥ đáy header; nền tối, chữ trắng; viewport cao > 480 thì header vẫn dính y 0 (CSS sticky) | E2E | P1 |
| T95-01 | AC1 | TE-5 | `/`, `/collections/all`, `/search?q=a`, `/cart`, PDP | tải trang | đúng 1 `cart-drawer` con trực tiếp của body, `data-cart-url` /cart, `data-items-src` cart-items.js | E2E | P2 |
| T95-02 | AC1 | TE-5, AC15 | `/`, cart_type drawer | tải trang | dialog ẩn, `scroll-lock`, không `open`; `aria-labelledby` = id của h2 `cart-drawer-heading`; cart-items đủ hook; status/alert đúng role; form id `cart-form-drawer`; nút đóng có tên; header cart link `data-cart-link`, `aria-haspopup=dialog` | E2E | P2 |
| T95-03 [#219] | AC15 | TE-5, ES1-T453 #1 | `/`, markup #219 | tải, ép open | `data-partials` = 4 partial; role status/alert đầu tiên trong cart-items là `cart-items-status`/`cart-items-error`; `cart-drawer-view-cart` href /cart, cao ≥ 44; vùng `cart-drawer-added` role status, hộp `[data-cart-added]` hidden, ngoài partial `cart-drawer-body`; nút đóng 48 × 48 | E2E | P2 |
| T95-04 [#219] | AC1 | TE-5, AC15, ES1-T453 #1 | giỏ 1 dòng (Cart API, thử lại 429) | tải `/`, ép open | 1 `cart-line` trong `cart-drawer-body`; `cart-checkout` không trong body, nằm trong `cart-drawer-footer`, `form=cart-form-drawer`; `cart-summary` trong chân; pill hiện chứa "1"; accelerated (nếu shop bật) trong chân, ngoài body, không hidden; axe 0 serious/critical | E2E | P1 |
| T95-05 | AC4 | TE-5, AC19 | giỏ rỗng | ép open | `cart-empty`, `cart-empty-cta` hiện; 0 `cart-checkout`; accelerated ẩn; axe 0 serious/critical | E2E | P2 |
| T95-06 [#219] | AC19 | TE-5, AC3 | giỏ rỗng | ép open | `data-item-count=0`; h2 khối rỗng hiện; 0 `cart-summary`; `cart-drawer-footer` ẩn; pill ẩn; 0 freeship; ghi chú (nếu có) ẩn; gợi ý ≤ 2 hàng | E2E | P2 |
| T95-07 [#219] | AC8 | TE-5 | `/`, show_order_note bật | tải trang | `cart-drawer-note` là `<details>` không `open`, ngoài `cart-drawer-body`; textarea `name=note`, `form=cart-form-drawer`, `data-note`, có `label[for]` | E2E | P2 |
| T95-08 [#219] | AC15 | TE-5, ES1-T313 | giỏ 1 dòng, viewport cao 800 | ép open ở 360, 768, 1280, 1920 | rộng 324 / 420 / 480 / 480 (±1), bám cạnh cuối, cao 800; `.drawer__body` overflow-y auto; đáy thân ≤ đỉnh chân; đính ảnh từng mốc | E2E | P1 |
| T95-09 | AC1 | TE-5, AC5 | `/cart` | tải trang | `data-mode=none`, 0 dialog; cart-items `data-partials=cart-page cart-count`; cart link không hook drawer | E2E | P2 |
| T95-10 | AC6 | TE-5 | preview cart_type page, `EXPECT_CART_TYPE=page` | tải `/` | `data-mode=none`, 0 dialog, cart link không `data-cart-link` | E2E | P2 |
| T95-11 [#219] | AC8 | TE-5, AC19, bảng setting TE-5 | nguồn `blocks/cart-drawer.liquid` | đọc schema | không presets; `show_order_note` checkbox default true; `empty_cart_products` collection không default | Tĩnh | P3 |
| T95-12 | AC15 | TE-5, foundation CSS logical, reduced motion | `assets/base.css` mục `/** Cart drawer (TE-5` → `/** Image with text (TE-7` | quét | 0 màu literal, 0 thuộc tính vật lý, có `prefers-reduced-motion: no-preference` | Tĩnh | P3 |
| T95-13 | AC15 | TE-5, không JS | JS tắt | tải `/`, bấm cart link | dialog ẩn (nếu có), link href /cart, sang `/cart` thấy `cart-page` | E2E | P2 |

## Case biên (ngoài AC)
- Store dev có / không có announcement bar: T16-03, T16-04 dựng nhánh thiếu bằng DOM, cả hai nhánh luôn chạy.
- Viewport cao ≤ 480 (30rem): header thôi dính (TE-10 AC8) → T16-03, T16-04 skip, T16-05 bỏ phần dính.
- sticky_header tắt: T16-01, T16-03, T16-04 skip có lý do; T16-02 chỉ kiểm phần đầu trang.
- Lỗi mạng: T16-05 `route.abort` header-sticky.js.
- Mobile 360: T95-08 mốc 360 (90%); project mobile chạy toàn bộ T16, T95.
- Merchant chưa chọn resource: `empty_cart_products` trống → T95-06 chấp nhận 0 hàng; T95-11 kiểm default trống.
- Cloudflare 429 trên Cart API / `products/<handle>.js`: `skipIfStoreBlocked` / `skip429`, không đổi assertion.
- Keyboard / focus mở-đóng drawer (AC15): JS, thuộc ES1-T96/T98, không trong ticket này.

## Test đã bỏ (thiết kế cũ, AC thay ghi trong đầu spec)
- ES1-T16: "trên hero: trong suốt ở đầu trang"; "ngưỡng đúng 80px: 60px chưa gắn data-scrolled"; "lỗi mạng header-sticky.js: header trên hero không sticky" (đã gỡ ở ES1-T319 #205; ES1-T463 thay bằng T16-03, T16-04, giữ ý T16-05).
- ES1-T95: rộng 100% / 448 → T95-08; `data-partials` "cart-drawer cart-count" → T95-03; `cart-checkout` trong `cart-drawer-body` → T95-04; schema không settings → T95-11; "đúng 1 h2 trong dialog" → T95-02 kiểm h2 tiêu đề + `aria-labelledby` (giỏ rỗng có h2 khối rỗng theo AC19).

## Dữ liệu test (hoa-qua-nhap-khau (efitco-ai-dev))
- `TE4_VARIANTS_HANDLE` / `TE4_SINGLE_HANDLE`: sản phẩm có variant bán được (T95-01 PDP, T95-04, T95-08).
- `EXPECT_CART_TYPE=page` chỉ khi preview đặt cart_type page (T95-10).
- Không cần announcement bar trên store dev (T16-04 tự dựng khi thiếu).

## KHÔNG CHẮC
- Xem dòng đầu file.
