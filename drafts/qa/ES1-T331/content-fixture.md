KHÔNG CHẮC: (1) nơi Shopify lưu setting static block của `templates/index.liquid` khi sửa bằng editor CHƯA đo trên store: phiên QA không chạy được shopify CLI (sandbox chặn ghi `~/Library/Preferences/shopify-cli-theme-conf-nodejs`, chạy ngoài sandbox bị từ chối). Thủ tục đo ở mục 2, giao DevOps ES1-T428. Fixture viết theo dạng dùng được cho cả 3 nhánh kết quả. (2) Tên file logo, favicon, ảnh newsletter trên Content > Files chưa có trong repo (để `null`, ES1-T178 điền). (3) Id setting nhãn nút newsletter chỉ có sau ES1-T304 (`pending_settings`). (4) Trước khi ES1-T304 merge, `templates/index.liquid` còn tự nhúng nội dung demo, nên store dev hiện "giống như đã áp fixture" kể cả khi chưa áp; spec chỉ phân biệt được sau ES1-T304.

# ES1-T331 (TE-17-R2-QA0): fixture nội dung Figma cho store dev, nơi lưu setting static block

Nguồn: ticket ES1-T331; `drafts/techlead/ES1-T307/task-split.md` D10, §6.3; ADR 0011 mục 2, 3, 5; `docs/srs.md#TE-17` (AC-H1..H5), TE-12 (AC-H18, AC-H19), TE-1 (AC-H28), TE-10 AC3; `drafts/ba/ES1-T173/home-content.md` mục 2, 3; AGENTS.md "Composition model", "The block tag".

Đầu ra:
- Fixture: `tests/fixtures/home-figma.json` (QA quản lý, ADR 0011 mục 5).
- Helper cho spec khác: `tests/e2e/support/home-fixture.ts` (`skipUnlessFixture`, `missingMarkers`).
- Spec: `tests/e2e/ES1-T331.spec.ts`; test case: `drafts/qa/ES1-T331/test-cases.md`.
- Công cụ: `drafts/qa/ES1-T331/tools/schema_dump.py` (in setting schema), `tools/static.config.ts` (chạy nhóm tĩnh không cần store).

## 1. Kết quả spike: những gì đã biết, chưa biết

Đã biết (từ repo, AGENTS.md):
- Thẻ `{% block 'x', id: 'y', param: v %}`: tham số trùng id setting trong schema thì gán `block.settings.<id>`; `block.settings` "also reflects what the merchant set in the editor" (AGENTS.md dòng 122). Tức là editor lưu được, nhưng AGENTS.md không nói lưu ở đâu.
- "Static blocks of one type without an id share one set of settings" (AGENTS.md dòng 88). Khoá lưu theo type + id, không theo template.
- `config/settings_data.json` của repo hiện chỉ có `current` (5 setting toàn cục), không có khoá nào cho block.
- `scripts/diff-settings.sh` chỉ so `config/settings_data.json`; nếu editor ghi vào template thì script này không thấy.
- Block trang chủ dùng chung type + id với template khác (rò setting nếu khoá là type + id toàn theme):

| Block | Id | Template khác dùng cùng khoá |
| --- | --- | --- |
| slideshow | (không id) | index.figma, index.te7 |
| rich-text | (không id) | index.figma, index.te15 |
| collection-list | (không id) | index.figma |
| shop-by-level | (không id) | index.figma |
| testimonials | (không id) | index.figma |
| faq | (không id) | index.figma |
| featured-product | featured-product | product.featured-product |

  Rủi ro: áp fixture cho `featured-product` trên `/` đổi luôn `product.featured-product` (spec ES1-T158 dùng), áp `rich-text` đổi `index.te15`. Bước S5 đo việc này. Nếu rò thật: FE thêm `id` riêng cho 6 block không id trên `templates/index.liquid` và đổi id `featured-product` (ticket cho FE sau S5, không tạo trước khi có số đo).

Chưa biết, 3 nhánh có thể:

