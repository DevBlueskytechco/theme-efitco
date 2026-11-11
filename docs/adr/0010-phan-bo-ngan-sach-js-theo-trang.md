KHÔNG CHẮC: số "hiện tại" là phép cộng tĩnh `wc -c` theo thẻ script và `data-lazy-module` trong `blocks/`, `layout/` ở develop `ce08212` (header có menu, `sticky_header` bật, cart drawer mọi trang); số đo thật theo URL chờ bước CI của ES1-T177.

# 0010. Phân bổ ngân sách JS theo trang cho giai đoạn hoàn thiện theme (REQ-0002)
Ngày: 2026-11-11 | Trạng thái: Chấp nhận (CTO duyệt 11/11/2026, ES1-T310; đề xuất ở ES1-T307) | Bổ sung ADR 0006, không đổi trần

## Bối cảnh
- ADR 0006: mỗi trang JS theme tải sẵn ≤ 40 960 B, sau cuộn hết trang ≤ 65 536 B, mỗi file ≤ 8 192 B. SRS 0.4 AC-H31 chặn merge khi vượt.
- Hiện trạng (cộng tĩnh, develop `ce08212`):
  - Chung mọi trang (layout + header + cart drawer): `standard-events` 888 + `motion` 9 161 + `header-menu` 6 862 + `header-sticky` 1 680 + `cart-drawer` 3 868 = 22 459 B. `motion.js` 9 161 B vượt trần 8 192 B/file (vi phạm AGENTS.md từ ES1-T250).
  - PDP tải sẵn: 22 459 + `product-variant-picker` 7 163 + `product-form` 6 857 + `product-media` 4 407 + `product-recommendations` 3 069 = 43 955 B, vượt 40 960.
  - Trang chủ tải sẵn: 22 459 + `slideshow` 8 057 + `product-swatch` 5 851 + `quiz-dialog` 1 511 + `lazy-module` 379 = 38 257 B; nạp động khi cuộn (`collection-tabs`, `scroll-buttons`, `scroll-extras`, `featured-product`, `product-variant-picker`, `product-form`, `bundle-form`, `quiz-finder`, `video-carousel`) ≈ 34 869 B → ≈ 73 126 B, vượt 65 536.
- REQ-0002 thêm: `modal-dialog`, `page-layers` (ADR 0007), `sale-countdown` (ADR 0009), quick view, pickup, localization, popup marketing, checkout bar cart, predictive search mở rộng.

## Lựa chọn đã cân nhắc
- A. Nâng trần ADR 0006. Ưu: không cắt gì. Nhược: Lighthouse perf desktop ≥ 98 (NFR-1) khó hơn 96; trái CTO 03/11. Loại.
- B. Giữ trần, cắt tính năng. Ưu: đơn giản. Nhược: bỏ phạm vi BGĐ đã duyệt. Loại.
- C. Giữ trần, phân bổ cứng theo nhóm (chung / theo trang / nạp lười), chuyển phần không cần lúc tải sang nạp theo tương tác, gỡ JS không còn dùng (swatch card thành chỉ báo). Ưu: đủ phạm vi, đo được từng PR. Nhược: thêm 1 kiểu nạp, nhiều file phải giảm byte. Chọn.

## Quyết định
C. Trần mỗi file giữ 8 192 B. Bảng trần dưới đây ghi vào DoD của từng task (`drafts/techlead/ES1-T307/task-split.md`).

