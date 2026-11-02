// Ticket ES1-T37 — TE-14 AC4: logical properties + icon chỉ hướng đảo :dir(rtl).
// Bản nháp của Dev FE (scope-guard chặn tests/): Orchestrator/QA chép vào tests/e2e/ES1-T37.spec.ts.
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T37.spec.ts
// Theme chưa có locale RTL nên test bật RTL bằng document.documentElement.dir = 'rtl'.
import { test, expect, type Page } from '@playwright/test';

const FLIP_ICONS = ['previous', 'next', 'arrow'] as const;
const STILL_ICONS = ['pause', 'play'] as const;

async function setDir(page: Page, dir: 'ltr' | 'rtl') {
  await page.evaluate(d => { document.documentElement.dir = d; }, dir);
}

const scaleOf = (page: Page, name: string) =>
  page.locator(`.slideshow-icon--${name}`).first().evaluate(el => getComputedStyle(el).scale);

test.describe('ES1-T37 icon RTL', () => {
  test('LTR: không icon nào bị lật', async ({ page }) => {
    await page.goto('/');
    for (const name of [...FLIP_ICONS, ...STILL_ICONS]) {
      if (!(await page.locator(`.slideshow-icon--${name}`).count())) continue;
      expect(await scaleOf(page, name), name).toBe('none');
    }
  });

  test('RTL: previous, next, arrow lật ngang; pause, play giữ nguyên', async ({ page }) => {
    await page.goto('/');
    await setDir(page, 'rtl');
    for (const name of FLIP_ICONS) {
      expect(await page.locator(`.slideshow-icon--${name}`).count(), `trang chủ có icon ${name}`).toBeGreaterThan(0);
      expect(await scaleOf(page, name), name).toBe('-1 1');
    }
    for (const name of STILL_ICONS) {
      if (!(await page.locator(`.slideshow-icon--${name}`).count())) continue;
      expect(await scaleOf(page, name), name).toBe('none');
    }
  });
});

test.describe('ES1-T37 logical properties', () => {
  test('container xuất --text-align start/center/end, không left/right', async ({ page }) => {
    await page.goto('/');
    const values = await page.locator('.block-container').evaluateAll(els =>
      els.map(el => (el as HTMLElement).style.getPropertyValue('--text-align').trim()),
    );
    expect(values.length).toBeGreaterThan(0);
    for (const v of values) expect(['start', 'center', 'end']).toContain(v);
  });

  test('RTL: text-align start của container căn phải', async ({ page }) => {
    await page.goto('/');
    await setDir(page, 'rtl');
    const container = page.locator('.block-container[style*="--text-align: start"]').first();
    await expect(container).toHaveCSS('text-align', 'start');
    const direction = await container.evaluate(el => getComputedStyle(el).direction);
    expect(direction).toBe('rtl');
  });

  test('1280: panel localization footer bám inline-end, đổi phía khi RTL', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');
    const disclosure = page.locator('.site-footer__disclosure');
    test.skip(!(await disclosure.count()), 'store chỉ 1 nước + 1 ngôn ngữ: footer không có localization');
    await disclosure.locator('summary').click();
    const panel = page.locator('.site-footer__panel');
    const edges = () =>
      panel.evaluate(el => {
        const p = el.getBoundingClientRect();
        const r = (el.offsetParent as HTMLElement).getBoundingClientRect();
        return { left: Math.round(p.left - r.left), right: Math.round(r.right - p.right) };
      });
    expect((await edges()).right, 'LTR: mép phải panel = mép phải nút').toBe(0);
    await setDir(page, 'rtl');
    expect((await edges()).left, 'RTL: mép trái panel = mép trái nút').toBe(0);
  });

  test('RTL: logo ảnh bám mép inline-start', async ({ page }) => {
    await page.goto('/');
    const logo = page.locator('.site-header__logo-image img').first();
    test.skip(!(await logo.count()), 'store chưa chọn logo ảnh');
    await expect(logo).toHaveCSS('object-position', '0% 50%');
    await setDir(page, 'rtl');
    await expect(logo).toHaveCSS('object-position', '100% 50%');
  });

  test('header sticky vẫn dính đỉnh (inset-block-start: 0)', async ({ page }) => {
    await page.goto('/');
    const wrapper = page.locator('.block-container:has(> .site-header[data-sticky])');
    test.skip(!(await wrapper.count()), 'setting sticky_header tắt');
    await expect(wrapper).toHaveCSS('top', '0px');
  });
});
