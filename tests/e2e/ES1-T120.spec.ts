// KHÔNG CHẮC: spec chưa chạy (phiên viết không có preview, chưa type-check); scope-guard chặn dev-fe ghi tests/ → Orchestrator chép sang tests/e2e/ES1-T120.spec.ts.
// Ticket ES1-T120 TE-7-FE3: image with text (docs/srs.md#TE-7 AC3, AC5; drafts/techlead/ES1-T114/task-split.md D1, D2, D5, D7, D8).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T120.spec.ts -g "AC3|AC5"
// Biến thể chạy trên /?view=te7 (templates/index.te7.liquid), mặc định schema chạy trên /.
import { test, expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { watchShopPay403 } from './support/console-guard';

const TE7 = '/?view=te7';
const HOME = '/';
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];

const tid = (scope: Page | Locator, id: string) => scope.getByTestId(id);
const band = (page: Page, id: string) => page.getByTestId(`container-${id}`);

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
  const serious = violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical' || v.id === 'color-contrast',
  );
  expect(serious.map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
}

async function box(locator: Locator) {
  await locator.scrollIntoViewIfNeeded();
  const value = await locator.boundingBox();
  expect(value, 'phần tử phải có bounding box').not.toBeNull();
  return value!;
}

async function expectNoPageOverflow(page: Page) {
  const size = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));
  expect(size.scroll).toBe(size.client);
}

