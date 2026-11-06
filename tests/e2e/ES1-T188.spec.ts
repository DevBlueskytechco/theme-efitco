// KHÔNG CHẮC: spec chưa chạy (phiên viết không có preview, chưa type-check, CI đang tắt e2e theo CTO 06/11); scope-guard chặn dev-fe ghi tests/ → Orchestrator chép sang tests/e2e/ES1-T188.spec.ts.
// Ticket ES1-T188 TE-3-FE4: blocks/featured-collection, 4 tab, 3 panel trong thẻ template, không JS là link (Figma 1:490, AC-H11, AC-H12 phần markup).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T188.spec.ts
// 4 tab trên /?view=figma cần figma-tab-* (ES1-T178): thiếu thì skip có lý do. Đổi tab bằng JS kiểm ở ES1-T189.
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { expectNotChallenged } from './support/store-guard';
import { visibleImagesLoaded } from './support/page-ready';
import { readFileSync } from 'node:fs';
import { watchShopPay403 } from './support/console-guard';

const FIGMA = '/?view=figma';
const HOME = '/';
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];

const LABELS = ['All', 'Weight', 'Portable Fitness', 'Accessories'];
const HANDLES = ['figma-tab-weight', 'figma-tab-portable-fitness', 'figma-tab-accessories'];

const T = {
  block: 'featured-collection',
  heading: 'featured-collection-heading',
  grid: 'featured-collection-grid',
  tabs: 'featured-collection-tabs',
  tab: 'featured-collection-tab',
  panel: 'featured-collection-panel',
};

const blockOn = (page: Page) => page.getByTestId(T.block);

async function openFigma(page: Page) {
  const res = await page.goto(FIGMA);
  expect(res?.status(), `HTTP ${FIGMA}`).toBeLessThan(400);
  const count = await blockOn(page).getByTestId(T.tab).count();
  test.skip(count < 4, `Chỉ có ${count} tab: thiếu collection figma-tab-* (ES1-T178)`);
}

async function noHorizontalOverflow(page: Page) {
  const [scrollWidth, clientWidth] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
}

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

test.describe('ES1-T188 tĩnh', () => {
  test('schema có 3 collection, 4 nhãn đúng bảng ES1-T173, không presets', async ({}, ti) => {
    test.skip(ti.project.name !== 'desktop', 'static, chạy 1 lần ở desktop');
    const src = readFileSync('blocks/featured-collection.liquid', 'utf8');
    const schema = JSON.parse(src.match(/{%-?\s*schema\s*-?%}([\s\S]*?){%-?\s*endschema\s*-?%}/)![1]);
    expect(schema.presets).toBeUndefined();
    const byId = Object.fromEntries(schema.settings.map((s: { id: string }) => [s.id, s]));
    LABELS.forEach((label, i) => expect(byId[`tab_${i + 1}_label`]?.default).toBe(label));
    for (const n of [2, 3, 4]) expect(byId[`tab_${n}_collection`]?.type).toBe('collection');
  });

  test('tab rỗng dùng locale, nằm trong phần thân của tab; template truyền handle figma-tab-*', async ({}, ti) => {
    test.skip(ti.project.name !== 'desktop', 'static, chạy 1 lần ở desktop');
    const src = readFileSync('blocks/featured-collection.liquid', 'utf8');
    expect(src).toMatch(/data-tab-empty[\s\S]*'blocks\.featured_collection\.tab_empty'\s*\|\s*t/);
    const locale = JSON.parse(readFileSync('locales/en.default.json', 'utf8'));
    expect(locale.blocks.featured_collection.tab_empty).toBeTruthy();
    const figma = readFileSync('templates/index.figma.liquid', 'utf8');
    for (const handle of HANDLES) expect(figma).toContain(`'${handle}'`);
  });
});

