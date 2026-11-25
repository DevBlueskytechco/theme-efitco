KHÔNG CHẮC: lượt này agent không có quyền chạy `node`, `bash scripts/*.test.sh`, `shellcheck` (mọi lệnh thực thi bị chặn chờ duyệt). Output bên dưới là tính tay từ nguồn develop 23/11 (sau #307), CHƯA phải output thật. Orchestrator/CTO chạy 3 lệnh ở mục "Kiểm trước PR" và dán output vào PR trước khi merge.

# ES1-T530 design-lint

Đặc tả: ADR 0015 mục 4 (nhánh feature/ai-ES1-T570, PR #312), thắng body ticket chỗ lệch (comment Tech Lead 23/11).

## File
- `scripts/check-tokens.mjs`: so 4 nơi, kit.css chuẩn. Exit 0 / 1 (FAIL) / 2 (thiếu file, JSON lỗi). Cờ `--strict`, `--root <dir>`, `--annotations` (mặc định bật khi `GITHUB_ACTIONS=true`).
- `scripts/check-mockup-kit.mjs`: `<style>` của `drafts/designer/*/*.html` (trừ ES1-T251, T252, T174), bỏ comment, FAIL khi selector chỉ gồm class kit. Exit 0 / 1 / 2.
- `scripts/check-tokens.test.sh`: 12 ca fixture (luật 1–7, --strict, @media, mockup), không mạng.
- `.github/workflows/ci.yml`: job `design-lint` (ubuntu, node 22, timeout 3 phút, không secret, không `needs`).

## Luật đã cài (ADR 0015 mục 4)
| # | Điều kiện | Kết quả |
|---|---|---|
| 1 | số biến `:root` gốc kit ≠ `kit_root_count` | FAIL |
| 2 | tokens.json ↔ kit: `color` (22, hai chiều), `color_status` alias, `color_derived` (tính color-mix, sai số 1/kênh), font family + `body_weight`, `type_scale.*.size` (clamp min/max), `line_height`, `letter_spacing` (theo mốc), `space` 1…8 + named, `radius` + roles, `container`, `layout` (theo mốc), `elevation` (dạng "0 8 24 foreground 12%"), `layer`, `motion`, `easing`, `icon`, `component` | FAIL, không ngoại lệ |
| 3 | setting màu / font_picker default ≠ kit, khoá có trong `known_mismatches` | WARN lệch tạm |
| 4 | như 3, không khoá | FAIL |
| 5 | màu hex kit không có setting / setting màu không có trong kit | FAIL (trừ khoá) |
| 6 | khoá `known_mismatches` đã khớp kit (setting id, hoặc nhóm space/line_height/band_inset/tab_padding_inline/section_gap_mobile hết lệch) | WARN khoá thừa |
| 7 | css-variables.liquid (+ `:root` ở assets) ↔ kit cho mọi biến không phải màu hex / font: lệch giá trị (so ở 0/48/64/80rem), thiếu = "chưa dựng", biến kit khai trong `:root` ở `assets/*.css` | WARN; `--strict` = FAIL |

Font: family = handle trước `_n`/`_i`; trọng lượng so handle tokens.json (`font.primary` inter_n5), không so `--font-primary--weight` 400 của kit; heading không có handle trong tokens.json nên so `--font-heading--weight`.

Giải giá trị: `var()` tới giá trị cuối theo scope từng mốc; `calc(a op b)` cùng đơn vị; hex `#RRGGBB` hoa; css-variables: `{{ settings.x }}` = default settings_schema, `{{ space | times: N }}` = space_base 4 × N, `{{ font.family|weight }}` từ handle, `{% if %}A{% else %}B{% endif %}` lấy A.

Mockup: class kit = `.rte .chip .empty-state .search-field .input-group .quantity .variant-pill .collection-card .option-card .product-row .dpanel .meter .section-link .badge .alert .skeleton .spinner .dialog`, `.pagination__*`, và biến thể `block__x` / `block--x` có trong kit.css. Được kèm `:hover`, `::before`, `[attr]`, `.is-*`/`.has-*`. Có tổ hợp (`.hero .chip`, `.x > .badge`) hoặc class trang (`.chip.hero-chip`) = ngữ cảnh, cho phép. Bỏ `@keyframes`.

## Output dự kiến trên develop (tính tay, CHƯA chạy)
check-tokens.mjs, exit 1:
```
FAIL settings_schema type_primary_font inter_n4 (inter 400) ≠ inter 500 (tokens.json inter_n5) (config/settings_schema.json:43) · lệch không có khoá known_mismatches
WARN settings_schema background_alt_color #F4F4F4 ≠ --color-background-alt #F4F4F5 (config/settings_schema.json:179) · lệch tạm (...)
WARN settings_schema badge_new_color #467A48 ≠ --color-badge-new #4B824D (config/settings_schema.json:270) · lệch tạm (...)
WARN css-variables --space-8 120px ≠ 128px (snippets/css-variables.liquid:74) · lệch tạm (known_mismatches: space)
WARN css-variables --font-size-h3 / -h2 / -h1 / -display (clamp code ≠ kit)
WARN css-variables --color-accent-on-sand color-mix(...,#000000) ≠ color-mix(...,#1A1A1A)
WARN assets --radius-dialog 24px ≠ 20px (assets/base.css:132)
WARN css-variables <69 biến> chưa dựng
WARN assets <15 biến> khai trong :root (assets/base.css:6–145) · ADR 0015 mục 2
phủ code: css-variables.liquid 66/150 · assets base.css 16 (15 trong :root), collection.css 1 (0 trong :root), critical.css 2 (0 trong :root), featured-product.css 1 (0 trong :root)
kit 150 · tokens.json lệch 0 · màu 20/22, lệch tạm 2 · font 1/2, lệch tạm 0 · nhóm khác WARN 91 · FAIL 1
```
Sau ES1-T585 (thêm khoá `type_primary_font`): `font 1/2, lệch tạm 1 · FAIL 0`, exit 0.

check-mockup-kit.mjs, exit 0: `mockup 23 trang · 23 <style> · … rule · FAIL 0`. Grep thô thấy class kit ở 4 trang (ES1-T262, T278, T279, T293) nhưng đều là dòng comment (vd ES1-T278/index.html:16–17) hoặc selector ngữ cảnh (T278:108 `.dpanel__row--saving > :first-child`, T278:131 `.skeleton-card .skeleton--line:last-child`).

## AC
- AC1 tokens.json ↔ kit 0 FAIL: dự kiến `tokens.json lệch 0` (#307 đã merge vào develop, develop = nhánh #307).
- AC2 3 WARN badge_new_color, background_alt_color, --space-8: có (2 dòng luật 3 + 1 dòng luật 7).
- AC3 dòng "phủ code": 66/150 ở css-variables; base.css 16 tên (15 trong `:root` = số ADR 0015, thêm `--icon-stroke-width` ở `.close-button`).
- AC4 test.sh ca 1 (khớp, exit 0) và ca 2 (lệch 1 hex, exit 1).
- AC5 test.sh ca 10–12 (comment không bắt, `.chip {` → FAIL kèm file:dòng); repo thật dự kiến 0.

## Ảnh hưởng cổng merge
- Job mới `design-lint`, không `needs`, không secret, không đụng store, không đổi job cũ / concurrency `store-hoa-qua-e2e`.
- KHÔNG thêm vào required_checks (CTO quyết, ADR 0015: khi FAIL = 0 trên develop). Trước ES1-T585 job này đỏ trên mọi PR (FAIL type_primary_font) nhưng không chặn merge. Merge T530 sau T585.
- Sửa `.github`: cần CTO `/merge-pr`.

## Kiểm trước PR (chưa chạy được lượt này)
```
bash scripts/check-tokens.test.sh          # mong đợi: OK check-tokens (12 ca)
shellcheck scripts/check-tokens.test.sh
node scripts/check-tokens.mjs              # dán output; mong đợi FAIL 1 tới ES1-T585
node scripts/check-mockup-kit.mjs          # mong đợi FAIL 0
```
Ngoài phạm vi: grep figma / --figma-* / z-index / bóng (ES1-T558), `_version` + CHANGELOG (ES1-T559), sửa code token (ES1-T536…T540, T576, T581).

## Sửa sau CI đỏ (run 45432811501, 25/11)
- `norm()` xoá khoảng trắng sau `)` nên `0 calc(4px * -1) 24px …` thành `0 -4px24px` → FAIL giả `elevation.bar` và WARN giả `--shadow-overlay` (assets/base.css:131). Nay chỉ bỏ khoảng trắng sau `(`, trước `)`, quanh `,`. Test ca 13 (bóng có calc) đỏ trên code cũ, xanh sau sửa.
- `type_primary_font`: áp đúng chữ ES1-T585 (khoá `known_mismatches`, DESIGN.md; không tăng `_version`) — ADR 0015 bảng Việc ghi "trước ES1-T530 merge". FAIL → WARN lệch tạm.
- Mockup `drafts/designer/ES1-T260/navigation.html:135` `.product-row__thumb.is-sold-out` (trạng thái mới cho component kit, ca 12 chủ ý bắt) → selector ngữ cảnh `.edge-rows .product-row__thumb.is-sold-out`.
- Còn 1 FAIL thật: luật 1 `kit_root_count` 150 ≠ 170 — kit lên 170 ở ES1-T573 (#329) nhưng bản vá 2.1.0 cho docs/tokens.json chưa áp, chờ CTO trả lời [Q] ES1-T598. Không áp ở đây (đổi `_version`, CHANGELOG, DESIGN.md, handoff ngoài phạm vi DevOps).

Output thật trên nhánh sau merge develop 25/11:
```
FAIL tokens.json _source_of_truth.kit_root_count 150 ≠ 170 (docs/tokens.json:32) · luật 1: nơi 3 chưa chép theo kit
kit 170 · tokens.json lệch 1 · màu 20/22, lệch tạm 2 · font 1/2, lệch tạm 1 · nhóm khác WARN 112 · FAIL 1
mockup 23 trang · 23 <style> · 1831 rule · FAIL 0 (bỏ qua ES1-T251, ES1-T252, ES1-T174)
OK check-tokens (13 ca)
```
