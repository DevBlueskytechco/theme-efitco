KHÔNG CHẮC: B2B và combined listing phụ thuộc kết quả ES1-T298 (store dev có bật được không); ngưỡng CI và cách nhận biết email đã đăng ký chờ ES1-T301 (có mặc định). Hook chặn BA ghi `docs/srs.md`: bản đầy đủ ở `drafts/ba/ES1-T299/srs.md`, Orchestrator chép đè `docs/srs.md`.

# ES1-T299 — Thay đổi SRS 0.3 → 0.4

Nguồn: `docs/design/decisions.md` (dòng 11/11 ×3, 10/11, 09/11, 07/11), ES1-T297 (CTO 11/11), ES1-T269, ES1-T274, ES1-T276, ES1-T298; spec `docs/ui-spec/pagination.md`, `quiz-result.md`, `product-shopify-features.md`, `announcement-bar.md`, `localization.md`, `layers.md`, `countdown.md`, `variant-picker.md`, `index-mobile-a.md`, `index-mobile-b.md`, `index-1280.md`.

## 1. Áp 7 lệch L1–L7 (mục 4 của SRS 0.3 đã xoá)

| # | AC | Bản 0.3 | Bản 0.4 | Nguồn |
| --- | --- | --- | --- | --- |
| L1 | NFR-1 | perf ≥ 96 desktop, ≥ 90 mobile, a11y ≥ 98 | nghiệm thu: SEO 100 (home, collection, product, blog, article, page), A11y 100, BP 100 mọi trang đo, perf desktop ≥ 98, mobile ≥ 90; BP tách phần theme / nền tảng; CI chặn merge giữ ngưỡng CLAUDE.md tới khi Tech Lead/DevOps chốt | sổ 09/11, 10/11 BGĐ; ES1-T297 #4; ES1-T301 #1 |
| L1 | TE-10 AC1, AC-H30 | CI chặn merge ở 96/90/98 là nghiệm thu | tách: CI theo ngưỡng CI; nghiệm thu theo NFR-1 | như trên |
| L1 | TE-13 AC5 | "≥ 96 desktop, ≥ 90 mobile" | đạt NFR-1 và ngưỡng CI | như trên |
| L2 | TE-2 AC7 | chấm slide mọi mốc | 360: 2 chấm 44 × 44 đáy trái, không mũi tên; 768, 1280: 2 nút 52 góc dưới phải, không chấm; 1920: 2 nút 52 như Figma, không chấm; 360, 768 ảnh tràn màn không bo | sổ 07/11 hero; H1 10/11 (index-mobile-a §13); HD2 11/11 (index-1280 §8) |
| L3 | TE-12 AC1, AC-H18, AC-H19 | luôn có ghi chú giảm giá | không có dòng ghi chú giảm giá | sổ 07/11 |
| L3 | TE-10 AC3 | R8 đạt khi có ghi chú ở AC-H18, H19 | R8 đạt khi có AC-H33 + giảm thật bằng discount tự động (TE-12 AC2) | sổ 07/11 |
| L3 | Mục 3 (chốt 06/11) | "bậc giảm 10%, 15% kèm ghi chú" | ghi chú bỏ, ghi chú lịch sử giữ dòng | sổ 07/11 |
| L4 | Mục 3 E11, Q6 | E11 "Add to cart" theo AGENTS.md | E11 bỏ; nút "Add To Cart" như Figma | sổ 07/11 (dòng 11/11: AGENTS.md theo), ES1-T297 #4, PR #170 |
| L4 | TE-4 AC2, TE-13 AC2, AC-H22 | "Add to cart" | "Add To Cart" | như trên |
| L5 | TE-11 AC3 | kết quả hiện trong block | kết quả mở popup (dialog ≥ 48rem, sheet < 48rem), trạng thái đang tìm, ≤ 4 / > 4 / 0 kết quả, lỗi tải | sổ 09/11; quiz-result.md §2–§5 |
| L5 | TE-11 AC5 (mới) | — | dialog a11y, đóng trả focus, Retake Quiz, chặn popup marketing | sổ 09/11 A11y; quiz-result.md §8 |
| L6 | TE-7 AC1 | carousel 360, lưới 1280 | hàng ngang mọi mốc, nút 52 đầu khối từ 768, thanh tiến trình, 360 vuốt không nút, 1280 lộ ≥ 25% card kế, vừa khung thì lưới tĩnh | sổ 09/11 hàng ngang + nút 52; HD3 11/11; index-mobile-b §4 |
| L7 | TE-6 AC6 (mới) | không quy định trang đầu/cuối | 1 snippet chung 5 nơi; Previous/Next 52 "Previous page"/"Next page"; số trang từ 48rem, "Page X of Y" dưới 48rem; đầu/cuối mờ 0.35 + `aria-disabled`, không href, không Tab; 1 trang không render; không JS chạy | sổ 10/11 audit (5), C3, S3; pagination.md |
| L7 | TE-6 AC1, AC5; TE-8 AC2; TE-9 AC3 | "paginate", "phân trang" | trỏ TE-6 AC6 | như trên |

