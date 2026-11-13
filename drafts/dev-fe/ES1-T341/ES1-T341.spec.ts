// KHÔNG CHẮC: spec chưa chạy, chưa type-check (phiên dev-fe không có node_modules, PREVIEW_URL, STORE_PASSWORD); scope-guard chặn dev-fe ghi tests/ → Orchestrator chép sang tests/e2e/ES1-T341.spec.ts.
// Ticket ES1-T341 TE-17-R2-FE2: quiz, shop the look, make fitness ở 360 / 768 / 1280 / 1920.
// AC: TE-11 AC4, TE-12 AC5 (+ số đo AC9), AC-H19 (store dev đã áp fixture ES1-T331), AC-H20, AC-H35.
// Nguồn số đo: docs/ui-spec/index-mobile-a.md §6–§8, docs/ui-spec/index-1280.md §1 khối 6–8, §2.4, §2.5. Sai số 2 px (ES1-T309 #4).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T341.spec.ts
// Đo bố cục chỉ chạy project desktop (đổi viewport tay). Thiếu ảnh/sản phẩm trên store thì skip có lý do, không coi là đạt.
import { test, expect, type Page, type Locator } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expectNotChallenged, gotoStore } from './support/store-guard';
import { skipUnlessFixture } from './support/home-fixture';

const ROOT = process.cwd();
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');
const TOL = 2;
const WIDTHS = { mobile: 360, tablet: 768, desktop: 1280, wide: 1920 } as const;

type Box = { x: number; y: number; width: number; height: number };
const box = async (l: Locator): Promise<Box> => {
  await l.scrollIntoViewIfNeeded();
  const b = await l.boundingBox();
  expect(b, 'phần tử có hộp hiển thị').not.toBeNull();
  return b!;
};
const near = (actual: number, expected: number, label: string) => expect(Math.abs(actual - expected), `${label}: ${actual} ≈ ${expected}`).toBeLessThanOrEqual(TOL);
const css = (l: Locator, prop: string) => l.evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), prop);

async function openHome(page: Page, width: number) {
  await page.setViewportSize({ width, height: 900 });
  await gotoStore(page, '/');
  await expectNotChallenged(page);
}

async function noOverflow(page: Page) {
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(over, 'không cuộn ngang').toBeLessThanOrEqual(0);
}

