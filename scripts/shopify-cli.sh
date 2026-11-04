#!/usr/bin/env bash
# Ghim Shopify CLI + đọc output JSON của cả CLI 4.9.5 lẫn 5.0 (ES1-T32). Dùng trong CI và scripts/.
#   shopify-cli.sh pinned                     in phiên bản ghim (nguồn duy nhất cho CI)
#   shopify-cli.sh assert-version [ver]       thoát 1 nếu `shopify version` khác ver (mặc định: bản ghim)
#   shopify-cli.sh theme-id <name> <list.json>  in id (chuỗi số) theme đầu tiên trùng tên, rỗng nếu không có
#   shopify-cli.sh push-result <push.json>    in theme id; thoát 3 nếu status partial|failed có issues (in issues), 1 nếu lỗi khác
#   shopify-cli.sh check-report <check.json>  in annotation GitHub (dòng/cột từ 1); thoát 1 nếu có lỗi severity error
# Schema:
#   theme list  4.x: [ {id:123,name,role} ]          5.0: {themes:[ {id:"123",...} ]}
#   theme push  4.x: {theme:{id,preview_url,...}}    5.0: {status:"ok"|"partial"|..., theme:{id:"..."}, issues:[...]}; partial thoát != 0
#   theme check 4.x: [ {path, offenses:[{severity:0|1|2, start_row, start_column (từ 0)}]} ]
#               5.0: issues phẳng {issues:[{path, line, column (từ 1), severity}]} hoặc mảng phẳng
#   lỗi CLI   : {error:{type,message,tryMessage}}
set -euo pipefail

PINNED_CLI="4.9.5"

# id có thể là số, chuỗi số hoặc gid://shopify/OnlineStoreTheme/123 → chỉ lấy số
JQ_LIB='
def idnum: if . == null then empty else (tostring | sub(".*/"; "")) end;
def themes: if type == "array" then . elif type == "object" then (.themes // .data.themes // .data // []) else [] end;
def sev: if type == "number" then (["error","warning","info"][.] // "info")
         elif type == "string" then ascii_downcase
         else "error" end;
def lvl: if . == "error" then "error" elif . == "warning" then "warning" else "notice" end;
def esc: tostring | gsub("%"; "%25") | gsub("\r"; "%0D") | gsub("\n"; "%0A");
def escp: esc | gsub(":"; "%3A") | gsub(","; "%2C");
def msg: (.message // .error // .messages // .detail // "") | if type == "array" then join("; ") else tostring end;
'

die() { echo "::error::$*" >&2; exit 1; }
need_file() { [ -s "$1" ] || die "thiếu hoặc rỗng: $1"; jq -e . "$1" >/dev/null 2>&1 || { cat "$1" >&2; die "không phải JSON: $1"; }; }

cmd="${1:-}"; shift || true
case "$cmd" in
  pinned)
    echo "$PINNED_CLI" ;;

  assert-version)
    want="${1:-$PINNED_CLI}"
    have="$(shopify version 2>/dev/null | grep -Eo '[0-9]+\.[0-9]+\.[0-9]+' | tail -1 || true)"
    [ "$have" = "$want" ] || die "Shopify CLI ${have:-không có} ≠ ${want}. Cài: npm i -g @shopify/cli@${want}"
    echo "shopify cli $have" ;;

  theme-id)
    [ $# -eq 2 ] || die "dùng: theme-id <name> <list.json>"
    need_file "$2"
    jq -r --arg n "$1" "$JQ_LIB"'
      if type == "object" and has("error") then empty
      else themes | map(select(.name == $n)) | (.[0].id // null) | idnum end' "$2" ;;

  push-result)
    [ $# -eq 1 ] || die "dùng: push-result <push.json>"
    need_file "$1"
    jq -r "$JQ_LIB"'
      def theme: (.theme // .data.theme
        // (if type == "object" and has("id") then . elif type == "object" and has("theme_id") then {id: .theme_id} else null end));
      def issues: [ (.issues // .errors // [])[]? | if type == "object" then . else {message: tostring} end ];
      def failing: [ issues[] | select((.severity // "error") | sev == "error") ];
      (if type == "object" then (.status // "ok" | tostring | ascii_downcase) else "invalid" end) as $st
      | if type != "object" then "FAIL\toutput push không phải object"
        elif has("error") and .error != null then
          "FAIL\t" + ((.error | if type == "object" then ((.message // "") + " " + (.tryMessage // "")) else tostring end) | esc)
        elif ($st | IN("partial","failed","failure","error","aborted")) or (failing | length) > 0 then
          "FAIL\tstatus=" + $st + " issues=" + (issues | length | tostring),
          (issues[] | "ISSUE\t" + ((.path // .file // .key // .filename // "") | tostring) + "\t" + (msg | esc))
        else
          ([theme | (.id // null) | idnum] | .[0] // "") as $id
          | if $id == "" then "FAIL\tkhông có theme.id (status=" + $st + ")" else "OK\t" + $id end
        end' "$1" > "$1.parsed"
    rc=0
    while IFS=$'\t' read -r kind a b; do
      case "$kind" in
        OK) echo "$a" ;;
        FAIL) echo "::error::theme push: $a" >&2; rc=1 ;;
        ISSUE) rc=3; if [ -n "$a" ]; then echo "::error file=$a::$b" >&2; else echo "::error::$b" >&2; fi ;;
      esac
    done < "$1.parsed"
    rm -f "$1.parsed"
    exit "$rc" ;;

  check-report)
    [ $# -eq 1 ] || die "dùng: check-report <check.json>"
    need_file "$1"
    jq -r "$JQ_LIB"'
      def norm:
        if type == "object" and has("error") then error("CLI lỗi: " + (.error.message // (.error | tostring)))
        elif type == "array" and (length > 0) and (.[0] | type == "object" and has("offenses")) then
          # 4.x: theo file, start_row/start_column tính từ 0
          .[] | .path as $p | .offenses[]
          | {path: $p, line: ((.start_row // 0) + 1), column: ((.start_column // 0) + 1),
             severity: (.severity | sev), check: (.check // ""), message: msg}
        else
          # 5.0: issues phẳng, line/column tính từ 1
          (if type == "array" then . else (.issues // .offenses // []) end) | .[]
          | {path: (.path // .file // .uri // ""), line: (.line // .start.line // 1), column: (.column // .start.column // 1),
             severity: (.severity | sev), check: (.check // .code // ""), message: msg}
        end;
      [norm] as $all
      | ($all[] | "::" + (.severity | lvl) + " file=" + (.path | escp) + ",line=" + (.line | tostring) + ",col=" + (.column | tostring)
          + ",title=" + (.check | escp) + "::" + (.message | esc)),
        "theme check: error=\([$all[] | select(.severity == "error")] | length) warning=\([$all[] | select(.severity == "warning")] | length) info=\([$all[] | select(.severity != "error" and .severity != "warning")] | length)"
      ' "$1" | tee "$1.parsed"
    errs="$(tail -1 "$1.parsed" | sed -E 's/.*error=([0-9]+).*/\1/')"
    rm -f "$1.parsed"
    [ "$errs" = "0" ] || exit 1 ;;

  *)
    sed -n '2,7p' "$0" >&2; exit 2 ;;
esac
