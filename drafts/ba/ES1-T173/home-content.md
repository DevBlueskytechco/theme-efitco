KHÔNG CHẮC: (0) `docs/srs.md` CHƯA SỬA: hook `scope-guard.sh` chặn BA ghi file này, chỉ cho `docs/srs-draft/`, `drafts/ba/`. Bản đầy đủ ở `drafts/ba/ES1-T173/srs.md`, chép đè `docs/srs.md` là xong; DoD "35/35 AC-H có trong docs/srs.md" chỉ đạt sau bước đó. (1) vague_words.py, traceability.py chưa chạy: phiên không có Bash, `../ai-team/` bị từ chối đọc; đã kiểm tay (mục 6). (2) Không chạy được script parse JSON: cây node đọc bằng luồng token từ Grep, kiểm tay (mục 1). (3) Quiz bước 2, 3 chưa có copy trong Figma, chờ ES1-T174. (4) Figma không có file video, thân bài blog, đích link, cấp 2 của menu, hex swatch: ghi rõ từng dòng. (5) Phân bổ sản phẩm vào collection, trừ `figma-tab-all` và `figma-bundle`, và tag quiz là đề xuất, Figma không có. (6) 2 câu hỏi có mặc định, không chặn: ES1-T198 (Designer), ES1-T199 (CTO). (7) Chưa đọc được `created.md` của ES1-T170 (nhánh khác): cột ticket ở mục 5 lấy từ tiêu đề ticket.

# ES1-T173: bảng nội dung trang chủ theo node đang hiện trong Figma

BA, 06/11/2026. Đầu vào chung của mặc định theme (FE), dữ liệu store (ES1-T178), so copy (ES1-T176, ES1-T196).
Nguồn: `docs/figma/snapshot-1-359.json` (lấy 30/10), 17 ảnh `docs/figma/img/*.png`, plan ES1-T169, ES1-T168 mục 1.3, 2.2, 2.3, 2.4, ES1-T167 mục 2, 3, 4. CTO 06/11 đã duyệt 10 CR, 9 ngoại lệ, mặc định Q1–Q6 của ES1-T168.

Loại dòng:
- `copy`: mặc định của theme, merchant mới cài thấy.
- `store`: dữ liệu store, nhập ở ES1-T178. So copy sau khi nhập.
- `ảnh`: tài nguyên ảnh hoặc SVG, xuất ở ES1-T174. Merchant mới cài không có sẵn (ES1-T167 Q2).
- `động`: giá trị tính từ dữ liệu thật, che khi so.

Cờ ở cột Ghi chú:
- `TT`: Figma lưu chữ thường, ảnh hiện hoa. So sau `text-transform` (AC-H2).
- `XN`: giữ nguyên văn lỗi copy theo Q3 của ES1-T168, Designer xác nhận ở ES1-T198.
- `E<n>`: ngoại lệ đã ký. E1–E9 theo ES1-T167 mục 2.4; E10, E11 và E7 mở rộng theo Q6 của ES1-T168.

Cột khoá: đề xuất. Theo D1 của plan, block 1 lần (rich-text, featured-collection, quiz, bundle-builder, featured-product) đưa giá trị vào `default` của schema, khoá chỉ dùng nếu đi qua locale. Block lặp (faq-item, testimonial-item, quiz-step, image-with-text, slideshow-slide, video-card) đọc khoá qua `| t` ở template. `có sẵn` = khoá đã có trong `locales/en.default.json` đúng giá trị; `đổi` = khoá đã có, giá trị phải đổi.

## 1. Cách kiểm 0 chuỗi từ node ẩn

Cách làm: Grep `-o` trên snapshot, ra luồng token theo thứ tự cây: `id + name + visible + type`, `characters`, `imageRef`, mở `"children":[`, đóng `}],"blendMode"`. Đọc đủ khoảng 3 030 dòng token. Với mỗi node `visible:false`, theo cặp mở, đóng để xác định node con. Sau đó đối chiếu 17 ảnh export; lệch thì ảnh thắng.

Text bị loại vì bản thân ẩn hoặc có node cha ẩn. Toàn bộ không vào mục 2, 3:

| Node | Chuỗi | Vì sao |
| --- | --- | --- |
| 1:391, 1:393 | "Level  Fitness", "Intermediate " | Cha 1:389 ẩn (card thừa) |
| I1:50x;4733:5198, I1:589, 596, 603, 610, 651, 663, 675, 688, 700, 712, 849, 856, 863, 870, 877, 884, 918, 943, 967, 991 `;...:5198` | "$189.99" | Bản thân ẩn |
| I1:502–505;4733:5190;424:1022, I1:588, 595, 602, 609, 653, 665, 677, 690, 702, 714 `;424:1022` | "+ 2 Colors" | Bản thân ẩn |
| I1:50x;4733:5191;... (4 card hàng 5) | "Dumbbells Set 24kg Selectable Weights", "$189.99", "$237.00" | Cha Des ẩn |
| I1:654, 666, 678, 691, 703, 715 (hàng 9) | Như trên | Cha 1:652, 664, 676, 689, 701, 713 ẩn |
| I1:503;4733:5409;377:1184, I1:505;4733:5409;377:1184 | "5.0" | Cha Review ẩn: chỉ card 1, 3 có rating |
| I1:650, 662, 674, 687, 699, 711 `;377:1173` | "-25%" | Cha Lable ẩn |
| 1:826 | "View Preset Bundles" | Bản thân ẩn (hàng 11; 1:641 hàng 9 vẫn hiện) |
| 1:830–1:837 | "360+", "How-to reels", "1:15", "Average length", "4K", "Shot in studio" | Cha 1:827 ẩn |
| 1:838 | "Short vertical demos. See it move before you buy." | Cha 1:827 ẩn. ES1-T168 chưa nêu chuỗi này |
| I1:844;4687:4399 | "Dumbbells" | Cha 1:844 ẩn |
| 1:888, 1:890 | "Catalog" | Bản thân ẩn |
| 1:912, 1:937, 1:961, 1:985 | "(5.0)" | Bản thân ẩn |
| 1:1001, 1:1004, 1:1007 | "Uncompromising Quality", "Rigorous Testing & Innovation", "Designed For Athletes" | Cha 1:999, 1:1002, 1:1005 ẩn |
| 1:1073, 1:1079, 1:1085, 1:1091 | Câu trả lời FAQ 2–5 | Bản thân ẩn (trạng thái đóng). Xem hàng 15 |
| 1:1169 | "Equip" | Bản thân ẩn |

Phát hiện khác ES1-T168 và inventory:
- ES1-T168 1.3 #15 ghi "5 câu FAQ cùng 1 câu trả lời". Chính xác hơn: chỉ 1:1067 hiện, 4 node còn lại ẩn. Câu đóng vẫn cần nội dung để mở được, nên dùng lại đúng chuỗi của 1:1067 theo mặc định Q3; không so ở trạng thái đóng.
- Inventory hàng 5 ghi "+ 2 Colors": node này ẩn, ảnh chỉ có 3 swatch.
- Inventory hàng 13 ghi 3 USP: ẩn (ES1-T174 sửa inventory).
- Nhiều bản ghi `visible:false` khác là fill ảnh, không phải node: không dùng để suy ra ẩn hiện.

