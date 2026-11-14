// KHÔNG CHẮC: ES1-T463 chưa chạy trên preview (máy agent không có PREVIEW_URL); chờ CI store-tests của PR. assets/header-sticky.js
// comment đầu file còn ghi "sentinel 80px", "header trong suốt" (lỗi thời, file BE, không ảnh hưởng hành vi).
// Ticket ES1-T16 (2727475000000129007) — TE-1 AC2, AC9: header-menu.js, header-sticky.js.
// Bổ sung phần ES1-T5.spec.ts chưa tự động: TB-17, resize drawer, sticky, lỗi mạng sticky.
// ES1-T463 (CTO 14/11, ES1-T439): AC thay cho bản header trong suốt + ngưỡng 80px:
//   docs/srs.md#TE-1 AC9 (0.3) + AC-H29: header tối mọi trang, không đè hero, dính từ đầu (CSS sticky, không cần JS);
//   docs/ui-spec/announcement-bar.md §4 (D8 task-split ES1-T307): data-scrolled gắn khi sentinel 1px trước container
//   header ra khỏi khung: không announcement bar thì cuộn > 1px, có bar 44px thì cuộn > 44px.
//   Đã bỏ: "trên hero: trong suốt ở đầu trang", "ngưỡng đúng 80px: 60px chưa gắn", "lỗi mạng: header trên hero không sticky".
//   Test case: drafts/qa/ES1-T463/test-cases.md (T16-xx).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T16.spec.ts
import { test, expect, type Page, type TestInfo } from '@playwright/test';

const isDesktop = (ti: TestInfo) => ti.project.name === 'desktop';

function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => {
    if (m.type() === 'error' && /header-(menu|sticky)/.test(m.location().url)) errors.push(m.text());
  });
  return errors;
}

// AC-H29 (SRS 0.5), TE-2 AC6: header là thanh tối mọi trang, không trong suốt, không đè hero.
// Nền, chữ theo setting mặc định background_dark_color #1A1A1A, background_dark_foreground_color #FFFFFF (Figma 1:362 trên 1:360).
const DARK = 'rgb(26, 26, 26)';
const WHITE = 'rgb(255, 255, 255)';

async function scrollTo(page: Page, y: number) {
  await page.evaluate(top => window.scrollTo({ top, behavior: 'instant' }), y);
}

// Vị trí sentinel 1px (layout/theme.liquid, ngay trước container header) tính theo tài liệu: header bắt đầu dính khi cuộn tới đây.
async function sentinelTop(page: Page) {
  return page.getByTestId('header-sticky-sentinel').evaluate(el => el.getBoundingClientRect().top + window.scrollY);
}

async function firstParent(page: Page) {
  const nav = page.getByTestId('header-menu');
  const item = nav.getByTestId('header-menu-item').filter({ has: page.getByTestId('header-menu-toggle') }).first();
  return { item, toggle: item.getByTestId('header-menu-toggle'), submenu: item.getByTestId('header-submenu') };
}

