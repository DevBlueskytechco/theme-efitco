// KHÔNG CHẮC: spec chưa chạy (phiên viết không có trình duyệt, không preview, không gọi mạng) → chờ CI.
// Thẻ <script> page-layers.js trong layout/theme.liquid do FE/Orchestrator thêm (scope-guard chặn dev-be ghi layout/, hỏi ES1-T438):
// test tĩnh "layout" fail tới khi có. Test chạy thật tự nạp module từ URL asset của preview nếu thẻ chưa có, để kiểm hành vi độc lập.
// Ticket ES1-T314 TE-10-R2-BE1: assets/page-layers.js ≤ 2 048 B (ADR 0007 mục 6, ADR 0010; layers.md §4, §5; SRS TE-10 AC6, AC7).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T314.spec.ts
import { readFileSync, statSync } from 'node:fs';
import { test, expect, type Page } from '@playwright/test';
import { expectNotChallenged } from './support/store-guard';
import { watchShopPay403 } from './support/console-guard';
import { CONSENT } from './support/consent';

const JS_FILE = 'assets/page-layers.js';
const LAYOUT = 'layout/theme.liquid';
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|shopifysvc\.com|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];
const BASE_URL = process.env.STORE_ORIGIN || (process.env.PREVIEW_URL ? new URL(process.env.PREVIEW_URL).origin : undefined);

const htmlHas = (page: Page, attr: string) => page.evaluate((a) => document.documentElement.hasAttribute(a), attr);
const expectFlag = (page: Page, attr: string, on: boolean) => expect.poll(() => htmlHas(page, attr)).toBe(on);
const consentHeight = (page: Page) => page.evaluate(() => parseFloat(document.documentElement.style.getPropertyValue('--consent-height')) || 0);

