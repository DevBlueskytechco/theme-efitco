KHÔNG CHẮC: (1) JS và spec chưa chạy trên trình duyệt: phiên agent không có trình duyệt, chỉ chạy logic với DOM giả trong Node. E2E, axe, console, lhci chưa chạy vì CTO 06/11 tắt e2e, lighthouse trên CI tới khi trang chủ xong (vars.RUN_STORE_TESTS=false), PR này chỉ qua theme-check và preview, chưa được coi là đã kiểm. (2) Chưa rõ trùng tên partial có lỗi render không (ES1-T161); chỉ tránh apply khi có từ 2 block. (3) 2 câu hỏi mở ở ES1-T214: countdown khi đổi sang variant không sale, CLS khi picker hiện muộn.

# ES1-T158 TE-13-BE1: featured-product, video-carousel, nối picker TE-4 qua lazy-module

## Thay đổi
- `assets/featured-product.js` (mới): countdown tính lại từ `Date.now` mỗi lần chạy, không storage, không tham số reset. Hết hạn, kể cả ngay khi kết nối: `hidden`, dừng timer, không hiện lại. Timer dừng khi khung ra khỏi viewport hoặc tab ẩn, chạy lại thì tính ngay. Gallery: `theme:variant:change` và click thumbnail, `scrollTo`, reduced-motion thì `auto`, `aria-current`. Từ 2 block: render giá và nút từ JSON (plan ES1-T169 D4).
- `assets/video-carousel.js` (mới): `video-card`. Vào khung thật mới clone thẻ video, 1 lần. Bấm mới chạy. External: iframe chỉ khi bấm, rời khung trả về poster. Chỉ 1 video chạy. Lỗi nguồn cuối hoặc `video.error`: gỡ video, `data-video-error`, poster thành link sản phẩm, chữ ẩn đổi.
- `assets/product-variant-picker.js`: `data-fetch-url` (không `replaceState`), `data-regions`; so radio với id khi kết nối (chỉ khi có `data-fetch-url`); từ 2 `featured-product` thì không fetch, không apply; sau apply báo giá vào live region khi không có `.product-form__inventory`. Trang sản phẩm: logic không đổi, file tăng 9 B do code mới trừ comment.
- `blocks/featured-product.liquid`, `blocks/video-carousel.liquid`: `data-lazy-module`, thẻ script `lazy-module.js`, `{% doc %}`. Theme editor không nạp form, picker.
- `snippets/variant-json.liquid`, `snippets/product-variant-picker.liquid`: param `price_html`, xem mục dưới.
- Test: `tests/e2e/ES1-T158.spec.ts` (mới). `ES1-T66.spec.ts`: contract đổi sang `...names`. `ES1-T156.spec.ts`, `ES1-T157.spec.ts`: 2 test trạng thái trước nâng cấp nay chặn file module, vì module đã đổi `data-enhanced` và clone video.
- `drafts/dev-be/ES1-T158/logic-check.cjs`: kiểm logic bằng DOM giả.

## Lệch ticket
1. Đổi vị trí hook: `data-lazy-module` của picker nằm trên `.featured-product__summary`, không trên thẻ `product-variant-picker`. `base.css` đặt `product-variant-picker:not(:defined) { display: none }` (ES1-T86), phần tử không có hộp nên IntersectionObserver không bao giờ báo giao và module không bao giờ nạp. Có test tĩnh giữ điều này. Đã comment ticket.
2. Sửa thêm `snippets/variant-json.liquid`, ticket không ghi. JSON cũ không có giá gạch, không có tiền đã định dạng nên không làm được D4. Thêm `price_html` cho từng variant, chỉ khi có `fetch_url`, nên JSON trang sản phẩm không đổi.
   - Dùng markup server thay vì tự dựng trong JS: đúng `| money`, đơn giá, nhãn ẩn, và JS không chứa nổi trong trần.
   - Nhược điểm 1: lặp 8 dòng badge giảm giá của block. Có test so `price_html` với region thật.
   - Nhược điểm 2: HTML trang chủ tăng khoảng 350 đến 400 B mỗi variant (ước lượng từ markup, chưa đo), kể cả khi chỉ có 1 block và không dùng tới. Sản phẩm 250 variant thì gần 100 KB trước gzip. Nếu không chấp nhận được, cần Tech Lead chọn cách khác.
