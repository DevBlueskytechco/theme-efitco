#!/usr/bin/env bash
# Đóng zip theme đúng cấu trúc Shopify, loại thư mục dự án. Dùng: scripts/theme-zip.sh <name> <version>
# CLI ghim theo scripts/shopify-cli.sh (4.9.5); theme check đọc JSON 4.9.5/5.0 qua check-report (ES1-T32).
set -euo pipefail
H="$(cd "$(dirname "$0")" && pwd)/shopify-cli.sh"
NAME="${1:-theme-efitco}"; VER="${2:-0.0.0}"
OUT="dist/${NAME}-${VER}.zip"; mkdir -p dist; rm -f "$OUT"
"$H" assert-version
CHECK="$(mktemp "${TMPDIR:-/tmp}/theme-check.XXXXXX")"; trap 'rm -f "$CHECK"' EXIT
rc=0; shopify theme check --output json --fail-level error > "$CHECK" || rc=$?
"$H" check-report "$CHECK" || rc=1
[ "$rc" = 0 ] || { echo "theme check lỗi, không đóng zip" >&2; exit 1; }
zip -r "$OUT" assets blocks config layout locales snippets templates \
  -x "config/markets.json" -x "*.DS_Store" -x "*/.gitkeep"
echo "$OUT"; unzip -l "$OUT" | tail -1
