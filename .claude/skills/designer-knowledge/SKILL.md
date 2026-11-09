---
name: designer-knowledge
description: Bộ kiến thức Designer của CTO (09/11/2026): DoD Theme Store, khung tiêu chí UX NextSky, quy tắc grid, màu, typo, CTA, form, popup, motion, checklist từng trang (home, collection, PDP, search, cart, account), bài học NN/g và Don Norman, kinh nghiệm audit. Dùng trước khi viết UI spec, mockup, token hoặc ui_diff.
---
Bộ kiến thức do CTO soạn (thư mục designer-knowledge, 09/11/2026), bản lưu có lịch sử ở `ai-team/knowledge/designer/`.
Đây là tài liệu tra cứu: mở đúng file cần cho việc đang làm, không đọc hết 23 file.

Đi kèm: quyết định đã chốt ở `docs/design/decisions.md`, dữ liệu thật cho mockup ở `docs/design/demo-data.json`.
Thứ tự ưu tiên khi mâu thuẫn: quyết định CTO trong ticket > AGENTS.md > DESIGN.md > Figma > bộ kiến thức này.
Trạng thái Đạt / Cần cải tiến / Chưa có trong các checklist là của theme Purity lúc audit; với Efitco phải chấm lại.

## Đọc gì theo việc
- UI spec một trang: checklist trang đó (07–14) + quy tắc 03–06; có popup, drawer, carousel, motion thì thêm 15 và 22.
- Mockup, chọn bố cục, màu, chữ: 03, 06, 19.
- Viết chữ demo (heading, CTA, tab, tên collection): 21, 18.
- ui_diff, audit: checklist trang + 20; mức lệch theo skill ui-diff.
- Trước khi coi là xong để submit Theme Store: 01, 06, 14.
- Cần lý do cho một đề xuất: 16–19, 22. Ghi nguồn (số file, mục) cạnh mỗi `ĐỀ XUẤT:` trong spec.

## Danh sách file
| File | Loại | Phạm vi |
|---|---|---|
| `reference/00-muc-luc-kien-thuc-designer.md` | Tài liệu | Điểm vào của bộ kiến thức; cách tra cứu, quy ước loại tài liệu, nguồn gốc dữ liệu |
| `reference/01-dod-shopify-theme-store-designer.md` | Checklist | Áp dụng cho mọi theme NextSky trước khi submit lên Shopify Theme Store (thiết kế + demo store) |
| `reference/02-khung-tieu-chi-ux-nextsky.md` | Tài liệu | Khung tổng thể để Designer đánh giá và thiết kế theme Shopify; các file quy tắc/checklist khác đều bám theo khung này |
| `reference/03-quy-tac-tham-my-grid-mau-typo-khoang-trang.md` | Quy tắc | Áp dụng cho toàn bộ giao diện theme (desktop + mobile), là nhóm tiêu chí "ấn tượng đầu tiên" |
| `reference/04-quy-tac-dinh-huong-nhan-biet-cta-label-navigation-form.md` | Quy tắc | Header, menu, breadcrumbs, tabs, search bar, button CTA, label, form, notification trên toàn theme |
| `reference/05-quy-tac-hieu-hanh-dong-dung-va-tuong-tac-mua-hang.md` | Quy tắc | Homepage 5 giây, affordance, visual hierarchy, choice overload; CTA thumb zone, tooltip, trạng thái tương tác, thông báo lỗi |
| `reference/06-quy-tac-nhat-quan-accessibility-aesthetic-usability.md` | Quy tắc | Tính nhất quán layout/màu/typo/icon, responsive consistency, auto-fill; chuẩn WCAG; visual rhythm, imagery, eye comfort, dark mode |
| `reference/07-checklist-homepage-desktop-mobile.md` | Checklist | Yêu cầu xây dựng trang chủ theme Shopify; phần desktop và phần mobile (Baymard Mobile Web Homepage, Category Navigation, Personalization) |
| `reference/08-checklist-collection-plp-filter-sort.md` | Checklist | Trang collection, trang kết quả tìm kiếm dạng list, product card, filter, sort trên desktop và mobile |
| `reference/09-checklist-product-page-layout-gallery-media.md` | Checklist | Cấu trúc trang sản phẩm, thứ tự section, collapsed sections, sticky CTA, cross-sell, gallery, số lượng và loại ảnh sản phẩm, video |
| `reference/10-checklist-product-page-description-variant-buy-section-review.md` | Checklist | Nội dung mô tả sản phẩm, variant selector, spec sheet, khu vực mua (giá, khuyến mãi, CTA, số lượng, lưu sản phẩm), thông tin vận chuyển/đổi trả/quà tặ |
| `reference/11-checklist-search-popup-autocomplete-results.md` | Checklist | Search popup/drawer trong header, autocomplete, search results page, no-result page trên desktop và mobile |
| `reference/12-checklist-cart-minicart-checkout.md` | Checklist | Mini cart/drawer, cart page, overlay "Added to cart", checkout (phần theme có thể can thiệp và phần Shopify checkout đã làm sẵn), order confirmation |
| `reference/13-checklist-customer-account-order-tracking-returns.md` | Checklist | Khu vực tài khoản khách hàng, trang đơn hàng, email trạng thái, luồng trả hàng |
| `reference/14-checklist-site-wide-mobile-fundamentals.md` | Checklist | Các tính năng dùng chung toàn site và chuẩn mobile áp dụng cho mọi trang |
| `reference/15-quy-tac-popup-drawer-overlay-motion-carousel.md` | Quy tắc | Mọi popup/drawer trên theme (newsletter, mini cart, menu, search, quick view, offer, pickup, ask a question, localization, filter & sort, password, be |
| `reference/16-bai-hoc-design-of-everyday-things-don-norman.md` | Bài học | Nền tảng tư duy thiết kế cho Designer: discoverability, understanding, 7 nguyên lý, 2 khoảng cách, 7 giai đoạn hành động, 3 cấp độ cảm xúc, tri thức t |
| `reference/17-bai-hoc-nngroup-hanh-vi-nguoi-dung-web.md` | Bài học | Nền tảng hành vi để Designer quyết định bố cục, nội dung, vị trí CTA trên theme |
| `reference/18-bai-hoc-nngroup-noi-dung-link-dieu-huong.md` | Bài học | Cách viết và tổ chức nội dung trên theme/demo; cách thiết kế link, menu, breadcrumb, footer |
| `reference/19-bai-hoc-nngroup-visual-design-xu-huong-ecommerce-responsive.md` | Bài học | Nguyên lý thị giác và quyết định responsive cho theme; tham chiếu khi chọn hướng thẩm mỹ, breakpoint, phân bổ nội dung giữa thiết bị |
| `reference/20-kinh-nghiem-audit-theme-purity-va-benchmark-doi-thu.md` | Kinh nghiệm | Bài học rút ra từ lần đánh giá Purity theo 7 nhóm UI + checklist từng trang; những quyết định đã chốt, điểm còn phải cải tiến và cách đối thủ làm |
| `reference/21-kinh-nghiem-viet-noi-dung-demo-theo-mui-thong-tin.md` | Kinh nghiệm | Áp dụng khi Designer/Marketing viết text cho demo store (slideshow, product card, tab, collection, testimonial) để pass yêu cầu nội dung thật của Shop |
| `reference/22-bai-hoc-nngroup-thiet-ke-tuong-tac-web.md` | Bài học | Lý do và bối cảnh phía sau các quy tắc tương tác trong file 15; dùng khi cần cân nhắc có nên dùng một pattern hay không |