test.describe('ES1-T16 header-menu', () => {
  test('mở mục này đóng mục kia, đồng bộ aria-expanded', async ({ page }, ti) => {
    test.skip(!isDesktop(ti), 'desktop');
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    const toggles = page.getByTestId('header-menu').getByTestId('header-menu-toggle');
    test.skip((await toggles.count()) < 2, 'main-menu cần ≥ 2 mục có con');
    // Dùng hover, không click: click trong lúc hover đã mở sẽ đóng lại, test thành phụ thuộc thời gian.
    await toggles.nth(0).hover();
    await expect(toggles.nth(0)).toHaveAttribute('aria-expanded', 'true');
    await toggles.nth(1).hover();
    await expect(toggles.nth(1)).toHaveAttribute('aria-expanded', 'true');
    await expect(toggles.nth(0)).toHaveAttribute('aria-expanded', 'false');
  });

  test('rời header không đóng dropdown đang dùng bàn phím', async ({ page }, ti) => {
    test.skip(!isDesktop(ti), 'desktop');
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    const { item, toggle, submenu } = await firstParent(page);
    await item.hover();
    await expect(submenu).toBeVisible();
    await page.mouse.move(5, 795);
    await expect(submenu).toBeHidden();

    await toggle.focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    await item.hover();
    await page.mouse.move(5, 795);
    await page.waitForTimeout(400); // quá HOVER_DELAY để chắc timer đã chạy
    await expect(submenu).toBeVisible();
  });

  test('Esc khi hover không cướp focus', async ({ page }, ti) => {
    test.skip(!isDesktop(ti), 'desktop');
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    const { item, toggle, submenu } = await firstParent(page);
    await item.hover();
    await expect(submenu).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(submenu).toBeHidden();
    await expect(toggle).not.toBeFocused();
  });

  test('host custom element ẩn, không có console error', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/');
    const header = page.getByTestId('header');
    await expect(header.locator('header-menu')).toHaveCount(1);
    await expect(header.locator('header-menu')).toBeHidden();
    await expect(header.locator('header-drawer')).toHaveCount(1);
    await expect(header.locator('header-drawer')).toBeHidden();
    if ((await header.getAttribute('data-sticky')) !== null) {
      await expect(header.locator('sticky-header')).toHaveCount(1);
      await expect(header.locator('sticky-header')).toBeHidden();
    }
    expect(errors).toEqual([]);
  });
});

test.describe('ES1-T16 header-drawer', () => {
  test('TB-17 focus trap: Tab/Shift+Tab không thoát drawer, body không cuộn', async ({ page }, ti) => {
    test.skip(isDesktop(ti), 'mobile');
    await page.goto('/');
    await page.getByTestId('header-drawer-toggle').click();
    const drawer = page.getByTestId('header-drawer');
    await expect(drawer).toBeVisible();
    const close = drawer.getByTestId('header-drawer-close');
    await expect(close, 'mở drawer phải chuyển focus vào panel').toBeFocused();

    const inDrawer = () => drawer.evaluate(el => el.contains(document.activeElement));
    await page.keyboard.press('Shift+Tab');
    expect(await inDrawer(), 'Shift+Tab từ phần tử đầu thoát drawer').toBeTruthy();
    await expect(close).not.toBeFocused();
    await page.keyboard.press('Tab');
    await expect(close, 'Tab từ phần tử cuối phải quay về đầu').toBeFocused();
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press('Tab');
      expect(await inDrawer(), `Tab lần ${i + 1} thoát drawer`).toBeTruthy();
    }
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflowY)).toBe('hidden');
  });

  test('trap bỏ qua link trong accordion đang đóng', async ({ page }, ti) => {
    test.skip(isDesktop(ti), 'mobile');
    await page.goto('/');
    await page.getByTestId('header-drawer-toggle').click();
    const drawer = page.getByTestId('header-drawer');
    await expect(drawer).toBeVisible();
    const hiddenLinks = drawer.getByTestId('header-drawer-submenu').getByRole('link', { includeHidden: true });
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press('Tab');
      for (const link of await hiddenLinks.all()) await expect(link).not.toBeFocused({ timeout: 100 });
    }
  });

  test('backdrop đóng và trả focus về toggle', async ({ page }, ti) => {
    test.skip(isDesktop(ti), 'mobile');
    await page.goto('/');
    const toggle = page.getByTestId('header-drawer-toggle');
    await toggle.click();
    const drawer = page.getByTestId('header-drawer');
    await expect(drawer).toBeVisible();
    const size = page.viewportSize()!;
    await page.mouse.click(size.width - 5, size.height / 2);
    await expect(drawer).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
  });

  test('resize từ 80rem trở lên thì đóng drawer', async ({ page }, ti) => {
    test.skip(isDesktop(ti), 'mobile');
    await page.goto('/');
    const toggle = page.getByTestId('header-drawer-toggle');
    await toggle.click();
    await expect(page.getByTestId('header-drawer')).toBeVisible();
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.setViewportSize({ width: 412, height: 780 });
    await expect(page.getByTestId('header-drawer')).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
});

