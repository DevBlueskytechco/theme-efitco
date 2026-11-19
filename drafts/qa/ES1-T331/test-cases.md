KHÔNG CHẮC: nhóm store (TC-10..TC-16, TC-20) chưa chạy trên store dev, chưa có PR để store-tests chạy; nơi lưu setting static block chưa đo (ES1-T428). Trước ES1-T304, `templates/index.liquid` còn tự nhúng nội dung demo nên TC-10..TC-16 có thể xanh mà chưa áp fixture. Chi tiết: content-fixture.md dòng đầu.

# ES1-T331 — TE-17-R2-QA0: fixture nội dung Figma cho store dev (story TE-17)
Nguồn: docs/srs.md#TE-17 (AC-H1..H5), TE-12 (AC-H18, AC-H19), TE-1 (AC-H28), TE-10 AC3; ticket ES1-T331; D10 ES1-T307; ADR 0011 mục 5; Figma node 1:359 (hàng theo docs/figma-inventory.md).
Spec: tests/e2e/ES1-T331.spec.ts. Fixture: tests/fixtures/home-figma.json. Phạm vi: kiểm fixture và trạng thái áp; đo giống Figma (ảnh, style, copy đủ bảng, kích thước khối) thuộc ES1-T176, TE-17-R2-QA1, QA2, không lặp ở đây.

| ID | AC | Given | When | Then | Loại | Ưu tiên |
| --- | --- | --- | --- | --- | --- | --- |
| TC-01 | AC-H2 | Fixture `home-figma.json`, repo hiện tại | Đọc `{% schema %}` từng `blocks/<type>.liquid` | Mọi key trong `blocks[].settings` là id setting có trong schema; 0 block thiếu file | tĩnh | P1 |
| TC-01b | AC-H5 | Như TC-01 | Như TC-01, với block chứa "Trusted by 10,000+ athletes" (slide-1.eyebrow) và "360+" (faq.stat_1_value) | 2 key `eyebrow`, `stat_1_value` có trong schema `slideshow-slide`, `faq` | tĩnh | P1 |
| TC-02 | AC-H1 | Fixture, `templates/index.liquid`, `layout/theme.liquid` | Liệt kê cặp type + id của thẻ `{% block %}` (bỏ comment) | Mọi block fixture có đúng 1 cặp type + id tương ứng trong scope của nó | tĩnh | P1 |
| TC-03 | AC-H1 | Fixture `rows` | So với thứ tự container trong `templates/index.liquid` | 16 hàng 1..16; hàng 1 `header`, 16 `footer`, 2..15 = `container-<id>` đúng thứ tự template | tĩnh | P1 |
| TC-04 | AC-H18 | Fixture `bundle-builder` và `store_data.discounts` | So bậc trong setting với discount tự động phạm vi `figma-bundle` | Bậc (2, 10%), (3, 15%), khớp 2 discount | tĩnh | P1 |
| TC-04b | AC-H19 | Fixture `shop-the-look` và discount `figma-setup` | So bậc | Bậc (4, 10%), khớp discount `figma-setup` | tĩnh | P1 |
| TC-05 | AC3 | Fixture; ES1-T304 đã merge | Đọc giá trị image_picker và `templates/index.liquid` | Ảnh dạng `shopify://shop_images/efx-*`; template không chứa handle collection của fixture (skip có lý do khi template còn `figma-`/`images['efx-`) | tĩnh | P2 |
| TC-06 | AC-H3 | Fixture, block có ảnh trong Figma (hàng 2–15, `home-content.md` cột "ảnh") | Đọc mọi setting image_picker trong `blocks[].settings` | Mọi ảnh khác `null`, trừ đúng 3 chỗ chờ ES1-T178: `header.logo`, `footer.logo`, `footer.newsletter_image`; ảnh thiếu thì ES1-T176 so ảnh không đo được | tĩnh | P1 |
| TC-10b | AC-H4 | Như TC-10 | Đo khung 16 hàng | Mỗi hàng có nội dung (cao > 40px) để ES1-T176 đọc computed style trên node có thật, không trên placeholder | E2E | P1 |
| TC-10 | AC-H1 | `/` trên store dev đã áp fixture, 1920 | Đọc 16 testid trong `rows` | Mỗi hàng hiện, cao > 40px; y tăng dần; 0 `container-*` trong `<main>` ngoài danh sách | E2E | P1 |
| TC-11 | AC-H2 | Như TC-10, viewport 360, 768, 1280, 1920 | Đọc text theo testid của mọi `markers` | Mọi marker có (so không phân biệt hoa thường, bỏ khoảng trắng thừa) | E2E | P1 |
| TC-11b | AC-H5 | Như TC-11 | Đọc `slideshow-slide`, `faq-stat-1` | Có "Trusted by 10,000+ athletes" và "360+" ở 4 mốc | E2E | P1 |
| TC-12 | AC-H5 | Như TC-10, tắt JS, 1280 | Mở `/` | Mọi marker có trong HTML server render | E2E nojs | P1 |
| TC-13 | AC-H18 | Như TC-10, `figma-bundle` ≥ 3 sản phẩm còn hàng, bỏ chọn hết | Chọn lần lượt 1, 2, 3 món | 1 món: dòng tiến độ có "1" và "10%"; 2 món: dòng giảm "10%"; 3 món: dòng giảm "15%", dòng tiến độ "15%" | E2E | P1 |
| TC-14 | AC-H19 | Như TC-10 (store dev đã áp fixture, `/` ở 1920), 4 row còn hàng; block không có chọn từng món: mỗi row còn hàng có `input type=hidden name=id[] data-price` (luôn vào giỏ), row hết hàng không có input | Cuộn tới khối, chờ JS gắn `data-enhanced` | Ghi chú có "Fits"; 4 `shop-the-look-row`; dòng giảm "10%"; tạm tính = tổng `data-price` 4 input /100 (±0,01); giảm = 10% tạm tính (±0,1); tổng = tạm tính − giảm (±0,01) | E2E | P1 |
| TC-15 | AC-H28 | Như TC-10, 1920 | Đọc footer | Logo hiện; mô tả "Efitco provides premium fitness accessories…"; heading và nút có "Get 15% Off"; "No spam. Unsubscribe anytime." | E2E | P1 |
| TC-16 | AC-H5 | Như TC-10, request ảnh `efx-*` bị `route.abort` | Mở `/` ở 1280 | Mọi marker chữ vẫn có (nội dung không phụ thuộc ảnh tải xong) | E2E biên | P2 |
| TC-20 | AC3 | Theme push từ repo, không áp fixture, không mở editor (`FRESH_THEME_ID`), ES1-T304 đã merge | Mở `/?preview_theme_id=<id>` ở 360, 768, 1280, 1920 | 0 chuỗi `fresh_install.forbidden_text`; 0 href `/collections/figma-`, `/products/figma-`, `/blogs/figma-`; 0 `bundle-builder-discount-row`, `shop-the-look-discount-row`, `testimonial-verified`, `featured-product-countdown` | E2E | P1 |
| TC-30 | AC-H1 | Theme spike `ai-ES1-T331-spike` (ES1-T428) | Sửa 4 setting trong editor, pull trước/sau (content-fixture.md mục 2, S1–S4) | Xác định nhánh lưu: template-params, settings-data hoặc server-only; ghi vào `storage.status` | tay (DevOps) | P1 |
| TC-31 | AC-H1 | Như TC-30 | Mở `/?view=te15`, `/?view=te7`, sản phẩm `?view=featured-product` (S5) | Ghi block nào rò setting sang template khác; rò thì mở ticket FE thêm id riêng | tay (DevOps) | P1 |
| TC-32 | AC-H1 | Như TC-30 | Push develop đè theme (S6), rồi push lại file đã pull (S7) | Ghi setting mất hay giữ sau push; S7 hiện lại giá trị thì fixture áp tự động được | tay (DevOps) | P1 |

