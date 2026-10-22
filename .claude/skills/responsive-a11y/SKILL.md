---
name: responsive-a11y
description: Breakpoint, touch target, keyboard, contrast, focus cho theme. Dùng cho mọi task FE và khi QA viết case accessibility.
---
Breakpoint: 360 (mobile), 768 (tablet), 1280 (desktop); mobile-first, `@media (min-width: 48rem)`, `(min-width: 80rem)`.
Bắt buộc (Theme Store R12, ngưỡng nội bộ a11y ≥ 98):
- Keyboard: mọi tương tác kể cả dropdown/drawer/accordion; thứ tự focus = DOM; focus thấy được (`:focus-visible` outline 2px).
- Touch target ≥ 24×24 CSS px; nút chính ≥ 44px.
- Contrast 4.5:1 chữ thường, 3:1 chữ ≥ 18pt và icon/border.
- `alt` mọi ảnh; input có `label for`; `aria-expanded`/`aria-controls` cho disclosure; live region cho kết quả động; h1–h6 khác nhau rõ, mỗi trang 1 h1.
- Không `outline: none` không thay thế; không `tabindex > 0`.
Kiểm: `npx lhci autorun` accessibility ≥ 98; QA chạy case keyboard + VoiceOver/NVDA cho story có tương tác.
