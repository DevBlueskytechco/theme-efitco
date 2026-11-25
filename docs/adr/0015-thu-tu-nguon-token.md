KHÔNG CHẮC: (1) `type_primary_font` (settings `inter_n4`, tokens.json `inter_n5`) lệch nhưng chưa có khoá trong `known_mismatches`; theo quyết định 4 phép kiểm sẽ FAIL trên develop cho tới khi Designer thêm khoá (ES1-T585) hoặc ES1-T529 merge. (2) Sửa AGENTS.md là đề xuất, CTO áp tay: `drafts/techlead/ES1-T570/agents-md.md`. (3) DESIGN.md ngoài phạm vi Tech Lead: dòng trỏ ADR 0015 là đề xuất `drafts/techlead/ES1-T570/design-md.md`, Designer áp cùng ES1-T585.

# 0015. Thứ tự nguồn token: kit.css → mockup → tokens.json / DESIGN.md / foundation.md → settings_schema + css-variables
Ngày: 2026-11-23 | Trạng thái: Đề xuất (hướng CTO chốt 21/11, ES1-T567; ADR ghi lại, ES1-T570) | Thay một phần ADR 0001: thay câu "tokens.json là nguồn" (mục Quyết định) và hướng "bản vẽ → settings"; giữ cơ chế mục B (mỗi token có setting = 1 setting + 1 biến CSS) và quy ước tên ở hai mục Bổ sung.

