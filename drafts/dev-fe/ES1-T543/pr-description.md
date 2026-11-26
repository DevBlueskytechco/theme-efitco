KHÔNG CHẮC: AC1 (grep opacity 0.35/0.4 trên assets/*.css = 0) còn 1 kết quả ngoài phạm vi: assets/featured-product.css:456 .featured-product__seal opacity 0.4 (không phải disabled, file không nằm trong phạm vi ticket). Đã hỏi Tech Lead ở ES1-T591, chưa sửa.

# ES1-T543 FE: disabled không opacity — nút tròn và facet swatch

Theo mockup chuẩn ES1-T567 (drafts/designer/_kit/kit.css: .round-button[aria-disabled], .section--dark .round-button[aria-disabled], .facet-swatch input:disabled + span::after).

## Thay đổi
- assets/base.css
  - `.round-button:is(:disabled, [aria-disabled='true'])`: bỏ `opacity: 0.35` → `border-color: var(--color-border)`, `background: var(--color-background)`, `color: var(--color-muted-light)`, `scale: none`, `cursor: not-allowed`. Áp cho carousel-nav (collection-list, testimonials, blog-posts, video-carousel…) và pagination (span role=link aria-disabled).
  - `:is(.round-button, .close-button):active` (trong khối motion) thêm `:not(:disabled, [aria-disabled='true'])`: rule :active đứng sau nên trước đây vẫn nhún nút disabled khi bấm.
  - Nền tối: thêm `.block-container--dark .round-button:is(:disabled, [aria-disabled='true'])` → nền `transparent`, viền + icon `var(--color-muted-on-dark)`; đặt ngay sau `.block-container--dark .round-button` nên thắng.
  - Sửa 2 chú thích còn ghi "mờ 0.35".
- assets/collection.css
  - `.filter-option:has(:disabled)` màu `--color-muted` → `--color-muted-light` (5.33:1 theo kit).
  - `.filter-option__input:disabled + .filter-option__swatch`: bỏ `opacity: 0.4` → swatch `position: relative`, `::after` gạch chéo 2px `var(--color-foreground)`, `box-shadow: 0 0 0 1px var(--color-background)`, cao 100%, `translate: -50% -50%`, `rotate: -45deg` (logical inset).
- snippets/carousel-nav.liquid: chỉ sửa chú thích `{% doc %}` (bỏ "opacity 0.35").

Không file JS trong diff. Không token mới (dùng --color-border, --color-background, --color-muted-light, --color-muted-on-dark, --color-foreground đã có).

## Tự kiểm tra
- shopify theme check: 0 lỗi (9 warning có sẵn ở quiz-step, index*.liquid, không liên quan).
- AC1 grep: 0 kết quả ở base.css/collection.css; còn featured-product.css:456 (xem KHÔNG CHẮC, ES1-T591).
- Dung lượng: diff +~0,6 KB thô (≈ +0,2 KB gzip); không đo được gzip trong sandbox lượt này — chờ CI (base.css ≤ 49 152 B / trần tạm 57 344 B, collection.css ≤ 16 384 B, develop 5 336).
- AC2 (1280 testimonials Prev opacity 1, border --color-border, color --color-muted-light), AC3 (dải tối collection-list), AC4 (ảnh 360/1280 swatch hết hàng): chờ CI preview + ảnh 3 breakpoint. AC4 cần collection có filter màu với giá trị count 0 trên store dev; nếu thiếu dữ liệu thì ghi skip, không coi là đạt.
- Lighthouse: chờ CI (trang chủ, collection). Thay đổi chỉ CSS trạng thái, không ảnh hưởng LCP/CLS; tương phản tăng (bỏ opacity).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
