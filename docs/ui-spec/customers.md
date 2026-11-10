KHÔNG CHẮC: (1) Header dùng tài khoản mới `<shopify-account>` (blocks/header.liquid, SRS TE-1 AC3); 7 template dưới đây chỉ chạy khi store bật tài khoản cũ (classic). Chưa biết store dev bật loại nào, có dựng hay không → hỏi Tech Lead ES1-T269. (2) demo-data không có khách, đơn, địa chỉ: đơn #1009–#1012 và 2 địa chỉ trong mockup là mẫu ghép từ giá sản phẩm thật, phí ship $12.00 tự đặt → hỏi BA ES1-T270. (3) Ảnh sản phẩm store dev lệch tên (ES1-T245): thumbnail giữ URL demo-data. (4) Không đọc được shopify.dev trong phiên: chuỗi lỗi Shopify (mật khẩu tối thiểu 5 ký tự, "Incorrect email or password") theo hiểu biết, Dev FE kiểm lại khi dựng.

# UI spec: Trang tài khoản khách (ES1-T259)

Mục đích: người mua đăng nhập, tạo tài khoản, lấy lại mật khẩu, xem trạng thái và chi tiết đơn, quản lý địa chỉ giao hàng mà không cần JS. Story TE-9 (trang phụ); không có AC riêng trong SRS cho tài khoản.

Figma: không có (chỉ trang chủ 1:359). Ngôn ngữ thị giác theo foundation (`docs/ui-spec/foundation.md`, ES1-T251). Mọi bố cục và trạng thái dưới đây là `ĐỀ XUẤT:` theo nguồn ghi kèm.

Đầu ra:
- Spec này.
- `drafts/designer/ES1-T259/customers.html` (1 file, nhúng `../_kit/kit.css`): khung 1–7 là 7 trang, khung 8 là trạng thái S1–S10.
- `drafts/designer/ES1-T259/customers-360|768|1280|1920.png`.

Quy ước bảng thiết kế: file mockup có 1 `h1` cho cả bảng nên tiêu đề trang trong khung là `h2.h1`, khối là `h3`, thẻ là `h4`. Trong template: tiêu đề trang `h1`, khối `h2`, thẻ `h3`.

---

## 1. Trang và template

