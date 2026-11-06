#!/usr/bin/env bash
# ES1-T162: chạy preview-push.sh với lệnh shopify giả, kiểm từng lệnh gọi store. Không gọi store. Dùng: bash scripts/preview-push.test.sh
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
T="$(mktemp -d "${TMPDIR:-/tmp}/preview-push-test.XXXXXX")" || exit 1; trap 'rm -rf "$T"' EXIT
PASS=0; FAIL=0
ok()  { PASS=$((PASS+1)); echo "ok   $1"; }
bad() { FAIL=$((FAIL+1)); echo "FAIL $1 — $2"; }
fx()  { printf '%s\n' "$2" > "$T/$1"; }

mkdir -p "$T/bin"
# shopify giả: ghi mọi lệnh vào FAKE_LOG; sau lần push đầu, theme list trả FAKE_LIST_AFTER nếu có
cat > "$T/bin/shopify" <<'EOF'
#!/usr/bin/env bash
echo "$*" >> "$FAKE_LOG"
case "$1 ${2:-}" in
  "version "*) echo "4.9.5" ;;
  "theme list")
    if [ -f "$FAKE_LOG.pushed" ] && [ -n "${FAKE_LIST_AFTER:-}" ]; then cat "$FAKE_LIST_AFTER"; else cat "$FAKE_LIST"; fi ;;
  "theme push")
    touch "$FAKE_LOG.pushed"
    if [ -n "${FAKE_PUSH_FAIL:-}" ]; then echo '{"error":{"message":"502"}}'; exit 1; fi
    echo '{"theme":{"id":999,"name":"ai-x","role":"unpublished"}}' ;;
  "theme delete") ;;
  *) exit 99 ;;
esac
EOF
printf '#!/usr/bin/env bash\nexit 0\n' > "$T/bin/sleep"
chmod +x "$T/bin/shopify" "$T/bin/sleep"

LIST='theme list --json'
PUSH_NEW='theme push --unpublished --theme ai-x --json --path .'

# run <tên> <mã thoát> <chuỗi phải có trong output, rỗng = bỏ qua> <file list> <log mong muốn, mỗi lệnh 1 dòng>
# Biến môi trường phụ (FAKE_LIST_AFTER, FAKE_PUSH_FAIL, STORE) đặt trước khi gọi.
CASE=0
run() {
  local name="$1" want_rc="$2" want_out="$3" list="$4" want_log="$5" dir out rc log
  CASE=$((CASE+1)); dir="$T/case-$CASE"; mkdir -p "$dir"; : > "$dir/log"
  out="$(cd "$dir" && PATH="$T/bin:$PATH" FAKE_LOG="$dir/log" FAKE_LIST="$T/$list" \
    RUNNER_TEMP="$dir" GITHUB_OUTPUT="$dir/gh-output" GITHUB_REF_NAME=test \
    SHOPIFY_FLAG_STORE="${STORE:-hoa-qua-nhap-khau.myshopify.com}" \
    bash "$HERE/preview-push.sh" ai-x 2>&1)"; rc=$?
  log="$(cat "$dir/log")"
  if [ "$rc" != "$want_rc" ]; then bad "$name" "rc=$rc, muốn $want_rc; out: $out"; return; fi
  if [ -n "$want_out" ] && ! grep -qF -- "$want_out" <<<"$out"; then bad "$name" "thiếu '$want_out'; out: $out"; return; fi
  if [ "$log" != "$want_log" ]; then bad "$name" "lệnh gọi store sai:"$'\n'"$log"$'\n'"--- muốn:"$'\n'"$want_log"; return; fi
  ok "$name"
}
lines() { printf '%s\n' "$@"; }

