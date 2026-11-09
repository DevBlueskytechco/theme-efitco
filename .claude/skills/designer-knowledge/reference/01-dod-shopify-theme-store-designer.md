---
title: Definition of Done (DoD) cho Designer – điều kiện pass yêu cầu Shopify Theme Store
type: Checklist
scope: Áp dụng cho mọi theme NextSky trước khi submit lên Shopify Theme Store (thiết kế + demo store)
source: File "Bộ tiêu chí Definition of Done DOD cho Designer.xlsx"; tài liệu chính thức shopify.dev
---

# Definition of Done (DoD) cho Designer – pass yêu cầu Shopify Theme Store

Một thiết kế theme chỉ được coi là **Done** khi đạt đủ 6 bộ tiêu chí phần Thiết kế và 2 bộ tiêu chí phần Demo store dưới đây. Mỗi mục đều có link tài liệu gốc của Shopify để đối chiếu khi review.

---

## PHẦN A – THIẾT KẾ

### Bộ tiêu chí số 1: Sự độc đáo so với các theme khác (Uniqueness from other themes)

Tài liệu: https://shopify.dev/docs/storefronts/themes/store/requirements#2-uniqueness-from-other-themes

- [ ] Nhận diện độc đáo – theme có bản sắc riêng, không trùng lặp với theme đã có trên Theme Store.
- [ ] Tập trung vào ngành nghề cụ thể (ví dụ: beauty, fashion, digital…).
- [ ] Phong cách nghệ thuật sáng tạo.
- [ ] Tính đồng nhất trên toàn bộ giao diện – mọi page, section, component cùng một ngôn ngữ thiết kế.

### Bộ tiêu chí số 2: Khả năng tiếp cận (Accessibility)

Tài liệu: https://shopify.dev/docs/storefronts/themes/best-practices/accessibility#page-structure

- [ ] Tiêu đề (Headings) – cấu trúc heading đúng thứ bậc.
- [ ] Biểu mẫu (Forms) – có label rõ ràng.
- [ ] Lỗi trong biểu mẫu (Form errors) – hiển thị lỗi rõ, dễ hiểu.
- [ ] Màu sắc và độ tương phản (Color and contrast) – kiểm tra cho văn bản, biểu tượng (icons), phần tử nhập liệu (input borders).
- [ ] Màn hình cảm ứng và thiết bị di động (Touch screen and mobile devices).
- [ ] Kích thước mục tiêu chạm (touch target) đủ lớn.

### Bộ tiêu chí số 3: Thiết kế theme Shopify (Designing Shopify themes)

Tài liệu: https://shopify.dev/docs/storefronts/themes/best-practices/design

Nguyên tắc thiết kế cho trải nghiệm của người bán (merchant experience):
- [ ] Có mục đích (Purposeful)
- [ ] Dễ dàng thiết lập (Easy to set up)
- [ ] Độ bền và chống mong manh (Antifragile)
- [ ] Linh hoạt (Flexible)
- [ ] Mở rộng (Extensible)

Nguyên tắc thiết kế cho trải nghiệm khách hàng (customer experience):
- [ ] Dễ tiếp cận (Accessible)
- [ ] Biểu cảm (Expressive)
- [ ] Trực quan (Intuitive)
- [ ] Gắn kết (Cohesive)
- [ ] Hiệu quả (Efficient)

### Bộ tiêu chí số 4: Hệ thống màu sắc (Color system)

Tài liệu:
- https://shopify.dev/docs/storefronts/themes/best-practices/design/color-system
- https://shopify.dev/docs/storefronts/themes/store/requirements#16-color-system

- [ ] Bảng màu (Color schemes): số lượng màu sắc, đa dạng bảng màu (Color scheme diversity).
- [ ] Vai trò của màu sắc (Color scheme roles) được định nghĩa rõ.
- [ ] Quy ước đặt tên (Naming conventions) đúng chuẩn.
- [ ] Màu sắc bổ sung ngoài bảng màu được xử lý đúng.
- [ ] Không có màu sắc cố định (Hardcoded colors).
- [ ] Yêu cầu tối thiểu 4 màu.
- [ ] Tất cả cài đặt màu nền (background color) phải kèm theo cài đặt màu tiền cảnh (foreground color) tương ứng.

