KHÔNG CHẮC: chạm markup FE (6 block) chỉ để thêm 1 thuộc tính data-* mang URL asset_url, theo chỉ định trong ticket ES1-T485 ("data-* trên host/element"). layout/theme.liquid nằm ngoài phạm vi BE (scope-guard chặn) nên không gắn URL lên thẻ script motion.js; URL đặt trên chính phần tử đích.

# ES1-T485 Bug BE: import() động bỏ import.meta.url, URL có ?v= từ asset_url

## Nguyên nhân
`new URL("x.js", import.meta.url)` trả URL không có `?v=`. CDN Shopify giữ bản cũ của header-drawer.js (chưa có `data-drawer-enhanced`) trên theme ai-develop sau #240 → e2e drawer mobile đỏ trên develop, PR xanh. Cùng lỗi ở motion.js (motion-scrub.js, scroll-extras.js).

## Sửa
- `assets/header-menu.js`: `import(this.dataset.drawerSrc)`; host `<header-menu hidden data-drawer-src="{{ 'header-drawer.js' | asset_url }}">` (blocks/header.liquid). Thiếu thuộc tính thì bỏ qua (không `import("undefined")` → 404 + lỗi console).
- `assets/motion.js`: `const lazy = (el) => el.dataset.motionSrc && import(el.dataset.motionSrc).catch(() => {})`, dùng chung cho scrub (rootMargin 100%) và extras (200px). Mẫu giống cart-drawer `data-items-src`, search-loader `data-search-src`.
- Markup: `data-motion-src="{{ 'motion-scrub.js' | asset_url }}"` trên root image-with-text khi `is_banner`; `data-motion-src="{{ 'scroll-extras.js' | asset_url }}"` trên `<scroll-buttons>` của blog-posts, collection-list, testimonials, related-articles, video-carousel.
- Hành vi nạp lười giữ nguyên: cùng trigger (pointerenter/focusin/touchstart; IntersectionObserver), không thẻ script, không preload.
- `grep import.meta.url assets/` = 0. Mọi `import()` còn lại: dataset (asset_url) hoặc URL tuyệt đối cdn.shopify.com/storefront/standard-events.js.

## Test
- Mới: `tests/e2e/ES1-T485.spec.ts` — tĩnh (AC1, AC2, AC5, hook Liquid đều asset_url, không script/preload); fixture thiếu data-drawer-src không lỗi console; storefront mobile: focus nút menu → request header-drawer.js có `v=`, `data-drawer-enhanced`, focus `#HeaderDrawerTitle`, Esc trả focus; motion-scrub.js và scroll-extras.js có `v=`.
- Sửa spec cũ khẳng định chuỗi `import.meta.url`: ES1-T323 (L189 + fixture host có data-drawer-src; quét Liquid đổi sang "không thẻ script header-drawer.js"), ES1-T316 (L86–92), ES1-T329 (L86, hook `<header-menu hidden data-drawer-src=`).

## Byte (wc -c)
| File | Trước | Sau | Trần |
|---|---|---|---|
| assets/header-menu.js | 3 064 | 3 068 | 3 072 (ES1-T329), 8 192 |
| assets/motion.js | 6 103 | 6 129 | 6 144 (ES1-T316), 8 192 |
Trang chủ tải sẵn: +30 B (header-menu +4, motion +26). Không file JS mới.

## Cho FE
- `{% doc %}` blocks/header.liquid: thêm hook `data-drawer-src` trên `<header-menu>` (URL header-drawer.js, BE import khi chạm nút menu). image-with-text, scroll-buttons hosts: hook `data-motion-src` (motion.js import khi gần khung nhìn). Không đổi tên/xoá các thuộc tính này.

## Tự kiểm tra
- shopify theme check: 0 lỗi (22 warning có sẵn, không ở file chạm).
- grep import.meta.url assets/*.js: 0. wc -c: header-menu 3 068, motion 6 129.
- Locale: không đổi.
- Playwright (ES1-T485, ES1-T323, ES1-T329, ES1-T16, TE-1, ES1-T316), Lighthouse, preview: chờ CI. Lưu ý: sau merge, theme ai-develop nhận URL `?v=` mới nên CDN không còn trả bản cũ.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
