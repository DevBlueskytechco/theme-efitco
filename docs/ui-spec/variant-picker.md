KHÔNG CHẮC: (1) demo-data chưa có sản phẩm 3 option / 40 giá trị: mockup dùng dữ liệu mẫu (PDP: Color × Pack × Weight 5–200 lb theo ma trận ES1-T282; quickview: Weight × Color × Grip trên "Adjustable dumbbell pair" P09), ghi rõ trên mockup; chờ CTO ở ES1-T282. (2) Theme không có `sections/`: "Section Rendering theo option value" hiểu là fetch partial của theme kèm `option_values` (architecture.md); tên partial và tham số Tech Lead đối chiếu shopify.dev khi tách ticket FE/BE. (3) Card chỉ báo (§9) chưa có trong sổ: ĐỀ XUẤT, câu CTO 2.

# UI spec: Bộ chọn biến thể chung (ES1-T284)

Component dùng chung cho trang sản phẩm (ES1-T253, `docs/ui-spec/product.md` §5.1), quickview (ES1-T262, `docs/ui-spec/mini-cart-quickview.md` §3.1) và chỉ báo trên card. Mọi quy tắc về giá trị option, thu gọn, đang tải, lỗi, focus nằm ở file này; hai spec kia chỉ ghi phần riêng của ngữ cảnh. Mâu thuẫn thì file này thắng.

## Thay đổi audit (ES1-T283, A1, A2, A24)

| # | Thành phần | PDP vòng 3b | Quickview vòng 3b | Chung (ES1-T284) | Nguồn |
| --- | --- | --- | --- | --- | --- |
| 1 | Ngưỡng thu gọn | > 12 giá trị, hiện 11 + "+N" | > 10, hiện 7 + "+N" | > 10 giá trị hiện 7 + "+N", hằng trong snippet, không setting | Sổ 10/11 M5 |
| 2 | Setting "Options with many values" (Buttons/Dropdown) | có | không | bỏ; không dropdown | Sổ M5; 10 §6 #850 |
| 3 | Tổ hợp không tồn tại | viền đứt, không gạch | gạch + viền đứt | gạch chữ + viền đứt (swatch: gạch chéo + vòng đứt) | 10 §6 #2709; 01 (không chỉ màu) |
| 4 | Gạch chéo swatch | 2px + viền trắng 1px | 1px | 2px foreground + viền nền 1px | 1.4.11 (thấy trên swatch đen, trắng) |
| 5 | Viền lõi swatch | 50% | 20% | 50% (3.36:1) | product.md §13; 1.4.11 |
| 6 | Nút "+N" | pill trắng viền foreground | pill nền alt viền muted-light + caret | pill nền alt viền muted-light + caret, ô thứ 8 của lưới | 06 §1 (cùng chức năng cùng hình) |
| 7 | Focus sau khi mở "+N" | ở lại nút (đổi thành "Show Fewer" cuối danh sách) | vào giá trị đầu tiên vừa hiện | vào giá trị đầu tiên vừa hiện; thu lại thì về "+N" | 22 (progressive disclosure), §7 |
| 8 | Nhãn | "Show Fewer", "Try again" | "Show fewer", "Try Again" | "Show Fewer", "Try Again" (Title Case như nút Figma "Add To Cart") | Sổ 07/11 |
| 9 | Đang tải | spinner trong legend + skeleton giá và tồn + nút spinner | skeleton giá + "Checking availability…" (spinner) + nút spinner xám | skeleton giá + dòng tồn "Checking availability…" có spinner 12 + nút giữ màu, `aria-disabled`, KHÔNG spinner | 05 §5; spinner trên nút dành cho "đang thêm giỏ" |
| 10 | Lỗi tải | chữ đỏ + nút chữ "Try again" | `.qv__error` + "Try Again" (mẫu 5d/5e) | chữ đỏ + icon dưới option, nút secondary nhỏ "Try Again" cao 44 | 05 §4 |
| 11 | Giá trị đang chọn ngoài phần hiện | thay vào ô 11 | 6 ô đầu + ô đang chọn | 6 giá trị đầu + giá trị đang chọn ở ô 7 | Sổ M5 |

Mockup:
- PDP: `drafts/designer/ES1-T253/product.html` khung J (J0 bảng trạng thái, J1 thu gọn 7 + "+33", J2 mở hết + focus, J3 đang tải, J4 lỗi), PNG `product-360|768|1280|1920.png`.
- Quickview: `drafts/designer/ES1-T262/mini-cart-quickview.html` khung 2b, 2c, 5b, 5c, 5g, PNG `mini-cart-quickview-360|768|1280|1920.png`.

