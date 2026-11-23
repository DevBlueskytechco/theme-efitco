# ES1-T567 — Mockup là nguồn chuẩn, bỏ liên kết Figma, thiết kế theo chuẩn Design System đã nạp (CTO 21/11)

Yêu cầu CTO 21/11: bỏ toàn bộ liên kết tới file "Efitco Theme Final / Design System 2"; cập nhật mockup theo chuẩn kiến thức Design System đã nạp (Polaris trước) để có bộ mockup chuẩn, từ đó Designer người dựng lại Figma. Nhánh `feature/ai-ES1-T567`, chồng lên ES1-T535.

Quyết định: `docs/design/decisions.md` mục "CTO 21/11 — ES1-T567". Bản design system 2.0.0 (CTO chốt số bản 21/11 lượt 2): `docs/design/CHANGELOG.md`. CTO chốt lượt 2: mục 10. Cách dựng lại Figma: `docs/design/figma-handoff.md`.

File này là NƠI DUY NHẤT trong tài liệu hiện hành còn in tên code có tiền tố `figma` (mục 5): loại file này khỏi phép grep kiểm "không còn chữ Figma".

Ba bước của ticket: (A) Kit + màn DS, (B) các trang mockup và `docs/ui-spec/<trang>.md` (agent trang, chạy song song), (C) Tài liệu (file này). Mục 1–2 ghi phần A và C đã đối chiếu trực tiếp với `kit.css`; phần B ghi theo đặc tả, agent trang báo cáo riêng.

## 1. Đã sửa

### 1.1 Kit và màn DS (bước A)

`drafts/designer/_kit/kit.css`, `drafts/designer/ES1-T251/foundation.html`. `:root` 134 → 151 biến (nay 150, xem mục 9). Section màn DS đổi: `h-type`, `h-spacing-radius`, `h-grid`, `h-token-architecture`, `h-tabs`, `h-badge`, `h-product`, `h-media`, `h-article`, `h-progress`, `h-toast`, `h-content`, cùng nhãn nút ở mọi section. Không đổi `id` section, tên file, URL ảnh.

### 1.2 Tài liệu (bước C)

| File | Đã làm |
| --- | --- |
| `docs/tokens.json` | Viết lại theo `:root` của kit, `_version` 2.0.0. Bỏ mọi khoá và chú thích dẫn file thiết kế cũ. Thêm `_source_notation` (5 dạng ghi nguồn), `line_height` (từng bậc), `letter_spacing`, `aspect_ratio`, `space.named` 050 / 150 và `_named_source`, 6 khoá `component` mới, `layout.grid_columns`, `container.band_inset_max`. `_source_of_truth` đảo thứ tự: kit → mockup → tokens.json / tài liệu → code theme. Giữ 2 khoá `layout.carousel_progress_height`, `layout.meter_height` (thêm tên biến CSS ở `_progress_css`) |
| `DESIGN.md` | Đoạn Sources → Source of truth + Standards; phiên bản 2.0.0; ngoại lệ accent bỏ tag bài viết; quy tắc 4 nơi bắt đầu từ kit; 5 dạng ghi nguồn; bảng tầng token; số đếm 151 (nay 150, xem mục 9); bảng "Colors adjusted to pass AA" (cột Previous value / Value in use); bảng thang chữ 12 kiểu có cột line-height token và Source; thang khoảng cách 14 bậc có cột Source; token kích thước; bo góc; page rhythm (lưới, dải rộng 64, breakpoint); bảng tỉ lệ ảnh theo bộ có tên; Calls to action sentence case |
| `docs/ui-spec/foundation.md` | Đầu file (nguồn chuẩn, thứ tự nguồn, bản 2.0.0); thêm mục "Thay đổi ES1-T567"; viết lại §1, §1.1, §1.2 (thêm bảng token kích thước), §32.1–§32.4, bảng tỉ lệ §36; sửa §2, §3, §4 footer, §6 nút, §7 tab, §8 badge, §9–§11, §13, §16, §17, §25, §27, §28, §30, §33, §38, §40. Các mục "Thay đổi …" của lượt trước giữ làm lịch sử, chỗ nhắc file cũ gọi là "bản vẽ cũ". 138 dòng nhắc file cũ → 0 |
| `docs/design/decisions.md` | Sổ lịch sử, không xoá dòng. Thêm khối "CTO 21/11 — ES1-T567" (3 quyết định, quyết định cũ bị thay, từng thay đổi trước → sau kèm chuẩn, phần giữ). Ghi "THAY 21/11 (ES1-T567)" tại hơn 30 dòng. Dòng 10/11 (BGĐ) "gốc thiết kế duy nhất" chuyển xuống mục mới "Đã thay". Mục "Chưa chốt" thêm 13 việc chờ CTO; (6) nguồn sự thật và (7) toast sentence case ghi đã chốt. Nhãn nút trong các dòng còn hiệu lực viết sentence case |
| `docs/design/content.md` | §2 bảng viết hoa theo loại chuỗi có cột Chuẩn; §2.1 bảng ví dụ đổi; §4 thuật ngữ; §5 theo component; §6 chuỗi cấm; §8 đảo bảng rà locale (23 dòng, khoảng 35 khoá cần FE đổi); §9 còn mở |
| `docs/design/CHANGELOG.md` | Thêm bản 2.0.0 (đổi phá vỡ, token thêm, giá trị sửa, không đổi); ví dụ major; sửa 7 chỗ nhắc file cũ ở các bản trước thành "bản vẽ cũ" |
| `CONTRIBUTING.md` | Mục "Order of sources" viết lại (kit → mockup → tài liệu → code theme), bỏ mục 4 cũ; quy tắc token bắt đầu từ kit; 5 dạng ghi nguồn; checklist PR thêm 2 ý |
| `docs/figma-inventory.md`, `docs/token-compliance.md` | Thêm khung "ĐÃ THAY 21/11 — tài liệu lịch sử" ở đầu, giữ nguyên nội dung để tra |
| `docs/design/figma-handoff.md` | MỚI. Thứ tự làm, bảng token → Figma variable (5 collection, mode Scheme và Breakpoint), text style, effect style, lưới, ma trận component theo section `h-*`, pattern, trang 4 khổ, quy ước đặt tên, checklist nghiệm thu |
| `drafts/designer/ES1-T567/notes.md` | File này |

## 2. Bảng thay đổi giá trị

Cột "Soát ảnh": A = bước Kit đã chụp và nhìn; B = việc của agent trang (bước này không chụp lại).

| Hạng mục | Trước | Sau | Chuẩn | Soát ảnh |
| --- | --- | --- | --- | --- |
| Line-height h1 | 40/48 → 48/58 (1.2) | 40/48 → 48/56 | Polaris React line height 48; 56 là bội 4 | A `h-type`; B heading 2 dòng ở 360, 1280 |
| Line-height h2 | 32/38 → 36/44 | 32/40 → 36/44 | M3 Headline L 32/40, Display S 36/44 | A; B |
| Line-height h3 | 28/34 | 28/36 | M3 Headline M, Carbon heading-04 | A; B |
| Line-height display dưới 48rem | 52/62 | 52/60 | Bội 4; Thiết kế (kiểu chữ thương hiệu) | A; B hero 360 |
| Line-height eyebrow | 14/17.5 → 16/20 | 14/20 → 16/20 | Polaris React line height 20 | A |
| Body | 16/26 | 16/24 | Carbon body-02, M3 Body L | A; B mọi trang (chiều cao khối chữ giảm) |
| Body small, form, nhãn nhóm | 14/22 | 14/20 | Polaris React body 14/20 | A; B |
| Nút | 16/20 (tài liệu ghi 16/26) | 16/24; small 14/20 | Carbon body-02 | A `h-button`: cao nút không đổi (min-height) |
| `.rte`, mô tả footer | 16/27.2 | 16/28 | Polaris React line height 28 | A `h-rte`; B article, page |
| Giá | 16/26 · 20/28 · 28/33.6 | 16/24 · 20/28 · 28/36, số bảng | Carbon heading-03; Polaris tabular numbers | A `h-price-rating`; B product, cart |
| Countdown (nhãn, hết giờ) | dòng 26 | dòng 24 | Bội 4 | A `h-countdown`; B product, trang chủ |
| `--space-4xl` | 56 | 48 | Polaris large-500 | B mọi trang 360 / 768 (trang đọc `--space-4xl` trực tiếp) |
| Padding section dưới 64rem | 56 | 48 | Polaris large-500 | B mọi trang 360 / 768 |
| Bậc nửa bước | 2px, 6px viết số | `--space-050`, `--space-150` | Polaris small-500, small-300 | A (không đổi điểm ảnh) |
| Padding ngang tab | 28 | 24 | Polaris large-200 | A `h-tabs` 360; B blog, collection, trang chủ |
| Dải rộng lùi tối đa | 60 (1798 ở 1920) | 64 (1792 ở 1920) | Polaris React space 64px | B hero trang chủ và panel footer ở 1920, 1440 |
| Toast đệm dọc | 10 | 12 (12 + 20 + 12 = 44) | Polaris small-100 | A `h-toast` |
| Footer: lề ảnh chồng / lệch lớp sau | 15 / −15, −14 | 16 / −16 | Polaris base | A footer màn DS; B footer các trang |
| Footer: đáy dải, đỉnh, newsletter | 46, 45, 14 | 48, 48, 16 | Polaris large-500, base | A; B |
| Footer: ảnh chồng, lớp sau | 98 × 123, 78 | 96 × 120, 80 | Bội 4 (Carbon sizing 8, 16, 24…) | A; B |
| Footer: logo, cờ, link menu từ 48rem | 86 × 26, 26, 26 | 80 × 24, 24, 24 | Bội 4; logo giữ tỉ lệ 10:3 | A; B |
| Số đếm giỏ | 18 | 20 (`--count-badge-size`) | Lưới 4px | A `h-header` |
| Check của option card | 22 | 24 | `--icon-size-lg` | A `h-selectable-option`; B quiz, bundle |
| Countdown hết giờ (bề rộng) | 267 / 311 px | 16.75rem / 19.5rem | Đơn vị rem, giá trị không đổi | A |
| Link menu header letter-spacing | −0.04em | −0.01em | Thiết kế (giãn chữ thân); bỏ số chỉ có gốc bản vẽ | A `h-header` 1280: hàng menu rộng hơn vài px, khoảng 40 giữ |
| Tag bài viết | nền accent, chữ trắng | nền trắng, viền border, chữ foreground | Polaris Badge: màu chỉ trạng thái | A `h-article`, `h-badge`; B blog, article, trang chủ, cart ("5 Items" trên panel tối dùng outline) |
| Nhãn nút, link dạng nút | Title Case | Sentence case | Polaris Button | A màn DS (27 chuỗi); B mọi trang |
| Collection card ảnh | 336 / 220 | 3 / 2 | Carbon 3:2 | A `h-collection-card`; B trang chủ, list collections |
| Hero từ 80rem, hero mini, bìa bài viết | 1798 / 827 | 2 / 1 | Carbon 2:1 | B trang chủ 1280, 1920; article |
| Khung ảnh trang chủ | 936/816, 668/652, 920/876 · 668/542 · 456/270 · 264/470 | 1/1 · 4/3 · 16/9 · 9/16 | Carbon; M3 9:16 | B trang chủ (giữ `object-position`, chữ không đè mặt người) |
| `border-radius: 2px` trong trang | 2px | `--radius-pill` | Thang bo góc | B marketing-popups, quiz-result, localization |