## 2. Bảng nội dung theo hàng

### Hàng 1: Header 1:362

| Node | Loại | Giá trị | Khoá đề xuất | Ghi chú |
| --- | --- | --- | --- | --- |
| I1:366;2963:2083;1327:1245 | store | Shop | | Menu `main-menu`, có cấp 2 (chevron) |
| I1:367;2963:2083;1327:1245 | store | Collection | | Có cấp 2 (chevron) |
| I1:368;3158:1874;1327:1245 | store | Sale | | |
| I1:369;3158:1874;1327:1245 | store | Our Story | | |
| I1:370;3158:1874;1327:1245 | store | Blog | | |
| I1:371;3158:1874;1327:1245 | store | Contact | | |
| I1:372;3158:1874;1327:1245 | store | Help | | |
| 1:377 | ảnh | Logo Efitco (vector) | | Tải lên, chọn trong editor |

### Hàng 2: Slideshow 1:422, 1:437

2 slide cùng copy, khác ảnh. Dòng của slide 2 dùng chung khoá.

| Node | Loại | Giá trị | Khoá đề xuất | Ghi chú |
| --- | --- | --- | --- | --- |
| 1:429, 1:444 | copy | Trusted by 10,000+ athletes | blocks.slideshow_slide.default_eyebrow | TT |
| 1:431, 1:446 | copy | Level Up⏎Your Fitness | blocks.slideshow_slide.default_heading_html | TT; xuống dòng cố định |
| 1:432, 1:447 | copy | Upgrade your journey with Efitco gear made for every workout. | blocks.slideshow_slide.default_text | |
| I1:433;377:1333, I1:448;377:1333 | copy | Explore Equipment | blocks.slideshow_slide.default_button_label | Có icon mũi tên |
| 1:423–1:426 | ảnh | Ảnh slide 1 | | Designer chọn lớp ảnh |
| 1:438–1:441 | ảnh | Ảnh slide 2 | | |

### Hàng 3: Collection list 1:395

| Node | Loại | Giá trị | Khoá đề xuất | Ghi chú |
| --- | --- | --- | --- | --- |
| 1:397 | copy | Browse Categories | blocks.collection_list.default_heading | |
| 1:405 | store | Free Weights | | figma-cat-free-weights |
| 1:408 | store | Functional Training | | figma-cat-functional-training |
| 1:411 | store | Benches & Racks | | figma-cat-benches-racks |
| 1:414 | store | Recovery & Mobility | | figma-cat-recovery-mobility |
| 1:417 | store | Accessories | | figma-cat-accessories |
| 1:404, 1:407, 1:410, 1:413, 1:416 | ảnh | Ảnh 5 collection | | Ảnh collection trên store |

### Hàng 4a: Rich text 1:454

| Node | Loại | Giá trị | Khoá đề xuất | Ghi chú |
| --- | --- | --- | --- | --- |
| 1:457 | copy | Everything You Need [ảnh] to Train. | blocks.rich_text.default_heading | TT. Snapshot dùng 17 dấu cách giữ chỗ ảnh inline; xuống dòng sau "You" theo ảnh. So copy bỏ khoảng trắng thừa |
| 1:460 | copy | Versatile equipment for home training - strength, mobility, endurance, at every level. | blocks.rich_text.default_text | |
| 1:462 | copy | Become A Member | blocks.rich_text.default_button_label | Có icon mũi tên |
| 1:455 | ảnh | Ảnh inline trong heading | | |

### Hàng 4b: Shop by level 1:464

| Node | Loại | Giá trị | Khoá đề xuất | Ghi chú |
| --- | --- | --- | --- | --- |
| 1:466 | copy | SHOP BY LEVEL | blocks.shop_by_level.default_eyebrow | |
| 1:467 | copy | Choose Your Training Level | blocks.shop_by_level.default_heading | |
| 1:472, 1:480, 1:486 | copy | Level  Fitness | blocks.level_card.default_label | TT, XN: 2 dấu cách |
| 1:473 | store | Beginner | | figma-level-beginner |
| 1:482 | store | Intermediate | | figma-level-intermediate. Snapshot có dấu cách cuối, XN |
| 1:488 | store | Advanced | | figma-level-advanced |
| 1:476 | động | 24 Products | blocks.level_card.products_count (one, other) | `products_count` thật. Chỉ card 1 có node này, xem ES1-T198 #2 |
| 1:469, 1:478, 1:484 | ảnh | Ảnh 3 card | | Ảnh fill trên frame |

### Hàng 5: Featured collection 1:490

| Node | Loại | Giá trị | Khoá đề xuất | Ghi chú |
| --- | --- | --- | --- | --- |
| 1:494 | copy | BESTSELLERS | blocks.featured_collection.default_eyebrow | |
| 1:495 | copy | What People Are Buying? | blocks.featured_collection.default_heading | |
| I1:497;377:1123 | store | All | | figma-tab-all |
| I1:498;697:753 | store | Weight | | figma-tab-weight |
| I1:499;697:753 | store | Portable Fitness | | figma-tab-portable-fitness |
| I1:500;697:753 | store | Accessories | | figma-tab-accessories |
| I1:502;4733:5209;4733:5197 | store | Ativafit Lava 66 lb Adjustable | | P01 |
| I1:502;4733:5209;4733:5199;424:1061, :1062 | store | $379.99, $499.99 | | P01 |
| I1:502;4733:5184;377:1173 | động | -25% | products.card.sale_percent (có sẵn) | Tính thật ra -24%, ES1-T199 #1 |
| I1:502;4733:5409;377:1184 | store | 5.0 | | P01, metafield rating |
| I1:503;4733:5209;4733:5197 | store | Iron Core Kettlebell 16 kg | | P02 |
| I1:503;4733:5209;4733:5199;424:1059 | store | $119.00 | | P02 |
| I1:503;4733:5184;377:1171 | copy | New | products.card.new | Quy tắc, màu: ES1-T174 |
| I1:504;4733:5209;4733:5197 | store | FlexFold Adjustable Bench | | P03 |
| I1:504;4733:5209;4733:5199;424:1061, :1062 | store | $189.99, $229.00 | | P03 |
| I1:504;4733:5184;377:1173 | động | -25% | products.card.sale_percent (có sẵn) | Tính thật ra -17%, ES1-T199 #1 |
| I1:504;4733:5409;377:1184 | store | 5.0 | | P03, metafield rating |
| I1:505;4733:5209;4733:5197 | store | Revllen Pro Speed Rope | | P04 |
| I1:505;4733:5209;4733:5199;424:1061, :1062 | store | $34.99, $44.99 | | P04 |
| I1:505;4733:5184;377:1173 | động | -25% | products.card.sale_percent (có sẵn) | Tính thật ra -22%, ES1-T199 #1 |
| 1:502–1:505 | ảnh | Ảnh 4 sản phẩm, 3 swatch mỗi card | | Ảnh P03 trong Figma là dây thừng, giữ theo ảnh export |

