KHÔNG CHẮC: số gzip "hiện tại" lấy từ ES1-T472 (develop ~51,9 KB sau #210, #217, #230; T317 đưa về 50 102 B), phiên này không chạy được lệnh đo. ES1-T478 ghi bảng đo trước/sau trong PR body. Phần sửa AGENTS.md là đề xuất, CTO áp tay (scope-guard chặn agent, ES1-T310 #2): drafts/techlead/ES1-T479/agents-md.md.

# 0013. Tách CSS theo template: base.css (khung + trang chủ) và 4 file nạp theo template.name
Ngày: 2026-11-17 | Trạng thái: Chấp nhận (CTO 17/11, ES1-T472 phương án a); sửa một phần bởi ADR 0014 (21/11, ES1-T564) | Đảo ES1-T310 #1 (1 file base.css), sửa task-split ES1-T307 D7, bổ sung ADR 0003
Cập nhật 21/11/2026 (CTO, ES1-T567): nguồn thiết kế là mockup `drafts/designer/**` + `drafts/designer/_kit/kit.css`; tên file thiết kế và mã node trong ADR này là bối cảnh lúc ra quyết định, không còn là căn cứ; quyết định giữ nguyên.

Sửa đổi 21/11 (ADR 0014, CTO chốt hướng ở ES1-T564): `base.css` chạm lại trần (develop 48 641 B, #292 50 104 B) vì mục 1 để "toàn bộ block trang chủ" ở `base.css`.
- Mục 1: bỏ "toàn bộ block trang chủ" khỏi `base.css`. Block cấp section không ở màn đầu có file `assets/<block>.css`, nạp bằng `stylesheet_tag` trong block (tầng 4, ADR 0014 mục 1–3). 4 file nhóm trang giữ nguyên.
- Mục 2: thay bằng ADR 0014 mục 4. Câu "`quiz` trên trang chủ để base.css" hết hiệu lực.
- Mục 4: `base.css` ≤ 49 152 B tới khi ES1-T566 merge, sau đó ≤ 40 960 B. File block ≤ 8 192 B.
- Mục 3, 5, 6 và Hệ quả, Đo: giữ.

## Bối cảnh
- ES1-T310 #1 (11/11) chốt giữ 1 file `assets/base.css`, trần gzip ≤ 49 152 B, nạp chặn render ở mọi trang từ `layout/theme.liquid:28`. Điều kiện mở ADR này là "lhci desktop < 98 do CSS" hoặc không giữ được trần.
- Không giữ được trần:
  - ES1-T454 (a) cho trần tạm 53 248 B tới khi ES1-T317 (rà CSS chết) merge. T317 merge #235 ngày 14/11, chỉ đưa về 50 102 B gzip. Agent xác nhận gần như đã hết CSS chết.
  - Sau đó #217, #230, #210 đẩy develop lên ~51,9 KB.
  - Còn PDP, cart page, quick view, collection, quiz, popup, mega ảnh. Mỗi phần thêm 1–3 KB gzip, nên sẽ vượt 53 248 trước Sprint 3 (ES1-T472).
- Theme không dùng `{% stylesheet %}` (AGENTS.md), nên Shopify không subset CSS. Mọi rule của PDP, cart và trang phụ hiện tải cả ở trang chủ. Trang chủ giống 100% Figma và đạt perf là mục tiêu số 1 (CTO 06/11).
- Ràng buộc:
  - AGENTS.md: CSS chỉ ở `assets/`, không build step, không `{% stylesheet %}`.
  - `critical.css` ≤ 10 240 B (ADR 0003).
  - CI chặn merge khi perf < 96 desktop hoặc < 90 mobile, a11y < 98 (CLAUDE.md). Nghiệm thu NFR-1 là desktop ≥ 98.
  - Canvas: Sidekick sửa trực tiếp file, nên phải đoán được rule nằm ở file nào.
- Ngoài layout chung còn 2 tài liệu: `templates/gift_card.liquid` (`{% layout none %}`, tự nạp `critical.css` + `base.css` ở dòng 23–24) và `layout/password.liquid` (dòng 12–13).

## Lựa chọn đã cân nhắc
- A. Tách CSS theo template (chọn).
  - Ưu: trang chủ chỉ tải khung + block trang chủ. Mỗi trang chỉ tải CSS của nó. Trần mỗi file nhỏ, đo riêng được. R2 thêm màn không làm phình trang chủ.
  - Nhược: trang không phải trang chủ thêm 1 request CSS chặn render. Phải quyết rule nào chung, rule nào riêng. Đổi quy ước AGENTS.md.
- B. Nâng trần 1 file `base.css` lên 57 344 B gzip, đo lại lhci mobile từng template.
  - Ưu: không đổi cấu trúc, không thêm request.
  - Nhược: trang chủ tiếp tục tải CSS PDP/cart/trang phụ. R2 còn nhiều màn nên trần sẽ lại phải nâng. Không giải quyết gốc.
- C. Giữ cứng 53 248 B, PR vượt phải tự xoá CSS bù.
  - Nhược: CSS chết đã hết (T317), nên không còn gì để xoá bù. Các PR FE R2 bị kẹt, trễ mốc R1 28/12.
- D. Inline CSS từng block bằng `<style>` trong block.
  - Nhược: trái AGENTS.md (CSS chỉ ở `assets/`). Không cache được. Lặp CSS khi block xuất hiện nhiều lần. Loại.

## Quyết định
A.
1. 5 file CSS (cộng `critical.css` giữ nguyên):

   | File | Nạp khi | Nội dung |
   |---|---|---|
   | `assets/base.css` | mọi trang | token dùng chung, khung (header, footer, menu drawer, mega menu, announcement, localization), lớp (`modal-dialog`, sheet, drawer, toast), cart drawer, predictive search, nút, form, `product-card`, breadcrumb, page-title, empty-state, phân trang chung, toàn bộ block trang chủ |
   | `assets/product.css` | `template.name == 'product'` | block chỉ có ở PDP: details, reviews, sticky bar, lightbox, recommendations PDP… |
   | `assets/collection.css` | `collection`, `search`, `list-collections` | collection-banner, collection-products, collection-filters, sort, search-results, list-collections, collection-card |
   | `assets/cart.css` | `cart` | cart-page, cart-upsell (trang `/cart`) |
   | `assets/aux.css` | `404`, `password`, `gift_card`, `page` (gồm `page.contact`), `blog`, `article` | not-found, password-hero, gift card, page, contact form, blog-articles, article, article-comments |

2. Quy tắc xếp rule:
   - Rule chỉ được vào file template khi mọi markup sinh ra class đó chỉ render từ các template của file đó.
   - Markup có ở ≥ 2 nhóm, hoặc có ở trang chủ, thì để ở `base.css`. Áp cho: `product-card`, cart drawer, `cart-lines`, `cart-summary` dùng cho drawer, `quiz` trên trang chủ.
   - `product-media` / `product-media-item`, bộ chọn biến thể, `product-form` và `sale-countdown` cũng để ở `base.css`, vì `featured-product` trên trang chủ dùng chúng (ADR 0012, ADR 0009).
   - Quick view (`product.quick-view`, ADR 0008) mở trên trang chủ, collection và search qua `partials.fetch`. HTML trả về không kèm `<link>` của `product.css`, nên CSS panel quick view để ở `base.css`. Ticket ES1-T478 ghi "quick view vào product.css": theo ADR này.
   - Không chắc rule thuộc nhóm nào thì để `base.css`.
3. Nạp:
   - `layout/theme.liquid`: ngay sau dòng `base.css` có đúng 1 khối `{%- case template.name -%}`, 4 nhánh, mỗi nhánh 1 `{{ '<file>.css' | asset_url | stylesheet_tag }}`.
   - `layout/password.liquid` và `templates/gift_card.liquid`: thêm 1 dòng `aux.css` ngay sau `base.css`.
   - Không thêm `preload: true` cho file template. Thẻ `<link>` đã nằm trong `<head>` cạnh `base.css`, preload scanner thấy cùng lúc, nên preload không rút ngắn gì. `preload: true` chỉ dành cho `critical.css` (ADR 0003).
   - Không `media="print"` / `onload` (tránh CLS và không cần JS).
4. Trần, đo bằng `zlib.gzipSync(readFileSync(f)).length` của Node (mức mặc định, như `tests/e2e/ES1-T326.spec.ts:126`), không dùng `gzip -9`:
   - `base.css` ≤ 49 152 B.
   - `product.css`, `collection.css`, `cart.css`, `aux.css`: mỗi file ≤ 16 384 B.
   - `critical.css` giữ ≤ 10 240 B thô.
   - File template chạm trần thì mở ADR tách nhỏ hơn (ví dụ `blog.css` từ `aux.css`), không nâng trần.
5. Trong lúc chờ ES1-T478 merge: trần tạm `base.css` ≤ 57 344 B gzip cho mọi PR FE (CTO 17/11). Sau merge về 49 152 ngay trong cùng PR.
6. Không thêm template, block hay thư mục. Chỉ thêm 4 file trong `assets/`, nên vẫn đúng Skeleton (ADR 0004).

## Hệ quả
- Tốt:
  - Trang chủ bớt toàn bộ CSS PDP, collection, cart và trang phụ đã chuyển ra.
  - Màn R2 còn lại (PDP, cart page, collection, blog, trang phụ) ghi vào file riêng, có room 16 384 B mỗi file, không chặn nhau.
- Xấu:
  - PDP, collection, search, list-collections, cart, trang phụ thêm 1 request CSS chặn render (≤ 16 384 B gzip, cùng CDN, HTTP/2).
  - Rule dùng chung bị đặt nhầm vào file template sẽ mất style ở trang khác. Chặn bằng quy tắc 2 và e2e hiện có.
- Việc:
  - FE, ES1-T478, Sprint 2, 3 point. Chạy sau loạt PR FE đang mở, trước mọi ticket FE mới.
    - Tách 4 file, sửa 2 layout và gift_card.
    - Sửa mọi spec `readFileSync('assets/base.css')` sang file mới. Thay trần trong `ES1-T326.spec.ts:126` 53 248 → 49 152.
    - Thêm `tests/e2e/ES1-T478.spec.ts` nhóm tĩnh (mục "Đo").
    - Ghi bảng gzip trước/sau trong PR body.
  - FE, mọi ticket R2 sau ES1-T478 (ES1-T348 → T356, T365, T367, T369, T373, T381–T383, T387…): DoD ghi file CSS đích theo quy tắc 2 và trần của file đó. Tech Lead thêm dòng này khi review.
  - Tech Lead, review PR: rule riêng một trang mà thêm vào `base.css` là REQUEST_CHANGES. Thêm `preload: true` cho file template cũng REQUEST_CHANGES.
  - CTO: sửa AGENTS.md theo `drafts/techlead/ES1-T479/agents-md.md` cùng lúc merge ES1-T478.
  - DevOps, CI lhci (ES1-T177): URL đo có đủ `/`, 1 PDP, 1 collection, `/cart`, `/pages/contact`.
- Đo:
  - Spec tĩnh `ES1-T478.spec.ts`, chạy trong `npx playwright test`, kiểm:
    - gzip: `base.css` ≤ 49 152; mỗi file template ≤ 16 384; `critical.css` ≤ 10 240 B thô.
    - `layout/theme.liquid` có đúng 1 `case template.name`, mỗi file template xuất hiện đúng 1 lần.
    - `aux.css` xuất hiện trong `layout/password.liquid` và `templates/gift_card.liquid`.
    - `grep -n "product.css\|collection.css\|cart.css\|aux.css" layout templates` không có `preload: true`.
    - Không selector nào (chuỗi trước `{`) vừa có ở `base.css` vừa có ở file template.
  - Lighthouse (`npx lhci autorun`): ngưỡng CI desktop ≥ 96, mobile ≥ 90, a11y ≥ 98 trên 5 URL trên, ở PR ES1-T478 và mỗi PR FE sau. Nghiệm thu NFR-1: desktop ≥ 98.
    - Trang chủ không được giảm điểm so với develop trước PR.
    - PDP, collection, cart, contact mobile giảm quá 2 điểm so với trước PR thì DevOps báo Tech Lead xem lại phân nhóm.
  - Giao diện: mọi spec e2e đang xanh trên develop trước PR vẫn xanh sau ES1-T478.
