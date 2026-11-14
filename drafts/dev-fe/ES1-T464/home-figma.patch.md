KHÔNG CHẮC: scope-guard chặn dev-fe ghi tests/fixtures/ và tests/e2e/support/; patch dưới đây chờ QA (ES1-T331) áp và áp lại fixture trên store dev.

# Patch fixture ES1-T331 cho ES1-T464

File: tests/fixtures/home-figma.json, khối `"scope": "layout:theme", "type": "footer"`.

```diff
-        "newsletter_heading": "Get 15% Off Your First Order",
+        "newsletter_heading": "<em>Get 15% Off</em> Your First Order",
```

Store dev (hoa-qua-nhap-khau): Theme editor → Footer → Newsletter → Heading: nhập "Get 15% Off Your First Order", bôi đen "Get 15% Off" bấm Italic. Giá trị lưu: `<em>Get 15% Off</em> Your First Order`.

Giá trị cũ (chữ thuần) vẫn hợp lệ với inline_richtext, nên store chưa áp lại vẫn render heading; chỉ test màu `<em>` trong tests/e2e/ES1-T181.spec.ts skip tới khi fixture có `<em>`.

`newsletter_button_label`: giữ ở `pending_settings` tới khi ES1-T304 merge (schema footer chưa có id này). Spec ES1-T181 đọc `settings.newsletter_button_label ?? pending_settings.newsletter_button_label`, không cần sửa spec khi khoá chuyển.

tests/e2e/support/figma-exceptions.json E3: giữ nguyên. Note "Footer Get 15% Off dùng accent, chữ lớn 3.48:1 trên #1A1A1A đạt AA chữ lớn" là căn cứ tương phản cho phần nhấn, không gắn với thẻ `<span>`, vẫn áp cho `<em>`.
