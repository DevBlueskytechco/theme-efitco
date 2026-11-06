# ES1-T163 — AC quy đổi từ ticket
Ticket không đánh số AC và không thuộc AC nào của TE-10 trong docs/srs.md, nên QA đánh số theo mục Việc và DoD để chạy ac_coverage.

- AC1 (Việc 1) Given Cart API trả 429 When spec gọi cartApi Then đọc Retry-After (giây, mặc định 2), chờ tối đa 2 lần, tổng chờ ≤ 15 s; hết lượt mới skip với lý do "429 sau N lần thử: path".
- AC2 (Việc 2) Given các spec ES1-T94, ES1-T95, ES1-T96, ES1-T97, TE-1, TE-4 When gọi Cart API Then đi qua helper, không request.get/post thẳng.
- AC3 (Việc 3) Given log CI When chạy scripts/e2e-429-count.sh Then in số lần 429 và số skip do 429 của từng shard.
- AC4 (Việc 4) Given CONVENTION.md mục Test When đọc Then có 1 dòng yêu cầu gọi Cart API qua cartApi.
- AC5 (DoD) Given preview PR #92 When npx playwright test -g "ES1-T96" Then ≥ 15/19 test chạy thật ở ít nhất 1 project.
- AC6 (DoD) Given repo When tsc --noEmit Then sạch.
- AC7 (DoD) Given tests/e2e/*.spec.ts When grep "/cart/.*\.js" Then không còn dòng nào ngoài helper.
