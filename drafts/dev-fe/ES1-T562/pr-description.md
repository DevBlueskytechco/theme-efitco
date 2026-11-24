ES1-T562 — list-collections: `?page=` vượt số trang ra empty state + "Go to page 1" (TE-6 AC7)

Nguồn: QA ES1-T112 TC-50, BUG-ES1-T112-01; docs/srs.md TE-6 AC6/AC7; docs/ui-spec/pagination.md §3; ES1-T525 #2.

Thay đổi
- templates/list-collections.liquid: thêm nhánh `elsif collections.size == 0` (paginate.items > 0) giữa nhánh "No Collections Yet" và lưới. Render snippets/empty-state, testid `list-collections-page-empty`, nút "Go to page 1" tới `paginate.parts | first` (is_link), fallback `routes.collections_url`. Không render lưới rỗng, không render pagination ở nhánh này. h1 "Collections" + meta "{n} collections" giữ nguyên. Cùng mẫu với blocks/collection-products.liquid nhánh collection-page-empty.
- locales/en.default.json: gộp vào key `collections` có sẵn: `page_empty_heading` "No Collections on This Page", `page_empty_hint`, `page_first` "Go to page 1". Không trùng key.
- tests/e2e/ES1-T112.spec.ts: gỡ `test.fail` ở TC-50 (theo comment CTO 23/11); thêm assert testid `list-collections-page-empty` hiện và `list-collections-grid` count 0.
- Không CSS mới (dùng .empty-state có sẵn), không file JS.

Tự kiểm tra
- shopify theme check: 0 lỗi; 9 warning có sẵn ở blocks/quiz-step, templates/index*.liquid, không thuộc diff.
- Locale JSON: sửa bằng Edit trong object `collections`, không key trùng; parse JSON chưa chạy riêng được (lệnh python cần duyệt), theme check không báo lỗi JSON.
- TC-50 desktop + mobile: chờ CI (href kỳ vọng `/collections?page=1` từ paginate.parts khớp regex `/\/collections\/?(\?page=1)?$/`).
- Lighthouse, ảnh 3 breakpoint: chờ CI. Trang ?page=9999 không có ảnh, chỉ empty state.
- Heading: h1 page-title → h2 empty-state, đúng thứ tự.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
