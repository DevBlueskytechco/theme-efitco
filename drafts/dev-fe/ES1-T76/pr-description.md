KHÔNG CHẮC: shape event (event.product.handle / event.context) và hành vi trigger mặc định của <s-view-event> lấy theo DoD + trả lời CTO ES1-T75, chưa thấy chạy thật (agent không có trình duyệt/preview) → spec đọc cả event.* lẫn event.detail.*, chờ CI.

# ES1-T76 TE-4-FE5: shopify:product:view bằng <s-view-event> + standard_event_data

Nguồn: ES1-T75 (CTO, shopify.dev events/product-view), TE-4 AC12; bổ sung ES1-T84. Phụ thuộc ES1-T81 (đã merge: assets/standard-events.js define s-view-event, layout nạp 1 thẻ script module).

## Thay đổi
- blocks/product-info.liquid: nội dung block nằm trong `<s-view-event class="product-info__view" view-event-payload='{{ product | standard_event_data: "view", context: "page" | escape }}' data-testid="product-view-event">`. Root `.product-info` giữ `shopify_attributes`; partial `product-price` không đổi tên, chỉ lùi 1 cấp. Doc cập nhật.
- snippets/product-card.liquid: card (`product-swatch`) bọc trong `<s-view-event class="product-card__view" view-event-trigger="intersect" ... data-testid="product-card-view-event">`. Param mới `card_context` (`collection` mặc định | `recommendation`; giá trị khác về `collection`). Caller hiện có (collection, featured-collection) dùng mặc định. ES1-T65 (recommendations) truyền `card_context: 'recommendation'`.
- assets/base.css: `.product-info__view` dùng chung grid/gap với `.product-info` (không lệch layout); `.product-card__view` display block + min-inline-size 0 (intersect cần hộp, không dùng display: contents).
- ES1-T84: key `blocks.product_form.added_to_cart` = "Added to cart" (gộp vào `blocks.product_form` sẵn có) + `data-label-added` trên root `<product-form>` cạnh `data-label-add`. JS ES1-T67 đã đọc `dataset.labelAdded`, không đổi JS.
- Không file JS, không setting mới, không token mới.

## Hook cho QA/BE
- `product-view-event` (trang sản phẩm), `product-card-view-event` (mỗi card).
- Thuộc tính `view-event-payload` = JSON (escape trong nháy đơn), `view-event-trigger="intersect"` chỉ trên card.

## Tự kiểm tra
- `shopify theme check --path .`: 50 file, 0 offense. Filter `standard_event_data` có trong data/filters.json của CLI (context: page|search|collection|dialog|recommendation) → không cần báo CTO.
- locales/en.default.json parse OK, không trùng key.
- Không file JS trong diff.
- Spec: drafts/dev-fe/ES1-T76/ES1-T76.spec.ts (scope-guard chặn tests/, nhờ Orchestrator chép sang tests/e2e/ES1-T76.spec.ts). Tĩnh: markup + locale. Storefront: trang sản phẩm nhận đúng 1 event context page với handle `TE4_VARIANTS_HANDLE`; card collection (`TE4_VIEW_COLLECTION`, mặc định `all`) chưa bắn khi dưới fold, bắn context collection sau khi cuộn tới; `data-label-added` có chữ.
- Preview, Playwright, Lighthouse, visual diff 3 breakpoint: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
