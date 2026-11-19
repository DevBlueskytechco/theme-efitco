// ES1-T300 repro R1: assets/product-swatch.js thật trên card giả (không cần store).
// Nghi vấn: hover preview (2fd33f9, ES1-T235) đặt src trước, click sau đó gọi swapImage thì thoát sớm vì src đã bằng => alt không đổi.
// Chạy: npx playwright test --config=drafts/qa/ES1-T300/repro/pw.repro.config.ts
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect, type Page } from '@playwright/test';

const JS = readFileSync(join(process.cwd(), 'assets/product-swatch.js'), 'utf8');

const CARD = `
<product-swatch class="product-card" data-testid="product-card">
  <a href="/products/p?variant=1" data-card-link><img data-card-image="card" src="/a.png" alt="Alt A" width="100" height="100"></a>
  <a href="/products/p?variant=1" data-card-link data-testid="product-card-title">P</a>
  <div data-card-price>$1</div>
  <fieldset data-testid="product-card-swatches">
    <input type="radio" id="s1" name="o" value="A" checked data-variant-id="1" data-variant-url="/products/p?variant=1" data-image-src="/a.png" data-image-srcset="/a.png 360w" data-image-alt="Alt A">
    <label class="product-card__swatch" for="s1" data-testid="product-card-swatch" style="display:inline-block;width:32px;height:24px;background:#000">A</label>
    <input type="radio" id="s2" name="o" value="B" data-variant-id="2" data-variant-url="/products/p?variant=2" data-image-src="/b.png" data-image-srcset="/b.png 360w" data-image-alt="Alt B">
    <label class="product-card__swatch" for="s2" data-testid="product-card-swatch" style="display:inline-block;width:32px;height:24px;background:#888">B</label>
  </fieldset>
</product-swatch>`;

async function open(page: Page) {
  await page.route('**/*.png', (r) => r.fulfill({ status: 200, contentType: 'image/png', body: Buffer.from('89504e470d0a1a0a', 'hex') }));
  await page.route('http://repro.local/', (r) => r.fulfill({ status: 200, contentType: 'text/html', body: `<!doctype html><html><body>${CARD}</body></html>` }));
  await page.goto('http://repro.local/');
  await page.addScriptTag({ content: JS });
  await page.waitForFunction(() => customElements.get('product-swatch') !== undefined);
}

test('R1a chuột: hover rồi click swatch B => alt phải là "Alt B" (như TE-3 TC-12 dòng 312)', async ({ page }) => {
  await open(page);
  await page.getByTestId('product-card-swatch').nth(1).click(); // Playwright di chuột tới (pointerover) rồi click
  const img = page.locator('img[data-card-image]');
  await expect(img).toHaveAttribute('src', '/b.png');
  await expect(page.locator('#s2')).toBeChecked();
  await expect(img).toHaveAttribute('alt', 'Alt B');
});

test('R1b không hover (gọi click() trong trang, không có pointerover) => alt "Alt B"', async ({ page }) => {
  await open(page);
  await page.locator('#s2').evaluate((el) => (el as HTMLInputElement).click());
  await expect(page.locator('img[data-card-image]')).toHaveAttribute('alt', 'Alt B');
});
