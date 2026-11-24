// KHÔNG CHẮC: spec chưa chạy trên store (phiên viết không có PREVIEW_URL, tests/setup/state.json); chỉ qua tsc + playwright --list. Chờ CI store-tests của PR.
// KHÔNG CHẮC: ticket ghi tests/e2e/TE-15.spec.ts, Orchestrator yêu cầu đặt theo key ES1-T187 → file này. TE-15.spec.ts không tồn tại, không trùng.
// Ticket ES1-T187 TE-15-QA1 (plan ES1-T169 #28): collection list + shop by level, docs/srs.md#TE-15 AC-H8, AC-H9, AC-H10 (SRS 0.5, CTO 11/11:
// viết theo SRS 0.5/ui-spec mới, block đã viết lại ở ES1-T336). Test case: drafts/qa/ES1-T187/test-cases.md (TC id trong tên test).
// Gộp phần nghiệm thu của spec dev ES1-T184, T185, T186 vào một file theo ticket: mỗi test gom nhiều assertion trên 1 lần tải trang để giảm request.
// Spec dev giữ nguyên (kiểm chi tiết hiện thực: lazy-module, ResizeObserver, trần byte); không viết lại các test đó ở đây.
// Dữ liệu:
// - /?view=te15 (templates/index.te15.liquid): collection `all`, không cần dữ liệu nhập: 0 / 1 / 5 card danh mục, 0 / 1 / 3 card trình độ, band số ít nếu store có collection 1 sản phẩm.
// - /?view=figma: handle figma-cat-*, figma-level-* (ES1-T178, fixture ES1-T331); thiếu thì skip có lý do.
// - /: chỉ có card khi store dev đã áp fixture ES1-T331 (ADR 0011: index.liquid không truyền handle) → skipUnlessFixture; chưa áp thì kiểm nhánh 0 collection.
// Số sản phẩm thật đọc từ trang collection (`collection-count`, render ở server), không gọi JSON storefront (429, CONVENTION.md).
// Project: desktop (Desktop Chrome) + mobile (Pixel 7). Đo theo mốc: 360/768 chạy ở mobile, 1280/1920 chạy ở desktop; hành vi chạy cả 2.
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T187.spec.ts
import { readFileSync } from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
import { test, expect, type Locator, type Page } from './support/test';
import { gotoStore } from './support/store-guard';
import { watchShopPay403 } from './support/console-guard';
import { loadHomeFixture, skipUnlessFixture, fixtureApplied } from './support/home-fixture';

const TE15 = '/?view=te15';
const FIGMA = '/?view=figma'; // ES1-T581 có thể đổi .figma → .mockup: đổi hằng này khi template đổi tên.
const HOME = '/';
// Lệch ≤ 2 px (ES1-T309 #4). Số card/ảnh danh mục theo SRS 0.5 (ảnh 336/220); ES1-T580 đổi 3/2 sẽ lệch 3–4 px: hỏi ở ES1-T609.
const TOL = 2;
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|otlp-http|shopifysvc\.com|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];
const MODULE = /\/scroll-buttons\.js/;

const LOCALE = JSON.parse(readFileSync('locales/en.default.json', 'utf8'));
const COUNT_FORMS: { one: string; other: string } = LOCALE.blocks.level_card.products_count;
const LIST_LABEL: string = LOCALE.blocks.collection_list.list_label;
/** Badge theo đúng khoá locale (AC-H10 "số ít nhiều đúng locale"); chữ hoa thường theo locale, sentence case do ES1-T578. */
const badgeText = (n: number) => (n === 1 ? COUNT_FORMS.one : COUNT_FORMS.other).replace('{{ count }}', String(n));

const CATEGORIES = [
  { name: 'Free Weights', handle: 'figma-cat-free-weights' },
  { name: 'Functional Training', handle: 'figma-cat-functional-training' },
  { name: 'Benches & Racks', handle: 'figma-cat-benches-racks' },
  { name: 'Recovery & Mobility', handle: 'figma-cat-recovery-mobility' },
  { name: 'Accessories', handle: 'figma-cat-accessories' },
];
const LEVELS = [
  { name: 'Beginner', handle: 'figma-level-beginner' },
  { name: 'Intermediate', handle: 'figma-level-intermediate' },
  { name: 'Advanced', handle: 'figma-level-advanced' },
];

