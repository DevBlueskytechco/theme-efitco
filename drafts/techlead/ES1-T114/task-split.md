KHÔNG CHẮC: (1) sandbox từ chối shopify.dev (403, 05/11), chưa mở được link nào, nên yêu cầu "trích dẫn shopify.dev" mới đạt một phần: URL ở mục Nguồn API ghi theo trí nhớ, CTO xác nhận ở ES1-T117, không chặn task vì DoD kiểm bằng chạy thật trên preview; (2) AC2 ghi "button có aria-expanded/aria-controls" nhưng chọn thẻ details không JS → lệch câu chữ AC, PO chốt ở ES1-T115 #1; (3) `?view=te7` và param object vào block.settings chưa chạy thử (D2), không được thì nhánh có ảnh và product chuyển sang bằng chứng tay; (4) `replace` trên `content` (D4) và `strip` (D3) suy từ câu "arrives as a string" của AGENTS.md, chưa kiểm trong editor; (5) hỗ trợ thuộc tính `name` của details trên NFR-5 theo hiểu biết (Chrome 120, Safari 17.2, Firefox 130), chưa tra được nguồn; trình duyệt cũ chỉ mất tính độc quyền, vẫn mở đóng được; (6) Figma lệch inventory và AC, thiếu frame multicolumn → mặc định ở ES1-T116.

# ES1-T114 — Chia TE-7 Block nội dung thành task FE/BE

Nguồn: docs/srs.md#TE-7 (AC1–AC5; R3, R5, R12, R14), docs/figma-inventory.md hàng 8, 12, 13, 15, docs/figma/snapshot-1-359.json + img/1-625, 1-885, 1-992, 1-1057, DESIGN.md, ADR 0001–0006, AGENTS.md, CONVENTION.md, skill block-settings-schema; code: blocks/container, rich-text, slideshow, slideshow-slide, snippets/image, price, icon-trust, templates/index.liquid.
Ước lượng chốt TE-7: 14 point FE, 0 BE, 1 task QA không point. SRS sơ bộ 8 point chưa tính stats FAQ, 2 biến thể image with text, product đính kèm. Báo PO ở ES1-T115 #5, không đổi phạm vi.

## Lệch so với gợi ý trong ticket ES1-T114

