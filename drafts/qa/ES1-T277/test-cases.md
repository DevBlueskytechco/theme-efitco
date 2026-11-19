KHÔNG CHẮC: chưa có lhr thật. Phiên QA bị chặn mạng tới hoa-qua-nhap-khau.myshopify.com (sandbox, user denied), tool store-dev báo thiếu STORE_PASSWORD, không có quyền gh để lấy artifact CI. Case đo trên store để "Chặn — chờ ES1-T281". Case tĩnh và case công cụ đã chạy.

# ES1-T277 — Lighthouse Best Practices: đo và tách nguồn trừ điểm
Nguồn: ticket ES1-T277 (BGĐ 10/11), AC quy đổi ở ticket-ac.md, docs/srs.md#TE-10. Không có Figma. Không có [E2E] → không viết tests/e2e/ES1-T277.spec.ts; công cụ đo ở drafts/qa/ES1-T277/tools/.
Lighthouse: 12.1.0 (node_modules/lighthouse, đi kèm @lhci/cli 0.14 mà CI dùng).

| ID | AC | Given | When | Then | Loại | Ưu tiên | Kết quả |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC-01 | AC1 | store dev mở khoá, theme live, 6 trang | run-bp.mjs desktop + mobile | 12 lhr, runtimeError rỗng, category best-practices có điểm | đo store | P1 | Chặn — chờ ES1-T281 |
| TC-02 | AC1 | như TC-01, preview develop (preview_theme_id, pb=0) | run-bp.mjs | 12 lhr, finalDisplayedUrl giữ preview_theme_id | đo store | P1 | Chặn — chờ ES1-T281 |
| TC-03 | AC1 | STORE_ORIGIN rỗng hoặc store khác | chạy run-bp.mjs | dừng exit 2, không gọi mạng (no-production.md) | công cụ | P1 | Đạt (exit 2, thông báo đúng) |
| TC-04 | AC1 | thiếu handle sản phẩm hoặc bài viết | run-bp.mjs dò handle | cảnh báo tên biến BP_PRODUCT / BP_ARTICLE, đo các trang còn lại | công cụ | P3 | Chưa chạy (cần store) |
| TC-05 | AC2 | lhr bất kỳ | classify-bp.mjs | bảng: audit, trọng số, nguồn, item, URL; điểm tính lại khớp điểm báo | công cụ | P1 | Đạt trên lhr giả lập (fixtures/, test TC-07, TC-08) |
| TC-06 | AC2 | lhr thật 24 file | classify-bp.mjs --md bp-table.md | mọi audit score < 1, weight > 0 đều có dòng | đo store | P1 | Chặn — chờ ES1-T281 |
| TC-07 | AC4 | lhr giả lập: cookie shop.app làm trượt third-party-cookies + inspector-issues, mobile | analyzeLhr | tổng trọng số 28, BP 0,79, tối đa nếu sửa theme 0,79 | công cụ | P1 | Đạt |
| TC-08 | AC3 | lhr giả lập desktop: deprecation trong asset theme, lỗi console shop.app, ảnh store thiếu độ phân giải | analyzeLhr | deprecation, ảnh → theme; console → nền tảng; tối đa 26/27 | công cụ | P1 | Đạt |
| TC-09 | AC3 | 1 audit có item theme và item nền tảng | analyzeLhr | audit vẫn trượt khi tính tối đa | công cụ | P2 | Đạt |
| TC-10 | AC3 | URL Cloudflare, app extension, monorail, trekkie, wpm, api/collect, shopifycloud, asset theme, inline | classifyUrl | store dev / nền tảng / theme / cần xác minh đúng luật | công cụ | P1 | Đạt |
| TC-11 | AC3 | audit DOM trượt không có item (doctype), is-on-https trượt | analyzeLhr | doctype → theme, is-on-https → nền tảng | công cụ | P2 | Đạt |
| TC-13 | AC4 | lhr giả lập desktop, cùng giả thuyết TC-07, font-size N/A | analyzeLhr | tổng 27, BP 0,78 khớp số CI | công cụ | P1 | Đạt |
| TC-14 | AC3 | biến thể -isolated, lỗi console ERR_BLOCKED_BY_CLIENT | analyzeLhr | xếp nền tảng, không tính lỗi theme | công cụ | P2 | Đạt |
| TC-15 | AC3 | mã theme (layout, blocks, snippets, assets/*.js) | rà tĩnh từng audit BP | bảng mục 4 best-practices.md có file:dòng, cách sửa | tĩnh | P1 | Đạt (1 rủi ro charset, 3 điểm kích hoạt component Shop Pay) |
| TC-16 | AC4 | trọng số Lighthouse 12.1, BP CI 0,78 desktop, 0,79 mobile | tính ngược | mất đúng 6 trọng số trên cả 2 form factor | tĩnh | P1 | Đạt (21/27, 22/28) |
| TC-17 | AC4 | lhr thật theme live + preview, có và không BP_ISOLATE | classify-bp.mjs | cột "tối đa nếu sửa phần theme"; trả lời 100 có/không bằng số đo | đo store | P1 | Chặn — chờ ES1-T281 |
| TC-18 | AC4 | git status của lượt này | kiểm phạm vi | chỉ file trong drafts/qa/ES1-T277/, không đổi blocks/snippets/layout/assets | tĩnh | P1 | Đạt (`?? drafts/qa/ES1-T277/` duy nhất) |
| TC-19 | AC5 | run-bp.mjs | đọc mã | đo tuần tự 1 trình duyệt, nghỉ BP_PAUSE_MS (5 s) giữa 2 lần đo, chỉ category best-practices | tĩnh | P2 | Đạt |
| TC-20 | AC5 | thư mục đầu ra | kiểm file | có best-practices.md; lhr/ trống đến khi ES1-T281 xong | tĩnh | P1 | Một phần (thiếu lhr) |

## Case biên (ngoài AC)
| ID | Given | When | Then | Kết quả |
| --- | --- | --- | --- | --- |
| TC-12 | lhr runtimeError, không có category best-practices | classify-bp.mjs | không sập, bảng ghi "lỗi" | Đạt |
| TC-21 | Cloudflare thử thách IP đo (store dev) | run-bp.mjs | log /cdn-cgi/ xếp store dev, không chặn /cdn-cgi/ khi cô lập | Đạt trên luật (TC-10); chưa đo |
| TC-22 | Giỏ rỗng và giỏ có hàng (cart drawer hidden / hiện accelerated checkout) | đo trang chủ 2 lần | so third-party-cookies để biết component accelerated checkout có phát cookie khi ẩn | Chưa chạy (cần store) |
| TC-23 | mobile 360 (Lighthouse mobile = moto g power, DPR 1.75) | image-size-responsive | ảnh theme đủ độ phân giải với widths/sizes của snippet image | Chưa chạy (cần store) |

## Dữ liệu test (hoa-qua-nhap-khau (efitco-ai-dev))
Trang: `/`, `/collections/all` (hoặc BENCH_COLLECTION), `/products/<BENCH_PRODUCT hoặc sản phẩm đầu products.json>`, `/blogs/news`, bài đầu tiên của blog, `/pages/contact`. Theme id live, preview develop: chưa biết (hỏi ở ES1-T281).

## KHÔNG CHẮC
- Số CI 0,78 / 0,79 lấy từ ticket, chưa đọc artifact; chưa biết là 1 lần đo hay gộp nhiều trang.
- Handle blog `news` là mặc định của script, chưa xác minh store có blog này.