## Bối cảnh
- ADR 0001 (22/10) chọn hướng: bản vẽ → `docs/tokens.json` → `config/settings_schema.json` → `snippets/css-variables.liquid`. Ngày 21/11 CTO đổi nguồn chuẩn (ES1-T567, PR #307): kit `drafts/designer/_kit/kit.css` và mockup `drafts/designer/**` là gốc; các nơi khác chép theo. Bản vẽ ngoài repo do người dựng lại từ mockup, không còn là căn cứ.
- `docs/tokens.json` `_source_of_truth` đã ghi thứ tự 4 nơi (`order`), quy tắc (`rule`), 7 lệch tạm (`known_mismatches`) và `kit_root_count` 150. CONTRIBUTING.md mục "Order of sources", DESIGN.md dòng 8–19, 64–80 nói cùng ý. Chưa có ADR ghi quyết định này; ADR 0001 vẫn ghi ngược chiều, nên agent và reviewer đọc ADR (nguồn xếp trên CONVENTION và ticket) sẽ theo hướng cũ.
- Số đo trên develop sau #307 (23/11):
  - kit `:root` gốc (trước các khối `@media`): 150 biến (đếm lại bằng regex `^\s*--[a-z0-9-]+\s*:` trên kit.css dòng 29–219). Màu hex: 22; màu dẫn xuất (`var()`, `color-mix()`): còn lại của 32 biến nhóm màu.
  - `config/settings_schema.json`: 41 setting có `id`, 22 `color`, 2 `font_picker`. 22 màu hex của kit ↔ 22 setting `<token>_color` ↔ 22 khoá `docs/tokens.json` `color` (1-1).
  - Phủ code: 66/150 biến ở `css-variables.liquid`, 15 khai ở `assets/base.css`, 69 chưa có (tokens.json `theme_code_coverage`, foundation.md §32.3).
  - Lệch giá trị đã biết: 7 khoá `known_mismatches` + 1 chưa có khoá (`type_primary_font`).
- Ràng buộc:
  - AGENTS.md: CSS chỉ đọc biến; 0 literal màu trong `assets/*.css`; merchant và Sidekick đổi giao diện qua theme settings (ADR 0001 mục B, giữ).
  - Canvas: Sidekick sửa file theme (nơi 4). Kit và mockup không nằm trong theme cài lên store, nên Sidekick không đọc được nơi 1–2; phải có nơi 3 (`DESIGN.md`, tokens.json) đồng bộ để agent ngoài repo hiểu ý thiết kế.
  - Theme mới cài để trống (ADR 0011): default setting là giá trị kit, không phải nội dung store dev.
  - Số bản design system 2.0.0 (`_version`), quy tắc số bản ở `docs/design/CHANGELOG.md`.

## Lựa chọn đã cân nhắc
- A. Viết lại ADR 0001 theo hướng mới.
  - Ưu: 1 file, không thêm ADR.
  - Nhược: mất lịch sử quyết định 22/10 và hai mục Bổ sung 30/10, 02/11 mà các ticket ES1-T11, T41 trỏ tới; trái thói quen ADR (đã chấp nhận thì không sửa nội dung, chỉ ghi Thay thế). Loại.
- B. ADR mới thay một phần ADR 0001 (chọn).
  - Ưu: 0001 giữ làm lịch sử, cơ chế 1 setting + 1 biến vẫn hiệu lực ở đúng chỗ; 0015 chứa thứ tự nguồn, quy tắc PR và đặc tả phép kiểm CI, có số đo để kiểm.
  - Nhược: người đọc phải mở 2 ADR để biết đủ về token; phải giữ dòng Trạng thái 0001 trỏ 0015.
- C. Chỉ thêm dòng "Cập nhật" vào 0001 (như đang có ở 0001:3).
  - Ưu: không tốn công.
  - Nhược: tiêu đề và mục Quyết định 0001 vẫn ghi "tokens.json là nguồn"; không có chỗ ghi đặc tả CI cho ES1-T530 và quy tắc review; dòng 0001:3 tự ghi "Còn mở". Loại.

## Quyết định
B.
1. Thứ tự nguồn (trùng `docs/tokens.json` `_source_of_truth.order`, nơi trên thắng nơi dưới):

   | Nơi | File | Giữ gì | Ai sửa |
   |---|---|---|---|
   | 1 | `drafts/designer/_kit/kit.css` | giá trị token `:root` (150 biến + override `@media` 48/64/80rem), component dùng chung | Designer |
   | 2 | `drafts/designer/**` (trừ `ES1-T252`, `ES1-T174`: bản so cũ) | bố cục, thứ tự khối, trạng thái từng trang ở 360/768/1280/1920; chỉ đọc `var(--*)` của kit, không khai token | Designer |
   | 3 | `docs/tokens.json`, `DESIGN.md`, `docs/ui-spec/foundation.md` | bản máy đọc + giải thích, chép theo kit; `known_mismatches` là danh sách lệch duy nhất máy đọc | Designer (FE xoá khoá khi đóng lệch, mục 4) |
   | 4 | `config/settings_schema.json` (default), `snippets/css-variables.liquid` | code theme phản chiếu kit `:root` | Dev FE |

   - Lệch giữa hai nơi: nơi dưới sai. Không sửa kit cho khớp setting.
   - Quyết định CTO mới (`docs/design/decisions.md`) áp vào kit trước, rồi chép xuống.
   - Mockup lệch `docs/ui-spec/*.md` về bố cục: theo mockup, Designer sửa spec.
2. Cơ chế code giữ ADR 0001 mục B và hai mục Bổ sung:
   - Token merchant cần đổi (màu, 2 font, `space_base`, radius vai trò, page width/margin) = 1 setting + 1 biến; tên `<token>_color` → `--color-<token>`.
   - Token còn lại của kit (thang chữ, line-height, letter-spacing, layer, bóng, icon, kích thước, alias trạng thái) là hằng hoặc dẫn xuất trong `css-variables.liquid`, không thành setting. Đóng 69 token chưa có không làm tăng số setting (41 giữ nguyên; ES1-T529, T576 chỉ đổi default).
   - Mọi biến `:root` khai ở `css-variables.liquid`, không ở `assets/*.css` (ES1-T539, T540 gom 15 biến).
3. PR đổi token:
   - Đổi từ thiết kế (thêm, đổi tên, đổi giá trị, xoá): 1 PR sửa nơi 1 → nơi 3 → nơi 4, kèm 1 dòng `docs/design/CHANGELOG.md` và tăng `_version` theo bậc lớn nhất (major: đổi tên/xoá token, setting id, class; minor: thêm; patch: sửa giá trị). Nơi 2 chỉ sửa khi bố cục/trạng thái đổi.
   - Không làm kịp nơi 4 trong cùng PR: thêm khoá vào `known_mismatches` (giá trị code → giá trị kit, ticket FE đóng lệch). Không có ticket FE thì không được thêm khoá.
   - PR FE đóng lệch (nơi 4 đuổi theo kit): xoá khoá tương ứng khỏi `known_mismatches` và dòng tương ứng ở DESIGN.md mục "How to change the design"; không tăng `_version`, không dòng CHANGELOG (CHANGELOG.md: "Việc code theme chưa theo kịp … không chặn số bản").
   - Token chưa có ở nơi 4 mang trạng thái Đề xuất hoặc Đã chốt (foundation.md §39), chưa phải Đã dựng; component mới chỉ dùng token Đã chốt trở lên.
4. Phép kiểm CI (đặc tả cho ES1-T530, `scripts/check-tokens.mjs`, job `design-lint`; ES1-T530 phủ thêm nhóm khác, phần dưới là phần bắt buộc):
   - Input:
     - `drafts/designer/_kit/kit.css`: khối `:root` đầu tiên (biến gốc) và các khối `:root` trong `@media (min-width: 48rem|64rem|80rem)` (override). Bỏ comment `/* */`. Hex chuẩn hoá `#RRGGBB` chữ hoa (3 chữ số → 6).
     - `docs/tokens.json`: `color.*`, `font.primary`, `font.heading` (handle lấy bằng regex `\b([a-z0-9_]+_[ni][1-9])\b` trong chuỗi; không có handle thì không so trọng lượng ở tầng này), `_source_of_truth.known_mismatches` (khoá), `_source_of_truth.kit_root_count`.
     - `config/settings_schema.json`: `default` của mọi setting `type: color` và `type: font_picker`.
   - Ánh xạ:
     - Màu: setting `<t>_color` ↔ tokens.json `color.<t>` ↔ kit `--color-<t thay _ bằng ->`. Chỉ biến kit có giá trị hex; biến `var()`/`color-mix()` là dẫn xuất, không so với setting.
     - Font: `type_primary_font` ↔ `font.primary` ↔ `--font-primary--family`/`--font-primary--weight`; `type_heading_font` ↔ `font.heading` ↔ `--font-heading--*`. Family = phần handle trước `_n`/`_i`, `_` → khoảng trắng, so không phân biệt hoa thường với family đầu tiên trong kit. Trọng lượng = chữ số sau `n` × 100; so với handle tokens.json nếu có, nếu không với `--font-<role>--weight` của kit (kit `--font-primary--weight` 400 là trọng lượng ô nhập, nên primary luôn so với handle tokens.json).
   - Luật (FAIL làm exit 1, WARN chỉ in annotation):

     | # | Điều kiện | Kết quả |
     |---|---|---|
     | 1 | số biến kit `:root` gốc ≠ `kit_root_count` | FAIL (nơi 3 chưa chép theo kit) |
     | 2 | tokens.json `color.<t>` ≠ kit, hoặc thiếu một bên | FAIL, không ngoại lệ |
     | 3 | setting màu/font default ≠ kit (qua ánh xạ trên), khoá setting id **có** trong `known_mismatches` | WARN `lệch tạm <id>: <code> → <kit>` |
     | 4 | như 3, khoá **không** có trong `known_mismatches` | FAIL |
     | 5 | màu hex kit không có setting, hoặc setting màu không có trong kit | FAIL (trừ khi khoá có trong `known_mismatches`) |
     | 6 | khoá `known_mismatches` là setting id mà giá trị đã khớp kit | WARN `khoá thừa, xoá trong PR đóng lệch` |
     | 7 | nhóm khác (space, line-height, radius, layout, bóng, layer, icon, kích thước), khoá nhóm có trong `known_mismatches` (`space`, `line_height`, `band_inset`, `tab_padding_inline`, `section_gap_mobile`) hoặc không | WARN theo ES1-T530; `--strict` đổi thành FAIL |

   - Output: mỗi dòng `FAIL|WARN <nơi> <khoá> <giá trị nơi dưới> ≠ <giá trị kit> (<file>:<dòng>)`, đồng thời `::error`/`::warning file=…,line=…` cho GitHub; dòng tổng kết cuối `kit 150 · tokens.json lệch <n> · màu <khớp>/22, lệch tạm <n> · font <khớp>/2, lệch tạm <n> · nhóm khác WARN <n> · FAIL <n>`.
   - Kết quả mong đợi trên develop sau #307: kit 150; tokens.json lệch 0; màu 20/22, lệch tạm 2 (`badge_new_color`, `background_alt_color`); font 1/2, `type_primary_font` FAIL tới khi có khoá (ES1-T585) hoặc ES1-T529 merge; FAIL = 0 sau ES1-T585.
   - Ngoại lệ: mockup `ES1-T252`, `ES1-T174` không đọc; setting không phải token (`page_width`, cart, social, favicon, logo) không so ở tầng màu/font; khối `@media` override chỉ so ở nhóm 7; không gọi Shopify, không mạng, ≤ 1 phút.
   - ES1-T559 (kiểm `_version`): diff chỉ chạm `_source_of_truth.known_mismatches`, `_source_of_truth.theme_code_coverage` của tokens.json không tính là đổi token (khớp mục 3: PR FE đóng lệch không tăng bản).

## Hệ quả
- Tốt:
  - Một chiều duy nhất, có thứ tự, cho Designer, FE, reviewer và Sidekick; ADR khớp `_source_of_truth`, CONTRIBUTING.md, DESIGN.md.
  - Lệch giữa thiết kế và code thành danh sách máy đọc, CI báo từng khoá; lệch mới không có khoá bị chặn merge.
  - Không thêm setting: 41 setting / 22 màu / 2 font giữ; Theme Store R15/R16 (font_picker, màu có foreground) vẫn đạt như ADR 0001.
- Xấu:
  - Đổi một token chạm 4 nơi (6 file: kit, tokens.json, DESIGN.md, foundation.md, settings_schema, css-variables) + CHANGELOG trong 1 PR.
  - Trong lúc còn 7 lệch tạm, theme cài mới hiển thị giá trị code cũ (vd `badge_new` #467A48), khác mockup.
  - Danh sách lệch còn chép tay ở DESIGN.md:71–78 và CONTRIBUTING.md:64–66: có thể trôi khỏi tokens.json; CI không kiểm 2 chỗ này.
- Việc:

  | Ai | Việc | Ticket | Khi nào |
  |---|---|---|---|
  | DevOps | `scripts/check-tokens.mjs` theo mục 4, fixture cho luật 1–7 | ES1-T530 | sau #307 merge, trước các PR FE token |
  | DevOps | loại khoá `known_mismatches`, `theme_code_coverage` khỏi điều kiện kích hoạt | ES1-T559 | cùng ES1-T530 |
  | Designer | thêm khoá `type_primary_font` vào `known_mismatches` (không tăng bản theo mục 3); áp `drafts/techlead/ES1-T570/design-md.md` (DESIGN.md:15, 52, 62 trỏ ADR 0015) | ES1-T585 | trước ES1-T530 merge |
  | Dev FE | đóng lệch và xoá khoá: `badge_new_color`, `background_alt_color`, `type_primary_font` | ES1-T529 | Sprint 3 |
  | Dev FE | `space`, `section_gap_mobile` | ES1-T536 | Sprint 3 |
  | Dev FE | `band_inset`, `tab_padding_inline` | ES1-T576 | Sprint 3 |
  | Dev FE | `line_height` (khai ở ES1-T540, áp ở ES1-T577) | ES1-T540, ES1-T577 | Sprint 3 |
  | Dev FE | phủ 69 token chưa có + gom 15 biến ở base.css: radius (ES1-T537), biến tiền tố cũ (ES1-T538), bóng/layer (ES1-T539), 40 token (ES1-T540) | ES1-T537 … T540 | Sprint 3 |
  | Tech Lead | review: REQUEST_CHANGES khi PR đổi default setting màu/font hoặc biến `css-variables` mà kit không có giá trị đó; PR đổi kit thiếu tokens.json/CHANGELOG/`_version`; PR thêm khoá `known_mismatches` không ghi ticket FE; PR FE đóng lệch mà không xoá khoá | — | từ nay |
  | CTO | áp `drafts/techlead/ES1-T570/agents-md.md` vào AGENTS.md (mục Styling and tokens); chấp nhận ADR này; đưa `design-lint` vào required check khi FAIL = 0 trên develop | — | cùng lúc merge ES1-T530 |

- Đo:
  - `node scripts/check-tokens.mjs` trên develop: FAIL = 0 sau ES1-T585; WARN màu/font = số khoá setting id còn trong `known_mismatches`.
  - `known_mismatches`: 7 khoá (+1 ES1-T585) hôm nay → 0 trước R1 Canvas 28/12/2026. Khi 0: bật `--strict` trong CI (Tech Lead ghi vào ADR này dòng Cập nhật, DevOps đổi workflow).
  - `theme_code_coverage`: 66/150 ở css-variables, 15 ở base.css, 69 chưa có → 150/150 ở css-variables, 0 ở `assets/*.css` sau ES1-T536 … T540, T576, T577. Đếm: biến kit có tên trong `css-variables.liquid` (ES1-T530 AC3).
  - Setting: `grep -c '"id":' config/settings_schema.json` giữ 41, `"type": "color"` giữ 22, `font_picker` giữ 2 tới hết R1; thay đổi số này cần ADR mới.
  - Tech Lead kiểm lại số `kit_root_count` và bảng Việc mỗi lần đóng một ticket trong bảng.
