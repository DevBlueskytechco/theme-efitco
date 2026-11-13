KHÔNG CHẮC: (1) số đo 1280: H1 → câu phụ 24, câu phụ 16, câu phụ → nút 48–60 theo Figma 1:422, khác index-1280 §2.1 (32 / 18 / 48–64); bo 24 ở 1920 theo Figma 1:423, khác ô "bo 16" của bảng §1. Hỏi Designer ở ES1-T448, im lặng thì giữ. (2) critical.css không đổi: còn 323 B, base.css vẫn chặn render nên CSS hero ở base.css không gây FOUC/CLS. (3) Hook `data-dots` đặt trên `.slideshow__dots` (hợp đồng §4 không ghi phần tử). (4) Nút pause dưới 80rem giữ nguyên, phần autoplay dừng dưới 80rem (AC8) thuộc TE-2-R2-BE1; ẩn pause lúc này sẽ làm đỏ ES1-T30 mobile.

# ES1-T332 TE-2-R2-FE1: hero 1280 / 768 / 360, chữ hero hiện dần 400 ms

AC: TE-2 AC2, AC6, AC7 (phần CSS/markup), AC10, AC-H29. Nguồn: index-mobile-a §2, §9.2, §10, §11; index-1280 §1 hàng 2, §2.1; sổ 10/11 (hero 360, lớp 30%), 11/11 HA1, HA2, HD1, HD2.

## Thay đổi
- `assets/base.css`: thay khối `/** Slideshow */` bằng khối mới mobile-first, gỡ các rule hero cũ rải rác: hero trong khối Figma 1920 (`.slideshow { 61px }`, `height: 827px`, `top: 388px`, chấm 40 × 4…), khối "Mobile (ảnh review 15)", "1. Nội dung hero thẳng mép trái", hero trong "Chuyển động v2" (chữ 900 ms + ảnh `motion-settle` scale 1.12) và keyframes `motion-settle`.
  - < 48rem: tràn màn 3/4, không bo, lớp tối theo setting, chữ luôn căn trái mép trang ở đáy (padding 32 / 60, khoảng 12, câu phụ → nút 24, câu phụ ≤ 30ch), nút 48; 2 chấm vùng chạm 44 (chấm 12) đáy trái, chấm đầu thẳng mép 20; không mũi tên.
  - 48rem: tràn 4/3, không bo, chữ giữa dọc rộng ≤ 28rem, căn theo setting, khoảng 16, câu phụ → nút 28; 2 nút 52 góc dưới phải (đáy 24, mép 20, cách 8); không chấm.
  - 80rem: `--hero-inset = clamp(0, lề − 64, 100cqi × 61 / 1920)` (0 ở 1280, 61 ở 1920 = Figma 1:422), chữ mép `--hero-edge = lề − inset` (20 | 191), tỉ lệ 1798/827, bo 16 → 24 theo `--hero-round = min(inset, 60)`, không lớp tối, H1 `min(var(--font-size-display), 6.25vw)` (80 | 100), chữ giữa dọc (1920 y 212 như Figma). Mũi tên: công tắc `--hero-corner` trong `clamp()`: rìa < 100 gộp góc dưới phải (đáy 24, phải 24), rìa ≥ 100 hai bên giữa dọc cách mép thẻ 60. Lề tính bằng `100cqi` (`.slideshow` là container) nên không lệch vì thanh cuộn.
  - Focal point: `object-position: var(--focal-point, center)`.
  - AC10: chỉ chữ slide 1 (eyebrow, H1, câu phụ, nút) chạy `hero-text-in` lúc tải: opacity 0 → 1 + dịch 16 → 0, `--motion-enter` 400 ms, lệch `--motion-stagger` 60 ms, `--ease-out`; xong lúc 580 ms. Trong `prefers-reduced-motion: no-preference`. Ảnh và lớp tối không có animation.
  - AC-H29: bỏ padding-top `--header-height` cũ của nội dung (thời header đè hero).
