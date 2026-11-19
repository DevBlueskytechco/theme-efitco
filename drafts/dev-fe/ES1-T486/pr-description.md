KHÔNG CHẮC: bug chỉ đóng khi có cả phần JS (ES1-T496, Dev BE). PR này chỉ thêm hook markup; TC-20 (ES1-T386.spec.ts) vẫn đỏ, giữ test.fail tới khi ES1-T496 merge.

# ES1-T486 — 404: hook predictive search cho ô "Search the store" (FE, TE-21 AC7)

Bug ES1-T386-B01: gõ ≥ 2 ký tự vào ô tìm 404 không mở gợi ý predictive. Nguồn: docs/srs.md TE-21 AC7, docs/ui-spec/404.md §5 "Đang gõ: mở search popup dự đoán TE-8 (cùng component header), không component riêng".

## Thay đổi
- `blocks/not-found.liquid`: form tìm thêm `data-search-handoff="{{ 'predictive-search.js' | asset_url }}"`; `{% doc %}` ghi hợp đồng cho BE.
- Không thêm component, CSS, locale, setting. Không file JS trong diff.

## Hợp đồng cho BE (ES1-T496)
- Bám: `form[data-search-handoff]` (data-testid `not-found-search`), input `[name="q"]` (data-testid `not-found-search-input`).
- Đích: lớp header `modal-dialog[data-layer="search"]`, input `#PredictiveSearchInput` (snippets/predictive-search.liquid).
- Gõ, `trim` ≥ 2 ký tự: chép giá trị sang `#PredictiveSearchInput`, `open(<input 404>)` để đóng lớp thì focus về ô 404, `import(dataset.searchHandoff)`.
- Không dùng `data-search-src`: search-loader.js bám tên đó và chỉ nghe click (ES1-T130 AC1, ES1-T316, trần 256 B). Click vào form không kích hoạt loader (loader cần `nextElementSibling` có `open`).
- Không partial (predictive_search cần Section Rendering, ES1-T124 #2).

## Trạng thái
- Không JS / không có header / JS lỗi: form GET `/search?q=` như cũ (TC-21, B-03).
- Không tự focus ô khi tải trang (AC7; không thêm `autofocus`, test tĩnh ES1-T384 giữ).
- Rỗng/lỗi/đang tải gợi ý: dùng trạng thái sẵn của lớp predictive (status `role="status"`, `aria-busy`).

## Tự kiểm tra
- `shopify theme check`: 0 lỗi (22 warning có sẵn, 0 ở not-found.liquid).
- Không file `assets/*.js` trong diff; không đổi CSS → base.css giữ nguyên byte.
- Test tĩnh liên quan: ES1-T384 (không autofocus, shopify_attributes, limit 6), ES1-T408 (label for NotFoundSearchInput), ES1-T130 (loader, data-search-src header) — markup không chạm điều kiện.
- Preview, Playwright (ES1-T386 TC-20/21, B-03; ES1-T384; ES1-T408), Lighthouse 404 desktop/mobile, ảnh 3 breakpoint: chờ CI. Giao diện không đổi nên visual diff kỳ vọng 0.
- TC-20 còn `test.fail` tới khi ES1-T496 xong; QA gỡ sau đó.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
