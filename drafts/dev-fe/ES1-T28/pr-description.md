KHÔNG CHẮC: (1) Chưa render lần nào: không có preview, mọi hành vi giao diện dưới đây mới là suy từ code, chờ CI. (2) Figma 1:418 (chấm) và 1:363 (header) trả 429 cả phiên, ảnh render 1:422 không tải được từ sandbox; vị trí chấm, hero y=0 và tỉ lệ dưới 80rem là suy luận, đã hỏi ES1-T31. (3) Editor có tách settings cho 2 lần gọi `slideshow-slide` không: AGENTS.md không nói, QA kiểm trên preview editor (task-split KHÔNG CHẮC 4). (4) AGENTS.md chưa cập nhật, xem mục Còn thiếu.

# ES1-T28 TE-2-FE1: block slideshow, slideshow-slide

Spec: `drafts/techlead/ES1-T24/task-split.md` D1–D7 (trên nhánh feature/ai-ES1-T24, chưa có ở develop). Figma 1:422, 1:437.

## Thay đổi
- `blocks/slideshow.liquid`: root `slideshow-carousel`, 2 settings, track scroll-snap, controls render sẵn và ẩn đến khi có `data-enhanced`, hợp đồng hook trong `{% doc %}`.
- `blocks/slideshow-slide.liquid`: 11 settings, ảnh/video, overlay, chữ, 2 nút. Slide `priority` là h1 + eager + fetchpriority high; slide khác là h2 + lazy.
- `snippets/image.liquid`: thêm param tuỳ chọn `widths`, `sizes`, `loading`, `fetchpriority`. Không truyền thì chạy nhánh `image_tag` như cũ.
- `snippets/slideshow-icon.liquid` (ngoài danh sách ticket): 5 icon inline, vì dev-fe không ghi được `assets/*.svg`.
- `templates/index.liquid`: bỏ `hello-world` và `liquid-tips` khỏi trang chủ, đặt slideshow vào container đầu. File block giữ nguyên.
- `assets/base.css`: `.button`, `.button--secondary`, toàn bộ CSS slideshow. Không đụng `critical.css`.
- `locales/`: gộp vào `blocks.slideshow`, `general`, `info`, `labels`, không tạo key cha trùng.

## Lệch so với task-split
- `autoplay_speed` max 10 thay vì 9: theo SRS AC8 (3–10 s). Đã comment ticket hỏi Tech Lead.
- Nhãn slide dạng `{{ index }} / {{ total }}` theo SRS AC9, D9 ghi "Slide X of Y". Đã comment ticket.
- D2: không cần truyền param text cho slide 2, vì text 1:437 trùng 1:422. Vấn đề param ghi đè `block.settings` chưa phát sinh.
- Màu next dùng `--color-accent` #C8400E, không phải #D94610 của Figma (CTO 30/10, đã ghi trong docs/token-compliance.md).

## Điểm BE1 (ES1-T30) cần biết
- Giữ nguyên hợp đồng hook trong doc block. Thẻ `template` nằm trong `slideshow-dots`; dot clone có testid `slideshow-dot`.
- Nút pause do CSS quyết định: hiện khi `[data-enhanced]` + `[data-multiple][data-autoplay='true']`, hoặc có `video`. JS không cần tự ẩn/hiện.
- Icon đổi theo `data-playing`: có thuộc tính và khác `"false"` thì hiện icon pause, còn lại icon play.
- `slideshow-live` đang rỗng, JS điền nội dung.

## Rủi ro cần xem trên preview
- `video_tag`: có sinh thuộc tính `poster` mặc định không, và có nhận `aria-hidden` không. Chưa kiểm được; store demo chưa có video nên lhci, axe không phủ nhánh này (rule `video-caption` là critical nếu axe vẫn quét video).
- Focal point: dựa vào `image_tag` tự sinh `object-position`, chưa kiểm trên img thật.
- Slide chưa có ảnh trên store demo: LCP là chữ, Lighthouse không đo được nhánh ảnh + fetchpriority. `grep -c fetchpriority` = 1 chỉ có ý nghĩa khi slide 1 có ảnh.
- `ES1-T16.spec.ts`: đọc code thấy vẫn tương thích với hero thật (`simulateHero` chỉ thêm hook), chưa chạy.

## Tự kiểm tra
- Đạt: `shopify theme check --path .` 38 file, 0 offense.
- Đạt: `critical.css` 9785 byte, không đổi; 0 file JS trong diff; 14 testid + `slideshow-dot`; 13 settings (2 + 11); locale JSON parse được.
- Chờ CI: preview, đúng 1 h1, `fetchpriority` = 1, chặn JS vẫn cuộn, không tràn ngang 360/768/1280, axe, lhci ≥ 96/90/98, CLS, ảnh 3 breakpoint, ui-diff 1:422, header trong suốt và nền trắng khi cuộn 100px.
- Chưa có người làm: spec E2E phần FE (AC1–AC5, editor D2) cần ticket QA, dev-fe không ghi được `tests/`.

## Còn thiếu
- `AGENTS.md`: ticket yêu cầu cập nhật danh sách block, nhưng scope-guard chặn dev-fe. Orchestrator thêm `announcement-bar`, `slideshow`, `slideshow-slide` vào dòng Current blocks; `slideshow`, `slideshow-slide` vào Theme map.
- PR ~780 dòng, vượt ước lượng ~440 và ngưỡng 400 dòng: 355 dòng CSS, ~130 dòng schema + locale. Không tách vì cùng block, theo task-split.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
