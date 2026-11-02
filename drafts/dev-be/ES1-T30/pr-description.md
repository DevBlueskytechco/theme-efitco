KHÔNG CHẮC: (1) JS và spec CHƯA chạy lần nào: chỉ có `node --check`, không trình duyệt, không `node_modules`; harness DOM giả trên Node bị từ chối quyền nên không có kết quả. Mọi hành vi dưới đây mới rà bằng đọc code, chờ CI. (2) Nhãn `2 / 5` theo locale và SRS AC9, ticket ghi "Slide X of Y"; bấm Play dưới reduced-motion thì chạy. Cả hai đã hỏi ở ES1-T35. (3) Spec D9 chỉ có trên nhánh `feature/ai-ES1-T24`, `docs/srs.md` trên develop đã có AC6–AC9, nên làm theo nguyên văn AC. (4) Diff khoảng 506 dòng > 400: 255 JS, 249 spec, 2 Liquid; một block, không tách được dưới 3 pt.

# feat(slideshow): slideshow-carousel, điều hướng scroll-snap, autoplay, a11y [ES1-T30]

## Làm gì
- `assets/slideshow.js` (mới, 8057 byte): custom element `slideshow-carousel`, không partial.
- `blocks/slideshow.liquid`: chỉ thêm thẻ `<script type="module">` sau custom element.
- `tests/e2e/ES1-T30.spec.ts` (mới).

### Điều hướng
- `track.scrollTo` với `left` tính theo rect, đúng cả RTL. Vuốt do trình duyệt xử lý. Không touch listener, không scroll listener.
- Active từ IntersectionObserver threshold 0.6, root track. Nút, chấm, vuốt đi chung một đường.
- Next ở cuối về đầu, prev ở đầu về cuối, không clone slide.
- Chấm clone từ `template`, `aria-current="true"` trên chấm đang chọn. Slide không active có `inert`.
- Dưới 2 slide: không `data-multiple`, không chấm, không autoplay.
- `shopify:block:select` cuộn tới slide (D9).

### Autoplay và pause
- Chạy khi `data-autoplay=true`. Giữ khi hover, focus, tab ẩn, ngoài viewport, `Shopify.designMode`.
- Bấm pause dừng hẳn đến khi bấm play; `data-playing` và `aria-label` nút đổi theo. Hover/focus chỉ tạm giữ nên không đổi icon.
- Reduced-motion: vào trang ở trạng thái paused, `video.pause()`, `scrollTo` behavior `auto`. Bật reduced-motion giữa chừng cũng dừng.
- Đổi slide thì tính lại timer, tránh tick ngay sau khi vuốt.

### A11y
- `aria-label` slide từ `data-label-slide`, bỏ `tabindex` track.
- Live region `polite`, `aria-live="off"` khi autoplay đang chạy. Báo trễ 300ms để nhảy chấm 1 → 5 không đọc từng slide lướt qua.
- `disconnectedCallback` dọn observer, timer, listener, chấm, thuộc tính; connect lại không nhân đôi chấm.

## Vì sao
ES1-T30. SRS TE-2 AC6–AC9, R12. Spec: `drafts/techlead/ES1-T24/task-split.md` D9 và bảng hợp đồng hook; ADR 0002.

## Lệch so với ticket
- Focus: chỉ `:focus-visible` mới giữ autoplay. Ticket ghi "focus trong block"; nhưng click chuột để lại focus trên nút (Chrome), autoplay sẽ không chạy lại cho tới khi click chỗ khác.
- Reduced-motion: người dùng bấm Play thì chạy (ES1-T35).
- Live region và `aria-label` slide dùng chung `data-label-slide`, ra `2 / 5` (ES1-T35).
- Bản này không có `Slide X of Y` trong JS, chỉ đổi locale là đủ.

## Hành vi cần kiểm kỹ
- Bấm Play bằng bàn phím: autoplay chạy lại khi focus rời block, trong lúc đó nút đã hiện Pause.
- Autoplay trên cảm ứng: không có touch listener theo ticket, tick rơi đúng lúc đang kéo tay có thể cắt ngang cú vuốt.
- Bấm next liên tiếp khi đang cuộn mượt: index tính từ active, nên 2 lần bấm nhanh có thể chỉ đi 1 slide.
- Vuốt khi focus đang ở nút trong slide: slide thành `inert`, focus rơi về body.
- Slide active không có nút và track còn cuộn được: axe `scrollable-region-focusable` có thể báo vì ticket yêu cầu bỏ `tabindex`. Default slide có nút nên chưa gặp.
- Trong editor có autoplay: nút vẫn hiện Pause nhưng slide không chạy, vì `designMode` chặn.
- Spec bật autoplay bằng cách sửa HTML qua `page.route`, không đổi cấu hình store.
- Test ngoài viewport tự skip nếu trang chủ không đủ cao.

## Cách test
- `shopify theme check`
- `wc -c assets/slideshow.js`
- `PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T30.spec.ts`
- `npx lhci autorun`

## Ảnh (360 / 768 / 1280)
Chờ CI. Hiện controls sau `data-enhanced` là lần đầu thấy trên preview, chưa ai xem bố cục nút.

## Checklist
- [x] theme check 0 lỗi (38 file), `.theme-check.yml` không đổi
- [x] `wc -c` ≤ 8192: 8057
- [x] Tổng `assets/*.js` ≤ 40 KB: 17769 byte
- [x] Không đổi markup ngoài thẻ script; không đổi locale
- [x] `node --check` qua
- [ ] Playwright: chờ CI
- [ ] 0 console error: chờ CI
- [ ] Lighthouse: perf ≥ 96 desktop / ≥ 90 mobile, a11y ≥ 98: chờ CI
- [x] KHÔNG CHẮC: xem dòng đầu

🤖 Generated with [Claude Code](https://claude.com/claude-code)
