# ES1-T99 — AC trong phạm vi (trích docs/srs.md#TE-5, task-split ES1-T307 §3 dòng ES1-T99)
Dùng cho `ac_coverage.py`. Phạm vi: TE-5 AC1–AC10 + thanh checkout dưới 64rem (AC17). Các AC 0.5 khác của TE-5 (khung drawer, dòng hàng, trạng thái rỗng chi tiết…) chỉ kiểm phần mà AC1, AC4 trỏ tới, không tính đủ AC ở ticket này.

- AC1 Given thêm giỏ When thành công Then drawer mở, có line items (title, ảnh, options_with_values, unit_price, final_price, quantity, discount), tổng, nút checkout, accelerated checkout bật mặc định; khung drawer và dòng hàng theo bản 0.5.
- AC2 Given đổi số lượng hoặc xoá When Then partial cart-drawer + cart-count refresh, tổng đúng, giữ focus, aria-busy khi tải; lỗi 422 hiện thông báo API trong live region, số lượng về giá trị server.
- AC3 Given setting ngưỡng freeship When tổng < ngưỡng Then `<progress>` có tên + "Spend {số tiền} more to unlock free shipping"; ≥ ngưỡng Then thanh đầy, icon check + "Free shipping unlocked."; ngưỡng 0 (mặc định) hoặc giỏ rỗng Then không khối; cart page đầu danh sách dòng, drawer dưới "Added to cart".
- AC4 Given giỏ rỗng When Then thông báo + nút tiếp tục mua; cart.taxes_included thông báo khi có.
- AC5 Given cart page When render Then đủ như drawer + cart note + selling plan + mã giảm giá tự động; không JS vẫn update/checkout bằng form.
- AC6 Given setting cart type page When thêm giỏ Then chuyển cart page thay vì mở drawer; ngoại lệ popup quiz (TE-11).
- AC7 Given agent/app gọi Shopify.actions (add, update cart lines, openCart) When Then openCart mở drawer, drawer + cart-count refresh từ cart thật qua partial, dispatch `shopify:cart:lines-update` sau mỗi thay đổi do theme gây ra.
- AC8 Given `show_order_note` bật (mặc định) When render drawer Then `<details>` "Add order note" đóng sẵn, label "Order note" + textarea, cùng `cart.note` với cart page, rời ô thì lưu, refresh partial không mất chữ; tắt thì không có.
- AC9 Given dòng có quantity rule (B2B) When render drawer và cart page Then quy tắc rút gọn, +/− theo bước, − khoá ở min, + khoá ở max; số sai rời ô Then lỗi dưới dòng, `aria-invalid`, không gửi; 422 Then thông báo server, số về server; volume pricing Then "Volume pricing applied". Store không bật B2B Then kiểm mockup.
- AC10 Given dòng mua theo selling plan When render drawer và cart page Then hiện tên selling plan, giá dòng là giá theo plan.
- AC17 Given cart page có hàng, dưới 64rem, setting sticky bật, có JS When panel tóm tắt ra khỏi màn Then thanh dính đáy (`<aside aria-label="Cart total and checkout">`, Total + Checkout 48); panel vào màn Then ẩn; từ 64rem, giỏ rỗng, không JS Then không thanh; cuối trang không bị che.