Không đổi điểm ảnh, chỉ đổi cách viết (số → token): vùng chạm 44 → `--touch-target`; tab / chip 44 / 40 → `--control-height-compact` / `--tab-height-desktop`; hàng 52 → `--row-height`; nút tròn 52 → `--round-button-size`; thanh 4 / 8 → `--progress-height` / `--meter-height`; icon 16 / 20 / 24 → `--icon-size-*`; `--control-height` 48 khai báo trực tiếp.

Giữ nguyên (bản sắc thương hiệu hoặc quyết định CTO không dựa bản vẽ): 22 màu và quyết định AA; 2 họ font; 12 cỡ chữ; body 500; giãn chữ heading / display / caps; thang bo góc; lưới 4 / 8 / 12, gutter 12 / 16 / 24; `--page-width` 91rem; breakpoint 48 / 64 / 80rem; control 48 / 52, compact 44 (lượt 2: control 48 mọi mốc, mục 10); header 80, logo 100 × 30, menu gap 40, icon gap 4, chữ menu trắng 60% (6.9:1, tính lại); tầng desktop 80, 120; thanh carousel 4, meter 8; eyebrow và phần nhấn heading accent; chữ HOA display, eyebrow, nhãn nhóm, tiêu đề popup marketing; hero 768 = 4/3 và 360 = 3/4 (khung 360 × 480, Spectrum 3:4); nút và icon có thương hiệu; toạ độ glyph.

## 3. Cần FE (code theme phải đổi theo kit)

| # | Việc | File code |
| --- | --- | --- |
| 1 | Nhãn nút sentence case: 23 dòng (khoảng 35 khoá) ở `docs/design/content.md` §8 (`add_to_cart`, `try_again`, `view_detail` → "View details", `sold_out` của nút…) và chuỗi mặc định `default_*` trong schema block | `locales/en.default.json`, `blocks/*.liquid` |
| 2 | `AGENTS.md` dòng 349 ("… override …" file thiết kế cũ) và dòng 514 ("Add To Cart (Title Case as in …)"): đổi thành CTA sentence case, bỏ tên file cũ | `AGENTS.md` |
| 3 | Thang khoảng cách: thêm `--space-050` 2, `--space-150` 6, các bậc 20 / 40 / 64 / 80 theo tên `--space-lg…6xl`; `--space-4xl` = 48 (`--space-7` là alias); thay `calc(var(--space-1) * N)` (233 dòng) theo bảng foundation.md §1.2 | `snippets/css-variables.liquid`, `assets/*.css` |
| 4 | Padding section dưới 64rem 56 → 48 | `assets/base.css` |
| 5 | Line-height: body 1.625 → 1.5; bỏ `--line-height-heading` 1.2 chung; thêm `--line-height-h1` (1.2 → 1.1667 từ 80rem), `-h2` (1.25 → 1.2222), `-h3` 1.2857, `-h4` 1.2, `-eyebrow` (1.4286 → 1.25), `-title` 1.5556, `-reading` 1.75, `-sm` 1.4286, `-label` 1.5385, `-price-lg` 1.4, `-display` (1.1538 → 1 từ 48rem); không line-height viết số trong component | `snippets/css-variables.liquid`, `assets/*.css` |
| 6 | Giãn chữ: thêm `--letter-spacing-label` −0.02em; link menu header −0.04em → `--letter-spacing-body` | `assets/critical.css`, `base.css` |
| 7 | `--tab-padding-inline` 28 → 24; `--band-inset` 60 → 64 | `assets/base.css` |
| 8 | Token kích thước: `--row-height` 52, `--round-button-size` 52, `--tab-height-desktop` 40, `--count-badge-size` 20, `--progress-height` 4, `--meter-height` 8; `--control-height` 48 khai báo trực tiếp; số đếm giỏ 18 → 20; check option card 22 → 24 | `snippets/css-variables.liquid`, `assets/base.css` |
| 9 | Tag bài viết: nền accent → nền trắng, viền border, chữ foreground; trên nền tối dùng outline | `snippets/article-card.liquid`, `assets/base.css` |
| 10 | Tỉ lệ ảnh: collection card 3/2; hero từ 80rem, hero mini, bìa bài viết 2/1; khung trang chủ 1/1, 4/3, 16/9, 9/16 theo bảng foundation.md §36 | `blocks/*.liquid`, `assets/base.css` |
| 11 | Footer: ảnh chồng 96 × 120, lớp sau 80, lệch 16; logo 80 × 24; cờ 24; đệm 48 / 16 thay 45 / 46 / 14; mô tả 16/28 | `blocks/footer.liquid`, `assets/base.css` |
| 12 | Toast đệm dọc 12, dòng 14/20; `.rte` 16/28; countdown dòng 24 | `assets/base.css` |
| 13 | `font-variant-numeric: tabular-nums` cho giá, dòng tổng, stepper, số trang, số đếm giỏ, countdown | `assets/*.css` |
| 14 | `border-radius` viết số (2px) → `--radius-pill`; radius lẻ theo bảng foundation.md §1.2 | `assets/*.css` |
| 15 | Thay 24 biến tiền tố cũ đặt theo giá trị (91 lần) bằng token vai trò theo bảng foundation.md §32.4, rồi xoá khối khai báo (tên đầy đủ: mục 5 dưới) | `snippets/css-variables.liquid`, `assets/base.css`, `assets/aux.css` |
| 16 | Còn từ lượt trước: `badge_new_color` #467A48 → #4B824D; `background_alt_color` #F4F4F4 → #F4F4F5; `type_primary_font` `inter_n5`; gom 15 token đang ở base.css về `css-variables.liquid`; `--radius-dialog` 24 → 20 | `config/settings_schema.json`, `snippets/css-variables.liquid` |

Bổ sung sau CTO chốt lượt 2 (21/11, mục 10):

| # | Việc | File code |
| --- | --- | --- |
| 17 | Control 48 ở mọi mốc: bỏ mức 52 từ 80rem của `--control-height` (button, input, select, stepper, nút Checkout, ô search). Nút tròn 52 và hàng 52 giữ | `snippets/css-variables.liquid`, `assets/base.css`, `assets/critical.css` |
| 18 | Padding section từ 64rem 120 → 128: `--space-8` / `--space-7xl` = 128 (code đang `space_base` × 30, đổi × 32); đỉnh panel footer từ 80rem theo cùng token | `snippets/css-variables.liquid`, `assets/base.css` |
| 19 | Khoá locale heading, tiêu đề dialog / drawer, empty state, tab, menu, eyebrow, số đếm về sentence case: bảng `docs/design/content.md` §8.2 (khoảng 45 khoá: `404.heading`, `search.results_title`, `cart.summary_title`, `cart.empty_heading`, `blocks.quiz.*_heading`, `blog.*_heading`, `*.products_count`, `*.item_count_badge`…); cùng quy tắc cho `default_*` trong schema block và preset `templates/*.json` | `locales/en.default.json`, `blocks/*.liquid`, `templates/*.json` |
| 20 | Nút big offer "View offer" (thay "Shop the offer" / "Shop the deal") | `blocks/*.liquid` (block big offer), `locales/en.default.json` nếu thêm khoá |
| 21 | Dấu trừ U+2212 cho phần trăm và tiền giảm: `products.card.sale_percent` "-{{ percent }}%" → "−{{ percent }}%", `cart.discount_value` "-{{ amount }}" → "−{{ amount }}"; rà chuỗi "-N%" viết cứng trong Liquid / JS | `locales/en.default.json`, `snippets/price.liquid`, `assets/*.js` |
| 22 | Chỉ báo tải (spinner thay nhãn nút, skeleton) hiện sau 500 ms thay 300 ms; debounce 300 ms (tìm kiếm, số lượng) giữ. JS là việc BE | `assets/*.js` (collection filters, variant picker, localization, cart) |
| 23 | Hero bo 16: `hero_corner_radius` mặc định 12 → 16 hoặc hero đọc `--radius-panel` (đã ghi ở mục 9.6) | `config/settings_schema.json`, `assets/base.css` |
| 24 | Link tóm tắt lỗi form `.form-message__list a`: cao tối thiểu 44 dưới 80rem, 24 từ 80rem | `assets/base.css` |

