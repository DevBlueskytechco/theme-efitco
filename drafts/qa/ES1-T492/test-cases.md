KHÔNG CHẮC: spec chưa chạy (phiên agent không có PREVIEW_URL/STORE_PASSWORD; global setup ném lỗi khi thiếu PREVIEW_URL nên cả nhóm tĩnh/trang giả cũng không chạy cục bộ được); mới qua `npx playwright test --list` (biên dịch). API Shopify.customerPrivacy (loadFeatures 'consent-tracking-api' 0.1, setTrackingConsent dạng object, shouldShowBanner, currentVisitorConsent) lấy theo tài liệu công khai, chưa đo trên store dev. Chưa chạy được `ac_coverage.py` (thư mục ../ai-team bị sandbox chặn); tự đối chiếu: 4/4 AC có TC.

# ES1-T492 — global setup consent lỗi thời

Nguồn: ticket ES1-T492 (body + comment CTO 18/11 "tự triển khai tiếp"), ES1-T491 (PR #256), ES1-T434, docs/ui-spec/layers.md §5, docs/srs.md#TE-10 AC7.
Loại: regression hạ tầng test (tests/setup, tests/e2e/support), không đổi theme, không đổi assertion của spec khác.

## AC (rút từ body ticket)

- AC1: lưu lựa chọn consent đúng cách trong global setup — không dựa cookie `_tracking_consent` (không còn); dùng `Shopify.customerPrivacy.setTrackingConsent`, fallback bấm Decline.
- AC2: context dùng state.json không thấy banner consent thật, độc lập thứ tự shard (spec đo vùng đáy bằng evaluate/expect.poll, nơi addLocatorHandler không chạy).
- AC3: gỡ `clearCookies({ name: CONSENT.cookie })` vô tác dụng trong ES1-T314; test "banner thật" vẫn có khách chưa chọn consent.
- AC4: sửa chú thích consent.ts, setup, ES1-T314 cho đúng cơ chế mới.

## Thay đổi

| File | Thay đổi |
|---|---|
| tests/e2e/support/consent.ts | bỏ `CONSENT.cookie`, `declineConsentBanner`; thêm `readConsent` (loadFeatures + shouldShowBanner/currentVisitorConsent), `setDeclinedConsent` (setTrackingConsent mọi mục false), `clickDeclineIfShown`, `declineConsent` (API → fallback banner), `verifyConsentState` (context do setup tạo, banner còn thì Decline và ghi đè state 1 lần). `autoDeclineConsent` giữ, ghi rõ không chạy với evaluate/expect.poll. Không gọi `browser.newContext` trong support (ES1-T475 TC-06) |
| tests/e2e/support/password-unlock.ts | thêm `unlockAndOpenPreview(page, previewUrl, password)` (luồng /password → submit → PREVIEW_URL), dùng chung setup và ES1-T314 |
| tests/setup/password.ts | dùng `unlockAndOpenPreview`; `declineConsent` trước `clearCookies cart` + `storageState`; log `[state] consent: api/banner/failed`, tên cookie đổi sau consent; sau khi lưu mở context mới từ state.json → `verifyConsentState`, log `[state] consent kiểm lại: banner-absent/banner-declined-again/banner-shown`. Không ném lỗi khi banner còn (cảnh báo) |
| tests/e2e/ES1-T314.spec.ts | test "banner thật": context không storageState + `unlockAndOpenPreview` thay cho state.json + `clearCookies(CONSENT.cookie)`; chỉ desktop (giảm request store dev, như ES1-T442 TC-12); sửa chú thích khối `withoutShopifyBanner` (route privacy-banner giữ để test lớp không phụ thuộc kết quả setup). Assertion không đổi |
| tests/e2e/ES1-T492.spec.ts (mới) | TC-01..TC-13 dưới đây |

## Test case

| TC | AC | Mốc / project | Given / When / Then | Loại |
|---|---|---|---|---|
| TC-01 | AC1 | desktop | Given consent.ts; When đọc code (bỏ comment); Then không có khoá `cookie`, không `_tracking_consent`, có `setTrackingConsent`, `'consent-tracking-api'` | tĩnh |
| TC-02 | AC1, AC2 | desktop | Given tests/setup/password.ts; Then thứ tự `declineConsent(` < `storageState({ path` < `verifyConsentState(`; không `declineConsentBanner`; `clearCookies cart` trước storageState (giữ ES1-T201 TC-02); có 2 log `[state] consent:` và `[state] consent kiểm lại:` | tĩnh |
| TC-03 | AC3 | desktop | Given mọi tests/e2e/*.spec.ts; Then không spec nào `clearCookies({ name: CONSENT.* / '_tracking_consent' / '_shopify_essential|cmp' })` | tĩnh |
| TC-04 | AC3 | desktop | Given ES1-T314 test "banner thật"; Then trước `openPage(` có `storageState: undefined`, `unlockAndOpenPreview(`, không `tests/setup/state.json` | tĩnh |
| TC-05 | AC4 | desktop | Given consent.ts, setup, ES1-T314; Then có nhắc ES1-T492, không còn câu "cookie _tracking_consent vào state.json" | tĩnh |
| TC-06 | AC1 | desktop, trang giả | Given window.Shopify giả có loadFeatures + customerPrivacy, chưa chọn (shouldShowBanner true); When `declineConsent`; Then `{result:'api'}`, loadFeatures nhận `[{name:'consent-tracking-api',version:'0.1'}]`, setTrackingConsent nhận `{analytics,marketing,preferences,sale_of_data}` = false, sau đó shouldShowBanner false | helper |
| TC-07 | AC1 | desktop, trang giả | Given API được + banner đã vẽ; When `declineConsent`; Then 'api' và banner gỡ khỏi trang | helper |
| TC-08 | AC1 | desktop, trang giả | Given setTrackingConsent trả `{error}` (giả lỗi 500) + banner hiện; When `declineConsent`; Then 'banner', error chứa lỗi API, banner gỡ | helper, lỗi |
| TC-09 | AC1 | desktop, trang giả | Biên: không có Shopify.loadFeatures, không banner; Then 'failed', error nhắc customerPrivacy, xong < 5 s | helper, rỗng |
| TC-10 | AC1 | desktop, trang giả | Biên mất mạng: loadFeatures không gọi lại; Then readConsent quá giờ 500 ms → `{api:false}`, declineConsent 'failed' | helper, mạng treo |
| TC-11 | AC1 | desktop, trang giả | `clickDeclineIfShown`: không banner → false sau waitMs; có → bấm nút #shopify-pc__banner__btn-decline, banner gỡ | helper |
| TC-12 | AC2 | desktop + mobile, store dev | Given context fixture mặc định (state.json), KHÔNG autoDeclineConsent, KHÔNG chặn privacy-banner; When mở `/` và `/collections/all`, chờ 10 s; Then banner thật không hiện, `html` không `data-consent`, API (nếu có) shouldShowBanner false; annotation `consent-api` | store dev |
| TC-13 | AC2 | 360 (cả 2 project), store dev | Given state.json; When mở `/` ở 360 × 780, chờ banner tối đa 10 s, đo `elementFromPoint` điểm đáy giữa viewport bằng evaluate (đường addLocatorHandler không chạy); Then phần tử không thuộc banner | store dev, mobile |

Đối chiếu AC → TC: AC1 TC-01, 02, 06–11; AC2 TC-02, 12, 13; AC3 TC-03, 04; AC4 TC-05. 4/4.

## Case biên khác (không tự động)

| TC | AC | Given / When / Then |
|---|---|---|
| B-01 | AC2 | Given CI shard bất kỳ; When xem log global setup; Then `[state] consent: api` và `[state] consent kiểm lại: banner-absent`. `banner-declined-again` = API không ghi được nhưng Decline trên banner ghi được → mở ticket ghi lại; `banner-shown` = TC-12 đỏ, spec vùng đáy có thể đỏ |
| B-02 | AC2 | Given đổi `--shard` (thêm spec QA); Then ES1-T314 nhóm lớp vẫn xanh (đã chặn privacy-banner từ ES1-T491) và TC-12 xanh ở mọi shard — xác nhận trên 2 PR liên tiếp có số spec khác nhau |
| B-03 | AC3 | Given test "banner thật" ES1-T314 (khách mới, preview mode); Then annotation `consent-banner-that` = true là kỳ vọng (ES1-T491: preview luôn vẽ banner). false → ghi lại, không fail (assertion giữ như cũ) |
| B-04 | AC1 | Không JS (nojs): banner do JS vẽ nên không có; setup không đổi gì cho context nojs |
| B-05 | AC1 | Merchant tắt banner / market không có nước EU: setTrackingConsent vẫn ghi được, kiểm lại 'banner-absent'; không fail |

## Rủi ro, ghi chú

- Lựa chọn consent có thể lưu phía server theo khách (ES1-T491 quan sát: Decline ở spec trước làm spec sau cùng shard không thấy banner). Cách mới đúng cả khi lưu ở cookie lẫn ở server vì state.json mang cookie định danh khách đã chọn; context từ state.json không ghi ngược về state.json.
- Setup thêm 1 lần tải trang (context kiểm lại) mỗi shard; ES1-T314 "banner thật" thêm luồng /password + PREVIEW_URL chỉ ở desktop.
- Spec TE-1, ES1-T45, TE-4, ES1-T137, ES1-T176, ES1-T235 giữ `autoDeclineConsent` làm lưới an toàn; chú thích "setup không thấy" trong các spec đó lỗi thời nhưng ngoài phạm vi ticket (không đổi spec khác ngoài ES1-T314).
