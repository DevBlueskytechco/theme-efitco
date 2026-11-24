KHÔNG CHẮC: (1) đủ hành vi localization.md §5–§6 không vừa 4 096 B nên tách 2 file: localization-picker.js 3 748 B + localization-list.js 4 964 B (cùng nạp theo tương tác, ngoài trần tải sẵn/sau cuộn theo ADR 0010), hỏi Tech Lead ES1-T584 có ghi thêm dòng vào ADR 0010 không; (2) L10 lỗi chỉ hiện khi offline (gửi form thường, không fetch tự viết); (3) "phần khớp in đậm" §5 chưa làm; (4) "Switching to …" chỉ được đọc khi có vùng status (> 10 nước). Mặc định ở ES1-T584.

# ES1-T324 · TE-1-R2-BE2: localization-picker.js (nạp lười khi tương tác); AC TE-1 AC10

AC: SRS TE-1 AC10. Spec: docs/ui-spec/localization.md §4–§7. Hợp đồng: snippets/localization-lists.liquid + blocks/footer.liquid, blocks/header.liquid `{% doc %}` (ES1-T322, TE-1-R2-FE5); task-split ES1-T307 hàng TE-1-R2-FE5 / BE2.

## Thay đổi
assets/localization-picker.js (mới, 3 748 B): `<localization-picker>`
- Footer ≥ 48rem: giữ `<details>` popover; đồng bộ `aria-expanded` trên summary + gắn `data-layer="localization"` (page-layers đếm popover, layers.md §4 #11); focusout ra ngoài thì đóng (Esc, bấm ngoài: motion.js có sẵn). Mở: xoá ô tìm, cuộn tới mục hiện tại, focus ô tìm, không có thì mục hiện tại.
- Footer < 48rem: chặn click summary → `details.open = true` → `data-tabs` → `<modal-dialog data-layer="localization">.open(summary)` (sheet, focus tiêu đề, Esc/scrim/vuốt/× do modal-dialog). `modal:close` → chờ animation đóng xong mới gập details, gỡ `data-tabs`/`role="tabpanel"`. Đổi qua mốc 48rem thì đóng. Đã mở trước khi module tải (chạm lần đầu) thì chuyển ngay thành sheet.
- Tab (chỉ sheet và cấp 2 drawer, khi có 2 danh sách): `data-tabs` trên host, `role="tabpanel"` + `aria-labelledby` trên nhóm, `hidden` nhóm không chọn, `aria-selected`/`tabindex` roving.
- Cấp 2 drawer (host không có `<modal-dialog>`): `data-tabs` bật lúc nâng cấp; mở/Back/focus do header-drawer.js (ES1-T323).
- Mục `aria-current`: không gửi, đóng bảng, focus về nút gộp/hàng gộp. Mục `aria-disabled` (đang đổi): không gửi.
- `import(data-list-src)` khi nâng cấp; lỗi tải bỏ qua êm (vẫn mở/đóng, vẫn gửi form).

assets/localization-list.js (mới, 4 964 B): danh sách
- Ô tìm (> 10 nước): bỏ `hidden` wrapper; lọc theo tên + mã/ký hiệu tiền tệ, bỏ dấu và hoa thường ("cote" → Côte d’Ivoire), khớp đầu tên lên trước, `hidden` trên `<li>`; × hiện khi có chữ; không kết quả: `[data-localization-empty]` + câu `data-label-no-results`; status `role="status"` sau 300 ms ngừng gõ (`data-label-status`, `-status-one`).
- Bàn phím: tab ← → Home End; ô tìm Enter không gửi mục đầu (1 kết quả thì chọn), Esc có chữ xoá chữ không đóng bảng, ↓ vào mục đầu; mục ↑ ↓ Home End, ↑ ở mục đầu về ô tìm, gõ chữ về ô tìm (ký tự vào ô); danh sách không ô tìm: type-ahead.
- Đang đổi (L9): gửi form thường (Shopify chuyển trang), form `aria-busy`, mục chọn `aria-busy` sau 300 ms (spinner CSS), mục khác `aria-disabled`, status "Switching to {name}". Quay lại bằng bfcache (`pageshow`) gỡ trạng thái.
- Lỗi (L10): `navigator.onLine` false → chặn gửi, `[data-localization-error]` (role=alert) "We couldn't switch to {name}…", hàng bấm lại được; Try Again `requestSubmit` mục vừa chọn.

blocks/footer.liquid, blocks/header.liquid (chỉ hook nạp, như ES1-T474/T473)
- Host `<localization-picker>`: `data-lazy-module="{{ 'localization-picker.js' | asset_url }}"`, `data-lazy-on="interaction"`, `data-list-src="{{ 'localization-list.js' | asset_url }}"` (URL có `?v=`, ES1-T485).
- 1 thẻ `<script src="{{ 'lazy-module.js' | asset_url }}" type="module">` trong nhánh `show_countries or show_languages` (L1 1 nước + 1 ngôn ngữ: không tải gì). Không thẻ script localization-*.
- `{% doc %}` thêm 1 dòng về cách nạp.

tests/e2e/ES1-T324.spec.ts (mới)
- Tĩnh: trần byte, không console/fetch/partials/innerHTML/style/createElement/showModal, guard define, import từ dataset; hợp đồng host footer + header, hook snippet.
- Fixture (origin giả, asset thật): nạp lười; popover ≥ 48rem (focus ô tìm, focusout đóng, axe); sheet < 48rem (tab, ← End Home, × trả focus, gỡ tabpanel, axe); Esc sheet; mở trước nâng cấp; lọc (land, cote, ca, nzd, zzz, Clear search, Esc); bàn phím + type-ahead + Enter 1 kết quả; mục hiện tại; đang đổi; offline + Try Again; cấp 2 drawer; list module lỗi tải; không JS gửi form.
- Storefront: footer trang chủ, chưa tương tác không tải, URL `?v=`, popover/sheet theo mốc, axe, 0 lỗi console (skip khi store 1 nước + 1 ngôn ngữ).

## Quyết định
- Không fetch: L10 ghi "chỉ khi BE gửi bằng fetch"; fetch POST /localization bị CORS khi market khác domain (redirect chéo), phải gửi lại = 2 POST. Gửi form thường giữ đúng redirect Shopify; offline thì chặn và báo lỗi tại chỗ.
- Không tự tạo DOM, không style inline; chỉ bật `hidden`, ARIA, `data-tabs`, `data-layer` theo hook FE.

## Ngân sách JS (wc -c)
- localization-picker.js 3 748 (trần 4 096), localization-list.js 4 964 (≤ 8 192), lazy-module.js 765.
- Tải sẵn: +765 B (lazy-module.js) trên trang chưa có lazy-module và chỉ khi Markets > 1 nước/ngôn ngữ; trang chủ đã có lazy-module: +0. Chung hiện tại cộng tĩnh: standard-events 888 + motion 6 129 + page-layers 2 031 + modal-dialog 2 039 + header-menu 3 058 + search-loader 256 + header-sticky 1 680 + cart-drawer 3 910 = 19 991 → 20 756 (vượt phân bổ chung 19 456 vì cart-drawer 3 910 > 3 072 có sẵn; trần trang 40 960 vẫn dưới).
- Theo tương tác (không tính trần ADR 0006): 3 748 + 4 964 = 8 712.

## Ảnh hưởng test khác (QA, ES1-T584 #6)
- TE-1 TC-45 (mobile): sheet 2 tab nên danh sách không chọn ẩn; test mong cả 2 visible.
- ES1-T45 R-05 (< 48rem): có JS là sheet `:modal`, không còn popover neo inline-start.
- ES1-T235 bấm ngoài/Esc, ES1-T323 cấp 2 drawer: giữ hành vi.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi; 9 warning có sẵn (quiz-step, index*.liquid), 0 ở file chạm.
- `wc -c`: picker 3 748 ≤ 4 096; list 4 964 ≤ 8 192. Không console, không innerHTML, không style inline.
- Locale: không thêm khoá (dùng data-label-* FE đã có).
- Cú pháp: node bị chặn trong sandbox, chưa `--check`; Playwright, axe, Lighthouse desktop/mobile, preview: chờ CI.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
