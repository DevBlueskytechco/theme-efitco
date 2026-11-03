ES1-T58 — fix(product-card): sàn 24px cho vùng bấm swatch khi space_base < 4 (TE-3 AC6)

Bug: drafts/qa/ES1-T53/bugs/ES1-T53-01.md. `.product-card__swatch` lấy kích thước từ --space-6 × --space-5 (theo space_base) → space_base 2 = 16 × 12px, 3 = 24 × 18px, dưới AC6 (≥ 24px).

Thay đổi
- snippets/css-variables.liquid: token mới `--touch-target-min: 24px` (hằng số, không theo setting, cùng kiểu --radius-pill).
- assets/base.css:
  - `.product-card__swatch`: inline-size `max(var(--space-6), var(--touch-target-min))`, block-size `max(var(--space-5), var(--touch-target-min))`.
  - `.product-card__swatch::before` (pill): inset tính từ tâm, `calc((100% - var(--space-4)) / 2)` và `calc((100% - var(--space-6)) / 2)` → pill luôn space-6 × space-4, căn giữa vùng bấm.
  - `.product-card__swatch-more`: min-block-size cùng sàn.
- Không đổi markup, không JS, không đổi data-testid.

Kích thước (vùng bấm / pill)
- space_base 2: 24 × 24 / 16 × 8
- space_base 3: 24 × 24 / 24 × 12
- space_base 4 (mặc định): 32 × 24 / 32 × 16 — y như trước (inset-block 4, inset-inline 0)
- space_base 8: 64 × 48 / 64 × 32 — y như trước

Tự kiểm tra
- shopify theme check: 43 file, 0 offense.
- Diff: chỉ assets/base.css, snippets/css-variables.liquid; không file JS.
- Kích thước tính tay theo công thức trên; mặc định 4 không lệch Figma (32 × 16 trong 32 × 24).
- Playwright ES1-T53 TC-54 với space_base = 2 (bước tay B-09), Lighthouse, ảnh 3 breakpoint: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
