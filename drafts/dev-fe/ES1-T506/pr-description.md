KHÔNG CHẮC: chưa chạy preview/axe trên store; tên truy cập, vòng focus, giao diện card trang chủ xác nhận bằng CI (TE-16 TC-20/21/24/25, ES1-T381). TC-05 tests/e2e/ES1-T385.spec.ts nằm trên nhánh feature/ai-ES1-T385, chưa có ở nhánh này — QA gỡ test.fail khi merge.

# ES1-T506 — Link card blog: tên truy cập = tiêu đề bài (TE-20 AC2)

Bug ES1-T385-B01. `snippets/article-card.liquid`: `<a.article-card__link>` bọc tag, tiêu đề, excerpt, meta nên accname = tất cả.

Bản đầu dùng `aria-labelledby` tới tiêu đề → CI đỏ axe serious `label-content-name-mismatch` ở trang chủ (WCAG 2.5.3: tên truy cập không chứa chữ hiển thị của link). Bản này theo hướng thứ hai của ticket: link chỉ bọc chữ tiêu đề trong heading, `::after` phủ card (giống `.blog-articles__featured-link`).

## Thay đổi
- `snippets/article-card.liquid`: khung card là `<div class="article-card__frame" data-testid="article-card-frame">` (ảnh, tag, nội dung); `<a class="article-card__link" data-testid="article-card-link">` chỉ bọc `article.title` trong `<hN class="article-card__title">`. Bỏ `aria-labelledby`, `id` tiêu đề, param `id_prefix`.
- `blocks/blog-articles.liquid`, `blocks/related-articles.liquid`: bỏ `id_prefix: block.id` (về như develop).
- `assets/base.css` (CSS chung, card dùng ở trang chủ):
  - Khung (tỉ lệ 3/4, bo, nền tối, overflow clip, flex đáy) chuyển từ `.article-card__link` sang `.article-card__frame`; thêm `isolation: isolate`, ảnh `z-index: -1` để `.article-card__content` bỏ `position: relative` (không còn là khối chứa của `::after`).
  - `.article-card__link::after`: `position: absolute; inset: 0; z-index: 1` phủ cả khung (trên tag, dòng thời gian đọc `position: relative` ở trang chủ) → bấm đâu trên card cũng mở bài.
  - Focus: vòng 2px màu nhấn vẽ ở `::after` (outline-offset -2px, bo theo khung) bao cả card; hover khung gạch chân tiêu đề như cũ.
- `assets/aux.css`: selector gradient trang blog đổi `.article-card__link >` → `.article-card__frame >`.
- `snippets/page-title.liquid` (CTO 19/11, ES1-T507 #4): `data-testid="page-title-eyebrow"`, `data-testid="page-title-meta"` (giữ từ bản đầu).

Không JS, không locale. Card không có phần tử tương tác nào khác.

## Test
- `tests/e2e/TE-16.spec.ts`: TC-20 và test card không ảnh đọc nền tối ở `article-card-frame` (thay link); TC-21/22 vòng focus kiểm ở `::after` của link (style khác none, màu không trong suốt); TC-24 tên link **bằng** tiêu đề (trước: chứa tiêu đề).
- `tests/e2e/ES1-T381.spec.ts`: test tĩnh mới — snippet đúng 1 `<a>`, link chỉ bọc tiêu đề trong heading, không `aria-labelledby`; CSS khung/`::after`/focus, content và title không `position`.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi (22 warning có sẵn, không ở file sửa).
- gzip -9: base.css 47 578 B (trần 49 152), aux.css 6 706 B (trần 16 384).
- `npx playwright test --list` TE-16, ES1-T381: 86 test. Test tĩnh ES1-T381, ES1-T382, ES1-T407, TE-16: đạt (không store). Các spec liên quan khác chạy không store: mọi lỗi chỉ do không có store (page.goto).
