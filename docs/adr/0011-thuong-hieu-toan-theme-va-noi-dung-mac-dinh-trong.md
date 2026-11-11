KHÔNG CHẮC: chưa rõ Shopify lưu setting của static block trong template `.liquid` ở đâu khi merchant sửa bằng editor. Spike ES1-T331 sẽ trả lời. Nếu kết quả là không lưu được thì mục 2 phải đổi cách cấp nội dung demo, và Tech Lead sửa ADR này.

# 0011. Logo, favicon toàn theme và nội dung mặc định trống: template không nhúng tài nguyên demo
Ngày: 2026-11-11 | Trạng thái: Đề xuất (ES1-T304, chờ CTO duyệt) | Áp quyết định CTO ES1-T308 #1 và D10 của ES1-T307; bổ sung ADR 0004

## Bối cảnh
- Rà soát Theme Store 11/11 (docs/design/shopify-audit-1111) có các lỗi CHẶN sau:
  - C9: thiếu setting favicon.
  - C10: chưa chọn logo thì hiện SVG cứng "EFITCO" (`snippets/logo-efitco.liquid`) cho mọi merchant. Logo hiện là setting của block header/footer. `templates/gift_card.liquid:36` đọc `settings.logo` nhưng setting này không tồn tại. Password không có logo, không có `shop.name` (A#63).
  - B#43, C11: `config/settings_data.json` điền sẵn 4 link social giả và `free_shipping_threshold: 99`.
  - B#48, B#51, C1, C6: `templates/index.liquid` nhúng 25 handle `figma-*`, 34 `images['efx-*']`, `all_products[...]`, metafield `custom.demo_video`, YouTube `aqz-KE-bpKQ`, countdown "hôm nay 23:59" và Verified bật theo `home_demo`.
  - C3, C4, N1, N2: tier giảm mặc định 10/15%, "Get 15% Off" cứng, claim "Trusted by 10,000+", "1 Year Warranty" làm default hoặc fallback.
- Theme Store mục 14 (default giải thích cách dùng, có favicon, logo dự phòng là tên shop), mục 22 (không tài nguyên riêng của demo), mục 8 (không claim, không urgency giả). CTO 11/11 (ES1-T308 #1): theme mới cài để trống, nội dung Figma chỉ cấu hình trên store dev.
- Ràng buộc: Skeleton block-first, template `.liquid`, không JSON template (ADR 0004, decisions 11/11). Mục tiêu số 1 là trang chủ giống 100% Figma, đo trên store dev (AC-H1..H5).

## Lựa chọn đã cân nhắc
- A. Giữ logo ở block, fallback sang `shop.name`. Thêm favicon vào block header. Gift card và password tự đọc block. Ưu: ít sửa. Nhược: `layout none`/password không gọi được block header nên không có logo, và favicon thuộc `<head>` chứ không thuộc block. Loại.
- B. Logo và favicon là theme setting toàn cục, block header/footer vẫn được ghi đè. Ưu: một nguồn cho header, footer, gift card, password, `<link rel="icon">`. Merchant đặt logo một lần. Nhược: thêm 2 setting toàn cục, block header/footer có 2 nguồn logo. Chọn.
- C. Nội dung demo: giữ trong template, chỉ hiện khi store có file `efx-*` (cách hiện tại). Ưu: store dev giống Figma không cần cấu hình. Nhược: vi phạm mục 22, store khách có file trùng tên sẽ ra nội dung lạ, countdown giả. Loại.
- D. Nội dung demo: template chỉ ghép cấu trúc, mọi nguồn là setting block default rỗng, nội dung Figma nhập trên store dev bằng fixture. Ưu: đúng mục 8, 14, 22 và ES1-T308 #1. Nhược: store dev cần fixture, test trang chủ phụ thuộc fixture. Chọn.

## Quyết định
B + D.
1. `config/settings_schema.json` thêm nhóm "Logo and favicon" gồm `logo` (image_picker) và `favicon` (image_picker). Header/footer lấy logo theo thứ tự `block.settings.logo`, `settings.logo`, rồi `shop.name` dạng chữ. Gift card, password lấy `settings.logo`, rồi `shop.name`. `<link rel="icon">` chỉ in khi có favicon, đặt ở `layout/theme.liquid` và `layout/password.liquid`. Xoá `snippets/logo-efitco.liquid`.
2. `templates/*.liquid` và `layout/*.liquid` chỉ ghép block, kèm `id` và tham số cấu trúc (tag, background, thứ tự). Cấm `collections['…']`, `all_products['…']`, `images['…']`, `metafields.custom.*` và id video cứng. Block cần nguồn dữ liệu thì có setting cùng kiểu (collection, product, image_picker, video, url), default rỗng, rỗng thì in placeholder cho editor (`request.design_mode`) và không in gì ngoài storefront.
3. Setting chữ, claim, số liệu, mã giảm, bậc giảm: default rỗng hoặc 0, rỗng thì ẩn phần tử. Locale không giữ câu mẫu làm fallback cho claim. Nhãn nút bắt buộc dùng chữ trung tính trong locale ("Subscribe").
4. `config/settings_data.json` `current` không có link social, ngưỡng free shipping hay nội dung demo. Preset mang tên theme chờ CTO chốt tên theme.
5. Nội dung Figma (ảnh, collection, sản phẩm, chữ, tier 10/15%, mã WELCOME15, Verified chỉ khi có đơn thật) là fixture store dev do QA quản lý (ES1-T331), không nằm trong code.
6. Template test (`templates/index.*.liquid`) và block mẫu Skeleton giữ trong repo cho e2e và AGENTS.md, nhưng loại khỏi gói release bằng `scripts/theme-zip.sh`. Không dùng `.shopifyignore` vì file này chặn cả lần push lên store dev.

## Hệ quả
- Tốt: đóng 12 mục CHẶN của README §2 (favicon, logo, social, index §22, countdown giả, Verified, tier, Get 15% Off). Store khách cài mới không hiện claim sai.
- Xấu: store dev phải áp fixture trước khi đo trang chủ. Spec e2e đang dựa vào `home_demo` sẽ đỏ tới khi có fixture. Block header/footer có 2 nguồn logo, phải ghi rõ trong `info`.
- Việc:
  - FE: TS-FE1 (mục 1, 4), TS-FE2 (footer), TS-FE3 (mục 2), TS-FE4 (mục 3). Đặt tên task theo ES1-T304 §3.
  - QA: ES1-T331 (mục 5), TS-QA1 (kiểm tĩnh).
  - DevOps: TS-OPS1 (mục 6).
  - CTO: thêm dòng Theme map AGENTS.md cho setting logo/favicon toàn cục, chốt tên theme cho preset.
- Đo:
  - Kiểm tĩnh, chạy trong TS-QA1 `@static` ở mọi PR:
    - `grep -nE "collections\['|all_products\['|images\['|metafields\.custom|23:59|home_demo" templates/*.liquid layout/*.liquid`: bằng 0, trừ `templates/index.*.liquid` (bị loại khỏi gói).
    - `grep -rn "logo-efitco" blocks snippets layout templates`: bằng 0.
    - `grep -nE "social_|free_shipping" config/settings_data.json`: bằng 0.
    - Mọi `tier_*_percent` có default 0.
    - `grep -nE "10,000|15%|Warranty" locales/en.default.json`: bằng 0.
  - Trên store: theme cài mới (không fixture) thì header hiện `shop.name`, không lỗi Liquid. Store dev có fixture thì `tests/e2e/ES1-T176.spec.ts` không đỏ thêm so với develop.
  - Lúc kiểm: mỗi PR TS-FE1..FE4, và trước R1 (28/12) trên gói zip.