Figma: không có bộ chọn biến thể (figma-inventory; khối featured product 1:759 không có option). Ngôn ngữ: pill bo tròn, chữ Inter 14, nền foreground cho phần đang chọn, accent chỉ cho focus. Toàn bộ trạng thái là ĐỀ XUẤT có nguồn, đã chốt nguyên tắc ở sổ 10/11 (2048 biến thể, M5).

---

## 1. Mục đích

Người mua chọn tối đa 3 option (mỗi option nhiều giá trị, tổng tới 2048 biến thể) và thấy ngay giá trị nào mua được với lựa chọn hiện tại, không phải đoán, không vỡ bố cục ở 360. Mỗi lần đổi lựa chọn chỉ tải dữ liệu biến thể đó từ server.

## 2. Nguồn dữ liệu (2048 biến thể, sổ 10/11)

- Chỉ `product.options_with_values` → `option.values`. Mỗi value: `value.id`, `value.name`, `value.selected`, `value.available`, `value.exists`, `value.swatch` (`.color`, `.image`), `value.variant` (có thể rỗng), `value.product_url` (combined listing).
- KHÔNG `{% for variant in product.variants %}`, KHÔNG `product | json`, KHÔNG `<script type="application/json">` chứa biến thể, KHÔNG `<select name="id">` liệt kê biến thể. `product.variants` chỉ trả tối đa 250.
- Biến thể đang mua: `product.selected_or_first_available_variant`; form chỉ gửi `<input type="hidden" name="id">` của biến thể này.
- 1 biến thể hoặc chỉ default variant (`product.has_only_default_variant`): không in bộ chọn (TE-4 AC9). Option chỉ 1 giá trị (edge_cases "Sản phẩm chỉ 1 variant", Color: Green): vẫn in fieldset để người mua biết màu, 1 giá trị đang chọn.

## 3. Anatomy

Mỗi option một `<fieldset>`:

1. `<legend>`: tên option 14/600 + ": " + giá trị đang chọn 14/400 `--color-muted` ("Weight: 45 lb"). Cách giá trị 12 (PDP) / 8 (quickview).
2. Nhóm giá trị: radio thật bọc trong `<label>` (pill hoặc swatch), `name` riêng mỗi option, `value` = `value.id`.
3. Nút "+N" / "Show Fewer" (chỉ option > 10 giá trị).
4. Vùng lỗi tải (`role="alert"`, rỗng khi không lỗi) ngay dưới nhóm giá trị.

Khoảng giữa các fieldset 24 (`--space-5`).

### 3.1 Pill chữ (option không có swatch: Size, Weight, Pack, Denominations, Operating system)

