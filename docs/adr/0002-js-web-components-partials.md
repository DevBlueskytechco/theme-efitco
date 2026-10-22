# 0002. JS: Web Components + partial rendering, không framework
Ngày: 2026-10-22 | Trạng thái: Đề xuất (G3 chấp nhận)

## Bối cảnh
Skeleton không có sections nên không có Section Rendering API; có `{% partial %}` + `@shopify/partial-rendering`. Cần cart/variant/filter không reload, fallback không JS, bundle nhỏ cho Lighthouse 96.

## Lựa chọn đã cân nhắc
- A. Framework (Alpine/Vue) — nhanh viết; +15–30 KB, Sidekick ít quen. Loại.
- B. Vanilla ES module + Web Components + partials — không phụ thuộc, nhỏ, đúng hướng Skeleton. Chọn.
- C. Render client từ JSON hoàn toàn — mất fallback, SEO kém. Loại.

## Quyết định
B. Mỗi tính năng 1 file ≤ 8 KB; partial cho vùng server-render; AbortController, aria-busy, live region bắt buộc; form submit là fallback.

## Hệ quả
Tốt: tổng JS ≤ 40 KB. Xấu: partial phụ thuộc agentic_editor_enabled — kiểm trên store đã bật. Việc: Dev BE skill js-partials. Đo: không console error, E2E pass, bundle size trong CI.