test.describe('ES1-T341 @static', () => {
  test.beforeEach(({}, info) => { test.skip(info.project.name !== 'desktop', 'tĩnh, chạy 1 lần'); });
  const base = read('assets/base.css');
  const look = read('blocks/shop-the-look.liquid');
  const locale = JSON.parse(read('locales/en.default.json'));

  test('--panel-muted chung: không còn --look-panel-muted, chữ phụ panel shop the look và ghi chú quiz dùng token chung', () => {
    expect(base).not.toMatch(/--look-panel-muted|shop-the-look__discount-note/);
    expect(base).toMatch(/\.shop-the-look__line \{[^}]*color: var\(--panel-muted\)/);
    expect(base).toMatch(/\.shop-the-look__line--discount \{[^}]*color: var\(--panel-saving\)/);
    expect(base).toMatch(/\.quiz__note \{[^}]*color: var\(--panel-muted\)/);
  });

  test('AC-H19: không dòng ghi chú giảm giá; dòng giảm có icon aria-hidden + dấu trừ', () => {
    expect(look).not.toMatch(/discount_note|discount-note/);
    expect(look).toMatch(/shop-the-look__discount-icon[^>]*aria-hidden="true"/);
    expect(base).toMatch(/\.shop-the-look__discount:not\(:empty\)::before \{\s*content: '\\2212\\00a0';/);
    expect(locale.blocks.shop_the_look.discount_note).toBeUndefined();
  });

  test('AC-H20 / AC9: hook nhãn hotspot cho BE, locale "Show %t in the list"', () => {
    expect(look).toMatch(/data-label-hotspot="\{\{ label_hotspot \| escape \}\}"/);
    expect(locale.blocks.shop_the_look.hotspot_product).toBe('Show %t in the list');
  });

  test('Make fitness: min-height 50vw, display min(display, 6.25vw), <br> trong locale heading', () => {
    expect(base).toMatch(/\.image-with-text--banner \{\s*align-content: center;\s*min-block-size: 50vw;/);
    expect(base).toMatch(/\.image-with-text--banner \.image-with-text__heading \{\s*font-size: min\(var\(--font-size-display\), 6\.25vw\);/);
    expect(locale.blocks.image_with_text.banner_heading_html).toMatch(/fitness<br>.*your<br>/);
  });
});

test.describe('ES1-T341 quiz (TE-11 AC4, index-mobile-a §6, index-1280 khối 6)', () => {
  test.beforeEach(({}, info) => { test.skip(info.project.name !== 'desktop', 'đổi viewport tay'); });

  test('360: panel tràn mép không bo, body map ẩn, lựa chọn ≥ 72 (≥ 44), thẻ 320', async ({ page }) => {
    await openHome(page, WIDTHS.mobile);
    const quiz = page.getByTestId('quiz').first();
    test.skip(!(await quiz.count()), 'Trang chủ không có quiz (bước rỗng)');
    const q = await box(quiz);
    near(q.x, 0, 'mép trái panel');
    near(q.width, WIDTHS.mobile, 'rộng panel');
    expect(await css(quiz, 'border-top-left-radius')).toBe('0px');
    near((await box(page.getByTestId('quiz-form').first())).width, 320, 'rộng thẻ');
    const maps = page.locator('.quiz-step__map');
    for (let i = 0; i < (await maps.count()); i++) await expect(maps.nth(i)).toBeHidden();
    const options = page.locator('[data-testid="quiz-step"][data-active] [data-testid="quiz-option"], [data-testid="quiz-step"]:first-of-type [data-testid="quiz-option"]');
    const n = await options.count();
    expect(n).toBeGreaterThan(0);
    for (let i = 0; i < n; i++) {
      const b = await options.nth(i).boundingBox();
      if (b) expect(b.height, 'lựa chọn cao ≥ 72').toBeGreaterThanOrEqual(72 - TOL);
    }
    await noOverflow(page);
  });

  for (const [width, panel, radius] of [[WIDTHS.tablet, 728, '24px'], [WIDTHS.desktop, 1240, '24px'], [WIDTHS.wide, 1416, '24px']] as const) {
    test(`${width}: panel ${panel} bo 24${width >= 1280 ? ', thẻ 608, giới thiệu cùng hàng' : ', thẻ dưới giới thiệu'}`, async ({ page }) => {
      await openHome(page, width);
      const quiz = page.getByTestId('quiz').first();
      test.skip(!(await quiz.count()), 'Trang chủ không có quiz (bước rỗng)');
      near((await box(quiz)).width, panel, 'rộng panel');
      expect(await css(quiz, 'border-top-left-radius')).toBe(radius);
      const form = await box(page.getByTestId('quiz-form').first());
      if (width >= 1280) {
        near(form.width, 608, 'thẻ câu hỏi');
        const heading = page.getByTestId('quiz-heading').first();
        if (await heading.count()) expect((await box(heading)).x + (await box(heading)).width).toBeLessThanOrEqual(form.x);
      } else {
        near(form.width, panel - 64, 'thẻ trong panel padding 32');
      }
      await noOverflow(page);
    });
  }
});

test.describe('ES1-T341 shop the look (TE-12 AC5, AC9, index-1280 §2.4)', () => {
  test.beforeEach(({}, info) => { test.skip(info.project.name !== 'desktop', 'đổi viewport tay'); });

  const parts = (page: Page) => {
    const root = page.getByTestId('shop-the-look').first();
    return {
      root,
      image: root.getByTestId('shop-the-look-image'),
      rows: root.getByTestId('shop-the-look-row'),
      panel: root.getByTestId('shop-the-look-panel'),
      note: root.getByTestId('shop-the-look-note'),
    };
  };

  for (const [width, w, h] of [[WIDTHS.mobile, 320, 279], [WIDTHS.tablet, 728, 635], [WIDTHS.desktop, 819, 714], [WIDTHS.wide, 936, 816]] as const) {
    test(`${width}: ảnh ${w} × ${h}`, async ({ page }) => {
      await openHome(page, width);
      const { root, image } = parts(page);
      test.skip(!(await root.count()) || !(await image.count()), 'Shop the look chưa có ảnh trên store');
      const b = await box(image);
      near(b.width, w, 'rộng ảnh');
      near(b.height, h, 'cao ảnh');
      await noOverflow(page);
    });
  }

  test('360: 1 cột ảnh → Fits → hàng → panel; link dưới h2 cao 44', async ({ page }) => {
    await openHome(page, WIDTHS.mobile);
    const { root, image, rows, panel } = parts(page);
    test.skip(!(await rows.count()), 'Shop the look không có hàng');
    const last = await box(rows.last());
    const p = await box(panel);
    expect(p.y).toBeGreaterThanOrEqual(last.y + last.height);
    if (await image.count()) expect((await box(rows.first())).y).toBeGreaterThan((await box(image)).y);
    const link = root.getByTestId('shop-the-look-link');
    if (await link.count()) expect((await box(link)).height).toBeGreaterThanOrEqual(44);
  });

  test('768: dưới ảnh lưới 1fr | 280, panel dính trong khối', async ({ page }) => {
    await openHome(page, WIDTHS.tablet);
    const { image, rows, panel } = parts(page);
    test.skip(!(await image.count()) || !(await rows.count()), 'Shop the look thiếu ảnh hoặc hàng');
    const img = await box(image);
    const p = await box(panel);
    const r = await box(rows.first());
    near(p.width, 280, 'rộng panel');
    expect(p.y).toBeGreaterThanOrEqual(img.y + img.height);
    expect(r.x + r.width).toBeLessThanOrEqual(p.x);
    expect(await css(panel, 'position')).toBe('sticky');
  });

  test('1280: cột phải 397, Fits 84, hàng 80, ảnh hàng 56, hàng cách 8, đáy panel = đáy ảnh', async ({ page }) => {
    await openHome(page, WIDTHS.desktop);
    const { image, rows, panel, note } = parts(page);
    test.skip(!(await image.count()) || (await rows.count()) < 2, 'Shop the look thiếu ảnh hoặc < 2 hàng');
    const img = await box(image);
    const p = await box(panel);
    near(p.width, 397, 'rộng cột phải');
    near(p.y + p.height, img.y + img.height, 'đáy panel');
    if (await note.count()) near((await box(note)).height, 84, 'cao Fits');
    const r1 = await box(rows.nth(0));
    const r2 = await box(rows.nth(1));
    near(r1.height, 80, 'cao hàng');
    near(r2.y - (r1.y + r1.height), 8, 'khoảng hàng');
    const thumb = rows.nth(0).locator('.shop-the-look-row__thumb');
    near((await box(thumb)).width, 56, 'ảnh hàng');
  });

  test('AC-H35: tên sản phẩm của hàng có vùng bấm ≥ 44, hotspot 44 × 44', async ({ page }) => {
    await openHome(page, WIDTHS.mobile);
    const { root, rows } = parts(page);
    test.skip(!(await rows.count()), 'Shop the look không có hàng');
    const title = rows.first().getByTestId('shop-the-look-row-title');
    expect((await box(title)).height).toBeGreaterThanOrEqual(44 - 0.5);
    const hotspots = root.getByTestId('shop-the-look-hotspot');
    for (let i = 0; i < (await hotspots.count()); i++) {
      const b = await hotspots.nth(i).boundingBox();
      if (b) { expect(b.width).toBeGreaterThanOrEqual(44); expect(b.height).toBeGreaterThanOrEqual(44); }
    }
  });

  test('AC-H20: hover/focus hotspot → hàng cùng số viền accent; bấm hàng → hotspot aria-pressed', async ({ page }) => {
    await openHome(page, WIDTHS.desktop);
    const { root, rows } = parts(page);
    const hotspots = root.getByTestId('shop-the-look-hotspot');
    test.skip((await hotspots.count()) < 2 || (await rows.count()) < 2, 'Cần ảnh + ≥ 2 hàng có hotspot');
    await root.scrollIntoViewIfNeeded();
    await expect(root).toHaveAttribute('data-enhanced', '', { timeout: 10000 });
    const row2 = root.locator('[data-look-row="2"]');
    await hotspots.nth(1).hover();
    await expect(row2).toHaveAttribute('data-look-active', '');
    const accent = await page.evaluate(() => {
      const probe = document.createElement('i');
      probe.style.color = 'var(--color-accent)';
      document.body.append(probe);
      const c = getComputedStyle(probe).color;
      probe.remove();
      return c;
    });
    expect(await css(row2, 'border-top-color')).toBe(accent);
    await hotspots.nth(0).focus();
    await expect(root.locator('[data-look-row="1"]')).toHaveAttribute('data-look-active', '');
    await row2.locator('.shop-the-look-row__thumb').click();
    await expect(root.locator('[data-hotspot="2"]')).toHaveAttribute('aria-pressed', 'true');
  });

  test('AC-H19 (store dev đã áp fixture): dòng giảm màu --panel-saving + icon, không ghi chú, tổng = tạm tính − giảm', async ({ page }) => {
    await openHome(page, WIDTHS.desktop);
    await skipUnlessFixture(page);
    const { root } = parts(page);
    await root.scrollIntoViewIfNeeded();
    await expect(root).toHaveAttribute('data-enhanced', '', { timeout: 10000 });
    const row = root.getByTestId('shop-the-look-discount-row');
    test.skip(!(await row.isVisible()), 'Fixture chưa đặt bậc giảm đạt được với số hàng hiện có');
    await expect(root.getByTestId('shop-the-look-discount-note')).toHaveCount(0);
    await expect(row.locator('.shop-the-look__discount-icon')).toHaveCount(1);
    const saving = await page.evaluate(() => {
      const probe = document.createElement('i');
      probe.style.color = 'var(--panel-saving)';
      document.body.append(probe);
      const c = getComputedStyle(probe).color;
      probe.remove();
      return c;
    });
    expect(await css(row, 'color')).toBe(saving);
    await expect(root.getByTestId('shop-the-look-discount')).toHaveText(/\d/);
    const cents = (s: string) => Number(s.replace(/[^\d]/g, ''));
    const sub = cents(await root.getByTestId('shop-the-look-subtotal').innerText());
    const off = cents(await root.getByTestId('shop-the-look-discount').innerText());
    const total = cents(await root.getByTestId('shop-the-look-total').innerText());
    expect(total).toBe(sub - off);
    const inputs = await root.locator('[data-bundle-item]').evaluateAll((els) => els.reduce((s, el) => s + Number((el as HTMLElement).dataset.price), 0));
    expect(sub, 'hàng hết hàng không tính vào tạm tính').toBe(inputs);
  });
});

test.describe('ES1-T341 make fitness (index-mobile-a §8, index-1280 §2.5)', () => {
  test.beforeEach(({}, info) => { test.skip(info.project.name !== 'desktop', 'đổi viewport tay'); });

  const band = (page: Page) => page.getByTestId('container-home-inspiration').getByTestId('image-with-text');
  const accent = (page: Page, n: 1 | 2 | 3) => band(page).locator(`.image-with-text__accent--${n}`);

  test('360: ảnh 1 112 trái, ảnh phải 88 lệch xuống 40, ảnh dưới trái ẩn; chữ dưới ảnh', async ({ page }) => {
    await openHome(page, WIDTHS.mobile);
    test.skip(!(await accent(page, 1).count()) || !(await accent(page, 3).count()), 'Store thiếu ảnh accent 1/3');
    const a1 = await box(accent(page, 1));
    const a3 = await box(accent(page, 3));
    near(a1.width, 112, 'ảnh 1');
    near(a3.width, 88, 'ảnh phải');
    near(a3.y - a1.y, 40, 'lệch xuống');
    expect(a3.x).toBeGreaterThan(a1.x);
    if (await accent(page, 2).count()) await expect(accent(page, 2)).toBeHidden();
    const content = await box(band(page).getByTestId('image-with-text-content'));
    expect(content.y).toBeGreaterThanOrEqual(Math.max(a1.y + a1.height, a3.y + a3.height));
    await noOverflow(page);
  });

  test('768: 160 | 128 lệch 64, ảnh dưới trái 104 cách đáy 64', async ({ page }) => {
    await openHome(page, WIDTHS.tablet);
    test.skip(!(await accent(page, 2).count()), 'Store thiếu ảnh accent 2');
    near((await box(accent(page, 1))).width, 160, 'ảnh 1');
    if (await accent(page, 3).count()) near((await box(accent(page, 3))).width, 128, 'ảnh phải');
    const a2 = await box(accent(page, 2));
    const b = await box(band(page));
    near(a2.width, 104, 'ảnh dưới trái');
    near(b.y + b.height - (a2.y + a2.height), 64, 'cách đáy');
    await noOverflow(page);
  });

  for (const [width, height, display, sizes] of [[WIDTHS.desktop, 640, 80, [187, 125, 133]], [WIDTHS.wide, 960, 100, [280, 187, 200]]] as const) {
    test(`${width}: cao ≥ ${height}, display ${display}, ảnh ${sizes.join(' / ')}`, async ({ page }) => {
      await openHome(page, width);
      const b = await box(band(page));
      expect(b.height).toBeGreaterThanOrEqual(height - TOL);
      const heading = band(page).getByTestId('image-with-text-heading');
      near(parseFloat(await css(heading, 'font-size')), display, 'cỡ display');
      for (const [i, n] of ([1, 2, 3] as const).entries()) {
        if (await accent(page, n).count()) near((await box(accent(page, n))).width, sizes[i], `ảnh ${n}`);
      }
      await noOverflow(page);
    });
  }
});