| Gợi ý | Làm | Lý do |
| --- | --- | --- |
| FE2 gộp FAQ + image with text | Tách FE2 FAQ, FE3 image with text; multicolumn + Custom Liquid thành FE4 | Skill: 1 block = 1 task; CONVENTION: PR tối đa 400 dòng; mỗi task vẫn từ 3 pt |
| Tái dùng carousel slideshow, mẫu inert + aria-current | Không dùng, testimonials chỉ CSS scroll-snap | D1; không có nút, không có slide ẩn nên không cần inert |
| Biến thể USP theo Figma 1:992 | Không làm | 1:999, 1:1002, 1:1005 `visible: false`, ảnh export không có; inventory lỗi thời (ES1-T116 #1) |
| Preset trong templates/index | Giữ, nhưng index chỉ truyền `id`, `background`, `layout`; không đặt setting qua param | Thứ tự ưu tiên param và merchant chưa rõ (ES1-T117 #4); biến thể đi vào template kiểm thử D2 |

## Quyết định kỹ thuật

D1 Không JS, không task BE. So 2 hướng cho 2 chỗ ticket nêu:
- Testimonials: scroll-snap (chọn) so với tái dùng slideshow.js 8 057 B. slideshow.js gắn với slideshow-slide, gần trần 8 192 B; scroll-snap chạy không JS (NFR-4), đủ AC1 "carousel ở 360".
- FAQ: details + summary (chọn) so với button + JS. AGENTS.md nêu details trong Works without JavaScript; Enter/Space và trạng thái mở có sẵn. Không có `aria-expanded`, `aria-controls` nguyên văn → PO chốt ES1-T115 #1; nếu giữ nguyên văn thì thêm 1 task BE khoảng 3 pt.
- Ngân sách JS (ADR 0006): TE-7 thêm 0 B. Trang chủ hôm nay 22 497 B (header-menu 6 862, header-sticky 1 680, slideshow 8 057, product-swatch 5 010, standard-events 888); tối đa theo ES1-T89 vẫn 32 225 B, còn 8 735 B cho TE-11..13. DoD: `wc -c assets/*.js` không đổi.

D2 Template kiểm thử `templates/index.te7.liquid`, mở bằng `/?view=te7`:
- Vấn đề: preview mỗi nhánh không có block settings, static block chỉ có default schema. AC1 (1–6 mục, sao 0–5), AC2 (allow_multiple), AC3 (trái/phải, có ảnh), AC4 (2–4 cột) không có gì để test trên index.
- Quyết định: template riêng đặt setting bằng param (AGENTS.md: param trùng tên setting đặt luôn `block.settings`), copy Figma, ảnh và product từ `collections.all`. Biến gán ở template, dùng được trong body vì body chạy trong scope người gọi.
- Loại: E2E qua editor (agent không vào được); handle store qua env như TE-4 (không giải quyết setting chữ, số cột); thêm param `default_product` trên block thật (khách thấy review gắn sản phẩm không liên quan).
- FE1 tạo file, FE2–4 mỗi task thêm phần của mình. FE1 kiểm `?view=te7` đầu tiên, không chạy thì báo Tech Lead trước khi làm tiếp.

D3 Band rỗng: `blocks/container.liquid` thêm: `content | strip` rỗng và không `request.design_mode` thì không render. Không có thì custom-liquid rỗng (hoặc block đã xoá hết chữ) để lại khoảng trống 48–120px. Đổi file dùng ở mọi trang nên DoD FE1 chạy TE-1.spec + TE-3.spec.

D4 Một hay nhiều mở (AC2):
- Bài toán: AGENTS.md: body render trước khi block chạy, con không đọc được setting của cha. Setting `allow_multiple` nằm trên `faq`, `name` nằm trên thẻ details của `faq-item`.
- Chọn: khi tắt, `faq` chạy `replace` trên `content`, chèn `name="faq-{block.id}"` vào mọi thẻ details. Con luôn in thẻ mở bằng cùng 1 chuỗi `<details class="faq-item"`, cha thay đúng chuỗi đó.
- Loại: 23 settings phẳng trên 1 block (quá ngưỡng ~12 của skill block-settings-schema); setting lặp ở từng câu (merchant phải sửa 10 chỗ); param template (không phải setting như AC2 yêu cầu); JS (ticket ưu tiên không JS).

D5 Image with text: 1 block + param `layout` (`split` 1:992, `banner` 1:625), không 2 block, vì cùng trường nội dung. Không phải setting: như `background`, template quyết định (ADR 0005). Contrast tính 05/11: accent trên dark 3.33 (không đạt), trên sand 4.03 (không đạt chữ nhỏ), trên cream 4.58 (đạt). → eyebrow dùng `muted_on_dark` 5.85 trên dark, `muted` 6.81 trên sand. Figma dùng #1C1C1C cho nền 1:994 → dùng `background_dark` #1E1E1E, không thêm token.

D6 Multicolumn: số cột do CSS, 0 setting (cha không đếm được con). Figma không có frame nên bố cục do Tech Lead đặt, Designer xác nhận ES1-T116 #7. Đặt cuối trang chủ theo ticket; PO có thể bỏ (ES1-T115 #4).

D7 Default (AC5): text gợi cách dùng. Không đưa tên khách, quote, "360+", "12 months", Verified vào schema vì trên store thật là review và số liệu giả (R8). Hệ quả: trang chủ chưa giống Figma tới khi merchant nhập, visual diff chạy trên `/?view=te7`. PO chốt ES1-T115 #2, #3. Thêm mục = thêm 1 dòng template (Sidekick), như slideshow-slide; merchant xoá chữ để ẩn mục.

Cấu trúc gọi trên templates/index.liquid (thứ tự Figma; TE-9, TE-11..13 chèn giữa sau):

```liquid
{% block 'container', id: 'home-inspiration', background: 'sand' %}
  {% block 'image-with-text', id: 'inspiration', layout: 'banner' %}{% endblock %}
{% endblock %}

{% block 'container', id: 'home-testimonials', background: 'cream' %}
  {% block 'testimonials' %}
    {% block 'testimonial-item', id: 'testimonial-1' %}{% endblock %}
    {% comment %} ... testimonial-2, 3, 4 {% endcomment %}
  {% endblock %}
{% endblock %}

{% block 'container', id: 'home-why-choose', background: 'dark' %}
  {% block 'image-with-text', id: 'why-choose' %}{% endblock %}
{% endblock %}

{% block 'container', id: 'home-faq', background: 'cream' %}
  {% block 'faq' %}
    {% block 'faq-item', id: 'faq-1', open: true %}{% endblock %}
    {% comment %} ... faq-2..5 {% endcomment %}
  {% endblock %}
{% endblock %}

{% block 'container', id: 'home-multicolumn' %}
  {% block 'multicolumn' %}
    {% block 'multicolumn-column', id: 'multicolumn-1' %}{% endblock %}
    {% comment %} ... multicolumn-2, 3 {% endcomment %}
  {% endblock %}
{% endblock %}

{% block 'container', id: 'home-custom-liquid' %}
  {% block 'custom-liquid' %}{% endblock %}
{% endblock %}
```

D8 data-testid (hợp đồng FE → QA, đổi tên phải comment ticket). Container: `container-home-inspiration`, `-testimonials`, `-why-choose`, `-faq`, `-multicolumn`, `-custom-liquid`.
- FE1 (15): `testimonials`, `testimonials-heading`, `testimonials-list`, `testimonials-placeholder`, `testimonial-item`, `testimonial-image`, `testimonial-author`, `testimonial-verified`, `testimonial-rating`, `testimonial-title`, `testimonial-quote`, `testimonial-product`, `testimonial-product-link`, `testimonial-product-price`, `testimonial-placeholder`.
- FE2 (11): `faq`, `faq-heading`, `faq-list`, `faq-placeholder`, `faq-item`, `faq-question`, `faq-answer`, `faq-item-placeholder`, `faq-image`, `faq-stat-1`, `faq-stat-2`.
- FE3 (10): `image-with-text`, `image-with-text-image`, `image-with-text-accent`, `image-with-text-eyebrow`, `image-with-text-heading`, `image-with-text-body`, `image-with-text-button`, `image-with-text-placeholder`, `image-with-text-image-placeholder`, `image-with-text-content`.
- FE4 (12): `multicolumn`, `multicolumn-heading`, `multicolumn-list`, `multicolumn-placeholder`, `multicolumn-column`, `multicolumn-icon`, `multicolumn-image`, `multicolumn-column-heading`, `multicolumn-text`, `multicolumn-link`, `custom-liquid`, `custom-liquid-placeholder`.

D9 Test: dev viết `tests/e2e/{key ticket}.spec.ts`, tên test bắt đầu mã AC. QA1 gộp thành `tests/e2e/TE-7.spec.ts`. Biến thể chạy trên `/?view=te7`, mặc định chạy trên `/`. lhci vẫn đo trang chủ. Bằng chứng tay trong editor chỉ khi D2 không chạy được.

## Bảng task

| Mã | Ticket | Phía | Pt | Tên | Giải pháp | DoD | blocked_by |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TE-7-FE1 | ES1-T118 | FE | 5 | blocks/testimonials + testimonial-item + snippets/rating-stars + blocks/container + templates/index + index.te7 + base.css + locales: 1-6 mục, sao 0-5, ảnh và product tuỳ chọn, scroll-snap 360, lưới 1280, 0 JS, 15 data-testid | D1, D2, D3, D7, D8 | theme check 0; `npx playwright test tests/e2e/ES1-T118.spec.ts -g "AC1\|AC5"` pass desktop + Pixel 7; `?view=te7` chạy; TE-1.spec + TE-3.spec pass; JS không đổi; axe 0 serious; lhci từ 96/90/98; ảnh 3 breakpoint | — |
| TE-7-FE2 | ES1-T119 | FE | 3 | blocks/faq + faq-item + templates/index + index.te7 + base.css + locales: 1-10 câu, thẻ details, setting allow_multiple qua name, ảnh + 2 ô stat, 0 JS, 11 data-testid | D1, D2, D4, D7, D8 | theme check 0; `npx playwright test tests/e2e/ES1-T119.spec.ts -g "AC2\|AC5"` pass, có nhóm nojs; 1 và nhiều mở đúng; accessibility tree đọc được trạng thái; JS không đổi; axe 0 serious; chạm từ 44px; lhci từ 96/90/98; ảnh 3 breakpoint | FE1 |
| TE-7-FE3 | ES1-T120 | FE | 3 | blocks/image-with-text + templates/index + index.te7 + base.css + locales: 10 settings, ảnh trái/phải, 360 ảnh trên, param layout split/banner, 3 ảnh rải, 0 JS, 10 data-testid | D1, D2, D5, D7, D8 | theme check 0; `npx playwright test tests/e2e/ES1-T120.spec.ts -g "AC3\|AC5"` pass; bounding box đúng phía, 360 ảnh trên, không tràn ngang; 0 hex mới; 0 lỗi contrast trên sand và dark; lhci từ 96/90/98, LCP vẫn hero; ảnh 3 breakpoint | FE1 |
| TE-7-FE4 | ES1-T121 | FE | 3 | blocks/multicolumn + multicolumn-column + custom-liquid + templates/index + index.te7 + base.css + locales: 2-4 cột, icon/ảnh, 360 một cột, setting type liquid, 0 JS, 12 data-testid | D1, D2, D6, D7, D8 | theme check 0; `npx playwright test tests/e2e/ES1-T121.spec.ts -g "AC4\|AC5"` pass; 2, 3, 4 cột ở 1280, 1 cột ở 360; custom liquid ra shop.name; rỗng thì không có band; không Lorem; lhci từ 96/90/98; ảnh 3 breakpoint | FE1 |
| TE-7-QA1 | ES1-T122 | QA (e2e_from_story) | — | tests/e2e/TE-7.spec.ts + drafts/qa/ES1-T122/test-cases.md, AC1–AC5, desktop + Pixel 7, nhóm nojs | D2, D8, D9 | `npx playwright test tests/e2e/TE-7.spec.ts` pass desktop + Pixel 7; mỗi AC từ 1 test; axe 0 serious; 0 console error; TE-1.spec + TE-3.spec pass | FE1, FE2, FE3, FE4 |

Ghi chú: `\|` trong bảng là `|`; lệnh nguyên văn xem body ticket con. lhci = `npx lhci autorun` (desktop từ 96, mobile từ 90, accessibility từ 98). Mỗi task thêm block ghi hàng Theme map AGENTS.md trong PR description (scope-guard chặn agent ghi AGENTS.md), CTO hoặc Orchestrator áp: 8 block + 1 snippet.

Ánh xạ AC: AC1 FE1 · AC2 FE2 · AC3 FE3 · AC4 FE4 · AC5 mỗi task phần của mình, FE4 rà toàn story + Custom Liquid · R5 FE4 · R3, R12, R14 mọi FE.
Thứ tự: FE1 → (FE2, FE3, FE4 song song; cùng sửa templates/index.liquid, index.te7, base.css, locales, merge lần lượt, mỗi task chỉ thêm phần của mình) → QA1.

## Nguồn API

Link chưa mở được (403), CTO xác nhận ES1-T117: https://shopify.dev/docs/storefronts/themes/architecture/settings/input-settings (type liquid), https://shopify.dev/docs/storefronts/themes/architecture/templates/alternate-templates (`?view=`).
Có trong repo, không cần tra: block tag, param đặt setting, body là chuỗi, static block cần id (AGENTS.md, Composition model). Thẻ details và thuộc tính name là HTML chuẩn, không phải API Shopify.

## Câu hỏi

ES1-T115 (PO: AC2, copy mặc định, Verified, multicolumn trên trang chủ, 14 pt) · ES1-T116 (Designer: lệch Figma, eyebrow nền tối, lưới 1280, mobile, multicolumn) · ES1-T117 (CTO: API). Không chặn task nào; trả lời khác mặc định thì sửa trong task tương ứng.

## Nợ kỹ thuật

- `templates/index.te7.liquid` đi cùng theme, có copy review Figma, truy cập được bằng `?view=te7`. Phải gỡ trước khi đưa lên store thật; Orchestrator tạo ticket DevOps khi có kế hoạch release.
- docs/figma-inventory.md hàng 8, 13 và DESIGN.md hàng cream ("Inspiration banner") lệch snapshot; sửa khi Designer trả lời ES1-T116.
- assets/base.css 57 499 B, tải trên mọi trang, không có trần riêng (ADR 0003 chỉ trần critical.css). TE-7 tăng thêm; lhci là chốt chặn duy nhất. critical.css 9 921/10 240 B: TE-7 không ghi vào file này, mọi block ở dưới màn đầu.
- Tên `slideshow-icon` dùng ngoài slideshow (nợ ADR 0005) thêm 2 nơi.

## Ngoài phạm vi

Nút trước/sau và dots cho testimonials (Figma không có), tô màu từng từ trong heading 1:625, 3 USP 1:992, thêm mục từ editor không qua template (giới hạn static block của AGENTS.md).