Cần QA sau các việc trên: đổi assert chuỗi heading / empty state / số đếm ("Your Cart Is Empty", "{n} Items", "Page Not Found"…) và chuỗi "-24%" trong e2e; đo lại chiều cao nút / ô nhập ở 1280, 1920 (48) và khoảng section (128). Cần BA: số 52, 120, 300 ms còn trong AC của `docs/srs.md` (TE-5, TE-6, TE-19), xem dòng "Lượt 2" cuối mục 3 của SRS.

Token kit lệch code (tóm tắt để lập ticket): space 48 / 2 / 6 và các bậc 20, 40, 64, 80; line-height từng bậc; `--band-inset` 64; `--tab-padding-inline` 24; `badge_new`, `background_alt`. 69 trong 150 token của kit chưa có trong code (danh sách: foundation.md §32.3).

## 4. Cần QA, DevOps, BA, CTO

| Ai | Việc |
| --- | --- |
| QA | 45 file trong `tests/` nhắc file thiết kế cũ (30 ở `tests/e2e`, 4 ở `tests/e2e/support`, 1 thư mục snapshot, 1 fixture): bộ so ảnh với ảnh xuất từ bản vẽ cũ hết căn cứ. Đổi baseline sang ảnh chụp mockup (`drafts/designer/**/<trang>-<khổ>.png` hoặc chụp từ HTML) ở 4 khổ; đổi tên 4 tệp hỗ trợ (mục 5) |
| QA | `docs/test-strategy.md` đã sửa (so ảnh với ảnh mockup, lượt soát mục 8): đổi baseline của bộ so ảnh theo câu mới; AC trong `docs/srs.md` đã ghi "khớp mockup" |
| QA | Assert chuỗi nút trong e2e ("Add To Cart", "Try Again"…) đổi theo locale mới sau khi FE sửa |
| DevOps | Handle blog trên store dev còn tiền tố cũ (`/blogs/figma-blog/…`; `docs/design/demo-data.json` có 62 handle `figma-…`): đổi handle hoặc tạo redirect; mockup dùng `/blogs/training/<handle bỏ tiền tố>` |
| DevOps | Đổi tên / lưu trữ thư mục ảnh tham chiếu cũ `docs/figma/img` (35 ảnh) và snapshot; phép kiểm CI so 4 nơi giữ token lấy kit làm chuẩn |
| DevOps | Thêm bước CI grep: `drafts/designer/**` (trừ `ES1-T252`, `ES1-T174`), `docs/**`, `DESIGN.md`, `CONTRIBUTING.md` không còn chữ `figma`, `DS2`, mã node; loại `docs/design/decisions.md`, `CHANGELOG.md`, `figma-handoff.md`, file này và file đã đánh dấu lịch sử. Phép `\b1:[0-9]{3,4}\b` cần soát tay (trùng tỉ lệ kiểu 1:15) |
| BA / PO | `docs/srs.md`, `docs/prd.md`, `docs/charter.md`, `docs/requirements-map.md`, `docs/architecture.md`, `docs/checklist-canvas.md`: Designer ĐÃ sửa ở lượt soát (mục 8): cụm chỉ nguồn → "mockup", bỏ mã node, nhãn nút trong AC → sentence case, thêm dòng cập nhật 21/11. Còn lại cho BA / PO: rà lại câu chữ AC, tăng số bản SRS / PRD / charter, rà từng số đo trong AC theo kit hiện hành (bảng mục 2), cập nhật `drafts/ba/**` (bảng nội dung theo node của ES1-T173) |
| BA / PO | `docs/merchant/pre-publish.md`: đã bỏ tiền tố cũ ở 3 tên ví dụ giảm giá (lượt soát). Tên giảm giá thật trên store dev và trong `tests/fixtures`, `templates/` còn tiền tố cũ: DevOps / QA / FE đổi theo mục 5 |
| Tech Lead | `docs/adr/0001, 0005, 0011, 0013`: Designer đã thêm dòng "Cập nhật 21/11/2026" dưới dòng Ngày (lượt soát), nội dung ADR giữ nguyên làm bối cảnh. ADR 0001 còn tiêu đề và bối cảnh theo hướng "token từ bản vẽ → settings": Tech Lead viết lại hoặc thay bằng ADR mới (mục 6.18) |
| CTO, PR riêng (theme-efitco `.claude/`) | `.claude/agents/designer.md` (dòng 3, 4, 14, 17, 19, 20, 24: "viết UI spec từ …", tool `mcp__figma__*`, "so với …", đọc `docs/figma-inventory.md`), 9 file `.claude/agents/*.md` và 15 file `.claude/skills/**` (design-token, ui-diff, ui-spec-template, designer-knowledge, ux-motion…) còn lấy bản vẽ cũ làm gốc. Sửa: nguồn = `drafts/designer/**` + kit.css, bỏ bước đọc node, ui-diff so với mockup. Không sửa thì lượt agent sau quay lại bám bản vẽ cũ |
| CTO (kho kiến thức ai-team) | `knowledge/designer/20261109-so-quyet-dinh-thiet-ke-efitco-cto.md` (đang active, nối vào prompt mỗi lượt) còn 10 chỗ: "Mâu thuẫn với … sổ này thắng", "Gốc thiết kế duy nhất: …", "Giao diện theo …", "Add To Cart (Title Case …)", "Trang chủ giống 100% …"; `20261109-quy-tac-cot-loi…` và mục lục mỗi file 1 chỗ. Cập nhật theo `docs/design/decisions.md` qua `orchestrator/knowledge.py`, nếu không prompt agent mâu thuẫn với mockup mới |
| CTO | Xác nhận với BGĐ việc thay dòng 10/11 (BGĐ) "gốc thiết kế duy nhất" |

## 5. Tên code còn tiền tố cũ (Cần FE / QA / DevOps đổi)

Bảng duy nhất in tên thật. Tài liệu khác gọi theo giá trị hoặc mô tả.

| Tên hiện tại | Ở đâu | Số lần dùng | Thay bằng | Ai |
| --- | --- | --- | --- | --- |
| `--figma-ffffff` | `css-variables.liquid` → `base.css` | 13 | `--color-background` / `--color-background-dark-foreground` / `--color-accent-foreground` theo chỗ dùng | FE |
| `--figma-1a1a1a` | `base.css` | 10 | `--color-foreground` / `--color-background-dark` | FE |
| `--figma-ebe6e0` | `base.css` | 6 | `--color-background-sand` | FE |
| `--figma-b2b2b2` | `base.css` | 5 | `--panel-muted` / `--color-muted-on-dark` | FE |
| `--figma-4d4d4d` | `base.css` | 5 | `--color-muted` | FE |
| `--figma-e5e5e5` | `base.css` | 4 | `--color-border` | FE |
| `--figma-808080` | `base.css` | 3 | `--color-muted-light` | FE |
| `--figma-393942` | `base.css` | 3 | `--color-background-panel` | FE |
| `--figma-999999`, `--figma-666666` | `base.css` | 2 + 1 | `--color-muted-on-dark` | FE |
| `--figma-000000` | `base.css` | 2 | `--color-background-dark` / `--shadow-raised` | FE |
| `--figma-1c1c1c` | `base.css` | 1 | `--color-background-dark` | FE |
| `--figma-f5f5f1`, `--figma-f4f4f5` | `base.css` | 1 + 1 | `--color-background-cream`, `--color-background-alt` | FE |
| `--figma-d9d9d9` | `base.css` | 1 | rãnh `.meter` (trắng 20%) | FE |
| `--figma-333333` | `base.css` | 1 | trắng 12% trên `--color-background-dark` | FE |
| `--figma-radius-2`, `-18` | `base.css` | 2, 1 | `--radius-pill` | FE |
| `--figma-radius-4` | `aux.css` (dòng 441, 701) | 2 | `--radius-xs` | FE |
| `--figma-radius-8` | `base.css` | 8 | `--radius-sm` | FE |
| `--figma-radius-12` | `base.css` | 1 | `--radius-card` | FE |
| `--figma-radius-16` | `base.css` 11, `aux.css` 4 | 15 | `--radius-panel` | FE |
| `--figma-radius-24` | `base.css` | 2 | `--radius-dialog` (20) | FE |
| `--figma-hero-cta-width` | `base.css` | 1 | bỏ (nút rộng theo nhãn) | FE |
| `--figma-4b824d`, `--figma-white-12`, `--figma-white-60`, `--figma-radius-999` | chỉ khai báo ở `css-variables.liquid` | 0 | xoá (tìm lại trong `snippets/`, `blocks/` trước) | FE |
| `templates/index.figma.liquid`, `blog.figma.liquid`, `article.figma.liquid` | `templates/` | — | đổi hậu tố (đề xuất `.mockup` hoặc bỏ template thử) | FE |
| Chú thích có chữ figma | `snippets/css-variables.liquid`, `product-card`, `article-card`, `cart-summary`, `featured-product-seal`; 13 file `blocks/` (blog-posts, collection-products, collection-card, video-carousel, quiz, bundle-builder, featured-collection, image-with-text, level-card, shop-the-look-row, video-card, shop-the-look, featured-product); `assets/base.css`, `assets/aux.css` | — | viết lại chú thích theo 5 dạng ghi nguồn | FE |
| `tests/e2e/support/figma-exceptions.json` | tệp ngoại lệ AA của bộ test e2e | — | đổi tên (đề xuất `aa-exceptions.json`), giá trị giữ | QA |
| `tests/e2e/support/figma-baseline.cjs`, `figma-compare.ts`, `figma-rows.json` | bộ so ảnh | — | so với ảnh chụp mockup; đổi tên | QA |
| `docs/figma/` (`img/`, `README.md`, `snapshot-1-359.json`) | thư mục ảnh tham chiếu cũ | — | README đã có khung "ĐÃ THAY 21/11" (lượt soát); lưu trữ thư mục, gỡ MCP đọc snapshot | DevOps / CTO |
| Giảm giá tự động `figma-bundle-tier-2`, `figma-bundle-tier-3`, `figma-setup` | store dev (Shopify admin → Discounts), `tests/fixtures/home-figma.json`, `tests/e2e/ES1-T331.spec.ts` | 3 | bỏ tiền tố (`bundle-tier-2`, `bundle-tier-3`, `setup`); `docs/merchant/pre-publish.md` đã ghi tên không tiền tố | DevOps / QA |
| `/blogs/figma-blog/…`, handle `figma-…` | store dev, `docs/design/demo-data.json` | 62 | `/blogs/training/…`, handle bỏ tiền tố | DevOps |
| `docs/figma-inventory.md`, `docs/design/figma-handoff.md` | tên file | — | giữ tên (agent còn đọc đường dẫn; file handoff nói về Figma mới dựng từ mockup) | — |

