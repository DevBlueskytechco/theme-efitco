KHÔNG CHẮC: (1) 64–80rem (1024) không có số đo trong ui-spec (index-mobile-b dòng 35 nói bố cục 768 giữ tới 1279, code và ES1-T449 dùng 2 cột từ 64rem): giữ 2 cột từ 64rem cho featured, why, FAQ, bố cục 768 áp 48–64rem; đã hỏi Designer ES1-T528 (im lặng = nhận). (2) base.css gzip 49 123 / 49 152 sau merge develop, còn 29 B: PR sau thêm CSS trang chủ sẽ vượt, cần tách hoặc rút tiếp. (3) Đã bỏ (partial `featured-product` thay bằng hợp đồng ADR 0008 của develop). (4) Spec ES1-T342 chưa chạy, scope-guard chặn dev-fe ghi tests/ → Orchestrator chép `drafts/dev-fe/ES1-T342/ES1-T342.spec.ts` sang `tests/e2e/`.

# ES1-T342 TE-17-R2-FE3: featured product, why choose, FAQ theo 360 / 768 / 1280 (hợp đồng partial theo ADR 0008 của develop)

Ticket: ES1-T342 · Story TE-17 · AC TE-13 AC2 (+ AC6 số đo), AC-H22 (phần markup), TE-7 AC2, AC3 (+ AC7) · Sau ES1-T409 (rich media, đã merge). Nguồn: index-mobile-b.md §2, §5, §7; index-1280.md §1 khối 10, 13, 15, §2.6; ADR 0008 mục 3; Figma 1:759, 1:992, 1:1057.