test.describe('ES1-T16 sticky-header', () => {
  test('T16-01 cuộn qua sentinel gắn data-scrolled, về đầu thì bỏ, nền tối không phải --color-background', async ({ page }) => {
    await page.goto('/');
    const header = page.getByTestId('header');
    test.skip((await header.getAttribute('data-sticky')) === null, 'sticky_header đang tắt');
    await expect(header).toHaveAttribute('data-header-enhanced', '');
    await expect(header).not.toHaveAttribute('data-scrolled');

    await scrollTo(page, (await sentinelTop(page)) + 100);
    await expect(header).toHaveAttribute('data-scrolled', '');
    const background = await page.evaluate(() => {
      const probe = document.createElement('div');
      probe.style.backgroundColor = 'var(--color-background)';
      document.body.append(probe);
      const value = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return value;
    });
    // Mọi trang: nền tối như Figma 1:362 (CTO 07/11, AC-H29), không dùng --color-background
    expect(background).not.toBe(DARK);
    await expect(header).toHaveCSS('background-color', DARK);

    await scrollTo(page, 0);
    await expect(header).not.toHaveAttribute('data-scrolled');
  });

  // T16-03, T16-04 (ES1-T463; announcement-bar.md §4; TE-1 AC9): sentinel 1px ngay trước container header (thay khối 80px cũ).
  // data-scrolled gắn đúng lúc header bắt đầu dính: không bar thì cuộn > 1px, có bar 44 thì cuộn > 44.
  // Kiểm cả 2 nhánh bất kể store dev có bật bar hay không: nhánh thiếu dựng bằng DOM (gỡ bar / chèn khối 44px trước sentinel),
  // IntersectionObserver đo lại theo vị trí mới nên không phụ thuộc dữ liệu store.
  async function expectThreshold(page: Page, barHeight: number, label: string) {
    const header = page.getByTestId('header');
    await scrollTo(page, 0);
    await expect(header, `${label}: ở đầu trang chưa gắn`).not.toHaveAttribute('data-scrolled');
    const start = await sentinelTop(page);
    expect(Math.abs(start - barHeight), `${label}: sentinel nằm ngay dưới bar (y ${barHeight})`).toBeLessThanOrEqual(1);
    const headerTop = await header.evaluate(el => el.getBoundingClientRect().top + window.scrollY);
    expect(Math.abs(headerTop - start), `${label}: header bắt đầu ngay tại sentinel, sentinel không đẩy bố cục`).toBeLessThanOrEqual(1);
    const heightAtTop = (await header.boundingBox())!.height;

    if (barHeight >= 1) {
      await scrollTo(page, barHeight - 1);
      await page.waitForTimeout(200); // IntersectionObserver báo bất đồng bộ
      await expect(header, `${label}: cuộn ${barHeight - 1} chưa gắn`).not.toHaveAttribute('data-scrolled');
      expect((await header.boundingBox())!.y, `${label}: trước ngưỡng header chưa dính`).toBeGreaterThan(0);
    }

    // +2: sentinel cao 1px, IntersectionObserver coi mép chạm khung nhìn vẫn là giao nhau
    await scrollTo(page, barHeight + 2);
    await expect(header, `${label}: cuộn ${barHeight + 2} phải gắn`).toHaveAttribute('data-scrolled', '');
    const box = (await header.boundingBox())!;
    expect(Math.abs(box.y), `${label}: đã gắn data-scrolled thì header đang dính ở mép trên`).toBeLessThanOrEqual(0.5);
    expect(box.height, `${label}: dính chỉ thêm bóng, không đổi chiều cao`).toBeCloseTo(heightAtTop, 0);
    await expect(header, `${label}: nền không đổi khi dính`).toHaveCSS('background-color', DARK);

    await scrollTo(page, 0);
    await expect(header, `${label}: về đầu trang thì bỏ`).not.toHaveAttribute('data-scrolled');
  }

  test('T16-03 ngưỡng sentinel 1px: không announcement bar thì gắn khi cuộn > 1px', async ({ page }) => {
    await page.goto('/');
    const header = page.getByTestId('header');
    test.skip((await header.getAttribute('data-sticky')) === null, 'sticky_header đang tắt');
    test.skip((page.viewportSize()?.height ?? 0) <= 480, 'dưới 30rem cao header thôi dính (TE-10 AC8)');
    await expect(header).toHaveAttribute('data-header-enhanced', '');
    // Store dev có bar thì gỡ container chứa bar để dựng trường hợp không bar.
    await page.getByTestId('announcement-bar').evaluateAll(els => els.forEach(el => (el.closest('.block-container') ?? el).remove()));
    await expectThreshold(page, 0, 'không bar');
  });

  test('T16-04 ngưỡng sentinel 1px: có announcement bar 44px thì gắn khi cuộn > 44px', async ({ page }) => {
    await page.goto('/');
    const header = page.getByTestId('header');
    test.skip((await header.getAttribute('data-sticky')) === null, 'sticky_header đang tắt');
    test.skip((page.viewportSize()?.height ?? 0) <= 480, 'dưới 30rem cao header thôi dính (TE-10 AC8)');
    await expect(header).toHaveAttribute('data-header-enhanced', '');
    const bar = page.getByTestId('announcement-bar');
    let barHeight: number;
    if (await bar.count()) {
      // Bar thật của store dev: cao tối thiểu 44 mọi mốc (announcement-bar.md §3), cuộn đi cùng trang.
      const barBox = (await bar.boundingBox())!;
      expect(barBox.height, 'announcement bar cao ≥ 44').toBeGreaterThanOrEqual(43.5);
      // Ngưỡng = đáy bar (đang ở đầu trang): sentinel và header phải nằm ngay dưới bar.
      barHeight = barBox.y + barBox.height;
    } else {
      // Store dev chưa bật bar: chèn khối 44px đúng chỗ bar (trước sentinel) để kiểm ngưỡng.
      await page.getByTestId('header-sticky-sentinel').evaluate(el => {
        const fake = document.createElement('div');
        fake.style.blockSize = '44px';
        fake.dataset.qaFakeBar = '';
        el.before(fake);
      });
      barHeight = 44;
    }
    await expectThreshold(page, Math.round(barHeight), 'có bar');
  });

  test('T16-02 AC-H29: header luôn nền tối, chữ trắng ở đầu trang và khi cuộn, không trong suốt', async ({ page }) => {
    await page.goto('/');
    const header = page.getByTestId('header');
    await expect(header).toHaveCSS('background-color', DARK);
    await expect(header).toHaveCSS('color', WHITE);
    test.skip((await header.getAttribute('data-sticky')) === null, 'sticky_header đang tắt: phần khi cuộn không áp');
    await scrollTo(page, (await sentinelTop(page)) + 100);
    await expect(header).toHaveAttribute('data-scrolled', '');
    await expect(header).toHaveCSS('background-color', DARK);
    await expect(header).toHaveCSS('color', WHITE);
  });

  test('T16-05 lỗi mạng header-sticky.js: main nằm dưới đáy header, header vẫn nền tối, CSS sticky vẫn chạy', async ({ page }) => {
    await page.route('**/header-sticky*.js*', r => r.abort());
    await page.goto('/');
    const header = page.getByTestId('header');
    await expect(header).not.toHaveAttribute('data-header-enhanced');

    // AC-H29, TE-2 AC6: không đè hero, nội dung đầu main bắt đầu ngay dưới header (cao 80 từ 80rem).
    const headerBox = (await header.boundingBox())!;
    const mainBox = (await page.locator('main#MainContent').boundingBox())!;
    expect(mainBox.y, 'main không được chui dưới header').toBeGreaterThanOrEqual(headerBox.y + headerBox.height - 0.5);

    await scrollTo(page, 400);
    await expect(header).not.toHaveAttribute('data-scrolled');
    await expect(header).toHaveCSS('background-color', DARK);
    await expect(header).toHaveCSS('color', WHITE);
    if ((await header.getAttribute('data-sticky')) !== null && (page.viewportSize()?.height ?? 0) > 480) {
      // position: sticky là CSS (critical.css), không cần JS; JS chỉ thêm bóng
      expect(Math.abs((await header.boundingBox())!.y), 'không JS header vẫn dính').toBeLessThanOrEqual(0.5);
    }
  });
});
