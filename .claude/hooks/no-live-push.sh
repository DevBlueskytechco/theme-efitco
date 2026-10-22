#!/usr/bin/env bash
# PreToolUse Bash. Chặn mọi lệnh đụng production hoặc store ngoài hoa-qua-nhap-khau (efitco-ai-dev).
set -euo pipefail
INPUT=$(cat)
CMD=$(echo "$INPUT" | jq -r '.tool_input.command // empty')
[ -z "$CMD" ] && exit 0
deny() { echo "no-live-push: chặn lệnh ($1): $CMD" >&2; exit 2; }
echo "$CMD" | grep -Eq 'theme (publish|delete)|theme push[^|]*--live|--allow-live' && deny "production"
echo "$CMD" | grep -Eq 'git push[^|]*(origin )?(main|develop)\b' && deny "nhánh bảo vệ"
echo "$CMD" | grep -Eq 'git push[^|]*(--force|-f\b)' && deny "force push"
if echo "$CMD" | grep -Eq -- '--store[= ]'; then
  echo "$CMD" | grep -Eq -- "--store[= ]*${SHOPIFY_FLAG_STORE:-hoa-qua-nhap-khau (efitco-ai-dev)}" || deny "store không phải hoa-qua-nhap-khau (efitco-ai-dev)"
fi
exit 0
