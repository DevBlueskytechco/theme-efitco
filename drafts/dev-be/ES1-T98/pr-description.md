KHÔNG CHẮC: (1) JS và spec chưa chạy lần nào: phiên agent không mở được trình duyệt, E2E, console, lhci chờ CI. Chưa đối chiếu được với thư viện thật. (2) Hỏi CTO ở ES1-T164, không chặn PR, đang theo mặc định: shape trả về của `getCart` (qua `createCartFromAjaxResponse`, thư viện lỗi thì JSON `/cart.js` thô) và `getCart` có `.configure` không (gọi có guard); `lines[].id` là line key Ajax, không phải GID, remove gửi quantity 0; `defaultHandler()` của `updateCart` chỉ áp thay đổi, không reload; thời điểm có `Shopify.actions` (thử ngay, sau khi nạp thư viện, ở window load). Sai mặc định thời điểm thì mọi test cần `data-actions` fail, sai reload thì test `stayed` fail. (3) Nhánh 4xx trả `cart: null` theo chữ ticket; ES1-T85 cho phép trả giỏ hiện tại hoặc null.

# ES1-T98 TE-5-BE3: override Shopify.actions + shopify:cart:lines-update khi đổi số lượng và xoá

## Thay đổi
- `assets/cart-drawer.js` (4085/4096 B): `Shopify.actions.<action>.configure({ handler })` theo ES1-T91 #1, không gán đè. Chỉ 3 action.
  - `openCart`: `data-mode` drawer → refresh partial rồi mở, URL không đổi, lỗi refresh → sang cart; có `.cart-page` → focus h1; còn lại → `data-cart-url`.
  - `getCart`: luôn `GET {data-cart-url}.js`, `cache: no-store`, không giữ bản client.
  - `updateCart`: `await defaultHandler()` rồi refresh partial, trả nguyên kết quả. Không dispatch thêm (ES1-T83). Không mở drawer: mở là việc của `openCart`.
  - `refresh()` dùng chung cho mọi trang: tên partial lấy từ `data-partials` của `cart-items`; page mode ngoài /cart không có `cart-items` thì chỉ `cart-count`.
  - JS đặt `data-actions` trên `cart-drawer` sau khi configure xong, để E2E chờ. Không đổi markup.
- `assets/cart-items.js` (5625/5632 B): dispatch `CartLinesUpdateEvent` từ `cart-items` trước POST `change.js`. `action` update/remove (nhập 0 tính là remove), `context` dialog/cart, `lines: [{ id: key, quantity }]`. Promise chỉ resolve: thành công `createCartFromAjaxResponse(response)`, lỗi `cart: null` + `userErrors`. Mỗi POST 1 event; debounce và hàng đợi gộp thì gộp luôn event.
- `tests/e2e/ES1-T98.spec.ts` (mới): contract + AC7.
- `tests/e2e/ES1-T96.spec.ts`, `ES1-T97.spec.ts`: nâng trần 4096 và 5632 theo D10; contract tên partial của T96 đổi theo `data-partials`.

## Quyết định ngoài chữ ticket
- `cart-items.js` không chờ thư viện khi ghi: thư viện chưa nạp xong thì bỏ event, POST vẫn chạy. Khác `product-form.js` (chờ tối đa 500 ms), đổi để vừa trần byte. Khách đổi số lượng ở /cart trước khi thư viện nạp xong sẽ không có event.
- `aria-busy` của `cart-items` đổi sang `this.ariaBusy`, cùng cách với `cart-drawer`, để lấy chỗ. `res.json()` chuyển vào `try` có sẵn, cùng lý do: body không phải JSON vẫn rơi vào nhánh lỗi; body JSON `null` thì ném, `run()` bắt và báo `data-label-error`.
- `restore()` dùng `matches("body *")` để loại cả phần tử đã gỡ lẫn `body` khi `openCart` gọi lúc không có focus.

## Giới hạn do trần byte (đã bỏ khỏi bản nháp)
- Không cấu hình `eventTarget`: event của `updateCart` đi theo mặc định của thư viện, chưa biết phần tử nào; listener trên document được giả định vẫn nhận (spec kiểm). Docs có ví dụ trỏ `product-form`/`cart-drawer`.
- `openCart` rồi `updateCart` ngay khi partial của `openCart` chưa về: refresh sau huỷ refresh trước, drawer không mở. Gọi `await updateCart` rồi `openCart` thì đúng.
- `updateCart` refresh partial lỗi: nuốt lỗi, giao diện cũ tới lần refresh sau, không reload. Giỏ vẫn đổi đúng và kết quả vẫn trả về.
- `getCart` không kiểm `res.ok`: body không phải JSON thì promise reject; 4xx có JSON sẽ đi vào `createCartFromAjaxResponse`.
- `updateCart` ở /cart khi khách đang gõ ô số lượng chưa commit: ô bị gán lại theo server. Refresh của `updateCart` cũng không phối hợp với hàng đợi ghi của `cart-items`.
- Rút comment cũ ở 2 file để lấy chỗ (Enter, live iterator, focus, Safari); hành vi không đổi. Cả 2 file gần sát trần, thêm logic phải gỡ bớt hoặc xin nâng trần.

## Việc tồn từ ES1-T97
- Cả ES1-T96 và ES1-T97 đã vào develop nên ngoại lệ `cart-items.js` trong `ITEMS_ASSET` (`tests/e2e/ES1-T96.spec.ts`) và consoleGuard `tests/e2e/TE-4.spec.ts` gỡ được. Chưa gỡ ở PR này vì ngoài phạm vi.

## Ngân sách JS (D10, `wc -c`)
| Trang | Tổng (B) | Trần 40 960 |
| --- | --- | --- |
| Sản phẩm | 40 629 | còn 331 |
| Trang chủ | 32 207 | còn 8 753 |
| Cart | 19 140 | còn 21 820 |

## Tự kiểm tra
- `wc -c`: cart-drawer.js 4085 ≤ 4096, cart-items.js 5625 ≤ 5632.
- `shopify theme check`: 67 file, 0 lỗi. `node --check` JS và `node --experimental-strip-types --check` 3 spec: ok.
- Không đổi locale, không đổi markup.
- Playwright `tests/e2e/ES1-T98.spec.ts -g "AC7"` desktop + Pixel 7, hồi quy ES1-T85, T96, T97, TE-4, console, pageerror, lhci: chờ CI.
- Test `cart_type` page thật skip khi preview không đặt `EXPECT_CART_TYPE=page`; nhánh page ở preview drawer kiểm bằng flip `data-mode`.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
