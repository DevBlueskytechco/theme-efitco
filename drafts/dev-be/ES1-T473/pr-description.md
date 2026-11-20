KHÔNG CHẮC: (1) Playwright chưa chạy trong phiên (global setup cần PREVIEW_URL, không mạng) → chờ CI; (2) sửa 1 dòng `tests/e2e/ES1-T382.spec.ts` (test FE cấm `data-lazy-module` trong article-comments/related-articles, trái D6 task-split ES1-T307 và chính ticket này) — cần FE/QA ES1-T382 xác nhận; (3) URL sau POST bình luận có neo về form hay không do Shopify quyết định; JS nạp lười theo viewport nên nếu trang tải lại ở đầu bài, focus vào hộp chỉ xảy ra khi người dùng cuộn tới (không cướp focus khi đã có phần tử khác được focus).

# ES1-T473 TE-20 BE: related-articles nạp scroll-buttons.js lười + focus hộp trạng thái/lỗi bình luận + aria-busy Post Comment

Hook từ ES1-T382 (TE-20-R2-FE2). Không partial.

## Thay đổi
- `blocks/related-articles.liquid`: `data-lazy-module="{{ 'scroll-buttons.js' | asset_url }}"` trên `<scroll-buttons>` + 1 thẻ `<script src="{{ 'lazy-module.js' | asset_url }}" type="module">` (như blog-posts). Cập nhật dòng hook trong `{% doc %}`. Không đổi markup khác. AC13: 768 chevron 52 + tiến trình; hàng vừa khung `data-static` (logic sẵn có trong scroll-buttons.js, không sửa file).
- `blocks/article-comments.liquid`: `data-lazy-module="{{ 'article-comments.js' | asset_url }}"` trên root `#comments` + 1 thẻ script lazy-module cuối block (trong nhánh `comments_enabled?`). Cập nhật dòng hook trong `{% doc %}`.
- `assets/article-comments.js` (mới, 1 294 B):
  - Tải xong: `#CommentFormErrors` (role=alert) hoặc `[data-testid=comment-status]` (role=status), cả hai tabindex=-1 → `focus({ preventScroll: true })`; chỉ khi focus đang ở body, không chạy trong `Shopify.designMode`. AC12 "nhận focus".
  - `submit` uỷ quyền trên `document` (block render lại trong editor vẫn chạy, không listener treo): sau khi các listener khác chạy (`setTimeout`), nếu submit không bị `preventDefault` (vd hCaptcha) → `aria-busy="true"` trên `[data-testid=comment-submit]` (spinner `.button[aria-busy='true']` có sẵn base.css, giữ bề rộng). Submit lần 2 khi đang busy → `preventDefault`. Form invalid (required) không phát submit → không busy.
  - `pageshow` persisted (bfcache back) → gỡ `aria-busy`.
  - Không fetch, không partials, không console, không import tĩnh.
  - Không JS: form POST thường, Shopify tải lại trang (ES1-T382).
- `tests/e2e/ES1-T473.spec.ts` (mới): tĩnh (trần byte, 1 thẻ script/block, hook Liquid ↔ JS, article-main không script), fixture (focus hộp lỗi, focus hộp status, không cướp focus khi tải thường, aria-busy + chặn gửi lần 2, form invalid không busy, listener captcha chặn → không busy), store (768 related-articles `data-enhanced` + next cuộn hoặc `data-static`; POST thiếu trường → focus `#CommentFormErrors`, hCaptcha → skip có lý do).
- `tests/e2e/ES1-T382.spec.ts` dòng 36: chỉ còn kiểm "không script / data-lazy-module" cho `article-main`; 2 block kia chuyển sang ES1-T473.

## Ngân sách JS (wc -c, ADR 0010)
| File | B |
| --- | --- |
| article-comments.js (mới) | 1 294 |
| scroll-buttons.js (không đổi, trần 1 536) | 1 536 |
| lazy-module.js (không đổi, trần 768) | 765 |

Trang bài viết, cộng tĩnh:
- Chung (layout + header + cart drawer): standard-events 888 + motion 6 129 + page-layers 2 031 + modal-dialog 2 039 + header-menu 3 058 + header-sticky 1 680 + cart-drawer 3 910 = 19 735 (vượt trần nhóm chung 19 456 do cart-drawer 3 910 > 3 072 có từ trước, ngoài ticket này).
- Tải sẵn: 19 735 + lazy-module 765 = 20 500 ≤ 40 960.
- Sau cuộn: 20 500 + scroll-buttons 1 536 + article-comments 1 294 + scroll-extras 3 135 = 26 465 ≤ 65 536.
- Mọi file ≤ 8 192.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi; 22 warning có sẵn ở file khác (bundle-builder, featured-product, quiz-step, testimonial-item, templates/index*), không file nào của ticket.
- `wc -c assets/article-comments.js` = 1 294 ≤ 8 192.
- Locale: không thêm khoá.
- Playwright ES1-T473, ES1-T382, ES1-T316, ES1-T485 (quét mọi assets/*.js, hook asset_url): chờ CI.
- Preview, console error, Lighthouse trang bài viết (desktop/mobile): chờ CI.

## Cho FE
- Không cần setting/chuỗi mới. Hook đã dùng: `data-testid` comment-form, comment-submit, comment-status, `#CommentFormErrors`; scroll-buttons như TE-7-R2-BE1.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
