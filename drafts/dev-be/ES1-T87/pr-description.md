KHÔNG CHẮC: E2E chưa chạy (sandbox agent không mở được trình duyệt) — chờ CI. Nguyên nhân suy từ code + spec ES1-T66:218, chưa xem trace CI #70.

# ES1-T87 Bug TE-4 (CI #70): partial fetch lỗi/abort thì nút Add to cart kẹt disabled

## Nguyên nhân
`selectOptions()` trong spec click từng option. Khi bước giữa rơi vào tổ hợp không tồn tại, `unavailable()` đặt nút add disabled + nhãn Unavailable, tồn kho `data-state="unavailable"`. Bước cuối ra variant hợp lệ → `update()` fetch partial; request bị `route.abort()` → catch rỗng giữ nguyên DOM → nút kẹt ở trạng thái Unavailable của bước giữa (disabled=true, trước đó false).

## Thay đổi
- `assets/product-variant-picker.js`:
  - `save()`: lưu nút `button[name="add"]` thuộc form (chính + sticky) và `.product-form__inventory`: `disabled`, `data-state`, `innerHTML`. Gọi lúc `connectedCallback` và sau mỗi `partials.apply` thành công → luôn là trạng thái server render cuối cùng, khớp với giá/partial đang hiển thị.
  - `restore()`: ghi lại các giá trị trên. Gọi trong catch của `update()` khi `!controller.signal.aborted` — tức lỗi mạng/HTTP/apply. Tự huỷ (request mới hoặc `unavailable()` gọi `abort()`) thì không khôi phục: bên huỷ đang sở hữu UI.
  - `aria-busy`: không đổi, `finally` gỡ khi controller còn là controller hiện tại; `unavailable()` chỉ abort không thay controller nên vẫn gỡ.
  - Helper `buttons()` dùng chung cho `unavailable()`/`save()`; `this.inv` thay cho 2 lần `querySelector(INVENTORY)`. Rút gọn comment để giữ ≤ 7 168 B.
- `tests/e2e/ES1-T87.spec.ts` (mới): tĩnh (catch → restore khi không tự huỷ, save sau apply + lúc connect, ≤ 7 168 B); abort sau khi đi qua tổ hợp không tồn tại → nút/sticky/tồn kho bằng trạng thái lúc load; abort trực tiếp sang variant khác trạng thái → giữ trạng thái cũ, aria-busy gỡ; fetch đang trễ bị tổ hợp không tồn tại huỷ → vẫn Unavailable (không khôi phục nhầm). Mọi test 0 console error (bỏ log mạng "Failed to load resource").

## Hành vi sau lỗi
Radio, `?variant=` và hidden `id` theo lựa chọn mới; giá, nút, tồn kho giữ lần render cuối (giống test ES1-T66 "nút giữ trạng thái cũ"). Nếu nút đang enabled mà variant mới hết hàng, submit trả 422 → product-form.js hiện lỗi trong role=alert. Không thêm thông báo lỗi riêng cho fetch (chưa có chuỗi locale/SRS cho trường hợp này).

## Ngân sách
`product-variant-picker.js` 7 023 → 7 156 B (≤ 7 168 theo ES1-T66, ≤ 8 192).

## Tự kiểm tra
- `shopify theme check`: 50 file, 0 offense.
- `node --check assets/product-variant-picker.js` ok; `node --experimental-strip-types --check tests/e2e/ES1-T87.spec.ts` ok.
- Regex tĩnh ES1-T66 (REGIONS contract, URL CDN, `partials.fetch(...REGIONS,`, không Shopify.actions) và ES1-T87 chạy bằng node trên file mới: pass.
- E2E desktop + mobile (`npx playwright test tests/e2e/ES1-T87.spec.ts tests/e2e/ES1-T66.spec.ts`), console error, Lighthouse: chờ CI.

## Rủi ro
- `partials.apply` lỗi giữa chừng sau khi đã thay một phần DOM: restore ghi vào phần tử cũ đã tách khỏi DOM, phần mới giữ nội dung server → không sai trạng thái, chỉ có thể lệch giữa các region.
- Restore trong lúc product-form.js đang lock submit có thể bỏ disabled tạm; `lock(false)` sau đó đặt lại theo `was`. Ca hiếm (đổi variant giữa lúc thêm giỏ).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
