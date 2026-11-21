KHÔNG CHẮC: đề xuất, agent không ghi được AGENTS.md (scope-guard, ES1-T310 #2). CTO áp tay cùng lúc merge ES1-T565. Dòng theo AGENTS.md ở develop f173d16.

# ES1-T564 — sửa AGENTS.md mục CSS theo ADR 0014

## 1. Dòng 19–20 (No Liquid-embedded assets): thêm 1 câu

Cũ:
```
- **No Liquid-embedded assets:** no `{% stylesheet %}`, no `{% javascript %}`.
  All CSS and JavaScript live in `assets/`.
```
Mới:
```
- **No Liquid-embedded assets:** no `{% stylesheet %}`, no `{% javascript %}`,
  no `<style>`. All CSS and JavaScript live in `assets/`. A block may link its
  own file with `{{ '<block>.css' | asset_url | stylesheet_tag }}` (ADR 0014).
```

## 2. Dòng 363–381: thay cả đoạn

Cũ: từ `- \`assets/critical.css\` holds above-the-fold styles` tới hết `their CSS must already be on the page.`

Mới:
```
- CSS has four tiers (ADR 0013, ADR 0014). Ask "where does the markup that
  outputs this class render?":
  1. `assets/critical.css`: above-the-fold styles (layout, header, hero,
     buttons), at most 10 240 B, `preload: true` in the layouts.
  2. `assets/base.css`, every page, at most 40 960 B gzip (49 152 until
     ES1-T566 merges): tokens, keyframes `motion-*`, the frame (header,
     announcement, menu drawer, mega menu, localization, footer), layers
     (dialog, sheet, drawer, toast), shared components (button, form,
     form-status, empty state, skeleton, product card, price, rating stars,
     product media, variant picker, product form, countdown, quick view, cart
     drawer, predictive search, breadcrumb, page title, pagination, carousel
     nav and progress, article card), and blocks on the first screen of a
     default template (slideshow, collection list, rich text) or whose classes
     other blocks reuse (featured collection, blog posts).
  3. Page group files, loaded by `template.name` in `layout/theme.liquid`,
     each at most 16 384 B gzip: `assets/product.css` (`product`),
     `assets/collection.css` (`collection`, `search`, `list-collections`),
     `assets/cart.css` (`cart`), `assets/aux.css` (`404`, `password`,
     `gift_card`, `page`, `blog`, `article`). For blocks that only render on
     that group. `layout/password.liquid` and `templates/gift_card.liquid`
     load `aux.css` themselves.
  4. Block files `assets/<block>.css`, at most 8 192 B gzip each, for a
     section-level block that can sit on any template and is not on the first
     screen (quiz, shop the look, bundle builder, featured product, image with
     text, testimonials, video carousel, FAQ, shop by level, multicolumn). The
     parent block outputs one line
     `{{ '<block>.css' | asset_url | stylesheet_tag }}` right before its root
     element, outside every `{% partial %}` and before the placeholder
     branch. Child blocks do not link. Another parent that renders the child
     links it too (`contact-aside` links `faq.css`). Never from a snippet or a
     layout.
  Why: every rule in `base.css` ships on every page; a block file only loads
  where the block is, on any template a merchant or Sidekick puts it.
- New section-level blocks get a block file by default. Use `base.css` only
  for first-screen blocks or shared components, and say why in the PR. Shared
  markup (product card, cart drawer, quick view, product media, variant picker,
  product form, countdown) stays in `base.css`. When unsure, use `base.css`.
  Why: quick view and drawers render on other templates through partials, so
  their CSS must already be on the page.
- Block and page group files load after `base.css`, so their rules beat shared
  rules of equal specificity. Raise the shared rule's specificity or drop the
  duplicate property, never `!important`. Block files reuse tokens and
  keyframes from `base.css` and never redefine them.
- No `preload: true` on page group or block files, no `media="print"` or
  `onload` tricks.
  Why: `critical.css` covers the first screen; preloading below-the-fold CSS
  competes with the LCP image.
- Home page budget: `base.css` plus every block file linked by blocks in
  `templates/index.liquid` at most 53 248 B gzip, at most 10 block files.
  Measure with Node `zlib.gzipSync` (default level).
```

## 3. Dòng 382–385: giữ nguyên (subsetting, scope class theo block)

## 4. Dòng 531 (bảng "Add styles"): thay

Cũ:
```
| Add styles | Block-scoped classes in `assets/base.css` if shared or on the home page, else in the page group file (`product.css`, `collection.css`, `cart.css`, `aux.css`); above-the-fold only in `assets/critical.css` (at most 10 KB); logical properties | `.button--link` in `assets/base.css`, `.cart-page__summary` in `assets/cart.css` |
```
Mới:
```
| Add styles | Block-scoped classes in the block file `assets/<block>.css` linked from the block (section-level, not first screen), the page group file (`product.css`, `collection.css`, `cart.css`, `aux.css`) if the block only renders there, or `assets/base.css` if shared or first screen; above-the-fold only in `assets/critical.css` (at most 10 KB); logical properties | `.quiz__form` in `assets/quiz.css`, `.cart-page__summary` in `assets/cart.css`, `.button--link` in `assets/base.css` |
```

## 5. Cây thư mục dòng 184: không đổi (`assets/` vẫn chứa mọi CSS).
