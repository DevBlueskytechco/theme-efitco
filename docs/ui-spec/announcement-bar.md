KHÔNG CHẮC: Figma không có announcement bar (docs/figma-inventory.md dòng 13, 67) nên mọi kích thước, màu, trạng thái là ĐỀ XUẤT. demo-data không có chữ announcement: mockup dùng "Up to 24% off selected gear" (24% = Ativafit Lava 66 lb Adjustable 379.99 / 499.99, có thật trong demo-data) trỏ /collections/sale; đã hỏi BA ở ES1-T296. Ảnh card trong trang nền mockup dùng đúng URL demo nhưng lệch tên sản phẩm (ES1-T245), không ảnh hưởng thiết kế bar.

# UI spec: Announcement bar (ES1-T289, audit A18)

## Thay đổi audit

| # | Phần | Trước (develop) | Sau (spec này) | Nguồn |
| --- | --- | --- | --- | --- |
| 1 | Spec | chưa có, chỉ có code `blocks/announcement-bar.liquid` + `critical.css` 131–159 | spec đủ 4 mốc, trạng thái, a11y | Ticket ES1-T289, SRS TE-1 AC4 |
| 2 | Vị trí so với header tối 80 dính | chưa ghi | trên header, cuộn đi; header dính top 0 khi bar đã khuất; mega menu, scrim bám đáy header, không bám y 80 | §4, AGENTS Composition model |
| 3 | Chiều cao | ~37 (padding 8 + chữ 14 × 1.5) | tối thiểu 44 mọi mốc (link chạm 44 trên mobile) | Sổ 09/11 vùng chạm mobile ≥ 44 |
| 4 | Nền | `--color-background-dark` phẳng | `--color-background-dark` + noise (liền với header 1:362) + gạch đáy 1px trắng 12% | Figma 1:360, 1:362; foundation §2 `--dark-texture` |
| 5 | Link | cả câu là link, gạch chân | giữ cả câu là link; thêm mũi tên 16 × 13 cuối câu, hover gạch 2px + mũi tên dịch 4 | DESIGN `.button--link`; 04 §3.9 hover/active rõ |
| 6 | Chữ | 14/400 | 14/500 lh 20 | foundation §1 chữ nhỏ 14; Figma 1:365 menu Inter 500 |

Giữ nguyên: 2 setting `text`, `link`; rỗng thì không render; placeholder trong theme editor; `<aside aria-label>`; `data-testid` hiện có.

