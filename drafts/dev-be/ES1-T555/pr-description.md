KHÔNG CHẮC: không import được loading-delay.js giữa module theme (ES1-T81, ES1-T485 AC2, test tĩnh T443/T474/T473/T149/T96–T98/T370), nên dùng global `window.busyLater` do loading-delay.js gắn; file phải được nạp bằng thẻ script ở layout/theme.liquid + layout/password.liquid, dev-be không ghi được layout/ → hỏi ES1-T597. Chưa có thẻ script thì không spinner/skeleton (khoá lặp vẫn chạy) và nhóm test "layout" của ES1-T555 đỏ.

# ES1-T555: một hằng LOADING_DELAY_MS = 500 cho chỉ báo tải

Nguồn: foundation.md §18, §18.1; docs/tokens.json `loading.indicator_delay_ms`; kit.css `.button[aria-busy]`, `.quantity[aria-busy]`, `.stock-line[aria-busy]`; notes ES1-T567 mục 3 dòng 22.

## Hành vi
- 0–500 ms: khoá lặp bằng cờ JS + `aria-disabled="true"` (giữ nhãn, bề rộng, focus; không dùng `disabled` nên nút không mờ, focus không rơi về body). Không `aria-busy`.
- Sau 500 ms: `aria-busy="true"` → CSS có sẵn hiện spinner 20 trong nút, skeleton giá + "Checking availability…" spinner 12.
- Xong (thành công, lỗi, huỷ, bfcache): huỷ hẹn giờ, gỡ `aria-busy`, gỡ `aria-disabled` (product-form trả lại giá trị trước khi khoá).

## File
| File | Đổi | Byte trước → sau |
| --- | --- | --- |
| assets/loading-delay.js (mới) | `export const LOADING_DELAY_MS = 500`; `busyLater(...els)` gắn aria-busy sau ngưỡng, trả hàm huỷ (clearTimeout + gỡ aria-busy); `window.busyLater ||= busyLater` | — → 476 |
| assets/product-form.js | lock: aria-disabled ngay cho nút Add to cart PDP + sticky bar (cùng form), spinner sau ngưỡng; bỏ `disabled` | 6 867 → 6 896 |
| assets/bundle-form.js | lock: cờ `busy` + aria-disabled; spinner sau ngưỡng; chặn gửi lặp bằng cờ thay `btn.disabled` | 5 491 → 5 532 |
| assets/contact-form.js | Send message: aria-disabled ngay, spinner sau ngưỡng (WeakMap hàm huỷ theo form); chặn lặp đọc aria-disabled | 5 950 → 6 072 |
| assets/article-comments.js | Post comment: aria-disabled sau listener khác (captcha), spinner sau ngưỡng; bfcache huỷ hẹn giờ, gỡ cả hai | 1 294 → 1 424 |
| assets/password-page.js | Submitter aria-disabled ngay, spinner sau ngưỡng; bfcache huỷ hẹn giờ, gỡ `[aria-busy],[aria-disabled]` | 1 014 → 1 084 |
| assets/product-variant-picker.js | Nút mua aria-disabled + host product-form aria-busy ngay (giữ hợp đồng ES1-T347, chỉ con trỏ progress); `[data-variant-busy]` (giá, giá sticky, dòng tồn) aria-busy sau ngưỡng; đổi nhanh giữ một hẹn giờ (`||=`), huỷ ở finally của request cuối | 7 130 → 7 282 |
| assets/cart-items.js | Dòng đang ghi: −/+/xoá + Checkout aria-disabled ngay (Map `held`), `li[data-line-key]` aria-busy sau ngưỡng; finally huỷ mọi hẹn giờ; debounce 300 giữ | 7 166 → 7 446 |
| tests/e2e/ES1-T555.spec.ts (mới) | tĩnh AC1, AC5, layout; fixture PDP/sticky, variant, dòng giỏ | — |

Không đổi: debounce 300 (predictive-search, cart-items), collection-filters (aria-busy lưới ngay, §18.1), quiz-finder/quiz-dialog, slideshow 300. `500` còn ở product-form.js:62 và bundle-form.js:88 là hạn chờ thư viện standard-events, không phải chỉ báo tải. CSS không có `animation-delay` 300 cho skeleton (grep 0).

## Cần FE / Orchestrator (ES1-T597)
- Thêm `<script src="{{ 'loading-delay.js' | asset_url }}" type="module"></script>` cuối `<body>` của layout/theme.liquid (sau modal-dialog.js) và layout/password.liquid. Test ES1-T555 "layout" kiểm đúng 1 thẻ mỗi file.
- CSS spinner dòng giỏ theo kit `.quantity[aria-busy]`: theme chưa có rule cho `.cart-line[aria-busy='true']` → sau 500 ms có aria-busy nhưng chưa thấy spinner trong stepper.

## Ngân sách JS (wc -c)
- loading-delay.js 476 ≤ 512; picker 7 282 ≤ 7 600; cart-items 7 446 ≤ 7 600; mọi file ≤ 8 192 (lớn nhất collection-filters 8 183, không chạm).
- Chung mọi trang (layout + header + cart drawer): 888 + 6 129 + 2 031 + 2 039 + 3 058 + 1 680 + 3 910 = 19 735 trên develop → 20 211 khi thêm loading-delay.js (trần ADR 0010 19 456; vượt có từ trước, +476 do PR này).
- PDP tải sẵn: +476 + 29 + 152 = +657. Cart: +476 + 280 = +756. Contact: +476 + 122. Bài viết: +476 + 130. Password: +476 + 70. Trang có bundle: +476 + 41.

## Test cũ đổi theo hành vi mới (QA ES1-T582, đã comment)
- Trần byte: T87 (picker ≤ 7 168), T97/T98/T370 (cart-items ≤ 7 168), T149 (bundle-form ≤ 5 504), T443 (password-page ≤ 1 024) đỏ; AC5 ES1-T555 cho picker/cart-items ≤ 7 600, còn lại ≤ 8 192.
- ES1-T443 TC-12 đọc aria-busy đồng bộ lúc submit → nay `null` (khoá là aria-disabled).
- Test giữ request (T347, T370 AC18, T474 TC-06/07/S2, T473, T149 AC3, T97, TE-5) vẫn xanh: aria-busy tới sau 500 ms, `toHaveAttribute` tự chờ; Playwright coi aria-disabled là disabled nên `toBeDisabled/toBeEnabled` giữ nghĩa.

## Tự kiểm tra
- `git grep --untracked -n 'LOADING_DELAY_MS = 500' -- assets` = 1 dòng (assets/loading-delay.js:4).
- `shopify theme check`: 0 lỗi (9 warning có sẵn ở quiz-step, templates/index*, không liên quan).
- `wc -c assets/*.js`: như bảng trên.
- Playwright tests/e2e/ES1-T555.spec.ts, T474, T473, T347 (ES1-T349): chờ CI (phiên này không có trình duyệt, node_modules; node --check cũng không chạy được).
- Lighthouse, console 360/1280, video PDP thêm giỏ Slow 3G: chờ CI / preview sau khi Orchestrator push và có thẻ script layout.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
