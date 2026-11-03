// Ticket ES1-T52 (2727475000000142025): TE-3-BE1 assets/product-swatch.js trên / và /collections/all.
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T52.spec.ts -g "AC2"
// Hook bám theo snippets/product-card.liquid (ES1-T50, task-split ES1-T47 D5, D7).
// Không có card ≥ 2 swatch trên trang thì test skip có lý do (dữ liệu demo TE-9 AC4).
import { test, expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES = ['/', '/collections/all'];
const SWATCH = 'input[type="radio"][data-variant-id]';

function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
  page.on('console', m => {
    if (m.type() === 'error') errors.push(`console: ${m.text()} @ ${m.location().url}`);
  });
  return errors;
}

function trackDocuments(page: Page): string[] {
  const docs: string[] = [];
  page.on('request', r => {
    if (r.resourceType() === 'document' && r.frame() === page.mainFrame()) docs.push(r.url());
  });
  return docs;
}

async function open(page: Page, path: string) {
  await page.goto(path);
  const card = page
    .getByTestId('product-card')
    .filter({ has: page.locator(`[data-testid="product-card-swatches"] ${SWATCH}:nth-of-type(2)`) })
    .first();
  if (!(await card.count())) return null;
  await page.waitForFunction(() => customElements.get('product-swatch') !== undefined);
  await card.scrollIntoViewIfNeeded();
  return card;
}

const pathOf = (url: string, base: string) => new URL(url, base).pathname;

async function currentSrcPath(card: Locator, base: string) {
  const src = await card.locator('img[data-card-image]').evaluate(i => (i as HTMLImageElement).currentSrc);
  return src ? pathOf(src, base) : '';
}

// Đổi sang radio `target`, kiểm ảnh, link, giá, URL trang, không request document mới.
// `docsBefore`: số document đã request trước thao tác (tính cả redirect lúc tải).
async function expectSwapped(page: Page, card: Locator, target: Locator, pageUrl: string, docs: string[], docsBefore: number) {
  const data = await target.evaluate(el => ({ ...(el as HTMLInputElement).dataset }));
  await expect(target).toBeChecked();

  // Link tiêu đề và mọi data-card-link trỏ variant mới
  await expect(card.getByTestId('product-card-title')).toHaveAttribute('href', data.variantUrl!);
  await expect(card.getByTestId('product-card-title')).toHaveAttribute('href', new RegExp(`[?&]variant=${data.variantId}\\b`));
  const hrefs = await card.locator('a[data-card-link]').evaluateAll(els => els.map(a => a.getAttribute('href')));
  expect(new Set(hrefs)).toEqual(new Set([data.variantUrl]));

  // Ảnh: srcset/src mới, currentSrc đổi theo, giữ width/height
  const img = card.locator('img[data-card-image]');
  if (data.imageSrc) {
    await expect(img).toHaveAttribute('src', data.imageSrc);
    await expect(img).toHaveAttribute('alt', data.imageAlt ?? '');
    const want = pathOf(data.imageSrc, pageUrl);
    await expect.poll(() => currentSrcPath(card, pageUrl), { message: 'img currentSrc theo variant mới' }).toBe(want);
  }

  // Giá: có template của variant thì nội dung giá = template
  const tpl = card.locator(`template[data-price-for="${data.variantId}"]`);
  if (await tpl.count()) {
    const want = await tpl.evaluate(t => (t as HTMLTemplateElement).content.textContent!.replace(/\s+/g, ' ').trim());
    await expect.poll(() =>
      card.locator('[data-card-price]').evaluate(p => p.textContent!.replace(/\s+/g, ' ').trim()),
    ).toBe(want);
  }

  expect(page.url(), 'URL trang giữ nguyên').toBe(pageUrl);
  expect(docs.slice(docsBefore), 'không request document mới sau thao tác').toEqual([]);
}

