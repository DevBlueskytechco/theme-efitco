# ES1-T441 — phạm vi AC (trích docs/srs.md#TE-3, chỉ các AC ticket ES1-T441 / ES1-T337 đụng tới)
Tham chiếu chéo tới AC khác trong câu gốc thay bằng chữ (để ac_coverage.py chỉ đếm AC trong phạm vi); nội dung nghiệm thu giữ nguyên.

- AC2 (0.3, foundation §9, ES1-T294) Given sản phẩm có option màu ≥ 2 giá trị có swatch When render card Then swatch là chỉ báo: `aria-hidden="true"`, không nhận focus, không bấm được; tên truy cập của link card có thêm số màu (vd ", 3 colors"); swatch lấy từ option value của option màu, không lặp danh sách biến thể (NFR-7). Chọn màu qua nút Quick View, mở bộ chọn chung với trang sản phẩm. (0.5) Số chỉ báo hiện theo quy tắc VP2 bên dưới.
- AC6 (0.3) Given keyboard When tab qua card Then focus thấy được trên link card và nút Quick View, ảnh có alt từ sản phẩm; link card và nút Quick View có vùng chạm ≥ 44px; swatch giữ kích thước Figma 32 × 16 cách 4, không phải control nên không có yêu cầu vùng chạm (thay "vùng bấm swatch 44px" của D7, ES1-T169).
- AC8 (0.3, Editions Fall '26 #20) Given collection đa nguồn có phần tử là variant When render card Then ảnh, giá, link ?variant= theo đúng variant đó, swatch của variant đó hiện ở trạng thái đang chọn (chỉ báo, không bấm).
- AC12 (0.3) Given không JS When render card Then không có nút Quick View, card là link tới trang sản phẩm.
- AC13 (0.5, VP2 sổ 11/11; `variant-picker.md` §9) Given sản phẩm có option màu với N giá trị có swatch When render card ở 360, 768, 1280, 1920 Then N ≤ 4: hiện đủ N chỉ báo; N > 4: hiện 3 chỉ báo đầu + chữ "+{N − 3}" 14px màu `--color-muted` (vd 7 màu: 3 chỉ báo + "+4"); tên truy cập link card ghi tổng N (vd "{title}, 7 colors"); hàng chỉ báo không tràn ngang card 152px ở 360.

Ngoài phạm vi ticket: các AC còn lại của TE-3 (lưới, giá, placeholder, Xem tất cả, quickview, media, setting) giữ test hiện có trong TE-3.spec.ts. Vùng chạm ≥ 44px của link card / nút Quick View và alt ảnh kiểm ở TE-3 TC-50/TC-53, không đổi trong ticket này.
