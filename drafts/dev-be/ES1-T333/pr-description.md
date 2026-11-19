KHÔNG CHẮC: dưới 80rem khi bật autoplay và không có video, nút pause vẫn hiện (CSS `display: flex` theo `data-autoplay`), JS chỉ đặt `disabled`; cách ẩn hỏi FE ở ES1-T458.

# ES1-T333 TE-2-R2-BE1: slideshow.js, TE-2 AC7–AC9

## Thay đổi
- `assets/slideshow.js`
  - AC8: autoplay chỉ chạy khi `matchMedia('(min-width: 80rem)')` khớp (1280, 1920). Dưới 80rem slide chỉ đổi khi bấm nút, chấm hoặc vuốt. Lắng nghe `change` của media: đổi cỡ qua lại thì dừng/chạy lại, không reload.
  - Nút pause: có tác dụng khi (autoplay + từ 80rem) hoặc có video. Không có tác dụng thì `disabled`, gỡ `data-playing`, aria-label = `data-label-play`. `disconnectedCallback` gỡ `disabled`.
  - Giữ nguyên: dừng khi hover chuột, focus-visible, tab ẩn, ngoài viewport, `prefers-reduced-motion`, `Shopify.designMode`; vòng lặp dùng scrollTo về slide đầu, không clone slide giả; `shopify:block:select` chuyển tới slide.
  - AC7, AC9: logic cũ (chấm `aria-current`, slide ẩn `inert`, nhãn slide "n / tổng" từ `data-label-slide`, nhãn chấm), không đổi markup.
  - Gọt comment để bù code mới.
- `tests/e2e/ES1-T333.spec.ts` (mới): AC8 ở 360/768 (2 lần khoảng thời gian vẫn slide 1, pause disabled), 1280/1920 (tự đổi), đổi cỡ 1280 → 768 → 1280, reduced-motion; AC7 chấm 44 × 44 ở 360, nút 52 ở 768/1280/1920, vuốt; AC9 role/aria-roledescription/nhãn; connect lại.
- `tests/e2e/ES1-T30.spec.ts`: 2 test autoplay (tự chuyển, focus) bỏ project mobile vì theo AC8 dưới 80rem không autoplay; phần đó kiểm ở ES1-T333.

Không đổi markup, CSS, locales, schema.

## Ngân sách JS
- `wc -c assets/slideshow.js`: 8 057 → 7 925 B (−132), trần ticket 8 057, trần file 8 192.
- Trang chủ tải sẵn: giảm 132 B so với develop, không thêm file, không thêm thẻ script.

## Cho FE (ES1-T458)
- Ẩn `.slideshow__pause` khi `:disabled` (hoặc dưới 80rem khi không có video).

## Tự kiểm tra
- `shopify theme check`: 0 lỗi (23 warning có sẵn, không ở file chạm).
- Không console.*, không fetch, không style inline.
- `node --check`: chưa chạy được trong phiên (cần quyền), đã đọc lại code.
- Preview, Playwright ES1-T333/ES1-T30/ES1-T235, Lighthouse: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
