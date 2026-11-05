KHÔNG CHẮC: (1) sandbox từ chối shopify.dev (05/11), chưa mở link nào; setting ngày giờ, cách `date` parse chuỗi, setting `video` và `video_url`, metafield reviews là hiểu biết chung, chờ ES1-T152, không chặn task; (2) preview không có block settings nên đường `block.settings.video_url` thật không chạy được trong E2E, phải kiểm tay trong editor (D11); (3) Figma chỉ có desktop, không có trạng thái: mặc định kỹ thuật, ES1-T154; (4) D2 làm đúng AC1 nên vẫn có thể hiện Sale ends in trên sản phẩm không sale, D5, D6 thu hẹp gallery và không tự chạy video: PO quyết ở ES1-T155; (5) trần 2048 B, 2560 B là ước lượng, chưa viết thử; sau khi nạp động, JS trang chủ vượt xa 40 960 B (D8), CTO cần quyết; (6) chưa chạy gì trên store, đây là tài liệu chia task.

# ES1-T142 — Chia TE-13 Block featured product có countdown và video demo carousel thành task FE/BE

Nguồn: docs/srs.md#TE-13 (AC1–AC5; R6, R8, R12), docs/figma-inventory.md hàng 10, 11, docs/figma/snapshot-1-359.json node 1:759, 1:817, docs/figma/img/1-759.png, 1-817.png, DESIGN.md (countdown hết hạn thì ẩn), ADR 0001–0006, AGENTS.md, CONVENTION.md; ES1-T75, ES1-T117, ES1-T118, ES1-T133, ES1-T139, ES1-T143; drafts/techlead/ES1-T59/task-split.md D9, drafts/techlead/ES1-T132/task-split.md D5, D8 (nhánh feature/ai-ES1-T132), drafts/techlead/ES1-T141/task-split.md D10 (nhánh feature/ai-ES1-T141); code: blocks/product-form.liquid, blocks/product-media.liquid, snippets/price.liquid, snippets/product-card.liquid, assets/product-form.js, assets/product-variant-picker.js, assets/product-media.js.
Ước lượng chốt TE-13: 15 point dev (FE 10, BE 5) + 1 task QA không point. SRS sơ bộ 8. Báo PO ở ES1-T155 #1, không đổi phạm vi.

## Lệch so với gợi ý trong ticket ES1-T142

| Gợi ý | Làm | Lý do |
| --- | --- | --- |
| Tái dùng product media gallery | Gallery riêng, chỉ ảnh, 0 JS để cuộn | D5. Block không gọi được block; `product-media.js` thêm 4 407 B |
| Tái dùng product form TE-4 | Tái dùng JS và snippet picker, không dùng block `product-form` | D3. Block đó đọc `product` toàn cục, kéo theo pickup, selling plan, gift card |
| Hết hạn: Liquid không render | Liquid không render, JS ẩn thêm lần nữa | D2. Trang có thể được cache, `now` của Liquid có thể cũ |
| BE1 chỉ thêm JS mới | Sửa thêm `product-variant-picker.js` | D4. Bản hiện tại đổi URL trang chủ và fetch sai trang |
| Video lazy theo viewport | Vào khung mới có thẻ video; bấm mới chạy; iframe chỉ khi bấm | D6. ES1-T155 #4 |

## Quyết định kỹ thuật

D1 Composition:

```liquid
{% block 'container', id: 'home-featured-product', tag: 'div' %}
  {% block 'featured-product', id: 'featured-product' %}{% endblock %}
{% endblock %}

{% block 'container', id: 'home-video-carousel', background: 'alt' %}
  {% block 'video-carousel', id: 'video-carousel' %}
    {% block 'video-card', id: 'video-card-1' %}{% endblock %}
    ...
    {% block 'video-card', id: 'video-card-8' %}{% endblock %}
  {% endblock %}
{% endblock %}
```

