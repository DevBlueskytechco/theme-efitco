#!/usr/bin/env bash
# Test cho e2e-429-count.sh, không gọi GitHub.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
DIR="$(mktemp -d "${TMPDIR:-/tmp}/e2e429.XXXXXX")"
trap 'rm -rf "$DIR"' EXIT

printf 'e2e-desktop-1\tRun\t[ES1-T100] Shopify trả 429 cho /cart.js sau khi thử lại\ne2e-desktop-1\tRun\tok\ne2e-mobile-2\tRun\t[ES1-T100] Shopify trả 429 cho /products/a.js\ne2e-desktop-1\tRun\t[ES1-T100] Shopify trả 429 cho /products/b.js\n' > "$DIR/some.log"
OUT="$("$HERE/e2e-429-count.sh" --log "$DIR/some.log")"
echo "$OUT" | grep -qF '| some.log | e2e-desktop-1 | 2 |' || { echo "FAIL desktop: $OUT"; exit 1; }
echo "$OUT" | grep -qF '| some.log | e2e-mobile-2 | 1 |' || { echo "FAIL mobile: $OUT"; exit 1; }
echo "$OUT" | grep -qF '| some.log | tổng | 3 |' || { echo "FAIL tổng: $OUT"; exit 1; }

printf 'e2e-desktop-1\tRun\tok\n' > "$DIR/none.log"
OUT="$("$HERE/e2e-429-count.sh" --log "$DIR/none.log")"
echo "$OUT" | grep -qF '| none.log | tổng | 0 |' || { echo "FAIL rỗng: $OUT"; exit 1; }

if "$HERE/e2e-429-count.sh" --log "$DIR/khong-co.log" >/dev/null 2>&1; then echo "FAIL thiếu file phải lỗi"; exit 1; fi
echo "OK e2e-429-count"