const band = (page: Page, id: string) => page.getByTestId(`container-${id}`);
const rowOf = (scope: Locator) => ({
  root: scope.locator('scroll-buttons'),
  track: scope.getByTestId('collection-list-track'),
  prev: scope.getByTestId('collection-list-prev'),
  next: scope.getByTestId('collection-list-next'),
  progress: scope.getByTestId('carousel-progress'),
  cards: scope.getByTestId('collection-card'),
  heading: scope.getByTestId('collection-list-heading'),
});

function onlyProject(name: 'desktop' | 'mobile', reason: string) {
  test.beforeEach(({}, info) => test.skip(info.project.name !== name, reason));
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

async function expectAxeClean(page: Page, selectors: string[]) {
  let builder = new AxeBuilder({ page });
  for (const s of selectors) builder = builder.include(s);
  const { violations } = await builder.analyze();
  const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`)).toEqual([]);
}

async function open(page: Page, path: string, width: number, height = 900) {
  await page.setViewportSize({ width, height });
  await gotoStore(page, path);
}

async function openEnhanced(page: Page, width: number) {
  await open(page, TE15, width);
  await expect(rowOf(band(page, 'te15-five')).root).toHaveAttribute('data-enhanced', '');
}

const box = async (l: Locator) => (await l.boundingBox())!;
const near = (actual: number, expected: number, label: string) => expect(Math.abs(actual - expected), `${label}: ${actual} ≠ ${expected} ± ${TOL}`).toBeLessThanOrEqual(TOL);
const scrollLeft = (track: Locator) => track.evaluate((el) => Math.abs(el.scrollLeft));
const maxScroll = (track: Locator) => track.evaluate((el) => el.scrollWidth - el.clientWidth);
/** Bước 1 card: bề card đầu + gap, đo độc lập với JS theme. */
const cardStep = (track: Locator) => track.evaluate((el) => el.children[0].getBoundingClientRect().width + parseFloat(getComputedStyle(el).columnGap));

async function noHorizontalOverflow(page: Page) {
  const [sw, cw] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  expect(sw, 'trang tràn ngang').toBeLessThanOrEqual(cw);
}

/** Số sản phẩm thật: mở trang collection, đọc dòng "N products" render ở server (collection.products_count). */
async function realCount(page: Page, href: string): Promise<number | null> {
  await gotoStore(page, href);
  const count = page.getByTestId('collection-count');
  if ((await count.count()) === 0) return null;
  const match = (await count.first().innerText()).match(/\d[\d,.]*/);
  return match ? Number(match[0].replace(/[,.]/g, '')) : null;
}

/** Outline focus nhìn thấy: kiểm cả phần tử và ::after (card danh mục vẽ vòng focus trên ::after). */
const focusRing = (l: Locator) =>
  l.evaluate((el) => {
    const own = getComputedStyle(el);
    const after = getComputedStyle(el, '::after');
    const visible = (s: CSSStyleDeclaration) => s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0;
    return el.matches(':focus-visible') && (visible(own) || visible(after));
  });

test.describe('ES1-T187 tĩnh', () => {
  onlyProject('desktop', 'đọc file, chạy 1 lần');

  test('TC-30 AC-H10: badge lấy products_count qua khoá locale có one/other, không số cứng', () => {
    const liquid = readFileSync('blocks/level-card.liquid', 'utf8');
    expect(liquid).toMatch(/'blocks\.level_card\.products_count'\s*\|\s*t:\s*count:\s*card_collection\.products_count/);
    expect(liquid).not.toMatch(/\b24\b/);
    expect(COUNT_FORMS.one).toContain('{{ count }}');
    expect(COUNT_FORMS.other).toContain('{{ count }}');
    expect(COUNT_FORMS.one).not.toEqual(COUNT_FORMS.other);
  });
});

test.describe('ES1-T187 AC-H9 số card (/?view=te15)', () => {
  test('TC-04, TC-05 AC-H9: 0 collection không render; 1 card hàng vừa khung: lưới tĩnh, không nút, không tiến trình', async ({ page }) => {
    const errors = watchConsole(page);
    await openEnhanced(page, 1024);
    // 0 collection: storefront không render band, block, placeholder (cả 2 block).
    await expect(band(page, 'te15-empty')).toHaveCount(0);
    await expect(band(page, 'te15-level-empty')).toHaveCount(0);
    await expect(page.getByTestId('collection-list-placeholder')).toHaveCount(0);
    await expect(page.getByTestId('collection-card-placeholder')).toHaveCount(0);
    await expect(page.getByTestId('shop-by-level-placeholder')).toHaveCount(0);
    await expect(page.getByTestId('level-card-placeholder')).toHaveCount(0);

    // 1 card: đúng 1, hàng vừa khung → data-static, 2 nút và tiến trình ẩn.
    const one = rowOf(band(page, 'te15-one'));
    await expect(one.cards).toHaveCount(1);
    await expect(one.root).toHaveAttribute('data-enhanced', '');
    await expect(one.root).toHaveAttribute('data-static', '');
    await expect(one.prev).toBeHidden();
    await expect(one.next).toBeHidden();
    await expect(one.progress).toBeHidden();
    await expect(band(page, 'te15-level-one').getByTestId('level-card')).toHaveCount(1);
    expect(errors).toEqual([]);
  });

  test('TC-06 AC-H9 + AC-H8: 5 card ở 1024, đầu hàng back tắt, next cuộn 1 card, cuối hàng next tắt, back cuộn về', async ({ page }) => {
    await openEnhanced(page, 1024);
    const row = rowOf(band(page, 'te15-five'));
    await expect(row.cards).toHaveCount(5);
    await expect(row.root).not.toHaveAttribute('data-static', '');
    await expect(row.progress).toBeVisible();

    // Đầu hàng: back hiện nhưng aria-disabled (SRS 0.5 AC1: giữ chỗ), next bật.
    await expect(row.prev).toBeVisible();
    await expect(row.prev).toHaveAttribute('aria-disabled', 'true');
    await expect(row.next).toHaveAttribute('aria-disabled', 'false');

    const step = await cardStep(row.track);
    const max = await maxScroll(row.track);
    expect(max).toBeGreaterThan(step);
    await row.next.click();
    await expect.poll(() => scrollLeft(row.track)).toBeCloseTo(step, 0);
    await expect(row.prev).toHaveAttribute('aria-disabled', 'false');

    await row.track.evaluate((el) => el.scrollTo({ left: el.scrollWidth, behavior: 'instant' as ScrollBehavior }));
    await expect(row.next).toHaveAttribute('aria-disabled', 'true');
    await expect(row.next).toBeVisible();
    const atEnd = await scrollLeft(row.track);
    await row.prev.click();
    await expect.poll(async () => atEnd - (await scrollLeft(row.track))).toBeGreaterThan(step - TOL);
  });
});

test.describe('ES1-T187 AC-H8 1920', () => {
  onlyProject('desktop', '1920 đo ở Desktop Chrome; Pixel 7 đo 360/768');

  test('TC-01 AC-H8: /?view=te15 5 card 336 × 270, next/back cuộn 1 card (hoặc tới cuối nếu còn dưới 1 card)', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await gotoStore(page, TE15);
    const row = rowOf(band(page, 'te15-five'));
    await expect(row.root).toHaveAttribute('data-enhanced', '');
    await expect(row.cards).toHaveCount(5);
    for (let i = 0; i < 5; i++) {
      const b = await box(row.cards.nth(i));
      near(b.width, 336, `card ${i + 1} rộng`);
      near(b.height, 270, `card ${i + 1} cao`);
    }
    const step = await cardStep(row.track);
    const max = await maxScroll(row.track);
    test.skip(max < 1, 'hàng 5 card vừa khung ở 1920 trên store này: không có gì để cuộn (AC-H9 lưới tĩnh)');
    await row.next.click();
    await expect.poll(() => scrollLeft(row.track)).toBeCloseTo(Math.min(step, max), 0);
    await row.prev.click();
    await expect.poll(() => scrollLeft(row.track)).toBeLessThanOrEqual(1);
  });

  test('TC-02 AC-H8: /?view=figma 5 card đúng tên, thứ tự, link, tên truy cập; bấm card tới đúng collection', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await gotoStore(page, FIGMA);
    const scope = band(page, 'figma-collection-list');
    const row = rowOf(scope);
    const count = await row.cards.count();
    test.skip(count < 5, `store mới có ${count}/5 collection figma-cat-*: chờ dữ liệu ES1-T178 / fixture ES1-T331`);

    await expect(row.track).toHaveAttribute('aria-label', LIST_LABEL);
    await expect(row.track).toHaveAttribute('tabindex', '0');
    for (const [i, { name, handle }] of CATEGORIES.entries()) {
      const card = row.cards.nth(i);
      const link = card.getByTestId('collection-card-link');
      await expect(card.getByTestId('collection-card-title')).toHaveText(name);
      await expect(link).toHaveAttribute('href', new RegExp(`/collections/${handle}$`));
      await expect(link).toHaveAccessibleName(name);
      await expect(card.getByRole('link')).toHaveCount(1);
      const img = card.locator('[data-testid="collection-card-image"] img');
      if (await img.count()) await expect(img).toHaveAttribute('alt', '');
      const b = await box(card);
      near(b.width, 336, `${name} rộng`);
      near(b.height, 270, `${name} cao`);
    }
    await row.cards.first().getByTestId('collection-card-link').click();
    await expect(page).toHaveURL(new RegExp(`/collections/${CATEGORIES[0].handle}(\\?|$)`));
  });

  test('TC-03 AC-H8: / trên store dev đã áp fixture: 5 card đúng tên, đúng link theo fixture', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await gotoStore(page, HOME);
    await skipUnlessFixture(page);
    const fixture = loadHomeFixture();
    const handles = fixture.blocks.filter((b) => b.type === 'collection-card').map((b) => String(b.settings.collection));
    const row = rowOf(band(page, 'home-collection-list'));
    await expect(row.cards).toHaveCount(handles.length);
    for (const [i, handle] of handles.entries()) {
      const card = row.cards.nth(i);
      await expect(card.getByTestId('collection-card-title')).toHaveText(CATEGORIES.find((c) => c.handle === handle)!.name);
      await expect(card.getByTestId('collection-card-link')).toHaveAttribute('href', new RegExp(`/collections/${handle}$`));
      const b = await box(card);
      near(b.width, 336, `card ${i + 1} rộng`);
      near(b.height, 270, `card ${i + 1} cao`);
    }
  });

  test('TC-07 AC-H9: / theme chưa áp fixture (0 collection chọn): không band danh mục, không shop by level', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await gotoStore(page, HOME);
    test.skip(await fixtureApplied(page), 'store dev đã áp fixture ES1-T331: nhánh 0 collection trên / kiểm bằng /?view=te15 (TC-04)');
    await expect(band(page, 'home-collection-list')).toHaveCount(0);
    await expect(page.getByTestId('collection-list')).toHaveCount(0);
    await expect(page.getByTestId('collection-card')).toHaveCount(0);
    await expect(page.getByTestId('shop-by-level')).toHaveCount(0);
    await expect(page.getByTestId('level-card')).toHaveCount(0);
  });
});

test.describe('ES1-T187 AC-H10 badge số sản phẩm', () => {
  test('TC-10 AC-H10: /?view=te15 3 card, badge = products_count thật của collection theo locale', async ({ page }) => {
    await open(page, TE15, 1024);
    const cards = band(page, 'te15-level-three').getByTestId('level-card');
    await expect(cards).toHaveCount(3);
    const href = (await cards.first().getByTestId('level-card-link').getAttribute('href'))!;
    const badges = await band(page, 'te15-level-three').getByTestId('level-card-count').allTextContents();
    const real = await realCount(page, href);
    test.skip(real === null, `${href} không có dòng collection-count để đối chiếu`);
    if (real === 0) {
      expect(badges, 'collection rỗng: không hàng số sản phẩm').toEqual([]);
      return;
    }
    expect(badges.map((t) => t.trim())).toEqual([badgeText(real!), badgeText(real!), badgeText(real!)]);
  });

  test('TC-11 AC-H10: số ít, collection đúng 1 sản phẩm hiện dạng one của locale', async ({ page }) => {
    await open(page, TE15, 1024);
    const singular = band(page, 'te15-level-singular');
    test.skip((await singular.count()) === 0, 'store dev không có collection nào đúng 1 sản phẩm: không kiểm được số ít (ghi ở test-cases.md)');
    await expect(singular.getByTestId('level-card-count')).toHaveText(badgeText(1));
    const href = (await singular.getByTestId('level-card-link').getAttribute('href'))!;
    expect(await realCount(page, href)).toBe(1);
  });

  test('TC-12 AC-H10: /?view=figma 3 card trình độ đúng tên, badge từng card = số thật; Beginner 24', async ({ page }) => {
    await open(page, FIGMA, 1920, 1080);
    const cards = band(page, 'figma-intro').getByTestId('level-card');
    const count = await cards.count();
    test.skip(count < 3, `store mới có ${count}/3 collection figma-level-*: chờ dữ liệu ES1-T178 / fixture ES1-T331`);
    const seen: { name: string; href: string; badge: string }[] = [];
    for (const [i, { name, handle }] of LEVELS.entries()) {
      const card = cards.nth(i);
      await expect(card.getByTestId('level-card-title')).toHaveText(name);
      const link = card.getByTestId('level-card-link');
      await expect(link).toHaveAttribute('href', new RegExp(`/collections/${handle}$`));
      const badge = card.getByTestId('level-card-count');
      seen.push({ name, href: (await link.getAttribute('href'))!, badge: (await badge.count()) ? (await badge.textContent())!.trim() : '' });
    }
    for (const { name, href, badge } of seen) {
      const real = await realCount(page, href);
      expect(real, `${name}: trang collection không có collection-count`).not.toBeNull();
      expect(badge, name).toBe(real === 0 ? '' : badgeText(real!));
      if (name === 'Beginner') expect(real, 'store dev cần 24 sản phẩm ở Beginner (AC-H10, ES1-T178)').toBe(24);
    }
  });

  test('TC-13 AC-H10: / trên store dev đã áp fixture: Beginner badge 24 theo locale', async ({ page }) => {
    await open(page, HOME, 1920, 1080);
    await skipUnlessFixture(page);
    const card = band(page, 'home-intro').getByTestId('level-card').first();
    await expect(card.getByTestId('level-card-title')).toHaveText('Beginner');
    await expect(card.getByTestId('level-card-count')).toHaveText(badgeText(24));
  });

  test('TC-14 AC-H10: 1920 chuột, badge ẩn ở trạng thái thường, hiện khi rê và khi focus bàn phím; tên link có số', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'cần pointer hover (Pixel 7 không hover: badge luôn hiện, đo ở TC-21)');
    await open(page, TE15, 1920, 1080);
    const card = band(page, 'te15-level-three').getByTestId('level-card').first();
    const badge = card.getByTestId('level-card-count');
    test.skip((await badge.count()) === 0, 'collection all rỗng trên store: không có badge');
    const text = (await badge.textContent())!.trim();
    await expect(card.getByTestId('level-card-link')).toHaveAccessibleName(new RegExp(text.replace(/\s+/g, '\\s+')));
    const rowOpacity = () => badge.evaluate((el) => getComputedStyle(el.parentElement!).opacity);
    await page.mouse.move(0, 0);
    await expect.poll(rowOpacity, { message: 'từ 80rem có hover: hàng số ẩn khi không rê/focus' }).toBe('0');
    await card.hover();
    await expect.poll(rowOpacity).toBe('1');
    await page.mouse.move(0, 0);
    await card.getByTestId('level-card-link').focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await expect(card.getByTestId('level-card-link')).toBeFocused();
    await expect.poll(rowOpacity).toBe('1');
  });
});

test.describe('ES1-T187 bàn phím', () => {
  test('TC-15 Tab vào nút rồi danh sách, focus nhìn thấy; Enter trên next cuộn 1 card; mũi tên cuộn danh sách; Tab tới card', async ({ page }) => {
    await openEnhanced(page, 1024);
    const scope = band(page, 'te15-five');
    const row = rowOf(scope);
    const step = await cardStep(row.track);

    await row.prev.focus();
    await page.keyboard.press('Tab');
    await expect(row.next).toBeFocused();
    expect(await focusRing(row.next), 'focus ring nút next').toBe(true);
    await page.keyboard.press('Enter');
    await expect.poll(() => scrollLeft(row.track)).toBeCloseTo(step, 0);

    await page.keyboard.press('Tab');
    await expect(row.track).toBeFocused();
    expect(await focusRing(row.track), 'focus ring danh sách').toBe(true);
    const before = await scrollLeft(row.track);
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => scrollLeft(row.track)).toBeGreaterThan(before);
    await page.keyboard.press('ArrowLeft');
    await expect.poll(() => scrollLeft(row.track)).toBeLessThan(before + 1);

    await page.keyboard.press('Tab');
    const firstLink = row.cards.first().getByTestId('collection-card-link');
    await expect(firstLink).toBeFocused();
    expect(await focusRing(firstLink), 'focus ring card').toBe(true);
  });

  test('TC-16 Enter trên card trình độ mở đúng collection; focus nhìn thấy', async ({ page }) => {
    await open(page, TE15, 1024);
    const link = band(page, 'te15-level-three').getByTestId('level-card-link').first();
    const href = (await link.getAttribute('href'))!;
    await link.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await expect(link).toBeFocused();
    expect(await focusRing(link), 'focus ring level card').toBe(true);
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(new RegExp(`${href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\?|$)`));
  });
});

test.describe('ES1-T187 không JS', () => {
  test.use({ javaScriptEnabled: false });

  test('TC-17 nojs: nút, tiến trình ẩn; danh sách là khung cuộn, cuộn bằng bàn phím được; card là link; badge có sẵn', async ({ page }, info) => {
    const width = info.project.name === 'mobile' ? 360 : 1280;
    await page.setViewportSize({ width, height: 900 });
    await gotoStore(page, TE15, { waitUntil: 'domcontentloaded' });
    const row = rowOf(band(page, 'te15-five'));
    await expect(row.root).not.toHaveAttribute('data-enhanced', '');
    await expect(row.prev).toBeHidden();
    await expect(row.next).toBeHidden();
    await expect(row.progress).toBeHidden();
    await expect(row.track).toHaveCSS('overflow-x', 'auto');
    await expect(row.cards.getByRole('link')).toHaveCount(5);
    for (let i = 0; i < 5; i++) await expect(row.cards.nth(i).getByTestId('collection-card-link')).toHaveAttribute('href', /\/collections\/all$/);

    const trackBox = await box(row.track);
    const last = row.cards.last();
    const lastBefore = await box(last);
    expect(lastBefore.x + lastBefore.width, 'card cuối tràn: còn nội dung để cuộn').toBeGreaterThan(trackBox.x + trackBox.width);
    await row.track.focus();
    await page.keyboard.press('End');
    await expect.poll(async () => (await box(last)).x).toBeLessThan(lastBefore.x - 1);

    const level = band(page, 'te15-level-three');
    await expect(level.getByTestId('level-card-link')).toHaveCount(3);
    const badges = level.getByTestId('level-card-count');
    // Badge render ở server: có sẵn khi tắt JS (collection all rỗng thì không có hàng số, AC2).
    if (await badges.count()) await expect(badges.first()).toHaveText(new RegExp(`^\\d+ (${COUNT_FORMS.one.split(' ').pop()}|${COUNT_FORMS.other.split(' ').pop()})$`));
  });

  test('TC-18 nojs: /?view=figma card danh mục và trình độ vẫn là link tới collection', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoStore(page, FIGMA, { waitUntil: 'domcontentloaded' });
    const cards = band(page, 'figma-collection-list').getByTestId('collection-card-link');
    const count = await cards.count();
    test.skip(count < 5, `store mới có ${count}/5 collection figma-cat-*: chờ ES1-T178`);
    for (const [i, { handle }] of CATEGORIES.entries()) await expect(cards.nth(i)).toHaveAttribute('href', new RegExp(`/collections/${handle}$`));
  });
});

test.describe('ES1-T187 thiếu scroll-buttons.js', () => {
  test('TC-19 chặn file: không data-enhanced, nút ẩn, vẫn cuộn bằng bàn phím; axe 0 serious; 0 console error của theme', async ({ page }) => {
    const errors = watchConsole(page);
    await page.route(MODULE, (route) => route.abort());
    await page.setViewportSize({ width: 1024, height: 900 });
    await gotoStore(page, TE15);
    await page.waitForLoadState('load');
    const row = rowOf(band(page, 'te15-five'));
    await expect(row.root).not.toHaveAttribute('data-enhanced', '');
    await expect(row.prev).toBeHidden();
    await expect(row.next).toBeHidden();
    await expect(row.progress).toBeHidden();
    await row.track.focus();
    await page.keyboard.press('End');
    await expect.poll(() => scrollLeft(row.track)).toBeGreaterThan(0);
    await expectAxeClean(page, ['[data-testid="container-te15-five"]', '[data-testid="container-te15-level-three"]']);
    // Log mạng của chính file bị chặn là do test, không phải lỗi theme.
    expect(errors.filter((e) => !/scroll-buttons\.js|ERR_FAILED|Failed to load resource|Failed to fetch dynamically imported module/i.test(e))).toEqual([]);
  });
});

test.describe('ES1-T187 đo 360, 768 (Pixel 7)', () => {
  onlyProject('mobile', '360/768 đo ở Pixel 7 (touch); desktop đo 1280/1920');

  test('TC-20 360: card danh mục 252 (ảnh 252 × 165), tên 22px, không nút, có tiến trình; level 320 × 240 1 cột; không tràn; control ≥ 44', async ({ page }) => {
    await openEnhanced(page, 360);
    const row = rowOf(band(page, 'te15-five'));
    const card = await box(row.cards.first());
    near(card.width, 252, 'card 360');
    const img = await box(row.cards.first().getByTestId('collection-card-image'));
    near(img.width, 252, 'ảnh rộng 360');
    near(img.height, 165, 'ảnh cao 360');
    await expect(row.cards.first().getByTestId('collection-card-title')).toHaveCSS('font-size', '22px');
    await expect(row.prev).toBeHidden();
    await expect(row.next).toBeHidden();
    await expect(row.progress).toBeVisible();
    expect(card.height, 'vùng bấm card danh mục (::after phủ card)').toBeGreaterThanOrEqual(44);

    const levels = band(page, 'te15-level-three').getByTestId('level-card');
    const [a, b] = [await box(levels.nth(0)), await box(levels.nth(1))];
    near(a.width, 320, 'level rộng 360');
    near(a.height, 240, 'level cao 360');
    near(b.x, a.x, 'level 1 cột');
    const products = band(page, 'te15-level-three').getByTestId('level-card-count');
    if (await products.count()) {
      await expect(products.first()).toBeVisible();
      expect((await box(products.first().locator('xpath=..'))).height, 'hàng số sản phẩm cao 44').toBeGreaterThanOrEqual(44 - TOL);
    }
    await noHorizontalOverflow(page);
    await expectAxeClean(page, ['[data-testid="container-te15-five"]', '[data-testid="container-te15-level-three"]']);
  });

  test('TC-21 768: card danh mục 307 (ảnh 307 × 201), 2 nút 52 căn đáy h2, tiến trình; level 232 × 232 3 cột; không tràn', async ({ page }) => {
    await openEnhanced(page, 768);
    const row = rowOf(band(page, 'te15-five'));
    const card = await box(row.cards.first());
    near(card.width, 307, 'card 768');
    const img = await box(row.cards.first().getByTestId('collection-card-image'));
    near(img.width, 307, 'ảnh rộng 768');
    near(img.height, 201, 'ảnh cao 768');
    const heading = await box(row.heading);
    for (const [label, btn] of [['prev', row.prev], ['next', row.next]] as const) {
      await expect(btn).toBeVisible();
      const b = await box(btn);
      near(b.width, 52, `${label} rộng`);
      near(b.height, 52, `${label} cao`);
      near(b.y + b.height, heading.y + heading.height, `${label} căn đáy h2`);
    }
    await expect(row.progress).toBeVisible();

    const levels = band(page, 'te15-level-three').getByTestId('level-card');
    const [a, c] = [await box(levels.nth(0)), await box(levels.nth(2))];
    near(a.width, 232, 'level rộng 768');
    near(a.height, 232, 'level cao 768');
    near(c.y, a.y, 'level 3 cột');
    await noHorizontalOverflow(page);
  });
});

test.describe('ES1-T187 đo 1280, 1920 (desktop)', () => {
  onlyProject('desktop', '1280/1920 đo ở Desktop Chrome');

  test('TC-22 1280: card 271 (ảnh 271 × 177), thấy 4 card + ≥ 25% card 5, nút 52 bên phải tiêu đề; level 397', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await gotoStore(page, TE15);
    const row = rowOf(band(page, 'te15-five'));
    await expect(row.root).toHaveAttribute('data-enhanced', '');
    const cards = await Promise.all([0, 1, 2, 3, 4].map((i) => box(row.cards.nth(i))));
    near(cards[0].width, 271, 'card 1280');
    const img = await box(row.cards.first().getByTestId('collection-card-image'));
    near(img.width, 271, 'ảnh rộng 1280');
    near(img.height, 177, 'ảnh cao 1280');
    const cw = await page.evaluate(() => document.documentElement.clientWidth);
    expect(cards[3].x + cards[3].width, 'card 4 thấy trọn').toBeLessThanOrEqual(cw + 1);
    expect((cw - cards[4].x) / cards[4].width, 'card 5 thấy ≥ 25%').toBeGreaterThanOrEqual(0.25);
    const heading = await box(row.heading);
    for (const btn of [row.prev, row.next]) {
      await expect(btn).toBeVisible();
      const b = await box(btn);
      near(b.width, 52, 'nút rộng');
      expect(b.x, 'nút bên phải tiêu đề').toBeGreaterThanOrEqual(heading.x + heading.width - 1);
    }
    near((await box(band(page, 'te15-level-three').getByTestId('level-card').first())).width, 397, 'level 1280');
    await noHorizontalOverflow(page);
  });

  test('TC-23 1920: level card 456 × 456, 3 cột; không tràn', async ({ page }) => {
    await open(page, TE15, 1920, 1080);
    const levels = band(page, 'te15-level-three').getByTestId('level-card');
    const [a, c] = [await box(levels.nth(0)), await box(levels.nth(2))];
    near(a.width, 456, 'level rộng 1920');
    near(a.height, 456, 'level cao 1920');
    near(c.y, a.y, 'level 3 cột');
    await noHorizontalOverflow(page);
  });
});

test.describe('ES1-T187 chất lượng', () => {
  test('TC-24 axe 0 serious ở trạng thái đầu hàng, giữa hàng; 0 console error', async ({ page }) => {
    const errors = watchConsole(page);
    await openEnhanced(page, 1024);
    const selectors = ['[data-testid="container-te15-one"]', '[data-testid="container-te15-five"]', '[data-testid="container-te15-level-one"]', '[data-testid="container-te15-level-three"]'];
    await expectAxeClean(page, selectors);
    const row = rowOf(band(page, 'te15-five'));
    await row.next.click();
    await expect(row.prev).toHaveAttribute('aria-disabled', 'false');
    await expectAxeClean(page, selectors);
    expect(errors).toEqual([]);
  });
});
