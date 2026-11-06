KHÔNG CHẮC: chưa chạy trên store, không đọc được log CI (api.github.com và store bị từ chối). Dòng "Chờ CI" chưa có kết quả thật. Nguyên nhân từng mục: triage.md.

# ES1-T224 — sửa 7 test đỏ sau CI đủ thứ 2
Nguồn: ticket ES1-T224, AC quy đổi ở ticket-ac.md. Spec: tests/e2e/ES1-T224.spec.ts, repro: drafts/qa/ES1-T224/repro.spec.ts. Không có Figma.

| ID | AC | Given | When | Then | Loại | Ưu tiên | Kết quả |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC-01 | AC1 | URL error-analytics, URL store, trang `/` và `/cart` | gọi isStoreRefresh | chỉ cùng origin, cùng pathname mới tính | [E2E] tĩnh | P1 | Đạt |
| TC-02 | AC1 | ES1-T203.spec.ts | đọc mã nguồn | countRefreshes, route TC-27 đi qua isStoreRefresh | [E2E] tĩnh | P2 | Đạt |
| TC-11 | AC1 | luồng mua thật, updateCart | chạy ES1-T203:536 TC-25 | đúng 1 refresh | [E2E] store | P1 | Chờ CI |
| TC-03 | AC2 | ES1-T188.spec.ts | đọc mã nguồn | không còn networkidle | [E2E] tĩnh | P2 | Đạt |
| TC-08 | AC2 | ảnh đang tải, ảnh ẩn, 1 request không bao giờ xong | gọi visibleImagesLoaded | false khi đang tải, bỏ qua ảnh ẩn, true khi xong dù mạng chưa yên | [E2E] trang giả | P1 | Đạt |
| TC-12 | AC2 | /?view=figma có 4 tab | chạy ES1-T188:125 | 0 ảnh tab ẩn được tải, không timeout | [E2E] store | P1 | Chờ CI |
| TC-07 | AC3 | heading hàng 8, CSS thật | đổi cỡ 1920 sang 360, không tải lại | br inline rồi none, chữ không dính, 1 lần tải | [E2E] trang giả | P1 | Đạt |
| TC-13 | AC3 | trang chủ | chạy ES1-T180:158 | đạt, hoặc báo rõ Cloudflare, 429, thiếu heading | [E2E] store | P1 | Chờ CI |
| TC-09 | AC4 | tắt JS, POST /cart/add bị thử thách | bấm thêm giỏ | expectStoreAllowed nêu Cloudflare, URL không qua điều kiện /cart | [E2E] trang giả | P1 | Đạt |
| TC-10 | AC4 | tắt JS, ảnh treo, trang bị chặn | gotoStore domcontentloaded | không chờ ảnh, vẫn nhận màn thử thách | [E2E] trang giả | P2 | Đạt |
| TC-14 | AC4 | band B CSS thật, server cục bộ, tắt JS (R4) | chọn variant, bấm, POST 302 | tới /cart, id cuối là variant đã chọn | repro | P1 | Đạt |
| TC-15 | AC4 | /?view=te13-states, tắt JS | chạy ES1-T156:250 | đúng variant trong giỏ, hoặc báo đúng bước lỗi | [E2E] store | P1 | Chờ CI |
| TC-05 | AC5 | ES1-T179.spec.ts | đọc mã nguồn | dùng ArrowRight thật tới hết card 4 | [E2E] tĩnh | P2 | Đạt |
| TC-06 | AC5 | 4 card, 1920, CSS thật, focus trong list | bấm ArrowRight | tới hết card 4, giữ focus, trang không cuộn | [E2E] trang giả | P1 | Đạt |
| TC-16 | AC5 | overflow-x thuần và list thật (R1, R3) | bấm End | ghi nhận scrollLeft 0, trang cuộn | repro | P1 | Đã ghi nhận, ES1-T225 |
| TC-17 | AC5 | trang chủ 1920 | chạy ES1-T179:205 | tới hết card 4 bằng phím | [E2E] store | P1 | Chờ CI |
| TC-04 | AC6 | T179, T180, T182, test gộp | đọc mã nguồn | không còn quét cả trang ở 3 spec; test gộp không skip, có gotoStore, watch.finish | [E2E] tĩnh | P1 | Đạt |
| TC-18 | AC6 | / và /?view=figma | chạy test axe gộp | 0 serious, 0 console error, hoặc báo "bị Cloudflare chặn" | [E2E] store | P1 | Chờ CI |
| TC-19 | AC7 | ES1-T191.spec.ts | git status | không đổi | lệnh | P2 | Đạt |
| TC-20 | AC8 | toàn bộ spec, project desktop | chạy không có store | 0 test tĩnh đỏ | lệnh | P1 | Đạt, 161 đạt, 42 skip, 760 cần store |
| TC-21 | AC8 | toàn bộ spec | playwright --list | nạp đủ, không lỗi import vòng | lệnh | P1 | Đạt, 1926 test, 61 file |
| TC-22 | AC8 | triage.md | đọc | đủ 7 mục, có nguyên nhân, bằng chứng, việc còn lại | review | P1 | Đạt |

## Case biên (ngoài AC)
- Rỗng: vùng không có ảnh thì visibleImagesLoaded trả true, không treo (đọc code, chưa có test riêng).
- Mất mạng: POST bị từ chối thì waitForResponse hết 15 s và nêu đúng bước (đọc code, chưa chạy).
- Mobile 360: TC-07.
- Keyboard: TC-06, TC-16.
- Screen reader, merchant chưa chọn resource: không áp dụng, ticket chỉ sửa test.
- Không type-check: repo không có typescript. `playwright --list` chỉ chứng minh nạp được file.
