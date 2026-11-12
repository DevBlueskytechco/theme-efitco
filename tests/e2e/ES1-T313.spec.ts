// ES1-T313 (TE-10-R2-FE2): khung lớp và trạng thái chung. Không gọi store: đọc file + dựng fixture bằng
// page.setContent với assets/base.css thật và token mặc định của config/settings_schema.json (space_base 4).
// Chạy: npx playwright test tests/e2e/ES1-T313.spec.ts --project=desktop
import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const BASE = readFileSync('assets/base.css', 'utf8');
const CRITICAL = readFileSync('assets/critical.css', 'utf8');
const START = '/** Khung lớp và trạng thái chung (TE-10-R2-FE2';
const END = '/** Hello world block';
const section = () => {
  const from = BASE.indexOf(START);
  return BASE.slice(from, BASE.indexOf(END, from));
};

// Token mặc định (settings_schema.json); css-variables.liquid là nguồn thật trên store.
const TOKENS = `:root{--space-1:4px;--space-2:8px;--space-3:12px;--space-4:16px;--space-5:24px;--space-6:32px;--space-7:48px;--space-8:120px;
--page-margin:20px;--page-width:91rem;--header-height:80px;--radius-input:8px;--radius-button:8px;--radius-card:12px;--radius-pill:999px;
--color-background:#fff;--color-foreground:#1a1a1a;--color-muted:#6b6b6b;--color-muted-light:#808080;--color-border:#e5e5e5;
--color-background-alt:#f4f4f5;--color-background-alt-foreground:#1a1a1a;--color-background-dark:#1a1a1a;--color-background-dark-foreground:#fff;
--color-background-panel:#393942;--color-accent:#c8400e;--color-accent-foreground:#fff;--color-sale:#c8102e;--color-badge-new:#467a48;
--font-size-xs:.8125rem;--font-size-sm:.875rem;--font-size-base:1rem;--font-size-h3:1.5rem;--font-size-h2:2rem;--line-height-body:1.5;--line-height-heading:1.1;
--font-heading--family:serif;--font-heading--weight-display:800;--font-primary--family:sans-serif;
--motion-fast:150ms;--motion-base:250ms;--motion-slow:500ms;--motion-hero:1400ms;--ease-out:ease-out}`;

const FIXTURE = `
<div class="toast-region" data-testid="toast-region">
  <div class="toast toast--success" role="status" data-testid="toast-success">
    <span class="toast__icon"><svg viewBox="0 0 24 24"></svg></span>
    <div class="toast__body"><p class="toast__title">Added to cart</p><p class="toast__text">Bench</p></div>
    <button type="button" class="close-button toast__close" data-testid="toast-dismiss"><span class="visually-hidden">Dismiss: Added to cart</span><svg viewBox="0 0 20 20"></svg></button>
  </div>
</div>
<div class="carousel-nav"><button class="round-button" data-testid="round" aria-label="Next"></button><button class="round-button" data-testid="round-hidden" hidden aria-label="Back"></button></div>
<button class="round-button" data-testid="round-plain-hidden" hidden aria-label="Back"></button>
<div class="empty-state" data-testid="empty"><span class="empty-state__icon" data-testid="empty-icon"><svg viewBox="0 0 24 24"></svg></span><h2 class="empty-state__heading">Your cart is empty</h2></div>
<div class="alert" role="alert" data-testid="alert"><span class="alert__icon"><svg viewBox="0 0 24 24"></svg></span><div class="alert__body"><h2 class="alert__title">Could not load</h2></div></div>
<div aria-busy="true"><div class="skeleton-card"><span class="skeleton skeleton--media" data-testid="sk-media"></span><span class="skeleton skeleton--line"></span><span class="skeleton skeleton--line skeleton--short" data-testid="sk-short"></span></div></div>
<modal-dialog data-layer="quick-view"><dialog class="dialog dialog--m" data-testid="dialog" aria-labelledby="dt"><div class="dialog__header"><h2 class="dialog__title" id="dt">Quick view</h2></div><button class="close-button dialog__close" data-testid="dialog-close" aria-label="Close"></button><div class="dialog__body">Body</div></dialog></modal-dialog>
<modal-dialog data-layer="cart"><dialog class="drawer drawer--end drawer--wide" data-testid="drawer" aria-labelledby="dr"><div class="drawer__header"><h2 class="drawer__title" id="dr">Cart</h2><button class="close-button" aria-label="Close cart"></button></div><div class="drawer__body"></div><div class="drawer__footer"></div></dialog></modal-dialog>`;

const mount = async (page: Page, width: number) => {
  await page.setViewportSize({ width, height: 900 });
  await page.setContent(`<!doctype html><html><head><style>${TOKENS}${CRITICAL}${BASE}</style></head><body>${FIXTURE}</body></html>`);
};
const box = async (page: Page, id: string) => (await page.getByTestId(id).boundingBox())!;

