KHÔNG CHẮC: cơ chế "Chrome không tính border-image là ứng viên LCP" suy từ spec Element Timing/LCP (chỉ background-image url() và ảnh nội dung) và cách Chromium báo PaintTimingDetector ở fill layer; chưa đo được trên máy (không chạy Playwright/Lighthouse local). TC-24 ES1-T386 @360/@768 đã gỡ test.fail nên CI sẽ xác nhận; đỏ thì cần hướng khác (tile noise nhỏ hơn, cần người tạo PNG).

# ES1-T494: LCP trang 404 là `<header>` (nền noise-dark.png) thay vì h1 — TE-21 AC8/AC16

Bug: ES1-T386-B04 (drafts/qa/ES1-T386/bugs/B04.md). Căn cứ: srs TE-21 AC8, AC16; docs/ui-spec/404.md §8 "LCP: h1".

## Nguyên nhân
`.site-header` (critical.css) vẽ noise bằng `background: … url('noise-dark.png')`. Chrome tính background-image url() là ứng viên LCP, diện tích = vùng hiển thị × min(1, 240² / diện tích hộp) ≈ 28 800 px² @360, 57 600 px² @768 → lớn hơn vùng chữ h1 404 (48px 2 dòng / 70px). Announcement bar có cùng kiểu nền, @768 ≈ 768 × 44 ≈ 34 000 px², sát vùng h1 → cũng có thể chiếm LCP.

## Sửa
Noise vẽ bằng `border-image: url('noise-dark.png') 0 fill/0 repeat` (slice 0 + fill: phần giữa = cả ảnh, lặp 1:1 như background; width 0 nên không chiếm chỗ). Màu nền giữ ở `background`. Không đổi asset ảnh, không đổi bố cục.
- `assets/critical.css`: `.site-header`, `.announcement-bar`.
- `assets/base.css`:
  - `.announcement-bar::after` vẽ vạch đáy 1px (12% trắng) đè đúng ô viền cũ, vì border-image phủ cả viền thật; `border-block-end: 1px solid` giữ để chiều cao không đổi.
  - `.announcement-bar--placeholder` (editor): `border-image: none`, viền trong suốt → giữ nền alt như cũ.
  - `.gift-card__bar` (thanh tối thay header của gift card) đổi cùng cách.
- Không đổi: footer, `.template-password` (nền body), thẻ gift card (có bo góc, border-image không bị cắt theo radius), thanh predictive popup (mở sau khi tải; ES1-T129 kiểm background-image của nó).
- `tests/e2e/ES1-T386.spec.ts`: gỡ `test.fail(width < 1280, 'ES1-T386-B04 …')` ở TC-24 theo ticket, sửa comment đầu file.

Ảnh hưởng tốt thêm: mọi trang có LCP là chữ nhỏ hơn vùng header (page, contact, article không ảnh bìa — TE-20 AC14) không còn bị header chiếm LCP.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi (22 warning có sẵn, PR không đổi Liquid).
- `wc -c assets/critical.css` = 10 082 B ≤ 10 240.
- base.css gzip: không đo được trong sandbox (gzip cần duyệt); thêm ~0,5 KB raw.
- Không file JS trong diff; 0 literal màu (color-mix trên token).
- Spec khác: chỉ ES1-T129 (thanh predictive popup) và ES1-T386 TC password (body) kiểm `background-image` chứa noise-dark → không đụng.
- Playwright TC-24 @360/@768/@1280/@1920, Lighthouse 404 desktop/mobile, visual diff header 3 breakpoint: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
