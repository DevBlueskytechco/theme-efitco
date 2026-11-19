KHÔNG CHẮC: chưa chạy được Playwright trong lượt agent — Chromium không khởi động trong sandbox (mach_port_rendezvous Permission denied), chạy ngoài sandbox bị từ chối; không có PREVIEW_URL/STORE_PASSWORD. `npx playwright test --list` biên dịch OK (26 test). Kết quả chờ CI store-tests của PR ES1-T442. Markup trang mới lấy theo ticket + docs/ui-spec/password.md §2, §5, chưa đối chiếu HTML thật PR #208. Smoke `preview`: chưa xác minh `/password?preview_theme_id=` render theme preview khi store khoá — test chỉ ghi annotation dạng trang, assert là mở khoá thành công.

# ES1-T442 — global setup mở `<details>` "Enter Using Password" trước khi điền mật khẩu

Nguồn: ticket ES1-T442 (body + comment CTO 13/11 08:07), docs/srs.md#TE-21 AC10, AC11, docs/ui-spec/password.md §2, §5, ES1-T384 (PR #208).
Phạm vi (comment CTO): chỉ tests/setup/password.ts + helper trong tests/. scripts/lhci-auth.js tách ticket DevOps riêng — không sửa ở đây. Không phụ thuộc #208 merge.

### ES1-T442

AC của ticket (DoD + comment CTO):
- AC1: setup điền được mật khẩu trên cả trang password cũ (ô hiện sẵn) lẫn mới (ô trong `<details data-testid="password-details">` đóng sẵn): ô ẩn thì mở details rồi điền.
- AC2: không dùng `fill({ force: true })` (ô trong details đóng không nhận focus).
- AC3: smoke pass trên PREVIEW_URL (global setup mở khoá được, PREVIEW_URL không bị đẩy về /password).
- AC4: phạm vi chỉ tests/ (setup + helper); lhci-auth.js không đổi.

## Thay đổi

| File | Thay đổi |
|---|---|
| tests/e2e/support/password-unlock.ts (mới) | `revealPasswordInput(page)`: không có ô → `absent`; ô hiện → `visible`; ô ẩn → bấm `> summary` của details đóng chứa ô (ưu tiên `[data-testid=password-details]`, fallback details bất kỳ), không bấm được thì `open = true`; details lồng thì mở mọi tổ tiên; chờ ô visible → `opened`. `fillStorePassword(page, pw)`: reveal rồi `fill` thường. |
| tests/setup/password.ts | thay `p.fill(...)` bằng `fillStorePassword`; log `[state] trang password: ô trong <details>, đã mở / ô hiện sẵn / không có ô`; submit + chờ rời /password giữ nguyên. |
| tests/e2e/ES1-T442.spec.ts (mới) | 11 test fixture (page.route trên host giả `pw-fixture.test`, không gọi store) + 2 smoke store dev (desktop). |

## Test case

