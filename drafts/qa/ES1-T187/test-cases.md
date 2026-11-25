KHÔNG CHẮC: spec chưa chạy trên store dev (phiên không có PREVIEW_URL, tests/setup/state.json); đã qua `npx playwright test --list` (44 test = 22 × desktop/mobile), chưa tsc (lệnh bị chặn trong phiên). Kết quả pass/skip chờ CI store-tests của PR. `ac_coverage.py` không đọc mã AC-H (0/0 trên `ac-scope.md`, như ES1-T176) → chạy trên `ticket-ac.md` (7 mục ticket ↔ AC-H8/H9/H10): 7/7 = 100%. Ticket ghi `tests/e2e/TE-15.spec.ts`, Orchestrator yêu cầu đặt theo key → `tests/e2e/ES1-T187.spec.ts`.

# ES1-T187 — TE-15 Block collection list và shop by level (QA1)
Nguồn: docs/srs.md#TE-15 (SRS 0.5: AC-H8, AC-H9, AC-H10; AC1, AC2 chỉ dùng phần AC-H9 trỏ tới và phần ticket yêu cầu đo), ticket ES1-T187 (plan ES1-T169 #28, CTO 11/11: viết theo SRS 0.5/ui-spec mới sau ES1-T336), mockup `drafts/designer/ES1-T293/index.html` `#container-home-collection-list`, `#container-home-intro`, `docs/ui-spec/index-1280.md` §2.2, §2.3, `index-mobile-a.md` §3, §4.
Spec: `tests/e2e/ES1-T187.spec.ts`. Gộp phần nghiệm thu của spec dev ES1-T184, T185, T186 (ticket: giảm request); spec dev giữ nguyên, không viết trùng chi tiết hiện thực (lazy-module, ResizeObserver, trần byte JS).

