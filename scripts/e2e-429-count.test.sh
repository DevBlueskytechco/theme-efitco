#!/usr/bin/env bash
# Test cho e2e-429-count.sh, không gọi GitHub.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
DIR="$(mktemp -d "${TMPDIR:-/tmp}/e2e429.XXXXXX")"
trap 'rm -rf "$DIR"' EXIT

printf 'e2e-desktop-1\tRun\t[ES1-T100] Shopify trả 429 cho /cart.js sau khi thử lại\ne2e-desktop-1\tRun\tok\ne2e-mobile-2\tRun\t[ES1-T100] Shopify trả 429 cho /products/a.js\ne2e-desktop-1\tRun\t[ES1-T100] Shopify trả 429 cho /products/b.js\n' > "$DIR/some.log"
OUT="$("$HERE/e2e-429-count.sh" --log "$DIR/some.log")"
echo "$OUT" | grep -qF '| some.log | e2e-desktop-1 | 0 | 2 |' || { echo "FAIL desktop: $OUT"; exit 1; }
echo "$OUT" | grep -qF '| some.log | e2e-mobile-2 | 0 | 1 |' || { echo "FAIL mobile: $OUT"; exit 1; }
echo "$OUT" | grep -qF '| some.log | tổng | 0 | 3 |' || { echo "FAIL tổng: $OUT"; exit 1; }

# ES1-T163: 3 lần 429 rồi skip ở mobile-1; 1 lần 429 rồi thử lại được ở desktop-2 (có 429, không skip).
printf 'e2e-mobile-1\tRun\t[cartApi] 429 lần 1: /cart/clear.js Retry-After=2\ne2e-mobile-1\tRun\t[cartApi] 429 lần 2: /cart/clear.js Retry-After=2\ne2e-mobile-1\tRun\t[cartApi] 429 lần 3: /cart/clear.js Retry-After=2\ne2e-mobile-1\tRun\t[cartApi] Shopify trả 429, skip: 429 sau 3 lần thử: /cart/clear.js\ne2e-desktop-2\tRun\t[cartApi] 429 lần 1: /cart/add.js Retry-After=không có\n' > "$DIR/cart.log"
OUT="$("$HERE/e2e-429-count.sh" --log "$DIR/cart.log")"
echo "$OUT" | grep -qF '| cart.log | e2e-mobile-1 | 3 | 1 |' || { echo "FAIL cartApi skip: $OUT"; exit 1; }
echo "$OUT" | grep -qF '| cart.log | e2e-desktop-2 | 1 | 0 |' || { echo "FAIL cartApi thử lại được: $OUT"; exit 1; }
echo "$OUT" | grep -qF '| cart.log | tổng | 4 | 1 |' || { echo "FAIL cartApi tổng: $OUT"; exit 1; }

printf 'e2e-desktop-1\tRun\tok\n' > "$DIR/none.log"
OUT="$("$HERE/e2e-429-count.sh" --log "$DIR/none.log")"
echo "$OUT" | grep -qF '| none.log | tổng | 0 | 0 |' || { echo "FAIL rỗng: $OUT"; exit 1; }

if "$HERE/e2e-429-count.sh" --log "$DIR/khong-co.log" >/dev/null 2>&1; then echo "FAIL thiếu file phải lỗi"; exit 1; fi
echo "OK e2e-429-count"
