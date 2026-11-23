# Changelog design system Efitco

Một số bản cho cả design system: token (`docs/tokens.json`), component và màn DS (`drafts/designer/_kit/kit.css`, `drafts/designer/ES1-T251/foundation.html`), quy tắc (`DESIGN.md`, `docs/ui-spec/foundation.md`, `docs/design/content.md`). Lập ở ES1-T535 lượt 2 (CTO 21/11, patterns-14). Từ bản 2.0.0 nguồn chuẩn của design system là kit và mockup (CTO 21/11, ES1-T567); các bản 0.1.0–1.3.0 bên dưới là lịch sử, lập khi file thiết kế ngoài repo còn là gốc.

Bản hiện tại: **2.0.0** (CTO chốt số bản 21/11 lượt 2). Số bản ghi ở `docs/tokens.json` `_version`, đầu màn foundation.html và đầu foundation.md.

## Quy tắc đánh số: major.minor.patch

| Phần | Tăng khi | Ví dụ |
| --- | --- | --- |
| major | Đổi tên hoặc xoá token, setting id, class component, hoặc đổi nguồn chuẩn: phá theme đã cài hoặc trang đang dùng | xoá khối biến tiền tố cũ đặt theo giá trị; bỏ `--line-height-heading`; đổi `card_corner_radius` thành tên khác; bỏ `.button--tertiary` |
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

### 2.0.0 — 21/11/2026 — ES1-T567 (CTO chốt số bản 21/11 lượt 2)

CTO 21/11: mockup là nguồn chuẩn, thiết kế theo chuẩn Design System đã nạp (Polaris trước), nhãn nút sentence case. Bản major vì đổi nguồn sự thật, bỏ một token và đổi giá trị nhìn thấy trên mọi trang. Chi tiết: `drafts/designer/ES1-T567/notes.md`; quyết định: `docs/design/decisions.md` mục "CTO 21/11 — ES1-T567".

Đổi phá vỡ:
- Nguồn sự thật: `drafts/designer/_kit/kit.css` + mockup `drafts/designer/**` là gốc; `docs/tokens.json` và tài liệu chép theo; code theme phản chiếu `:root` của kit. Thay thứ tự cũ bắt đầu từ `settings_schema.json`. Bản vẽ được dựng lại TỪ mockup (`docs/design/figma-handoff.md`).
- Line-height: bỏ `--line-height-heading` 1.2 dùng chung (đã xoá khỏi kit, không trang nào còn đọc); mỗi bậc một token, dòng rơi bội 4px: h1 40/48 → 48/56, h2 32/40 → 36/44, h3 28/36, h4 20/24, display 52/60 dưới 48rem, eyebrow 14/20 → 16/20. Body 16/26 → 16/24, small 14/22 → 14/20, `.rte` 16/27.2 → 16/28. Cỡ chữ không đổi.
- Thang khoảng cách: `--space-4xl` 56 → 48; `--space-7` thành alias của `--space-4xl`; padding section dưới 64rem 56 → 48.
- Nhãn nút, link dạng nút, link CTA: Title Case → sentence case ("Add to cart"). Toast, tiêu đề alert, badge, label: sentence case (chốt).
- Tag bài viết `.badge--tag`: nền accent → trung tính.
- Tỉ lệ ảnh về bộ có tên: hero từ 80rem 1798/827 → 2/1, collection card 336/220 → 3/2, các khung trang chủ → 1/1, 4/3, 16/9, 9/16.

Thêm token (17): `--space-050` 2, `--space-150` 6; `--letter-spacing-label`; `--line-height-h1`, `-h2`, `-h3`, `-h4`, `-eyebrow`, `-title`, `-reading`, `-price-lg`; `--tab-height-desktop` 40, `--row-height` 52, `--round-button-size` 52, `--count-badge-size` 20, `--progress-height` 4, `--meter-height` 8. `:root` của kit: 134 → 151 biến.

Sửa giá trị: `--tab-padding-inline` 28 → 24; `--band-inset` 60 → 64 (dải rộng 1798 → 1792 ở 1920); đệm toast 10 → 12; footer 15 → 16, 45 / 46 → 48, 14 → 16, ảnh chồng 98 × 123 → 96 × 120, logo 86 × 26 → 80 × 24, cờ 26 → 24; số đếm giỏ 18 → 20; check option card 22 → 24; link menu header letter-spacing −0.04em → −0.01em; `--control-height` khai báo 48 trực tiếp; `tabular-nums` cho giá, dòng tổng, stepper, số trang; `.price--lg` 20/28, `.price--xl` 28/36.

Tài liệu: gỡ tên file thiết kế cũ, mã node, tên text style / biến của file đó khỏi mockup và tài liệu hiện hành; chú thích nguồn theo 5 dạng (Chuẩn: Polaris … / Chuẩn: hệ khác … / CTO dd/mm / AA: n:1 / Thiết kế: …); tokens.json thêm `_source_notation`, `line_height`, `letter_spacing`, `aspect_ratio`, 6 khoá `component`; thêm `docs/design/figma-handoff.md`.

Không đổi: bảng màu, 2 họ font, cỡ chữ, thang bo góc, lưới và gutter, bề rộng trang, breakpoint, motion, bóng, lớp.