| Nhánh | Dấu hiệu sau S3–S4 | Cách áp fixture | Ảnh hưởng CI |
| --- | --- | --- | --- |
| template-params | `templates/index.liquid` trên store đổi, thẻ `{% block %}` có thêm tham số | Bản vá template sinh từ fixture, chỉ push lên theme store dev, không vào repo | `preview-push.sh` push từ repo sẽ xoá fixture: phải áp lại sau mỗi push (DevOps nối bước, ES1-T177) |
| settings-data | `config/settings_data.json` có khoá mới cho block (theo template/type/id) | Merge `blocks[].settings` vào `settings_data.json` của theme store dev rồi push riêng file | Như trên: push từ repo ghi đè `settings_data.json`, phải merge lại sau push |
| server-only | `theme pull` không thấy file nào đổi nhưng storefront hiện giá trị mới | Áp tay theo checklist mục 4 trong editor (hoặc Admin API nếu có), mỗi theme preview mới áp lại | Không tự động được; Tech Lead sửa ADR 0011 mục 2 (dòng KHÔNG CHẮC của ADR) |

Khi có kết quả: QA đổi `storage.status` trong fixture, ghi nhánh vào task-split (Tech Lead, theo impact.md dòng 83).

## 2. Thủ tục đo trên store (ES1-T428, DevOps + người thao tác editor)

Store `hoa-qua-nhap-khau.myshopify.com` duy nhất. Không `--live`, không publish, không đụng theme live.

- S1. Push develop lên theme unpublished `ai-ES1-T331-spike` bằng `scripts/preview-push.sh ai-ES1-T331-spike`. Ghi theme id.
- S2. `shopify theme pull --theme <id> --path <A>` (toàn bộ theme, không `--only`).
- S3. Trong editor của theme đó, trang Home: sửa đúng 4 setting rồi Save:
  - `slideshow-slide` id `slide-1`: eyebrow = `S3-EYEBROW` (có id).
  - `rich-text` (không id): heading = `S3-RICH`.
  - `featured-product` id `featured-product`: eyebrow = `S3-FEATURED`.
  - `bundle-builder` id `bundle-builder`: tier_1_percent = 7 (range).
- S4. `shopify theme pull --theme <id> --path <B>`; chạy `diff -r <A> <B>` và `scripts/diff-settings.sh <A> <B>`. Ghi tên mọi file đổi và đoạn diff.
- S5. Mở preview: `/`, `/?view=te15`, `/?view=te7`, một sản phẩm với `?view=featured-product`. Ghi trang nào hiện `S3-RICH`, `S3-FEATURED`, `S3-EYEBROW`.
- S6. Push lại develop đè lên cùng theme (`preview-push.sh ai-ES1-T331-spike`), mở `/`: 4 giá trị S3 còn hay mất.
- S7. Nhánh template-params hoặc settings-data: push file đã pull ở B (chỉ file đổi) lên theme, mở `/`: 4 giá trị S3 hiện lại không. Đây là cách áp fixture tự động.

Kết luận theo bảng mục 1. Xong thì xoá theme spike theo quy trình DevOps (người xoá).

## 3. Fixture: nơi lưu, định dạng, ai sửa

- `tests/fixtures/home-figma.json`, 1 file, QA sửa. Không chép giá trị vào `templates/`, `locales/`, `config/settings_data.json` của repo (ADR 0011 mục 2–5). Spec TC-05 kiểm `templates/index.liquid` không còn handle fixture (chạy khi ES1-T304 merge).
- `theme_settings`: setting toàn cục (logo, favicon, social, free_shipping_threshold = 99 cho câu FAQ "$99").
- `store_data`: dữ liệu ngoài theme (menu, 14 collection, metafield P15, 4 discount, blog). Sản phẩm P01–P24 và tag quiz tham chiếu `home-content.md` mục 3.2, 3.4, không chép lại.
- `blocks[]`: mỗi phần tử = 1 static block theo `scope` (`template:index`, `layout:theme`), `type`, `id` (null = block không id), `settings` (chỉ id có trong schema, TC-01 kiểm), `template_params` (tham số không phải setting: `layout`, `preselect`, `open`, `hide_options`; giữ ở template, không áp qua editor), `pending_settings` (chờ ES1-T304), `markers` (testid + chữ để spec nhận biết đã áp).
- Định dạng giá trị theo kiểu setting: `image_picker` = `shopify://shop_images/<file>`, `collection`/`product`/`blog`/`link_list` = handle, `url` = đường dẫn tương đối, `richtext` = HTML.
- `rows`: 16 hàng inventory → testid (`header`, 14 `container-home-*`, `footer`).
- `fresh_install`: chuỗi, href, testid không được có trên theme không fixture.

Thứ tự áp: (1) `store_data` (đã có từ ES1-T178, ES1-T298; kiểm lại 4 discount), (2) `theme_settings`, (3) `blocks[]`, (4) đặt lại `custom.sale_ends_at` của P15 = giờ hiện tại + 23 giờ ngay trước khi đo AC-H23.

