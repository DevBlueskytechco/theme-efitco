KHÔNG CHẮC: ticket nêu "panel 256" và đề xuất giảm padding panel, nhưng snapshot Figma 1:560 có panel 260 (padding 40, 40 + 104 + 24 + 52 + 40) và hàng 93. Phần lệch 4px nằm ở hàng (94 so với 93), không ở panel, nên sửa trần chiều cao hàng. docs/ui-spec/index-1280.md:87 vẫn ghi hàng `clamp(80, 4.9vw, 94)`, cần Designer/Tech Lead sửa thành 93 (FE không sửa ui-spec).

# ES1-T501 — Shop the look @1920: ảnh cao 816 sau bundle-form.js; spec chờ data-enhanced

## Nguyên nhân
- Từ 64rem `.shop-the-look__media` dùng `align-self: stretch`, nên ảnh cao bằng cột phải.
- Cột phải lúc 1920: Fits 99.84 + 24 + hàng (4 × 94 + 3 × 12 = 412) + 24 + panel 260 = 819.84.
- Figma 1:560: Fits 100 + 24 + hàng (4 × 93 + 3 × 12 = 408) + 24 + panel 260 = 816.
- Hàng đang là `clamp(80, 4.9vw, 94)`, tức 94 lúc 1920. Figma là 93.
- Trước khi JS chạy, dòng Total rỗng nên cột phải thấp hơn khoảng 2px. Spec đo ngay sau khi cuộn nên kết quả xanh hay đỏ tuỳ JS tải nhanh hay chậm.

## Thay đổi
- `assets/base.css` (@media 64rem, `.shop-the-look-row`): trần `min-block-size` đổi từ `calc(var(--space-1) * 23.5)` (94) thành `calc(var(--space-1) * 23.25)` (93).
  - 4.9vw chỉ chạm trần 93 khi viewport ≥ ~1898px. 1280 (sàn 80), 768 và 360 (nằm ngoài media) không đổi.
  - Dự tính sau JS ở 1920: 815.84.
- `tests/e2e/ES1-T341.spec.ts`: thêm `root.scrollIntoViewIfNeeded()` và `expect(root).toHaveAttribute('data-enhanced', '', { timeout: 10000 })` trước khi đo `box(image)` ở 2 test:
  - test ảnh 4 khung;
  - test 1280 "đáy panel = đáy ảnh".
  - Không nới TOL.
- Không đổi JS hay Liquid.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi, 22 cảnh báo, đều có từ trước, không thuộc file sửa.
- Không file `.js` trong diff.
- base.css: diff tăng khoảng 60 B. Chưa đo được gzip trong phiên vì lệnh `gzip`/`python` bị chặn cần duyệt. Trước đó đã dưới trần 57 344, CI đo lại.
- Không có spec tĩnh nào khớp chuỗi `23.5`/`4.9vw` cũ.
- ES1-T341 (4 khung ảnh 320×279, 728×635, 819×714, 936×816 và test 1280 đáy panel), Lighthouse, ảnh 3 breakpoint: chờ CI.
