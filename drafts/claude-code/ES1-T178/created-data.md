# ES1-T178 — dữ liệu store dev hoa-qua-nhap-khau (Claude Code, Admin API 2026-10, 11/11/2026)

Chỉ store dev. Không publish, không đổi theme. Gỡ được theo id dưới đây. Script và mutation: lưu ở bản chạy của Claude Code (import.sh idempotent theo handle).

## Đã có trước (nhập 06/11, bảng ES1-T173) — ghi lại id

| Loại | Khoá | Id |
|---|---|---|
| product | P01 figma-ativafit-lava-adjustable | gid://shopify/Product/9543674167393 |
| product | P02 figma-iron-core-kettlebell | gid://shopify/Product/9543677116513 |
| product | P03 figma-flexfold-adjustable-bench | gid://shopify/Product/9543677640801 |
| product | P04 figma-revllen-speed-rope | gid://shopify/Product/9543678197857 |
| product | P05 figma-ativafit-lava-setup | gid://shopify/Product/9543679017057 |
| product | P06 figma-flexfold-bench | gid://shopify/Product/9543679541345 |
| product | P07 figma-compact-power-rack-r3 | gid://shopify/Product/9543680098401 |
| product | P08 figma-training-mat-12mm | gid://shopify/Product/9543680753761 |
| product | P09 figma-adjustable-dumbbell-pair | gid://shopify/Product/9543681605729 |
| product | P10 figma-foldable-bench | gid://shopify/Product/9543682228321 |
| product | P11 figma-resistance-band-set | gid://shopify/Product/9543683211361 |
| product | P12 figma-speed-rope | gid://shopify/Product/9543683702881 |
| product | P13 figma-recovery-roller | gid://shopify/Product/9543684259937 |
| product | P14 figma-training-mat | gid://shopify/Product/9543684816993 |
| product | P15 figma-ativafit-lava-featured | gid://shopify/Product/9543685242977 |
| product | P16 figma-ativafit-lava | gid://shopify/Product/9543685668961 |
| product | P17 figma-compact-power-rack | gid://shopify/Product/9543686193249 |
| product | P18 figma-olympic-plate-set | gid://shopify/Product/9543686520929 |
| product | P19 figma-home-starter-kit | gid://shopify/Product/9543686914145 |
| product | P20 figma-recovery-roller-pro | gid://shopify/Product/9543687241825 |
| product | P21 figma-resistance-band-set-pro | gid://shopify/Product/9543687503969 |
| product | P22 figma-flexfold-adjustable-bench-2 | gid://shopify/Product/9543687733345 |
| product | P23 figma-filler-1 | gid://shopify/Product/9543688290401 |
| product | P24 figma-filler-2 | gid://shopify/Product/9543688650849 |
| collection | figma-cat-free-weights | gid://shopify/Collection/366034813025 |
| collection | figma-cat-functional-training | gid://shopify/Collection/366034845793 |
| collection | figma-cat-benches-racks | gid://shopify/Collection/366034878561 |
| collection | figma-cat-recovery-mobility | gid://shopify/Collection/366034911329 |
| collection | figma-cat-accessories | gid://shopify/Collection/366034944097 |
| collection | figma-level-beginner | gid://shopify/Collection/366034976865 |
| collection | figma-level-intermediate | gid://shopify/Collection/366035009633 |
| collection | figma-level-advanced | gid://shopify/Collection/366035042401 |
| collection | figma-tab-all | gid://shopify/Collection/366035075169 |
| collection | figma-tab-weight | gid://shopify/Collection/366035107937 |
| collection | figma-tab-portable-fitness | gid://shopify/Collection/366035140705 |
| collection | figma-tab-accessories | gid://shopify/Collection/366035173473 |
| collection | figma-bundle | gid://shopify/Collection/366035206241 |
| collection | figma-setup | gid://shopify/Collection/366035239009 |
| discount | figma-bundle-tier-2 | gid://shopify/DiscountAutomaticNode/1321393291361 |
| discount | figma-bundle-tier-3 | gid://shopify/DiscountAutomaticNode/1321393324129 |
| discount | figma-setup | gid://shopify/DiscountAutomaticNode/1321393356897 |
| blog | figma-blog | gid://shopify/Blog/95968624737 |
| article | A1 figma-stretch-after-training | gid://shopify/Article/570163396705 |
| article | A2 figma-home-gym-15m2 | gid://shopify/Article/570163429473 |
| article | A3 figma-choose-adjustable-dumbbell | gid://shopify/Article/570163462241 |
| article | A4 figma-eat-before-after-session | gid://shopify/Article/570163495009 |
| article | A5 figma-rubber-vs-urethane | gid://shopify/Article/570163527777 |
| menu | main-menu | gid://shopify/Menu/204952240225 |
| menu | footer | gid://shopify/Menu/204952272993 |
| metafieldDefinition | reviews.rating | gid://shopify/MetafieldDefinition/455658733665 |
| metafieldDefinition | reviews.rating_count | gid://shopify/MetafieldDefinition/455661060193 |

