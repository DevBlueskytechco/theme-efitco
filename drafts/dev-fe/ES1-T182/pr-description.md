KHÔNG CHẮC: (1) chưa render lần nào: không có preview, spec chưa chạy, chưa type-check. (2) `show_item: false` truyền qua param trên `te7` chưa xác nhận vào `block.settings` (cùng rủi ro ES1-T179, T180); spec sẽ lộ. (3) Chữ vòng của dấu 1:761 lệch vài px so với Figma theo ES1-T174, chưa đo. (4) Tên shop trên dấu và màu `--color-muted-on-dark` theo mặc định ES1-T200 #4, #5, CTO chưa trả lời. (5) Bảng BA ghi chữ dấu "không vào locale"; làm theo AGENTS.md và ES1-T174: qua `| t`. (6) ES1-T205: merchant không bỏ được lựa chọn mẫu của quiz-step, đang theo mặc định A.

# ES1-T182 TE-17-FE1c: quiz, quiz-step, bundle-builder, featured-product theo Figma, bậc 10%, 15%, dấu 1:761

Plan ES1-T169 # 20, D1, CR-7. AC-H5, H6, H15, H18 phần markup. Hàng 6, 9, 10. Copy theo `drafts/ba/ES1-T173/home-content.md`, bước 2, 3 theo `drafts/designer/ES1-T174/spec.md` mục 3 (là đề xuất, Figma không có).

## Thay đổi

`blocks/quiz` (block 1 lần): default thêm "Our most-loved feature", "20 seconds".

`blocks/quiz-step` (block lặp, D1):
- Thêm `default_question`, `default_subheading`, 9 param `default_option_{1..3}_{label,description,tag}`. Lựa chọn 4 không có mẫu.
- Lấy theo từng trường: setting rồi `default_*`. Chữ qua `escape_once`.
- Thêm `show_item`, mặc định bật, có dòng info. Sửa placeholder và info lựa chọn.
- Gộp 2 vòng lặp thành 1 `capture`, đếm lựa chọn ngay trong đó.

`blocks/bundle-builder`:
- Bậc 2 món 10%, 3 món 15%; bậc 3 giữ 0%. Tối đa 9 giữ nguyên.
- Thêm `default_collection`, `templates/index.liquid` truyền `'all'`.
- Heading, link "View Preset Bundles" theo Figma. Link trống đi tới all products, xoá label thì ẩn.
- Ghi chú "Discount applies when an automatic discount is active." luôn hiện khi có bậc: setting trống lấy locale, cùng cách `quiz.empty_text`.
- Hook mới `data-label-progress-one`, đã comment ES1-T149. Chuỗi tiến độ đổi sang "unlock", đủ số ít và số nhiều.

