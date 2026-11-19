KHÔNG CHẮC: không làm đúng nguyên văn `.slideshow__pause:disabled { display: none; }` mà dùng `:enabled` trong rule hiện nút, kết quả như nhau (xem "Vì sao"). Chưa đo được gzip base.css cục bộ vì sandbox chặn `gzip`; raw giảm 49 B so với develop, chờ CI.

## ES1-T466 — TE-2 FE: ẩn nút pause slideshow khi disabled

Ticket: ES1-T466 (TE-2, CTO 14/11 chốt ở ES1-T458). Phụ thuộc ES1-T333 (slideshow.js đặt `disabled` cho nút pause dưới 80rem khi không có video).

### Thay đổi
- `assets/base.css`: rule hiện nút pause đổi từ
  `slideshow-carousel[data-enhanced][data-multiple][data-autoplay='true'] .slideshow__pause, slideshow-carousel[data-enhanced]:has(video) .slideshow__pause`
  thành `slideshow-carousel[data-enhanced] .slideshow__pause:enabled`. Nút bị disabled thì rule `display: flex` không khớp, rule mặc định `.slideshow__pause { display: none }` có sẵn sẽ ẩn nút.
- `blocks/slideshow.liquid`: chỉ sửa `{% doc %}`, ghi thêm hook `disabled` do JS đặt trên nút pause và việc CSS chỉ hiện nút khi enabled. Markup, schema, locale giữ nguyên.
- `tests/e2e/ES1-T466.spec.ts`: spec mới.

### Vì sao dùng `:enabled` thay vì thêm `.slideshow__pause:disabled { display: none }`
- `.slideshow__pause:disabled` có specificity (0,2,0), thua `slideshow-carousel[data-enhanced][data-multiple][data-autoplay='true'] .slideshow__pause` (0,4,1). Muốn thắng thì phải lặp lại cả 2 selector dài hoặc dùng `!important`, làm base.css nặng thêm khoảng 120 B và trái DoD "base.css không lớn hơn develop".
- slideshow.js chỉ bỏ `disabled` khi `#canAutoplay() || videos.length > 0`, tức là khi có autoplay (nhiều slide, setting bật, từ 80rem) hoặc có video. Đó đúng là điều kiện của 2 selector cũ, nên bám `:enabled` cho kết quả như cũ ở mọi trường hợp, chỉ thêm việc ẩn nút ở 360/768 khi không có video (TE-2 AC8). Cách này đúng ý CTO: bám trạng thái JS, không media query.
- Kiểm từng trường hợp:
  - Từ 80rem, autoplay bật, nhiều slide: nút enabled nên hiện, như cũ. Có reduced-motion vẫn hiện, ở trạng thái play.
  - Autoplay tắt, không video: nút disabled nên ẩn, như cũ.
  - Một slide, không video: nút disabled nên ẩn, như cũ.
  - Có video: nút enabled nên hiện ở mọi cỡ, như cũ.
  - Dưới 80rem, autoplay bật, không video: nút disabled nên ẩn. Đây là phần mới theo ticket.
  - Không có JS (chưa có `data-enhanced`): nút ẩn, như cũ.
  - Editor connect lại: `disconnectedCallback` bỏ `disabled` và `data-enhanced`, rồi `connectedCallback` đặt lại.
- Đổi cỡ màn hình: listener `wide` change gọi `#setPaused` để bật hoặc tắt `disabled`, CSS đi theo. Không có layout shift vì `.slideshow__controls` nằm absolute.

### Hook cho BE / QA
- Không cần thêm hook mới. Vẫn dùng `data-testid="slideshow-pause"` và thuộc tính `disabled` do `assets/slideshow.js` đặt (không đổi JS).
- Không có file JS trong diff.

### Tự kiểm tra
- `shopify theme check`: 0 lỗi. Có 25 warning ở 10 file, đều có từ trước và không file nào thuộc diff này.
- Kích thước base.css: develop 275 471 B, nhánh 275 422 B (giảm 49 B). Chưa đo được gzip vì sandbox chặn `gzip`/`node`; spec có kiểm trần tạm 53 248 B (ES1-T454). Chờ CI.
- `critical.css` không đổi.
- `tests/e2e/ES1-T466.spec.ts`:
  - Phần fixture: dựng markup bằng `page.setContent` với base.css thật, không cần store. Ở 360/768/1280: nút disabled thì ẩn, enabled thì hiện, chỉ có video thì hiện, chưa enhanced thì ẩn. Mũi tên và chấm vẫn đổi theo mốc như TE-2 AC7. Có kiểm thêm selector và gzip.
  - Phần store: autoplay bật bằng init script giống ES1-T333. Ở 360/768 không video thì nút disabled và ẩn. Ở 1280 nút hiện và bấm được. Đổi cỡ 1280 → 768 → 1280 thì nút ẩn rồi hiện lại. Có video ở 360 thì nút hiện.
  - Chưa chạy cục bộ: global setup cần `PREVIEW_URL`, và config tạm ngoài repo bị scope guard chặn. Chờ CI.
- Dữ liệu store: test "360 có video" skip nếu trang chủ store dev không có slide video, test này không tính là đạt. Ngược lại, các test 360/768/đổi cỡ skip nếu trang chủ có video.
- Spec cũ không bị ảnh hưởng:
  - ES1-T333: 360/768 vẫn kiểm `toBeDisabled`; 1280/1920 vẫn kiểm `toBeVisible` và `toBeEnabled`.
  - ES1-T30: khi autoplay tắt và không video, nút vẫn `toBeHidden`.
  - `figma-rows.json` vẫn giữ ngoại lệ cho `slideshow-pause`.
- Preview, Lighthouse (desktop/mobile), ảnh 3 breakpoint, visual diff: chờ CI. Thay đổi chỉ ẩn một nút absolute ở dưới 80rem nên không ảnh hưởng LCP/CLS, và bớt một control khỏi thứ tự Tab ở mobile (trước đây nút disabled vốn đã bị bỏ qua khi Tab).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
