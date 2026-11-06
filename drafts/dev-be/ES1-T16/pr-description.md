KHÔNG CHẮC: (1) JS CHƯA chạy trên trình duyệt nào: không preview, không node_modules; thử Chrome local trên fixture tĩnh thì sandbox chặn, chạy ngoài sandbox bị từ chối. Mọi hành vi dưới đây mới rà bằng đọc code, chờ CI. (2) Markup không có thẻ custom element, JS đang tự mount phần tử ẩn — hỏi Tech Lead ở ES1-T22. (3) `tests/e2e/ES1-T5.spec.ts` chưa vào develop nên lệnh DoD chưa chạy được trên nhánh này (ES1-T22). (4) Diff khoảng 500 dòng > 400 do gộp ES1-T18 theo quyết định CTO 30/10; 217 dòng là spec.

# feat(header): header-menu, header-drawer, sticky-header [ES1-T16]

## Làm gì
- `assets/header-menu.js` (mới, 6862 byte): `header-menu`, `header-drawer`.
- `assets/header-sticky.js` (mới, 1680 byte): `sticky-header`.
- `blocks/header.liquid`: chỉ thêm 2 thẻ `<script type="module">`. `header-menu.js` chỉ nạp khi có menu, `header-sticky.js` chỉ nạp khi `sticky_header` bật.
- `tests/e2e/ES1-T16.spec.ts` (mới): TB-17, resize drawer, độc quyền mục mở, sticky, lỗi mạng sticky.

### header-menu
- Hover mở sau 150ms, chỉ chuột (`pointerType === "mouse"`). Rời header đóng, cùng độ trễ.
- Esc đóng tất cả; trả focus về summary nếu focus đang trong dropdown. Hover mở mà focus ở ngoài thì không cướp focus.
- focusout khỏi mục thì đóng. Bỏ qua khi đổi cửa sổ, và khi `relatedTarget` null mà chuột vẫn trên mục (Safari không focus link/summary lúc click).
- Mở 1 mục đóng mục khác. `aria-expanded` đồng bộ qua sự kiện `toggle`.

### header-drawer
- `aria-expanded` trên toggle và từng accordion.
- Mở: focus vào nút close. Đóng bằng Esc, nút close, backdrop: focus về toggle.
- Trap Tab/Shift+Tab, bỏ link trong accordion đang đóng.
- Đóng khi qua `(min-width: 80rem)`.

### sticky-header
- `IntersectionObserver` trên sentinel, không scroll listener. Gắn `data-header-enhanced`; sentinel ra khỏi viewport thì gắn `data-scrolled`.

## Vì sao
ES1-T16, gộp ES1-T18. SRS TE-1 AC2, AC9. Spec: drafts/techlead/ES1-T11/task-split.md D2, D5, D6; ADR 0002.

## Lệch so với ticket
- Mount: ticket cần 3 custom element nhưng chỉ cho thêm thẻ script, markup không có thẻ nào. JS tự append phần tử `hidden` vào `[data-testid="header"]`. Không bọc DOM vì sẽ hỏng `.block-container:has(> .site-header)`. Chờ ES1-T22; nếu FE thêm thẻ thì chỉ bỏ `mount`.
- Sentinel: ticket ghi FE5 không render sentinel khi `sticky_header` tắt, nhưng sentinel luôn có trong `layout/theme.liquid`. Thẻ script đã theo setting, JS xét thêm `data-sticky`.
- Hover vào mục không có con cũng đóng dropdown đang mở bằng chuột. Ticket không nêu; giữ mở sẽ che nội dung khi chuột đã sang mục khác.
- Mở drawer chuyển focus vào nút close: ticket chỉ ghi "focus trap khi mở".

## Hành vi cần kiểm kỹ
- Hover đã mở rồi click summary thì đóng (toggle gốc của details). Ticket không nêu, giữ nguyên.
- TB-19: `aria-expanded` trên `<summary>`, chưa chạy axe; nếu axe báo thì cần Tech Lead quyết vì ticket yêu cầu thuộc tính này.
- Canvas/theme editor render lại header mà module không chạy lại thì mất bộ điều khiển, còn lại hành vi details gốc (ES1-T22).
- Spec lỗi mạng sticky cần trang chủ cao hơn khoảng 400px + chiều cao viewport. Spec hero dùng hook giả lập, chạy lại khi TE-2 merge.

## Cách test
- `shopify theme check`
- `wc -c assets/header-menu.js assets/header-sticky.js`
- `PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T16.spec.ts`
- Lấy spec QA: `git show origin/feature/ai-ES1-T5:tests/e2e/ES1-T5.spec.ts > tests/e2e/ES1-T5.spec.ts`, rồi chạy:
  `npx playwright test tests/e2e/ES1-T5.spec.ts -g "TC-0[6-9]|TC-1[1-4]|TB-10|TB-1[67]|TB-19|TB-28"`
  Spec này không có TB-17; TB-17 nằm trong ES1-T16.spec.ts. main-menu store dev cần mục cấp 2 và mục không con.
- `npx lhci autorun`

## Ảnh (360 / 768 / 1280)
Không đổi giao diện tĩnh. Chờ CI cho trạng thái dropdown/drawer.

## Checklist
- [x] theme check 0 lỗi (35 file), `.theme-check.yml` không đổi
- [x] `wc -c` ≤ 8192: 6862 và 1680
- [x] Không đổi markup ngoài thẻ script; không thêm chuỗi, không đổi locale
- [x] Không file ngoài phía BE
- [ ] Playwright: chờ CI
- [ ] 0 console error: chờ CI
- [ ] Lighthouse: perf ≥ 96 desktop / ≥ 90 mobile, a11y ≥ 98: chờ CI
- [x] KHÔNG CHẮC: xem dòng đầu

🤖 Generated with [Claude Code](https://claude.com/claude-code)
