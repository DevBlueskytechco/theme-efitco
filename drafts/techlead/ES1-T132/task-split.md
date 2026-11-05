KHÔNG CHẮC: (1) sandbox từ chối shopify.dev (05/11), chưa mở link nào; collection tag URL, `current_tags`, `filter.p.tag`, `q` trên /search là hiểu biết chung, chờ ES1-T133, chặn FE2 và BE1 qua FE2; (2) D4 dùng checkbox cho đường không JS, lệch gợi ý radio, PO xác nhận ES1-T136 #4; (3) Figma chỉ có bước 1 desktop: bước 2/3, kết quả, rỗng, mobile là mặc định kỹ thuật, ES1-T135; (4) `@media (scripting)` và `:has` trên NFR-5 theo hiểu biết, chưa tra được nguồn, trình duyệt thiếu hỗ trợ vẫn dùng được nhưng có layout shift khi module nâng cấp; (5) chưa chạy gì trên store; trần 384 B của loader dựa trên bản nháp đo `wc -c` 284 B, chưa chạy thử; đây là tài liệu chia task.

# ES1-T132 — Chia TE-11 Block product finder quiz thành task FE/BE

Nguồn: docs/srs.md#TE-11 (AC1–AC4; R8, R12), docs/figma-inventory.md hàng 6, docs/figma/snapshot-1-359.json node 1:506, docs/figma/img/1-506.png, DESIGN.md, ADR 0001–0006, AGENTS.md, CONVENTION.md, skill block-settings-schema, js-partials; ES1-T75, ES1-T104, ES1-T117, ES1-T118, ES1-T124, ES1-T125; drafts/techlead/ES1-T123/task-split.md D5, D6, D8 (nhánh feature/ai-ES1-T123), drafts/techlead/ES1-T114/task-split.md D2 (nhánh feature/ai-ES1-T114); code: snippets/product-card.liquid, blocks/container.liquid, assets/product-variant-picker.js, assets/product-recommendations.js.
Ước lượng chốt TE-11: 13 point dev (FE 8, BE 5) + 1 task QA không point. SRS sơ bộ 8. Báo PO ở ES1-T136 #1, không đổi phạm vi.

## Lệch so với gợi ý trong ticket ES1-T132

| Gợi ý | Làm | Lý do |
| --- | --- | --- |
| FE1 gồm cả vùng kết quả | Tách FE1 (form, bước) và FE2 (partial, template kết quả) | Kết quả phụ thuộc API chưa xác nhận; FE1 chạy được ngay, CTO đã chấm "chặn hơi thừa" ở ES1-T103. Mỗi task vẫn từ 3 pt |
| Radio ở đường không JS | Checkbox, JS đổi thành radio | D4. 3 nhóm radio cùng tên là 1 nhóm, không gửi được 3 tag trong form GET |
| JS nạp khi vào viewport hoặc tương tác đầu | Chỉ IntersectionObserver, rootMargin 200px | D5. Phím Tab cuộn block vào khung nên kích hoạt observer; chọn trước khi module nạp đã có CSS đỡ (D5) |
| Template kiểm thử `?view=te7` hoặc riêng | Riêng `index.te11` | D9. PR #85 chưa merge, te7 do 4 task TE-7 cùng sửa; cần ca 2 và 4 lựa chọn, tag riêng |

## Quyết định kỹ thuật

D1 Composition (FE1):

```liquid
{% block 'container', id: 'home-quiz', tag: 'div' %}
  {% block 'quiz', id: 'quiz' %}
    {% block 'quiz-step', id: 'quiz-step-1', step: 1, total: 3 %}{% endblock %}
    {% block 'quiz-step', id: 'quiz-step-2', step: 2, total: 3 %}{% endblock %}
    {% block 'quiz-step', id: 'quiz-step-3', step: 3, total: 3 %}{% endblock %}
  {% endblock %}
{% endblock %}
```

