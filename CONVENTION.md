# Convention team — theme-efitco

Bổ sung cho AGENTS.md (AGENTS.md thắng khi mâu thuẫn).

## Nhánh và commit
`main` (store thật / Canvas), `develop` (hoa-qua-nhap-khau (efitco-ai-dev) tổng hợp), `feature/<ticket>-<slug>` (người), `feature/ai-<ticket>` (agent), `hotfix/<ticket>`. Conventional Commits: `feat(blocks)`, `fix(css)`, `chore(ci)`, `docs(merchant)`; mã ticket trong body. PR ≤ 400 dòng; 1 approve cùng phía + Tech Lead.

## FE / BE
Xem `.claude/rules/fe-be-boundary.md`. JS = BE.

## Liquid / CSS / JS
- CSS dùng logical properties (inline/block, start/end), không left/right cứng — sẵn RTL (Editions Fall '26). Không dùng `{% stylesheet %}` nên CSS subsetting của Shopify không áp dụng; ngân sách CSS theo ADR 0003.
- JS cart/product/search phải tương thích Standard storefront actions: override `Shopify.actions` khi theme có UI riêng (cart drawer), dispatch event `shopify:*` sau thay đổi.
Xem skill `liquid-convention`, `block-settings-schema`, `js-partials`, `responsive-a11y`.

## Test
`data-testid` trên mọi phần tử tương tác và vùng partial, đặt tên `<block>-<element>`. Playwright trong `tests/e2e/<ticket>.spec.ts`.

## Ticket
Trạng thái: Backlog → Ready → In Progress → In Review → Testing → Done. Nhãn agent: ai-draft → ai-review → ai-dat / ai-sua / ai-loai. Trường: `agent`, `side`, `points`, `r_codes`.

## Định nghĩa
DoR: story có AC GWT, Figma node, mã R, point, chia FE/BE. DoD: merge develop, theme check 0, lhci đạt, E2E pass, ảnh 3 breakpoint, docs/merchant cập nhật, PO xem demo.
