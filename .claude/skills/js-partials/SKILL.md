---
name: js-partials
description: JS trong Skeleton: Web Components, @shopify/partial-rendering (partials.refresh/fetch/apply), progressive enhancement. Dùng cho mọi task Dev BE.
---
- Mỗi tính năng một file `assets/<feature>.js`, ES module, không minify, ≤ 8 KB; nạp bằng `<script type="module" src="{{ 'x.js' | asset_url }}">` trong block cần nó (defer mặc định).
- Partial: FE đã đặt `{% partial 'name' %}...{% endpartial %}`; JS: `import { partials } from "@shopify/partial-rendering"`; `partials.refresh("name")` cho URL hiện tại; `fetch(url, {signal})` + `apply()` khi cần URL/method khác. Fetch các region liên quan cùng lúc.
- Luôn: `AbortController` huỷ request cũ; `aria-busy="true"` khi tải; live region `aria-live="polite"` cho kết quả; khôi phục disclosure đang mở; đọc state từ `window.location.search`.
- `partial` chỉ render khi `shop.features.agentic_editor_enabled?`; markup FE phải chạy được không JS (form submit thường) — đây là fallback.
- Không jQuery, không framework, không fetch sang domain ngoài; dùng `routes.*` in sẵn vào `data-*` từ Liquid.
- Web Component: `customElements.define('sale-countdown', class extends HTMLElement {...})`; state trong attribute; sự kiện tuỳ chỉnh `theme:cart:updated`.
- Lớp modal: dùng `<modal-dialog>` có sẵn (`open()`/`close()`, sự kiện `modal:open/close`), không tự viết Esc/scrim/focus; trạng thái lớp đọc `html[data-layer-open]` và sự kiện `layers:idle` (ADR 0007).
- Không `import` tĩnh module theme khác (ES1-T81); giao tiếp qua element API và CustomEvent.
- Nạp lười: `data-lazy-module` + `data-lazy-on="interaction"` cho phần chỉ cần khi tương tác; ngân sách theo trang ADR 0010.
- Tên partial không trùng trên một trang: PDP nhiều partial `product-*`; quickview 1 partial `quick-view`; featured product 1 partial `featured-product` (ADR 0008).
- Test: Playwright `tests/e2e/<ticket>.spec.ts` dùng `data-testid`; case lỗi mạng bằng `route.abort()`.
