KHÔNG CHẮC: (1) AC6–AC9 không có trong docs/srs.md tại develop 2b1f0ff và mọi ref local; `git fetch` bị sandbox chặn (github.com 403) → chia task theo bản tóm tắt trong body ES1-T24, chưa đối chiếu nguyên văn, đã hỏi BA ở ES1-T27. (2) Tech Lead không có quyền đọc Figma trong phiên này → số liệu lấy từ docs/figma-inventory.md; text slide 2, bố cục nút/chấm, mobile do Dev FE đọc 1:422, 1:437. (3) Hero y = 80 trong inventory, nhưng header đè hero bằng margin âm 80px nên hero trong code bắt đầu y = 0; Dev FE đối chiếu 1:363, lệch thì tạo ticket hỏi Tech Lead. (4) 2 lần gọi cùng `slideshow-slide` trong template: AGENTS.md không nói editor có tách settings từng lần gọi không, và param trùng id schema sẽ ghi đè `block.settings` → xem D2, QA kiểm trên editor.

# ES1-T24 — Chia TE-2 Block slideshow (hero) và rich text thành task FE/BE

Nguồn: docs/srs.md TE-2 AC1–AC5, TE-1 AC9; body ES1-T24 (CTO 31/10, tóm tắt AC6–AC9); docs/figma-inventory.md block 2, block 4; docs/tokens.json; ADR 0001–0004; ES1-T11 D5; blocks/header.liquid, assets/critical.css, snippets/image.liquid.

Ước lượng chốt TE-2: 13 point (FE 9, BE 4). SRS sơ bộ 5 point tính cho hero tĩnh, chưa có carousel và JS. Báo PO xếp sprint, không đổi phạm vi.

## Quyết định kỹ thuật

D1 Cấu trúc block:
- 2 block: `slideshow` (cha, nhận `{{ content }}`) + `slideshow-slide` (con). Lời gọi con nằm trong `templates/index.liquid`, trong body của `{% block 'slideshow' %}` (AGENTS.md: block tag chỉ ở layout/templates).
- Root `slideshow-carousel`: custom element có sẵn trong markup, `display: block`, class `full-width`, `data-header-overlay`, `{{ block.shopify_attributes }}`. FE render thẻ ngay từ đầu để tránh lặp lỗi ES1-T22 (JS tự mount).
- Header đã có selector `main > :first-child [data-header-overlay]`, nên slideshow phải nằm trong container đầu tiên của template. Đặt chỗ khác thì header tự về nền đặc, không cần setting.
- Bỏ `hello-world` khỏi `templates/index.liquid` (có h1 riêng, chiếm vị trí đầu trang). File block giữ nguyên, TE-9 quyết khi dựng đủ 16 block.

```liquid
{% block 'container' %}
  {% block 'slideshow' %}
    {% block 'slideshow-slide', priority: true %}{% endblock %}
    {% block 'slideshow-slide' %}{% endblock %}
  {% endblock %}
{% endblock %}
```

D2 Block cha không đọc được con (`content` là chuỗi, body render ở scope caller):
- Không biết số slide trong Liquid → chấm do JS clone từ thẻ `template`, không truyền `slide_count` thủ công (lệch khi Sidekick thêm slide).
- Không biết slide nào đầu → caller truyền `priority: true` (biến thường, không có trong schema), ghi trong `{% doc %}` của slide để Sidekick biết chuyển param khi đổi thứ tự.
- Text slide 2 khác default schema phải truyền param trùng id từ template, giá trị từ locale qua assign + `t`. Param ghi đè `block.settings` → cần kiểm editor còn sửa được không (KHÔNG CHẮC 4). QA kiểm trên preview editor; không sửa được thì tạo ticket hỏi Tech Lead, không tự đổi cấu trúc.

D3 Settings (13, phẳng, label `t:`):
- `slideshow` 2: `autoplay` checkbox default false, `autoplay_speed` range 3–9 s step 1 default 5.
- `slideshow-slide` 11: `image` image_picker, `video` video, `overlay_opacity` range 0–80 % step 5 default 30, `eyebrow` text, `heading` text, `subheading` textarea, `button_label`, `button_url`, `button_2_label`, `button_2_url`, `content_alignment` select left/center/right default left.
- Không thêm setting màu nền: AC4 "nền màu từ setting" dùng global `--color-background-dark`. Lý do: chữ hero luôn trắng, cho chọn màu sáng là vỡ contrast.
- Default slide 1 theo Figma: "Trusted by 10,000+ athletes" + H1 + sub + 1 CTA (đọc 1:422). `button_url` trống → `routes.all_products_collection_url`.