## 2. Quyết định 11/11 thêm hoặc sửa AC

| Quyết định | AC | Thay đổi | Nguồn |
| --- | --- | --- | --- |
| QZ1 | TE-11 AC6 (mới); TE-4 AC8, TE-5 AC6, TE-3 AC11 (ngoại lệ) | Add To Cart trong popup quiz: popup giữ mở, "Added" 3 s, status, số giỏ tăng, không drawer, không cart page | sổ 11/11; quiz-result.md §5 2d |
| QZ2 | TE-11 AC7 (mới) | Choose Options / Quick View thay nội dung trong cùng dialog, "Back to shortlist" | sổ 11/11; quiz-result.md §5 2f |
| QZ3 | TE-11 AC3, AC8 (mới) | "View All N Matches" tới collection lọc 3 tag; trang `?view=quiz` pill tên tag bỏ `quiz-` | sổ 11/11; quiz-result.md §6 |
| PG1 | TE-6 AC6, TE-9 AC3 | bình luận: nav "Comment pages", nút "Previous page"/"Next page" | sổ 11/11; pagination.md §12 |
| PG2 | TE-8 AC2 | "Showing x–y of z results" chỉ ở search | như trên |
| PG3 | TE-6 AC7 (mới) | `?page=` vượt: empty state + "Go to page 1" | như trên |
| SF1 | TE-4 AC19 | thẻ radio theo nhóm + select tần suất; giá chính và sticky bar theo plan; mặc định `selected_selling_plan`; không JS radio phẳng (thay "lựa chọn mặc định theo spec ES1-T288") | sổ 11/11; product-shopify-features.md §4 |
| SF2 | TE-4 AC20 (mới), AC4 | pickup: dòng trạng thái + nút; dialog drawer phải ≥ 48rem, sheet < 48rem; không JS `<details>`; không khối khi sản phẩm số/gift card/0 địa điểm; quickview không có | sổ 11/11; product-shopify-features.md §7 |
| SF3 | TE-4 AC18, TE-5 AC9 | vi phạm quantity rule: nút vẫn bật, lỗi inline khi rời ô / bấm, focus ô số; khoá khi giỏ đủ max + "View cart"; giỏ: quy tắc rút gọn, lỗi dưới dòng | sổ 11/11; product-shopify-features.md §5 |
| AN1, AN2 | TE-1 AC4 | bar nền tối + noise, ≥ 44px, không nút đóng, không xoay câu, không setting màu; không dính, chỉ header dính; không có ở password, gift card | sổ 11/11; announcement-bar.md |
| LC1–LC3 | TE-1 AC10 (mới), AC5 | popover 2 cột ≥ 48rem, sheet 2 tab < 48rem, cấp 2 trong drawer; ô tìm khi > 10 nước, không cờ trong hàng; bấm là đổi, không Apply, chạy không JS | sổ 11/11; localization.md |
| LY1 | TE-10 AC6 | theme dịch nút Inbox lên trên thanh đáy, chừa làn toast; đo 360, 1280 | sổ 11/11; layers.md §2 |
| LY2 | TE-10 AC7 (mới) | consent đang hiện: ẩn thanh đáy + teaser, popup tự mở chờ, toast vẫn hiện | sổ 11/11; layers.md §5 |
| LY3 | TE-10 AC8 (mới) | `max-height: 30rem`: header thôi dính, teaser ẩn, thanh mua giữ | sổ 11/11; layers.md §2.5 |
| VP1 | TE-4 AC15 | Add To Cart lúc tải biến thể: giữ màu, `aria-disabled`, không spinner; `aria-busy` chuyển sang vùng giá + tồn (bản 0.3 đặt `aria-busy` trên nút, trái sổ) | sổ 11/11; variant-picker.md §6 |
| CD2 | TE-4 AC17 (áp TE-13, TE-18 qua component chung) | hết giờ khi đang xem: "This sale has ended", khung giữ cỡ, giá và nút giữ tới khi tải lại, không tự tải lại | sổ 11/11; countdown.md §5 K3 |
| ES1-T276 | TE-4 AC17 | số in bằng Liquid lúc tải, CLS 0, JS chỉ cập nhật; không JS không hiện | sổ 11/11; countdown.md §5 K0 |
| HA1 | TE-2 AC10 (mới) | ảnh slide 1 + lớp tối hiện ngay; chữ hero hiện dần 400 ms lúc tải, xong < 700 ms; reduced motion hiện ngay | sổ 11/11; index-mobile-a.md §10 |
| ES1-T269 | TE-1 AC3 | không `templates/customers/*`; chỉ customer accounts mới | sổ 11/11; ES1-T269 |
| ES1-T274 | TE-18 AC7 | popup giữ mở sau khi gửi; "You're Already Subscribed" `role="status"`, không phải lỗi | sổ 11/11; marketing-popups.md (trạng thái "Đã đăng ký") |
| ES1-T297 #1, #6 | TE-4 AC18, TE-5 AC9, TE-9 AC7 | KHÔNG CHẮC B2B thay bằng: dữ liệu ES1-T298 D1; không bật được thì QA kiểm bằng mockup; combined listing không AC | ES1-T297, ES1-T298 |
| ES1-T297 #2 | TE-18 bảng setting, TE-9 AC7 | Discount code mặc định rỗng; store dev `WELCOME15` (D10) | ES1-T297, ES1-T298 |
| ES1-T297 #3 | AC-H33, ghi chú TE-18 | Shopify Email ngoài phạm vi theme; tài liệu merchant ghi bước | ES1-T297 |

