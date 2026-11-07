KHÔNG CHẮC: chưa áp vào docs/figma-inventory.md. Hook scope-guard chặn designer ghi file này (cho phép docs/ui-spec/, tokens.json, drafts/designer/), trong khi ticket ES1-T174 yêu cầu sửa. Orchestrator hoặc người áp 8 thay đổi dưới đây.

# Thay đổi cho docs/figma-inventory.md

Số dòng theo file hiện tại trên working tree. Thay cả dòng bằng nội dung trong khối.

## 1. Thêm sau dòng 14

```
- Khi snapshot và ảnh export `docs/figma/img/` lệch nhau, ảnh export thắng (ES1-T174). Chỉ tính node hiện: bản thân và mọi node cha không có `visible:false`.
```

## 2. Dòng 22 (hàng 3)

```
| 3 | Collection list (carousel) | 1:395 | 1027 | TE-15 | desktop | rỗng (<5 collection), hover | "Browse Categories", 5 card 336 × 270, thẻ thứ 5 tràn qua mép 1920: Free Weights, Functional Training, Benches & Racks, Recovery & Mobility, Accessories; nút next/back 1:398 |
```

## 3. Dòng 23 (hàng 4)

```
| 4 | Rich text + Collection list (shop by level) | 1:453 | 1515 | TE-2 (4a) + TE-15 (4b) | desktop | rỗng | Gộp 2 phần: 4a 1:454 heading "Everything You Need to Train." + CTA "Become A Member"; 4b 1:464 "Choose Your Training Level" 3 card 456 × 456 Beginner/Intermediate/Advanced. "24 Products" chỉ hiện trên card Beginner (ES1-T198 #2) |
```

## 4. Dòng 28 (hàng 9)

```
| 9 | Bundle builder | 1:636 | 6173 | TE-12 | desktop | giỏ bundle rỗng, hết hàng, giảm giá theo bậc | "Pick Your Kit, Save As You Go": lưới 6 thẻ sản phẩm chọn (theme cho tối đa 9) + panel "Your Bundle" tổng tiền, progress "Add 1 more item to unlock 15% off" → BE nặng |
```

## 5. Dòng 30 (hàng 11)

```
| 11 | Video demo carousel | 1:817 | 7974 | TE-13 | desktop | video lỗi, rỗng | "See Real Equipment In Action, Before You Buy": 6 thẻ video dọc kèm product name/price → cần video hosting (Shopify video hay YouTube?). 3 stat 1:827 (360+, 1:15, 4K), link 1:826, nhãn 1:844 đang ẩn trong Figma, không làm (ES1-T168 Q5) |
```

## 6. Dòng 32 (hàng 13)

```
| 13 | Image with text (why choose) | 1:992 | 9814 | TE-7 | desktop | — | "Why Choose Efitco?": ảnh trái full-bleed, CTA "View About Us", 2 ảnh nhỏ. 3 USP 1:999, 1:1002, 1:1005 đang ẩn trong Figma, không làm (ES1-T116 #1) |
```

## 7. Dòng 33 (hàng 14)

```
| 14 | Blog posts | 1:1022 | 10690 | TE-16 | desktop | rỗng, <5 bài | "Training Tips & Inspiration": 5 card dọc 336 × 448, thẻ thứ 5 tràn qua mép 1920, tag + title + read time. Tag "Featured" theo ảnh export (snapshot ghi "Freatured") |
```

## 8. Dòng 34 (hàng 15)

```
| 15 | FAQ (collapsible) + stats | 1:1057 | 11508 | TE-7 | desktop | mở/đóng, >5 câu | "We're Proud To Be The Best At Training": 5 câu hỏi accordion; ảnh phải + 2 ô stat: "Products / 360+ / Home gym gear in stock.", "Warranty / 12 / Months on every item." |
```