test.describe('ES1-T52 product-swatch', () => {
  for (const path of PAGES) {
    test(`AC2: chuột chọn swatch thứ 2 đổi ảnh, link ?variant=, giá, không reload (${path})`, async ({ page }) => {
      const errors = trackErrors(page);
      const docs = trackDocuments(page);
      const card = await open(page, path);
      test.skip(!card, `Không có card ≥ 2 swatch trên ${path}`);
      const pageUrl = page.url();
      const docsBefore = docs.length;

      const radios = card!.locator(SWATCH);
      const checkedIndex = await radios.evaluateAll(els => els.findIndex(e => (e as HTMLInputElement).checked));
      const index = checkedIndex === 1 ? 0 : 1;
      const target = radios.nth(index);
      const img = card!.locator('img[data-card-image]');
      const hasImg = (await img.count()) > 0;
      const dims = () => img.evaluate(i => [i.getAttribute('width'), i.getAttribute('height')]);
      const size = hasImg ? await dims() : null;
      const box = hasImg ? await img.boundingBox() : null;

      await card!.getByTestId('product-card-swatch').nth(index).click();
      await expectSwapped(page, card!, target, pageUrl, docs, docsBefore);

      if (hasImg) {
        expect(await dims(), 'giữ width/height').toEqual(size);
        const after = await img.boundingBox();
        expect(after!.height, 'khung ảnh không đổi cao (CLS)').toBeCloseTo(box!.height, 0);
      }
      expect(errors).toEqual([]);
    });

    test(`AC2: phím mũi tên đổi swatch, focus giữ trên radio (${path})`, async ({ page }) => {
      const errors = trackErrors(page);
      const docs = trackDocuments(page);
      const card = await open(page, path);
      test.skip(!card, `Không có card ≥ 2 swatch trên ${path}`);
      const pageUrl = page.url();
      const docsBefore = docs.length;

      const radios = card!.locator(SWATCH);
      const n = await radios.count();
      const checkedIndex = await radios.evaluateAll(els => els.findIndex(e => (e as HTMLInputElement).checked));
      const from = checkedIndex < 0 ? 0 : checkedIndex;
      await radios.nth(from).focus();
      if (checkedIndex < 0) await page.keyboard.press('Space');
      await page.keyboard.press('ArrowDown');

      const target = radios.nth((from + 1) % n);
      await expectSwapped(page, card!, target, pageUrl, docs, docsBefore);
      await expect(target, 'focus không mất sau khi đổi ảnh').toBeFocused();
      expect(errors).toEqual([]);
    });

    test(`AC2: axe 0 serious/critical sau khi đổi swatch (${path})`, async ({ page }) => {
      const card = await open(page, path);
      test.skip(!card, `Không có card ≥ 2 swatch trên ${path}`);
      const radios = card!.locator(SWATCH);
      const checkedIndex = await radios.evaluateAll(els => els.findIndex(e => (e as HTMLInputElement).checked));
      await card!.getByTestId('product-card-swatch').nth(checkedIndex === 1 ? 0 : 1).click();
      const result = await new AxeBuilder({ page }).include('[data-testid="product-card"]').analyze();
      const bad = result.violations.filter(v => v.impact === 'serious' || v.impact === 'critical');
      expect(bad.map(v => `${v.id}: ${v.nodes.length}`)).toEqual([]);
    });
  }

  test('AC2: card nối lại DOM vẫn đổi swatch, không lỗi', async ({ page }) => {
    const errors = trackErrors(page);
    const docs = trackDocuments(page);
    const card = await open(page, '/collections/all');
    test.skip(!card, 'Không có card ≥ 2 swatch trên /collections/all');
    const pageUrl = page.url();
    const docsBefore = docs.length;

    // Gỡ rồi gắn lại card (disconnectedCallback + connectedCallback)
    await card!.evaluate(el => {
      const parent = el.parentElement!;
      const next = el.nextSibling;
      el.remove();
      parent.insertBefore(el, next);
    });

    const radios = card!.locator(SWATCH);
    const checkedIndex = await radios.evaluateAll(els => els.findIndex(e => (e as HTMLInputElement).checked));
    const index = checkedIndex === 1 ? 0 : 1;
    const target = radios.nth(index);
    await card!.getByTestId('product-card-swatch').nth(index).click();
    await expectSwapped(page, card!, target, pageUrl, docs, docsBefore);
    expect(errors).toEqual([]);
  });

  for (const path of PAGES) {
    test(`AC2: 0 console error khi tải trang (${path})`, async ({ page }) => {
      const errors = trackErrors(page);
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      expect(errors).toEqual([]);
    });
  }
});