## Thay đổi
- `blocks/featured-product.liquid`
  - Merge develop (#281, ADR 0008): bỏ partial `featured-product` + `featured-product-region` của bản trước; giữ hợp đồng develop (partial `product-options` / `product-price` / `product-buy-buttons`, `data-variant-price`, `selected-variant-data`, `swap()`). PR chỉ thêm doc bố cục và chữ ẩn View Detail.
  - TE-13 AC6: "View Detail" thêm chữ ẩn " of {product}" (`blocks.featured_product.view_detail_suffix`), cả nhánh selling plan.
  - Doc: bố cục 3 mốc (partial theo ADR 0008, không còn testid `featured-product-region`).
- `blocks/image-with-text.liquid`: `sizes` ảnh nhỏ split có mốc 768 (168 / 100), từ 80rem theo vw như cũ; doc bố cục split 360 / 768 / 64–80 / 80rem.
- `blocks/faq.liquid`: `sizes` ảnh thêm 72vw ở 48rem (553 / 768); doc bố cục.
- `blocks/faq-item.liquid`: doc hàng ≥ 56, icon theo màu chữ. Không đổi markup.
- `snippets/product-variant-picker.liquid`, `templates/product.featured-product.liquid`: theo develop, PR không đổi.
- `locales/en.default.json`: thêm `blocks.featured_product.view_detail_suffix` "of {{ product }}" (gộp vào nhóm có sẵn).
- `assets/base.css`
  - Featured: dưới 64rem ảnh → chi tiết cách 32; khung ảnh 1:1 (< 48rem), 4:3 (48rem), 668 / 653 (64rem); dưới 64rem ảnh contain cách khung 8%; dấu tròn 72 cách 16 / 88 cách 24 / 113 từ 64rem; bảng thông số < 48rem mỗi hàng nhãn trên giá trị dưới (padding 12 / 16), từ 48rem 2 cột padding 12 / 24; nút < 48rem lưới dọc full, từ 48rem 1 hàng. 1280: 580 | 80 | 580 có sẵn (ảnh 580 × 566). Bỏ `flex: 1 1 auto` nút cũ và padding-inline thông số 48rem trùng.
  - Why (split): ảnh trên 1:1 / 4:3, gradient 55% → nền tối; chữ padding 8 / 48 (360), 16 / 48 + chừa 200 cuối (768); 768 ảnh nhỏ 168 đè đáy ảnh lớn 40 + 100 cách đáy 48 mép cuối 32; < 48rem ảnh nhỏ `display: none` (lazy, không tải). 64–80rem như trước (920 / 1000, gradient 61.3%, ảnh nhỏ ẩn). Từ 80rem cột ảnh `lề + (nội dung − 80) / 2` (600 ở 1280, 920 ở 1920), chữ cách 80, display `min(display, 6.25vw)` = 80 ở 1280, hộp chữ dừng trước ảnh nhỏ 1.
  - FAQ: khoảng accordion → ảnh 32 / 40; hàng câu hỏi ≥ 56 (`--space-1 × 14`, ≥ 80rem giữ Figma 44); 360 hai ô 142 đè đáy ảnh 48, lùi 12, số 40; 48rem ảnh 76.2% sát mép cuối, hàng ô 79.6% mép đầu 0 cách đáy 7.5%, số 48; 64rem 2 cột, ô cách đáy 40 (1280: ảnh 442 × 471, ô 225). Icon +/− đã vẽ bằng `currentColor` (màu chữ câu hỏi), không đổi.

Không thêm setting, không đổi default (ES1-T304 sở hữu default; D10). Không đổi countdown (TE-13-R2-FE1). Không file JS.

## Cho BE
- Không đổi JS, hợp đồng ADR 0008 (partial, `data-regions`, `swap()`) giữ nguyên như develop.
- Hook giữ nguyên: mọi `data-*`, testid, `data-lazy-module`, custom element.

## Tự kiểm tra
- `assets/base.css` sau merge develop: gzip (Node `zlib.gzipSync`) 49 123 / 49 152 (develop 48 641; bản PR trước 49 419, merge thẳng 49 710). Đã rút comment, gộp bảng thông số (`display: revert` từ 48rem), biến `--image-with-text-media`, bỏ `.featured-product__region`.
- `shopify theme check`: 0 lỗi, 9 warning có sẵn (quiz-step, index*.liquid), không warning nào trong file của PR.
- Diff `assets/base.css`: 0 literal màu, 0 `left/right/top/bottom`, 0 `margin-left/right`, 0 `z-index`, chỉ `min-width` media query.
- `wc -c assets/critical.css` 10 082, không đổi. `gzip base.css`: chờ CI (KHÔNG CHẮC #2).
- `locales/en.default.json`: key mới trong nhóm `blocks.featured_product`, không trùng.
- Không file JS trong diff.
- Playwright (spec ES1-T342 + spec cũ), Lighthouse desktop/mobile trang chủ, ảnh 360/768/1280/1920, visual diff Figma: chờ CI.
- Test cần dữ liệu store (skip có lý do, không coi là đạt): featured cần sản phẩm ở band te13-a, bảng thông số cần TE13_METAFIELDS_READY, partial cần TE4_VARIANTS_HANDLE; why cần ảnh chính + 2 ảnh nhỏ ở te7-iwt-left; FAQ cần ảnh + 2 ô ở te7-faq.

## Test bị ảnh hưởng (QA)
- `tests/e2e/ES1-T156.spec.ts`, `ES1-T158.spec.ts` (hợp đồng 3 partial ADR 0008): giữ nguyên, không đổi sau merge develop.
- `tests/e2e/ES1-T119.spec.ts` "AC2 360: câu hỏi, rồi ảnh, rồi ô stat không đè": đỏ đúng chủ đích (index-mobile-b §7: 360 ô số đè đáy ảnh 48). Sửa thành ô đè đáy ảnh, không tràn ngang.
- Giữ được: ES1-T120 1280 (ảnh trái/phải, ảnh nhỏ không đè hộp chữ, 360 ảnh nhỏ ẩn), ES1-T180 AC-H5 (`<br>` body why giữ), ES1-T119 1280 (2 cột, ô đè trái ảnh), ES1-T156 hợp đồng product-form, testid.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
