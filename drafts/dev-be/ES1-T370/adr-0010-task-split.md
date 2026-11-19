KHÔNG CHẮC: CTO (ES1-T490, comment ES1-T370 18/11) giao BE sửa bảng ADR 0010 và task-split; hook scope-guard chặn dev-be ghi `docs/adr/` và `drafts/techlead/`. Bản sửa dưới đây chờ Tech Lead áp (ticket hỏi kèm PR).

# ES1-T370: sửa bảng ADR 0010 và task-split ES1-T307 (CTO 18/11, ES1-T490 phương án B)

## docs/adr/0010-phan-bo-ngan-sach-js-theo-trang.md, bảng "Quyết định"

Thay dòng:

```
| Cart | cart-items (gồm checkout bar) | 7 168 | cart-page |
```

bằng:

```
| Cart | cart-items | 7 168 | cart-page |
| | cart-checkout-bar (thanh checkout dưới 64rem, `<cart-checkout-bar>`; tách khỏi cart-items, CTO 18/11 ES1-T490 B) | 1 024 | cart-page |
```

Mục "Ước sau phân bổ": `cart ≈ 26 120` → `cart ≈ 27 144` (+ 1 024 trần cart-checkout-bar). Đo thật ES1-T370: 27 892 B (bảng ở `pr-description.md`).

## drafts/techlead/ES1-T307/task-split.md

Dòng 190 (TE-5-R2-BE1), thay:

```
- TE-5-R2-BE1 · BE · 5 point · TE-5 · S4 · `assets/cart-items.js` (5 625 → ≤ 7 168 B): stepper debounce, khoá theo quantity rule, ô sai `aria-invalid` không gửi, 422 về số server + live region, ghi chú lưu khi rời ô và giữ chữ khi refresh, "Updating cart…" + `aria-disabled` Checkout, thanh checkout `html[data-bottom-bar="cart"]` khi panel ngoài màn. AC: TE-5 AC2, AC5, AC8, AC9. Sau: TE-5-R2-FE1, TE-5-R2-FE2, TE-10-R2-BE1.
```

bằng:

```
- TE-5-R2-BE1 · BE · 5 point · TE-5 · S4 · `assets/cart-items.js` (5 625 → ≤ 7 168 B): stepper debounce, khoá theo quantity rule, ô sai `aria-invalid` không gửi, 422 về số server + live region, ghi chú lưu khi rời ô và giữ chữ khi refresh, "Updating cart…" + `aria-disabled` Checkout, dòng đang ghi `aria-busy` + −/+/xoá `aria-disabled`; `assets/cart-checkout-bar.js` (mới, ≤ 1 024 B, host `<cart-checkout-bar>` FE ES1-T498, CTO 18/11 ES1-T490 B): thanh checkout `html[data-bottom-bar="cart"]` khi panel ngoài màn. AC: TE-5 AC2, AC5, AC8, AC9. Sau: TE-5-R2-FE1, TE-5-R2-FE2, TE-10-R2-BE1, ES1-T498.
```

Bảng hợp đồng dòng 91: thêm `<cart-checkout-bar>` vào cột custom element, `cart-checkout-bar` vào cột data-testid.