## 6. Còn mở cho CTO

Sau CTO chốt lượt 2 (21/11, mục 10): ĐÃ ĐÓNG các dòng 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 15, 17 (phần 300 / 500 ms). CÒN MỞ: 1 (xác nhận với BGĐ; dòng gốc giữ nguyên chữ), 14, 17 (các mục "Chưa chốt" khác của ES1-T535 lượt 2), 18, 19, 20, 21.

1. Xác nhận với BGĐ: dòng 10/11 (BGĐ) "gốc thiết kế duy nhất" đã chuyển sang mục "Đã thay".
2. ĐÃ ĐÓNG (lượt 2: chốt 2.0.0). Số bản 2.0.0.
3. ĐÃ ĐÓNG (lượt 2: sentence case, đã áp). Heading h1–h4, tiêu đề dialog / drawer, empty state, tab, link menu sang sentence case theo M3 / Ant / Fluent 2 / Spectrum (Polaris không nêu). Đang giữ Title Case. Danh sách chuỗi: phụ lục. Làm lượt riêng sau khi chốt.
4. ĐÃ ĐÓNG (lượt 2: giữ "Checkout"). "Checkout" hay "Check out" trên nút (hiện giữ "Checkout" là thuật ngữ, ngoại lệ của "mở bằng động từ").
5. ĐÃ ĐÓNG (lượt 2: giữ 500, bản sắc thương hiệu). Body weight 500 (V05) giữ hay về 400 như M3 / Carbon.
6. ĐÃ ĐÓNG (lượt 2: 48 mọi mốc, đã áp). Control 52 từ 80rem về 48 mọi mốc (Carbon có 48, không có 52).
7. ĐÃ ĐÓNG (lượt 2: 128, đã áp). Padding section desktop 120 → 128 hoặc 112 (thang Polaris React; 120 hiện ghi "Thiết kế").
8. ĐÃ ĐÓNG (lượt 2: giữ 48). Section dưới 64rem 48 (đã áp theo Polaris) hay giữ nhịp 56 (Spectrum có 56, Polaris không).
9. Đã đóng trong lượt soát: hero 360 của mockup là 3/4 (khung 360 × 480, Spectrum 3:4), thuộc bộ có tên; tài liệu ghi 4/5 đã sửa.
10. ĐÃ ĐÓNG (lượt 2: tag trung tính giữ). Card bài viết mất điểm nhấn cam sau khi tag trung tính: xem ảnh trước / sau `h-article`.
11. ĐÃ ĐÓNG (lượt 2: giữ, nguồn "Thiết kế"). Display dưới 48rem 52/60 (đã áp) thay 52/62; từ 48rem giữ line-height 1 nên ở 768 dòng không rơi bội 4.
12. ĐÃ ĐÓNG (lượt 2: giữ, ghi là bản sắc thương hiệu). Các dòng giữ mà lý do gốc là bản vẽ: eyebrow accent (09/11), hover và nhãn card (07/11), hình Tab / Chip (components-09, V41), tiêu đề HOA popup marketing (V71 / V75), nhãn nhóm HOA (V76).
13. ĐÃ ĐÓNG (lượt 2: giữ tên file, được trỏ bằng đường dẫn). (Cập nhật ở mục 9.4: nay trỏ bằng đường dẫn, còn mở việc đổi tên file.) Tên file `docs/design/figma-handoff.md` chứa chữ "figma" (theo yêu cầu ticket). Tài liệu hiện hành khác trỏ tới nó bằng mô tả "tài liệu handoff trong docs/design/" để phép grep về 0; nếu CTO muốn trỏ bằng đường dẫn thì đổi tên file hoặc cho ngoại lệ.
14. Link artifact trong handoff ghi dạng `https://claude.ai/artifact/CTjTBzFkfDEHcPBGstiK2p` suy từ mã; CTO kiểm link mở được.
15. ĐÃ ĐÓNG (lượt 2: dấu trừ U+2212, "−24%", đã áp). Ký tự dấu trừ trên badge phần trăm ("-24%" hay "−24%"): chưa có quy tắc, giữ ký tự đang dùng.
16. Đã đóng (mục 9): `--line-height-heading` đã xoá khỏi kit, `:root` còn 150 biến.
17. ĐÃ ĐÓNG phần ngưỡng tải (lượt 2: 500 ms, đã áp); các mục "Chưa chốt" khác của ES1-T535 lượt 2 vẫn mở.
18. ADR 0001 ("token từ bản vẽ → settings") ngược thứ tự mới (kit → tokens.json → settings phản chiếu): đã ghi dòng cập nhật trong ADR; CTO / Tech Lead quyết viết lại ADR 0001 hay mở ADR mới.
19. SRS, PRD, charter là tài liệu của BA / PO: Designer đã sửa phần nguồn thiết kế và nhãn nút theo yêu cầu soát; cần BA / PO rà và tăng số bản (chưa tạo ticket, CTO giao).
20. Component riêng trang chủ (`.level-card`, `.hotspot` / `.stl__*`, `.vcard`, `.tcard`, `.specs`, `.faq__stat`) còn định nghĩa ở file trang (2 file mỗi class), chưa lên kit. Tạm thời handoff §7.1 chỉ file nguồn duy nhất cho từng khổ. Đưa lên kit + thêm section `h-*` ở màn DS: lượt riêng (đụng 3 trang chủ, phải chụp lại 4 khổ).
21. Các kit gap còn lại (mục 8.3).

## 7. Tự soát bước Tài liệu

- Đối chiếu từng số của `docs/tokens.json`, DESIGN.md, foundation.md §1–§2, §32 với `:root` của `kit.css` (151 biến lúc đó, nay 150; 3 media query 48 / 64 / 80rem) và với bảng `h-type`, `h-spacing-radius`, `h-token-architecture`, `h-media`, `h-content`, `h-tabs` của foundation.html.
- `python3 -c "import json; json.load(open('docs/tokens.json'))"` đạt.
- grep `figma|DS2|Design System 2|\b1:[0-9]{3,4}\b` (không phân biệt hoa thường): `docs/tokens.json` 0, `DESIGN.md` 0, `docs/ui-spec/foundation.md` 0, `docs/design/content.md` 0, `CONTRIBUTING.md` 0. Không tính: `decisions.md` (sổ lịch sử), `CHANGELOG.md` (2 dòng trỏ file handoff), `figma-handoff.md`, file này, `docs/figma-inventory.md` và `docs/token-compliance.md` (đã đánh dấu lịch sử).
- Bước này không chụp ảnh (chỉ sửa tài liệu); ảnh soát thuộc bước Kit và bước trang.
- Đếm cuối bước (21/11) trên `docs/**`, `DESIGN.md`, `CONTRIBUTING.md`, trừ các file loại ở trên: còn 175 dòng, đều ngoài danh sách file của bước Tài liệu: `docs/design/demo-data.json` 62 (handle dữ liệu, DevOps), `docs/srs.md` 41, `docs/ui-spec/countdown.md` 14 (nhóm trang), `docs/design/shopify-audit-1111/*` 16, `docs/adr/*` 18, `docs/figma/README.md` 7, `docs/prd.md` 6, `docs/charter.md` 4, `docs/merchant/pre-publish.md` 3, `test-strategy.md`, `requirements-map.md`, `checklist-canvas.md`, `architecture.md` mỗi file 1.
- (Đã xử lý phần lớn ở lượt soát, xem mục 8.) Chưa làm trong bước này (ngoài danh sách được giao): `docs/srs.md`, `prd.md`, `charter.md`, `test-strategy.md`, `requirements-map.md`, `architecture.md`, `checklist-canvas.md`, `docs/adr/*`, `docs/merchant/pre-publish.md`, `docs/figma/README.md`, `docs/design/shopify-audit-1111/*`, notes và audit của ticket cũ (ES1-T535, ES1-T527, ES1-T283, ES1-T34). Xem mục 4.

## 8. Lượt sửa theo soát (21/11, sau bước A–C)

### 8.1 Mockup và kit

