# UI spec: Phân trang chung toàn theme (ES1-T287)

Mục đích: một kiểu phân trang cho mọi danh sách nhiều trang, để người mua biết đang ở trang nào, sang trang kế bằng 1 chạm, bot crawl được mọi trang. Story TE-6 AC1, AC5 (collection, list-collections), TE-8 AC3 (search), TE-9 AC3 (blog, bình luận bài viết).
Snippet: `snippets/pagination.liquid` (đã có, sửa theo spec này). Dùng ở: `collection.md` §8, `list-collections.md` §4, `search.md` §3.9, `blog.md` §5, `article.md` §1 (bình luận).
Figma: không có phân trang. Phát triển từ nút chevron tròn 52 Figma 1:398 (sổ 09/11) và màu accent của Figma 1:359. Thành phần: `docs/ui-spec/foundation.md` §6 (F§6), kit `.round-button`.
Mockup: `drafts/designer/ES1-T287/pagination.html` + `pagination-360|768|1280|1920.png` (bảng mọi trạng thái).

## Thay đổi audit (ES1-T283)

| # | Mã audit | Trước | Sau | Nguồn |
| --- | --- | --- | --- | --- |
| 1 | A3 | blog: nút chữ "Newer articles"/"Older articles", ô vuông 44 bo `--radius-button`, trang hiện tại nền foreground | nút tròn 52 chevron, số trang pill 44, trang hiện tại accent, như collection/search | Sổ 10/11 S3/C3 (nút tròn 52, snippet `pagination` chung) |
| 2 | A4, câu CTO 5 | đầu/cuối khác nhau: collection, list-collections ẩn Previous ở trang 1; search giữ nút mờ | mọi trang giữ Previous/Next ở đầu/cuối: mờ 0.35 + `aria-disabled`, không link | Sổ 10/11 audit (5) |
| 3 | A4 | mỗi spec tự mô tả phân trang, chuỗi riêng (`blog.pagination.*`, `search.pagination_*`, `collections.pagination.*`) | spec này là nguồn duy nhất; spec trang chỉ trỏ về; một bộ chuỗi `collections.pagination.*` | Sổ 10/11 S3 |
| 4 | A4 | bình luận bài viết: chữ "Earlier comments"/"Later comments" | cùng snippet, `label` nav "Comment pages", neo `#comments` | §5 |

## 1. Anatomy

```
< 48rem   [‹ 52]          Page 2 of 9          [› 52]
≥ 48rem          [‹ 52]  16  1 … 4 (5) 6 … 9  16  [› 52]
```

DOM (thứ tự đọc giữ nguyên ở mọi mốc):
`<nav class="pagination" aria-label="Pagination">` → `<ul class="pagination__list" role="list">`
1. `li.pagination__item--prev`: Previous (link hoặc span tắt).
2. `li.pagination__status`: "Page X of Y" (chỉ hiện < 48rem).
3. `li.pagination__num` × n: số trang / trang hiện tại / dấu "…" (chỉ hiện ≥ 48rem).
4. `li.pagination__item--next`: Next.
5. (tuỳ chọn, ngoài `<ul>`) dòng tóm tắt `p.pagination__summary` "Showing 25–37 of 37 results" (chỉ search, §6).

Không render gì khi `paginate.pages <= 1`.

## 2. Thành phần

| Phần | Kích thước | Màu, chữ | Markup |
| --- | --- | --- | --- |
| Previous / Next | tròn 52 × 52, chevron 11 × 16 giữa (`snippets/slideshow-icon` previous/next) | nền `--color-background`, viền 1px `--color-border`, chevron `--color-foreground` | `<a class="round-button pagination__step" href aria-label="Previous page">` |
| Số trang | pill cao 44, rộng tối thiểu 44, padding ngang 8, bo `--radius-pill` | viền 1px `--color-border`, chữ 14/500 foreground | `<a class="pagination__page" href aria-label="Page 4">4</a>` |
| Trang hiện tại | như số trang | nền + viền `--color-accent`, chữ `--color-accent-foreground` 14/700 | `<span class="pagination__page" aria-current="page"><span class="visually-hidden">Page </span>5</span>` (không link) |
| Dấu "…" | rộng 24, cao 44 | `--color-muted` 14 | `<span class="pagination__gap">…</span>` (không link) |
| "Page X of Y" | cao 52 (căn giữa 2 nút) | 14/500 `--color-foreground` | `<li class="pagination__status">` |
| Tóm tắt (search) | dưới hàng, cách 16 | 14 `--color-muted` | `<p class="pagination__summary">` |

