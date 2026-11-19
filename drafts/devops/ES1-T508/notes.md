KHÔNG CHẮC: chưa mở được /blogs/figma-blog và bài A1 trên store dev (tool screenshot báo thiếu STORE_PASSWORD), chưa có run CI nào chạy đủ URL mới; "xanh" trong DoD phải xác nhận bằng run CI đầu tiên sau merge.

# ES1-T508 — URL lhci cho blog và bài viết (TE-20 AC6, AC14)

## Thay đổi
`.github/workflows/store-tests.yml`, job `lighthouse`:
- env `BENCH_BLOG: ${{ vars.BENCH_BLOG || 'figma-blog' }}`, `BENCH_ARTICLE: ${{ vars.BENCH_ARTICLE || 'figma-stretch-after-training' }}`.
  Handle bài lấy theo A1, bài đầu của figma-blog trong `drafts/claude-code/ES1-T178/created-data.md` (gid://shopify/Article/570163396705). `tests/e2e/store-data.json` không có khoá blog.
  Đổi blog/bài không cần sửa workflow: `gh variable set BENCH_BLOG` / `BENCH_ARTICLE`.
- Thêm 2 `--collect.url`: `/blogs/<blog>?preview_theme_id=…&pb=0`, `/blogs/<blog>/<article>?…`. Article chỉ thêm khi blog không rỗng.
- `printf` in danh sách URL vào log để biết run đo trang nào.
- Không đổi `lighthouserc.json`, `lighthouserc.mobile.json` (ngưỡng giữ nguyên).

## Danh sách URL sau thay đổi (desktop + mobile, mỗi URL 3 lần)
1. `/`
2. `/products/$BENCH_PRODUCT` (nếu có var)
3. `/collections/$BENCH_COLLECTION` (nếu có var)
4. `/blogs/figma-blog`
5. `/blogs/figma-blog/figma-stretch-after-training`

## Ảnh hưởng cổng merge (required_checks)
- Check bắt buộc `lighthouse` (ci.yml) giờ gồm blog và bài viết: perf < 0,96 desktop / < 0,90 mobile hoặc a11y < 1 trên 2 trang này là đỏ mọi PR, kể cả PR không đụng blog.
- SEO trong lighthouserc là `warn` (minScore 1): SEO 100 của AC6/AC14 hiện trong bảng điểm (`seo=` mỗi dòng) nhưng không chặn merge. Muốn chặn phải đổi `warn` → `error`, ngoài phạm vi ticket (ticket cấm đổi ngưỡng).
- Ticket ghi a11y ≥ 98, file config đang là minScore 1 (chặt hơn); giữ nguyên theo ticket "không đổi ngưỡng".
- Số lần đo: 3 URL × 3 × 2 = 18 → 5 × 3 × 2 = 30; job lighthouse dài thêm ~2/3 thời gian, thêm request lên store dev (rủi ro 429). Concurrency `store-hoa-qua-e2e` không đổi, chỉ giữ store lâu hơn mỗi PR.
- Store tests vẫn theo công tắc `vars.RUN_STORE_TESTS` của ci.yml; đang tắt thì URL mới chỉ chạy khi `gh workflow run CI --ref develop`.
- Phụ thuộc dữ liệu: blog figma-blog phải còn trên store dev (fixture ES1-T178/ES1-T331). Bị xoá thì lhci đo trang 404 hoặc báo lỗi runtime → đỏ.

## Tự kiểm tra
- Đọc lại đoạn `run`: dạng `[ -n … ] && URLS+=(…)` giống 2 dòng cũ; GitHub chạy `bash -e`, `&&` trả false giữa danh sách không làm thoát step.
- `drafts/devops/ES1-T508/check-urls.rb`: parse YAML + chạy đoạn dựng URL với env giả (đủ / BENCH_ARTICLE rỗng). Không chạy được trong phiên này (lệnh cần duyệt); người review chạy:
  `ruby drafts/devops/ES1-T508/check-urls.rb .github/workflows/store-tests.yml`
- Chưa chạy lhci thật: cần STORE_PASSWORD; xác nhận trên run CI đầu tiên (bảng điểm in 10 dòng: 5 URL × desktop/mobile).
