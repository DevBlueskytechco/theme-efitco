KHÔNG CHẮC: (1) JS và spec chưa chạy trên preview (phiên agent không có trình duyệt, không gọi mạng): E2E, console, lhci chờ CI. (2) Tách file mới `assets/motion-scrub.js` và chuyển `scroll-extras.js` sang nạp gần viewport: chưa có trong bảng ADR 0010, hỏi Tech Lead ở ES1-T424 (mặc định giữ như PR). (3) Trang chủ sau cuộn vẫn ≈ 73 248 B > 65 536 (AC-H31): phần vượt là featured product, product-swatch, chờ TE-13-R2-BE1, TE-3-R2-BE2; PR này không làm tăng tổng đáng kể (+122 B).

# ES1-T316 TE-10-R2-BE3: motion.js 9 161 → 6 103 B, lazy-module.js 765 B + data-lazy-on="interaction"

## Thay đổi
- `assets/motion.js` (9 161 → 6 103 / 6 144 B)
  - Helper `once(options, fn)`: 1 IntersectionObserver "gọi 1 lần khi vào khung nhìn", dùng chung cho reveal, đếm số, nạp motion-scrub, nạp scroll-extras (trước là 3 observer viết riêng).
  - Gộp 2 khối `if (!calm && !auto)` thành 1 (`moving`); đếm số tách thành `countUp()`.
  - Reveal: bỏ `Set seen` + mảng `items` thành 1 `Map` (đọc hết vị trí rồi mới ghi, như cũ); nhóm card/text dùng chung 1 nhánh. Hành vi giữ: 3 kiểu text/card/media, `--reveal-i` ≤ 5, gỡ `data-reveal`, `data-reveal-kind` sau 1 600 + 80·i ms.
  - Slideshow vẫn trong `skip`: hero không reveal, chữ hero do CSS (TE-2 AC10, HA1). Không thêm observer nào cho slideshow.
  - Phần cuộn gắn tiến trình (khối `.image-with-text--banner`: chữ đậm dần từng từ, ảnh nhỏ trôi) tách sang `motion-scrub.js`, `import()` khi khối cách khung nhìn 1 màn (`rootMargin: 100% 0px`), chỉ khi bật chuyển động.
  - `scroll-extras.js`: trước import lúc tải nếu trang có `<scroll-buttons>`; nay import khi hàng đầu tiên cách 200px (cùng mốc lazy-module nạp scroll-buttons.js). File tự chờ `data-enhanced` của từng hàng nên thứ tự không đổi. Vẫn chạy cả khi giảm chuyển động.
  - Mọi `import()` có `.catch(() => {})`: lỗi mạng không ra unhandled rejection.
  - Bản tin footer: `mark()` đặt cùng lúc `data-invalid` và `aria-invalid` (trước: input hợp lệ mới gỡ aria-invalid; kết quả giống nhau). Disclosure footer giữ nguyên hành vi (listener chuyển từ `document` sang `window`, cùng sự kiện bubble).
  - Icon giỏ nhún: tìm count/link trong `.site-header__icons` thay vì cả document.
- `assets/motion-scrub.js` (mới, 2 794 B): code scrub + split cũ, chạy khi import. Công thức giữ nguyên: `--w = clamp((p·(n+2,5) − i) / 2,5)` (rút gọn đại số của bản cũ), `--lift = (0,5 − t)·[90,150,120]`.
- `assets/lazy-module.js` (379 → 765 / 768 B): `data-lazy-on="interaction"` thì không quan sát viewport, nạp ở `pointerenter`, `focusin` hoặc `touchstart` đầu tiên trong element; 1 `AbortController` gỡ cả 3 listener sau lần đầu; listener passive. Không có `data-lazy-on` thì như cũ (viewport, 200px).
- `tests/e2e/ES1-T316.spec.ts` (mới).
- `tests/e2e/ES1-T139.spec.ts`: trần `lazy-module.js` 384 → 768 theo ADR 0010 (test cũ sẽ fail nếu giữ 384).

## Hợp đồng cho task sau
- `data-lazy-on="interaction"` đặt cùng element có `data-lazy-module` (TE-13-R2-BE1: featured-product picker/form, quiz-dialog; TE-1-R2-BE1 header-drawer…). Chưa block nào dùng ở PR này, không đổi markup.
- Không đổi data-testid, class, partial, locale, Liquid.

## Ngân sách JS (ADR 0006/0010, cộng tĩnh `wc -c`, số thật chờ CI ES1-T177)
| Nhóm / trang | Trước | Sau | Trần |
| --- | --- | --- | --- |
| Chung (standard-events 888 + motion + header-menu 6 862 + header-sticky 1 680 + cart-drawer 3 868) | 22 459 | 19 401 | 19 456 |
| Trang chủ tải sẵn (chung + slideshow 8 057 + product-swatch 5 851 + quiz-dialog 1 511 + lazy-module) | 38 257 + scroll-extras 3 207 lúc tải | 35 585 | 40 960 |
| Trang chủ sau cuộn (+ nạp lười ≈ 34 869 gồm scroll-extras, + motion-scrub 2 794) | ≈ 73 126 | ≈ 73 248 | 65 536 (chờ TE-13-R2-BE1, TE-3-R2-BE2) |
| PDP tải sẵn (chung + picker 7 163 + form 6 857 + media 4 407 + recommendations 3 069) | 43 955 | 40 897 | 40 960 |

## Tự kiểm tra
- `wc -c`: motion.js 6 103 ≤ 6 144; lazy-module.js 765 ≤ 768; motion-scrub.js 2 794; mọi `assets/*.js` ≤ 8 192 (lớn nhất slideshow 8 057).
- `shopify theme check`: 0 lỗi (22 cảnh báo có sẵn ở templates/index*, blocks không chạm).
- `node --check` 3 file JS, `node --experimental-strip-types --check` spec: ok; khẳng định tĩnh của spec chạy bằng node: pass; logic interaction lazy-module thử với DOM giả: 3 sự kiện chỉ import 1 lần, element không có `data-lazy-on` vẫn vào observer.
- Không console.*, không fetch, không import tĩnh, không thêm thẻ `<script>`.
- Playwright `tests/e2e/ES1-T316.spec.ts` + hồi quy ES1-T235, ES1-T185, ES1-T139, ES1-T158 (desktop, Pixel 7), console, lhci: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