function watchConsole(page: Page) {
  const errors: string[] = [];
  const isShopPay403 = watchShopPay403(page);
  page.on('console', (msg) => {
    if (msg.type() !== 'error' || isShopPay403(msg)) return;
    if (IGNORE_CONSOLE.some((r) => r.test(msg.text()) || r.test(msg.location().url))) return;
    errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

/** Đếm số lần layers:idle phát trên document kể từ lúc gọi. */
async function countIdle(page: Page) {
  await page.evaluate(() => {
    (window as any).__idle = 0;
    document.addEventListener('layers:idle', () => ((window as any).__idle += 1));
  });
  return () => page.evaluate(() => (window as any).__idle as number);
}

/** Layout chưa có thẻ script thì nạp page-layers.js từ cùng thư mục asset với motion.js của preview. */
async function ensureModule(page: Page) {
  const has = await page.evaluate(() => !!customElements.get('page-layers'));
  if (has) return;
  const url = await page.evaluate(() => {
    const src = document.querySelector<HTMLScriptElement>('script[src*="/assets/motion.js"]')?.src;
    return src ? src.replace(/motion\.js(\?.*)?$/, 'page-layers.js') : null;
  });
  expect(url, 'không tìm thấy URL asset của theme để nạp page-layers.js').toBeTruthy();
  await page.addScriptTag({ url: url!, type: 'module' });
  await page.waitForFunction(() => !!customElements.get('page-layers'));
}
async function openPage(page: Page, path = '/') {
  await page.goto(path);
  await expectNotChallenged(page);
  await ensureModule(page);
  await expect(page.getByTestId('page-layers')).toHaveCount(1);
}

/** Dialog modal thật (cart drawer, cart_type = drawer); store đặt cart_type = page thì chèn 1 dialog thử. */
async function modalDialog(page: Page) {
  const drawer = page.getByTestId('cart-drawer-dialog');
  if (await drawer.count()) return drawer;
  await page.evaluate(() => document.body.insertAdjacentHTML('beforeend', '<dialog data-testid="es1-t314-modal"><button>x</button></dialog>'));
  return page.getByTestId('es1-t314-modal');
}

test.describe('ES1-T314 tĩnh', () => {
  test('trần 2 048 B (ADR 0007, 0010), không console, không fetch, không import tĩnh, guard define', () => {
    expect(statSync(JS_FILE).size).toBeLessThanOrEqual(2048);
    const js = readFileSync(JS_FILE, 'utf8');
    expect(js).not.toMatch(/console\.|fetch\(|partials|^\s*import\s/m);
    expect(js).toContain('if (!customElements.get("page-layers")) customElements.define("page-layers"');
    // Không tự tạo thẻ host, không style inline ngoài custom property --consent-height
    expect(js).not.toMatch(/createElement|insertAdjacent|innerHTML|\.style\.(?!setProperty\("--consent-height")/);
    for (const hook of ['data-layer-open', 'data-consent', '--consent-height', 'data-inbox', 'layers:idle', 'visitorConsentCollected', 'ResizeObserver', 'inboxSelector']) {
      expect(js, hook).toContain(hook);
    }
  });

  test('hook khớp với markup FE và CSS (layout, base.css)', () => {
    const layout = readFileSync(LAYOUT, 'utf8');
    const css = readFileSync('assets/base.css', 'utf8');
    expect(layout.match(/<page-layers\b/g) ?? []).toHaveLength(1);
    expect(layout).toMatch(/<page-layers[^>]*data-inbox-selector="[^"]+"/);
    for (const sel of ['html[data-inbox]', '[data-layer-open]', '[data-consent]', '--consent-height']) expect(css, sel).toContain(sel);
    // Selector Inbox trong CSS trùng data-inbox-selector (một nguồn, base.css ghi chú)
    const inbox = layout.match(/data-inbox-selector="([^"]+)"/)![1];
    for (const part of inbox.split(',').map((s) => s.trim())) expect(css, part).toContain(part);
  });

  test('layout: đúng 1 thẻ script module page-layers.js (FE/Orchestrator thêm, xem PR)', () => {
    const layout = readFileSync(LAYOUT, 'utf8');
    const tags = layout.match(/<script[^>]*'page-layers\.js'\s*\|\s*asset_url[^>]*>/g) ?? [];
    expect(tags).toHaveLength(1);
    expect(tags[0]).toContain('type="module"');
  });
});

test.describe('ES1-T314 lớp (layers.md §4)', () => {
  test('tải trang: không cờ lớp, consent tắt khi đã chọn cookie, 0 lỗi console', async ({ page }) => {
    const errors = watchConsole(page);
    for (const path of ['/', '/collections/all', '/cart', '/search?q=a']) {
      await openPage(page, path);
      await expectFlag(page, 'data-layer-open', false);
      await expectFlag(page, 'data-consent', false);
      expect(await consentHeight(page)).toBe(0);
    }
    expect(errors).toEqual([]);
  });

  test('dialog modal (cart drawer) mở → data-layer-open; đóng → gỡ + layers:idle', async ({ page }) => {
    await openPage(page);
    const idle = await countIdle(page);
    // Mở bằng showModal như cart-drawer.js; không phụ thuộc giỏ có hàng
    await (await modalDialog(page)).evaluate((d: HTMLDialogElement) => d.showModal());
    await expectFlag(page, 'data-layer-open', true);
    expect(await idle()).toBe(0);
    await page.keyboard.press('Escape');
    await expectFlag(page, 'data-layer-open', false);
    await expect.poll(idle).toBe(1);
  });

  test('[data-layer][aria-expanded=true] (mega, localization, big offer) và [data-layer] > dialog[open] không modal', async ({ page }) => {
    await openPage(page);
    await page.evaluate(() => {
      const b = document.createElement('button');
      b.dataset.layer = 'test';
      b.dataset.testid = 'es1-t314-trigger';
      b.setAttribute('aria-expanded', 'false');
      const w = document.createElement('div');
      w.dataset.layer = 'offer';
      w.innerHTML = '<dialog data-testid="es1-t314-popover">x</dialog>';
      document.querySelector('main')!.append(b, w);
    });
    const idle = await countIdle(page);
    const trigger = page.getByTestId('es1-t314-trigger');
    await trigger.evaluate((b) => b.setAttribute('aria-expanded', 'true'));
    await expectFlag(page, 'data-layer-open', true);
    await trigger.evaluate((b) => b.setAttribute('aria-expanded', 'false'));
    await expectFlag(page, 'data-layer-open', false);
    await page.getByTestId('es1-t314-popover').evaluate((d: HTMLDialogElement) => d.show());
    await expectFlag(page, 'data-layer-open', true);
    await page.getByTestId('es1-t314-popover').evaluate((d: HTMLDialogElement) => d.close());
    await expectFlag(page, 'data-layer-open', false);
    await expect.poll(idle).toBe(2);
  });

  test('ô nhập đang focus: không bật data-layer-open (thanh đáy giữ) nhưng chặn layers:idle tới khi rời ô', async ({ page }) => {
    await openPage(page);
    // CI #204: selector 'input[type=email]' chung trúng ô ẩn (app trên store dev) → focus() không ăn.
    // Bám data-testid của footer; footer tắt bản tin thì chèn 1 ô thử hiển thị.
    let field = page.getByTestId('footer-newsletter-email');
    if (!(await field.isVisible())) {
      await page.evaluate(() => document.querySelector('main')!.insertAdjacentHTML('beforeend', '<input type="email" aria-label="t" data-testid="es1-t314-field">'));
      field = page.getByTestId('es1-t314-field');
    }
    await field.scrollIntoViewIfNeeded();
    const idle = await countIdle(page);
    await field.click();
    await expect(field).toBeFocused();
    await expectFlag(page, 'data-layer-open', false);
    expect(await idle()).toBe(0);
    await field.blur();
    await expect.poll(idle).toBe(1);
  });

  test('iframe đang focus (Inbox, video): chặn layers:idle, rời iframe → layers:idle', async ({ page }) => {
    await openPage(page);
    await page.evaluate(() => document.querySelector('main')!.insertAdjacentHTML('beforeend', '<iframe data-testid="es1-t314-frame" title="t" srcdoc="<button>b</button>"></iframe>'));
    const frame = page.getByTestId('es1-t314-frame');
    await frame.scrollIntoViewIfNeeded();
    const idle = await countIdle(page);
    await page.frameLocator('[data-testid="es1-t314-frame"]').getByRole('button').click();
    await expect.poll(() => page.evaluate(() => document.activeElement?.tagName)).toBe('IFRAME');
    await expectFlag(page, 'data-layer-open', false);
    expect(await idle()).toBe(0);
    // Rời iframe về trang: không có focusin ở trang, chỉ window focus
    await page.evaluate(() => (document.activeElement as HTMLElement).blur());
    await expect.poll(() => page.evaluate(() => document.activeElement?.tagName)).toBe('BODY');
    await expect.poll(idle).toBe(1);
  });

  test('thanh đáy, teaser ẩn khi lớp mở (CSS FE theo cờ của JS)', async ({ page }) => {
    await openPage(page);
    await page.evaluate(() => {
      const bar = document.createElement('aside');
      bar.className = 'product-sticky-bar';
      bar.dataset.testid = 'es1-t314-bar';
      bar.textContent = 'bar';
      document.body.append(bar);
    });
    await (await modalDialog(page)).evaluate((d: HTMLDialogElement) => d.showModal());
    await expectFlag(page, 'data-layer-open', true);
    await expect(page.getByTestId('es1-t314-bar')).toHaveCSS('visibility', 'hidden');
  });
});

test.describe('ES1-T314 Shopify Inbox (TE-10 AC6)', () => {
  test('phần tử khớp data-inbox-selector chèn muộn → html[data-inbox], gỡ → bỏ cờ', async ({ page }) => {
    await openPage(page);
    const selector = await page.getByTestId('page-layers').getAttribute('data-inbox-selector');
    const id = selector!.split(',')[0].trim().replace(/^#/, '');
    // Store dev có Inbox thật thì cờ đã bật sẵn; ghi lại để QA đối chiếu selector thật (KHÔNG CHẮC selector)
    test.info().annotations.push({ type: 'inbox-that', description: String(await htmlHas(page, 'data-inbox')) });
    if (await htmlHas(page, 'data-inbox')) return;
    await page.evaluate((i) => {
      const el = document.createElement('div');
      el.id = i;
      document.body.append(el);
    }, id);
    await expectFlag(page, 'data-inbox', true);
    await page.evaluate((i) => document.getElementById(i)!.remove(), id);
    await expectFlag(page, 'data-inbox', false);
  });
});

test.describe('ES1-T314 banner consent (TE-10 AC7, layers.md §5)', () => {
  test('giả lập banner đáy: data-consent + --consent-height = chiều cao; visitorConsentCollected → gỡ, layers:idle', async ({ page }) => {
    await openPage(page);
    const idle = await countIdle(page);
    await page.evaluate(() => {
      const el = document.createElement('div');
      el.id = 'shopify-pc__banner';
      el.style.cssText = 'position:fixed;inset-inline:0;bottom:0;height:200px';
      document.body.append(el);
    });
    await expectFlag(page, 'data-consent', true);
    await expect.poll(() => consentHeight(page)).toBe(200);
    // Banner đổi cỡ (mở phần tuỳ chọn) → ResizeObserver đo lại
    await page.evaluate(() => (document.getElementById('shopify-pc__banner')!.style.height = '260px'));
    await expect.poll(() => consentHeight(page)).toBe(260);
    expect(await idle()).toBe(0);
    await page.evaluate(() => document.dispatchEvent(new Event('visitorConsentCollected')));
    await expectFlag(page, 'data-consent', false);
    await expect.poll(() => consentHeight(page)).toBe(0);
    await expect.poll(idle).toBe(1);
  });

  test('banner ẩn (cao 0) hoặc bị gỡ → bỏ cờ', async ({ page }) => {
    await openPage(page);
    await page.evaluate(() => {
      const el = document.createElement('div');
      el.id = 'shopify-pc__banner';
      el.style.cssText = 'position:fixed;inset-inline:0;bottom:0;height:120px';
      document.body.append(el);
    });
    await expectFlag(page, 'data-consent', true);
    await page.evaluate(() => (document.getElementById('shopify-pc__banner')!.style.display = 'none'));
    await expectFlag(page, 'data-consent', false);
    await page.evaluate(() => document.getElementById('shopify-pc__banner')!.remove());
    await expectFlag(page, 'data-consent', false);
  });

  test('banner thật của Shopify (context không cookie consent): hiện → cờ bật; Decline → gỡ', async ({ browser }) => {
    // Không dùng state.json (đã Decline ở global setup); vẫn cần cookie mật khẩu storefront nên đi qua trang mật khẩu bằng storageState rồi xoá cookie consent.
    const context = await browser.newContext({ storageState: 'tests/setup/state.json', baseURL: BASE_URL });
    await context.clearCookies({ name: CONSENT.cookie });
    const page = await context.newPage();
    const errors = watchConsole(page);
    await openPage(page);
    const banner = page.locator(CONSENT.banner).first();
    const shown = await banner.waitFor({ state: 'visible', timeout: 15_000 }).then(() => true, () => false);
    test.info().annotations.push({ type: 'consent-banner-that', description: String(shown) });
    if (shown) {
      await expectFlag(page, 'data-consent', true);
      await page.locator(CONSENT.decline).first().click();
      await banner.waitFor({ state: 'hidden', timeout: 10_000 });
      await expectFlag(page, 'data-consent', false);
    } else {
      await expectFlag(page, 'data-consent', false);
    }
    expect(errors).toEqual([]);
    await context.close();
  });
});
