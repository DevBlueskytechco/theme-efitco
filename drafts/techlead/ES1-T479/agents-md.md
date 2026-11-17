KHÔNG CHẮC: AGENTS.md do CTO sửa (scope-guard chặn agent, ES1-T310 #2). Dưới đây là đoạn thay thế đề xuất, áp cùng lúc merge ES1-T478. Nguồn: docs/adr/0013-tach-css-theo-template.md.

## 1. AGENTS.md mục Styling, đoạn `assets/critical.css` (hiện dòng 363–366)

Thay bằng:

```
- `assets/critical.css` holds above-the-fold styles (layout, header, hero,
  buttons) and stays at most 10 KB (10 240 B). Shared and home page styles go
  in `assets/base.css` (at most 49 152 B gzip). Styles used only by one page
  group go in that group's file, loaded by `template.name` in
  `layout/theme.liquid` (ADR 0013):
  `assets/product.css` (`product`), `assets/collection.css` (`collection`,
  `search`, `list-collections`), `assets/cart.css` (`cart`), `assets/aux.css`
  (`404`, `password`, `gift_card`, `page`, `blog`, `article`); each at most
  16 384 B gzip (Node `zlib.gzipSync`). `layout/password.liquid` and
  `templates/gift_card.liquid` load `aux.css` themselves.
  Why: every rule in `base.css` ships on every page; page-only rules should not
  slow the home page.
- A rule goes in a page group file only if every markup that outputs its class
  renders only on that group's templates. Markup on the home page or on two or
  more groups (product card, cart drawer, quick view, featured product media,
  variant picker, product form, countdown) stays in `base.css`. When unsure,
  use `base.css`. Do not add `preload: true` to page group files.
  Why: quick view and drawers render on other templates through partials, so
  their CSS must already be on the page.
```

## 2. AGENTS.md dòng 367–369 (subsetting)

Đổi câu cuối `Why: every rule ships on every page.` thành `Why: every rule ships on every page that loads its file.`

## 3. AGENTS.md bảng "How to" (hiện dòng 516)

Thay dòng `Add styles` bằng:

```
| Add styles | Block-scoped classes in `assets/base.css` if shared or on the home page, else in the page group file (`product.css`, `collection.css`, `cart.css`, `aux.css`); above-the-fold only in `assets/critical.css` (at most 10 KB); logical properties | `.button--link` in `assets/base.css`, `.cart-page__summary` in `assets/cart.css` |
```

## 4. Theme map / cây thư mục

Không đổi (chỉ thêm file trong `assets/`).