- Tối đa 8 thẻ = 8 dòng trong template, như `testimonial-item`: parent không đếm được con (AGENTS.md).
- Band rỗng: cần `content | strip` của PR #85 (ES1-T118). FE1 chờ ES1-T118 cũng vì `snippets/rating-stars`. Không sửa lại `blocks/container`.
- FE1, FE2 cùng sửa `templates/index.liquid` với TE-7, TE-11, TE-12 còn mở: Orchestrator rebase theo thứ tự merge, thứ tự band theo docs/figma-inventory.md.

D2 Countdown:

Thời điểm kết thúc:

| Lựa chọn | Ưu | Nhược | Kết luận |
| --- | --- | --- | --- |
| Setting `text`, `YYYY-MM-DD HH:MM` theo giờ store, Liquid nối offset rồi lấy `%s` | Không cần kiểu setting chưa xác nhận; 1 epoch dùng cho cả Liquid và JS | Merchant có thể nhập sai; lệch tối đa 1 giờ nếu đổi giờ mùa hè trước ngày kết thúc | Chọn tới khi có ES1-T152 #1 |
| Setting `date`, `datetime` | Merchant không nhập sai | Chưa biết có tồn tại | Đổi sang nếu ES1-T152 #1 xác nhận |
| Thời điểm tính từ lúc khách vào, lưu storage | Không cần ngày | Đếm giả, trái AC1, R8 | Loại |

