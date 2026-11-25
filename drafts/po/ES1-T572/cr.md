KHÔNG CHẮC: (1) 26 point FE phát sinh tính trong 300 giờ FE hay nới, và ngân sách token 2.000 USD/tháng còn đúng gói hiện hành không → ES1-T588 (CTO), mặc định giữ charter, vượt thì cắt theo thứ tự mục Ngân sách. (2) BGĐ chưa xác nhận việc thay dòng 10/11 "gốc thiết kế duy nhất" (CTO báo). (3) ADR 0015 (ES1-T570) đang ai-review, cr.md chỉ trỏ ticket.

# CR ES1-T572 — mockup + kit 2.0.0 là nguồn chuẩn thiết kế; PRD 0.3, charter 0.3

## Mô tả CR + nguồn
Quyết định CTO 21/11 (ES1-T567), 2 khối trong `docs/design/decisions.md`: "CTO 21/11 — ES1-T567: mockup là nguồn chuẩn" và "CTO 21/11 lượt 2 — ES1-T567"; chốt thêm CTO 23/11 (tiêu đề drawer "Cart", menu footer Information). Chi tiết thay đổi và việc từng vai: `drafts/designer/ES1-T567/notes.md` mục 2, 3, 4, 10.1, 10.3. Nhánh nguồn: PR #307 (`feature/ai-ES1-T567`).

| # | Mục | Trước | Sau | Nguồn |
| --- | --- | --- | --- | --- |
| 1 | Nguồn chuẩn thiết kế | bản vẽ trang chủ desktop là gốc duy nhất (dòng BGĐ 10/11); tablet, mobile, trang con suy từ bản vẽ | mockup HTML `drafts/designer/**` (trừ ES1-T252, ES1-T174) + `drafts/designer/_kit/kit.css`, design system 2.0.0, đủ 4 khổ mọi trang; thứ tự kit → mockup → `docs/tokens.json`, DESIGN.md, `docs/ui-spec/*` → code theme; bản vẽ dựng lại từ mockup; phần "không dùng trang live hay ảnh store dev làm gốc" giữ | decisions 21/11 quyết định 1; dòng 10/11 (BGĐ) ở mục "Đã thay" |
| 2 | Chữ giao diện | nhãn nút Title Case (ngoại lệ thương hiệu); heading, tab, menu Title Case | sentence case cho nhãn nút, link dạng nút, heading h1–h4, tiêu đề section / dialog / drawer, empty state, tab, link menu, chip lọc; giữ "Checkout" (thuật ngữ); big offer "Shop the offer" → "View offer"; tiêu đề drawer mini cart "Cart" (CTO 23/11); tên thương hiệu, dữ liệu merchant, tên riêng, viết tắt giữ; chữ HOA do CSS giữ | decisions 21/11 quyết định 3; lượt 2 mục Đổi |
| 3 | Control, khoảng section | control 48 dưới 80rem, 52 từ 80rem; section 56 dưới 64rem, 120 từ 64rem | control 48 mọi mốc (`--control-height`; nút tròn 52, hàng 52 giữ); section 48 dưới 64rem, 128 từ 64rem (`--space-7xl`) | decisions 21/11 lượt 2; notes mục 2, 10.1 |
| 4 | Đi kèm cùng quyết định (không đổi PRD/charter, ghi để truy vết) | chỉ báo tải 300 ms; phần trăm giảm dấu nối; `.rte` 16/27,2; tỉ lệ ảnh theo px bản vẽ | chỉ báo tải 500 ms (debounce 300 giữ); dấu trừ U+2212 ("−24%"); `.rte` 16/28; tỉ lệ ảnh có tên (1/1, 2/1, 3/2, 4/3, 3/4, 16/9, 9/16) | decisions 21/11 lượt 2; notes mục 2, 3 |

Thay đổi trong PRD/charter (chỉ dòng bản, prd:8, Rủi ro):
- PRD 0.2 → 0.3: dòng bản gộp dòng tạm "Cập nhật CTO 21/11"; prd:8 "đẹp theo thiết kế Efitco T10 đã duyệt" → "khớp mockup Efitco (design system 2.0.0)". prd:34, :47, :90 ("khớp mockup") giữ.
- Charter 0.2 → 0.3: dòng bản gộp dòng tạm "Cập nhật CTO 21/11", ghi dòng BGĐ 10/11 đã thay; :6 (kiểm kê 27/10) giữ, là lịch sử; Rủi ro 6 mới; thêm dòng ký charter 0.3.
- Không đổi: Mục tiêu đo được, Phạm vi, Mốc, Ngân sách, Must/Should/Could/Won't, Chỉ số thành công.

