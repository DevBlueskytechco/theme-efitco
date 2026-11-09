---
title: Kinh nghiệm audit theme Purity theo bộ tiêu chí UX và benchmark đối thủ (Impact, Concept, Prestige, Wonder, Glozin…)
type: Kinh nghiệm
scope: Bài học rút ra từ lần đánh giá Purity theo 7 nhóm UI + checklist từng trang; những quyết định đã chốt, điểm còn phải cải tiến và cách đối thủ làm
source: Cột "Đề xuất cải thiện vào theme (đánh giá)", "Áp dụng vào theme", "Đối thủ" trong các sheet tiêu chí; sheet "Note task", "Popup" (Designer - Nghiên cứu UX.xlsx; Nextsky - Bộ tiêu chí UX.xlsx; NGHIÊN CỨU UX_UI.xlsx)
---

# Kinh nghiệm audit theme Purity & benchmark đối thủ

Mục đích: Designer dùng làm bài học cho theme tiếp theo – cái gì đã quyết, cái gì hay bị sót, cái gì đối thủ đang làm tốt hơn.

---

## 1. Cách tiến hành một lần audit

1. Chấm theo 7 nhóm UI (Thẩm mỹ → Định hướng → Hiểu & hành động → Tương tác mua hàng → Nhất quán → Accessibility → Aesthetic-usability), mỗi tiêu chí ghi: Đạt / Cần cải tiến / Chưa có / Cần review / Chưa đánh giá được hết.
2. Chấm theo từng trang (Homepage, Collection, PDP, Search, Cart, Account, Order, Site-wide) với mã guideline Baymard, mức ưu tiên và % site lớn tuân thủ – để biết điểm nào vừa phổ biến vừa đang bị bỏ qua.
3. Ghi "Đề xuất cải thiện" cụ thể thành con số hoặc hành động (ví dụ "container 1440 / gutter 24", "thêm Save $13 (10% off)"), kèm link ảnh chụp (monosnap/prnt.sc) để dev hiểu.
4. Đối chiếu đối thủ cùng ngành (Impact, Concept, Prestige, Wonder, Glozin, Gently, Eurus, Flow, Symmetry…) ở đúng hạng mục đang đánh giá.
5. Phân trách nhiệm: Marketing lo nội dung/mùi thông tin; Designer lo visceral + behavioral; BE/app với các tính năng ngoài theme.
6. Mục nào phụ thuộc Shopify checkout, app (review, wishlist, huỷ đơn, newsletter) hoặc BE thì ghi rõ để không đổ vào việc của Designer.

## 2. Những quyết định đã chốt cho Purity (dùng làm chuẩn tham chiếu)

**Grid & spacing**
- Container 1440 / 12 column / gutter 24px; mobile 4 column / gutter 12–16 / margin 20.
- Section spacing desktop 100px, mobile 60px; heading → nội dung 40px (có thể 50) / mobile 30; card gap 24 / mobile 12–16.
- Đối thủ: Impact container 1600, Concept 1900 – NextSky chọn 1440 nhỏ hơn.

**Button**
- Desktop 56px cao (có thể 58–60) × padding 30px; mobile 50px × padding 24px; gap button 20px; font 16px; label 2–3 (tối đa 4) từ.
- Impact: 60px, padding 40; Concept: 60px, padding 30.
- Chia lại primary/secondary; bổ sung trạng thái disabled (đang thiếu).

**Màu chữ**
- Tham chiếu heading: Material #1c1b1d, HIG #1d1d1f, Polaris #1c1e1e. Impact heading/body #1a1a1a (body opacity 0.7); Concept #171717.
- Giá: team chọn tăng cỡ chữ giá thay vì đổi màu, vì giá đang đỏ và nhiều chỗ giá đen theo phong cách minimal đen trắng – đổi màu sẽ loạn.

**Typography**: 1 font sans-serif – đạt; body 16px – đạt; weight và line-height cần trao đổi (1.5 nếu 16px).

