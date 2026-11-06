#!/usr/bin/env bash
# ES1-T32: test parser scripts/shopify-cli.sh với output JSON CLI 4.9.5 và 5.0. Không gọi store. Dùng: bash scripts/shopify-cli.test.sh
set -uo pipefail
S="$(cd "$(dirname "$0")" && pwd)/shopify-cli.sh"
T="$(mktemp -d "${TMPDIR:-/tmp}/shopify-cli-test.XXXXXX")" || exit 1; trap 'rm -rf "$T"' EXIT
PASS=0; FAIL=0
ok()  { PASS=$((PASS+1)); echo "ok   $1"; }
bad() { FAIL=$((FAIL+1)); echo "FAIL $1 — $2"; }
fx()  { printf '%s\n' "$2" > "$T/$1"; }

# expect <tên> <mã thoát> <chuỗi phải có trong stdout+stderr, rỗng = bỏ qua> -- lệnh...
expect() {
  local name="$1" want_rc="$2" want_out="$3"; shift 4
  local out rc
  out="$("$@" 2>&1)"; rc=$?
  if [ "$rc" != "$want_rc" ]; then bad "$name" "rc=$rc, muốn $want_rc; out: $out"; return; fi
  if [ -n "$want_out" ] && ! grep -qF -- "$want_out" <<<"$out"; then bad "$name" "thiếu '$want_out'; out: $out"; return; fi
  ok "$name"
}
# expect_empty <tên> -- lệnh...: thoát 0, stdout rỗng
expect_empty() {
  local name="$1"; shift 2
  local out rc
  out="$("$@" 2>/dev/null)"; rc=$?
  if [ "$rc" = 0 ] && [ -z "$out" ]; then ok "$name"; else bad "$name" "rc=$rc out=$out"; fi
}

N="ai-feature-ai-ES1-T32"
fx list-4.json        '[{"id":101,"name":"ai-feature-ai-ES1-T32","role":"unpublished"},{"id":100,"name":"Skeleton","role":"live"}]'
fx list-5.json        '{"themes":[{"id":"gid://shopify/OnlineStoreTheme/202","name":"ai-feature-ai-ES1-T32","role":"unpublished"},{"id":"200","name":"Skeleton","role":"live"}]}'
fx list-5-str.json    '{"themes":[{"id":"303","name":"ai-feature-ai-ES1-T32"}]}'
fx error.json         '{"error":{"type":"abort","message":"Failed to access local storage","tryMessage":"Check permissions"}}'
fx push-4.json        '{"theme":{"id":101,"name":"ai-feature-ai-ES1-T32","role":"unpublished","preview_url":"https://hoa-qua-nhap-khau.myshopify.com?preview_theme_id=101"}}'
fx push-5-ok.json     '{"status":"ok","theme":{"id":"gid://shopify/OnlineStoreTheme/202","name":"ai-feature-ai-ES1-T32"},"issues":[]}'
fx push-5-partial.json '{"status":"partial","theme":{"id":"202"},"issues":[{"path":"blocks/hero.liquid","message":"Liquid syntax error: line 3"},{"path":"config/settings_data.json","message":"Invalid block"}]}'
fx push-5-themeid.json '{"status":"ok","theme_id":"404"}'
fx push-5-partial-empty.json '{"status":"partial","theme":{"id":"202"}}'
fx push-5-issues.json '{"theme":{"id":"202"},"issues":[{"path":"blocks/hero.liquid","message":"Upload failed"}]}'
fx push-noid.json     '{"status":"ok","theme":{}}'
fx check-4-clean.json '[]'
fx check-4-error.json '[{"path":"blocks/hero.liquid","offenses":[{"check":"MissingTemplate","severity":0,"start_row":0,"start_column":4,"end_row":0,"end_column":9,"message":"Missing a, b"},{"check":"UnusedAssign","severity":1,"start_row":9,"start_column":0,"message":"unused"}],"errorCount":1}]'
fx check-4-warn.json  '[{"path":"blocks/hero.liquid","offenses":[{"check":"UnusedAssign","severity":1,"start_row":9,"start_column":0,"message":"unused"}]}]'
fx check-5-error.json '{"issues":[{"path":"blocks/hero.liquid","line":1,"column":5,"severity":"error","check":"MissingTemplate","message":"Missing a, b"},{"path":"snippets/image.liquid","line":10,"column":1,"severity":"warning","check":"UnusedAssign","message":"unused"}]}'
fx check-5-warn.json  '{"issues":[{"path":"snippets/image.liquid","line":10,"column":1,"severity":"warning","check":"UnusedAssign","message":"unused"}]}'
fx check-5-flat.json  '[{"path":"blocks/hero.liquid","line":2,"column":3,"severity":"error","check":"X","message":"m"}]'
fx check-5-empty.json '{"issues":[]}'
fx notjson.json       'Error: something broke'
# ES1-T162: theme preview bị đưa lên live
fx list-live-4.json   '[{"id":157463609441,"name":"ai-x","role":"live"},{"id":100,"name":"Skeleton","role":"unpublished"}]'
fx list-live-5.json   '{"themes":[{"id":"gid://shopify/OnlineStoreTheme/157463609441","name":"ai-x","role":"LIVE"}]}'
fx list-main.json     '[{"id":"157463609441","name":"ai-x","role":"main"}]'
fx list-live-dup.json '[{"id":101,"name":"ai-x","role":"unpublished"},{"id":157463609441,"name":"ai-x","role":"live"}]'
fx list-norole.json   '[{"id":303,"name":"ai-x"}]'
fx list-live-noid.json '[{"name":"ai-x","role":"live"}]'
fx list-dev.json      '[{"id":404,"name":"ai-x","role":"development"},{"id":100,"name":"Skeleton","role":"live"}]'
fx list-demo.json     '[{"id":505,"name":"ai-x","role":"demo"},{"id":100,"name":"Skeleton","role":"live"}]'
fx list-demo-unpub.json '[{"id":505,"name":"ai-x","role":"demo"},{"id":606,"name":"ai-x","role":"unpublished"}]'
fx list-nolive.json   '[{"id":101,"name":"ai-x","role":"unpublished"}]'

