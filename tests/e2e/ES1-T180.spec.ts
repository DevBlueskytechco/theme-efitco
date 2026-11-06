// KHÔNG CHẮC: spec chưa chạy (phiên viết không có preview, chưa type-check); scope-guard chặn dev-fe ghi tests/ → Orchestrator chép sang tests/e2e/ES1-T180.spec.ts.
// Ticket ES1-T180 TE-17-FE1b: nội dung Figma mặc định cho hàng 2, 4a, 8, 13 theo D1, CR-7 (AC-H5, AC-H6).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T180.spec.ts
// Merchant sửa trong editor (TC-H6) là bước tay; ở đây param trùng tên setting đóng vai giá trị đã lưu, trên /?view=te7.
import { test, expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { expectNotChallenged } from './support/store-guard';
import { watchShopPay403 } from './support/console-guard';

const HOME = '/';
const FIGMA = '/?view=figma';
const TE7 = '/?view=te7';
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];

const SLIDE = {
  eyebrow: 'Trusted by 10,000+ athletes',
  heading: 'Level Up Your Fitness',
  subheading: 'Upgrade your journey with Efitco gear made for every workout.',
  button: 'Explore Equipment',
};
const BANNER = {
  heading: 'Make fitness a natural part of your everyday life !',
  body: 'Just simple, effective workouts you can do anytime at home',
  button: 'Get Started Now',
};
const WHY = {
  eyebrow: 'We aRE about',
  heading: 'Why Choose efitco?',
  body: "Affordable, high-quality fitness gear that supports beginners to elite athletes. We design for the home first — equipment that folds, stacks or disappears when you're done, so your living room stays a living room between sessions.",
  button: 'View About Us',
};

const tid = (scope: Page | Locator, id: string) => scope.getByTestId(id);
const band = (page: Page, id: string) => page.getByTestId(`container-${id}`);
const slide = (page: Page, id: string) => page.locator(`[data-slide-id="${id}"]`);
const norm = (text: string | null) => (text ?? '').replace(/\s+/g, ' ').trim();
// textContent: giữ chữ gốc, không qua text-transform uppercase của CSS
const content = async (locator: Locator) => norm(await locator.textContent());

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

async function expectSlides(page: Page) {
  const slides = tid(page, 'slideshow-slide');
  await expect(slides).toHaveCount(2);
  for (const index of [0, 1]) {
    const scope = slides.nth(index);
    expect(await content(scope.locator('.slideshow__eyebrow'))).toBe(SLIDE.eyebrow);
    expect(await content(tid(scope, 'slideshow-heading'))).toBe(SLIDE.heading);
    expect(await content(scope.locator('.slideshow__subheading'))).toBe(SLIDE.subheading);
    expect(await content(tid(scope, 'slideshow-button-primary'))).toBe(SLIDE.button);
    await expect(tid(scope, 'slideshow-heading').locator('br')).toHaveCount(1);
  }
}

async function expectIwt(scope: Locator, copy: { eyebrow?: string; heading: string; body: string; button: string }) {
  if (copy.eyebrow) expect(await content(tid(scope, 'image-with-text-eyebrow'))).toBe(copy.eyebrow);
  else await expect(tid(scope, 'image-with-text-eyebrow')).toHaveCount(0);
  expect(await content(tid(scope, 'image-with-text-heading'))).toBe(copy.heading);
  expect(await content(tid(scope, 'image-with-text-body'))).toBe(copy.body);
  expect(await content(tid(scope, 'image-with-text-button'))).toBe(copy.button);
}

