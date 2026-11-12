KHÔNG CHẮC: (1) thẻ `<script>` page-layers.js trong `layout/theme.liquid` chưa có, scope-guard chặn dev-be ghi `layout/`, đã hỏi ES1-T438 (đề xuất Orchestrator/FE thêm 1 dòng vào nhánh này trước khi push, như ES1-T82). (2) Selector Shopify Inbox `#ShopifyChat, #dummy-chat-button-iframe` (FE ES1-T312) chưa kiểm trên store dev; phiên không gọi mạng. (3) Không gọi `Shopify.customerPrivacy.shouldShowBanner()`, consent đọc từ DOM banner + `visitorConsentCollected` (lý do bên dưới). Chưa ghi "selector, API đã kiểm" vào chú thích `<page-layers>` trong layout vì chưa kiểm được và layout là file FE.

# ES1-T314 TE-10-R2-BE1: `assets/page-layers.js` (`<page-layers>`)

ADR 0007 mục 6, ADR 0010, `docs/ui-spec/layers.md` §4, §5; SRS TE-10 AC6 (Inbox), AC7 (consent). Thẻ host `<page-layers data-testid="page-layers" data-inbox-selector="…">` FE đã đặt ngay sau `<body>` (ES1-T312, PR #188). JS chỉ define, không tạo DOM.

## Thay đổi
- `assets/page-layers.js` (mới, 2 031 B ≤ 2 048):
  - `html[data-layer-open]` khi có lớp: `:modal` (mọi `<dialog>` mở bằng `showModal()`, gồm `<modal-dialog>` TE-10-R2-BE2 và cart drawer, quiz dialog hiện tại), `[data-layer]:is([open], [aria-expanded="true"])` (mega menu, popover localization, `details` có `data-layer`), `[data-layer] > dialog[open]` (thẻ big offer ≥ 48rem mở bằng `show()`).
  - Ô nhập đang focus (`input, textarea, select, iframe, [contenteditable]`): KHÔNG bật `data-layer-open` (layers §4: không phải lớp, thanh đáy giữ) nhưng tính là bận, chặn `layers:idle`. Focus vào iframe (chat Inbox) bắt qua `blur` của window.
  - Consent: phần tử `#shopify-pc__banner` (id QA gặp trên store dev, `tests/e2e/support/consent.ts`) cao > 0 → `html[data-consent]`; `--consent-height` = phần banner chiếm ở đáy màn hình (`innerHeight − top` khi banner chạm đáy, 0 khi không) đo bằng `ResizeObserver`; `visitorConsentCollected` trên `document` → gỡ cờ, đặt 0.
  - Inbox: phần tử khớp `data-inbox-selector` có trong DOM → `html[data-inbox]` (CSS FE dịch nút lên `--bottom-bar-height`, chừa làn toast `--inbox-clearance`).
  - `layers:idle` (Event trên `document`) khi chuyển từ bận (lớp, consent, đang gõ) sang rảnh; không phát lúc tải. Popup queue (TE-18-R2-BE1) đọc `html[data-layer-open]`, `html[data-consent]` lúc khởi động và nghe `layers:idle`.
- `tests/e2e/ES1-T314.spec.ts` (mới, 12 test × 2 project).
- `drafts/dev-be/ES1-T314/local-check.mjs`: script kiểm cục bộ trên trang giả lập (không mạng), chưa chạy được trong sandbox (Chromium bị chặn mach port).

## Cách làm, lý do
- Đọc trạng thái từ DOM mỗi lần đổi, không đếm `modal:open/close`: lớp đóng kiểu nào (Esc, `close()`, block render lại trong editor) cũng không lệch bộ đếm. Một `MutationObserver` trên `body` (`childList` + `subtree` cho Inbox/banner chèn muộn; `attributeFilter: open, aria-expanded` cho dialog, details, nút mở) + `focusin/focusout` + `blur`; gom vào 1 `requestAnimationFrame`. `modal:open/close` của `<modal-dialog>` đổi thuộc tính `open` của dialog nên đã nằm trong observer; không nghe riêng để giữ trần 2 048 B.
- Không gọi `shouldShowBanner()`: tên API do Designer ghi KHÔNG CHẮC (layers §5, ADR 0007); banner có trong DOM và cao > 0 là điều kiện thật để ẩn thanh đáy, API cần nạp `consent-tracking-api` thêm. Hỏi duyệt ở ES1-T438 mục 3.
- `--consent-height` đặt bằng custom property trên `<html>` (ADR 0007 yêu cầu), không style inline khác. Đổi hiện/ẩn thanh đáy, teaser, toast là CSS FE trong `assets/base.css` (đã có selector `html:is([data-layer-open], [data-consent])`, `--consent-height`, `html[data-inbox]`).
- `disconnectedCallback` gỡ listener (AbortController), observer.
- Không JS: không thanh đáy JS, không popup, banner do Shopify (layers §5.6); trang dùng bình thường.

## Ngân sách JS (wc -c)
- `page-layers.js` 2 031 (trần ADR 0007/0010: 2 048).
- Chung mọi trang (layout + header + cart drawer, `wc -c` tĩnh): standard-events 888 + motion 6 103 + header-menu 6 862 + header-sticky 1 680 + cart-items 5 625 + cart-drawer 3 868 + page-layers 2 031 = 27 057 ≤ 40 960 (AGENTS.md). Trần nhóm chung 19 456 của ADR 0010 chưa đạt do header-menu, cart-drawer, cart-items chưa rút (TE-22-R2-BE1, ES1-T98, TE-5-R2-BE1), không do file này.

## Cần FE / Orchestrator
- `layout/theme.liquid`, ngay sau dòng motion.js: `<script src="{{ 'page-layers.js' | asset_url }}" type="module"></script>` (ES1-T438).
- Nếu QA thấy id Inbox thật khác: sửa `data-inbox-selector` trong layout và 2 selector trùng trong `assets/base.css`; JS không đổi.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi (22 warning có sẵn, không thuộc file trong PR).
- `wc -c assets/page-layers.js` = 2 031 ≤ 2 048; `node --check` OK; không `console.`, `fetch`, `partials`, import tĩnh, không tạo DOM; guard `customElements.get`.
- Kiểm tĩnh của spec (grep tương đương): đạt, trừ test "layout: 1 thẻ script" (chờ ES1-T438). Spec `--list` parse 24 test.
- Locale: không đổi.
- Playwright trên preview, Lighthouse, console trên 4 trang: chờ CI.

## Test (tests/e2e/ES1-T314.spec.ts)
- Tĩnh: trần byte, hook khớp layout/base.css, thẻ script trong layout.
- Lớp: tải `/`, `/collections/all`, `/cart`, `/search?q=a` không cờ, 0 lỗi console; dialog modal mở/Esc → cờ + `layers:idle`; `[data-layer][aria-expanded]` và `[data-layer] > dialog[open]`; ô nhập focus chặn idle nhưng không bật cờ; `.product-sticky-bar` `visibility: hidden` khi lớp mở.
- Inbox: phần tử khớp selector chèn muộn/gỡ → bật/tắt `html[data-inbox]` (store có Inbox thật thì ghi annotation).
- Consent: banner giả lập 200 → 260 px đo lại, `visitorConsentCollected` gỡ + idle; banner `display: none`/gỡ → bỏ cờ; banner thật trong context xoá cookie `_tracking_consent`: hiện → cờ, Decline → gỡ.
- Test chạy thật tự nạp module từ URL asset của preview nếu layout chưa có thẻ script.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
