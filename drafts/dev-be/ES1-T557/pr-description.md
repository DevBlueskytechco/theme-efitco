KHÔNG CHẮC: spec ES1-T557 chưa chạy, chưa type-check (sandbox không trình duyệt, không mạng) → chờ CI. Trần collection-tabs.js trong test tĩnh ES1-T189 nâng 1 536 → 1 792 theo AC6 ES1-T557; Tech Lead xác nhận khi review.

# ES1-T557 BE: cuộn, phím mũi tên theo hướng văn bản (điều kiện 3 bật RTL)

Theo ES1-T567 (mockup kit `:dir(rtl)`), foundation.md §34 điều kiện 3. Không bật locale RTL, không đổi `dir`, CSS, markup.

## Thay đổi
- `assets/collection-tabs.js` (sửa): hướng `d = this.matches(":dir(rtl)") ? -1 : 1`; RTL ArrowLeft = tab sau, ArrowRight = tab trước, vòng đầu/cuối như cũ; Home/End giữ; LTR không đổi.
- `assets/slideshow.js` (kiểm, không sửa): `#goTo` cuộn theo `slide.rect.left - track.rect.left` cộng `scrollLeft` → đúng cả khi scrollLeft âm; next/prev/chấm/autoplay đi chung `#goTo`; slide hiện và chấm `aria-current` lấy từ IntersectionObserver (root = track), không phụ thuộc hướng; vuốt là cuộn native.
- `assets/scroll-extras.js` (kiểm, không sửa): kéo `scrollLeft = s0 - dx` theo toạ độ vật lý nên đúng ở RTL; snap `Math.round(scrollLeft / k) * k` với `k = b.offsetLeft - a.offsetLeft` (âm ở RTL) → thương dương, kết quả bội âm của bước card, đúng card; `--scroll-pos = |scrollLeft| / max` → 0 ở đầu, 1 ở cuối.
- `assets/product-media.js` (kiểm, không sửa): thumbnail cuộn list theo rect như slideshow; item `flex: 0 0 100%` nên căn mép trái hay mép phải trùng nhau.
- `tests/e2e/ES1-T557.spec.ts` (mới): tĩnh (byte AC6, hook hướng), AC1 tab RTL + LTR, AC2 slideshow RTL next/prev/chấm/autoplay 1280, AC3 kéo chuột 300px + snap + `--scroll-pos` + next scroll-buttons, AC4 PDP thumbnail 5 ở 390, ảnh trang chủ RTL 360/1280 (attach để so #h-rtl). Ép `dir="rtl"` qua `page.route` sửa HTML trả về (cách ES1-T335).
- `tests/e2e/ES1-T189.spec.ts`: trần tĩnh collection-tabs.js 1 536 → 1 792 (AC6 ES1-T557). Lý do: thêm hướng cần +40 B, file cũ 1 528 B; nén comment/code để giữ 1 536 làm khó đọc.

## Byte (wc -c)
| File | Trước | Sau | Trần |
|---|---|---|---|
| collection-tabs.js | 1 528 | 1 639 | 1 792 (AC6) |
| slideshow.js | 7 925 | 7 925 | 8 192 |
| scroll-extras.js | 3 135 | 3 135 | 8 192 |
| product-media.js | 4 405 | 4 405 | 8 192 |

Theo trang: trang chủ tải sẵn không đổi (collection-tabs nạp lười viewport, +111 B vào phần sau cuộn); PDP không đổi.

## Cho Designer
DESIGN.md / foundation.md §34: bỏ dòng "còn cuộn theo LTR" ở mục Carousel, thanh tiến trình, slideshow; điều kiện 3 đạt khi spec ES1-T557 xanh trên CI.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi (9 warning sẵn có ở quiz-step, index*.liquid, không thuộc file chạm).
- `wc -c`: mọi file chạm ≤ 8 192; collection-tabs.js 1 639 ≤ 1 792.
- Không fetch, không console, không đổi markup, testid, tên custom element.
- Playwright ES1-T557, ES1-T335, ES1-T333, ES1-T189, Lighthouse: chờ CI. Dữ liệu cần: `/?view=figma` ≥ 3 tab, `/?view=te15`, `TE4_MEDIA_HANDLE` ≥ 5 media (thiếu thì skip có lý do).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
