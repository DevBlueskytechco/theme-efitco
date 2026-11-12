KHÔNG CHẮC: chưa chạy được Playwright trên store dev trong lượt này (không có PREVIEW_URL/STORE_PASSWORD trong môi trường agent); kết quả chờ CI của PR ES1-T434. Selector banner consent (`#shopify-pc__banner`, `#shopify-pc__banner__btn-decline`, `.shopify-pc__banner__dialog`) lấy từ log CI #198 (`div.shopify-pc__banner__btns.shopify-pc__banner__btns-granular`) và tên lớp Shopify, chưa đo trực tiếp; helper có fallback theo tên nút Decline/Reject/Refuser.

# ES1-T434 — sửa spec e2e sau dữ liệu ES1-T298

Nguồn: ticket ES1-T434 (body + comment CTO 10:39, 11:06), CI #191, #180, #198. Dữ liệu store: drafts/devops/ES1-T298/demo-data-log.md (nhánh test/ES1-T298-demo-data). Không xoá dữ liệu store, không xoá market.

### ES1-T434

AC của ticket (DoD):
- AC1: test đỏ trên #191/#180/#198 xanh hoặc có lý do rõ; lỗi theme → ticket FE/BE.
- AC2: spec chọn sản phẩm/collection theo handle cố định trong store-data.json, không "sản phẩm đầu tiên"; store-data.json chỉ thêm khoá cần.
- AC3: banner consent Shopify xử lý một lần cho mọi spec, không xoá market (comment CTO 11:06).
- AC4: `npx playwright test --list` biên dịch; test-cases.md ghi nguyên nhân từng test.

## Thay đổi dùng chung

| File | Thay đổi |
|---|---|
| tests/e2e/support/consent.ts (mới) | `declineConsentBanner(page)`: chờ banner ≤ 15 s, bấm Decline, chờ ẩn; `autoDeclineConsent(page)`: `page.addLocatorHandler` cho spec tự mở context không dùng state.json |
| tests/setup/password.ts | gọi `declineConsentBanner` sau khi mở PREVIEW_URL, trước `clearCookies cart` và `storageState` → cookie `_tracking_consent` vào tests/setup/state.json; log `[state] banner consent: declined/absent/already` |
| tests/e2e/store-data.json | thêm 4 khoá: `TE4_MANY_VARIANTS_HANDLE=demo-many-variants`, `TE1_PRODUCT_HANDLE=figma-iron-core-kettlebell`, `TE1_COUNTRY_TARGET=CA`, `TE1_LANGUAGE_TARGET=fr`; khoá cũ giữ nguyên |

Phạm vi state.json: mọi spec dùng fixture `page` mặc định và các spec tự mở context với `storageState: 'tests/setup/state.json'` (ES1-T94, T95, T118, T121, T129, T137, T138, T147, T148, T183, T203, T235). ES1-T100, ES1-T163 mở context không state (kiểm không JS / request API) — không nằm trong danh sách đỏ, không đổi.

## Nguyên nhân và cách sửa từng test