- `data-end` là epoch giây nên mọi múi giờ của khách đều đếm về cùng 1 thời điểm. JS lấy `Date.now()`, sai đồng hồ máy khách thì số sai, không có cách đáng tin hơn: trang có thể cache nên không dùng giờ server trong HTML làm mốc.
- Trống, sai định dạng, không lớn hơn `now`: không có phần tử trong DOM. Sai định dạng hiện cảnh báo trong editor, không đoán.
- Trang cache có thể render khi còn hạn nhưng tới tay khách đã quá hạn: JS kiểm ngay khi kết nối, trước khi hiện.
- Hiện khung: `visibility: hidden` giữ chỗ tới khi có `data-enhanced`, chống CLS và không có số chưa kiểm hiện ra. `@media (scripting: none)` thì `display: none`: số đứng yên là đếm giả. Module hỏng: còn khoảng trống 60px, chấp nhận vì không được hiện số sai.
- Module nạp trước 200px nên khung hiện trước khi vào màn hình, không dịch chuyển trong khung nhìn.
- Figma 3 ô, AC1 4 ô: 4 ô, ô ngày ẩn khi bằng 0. AC thắng, dưới 1 ngày giống Figma (ES1-T154 #1).
- `role="timer"`, không `aria-live`: đọc mỗi giây làm trình đọc màn hình không dùng được. Không animation.
- AC1 không xét sản phẩm có đang sale không. Làm đúng AC1; đề xuất thêm điều kiện ở ES1-T155 #2, sửa 1 điều kiện Liquid. Giá sale sau giờ kết thúc là việc của merchant, theme không đổi được (ES1-T155 #3).

D3 Vì sao không dùng block `product-form`, `product-media`:

| Lựa chọn | Ưu | Nhược | Kết luận |
| --- | --- | --- | --- |
| Gọi 2 block TE-4 từ template, truyền `product` | Tái dùng nhiều nhất | Template không đọc được setting product của block khác; gọi block trong block bị AGENTS.md cấm; kéo theo 18 320 B thẻ script tĩnh, vượt 8 095 B còn lại | Loại |
| 1 block `featured-product` tự chứa, dùng lại snippet và custom element | Đúng composition; Figma chỉ có Add to cart; JS TE-4 chạy không sửa logic mua | Thêm markup form; phải tách picker ra snippet | Chọn |
| JS riêng cho variant trên trang chủ | Không đụng TE-4 | Trái AC2 "dùng chung logic variant TE-4", thêm byte | Loại |

- Dùng lại: thẻ `product-form` + `product-form.js` nguyên bản (đã đọc: cần `data-*`, form id `product-form-{product.id}`, `[role=status]`, `[role=alert]`), `snippets/price`, `snippets/image`, `snippets/rating-stars`.
- Tách `snippets/product-variant-picker`, `snippets/product-variant-select` khỏi `blocks/product-form`. Partial không nằm trong đoạn này nên tách được (partial không đặt trong snippet, TE-8 D4). DoD: TE-4.spec.ts pass.
- Vì form id theo product id, 2 featured-product cùng 1 sản phẩm trên 1 trang không hỗ trợ; `index.te13` dùng sản phẩm khác nhau.
- Spec 4 dòng: nhãn ở 4 setting, giá trị ở `custom.spec_1` đến `custom.spec_4`, dòng thiếu thì ẩn. Không metaobject: thêm định nghĩa, không cần cho 4 dòng text. ES1-T155 #6.
- Rating: `reviews.rating`, `reviews.rating_count`; không có thì ẩn cả dòng, không số giả (R8). `rating-stars` làm tròn nên 4.9 hiện 5 sao, số 4.9 vẫn in bên cạnh. Quyết định "rating ngoài phạm vi" ở ES1-T60 #5 chỉ áp cho TE-4; AC2 của TE-13 có rating.
- `s-view-event` theo mẫu `product-card`, context `recommendation`: giá trị có sẵn trong ES1-T75, block này không có trang riêng.

D4 Đổi variant trên trang chủ. `product-variant-picker.js` hiện dùng `window.location.href` để fetch và gọi `replaceState`. Trên trang chủ: URL thành `/?variant=…`, fetch về trang chủ, `selected_or_first_available_variant` của setting product không theo `?variant=`, partial không đổi.

| Lựa chọn | Ưu | Nhược | Kết luận |
| --- | --- | --- | --- |
| Thêm `data-fetch-url`, `data-regions` vào picker, fetch template phụ `product.featured-product` | Server render đúng variant, giá và % giảm cùng markup | 1 template thêm; sửa file dùng chung | Chọn |
| Fetch `/products/{handle}?variant=` template chính | Không thêm template | Partial `product-price` trả markup trang sản phẩm: mất badge %, thêm ghi chú thuế; 6 region, 4 cái trang chủ không có | Loại |
| Cập nhật giá từ `variant-json` phía client | Không gọi server | Tự định dạng tiền, lệch `| money` (TE-12 D8); viết logic mới | Loại |

- Trang chủ không đổi URL khi đổi variant: `?variant=` trên trang chủ vô nghĩa khi tải lại.
- Sửa picker phải trung hoà byte: trang sản phẩm chỉ còn 14 B (D8). Trần file giữ 7 168 B, hiện 7 156 B, rút từ 605 B comment. Hành vi trang sản phẩm không đổi khi không có 2 data mới.
- Module nạp động nên khách có thể đổi radio trước khi module về, radio nằm ngoài form nên input id cũ: thêm sai variant. Picker so lại khi kết nối, lệch thì update (BE1, có test).
- `requires_selling_plan`: không có form, chỉ View Detail (ES1-T155 #10). `product-form.js` không sửa.

D5 Gallery:
- Chỉ ảnh, tối đa 8, cuộn ngang scroll-snap; thumbnail là link trong trang, chạy không JS. Figma chỉ 1 ảnh. `featured-product.js` thêm phần cuộn theo `theme:variant:change` và tránh nhảy dọc khi bấm thumbnail.
- Không zoom, video, 3D: View Detail đã dẫn tới gallery đầy đủ, tiết kiệm 4 407 B của `product-media.js`. ES1-T155 #5.
- Ảnh đầu `loading="lazy"`: chỉ hero là LCP (DESIGN.md).

D6 Video:

| Lựa chọn | Ưu | Nhược | Kết luận |
| --- | --- | --- | --- |
| Vào khung clone thẻ video `preload="metadata"`, bấm mới chạy | Đúng AC3 nguyên văn; biết lỗi sớm cho AC4; 0 byte video khi tải trang | Cần JS; 1 ít metadata mỗi thẻ trong khung | Chọn |
| Thẻ video có sẵn `preload="none"` + thuộc tính `poster` | Không JS vẫn chạy | `poster` không lazy: 8 ảnh tải khi mở trang; không biết lỗi tới khi bấm | Loại |
| Tự chạy tắt tiếng trong khung | Giống reels | Tải toàn bộ video trong khung, nặng mobile; cần xử lý reduced-motion, pause; không đạt thêm AC nào | Loại, hỏi ES1-T155 #4 |

- Poster là `img loading="lazy"` trong thẻ `a`, không JS bấm được: YouTube, Vimeo tới trang video, Shopify video tới sản phẩm.
- YouTube, Vimeo: iframe chỉ khi bấm, như TE-4 (ES1-T69). Iframe không báo lỗi tải được, nên AC4 chỉ đảm bảo trước khi bấm cho loại này; ghi vào PR. Host giới hạn `youtube-nocookie`, `player.vimeo.com` theo NFR-6 (không script ngoài trước khi khách bấm).
- Rời khung: pause, iframe trả về poster, cùng hành vi `product-media.js` stop (ES1-T77, ES1-T69). Chỉ 1 video chạy.
- Lỗi: bắt `error` dạng capture vì lỗi bắn ở thẻ source. Gỡ video, `data-video-error`, poster thành link sản phẩm. Khung cố định tỉ lệ bằng CSS nên layout không đổi.

D7 Setting `video_url` trên preview: preview không có block settings và param chuỗi không có `.id`, `.type`. FE2 đọc param `video_id`, `video_host` trước, không thuộc schema, rồi `block.settings.video_url.id`, `.type` (chờ ES1-T152 #3). Param chạy được trên preview nhưng không chứng minh đường setting thật: cần 1 lần kiểm tay trong editor (ES1-T153 #3).

D8 Ngân sách JS (ADR 0006, nền từ ES1-T141 D10):

| Trang | Thành phần | Tối đa (B) | Còn lại (B) |
| --- | --- | --- | --- |
| Trang chủ | ES1-T141 D10 32 865; TE-13 không thêm thẻ script tĩnh (`lazy-module.js` đã tính) | 32 865 | 8 095 |
| Sản phẩm | Không đổi; picker giữ trần 7 168 B đã tính | 40 946 | 14 |
| Collection, cart, search | Không đổi | — | — |

Nạp động, ngoài bảng theo định nghĩa ADR 0006:

| File | Tối đa (B) | Khi nào |
| --- | --- | --- |
| `featured-product.js` | 2 048 | Gần viewport |
| `video-carousel.js` | 2 560 | Gần viewport |
| `product-form.js` | 6 757 (`wc -c` hiện tại, không sửa) | Gần viewport |
| `product-variant-picker.js` | 7 168 | Gần viewport, chỉ khi sản phẩm từ 2 variant |

- Sau khi cuộn hết trang: 42 081 (ES1-T141 D10) + 2 048 + 2 560 + 6 757 + 7 168 = 60 614 B, vượt trần 19 654 B. Sản phẩm 1 variant: 53 446 B, vượt 12 486 B.
- Đúng câu chữ ADR 0006, nhưng lệch xa mục đích của trần. Câu hỏi đã nêu ở ES1-T141 D10, chưa có quyết định, TE-13 làm số tăng rõ. CTO quyết: giữ định nghĩa hiện tại (Lighthouse vẫn là cổng chặn, JS dưới màn đầu không ảnh hưởng LCP nhưng lhci không cuộn nên không đo), hoặc sửa ADR thêm trần cho JS nạp động. Nếu siết, ứng viên cắt đầu tiên: nạp `product-form.js` khi tương tác thay vì gần viewport, form POST đã chạy không JS.
- 2 block chỉ đặt ở trang chủ. Đặt lên trang sản phẩm: `lazy-module.js` 384 B vượt 14 B còn lại.
- CSS: `base.css` hiện 57 499 B không có trần riêng trong ADR 0003; `critical.css` không đổi, DoD kiểm `wc -c`.

D9 Thiết kế, token (mặc định, ES1-T154):
- Khung countdown Figma #1A1A1A → `--color-background-dark` #1E1E1E. Nền ảnh #F5F5F1 → `--color-background-cream`. Sọc bảng #EBE6E0 → `--color-background-sand`. Giá và badge #BD1616 → `--color-sale`. Accent #D94610 → `--color-accent` (như TE-11 D7).
- Band video #F4F4F5 → `background: 'alt'` (#F4F4F4). Nhãn số liệu #808080 không đạt AA → `--color-muted`. Không thêm token.
- Bỏ con dấu 1:761: không có SVG, không có trong AC2.
- Default số liệu trống, không có `360+`, `1:15`, `4K` (R8). `countdown_label` có default `Sale ends in` vì chỉ hiện khi merchant đã nhập ngày. Copy Figma nằm ở `index.te13`; visual diff chạy trên `/?view=te13`.
- `docs/figma/img/1-817.png` xuất nền trong suốt nên trông đen: lấy màu từ snapshot.

D10 Hợp đồng FE → BE/QA (đổi tên phải comment ticket):
- Custom element, file: `featured-product` (`assets/featured-product.js`), `video-card` (`assets/video-carousel.js`), `product-form`, `product-variant-picker` (TE-4). Partial: `product-price`, `product-buy-buttons`. Template: `product.featured-product` (`?view=featured-product`, giữ khi lên store thật), `index.te13` (`?view=te13`, gỡ trước khi lên store thật).
- Hook featured: `data-end`, `data-countdown-unit` (days, hours, minutes, seconds), `data-enhanced`, `data-design-mode`, `data-featured-media-id` trên từng ảnh và thumbnail, `data-fetch-url`, `data-regions` trên picker, `data-lazy-module` (BE1).
- Hook video: `data-video-kind` (shopify, external), `data-video-template`, `data-video-poster`, `data-video-error`, `data-label-error`, `data-product-url`, `data-lazy-module` (BE1).
- FE1 (23 testid): `featured-product`, `featured-product-eyebrow`, `featured-product-title`, `featured-product-media`, `featured-product-media-item`, `featured-product-thumbnail`, `featured-product-price`, `featured-product-discount`, `featured-product-rating`, `featured-product-rating-count`, `featured-product-description`, `featured-product-specs`, `featured-product-spec`, `featured-product-countdown`, `featured-product-countdown-days`, `featured-product-countdown-hours`, `featured-product-countdown-minutes`, `featured-product-countdown-seconds`, `featured-product-add`, `featured-product-view-detail`, `featured-product-status`, `featured-product-error`, `featured-product-placeholder`. Picker giữ `product-variant-picker`, `product-option`, `product-option-value`, `product-variant-select`; giá giữ `price*`.
- FE2 (18 testid): `video-carousel`, `video-carousel-eyebrow`, `video-carousel-heading`, `video-carousel-subheading`, `video-carousel-link`, `video-carousel-stat`, `video-carousel-list`, `video-carousel-placeholder`, `video-card`, `video-card-frame`, `video-card-poster`, `video-card-play`, `video-card-template`, `video-card-badge`, `video-card-product`, `video-card-product-image`, `video-card-product-title`, `video-card-placeholder`.

D11 Test và dữ liệu:
- `/?view=te13` đặt setting bằng param, cơ chế đã chạy thật (ES1-T117, PR #85). FE1 tạo file, FE2 thêm phần mình, BE1 không sửa.
- Ngày tính ngay trong template để không hết hạn theo thời gian: `'now' | date: '%s' | plus: 172800 | date: '%Y-%m-%d %H:%M'`.
- `index.te13` (FE1), handle viết cứng từ tests/e2e/store-data.json vì Liquid không đọc env: A `te13-featured` thiếu thì `TE4_SALE_SMALL_PRICE_HANDLE`, còn hạn; B `TE4_VARIANTS_HANDLE`, đã quá hạn; C `TE4_SOLD_OUT_HANDLE`, không ngày; D `TE4_SINGLE_HANDLE`, ngày sai định dạng. Copy Figma 1:759.
- `index.te13` (FE2): bộ 8 thẻ, trong đó thẻ video Shopify lấy từ `TE4_MEDIA_HANDLE` (`media | where: 'media_type', 'video' | first`), thẻ ngoài lấy `external_id`, `host` làm `video_id`, `video_host`; 1 thẻ không poster, 1 thẻ không product, 1 thẻ không nguồn. Copy Figma 1:817.
- Cờ `TE13_METAFIELDS_READY`, `TE13_VIDEO_READY` trong store-data.json (ES1-T153); thiếu thì skip có lý do.
- Đếm giờ dùng `page.clock`, không chờ thật.
- Dev viết `tests/e2e/{key}.spec.ts`, tên test bắt đầu mã AC. dev-fe bị scope-guard chặn ghi tests/ thì nộp ở drafts, Orchestrator chép. QA1 gộp vào `tests/e2e/TE-13.spec.ts`.
- Trang chủ chưa cấu hình không có 2 block nên lhci trên trang chủ không đo được tải thật. QA1 đo thêm `/?view=te13`.

## Bảng task

| Mã | Ticket | Phía | Pt | Tên | Giải pháp | DoD | blocked_by |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TE-13-FE1 | ES1-T156 | FE | 5 | blocks/featured-product + templates/product.featured-product + 2 snippet picker + templates/index + index.te13 + base.css + locales: 8 settings, gallery ảnh, giá + % giảm, rating, spec 4 dòng, khung countdown, 2 partial, 23 data-testid | D1, D2, D3, D4, D5, D9, D10, D11 | `shopify theme check` 0; `npx playwright test tests/e2e/ES1-T156.spec.ts -g "AC1-markup\|AC2\|nojs"` pass desktop + Pixel 7; TE-4, TE-1, TE-3 pass; `wc -c assets/*.js` và critical.css không đổi; axe 0 serious; lhci từ 96/90/98; ảnh 360/768/1280 | ES1-T118 |
| TE-13-FE2 | ES1-T157 | FE | 5 | blocks/video-carousel + blocks/video-card + templates/index + index.te13 + base.css + locales: 11 + 5 settings, tối đa 8 thẻ, Shopify video hoặc YouTube/Vimeo, poster lazy, 3 ô số liệu, scroll-snap, 0 JS, 18 data-testid | D1, D6, D7, D9, D10, D11 | theme check 0; `npx playwright test tests/e2e/ES1-T157.spec.ts -g "AC3-markup\|AC4-markup\|nojs"` pass; 0 request video khi tải trang; ES1-T156, TE-1, TE-3 pass; `wc -c` không đổi; axe 0 serious; lhci từ 96/90/98; ảnh 3 breakpoint | ES1-T156 |
| TE-13-BE1 | ES1-T158 | BE | 5 | assets/featured-product.js + assets/video-carousel.js + assets/product-variant-picker.js + thẻ script trong 2 block: countdown không reset, video lazy, nối product form TE-4 qua lazy-module, trần 2048 B, 2560 B, 7168 B | D2, D4, D5, D6, D8, D10 | `wc -c` tối đa 2048, 2560, 7168; `npx playwright test tests/e2e/ES1-T158.spec.ts -g "AC1\|AC2\|AC3\|AC4"` pass; TE-4, ES1-T156, ES1-T157, TE-3 pass; 0 pageerror; axe 0 serious; lhci từ 96/90/98; bảng D8 trong PR | ES1-T156, ES1-T157, ES1-T139 |
| TE-13-QA1 | ES1-T159 | QA (e2e_from_story) | — | tests/e2e/TE-13.spec.ts + drafts/qa/ES1-T159/test-cases.md, AC1–AC5, desktop + Pixel 7, nhóm nojs | D8, D10, D11 | `npx playwright test tests/e2e/TE-13.spec.ts` pass desktop + Pixel 7; mỗi AC có test chạy hoặc skip có lý do; axe 0 serious; 0 console error; TE-1, TE-3, TE-4 pass; lhci thêm `/?view=te13`; ghi JS thực tải | ES1-T156, ES1-T157, ES1-T158 |

Ghi chú: `\|` trong bảng là `|`; lệnh nguyên văn xem body ticket con. lhci = `npx lhci autorun` (desktop từ 96, mobile từ 90, accessibility từ 98).

Ánh xạ AC: AC1 FE1 (setting, Liquid không render, khung) + BE1 (đếm, ẩn) · AC2 FE1 (markup) + BE1 (đổi variant, nạp form) · AC3 FE2 (markup) + BE1 (lazy) · AC4 FE2 (poster, link) + BE1 (bắt lỗi) · AC5 FE1, FE2, BE1 (lhci) + QA1 (`/?view=te13`).
Thứ tự: ES1-T118 → FE1 → FE2 → BE1 (chờ ES1-T139) → QA1.
Rủi ro lịch: ES1-T139 chờ ES1-T138, ES1-T138 chờ ES1-T133 (CTO đã trả lời, chưa đóng), cùng chuỗi với TE-12-BE1. FE1, FE2 không bị ảnh hưởng ngoài ES1-T118.

## Nguồn API

CTO đã tra trong ticket, dùng được:
- `partials.fetch(...names, { url, signal })`, `partials.apply`; `s-view-event`, context `recommendation`: https://shopify.dev/docs/storefronts/themes/architecture/partials, https://shopify.dev/docs/api/storefront-events-and-actions/events/product-view (ES1-T75)
- `partials.fetch` sang URL template khác, partial phải có trong template đó: https://shopify.dev/docs/api/liquid/tags/partial (ES1-T133 #4)
- Alternate template `?view=`, param object vào `block.settings`: https://shopify.dev/docs/storefronts/themes/architecture/templates/alternate-templates, https://shopify.dev/docs/api/liquid/tags/block (ES1-T117, PR #85 chạy thật)
- CartLinesUpdateEvent context `product` cho block trang chủ, 422 description: https://shopify.dev/docs/api/storefront-events-and-actions/events/cart-lines-update, https://shopify.dev/docs/api/ajax/reference/cart (ES1-T143 #2, #5; `product-form.js` không sửa)
- Lọc media, `external_id`, `host`, `sources`, `preview_image`: đã chạy thật trong `blocks/product-media.liquid` (ES1-T69)

Chưa mở được, CTO xác nhận ở ES1-T152, không chặn task:
- Setting ngày giờ, `video`, `video_url`: https://shopify.dev/docs/storefronts/themes/architecture/settings/input-settings
- Filter `date`, múi giờ khi parse: https://shopify.dev/docs/api/liquid/filters/date
- Object `video`: https://shopify.dev/docs/api/liquid/objects/video
- `external_video_url`, `external_video_tag` với `video_url`: https://shopify.dev/docs/api/liquid/filters/external_video_url
- Metafield `reviews.rating`, `reviews.rating_count`: https://shopify.dev/docs/apps/build/custom-data/metafields/list-of-standard-definitions

Không chắc link cuối đúng trang vì chưa mở được; CTO sửa ở ES1-T152 #5 nếu cần. Web platform (`IntersectionObserver`, `@media (scripting)`, sự kiện `error` của thẻ source, `page.clock` của Playwright) không thuộc shopify.dev, kiểm bằng DoD.

## Câu hỏi

- ES1-T152 (CTO): API. Không chặn, FE1, FE2 có mặc định.
- ES1-T153 (CTO): metafield, video trên store, kiểm tay `video_url`. Không chặn, test skip có lý do.
- ES1-T154 (Designer): ô ngày, mobile, con dấu, play, trạng thái, màu. Không chặn, có mặc định.
- ES1-T155 (PO): ước lượng, countdown trên sản phẩm không sale, video bấm mới chạy, gallery, spec, số liệu, link. Không chặn, có mặc định.

Việc cho CTO ngoài ticket trên: quyết D8 (cùng câu hỏi ES1-T141 D10).

Ngoài phạm vi: tài liệu merchant cho metafield và định dạng ngày (TE-10 AC5), tự chạy tắt tiếng (ES1-T155 #4), zoom và video trong gallery trang chủ (ES1-T155 #5), trang preset bundles (ES1-T146 #9), con dấu 1:761 (ES1-T154 #3).