Settings: không thêm, không đổi default. Ghi rõ không có setting cho selling plan, quantity rule, pickup (product-shopify-features §12), announcement bar (§2), localization (§3), phân trang (§5).

## 3. Quyết định 11/11 không thêm AC

| Quyết định | Lý do |
| --- | --- |
| VP2 chấm màu card ≤ 4 / 3 + "+N", VP3 option thiếu swatch thành pill | chi tiết hiển thị trong variant-picker.md; TE-3 AC2, TE-4 AC13 không mâu thuẫn |
| HB1 thanh bundle 360 hiện khi 0 món, HB2 toast trên thanh bundle | chi tiết index-mobile-b.md, layers.md; ticket không liệt kê |
| FD1 chữ phụ panel tối trắng 70%, FD2 "Popular searches" 1 theme setting | token/setting thiết kế; FD2 là setting mới chưa có trong SRS: Designer/Tech Lead ghi ở spec, BA thêm vào bảng setting khi ticket yêu cầu |
| CD1 big offer countdown Compact | cỡ hiển thị, countdown.md §2 |
| HA2 focal point trên file ảnh | TE-2 AC1 đã dùng focal point của image_picker |
| HD1 chữ display ≥ 80rem | typography, index-1280.md |
| HD2, HD3 | chỉ dùng cho TE-2 AC7 (mốc 1280) và TE-7 AC1 |

