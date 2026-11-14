# ES1-T463 — AC trong phạm vi (trích docs/srs.md#TE-1, #TE-5, ticket ES1-T439, ES1-T453)
Dùng cho `ac_coverage.py` (SRS gộp nhiều story trùng số AC). Mã ghép story để không lẫn TE-1 AC9 với TE-5 AC9.

- AC-H29 Given hero thật trên `/` When ở đầu trang và khi cuộn quá 80px Then header thanh tối, không chồng hero, nền không đổi khi cuộn.
- AC-TE1-9 (TE-1 AC9) Given mọi trang When render header Then thanh tối 80, không đè ảnh; sticky_header bật When cuộn Then dính đỉnh, giữ nền, thêm bóng, chiều cao không đổi.
- AC-D8 (ES1-T439, announcement-bar.md §4) Given sentinel 1px trước container header When cuộn Then data-scrolled gắn khi không bar cuộn > 1px, có bar 44 cuộn > 44.
- AC-TE5-1 (TE-5 AC1) drawer có dòng hàng, tổng, Checkout, accelerated.
- AC-TE5-4 (TE-5 AC4) giỏ rỗng có thông báo + nút tiếp tục mua.
- AC-TE5-6 (TE-5 AC6) cart_type page không drawer.
- AC-TE5-8 (TE-5 AC8) ghi chú đơn details đóng sẵn, label, textarea, ngoài partial.
- AC-TE5-15 (TE-5 AC15) 90% / 420 / 480, header 72, thân cuộn riêng, chân panel Checkout, Added to cart role status, không JS link /cart.
- AC-TE5-19 (TE-5 AC19) drawer rỗng: khối rỗng, không chân panel, không freeship, sản phẩm gợi ý theo setting.
- AC-T453 (ES1-T453 #1) data-partials 4 partial, cart-checkout trong cart-drawer-footer.