**Buy section**
- Highlight Add to Cart thay Buy Now.
- Thêm "Save $13 (10% off)" cạnh giá giảm; show giá trị lớn hơn giữa số tiền và %.
- Giá cũ nhỏ hơn một cấp/xám mờ; tooltip giải thích Buy 1 Get 1; text "tax included" như Wonder.
- "Today's Big Deals" countdown đang chen giữa giá – lựa chọn – nút mua → đưa lên trên giá như Shopee.
- Thêm thời gian giao dự kiến cho pre-order.
- Link "View return policy" sau "100-day money back" hoặc đổi thành "Free 30-day returns & exchanges".

**PDP layout**
- Không dùng sticky TOC, dùng sticky add to cart (nếu theme digital thì xem xét TOC như Amazon).
- Mở sẵn 1 tab quan trọng; đổi "Product info" → "Product Benefits & Description", "FAQ" → "Shipping & Return FAQs"; thêm title cho khối info cạnh ảnh.
- Các section đang dính nhau → nền khác màu nhẹ (#F7F7F7, #FAFAFA) + tiêu đề lớn + divider.
- Gallery: setup 1 layout thumb trái hoặc bottom; thêm option hover zoom/click zoom như Glozin.
- Cross-sell: "Frequently bought together" đổi vị trí ngay dưới product như Amazon; sắp xếp lại data related/upsell.

**Cart**
- Minicart: ảnh nhỏ như cart page; "You may also like" ngay dưới sản phẩm, remove sau khi add; gọn free shipping, không sticky; option show discount coupon; gift wrap chuyển sang cart page và sửa logic như Sephora.
- Cart page: item lên đầu; icon thùng rác thay nút remove; chỉ đơn giá; list 2 item/row mobile; header chỉ back + title (cân nhắc setting); icon khoá trước nút checkout; sticky footer tổng tiền + nút thanh toán; "Estimate your delivery cost" + icon xe tải; icon gói quà cho gift wrap; add cart lần 1 popup, lần 2 message; nút Edit item mở popup như Vans/Shopee; countdown cutoff ở cart như ASOS (Glozin đã làm); giỏ trống có CTA + sản phẩm gợi ý; option ẩn thông tin không cần trên mobile; thêm page find store.

**Collection**
- Text kết quả "3 items found" thay "8 of 11 products"; mobile phải show.
- Filter: sticky như Shopee; số lượng filter đang áp cạnh text Filter; Clear all dưới Apply; filter ≤ 7 option; sort dạng popup trên mobile; thiếu sort theo đánh giá; mặc định sort pha trộn.
- Badge thêm New, Best seller (đang chỉ sale %, Pre-order, Buy 1 Get 1).
- Product card: tích hợp slider nhiều ảnh (làm option); swatch và đổi ảnh theo swatch trên PLP/mobile chưa có; wishlist guest chưa có; "đã thêm vào giỏ" chưa có (gợi ý đổi màu nền icon cart).

**Search**: placeholder "Search t-shirt, sweater, dress…"; ≤ 5 gợi ý; gợi ý scope danh mục; no-result custom; sửa chính tả; gợi ý từ khoá thay thế; sắp xếp Product/Page/Blog như Prestige Allure.

**Header/footer**: icon search touch 40×40 → cần 44×44; hover/active cho nút điều hướng chưa có; newsletter lên đầu footer; announcement bar thêm link.

**Homepage**: phân lại CTA chính/phụ; fix banner slideshow, thông điệp ảnh + text, không ảnh stock; shoppable và review block thị giác chưa tốt, item/cart dày; product finder thêm short description, CTA "Find My Routine", loading "Matching your routine…", show lại lựa chọn trên collection.
- Mobile homepage: thêm section blog (Tips chăm sóc da); block "Ưu đãi đặc biệt hôm nay" sau banner hoặc announcement bar "Giảm giá đến 30% – [Xem ngay]"; chưa có Recently Viewed; carousel tự xoay → thay bằng section dọc.

**Account/Order**: chưa có dropdown account và trạng thái đăng nhập; sau login dẫn về trang đang xem; thông báo thành công khi đổi địa chỉ; đặt địa chỉ mặc định tại danh sách; đơn hàng gần đây trên dashboard; block "Bạn cần giúp?" gắn mã đơn; link đổi trả và ngày giao dự kiến trên trang đơn (app/Liquid).

**Popup/drawer mobile**: chuẩn hoá – menu drawer trái 90% icon x; search drawer phải 90%; filter drawer trái 90% style ngang Fashion Nova; các popup khác từ dưới lên có icon x, header, icon vuốt xuống (vùng vuốt gồm cả header); minicart 2 option (popup dưới lên / drawer).

**Motion**: icon box và media with text dùng fade in; drawer mở 250ms đóng 200ms; hover submenu liên tục không chạy lại hiệu ứng; animation chỉ trigger 1 lần.

## 3. Lỗi hay gặp khi làm theme (rút từ audit)

- Quên trạng thái disabled cho button; quên hover/active cho icon header.
- Touch target icon chỉ 40×40 (cần 44×44 mobile).
- Section không có visual separation – các khối grid liên tiếp hoà vào nhau.
- Tiêu đề section chung chung ("Product info", "FAQ").
- CTA giống nhau ("Shop Now") không nói rõ đích; label chung chung.
- Giá nhỏ, chìm trong Buy section; khuyến mãi tách xa giá; countdown chen giữa.
- Placeholder thay label trong form (mất khi gõ); thông báo lỗi biến mất quá nhanh.
- Không giữ filter/sort khi back từ PDP; không giữ vị trí scroll khi quay lại list.
- Thumbnail không đổi theo swatch/filter màu; thiếu ảnh in-scale, lifestyle, trên người mẫu, phụ kiện đi kèm.
- Thiếu skeleton cho ảnh product card tải chậm trên mobile.
- Quick view lưu nhầm hành vi sản phẩm trước; hiệu ứng đóng submenu mobile lỗi.
- Các chức năng tương tự (shoppable video, lightbox, quick view) có logic mở/đóng khác nhau.
- Demo review mỗi sản phẩm chưa đủ 6; chỉ 1 sản phẩm có video; tên sản phẩm quá ngắn, không mô tả công dụng/dung tích.
- Popup newsletter hiện ngay khi vào – demo chuyển sang before-you-leave; exit-intent cần option ẩn mobile.
- Mobile menu, cart, filter, search không full page.

## 4. Điều đối thủ làm tốt (tham chiếu nhanh)

- Impact / Concept: container lớn (1600 / 1900), CTA 60px.
- Prestige: swatch ở viewport 1 trên PDP mobile; search results tách Product/Page/Blog; đa dạng kiểu drawer/popup.
- Wonder: giá kèm "tax included"; popup full width có icon x.
- Glozin: hover zoom / click zoom; countdown cutoff ở cart.
- Gently: tooltip giải thích Buy 1 Get 1 (bold-lash-mascara).
- Sephora: sticky add to cart luôn hiện kèm số lượng; gift ở cart; mini-slider ảnh trong card; thanh tiến trình video; wishlist guest.
- Amazon: FBT ngay dưới product; sticky TOC cho digital.
- Shopee: countdown trên giá; filter sticky; popup edit item trong cart; sticky video nhỏ.
- Vans: edit item trong cart bằng popup.
- ASOS: countdown order cutoff.
- Fashion Nova: filter drawer style ngang.
- Eurus / Charm: popup từ dưới lên fit-content hoặc 85% có title, icon x.
- Empire / Boost: không mini cart, chỉ message add to cart – cách tối giản khác.
- theordinary.com: shoppable video show text "vuốt xuống để xem video tiếp".
- Apple / Shopify pricing: hiệu ứng click button.

## 5. Phân bổ trách nhiệm theo cấp độ Norman

- Nội dung / mùi thông tin → Marketing.
- Giao diện bắt mắt (visceral) + tương tác mượt (behavioral) → Designer.
- Giá trị và ý nghĩa sâu sắc (reflective) → thương hiệu + nội dung + tính năng (badge thành viên, câu chuyện brand).