test.describe('ES1-T180 TE-17 hàng 2, 4a, 8, 13 mặc định', () => {
  test('AC-H5 hàng 2 chưa cấu hình: 2 slide cùng copy, h1 chỉ ở slide 1, 2 dòng', async ({ page }) => {
    await page.goto(HOME);
    await expectSlides(page);
    const h1 = page.locator('h1[data-testid="slideshow-heading"]');
    await expect(h1).toHaveCount(1);
    await expect(tid(page, 'slideshow-slide').first().locator('h1')).toHaveCount(1);
    const lines = await h1.evaluate((el) => Math.round(el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight)));
    expect(lines).toBe(2);
  });

  test('AC-H5 hàng 4a chưa cấu hình: copy đúng 1:457, 1:460, 1:462', async ({ page }) => {
    await page.goto(HOME);
    const scope = band(page, 'home-intro');
    expect(await content(tid(scope, 'rich-text-heading'))).toBe('Everything You Need to Train.');
    expect(await content(tid(scope, 'rich-text-body'))).toBe('Versatile equipment for home training - strength, mobility, endurance, at every level.');
    expect(await content(tid(scope, 'rich-text-button'))).toBe('Become A Member');
  });

  test('AC-H5 hàng 8, 13 chưa cấu hình: đúng bảng ES1-T173, 2 block khác nhau, hàng 8 không eyebrow', async ({ page }) => {
    await page.goto(HOME);
    const inspiration = band(page, 'home-inspiration');
    const whyChoose = band(page, 'home-why-choose');
    await expectIwt(inspiration, BANNER);
    await expectIwt(whyChoose, WHY);
    await expect(tid(inspiration, 'image-with-text-button')).toHaveAttribute('href', /\/collections\/all$/);
    await expect(tid(whyChoose, 'image-with-text-button')).toHaveAttribute('href', /\/collections\/all$/);
    // Hàng 13: 3 USP đang ẩn trong Figma (ES1-T116 #1)
    await expect(whyChoose).not.toContainText('Uncompromising Quality');
  });

  test('AC-H5 hàng 13: 2 câu của body cùng 1 đoạn, xuống dòng cố định', async ({ page }) => {
    await page.goto(HOME);
    const body = tid(band(page, 'home-why-choose'), 'image-with-text-body');
    await expect(body.locator('p')).toHaveCount(1);
    await expect(body.locator('br')).toHaveCount(1);
  });

  test('AC-H5 0 chữ hướng dẫn, 0 escape 2 lần, 0 thẻ lộ ra chữ', async ({ page }) => {
    await page.goto(HOME);
    for (const id of ['home-inspiration', 'home-why-choose', 'home-intro']) {
      const text = await band(page, id).innerText();
      expect(text).not.toContain('Add a');
      expect(text).not.toContain('Tell customers');
      expect(text).not.toMatch(/&#39;|&amp;|<br|<strong|<p>/);
    }
    const hero = await tid(page, 'slideshow').innerText();
    expect(hero).not.toMatch(/&#39;|&amp;|<br/);
  });

  test('CR-7 hàng 8: MAKE màu band, phần còn lại muted, cùng độ đậm', async ({ page }) => {
    await page.goto(HOME);
    const heading = tid(band(page, 'home-inspiration'), 'image-with-text-heading');
    const strong = heading.locator('strong');
    await expect(strong).toHaveCount(1);
    expect(await content(strong)).toBe('Make');

    const token = (name: string) =>
      page.evaluate((variable) => {
        const probe = document.createElement('div');
        probe.style.color = `var(${variable})`;
        document.body.append(probe);
        const value = getComputedStyle(probe).color;
        probe.remove();
        return value;
      }, name);
    const style = (locator: Locator) => locator.evaluate((el) => {
      const { color, fontWeight } = getComputedStyle(el);
      return { color, fontWeight };
    });
    const outer = await style(heading);
    const inner = await style(strong);
    expect(outer.color).toBe(await token('--color-muted'));
    expect(inner.color).toBe(await token('--color-background-sand-foreground'));
    expect(inner.fontWeight).toBe(outer.fontWeight);
  });

  test('Hàng 8 xuống dòng: 3 dòng từ 768, 360 để text-wrap chia, không tràn', async ({ page }) => {
    const breaks = (el: Element) => [...el.querySelectorAll('br')].map((br) => getComputedStyle(br).display);
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(HOME);
    const heading = tid(band(page, 'home-inspiration'), 'image-with-text-heading');
    expect(await heading.evaluate(breaks)).toEqual(['inline', 'inline']);
    // ES1-T217: font display swap, đếm dòng trước khi font về là đo trên font dự phòng.
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    const lines =await heading.evaluate((el) => Math.round(el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight)));
    expect(lines).toBe(3);

    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto(HOME);
    expect(await heading.evaluate(breaks)).toEqual(['none', 'none']);
    // Khoảng trắng sau br giữ các từ cách nhau khi br ẩn
    expect(await heading.innerText()).not.toMatch(/fitnessa|youreveryday/i);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('Cổng /?view=figma: cùng copy với /', async ({ page }) => {
    await page.goto(FIGMA);
    await expectSlides(page);
    await expectIwt(band(page, 'figma-inspiration'), BANNER);
    await expectIwt(band(page, 'figma-why-choose'), WHY);
  });

  test('LCP vẫn là slide 1: 1 ảnh eager, fetchpriority chỉ ở slide 1', async ({ page }) => {
    await page.goto(FIGMA);
    const slides = tid(page, 'slideshow-slide');
    await expect(slides.first().locator('img')).toHaveAttribute('loading', 'eager');
    await expect(slides.first().locator('img')).toHaveAttribute('fetchpriority', 'high');
    await expect(slides.nth(1).locator('img')).toHaveAttribute('loading', 'lazy');
    await expect(page.locator('main img[fetchpriority="high"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="image-with-text"] img[loading="eager"]')).toHaveCount(0);
  });

  test('AC-H6 slide: setting thắng default, setting trống lấy default, show_item tắt thì ẩn', async ({ page }) => {
    await page.goto(TE7);
    const set = slide(page, 'te7-d1-slide-set');
    expect(await content(set.locator('.slideshow__eyebrow'))).toBe('Setting eyebrow');
    expect(await content(tid(set, 'slideshow-heading'))).toBe('Setting <b>heading</b> & more');
    await expect(tid(set, 'slideshow-heading').locator('b')).toHaveCount(0);
    expect(await content(set.locator('.slideshow__subheading'))).toBe('Setting subheading');
    expect(await content(tid(set, 'slideshow-button-primary'))).toBe('Setting button');
    await expect(set).not.toContainText('Sample');

    const sample = slide(page, 'te7-d1-slide-sample');
    expect(await content(tid(sample, 'slideshow-heading'))).toBe('Sample heading');
    await expect(tid(sample, 'slideshow-heading').locator('br')).toHaveCount(1);
    expect(await content(tid(sample, 'slideshow-button-primary'))).toBe('Sample button');

    await expect(slide(page, 'te7-d1-slide-hidden')).toHaveCount(0);
    await expect(tid(band(page, 'te7-d1-slideshow'), 'slideshow-slide-placeholder')).toHaveCount(0);
    await expect(tid(band(page, 'te7-d1-slideshow'), 'slideshow-slide')).toHaveCount(2);
  });

  test('AC-H6 image-with-text: setting thắng default, setting trống lấy default, show_item tắt thì ẩn cả band', async ({ page }) => {
    await page.goto(TE7);
    const set = band(page, 'te7-d1-iwt-set');
    await expectIwt(set, { eyebrow: 'Setting eyebrow', heading: 'Setting <b>heading</b> & more', body: 'Setting body', button: 'Setting button' });
    await expect(tid(set, 'image-with-text-heading').locator('b')).toHaveCount(0);
    await expect(set).not.toContainText('Sample');

    const sample = band(page, 'te7-d1-iwt-sample');
    await expectIwt(sample, { eyebrow: 'Sample eyebrow', heading: 'Sample heading', body: 'Sample body', button: 'Sample button' });
    await expect(tid(sample, 'image-with-text-heading').locator('br')).toHaveCount(1);

    await expect(band(page, 'te7-d1-iwt-hidden')).toHaveCount(0);
    await expect(page.locator('[data-image-with-text-id="te7-d1-iwt-hidden-block"]')).toHaveCount(0);
  });

  test('CR-7 heading merchant không có strong: cả heading giữ màu band', async ({ page }) => {
    await page.goto(TE7);
    const scope = band(page, 'te7-d1-iwt-banner');
    const heading = tid(scope, 'image-with-text-heading');
    await expect(heading.locator('strong')).toHaveCount(0);
    const colors = await heading.evaluate((el) => ({
      heading: getComputedStyle(el).color,
      band: getComputedStyle(el.closest('[data-testid^="container-"]')!).color,
    }));
    expect(colors.heading).toBe(colors.band);
  });

  for (const width of [360, 768, 1280, 1920]) {
    test(`${width}: trang chủ không tràn ngang`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(HOME);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test('axe 0 serious, 0 console error trên / và /?view=figma', async ({ page }) => {
    const errors = watchConsole(page);
    for (const url of [HOME, FIGMA]) {
      await page.goto(url);
      await expectNoSeriousAxe(page);
    }
    expect(errors).toEqual([]);
  });
});
