# ES1-T298 — Dữ liệu demo B2B + combined listing trên `canvasecofittheme` (12/11/2026)

Store: `canvasecofittheme` (Shopify Plus, dev). Thao tác qua Claude in Chrome trong admin. Không đụng `hoa-qua-nhap-khau`.
Nguồn: `origin/develop:drafts/ba/ES1-T294/demo-data-b2b.md` mục D1, D9 — làm theo nguồn (không dùng bản tối thiểu).

## Lưu ý chung
- **Tiền tệ store là VND (₫), không phải USD.** Không đổi tiền tệ store (ngoài phạm vi). Giá quy đổi giữ số theo nguồn × 1000:
  $69.00 → ₫69,000; $62.10 → ₫62,100; $58.65 → ₫58,650.
- Store chưa có sản phẩm Efitco (chỉ snowboard mẫu) → tạo mới. Không thêm ảnh (không bắt buộc).
- Storefront có mật khẩu (`/password`); không nhập mật khẩu nên **chưa kiểm được trên storefront** (.js, add to cart). QA cần mật khẩu storefront hoặc preview từ admin.
- App Combined Listings báo theme hiện tại ("Generated Data Theme 1.0.0") cần bản ≥ 15.0.0 để hiển thị đúng; nút "Update theme" KHÔNG bấm (không đổi theme). Theme Efitco cần tự hỗ trợ combined listing khi QA.

## Sản phẩm (Products → Add product)
Đường bấm: Products → Add product → Title, Price, Inventory (Shop location), Search engine listing → URL handle → Save. Status Active, Publishing mặc định (Online Store + kênh mặc định).

| Sản phẩm | Handle | ID | Giá | Tồn (Shop location) |
| --- | --- | --- | --- | --- |
| Training Mat 12mm | `figma-training-mat-12mm` | 8882381193377 | ₫69,000 | 500 |
| Training Mat 12mm - Black | `training-mat-12mm-black` | 8882381422753 | ₫69,000 | 100 |
| Training Mat 12mm - Gray | `training-mat-12mm-gray` | 8882381586593 | ₫69,000 | 100 |
| Training Mat 12mm - Blue | `training-mat-12mm-blue` | 8882381652129 | ₫69,000 | 100 |

Shopify tự gợi ý category "Interlocking Gym Floor Tiles" (để nguyên). Không tạo "Resistance Band Set" vì D1/D9 không cần.

## D1. B2B — company, location, contact, catalog
- Company: **Efitco Demo Gym** — id 5390303393
  - Đường bấm: Customers → Companies → (URL `/companies/new`) → Company name → Main contact → Add new customer → Location → Add address → Save.
  - Admin URL: https://admin.shopify.com/store/canvasecofittheme/companies/5390303393
  - Payment terms: None; Checkout: Automatically submit orders (không chuyển draft order); Ship to location address. Tax: Collect tax. Market: Vietnam.
- Location: **Efitco Demo Gym – Main** — id 5605818529 (địa chỉ demo: 1 Demo Street, Ho Chi Minh City, Vietnam)
  - Đổi tên: trang location → menu "…" → Edit location details → Location name.
- Contact (main contact, Ordering only): customer "B2B Demo" — id 9723934474401 (email dạng demo theo yêu cầu, không ghi ở đây). Company status Approved.
- Catalog: **Efitco B2B Demo** — id 120732975265, **Active**
  - Đường bấm: trang location → Catalogs → Add a catalog → Create catalog → Title; Company locations = Efitco Demo Gym – Main; Set prices in Store currency (VND), Price adjustment 0 %; tắt "Automatically include new products"; chọn tất cả → bỏ chọn Training Mat 12mm → Exclude from catalog; cột Rules (⊕) → Edit quantity rules and volume pricing → Done → Save.
  - Sản phẩm trong catalog: chỉ `figma-training-mat-12mm` (giá ₫69,000).
  - Quantity rules: Increment 6, Minimum 6, Maximum 120 (theo nguồn D1).
  - Volume pricing: 24–59 → ₫62,100; 60+ → ₫58,650 (đã kiểm lại popover "Applied" sau khi lưu).
  - Admin URL: https://admin.shopify.com/store/canvasecofittheme/catalogs/120732975265

## D9. Combined listing
- Cài app **Shopify Combined Listings** (developer Shopify, Free) từ apps.shopify.com/combined-listings → Install → hộp thoại quyền (staff; products, Online Store, custom data) → Install. Không có màn thanh toán.
- Đường bấm: Apps → Combined Listings → Create combined listing → Title "Training Mat Combined" → Add products (3 con) → Option name "Color" → giá trị Black / Blue / Gray → Save. Sau đó trên trang sản phẩm cha: Status Active, URL handle → `demo-combined-parent` → Save (không tạo redirect).
- Sản phẩm cha: **Training Mat Combined** — handle `demo-combined-parent`, id 8882385682593, Active, Online Store.
- Con (option Color): Black → `training-mat-12mm-black`; Blue → `training-mat-12mm-blue`; Gray → `training-mat-12mm-gray`.

## Chưa làm / không làm được
- Kiểm storefront (D1 "Kiểm xong", D9 chuyển URL khi chọn Blue): storefront có mật khẩu, không nhập mật khẩu → chưa kiểm.
- Không cập nhật theme theo gợi ý của app Combined Listings (ràng buộc: không đổi theme).
- Không thêm ảnh sản phẩm.

## Key cho QA
- `TE4_B2B_QTY_HANDLE` = `figma-training-mat-12mm`
- `TE4_COMBINED_PARENT_HANDLE` = `demo-combined-parent`
- Company: Efitco Demo Gym (5390303393), location Efitco Demo Gym – Main (5605818529), catalog Efitco B2B Demo (120732975265)