### Bộ tiêu chí số 5: Thiết kế theme và trải nghiệm người dùng (Theme design and UX)

Tài liệu: https://shopify.dev/docs/storefronts/themes/store/requirements#14-theme-design-and-ux

- [ ] Định hướng nghệ thuật (Art direction)
- [ ] Bố cục (Layout)
- [ ] Tính nhất quán (Consistency)
- [ ] Khả năng tiếp cận (Accessibility)
- [ ] Trải nghiệm người dùng (Customer UX)
- [ ] Trải nghiệm người bán (Merchant UX)

### Bộ tiêu chí số 6: Phông chữ (Fonts)

Tài liệu: https://shopify.dev/docs/storefronts/themes/architecture/settings/fonts

- [ ] Use fonts from Shopify's font library – chỉ dùng font trong thư viện font của Shopify.
- [ ] Available fonts – kiểm tra font đã chọn có trong danh sách font khả dụng.

---

## PHẦN B – DEMO STORE

### Bộ tiêu chí số 1: Demo store requirements

- [ ] Each preset requires a demo store. You can use up to 5 demo stores for each theme. (Mỗi preset cần 1 demo store, tối đa 5 demo store/theme.)
- [ ] All demo store pages must use authentic text content. Don't use Lorem Ipsum or onboarding text. Don't include profanities. (Toàn bộ page dùng nội dung thật, không Lorem Ipsum, không text onboarding, không từ ngữ thô tục.)
- [ ] Affiliate linking isn't allowed. (Không link affiliate.)
- [ ] Demo store chỉ được trình diễn các thành phần và chức năng có sẵn trong theme, để tránh gây nhầm lẫn cho merchant. Cụ thể:
  - Không nhúng text hoặc button vào trong ảnh, trừ text trên sản phẩm vật lý, infographic, badge hoặc ảnh Instagram.
  - Không dùng ảnh gif động ở những chỗ có thể bị nhầm là chức năng của theme.
  - Không dùng app. Một số trường hợp đặc biệt được xem xét với app review miễn phí và app dịch miễn phí. Nếu trình diễn đa ngôn ngữ bằng app dịch thì toàn bộ nội dung phải được dịch.
- [ ] Phải có quyền sử dụng hợp lệ cho toàn bộ asset của demo store theo Shopify Partner Agreement. Trước khi dùng tên thương hiệu, hình ảnh hoặc nội dung nào, phải được chủ thương hiệu cấp phép trực tiếp.
- [ ] Nguồn ảnh miễn phí bản quyền gợi ý: Shopify Burst.

### Bộ tiêu chí số 2: Demo store recommendations

Tài liệu: https://shopify.dev/docs/storefronts/themes/store/requirements#demo-store-recommendations

- [ ] Identify the source of any product images used in the product description. (Ghi rõ nguồn ảnh sản phẩm dùng trong mô tả sản phẩm.)
- [ ] Incorporate built-in Shopify features to showcase the power and capabilities of your theme. (Tận dụng tính năng có sẵn của Shopify để thể hiện sức mạnh của theme.)
- [ ] Illustrate the versatility and variability of your theme: có ví dụ sản phẩm đang sale, sản phẩm/variant hết hàng (sold-out), sản phẩm nhiều biến thể, và sản phẩm gift card.

---

## Cách dùng DoD này

1. Designer tự check từng mục trước khi bàn giao bản thiết kế / demo store.
2. Mục nào chưa đạt phải ghi rõ lý do và kế hoạch xử lý, không được bỏ qua.
3. Khi review, luôn mở link tài liệu Shopify tương ứng để đối chiếu phiên bản yêu cầu mới nhất – requirements của Shopify có thể thay đổi.
4. DoD này là điều kiện cần (pass Shopify). Điều kiện đủ về chất lượng UX nằm trong bộ tiêu chí UX NextSky (xem các file quy tắc và checklist theo trang).
