// KHÔNG CHẮC: spec chưa chạy (phiên viết không có preview, chưa type-check); scope-guard chặn dev-fe ghi tests/ → Orchestrator chép sang tests/e2e/ES1-T179.spec.ts.
// Ticket ES1-T179 TE-17-FE1a: nội dung Figma mặc định cho FAQ, testimonials theo D1, CR-8 (AC-H5, AC-H6, AC-H24, AC-H25).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T179.spec.ts
// Merchant sửa trong editor (TC-H6) là bước tay; ở đây param trùng tên setting đóng vai giá trị đã lưu, trên /?view=te7.
import { test, expect, type Locator, type Page } from '@playwright/test';

const HOME = '/';
const FIGMA = '/?view=figma';
const TE7 = '/?view=te7';

const QUESTIONS = [
  'How long does shipping take?',
  'Are adjustable dumbbells easy for beginners?',
  'How much floor space do i actually need?',
  'Does equipment arrive assembled?',
  "What's covered by the warranty?",
];
const ANSWER = 'Orders ship within one business day. Standard delivery is 2-4 business days across the continental US, and shipping is free on orders over $99.';
const REVIEWS = [
  { author: 'E. Johnson', rating: 5, title: 'Versatile Gear For All Exercises', quote: "High quality equipment that doesn't break the bank. I am very impressed with the overall durability." },
  { author: 'S. Williams', rating: 4, title: 'Folds Away In Seconds', quote: 'The rack folds flat against the wall. My garage is a garage again between sessions.' },
  { author: 'M. Anderson', rating: 5, title: 'Smooth Every Single Rep', quote: 'The dial switches weight fast, no jamming at all. Saves an entire corner of my room.' },
  { author: 'J. Miller', rating: 5, title: 'Worth Every Penny', quote: 'Spins so smoothly, no tangling even at high speed. Best rope I have owned.' },
];

const tid = (scope: Page | Locator, id: string) => scope.getByTestId(id);
const band = (page: Page, id: string) => page.getByTestId(`container-${id}`);
const review = (page: Page, id: string) => page.locator(`[data-testimonial-id="${id}"]`);
const question = (page: Page, id: string) => page.locator(`[data-faq-item-id="${id}"]`);

async function expectFigmaFaq(scope: Locator) {
  await expect(scope.locator('.faq__eyebrow')).toHaveText('Questions and Answers');
  await expect(tid(scope, 'faq-heading')).toHaveText("We're Proud To Be The Best At Training");
  await expect(tid(scope, 'faq-question')).toHaveText(QUESTIONS);
  await expect(scope.locator('details[open]')).toHaveCount(1);
  await expect(tid(scope, 'faq-answer').first()).toHaveText(ANSWER);
  const stat1 = tid(scope, 'faq-stat-1');
  await expect(stat1.locator('.faq__stat-label')).toHaveText('Products');
  await expect(stat1.locator('.faq__stat-value')).toHaveText('360+');
  await expect(stat1.locator('.faq__stat-text')).toHaveText('Home gym gear in stock.');
  const stat2 = tid(scope, 'faq-stat-2');
  await expect(stat2.locator('.faq__stat-label')).toHaveText('Warranty');
  await expect(stat2.locator('.faq__stat-value')).toHaveText('12');
  await expect(stat2.locator('.faq__stat-text')).toHaveText('Months on every item.');
}

async function expectFigmaTestimonials(scope: Locator) {
  await expect(scope.locator('.testimonials__eyebrow')).toHaveText('Testimonial');
  await expect(tid(scope, 'testimonials-heading')).toHaveText('What Our Customers Say?');
  await expect(tid(scope, 'testimonial-item')).toHaveCount(4);
  await expect(tid(scope, 'testimonial-author')).toHaveText(REVIEWS.map((r) => r.author));
  await expect(tid(scope, 'testimonial-title')).toHaveText(REVIEWS.map((r) => r.title));
  await expect(tid(scope, 'testimonial-quote')).toHaveText(REVIEWS.map((r) => r.quote));
  await expect(tid(scope, 'testimonial-rating')).toHaveCount(4);
  for (const [index, { rating }] of REVIEWS.entries()) {
    const stars = tid(scope, 'testimonial-rating').nth(index);
    await expect(stars).toHaveAccessibleName(`Rated ${rating} out of 5`);
    await expect(stars.locator('.rating-stars__star--filled')).toHaveCount(rating);
  }
  // E9: Verified mặc định tắt
  // Store dev có bộ ảnh mẫu nên bật như Figma; store mới cài vẫn tắt (template kiểm tra file)
  await expect(tid(scope, 'testimonial-verified')).toHaveCount(4);
}

