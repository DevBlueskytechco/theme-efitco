KHÔNG CHẮC: harness trình duyệt chưa chạy được trong phiên này (sandbox chặn Chrome và bind cổng; chạy ngoài sandbox bị từ chối). Cần chạy lại lệnh dưới trên máy/CI trước khi merge.

ES1-T446 — scripts/lhci-auth.js mở <details> trước khi điền mật khẩu

Thay đổi (scripts/lhci-auth.js)
- Sau khi tìm input[type=password]: duyệt mọi <details> tổ tiên của input, nếu đóng thì click <summary> con trực tiếp, vẫn đóng thì set open = true. Trang cũ không có <details> → vòng lặp không chạy, hành vi như cũ.
- Gửi form bằng input.form (fallback form[action*="password"] như cũ).
- Sau khi gửi mà vẫn ở /password → throw (sai STORE_PASSWORD hoặc form không gửi). Trước đây im lặng và Lighthouse đo nhầm trang password; giờ lhci fail rõ ràng.
- Lần chạy sau (cookie đã có) /password redirect về / → không có input → bỏ qua, như cũ.
- Không đổi biến môi trường (STORE_ORIGIN, STORE_PASSWORD), không đổi lighthouserc.json.

Phạm vi ảnh hưởng cổng merge
- Chỉ bước lhci (required check Lighthouse). Theme check, playwright, đo JS theo URL không đổi.
- Mới: mật khẩu sai làm lhci đỏ ngay ở bước auth thay vì ra điểm của trang password. Đây là lỗi cấu hình secret, không phải lỗi code theme.
- Merge cùng hoặc trước PR #208 (ES1-T384). tests/setup/password.ts thuộc ES1-T442 (QA), không sửa ở đây.

Tự kiểm tra
- node --check scripts/lhci-auth.js: OK.
- Harness: drafts/devops/ES1-T446/lhci-auth-harness.js giả lập /password bằng request interception (không mạng, không store), 4 ca: trang cũ/mới x mật khẩu đúng/sai.
  node drafts/devops/ES1-T446/lhci-auth-harness.js <path>/node_modules/puppeteer scripts/lhci-auth.js
  Kỳ vọng: 4 dòng PASS, exit 0. Chưa chạy được (xem dòng đầu).