## Tác động kỹ thuật (subagent Tech Lead 23/11, chỉ đọc ticket anh em)
- Point (1 point ≈ 1,5 giờ): FE 26 point ≈ 39 giờ (ES1-T576 5, T577 8, T578 5, T579 2, T580 3, T581 3), khoảng 13% của 200 point FE Must; BE 3 point (ES1-T555, chỉ báo tải 500 ms); DevOps 8 point (ES1-T574 5, ES1-T530 3). Không nằm trong 200 point FE Must của charter → ES1-T588.
- Không đổi kiến trúc, không cần ADR mới: thứ tự nguồn và đặc tả CI đã ở ES1-T570 (ADR 0015). ES1-T555 thêm `assets/loading-delay.js` ≤ 512 B, trong ADR 0010.
- Thứ tự: PR #307 merge (ES1-T567 đóng) → Sprint 3: T578, T580 song song, T579 sau T578, T576 sau T536/T540, T555 độc lập → Sprint 4: T577 sau T576; T581 sau T576/T577/T538; T582 sau FE + T555; T574 sau T581, T582 và CTO duyệt dữ liệu store; T530 sau T585. Đường găng T576 → T577 → T581 → T582 → T574 vừa kịp 28/12, không dư.
- Rủi ro: gzip base.css ≤ 49 152 B (T576, T577, T579, T580 cùng chạm base.css → merge tuần tự, đo sau mỗi PR); xung đột `en.default.json` (T578, T579), base.css / critical.css (T576, T577); template thử đổi tên ở T581 trong khi T574, T582 còn trỏ tên cũ; T577 đổi ~92 line-height, e2e chiều cao đỏ tới khi T582 xong; CI T530 FAIL `type_primary_font` tới khi T585 xong và WARN 7 khoá `known_mismatches` tới khi FE đóng (đúng thiết kế, không tắt check).
- Việc chưa có ticket: (a) chuỗi "-N%" viết cứng trong `assets/*.js` (notes mục 3 #21; T579 chỉ sửa locale); (b) alert lỗi giỏ trong JS (T578 ghi "BE", không key). Đề xuất Tech Lead tạo 1 ticket BE 1 point hoặc ghép vào ES1-T555.
- Lệch phạm vi: T578 ghi sửa AGENTS.md:349, 514; ES1-T570 ghi AGENTS.md thuộc CTO → ES1-T588 mục 3.

## Tác động nghiệp vụ (subagent BA 23/11; SRS do ES1-T571)
- 0 story mới, 0 story bỏ, Must/Should giữ (bảng MoSCoW PRD 24 dòng không phụ thuộc chữ hay số đo). "View offer" thuộc TE-18 (Should, cắt 1).
- AC đổi chỉ ở SRS mục 2, ES1-T571 làm (SRS 0.6, ai-review): control 48, section 128, chuỗi sentence case, `.rte` 16/28, 500 ms ở TE-6 AC14, U+2212, tỉ lệ ảnh có tên. Số AC giữ. Câu hỏi treo: ES1-T586, ES1-T587.
- PO chấp nhận phần T571 thêm theo notes mục 2 (tỉ lệ ảnh có tên, TE-10 AC13, TE-19 AC4): có nguồn quyết định CTO 21/11, nằm trong CR này (dòng 4 bảng trên).
- Tài liệu còn lệch: `docs/requirements-map.md` "SRS 0.5" (đầu ra T571 đã sửa, chờ chép); `docs/merchant/bundle-builder.md`, `pre-publish.md` Title Case (ES1-T578); bảng nội dung trang chủ theo mã cũ ES1-T173 (thay bằng home-content.md của T571); draft BA cũ là lịch sử, giữ.

## Tác động test (subagent QA 23/11)
- Đã có ticket: assert chuỗi ~16 spec (ES1-T578); dấu trừ 2 spec, ellipsis tag 1 spec (ES1-T579); URL template thử 16 spec (ES1-T581); handle tiền tố cũ 19 spec + fixture (ES1-T574); baseline so ảnh = PNG mockup 4 khổ, đổi tên 4 tệp support, assert 48 / 128 / 24 / 500 ms, 6–10 TC mới (ES1-T582).
- Chưa ai nhận: test case cũ `drafts/qa/**/test-cases.md` còn Title Case và 52 / 120 / 300 ms; assert nút "View offer" (popup big offer chưa có trên develop, TE-18 Should); skill `canvas-check`, `test-case-gwt` còn tham chiếu bản vẽ cũ (CTO, PR `.claude/` riêng).
- Giờ QA thêm ngoài ES1-T582: ~3 point ≈ 9 giờ (soát diff e2e trong PR FE 2, cập nhật test case cũ 3, regression 4 khổ sau chuỗi merge 3, "View offer" 1); nằm trong QA 160 giờ, không nới.
- Rủi ro: fixture trang chủ bị T581, T582, T574 cùng sửa; đổi handle store trước khi PR theme merge làm e2e đỏ hàng loạt; baseline mockup tĩnh lệch dữ liệu store ở 5 vùng (ES1-T587, mặc định che từ 25/11); AC2 của T582 chỉ grep 4 chuỗi; tách đúng 8 assert 52 cần giữ ở 1280, 1920.
- Không ảnh hưởng: `docs/test-strategy.md`, `docs/checklist-canvas.md` (Designer đã sửa), lighthouserc.

## Ticket bị tác động
- FE: ES1-T576, ES1-T577, ES1-T578 (gộp ES1-T552), ES1-T579, ES1-T580, ES1-T581.
- BE: ES1-T555.
- QA: ES1-T582.
- DevOps: ES1-T574, ES1-T530.
- BA: ES1-T571.
- Chặn trên đường găng (có từ trước, không phát sinh từ CR): ES1-T536, T537, T538, T540, T551, T585.

## Quyết định
Chấp nhận. Lý do: CTO đã chốt nội dung (ES1-T567 lượt 1, lượt 2, 23/11); 0 story mới, Must/Should không đổi; không đổi kiến trúc.
- Sprint: theo thứ tự Tech Lead ở trên — Sprint 3 (30/11–11/12): T578, T580, T579, T576, T555; Sprint 4 (14–25/12): T577, T581, T582, T574, T530. PO không xếp vào Sprint 2 (còn 4 ngày, đang chờ PR #307).
- Đẩy ra: không đẩy story nào ngay. 26 point FE tính vào ngân sách FE hiện có (mặc định ES1-T588 mục 2a); burn FE cuối Sprint 3 vượt thì cắt theo thứ tự charter: Should 20 → 24 (đã ngoài R1) → popup kết quả quiz TE-11-R2-FE1/BE1 → mở rộng TE-20 → TE-6-R2-FE4. Không dời R1 28/12, không cắt trang chủ, trang phụ, task CHẶN ES1-T304.
- Dòng BGĐ 10/11 "gốc thiết kế duy nhất" (bản vẽ trang chủ desktop) đã thay bằng mockup + kit 2.0.0; CTO báo BGĐ (notes mục 4, 10.3). PO không gửi cho BGĐ.

## Ticket đang mở lỗi thời (đề xuất, PO không tự đóng)
- ES1-T552: đã gộp vào ES1-T578 → đóng khi T578 merge (body đã ghi).
- ES1-T578: comment CTO 23/11 07:59 "Your cart" đã bị comment 08:52 "Cart" thay; body đã gộp, không cần sửa.
- ES1-T578 phạm vi AGENTS.md:349, 514: sửa body sau khi CTO trả lời ES1-T588 mục 3.
- ES1-T574 priority low trên đường găng: đề xuất Tech Lead/CTO nâng medium.
- Kho kiến thức ai-team và `.claude/agents`, `.claude/skills` còn Title Case, control 52, tham chiếu bản vẽ cũ (notes mục 4): CTO, chưa có key ticket.

## [Q] đang mở chặn (thứ tự CTO cần chốt)
1. ES1-T588 (PO → CTO): 26 point FE trong 300 giờ hay nới; ngân sách token 2.000 USD; ai sửa AGENTS.md.
2. Xác nhận BGĐ thay dòng 10/11 (CTO, notes mục 10.3) — chưa có ticket.
3. ES1-T587 (BA → CTO): dữ liệu store dev lệch mockup trang chủ, AC-H2 so theo nguồn nào (mặc định che vùng lệch).
4. ES1-T586 (BA → Designer): ngưỡng chỉ báo tải predictive search 200 ms hay 500 ms (mặc định giữ 200).
Đã có đáp trong sổ quyết định: tiêu đề drawer "Cart", menu footer Information (CTO 23/11); "Checkout" giữ, "View offer", control 48, section 128 / 48, 500 ms (CTO 21/11 lượt 2).

## Việc phải cập nhật
- Orchestrator: chép `drafts/po/ES1-T572/prd.md` → `docs/prd.md`, `charter.md` → `docs/charter.md` sau khi CTO ký charter 0.3.
- CTO: ký charter 0.3; trả lời ES1-T588; báo BGĐ; cập nhật kho kiến thức và `.claude/` (notes mục 4).
- Tech Lead: ticket BE cho "-N%" trong JS và alert lỗi giỏ (hoặc ghép ES1-T555); xếp sprint các ticket trên vào task-split ES1-T307.
- BA: SRS 0.6 (ES1-T571); requirements-map "SRS 0.6".
- QA: ES1-T582; test case cũ theo SRS 0.6; assert "View offer" khi block có.
- DevOps: ES1-T574 sau ES1-T581, T582; ES1-T530 sau ES1-T585.
- Backlog: không thêm story; 26 point FE, 3 BE, 5 QA (+~3), 8 DevOps, 3 BA gắn REQ-0002, mục tiêu M1 (trang chủ khớp mockup) và M2 (chất lượng).
