// KHÔNG CHẮC: spec chưa chạy lần nào (không có preview, chưa type-check); scope-guard chặn dev-fe ghi tests/ → Orchestrator chép sang tests/e2e/ES1-T182.spec.ts.
// Ticket ES1-T182 TE-17-FE1c: quiz, quiz-step, bundle-builder, featured-product theo Figma (plan ES1-T169 D1, CR-7; AC-H5, H6, H15, H18 phần markup).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T182.spec.ts
// Body map bấm được và token panel: tests/e2e/ES1-T183.spec.ts.
import { test, expect, type Page } from '@playwright/test';

const HOME = '/';
const FIGMA = '/?view=figma';
const TE7 = '/?view=te7';

const tid = (page: Page, id: string) => page.getByTestId(id);
const step = (page: Page, n: number) => page.locator(`[data-testid="quiz-step"][data-quiz-step="${n}"]`);

const STEPS = [
  {
    question: 'Where do you want to focus?',
    hint: 'Tap the body map or pick from the list.',
    options: [
      ['Upper body', 'Shoulders, arms, chest', 'quiz-upper'],
      ['Core', 'Abs, stability, balance', 'quiz-core'],
      ['Lower body', 'Legs, glutes, calves', 'quiz-lower'],
    ],
  },
  {
    question: 'What is your training level?',
    hint: 'Pick the closest match.',
    options: [
      ['Beginner', 'New to regular training', 'quiz-beginner'],
      ['Intermediate', 'Training a few times a week', 'quiz-intermediate'],
      ['Advanced', 'Training for years', 'quiz-advanced'],
    ],
  },
  {
    question: 'Where do you train?',
    hint: 'Pick where you train most.',
    options: [
      ['At home', 'Living room, garage or spare room', 'quiz-home'],
      ['At the gym', 'Shared space, full equipment', 'quiz-gym'],
      ['Outdoors', 'Park, yard or balcony', 'quiz-outdoor'],
    ],
  },
];

