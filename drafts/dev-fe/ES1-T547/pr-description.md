KHÔNG CHẮC: `.rte td` dùng `overflow-wrap: anywhere` (ticket ghi `break-word` cho th, td). Lý do: `break-word` không giảm min-content của ô, URL / mã liền > 30 ký tự vẫn đẩy bảng rộng quá cột .rte → vỡ AC1 và DoD "30 ký tự không khoảng trắng phải xuống dòng". `anywhere` cho td lấy theo `.data-table--fluid td` của kit; th giữ `break-word` như kit.

# ES1-T547 FE (theo ES1-T567): bảng .rte không cuộn ngang khi ≤ 4 cột, .table-wrap cho bảng rộng

## Thay đổi
- `assets/base.css` (rule `.rte table`, ~4489):
  - Bỏ `display: block` + `overflow-x: auto` + `max-inline-size`; bảng giữ display table, `inline-size: 100%`, `border-collapse: collapse`, chữ `--font-size-sm` / `--line-height-sm` (14/20).
  - `.rte :is(th, td)`: đệm `--space-3` `--space-4` (12 / 16), chỉ `border-block-end: 1px --color-border` (bỏ viền 4 phía), `text-align: start`, `vertical-align: top`, `overflow-wrap: break-word`; `.rte td` `overflow-wrap: anywhere` (xem KHÔNG CHẮC).
  - `.rte th`: nền `--color-background-alt`, 600.
  - `.table-wrap` (mới, toàn cục như kit V46): `overflow-x: auto`, viền 1px `--color-border`, bo `--radius-card`.
  - `.rte .table-wrap table` `min-inline-size: 32rem`; `.rte .table-wrap tr:last-child > *` không viền đáy.
  - Doc đầu rule: bảng > 4 cột merchant bọc `<div class="table-wrap">` trong rich text.
- `tests/e2e/ES1-T547.spec.ts` (mới): tĩnh (fixture base.css ở 360 / 1280) cho AC1–AC3; store theo `TE547_ARTICLE_PATH`.
- `tests/e2e/ES1-T403.spec.ts`: assert cũ `display: block` / `overflow-x: auto` → `display: table` + bảng vừa cột .rte (ô 400 ký tự liền).
- `tests/e2e/ES1-T386.spec.ts` TC-04: không còn đòi mọi bảng có khung cuộn; bảng trong `.table-wrap` → wrap `overflow-x: auto`, bảng trần → rộng ≤ cột .rte.

Không Liquid, không JS, không token mới. Ngoài phạm vi theo ticket: `.data-table*` (Specifications PDP, volume pricing) → ES1-T573 / block tương ứng.

## Ghi chú
- `.table-wrap` cuộn: Chrome ≥ 130 tự cho scroller nhận focus bàn phím; merchant không thêm được `tabindex` trong RTE. Nếu axe báo `scrollable-region-focusable` trên trình duyệt cũ → BE cân nhắc gắn tabindex, không chặn ticket này.
- Merchant bọc bảng bằng HTML view của rich text editor; cần QA/BA thêm vào hướng dẫn merchant.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi (8 warning cũ ở quiz-step / index*.liquid, không liên quan).
- gzip base.css: chưa đo được trong phiên (lệnh cần quyền); thêm ~0,6 KB raw, ước ~37,3 KB gzip ≤ 49 152 — chờ CI.
- Literal: 0 màu / px rời mới ngoài `1px` viền và `32rem` (số kit); logical properties.
- Playwright tĩnh ES1-T547, ES1-T403, ES1-T386: chưa chạy được trong phiên — chờ CI.
- Store: `TE547_ARTICLE_PATH` cần bài có bảng 3 cột + 1 bảng trong `.table-wrap`; thiếu thì test store skip, không coi là đạt.
- AC4 ảnh article 360/1280 so #h-rte, Lighthouse: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