| Việc | File | Kiểm |
| --- | --- | --- |
| Tiêu đề newsletter footer trả về "Get 15% Off Your First Order" (nút giữ "Get 15% off") | 7 trang: foundation, product, collection, list-collections, cart, quiz-result, localization | grep `Get 15% off</span>` = 0 |
| "No, thanks" → "No thanks" (nút không dấu câu) | marketing-popups.html (2), marketing-popups.md (4) | grep = 0 |
| Quiz không khớp: "Shop all equipment" + "Change my answers" như các trang khác | ES1-T278/index.html | — |
| Lỗi email popup: "Enter an email like name@example.com." | marketing-popups.html, marketing-popups.md | grep chuỗi cũ chỉ còn ở ví dụ "Không nên" |
| Chú thích "DS check", "select DS", "DS Drawers", "quy tắc DS V67" viết theo nguồn trong repo | 13 trang + navigation.md | grep `\bDS (Drawers\|check\|V[0-9])\|select DS` = 0 trong mockup |
| Heading đổi cỡ sang bậc khác thì đổi luôn line-height của bậc | product (`.buy__title--h3`), cart, collection, navigation, marketing-popups, pagination, shopify-features, quiz-result, localization | đo computed 360 / 1280: 32/40 → 36/44; 28/36 (mọi chỗ bội 4) |
| Link hover trên sand đọc `--color-accent-on-sand` 4.62:1 | kit.css, foundation.html `h-dark`, foundation.md §2.2 | — |
| Link trong tóm tắt lỗi form: cao tối thiểu 44 dưới 80rem, 24 từ 80rem | kit.css, foundation.html `h-grid` (ô Token), foundation.md §1, §13 | đo: 44 ở 360, 24 ở 1280 |
| Hero 360 là 3/4 (mockup) chứ không phải 4/5: sửa tài liệu | tokens.json, DESIGN.md, foundation.md §36, foundation.html `h-media`, kit.css (chú thích), decisions.md, handoff §11 | grep `4 / 5` = 0 |
| Thanh đếm ngược big offer dùng thẳng kit `.sale-countdown--compact` (bỏ `.offer-countdown` viết tay; Compact mọi mốc theo countdown.md §12, CTO 11/11): ô 44 → 40, số 18/28 → 16/24, đệm 24 → 16 | marketing-popups.html, marketing-popups.md §4 | ảnh `b4` 360 + 1280: thanh 267 × 60, không tràn |

### 8.2 Tài liệu

| File | Đã làm |
| --- | --- |
| `docs/ui-spec/countdown.md` | Thêm mục "Thay đổi ES1-T567"; thứ tự nguồn mới; bỏ mọi mã node; anatomy trỏ `h-countdown` + class kit; 16/26 → 16/24; bo 8 = `--radius-sm`; token khoảng cách tên mới; bề rộng hết giờ 16.75rem / 19.5rem; "Shop the deal" |
| `docs/ui-spec/*.md` (404, article, foundation, marketing-popups, password, page, search, mini-cart-quickview) | Nhãn nút còn Title Case → sentence case như mockup |
| `docs/srs.md` | Dòng cập nhật 21/11 ở đầu; khối "Chốt CTO 21/11" cuối mục 3; TE-17 đổi tên "Trang chủ khớp mockup"; dòng "Phía:" thay mã node bằng id section của mockup ES1-T293; AC bỏ mã node và tên file cũ; nhãn nút trong AC (mục 2) sentence case; mục 3 (lịch sử) giữ nhãn cũ kèm "THAY 21/11". Giữ định dạng "### TE-x — tên", mã AC |
| `docs/prd.md`, `docs/charter.md` | Dòng cập nhật 21/11; "giống bản vẽ" → "khớp mockup"; "nội dung demo" |
| `docs/test-strategy.md`, `requirements-map.md`, `architecture.md`, `checklist-canvas.md` | Mỗi file 1 dòng: nguồn so sánh / thứ tự block theo mockup |
| `docs/merchant/pre-publish.md` | 3 tên ví dụ giảm giá bỏ tiền tố cũ |
| `docs/figma/README.md`, `docs/design/shopify-audit-1111/*.md` | Khung "ĐÃ THAY / CẬP NHẬT 21/11 — tài liệu lịch sử" ở đầu |
| `docs/adr/0001, 0005, 0011, 0013` | Dòng "Cập nhật 21/11/2026" dưới dòng Ngày; nội dung giữ |
| `docs/design/decisions.md` | Các dòng mục "Đã chốt": chữ chỉ file cũ → "bản vẽ cũ", bỏ mã node, tiền tố biến và tên tệp test gọi theo mô tả; V01 ghi AA 4.57:1, V03 / V18 ghi "Thiết kế: bảng màu thương hiệu"; thêm dòng lượt soát; đóng mục chờ (9). Chỉ còn dòng 9 (nêu tên file bị bỏ, đường dẫn handoff) và mục "Đã thay" nhắc tên cũ |
| `docs/design/figma-handoff.md` | §3.6 mới: 151 = 106 variable + 22 trong style + 23 không tạo (layer, easing, alias, công thức, texture) kèm nơi thể hiện; §7.1 mới: pattern riêng trang chủ và file nguồn; bỏ mục mở hero 4/5 |

Đếm lại `figma|DS2|Design System 2` (không phân biệt hoa thường) sau lượt soát: `docs/srs.md` 0, `prd.md` 0, `charter.md` 0, `test-strategy.md` 0, `requirements-map.md` 0, `architecture.md` 0, `checklist-canvas.md` 0, `merchant/pre-publish.md` 0, `ui-spec/countdown.md` 0, `decisions.md` 4 (dòng 9 và mục "Đã thay"). Còn lại là file có khung lịch sử (`figma-inventory.md`, `token-compliance.md`, `docs/figma/README.md`, `shopify-audit-1111/*`, 4 ADR), `demo-data.json` 62 (handle dữ liệu, DevOps), tài liệu handoff và file này.

### 8.3 Kit gap các nhóm trang báo

| Gap | Xử lý |
| --- | --- |
| `.offer-countdown` viết tay trùng kit | ĐÃ SỬA: dùng kit `.sale-countdown--compact` |
| Component riêng trang chủ lặp ở 2–3 file | CHƯA: handoff §7.1 chỉ file nguồn; lượt riêng (mục 6.20) |
| Token tỉ lệ ảnh (`--ratio-*`), `--display-fluid`, mũi tên hero theo rìa | CHƯA: giá trị trong trang đều thuộc bộ tỉ lệ có tên; đưa lên kit cùng lượt component trang chủ |
| Thang kích thước cho thumb / ô ảnh (40, 44, 52, 56, 64, 72, 80, 96), hàng 72, cột 38rem; bề rộng stepper compact 130; logo 100 × 30 | CHƯA: đề xuất thang `--size-*` theo Carbon sizing (bội 8) + `--logo-width` / `--logo-height` + `--quantity-compact-width`; thêm token đổi số đếm 151 ở 4 tài liệu nên làm một lượt |
| Số đếm bộ lọc tròn 24 trên nút Filter (`.filter-toggle__count`) | CHƯA: đề xuất class kit `.count-badge--md` 24 cạnh `--count-badge-size` 20 |
| Tay nắm bottom sheet (`.sheet-handle`), nút icon tròn 44 (`.icon-button`), nút chữ gạch chân 44 (`.link-button`) | CHƯA: 3–4 trang tự viết cùng công thức; đưa lên kit ở lượt component (đổi markup nhiều trang, phải chụp lại) |
| Hàng danh mục có ảnh 56 và hàng menu drawer (`.cat-list`, `.nav-row`) | CHƯA: chỉ 1 trang dùng; lên kit khi trang thứ hai cần |
| Letter-spacing 0.06em của mã giảm giá kiểu display (`.code__value`) | CHƯA: đề xuất dùng `--letter-spacing-caps` 0.04em (đổi điểm ảnh nhỏ) hoặc thêm token; chờ lượt sau |
| Trang còn đọc alias `--space-1…7` | CHƯA: giá trị đúng (alias trỏ thang mới); đổi hàng loạt sang tên mới ở lượt riêng |
| `--line-height-heading` | ĐÃ XOÁ ở lượt trau chuốt (mục 9): không trang nào còn đọc |

## 9. Lượt sửa trau chuốt (21/11, sau mục 8)

Số đếm ở mục 1, 7, 8 là của thời điểm đó; sau lượt này `:root` của kit có 150 biến (typography 34, 12 line-height; handoff: 106 variable + 22 trong style + 22 không tạo).

### 9.1 Kit và màn DS

| Chỗ | Sửa | Nguồn |
| --- | --- | --- |
| `kit.css` `:root` | Xoá `--line-height-heading` (grep `var(--line-height-heading)` trong mockup = 0); 151 → 150 biến; chép sang `tokens.json`, DESIGN.md, foundation.md §1, §32, `figma-handoff.md` §1, §3.6, CHANGELOG, màn `h-token-architecture` | Đặc tả line-height: grep = 0 thì xoá |
| `--line-height-eyebrow` | 1.4286 (1.25 từ 80rem) → `1.25rem` cố định, bỏ override ở 80rem. Ở 360 và 1280 hình không đổi (14/20, 16/20); giữa hai mốc dòng luôn 20 (trước lệch tới 2.85px ở 1279) | Thiết kế: dòng cố định 20 vì cỡ nội suy; 20 có ở Polaris React line height |
| `--line-height-h1`, `--font-size-h1` (chú thích) | Tách nguồn theo mốc: 40/48 Chuẩn Polaris React; 48/56 Thiết kế (giữ tỉ lệ, trên bội 4; Polaris không nêu dòng 56); cỡ 48 có ở Carbon | Không gán cho Polaris điều nguồn không nêu |
| `--motion-hero` (chú thích) | "spinner = nửa vòng (700)" → "1 vòng spinner, 1 vòng shimmer skeleton" (đúng với `kit-spin` và bảng `h-motion`) | Kit |
| `h-type` | Câu "lệch lưới dưới 1px" → "h1 lệch tối đa 1.6px, h2 1px giữa hai mốc; hai đầu đúng bội 4"; hàng eyebrow, h1 của bảng Line-height theo trên | Tính từ clamp của kit |
| `h-spacing-radius` | Mẫu `--radius-pill` thêm số "999 (nửa chiều cao)"; bảng "Một hệ tên": tên token không gãy dòng (class trang `.name-nowrap`) | Soát ảnh |
| `h-drawer` | Khung mẫu Cart drawer cao 640 → 800 để ở 360 panel chân không che dòng hàng thứ hai | Soát ảnh |
| `h-chip`, `h-icon` | Tên ẩn chip gỡ theo khuôn locale `remove_filter` "Remove filter Color: Black" (chứa nguyên chữ đang hiện); chip "Availability: In stock" có đủ tên nhóm | WCAG 2.5.3; locale theme |

