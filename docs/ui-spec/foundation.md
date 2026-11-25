KHÔNG CHẮC: giá trị 360 / 768 và các trạng thái do Designer agent đề xuất ở những vòng trước nay nằm trong mockup và là chuẩn (CTO 21/11, ES1-T567); việc còn chờ CTO ghi ở `drafts/designer/ES1-T567/notes.md`. PNG dài 12–16k px, chi tiết dưới 4px soát qua code. ES1-T291: 5 spec trỏ ở §23 (trừ countdown.md) do ticket khác tạo; mục trỏ theo tên file cố định trong ticket.

# UI spec: Foundation trang con (ES1-T251, vòng 3)

Mục đích: bộ thành phần chung cho mọi trang con và overlay (ES1-T252–T263). Nguồn chuẩn là kit và mockup (CTO 21/11, ES1-T567): `drafts/designer/_kit/kit.css` + màn `drafts/designer/ES1-T251/foundation.html` là gốc, spec này giải thích; lệch nhau thì kit và mockup thắng. Story TE-9, TE-17.

Đầu ra:
- Spec này.
- `drafts/designer/_kit/kit.css`: CSS mockup. Mockup trang con nhúng `<link rel="stylesheet" href="../_kit/kit.css">`, chỉ viết thêm CSS riêng trang.
- `drafts/designer/ES1-T251/foundation.html` + `foundation-360|768|1280|1920.png`.

Thứ tự nguồn (CTO 21/11, ES1-T567): `kit.css` → mockup `drafts/designer/**` → `docs/tokens.json`, DESIGN.md, spec này (chép theo kit) → code theme (phản chiếu `:root` của kit; lệch thì ghi "Cần FE"). Quyết định và lý do: `docs/design/decisions.md`. Chuẩn cho một giá trị: Polaris trước; điều Polaris không nêu thì ghi rõ hệ dùng thay (Carbon, M3, Fluent 2, Spectrum, Ant) hoặc "Thiết kế: …" kèm lý do (5 dạng ghi nguồn ở đầu kit.css). Trong cột Nguồn, `NN §x` là file của bộ kiến thức designer. Không dùng trang live hay ảnh chụp store làm gốc. Designer dựng lại bản vẽ từ mockup theo tài liệu handoff trong `docs/design/`.

Quy ước cho Dev FE: kit.css là nguồn chuẩn về giá trị token và hình component, nhưng là CSS mockup: không chép nguyên file vào `assets/`. Code theme viết theo AGENTS.md (logical properties, 0 màu literal, `var(--*)`, breakpoint `48rem / 64rem / 80rem`) và phản chiếu `:root` của kit. Cột "Code hiện có" chỉ class đã có trong `assets/`.

Bản design system: 2.0.0 (CTO chốt số bản 21/11 lượt 2); 2.1.0 ĐỀ XUẤT (ES1-T573, chờ CTO duyệt). Quy tắc đánh số và lịch sử: `docs/design/CHANGELOG.md`; số bản ghi ở `docs/tokens.json` `_version` và đầu màn foundation.html (§40).

## Thay đổi ES1-T573 (bản 2.1.0, minor, ĐỀ XUẤT tới khi CTO duyệt)

Chi tiết, đo đạc, bản vá cho file ngoài phạm vi Designer: `drafts/designer/ES1-T573/notes.md`.
- Token mới (20, `:root` 150 → 170): thang kích thước `--size-1000…2400` (40 / 44 / 48 / 52 / 56 / 64 / 72 / 80 / 96; §1.2), tỉ lệ `--ratio-1-1 / 2-1 / 3-2 / 4-3 / 3-4 / 16-9 / 9-16` (§36), `--display-fluid`, `--logo-width` 100 / `--logo-height` 30, `--quantity-compact-width` 130.
- Component lên kit: 7 component riêng trang chủ (§41, màn `h-level-card`, `h-stl`, `h-vcard`, `h-tcard`, `h-specs`, `h-faq-stats`, `h-quiz-opt`) và 4 mảnh nhỏ (`.icon-button` 44, `.link-button` 44, `.sheet-handle`, `.filter-toggle__count` 20 đọc `--count-badge-size`, trước 24). `.code__value` (mã giảm giá) đọc `--letter-spacing-caps` 0.04em (trước 0.06em).
- Deprecated, xoá ở 3.0.0: `--space-1…8` (mockup đọc 0 lần, 13 trang đổi sang tên chính), `--radius-hero` (chỗ đọc duy nhất đổi sang `--radius-md`).
- `aspect-ratio` trong kit và 3 trang chủ chỉ đọc `var(--ratio-*)` (trừ `auto`).

## Thay đổi ES1-T567 (CTO 21/11: mockup là nguồn chuẩn, chuẩn Polaris trước, nhãn nút sentence case)

Quyết định: `docs/design/decisions.md` mục "CTO 21/11 — ES1-T567". Chi tiết, ảnh soát, việc cho FE / QA / DevOps: `drafts/designer/ES1-T567/notes.md`. Không đổi màu, font, cỡ chữ, thang bo góc, lưới, bề rộng trang, breakpoint, chiều cao control. Các mục "Thay đổi …" bên dưới là lịch sử của những lượt trước; "bản vẽ cũ" trong đó là file thiết kế ngoài repo, không còn là nguồn.

| Mục | Trước | Sau | Chuẩn |
| --- | --- | --- | --- |
| Đầu file, §32.3 Nguồn | bản vẽ ngoài repo là gốc; token lệch thì settings → css-variables → tokens.json → kit | kit.css → mockup → tokens.json / tài liệu → code theme | CTO 21/11 |
| §1, §1.1 line-height heading | một giá trị 1.2: 48/58, 32/38 → 36/44, 28/34 | token từng bậc: h1 40/48 → 48/56, h2 32/40 → 36/44, h3 28/36, h4 20/24; display 52/60 dưới 48rem; eyebrow 14/20 → 16/20 | Polaris React line height (bội 4); M3 28/36, 32/40, 36/44 |
| §1.1 line-height thân | body 16/26, small 14/22, nút 16/26, rte 16/27.2 | body 16/24, small 14/20, nút 16/24 (small 14/20), rte 16/28, giá 16/24 · 20/28 · 28/36 | Carbon body-02, M3 Body L; Polaris React body 14/20, 13/20 |
| §1.2 thang khoảng cách | `--space-4xl` 56; 48 không tên; 12 bậc | `--space-4xl` 48 (`--space-7` là alias); thêm `--space-050` 2, `--space-150` 6; 14 bậc; section dưới 64rem 48 | Polaris web spacing small-500…large-500 |
| §1.2 giá trị ngoài thang | 3 bước, có bước giữ số lẻ kèm mã tham chiếu bản vẽ | 2 bước: về bậc gần nhất → từ 3 component thì đề xuất bậc | Carbon: lệch thang nên tránh |
| §1, §2 dải rộng | lùi tối đa 60 (1798 ở 1920) | lùi tối đa 64 (1792 ở 1920) | Polaris React space 64px |
| §1, §2 token kích thước | 44, 52, 40, 4, 8 viết số | `--row-height`, `--round-button-size`, `--tab-height-desktop`, `--count-badge-size`, `--progress-height`, `--meter-height`; `--control-height` 48 khai báo trực tiếp | Polaris: space token không dùng cho width / height |
| §4 Footer | ảnh 98 × 123, lớp sau 78, lệch 15; logo 86 × 26; cờ 26; đệm 45 / 46 / 14; mô tả 16/27 | ảnh 96 × 120, lớp sau 80, lệch 16; logo 80 × 24; cờ 24; đệm 48 / 16; mô tả 16/28 | Lưới 4px của Polaris |
| §6 Nút, §30, §38 | nhãn Title Case (ngoại lệ thương hiệu) | sentence case, mở bằng động từ, không mạo từ, không dấu câu | Polaris Button |
| §7 Tab | padding ngang 28 | 24 (`--tab-padding-inline` = `--space-xl`) | Polaris large-200 |
| §8, §10 tag bài viết | nền accent, chữ trắng | nền trắng, viền border, chữ foreground (17.4) | Polaris Badge: màu chỉ trạng thái, không phân danh mục |
| §17 Toast | tiêu đề sentence case là đề xuất; đệm dọc 10 | đã chốt sentence case; đệm 12 + dòng 20 = 44 | Polaris toast; Fluent 2 (≤ 60 ký tự) |
| §28 `.rte` | 16 / 1.7 | 16 / 1.75 (`--line-height-reading`) | Polaris React line height 28 |
| §32 Kiến trúc token | 134 token; component 1 | 150 token; typography 34, space 14 + 8, component 7 | — |
| §32.4 biến cũ | in tên biến theo tiền tố cũ | ghi theo giá trị + số lần + file; tên đầy đủ ở notes ES1-T567 | Polaris: tên theo vai trò |
| §36 Media | tỉ lệ theo px của khung (1798/827, 336/220, 300/448, 165/94) | bộ tỉ lệ có tên: 1/1, 2/1, 3/2, 4/3, 16/9, 9/16, 3/4 | Carbon aspect ratio; M3; Spectrum |
| §40 | 1.3.0 | 2.0.0 (đề xuất) | — |

### Lượt 2 (CTO 21/11, ES1-T567)

Quyết định: `docs/design/decisions.md` mục "CTO 21/11 lượt 2 — ES1-T567". Các dòng ở bảng trên ghi "không đổi chiều cao control" và 120 là của lượt 1.

| Mục | Trước | Sau | Chuẩn |
| --- | --- | --- | --- |
| §1, §1.2, §6, §12 chiều cao control | 48 dưới 80rem, 52 từ 80rem | 48 ở mọi mốc (`--control-height`); nút tròn 52 và hàng 52 giữ | Carbon button 48 |
| §1, §1.2 padding section từ 64rem | 120 (`--space-7xl`) | 128; đỉnh panel footer từ 80rem theo cùng token | Polaris React space 128px |
| §6, §7, §13–§16, §18, §30, §38 chữ heading, tiêu đề dialog / drawer, empty state, tab, link menu | Title Case | sentence case; tên sản phẩm, collection, bài viết theo dữ liệu; tên riêng, viết tắt giữ | CTO 21/11 lượt 2; M3, Ant, Fluent 2, Spectrum |
| §18.1 ngưỡng chỉ báo tải | 300 ms (đề xuất) | 500 ms (chốt) | Polaris |
| §8 badge giảm giá | "-24%" (dấu nối) | "−24%" (dấu trừ U+2212) | CTO 21/11 lượt 2 |
| Nút popover big offer | "Shop the offer" | "View offer" | Polaris Button: không mạo từ |
| Eyebrow accent, hover và nhãn card, hình Tab / Chip, tiêu đề HOA popup marketing, nhãn nhóm HOA | giữ, lý do gốc là bản vẽ (chờ CTO) | giữ, ghi là bản sắc thương hiệu | CTO 21/11 lượt 2 |
| §40 | 2.0.0 (đề xuất) | 2.0.0 (chốt số bản) | — |

## Thay đổi rà soát Polaris-first, lượt 2 (ES1-T535, CTO 21/11: hoàn thiện 19 phát hiện "Lệch chuẩn" và "Còn thiếu")

Quyết định từng mục: `docs/design/decisions.md` mục "CTO 21/11 — ES1-T535", phần "Lượt 2". Không thêm giá trị màu, không thêm font, không đổi hình Tab và Chip, không thêm bậc bóng. Token mới ở `:root` của kit: `--icon-size-sm/md/lg`, `--icon-stroke-width`, `--tab-padding-inline`.

| Mã | Mục | Trước | Sau |
| --- | --- | --- | --- |
| foundations-06 | §32 mới, §2 | chỉ cấm biến tiền tố cũ đặt theo giá trị cho thành phần mới, 3 dòng tương đương | 3 tầng primitive → semantic → component; bảng 24 biến biến tiền tố cũ đặt theo giá trị đang dùng → token vai trò; màn `h-token-architecture` |
| foundations-08 | §1.2 | hai hệ tên song song | một hệ tên `--space-2xs…7xl`; bảng tên cũ → mới; quy tắc giá trị ngoài thang |
| foundations-09 | §1.2 | thang radius không có quy tắc lồng, không bảng quy đổi | quy tắc con nhỏ hơn cha; bảng radius lẻ trong code → bậc thang |
| foundations-10 | §31, §3.2, §6 | 3 bóng tự viết, 7 z-index số trong kit | kit chỉ còn `--shadow-*`, `--layer-*`; bảng component → bóng → lớp; bảng bóng viết tay → token |
| foundations-14 (= components-13) | §33 mới | cỡ icon ghi rải theo component | khung 20, vùng an toàn 16, nét 1.5, 3 cỡ có token, icon dành riêng, tên truy cập, lật RTL; màn `h-icon` |
| foundations-16 (= patterns-10) | §32.2, §32.3 | 4 nơi giữ token lệch nhau | bảng nhóm token + số đếm, thứ tự nguồn sự thật, tokens.json thêm nhóm thiếu |
| foundations-17 | §34 mới, §15 | drawer "trái / phải"; không điều kiện bật RTL | inline-start / inline-end; bảng lật / giữ; 6 điều kiện bật; màn `h-rtl` |
| components-09 | §7, §30.1 | Tab nằm trong màn Button, không bảng phân vai | màn `h-tabs` riêng; bảng phân vai Tab / Chip / Button tertiary; dấu hiệu phân biệt tertiary small |
| components-10 | §12 | submit lỗi: focus trường lỗi đầu | focus khối tóm tắt có link tới từng trường; bảng 5 tình huống |
| components-14 (= patterns-09) | §18.1 mới | ngưỡng 300 ms rải ở spec trang | một ngưỡng chung, bảng 5 vùng |
| components-15 | §35 mới, §18 | `.alert` chỉ có kiểu lỗi | 4 tone × 2 cấp (trang, section), nút đóng 44; bảng chọn Banner / Inline / Toast; màn `h-alert` |
| components-16 | §30.11 | bảng chỉ cuộn ngang ở mobile | `.data-table--stack` dạng danh sách dưới 48rem; số cột tối đa theo loại bảng |
| components-17 | §36 mới | quy tắc ảnh rải ở DESIGN.md và card | `.media`, `.thumb` 4 cỡ có tên, bảng tỉ lệ; màn `h-media` |
| patterns-08 | `docs/design/content.md` mới | quy tắc chữ rải | hướng dẫn nội dung riêng; màn `h-content` |
| patterns-11 | `CONTRIBUTING.md` | chỉ có phần Skeleton Theme | thêm mục "Changing the design system" |
| patterns-12 | §38 mới | component thiếu "Dùng khi nào", "Nên / Tránh" | khuôn 6 mục + bảng cho từng component |
| patterns-13 | §39 mới, §21 | không nhãn trạng thái | 4 trạng thái vòng đời, bảng theo màn DS, nhãn trên màn |
| patterns-14 | §40 mới, `docs/design/CHANGELOG.md` mới | không số bản | major.minor.patch, bản hiện tại 1.3.0 (đề xuất) |
| patterns-17 | §37 mới | giới hạn chữ chỉ theo tiếng Anh | quy tắc chuỗi dịch dài theo component, cấm ghép chuỗi |

## Thay đổi rà soát Polaris-first (ES1-T535, CTO 21/11, báo cáo `ai-team/data/design-audit/efitco-ds-polaris-2026-11-21.md`)

Quyết định từng mục: `docs/design/decisions.md` mục "CTO 21/11 — ES1-T535 (rà soát chuẩn Polaris-first)". Không thêm giá trị màu, không đổi thang chữ.

| Mã | Mục | Trước | Sau |
| --- | --- | --- | --- |
| foundations-07 | §2.1, §12, §17, §18 | thông báo mượn `--color-badge-new`, `--color-sale`, `--color-accent` | 3 role trạng thái là alias: `--color-success`, `--color-critical`, `--color-warning` (+ `-foreground`); thông báo đọc alias |
| foundations-11 | §19 | ghi 5 duration + 3 easing; kit viết tay 700ms, 1.4s | đủ 8 duration + vai trò 3 easing; spinner = `--motion-hero`, shimmer = `--motion-hero`; ngoại lệ reveal 900, hero 1400 |
| foundations-12 | §6, §30.6, pagination.md | nút tròn đầu / cuối mờ 0.35; ô màu lọc disabled mờ 0.4 | không opacity: nút tròn viền border + icon muted-light; ô màu lọc gạch chéo, nhãn muted-light |
| foundations-13 | §1, §1.3, §14 | sàn 24 từ 1280 ("icon, nav 44"); link mega 40 | `--touch-target` 44 mọi mốc cho 6 nhóm; link mega 44; bảng 6 nhóm × 4 mốc |
| foundations-15 | §2.2 | nền tối mô tả rời (`.on-dark`, `.dpanel`) | ma trận 6 scheme × 6 role kèm tương phản (chỉ tài liệu) |
| foundations-18 | §1.1 | — | ngoại lệ line-height không theo bội 4 |
| components-06 | §17, §18 | toast error / warning không giới hạn tình huống; tiêu đề không giới hạn | quy tắc chọn mẫu thông báo; tiêu đề toast success ≤ 3 từ, ≤ 24 ký tự |
| components-07 | §16 | — | ngoại lệ popup marketing tự mở |
| components-11 | §6 | — | ngoại lệ Title Case |
| components-12 | §8 | — | ngoại lệ accent cho tag bài viết |
| Mockup | foundation.html | ảnh cắt theo section chạm mép, vòng focus ở mép bị cắt | section trong `.container` có lề `--page-margin` hai bên (kit `.container > .demo-block`) |

Ghi chú cho các bảng lịch sử bên dưới (ES1-T527 trở về trước): cột Nguồn ghi "bản vẽ cũ" là lý do của thời điểm đó, không cần tra lại bản vẽ; giá trị hiện hành đọc ở `kit.css` và mockup.

## Thay đổi DS check (ES1-T527, báo cáo 20/11 `ai-team/data/design-audit/efitco-ds-check-2026-11-20.md`)

