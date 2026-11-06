// ES1-T224: điều kiện chờ cụ thể thay networkidle. Trang có video, Shop giữ kết nối nên networkidle không bao giờ tới.
import type { Locator } from '@playwright/test';

// Mọi ảnh đang hiển thị trong màn hình của vùng đã tải xong. Ảnh ẩn (display none) hoặc ngoài màn hình chưa tới lượt tải nên không tính. Không có ảnh thì true.
export function visibleImagesLoaded(scope: Locator): Promise<boolean> {
  return scope.evaluate((root) =>
    [...root.querySelectorAll('img')]
      .filter((img) => {
        const box = img.getBoundingClientRect();
        return box.width > 0 && box.height > 0 && box.bottom > 0 && box.top < window.innerHeight;
      })
      .every((img) => img.complete));
}
