KHÔNG CHẮC: ticket ghi "đặt nội dung Figma trong template"; đặt vào templates/blog.liquid, article.liquid thì trái ADR 0011 §2–3, §5 và làm đỏ TC-48 ES1-T385 (theme mới cài không eyebrow). Làm bằng template test `?view=figma` (ADR 0011 §6), template mặc định giữ nguyên. Chờ Tech Lead chốt ở ES1-T511; TC-49 cần thêm `?view=figma` vào URL.

# ES1-T510 TE-20 FE: fixture AC15 blog/article (eyebrow/heading Figma trên store dev)

Nguồn: ES1-T510, ES1-T507 #2 (CTO 19/11), docs/ui-spec/blog.md §2, article.md §1.5 + bảng settings, ADR 0011, TC-48/TC-49 ES1-T385 (nhánh feature/ai-ES1-T385).

## Thay đổi
- `templates/blog.figma.liquid` (mới): như blog.liquid, `blog-articles` nhận `eyebrow: 'From the Efitco blog'` (Figma 1:1024).
- `templates/article.figma.liquid` (mới): như article.liquid, `related-articles` nhận `eyebrow: 'From the Efitco blog'`, `heading: 'More Training Tips'` (Figma 1:1024, 1:1025).
- Tham số trùng id setting → gán `block.settings.eyebrow/heading` (AGENTS.md "The block tag"). Schema không đổi: `eyebrow`, `heading` vẫn không default (D10, ES1-T308 #1). Locale không đổi.
- `drafts/dev-fe/ES1-T510/fixture-blog.json`: đoạn `blocks[]` cho QA gộp vào `tests/fixtures/home-figma.json` (file QA, Dev FE không sửa).

Không đổi: blocks, snippets, CSS, JS, locales, settings_schema. Không file JS trong diff.

## Dùng trên store dev
- Blog: `/blogs/figma-blog?view=figma` → eyebrow "From the Efitco blog" trên h1.
- Bài: `/blogs/figma-blog/<handle>?view=figma` → hàng bài liên quan eyebrow "From the Efitco blog", h2 "More Training Tips".
- Không cần thao tác editor/Admin; push preview từ repo là có (khác fixture trang chủ ES1-T331 phải áp sau push).
- `/blogs/figma-blog` (không view) giữ trạng thái theme mới cài → TC-48 vẫn đúng.

## Việc kéo theo (ES1-T511)
- QA ES1-T385: TC-49 mở `${BLOG}?view=figma` và `${path}?view=figma`; sau merge đặt `TE385_STORE_STATE=configured` trong tests/e2e/store-data.json; gộp fixture-blog.json + 1 dòng vào content-fixture.md.
- DevOps TS-OPS1: theme-zip.sh loại `templates/*.figma.liquid` (và index.te*) khỏi gói release.
- Ticket blocked_by ES1-T478 (tách CSS): PR này không đụng CSS, không phụ thuộc thực tế.

## Tự kiểm tra
- `shopify theme check --fail-level error`: 0 lỗi; 22 warning có sẵn ở 7 file khác, 0 ở 2 file mới.
- Spec tĩnh quét templates/ (ES1-T316, T323, T338, T485, T108): 2 file mới không có script, data-*-src, product-swatch, .json → không ảnh hưởng.
- ADR 0011 grep (`collections['|all_products['|images['|metafields.custom|23:59|home_demo`): 0 trong 2 file mới.
- Placeholder/rỗng: giữ nguyên logic block (blog rỗng, bài duy nhất → không render related; editor có placeholder).
- Preview, Playwright (TC-48, TC-49 sau khi QA sửa URL), Lighthouse blog/article, ảnh 360/768/1280: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
