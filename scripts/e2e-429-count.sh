#!/usr/bin/env bash
# ES1-T100, ES1-T163: đếm trong log CI theo job (mỗi job e2e là 1 shard): số lần 429 của cartApi (dòng '[cartApi] 429 lần') và test skip do 429 (dòng 'trả 429', support/cart-api.ts và product-data.ts in ra).
# 429 của fetch trong trang (pageJson) không có log nên không vào cột số lần; hết lượt thử vẫn vào cột skip.
# Dùng: scripts/e2e-429-count.sh <run-id> [run-id...]   hoặc   scripts/e2e-429-count.sh --log <file>
# Log dạng `gh run view --log`: <job>\t<step>\t<dòng log>. Trả về bảng markdown cho PR.
set -euo pipefail

count_log() {
  local run="$1"
  awk -F'\t' -v run="$run" '
    /\[cartApi\] 429 lần/ { hit[$1]++; jobs[$1] = 1; hits++ }
    /trả 429/ { skip[$1]++; jobs[$1] = 1; skips++ }
    END {
      for (job in jobs) printf "| %s | %s | %d | %d |\n", run, job, hit[job], skip[job] | "sort"
      close("sort")
      printf "| %s | tổng | %d | %d |\n", run, hits + 0, skips + 0
    }'
}

[ "$#" -gt 0 ] || { echo "Dùng: $0 <run-id>... | --log <file>" >&2; exit 2; }
echo "| Run | Job | Số lần 429 (cartApi) | Test skip do 429 |"
echo "| --- | --- | --- | --- |"
if [ "$1" = "--log" ]; then
  [ -f "${2:-}" ] || { echo "Không thấy file log: ${2:-}" >&2; exit 2; }
  count_log "$(basename "$2")" < "$2"
  exit 0
fi
for run in "$@"; do
  gh run view "$run" --log | count_log "$run"
done
