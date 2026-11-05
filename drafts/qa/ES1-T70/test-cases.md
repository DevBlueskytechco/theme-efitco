KHÔNG CHẮC: (1) Spec CHƯA chạy trên store: sandbox của phiên này không mở được Chromium (SIGTRAP) và host store bị từ chối, nên DoD "pass desktop + Pixel 7", axe, 0 console error chờ CI. Mới kiểm: `playwright test --list` parse được 90 test × 2 project; chưa type-check (không có typescript, npm registry bị từ chối). (2) Ticket ghi `tests/e2e/TE-4.spec.ts`, Orchestrator yêu cầu đặt theo key nên file là `tests/e2e/ES1-T70.spec.ts`; đổi tên không cần sửa nội dung. Đã hỏi ở ES1-T90. (3) Dữ liệu trên store dev chưa xem được, nên chưa biết bao nhiêu test có điều kiện sẽ skip.

# ES1-T70 — TE-4 Trang sản phẩm (QA1)
Nguồn: docs/srs.md#TE-4 (AC1–AC12, NFR-2, NFR-4), ticket ES1-T70, drafts/techlead/ES1-T59/task-split.md D1–D11, ES1-T75 (CTO: tên event, không có action show variant), ES1-T60, ES1-T79. Figma: không có frame trang sản phẩm (docs/figma-inventory.md).
Spec: tests/e2e/ES1-T70.spec.ts, project `desktop` và `mobile` (Pixel 7). Tên test bắt đầu mã AC rồi tới ID: `-g "AC2 "`, `-g "TC-205"`, `-g nojs`.
Áp cho mọi test E2E: fixture `consoleGuard` fail test nếu có console error hoặc pageerror (mục Quy ước). Không lặp lại ở từng dòng.
Trạng thái: chạy = không phụ thuộc dữ liệu ngoài handle đã có trong store-data.json; có điều kiện = skip có lý do khi store thiếu dữ liệu đúng dạng; tay = không có trong spec.

