KHÔNG CHẮC: DESIGN.md ngoài phạm vi Tech Lead (scope-guard chặn ghi). Đề xuất này giao Designer áp cùng ES1-T585. Số dòng theo develop sau #307.

# Đề xuất sửa DESIGN.md theo ADR 0015 (ES1-T570)

## DESIGN.md:15–16

Hiện tại: `` `docs/design/decisions.md`. ADR 0001, 0003, 0005 still apply. ``

Thay bằng:

```
`docs/design/decisions.md`. Source order and the CI token check: ADR 0015
(`docs/adr/0015-thu-tu-nguon-token.md`, partly replaces ADR 0001). ADR 0001
(one setting + one CSS variable per token), 0003, 0005 still apply.
```

## DESIGN.md:52–53

Hiện tại: `look in theme settings without editing CSS (ADR 0001).`

Thay bằng:

```
  look in theme settings without editing CSS (ADR 0001). The setting default
  copies the kit `:root` value (ADR 0015).
```

## DESIGN.md:62–63

Hiện tại: `is a release check (ADR 0001).`

Thay bằng:

```
  is a release check (ADR 0001). Setting defaults and `docs/tokens.json`
  are checked against the kit in CI; a difference without a key in
  `known_mismatches` fails (ADR 0015).
```

## DESIGN.md:75–78 (đã có trong ES1-T585)

Thêm `type_primary_font` inter_n4 → inter_n5 (V05) vào danh sách "Known mismatches waiting for FE".

Kiểm: `grep -c 0015 DESIGN.md` ≥ 3; `grep -ci figma DESIGN.md` không tăng.
