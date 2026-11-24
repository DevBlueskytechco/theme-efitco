KHÔNG CHẮC: (1) spec chưa chạy trên preview: phiên QA không có PREVIEW_URL/STORE_PASSWORD; mới qua `npx playwright test tests/e2e/ES1-T159.spec.ts --list` (116 test = 58 × desktop + mobile Pixel 7, biên dịch OK). Kết quả thật chờ CI store-tests của PR, chưa báo đạt. (2) Lighthouse (AC5) chưa chạy, bảng số để trống. Offset giờ store chưa đo: TC-01 ghi vào annotation `store-offset` khi chạy. (3) Tên file theo key ES1-T159 (Orchestrator), tiêu đề ticket ghi `tests/e2e/TE-13.spec.ts`; DoD ghi `TE-1.spec.ts`, `TE-3.spec.ts`, `TE-4.spec.ts` nhưng repo không có các file đó (spec đặt tên theo key ES1-T*), regression chạy bằng CI toàn bộ `tests/e2e`. (4) Hỏi Tech Lead ở ES1-T608: AC-H22 "đổi variant trên /" khi `templates/index.liquid` dùng `hide_options: true`; kết quả mong đợi khi JS bật mà `sale-countdown.js` lỗi tải (số Liquid đứng yên). (5) Ticket viết trước ADR 0009: "quá hạn theo đồng hồ khách trên trang cache (hidden)" đổi thành K3 "This sale has ended" theo SRS 0.5 TE-4 AC17 + countdown.md §5 (CTO 11/11: theo SRS 0.5). (6) D8 trong `drafts/techlead/ES1-T142/task-split.md` không có trong worktree; ngân sách JS đối chiếu ADR 0006, 0010 (tải sẵn ≤ 40 960 B, sau cuộn ≤ 65 536 B).

# ES1-T159 — TE-13 Block featured product có countdown và video demo carousel

Nguồn: docs/srs.md#TE-13 (0.5: AC1–AC8, AC-H21–AC-H23), TE-4 AC17, AC32 (component countdown chung), ticket ES1-T159 + comment Tech Lead 06/11 + CTO 11/11, docs/ui-spec/countdown.md §5, mockup `drafts/designer/ES1-T293/index.html` `#container-home-featured-product`, `#container-home-video-carousel` (Figma 1:759, 1:817). AC trích: `drafts/qa/ES1-T159/ac-scope.md`.
Spec: `tests/e2e/ES1-T159.spec.ts`. Template kiểm thử: `/?view=te13` (1 featured có bộ chọn + bộ 8 video), `/?view=te13-states` (band A–E: còn hạn, quá hạn, hết hàng, sai định dạng, không ngày), `/?view=te13-featured` (te13-featured có metafield).
Không viết trùng spec dev: ES1-T156 (markup featured), ES1-T157 (markup video), ES1-T158 (JS featured/video), ES1-T344 (sale-countdown.js, nạp lười). File này là nghiệm thu theo AC; hợp đồng hook, trần byte từng file, tab ẩn/ra khỏi khung đã có ở các spec đó.

