KHÔNG CHẮC: chưa chạy trên store/CI (sandbox không gọi được store, api.github.com bị từ chối). Chưa đạt DoD "CI 9/9 xanh 2 lần" và chưa có số skip sau. Giả thuyết "fetch trong trang hết 429" chưa được xác nhận.

# ES1-T100: e2e đọc sản phẩm/giỏ từ trang

## Áp dụng (Orchestrator)
scope-guard chặn devops ghi `tests/` và `CONVENTION.md`, nên code nằm ở đây dưới dạng patch.

    git apply drafts/devops/ES1-T100/ES1-T100-tests.patch
    git apply drafts/devops/ES1-T100/ES1-T100-convention.patch   # file của Tech Lead, cần duyệt (xem ticket question)

- `scripts/e2e-429-count.sh`, `scripts/e2e-429-count.test.sh` đã ở đúng chỗ, commit luôn.
- KHÔNG commit `test-results/` ở gốc repo: rác từ lần chạy local, `rm -rf` bị từ chối nên chưa xoá được, và thư mục này chưa nằm trong `.gitignore`.
- KHÔNG commit script/overlay trong thư mục này vào theme: chỉ là nguồn tạo patch.

## Sau khi áp: đo trên CI
Chạy 2 lần, rồi dán bảng vào PR:

    scripts/e2e-429-count.sh <run-id-1> <run-id-2>

| | T94 skip do 429 | TE-4 skip do 429 | Nguồn |
| --- | --- | --- | --- |
| Trước | 9/12 test (PR #81) | ~25-42 test/runner | Body ticket, chưa tự đo lại |
| Sau | chưa đo | chưa đo | Chờ CI |
| Mục tiêu | 0 | 0 | Ticket |

Chưa đọc được log CI cũ (`gh` bị từ chối), nên số "trước" lấy theo ticket. Spec cũ chỉ gọi `test.skip`, không tự in log; helper mới in `[ES1-T100] Shopify trả 429 ...` để số "sau" đếm được bằng script. Muốn so cùng thước đo thì chạy script trên run của PR #81 và xem có ra số khớp ticket không.

## Đã đổi
| File | Thay đổi |
| --- | --- |
| `tests/e2e/support/product-data.ts` (mới) | `pageJson` (fetch trong trang, thử lại 4 lần, trang chưa mở thì getJson), `requireJson` (429 skip + log), `embeddedProduct`, `productData`, `productDataNoScript`, `readCartJson`, `readCartNoScript` |
| `tests/e2e/ES1-T100.spec.ts` (mới) | 10 test helper trên server 127.0.0.1, không gọi store; có test chặn `request.get` thẳng `/products` |
| `TE-4.spec.ts` | `productJs`, `cartItems` qua helper; nhóm nojs đọc variant-json và giỏ qua context phụ |
| `ES1-T94.spec.ts` | `addToCart` mở trang sản phẩm rồi đọc từ trang; nojs dùng hàm NoScript |
| `TE-3.spec.ts` | `inPageJson` có thử lại, `productJs` skip có lý do khi 429; TC-34 đổi `request.get` sang `getJson(..., 1)` |
| `TE-1.spec.ts` | `findProduct` fetch trong trang (ngoài danh sách ticket, cùng lỗi 429: nó trả null nên test skip nhầm thành "không có sản phẩm") |
| `CONVENTION.md` | 1 dòng ở mục Test |

Không đổi: `ci.yml`, shard, required_checks, workers 1, `http.ts`.

## Rủi ro, cần xem khi đọc CI
1. Thêm tải HTML: T94 mỗi lần thêm giỏ tải thêm 1 trang sản phẩm; mỗi lần đọc giỏ ở nojs tải thêm `/cart` trong context phụ. Nếu store giới hạn theo IP chứ không theo loại client thì số 429 có thể không giảm.
2. `readCartNoScript` chép cookie sang context mới. Đã kiểm với cookie giả trên server cục bộ, chưa kiểm với cookie `cart` thật và `preview_theme_id` của Shopify.
3. Sản phẩm 1 variant không có JSON nhúng (`has_variant_choice`). Ở nojs T94, `TE4_VARIANTS_HANDLE` trống thì `TE4_SINGLE_HANDLE` vẫn đi qua getJson và có thể gặp 429.
4. POST giỏ (`/cart/add.js`, `clear.js`, `update.js`) vẫn qua `page.request`, ticket chỉ nói đọc. Nếu CI thấy các POST này 429 thì cần ticket riêng.
5. TC-34 giữ 1 lệnh gọi APIRequestContext có chủ đích (chẩn đoán so in-page với request), không skip, 429 chỉ ghi "lỗi".
6. `ES1-T67`, `ES1-T68` còn import `getJson` không dùng, không gọi storefront, không sửa.

## Tự kiểm tra
- Helper: 10 passed + 1 skipped đúng lý do (`local-skip-check.spec.ts`), Chromium thật, server 127.0.0.1, project desktop.
- `scripts/e2e-429-count.test.sh`: OK.
- `build-patch.sh`: patch `git apply --check` đạt; bản sạch `playwright --list` bằng config thật: 297 test/18 file (desktop).
- DoD grep `request.get(\`/products`: 0 dòng trên bản đã áp.
- Chưa type-check: repo không có typescript. TE-1/TE-3/TE-4/T94 mới qua parse, chưa chạy trên store.
