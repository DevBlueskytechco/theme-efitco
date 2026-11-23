KHÔNG CHẮC: ngân sách trang chủ base + file tầng 4 ≤ 53 248 B (ADR 0014 mục 5) không đạt: đo thật 55 350 B. Nén từng file mất ngữ cảnh chung ≈ +1,3 KB/file, không phải 100–300 B như ADR ước. Đã hỏi Tech Lead ở ES1-T569; phép so này trong tests/e2e/ES1-T565.spec.ts để test.fixme, mọi kiểm khác chạy thật.

# ES1-T565 TE-10-R2-FE9: tách CSS 5 block trang chủ (ADR 0014)

## Thay đổi
- Mới: assets/quiz.css, shop-the-look.css, bundle-builder.css, featured-product.css, image-with-text.css. Rule chuyển nguyên từ base.css theo drafts/techlead/ES1-T564/selector-map.md mục 1–5 (gồm "Trang chủ theo Figma" 80rem, "Trải nghiệm mượt", "Chuyển động v2"), giữ thứ tự, bọc lại đúng @media gốc. Selector list lẫn nhiều block tách theo block. `@keyframes quiz-fade` → quiz.css; keyframe motion-* và token --icon-* giữ base.css.
- `.quiz-page__breadcrumb*` → assets/collection.css (markup ở templates/collection.quiz.liquid).
- 5 block cha thêm đúng 1 dòng `{{ '<block>.css' | asset_url | stylesheet_tag }}` ngay trước root, trước nhánh placeholder, ngoài mọi `{% partial %}`, không preload; `{% doc %}` ghi file CSS. quiz-step, shop-the-look-row không nạp.
- base.css: xoá phần đã chuyển.
- Cascade: file block nạp sau base.css. `.bundle-builder__submit`, `.shop-the-look__submit` trước đây đứng trước `.button` → bỏ thuộc tính trùng ở rule block (cao/padding do `.button`), không `!important`. Các rule nút/giá khác không đè thuộc tính của `.button`, `.price`, `.rating-stars`, `.button[aria-busy]` (đã so từng rule).
- Spec: mới tests/e2e/ES1-T565.spec.ts (tĩnh, ADR 0014 mục Đo). Sửa ES1-T341 (shop-the-look, quiz, image-with-text đọc file mới), ES1-T387 (mục quiz đọc quiz.css, base không còn `.quiz`, fixture nạp thêm quiz.css, quiz.css ≤ 8 192), ES1-T403 (quiz-option__mark → quiz.css; D5 quét thêm 5 file), ES1-T478 (prelude trùng gồm file block).
- Không đổi markup, class, data-*, testid, partial, custom element. 0 file JS.

## Kích thước (zlib.gzipSync mặc định, B)
| File | develop thô | develop gzip | sau thô | sau gzip | trần |
|---|---|---|---|---|---|
| base.css | 263 435 | 48 641 | 190 988 | 36 925 | 49 152 |
| critical.css | 10 082 | 3 102 | 10 082 | 3 102 | 10 240 thô |
| collection.css | 27 962 | 5 173 | 29 050 | 5 336 | 16 384 |
| quiz.css | – | – | 20 956 | 4 544 | 8 192 |
| shop-the-look.css | – | – | 16 102 | 4 005 | 8 192 |
| bundle-builder.css | – | – | 14 036 | 3 456 | 8 192 |
| featured-product.css | – | – | 13 106 | 3 238 | 8 192 |
| image-with-text.css | – | – | 12 244 | 3 182 | 8 192 |
| Trang chủ: base + 5 file | – | 48 641 | – | 55 350 | 53 248 (không đạt, ES1-T569) |

Trang khác (PDP, collection, cart, trang phụ): CSS chặn render giảm 11 716 B gzip.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi, 9 warning có sẵn (quiz-step default_checked, index.figma/te12 tham số block), không file nào trong diff này.
- Spec tĩnh chạy cục bộ (config tạm bỏ globalSetup vì không có PREVIEW_URL): ES1-T565 6 pass + 1 fixme; ES1-T478 4/4; phần tĩnh ES1-T341 4/4, ES1-T387 6/6, ES1-T403 3/3 pass.
- Test cần trình duyệt (fixture ES1-T387, ES1-T403 rte, toàn bộ store ES1-T341/T387/T403): Chromium không khởi động trong sandbox agent (mach_port permission), chờ CI.
- `npx playwright test` toàn bộ, ảnh index 360/768/1280/1920 trước/sau (reducedMotion), `npx lhci autorun` (perf/LCP trang chủ so develop): chờ CI.
- Theme editor store dev (thêm quiz, featured-product mới có style ngay không reload): chưa kiểm, agent không mở editor; người review kiểm tay, sai thì áp dự phòng ADR 0014 mục 3 (link vào con đầu của root).
- drafts/dev-fe/ES1-T565/: measure.spec.ts, measure.config.ts, static.config.ts, summary.spec.ts là công cụ đo cục bộ; static-run.json, measure.cjs là file tạm, bỏ qua.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