- `step`, `total` là param template, không phải setting: con không đọc được cha, cha không đếm được con (AGENTS.md). Đổi số bước = sửa template.
- Figma là panel bo góc rộng 1416 có lề trắng, không phải band tràn. Nền đặt trên root `.quiz`, không truyền `background` cho container.
- Thân rỗng: storefront không render (AGENTS.md empty state). `blocks/container` trên develop chưa bỏ band rỗng; ES1-T118 (PR #85, gate 9/9, chờ merge) thêm `content | strip`. FE1 không sửa lại container: PR #85 chưa merge thì mục "không có band rỗng" của DoD ghi chưa đạt, chờ rebase và báo Orchestrator (đã comment ES1-T137).

D2 Lựa chọn nằm phẳng trong `quiz-step`, 19 settings:

| Lựa chọn | Ưu | Nhược | Kết luận |
| --- | --- | --- | --- |
| Settings phẳng, 4 nhóm `option_n_*` | Đúng AC1; bước đếm được lựa chọn hợp lệ, kiểm được dưới 2 | 19 settings, vượt khoảng 12 của skill | Chọn, nhóm bằng `header` |
| Block con thứ 3 `quiz-option` | Mỗi block ít settings | Lồng 2 cấp, skill cấm; bước không đếm được; truyền `step` cho từng dòng | Loại |
| 1 textarea, mỗi dòng `nhãn, mô tả, tag` | Ít settings | Không có ảnh; merchant dễ sai cú pháp | Loại |

- Thumbnail Figma 40px nên giữ `option_n_image`. Đọc bằng key động trong vòng lặp `(1..4)`.

D3 Cách lấy sản phẩm khớp tag cho đường có JS (FE2, BE1). Liquid không đọc được query string tuỳ ý, URL phải tự quyết định kết quả:

| Lựa chọn | Điều kiện merchant | Khớp | Khi điều kiện thiếu | Kết luận |
| --- | --- | --- | --- | --- |
| `/collections/{h}/{a}+{b}+{c}?view=quiz`, `collection.products` | Chỉ gắn tag | AND (chờ ES1-T133 #1) | Rỗng, hiện text rỗng, đúng sự thật | Chọn |
| `/collections/{h}?view=quiz&filter.p.tag=…` | Bật filter trong Search and Discovery | Có thể OR | Có thể trả cả collection, khách thấy kết quả sai | Loại |
| `/search?view=quiz&q=…` | Không rõ | Không rõ | `q` theo tag chưa có nguồn | Dự phòng nếu ES1-T133 #1 không dùng được |
| Predictive JSON + clone template | Không | Không lọc tag | Trái AC3 "qua partial" | Loại |

- Cơ chế chỉ nằm ở 1 template và 1 chỗ dựng URL, đổi không ảnh hưởng FE1.
- Giới hạn: tag phải có sản phẩm trong collection chọn ở setting `collection`; trống dùng collection all.

D4 Đường không JS (FE1 form, FE2 chốt tham số):
- Bài toán: AC1 cần gửi 3 tag bằng form GET. Tên `filter.p.tag` lặp được, nhưng radio cùng tên trong 1 form là 1 nhóm, chỉ chọn được 1 tag. Radio khác tên thì search không hiểu, Liquid không đọc lại được.

| Lựa chọn | Kết quả | Kết luận |
| --- | --- | --- |
| Checkbox `filter.p.tag`, JS đổi thành radio | 1 markup; không JS chọn được nhiều trong 1 bước, kết quả rộng hơn, vô hại | Chọn, PO xác nhận ES1-T136 #4 |
| Thêm `select` trong `noscript` | Đúng 1 lựa chọn; 2 markup cho cùng dữ liệu | Loại |
| Đọc query từ `content_for_header` | Không phải API; vi phạm Theme Store | Loại |

- Form: action `routes.search_url`, input ẩn `q` bằng `*`, `type` bằng `product`. Chờ ES1-T133 #2, #3; ES1-T134 #5 bật filter trên store.
- JS khi kết nối: đổi `type="radio"`, `name` riêng từng bước. Lỗi fetch: trả lại `type`, `name` gốc rồi `form.submit()`, cùng URL với không JS.

D5 Hiện bước và nạp JS, không gây layout shift:
- JS nạp khi tới gần viewport, nên nếu chờ JS mới ẩn bước 2, 3 thì panel co lại ngay trước mặt khách.
- Chọn CSS: trong `@media (scripting: enabled)`, bước sau chỉ hiện khi bước trước có lựa chọn (`.quiz-step:has(:checked) + .quiz-step`). Module hỏng thì khách vẫn đi hết 3 bước và submit được. JS tắt thì media không khớp, hiện đủ 3 bước đúng AC1.
- Module nâng cấp không đổi bố cục nếu chưa ai chọn. Đã chọn trước đó thì đi tới bước đầu chưa trả lời.
- Editor (`request.design_mode`): `data-design-mode`, hiện đủ bước, không nạp JS. Merchant sửa được mọi bước, không cần xử lý `shopify:block:select`.
- `Step n of 3` và thanh tiến độ render sẵn trong từng bước. JS không đổi chữ, không cần chuỗi cho JS, không JS vẫn đúng.
- `assets/lazy-module.js`: loader chung cho block nặng bên dưới màn đầu, TE-12, TE-13 dùng lại thay vì mỗi story 1 loader. Thẻ script và `data-lazy-module` do BE1 thêm cùng file JS, vì `asset_url` trỏ file chưa có có thể làm theme check báo lỗi (TE-8 D6).

Bàn phím (BE1): phím mũi tên trong nhóm radio đổi lựa chọn, tự sang bước sẽ vi phạm WCAG 3.2.2 và khiến khách không tới được lựa chọn sau. Pointer (`event.detail` lớn hơn 0) sang ngay; Enter, Space sang bước. Không thêm nút Next vì Figma không có.

D6 Vùng kết quả (FE2):
- Partial `quiz-results` viết 1 chỗ trong `blocks/quiz.liquid`, sau thẻ đóng form: swatch trong card là input, lọt vào form sẽ gửi kèm.
- Không tách block vì `{{ content }}` chỉ có 1 chỗ ra, nằm trong form; partial không đặt được trong snippet (TE-8 D4). Param `results_view: true` cho `templates/collection.quiz.liquid` dùng lại đúng block đó.
- Text rỗng và link ở ngoài partial: template khác không đọc được setting của block trên trang chủ. BE1 bật theo `data-quiz-count`. `collection.quiz` vào thẳng dùng locale mặc định.
- Card: `id_prefix: 'quiz'`, `card_context: 'recommendation'`, `heading_level: 'h4'` (h2 tiêu đề, h3 bước và tiêu đề kết quả). Không sửa `snippets/product-card`.
- Vào thẳng URL `collection.quiz` có h1 rồi h4: chấp nhận, không phải đường chính; DoD axe vẫn kiểm.

D7 Thiết kế, token (mặc định, ES1-T135):
- Panel Figma #393942 không có token → `--color-background-dark` #1E1E1E, không thêm token (như TE-7 D5). Bo `--radius-hero`, thẻ trắng và hàng lựa chọn `--radius-card`.
- Accent Figma #D94610 → `--color-accent`, chữ trên badge 5.01:1 (DESIGN.md). Hàng đã chọn nền `--color-background-sand`, mô tả `--color-muted` (6.81), không dùng `muted_light` (4.30 trên sand).
- Đã chọn không chỉ bằng màu: có tick. Vòng chưa chọn `--color-muted-light` để đạt 3:1.
- Body map trang trí, `alt=""`, ẩn dưới 48rem. AC4 ghi 750px, AGENTS.md chỉ có 48rem: theo AGENTS.md (ES1-T136 #6).
- Default không có `Our most-loved feature`, `20 seconds` (R8, TE-7 D7). `heading` giữ Find Your Perfect Gear; `subheading` theo 3 bước (ES1-T136 #2). Trang chủ chưa giống Figma tới khi merchant nhập, visual diff chạy trên `/?view=te11`.

D8 Ngân sách JS (ADR 0006, nền từ TE-8 D8, trần theo task):

| Trang | Thành phần | Tối đa (B) | Còn lại (B) |
| --- | --- | --- | --- |
| Trang chủ | TE-8 D8 32 481 + lazy-module 384 | 32 865 | 8 095 |
| Sản phẩm | TE-8 D8 40 946, không đổi | 40 946 | 14 |
| Collection, cart, search | Không đổi | — | — |

- `assets/quiz-finder.js` tối đa 4 096 B, không thuộc bảng: import động, không có trong thẻ script hay import tĩnh (định nghĩa ADR 0006). Sau khi nạp, trang chủ tối đa 36 961 B, vẫn dưới 40 960 B.
- `product-swatch.js` 5 010 B đã nằm trong số nền qua `featured-collection`.
- TE-12, TE-13 còn 8 095 B static và nên dùng lại `lazy-module.js`, không cộng thêm loader.
- Quiz chỉ đặt ở trang chủ. Đặt lên trang sản phẩm sẽ vượt: chỉ còn 14 B.

D9 Hợp đồng FE → BE/QA (đổi tên phải comment ticket):
- Partial: `quiz-results`. Custom element: `quiz-finder`, file `assets/quiz-finder.js`. Template: `collection.quiz` (`?view=quiz`), `index.te11` (`?view=te11`, gỡ trước khi lên store thật).
- Hook trên root `quiz-finder`: `data-results-url`, `data-results-view`, `data-label-results` (`%n`), `data-lazy-module` (BE1). Trạng thái: `data-enhanced`, `data-design-mode`.
- Hook trong: `data-quiz-step` (n), `data-active`, `data-quiz-title`, `data-quiz-submit`, `data-quiz-back`, `data-quiz-status`, `data-tag-handle`, `data-quiz-results-panel`, `data-quiz-empty`, `data-quiz-count` (root trong partial).
- FE1 (17): `quiz`, `quiz-eyebrow`, `quiz-heading`, `quiz-subheading`, `quiz-note`, `quiz-form`, `quiz-submit`, `quiz-back`, `quiz-status`, `quiz-placeholder`, `quiz-step`, `quiz-step-title`, `quiz-step-progress`, `quiz-step-progress-bar`, `quiz-body-map`, `quiz-option`, `quiz-option-input`.
- FE2 (6): `quiz-results`, `quiz-results-heading`, `quiz-results-grid`, `quiz-empty`, `quiz-empty-text`, `quiz-empty-cta`. Card giữ `product-card*`.

D10 Test và dữ liệu:
- Preview không có block settings: `/?view=te11` đặt setting bằng param, đã chạy thật ở PR #85 (ES1-T117). FE1 tạo file, FE2, BE1 không cần sửa.
- Tag cố định trong template vì Liquid không đọc env: `quiz-upper`, `quiz-core`, `quiz-lower`, `quiz-beginner`, `quiz-advanced`, `quiz-home`, `quiz-gym` (ES1-T134). Cờ `TE11_TAGS_READY`, `TE11_TAG_FILTER_READY` trong `tests/e2e/store-data.json`; thiếu thì skip có lý do.
- Dev viết `tests/e2e/{key}.spec.ts`, tên test bắt đầu mã AC. dev-fe bị scope-guard chặn ghi tests/ thì nộp ở drafts, Orchestrator chép. QA1 gộp vào `tests/e2e/TE-11.spec.ts`.
- Trang chủ chưa cấu hình không có quiz nên lhci trên trang chủ không đo được tải thật. QA1 đo thêm `/?view=te11`, ghi số.

## Bảng task

| Mã | Ticket | Phía | Pt | Tên | Giải pháp | DoD | blocked_by |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TE-11-FE1 | ES1-T137 | FE | 5 | blocks/quiz + blocks/quiz-step + templates/index + index.te11 + base.css + locales: 7 + 19 settings, 2-4 lựa chọn, form GET không JS, ẩn bước bằng CSS, progress, body map ẩn dưới 48rem, 17 data-testid | D1, D2, D4, D5, D7, D9 | `shopify theme check` 0; `npx playwright test tests/e2e/ES1-T137.spec.ts -g "AC1\|AC4\|nojs"` pass desktop + Pixel 7; `wc -c assets/*.js` và critical.css không đổi; TE-1, TE-3 pass; axe 0 serious; lhci từ 96/90/98; ảnh 360/768/1280 | — |
| TE-11-FE2 | ES1-T138 | FE | 3 | blocks/quiz + templates/collection.quiz + base.css + locales: partial quiz-results tối đa 4 product-card theo tag, text rỗng + link collection, chốt tham số không JS, 6 data-testid | D3, D4, D6, D9 | theme check 0; `npx playwright test tests/e2e/ES1-T138.spec.ts -g "AC3\|nojs"` pass; tối đa 4 card, bộ rỗng 0 card; ES1-T137, TE-3 pass; axe 0 serious; lhci từ 96/90/98 | ES1-T133, FE1 |
| TE-11-BE1 | ES1-T139 | BE | 5 | assets/lazy-module.js + assets/quiz-finder.js + thẻ script trong blocks/quiz: 1 custom element, nạp gần viewport, điều hướng bước, Back giữ lựa chọn, focus + aria-live, kết quả qua partial, AbortController, trần 384 B và 4096 B | D3, D4, D5, D6, D8, D9 | `wc -c` tối đa 384 và 4096; `npx playwright test tests/e2e/ES1-T139.spec.ts -g "AC2\|AC3"` pass; ES1-T137, ES1-T138, TE-3 pass; axe 0 serious; lhci từ 96/90/98; bảng D8 trong PR | FE1, FE2 |
| TE-11-QA1 | ES1-T140 | QA (e2e_from_story) | — | tests/e2e/TE-11.spec.ts + drafts/qa/ES1-T140/test-cases.md, AC1–AC4, desktop + Pixel 7, nhóm nojs | D9, D10 | `npx playwright test tests/e2e/TE-11.spec.ts` pass desktop + Pixel 7; mỗi AC có test chạy hoặc skip có lý do; axe 0 serious; 0 console error; TE-1, TE-3 pass; lhci thêm `/?view=te11` | FE1, FE2, BE1 |

Ghi chú: `\|` trong bảng là `|`; lệnh nguyên văn xem body ticket con. lhci = `npx lhci autorun` (desktop từ 96, mobile từ 90, accessibility từ 98).

Ánh xạ AC: AC1 FE1 (form, bước, progress, không JS) + FE2 (kết quả không JS) · AC2 BE1 · AC3 FE2 (partial, rỗng) + BE1 (lấy không reload) · AC4 FE1.
Thứ tự: FE1 → FE2 (chờ ES1-T133) → BE1 → QA1.

## Nguồn API

CTO đã tra trong ticket, dùng được:
- `partials.fetch(...names, { url, signal })`, `partials.apply`; `s-view-event`, context `recommendation`: https://shopify.dev/docs/storefronts/themes/architecture/partials, https://shopify.dev/docs/api/storefront-events-and-actions/events/product-view (ES1-T75)
- Alternate template `?view=`, param object vào `block.settings`: https://shopify.dev/docs/storefronts/themes/architecture/templates/alternate-templates, https://shopify.dev/docs/api/liquid/tags/block (ES1-T117, PR #85 chạy thật)
- Dạng tham số `filter.{p|v}.{attribute}`, lặp tham số; không liệt kê tag: https://shopify.dev/docs/storefronts/themes/navigation-search/filtering/storefront-filtering (ES1-T104)
- `shopify:search:update` chỉ cho submit, filter, sort: https://shopify.dev/docs/api/storefront-events-and-actions/events/search-update (ES1-T124)

Chưa mở được, CTO xác nhận ở ES1-T133:
- Collection tag URL, `current_tags`: https://shopify.dev/docs/api/liquid/objects/current_tags — chặn FE2
- `filter.p.tag` trên /search: https://shopify.dev/docs/storefronts/themes/navigation-search/filtering/storefront-filtering — chặn FE2
- `q` rỗng hoặc `*`, cú pháp tag: https://shopify.dev/docs/api/liquid/objects/search — chặn FE2
- `partials.fetch` sang template khác: https://shopify.dev/docs/storefronts/themes/architecture/partials — chặn FE2
- Event khi quiz hiện kết quả: https://shopify.dev/docs/api/storefront-events-and-actions/events/search-update — không chặn, mặc định không dispatch

Web platform (`@media (scripting)`, `:has`, đổi `type` của input, import động) không thuộc shopify.dev, kiểm bằng DoD FE1, BE1.

## Câu hỏi

- ES1-T133 (CTO): API. Chặn FE2, BE1 qua FE2.
- ES1-T134 (CTO): gắn tag store, bật filter. Không chặn, test skip có lý do.
- ES1-T135 (Designer): bước 2/3, kết quả, rỗng, mobile, nền, ảnh, copy. Không chặn, có mặc định.
- ES1-T136 (PO): ước lượng, copy, body map, checkbox, AND, ngưỡng, hết hàng, default. Không chặn, có mặc định.

Ngoài phạm vi: vùng bấm trên body map (ES1-T136 #3), lưu kết quả trên URL trang chủ, nút Start over, tài liệu merchant block mới (TE-10 AC5).
