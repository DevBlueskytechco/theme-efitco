# Convention team — theme-efitco

Bổ sung cho AGENTS.md (AGENTS.md thắng khi mâu thuẫn).

## Nhánh và commit
`main` (store thật / Canvas), `develop` (efitco-ai-dev tổng hợp), `feature/<ticket>-<slug>` (người), `feature/ai-<ticket>` (agent), `hotfix/<ticket>`. Conventional Commits: `feat(blocks)`, `fix(css)`, `chore(ci)`, `docs(merchant)`; mã ticket trong body. PR ≤ 400 dòng; 1 approve cùng phía + Tech Lead.

## FE / BE
Xem `.claude/rules/fe-be-boundary.md`. JS = BE.

## Liquid / CSS / JS
Xem skill `liquid-convention`, `block-settings-schema`, `js-partials`, `responsive-a11y`.

## Test
`data-testid` trên mọi phần tử tương tác và vùng partial, đặt tên `<block>-<element>`. Playwright trong `tests/e2e/<ticket>.spec.ts`.

## Ticket
Trạng thái: Backlog → Ready → In Progress → In Review → Testing → Done. Nhãn agent: ai-draft → ai-review → ai-dat / ai-sua / ai-loai. Trường: `agent`, `side`, `points`, `r_codes`.

## Định nghĩa
DoR: story có AC GWT, Figma node, mã R, point, chia FE/BE. DoD: merge develop, theme check 0, lhci đạt, E2E pass, ảnh 3 breakpoint, docs/merchant cập nhật, PO xem demo.
