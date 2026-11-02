## ES1-T26 — data-testid cho nút gộp localization ở footer

Ticket: ES1-T26 (parent TE-1, nguồn ES1-T23)

### Thay đổi
- `blocks/footer.liquid`: thêm `data-testid="footer-localization-toggle"` vào `<summary class="site-footer__summary">` của form `localization` (nút gộp `USD / EN`, AC9).
- Không đổi markup khác, CSS, locale, schema. Không file JS.

### Cho QA
- Sau merge: đổi helper `localization()` trong `tests/e2e/ES1-T23.spec.ts` từ `form[action*="localization"] summary` sang `page.getByTestId('footer-localization-toggle')`.
- Summary chỉ render khi `show_countries or show_languages` (store có > 1 country hoặc > 1 language và setting bật) — testid vắng mặt trong trường hợp đó là đúng.

### Tự kiểm tra
- `shopify theme check`: 40 files, 0 offenses.
- Diff: 1 file, 1 dòng, không JS.
- Preview, Playwright, Lighthouse, ảnh 3 breakpoint: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
