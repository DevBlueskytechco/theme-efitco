# Kiểm kê Figma Efitco T10 — trang chủ

Điền 22/10/2026 bởi Designer Agent (đọc qua Figma REST, token CTO) — Mr Designer rà lại T3 28/10, sửa trực tiếp trong file này qua PR.

File: https://www.figma.com/design/ky78ISZjTmrnNxmYsF76Dm/Efitco-T10--Copy-?node-id=1-359
Frame `Homepage` = node `1:359`, kích thước 1920 × 13300 (desktop duy nhất). Page `AI drafts` = node `2001:360` (trống, nhận đề xuất của agent).

## Kết luận chung

- Chỉ có breakpoint desktop 1920. KHÔNG có mobile/tablet → Dev FE tự suy layout mobile (quyết định CTO 27/10); QA kiểm mobile theo convention, không theo Figma.
- Không có trạng thái rỗng, lỗi, loading, hover, focus cho bất kỳ block nào.
- File không dùng Figma Styles/Variables (styles = 0). Token phải trích tay từ node (bảng dưới).
- Trang chủ có 16 block, không phải 12. Không có Announcement bar.
- 4 block trước đây nằm ngoài SRS (quiz, bundle builder, countdown, video demo) → CTO 27/10 giữ, đã thêm TE-11..TE-13.

## Bảng block (từ trên xuống, y = vị trí trong frame)

| # | Tên block (Shopify) | Node id | y | Story | Breakpoint | Trạng thái thiếu | Ghi chú |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Header | 1:362 | 24 | TE-1 | desktop | hover menu, mega menu, mobile drawer, search mở | 7 menu: Shop, Collection, Sale, Our Story, Blog, Contact, Help; icon search/account/cart; logo 1:377 (vector). Nền trong suốt đè lên hero (1:363 BG) |
| 2 | Slideshow / Hero (CTO 31/10: slideshow) | 1:422 (slide 1), 1:437 (slide 2) | 80 | TE-2 AC6–AC9 | desktop | dots/arrow hover, slide 3+, video | 1798 × 827, bo góc; eyebrow "Trusted by 10,000+ athletes", H1 2 dòng, sub, 1 CTA; nút Back/Next 1:435/1:436; dots 1:418 |
| 3 | Collection list (carousel) | 1:395 | 1027 | TE-3 | desktop | rỗng (<5 collection), hover | "Browse Categories", 5 card 336 × 270: Free Weights, Functional Training, Benches & Racks, Recovery & Mobility, Accessories; nút next/back 1:398 |
| 4 | Rich text + Collection list (shop by level) | 1:453 | 1515 | TE-2 + TE-3 | desktop | rỗng | Gộp 2 phần: 1:454 heading "Everything You Need to Train." + CTA "Become A Member"; 1:464 "Choose Your Training Level" 3 card 456 × 456 Beginner/Intermediate/Advanced có badge "24 Products" |
| 5 | Featured collection (tabs) | 1:490 | 2663 | TE-3 | desktop | tab rỗng, hover card, quick add | "What People Are Buying?" 4 tab All/Weight/Portable Fitness/Accessories; 4 product card: badge -25%, rating 5.0, giá gạch, "+ 2 Colors" swatch |
| 6 | Product finder quiz | 1:506 | 3457 | TE-11 | desktop | bước 2/3, kết quả, rỗng | "Find Your Perfect Gear" 3 bước, body map + 3 lựa chọn Upper/Core/Lower. Cần JS + logic → nếu giữ là story mới (BE) |
| 7 | Shop the look (image + product list) | 1:560 | 4027 | TE-12 | desktop | hết hàng, rỗng | "A Complete Corner Gym, Itemised": ảnh lớn + 4 product row + tổng tiền "Add Setup To Cart" (add nhiều biến thể 1 lần → BE) |
| 8 | Image with text (inspiration banner) | 1:625 (nền 1:624) | 5125 | TE-7 | desktop | — | "Make fitness a natural part of your everyday life!", 3 ảnh nhỏ rải, 1 CTA; nền #F5F5F1 |
| 9 | Bundle builder | 1:636 | 6173 | TE-12 | desktop | giỏ bundle rỗng, hết hàng, giảm giá theo bậc | "Pick Your Kit, Save As You Go": lưới 9 sản phẩm chọn + panel "Your Bundle" tổng tiền, progress "add 2 more to get 15% off" → BE nặng |
| 10 | Featured product (countdown) | 1:759 | 7201 | TE-13 | desktop | hết hàng, hết giờ sale | Ativafit Lava 66 lb: countdown 22:36:28, rating 4.9/341, bảng spec 4 dòng, Add to cart + View detail. Countdown là tính năng mới |
| 11 | Video demo carousel | 1:817 | 7974 | TE-13 | desktop | video lỗi, rỗng | "See Real Equipment In Action": 3 stat (360+, 1:15, 4K) + 6 thẻ video dọc kèm product name/price → cần video hosting (Shopify video hay YouTube?) |
| 12 | Testimonials | 1:885 | 8898 | TE-7 | desktop | rỗng, <4 | "What Our Customers Say?": 4 card ảnh + tên + Verified + sao + tiêu đề + quote + product đính kèm |
| 13 | Image with text (why choose) | 1:992 | 9814 | TE-7 | desktop | — | "Why Choose Efitco?": ảnh trái full-bleed, 3 USP (Uncompromising Quality, Rigorous Testing, Designed For Athletes), CTA "View About Us", 2 ảnh nhỏ |
| 14 | Blog posts | 1:1022 | 10690 | TE-9 | desktop | rỗng, <5 bài | "Training Tips & Inspiration": 5 card dọc 300 × 448, tag + title + read time |
| 15 | FAQ (collapsible) + stats | 1:1057 | 11508 | TE-7 | desktop | mở/đóng, >5 câu | "We're Proud To Be The Best At Training": 5 câu hỏi accordion; ảnh phải + 2 ô stat "360+ Products", "12 Warranty months" |
| 16 | Newsletter + Footer + trust bar | 1:1104 | 12290 | TE-1 | desktop | lỗi/thành công form | 3 phần trong 1 group: newsletter "Get 15% Off" (1:1146 + 1:1192), footer 2 cột menu + social + payment icons + localization "USD / EN", trust bar 4 icon (1:1107), wordmark EFITCO 200px (1:1156) |

