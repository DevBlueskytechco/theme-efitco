KHÔNG CHẮC: (1) hook chặn BA ghi `docs/`, file này là bản thay chuỗi chính xác cho `docs/srs.md` và 3 file `docs/ui-spec/` — Orchestrator áp nguyên văn; (2) lightbox (TE-3 AC23, product.md dòng 114) dùng `aria-label`, không có tiêu đề làm đích focus: viết theo mặc định ES1-T481 (im lặng tới 19/11/2026 = nhận); (3) phiên BA không có quyền đọc `../ai-team/checks/ba/`, chưa chạy `vague_words.py`, `traceability.py` — đã rà tay 4 từ cấm.

# ES1-T480 — focus khi mở lớp modal = tiêu đề `aria-labelledby`

Nguồn: CTO 17/11 trả lời ES1-T476 #2 (cart drawer) và ES1-T471 #1 (menu drawer): "Focus khi mở mọi lớp (cart drawer, menu drawer…) thống nhất: tiêu đề aria-labelledby (ADR 0007)". ADR 0007 #5: module lớp gọi `open()` của `<modal-dialog>`, không tự viết lại focus. `assets/modal-dialog.js` `open()`: không có `[autofocus]` thì focus phần tử có id = `aria-labelledby` của dialog.
Mã R: R12 (Keyboard; focus; focus order — `docs/checklist-theme-store.md`).

Thứ tự Tab dùng trong AC lấy từ thứ tự header đã có trong spec: cart drawer h2 "Cart" · pill · link "View cart" · nút đóng (`mini-cart-quickview.md` §1 dòng 63, SRS TE-5 AC15); menu drawer tiêu đề "Menu" · nút đóng (`navigation.md` §2 Menu drawer mục 3). Pill không nhận Tab.

## A. `docs/srs.md`

### A1. Dòng 5 (phần nguồn bản 0.5) — thêm câu cuối đoạn

Cũ (cuối dòng 5):
```
Bảng thay đổi: `drafts/ba/ES1-T395/srs-changes.md`; ma trận truy vết: `drafts/ba/ES1-T395/traceability.md`.
```
Mới:
```
Bảng thay đổi: `drafts/ba/ES1-T395/srs-changes.md`; ma trận truy vết: `drafts/ba/ES1-T395/traceability.md`. Bản 0.5 sửa ES1-T480 (CTO 17/11, ES1-T471, ES1-T476): mở lớp modal thì focus vào tiêu đề `aria-labelledby` (TE-1 AC2, TE-5 AC15, TE-10 AC12). Bảng thay đổi: `drafts/ba/ES1-T480/srs-changes.md`; ma trận truy vết: `drafts/ba/ES1-T480/traceability.md`.
```
Ghi chú áp: chuỗi "Bảng thay đổi: `drafts/ba/ES1-T395/srs-changes.md`; ma trận truy vết: `drafts/ba/ES1-T395/traceability.md`." chỉ xuất hiện 1 lần trong file.

### A2. TE-5 AC15 (dòng 196) — sửa nguồn và câu focus

Cũ (đầu AC):
```
- AC15 (0.5, M2 CTO 10/11; `mini-cart-quickview.md` §1, §2; foundation §15)
```
Mới:
```
- AC15 (0.5, M2 CTO 10/11; `mini-cart-quickview.md` §1, §2; foundation §15; ES1-T480 CTO 17/11, ES1-T476 #2, ADR 0007 #5; R12)
```

Cũ (giữa AC):
```
Mở drawer Then focus vào nút đóng; đóng Then focus về nút đã mở.
```
Mới:
```
Given có JS When drawer mở (bấm icon giỏ, thêm giỏ thành công theo AC1, `openCart` theo AC7) Then phần tử đang focus là h2 "Cart" (tiêu đề mà dialog trỏ tới bằng `aria-labelledby`), không phải nút đóng; Tab lần 1 tới link "View cart", Tab lần 2 tới nút đóng; đóng Then focus về nút đã mở.
```

### A3. TE-1 AC2 (dòng 35) — thêm câu cuối AC

Cũ (cuối AC):
```
(0.5, M5 ES1-T306) Menu tới 3 cấp: cấp 3 trong drawer theo TE-22 AC4.
```
Mới:
```
(0.5, M5 ES1-T306) Menu tới 3 cấp: cấp 3 trong drawer theo TE-22 AC4. (0.5, ES1-T480 CTO 17/11, ES1-T471 #1, ADR 0007 #5; R12) Given dưới 80rem, có JS When chạm nút menu Then drawer mở ở cấp 1, phần tử đang focus là tiêu đề "Menu" (tiêu đề mà drawer trỏ tới bằng `aria-labelledby`), không phải nút đóng; Tab lần 1 tới nút đóng; đóng bằng nút đóng, Esc hoặc chạm scrim Then focus về nút menu.
```
Ghi chú áp: chuỗi "Menu tới 3 cấp: cấp 3 trong drawer theo TE-22 AC4." chỉ có ở TE-1 AC2.

