KHÔNG CHẮC: spec chưa chạy, chưa type-check (không có trình duyệt, preview; tsc cần duyệt). RTL chỉ kiểm bằng ép dir=rtl, theme chưa có locale RTL. ariaDisabled (ARIA reflection) cần Firefox ≥ 119.

# ES1-T335 TE-7-R2-BE1: scroll-buttons.js 768 → 1 536 B (trả lời ES1-T209)

AC: TE-7 AC1 (hàng vừa khung: không nút, không tiến trình), TE-7 AC6 (nút đầu/cuối mờ 0.35 + aria-disabled="true"), sổ 10/11 câu 5. Bám markup ES1-T334 (PR #214): `data-static`, `.round-button[aria-disabled="true"]`, `data-testid="carousel-progress"`.

## Thay đổi
- `assets/scroll-buttons.js` (viết lại, 1 536 B):
  - `data-static` trên `<scroll-buttons>` khi `scrollWidth - clientWidth < 1`, tính lại qua ResizeObserver và scroll (rAF).
  - Đầu/cuối: `aria-disabled="true"`/`"false"` thay `hidden`. Nút vẫn hiện, giữ chỗ (CLS 0), bấm/Enter khi tắt không làm gì.
  - Nút đang focus bị tắt thì focus sang nút kia; hàng thành `data-static` (CSS ẩn cả 2 nút) thì focus về khung cuộn (`tabindex="0"`). Đọc `document.activeElement` trước khi đổi thuộc tính.
  - Listener `addEventListener` + 1 AbortController mỗi lần connect; `scroll` passive; disconnectedCallback abort + ngắt ResizeObserver. Gắn lại chạy lại sạch, không nhân đôi.
  - RTL: `Math.abs(scrollLeft)`; bước = `offsetLeft` card 2 − card 1 (âm khi RTL). Reduced motion: `behavior: "auto"`.
  - Guard `customElements.get`, thiếu hook thì bỏ qua êm. Không fetch, không console.
- `assets/scroll-extras.js`: bỏ `data-scrollable` (CSS ES1-T334 không còn đọc, `data-static` thay). 3 207 → 3 135 B. Tiến trình, kéo chuột giữ nguyên.
- `tests/e2e/ES1-T185.spec.ts`, `tests/e2e/ES1-T220.spec.ts`: sửa theo AC mới (CTO 13/11 ES1-T334: AC đổi hành vi thì ghi AC và sửa spec):
  - trần 768 → 1 536 (ADR 0010, ES1-T209 CTO 11/11);
  - "ẩn nút đầu/cuối" (`toBeHidden`, `hidden`) → `aria-disabled="true"`, nút vẫn hiện (TE-7 AC6, index-1280 §2.2, sổ 10/11 câu 5);
  - hàng không tràn: thêm `data-static`, nút + tiến trình ẩn (TE-7 AC1);
  - ES1-T220 kiểm thứ tự `document.activeElement` trước `.ariaDisabled =` thay `.hidden`.
  - Giữ nguyên: bước 1 card, smooth/reduced-motion, lazy-module, CLS, không JS, 360, vòng đời ResizeObserver, axe.
- `tests/e2e/ES1-T335.spec.ts` (mới): tĩnh (trần, AbortController, passive, không `.hidden =`/`onclick`, hook 4 block), data-static 2 chiều qua ResizeObserver, focus về khung cuộn khi thành static, nút tắt mờ 0.35 + có tên + Enter không cuộn, listener có signal và bị huỷ khi gỡ DOM, RTL, trang chủ mọi hàng `data-static` khớp `scrollWidth ≤ clientWidth`, 0 console error, axe.
- ES1-T184 không cần sửa: các `toBeHidden` ở đó là trước nâng cấp / không JS / 360 / `hidden` do test tự gắn.

## Ngân sách JS (wc -c)
- scroll-buttons.js 768 → 1 536 (+768), trần file 1 536 (ADR 0010) đạt đúng trần.
- scroll-extras.js 3 207 → 3 135 (−72).
- Cả 2 nạp lười theo viewport (lazy-module / motion.js), không đổi tải sẵn. Trang chủ tải sẵn ADR 0010 ≈ 32 131 − 72 = 32 059 (scroll-extras do motion.js import lúc tải); sau cuộn ≈ 48 651 + 768 − 72 = 49 347 ≤ 65 536.
- Không thêm thẻ script, không thêm file JS.

## Cho FE (không sửa trong PR này)
- `base.css` `.carousel-nav .round-button[hidden] { display: inline-flex; visibility: hidden; }` không còn dùng tới (JS không gắn hidden); giữ hay xoá do FE.
- `snippets/carousel-nav.liquid` doc ghi "(or hidden)", `snippets/carousel-progress.liquid` doc ghi scroll-buttons.js đặt `--scroll-size`/`--scroll-pos` (thực tế scroll-extras.js); sửa doc khi FE chạm file.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi (23 warning có sẵn, không file mới).
- `wc -c assets/scroll-buttons.js` = 1 536 ≤ 1 536; `assets/scroll-extras.js` = 3 135 ≤ 8 192.
- Không đổi locale, Liquid, CSS.
- Preview, Playwright (ES1-T335, ES1-T185, ES1-T220, ES1-T184, ES1-T316), Lighthouse: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
