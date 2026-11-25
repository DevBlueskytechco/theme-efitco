KHÔNG CHẮC: chưa dựng lại được trên Chrome cục bộ (sandbox không chạy Playwright); cách sửa dựa trên nguyên nhân QA ghi ở B02 và hành vi cuộn focus của Chromium (tab hiện một phần ≥ 32px theo chiều ngang được coi là đã thấy, không cuộn). Lệch ui-spec blog.md dòng 134 (spec chỉ ghi "padding 3px"); cách xử lý này do FE chọn theo ticket, cần Designer/QA xác nhận về hình ảnh.

# ES1-T517 (ES1-T385-B02): Tab tới chủ đề cuối ở 360, link và outline bị khung cuộn cắt

## Nguyên nhân
`.blog-articles__topic-list` là hàng cuộn ngang. Chrome cuộn khi focus tuần tự chỉ khi tab ẩn hẳn hoặc hiện < 32px; tab kế cuối được căn giữa (scrollLeft 234), tab cuối hiện 112/114px nên Tab không cuộn thêm. `scroll-padding-inline`, `scroll-margin-inline` không tác dụng với nhánh "coi như đã thấy" này. Thêm khoảng trống cuối hàng không giải quyết chắc được vì độ rộng tab theo tên tag động.

## Thay đổi
- `assets/aux.css`: `.blog-articles__topic-list:has(:focus-visible)` → `flex-wrap: wrap; overflow-x: visible`. Khi focus bàn phím vào hàng chủ đề, hàng xuống dòng, bỏ cuộn, mọi tab và outline nằm trọn trong khung `ul` ở mọi breakpoint. Chuột/chạm không có `:focus-visible` → giữ nguyên 1 hàng cuộn ngang theo Figma. Không JS, không cần BE.
- Trình duyệt không hỗ trợ `:has()`: giữ hành vi cũ (outline offset -4 bên trong tab).
- `tests/e2e/ES1-T385.spec.ts`: gỡ `test.fail` gắn ES1-T517 ở TC-14 360, cập nhật comment đầu file (theo comment ticket 21/11; không gỡ thì test đỏ vì unexpected pass).

## Ảnh hưởng
- Nội dung dưới hàng chủ đề dịch xuống khi người dùng Tab vào hàng (chỉ ở mốc có tràn). Dịch chuyển sau input bàn phím, không tính CLS; Lighthouse không Tab nên không đổi điểm.
- WCAG 3.2.1 On Focus: chỉ đổi bố cục, không đổi ngữ cảnh.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi (9 warning có sẵn ở quiz-step, index*.liquid, không thuộc diff).
- Không file JS trong diff. Không màu/khoảng cách literal mới.
- aux.css 37 734 B raw, + ~300 B; gzip chưa đo được trong sandbox, xa trần 16 384 B gzip — chờ CI.
- TC-14 360/1280, Lighthouse blog 360/1280, ảnh 3 breakpoint: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
