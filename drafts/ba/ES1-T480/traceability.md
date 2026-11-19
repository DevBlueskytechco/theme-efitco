KHÔNG CHẮC: chưa chạy `vague_words.py`, `traceability.py` (phiên BA không đọc được `../ai-team/checks/ba/`); lightbox theo mặc định ES1-T481.

# Ma trận truy vết ES1-T480

Yêu cầu: RQ-480 = CTO 17/11 (ES1-T471 #1, ES1-T476 #2): mở lớp modal thì focus vào tiêu đề `aria-labelledby` (ADR 0007 #5). Mã R: R12.

| Yêu cầu | Story / AC | Spec | Test case | Trạng thái test |
| --- | --- | --- | --- | --- |
| RQ-480 | TE-5 AC15 | mini-cart-quickview.md A11y; foundation §15 | TC-480-01, TC-480-02, TC-480-03 | mới (QA) |
| RQ-480 | TE-1 AC2 | navigation.md §6 Drawer; foundation §15 | TC-480-04; ES1-T16 TB-17 | TB-17 sửa assert trong PR ES1-T323 |
| RQ-480 | TE-10 AC12 | foundation §15, §16 | TC-480-05 | mới (QA) |
| RQ-480 (ngoại lệ) | TE-8 AC9 | predictive-search §4 | TC-480-05 (nhánh search) | mới (QA) |
| RQ-480 (lightbox) | TE-10 AC12, TE-3 AC23 | product.md §3 | TC-480-05 (nhánh lightbox, sau ES1-T481) | chờ ES1-T481 |

## Test case

Chung: có JS, store dev, viewport 360 và 1280 trừ khi ghi khác. "Đang focus" = `document.activeElement`.

- TC-480-01 (TE-5 AC15) Given giỏ có ≥ 1 dòng, đang ở trang chủ When bấm icon giỏ (`header-cart-link`) Then `cart-drawer-dialog` mở; đang focus là `cart-drawer-heading` (id bằng `aria-labelledby` của dialog); nút `cart-drawer-close` không đang focus. Tab 1 lần Then đang focus `cart-drawer-view-cart`; Tab thêm 1 lần Then đang focus `cart-drawer-close`. Esc Then dialog đóng, đang focus `header-cart-link`.
- TC-480-02 (TE-5 AC15, AC1) Given trang sản phẩm, `cart_type` drawer When bấm Add To Cart, thêm thành công Then drawer mở, đang focus `cart-drawer-heading`; đóng bằng nút đóng Then focus về nút Add To Cart (giữ ES1-T96).
- TC-480-03 (TE-5 AC15, AC7) Given `cart_type` drawer When gọi `Shopify.actions.openCart()` Then drawer mở, đang focus `cart-drawer-heading`.
- TC-480-04 (TE-1 AC2) Given viewport 360 và 768 When bấm `header-drawer-toggle` Then drawer `header-drawer` mở ở cấp 1; đang focus là phần tử có id bằng `aria-labelledby` của drawer (tiêu đề "Menu"); `header-drawer-close` không đang focus. Tab 1 lần Then đang focus `header-drawer-close`. Esc Then drawer đóng, đang focus `header-drawer-toggle`.
- TC-480-05 (TE-10 AC12) Given từng lớp modal có trên store dev (menu, cart, filter, quickview, quiz, localization dưới 48rem, newsletter, pickup) When mở Then đang focus = `document.getElementById(dialog.getAttribute('aria-labelledby'))`, khác nút đóng của lớp. Search (cả Popup và Drawer) Then đang focus là ô tìm. Lightbox: áp sau khi ES1-T481 chốt.

Test cũ cần QA chỉnh (không phải đầu ra BA):
- `tests/e2e/ES1-T16.spec.ts` TB-17 dòng 115: assert `close` toBeFocused khi mở → đổi sang tiêu đề (ES1-T471 nói đã sửa trong PR ES1-T323).
- `tests/e2e/ES1-T96.spec.ts` dòng 117: chỉ kiểm "focus trong dialog" → siết theo TC-480-02.
