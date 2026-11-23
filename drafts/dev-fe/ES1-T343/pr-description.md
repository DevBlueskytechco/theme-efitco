KHÔNG CHẮC: (1) featured đặt countdown trong slot `data-sale-countdown-slot` ngoài partial, không thêm `product-countdown` vào regions vì ES1-T158:222-228 khoá 3 tên; hỏi ở ES1-T599. (2) Chưa thêm dòng `sale-countdown` vào Theme map AGENTS.md vì scope-guard chặn dev-fe; dòng đề xuất ở ES1-T599. (3) Định dạng ngày đọc dùng `date: format: 'date_at_time'` + `%Z`; chưa xem output thật trên preview.

# ES1-T343 TE-13-R2-FE1: sale-countdown (mới), featured-product, base.css, locales

AC: TE-4 AC17, TE-13 AC1, AC-H23. ADR 0009 mục 1, 2, 5; docs/ui-spec/countdown.md §1–§7; kit `.sale-countdown` (drafts/designer/_kit/kit.css, foundation.html `h-countdown`).

## Thay đổi
- `snippets/sale-countdown.liquid` (mới). `{% doc %}`: `product`, `variant`, `fallback_end`, `size` (`regular` | `compact`), `label`, `testid` (mặc định `sale-countdown`), `id`.
  - Nguồn ngày: `product.metafields.custom.sale_ends_at.value` trước. Chỉ khi sản phẩm không có metafield mới dùng `fallback_end` (YYYY-MM-DD HH:MM, giờ store, kiểm 16 ký tự như code cũ).
  - In khi đủ 4 điều kiện: ngày hợp lệ, ngày > now, biến thể có `compare_at_price > price`, biến thể `available`. Thiếu một điều kiện thì không in gì (K4).
  - Số ngày/giờ/phút/giây in sẵn bằng Liquid, hiện ngay (ES1-T276, CLS 0). Luôn có 4 ô; ô ngày `hidden` khi dưới 24 giờ. `data-state` là `running`, hoặc `ending` khi dưới 1 giờ.
  - A11y: `role="timer"` + `aria-labelledby` trỏ tới câu ẩn "Sale ends on {date}" trong `<time datetime>`. Nhãn và ô số `aria-hidden`, không `aria-live`.
  - Editor (`request.design_mode`): báo ngày sai định dạng, và báo khi metafield ghi đè setting.
- `blocks/featured-product.liquid`: bỏ phần tính ngày và markup countdown cũ, thay bằng `render 'sale-countdown'` (`size: 'regular'`, `testid: 'featured-product-countdown'`, `fallback_end: block.settings.countdown_end`, `label: block.settings.countdown_label`). Lời gọi nằm trong `<div class="sale-countdown-slot" data-sale-countdown-slot>` (display contents). Điều kiện còn hàng đổi từ `featured.available` sang `variant.available` theo countdown.md §4. Cập nhật `{% doc %}`.
  - Schema: `countdown_label` bỏ default "Sale ends in" (ES1-T308 #1). Để trống thì dùng locale `blocks.sale_countdown.label`. Info mới cho `countdown_label`; info `countdown_end` theo countdown.md §6.
- `assets/base.css`: thêm `sale-countdown` (block, `container-type: inline-size`, `@media (scripting: none)` thì none), `.sale-countdown-slot` (contents), `.sale-countdown`, `__label`, `__units`, `__unit`, `__ended`, `[data-size='regular']` qua `@container (min-width: 23rem)`, `[data-state='ending']` (K2 accent), `[data-state='ended']` (K3 min-inline-size 16.75 / 19.5rem), `.sale-countdown-notice`. 0 literal màu (dùng `color-mix` với token), chỉ dùng thuộc tính logical, 0 z-index. Bỏ `visibility: hidden` chờ `data-enhanced`.
- `assets/featured-product.css`: xoá mọi `.featured-product__countdown*` (cả khối 80rem có `--figma-*` px) và `.featured-product__notice`.
- `locales/en.default.json`: thêm `blocks.sale_countdown.{label, ends_on, ended, days, hours, minutes, seconds, invalid_date, metafield_overrides}`, bỏ `blocks.featured_product.countdown_*`. `locales/en.default.schema.json`: thêm `info.countdown_label`, sửa `info.countdown_end`.

## Hook cho BE (TE-13-R2-BE1)
- Custom element `<sale-countdown class="sale-countdown-host">` bọc frame `.sale-countdown`. Frame có `data-sale-countdown`, `data-end` (epoch giây), `data-state`, `data-size`, `data-label-ended`, `role="timer"`, `aria-labelledby`.
- Ô số: `data-countdown-unit="days|hours|minutes|seconds"`, `[data-countdown-value]`. Thứ tự DOM là days → seconds, khớp `tick()` hiện tại của featured-product.js.
- K3: BE đặt `data-state="ended"`, thay nhãn + `.sale-countdown__units` bằng `<span class="sale-countdown__ended">{data-label-ended}</span>`, giữ frame, đổi chữ câu ẩn (hoặc `aria-labelledby`) sang chữ ended.
- Featured đổi biến thể: `[data-sale-countdown-slot]` luôn có trên trang, nên thêm nó vào selector `q()` của `swap()` trong featured-product.js.
- Testid: `featured-product-countdown`, `-days|-hours|-minutes|-seconds`, `-label`, `-ends-on`, `-notice`. Mặc định của snippet là `sale-countdown-*`. PDP dùng `product-countdown`, big offer dùng `offer-card-countdown`.
- Cho tới khi BE1 merge, `assets/featured-product.js` cũ vẫn đếm, vì nó tìm `[data-end]` và `[data-countdown-value]`. Hết giờ thì nó ẩn khung như cũ.

## Tự kiểm tra
- `shopify theme check`: 133 file, 0 lỗi, 9 warning. Warning đều có từ trước và không nằm trong file của PR (quiz-step, index.figma, index.liquid, index.te12).
- `grep -rn "featured-product__countdown\|featured-product__notice\|countdown_days\|countdown_invalid" assets blocks snippets templates layout locales` = 0.
- Không file JS trong diff. Không `<script>` / `data-lazy-module` mới.
- gzip base.css (trần 49 152 B), critical.css không đổi: chờ CI, vì sandbox không chạy được gzip/node. Diff base.css +111 dòng, featured-product.css −78 dòng.
- Preview, Playwright, Lighthouse (`/` và `?view=te13-states`), ảnh 360/768/1280: chờ CI.
- Spec: `drafts/dev-fe/ES1-T343/ES1-T343.spec.ts` (tĩnh + storefront `?view=te13-states`). Chờ Orchestrator chép sang `tests/e2e/ES1-T343.spec.ts`.

## Test cũ đỏ đúng chủ đích (ADR 0009 "Hệ quả", ES1-T276)
- `tests/e2e/ES1-T156.spec.ts:78` "chưa có data-enhanced: khung giữ chỗ nhưng không nhìn thấy": nay số hiện ngay khi tải (decisions 11/11, ES1-T276). QA đổi sang `toBeVisible()`.
- `tests/e2e/ES1-T158.spec.ts:273, 284` (hết giờ thì `hidden`): vẫn xanh với featured-product.js cũ, sẽ đổi sang K3 "This sale has ended" khi BE1 merge. QA sửa cùng BE1.
- Selector `.visually-hidden` trong ô vẫn còn: chữ đơn vị nằm trong vùng `aria-hidden`, nên không ai đọc. Giữ để khớp locale ADR 0009 mục 5 và ES1-T156/T158.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
