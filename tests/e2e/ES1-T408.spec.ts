// ES1-T408 (TS-FE8): 404 form search + link home, password logo/shop.name, gift card khung QR 144 + chữ dự phòng.
// Nhóm @static đọc file repo, không cần store. Nhóm store chạy trên PREVIEW_URL.
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { env } from './support/store-data';
import { expectNotChallenged } from './support/store-guard';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

test.describe('ES1-T408 @static', () => {
  test('404: form tới routes.search_url có input search, link routes.root_url', () => {
    const src = read('templates/404.liquid');
    expect(src).toMatch(/<form[^>]*action="\{\{ routes\.search_url \}\}"/);
    expect(src).toMatch(/type="search"/);
    expect(src).toMatch(/name="q"/);
    expect(src).toMatch(/<label[^>]*for="NotFoundSearchInput"/);
    expect(src).toMatch(/href="\{\{ routes\.root_url \}\}"/);
    expect(src).toMatch(/routes\.all_products_collection_url/);
  });

  test('password: settings.logo alt shop.name, rỗng thì shop.name', () => {
    const src = read('templates/password.liquid');
    expect(src).toMatch(/settings\.logo/);
    expect(src).toMatch(/alt: shop\.name/);
    expect(src).toMatch(/\{\{ shop\.name \| escape \}\}/);
  });

  test('gift card: khung QR đủ hook, không thẻ script (BE làm ở TS-BE1), 1 viewport', () => {
    const src = read('templates/gift_card.liquid');
    for (const hook of ['data-gift-card-qr', 'data-identifier="{{ gift_card.qr_identifier', "data-label=\"{{ 'gift_card.qr_alt' | t",
      'data-testid="gift-card-qr"', 'data-testid="gift-card-qr-fallback"', 'data-testid="gift-card-code"', 'data-testid="gift-card-wallet"']) {
      expect(src, hook).toContain(hook);
    }
    expect(src).toMatch(/unless gift_card\.expired or gift_card\.enabled == false/);
    expect(src).not.toMatch(/<script/);
    // viewport in một lần, qua snippets/meta-tags
    expect(src).toContain("render 'meta-tags'");
    expect(read('snippets/meta-tags.liquid')).toMatch(/<meta name="viewport" content="width=device-width,initial-scale=1">/);
  });

  test('locale có đủ key', () => {
    const t = JSON.parse(read('locales/en.default.json'));
    expect(t['404'].search_label).toBe('Search the store');
    expect(t['404'].home).toBe('Back To Homepage');
    expect(t.gift_card.qr_alt).toBeTruthy();
    expect(t.gift_card.qr_fallback).toBe('Enter the code at checkout');
  });
});

test.describe('ES1-T408 store', () => {
  test('404: form search tới /search và link về /', async ({ page }) => {
    const res = await page.goto('/pages/khong-co');
    await expectNotChallenged(page);
    expect(res?.status()).toBe(404);
    const input = page.locator('main form[action$="/search"] input[type="search"][name="q"]');
    await expect(input).toBeVisible();
    await expect(page.getByLabel('Search the store')).toBeVisible();
    const home = page.getByTestId('not-found-home');
    await expect(home).toHaveAttribute('href', '/');
    const box = await home.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    await input.fill('a');
    await input.press('Enter');
    await expect(page).toHaveURL(/\/search\?.*q=a/);
  });

  test('password: logo (alt shop.name) hoặc chữ shop.name trên h1', async ({ browser }) => {
    const preview = process.env.PREVIEW_URL;
    test.skip(!preview, 'thiếu PREVIEW_URL');
    // Context mới không cookie mở khoá, giữ theme preview qua query.
    const context = await browser.newContext();
    const page = await context.newPage();
    const url = new URL(preview!);
    await page.goto(`${url.origin}/password${url.search}`);
    test.skip(!new URL(page.url()).pathname.startsWith('/password'), 'store dev không bật mật khẩu');
    const logo = page.getByTestId('password-logo');
    await expect(logo).toBeVisible();
    const img = logo.locator('img');
    if (await img.count()) {
      expect(await img.getAttribute('alt')).toBeTruthy();
    } else {
      await expect(logo).not.toHaveText('');
    }
    // logo nằm trên h1
    const [l, h] = await Promise.all([logo.boundingBox(), page.locator('h1').boundingBox()]);
    expect(l!.y).toBeLessThan(h!.y);
    await context.close();
  });

  const GIFT_CARD = env('TS_GIFT_CARD_URL');

  test('gift card: khung QR ≥ 120 × 120', async ({ page }) => {
    test.fixme(!GIFT_CARD, 'ES1-T298: store dev chưa có gift card phát hành (TS_GIFT_CARD_URL)');
    await page.goto(GIFT_CARD!);
    const qr = page.getByTestId('gift-card-qr');
    const box = await qr.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(120);
    expect(box!.height).toBeGreaterThanOrEqual(120);
    await expect(page.getByTestId('gift-card-code')).toBeVisible();
    await expect(page.locator('meta[name="viewport"]')).toHaveCount(1);
  });

  test('gift card: tắt JS vẫn thấy chữ dự phòng', async ({ browser }) => {
    test.fixme(!GIFT_CARD, 'ES1-T298: store dev chưa có gift card phát hành (TS_GIFT_CARD_URL)');
    const context = await browser.newContext({ javaScriptEnabled: false, storageState: 'tests/setup/state.json' });
    const page = await context.newPage();
    await page.goto(new URL(GIFT_CARD!, process.env.STORE_ORIGIN || new URL(process.env.PREVIEW_URL!).origin).href);
    await expect(page.getByTestId('gift-card-qr-fallback')).toBeVisible();
    await expect(page.getByTestId('gift-card-qr-fallback')).toHaveText('Enter the code at checkout');
    await context.close();
  });
});
