#!/usr/bin/env bash
# ES1-T163: kiểm patch trên bản sao tạm, không đụng working tree. Chạy từ gốc repo: bash drafts/qa/ES1-T163/verify-patches.sh
set -euo pipefail
ROOT="$PWD"
D="$ROOT/drafts/qa/ES1-T163"
TMP="$(mktemp -d "${TMPDIR:-/tmp}/t163.XXXXXX")"
trap 'rm -rf "$TMP"' EXIT
cd "$TMP"
git -C "$ROOT" archive HEAD scripts/e2e-429-count.sh scripts/e2e-429-count.test.sh CONVENTION.md | tar x
mkdir -p tests/e2e
git -C "$ROOT" show origin/feature/ai-ES1-T96:tests/e2e/ES1-T96.spec.ts > tests/e2e/ES1-T96.spec.ts
git -C "$ROOT" show origin/feature/ai-ES1-T97:tests/e2e/ES1-T97.spec.ts > tests/e2e/ES1-T97.spec.ts
patch -p1 --no-backup-if-mismatch < "$D/ES1-T96.spec.patch"
patch -p1 --no-backup-if-mismatch < "$D/ES1-T97.spec.patch"
patch -p1 --no-backup-if-mismatch < "$D/scripts-convention.patch"
echo "--- test script đếm 429"
bash scripts/e2e-429-count.test.sh
echo "--- bảng mẫu"
printf 'e2e-mobile-1\tRun\t[cartApi] 429 lần 1: /cart/clear.js Retry-After=2\ne2e-mobile-1\tRun\t[cartApi] Shopify trả 429, skip: 429 sau 1 lần thử: /cart/clear.js\n' > sample.log
bash scripts/e2e-429-count.sh --log sample.log
echo "--- grep DoD trên T96, T97 sau patch (phải rỗng)"
grep -n "/cart/.*\.js" tests/e2e/ES1-T96.spec.ts tests/e2e/ES1-T97.spec.ts || echo rỗng
echo "--- cú pháp T96, T97 sau patch"
for f in tests/e2e/ES1-T96.spec.ts tests/e2e/ES1-T97.spec.ts; do
  node --no-warnings -e "const {stripTypeScriptTypes:s}=require('node:module');process.stdout.write(s(require('fs').readFileSync(process.argv[1],'utf8')))" "$f" > "$f.mjs"
  node --check "$f.mjs" && echo "OK $f"
done
