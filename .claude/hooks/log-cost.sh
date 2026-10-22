#!/usr/bin/env bash
# Stop hook. Ghi một dòng JSON vào ai-team/evals/raw/_runs.jsonl (Orchestrator đọc và đẩy vào Postgres).
set -euo pipefail
INPUT=$(cat)
OUT="${AI_TEAM_DIR:-../ai-team}/evals/raw/_runs.jsonl"
mkdir -p "$(dirname "$OUT")"
jq -c --arg agent "${AI_AGENT:-unknown}" --arg ticket "${AI_TICKET:-}" --arg ver "${AI_AGENT_VERSION:-}" \
  '{ts: (now|todate), agent: $agent, ticket: $ticket, agent_version: $ver, session_id: .session_id, transcript: .transcript_path}' \
  <<< "$INPUT" >> "$OUT"
exit 0