| ID | AC | Given | When | Then | Loại | Ưu tiên |
| --- | --- | --- | --- | --- | --- | --- |
| TC-01 | AC1 | /?view=te13-states band A, sản phẩm có giá gạch, setting `countdown_end` = now + 48 h (giờ store), không metafield | render | khung `role=timer`; `data-end` = `te13-meta[data-expected-end]` (epoch tính theo offset store); `time[datetime]` cùng epoch, offset ghi annotation; 4 ô; tổng số in sẵn ≈ còn lại (± 90 s cache) | E2E | P1 |
| TC-02 | AC1 | band B, ngày đã qua | render | 0 phần tử `sale-countdown`/`[data-sale-countdown]` | E2E | P1 |
| TC-03 | AC1 | band E, đang sale, không ngày ở cả 2 nguồn | render | 0 countdown | E2E | P1 |
| TC-04 | AC7 | band D, `countdown_end` = "31/12/2030 23:59" (cũng là case "sai định dạng" của AC1) | render storefront | 0 countdown, 0 `featured-product-countdown-notice` | E2E | P1 |
| TC-05 | AC1, AC6 | band C, hết hàng toàn bộ, ngày còn hạn | render | 0 countdown; nút disabled "Sold out" | E2E | P1 |
| TC-06 | AC1 | trang cache: đồng hồ khách (page.clock) đã qua `data-end` 30 s khi JS chạy | module chạy | `data-state=ended`, chữ "This sale has ended", không ô số, không số âm | E2E | P1 |
| TC-07 | AC1 | đang đếm, còn 4 s | page.clock.runFor 6 s rồi 10 s | K3, khung giữ chiều cao (± 2), không đếm lại; giá và nút giữ nguyên; 0 điều hướng (không tự tải lại) | E2E | P1 |
| TC-08 | AC1 | còn 3 ngày 1 giờ (`data-end` đặt trước module, đồng hồ thật) | chờ 2 s; xoá localStorage + sessionStorage; tải lại cùng URL bằng `gotoStore` | số = `data-end` − now (± 2 s) trước và sau tải lại; 0 khoá countdown/deadline/timer/sale trong storage | E2E | P1 |
| TC-09 | AC-H23 | còn 5 giờ 2 phút | render, chạy 1 s, 4 s | ô ngày ẩn; 3 ô 2 chữ số; tổng giảm đúng 1 rồi 4 | E2E | P1 |
| TC-10 | AC1 (TE-4 AC32) | còn 3 700 s | chạy 200 s | `running` → `ending`; nền ô = `--color-accent`; kích thước ô không đổi; ô vẫn là 2 chữ số | E2E | P2 |
| TC-11 | AC1 | còn 2 ngày | render | `aria-labelledby` trỏ câu ẩn có ngày; `.sale-countdown__units` aria-hidden; 0 `aria-live` | a11y | P2 |
| TC-12 | AC1 | te13-featured có metafield `custom.sale_ends_at` + setting = now + 48 h | render /?view=te13-featured | `data-end` ≠ ngày setting (metafield thắng). Skip có lý do khi `TE13_METAFIELDS_READY` chưa bật | E2E | P2 |
| TC-13 | AC1 | 1 band (/?view=te13), đổi sang biến thể không giá gạch | đổi biến thể | countdown ẩn. `test.fixme`: ES1-T600 (slot không nằm trong partial) | E2E | P2 |
| TC-14 | AC2 | band A, sản phẩm ≥ 2 media | render | số media item = min(media, 8); số thumbnail = số media; mỗi href `#FeaturedMedia-…` trỏ tới phần tử có thật | E2E | P1 |
| TC-15 | AC2 | sản phẩm featured có video/3D | render | 0 `video[autoplay]`, 0 iframe ngoài template, video `preload=none`. Skip khi sản phẩm chỉ có ảnh | E2E | P2 |
| TC-16 | AC2 | band A | render | giá, giá gạch, % giảm = biến thể trong `/products/{handle}.js` có id = hidden `id` | E2E | P1 |
| TC-17 | AC2, AC6 | band B, D biến thể hiện tại không sale | render | 0 `price-compare`, 0 badge % | E2E | P2 |
| TC-18 | AC2, AC6 | te13-featured có `reviews.rating`, `rating_count`, `custom.spec_n` | render | hàng sao "(x.x)", "N reviews"; bảng ≤ 4 dòng, dòng nào cũng có giá trị | E2E | P2 |
| TC-19 | AC2, AC6 | band A không metafield, có nhãn spec | render | 0 hàng sao, 0 bảng spec | E2E | P2 |
| TC-20 | AC2, AC6 | band C hết hàng | render | Add disabled; "View details" enabled, href = product.url; tên truy cập chứa " of {product}" | E2E/a11y | P1 |
| TC-21 | AC2 | locale đã đổi sentence case | render | nút "Add to cart", link "View details". Skip khi locale còn Title Case: chờ ES1-T578 | UI | P3 |
| TC-22 | AC2, AC-H22 | /?view=te13 band A có bộ chọn, ≥ 2 biến thể còn hàng | chọn biến thể khác (ưu tiên có ảnh riêng) | hidden `id` đổi; giá/giá gạch/% khớp JSON; nút bật; thumbnail ảnh biến thể `aria-current=true`, ảnh vào khung; URL không đổi, 0 điều hướng | E2E | P1 |
| TC-23 | AC2, AC-H22 | band A biến thể còn hàng, `cart_type` theo setting store | bấm Add to cart (thật, helper 429) | `/cart.js` có variant id; drawer: `cart-drawer-dialog` hiện, `header-cart-count` = 1; page: URL /cart | E2E | P1 |
| TC-24 | AC2 | đổi `data-cart-type` sang chế độ còn lại trước khi module chạy | bấm Add to cart | page → /cart; drawer → drawer mở | E2E | P2 |
| TC-25 | AC2 | `route.abort` /cart/add.js; POST /cart/add thường được `route.fulfill` giả (store dev Cloudflare chặn POST thật) | bấm Add to cart | theme gửi POST /cart/add.js rồi rơi về submit form thường (ES1-T67 AC8, `assets/product-form.js`): request điều hướng POST /cart/add có id biến thể đang chọn; 0 pageerror | E2E | P1 |
| TC-26 | AC-H22 | `/` đã áp fixture (ES1-T331), `hide_options` | bấm Add to cart | 0 bộ chọn (ghi ES1-T608); `/cart.js` có variant; drawer mở, số giỏ = 1 | E2E | P1 |
| TC-27 | AC3 | bộ 8 thẻ; bộ trộn 1 có nguồn + 1 không; bộ không nguồn | render | 8 thẻ; 1 thẻ; band rỗng không có carousel; thẻ có poster có `img` | E2E | P1 |
| TC-28 | AC3 | carousel đẩy xuống 400vh | tải; cuộn tới | 0 request tệp video/embed khi tải; 0 `video`/`iframe`; sau cuộn: 0 request YouTube/Vimeo; thẻ Shopify có `video` | E2E/perf | P1 |
| TC-29 | AC3 | carousel trong khung | chờ 800 ms | 0 `video[autoplay]`; mọi video `paused` | E2E | P1 |
| TC-30 | AC3 | thẻ YouTube, embed fulfill giả | bấm poster | request embed chỉ sau bấm; iframe `youtube-nocookie.com/embed/` tại chỗ; URL trang giữ; thẻ khác vẫn poster | E2E | P1 |
| TC-31 | AC3 | template kiểm thử có 3 stat; bộ trộn stat 2 không value | render | 3 ô ("360+"); bộ trộn 1 ô (comment Tech Lead 06/11: chỉ kiểm trên template kiểm thử) | UI | P3 |
| TC-32 | AC4 | (gồm trạng thái lỗi của AC8) thẻ 1 Shopify (thật hoặc giả: init script bỏ qua khi thẻ đã là Shopify, chỉ mở trang 1 lần), `route.abort` tệp video | vào khung | `data-video-error`; poster hiện, href = product url; chữ ẩn "Video unavailable. View {title}"; 0 `video`; khung giữ kích thước (± 1); link sản phẩm giữ; thẻ 2 bấm vẫn ra iframe; axe 0 serious; 0 pageerror | E2E/a11y | P1 |
| TC-33 | AC5 | `/` và `/?view=te13` | tải; cuộn hết trang | JS của theme (`/t/<id>/assets/*.js`, mỗi file 1 lần, số lớn nhất của decodedBodySize / transferSize / `wc -c` tệp repo; không tính script Shopify theo ADR 0006) tải sẵn (sau networkidle) ≤ 40 960 B, sau cuộn ≤ 65 536 B (ADR 0006, 0010); số + danh sách file ghi annotation `js-bytes`; 0 file theme đọc được thì fail | perf | P1 |
| TC-34 | AC6 | viewport 360, band A STATES | render | media 320 × 320; View detail dưới Add, 2 nút cùng rộng = 320; ô countdown 40, số 16px (± 2 px) | UI | P2 |
| TC-35 | AC6 | viewport 768 | render | media 728 × 546; 2 nút cùng hàng; ô 44, số 18px; th/td spec cùng hàng | UI | P2 |
| TC-36 | AC6 | viewport 1280 | render | gallery 580, khoảng 80, chi tiết 580; ảnh 580 × 566 | UI | P2 |
| TC-37 | AC8 | viewport 360 / 768 / 1280, bộ 8 thẻ | render, cuộn tới | 360: thẻ 252 × 448, lộ 72 px thẻ 2, không nút; 768/1280: thẻ 264, nút 52 "Previous videos"/"Next videos"; thanh tiến trình hiện; 1280: 4 thẻ trọn + ≥ 25% thẻ 5 | UI | P2 |
| TC-38 | AC8 | viewport 1280, thẻ 6 có sản phẩm | render | play 52 × 52 giữa khung (± 2); vùng bấm link tên sản phẩm (::after phủ hàng sản phẩm) cao ≥ 44, hit-test 2 góc + giữa hàng trúng link; chữ không ellipsis, không bị cắt | UI/a11y | P2 |
| TC-39 | AC8 | thẻ 1 Shopify, play/pause stub | bấm poster | nút toggle hiện, tên "Pause video: {title}"; axe 0 serious khi video chạy | E2E/a11y | P2 |
| TC-40 | AC-H21 | `/` 1920, đã áp fixture | render | 6 thẻ 264 × 554; 0 stat, 0 link, 0 subheading; 0 video/iframe; poster hiện | UI | P1 |
| TC-41 | AC-H23 | `/` đã áp fixture, metafield < 24 h | render | ô ngày ẩn. Skip có lý do khi dữ liệu không < 24 h (case đếm/F5 đã có ở TC-08, TC-09 bằng page.clock) | E2E | P2 |
| TC-42 | AC2 (R12) | desktop, focus list media | Tab liên tục | qua thumbnail (≥ 2 media), radio bộ chọn, Add to cart rồi View detail | a11y | P1 |
| TC-43 | AC3 (R12) | desktop, focus list video | Tab; Enter trên poster YouTube | Tab tới đủ poster mọi thẻ; Enter → iframe nhận focus | a11y | P1 |
| TC-44 | AC3 (R12) | 1280, list có tabindex | focus list, ArrowRight × 5 | `scrollLeft` tăng | a11y | P2 |
| TC-45 | AC1 | JS tắt | render STATES | `sale-countdown` ẩn, cao 0; 0 khung countdown nhìn thấy | nojs | P1 |
| TC-46 | AC2 | JS tắt, ≥ 2 media | bấm thumbnail 2 | URL có hash `#FeaturedMedia-…`, phần tử đích có | nojs | P2 |
| TC-47 | AC2 | JS tắt | bấm Add to cart (`clickAndLoad`: Cloudflare thử thách thì skip có lý do, ES1-T300) | form chứa nút mua method POST, action /cart/add; 0 `select[name=id]`; tới /cart; giỏ có variant hiện tại | nojs | P1 |
| TC-48 | AC3, AC4 | JS tắt | render, bấm link sản phẩm thẻ 6 | poster YouTube → youtube.com/watch, Vimeo → vimeo.com/{id}, Shopify → product url; 0 video/iframe; link sản phẩm điều hướng | nojs | P1 |
| TC-49 | AC2, AC3 | JS bật, chặn lần lượt featured-product / video-carousel / product-form / product-variant-picker / sale-countdown .js | tải STATES rồi TE13 (2 lần mở trang) | form chứa nút mua method POST; poster vẫn href; chặn video-carousel thì bấm poster đi theo link; chặn sale-countdown: ghi trạng thái khung band A ngay ở STATES (ES1-T608); 0 pageerror | E2E | P2 |
| TC-50 | AC2 | chặn product-form.js | bấm Add to cart (`clickAndLoad`) | form POST tới /cart, giỏ có variant; Cloudflare thử thách POST thì skip có lý do (ES1-T300) | E2E | P1 |
| TC-51 | AC2, AC3 | /?view=te13, embed bị chặn | tải; cuộn tới carousel | axe 0 serious/critical cả 2 lúc; 0 console error (bỏ qua script nền tảng Shopify) | a11y | P1 |