### Hàng 6: Quiz 1:506

| Node | Loại | Giá trị | Khoá đề xuất | Ghi chú |
| --- | --- | --- | --- | --- |
| 1:513 | copy | Our most-loved feature | blocks.quiz.default_eyebrow | |
| 1:514 | copy | Find Your Perfect Gear | blocks.quiz.default_heading | |
| 1:515 | copy | Two questions. One shortlist. | blocks.quiz.default_text | XN: mâu thuẫn "Step 1 of 3". Giữ theo CR-10 |
| 1:519 | copy | 20 seconds | blocks.quiz.default_note_1 | |
| 1:523 | copy | No sign-up required | blocks.quiz.default_note_2 | |
| 1:528 | động | Step 1 of 3 | blocks.quiz_step.progress (có sẵn) | |
| 1:531 | copy | Where do you want to focus? | blocks.quiz_step.s1_question | |
| 1:532 | copy | Tap the body map or pick from the list. | blocks.quiz_step.s1_hint | Đúng chức năng nhờ AC-H17 |
| 1:541 | copy | Upper body | blocks.quiz_step.s1_option_1_label | |
| 1:542 | copy | Shoulders, arms, chest | blocks.quiz_step.s1_option_1_text | |
| 1:549 | copy | Core | blocks.quiz_step.s1_option_2_label | |
| 1:550 | copy | Abs, stability, balance | blocks.quiz_step.s1_option_2_text | |
| 1:557 | copy | Lower body | blocks.quiz_step.s1_option_3_label | |
| 1:558 | copy | Legs, glutes, calves | blocks.quiz_step.s1_option_3_text | |
| 1:534 | ảnh | Body map | | |
| 1:539, 1:547, 1:555 | ảnh | Ảnh 3 lựa chọn | | |
| Không có node | copy | Bước 2, 3 | blocks.quiz_step.s2_*, s3_* | Figma không có. Chờ ES1-T174, không điền ở đây |

### Hàng 7: Shop the look 1:560

| Node | Loại | Giá trị | Khoá đề xuất | Ghi chú |
| --- | --- | --- | --- | --- |
| 1:563 | copy | Shop this setup | blocks.shop_the_look.default_eyebrow | TT |
| 1:564 | copy | A Complete Corner Gym, Itemised | blocks.shop_the_look.default_heading | XN: chính tả Anh Anh, AGENTS.md ghi American English |
| 1:565 | copy | Browse All Setups | blocks.shop_the_look.default_link_label | Đích link không có trong Figma |
| 1:580 | copy | Fits: 2.4×2.0 m | blocks.shop_the_look.default_note_heading | Ảnh thắng; snapshot "2.4x2.0", ES1-T198 #3 |
| 1:581 | copy | Folds flat when you're done. | blocks.shop_the_look.default_note_text | |
| I1:589;4733:5197, I1:589;4733:5199;424:1059 | store | Ativafit Lava 66 lb, $379.99 | | P05 |
| I1:596;4733:5197, I1:596;4733:5199;424:1059 | store | FlexFold Bench, $189.99 | | P06 |
| I1:603;4733:5197, I1:603;4733:5199;424:1059 | store | Compact Power Rack R3, $549.00 | | P07 |
| I1:610;4733:5197, I1:610;4733:5199;424:1059 | store | Training Mat 12 mm, $69.00 | | P08 |
| 1:614 | động | 4 items | blocks.shop_the_look.count (one, other) | |
| 1:615 | động | $1,186.99 | | E10: 4 dòng cộng ra $1,187.98 |
| 1:617 | copy | Setup Discount (10%) | blocks.shop_the_look.discount | %p tính từ bậc, ES1-T199 #2 |
| 1:618 | động | - $118.70 | cart.discount_value (có sẵn, khác định dạng) | E10 |
| 1:621 | copy | Total | blocks.bundle_builder.total (có sẵn) | |
| 1:622 | động | $1,086.29 | | E10: số đúng là $1,069.18 khi tính từ $1,187.98 |
| I1:623;377:1356 | copy | Add Setup To Cart | blocks.shop_the_look.submit | Có icon mũi tên |
| Không có node | copy | Discount applies when an automatic discount is active. | blocks.shop_the_look.discount_note | Đề xuất tiếng Anh cho chốt CTO 11:15, CR-6. Không có trong Figma: loại khỏi so copy, ghi sổ chênh lệch |
| 1:568 | ảnh | Ảnh setup | | |
| 1:586, 1:593, 1:600, 1:607 | ảnh | Ảnh 4 row | | Ảnh Figma lệch tên sản phẩm, giữ theo ảnh export |
| 1:569–1:573 | ảnh | 4 hotspot, 1 có vòng ngoài | | Hình tròn trong Figma, không phải file ảnh. Vị trí đo từ `1-560.png` |

### Hàng 8: Image with text 1:625

| Node | Loại | Giá trị | Khoá đề xuất | Ghi chú |
| --- | --- | --- | --- | --- |
| 1:629 | copy | Make fitness⏎a natural part of your⏎everyday life ! | blocks.image_with_text.banner_heading_html | TT, XN: dấu cách trước "!". "Make" màu đậm riêng (CR-7) |
| 1:630 | copy | Just simple, effective workouts you can do anytime at home | blocks.image_with_text.banner_text | |
| I1:631;377:1356 | copy | Get Started Now | blocks.image_with_text.banner_button_label | Có icon mũi tên |
| 1:633, 1:634, 1:635 | ảnh | 3 ảnh rải | | Nền sand theo ảnh export, 1:624 ẩn |

### Hàng 9: Bundle builder 1:636

| Node | Loại | Giá trị | Khoá đề xuất | Ghi chú |
| --- | --- | --- | --- | --- |
| 1:639 | copy | Build your bundle | blocks.bundle_builder.default_eyebrow | TT |
| 1:640 | copy | Pick Your Kit, Save As You Go | blocks.bundle_builder.default_heading | |
| 1:641 | copy | View Preset Bundles | blocks.bundle_builder.default_link_label | Đích link không có trong Figma |
| I1:651;4733:5197, I1:651;4733:5199;424:1059 | store | Adjustable dumbbell pair, $259.00 | | P09 |
| I1:663;4733:5197, I1:663;4733:5199;424:1059 | store | Foldable bench, $89.00 | | P10 |
| I1:675;4733:5197, I1:675;4733:5199;424:1059 | store | Resistance band set, $45.00 | | P11 |
| I1:688;4733:5197, I1:688;4733:5199;424:1059 | store | Speed rope, $34.00 | | P12 |
| I1:700;4733:5197, I1:700;4733:5199;424:1059 | store | Recovery roller, $52.00 | | P13 |
| I1:712;4733:5197, I1:712;4733:5199;424:1059 | store | Training mat, $69.00 | | P14 |
| 1:720 | copy | Your Bundle | blocks.bundle_builder.panel_title (có sẵn) | |
| I1:721;4687:4399 | động | 3 Items | blocks.bundle_builder.count_other (có sẵn) | E7 |
| 1:725–1:738, I1:726, 729, 732, 735, 738 `;424:1059` | động | 5 dòng panel: Adjustable dumbbell pair $259.00; Training mat $69.00; Recovery roller $52.00 x3 | | E7: dòng theo món khách chọn |
| 1:743 | copy | Subtotal | blocks.bundle_builder.subtotal (có sẵn) | |
| 1:744 | động | $380.00 | | E7 |
| 1:746 | động | Bundle discount (5%) | blocks.bundle_builder.discount (có sẵn) | E7 mở rộng: bậc 5% không tồn tại |
| 1:747 | động | - $19.00 | | E7 |
| 1:753 | động | Add 1 more item to unlock 15% off | blocks.bundle_builder.progress (đổi) | Đang "Add %n more to get %p% off". Khi đổi cần one, other; ca 1 món ra 10% (AC-H18) |
| 1:756 | copy | Total | blocks.bundle_builder.total (có sẵn) | |
| 1:757 | động | $361.00 | | E7 |
| I1:758;377:1356 | copy | Add Bundle To Cart | blocks.bundle_builder.submit (có sẵn) | Có icon mũi tên |
| Không có node | copy | Discount applies when an automatic discount is active. | blocks.bundle_builder.discount_note | Đề xuất tiếng Anh cho chốt CTO 11:15. Không có trong Figma: loại khỏi so copy, ghi sổ chênh lệch |
| 1:649, 1:661, 1:673, 1:686, 1:698, 1:710 | ảnh | Ảnh 6 thẻ | | Ảnh Figma lệch tên sản phẩm, giữ theo ảnh export |

