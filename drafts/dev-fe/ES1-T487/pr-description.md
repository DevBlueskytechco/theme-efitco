KHÔNG CHẮC: (1) spec tests/e2e/ES1-T386.spec.ts TC-35 (~dòng 811) đòi img có fetchpriority="high" ở ≥1024 — mâu thuẫn AC12 vì HTML server không đổi theo viewport; sau PR này TC-35 @1280 đỏ và TC-36 @360/@768 báo "expected to fail but passed" tới khi QA sửa spec (ES1-T497). (2) Dedupe giữa preload và img dựa trên URL image_url trùng khớp srcset của image_tag; chưa đo trên preview (chờ CI). (3) Lighthouse insight "LCP request discovery" ở desktop dựa vào fetchpriority của preload thay vì img — chờ CI xác nhận.

# ES1-T487 Bug FE (ES1-T386-B02): ảnh password fetchpriority="high" cả dưới 64rem — TE-21 AC12

## Thay đổi
- `blocks/password-hero.liquid`
  - img ảnh password: bỏ `fetchpriority: 'high'`, giữ `loading: 'eager'`, sizes `(min-width: 64rem) 50vw, 100vw`, srcset 720/1080/1440 → mọi mốc không còn fetchpriority (AC12 dưới 64rem; LCP mobile là h1, AC16).
  - Thêm `<link rel="preload" as="image" media="(min-width: 64rem)" fetchpriority="high" imagesrcset imagesizes data-testid="password-media-preload">` là con đầu của root block, chỉ khi có ảnh. srcset dựng cùng bộ width 720/1080/1440 (bỏ width lớn hơn ảnh gốc), imagesizes trùng sizes img → trình duyệt dùng lại file preload, desktop vẫn ưu tiên cao.
  - `{% doc %}`: ghi cơ chế ưu tiên ảnh và testid mới.
- Không đổi CSS (link `display: none` mặc định, không có selector con theo vị trí trong `.password-hero`). Không file JS.

## Hook cho QA
- `[data-testid=password-media-preload]`: `media="(min-width: 64rem)"`, `fetchpriority="high"`, `imagesizes` = `sizes` của img.
- Ticket QA sửa spec: ES1-T497 (TC-35 nhánh ≥1024 kiểm link preload; TC-36 gỡ `test.fail`).

## Tự kiểm tra
- `shopify theme check`: 0 lỗi, không thêm warning ở password-hero (22 warning có sẵn ở file khác).
- Không đổi `.theme-check.yml`, không file JS trong diff.
- Playwright ES1-T386 TC-35/TC-36, Lighthouse /password desktop/mobile, ảnh 3 breakpoint: chờ CI.
- Ảnh rỗng: không render link preload, không img (giữ hành vi cũ).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