Khoảng cách: giữa các số 8 (`gap`), chevron ↔ số 16 (gap 8 + margin 8). Khoảng cách từ nội dung trên tới phân trang do spec trang quyết (48, lên 64 ở desktop); phân trang → footer `--section-gap`.

Cửa sổ số: `{% paginate … by N, window_size: 1 %}` → tối đa 7 mục số ("1 … 4 (5) 6 … 9"). Hàng rộng nhất ≥ 48rem: 52 + 16 + 7 × 44 + 6 × 8 + 16 + 52 = 492 < 728, không xuống dòng ở 768. Số 3 chữ số (trang 100+) pill tự giãn.

## 3. Trạng thái

| Trạng thái | Previous / Next | Số trang | Nguồn |
| --- | --- | --- | --- |
| Mặc định | trắng, viền border, chevron foreground | viền border, chữ foreground | F§6, Figma 1:398 |
| Hover | nền + viền accent, chevron trắng, scale 1.06, 250ms | viền foreground, 150ms | Sổ 09/11 (rê chuột cam), F§6 |
| Active (nhấn) | scale 0.94 | — | F§6 |
| Focus (bàn phím) | outline 2px accent offset 3 | outline 2px accent offset 2 | F§6 |
| Trang hiện tại | — | nền accent chữ trắng 700, `aria-current="page"`, không link, không hover | ES1-T107 #6 (CTO chấp nhận) |
| Trang đầu / cuối | nút tương ứng vẫn hiện, opacity 0.35, `<span role="link" aria-disabled="true" aria-label>`, không `href`, không vào thứ tự Tab, không hover, `cursor: default` | — | Sổ 10/11 audit (5): giữ chỗ, 0 CLS |
| 1 trang | không render `<nav>` | — | snippet hiện có |
| Nhiều trang | dấu "…" theo `paginate.parts` | | Shopify `paginate.parts` |
| Không JS | mọi mục là link GET thật | | AGENTS "Works without JavaScript", SRS TE-6 AC2 |
| Có JS (collection, search) | BE có thể chặn click, refresh partial kết quả (khi đó vùng kết quả theo S7 collection / S5 search: skeleton, không làm mờ), cập nhật URL bằng `href` của link, cuộn về đầu vùng kết quả, focus vào số kết quả (`tabindex="-1"`). Không thì tải lại trang | | collection §9 S7, search §6 S5 |
| `?page=` vượt số trang | ĐỀ XUẤT: danh sách rỗng → empty state của trang + link "Go to page 1" (`paginate.parts` đầu). Nguồn 05 §7 (không để trang trống không lối ra) | | 05 §7 |

Không có trạng thái đang tải riêng cho phân trang: link là điều hướng; trạng thái tải thuộc vùng kết quả.

## 4. Theo mốc

| | 360 | 768 | 1280 | 1920 |
| --- | --- | --- | --- | --- |
| Bố cục | `[‹] Page X of Y [›]` trải hết 320, 2 nút sát 2 mép (vùng ngón cái) | `[‹] số [›]` căn giữa | như 768, căn giữa container 1240 | như 768, căn giữa 1416 |
| Số trang | ẩn (`display: none`) | hiện, cửa sổ 1 | như 768 | như 768 |
| "Page X of Y" | hiện | ẩn (`display: none`) | ẩn | ẩn |
| Vùng chạm | 52 / 52 | 52, số 44 | như 768 | như 768 |