## 4. Không làm trong bản này
- Không ước lượng point (techlead), không sửa code, không sửa spec ui-spec.
- Upsell trong drawer (ES1-T247) giữ ngoài SRS.
- Ngưỡng CI lhci: Tech Lead/DevOps (ES1-T301 #1).

## 5. Đề xuất sửa file ngoài phạm vi BA (Orchestrator / vai liên quan)

| File | Sửa | Ai |
| --- | --- | --- |
| `docs/srs.md` | chép đè bằng `drafts/ba/ES1-T299/srs.md` | Orchestrator |
| `CLAUDE.md` mục Lệnh kiểm tra, `docs/checklist-theme-store.md` R6.1, R6.2 | ngưỡng 96/90/98 là ngưỡng CI; thêm chỉ tiêu nghiệm thu NFR-1 hoặc trỏ SRS | Tech Lead/DevOps theo ES1-T301 #1 |
| `docs/ui-spec/pagination.md` dòng 3 | story trỏ "TE-8 AC3 (search)" → TE-8 AC2; thêm TE-6 AC6, AC7 | Designer |
| `docs/ui-spec/quiz-result.md` dòng 1 | KHÔNG CHẮC câu CTO 1 đã chốt (QZ1) | Designer |
| `docs/ui-spec/countdown.md` dòng 1 | KHÔNG CHẮC (1) ES1-T276 đã chốt | Designer |
| `tests/e2e/support/figma-exceptions.json` | nếu có E11 thì bỏ | QA |

## 6. TC cũ bị ảnh hưởng (QA xử lý)

| TC | AC | Việc |
| --- | --- | --- |
| TC-H30 | AC-H30 | sửa: CI theo ngưỡng CI; nghiệm thu theo NFR-1 (TC-299-01) |
| TC-H18, TC-H19 | AC-H18, AC-H19 | sửa: kỳ vọng không có dòng ghi chú giảm giá |
| TC-H33 | AC-H33 | sửa: thêm bước Shopify Email, Discount code |
| TC-H22 và mọi TC kiểm chữ "Add to cart" | TE-4 AC2, TE-13 AC2, AC-H22 | sửa: "Add To Cart" |
| TC-294-20 | TE-4 AC15 | sửa: nút `aria-disabled`, không spinner; `aria-busy` ở vùng giá + tồn |
| TC-294-25 | TE-4 AC17 | sửa: thêm K0 (số Liquid) và K3 ("This sale has ended"), chi tiết ở TC-299-11, 12 |
| TC-294-26 | TE-4 AC18 | sửa: nút vẫn bật khi vi phạm, lỗi khi rời ô / bấm |
| TC-294-28 | TE-4 AC19 | sửa: thẻ theo nhóm + select tần suất, giá chính theo plan |
| TC-294-31 | TE-5 AC9 | sửa: quy tắc rút gọn, lỗi dưới dòng khi rời ô |
| TC-294-33 | TE-9 AC7 | sửa: D2–D8, D10; D1, D9 theo kết quả ES1-T298 |
| TC-294-41 | TE-18 AC7 | sửa: popup giữ mở sau khi gửi; thêm TC-299-32 |
| TC hiện có của TE-11 AC3 (kết quả trong block) | TE-11 AC3 | bỏ, thay bằng TC-299-26, 27 |
| TC hiện có của TE-7 AC1 (lưới 1280) | TE-7 AC1 | bỏ, thay bằng TC-299-21 |
| TC hiện có của TE-2 AC7 (chấm mọi mốc) | TE-2 AC7 | bỏ, thay bằng TC-299-08 |
| TC hiện có của TE-1 AC4 (announcement) | TE-1 AC4 | giữ phần rỗng/có text; thêm TC-299-04, 05 |