### Hàng 10: Featured product 1:759

| Node | Loại | Giá trị | Khoá đề xuất | Ghi chú |
| --- | --- | --- | --- | --- |
| 1:771 | copy | FEATURED PRODUCT · FREE WEIGHTS | blocks.featured_product.default_eyebrow | |
| 1:772 | store | Ativafit Lava 66 lb Adjustable | | P15 |
| 1:774 | copy | Sale ends in | blocks.featured_product.countdown_label | |
| 1:777, 1:779, 1:781 | động | 22, 36, 28 | | E8. Hạn dưới 24 giờ để hiện 3 ô (AC-H23) |
| I1:784;424:1061, :1062 | store | $379.99, $499.99 | | P15 |
| I1:785;377:1173 | động | -24% | products.card.sale_percent (có sẵn) | Tính thật khớp |
| 1:794 | store | (4.9) | blocks.featured_product.rating_value (có sẵn) | P15 reviews.rating (Q2) |
| 1:796 | store | 341 reviews | blocks.featured_product.rating_count (có sẵn) | P15 reviews.rating_count |
| 1:797 | store | 11 to 66 lb in seconds. One pair replaces a whole rack of fixed dumbbells - and takes up less floor space than a shoebox. No plates to swap, no waiting between sets, just one dial and go. Fifteen pairs of dumbbells living quietly in the corner - and your room stays a room. | | P15 mô tả |
| 1:803 | copy | Weight range | blocks.featured_product.default_spec_1_label | Thứ tự theo ảnh, ES1-T198 #4 |
| 1:804 | store | 11 – 66 lb per hand | | custom.spec_1 |
| 1:809 | copy | Footprint | blocks.featured_product.default_spec_2_label | |
| 1:810 | store | 0.18 m² — fits under a desk | | custom.spec_2 |
| 1:806 | copy | Materials | blocks.featured_product.default_spec_3_label | |
| 1:807 | store | Cast iron core, reinforced rubber | | custom.spec_3 |
| 1:812 | copy | Assembly | blocks.featured_product.default_spec_4_label | |
| 1:813 | store | None — ready out of the box | | custom.spec_4 |
| I1:815;4912:3545 | copy | Add to cart | blocks.product_form.add_to_cart (có sẵn) | E11: Figma "Add To Cart" |
| I1:816;377:1347 | copy | View Detail | blocks.featured_product.view_detail (có sẵn) | Có icon mũi tên |
| 1:761 | ảnh | Dấu tròn: "Feature  Product   -   Efitco  -  " + biểu tượng | | SVG, ES1-T174. Chữ nằm trong SVG, không vào locale |
| 1:760 | ảnh | Ảnh sản phẩm P15 | | Ảnh fill trên frame, theo `1-759.png` |

### Hàng 11: Video carousel 1:817

| Node | Loại | Giá trị | Khoá đề xuất | Ghi chú |
| --- | --- | --- | --- | --- |
| 1:824 | copy | Video demo | blocks.video_carousel.default_eyebrow | TT |
| 1:825 | copy | See Real Equipment In Action, Before You Buy | blocks.video_carousel.default_heading | |
| I1:849;4733:5197, I1:849;4733:5199;424:1061, :1062 | store | Ativafit Lava 66 lb, $379.99, $499.99 | | P16 |
| I1:856;4733:5197, I1:856;4733:5199;424:1059 | store | Compact Power Rack, $549.00 | | P17 |
| I1:863;4733:5197, I1:863;4733:5199;424:1061, :1062 | store | Olympic Plate Set 100, $289.00, $339.00 | | P18 |
| I1:870;4733:5197, I1:870;4733:5199;424:1061, :1062 | store | Home Starter Kit, $399.00, $512.00 | | P19 |
| I1:877;4733:5197, I1:877;4733:5199;424:1059 | store | Recovery Roller Pro, $52.00 | | P20 |
| I1:884;4733:5197, I1:884;4733:5199;424:1059 | store | Resistance Band Set, $45.00 | | P21. Mép ảnh export cắt chữ, lấy từ snapshot |
| 1:842, 1:851, 1:858, 1:865, 1:872, 1:879 | ảnh | 6 poster | | E6: có nút play |
| 1:847, 1:854, 1:861, 1:868, 1:875, 1:882 | ảnh | 6 thumbnail tròn | | Ảnh sản phẩm |
| Không có node | store | 6 file video | | Figma không có, ES1-T199 #3 |

3 ô số liệu: không hiện (Q5). Không có dòng trong bảng.

### Hàng 12: Testimonials 1:885