| ID | AC | Given | When | Then | Loại | Ưu tiên | Trạng thái |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC-101 | AC1 | TE4_MEDIA_HANDLE | Mở trang | Có đúng 3 container main, related, complementary; root `product-media` là `product-media-gallery`, nằm trong main | E2E | P2 | chạy |
| TC-102 | AC1 | Sản phẩm đủ ảnh, video, external, 3D | Mở, chờ load | Số `product-media-item` bằng số media của .js; đủ 4 data-media-type; id `ProductMedia-{id}`; video preload none, có controls, poster; có `model-viewer`; iframe chỉ trong template; 0 request YouTube/Vimeo | E2E | P1 | có điều kiện (đủ 4 loại) |
| TC-103 | AC1 | Như TC-101 | Đọc ảnh trong gallery | Ảnh media đầu eager + fetchpriority high, đúng 1 ảnh high, còn lại lazy | perf | P2 | chạy |
| TC-104 | AC1 | Như TC-101, gallery đã define | Bấm zoom link, Esc, Enter, bấm nút đóng | Dialog mở, URL không đổi, ảnh src bằng href width=2048; axe dialog 0 serious; đóng thì focus về link; nút đóng có tên truy cập | E2E | P1 | chạy |
| TC-105 | AC1 | Từ 2 media | Bấm thumbnail cuối | Media vào khung ≥ 50%; đúng 1 thumbnail `aria-current="true"`; URL không có hash | E2E | P2 | có điều kiện (từ 2 media) |
| TC-106 | AC1 | Có video Shopify | Chuyển video vào khung rồi cuộn ra | `pause()` được gọi (giả lập đang phát vì Chromium không có H.264) | E2E | P3 | có điều kiện |
| TC-107 | AC1 | Có external video | Bấm poster | Trước bấm 0 request ngoài; sau bấm có iframe từ template, có title, focus vào iframe, URL không đổi | E2E | P2 | có điều kiện |
| TC-108 | AC1 | Có model 3D | Chuyển model vào khung | `model-viewer` define, `Shopify.ModelViewerUI` là function; request model-viewer chỉ từ Shopify CDN (NFR-6) | E2E | P2 | có điều kiện |
| TC-109 | AC1 | Variant có featured_media khác media đầu | Mở `?variant=` | Media đó đứng đầu danh sách, không trùng, tổng số media không đổi | E2E | P1 | có điều kiện |
| TC-110 | AC1 | Như TC-109, mở không tham số | Chọn option của variant đó | Media vào khung gallery; thumbnail của media có aria-current; focus không nhảy vào gallery | E2E | P1 | có điều kiện |
| TC-111 | AC1 | Biên rỗng: TE4_NO_MEDIA_HANDLE | Mở trang | 1 placeholder có svg; không thumbnail; không dialog | E2E | P2 | chạy |
| TC-151 | AC1 | nojs, TE4_MEDIA_HANDLE | Bấm thumbnail cuối | Href `#ProductMedia-{id}`, URL có hash, media vào khung; không `aria-current` tĩnh; tên "Load media 2 of N"; zoom link tới ảnh 2048 | E2E | P1 | chạy |
| TC-201 | AC2 | TE4_OPTIONS_HANDLE, không tham số | Mở trang | Hidden id, radio checked, data-state theo first available của .js; picker nằm ngoài form | E2E | P1 | chạy |
| TC-202 | AC2 | Có picker, từ 2 variant | Chọn 1 variant còn hàng, 1 variant hết hàng | Hidden id, `?variant=`, giá, compare, unit, data-state, nút chính, nút sticky khớp .js; không reload; data-available radio theo lựa chọn hiện tại | E2E | P1 | có điều kiện (variant hết hàng tuỳ dữ liệu) |
| TC-203 | AC2 | TE4_SWATCH_SALE_HANDLE có variant sale và không sale | Chọn lần lượt 2 variant | `price-compare` hiện đúng giá khi sale, biến mất khi không sale | E2E | P1 | có điều kiện |
| TC-204 | AC2 | TE4_UNIT_PRICE_HANDLE | Mở, đổi variant nếu có | `price-unit` có dấu "/" và giá bằng unit_price của .js; đổi variant vẫn khớp | E2E | P2 | có điều kiện |
| TC-205 | AC2 | 2 option, có tổ hợp không tồn tại | Chọn tổ hợp đó | Nút chính và sticky disabled; nhãn Unavailable; data-state unavailable; `product-form-status` báo; 0 request partial sau cú chọn cuối | E2E | P1 | có điều kiện |
| TC-206 | AC2 | Có variant hết hàng hoặc từ 2 variant | Mở `?variant=` | Radio, hidden id khớp; hết hàng thì nút disabled, data-state sold_out | E2E | P1 | chạy |
| TC-207 | AC2 | Biên: `?variant=1` không tồn tại | Mở trang | Hidden id về first available | E2E | P3 | chạy |
| TC-208 | AC2 | Biên: TE4_SOLD_OUT_HANDLE | Mở trang | Nút chính, sticky disabled nhãn Sold out; tồn "Sold out" (SRS mục 3) | E2E | P1 | chạy |
| TC-209 | AC2 | Mất mạng: route.abort request partial | Đổi sang variant khác | Nút, tồn, sticky bằng trạng thái đã render; aria-busy gỡ | E2E | P1 | chạy |
| TC-210 | AC2 | Như TC-209, 2 option có tổ hợp thiếu | Đi qua tổ hợp thiếu rồi tới variant hợp lệ | Không kẹt Unavailable; hidden id theo variant chọn (ES1-T87) | E2E | P1 | có điều kiện |
| TC-211 | AC2 | Request partial bị trễ 1,5 s | Đổi variant rồi chọn ngay tổ hợp thiếu | Response cũ không đè: vẫn Unavailable, nút disabled (ES1-T87) | E2E | P2 | có điều kiện |
| TC-212 | AC2 | Keyboard: focus radio option đầu | Nhấn ArrowRight | Radio mới checked, focus giữ trên radio sau partial; label có outline; không reload | a11y | P1 | có điều kiện (từ 2 giá trị) |
| TC-213 | AC2 | Screen reader | Đổi variant | `product-form-status` role status, aria-live polite, text In stock hoặc Sold out; `product-form-error` role alert rỗng | a11y | P2 | chạy |
| TC-214 | AC2 | Có picker | Chạy axe trên `container-product-main` trước và sau đổi variant | 0 serious/critical cả 2 lần | a11y | P1 | chạy |
| TC-215 | AC2 | Biên: TE4_SALE_SMALL_PRICE_HANDLE | Mở trang | Giá và giá gạch khớp .js tới cent | E2E | P2 | có điều kiện (đang sale) |
| TC-251 | AC2 | nojs, từ 2 variant còn hàng | Chọn variant thứ 2 trong select, bấm Add to cart | Picker ẩn, select hiện, option hết hàng disabled; tới /cart; /cart.js đúng variant đó | E2E | P1 | có điều kiện |
| TC-252 | AC2 | nojs, từ 2 variant còn hàng | Mở `?variant=` | Hidden id và select đều là variant đó | E2E | P2 | có điều kiện |
| TC-253 | AC2 | nojs, hết hàng toàn bộ | Mở trang | Nút disabled, nhãn Sold out | E2E | P1 | chạy |
| TC-301 | AC3 | TE4_VARIANTS_HANDLE | Mở trang | `product-title` là h1 duy nhất, đủ title; vendor khớp .js; có giá; mô tả hiện khi có, không có thì không render | E2E | P1 | chạy |
| TC-302 | AC3 | TE4_OPTIONS_HANDLE | Mở trang | Số fieldset bằng số option; legend là tên option; mỗi radio đúng value và có tên truy cập | E2E | P1 | chạy |
| TC-303 | AC3 | Như TC-301 | Đọc ghi chú | `product-note-tax` là 1 trong 4 chuỗi locale | E2E | P2 | chạy |
| TC-304 | AC3 | Variant mặc định còn hàng | Nhập quantity 3, Add to cart (mock add.js) | Input number min 1 value 1 tên Quantity; request gửi quantity 3 | E2E | P1 | có điều kiện (còn hàng) |
| TC-305 | AC3 | Biên: quantity 0 | Bấm Add to cart | Validation chặn, 0 request, không rời trang | E2E | P2 | có điều kiện (còn hàng) |
| TC-306 | AC3 | Mobile 360px, TE4_OPTIONS_HANDLE | Mở trang | Không tràn ngang; option, nút, quantity từ 24 × 24 | a11y | P1 | chạy |
| TC-312 | AC3 | Editor: tắt `show_vendor` | Xem preview | Không có `product-vendor` | UI | P3 | tay |
| TC-401 | AC4 | Setting mặc định | Mở trang | `product-payment-button` có nội dung, nằm trong form, khung nền trong suốt (theme không đè màu) | E2E | P1 | chạy |
| TC-402 | AC4 | Như TC-401 | Đọc `product-installments` | Partial có mặt; thiếu `shopify-payment-terms` thì ghi annotation `data`, kiểm tiếp ở TC-403 | E2E | P2 | chạy |
| TC-403 | AC4 | Store bật Shop Pay Installments | Xem trang, đổi variant | Banner hiện và cập nhật theo giá | UI | P2 | tay |
| TC-404 | AC4 | Có picker | Đổi variant | Installments và payment button vẫn còn sau partial | E2E | P1 | chạy |
| TC-405 | AC4 | TE4_SELLING_PLAN_HANDLE | Mở trang | Đúng 1 radio checked; có One-time trừ khi requires_selling_plan; mỗi lựa chọn có giá | E2E | P1 | có điều kiện |
| TC-406 | AC4 | Có selling plan và picker | Chọn plan | URL có `selling_plan`; vẫn chọn plan đó sau partial | E2E | P1 | có điều kiện |
| TC-407 | AC4 | Có plan và One-time, mock add.js 422 | Gửi với One-time, rồi gửi với plan | Lần 1 không có `selling_plan`; lần 2 có đúng id plan | E2E | P1 | có điều kiện |
| TC-408 | AC4 | TE4_PICKUP_HANDLE | Mở trang, mở details nếu có | `product-pickup` chứa "Pickup"; details dùng được không cần JS theme | E2E | P2 | chạy |
| TC-409 | AC4 | Mất mạng partial, sản phẩm pickup từ 2 variant | Đổi variant | Installments, pickup, payment button không mất | E2E | P2 | có điều kiện |
| TC-410 | AC4 | Editor: tắt `show_dynamic_checkout` | Xem preview | Không có `product-payment-button` | UI | P3 | tay |
| TC-501 | AC5 | Mobile, còn hàng | Cuộn qua nút chính, cuộn về | Sticky hiện tên, giá, nút enabled, html có `data-sticky-bar-visible`; cuộn về thì ẩn và gỡ attribute | E2E | P1 | có điều kiện (đủ dài) |
| TC-502 | AC5 | Như TC-501, mock add.js | Bấm nút sticky | 1 request đúng variant, quantity ≥ 1; tới /cart | E2E | P1 | có điều kiện |
| TC-503 | AC5 | Mobile, có picker | Đổi variant | Giá sticky bằng giá variant; nhãn nút theo tồn | E2E | P2 | chạy |
| TC-504 | AC5 | Biên 360px | Cuộn qua nút chính | Sticky fixed, nằm trong 360, trang không tràn ngang | E2E | P2 | có điều kiện |
| TC-505 | AC5 | 1280px | Cuộn hết trang | Sticky không hiện, html không có attribute | E2E | P2 | chạy |
| TC-551 | AC5 | nojs | Cuộn trang | Sticky không hiện | E2E | P2 | chạy |
| TC-601 | AC6 | TE4_GIFT_CARD_HANDLE | Mở, tick checkbox | 4 field ẩn tới khi tick; đúng type, name; message maxlength 200; send_on min tới max đúng 90 ngày; mỗi field có nhãn | E2E | P1 | chạy |
| TC-602 | AC6 | Như TC-601, mock add.js | Tick, nhập đủ, thêm giỏ | Gửi cờ `on`, email, name, message, send_on, `__shopify_offset` đúng múi giờ | E2E | P1 | có điều kiện (còn hàng) |
| TC-603 | AC6 | Như TC-602 | Tick, nhập, bỏ tick, thêm giỏ | Field disabled; không gửi recipient, offset, cờ; vẫn gửi id | E2E | P1 | có điều kiện (còn hàng) |
| TC-604 | AC6 | Biên tối đa | Gõ 205 ký tự vào message | Giá trị còn 200 ký tự | E2E | P3 | chạy |
| TC-605 | AC6 | Form gift card mở | Chạy axe trên `product-form` | 0 serious/critical | a11y | P2 | chạy |
| TC-651 | AC6 | nojs | Tick, nhập đủ, Add to cart | Tới /cart; /cart.js có Recipient email, Recipient name, Message, Send on | E2E | P1 | có điều kiện (còn hàng) |
| TC-701 | AC7 | Trang sản phẩm | Đọc 2 template | Mỗi template 1 card, title là link, price, badge Sold out hidden, ảnh lazy có width/height, 0 radio | E2E | P2 | chạy |
| TC-702 | AC7 | API related có kết quả | Cuộn tới khối related | Request đúng product_id, limit; root hiện, có heading; số card đúng; title, link, ảnh, badge khớp JSON; axe 0 serious; giá card bằng giá trang đích | E2E | P1 | có điều kiện (API có kết quả) |
| TC-703 | AC7 | Complementary thật | Cuộn tới khối | Có kết quả thì hiện card; 0 kết quả thì hidden, list rỗng, ghi annotation `data` | E2E | P2 | chạy |
| TC-704 | AC7 | Mất mạng: route.abort | Cuộn tới 2 khối | Cả 2 giữ hidden, list rỗng | E2E | P1 | chạy |
| TC-705 | AC7 | Biên rỗng: API trả 0 sản phẩm | Cuộn tới 2 khối | Như TC-704 | E2E | P1 | chạy |
| TC-706 | AC7 | API trả HTTP 500 | Cuộn tới 2 khối | Như TC-704 | E2E | P2 | chạy |
| TC-707 | AC7 | API trả JSON hỏng | Cuộn tới 2 khối | Như TC-704 | E2E | P2 | chạy |
| TC-708 | AC7 | Mock 1 sản phẩm hết hàng, có giá gạch | Cuộn tới related | Class price--on-sale; giá bằng giá Liquid; giá gạch cùng định dạng; badge Sold out hiện; ảnh đúng width, height, lazy | E2E | P1 | chạy |
| TC-709 | AC7 | Trang vừa tải | So thời điểm | Request recommendations không bắt đầu trước LCP | perf | P2 | chạy |
| TC-710 | AC7 | Editor: merchant chưa cấu hình, chưa có kết quả | Xem preview | `product-recommendations-placeholder` hiện hướng dẫn, không fetch | UI | P3 | tay |
| TC-751 | AC7 | nojs | Mở trang | 2 root hidden; data-intent, data-url theo routes, data-product-id, data-money-format đúng; list rỗng; không placeholder | E2E | P2 | chạy |
| TC-801 | AC8 | Chưa có cart-drawer, còn hàng | Add to cart thật | POST 200; chuyển /cart; `theme:cart:updated` có variant_id; /cart.js có variant | E2E | P1 | có điều kiện (không drawer) |
| TC-802 | AC8 | Như TC-801 | Add to cart thật | `shopify:cart:lines-update` action add, context product, target product-form, GID đúng, bắn trước POST; promise resolve cart chứa variant, userErrors và warnings rỗng | E2E | P1 | có điều kiện (còn hàng) |
| TC-803 | AC8 | Mock 422 có trễ | Bấm Add to cart hai lần | Khi gửi nút disabled, aria-busy; sau đó description trong `product-form-error`, nút mở lại, không rời trang; lần 2 thay lỗi cũ | E2E | P1 | có điều kiện (còn hàng) |
| TC-804 | AC8 | Mất mạng: route.abort add.js | Bấm Add to cart | Rơi về form thường, tới /cart, /cart.js có variant | E2E | P1 | có điều kiện (còn hàng) |
| TC-805 | AC8 | add.js trả 500 không JSON | Bấm Add to cart | Rơi về form thường, tới /cart | E2E | P2 | có điều kiện (còn hàng) |
| TC-806 | AC8 | Keyboard, mock add.js | Focus nút, Enter | Đúng 1 request; tới /cart | a11y | P1 | có điều kiện (còn hàng) |
| TC-807 | AC8 | Mock 422 | Bấm Add to cart | Promise event resolve userErrors bằng description, không reject | E2E | P2 | có điều kiện (còn hàng) |
| TC-851 | AC8 | nojs, còn hàng | Bấm Add to cart | POST form thường, tới /cart, /cart.js đúng giá trị select | E2E | P1 | có điều kiện (còn hàng) |
| TC-901 | AC9 | Variant mặc định cần vận chuyển | Mở trang | `product-note-shipping` hiện | E2E | P2 | có điều kiện |
| TC-902 | AC9 | TE4_DIGITAL_HANDLE requires_shipping false | Mở trang | Có notes và form; không ghi chú vận chuyển; không pickup. Dữ liệu sai dạng thì test fail, không skip | E2E | P1 | chạy |
| TC-903 | AC9 | TE4_SINGLE_HANDLE 1 variant, mock add.js | Mở, thêm giỏ | Không picker, không option; hidden id đúng; request đúng id | E2E | P1 | có điều kiện (còn hàng) |
| TC-951 | AC9 | nojs, 1 variant | Mở trang | Không picker, không select, có hidden id | E2E | P1 | chạy |
| TC-1001 | AC10 | Market gồm thuế TE4_TAX_INCLUDED_COUNTRY | Mở `?country=` | Ghi chú đúng "Taxes included." hoặc "Taxes and duties included." | E2E | P1 | chạy |
| TC-1002 | AC10 | Có picker | Đổi variant | Ghi chú thuế không đổi sau partial | E2E | P2 | chạy |
| TC-1003 | AC10 | Market có duties, market không gồm thuế (cần tạo, ES1-T79: cả 5 market hiện đều gồm thuế) | Đổi market | Chuỗi tương ứng `duties_included`, `taxes_at_checkout` | UI | P2 | tay |
| TC-1101 | AC11 | TE4_OPTIONS_HANDLE | Đọc JSON-LD | Đúng 1 Product; name, url, brand; image tối đa 5 ảnh width=1200; offers đủ variant đúng thứ tự: price, priceCurrency bằng tiền market, availability, url có variant | E2E | P1 | chạy |
| TC-1102 | AC11 | Hết hàng toàn bộ | Đọc JSON-LD | Mọi offer OutOfStock | E2E | P2 | chạy |
| TC-1103 | AC11 | Biên: không media | Đọc JSON-LD | Parse được, có name, offers; image rỗng | E2E | P3 | chạy |
| TC-1104 | AC11 | URL preview | Chạy Rich Results Test | Không lỗi Product | UI | P3 | tay |
| TC-1151 | AC11 | nojs | Đọc JSON-LD | Có sẵn trong HTML server, parse được | E2E | P2 | chạy |
| TC-1201 | AC12 | Listener capture gắn trước khi tải | Mở trang | `shopify:product:view` context page đúng 1 lần, handle đúng | E2E | P1 | chạy |
| TC-1202 | AC12 | Trang sản phẩm | Đọc `view-event-payload` | JSON hợp lệ, chứa id hoặc handle sản phẩm | E2E | P2 | chạy |
| TC-1203 | AC12 | Có picker | Mở trang, đổi option | Không select lúc load; `shopify:product:select` có product GID, handle, selectedOptions, target product-form; promise resolve variant đúng GID, availableForSale, price | E2E | P1 | chạy |
| TC-1204 | AC12 | Tổ hợp không tồn tại | Chọn tổ hợp | Promise resolve variant null, không reject | E2E | P1 | có điều kiện |
| TC-1205 | AC12 | Có picker | Đổi option | `theme:variant:change` có variantId, featuredMediaId khớp .js | E2E | P2 | chạy |
| TC-1206 | AC12 | CTO ES1-T75: Shopify không có action show variant | Mở trang | `Shopify.actions.showVariant` undefined | E2E | P3 | chạy |