Nguồn chuẩn token của lượt đó: bản vẽ cũ (từ ES1-T567 không còn là nguồn) trừ ngoại lệ ở sổ quyết định (accent #C8400E, muted-light #6B6B6B). Quyết định từng mục: `docs/design/decisions.md` mục "CTO 20/11 — ES1-T527 (DS check)".

| Mã | Mục | Trước | Sau |
| --- | --- | --- | --- |
| V01 | §2 badge_new | settings #467A48, kit #4B824D, `--panel-saving` tính theo #467A48 (5.64) | #4B824D mọi nguồn; `--panel-saving` #A5C0A6 5.82 (settings_schema: việc FE) |
| V02 | §1.1 thang chữ | mobile display 48, h1 33, h2 28, h3 22; không h4; lh heading 1.1 | theo bộ text style của bản vẽ cũ: display 52→100, h1 40→48, h2 32→36, h3 28, h4 20 (mới), eyebrow 14→16; lh 1.2 |
| V03 | §2 background_dark | tokens.json, DESIGN #1E1E1E 5.85 | #1A1A1A, muted-on-dark 6.11 |
| V04 | §1.2 bo góc | card 8 trong tokens.json; 16 = calc; dialog 24 | thang xs 4 / sm 8 / md 12 / lg 16 / xl 20 / pill; vai trò `--radius-panel` 16, `--radius-dialog` 20 |
| V05 | §1.1 body | Inter 400 16/24 | Inter 500 16/26 −1%; body small 500 14/22; label 600 13/20; ô nhập giữ 16/400 |
| V06 | §1, §1.2 | 8 bậc, không 20/40/56/64; gutter 16/24; section mobile 48; thanh carousel 2 | tên 2xs…7xl (thang của bản vẽ cũ + 80, 120); gutter 12/16/24; section 56/120; carousel 4; meter 8 |
| V07 | DESIGN.md | lỗi thời (header đè hero, nút 44, focus currentColor, 19 màu) | đồng bộ, trỏ về file này |
| V08, V14, V23, V26, V38–V41, V46, V48, V55 | §30 | chưa có màn DS | thêm component + màn DS ở foundation.html |
| V09–V12 | §6, §12, §9, §10, §13 | thiếu active/loading/focus, ô form cao không đều | ma trận trạng thái có nhãn; ô cao cố định, lưới căn đỉnh |
| V13 | §15 | chân cart drawer trắng | panel tối nổi `.overlay__footer--panel` (G3) |
| V15 | §31 | không màn elevation/layer | `--shadow-*`, `--layer-*` vào kit + màn DS |
| V16 | foundation.html | không do/don't | khối Nên / Không nên + setting id dưới mỗi component |
| V17 | §2 | accent_on_sand literal #000, chưa đăng ký | dẫn xuất `color-mix(accent 90%, foreground)` #B73C0F 4.62, ghi tokens.json |
| V18 | §2 | alt #F4F4F4; màu chỉ có ở bản vẽ cũ | alt #F4F4F5; #142521, #CEC2BD, #666666, #CCCCCC không thành token |
| V20 | §5 | breadcrumb xuống 2 dòng | 1 dòng, mục cuối co + "…", < 48rem mục giữa cắt 10ch |
| V21, V40 | §6, §12 | control 40/44 tự chế | `--control-height-compact` 44, `.button--small`, `.field__input--compact` |
| V22 | §9 | swatch card viền accent, "5 colors" | swatch không trạng thái chọn; > 4 màu = 3 + "+N" |
| V37, V53, V54, V57 | kit | accordion cam; `.rte`, pagination, chip, empty-state, search field chép ở trang | sửa trong kit, gom vào kit mục 13b; trang không định nghĩa lại |

## Thay đổi audit (ES1-T291, audit ES1-T283 A11, A13, A14, A23, A24, A28)

| # | Mục | Trước | Sau | Nguồn |
| --- | --- | --- | --- | --- |
| 1 | §2 Panel tối | mỗi spec tự chọn màu chữ phụ / giảm giá trên `--color-background-panel`: cart, mini cart trắng 70% + badge-new 50%; bundle #B2B2B2 + badge-new 55%; shop the look trắng 60% + chữ trắng | 1 cặp dẫn xuất chung `--panel-muted` (trắng 70%, 6.56) và `--panel-saving` (badge-new 50% + trắng, 5.64), áp mọi panel tối | A13; sổ 10/11 G3 (cart.md §3) |
| 2 | §4 Footer | ghi chú "icon social #B2B2B2 → muted-on-dark (P4)"; mockup Information thiếu "Our Efitco" | icon social `--color-muted-on-dark` là quy định (kit đã đúng); Information: Our Story, Our Efitco, FAQs, Contact Us (+ 2 link chính sách) | A28; bản vẽ cũ, index-mobile-b §8 |
| 3 | §6 Nút | Title Case chỉ nêu "Add To Cart" | mọi nút và link dạng nút Title Case, liệt kê nhãn lệch đang có ("Keep shopping", "Show fewer", "Try again") | A24; sổ 07/11 |
| 4 | §13 Accordion | "+ cam 24" | icon +/− cùng màu chữ câu hỏi (đóng `--color-muted`, mở `--color-foreground`), không cam | A11; bản vẽ cũ, index-mobile-b §7 |
| 5 | §16 Dialog | "1 lần/phiên" | hàng đợi: mỗi lúc 1 popup, đóng popup đang hiện mới tới popup kế, nghỉ 3 s; mỗi popup tự mở tối đa 1 lần/phiên | A11; sổ 10/11 MK3, MK4 |
| 6 | §20 Lighthouse | "SEO 100 bắt buộc ở trang index" | SEO 100 đo ở 6 loại trang (chủ, collection, sản phẩm, blog, bài viết, page); BP 100 do DevOps/QA đo | A11; sổ 10/11 (BGĐ) |
| 7 | §22 | "Quyết định CTO cần chốt" 3 câu | "đã chốt (10/11)" theo đề xuất | sổ 10/11 "các câu khác vòng 3 chốt theo đề xuất" |
| 8 | §23 mới | — | mục lục thành phần dùng chung ở spec riêng: variant-picker, pagination, layers, countdown, announcement-bar, localization | ticket ES1-T291 |
| 9 | §24 mới | 2 setting "Popular searches" (header 5 cụm; search-results tối đa 6, chữ khác) | 1 theme setting chung, 1 bộ chữ mặc định, tối đa 5 cụm | A23; 05 §4 |
| 10 | Mockup | — | foundation.html: accordion theo bản vẽ cũ, "Our Efitco", mục 16 Sale Countdown, mục 17 Dark Panel; render lại 4 PNG | ticket ES1-T291 |

Giữ nguyên mọi mục khác của vòng 3.

## Thay đổi so với vòng 2

| # | Thành phần | Vòng 2 | Vòng 3 | Nguồn |
| --- | --- | --- | --- | --- |
| 1 | Header | 3 biến thể: A nền trắng viền dưới, B trong suốt đè ảnh, C đã cuộn | 1 biến thể mọi trang: thanh tối `--color-background-dark` + noise, cao 80, không đè ảnh; cuộn chỉ thêm bóng | Sổ 10/11, bản vẽ cũ |
| 2 | Logo header | 100 mobile, 140 desktop | 100 × 30 mọi mốc | bản vẽ cũ |
| 3 | Menu header | chữ foreground, gap 56, gạch chân khi hover | trắng 60% (6.93:1), gap 40, hover/đang mở trắng 100%, trang hiện tại thêm gạch chân 2px | bản vẽ cũ |
| 4 | Icon header | 3 icon 24 | search 20, account/cart 24, ô bấm 44 cách 4 (nhìn cách 24 như bản vẽ cũ); số giỏ trắng chữ tối | bản vẽ cũ |
| 5 | Trang có ảnh lớn đầu trang | header đè ảnh | banner bo góc nằm dưới header, trong container, lớp tối ≥ 60% | Sổ 10/11; ĐỀ XUẤT §3.3 |
| 6 | Nút tròn 52 | icon mũi tên 20 × 16 | chevron 11 × 16 trong khung 52 (đúng icon slideshow) | bản vẽ cũ, `snippets/slideshow-icon` |
| 7 | Eyebrow nền tối | cam | xám `--color-muted-on-dark` (6.11:1); cam chỉ trên nền sáng, sand | Sổ 10/11 |
| 8 | `--color-background-dark` trong kit | #1E1E1E | #1A1A1A (mặc định `settings_schema`, = bản vẽ cũ); mọi tỉ lệ trên nền tối tính lại | `config/settings_schema.json` |
| 9 | Footer | panel trong container, bo 24, nền +4% trắng; 3 social; wordmark tách hàng | panel dải rộng (lùi tối đa 60, 1798 ở 1920), bo 16, nền +2% trắng; nền footer có noise; 4 social (TikTok, Instagram, YouTube, Facebook); tiêu đề menu Inter 700/18; link cách 16; wordmark nằm giữa hàng cuối cùng copyright và localization | bản vẽ cũ |
| 10 | Viền input | ĐỀ XUẤT | đã chốt: nền sáng `--color-muted-light`, nền tối 100% `--color-muted-on-dark` | Sổ 09/11 |
| 11 | Toast | ĐỀ XUẤT màu | đã chốt: warning accent, success badge-new | Sổ 09/11 |
| 12 | Card sản phẩm | swatch cách 12, radio bấm được | swatch 32 × 16 cách 4, cách giá 8; là chỉ báo (`aria-hidden`), số màu đọc trong tên link | bản vẽ cũ; ĐỀ XUẤT §9 |
| 13 | Dropdown, mega menu | mở từ 64rem, header chuyển trắng khi mở | chỉ từ 80rem (menu ngang chỉ có từ 80rem); header vẫn tối, panel trắng ngay dưới | Sổ 10/11, `critical.css` |
| 14 | Mốc 1920 | có số | thêm cột dải rộng, footer, header theo bản vẽ cũ | Ticket vòng 3 |

---

## 1. Lưới, khoảng cách, chữ theo mốc

Mobile-first. Mốc 360 / 768 / 1280 / 1920 ứng với code `< 48rem`, `48rem`, `80rem`, `80rem` (+ page-width chặn 1456). `64rem` (1024) đổi khoảng cách section và bố cục footer. Breakpoint là quy ước code theme (AGENTS.md); Polaris web không nêu breakpoint có tên, 768 trùng mốc md của Polaris React.

| Giá trị | 360 | 768 | 1280 | 1920 | Token / cách tính | Nguồn |
| --- | --- | --- | --- | --- | --- | --- |
| Lề trang | 20 | 20 | 20 | 252 (do page-width) | `--page-margin` | Chuẩn: Polaris large-100 |
| Bề rộng nội dung | 320 | 728 | 1240 | 1416 | `min(--page-width − 2×margin, 100% − 2×margin)` | Thiết kế: Polaris không nêu container storefront; gần mốc xl 1440 của Polaris React |
| Dải rộng (hero trang chủ, panel footer) | 360 (tràn) | 768 (tràn) | 1280 (tràn) | 1792 (lùi 64) | `--band-inset = max(0, min(64, side − 64))` | Chuẩn: Polaris React space 64px |
| Cột / gutter | 4 / 12 | 8 / 16 | 12 / 24 | 12 / 24 | `--grid-columns`; `--grid-gap` = `--space-sm` → `--space-md` từ 48rem → `--space-xl` từ 80rem | Chuẩn: Fluent 2 layout (12 cột, gutter đổi theo breakpoint); M3 margin 16 / 24. Trên thang 4px |
| Lưới sản phẩm | 2 × 154 | 3 × 232 | 4 × 292 | 4 × 336 | gap ngang = gutter, gap dọc 24 → 40 | Như trên |
| Card bài viết (hàng ngang) | 252 × 336 | 307 × 410 | 336 × 448 | 336 × 448 | `min(70vw, 21rem)` / `min(40vw, 21rem)`, 3/4 | Chuẩn: Spectrum 3:4 |
| Khoảng giữa section | 48 | 48 | 128 | 128 | `--section-gap` = `--space-4xl` < 64rem, `--space-7xl` | Chuẩn: Polaris large-500 (48); Polaris React space 128px (CTO 21/11 lượt 2, trước là 120) |
| Tiêu đề section → nội dung | 24 | 24 | 40 | 40 | `--heading-gap` = `--space-xl`; `--space-3xl` từ 80rem | Chuẩn: Polaris large-200, large-400 |
| Eyebrow → tiêu đề | 12 | 12 | 12 | 12 | `--space-sm` | Chuẩn: Polaris small-100 |
| Header | 80 | 80 | 80 | 80 | `--header-height` | CTO 10/11 |
| Control (nút, input) / compact | 48 / 44 | 48 / 44 | 48 / 44 | 48 / 44 | `--control-height`, `--control-height-compact` | Chuẩn: Carbon button 48; Polaris touch target 44 (sàn). 48 mọi mốc (CTO 21/11 lượt 2: bỏ mức 52 từ 80rem) |
| Tab, chip | 44 | 44 | 40 | 40 | `--control-height-compact`; `--tab-height-desktop` từ 80rem | Chuẩn: Carbon button 40 |
| Hàng danh sách · nút tròn | 52 · 52 | 52 · 52 | 52 · 52 | 52 · 52 | `--row-height` · `--round-button-size` | Thiết kế: 44 + đệm 4 trên dưới · CTO 09/11 |
| Vùng chạm, sàn mọi control | 44 | ≥ 24 | ≥ 24 | ≥ 24 | dưới 48rem `--touch-target` 44; từ 48rem `--touch-target-min` 24 (riêng `.form-message__list a`: 44 dưới 80rem). Sổ 09/11: ≥ 24, mobile ≥ 44 | AGENTS, 14 §2 |
| Vùng chạm, 6 nhóm chính (§1.3) | 44 | 44 | 44 | 44 | `--touch-target` 44 | Chuẩn: Polaris touch target 44 × 44; sổ 21/11 (foundations-13) |
| display | 52/60 | 73 | 100/100 | 100/100 | `--font-size-display`, `--line-height-display` 1.1538 → 1 từ 48rem | Thiết kế: kiểu chữ thương hiệu |
| h1 | 40/48 | 44 | 48/56 | 48/56 | `--font-size-h1`, `--line-height-h1` | 40/48 Chuẩn: Polaris React font 40, line height 48 · 48/56 Thiết kế (Polaris không nêu dòng 56); cỡ 48 có ở Carbon |
| h2 | 32/40 | 34 | 36/44 | 36/44 | `--font-size-h2`, `--line-height-h2` | Chuẩn: M3 Headline L, Display S |
| h3 | 28/36 | 28/36 | 28/36 | 28/36 | `--font-size-h3`, `--line-height-h3` | Chuẩn: M3 Headline M, Carbon heading-04 |
| h4 | 20/24 | 20/24 | 20/24 | 20/24 | `--font-size-h4`, `--line-height-h4` | Chuẩn: Polaris React heading 20/24 |
| eyebrow | 14/20 | 15 | 16/20 | 16/20 | `--font-size-eyebrow`, `--line-height-eyebrow` | Thiết kế: kiểu chữ thương hiệu; dòng 20 |
| Body / nhỏ / label | 16/24 / 14/20 / 13/20 | như 360 | như 360 | như 360 | `--font-size-base / sm / xs`, `--line-height-body / sm / label`, body 500 | Chuẩn: Carbon body-02, M3 Body L; Polaris React body 14/20, 13/20 |

Quy tắc: thứ tự nội dung giữ nguyên giữa mốc (06 §2); đoạn dài `max-inline-size: 65ch` (06 §7.3); zoom 200% không tràn ngang, hàng cuộn ngang có `overflow-x` riêng (14 #1096M).

### 1.1 Thang chữ (12 kiểu; cỡ theo sổ 20/11 V02, V05; line-height theo sổ 21/11 ES1-T567)

Polaris không nêu thang px cho storefront: cỡ lấy trong các bậc có ở Polaris React font (13, 14, 16, 18, 20, 32, 36, 40), M3 (28, 32, 36) và Carbon (28, 32, 36, 48). Mỗi bậc cỡ chữ có token line-height riêng (số không đơn vị); dòng rơi bội 4px ở hai đầu 360 và 1280 (Polaris React line height 16, 20, 24, 28, 32, 40, 48). Số ghi cỡ / dòng (px).

| Kiểu | Token / class | 360 | 1280+ | Font | Line-height token | Nguồn |
| --- | --- | --- | --- | --- | --- | --- |
| Display | `--font-size-display`, `.display` | 52/60 −3% | 100/100 −4% (từ 48rem) | Sofia 800 UPPER | `--line-height-display` 1.1538 → 1 từ 48rem | Thiết kế: kiểu chữ thương hiệu; từ 48rem display một khối, ở 768 dòng không rơi bội 4 |
| h1 | `--font-size-h1`, `h1`, `.h1` | 40/48 | 48/56 | Sofia 700 −2% | `--line-height-h1` 1.2 → 1.1667 từ 80rem | 40/48 Chuẩn: Polaris React font 40, line height 48 · 48/56 Thiết kế: giữ tỉ lệ, trên bội 4 (Polaris không nêu dòng 56); cỡ 48 có ở Carbon |
| h2 | `--font-size-h2`, `.h2` | 32/40 | 36/44 | Sofia 700 −2% | `--line-height-h2` 1.25 → 1.2222 từ 80rem | Chuẩn: M3 Headline L 32/40, Display S 36/44 |
| h3 | `--font-size-h3`, `.h3` | 28/36 | 28/36 | Sofia 700 −2% | `--line-height-h3` 1.2857 | Chuẩn: M3 Headline M 28/36, Carbon heading-04 28/36 |
| h4 | `--font-size-h4`, `.h4` | 20/24 | 20/24 | Sofia 700 −2% | `--line-height-h4` 1.2 | Chuẩn: Polaris React heading 20/24 |
| Eyebrow | `--font-size-eyebrow`, `.eyebrow` | 14/20 | 16/20 | Sofia 800 UPPER +4% | `--line-height-eyebrow` 1.25rem (dòng cố định 20) | Thiết kế: kiểu chữ thương hiệu; dòng cố định 20 vì cỡ nội suy (20 có ở Polaris React line height) |
| Title | `.text-title` | 18/28 | 18/28 | Inter 700 −1% | `--line-height-title` 1.5556 | Chuẩn: Polaris React font 18, line height 28 |
| Body | `body` | 16/24 | 16/24 | Inter 500 −1% | `--line-height-body` 1.5 | Chuẩn: Carbon body-02 16/24, M3 Body L 16/24 |
| Body small | `.text-small` | 14/20 | 14/20 | Inter 500 | `--line-height-sm` 1.4286 | Chuẩn: Polaris React body 14/20 |
| Form | `.field__input` (giá trị 16 để iOS không phóng to), hint 14/20 | 14/20 | 14/20 | Inter 400 | `--line-height-sm` | Chuẩn: Polaris React body 14/20 |
| Label | `.text-label`, badge | 13/20 | 13/20 | Inter 600 −2% | `--line-height-label` 1.5385, `--letter-spacing-label` | Chuẩn: Polaris React body 13/20 |
| Button | `.button` (small 14/20) | 16/24 | 16/24 | Inter 600 −1%, sentence case | `--line-height-body` | Chuẩn: Polaris Button (nhãn); Carbon body-02 |
| Group label | `.group-label` (nhãn nhóm overlay, V76) | 14/20 | 14/20 | Inter 600 UPPER +4% muted | `--line-height-sm` | Sổ 20/11 V76 |

Ngoài 12 kiểu:
- Văn bản dài (`.rte`, mô tả footer): 16/28, `--line-height-reading` 1.75 (Polaris React line height 28).
- Giá: `.price` 16/24 500; `.price--lg` 20/28 700 (`--line-height-price-lg` 1.4; Chuẩn: Carbon heading-03 20/28); `.price--xl` 28/36 Inter 600 (`--line-height-h3`). `font-variant-numeric: tabular-nums` cho giá, dòng tổng, stepper, số trang, số đếm giỏ (Polaris: tabular numbers cho tiền và số trong bảng; số quảng bá cỡ lớn không cần).
- Wordmark footer `--font-size-wordmark` 64 → 200: Thiết kế: tài sản thương hiệu, không tính vào 12 kiểu.

Giữa 360 và 1280 cỡ heading nội suy bằng `clamp()`; h1, h2 đổi tỉ lệ line-height ở 80rem: hai đầu 360 và 1280 đúng bội 4, giữa hai mốc h1 lệch tối đa 1.6px, h2 1px; eyebrow dòng cố định 20. HD1 (sổ 11/11, display hero `min(display, 6.25vw)` từ 80rem) là luật trang chủ, không đổi token.

Line-height (sổ 21/11, ES1-T567; THAY ngoại lệ foundations-18): không còn `--line-height-heading` 1.2 dùng chung (tên này đã xoá khỏi kit, không trang nào còn đọc). Eyebrow dùng dòng cố định 20 (`1.25rem`) vì cỡ nội suy 14 → 16; h1, h2 đổi tỉ lệ ở 80rem, giữa hai mốc h1 lệch lưới tối đa 1.6px, h2 1px. Không viết line-height bằng số trong component hay trang, trừ `1` cho icon, số một dòng và nút có thương hiệu. Giãn chữ: thân −1%, nhãn −2%, heading −2%, display −3% / −4%, chữ HOA +4% (Thiết kế: kiểu chữ thương hiệu; Polaris không nêu cho storefront). Thân chữ 500: bản sắc thương hiệu (sổ 20/11 V05; CTO 21/11 lượt 2 giữ). Màn mẫu: `h-type`.

### 1.2 Khoảng cách và bo góc (V04, V06; ES1-T567)

Khoảng cách, lưới 4px: `--space-050` 2, `2xs` 4, `150` 6, `xs` 8, `sm` 12, `md` 16, `lg` 20, `xl` 24, `2xl` 32, `3xl` 40, `4xl` 48, `5xl` 64, `6xl` 80, `7xl` 128. Chuẩn: Polaris web spacing 2 / 4 / 6 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 (`small-500` … `large-500`); 64, 80 và 128 có trong Polaris React space; 128 là padding section desktop (CTO 21/11 lượt 2, trước là 120).

Một hệ tên (sổ 20/11 V06, sổ 21/11 foundations-08; màn `h-spacing-radius`): tên chính là `--space-050…7xl`. Kit và mọi thành phần mới CHỈ đọc tên này cho padding, gap, margin. `--space-1…8` và `calc(var(--space-1) * N)` là tên cũ, chỉ còn trong code theme (setting `space_base` × hệ số); trong kit chúng là alias trỏ về tên chính, DEPRECATED từ 2.1.0 (ES1-T573), xoá ở 3.0.0. Mockup đọc 0 lần (grep `var(--space-[1-8])` trong `drafts/designer/**/*.html` = 0; trước ES1-T573: 383 lần ở 13 trang).

| Tên chính | px | Tên cũ trong code theme | Nguồn / ghi chú |
| --- | --- | --- | --- |
| `--space-050` | 2 | — | Chuẩn: Polaris small-500. Bậc nửa bước, chỉ cho gap icon / nudge. Cần FE thêm |
| `--space-2xs` | 4 | `--space-1` | Chuẩn: Polaris small-400 |
| `--space-150` | 6 | — | Chuẩn: Polaris small-300. Bậc nửa bước, chỉ cho gap icon / nudge. Cần FE thêm |
| `--space-xs` | 8 | `--space-2` | Chuẩn: Polaris small-200 |
| `--space-sm` | 12 | `--space-3` | Chuẩn: Polaris small-100 |
| `--space-md` | 16 | `--space-4` | Chuẩn: Polaris base |
| `--space-lg` | 20 | `calc(var(--space-1) * 5)` | Chuẩn: Polaris large-100. Cần FE thêm bậc vào `css-variables.liquid` |
| `--space-xl` | 24 | `--space-5` | Chuẩn: Polaris large-200 |
| `--space-2xl` | 32 | `--space-6` | Chuẩn: Polaris large-300 |
| `--space-3xl` | 40 | `calc(var(--space-1) * 10)` | Chuẩn: Polaris large-400. Cần FE thêm bậc |
| `--space-4xl` | 48 | `--space-7` | Chuẩn: Polaris large-500. THAY 21/11 (ES1-T567): trước là 56, ngoài thang; `--space-7` giờ là alias của bậc này |
| `--space-5xl` | 64 | `calc(var(--space-1) * 16)` | Chuẩn: Polaris React space 64px. Cần FE thêm bậc |
| `--space-6xl` | 80 | `calc(var(--space-1) * 20)` | Chuẩn: Polaris React space 80px. Cần FE thêm bậc; tầng desktop |
| `--space-7xl` | 128 | `--space-8` | Padding section từ 64rem. Chuẩn: Polaris React space 128px. THAY 21/11 lượt 2 (ES1-T567): trước là 120, ngoài thang. Cần FE: code đang `--space-1` × 30 = 120, đổi × 32 |

`calc(var(--space-1) * N)` trong code theme (đếm trên `origin/develop`: `assets/base.css` 177 dòng; cả `assets/*.css` 233 dòng). Hệ số hay gặp và cách quy:

| Hệ số | px | Số lần (assets/*.css) | Dùng |
| --- | --- | --- | --- |
| 5 · 10 · 16 · 20 | 20 · 40 · 64 · 80 | 36 · 40 · 17 · 11 | `--space-lg` · `--space-3xl` · `--space-5xl` · `--space-6xl` |
| 14 | 56 | 3 | Ngoài thang từ ES1-T567: `--space-4xl` (48); padding section dưới 64rem = 48 |
| 12 | 48 | 11 | Khoảng cách: `--space-4xl`. Chiều cao control: `--control-height` (kích thước) |
| 11 | 44 | 25 | Kích thước: `--touch-target` (vùng chạm) hoặc `--control-height-compact` |
| 13 | 52 | 18 | Kích thước: `--row-height`, `--round-button-size`. Chỗ dùng làm `--control-height` từ 80rem: bỏ, control 48 mọi mốc (CTO 21/11 lượt 2) |
| 7 · 15 · 18 | 28 · 60 · 72 | 11 · 5 · 8 | 28 → `--space-xl` hoặc `--space-2xl`; 60 → `--space-5xl`; nhãn đếm 28, vòng tròn 72 là kích thước component |
| còn lại (2.5, 9, 22, 24, 28, 30, 36…) | — | mỗi hệ số 1–3 | Từng chỗ: quy về bậc gần nhất |

Giá trị ngoài thang: không viết `calc()` hay px lẻ trong component. Thứ tự xử lý:
1. Quy về bậc gần nhất (Chuẩn: Carbon, lệch thang "should be avoided whenever possible"). Đã quy ở ES1-T567: padding ngang tab 28 → 24, đệm toast 10 → 12, lề ảnh footer 15 → 16, đáy dải footer 46 → 48, đỉnh footer 45 → 48, newsletter 14 → 16, dải rộng lùi 60 → 64.
2. Giá trị dùng từ 3 component trở lên mà chưa có bậc: đề xuất thêm bậc, CTO chốt.

Thang khoảng cách chỉ cho padding, gap, margin. Kích thước (rộng, cao) KHÔNG dùng token khoảng cách (Polaris) mà dùng token kích thước, khai báo px trực tiếp:

| Token kích thước | px | Dùng | Nguồn |
| --- | --- | --- | --- |
| `--control-height` | 48 mọi mốc | Nút, ô nhập, select, stepper | Chuẩn: Carbon button 48; sàn 44 của Polaris. CTO 21/11 lượt 2: bỏ mức 52 từ 80rem |
| `--control-height-compact` | 44 | Nút small, stepper giỏ, ô tìm trong popover, tab / chip dưới 80rem | Sổ 20/11 V21, V40; Polaris touch target 44 |
| `--touch-target` · `--touch-target-min` | 44 · 24 | Vùng chạm 6 nhóm · sàn mọi control | Polaris 44 × 44; sổ 09/11 |
| `--tab-height-desktop` | 40 | Tab, chip từ 80rem | Chuẩn: Carbon button 40 |
| `--row-height` | 52 | Hàng danh sách: drawer menu, footer accordion, facet summary | Thiết kế: 44 + đệm 4 trên dưới |
| `--round-button-size` | 52 | Nút tròn carousel, phân trang | Sổ 09/11 |
| `--count-badge-size` | 20 | Số đếm giỏ trên icon header | Thiết kế: trên lưới 4px (trước 18) |
| `--progress-height` · `--meter-height` | 4 · 8 | Thanh tiến trình carousel · meter freeship | Sổ 09/11 (thanh mảnh); trên lưới 4px |
| `--icon-size-sm / md / lg` | 16 / 20 / 24 | Icon (§33) | Polaris icon khung 20, vùng an toàn 16 |
| `--logo-width` · `--logo-height` | 100 · 30 | Logo header, trang password, gift card (2.1.0) | Thiết kế: logo thương hiệu, tỉ lệ 10:3. Code theme: setting `logo_width` đặt `--logo-width` inline |
| `--quantity-compact-width` | 130 | Bề ngang `.quantity--compact`, cột Quantity trang giỏ (2.1.0) | Thiết kế: 44 + 40 + 44 + viền 2 |

Thang kích thước primitive (2.1.0, ES1-T573, ĐỀ XUẤT): cho width / height không có vai trò riêng (ô ảnh, thumb, đĩa icon, hàng cố định). Tên theo bậc cùng quy ước `--space-050 / 150` (bậc 100 = 4px), không đặt theo giá trị (§32.1). Token vai trò ở bảng trên giữ tên riêng, cùng giá trị bậc tương ứng.

| Token | px | Dùng (hiện có) |
| --- | --- | --- |
| `--size-1000` | 40 | Tay nắm sheet (rộng), ô ảnh nhỏ |
| `--size-1100` | 44 | Thumb tròn `.quiz-opt`, hàng `.specs` từ 80rem |
| `--size-1200` | 48 | Thumb thanh dính đáy |
| `--size-1300` | 52 | Đĩa icon `.stl__fits-icon` |
| `--size-1400` | 56 | Thumb dòng sản phẩm |
| `--size-1600` | 64 | Thumb gợi ý tìm kiếm; trần chân `.level-card` khi mở |
| `--size-1800` | 72 | `.quiz-opt` dưới 48rem |
| `--size-2000` | 80 | `.quiz-opt` từ 48rem; thumb dòng giỏ |
| `--size-2400` | 96 | Ảnh chồng footer; placeholder media tối đa |

Nguồn: Thiết kế (gom kích thước đang viết số trong mockup, notes ES1-T567 §8.3); Polaris không dùng token khoảng cách cho width / height. Component cũ còn viết px (`.thumb`, `.product-row__media`, footer): chuyển dần, không bắt buộc trong 2.1.0.

Ngoại lệ có tên của quy tắc "không px trong component": toạ độ nét vẽ glyph (chevron 9 × 5, 12 × 7, mũi tên 16 × 14, sao 14 × 13, dấu ✓; Thiết kế: quang học glyph) và nút, icon do Shopify / Apple render (§27).

Bo góc: `--radius-xs` 4 (input, nút, chip, tab), `sm` 8 (swatch, thumb), `md` 12 (card, dropdown, popover, bảng), `lg` 16 (`--radius-panel`: banner, card bài viết, card collection, panel footer, panel tối, hộp meter, panel trong trang), `xl` 20 (`--radius-dialog`), `pill`. Chuẩn: Polaris React border radius (admin, tham chiếu) và M3 shape đều có 4, 8, 12, 16, 20; Polaris web không nêu giá trị px của radius. Không viết `calc(radius + space)`; không dùng token space làm bo góc; không `border-radius` viết số (2px → pill). Component đọc vai trò (`--radius-card`, `--radius-panel`, `--radius-dialog`), không đọc thẳng `--radius-md` cho card.

Bo góc lồng nhau (sổ 21/11, foundations-09; Polaris: surface lồng trong có radius nhỏ hơn cha): con nhỏ hơn cha một bậc. Thumb 8 trong card 12 (`--radius-sm` trong `--radius-card`); card 12 trong panel 16; panel 16 trong dialog 20. Nút và badge KHÔNG đổi bo khi lồng (nút trong card giữ `--radius-button` 4). Con không bo lớn hơn cha.

Radius lẻ trong code theme → bậc thang (Cần FE, đếm trên `origin/develop` `assets/*.css`: 31 chỗ dùng biến bo tiền tố cũ đặt theo giá trị = base.css 25 + aux.css 6; 25 chỗ `calc(var(--radius-card) …)` = base.css 20 + aux.css 3 + cart.css 2, gồm `+ space-1` 17, `- space-1` 6, `* 2` 2). Tên biến đầy đủ: bảng "Tên code còn tiền tố cũ" ở `drafts/designer/ES1-T567/notes.md`.

| Trong code theme | px | Số lần · file | Dùng | Ghi chú |
| --- | --- | --- | --- | --- |
| Biến bo cũ, giá trị 2 | 2 | 2 · base.css | `--radius-pill` | Thanh cao 4 (tiến trình bundle, tay nắm sheet): bo nửa chiều cao |
| Biến bo cũ, giá trị 4 | 4 | 2 · aux.css (dòng 441, 701) | `--radius-xs` | KHÔNG xoá trước khi thay. Hoặc vai trò `--radius-input`, `--radius-button` |
| Biến bo cũ, giá trị 8 · `calc(var(--radius-card) - var(--space-1))` | 8 | 8 · base.css | `--radius-sm` | Swatch, thumb, ô countdown |
| Biến bo cũ, giá trị 12 | 12 | 1 · base.css | `--radius-card` | Vai trò, không dùng `--radius-md` trực tiếp cho card |
| Biến bo cũ, giá trị 16 · `calc(var(--radius-card) + var(--space-1))` | 16 | 15 · base.css 11, aux.css 4 | `--radius-panel` | Panel, banner, card bài viết, card collection |
| Biến bo cũ, giá trị 18 | 18 | 1 · base.css | `--radius-pill` | Nhãn đếm cao 28: 18 đã lớn hơn nửa chiều cao, hình không đổi |
| Biến bo cũ, giá trị 24 · `calc(var(--radius-card) * 2)` | 24 | 2 · base.css | `--radius-dialog` (20) | Sổ 20/11 V04: 24 quy về 20, bậc lớn nhất của thang; panel lớn trong trang dùng `--radius-xl` |
| Biến bo cũ, giá trị 999 | 999 | 0 | `--radius-pill` | Đã có sẵn |

### 1.3 Vùng chạm 44 cho 6 nhóm (sổ 21/11, foundations-13; màn `h-grid`)

Hai token: `--touch-target-min` 24 là sàn mọi control (sổ 09/11; dưới 48rem control vẫn ≥ 44; riêng link trong tóm tắt lỗi form `.form-message__list a` giữ sàn 44 dưới 80rem, 24 từ 80rem: CTO 21/11 lượt 2), `--touch-target` 44 áp MỌI MỐC cho đúng 6 nhóm dưới đây. Số = rộng × cao vùng chạm thật (px), đo trên kit.

| Nhóm | Component | 360 | 768 | 1280 | 1920 |
| --- | --- | --- | --- | --- | --- |
| 1 · Link menu chính | `.site-header__link`, hàng drawer, `.mega__col a`, `.dropdown a` | hàng drawer cao 52, hết ngang | hàng drawer cao 52, hết ngang | link ≥ 44 × 44 (chữ rộng 30–84, vùng chạm nở tới 44); mega, dropdown cao 44 | như 1280 |
| 2 · Submit form | `.search-field__submit`; `.button` (Add to cart) | 44 × 44; 156 × 48 | 44 × 44; 156 × 48 | 44 × 44; 156 × 48 | 44 × 44; 156 × 48 |
| 3 · Cart | `.site-header__icon` | 44 × 44 | 44 × 44 | 44 × 44 | 44 × 44 |
| 4 · Hamburger | `.site-header__menu-toggle` | 44 × 44 | 44 × 44 | ẩn (menu ngang) | ẩn (menu ngang) |
| 5 · Đóng modal / drawer | `.close-button` | 48 × 48 | 48 × 48 | 48 × 48 | 48 × 48 |
| 6 · Chọn variant | `.variant-pill`, `.variant-swatch`, `.variant-more` | pill ≥ 56 × 44; swatch 44 × 44 | như 360 | như 360 | như 360 |

- Link menu ngắn (Sale, Blog, Help) có chữ hẹp hơn 44: vùng chạm nở đều hai bên tới 44 bằng `::after`, khoảng cách 40 giữa các mục giữ (Chuẩn: Polaris large-400; bố cục không đổi).
- Link mega 40 → 44 cao (mỗi hàng link cao thêm 4). `.button` cao 48 và luôn rộng hơn 44 nhờ đệm ngang 32 × 2, không đặt `min-inline-size`.
- Component đọc `var(--touch-target)` (`min-block-size`, `min-inline-size` hoặc `inline-size` / `block-size`), không viết 44px.
- Ngoài 6 nhóm giữ sàn 24: tab 40 từ 1280 (§7), chip 40 từ 80rem (§30.1). Swatch trên card sản phẩm 36 × 24 không phải control: chỉ báo không bấm, `aria-hidden` (CTO 10/11, §22 câu 2, §9) nên không tính vào nhóm 6 "chọn variant"; chọn màu bằng `.variant-swatch` 44 × 44.
- Hàng drawer menu cao 52 (`.nav-row`) hiện định nghĩa ở mockup navigation (ES1-T260), chưa có trong kit.

## 2. Token dùng

Token màu trong `snippets/css-variables.liquid` + 3 màu dẫn xuất ghi ở `docs/tokens.json` `color_derived` (không setting): `--color-accent-on-sand`, `--panel-muted`, `--panel-saving`.

Màu: `--color-background`, `--color-foreground`, `--color-muted`, `--color-muted-light`, `--color-border`, `--color-background-alt(-foreground)`, `--color-background-cream(-foreground)`, `--color-background-sand(-foreground)`, `--color-background-dark(-foreground)`, `--color-background-panel`, `--color-muted-on-dark`, `--color-accent(-foreground)`, `--color-accent-on-sand`, `--color-sale(-foreground)`, `--color-badge-new(-foreground)`, `--color-rating`. Role trạng thái (alias, §2.1): `--color-success(-foreground)`, `--color-warning(-foreground)`, `--color-critical(-foreground)`.
Chữ: `--font-heading--family/weight/weight-display`, `--font-primary--family`, `--font-size-xs..wordmark`, `--font-body-weight`, `--letter-spacing-body/label/heading/display/caps`, `--line-height-body/sm/label/title/reading/price-lg/eyebrow/h4/h3/h2/h1/display` (§1.1).
Khoảng cách: `--space-050..7xl` (tên chính; `--space-1..8` là alias cho code theme, §1.2), `--touch-target-min`, `--touch-target`, `--page-width`, `--page-margin`, `--header-height`, `--control-height(-compact)`. Icon: `--icon-size-sm/md/lg`, `--icon-stroke-width` (§33). Tầng component: `--tab-padding-inline` (§7), `--tab-height-desktop`, `--row-height`, `--round-button-size`, `--count-badge-size`, `--progress-height`, `--meter-height` (§1.2). Bo góc: `--radius-xs/sm/md/lg/xl/pill`, vai trò `--radius-input/button/card/hero/swatch/panel/dialog`. Elevation: `--shadow-none/raised/overlay/bar`, `--overlay-scrim`. Lớp: `--layer-*` (§31). Motion: `--motion-fast/base/slow/accordion/reveal/enter/stagger/hero`, `--ease-out/in-out/expo` (§19).
Asset: `assets/noise-dark.png` (đang dùng ở base.css cho header trang chủ và footer) là lớp noise của mọi nền tối.

Không dùng biến đặt tên theo giá trị ở bất kỳ đâu trong thành phần mới: loại biến này không thuộc tầng nào của kiến trúc token. Bảng đổi 24 biến tiền tố cũ đang dùng trong code theme sang token theo vai trò, số token từng nhóm và thứ tự nguồn chuẩn: §32.

Giá trị dẫn xuất (không phải token, viết `calc()` hoặc custom property cục bộ):

| Tên trong kit | Giá trị | Dùng cho |
| --- | --- | --- |
| `--section-gap` | `--space-4xl` 48 → `--space-7xl` 128 từ 64rem | padding-block section |
| `--heading-gap` | `--space-xl` 24 → `--space-3xl` 40 từ 80rem | header section → nội dung |
| `--grid-gap` | `--space-sm` 12 → `--space-md` 16 từ 48rem → `--space-xl` 24 từ 80rem | gutter |
| `--control-height` | 48 mọi mốc (khai báo trực tiếp, không trỏ về `--space-*`); `--control-height-compact` 44 mọi mốc | nút, input, select |
| `--band-side`, `--band-inset` | `(100% − content) / 2`; `max(0, min(64, side − 64))` (lùi tối đa `--space-5xl`) | panel footer, dải rộng |
| `--dark-texture` | `url(noise-dark.png)` | header, footer, section tối |
| `--overlay-scrim` | `color-mix(--color-background-dark 50%, transparent)` | drawer, dialog, mega |
| `--shadow-raised` | `0 8 24 color-mix(--color-foreground 12%)` | dropdown, popover, toast, teaser; nút hover, card bài viết hover, header đã cuộn (§31) |
| `--shadow-overlay` | `0 32 80 color-mix(--color-foreground 28%)` | drawer, dialog, sheet |
| `--shadow-bar` | `0 −4 24 color-mix(--color-foreground 10%)` | thanh dính đáy, bóng hướng lên |
| `--radius-dialog` | `--radius-xl` = 20 (bậc lớn nhất của thang; trước 24) | dialog, sheet |
| `--panel-muted` | `color-mix(in srgb, var(--color-background-dark-foreground) 70%, var(--color-background-panel))` ≈ #C4C4C6 | chữ phụ trên panel tối: dòng hàng, Subtotal, ghi chú thuế, đếm món, ghi chú quiz |
| `--panel-saving` | `color-mix(in srgb, var(--color-badge-new) 50%, var(--color-background-dark-foreground))` ≈ #A5C0A6 (badge-new #4B824D) | dòng giảm giá trên panel tối, luôn kèm icon tag 16 + dấu "−" (U+2212), số tiền `white-space: nowrap` |

Panel tối (G3, sổ 10/11): mọi khối nền `--color-background-panel` (tóm tắt cart, chân mini cart, "Your bundle", panel shop the look, quiz) dùng đúng cặp trên. Chữ chính và tổng: `--color-background-dark-foreground` (11.4). Không dùng #999 / `--color-muted-on-dark` (4.01), #B2B2B2, trắng 60%, xanh badge-new #4B824D (2.50) hay chữ trắng cho dòng giảm giá. Focus trên panel: outline trắng. Thay đổi chữ phụ trắng 60% → 70% và #B2B2B2 → 70% là quyết định có chủ đích (nhất quán, AA; sổ 11/11 FD1); spec bundle, shop the look, quiz trỏ về đây.

Màu ngoài token, không dùng (V18): #142521, #CEC2BD, #666666 (thay bằng muted-light #6B6B6B), #CCCCCC (thay bằng `--panel-muted`), #333333, #808080, #B2B2B2.

Bảng tương phản (WCAG, L tính tay; dark = #1A1A1A, L 0.0103):

| Cặp | Tỉ lệ | Dùng cho |
| --- | --- | --- |
| foreground / background | 17.4 | mọi chữ |
| foreground / background-alt (#F4F4F5) | 15.8 | tab chưa chọn, chip, nút tertiary |
| foreground / cream | 15.9 | card sản phẩm |
| muted / background | 8.45 | chữ phụ, breadcrumb, giá gạch |
| muted / sand | 6.81 | chữ phụ trên sand |
| muted-light / background | 5.33 | placeholder, viền input |
| accent-foreground / accent | 5.01 | nút primary, tag |
| accent / background | 5.01 | eyebrow, focus ring |
| accent / background-alt | 4.55 | eyebrow trên alt |
| accent-on-sand (#B73C0F) / sand | 4.62 | eyebrow trên sand |
| sale-foreground / sale | 6.38 | badge sale; giá sale, lỗi trên nền sáng |
| badge-new-foreground / badge-new | 4.57 | badge New, toast success |
| background-dark-foreground / dark | 17.4 | chữ header, footer |
| menu trắng 60% (#A3A3A3) / dark | 6.9 | menu header, trạng thái thường |
| muted-on-dark / dark | 6.11 | eyebrow tối, link footer, placeholder, viền input tối |
| muted-on-dark / panel footer (#1F1F1F) | 5.78 | link, trust trong panel |
| background-dark-foreground / panel | 11.4 | chữ chính, tổng trên mọi panel tối |
| `--panel-muted` (L 0.553) / panel (#393942, L 0.042) | 6.56 | chữ phụ panel tối |
| `--panel-saving` (#A5C0A6) / panel | 5.82 | giảm giá panel tối (badge-new #4B824D, V01) |
| muted / border (nút disabled) | 6.70 | chữ nút disabled |
| accent / dark | 3.48 | chỉ chữ lớn ("Get 15% off"), focus không dùng |
| sale / dark | 2.73 | KHÔNG dùng cho chữ; lỗi trên nền tối dùng chữ trắng + icon đỏ |
| border / background | 1.26 | chỉ trang trí |

### 2.1 Role trạng thái (sổ 21/11, foundations-07; màn `h-color` nhóm "Status")

Alias trỏ về token sẵn có: không setting, không giá trị màu mới. Đổi `badge_new_color`, `sale_color`, `accent_color` thì role đổi theo.

| Role | Alias | Trỏ về | Tương phản | Dùng cho |
| --- | --- | --- | --- | --- |
| Success | `--color-success`, `--color-success-foreground` | `--color-badge-new` #4B824D, `--color-badge-new-foreground` | chữ trắng trên nền 4.57; icon, viền trên trắng 4.57 | toast success, form message success, status icon, meter đạt |
| Warning | `--color-warning`, `--color-warning-foreground` | `--color-accent` #C8400E, `--color-accent-foreground` | chữ trắng trên nền 5.01; icon, viền trên trắng 5.01 | toast warning, form message warning |
| Critical | `--color-critical`, `--color-critical-foreground` | `--color-sale` #BD1616, `--color-sale-foreground` | chữ trắng trên nền 6.38; chữ lỗi trên trắng 6.38 | toast error, form message error, alert, `.field__error`, `.variant-option__error`, viền `aria-invalid` (ô nhập, checkbox / radio, quantity, ô footer, ô on-dark) |

- Info không có alias: dùng `--color-muted` (8.45).
- Role trạng thái chỉ cho thông báo. Badge (-N%, New), giá sale, nút, chấm tồn kho, `--panel-saving` vẫn đọc token gốc.
- Chữ nội dung thông báo giữ foreground; màu role nằm ở thanh, viền, icon và luôn kèm icon + chữ (màu không là tín hiệu duy nhất).
- Trên nền tối: chữ lỗi trắng + icon critical (sale trên dark 2.73, §4).

### 2.2 Color scheme × role (sổ 21/11, foundations-15; màn `h-dark` "12b. Color schemes and roles", chi tiết panel ở `h-panel`)

6 nền là 6 scheme dùng chung một bộ role. Component đọc role theo ngữ cảnh (`.section--*`, `.on-dark`, `.dpanel`), không tự đặt màu. Hiện chỉ là tài liệu: chưa có setting `color_scheme`, giá trị màu không đổi. Tên token bỏ tiền tố `--color-`; số = tương phản với nền của scheme (WCAG).

| Scheme (class) | Background | Text | Text subdued | Border | Focus | Link |
| --- | --- | --- | --- | --- | --- | --- |
| Light (`body`) | `background` #FFFFFF | `foreground` 17.4 | `muted` 8.45; `muted-light` 5.33 | `border` 1.26 trang trí; viền ô nhập `muted-light` 5.33 | `accent` 5.01 | foreground gạch chân 17.4; hover `accent` 5.01 |
| Alt (`.section--alt`) | `background-alt` #F4F4F5 | `background-alt-foreground` 15.8 | `muted` 7.69; `muted-light` 4.85 | `border` 1.15 trang trí | `accent` 4.55 | foreground gạch chân 15.8; hover `accent` 4.55 |
| Cream (`.section--cream`) | `background-cream` #F5F5F1 | `background-cream-foreground` 15.9 | `muted` 7.73; `muted-light` 4.88 | `border` 1.15 trang trí | `accent` 4.58 | foreground gạch chân 15.9; hover `accent` 4.58 |
| Sand (`.section--sand`) | `background-sand` #EBE6E0 | `background-sand-foreground` 14.0 | `muted` 6.81; KHÔNG `muted-light` (4.30) | `border` 1.02 trang trí | `accent` 4.03 | foreground gạch chân 14.0; eyebrow `accent-on-sand` 4.62; hover `accent-on-sand` 4.62 |
| Dark (`.section--dark`, `.on-dark`) | `background-dark` #1A1A1A + noise | `background-dark-foreground` 17.4 | `muted-on-dark` 6.11 | trắng 12% trang trí; viền ô nhập `muted-on-dark` 6.11 | trắng 17.4; KHÔNG `accent` (3.48) | trắng gạch chân 17.4; hover gạch 2px, không đổi màu |
| Panel (`.dpanel`) | `background-panel` #393942 | `background-dark-foreground` 11.4 | `--panel-muted` 6.56; KHÔNG `muted-on-dark` (4.01) | `muted` 1.35 trang trí (vạch tổng) | trắng 11.4 | trắng gạch chân 11.4; giảm giá `--panel-saving` 5.82 |

- Không mang chữ phụ của scheme này sang scheme khác (`muted-light` trên sand, `muted-on-dark` trên panel); không focus accent trên nền tối.
- Focus chỉ cần 3:1 (WCAG 1.4.11): accent trên sand 4.03 đạt. Link hover trên sand đọc `--color-accent-on-sand` (4.62; accent 4.03 dưới 4.5 cho chữ thường): kit `.section--sand .text-link:hover`, `.section--sand .rte a:hover` (ES1-T567, AA cả trạng thái hover theo sổ 09/11).

## 3. Header mọi trang

Nguồn: sổ 10/11 (header trang chủ và trang con là thanh tối riêng, không đè ảnh); màn `h-header`. Code: `blocks/header.liquid`, `.site-header*` (`critical.css`), nền tối hiện chỉ áp cho trang có `.slideshow` (base.css dòng 7452–7458): ticket trang bỏ điều kiện đó.

### 3.1 Anatomy và kích thước

Nút menu (< 80rem) · logo (link về trang chủ) · menu chính 7 mục (Shop ▾, Collection ▾, Sale, Our story, Blog, Contact, Help) · search · account · cart + số lượng.

| | 360 | 768 | 1280 | 1920 |
| --- | --- | --- | --- | --- |
| Nền | `--color-background-dark` + noise, cao 80, không viền | như 360 | như 360 | như 360 |
| Trái | menu 44 (lùi −12) + logo 100 × 30 | như 360 | logo 100 × 30 | logo tại x 252 |
| Giữa | — | — | 7 mục, gap 40, Inter 16/500, ls −0.04em, chevron 9 × 5 cách 4 | như 1280 |
| Phải | search 20, account 24, cart 24, ô 44 liền nhau | như 360 | ô 44 cách 4 (nhìn icon cách 24) | như 1280 |
| Số giỏ | pill 18, nền trắng, chữ dark 13/700, góc trên phải icon | | | |

### 3.2 Trạng thái

- Link menu: mặc định trắng 60% (6.93:1); hover, `aria-expanded="true"` trắng 100%, chevron xoay 180°; trang hiện tại (`aria-current="page"`) trắng 100% + gạch chân 2px offset 0.45em (ĐỀ XUẤT, 04 §3.9: mục đang chọn phải rõ, không chỉ bằng màu).
- Icon: hover scale 1.08 (base.css). Số giỏ nhảy khi thêm hàng (`[data-bump]`).
- Focus: outline 2px `--color-background-dark-foreground` offset 2 (accent trên dark 3.48, kém rõ).
- Đã cuộn (`[data-scrolled]`): giữ nguyên nền, thêm bóng `--shadow-raised` (trước là bóng viết tay `0 1 8 foreground 24%`; sổ 21/11, foundations-10). Không đổi chiều cao (0 CLS).
- Dropdown / mega mở: header giữ tối; panel trắng ngay dưới đáy header (§14).

### 3.3 Trang có ảnh lớn đầu trang (collection có banner, article có ảnh bìa)

ĐỀ XUẤT (sổ 10/11 cấm đè ảnh; hình thức theo hero trang chủ là thẻ bo góc dưới header):
- `.page-banner`: thẻ trong container, cách header 16 (24 từ 64rem), bo 16 (`--radius-card + --space-1`), cao tối thiểu 280 / 360 từ 64rem, ảnh `cover`.
- Lớp tối gradient 75% đáy → 60% từ giữa lên: điểm sáng nhất vẫn ≥ 60%, chữ trắng trên ảnh trắng = 4.56:1 (L nền 0.180). Khác hero (30% theo sổ 10/11) vì banner trang con là ảnh merchant tự chọn, không duyệt từng ảnh; xem câu CTO 1.
- Nội dung đáy trái, padding 32 / 24 (48 từ 64rem): breadcrumb trắng, eyebrow trắng (xám #999 trên ảnh chỉ ~2.3:1), h1 trắng.
- Ảnh banner là LCP: eager + `fetchpriority="high"`, width/height, srcset.

### 3.4 A11y, Lighthouse

`<header>` + `<nav aria-label="Main">`; icon có `aria-label` ("Cart, 2 items": số nằm trong tên, badge `aria-hidden`); vùng chạm 44; skip link trước header; logo `<a>` có tên. Header ở critical.css (≤ 10 KB): noise là `background-image` 1 file nhỏ đã có, không chặn LCP. Sticky bằng CSS, 0 CLS.

Câu hỏi mở vòng 2 (header trang con tối hay trắng): đã chốt 10/11, tối. Đề xuất nền trắng của vòng 2 bị huỷ.

## 4. Footer

Footer giống hệt trên mọi trang có `layout/theme.liquid` (password, gift card không có). Code: `blocks/footer.liquid`, `.site-footer*`.

Anatomy (3 tầng trên nền `--color-background-dark` + noise):
1. Newsletter (container): ảnh 96 × 120 bo 8 có 2 thẻ rộng 80 phía sau (lệch 16 mỗi bên, lùi 12 trên dưới) · tiêu đề h2 Sofia 800 uppercase, "Get 15% off" cam (chữ lớn 3.48 ≥ 3, sổ 09/11) · mô tả muted-on-dark · form: input + nút "Get 15% off" có icon gửi · ghi chú "No spam. Unsubscribe anytime."
2. Panel dải rộng: nền `color-mix(white 2%)` (≈ #1F1F1F trên #1A1A1A), bo 16, padding trên 48 → 128 từ 80rem (`--space-7xl`), dưới 24. Trong panel: logo 80 × 24 (tỉ lệ 10:3 như header) · mô tả (16/28 `--line-height-reading`, max 456) · 4 social 28 (ô 44) · 2 cột menu Shop, Information (tiêu đề Inter 700 18/28, tiêu đề → link 32, link cách 16) · trust bar 4 mục (icon 32 + chữ 14/500), gạch trên 1px trắng 12%.
3. Hàng cuối: copyright 14/500 trái · wordmark "EFITCO" Sofia 800 `--font-size-wordmark` (200 ở 1920) lh 0.9 ls −0.04em giữa · localization (cờ tròn 24 + "USD / EN" + chevron) và 5 icon thanh toán phải; copyright và phải căn đáy theo wordmark.

| | 360 | 768 | 1280 | 1920 |
| --- | --- | --- | --- | --- |
| Newsletter | xếp dọc: ảnh, chữ, form; nút full width | ảnh + chữ 2 cột, form dưới full | 3 cột ảnh · chữ · form (≤ 496), input liền nút | như 1280, x form 1170 |
| Panel | tràn mép, padding ngang 20 | tràn mép, padding 20 | tràn mép, nội dung thẳng container | lùi 64, bo 16, nội dung thẳng x 252 |
| Menu | `<details>` accordion, hàng 52, link 44 | 2 cột mở sẵn, link 24 cách 16 | brand trái, 2 cột 216 phải gap 24 | như 1280 |
| Trust | 2 × 2 | 4 cột | 4 cột | 4 cột |
| Hàng cuối | wordmark 64 trên, rồi locale + thanh toán, rồi copyright (giữa) | wordmark 80 | 3 cột, wordmark 133 | wordmark 200 |

Trạng thái và form:
- Link menu, social: muted-on-dark → hover trắng. Focus outline trắng.
- Input: viền 100% `--color-muted-on-dark` (6.11, sổ 09/11), hover viền trắng, focus outline trắng 2px.
- Lỗi: viền đỏ 2px, câu lỗi CHỮ TRẮNG + icon đỏ (sale trên dark 2.73:1 trượt AA). Code `.site-footer__invalid` đang tô chữ `--color-sale`: cần sửa.
- Thành công: hộp `form-message--success` trên nền tối (chữ trắng, thanh badge-new).
- Menu Information: Our story, Our Efitco, FAQs, Contact us. ĐỀ XUẤT: thêm "Shipping policy", "Refund policy" cuối danh sách, URL `shop.policies` (14 #252D; TE-9 AC5). Là dữ liệu menu, không đổi giao diện.
- Icon social: `--color-muted-on-dark` (6.11), hover trắng. #B2B2B2 không có token, không dùng (kit.css `.site-footer__social a` đã đúng).

A11y: menu tiêu đề không dùng `<h*>` ở desktop nếu làm lệch heading-order (dùng `<p>`/`summary`); wordmark `aria-hidden` (trang trí, không lặp tên); social có tên "Efitco on Instagram"; thanh toán `aria-label="Payment methods"`; input có label ẩn + `autocomplete="email"`.

## 5. Breadcrumb và tiêu đề trang

Nguồn: 04 §4.
- `<nav aria-label="Breadcrumb"><ol>`, mục cuối `<span aria-current="page">`, dấu "/" bằng `::before`.
- Chữ 14/20, link `--color-muted` (8.45), mục cuối foreground 500, dấu `--color-muted-light`. Link cao 44. Padding trên 16 → 24 từ 64rem (header tối phía trên, breadcrumb trên nền trắng). LUÔN 1 dòng (`nowrap`, V20): mục cuối co lại (`min-width: 0`) và cắt "…", tối đa 48ch từ 64rem; < 48rem mục giữa cũng cắt ở 10ch; không dòng nào bắt đầu bằng "/".
- Hover: foreground + gạch chân. Focus: outline accent.
- Không có trên: trang chủ, cart, 404, password. Collection: Home / Collections / {collection}. Product: Home / {collection} / {product}. Article: Home / {blog} / {article}. Trong banner (§3.3): chữ trắng.
- SEO: JSON-LD `BreadcrumbList`, URL qua `routes.*`.

Tiêu đề trang: eyebrow (accent 16/800 uppercase) → h1 → meta 14 muted. Padding 16 / 48, từ 64rem 24 / 64. Một h1 mỗi trang.

## 6. Nút

| Loại | Kích thước | Màu | Code hiện có | Nguồn |
| --- | --- | --- | --- | --- |
| Primary | cao 48 mọi mốc, padding 32, 16/600, bo `--radius-button` | nền accent, chữ trắng (5.01) | `.button` | DESIGN; Chuẩn: Carbon button 48, sàn 44 Polaris |
| Secondary | như primary, viền 1px currentColor | trong suốt, chữ foreground; trên dark chữ trắng | `.button--secondary` | DESIGN |
| Link CTA | cao 44, heading 700 28/36, mũi tên 16 × 14 | currentColor | `.button--link` | Thiết kế: link CTA kiểu heading; mũi tên là glyph |
| Tertiary (V23) | như primary | nền alt, viền 1px muted-light (4.85), chữ foreground; hover đảo đen; disabled = nền border, không viền đậm | `.button--tertiary` (kit) | thay nút "View details" nền xám không viền |
| Small (V40) | cao 44 mọi mốc, padding 16, 14/600, icon 16 | theo primary/secondary/tertiary | `.button--small` (kit) | card, gợi ý giỏ, lỗi inline "Try again", accelerated drawer |
| Icon + nhãn (V58) | icon 20 trước chữ cách 8 | theo biến thể | `.button__icon` (kit) | Send message, Notify me, Copy code |
| Chỉ icon | vuông bằng control (44 khi small), `aria-label` | theo biến thể | `.button--icon-only` (kit) | submit tìm kiếm < 48rem |
| Secondary trên nền tối (V58) | như secondary | viền + chữ trắng; hover nền trắng chữ dark; focus trắng; disabled viền trắng 30% chữ muted-on-dark | `.button--on-dark`, `.on-dark .button--secondary` (kit) | password, gift card, panel tối |
| Text link | inline, gạch chân 1px offset 0.2em | inherit, hover accent | `.text-link` | 06 §6, `link-in-text-block` |
| Link đầu section (V29) | 16/600 gạch chân + mũi tên 16 × 14 | inherit, hover mũi tên dịch 4 | `.section-link` (kit) | "Browse all setups" |
| Chevron tròn 52 (prev/next) | 52 × 52, chevron 11 × 16 giữa (`slideshow-icon` previous/next), 2 nút cách 8 | nền trắng, viền `--color-border`, icon foreground; hover nền accent, icon trắng; trên nền tối viền trắng (không thấy viền) | `.carousel-nav__button`, `.collection-list__button`, `.slideshow__arrow` | Sổ 09/11; `--round-button-size` |
| Đóng 48 | tròn 48, icon 20 | trắng viền border; hover nền foreground | `.quiz__dialog-close` | 15 §1 |
| Icon header | ô 44, icon 20/24 | trắng | `.site-header__icon` | Màn `h-header` |
| Back (drawer) | cao 44, icon 16, chữ 14 muted | nhỏ, nhạt hơn × | — (ĐỀ XUẤT) | 14 §3 |

Trạng thái (code + 05 §3):
- Hover < 200ms: primary `color-mix(accent 88%, foreground)` + nhấc 1px + bóng `--shadow-raised` (không bóng viết tay, §31); secondary đảo nền foreground; chevron cam + scale 1.06.
- Active: scale 0.98 (tròn 0.94). Focus: outline 2px accent offset 2 (tròn 3), chỉ `:focus-visible`; trên nền tối outline trắng.
- Disabled: LUÔN là cặp màu riêng, không dùng opacity (sổ 21/11, foundations-12). Nút: nền `--color-border`, chữ `--color-muted` (6.70), `cursor: not-allowed`. Chevron tròn 52 ở đầu/cuối hàng và phân trang: `aria-disabled`, viền `--color-border`, icon `--color-muted-light` (5.33 trên trắng), nền giữ, không hover, không scale, `cursor: not-allowed` (icon tắt so với icon bật 3.27:1); trên nền tối (`.section--dark`, `.on-dark`): nền trong suốt, viền + icon `--color-muted-on-dark` (6.11), vì nút bật ở đó là đĩa trắng; nút vẫn giữ chỗ (0 CLS). Tab, chip disabled: chữ muted-light, viền border. Ô màu lọc disabled: §30.6. Ảnh sản phẩm hết hàng 0.6 (§9) là ảnh, không phải control, giữ.
- Loading: `aria-busy="true"`, chữ trong suốt, spinner 20 (trắng trên primary, foreground trên secondary/tertiary), giữ bề rộng, chữ ẩn "Adding".
- Mọi biến thể đủ 6 ô có nhãn trên foundation.html §9 (V09). Tab có màn riêng `h-tabs` (§7).
- Nhãn dài (chuỗi dịch): nút giãn theo nhãn, không khoá bề rộng; hàng nút xuống dòng, nút rộng 100% dưới 48rem; nhãn vẫn dài hơn khung thì `.button--wrap` (chữ xuống dòng trong nút, nút cao lên). Không cắt "…", không thu cỡ chữ (§37).
- Tertiary small đứng cùng vùng với hàng chip: bắt buộc có icon 16 trước nhãn, hoặc tách sang hàng riêng (§7, phân biệt với chip).
- Sold out: primary disabled, nhãn "Sold out" (giống badge; `docs/design/content.md` §4, sổ V67).

Quy tắc: 1 primary mỗi section, ≤ 5 mỗi trang (04 §1). Nhãn sentence case, 2–4 từ, mở bằng động từ, không mạo từ, không dấu câu (Chuẩn: Polaris Button; sổ 21/11 ES1-T567, THAY Title Case 07/11 và ngoại lệ components-11): "Add to cart", "Explore equipment", "Try again". Áp cho mọi `<button>` và link dạng nút (kể cả nút đóng có chữ, nút "+N" / thu gọn, nút thử lại): "Keep shopping", "Show fewer", "Continue shopping"; link CTA và link "View all …" cùng quy tắc, 2–5 từ ("Read the full guide", "View all articles"). Tên riêng, viết tắt, nút có thương hiệu giữ cách viết gốc. `aria-label` chứa đúng chữ đang hiển thị. Text link trong câu, link chính sách giữ chữ theo dữ liệu ("Shipping policy"). Heading h1–h4, tiêu đề section, dialog / drawer, empty state, tab, link menu (header, mega, drawer, footer), nhãn chip lọc là chữ giao diện: sentence case (CTO 21/11 lượt 2: "Browse categories", "Order summary", "Our story"); tên thương hiệu, tên sản phẩm / collection / bài viết (dữ liệu merchant, ví dụ "Free Weights"), tên riêng (Shop Pay), viết tắt (FAQ, USD) giữ nguyên. Chữ HOA do CSS `text-transform` (display, eyebrow, nhãn nhóm, tiêu đề popup marketing: bản sắc thương hiệu), chữ nguồn vẫn sentence case. "Checkout" là thuật ngữ, giữ một chữ. Bảng đầy đủ: `docs/design/content.md` §2. Hai nút cách 16, mobile xếp dọc cách 12–20. `<button>` cho hành động, `<a href>` cho điều hướng; nút icon có `aria-label`.

## 7. Tab

Cao 44 dưới 80rem (`--control-height-compact`), 40 từ 80rem (`--tab-height-desktop`); padding ngang 24; gap 8; 16/24 500; bo 4; viền 1 border.
- Chưa chọn: nền alt, viền border, chữ foreground (15.8). Đang chọn: nền foreground, chữ trắng. Hover: viền foreground.
- < 80rem: cao 44, một hàng cuộn ngang, không xuống dòng thành hai hàng. 2–7 tab cùng cấp (featured collection ≤ 5), nhãn 1–2 từ. Nhãn dịch dài: tab giãn theo nhãn, hàng cuộn ngang; không cắt chữ (§37).
- Padding ngang 24 là token tầng component `--tab-padding-inline` = `--space-xl` (Chuẩn: Polaris large-200; trước ES1-T567 là 28, ngoài thang).
- Trạng thái (màn `h-tabs`): selected, default, hover, focus-visible (vòng accent), disabled (nền trắng, viền border, chữ muted-light).
- `role="tablist"`/`tab`/`tabpanel`, `aria-selected`, `aria-controls`; Tab vào tab đang chọn, ←/→ đổi tab, Home / End; panel ẩn `hidden`; đổi tab không đổi URL, focus ở lại tab. Code `.featured-collection__tab`.

Phân vai Tab / Chip / Button tertiary (sổ 21/11, components-09; màn `h-tabs`). Ba thành phần cùng nền alt, bo 4; hình Tab và Chip giữ, phân biệt bằng vai trò, cỡ chữ và vị trí:

| Component | Làm gì | Markup | Bàn phím | Đặt ở đâu | Hình |
| --- | --- | --- | --- | --- | --- |
| Tab `.tab` | Đổi panel trong cùng vùng; luôn có đúng 1 tab đang chọn | `role="tablist"` › `role="tab"` + `aria-selected`, `aria-controls` | Tab vào tab đang chọn; ← → đổi tab; Home, End | Ngay trên vùng nội dung nó điều khiển (featured collection, search results) | 16/500, padding 28, cao 44 / 40 từ 80rem |
| Chip `.chip` | Lọc hoặc gợi ý: bật / tắt nhiều chip cùng lúc, hoặc là link tới kết quả | `<button aria-pressed>` · `<a>` · `.chip--remove` có × | Mỗi chip một điểm Tab; Enter, Space | Trong `.chip-list` tự xuống dòng: bộ lọc đang áp, popular searches | 14/500, padding 16, cao 44 / 40 từ 80rem |
| Button tertiary `.button--tertiary` | Thực hiện một hành động phụ cạnh nút primary; không có trạng thái "đang chọn" | `<button>` · `<a class="button">` | Enter, Space | Card, quick view, dòng gợi ý; nhãn sentence case mở bằng động từ | 16/600, cao 48, viền muted-light; small 14/600 cao 44 |

- Dấu hiệu phân biệt bắt buộc: tertiary small (44, 14/600) gần giống chip (44, 14/500). Khi đứng cùng vùng với chip thì thêm icon 16 trước nhãn, hoặc tách sang hàng riêng.
- Không dùng tab để điều hướng sang trang khác; không dùng chip làm nút hành động ("Add to cart" dạng chip).

## 8. Badge

| Badge | Nền / chữ | Tỉ lệ | Khi nào |
| --- | --- | --- | --- |
| −N% | sale / trắng | 6.38 | compare_at_price > price |
| New | badge-new / trắng | 4.57 | tag `new` |
| Sold out | foreground / trắng | 17.4 | mọi variant hết hàng |
| Tag bài viết | trắng, viền border / foreground | 17.4 | tag đầu của article |
| Rating | trắng, viền alt, sao rating + chữ foreground | 17.4 | có metafield rating |

Tag bài viết trung tính (sổ 21/11, ES1-T567; THAY ngoại lệ components-12): `.badge--tag` nền `--color-background`, viền 1px `--color-border`, chữ `--color-foreground`. Chuẩn: Polaris Badge, màu chỉ trạng thái, không phân danh mục; nhãn không mang trạng thái dùng tone trung tính. Trên panel tối dùng `.badge--outline`. Accent chỉ còn ở eyebrow và phần nhấn heading (role Brand, sổ 09/11) và warning (`--color-warning`). Màn `h-badge`, `h-article`.

Pill cao 28, padding 12, 13/600, bo pill. Ưu tiên góc: Sold out > −N% > New. Phần trăm giảm viết dấu trừ U+2212 ("−24%"), không dùng dấu nối "-" (CTO 21/11 lượt 2); Cần FE: chuỗi badge trong code. Biến thể viền trên nền tối `.badge--outline` chỉ cho gift card ("Gift card", "Expired", V63). Không badge có chấm, cao 30, chữ 14 (V33: dùng badge tag chuẩn).

Sold out một quy tắc (V67): card/dòng có ảnh = badge Sold out + ảnh 0.6; dòng không ảnh (gợi ý chữ) = "· Sold out" 14 muted sau giá; nút = primary disabled nhãn "Sold out"; dòng tồn = chấm muted + "Sold out" (`.stock-line--out`). Rating có chữ ẩn "out of 5 stars". Code `.product-card__badge`, `.product-card__rating`, `.article-card__tag`.

## 9. Card sản phẩm

Màn `h-product`. Snippet `product-card`. Dữ liệu động (sổ 07/11).

Anatomy: media 1:1 nền cream bo 12, KHÔNG viền, ảnh `contain` + `mix-blend-mode: darken` · hàng badge padding 16 (8 dưới 64rem), trái badge, phải rating · tiêu đề Inter 16/500 lh 24 ls −0.01em · giá (sale đỏ 16/500 + giá gạch 14 muted, cách 8) · swatch.
- Khoảng: media → tiêu đề 8, tiêu đề → giá 4, giá → swatch 8; swatch 32 × 16 bo 8, cách 4.
- Kích thước: 152 / 232 / 292 / 336.
- Hover: card nhấc 4px, ảnh scale 1.04 (hoặc ảnh 2), tiêu đề gạch chân. Focus (V12): vòng accent 2 offset 8 quanh cả card (`:has(a:focus-visible)`), không outline trên chữ tiêu đề.
- Swatch card (V22, V43): không có trạng thái chọn (không viền accent); ≤ 4 màu hiện hết, > 4 màu hiện 3 + "+N" (`.swatch-more`, VP2). Ảnh luôn `contain` trong khung bo 12 kể cả ảnh ngang (V49).
- ĐỀ XUẤT swatch (câu CTO 2): swatch trên card là chỉ báo, `aria-hidden`, không bấm, không focus; tên link đọc thêm ", 3 colors". Lý do: swatch 32 × 16 cách 4 không thể thành vùng chạm 44 trên mobile (sổ 09/11) mà không phá bố cục; chọn màu ở trang sản phẩm / quickview. Desktop rê chuột lên swatch đổi ảnh card là tăng cường, không bắt buộc.
- Hết hàng: badge Sold out, ảnh opacity 0.6 (05 §3), giá giữ. Không ảnh: placeholder SVG `--color-muted-light` trên cream. Tên dài: hiện đủ, xuống dòng, không cắt (yêu cầu Shopify §7, 11/11): product.title not truncated; card cùng hàng căn đỉnh, giá theo ngay dưới tên. Đang tải: §18.

A11y + Lighthouse: một link (tiêu đề, `::after` phủ card), ảnh alt = alt Shopify hoặc tên sản phẩm, `<img>` có width/height, chỉ hàng đầu collection không banner được eager, giá có chữ ẩn "Sale price"/"Regular price".

## 10. Card bài viết

Màn `h-article`. Code `.article-card`. Ảnh 3/4 phủ kín bo 16 (`--radius-panel`) · gradient tối 50% → đáy · tag trung tính (nền trắng, viền border) phải trên cách 12 · tiêu đề Inter 700 18/28 trắng hiện đủ, không cắt (yêu cầu Shopify §7, 11/11) · meta 14/500.
- Hover: nhấc 6px + bóng, ảnh scale 1.04, tiêu đề gạch chân. Focus outline accent offset 2 (trắng trên nền tối). Không ảnh: `.article-card--no-image`, nền dark (17.4), không gradient.
- ĐỀ XUẤT: gradient bắt đầu 50% (code 63.72%) để tiêu đề 3 dòng luôn trên vùng tối (06; 14 #290D). Ảnh `alt=""`, tên đọc từ tiêu đề.

## 11. Hàng ngang + thanh tiến trình

Sổ 09/11: next/back ở đầu khối, thanh tiến trình mảnh, không thanh cuộn trình duyệt, mobile ẩn nút và vuốt.
- Header khối `1fr auto`, nút căn đáy với tiêu đề, cách 8.
- Track `scroll-snap-type: x mandatory`, lộ card kế (15 §5).
- Thanh tiến trình cao 4 bo pill (`--progress-height`; sổ 09/11 thanh mảnh, V06; trên lưới 4px), cách hàng 32, nền border, thumb foreground; trên nền tối nền trắng 12% + thumb trắng. `aria-hidden`.
- Trên nền tối ("Browse categories" của trang chủ nằm trên dải #1A1A1A): eyebrow xám, chevron trắng, hover cam.
- Không JS: hàng vẫn cuộn tay (`scroll-buttons:not([data-enhanced])`). Code `scroll-buttons`, `.carousel-nav`, `.carousel-progress`.

## 12. Input và form lỗi

Nguồn: 04 §5, 05 §4–5.
- Label 14/600 phía trên cách 8 · `*` đỏ + `required` · input/select/textarea · gợi ý 14 muted · lỗi 14/500 `--color-critical` + icon 16.
- Input cao CỐ ĐỊNH `--control-height` (`block-size`, V11), padding 16, bo `--radius-input`, chữ 16/400. Lưới form `align-content: start` để ô cạnh ô lỗi không cao lên. Compact 44 `.field__input--compact` (ô tìm nước, khoảng giá). Textarea 144; compact 96 chỉ ghi chú đơn mini cart (V50, V70). Select có chevron; mở = listbox §30.10.
- Viền: nền sáng `--color-muted-light` (5.33), nền tối `--color-muted-on-dark` (6.11) (sổ 09/11). Hover foreground (tối: trắng). Focus viền accent + outline 2px offset −1 (tối: trắng).
- Lỗi: hiện khi rời trường hoặc submit; viền `--color-critical` 2px; câu nói cách sửa (khuôn câu: `docs/design/content.md` §3); `aria-invalid` + `aria-describedby`. Trên nền tối chữ lỗi trắng (§4).
- Focus khi form lỗi (sổ 21/11, components-10; màn `h-form` bảng "Lỗi form: focus đi đâu"). THAY quy tắc cũ "focus trường lỗi đầu":

| Khi nào | Hiện gì | Focus | Đọc lên |
| --- | --- | --- | --- |
| Rời một ô đang sai | `.field__error` dưới ô, viền critical 2px, `aria-invalid` | Không chuyển: người dùng đi tiếp | Khi quay lại ô, đọc lỗi qua `aria-describedby` |
| Submit, form có từ 2 trường, có ít nhất 1 lỗi (kể cả chỉ sai 1 ô) | Khối tóm tắt `.form-message--error` đầu form: tiêu đề nêu số trường lỗi ("Check 1 field", "Check {n} fields") + danh sách `.form-message__list`, mỗi lỗi một link `<a href="#id-trường">` | Chuyển tới khối tóm tắt (`tabindex="-1"`, vòng focus accent 2px offset 2) | `role="alert"` đọc tiêu đề và danh sách |
| Bấm một link trong tóm tắt | Cuộn tới trường, lỗi của trường vẫn hiện | Vào đúng ô nhập đó | Nhãn + lỗi của ô |
| Submit, form 1 trường (newsletter, password) | `.field__error` dưới ô; không cần khối tóm tắt | Về chính ô đó | Lỗi qua `aria-describedby` |
| Submit thành công | `.form-message--success` thay chỗ khối lỗi | Chuyển tới thông báo thành công (`tabindex="-1"`) | `role="status"` |

  - Link trong tóm tắt: chữ foreground 500 gạch chân 1px, cao tối thiểu 44 dưới 80rem (`--touch-target`), 24 từ 80rem (`--touch-target-min`), cách nhau 4; dạng "Tên trường: cách sửa" ("Email: enter an email like name@example.com").
  - Điều kiện tính theo SỐ TRƯỜNG CỦA FORM, không theo số trường đang lỗi: form có từ 2 trường thì luôn focus khối tóm tắt, dù sai 1 hay nhiều ô (contact 3 trường chỉ sai email: vẫn focus khối tóm tắt "Check 1 field", khớp SRS TE-12 AC4). Chỉ form 1 trường mới focus về ô.
  - Tóm tắt phải nêu số trường lỗi và từng trường; không chỉ ghi "Check the form" hay "Check the recipient details". Không nhảy focus thẳng vào trường lỗi đầu ở form có từ 2 trường.
  - Áp dụng: contact (page.md §6 S2, SRS AC4: đã đúng), gift card recipient (product-shopify-features.md §6, SRS AC6: tóm tắt "Check {n} fields"), bình luận bài viết (SRS AC12), mọi form từ 2 trường. Newsletter footer, newsletter popup, password: form 1 trường, focus về ô (SRS TE-1 AC12, AC7 giữ nguyên).
  - Chuyển focus là JS (việc BE). Không JS: Shopify tải lại trang, khối tóm tắt render sẵn ở đầu form.
- Disabled: nền alt, viền border, chữ muted-light. Thành công: hộp viền trái 4px `--color-success` + icon, `role="status"`. Cảnh báo (đã tự chỉnh, vd số lượng bị đổi): `.form-message--warning`, thanh + icon `--color-warning`, chữ foreground.
- Checkbox/radio 20, cả nhãn bấm, hàng 44, `accent-color: var(--color-accent)`; trạng thái: chưa chọn, chọn, focus, disabled (chữ muted-light), lỗi (viền `--color-critical` + câu lỗi) (V10). Form 2 cột từ 48rem, cách 24.
- Select nhãn nổi 12px trong ô (collection/search "Sort by") không thuộc DS (V47): nhãn 14 trên ô hoặc ẩn trực quan.

Lighthouse: `<label for>` thật, `autocomplete`, không chặn dán, không placeholder thay label, nút không ghi "Submit".

## 13. Accordion

Icon +/− 24 (`--icon-size-lg`) bên trái, cùng màu chữ câu hỏi (mục đóng `--color-muted` 8.45 trên trắng, 7.73 trên cream; mục mở `--color-foreground`), KHÔNG cam; gạch 1px border; câu hỏi 18/600 (16 dưới 80rem). Icon đặt trái (Thiết kế; 15 §6 đặt phải). Icon đổi + → − khi mở, không xoay. Hover (05 §3): hover câu đóng thì chữ và icon foreground; focus outline accent quanh summary. `<details>/<summary>`, mở sẵn mục đầu, cho mở nhiều mục; hàng ≥ 56; nội dung thụt 40, chữ muted; `--motion-accordion`. Không giấu phí ship, điều kiện KM. Code `.faq-item`, `.site-footer__disclosure`.

## 14. Dropdown và mega menu

Theo 14 §1, 05 §2. Chỉ từ 80rem (menu ngang chỉ có từ 80rem; < 80rem dùng drawer §15).
- Header giữ tối khi mở; mục đang mở trắng 100%, chevron xoay; trang hiện tại vẫn gạch chân. Thay nội dung "header chuyển trắng khi mở" trong `docs/ui-spec/navigation.md` (ES1-T260) cho khớp sổ 10/11.
- Dropdown (Collection): panel trắng, viền border, bo 12, bóng raised, rộng ≥ 224, link 44 padding 24, hover chữ accent. Code `.site-header__submenu`.
- Mega (Shop): full bề ngang ngay dưới header (top 80), nền trắng, padding 40; 2–3 cột link cao 44 (`--touch-target`, trước 40; sổ 21/11) (tiêu đề 14/600 uppercase muted) + 1 ô ảnh (lazy, tải khi mở, sổ 09/11). Link đầu cột "View all products". Scrim 50% phía dưới.
- Mở: hover hoặc click/Enter; đổi mục không chạy lại hiệu ứng; đóng Escape, rời chuột, click ngoài. 250ms drop 8px.
- A11y: `<details><summary>` hoặc `<button aria-expanded aria-controls>`; tiêu đề cột không dùng `<h*>`.

## 15. Drawer

15 §2, 14 §3; code `.site-header__drawer`, `.cart-drawer__dialog`.

| Drawer | Cạnh (class kit) | Rộng 360 / 768 / 1280+ | Nội dung |
| --- | --- | --- | --- |
| Menu | inline-start (`.drawer--start`) | 90% / 420 / — | menu 2 cấp, account, localization |
| Filter | inline-start (`.drawer--start`) | 90% / 420 / 420 | nhóm filter, Apply + Clear ở chân |
| Cart | inline-end (`.drawer--end`) | 90% / 420 / 480 | dòng hàng, tổng, Checkout |
| Search | inline-end (`.drawer--end`) | 90% / 420 / 480 | ô tìm, gợi ý, kết quả nhanh |

Gọi cạnh theo inline-start / inline-end, không gọi "trái / phải" (sổ 21/11, foundations-17): ở LTR inline-start là bên trái, ở RTL là bên phải, drawer tự lật theo `dir` (§34). Spec trang còn ghi "drawer trái / phải" thì đọc là inline-start / inline-end.

- Cart drawer (G3, V13): header "Cart" + pill số món + ×; chân là panel tối nổi `.overlay__footer--panel` (lùi 16, bo 16, padding 20, `--panel-muted`, `--panel-saving`): Subtotal, giảm giá, Total, Checkout, link "View cart". Menu drawer: chân là hàng localization gộp (LC1) + "Sign in" secondary có icon.
- Header drawer 72 (tiêu đề heading 22–28, × 48 cách mép 12) · body cuộn riêng (`overscroll-behavior: contain`) · footer dính đáy (nút chính full width) · scrim `--overlay-scrim`. Nền drawer trắng (header trang tối không lặp vào drawer).
- Cao toàn màn; mobile 90% để chạm scrim đóng. Cấp 2 trượt ngang, Back nhỏ hơn × (14 §3).
- Mở `--motion-base` 250 `--ease-out`, đóng `--motion-fast` 150 (sổ 21/11, §19: thời lượng theo token); chỉ transform + opacity. Đóng: ×, Escape, scrim; trả focus.
- A11y: `<dialog>` + `showModal()`, `aria-labelledby`; mở thì focus vào tiêu đề drawer (đích `aria-labelledby`), không vào × (CTO 17/11, ADR 0007 #5); ngoại lệ drawer Search: focus ô tìm (predictive-search §4, SRS TE-8 AC9); khoá cuộn. Không JS: menu `<details>`, cart link `routes.cart_url`. Ảnh trong drawer lazy, có width/height.

## 16. Dialog và bottom sheet

15 §1–2, sổ 09/11 (quiz popup, mobile bottom sheet); code `.quiz__dialog`.

| Cỡ | ≥ 768 | < 768 |
| --- | --- | --- |
| S (xác nhận, chọn variant) | 480 | bottom sheet |
| M (quick view, ask a question) | 720 | bottom sheet |
| M-wide (quick view từ 80rem, V69) | 960 | bottom sheet |
| L (kết quả quiz, lightbox) | 1120 | bottom sheet |

- ≥ 768: giữa màn, bo 20 (`--radius-dialog`, V04), padding 32 (48 từ 1280), cao ≤ `min(860, 100dvh − 48)`, × 48 cách góc 24.
- < 768: dính đáy, rộng 100%, cao ≤ 88dvh, bo 2 góc trên, thanh kéo 40 × 4, × cách góc 12, vuốt xuống đóng; nút xếp dọc, chính dưới cùng.
- Tiêu đề h2 heading 800 (28–40), chừa chỗ ×; popup marketing dùng Sofia 700 (marketing-popups). Popup marketing < 50 từ. Hàng nút phải, cách 32, gạch trên. Thứ tự (V66): secondary rồi primary (primary cuối, bên phải); < 768 xếp dọc, primary trên (DOM giữ secondary trước, `column-reverse`). Popup marketing dùng text link thay secondary cho nút từ chối ("No thanks", "Keep shopping"), không confirmshaming. Tiêu đề sentence case ("Choose a color", "Cart"; CTO 21/11 lượt 2); HOA do CSS (`.dialog__title--caps`) chỉ popup marketing, chữ nguồn vẫn sentence case (bản sắc thương hiệu, CTO 21/11 lượt 2; V71 / V75). Icon trạng thái tròn 72, icon 32 (`.status-icon`), như empty state.
- Motion: mở `--motion-base` 250 fade + nhấc 24 + scale 0.97; đóng `--motion-fast` 150; mobile trượt từ đáy (sổ 21/11, §19: thời lượng theo token).
- Quy tắc: một lớp một lúc, hàng đợi: popup đang hiện đóng thì popup kế mới hiện, nghỉ 3 s giữa hai popup tự mở (sổ 10/11 MK3, MK4); thẻ big offer đang mở thì popup tự mở chờ (MK5); mỗi popup tự mở tối đa 1 lần/phiên, cộng số ngày theo setting (không phải "1 popup/phiên" cho cả theme); không mở lúc tải trang (chờ thời gian/cuộn/ý định rời, sổ 09/11); không ở 404; không confirmshaming (15 §1). Chi tiết hàng đợi: marketing-popups.md §1.2; thứ tự lớp và vùng đáy: layers.md (§23).
- Ngoại lệ popup marketing (sổ 10/11 MK1, MK3, MK4; ghi nhận 21/11, components-07): nguyên tắc chuẩn (Polaris, Carbon) là modal chỉ mở do người dùng. Ba popup marketing (newsletter, before you leave, big offer) mặc định bật và TỰ MỞ: đây là ngoại lệ đã chốt, không đảo. Rào bắt buộc: không mở lúc tải trang; mỗi lúc 1 popup (hàng đợi); nghỉ 3 s giữa hai popup tự mở; mỗi popup tự mở tối đa 1 lần / phiên; không ở 404; không confirmshaming. Mọi dialog khác (quick view, xác nhận, chọn variant, quiz, pickup) chỉ mở sau thao tác người dùng; không thêm popup tự mở thứ tư. Chú thích cùng nội dung ở màn `h-dialog`.
- A11y: `<dialog>` + `showModal()`, `aria-labelledby`, Escape; mở thì focus vào tiêu đề (đích `aria-labelledby`), không vào × hay phần tử đầu (CTO 17/11, ADR 0007 #5; SRS TE-10 AC12); trả focus.

## 17. Toast

Sổ 09/11 đã chốt màu và 4 loại; sổ 21/11 (components-06, foundations-07) thêm quy tắc chọn mẫu, giới hạn tiêu đề, và đổi sang alias trạng thái (giá trị màu giữ). Vị trí: mobile đáy cách 16 full width; ≥ 768 góc dưới inline-end cách 24, rộng 400; `position: fixed` (0 CLS). Thanh màu 4px · icon 20 · tiêu đề 16/600 + mô tả 14 · nút đóng 44 có tên riêng ("Dismiss: Added to cart"). Nền trắng, viền border, bóng raised.

| Loại | Thanh + icon | Icon | role | Tự ẩn |
| --- | --- | --- | --- | --- |
| info | `--color-muted` | i | status | 6s, dừng khi hover/focus |
| success | `--color-success` (= badge-new) | check | status | 6s, dừng khi hover/focus |
| warning | `--color-warning` (= accent) | tam giác ! | alert | không, đóng tay |
| error | `--color-critical` (= sale) | ! tròn | alert | không, đóng tay |

Màu chỉ là tín hiệu phụ, loại đọc từ icon + chữ. Tối đa 3 toast chồng.

Chọn mẫu thông báo (sổ 21/11; màn `h-toast` bảng "Chọn mẫu thông báo"):

| Tình huống | Mẫu | Ví dụ |
| --- | --- | --- |
| Xác nhận ngắn sau thao tác thành công, tin trung tính | toast success / info, `role="status"`, tự ẩn 6s | "Added to cart", "Link copied", "Filters updated" |
| Lỗi tại chỗ: trường sai, submit form, 422 thêm giỏ, khối không tải được | `.field__error`; `.form-message--error` (thêm `--inline` dưới nút / dòng); `.alert` | "Enter an email like name@example.com." |
| Cảnh báo tại chỗ: số lượng bị đổi, gần hết hàng | `.form-message--warning` (thêm `--inline` trong dòng giỏ) | "Quantity changed to 2. Only 2 left." |
| Thao tác nền ngoài tầm nhìn thất bại hoặc cần lưu ý (mất kết nối, đồng bộ giỏ, thêm giỏ từ thanh dính khi form khuất) | toast error / warning, `role="alert"`, đóng tay | "Connection lost", "Price updated" |

- Toast error / warning KHÔNG dùng cho lỗi trường, lỗi submit hay 422 ngay tại nút: các ca đó theo §18 "Chọn component lỗi" (V45).
- Giới hạn độ dài: tiêu đề toast success ≤ 3 từ VÀ ≤ 24 ký tự (1 dòng ở 360); mô tả mọi toast ≤ 2 dòng. Đạt: "Added to cart" (13), "Discount applied" (16), "Link copied" (11). Không đạt: "Your item has been added to the cart successfully" (9 từ, 49 ký tự). Chi tiết (tên sản phẩm, giá) đặt ở dòng mô tả.
- Tiêu đề toast và tiêu đề alert viết sentence case ("Added to cart"): ĐÃ CHỐT sổ 21/11 (ES1-T567). Chuẩn: Polaris toast success ≤ 3 từ; mô tả ≤ 60 ký tự (Fluent 2). Đệm dọc 12 + dòng 14/20 = 44.

## 18. Trạng thái rỗng, lỗi, đang tải

Theo 05 §6–7, 14 #928M.
- Đang tải: spinner thay nhãn nút và skeleton thay nội dung chỉ hiện sau ngưỡng chung 500 ms; chỉ báo nhỏ tại chỗ (spinner 20 cạnh số kết quả) được hiện ngay (§18.1). Skeleton `--color-background-alt` đúng kích thước nội dung (card: media 1:1 + 2 dòng 14, dòng 2 rộng 40%), shimmer 1 vòng `--motion-hero` (1400) `linear`, tĩnh khi giảm chuyển động; vùng đổi `aria-busy` + `role="status"` + spinner 24. Không làm mờ chữ (Lighthouse color-contrast tính opacity).
- Rỗng (V54), một component 3 biến thể: `.empty-state` trong trang (không khung: blog không bài, search S6), `--framed` trong khung viền bo 12 (giỏ trống, lọc rỗng), `--compact` cho panel hẹp (popup tìm, drawer: căn trái, icon 24 inline, tiêu đề 16/600, nền alt bo 12). Slot phụ `.empty-state__slot` cho chip gợi ý / link danh mục. Không dùng bo 24 nền alt cho panel trong trang (V59). Bản giữa: ≤ 512, icon 32 trong tròn 72 nền alt · h2/h3 rõ ("Your cart is empty") · 1 câu gợi ý · primary cụ thể ("Shop bestsellers") + text link phụ. Search không kết quả thêm gợi ý (05 §7).
- Lỗi khối: `.alert` tone error (mặc định): viền 1px `--color-critical`, bo 12, icon 24 `--color-critical`, tiêu đề 16/600, câu xử lý 14 muted, small secondary "Try again", `role="alert"`. Ba tone còn lại (info, success, warning) và cấp trang: §35.
- Chọn component lỗi (V45): trường sai, gồm cả submit form 1 trường (newsletter, password) → `.field__error`, focus về ô; submit form từ 2 trường có ít nhất 1 lỗi (contact, gift card recipient) → `.form-message--error` đầu form có link tới từng trường, focus vào khối tóm tắt (§12); hành động tại chỗ thất bại (422 thêm giỏ PDP/quick view, cập nhật dòng giỏ cart/mini cart) → `.form-message--error.form-message--inline` ngay dưới nút/dòng, `role="alert"`, cùng một kiểu ở PDP và cart; khối không tải được → `.alert`; cảnh báo tại chỗ (số lượng bị đổi) → `.form-message--warning`; thao tác nền ngoài tầm nhìn → toast error / warning (chỉ ca này, §17).
- Spinner 24 mặc định (V61); 20 trong nút; 12 (`.spinner--xs`) chỉ dòng tồn variant picker. Một vòng quay = `var(--motion-hero)` 1400 `linear` cho cả spinner rời và spinner trong nút (khớp `spinner-turn` của theme). Trường: §12. Thao tác nền: toast error. 404: không popup, có search + link trang chủ (TE-9 AC2).

### 18.1 Ngưỡng hiện chỉ báo tải (sổ 21/11, components-14; màn `h-state`; 500 ms, CTO chốt 21/11 lượt 2)

Một ngưỡng cho mọi vùng: 500 ms (Chuẩn: Polaris; CTO 21/11 lượt 2, thay 300 ms từng dùng ở localization.md L9 và collection.md S7). Số ghi ở đây và `docs/tokens.json` `loading.indicator_delay_ms`. Là hằng số hành vi của JS (việc BE), không phải custom property; spec trang trỏ về mục này, không ghi số riêng.

- 0–500 ms: giữ nội dung cũ, khoá thao tác lặp, KHÔNG hiện spinner thay nhãn hay skeleton.
- Sau 500 ms: hiện spinner trong vùng đang tải hoặc skeleton đúng kích thước.

| Vùng | Ngay (0 ms) | Sau 500 ms | Xong |
| --- | --- | --- | --- |
| Nút gửi (Add to cart, Send message) | `aria-busy="true"`, khoá bấm lần hai, giữ bề rộng | Spinner 20 thay nhãn | Nhãn trở lại; kết quả ở drawer, toast hoặc lỗi inline |
| Lọc, sắp xếp collection | Lưới giữ kết quả cũ + `aria-busy`; spinner 20 tại số kết quả (collection.md S7) | Skeleton lưới đúng số cột | Lưới mới, số kết quả đọc qua vùng live |
| Variant picker | Nút mua `.is-pending` (giữ màu, không spinner), giá giữ số cũ | Dòng tồn "Checking availability…" + spinner 12; giá thành skeleton dòng | Giá, tồn, ảnh theo biến thể mới |
| Localization (đổi nước, ngôn ngữ) | Danh sách giữ nguyên, khoá chọn lần hai | Spinner tại hàng vừa chọn (localization.md L9) | Trang tải lại theo lựa chọn |
| Section tải lần đầu (gợi ý, đã xem) | Chỗ trống đã giữ sẵn chiều cao (0 CLS) | Skeleton card | Nội dung, hoặc `.alert` + "Try again" khi lỗi |

- Spinner luôn nằm trong vùng đang tải, không phủ cả trang.
- Chỉ báo nhỏ tại chỗ (spinner 20 cạnh số kết quả) được hiện ngay; spinner thay nhãn nút và skeleton thay nội dung chỉ hiện sau ngưỡng để thao tác nhanh không bị nháy.
- Ngưỡng này khác các độ trễ nhập liệu (gõ tìm kiếm chờ 300 ms rồi gọi, gộp bấm số lượng 300 ms): đó là debounce, ghi ở spec trang.

## 19. Motion

Đủ 8 duration + 3 easing, khớp `snippets/css-variables.liquid` (sổ 21/11, foundations-11; màn `h-motion`). Component không viết thời lượng bằng số; giá trị `0.01ms` trong khối `prefers-reduced-motion` là giá trị tắt, không phải token.

| Token | ms | Vai trò |
| --- | --- | --- |
| `--motion-stagger` | 60 | độ lệch giữa các phần tử vào nối tiếp (× thứ tự): dòng chữ hero, card reveal |
| `--motion-fast` | 150 | hover màu, ra (exit) |
| `--motion-base` | 250 | drawer, dropdown, toast, chevron |
| `--motion-accordion` | 350 | accordion, facet mở / đóng |
| `--motion-enter` | 400 | chữ hero vào (HA1 11/11), phần tử vào lần đầu |
| `--motion-slow` | 500 | card nhấc, ảnh scale, meter |
| `--motion-reveal` | 900 | hiện dần khi cuộn tới, lệch `--motion-stagger` 60 mỗi card · ngoại lệ |
| `--motion-hero` | 1400 | vòng lặp tải: 1 vòng spinner, 1 vòng shimmer skeleton · ngoại lệ |

| Easing | Curve | Vai trò |
| --- | --- | --- |
| `--ease-out` | cubic-bezier(0.22, 1, 0.36, 1) | tương tác người dùng: hover, nhấn, mở drawer / dropdown / toast |
| `--ease-in-out` | cubic-bezier(0.65, 0, 0.35, 1) | chuyển do hệ thống, đổi kích thước: accordion, facet, meter |
| `--ease-expo` | cubic-bezier(0.16, 1, 0.3, 1) | vào màn nhấn mạnh: reveal khi cuộn, dialog, hero |
| `linear` | từ khoá CSS, không phải token | chỉ vòng lặp tải: spinner, shimmer |

Ngoại lệ (sổ 09/11, 21/11): `--motion-reveal` 900 và `--motion-hero` 1400 vượt khung 500ms của Polaris, GIỮ. Chỉ dùng cho hiện dần khi cuộn và vòng lặp tải; phản hồi thao tác người dùng luôn ≤ 500.

Mọi số trong bảng là giá trị của một trong 8 token (fast 150, base 250, accordion 350, reveal 900, stagger 60).

| Thành phần | Vào | Ra | Thuộc tính |
| --- | --- | --- | --- |
| Hover nút, link, tab, menu header | fast 150 – base 250 | fast 150 – base 250 | màu, translate, scale |
| Dropdown / mega | base 250 drop 8px | fast 150 | opacity, translate |
| Drawer | base 250 | fast 150 | translate, scrim opacity |
| Dialog | base 250 | fast 150 | opacity, translate, scale |
| Bottom sheet | base 250 từ đáy | fast 150 | translate |
| Accordion | accordion 350 | accordion 350 | block-size, opacity |
| Toast | base 250 lên 8px | fast 150 | opacity, translate |
| Bóng header khi cuộn | base 250 | base 250 | box-shadow (1 phần tử, không layout) |
| Reveal khi cuộn | reveal 900, lệch stagger 60 mỗi card | không lặp | opacity, translate, clip-path |

Quy về token ở lượt soát ES1-T535 (foundations-11 "thay literal bằng token"): ra 200 → fast 150; dialog / bottom sheet vào 300 → base 250; lệch reveal 80 → stagger 60. Không thêm token.

Chỉ transform / opacity / clip-path (sổ 09/11); reveal 1 lần, chỉ tiêu đề, card, ảnh chính, CTA; `prefers-reduced-motion: reduce` tắt hết. Reveal 900 và accordion 350 dài hơn 15 §3/§6: theo token và quyết định CTO 09/11, giữ.

## 20. Ràng buộc Lighthouse

Chỉ tiêu (sổ 09/11, phạm vi theo sổ 10/11 BGĐ): A11y 100 desktop và mobile ở mọi trang; Performance desktop ≥ 98, mobile ≥ 90 ở mọi trang; SEO 100 đo ở trang chủ, collection, sản phẩm, blog, bài viết, page (cart, search, account, 404, password, gift card không tính SEO vì Shopify chặn index hoặc trả 404/401, nhưng vẫn giữ quy tắc SEO dưới đây); Best Practices 100 do DevOps/QA đo, tách phần theme và phần nền tảng, ngoài phạm vi Designer (thiết kế vẫn giữ các quy tắc BP dưới đây).
- A11y: tương phản theo §2 (không dùng border, accent trên dark, sale trên dark cho chữ nhỏ); mọi nút/link icon có tên riêng; mọi trường có label; một `<main>`, một h1, heading không nhảy bậc (tiêu đề cột menu/footer không dùng `<h*>` nếu lệch bậc); danh sách `<ul>/<ol>`; tablist đủ; dialog có tên; link trong đoạn văn gạch chân; vùng chạm ≥ 24, control mobile ≥ 44, 6 nhóm chính 44 mọi mốc (§1.3); disabled không dùng opacity (§6); swatch card `aria-hidden` (không có control 16px); skip link; không thuộc tính ARIA trên phần tử không role.
- SEO: `<title>` + meta description; link `<a href>` thật; chữ link mô tả đích; ảnh có alt; breadcrumb JSON-LD; canonical (`meta-tags`); chữ ≥ 12px.
- Best Practices: 0 lỗi console; ảnh đúng tỉ lệ và độ phân giải (`image` snippet srcset); không chặn dán; không xin quyền khi tải.
- Performance: 1 ảnh eager + `fetchpriority="high"` mỗi trang (hero, banner, hoặc ảnh sản phẩm đầu); ảnh khác lazy có width/height; ảnh mega/popup tải khi mở; skeleton giữ chỗ; toast, drawer, dialog, header không đẩy layout; tối đa 2 họ font, `swap`; header (gồm noise) + breadcrumb + tiêu đề trang + nút ở critical.css (≤ 10 KB); JS mỗi file ≤ 8 KB, trang ≤ 40 KB; animation chỉ transform/opacity.

## 21. Map sang code hiện có

| Thành phần | Class / file đã có | Thiếu (ticket trang làm) |
| --- | --- | --- |
| Header | `.site-header`, `[data-scrolled]`, base.css 7452–7497 (nền tối, logo 100, gap 40, icon 20/24) | bỏ điều kiện `body:has(.slideshow)` để mọi trang tối; bỏ `[data-header-overlay]` (không đè ảnh); `aria-current` gạch chân; focus trắng |
| Banner trang con | — | `.page-banner` §3.3 |
| Footer | `.site-footer*`, `.site-footer__main` (dải rộng, bo 16, noise) | link policy; viền input 100% muted-on-dark; chữ lỗi trắng |
| Nút | `.button`, `.button--secondary`, `.button--link`, `[aria-busy]` | `:disabled`; cao 48 dưới 80rem |
| Chevron 52, tiến trình | `.carousel-nav__button`, `.collection-list__button`, `snippets/slideshow-icon`, `.carousel-progress`, `scroll-buttons` | — |
| Tab | `.featured-collection__tab` | — |
| Card sản phẩm, giá, badge | `snippets/product-card`, `snippets/price`, `.product-card__*` | swatch `aria-hidden` + số màu trong tên link; ảnh mờ khi sold out; clamp 2 dòng |
| Card bài viết | `.article-card*` | gradient 50% |
| Accordion | `.faq-item`, `.site-footer__disclosure` | — |
| Dropdown | `.site-header__submenu` | mega menu |
| Drawer | `.site-header__drawer*`, `.cart-drawer__dialog` | khung drawer chung, filter, search |
| Dialog | `.quiz__dialog`, `.quiz__dialog-close` | class chung cho mọi popup |
| Breadcrumb, toast, empty, alert, skeleton | — ở vòng 3 (11/11); nay đã có `.breadcrumb`, `.toast`, `.empty-state`, `.alert`, skeleton trong `assets/base.css` | soát theo §5, §17, §18; alert 4 tone và cấp trang §35 chưa có |
| Panel tối | `.cart-summary`; `.bundle-builder__panel` có `--bundle-panel-muted` trắng 60% (base.css 747) | 1 cặp `--panel-muted` 70%, `--panel-saving` cho cart, mini cart, bundle, shop the look, quiz (§2); đổi `--bundle-panel-muted` 60% → 70% |
| Accordion | `.faq-item` | icon +/− `currentColor`, câu đóng `--color-muted` (§13) |

Trạng thái vòng đời của từng component (đề xuất, đã chốt, đã dựng, ngừng dùng): bảng ở §39; cột "Class / file đã có" ở trên là căn cứ cho nhãn "Đã dựng".

Settings merchant: foundation dùng `background_dark_color` có sẵn cho header và footer; thêm 1 theme setting "Popular searches" (§24.1).

## 22. Quyết định CTO đã chốt (10/11)

CTO chốt cả 3 câu theo đề xuất (sổ 10/11: các câu khác vòng 3 chốt theo đề xuất trong spec).
1. Banner trang con (collection, ảnh bìa bài viết): thẻ bo 16 trong container dưới header, lớp tối ≥ 60% (khác hero 30%) để chữ trắng AA với mọi ảnh merchant chọn: có (§3.3).
2. Swatch trên card sản phẩm là chỉ báo không bấm (`aria-hidden`, số màu đọc trong tên link), chọn màu ở trang sản phẩm/quickview: có (§9).
3. Mở mega menu/dropdown header giữ tối, mục đang mở trắng 100% + chevron xoay: có (§14, navigation.md đã theo).

## 23. Thành phần dùng chung ở spec riêng

Tên file cố định; spec chưa có là do ticket khác đang tạo (audit ES1-T283 §3). Trang con và overlay trỏ về các file này, không mô tả lại.

| Thành phần | Spec | Nội dung chính | Ticket audit |
| --- | --- | --- | --- |
| Bộ chọn biến thể | `docs/ui-spec/variant-picker.md` | dựng từ option value (2048 biến thể), 3 trạng thái giá trị, > 10 giá trị hiện 7 + "+N" (hằng chung, sổ 10/11 M5), "Show fewer", đang tải, lỗi "Try again"; PDP, quickview, card | T1 (A1, A2) |
| Phân trang | `docs/ui-spec/pagination.md` | snippet `pagination` chung, nút tròn 52 (§6), trang hiện tại accent, đầu/cuối giữ nút + `aria-disabled`, hiện bằng cặp màu disabled không opacity (sổ 10/11 câu 5, sổ 21/11) | T2 (A3, A4) |
| Lớp và vùng đáy | `docs/ui-spec/layers.md` | thứ tự z và vùng đáy (sticky ATC, cart bar, bundle bar, teaser Big offer, toast, Inbox, banner consent), `scroll-padding` cho header 80 và thanh đáy, danh sách lớp cho hàng đợi popup (§16) | T7 (A15–A17, A22) |
| Countdown "Sale ends in" | `docs/ui-spec/countdown.md` | 1 component cho featured product, PDP, big offer; Compact/Regular theo khung chứa; 3/4 ô; nguồn ngày metafield `custom.sale_ends_at` trước, setting sau (sổ 10/11 câu 2); A11y theo P4 | T8 (A14), ticket này |
| Announcement bar | `docs/ui-spec/announcement-bar.md` | thanh trên header tối 80, link, đóng, rỗng thì ẩn (SRS TE-1 AC4) | T6 (A18) |
| Chọn quốc gia / ngôn ngữ | `docs/ui-spec/localization.md` | 1 nút gộp "USD / EN" ở footer (§4) và drawer menu (§15), popover desktop, sheet mobile, ô tìm khi nhiều nước, ẩn khi 1 nước/ngôn ngữ (SRS TE-1 AC5, AC9) | T6 (A19) |

## 24. Settings dùng chung toàn theme

### 24.1 Popular searches (A23)

Một setting trong theme settings (`config/settings_schema.json`, nhóm "Search"), đọc ở cả search overlay (predictive-search.md §5, trạng thái rỗng và 0 kết quả) và trang search (search.md S1, S2). Bỏ setting cùng tên trong header block và block `search-results`.

| Tên | id | Kiểu | Default | Giới hạn | Info (sentence case) |
| --- | --- | --- | --- | --- | --- |
| Popular searches | `popular_searches` | text | Adjustable bench, Dumbbell, Kettlebell, Resistance band, Training mat | tối đa 5 cụm (05 §4: 3–5 lựa chọn), phân cách dấu phẩy, mỗi cụm ≤ 3 từ; cụm thứ 6 trở đi bỏ qua; rỗng thì ẩn khối "Popular searches" ở cả 2 chỗ | "Up to 5 terms, separated by commas. Shown in the search popup and on the search page before a search and when nothing is found. Leave empty to hide." |

Default: từ chung, mỗi cụm khớp sản phẩm thật trong demo-data (FlexFold Adjustable Bench, Adjustable dumbbell pair, Iron Core Kettlebell 16 kg, Resistance Band Set, Training Mat 12 mm), nên chip nào cũng ra kết quả. Chip là link `routes.search_url?q=`; overlay bấm chip thì chạy gợi ý tại chỗ (predictive-search §4).

## 25. Đề xuất trỏ cho spec ngoài phạm vi ES1-T291 (không sửa ở ticket này)

LỊCH SỬ (ES1-T291, 11/11): số `--panel-saving` 5.64 / #A3BDA4 trong bảng dưới tính theo badge-new cũ #467A48. Từ ES1-T527 V01 badge-new = #4B824D nên `--panel-saving` = #A5C0A6, 5.82:1 (§2); cart.md, index-mobile-a.md đã sửa số theo.

| File | Mục | Sửa |
| --- | --- | --- |
| `search.md` | §4 | bỏ dòng "Popular searches" khỏi settings block `search-results`, ghi "theo foundation §24.1"; §4 dòng chữ mặc định "Iron Core Kettlebell…" bỏ; mockup T256 S1, S2 đổi chip theo default mới khi render lại |
| `marketing-popups.md` | §3, §4 | nhãn "Keep shopping" GIỮ sentence case (§6, ES1-T567); thanh đếm ngược big offer trỏ countdown.md (cỡ Compact, 3/4 ô, nguồn ngày metafield trước); setting "Sale end date" chỉ dùng khi không có metafield; dữ liệu mockup "`default_countdown_end`" → "`custom.sale_ends_at`" |
| `product.md` | §4.2, §18, §5.1 | bảng cỡ countdown trỏ countdown.md §2 (giá trị giữ nguyên = Compact/Regular); §18 "khác nguồn ngày" → "cùng nguồn ngày, countdown.md §4"; "Try again" GIỮ sentence case (§6, ES1-T567) (gộp ticket T1 bộ chọn biến thể) |
| `mini-cart-quickview.md` | §1, §3.1, bảng tương phản | "Show fewer" GIỮ sentence case (§6, ES1-T567); số 6.54 / 5.84 → 6.56 / 5.64 theo §2 (cùng công thức, token badge-new mặc định) |
| `cart.md` | §3 dòng 124–125, bảng tương phản | giữ công thức (đã là gốc); số `--panel-saving` 5.81 (#A5C1A6) → 5.64 (#A3BDA4) vì token mặc định #467A48 |
| `index-mobile-b.md` | §1 Bundle, §9 bảng tương phản, §12 câu 3 | dòng hàng panel #B2B2B2 (5.39) → `--panel-muted` (6.56); dòng giảm giá badge-new 55% (5.41) → `--panel-saving` (5.64) + icon tag; mockup T279 render lại khi chạm khối bundle |
| `index-mobile-a.md` | §6 Quiz, §9.1 dòng "Ghi chú quiz, dòng phụ panel" | trắng 60% (5.27) → `--panel-muted` (6.56); §7 đã sửa trong ticket này |
| `page.md` | aside FAQ | icon accordion theo §13 mới (không cam); PNG T258 render lại khi chạm trang |
| `collection.md` | §9 S7 | (A12, ngoài ticket này) "card cũ mờ 40%" trái §18 "không làm mờ chữ" |

## 26. Quyết định CTO đã chốt 11/11 (theo đề xuất, sổ 11/11)

1. Chữ phụ trên mọi panel tối đổi về trắng 70% (6.56) kể cả chỗ trước đây dùng #B2B2B2 (bundle) và trắng 60% (shop the look, quiz) để một cặp màu toàn theme? Đề xuất: có (§2).
2. "Popular searches" chuyển thành theme setting duy nhất, tối đa 5 cụm, bỏ setting ở header block và block search-results? Đề xuất: có (§24.1).

## 27. Nút và icon có thương hiệu (yêu cầu Shopify Theme Store §4, §7, CTO 11/11)

Nguồn: https://shopify.dev/docs/storefronts/themes/store/requirements ("The branded dynamic and accelerator checkout button colors must not be modified"; Follow on Shop cùng quy tắc; payment icons full color; gift card Apple Wallet) và https://shopify.dev/docs/storefronts/themes/pricing-payments/accelerated-checkout.

| Thành phần | Ai vẽ | Theme được chỉnh | Theme KHÔNG được |
| --- | --- | --- | --- |
| Accelerated checkout PDP (`{{ form \| payment_button }}`) và cart / drawer (`content_for_additional_checkout_buttons`) | Shopify (Shop Pay tím #5A31F4, Apple Pay đen, G Pay đen, PayPal vàng…) | chỉ biến CSS chính thức: `--shopify-accelerated-checkout-button-block-size` (25–55, đề xuất 52 PDP, 48 cart, 44 drawer), `-border-radius` (= `--radius-button`), `-box-shadow` (none), `-inline-alignment`, `-row-gap`, `-button-inline-size` (cart), skeleton (`--color-background-alt`); vị trí, khoảng cách của khối bao | màu nền, màu chữ, logo, viền, filter/opacity, selector vào HTML bên trong (shadow DOM đóng) |
| Nút unbranded "Buy it now" (`.shopify-payment-button__button--unbranded`) | Shopify, không thương hiệu | được theo nút theme (`button--secondary`, product §5) | — |
| Shop Pay Installments (`{{ form \| payment_terms }}`) | Shopify (logo shop Pay tím) | vị trí, cỡ/màu chữ thường của câu | màu logo Shop Pay |
| Follow on Shop (`{{ shop \| login_button: action: 'follow' }}`) | Shopify (nút tím) | vị trí | màu nút |
| Icon thanh toán (`shop.enabled_payment_types` + `payment_type_svg_tag`) | Shopify, FULL COLOR | kích thước, khoảng cách | đơn sắc, grayscale, đổi màu (mockup vẽ full color) |
| Apple Wallet (gift card, `gift-card/add-to-apple-wallet.svg \| shopify_asset_url`) | huy hiệu chính thức Apple | vị trí, cao ≥ 44 giữ tỉ lệ | màu, chữ, vẽ lại nút |

Nền tối (panel #393942, footer, drawer): đặt nút có thương hiệu nguyên màu, không viền/lớp phủ thêm. Mockup minh hoạ bằng màu thương hiệu thật (`kit.css` `.brand-btn`, `.brand-shoppay`, `.apple-wallet`, `.payment-icons .pi--*`), không vẽ nút theo màu theme, không ô nét đứt.

## 28. Rich text chung `.rte` (Shopify §8, CTO 11/11)

Một component cho mọi nội dung merchant: mô tả sản phẩm, mô tả collection, nội dung page, bài viết, block rich text. Thay §4 article.md và §5 page.md.
- Một bản duy nhất trong kit (V53): `.rte` + cột đọc `.reading-column` 720 (45rem) cho article và page. Đoạn 16, lh 1.75 (16/28, `--line-height-reading`), `max-width: 65ch`, khoảng giữa khối 16; không tăng lên 18 ở desktop (article.md dòng 85 sửa theo).
- h2 `--font-size-h2`, h3 `--font-size-h3`, h4 Sofia 700 20/24 (`--font-size-h4`), h5 Inter 600 18, h6 Inter 600 16 uppercase ls 0.04em (6 cấp khác nhau về hình, Shopify §12); khoảng trên heading 48 (h2), 32 (h3–h6), dưới 12.
- Link: gạch chân 1px offset 0.2em, 500; hover accent.
- ul/ol thụt 24, gap 8, marker `--color-muted`.
- blockquote: viền inline-start 4px accent, chữ heading 700 cỡ h3, không nghiêng, không nền, nguồn 14/500 muted. Trích đánh giá nền sand không thuộc `.rte` (page agent dùng blockquote chuẩn).
- Ảnh full cột bo `--radius-card` (`.rte figure { margin: 0 }`, V60), chú thích 14 muted; bảng `.rte table { display: block; overflow-x: auto; }`; `hr` 1px border cách 48.

## 29. Footer: Follow on Shop (Shopify §4, CTO 11/11)

Nút `{{ shop | login_button: action: 'follow' }}` (Shopify vẽ, tím, §27) dưới hàng social media icons, căn trái, cách 16; chỉ hiện khi shop bật Shop. Không đổi màu.

## 30. Component dùng chung bổ sung (ES1-T527)

Tất cả ở `drafts/designer/_kit/kit.css` mục 13b, hình ở `drafts/designer/ES1-T251/foundation.html` (section id ghi trong ngoặc). Trang KHÔNG định nghĩa lại các selector này (V57); phép kiểm đề xuất: grep selector của kit trong `<style>` của file trang = 0.

1. Chip (V41, `h-chip`): bo 4, cùng hình với tab (sổ 20/11 V41); cao 44 / 40 từ 80rem (`--control-height-compact`, `--tab-height-desktop`); 14/500. `.chip` gợi ý (nền alt viền border), `.chip[aria-pressed=true]` chọn được (nền đen), `.chip--remove` bộ lọc đang áp (nền trắng viền đen, × 16, tên ẩn "Remove filter: Color Black"). Trạng thái default/hover/focus/selected/disabled. Bo pill chỉ dành cho variant pill. Chip lọc hoặc gợi ý, không phải hành động và không đổi panel: phân vai với Tab và Button tertiary ở §7. Nhãn dài: hàng chip xuống dòng; chip dài hơn khung thì chữ xuống dòng trong chip (§37).
2. Selectable option (V26, `h-selectable-option`): `.option-card` (hàng) và `.option-card--tile` (thẻ có ảnh) bọc radio/checkbox thật; chọn = viền accent 2 inset + check tròn accent 24. Quiz, bundle, shop the look dùng chung; không nền sand làm trạng thái chọn.
3. Variant picker (V39, `h-variant-picker`): theo variant-picker.md; `.variant-pill`, `.variant-swatch`, `.variant-more`, `.variant-option__error`, `.stock-line`. Dialog "Choose a color", quiz 2F, quick view dùng đúng component này.
4. Quantity stepper (V38, `h-quantity`): `.quantity` − ô + không vạch ngăn, viền muted-light; cao control (PDP, quick view), `--compact` 44 (cart, mini cart, dòng F9). Trạng thái hover, focus, min/max disabled, loading, lỗi quantity rule.
5. Giá + rating (V08, `h-price-rating`): `.price`, `.price--lg`, `.price__from`, `.price__unit`, `.price__save`, `.rating`.
6. Facet group (V42, `h-facets`): `.facet` (details) biến thể accordion cho bộ lọc: tiêu đề 16/600, "N selected", chevron phải, hàng 52; `.facet__range` khoảng giá compact 44. Chỉ trong drawer/cột lọc. Ô màu lọc `.facet-swatch` hết kết quả (input `disabled` hoặc `.is-disabled`): gạch chéo 2px foreground viền trắng xoay −45° qua ô, ô giữ nguyên màu, nhãn hàng `.choice` muted-light (5.33), `cursor: not-allowed`; không làm mờ (sổ 21/11, foundations-12).
7. Collection card (V14, `h-collection-card`): `.collection-card` ảnh 3/2 bo 16, tên Sofia 700 28, số SP 14 muted; `--dark` (Browse categories trên dải tối, focus trắng), `--menu` (mega, 4/3 bo 12, tên 16/600). Đủ default/hover/focus/không ảnh.
8. Link danh mục (V56): `.category-link` thẻ viền bo 12, tên 16/600, số SP 14, mũi tên; search S1/S2 và 404 dùng chung.
9. Input group + search field (V55, `h-input-group`): `.input-group`, `.search-field` (icon trái, nút xoá 44), `.input-group--attached` (email, password). Nút submit luôn primary; chữ từ 48rem, icon dưới 48rem.
10. Listbox option (V68, `h-listbox`): `.listbox__option` hàng 44, hover nền alt, active-descendant nền alt + outline accent inset, hiện tại 600 + ✓. Không viền foreground.
11. Data table (V46, `h-data-table`): `.data-table` (tiêu đề cột nền alt 14/600, ô 14 padding 12 / 16, viền border, cuộn ngang trong `.table-wrap` bo 12), `--striped` (sọc sand, Specifications), `.data-table__row--current` (cream + ✓, volume pricing). Mobile (sổ 21/11, components-16): `.data-table--stack` dưới 48rem biến mỗi hàng thành danh sách cặp nhãn – giá trị (nhãn lấy từ `data-label` của ô, tiêu đề cột ẩn trực quan, hàng hiện tại giữ nền cream + ✓, số căn cuối); `.data-table--stacked` ép dạng danh sách ở mọi mốc (ô hẹp). Mỗi `<td>` của bảng `--stack` phải có `data-label`; tiêu đề cột và giá trị phải có nghĩa khi đứng thành cặp.

    | Loại bảng | Số cột tối đa | Dưới 48rem |
    | --- | --- | --- |
    | Specifications | 2 (tên, giá trị) | `--stack` + `--striped`: danh sách |
    | Volume pricing | 3 (số lượng, giá, tiết kiệm) | `--stack`: danh sách, tiêu đề cột thành nhãn |
    | Size chart | 6 | Giữ bảng, cuộn ngang trong `.table-wrap` có viền; cột đầu là tên cỡ |
    | Bảng trong bài viết `.rte` | 4; nhiều hơn thì bọc `.table-wrap` | Chữ xuống dòng trong ô; bảng đã bọc thì cuộn ngang |

    Không để bảng 2 cột cuộn ngang trong accordion hay ở mobile; không bảng hơn 6 cột; trang không tự đặt `min-width: 0`.
12. Progress meter (V48, `h-progress`): `.meter-box` cream bo 16 + `.meter` cao 8 bo pill track border, fill accent, `--done` `--color-success` (= badge-new); `role="progressbar"` + câu chữ.
13. Thanh dính đáy, teaser, popover (V34, V71, `h-sticky-bar`): `.buy-bar` 72 / 80, z `--layer-bottom-bar`, `--shadow-bar`; `.teaser` pill tối 48 z 15; `.popover-card` bo 12 shadow-raised 400 z 21 (không bo 20/24).
14. Dòng sản phẩm gọn (V30): `.product-row` thumb 56 cream bo 8, tên 16/500, giá; placeholder khi thiếu ảnh.
15. Nhãn nhóm (V76): `.group-label` 14/600 UPPER muted.
16. Panel tối (V25): `.dpanel*`, `.saving` vào kit; dòng giảm giá luôn icon tag + U+2212 + nowrap.
17. Rich text, phân trang, empty state: §28, pagination.md, §18 (đã gom vào kit). `.rte table` rộng hết cột (display table, ô xuống dòng); bảng nhiều cột bọc `.table-wrap`.
18. Bổ sung vòng 2 (kit_gaps các trang, decisions.md CTO 20/11 "Vòng 2"): `.button.is-pending` (VP1, `h-button`); `.alert__actions` + nút Try again small căn trái (`h-state`); `.dialog--s` 2 nút chia đều ≥ 768 (`h-dialog`); `.dpanel--lg` 32/40, `.dpanel__row--plain`, Total đứng đầu không gạch (`h-panel`, `h-drawer`); `.facet-swatch` tròn 24 (`h-facets`); `.data-table--fluid`, `--striped` không min-width, thụt đều khi có hàng hiện tại (`h-data-table`); `.article-card` lề 24 từ 768, meta trắng "·", `.is-hover` (`h-article`); `.field__input--on-dark`, `.search-field--on-dark`, `.search-field__submit` + spinner trong ô (`h-input-group`); `.form-message--warning` (`h-form`); `.drawer-loc` hàng localization cuối danh sách cấp 1 (`h-drawer`); `a.product-row` không gạch chân; `.variant-pill` nowrap; `.badge` không giãn trong grid; `.price--xl` PDP 28/600 (`h-price-rating`); `.sale-countdown*` vào kit (`h-countdown`); helper mockup `.site-header--static`.
19. Breadcrumb (§5): `ol` không `overflow:hidden` (cắt vòng focus); "…" do mục cuối / mục giữa tự cắt.

## 31. Elevation, lớp, motion (V15, `h-elevation-layers`, `h-motion`)

- Bóng: `--shadow-none` (card, panel trong trang), `--shadow-raised` (dropdown, popover, toast, teaser), `--shadow-overlay` (drawer, dialog, sheet), `--shadow-bar` (thanh đáy, hướng lên). Scrim `--overlay-scrim` 50% dark. Không bóng tự chế trong trang, không thêm bậc bóng thứ năm (V15), không dùng bóng để trang trí thứ không bấm được.
- Lớp: `--layer-content` 1, `--layer-sticky` 4, `--layer-bottom-bar` 5, `--layer-header` 10, `--layer-floating` 15, `--layer-scrim` 20, `--layer-overlay` 21, `--layer-toast` 30 (layers.md §1, nay là token trong kit; code theme: FE thêm vào base.css).
- Motion: §19. Khi dựng lại bản vẽ, Designer tạo effect style theo 4 bóng trên (V15).
- Kit không còn bóng viết tay và không còn `z-index` viết số (sổ 21/11, foundations-10): mọi bóng là `var(--shadow-*)`, mọi lớp là `var(--layer-*)`. Cần hơn 1 lớp trong một component thì xếp theo thứ tự DOM, không thêm số.

Component → bậc bóng → lớp (mỗi component một dòng, không tự chọn bậc khác):

| Component | Bóng | Lớp | Ghi chú |
| --- | --- | --- | --- |
| Card, panel, alert, bảng trong trang | `--shadow-none` | Không đặt | Phân tầng bằng nền và viền, không bằng bóng |
| Nút hover · card bài viết hover | `--shadow-raised` | Không đặt | Bóng báo "bấm được"; tắt khi nhấn |
| Header khi đã cuộn | `--shadow-raised` | `--layer-header` 10 | Chỉ thêm bóng, không đổi nền |
| Dropdown, mega menu | `--shadow-raised` | `--layer-header` 10 | Cùng lớp header |
| Listbox, popover card | `--shadow-raised` | `--layer-overlay` 21 | Big offer, localization từ 768 |
| Teaser nổi | `--shadow-raised` | `--layer-floating` 15 | Nằm trên thanh dính đáy |
| Toast | `--shadow-raised` | `--layer-toast` 30 | Sổ 20/11 V15. Polaris đặt toast cao hơn popover một bậc: không đảo, câu hỏi mở cho CTO |
| Thanh dính đáy | `--shadow-bar` | `--layer-bottom-bar` 5 | Bóng hướng lên |
| Drawer, dialog, bottom sheet | `--shadow-overlay` | Top layer; dự phòng `--layer-overlay` 21 | Kèm scrim `--layer-scrim` 20 |
| Badge, gradient, chữ trên ảnh trong card | `--shadow-none` | `--layer-content` 1 | Cần hơn 1 lớp trong component: xếp theo thứ tự DOM |

Bóng viết tay trong code theme → token (Cần FE):

| Trong code theme | Ở đâu | Dùng |
| --- | --- | --- |
| `0 6px 16px` foreground 18% | Nút hover, base.css `.button:hover` | `--shadow-raised` |
| `0 8px 24px` foreground 10% | Testimonial, bundle item hover | `--shadow-raised` |
| `0 18px 40px` đen 18% (qua biến cũ đặt theo giá trị) | Card bài viết hover | `--shadow-raised` |
| chưa có token | Thanh dính đáy | Thêm `--shadow-bar` như kit |
| `--shadow-*`, `--layer-*` khai báo ở khối `:root` của base.css (`--layer-*` dòng 6–13; `--overlay-scrim`, `--shadow-raised`, `--shadow-overlay`, `--radius-dialog` dòng 129–132; `--panel-muted`, `--panel-saving` dòng 134–135) | base.css | Gom về `snippets/css-variables.liquid`, thêm `--shadow-none` |

Đổi 3 bóng về `--shadow-raised` làm bóng nút hover, header đã cuộn, card bài viết hover nhạt và rộng hơn một chút so với trước; hình tĩnh không đổi.


## 32. Kiến trúc token (sổ 21/11, foundations-06, foundations-16; màn `h-token-architecture`; nguồn chuẩn ở §32.3 đã chốt CTO 21/11, ES1-T567)

### 32.1 Ba tầng

Đọc từ trên xuống. Chuẩn: Polaris primitive → semantic → specialty, tên theo vai trò. Merchant đổi setting thì cả ba tầng đổi theo.

| Tầng | Là gì | Ví dụ | Ai đọc |
| --- | --- | --- | --- |
| 1 · Primitive | Giá trị thô theo thang (bội 4px). Nguồn: `:root` của kit.css; theme settings phản chiếu | `accent_color` #C8400E · `--space-md` 16 · `--radius-md` 12 · `--motion-base` 250 · `--icon-size-md` 20 | Tầng 2; component chỉ khi chưa có vai trò |
| 2 · Semantic | Tên theo vai trò, trỏ về tầng 1 | `--color-accent` · `--color-warning` · `--radius-card` · `--shadow-raised` · `--layer-overlay` · `--touch-target` · `--line-height-h1` | Component (mặc định) |
| 3 · Component | Giá trị riêng một component, dẫn xuất từ tầng 2 hoặc là token kích thước của component đó | `--control-height` · `--row-height` · `--round-button-size` · `--progress-height` · `--toast-color` · `--alert-color` · `--tab-padding-inline` · `--thumb-size` | Chỉ component đó |

Chuỗi ví dụ, setting → component:
- `accent_color` → `--color-accent` → `--color-warning` → `--toast-color` → `.toast--warning`
- `card_corner_radius` 12 → `--radius-md` → `--radius-card` → `.product-card__media`
- `space_base` 4 → `--space-md` 16 → `--grid-gap` (768) → `.product-grid`
- `foreground_color` → `--color-foreground` → `--shadow-raised` (12%) → `.dropdown`, `.toast`

Quy ước:
- Component đọc tầng semantic trước; chỉ đọc primitive khi chưa có vai trò (khoảng cách đọc thẳng `--space-*` vì thang khoảng cách không có vai trò).
- Không đọc hex, px thô cho màu, khoảng cách, bo góc, bóng, lớp, thời lượng. Không đọc thẳng setting trong component.
- Không đặt tên biến theo giá trị hay theo nơi lấy giá trị (`--gray-500`, `--black-1a`). Tên = `--<nhóm>-<vai trò hoặc bậc>(-<biến thể>)`: `--color-background-dark-foreground`, `--radius-panel`, `--space-2xl`, `--icon-size-sm`.
- Token tầng component khai báo ở cuối `:root` (dùng chung nhiều chỗ của component, vd `--tab-padding-inline`, `--row-height`) hoặc là custom property cục bộ trong rule của component (`--alert-color`, `--toast-color`, `--thumb-size`, `--ratio`). Khoảng cách của component trỏ về thang; kích thước khai báo px trực tiếp.
- Mỗi giá trị ghi nguồn theo một trong 5 dạng (đầu kit.css): "Chuẩn: Polaris <tên bậc>" · "Chuẩn: <Carbon | M3 | Fluent 2 | Spectrum | Ant> …" · "CTO dd/mm" · "AA: n:1" · "Thiết kế: …". Điều Polaris không nêu (thang chữ, lưới, container, breakpoint có tên, chiều cao control cho storefront) không ghi "Chuẩn: Polaris".
- Thêm token mới thì thêm ở đúng tầng và ở đủ bốn nơi (§32.3).
- Ngoại lệ có tên của quy tắc tên: `--ratio-*` mang chính tên tỉ lệ (4-3, 16-9) vì tỉ lệ có tên là khái niệm của Carbon / M3 / Spectrum, không phải giá trị px; thang kích thước đặt theo bậc (`--size-1000` = 40).

### 32.2 Nhóm token và số đếm

`:root` của kit có 170 custom property (2.1.0, ES1-T573: +20; 150 sau ES1-T567; trước là 134). Cách đếm: dòng khai báo `--*:` trong khối `:root` đầu kit.css, không tính 3 khối `:root` trong media query (ghi đè giá trị, không thêm biến). Cột "Code theme hôm nay" là hiện trạng trên `origin/develop`, phần thiếu là việc FE.

| Nhóm | Kit | Tầng | Code theme hôm nay | tokens.json |
| --- | --- | --- | --- | --- |
| Color | 32 | 22 primitive có setting · 6 alias trạng thái + 4 dẫn xuất (accent-on-sand, panel-muted, panel-saving, overlay-scrim) semantic | 23 biến `--color-*` ở `css-variables.liquid`; 3 dẫn xuất `--panel-muted`, `--panel-saving`, `--overlay-scrim` đang ở base.css; 6 alias trạng thái chưa có | `color`, `color_status`, `color_derived`, `elevation.scrim` |
| Typography | 35 | Primitive (họ chữ 5, cỡ 11, body weight 1, letter-spacing 5) · semantic (12 line-height theo bậc) · `--display-fluid` (2.1.0) | Có 15 / 34 ở `css-variables.liquid`; thiếu `--font-size-eyebrow`, `--font-size-h4`, `--font-body-weight`, 5 `--letter-spacing-*`, line-height từng bậc (h1…h4, eyebrow, title, reading, sm, label, price-lg, display); body đang 1.625, cần 1.5 | `font`, `type_scale`, `line_height`, `letter_spacing` |
| Space | 14 + 8 | 14 bậc primitive · 8 tên cũ là alias (Deprecated 2.1.0) | Chỉ có `--space-1…8`; thiếu bậc 2, 6, 20, 40, 64, 80; `--space-7` (48) cần thêm tên `--space-4xl` | `space.named`, `space.1…8` |
| Radius | 6 + 7 | 6 bậc primitive · 7 vai trò semantic (`--radius-hero` Deprecated 2.1.0) | 4 vai trò (input, button, card, hero) + pill ở `css-variables.liquid`; thiếu xs…xl, `--radius-panel`, `--radius-swatch`; `--radius-dialog` đang ở base.css và là card × 2 = 24 (kit 20, sổ 20/11 V04) | `radius`, `radius.roles` |
| Motion | 8 + 3 | 8 duration primitive · 3 easing semantic | `css-variables.liquid` (đủ) | `motion`, `easing` |
| Shadow | 4 | Semantic | base.css (2 trong 4: raised, overlay); thiếu none, bar | `elevation` |
| Layer | 8 | Semantic | base.css (đủ 8), cần gom về `css-variables.liquid` | `layer` |
| Icon | 4 | Primitive | Chỉ `--icon-stroke-width`, khai báo cục bộ 2 chỗ trong base.css; thiếu `--icon-size-sm` / `-md` / `-lg` | `icon` |
| Size và layout | 15 | Semantic (page width, lề, header, grid, control, touch target, texture) | Có 4 / 15 ở `css-variables.liquid`: `--page-width`, `--page-margin`, `--header-height`, `--touch-target-min`; thiếu 11: `--touch-target`, `--section-gap`, `--heading-gap`, `--grid-gap`, `--grid-columns`, `--control-height`, `--control-height-compact`, `--content-width`, `--band-side`, `--band-inset`, `--dark-texture` | `container`, `layout` |
| Component | 10 | Component (`--tab-padding-inline` 24, `--tab-height-desktop` 40, `--row-height` 52, `--round-button-size` 52, `--count-badge-size` 20, `--progress-height` 4, `--meter-height` 8; 2.1.0: `--logo-width` 100, `--logo-height` 30, `--quantity-compact-width` 130) | Viết số trong base.css (tab đang 28); `--logo-width` đặt inline theo setting | `component` |
| Size scale | 9 | Primitive 2.1.0: `--size-1000…2400` (§1.2) | Chưa có | `size` |
| Aspect ratio | 7 | Primitive 2.1.0: `--ratio-*` (§36) | Chưa có (tỉ lệ viết số trong block) | `aspect_ratio.tokens` |
| Breakpoint | 3 | 48rem, 64rem, 80rem: hằng số trong media query (CSS không cho dùng biến), không tính vào 170 | AGENTS.md | `breakpoint` |

Đối chiếu 21/11 với `origin/develop`: trong 150 token của kit 2.0.0, 66 có ở `css-variables.liquid`, 15 khai báo ở base.css (cần gom), 69 chưa có trong code (17 token thêm ở ES1-T567). 2.1.0 thêm 20 token chưa có trong code: 89 / 170.

Số token màu có setting là 22 (khớp `config/settings_schema.json`, DESIGN.md và màn `h-color`; con số "23" ở bản trước là sai).

### 32.3 Nguồn chuẩn (sổ 21/11, ES1-T567; THAY thứ tự đề xuất của ES1-T535)

Bốn nơi giữ token, nơi đứng trước là gốc của nơi đứng sau:

1. `drafts/designer/_kit/kit.css`: NGUỒN CHUẨN. Token `:root` và component.
2. `drafts/designer/**`: mockup trang (bố cục, thứ tự khối, trạng thái, 4 khổ). Designer dựng lại bản vẽ từ đây.
3. `docs/tokens.json` · `DESIGN.md` · `docs/ui-spec/foundation.md`: bản máy đọc (có `_version`, `_tiers`, `_contrast`) và phần giải thích, chép theo kit.
4. `config/settings_schema.json` · `snippets/css-variables.liquid`: code theme phản chiếu `:root` của kit; mọi token `:root` của theme nằm ở `css-variables.liquid` (không khai báo token ở `assets/base.css`).

- Nơi nào lệch kit thì nơi đó sai và ghi "Cần FE" (hoặc sửa tài liệu); KHÔNG sửa kit ngược theo setting đang lệch.
- `docs/design/decisions.md` ghi quyết định và lý do. Quyết định mới của CTO áp vào kit trước, rồi chép sang ba nơi còn lại trong cùng thay đổi.
- Thêm, đổi tên hoặc đổi giá trị một token là sửa cả bốn nơi trong cùng một thay đổi, kèm dòng changelog và số bản (§40, `CONTRIBUTING.md` mục "Changing the design system").
- Giá trị kit đã có mà code chưa theo (Cần FE, danh sách đầy đủ ở notes ES1-T567): `badge_new_color` #467A48 → #4B824D (V01); `background_alt_color` #F4F4F4 → #F4F4F5 (V18); `--space-4xl` 48 và các bậc 2, 6, 20, 40, 64, 80; line-height thân 1.5 và từng bậc heading; `--band-inset` 64; `--tab-padding-inline` 24; padding section dưới 64rem 48.
- Token chưa có ở nơi 4 mang trạng thái Đề xuất hoặc Đã chốt, chưa phải Đã dựng (§39). Hiện ở trạng thái đó (69 token, đối chiếu `origin/develop` 21/11):
  - Color (6): alias trạng thái `--color-success` / `-critical` / `-warning` (+ `-foreground`).
  - Typography (19): `--font-size-eyebrow`, `--font-size-h4`, `--font-body-weight`, 5 `--letter-spacing-*` (body, label, heading, display, caps), 11 `--line-height-*` (sm, label, title, reading, price-lg, eyebrow, h4, h3, h2, h1, display).
  - Space (14): tên `--space-050…7xl`, trong đó bậc 2, 6, 20, 40, 64, 80 chưa có giá trị tương ứng.
  - Radius (7): `--radius-xs…xl` (5), `--radius-panel`, `--radius-swatch`.
  - Shadow (2): `--shadow-none`, `--shadow-bar`. Icon (3): `--icon-size-sm` / `-md` / `-lg`.
  - Size và layout (11): `--touch-target`, `--section-gap`, `--heading-gap`, `--grid-gap`, `--grid-columns`, `--control-height`, `--control-height-compact`, `--content-width`, `--band-side`, `--band-inset`, `--dark-texture`.
  - Component (7): `--tab-padding-inline`, `--tab-height-desktop`, `--row-height`, `--round-button-size`, `--count-badge-size`, `--progress-height`, `--meter-height`.
  - 2.1.0 (20, ES1-T573, Đề xuất): 9 `--size-*`, 7 `--ratio-*`, `--display-fluid`, `--logo-width`, `--logo-height`, `--quantity-compact-width`.
- Có trong code nhưng sai chỗ (15 token ở base.css, cần gom về `css-variables.liquid`): 8 `--layer-*`, `--shadow-raised`, `--shadow-overlay`, `--overlay-scrim`, `--panel-muted`, `--panel-saving`, `--icon-stroke-width` (cục bộ), `--radius-dialog` (đang 24, đổi 20).
- Phép kiểm CI so 4 nơi (lấy kit làm chuẩn): việc DevOps (notes ES1-T527 V01, V03; notes ES1-T535 lượt 2; notes ES1-T567).

### 32.4 Biến tiền tố cũ đặt theo giá trị → token theo vai trò (Cần FE)

`assets/*.css` dùng 24 biến tiền tố cũ đặt theo giá trị, 91 lần (đếm trên `origin/develop`: base.css 23 biến / 85 lần + aux.css 2 biến / 6 lần; cart, collection, critical, product.css không dùng). `css-variables.liquid` khai báo 28 biến loại này. FE tìm theo giá trị ở cột đầu, thay dần theo bảng rồi xoá cả khối khai báo trong `css-variables.liquid`. Không thêm token màu mới (sổ 20/11 V18). Tên biến đầy đủ: bảng "Tên code còn tiền tố cũ" ở `drafts/designer/ES1-T567/notes.md`.

| Biến cũ (theo giá trị) | Số lần | File | Thay bằng | Ghi chú |
| --- | --- | --- | --- | --- |
| #FFFFFF | 13 | base.css | Nền sáng: `--color-background` · chữ, icon trên nền tối: `--color-background-dark-foreground` · trên accent: `--color-accent-foreground` | Chọn theo vai trò tại chỗ dùng |
| #1A1A1A | 10 | base.css | Chữ: `--color-foreground` · nền tối: `--color-background-dark` | Hai setting khác nhau dù cùng mặc định |
| #EBE6E0 | 6 | base.css | `--color-background-sand` | |
| #B2B2B2 | 5 | base.css | Trên panel #393942: `--panel-muted` (6.56) · trên nền tối: `--color-muted-on-dark` (6.11) | #B2B2B2 không còn là token; chữ chờ hiện trên nền sáng dùng `--color-muted-light` |
| #4D4D4D | 5 | base.css | `--color-muted` | |
| #E5E5E5 | 4 | base.css | `--color-border` | |
| #808080 | 3 | base.css | `--color-muted-light` | Đã là alias; tên sai giá trị (#6B6B6B) |
| #393942 | 3 | base.css | `--color-background-panel` | |
| #999999 · #666666 | 2 + 1 | base.css | `--color-muted-on-dark` | Biến tên #666666 đang trỏ #999999: tên sai giá trị |
| #000000 | 2 | base.css | Gradient card: `--color-background-dark` · bóng: `--shadow-raised` | |
| #1C1C1C | 1 | base.css | `--color-background-dark` | Lệch 2 đơn vị so với #1A1A1A, gộp |
| #F5F5F1 · #F4F4F5 | 1 + 1 | base.css | `--color-background-cream` · `--color-background-alt` | |
| #D9D9D9 | 1 | base.css | Rãnh tiến trình trên panel: component `.meter` (trắng 20%) | Không thêm màu xám mới |
| #333333 | 1 | base.css | Viền ô countdown: trắng 12% trên `--color-background-dark` như `.sale-countdown__unit` | Dẫn xuất, không thêm token |
| Bo 2 · 4 · 8 · 12 · 16 · 18 · 24 | 2 · 2 · 8 · 1 · 15 · 1 · 2 (31) | base.css 25 · aux.css 6 (bo 4: 2 lần, bo 16: 4 lần) | Bảng radius ở §1.2 | 7 biến đang dùng |
| Bề rộng nút hero 233 | 1 | base.css | Bỏ: nút rộng theo nhãn + padding của `.button` | Khoá bề rộng 233 làm tràn chữ khi dịch (§37) |
| #4B824D · trắng 12% · trắng 60% · bo 999 | 0 | chỉ khai báo | Xoá ngay | 4 biến khai báo nhưng không dùng ở `assets/*.css`. FE tìm lại trong `snippets/`, `sections/`, `blocks/` trước khi xoá (Designer chỉ đếm `assets/`) |

## 33. Icon (sổ 21/11, foundations-14; màn `h-icon`)

Một bộ, một kiểu: nét viền (outlined), một màu `currentColor`, nét 1.5 trên khung vẽ 20 × 20, vùng an toàn 16 × 16.

| Token | px | Dùng ở |
| --- | --- | --- |
| `--icon-size-sm` | 16 | Trong dòng chữ 14: lỗi trường, form message, chip, nút small, stepper, nút xoá của ô tìm, dòng giảm giá |
| `--icon-size-md` | 20 | Mặc định: nút, ô tìm kiếm, toast, nút đóng, icon search của header |
| `--icon-size-lg` | 24 | Header (account, cart, menu), alert, empty state compact |
| `--icon-stroke-width` | 1.5 | Mọi icon nét. Icon tô đặc (logo, sao, cờ, chevron 52 của carousel) không đọc token này |

- Class kit: `.icon` (20), `.icon--sm` (16), `.icon--lg` (24), `.icon--directional` (lật ở RTL).
- Không kéo giãn icon ra ngoài ba cỡ. Cần to hơn: đặt icon 24 hoặc 32 trong nền tròn (status icon 72 của empty state, dialog).
- Ngoại lệ kích thước thuộc về component, không thành token (Thiết kế: quang học glyph): chevron menu 9 × 5 và 12 × 7, mũi tên CTA 16 × 14, chevron 11 × 16 trong nút tròn 52, sao 14 × 13, mạng xã hội 28, cam kết ở footer 32.
- Bộ icon đang dùng (24, tên = id trong sprite của mockup): search, bag, user, menu, close, trash, arrow, chevron, plus, minus, tick, check, info, warning, alert, tag, copy, send, image, star, shield, truck, award, refresh. Không vẽ icon mới khi bộ đã có icon cùng nghĩa; không trộn icon nét và icon tô đặc trong một hàng; không dùng emoji làm icon.

Icon dành riêng (một nghĩa, không dùng cho việc khác):

| Icon | Chỉ có nghĩa | Tên truy cập | Lật ở RTL |
| --- | --- | --- | --- |
| search | Tìm kiếm (mở ô tìm, gửi tìm, gợi ý tìm) | "Search" | Không |
| bag | Giỏ hàng, thêm vào giỏ | "Cart, 2 items" | Không |
| close | Đóng lớp phủ, gỡ chip lọc, xoá chữ trong ô tìm | "Close menu" · "Remove filter Color: Black" | Không |
| arrow | Đi tới trang hoặc bước kế (link CTA, link đầu section, thẻ danh mục) | Luôn đi kèm nhãn chữ, icon `aria-hidden` | Có |
| trash | Xoá dòng khỏi giỏ | "Remove Iron Core Kettlebell" | Không |
| chevron trước / sau · back | Chuyển slide, chuyển trang, quay lại cấp trước trong drawer | "Previous" · "Next" · "Back" | Có |
| chevron xuống · plus · minus · tick · info · warning · alert | Mở rộng, tăng, giảm, đã chọn, 3 mức thông báo | Theo control chứa nó | Không |

Icon và nhãn:
- Nút chỉ icon: chỉ cho icon phổ biến (search, cart, close, menu); có `aria-label` nói rõ đối tượng; vùng chạm từ 44.
- Icon mơ hồ hoặc hành động ít gặp (copy, send): luôn kèm nhãn chữ ("Copy code").
- Icon trạng thái (info, warning, alert, check): luôn kèm chữ, icon `aria-hidden`.
- Icon trang trí sau nhãn (mũi tên của "Browse all setups"): `aria-hidden`.

## 34. RTL (sổ 21/11, foundations-17; màn `h-rtl`)

Theme CHƯA bật RTL: chưa có locale RTL, `<html>` chưa có `dir`. Kit và code đã dùng thuộc tính logic (inline-start / end, block-start / end) nên bố cục tự lật khi đổi `dir`. Màn `h-rtl` đặt cùng một bộ mẫu ở `dir="ltr"` và `dir="rtl"`: header, breadcrumb, section header + nút tròn 52, product card (badge, giá), thanh tiến trình, stepper, link mũi tên, back, select, message, nút nhãn dài, drawer `.drawer--start`.

| Phần tử | Ở RTL | Cách làm |
| --- | --- | --- |
| Bố cục, lề, căn chữ, thứ tự cột, vị trí badge, thanh đầu của message | Lật | Tự động nhờ thuộc tính logic; không viết left / right |
| Drawer | Lật | Gọi theo inline-start (menu, filter) và inline-end (cart, search), không gọi "trái / phải" (§15) |
| Mũi tên, chevron trước / sau, back, chevron "vào cấp con" | Lật | `:dir(rtl)` + `scale: -1 1`; chiều trượt khi hover đảo dấu |
| Carousel, thanh tiến trình, slideshow | Lật chiều chạy | CSS: thumb chạy từ inline-start. JS `slideshow.js` phải cuộn theo hướng (việc BE) |
| Chevron của select, vùng chạm nở của link menu | Lật | Rule `:dir(rtl)` trong kit mục RTL |
| Search, cart, close, check, plus, minus, sao, logo, cờ, icon thanh toán | Giữ | Không mang nghĩa hướng |
| Số, giá, mã giảm giá, số điện thoại, email, stepper − số + | Giữ thứ tự chữ số | Trình duyệt xử lý bidi; stepper giữ − bên trái, + bên phải bằng `:dir(rtl) .quantity { direction: ltr }` (kit mục RTL, Cần FE); định dạng tiền và ngày theo locale của Shopify, không tự ghép chuỗi |
| Ảnh sản phẩm, video, bản đồ | Giữ | Không lật nội dung ảnh |

Điều kiện bật RTL (đủ cả 6 mới bật locale RTL):

| # | Điều kiện | Ai làm | Hiện tại |
| --- | --- | --- | --- |
| 1 | `<html dir>` theo locale trong `layout/theme.liquid` | FE | Chưa có |
| 2 | CSS chỉ dùng thuộc tính logic; mọi rule hướng có `:dir(rtl)` đi kèm | FE | Đạt ở phần đã dựng (DESIGN.md Direction) |
| 3 | `assets/slideshow.js` và carousel cuộn theo hướng | BE | Còn cuộn theo LTR |
| 4 | Icon chỉ hướng lật, icon khác giữ (bảng trên, §33) | FE | Đã có cho slideshow, pagination, drawer-loc; kit bổ sung phần còn lại |
| 5 | Font có glyph cho ngôn ngữ RTL (Inter, Sofia Sans Condensed không có chữ Ả Rập, Do Thái) | CTO chốt font, FE cài | Chưa chọn |
| 6 | QA chạy bộ 12 mẫu ở màn `h-rtl` + nhãn dài hơn 50% ở 360 và 1280, không tràn, không lệch focus | QA | Chưa chạy |

- Viết `margin-inline-start`, `inset-inline-end`, `text-align: start`; đặt tên theo start / end; thử mọi component mới ở `dir="rtl"` trước khi trình.
- Không dùng `left`, `right`, `translateX` cố định dấu; không lật logo, số, ảnh sản phẩm; không ghép câu từ nhiều chuỗi dịch (§37).
- Dấu ✓ của hàng hiện tại, listbox vẽ bằng cạnh vật lý (border-bottom + border-left xoay −45°) để KHÔNG lật ở RTL: đây là ngoại lệ có chủ đích của quy tắc "chỉ thuộc tính logic".
- Điều kiện 5 thêm họ font là quyết định thương hiệu (sổ 30/10: 2 họ font): Designer không tự chọn, chờ CTO khi có kế hoạch locale RTL.

Chữ Latin và số trong khung RTL (màn `h-rtl`, ghi chú dưới cặp mẫu):
- Trong `dir="rtl"`, chuỗi Latin có dấu ở đầu hoặc cuối bị trình duyệt đổi chỗ dấu: "−24%" hiện "24%−", "What people are buying?" hiện "?What…", dấu chấm cuối câu nhảy lên đầu. Chuỗi Ả Rập, Do Thái thật không bị.
- Quy tắc cho code (Cần FE khi bật RTL): số có dấu, phần trăm (`−N%` của badge), giá, mã giảm giá, và tên sản phẩm Latin chen trong câu dịch bọc `<bdi>` (hoặc `dir="ltr"` cho ô chỉ chứa số). Không sửa bằng cách đảo ký tự trong chuỗi dịch.
- Mẫu RTL trên màn DS dùng chữ tiếng Anh để so bố cục, đã bọc `<bdi>` cho badge, tiêu đề, câu message. Breadcrumb cắt "…" phía `inline-end`; với tên Latin trong khung RTL phần bị cắt hiện ở đầu tên, tên Ả Rập thật cắt ở cuối như LTR.

## 35. Alert và message (sổ 21/11, components-15; màn `h-alert`; tone warning dùng accent là ĐỀ XUẤT, chờ CTO)

Thông báo đứng yên trong trang. Một component `.alert`, 4 tone đọc role sẵn có qua custom property cục bộ `--alert-color`; không thêm token màu.

| Tone | Class | `--alert-color` | Icon | role |
| --- | --- | --- | --- | --- |
| Info | `.alert--info` | `--color-muted` | info | `status` |
| Success | `.alert--success` | `--color-success` (= badge-new) | check | `status` |
| Warning | `.alert--warning` | `--color-warning` (= accent) | warning | `status` |
| Error | `.alert--error` (mặc định khi không ghi tone) | `--color-critical` (= sale) | alert | `alert` |

| Cấp | Class | Hình | Đặt ở đâu |
| --- | --- | --- | --- |
| Section | `.alert` | viền 1px theo tone, nền trắng, bo `--radius-card` 12, padding 16 / 24, icon 24 cách chữ 12 | Trong section, ngay trên nội dung liên quan |
| Trang (banner) | `.alert.alert--page` | như trên + thanh đầu inline-start 4px theo tone + nền = tone pha 6% với `--color-background` | Ngoài section, ngay dưới header hoặc breadcrumb |

- Anatomy: icon 24 (`--icon-size-lg`, màu tone) · `.alert__body`: tiêu đề 16/600 foreground + 1 dòng 14 muted + tối đa một hành động (nút small hoặc text link, căn trái; nhiều nút thì `.alert__actions`) · nút đóng tuỳ chọn `.alert__close` tròn 44 (`--touch-target`), icon 16, màu muted, hover foreground, tên "Dismiss: {tiêu đề}".
- Màu chỉ ở viền, thanh và icon; chữ giữ foreground / muted. Luôn có icon + tiêu đề nói rõ chuyện gì (màu không là tín hiệu duy nhất).
- Tương phản (tính ở bước dựng màn): chữ muted trên nền pha 6% của 4 tone 7.63–7.88; icon / viền trên nền pha 4.26–7.69 (≥ 3 cho thành phần đồ hoạ, WCAG 1.4.11).
- Mỗi alert một thông tin và tối đa một hành động. Info, warning, error nên có một hành động; success không bắt buộc.
- Error không có nút đóng và không tự ẩn: chỉ hết khi lỗi được xử lý. Info, success, warning được đóng.
- Không xếp chồng quá 1 alert cấp trang; không dùng alert để quảng bá (đó là announcement bar); không nền đặc màu tone.
- Warning dùng accent là mở rộng ngoại lệ accent 09/11 (đã chốt cho Toast; `.form-message--warning` đã dùng): chờ CTO xác nhận cho `.alert`.

Chọn Banner, Inline hay Toast (dựng từ V45, §17, §18):

| Tình huống | Dùng | Ở lại tới khi | Ví dụ |
| --- | --- | --- | --- |
| Chuyện ảnh hưởng cả trang hoặc cả phiên | `.alert--page`, ngoài section | Đóng hoặc hết điều kiện | Lịch giao hàng dịp lễ, tài khoản không tải được |
| Chuyện của một section hoặc một khối | `.alert` trong section | Cùng khối đó | Lưới sản phẩm không tải được, mã giảm giá đã áp |
| Kết quả submit một form | `.form-message` đầu form | Lần submit kế | Tóm tắt lỗi contact, "Message sent" |
| Một trường nhập sai | `.field__error` dưới ô | Sửa đúng | Email thiếu @ |
| Hành động tại chỗ thất bại hoặc bị tự chỉnh | `.form-message--inline` ngay dưới nút / dòng | Thao tác kế | Thêm giỏ lỗi 422, số lượng bị hạ |
| Xác nhận ngắn, hoặc lỗi của thao tác nền ngoài tầm nhìn | `.toast` | Tự ẩn (success, info) · đóng tay (warning, error) | "Added to cart", mất kết nối khi drawer đóng |
| Quảng bá, khuyến mãi | Announcement bar (không phải alert) | Theo cấu hình merchant | Free shipping over $99 |

## 36. Media (sổ 21/11, components-17; màn `h-media`)

Chỉ gom quy tắc đã có (DESIGN.md mục Images, §9, §30.14), không đổi token.

- Mọi ảnh nằm trong khung giữ tỉ lệ (0 CLS), render qua `snippets/image.liquid` (srcset 360 / 720 / 1080 / 1440, `sizes`, focal point).
- `.media`: khung `aspect-ratio: var(--ratio, var(--ratio-1-1))` (custom property cục bộ `--ratio` nhận token `--ratio-*`, vd `style="--ratio: var(--ratio-3-2)"`), bo `--radius-card` 12, nền cream. Mặc định ảnh `cover`; `.media--contain` cho ảnh sản phẩm (contain + `mix-blend-mode: darken` trên cream); `.media--panel` bo `--radius-panel` 16; `.media--dark` nền `--color-background-dark` cho hero, banner, card tối.
- Hai kiểu fit: contain trên nền cream cho ảnh sản phẩm (không cắt mất hàng); cover cho ảnh đời sống (collection, bài viết, hero).
- Placeholder `.media__placeholder`: chưa chọn ảnh (editor) hoặc sản phẩm không ảnh = icon image `--color-muted-light` trên cream (icon rộng 40% khung, tối đa 96).
- Thiếu ảnh hoặc ảnh lỗi trên storefront ở hero, banner, card tối: chỉ nền tối, chữ vẫn đọc được. Luôn giữ khung và nền; không bao giờ hiện icon ảnh vỡ, khung không co lại.
- Đang tải: skeleton cùng tỉ lệ, cùng bo, hiện sau ngưỡng 500 ms (§18.1).
- Bo góc ảnh = bo của khung; không chữ nằm trong ảnh.

Thumbnail `.thumb`: vuông, nền cream, bo `--radius-swatch` 8, ảnh contain. Chỉ 4 cỡ có tên (custom property cục bộ `--thumb-size`):

| Class | px | Dùng ở |
| --- | --- | --- |
| `.thumb--bar` | 48 | Thanh dính đáy |
| `.thumb` (mặc định) | 56 | Dòng sản phẩm gọn (`.product-row`, §30.14) |
| `.thumb--search` | 64 | Gợi ý tìm kiếm, thumb gallery |
| `.thumb--cart` | 80 | Dòng giỏ |

Không ảnh: thumb giữ khung, hiện icon image muted-light. Không thumbnail ngoài 4 cỡ.

Tỉ lệ khung theo vị trí. Chỉ dùng bộ tỉ lệ có tên, không lấy tỉ lệ theo px của một khung cụ thể (sổ 21/11, ES1-T567). Chuẩn: Carbon aspect ratio 1:1, 2:1, 2:3, 3:2, 4:3, 16:9; M3 carousel item 9:16 đến 16:9; Spectrum preview cao tối đa 3:4.

Token tỉ lệ (2.1.0, ES1-T573): `--ratio-1-1` · `--ratio-2-1` · `--ratio-3-2` · `--ratio-4-3` · `--ratio-3-4` · `--ratio-16-9` · `--ratio-9-16` (giá trị `a / b`). `aspect-ratio` trong kit và mockup chỉ đọc `var(--ratio-*)`, ngoại lệ duy nhất `auto` (khung trạng thái rỗng co theo nội dung) và thẻ quà tặng 1.586 / 1 (chưa có token, chỉ ở gift card). Tên là chính tỉ lệ có tên của Carbon / M3 / Spectrum, không phải giá trị px.

| Vị trí | Tỉ lệ | Fit | Bo | Nguồn |
| --- | --- | --- | --- | --- |
| Product card, quick view, PDP gallery, featured product | 1 / 1 | Contain, nền cream | `--radius-card` 12 | Chuẩn: Polaris Image mặc định 1/1 |
| Hero / slideshow, hero mini, ảnh bìa bài viết | 2 / 1 từ 1280 · 4 / 3 ở 768 · 3 / 4 dưới 768 | Cover + focal point | `--radius-panel` 16 (hero trang chủ, hero mini, bìa bài viết; mockup là nguồn chuẩn) · khung popup đọc `--radius-md` 12 (`--radius-hero` Deprecated 2.1.0) · Cần FE: `hero_corner_radius` mặc định 12 → 16 hoặc hero đọc `--radius-panel` | Chuẩn: Carbon 2:1, 4:3 · Spectrum 3:4 ở 360 (khung 360 × 480, sổ 07/11) |
| Collection card | 3 / 2 | Cover | `--radius-panel` 16 | Chuẩn: Carbon 3:2 |
| Collection card trong mega menu, ảnh promo mega, cột ảnh FAQ | 4 / 3 | Cover | `--radius-card` 12 | Chuẩn: Carbon 4:3 |
| Training level card, shop the look, why choose us | 1 / 1 (level card 4 / 3 dưới 768) | Cover | `--radius-panel` 16 | Chuẩn: Carbon 1:1, 4:3 |
| Blog card | 3 / 4 | Cover + gradient tối nửa dưới | `--radius-panel` 16 | Chuẩn: Spectrum preview cao tối đa 3:4 |
| Testimonial card, ảnh trong tiêu đề | 16 / 9 | Cover | card `--radius-panel` 16 (ảnh theo bo card) · ảnh trong tiêu đề `--radius-sm` 8, cao theo em | Chuẩn: Carbon 16:9 |
| Video card dọc | 9 / 16 | Cover | card `--radius-card` 12 | Chuẩn: M3 carousel item 9:16 đến 16:9 |
| Thẻ quà tặng | 1.586 / 1 | Cover | `--radius-card` 12 | Thiết kế: tỉ lệ thẻ ID-1 |
| Khối chưa dựng | Tạm tính | — | — | Chờ Product và Design chốt (ES1-T39) |

Tải và alt: luôn có `width`, `height`; ảnh đầu của hero `loading="eager"` + `fetchpriority="high"`, mọi ảnh khác lazy; alt lấy từ alt của ảnh trong Shopify, ảnh trang trí `alt=""`; ảnh hero ≤ 200 KB WebP.

## 37. Chuỗi dài và bản dịch (sổ 21/11, patterns-17; màn `h-button`, `h-tabs`, `h-badge`, `h-chip`, `h-variant-picker`, `h-content`)

Giả định xấu nhất: chuỗi dịch dài hơn tiếng Anh tới 50%; nhãn ngắn (nút, tab, badge) có thể dài gấp 3. Giới hạn độ dài ở §6, §7, §17 là cho bản tiếng Anh; bố cục phải chịu được bản dịch.

| Component | Khi nhãn dài ra | Màn |
| --- | --- | --- |
| Button | Giãn theo nhãn → hàng nút xuống dòng, rộng 100% dưới 48rem → `.button--wrap` cho chữ xuống dòng trong nút (nút cao lên, chữ căn giữa) | `h-button` |
| Tab | Tab giãn, hàng tab cuộn ngang; không xuống dòng | `h-tabs` |
| Badge | Giãn theo nhãn; dài hơn bề ngang ảnh card thì `.badge--wrap` (tối đa 2 dòng, bo 12 thay pill) | `h-badge` |
| Chip | Hàng chip xuống dòng; chip dài hơn khung thì chữ xuống dòng trong chip | `h-chip` |
| Variant pill | Pill giãn, mỗi pill dài chiếm một hàng | `h-variant-picker` |
| Breadcrumb | Ngoại lệ được cắt "…": mục cuối và mục giữa (tên đầy đủ nằm ở h1 ngay dưới, §5) | `h-title` |

- Không cắt "…", không thu cỡ chữ, không tràn khung cho nút, tab, badge, chip, pill, giá.
- Không khoá bề rộng control theo nhãn tiếng Anh (bỏ biến cũ khoá bề rộng nút hero 233, §32.4); tránh cột hẹp cho nhãn.
- Nút và badge GIỮ `white-space: nowrap` mặc định; xuống dòng là chọn thêm (`.button--wrap`, `.badge--wrap`) ở khung hẹp. Lý do: cho xuống dòng mặc định làm 6 trang mockup có nút sát khung thành 2 dòng (câu hỏi mở cho CTO, notes ES1-T535 lượt 2).
- Mỗi mockup mới thử nhãn × 3 ở 360 trước khi trình.
- Không ghép câu từ nhiều chuỗi ("You have" + số + "items"): dùng một chuỗi có biến (`{{ count }}`) và dạng số ít / số nhiều của locale. Số, tiền, ngày theo định dạng của Shopify.
- RTL: §34. Hướng dẫn chữ: `docs/design/content.md`.

## 38. Khuôn spec component: Dùng khi nào, Nên / Tránh (sổ 21/11, patterns-12)

Mọi component (ở file này, ở spec riêng §23 và trên màn DS) theo một khuôn 6 mục: (1) Dùng khi nào, (2) Anatomy, (3) Variant và trạng thái, (4) Nên / Tránh, (5) Accessibility, (6) Map sang code. Các mục 2, 3, 5, 6 đã có ở mục riêng của từng component; bảng dưới bổ sung mục 1 và 4, rút từ quy tắc đã chốt (không thêm quy tắc mới). Trên màn DS: đoạn mô tả đầu section = "Dùng khi nào", khối Nên / Không nên = mục 4.

| Component (mục) | Dùng khi | Không dùng khi → dùng gì | Nên | Tránh |
| --- | --- | --- | --- | --- |
| Header (§3) | Mọi trang có `layout/theme.liquid` | Password, gift card: không header | Thanh tối 80 + noise, focus trắng, số giỏ trong tên truy cập | Đè ảnh, đổi chiều cao khi cuộn, nền trắng |
| Banner trang con (§3.3) | Collection có ảnh, bài viết có ảnh bìa | Trang không ảnh → tiêu đề trang §5 | Lớp tối ≥ 60%, chữ trắng, ảnh eager | Chữ xám trên ảnh, banner đè header |
| Footer (§4) | Mọi trang có layout chính | — | Lỗi newsletter chữ trắng + icon đỏ trên nền tối | Chữ `--color-sale` trên nền tối, tiêu đề cột bằng `<h*>` lệch bậc |
| Breadcrumb (§5) | Collection, product, article, page | Trang chủ, cart, 404, password: không có | 1 dòng, mục cuối `aria-current`, JSON-LD | Xuống 2 dòng, dòng bắt đầu bằng "/" |
| Button primary (§6) | Hành động chính của section | Điều hướng trong câu → text link | 1 primary mỗi section, ≤ 5 mỗi trang; nhãn sentence case 2–4 từ mở bằng động từ | Hai primary cạnh nhau, nhãn "Submit", disabled bằng opacity |
| Button secondary (§6) | Hành động phụ cạnh primary; trên nền tối `.button--on-dark` | Nút phụ trong card cạnh primary → tertiary | Cách primary 16, mobile xếp dọc | Dùng làm hành động chính |
| Button tertiary (§6) | Nút phụ trong card, quick view, dòng gợi ý | Lọc, gợi ý → chip; đổi panel → tab | Small đứng cùng vùng chip: có icon 16 hoặc tách hàng | Nền xám không viền (đó là disabled); tertiary small không icon sát hàng chip |
| Link CTA, link đầu section (§6) | Dẫn sang trang khác kèm mũi tên | Hành động tại chỗ → button | Nhãn nói rõ đích ("Browse all setups") | "Read more", "Learn more" đứng một mình |
| Nút tròn 52 (§6, §11) | Prev / next của carousel, phân trang | Hành động khác → button | Đầu / cuối giữ nút + `aria-disabled`, cặp màu disabled | Ẩn nút làm nhảy bố cục, mờ bằng opacity |
| Tab (§7) | Đổi nội dung MỘT vùng ngay bên dưới, 2–7 nhóm cùng cấp | Sang trang khác → link / menu; lọc nhiều lựa chọn → chip | Đúng 1 tab đang chọn, phím ← →, hàng cuộn ngang | Tab xuống 2 hàng, tab làm điều hướng |
| Badge (§8) | Trạng thái sản phẩm: −N%, New, Sold out; tag bài viết; rating | Thông báo → alert / toast; danh mục khác → badge trung tính hoặc chữ | 1–2 từ, ưu tiên Sold out > −N% > New | Badge có chấm, cao 30, accent cho danh mục khác ngoài tag bài viết |
| Product card (§9) | Lưới và hàng sản phẩm | Dòng gọn trong drawer, gợi ý → `.product-row` | Một link phủ card, tên hiện đủ, ảnh contain trên cream | Cắt tên sản phẩm, swatch bấm được trên card, viền quanh media |
| Media, thumbnail (§36) | Mọi ảnh nội dung | Icon → §33 | Khung giữ tỉ lệ, width / height, 1 ảnh eager mỗi trang | Ảnh sản phẩm cover, icon ảnh vỡ, thumb ngoài 4 cỡ |
| Collection card (§30.7) | Danh mục: Browse categories, list collections, mega | Link danh mục dạng chữ ở search, 404 → `.category-link` | Ảnh cover 3 / 2 bo 16, đủ trạng thái không ảnh | Bo 24, chữ nằm trong ảnh |
| Article card (§10) | Bài viết trong blog, hàng ngang trang chủ | — | Tiêu đề hiện đủ, gradient từ 50%, `alt=""` | Cắt tiêu đề, tag nền accent (màu không phân danh mục) |
| Hàng ngang + tiến trình (§11) | Video, testimonial, blog, danh mục dạng cuộn ngang | Lưới đủ chỗ → `.product-grid` | Nút ở đầu khối, thanh tiến trình 4, mobile vuốt | Thanh cuộn trình duyệt, nút đặt giữa ảnh |
| Input, select, textarea (§12) | Nhập dữ liệu trong form | Chọn 1 trong vài lựa chọn nhìn thấy → radio / option card | Label thật, `autocomplete`, lỗi khi rời trường, tóm tắt lỗi nhận focus khi submit | Placeholder thay label, nhãn nổi 12px, viền `--color-border` |
| Checkbox, radio (§12) | Bật / tắt một lựa chọn; chọn 1 trong nhóm | Lựa chọn có ảnh, mô tả → option card | Cả nhãn bấm được, hàng 44 | Chỉ ô 20 bấm được |
| Input group, search field (§30.9) | Ô + nút liền nhau: search, email, password | Form nhiều trường → field rời | Submit luôn primary; chữ từ 48rem, icon dưới 48rem | Nút submit secondary, thiếu nút xoá ở search |
| Listbox (§30.10) | Danh sách chọn của select tuỳ biến, localization | — | Hàng 44, hiện tại 600 + ✓ | Viền foreground quanh option |
| Accordion (§13) | FAQ, footer mobile, nội dung phụ gập được | Bộ lọc → facet group; thông tin bắt buộc đọc → hiện sẵn | Mở sẵn mục đầu, cho mở nhiều mục, icon + / − bên inline-start | Giấu phí ship, điều kiện KM; icon cam |
| Chip (§30.1) | Lọc, gợi ý tìm, bộ lọc đang áp | Hành động → button; đổi panel → tab | Hàng chip xuống dòng, × có tên "Remove filter: …" | Bo pill, chip làm nút "Add to cart" |
| Facet group (§30.6) | Nhóm lọc trong drawer / cột lọc | Ngoài bộ lọc → accordion | "N selected", ô màu hết kết quả gạch chéo | Làm mờ ô màu disabled |
| Selectable option (§30.2) | Chọn có ảnh / mô tả: quiz, bundle, shop the look | Chọn biến thể sản phẩm → variant picker | Bọc radio / checkbox thật; chọn = viền accent 2 + check | Nền sand làm trạng thái chọn |
| Variant picker (§30.3, variant-picker.md) | Chọn option value của sản phẩm | Lọc collection → chip, facet | Pill ≥ 56 × 44, > 10 giá trị hiện 7 + "+N" | Swatch card làm control, pill cắt chữ |
| Quantity stepper (§30.4) | Số lượng ở PDP, quick view, cart | — | Compact 44 ở cart, min / max disabled | Vạch ngăn giữa nút và ô |
| Giá, rating (§30.5) | Mọi chỗ hiện giá, đánh giá | — | Chữ ẩn "Sale price" / "Regular price", dấu − U+2212 | Chỉ dùng màu để báo giá sale |
| Data table (§30.11) | Dữ liệu dạng hàng × cột: specifications, volume pricing, size chart | Bố cục trang → grid | 2–3 cột dùng `--stack` dưới 48rem, số căn cuối | Bảng 2 cột cuộn ngang ở mobile, hơn 6 cột |
| Progress meter (§30.12) | Tiến độ tới một ngưỡng: freeship, bundle, quiz | Đang tải → spinner / skeleton | `role="progressbar"` + câu chữ, đạt = success | Chỉ thanh màu không chữ |
| Thanh dính đáy, teaser, popover (§30.13) | Hành động mua luôn trong tầm tay; teaser Big offer | Thông báo → toast / alert | Bóng `--shadow-bar`, lớp `--layer-bottom-bar`; popover bo 12 + `--shadow-raised` | z-index số, bo 20 / 24 cho popover |
| Toast (§17) | Xác nhận ngắn sau thao tác; lỗi thao tác nền ngoài tầm nhìn | Lỗi trường, lỗi submit, 422 tại nút → message tại chỗ (§35) | Tiêu đề success ≤ 3 từ, tối đa 3 toast | Toast cho lỗi form, toast error tự ẩn |
| Alert, banner (§35) | Thông báo đứng yên của trang hoặc section | Kết quả form → form message; quảng bá → announcement bar | Tiêu đề nói chuyện gì, 1 hành động | Chồng 2 banner trang, nền đặc màu tone |
| Drawer (§15) | Menu, filter, cart, search trên lớp phủ cạnh màn | Xác nhận, nội dung ngắn → dialog | Focus vào tiêu đề khi mở, trả focus khi đóng, footer dính đáy | Gọi "trái / phải", cuộn cả trang phía sau |
| Dialog, bottom sheet (§16) | Việc cần tập trung: quick view, xác nhận, quiz | Thông báo không cần quyết định → toast / alert | Chỉ mở sau thao tác người dùng (trừ 3 popup marketing đã chốt), một lớp một lúc | Mở lúc tải trang, confirmshaming, popup tự mở thứ tư |
| Dropdown, mega (§14) | Menu con của header từ 80rem | Dưới 80rem → drawer | Header giữ tối, link 44, ảnh mega tải khi mở | Mở từ 64rem, tiêu đề cột bằng `<h*>` |
| Empty state (§18) | Vùng không có dữ liệu: giỏ trống, không kết quả | Lỗi tải → alert | Tiêu đề rõ + 1 câu gợi ý + primary cụ thể | Panel nền alt bo 24, empty không có hành động tiếp theo |
| Skeleton, spinner (§18, §18.1) | Chờ quá 500 ms | Chờ dưới 500 ms → giữ nội dung cũ | Skeleton đúng kích thước, spinner trong vùng đang tải | Làm mờ chữ, spinner phủ cả trang |
| Rich text `.rte` (§28) | Mọi nội dung merchant nhập | Chữ giao diện → component tương ứng | 16 / 1.75, ≤ 65ch, link gạch chân | Thân bài 18 ở desktop, blockquote nền sand |
| Pagination (pagination.md) | Danh sách nhiều trang: collection, blog, search | Hàng cuộn ngang → §11 | Trang hiện tại accent, đầu / cuối giữ nút | Ẩn nút ở trang đầu / cuối |
| Countdown (countdown.md) | "Sale ends in" có ngày thật | Không có ngày hết sale → ẩn | Số render bằng Liquid, hết hạn thì ẩn | Đếm ngược giả, `aria-live` trên số |
| Panel tối (§2, §30.16) | Tóm tắt cart, bundle, shop the look, quiz | Nền tối cả section → `.section--dark` | Một cặp `--panel-muted`, `--panel-saving`; focus trắng | `--color-muted-on-dark` trên panel, chữ trắng cho dòng giảm giá |
| Icon (§33) | Nhận biết nhanh hành động, trạng thái | Thay chữ ở hành động ít gặp → kèm nhãn | 3 cỡ token, `currentColor`, tên truy cập cho nút chỉ icon | Icon mới trùng nghĩa, emoji, kéo giãn |

Còn thiếu (ticket sau): các spec riêng ở §23 (variant-picker, pagination, layers, countdown, announcement-bar, localization) thêm hai mục "Dùng khi nào" và "Nên / Tránh" ngay trong file của mình theo khuôn này; hiện mới có ở bảng trên.

## 39. Trạng thái vòng đời component (sổ 21/11, patterns-13)

| Nhãn (màn DS) | Tiếng Việt | Nghĩa | Ai chuyển |
| --- | --- | --- | --- |
| Proposed | Đề xuất | Designer đề xuất, chưa chốt; chưa dùng ở trang mới ngoài màn DS | Designer |
| Approved | Đã chốt | CTO (hoặc BGĐ) đã chốt trong sổ quyết định; chưa có code theme | CTO |
| Built | Đã dựng | Đã có class trong `assets/` / `snippets/` (có thể còn lệch: xem "Cần FE" trong notes) | Dev FE + QA |
| Deprecated | Ngừng dùng | Không đưa vào trang mới; ghi thay bằng gì và bản nào bỏ hẳn | CTO |

- Thứ tự: Đề xuất → Đã chốt → Đã dựng → Ngừng dùng. Ngừng dùng một component là thay đổi major khi xoá class hoặc token (§40) và phải báo trước ít nhất một bản minor.
- Trên màn DS: mỗi section có thuộc tính `data-status` và nhãn cạnh tiêu đề; chú giải ở đầu trang. `h-banner` (page banner) không có tiêu đề `h2` riêng nên không hiện nhãn: nó thuộc dòng `h-header`, cùng trạng thái Đã dựng (43 section, 42 nhãn).
- "Đã dựng" gán theo việc class đã có trong `assets/` hoặc `snippets/` của nhánh làm việc (Designer đối chiếu bằng tìm tên class, chưa soát từng trạng thái): FE / QA xác nhận lại khi làm ticket.

Trạng thái hiện tại (21/11, bản 2.0.0): 25 Đã dựng, 11 Đã chốt, 6 Đề xuất, 0 Ngừng dùng. Bản 2.1.0 (ES1-T573) thêm 7 section Đề xuất (35–41, cuối bảng): 25 Đã dựng, 11 Đã chốt, 13 Đề xuất (50 section, 49 nhãn). Token Ngừng dùng (không phải section): `--space-1…8`, `--radius-hero`, xoá ở 3.0.0. Component trang chủ có code theme (`blocks/level-card`, `video-card`, `shop-the-look*`, `featured-product`, `quiz`…) nhưng class kit 2.1.0 chưa khớp tên với `assets/`: giữ Đề xuất tới khi FE đối chiếu (ES1-T548, T576, T580).

| Màn DS (`id`) | Component / nền tảng | Trạng thái | Mục spec |
| --- | --- | --- | --- |
| `h-grid` | Grid, layout, touch target | Đã dựng | §1, §1.3 |
| `h-type` | Typography | Đã dựng | §1.1 |
| `h-color` | Color tokens, status roles | Đã dựng | §2, §2.1 |
| `h-spacing-radius` | Spacing, radius | Đã dựng | §1.2 |
| `h-elevation-layers` | Elevation, layers | Đã dựng | §31 |
| `h-motion` | Motion | Đã dựng | §19 |
| `h-icon` | Icons | Đề xuất | §33 |
| `h-token-architecture` | Token architecture | Đề xuất | §32 |
| `h-rtl` | Right-to-left | Đề xuất | §34 |
| `h-header` (+ `h-banner`) | Header, page banner | Đã dựng | §3 |
| `h-title` | Breadcrumb, page title | Đã dựng | §5 |
| `h-button` | Buttons | Đã dựng | §6 |
| `h-tabs` | Tabs | Đã dựng (`.featured-collection__tab`) | §7 |
| `h-badge` | Badges, sold out | Đã dựng | §8 |
| `h-product` | Product card | Đã dựng | §9 |
| `h-media` | Media, thumbnail | Đề xuất | §36 |
| `h-collection-card` | Collection card | Đã dựng | §30.7 |
| `h-dark` | Color schemes and roles | Đã chốt (chỉ tài liệu) | §2.2 |
| `h-article` | Article card and row | Đã dựng | §10, §11 |
| `h-form` | Inputs, form states | Đã chốt | §12 |
| `h-input-group` | Input group, search field | Đã chốt | §30.9 |
| `h-listbox` | Listbox option | Đã chốt | §30.10 |
| `h-acc` | Accordion | Đã dựng | §13 |
| `h-chip` | Chip | Đã chốt | §30.1 |
| `h-facets` | Facet group | Đã chốt | §30.6 |
| `h-selectable-option` | Selectable option | Đã chốt | §30.2 |
| `h-variant-picker` | Variant picker | Đã chốt | §30.3 |
| `h-quantity` | Quantity stepper | Đã dựng | §30.4 |
| `h-price-rating` | Price, rating | Đã dựng | §30.5 |
| `h-data-table` | Data table | Đã chốt (`--stack` là Đề xuất) | §30.11 |
| `h-progress` | Progress meter | Đã chốt | §30.12 |
| `h-sticky-bar` | Sticky bar, teaser, popover | Đã chốt | §30.13 |
| `h-toast` | Toast | Đã dựng | §17 |
| `h-drawer` | Drawers | Đã dựng | §15 |
| `h-dialog` | Dialog, bottom sheet | Đã dựng | §16 |
| `h-state` | Empty, error, loading | Đã dựng (ngưỡng 500 ms, CTO 21/11 lượt 2) | §18, §18.1 |
| `h-alert` | Alerts and messages | Đề xuất | §35 |
| `h-rte` | Rich text | Đã dựng | §28 |
| `h-pagination` | Pagination | Đã dựng | pagination.md |
| `h-countdown` | Sale countdown | Đã dựng | countdown.md |
| `h-panel` | Dark panel | Đã dựng | §2, §30.16 |
| `h-content` | Content and voice | Đề xuất | `docs/design/content.md` |
| `h-level-card` | Level card | Đề xuất (2.1.0) | §41.1 |
| `h-stl` | Shop the look, hotspot | Đề xuất (2.1.0) | §41.2 |
| `h-vcard` | Video card, `--error` | Đề xuất (2.1.0) | §41.3 |
| `h-tcard` | Testimonial card | Đề xuất (2.1.0) | §41.4 |
| `h-specs` | Specs table | Đề xuất (2.1.0) | §41.5 |
| `h-faq-stats` | FAQ stats | Đề xuất (2.1.0) | §41.6 |
| `h-quiz-opt` | Quiz answer option | Đề xuất (2.1.0) | §41.7 |

Phần Đề xuất nằm trong màn Đã dựng / Đã chốt của lượt này: focus tóm tắt lỗi form (`h-form`), `.button--wrap`, `.badge--wrap`, quy tắc tertiary small + icon cạnh chip (`h-button`, `h-tabs`), bảng ánh xạ ở `h-spacing-radius`, `h-elevation-layers`. Chuyển sang Đã chốt khi CTO duyệt bản 1.3.0.

## 40. Phiên bản design system (sổ 21/11, patterns-14; số bản 2.0.0 CTO chốt 21/11 lượt 2)

- Một số bản `major.minor.patch` cho cả design system (token + component + quy tắc), ghi ở `docs/tokens.json` `_version`, đầu màn foundation.html và đầu file này. Bản hiện tại: 2.0.0 (CTO chốt số bản 21/11 lượt 2; ES1-T567: đổi nguồn chuẩn, line-height, thang khoảng cách, nhãn nút).
- major: đổi tên hoặc xoá token, setting id, class component, hoặc đổi nguồn chuẩn (phá theme đã cài hoặc trang đang dùng). minor: thêm token, component, biến thể, màn DS, quy tắc không phá cái cũ. patch: sửa giá trị, sửa lỗi, sửa tài liệu.
- Mỗi bản CTO / BGĐ duyệt gắn một số; bản đã duyệt không sửa lại, thay đổi tiếp theo ra số mới.
- Lịch sử và quy tắc đầy đủ: `docs/design/CHANGELOG.md`. Mỗi thay đổi DS thêm một dòng vào đó trong cùng PR.
- 2.1.0 (ES1-T573, ĐỀ XUẤT tới khi CTO duyệt): minor. Thêm 20 token, 7 component trang chủ + 4 mảnh nhỏ lên kit, 7 section màn DS; Deprecated `--space-1…8`, `--radius-hero` (chưa xoá: xoá là major 3.0.0). Dòng CHANGELOG: bản vá ở `drafts/designer/ES1-T573/notes.md` (file ngoài phạm vi ghi của Designer agent).

## 41. Component riêng trang chủ (2.1.0, ES1-T573, ĐỀ XUẤT; màn `h-level-card` … `h-quiz-opt`)

Trước 2.1.0 mỗi component định nghĩa 2 lần: `ES1-T293/index.html` (≥ 80rem) và `ES1-T278` / `ES1-T279` (360, 768). Nay một định nghĩa ở kit (mục 13c), mobile-first: gốc = 360, `@48rem` = 768, `@80rem` = 1280 / 1920; số đo giữ đúng từng mốc như trang cũ (ảnh 6 khổ cao bằng nhau từng px). Bố cục section (`.hero`, `.mf`, `.quiz`, `.fp`, `.why`, `.bpanel`, `.intro`, lưới hàng, `.faq__aside`, `.faq__image`) vẫn ở trang. Trang không định nghĩa lại các selector dưới đây.

### 41.1 Level card `.level-card`

- Anatomy: `<a class="level-card">` > `img` (cover, focal 50% 15%) + `::before` gradient + `.level-card__body` (`__label`, `__title`, `__foot`).
- Số đo: khung `--ratio-4-3` (< 48rem) / `--ratio-1-1`; bo `--radius-panel`; đệm 24 / 24 / 16 (360), 16 (768), `clamp(32, 2.0833vw, 40)` (≥ 80rem); nhãn Sofia 800 14/20 HOA +4%; tiêu đề Sofia 700 h3 28/36, h2 từ 80rem; chân 14/20 500, cao 44, vạch trắng 24%.
- Trạng thái: < 80rem chân luôn hiện (cảm ứng, V31). ≥ 80rem chân ẩn (`max-height 0`, opacity 0), hiện khi hover / `:focus-visible` (trần `--size-1600`, 250 ms `--ease-out`); hover ảnh phóng 1.04 (500 ms), tắt khi giảm chuyển động. Focus vòng accent 2. Thiếu ảnh: nền `--color-background-dark`, chữ vẫn đọc.
- A11y: cả thẻ một link, ảnh `alt=""`; AA chữ trắng trên gradient tối 85% (bắt đầu 35%) / 100% (bắt đầu 50%).

### 41.2 Shop the look `.stl`

- Markup thống nhất (ES1-T573 đổi markup 2 trang): `.stl` > `.stl__media` (img + `.hotspot` × n) + `.stl__body` > `.stl__list` (`.stl__fits`, `ul.stl__rows` > `li.option-card.stl-row`) + `.dpanel.stl__summary`. Đầu khối < 80rem: `.stl__head` (section-header + section-link); ≥ 80rem trang dùng `.shead`.
- 360: một cột, ảnh → body cách 24; rows cách 12. 768: body 2 cột `1fr | 280`, cách 16, summary dính `header + 16`. ≥ 80rem: `.stl` lưới `--grid-columns` (12), ảnh 8 cột, body 4 cột flex dọc cách `clamp(16, 1.25vw, 24)`, `.stl__list` `display: contents`, fits cao `clamp(84, 5.2vw, 100)`, rows cách 8, summary `margin-top: auto` (đáy cột), không dính.
- `.stl__fits`: sand, bo 8, đĩa icon `--size-1300` trắng, glyph 28; dòng 18/28 700 + 14/20 muted.
- `.hotspot`: vùng chạm 44 (`--touch-target`); chấm trắng 20 + quầng trắng 40% 4; `aria-pressed="true"`: chấm 28 viền foreground 2 + quầng 60% 6. Bắt buộc `aria-label` "Show {tên} in the list".
- `.stl-row`: `.option-card` đang xem = `is-checked` / `aria-current="true"` (viền accent, KHÔNG vòng check: tổng tính cả bộ); cả dòng là link (`a::after` phủ); hết hàng `is-disabled` + badge Sold out, tổng bỏ món đó.

### 41.3 Video card `.vcard`

- Khung `--ratio-9-16` nền tối; nút play phủ khung, đĩa 52 trắng 92%, glyph 16 × 18; hover accent + 1.06; focus thụt 4 vào trong (khung `overflow: hidden`).
- Dòng sản phẩm `.product-row.vcard__product`: cao 76, đệm 12 (< 80rem); 84, đệm 12 / 16 (≥ 80rem); tên một dòng cắt "…" (ngoại lệ cắt: tên đầy đủ ở link và nhãn nút play).
- `--error`: giữ khung, icon 24 + "Video unavailable." + link tới sản phẩm, chữ trắng.
- Card rộng 252 (360), 264 (768, ≥ 1280) do hàng của trang đặt.

### 41.4 Testimonial card `.tcard`

- Ảnh `--ratio-16-9`; thân đệm 24, cách 12; meta (tên, Verified 14/20 muted-light + icon 16 `--color-badge-new`, sao); tiêu đề `.text-title` Inter 700 18/28; trích dẫn muted giãn; `.tcard__product` dưới vạch border, đệm trên 24.
- < 80rem: meta xuống dòng, sao chiếm hàng riêng, tên 16 500. ≥ 80rem: một hàng, sao dạt phải, tên 14/20 600.
- Partial: Verified mặc định tắt (E9); không gắn sản phẩm thì bỏ `.tcard__product`.

### 41.5 Specs `.specs`

- `dl` > `div` (`dt` muted 14/20, `dd` 16/24 500); hàng lẻ sand; viền border, bo 8.
- 360: dt trên dd, đệm 12 / 16, cách 4. 768: 2 cột, dd căn cuối, đệm ngang 24, cách 16. ≥ 80rem: flex, cao tối thiểu `--size-1100` 44, đệm 8 / 24, cách trên 8.
- Empty: không metafield thì không in bảng.

### 41.6 FAQ stats `.faq__stats`

- `ul` 2 ô (`.faq__stat`: `__label` eyebrow, `__value` Sofia 800 h1 dòng 1, `__text` 14/20 500). Ô 1 accent, ô 2 tối; chữ trắng (4.97:1, 17.4:1). Bo 8, cách 12.
- 360: chồng đáy ảnh −48, lề 12, đệm 16. 768: tuyệt đối góc dưới trái khung ảnh, cách đáy 7.5%, rộng 80%, đệm 24. ≥ 80rem: cách đáy 40, rộng 79.6%.
- Khung chứa (`.faq__aside`, position relative) do trang đặt.

### 41.7 Quiz answer option `.option-card.quiz-opt`

- Component riêng, KHÔNG gộp `.option-card--tile` hay đổi tên thành class chung: cột thumb tròn `--size-1100` 44 nền sand + chữ (`.quiz-opt__text`: `.option-card__title`, `.option-card__meta`); check 24 của `.option-card`.
- Cao tối thiểu `--size-1800` 72 (< 48rem) / `--size-2000` 80; cách cột 12.
- Trạng thái theo §30.2 (`.option-card`): hover viền foreground, chọn viền accent 2 + check accent, focus vòng accent, disabled nền alt.

Quyết định CTO cần chốt (2.1.0):
1. Tên thang kích thước: `--size-1000…2400` (bậc 100 = 4px, theo quy ước `--space-050` và §32.1 "không đặt tên theo giá trị") hay tên px (`--size-40…96`) như body ticket ES1-T573 gợi ý. ĐỀ XUẤT: giữ `--size-1000…2400` (nguồn: §32.1; kit `--space-050 / 150`).
2. Duyệt 2.1.0 và các trạng thái Đề xuất 35–41. ĐỀ XUẤT: duyệt, giữ Đề xuất tới khi FE dựng (ES1-T548, T576, T580).
3. `.filter-toggle__count` 24 → 20 (`--count-badge-size`): số có 2 chữ số rộng 28 (min-width 20 + đệm 4 × 2). ĐỀ XUẤT: chấp nhận (nguồn: notes ES1-T567 §8.3; một token số đếm cho giỏ và bộ lọc).
