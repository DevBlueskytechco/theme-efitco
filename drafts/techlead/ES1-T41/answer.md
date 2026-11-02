KHÔNG CHẮC: mục 2 (ảnh inline) chờ PO ở ES1-T42 xác nhận phạm vi; ảnh inline ở ≤ 768 và eyebrow accent trên sand chờ Designer người ở ES1-T43.

# ES1-T41 — Trả lời 4 câu hỏi từ ui-spec ES1-T34

Quyết định đầy đủ: docs/adr/0005-nen-sand-anh-inline-cta-link-rich-text.md. Task thi công: ES1-T44 (dev-fe, 5 pt, chặn bởi ES1-T42 cho phần ảnh).

1. Nền #EBE6E0: ĐỒNG Ý. Token `background_sand` #EBE6E0 + `background_sand_foreground` #1A1A1A (14.03:1). Setting `background_sand_color`, `background_sand_foreground_color` → `--color-background-sand(-foreground)`. 12 node trong snapshot dùng màu này. Gắn nền bằng param `background: 'sand'` của container `id: 'home-intro'` trên index (bao rich-text + collection list 1:464), không thêm setting container. Trên sand: chữ phụ dùng `--color-muted` (6.81), cấm `--color-muted-light` (4.30); accent 4.03 chỉ cho chữ lớn → ES1-T43.
2. Ảnh inline 1:455: THÊM (chờ PO). 2 setting `inline_image` (image_picker) + `heading_after_image` (text, "to Train."); `heading` default "Everything You Need". Ảnh nằm trong cùng thẻ heading, `alt=""`, lazy, cao 0.94em tỉ lệ 165/94, radius card. Không dùng chuỗi dấu cách, không ký hiệu chèn.
3. Icon 1:126: KHÔNG làm mới snapshot — 1:126 là component `remote` (thư viện ngoài), refresh không ra main component. Instance 1:463 = 1 vector 20 × 16, ảnh 1-453 là mũi tên phải → dùng `slideshow-icon` name `arrow`, hộp 20 × 16, lật `:dir(rtl)`. Nợ: đổi tên snippet thành `icon` khi TE-3 cần.
4. CTA: modifier CSS `.button--link` trong assets/base.css, không setting kiểu nút. Chữ heading 700 28/34 -0.02em, min-height 44, gap `--space-3`, hover gạch chân + icon dịch `--space-1` (tắt khi reduced motion), focus dùng rule `.button:focus-visible`. Hero giữ `.button`.

Phát hiện thêm
- ADR 0001 bổ sung 30/10 ghi id `color_<token>` nhưng code dùng `<token>_color` → đã ghi bổ sung ADR 0001 theo code.
- index.liquid có 2 static container cùng loại không `id` → container mới phải có `id: 'home-intro'` (ES1-T44).