## Case biên (ngoài AC)
Đã nằm trong bảng trên theo AC liên quan, vì ac_coverage và lệnh `-g` đọc theo AC:
- Rỗng: TC-111, TC-705, TC-1103, TC-703.
- Tối đa: TC-604, TC-215 (giá nhỏ).
- Mất mạng: TC-209, TC-210, TC-211, TC-409, TC-704, TC-804, TC-805.
- Mobile 360px: TC-306, TC-504. Pixel 7: toàn bộ spec chạy project mobile.
- Keyboard: TC-104, TC-212, TC-806.
- Screen reader: TC-213, TC-302, TC-104 (tên nút đóng), TC-151 (tên thumbnail).
- Merchant chưa chọn resource, editor: TC-710, TC-312, TC-410 (tay). Block ngoài trang sản phẩm (`product == blank`): không kiểm được trên storefront, xem tay trong editor cùng TC-710.
- Không JS (NFR-4): TC-151, TC-251, TC-252, TC-253, TC-551, TC-651, TC-751, TC-851, TC-951, TC-1151.

## Quy ước
- Console: fixture bỏ qua script Shopify/analytics, YouTube, Vimeo, model-viewer và dòng "status of 429". "Failed to load resource" chỉ được bỏ qua ở test tự tạo lỗi mạng (`allowNetworkLog`). Còn lại đều làm test fail, kể cả 404 asset theme.
- AC8 chỉ kiểm chuyển /cart. Có `cart-drawer` và cart type drawer thì TC-502, TC-801, TC-806 skip; mở drawer thuộc TE-5.
- So tiền dùng .js fetch trong trang (ES1-T74). Tiền trang khác cart.js thì skip có lý do, có annotation `market`.
- Nhóm nojs chạy `javaScriptEnabled: false`, không gọi evaluate.