| ID | AC | Given | When | Then | Loại | Ưu tiên |
| --- | --- | --- | --- | --- | --- | --- |
| TC-01 | AC1 | trang password cũ: form `action=/password`, ô hiện sẵn | `fillStorePassword` rồi submit | trả `visible`; ô có giá trị; POST /password body có `password=<mật khẩu>` | E2E fixture | P1 |
| TC-02 | AC1 | trang mới: form newsletter + `<details data-testid=password-details>` đóng, ô ẩn | `fillStorePassword` rồi submit | trả `opened`; details có `open`; ô visible, có giá trị; POST body có mật khẩu | E2E fixture | P1 |
| TC-03 | AC1 | trang mới, details đã `open` (mật khẩu sai, docs/srs.md#TE-21 mục AC 11) | `fillStorePassword` | trả `visible`; không bấm summary nên details vẫn mở; ô có giá trị | E2E fixture | P2 |
| TC-04 | AC1 | trang không có ô mật khẩu (store đã mở khoá) | `fillStorePassword` | trả `absent`; không lỗi; 0 POST | E2E fixture | P2 |
| TC-05 | AC2 | trang mới, details đóng | `fill` thường (1,5 s) và `fill({ force })` lên ô | `fill` thường ném lỗi; `force` ném lỗi hoặc ghi annotation; details vẫn đóng → lý do helper phải mở details | E2E fixture | P2 |
| TC-06 | AC1 | details bọc ô nhưng không có data-testid (markup khác #208) | `fillStorePassword` | trả `opened`; details mở; ô có giá trị | E2E fixture | P2 |
| TC-12 live | AC3 | store dev khoá; context mới không storageState; `${origin}/password` (theme live, như setup) | helper + submit, rồi mở PREVIEW_URL | rời /password; PREVIEW_URL không bị đẩy về /password; annotation ghi dạng trang | E2E store dev | P1 |
| TC-12 preview | AC3 | như trên, `/password?preview_theme_id=<id PREVIEW_URL>` | helper + submit, rồi mở PREVIEW_URL | như trên | E2E store dev | P1 |
| TC-13 | AC3 | CI store-tests của PR | global setup chạy | log `[state] trang password: ...`; `state.json` ghi được; mọi spec khác không bị đẩy về /password | CI | P1 |
| TC-14 | AC4 | diff PR | review | chỉ đổi tests/setup/password.ts, tests/e2e/support/password-unlock.ts, tests/e2e/ES1-T442.spec.ts, drafts/qa/ES1-T442/; scripts/lhci-auth.js không đổi | review | P2 |

## Case biên (ngoài AC)

| ID | AC | Given | When | Then | Loại | Ưu tiên |
| --- | --- | --- | --- | --- | --- | --- |
| TC-07 | biên | details lồng nhau, ô ở details trong | `revealPasswordInput` | mở mọi details tổ tiên; ô visible | E2E fixture | P3 |
| TC-08 | biên | trang mới có form email newsletter | `fillStorePassword` rồi submit | ô email rỗng; POST là `form_type=storefront_password`, không có trường `contact` (không đăng ký newsletter nhầm) | E2E fixture | P2 |
| TC-09 | biên | viewport 360 × 740 | `fillStorePassword` | `opened`, ô có giá trị | E2E fixture | P3 |
| TC-10 | biên | context `javaScriptEnabled: false` | `fillStorePassword` | details mở bằng click summary native, ô có giá trị | E2E fixture | P3 |
| TC-11 | biên | trang mới | focus summary, Enter | summary tên "Enter Using Password"; details mở; helper sau đó trả `visible` (không bấm lần nữa làm đóng) | E2E fixture | P3 |
| — | biên | mất mạng / STORE_PASSWORD sai | global setup | không đổi: setup ném "Không mở khoá được store: kiểm STORE_PASSWORD" như trước | ghi chú | — |

Mốc 768/1280/1920 và trạng thái rỗng/đang tải không áp dụng: ticket là hạ tầng test, không phải AC giao diện. Fixture chạy cả project desktop (1280) và mobile (Pixel 7) + 360.

## Dữ liệu test (hoa-qua-nhap-khau (efitco-ai-dev))

- Fixture: HTML dựng trong spec, phục vụ qua `page.route('https://pw-fixture.test/**')`; POST /password trả 200 giả. Không request store.
- Smoke: `PREVIEW_URL`, `STORE_PASSWORD` (secret CI). Thiếu → skip có lý do. Chỉ project desktop (2 lần POST /password mỗi lần chạy).

## Kết quả

| Bước | Kết quả |
|---|---|
| `npx playwright test --list tests/e2e/ES1-T442.spec.ts` | 26 test biên dịch (13 × 2 project) |
| Chạy fixture cục bộ | không chạy được: Chromium bị sandbox chặn (FATAL mach_port_rendezvous Permission denied) → chờ CI |
| Smoke store dev | chờ CI store-tests |
| ac_coverage.py test-cases.md#ES1-T442 | 4/4 |

Bug: chưa có (chưa chạy).
