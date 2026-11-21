# Changelog design system Efitco

Một số bản cho cả design system: token (`docs/tokens.json`), component và màn DS (`drafts/designer/_kit/kit.css`, `drafts/designer/ES1-T251/foundation.html`), quy tắc (`DESIGN.md`, `docs/ui-spec/foundation.md`, `docs/design/content.md`). Lập ở ES1-T535 lượt 2 (CTO 21/11, patterns-14).

Bản hiện tại: **1.3.0** (đề xuất, chờ CTO duyệt). Số bản ghi ở `docs/tokens.json` `_version`, đầu màn foundation.html và đầu foundation.md.

## Quy tắc đánh số: major.minor.patch

| Phần | Tăng khi | Ví dụ |
| --- | --- | --- |
| major | Đổi tên hoặc xoá token, setting id, class component: phá theme đã cài hoặc trang đang dùng | xoá khối `--figma-*`; đổi `card_corner_radius` thành tên khác; bỏ `.button--tertiary` |
| minor | Thêm token, component, biến thể, màn DS, quy tắc mà không phá cái cũ | thêm `--icon-size-*`; thêm `.alert--page`; thêm màn "Media" |
| patch | Sửa giá trị, sửa lỗi hiển thị, sửa tài liệu | `badge_new` #467A48 → #4B824D; sửa số tương phản trong bảng |

- Một PR đổi design system = một dòng trong file này + tăng `_version` trong `docs/tokens.json` theo phần lớn nhất bị chạm.
- Mỗi bản CTO hoặc BGĐ duyệt gắn một số. Bản đã duyệt không sửa lại; thay đổi tiếp theo ra số mới.
- Bản chưa duyệt ghi "đề xuất". CTO duyệt thì bỏ chữ "đề xuất" và ghi ngày duyệt.
- Ngừng dùng một token hoặc component: đánh dấu Deprecated (foundation.md §39) ở một bản minor, ghi thay bằng gì; xoá hẳn ở bản major kế tiếp.
- Đổi giá trị mặc định của setting là patch với theme mới cài; theme đã cài giữ giá trị merchant đã lưu.
- Việc code theme chưa theo kịp (mục "Cần FE" trong notes của ticket) không chặn số bản: số bản là của bản thiết kế; trạng thái dựng code xem nhãn Built ở foundation.md §39.

## Các bản

Các bản trước 1.3.0 được gán số hồi tố từ `docs/design/decisions.md` và notes của từng ticket.

### 1.3.0 — 21/11/2026 — ES1-T535 lượt 2 (đề xuất, chờ CTO duyệt)

Hoàn thiện 19 phát hiện "Lệch chuẩn" và "Còn thiếu" của báo cáo rà soát Polaris-first. Không thêm giá trị màu, không thêm font.

- Thêm token: `--icon-size-sm` 16, `--icon-size-md` 20, `--icon-size-lg` 24, `--icon-stroke-width` 1.5; `--tab-padding-inline` 28 (tầng component).
- Thêm tài liệu kiến trúc 3 tầng token, bảng đổi 24 biến `--figma-*` đang dùng (91 lần), quy tắc nguồn sự thật 4 nơi (sổ quyết định thắng; thứ tự cho token không có dòng sổ là đề xuất); tokens.json thêm `_version`, `_tiers`, `_source_of_truth`, `icon`, `breakpoint`, `component`, `loading`, `thumbnail`.
- Một hệ tên khoảng cách `--space-2xs…7xl` (`--space-1…8` thành alias); bảng tên cũ → mới; quy tắc giá trị ngoài thang; quy tắc bo góc lồng nhau; bảng radius lẻ → bậc thang.
- Kit hết bóng viết tay và z-index số; bảng component → bóng → lớp.
- Thêm component / biến thể: `.alert` 4 tone, `.alert--page`, `.alert__close`; `.form-message__list` + focus khối tóm tắt; `.data-table--stack`, `--stacked`; `.media*`, `.thumb*`; `.icon*`; `.button--wrap`, `.badge--wrap`; khối `:dir(rtl)`.
- Thêm màn DS: Icons, Token Architecture, Right-To-Left, Tabs (tách khỏi Buttons), Media, Alerts And Messages, Content And Voice.
- Đổi quy tắc: submit form lỗi thì focus vào khối tóm tắt (trước: trường lỗi đầu); ngưỡng hiện chỉ báo tải 300 ms dùng chung; drawer gọi theo inline-start / inline-end; phân vai Tab / Chip / Button tertiary; chuỗi dịch dài.
- Thêm: hướng dẫn nội dung `docs/design/content.md`, mục "Changing the design system" trong `CONTRIBUTING.md`, nhãn trạng thái vòng đời component, file changelog này.
- Sửa giá trị nhìn thấy: bóng nút hover, header đã cuộn, card bài viết hover về `--shadow-raised`.

