// KHÔNG CHẮC: spec chưa chạy (lượt agent không có trình duyệt, preview, mạng) → chờ CI.
// Ticket ES1-T509 (bug ES1-T330-B02): header-menu.js — timer hover 150 ms mở lại mega sau khi bấm trigger đóng.
// Sửa: click trong nav huỷ timer hover; bấm đóng thì hover bỏ qua mục đó tới khi rê sang mục khác hoặc rời header.
// Hồi quy chính là ES1-T330 TC-04; spec này phủ thêm các nhánh hover + click. Cần main-menu store dev có mục mega (ES1-T271).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T509.spec.ts
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect, type Page, type TestInfo } from './support/test';
import { watchShopPay403 } from './support/console-guard';
import { expectNotChallenged, gotoStore } from './support/store-guard';

const MENU = readFileSync(join(process.cwd(), 'assets/header-menu.js'), 'utf8');
const HOVER_WAIT = 400; // > 150 ms trễ hover trong header-menu.js
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|shopifysvc\.com|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];

const isDesktop = (ti: TestInfo) => ti.project.name === 'desktop';
const nav = (page: Page) => page.getByTestId('header-menu');
const navItems = (page: Page) => nav(page).getByTestId('header-menu-item');
const megaItems = (page: Page) => navItems(page).filter({ has: page.locator('details[data-mega]') });

function parts(page: Page, nth = 0) {
  const item = megaItems(page).nth(nth);
  return { item, toggle: item.getByTestId('header-menu-toggle'), panel: item.getByTestId('header-mega-panel') };
}

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

async function open(page: Page) {
  await gotoStore(page, '/');
  await expectNotChallenged(page);
  await page.waitForFunction(() => !!customElements.get('header-menu'));
  const n = await megaItems(page).count();
  test.skip(n < 1, 'main-menu store dev cần ≥ 1 mục mega (ES1-T271)');
}

/** Bấm hai lần liền (< 150 ms) đúng điểm giữa trigger: timer hover từ pointerover còn treo khi bấm lần 2. */
async function doubleToggle(page: Page, toggle: ReturnType<typeof parts>['toggle']) {
  const b = (await toggle.boundingBox())!;
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await page.mouse.down();
  await page.mouse.up();
  await page.mouse.down();
  await page.mouse.up();
}

test.describe('ES1-T509 tĩnh', () => {
  test('header-menu.js ≤ 3 072 B (ADR 0010, ES1-T329), click trong nav huỷ timer hover, không console', () => {
    expect(Buffer.byteLength(MENU)).toBeLessThanOrEqual(3072);
    expect(MENU).toMatch(/on\(nav, "click"[\s\S]*?clearTimeout\(this\.t\)/);
    expect(MENU).not.toMatch(/\bconsole\./);
    expect(MENU).toMatch(/if \(!customElements\.get\("header-menu"\)\)/);
  });
});

test.describe('ES1-T509 bấm trigger không bị timer hover mở lại', () => {
  test.beforeEach(async ({ page }, ti) => {
    test.skip(!isDesktop(ti), 'desktop');
    await page.setViewportSize({ width: 1280, height: 900 });
  });

  test('B-01 bấm mở rồi bấm đóng liền (< 150 ms): sau 400 ms panel vẫn đóng, aria-expanded false, 0 lỗi console', async ({ page }) => {
    const errors = watchConsole(page);
    await open(page);
    const { toggle, panel } = parts(page);
    await doubleToggle(page, toggle);
    await page.waitForTimeout(HOVER_WAIT);
    await expect(panel).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(errors).toEqual([]);
  });

  test('B-02 hover mở, bấm trigger đóng: rê trong trigger không mở lại; rời sang mục khác rồi quay lại thì hover mở', async ({ page }) => {
    await open(page);
    test.skip((await navItems(page).count()) < 2, 'main-menu cần ≥ 2 mục cấp 1');
    const { toggle, panel } = parts(page);
    await toggle.hover();
    await expect(panel).toBeVisible();
    await toggle.click();
    await expect(panel).toBeHidden();
    // Rê qua chữ và chevron trong trigger: pointerover mới trên cùng mục
    const b = (await toggle.boundingBox())!;
    for (const x of [b.x + 4, b.x + b.width - 4, b.x + b.width / 2]) await page.mouse.move(x, b.y + b.height / 2);
    await page.waitForTimeout(HOVER_WAIT);
    await expect(panel).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    // Rê sang mục cấp 1 khác rồi quay lại: hover hoạt động lại
    const megaIndex = (await navItems(page).evaluateAll((lis) => lis.map((li) => !!li.querySelector('details[data-mega]')))).indexOf(true);
    await navItems(page).nth(megaIndex === 0 ? 1 : 0).locator('summary, a').first().hover();
    await page.waitForTimeout(HOVER_WAIT);
    await toggle.hover();
    await expect(panel).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  test('B-03 bấm scrim đóng rồi rê lại trigger thì hover mở (scrim không chặn hover)', async ({ page }) => {
    await open(page);
    const { toggle, panel } = parts(page);
    await toggle.click();
    await expect(panel).toBeVisible();
    const box = (await panel.boundingBox())!;
    const y = Math.min(box.y + box.height + 40, 895);
    test.skip(y <= box.y + box.height, 'panel cao kín khung nhìn, không còn vùng scrim');
    await page.mouse.click(640, y);
    await expect(panel).toBeHidden();
    await toggle.hover();
    await expect(panel).toBeVisible();
  });

  test('B-04 bấm mở một lần (timer hover treo từ pointerover): sau 400 ms vẫn mở, Esc đóng', async ({ page }) => {
    await open(page);
    const { toggle, panel } = parts(page);
    await toggle.click();
    await page.waitForTimeout(HOVER_WAIT);
    await expect(panel).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
  });
});