Node lẻ không phải block (bỏ qua khi code): 1:360, 1:361 (rectangle nền), 1:389 (card "Intermediate" thừa, trùng 1:464), 1:1207–1:1210 (4 vector chevron rời).

## Token trích từ node (chưa có Styles trong file)

| Loại | Giá trị | Số lần dùng | Đề xuất tên token |
| --- | --- | --- | --- |
| Font heading | Sofia Sans Condensed 700/800 | 53 | `--font-heading` — có trong Shopify font library (CTO kiểm 27/10), chọn qua font_picker |
| Font body | Inter 400/500/600/700 | 300 | `--font-body` — có trong Shopify font list |
| Font lẻ | Sofia Sans 800 (1), Host Grotesk 700 (1) | 2 | lỗi thiết kế, gộp vào heading |
| Cỡ chữ | 13, 14, 16, 18, 28, 36, 48, 100, 200 | — | scale: 13/14/16/18 body, 28/36/48 heading, 100/200 display (wordmark footer) |
| Màu chữ chính | #1A1A1A | 101 | `--color-foreground` |
| Màu chữ phụ | #4D4D4D, #999999, #808080 | 103 | `--color-muted` #4D4D4D; `--color-muted-light` #6B6B6B (thay #999999/#808080 trên nền sáng, đạt AA); `--color-muted-on-dark` #999999 chỉ trên nền tối |
| Màu nhấn CTA | #D94610 | 42 | `--color-accent` = #C8400E trong theme (CTO 30/10: #D94610 không đạt AA với chữ trắng) |
| Màu sale/badge | #BD1616 | 54 | `--color-sale` |
| Màu sao | #FFC107 | 24 | `--color-rating` |
| Nền | #FFFFFF, #F4F4F4, #F4F4F5, #F5F5F1 | 263 | `--color-background`, `--color-background-alt` (gộp F4F4F4/F4F4F5 → 1; F5F5F1 kem riêng cho block 8) |
| Nền tối | #1E1E1E (frame), #000000 | 17 | `--color-background-dark` (footer, hero overlay) |
| Bo góc | hero/card 8–12 | — | `--radius` |
| Lưới | nội dung 1416 trong 1920, lề 252 | — | `--page-width: 1416px` |

Ảnh: 196 image fill, toàn bộ là ảnh stock gắn trực tiếp — không có ảnh nào tách lớp; Dev lấy ảnh demo qua export node, không dùng làm asset theme.

Component instance dùng lặp: `Product name + price` (24), `Color Image`/`Color` swatch (95), `CTA Button` (9), `Menu` (14), `Lable` badge (18) → đây là 5 snippet dùng chung cần làm ở TE-1/TE-3.

## Quyết định CTO (27/10/2026; bổ sung 30/10: Figma giữ nguyên màu xám và 2 font lẻ — code theo tokens.json, xem docs/token-compliance.md)

1. 4 block ngoài SRS (#6 quiz, #9 bundle builder, #10 countdown, #11 video demo): GIỮ như thiết kế → thêm story TE-11, TE-12, TE-13 trong docs/srs.md. Trang chủ = 16 block.
2. Không có mobile trong Figma: Dev FE tự suy mobile; không chờ Designer.
3. Font heading Sofia Sans Condensed: có trong Shopify font library → dùng qua font_picker, không đổi font.
4. Xám chữ phụ: #999999 / #808080 trên nền sáng đổi thành #6B6B6B (đạt AA); #999999 chỉ dùng trên nền tối. Xem docs/tokens.json `_contrast`.
5. Announcement bar: Figma không có → giữ setting trong TE-1 nhưng mặc định rỗng (không hiện).
