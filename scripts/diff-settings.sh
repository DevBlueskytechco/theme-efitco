#!/usr/bin/env bash
# So settings_data.json giữa 2 theme (tải bằng shopify theme pull --only config/settings_data.json vào 2 thư mục). Dùng: diff-settings.sh <dirA> <dirB>
set -euo pipefail
diff <(jq -S . "$1/config/settings_data.json") <(jq -S . "$2/config/settings_data.json") || true
