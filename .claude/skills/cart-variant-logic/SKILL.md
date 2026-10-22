---
name: cart-variant-logic
description: Logic cart, variant, predictive search trên Shopify Ajax API cho theme. Dùng cho TE-4, TE-5, TE-6, TE-8.
---
Variant: dữ liệu từ `{{ product.variants | json }}` trong `<script type="application/json" data-variants>`; chọn option → tìm variant khớp → cập nhật giá (`money` format từ Liquid `data-money-format`), compare_at, availability, ảnh (`variant.featured_media`), `input[name=id]`, URL `?variant=`; hết hàng → disable nút + text `products.sold_out`.
Cart: `POST {{ routes.cart_add_url }}.js` (`items:[{id, quantity}]`), `POST {{ routes.cart_change_url }}.js` (`line`/`id`, `quantity`), `GET {{ routes.cart_url }}.js`; sau mỗi thay đổi `partials.refresh("cart-drawer", "cart-count")`; lỗi 422 → hiện `description` từ response trong live region; ngưỡng freeship tính từ `cart.total_price` vs setting.
Predictive search: `GET {{ routes.predictive_search_url }}?q=&resources[type]=product,collection,page&resources[limit]=4&section_id=` không dùng (không sections) → render client từ JSON hoặc partial `search-suggestions` với `?q=`; debounce 300ms; keyboard ↑↓ Enter Esc; `role="listbox"`.
Filter/sort: giữ query string, `partials.refresh("collection-products", "collection-filters")`; `history.replaceState`.
