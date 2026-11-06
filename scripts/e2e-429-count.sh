#!/usr/bin/env bash
# ES1-T100: đếm test skip do 429 trong log CI (dòng 'trả 429', support/product-data.ts in ra), theo job.
# Dùng: scripts/e2e-429-count.sh <run-id> [run-id...]   hoặc   scripts/e2e-429-count.sh --log <file>
# Log dạng `gh run view --log`: <job>\t<step>\t<dòng log>. Trả về bảng markdown cho PR.
set -euo pipefail

count_log() {
  local run="$1"
  awk -F'\t' -v run="$run" '
    /trả 429/ { n[$1]++; total++ }
    END {
      for (job in n) printf "| %s | %s | %d |\n", run, job, n[job] | "sort"
      close("sort")
      printf "| %s | tổng | %d |\n", run, total + 0
    }'
}

[ "$#" -gt 0 ] || { echo "Dùng: $0 <run-id>... | --log <file>" >&2; exit 2; }
echo "| Run | Job | Số dòng trả 429 |"
echo "| --- | --- | --- |"
if [ "$1" = "--log" ]; then
  [ -f "${2:-}" ] || { echo "Không thấy file log: ${2:-}" >&2; exit 2; }
  count_log "$(basename "$2")" < "$2"
  exit 0
fi
for run in "$@"; do
  gh run view "$run" --log | count_log "$run"
done