3. `featured-product.js` trần 2304 B nên phải cắt, hiện 2290 B:
   - Chế độ JSON (từ 2 block, store thật mặc định không gặp): không báo live region; icon túi không đổi theo còn hàng, nên variant hết hàng vẫn có icon cạnh chữ Sold out.
   - Không thụt lề, ít comment, tên class 1 chữ: khó đọc hơn quy ước. Theo mẫu `assets/bundle-form.js`.
   - Selector ngắn phụ thuộc thứ tự markup: `$("script")` là JSON của picker, `b.querySelector("span")` là nhãn nút, `$("ul")` là danh sách ảnh; 4 giá trị countdown theo thứ tự days, hours, minutes, seconds.
   - Không gỡ listener `visibilitychange`, không `disconnect` observer khi gỡ block; chỉ dọn timer. Chỉ gặp trong theme editor khi render lại block. Observer tự báo không giao khi phần tử bị gỡ nên timer không chạy lại (suy luận, chưa đo).
   - Thumbnail không xét phím bổ trợ. `ticket` chỉ yêu cầu ở poster video.
   - `aria-current` không theo khi khách tự vuốt gallery, chỉ theo click và đổi variant. Ticket không yêu cầu.

## Rủi ro đã biết
- `a.ariaCurrent` cần Firefox từ 119 (hiểu biết chung, chưa kiểm).
- Radio bị trình duyệt khôi phục trước khi module về, và `product-variant-picker.js` về trước `featured-product.js` ở trang nhiều block: id đúng, giá còn cũ. Không ảnh hưởng variant thêm vào giỏ.
- Trang chủ, sản phẩm có trên 250 variant và variant đang chọn ngoài JSON: picker báo Unavailable khi kết nối. Trang sản phẩm không bị vì kiểm tra chỉ chạy khi có `data-fetch-url`.
- `route.abort` ở chế độ partial: id đã đổi, nút giữ trạng thái cũ, giá vẫn của variant trước. Giống hành vi TE-4 hiện tại, không sửa ở đây.
- Poster không có product khi lỗi vẫn link tới tệp mp4 đã lỗi: đúng chữ ticket "giữ poster".
- Giới hạn của spec: video dùng thẻ giả và stub `play`, `pause` vì store có thể chưa có video (ES1-T153), chỉ có 1 test với video thật và skip khi thiếu. "Chỉ 2 partial" kiểm bằng contract tĩnh và `data-regions`, vì chưa biết tên partial nằm ở đâu trong request. "Chọn trước khi module nạp" đổi radio bằng script, vì khách không bấm được radio đang ẩn.

## Bảng D8 (plan ES1-T169 D6, `wc -c`)
| Nhóm | File | Trần B | Thật B |
| --- | --- | --- | --- |
| Sau cuộn | `featured-product.js` | 2 304 | 2 290 |
| Sau cuộn | `video-carousel.js` | 2 560 | 2 557 |
| Sau cuộn | `product-variant-picker.js` (7 156 trước PR) | 7 168 | 7 165 |
| Sau cuộn | `product-form.js`, không sửa | 6 857 | 6 857 |
| Tải sẵn | `lazy-module.js`, đã tính ở D6 | 384 | 379 |
| Tổng trang chủ theo D6 | Không đổi vì dùng đúng số D6 | 65 536 | 64 710 (số kế hoạch) |

Số D6 có file chưa tồn tại. Bước đo thật của ES1-T177 chưa làm. Không thêm thẻ script tĩnh nào ngoài `lazy-module.js`.

## Tự kiểm tra
- `wc -c`: bảng trên, cả 3 file trong trần.
- `shopify theme check`: 97 file, 0 lỗi. `node --check` 3 file JS, `node --experimental-strip-types --check` ES1-T158, T66, T156, T157: ok. `locales/en.default.json` không sửa.
- `node drafts/dev-be/ES1-T158/logic-check.cjs`: pass. Phủ countdown, hết hạn, timer, ô ngày, gallery, JSON, video, lỗi nguồn, 1 video chạy, 3 nhánh của picker. Không có layout thật, không thay được E2E. Lần chạy đầu fail 2 lần đều do fake trong script, không phải lỗi code.
- Contract partial: test tĩnh trong spec, chưa chạy.
- `npx playwright test tests/e2e/ES1-T158.spec.ts` desktop + Pixel 7, TE-4, ES1-T156, ES1-T157, TE-3, axe, console, CLS, `npx lhci autorun`: chờ CI, đang tắt theo CTO 06/11, chưa kiểm.
- Spec chưa type-check (không có `tsc`). `page.clock` qua reload, `pauseAt` chưa chạy thử lần nào.

## Việc cho Orchestrator
- Chưa đóng: ES1-T161, ES1-T214.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
