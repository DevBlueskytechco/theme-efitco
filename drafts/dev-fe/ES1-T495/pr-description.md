fix(meta-tags): luôn in meta description (404, password, gift card) — ES1-T495

Bug: ES1-T386-B05 (drafts/qa/ES1-T386/bugs/B05.md), TE-21 AC16.

Nguyên nhân
- snippets/meta-tags.liquid chỉ in `<meta name="description">` trong `{% if page_description %}`; Shopify không trả page_description cho 404 (và password, gift card) → 0 thẻ.

Thay đổi
- snippets/meta-tags.liquid: bỏ điều kiện, in đúng 1 `<meta name="description">` từ `og_description` = `page_description | default: shop.description | default: shop.name` (chuỗi dự phòng đã có, dùng chung với og:/twitter:description). Trang có page_description giữ nguyên nội dung cũ.
- tests/e2e/ES1-T386.spec.ts: gỡ `test.fail` TC-47 theo ticket, bỏ mã ES1-T386-B05 khỏi danh sách bug đã biết ở đầu file.
- Không file JS, không CSS, không locale.

Ảnh hưởng
- Áp cho mọi trang dùng meta-tags (layout/theme.liquid, layout/password.liquid, templates/gift_card.liquid). Trang thường vẫn 1 thẻ; TE-1 TC-38–40 (`product.hasDescription` → count 1) không đổi.
- SEO: 404/password/gift card ngoài phạm vi SEO 100 (sổ 10/11) nhưng giờ có meta description → không còn audit "Document does not have a meta description".

Tự kiểm tra
- shopify theme check: 0 lỗi (22 warning có sẵn, không ở meta-tags.liquid).
- TC-47 ES1-T386 (404, password, gift card): chờ CI. Gift card cần TS_GIFT_CARD_URL; thiếu thì phần gift card chỉ ghi annotation "thiếu dữ liệu", không coi là đạt.
- Lighthouse 404 desktop/mobile, Playwright, preview: chờ CI.
- Không file JS trong diff.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
