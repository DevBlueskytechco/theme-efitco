KHÔNG CHẮC: (1) chưa đo được gzip `assets/base.css` trong phiên (gzip/node/python bị chặn chờ duyệt): raw 261 636 → 267 229 B (+5 593, phần lớn là comment), trần tạm 57 344 B gzip, chờ CI đo bằng `zlib.gzipSync`; (2) AC8 SRS 0.5 ("0 món → nút disabled", "không JS → tạm tính, tổng in sẵn từ Liquid") đảo kỳ vọng cũ của `tests/e2e/ES1-T147.spec.ts` (nút ẩn khi 0 món; số liệu ẩn khi không JS) — QA cần cập nhật 4 test liệt kê ở dưới.

# ES1-T339 TE-12-R2-FE1: bundle-builder, base.css, locales

AC: TE-12 AC1, AC-H18 (store dev), AC6 HB1 (phần markup/CSS), AC8. Spec: `docs/ui-spec/index-mobile-b.md` §1, §1.1; `docs/ui-spec/index-1280.md` R1, khối 9; ADR 0007 (dải đáy), ADR 0011 (default rỗng).

## Thay đổi

`blocks/bundle-builder.liquid`
- Liquid in sẵn theo món `preselect`: số món, dòng món, tạm tính, dòng giảm, thanh tiến độ, câu tiến độ, tổng (cùng phép tính `bundle-form.js`: bậc cao nhất đã đạt, `round(sub × % / 100)`, dedupe theo số lượng). Bỏ ẩn `[data-bundle-live]` trước khi nâng cấp và khi `scripting: none` → không JS vẫn có số, CLS 0.
- Mọi `tier_*_percent` = 0 (theme mới cài): không `data-tiers`, không dòng giảm, không thanh tiến độ, không câu "Add N more…", tổng = tạm tính (AC1). Có bậc: dòng giảm `--panel-saving` + icon tag + dấu − (AC8), ẩn khi chưa đạt bậc; câu tiến độ có icon khoá, `data-done` → icon tick khi đạt bậc cao nhất.
- Thanh dính 360 `<aside class="bundle-bar" data-bundle-bar hidden aria-label="Bundle summary">` ngay sau `<form>`: "{n} Items" / tổng (chữ ẩn "Total") + nút "Add Bundle To Cart" `type="submit" form="bundle-form-<id>"`; ô lỗi `role="alert"` rỗng trên hàng nút. Không JS: giữ `hidden`.
- Form có `id="bundle-form-<id>"`, `autocomplete="off"` (Firefox không khôi phục checkbox lệch số Liquid); lưới bọc `<fieldset>` + legend ẩn; panel `role="group"` `aria-labelledby` tiêu đề panel.
- Panel chia `__panel-main` (tiêu đề, đếm, danh sách) / `__panel-side` (tổng → nút) để 768 xếp 2 cột; mốc khác `display: contents`.
- Bỏ ghi chú giảm giá khỏi docblock (sổ 07/11), cập nhật hook cho BE.

`assets/base.css`
- 360: lưới 2 cột, card padding 8, vòng chọn 24 cách góc 8; panel cách lưới 32, padding 24; nút 48.
- 768: lưới 3 cột, card padding 12, vòng 24 cách 12; panel 2 cột (316 + 316, gap 32, padding 32).
- ≥ 64rem: lưới 7 cột trang + panel 5 cột, gutter 24: `calc((100% - 11 × 24) × 5/12 + 4 × 24)` → 1280 panel 503, card 222; 1920 panel 576, card 256. Padding panel `clamp(32, 2.5vw, 40)`. Bỏ `807fr/576fr` + gap 33 ở khối Figma 80rem; vòng Figma 20 cách 8 giữ ở ≥ 80rem.
- Cả card là vùng chọn (`label` phủ `inset: 0`, tên sản phẩm nổi trên vẫn là link). Hết hàng ảnh 0.6.
- 0 món: nút panel và nút thanh xám (`--color-border` / `--color-muted`, 6.71:1), `pointer-events: none`; thay `visibility: hidden` cũ.
- Chữ phụ panel dùng `--panel-muted` chung (FD1), xoá `--bundle-panel-muted`.
- Thanh: `position: fixed`, `z-index: var(--layer-bottom-bar)`, nền `--color-background-panel`, bo trên, padding 12/20/12 + safe area; hiện khi `html[data-bottom-bar="bundle"]` và không `[data-layer-open]`/`[data-consent]`; vào 250 ms, ra 150 ms chỉ `translate` + `visibility`, reduced motion tắt; ≥ 48rem `display: none`.
- `html[data-bottom-bar="bundle"]` → `--bottom-bar-height: var(--bundle-bar-height, 72px + safe area)`; ≥ 48rem = 0. Toast, teaser, Inbox đã đọc `--bottom-bar-height` → nhấc theo chiều cao đo thật (AC7/HB2).
- `.bundle-bar` thêm vào luật ẩn chung khi lớp mở/consent (layers §2.3).

