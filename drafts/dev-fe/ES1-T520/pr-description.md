ES1-T520 (ES1-T385-B04): đoạn .rte bài viết về 16px / lh 1.7 ở mọi mốc

Nguồn: docs/srs.md TE-10 AC15; docs/ui-spec/foundation.md §28 (CTO 11/11, thay article.md §3/§4). TE-20 AC10.

Thay đổi
- assets/aux.css: bỏ `.article-main .rte { font-size: var(--font-size-lg); }` trong `@media (min-width: 64rem)`. Đoạn .rte rơi về body `--font-size-base` (1rem = 16px) + `.rte :is(p, ul, ol) { line-height: 1.7; max-inline-size: 65ch }` ở base.css → 16px / 27.2px ở 360, 768, 1280, 1920.
- tests/e2e/ES1-T385.spec.ts: gỡ `test.fail` ES1-T520 ở TC-33 1280/1920 (nếu giữ sẽ đỏ vì unexpected pass); cập nhật 2 comment nhắc bug.
- Không đổi Liquid, không file JS, base.css không đổi byte.

Chưa làm
- Bảng mốc docs/ui-spec/article.md §3 vẫn ghi "Chữ nội dung 18 / 1.7" ở 1280, 1920; foundation §28 đã thay. Sửa docs thuộc BA/Designer, chưa đụng.

Tự kiểm tra
- shopify theme check: 0 lỗi (9 warning có sẵn, không thuộc diff).
- grep tests/e2e: không spec nào khác kỳ vọng 18px cho .rte bài viết.
- E2E TC-33 (360, 768, 1280, 1920), Lighthouse, ảnh 3 breakpoint: chờ CI. TC-33 cần bài có ảnh bìa trong /blogs/figma-blog trên store dev.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
