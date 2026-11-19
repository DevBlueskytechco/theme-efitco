#!/bin/sh
# Liệt kê class trong assets/base.css không xuất hiện ở Liquid/JS/config (ứng viên CSS chết)
grep -o '\.[a-z][a-z0-9_-]*' assets/base.css | sort -u | sed 's/^\.//' | while read -r c; do
  grep -rqF -- "$c" blocks snippets layout templates assets/*.js config 2>/dev/null || echo "$c"
done
