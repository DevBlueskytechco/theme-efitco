KHÔNG CHẮC: (1) tỉ lệ vùng 33 / 24 / 43 là ước lượng trên ảnh 1:534 vì Figma không vẽ vùng; (2) "Tap the body map" sai chức năng khi không có body map (dưới 48rem, `/` mới cài), đã hỏi PO ở ES1-T206, đang giữ nguyên văn Figma; (3) chữ phụ bundle lệch Figma để đạt 4.5:1, chưa có CTO duyệt như các dòng Contrast decisions khác; (4) e2e, axe, Lighthouse, ảnh chưa chạy.

# ES1-T183 TE-11-FE3: body map bấm được, token panel #393942, copy Two questions

Plan ES1-T169 # 21, CR-9, CR-10. AC-H15, AC-H17 phần markup. Gộp TE-1-FE6.

## Thay đổi
- `blocks/quiz-step`: 3 vùng là `label[for]` của input lựa chọn 1, 2, 3 đã có, không thêm input. Chọn được không cần JS. Vùng chỉ render khi có ảnh và lựa chọn hợp lệ.
- `assets/base.css`: lớp vùng trên ảnh, vùng từ 44px, trạng thái chọn và focus đồng bộ từ input qua `:has`. Dưới 48rem ẩn cả khung. Không đụng `critical.css`.
- Token `background_panel_color` → `--color-background-panel` #393942, dùng cho nền `.quiz`, `.bundle-builder__panel`.
- Copy: default `subheading` của `quiz` thành "Two questions. One shortlist."; `blocks.quiz_step.s1_hint` thành "Tap the body map or pick from the list.". `index.te11` giữ copy riêng theo comment ticket, nên ES1-T137:58 không đổi.
- `locales/en.default.schema.json`: label, info token mới; sửa info `quiz_body_map` vì ảnh không còn chỉ để trang trí.

## Hook cho BE (ES1-T139)
| Hook | Trên | Giá trị |
| --- | --- | --- |
| `data-body-region` | `label.quiz-step__region` | `upper`, `core`, `lower` |
| `data-body-option` | input lựa chọn tương ứng | `upper`, `core`, `lower` |
| `data-testid="quiz-body-region"` | từng vùng | |
| `data-testid="quiz-body-map"` | khung ảnh, chuyển từ wrapper ảnh ra `div` ngoài | |
| `id` input | `<step id>-option-<n>` | đổi sang radio phải giữ id |

Không thêm partial. Trạng thái vùng do CSS đồng bộ, JS không cần đặt gì. Chưa đo `event.detail` của click chuyển tiếp từ label: BE nên bắt click trên `[data-body-region]` để sang bước (đã ghi ở ES1-T139).

## A11y
- Vùng `aria-hidden`, rỗng chữ, không nhận focus. Bàn phím đi qua input trong danh sách; Tab tới input thì vùng hiện viền focus.
- Input có 2 label nên thêm `aria-labelledby` trỏ tới hàng trong danh sách, tên đọc một lần. Theo code `multipleLabelEvaluate` trong `node_modules/axe-core/axe.js`, rule `form-field-multiple-labels` đánh giá pass (đọc code, chưa chạy axe).

## Tương phản (tính theo công thức WCAG, chưa đo trên preview)
| Cặp | Tỉ lệ | Kết quả |
| --- | --- | --- |
| Trắng trên #393942 (chữ chính quiz, bundle) | 11.43 | đạt |
| Trắng trên accent #C8400E (eyebrow, count, nút) | 5.01 | đạt |
| #999999 trên #393942 (Figma chữ phụ) | 4.01 | KHÔNG đạt |
| Trắng 60% pha nền = #B0B0B3 (chữ phụ bundle) | 5.28 | đạt |
| Viền chọn accent trên sand | 4.03 | đạt 3:1 |
| Viền focus foreground trên sand | 14.03 | đạt 3:1 |

Hệ quả: `muted_on_dark` 5.85 chỉ đúng trên #1E1E1E. Chữ phụ `bundle-builder` (`__selection`, `__progress-text`, `__note`) đổi sang biến cục bộ `--bundle-panel-muted`, chữ sẽ sáng hơn Figma, visual diff có thể báo. Ticket chỉ cho 1 token nên dùng `color-mix`, không thêm token.

## Tồn đọng
- Hàng 7 (1:611) chưa có block trong repo: ES1-T148 dùng `--color-background-panel`, và không dùng `muted_on_dark` cho chữ trên panel. Figma hàng 7 cũng dùng #999999 cho chữ phụ.
- Màu giảm giá Figma #4B824D (1:746, 1:618) trên #393942 chưa tính; repo hiện để chữ trắng, không đổi ở PR này.
- `figma-inventory` và `docs/token-compliance.md` chưa nhắc token mới, ngoài phạm vi ghi của dev-fe.

## Orchestrator cần áp (scope-guard chặn dev-fe ghi)
Trong `drafts/dev-fe/ES1-T183/`, đã qua `git apply --check`, phải vào cùng PR vì AGENTS.md yêu cầu token mới đi trong 1 thay đổi:
- `git apply drafts/dev-fe/ES1-T183/tokens.json.patch`
- `git apply drafts/dev-fe/ES1-T183/DESIGN.md.patch`
- `git apply drafts/dev-fe/ES1-T183/ES1-T182.spec.ts.patch` (2 dòng có ghi chú ES1-T183 + dòng đầu)
- Chép `ES1-T183.spec.ts` sang `tests/e2e/ES1-T183.spec.ts`

## Tự kiểm tra
- `shopify theme check`: 87 file, 0 lỗi. `git diff .theme-check.yml` rỗng.
- Không file `assets/*.js` trong diff. `wc -c assets/critical.css` = 9921, không đổi.
- JSON locale, settings_schema parse được; không trùng key.
- Chờ CI, chưa chạy: spec ES1-T183, T137, T138, axe, computed style nền panel, Lighthouse, ảnh 360, 768, 1280, 1920. CTO 06/11: e2e và Lighthouse tắt tới khi trang chủ xong (PR #109), nên spec nộp kèm nhưng chưa phải đã kiểm. Spec chưa type-check.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