### A4. TE-10 AC12 (dòng 336) — thêm quy tắc chung khi mở

Cũ (đầu AC):
```
- AC12 (0.5, foundation §15, §16; `layers.md` §1, §4)
```
Mới:
```
- AC12 (0.5, foundation §15, §16; `layers.md` §1, §4; ES1-T480 CTO 17/11, ADR 0007 #5; R12)
```

Cũ (giữa AC):
```
When mở Then là `<dialog>` modal có tên (`aria-labelledby`) và nút đóng tròn 48px có tên riêng; đóng bằng nút đóng
```
Mới:
```
When mở Then là `<dialog>` modal có tên (`aria-labelledby`) và nút đóng tròn 48px có tên riêng; phần tử đang focus ngay sau khi mở là tiêu đề mà `aria-labelledby` trỏ tới, không phải nút đóng (ngoại lệ duy nhất: search focus vào ô tìm theo TE-8 AC9; lightbox theo ES1-T481); đóng bằng nút đóng
```

AC không đổi, đã khớp quy tắc: TE-11 AC5 (popup kết quả quiz, focus tiêu đề), TE-18 AC8 (popup tự mở, focus tiêu đề), TE-8 AC9 (search, focus ô tìm — ngoại lệ ghi ở TE-10 AC12).

## B. `docs/ui-spec/navigation.md`

### B1. §6 Drawer (dòng 147)

Cũ:
```
- Mở: chạm nút menu; focus vào nút đóng (code). Khoá cuộn trang (`scroll-lock`).
```
Mới:
```
- Mở: chạm nút menu; focus vào tiêu đề "Menu" (đích `aria-labelledby` của drawer), Tab lần 1 tới nút đóng (CTO 17/11, ES1-T471; ADR 0007 #5, `assets/modal-dialog.js`; SRS TE-1 AC2). Khoá cuộn trang (`scroll-lock`).
```
Không đổi dòng 31 (mô tả hành vi code cũ "nút đóng 44 không tiêu đề", là hiện trạng trước vòng 3).

## C. `docs/ui-spec/mini-cart-quickview.md`

### C1. A11y, dòng 252

Cũ:
```
mở thì focus vào nút đóng (drawer) / tiêu đề (quickview, `tabindex="-1"`); đóng thì trả focus về nút mở.
```
Mới:
```
mở thì focus vào tiêu đề (drawer: h2 "Cart"; quickview: tiêu đề, `tabindex="-1"`), Tab tiếp theo trong drawer: "View cart" → nút đóng (CTO 17/11, ES1-T476; ADR 0007 #5; SRS TE-5 AC15); đóng thì trả focus về nút mở.
```

## D. `docs/ui-spec/foundation.md`

### D1. §15 Drawer, dòng 322

Cũ:
```
- A11y: `<dialog>` + `showModal()`, `aria-labelledby`; khoá cuộn.
```
Mới:
```
- A11y: `<dialog>` + `showModal()`, `aria-labelledby`; mở thì focus vào tiêu đề drawer (đích `aria-labelledby`), không vào × (CTO 17/11, ADR 0007 #5); ngoại lệ drawer Search: focus ô tìm (predictive-search §4, SRS TE-8 AC9); khoá cuộn.
```

### D2. §16 Dialog và bottom sheet, dòng 339

Cũ:
```
- A11y: `<dialog>` + `showModal()`, `aria-labelledby`, Escape, focus phần tử đầu, trả focus.
```
Mới:
```
- A11y: `<dialog>` + `showModal()`, `aria-labelledby`, Escape; mở thì focus vào tiêu đề (đích `aria-labelledby`), không vào × hay phần tử đầu (CTO 17/11, ADR 0007 #5; SRS TE-10 AC12); trả focus.
```
Lý do sửa: "focus phần tử đầu" trong header dialog là nút × (§16 "× 48 cách góc 24") — cùng loại lệch ticket nêu.

## E. Rà các chỗ khác (không sửa)

| File, dòng | Nội dung | Kết luận |
| --- | --- | --- |
| quiz-result.md 29, 140 | focus tiêu đề khi mở | khớp |
| marketing-popups.md 296 | focus h2, Tab tiếp là × | khớp |
| predictive-search.md 94, 163 | focus ô tìm | ngoại lệ, ghi ở TE-10 AC12 |
| localization.md 121 | popover `<details>` ≥ 768, focus ô tìm hoặc mục hiện tại | không phải lớp modal (disclosure), ngoài phạm vi |
| localization.md 122 | sheet < 768: không nói focus khi mở | theo TE-10 AC12 mới |
| collection.md 204; product-shopify-features.md 207, 284 | drawer lọc, pickup: không nói focus khi mở | theo TE-10 AC12 mới |
| product.md 114, 318 | lightbox `aria-label`, không tiêu đề | ES1-T481 |
| navigation.md 31, 150 | mô tả code cũ (focus trap JS) | hiện trạng, không phải yêu cầu |
