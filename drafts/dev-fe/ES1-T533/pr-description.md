KHÔNG CHẮC: (1) dung lượng gzip base.css/aux.css không đo được trong sandbox (gzip/python cần duyệt); diff chỉ +~400 B raw nên coi là trong trần, CI đo lại. (2) Sửa 2 assertion test QA (ES1-T129, ES1-T386) đang kiểm `background-image` chứa noise — theo tiền lệ ES1-T494; QA xem lại nếu muốn tự sửa.

# ES1-T533: noise còn dùng background-image ở predictive search bar, dải tối trang chủ, password, thẻ gift card

Cùng loại ES1-T494 / ES1-T531: Chrome tính `background-image: url()` vào ứng viên LCP; `border-image` thì không.

## Sửa
Noise đổi sang `border-image: url('noise-dark.png') 0 fill/0 repeat` (slice 0 + fill, width 0: không chiếm chỗ, lặp 1:1 như background); màu nền giữ ở `background`.
- `assets/base.css`
  - `[data-style='popup'] .predictive-search__bar` (~7710).
  - `.block-container:has(> .collection-list|.slideshow)` trong media trang chủ (~8819). Block container không có viền/bo góc nên không lệch hình.
- `assets/aux.css`
  - `.template-password` (body, `min-height: 100svh` ở critical.css nên noise phủ đủ viewport).
  - `.gift-card__card`: border-image không cắt theo `border-radius` → thêm `clip-path: inset(0 round var(--figma-radius-16))` để giữ bo góc (overflow: hidden vẫn cắt vòng trang trí `::after`). `@media print`: `border-image: none` để in giữ nền trắng + viền 1px như cũ.
- `tests/e2e/ES1-T129.spec.ts` (thanh predictive popup) và `tests/e2e/ES1-T386.spec.ts` TC-25 (body password): đổi kiểm `backgroundImage` → `borderImageSource` chứa `noise-dark`.

Sau PR: không còn `url('noise-dark.png')` nào trong `background` ở assets/*.css (grep).

Không đổi Liquid, không đổi asset ảnh, không đổi bố cục, không token mới.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi (9 warning có sẵn, PR không đụng Liquid).
- Không file JS trong diff; 0 literal màu mới.
- `critical.css` không đổi. base.css/aux.css gzip: chờ CI (thêm ~400 B raw).
- Playwright ES1-T129, ES1-T386 (TC-25, TC-48 LCP password), visual diff trang chủ dải danh mục/slideshow, gift card 3 breakpoint, Lighthouse trang chủ/password desktop+mobile: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