| Node | Loại | Giá trị | Khoá đề xuất | Ghi chú |
| --- | --- | --- | --- | --- |
| 1:892 | copy | Testimonial | blocks.testimonials.default_eyebrow | TT |
| 1:893 | copy | What Our Customers Say? | blocks.testimonials.default_heading | |
| 1:901 | copy | E. Johnson | blocks.testimonial_item.r1_name | |
| 1:905 | copy | 5 sao | blocks.testimonial_item.r1_rating | Số, không phải chuỗi |
| 1:913 | copy | Versatile Gear For All Exercises | blocks.testimonial_item.r1_title | |
| 1:914 | copy | High quality equipment that doesn't break the bank. I am very impressed with the overall durability. | blocks.testimonial_item.r1_quote | |
| I1:918;4733:5197, I1:918;4733:5199;424:1061, :1062 | store | Ativafit Lava 66 lb, $379.99, $499.99 | | P16 |
| 1:926 | copy | S. Williams | blocks.testimonial_item.r2_name | |
| 1:930 | copy | 4 sao | blocks.testimonial_item.r2_rating | Ảnh: 4 vàng, 1 xám |
| 1:938 | copy | Folds Away In Seconds | blocks.testimonial_item.r2_title | |
| 1:939 | copy | The rack folds flat against the wall. My garage is a garage again between sessions. | blocks.testimonial_item.r2_quote | |
| I1:943;4733:5197, I1:943;4733:5199;424:1059 | store | Compact Power Rack R3, $549.00 | | P07 |
| 1:950 | copy | M. Anderson | blocks.testimonial_item.r3_name | |
| 1:954 | copy | 5 sao | blocks.testimonial_item.r3_rating | |
| 1:962 | copy | Smooth Every Single Rep | blocks.testimonial_item.r3_title | |
| 1:963 | copy | The dial switches weight fast, no jamming at all. Saves an entire corner of my room. | blocks.testimonial_item.r3_quote | |
| I1:967;4733:5197, I1:967;4733:5199;424:1061, :1062 | store | FlexFold Adjustable Bench, $189.00, $229.00 | | P22 |
| 1:974 | copy | J. Miller | blocks.testimonial_item.r4_name | |
| 1:978 | copy | 5 sao | blocks.testimonial_item.r4_rating | Theo snapshot, 5 vector; mép ảnh cắt, chưa thấy màu |
| 1:986 | copy | Worth Every Penny | blocks.testimonial_item.r4_title | |
| 1:987 | copy | Spins so smoothly, no tangling even at high speed. Best rope I have owned. | blocks.testimonial_item.r4_quote | Mép ảnh cắt chữ, lấy từ snapshot |
| I1:991;4733:5197, I1:991;4733:5199;424:1061, :1062 | store | Revllen Pro Speed Rope, $34.99, $44.99 | | P04 |
| 1:904, 1:929, 1:953, 1:977 | copy | Verified | blocks.testimonials.verified (có sẵn) | E9: mặc định tắt, không so |
| 1:896, 1:921, 1:945, 1:969 | ảnh | Ảnh 4 card | | |
| 1:917, 1:942, 1:966, 1:990 | ảnh | Thumbnail sản phẩm | | Card 3, 4 trống trên ảnh, ES1-T198 #6 |

### Hàng 13: Image with text 1:992

| Node | Loại | Giá trị | Khoá đề xuất | Ghi chú |
| --- | --- | --- | --- | --- |
| 1:1018 | copy | We aRE about | blocks.image_with_text.why_eyebrow | TT, XN |
| 1:1019 | copy | Why Choose⏎efitco? | blocks.image_with_text.why_heading_html | TT |
| 1:1020 | copy | Affordable, high-quality fitness gear that supports  beginners to elite athletes.⏎We design for the home  first — equipment that folds, stacks or disappears  when you're done, so your living room stays a living  room between sessions. | blocks.image_with_text.why_text_html | XN: dấu cách đôi |
| I1:1021;377:1347 | copy | View About Us | blocks.image_with_text.why_button_label | Có icon mũi tên |
| 1:997, 1:998 | ảnh | Ảnh trái | | 1:995, 1:996 ẩn |
| 1:1011, 1:1012 | ảnh | 2 ảnh nhỏ | | |

### Hàng 14: Blog posts 1:1022

| Node | Loại | Giá trị | Khoá đề xuất | Ghi chú |
| --- | --- | --- | --- | --- |
| 1:1024 | copy | From the Efitco blog | blocks.blog_posts.default_eyebrow | TT |
| 1:1025 | copy | Training Tips & Inspiration | blocks.blog_posts.default_heading | |
| I1:1029;4687:4399 | store | Exercises | | A1, tag |
| 1:1031 | store | How to stretch properly after training | | A1 |
| 1:1032 | động | 2 min read | blocks.blog_posts.read_time (one, other) | A1, D8 |
| I1:1035;4687:4399 | store | Featured | | A2, tag. Ảnh thắng; snapshot "Freatured" |
| 1:1037 | store | Set up a perfect home gym in just 15m² | | A2 |
| 1:1038 | động | 5 min read | blocks.blog_posts.read_time (one, other) | A2 |
| I1:1041;4687:4399 | store | Articles | | A3, tag |
| 1:1043 | store | How to choose the right adjustable dumbbell | | A3 |
| 1:1044 | động | 6 min read | blocks.blog_posts.read_time (one, other) | A3 |
| I1:1047;4687:4399 | store | Diet plans | | A4, tag |
| 1:1049 | store | What to eat before and after a heavy session | | A4 |
| 1:1050 | động | 7 min read | blocks.blog_posts.read_time (one, other) | A4 |
| I1:1053;4687:4399 | store | Diet plans | | A5, tag. Mép ảnh cắt nhãn, lấy từ snapshot |
| 1:1055 | store | Rubber vs urethane: which plates last longer | | A5 |
| 1:1056 | động | 5 min read | blocks.blog_posts.read_time (one, other) | A5 |
| 1:1027, 1:1033, 1:1039, 1:1045, 1:1051 | ảnh | Ảnh 5 bài | | Ảnh fill trên frame |

### Hàng 15: FAQ + stats 1:1057

| Node | Loại | Giá trị | Khoá đề xuất | Ghi chú |
| --- | --- | --- | --- | --- |
| 1:1060 | copy | Questions and Answers | blocks.faq.default_eyebrow | TT |
| 1:1061 | copy | We're Proud To Be The Best At Training | blocks.faq.default_heading | |
| 1:1066 | copy | How long does shipping take? | blocks.faq_item.q1_question | Mở sẵn |
| 1:1067 | copy | Orders ship within one business day. Standard delivery is 2-4 business days across the continental US, and shipping is free on orders over $99. | blocks.faq_item.default_answer | XN. Dùng cho cả 5 câu, nguồn là node này |
| 1:1072 | copy | Are adjustable dumbbells easy for beginners? | blocks.faq_item.q2_question | Đóng |
| 1:1078 | copy | How much floor space do i actually need? | blocks.faq_item.q3_question | Đóng, XN: "i" |
| 1:1084 | copy | Does equipment arrive assembled? | blocks.faq_item.q4_question | Đóng |
| 1:1090 | copy | What's covered by the warranty? | blocks.faq_item.q5_question | Đóng |
| 1:1097 | copy | Products | blocks.faq.default_stat_1_label | TT |
| 1:1098 | copy | 360+ | blocks.faq.default_stat_1_value | Bắt buộc của CTO 11:14 |
| 1:1099 | copy | Home gym gear in stock. | blocks.faq.default_stat_1_text | |
| 1:1101 | copy | Warranty | blocks.faq.default_stat_2_label | TT |
| 1:1102 | copy | 12 | blocks.faq.default_stat_2_value | |
| 1:1103 | copy | Months on every item. | blocks.faq.default_stat_2_text | |
| 1:1094 | ảnh | Ảnh phải | | |

### Hàng 16: Newsletter, footer, trust 1:1104