## Dữ liệu test (hoa-qua-nhap-khau (efitco-ai-dev))
Đọc qua `env()`: env không rỗng thắng tests/e2e/store-data.json. Thiếu cả hai thì test skip với lý do `Thiếu dữ liệu TE4_...`.

| Biến | Handle hiện tại | Dùng cho | Cần có |
| --- | --- | --- | --- |
| TE4_MEDIA_HANDLE | media-dủ-loại | AC1 | ảnh, video, external, 3D |
| TE4_VARIANTS_HANDLE | variant-co-ảnh-rieng | AC1, AC3, AC4, AC5, AC7, AC8, AC10, AC12 | variant có featured_media riêng, từ 2 variant còn hàng |
| TE4_OPTIONS_HANDLE | 2-option-co-tổ-hợp-khong-tồn | AC2, AC3, AC4, AC5, AC10, AC11, AC12 | 2 option, có tổ hợp thiếu, nên có variant hết hàng |
| TE4_NO_MEDIA_HANDLE | sản-phẩm-khong-co-media | AC1, AC11 | không media |
| TE4_SINGLE_HANDLE | sản-phẩm-chỉ-1-variant | AC9 | 1 variant, còn hàng |
| TE4_SOLD_OUT_HANDLE | hết-hang-toan-bộ | AC2, AC11 | mọi variant hết hàng |
| TE4_DIGITAL_HANDLE | sản-phẩm-số | AC9 | requires_shipping false |
| TE4_GIFT_CARD_HANDLE | gift-card-2 | AC6 | gift card còn hàng |
| TE4_SELLING_PLAN_HANDLE | amazing-aluminum-bag-collection10 | AC4 | có selling plan và One-time |
| TE4_UNIT_PRICE_HANDLE | unit-price | AC2 | variant mặc định có unit_price |
| TE4_SWATCH_SALE_HANDLE | sản-phẩm-co-mau-sale-va-mau-khong-sale | AC2 | variant sale và không sale còn hàng |
| TE4_SALE_SMALL_PRICE_HANDLE | sale-gia-nhỏ | AC2 | variant mặc định sale, giá nhỏ |
| TE4_PICKUP_HANDLE | apparel | AC4 | location bật pickup (CTO ES1-T79) |
| TE4_TAX_INCLUDED_COUNTRY | US | AC10 | market gồm thuế (CTO ES1-T79) |

