KHÔNG CHẮC: vùng bấm thật bên trong <shopify-account> (shadow DOM, part signed-out-avatar 24 × 24 giữ nguyên) — host đã 44 × 44, click vào lề host có mở menu hay không chưa rõ; hỏi ở ES1-T615.

# ES1-T544 — vùng chạm 44 × 44 mọi mốc cho 6 nhóm control

Theo ES1-T567 (P1 accessibility). Token `--touch-target: 44px` đã có trong snippets/css-variables.liquid (ES1-T540). Chỉ CSS, không Liquid, không JS.

## Thay đổi

assets/critical.css
- `.site-header__icon` min-width/min-height 2.75rem → var(--touch-target).
- `.site-header__link` min-height 2.75rem → var(--touch-target).
- `.site-header__logo` line-height 2.75rem → var(--touch-target) (cùng 44, để AC3 grep 2.75rem = 0).

assets/base.css
- Toast `--close-button-size` calc(var(--space-1) * 11) → var(--touch-target). `.close-button` 48 giữ.
- `.site-header__drawer --drawer-tap` → var(--touch-target).
- Mega ≥ 80rem: `.site-header__mega-title`, `__mega-link`, `__mega-view-all`, `__mega-tile` min-block-size 40 → var(--touch-target). Title là link (snippets/header-mega-group.liquid) nên vào cùng nhóm.
- `.product-variant-picker --option-size` 44px → var(--touch-target) (pill, swatch, ô lưới).
- Header @80rem:
  - Bỏ reset `.site-header__icon:not(form *)` min 0, `shopify-account` 24 × 24, margin-inline-end 24 / 0 → search, account, cart thành ô 44, svg giữ 24 (search 20).
  - `.site-header__icons` gap var(--space-1) + margin-inline-end calc((var(--space-5) − var(--touch-target)) / 2) = −10: nhịp icon 10 + 4 + 10 = 24 như cũ, mép icon giỏ giữ x.
  - Search link margin-inline-end −2px: kính lúp 20 trong ô 44 có lề 12 (icon khác 10), kéo 2 để mép icon không lệch.
  - Badge giỏ `.site-header__icons .site-header__cart-count` 2 / 1 (= −8 / −9 + lề 10) để giữ chỗ cũ so với icon.
  - Link dropdown C min-height 40px → var(--touch-target).
  - Mục cấp 1 ngang ≥ 44: `a` top-level dùng ::after `inset-inline: min(0px, (100% − 44) / 2)` (đối xứng, đúng RTL, không cần translate riêng :dir(rtl)); summary KHÔNG position (scrim mega neo container header) → padding-inline var(--space-2) + margin-inline âm cùng giá trị. Gap menu 40 giữ; ô mở rộng tối đa 8 mỗi bên nên không chồng ô kề.

## Số đo (AC3, ước tính từ CSS, chờ CI chụp ảnh)
Toạ độ icon từ mép cuối R ở 1280: trước cart [R−24, R], account [R−72, R−48], search [R−116, R−96]; sau giống hệt (ô cart [R−34, R+10], account [R−82, R−38], search [R−128, R−84]). Chiều dọc: ô 24 → 44 căn giữa trong thanh 80, tâm không đổi. Chữ menu cấp 1: padding bù margin âm, toạ độ không đổi.

## Ảnh hưởng test
- tests/e2e/ES1-T482.spec.ts TC-01 dòng 15 assert `min-height: 40px;` sẽ đỏ (đổi sang var(--touch-target) theo ticket). Ticket QA ES1-T614: cập nhật assert + viết tests/e2e/ES1-T544.spec.ts theo AC1–AC4. Dòng 17–18 (padding-block mục cấp 1) giữ nguyên byte.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi (8 cảnh báo có sẵn, không ở file trong diff).
- `grep -c 2.75rem assets/critical.css` = 0.
- critical.css 9 979 B (+48 B, ≤ 200; ≤ 10 240).
- base.css gzip: chưa đo được trong sandbox (lệnh gzip bị chặn); diff raw +~600 B trên nền develop 37 029 B gzip → còn xa trần 49 152. Chờ CI xác nhận.
- Không file JS trong diff; không literal màu mới; chỉ logical properties.
- AC1, AC2 (getBoundingClientRect 360/768/1280/1920), AC3 ảnh header so ES1-T293/index.html, AC4 mega chuột + bàn phím + scrim, Lighthouse: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
