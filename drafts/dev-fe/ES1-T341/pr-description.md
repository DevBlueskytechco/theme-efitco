KHÔNG CHẮC: (1) 64–80rem (1024) không có trong ui-spec: quiz `1fr | 608` và shop the look 8 + 4 từ 64rem, make fitness giữ bố cục 768 tới 80rem; đã hỏi Designer ES1-T449 (im lặng = nhận). (2) Spec ES1-T341 chưa chạy (sandbox không có trình duyệt/PREVIEW_URL; scope-guard chặn dev-fe ghi tests/) → Orchestrator chép `drafts/dev-fe/ES1-T341/ES1-T341.spec.ts` sang `tests/e2e/`. (3) `gzip assets/base.css` còn 271 B dưới trần 49 152; ticket sau phải xoá CSS cũ tương ứng. (4) Tên hotspot "Show {product} in the list" (TE-12 AC9) cần JS đặt aria-label: FE chỉ thêm `data-label-hotspot`, BE làm.

# ES1-T341 TE-17-R2-FE2: quiz, shop the look, make fitness theo 360 / 768 / 1280 / 1920

Ticket: ES1-T341 · Story TE-17 · AC TE-11 AC4, TE-12 AC5 (+ số đo AC9), AC-H19 (store dev), AC-H20, AC-H35 · Sau ES1-T313 (TE-10-R2-FE2, đã merge). Nguồn: index-mobile-a.md §6–§8, index-1280.md §1 khối 6–8, §2.4, §2.5, foundation §2, Figma 1:506, 1:560, 1:625.

## Thay đổi
- `assets/base.css`
  - Quiz: `.quiz` bỏ margin ngoài (khối trên/dưới đã có padding 48 | 120 → khoảng đúng Figma). < 48rem panel tràn mép (`.block-container > .quiz { grid-column: 1 / -1 }`), không bo, padding 48 / 20; thẻ 320, padding 24 / 16, bo 16; lựa chọn cao ≥ 72, padding 12 / 16; h2 28. 48rem: panel trong container, bo 24 (`--radius-card × 2`), padding 40 / 32, thẻ padding 24, h2 32. Từ 64rem `.quiz--split` = `1fr | 608` (`--space-1 × 152`), gap 48. Từ 80rem padding `clamp(48, 3.125vw, 60)`, gap `clamp(48, 4.17vw, 80)`, thẻ padding 32 (152 + 24 + 368 + 64 = 608), h2 48, ghi chú cách 40. Ghi chú `--panel-muted`. Trang `?view=quiz`: khoảng cách chuyển sang `.quiz-results-title`.
  - Shop the look (viết lại khối): < 48rem 1 cột, link dưới h2 gạch chân cao 44, h2 28, hàng ảnh 64, panel padding 24, dòng 14 `--panel-muted`, nút 48. 48rem: form lưới `1fr | 280` (`--space-1 × 70`), gap 16, panel `position: sticky` `inset-block-start: --sticky-top + 16`, link phải căn đáy. Từ 64rem (có ảnh): lưới 12, ảnh span 8, cột phải span 4 flex dọc gap `clamp(16, 1.25vw, 24)`, Fits `clamp(84, 5.2vw, 100)`, hàng `clamp(80, 4.9vw, 94)`, ảnh hàng `clamp(56, 3.333vw, 64)`, hàng cách `clamp(8, 0.625vw, 12)`, panel `margin-block-start: auto` (đáy panel = đáy ảnh), padding `clamp(24, 3.125vw − 20, 40)`, dòng 16, nút 52. Từ 80rem h2 48. Hàng đang chọn viền 2px accent (border + bóng trong 1px, không đổi cỡ). Hàng hết hàng ảnh 0.6. Tên sản phẩm vùng bấm 44 bằng padding/margin âm 9 (không đổi chiều cao hàng, AC-H35). Dòng giảm `--panel-saving` + icon tag 16 + dấu "−". Xoá `--look-panel-muted`, `.shop-the-look__discount-note`, `.shop-the-look__discount` cũ. Transition viền hàng trong `prefers-reduced-motion: no-preference`.
  - Make fitness (`.image-with-text--banner`): < 48rem accent 1 112 trái, accent 3 88 phải lệch xuống 40, accent 2 `display: none` (lazy, không tải); câu phụ 16 ≤ 34ch; nút cách 36. 48rem: padding 64, accent 1 160, accent 3 128 lệch 64, accent 2 104 tuyệt đối đáy trái cách đáy 64; câu phụ 18 ≤ 30ch. Từ 80rem `min-block-size: 50vw` (bỏ trần 960), display `min(display, 6.25vw)` (80 ở 1280), câu phụ cách 40, nút cách 80; vị trí 3 ảnh giữ như Figma (12.24% / 39.95% / đáy 12.24%, inset `min(80px, 4.17vw)`). `<br>` heading: < 48rem ẩn, từ 48rem hiện (có sẵn, locale đã có `<br>` sau "fitness", "your").
