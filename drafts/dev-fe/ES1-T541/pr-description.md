ES1-T541: FE (theo ES1-T567): toast, form message, lỗi trường, meter đạt đọc alias --color-success / critical / warning

## Thay đổi
29 dòng CSS, chỉ đổi tên biến (không đổi giá trị, không đổi selector). Alias đã khai báo ở `snippets/css-variables.liquid` (ES1-T540): `--color-success: var(--color-badge-new)`, `--color-critical: var(--color-sale)`, `--color-warning: var(--color-accent)`, cùng scope `:root`; không có scope con nào override token gốc nên computed value giữ nguyên.

assets/base.css (20)
- `.toast--success / --warning / --error` → `--color-success / --color-warning / --color-critical` (3)
- critical (10): `.site-footer__input[aria-invalid]` border + inset (2), `.site-footer__message` thanh trái, icon lỗi footer `.site-footer__invalid / __message--error .status-icon`, `.product-option__feedback`, `.product-form__error`, `.cart-items__error`, `.cart-line__error`, `.form-status--error` (thanh + icon, 2)
- success (7): `.form-message--success`, icon footer `.form-message--success .status-icon`, `.cart-free-shipping--reached` (meter đạt), `.cart-drawer__added-box`, `.cart-drawer__added-icon`, `.form-status` (thanh + icon, 2)

assets/aux.css (7)
- critical: `.password-hero__input[aria-invalid] / :user-invalid`, `.password-hero__error::before` (viền + chữ), `.form-field__input[aria-invalid]` (border + inset), `.form-field__error`
- success: `.password-hero__success`

assets/collection.css (2)
- critical: `.filter-group__money:has([aria-invalid])`, `.filter-group__price-error`

Giữ token gốc (foundation §2.1): badge sale/new, `.price__current--sale`, `.cart-line__discount`, `.cart-line__volume svg`, `--panel-saving`, `.form-field__required` (*), `.testimonial-item__verified`, `.sale-countdown-notice` (chỉ trong editor, không thuộc danh sách ticket). Ngoài phạm vi: `.alert`, `.alert--success` (ES1-T546).

## Tự kiểm tra
- `shopify theme check`: 0 lỗi (8 warning có sẵn ở block Liquid, không thuộc diff).
- AC1: `grep 'badge-new|--color-sale\)'` trên các selector trong danh sách = 0; badge/giá còn nguyên (13 dòng token gốc còn lại đều thuộc nhóm giữ hoặc ES1-T546).
- AC2: alias trỏ cùng token gốc, cùng scope `:root` → computed color/border-color không đổi. Đo trên preview: chờ CI.
- AC3: ảnh 360/1280 footer lỗi newsletter, cart meter đạt so pixel develop: chờ CI.
- Dung lượng: base.css +29 B thô (200 555 → 200 584), gzip tăng không đáng kể so 37 029 B develop, dưới trần 49 152. aux/collection: thay tên cùng độ dài ±, dưới 16 384 gzip. Môi trường agent chặn `gzip`, số gzip chính xác: chờ CI.
- Lighthouse, Playwright: chờ CI. Không file JS trong diff.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