test.describe('ES1-T182 TE-17-FE1c', () => {
  test('AC-H15 / chưa cấu hình: quiz đủ copy cả 3 bước, tag đúng', async ({ page }) => {
    await page.goto(HOME);
    await expect(tid(page, 'quiz')).toHaveCount(1);
    await expect(tid(page, 'quiz-eyebrow')).toHaveText('Our most-loved feature');
    await expect(tid(page, 'quiz-heading')).toHaveText('Find Your Perfect Gear');
    await expect(tid(page, 'quiz-subheading')).toHaveText('Two questions. One shortlist.');
    await expect(tid(page, 'quiz-note').nth(0)).toHaveText('20 seconds');
    await expect(tid(page, 'quiz-note').nth(1)).toHaveText('No sign-up required');
    await expect(tid(page, 'quiz-step')).toHaveCount(3);

    for (const [index, data] of STEPS.entries()) {
      const root = step(page, index + 1);
      await expect(root.getByTestId('quiz-step-title')).toHaveText(data.question);
      await expect(root.locator('.quiz-step__subheading')).toHaveText(data.hint);
      await expect(root.getByTestId('quiz-option')).toHaveCount(3);
      for (const [i, [label, text, tag]] of data.options.entries()) {
        const row = root.getByTestId('quiz-option').nth(i);
        await expect(row.locator('.quiz-option__label')).toHaveText(label);
        await expect(row.locator('.quiz-option__description')).toHaveText(text);
        await expect(row.getByTestId('quiz-option-input')).toHaveAttribute('value', tag);
      }
    }
  });

  test('AC-H18 / chưa cấu hình: bundle lấy collection all, bậc 10%, 15% và ghi chú', async ({ page }) => {
    await page.goto(HOME);
    const root = tid(page, 'bundle-builder');
    await expect(root).toHaveCount(1);
    await expect(root).toHaveAttribute('data-tiers', '2:10,3:15');
    await expect(root.getByTestId('bundle-builder-eyebrow')).toHaveText('Build your bundle');
    await expect(root.getByTestId('bundle-builder-heading')).toHaveText('Pick Your Kit, Save As You Go');
    await expect(root.getByTestId('bundle-builder-link')).toHaveText('View Preset Bundles');
    await expect(root.getByTestId('bundle-builder-link')).toHaveAttribute('href', /\/collections\/all$/);
    await expect(root.getByTestId('bundle-builder-note')).toHaveText('Discount applies when an automatic discount is active.');
    await expect(root.getByTestId('bundle-builder-note')).toBeVisible();
    await expect(root.getByTestId('bundle-builder-discount-row')).toHaveCount(1);
    await expect(root).toHaveAttribute('data-label-progress-one', 'Add %n more item to unlock %p% off');
    await expect(root).toHaveAttribute('data-label-progress', 'Add %n more items to unlock %p% off');
    const items = await root.getByTestId('bundle-builder-item').count();
    expect(items).toBeGreaterThan(0);
    expect(items).toBeLessThanOrEqual(9);
  });

  test('D1 / chưa chọn sản phẩm: không có featured product', async ({ page }) => {
    await page.goto(HOME);
    await expect(tid(page, 'featured-product')).toHaveCount(0);
    await expect(tid(page, 'featured-product-placeholder')).toHaveCount(0);
    await expect(tid(page, 'container-home-featured-product')).toHaveCount(0);
  });

  test('D2 ?view=figma có cả 3 block, featured product đủ mặc định và dấu 1:761', async ({ page }) => {
    await page.goto(FIGMA);
    await expect(tid(page, 'quiz')).toHaveCount(1);
    await expect(tid(page, 'quiz-step')).toHaveCount(3);
    await expect(tid(page, 'bundle-builder')).toHaveCount(1);
    await expect(tid(page, 'bundle-builder')).toHaveAttribute('data-tiers', '2:10,3:15');

    const product = tid(page, 'featured-product');
    await expect(product).toHaveCount(1);
    await expect(product.getByTestId('featured-product-eyebrow')).toHaveText('FEATURED PRODUCT · FREE WEIGHTS');

    const seal = product.getByTestId('featured-product-seal');
    await expect(seal).toHaveCount(1);
    await expect(seal).toHaveAttribute('aria-hidden', 'true');
    await expect(seal).toHaveCSS('pointer-events', 'none');
    const path = await seal.locator('textPath').getAttribute('href');
    expect(path).toMatch(/^#FeaturedSeal-\d+$/);
    await expect(seal.locator(`path${path}`)).toHaveCount(1);
    await expect(seal.locator('textPath')).toContainText('Product');
  });

  test('D1 dấu 1:761: cỡ và vị trí theo breakpoint, góc ảnh', async ({ page }) => {
    await page.goto(FIGMA);
    const product = tid(page, 'featured-product');
    const seal = await product.getByTestId('featured-product-seal').evaluate((el) => {
      const rect = el.getBoundingClientRect();
      const media = el.parentElement!.querySelector('[data-testid="featured-product-media"]')!.getBoundingClientRect();
      return { width: rect.width, top: rect.top - media.top, left: rect.left - media.left };
    });
    const wide = (page.viewportSize()?.width ?? 0) >= 768;
    expect(Math.round(seal.width)).toBe(wide ? 113 : 72);
    expect(Math.round(seal.top)).toBe(wide ? 24 : 12);
    expect(Math.round(seal.left)).toBe(wide ? 24 : 12);
  });

  test('AC-H6 quiz-step: setting thắng default theo từng trường, trường trống lấy default, show_item tắt thì ẩn', async ({ page }) => {
    await page.goto(TE7);
    const band = tid(page, 'container-te7-d1-quiz');
    const steps = band.getByTestId('quiz-step');
    await expect(steps).toHaveCount(2);

    const set = steps.nth(0);
    await expect(set.getByTestId('quiz-step-title')).toHaveText('Setting question');
    await expect(set.locator('.quiz-step__subheading')).toHaveText('Setting hint');
    const first = set.getByTestId('quiz-option').nth(0);
    await expect(first.locator('.quiz-option__label')).toHaveText('Setting label');
    await expect(first.locator('.quiz-option__description')).toHaveText('Sample text 1');
    await expect(first.getByTestId('quiz-option-input')).toHaveAttribute('value', 'sample-tag-1');

    const sample = steps.nth(1);
    await expect(sample.getByTestId('quiz-step-title')).toHaveText('Sample question 2');
    await expect(sample.getByTestId('quiz-option')).toHaveCount(3);

    await expect(band.getByText('Sample question 1')).toHaveCount(0);
    await expect(band.getByText('Sample question 3')).toHaveCount(0);
  });

  // Axe cả trang / và ?view=figma: gộp vào tests/e2e/ES1-T224.spec.ts.
});
