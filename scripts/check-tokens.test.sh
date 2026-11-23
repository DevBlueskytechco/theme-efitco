#!/usr/bin/env bash
# Test cho check-tokens.mjs (ADR 0015 mục 4, luật 1–7) và check-mockup-kit.mjs (ES1-T530), chạy trên fixture, không gọi Shopify.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
TMP="$(mktemp -d "${TMPDIR:-/tmp}/checktokens.XXXXXX")"
trap 'rm -rf "$TMP"' EXIT
pass=0

# ---------- fixture gốc: 4 nơi khớp nhau ----------
BASE="$TMP/base"
mkdir -p "$BASE/drafts/designer/_kit" "$BASE/drafts/designer/ES1-T900" "$BASE/drafts/designer/ES1-T252" \
  "$BASE/docs" "$BASE/config" "$BASE/snippets" "$BASE/assets"
cat > "$BASE/drafts/designer/_kit/kit.css" <<'CSS'
/* kit fixture */
:root {
  --font-primary--family: Inter, sans-serif;
  --font-primary--weight: 400;
  --font-heading--family: 'Sofia Sans Condensed', sans-serif;
  --font-heading--weight: 700;
  --color-background: #ffffff;
  --color-accent: #c8400e;
  --color-accent-on-dark: color-mix(in srgb, var(--color-accent) 50%, var(--color-background));
  --space-xs: 8px;
  --space-2: var(--space-xs);
  --layer-header: 10;
  --grid-gap: var(--space-xs);
}
@media (min-width: 48rem) {
  :root { --grid-gap: 16px; }
}
.chip { display: inline-flex; }
.badge--sale { color: var(--color-accent); }
CSS
cat > "$BASE/docs/tokens.json" <<'JSON'
{
  "_version": "2.0.0",
  "_source_of_truth": {
    "known_mismatches": {},
    "kit_root_count": 11
  },
  "color": { "_note": "x", "background": "#FFFFFF", "accent": "#C8400E" },
  "font": { "primary": "Inter — handle inter_n4", "heading": "Sofia Sans Condensed — font library" },
  "space": { "2": 8, "named": { "xs": 8 } },
  "layer": { "header": 10 },
  "layout": { "grid_gap": { "<48rem": 8, ">=48rem": 16 } }
}
JSON
cat > "$BASE/config/settings_schema.json" <<'JSON'
[
  { "name": "theme_info", "theme_name": "Fixture" },
  { "name": "t:general.typography", "settings": [
    { "type": "font_picker", "id": "type_heading_font", "default": "sofia_sans_condensed_n7", "label": "t:x" },
    { "type": "font_picker", "id": "type_primary_font", "default": "inter_n4", "label": "t:x" },
    { "type": "range", "id": "space_base", "min": 2, "max": 8, "step": 1, "default": 4, "label": "t:x" }
  ] },
  { "name": "t:general.colors", "settings": [
    { "type": "color", "id": "background_color", "default": "#FFFFFF", "label": "t:x" },
    { "type": "color", "id": "accent_color", "default": "#C8400E", "label": "t:x" }
  ] }
]
JSON
cat > "$BASE/snippets/css-variables.liquid" <<'LIQUID'
{% doc %}
  Fixture.
{% enddoc %}
{%- liquid
  assign body_font = settings.type_primary_font
  assign heading_font = settings.type_heading_font
  assign heading_font_bold = heading_font | font_modify: 'weight', '800'
  assign space = settings.space_base
-%}
{% style %}
  {{ body_font | font_face: font_display: 'swap' }}
  {%- if heading_font_bold %}{{ heading_font_bold | font_face: font_display: 'swap' }}{% endif -%}
  :root {
    --font-primary--family: {{ body_font.family }}, {{ body_font.fallback_families }};
    --font-primary--weight: {{ body_font.weight }};
    --font-heading--family: {{ heading_font.family }}, {{ heading_font.fallback_families }};
    --font-heading--weight: {{ heading_font.weight }};
    --color-background: {{ settings.background_color }};
    --color-accent: {{ settings.accent_color }};
    --color-accent-on-dark: color-mix(in srgb, var(--color-accent) 50%, #000);
    --space-xs: {{ space | times: 2 }}px;
    --space-2: {{ space | times: 2 }}px;
    {%- comment -%} chú thích Liquid {%- endcomment %}
    --grid-gap: var(--space-2);
  }
{% endstyle %}
LIQUID
cat > "$BASE/assets/base.css" <<'CSS'
:root { --layer-header: 10; }
@media (min-width: 48rem) { :root { --grid-gap: calc(var(--space-2) * 2); } }
.x { --edge: 1px; }
CSS
cat > "$BASE/drafts/designer/ES1-T900/index.html" <<'HTML'
<!doctype html>
<html><head>
<link rel="stylesheet" href="../_kit/kit.css">
<style>
/*
  component lấy từ kit (.chip, .badge, .dialog); file này chỉ còn bố cục trang.
  .chip { không bị bắt vì nằm trong comment }
*/
.hero .chip { margin: 0; }
.page > .badge, .hero { gap: 0; }
.chip-row { display: flex; }
@media (min-width: 48rem) { .hero .dialog { width: 50%; } }
@keyframes spin { from { rotate: 0; } to { rotate: 1turn; } }
</style>
</head><body></body></html>
HTML
cat > "$BASE/drafts/designer/ES1-T252/index.html" <<'HTML'
<style>
.chip { color: red; }
</style>
HTML

fix() { rm -rf "$TMP/$1"; cp -R "$BASE" "$TMP/$1"; echo "$TMP/$1"; }
# run <tên> <exit mong đợi> <script> <args...>: chạy, kiểm exit, giữ output ở $OUT
run() {
  local name="$1" want="$2"; shift 2
  local rc=0
  OUT="$(node "$@" --no-annotations 2>&1)" || rc=$?
  if [ "$rc" != "$want" ]; then echo "FAIL [$name] exit $rc, mong đợi $want"; echo "$OUT"; exit 1; fi
}
has() { printf '%s\n' "$OUT" | grep -qF -- "$2" || { echo "FAIL [$1] thiếu: $2"; printf '%s\n' "$OUT"; exit 1; }; }
hasnt() { if printf '%s\n' "$OUT" | grep -qF -- "$2"; then echo "FAIL [$1] không được có: $2"; printf '%s\n' "$OUT"; exit 1; fi; }
ok() { pass=$((pass + 1)); }

CT="$HERE/check-tokens.mjs"
CM="$HERE/check-mockup-kit.mjs"

# 1. Khớp đủ 4 nơi → exit 0
run "khớp" 0 "$CT" --root "$BASE"
has "khớp" "kit 11 · tokens.json lệch 0 · màu 2/2, lệch tạm 0 · font 2/2, lệch tạm 0"
has "khớp" "FAIL 0"
has "khớp" "phủ code: css-variables.liquid 10/11 · assets base.css 2 (2 trong :root)"
# luật 7 phụ: dẫn xuất màu khác công thức, biến chưa dựng, biến :root ở assets → WARN, không FAIL
has "khớp" "WARN css-variables --color-accent-on-dark"
has "khớp" "WARN assets --layer-header khai trong :root"
ok

# 2. AC4: tokens.json lệch 1 hex → FAIL, exit 1 (luật 2)
D="$(fix lech-hex)"; perl -pi -e 's/"accent": "#C8400E"/"accent": "#C8400F"/' "$D/docs/tokens.json"
run "lệch hex" 1 "$CT" --root "$D"
has "lệch hex" "FAIL tokens.json color.accent #C8400F ≠ --color-accent #C8400E (docs/tokens.json:"
has "lệch hex" "tokens.json lệch 1"
ok

# 3. Luật 1: kit_root_count sai → FAIL
D="$(fix dem)"; perl -pi -e 's/"kit_root_count": 11/"kit_root_count": 150/' "$D/docs/tokens.json"
run "đếm kit" 1 "$CT" --root "$D"
has "đếm kit" "FAIL tokens.json _source_of_truth.kit_root_count 150 ≠ 11"
ok

# 4. Luật 4: setting màu lệch kit, không khoá → FAIL
D="$(fix setting-fail)"; perl -pi -e 's/"default": "#C8400E"/"default": "#C8400F"/' "$D/config/settings_schema.json"
run "setting không khoá" 1 "$CT" --root "$D"
has "setting không khoá" "FAIL settings_schema accent_color #C8400F ≠ --color-accent #C8400E (config/settings_schema.json:"
ok

# 5. Luật 3: cùng lệch, có khoá known_mismatches → WARN, exit 0
perl -pi -e 's/"known_mismatches": \{\}/"known_mismatches": { "accent_color": "chờ FE" }/' "$D/docs/tokens.json"
run "setting có khoá" 0 "$CT" --root "$D"
has "setting có khoá" "WARN settings_schema accent_color #C8400F ≠ --color-accent #C8400E"
has "setting có khoá" "màu 1/2, lệch tạm 1"
ok

# 6. Luật 6: khoá đã khớp kit → WARN khoá thừa
D="$(fix khoa-thua)"; perl -pi -e 's/"known_mismatches": \{\}/"known_mismatches": { "background_color": "chờ FE" }/' "$D/docs/tokens.json"
run "khoá thừa" 0 "$CT" --root "$D"
has "khoá thừa" "WARN tokens.json known_mismatches.background_color đã khớp kit ≠ khoá thừa, xoá trong PR đóng lệch"
ok

# 7. Font: trọng lượng primary so handle tokens.json (inter_n5), không so --font-primary--weight 400 của kit
D="$(fix font)"; perl -pi -e 's/handle inter_n4/handle inter_n5/' "$D/docs/tokens.json"
run "font không khoá" 1 "$CT" --root "$D"
has "font không khoá" "FAIL settings_schema type_primary_font inter_n4 (inter 400) ≠ inter 500 (tokens.json inter_n5)"
perl -pi -e 's/"known_mismatches": \{\}/"known_mismatches": { "type_primary_font": "chờ FE" }/' "$D/docs/tokens.json"
run "font có khoá" 0 "$CT" --root "$D"
has "font có khoá" "font 1/2, lệch tạm 1"
ok

# 8. Luật 7: nhóm khác lệch → WARN, --strict → FAIL; space_base × N được giải
D="$(fix space)"; perl -pi -e 's/--space-2: \{\{ space \| times: 2 \}\}px/--space-2: {{ space | times: 3 }}px/' "$D/snippets/css-variables.liquid"
run "space WARN" 0 "$CT" --root "$D"
has "space WARN" "WARN css-variables --space-2 12px ≠ 8px (snippets/css-variables.liquid:"
run "space strict" 1 "$CT" --root "$D" --strict
has "space strict" "FAIL css-variables --space-2 12px ≠ 8px"
ok

# 9. Override @media: code giữ 8 từ 48rem trong khi kit 16 → WARN có mốc
D="$(fix media)"; perl -pi -e 's/calc\(var\(--space-2\) \* 2\)/var(--space-2)/' "$D/assets/base.css"
run "media" 0 "$CT" --root "$D"
has "media" "WARN assets --grid-gap 8px ≠ 16px (assets/base.css:2) · từ 48rem"
ok

# 10. Mockup: sạch → 0; comment và selector ngữ cảnh không bị bắt; ES1-T252 bỏ qua
run "mockup sạch" 0 "$CM" --root "$BASE"
has "mockup sạch" "mockup 1 trang"
has "mockup sạch" "FAIL 0"
ok

# 11. AC5: thêm `.chip {` → FAIL kèm file:dòng
D="$(fix mockup)"; perl -pi -e 's/^\.chip-row/.chip { color: red; }\n.chip-row/' "$D/drafts/designer/ES1-T900/index.html"
run "mockup .chip" 1 "$CM" --root "$D"
has "mockup .chip" "FAIL drafts/designer/ES1-T900/index.html:11 selector \".chip\""
hasnt "mockup .chip" "index.html:7"
ok

# 12. Biến thể kit (.badge--sale có trong kit), class trạng thái, pagination__* → FAIL; danh sách có ngữ cảnh → không
D="$(fix mockup2)"; perl -pi -e 's/^\.chip-row/.badge--sale, .hero .badge--sale { x: 1; }\n.chip.is-active:hover { x: 1; }\n.pagination__item { x: 1; }\n.badge--hero { x: 1; }\n.chip-row/' "$D/drafts/designer/ES1-T900/index.html"
run "mockup biến thể" 1 "$CM" --root "$D"
has "mockup biến thể" "index.html:11 selector \".badge--sale\""
has "mockup biến thể" "index.html:12 selector \".chip.is-active:hover\""
has "mockup biến thể" "index.html:13 selector \".pagination__item\""
hasnt "mockup biến thể" ".badge--hero"
hasnt "mockup biến thể" ".hero .badge--sale"
has "mockup biến thể" "FAIL 3"
ok

echo "OK check-tokens ($pass ca)"