## Case biên (ngoài AC)
- Rỗng: bộ video không thẻ nào có nguồn → không render (TC-27); band không ngày (TC-03); không metafield (TC-19).
- Tối đa: 8 thẻ video (TC-27), 8 media gallery (TC-14), ngày còn 3 ngày (TC-08) — ô ngày 3 chữ số chưa có dữ liệu (≥ 100 ngày), không kiểm.
- Mất mạng: /cart/add.js abort → submit form thường (TC-25), tệp video abort (TC-32), module JS abort (TC-49, TC-50).
- 360px: TC-34, TC-37 (project desktop đặt viewport 360); Pixel 7 (412) chạy toàn bộ case chức năng.
- Bàn phím: TC-42–TC-44. Screen reader: tên timer, aria-hidden ô (TC-11), " of {product}" (TC-20), "Pause video: {title}" (TC-39), "Video unavailable…" (TC-32).
- Editor (`design_mode`) vs storefront: thông báo AC7 chỉ editor — kiểm tay (dưới); storefront không in (TC-04).
- Merchant chưa chọn sản phẩm: trang chủ chưa cấu hình không có khối (đã có ở ES1-T156 "trang chủ chưa cấu hình", ES1-T157), không lặp.
- Kiểm tay (không tự động được trên preview): AC7 thông báo editor sai định dạng và "metafield thắng"; info setting `countdown_end`. AC8 skeleton 9:16 khi đang tải (thời điểm ngắn, chưa có hook).

