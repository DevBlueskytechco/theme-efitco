#!/usr/bin/env bash
# CHỈ DevOps người chạy. Upload zip lên store ember-canvas thành theme mới (unpublished) qua Admin GraphQL themeCreate.
# Cần: CANVAS_STORE (xxx.myshopify.com), CANVAS_ADMIN_TOKEN (scope write_themes), ZIP_URL (zip đã đưa lên nơi tải được, ví dụ GitHub release asset).
set -euo pipefail
: "${CANVAS_STORE:?}" "${CANVAS_ADMIN_TOKEN:?}" "${ZIP_URL:?}"
NAME="${1:-theme-ember $(date +%Y%m%d-%H%M)}"
read -r -p "Upload '$NAME' lên $CANVAS_STORE? (yes/no) " ok; [ "$ok" = "yes" ] || exit 1
curl -sS -X POST "https://$CANVAS_STORE/admin/api/2026-10/graphql.json" \
  -H "X-Shopify-Access-Token: $CANVAS_ADMIN_TOKEN" -H "Content-Type: application/json" \
  -d "$(jq -n --arg n "$NAME" --arg u "$ZIP_URL" '{query:"mutation($n:String!,$u:URL!){themeCreate(name:$n,source:$u){theme{id name role} userErrors{field message}}}",variables:{n:$n,u:$u}}')" | jq .
echo "Mở Shopify admin → Online Store → Themes → '$NAME' → Open in Canvas; dán link vào ticket QA."
