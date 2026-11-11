KHÔNG CHẮC: phiên QA không vào được store dev (thiếu STORE_PASSWORD), các spec sửa ở lượt 3 mới kiểm biên dịch (`npx playwright test --list`: 2108 test, 64 file) và helper mới kiểm bằng repro cục bộ; chưa chạy trên preview. DoD "e2e-gate xanh" chỉ chốt được khi CI chạy trên PR của nhánh này.

# ES1-T300: develop e2e đỏ từ 10/11, phân loại và sửa test

Lượt 3 (CTO 11/11 14:36): chuyển từ phân loại sang sửa test để develop xanh. Nguồn lỗi: run 42978078054 (PR #174, code = develop) và run 42805384493 (PR #170). Không sửa code theme.

## 1. Kết luận chung

- 1919ccf (10/11) chỉ đổi docs/ và drafts/. Code theme và test ở develop giống 8e7e585. e2e trên CI tắt từ 06/11 (e049ea5, `vars.RUN_STORE_TESTS=false`), nên lần đỏ đầu tiên gom mọi commit 07-10/11 chưa qua e2e.
- Giả thuyết import map (`@shopify/partial-rendering` không resolve): không phải nguyên nhân e2e, CTO xác nhận 11/11 09:27. Lỗi console chỉ thấy trên theme live lúc đo Lighthouse; cần kiểm riêng trên preview (mục 5).

## 2. Bảng phân loại và xử lý

| # | Test (dòng ở run 42978078054) | Nguyên nhân | Bằng chứng | Xử lý lượt 3 | Ticket |
|---|---|---|---|---|---|
| 1 | TE-3.spec.ts:492 "TC-12 TC-33 AC2: chọn swatch đổi ảnh" | Test lỗi thời theo SRS | docs/srs.md TE-3 AC2 bản 0.3 (D9, ES1-T294) quy định swatch card chỉ là chỉ báo `aria-hidden`, không bấm được. ES1-T306 đề xuất bỏ TC-12, TC-33. Lỗi gốc: alt không đổi khi hover rồi click (2fd33f9), repro `repro/swatch-alt.repro.spec.ts` | `test.skip` cả 2 path, comment ghi lý do và ES1-T300, ES1-T306, ES1-T303 | ES1-T303 (dev-be): hành vi này sẽ bị gỡ theo AC2 0.3, dev-be/Tech Lead quyết đóng hay sửa |
| 2 | ES1-T139.spec.ts:256 "AC3 AC-H16 bộ rỗng" | Test phụ thuộc dữ liệu store | Dữ liệu demo 4b3b9a5 có 3 sản phẩm mang đủ quiz-lower + quiz-advanced + quiz-gym (figma-flexfold-adjustable-bench-2, figma-recovery-roller, figma-revllen-speed-rope) | `page.route(isResults)` + `route.continue({ url })`: đổi đoạn tag cuối sang `es1-t300-khong-co-san-pham`. Store tự render partial 0 sản phẩm theo đúng markup quiz.liquid; không tự viết HTML partial, không gọi store từ Node (ES1-T171). Giữ nguyên toàn bộ assertion | ES1-T302 (gộp vào đây, CTO) |
| 3 | ES1-T176.spec.ts:231 "Hàng 1 Header: so ảnh" | Test chưa hiệu chuẩn, thiếu dữ liệu | 2708 pixel khác trên 157920 không che, ngưỡng 1579 (1%). Nền header #1A1A1A có noise (decisions.md 10/11), menu `main-menu` chưa theo Figma (ES1-T178, calibration.md mục 1) | Thêm `imageReportOnly` cho hàng 1 trong support/figma-rows.json; compareImage ghi `[figma-calibration] image-report-only` và annotation `figma-report-only`, không assert. Không nới ngưỡng. Kích thước (geometry) và computed style hàng 1 vẫn chặn. Hàng 2 giữ nguyên | Đóng khi TE-17-R2-QA0 có fixture và CTO chốt ngưỡng |
| 4 | ES1-T156.spec.ts:250 "nojs select variant, form POST vào giỏ" | Môi trường | Log run 42805384493 có "bị Cloudflare chặn (cf-mitigated, status 429)" ở POST /cart/add | Bọc luồng bằng `skipIfStoreBlocked` (helper mới trong support/store-guard.ts): store chặn thì skip có lý do qua `skip429`, ghi vào `[429-tong-ket]`; lỗi khác vẫn fail | - |
| 5 | ES1-T158.spec.ts:362 "AC2 AC-H22 thêm giỏ thật đúng variant" | Môi trường | Log run 42805384493: "bị Cloudflare chặn (cf-mitigated, status 429)" tại /?view=te13 | Như #4. `themeAdd` vẫn thử lại 429 theo Retry-After trước khi skip | - |
| 6 | ES1-T30.spec.ts:215 "focus bàn phím trong block giữ, rời focus chạy lại" (mobile, fail cả retry) | Test lệch thiết kế đã chốt. Không flaky, không phải lỗi code | decisions.md 07/11: mobile không mũi tên. base.css:7857 `@media (max-width: 47.99rem)` ẩn `.slideshow__arrow`. `focus()` trên nút display none không có tác dụng → không có focusin → autoplay chạy tiếp → index 1. Hỏng ở cả 2 lần chạy, vì vậy không phải flaky | Đã sửa ở lượt 2 (nhánh này, chưa vào develop): mobile focus `slideshow-pause` (hiện khi autoplay), desktop giữ `slideshow-next`, thêm `toBeVisible` | Không mở bug |
| 7 | ES1-T190 "vùng bấm swatch (D7, AC6)" | Môi trường | Log run 42805384493: /?view=figma 429. Không có trong danh sách đỏ của run 42978078054. SRS 0.3 mục D7 đã bỏ vùng bấm 44px vì swatch card chỉ còn là chỉ báo | Không sửa trong lượt này. Spec lỗi thời theo SRS 0.4 (knowledge: "ES1-T190 vùng bấm swatch bỏ"), cần ticket QA viết lại | Đề xuất gộp vào đợt viết lại TE-3 swatch |
| 8 | ES1-T95 "AC1-markup" (chỉ có ở PR #170) | Môi trường | Log run 42805384493: /products/variant-co-anh-rieng.js bị Cloudflare chặn. Không có ở run 42978078054 | Không sửa. Đã có `skip429` và `expectStoreAllowed` | - |

## 3. Tổng hợp

- Bỏ test lỗi thời: 1 (TE-3 TC-12/TC-33).
- Sửa test vì phụ thuộc dữ liệu: 1 (T139 AC-H16).
- Tách khỏi gate, chỉ ghi số: 1 (T176 hàng 1, chỉ phần so ảnh).
- Môi trường, skip có lý do: 2 (T156, T158). T95, T190 không đỏ ở run mới nhất.
- Test lệch sổ quyết định: 1 (T30 mobile), đã sửa.
- Lỗi code: ES1-T303 (alt swatch) không còn chặn gate vì TC-12 đã bỏ.

## 4. File đổi trên nhánh feature/ai-ES1-T300

- tests/e2e/TE-3.spec.ts: `test.skip` TC-12/TC-33, kèm comment lý do.
- tests/e2e/ES1-T139.spec.ts: hằng `EMPTY_TAG`, page.route trong test AC-H16.
- tests/e2e/ES1-T176.spec.ts, tests/e2e/support/figma-rows.json: chế độ `imageReportOnly` cho hàng 1.
- tests/e2e/support/store-guard.ts: thêm `isStoreBlockedError`, `skipIfStoreBlocked` (chỉ dùng cho test được CTO cho phép; test khác giữ quy tắc ES1-T203 là fail rõ khi bị chặn).
- tests/e2e/ES1-T156.spec.ts, tests/e2e/ES1-T158.spec.ts: bọc luồng thêm giỏ thật.
- tests/e2e/ES1-T30.spec.ts (lượt 2).
- drafts/qa/ES1-T300/repro/skip-blocked.repro.spec.ts: tự kiểm helper. Kết quả cục bộ đúng kỳ vọng: B1, B2 skipped; B3 failed (lỗi assertion được ném lại); B4 passed.

## 5. Tự kiểm tra và việc còn lại

- `npx playwright test --list`: 2108 test trong 64 file, không lỗi biên dịch. Repo không có tsc nên chưa type-check.
- `npx playwright test -c drafts/qa/ES1-T300/repro/pw.repro.config.ts`: swatch-alt (lượt 2) và skip-blocked chạy đúng kỳ vọng.
- Chưa chạy trên preview. Cần CI chạy store-tests trên PR của nhánh này để xác nhận e2e-gate xanh (DoD).
- Còn mở: kiểm console preview develop xem có "Failed to resolve module specifier @shopify/partial-rendering" không (tách khỏi theme live); CTO chốt ngưỡng hàng 1 khi có fixture TE-17-R2-QA0.