## AC5 Lighthouse (`npx lhci autorun`, chưa chạy)
| Trang | Perf desktop (≥ 96) | Perf mobile (≥ 90) | A11y (≥ 98) | Ghi chú |
| --- | --- | --- | --- | --- |
| `/` | — | — | — | trang chủ chưa áp fixture không có 2 block |
| `/?view=te13` | — | — | — | lhci không cuộn: JS nạp động (featured-product, video-carousel, sale-countdown, product-form, picker) chưa tính |
JS sau cuộn hết trang `/?view=te13`: lấy từ annotation `js-bytes` của TC-33 khi CI chạy.

## Giờ store
Offset dùng để tính `data-end` từ setting `countdown_end` (YYYY-MM-DD HH:MM giờ store): snippet nối `'now' | date: '%z'`. TC-01 ghi offset thật vào annotation `store-offset`. Chưa chạy: chưa có số.

## Dữ liệu test (hoa-qua-nhap-khau (efitco-ai-dev))
- `variant-co-ảnh-rieng` (TE4_VARIANTS_HANDLE): band A /?view=te13, band B; ảnh riêng từng biến thể, 1 biến thể hết hàng.
- `te13-featured` (gỡ khỏi Online Store 11/11, `TE13_METAFIELDS_READY` chưa bật) → STATES band A rơi về `sale-gia-nhỏ`; TC-12, TC-18 skip có lý do.
- `hết-hang-toan-bộ` (band C), `sản-phẩm-chỉ-1-variant` (band D), `sản-phẩm-co-mau-sale-va-mau-khong-sale` (band E).
- `media-dủ-loại` (TE13_VIDEO_READY = true): thẻ video 1. Không có video Shopify thì spec thay thẻ 1 bằng video giả (tệp `fake.mp4` route).
- YouTube `aqz-KE-bpKQ`, Vimeo `1084537` (thẻ 2–8); request embed được fulfill giả/abort, không gọi ra ngoài.
- Fixture trang chủ ES1-T331 (`tests/fixtures/home-figma.json`): TC-26, TC-40, TC-41 skip khi chưa áp.

