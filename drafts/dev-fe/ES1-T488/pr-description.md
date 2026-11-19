KHÔNG CHẮC: bộ kiến thức FE (03, 09) cấm `autofocus`; SRS TE-21 AC11 + password.md §5 S1 yêu cầu focus vào ô sau khi tải lại, chạy cả không JS. Theo thứ tự nguồn (SRS/ui-spec > bộ kiến thức) dùng `autofocus` chỉ khi `form.errors`, đúng gợi ý của ticket. Lệnh cấm autofocus của 404.md và spec ES1-T384 chỉ áp cho `blocks/not-found.liquid`.

# ES1-T488 — password: focus vào ô mật khẩu khi nhập sai (TE-21 AC11, bug ES1-T386-B03)

## Thay đổi
- `blocks/password-hero.liquid`: `#PasswordInput` thêm `autofocus` trong nhánh `{% if form.errors %}` (cùng `aria-invalid`, `aria-describedby="PasswordError"`). `<details>` đã mở sẵn khi lỗi nên trình duyệt focus được ô, không cần JS.
- `{% doc %}` ghi lại hành vi.
- Lần tải đầu, nhập đúng, lỗi form newsletter (form object riêng): không có autofocus. Trang chỉ có 1 phần tử `autofocus` (layout/password không render predictive-search).
- Không đổi CSS, locale, JS.

## Việc cho QA
- `tests/e2e/ES1-T386.spec.ts` TC-32 đang có `test.fail(true, 'ES1-T488 …')`. Sau PR này test pass, nên `test.fail` sẽ báo đỏ: QA bỏ dòng `test.fail` (PR #254 / ES1-T386). FE không sửa spec của QA.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi (22 cảnh báo có sẵn ở file khác, password-hero không có cảnh báo).
- Không có file JS trong diff.
- Spec tĩnh ES1-T384 (password-hero, not-found): regex `form.errors or show_newsletter == false %}\s*open` không đổi; `not.toMatch(/autofocus/)` chỉ quét not-found.liquid.
- Preview, Playwright TC-31/TC-32 (cần store bật mật khẩu), Lighthouse password desktop/mobile: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
