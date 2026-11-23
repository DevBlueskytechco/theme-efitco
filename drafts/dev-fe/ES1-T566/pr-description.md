# ES1-T566 TE-10-R2-FE10: tách CSS multicolumn, hello world khỏi base.css; 4 block trang chủ giữ base.css (ADR 0014, CTO 21/11 ES1-T575)

## Quyết định CTO 21/11 (ES1-T575)
- Lần 1 PR tách 6 block. Trang chủ đo 59 962 B (base 31 892 + 9 file 28 070), vượt ngân sách 57 344: nén từng file nhỏ mất ngữ cảnh nén chung.
- CTO chốt: block nhỏ/luôn có ở trang chủ giữ `base.css`; chỉ block lớn hoặc ít dùng trên trang chủ có file riêng. Bỏ mục tiêu hạ base 40 960, giữ trần 49 152.
- Áp: testimonials, video-carousel, faq (+ contact-aside), shop-by-level về lại `base.css` đúng vị trí như develop (cascade không đổi so với develop). Video-carousel (2 916 B gzip khi tách) cũng giữ base vì luôn ở trang chủ; tách riêng thì trang chủ chỉ dư ≈ 1,3 KB thay vì 2 702 B.

## Thay đổi
- Mới: `assets/multicolumn.css`, `assets/hello-world.css` (rule chuyển nguyên văn từ base.css, gồm phần eyebrow cam của multicolumn tách khỏi selector list chung với shop-by-level). `@keyframes highlight-flash` theo hello-world.css.
- `base.css` = develop trừ mục Hello world, mục Multicolumn (giữ `.custom-liquid--placeholder`), `.multicolumn__eyebrow` trong list eyebrow, và focus contact-form. Comment mốc ghi file đích.
- `.contact-form__summary:focus-visible`, `.contact-form__status:focus-visible` → aux.css. aux.css giữ selector `.contact-aside details.faq-item …` (0,3,1), không phụ thuộc thứ tự nạp.
- `blocks/multicolumn.liquid`: link bọc `if columns != blank or request.design_mode`. `hello-world`, `liquid-tips`: luôn in markup nên nạp không điều kiện. Block con không nạp. Ngoài partial, không preload.
- testimonials, video-carousel, faq, shop-by-level, contact-aside: như develop (không link).
- Spec:
  - ES1-T565: PARENTS thêm multicolumn, hello-world; BASE_MAX 49 152; bỏ `test.fixme` ngân sách trang chủ (giờ chạy thật); MOVED 7 block. Lý do ghi trong spec: CTO 21/11 ES1-T575.
  - ES1-T478, T217, T403: thêm multicolumn, hello-world vào danh sách file block. T478 giữ base ≤ 49 152.
  - ES1-T157, T186, T224, T326, T365, T369, T383, T387: như develop.
- ADR 0014: sửa mục 1, 2, 5, Hệ quả, Đo theo CTO 21/11 ES1-T575. `drafts/techlead/ES1-T564/agents-md.md` sửa cho khớp.

## Kích thước (zlib.gzipSync mặc định, B)
| File | develop gzip | sau gzip | trần |
|---|---|---|---|
| base.css | 37 029 | 36 217 | 49 152 |
| aux.css | 6 736 | 6 946 | 16 384 |
| multicolumn.css | – | 1 208 | 8 192 |
| hello-world.css | – | 814 | 8 192 |
| Trang chủ: base + 5 file tầng 4 (ES1-T565) | 55 454 | 54 642 | 57 344 |

- Số file tầng 4 ở index: 5 (≤ 10). Multicolumn, hello-world không có ở index.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi, 9 warning có sẵn, không file nào trong diff.
- `npx playwright test --list`: 3 950 test, 111 file.
- Spec tĩnh + fixture (config tạm, không store): ES1-T565, T478, T217, T403, T157, T186, T326, T365, T369, T387, T383, T224, T313, T184 phần tĩnh/fixture pass; test cần store chờ CI.
- Ảnh index, page.contact, Lighthouse, thêm block trong theme editor: chờ CI / kiểm tay.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