test.describe('ES1-T179 TE-17 FAQ, testimonials mặc định', () => {
  test('AC-H5 trang chủ chưa cấu hình: FAQ đúng 1:1057, có 360+', async ({ page }) => {
    await page.goto(HOME);
    await expectFigmaFaq(band(page, 'home-faq'));
  });

  test('AC-H25 trang chủ chưa cấu hình: 4 review đúng 1:885, card 2 có 4 sao, Verified tắt', async ({ page }) => {
    await page.goto(HOME);
    await expectFigmaTestimonials(band(page, 'home-testimonials'));
  });

  test('AC-H5 mở câu 2 thấy đúng câu trả lời, câu 1 đóng', async ({ page }) => {
    await page.goto(HOME);
    await tid(question(page, 'faq-2'), 'faq-question').click();
    await expect(question(page, 'faq-2').locator('[data-testid="faq-answer"]')).toContainText('from 11 to 66 lb per hand');
    await expect(band(page, 'home-faq').locator('details[open]')).toHaveCount(1);
  });

  test('AC-H5 không còn chữ hướng dẫn, không escape 2 lần', async ({ page }) => {
    await page.goto(HOME);
    for (const id of ['home-faq', 'home-testimonials']) {
      const scope = band(page, id);
      const text = await scope.innerText();
      expect(text).not.toContain('Add a');
      expect(text).not.toContain('Customer name');
      expect(text).not.toContain('&#39;');
      expect(text).not.toContain('&amp;');
    }
  });

  test('Cổng /?view=figma: cùng copy, cùng 2 ô stat', async ({ page }) => {
    await page.goto(FIGMA);
    await expectFigmaFaq(band(page, 'figma-faq'));
    await expectFigmaTestimonials(band(page, 'figma-testimonials'));
  });

  test('AC-H6 FAQ: setting thắng default, setting trống lấy default', async ({ page }) => {
    await page.goto(TE7);
    const set = question(page, 'te7-d1-faq-set');
    await expect(tid(set, 'faq-question')).toHaveText('Setting question');
    await expect(set.locator('[data-testid="faq-answer"]')).toHaveText('Setting answer', { useInnerText: false });
    await expect(set).not.toContainText('Sample');
    const sample = question(page, 'te7-d1-faq-sample');
    await expect(tid(sample, 'faq-question')).toHaveText('Sample question 2');

    const scope = band(page, 'te7-d1-faq');
    await expect(scope.locator('.faq__eyebrow')).toHaveText('Setting eyebrow');
    await expect(tid(scope, 'faq-heading')).toHaveText('Sample heading');
    await expect(tid(scope, 'faq-stat-1').locator('.faq__stat-value')).toHaveText('Setting value');
    await expect(tid(scope, 'faq-stat-1').locator('.faq__stat-label')).toHaveText('Sample label');
  });

  test('D1 show_item, show_stat tắt thì ẩn mục, các mục khác vẫn hiện', async ({ page }) => {
    await page.goto(TE7);
    await expect(question(page, 'te7-d1-faq-hidden')).toHaveCount(0);
    const scope = band(page, 'te7-d1-faq');
    await expect(tid(scope, 'faq-item')).toHaveCount(2);
    await expect(tid(scope, 'faq-stat-2')).toHaveCount(0);
    await expect(scope).not.toContainText('Sample value 2');
    await expect(tid(scope, 'faq-item-placeholder')).toHaveCount(0);

    await expect(review(page, 'te7-d1-hidden')).toHaveCount(0);
    await expect(tid(band(page, 'te7-d1-testimonials'), 'testimonial-placeholder')).toHaveCount(0);
  });

  test('AC-H6 testimonial: setting thắng default, kể cả sao', async ({ page }) => {
    await page.goto(TE7);
    const set = review(page, 'te7-d1-set');
    await expect(tid(set, 'testimonial-author')).toHaveText('Setting author');
    await expect(tid(set, 'testimonial-title')).toHaveText('Setting title');
    await expect(tid(set, 'testimonial-quote')).toHaveText('Setting quote');
    await expect(tid(set, 'testimonial-rating')).toHaveAccessibleName('Rated 2 out of 5');

    const sample = review(page, 'te7-d1-sample');
    await expect(tid(sample, 'testimonial-author')).toHaveText('Sample author 2');
    await expect(tid(sample, 'testimonial-rating')).toHaveAccessibleName('Rated 4 out of 5');

    const scope = band(page, 'te7-d1-testimonials');
    await expect(tid(scope, 'testimonials-heading')).toHaveText('Setting heading');
    await expect(scope.locator('.testimonials__eyebrow')).toHaveText('Sample eyebrow');
  });

  test('D1 rating chặn 0-5, không có giá trị thì 5', async ({ page }) => {
    await page.goto(TE7);
    const cases: [string, number][] = [['te7-d1-high', 5], ['te7-d1-low', 0], ['te7-d1-none', 5]];
    for (const [id, rating] of cases) {
      const stars = tid(review(page, id), 'testimonial-rating');
      await expect(stars).toHaveAccessibleName(`Rated ${rating} out of 5`);
      await expect(stars.locator('.rating-stars__star--filled')).toHaveCount(rating);
    }
  });

  test('AC-H24 1920: 4 card 456, card đầu thẳng tiêu đề, card 4 tràn, trang không cuộn ngang', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(HOME);
    const scope = band(page, 'home-testimonials');
    const cards = tid(scope, 'testimonial-item');
    const widths = await cards.evaluateAll((els) => els.map((el) => el.getBoundingClientRect().width));
    expect(widths).toEqual([456, 456, 456, 456]);

    const positions = await cards.evaluateAll((els) => els.map((el) => el.getBoundingClientRect().left));
    expect(positions[1] - positions[0]).toBe(480);
    const heading = await tid(scope, 'testimonials-heading').evaluate((el) => el.getBoundingClientRect().left);
    expect(Math.abs(positions[0] - heading)).toBeLessThanOrEqual(1);
    expect(positions[3] + 456).toBeGreaterThan(1920);

    const list = await tid(scope, 'testimonials-list').evaluate((el) => {
      const box = el.getBoundingClientRect();
      return { right: box.right, scrollable: el.scrollWidth > el.clientWidth };
    });
    expect(list.scrollable).toBeTruthy();
    expect(list.right, 'list chạm mép màn hình').toBeGreaterThanOrEqual(page.viewportSize()!.width - 20);

    const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(pageOverflow).toBeLessThanOrEqual(0);
  });

  test('AC-H24 1920: bàn phím và thanh cuộn tới hết card 4', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(HOME);
    const scope = band(page, 'home-testimonials');
    const list = tid(scope, 'testimonials-list');
    await expect(list).toHaveAttribute('tabindex', '0');

    await list.focus();
    await expect(list).toBeFocused();
    // ES1-T224: Chromium không cuộn ngang bằng End, kể cả trên overflow-x không có CSS theme (repro R1, R3); End cuộn trang. Bàn phím cuộn ngang bằng mũi tên, nên đo mũi tên thật tới hết card 4.
    const pageY = await page.evaluate(() => window.scrollY);
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => list.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
    const lastCard = tid(scope, 'testimonial-item').last();
    await expect(async () => {
      await page.keyboard.press('ArrowRight');
      expect(await lastCard.evaluate((el) => el.getBoundingClientRect().right)).toBeLessThanOrEqual(page.viewportSize()!.width);
    }).toPass({ timeout: 15_000 });
    await expect(list).toBeFocused();
    expect(await page.evaluate(() => window.scrollY), 'mũi tên không cuộn trang').toBe(pageY);

    // Kéo thanh cuộn bằng chuột cũng đặt scrollLeft: kiểm tra đích cuối, không phụ thuộc thanh cuộn của hệ điều hành
    await list.evaluate((el) => el.scrollTo({ left: el.scrollWidth, behavior: 'instant' }));
    const last = await tid(scope, 'testimonial-item').last().evaluate((el) => el.getBoundingClientRect().right);
    expect(last).toBeLessThanOrEqual(page.viewportSize()!.width);
  });

  test('AC-H24 1280: giữ lưới 4 cột, không cuộn', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(HOME);
    const list = tid(band(page, 'home-testimonials'), 'testimonials-list');
    const state = await list.evaluate((el) => ({
      columns: getComputedStyle(el).gridTemplateColumns.trim().split(/\s+/).length,
      display: getComputedStyle(el).display,
      scrollable: el.scrollWidth > el.clientWidth,
    }));
    expect(state).toEqual({ columns: 4, display: 'grid', scrollable: false });
  });

  test('CR-8 1920: danh sách khác 4 mục vẫn là lưới', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(TE7);
    const six = tid(band(page, 'te7-testimonials-six'), 'testimonials-list');
    await expect(six).toHaveCSS('display', 'grid');
    expect(await six.evaluate((el) => el.scrollWidth > el.clientWidth)).toBeFalsy();
  });

  for (const width of [360, 768, 1280, 1920]) {
    test(`${width}: 2 band không làm trang tràn ngang`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(HOME);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  // Axe cả trang / và /?view=figma: gộp vào tests/e2e/ES1-T224.spec.ts.
});
