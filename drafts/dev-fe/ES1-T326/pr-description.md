KHÔNG CHẮC: (1) AGENTS.md bị scope-guard chặn, 2 dòng bảng Snippets (breadcrumb, page-title) nhờ Tech Lead thêm, ES1-T451; (2) foundation §20 muốn CSS breadcrumb + tiêu đề trang ở critical.css, critical.css còn 323 B nên đặt ở base.css theo task-split (base.css chặn render, 0 CLS), chờ ES1-T451 xác nhận; (3) phần trình duyệt của spec chưa chạy local (sandbox chặn Chromium), chờ CI.

# ES1-T326 · TE-22-R2-FE1: breadcrumb + JSON-LD BreadcrumbList, page-title, .page-banner

Story TE-22. AC: TE-22 AC9, AC10, AC11, AC12, AC13 (SRS 0.5; trước là TE-1 AC7 bản 0.4), R11. Spec: foundation §3.3, §5. Sau: TE-10-R2-FE2 (ES1-T313, đã merge).

## Thay đổi

| File | Nội dung |
| --- | --- |
| `snippets/breadcrumb.liquid` (mới) | Đọc `template.name`, tối đa 3 mục. collection `Home / Collections / {collection}`; `collection.quiz` `Home / {title}`; list-collections `Home / Collections`; product `Home / {collection} / {product}` khi mở trong collection, ngược lại `Home / {product}`; blog `Home / {blog}`, trang tag `Home / {blog} / {tags}`; article `Home / {blog} / {article}`; page `Home / {page}`; search `Home / Search`. Template khác (index, cart, 404, password, gift_card, customers) không render gì, không JSON-LD. `<nav aria-label="Breadcrumb"><ol>`, mục cuối `<span aria-current="page">`, link qua `routes.root_url`, `routes.collections_url`, URL đối tượng. Tên đầy đủ, không cắt (AC10). Một khối JSON-LD `BreadcrumbList` dựng từ cùng biến với phần hiển thị, URL tuyệt đối (`request.origin` + route); mục cuối không có `item` vì không là link (AC12). Tham số `title` (tuỳ chọn) đổi tên mục cuối, dùng cho `?view=quiz`. |
| `snippets/page-title.liquid` (mới) | eyebrow (tuỳ chọn) → h1 → meta (tuỳ chọn), đúng thứ tự DOM (AC13); rỗng thì không thẻ; mọi chuỗi escape trong snippet. |
| `assets/base.css` | Mục mới trước "Collection page": `.breadcrumb*` (14/20, link muted 8.45:1 cao 44, mục cuối foreground 500, "/" muted-light qua `::before` alt rỗng, hover foreground + gạch chân, focus accent, đệm trên 16 → 24 từ 64rem); `.page-title*` (eyebrow accent 800 uppercase, meta 14 muted, đệm 16/48 → 24/64, cột `minmax(0, 1fr)` để h1 dài xuống dòng); `.page-banner` (thẻ bo 16 = `--radius-card + --space-1`, cách header 16 → 24, cao tối thiểu 280 → 360, ảnh `.page-banner__media` phủ tuyệt đối `cover`, lớp tối `::after` gradient 75% đáy → 60% từ giữa lên, chữ đáy trái đệm 32/24 → 48, breadcrumb/eyebrow/h1/meta trắng, focus trắng). Không z-index: lớp tối nằm trong khung ảnh, nội dung positioned đứng sau trong DOM. 0 màu literal, 0 thuộc tính vật lý. |
| `locales/en.default.json` | `general.breadcrumb.home` "Home", `general.breadcrumb.label` "Breadcrumb" (gộp vào nhóm `general`). Dùng lại `collections.title`, `search.title`. |
| `tests/e2e/ES1-T326.spec.ts` (mới) | TC-01–05 tĩnh (markup, 7 loại template, JSON-LD, page-title, CSS + ngân sách); TC-06–10 fixture base.css thật ở 360/768/1280 (link 44, tên 60 ký tự xuống dòng không tràn, màu, đệm, banner 280/360, bo 16, lớp 75/60, chữ trắng vẽ trên lớp tối); TC-11–12 store (/, /cart không breadcrumb và không BreadcrumbList; /collections/all có breadcrumb thì đúng 1 BreadcrumbList khớp tên/thứ tự). |
| `tests/e2e/ES1-T313.spec.ts` | TC-03 `toEqual` → `toMatchObject` cho `locale.general`: nhóm này nhận thêm `general.breadcrumb`; vẫn kiểm `dismiss`, `try_again` đúng giá trị. |

Không đổi template: gắn breadcrumb/page-title/banner vào trang là việc của TE-6-R2-FE2 (collection, banner LCP eager + `fetchpriority="high"`), TE-6-R2-FE4 (list-collections), TE-4-R2-FE3 (product), TE-20, TE-21 (blog, article, page), search, quiz. Không xoá `.collection-banner*` vì block còn dùng; TE-6-R2-FE2 thay bằng `.page-banner` và xoá CSS cũ.

## Hợp đồng cho task sau

- Breadcrumb: `{% render 'breadcrumb' %}` ngay dưới header (đầu container đầu tiên của template), hoặc trong `.page-banner__content`. Quiz: `{% render 'breadcrumb', title: quiz_heading %}`.
- Tiêu đề: `{% render 'page-title', title: ..., eyebrow: ..., meta: ... %}`; chuỗi truyền vào là chữ thường, snippet tự escape.
- Banner: `<div class="page-banner">{% render 'image', class: 'page-banner__media', image: ..., loading: 'eager', fetchpriority: 'high', sizes: ... %}<div class="page-banner__content">breadcrumb + page-title</div></div>`. Bài viết (TE-20 AC9) không dùng lớp tối này.
- testid: `breadcrumb`, `breadcrumb-current`, `breadcrumb-structured-data`, `page-title`, `page-title-heading`. Không JS, không partial.

## Tự kiểm tra

- `shopify theme check`: 0 lỗi, 25 warning = 23 cũ + 2 OrphanedSnippet (breadcrumb, page-title) chờ template gọi.
- `gzip -c assets/base.css | wc -c` 47 739 → 48 547 (≤ 49 152); `assets/critical.css` 9 917 B không đổi.
- Không file JS trong diff.
- Playwright local: TC-01–05 ES1-T326 + TC-01–04 ES1-T313 đạt (9/9). TC-06–12 cần Chromium: sandbox chặn, lần chạy ngoài sandbox bị từ chối, chờ CI. TC-11–12 cần PREVIEW_URL; TC-12 chỉ ghi annotation `skip-data` khi template collection chưa gọi snippet (không coi là đạt AC9 dạng collection).
- Tương phản (tính tay, token mặc định): link 8.45, mục cuối 17.4, chữ trắng trên ảnh trắng sau lớp 60% 4.56, đáy 75% ≥ 7.3.
- Preview, Lighthouse (desktop/mobile), ảnh 3 breakpoint: chờ CI. Trang hiện tại không đổi markup nên điểm Lighthouse không bị ảnh hưởng ngoài +808 B gzip base.css.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
