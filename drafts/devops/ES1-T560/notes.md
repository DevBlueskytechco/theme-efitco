KHÔNG CHẮC: chưa làm được. Phạm vi file của ticket nằm trong repo ai-team (mcp/shot.js, mcp/store_dev_server.py, ops/render_mockups.py); phiên devops này chỉ đọc/ghi được worktree theme-efitco-agent. Không đọc được ai-team/data/design-audit/render-tools-ES1-T535/ hay mcp/shot.js hiện tại, cũng không chạy được node_modules/playwright (symlink ra ngoài worktree, bị sandbox chặn).

# ES1-T560: trạng thái 2026-11-23

## Đã kiểm trong worktree theme
- Blocker ES1-T567: Closed, ai-dat, PR #307 đã merge.
- Mockup: `ls drafts/designer/*/*.html | wc -l` = 26 trang, khớp "26 trang × 4 khổ" trong ticket.
- AC1, nguồn: drafts/designer/ES1-T251/foundation.html có đủ `section[aria-labelledby=h-button|h-state|h-toast]`.
- AC2, nền: render_mockup (shot.js hiện tại) với ES1-T293/index.html ở 1920, draft=true → cao 14 589 px, errors []. Dưới ngưỡng 15 000 nên với mockup hiện tại AC2 không ra partNN. Muốn kiểm nhánh partNN phải có thêm trang > 15 000 px (đề xuất: bản ghép tạm, hoặc trang khác ở 360).
- AC3, nền: index.html có 53 `<img>`, 0 `loading="lazy"`. Ảnh lazy (nếu có) nằm trong trang khác; cần grep lại khi chạy ở ai-team.
- Ảnh 1920 xem bằng mắt: đủ khối từ header tới footer, không có vùng trắng ở cuối.

## Chưa làm (cần chạy trong repo ai-team)
- mcp/shot.js: giữ JSON cũ; thêm `sections`; reducedMotion 'reduce', deviceScaleFactor 1; img.decode() + document.fonts.ready sau khi cuộn; section animations 'disabled', timeout 8000, fallback tắt animation/transition, sau đó clip theo toạ độ + notes; trang > 15 000 px chụp đoạn 8 000 px, bỏ sticky, `<name>-<w>.partNN.png`; JPEG > 65 500 px cắt -p2/-p3; THEME_DIR/tham số thay đường dẫn cứng.
- mcp/store_dev_server.py: render_mockup thêm tham số `sections`.
- ops/render_mockups.py từ render_all.py.
- Kiểm AC1–AC5 + render 26 × 4, so với 126 PNG đang commit; PR vào ai-team.

## Cần để chạy lại
Orchestrator giao ticket này cho phiên có worktree ai-team (đọc/ghi mcp/, ops/, data/design-audit/render-tools-ES1-T535/) và chạy được playwright/chromium; hoặc CTO làm trực tiếp ở ai-team.
