---
name: js-partials
description: JS trong Skeleton: Web Components, @shopify/partial-rendering (partials.refresh/fetch/apply), progressive enhancement. Dùng cho mọi task Dev BE.
---
- Mỗi tính năng một file `assets/<feature>.js`, ES module, không minify, ≤ 8 KB; nạp bằng `<script type="module" src="{{ 'x.js' | asset_url }}">` trong block cần nó (defer mặc định).
- Partial: FE đã đặt `{% partial 'name' %}...{% endpartial %}`; JS: `import { partials } from "@shopify/partial-rendering"`; `partials.refresh("name")` cho URL hiện tại; `fetch(url, {signal})` + `apply()` khi cần URL/method khác. Fetch các region liên quan cùng lúc.
- Luôn: `AbortController` huỷ request cũ; `aria-busy="true"` khi tải; live region `aria-live="polite"` cho kết quả; khôi phục disclosure đang mở; đọc state từ `window.location.search`.
- `partial` chỉ render khi `shop.features.agentic_editor_enabled?`; markup FE phải chạy được không JS (form submit thường) — đây là fallback.
- Không jQuery, không framework, không fetch sang domain ngoài; dùng `routes.*` in sẵn vào `data-*` từ Liquid.
- Web Component: `customElements.define('product-swatch', class extends HTMLElement {...})`; state trong attribute; sự kiện tuỳ chỉnh `theme:cart:updated`.
- Test: Playwright `tests/e2e/<ticket>.spec.ts` dùng `data-testid`; case lỗi mạng bằng `route.abort()`.
