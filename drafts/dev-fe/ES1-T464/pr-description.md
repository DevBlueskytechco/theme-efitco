KHÔNG CHẮC: scope-guard chặn dev-fe ghi tests/fixtures/home-figma.json → giá trị `<em>` của fixture chưa vào repo; patch ở drafts/dev-fe/ES1-T464/home-figma.patch.md, giao QA ES1-T468. Tới lúc đó test màu `<em>` trong ES1-T181 skip có lý do.

# ES1-T464: TE-1 FE: footer newsletter_heading sang inline_richtext, `<em>` tô accent

CTO 14/11 (ES1-T437), ES1-T308 #1.

## Thay đổi
- blocks/footer.liquid
  - `newsletter_heading`: `text` → `inline_richtext`, không default, info mới `t:info.newsletter_heading`.
  - Rỗng thì không render `<h2>` (bỏ fallback locale `blocks.footer.newsletter_heading_html`). Có giá trị thì in thẳng HTML của inline_richtext (không `escape`).
  - Wrapper `.site-footer__newsletter` giữ nguyên để cột form trong grid band không nhảy khi heading rỗng.
  - `{% doc %}` cập nhật mô tả.
- assets/base.css
  - Xoá 2 rule cũ `.site-footer__newsletter-heading span` (muted-on-dark ở dòng ~3190 và accent ở khối "7. Get 15% Off").
  - Thêm `.site-footer__newsletter-heading em { color: var(--color-accent); font-style: normal; }`. Không literal.
  - base.css thô 273 176 → 273 029 B (−147 B).
- locales/en.default.json: xoá `blocks.footer.newsletter_heading_html` (không còn dùng).
- locales/en.default.schema.json: thêm `info.newsletter_heading` "Wrap words in italic to show them in the accent color. Leave empty to hide." (không trùng key; `labels.newsletter_heading` khác nhóm).
- tests/e2e/ES1-T181.spec.ts
  - Chữ footer lấy từ fixture ES1-T331 (`loadHomeFixture`, khối `layout:theme` footer): description, heading (bỏ thẻ), newsletter_text, nút = `settings.newsletter_button_label ?? pending_settings.newsletter_button_label`, note từ marker.
  - Mỗi test phụ thuộc fixture mở `/` gọi `skipUnlessFixture` rồi mới sang trang đo.
  - Test màu: `span` → `em`, chữ kỳ vọng = phần trong `<em>` của fixture; thêm kiểm `font-style: normal`; fixture chưa có `<em>` thì skip có lý do.

## Không đổi
- tests/e2e/support/figma-exceptions.json E3: note là căn cứ tương phản accent 3.48:1 chữ lớn, không gắn `<span>`, vẫn áp cho `<em>` → giữ. (Ngoài phạm vi ghi của dev-fe.)
- Nút submit vẫn lấy `blocks.footer.newsletter_submit` ("Get 15% Off"); đổi sang setting là ES1-T304. Hệ quả: TC-20 ES1-T331 (forbidden_text "Get 15% Off" trên theme mới cài) còn đỏ do nhãn nút tới khi ES1-T304 merge; heading không còn góp chuỗi này.

## Store dev
Footer → Newsletter → Heading: "Get 15% Off Your First Order", italic "Get 15% Off" → `<em>Get 15% Off</em> Your First Order` (ES1-T468). Giá trị chữ thuần cũ vẫn hợp lệ với inline_richtext.

## Tự kiểm tra
- `shopify theme check`: 0 lỗi (23 warning có sẵn ở file khác, footer 0).
- Không file JS trong diff. CSS chỉ token.
- base.css nhỏ hơn develop 147 B thô; gzip chưa đo được trong sandbox → chờ CI (trần tạm 53 248).
- Type-check spec: chưa chạy (lệnh cần duyệt) → chờ CI.
- Playwright ES1-T181/ES1-T331, Lighthouse, ảnh 3 breakpoint, visual diff: chờ CI. Test màu `<em>` skip tới khi ES1-T468 xong.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
