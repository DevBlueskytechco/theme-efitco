KHÔNG CHẮC: JS và spec chưa chạy trên trình duyệt. Phiên agent không có trình duyệt, chỉ chạy logic với DOM giả trong Node, DOM giả không kiểm được ARIA reflection, custom element upgrade, layout. E2E, axe, console, lhci chưa chạy vì CTO 06/11 tắt e2e, lighthouse trên CI tới khi trang chủ xong (vars.RUN_STORE_TESTS=false). PR này chỉ qua theme-check và preview, chưa được coi là đã kiểm. ES1-T178 còn Open: thiếu figma-tab-* thì phần lớn spec tự skip kể cả khi bật CI.

# ES1-T189 TE-3-BE3: collection-tabs

## Thay đổi
- `assets/collection-tabs.js` (mới, 1528/1536 B): custom element `collection-tabs`, nạp qua `data-lazy-module`. 0 fetch, không innerHTML.
  - Nâng cấp: `role` tablist, tab, tabpanel; `aria-selected`, `aria-controls`, `aria-labelledby`; roving tabindex; gỡ `aria-current`. Giữ `href`.
  - Đổi tab: thay template của panel bằng bản clone ở lần chọn đầu, template bị gỡ nên không clone lần 2; ẩn panel khác bằng `hidden`.
  - Bấm thường chặn điều hướng. Ctrl, Cmd, Shift, Alt + click để link chạy.
  - Bàn phím: mũi tên trái, phải (vòng 2 đầu), Home, End đổi tab, focus đi theo. Enter đi qua click của link. Có phím bổ trợ thì không xử lý, Alt+Left vẫn là back.
  - Tab rỗng: panel chỉ có `data-tab-empty`, card tab trước nằm ở panel đã ẩn.
- `blocks/featured-collection.liquid`: `data-lazy-module` trên `collection-tabs`, thẻ script `lazy-module.js` trong đó, sửa `{% doc %}`. Không đổi tên hook. Hook bám theo comment dev-fe trên ticket: `data-tab-list`, `data-tab-panel`.
- `tests/e2e/ES1-T189.spec.ts` (mới).
- `tests/e2e/ES1-T188.spec.ts`: test "4 tab đúng nhãn" chặn file module, vì nó khẳng định `aria-current` là trạng thái trước nâng cấp.

## Lệch ticket và quy ước (do trần 1536 B)
Bản đầu, thụt 2 space, đủ comment, có guard, có RTL: 2455 B. Cắt theo thứ tự ảnh hưởng thấp trước:
1. Mũi tên không đảo khi RTL: Phải luôn là tab sau. Theme chưa có locale RTL, nhưng CONVENTION.md chuẩn bị cho RTL; bật RTL thì phải sửa file này. Ticket không ghi RTL.
2. Thụt lề bằng tab, tên biến 1 chữ, chỉ còn 2 comment: khó đọc hơn quy ước "không minify, đọc được". Không có guard thiếu hook: Liquid đổi hook thì `pageerror`, test tĩnh trong spec bắt việc này.
3. Bỏ guard `customElements.get`: module chạy 1 lần theo URL, không có đường define 2 lần ở storefront (suy luận).
4. Gắn lại element vào DOM thì về tab 1, không giữ tab đang chọn. Không clone lại, không nhân đôi listener. Storefront không có luồng nào di chuyển element này.
5. Dùng thuộc tính ARIA reflection (`role`, `ariaSelected`, `ariaCurrent`) thay `setAttribute`. Hợp NFR-5 theo hiểu biết của tôi về trình duyệt (Firefox từ 119 cho `role`), và `cart-drawer.js`, `cart-items.js` đã dùng `ariaBusy`. Chưa đo trên trình duyệt thật.

## Quyết định ngoài chữ ticket
- Space trên tab: chặn cuộn trang và chọn tab đó, theo mẫu tablist. Ticket chỉ ghi mũi tên, Home, End.
- `aria-labelledby` và `id` trên tab để panel có tên. `tabindex=0` trên panel rỗng: panel không có gì focus được thì thông báo vẫn tới được bằng bàn phím.
- Không có live region, `aria-busy`: đổi tab đồng bộ, không có request, focus nằm trên tab nên trình đọc đọc tab được chọn.
- Thẻ script và `data-lazy-module` có render trong theme editor, giống `collection-list` (ES1-T185). Editor render lại block trước khi module nạp thì tab là link tới khi tải lại khung, không lỗi.

## Hành vi cần biết, chưa xử lý
- Bấm tab trước khi module nạp xong: đi theo link tới collection. Đúng progressive enhancement, nhưng khách mạng chậm sẽ thấy.
- 360: bấm tab đang bị che một phần ở hàng cuộn ngang không tự cuộn tab vào giữa. Bàn phím thì `focus()` cuộn giúp. Không đủ byte, chưa có AC.
- View all luôn trỏ collection tab đầu (dev-fe đã nêu trên ticket, chưa có AC).

## Ngân sách JS (plan ES1-T169 D6, `wc -c`)
| Nhóm | File | B | Trần |
| --- | --- | --- | --- |
| Tải sẵn theo D6 | nền 26 365, lazy-module 384, search-loader 256 | 27 005 | 40 960, còn 13 955 |
| Sau cuộn theo D6 | gồm collection-tabs, tính theo trần 1 536, số thật 1 528 | 31 049 | |
| Mở search | predictive-search | 6 656 | |
| Tổng | Không đổi so với D6 | 64 710 | 65 536, còn 826 |

- Số thật thấp hơn D6 8 B ở file này. Số D6 là số kế hoạch, có file chưa có.
- Bước đo thật của ES1-T177 chưa làm (T176, T177 làm cuối theo CTO 06/11).

## Tự kiểm tra
- `wc -c assets/collection-tabs.js`: 1528 ≤ 1536.
- `shopify theme check`: 92 file, 0 lỗi. `node --check` JS, `node --experimental-strip-types --check` ES1-T189, ES1-T188: ok.
- Chạy logic với DOM giả trong Node: thuộc tính nâng cấp, clone 1 lần, tab rỗng, click có và không có phím bổ trợ, mũi tên, vòng 2 đầu, Home, End, Space, Enter, Alt+mũi tên, gắn lại: pass. Không thay được E2E.
- Không đổi locale. Không có partial nên không có contract tên partial; contract hook có test tĩnh trong spec, chưa chạy.
- `npx playwright test tests/e2e/ES1-T189.spec.ts tests/e2e/ES1-T188.spec.ts tests/e2e/TE-3.spec.ts` desktop + Pixel 7, axe 3 trạng thái, console, CLS khi nâng cấp, swatch sau clone, chặn file JS, `npx lhci autorun`, bước đo JS ES1-T177: chờ CI, đang tắt theo CTO 06/11, chưa kiểm.
- Spec chưa type-check (không có `tsc`). Test tab rỗng thay nội dung template bằng markup thông báo vì dữ liệu không bảo đảm có collection rỗng; markup thật do ES1-T188 kiểm tĩnh. Test swatch skip nếu tab 2 đến 4 không có card nhiều màu.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