fx live-4.json   '[{"id":157463609441,"name":"ai-x","role":"live"},{"id":100,"name":"Skeleton","role":"unpublished"}]'
fx live-5.json   '{"themes":[{"id":"gid://shopify/OnlineStoreTheme/157463609441","name":"ai-x","role":"LIVE"}]}'
fx main.json     '[{"id":157463609441,"name":"ai-x","role":"main"}]'
fx norole.json   '[{"id":303,"name":"ai-x"}]'
fx unpub.json    '[{"id":101,"name":"ai-x","role":"unpublished"},{"id":100,"name":"Skeleton","role":"live"}]'
fx dev.json      '[{"id":102,"name":"ai-x","role":"development"},{"id":100,"name":"Skeleton","role":"live"}]'
fx demo.json     '[{"id":505,"name":"ai-x","role":"demo"},{"id":100,"name":"Skeleton","role":"live"}]'
fx other.json    '[{"id":100,"name":"Skeleton","role":"live"}]'

# Store đầy: 17 theme preview id 20..36; biến thể live-full có ai-x live, delete-guard có theme ai-* cũ nhất role main
FILLER="$(jq -nc '[range(20; 37) | {id: ., name: "ai-old-\(.)", role: "unpublished"}]')"
printf '%s\n' "$FILLER" | jq -c '. + [{id: 157463609441, name: "ai-x", role: "live"}]' > "$T/live-full.json"
printf '%s\n' "$FILLER" | jq -c '. + [{id: 5, name: "ai-was-preview", role: "main"}, {id: 6, name: "ai-develop", role: "unpublished"}]' > "$T/delete-guard.json"

ONLY_LIST="$(lines version "$LIST")"
run "live tên ai-x (4.x): dừng, chỉ đọc list" 1 "::error::theme 'ai-x' (id 157463609441) có role live" live-4.json "$ONLY_LIST"
run "LIVE {themes} gid (5.0): dừng"           1 "(id 157463609441) có role live" live-5.json "$ONLY_LIST"
run "role main: dừng"                         1 "có role main"                   main.json   "$ONLY_LIST"
run "thiếu role: dừng"                        1 "(id 303) có role không rõ"      norole.json "$ONLY_LIST"
run "live + store đầy: không xoá theme nào"   1 "(id 157463609441)"              live-full.json "$ONLY_LIST"

run "unpublished: push vào id"   0 "theme_id=999" unpub.json "$(lines version "$LIST" "$LIST" 'theme push --theme 101 --json --path .')"
run "development: push vào id"   0 "theme_id=999" dev.json   "$(lines version "$LIST" "$LIST" 'theme push --theme 102 --json --path .')"
run "chưa có theme: tạo mới"     0 "theme_id=999" other.json "$(lines version "$LIST" "$LIST" "$PUSH_NEW")"
run "role demo cùng tên: bỏ qua, tạo mới" 0 "::warning::bỏ qua theme 'ai-x' (id 505) role demo" demo.json "$(lines version "$LIST" "$LIST" "$PUSH_NEW")"
# id 5 role main và ai-develop cũ hơn nhưng không được chọn; xoá id 20
run "store đầy: chỉ xoá preview, bỏ role main và ai-develop" 0 "xoá preview cũ nhất 20" delete-guard.json \
  "$(lines version "$LIST" 'theme delete --theme 20 --force' "$LIST" "$PUSH_NEW")"

# Theme thành live giữa 2 lần thử: lần thử sau đọc lại list và dừng
export FAKE_PUSH_FAIL=1 FAKE_LIST_AFTER="$T/live-4.json"
run "thành live giữa 2 lần thử: dừng" 1 "(id 157463609441) có role live" unpub.json \
  "$(lines version "$LIST" "$LIST" 'theme push --theme 101 --json --path .' "$LIST")"
unset FAKE_PUSH_FAIL FAKE_LIST_AFTER

STORE=store-khac.myshopify.com run "store khác: dừng, không gọi store" 1 "chỉ push lên" unpub.json ""

if grep -qxF 'theme_id=999' "$T/case-6/gh-output"; then ok "ghi theme_id vào GITHUB_OUTPUT"; else bad "ghi theme_id vào GITHUB_OUTPUT" "$(cat "$T/case-6/gh-output" 2>&1)"; fi

echo "pass=$PASS fail=$FAIL"
[ "$FAIL" = 0 ]
