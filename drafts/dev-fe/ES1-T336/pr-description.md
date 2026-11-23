KHÔNG CHẮC: (1) đã bỏ: CTO 23/11 chốt giữ default mẫu rich-text + featured collection (ES1-T430, ADR 0011 mục 3 ngoại lệ). (2) Lưới 4 cột tính theo số card thật (chia hết cho 4), không theo `products_to_show`: khác AC17 khi collection ít sản phẩm hơn setting. (3) Gradient level card ≥ 80rem giữ Figma 1:469 (63%) như code đang khớp 1920; index-1280 khối 4 ghi 50%. (4) Figma 1:464 card 1 vẽ trạng thái hover, nên từ 80rem card 1 không còn hiện "N Products →" khi đứng yên: diff ảnh 1920 so với Figma tăng ở vùng này (theo index-1280 §2.3, ticket).

# ES1-T336 · TE-17-R2-FE1: rich-text, level-card, shop-by-level, featured-collection, base.css

AC: AC-H10, TE-3 AC1 (+ AC17), AC-H11, AC-H35. Spec: `docs/ui-spec/index-mobile-a.md` §4, §5; `docs/ui-spec/index-1280.md` khối 4–5, §2.3. Kế hoạch: `drafts/techlead/ES1-T307/task-split.md` (TE-17-R2-FE1).

## Thay đổi

### rich-text (intro)
- Heading dùng `--font-size-display` ở mọi mốc: 48 ở 360 (balance, 3 dòng), 70 ở 768 (2 dòng như Figma; trước đây cố định 48).
- 48rem: đoạn `1fr` trái, link phải căn đáy, cách 32. 360: đoạn → link 12, đoạn ≤ 34rem.
- ≥ 80rem: cột phải 528 (`min(132 × --space-1, 45%)`, x 732 ở 1280, x 1140 ở 1920), display `min(display, 6.25vw)` = 80 ở 1280 (R2). 64–80rem giữ công thức cũ.
- Ảnh inline: `sizes` 165px từ 48rem (trước 80px tới 64rem, mờ ở 768), widths 80/165/240/330.
- Schema: giữ default mẫu + info `sample_default` như develop (ES1-T430; ADR 0011 mục 3 ngoại lệ, CTO 23/11).

### level-card / shop-by-level
- Dưới 80rem: lớp gradient phủ cả card từ 35%, tối 85% (`::after`, token nền tối); padding 24/24/16 ở 360, 16 ở 768; tên h3 (22 / 24); hàng "N Products →" luôn hiện, cao 44, kẻ trắng 24%.
- ≥ 80rem (thiết bị hover): hàng số sản phẩm ẩn (cao 0, opacity 0), hiện khi `:hover` / `:focus-visible` của link, chỉ opacity chuyển động 250 ms (khối Chuyển động, tắt khi giảm chuyển động). Số vẫn trong tên link. Card tỉ lệ cố định: 0 CLS. Màn chạm ≥ 80rem (`hover: none`) luôn hiện.
- ≥ 80rem: padding `clamp(32, 16 + 1.25vw, 40)` (32 ở 1280, 40 ở 1920), tên 36/44, hàng số Figma 1:474 (kẻ 20%, cách 12).
- Bỏ quy tắc "card 1 luôn hiện" và các chỉnh ±1px gắn `:first-child`, chuyển sang theo trạng thái hover/focus.
- Collection 0 sản phẩm: giữ card, không in hàng số (index-mobile-a §4). Số = `products_count`, số ít/nhiều theo locale `blocks.level_card.products_count` (AC-H10).
- shop-by-level: eyebrow/heading giữ default (nhãn điều hướng trung tính, không phải claim); block vẫn không render khi chưa có card.

### featured-collection (bestsellers)
- ≥ 48rem: 4 cột khi số card chia hết cho 4 (`:has(> :last-child:nth-child(4n))`, 170 ở 768, gap 16), còn lại 3 cột (TE-3 AC17). 360: 2 cột 152, gap 16 ngang / 24 dọc. ≥ 80rem: `--columns` (292 ở 1280, 336 ở 1920), không đổi.
- Tab dưới 80rem cao 44 (AC-H35); ≥ 80rem giữ 40 như Figma, vùng bấm 44 bằng `::before`.
- `sizes` ảnh card ≥ 80rem theo bề rộng thật `min(100vw − 40px, 1416px) / columns`.
- Schema: giữ default mẫu `eyebrow`, `heading`, `tab_2_label`..`tab_4_label` + info như develop (ES1-T430; ADR 0011 mục 3 ngoại lệ, CTO 23/11). Nhãn rỗng → tên collection.
- AC-H11 (tab, bàn phím, không JS là link): markup không đổi, JS `collection-tabs.js` không đụng.

### Template
- Không đổi template (default mẫu trong schema đủ cho `/`, `/?view=figma`, te15).

### ADR
- `docs/adr/0011` mục 3: thêm ngoại lệ text/heading mẫu (CTO 23/11, ES1-T336/ES1-T430).

## Không làm / ngoài phạm vi
- Không file JS. Không sửa spec e2e (việc QA, ES1-T532).
- Gradient level card ≥ 80rem giữ Figma 63% (xem KHÔNG CHẮC 3).

## Hook cho BE
- Không đổi: `collection-tabs` (`data-tab`, `data-tab-panel`, `data-tab-panel-template`, `data-tab-empty`, `data-lazy-module`), testid `featured-collection-*`, `level-card-*`, `rich-text-*`.
- Level card không cần JS (hover/focus thuần CSS).

## Tự kiểm tra
- `shopify theme check`: 0 lỗi, 9 warning có sẵn (quiz-step, index.liquid, index.figma, index.te12: `UnrecognizedBlockArguments`, `UndefinedObject`), không thêm mới; `.theme-check.yml` không đổi.
- `critical.css` 10 082 B ≤ 10 240 (không đổi). `base.css` thô 264 809 B (+~3,9 KB); gzip: sandbox không cho chạy `gzip`, chờ CI (trần tạm 57 344 B).
- Diff CSS: 0 màu literal (gradient/kẻ dùng `color-mix` với token), 0 thuộc tính vật lý, 0 `z-index` số (`--layer-content`); thay `30px` cũ bằng `calc(--space-1 × 10.5)`.
- Editor: rich-text rỗng → placeholder `blocks.rich_text.placeholder`; level card không collection → placeholder; featured collection không nguồn → card placeholder + hướng dẫn. Storefront không in gì.
- A11y: hàng số sản phẩm ẩn vẫn nằm trong tên link; focus-visible hiện hàng + gạch chân tên; tab ≥ 44 dưới 80rem; tên dài `overflow-wrap: break-word` (heading intro, tên level).
- Playwright, Lighthouse (desktop/mobile `/`, `/?view=figma`), ảnh 360/768/1280/1920, visual diff 1920: chờ CI. Test cần fixture ES1-T331 (AC-H10 "24 Products", ES1-T180 fixture) skip nếu preview chưa áp fixture, không tính đạt.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
