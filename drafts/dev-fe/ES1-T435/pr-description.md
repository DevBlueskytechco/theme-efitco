KHÔNG CHẮC: ticket ghi "tách khu trong index.te13", nhưng thêm featured-product thứ 2 vào /?view=te13 làm picker chuyển partial sang JSON (assets/product-variant-picker.js:167, featured-product.js:57 đếm `featured-product` > 1) và làm đỏ nhóm "ES1-T158 AC2 1 block: partial". Chọn phương án template riêng mà ticket cho phép: `index.te13-featured`. Spec (QA) phải trỏ lại ca te13-featured, chưa sửa trong PR này.

# ES1-T435 TE-13-R2-FE: khu te13-featured riêng, band A của /?view=te13 cố định variant-co-ảnh-rieng

Nguồn: ES1-T435, ES1-T426 (CTO 12/11), drafts/qa/ES1-T417/test-cases.md (PR #191) bảng "Dữ liệu te13".

## Thay đổi
- `templates/index.te13.liquid`: bỏ ưu tiên `te13-featured`; band `te13-a` và video card 2, 7 luôn dùng `variant-co-ảnh-rieng` (TE4_VARIANTS_HANDLE). Kết quả giống hiện trạng CI (te13-featured đang gỡ nên vẫn rơi về sản phẩm này), nhưng không đổi sau khi publish lại te13-featured.
- `templates/index.te13-featured.liquid` (mới, /?view=te13-featured): 1 featured-product, container `te13-f` (testid `container-te13-f`), block `te13-featured-f`, product `te13-featured`, countdown_end +48h, eyebrow + spec_1..4 như band A cũ. 1 block trên trang nên vẫn chế độ partial như /?view=te13.
  - Không fallback sản phẩm khác: te13-featured chưa publish thì band trống, spec skip do dữ liệu, không chạy nhầm sản phẩm.
  - `te13-meta` có `data-expected-end` và `data-product-handle` để spec xác nhận sản phẩm đã render.
- `templates/index.te13-states.liquid`: không đổi. Band A vẫn `te13-featured`, thiếu thì `sale-gia-nhỏ`; ES1-T156 metafield :172 vẫn đọc được tại đây (khác trang với te13-a của /?view=te13 nên không xung đột).

## Ca test → sản phẩm sau PR (cho QA ES1-T417)
| Ca | Trang / band | Sản phẩm |
| --- | --- | --- |
| ES1-T158 AC2 :315 :345 :362 :405 :441 :476; ES1-T223 :41 :49 :59 | /?view=te13 `container-te13-a` | variant-co-ảnh-rieng |
| ES1-T158 openCountdown :128 (cần giá gạch) | đổi sang /?view=te13-featured `container-te13-f` | te13-featured |
| ES1-T156 AC2 metafield :172 | giữ /?view=te13-states band a, hoặc chuyển /?view=te13-featured band f | te13-featured |
| ES1-T156 khác, ES1-T158 band B, ES1-T223 :68 | /?view=te13-states | không đổi |

Việc sau merge (ngoài FE): QA sửa spec theo bảng trên + thêm TE13_FEATURED_HANDLE nếu cần; CTO publish lại te13-featured; QA bật TE13_METAFIELDS_READY.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi; 0 cảnh báo trên 2 file te13 (22 cảnh báo có sẵn ở file khác, không thuộc PR).
- Diff: 2 file `templates/`, 0 file JS, 0 CSS, 0 locale (template test dùng chữ Figma qua tham số block như index.te13 hiện có).
- Theo spec tĩnh ES1-T158: không đổi block, số thẻ script, data-lazy-module.
- Preview, Playwright (ES1-T156, T158, T223), Lighthouse: chờ CI. Lưu ý: openCountdown :128 vẫn mở /?view=te13 band te13-a → skip "không có giá gạch" nếu variant-co-ảnh-rieng không sale, tới khi QA trỏ sang te13-featured.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