test.describe('ES1-T188 trang /?view=figma', () => {
  test('4 tab đúng nhãn, thứ tự, tab đầu đang chọn, đủ hook cho ES1-T189', async ({ page }) => {
    // aria-current là trạng thái trước nâng cấp: ES1-T189 gỡ nó khi module chạy, nên chặn module.
    await page.route(/\/collection-tabs\.js/, (route) => route.abort());
    await openFigma(page);
    const block = blockOn(page);
    await expect(block).toHaveAttribute('data-collection-tabs', '');
    await expect(block.locator('collection-tabs')).toHaveCount(1);
    const tabs = block.getByTestId(T.tab);
    await expect(tabs).toHaveText(LABELS);
    await expect(block.locator('[data-tab-list]')).toHaveCount(1);
    for (let i = 0; i < 4; i++) await expect(tabs.nth(i)).toHaveAttribute('data-tab', String(i + 1));
    await expect(tabs.first()).toHaveAttribute('aria-current', 'true');
    await expect(block.locator('[data-tab][aria-current]')).toHaveCount(1);
    await expect(block.locator('template[data-tab-panel-template]')).toHaveCount(3);
  });

  test('panel đầu hiện lưới, 3 panel còn lại hidden, thẻ card chỉ nằm trong template', async ({ page }) => {
    await openFigma(page);
    const block = blockOn(page);
    const panels = block.getByTestId(T.panel);
    await expect(panels).toHaveCount(4);
    await expect(panels.first()).toBeVisible();
    await expect(panels.first().getByTestId(T.grid)).toBeVisible();
    for (let i = 1; i < 4; i++) {
      await expect(panels.nth(i)).toBeHidden();
      await expect(panels.nth(i).getByTestId(T.grid), 'lưới tab ẩn chưa vào DOM').toHaveCount(0);
    }
    const contents = await block.locator('template[data-tab-panel-template]').evaluateAll((els) =>
      els.map((el) => {
        const content = (el as HTMLTemplateElement).content;
        return { cards: content.querySelectorAll('[data-testid="product-card"]').length, empty: content.querySelectorAll('[data-tab-empty]').length };
      })
    );
    for (const c of contents) expect(c.cards > 0 || c.empty === 1, 'mỗi template có card hoặc thông báo rỗng').toBe(true);
  });

  test('id input không trùng giữa các tab kể cả khi clone hết', async ({ page }) => {
    await openFigma(page);
    const dup = await blockOn(page).evaluate((el) => {
      const ids = [...el.querySelectorAll('[id]')].map((n) => n.id);
      el.querySelectorAll('template[data-tab-panel-template]').forEach((t) => {
        (t as HTMLTemplateElement).content.querySelectorAll('[id]').forEach((n) => ids.push(n.id));
      });
      return ids.filter((id, i) => ids.indexOf(id) !== i);
    });
    expect(dup).toEqual([]);
  });

  test('0 request ảnh của tab ẩn khi tải trang', async ({ page }) => {
    const requested = new Set<string>();
    page.on('request', (r) => {
      if (r.resourceType() === 'image') requested.add(new URL(r.url()).pathname);
    });
    await openFigma(page);
    await blockOn(page).scrollIntoViewIfNeeded();
    // ES1-T224: networkidle không bao giờ tới vì video và Shop giữ kết nối. Chờ đúng 2 việc có thể làm tải ảnh tab ẩn: module nâng cấp, ảnh trong màn hình của tab đầu tải xong.
    await expect(blockOn(page).getByTestId(T.tab).first()).toHaveAttribute('aria-selected', 'true', { timeout: 15_000 });
    await expect.poll(() => visibleImagesLoaded(blockOn(page).getByTestId(T.panel).first()), { message: 'ảnh tab đầu chưa tải xong', timeout: 15_000 }).toBe(true);
    // Ảnh cũng có ngoài template (cùng sản phẩm ở tab đầu hoặc hàng khác) thì không tính.
    const hiddenOnly = await page.evaluate(() => {
      const path = (src: string) => new URL(src, location.href).pathname;
      const inDom = new Set([...document.querySelectorAll('img')].map((img) => path(img.currentSrc || img.src)));
      const paths = new Set<string>();
      document.querySelectorAll('template[data-tab-panel-template]').forEach((t) => {
        (t as HTMLTemplateElement).content.querySelectorAll('img').forEach((img) => {
          const p = path(img.getAttribute('src')!);
          if (!inDom.has(p)) paths.add(p);
        });
      });
      return [...paths];
    });
    for (const p of hiddenOnly) expect(requested.has(p), `ảnh tab ẩn đã tải: ${p}`).toBe(false);
  });

  test('tab cao 40 như Figma, vùng bấm từ 44', async ({ page }) => {
    await openFigma(page);
    const tab = blockOn(page).getByTestId(T.tab).first();
    await tab.scrollIntoViewIfNeeded();
    const m = await tab.evaluate((el) => ({
      height: el.getBoundingClientRect().height,
      hit: parseFloat(getComputedStyle(el, '::before').height),
    }));
    expect(m.height).toBe(40);
    expect(m.hit).toBeGreaterThanOrEqual(44);
  });

  for (const width of [360, 768]) {
    test(`${width}: heading trên, tab dưới, không tràn ngang`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await openFigma(page);
      await noHorizontalOverflow(page);
      const heading = (await blockOn(page).getByTestId(T.heading).boundingBox())!;
      const tabs = (await blockOn(page).getByTestId(T.tabs).boundingBox())!;
      expect(tabs.y).toBeGreaterThanOrEqual(heading.y + heading.height);
    });
  }

  test('360: hàng tab cuộn được, tràn tới mép màn hình', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await openFigma(page);
    const row = await blockOn(page).getByTestId(T.tabs).evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { left: r.left, right: r.right, scrollWidth: el.scrollWidth, clientWidth: el.clientWidth };
    });
    expect(row.left).toBe(0);
    expect(row.right).toBe(360);
    expect(row.scrollWidth).toBeGreaterThan(row.clientWidth);
  });

  test('768: 4 tab vừa 1 hàng, không cuộn', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 800 });
    await openFigma(page);
    const row = await blockOn(page).getByTestId(T.tabs).evaluate((el) => ({ scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }));
    expect(row.scrollWidth).toBeLessThanOrEqual(row.clientWidth);
  });

  test('1280: heading trái, tab phải, thẳng mép phải lưới', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openFigma(page);
    const block = blockOn(page);
    const heading = (await block.getByTestId(T.heading).boundingBox())!;
    const tabs = (await block.getByTestId(T.tabs).boundingBox())!;
    const grid = (await block.getByTestId(T.grid).boundingBox())!;
    expect(tabs.x).toBeGreaterThanOrEqual(heading.x + heading.width);
    expect(Math.abs(tabs.x + tabs.width - (grid.x + grid.width))).toBeLessThanOrEqual(1);
  });

  test('axe 0 serious trong block, 0 console error', async ({ page }) => {
    const errors = watchConsole(page);
    await openFigma(page);
    await expectNotChallenged(page);
    const { violations } = await new AxeBuilder({ page }).include('[data-testid="featured-collection"]').analyze();
    const bad = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(bad.map((v) => v.id)).toEqual([]);
    expect(errors).toEqual([]);
  });
});