`locales/en.default.json`: thêm `blocks.bundle_builder.bar_label`, `legend`; xoá `discount_note` (không còn dùng).
`locales/en.default.schema.json`: xoá `info.bundle_builder_discount_note`, `labels.discount_note` (không còn dùng); sửa `info.bundle_builder_collection` theo ADR 0011 (ẩn tới khi chọn collection).
`templates/index.te12.liquid`: bỏ tham số `discount_note` chết.

Không file JS trong diff. Không thêm setting.

## Hợp đồng cho BE (TE-12-R2-BE1, `assets/bundle-form.js`)
- Thanh: bỏ `hidden` trên `[data-bundle-bar]` khi nâng cấp; IntersectionObserver lưới + panel → gắn/gỡ `html[data-bottom-bar="bundle"]` (giữ khi focus trong thanh); ResizeObserver ghi `--bundle-bar-height` lên `:root`.
- Cập nhật `[data-bundle-bar-count]`, `[data-bundle-bar-total]` cùng hàm `update()`.
- `disabled` thật trên `[data-bundle-submit]` và `[data-bundle-bar-submit]` khi 0 món; `aria-busy` cả 2 nút khi đang thêm.
- Lỗi: ghi chữ vào đúng 1 nơi — `[data-bundle-bar-error]` khi thanh đang hiện, ngược lại `[data-bundle-error]`; xoá khi đổi lựa chọn.
- `[data-bundle-progress-text]`: bật/tắt `data-done` khi không còn bậc kế.
- `[data-bundle-lines]` đã có dòng Liquid in sẵn; `replaceChildren` hiện tại thay đúng.
- testid: `bundle-sticky-bar`, `bundle-sticky-bar-count`, `bundle-sticky-bar-total`, `bundle-sticky-bar-add`, `bundle-sticky-bar-error`.

## Test cần QA cập nhật (kỳ vọng cũ trái AC8 SRS 0.5)
- `ES1-T147` "AC1-markup chưa chọn gì thì nút không hiện…": nút giờ hiện, xám, không nhận chuột (BE gắn `disabled`).
- `ES1-T147` "AC4 mục hết hàng…" dòng `bundle-builder-submit` `toBeHidden()`: như trên.
- `ES1-T147` "nojs AC1 panel còn tiêu đề…; số liệu ẩn": số liệu giờ hiện, in từ Liquid.
- `ES1-T147` "AC1-markup … tiến độ, ghi chú" (tiêu đề còn chữ "ghi chú", assertion không đổi).

## Tự kiểm tra
- `shopify theme check`: 0 lỗi; 8 warning có sẵn ở `blocks/quiz-step.liquid`, `templates/index.liquid`, `templates/index.figma.liquid` (không thuộc ticket); `.theme-check.yml` không đổi.
- Quét dòng thêm trong `assets/base.css`: 0 hex/rgb/hsl, 0 `z-index` số, 0 `left/right/top/bottom`; px literal chỉ trong khối Figma ≥ 80rem như quy ước khối đó.
- `wc -c assets/critical.css` = 10 082 (≤ 10 240, không đổi). Gzip `base.css`: chờ CI.
- Preview, Playwright (`smoke`, ES1-T147, ES1-T149, ES1-T331 TC AC-H18 cần fixture store dev), Lighthouse desktop/mobile trang chủ, ảnh 360/768/1280/1920: chờ CI. AC-H18 chỉ đo được trên store dev đã áp fixture ES1-T331; AC6 hiện/ẩn thanh cần TE-12-R2-BE1.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
