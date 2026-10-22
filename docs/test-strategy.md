# Test strategy · QA · bản 0.1

## Phạm vi và loại
- Unit-ish: theme check (Liquid/schema/locale), JSON schema validate cho settings.
- UI: ảnh 3 breakpoint mỗi PR FE; visual diff so Figma (ngưỡng 2%).
- E2E: Playwright trên preview hoa-qua-nhap-khau (efitco-ai-dev), chromium desktop + Pixel 7; luồng mua (home → collection → filter → product → variant → add → drawer → checkout), search, cart page fallback không JS.
- A11y: axe trong Playwright 0 serious/critical; lhci accessibility ≥ 98; manual keyboard + screen reader mỗi story tương tác.
- Hiệu năng: lhci home/product/collection desktop + mobile, dữ liệu benchmark; ngưỡng 96/90.
- Chuẩn: checklist Theme Store (mã R) cuối sprint; checklist Canvas trên efitco-canvas cuối sprint; 10 yêu cầu Sidekick tuần 11.
- Trình duyệt: BrowserStack hoặc thiết bị thật cuối sprint 2 và 4 theo R9.

## Môi trường
hoa-qua-nhap-khau (efitco-ai-dev) có dữ liệu demo TE-9 (24 SP, có sale/hết hàng/biến thể/gift card); `STORE_PASSWORD` cho password page; preview URL từ CI.

## Pass/fail
Release lên Canvas khi: P1/P2 = 0; regression 100%; lhci đạt; checklist R bắt buộc 100%; Canvas 5 bước pass.

## Ai chạy gì
Dev tự chạy theme check + E2E của task; QA viết TC, chạy regression, checklist; DevOps giữ CI; agent qa làm nháp song song, người chấm.
