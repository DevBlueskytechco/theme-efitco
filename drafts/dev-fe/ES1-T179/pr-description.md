KHÔNG CHẮC: (1) chưa render lần nào: không có preview, spec chưa chạy, chưa type-check. (2) Mốc CR-8: không có ghi chú Designer, tự chọn 120rem, nằm ngoài 3 mốc của AGENTS.md:358 (ES1-T204 #1, #2). (3) `show_stat_1`, `show_stat_2` không có trong ticket, FE thêm (ES1-T204 #3). (4) `show_item: false` truyền qua param trên `te7` chưa xác nhận vào `block.settings`; spec sẽ lộ. (5) Không tra được hành vi escape của `t` với khoá không có `_html` (không có mạng tới shopify.dev), nên dùng `escape_once` để đúng ở cả 2 trường hợp.

# ES1-T179 TE-17-FE1a: FAQ, testimonials mặc định theo Figma, cơ chế D1, CR-8

Plan ES1-T169 # 16, D1, CR-8. AC-H5, H6, H24, H25, hàng 12, 15. Nội dung theo `drafts/ba/ES1-T173/home-content.md`.

## Thay đổi

Mẫu D1 cho các block lặp sau:
- Schema bỏ `default` ở setting chữ. Template `assign` từ `| t`, truyền `default_<id>`. Block đọc `block.settings.<id> | default: default_<id>`. Tên param khác tên setting nên giá trị merchant đã lưu luôn thắng.
- `faq-item`, `testimonial-item`: thêm `show_item`, mặc định bật, có dòng info. Placeholder trong editor khi tắt, storefront không render.
- `testimonial-item.rating`: `range` đổi sang `number`. Thứ tự lấy giá trị: setting, `default_rating`, 5. Chặn 0-5 đã có trong `snippets/rating-stars.liquid`, không viết lại. Verified vẫn tắt (E9).
- `faq`, `testimonials`: áp cùng mẫu cho eyebrow, heading, 6 chữ của 2 ô stat. Dùng `default_*` chứ không dùng schema default vì `te7` cần band không có stat.

Nội dung: 5 câu FAQ đúng 1:1057, cùng 1 câu trả lời (Q3 ES1-T168), 2 ô stat có 360+, 4 review đúng 1:885, card 2 có 4 sao. Có ở cả `templates/index.liquid` và `templates/index.figma.liquid`.

CR-8, `assets/base.css`, 0 JS:
- Từ 120rem, đúng 4 mục: 4 card 456px, gap 24, card đầu thẳng tiêu đề, card 4 tràn tới mép màn hình.
- Cuộn bằng thanh cuộn và bàn phím (list đã có `tabindex="0"`). Snap `proximity` để kéo thanh cuộn không bị giật về.
- Dưới 120rem giữ lưới. Từ 120rem, danh sách khác 4 mục vẫn là lưới.
- Tính lề từ `--content-width`, không dùng `100vw` vì có tính cả thanh cuộn.
- `sizes` của ảnh review thêm `(min-width: 120rem) 456px`.

## Khác ticket hoặc bảng BA

- Khoá `blocks.faq_item.default_answer` đổi thành `default_answer_html` vì chứa thẻ `<p>`, theo quy tắc `_html` của ticket.
- Không có khoá `r1_rating`..`r4_rating`: số sao là số, truyền thẳng trong template.
- `templates/index.te7.liquid` thêm 2 band `te7-d1-faq`, `te7-d1-testimonials`, không nằm trong danh sách file của ticket. Preview không có block settings nên chỉ cách này mới test được "setting thắng default" và "show_item tắt".
- Bỏ `info.faq_question`, `info.faq_stat`, `info.testimonial_quote` vì nội dung cũ đã sai ("để trống để ẩn"). Thêm `info.sample_text`, `info.faq_show_item`, `info.faq_show_stat`, `info.testimonial_rating`, `info.testimonial_show_item`.

## Giới hạn còn lại

- Merchant xoá eyebrow, heading thì quay về chữ mẫu, không ẩn được (nhược điểm 1 của D1, ES1-T204 #3).
- Thanh cuộn hiện trên hệ điều hành dùng thanh cuộn cố định. Figma không có, nhưng đây là đường cuộn bằng chuột duy nhất khi không có JS. Cần ghi vào sổ chênh lệch ES1-T197 nếu ảnh so bị lệch.
- `/` chưa có ảnh: 2 ô stat nằm ở cột phải, không đè ảnh. Đúng bố cục overlay chỉ khi có ảnh (`?view=figma` hoặc merchant chọn ảnh).
- Thumbnail card 3, 4: dùng ảnh sản phẩm thật, khác ảnh Figma (mặc định ES1-T198 #6).
- AGENTS.md:258 cần ghi ngoại lệ empty state theo D1: scope-guard chặn, thuộc việc người làm ở plan # 41.

## Việc của Orchestrator trước khi push

Scope-guard chặn dev-fe ghi `tests/` (đã thử, bị từ chối đúng). Spec nằm ở drafts:

```
git apply drafts/dev-fe/ES1-T179/ES1-T118.spec.ts.patch drafts/dev-fe/ES1-T179/ES1-T119.spec.ts.patch
cp drafts/dev-fe/ES1-T179/ES1-T179.spec.ts tests/e2e/ES1-T179.spec.ts
```

Số dòng thực tế của 2 test cần sửa: `ES1-T118.spec.ts:200-216`, `ES1-T119.spec.ts:250-269`, lệch so với số trong ticket.

## Tự kiểm tra

Đã chạy:
- `shopify theme check`: 86 file, 0 lỗi, không đổi `.theme-check.yml`.
- Locale JSON hợp lệ, 0 khoá trùng (kiểm bằng script).
- `git apply --check` 2 patch: đạt.
- `wc -c`: `assets/*.js` tổng cộng với `critical.css` là 64570 B, `critical.css` 9921 B, bằng trước khi sửa. Không có file JS trong diff.
- grep `Add a`, `Customer name` trong 4 block: 0.

Chưa chạy, chưa đạt DoD (theo comment CTO 06/11, e2e và lighthouse đang tắt trên CI, `RUN_STORE_TESTS=false`):
- `npx playwright test` cho T179, T118, T119: spec viết kèm, chưa chạy lần nào.
- axe, console, `npx lhci autorun`.
- Ảnh 360, 768, 1280, 1920: chờ preview.
- `ES1-T176.spec.ts` hàng 12, 15 và ngưỡng so ảnh: T176 làm cuối theo CTO.
- Ảnh editor chứng minh merchant sửa được 1 `faq-item`, 1 `testimonial-item` (TC-H6): agent không mở được editor, cần người chạy tay.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
