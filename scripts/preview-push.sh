#!/usr/bin/env bash
# Push theme preview unpublished lên store dev, dùng lại theme cùng tên (tránh đầy 20 slot). Đọc JSON CLI 4.9.5 và 5.0 qua shopify-cli.sh (ES1-T32).
# Dùng: scripts/preview-push.sh [theme-name]   (mặc định ai-<nhánh>, nhánh lấy từ GITHUB_HEAD_REF/GITHUB_REF_NAME hoặc git)
# Cần: SHOPIFY_FLAG_STORE=hoa-qua-nhap-khau.myshopify.com, SHOPIFY_CLI_THEME_TOKEN. Ghi theme_id, url vào GITHUB_OUTPUT nếu có.
# Không --live, không publish. Chỉ xoá theme ai-* cũ nhất khi store đầy (≥ 16 theme, giới hạn 20) — giữ từ #45.
set -euo pipefail
H="$(cd "$(dirname "$0")" && pwd)/shopify-cli.sh"
ALLOWED_STORE="hoa-qua-nhap-khau.myshopify.com"
: "${SHOPIFY_FLAG_STORE:?thiếu SHOPIFY_FLAG_STORE}"
[ "$SHOPIFY_FLAG_STORE" = "$ALLOWED_STORE" ] || { echo "::error::chỉ push lên $ALLOWED_STORE, nhận '$SHOPIFY_FLAG_STORE'"; exit 1; }

# Nhánh PR dùng GITHUB_HEAD_REF (GITHUB_REF_NAME của PR là "15/merge")
BR="${GITHUB_HEAD_REF:-${GITHUB_REF_NAME:-$(git rev-parse --abbrev-ref HEAD)}}"
NAME="${1:-ai-$(echo "$BR" | tr '/' '-' | cut -c1-40)}"
case "$NAME" in ai-*) ;; *) echo "::error::tên theme preview phải bắt đầu bằng ai-: $NAME"; exit 1 ;; esac

W="${RUNNER_TEMP:-${TMPDIR:-/tmp}}/preview-push"; mkdir -p "$W"
find_id() {
  shopify theme list --json > "$W/list.json" 2> "$W/list.err" || { cat "$W/list.json" "$W/list.err" >&2; return 1; }
  "$H" theme-id "$NAME" "$W/list.json"
}

shopify version
# Store dev giới hạn 20 theme: nhánh chưa có theme và store đã ≥ 16 theme → xoá theme ai-* cũ nhất (trừ ai-develop, không đụng live) (#45)
if [ -z "$(find_id || true)" ]; then
  n=$(jq -r '(if type=="array" then . else (.themes // .data // []) end) | map(select(.role != "live")) | length' "$W/list.json" 2>/dev/null || echo 0)
  if [ "${n:-0}" -ge 16 ]; then
    old=$(jq -r '(if type=="array" then . else (.themes // .data // []) end) | map(select((.name|startswith("ai-")) and .name != "ai-develop" and .role != "live")) | sort_by(.id|tostring|ltrimstr("gid://shopify/OnlineStoreTheme/")|tonumber) | .[0].id // empty' "$W/list.json")
    [ -n "$old" ] && { echo "::warning::store đủ theme ($n), xoá preview cũ nhất ${old##*/}"; shopify theme delete --theme "${old##*/}" --force; }
  fi
fi
TID=""
# Shopify đôi khi trả 502 khi tạo theme: thử 3 lần, mỗi lần kiểm lại theme đã được tạo chưa.
# status partial / issues[] (CLI 5.0 thoát != 0) là lỗi nội dung theme: in issues, dừng ngay, không thử lại.
for i in 1 2 3; do
  ID="$(find_id || true)"
  if [ -n "$ID" ]; then ARGS=(--theme "$ID"); else ARGS=(--unpublished --theme "$NAME"); fi
  rc=0; shopify theme push "${ARGS[@]}" --json --path . > "$W/push.json" 2> "$W/push.err" || rc=$?
  prc=0; TID="$("$H" push-result "$W/push.json")" || prc=$?
  [ "$rc" = 0 ] && [ "$prc" = 0 ] && break
  cat "$W/push.json" "$W/push.err" >&2 || true
  [ "$prc" = 3 ] && { echo "::error::theme push partial/issues (rc=$rc) — sửa file theme theo issues ở trên"; exit 1; }
  # 4.x có lúc thoát 0 mà JSON thiếu id: lấy lại id theo tên
  if [ "$rc" = 0 ]; then TID="$(find_id || true)"; [ -n "$TID" ] && break; fi
  echo "::warning::theme push lần $i lỗi (rc=$rc)"
  [ "$i" = 3 ] && { echo "::error::theme push lỗi sau 3 lần"; exit 1; }
  sleep $((i * 20))
done

[[ "$TID" =~ ^[0-9]+$ ]] || { echo "::error::không lấy được theme id: '$TID'"; exit 1; }
URL="https://${SHOPIFY_FLAG_STORE}/?preview_theme_id=${TID}"
echo "theme_name=$NAME"; echo "theme_id=$TID"; echo "url=$URL"
if [ -n "${GITHUB_OUTPUT:-}" ]; then
  { echo "theme_id=$TID"; echo "url=$URL"; } >> "$GITHUB_OUTPUT"
fi
