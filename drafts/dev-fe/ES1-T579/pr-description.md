KHÔNG CHẮC: AC6 chưa đủ — scope-guard chặn dev-fe ghi tests/e2e/TE-3.spec.ts:128 (`-${pct}%` còn đó, TE-3 sẽ đỏ). Đã tạo ES1-T595 cho QA sửa cùng nhánh trước merge. Gzip base.css/aux.css không đo được trong sandbox (lệnh bị chặn), chờ CI.

# ES1-T579 — dấu trừ U+2212, tag bài viết trung tính, badge số món outline

Theo ES1-T567 (kit.css `.badge--tag` 481, `.badge--outline` 485; foundation.md §8; decisions.md 21/11; cart.md §Tóm tắt).

## Thay đổi
- `locales/en.default.json`: `cart.discount_value` → `"−{{ amount }}"`, `products.card.sale_percent` → `"−{{ percent }}%"` (U+2212). Liquid giữ nguyên 4 chỗ gọi (product-card, featured-product, cart-summary, cart-lines).
- `assets/base.css`
  - `.article-card__tag`: nền `--color-background`, viền 1px `--color-border`, chữ `--color-foreground`; bỏ `overflow: hidden`, `text-overflow: ellipsis` (§37). Pill 28 (3 + 20 + 3 + viền 2), padding 12, 13/600 giữ.
  - Bỏ chỉnh pixel tag trong khối tinh chỉnh Figma: `.article-card__tag { padding-block: 4px 2px }` (tách khỏi `.product-card__badge`, rule badge giữ) và `.article-card__tag { translate: -1px 0 }`.
  - `.cart-summary__badge`: nền transparent, viền 1px currentColor, chữ `--color-background-dark-foreground`.
- `assets/aux.css`
  - `.blog-articles__featured-tag`: nền/viền/chữ trung tính như trên.
  - `.article-main__tag`: trung tính; hover đổi `border-color: var(--color-foreground)` thay nền color-mix accent. Cỡ chữ `--font-size-sm` (14) → `--font-size-xs` (13) theo ticket "13/600" và kit `.badge`.
- `tests/e2e/ES1-T156.spec.ts:102`: `−${percent}%`.
- `tests/e2e/ES1-T403.spec.ts`: D5 bỏ `.article-card__tag` khỏi danh sách được ellipsis, còn `.collection-toolbar__select`.

## Ghi chú
- Tag card vẫn `white-space: nowrap` + `max-inline-size`; nhãn rất dài xuống dòng là `.badge--wrap` (ES1-T551), ngoài phạm vi.
- `<bdi>` (ES1-T550), "Items" → "items" (ES1-T578), baseline ảnh (ES1-T582): ngoài phạm vi.
- 0 file JS trong diff.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi (9 warning có sẵn ở quiz-step, index*.liquid, không thuộc diff).
- AC1: `grep '"-{{' locales/en.default.json` = 0; locale parse OK, codepoint đầu 2 khoá = U+2212 (sửa trực tiếp bằng ký tự −).
- AC3: 3 rule tag không còn `--color-accent` (đã grep).
- AC6: ES1-T156 xong; TE-3.spec.ts chờ ES1-T595 (QA).
- Gzip base.css ≤ 49 152, aux.css ≤ 16 384: chờ CI (diff +3 dòng / −4 dòng, không đáng kể).
- AC2/AC4/AC5 computed style, Playwright, Lighthouse, ảnh blog/article/cart 360/768/1280/1920: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
