// Ticket ES1-T16 (2727475000000129007) — TE-1 AC2, AC9: header-menu.js, header-sticky.js.
// Bổ sung phần ES1-T5.spec.ts chưa tự động: TB-17, resize drawer, sticky, lỗi mạng sticky.
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

// Hero TE-2 chưa merge: giả lập hook data-header-overlay trong con đầu của main.
async function simulateHero(page: Page) {
  await page.evaluate(() => {
    const hook = document.createElement('div');
    hook.setAttribute('data-header-overlay', '');
    document.querySelector('main')?.firstElementChild?.append(hook);
  });
}

async function scrollTo(page: Page, y: number) {
  await page.evaluate(top => window.scrollTo({ top, behavior: 'instant' }), y);
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
  test('cuộn quá 80px gắn data-scrolled, về đầu thì bỏ, nền là --color-background', async ({ page }) => {
    await page.goto('/');
    const header = page.getByTestId('header');
    test.skip((await header.getAttribute('data-sticky')) === null, 'sticky_header đang tắt');
    await expect(header).toHaveAttribute('data-header-enhanced', '');
    await expect(header).not.toHaveAttribute('data-scrolled');

    await scrollTo(page, 100);
    await expect(header).toHaveAttribute('data-scrolled', '');
    const background = await page.evaluate(() => {
      const probe = document.createElement('div');
      probe.style.backgroundColor = 'var(--color-background)';
      document.body.append(probe);
      const value = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return value;
    });
    await expect(header).toHaveCSS('background-color', background);

    await scrollTo(page, 0);
    await expect(header).not.toHaveAttribute('data-scrolled');
  });

  test('ngưỡng đúng 80px: 60px chưa gắn, 100px có gắn', async ({ page }) => {
    await page.goto('/');
    const header = page.getByTestId('header');
    test.skip((await header.getAttribute('data-sticky')) === null, 'sticky_header đang tắt');
    await scrollTo(page, 60);
    await page.waitForTimeout(200); // IntersectionObserver báo bất đồng bộ
    await expect(header).not.toHaveAttribute('data-scrolled');
    await scrollTo(page, 100);
    await expect(header).toHaveAttribute('data-scrolled', '');
  });

  test('trên hero: trong suốt ở đầu trang, cuộn thì nền đặc', async ({ page }) => {
    await page.goto('/');
    const header = page.getByTestId('header');
    test.skip((await header.getAttribute('data-sticky')) === null, 'sticky_header đang tắt');
    await simulateHero(page);
    await expect(header).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await scrollTo(page, 100);
    await expect(header).toHaveAttribute('data-scrolled', '');
    await expect(header).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  });

  test('lỗi mạng header-sticky.js: header trên hero không sticky, không có chữ trắng trên nền trắng', async ({ page }) => {
    await page.route('**/header-sticky*.js*', r => r.abort());
    await page.goto('/');
    const header = page.getByTestId('header');
    await expect(header).not.toHaveAttribute('data-header-enhanced');
    await simulateHero(page);
    await scrollTo(page, 400);
    const box = await header.boundingBox();
    expect(box!.y + box!.height, 'header trong suốt không được dính khi không có JS').toBeLessThanOrEqual(0);
  });
});