- Cao 44, rộng tối thiểu 56, padding ngang 16, bo pill, Inter 14/500, gap 8, `flex-wrap` (không cuộn ngang).
- Trong lưới thu gọn (§5): ô `minmax(72px, 1fr)`, padding ngang 8.
- Dùng pill cho size, không dropdown (10 §6 #850).

### 3.2 Swatch (chuẩn Shopify)

- Dùng khi MỌI giá trị của option có `value.swatch` (màu `swatch.color` hoặc ảnh `swatch.image | image_url: width: 72`), do merchant gán trong admin (option liên kết metafield danh mục, metaobject color-pattern). Thiếu swatch ở một vài giá trị: cả option dùng pill chữ (ĐỀ XUẤT, 06 §1 nhất quán trong một nhóm; câu CTO 3).
- Ô 44 tròn (vùng chạm), lõi 36 (inset 4), viền lõi 1px `color-mix(--color-foreground 50%, transparent)` (3.36:1, thấy được swatch trắng trên nền trắng). Ảnh swatch `object-fit: cover` trong lõi.
- Tên giá trị trong label ẩn (`visually-hidden`); legend hiện tên giá trị đang chọn (10 §6 #849: swatch cho màu, tên rõ).

## 4. Trạng thái mỗi giá trị

Tính theo các option đang chọn khác, Shopify trả sẵn trên option value; không JS tự tính.

| Trạng thái | Điều kiện | Pill | Swatch | Tên đọc thêm |
| --- | --- | --- | --- | --- |
| Còn hàng | `value.available` | viền `--color-border`, chữ foreground | lõi màu, viền lõi 50% | — |
| Hết hàng | `value.exists` và không `value.available` | chữ `--color-muted` (8.45) gạch ngang, viền thường | gạch chéo −45° 2px foreground, viền nền 1px quanh vạch | ", sold out" |
| Không tồn tại | không `value.exists` | chữ muted gạch ngang + viền đứt `--color-muted-light` (5.33) | gạch chéo như hết hàng + vòng ngoài 44 nét đứt `--color-muted-light` | ", unavailable" |
| Đang chọn | `value.selected` | nền foreground, chữ nền (17.4), viền liền; nếu hết hàng / không tồn tại vẫn giữ gạch chữ | vòng 2px foreground (vòng đứt bị thay bằng vòng liền), gạch chéo giữ | radio `checked` |
| Hover | con trỏ | viền foreground (viền đứt giữ kiểu đứt, đổi màu foreground) | vòng ngoài 1px foreground | — |
| Focus | bàn phím | outline 2px `--color-accent` offset 2 (5.01) | như pill, ngoài vòng 44 | — |

- Gạch ngang = "không mua được"; viền đứt = "không có tổ hợp này". Hai trạng thái khác nhau bằng hình và chữ ẩn, không chỉ màu (01; 10 §6 #2709 hiện rõ biến thể hết hàng).
- Không ẩn giá trị, không `disabled`: mọi giá trị chọn được để người mua thấy kết quả (nút "Sold Out" / "Unavailable", dòng tồn). Không làm mờ bằng opacity (color-contrast tính cả opacity).
- Giữ lựa chọn các option khác khi đổi một option nếu tổ hợp còn tồn tại (10 §6 #2712); việc chọn biến thể kế tiếp do server (`value.variant`).
- Chuyển trạng thái: màu viền / nền 150ms `--ease-out`, không animate kích thước.

## 5. Option nhiều giá trị (sổ M5)

Hằng trong snippet, không setting: `collapse_threshold = 10`, `collapse_visible = 7`.

- ≤ 10 giá trị: hiện hết, `flex-wrap` (vd 7 màu "Apparel More Variants" xuống dòng).
- > 10 giá trị: lưới `repeat(auto-fill, minmax(72px, 1fr))`, gap 8. Liquid in đủ mọi giá trị trong DOM; giá trị thứ 8 trở đi có `hidden`; ô thứ 8 là nút "+N" (N = `option.values.size | minus: 7`, Liquid tính, không CLS).
- Giá trị đang chọn nằm sau vị trí 7: hiện 6 giá trị đầu + giá trị đang chọn ở ô 7 (giá trị thứ 7 gốc bị `hidden`). Người mua luôn thấy lựa chọn của mình.
- Swatch > 10 màu: cùng luật, ô 44 tròn, "+N" là pill cao 44 rộng tối thiểu 44 trong hàng flex.

Số ô mỗi hàng (ô 72, gap 8) theo bề rộng vùng chứa:

| Ngữ cảnh | 360 | 768 | 1280 | 1920 |
| --- | --- | --- | --- | --- |
| PDP buy box | 320 → 4 ô, thu gọn 2 hàng | 728 → 9 ô, 1 hàng | 580 → 7 ô, 2 hàng | 668 → 8 ô, 1 hàng |
| Quickview cột info | 320 → 4 ô, 2 hàng | 316 → 4 ô, 2 hàng | 408 → 5 ô, 2 hàng | 408 → 5 ô, 2 hàng |

Thu gọn luôn ≤ 2 hàng ở mọi mốc; mở hết 40 giá trị ở 360 là 10 hàng (cao ~512), không cuộn ngang.

Nút "+N":
- Pill trong ô lưới: cao 44, nền `--color-background-alt`, viền 1px `--color-muted-light`, chữ foreground 14/600 (15.8) + caret 12 × 8 hướng xuống cách 4. Hover: nền foreground chữ nền. Focus: outline accent như giá trị.
- `<button type="button" aria-expanded="false" aria-controls="{id nhóm}">`; chữ hiện "+33", phần ẩn " more Weight options" (tên chứa chữ hiển thị, WCAG 2.5.3).
- Bấm: bỏ `hidden` của mọi giá trị tại chỗ (không popup chồng popup, 15 §1), giá trị trở về đúng thứ tự gốc; nút chuyển xuống ô cuối, chữ "Show Fewer" (+ ẩn " Weight options"), caret lật lên, `aria-expanded="true"`, chiếm 2 cột lưới. Focus chuyển vào giá trị đầu tiên vừa hiện (không chọn nó). Không animate chiều cao (chỉ transform/opacity, sổ 09/11): giá trị mới hiện ngay.
- "Show Fewer": thu về 7 + "+N" theo lựa chọn hiện tại, focus về nút "+N", cuộn để nút trong tầm nhìn nếu đã ra khỏi màn (`scrollIntoView({ block: 'nearest' })`).
- Trạng thái mở giữ nguyên khi partial thay bộ chọn sau mỗi lần đổi lựa chọn (BE ghi nhớ id option đang mở và áp lại), không thu lại dưới tay người mua.
- Không JS: Liquid đã in trạng thái thu gọn; đổi biến thể cũng cần JS (product.md §17), trang vẫn mua được biến thể mặc định.

## 6. Đổi lựa chọn: đang tải, xong, lỗi

Luồng (BE, chung PDP/quickview):
1. Giá trị vừa bấm chuyển "đang chọn" ngay (< 100ms), legend đổi theo. Mọi option vẫn bấm được; lần bấm sau huỷ request trước (`AbortController`).
2. Đang tải (ĐỀ XUẤT, 05 §5 phản hồi gần vùng đổi; mockup J3, 5g):
   - Giá: khối skeleton cùng chiều cao dòng giá (28 PDP 1280 / 22 PDP 360 / 28 quickview), rộng 45%, shimmer 1.4s, tĩnh khi giảm chuyển động. Không làm nhạt giá cũ (chữ nhạt trượt AA, giá cũ dễ đọc nhầm). Badge -N%, countdown (PDP) ẩn theo cùng khối giá.
   - Dòng tồn: chấm thay bằng spinner 12 (viền `--color-border`, đỉnh foreground), chữ "Checking availability…" `--color-muted` 14. Là spinner duy nhất của trạng thái này.
   - Add To Cart: giữ màu primary, nhãn, bề rộng; `aria-disabled="true"`, `cursor: progress`; bấm trong lúc chờ không làm gì. KHÔNG spinner trên nút (spinner trên nút chỉ cho "đang thêm giỏ", product.md §11 C, quickview 5d), không đổi xám (tránh nháy mỗi lần chọn).
   - `aria-busy="true"` trên vùng giá + tồn; `role="status"` ẩn đọc "Loading 120 lb…".
3. Xong: thay bộ chọn (trạng thái mọi giá trị), giá, badge, tồn, nút, ảnh (featured media của biến thể; edge_cases "Variant có ảnh riêng"); status đọc "120 lb, $189.00, In stock". Focus giữ trên radio có cùng `data-option-value-id` sau khi thay markup.
4. Lỗi mạng / 5xx (ĐỀ XUẤT, 05 §4: nói rõ lỗi và cách sửa; mockup J4):
   - Radio quay về giá trị của biến thể cuối đã tải được; giá, tồn, nút giữ đúng biến thể đó (không bao giờ hiện giá của biến thể khác với nút).
   - Ngay dưới nhóm giá trị của option vừa bấm, `role="alert"`: icon cảnh báo 16 + "Couldn't load 120 lb. Check your connection." Inter 14/500 `--color-sale` (6.38); dưới đó nút secondary nhỏ "Try Again" (cao 44, padding 16, 14/600, viền foreground, hover đảo đen). Bấm: gửi lại đúng lựa chọn đã lỗi.
   - Focus: ở lại radio đã khôi phục (alert tự đọc). Lỗi mất khi đổi lựa chọn thành công.
5. Kết quả là hết hàng hoặc không tồn tại: không phải lỗi. Nút "Sold Out" / "Unavailable" disabled, dòng tồn "Sold out" / "Unavailable", câu gợi ý "This combination is unavailable. Choose another size or color." (product.md §11 B) nối `aria-describedby`.
6. Combined listing: giá trị có `value.product_url` khác sản phẩm hiện tại thì điều hướng sang URL đó (PDP) / tải quickview sản phẩm đó (quickview), không fetch biến thể.

URL: PDP `history.replaceState` `?variant=<id>`; quickview không đổi URL trang nền, chỉ đổi `href` "View Detail" sang `?variant=<id>` (sổ 10/11 M4).

## 7. Accessibility

Tương phản (số theo foundation §2, product.md §13):

| Cặp | Tỉ lệ | Dùng |
| --- | --- | --- |
| foreground / background | 17.4 | chữ pill còn hàng, gạch chéo swatch |
| background / foreground | 17.4 | pill đang chọn |
| muted / background | 8.45 | chữ hết hàng, không tồn tại, giá trị trong legend, "Checking availability…" |
| muted-light / background | 5.33 | viền đứt không tồn tại, viền "+N" (1.4.11) |
| viền lõi swatch 50% / background | 3.36 | mép swatch (1.4.11) |
| foreground / alt | 15.8 | chữ "+N", "Show Fewer" |
| sale / background | 6.38 | câu lỗi tải, icon |
| accent / background | 5.01 | focus |

- Vùng chạm: pill, swatch, "+N", "Show Fewer", "Try Again" ≥ 44 mọi mốc; gap 8 (target-size 24 đạt).
- Bàn phím: Tab vào nhóm tới radio đang chọn (luôn hiện); ←/→ đổi giá trị (radio bỏ qua giá trị `hidden`); Tab tiếp tới "+N". Mỗi lần mũi tên là một `change`, request trước bị huỷ.
- Tên: fieldset có legend; swatch có tên giá trị trong label; hậu tố ẩn ", sold out" / ", unavailable"; "+N" và "Show Fewer" có `aria-expanded`, `aria-controls`.
- Live region: 1 `role="status"` (đang tải, xong) + 1 `role="alert"` (lỗi) mỗi ngữ cảnh; quickview dùng tiền tố id `qv-` (tránh trùng id khi mở quickview trên PDP cùng sản phẩm).
- Không chỉ màu: gạch, viền đứt, chữ ẩn, nhãn nút, dòng tồn.
- Giảm chuyển động: tắt shimmer, spinner quay chậm (1.5s) hoặc thay bằng chữ status.

## 8. Lighthouse

- HTML không chứa JSON hay `<option>` của mọi biến thể; trang 150–2048 biến thể không phình DOM theo số biến thể (DOM = tổng số giá trị option, vd 40 + 2 + 2 radio). TBT không tăng.
- Mỗi lần đổi chỉ tải 1 partial; ảnh swatch `loading="lazy"`, `width/height` 36, srcset 1x/2x (36/72).
- CLS: thu gọn in sẵn từ Liquid (không thu bằng JS sau khi tải); skeleton giá cùng chiều cao; nút giữ bề rộng; mở "+N" là thao tác người dùng (không tính CLS).
- Không phải ứng viên LCP. Chữ nhỏ nhất 14.

## 9. Chỉ báo trên card (không phải bộ chọn)

Card sản phẩm không có bộ chọn riêng; nút "Quick View" mở bộ chọn này trong quickview (mini-cart-quickview.md §4, M1). Chỉ báo màu trên card theo foundation §9 (swatch 32 × 16 cách 4, `aria-hidden`, không bấm, số màu đọc trong tên link):
- Dữ liệu: `option.values` của option đầu tiên có swatch ở mọi giá trị (cùng luật §3.2), không lặp biến thể. Không có option như vậy thì không in chỉ báo.
- ĐỀ XUẤT ≤ 4 giá trị hiện hết; > 4 giá trị hiện 3 + chữ "+N" 14 `--color-muted` (`.swatch-more` kit) vì card 360 chỉ rộng 152 (4 × 36 = 144). Edge "Apparel More Variants" 7 màu: 3 swatch + "+4". Tên link card: "{title}, 7 colors". Nguồn: foundation §9 (kích thước card), 06 §1. Câu CTO 2.
- Giá trị hết hàng trên card: không gạch (chỉ báo, không phải trạng thái theo lựa chọn); hết hàng toàn bộ đã có badge Sold out.

## 10. Chuỗi (Dev FE thêm vào `locales/en.default.json`)

Nhãn nút Title Case (sổ 07/11, như "Add To Cart"); chữ trạng thái, câu sentence case.

| Key | Chuỗi |
| --- | --- |
| `products.variant.sold_out_suffix` | ", sold out" |
| `products.variant.unavailable_suffix` | ", unavailable" |
| `products.variant.show_more` | "+{{ count }}" (hiện) + `products.variant.show_more_hidden` " more {{ option }} options" (ẩn) |
| `products.variant.show_fewer` | "Show Fewer" (+ ẩn " {{ option }} options") |
| `products.variant.checking` | "Checking availability…" |
| `products.variant.loading_value` | "Loading {{ value }}…" |
| `products.variant.loaded` | "{{ value }}, {{ price }}, {{ availability }}" |
| `products.variant.load_error` | "Couldn't load {{ value }}. Check your connection." |
| `general.try_again` | "Try Again" |
| `products.product.sold_out` (nút) | "Sold Out" |
| `products.product.unavailable` (nút) | "Unavailable" |
| `products.product.choose_options` (sticky bar) | "Choose Options" |
| `products.product.combination_unavailable` | "This combination is unavailable. Choose another size or color." |

## 11. Settings merchant

Không có setting cho bộ chọn. Ngưỡng 10 / 7 là hằng (sổ M5). Swatch do merchant gán trong admin Shopify (dữ liệu, không phải setting theme). Bỏ setting "Options with many values" của product.md vòng 3b.

## 12. Bàn giao Dev

Snippet chung: `snippets/product-variant-picker.liquid` (đã có), dùng cho PDP và quickview; tham số thêm `id_prefix` (rỗng / `qv-`). Tách ticket theo `.claude/rules/fe-be-boundary.md`.

FE (Liquid, CSS):
- Lặp `product.options_with_values` / `option.values`; class trạng thái theo `value.available`, `value.exists`, `value.selected`; `data-option-value-id`, `data-variant-id` (khi có `value.variant`), `data-product-url` (khi khác sản phẩm hiện tại).
- Thu gọn: `option.values.size > 10` → lưới, `hidden` từ giá trị thứ 8, thay ô 7 khi giá trị chọn ở sau; nút "+N".
- Legend in giá trị đang chọn; swatch theo §3.2; vùng alert rỗng dưới mỗi nhóm.
- `data-testid`: giữ `product-variant-picker`, `product-option`, `product-option-value`; thêm `product-option-more`, `product-option-error`.

BE (JS):
- `change` → gom id giá trị đang chọn (≤ 3) → fetch URL sản phẩm kèm `option_values=id1,id2,id3` + partial của ngữ cảnh (PDP: product.md §17; quickview: partial `quick-view`) → áp partial; `AbortController`; khôi phục khi lỗi; giữ focus và trạng thái mở "+N"; `replaceState` chỉ ở PDP.
- "+N" / "Show Fewer": bật `hidden`, `aria-expanded`, chuyển focus §5.

Lệch code hiện tại (`snippets/product-variant-picker.liquid`):

| Code | Spec | Ghi chú |
| --- | --- | --- |
| `{% render 'variant-json' %}` in JSON biến thể | bỏ, fetch theo option value | trái sổ 10/11 (2048) |
| `checked` so `current_variant.options[i] == value.name` | `value.selected` | đúng cả khi > 250 biến thể |
| chỉ `data-available` | class/thuộc tính 3 trạng thái (`value.exists`) + hậu tố ẩn | §4 |
| legend chỉ tên option | "Tên: giá trị đang chọn" | §3 |
| radio `value="{{ value.name }}"` | `value.id` + `data-option-value-id` | §2 |
| không thu gọn | > 10 hiện 7 + "+N" | sổ M5 |
| swatch ảnh `width: 88` | 36 / 72 (srcset) | §8 |

## 13. Quyết định CTO cần chốt

1. Add To Cart lúc đang tải biến thể giữ màu primary, `aria-disabled`, không spinner (spinner trên nút chỉ cho "đang thêm giỏ")? Đề xuất: có (§6).
2. Chỉ báo màu trên card: ≤ 4 giá trị hiện hết, > 4 hiện 3 + "+N"? Đề xuất: có (§9, card 152 ở 360).
3. Option có swatch thiếu ở vài giá trị thì cả option hiện pill chữ? Đề xuất: có (§3.2, nhất quán trong nhóm).

## 14. Đề xuất sửa file ngoài phạm vi ES1-T284

- `docs/ui-spec/foundation.md` §9: trỏ chỉ báo swatch card về variant-picker.md §9 (giới hạn 3 + "+N").
- `docs/ui-spec/foundation.md` §21 map code: thêm hàng bộ chọn biến thể → variant-picker.md.
- `drafts/designer/_kit/kit.css`: gom CSS bộ chọn (`.opt*`, `.opt--more`, `.stock--busy`, `.button.is-pending`) đang chép giống nhau trong 2 mockup vào kit.
