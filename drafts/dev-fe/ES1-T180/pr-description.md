KHÔNG CHẮC: (1) chưa render lần nào: không có preview, spec chưa chạy, chưa type-check. (2) `show_item: false` truyền qua param trên `te7` chưa xác nhận vào `block.settings` (cùng rủi ro ES1-T179); spec sẽ lộ. (3) Hàng 4a không có ảnh inline trên `/`, chưa thấy được heading có xuống dòng sau "You" như `1-453.png` hay không. (4) CR-7 ghi "đậm"; làm theo Figma 1:629: cùng weight 800, MAKE #1A1A1A, phần còn lại #4D4D4D. (5) Ẩn `br` hàng 8 dưới 48rem là FE tự suy, Figma không có mobile.

# ES1-T180 TE-17-FE1b: slideshow-slide, image-with-text mặc định theo Figma, CR-7

Plan ES1-T169 # 17, D1, CR-7. AC-H5, H6, hàng 2, 4a, 8, 13. Nội dung theo `drafts/ba/ES1-T173/home-content.md`. Dùng lại mẫu ES1-T179.

## Thay đổi

`blocks/slideshow-slide`, `blocks/image-with-text` (block lặp, D1):
- Schema bỏ `default` ở setting chữ. Template `assign` từ `| t`, truyền `default_<id>`. Block đọc setting rồi `default_<id>`.
- Thêm `show_item`, mặc định bật, có dòng info. Tắt thì storefront không render. Editor: slide giữ khung slide kèm hướng dẫn để vẫn chọn được và JS vẫn đếm; image-with-text dùng placeholder có sẵn, đã sửa lại câu chữ.
- Heading: setting qua `escape`, mặc định là HTML từ khoá `_html`. Chữ khác qua `escape_once`.
- Sửa info nút chính: "Leave empty to hide" đã sai, đổi sang `info.sample_text`. Nút 2 của slide và rich-text giữ info cũ vì vẫn đúng.

Nội dung:
- Hàng 2: 2 slide cùng copy, H1 2 dòng, có "Trusted by 10,000+ athletes".
- Hàng 8: bỏ eyebrow, 3 dòng heading. Hàng 13: có eyebrow, heading 2 dòng, body 1 đoạn có `br` (Figma 1:1020 cao 3 dòng, không có khoảng cách đoạn).
- Hàng 13: 3 USP đang ẩn trong Figma, không làm (ES1-T116 #1).
- Có ở cả `templates/index.liquid` và `templates/index.figma.liquid`.

CR-7, `assets/base.css`, không thêm setting, không thêm token:
- `<strong>Make</strong>` trong khoá `_html`. Trên banner nền sand có `strong`: heading `--color-muted`, `strong` `--color-background-sand-foreground`, `font-weight: inherit`.
- Heading merchant nhập không có `strong` nên giữ màu band.
- Dưới 48rem ẩn `br` hàng 8: dòng 2 dài 8.5em, ở 360 cỡ chữ 48px sẽ gãy lẻ. Sau mỗi `br` có dấu cách để từ không dính nhau.

Slide 1 giữ là LCP, không đổi cách tải ảnh.

## Không đổi: `blocks/rich-text`

Hàng 4a đã khớp bảng: so bằng script 1:460, 1:462 và 2 phần của 1:457. Bảng ES1-T173 không có chuỗi nào còn thiếu, nên file này không có trong diff dù có trong tên ticket.

## Khác ticket hoặc bảng BA

- Khoá `banner_text` đổi thành `banner_text_html` vì chứa `<p>`, theo quy tắc `_html`.
- `templates/index.te7.liquid` thêm 5 band `te7-d1-*`, không nằm trong danh sách file của ticket. Preview không có block settings nên chỉ cách này mới test được "setting thắng default" và `show_item` tắt. Band `te7-d1-slideshow` là slideshow thứ 2 trên `te7`, không phải band đầu nên không đổi overlay của header.
- Thêm `info.image_with_text_eyebrow` vì banner không có eyebrow mẫu, `info.sample_text` sẽ nói sai.
- Dấu cách đôi ở 1:1020 giữ nguyên trong locale (XN), HTML tự gộp khi hiển thị.

## Giới hạn còn lại

- Tắt `show_item` ở slide 1 thì trang mất h1 và ảnh LCP chuyển sang lazy: slide 2 không biết slide 1 đã tắt. Muốn đổi cần chuyển `priority` trong template.
- Tắt cả 2 slide thì storefront còn khung carousel rỗng: block cha không đọc được block con (AGENTS.md:140).
- Merchant xoá chữ thì quay về chữ mẫu, không ẩn riêng từng chữ được (nhược điểm 1 của D1). Hàng 13 vì vậy không bỏ được eyebrow nếu chưa nhập giá trị khác.
- Merchant đổi heading hàng 8 thì mất màu riêng của MAKE, vì setting là chữ thường.
- AGENTS.md:258 cần ghi ngoại lệ empty state theo D1: scope-guard chặn, thuộc việc người làm ở plan # 41.

## Việc của Orchestrator trước khi push

Scope-guard chặn dev-fe ghi `tests/` (đã thử, bị từ chối đúng). Spec nằm ở drafts:

```
git apply drafts/dev-fe/ES1-T180/ES1-T120.spec.ts.patch
cp drafts/dev-fe/ES1-T180/ES1-T180.spec.ts tests/e2e/ES1-T180.spec.ts
```

Số dòng thực tế của test cần sửa: `ES1-T120.spec.ts:245-277`, lệch so với 240-272 trong ticket. Patch bỏ assert "không có chữ efitco" vì hàng 13 có chữ này theo Figma.

## Tự kiểm tra

Đã chạy:
- `shopify theme check`: 86 file, 0 lỗi, không đổi `.theme-check.yml`.
- Locale JSON hợp lệ, 0 khoá trùng, mọi khoá `| t` và `t:` trong 2 block, 2 template đều có (kiểm bằng script).
- So 11 chuỗi hàng 2, 8, 13 và 4a với bảng ES1-T173 bằng script: khớp, sau khi bỏ thẻ và chuẩn hoá khoảng trắng.
- `git apply --check` patch T120: đạt.
- `git diff`: `assets/*.js`, `assets/critical.css` không đổi; `critical.css` 9921 B. Không có file JS trong diff.
- grep `Add a` trong 2 block, 2 template: 0.

Chưa chạy, chưa đạt DoD (theo comment CTO 06/11, e2e và lighthouse đang tắt trên CI, `RUN_STORE_TESTS=false`):
- `npx playwright test` cho T180, T120, T30, T45: spec viết kèm, chưa chạy lần nào.
- axe, console, `npx lhci autorun`, kiểm LCP là slide 1.
- Ảnh 360, 768, 1280, 1920: chờ preview.
- `ES1-T176.spec.ts` hàng 2, 4a, 8, 13 và ngưỡng so ảnh: T176 làm cuối theo CTO.
- TC-H6 trong editor: agent không mở được editor, cần người chạy tay.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
