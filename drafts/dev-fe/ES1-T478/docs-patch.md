KHÔNG CHẮC: scope-guard chặn dev-fe ghi AGENTS.md, docs/architecture.md, drafts/techlead/ES1-T307/task-split.md. Ba sửa đổi dưới đây CTO yêu cầu đi cùng PR ES1-T478 (comment 17/11 08:22); cần CTO/Orchestrator áp trước khi merge.

## 1. AGENTS.md (nguồn: drafts/techlead/ES1-T479/agents-md.md, ADR 0013)

1a. Mục Styling, thay đoạn (dòng 363–370 hiện tại):

```
- `assets/critical.css` holds above-the-fold styles (layout, header, hero,
  buttons) and stays at most 10 KB (10 240 B); everything else goes in
  `assets/base.css`. Both load from `layout/theme.liquid` (ADR 0003).
  Why: a small critical file keeps first render and LCP fast.
- Because the theme does not use `{% stylesheet %}`, Shopify CSS subsetting
  does not apply; keep selectors scoped to the block class
  (`.rich-text__heading`) and remove CSS when you remove markup.
  Why: every rule ships on every page.
```

bằng:

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
- Because the theme does not use `{% stylesheet %}`, Shopify CSS subsetting
  does not apply; keep selectors scoped to the block class
  (`.rich-text__heading`) and remove CSS when you remove markup.
  Why: every rule ships on every page that loads its file.
```

1b. Bảng "How to" (dòng 516), thay dòng `Add styles` bằng (ví dụ đổi `.cart-page__summary` của bản nháp thành `.cart-page__heading` vì class `.cart-page__summary` không có trong cart.css):

```
| Add styles | Block-scoped classes in `assets/base.css` if shared or on the home page, else in the page group file (`product.css`, `collection.css`, `cart.css`, `aux.css`); above-the-fold only in `assets/critical.css` (at most 10 KB); logical properties | `.button--link` in `assets/base.css`, `.cart-page__heading` in `assets/cart.css` |
```

## 2. drafts/techlead/ES1-T307/task-split.md

2a. Dòng 110 (DoD chung), thay
`FE: \`wc -c assets/critical.css\` ≤ 10 240, \`gzip -c assets/base.css | wc -c\` ≤ 49 152, ảnh`
bằng
`FE: \`wc -c assets/critical.css\` ≤ 10 240, gzip đo bằng Node \`zlib.gzipSync\` (ES1-T472 a, ADR 0013): \`assets/base.css\` ≤ 49 152, mỗi file theo template (\`product.css\`, \`collection.css\`, \`cart.css\`, \`aux.css\`) ≤ 16 384, ảnh`

2b. Dòng 119 (TE-10-R2-FE3), thay
`\`assets/base.css\`: xoá CSS không còn markup (grep class trong blocks/snippets/templates), 44 thuộc tính vật lý \`left|right|top|bottom\` sang logical, báo cáo byte trước/sau. AC: TE-14 AC4, NFR-1, ES1-T310 #1. Sau: TE-4-R2-FE8, TE-6-R2-FE2, TE-5-R2-FE2. DoD thêm: gzip ≤ 49 152; nếu lhci desktop < 98 do CSS thì báo Tech Lead (ADR tách CSS).`
bằng
`\`assets/base.css\` + file CSS theo template (\`product.css\`, \`collection.css\`, \`cart.css\`, \`aux.css\`): xoá CSS không còn markup (grep class trong blocks/snippets/templates), 44 thuộc tính vật lý \`left|right|top|bottom\` sang logical, báo cáo byte trước/sau. AC: TE-14 AC4, NFR-1, ES1-T472 a (đảo ES1-T310 #1; tách CSS theo template đã làm ở ES1-T478, ADR 0013). Sau: TE-4-R2-FE8, TE-6-R2-FE2, TE-5-R2-FE2, ES1-T478. DoD thêm: \`zlib.gzipSync\` base.css ≤ 49 152, mỗi file template ≤ 16 384; nếu lhci desktop < 98 do CSS thì báo Tech Lead.`

## 3. docs/architecture.md dòng 10

Thay `- \`assets/\`: \`base.css\`, \`critical.css\`, mỗi tính năng JS 1 file ES module ≤ 8 KB: ...`
bằng `- \`assets/\`: \`critical.css\` (≤ 10 240 B thô), \`base.css\` (khung chung + trang chủ, ≤ 49 152 B gzip), CSS theo nhóm trang nạp theo \`template.name\` (ADR 0013, mỗi file ≤ 16 384 B gzip): \`product.css\`, \`collection.css\` (collection, search, list-collections), \`cart.css\`, \`aux.css\` (404, password, gift_card, page, blog, article); mỗi tính năng JS 1 file ES module ≤ 8 KB: ...` (giữ nguyên phần danh sách JS phía sau).