## Case biên (ngoài AC)
- Rỗng: store chưa áp fixture (thiếu cả 2 marker nhận biết) → TC-10..TC-16 `test.skip` có lý do `NOT_APPLIED`, không fail. Thiếu 1 marker → chạy và fail (fixture áp dở).
- Tối đa: shop the look có 4 row (fixture), bundle 6 sản phẩm; bậc 3 của bundle `tier_3_percent = 0` không hiện.
- Mất mạng: TC-16 (ảnh lỗi). Lỗi Cart API không thuộc ticket này (TE-12 QA).
- 360px: TC-11 ở 360 chạy cả project mobile (Pixel 7).
- Keyboard, screen reader: không thuộc fixture; AC-H7 ở TE-17-R2-QA1.
- Editor (`design_mode`) vs storefront: placeholder "Add a…" chỉ trong editor; TC-20 kiểm storefront không có "Add a ".
- Merchant chưa chọn resource: TC-20 (theme không fixture) — block rỗng không render, không link demo.
- Hết hàng: TC-13 skip khi < 3 sản phẩm còn hàng; TC-14 skip khi row hết hàng (AC-H19 "row hết hàng không tính vào tổng" kiểm ở TE-12 QA).
- 429: `gotoStore` thử lại theo Retry-After; không gọi JSON storefront.

## Dữ liệu test (hoa-qua-nhap-khau (efitco-ai-dev))
- `tests/fixtures/home-figma.json`: 14 collection `figma-*`, P01–P24 (`home-content.md` 3.2), blog `figma-blog` 5 bài, metafield P15 (rating 4.9/341, spec_1–4, `custom.sale_ends_at`), discount tự động `figma-bundle-tier-2` (2 món 10%), `figma-bundle-tier-3` (3 món 15%), `figma-setup` (4 món 10%), mã `WELCOME15`, ảnh `efx-*` trên Content > Files.
- Biến: `PREVIEW_URL` (theme đã áp fixture), `STORE_PASSWORD`, `FRESH_THEME_ID` (theme không fixture, chỉ đặt sau ES1-T304).

## KHÔNG CHẮC
- Nơi lưu setting static block chưa đo (ES1-T428); TC-30..TC-32 là bước tay của DevOps.
- Nhãn nút newsletter là setting nào sau ES1-T304 chưa biết (`pending_settings`); TC-15 đo theo text, không theo id.
- Bậc AC-H19 theo Figma 10% (SRS ghi KHÔNG CHẮC, chờ ES1-T199 #2); đổi thì sửa `shop-the-look.tier_1_percent` và discount `figma-setup` cùng lúc (TC-04b giữ khớp).
- AC3 trong cột AC là TE-10 AC3 (R8 nội dung mẫu, D10), mục TE-17 của SRS dẫn chiếu.
