# ES1-T385 — dữ liệu blog TE-20 trên store dev hoa-qua-nhap-khau (Claude Code, Admin API, 19/11/2026)

Theo ES1-T507 (CTO 19/11 chốt). Chỉ store dev. Không publish, không đổi theme, không xoá dữ liệu có sẵn. Tạo bằng `shopify store execute` (blogCreate, articleCreate), idempotent theo handle; gỡ được theo id dưới đây (blogDelete xoá cả bài).

Mọi bài: đã publish, tác giả Efitco, ngày đăng 2026-10-01 + n (số lớn hơn = mới hơn), ảnh lấy lại từ efx-blog-1..3, body 3 đoạn (có 1 link) và summary ngắn (meta description < 160).

figma-blog (gid://shopify/Blog/95968624737, 11 bài) đã ở chế độ bình luận MODERATED (bật, cần duyệt) từ trước — không đổi.

| Loại | Handle | Bình luận | Id | Ghi chú |
|---|---|---|---|---|
| blog | te20-empty | CLOSED | gid://shopify/Blog/96205373537 | blog 0 bài → TE385_EMPTY_BLOG_PATH |
| blog | te20-paged | MODERATED | gid://shopify/Blog/96205406305 | 12 bài, đủ ảnh, tag Strength/Cardio/Recovery → TE385_PAGED_BLOG_PATH |
| article | te20-paged/te20-paged-01 |  | gid://shopify/Article/570493567073 |  |
| article | te20-paged/te20-paged-02 |  | gid://shopify/Article/570493599841 |  |
| article | te20-paged/te20-paged-03 |  | gid://shopify/Article/570493632609 |  |
| article | te20-paged/te20-paged-04 |  | gid://shopify/Article/570493665377 |  |
| article | te20-paged/te20-paged-05 |  | gid://shopify/Article/570493698145 |  |
| article | te20-paged/te20-paged-06 |  | gid://shopify/Article/570493730913 |  |
| article | te20-paged/te20-paged-07 |  | gid://shopify/Article/570493763681 |  |
| article | te20-paged/te20-paged-08 |  | gid://shopify/Article/570493796449 |  |
| article | te20-paged/te20-paged-09 |  | gid://shopify/Article/570493829217 |  |
| article | te20-paged/te20-paged-10 |  | gid://shopify/Article/570493861985 |  |
| article | te20-paged/te20-paged-11 |  | gid://shopify/Article/570493894753 |  |
| article | te20-paged/te20-paged-12 |  | gid://shopify/Article/570493927521 |  |
| blog | te20-no-tag | MODERATED | gid://shopify/Blog/96205471841 | 3 bài không tag, có ảnh → TE385_NO_TAG_BLOG_PATH |
| article | te20-no-tag/te20-no-tag-01 |  | gid://shopify/Article/570493960289 |  |
| article | te20-no-tag/te20-no-tag-02 |  | gid://shopify/Article/570493993057 |  |
| article | te20-no-tag/te20-no-tag-03 |  | gid://shopify/Article/570494025825 |  |
| blog | te20-edge | MODERATED | gid://shopify/Blog/96205504609 | → TE385_EDGE_BLOG_PATH |
| article | te20-edge/te20-edge-no-image |  | gid://shopify/Article/570494058593 | tag, không ảnh → TE385_ARTICLE_NO_COVER_PATH |
| article | te20-edge/te20-edge-empty-content |  | gid://shopify/Article/570494091361 | tag, có ảnh, content rỗng |
| article | te20-edge/te20-edge-no-tag |  | gid://shopify/Article/570494124129 | không tag, có ảnh |
| article | te20-edge/te20-edge-normal |  | gid://shopify/Article/570494156897 | tag, ảnh, content (mới nhất = bài nổi bật) |
| blog | te20-single | MODERATED | gid://shopify/Blog/96205537377 | 1 bài → TE385_SINGLE_ARTICLE_PATH |
| article | te20-single/te20-single-only |  | gid://shopify/Article/570494189665 |  |
| blog | te20-closed | CLOSED | gid://shopify/Blog/96205570145 | tắt bình luận, 1 bài → TE385_NO_COMMENTS_ARTICLE_PATH |
| article | te20-closed/te20-closed-article |  | gid://shopify/Article/570494222433 |  |
| blog | te20-comments | AUTO_PUBLISHED | gid://shopify/Blog/96205602913 | bình luận tự đăng; chờ 11 bình luận → TE385_COMMENTS_PAGED_PATH |
| article | te20-comments/te20-comments-paged |  | gid://shopify/Article/570494255201 |  |

## Chưa làm

- TE385_COMMENTS_PAGED_PATH: Admin GraphQL không có mutation tạo bình luận (chỉ commentApprove/Delete/Spam/NotSpam); storefront có mật khẩu (STORE_PASSWORD không có trong phiên Claude Code) và form bình luận có thể bị hCaptcha. Cần đăng ≥ 11 bình luận tay vào /blogs/te20-comments/te20-comments-paged (blog AUTO_PUBLISHED, không phải duyệt), rồi đặt khoá này.
- TE385_STORE_STATE=configured (AC15): theme dùng templates/blog.liquid, article.liquid (Liquid, không JSON) nên không cấu hình eyebrow/heading trên store; làm ticket riêng theo hướng fixture ES1-T331.
