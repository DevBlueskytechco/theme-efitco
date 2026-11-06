KHÔNG CHẮC: DoD ≥ 15/19 và tsc chưa kiểm được; TC-09, TC-11 chưa chạy. Chi tiết ở mục cuối.

# ES1-T163 — helper Cart API thử lại theo Retry-After khi 429
Nguồn: ticket ES1-T163, AC quy đổi ở ticket-ac.md. Spec: tests/e2e/ES1-T163.spec.ts. Không có Figma.

Kết quả: Đạt = đã chạy và pass trong phiên này. Chờ CI = chưa chạy được. Chờ merge = cần patch hoặc preview.

| ID | AC | Given | When | Then | Loại | Ưu tiên | Kết quả |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC-01 | AC1 | 429 một lần, Retry-After 1 | cartApi | chờ ≥ 0,9 s, gọi 2 lần, trả 200, không skip | [E2E] helper | P1 | Đạt |
| TC-02 | AC1 | 429 không có Retry-After | cartApi | chờ mặc định ≥ 1,9 s | [E2E] helper | P1 | Đạt |
| TC-03 | AC1, AC3 | 429 mọi lần, Retry-After 1 | cartApi | gọi 3 lần, chờ 2 lần, skip "429 sau 3 lần thử: path"; 3 dòng log "[cartApi] 429 lần", 1 dòng "trả 429" | [E2E] helper | P1 | Đạt |
| TC-04 | AC1 | 429 mọi lần, Retry-After 60 | cartApi | tổng chờ 15 s, không quá; skip "429 sau 2 lần thử: path" | [E2E] helper | P1 | Đạt |
| TC-05 | AC1 | Retry-After thiếu, rỗng, 0, âm, dạng ngày, Infinity; ngân sách còn ít hoặc hết | retryDelayMs | không hợp lệ → 2000 ms; luôn ≤ phần ngân sách còn lại | [E2E] helper | P2 | Đạt |
| TC-06 | AC1 | test timeout 1 s, Retry-After 2 | cartApi | test pass, thời gian chờ không tính vào timeout | [E2E] helper | P1 | Đạt |
| TC-07 | AC1 | status 422, 403, 500 | cartApi | trả response ngay, gọi 1 lần, không skip | [E2E] helper | P1 | Đạt |
| TC-08 | AC1 | /cart.js, /cart/clear.js, init.method, init.data | cartApi | mặc định GET hoặc POST, init.method được ưu tiên, lần thử lại gửi đúng data | [E2E] helper | P2 | Đạt |
| TC-09 | AC1 | truyền page có cookie cart | cartApi | request mang cookie của trang | [E2E] server cục bộ, Chromium | P1 | Chờ CI |
| TC-11 | AC1 | APIRequestContext thật, server trả 429 kèm Retry-After | cartApi | đọc được header, gửi lại đúng body JSON | [E2E] server cục bộ | P1 | Chờ CI |
| TC-12 | AC2 | spec trên develop: ES1-T67, T85, T94, T95, TE-1, TE-4 | npx playwright test --list | nạp đủ 724 test trong 23 file | Tĩnh | P1 | Đạt |
| TC-13 | AC2 | spec ES1-T96, ES1-T97 trên nhánh PR | áp dụng ES1-T96.spec.patch, ES1-T97.spec.patch | patch khớp, cú pháp đúng, grep rỗng (verify-patches.sh) | Tĩnh | P1 | Đạt trên bản sao; Chờ merge |
| TC-14 | AC3 | log có dòng cartApi và dòng skip cũ | scripts/e2e-429-count.test.sh | từng job đúng 2 cột số lần 429 và skip | Script | P2 | Đạt trên bản sao; Chờ merge |
| TC-15 | AC4 | CONVENTION.md mục Test | áp dụng scripts-convention.patch | có dòng cartApi | Tĩnh | P3 | Đạt trên bản sao; Chờ merge |
| TC-16 | AC5 | preview PR #92 đã có helper và patch | npx playwright test -g "ES1-T96" | ≥ 15/19 test chạy thật ở ít nhất 1 project; đọc thêm bảng e2e-429-count.sh | [E2E] store dev | P1 | Chờ merge |
| TC-17 | AC6 | repo | tsc --noEmit | sạch | Tĩnh | P2 | Không chạy được |
| TC-18 | AC7 | tests/e2e/*.spec.ts | grep -n "/cart/.*\.js" | rỗng | Tĩnh | P1 | Đạt trên develop; T96, T97 đạt sau patch |

## Case biên (ngoài AC)
- TC-10 mất mạng: lỗi kết nối được ném ra cho test fail, không bị skip nhầm thành 429. Đạt.
- Rỗng: Retry-After rỗng → TC-05. Tối đa: Retry-After 60 → TC-04.
- Mobile 360px, keyboard, screen reader, merchant chưa chọn resource: không áp dụng, ticket chỉ đổi helper test, không đổi UI.

## Dữ liệu test (hoa-qua-nhap-khau (efitco-ai-dev))
Spec ES1-T163 không gọi store. TC-16 dùng dữ liệu sẵn có của ES1-T96.spec.ts.

## Cách áp dụng phần QA không ghi được
1. Merge nhánh này, gồm tests/e2e/support/cart-api.ts.
2. scope-guard chặn QA ghi scripts/ và CONVENTION.md: `git apply drafts/qa/ES1-T163/scripts-convention.patch` trên nhánh này, trước khi commit.
3. ES1-T96.spec.ts, ES1-T97.spec.ts chỉ có trên nhánh PR #92, #93: rebase rồi `git apply` patch tương ứng trên nhánh đó.
4. Sinh lại patch nếu nhánh đổi: `python3 drafts/qa/ES1-T163/gen-patches.py`. Kiểm: `bash drafts/qa/ES1-T163/verify-patches.sh`. Chạy nhóm logic không cần store: `npx playwright test --config=drafts/qa/ES1-T163/pw.local.config.ts --project=desktop -g logic`.

## Quyết định cần review
- Retry-After 60 không làm bỏ qua ngay: chờ đủ 15 s, thử lại lần cuối rồi skip với N = 2. Lần thử này sớm hơn Retry-After, nên có thể vẫn 429.
- Thời gian chờ được cộng vào timeout của test. Nếu không, clear (15 s) + add (15 s) chạm 30 s và thành fail timeout thay vì skip.
- /cart.js đọc từ trang đang mở vẫn dùng readCartJson (fetch trong trang, ES1-T74, CONVENTION): chuyển sang cartApi có thể lệch market so với HTML. cartApi vẫn hỗ trợ /cart.js cho lời gọi ngoài trang; hiện chưa spec nào cần.
- Đổi hành vi: clear trước đây bỏ qua kết quả, nay hết lượt 429 thì test skip thay vì chạy tiếp trên giỏ bẩn. Chỉ lỗi 429 mới skip; status khác trả về như cũ.
- Hằng route mock và URL quan sát (CART_GLOB, CART.add) cũng chuyển sang helper để grep DoD sạch; hành vi mock không đổi.

## KHÔNG CHẮC
- TC-16 (DoD ≥ 15/19): chưa chạy. Không có preview, host store bị chặn trong phiên QA. Spec T96 cần rebase và patch trước. Nếu đợt 429 của store kéo dài hơn 15 s thì helper vẫn skip, DoD vẫn có thể không đạt; bảng e2e-429-count.sh sẽ cho thấy.
- TC-17: repo không có typescript trong node_modules, package-lock, và không có tsconfig; npm registry bị chặn. Mới kiểm nạp spec qua --list và cú pháp, chưa kiểm kiểu.
- TC-09, TC-11: sandbox cấm mở cổng cục bộ (listen EPERM), lần chạy ngoài sandbox bị từ chối; Chromium không mở được theo ghi nhận trước đó. Logic retry mới kiểm bằng APIRequestContext giả.
- Việc 3 chỉ in khi chạy script theo run id: ci.yml không gọi script, chưa tự in cuối mỗi shard. Nằm ngoài phạm vi QA.
- ES1-T147, ES1-T156 (nhánh chưa merge) còn `page.request.post` tới clear.js, ngoài danh sách ticket, chưa có patch.
