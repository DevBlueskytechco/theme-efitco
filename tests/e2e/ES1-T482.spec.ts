// Ticket ES1-T482 (bug ES1-T330-B01, TE-22 AC7): từ 80rem ô bấm mục menu cấp 1 ≥ 44px, link dropdown C ≥ 40px,
// thanh header giữ cao 80 và chữ giữ toạ độ Figma (navigation.md §5.1, §8).
// Chạy: npx playwright test tests/e2e/ES1-T482.spec.ts --project=desktop
import { readFileSync } from 'node:fs';
import { test, expect } from './support/test';
import { gotoStore, watchStore } from './support/store-guard';

const desktopOnly = (name: string) => test.skip(name !== 'desktop', 'chỉ đo ở ≥ 80rem (Desktop Chrome 1280)');

test.describe('ES1-T482 CSS (tĩnh)', () => {
  test.beforeEach(({}, ti) => desktopOnly(ti.project.name));

  test('TC-01 base.css 80rem: link dropdown C min-height 40, mục cấp 1 padding-block bù margin âm', () => {
    const css = readFileSync('assets/base.css', 'utf8');
    expect(css).toContain('.site-header__submenu .site-header__link { min-height: 40px;');
    expect(css).not.toMatch(/\.site-header__submenu \.site-header__link \{ min-height: 36px/);
    expect(css).toContain('.site-header__item > .site-header__link, .site-header__item > details > .site-header__link { padding-block: 10px; margin-block: -10px; }');
    expect(css).toContain('.site-header__item:nth-child(n + 5) > .site-header__link, .site-header__item:nth-child(n + 5) > details > .site-header__link { padding-block: 9px; margin-block: -9px; }');
  });
});

test.describe('ES1-T482 store thật', () => {
  test.describe.configure({ retries: 0 });

  test('TC-02 trang chủ 1280: mục cấp 1 cao ≥ 44, header 80, link dropdown C cao ≥ 40', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    const watch = watchStore(page);
    await gotoStore(page, '/');
    const header = page.getByTestId('header');
    const menu = page.getByTestId('header-menu');
    await expect(menu).toBeVisible();

    const headerBox = await header.boundingBox();
    expect(Math.round(headerBox?.height ?? 0), 'thanh header phải giữ cao 80').toBe(80);

    const items = menu.locator(':scope > ul > li > .site-header__link, :scope > ul > li > details > .site-header__link');
    const count = await items.count();
    expect(count, 'menu header không có mục cấp 1').toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const box = await items.nth(i).boundingBox();
      expect(box?.height ?? 0, `mục cấp 1 #${i + 1} cao < 44`).toBeGreaterThanOrEqual(44);
      // Ô bấm nằm gọn trong thanh 80, không tràn xuống hero
      expect((box?.y ?? 0) + (box?.height ?? 0), `mục cấp 1 #${i + 1} tràn khỏi thanh header`).toBeLessThanOrEqual((headerBox?.y ?? 0) + 80);
    }

    const toggleC = menu.locator('li:not(.site-header__item--mega) > details > summary[data-testid="header-menu-toggle"]').first();
    if ((await toggleC.count()) === 0) {
      await watch.finish();
      test.skip(true, 'menu store dev không có mục dropdown C: thiếu dữ liệu, không coi là đạt');
      return;
    }
    await toggleC.click();
    const links = toggleC.locator('xpath=..').getByTestId('header-submenu').locator('.site-header__link');
    await expect(links.first()).toBeVisible();
    const linkCount = await links.count();
    for (let i = 0; i < linkCount; i++) {
      const box = await links.nth(i).boundingBox();
      expect(box?.height ?? 0, `link dropdown C #${i + 1} cao < 40`).toBeGreaterThanOrEqual(40);
    }
    await watch.finish();
  });
});