Lý do ẩn số < 48rem: 9 mục × 44 + gap không vừa 320 (08 #504D "dễ bấm trên mobile"). "Page X of Y" không `aria-hidden`: khi số trang ẩn bằng `display: none`, đây là chỗ duy nhất trình đọc màn hình biết trang hiện tại; ≥ 48rem nó `display: none` nên không đọc lặp.

## 5. Settings và tham số snippet

Không setting merchant (số mục mỗi trang là setting của từng block trang: collection 24 theo SRS AC1, search "Results per page", blog "Articles per page"; bình luận 10 cố định).

Tham số `{% render 'pagination' %}` (Dev FE, `{% doc %}`):

| Tham số | Kiểu | Mặc định | Dùng |
| --- | --- | --- | --- |
| `paginate` | object | bắt buộc | đối tượng của thẻ `paginate` |
| `label` | string | `collections.pagination.label` "Pagination" | bình luận: `blog.comments_pagination_label` "Comment pages" |
| `anchor` | string | trống | bình luận `#comments`; blog ĐỀ XUẤT `#blog-grid` (blog.md §5); collection, search trống |
| `summary` | string | trống | search: "Showing 25–37 of 37 results" |

Tên nút luôn "Previous page" / "Next page" (mọi trang, kể cả bình luận); ngữ cảnh khác nhau đọc từ tên `<nav>`. Lý do: một thành phần một tên (06 §1 nhất quán), WCAG 2.4.4 cho phép mục đích link theo ngữ cảnh nav.

Chuỗi (`locales/en.default.json`, nhóm có sẵn `collections.pagination`): `label` "Pagination" (giữ), `previous` "Previous" → "Previous page", `next` "Next" → "Next page", `page` "Page {{ number }}" (giữ), thêm `page_of` "Page {{ current }} of {{ total }}", `summary` "Showing {{ from }}–{{ to }} of {{ total }} results". Thêm `blog.comments_pagination_label` "Comment pages". Bỏ đề xuất cũ `blog.pagination.*`, `search.pagination_label/previous/next/page/summary`.

## 6. Dùng ở đâu

| Trang | Paginate | Tham số | Khác |
| --- | --- | --- | --- |
| Collection | `collection.products` by 24 | — | collection.md §8 |
| List collections | `collections` by 24 | — | store dev 14 collection: không hiện |
| Search | `search.results` by setting | `summary` | search.md §3.9 |
| Blog | `blog.articles` by setting | `anchor: '#blog-grid'` (ĐỀ XUẤT) | blog.md §5 |
| Bình luận bài viết | `article.comments` by 10 | `label`, `anchor: '#comments'` | article.md §1 |

## 7. Accessibility

| Cặp | Tỉ lệ | Chỗ dùng |
| --- | --- | --- |
| foreground / background | 17.4 | chevron, số trang, "Page X of Y" |
| accent-foreground / accent | 5.01 | trang hiện tại, chevron khi hover |
| accent / background | 5.01 | outline focus (≥ 3, WCAG 1.4.11) |
| muted / background | 8.45 | dấu "…", tóm tắt |
| border / background | 1.26 | viền nút, viền số: trang trí; nút nhận diện bằng chevron/chữ 17.4 (như Figma 1:398) |
| chevron 35% / background | 2.2 | nút tắt: WCAG 1.4.3, 1.4.11 miễn cho thành phần không hoạt động; không có chữ nên Lighthouse `color-contrast` không chấm |

- Landmark `<nav>` có tên ("Pagination", bình luận "Comment pages"); một trang chỉ có 1 nav mỗi tên.
- Tên riêng: Previous/Next qua `aria-label`; số trang `aria-label="Page 4"`; trang hiện tại chữ ẩn "Page " (không đặt `aria-label` lên `<span>` không role: axe `aria-prohibited-attr`).
- Nút tắt: `<span role="link" aria-disabled="true">` có `aria-label`, không `tabindex`, không `href`: trình đọc vẫn biết có nút, bàn phím bỏ qua.
- Vùng chạm: chevron 52, số 44 (≥ 44 mobile, ≥ 24 target-size); 2 chevron < 48rem cách nhau ≥ 100.
- Không chỉ dùng màu: trang hiện tại có nền đảo + đậm + `aria-current`; nút tắt có `aria-disabled` + mất viền nổi (opacity).
- RTL: chevron lật bằng `:dir(rtl) .pagination__step svg { scale: -1 1; }`.
- Zoom 200% (640 CSS px ở 1280): rơi về bố cục < 48rem, không cuộn ngang.

## 8. Motion

Hover chevron 250 (màu + scale), số trang 150 (viền), `--ease-out`. Chỉ transform/opacity/màu (sổ 09/11). `prefers-reduced-motion: reduce`: bỏ scale, giữ đổi màu.

## 9. Lighthouse

- SEO: mọi trang con là `<a href>` thật, crawl được (`crawlable-anchors`); nút tắt không phải `<a>` nên không có `<a>` thiếu `href`. Tên link không chứa "click here"/"read more" (`link-text`). Không infinite scroll, không "Load more" (08 #2167D).
- A11y: mọi link/nút có tên; không ARIA cấm; `<ul>` chỉ chứa `<li>`; vùng chạm ≥ 24.
- Performance: 0 JS bắt buộc; chevron SVG inline từ `slideshow-icon` (không request); CSS trong `assets/` (khoảng 1 KB), không ảnh.
- CLS: nút đầu/cuối giữ chỗ 52 (sổ 10/11 audit 5); hàng cao cố định 52; "Page X of Y" một dòng (`white-space: nowrap`).
- BP: không lỗi console.

## 10. Map sang code

| Phần | Hiện có (`snippets/pagination.liquid`) | Cần đổi (Dev FE) |
| --- | --- | --- |
| Previous/Next | link chữ `.pagination__link`, ẩn ở đầu/cuối | `.round-button.pagination__step` + `{% render 'slideshow-icon', direction: 'previous' %}`, `aria-label`; đầu/cuối render `<span role="link" aria-disabled="true">` |
| Số trang | `.pagination__link`, `aria-label` có sẵn | class `.pagination__page`, pill 44; li `.pagination__num` |
| Trang hiện tại | `aria-current`, `--current` | chữ ẩn "Page " thay vì để trần |
| "Page X of Y" | — | `li.pagination__status`, chuỗi `page_of` |
| Tham số | `paginate`, `label` | thêm `anchor`, `summary` |
| Chuỗi | `collections.pagination.*` cứng trong snippet | giữ nhóm, đổi `previous`/`next`, thêm `page_of`, `summary` |
| CSS | `.pagination__*` trong `assets/base.css` | theo §2–§4; nút tròn dùng lại `.carousel-nav__button` hoặc tách `.round-button` chung (F§21) |
| Test hook | `pagination`, `pagination-previous`, `pagination-next`, `pagination-page`, `pagination-current` | giữ; nút tắt giữ `data-testid` cũ + `aria-disabled`; thêm `pagination-status` |

Gọi snippet chỉ từ `templates/` hoặc block trang (block `collection-products`, `search-results`, `blog-articles`, `article-comments`), không lồng trong snippet khác.

## 11. Đề xuất cho file ngoài phạm vi ES1-T287

- `docs/ui-spec/foundation.md` §6: thêm dòng "Phân trang: xem `pagination.md`" cạnh hàng Chevron tròn 52; §21 thêm hàng phân trang.
- `drafts/designer/_kit/kit.css`: chuyển khối CSS `.pagination__*` (đang chép trong 5 mockup) vào kit để mockup sau dùng chung.
- `drafts/designer/ES1-T256/search.html` S7: đổi sang class chung, chevron ↔ số 16, bỏ `aria-hidden` ở "Page X of Y".

## 12. Quyết định CTO đã chốt 11/11 (theo đề xuất, sổ 11/11)

1. Bình luận bài viết dùng cùng tên nút "Previous page"/"Next page", ngữ cảnh đọc từ nav "Comment pages" (bỏ "Earlier/Later comments")? Đề xuất: có (§5, 06 §1).
2. Dòng "Showing 25–37 of 37 results" dưới phân trang chỉ ở search (collection đã có số kết quả ở thanh công cụ, 08 #531D)? Đề xuất: có.
3. `?page=` vượt số trang hiện empty state của trang + "Go to page 1"? Đề xuất: có (§3, 05 §7).