- `snippets/css-variables.liquid`: thêm `--motion-enter: 400ms`, `--motion-stagger: 60ms`, `--figma-hero-cta-width: 233px` (CTA 1:433; `min-inline-size` cho nút hero ở 80rem).
- `blocks/slideshow-slide.liquid`: slide không `priority` dùng `<p>` cùng class thay `<h2>` (1 h1/trang, index-1280 §2.1); `sizes="(min-width: 80rem) 100vw, (min-width: 48rem) 164vw, 291vw"`, srcset 720–1920w, tối đa 1920 (§9.2); `--focal-point` từ `image.presentation.focal_point`; `info` cho ảnh ("left 45% plain", HA2) và overlay (chỉ mobile/tablet). Doc cập nhật.
- `blocks/slideshow.liquid`: doc bỏ `data-header-overlay`/"header overlays it", ghi điều khiển theo mốc; `data-dots` trên danh sách chấm (hợp đồng FE/BE §4).
- `templates/index.liquid`: `overlay_opacity: 30` cho slide 1, 2 (index-mobile-a §11, §12).
- `locales/en.default.schema.json`: `info.slide_content_alignment` (mobile căn trái), thêm `info.slide_image`, `info.slide_overlay_opacity`.

## Sửa sau CI run 43386307003 (CTO 13/11)
- ES1-T176 "slide chưa về khung" (slide 1, 2): thẻ lùi 60 thay 61 nên x lệch 1 px (ngưỡng < 1), không phải do chuyển động (test chạy reducedMotion, slide 1 không bấm Next). Inset 1920 nay = 61, thẻ 1798 × 827 đúng node 1:423/1:438; bo góc tách sang `--hero-round` để giữ 24.
- CTA 232.28 → 233: chữ Inter 600 trình duyệt đo 142.28, Figma làm tròn 143. `.slideshow__buttons .button { min-inline-size: var(--figma-hero-cta-width) }` ở 80rem; nhãn dài hơn thì nút giãn theo chữ.
- base.css gzip: develop 51 217 B → nhánh 50 814 B (−403 B), không tăng so develop (trần 49 152 còn vượt từ develop, ES1-T454). Rút comment khối slideshow; CSS hero cũ đã gỡ ở lượt trước.
- critical.css 10 014 B ≤ 10 240 (không đổi so develop).

## Hook cho BE (TE-2-R2-BE1)
Không đổi testid. Giữ `slideshow`, `slideshow-track`, `slideshow-controls`, `slideshow-prev`, `slideshow-next`, `slideshow-dots`, `slideshow-dot`, `slideshow-pause`, `slideshow-live`, `slideshow-slide`, `slideshow-heading`. Thêm `data-dots` trên `.slideshow__dots`. CSS hiện chấm chỉ dưới 48rem, mũi tên từ 48rem; `inert`, `aria-current`, dừng autoplay dưới 80rem do JS.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi; 23 warning ở file khác (bundle-builder, featured-product, quiz-step, testimonial-item, empty-state, index.figma, index.te12, index.liquid `default_verified` có sẵn), không warning mới ở file sửa.
- `wc -c assets/critical.css` 10 014 ≤ 10 240 (không đổi); `gzip -c assets/base.css | wc -c` 50 814, develop 51 217 (không tăng).
- Khối CSS mới: 0 màu literal, 0 `z-index`, 0 thời gian rời, 0 thuộc tính vật lý (left/right/top/bottom); ngoặc cân.
- Không file JS trong diff.
- Đối chiếu test có sẵn: ES1-T235 (mobile tràn, bo 0, ẩn mũi tên, chấm 44), ES1-T30 (desktop 1280 có mũi tên; mobile pause còn khi bật autoplay), ES1-T180 (1 h1, testid heading giữ trên `<p>`), ES1-T176 1920 (thẻ x 61 / Figma 61, 1798 × 827, CTA 233, chữ x 252, mũi tên giữa dọc cách mép 60, eyebrow 16/20, H1 100, câu phụ 16/24, nút cách 60).
- Preview, Playwright (360, 768, 1280, 1920), Lighthouse desktop/mobile, ảnh 4 mốc: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
