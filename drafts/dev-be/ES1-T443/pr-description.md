KHÔNG CHẮC: spec chưa chạy (phiên viết không có trình duyệt, preview, node_modules) → chờ CI. Test store ES1-T384 dòng 164 (`password-toggle` toBeHidden) sẽ fail khi có JS — đã tạo ES1-T513 cho FE sửa spec và `{% doc %}`. Ticket/SRS AC11 yêu cầu vừa `aria-pressed` vừa đổi nhãn Show/Hide: làm đúng ticket, dù mẫu ARIA thường chỉ dùng 1 trong 2.

# ES1-T443 (TE-21 AC11, password.md §5, §8): nút mắt "Show password" + aria-busy form trang password

## Thay đổi
- `assets/password-page.js` (mới, 1 014 B; trần password.md §8 ≤ 1 024):
  - Tải: gỡ `hidden` mọi `[data-password-toggle]`; lặp lại ở `shopify:section:load` (block render lại trong editor, script chèn lại không chạy).
  - Click ủy quyền trên window: input = `#<aria-controls>`; `password` ↔ `text`, `aria-pressed` false ↔ true, `aria-label` = `data-label-hide` / `data-label-show`. Thiếu nhãn: giữ nhãn cũ. Không có input: bỏ qua, không lỗi. Space/Enter là hành vi native của `<button type="button">`; focus giữ trên nút, giá trị ô giữ nguyên.
  - `submit` (chỉ khi form hợp lệ, trình duyệt đã chặn email sai/trống): `e.submitter` gắn `aria-busy="true"` → spinner `.button[aria-busy='true']` có sẵn ở base.css. Submit lần 2 khi đang busy: `preventDefault` (không gửi trùng). Áp cho `password-submit` và `password-newsletter-submit` (kể cả Enter trong ô).
  - `pageshow` persisted (quay lại từ bfcache): gỡ `aria-busy`, nút dùng lại được.
  - Không fetch, không import, không console, không style inline, không tạo element.
- `blocks/password-hero.liquid`: chỉ thêm `<script src="{{ 'password-page.js' | asset_url }}" type="module"></script>` cuối root. Không đổi markup khác. Layout, template password không thêm script.
- Không JS: nút mắt giữ `hidden` (markup FE), 2 form POST bình thường.
- `tests/e2e/ES1-T443.spec.ts` (mới).

## Byte (wc -c)
| File | B | Trần |
| --- | --- | --- |
| password-page.js (mới) | 1 014 | 1 024 (password.md §8), ≤ 8 192 |

Trang password tải sẵn: layout password không nạp JS theme → tổng = password-page 1 014 B ≤ 40 960. Không nạp lười.

## Test (tests/e2e/ES1-T443.spec.ts)
- Tĩnh (contract hook FE ES1-T384): JS ≤ 1 024 B, không console/fetch/import; block đúng 1 thẻ script `password-page.js`, nút mắt giữ `type="button"`, `aria-pressed="false"`, `aria-controls="PasswordInput"`, `data-label-show/hide`, `hidden`; testid 2 nút submit; layout/template không script; locale Show/Hide password; CSS spinner và `[hidden]` có sẵn.
- Trang giả (page.route, JS lấy từ repo): TC-01 nút hiện, ô password; TC-02 bấm/bấm lại đổi type, aria-pressed, tên; TC-03 bàn phím Tab/Space/Enter không submit; TC-04 thiếu nhãn không "undefined"; TC-05 aria-controls sai không lỗi; TC-06 aria-busy khi gửi, bấm lần 2 chỉ 1 POST; TC-07 Enter ô email → busy nút newsletter; TC-08 email sai/trống không busy, không POST; TC-09 pageshow persisted gỡ busy; TC-10 render lại + `shopify:section:load` hiện nút mới; TC-11 không JS: nút ẩn, form vẫn gửi.
- Storefront PREVIEW_URL /password (context chưa mở khoá, skip khi store không bật mật khẩu): TC-12 360px nút ≥ 44×44, đổi type/aria-pressed/tên, sai mật khẩu → aria-busy lúc gửi, trang lỗi không treo spinner, 0 lỗi console.

## Cho FE / QA
- ES1-T513 (dev-fe): sửa `tests/e2e/ES1-T384.spec.ts` dòng 164 (`toBeHidden` → `toBeVisible`) và dòng 27 `{% doc %}` "not loaded by this block".

## Tự kiểm tra
- `shopify theme check`: 0 lỗi (22 warning có sẵn ở 7 file khác, không ở file chạm).
- `wc -c assets/password-page.js` = 1 014 ≤ 1 024 ≤ 8 192.
- Locale: không đổi.
- Playwright, preview, Lighthouse (password không tính SEO, sổ 10/11; A11y/BP 100): chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
