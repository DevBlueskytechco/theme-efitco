#!/usr/bin/env bash
# ES1-T100: dựng overlay từ HEAD, tạo 2 patch, kiểm tra patch áp được trên bản sạch và spec parse được bằng config thật.
# Chạy từ gốc repo: drafts/devops/ES1-T100/build-patch.sh
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel)"
HERE="$ROOT/drafts/devops/ES1-T100"
WORK="$(mktemp -d "${TMPDIR:-/tmp}/t100.XXXXXX")"
trap 'rm -rf "$WORK"' EXIT

git -C "$ROOT" archive HEAD | tar -x -C "$WORK"
git -C "$WORK" init -q
git -C "$WORK" add -A
git -C "$WORK" -c user.name=x -c user.email=x@x commit -qm base

python3 -I "$HERE/apply-spec-edits.py" "$WORK" "$HERE/overlay"
rm -f "$HERE/overlay/tests/e2e/support/http.ts" "$HERE/overlay/tests/e2e/support/store-data.ts"

cp -R "$HERE/overlay/tests" "$WORK/"
git -C "$WORK" add -A tests
git -C "$WORK" diff --cached --binary > "$HERE/ES1-T100-tests.patch"
cp "$HERE/overlay/CONVENTION.md" "$WORK/CONVENTION.md"
git -C "$WORK" diff -- CONVENTION.md > "$HERE/ES1-T100-convention.patch"

git -C "$ROOT" apply --check "$HERE/ES1-T100-tests.patch"
git -C "$ROOT" apply --check "$HERE/ES1-T100-convention.patch"
echo "OK patch áp được trên working tree"
git -C "$WORK" diff --cached --stat
echo "--- DoD grep (mong đợi 0 dòng)"
{ grep -rn 'request.get(`/products' "$WORK/tests/e2e" || true; } | { grep -v 'ES1-T100.spec.ts' || true; } | wc -l
echo "--- getJson trong spec còn lại"
grep -rln 'getJson' "$WORK/tests/e2e" --include='*.spec.ts' || true
echo "--- playwright --list bằng config thật"
ln -s "$ROOT/node_modules" "$WORK/node_modules"
cd "$WORK"
npx playwright test --list --project=desktop | tail -1
