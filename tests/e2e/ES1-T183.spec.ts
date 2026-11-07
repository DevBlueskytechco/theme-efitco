// KHÔNG CHẮC: spec chưa chạy, chưa type-check (không có preview trong phiên viết; CTO 06/11: e2e tắt tới khi trang chủ xong). scope-guard chặn dev-fe ghi tests/ → Orchestrator chép sang tests/e2e/ES1-T183.spec.ts.
// Ticket ES1-T183 TE-11-FE3: body map bấm được (CR-10, AC-H17 phần markup), token panel #393942 (CR-9), copy 1:515 + 1:532 (AC-H15).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T183.spec.ts
// Chạy được cả sau ES1-T139: mỗi test bấm vùng mở trang mới vì bước đổi sau khi chọn, input ẩn vẫn giữ checked.
import { test, expect, type Browser, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { expectNotChallenged } from './support/store-guard';
import { watchShopPay403 } from './support/console-guard';

const TE11 = '/?view=te11';
const HOME = '/';
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];
const PANEL = 'rgb(57, 57, 66)';
const REGIONS = [
  ['upper', 'quiz-upper', 'Upper body Shoulders, arms, chest'],
  ['core', 'quiz-core', 'Core Abs, stability, balance'],
  ['lower', 'quiz-lower', 'Lower body Legs, glutes, calves'],
] as const;

const tid = (page: Page, id: string) => page.getByTestId(id);
const step = (page: Page, n: number) => page.locator(`[data-testid="quiz-step"][data-quiz-step="${n}"]`);
const option = (page: Page, tag: string) => page.locator(`[data-testid="quiz-option-input"][value="${tag}"]`);
const region = (page: Page, name: string) => page.locator(`[data-testid="quiz-body-region"][data-body-region="${name}"]`);

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
  await expectNotChallenged(page);
  const { violations } = await new AxeBuilder({ page }).analyze();
  const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(serious.map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
}

async function openWithMap(page: Page, width: number) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(TE11);
  test.skip((await tid(page, 'quiz-body-map').count()) === 0, 'Store không có ảnh sản phẩm cho body map');
}

async function noJsPage(browser: Browser, width: number) {
  const use = test.info().project.use;
  const context = await browser.newContext({
    javaScriptEnabled: false,
    storageState: 'tests/setup/state.json',
    baseURL: use.baseURL,
    viewport: { width, height: 900 },
    ...(use.userAgent ? { userAgent: use.userAgent } : {}),
    ...(use.isMobile !== undefined ? { isMobile: use.isMobile, hasTouch: use.hasTouch } : {}),
  });
  return { context, page: await context.newPage() };
}

// Computed color có thể là rgb(...) hoặc color(srgb 0-1 ...) khi CSS dùng color-mix
function channels(value: string) {
  const numbers = (value.match(/[\d.]+/g) ?? []).map(Number);
  return value.startsWith('color(') ? numbers.slice(0, 3).map((n) => n * 255) : numbers.slice(0, 3);
}