test.describe('ES1-T188 không JS', () => {
  test.use({ javaScriptEnabled: false });

  test('tab là link tới đúng collection, lưới tab đầu hiện', async ({ page }) => {
    await openFigma(page);
    const block = blockOn(page);
    const tabs = block.getByTestId(T.tab);
    for (let i = 1; i < 4; i++) {
      expect(await tabs.nth(i).evaluate((el) => el.tagName)).toBe('A');
      expect(await tabs.nth(i).getAttribute('href')).toContain(`/collections/${HANDLES[i - 1]}`);
    }
    await expect(block.getByTestId(T.grid).first()).toBeVisible();
  });

  test('bấm tab điều hướng tới collection', async ({ page }) => {
    await openFigma(page);
    await blockOn(page).getByTestId(T.tab).nth(1).click();
    await page.waitForURL(/\/collections\/figma-tab-weight/);
  });
});

test.describe('ES1-T188 không cấu hình tab', () => {
  test('trang chủ không có thanh tab, panel, hook; lưới như trước ticket', async ({ page }) => {
    const res = await page.goto(HOME);
    expect(res?.status()).toBeLessThan(400);
    const block = blockOn(page);
    test.skip((await block.count()) === 0, 'Store không có sản phẩm');
    test.skip((await block.getByTestId(T.tab).count()) > 0, 'Store đã chọn collection cho tab trong editor');
    await expect(block.getByTestId(T.tabs)).toHaveCount(0);
    await expect(block.getByTestId(T.panel)).toHaveCount(0);
    await expect(block.locator('collection-tabs')).toHaveCount(0);
    expect(await block.getAttribute('data-collection-tabs')).toBeNull();
    await expect(block.locator(':scope > ul[data-testid="featured-collection-grid"]')).toHaveCount(1);
  });
});
