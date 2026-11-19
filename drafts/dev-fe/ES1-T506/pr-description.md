KHÔNG CHẮC: chưa chạy preview/axe; tên truy cập xác nhận bằng CI (tests/e2e/ES1-T385.spec.ts TC-05 nằm trên nhánh feature/ai-ES1-T385, chưa có ở nhánh này — QA gỡ test.fail khi merge).

# ES1-T506 — Link card blog: tên truy cập = tiêu đề bài (TE-20 AC2)

Bug ES1-T385-B01. `snippets/article-card.liquid`: `<a.article-card__link>` bọc tag, tiêu đề, excerpt, meta nên accname = tất cả. Chọn cách `aria-labelledby` tới id tiêu đề (không đổi DOM/CSS → card trang chủ giữ nguyên giao diện, TE-20 AC8).

## Thay đổi
- `snippets/article-card.liquid`
  - Thêm param `[id_prefix]` (mặc định `article-card`); id tiêu đề = `{id_prefix}-article-{article.id}`.
  - `<a ... aria-labelledby="<id>">`, `<hN class="article-card__title" id="<id>">`.
  - Doc ghi lý do, cách đặt id.
- `blocks/blog-articles.liquid`, `blocks/related-articles.liquid`: truyền `id_prefix: block.id` (2 block cùng trang không trùng id).
- `blocks/blog-posts.liquid`: KHÔNG đổi — test tĩnh ES1-T381 khoá đúng chuỗi `{% render 'article-card', article: post %}` (AC8); dùng prefix mặc định. Giới hạn: 2 block blog-posts cùng nguồn trên một trang sẽ trùng id (trường hợp hiếm, cùng bài → cùng tiêu đề nên tên link vẫn đúng).
- `snippets/page-title.liquid` (CTO 19/11, ES1-T507 #4): thêm `data-testid="page-title-eyebrow"`, `data-testid="page-title-meta"`.

Không file JS, không đổi CSS, không locale.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi (22 warning có sẵn, không ở file sửa).
- Test tĩnh: ES1-T381 (chuỗi render blog-posts) giữ nguyên; ES1-T382 `toContain("render 'article-card', article: post")` vẫn khớp; ES1-T326/T330 thứ tự class page-title không đổi.
- Accname, Lighthouse a11y/perf, ảnh 3 breakpoint: chờ CI.
