KHÔNG CHẮC: (1) MCP ticket không có tool sửa ticket và `create` không có tham số `priority`, nên priority của ticket mới, blocked_by/priority/point/tiêu đề của ticket cũ CHƯA áp, chỉ có ở mục 3 để Orchestrator áp; nội dung sửa body ticket cũ nằm ở comment, body gốc còn nguyên. (2) AC-H và plan chưa có trên develop, chỉ có trên nhánh `feature/ai-ES1-T168`, `feature/ai-ES1-T169`; `docs/srs.md` chưa có TE-15, 16, 17 tới khi xong ES1-T173. (3) Hook và tên file mới trong ticket (data-scroll-*, data-tab*, data-body-region, data-hotspot, data-look-row) là quyết định của tôi, plan không ghi.

# ES1-T170: ticket đã tạo và cập nhật theo plan ES1-T169

Tech Lead, 06/11/2026. Không sửa code.

## 1. Ticket mới: 25

Thứ tự theo cột # của plan. Priority là giá trị cần áp, hiện mọi ticket mới đều `none`.

| # plan | Key | Tên | Agent | Phía | Point | Priority | blocked_by | ai-draft |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 10 | ES1-T173 | TE-17-BA1 | ba | | | high | | có |
| 11 | ES1-T174 | TE-17-DES1 | designer | | | high | | có |
| 12 | ES1-T175 | TE-17-FE0 | dev-fe | fe | 3 | high | T171, T172, T120, T163, T147, T119, T156, T98, T129 (G0) | có |
| 13 | ES1-T176 | TE-17-QA2 | qa | | | high | T175 | có |
| 14 | ES1-T177 | TE-17-DEVOPS1 | devops | | | high | T175 | có |
| 15 | ES1-T178 | TE-17-OPS1 | claude-code | | | high | T173 | không |
| 16 | ES1-T179 | TE-17-FE1a | dev-fe | fe | 6 | high | T175, T176, T177 (G1), T173 | có |
| 17 | ES1-T180 | TE-17-FE1b | dev-fe | fe | 5 | high | T179 | có |
| 18 | ES1-T181 | TE-17-FE2 | dev-fe | fe | 5 | high | T180 | có |
| 20 | ES1-T182 | TE-17-FE1c | dev-fe | fe | 6 | high | T181, T174 | có |
| 21 | ES1-T183 | TE-11-FE3 | dev-fe | fe | 3 | high | T182 | có |
| 25 | ES1-T184 | TE-15-FE1 | dev-fe | fe | 4 | high | T139, T174 | có |
| 26 | ES1-T185 | TE-15-BE1 | dev-be | be | 3 | high | T184, T139 | có |
| 27 | ES1-T186 | TE-15-FE2 | dev-fe | fe | 3 | high | T185 | có |
| 28 | ES1-T187 | TE-15-QA1 | qa | | | high | T186 | có |
| 29 | ES1-T188 | TE-3-FE4 | dev-fe | fe | 4 | high | T187 | có |
| 30 | ES1-T189 | TE-3-BE3 | dev-be | be | 3 | high | T188, T139 | có |
| 31 | ES1-T190 | TE-3-FE5 | dev-fe | fe | 3 | high | T189, T174 | có |
| 38 | ES1-T191 | TE-16-FE1 | dev-fe | fe | 4 | high | T159, T174 | có |
| 39 | ES1-T192 | TE-16-QA1 | qa | | | high | T191 | có |
| 40 | ES1-T193 | TE-10-DOC1 | writer | | | medium | T149 | có |
| 41 | ES1-T194 | TE-14 AGENTS.md | cto | | | medium | T191 | không |
| 42 | ES1-T195 | TE-17-OPS2 | cto | | | high | T192, T178 | không |
| 43 | ES1-T196 | TE-17-QA3 | qa | | | high | T195 | có |
| 44 | ES1-T197 | TE-17-DES2 | designer | | | high | T196 | có |

Point ticket mới: FE 46 + BE 6 = 52. Cộng T148 6, T157 5 = FE 57; cộng T139 6, T149 6, T158 6 = BE 24. Tổng 81, khớp plan.

## 2. Ticket cũ đã comment

Comment thắng body ở điểm đã ghi: T147, T148, T149, T150, T139, T157, T158, T122, T140, T151, T159.
Comment ghi thứ tự, priority, blocked_by: T98, T119, T120, T129, T156, T163, T134, T144, T153.
Đính chính ticket mới: T173 (đường dẫn), T176 (so copy chờ T173), T183 (tiêu đề), T184 (copy), T188 (param tab).

## 3. Patch chờ Orchestrator áp

Tôi không có tool sửa và không ghi trực tiếp vào nơi lưu ticket.

Ticket mới:
- priority high: T173, T174, T175, T176, T177, T178, T179, T180, T181, T182, T183, T184, T185, T186, T187, T188, T189, T190, T191, T192, T195, T196, T197.
- priority medium: T193, T194.
- sprint Sprint 1: T178, T194, T195 (không gắn ai-draft nên sprint null).
- title T183: bỏ ", 8 hook cho ES1-T139", thay bằng ", hook data-body-region cho ES1-T139".