D4 Ảnh và LCP (AC1, ADR 0003):
- Mở rộng `snippets/image.liquid` thêm param tuỳ chọn `widths`, `sizes`, `loading`, `fetchpriority`; không truyền thì output như cũ. TE-3 dùng lại.
- Slide `priority`: `loading="eager"`, `fetchpriority="high"`. Slide khác: `loading="lazy"`, không fetchpriority. HTML trang chủ chỉ có 1 `fetchpriority`.
- `widths` tới 1800; `sizes` khớp bề rộng thật (desktop hero 1798/1920, inset 61px). Focal point: kiểm `object-position` thực tế trên img.
- Không `<link rel=preload>`: block nằm trong body, không ghi được head.
- Giữ chỗ bằng `aspect-ratio` 1798/827 từ 80rem, tỉ lệ mobile Dev FE suy (CTO 27/10), dùng `min-height` chống tràn chữ. CLS không tăng.

D5 Video (AC1):
- `video_tag` autoplay, muted, loop, playsinline, không controls; `image_tag` poster `preview_image` nằm dưới video, nhận logic D4 để LCP là ảnh có fetchpriority.
- Có cả ảnh và video → video thắng, ảnh chính bỏ qua.
- Rủi ro: slide đầu là video không nằm trong dữ liệu benchmark lhci (benchmark dùng ảnh). Merchant chọn video là chấp nhận lệch ngân sách; ghi vào docs/merchant.

D6 Overlay và chữ (TE-1 AC9):
- Lớp phủ: `color-mix(in srgb, var(--color-background-dark) var(--overlay-opacity), transparent)`, biến inline theo `overlay_opacity`. AC9 ghi "đen", inventory ghi hero overlay dùng `--color-background-dark` → dùng token, không literal (ADR 0001).
- Chữ `--color-background-dark-foreground`. Eyebrow và sub không dùng `--color-muted-*`.
- Slide `priority` = h1, slide khác = h2 (mỗi trang 1 h1).
- Căn lề: `data-alignment` theo setting ở 48rem trở lên; dưới 48rem luôn giữa (AC2).
- Nút dùng class chung mới `.button`, `.button--secondary` trong `assets/base.css`: nền `--color-accent`; secondary dùng `currentColor` để chạy cả nền tối lẫn nền sáng; cao ≥ 44px, `:focus-visible` 2px. Repo chưa có class nút chung (chỉ `.site-footer__submit`); 9 instance CTA trong Figma dùng lại.

D7 Không JS và CSS:
- Track: `display: flex`, `overflow-x: auto`, `scroll-snap-type: x mandatory`, slide `flex: 0 0 100%`, `scroll-snap-align: start`, `tabindex="0"` + `aria-label` (axe scrollable-region-focusable).
- `slideshow-carousel:not([data-enhanced]) .slideshow__controls { display: none }`; prev/next/chấm chỉ hiện khi có `[data-multiple]`. Nút render sẵn trong markup, không để JS tạo.
- Toàn bộ CSS vào `assets/base.css` (render-blocking, không CLS). KHÔNG đụng `critical.css`: 9785/10240 byte, còn 455 byte, không đủ.
  Sửa số liệu: ticket FE1 ghi "còn 215 byte" theo ngưỡng 10000; ADR 0003 ghi 10 KB nên DoD dùng 10240. Kết luận không đổi.

D8 Rich text (AC5):
- `blocks/rich-text.liquid` tự chứa, 6 settings. Chỉ phần 1:454; 1:464 "Choose Your Training Level" thuộc TE-3.
- `heading_level` default h2; chọn h1 là quyết định merchant, ghi trong `info` của setting.
- Không thêm setting căn lề: dùng `alignment` của `container` có sẵn.
- FE2 chạy sau FE1 vì dùng `.button` và cùng sửa `templates/index.liquid`.

D9 JS (ADR 0002):
- `assets/slideshow.js`, ES module, ≤ 8192 byte, 1 custom element, không partial (không có dữ liệu server cần refresh).
- Chuyển slide vẫn bằng scroll-snap: `track.scrollTo()`; vuốt do trình duyệt xử lý; active từ IntersectionObserver (threshold 0.6, root track). Không touch/scroll listener → không tốn main thread, không lệch giữa có/không JS.
- Vòng: next ở cuối về đầu, prev ở đầu về cuối.
- A11y: `aria-roledescription` carousel/slide render sẵn, JS đặt `aria-label` "Slide X of Y"; slide không active `inert`; bỏ `tabindex` track khi đã enhanced; live region polite, không báo khi autoplay đang chạy.
- Autoplay dừng khi hover, focus trong block, tab ẩn, ra khỏi viewport, reduced-motion, `Shopify.designMode`. Bấm pause dừng hẳn tới khi bấm play.
- Video chuyển động > 5s phải dừng được (WCAG 2.2.2): nút pause hiện khi có autoplay HOẶC có video, kể cả 1 slide.
- Editor: bắt `shopify:block:select` để cuộn tới slide nếu sự kiện có bắn.

## Bảng task

