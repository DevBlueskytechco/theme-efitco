KHÔNG CHẮC: (1) số gzip sau tách là ước lượng từ byte thô (sed | wc -c, tỉ lệ 5,4 của base.css develop 48 641 B), phiên này không chạy được Node/gzip; ES1-T565, ES1-T566 đo thật bằng zlib.gzipSync và ghi PR body. (2) Chưa kiểm trên store: theme editor / Canvas khi thêm block mới có chèn `<link>` trong HTML block và nạp CSS ngay không; DoD ES1-T565 kiểm tay, sai thì áp dự phòng ở mục Quyết định 3. Phần sửa AGENTS.md là đề xuất, CTO áp tay: drafts/techlead/ES1-T564/agents-md.md.

# 0014. CSS theo block: assets/<block>.css nạp bằng stylesheet_tag trong block, base.css chỉ khung + component dùng chung
Ngày: 2026-11-21 | Trạng thái: Đề xuất (hướng CTO chốt 21/11, ES1-T564) | Sửa ADR 0013 mục 1 (nội dung base.css), mục 2 (quy tắc xếp rule), mục 4 (trần base.css). Giữ nguyên 4 file nhóm trang của ADR 0013. Sửa 21/11 theo CTO ES1-T575: block nhỏ/luôn có ở trang chủ giữ `base.css`, bỏ mục tiêu hạ `base.css` 40 960 (mục 1, 2, 5, Hệ quả, Đo).
Cập nhật 21/11/2026 (ES1-T567): nguồn thiết kế là mockup drafts/designer/** (theo Design System Polaris-first), không còn so với bản vẽ cũ; quyết định ADR giữ nguyên.

## Bối cảnh
- ADR 0013 (17/11) tách CSS theo template nhưng để "toàn bộ block trang chủ" ở `base.css`. Trang chủ là nơi R2 thêm nhiều nhất, nên `base.css` lại chạm trần 49 152 B gzip:
  - develop 48 641 B (CTO 21/11, ES1-T564).
  - PR đang mở: #292 50 104 B, #287 49 419 B. Sắp có ES1-T529.
- `base.css` hiện 263 435 B thô, 9 505 dòng. Khoảng 100 KB thô (≈ 38 %) là CSS của 10 block trang chủ không nằm ở màn đầu: quiz, shop the look, bundle builder, featured product, image with text, testimonials, video carousel, FAQ, shop by level, multicolumn. Số dòng theo `drafts/techlead/ES1-T564/selector-map.md`.
- Các block này còn tải trên mọi trang khác (PDP, collection, cart, trang phụ) dù không có ở đó. Merchant và Sidekick có thể đặt chúng ở template bất kỳ (FAQ đã có ở `page.contact` qua `contact-aside`, quiz ở `collection.quiz`). Vì vậy chia theo template (ADR 0013) không giải được.
- Ràng buộc:
  - AGENTS.md: CSS chỉ ở `assets/`. Không `{% stylesheet %}`, không build step, không `<style>` trong block.
  - `critical.css` ≤ 10 240 B thô (ADR 0003). CI chặn merge khi perf < 96 desktop, < 90 mobile, a11y < 98. NFR-1 nghiệm thu desktop ≥ 98.
  - Trang chủ giống mockup drafts/designer/** là mục tiêu số 1. LCP trang chủ là ảnh slide đầu (AGENTS.md mục Images).
  - Canvas: Sidekick sửa từng file, nên phải đoán được rule của block nằm ở file nào.
- Hành vi trình duyệt cần dựa vào:
  - `<link rel="stylesheet">` trong `<body>` hợp lệ (body-ok).
  - Chromium chặn hiển thị phần nội dung đứng sau thẻ link tới khi CSS tải xong. Phần đứng trước vẫn hiện, nên không FOUC cho block đó.
  - Audit "render-blocking resources" của Lighthouse chỉ tính tài nguyên trong `<head>`.
  - Cùng URL xuất hiện 2 lần thì tải 1 lần (cache).

## Lựa chọn đã cân nhắc
- A. File CSS riêng mỗi block lớn, nạp bằng `{{ '<block>.css' | asset_url | stylesheet_tag }}` ngay trong block (chọn).
  - Ưu: CSS chỉ tải khi block có trên trang, ở bất kỳ template nào; Sidekick đi từ `blocks/x.liquid` tới `assets/x.css` không cần đoán. `base.css` bớt ≈ 38 % thô. Thêm block R2 không làm phình trang khác. Thêm block mới trong editor kéo luôn CSS của nó.
  - Nhược: trang chủ thêm tối đa 10 request CSS (HTTP/2, cùng CDN). Phải giữ thứ tự cascade khi tách. Firefox có thể vẽ nội dung trước khi CSS trong body tải xong (FOUC ngắn ở block dưới màn đầu). Block xuất hiện 2 lần sinh 2 thẻ `<link>` (1 lần tải).
- B. Thêm `home.css` nạp theo `template.name == 'index'` (mở rộng ADR 0013).
  - Ưu: 1 request, nằm trong `<head>`, không FOUC, không đổi block.
  - Nhược: sai khi block đặt ở template khác (FAQ ở contact, quiz ở collection.quiz, featured product ở PDP): phải nhân bản rule hoặc để lại base. Index tải CSS của mọi block kể cả block merchant đã xoá. Không phải hướng CTO chốt.
- C. Nâng trần `base.css` lên 57 344 B gzip.
  - Ưu: không đổi gì.
  - Nhược: trang nào cũng tải CSS trang chủ. Trần phải nâng tiếp ở Sprint 3 (TE-18 popup, TE-19, TE-22 mega ảnh). ADR 0013 đã loại.
- D. `<style>` inline trong block hoặc `{% stylesheet %}`.
  - Nhược: trái AGENTS.md. Không cache. Lặp khi block xuất hiện nhiều lần. Loại.

## Quyết định
A.
1. 4 tầng CSS, xếp theo câu hỏi "markup sinh class này render ở đâu":

   | Tầng | File | Nạp | Gồm |
   |---|---|---|---|
   | 1 | `critical.css` | `<head>`, `preload: true` (giữ ADR 0003) | màn đầu: layout, header tĩnh, hero |
   | 2 | `base.css` | `<head>`, mọi trang | token, reset, keyframe `motion-*`, token `--icon-*`. Khung: header, announcement, menu drawer, mega, localization, footer. Lớp: dialog, sheet, drawer, toast, thanh đáy. Component dùng chung: button, round/close button, form, form-status, alert, empty-state, skeleton, spinner, rte, image, container background, product-card, price, rating-stars, product-media, variant picker, product-form, countdown, quick view, cart drawer + cart-lines + cart-summary, predictive search, breadcrumb, page-title, page-banner, pagination, carousel-nav, carousel-progress, "Hàng ngang" chung, article-card. Block màn đầu template mặc định: slideshow, collection-list + collection-card, rich-text. Block có class dùng ở block khác: featured-collection (collection-products, cart-page, 404), blog-posts (article-card + Hàng ngang). Block nhỏ/luôn có ở trang chủ (CTO 21/11 ES1-T575): testimonials, video-carousel, faq (+ contact-aside dùng faq-item), shop-by-level. |
   | 3 | `product.css`, `collection.css`, `cart.css`, `aux.css` | `<head>`, `case template.name` (ADR 0013, không đổi) | block chỉ có ở 1 nhóm template |
   | 4 | `assets/<block>.css` | trong block, `stylesheet_tag` | block cấp section lớn (file riêng đáng 1 request) hoặc ít dùng trên trang chủ, đặt được ở template bất kỳ, không ở màn đầu template mặc định |

2. File tầng 4 đợt này (7 file; selector → file ở `drafts/techlead/ES1-T564/selector-map.md`):

   | File | Block nạp | Gồm block con | Task |
   |---|---|---|---|
   | `quiz.css` | `quiz` | quiz-step (+ `.quiz-page*` trừ `.quiz-page__breadcrumb*` → `collection.css`) | ES1-T565 |
   | `shop-the-look.css` | `shop-the-look` | shop-the-look-row | ES1-T565 |
   | `bundle-builder.css` | `bundle-builder` | — | ES1-T565 |
   | `featured-product.css` | `featured-product` | — (product-media, variant picker, product-form giữ base, ADR 0012, 0008) | ES1-T565 |
   | `image-with-text.css` | `image-with-text` | — | ES1-T565 |
   | `multicolumn.css` | `multicolumn` | multicolumn-column | ES1-T566 |
   | `hello-world.css` | `hello-world`, `liquid-tips` | liquid-tips (gồm `@keyframes highlight-flash`) | ES1-T566 |

   Không tách (CTO 21/11 ES1-T575): testimonials, video-carousel, faq, shop-by-level giữ `base.css`. ES1-T566 lần 1 tách cả 4, trang chủ đo 59 962 B (base 31 892 + 9 file 28 070) > 57 344: nén từng file nhỏ mất ngữ cảnh nén chung với `base.css`, 4 block này luôn có ở trang chủ nên file riêng chỉ thêm byte và request. Đưa về `base.css`: base 36 217, trang chủ 54 642 (5 file ES1-T565). Giữ cả video-carousel (2 916 B gzip khi tách) ở base vì luôn ở trang chủ; tách riêng thì trang chủ chỉ còn dư ≈ 1,3 KB thay vì 2 702 B (ước bằng nén ghép file).

   Thêm 2 chỗ sửa nhóm sai ở ADR 0013: `.contact-form__*:focus-visible` (base.css:8914–8915) → `aux.css`; `.quiz-page__breadcrumb*` (markup ở `templates/collection.quiz.liquid`) → `collection.css`.

3. Cách nạp trong block:
   - Đúng 1 dòng `{{ '<file>.css' | asset_url | stylesheet_tag }}` trong block cha (block gọi từ template).
   - Vị trí: phần xuất HTML, ngay trước thẻ root, trước nhánh `if` placeholder, để cả nội dung thật lẫn placeholder đều có CSS.
   - Chỉ in khi block in markup (ES1-T565, CI 44888604310): bọc dòng link trong `if <điều kiện render> or request.design_mode`, cùng điều kiện với nhánh nội dung thật + nhánh placeholder. Ví dụ `{%- if show_item or request.design_mode -%}{{ 'image-with-text.css' | asset_url | stylesheet_tag }}{%- endif -%}`. Lý do: `blocks/container.liquid` bỏ khung khi body rỗng (`content | strip`); 1 thẻ link đứng một mình làm body không rỗng, storefront in band rỗng (ES1-T120, T148, T156, T180, T182).
   - View dữ liệu `{% layout none %}` (vd `templates/product.featured-product`, trả partial cho trang đã có link) không in link: template truyền `stylesheet: false`, block bỏ dòng link (ES1-T156: 0 `link[rel=stylesheet]`).
   - Ngoài mọi `{% partial %}`. `partials.refresh/apply` không chèn lại hay xoá link. Quick view và quiz results lấy partial về trang đã có link.
   - Block con không nạp. Block cha khác render block con đó thì cũng nạp, ví dụ `liquid-tips` nạp `hello-world.css`.
   - Không `preload: true`. Không `media="print"`/`onload`. Không thêm vào `layout/`. Không gọi từ snippet.
   - Dự phòng nếu editor/Canvas không áp CSS khi thêm block (KHÔNG CHẮC ở đầu): chuyển dòng link vào làm con đầu tiên của thẻ root. Tech Lead ghi lại vào ADR này, không đổi tầng.
4. Quy tắc xếp rule (thay ADR 0013 mục 2):
   - Class chỉ sinh từ 1 block tầng 4 (kể cả block con của nó) thì vào file block đó, gồm cả phần `@media`, mục "Trang chủ theo Figma", "Trải nghiệm mượt", "Chuyển động v2". Giữ thứ tự tương đối, bọc lại đúng `@media` gốc.
   - Selector list lẫn nhiều block (`:is(.featured-product__add, .bundle-builder__submit, .shop-the-look__submit)`, danh sách eyebrow ở base.css:9181, "Hàng ngang" base.css:9354–9432) thì tách. Mỗi phần về file của block đó, chấp nhận lặp khai báo.
   - Không chuyển được (class dùng ở ≥ 2 block, ở snippet dùng chung, ở màn đầu, ở quick view) thì giữ `base.css`. Không chắc cũng giữ `base.css`.
   - File block chỉ dùng token, keyframe chung, class chung đã có ở `base.css`. Không định nghĩa lại token, không `@keyframes motion-*`. Keyframe chỉ 1 block dùng (`quiz-fade`) đi theo block.
   - Thứ tự cascade: file block nạp sau `base.css`, nên rule block giờ thắng mọi rule chung cùng độ ưu tiên. Kể cả rule chung trước đây nằm sau nó trong `base.css`: `.button` trong `@media (min-width: 80rem)` base.css:8979, `.price` 9189, `.rating-stars` 9133, `.button[aria-busy]` 9244. FE so ảnh trước/sau. Lệch thì tăng độ ưu tiên ở rule chung hoặc bỏ thuộc tính trùng ở rule block. Không dùng `!important`.
   - Mục chuyển hết sang file block mà comment đầu mục là mốc cắt của spec (vd `/** Image with text (TE-7` cho ES1-T94, T95, T217, T369) thì giữ comment mốc tại chỗ, ghi file đích. Không sửa spec để bỏ mốc.
   - Block mới R2: mặc định tầng 4. Chỉ vào `base.css` khi ở màn đầu template mặc định hoặc là component dùng chung. Lý do ghi trong PR body.
5. Trần (đo `zlib.gzipSync(readFileSync(f)).length`, mức mặc định):
   - `base.css` ≤ 49 152 B (CTO 21/11 ES1-T575: bỏ mục tiêu hạ 40 960). Sau ES1-T566 đo 36 217 B. Ràng buộc chặt hơn là ngân sách trang chủ dưới đây: còn 2 702 B cho component chung R2 (layer manager, countdown, phân trang, quick view) trước khi trang chủ chạm 57 344.
   - Mỗi file tầng 4 ≤ 8 192 B. Chạm trần thì tách block con ra file riêng, không nâng trần.
   - File tầng 3 giữ ≤ 16 384 B. `critical.css` ≤ 10 240 B thô.
   - Ngân sách trang chủ: `base.css` + tổng file tầng 4 do `templates/index.liquid` nạp ≤ 57 344 B (CTO 21/11 ES1-T569, ES1-T575: chấp nhận overhead nén từng file block; Lighthouse vẫn là gate). Số file tầng 4 trên index ≤ 10 (đợt này 5 của ES1-T565; multicolumn, hello-world không có ở index).
6. FOUC và LCP:
   - Block ở màn đầu (slideshow, header, announcement) không dùng tầng 4. Phần màn đầu vẫn ở `critical.css` (ADR 0003), nên LCP và FCP không phụ thuộc file block.
   - File tầng 4 không preload. Thẻ link nằm trong HTML stream ngay trước block, preload scanner thấy sớm. Preload lại đẩy CSS block dưới màn đầu tranh băng thông với ảnh LCP.
   - Merchant/Sidekick kéo block tầng 4 lên đầu trang: chấp nhận 1 request ≤ 8 KB chặn phần sau nó. LCP vẫn là ảnh hero nếu hero còn ở đầu.
7. PR FE đang mở vượt 49 152 B (#287, #292, ES1-T529): không nâng trần. Rebase sau ES1-T565. Phần CSS block tầng 4 mà PR thêm thì ghi vào file block.

## Hệ quả
- Tốt:
  - Mọi trang không phải trang chủ bớt ≈ 12 KB gzip CSS chặn render (develop trước ES1-T565 48 641 → 36 217 sau ES1-T566).
  - Trang chủ chỉ tải CSS block đang có trên trang. Merchant xoá quiz thì `quiz.css` không tải.
  - Block R2 mới (TE-18 popup marketing, TE-19 upsell, quiz pickup…) có trần riêng 8 192 B, không chặn nhau và không chặn `base.css`.
  - Sidekick: `blocks/quiz.liquid` ↔ `assets/quiz.css`, quy ước tên 1-1.
- Xấu:
  - Trang chủ thêm 5 request CSS trong body (6 thẻ link vì image-with-text 2 lần). Tổng byte gần như không đổi: + header HTTP, nén từng file kém hơn nén chung ≈ 100–300 B/file.
  - Firefox có thể FOUC ngắn ở block dưới màn đầu khi chưa cache.
  - Thứ tự cascade đổi với rule chung nằm sau. Chặn bằng so ảnh trong DoD và e2e hiện có.
  - Lặp vài khai báo khi tách selector list "Hàng ngang" và eyebrow.
  - Thêm 1 nơi phải nhớ khi đổi tên block: tên file CSS.
- Việc:
  - FE, ES1-T565 (5 pt, Sprint 2, chạy ngay): 5 file quiz, shop-the-look, bundle-builder, featured-product, image-with-text; `.quiz-page__breadcrumb*` → collection.css; tạo spec `tests/e2e/ES1-T565.spec.ts`; sửa ES1-T341, T387, T403, T478.
  - FE, ES1-T566 (5 pt, sau T565): multicolumn.css, hello-world.css, contact-form → aux.css; thêm 2 file vào ES1-T217, T403, T478, T565. CTO 21/11 ES1-T575: không tách testimonials, video-carousel, faq, shop-by-level, giữ trần base 49 152 (không sửa ES1-T157, T186, T326, T365, T369, T383, T387); bỏ fixme ngân sách trang chủ ở ES1-T565.
  - Spec trần cần đổi:

    | Spec | Hiện tại | Sau T565 | Sau T566 (CTO 21/11 ES1-T575) |
    |---|---|---|---|
    | `ES1-T478.spec.ts:34` | base ≤ 49 152 | giữ; thêm file block vào kiểm prelude trùng (dòng 70–83) | giữ base ≤ 49 152; thêm multicolumn, hello-world |
    | `ES1-T326.spec.ts:127` | base ≤ 49 152 | giữ | giữ |
    | `ES1-T365.spec.ts:212` | base ≤ 49 152, collection ≤ 16 384 | giữ | giữ |
    | `ES1-T369.spec.ts:192` | base ≤ 49 152, cart ≤ 16 384 | giữ | giữ |
    | `ES1-T387.spec.ts:83–94, 141` | đọc mục quiz trong base.css, fixture chỉ base.css | đọc `quiz.css` cho quizRules + các `not.toContain`; fixture thêm `<style>` quiz.css; base ≤ 49 152 | giữ |

  - Tech Lead, review PR từ nay:
    - Rule của block tầng 4 thêm vào `base.css`: REQUEST_CHANGES.
    - `preload` trên file tầng 4, link nằm trong `{% partial %}` hoặc trong snippet: REQUEST_CHANGES.
    - DoD mọi ticket FE R2 có block mới ghi file CSS đích và trần 8 192.
    - Cập nhật bảng mục 2 khi có file mới.
  - CTO: áp `drafts/techlead/ES1-T564/agents-md.md` vào AGENTS.md cùng lúc merge ES1-T565. Chấp nhận ADR này (Đề xuất → Chấp nhận).
  - DevOps (ES1-T177): giữ 5 URL lhci của ADR 0013. Thêm vào báo cáo cột LCP và số request CSS của `/`.
- Đo:
  - Spec tĩnh `tests/e2e/ES1-T565.spec.ts` (chạy trong `npx playwright test`, không cần store):
    - Mọi `assets/*.css` có dòng `stylesheet_tag` trong `blocks/*.liquid` (trừ 5 file tầng 1–3): gzip ≤ 8 192.
    - Mỗi file tầng 4 có ≥ 1 block nạp. Block cha trong bảng mục 2 nạp đúng 1 lần.
    - Không dòng nào có `preload`. Dòng link không nằm giữa `{% partial` và `{% endpartial %}`. Không `stylesheet_tag` trong `snippets/`.
    - `base.css` ≤ 49 152 (CTO 21/11 ES1-T575). `base.css` + file tầng 4 mà block trong `templates/index.liquid` nạp ≤ 57 344. Số file đó ≤ 10.
    - Không prelude trùng giữa `base.css`, file tầng 3 và file tầng 4. Dùng lại hàm `preludes` của ES1-T478; bỏ qua khai báo lặp do tách selector list vì prelude đã khác.
    - Không class `.quiz`, `.bundle-builder`, `.shop-the-look`, `.featured-product__`, `.image-with-text` (sau T566 thêm `.multicolumn`, `.welcome`, `.highlight`) đứng đầu prelude trong `base.css`.
  - Ảnh: index 360/768/1280/1920 (+ page.contact ở ES1-T566), `reducedMotion`, trước/sau, 0 khác biệt bố cục. Ghi PR body.
  - Lighthouse (`npx lhci autorun`, 5 URL ADR 0013), ở ES1-T565, T566 và mỗi PR FE sau:
    - Ngưỡng CI: desktop ≥ 96, mobile ≥ 90, a11y ≥ 98.
    - Trang chủ không giảm perf và LCP không tăng so với develop trước PR.
    - PDP, collection, cart, contact: perf mobile không giảm. Kỳ vọng tăng do `base.css` nhỏ đi.
    - Lệch thì DevOps báo Tech Lead xem lại danh sách tầng 4.
  - Editor: ES1-T565, T566 thêm block từ theme editor store dev, có style ngay không reload. Sai thì áp dự phòng mục 3.
