KHÔNG CHẮC: (1) chưa render lần nào: không có preview, spec chưa chạy, chưa type-check; mọi số đo layout mới là tính từ CSS, chưa đo trên trình duyệt. (2) "Get 15% Off" trong heading dùng `--color-muted-on-dark` (xám) theo E3 và DoD 4.5:1, Figma là cam: đây là chênh nhìn thấy rõ nhất của hàng 16, cần Designer, CTO xác nhận khi xem ảnh. (3) Bố cục mobile, tablet do FE tự suy, Figma chỉ có desktop, inventory không có mặc định mobile cho footer. (4) Phần có logo và có ảnh newsletter không test được trên preview vì là setting của footer trong layout.

# ES1-T181 TE-17-FE2: footer hàng 16 (1:1104)

Plan ES1-T169 # 18. AC-H5, AC-H28. Nội dung theo `drafts/ba/ES1-T173/home-content.md` hàng 16.

## Thay đổi

`blocks/footer.liquid`:
- Logo: setting `logo` + `logo_width` (mặc định 86), trống thì hiện `shop.name`. Có link về trang chủ, có `aria-label` khi dùng ảnh.
- Mô tả: setting `description` (`inline_richtext`), `default` trong schema đúng 1:1171.
- Ảnh newsletter: setting `newsletter_image`, lazy qua `snippets/image`, crop 4:5. Trống thì không render khung, band chuyển sang lưới không có cột ảnh.
- Heading 2 màu: khoá `blocks.footer.newsletter_heading_html` có `span`. Setting `newsletter_heading` bỏ `default`, merchant nhập thì thắng và thành 1 màu.
- Nút: nhãn "Get 15% Off" + icon `send` trong `snippets/slideshow-icon`. Thêm dòng "No spam. Unsubscribe anytime." dưới ô nhập.
- Sắp lại markup theo 3 phần của Figma: band newsletter, panel (logo, mô tả, social, menu, trust), hàng cuối (copyright, wordmark, localization + payment). Ticket chỉ nêu 5 phần, nhưng AC-H28 đòi đúng 1:1104 nên phải đổi bố cục. Bỏ class `site-footer__inner`, `__top`, `__meta` (0 tham chiếu còn lại).
- Giữ nguyên: logic form, thông báo lỗi, thành công, mọi `data-testid` cũ, copy trust bar.
- `data-testid` mới: `footer-logo`, `footer-description`, `footer-newsletter-image`, `footer-newsletter-heading`, `footer-newsletter-note`.

`assets/base.css`: viết lại phần footer theo số đo Figma. Không thêm token, 0 literal màu, chỉ dùng thuộc tính logical. `.site-footer ul` đang đè `padding-block` của trust bar, sửa bằng selector 2 class.

Locale: thêm `newsletter_heading_html`, `newsletter_note`; đổi `newsletter_submit`; schema thêm `labels.footer_description`, `labels.newsletter_image`, `info.newsletter_image`.

## Tương phản đo bằng công thức WCAG, tính từ giá trị token

| Cặp | Tỉ lệ | Kết quả |
| --- | --- | --- |
| Heading `--color-background-dark-foreground` #FFFFFF trên #1E1E1E | 16.67:1 | đạt |
| Heading phần nhấn `--color-muted-on-dark` #999999 trên #1E1E1E | 5.85:1 | đạt |
| `--color-muted-on-dark` trên panel (≈ #222222) | 5.58:1 | đạt |
| Chữ nút #FFFFFF trên accent #C8400E | 5.01:1 | đạt |
| Accent #C8400E trên #1E1E1E (nếu theo Figma) | 3.33:1 | không đạt 4.5:1, không dùng |

Accent 3.33:1 đạt ngưỡng 3:1 của chữ lớn trong WCAG, nhưng DoD ticket ghi từ 4.5:1 và E3 đã ký nên dùng muted. Muốn trả về cam thì sửa 1 dòng `.site-footer__newsletter-heading span`, cần CTO đổi DoD.

## Khác Figma hoặc chưa làm

- Thiếu cờ quốc gia (1:1113) và chevron ở nút USD / EN: không thuộc 5 phần của ticket, nhưng ảnh hưởng so ảnh hàng 16. Summary vẫn hiện dấu mặc định của trình duyệt. Cần ticket riêng hoặc gộp khi T176 báo lệch.
- Icon thanh toán giữ 38 x 24, Figma khoảng 32 x 22; chưa chỉnh.
- Nền footer #1E1E1E theo token, Figma #1A1A1A. Panel là mix 2% trắng trên nền đó, không phải giá trị Figma.
- Input, nút bo góc 4 theo token mặc định, Figma 8. Không đổi token vì ticket cấm thêm và giá trị này dùng toàn theme.
- Trust bar #999999 thay vì #666666 của Figma: #666666 trên nền tối không đạt AA. Ngoại lệ này chưa có trong danh sách E1–E9, cần CTO ký.
- Viền ô nhập mix 50% muted, 2.49:1, dưới mức 3:1 cho thành phần không phải chữ (WCAG 1.4.11). Figma #4D4D4D còn thấp hơn. axe không bắt lỗi này. Đổi lên 100% muted thì đạt nhưng lệch Figma: cần Designer chọn.

## Giới hạn còn lại

- Merchant xoá heading thì quay về chữ mẫu, không ẩn được (nhược điểm 1 của D1).
- Heading merchant nhập chỉ có 1 màu vì setting là chữ thường.
- Ảnh logo không đổi màu theo nền, merchant phải chọn logo sáng.
- Store dev chỉ giống Figma khi tên shop là "Efitco" (Q4); tên dài thì wordmark xuống nhiều dòng.
- `AGENTS.md` dòng Theme map của `footer` nên thêm logo, mô tả, và `slideshow-icon` thêm `send`: scope-guard chặn, thuộc việc người làm ở plan # 41.

## Việc của Orchestrator trước khi push

Scope-guard chặn dev-fe ghi `tests/`. Spec nằm ở drafts:

```
cp drafts/dev-fe/ES1-T181/ES1-T181.spec.ts tests/e2e/ES1-T181.spec.ts
```

`TE-1.spec.ts` không khẳng định nhãn "Subscribe" (grep 0) nên không cần patch.

## Tự kiểm tra

Đã chạy:
- `shopify theme check`: 86 file, 0 lỗi, không đổi `.theme-check.yml`.
- Locale JSON hợp lệ, 0 khoá trùng, mọi khoá `| t` và `t:` trong footer đều có (kiểm bằng script).
- So bằng script: mô tả, newsletter text, heading, nhãn nút, No spam khớp bảng ES1-T173.
- `git status`: không có file JS trong diff, `assets/critical.css` không đổi (9921 B).
- grep `Subscribe` trong `TE-1.spec.ts`, `blocks/footer.liquid`: 0.

Chưa chạy, chưa đạt DoD (theo comment CTO 06/11, e2e và lighthouse đang tắt trên CI, `RUN_STORE_TESTS=false`):
- `npx playwright test` cho ES1-T181, TE-1: spec viết kèm, chưa chạy lần nào. Cần chạy lại cả ES1-T45 vì có test `.site-footer__panel`, markup quanh panel đã đổi.
- axe, console, `npx lhci autorun`.
- Ảnh 360, 768, 1280, 1920: chờ preview.
- `ES1-T176.spec.ts` hàng 16 và ngưỡng so ảnh: T176 làm cuối theo CTO, DoD này chưa đạt.
- Có logo, có ảnh newsletter trong editor: cần người chạy tay.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