| Node | Loại | Giá trị | Khoá đề xuất | Ghi chú |
| --- | --- | --- | --- | --- |
| 1:1148 | copy | Get 15% Off Your First Order | blocks.footer.newsletter_heading_html | TT; "Get 15% Off" màu accent, E3 áp cho nền tối nếu không đạt AA |
| 1:1149 | copy | Get expert training tips, early access to gear, and exclusive offers - plus up to 15% off for subscribers. | blocks.footer.newsletter_text | |
| 1:1153 | copy | Email | blocks.footer.newsletter_email (có sẵn) | |
| I1:1154;3795:783 | copy | Get 15% Off | blocks.footer.newsletter_submit (đổi) | Đang "Subscribe". Có icon |
| 1:1155 | copy | No spam. Unsubscribe anytime. | blocks.footer.newsletter_note | |
| 1:1171 | copy | Efitco provides premium fitness accessories dedicated to supporting your journey as you conquer every health and bodybuilding goal with confidence. | blocks.footer.default_description | |
| 1:1133 | store | Shop | | Menu `footer`, mục cấp 1 |
| 1:1135, 1:1136, 1:1137, 1:1138 | store | Weight; Portable Fitness; Benches; Accessories | | Con của Shop. "Portable Fitness" sáng hơn trên ảnh: trạng thái hover |
| 1:1140 | store | Information | | Menu `footer`, mục cấp 1 |
| 1:1142, 1:1143, 1:1144, 1:1145 | store | Our Story; Our Efitco; FAQs; Contact Us | | Con của Information |
| 1:1196 | copy | 1 Year Warranty | blocks.footer.trust_1 | Đã khớp theo ES1-T168 |
| 1:1199 | copy | Fast Shipping | blocks.footer.trust_2 | Đã khớp |
| 1:1202 | copy | Premium Quality | blocks.footer.trust_3 | Đã khớp |
| 1:1205 | copy | 90 Day Money Back | blocks.footer.trust_4 | Đã khớp |
| 1:1108 | store | EFITCO | | `shop.name` (Q4), hiển thị hoa |
| 1:1109 | store | © 2026 Efitco, Powered by Shopify | | Năm theo năm thực; `shop.name`. Năm khác 2026 thì che khi so |
| 1:1114 | store | USD / EN | | Theo market và ngôn ngữ của store |
| 1:1113 | ảnh | Cờ quốc gia | | Theo market |
| 1:1158 | ảnh | Logo footer | | Chọn trong editor |
| 1:1172 | ảnh | 4 icon social: TikTok, Instagram, YouTube, Facebook | | Link đặt ở Theme settings, TE-17-OPS2 |
| 1:1118, 1:1122, 1:1125, 1:1128, 1:1131 | ảnh | 5 icon thanh toán: Discover, Mastercard, Diners Club, American Express, PayPal | | `shop.enabled_payment_types`; thứ tự theo ảnh |
| 1:1191 | ảnh | Ảnh newsletter | | Merchant mới không có ảnh thì ẩn (AC-H28) |

## 3. Dữ liệu store: đủ để nhập (ES1-T178)

Quy tắc chung: không đổi handle và dữ liệu trong `tests/e2e/store-data.json`. Mọi tài nguyên mới có tiền tố `figma-`. Store: hoa-qua-nhap-khau.

### 3.1 Shop và menu

- Tên shop: Efitco (Q4). Đổi khi nghiệm thu.
- `main-menu`: Shop, Collection, Sale, Our Story, Blog, Contact, Help. Shop, Collection có cấp 2 (chevron). Cấp 2 và đích link không có trong Figma. Đề xuất: Shop có 4 collection `figma-tab-*`, Collection có 5 collection `figma-cat-*`; đích link còn lại do ES1-T178 chọn trang đang tồn tại.
- `footer`: 2 mục cấp 1 Shop, Information, mỗi mục 4 con như hàng 16. `blocks/footer.liquid` đọc `link.links` nên dùng được 1 menu 2 cấp.
- Thanh toán: Discover, Mastercard, Diners Club, American Express, PayPal hiện trên `shop.enabled_payment_types`. KHÔNG CHẮC store dev bật được đủ.

### 3.2 24 sản phẩm

Nhiều dòng trùng tên có chủ đích: Figma ghi giá hoặc rating khác nhau cho cùng tên, nên 1 sản phẩm không tái tạo được đủ hàng. Giá gạch = compare at price. Ảnh theo node ở mục 2.

| Mã | Handle | Tên | Giá | Giá gạch | Hàng | Metafield, tag, ghi chú |
| --- | --- | --- | --- | --- | --- | --- |
| P01 | figma-ativafit-lava-adjustable | Ativafit Lava 66 lb Adjustable | 379.99 | 499.99 | 5 | reviews.rating 5.0; 3 màu |
| P02 | figma-iron-core-kettlebell | Iron Core Kettlebell 16 kg | 119.00 | | 5 | tag New (quy tắc chờ ES1-T174); 3 màu; không rating |
| P03 | figma-flexfold-adjustable-bench | FlexFold Adjustable Bench | 189.99 | 229.00 | 5 | reviews.rating 5.0; 3 màu |
| P04 | figma-revllen-speed-rope | Revllen Pro Speed Rope | 34.99 | 44.99 | 5, 12 | Không rating; 3 màu |
| P05 | figma-ativafit-lava-setup | Ativafit Lava 66 lb | 379.99 | | 7 | Trong figma-setup |
| P06 | figma-flexfold-bench | FlexFold Bench | 189.99 | | 7 | Trong figma-setup |
| P07 | figma-compact-power-rack-r3 | Compact Power Rack R3 | 549.00 | | 7, 12 | Trong figma-setup |
| P08 | figma-training-mat-12mm | Training Mat 12 mm | 69.00 | | 7 | Trong figma-setup |
| P09 | figma-adjustable-dumbbell-pair | Adjustable dumbbell pair | 259.00 | | 9 | Trong figma-bundle, vị trí 1 |
| P10 | figma-foldable-bench | Foldable bench | 89.00 | | 9 | Vị trí 2 |
| P11 | figma-resistance-band-set | Resistance band set | 45.00 | | 9 | Vị trí 3 |
| P12 | figma-speed-rope | Speed rope | 34.00 | | 9 | Vị trí 4 |
| P13 | figma-recovery-roller | Recovery roller | 52.00 | | 9 | Vị trí 5 |
| P14 | figma-training-mat | Training mat | 69.00 | | 9 | Vị trí 6 |
| P15 | figma-ativafit-lava-featured | Ativafit Lava 66 lb Adjustable | 379.99 | 499.99 | 10 | reviews.rating 4.9 thang 5; reviews.rating_count 341; custom.spec_1–4 như hàng 10; mô tả 1:797; từ 2 variant (AC-H22); còn hàng |
| P16 | figma-ativafit-lava | Ativafit Lava 66 lb | 379.99 | 499.99 | 11, 12 | |
| P17 | figma-compact-power-rack | Compact Power Rack | 549.00 | | 11 | |
| P18 | figma-olympic-plate-set | Olympic Plate Set 100 | 289.00 | 339.00 | 11 | |
| P19 | figma-home-starter-kit | Home Starter Kit | 399.00 | 512.00 | 11 | |
| P20 | figma-recovery-roller-pro | Recovery Roller Pro | 52.00 | | 11 | |
| P21 | figma-resistance-band-set-pro | Resistance Band Set | 45.00 | | 11 | |
| P22 | figma-flexfold-adjustable-bench-2 | FlexFold Adjustable Bench | 189.00 | 229.00 | 12 | |
| P23 | figma-filler-1 | figma-filler-1 | Không có trong Figma | | Không hiện | ES1-T199 #4 |
| P24 | figma-filler-2 | figma-filler-2 | Không có trong Figma | | Không hiện | ES1-T199 #4 |