### 1.2.0 — 21/11/2026 — ES1-T535 lượt 1 (CTO chốt 21/11)

10 phát hiện "Cần CTO chốt" của báo cáo rà soát Polaris-first.

- Thêm token: 6 alias trạng thái `--color-success`, `--color-warning`, `--color-critical` (+ `-foreground`); `--touch-target` 44; `--motion-enter` 400, `--motion-stagger` 60, `--motion-hero` 1400 vào kit (đủ 8 duration) + vai trò 3 easing.
- Đổi quy tắc: disabled không dùng opacity; vùng chạm 44 mọi mốc cho 6 nhóm; chọn mẫu thông báo (toast, inline, alert), giới hạn tiêu đề toast.
- Thêm tài liệu: ma trận 6 scheme × 6 role; ngoại lệ line-height, popup marketing tự mở, Title Case, accent cho tag bài viết.
- Sửa giá trị: spinner trong nút 700 → 1400; đóng 200 → 150; dialog vào 300 → 250; lệch reveal 80 → 60.

### 1.1.0 — 20/11/2026 — ES1-T527 DS check (CTO chốt 20/11)

Đồng bộ với Figma "Efitco Theme Final / Design System 2".

- Thêm token: tên khoảng cách `--space-2xs…7xl`; thang bo góc `--radius-xs…xl`, `--radius-panel`, `--radius-dialog`; `--font-size-h4`; `--control-height-compact` 44; `--shadow-none/raised/overlay/bar`; `--layer-*` 8 bậc; màu dẫn xuất `--color-accent-on-sand` ghi vào tokens.json.
- Thêm component (kit mục 13b) và màn DS: chip, selectable option, variant picker, quantity stepper, giá + rating, facet group, collection card, link danh mục, input group + search field, listbox, data table, progress meter, thanh dính đáy / teaser / popover, dòng sản phẩm gọn, panel tối; nút tertiary, small, icon + nhãn.
- Sửa giá trị: `badge_new` #467A48 → #4B824D; `background_alt` #F4F4F4 → #F4F4F5; `background_dark` #1A1A1A mọi nguồn; thang chữ theo 18 text style Figma DS2 (display 52 → 100, h1 40 → 48, h2 32 → 36, h3 28, eyebrow 14 → 16), line-height heading 1.2; body Inter 500 16/26; radius card 12 trong tokens.json; dialog 24 → 20; section mobile 56; gutter 12 / 16 / 24.
- Không token nào bị đổi tên hoặc xoá.

### 1.0.0 — 11/11/2026 — ES1-T251 vòng 3 + ES1-T291 (CTO chốt 10/11, 11/11)

Bản foundation đầy đủ đầu tiên cho mọi trang con và overlay: `docs/ui-spec/foundation.md`, `drafts/designer/_kit/kit.css`, màn foundation.html ở 360 / 768 / 1280 / 1920.

- Header một biến thể: thanh tối 80 + noise ở mọi trang, không đè ảnh (sổ 10/11).
- Footer theo Figma 1:1104; breadcrumb, nút, tab, badge, card sản phẩm, card bài viết, hàng ngang + thanh tiến trình, form, accordion, dropdown / mega, drawer, dialog / bottom sheet, toast, trạng thái rỗng / lỗi / đang tải, motion.
- Một cặp màu cho mọi panel tối: `--panel-muted`, `--panel-saving` (sổ 11/11 FD1).
- Rich text chung `.rte`; quy tắc nút và icon có thương hiệu theo yêu cầu Shopify Theme Store (sổ 11/11).
- Spec dùng chung riêng: variant-picker, pagination, layers, countdown, announcement-bar, localization.

### 0.3.0 — 09/11/2026 — ES1-T251 vòng 1–2 (CTO chốt 09/11)

- Chỉ tiêu nghiệm thu Lighthouse thành ràng buộc thiết kế (AA mọi nơi, vùng chạm ≥ 24, mobile ≥ 44).
- Viền ô nhập `--color-muted-light` / `--color-muted-on-dark`; toast 4 loại (warning accent, success badge-new); eyebrow accent, trên sand `--color-accent-on-sand`; nút next / back tròn 52; hàng ngang có thanh tiến trình; chuyển động chỉ transform / opacity / clip-path.
- Mọi trang và overlay thiết kế đủ 360, 768, 1280, 1920.

### 0.2.0 — 30/10/2026 — quyết định tương phản và font (CTO 27/10, 30/10)

- `muted_light` #6B6B6B thay #999999, #808080 trên nền sáng (27/10); `accent` #C8400E thay #D94610 (30/10).
- Font: heading Sofia Sans Condensed, body Inter, chỉ qua `font_picker` (30/10).

### 0.1.0 — 22/10/2026 — token trích từ Figma

- `docs/tokens.json` trích từ Figma node 1:359 (màu, font, khoảng cách, bo góc, container); token thành theme settings (ADR 0001).