`blocks/featured-product`:
- Default eyebrow, 4 nhãn spec theo thứ tự ảnh (ES1-T198 #4). Rating, giá trị spec giữ metafield, không có thì ẩn. Add to cart giữ theo E11.
- `snippets/featured-product-seal` mới: SVG ES1-T174 inline, `aria-hidden`, id đường chữ theo sản phẩm, chữ qua `| t` + `shop.name`, cắt tên ở 12 ký tự để không chồng chữ trên vòng.
- `assets/base.css`: dấu 113 x 112 cách góc 24 từ 48rem; 72 x 71 cách góc 12 dưới 48rem. Không bắt sự kiện chuột để không chặn cuộn ảnh. Không thêm token.
- Vẫn ẩn tới khi chọn sản phẩm (D1).

`templates/index.figma.liquid`: quiz-step chuyển từ giá trị viết cứng sang `default_*`, ảnh vẫn truyền qua param. Bỏ câu ngoại lệ trong comment đầu file.

Tag mẫu: `quiz-upper`, `quiz-core`, `quiz-lower`, `quiz-beginner`, `quiz-intermediate`, `quiz-advanced`, `quiz-home`, `quiz-gym`, `quiz-outdoor`.

## Chờ ES1-T183, không làm ở đây

- "Two questions. One shortlist." (1:515): default vẫn "Three questions. One shortlist.".
- "Tap the body map or pick from the list." (1:532): `s1_hint` vẫn "Pick from the list.", vì body map chưa bấm được.
- Body map bấm được, token nền panel #393942.

Đã comment ES1-T183 các chỗ cần sửa.

## Khác ticket hoặc bảng BA

- `templates/index.te12.liquid` thêm `link_label: ''` ở band không bậc: default mới làm hiện link, `ES1-T147.spec.ts:145` khẳng định không có.
- `templates/index.te7.liquid` thêm band `te7-d1-quiz`: preview không có block settings nên chỉ cách này mới test được "setting thắng default". `te11` giữ nguyên theo ES1-T174.
- `ES1-T147.spec.ts:133` không sửa: chạy trên `?view=te12` với bậc truyền qua param, không phụ thuộc default. Dòng đó hiện là assert role của status.
- `ES1-T156.spec.ts:201-206` không sửa: đúng với D1 (nay ở dòng 204-209).
- Band `b` của `te13` giờ có đủ 4 nhãn spec mặc định, nhưng sản phẩm không có metafield nên `ES1-T156.spec.ts:185` vẫn đúng. Band `a` cần `TE13_METAFIELDS_READY` mới chạy.

## Giới hạn còn lại

- Trên `/` chưa có `assets/bundle-form.js` (ES1-T149): `data-tiers` và ghi chú đã có, nhưng số món, dòng giảm, thanh tiến độ chưa hiện.
- Bậc mặc định chỉ để hiển thị: merchant phải tạo automatic discount cùng số, nếu không checkout không giảm. Ghi chú và info đã nêu.
- `quiz-intermediate` chưa có trong dữ liệu store: cần thêm ở ES1-T178 (ES1-T174 đã nêu). Chưa có tag thì kết quả rỗng, đúng D1.
- Tắt 1 bước thì bộ đếm vẫn ghi "of 3"; merchant không bỏ được lựa chọn mẫu hoặc mô tả mẫu (ES1-T205).
- Tên shop ngắn thì chữ vòng giãn ra vì `textLength` cố định.
- `AGENTS.md:258` cần ghi ngoại lệ cho quiz, bundle: thuộc ticket người TE-14, không sửa ở đây.

## Việc của Orchestrator trước khi push

Scope-guard chặn dev-fe ghi `tests/`. Spec và patch nằm ở drafts:

```
git apply drafts/dev-fe/ES1-T182/ES1-T137.spec.ts.patch
git apply drafts/dev-fe/ES1-T182/ES1-T147.spec.ts.patch
cp drafts/dev-fe/ES1-T182/ES1-T182.spec.ts tests/e2e/ES1-T182.spec.ts
```

## Tự kiểm tra

Đã chạy:
- `shopify theme check`: 87 file, 0 lỗi, `.theme-check.yml` không đổi.
- Locale JSON hợp lệ, 0 khoá trùng.
- So 23 chuỗi `quiz_step` (trừ `s1_hint`, chờ ES1-T183) với bảng BA và spec Designer bằng script: khớp. Script chỉ kiểm chuỗi có trong tài liệu, không kiểm đúng dòng.
- `git apply --check` 2 patch T137, T147: đạt.
- `git diff`: `assets/*.js`, `assets/critical.css` không đổi; `critical.css` 9921 B. Không có file JS trong diff.

Chưa chạy, chưa đạt DoD (theo comment CTO 06/11, e2e và lighthouse đang tắt trên CI, `RUN_STORE_TESTS=false`):
- `npx playwright test` cho T182, T137, T138, T147, T156: spec viết kèm, chưa chạy lần nào.
- `tests/e2e/ES1-T176.spec.ts` hàng 6, 9, 10: file chưa có trên nhánh này, T176 làm cuối theo CTO. Phần chờ ES1-T183 ghi ở trên.
- axe, console, `npx lhci autorun`: `/` nay có thêm quiz và bundle, cần đo lại performance.
- Ảnh 360, 768, 1280, 1920: chờ preview.
- AC-H6 trong editor: agent không mở được editor, cần người chạy tay.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