## 4. Danh sách cấu hình theo AC

| AC | Cần trên store dev | Trong fixture | Spec đo |
| --- | --- | --- | --- |
| AC-H1 | 16 hàng có nội dung: mọi block có resource (collection, product, blog, ảnh) | `rows`, mọi `blocks[].settings` kiểu resource | ES1-T331 TC-10; ES1-T176, TE-17-R2-QA1 |
| AC-H2 | Chữ từng node theo `home-content.md` mục 2; giá P01–P22; metafield spec_1–4, rating P01, P03, P15 | `blocks[].settings` kiểu text, `store_data.metafields` | ES1-T176 (so copy); ES1-T331 TC-11 (marker) |
| AC-H3 | Như AC-H1 + ảnh `efx-*` đúng vị trí | `blocks[].settings` image_picker | ES1-T176 (1920), TE-17-R2-QA1/QA2 (đo khối) |
| AC-H4 | Như AC-H3 (style đo trên khối có nội dung) | như trên | ES1-T176 |
| AC-H5 | "Trusted by 10,000+ athletes" hàng 2, "360+" hàng 15, không "Add a", "Customer name" | `slide-1.eyebrow`, `faq.stat_1_value` | ES1-T331 TC-11, TC-12 (nojs); TC-20 kiểm ngược |
| AC-H18 | Bậc 2 món 10%, 3 món 15%; discount tự động `figma-bundle-tier-2`, `-3`; `figma-bundle` ≥ 3 sản phẩm còn hàng | `bundle-builder.tier_*`, `store_data.discounts` | ES1-T331 TC-04, TC-13 |
| AC-H19 | "Fits: 2.4×2.0 m"; bậc 4 món 10%; discount `figma-setup`; 4 row P05–P08 còn hàng | `shop-the-look.*`, `look-row-1..4`, `store_data.discounts` | ES1-T331 TC-04, TC-14 |
| AC-H28 | Logo footer, mô tả, ảnh newsletter, heading "Get 15% Off Your First Order", nút "Get 15% Off", "No spam. Unsubscribe anytime."; mã WELCOME15 | `footer.*`, `pending_settings.newsletter_button_label`, `store_data.discounts[WELCOME15]` | ES1-T331 TC-15; ES1-T176 hàng 16 |
| TE-10 AC3 / D10 | Theme không fixture: không claim, không bậc giảm, không handle demo | `fresh_install` | ES1-T331 TC-20 |

Ngoài phạm vi fixture (không cấu hình ở đây): AC-H23 countdown chỉ ghi metafield; Verified tắt (E9); 3 ô số liệu video (Q5) để trống.

## 5. Theme mới cài, kiểm ngược (D10)

- Theme: push repo lên theme unpublished riêng (ví dụ `ai-fresh-develop`), không áp fixture, không mở editor. Truyền id vào spec bằng `FRESH_THEME_ID`.
- Nhánh template-params hoặc settings-data: theme push từ repo là "mới cài" đúng nghĩa. Nhánh server-only: theme mới tạo cũng chưa có setting, vẫn dùng được.
- TC-20 đo ở 360, 768, 1280, 1920: 0 chuỗi trong `forbidden_text`, 0 href `/collections/figma-`, `/products/figma-`, `/blogs/figma-`, 0 dòng giảm bundle/shop the look, 0 Verified, 0 countdown.
- Chỉ có ý nghĩa sau ES1-T304; trước đó TC-20 đỏ là đúng (template còn nhúng demo), nên CI không đặt `FRESH_THEME_ID` tới khi ES1-T304 merge.

## 6. Việc liên quan

- DevOps ES1-T428: chạy mục 2. Sau đó, nếu tự động được: thêm bước áp fixture sau `preview-push.sh` (impact.md dòng 78, ES1-T177).
- ES1-T176: hàng 1 `imageReportOnly.closedBy = TE-17-R2-QA0` gỡ khi fixture áp xong và CTO chốt ngưỡng (ES1-T300 triage #3); dùng `skipUnlessFixture` thay cho `/?view=figma` khi `index.figma.liquid` bỏ (ADR 0011 mục 6 loại khỏi gói).
- TE-17-R2-QA1, QA2: gọi `skipUnlessFixture(page)` sau `gotoStore(page, '/')`.
- ES1-T178: điền tên file logo, favicon, ảnh newsletter vào `theme_settings.logo`, `header.logo`, `footer.logo`, `footer.newsletter_image`.