Mục đích: báo 1 ưu đãi hoặc tin toàn site ở dạng tĩnh, không phải popup lúc tải trang (14 #284D Must; 15 §1 "ưu tiên non-modal như announcement bar"). Story TE-1 AC4: text rỗng (mặc định) thì không có bar; có text thì bar trên header, link tuỳ chọn.

Đầu ra:
- Spec này.
- `drafts/designer/ES1-T289/announcement-bar.html` (nhúng `../_kit/kit.css`) + `announcement-bar-360|768|1280|1920.png`. Phần đầu mỗi PNG là đầu trang collection Sale có bar; trạng thái ở cuối file.

Nguồn: sổ quyết định CTO > AGENTS.md > DESIGN.md > Figma 1:360, 1:362 (thanh tối, chỉ desktop) > foundation.md §1–3, §19–20 > kiến thức 14, 15, 04, 05, 06, 03.

---

## 1. Anatomy

1. `<aside class="announcement-bar">` dải tràn mép (`full-width`), nền tối + noise như header.
2. Nội dung trong `--content-width`, căn giữa.
3. Chữ (`text`), nếu có `link` thì cả câu là `<a>` + mũi tên trang trí `aria-hidden` sau chữ.
4. Gạch đáy 1px tách khỏi header (trang trí).

Không có: nút đóng, nhiều câu xoay vòng, đếm ngược, màu nền riêng. Lý do: SRS TE-1 AC4 chỉ 1 câu + 1 link; AGENTS "Keep settings flat, add only settings the design needs"; xoay vòng là chuyển động tự chạy (sổ 09/11, 15 §5 mobile không tự xoay). Muốn thêm: hỏi BA, không thuộc spec này.

## 2. Settings merchant

Không thêm setting. Giữ:

| Tên (label) | Id | Kiểu | Default | Ghi chú |
| --- | --- | --- | --- | --- |
| Text | `text` | text | rỗng | Rỗng thì ẩn bar (AC4) |
| Link | `link` | url | rỗng | Rỗng thì chữ thường, không mũi tên |

ĐỀ XUẤT đổi chữ info `t:info.announcement_text` (nguồn: 18 chữ link mô tả đích; §3 mốc 360): "Leave empty to hide the announcement bar. Under 40 characters fits one line on phones. With a link, say where it goes (for example: Up to 24% off selected gear)."

Chữ demo (ĐỀ XUẤT, chờ ES1-T296): `text` "Up to 24% off selected gear", `link` /collections/sale (collection Sale có trong menu Figma 1:365). Không dùng "Shop now", "Click here" (sổ 09/11 SEO).

## 3. Layout theo mốc

| Giá trị | 360 | 768 | 1280 | 1920 | Token / cách tính |
| --- | --- | --- | --- | --- | --- |
| Chiều cao tối thiểu | 44 | 44 | 44 | 44 | `calc(var(--space-1) * 11)` |
| Padding block | 12 | 12 | 12 | 12 | `--space-3` (chữ 20 + 24 = 44) |
| Bề rộng chữ | 320 | 728 | 1240 | 1416 | `--content-width` |
| Căn | giữa | giữa | giữa | giữa | `text-align: center` |
| Chữ | Inter 14/500 lh 20 | như 360 | như 360 | như 360 | `--font-size-sm`, `--font-primary--family` |
| Mũi tên | 16 × 13, cách chữ 8 | | | | `--space-2`; icon `arrow` của `snippets/slideshow-icon` |
| Gạch đáy | 1px trắng 12% | | | | `color-mix(in srgb, var(--color-background-dark-foreground) 12%, transparent)` |
| Header dưới bar | y 44 → 124 | y 44 → 124 | y 44 → 124 | y 44 → 124 | `--header-height` 80 |

- Câu dài: xuống dòng tự nhiên, không cắt "…" (cắt làm mất ý ưu đãi), tối đa khuyên 1 dòng (info §2). Ở 360 chữ 14/500 chứa ~42 ký tự một dòng; 2 dòng thì bar cao 64.
- Bar nằm trên thanh tối; không đổi thiết kế header (sổ 10/11 header 80 tối, không đè ảnh). Hero trang chủ và banner trang con vẫn nằm dưới header như cũ, chỉ dịch xuống 44.

## 4. Vị trí, cuộn, lớp

Code: `layout/theme.liquid` gọi `announcement-bar` trong container riêng trước container `header`; `critical.css` 402–409: container header `position: sticky; inset-block-start: 0` khi `data-sticky`.

- Bar KHÔNG dính, cuộn đi cùng trang. Header dính top 0 sau khi bar khuất (cuộn 44). Lý do: sticky ≤ 64–80 (04 §3.8); bar + header dính = 124, ăn 15% màn 360 × 800.
- Bóng header (`[data-scrolled]`): hiện khi header bắt đầu dính. Hiện tại sentinel cao 80 ở top 0 nên bóng hiện ở 80 dù header dính từ 44. ĐỀ XUẤT (P4, FE): đặt sentinel ngay trước container header, cao 1px.
- Mega menu (navigation.md §5.1 "Panel top 80") và scrim: bám đáy header (`top: 100%` của header), không bám y 80 của viewport; khi trang ở đầu, panel mở ở y 124. Ghi đề xuất cho navigation.md (§9 dưới), không sửa file đó.
- Drawer menu, cart drawer, dialog, sheet: phủ cả bar (fixed toàn màn), không đổi.
- Trang có `layout/password.liquid` và gift card (`layout none`): không có bar (không gọi block).

## 5. Trạng thái

Figma không có; tất cả ĐỀ XUẤT (05 §3, foundation §3.2, §18). Mockup: phần "States".

| # | Trạng thái | Hiển thị | Nguồn |
| --- | --- | --- | --- |
| A1 | Rỗng, storefront (mặc định) | không render gì, header ở y 0 | AC4; code có |
| A2 | Rỗng, theme editor | dải 44 nền `--color-background-alt`, chữ `--color-muted-light` 14 (4.85:1), viền đứt `--color-border`, câu `blocks.announcement_bar.placeholder` | AGENTS empty state; code có |
| A3 | Có chữ, không link | chữ trắng, không gạch chân, không mũi tên | AC4 |
| A4 | Có link, mặc định | gạch chân 1px offset 0.2em + mũi tên | 06 §6 link nhận biết bằng gạch chân |
| A5 | Hover | gạch 2px, mũi tên dịch 4 về inline-end, 150 `--ease-out` | DESIGN `.button--link`; 05 §3 < 200ms |
| A6 | Focus bàn phím | outline 2px trắng offset −2 quanh vùng link 44 (nằm trong bar, không đè header; accent trên tối 3.48 kém rõ) | foundation §3.2 |
| A7 | Active (nhấn) | mũi tên về 0, chữ giữ | 05 §3 |
| A8 | Câu dài 360 | 2 dòng, cao 64, căn giữa, mũi tên theo sau chữ cuối | §3 |
| A9 | Đã cuộn | bar khuất, header dính top 0 có bóng | §4 |
| — | Đang tải, lỗi | không có: render server, chữ ở critical.css, không JS, không ảnh. Link hỏng là đích 404 của Shopify (404 có search, sổ quyết định E1) | 05 §7 |

Chuyển động: chỉ hover (màu, `translate` mũi tên); không trượt vào, không xoay chữ; `prefers-reduced-motion` tắt dịch mũi tên.

## 6. Accessibility

| Cặp | Tỉ lệ | Dùng |
| --- | --- | --- |
| background-dark-foreground / background-dark (#FFF / #1A1A1A) | 17.4 | chữ, mũi tên, outline focus |
| muted-light / background-alt (#6B6B6B / #F4F4F4) | 4.85 | chữ placeholder trong editor |
| trắng 12% / dark | 1.4 | gạch đáy, chỉ trang trí |
| accent / dark | 3.48 | không dùng (link, focus đều trắng) |

- `<aside aria-label="Announcement">` (locale `blocks.announcement_bar.label`, code có). `aside` cấp cao nhất là landmark complementary, có tên riêng: đạt axe `landmark-unique`.
- Thứ tự Tab: skip link "Skip to content" → link bar → header. ĐỀ XUẤT: `layout/theme.liquid` chưa có skip link (foundation §3.4 yêu cầu); FE thêm trước container bar.
- Link: tên là cả câu (chữ link mô tả đích, sổ 09/11). Mũi tên `aria-hidden`, lật bằng `:dir(rtl)` `scale: -1 1` (AGENTS Direction).
- Không dùng màu đơn lẻ: link khác chữ thường bằng gạch chân và mũi tên.
- Vùng chạm: link `display: inline-block; padding-block: 12px; margin-block: -12px` = cao 44 (mobile ≥ 44, sổ 09/11), không tăng chiều cao bar; mũi tên inline (`vertical-align`) nên khi xuống dòng đi theo chữ cuối.
- Zoom 200%: câu xuống dòng, bar cao lên, không tràn ngang.

## 7. Lighthouse (SEO 100, A11y 100, BP 100; Perf desktop ≥ 98, mobile ≥ 90)

- LCP: bar là chữ 14, không bao giờ là LCP (ảnh hero / banner / card đầu lớn hơn). Bar đẩy hero xuống 44 nhưng hero vẫn trong màn đầu ở 360 × 800 (124 + hero 4/5).
- CLS 0: bar render server, CSS ở `critical.css` (đã có, ~1 KB, giữ trần 10 KB); không JS chèn bar sau tải; không ảnh. Noise dùng lại `assets/noise-dark.png` đã tải cho header.
- Font: Inter 500 đã có (DESIGN Typography), không thêm weight.
- SEO: `<a href>` thật, chữ link mô tả đích, chữ ≥ 12 (14).
- BP: không JS, 0 lỗi console.

## 8. Map sang code

| Phần | Hiện có | Cần đổi | Phía |
| --- | --- | --- | --- |
| Chiều cao, chữ | `.announcement-bar__text` padding `--space-2`, chữ 14/400 | min 44, padding `--space-3`, 500, lh 20 | FE `critical.css` |
| Nền | `--color-background-dark` | thêm noise như header + gạch đáy 1px | FE `critical.css` |
| Link | `.announcement-bar__link` min 24 | `inline-block`, padding-block `--space-3` (cao 44), mũi tên cách `--space-2`, mũi tên `{% render 'slideshow-icon', icon: 'arrow' %}`; hover, focus §5 | FE `blocks/announcement-bar.liquid`, `critical.css` |
| Sentinel bóng header | `.header-sticky-sentinel` cao 80 top 0 | đặt trước container header, cao 1px (§4) | FE `layout/theme.liquid`; BE kiểm `assets/header-sticky.js` |
| Skip link | không có | thêm trước bar | FE `layout/theme.liquid` |
| Info setting | "Leave empty to hide…" | §2 | FE `locales/en.default.schema.json` |

`data-testid` giữ: `announcement-bar`, `announcement-bar-link`, `announcement-bar-placeholder`. Không testid mới.
Token dùng: `--color-background-dark(-foreground)`, `--color-background-alt`, `--color-muted-light`, `--color-border`, `--font-primary--family`, `--font-size-sm`, `--space-1..3`, `--content-width`, `--motion-fast`, `--ease-out`; dẫn xuất `--dark-texture`. Không token mới.

## 9. Đề xuất trỏ sang file khác (không sửa trong ticket này)

- `docs/ui-spec/navigation.md` §5.1 "Panel top 80" và §2 "Scrim: phủ trang từ đáy header": ghi rõ bám đáy header (y 124 khi bar hiện, y 80 khi đã cuộn).
- `docs/ui-spec/foundation.md` §3: thêm dòng "announcement bar 44 nằm trên header, không dính" và trỏ spec này.

## 10. Quyết định CTO đã chốt 11/11 (theo đề xuất, sổ 11/11)

1. Bar dùng nền tối + noise liền header (gạch 1px), không thêm setting màu, không nút đóng, không xoay câu? Đề xuất: có (§1, AGENTS settings phẳng, 15 §5).
2. Bar không dính, chỉ header 80 dính sau khi bar khuất; mega menu bám đáy header? Đề xuất: có (§4, 04 §3.8 sticky ≤ 80).
