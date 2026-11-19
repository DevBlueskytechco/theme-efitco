KHÔNG CHẮC: data-testid="gift-card-actions" làm đỏ TC-43 tĩnh (tests/e2e/ES1-T386.spec.ts:191 bám chuỗi `<div class="gift-card__actions">`). FE không sửa tests/; đã mở ES1-T499 cho QA đổi selector, cần merge cùng PR này.

# ES1-T489: thêm data-testid còn thiếu ở 404, password, gift card (TE-21)

Nguồn: ES1-T489, ES1-T386, docs/srs.md#TE-21 AC7, AC9, AC10, AC13, AC14.
Chỉ thêm thuộc tính `data-testid` (và cập nhật danh sách test hook trong `{% doc %}`/comment). Không đổi class, cấu trúc, chuỗi, CSS, schema, locale.

## blocks/not-found.liquid
- `not-found-eyebrow` → p.not-found__eyebrow
- `not-found-text` → p.not-found__text
- `not-found-category-count` → span.not-found__category-count (chỉ có khi link là collection)

## blocks/password-hero.liquid
- `password-eyebrow` → p.password-hero__eyebrow (chỉ khi setting eyebrow có giá trị)
- `password-divider` → p.password-hero__divider ("Have a password?", chỉ khi bật newsletter)
- `password-newsletter-invalid` → p.password-hero__invalid (câu lỗi email phía client, khi không có form.errors)
- `password-newsletter-note` → p.password-hero__note
- `password-footer` → p.password-hero__footer
- `password-owner-link` → a.password-hero__footer-link ("Log in here", /admin)

## templates/gift_card.liquid
- `gift-card-heading` → h1.gift-card__title
- `gift-card-pill` → span.gift-card__pill
- `gift-card-amount` → .gift-card__amount (cả `<s>` khi hết hạn/bị tắt và `<span>` khi còn hiệu lực; chỉ 1 render)
- `gift-card-initial` → span.gift-card__initial ("of … initial value", chỉ khi balance < initial_value)
- `gift-card-expires` → div bọc dt/dd Expires trong dl.gift-card__meta (chỉ khi có expires_on)
- `gift-card-actions` → div.gift-card__actions

## Ảnh hưởng test hiện có
- ES1-T384.spec.ts, ES1-T408.spec.ts: selector class/regex vẫn khớp (class giữ nguyên).
- ES1-T386.spec.ts TC-43: đỏ do indexOf chuỗi `<div class="gift-card__actions">` → ES1-T499 (QA).
- Các TC khác của ES1-T386 bám role/text: không đổi hành vi; QA chuyển sang getByTestId sau merge.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi (22 warning có sẵn, không warning nào ở 3 file sửa).
- Không file JS, không CSS, không locale trong diff (3 file Liquid).
- Không đổi markup hiển thị → không ảnh hưởng Lighthouse/visual; preview, Playwright, Lighthouse: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