### 9.2 Chữ trong mockup và spec

| Chỗ | Trước | Sau |
| --- | --- | --- |
| `ES1-T255/cart.html` 4 nút card gợi ý | aria-label "Add {tên} to cart" | "Add to cart: {tên}" (content.md §2) |
| `ES1-T255/cart.html` alert lỗi giỏ; `cart.md` §State 3 | "Something went wrong. Refresh the page and try again." + "Reload cart" | "We couldn't update your cart" + "Check your connection, then try again." + "Try again" (link tải lại giỏ) |
| `ES1-T262/mini-cart-quickview.html` alert 4d; `mini-cart-quickview.md` | dòng "Something went wrong. Refresh the page and try again." | "Check your connection, then try again." |
| `ES1-T254/collection.html` empty state; `collection.md` | "Clear filters" | "Clear all filters" (cùng search; content.md §4 ghi ngoại lệ empty state) |
| `ES1-T285/quiz-result.html`; `quiz-result.md` | "Retake the quiz" | "Retake quiz" |
| `ES1-T263/marketing-popups.html` (2), `marketing-popups.md` (4), `countdown.md` (2) | "Shop the deal" | "Shop the offer" (khớp màn DS; "Deal" thuộc cột không dùng) |
| `ES1-T263/marketing-popups.html` toast lỗi thêm giỏ | "We couldn't add this item" | "Couldn't add to cart" (khớp product, content.md §3) |
| `ES1-T258/page.html` tóm tắt lỗi form | "Enter your name" · "Enter a valid email" | "Name: enter your name" · "Email: enter an email like name@example.com" |
| `content.md` §4, §5, §9 | — | Ngoại lệ "Check out now" (popup giữ chân), "Clear all filters" (empty state), khuôn tên ẩn chip, danh sách heading sentence case chờ chốt |

Cần FE thêm (nối bảng mục 3): chuỗi `cart.error` trong `locales/en.default.json` ("Something went wrong. Refresh the page and try again." → "Check your connection, then try again.", tiêu đề alert "We couldn't update your cart", nút "Try again"); nhãn nút big offer "Shop the offer"; khi đổi locale / `default_*` sang sentence case thì sửa luôn `docs/merchant/bundle-builder.md` (dòng 66, 75, 109: "Add Bundle To Cart", "Browse All Setups", "Add Setup To Cart") và `docs/merchant/pre-publish.md` (dòng 34, 51: "Explore Equipment"…) vì hai file này in giá trị mặc định của code hiện tại (lượt này chưa đổi để khớp code).

### 9.3 Heading và tab đang sentence case (nối mục 6.3)

ĐÃ ĐÓNG ở lượt 2 (mục 10): CTO chốt sentence case cho cả hai nhóm, nhóm dưới đã đúng từ trước, không đổi:

| Chuỗi | File:dòng |
| --- | --- |
| "Add a comment" (h2) | `ES1-T257/article.html`:189 |
| "Country and language" (tiêu đề dialog / cấp 2 drawer) | `ES1-T289/localization.html`:237, 432, 454 |
| "Popular searches", "Shop by category" | `ES1-T256/search.html`:367, 377, 413, 423 |
| "Popular collections", "Trending now", "Recent searches" | `ES1-T261/predictive-search.html`:408, 418, 543, 560, 569 |
| "Pickup availability" | `ES1-T288/shopify-features.html`:421, 459, 471 |
| "Cart 3 items" (tiêu đề drawer) | `ES1-T262/mini-cart-quickview.html`:257 |
| Tab "Country/region" (chuỗi locale của theme) | `ES1-T289/localization.html`:240, 434, 457 |
| Tab "Diet plans" (tag blog, theo dữ liệu, không đổi dù chốt hướng nào) | `ES1-T257/blog.html`:132, 254 |

### 9.4 Tài liệu

- `docs/design/figma-handoff.md` được gọi bằng đường dẫn ở `kit.css` đầu file, DESIGN.md, CONTRIBUTING.md, `tokens.json` `_source` (trước ghi mô tả "tài liệu handoff trong docs/design/", Designer không biết mở file nào). Đây là tên file theo yêu cầu ticket, cùng loại ngoại lệ grep như CHANGELOG; bước CI grep cần loại cụm `figma-handoff.md`. Thay mục 6.13: còn mở phần "có đổi tên file thành `handoff.md` không" (ticket riêng).
- Khung "TÀI LIỆU LỊCH SỬ" 2 dòng ở đầu `drafts/designer/ES1-T34/ui-spec-rich-text.md` và `drafts/designer/ES1-T283/audit.md` (nội dung giữ nguyên); `docs/design/shopify-audit-1111/` README, A, B, C đã có khung từ mục 8.
- `foundation.md`: câu ghi chú trên các bảng lịch sử (cột Nguồn "bản vẽ cũ" là lý do thời điểm đó); dòng §1.2 "kèm node" → "kèm mã tham chiếu bản vẽ".
- `figma-handoff.md` §1: href bài viết trong mockup là handle đích; `demo-data.json` giữ nguyên tới khi DevOps đổi handle và chạy lại `ai-team/ops/export_demo_data.py`.
- Mục 5: thêm 3 tên giảm giá tự động còn tiền tố cũ trên store dev (DevOps / QA).

### 9.5 Còn mở thêm

- ĐÃ ĐÓNG (lượt 2): nút big offer "View offer".
- ĐÃ ĐÓNG (lượt 2): h1 48/56 giữ, nguồn "Thiết kế".
- Số 66 / 15 / 69 token đã có trong code sau khi xoá alias: suy từ số cũ (67 gồm `--line-height-heading` đang có ở `css-variables.liquid`), FE đếm lại khi lập ticket.

### 9.6 Lượt sửa theo người soát (21/11, lượt 3)

| File | Đổi | Lý do |
| --- | --- | --- |
| 9 trang mockup (foundation, product, collection, cart, navigation, predictive-search, mini-cart-quickview, marketing-popups, quiz-result, shopify-features) | Tên sản phẩm mẫu tiếng Việt → tiếng Anh: "Hết hàng toàn bộ" → "Foldable bench", "Sản phẩm không có media" → "Training mat", "Sản phẩm có màu sale và màu không sale" → "Two-tone kettlebell", "Sản phẩm số" → "Digital product", "2 option có tổ hợp không tồn tại" → "Resistance band set", "Sale giá nhỏ" → "Grip tape" | Chữ giao diện mockup tiếng Anh. Tên trên store dev (collection `edge_cases`) và trong `docs/ui-spec/*.md` còn tiếng Việt: DevOps đổi tên sản phẩm trên store nếu muốn khớp |
| `foundation.html` `h-article` | Thêm đoạn số đo (card 70% / 40%, tối đa 336, gap `--grid-gap`, nút tròn 52, khung 3 / 4 Chuẩn: Spectrum); nhãn trạng thái hiện cả khi h2 nằm trong `.section-header` | Đủ số để dựng lại như các section khác |
| `foundation.html` `h-rte`, `h-countdown`, mega | h5 "18/28", h6 "16/24 caps +4%"; K4 về cỡ chú thích 13; "Shop free weights" (lời kêu gọi mở bằng động từ = link dạng nút, content.md §5) | Thiếu số; lệch cỡ chú thích; sentence case |
| `search.html` S4 | Chân drawer lọc dùng bố cục `.drawer__actions` của collection.html (wrap-reverse; ở 360 nút chính trên, "Clear all" dưới) | Nút chính 131px chữ sát mép |
| `navigation.html` | Bỏ `outline-offset: -2px` riêng của `.nav-row.is-focus`, về vòng focus kit (offset 2) | Chữ chạm vòng focus; khớp `:focus-visible` thật |
| `marketing-popups.html`, `quiz-result.html` | "5 items"; chú thích "View all" | Sentence case |
| Hero trang chủ | Mockup dùng `--radius-panel` 16: foundation.html `h-media`, foundation.md §36, DESIGN.md sửa theo. Cần FE: `hero_corner_radius` mặc định 12 → 16 hoặc hero đọc `--radius-panel` | Mockup là nguồn chuẩn |
| `figma-handoff.md` | line-h1 / h2 ở 768: 52 / 42; buy bar 72 (360) · 80 (từ 768) | Số lệch 1px; thiếu mốc |
| `foundation.md`, `navigation.md`, `content.md` | "Browse all setups"; ảnh ô mega 4 / 3; quy tắc tiêu đề ô ảnh mega | Khớp mockup |