Swatch P01–P04: tên giá trị màu và hex không có trong bảng này, lấy từ `1-490.png`, Designer đo ở ES1-T174. KHÔNG CHẮC: 3 chip thứ 2, 3 của P04 và chip thứ 3 của P02 màu trắng, có thể là chip chưa gán màu.

### 3.3 Collection

12 collection theo ticket, cộng 2 cho hàng 7, 9 (ES1-T199 #5). Thứ tự collection đặt thủ công theo cột Sản phẩm.

| Handle | Tên | Hàng | Sản phẩm | Nguồn |
| --- | --- | --- | --- | --- |
| figma-cat-free-weights | Free Weights | 3 | P01, P02, P05, P09, P15, P16, P18 | Đề xuất |
| figma-cat-functional-training | Functional Training | 3 | P04, P11, P12, P19, P21 | Đề xuất |
| figma-cat-benches-racks | Benches & Racks | 3 | P03, P06, P07, P10, P17, P22 | Đề xuất |
| figma-cat-recovery-mobility | Recovery & Mobility | 3 | P13, P20 | Đề xuất |
| figma-cat-accessories | Accessories | 3 | P08, P14 | Đề xuất |
| figma-level-beginner | Beginner | 4b | P01–P24 (24) | Figma: 24 Products |
| figma-level-intermediate | Intermediate | 4b | P01–P12 | Đề xuất; số không có trong Figma |
| figma-level-advanced | Advanced | 4b | P13–P22 | Đề xuất; số không có trong Figma |
| figma-tab-all | All | 5 | P01, P02, P03, P04 | Figma |
| figma-tab-weight | Weight | 5 | P01, P02, P09, P18 | Đề xuất |
| figma-tab-portable-fitness | Portable Fitness | 5 | P04, P11, P12, P21 | Đề xuất |
| figma-tab-accessories | Accessories | 5 | P08, P13, P14, P20 | Đề xuất |
| figma-bundle | Bundle | 9 | P09, P10, P11, P12, P13, P14 | Figma |
| figma-setup | Setup | 7 | P05, P06, P07, P08 | Phạm vi discount 10% |

Hàng 7 chọn 4 sản phẩm P05–P08 làm row, hàng 10 chọn P15, hàng 11 gắn P16–P21, hàng 12 gắn sản phẩm như mục 2: chọn trong editor ở TE-17-OPS2.

Rủi ro: 24 sản phẩm mới vào `/collections/all`. ES1-T178 chạy `TE-3.spec.ts`, `smoke.spec.ts` sau khi nhập theo DoD của ticket đó.

### 3.4 Tag quiz

Dùng tag đã khai báo ở ES1-T134 để gộp 2 việc. Đề xuất, Figma không có. Bước 2, 3 có thể đổi theo ES1-T174, khi đó tag bổ sung, giữ các điều kiện dưới.

| Sản phẩm | Tag |
| --- | --- |
| P01, P05, P09, P15, P16 | quiz-upper, quiz-beginner, quiz-home |
| P14 | quiz-core, quiz-beginner, quiz-home |
| P07 | quiz-upper, quiz-advanced, quiz-gym |
| P18 | quiz-lower, quiz-advanced, quiz-home |

Kiểm theo ES1-T134: upper + beginner + home có 5 sản phẩm; core + beginner + home đúng 1; lower + advanced + gym 0, mỗi tag có trên ít nhất 1 sản phẩm. Cả 8 sản phẩm có trong `all`. Bật filter Product tag: giữ theo ES1-T134 #5.

### 3.5 Discount tự động

| Tên | Điều kiện | Giảm | Phạm vi |
| --- | --- | --- | --- |
| figma-bundle-tier-2 | Từ 2 món | 10% | figma-bundle |
| figma-bundle-tier-3 | Từ 3 món | 15% | figma-bundle |
| figma-setup | Từ 4 món | 10% | figma-setup, ES1-T199 #2 |

Không áp lên sản phẩm ngoài phạm vi, để không ảnh hưởng spec khác. Discount của `te12-bundle` (ES1-T144) giữ riêng.
Bậc cao nhất thắng: 3 món phải ra 15%, không cộng 10% + 15%. ES1-T178 đo `/cart.js` total_discount.

### 3.6 Blog

Blog handle `figma-blog`, 5 bài theo thứ tự A1–A5. Thân bài không có trong Figma. Số từ đặt đúng bội 200 để D8 ra đúng số Figma với cách làm tròn nào cũng vậy.

| Mã | Handle | Tiêu đề | Tag | Số từ | Hiện |
| --- | --- | --- | --- | --- | --- |
| A1 | figma-stretch-after-training | How to stretch properly after training | Exercises | 400 | 2 min read |
| A2 | figma-home-gym-15m2 | Set up a perfect home gym in just 15m² | Featured | 1 000 | 5 min read |
| A3 | figma-choose-adjustable-dumbbell | How to choose the right adjustable dumbbell | Articles | 1 200 | 6 min read |
| A4 | figma-eat-before-after-session | What to eat before and after a heavy session | Diet plans | 1 400 | 7 min read |
| A5 | figma-rubber-vs-urethane | Rubber vs urethane: which plates last longer | Diet plans | 1 000 | 5 min read |

### 3.7 Ảnh, video

- Ảnh: theo cột Node, xuất ở ES1-T174, kèm quyền dùng. Ảnh chỉ dùng trên store dev.
- Video: 6 file, ES1-T199 #3.

### 3.8 Đặt trong editor (TE-17-OPS2, CTO)

Ngày kết thúc countdown dưới 24 giờ (E8); logo header, footer; ảnh newsletter; link social; sản phẩm, ảnh của hàng 2, 3, 4a, 4b, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15. Verified tắt (Q1 của ES1-T167).

## 4. Đối chiếu DoD theo hàng

Có = hàng đó có ít nhất 1 dòng loại này ở mục 2.

| Hàng | copy | store | động | ảnh |
| --- | --- | --- | --- | --- |
| 1 | | Có | | Có |
| 2 | Có | | | Có |
| 3 | Có | Có | | Có |
| 4a | Có | | | Có |
| 4b | Có | Có | Có | Có |
| 5 | Có | Có | Có | Có |
| 6 | Có | | Có | Có |
| 7 | Có | Có | Có | Có |
| 8 | Có | | | Có |
| 9 | Có | Có | Có | Có |
| 10 | Có | Có | Có | Có |
| 11 | Có | Có | | Có |
| 12 | Có | Có | | Có |
| 13 | Có | | | Có |
| 14 | Có | Có | Có | Có |
| 15 | Có | | | Có |
| 16 | Có | Có | | Có |

17/17 dòng hàng có nội dung.

## 5. Truy vết AC-H

Nội dung AC ở `drafts/ba/ES1-T173/srs.md`, chờ chép sang `docs/srs.md`. Ticket lấy từ tiêu đề ES1-T174–T197 và plan mục 2.

| AC | Story | TC | Hàng | Ticket làm | Ticket kiểm |
| --- | --- | --- | --- | --- | --- |
| AC-H1 | TE-17 | TC-H1 | Tất cả | ES1-T175 | ES1-T176, T196 |
| AC-H2 | TE-17 | TC-H2 | Tất cả | ES1-T179, T180, T181, T182 | ES1-T176, T196 |
| AC-H3 | TE-17 | TC-H3 | Tất cả | Mọi ticket FE trang chủ | ES1-T176, T196, T197 |
| AC-H4 | TE-17 | TC-H4 | Tất cả | Mọi ticket FE trang chủ | ES1-T176, T197 |
| AC-H5 | TE-17 | TC-H5 | Tất cả | ES1-T179, T180, T181, T182 | ES1-T196 |
| AC-H6 | TE-17 | TC-H6 | Tất cả | ES1-T179, T180 | ES1-T196 |
| AC-H7 | TE-17 | TC-H7 | Tất cả | Mọi ticket FE trang chủ | ES1-T196 |
| AC-H8 | TE-15 | TC-H8 | 3 | ES1-T184, T185 | ES1-T187 |
| AC-H9 | TE-15 | TC-H9 | 3 | ES1-T184, T185 | ES1-T187 |
| AC-H10 | TE-15 | TC-H10 | 4b | ES1-T186 | ES1-T187 |
| AC-H11 | TE-3 | TC-H11 | 5 | ES1-T188, T189 | Kiểm ở ES1-T190 (TE-3.spec) |
| AC-H12 | TE-3 | TC-H12 | 5 | ES1-T189 | Kiểm ở ES1-T190 (TE-3.spec) |
| AC-H13 | TE-3 | TC-H13 | 5 | ES1-T190 | ES1-T190 (TE-3.spec) |
| AC-H14 | TE-3 | TC-H14 | 5 | ES1-T190 | ES1-T190 (TE-3.spec) |
| AC-H15 | TE-11 | TC-H15 | 6 | ES1-T182, T183 | ES1-T140 |
| AC-H16 | TE-11 | TC-H16 | 6 | ES1-T139 | ES1-T140 |
| AC-H17 | TE-11 | TC-H17 | 6 | ES1-T183, T139 | ES1-T140 |
| AC-H18 | TE-12 | TC-H18 | 9 | ES1-T182, T149 | ES1-T151 |
| AC-H19 | TE-12 | TC-H19 | 7 | ES1-T148, T149 | ES1-T151 |
| AC-H20 | TE-12 | TC-H20 | 7 | ES1-T148, T149 | ES1-T151 |
| AC-H21 | TE-13 | TC-H21 | 11 | ES1-T157, T158 | ES1-T159 |
| AC-H22 | TE-13 | TC-H22 | 10 | ES1-T158 | ES1-T159 |
| AC-H23 | TE-13 | TC-H23 | 10 | ES1-T158 | ES1-T159 |
| AC-H24 | TE-7 | TC-H24 | 12 | ES1-T179 | ES1-T122 |
| AC-H25 | TE-7 | TC-H25 | 12 | ES1-T179 | ES1-T122 |
| AC-H26 | TE-16 | TC-H26 | 14 | ES1-T191 | ES1-T192 |
| AC-H27 | TE-16 | TC-H27 | 14 | ES1-T191 | ES1-T192 |
| AC-H28 | TE-1 | TC-H28 | 16 | ES1-T181 | ES1-T196 |
| AC-H29 | TE-1, TE-2 | TC-H29 | 1, 2 | Không có việc code nếu đạt | ES1-T196 |
| AC-H30 | TE-10 | TC-H30 | Tất cả | ES1-T177 | ES1-T196 |
| AC-H31 | TE-10 | TC-H31 | Tất cả | ES1-T177 | ES1-T196 |
| AC-H32 | TE-10 | TC-H32 | Tất cả | ES1-T176 | ES1-T196 |
| AC-H33 | TE-10 | TC-H33 | Tất cả | ES1-T193 | ES1-T193 |
| AC-H34 | TE-10 | TC-H34 | Không | ES1-T177 | ES1-T177 |
| AC-H35 | TE-17 | TC-H35 | Tất cả | Mọi ticket FE trang chủ | ES1-T196 |

AC cũ đã sửa trong SRS:

| AC | Trạng thái cũ | Trạng thái mới |
| --- | --- | --- |
| TE-3 AC1 | Mặc định 8 | Mặc định 4 (D7) |
| TE-3 AC6 | Touch target ≥ 24px | ≥ 44px (D7) |
| TE-7 AC5 | Default text gợi cách dùng | Mặc định là nội dung Figma; Custom Liquid không gọi ở trang chủ (CR-5) |
| TE-9 AC1 | `settings_data.json`, preset | AC-H1, AC-H5; không trỏ resource không tồn tại |
| TE-9 AC4 | 4 collection, 3 bài, ảnh tự do | Theo mục 3; dữ liệu test giữ nguyên |
| TE-10 AC3 | R nhóm bắt buộc 100% | Thêm cách tính nội dung mẫu với R8 |
| TE-11 AC4 | < 750px | < 48rem |
| TE-12 AC1 | "vd" 2 món 10%, 3 món 15% | Mặc định 10%, 15% + ghi chú bắt buộc |
| TE-12 AC5, mã R | Không có dòng giảm; R8 không fake giảm giá | AC-H19; R8 giảm thật do discount, có ghi chú |
| TE-13 AC3 | Không autoplay có tiếng; 3 ô là text setting | Bấm mới chạy; 3 ô mặc định trống, không hiện (Q5) |

## 6. Tự kiểm tra

- `vague_words.py`, `traceability.py`: CHƯA CHẠY (không có Bash, `../ai-team/` bị từ chối). Orchestrator chạy giúp. Tay: grep 7 từ cấm trong file này và phần thêm vào SRS.
- `docs/srs.md`: chưa sửa, hook chặn. Bản đầy đủ `drafts/ba/ES1-T173/srs.md`.
- Ngoài ticket: SRS còn "nhanh" ở câu story TE-4, TE-6, TE-8 và "bóng nhẹ" ở TE-1 AC9 từ trước. Không sửa vì ngoài bảng 2.3 và ES1-T173 DoD: `vague_words.py` có thể báo các dòng này.
- 0 chuỗi từ node ẩn: mục 1; grep ngược các chuỗi chỉ có trong node ẩn trên mục 2, 3.
- Không thêm AC ngoài plan. Điểm thiếu ở ES1-T198, ES1-T199.
- Không chạy theme check, playwright, lhci vì không đổi code.
- 0 sửa ngoài `drafts/ba/ES1-T173/`, memory BA; 2 ticket question tạo mới; chưa commit.