expect "pinned = 4.9.5"               0 "4.9.5"                   -- "$S" pinned
expect "list 4.x id số"               0 "101"                     -- "$S" theme-id "$N" "$T/list-4.json"
expect "list 5.0 {themes} gid→số"     0 "202"                     -- "$S" theme-id "$N" "$T/list-5.json"
expect "list 5.0 id chuỗi"            0 "303"                     -- "$S" theme-id "$N" "$T/list-5-str.json"
expect_empty "list không trùng tên → rỗng" -- "$S" theme-id "ai-khong-co" "$T/list-5.json"
expect_empty "list lỗi CLI → rỗng"         -- "$S" theme-id "$N" "$T/error.json"
expect "list không phải JSON → lỗi"   1 "không phải JSON"         -- "$S" theme-id "$N" "$T/notjson.json"
expect "preview-id live 4.x dừng, in id"   4 "(id 157463609441) có role live" -- "$S" preview-id ai-x "$T/list-live-4.json"
expect "preview-id LIVE hoa, gid→số"       4 "(id 157463609441) có role live" -- "$S" preview-id ai-x "$T/list-live-5.json"
expect "preview-id role main dừng"         4 "có role main"            -- "$S" preview-id ai-x "$T/list-main.json"
expect "preview-id trùng tên, 1 live dừng" 4 "(id 157463609441)"       -- "$S" preview-id ai-x "$T/list-live-dup.json"
expect "preview-id thiếu role dừng"        4 "(id 303) có role không rõ" -- "$S" preview-id ai-x "$T/list-norole.json"
expect "preview-id live thiếu id vẫn dừng" 4 "(id không rõ) có role live" -- "$S" preview-id ai-x "$T/list-live-noid.json"
expect "preview-id unpublished"            0 "101"                     -- "$S" preview-id "$N" "$T/list-4.json"
expect "preview-id development"            0 "404"                     -- "$S" preview-id ai-x "$T/list-dev.json"
expect "preview-id 5.0 gid→số"             0 "202"                     -- "$S" preview-id "$N" "$T/list-5.json"
expect "preview-id role khác có warning"   0 "::warning::bỏ qua theme 'ai-x' (id 505) role demo" -- "$S" preview-id ai-x "$T/list-demo.json"
expect_empty "preview-id role khác → rỗng"     -- "$S" preview-id ai-x "$T/list-demo.json"
expect "preview-id demo + unpublished"     0 "606"                     -- "$S" preview-id ai-x "$T/list-demo-unpub.json"
expect_empty "preview-id không trùng tên → rỗng" -- "$S" preview-id ai-khong-co "$T/list-4.json"
expect_empty "preview-id lỗi CLI → rỗng"       -- "$S" preview-id ai-x "$T/error.json"
expect "preview-id không phải JSON → lỗi"  1 "không phải JSON"         -- "$S" preview-id ai-x "$T/notjson.json"
expect "live-theme-warn live tên ai-*"     0 "::warning::live theme đang là preview ai-x (id 157463609441)" -- "$S" live-theme-warn "$T/list-live-4.json"
expect "live-theme-warn LIVE hoa"          0 "::warning::live theme đang là preview ai-x" -- "$S" live-theme-warn "$T/list-live-5.json"
expect "live-theme-warn role main"         0 "::warning::live theme đang là preview ai-x" -- "$S" live-theme-warn "$T/list-main.json"
expect "live-theme-warn tên thường"        0 "live theme: Skeleton (id 100)" -- "$S" live-theme-warn "$T/list-4.json"
expect "live-theme-warn không có live"     0 "::warning::danh sách theme không có theme live" -- "$S" live-theme-warn "$T/list-nolive.json"
expect "live-theme-warn lỗi CLI"           0 "::warning::không đọc được danh sách theme" -- "$S" live-theme-warn "$T/error.json"
expect "push 4.x OK"                  0 "101"                     -- "$S" push-result "$T/push-4.json"
expect "push 5.0 ok gid→số"           0 "202"                     -- "$S" push-result "$T/push-5-ok.json"
expect "push theme_id top-level"      0 "404"                     -- "$S" push-result "$T/push-5-themeid.json"
expect "push 5.0 partial = lỗi (3)"   3 "status=partial issues=2" -- "$S" push-result "$T/push-5-partial.json"
expect "push 5.0 partial in issues"   3 "::error file=blocks/hero.liquid::Liquid syntax error" -- "$S" push-result "$T/push-5-partial.json"
expect "push 5.0 partial không issues" 1 "status=partial issues=0" -- "$S" push-result "$T/push-5-partial-empty.json"
expect "push issues không status = lỗi" 3 "Upload failed"         -- "$S" push-result "$T/push-5-issues.json"
expect "push error envelope"          1 "Failed to access local storage" -- "$S" push-result "$T/error.json"
expect "push thiếu id"                1 "không có theme.id"       -- "$S" push-result "$T/push-noid.json"
expect "check 4.x sạch"               0 "error=0 warning=0"       -- "$S" check-report "$T/check-4-clean.json"
expect "check 4.x lỗi, dòng/cột 0→1"  1 "::error file=blocks/hero.liquid,line=1,col=5,title=MissingTemplate::Missing a, b" -- "$S" check-report "$T/check-4-error.json"
expect "check 4.x warning dòng 10"    0 "::warning file=blocks/hero.liquid,line=10,col=1" -- "$S" check-report "$T/check-4-warn.json"
expect "check 5.0 lỗi, dòng/cột giữ"  1 "::error file=blocks/hero.liquid,line=1,col=5,title=MissingTemplate::Missing a, b" -- "$S" check-report "$T/check-5-error.json"
expect "check 5.0 đếm"                1 "error=1 warning=1"       -- "$S" check-report "$T/check-5-error.json"
expect "check 5.0 chỉ warning"        0 "error=0 warning=1"       -- "$S" check-report "$T/check-5-warn.json"
expect "check 5.0 mảng phẳng"         1 "line=2,col=3"            -- "$S" check-report "$T/check-5-flat.json"
expect "check 5.0 rỗng"               0 "error=0"                 -- "$S" check-report "$T/check-5-empty.json"
expect "check lỗi CLI → fail"         5 "CLI lỗi"                 -- "$S" check-report "$T/error.json"
expect "check không phải JSON → fail" 1 "không phải JSON"         -- "$S" check-report "$T/notjson.json"

echo "pass=$PASS fail=$FAIL"
[ "$FAIL" = 0 ]
