// KHÔNG CHẮC: spec chưa chạy (phiên viết không có preview, chưa type-check); scope-guard chặn dev-fe ghi tests/ → Orchestrator chép sang tests/e2e/ES1-T119.spec.ts.
// Ticket ES1-T119 TE-7-FE2: FAQ (docs/srs.md#TE-7 AC2, AC5; drafts/techlead/ES1-T114/task-split.md D1, D2, D4, D7, D8).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T119.spec.ts -g "AC2|AC5"
// Biến thể chạy trên /?view=te7 (templates/index.te7.liquid), mặc định schema chạy trên /.
import { test, expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { watchShopPay403 } from './support/console-guard';

const TE7 = '/?view=te7';
const HOME = '/';
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];

const tid = (scope: Page | Locator, id: string) => scope.getByTestId(id);
const band = (page: Page, id: string) => page.getByTestId(`container-${id}`);
const item = (page: Page, id: string) => page.locator(`[data-faq-item-id="${id}"]`);
const openItem = (page: Page, id: string) => page.locator(`[data-faq-item-id="${id}"][open]`);
const question = (page: Page, id: string) => tid(item(page, id), 'faq-question');

function watchConsole(page: Page) {
  const errors: string[] = [];
  const isShopPay403 = watchShopPay403(page);
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    if (isShopPay403(msg)) return;
    if (IGNORE_CONSOLE.some((r) => r.test(msg.text()) || r.test(msg.location().url))) return;
    errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

async function expectNoSeriousAxe(page: Page) {
  const { violations } = await new AxeBuilder({ page }).analyze();
  const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(serious.map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
}

// Cây accessibility của chính Chromium qua CDP, không phải snapshot tự tính của Playwright
async function expandedNodes(page: Page) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Accessibility.enable');
  const { nodes } = await cdp.send('Accessibility.getFullAXTree');
  await cdp.detach();
  return nodes.flatMap((node) => {
    const expanded = node.properties?.find((p) => p.name === 'expanded');
    if (!expanded) return [];
    return [{ role: node.role?.value, name: node.name?.value, expanded: expanded.value.value }];
  });
}

test.describe('ES1-T119 TE-7 FAQ', () => {
  test('AC2 đúng số câu: 1, 3, 5, 10', async ({ page }) => {
    await page.goto(TE7);
    await expect(tid(band(page, 'te7-faq-one'), 'faq-item')).toHaveCount(1);
    await expect(tid(band(page, 'te7-faq-multiple'), 'faq-item')).toHaveCount(3);
    await expect(tid(band(page, 'te7-faq'), 'faq-item')).toHaveCount(5);
    await expect(tid(band(page, 'te7-faq-ten'), 'faq-item')).toHaveCount(10);
  });

  test('AC2 tắt allow_multiple: mọi thẻ cùng 1 name; bật: không thẻ nào có name', async ({ page }) => {
    await page.goto(TE7);
    const names = await tid(band(page, 'te7-faq'), 'faq-item').evaluateAll((els) => els.map((el) => el.getAttribute('name')));
    expect(names).toHaveLength(5);
    expect(names[0]).toMatch(/^faq-.+/);
    expect(new Set(names).size).toBe(1);

    await expect(band(page, 'te7-faq-multiple').locator('details[name]')).toHaveCount(0);
  });

  test('AC2 hai khối cùng tắt allow_multiple không chung name', async ({ page }) => {
    await page.goto(TE7);
    const nameOf = (id: string) => tid(band(page, id), 'faq-item').first().getAttribute('name');
    const figma = await nameOf('te7-faq');
    const one = await nameOf('te7-faq-one');
    const ten = await nameOf('te7-faq-ten');
    expect(new Set([figma, one, ten]).size).toBe(3);
  });

  test('AC2 tắt: mở câu 2 thì câu 1 đóng', async ({ page }) => {
    await page.goto(TE7);
    await expect(openItem(page, 'te7-faq-figma-1')).toHaveCount(1);
    await question(page, 'te7-faq-figma-2').click();
    await expect(openItem(page, 'te7-faq-figma-2')).toHaveCount(1);
    await expect(openItem(page, 'te7-faq-figma-1')).toHaveCount(0);
    await expect(band(page, 'te7-faq').locator('details[open]')).toHaveCount(1);
  });

  test('AC2 bật: cả 2 cùng mở', async ({ page }) => {
    await page.goto(TE7);
    await expect(openItem(page, 'te7-faq-many-1')).toHaveCount(1);
    await question(page, 'te7-faq-many-2').click();
    await expect(openItem(page, 'te7-faq-many-1')).toHaveCount(1);
    await expect(openItem(page, 'te7-faq-many-2')).toHaveCount(1);
  });

  test('AC2 Enter và Space mở đóng', async ({ page }) => {
    await page.goto(TE7);
    const summary = question(page, 'te7-faq-figma-3');
    await summary.focus();
    await page.keyboard.press('Enter');
    await expect(openItem(page, 'te7-faq-figma-3')).toHaveCount(1);
    await page.keyboard.press('Enter');
    await expect(openItem(page, 'te7-faq-figma-3')).toHaveCount(0);
    await page.keyboard.press('Space');
    await expect(openItem(page, 'te7-faq-figma-3')).toHaveCount(1);
    await page.keyboard.press('Space');
    await expect(openItem(page, 'te7-faq-figma-3')).toHaveCount(0);
  });

  test('AC2 câu trả lời chỉ hiện khi mở; câu không có answer không có vùng trả lời', async ({ page }) => {
    await page.goto(TE7);
    await expect(tid(item(page, 'te7-faq-figma-1'), 'faq-answer')).toBeVisible();
    await expect(tid(item(page, 'te7-faq-figma-2'), 'faq-answer')).toBeHidden();
    await expect(tid(item(page, 'te7-faq-many-3'), 'faq-answer')).toHaveCount(0);
  });

  test('AC2 accessibility tree Chromium: tên câu hỏi đúng, trạng thái mở đọc được', async ({ page }, testInfo) => {
    await page.goto(TE7);
    const nameOpen = 'How long does shipping take?';
    const nameClosed = 'Are adjustable dumbbells easy for beginners?';

    const before = await expandedNodes(page);
    expect(before.find((n) => n.name === nameOpen)?.expanded).toBe(true);
    expect(before.find((n) => n.name === nameClosed)?.expanded).toBe(false);

    await question(page, 'te7-faq-figma-2').click();
    await expect(openItem(page, 'te7-faq-figma-2')).toHaveCount(1);
    const after = await expandedNodes(page);
    expect(after.find((n) => n.name === nameOpen)?.expanded).toBe(false);
    expect(after.find((n) => n.name === nameClosed)?.expanded).toBe(true);

    const evidence = JSON.stringify({ before: before.filter((n) => n.name === nameOpen || n.name === nameClosed), after: after.filter((n) => n.name === nameOpen || n.name === nameClosed) }, null, 2);
    await testInfo.attach('faq-ax-tree', { body: evidence, contentType: 'application/json' });
    console.log(`faq-ax-tree ${testInfo.project.name}: ${evidence}`);
  });

  test('AC2 câu hỏi là h3 trong summary, chạm từ 44px ở 360 và 1280', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto(TE7);
    const summary = question(page, 'te7-faq-figma-2');
    await expect(summary.locator('h3')).toHaveText('Are adjustable dumbbells easy for beginners?');
    expect((await summary.boundingBox())!.height).toBeGreaterThanOrEqual(44);

    await page.setViewportSize({ width: 1280, height: 900 });
    expect((await summary.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  });

  test('AC2 1280: 2 cột, ảnh sát mép cuối, 2 ô stat đè mép dưới bên trái ảnh', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(TE7);
    const figma = band(page, 'te7-faq');
    const list = (await tid(figma, 'faq-list').boundingBox())!;
    const image = (await tid(figma, 'faq-image').boundingBox())!;
    const stat1 = (await tid(figma, 'faq-stat-1').boundingBox())!;
    const stat2 = (await tid(figma, 'faq-stat-2').boundingBox())!;

    expect(image.x).toBeGreaterThan(list.x + list.width);
    expect(stat1.x, 'ô 1 lòi ra bên trái ảnh').toBeLessThan(image.x);
    expect(stat1.x + stat1.width, 'ô 1 đè lên ảnh').toBeGreaterThan(image.x);
    expect(stat2.x).toBeGreaterThan(stat1.x + stat1.width);
    expect(stat1.y + stat1.height, 'ô nằm trong đáy ảnh').toBeLessThan(image.y + image.height);
    expect(stat1.y + stat1.height, 'ô chạm nửa dưới ảnh').toBeGreaterThan(image.y + image.height / 2);
  });

  test('AC2 360: câu hỏi, rồi ảnh, rồi ô stat không đè; trang không tràn ngang', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto(TE7);
    const figma = band(page, 'te7-faq');
    const list = (await tid(figma, 'faq-list').boundingBox())!;
    const image = (await tid(figma, 'faq-image').boundingBox())!;
    const stat1 = (await tid(figma, 'faq-stat-1').boundingBox())!;
    const stat2 = (await tid(figma, 'faq-stat-2').boundingBox())!;

    expect(image.y).toBeGreaterThanOrEqual(list.y + list.height);
    expect(stat1.y).toBeGreaterThanOrEqual(image.y + image.height);
    expect(stat2.y).toBeGreaterThanOrEqual(image.y + image.height);

    const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(pageOverflow).toBeLessThanOrEqual(0);
  });

  test('AC2 ảnh và stat ẩn khi trống; không có cả hai thì câu hỏi chiếm cả hàng', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(TE7);

    const many = band(page, 'te7-faq-multiple');
    await expect(tid(many, 'faq-image')).toHaveCount(0);
    await expect(tid(many, 'faq-stat-1')).toHaveCount(0);
    await expect(tid(many, 'faq-stat-2')).toHaveCount(0);
    await expect(many.locator('.faq__media')).toHaveCount(0);
    const faqBox = (await tid(many, 'faq').boundingBox())!;
    const listBox = (await tid(many, 'faq-list').boundingBox())!;
    expect(Math.abs(listBox.width - faqBox.width)).toBeLessThanOrEqual(1);

    const one = band(page, 'te7-faq-one');
    await expect(tid(one, 'faq-image').locator('img')).toHaveCount(1);
    await expect(tid(one, 'faq-stat-1')).toHaveCount(0);
    await expect(tid(one, 'faq-stat-2')).toHaveCount(0);

    const ten = band(page, 'te7-faq-ten');
    await expect(tid(ten, 'faq-image')).toHaveCount(0);
    await expect(tid(ten, 'faq-stat-1')).toBeVisible();
    await expect(tid(ten, 'faq-stat-2')).toHaveCount(0);
  });

  test('AC2 câu trống: storefront không render câu, list, band', async ({ page }) => {
    await page.goto(TE7);
    await expect(band(page, 'te7-faq-empty')).toHaveCount(0);
    await expect(page.locator('[data-faq-id="te7-faq-none"]')).toHaveCount(0);
    await expect(tid(page, 'faq-item-placeholder')).toHaveCount(0);
    await expect(tid(page, 'faq-placeholder')).toHaveCount(0);
  });

  test('AC2 axe 0 serious khi đóng và khi mở, 0 console error', async ({ page }) => {
    const errors = watchConsole(page);
    await page.goto(TE7);
    await expectNoSeriousAxe(page);
    await question(page, 'te7-faq-figma-2').click();
    await question(page, 'te7-faq-many-2').click();
    await expect(openItem(page, 'te7-faq-figma-2')).toHaveCount(1);
    await expectNoSeriousAxe(page);
    expect(errors).toEqual([]);
  });

  test.describe('AC2 không JavaScript', () => {
    test.use({ javaScriptEnabled: false });

    test('AC2 không JS: tắt allow_multiple vẫn 1 câu mở, bật vẫn nhiều câu mở', async ({ page }) => {
      await page.goto(TE7);
      await expect(openItem(page, 'te7-faq-figma-1')).toHaveCount(1);
      await question(page, 'te7-faq-figma-2').click();
      await expect(openItem(page, 'te7-faq-figma-2')).toHaveCount(1);
      await expect(openItem(page, 'te7-faq-figma-1')).toHaveCount(0);

      await question(page, 'te7-faq-many-2').click();
      await expect(openItem(page, 'te7-faq-many-1')).toHaveCount(1);
      await expect(openItem(page, 'te7-faq-many-2')).toHaveCount(1);
    });

    test('AC2 không JS: Enter và Space mở đóng', async ({ page }) => {
      await page.goto(TE7);
      await question(page, 'te7-faq-figma-3').focus();
      await page.keyboard.press('Enter');
      await expect(openItem(page, 'te7-faq-figma-3')).toHaveCount(1);
      await page.keyboard.press('Space');
      await expect(openItem(page, 'te7-faq-figma-3')).toHaveCount(0);
    });
  });

  test('AC5 trang chủ: 5 câu Figma, câu đầu mở, 2 ô stat có 360+, không chữ hướng dẫn, không Lorem', async ({ page }) => {
    const errors = watchConsole(page);
    await page.goto(HOME);
    const home = band(page, 'home-faq');
    await expect(home).toHaveClass(/block-container--cream/);
    await expect(tid(home, 'faq-heading')).toHaveText("We're Proud To Be The Best At Training");
    await expect(tid(home, 'faq-item')).toHaveCount(5);
    await expect(home.locator('details[open]')).toHaveCount(1);
    await expect(openItem(page, 'faq-1')).toHaveCount(1);
    await expect(tid(home, 'faq-image')).toHaveCount(0);
    await expect(tid(home, 'faq-stat-1')).toContainText('360+');
    await expect(tid(home, 'faq-stat-2')).toBeVisible();

    const text = await home.innerText();
    expect(text).not.toContain('Add a');
    expect(text.toLowerCase()).not.toContain('lorem');
    await expectNoSeriousAxe(page);
    expect(errors).toEqual([]);
  });
});