AC đủ dữ liệu theo DoD: mọi AC1–AC12 có ít nhất 1 dòng trạng thái "chạy" hoặc "có điều kiện" với handle đã cấp; không AC nào chỉ có test tay.

## KHÔNG CHẮC
1. Kết quả chạy: chưa có. Lần chạy CI đầu là lần đầu tiên nhiều luồng được chạy thật, vì spec dev đọc thẳng `process.env`, không qua `env()`: ES1-T67 (gift card AC6: ci.yml không truyền TE4_GIFT_CARD_HANDLE nên luôn skip; sticky, AC8 phụ thuộc vars), ES1-T81, ES1-T85. `shopify:product:view` chưa có spec trong tests/e2e (ES1-T76 chỉ nằm ở drafts). Fail ở TC-5xx, TC-60x, TC-80x, TC-1201 có thể là lỗi theme thật hoặc lỗi spec, cần đọc log trước khi ghi bug.
2. Tên file spec và số phận spec dev: ticket question ES1-T90 (techlead). Hiện giữ ES1-T62..T69 vì ES1-T78 S-01 đọc các file đó; hệ quả CI chạy trùng, tăng nguy cơ 429.
3. AC12 SRS ghi "override action show variant". CTO đã chốt ở ES1-T75 là không có action này, TC-1206 kiểm theo chốt đó. SRS chưa sửa câu chữ.
4. AC4 Shop Pay Installments và AC10 nhánh duties, không gồm thuế không kiểm tự động được trên store hiện tại (TC-403, TC-1003 tay).
5. AC7: CTO ghi nhận ở ES1-T68 rủi ro định dạng tiền theo shop.money_format khi market khác tiền. TC-702, TC-708 so bằng giá Liquid nên sẽ fail nếu runner nhận market khác tiền, không phải lỗi spec.