Để lượt sau (không chặn bàn giao): thang kích thước 44 / 52 / 56 / 64 / 80 và token `--ratio-*` trong kit; `.filter-toggle__count` 24 (đang khai trong search.html, đọc `--space-xl` cho kích thước) vào kit hoặc về `--count-badge-size` 20; đổi alias `--space-1…7` trong trang sang tên mới; `--radius-hero` chỉ còn một nơi đọc (marketing-popups.html), cân nhắc xoá.

## 10. CTO chốt lượt 2 (21/11)

Quyết định: `docs/design/decisions.md` mục "CTO 21/11 lượt 2 — ES1-T567". Ba bước như lượt 1: Kit + màn DS, các trang mockup, Tài liệu (bước này chỉ sửa `docs/**`, DESIGN.md và file này; không sửa `.html`, `kit.css`).

### 10.1 Từng câu đã chốt và đã làm

| CTO chốt | Kit + mockup | Tài liệu |
| --- | --- | --- |
| Sentence case cho heading h1–h4, tiêu đề section, dialog / drawer / popup, empty state, tab, link menu, nhãn chip lọc; giữ tên thương hiệu, tên sản phẩm / collection / bài viết (dữ liệu merchant), tên riêng, viết tắt; chữ HOA do CSS giữ, chữ nguồn sentence case | foundation.html (31 tiêu đề section, chữ mẫu, menu, footer, bảng `h-content`) và các trang: 166 chuỗi đổi (phụ lục) | content.md §2, §2.1, §2.2 (mới), §5, §6, §8.2 (mới: khoá locale); DESIGN.md mục Typography; foundation.md §6 và mục "Lượt 2"; chuỗi mẫu trong các file `docs/ui-spec/*.md`; handoff §5, §10, §11; chuỗi giao diện trong AC mục 2 của `docs/srs.md` (42 dòng) |
| "Checkout" giữ (thuật ngữ) | không đổi | content.md §4, §8.1; ghi chú cuối 6 spec trang |
| "Shop the offer" → "View offer" | foundation.html, marketing-popups.html | content.md §2, §2.1, §4, §8.1; marketing-popups.md (4 chỗ), countdown.md (2 chỗ) |
| Body weight 500 giữ, bản sắc thương hiệu | không đổi | tokens.json `typography.body.source`; DESIGN.md; foundation.md §1.1; decisions V05 |
| Control 48 ở mọi mốc (nút tròn 52, hàng 52 giữ) | kit `--control-height` 48, bỏ override ở 80rem | tokens.json `layout.control_height`; DESIGN.md (2 chỗ); foundation.md §1, §1.2, §1.3, §6; handoff §3 (variable), §6 (4 component), checklist; spec trang (404, article, cart, collection, gift-card, index, index-1280, marketing-popups, mini-cart-quickview, page, password, predictive-search, product, quiz-result, search) |
| Padding section desktop 120 → 128 | kit `--space-7xl` 128 | tokens.json `space.8`, `space.named.7xl`, `layout.section_gap`; DESIGN.md (2 chỗ); foundation.md §1, §1.2, §4 (đỉnh panel footer); handoff (3 chỗ); spec trang có ghi `--section-gap` (404, article, blog, cart, collection, gift-card, index-1280, index-mobile-a, page, product, search) |
| Section dưới 64rem giữ 48 · tag bài viết trung tính · countdown big offer Compact · h1 48/56, display mobile 52/60 (nguồn "Thiết kế") | không đổi | decisions (đóng mục chờ); CHANGELOG |
| Bản sắc thương hiệu: eyebrow accent, hover và nhãn card, hình Tab / Chip, tiêu đề HOA popup marketing, nhãn nhóm HOA | chú thích kit, ghi chú màn DS | decisions (khối lượt 2 + ghi chú tại 09/11, 07/11, components-09, V41, V71 / V75, V76); content.md §2, §5; DESIGN.md; marketing-popups.md |
| Tiêu đề ô ảnh mega "Shop free weights" giữ là link dạng nút | không đổi | content.md §2.1, §5 |
| Link tóm tắt lỗi form: sàn 44 dưới 80rem | mockup đã đúng; `h-form` thêm câu | DESIGN.md mục touch target; foundation.md §1.3; tokens.json `layout.touch_target.error_summary_link` |
| Badge giảm giá dấu trừ U+2212 ("−24%") | foundation.html và các trang | content.md §2, §4, §5, §6, §8.2; foundation.md §8, §34; spec trang có badge giảm giá ("−24%", "−N%"); handoff §5 |
| Dòng lịch sử BGĐ 10/11 giữ nguyên chữ gốc | — | decisions mục "Đã thay" không sửa |
| Số bản 2.0.0 chốt | đầu màn DS | tokens.json `_version_note`; DESIGN.md; foundation.md đầu file, §40; CHANGELOG; content.md; handoff |
| Giữ tên `figma-handoff.md`, trỏ bằng đường dẫn | — | không đổi tên; mục 6.13 đóng |
| Chỉ báo tải hiện sau 500 ms | foundation.html `h-state` | tokens.json `loading.indicator_delay_ms` 500; DESIGN.md; foundation.md §18, §18.1, §36, §38, §39; collection.md, localization.md; handoff §6. Debounce 300 ms (predictive-search, mini cart, localization tìm nước) giữ |

### 10.2 Sửa thêm trong bước Tài liệu

- `docs/ui-spec/foundation.md`: cả 1 303 dòng của file trong nhánh mang một tiền tố lặp 210 ký tự ("`--radius-panel` 16 (hero trang chủ… `--radius-panel` |", lỗi thay chuỗi của lượt 3). Đã gỡ tiền tố ở mọi dòng (file 477 825 byte → còn khoảng một phần ba) và đặt đúng câu đó vào ô bo góc của hàng Hero ở bảng tỉ lệ §36. Nội dung còn lại không đổi.
- `docs/srs.md`: chỉ đổi chuỗi giao diện trong AC mục 2 (dòng 16, 147, 152–154, 173, 197, 202, 236, 237, 276, 279, 333, 334, 336, 362, 364, 384, 389, 390, 443, 446, 487, 488, 492, 493, 495–497, 536, 561, 570, 574, 591, 601, 605, 624, 667, 673, 682, 703, 710), dòng cập nhật đầu file và thêm một dòng "Lượt 2" ở khối "Chốt CTO 21/11". Không sửa số trong AC (52, 120, 300 ms): ghi cho BA ở dòng đó. Mục 3 (lịch sử) không đổi. `docs/prd.md`: không có chuỗi bị ảnh hưởng, không sửa.
- Số đếm token: `:root` của kit vẫn 150 biến (đếm lại 21/11 bằng regex trên khối `:root`); lượt 2 không thêm, không xoá token.

### 10.3 Còn mở sau lượt 2

- Xác nhận với BGĐ việc thay dòng 10/11 (CTO).
- Số trong AC của SRS (control 52, section 120, ngưỡng tải 300 ms): BA sửa ở bản SRS kế tiếp.
- `docs/merchant/bundle-builder.md`, `pre-publish.md` in giá trị mặc định của code (Title Case): sửa cùng đợt FE đổi locale.
- Kho kiến thức ai-team và định nghĩa agent / skill của theme còn quy tắc Title Case, control 52: CTO cập nhật (mục 4).
- Tên trang và mục menu trên store dev ("Our Story", "Contact Us", blog "Training Tips & Inspiration") là dữ liệu merchant: DevOps đổi nếu muốn khớp mockup.
- Mục 6 dòng 14, 18, 19, 20, 21 và các mục "Chưa chốt" còn lại của ES1-T535 lượt 2 (warning của `.alert` dùng accent, bậc bóng toast, `nowrap` mặc định, font RTL).

### 10.4 Lượt sửa theo người soát (21/11, sau lượt 2)

Đã sửa:

- Tab bestsellers trang chủ (`ES1-T278/index.html`, `ES1-T293/index.html`): "Portable fitness" → "Portable Fitness". Là tên collection (`docs/design/demo-data.json`), Q1 giữ; khớp footer, mega menu, list-collections.
- `ES1-T251/foundation.html`: `<title>` "Efitco design system"; nút "View offer" của popover big offer bỏ `button--small` (44 → 48, khớp `marketing-popups.html` và `marketing-popups.md` §7). Chụp lại `h-sticky-bar` 360, 1280.
- `ES1-T263/marketing-popups.html`: chú thích CSS "badge −24%" (U+2212). `ES1-T258/404.html`: comment "padding section 128".
- Seal featured product (`ES1-T279/index.html`, `ES1-T293/index.html`): `text-transform` chuyển từ inline style sang `.fp__seal text` trong CSS của trang; hình không đổi (đo computed `uppercase`).
- `docs/ui-spec/foundation.md` §1.3 hàng "2 · Submit form": cột 1280, 1920 "156 × 52" → "156 × 48". `docs/ui-spec/search.md`: "nút chính 48 / 52" → "nút chính 48".
- File này: mục 6 dòng 17 xoá câu cũ về 300 / 500 ms; mục 3 "69 trong 150 token"; mục 1, 7 thêm "(nay 150)".

Bỏ qua, kèm lý do:

- Mẫu tab dài "Portable fitness and travel gear" ở `h-tabs`: nhãn mẫu để thử tab giãn, không có trong demo-data nên không phải tên collection; giữ sentence case.
- Seal "Efitco · Feature product ·" không đổi thành "Featured product": chuỗi `blocks.featured_product.seal_label` đã ghi ở `content.md` §8 là "Feature product"; đổi chữ nằm ngoài các câu CTO chốt.
- `docs/design/decisions.md` dòng "control 48 / 52": dòng lịch sử, đã có câu "THAY 21/11 lượt 2" ngay sau.

