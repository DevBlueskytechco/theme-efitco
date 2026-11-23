ES1-T518 (ES1-T385-B03): meta description trang bài viết ≤ 160 ký tự (TE-20 AC14)

Nguồn: srs TE-20 AC14; docs/ui-spec/article.md §8 "meta description = article.excerpt_or_content | strip_html | truncate: 160 (snippet meta-tags)".

Thay đổi
- snippets/meta-tags.liquid: nhánh request.page_type == 'article' gán og_description = article.excerpt_or_content | replace '</p>' → '</p> ' | strip_html | strip_newlines | strip | truncate: 160. Thêm khoảng trắng sau </p> để các đoạn không dính chữ sau strip_newlines. Kết quả rỗng thì giữ chuỗi dự phòng cũ (page_description → shop.description → shop.name), vẫn luôn có 1 meta description.
- meta name="description", og:description, twitter:description dùng cùng một giá trị (ui-spec không đòi khác).
- tests/e2e/ES1-T385.spec.ts: gỡ test.fail ES1-T518 ở TC-45b và bỏ mã ES1-T518 khỏi chú thích danh sách bug đã biết (dòng 16). Ticket và comment claude-code 21/11 yêu cầu gỡ; giữ test.fail thì test đỏ vì unexpected pass.

Ghi chú
- Chỉ trang article đổi. Trang khác vẫn dùng page_description như cũ.
- truncate: 160 tính cả "..." nên tổng ≤ 160. Entity HTML trong content (vd &nbsp;) vẫn để nguyên như hành vi strip_html; không ảnh hưởng độ dài tối đa.
- Không JS, không CSS trong diff.

Tự kiểm tra
- shopify theme check: 0 lỗi (9 warning có sẵn ở quiz-step, index*.liquid, không liên quan).
- E2E TC-45, TC-45b (ES1-T385.spec.ts, desktop): chờ CI.
- Lighthouse SEO/A11y/Perf trang bài viết trên preview: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
