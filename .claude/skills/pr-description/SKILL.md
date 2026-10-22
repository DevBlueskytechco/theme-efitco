---
name: pr-description
description: Template PR của team. Dùng khi tạo hoặc cập nhật PR.
---
Tiêu đề: `<type>(<scope>): <mô tả> [<ticket>]`
Body:
```
## Làm gì
## Vì sao (link ticket, AC liên quan)
## Cách test (lệnh + preview URL + theme_id)
## Ảnh (360 / 768 / 1280) — bắt buộc nếu có UI
## Checklist
- [ ] theme check 0 lỗi
- [ ] Lighthouse: perf ≥ 96 desktop / ≥ 90 mobile, a11y ≥ 98 (link report)
- [ ] Không file ngoài phía của tôi (FE: không .js; BE: JS + partial)
- [ ] Chuỗi qua | t; URL qua routes.*
- [ ] KHÔNG CHẮC: (nếu có)
```
PR ≤ 400 dòng thay đổi; lớn hơn thì tách.
