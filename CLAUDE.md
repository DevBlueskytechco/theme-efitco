# theme-ember — hướng dẫn cho mọi agent

Theme Shopify mới, dựng từ Skeleton Theme commit `a7a655e79b21e68316c228dc7e437b0b32550888`. Mục tiêu: chạy trong Shopify Canvas như custom theme (Sidekick sửa trực tiếp trên file). Không nộp Theme Store, nhưng lấy Theme Store requirements làm chuẩn chất lượng nội bộ.

## Đọc trước khi làm bất cứ gì
1. `AGENTS.md` của Skeleton — quy tắc kiến trúc, bắt buộc, không bàn lại: block-first, không `sections/`, không JSON template, không `{% stylesheet %}`/`{% javascript %}`, mọi chuỗi qua `| t`, mọi URL qua `routes.*`.
2. `.claude/rules/*.md` — quy ước team (ranh giới FE/BE, cấu trúc Skeleton, cấm production).
3. `docs/srs.md` → ticket đang làm → `docs/figma-inventory.md` → `docs/architecture.md`.

## Thứ tự nguồn sự thật
AGENTS.md > docs/adr/ > CONVENTION.md > ticket. Mâu thuẫn thì tạo ticket hỏi Tech Lead, không tự quyết.

## Nơi ghi đầu ra
- Code: chỉ trên nhánh `feature/ai-<ticket>`; không bao giờ `main`/`develop`.
- Nháp tài liệu, test case, spec: `drafts/<agent>/<ticket>/`.
- Không tạo thư mục mới ngoài `assets/ blocks/ config/ layout/ locales/ snippets/ templates/ docs/ drafts/ tests/ scripts/`.

## Lệnh kiểm tra
- `shopify theme check` — phải 0 lỗi, không thêm override vào `.theme-check.yml`.
- `npx playwright test` — E2E trên store dev (biến `STORE_URL`).
- `npx lhci autorun` — Lighthouse: performance ≥ 96 desktop, ≥ 90 mobile; accessibility ≥ 98.

## Khi không chắc
Ghi dòng đầu file đầu ra: `KHÔNG CHẮC: <lý do>` và vẫn nộp. Không im lặng, không bịa setting, trường, màn hình không có trong SRS/Figma.
