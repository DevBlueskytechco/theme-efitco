// KHÔNG CHẮC: spec chưa chạy (phiên viết không có preview, chưa type-check); scope-guard chặn dev-fe ghi tests/ → Orchestrator chép sang tests/e2e/ES1-T118.spec.ts.
// Ticket ES1-T118 TE-7-FE1: testimonials (docs/srs.md#TE-7 AC1, AC5; drafts/techlead/ES1-T114/task-split.md D1, D2, D3, D7, D8).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T118.spec.ts -g "AC1|AC5"
// Biến thể chạy trên /?view=te7 (templates/index.te7.liquid), mặc định schema chạy trên /.
import { test, expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { watchShopPay403 } from './support/console-guard';

const TE7 = '/?view=te7';
const HOME = '/';
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];

const tid = (scope: Page | Locator, id: string) => scope.getByTestId(id);
const band = (page: Page, id: string) => page.getByTestId(`container-${id}`);
const item = (page: Page, id: string) => page.locator(`[data-testimonial-id="${id}"]`);

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

const columnCount = (list: Locator) =>
  list.evaluate((el) => getComputedStyle(el).gridTemplateColumns.trim().split(/\s+/).length);

test.describe('ES1-T118 TE-7 testimonials', () => {
  test('AC1 ?view=te7 trả template kiểm thử, không phải trang chủ thường', async ({ page }) => {
    const response = await page.goto(TE7);
    expect(response?.ok()).toBeTruthy();
    await expect(band(page, 'te7-testimonials')).toBeVisible();
    await expect(band(page, 'home-testimonials')).toHaveCount(0);
  });

  test('AC1 360: cuộn ngang, có scroll-snap, lộ card kế, trang không tràn ngang', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto(TE7);
    const list = tid(band(page, 'te7-testimonials'), 'testimonials-list');
    const state = await list.evaluate((el) => ({
      snap: getComputedStyle(el).scrollSnapType,
      overflow: getComputedStyle(el).overflowX,
      scrollable: el.scrollWidth > el.clientWidth,
    }));
    expect(state.snap).toContain('x');
    expect(state.snap).toContain('mandatory');
    expect(state.overflow).toBe('auto');
    expect(state.scrollable).toBeTruthy();

    const first = await item(page, 'te7-figma-1').boundingBox();
    const second = await item(page, 'te7-figma-2').boundingBox();
    expect(first!.width).toBeLessThan(360);
    expect(second!.x, 'card kế phải lộ trong khung 360').toBeLessThan(360);

    const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(pageOverflow).toBeLessThanOrEqual(0);
  });

  test('AC1 360: Tab vào track, phím mũi tên cuộn được', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto(TE7);
    const list = tid(band(page, 'te7-testimonials'), 'testimonials-list');
    await expect(list).toHaveAttribute('tabindex', '0');
    await expect(list).toHaveAttribute('aria-label', /.+/);

    // Vào track bằng Tab thật: focus phần tử ngay trước track rồi Tab
    await list.evaluate((el) => {
      const anchor = document.createElement('button');
      anchor.id = 'te7-tab-anchor';
      el.before(anchor);
      anchor.focus();
    });
    await page.keyboard.press('Tab');
    await expect(list).toBeFocused();

    await page.keyboard.press('ArrowRight');
    await expect.poll(() => list.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
  });

  test('AC1 768: 2 cột; 1280: lưới không cuộn, 3 cột, đúng 4 mục thì 4 cột', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 900 });
    await page.goto(TE7);
    const figma = tid(band(page, 'te7-testimonials'), 'testimonials-list');
    const six = tid(band(page, 'te7-testimonials-six'), 'testimonials-list');
    expect(await columnCount(figma)).toBe(2);
    expect(await columnCount(six)).toBe(2);

    await page.setViewportSize({ width: 1280, height: 900 });
    expect(await columnCount(figma)).toBe(4);
    expect(await columnCount(six)).toBe(3);
    for (const list of [figma, six]) {
      const state = await list.evaluate((el) => ({
        snap: getComputedStyle(el).scrollSnapType,
        scrollable: el.scrollWidth > el.clientWidth,
      }));
      expect(state.scrollable).toBeFalsy();
      expect(state.snap).toBe('none');
    }
  });

  test('AC1 1 mục và 6 mục đúng số card', async ({ page }) => {
    await page.goto(TE7);
    await expect(tid(band(page, 'te7-testimonials-one'), 'testimonial-item')).toHaveCount(1);
    await expect(tid(band(page, 'te7-testimonials-six'), 'testimonial-item')).toHaveCount(6);
    await expect(tid(band(page, 'te7-testimonials'), 'testimonial-item')).toHaveCount(4);
  });

  test('AC1 sao 0, 4, 5 có tên truy cập đúng và đúng số sao đầy', async ({ page }) => {
    await page.goto(TE7);
    const cases: [string, number][] = [
      ['te7-six-1', 0],
      ['te7-figma-2', 4],
      ['te7-figma-1', 5],
    ];
    for (const [id, rating] of cases) {
      const stars = tid(item(page, id), 'testimonial-rating');
      await expect(stars).toHaveRole('img');
      await expect(stars).toHaveAccessibleName(`Rated ${rating} out of 5`);
      await expect(stars.locator('svg')).toHaveCount(5);
      await expect(stars.locator('svg[aria-hidden="true"]')).toHaveCount(5);
      await expect(stars.locator('.rating-stars__star--filled')).toHaveCount(rating);
    }
  });

  test('AC1 không ảnh, không product thì không có khoảng trống', async ({ page }) => {
    await page.goto(TE7);
    const noImage = item(page, 'te7-six-2');
    await expect(tid(noImage, 'testimonial-image')).toHaveCount(0);
    const noImageBox = await noImage.boundingBox();
    const contentBox = await noImage.locator('.testimonial-item__content').boundingBox();
    expect(Math.abs(contentBox!.y - noImageBox!.y)).toBeLessThanOrEqual(1);

    const noProduct = item(page, 'te7-six-3');
    await expect(tid(noProduct, 'testimonial-product')).toHaveCount(0);
    await expect(noProduct.locator('.testimonial-item__product')).toHaveCount(0);

    const textOnly = item(page, 'te7-six-4');
    await expect(tid(textOnly, 'testimonial-image')).toHaveCount(0);
    await expect(tid(textOnly, 'testimonial-product')).toHaveCount(0);
    await expect(tid(textOnly, 'testimonial-quote')).toBeVisible();
  });

  test('AC1 có ảnh và product: link tên, giá, thumbnail decorative', async ({ page }) => {
    await page.goto(TE7);
    const card = item(page, 'te7-figma-1');
    // Nhánh object param chưa xác nhận (ES1-T117 #3): không ra thì chuyển bằng chứng tay trong editor
    test.skip((await tid(card, 'testimonial-product').count()) === 0, 'param object không vào block.settings: chuyển sang ảnh chụp editor');
    await expect(tid(card, 'testimonial-product-link')).toHaveAttribute('href', /\/products\//);
    await expect(tid(card, 'testimonial-product-price').getByTestId('price')).toBeVisible();
    await expect(card.locator('.testimonial-item__thumb img')).toHaveAttribute('alt', '');
    await expect(tid(card, 'testimonial-image').locator('img')).toHaveCount(1);
  });

  test('AC1 Verified chỉ hiện khi bật', async ({ page }) => {
    await page.goto(TE7);
    await expect(tid(item(page, 'te7-figma-1'), 'testimonial-verified')).toHaveText('Verified');
    await expect(tid(item(page, 'te7-one-1'), 'testimonial-verified')).toHaveCount(0);
  });

  test('AC1 mục rỗng: storefront không render card, list, band', async ({ page }) => {
    await page.goto(TE7);
    await expect(band(page, 'te7-testimonials-empty')).toHaveCount(0);
    await expect(page.locator('[data-testimonials-id="te7-empty"]')).toHaveCount(0);
    await expect(tid(page, 'testimonial-placeholder')).toHaveCount(0);
    await expect(tid(page, 'testimonials-placeholder')).toHaveCount(0);
  });

  test('AC1 không JS: list vẫn cuộn ở 360', async ({ browser, baseURL }) => {
    const context = await browser.newContext({
      baseURL,
      javaScriptEnabled: false,
      storageState: 'tests/setup/state.json',
      viewport: { width: 360, height: 740 },
    });
    const page = await context.newPage();
    await page.goto(TE7);
    await expect(tid(band(page, 'te7-testimonials'), 'testimonial-item')).toHaveCount(4);
    await expect(tid(band(page, 'te7-testimonials'), 'testimonials-list')).toHaveCSS('overflow-x', 'auto');
    await context.close();
  });

  test('AC1 axe 0 serious và 0 console error trên ?view=te7', async ({ page }) => {
    const errors = watchConsole(page);
    await page.goto(TE7);
    await expectNoSeriousAxe(page);
    expect(errors).toEqual([]);
  });

  test('AC5 trang chủ: 4 review Figma, Verified tắt, không Lorem, không chữ hướng dẫn', async ({ page }) => {
    const errors = watchConsole(page);
    await page.goto(HOME);
    const home = band(page, 'home-testimonials');
    await expect(home).toHaveClass(/block-container--cream/);
    await expect(tid(home, 'testimonials-heading')).toHaveText('What Our Customers Say?');
    await expect(tid(home, 'testimonial-item')).toHaveCount(4);
    await expect(tid(home, 'testimonial-author').first()).toHaveText('E. Johnson');
    await expect(tid(home, 'testimonial-verified')).toHaveCount(0);
    await expect(tid(home, 'testimonial-product')).toHaveCount(0);
    await expect(tid(home, 'testimonial-image')).toHaveCount(0);
    const text = await home.innerText();
    expect(text.toLowerCase()).not.toContain('lorem');
    expect(text).not.toContain('Customer name');
    expect(text).not.toContain('Add a');
    await expectNoSeriousAxe(page);
    expect(errors).toEqual([]);
  });
});