| TC | AC | Spec | Given / When / Then | Nguyên nhân đỏ | Sửa | Kết quả mong đợi |
|---|---|---|---|---|---|---|
| TE-1 TC-28 đổi nước | AC1 | TE-1.spec.ts | Given store 18 nước, banner đã Decline; When mở nút gộp footer, chọn CA; Then POST /localization, CA `aria-current=true`, path giữ /collections/all | (1) banner consent `.shopify-pc__banner__btns` che nút gộp → click chờ 30 s (log #198); (2) `chooseOther` lấy nước đầu tiên chưa chọn, đổi theo dữ liệu | consent ở global setup; đích cố định `TE1_COUNTRY_TARGET`; `coveredBy` báo tên lớp che thay vì timeout; chờ POST /localization | xanh |
| TE-1 TC-29 đổi ngôn ngữ | AC1 | TE-1.spec.ts | Given locale en + fr; When chọn fr; Then `html[lang=fr]`, path `/fr/collections/all`, fr `aria-current` | như TC-28 (banner che); fr mới publish 12/11 | consent; đích `TE1_LANGUAGE_TARGET`; path `/password` báo lỗi môi trường (cookie mật khẩu) | xanh |
| TE-1 TC-31 nojs localization | AC1 | TE-1.spec.ts | Given không JS; When submit nước CA; Then CA `aria-current` | dùng chung `chooseOther` cũ | dùng `targetValue` + `choose` như TC-28; banner không hiện khi tắt JS | xanh |
| TE-1 TC-45 nút gộp mở 2 danh sách | AC1 | TE-1.spec.ts | Given 18 nước + 2 ngôn ngữ; When bấm nút gộp; Then danh sách nước và ngôn ngữ cùng hiện | banner che nút gộp (log #198 nêu đúng lớp) | consent; `openLocalization` kiểm phần tử che + `details[open]`; bắt buộc cả 2 danh sách có mặt (docs/srs.md#TE-1 AC 10: chỉ ẩn danh sách 1 mục) | xanh |
| TE-1 TC-18 cart link + số lượng (mobile) | AC2 | TE-1.spec.ts | Given sản phẩm `TE1_PRODUCT_HANDLE`; When /cart/add; Then số giỏ header = 1 | sản phẩm đầu /products.json là demo-subscription-only (bắt buộc selling plan) → /cart/add 422 | handle cố định; kiểm `requires_selling_plan=false`, còn hàng; fallback tự dò bỏ `demo-*`, > 100 biến thể | xanh |
| TE-1 TC-24 font heading | AC1 | TE-1.spec.ts | Given theme preview; When mở /; Then `--font-heading--family` và heading trong main là Sofia Sans Condensed | #191 nhận Inter. #198 XANH (CTO 11:06) sau khi ghi theme id + biến font: lần đỏ do trang không chạy theme preview/selector h1 ngoài main — môi trường, không phải theme | giữ assertion, thêm kiểm theme id = preview_theme_id, chọn heading hiện trong main | xanh |
| ES1-T45 R-04 (1280) | AC3 | ES1-T45.spec.ts | Given 1280, banner đã Decline; When bấm summary `.site-footer__disclosure`; Then panel bám inline-end, RTL bám inline-start | banner consent che summary footer (cùng nhóm #180) | không đổi spec; hết banner nhờ state.json | xanh |
| ES1-T45 R-05 (<48rem) | AC3 | ES1-T45.spec.ts | Given mobile; When bấm summary footer; Then panel bám inline-start, đổi phía khi RTL | như R-04; banner đáy mobile cao hơn | không đổi spec | xanh |
| TE-4 TC-503 sticky giá | AC3 | TE-4.spec.ts | Given PDP `TE4_OPTIONS_HANDLE` mobile; When chọn biến thể khác; Then hidden id, giá chính, giá sticky = giá .js | click timeout (#198) — picker nằm dưới banner consent đáy trên Pixel 7; dữ liệu TE4_OPTIONS_HANDLE không đổi | consent; tách 3 bước (id → giá chính → giá sticky) để log chỉ đúng lớp nếu còn đỏ | xanh; còn đỏ ở bước 3 → bug BE product-sticky-bar |
| TE-3 TC-10/TC-11 swatch radio | AC2 | TE-3.spec.ts | Given card có ≥ 2 swatch; When tự dò; Then bỏ qua `TE4_MANY_VARIANTS_HANDLE` | card swatch đầu /collections/all là demo-many-variants (mới nhất); card lấy option Weight làm swatch | `withoutMany` loại sản phẩm này khỏi tự dò; ưu tiên `TE3_SWATCH_HANDLE` | xanh. Ghi chú: nhóm TC radio lỗi thời theo SRS 0.4 (swatch card là chỉ báo `aria-hidden`), viết lại ngoài phạm vi ticket này |
| TE-3 TC-10c swatch chỉ từ option màu | AC1 | TE-3.spec.ts | Given demo-many-variants (Weight × Pack × Color, metafield `custom.swatch_colors`); When mở /collections/all?sort_by=created-descending; Then mọi swatch card thuộc giá trị option Color | LỖI THEME: product-card.liquid:131-141 chọn option đầu có > 1 giá trị khi có `custom.swatch_colors` → swatch = Weight | ĐỎ CÓ CHỦ ĐÍCH; bug drafts/qa/ES1-T434/bugs/ES1-T434-B01.md; sửa nằm trong ES1-T404 (TS-FE6, PR #187: bỏ nhánh `custom.swatch_colors`) — không tạo ticket trùng | xanh sau khi ES1-T404 merge |
| ES1-T190 vùng bấm swatch (2 test mobile) | AC1 | ES1-T190.spec.ts | Given card figma-* hàng 5; Then hình swatch 32 × 16 | (1) docs/srs.md#TE-3 AC 6 bản 0.3: swatch card là chỉ báo, không còn yêu cầu vùng bấm; (2) đo nhầm card demo-* mới | 3 test vùng bấm `test.skip` (giữ thân để đối chiếu); chỉ đo card figma-*, card khác ghi annotation | xanh / skip có lý do |
| ES1-T137 AC4 quiz bấm chữ của hàng | AC3 | ES1-T137.spec.ts | Given quiz mobile; When bấm chữ của hàng; Then chọn đáp án | nghi banner consent đè hàng cuối (cùng run #180, cùng nhóm click) — spec dùng state.json | không đổi spec | xanh; còn đỏ thì ghi lại với log mới |
| ES1-T176 hàng 2 slide 2 so Figma | AC3 | ES1-T176.spec.ts | Given /?view=figma 1920; Then ảnh hàng 2 slide 2 trong ngưỡng | banner consent nằm trong vùng chụp (đáy viewport) hoặc flaky autoplay (ticket ghi "có thể flaky") | không đổi spec, không nới ngưỡng | xanh; còn đỏ sau khi hết banner → mở bug riêng kèm diff ảnh |

## Case biên

| TC | AC | Given / When / Then |
|---|---|---|
| B-01 | AC3 | Given store không hiện banner (khách ngoài vùng consent); When global setup chạy; Then log `absent`, không fail, chậm tối đa 15 s một lần |
| B-02 | AC3 | Given cookie `_tracking_consent` đã có; Then log `already`, không bấm |
| B-03 | AC3 | Given spec cần kiểm theme khi banner ĐANG hiện (layers.md §5: thanh đáy, teaser ẩn, `--consent-height`); Then mở context không storageState, không dùng helper — thuộc TE-10-R2-QA1 |
| B-04 | AC2 | Given `TE1_PRODUCT_HANDLE` hết hàng hoặc bắt buộc selling plan; Then fail với thông báo "dữ liệu store", không âm thầm đổi sản phẩm |
| B-05 | AC2 | Given nước `TE1_COUNTRY_TARGET` đang được chọn; Then `targetValue` chọn nước khác đầu tiên chưa chọn |
| B-06 | AC4 | `npx playwright test --list`: 2110 test / 64 file, biên dịch không lỗi |

## Đề xuất ticket

- Không tạo ticket FE mới cho banner: banner che nút footer/picker là hành vi đúng theo docs/ui-spec/layers.md §4–§5 ("banner thắng", theme không vượt z). Phần theme phải cư xử quanh banner (`html[data-consent]`, `--consent-height`, ẩn thanh đáy/teaser, `scroll-padding-block-end`) đã có trong kế hoạch: TE-10-R2-FE1, TE-10-R2-BE1, TE-10-R2-QA1 (drafts/techlead/ES1-T307/task-split.md:68,107,111). Hiện `grep -rn consent assets layout snippets blocks` = 0, chờ các task đó.
- TC-10c: theo ES1-T404 (comment đã ghi trên ticket).