| ID | AC | Given | When | Then | Loại | Ưu tiên |
| --- | --- | --- | --- | --- | --- | --- |
| TC-01 | AC-H8 | `/?view=te15` band `te15-five` (5 card collection `all`), 1920 × 1080, desktop | render, đợi `data-enhanced`; bấm next rồi back | 5 card 336 × 270 ± 2; next cuộn đúng 1 card (bề card + gap) hoặc tới cuối nếu phần còn lại < 1 card; back về 0 | E2E | P1 |
| TC-02 | AC-H8 | `/?view=figma` 1920, store có 5 collection `figma-cat-*` | render; bấm card 1 | 5 card đúng tên và thứ tự Free Weights, Functional Training, Benches & Racks, Recovery & Mobility, Accessories; href `/collections/<handle>`; mỗi card 1 link, tên truy cập = tên collection, ảnh `alt=""`; `<ul aria-label="Product categories" tabindex="0">`; 336 × 270 ± 2; bấm card 1 tới `/collections/figma-cat-free-weights` | E2E/a11y | P1 |
| TC-03 | AC-H8 | `/` trên store dev đã áp fixture ES1-T331 (sentinel `level-card-count` "24 Products") | render 1920 | số card = số `collection-card` trong fixture; tên, href theo handle fixture; 336 × 270 ± 2 | E2E | P1 |
| TC-04 | AC-H9 | `/?view=te15` band `te15-empty`, `te15-level-empty` (handle không tồn tại = 0 collection) | render storefront | không band, không block, không placeholder (`collection-list-placeholder`, `collection-card-placeholder`, `shop-by-level-placeholder`, `level-card-placeholder` = 0) | E2E | P1 |
| TC-05 | AC-H9 | band `te15-one` (1 card), `te15-level-one`, 1024 | render, đợi `data-enhanced` | đúng 1 card mỗi block; hàng vừa khung: `data-static`, prev, next, tiến trình ẩn (lưới tĩnh theo AC1) | E2E | P1 |
| TC-06 | AC-H9 | band `te15-five`, 1024 (cả desktop và Pixel 7) | render; next; cuộn tới cuối; back | đầu hàng: back hiện + `aria-disabled="true"`, next `false`, tiến trình hiện; next cuộn 1 card, back bật; cuối hàng: next hiện + `aria-disabled="true"`; back cuộn lùi ≥ 1 card | E2E/a11y | P1 |
| TC-07 | AC-H9 | `/` theme chưa áp fixture (index.liquid không truyền handle, ADR 0011) | render 1920 | `container-home-collection-list` = 0, `collection-card` = 0, `shop-by-level` = 0, `level-card` = 0; đã áp fixture thì skip có lý do | E2E | P2 |
| TC-10 | AC-H10 | `/?view=te15` band `te15-level-three` (3 card collection `all`) | render; mở `/collections/all` đọc `collection-count` (server, `products_count`) | 3 card; badge cả 3 = dạng locale `blocks.level_card.products_count` với số thật (one/other); collection rỗng thì không badge | E2E | P1 |
| TC-11 | AC-H10 | band `te15-level-singular` (collection đầu tiên có đúng 1 sản phẩm) | render; mở collection | badge = dạng `one` ("1 Product"); trang collection đếm 1. Store không có collection 1 sản phẩm thì skip có lý do | E2E | P2 |
| TC-12 | AC-H10 | `/?view=figma` 1920, 3 collection `figma-level-*` | render; mở từng collection | tên Beginner, Intermediate, Advanced; href đúng handle; badge từng card = số thật theo locale; Beginner đếm 24 | E2E | P1 |
| TC-13 | AC-H10 | `/` store dev đã áp fixture | render 1920 | card 1 "Beginner", badge = dạng locale của 24 | E2E | P1 |
| TC-14 | AC-H10 | `/?view=te15` 1920, desktop (pointer hover) | không rê; rê card; focus card bằng Tab | hàng số opacity 0 khi không rê/focus; 1 khi rê; 1 khi `:focus-visible`; tên truy cập link chứa chữ badge | E2E/a11y | P2 |
| TC-15 | AC-H8 (bàn phím) | band `te15-five`, 1024 | focus back, Tab; Enter; Tab; ArrowRight, ArrowLeft; Tab | Tab tới next, vòng focus thấy được; Enter cuộn 1 card; Tab vào danh sách (`tabindex=0`), vòng focus thấy; ArrowRight cuộn tiếp, ArrowLeft lùi; Tab tới link card 1, vòng focus trên `::after` thấy được | a11y/E2E | P1 |
| TC-16 | AC-H10 (bàn phím) | band `te15-level-three` | Tab tới link card 1; Enter | link focus, vòng focus thấy; Enter mở đúng href collection | a11y/E2E | P2 |
| TC-17 | AC-H8, AC-H9 (nojs) | JS tắt, `/?view=te15`, 1280 (desktop) / 360 (Pixel 7) | render; focus danh sách, mũi tên phải (Home/End của Chromium cuộn dọc) | không `data-enhanced`; prev, next, tiến trình ẩn; `overflow-x: auto`; card cuối tràn; mũi tên phải cuộn danh sách (card cuối dịch trái); 5 card là link `/collections/all`; 3 level card là link, badge có sẵn trong HTML | E2E/nojs | P1 |
| TC-18 | AC-H8 (nojs) | JS tắt, `/?view=figma` 1280 | render | 5 link card đúng `/collections/figma-cat-*`; thiếu dữ liệu thì skip | E2E/nojs | P2 |
| TC-19 | AC-H9 (thiếu JS) | `scroll-buttons.js` bị chặn (`route.abort`), 1024 | render; focus danh sách, mũi tên phải | không `data-enhanced`; nút, tiến trình ẩn; danh sách vẫn cuộn; axe 0 serious; 0 console error của theme (trừ log mạng của file bị chặn) | E2E/a11y | P1 |
| TC-20 | AC-H9 (AC1 360), ticket "Đo 360" | Pixel 7, 360, `te15-five`, `te15-level-three` | render, đợi `data-enhanced` | card danh mục 252, ảnh 252 × 165, tên 22px; không nút; tiến trình hiện; vùng bấm card ≥ 44; level 320 × 240, 1 cột; hàng số ≥ 44 luôn hiện; trang không tràn ngang; axe 0 serious | UI/a11y | P1 |
| TC-21 | AC-H9 (AC1 768), ticket "Đo 768" | Pixel 7, 768 | render | card 307, ảnh 307 × 201; prev, next 52 × 52, đáy nút = đáy h2 ± 2; tiến trình hiện; level 232 × 232, 3 cột; không tràn | UI | P1 |
| TC-22 | AC-H9 (AC1 1280) | desktop 1280 × 800 | render | card 271, ảnh 271 × 177; card 4 thấy trọn, card 5 thấy ≥ 25%; nút 52 bên phải tiêu đề; level 397; không tràn | UI | P2 |
| TC-23 | AC-H10 (AC2 1920) | desktop 1920 | render | level 456 × 456, 3 cột, không tràn | UI | P2 |
| TC-24 | AC-H8, AC-H9, AC-H10 (chất lượng) | `/?view=te15` 1024 | render; next | axe 0 serious/critical trên 4 band te15 ở đầu hàng và giữa hàng; 0 console error (bỏ monorail, web-pixels, otlp-http, shop.app) | a11y | P1 |
| TC-30 | AC-H10 (tĩnh) | `blocks/level-card.liquid`, `locales/en.default.json` | đọc file | badge = `'blocks.level_card.products_count' \| t: count: card_collection.products_count`; không số 24 cứng; khoá có `one`, `other` khác nhau | Tĩnh | P2 |

