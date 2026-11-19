KHÔNG CHẮC: quyết định dưới chạy theo mặc định của ES1-T308 (nội dung mẫu vs §8, không nộp Theme Store, app block review, năng lực sprint); CTO trả khác thì sửa bảng ưu tiên và mốc.

# CR ES1-T305 — REQ-0002 BGĐ duyệt thiết kế, lập kế hoạch DEV

Mô tả + nguồn: BGĐ duyệt thiết kế 11/11/2026 (vòng 3, audit fix ES1-T284→T294, PR #173), chuyển giai đoạn DEV hoàn thiện theme. Nguồn: ticket ES1-T305, sổ docs/design/decisions.md, SRS 0.4, audit docs/design/shopify-audit-1111/. Ticket anh em: ES1-T306 (BA), ES1-T307 (Tech Lead), ES1-T304 (Tech Lead, code tuân thủ).

Tác động kỹ thuật (subagent techlead, thô): còn ~94 point FE + ~72 point BE, chưa gồm ES1-T304. Cần 5 nền chung trước tính năng (layer manager, bộ chọn biến thể theo option value, countdown chung, snippet phân trang, panel quickview). Rủi ro: ngân sách JS ADR 0006 (PDP ~49,5 KB thô, motion.js > 8 KB/file), cách đo chưa thống nhất → ADR 0007. Không đổi kiến trúc (giữ Skeleton block-first).

Tác động nghiệp vụ (subagent ba): không thiếu story cho quiz-result, localization, announcement, phân trang, layers, tính năng Shopify PDP (đã là AC trong SRS 0.4). Thiếu AC: upsell cart, blog/article mở rộng, menu 3 cấp/mega, breadcrumb, Popular searches, Follow on Shop, favicon, rich media featured/quickview, không cắt tên, .rte chung. PRD 0.1, charter 0.1, requirements-map lỗi thời. Mâu thuẫn nội dung mẫu với §8, app block review với PRD Won't.

Tác động test (subagent qa): ~30 TC cũ phải viết lại/bỏ (TE-1, TE-2, TE-3 swatch, TE-4 nojs, TE-6, TE-7, TE-11); ~200 TC mới (TE-4 AC13–AC20 ~47, TE-18 ~35, TE-11 ~25...); dữ liệu B2B/Markets/pickup kiểm bằng mockup, > 250 biến thể và selling plan cần dữ liệu thật (ES1-T298).

Quyết định: CHẤP NHẬN.
- Sprint 1 còn lại (12–13/11): chia task, ADR 0007, SRS 0.5, PRD 0.2, charter 0.2, đóng ticket lỗi thời.
- Sprint 2 (16–27/11): nền chung + trang chủ (TE-17, TE-13, TE-7, TE-2, TE-12) + ES1-T304 CHẶN + TE-9 + TE-14.
- Sprint 3 (30/11–11/12): TE-3, TE-4 core, TE-5, TE-6, TE-1, TE-11.
- Sprint 4 (14–25/12): TE-8, TE-10, nhóm Should theo năng lực.
- Đẩy ra khỏi R1 nếu trễ (theo thứ tự): TE-20 blog/article mở rộng, TE-19 upsell, TE-21 điều hướng mở rộng, TE-4 AC18 B2B, TE-18 popup marketing. Hoãn sau R1: review app block (P1), ảnh logo bên thứ ba, tên theme.
- Lý do: R bắt buộc Theme Store và trang chủ giống Figma là điều kiện G5; nhóm đẩy ra không thuộc R bắt buộc hoặc phụ thuộc dữ liệu store chưa bật.

Việc phải cập nhật: SRS 0.5 (BA), PRD 0.2 + charter 0.2 + kế hoạch release R1 (PO), requirements-map (BA), chia task REQ-0002 (Tech Lead ES1-T307), test-strategy NFR-1 (QA). Chi tiết: `drafts/po/ES1-T305/impact.md` mục "Ticket cần tạo". PO trả lời ES1-T206 trong comment ticket đó.