| Nhóm | File | Trần (B) | Cách nạp |
| --- | --- | --- | --- |
| Chung mọi trang (tổng ≤ 19 456) | standard-events | 888 (giữ) | layout |
| | motion | 6 144 (từ 9 161) | layout |
| | header-menu (mega, nút mở drawer) | 3 072 (từ 6 862) | header |
| | header-drawer (drawer cấp 2, localization trong drawer) | 4 096 | lười: khi bấm nút menu |
| | header-sticky | 1 680 (giữ) | header |
| | cart-drawer | 3 072 (từ 3 868) | cart drawer |
| | modal-dialog, page-layers | 2 048 mỗi file | layout |
| PDP riêng (tổng tải sẵn ≤ 21 504) | product-variant-picker | 7 168 | product-form |
| | product-form (gồm sticky bar, selling plan, quantity rule) | 7 168 | product-form |
| | product-media (gallery) | 3 072 | product-media |
| | sale-countdown | 2 048 | product-info |
| | product-media-lightbox, pickup-availability | 2 048 mỗi file | lười: khi bấm |
| | product-recommendations | 3 072 | lười: viewport |
| Trang chủ riêng | slideshow | 8 057 (giữ, ≤ 8 192) | slideshow |
| | product-swatch | 0 (gỡ khỏi card: swatch là chỉ báo, TE-3 AC2) | — |
| | quiz-dialog, quiz-finder | giữ | lười: tương tác (pointerdown/focusin trên quiz) |
| | product-variant-picker + product-form của featured product | như PDP | lười: tương tác (pointerenter/focusin vùng mua) |
| | bundle-form (gồm bundle bar 360) | 7 168 | lười: viewport |
| | sale-countdown, video-carousel, scroll-buttons (1 536), scroll-extras, collection-tabs | ≤ 8 192 mỗi file | lười: viewport |
| Collection, search | collection-filters | 8 192 | collection-filters / search |
| Cart | cart-items (gồm checkout bar) | 7 168 | cart-page |
| Lười theo tương tác, mọi trang | quick-view 6 144; predictive-search 6 656; localization-picker 4 096; popup-queue 1 536 tải sẵn + popup-forms 4 096 lười | — | khi bấm / khi điều kiện popup đủ |

- `assets/lazy-module.js` nhận thêm `data-lazy-on="interaction"` (nạp khi `pointerenter`, `focusin`, `touchstart` đầu tiên trong element) bên cạnh mặc định viewport; trần 768 B.
- JS nạp theo tương tác không tính vào trần sau cuộn (ADR 0006 đo cuộn hết trang và mở search, không bấm), nhưng mỗi file vẫn ≤ 8 192 B.
- Ước sau phân bổ: chung 18 952; PDP 38 408 tải sẵn; trang chủ ≈ 32 131 tải sẵn (chung + slideshow 8 057 + lazy-module 379 + popup-queue 1 536 + scroll-extras 3 207 do `motion.js` import lúc tải), ≈ 48 651 sau cuộn; collection ≈ 27 523; cart ≈ 26 120.

## Hệ quả
- Tốt: PDP về dưới 40 960; trang chủ sau cuộn về dưới 65 536 kể cả khi thêm `page-layers`, `modal-dialog`, `sale-countdown`, popup; có chỗ cho quick view, popup.
- Xấu: featured product và quiz trễ ~1 vòng mạng ở lần tương tác đầu (markup chạy không JS nên vẫn mua/submit được); 6 file phải giảm byte (`motion`, `header-menu`, `cart-drawer`, `product-media`, `product-form`, `product-variant-picker` sau khi thêm tính năng).
- Việc: BE `TE-10-R2-BE3` (`motion.js` ≤ 6 144, `lazy-module.js` interaction); `TE-22-R2-BE1` (`header-menu.js` ≤ 3 072, chỉ mega); `TE-1-R2-BE1` (tách `header-drawer.js` ≤ 4 096, lười); `TE-19-R2-BE1` (upsell cart page dùng lại `product-recommendations.js`, trần nâng 3 072 → 4 096, lười viewport, không tính vào tải sẵn cart); `TE-3-R2-BE2` (gỡ `product-swatch.js` khỏi card); các task màn ghi trần ở DoD. DevOps hoàn tất bước đo theo URL ở ES1-T177.
- Đo: mỗi PR BE chạy `wc -c assets/*.js` (mọi file ≤ 8 192) và ghi phép cộng theo trang vào PR; CI ES1-T177 khi có: tải sẵn ≤ 40 960, sau cuộn ≤ 65 536 trên `/`, `/products/<demo>`, `/collections/all`, `/cart`, `/search?q=bench`; lhci perf desktop ≥ 96 (CI), nghiệm thu ≥ 98.
