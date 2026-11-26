// ES1-T546 (theo ES1-T567): .alert 4 tone qua --alert-color, .alert--page, .alert__close 44 (foundation.md §35).
// Không gọi store: đọc file + dựng fixture bằng page.setContent với assets/base.css thật và token mặc định
// (settings_schema.json; alias trạng thái theo snippets/css-variables.liquid).
// Chạy: npx playwright test tests/e2e/ES1-T546.spec.ts --project=desktop
import { test, expect, type Page } from './support/test';
import { readFileSync } from 'node:fs';

const BASE = readFileSync('assets/base.css', 'utf8');
// critical.css nạp trước base.css như layout/theme.liquid (.visually-hidden của chữ ẩn trong .alert__close ở đây)
const CRITICAL = readFileSync('assets/critical.css', 'utf8');
const AUX = readFileSync('assets/aux.css', 'utf8');

// Hộp đo làm tròn 0.01 px (Pixel 7 DPR 2.625 cho 44.00006)
const size = (box: { width: number; height: number } | null) => ({ width: Math.round(box!.width * 100) / 100, height: Math.round(box!.height * 100) / 100 });

// Mọi rule có selector bắt đầu bằng .alert (bỏ comment)
const alertRules = (css: string) =>
  (css.replace(/\/\*[\s\S]*?\*\//g, '').match(/(^|\n)\.alert[^{]*\{[^}]*\}/g) ?? []).join('\n');

const TOKENS = `:root{--space-1:4px;--space-2:8px;--space-3:12px;--space-4:16px;--space-5:24px;--space-6:32px;
--radius-card:12px;--radius-pill:999px;--radius-button:8px;--icon-size-sm:16px;--icon-size-lg:24px;--touch-target:44px;
--color-background:#fff;--color-foreground:#1a1a1a;--color-muted:#4d4d4d;--color-border:#e5e5e5;
--color-accent:#c8400e;--color-accent-foreground:#fff;--color-sale:#c8102e;--color-badge-new:#467a48;
--color-success:var(--color-badge-new);--color-critical:var(--color-sale);--color-warning:var(--color-accent);
--font-size-sm:.875rem;--font-size-base:1rem;--line-height-body:1.5;--line-height-sm:1.4286;--font-primary--family:sans-serif;
--motion-fast:150ms;--ease-out:ease-out}`;

const RGB = {
  info: 'rgb(77, 77, 77)',
  success: 'rgb(70, 122, 72)',
  warning: 'rgb(200, 64, 14)',
  error: 'rgb(200, 16, 46)',
} as const;

const icon = '<span class="alert__icon"><svg viewBox="0 0 24 24"></svg></span>';
const close = (title: string, id: string) =>
  `<button type="button" class="alert__close" data-testid="${id}-close"><span class="visually-hidden">Dismiss: ${title}</span><svg viewBox="0 0 20 20" aria-hidden="true"></svg></button>`;
const alert = (cls: string, role: string, id: string, closable: boolean) =>
  `<div class="alert ${cls}" role="${role}" data-testid="${id}">${icon}<div class="alert__body"><p class="alert__title">Title ${id}</p><p class="alert__text">One sentence.</p></div>${closable ? close(`Title ${id}`, id) : ''}</div>`;

const FIXTURE = `<main style="padding:20px">
${alert('', 'alert', 'default', false)}
${alert('alert--info', 'status', 'info', true)}
${alert('alert--success', 'status', 'success', true)}
${alert('alert--warning', 'status', 'warning', true)}
${alert('alert--error', 'alert', 'error', false)}
${alert('alert--page alert--info', 'status', 'page-info', true)}
${alert('alert--page alert--error', 'alert', 'page-error', false)}
<div class="alert alert--info" role="status" data-testid="no-close">${icon}<div class="alert__body"><p class="alert__title">Title</p><p class="alert__text">One sentence.</p></div></div>
</main>`;

const mount = async (page: Page, width: number) => {
  await page.setViewportSize({ width, height: 1200 });
  await page.setContent(`<!doctype html><html><head><style>${TOKENS}${CRITICAL}${BASE}</style></head><body>${FIXTURE}</body></html>`);
};

test.describe('ES1-T546 tĩnh', () => {
  test.beforeEach(({}, ti) => { test.skip(ti.project.name !== 'desktop', 'tĩnh, chạy 1 lần'); });

  test('AC1 rule .alert* không đọc --color-sale; aux.css không còn .alert--success', () => {
    const rules = alertRules(BASE);
    expect(rules).toContain('.alert--page');
    expect(rules).toContain('.alert__close');
    expect(rules).not.toContain('color-sale');
    expect(rules).not.toMatch(/#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(/i);
    expect(AUX).not.toContain('.alert--success');
    expect(alertRules(AUX)).not.toContain('color-badge-new');
  });

  test('role: empty-state lỗi role=alert, contact thành công role=status + alert--success', () => {
    const empty = readFileSync('snippets/empty-state.liquid', 'utf8');
    expect(empty).toMatch(/class="alert alert--error" role="alert"/);
    expect(empty).not.toContain('alert__close');
    const contact = readFileSync('blocks/contact-form.liquid', 'utf8');
    expect(contact).toMatch(/class="alert alert--success contact-form__status" role="status"/);
    expect(contact).toMatch(/class="alert contact-form__alert" role="alert"/);
  });
});

test.describe('ES1-T546 fixture', () => {
  test('AC2 1280 alert lỗi: padding 16 / 24, gap 12, viền 1px --color-critical, icon 24', async ({ page }) => {
    await mount(page, 1280);
    const el = page.getByTestId('default');
    await expect(el).toHaveCSS('padding-top', '16px');
    await expect(el).toHaveCSS('padding-bottom', '16px');
    await expect(el).toHaveCSS('padding-left', '24px');
    await expect(el).toHaveCSS('padding-right', '24px');
    await expect(el).toHaveCSS('column-gap', '12px');
    await expect(el).toHaveCSS('border-top-width', '1px');
    await expect(el).toHaveCSS('border-top-color', RGB.error);
    await expect(el).toHaveCSS('border-radius', '12px');
    const svg = (await el.locator('.alert__icon svg').boundingBox())!;
    expect(size(svg)).toEqual({ width: 24, height: 24 });
    await expect(el.locator('.alert__icon')).toHaveCSS('color', RGB.error);
  });

  test('AC3 4 tone: viền + icon theo --alert-color; chữ giữ foreground', async ({ page }) => {
    await mount(page, 1280);
    for (const tone of ['info', 'success', 'warning', 'error'] as const) {
      const el = page.getByTestId(tone);
      await expect(el).toHaveCSS('border-top-color', RGB[tone]);
      await expect(el.locator('.alert__icon')).toHaveCSS('color', RGB[tone]);
      await expect(el.locator('.alert__title')).toHaveCSS('color', 'rgb(26, 26, 26)');
      await expect(el).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    }
  });

  test('AC3 .alert--page: thanh inline-start 4px, nền tone pha 6%', async ({ page }) => {
    await mount(page, 1280);
    for (const id of ['page-info', 'page-error']) {
      const el = page.getByTestId(id);
      await expect(el).toHaveCSS('border-left-width', '4px');
      await expect(el).toHaveCSS('border-right-width', '1px');
      await expect(el).toHaveCSS('border-top-width', '1px');
      await expect(el).not.toHaveCSS('background-color', 'rgb(255, 255, 255)');
    }
  });

  test('.alert__close 44 × 44, icon 16, muted, không đẩy cao alert', async ({ page }) => {
    for (const width of [360, 1280]) {
      await mount(page, width);
      const btn = page.getByTestId('info-close');
      expect(size(await btn.boundingBox())).toEqual({ width: 44, height: 44 });
      expect(size(await btn.locator('svg').boundingBox())).toEqual({ width: 16, height: 16 });
      await expect(btn).toHaveCSS('color', 'rgb(77, 77, 77)');
      const withClose = (await page.getByTestId('info').boundingBox())!.height;
      const without = (await page.getByTestId('no-close').boundingBox())!.height;
      expect(Math.abs(withClose - without)).toBeLessThanOrEqual(0.5);
      const alertBox = (await page.getByTestId('info').boundingBox())!;
      const btnBox = (await btn.boundingBox())!;
      expect(btnBox.x + btnBox.width).toBeLessThanOrEqual(alertBox.x + alertBox.width);
    }
  });

  test('360: không tràn ngang', async ({ page }) => {
    await mount(page, 360);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
