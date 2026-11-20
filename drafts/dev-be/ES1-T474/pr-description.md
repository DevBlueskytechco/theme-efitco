KHÔNG CHẮC: trần byte contact-form.js chưa chốt (ticket: "Tech Lead chốt"), tạm 6 144 B; BE chạm thuộc tính thẻ form FE (data-lazy-module, data-lazy-on) và assertion tĩnh ES1-T383 — hỏi ở ES1-T512. Playwright, Lighthouse chờ CI.

# ES1-T474: TE-21 BE — form liên hệ: lỗi khi rời trường, tóm tắt nhận focus, aria-busy + readonly khi gửi

Phần JS của TE-21 AC4, AC5 (docs/ui-spec/page.md §6 S2–S4). Hook từ ES1-T383 (blocks/contact-form.liquid), không đổi markup/testid.

## Thay đổi
- `assets/contact-form.js` (mới, 5 404 B): ủy quyền trên document (block render lại trong editor không cần dọn).
  - Rời trường sai (`focusout`): bỏ hidden `#<id>Error`, `aria-invalid="true"`, thêm id lỗi vào `aria-describedby` (giữ id khác, textarea giữ `ContactBodyHint` đứng đầu). Gõ đúng lại (`input`) gỡ ngay; lỗi mới chờ blur.
  - Sai = rỗng sau trim hoặc `validity` không hợp lệ (email).
  - Gửi có lỗi: nghe `invalid` (capture) của kiểm tra gốc trình duyệt, `preventDefault` bỏ bong bóng native, cập nhật mọi trường + tóm tắt (mục `li[data-contact-summary-for]`, tiêu đề từ `data-label-{n}`), bỏ hidden, focus tóm tắt. Toàn khoảng trắng (qua `required`) chặn ở `submit`. Tóm tắt đang mở thì đồng bộ mục khi sửa từng trường; hết lỗi thì ẩn.
  - Không đặt `novalidate`: không JS / module chưa nạp vẫn có kiểm tra gốc. Form có `noValidate` (vd ES1-T386 TC-10) thì để Shopify kiểm.
  - Gửi hợp lệ: nút `aria-busy="true"` (spinner `.button[aria-busy='true']`, giữ bề rộng), input/textarea `readOnly` (vẫn được gửi), live region = `data-label-sending`. Bấm/Enter lần 2 khi đang gửi bị chặn (`e.submitter`); `requestSubmit()` không submitter (hCaptcha) vẫn đi. `pageshow` persisted (bfcache) trả form về bình thường.
  - Module nạp trễ: trường đã rời với giá trị sai (không phải trường đang focus) hiện lỗi khi module chạy.
  - Tải lại sau gửi: focus `.contact-form__status` hoặc tóm tắt đang hiện; không autofocus; bỏ qua khi `Shopify.designMode` hoặc người dùng đã focus chỗ khác.
- `blocks/contact-form.liquid`: `data-lazy-module` (asset_url contact-form.js) + `data-lazy-on: 'interaction'` trên `{% form %}`; `<script type="module">` contact-form.js nạp ngay trong nhánh `posted_successfully?` và khi `field_error_count > 0` (cần cho mục 4, `{% form %}` không đổi được thuộc tính theo form.errors); 1 `lazy-module.js` sau endform; sửa dòng {% doc %} "not loaded yet". Cùng URL nên module chỉ chạy 1 lần.
- `tests/e2e/ES1-T383.spec.ts`: dòng cấm `<script` → chỉ cho phép script src lazy-module.js / contact-form.js (vẫn cấm autofocus, novalidate).
- `tests/e2e/ES1-T474.spec.ts` (mới): tĩnh (byte, hook, số thẻ script, vị trí), trang giả page.route (TC-01..13), storefront (TC-S1 lỗi + focus tóm tắt, TC-S2 aria-busy/readonly/live với POST bị giữ, không gửi thư thật).

## Ngân sách JS (wc -c)
| File | B |
| --- | --- |
| contact-form.js (mới, lười: tương tác; ngay khi lỗi trường/thành công) | 5 404 (≤ 8 192; trần đề xuất 6 144) |
| lazy-module.js (không đổi) | 765 (≤ 768) |

Trang contact: chung (standard-events 888 + motion 6 129 + header-menu 3 058 + header-sticky 1 680 + cart-drawer 3 910 + modal-dialog 2 039 + page-layers 2 031 + search-loader 256) = 19 991; tải sẵn = 19 991 + 765 = 20 756 ≤ 40 960. Sau tương tác / trạng thái lỗi, thành công: 26 160.

## Cho QA / FE
- ES1-T386 TC-11, TC-12 (focus), TC-14: gỡ fixme "chờ ES1-T474" sau merge. TC-11 nên chờ contact-form.js tải (focus trường rồi chờ response) trước khi Tab.
- ES1-T386 TC-10 đặt `noValidate` → module không chặn, vẫn POST.
- Không thêm chuỗi locale, setting.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi; không cảnh báo mới ở file chạm (22 cảnh báo có sẵn ở file khác).
- `wc -c assets/contact-form.js` = 5 404 ≤ 8 192; không console, fetch, style inline, import tĩnh.
- Locale: không đổi.
- Playwright (ES1-T474, ES1-T383, ES1-T386), Lighthouse contact: chờ CI. `node --check` không chạy được trong phiên (cần duyệt), đã rà tay.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