Ticket cũ:

| Key | priority | blocked_by thêm | point | Tiêu đề cần đổi |
| --- | --- | --- | --- | --- |
| ES1-T98 | none thành high | T163 | | |
| ES1-T119 | none thành high | | | |
| ES1-T120 | none thành high | | | |
| ES1-T129 | none thành medium | | | |
| ES1-T147 | none thành high | T171 | | |
| ES1-T150 | none thành medium | T149 | | |
| ES1-T156 | none thành high | | | |
| ES1-T163 | none thành high | T171 | | |
| ES1-T122 | | T180 | | |
| ES1-T134, T144, T153 | | T173 | | |
| ES1-T139 | | T183 | 5 thành 6 | trần 4096 B thành 4352 B, thêm body map |
| ES1-T148 | | T182, T190 | 3 thành 6 | thêm dòng giảm, 4 hotspot, viền chọn |
| ES1-T149 | | T99 | 5 thành 6 | trần 5120 B thành 5504 B, thêm hotspot, viền |
| ES1-T157 | | T149 | | bỏ "3 ô số liệu" |
| ES1-T158 | | | 5 thành 6 | trần 2048 B thành 2304 B |

Priority low của T105, T110, T111, T112, T125, T128, T130, T131 và high của T99, T122, T134, T139, T140, T144, T148, T149, T151, T153, T157, T158, T159 đã đúng, không cần áp. T172 đã là high.

Nếu Orchestrator áp được body: nên chép nội dung comment vào body của 11 ticket ở dòng đầu mục 2, vì agent sau đọc body trước.

## 4. Lệch so với plan, đã xử lý theo ES1-T170

- Không tạo: TE-10-QA2 (đã có ES1-T171), TE-17-TL2 (ticket này). ES1-T172 thay phần +1 point của T120.
- `urgent` đổi thành `high`. Không dùng T167, T168, T169 làm blocked_by, nên TE-17-BA1 không có blocked_by.
- TE-17-OPS1 giao Claude Code, không ai-draft. Publish vẫn ở CTO (T195).
- G0, G1 không phải ticket: blocked_by thay bằng các ticket của giai đoạn đó, điều kiện cổng ghi trong body T175, T176, T179. CTO ký ngưỡng G1 trên T176.

## 5. Quyết định của tôi cần CTO biết

- Tạo thêm ES1-T194: # 41 có trong mục 2 của plan nhưng không ở mục 6 và chưa có ticket nào. Không muốn thì đóng.
- T194: ngoại lệ `AGENTS.md:258` nên ghi trước khi merge T182, sớm hơn thứ tự # 41. T182 cho quiz, bundle hiện sẵn, trái dòng này cho tới khi có ngoại lệ, và AGENTS.md là nguồn cao nhất. Vẫn để blocked_by T191 cho phần Theme map, ghi rõ trong body.
- T195: plan gộp "chọn sản phẩm, ảnh trong editor" vào việc CTO, ES1-T170 chỉ giao phần nhập dữ liệu cho Claude Code. Tôi giữ thao tác editor ở CTO. Nếu Claude Code làm được thì chuyển sang T178.
- T195: kiểm live theme nghi sai (`ai-feature-ai-ES1-T147`) nên làm ngay, không chờ blocked_by.
- T196: thêm AC-H28, H29 vì không ticket QA nào đóng 2 AC này.
- T156.spec:201-206: plan # 20 ghi là phải sửa, nhưng khẳng định này vẫn đúng với D1, nên T182 giữ, chỉ sửa nếu lệch.
- T148, T157: "trang chủ chưa cấu hình không có block" không trái D1, giữ. Mục 6 của plan chỉ yêu cầu bỏ nếu trái.
- ES1-T161, T165 đáp tại D4, D5 của plan: chưa comment, ticket không yêu cầu. Nội dung D4 đã ghi ở T157, T158; D5 ở T177.

## 6. Tự kiểm tra

- Mục 6 plan: 13 dev + 13 không point = 26; trừ TE-17-TL2, TE-10-QA2 = 24; cộng T194 = 25. Đã tạo 25, key liên tục T173–T197.
- Tên spec trong DoD khớp key trả về; đọc lại body trả về của cả 25: không mất đoạn do ký tự nhọn.
- AC-H1–H35 đều có ticket đóng: H1–H7 T176, T196; H8–H10 T187; H11, H12 T188, T189; H13, H14 T190; H15–H17 T140; H18–H20 T151; H21–H23 T159; H24, H25 T122; H26, H27 T192; H28 T181, T196; H29 T196; H30, H31 T177, T196; H32, H35 T196; H33 T193; H34 T177.
- Mọi task dev 3–6 point, 1 phía. blocked_by chỉ dùng key, không có T167, T168, T169.
- Không chạy theme check, playwright, lhci vì không đổi code. 0 file ngoài `drafts/techlead/ES1-T170/`, ngoài memory của agent.