## Phân loại lỗi CI 45265403257 (sửa spec 24/11)
| TC | Nguyên nhân | Loại | Sửa |
| --- | --- | --- | --- |
| TC-08 | lần tải thứ 2 (page.reload dưới page.clock) nhận màn thử thách Cloudflare 4/4 lần (error-context: "Your connection needs to be verified"), reload không qua guard nên báo thiếu countdown | môi trường + spec | đồng hồ thật, tải lại bằng `gotoStore` (bị chặn thì báo Cloudflare); assert giữ nguyên |
| TC-17 | `const id` trùng tên biến vòng lặp → ReferenceError | lỗi code spec | đổi tên `bandId`, `variantId` |
| TC-25 | spec viết theo hành vi sai: product-form lỗi mạng rơi về submit form thường (ES1-T67 AC8), POST /cart/add thật bị Cloudflare thử thách → mất nút | spec sai hợp đồng | assert POST form thường đúng biến thể, fulfill giả POST /cart/add |
| TC-32 | lần mở `/?view=te13` thứ 2 trong test bị Cloudflare chặn (cf-mitigated) cả 4 lần | môi trường | mở trang 1 lần; init script tự bỏ qua thẻ Shopify thật |
| TC-33 | regex `/assets/…js` đếm cả script Shopify (load_feature, origin_trials, shop_events_listener, partial_rendering, webmcp): 52 718 / 55 311 B; JS theme tĩnh ước ≈ 28,7 KB (`/`) | spec đo sai định nghĩa ADR 0006 | chỉ `/t/<id>/assets/`, max(decoded, transfer, `wc -c`), networkidle như ES1-T316; trần giữ 40 960 / 65 536 |
| TC-38 | đo hộp chữ link (26 px); vùng bấm là `::after` inset 0 phủ hàng sản phẩm 84 px | spec đo sai đối tượng | đo khối chứa `::after` + hit-test |
| TC-47, TC-49 | `filter({ has: scope.getByTestId(…) })`: locator con bắt đầu từ `container-…` nên không khớp bên trong form | lỗi code spec | `form:has([data-testid=featured-product-add])` |
| TC-50 | POST /cart/add thật bị Cloudflare thử thách, `waitForURL` treo 30 s thay vì báo chặn | môi trường + spec | `clickAndLoad` → skipIfStoreBlocked nhận lỗi Cloudflare |
Không có bug theme thật, không vượt ngân sách JS thật trong lượt này: không tạo ticket bug.

## KHÔNG CHẮC
- Xem dòng đầu file. Câu hỏi mở: ES1-T608 (AC-H22 trên `/`, countdown khi module lỗi), ES1-T600 (countdown 1 band khi đổi biến thể, TC-13 fixme).
- Nhãn "Add To Cart"/"View Detail" trong locale lệch SRS 0.5 (sentence case): đã có ES1-T578 cho FE, không tạo bug trùng; TC-21 skip tới khi locale đổi.
- Đo kích thước (TC-34–TC-38, TC-40) theo số trong SRS AC6, AC8, AC-H21, lệch ≤ 2 px; chưa đối chiếu render thật.
