KHÔNG CHẮC: tests/e2e/ES1-T341.spec.ts:56 đọc `--panel-muted:` trong base.css sẽ đỏ sau khi gom token; Dev FE không sửa tests/, đã tạo ES1-T589 (QA).

# ES1-T539 FE: gom token :root của base.css về css-variables.liquid, bóng viết tay → token

Nguồn: drafts/designer/_kit/kit.css :root 196–210; docs/ui-spec/foundation.md §2 (bảng elevation), §31 (component → bóng → lớp, bóng viết tay → token), §32.3.

## Thay đổi
- snippets/css-variables.liquid: thêm nguyên giá trị 14 token từ base.css: 8 `--layer-*` (1, 4, 5, 10, 15, 20, 21, 30), `--overlay-scrim`, `--shadow-raised`, `--shadow-overlay`, `--panel-muted`, `--panel-saving`, `--round-button-size` (52). Thêm `--shadow-none: none`, `--shadow-bar: 0 calc(-1 * var(--space-1)) var(--space-5)` foreground 10% (= kit `0 −4 24`).
- assets/base.css: xoá 14 token khỏi 2 khối :root. Giữ biến dẫn xuất (`--edge`, `--sticky-top`, `--bottom-bar-height`, `--inbox-clearance`, `--toast-inline-size`, `--dialog-*`, `--drawer-*`, `--empty-state-max`, `--close-button-size`, `--row-*`). `--radius-dialog` giữ (ES1-T537).
- Bóng viết tay → token (7):
  - base.css `.button:hover` `0 6px 16px` 18% → `--shadow-raised`
  - base.css `.testimonial-item:hover` `0 8px 24px` 10% → `--shadow-raised`
  - base.css `.article-card:hover` `0 18px 40px` `--figma-000000` 18% → `--shadow-raised`
  - bundle-builder.css `.bundle-builder__item:hover` `0 8px 24px` 10% → `--shadow-raised`
  - critical.css `ul.site-header__submenu` `0 4 12` 12% → `--shadow-raised`
  - critical.css `.site-header[data-scrolled]` `0 1 8` 24% → `--shadow-raised`
  - cart.css `.cart-sticky-checkout` `0 −4 16` 16% → `--shadow-bar`
- Bóng vòng `0 0 0 Npx`, `inset`, bóng tràn nền collection.css:88 (blur 0) giữ.
- `--figma-000000` còn dùng ở `.level-card__link::after` nên chưa xoá (§32.4, ngoài phạm vi).

Hệ quả: token lớp/bóng nay có trong `<style>` đầu trang trước critical.css (trước đây critical.css dùng `var(--layer-header)` khai báo ở base.css). Bóng nút hover, card bài viết hover, header cuộn nhạt và rộng hơn trước theo §31; hình tĩnh không đổi.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi (9 warning có sẵn ở quiz-step, index*.liquid, không thuộc diff).
- AC1: `grep -nE "^\s*--(layer-|shadow-|overlay-scrim|panel-|round-button-size)[a-z-]*:" assets/*.css` = 0.
- AC2: `grep -nE "box-shadow: *0 [0-9-]" assets/*.css` chỉ còn 3 vòng `0 0 0` (collection.css:538, shop-the-look.css:117, base.css:3892).
- AC3: css-variables có `--shadow-none`, `--shadow-bar`.
- Byte thô trước → sau: base.css 193 990 → 193 040; critical.css 10 082 → 9 970 (≤ 10 240); cart.css 6 285 → 6 199; bundle-builder.css 14 036 → 13 985. Gzip base.css: chỉ giảm so với trước, số đo chờ CI (lệnh gzip cần phê duyệt trong sandbox agent).
- Không file JS trong diff.
- AC4 ảnh 1280 (header cuộn, dropdown, card bài viết hover), 360 (thanh checkout giỏ), Lighthouse, Playwright: chờ CI.
- Test ảnh hưởng: ES1-T341.spec.ts:56 (đỏ dự kiến), fixture TOKENS của ES1-T369, ES1-T386 thiếu `--layer-*`/`--shadow-*` → ES1-T589.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
