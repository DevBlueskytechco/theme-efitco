#!/usr/bin/env bash
# PreToolUse Write|Edit. Chặn ghi ngoài phạm vi của agent. Agent lấy từ AI_AGENT (Orchestrator set) hoặc tham số 1.
set -euo pipefail
INPUT=$(cat)
AGENT="${1:-${AI_AGENT:-unknown}}"
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
[ -z "$FILE" ] && exit 0
REL="${FILE#"$PWD"/}"

deny() { echo "scope-guard: $AGENT không được ghi $REL ($1)" >&2; exit 2; }

# Cấm chung
case "$REL" in
  sections/*) deny "Skeleton không có sections/" ;;
  templates/*.json) deny "không JSON template" ;;
  .theme-check.yml) deny "không override theme check" ;;
  .claude/*|.mcp.json|CLAUDE.md|AGENTS.md) deny "cấu hình agent do người quản trị sửa" ;;
esac

allowed=""
case "$AGENT" in
  qa)        allowed='^(tests/|drafts/qa/)' ;;
  writer)    allowed='^(docs/merchant/|drafts/writer/)' ;;
  dev-fe)    allowed='^(blocks/|snippets/|templates/|layout/|assets/.*\.css$|config/settings_schema\.json$|config/settings_data\.json$|locales/|drafts/dev-fe/)' ;;
  dev-be)    allowed='^(assets/.*\.js$|snippets/|blocks/|templates/|drafts/dev-be/|tests/)' ;;
  techlead)  allowed='^(docs/adr/|docs/architecture\.md$|CONVENTION\.md$|drafts/techlead/)' ;;
  devops)    allowed='^(\.github/|scripts/|docs/runbook|lighthouserc|playwright\.config|drafts/devops/)' ;;
  designer)  allowed='^(docs/ui-spec/|tokens\.json$|drafts/designer/)' ;;
  ba)        allowed='^(docs/srs-draft/|drafts/ba/)' ;;
  po)        allowed='^(drafts/po/)' ;;
  gate-reviewer) deny "gate-reviewer chỉ đọc" ;;
  *)         allowed='^drafts/' ;;
esac
echo "$REL" | grep -Eq "$allowed" || deny "ngoài phạm vi, cho phép: $allowed"
# Dev FE không được đụng JS dù match snippets/blocks ở trên
if [ "$AGENT" = "dev-fe" ] && echo "$REL" | grep -Eq '\.js$'; then deny "JS thuộc Dev BE"; fi
exit 0
