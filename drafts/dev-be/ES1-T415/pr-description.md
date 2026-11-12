KHÔNG CHẮC: (1) scope-guard chặn dev-be ghi layout/ → thay đổi layout nằm ở patch drafts/dev-be/ES1-T415/theme.liquid.patch, chờ áp (ES1-T425). (2) Vị trí Shopify chèn import map (sau content_for_header, trong <head>) suy từ log CTO 11/11 (ES1-T277), không có tài liệu; spec storefront kiểm thứ tự thật trong DOM.

# ES1-T415 fix(layout): không nạp module theme trước import map của Shopify

## Nguyên nhân
CTO đo 11/11 (ES1-T277): errors-in-console = "An import map is added after module script load was triggered" + "Failed to resolve module specifier @shopify/partial-rendering". `layout/theme.liquid` đặt `standard-events.js`, `motion.js` (type=module) ngay sau `{{ content_for_header }}`; import map Shopify cấp cho `@shopify/partial-rendering` được chèn sau đó. Module đã bắt đầu tải thì import map tới sau không áp dụng → mọi import tĩnh `@shopify/partial-rendering` (cart-items, cart-drawer, product-variant-picker, quiz-finder, liquid-tips) lỗi resolve, module không chạy.

## Thay đổi
- `layout/theme.liquid` (patch, chờ áp): bỏ 2 thẻ script module khỏi `<head>`, đặt cuối `<body>` sau `{% block 'cart-drawer' %}`, kèm comment lý do. Không còn script module nào trong `<head>`. Không thêm import map (AGENTS.md).
- Không đổi file JS. Module mặc định defer, chạy sau khi parse xong nên dời vị trí không đổi hành vi: `standard-events.js` vẫn define `<s-view-event>`; `motion.js` vẫn quét DOM sau parse. Thứ tự chạy: 2 module này giờ chạy sau module của block (header-menu, slideshow…), không có phụ thuộc chéo (không import lẫn nhau, giao tiếp qua DOM/sự kiện).
- Không thêm `modulepreload` (cũng kích hoạt tải module trước import map).
- `tests/e2e/ES1-T415.spec.ts` (mới):
  - tĩnh: theme.liquid, password.liquid không có script module trong `<head>`, không importmap; standard-events.js, motion.js mỗi file đúng 1 thẻ, sau cart-drawer, trước `</body>`; layout đúng 2 thẻ module.
  - storefront (desktop + mobile): home, collection, cart, product (`TE4_VARIANTS_HANDLE`): không module `/assets/` nào trong `<head>` hay đứng trước import map trong DOM; 0 lỗi console dạng import map / resolve specifier. Home: `import('@shopify/partial-rendering')` resolve, `partials.refresh` là function, `s-view-event` vẫn defined. Cart: cart-items.js nạp, không lỗi resolve. Skip khi store không cấp import map (agentic_editor_enabled tắt).

## Ngân sách JS (ADR 0006/0010)
Không đổi byte nào. `wc -c`: standard-events.js 888 B, motion.js 9 161 B. Lưu ý có sẵn từ trước (không do ticket này): motion.js 9 161 B > trần 8 192 B/file, đề nghị Tech Lead tách ticket (gợi ý: tách khối scrub/split sang file lười nạp như scroll-extras.js).

## Cho DevOps (ES1-T301)
Sau khi merge và preview develop sạch lỗi console: nâng `categories:best-practices` từ warn lên error trong lighthouserc.json + lighthouserc.mobile.json (CTO 11/11 ý c). BP tối đa trên store có Sign in with Shop ~0.78 (third-party-cookies, inspector-issues do nền tảng) → minScore theo số CI đo lại, không đặt 1.

## Tự kiểm tra
- `git apply --check drafts/dev-be/ES1-T415/theme.liquid.patch`: ok.
- `shopify theme check`: 0 lỗi (22 warning có sẵn, không file theme nào bị sửa trong lượt này).
- `node --experimental-strip-types --check tests/e2e/ES1-T415.spec.ts`: ok. Spec ES1-T81 (1 thẻ standard-events type=module, không importmap) vẫn khớp sau patch.
- E2E, console error preview desktop/mobile, lhci best-practices trước/sau: chờ CI (sau khi áp patch).

## Rủi ro
- Nếu Shopify chèn import map ở cuối `<body>` (không phải `<head>`), module của block trong body vẫn đứng trước → spec storefront "module theme đứng trước import map" fail và chỉ ra file; khi đó cần đổi cách nạp ở block, hỏi Tech Lead.
- motion.js chạy muộn hơn vài module block: `html[data-motion=on]` gắn cùng tick trước DOMContentLoaded, chưa paint giữa các module → không nháy.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
