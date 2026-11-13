KHÔNG CHẮC: (1) Chưa xác minh trên trình duyệt nguyên nhân đỏ CI #204 ở test "ô nhập đang focus". Spec cũ lấy `input[type=email]` đầu tiên trong DOM; khả năng cao trúng một ô bị ẩn (app chèn trên store dev). Playwright `focus()` không kiểm phần tử có hiển thị không, nên focus không vào ô và `activeElement` vẫn là body → kết quả `false`. Đã sửa spec để bám `data-testid`, chờ CI. (2) Selector Shopify Inbox `#ShopifyChat, #dummy-chat-button-iframe` (FE ES1-T312) chưa kiểm trên store dev. (3) Không gọi `Shopify.customerPrivacy.shouldShowBanner()`; trạng thái consent đọc từ banner trong DOM và sự kiện `visitorConsentCollected` (ES1-T438 mục 3).

# ES1-T314 TE-10-R2-BE1: `assets/page-layers.js` (`<page-layers>`)

Nguồn: ADR 0007 mục 6, ADR 0010, `docs/ui-spec/layers.md` §4–§5, SRS TE-10 AC6 (Inbox) và AC7 (consent). Thẻ host `<page-layers data-testid="page-layers" data-inbox-selector="…">` FE đã đặt ngay sau `<body>` (ES1-T312). JS chỉ define, không tạo DOM. Thẻ script trong layout đã có (9b6b744, ES1-T438 phương án a).

## Lượt 2 (CI #204, run 43339941426)
- Test đỏ: `ES1-T314.spec.ts:150` "ô nhập đang focus", Expected true / Received false, ở dòng kiểm `document.activeElement?.matches('input')`. Lỗi ở chỗ focus không vào được ô, không phải ở `page-layers.js`. JS đã nghe `focusin`/`focusout` nên không phụ thuộc MutationObserver.
- Sửa spec:
  - Lấy ô bằng `getByTestId('footer-newsletter-email')`. Ô không hiển thị thì chèn 1 ô email thử.
  - Bấm vào ô bằng `click()`, kiểm bằng `toBeFocused()`.
- `page-layers.js`:
  - Trước: nghe `focusin`/`focusout` trên document, `blur` trên window.
  - Nay: nghe cả 4 sự kiện `focusin`, `focusout`, `blur`, `focus` trên window.
  - Lý do: khi focus rời iframe về body, trang không phát `focusin`, chỉ window phát `focus`. Thiếu sự kiện này thì `layers:idle` không phát cho tới lần đổi DOM kế tiếp.
  - Kích thước giữ nguyên 2 031 B.
- Test mới "iframe đang focus": khi focus vào iframe thì không bật `data-layer-open` và không phát idle. Khi rời iframe về body thì phát `layers:idle`.

## Thay đổi
- `assets/page-layers.js` (2 031 B ≤ 2 048):
  - `html[data-layer-open]` bật khi có một trong các lớp sau:
    - `:modal`: dialog mở bằng `showModal()`.
    - `[data-layer]:is([open], [aria-expanded="true"])`.
    - `[data-layer] > dialog[open]`.
  - Ô nhập hoặc iframe đang focus: không bật `data-layer-open` (thanh đáy vẫn hiện, layers §4) nhưng tính là bận, nên chặn `layers:idle`.
  - Consent: khi `#shopify-pc__banner` cao > 0 thì bật `html[data-consent]` và đặt `--consent-height` (đo bằng ResizeObserver). Nhận `visitorConsentCollected` thì gỡ cờ, đặt `--consent-height` về 0.
  - Inbox: có phần tử khớp `data-inbox-selector` thì bật `html[data-inbox]`.
  - `layers:idle` phát khi trang chuyển từ bận sang rảnh; lúc tải trang không phát.
- `tests/e2e/ES1-T314.spec.ts`: 13 test × 2 project.
- `drafts/dev-be/ES1-T314/local-check.mjs`: script kiểm trên trang giả lập, đã thêm bước iframe. Chưa chạy được vì sandbox chặn Chromium.

## Cách làm, lý do
- Mỗi lần có thay đổi, JS đọc lại trạng thái từ DOM thay vì đếm sự kiện `modal:open/close`. Các nguồn kích hoạt:
  - Một MutationObserver theo dõi `childList`, `subtree` và hai thuộc tính `open`, `aria-expanded`.
  - Các sự kiện focus trên window.
  - Tất cả gom vào một `requestAnimationFrame`.
- `--consent-height` là custom property duy nhất JS ghi lên `<html>`. Phần ẩn hiện thanh đáy, teaser và toast là CSS FE trong `assets/base.css`.
- `disconnectedCallback` gỡ listener (qua AbortController) và ngắt hai observer.
- Không JS thì trang vẫn dùng bình thường (layers §5.6).

## Ngân sách JS (wc -c)
- `page-layers.js`: 2 031 B (trần 2 048).
- Tổng chung mọi trang: 27 057 ≤ 40 960. Gồm standard-events 888, motion 6 103, header-menu 6 862, header-sticky 1 680, cart-items 5 625, cart-drawer 3 868, page-layers 2 031.
- Trần nhóm chung 19 456 B của ADR 0010 chưa đạt. Nguyên nhân là header-menu, cart-drawer, cart-items chưa rút gọn, không phải file này.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi (22 warning có sẵn, không thuộc PR).
- `wc -c assets/page-layers.js`: 2 031 ≤ 2 048. `node --check` OK. Không có `console.`, `fetch`, `partials` hay import tĩnh. Có guard `customElements.get`.
- Kiểm tĩnh của spec bằng node: đạt tất cả, kể cả test layout có 1 thẻ script module. `playwright --list`: 26 test.
- Không chạy được trên máy: Playwright (global setup cần preview) và local-check (sandbox chặn Chromium).
- Playwright trên preview, Lighthouse, console: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
