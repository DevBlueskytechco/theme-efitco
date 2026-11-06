getCart không có lỗi: run 42235454285, Storefront API 200, trả { cart: { totalQuantity: 2 } }, khớp /cart.js (ES1-T227, kết luận của CTO trên ticket).
Không phải hành vi Shopify, không phải lỗi theme: test đọc sai cấp, đã sửa ở actionCartCount; đã gỡ tests/e2e/ES1-T227.spec.ts và tests/e2e/support/action-probe.ts.
