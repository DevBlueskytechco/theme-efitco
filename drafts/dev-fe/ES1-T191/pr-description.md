KHÔNG CHẮC: (1) Card làm 336 x 448 theo snapshot, ảnh `1-1022.png` và comment Designer trên ticket; tiêu đề ticket, DoD và AC-H26 trong `docs/srs.md` vẫn ghi 300 x 448, `docs/figma-inventory.md` hàng 14 chưa áp bản sửa của Designer. Cần BA/Tech Lead sửa AC-H26. (2) Trang chủ `templates/index.liquid` không truyền blog: cài mới không có band cho tới khi merchant chọn blog. Ticket chỉ yêu cầu param cho template cổng. (3) Nhãn là tag đầu tiên của `article.tags`: bài nhiều tag thì nhãn phụ thuộc thứ tự Shopify trả về, Figma không có quy tắc. (4) Thêm `templates/index.te16.liquid` ngoài danh sách file của ticket, theo mẫu `index.te15`, để test band rỗng và dưới 5 bài. (5) Thanh cuộn mảnh luôn hiện, Figma không có: không có nút và không JS thì chuột không có bánh ngang không tới được thẻ thứ 5. Cần ghi sổ ES1-T197. (6) Gradient dùng `--color-background-dark` (#1E1E1E) thay #000 của Figma, nhãn dùng `--color-accent` (#C8400E) thay #D94610 của Figma: 0 màu literal, không thêm token, quyết định tương phản của CTO. Cần ghi sổ ES1-T197. (7) Dòng thời gian đọc dùng chữ trắng theo ĐỀ XUẤT ES1-T174 mục 4, Figma là xám. Mobile cũng là ĐỀ XUẤT của Designer, chưa có người duyệt. (8) Tiêu đề giới hạn 3 dòng, Figma không có trường hợp này. (9) `tests/e2e/ES1-T176.spec.ts` chưa có trong repo, chưa kiểm được dòng DoD về thứ tự và ngưỡng hàng 14.

# ES1-T191 TE-16-FE1: blog posts, hàng 14 (Figma 1:1022)

## Thay đổi
- `blocks/blog-posts.liquid`: eyebrow, heading, `ul` cuộn ngang. Gọi 1 lần, default chữ trong schema. Setting `eyebrow`, `heading`, `blog`, `articles_to_show` (1 đến 8, mặc định 5); param `id`, `handle`. Không có blog hoặc 0 bài: storefront không render, editor hiện placeholder.
- `snippets/article-card.liquid`: `li` > link tới `article.url`, ảnh lazy qua `snippets/image`, nhãn, tiêu đề, thời gian đọc. Không có ảnh: khung nền tối giữ nguyên cỡ. Không có tag: không có nhãn.
- `templates/index.liquid`, `templates/index.figma.liquid`: thêm ngay trước FAQ. Cổng truyền `handle: 'figma-blog'`, không có fallback: thiếu blog thì band không render.
- `templates/index.te16.liquid`: band blog không tồn tại, band 2 bài, band mặc định. Xoá trước khi phát hành thật.
- `assets/base.css`: mục Blog posts. 0 màu literal, logical properties, không thêm token. `critical.css` không đổi.
- `locales/`: `blocks.blog_posts` (`list_label`, `placeholder`, `read_time` one, other), `general.blog_posts`, `labels.blog_posts_*`.

## Thời gian đọc (D8)
Số từ của `article.content`, 200 từ/phút, làm tròn lên: `(số từ + 199) / 200` chia nguyên. 0 từ: ẩn dòng (AC-H27). Trước khi đếm, xuống dòng và `&nbsp;` đổi thành khoảng trắng, mỗi thẻ HTML có khoảng trắng phía trước, nên `<p>a</p><p>b</p>` là 2 từ. Thẻ nằm giữa 1 từ thì từ đó bị đếm 2 lần, sai số không đáng kể. Bảng BA đặt số từ là bội 200 nên bộ 5 bài ra đúng số Figma: không cần ngoại lệ che số.

## Cỡ theo màn hình (ES1-T174)
| Màn hình | Card | Gap | Padding chữ |
| --- | --- | --- | --- |
| 360 | 252 x 336 | 16 | 16 |
| 768 | 307 x 410 | 16 | 24 |
| Từ 64rem | 336 x 448, thẻ thứ 5 tràn ở 1920 | 24 | 24 |

## Theme map (AGENTS.md, Orchestrator hoặc người áp, scope-guard chặn)
Thêm vào bảng Blocks:

| Block | Role |
| --- | --- |
| `blog-posts` | Training Tips row: eyebrow, heading, article cards from one blog; renders nothing without articles. |

Thêm vào bảng Snippets:

| Snippet | Role |
| --- | --- |
| `article-card` | One article card: image, tag label, title, reading time calculated in Liquid. |

## Việc Orchestrator cần làm
- Chép `drafts/dev-fe/ES1-T191/ES1-T191.spec.ts` sang `tests/e2e/ES1-T191.spec.ts`.
- Áp `drafts/dev-fe/ES1-T191/ES1-T175.spec.patch` (`git apply`): T175 khoá cứng danh sách band, hàng 14 thêm dạng có điều kiện như hàng 3 vì store chưa có `figma-blog`.

## Tự kiểm tra
Đã chạy:
- `shopify theme check`: 100 file, 0 lỗi.
- 2 file locale parse được, không trùng key.
- `wc -c assets/critical.css` = 9921, không đổi. Không file JS trong diff, không thẻ script trong block và snippet.
- `git apply --check` patch T175: đạt.

Chưa chạy, không báo là đã kiểm (CTO 06/11, `RUN_STORE_TESTS=false`):
- `tests/e2e/ES1-T191.spec.ts`, chưa type-check; `ES1-T175.spec.ts`, `ES1-T176.spec.ts`. CSS và công thức đếm từ chưa chạy trên storefront hay trình duyệt.
- Axe, console, Lighthouse, tràn ngang ở 360 và 768, ui_diff hàng 14.
- Nhánh Liquid `if article.image`: store không có bài thiếu ảnh, spec chỉ gỡ ảnh khỏi DOM để kiểm khung.
- Band chỉ hiện sau khi ES1-T178 nhập blog `figma-blog`.
- Ảnh 360, 768, 1280, 1920: chờ CI bật lại.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
