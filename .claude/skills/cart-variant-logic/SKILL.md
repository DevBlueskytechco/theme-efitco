---
name: cart-variant-logic
description: Logic cart, variant, predictive search trên Shopify Ajax API cho theme. Dùng cho TE-4, TE-5, TE-6, TE-8, TE-19.
---
Variant: không dùng `product.variants | json` hay JSON biến thể (sổ 10/11, 2048 biến thể, NFR-7, ADR 0008). Bộ chọn render từ `option.values` (radio `value.id`, trạng thái `value.available`/`value.exists`/`value.selected`). Đổi lựa chọn → gom id option value → `partials.fetch(...names, { url: <product url>?option_values=id1,id2,id3, signal })` → `partials.apply`; server trả giá, tồn, nút, ảnh, countdown, sticky bar. PDP `history.replaceState` `?variant=`; quickview không đổi URL trang nền. Đang tải: Add To Cart `aria-disabled`, không spinner.
Cart: `POST {{ routes.cart_add_url }}.js` (`items:[{id, quantity}]`), `POST {{ routes.cart_change_url }}.js` (`line`/`id`, `quantity`), `GET {{ routes.cart_url }}.js`; sau mỗi thay đổi `partials.refresh("cart-drawer", "cart-count")`; lỗi 422 → hiện `description` từ response trong live region; ngưỡng freeship tính từ `cart.total_price` vs setting.
Predictive search: `GET {{ routes.predictive_search_url }}?q=&resources[type]=product,collection,page&resources[limit]=4&section_id=` không dùng (không sections) → render client từ JSON hoặc partial `search-suggestions` với `?q=`; debounce 300ms; keyboard ↑↓ Enter Esc; `role="listbox"`; nạp lười khi bấm; trần 6 656 B (ADR 0010).
Filter/sort: giữ query string, `partials.refresh("collection-products", "collection-filters")`; `history.replaceState`.
Upsell cart: `product-recommendations.js` `data-context="cart"`, intent complementary, gốc dòng đầu, tối đa 4, thêm → refresh `cart-page` + `cart-count`.