## Ánh xạ mục ticket (ticket-ac.md, cho ac_coverage.py)
| ID | AC | Mục ticket |
| --- | --- | --- |
| TC-01 | AC1 | AC-H8 5 card 336 × 270, next/back 1 card |
| TC-02 | AC1 | AC-H8 đúng tên, tới đúng collection |
| TC-03 | AC1 | AC-H8 trên / đã áp fixture |
| TC-04 | AC2 | AC-H9 0 collection không render |
| TC-05 | AC2 | AC-H9 1 card, không gì để cuộn thì ẩn nút |
| TC-06 | AC2 | AC-H9 5 card, đầu/cuối hàng |
| TC-07 | AC2 | AC-H9 / chưa chọn collection |
| TC-10 | AC3 | AC-H10 badge = products_count |
| TC-11 | AC3 | AC-H10 số ít |
| TC-12 | AC3 | AC-H10 24 sản phẩm, skip theo ES1-T178 |
| TC-13 | AC3 | AC-H10 / đã áp fixture |
| TC-14 | AC3 | AC-H10 badge hiện khi rê/focus |
| TC-30 | AC3 | AC-H10 tĩnh |
| TC-15 | AC4 | Tab, mũi tên, Enter, focus thấy |
| TC-16 | AC4 | Enter trên card trình độ |
| TC-17 | AC5 | nojs cuộn tay, card là link |
| TC-18 | AC5 | nojs link figma |
| TC-19 | AC5 | chặn scroll-buttons.js |
| TC-20 | AC6 | 360 |
| TC-21 | AC6 | 768 |
| TC-22 | AC6 | 1280 (đo thêm) |
| TC-23 | AC6 | 1920 (đo thêm) |
| TC-24 | AC7 | axe, console |
| TC-19 | AC7 | axe khi thiếu JS |
| TC-20 | AC7 | axe ở 360 |

## Case biên (ngoài AC)
- Rỗng: 0 collection (TC-04, TC-07); collection rỗng → giữ card, không hàng số (TC-10 nhánh real = 0). CHƯA KIỂM bằng dữ liệu cố định: `index.te15.liquid` không có band level với collection 0 sản phẩm; chỉ chạy khi `/collections/all` rỗng.
- Tối đa: 5 card (TC-01, TC-06). Hơn 5 card không thuộc AC-H8/H9 (block nhận số card template gọi).
- Mất mạng: file `scroll-buttons.js` lỗi tải (TC-19, `route.abort`). Không có request dữ liệu nào khác (block không fetch).
- 360px: TC-20 (Pixel 7). 768: TC-21.
- Bàn phím: TC-15, TC-16, TC-14 (focus hiện badge).
- Screen reader: tên `ul` "Product categories", 1 link/card, tên link = tên collection, ảnh `alt=""` (TC-02); `aria-disabled` nút đầu/cuối (TC-06); tên link level có số (TC-14).
- Editor (`design_mode`) vs storefront: storefront không placeholder (TC-04). Editor placeholder kiểm tay trên editor, không tự động được (preview không có `request.design_mode`).
- Merchant chưa chọn resource: `/` theme mới cài không render (TC-07).
- Không JS: TC-17, TC-18. Thiếu file JS: TC-19.
- Trạng thái nút disabled (cặp màu, không opacity, sổ 21/11, TE-15 AC1): KHÔNG kiểm trong spec này, đã có bug mở ES1-T606 (TE-7 AC6, cùng `.round-button`) và task ES1-T543; không tạo bug trùng.