Cần CTO chốt (lệch có từ trước lượt này, không tự chọn):

- ĐÃ CHỐT (CTO 23/11, sửa cùng ngày): tiêu đề drawer mini cart là "Cart" ở mọi mockup và spec ("Your cart" làm pill số lượng xuống dòng ở 360, header vượt 72). Trang giỏ rỗng vẫn "Your cart is empty".
- ĐÃ CHỐT (CTO 23/11): menu footer "Information" ở mọi trang là Our story · Our Efitco · FAQs · Contact us · Shipping policy · Refund policy; đã thêm "Our Efitco" vào 11 trang còn thiếu.

## Phụ lục. Chuỗi đã đổi sang sentence case (CTO 21/11 lượt 2)

Trích tự động từ diff mockup (trừ ES1-T252, ES1-T174) ngày 21/11: 166 chuỗi, dạng "trước → sau". Tên sản phẩm, collection, bài viết theo dữ liệu không đổi (Free Weights, Functional Training, Benches & Racks, Recovery & Mobility, Portable Fitness, Ativafit Lava…, Iron Core Kettlebell…, Home Starter Kit, Efitco Saigon Centre…). Chuỗi đã sentence case từ trước: mục 9.3.

- Chữ giao diện của trang: 1 Year Warranty → 1 year warranty · 10 Products → 10 products · 12 Products → 12 products · 2 Comments → 2 comments · 2 Products → 2 products · 24 Products → 24 products · 4 Products → 4 products · 5 Products → 5 products · 6 Products → 6 products · 7 Products → 7 products · 90 Day Money Back → 90 day money back · A Complete Corner Gym, Itemised → A complete corner gym, itemised · All Products → All products · Back to Training Tips & Inspiration → Back to Training tips & inspiration · Before You Go → Before you go · Big Offer · −24% → Big offer · −24% · Browse Categories → Browse categories · Choose A Color → Choose a color · Choose Your Training Level → Choose your training level · Contact Us → Contact us · Contact Us – Efitco → Contact us – Efitco · Customer Reviews → Customer reviews · Designed For Athletes: → Designed for athletes: · Desktop States → Desktop states · Efitco Design System → Efitco design system · EFITCO · FEATURE PRODUCT · → Efitco · Feature product · · Empty Menu → Empty menu · Empty, Loading And Error States → Empty, loading and error states · Everything You → Everything you · Everything You Need → Everything you need · Fast Shipping → Fast shipping · Featured Product Edge Cases → Featured product edge cases · Featured Product · Free Weights → Featured product · Free Weights · Find Your Perfect Gear → Find your perfect gear · Folds Away In Seconds → Folds away in seconds · Get 15% Off → Get 15% off · Key Features Of The Lava 66 → Key features of the Lava 66 · Level Up → Level up · Limited Offers → Limited offers · Marketing Popups → Marketing popups · Mega Menu And Menu Drawer → Mega menu and menu drawer · Mini Cart And Quick View → Mini cart and quick view · Missing Image Or Image Error → Missing image or image error · More Training Tips → More training tips · Mục "Fast Shipping" trong hàng cam kết (còn 2 cột) → Mục "Fast shipping" trong hàng cam kết (còn 2 cột) · Need → need · No Articles On This Topic → No articles on this topic · No Articles Yet → No articles yet · No Collections Yet → No collections yet · No Exact Match → No exact match · No Matching Products → No matching products · No Products Here Yet → No products here yet · No Products Match These Filters → No products match these filters · No Results For "kettlebel" → No results for "kettlebel" · Nothing In Accessories Yet → Nothing in Accessories yet · Nothing Matches “treadmill” Yet → Nothing matches “treadmill” yet · Opening Soon → Opening soon · Opening Soon – Efitco → Opening soon – Efitco · Order Summary → Order summary · Our Story → Our story · Our Story (pressed) → Our story (pressed) · Page Not Found → Page not found · Page Not Found – Efitco → Page not found – Efitco · Pairs Well With · loading → Pairs well with · loading · Pick Your Kit, Save As You Go → Pick your kit, save as you go · Popular Products → Popular products · Portable Fitness And Travel Gear → Portable fitness and travel gear · Premium Quality → Premium quality · Questions and Answers → Questions and answers · Quick Answers Before You Write → Quick answers before you write · Quiz Results → Quiz results · Rigorous Testing: → Rigorous testing: · Search Results → Search results · See Real Equipment In Action, Before You Buy → See real equipment in action, before you buy · Send Us A Message → Send us a message · Shipping And Returns At A Glance → Shipping and returns at a glance · Smooth Every Single Rep → Smooth every single rep · Take 15% Off → Take 15% off · Teaser Big Offer → Teaser big offer · to Train. → to train. · Train Hard → Train hard · Training Level → Training level · Training Tips & Inspiration → Training tips & inspiration · Training Tips & Inspiration · Your Cart Is Empty → Training tips & inspiration · Your cart is empty · Training Tips & Inspiration – Efitco → Training tips & inspiration – Efitco · Uncompromising Quality: → Uncompromising quality: · Versatile Gear For All Exercises → Versatile gear for all exercises · We're Proud To Be The Best At Training → We're proud to be the best at training · Weight · Our Story → Weight · Our story · What Our Customers Say? → What our customers say? · What People Are Buying? → What people are buying? · Why Choose → Why choose · Why Choose Efitco? → Why choose Efitco? · Worth Every Penny → Worth every penny · You May Also Like → You may also like · You May Also Need → You may also need · You're Already Subscribed → You're already subscribed · You're On The List → You're on the list · Your $50.00 Gift Card – Efitco → Your $50.00 gift card – Efitco · Your Bundle → Your bundle · Your Cart → Your cart · Your Cart Is Empty → Your cart is empty · Your Cart Is Saved → Your cart is saved · Your Efitco Gift Card → Your Efitco gift card · Your First Order → your first order · Your Fitness → your fitness · Your Gear Shortlist → Your gear shortlist
- Tiêu đề section của màn mẫu (DS và các trang trạng thái): 1. Grid And Layout → 1. Grid and layout · 1. Menu Drawer: Level 1 → 1. Menu drawer: level 1 · 1. One Popup At A Time → 1. One popup at a time · 1. Shop: Link Columns And Featured Product → 1. Shop: link columns and featured product · 10. Badges And Sold Out → 10. Badges and sold out · 11. Product Card → 11. Product card · 12. Collection Card → 12. Collection card · 12b. Color Schemes And Roles → 12b. Color schemes and roles · 13. Article Card And Row → 13. Article card and row · 14. Inputs And Form States → 14. Inputs and form states · 15. Input Group And Search Field → 15. Input group and search field · 16. Listbox Option → 16. Listbox option · 19. Facet Group → 19. Facet group · 2. Before You Leave: Empty Cart With Code → 2. Before you leave: empty cart with code · 2. Collection: Category Images → 2. Collection: category images · 2. Popup States → 2. Popup states · 20. Selectable Option → 20. Selectable option · 21. Variant Picker → 21. Variant picker · 22. Quantity Stepper → 22. Quantity stepper · 23. Price And Rating → 23. Price and rating · 24. Data Table → 24. Data table · 25. Progress Meter → 25. Progress meter · 26. Sticky Bar, Teaser And Popover → 26. Sticky bar, teaser and popover · 29. Dialog And Bottom Sheet → 29. Dialog and bottom sheet · 3. Big Offer Popup → 3. Big offer popup · 3. Color Tokens → 3. Color tokens · 3. Menu Item States On The Dark Bar → 3. Menu item states on the dark bar · 3. Quick View Trigger On Product Card → 3. Quick view trigger on product card · 30. Empty, Error And Loading States → 30. Empty, error and loading states · 30b. Alerts And Messages → 30b. Alerts and messages · 31. Rich Text → 31. Rich text · 33. Sale Countdown → 33. Sale countdown · 34. Dark Panel → 34. Dark panel · 34b. Content And Voice → 34b. Content and voice · 4. Mini Cart States → 4. Mini cart states · 4. Spacing And Radius → 4. Spacing and radius · 5. Bottom Of The Screen → 5. Bottom of the screen · 5. Elevation And Layers → 5. Elevation and layers · 5. Quick View States → 5. Quick view states · 6c. Token Architecture → 6c. Token architecture · 6d. Right-To-Left → 6d. Right-to-left · 7. Header And Page Banner → 7. Header and page banner · 8. Breadcrumb And Page Title → 8. Breadcrumb and page title · Heading 2 · Choosing Your First Set → Heading 2 · Choosing your first set · Heading 3 · What To Look For → Heading 3 · What to look for · S1 · Page mặc định (templates/page.liquid): Our Story → S1 · Page mặc định (templates/page.liquid): Our story · S1. No Search Term Yet → S1. No search term yet · S2. No Results → S2. No results · S3. Filter Applied (Color: Black) → S3. Filter applied (Color: Black) · S4. Filter Drawer Open → S4. Filter drawer open · S5. Loading (Filter Or Sort Changing) → S5. Loading (filter or sort changing) · S6. Filters Return Nothing, And Update Error → S6. Filters return nothing, and update error · S8. Hover And Focus → S8. Hover and focus · State 1 · Empty Cart → State 1 · Empty cart · State 2 · Updating Quantity → State 2 · Updating quantity · State 4 · Sold-Out Line → State 4 · Sold-out line · State 5 · Line Variants → State 5 · Line variants · State 6 · Summary Variants → State 6 · Summary variants · States: Loading, Missing Image, Product Edge Cases, Empty Menu, No JavaScript → States: loading, missing image, product edge cases, empty menu, no JavaScript