| # | Template | URL | Form Liquid | Khung mockup |
| --- | --- | --- | --- | --- |
| 1 | `templates/customers/login.liquid` | `routes.account_login_url` | `customer_login`, `recover_customer_password` (#recover) | 1, S1, S2 |
| 2 | `templates/customers/register.liquid` | `routes.account_register_url` | `create_customer` | 2, S3 |
| 3 | `templates/customers/reset_password.liquid` | link trong email | `reset_customer_password` | 3, S4 |
| 4 | `templates/customers/activate_account.liquid` | link trong email mời | `activate_customer_password` | 4 |
| 5 | `templates/customers/account.liquid` | `routes.account_url` | — | 5, S5, S8 (phân trang) |
| 6 | `templates/customers/order.liquid` | `order.customer_url` | — | 6, S7, S8 |
| 7 | `templates/customers/addresses.liquid` | `routes.account_addresses_url` | `customer_address` (thêm, sửa), POST xoá | 7, S6, S9, S10 |

Template là composition root (AGENTS.md): `{% block 'container' %}` → markup. ĐỀ XUẤT cho Dev FE (không bắt buộc): snippet `account-nav` (khung 5, 7), `order-status-pill`, `address-card`, `address-form` vì dùng lại ≥ 2 template. Header biến thể A (nền trắng, sổ quyết định 09/11), footer như mọi trang.

Settings merchant: không thêm. Trang chức năng, nội dung đến từ Shopify; AGENTS "add only settings the design needs".

---

## 2. Thành phần riêng (ngoài foundation)

Foundation dùng lại: header, footer, breadcrumb §5, page title §5, nút §6, input/form/lỗi §12, dialog §16, toast §17, rỗng/lỗi/đang tải §18.

| Thành phần | Anatomy | Kích thước, màu | Nguồn |
| --- | --- | --- | --- |
| Auth card | tiêu đề h1 + 1 câu mô tả (muted) · form · link phụ | < 48rem không viền, padding 0; ≥ 48rem viền 1px `--color-border`, bo `--radius-card`, padding 32; ≥ 80rem padding 48. Khoảng giữa trường 24 | foundation §12; 04 §5 |
| Auth aside (login) | h2 "New To Efitco?" · câu · 3 dòng lợi ích (icon tick 20 + chữ) · nút secondary "Create Account" | nền `--color-background-alt`, bo card, padding 24 / 32 / 48 | 12 #640D (nêu lợi ích tạo tài khoản) |
| Nút hiện mật khẩu | nút chữ "Show"/"Hide" trong ô, sát inline-end | 44 × 44, chữ 14/600 gạch chân, `aria-pressed`, `aria-controls`; ô chừa padding-inline-end 72 | 05 §5 (ngăn lỗi); cần BE (JS ~1 KB), không JS thì ẩn nút |
| Account nav | Orders · Addresses (n) · Log out | < 64rem: hàng pill cao 44, padding-inline 16, nền alt viền border, đang chọn nền foreground chữ background; cuộn ngang riêng nếu thiếu chỗ. ≥ 64rem: sidebar 240 (280 từ 80rem), dòng cao 48, đang chọn nền alt + vạch inline-start 3px foreground + 600, icon 20; Log out tách bằng gạch trên, sticky dưới header | 13 #866D, #881D; 04 §4 (active rõ, chưa chọn không mờ) |
| Pill trạng thái | icon 16 + chữ | cao 28, padding 10/12, bo pill, viền border, nền background, chữ foreground 13/600. Icon: check `--color-badge-new` (Paid, Fulfilled), đồng hồ `--color-muted` (Pending, Unfulfilled, Partially fulfilled), mũi tên quay lại `--color-muted` (Refunded, Partially refunded, Voided), cấm `--color-sale` (Cancelled). Pill "Default" địa chỉ: nền foreground chữ background | 01, 06 (không chỉ màu); DESIGN (badge_new không làm màu chữ) |
| Order card (đơn gần nhất) | h3 "Order #1012" · ngày + số món · 2 pill · tối đa 4 thumbnail 64 (+N) · dòng vận chuyển (icon xe + hãng + link tracking) · tổng + nút primary "View Order #1012" | viền border, bo card, padding 24 / 32; chân có gạch trên; < 48rem nút full width | 13 #873D |
| Bảng dữ liệu | `<table>` + `caption` ẩn, th 14/600 muted trên nền alt, td padding 16, cột tiền căn end | < 48rem: thead ẩn, mỗi `tr` thành thẻ lưới (xem §4). Bảng có `role="table/rowgroup/row/columnheader/cell"` tường minh vì đổi `display` làm Safari mất ngữ nghĩa bảng | 06 §2; Lighthouse/axe |
| Dải trạng thái đơn | `<dl>` 3 cột: Payment · Fulfillment (+ ngày) · Tracking (hãng, số, nút secondary "Track Package" mở tab mới) | nền alt, bo card, padding 24 / 32; < 48rem xếp dọc | 13 §6 (trạng thái nổi bật, gần đầu trang) |
| Dòng hàng | ảnh 80 (64 dưới 48rem) nền cream, `contain` · tên (link sản phẩm) · variant 14 muted · ghi chú (gift card, không cần ship) · text link "Buy again" · giá · SL · thành tiền 600 | | 13 §6 (mua lại) — xem câu CTO 3 |
| Tổng đơn | `<dl>`: Subtotal · Discount (nếu có, kèm tên) · Shipping (tên phương thức) · Tax (nếu có) · Total (18/700, gạch trên 1px foreground, mã tiền tệ 14 muted) · Refunded (nếu có) | ≥ 48rem rộng 360 căn inline-end | |
| Info card | tiêu đề Inter 18/600 · `<address>` · ghi chú 14 muted · text link | viền border, bo card, padding 24; biến thể `--soft` nền alt không viền (hộp hỗ trợ) | |
| Hộp hỗ trợ đơn | h3 "Need Help With This Order?" · câu có số đơn · nút secondary "Contact Us" (link `/pages/contact`) · link "Refund policy", "Shipping policy" từ `shop.policies` | | 13 §6 (liên hệ theo đơn, link đổi trả); TE-9 AC5 |
| Address card | pill Default (nếu mặc định) · tên 600 · `<address>` · hàng thao tác: Edit, Delete (chữ `--color-sale`), Set as default (chỉ thẻ không mặc định) | viền border; thẻ mặc định viền foreground; thao tác là nút chữ gạch chân cao 44, cách nhau 24, gạch trên 1px | 13 #904D, #916D, #888D |
| Form địa chỉ | xem §5.7 | mở tại chỗ: thẻ chiếm cả hàng (`grid-column: 1 / -1`), viền foreground | 13 #916D (phân biệt thêm và sửa bằng tiêu đề "Add New Address" / "Edit Address" và nút "Save Address" / "Update Address") |
| Nút nguy hiểm | như primary, nền `--color-sale`, chữ `--color-sale-foreground` (6.38); hover `color-mix(sale 85%, foreground)` | chỉ trong dialog xoá | không token mới |
| Phân trang | Previous · số trang · Next | ô 44 × 44, viền border, trang hiện tại nền foreground; < 48rem chữ Previous/Next ẩn (vẫn đọc được), chỉ mũi tên | foundation chưa có; dùng chung với collection (ES1-T254) nếu đã định nghĩa |

---

## 3. Layout theo mốc

Lề, cột, control theo foundation §1 (control 48 → 52 từ 80rem).

### Auth (login, register, reset, activate)

| | 360 | 768 | 1280 | 1920 |
| --- | --- | --- | --- | --- |
| Khung | 1 cột 320, card không viền | card 480 giữa, viền | login: 2 cột trong 1040 (form 1.1fr · aside 1fr, gap 48); 3 trang còn lại card 480 giữa | như 1280 (nội dung 1416, khung vẫn 1040 / 480) |
| Thứ tự | form → aside lợi ích (login) | như 360 | form trái, aside phải, cùng thứ tự DOM | |
| Họ, tên (register) | 2 dòng | 2 cột | 2 cột | 2 cột |
| Nút | full width | full width trong card | full width trong card; aside nút tự co | |
| Khoảng | padding-block 32 / 48 | 32 / 48 | 32 / 120 | 32 / 120 |

Không breadcrumb ở 4 trang auth (form tập trung, 1 nút chính above the fold ở 360: nút "Sign In" kết thúc ở y ≈ 640 sau header 80; 04 §1.4).

### Account, addresses

| | 360 | 768 | 1280 | 1920 |
| --- | --- | --- | --- | --- |
| Breadcrumb + h1 | Home / Account (/ Addresses) | | | |
| Nav | hàng pill dưới h1 | hàng pill | sidebar 240, gap 48, main 952 | sidebar 280, main 1088 |
| Lịch sử đơn | thẻ | bảng 5 cột | bảng | bảng |
| Account details | 2 thẻ xếp dọc | 2 cột | 2 cột | 2 cột |
| Thẻ địa chỉ | 1 cột | 2 cột, gap 24 | 3 cột | 3 cột |
| Nút "Add New Address" | cùng hàng tiêu đề khối, xuống dòng khi thiếu chỗ | | | |

### Order

| | 360 | 768 | 1280 | 1920 |
| --- | --- | --- | --- | --- |
| Dải trạng thái | 3 mục xếp dọc | 3 cột | 3 cột | 3 cột |
| Thân | dòng hàng (thẻ) → tổng → địa chỉ → hỗ trợ | bảng → tổng (360 căn phải) → 2 thẻ địa chỉ cạnh nhau → hỗ trợ full | 2 cột: main 1fr · aside 360, gap 48 | aside 400 |

Thứ tự DOM giống nhau mọi mốc (06 §2). Trạng thái và tracking nằm trước dòng hàng ở mọi mốc để không bị đẩy xuống cuối trên mobile (13 §6).

### Dòng bảng dưới 48rem

- Lịch sử đơn: lưới `auto auto 1fr`, vùng `order order total / date date date / pay ful .` → hàng 1 "#1012" (link) + tổng phải; hàng 2 ngày 14 muted; hàng 3 hai pill.
- Dòng hàng: lưới `64px auto auto 1fr`; ô sản phẩm chiếm cả hàng; hàng 2 "Price $34.99" · "Qty 2" (nhãn bằng `::before content: attr(data-label)`, muted) · thành tiền căn end.

---

## 4. Nội dung và dữ liệu Shopify

| Phần | Liquid | Ghi chú |
| --- | --- | --- |
| Lời chào | `customer.first_name`, `customer.email` | thiếu tên thì chỉ "Signed in as {email}" |
| Đơn gần nhất | `customer.orders.first` | ẩn khối khi 0 đơn (thay bằng S5) |
| Lịch sử | `{% paginate customer.orders by 20 %}` | phân trang khi > 20 |
| Pill | `order.financial_status_label`, `order.fulfillment_status_label`; huỷ: `order.cancelled` → pill Cancelled thay pill fulfillment | chữ do Shopify dịch; icon chọn theo `financial_status` / `fulfillment_status` |
| Huỷ | `order.cancelled_at`, `order.cancel_reason_label`, `order.total_refunded_amount` | hộp info `role="status"` dưới tiêu đề (S7) |
| Tracking | `line_item.fulfillment.tracking_company / tracking_number / tracking_url`, `fulfillment.created_at` | nhiều kiện: mỗi kiện 1 dòng; không có URL thì chỉ chữ; chưa giao: "Not shipped" muted |
| Dòng hàng | `line_item.image`, `title`, `variant.title` (ẩn khi "Default Title"), `original_price`, `final_price`, `quantity`, `final_line_price`, `line_level_discount_allocations`, `requires_shipping`, `gift_card` | ảnh `image_url: width: 160` (2x của 80), `alt=""` vì tên đứng cạnh; không ảnh → placeholder SVG trên cream (S8) |
| Tổng | `order.subtotal_price`, `discount_applications`, `shipping_methods`, `tax_lines`, `total_price`, `currency` | |
| Thanh toán | `transaction.gateway_display_name`, `payment_details.credit_card_last_four_digits` | KHÔNG CHẮC tên trường; thiếu thì bỏ dòng "Paid with…" |
| Địa chỉ | `customer.addresses`, `customer.default_address`, `address \| format_address` | thẻ mặc định đứng đầu |
| URL | `routes.account_*`, `order.customer_url`, `shop.policies` (refund, shipping), `routes.all_products_collection_url`, `routes.collections_url` | không nhập tay URL (AGENTS, TE-9 AC5) |

Copy (locale `customers.*`, American English; CTA Title Case theo DESIGN.md, như "Add To Cart" 07/11). Locale hiện có `customers.login.title` "Login", `submit` "Sign in" → đổi `submit` thành "Sign In" cho cùng giọng CTA.

| Key đề xuất | Chuỗi |
| --- | --- |
| `customers.login.title / subtitle / submit / forgot` | Login · Sign in to see your orders and saved addresses. · Sign In · Forgot your password? |
| `customers.login.new_title / new_text / benefit_1..3 / new_cta` | New To Efitco? · Create an account to check out faster and keep every order in one place. · Track orders and shipping status · Save addresses for faster checkout · See your full order history · Create Account |
| `customers.login.error_title / error_text` | Incorrect email or password · Check both fields and try again, or reset your password. |
| `customers.recover.title / text / submit / cancel / success_title / success_text` | Reset Your Password · We'll email you a link to set a new password. · Send Reset Link · Back to login · Check your email · If an account exists for {{ email }}, you'll get a reset link in a few minutes. |
| `customers.register.title / subtitle / first_name / last_name / marketing / submit / have_account / log_in` | Create Account · Check out faster and track every order. · First name · Last name · Email me about new gear and offers · Create Account · Already have an account? · Log in |
| `customers.password.show / hide / hint` | Show · Hide · Use at least 5 characters. |
| `customers.reset.title / text / new / confirm / submit / mismatch` | Reset Account Password · Enter a new password for {{ email }}. · New password · Confirm new password · Reset Password · Passwords don't match. Type the same password in both fields. |
| `customers.activate.title / text / submit / decline` | Activate Account · Create a password to activate your account. · Activate Account · Decline Invitation |
| `customers.account.title / greeting / nav_label / orders / addresses / log_out / recent / history / details / default_address / manage_addresses / view_order / items_count / empty_title / empty_text / empty_cta / empty_link` | My Account · Hi {{ name }}, signed in as {{ email }} · Account · Orders · Addresses · Log out · Recent Order · Order History · Account Details · Default Address · Manage addresses ({{ count }}) · View Order {{ name }} · {{ count }} items · No Orders Yet · When you place an order, you'll find it here with its status and tracking. · Shop All Products · Browse collections |
| `customers.order.*` | Order {{ name }} · Placed on {{ date }} · Payment · Fulfillment · Tracking · Track Package · Not shipped · Buy again · Subtotal · Shipping · Total · Refunded · Shipping Address · Billing Address · Need Help With This Order? · Questions about delivery, a return or a missing item? Include order {{ name }} and we reply within 1 business day. · Contact Us · Order cancelled on {{ date }} · Sent by email, no shipping · No shipping required · (opens in a new tab) |
| `customers.addresses.*` | Addresses · {{ count }} saved addresses · Saved Addresses · Add New Address · Edit Address · Default · Edit · Delete · Set as default · Save Address · Update Address · Cancel · Fields marked * are required. · Delete This Address? · Keep Address · Delete Address · Address saved · No Saved Addresses · Save an address to check out faster next time. |

"Contact Us" đứng một mình là chữ link mô tả đích (trang Contact), không thuộc nhóm "Learn more" bị Lighthouse bắt; "Edit"/"Delete"/"Buy again" có phần chữ ẩn nêu đối tượng (tên riêng mỗi nút).

---

## 5. Trạng thái

| # | Trang | Trạng thái | Thiết kế | Nguồn |
| --- | --- | --- | --- | --- |
| 5.1 | Login | Lỗi đăng nhập (S1) | `form.errors` → hộp lỗi đầu form `role="alert" tabindex="-1"`, focus vào hộp sau tải lại; giữ email, xoá mật khẩu; link "reset your password" trong câu. Không đánh dấu riêng trường (Shopify không nói trường nào sai) | foundation §12; 05 §4 |
| 5.2 | Login | Quên mật khẩu, đã gửi (S2) | `#recover`: form thay chỗ form đăng nhập bằng `:target` (không JS), heading "Reset Your Password". `form.posted_successfully?` → hộp success `role="status"`, câu chung "If an account exists…" (không lộ email có tồn tại; 13 #889D không làm vì bảo mật) | 13 #889D; foundation §12 |
| 5.3 | Register | Email đã có, mật khẩu ngắn (S3) | Hộp tóm tắt "Check 2 fields" + lỗi inline từng trường, `aria-invalid`, `aria-describedby`; email đã có kèm 2 link Log in / reset. Map `form.errors` theo trường (`email`, `password`) | 05 §4; foundation §12 |
| 5.4 | Reset, activate | 2 mật khẩu không khớp (S4) | Lỗi inline dưới ô xác nhận; kiểm phía client khi rời trường nếu có JS, server vẫn trả lỗi | 05 §4.6 |
| 5.5 | Mọi form | Đang gửi (S4) | Nút primary `aria-busy="true"`, chữ trong suốt + spinner, giữ bề rộng; chữ ẩn "Signing in…", "Saving address…". Submit lần 2 bị chặn | foundation §6; 05 §5 |
| 5.6 | Account | Chưa có đơn (S5) | Ẩn "Recent Order" và bảng; empty state: icon hộp, h2 "No Orders Yet", câu, primary "Shop All Products" + link "Browse collections". Account Details vẫn hiện | foundation §18 |
| 5.7 | Addresses | Rỗng (S6) | empty state icon ghim, "No Saved Addresses", primary "Add New Address" mở form | foundation §18 |
| 5.8 | Addresses | Thêm / sửa, lỗi trường (S9) | `<details>` (không JS): "Add New Address" mở form ở đầu lưới, "Edit" mở form trong thẻ, thẻ chiếm cả hàng. Trường: First name, Last name (2 cột), Company (optional), Address *, Apartment, suite, etc. (optional), City *, Country/region *, State/Province *, ZIP/Postal code *, Phone (optional), checkbox "Set as default address". Nút primary + secondary "Cancel" (đóng details); mobile xếp dọc full width. Lỗi `form.errors` inline + mở sẵn form đang lỗi. Tỉnh theo quốc gia cần `Shopify.CountryProvinceSelector` (BE, script CDN Shopify); không JS hiện ô tỉnh dạng select đủ tỉnh của quốc gia đã lưu | 13 #916D; 04 §5; foundation §12 |
| 5.9 | Addresses | Xoá (S10) | JS: dialog S "Delete This Address?" + địa chỉ, nút "Keep Address" (secondary) và "Delete Address" (nguy hiểm); mobile bottom sheet, nút an toàn ở dưới gần ngón cái. Không JS: nút Delete là form POST `_method=delete` gửi thẳng | foundation §16; 15 §1 |
| 5.10 | Addresses | Lưu / đặt mặc định xong (S10) | Shopify redirect về /account/addresses không kèm thông báo. Có JS (BE submit fetch rồi reload partial): toast success "Address saved" 6s. Không JS: không có thông báo (giới hạn Shopify) | 13 #891D, #893D; foundation §17 |
| 5.11 | Addresses | Mặc định | Thẻ đầu, viền foreground, pill "Default" (chữ + icon), không có "Set as default". "Set as default" ở thẻ khác: form POST cập nhật địa chỉ đó với `address[default]=1` + các trường hiện có dạng hidden (chạy không JS) | 13 #904D |
| 5.12 | Order | Đã huỷ (S7) | Hộp info (thanh muted + icon i) "Order cancelled on {date}" + lý do + số tiền hoàn; pill Refunded + Cancelled; tracking "Not shipped"; tổng thêm dòng "Refunded −$549.00". Không dùng hộp đỏ: huỷ là trạng thái, không phải lỗi của người mua | 04 §6; 01 |
| 5.13 | Order | Dòng biên (S8) | Không ảnh: placeholder; gift card: variant "Denominations: $25.00" + ghi chú "Sent by email, no shipping"; sản phẩm số (`requires_shipping` false): "No shipping required"; sản phẩm đã xoá: tên không link, không "Buy again" | edge_cases demo-data |
| 5.14 | Account | > 20 đơn (S8) | Phân trang dưới bảng, `nav aria-label="Order history pages"`, URL `?page=` | |
| 5.15 | Mọi trang | Chuỗi dài | email, số tracking `overflow-wrap: anywhere`; tên sản phẩm xuống dòng tự nhiên trong bảng | 03 |
| 5.16 | Mọi trang | Loading trang | Trang render server, không skeleton. Chỉ nút (5.5) | |

Hover / focus / active / disabled: theo foundation §6 (nút), §12 (input), nav pill hover viền foreground, sidebar hover nền alt, link bảng hover accent, nút chữ hover accent (Delete hover foreground). Focus: outline 2px accent offset 2 cho mọi phần tử. Không có nút disabled cố định; nút submit không disable trước khi người dùng nhập (tránh nút "chết", lỗi hiện khi submit).

ĐỀ XUẤT không làm (ghi để đối chiếu checklist 13): dropdown tài khoản trên header (#886D, #876D: tài khoản mới đã có menu riêng của `<shopify-account>`); tra cứu đơn cho khách vãng lai (#905D, cần app); ngày giao dự kiến, huỷ đơn, trả hàng online (#895D, #894D, cần app); in hoá đơn (#915D: chỉ thêm `@media print` ẩn header/footer/nav, FE 1 khối CSS).

---

## 6. Accessibility

Tương phản (tính tay, L theo WCAG; số từ foundation §2 nếu có):

| Cặp | Tỉ lệ | Dùng |
| --- | --- | --- |
| foreground / background | 17.4 | chữ, pill, link bảng |
| muted / background | 8.45 | mô tả, ngày, nhãn th trên nền trắng |
| muted / background-alt | 7.68 (L 0.0743 / 0.905: 0.955 / 0.1243) | nhãn dt dải trạng thái, th, chữ phụ aside |
| foreground / background-alt | 15.8 | nav pill chưa chọn, chữ aside |
| background / foreground | 17.4 | nav pill đang chọn, pill Default |
| accent-foreground / accent | 5.01 | nút primary |
| sale / background | 6.38 | chữ lỗi, nút chữ Delete |
| sale-foreground / sale | 6.38 | nút Delete Address |
| badge-new / background | 4.57 | icon check trong pill (đồ hoạ, cần ≥ 3) |
| muted-light / background | 5.33 | viền ô nhập (sổ quyết định 09/11) |

- Trạng thái đơn đọc bằng chữ; icon chỉ phụ. Pill trong thẻ đơn có tiền tố ẩn "Payment: ", "Fulfillment: ".
- Vùng chạm: control 48 / 52, link trong form và bảng cao 44, nút chữ 44, nav 44 / 48, phân trang 44 × 44. "Buy again" cao 32 (≥ 24, AA 2.5.8; cách link tên sản phẩm ≥ 8).
- Bàn phím: thứ tự Tab theo DOM; nav là `<nav aria-label="Account">` + `aria-current="page"`; `<details>` cho form địa chỉ; dialog xoá `<dialog>` + `showModal()`, Escape đóng, trả focus về nút Delete.
- Form: `<label for>` thật; `autocomplete`: email, current-password, new-password, given-name, family-name, organization, address-line1, address-line2, address-level2, country, address-level1, postal-code, tel. Không chặn dán. Bắt buộc có `*` + câu "Fields marked * are required." + `required`.
- Lỗi: `aria-invalid`, `aria-describedby`, hộp tóm tắt `role="alert"` nhận focus.
- Bảng: `caption` ẩn, `scope="col"`, role tường minh (§2).
- Link mở tab mới ("Track Package") có icon + chữ ẩn "(opens in a new tab)", `rel="noopener"`.

---

## 7. Lighthouse

| Trang | Phần tử LCP | Ảnh | Ghi chú |
| --- | --- | --- | --- |
| login, register, reset, activate | h1 hoặc khối chữ form (không ảnh) | không có | không preload ảnh; 0 ảnh eager |
| account | h1 "My Account" / khối Recent Order (chữ) | thumbnail 64 × 64 (`image_url: width: 128`), lazy, có width/height | thumbnail quá nhỏ để thành LCP |
| order | h1 / dải trạng thái | ảnh dòng 80 × 80 (`width: 160`), lazy | |
| addresses | h1 | không có | |

- Font: Sofia Sans Condensed 700 (h1, h2, h3) + Inter 400/500/600/700 qua `font_picker`; preload 1 font theo ADR 0003. 2 họ, không thêm.
- CSS: style tài khoản vào `base.css` (không phải above the fold của trang chủ); auth card + nav nhỏ, ước ~3 KB. Không đụng `critical.css`.
- JS: 0 bắt buộc. Tuỳ chọn (BE): hiện mật khẩu, dialog xoá, toast lưu địa chỉ (~3 KB cộng lại, trong trần 8 KB/file); chọn tỉnh dùng script CDN Shopify (`shopify_common.js`), không tính vào ngân sách theme (ADR 0006: script của Shopify loại trừ). KHÔNG CHẮC: có cần thêm `customer_area.js` không, Tech Lead xác nhận.
- CLS: form lỗi render server; toast `position: fixed`; mở `<details>` do người dùng bấm (không tính CLS).
- A11y 100: rủi ro và cách tránh — bảng đổi display (role tường minh); nhiều nút "Edit"/"Delete" cùng tên (chữ ẩn nêu địa chỉ); pill chỉ màu (chữ + icon); heading nhảy bậc (h1 → h2 khối → h3 thẻ); label-in-name: `aria-label="Order #1012"` chứa chữ hiển thị "#1012"; target-size (§6).
- Best Practices 100: ô mật khẩu đúng `autocomplete`, cho dán; ảnh `contain` đúng tỉ lệ, srcset 2x; 0 lỗi console; không `document.write`.
- SEO 100: robots.txt mặc định của Shopify chặn `/account` (Lighthouse `is-crawlable` trượt) → không đạt được bằng thiết kế; xem câu CTO 1. Phần còn lại vẫn làm: `<title>` + meta description riêng (Login · Efitco…), link là `<a href>` thật, chữ link mô tả đích, ảnh có alt, chữ ≥ 12 (nhỏ nhất 13 ở pill).

---

## 8. Token dùng

Màu: `--color-background`, `--color-foreground`, `--color-muted`, `--color-muted-light`, `--color-border`, `--color-background-alt(-foreground)`, `--color-background-cream`, `--color-accent(-foreground)`, `--color-sale(-foreground)`, `--color-badge-new` (chỉ icon, thanh toast). Không token mới.
Chữ: `--font-heading--*`, `--font-primary--family`, `--font-size-xs / sm / base / lg / h3 / h2 / h1`.
Khoảng: `--space-1..8`, `--page-margin`, `--header-height`. Bo: `--radius-input`, `--radius-button`, `--radius-card`, `--radius-pill`, `--radius-dialog` (dẫn xuất). Motion: `--motion-fast`, `--motion-base` (hover, dialog, toast theo foundation §19).
Kích thước ngoài thang (viết bằng `calc(var(--space-1) * n)` hoặc rem): sidebar 15rem / 17.5rem, aside đơn 22.5rem / 25rem, khung login 65rem, card auth 30rem, thumbnail 64 / 80.

---

## 9. Quyết định CTO cần chốt

1. SEO 100 trên `/account/*`: robots.txt Shopify chặn `/account` nên Lighthouse `is-crawlable` luôn trượt; loại các trang tài khoản khỏi chỉ tiêu SEO (như /cart, /search) và chỉ đo A11y, Best Practices, Performance? Đề xuất: có, và thêm `<meta name="robots" content="noindex">` cho 7 template để nhất quán với robots.txt.
2. Theme dùng tài khoản mới (`<shopify-account>`); vẫn dựng 7 template classic theo spec này cho store còn bật tài khoản cũ? Đề xuất: có, chi phí thấp (0 JS bắt buộc, dùng lại foundation) và giữ đủ template như yêu cầu Theme Store nội bộ; chi tiết kỹ thuật chờ Tech Lead ở ES1-T269.
3. "Mua lại" trên trang đơn: chỉ text link "Buy again" từng dòng tới trang sản phẩm đúng variant (không JS), chưa làm nút thêm cả đơn vào giỏ? Đề xuất: có; nút cả đơn cần BE gọi `/cart/add.js` nhiều dòng + xử lý hết hàng, để ticket sau nếu cần (13 §6).