test.describe('ES1-T120 TE-7 image with text', () => {
  test('AC3 1280: image_position left và right đúng phía', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(TE7);

    const left = band(page, 'te7-iwt-left');
    const leftImage = await box(tid(left, 'image-with-text-image'));
    const leftContent = await box(tid(left, 'image-with-text-content'));
    expect(leftImage.x).toBeLessThanOrEqual(1);
    expect(leftImage.x + leftImage.width).toBeLessThanOrEqual(leftContent.x + 1);

    const right = band(page, 'te7-iwt-right');
    const rightImage = await box(tid(right, 'image-with-text-image'));
    const rightContent = await box(tid(right, 'image-with-text-content'));
    expect(rightContent.x + rightContent.width).toBeLessThanOrEqual(rightImage.x + 1);
    expect(rightImage.x + rightImage.width).toBeGreaterThanOrEqual(1279);
  });

  test('AC3 1280: ảnh chính cao hết band, 2 ảnh accent không đè chữ', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(TE7);
    const left = band(page, 'te7-iwt-left');
    const bandBox = await box(left);
    const image = await box(tid(left, 'image-with-text-image'));
    expect(Math.abs(image.height - bandBox.height)).toBeLessThanOrEqual(1);

    const accents = tid(left, 'image-with-text-accent');
    await expect(accents).toHaveCount(2);
    const content = await box(tid(left, 'image-with-text-content'));
    for (const index of [0, 1]) {
      const accent = await box(accents.nth(index));
      expect(accent.width).toBeCloseTo(accent.height, 0);
      expect(accent.x).toBeGreaterThanOrEqual(content.x + content.width - 1);
    }
  });

  for (const id of ['te7-iwt-left', 'te7-iwt-right']) {
    test(`AC3 360: ${id} ảnh trên chữ, accent ẩn`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 740 });
      await page.goto(TE7);
      const scope = band(page, id);
      const image = await box(tid(scope, 'image-with-text-image'));
      const content = await box(tid(scope, 'image-with-text-content'));
      expect(image.y + image.height).toBeLessThanOrEqual(content.y + 1);
      await expect(tid(scope, 'image-with-text-accent').first()).toBeHidden();
    });
  }

  test('AC3 đủ heading, richtext, nút; nút mặc định tới all products, có mũi tên', async ({ page }) => {
    await page.goto(TE7);
    const left = band(page, 'te7-iwt-left');
    await expect(tid(left, 'image-with-text-eyebrow')).toHaveText(/we are about/i);
    await expect(left.locator('h2[data-testid="image-with-text-heading"]')).toHaveText(/why choose efitco/i);
    await expect(tid(left, 'image-with-text-body').locator('p')).toHaveCount(2);
    const button = tid(left, 'image-with-text-button');
    await expect(button).toHaveText('View About Us');
    await expect(button).toHaveClass(/\bbutton\b/);
    await expect(button).toHaveAttribute('href', /\/collections\/all$/);
    await expect(button.locator('.slideshow-icon--arrow')).toHaveCount(1);
  });

  test('AC3 split không render accent_image_3', async ({ page }) => {
    await page.goto(TE7);
    await expect(band(page, 'te7-iwt-left').locator('.image-with-text__accent--3')).toHaveCount(0);
  });

  test('AC3 thiếu ảnh chính: giữ khung nền dark, không có ảnh hỏng', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(TE7);
    const scope = band(page, 'te7-iwt-no-image');
    await expect(tid(scope, 'image-with-text-image')).toHaveCount(0);
    const frame = tid(scope, 'image-with-text-image-placeholder');
    await expect(frame).toBeVisible();
    await expect(frame).toHaveText('');
    expect((await box(frame)).height).toBeGreaterThan(0);
    const colors = await page.evaluate(() => {
      const frameEl = document.querySelector('[data-testid="container-te7-iwt-no-image"] [data-testid="image-with-text-image-placeholder"]')!;
      const probe = document.createElement('div');
      probe.style.backgroundColor = 'var(--color-background-dark)';
      document.body.append(probe);
      const dark = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return { frame: getComputedStyle(frameEl).backgroundColor, dark };
    });
    expect(colors.frame).toBe(colors.dark);
  });

  test('AC3 banner: không ảnh chính, 3 ảnh vuông rải quanh chữ ở 1280', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(TE7);
    const scope = band(page, 'te7-iwt-banner');
    await expect(tid(scope, 'image-with-text-image')).toHaveCount(0);
    await expect(tid(scope, 'image-with-text-image-placeholder')).toHaveCount(0);
    const accents = tid(scope, 'image-with-text-accent');
    await expect(accents).toHaveCount(3);
    const content = await box(tid(scope, 'image-with-text-content'));
    const first = await box(accents.nth(0));
    const second = await box(accents.nth(1));
    const third = await box(accents.nth(2));
    for (const accent of [first, second, third]) {
      expect(Math.abs(accent.width - accent.height)).toBeLessThanOrEqual(1);
    }
    expect(first.x + first.width).toBeLessThanOrEqual(content.x);
    expect(second.x + second.width).toBeLessThanOrEqual(content.x);
    expect(third.x).toBeGreaterThanOrEqual(content.x + content.width);
    expect(first.y + first.height).toBeLessThanOrEqual(second.y);
    await expect(tid(scope, 'image-with-text-heading')).toHaveCSS('text-align', 'center');
  });

  test('AC3 banner 360: 3 ảnh thành hàng trên chữ, không tràn ngang', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto(TE7);
    const scope = band(page, 'te7-iwt-banner');
    const accents = tid(scope, 'image-with-text-accent');
    await expect(accents).toHaveCount(3);
    const first = await box(accents.nth(0));
    const second = await box(accents.nth(1));
    const third = await box(accents.nth(2));
    expect(Math.abs(first.y - second.y)).toBeLessThanOrEqual(1);
    expect(Math.abs(first.y - third.y)).toBeLessThanOrEqual(1);
    expect(third.x + third.width).toBeLessThanOrEqual(360);
    const content = await box(tid(scope, 'image-with-text-content'));
    expect(first.y + first.height).toBeLessThanOrEqual(content.y + 1);
    await expectNoPageOverflow(page);
  });

  test('AC3 banner bỏ ảnh trống', async ({ page }) => {
    await page.goto(TE7);
    await expect(tid(band(page, 'te7-iwt-banner-one'), 'image-with-text-accent')).toHaveCount(1);
  });

  test('AC3 mọi ảnh lazy, có width và height, không fetchpriority', async ({ page }) => {
    await page.goto(TE7);
    const images = page.locator('[data-testid="image-with-text"] img');
    const count = await images.count();
    expect(count).toBeGreaterThan(0);
    for (let index = 0; index < count; index += 1) {
      const image = images.nth(index);
      await expect(image).toHaveAttribute('loading', 'lazy');
      await expect(image).toHaveAttribute('width', /^\d+$/);
      await expect(image).toHaveAttribute('height', /^\d+$/);
      await expect(image).toHaveAttribute('alt', /.*/);
      await expect(image).not.toHaveAttribute('fetchpriority', /.*/);
    }
  });

  test('AC3 màu eyebrow và body theo band', async ({ page }) => {
    await page.goto(TE7);
    const color = (locator: Locator) => locator.evaluate((el) => getComputedStyle(el).color);
    const token = (name: string) =>
      page.evaluate((variable) => {
        const probe = document.createElement('div');
        probe.style.color = `var(${variable})`;
        document.body.append(probe);
        const value = getComputedStyle(probe).color;
        probe.remove();
        return value;
      }, name);

    const onDark = await token('--color-muted-on-dark');
    const muted = await token('--color-muted');
    const left = band(page, 'te7-iwt-left');
    const sand = band(page, 'te7-iwt-banner-one');
    expect(await color(tid(left, 'image-with-text-eyebrow'))).toBe(onDark);
    expect(await color(tid(left, 'image-with-text-body'))).toBe(onDark);
    expect(await color(tid(sand, 'image-with-text-eyebrow'))).toBe(muted);
    expect(await color(tid(sand, 'image-with-text-body'))).toBe(muted);
  });

  test('AC3 toàn bộ rỗng: storefront không render block, không band', async ({ page }) => {
    await page.goto(TE7);
    await expect(band(page, 'te7-iwt-empty')).toHaveCount(0);
    await expect(page.locator('[data-image-with-text-id="te7-empty-split"]')).toHaveCount(0);
    await expect(tid(page, 'image-with-text-placeholder')).toHaveCount(0);
  });

  for (const width of [360, 768, 1280]) {
    test(`AC3 ${width}: trang không tràn ngang`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(TE7);
      await expectNoPageOverflow(page);
    });
  }

  test('AC3 axe 0 serious, 0 color-contrast và 0 console error trên ?view=te7', async ({ page }) => {
    const errors = watchConsole(page);
    await page.goto(TE7);
    await expectNoSeriousAxe(page);
    expect(errors).toEqual([]);
  });

  test('AC5 trang chủ: thứ tự Figma, 2 block có settings riêng, default gợi cách dùng', async ({ page }) => {
    const errors = watchConsole(page);
    await page.goto(HOME);
    const inspiration = band(page, 'home-inspiration');
    const testimonials = band(page, 'home-testimonials');
    const whyChoose = band(page, 'home-why-choose');
    await expect(inspiration).toHaveClass(/block-container--sand/);
    await expect(whyChoose).toHaveClass(/block-container--dark/);

    expect(await inspiration.evaluate((el) => {
      const next = document.querySelector('[data-testid="container-home-testimonials"]')!;
      return Boolean(el.compareDocumentPosition(next) & Node.DOCUMENT_POSITION_FOLLOWING);
    })).toBeTruthy();
    expect(await testimonials.evaluate((el) => {
      const next = document.querySelector('[data-testid="container-home-why-choose"]')!;
      return Boolean(el.compareDocumentPosition(next) & Node.DOCUMENT_POSITION_FOLLOWING);
    })).toBeTruthy();

    await expect(page.locator('[data-image-with-text-id="inspiration"]')).toHaveClass(/image-with-text--banner/);
    await expect(page.locator('[data-image-with-text-id="why-choose"]')).toHaveClass(/image-with-text--split/);
    await expect(tid(whyChoose, 'image-with-text-image-placeholder')).toBeVisible();
    await expect(tid(inspiration, 'image-with-text-image-placeholder')).toHaveCount(0);

    for (const scope of [inspiration, whyChoose]) {
      await expect(tid(scope, 'image-with-text-heading')).toHaveText('Add a heading');
      await expect(tid(scope, 'image-with-text-button')).toHaveAttribute('href', /\/collections\/all$/);
      const text = (await scope.innerText()).toLowerCase();
      expect(text).not.toContain('lorem');
      expect(text).not.toContain('efitco');
    }
    await expectNoSeriousAxe(page);
    expect(errors).toEqual([]);
  });

  test('AC5 trang chủ: LCP vẫn là hero, block không có ảnh eager', async ({ page }) => {
    await page.goto(HOME);
    await expect(page.locator('[data-testid="image-with-text"] img[loading="eager"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="image-with-text"] img[fetchpriority]')).toHaveCount(0);
  });
});