## Dữ liệu test (hoa-qua-nhap-khau (efitco-ai-dev))
- `/?view=te15` (`templates/index.te15.liquid`): collection `all` (luôn có), handle `te15-no-such-collection` cho 0 card; band số ít lấy collection đầu tiên có `products_count == 1`, không có thì skip.
- `/?view=figma`: `figma-cat-free-weights`, `figma-cat-functional-training`, `figma-cat-benches-racks`, `figma-cat-recovery-mobility`, `figma-cat-accessories`, `figma-level-beginner` (24 sản phẩm), `figma-level-intermediate`, `figma-level-advanced` (ES1-T178, fixture ES1-T331). Thiếu → skip "chờ dữ liệu ES1-T178 / fixture ES1-T331".
- `/`: fixture ES1-T331 (`tests/fixtures/home-figma.json`, nhận biết bằng `skipUnlessFixture`). Chưa áp → TC-03, TC-13 skip; TC-07 chạy. Đã áp → ngược lại.
- Số thật: trang collection `collection-count` (server render), không gọi `.json` storefront (429).

## Skip có lý do dữ liệu (theo DoD)
| TC | Điều kiện skip | Lý do |
| --- | --- | --- |
| TC-01 | hàng 5 card vừa khung ở 1920 | không có gì để cuộn (lưới tĩnh AC-H9), next/back không áp dụng |
| TC-02, TC-12, TC-18 | < 5 `figma-cat-*` / < 3 `figma-level-*` | chờ dữ liệu ES1-T178 / fixture ES1-T331 |
| TC-03, TC-13 | `/` chưa áp fixture | ADR 0011: index.liquid không truyền handle, cần setting store dev |
| TC-07 | `/` đã áp fixture | nhánh 0 collection kiểm ở TC-04 |
| TC-10 | `/collections/all` không có `collection-count` | không đối chiếu được số thật |
| TC-11 | không có collection đúng 1 sản phẩm | không kiểm được số ít trên store này |
| TC-14 | project mobile | Pixel 7 không hover: hàng số luôn hiện (TC-20) |
| TC-10 … TC-14 | project mobile | số sản phẩm render ở server, giống mọi viewport: chạy 1 lần ở desktop để bớt nửa lượt tải trang collection (store dev chặn 429, CI 24/11) |

## Ngoài phạm vi spec (DoD, ghi nhận)
- `npx playwright test tests/e2e/TE-1.spec.ts tests/e2e/TE-3.spec.ts tests/e2e/ES1-T176.spec.ts` và `npx lhci autorun` trên `/`, `/?view=figma`: chạy ở CI của PR (store-tests, lighthouse); phiên này không có store, không báo đạt.

## KHÔNG CHẮC
- Chữ badge: SRS AC-H10 và mockup ghi "24 products" (sentence case, sổ 21/11 lượt 2); locale hiện "{{ count }} Products". Spec so theo khoá locale (đúng "số ít nhiều đúng locale"), không ép chữ thường: chờ ES1-T578 (sentence case cho số đếm). Fixture sentinel `level-card-count` "24 Products" so không phân biệt hoa thường nên không vỡ khi ES1-T578 merge.
- Heading "Browse Categories" / "Choose Your Training Level" chưa sentence case: thuộc ES1-T578, không kiểm ở đây (AC-H2 của TE-17).
- Kích thước card 336 × 270: ES1-T580 đổi ảnh collection card sang 3/2 (336 × 224) sẽ làm card cao ~274 > 270 + 2 → TC-01, TC-02, TC-03 đỏ khi ES1-T580 merge nếu SRS không cập nhật. Đã hỏi ở ES1-T609 (BA, CTO duyệt); cùng lệch ở ảnh 360/768/1280 (TC-20..TC-22).
- Template `.figma` sẽ đổi tên `.mockup` (ES1-T581): đổi hằng `FIGMA` trong spec khi đó.
- Phím mũi tên trên khung cuộn có `scroll-snap-type: x mandatory`: Chromium cuộn tới điểm snap kế; ES1-T185 ghi chưa đo trên trình duyệt khác. TC-15 chỉ kiểm có cuộn (lớn hơn trước), không kiểm bước.
