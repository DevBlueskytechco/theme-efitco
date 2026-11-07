KHÔNG CHẮC: rà bằng grep cộng đọc tay trên develop cf65af1, spec chưa chạy lại trên store. Script: drafts/qa/ES1-T176/tools/audit_home_specs.py.

# ES1-T176: rà spec mở trang chủ và spec đọc /collections/all

## 1. Spec còn khẳng định mặc định trống, ngoài ES1-T168 mục 2.4

Kết quả: 0 test đang sai với quyết định hiện tại. Các dòng của mục 2.4 đã được ticket FE sửa, ví dụ `ES1-T119.spec.ts:252`, `ES1-T147.spec.ts:185`, `ES1-T137.spec.ts:131`.

Các test dưới đây khẳng định "trống" nhưng đúng với Q1, Q2 của ES1-T167, ES1-T168: `/` trên preview chưa có tài nguyên. Giữ nguyên.

| Test | Khẳng định | Vì sao đúng | Ticket FE |
| --- | --- | --- | --- |
| `ES1-T148.spec.ts:219-224` | `/` không có shop the look | Q1: ẩn tới khi chọn sản phẩm | ES1-T148 |
| `ES1-T156.spec.ts:206-210`, `ES1-T182.spec.ts:88-92` | `/` không có featured product | Q1 | ES1-T156, ES1-T182 |
| `ES1-T157.spec.ts:221-224` | `/` không có video carousel | Q2: merchant mới không có video | ES1-T157 |
| `ES1-T118.spec.ts:210-212` | Review trên `/` không có Verified, ảnh, sản phẩm | E9, Q2 | ES1-T118 |
| `ES1-T119.spec.ts:261` | FAQ trên `/` không có ảnh | Q2 | ES1-T119 |
| `ES1-T120.spec.ts:267-268` | Why choose trên `/` hiện placeholder ảnh | Q2. Cần xem lại: `AGENTS.md:258` về empty state, chưa kết luận | ES1-T120 |
| `ES1-T188.spec.ts:238-246` | Trang chủ không có thanh tab khi chưa chọn tab | Tab cần collection chọn trong editor | ES1-T188 |

Rủi ro ở ES1-T196, nghiệm thu trên `/`: các test trên chạy trên preview không có block settings nên vẫn đúng. Nếu chạy trên theme đã chọn tài nguyên trong editor (TE-17-OPS2) thì chúng sẽ đỏ. ES1-T196 cần tách theo theme đang đo.

## 2. Spec đọc /collections/all trước khi ES1-T178 nhập dữ liệu

| Spec | Cách đọc | Rủi ro sau khi thêm 24 sản phẩm vào `all` |
| --- | --- | --- |
| `TE-3.spec.ts:46`, `ES1-T73.spec.ts:11`, `ES1-T108.spec.ts:16` | Tìm card trong 5 trang đầu (`MAX_PAGES = 5`) | CÓ: sản phẩm test có thể bị đẩy ra ngoài 5 trang tuỳ thứ tự collection. Thiếu card thì test skip hoặc fail. Chưa đo được vì không vào được store |
| `TE-3.spec.ts:426,769` | Sản phẩm hết hàng trong 8 sản phẩm đầu | Đã nêu ở ES1-T168 mục 2.4 |
| `ES1-T138.spec.ts:15-19`, `ES1-T139.spec.ts:102` | Lọc theo tag quiz | KHÔNG: bảng ES1-T173 mục 3.4 giữ đúng 5, 1, 0 sản phẩm |
| `ES1-T186.spec.ts:128` | Đọc `products_count` | KHÔNG |
| `smoke`, `TE-1`, `ES1-T95`, `ES1-T181` | Chỉ cần trang mở được | KHÔNG |

Đã báo trên ES1-T178.

## 3. Công cụ

`templates/index.figma.liquid` và `templates/index.liquid` hiện cùng cây block: test tĩnh của ES1-T176 pass trên file thật.
