KHÔNG CHẮC: gzip sau tách là ước lượng (Node/gzip bị chặn phiên này); editor/Canvas nạp link khi thêm block chưa kiểm — cả hai nằm trong DoD ES1-T565/T566. Mã TE-10-R2-FE9/FE10 lấy số kế tiếp, chưa đối chiếu bảng ES1-T307; Tech Lead cập nhật task-split ES1-T307 §7 khi CTO duyệt.

# ES1-T564 — chia việc FE theo ADR 0014 (CSS theo block)

Nguồn: docs/adr/0014-css-theo-block.md, docs/adr/0013 (sửa đổi 21/11), drafts/techlead/ES1-T564/selector-map.md, drafts/techlead/ES1-T564/agents-md.md.

| Ticket | Mã | Phía | Pt | Sprint | Blocked by | Tên |
|---|---|---|---|---|---|---|
| ES1-T565 | TE-10-R2-FE9 | FE | 5 | 2 | — | assets/quiz.css + shop-the-look.css + bundle-builder.css + featured-product.css + image-with-text.css (mới) + 5 block stylesheet_tag + base.css, collection.css |
| ES1-T566 | TE-10-R2-FE10 | FE | 5 | 2 | ES1-T565 | assets/testimonials.css + video-carousel.css + faq.css + shop-by-level.css + multicolumn.css + hello-world.css (mới) + 8 block stylesheet_tag + base.css, aux.css; trần base 40 960 |

Không có task BE: không đổi JS, partial, custom element. Không task QA riêng: spec tĩnh `tests/e2e/ES1-T565.spec.ts` theo tiền lệ ES1-T478 (FE viết spec tĩnh của chính việc tách); e2e store hiện có phải xanh.

## Giải pháp (quyết định + đầu ra)

- ES1-T565:
  - 5 file block theo selector-map mục 1–5. `.quiz-page__breadcrumb*` → collection.css.
  - 5 dòng `stylesheet_tag` trước root block, ngoài partial, không preload.
  - Spec tĩnh ES1-T565 (ADR 0014 mục Đo). Sửa ES1-T341, T387, T403, T478 đọc file mới.
  - base.css ≤ 49 152 và giảm so với develop.
- ES1-T566:
  - 6 file block theo selector-map mục 6–11. contact-form focus → aux.css.
  - 8 dòng `stylesheet_tag`: testimonials, video-carousel, faq, contact-aside, shop-by-level, multicolumn, hello-world, liquid-tips.
  - Hạ trần base.css 40 960 ở ES1-T326, T365, T369, T387, T478, T565. Sửa ES1-T157, T186, T383, T403.

## Hợp đồng FE/BE (không đổi)

| Custom element (ai đặt host) | Hook data-* | data-testid | Partial | data-layer | data-bottom-bar |
|---|---|---|---|---|---|
| giữ nguyên mọi block (quiz-finder, bundle-form, featured-product, video-carousel, scroll-buttons…), FE không đổi markup | giữ nguyên | giữ nguyên | giữ nguyên; dòng link CSS phải ngoài `quiz-results`, `quiz-results-actions`, `product-price`, `product-buy-buttons` | giữ nguyên | giữ nguyên |

## DoD chung (chi tiết ở body ticket)

- `shopify theme check` 0 lỗi, không override.
- `npx playwright test` toàn bộ xanh như develop trước PR; spec liệt kê trong ticket xanh `--project=desktop`.
- gzip (`zlib.gzipSync` mặc định):
  - mỗi file block ≤ 8 192 B;
  - base.css ≤ 49 152 B (T565), ≤ 40 960 B (T566);
  - file nhóm trang ≤ 16 384 B;
  - critical.css ≤ 10 240 B thô;
  - base.css + file block ở index ≤ 53 248 B, số file block ở index ≤ 10.
- So ảnh trước/sau, `reducedMotion`, 0 khác biệt bố cục:
  - index ở 360, 768, 1280, 1920;
  - page.contact ở 360, 1280 (T566).
- `npx lhci autorun`:
  - desktop ≥ 96, mobile ≥ 90, a11y ≥ 98;
  - trang chủ không giảm perf, LCP không tăng.
- Theme editor store dev: thêm block từ editor có style ngay.
- 0 file `assets/*.js` thay đổi (scope-guard).

## Rủi ro đã ghi trong ADR 0014

- Thứ tự cascade đổi: rule chung nằm sau trong base.css giờ thua rule block cùng độ ưu tiên (`.button` @80rem 8979, `.price` 9189, `.rating-stars` 9133, `.button[aria-busy]` 9244, `.contact-aside .faq-item*` trong aux.css). Phát hiện bằng so ảnh, sửa không dùng `!important`.
- Firefox FOUC ngắn ở block dưới màn đầu khi chưa cache.
- PR đang mở #287, #292, ES1-T529 vượt 49 152: không nâng trần, rebase sau ES1-T565.
