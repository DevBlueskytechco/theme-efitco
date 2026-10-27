KHÔNG CHẮC: mcp__ticket__get, mcp__ticket__create, mcp__ticket__set_label bị chặn quyền trong phiên 2026-10-22; các ticket dưới đây chưa được tạo và ticket 2727475000000117007 chưa được set_label. Cần cấp quyền rồi chạy lại, hoặc tạo tay.

# Ticket chờ tạo — 2727475000000117007 (Test case TE-1 Header)

## 1. question → ba (parent 2727475000000117007)
Tiêu đề: [Q] TE-1 Header: phạm vi ticket QA và các điểm AC chưa rõ
1. Ticket "Test case TE-1 Header" phủ toàn bộ AC1–AC7 hay chỉ header (AC2–AC4)? QA đang phủ đủ 7 AC. drafts/qa/2727475000000117005 có bản nháp trùng — ticket nào là ticket QA?
2. AC2: mục cấp 1 có con là link điều hướng hay chỉ mở dropdown? Nếu là link cần nút toggle riêng cho Enter/Space.
3. AC2: accordion drawer mở 1 hay nhiều mục; menu cấp 3 bỏ hay hiện?
4. AC3: giỏ rỗng hiện 0 hay ẩn badge? Search link vào trang search hay mở predictive (TE-8)?
5. AC4: text chỉ khoảng trắng tính là rỗng? Link bọc cả bar hay chỉ text?
6. AC7: home không có shop.description thì không có meta description — chấp nhận hay cần fallback?
7. Block demo Skeleton (hello-world, liquid-tips) có CSS hardcode trong assets/base.css (dòng 5, 47–49, 59, 73, 82, 89–93) — thuộc phạm vi AC1 không, block demo có bị bỏ không?

## 2. question → designer (parent 2727475000000117007)
Tiêu đề: [Q] TE-1: thiếu Figma node announcement bar, header, footer
docs/figma-inventory.md dòng 9, 10, 20 trống node id và breakpoint. Cần: node id; 768 dùng nav hay drawer; header sticky không; account ở mobile nằm trên bar hay trong drawer; trạng thái hover/focus/mở của dropdown và drawer; trạng thái thành công/lỗi newsletter; dạng country/language selector.

## 3. task → dev-fe, side FE (parent 2727475000000117007)
Tiêu đề: TE-1: gắn data-testid cho header, announcement bar, footer theo hợp đồng QA
Header/footer hiện là Skeleton gốc, chưa có testid. Danh sách đề xuất (CONVENTION `<block>-<element>`): mục "Hợp đồng data-testid" trong drafts/qa/2727475000000117007/test-cases.md. Đổi tên thì báo QA để sửa tests/e2e/2727475000000117007.spec.ts. Kèm: schema `menu` header default `main-menu`, footer default `footer` (TC-15, TC-29, R14).

## 4. question → techlead (parent 2727475000000117007)
Tiêu đề: [Q] Gắn spec E2E TE-1 vào CI khi markup chưa merge; spec trùng 005/007
Job e2e trong .github/workflows/ci.yml chạy mọi spec; tests/e2e/2727475000000117007.spec.ts fail tới khi FE/BE TE-1 merge. Chốt: giữ spec trên nhánh feature/ai-<ticket FE TE-1>, hay merge kèm skip/tag tới khi xong? Spec chặn `**/header-menu*.js*` (tên theo docs/architecture.md) cho case lỗi mạng. tests/e2e/2727475000000117005.spec.ts (untracked) cùng phạm vi — bỏ 1 bản để không chạy trùng.

## Nộp ticket 2727475000000117007 (set_label ai-review)
Link: drafts/qa/2727475000000117007/test-cases.md ; tests/e2e/2727475000000117007.spec.ts
Ghi chú:
ac_coverage docs/srs.md#TE-1: 7/7 = 1.00; 34 TC + 26 case biên; spec 27 test (desktop, Pixel 7, 360, không JS).
E2E chưa chạy: không có PREVIEW_URL, markup TE-1 chưa có (header Skeleton gốc, chưa data-testid). Spec chưa type-check (không node_modules).
Bug: 0 (chưa có build TE-1). Tiền kiểm static: TC-01/02/05/15/29 sẽ fail trên code hiện tại.
KHÔNG CHẮC: chưa đọc được ticket, Figma node trống, trùng bản nháp ticket 005; ticket hỏi chờ tạo trong pending-tickets.md.
