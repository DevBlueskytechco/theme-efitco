KHÔNG CHẮC: Figma 1:1104 không đọc được (api.figma.com bị chặn) nên bố cục footer là suy từ docs/figma-inventory.md; 4 text trust bar và newsletter_text không có nguồn nên mặc định rỗng → trust bar KHÔNG hiện ngoài editor, chưa đạt "mặc định theo Figma 1:1107"; icon trust bar là bộ tạm. Đã tạo ticket question cho Designer.

Tiêu đề: feat(blocks): dựng block footer đầy đủ [ES1-T15]

## Làm gì
- blocks/footer.liquid: newsletter (customer form, tag newsletter, success/error), menu default footer (có con → cột, không con → list phẳng), social 6 mạng, Follow on Shop, localization gộp `USD / EN`, payment, trust bar 4 mục, wordmark shop.name, copyright.
- snippets/icon-social.liquid, snippets/icon-trust.liquid (SVG inline aria-hidden).
- config/settings_schema.json: nhóm Social 6 url, thứ tự tiktok, instagram, youtube, facebook, x, pinterest.
- assets/base.css: thay phần Footer, chỉ dùng token. locales: chuỗi storefront + label schema.
- Đủ 13 testid hợp đồng QA. Không JS.

## Vì sao
ES1-T15, TE-1 AC5, AC6, AC9 (localization gộp); task-split D4, D8; ES1-T19 (trust bar, wordmark, social).

## Cách test
`shopify theme check --path .`
`npx playwright test tests/e2e/ES1-T5.spec.ts -g "TC-2[89]|TC-3[0-7]|TC-31"`
Preview URL + theme_id: lấy từ CI sau khi Orchestrator push.

## Ảnh (360 / 768 / 1280)
Chưa có: không có preview tại máy (CLI không ghi được preferences trong sandbox). Lấy từ preview CI.

## Checklist
- [x] theme check 0 lỗi
- [ ] Lighthouse: chưa đo, cần preview
- [x] Không file ngoài phía FE (không .js)
- [x] Chuỗi qua | t; URL qua routes.* (link menu/social lấy từ setting)
- [x] KHÔNG CHẮC: xem dòng đầu

## Ghi chú cho reviewer
- PR ~830 dòng, vượt ngưỡng 400 của skill: 1 block + CSS + schema 4 nhóm trust bar lặp, không tách được hợp lý theo ticket. Tech Lead quyết.
- Ticket và task-split ghi `--text-wordmark`; code thực tế là `--font-size-wordmark` (ES1-T12). Dùng biến đang có.
- Spec tests/e2e/ES1-T5.spec.ts chưa có trên develop; hook chặn dev-fe ghi tests/ nên chưa bỏ fixme. TC-31 click `footer-country-option` khi `<details>` đóng sẽ timeout: QA thêm bước mở summary (`.site-footer__summary`) trước khi click.
- Có thể conflict nhẹ với ES1-T14 ở assets/base.css (Header liền kề Footer) và locales. Class ẩn chữ riêng `.site-footer__hidden-label` vì `.visually-hidden` của T14 chưa merge.
- `<details>` localization không tự đóng khi click ra ngoài hoặc Esc: giới hạn của không JS, đúng phạm vi ticket.
- Icon social vẽ từ path SVG viết tay/nhớ, chưa nhìn trên trình duyệt: kiểm ở ảnh preview.
