KHÔNG CHẮC: spec tests/e2e/ES1-T382.spec.ts bám chuỗi `aspect-ratio: 1798 / 827` và tỉ lệ 1280 = 1798/827 → sẽ đỏ 2 test tới khi QA sửa (ES1-T596). Không đo được gzip trong sandbox (lệnh bị chặn quyền); diff chỉ rút ngắn chuỗi nên dung lượng không tăng.

# ES1-T580: tỉ lệ ảnh có tên (foundation §36)

Thay 11 aspect-ratio lấy theo px bản vẽ cũ bằng tỉ lệ có tên. Chỉ CSS, không Liquid, không JS.

| Vị trí | File | Cũ | Mới |
| --- | --- | --- | --- |
| Hero slideshow @80rem | base.css `.slideshow__slide` | 1798 / 827 | 2 / 1 |
| Ảnh trong tiêu đề | base.css `.rich-text__inline-image` | 165 / 94 | 16 / 9 |
| Collection card | base.css `.collection-card > .collection-card__image` | 336 / 220 | 3 / 2 |
| Testimonial | base.css `.testimonial-item__image img` | 456 / 270 | 16 / 9 |
| Cột ảnh FAQ | base.css `.faq__image img` | 509 / 542 | 4 / 3 |
| Video card dọc | base.css `.video-card__frame` | 264 / 470 | 9 / 16 |
| Bìa bài viết @80rem | aux.css `.image.article-main__cover` | 1798 / 827 | 2 / 1 |
| Shop the look (2 chỗ) | shop-the-look.css `.shop-the-look__media` | 936 / 816 | 1 |
| Featured product | featured-product.css `.featured-product__media-item` | 668 / 653 | 1 |
| Why choose us (split) | image-with-text.css `.image-with-text__media::before` | 920 / 876 | 1 |

Giữ nguyên: hero 768 = 4 / 3, 360 = 3 / 4; bìa bài 360 = 4 / 3, 768 = 16 / 9; gift card 1.586; level card đã 1 từ 48rem (base.css `.level-card__link` @48rem và khối 80rem) nên không sửa. object-position / focal point không đổi (ảnh vẫn qua `{% render 'image' %}`, object-fit cover).
Bỏ chú thích toạ độ bản vẽ cũ cạnh dòng sửa (Figma 1:896, 1:1094, 1:455, 1:760, 920 / 876, 936 x 816).

## Tự kiểm tra
- AC1: `grep -nE 'aspect-ratio:\s*[0-9]{3,}' assets/*.css` = 0.
- `shopify theme check`: 0 lỗi (9 warning có sẵn trên develop, không thuộc diff).
- Không file JS trong diff; 5 file CSS, +17/−17 dòng.
- gzip base.css / aux.css: không đo được trong sandbox; chuỗi mới ngắn hơn chuỗi cũ → không tăng so với develop. Chờ CI xác nhận.
- E2E: ES1-T382 sẽ đỏ 2 test (CSS slice + tỉ lệ 1280) — chờ ES1-T596 (QA). ES1-T157 (9/16 vs 264/470 lệch 0.0008 < 0.01) và ES1-T112 (1.5 vs 1.527, toBeCloseTo 1 chữ số) vẫn qua.
- AC2, AC3 (chụp 4 khổ trang chủ, list collections 1280, article 1280/1920; lệch ≤ 2px khung, mặt người không bị cắt), Lighthouse, Playwright: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