## Tạo 11/11 (gộp ES1-T105, T125, T134, T144, T153)

| Loại | Khoá | Id | Hành động |
|---|---|---|---|
| tags | amazing-ice-sunglasses-collection10 | gid://shopify/Product/9537888157793 | added quiz-upper,quiz-beginner,quiz-home,te11-test |
| tags | amazing-ice-sunglasses-collection9 | gid://shopify/Product/9537888190561 | added quiz-upper,quiz-beginner,quiz-home,te11-test |
| tags | amazing-ice-sunglasses-collection8 | gid://shopify/Product/9537888223329 | added quiz-upper,quiz-beginner,quiz-home,te11-test |
| tags | amazing-ice-sunglasses-collection7 | gid://shopify/Product/9537888256097 | added quiz-upper,quiz-beginner,quiz-home,te11-test |
| tags | amazing-ice-sunglasses-collection6 | gid://shopify/Product/9537888288865 | added quiz-upper,quiz-beginner,quiz-home,te11-test |
| tags | amazing-ice-sunglasses-collection5 | gid://shopify/Product/9537888321633 | added quiz-core,quiz-beginner,quiz-home,te11-test |
| tags | amazing-ice-sunglasses-collection4 | gid://shopify/Product/9537888354401 | added quiz-lower,quiz-advanced,quiz-home,te11-test |
| metafieldDefinition | custom.spec_1 | gid://shopify/MetafieldDefinition/459244732513 | created |
| metafieldDefinition | custom.spec_2 | gid://shopify/MetafieldDefinition/459244765281 | created |
| metafieldDefinition | custom.spec_3 | gid://shopify/MetafieldDefinition/459244994657 | created |
| metafieldDefinition | custom.spec_4 | gid://shopify/MetafieldDefinition/459245027425 | created |
| metafieldDefinition | custom.swatch_colors | gid://shopify/MetafieldDefinition/459245060193 | created |
| metafieldDefinition | custom.demo_video | gid://shopify/MetafieldDefinition/459245092961 | created |
| product | te12-sold-out | gid://shopify/Product/9553140088929 | created |
| product | te13-featured | gid://shopify/Product/9553140187233 | created |
| collection | te6-filter | gid://shopify/Collection/366248460385 | created |
| collection | te6-empty | gid://shopify/Collection/366248558689 | created |
| collection | te6-image | gid://shopify/Collection/366248591457 | created |
| collection | te12-bundle | gid://shopify/Collection/366248624225 | created |
| collection | te11-quiz | gid://shopify/Collection/366248656993 | created |
| discount | te12-bundle-tier-2 | gid://shopify/DiscountAutomaticNode/1322216620129 | created |
| discount | te12-bundle-tier-3 | gid://shopify/DiscountAutomaticNode/1322216652897 | created |
| page | te8-training-guide | gid://shopify/Page/139217764449 | created |
| tags | amazing-ice-sunglasses-collection10 | gid://shopify/Product/9537888157793 | added quiz-upper,quiz-beginner,quiz-home,te11-test |
| tags | amazing-ice-sunglasses-collection9 | gid://shopify/Product/9537888190561 | added quiz-upper,quiz-beginner,quiz-home,te11-test |
| tags | amazing-ice-sunglasses-collection8 | gid://shopify/Product/9537888223329 | added quiz-upper,quiz-beginner,quiz-home,te11-test |
| tags | amazing-ice-sunglasses-collection7 | gid://shopify/Product/9537888256097 | added quiz-upper,quiz-beginner,quiz-home,te11-test |
| tags | amazing-ice-sunglasses-collection6 | gid://shopify/Product/9537888288865 | added quiz-upper,quiz-beginner,quiz-home,te11-test |
| tags | amazing-ice-sunglasses-collection5 | gid://shopify/Product/9537888321633 | added quiz-core,quiz-beginner,quiz-home,te11-test |
| tags | amazing-ice-sunglasses-collection4 | gid://shopify/Product/9537888354401 | added quiz-lower,quiz-advanced,quiz-home,te11-test |

## Việc tay của CTO còn lại
- Search & Discovery: bật filter Availability, Price, Product type, Vendor, Color swatch, Product tag.
- Đặt focal point ảnh collection te6-image.
