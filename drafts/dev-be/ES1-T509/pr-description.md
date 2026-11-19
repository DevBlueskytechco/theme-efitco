KHÔNG CHẮC: chưa chạy Playwright (lượt agent không có trình duyệt/preview/mạng) — chờ CI xác nhận ES1-T330 TC-04 xanh.

# ES1-T509 fix(header-menu): bấm trigger huỷ timer hover, không mở lại mega vừa đóng

Bug ES1-T330-B02, develop đỏ ES1-T330 TC-04 (dòng 325).

## Nguyên nhân
`toggle.click()` của Playwright rê chuột tới trigger → `pointerover` (mouse) → `hover()` đặt timer 150 ms `d.open = true`. Bấm lần 1 mở panel ngay (native `<details>`), lần 2 bấm trong < 150 ms đóng panel, rồi timer còn treo mở lại → `aria-expanded="true"`, panel visible.

## Sửa (assets/header-menu.js)
- `click` trên nav: `clearTimeout(this.t)` — mọi lần bấm summary (chuột, Enter/Space) huỷ ý định hover đang treo.
- Bấm đóng một mục (trước bấm `d.open` true, không phải scrim): ghi `this.x = d`; `hover()` bỏ qua `d == this.x` → rê qua chữ/chevron trong trigger không mở lại panel vừa đóng. `x` được xoá khi hover mục khác, mục không con, scrim hoặc rời header.
- Bấm scrim không ghi `x` → bấm scrim đóng rồi rê lại trigger vẫn mở bằng hover.
- Rút gọn comment để giữ trần byte.
- Đã biết: sau khi bấm đóng, rê sang logo/icon (vẫn trong header, ngoài mục menu) rồi quay lại trigger thì chưa mở bằng hover; rê sang mục khác hoặc ra ngoài header thì hover chạy lại. Bấm trigger luôn chạy.

Không đổi markup FE, không đổi spec ES1-T330.

## Test
- Mới: `tests/e2e/ES1-T509.spec.ts`
  - tĩnh: header-menu.js ≤ 3 072 B, có huỷ timer khi click, không console, define có guard.
  - B-01 bấm 2 lần liền (< 150 ms, mouse down/up) → sau 400 ms vẫn đóng, 0 lỗi console.
  - B-02 hover mở → bấm đóng → rê trong trigger không mở lại; sang mục khác rồi quay lại thì hover mở.
  - B-03 bấm scrim đóng → hover trigger mở lại.
  - B-04 bấm mở một lần → sau 400 ms vẫn mở, Esc đóng.
- Hồi quy cần xanh: ES1-T330 (TC-04, TC-05 cảm ứng, TC-28 bấm lần lượt), ES1-T329, ES1-T16, ES1-T323, ES1-T482, ES1-T235, TE-1 TC-06..08.

## Ngân sách JS (ADR 0010)
| File | Trước | Sau | Trần |
|---|---|---|---|
| assets/header-menu.js | 3 068 B | 3 058 B | 3 072 B (ES1-T329), 8 192 B/file |

Tổng mọi trang giảm 10 B so với develop; không thêm file, không thêm thẻ script.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi (22 warning có sẵn, không thuộc file đã sửa).
- `wc -c assets/header-menu.js` = 3058.
- Không console.*, không fetch, không createElement; listener gắn `signal`, timer dọn ở disconnectedCallback.
- Playwright, Lighthouse, preview: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