function contrast(a: string, b: string) {
  const luminance = (value: string) => {
    const [r, g, bl] = channels(value).map((c) => {
      const v = c / 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

test.describe('ES1-T183 TE-11-FE3', () => {
  test('AC-H15 copy theo Figma 1:515, 1:532 trên trang chủ chưa cấu hình', async ({ page }) => {
    await page.goto(HOME);
    await expect(tid(page, 'quiz-subheading')).toHaveText('Two questions. One shortlist.');
    await expect(step(page, 1).locator('.quiz-step__subheading')).toHaveText('Tap the body map or pick from the list.');
  });

  test('CR-10 markup: 3 vùng là label của input đã có, không thêm input', async ({ page }) => {
    await openWithMap(page, 1280);
    await expect(step(page, 1).locator('input')).toHaveCount(3);
    await expect(step(page, 1).getByTestId('quiz-body-region')).toHaveCount(3);
    await expect(step(page, 2).getByTestId('quiz-body-region')).toHaveCount(0);
    for (const [name, tag, accessibleName] of REGIONS) {
      const id = await option(page, tag).getAttribute('id');
      expect(id).toBeTruthy();
      await expect(region(page, name)).toHaveJSProperty('tagName', 'LABEL');
      await expect(region(page, name)).toHaveAttribute('for', id!);
      await expect(region(page, name)).toHaveAttribute('aria-hidden', 'true');
      await expect(region(page, name)).toBeEmpty();
      await expect(option(page, tag)).toHaveAttribute('data-body-option', name);
      await expect(option(page, tag)).toHaveAccessibleName(accessibleName);
    }
  });

  for (const [name, tag] of REGIONS) {
    test(`AC-H17 bấm vùng ${name} chọn đúng lựa chọn, vùng hiện trạng thái đã chọn`, async ({ page }) => {
      await openWithMap(page, 1280);
      await region(page, name).click();
      await expect(option(page, tag)).toBeChecked();
      for (const [, other] of REGIONS) {
        if (other !== tag) await expect(option(page, other)).not.toBeChecked();
      }
      await expect(region(page, name)).toHaveCSS('outline-style', 'solid');
    });
  }

  test('AC-H17 chọn trong danh sách thì vùng tương ứng đồng bộ', async ({ page }) => {
    await openWithMap(page, 1280);
    await expect(region(page, 'core')).toHaveCSS('outline-style', 'none');
    await option(page, 'quiz-core').check();
    await expect(region(page, 'core')).toHaveCSS('outline-style', 'solid');
    await expect(region(page, 'upper')).toHaveCSS('outline-style', 'none');
  });

  test('AC-H17 bàn phím: Tab tới lựa chọn, vùng có viền focus, Space chọn', async ({ page }) => {
    await openWithMap(page, 1280);
    const input = option(page, 'quiz-upper');
    for (let i = 0; i < 80; i += 1) {
      await page.keyboard.press('Tab');
      if (await input.evaluate((el) => el === document.activeElement)) break;
    }
    await expect(input).toBeFocused();
    await expect(region(page, 'upper')).toHaveCSS('outline-style', 'solid');
    const panelOutline = await region(page, 'upper').evaluate((el) => getComputedStyle(el).outlineColor);
    expect(contrast(panelOutline, 'rgb(235, 230, 224)')).toBeGreaterThanOrEqual(3);
    await page.keyboard.press('Space');
    await expect(input).toBeChecked();
  });

  for (const width of [768, 1280]) {
    test(`vùng bấm từ 44px ở ${width}`, async ({ page }) => {
      await openWithMap(page, width);
      for (const [name] of REGIONS) {
        const box = await region(page, name).boundingBox();
        expect(box!.height, name).toBeGreaterThanOrEqual(44);
        expect(box!.width, name).toBeGreaterThanOrEqual(44);
      }
    });
  }

  test('AC4 ở 767 body map ẩn, ở 768 hiện', async ({ page }) => {
    await openWithMap(page, 767);
    await expect(tid(page, 'quiz-body-map')).toBeHidden();
    await expect(region(page, 'upper')).toBeHidden();
    await openWithMap(page, 768);
    await expect(tid(page, 'quiz-body-map')).toBeVisible();
    await expect(region(page, 'upper')).toBeVisible();
  });

  test('nojs bấm vùng chọn được và submit đủ tag', async ({ browser }) => {
    const { context, page } = await noJsPage(browser, 1280);
    await page.goto(TE11);
    test.skip((await tid(page, 'quiz-body-map').count()) === 0, 'Store không có ảnh sản phẩm cho body map');
    await region(page, 'lower').click();
    await expect(option(page, 'quiz-lower')).toBeChecked();
    await option(page, 'quiz-beginner').check();
    await option(page, 'quiz-home').check();
    await tid(page, 'quiz-submit').click();
    await page.waitForURL(/\/search\?/);
    const url = new URL(page.url());
    expect(url.searchParams.getAll('filter.p.tag').sort()).toEqual(['quiz-beginner', 'quiz-home', 'quiz-lower']);
    await context.close();
  });

  test('CR-9 nền panel quiz và bundle là #393942, chữ trên panel từ 4.5:1', async ({ page }) => {
    await page.goto(HOME);
    const quiz = tid(page, 'quiz');
    await expect(quiz).toHaveCSS('background-color', PANEL);
    const quizColor = await quiz.evaluate((el) => getComputedStyle(el).color);
    expect(contrast(quizColor, PANEL)).toBeGreaterThanOrEqual(4.5);

    const panel = tid(page, 'bundle-builder-panel');
    test.skip((await panel.count()) === 0, 'Store không có sản phẩm cho bundle builder');
    await expect(panel).toHaveCSS('background-color', PANEL);
    const texts = panel.locator('.bundle-builder__selection, .bundle-builder__progress-text, .bundle-builder__note, .bundle-builder__panel-title');
    const colors = await texts.evaluateAll((els) => els.map((el) => getComputedStyle(el).color));
    expect(colors.length).toBeGreaterThan(0);
    for (const color of colors) {
      expect(contrast(color, PANEL), color).toBeGreaterThanOrEqual(4.5);
    }
  });

  test('axe 0 serious và 0 console error trên ?view=te11 từ 768', async ({ page }) => {
    const errors = watchConsole(page);
    await openWithMap(page, 1280);
    await expectNoSeriousAxe(page);
    expect(errors).toEqual([]);
  });
});