| Mã | Ticket | Phía | Pt | Tên | Giải pháp | DoD | blocked_by |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TE-2-FE1 | ES1-T28 | FE | 6 | blocks/slideshow.liquid + blocks/slideshow-slide.liquid + snippets/image.liquid + templates/index.liquid + assets/base.css + locales: 13 settings, ảnh/video, overlay, scroll-snap không JS, hook data-header-overlay, 14 data-testid | D1–D7 | `shopify theme check` 0; 1 `fetchpriority`, 1 h1 trên trang chủ; chặn JS vẫn cuộn slide, controls ẩn, không tràn ngang 360/768/1280; axe 0 serious/critical; lhci ≥ 96/90/98, CLS không tăng; `wc -c assets/critical.css` ≤ 10240; ảnh 3 breakpoint; ui-diff 1:422; 0 file JS | — |
| TE-2-FE2 | ES1-T29 | FE | 3 | blocks/rich-text.liquid + templates/index.liquid + assets/base.css + locales: 6 settings, h1/h2, richtext, nút tuỳ chọn, độ rộng tối đa, 4 data-testid | D8 | `shopify theme check` 0; vẫn 1 h1; không label thì không nút; axe 0 serious/critical; lhci ≥ 96/90/98; ảnh 3 breakpoint; ui-diff 1:454; 0 file JS | FE1 |
| TE-2-BE1 | ES1-T30 | BE | 4 | assets/slideshow.js: 1 custom element, nút/chấm/vuốt, autoplay + pause, reduced-motion, a11y carousel, ≤ 8 KB | D9 | `npx playwright test tests/e2e/ES1-T30.spec.ts` pass; `wc -c assets/slideshow.js` ≤ 8192; tổng JS ≤ 40 KB; `shopify theme check` 0; 0 console error; lhci ≥ 96/90/98 | FE1 |

Thứ tự: FE1 → FE2, BE1 song song. Lệnh lhci = `npx lhci autorun` (desktop ≥ 96, mobile ≥ 90 qua lighthouserc.mobile.json, a11y ≥ 98). Preview, Playwright, lhci do CI chạy sau khi Orchestrator push.

Không chia nhỏ hơn: mỗi task ≥ 3 pt, 1 block chức năng = 1 task FE + 1 task BE nếu có JS. Rich text tách khỏi FE1 vì gộp vượt PR ≤ 400 dòng (ước ~540 dòng). FE1 một mình ước ~440 dòng, trong đó schema + locale ~130: vượt thì Dev FE ghi lý do trong PR, không tách thêm (cùng block, tách là dưới 3 pt).

## Hợp đồng hook FE1 → BE1

Ghi trong `{% doc %}` của blocks/slideshow.liquid.

| Hook | Nơi đặt | Ai đặt | Ý nghĩa |
| --- | --- | --- | --- |
| `slideshow-carousel` | root | FE | custom element host |
| `data-header-overlay` | root | FE | header trong suốt, TE-1 AC9 |
| `data-autoplay`, `data-autoplay-speed` | root | FE | từ settings, speed tính giây |
| `data-label-slide` | root | FE | locale, token `[index]`, `[total]` |
| `data-label-dot` | root | FE | locale, token `[index]` |
| `data-label-pause`, `data-label-play` | root | FE | locale |
| `data-enhanced`, `data-multiple` | root | JS | hiện controls; `data-multiple` khi ≥ 2 slide |
| `data-playing` | root | JS | trạng thái autoplay |
| `inert` | slide | JS | slide không active |
| thẻ `template` | trong `slideshow-dots` | FE | mẫu 1 nút chấm, JS clone, đặt testid `slideshow-dot` |

14 data-testid FE1: `slideshow`, `slideshow-track`, `slideshow-slide`, `slideshow-image`, `slideshow-video`, `slideshow-heading`, `slideshow-button-primary`, `slideshow-button-secondary`, `slideshow-controls`, `slideshow-prev`, `slideshow-next`, `slideshow-dots`, `slideshow-pause`, `slideshow-live`.
4 data-testid FE2: `rich-text`, `rich-text-heading`, `rich-text-body`, `rich-text-button`.

## Ánh xạ AC

AC1 FE1 · AC2 FE1 · AC3 FE1 · AC4 FE1 · AC5 FE2 · AC6–AC9 FE1 (markup, scroll-snap, hook) + BE1 (điều hướng, autoplay, pause, reduced-motion, a11y động) · TE-1 AC9 `overlay_opacity`, `data-header-overlay` FE1. Số AC6–AC9 chưa map chi tiết được vì chưa có nguyên văn (ES1-T27).

## Việc ngoài phạm vi Tech Lead, cần Orchestrator/PO xếp

- Spec E2E phần FE (AC1–AC5, editor D2): chưa có ticket QA. BE1 chỉ phủ tương tác.
- docs/merchant cho slideshow, rich text (Writer), kèm cảnh báo video D5.
- SRS: tiêu đề TE-2, Phía FE+BE, point 13 (trong ES1-T27).
