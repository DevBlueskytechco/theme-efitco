KHÔNG CHẮC: workflow chưa chạy trên GitHub (sandbox không gọi được gh, docs.github.com). Chưa có bằng chứng DoD việc 4 (2 PR, PR sau pending). Hành vi concurrency và `concurrency` trên job gọi reusable workflow viết theo trí nhớ về doc GitHub, chưa đối chiếu. shellcheck không có local.

# ES1-T162

Việc 1, scripts/preview-push.sh
- `find_id` dùng `preview-id`. Theme cùng tên role live thì `::error::` kèm id, thoát 1, không gọi push/delete.
- Kiểm tra chạy trước nhánh dọn slot: nếu chỉ lọc role thì theme live bị coi là "chưa có theme", store đầy sẽ xoá preview khác rồi tạo theme mới.
- Đọc lại list trước mỗi lần thử push. Theme thành live giữa 2 lần thử thì dừng.
- Khoảng hở còn lại: theme thành live sau lần list cuối, trước lệnh push. Lúc đó chỉ còn CLI hỏi xác nhận chặn, như sự cố PR #88. Script không truyền cờ cho phép ghi live.
- Chọn theme xoá khi store đầy: đổi từ `role != live` sang chỉ unpublished/development, không phân biệt hoa thường.

Việc 2, scripts/shopify-cli.sh
- Lệnh mới `preview-id` và `live-theme-warn`. `theme-id` giữ nguyên.
- `preview-id` thoát 4 khi cùng tên có role live, main hoặc role trống. Role trống là quyết định thêm so với ticket: không xác nhận được thì không push. Role khác (vd demo) thì bỏ qua kèm warning và tạo theme mới, đúng ticket.
- Trùng tên vừa live vừa unpublished cũng dừng.

Việc 3, .github/workflows/ci.yml
- Bước `Cảnh báo live theme tên ai-*` ở job preview, trước push, `continue-on-error`. Không chặn PR khác.
- Thêm test preview-push và bước shellcheck vào job theme-check. Shellcheck chỉ báo, không chặn, vì script cũ chưa từng qua shellcheck.

Việc 4, concurrency
- Ticket đề xuất đặt group cho job e2e + lighthouse. Đặt thẳng lên từng job thì 4 shard + lighthouse cùng group sẽ tự xếp hàng và huỷ lẫn nhau, vì group chỉ giữ 1 chạy + 1 chờ.
- Nên tách lighthouse + 4 shard sang `.github/workflows/store-tests.yml` (nội dung job giữ nguyên), group `store-hoa-qua-e2e` đặt ở job gọi `store-tests` trong ci.yml. Cả cụm giữ store cho 1 PR.
- Check `lighthouse`, `e2e` vẫn ở ci.yml, tên không đổi. Thay đổi hành vi: check `lighthouse` giờ đỏ khi preview lỗi hoặc store-tests bị huỷ, trước đây là skipped khi preview lỗi.
- Tên job con đổi thành `store-tests / lighthouse`, `store-tests / e2e-desktop-1`... Chưa đối chiếu merge_pr.sh, dashboard (ngoài repo). Nếu chúng khớp job con theo tên thì cần sửa.
- Giới hạn: từ 3 PR cùng lúc thì PR đang chờ bị huỷ, check đỏ, phải chạy lại. Câu hỏi: ES1-T165. Runbook mục 9.
- PR chưa rebase lên commit này thì chưa vào hàng.

Tự kiểm tra
- `bash scripts/preview-push.test.sh`: pass=13 fail=0. Dùng shopify giả, so khớp từng lệnh gọi store, gồm JSON giả theme live tên ai-x.
- `bash scripts/shopify-cli.test.sh`: pass=47 fail=0.
- `node drafts/devops/ES1-T162/verify-workflows.js`: fail=0. Chỉ kiểm cú pháp YAML, tham chiếu needs/outputs, vị trí concurrency, không thay được run thật.
- `bash -n` 4 script: sạch.
- Grep diff: không có cờ cấm và không có từ publish đứng riêng trên dòng thêm. Hook no-live-push chặn lệnh grep có chuỗi cờ, nên đã lọc rộng theo `live`, `publish` rồi đọc từng dòng. Chỉ có `--unpublished` và role.

Orchestrator cần xác nhận khi có CI
1. Log bước `shellcheck scripts` ở PR này: sạch với 4 script đã sửa/thêm (DoD). Script cũ có cảnh báo thì không tính.
2. Workflow khởi động được. Nếu GitHub báo invalid workflow thì mọi PR dính; rollback bằng revert PR này.
3. DoD việc 4: push 2 PR cùng lúc, link run có `store-tests` PR sau ở trạng thái pending tới khi PR trước xong. Ghi link vào ticket.
4. Check `lighthouse`, `e2e` vẫn được merge_pr.sh và dashboard nhận.

PR #88 vẫn chờ CTO đưa theme đúng trở lại live. Theme 157463609441 không bị đụng.