- `blocks/shop-the-look.liquid`: dòng giảm thêm class `--discount`, bọc nhãn trong `.shop-the-look__discount-label` + SVG tag `aria-hidden` (JS vẫn ghi vào `[data-bundle-discount-label]`); root thêm `data-label-hotspot`; `sizes` ảnh 64vw từ 64rem; doc cập nhật bố cục, bỏ mô tả ghi chú giảm giá và testid `shop-the-look-discount-note`.
- `blocks/shop-the-look-row.liquid`: ảnh hàng 64 / 128 (`sizes: 64px`); doc ghi ảnh mờ 0.6, lý do không kéo link phủ hàng (bấm hàng chọn hotspot, AC-H20).
- `blocks/image-with-text.liquid`: `sizes` accent banner theo mốc mới (112 / 88 / 104, 160 / 128, vw từ 80rem); 3 accent `decorative: true` (`alt=""`, index-1280 §4.3, cả layout split); doc cập nhật.
- `blocks/quiz.liquid`: chỉ doc (bố cục). Không đổi markup, setting, default.
- `locales/en.default.json`: `blocks.shop_the_look.hotspot_product` "Show %t in the list"; bỏ `blocks.shop_the_look.discount_note` (0 tham chiếu).

Không đổi default setting (ES1-T304 sở hữu: quiz copy, tier shop the look); không thêm setting chữ mới (D10). Không file JS.

## Cho BE
- `assets/bundle-form.js` (ES1-T149 / TE-12-R2-BE): đặt `aria-label` hotspot n = `data-label-hotspot` với `%t` = `data-title` của input trong `[data-look-row=n]` (hoặc text `shop-the-look-row-title` khi hàng hết hàng) — TE-12 AC9. Dưới 64rem bấm hotspot thì cuộn tới hàng tương ứng (index-mobile-a §7, mặc định Designer cho AC-H20). Hover/focus/bấm → `data-look-active`, `aria-pressed` đã có sẵn, CSS chỉ đổi kiểu.
- Không đổi hook: `data-bundle-*`, `data-hotspot`, `data-look-row`, `data-look-active`, testid giữ nguyên (trừ `shop-the-look-discount-note` vốn không render).

## Tự kiểm tra
- `shopify theme check`: 0 lỗi, 23 warning có sẵn (bundle-builder, featured-product, quiz-step, testimonial-item, empty-state, index*.liquid), không warning nào trong file của PR.
- `gzip -c assets/base.css | wc -c`: 48 881 (trước 47 739, trần 49 152). `wc -c assets/critical.css`: 9 917, không đổi.
- Quét diff `assets/base.css`: 0 literal màu, 0 `left/right/top/bottom`, 0 `margin-left/right`, 0 `z-index`.
- `locales/en.default.json` hợp lệ, không trùng key.
- Không file JS trong diff.
- Playwright (spec ES1-T341 + spec cũ), Lighthouse desktop/mobile trang chủ, ảnh 360/768/1280/1920, visual diff Figma: chờ CI.
- Test cần dữ liệu store (skip có lý do, không coi là đạt): AC-H19 cần store dev đã áp fixture ES1-T331 và bậc giảm đạt được; số đo shop the look cần ảnh `efx-look.jpg` + ≥ 2 hàng; make fitness cần ảnh `efx-insp-1..3.jpg`.

## Test bị ảnh hưởng (QA)
- `tests/e2e/ES1-T120.spec.ts` "AC3 banner 360: 3 ảnh thành hàng trên chữ": sẽ đỏ đúng chủ đích — CTO 10/11 câu 2 (index-mobile-a §8, §13): 360 ẩn ảnh dưới trái, ảnh phải lệch xuống 40. Cần sửa thành 2 ảnh hiện (accent 1, 3), accent 2 ẩn.
- `tests/e2e/ES1-T148.spec.ts:186` hotspot `aria-label` khớp số: còn đúng tới khi BE đổi nhãn theo tên sản phẩm; khi đó đổi sang khớp tên.
- Giữ được: ES1-T148 không ảnh (body = form), hotspot 44; ES1-T137 lựa chọn quiz ≥ 44; ES1-T183 màu panel quiz; ES1-T224 `<br>` banner; ES1-T235 không có discount note.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
