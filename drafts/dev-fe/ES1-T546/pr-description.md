KHÔNG CHẮC: chưa đo được gzip base.css và chưa chạy Playwright cục bộ (sandbox chặn pipe gzip và Chromium); chờ CI. File tạm drafts/dev-fe/ES1-T546/pw.local.config.ts (config Playwright bỏ globalSetup để chạy fixture cục bộ) không xoá được trong lượt này — Orchestrator bỏ khỏi commit.

# ES1-T546 FE (theo ES1-T567): .alert 4 tone qua --alert-color, .alert--page, .alert__close 44

Nguồn: docs/ui-spec/foundation.md §35, drafts/designer/_kit/kit.css (.alert*), drafts/designer/ES1-T251/foundation.html #h-alert.

## Thay đổi
- assets/base.css `.alert`:
  - grid 2 cột → flex (như kit) để nhận thêm `.alert__close` ở cuối hàng; `.alert__icon` flex none, `.alert__body` flex 1 + min-inline-size 0.
  - padding 24 bốn phía → `var(--space-4) var(--space-5)` (16 / 24); gap 16 → `var(--space-3)` (12).
  - viền `1px solid var(--alert-color, var(--color-critical))`; icon màu `--alert-color`, cỡ `--icon-size-lg` (24). Bo `--radius-card` giữ.
  - 4 tone: `.alert--info` → `--color-muted`, `--success` → `--color-success`, `--warning` → `--color-warning`, `--error` → `--color-critical`; không ghi tone = error.
  - `.alert--page`: `border-inline-start-width: 4px`, nền `color-mix(in srgb, --alert-color 6%, --color-background)`.
  - `.alert__close`: 44 × 44 (`--touch-target`), tròn, icon 16 (`--icon-size-sm`), muted → hover foreground (transition `--motion-fast`), margin âm block -8 / inline-end -12 như kit để không đẩy cao alert. Focus dùng `:focus-visible` chung ở critical.css.
  - `.alert__text` line-height `--line-height-sm`; `.alert__actions` gap 12 / 16, margin-block-start 4 (theo kit).
- assets/aux.css: xoá `.alert--success` riêng (viền border + thanh 4 badge-new). Contact success giờ dùng tone chung: viền 1px `--color-success`, icon `--color-success`.
- snippets/empty-state.liquid: kind error ghi rõ `alert alert--error`, role=alert giữ, không nút đóng; doc cập nhật.
- blocks/contact-form.liquid: chỉ doc (lỗi chung role=alert không tone = error; success `.alert--success` role=status). Class markup giữ nguyên vì spec tĩnh ES1-T383/ES1-T386 khớp chuỗi class.
- tests/e2e/ES1-T313.spec.ts: thêm `--color-critical:var(--color-sale)` vào TOKENS fixture (alias có thật ở css-variables.liquid từ ES1-T540); không có thì TC-09 (viền alert sale) đỏ.
- tests/e2e/ES1-T546.spec.ts (mới): tĩnh AC1 + role; fixture base.css thật: AC2 padding/gap/viền/icon 24, AC3 4 tone + `.alert--page` 4px + nền pha, `.alert__close` 44/icon 16/không đẩy cao, 360 không tràn ngang.

## Hook cho BE
- Nút đóng (info / success / warning, chưa trang nào dùng trong PR này): `<button type="button" class="alert__close">` chứa `<span class="visually-hidden">{{ 'general.dismiss' | t }} {tiêu đề}</span>` + icon `aria-hidden`. Error không có nút đóng. Script gỡ alert (nếu cần) là việc BE khi có màn dùng.

## Ngoài phạm vi
Chuỗi cart lỗi (ES1-T578), khối tóm tắt lỗi form (ES1-T545), toast (ES1-T541, ES1-T556), khai báo token (ES1-T540, đã merge). Warning = accent còn chờ CTO (notes 10.3): CSS chỉ đọc `--color-warning`.

## Tự kiểm tra
- shopify theme check: 0 lỗi (8 warning có sẵn ở quiz-step, index, index.figma — không thuộc diff).
- AC1: 0 `color-sale` trong rule .alert*; 0 `.alert--success` trong aux.css. 0 màu literal, 0 thuộc tính vật lý mới.
- Không file JS trong diff.
- gzip base.css: chưa đo được (sandbox); diff +~70 dòng CSS, ước ~37.4 KB so với trần 49 152 — chờ CI.
- Playwright ES1-T546 / ES1-T313 / ES1-T383 / ES1-T474: chờ CI (Chromium bị sandbox chặn cục bộ). AC4 ảnh 360/1280 cart lỗi, collection lỗi so mockup, Lighthouse: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
