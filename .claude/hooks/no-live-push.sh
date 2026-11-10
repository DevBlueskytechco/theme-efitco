#!/usr/bin/env bash
# PreToolUse Bash. Chặn mọi lệnh đụng production hoặc store ngoài hoa-qua-nhap-khau (efitco-ai-dev).
set -euo pipefail
INPUT=$(cat)
CMD=$(echo "$INPUT" | jq -r '.tool_input.command // empty')
[ -z "$CMD" ] && exit 0
deny() { echo "no-live-push: chặn lệnh ($1): $CMD" >&2; exit 2; }
# So trên bản đã bỏ dấu nháy và \ (10/11: de""velop, "--li"ve từng lọt regex)
N=$(printf '%s' "$CMD" | tr -d "\"'\\\\")
echo "$N" | grep -Eq 'theme (publish|delete)|theme push[^|]*--live|--allow-live' && deny "production"
echo "$N" | grep -Eq 'git push[^|;&]*[[:space:]:](refs/heads/)?(main|develop)([[:space:];|&]|$)' && deny "nhánh bảo vệ"
echo "$N" | grep -Eq 'git push[^|;&]*(--force|-f\b|\+[A-Za-z0-9/_.-]+)' && deny "force push"
echo "$N" | grep -Eq 'git push[^|;&]*(--delete|-d\b| :[A-Za-z0-9])' && deny "xoá nhánh"
if echo "$N" | grep -Eq -- 'shopify.*(--store|[[:space:]]-s)[= ]'; then
  echo "$N" | grep -Eq -- "(--store|-s)[= ]*${SHOPIFY_FLAG_STORE:-hoa-qua-nhap-khau}" || deny "store không phải hoa-qua-nhap-khau"
fi
exit 0
