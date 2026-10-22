#!/usr/bin/env bash
# Đóng zip theme đúng cấu trúc Shopify, loại thư mục dự án. Dùng: scripts/theme-zip.sh <name> <version>
set -euo pipefail
NAME="${1:-theme-ember}"; VER="${2:-0.0.0}"
OUT="dist/${NAME}-${VER}.zip"; mkdir -p dist; rm -f "$OUT"
shopify theme check --fail-level error
zip -r "$OUT" assets blocks config layout locales snippets templates \
  -x "config/markets.json" -x "*.DS_Store" -x "*/.gitkeep"
echo "$OUT"; unzip -l "$OUT" | tail -1