Bổ sung lượt 2 (CTO chốt 21/11, cùng bản 2.0.0; quyết định: `docs/design/decisions.md` mục "CTO 21/11 lượt 2 — ES1-T567"):
- Đổi phá vỡ: heading h1–h4, tiêu đề section, dialog / drawer / popup, empty state, tab, link menu, nhãn chip lọc: Title Case → sentence case ("Browse categories", "Order summary", "Our story"). Giữ cách viết của tên thương hiệu, tên sản phẩm / collection / bài viết (dữ liệu merchant), tên riêng, từ viết tắt. Chữ HOA của display, eyebrow, nhãn nhóm, tiêu đề popup marketing do CSS, chữ nguồn sentence case.
- Sửa giá trị: `--control-height` 48 ở mọi mốc (bỏ 52 từ 80rem; nút tròn 52 và hàng 52 giữ); `--space-7xl` 120 → 128, `--section-gap` từ 64rem = 128 (Polaris React space 128px); ngưỡng chỉ báo tải 300 → 500 ms (`loading.indicator_delay_ms`).
- Sửa chuỗi: nút big offer "Shop the offer" → "View offer"; badge và chữ phần trăm giảm giá dùng dấu trừ U+2212 ("−24%").
- Chốt giữ: "Checkout"; body weight 500; section dưới 64rem 48; tag bài viết trung tính; countdown big offer cỡ Compact; h1 48/56, display dưới 48rem 52/60; link tóm tắt lỗi form sàn 44 dưới 80rem. Ghi là bản sắc thương hiệu: eyebrow accent, hover và nhãn card, hình Tab / Chip, tiêu đề HOA popup marketing, nhãn nhóm HOA.
- Không thêm, không xoá token: `:root` của kit vẫn 150 biến.
- Tài liệu: `docs/design/content.md` §2.2 (ngoại lệ sentence case), §8.2 (khoá locale heading / dialog / tab / menu / số đếm / ký tự cho FE); sửa lỗi lặp tiền tố ở mọi dòng của `docs/ui-spec/foundation.md`; ảnh PNG mọi trang đã chụp lại.

### 1.3.0 — 21/11/2026 — ES1-T535 lượt 2 (đề xuất, chờ CTO duyệt)

Hoàn thiện 19 phát hiện "Lệch chuẩn" và "Còn thiếu" của báo cáo rà soát Polaris-first. Không thêm giá trị màu, không thêm font.

- Thêm token: `--icon-size-sm` 16, `--icon-size-md` 20, `--icon-size-lg` 24, `--icon-stroke-width` 1.5; `--tab-padding-inline` 28 (tầng component; bản 2.0.0 đổi thành 24).
- Thêm tài liệu kiến trúc 3 tầng token, bảng đổi 24 biến tiền tố cũ đặt theo giá trị đang dùng (91 lần), quy tắc nguồn sự thật 4 nơi (sổ quyết định thắng; thứ tự cho token không có dòng sổ là đề xuất); tokens.json thêm `_version`, `_tiers`, `_source_of_truth`, `icon`, `breakpoint`, `component`, `loading`, `thumbnail`.
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
- Thêm tài liệu: ma trận 6 scheme × 6 role; ngoại lệ line-height, popup marketing tự mở, Title Case, accent cho tag bài viết (ba ngoại lệ line-height, Title Case, tag accent đã bỏ ở bản 2.0.0).
- Sửa giá trị: spinner trong nút 700 → 1400; đóng 200 → 150; dialog vào 300 → 250; lệch reveal 80 → 60.

### 1.1.0 — 20/11/2026 — ES1-T527 DS check (CTO chốt 20/11)

Đồng bộ với file thiết kế ngoài repo của thời điểm đó (bản vẽ cũ; từ 2.0.0 không còn là nguồn).

- Thêm token: tên khoảng cách `--space-2xs…7xl`; thang bo góc `--radius-xs…xl`, `--radius-panel`, `--radius-dialog`; `--font-size-h4`; `--control-height-compact` 44; `--shadow-none/raised/overlay/bar`; `--layer-*` 8 bậc; màu dẫn xuất `--color-accent-on-sand` ghi vào tokens.json.
- Thêm component (kit mục 13b) và màn DS: chip, selectable option, variant picker, quantity stepper, giá + rating, facet group, collection card, link danh mục, input group + search field, listbox, data table, progress meter, thanh dính đáy / teaser / popover, dòng sản phẩm gọn, panel tối; nút tertiary, small, icon + nhãn.
- Sửa giá trị: `badge_new` #467A48 → #4B824D; `background_alt` #F4F4F4 → #F4F4F5; `background_dark` #1A1A1A mọi nguồn; thang chữ theo bộ text style của bản vẽ cũ (display 52 → 100, h1 40 → 48, h2 32 → 36, h3 28, eyebrow 14 → 16), line-height heading 1.2; body Inter 500 16/26; radius card 12 trong tokens.json; dialog 24 → 20; section mobile 56; gutter 12 / 16 / 24.
- Không token nào bị đổi tên hoặc xoá.

### 1.0.0 — 11/11/2026 — ES1-T251 vòng 3 + ES1-T291 (CTO chốt 10/11, 11/11)

Bản foundation đầy đủ đầu tiên cho mọi trang con và overlay: `docs/ui-spec/foundation.md`, `drafts/designer/_kit/kit.css`, màn foundation.html ở 360 / 768 / 1280 / 1920.

- Header một biến thể: thanh tối 80 + noise ở mọi trang, không đè ảnh (sổ 10/11).
- Footer; breadcrumb, nút, tab, badge, card sản phẩm, card bài viết, hàng ngang + thanh tiến trình, form, accordion, dropdown / mega, drawer, dialog / bottom sheet, toast, trạng thái rỗng / lỗi / đang tải, motion.
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

### 0.1.0 — 22/10/2026 — token trích từ bản vẽ cũ

- `docs/tokens.json` trích từ khung trang chủ desktop của bản vẽ cũ (màu, font, khoảng cách, bo góc, container); token thành theme settings (ADR 0001).
