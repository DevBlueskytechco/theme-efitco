KHÔNG CHẮC: đề xuất, CTO áp tay (AGENTS.md ngoài phạm vi agent). Số dòng theo develop sau #307.

# Đề xuất sửa AGENTS.md theo ADR 0015 (ES1-T570)

## AGENTS.md:326–330 (mục "Styling and tokens", gạch đầu tiên)

Hiện tại:

```
- Design tokens flow one way: theme setting in `config/settings_schema.json`
  → CSS variable in `snippets/css-variables.liquid` → `var(--*)` in
  `assets/*.css` (ADR 0001). The token tables are in `DESIGN.md`.
  Why: merchants and Sidekick change the look in theme settings without
  touching CSS.
```

Thay bằng:

```
- Token values come from the kit `:root` (`drafts/designer/_kit/kit.css`),
  in this order: kit → page mockups `drafts/designer/**` → `docs/tokens.json`,
  `DESIGN.md`, `docs/ui-spec/foundation.md` → theme code (ADR 0015). A lower
  place that differs from the kit is wrong; a known, temporary difference is a
  key in `docs/tokens.json` `_source_of_truth.known_mismatches`.
  Why: one direction, checked in CI; a new difference without a key fails.
- In theme code, tokens flow one way: theme setting in
  `config/settings_schema.json` (default = kit value) → CSS variable in
  `snippets/css-variables.liquid` → `var(--*)` in `assets/*.css` (ADR 0001).
  Tokens a merchant does not change (type scale, line height, layers,
  shadows, sizes) are constants in `css-variables.liquid`, not settings.
  Why: merchants and Sidekick change the look in theme settings without
  touching CSS.
- Changing a token: kit, `docs/tokens.json`, `DESIGN.md` /
  `docs/ui-spec/foundation.md` and theme code in one pull request, with a
  `docs/design/CHANGELOG.md` line and a `_version` bump. A pull request that
  only brings theme code in line with the kit removes the matching
  `known_mismatches` key and does not bump the version (ADR 0015).
```

Kiểm sau khi áp: `grep -c "ADR 0015" AGENTS.md` ≥ 2; `shopify theme check` không đổi (AGENTS.md không phải file theme).
