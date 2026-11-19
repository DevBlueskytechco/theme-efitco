KHÔNG CHẮC: chưa đo được gzip base.css trong sandbox (lệnh gzip/node/python cần duyệt) — diff +8/−3 dòng CSS, ước +~0,2 KB gzip, CI đo trần 57 344. tests/e2e/ES1-T330.spec.ts (TC-28) và drafts/qa/ES1-T330/bugs/ES1-T330-B01.md chưa có trên nhánh này nên viết spec riêng tests/e2e/ES1-T482.spec.ts cùng phép đo.

# ES1-T482 — Vùng chạm menu header từ 80rem (bug ES1-T330-B01, TE-22 AC7)

## Vấn đề
Trong `@media (min-width: 80rem)` của base.css, `.site-header__link { padding: 0; line-height: 24px; min-height: 0 }` ghi đè `min-height: 2.75rem` của critical.css → mục menu cấp 1 cao 24/26px (< 44). `.site-header__submenu .site-header__link { min-height: 36px }` → link dropdown C 36px (< 40). Panel mega A/B đã đạt 40.

## Sửa (chỉ assets/base.css)
- Mục cấp 1 (`li > a` và `li > details > summary`): `padding-block: 10px; margin-block: -10px` (chữ 24) và `9px / -9px` cho mục 5+ (chữ 26) → ô bấm 44, li vẫn cao 24/26 nên thanh 80, gap 40, toạ độ chữ theo Figma 1:365 không đổi (navigation.md §5.1, §8).
- Rule tinh chỉnh ±px mục 1–4 `margin-block-start: 1px` → `-9px` (−10 bù ô bấm + 1 hạ chữ), giữ đúng vị trí cũ.
- Không dùng `::after` định vị: summary không được thành khối chứa của scrim mega (TE-22-R2-FE2).
- Link dropdown C `min-height: 36px` → `40px`.
- li là flex item (BFC) nên margin âm không lọt ra ngoài; dropdown C neo `inset-block-start: 100%` theo li → vị trí panel không đổi.

## Không đổi
Markup, JS, locale, schema. Không file JS trong diff.

## Test
- tests/e2e/ES1-T482.spec.ts
  - TC-01 (tĩnh, desktop): base.css có rule 44/40, không còn 36.
  - TC-02 (store thật, desktop 1280): header cao 80; mọi mục cấp 1 cao ≥ 44 và nằm trong thanh; mở mục dropdown C đầu tiên, mọi link cao ≥ 40. Menu store dev không có mục C → skip (thiếu dữ liệu, không coi là đạt).
- Theo quy ước ES1-T475: import từ `./support/test`, `gotoStore` + `watchStore`, chỉ 1 lần tải trang ở desktop, retries 0.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi (22 warning có sẵn ở templates/index*, blocks không liên quan).
- Không literal màu; logical properties (padding-block/margin-block).
- base.css gzip ≤ 57 344: chờ CI.
- Preview, Playwright (ES1-T482, ES1-T330 TC-28 khi có), Lighthouse desktop/mobile, ảnh 3 breakpoint, visual diff header 1280/1920: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