test.describe('ES1-T313 tĩnh', () => {
  test.beforeEach(({}, ti) => { test.skip(ti.project.name !== 'desktop', 'tĩnh, chạy 1 lần'); });

  test('TC-01 mục CSS chung: 0 màu literal, 0 thuộc tính vật lý, 0 z-index số, 0 width/height', () => {
    const css = section().replace(/\/\*[\s\S]*?\*\//g, '');
    expect(css.length).toBeGreaterThan(1000);
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(|:\s*(white|black)\b/i);
    expect(css).not.toMatch(/(^|[\s;{])(left|right|top|bottom|width|height|(margin|padding)-(left|right|top|bottom))\s*:/m);
    expect(css).not.toMatch(/z-index:\s*-?\d/);
  });

  test('TC-02 .carousel-nav__button không còn kiểu riêng, snippet dùng .round-button', () => {
    expect(BASE).not.toContain('.carousel-nav__button');
    const nav = readFileSync('snippets/carousel-nav.liquid', 'utf8');
    expect(nav.match(/class="round-button carousel-nav__button/g)).toHaveLength(2);
  });

  test('TC-03 empty-state: 2 kiểu, chuỗi qua tham số hoặc | t, testid, role="alert" ở kiểu lỗi', () => {
    const src = readFileSync('snippets/empty-state.liquid', 'utf8');
    const body = src.slice(src.indexOf('{% enddoc %}'));
    expect(body).toContain("'general.try_again' | t");
    expect(body).toContain('role="alert"');
    expect(body).toContain('data-retry');
    expect(body).toMatch(/data-testid="\{\{ state_testid \}\}-button"/);
    expect(body).not.toMatch(/href="\//);
    const locale = JSON.parse(readFileSync('locales/en.default.json', 'utf8'));
    expect(locale.general).toEqual({ dismiss: 'Dismiss:', try_again: 'Try Again' });
  });

  test('TC-04 template toast trong layout: 4 loại, role đúng, nút đóng có tên "Dismiss: {tiêu đề}"', () => {
    const layout = readFileSync('layout/theme.liquid', 'utf8');
    expect(layout).toContain('<template data-testid="toast-template">');
    expect(layout).toContain("'info,success,warning,error' | split: ','");
    expect(layout).toMatch(/toast_type == 'warning' or toast_type == 'error' %\}alert\{% else %\}status/);
    expect(layout).toContain("{{ 'general.dismiss' | t }} <span data-toast-dismiss-title></span>");
  });

  test('TC-05 kích thước 1280: dialog M 720, drawer 480, nút đóng 48, toast đóng 44, tròn 52, empty icon 72', async ({ page }) => {
    await mount(page, 1280);
    await page.evaluate(() => { for (const d of document.querySelectorAll('dialog')) (d as HTMLDialogElement).show(); });
    expect((await box(page, 'dialog')).width).toBe(720);
    expect((await box(page, 'drawer')).width).toBe(480);
    expect(await box(page, 'dialog-close')).toMatchObject({ width: 48, height: 48 });
    expect(await box(page, 'toast-dismiss')).toMatchObject({ width: 44, height: 44 });
    expect(await box(page, 'round')).toMatchObject({ width: 52, height: 52 });
    expect(await box(page, 'empty-icon')).toMatchObject({ width: 72, height: 72 });
    expect((await box(page, 'toast-region')).width).toBe(400);
  });

  test('TC-06 360: dialog là bottom sheet rộng 100%, sát đáy; drawer 90%; toast rộng màn trừ 16', async ({ page }) => {
    await mount(page, 360);
    await page.evaluate(() => { for (const d of document.querySelectorAll('dialog')) (d as HTMLDialogElement).show(); });
    const sheet = await box(page, 'dialog');
    expect(sheet.width).toBe(360);
    expect(Math.round(sheet.y + sheet.height)).toBe(900);
    expect((await box(page, 'drawer')).width).toBe(324);
    expect((await box(page, 'toast-region')).width).toBe(328);
  });

  test('TC-07 768: drawer 420, dialog giữa màn', async ({ page }) => {
    await mount(page, 768);
    await page.evaluate(() => { for (const d of document.querySelectorAll('dialog')) (d as HTMLDialogElement).show(); });
    expect((await box(page, 'drawer')).width).toBe(420);
    const dialog = await box(page, 'dialog');
    expect(dialog.width).toBe(720);
    expect(Math.round(dialog.x)).toBe(24);
  });

  test('TC-08 nút tròn ở đầu/cuối hàng mờ 0.35, ngoài hàng cuộn [hidden] vẫn ẩn', async ({ page }) => {
    await mount(page, 1280);
    await expect(page.getByTestId('round-hidden')).toHaveCSS('opacity', '0.35');
    await expect(page.getByTestId('round-plain-hidden')).toBeHidden();
  });

  test('TC-09 alert viền sale 1px; skeleton media 1:1, dòng ngắn 40%', async ({ page }) => {
    await mount(page, 1280);
    await expect(page.getByTestId('alert')).toHaveCSS('border-top-width', '1px');
    await expect(page.getByTestId('alert')).toHaveCSS('border-top-color', 'rgb(200, 16, 46)');
    const media = await box(page, 'sk-media');
    expect(media.width).toBe(media.height);
    const short = await box(page, 'sk-short');
    expect(Math.round(short.width)).toBe(Math.round(media.width * 0.4));
  });

  test('TC-10 giảm chuyển động: skeleton đứng yên, dialog không trượt', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await mount(page, 360);
    const shimmer = await page.getByTestId('sk-media').evaluate((el) => getComputedStyle(el, '::after').animationName);
    expect(shimmer).toBe('none');
    await page.evaluate(() => (document.querySelector('[data-testid="dialog"]') as HTMLDialogElement).show());
    await expect(page.getByTestId('dialog')).toHaveCSS('translate', 'none');
  });
});
