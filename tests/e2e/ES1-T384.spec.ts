// ES1-T384 (TE-21-R2-FE2): 404 (AC7, AC8), password (AC9–AC12), gift card (AC13–AC15 phần markup), AC16–AC17.
// Nhóm @static đọc file repo, không cần store. Nhóm store chạy trên PREVIEW_URL.
// Skip/fixme vì thiếu dữ liệu (không tính là đạt): gift card phát hành (TS_GIFT_CARD_URL, ES1-T298); store chưa bật mật khẩu.
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { env } from './support/store-data';
import { expectNotChallenged } from './support/store-guard';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');
const schema = (p: string) => JSON.parse(read(p).split('{% schema %}')[1].split('{% endschema %}')[0]);

test.describe('ES1-T384 @static', () => {
  test('not-found: setting đúng bảng SRS, default chữ rỗng, không presets', () => {
    const s = schema('blocks/not-found.liquid');
    expect(s.presets).toBeUndefined();
    const by = Object.fromEntries(s.settings.map((x: { id: string }) => [x.id, x]));
    expect(by.heading.type).toBe('text');
    expect(by.heading.default).toBeUndefined();
    expect(by.text.type).toBe('textarea');
    expect(by.text.default).toBeUndefined();
    expect(by.show_search).toMatchObject({ type: 'checkbox', default: true });
    expect(by.category_menu.type).toBe('link_list');
    const src = read('blocks/not-found.liquid');
    expect(src).toContain('limit: 6');
    expect(src).toContain('{{ block.shopify_attributes }}');
    expect(src).toContain('request.design_mode');
    expect(src).not.toMatch(/autofocus/);
  });

  test('password-hero: setting đúng bảng SRS, details mở khi lỗi hoặc tắt newsletter', () => {
    const s = schema('blocks/password-hero.liquid');
    expect(s.presets).toBeUndefined();
    const by = Object.fromEntries(s.settings.map((x: { id: string }) => [x.id, x]));
    expect(by.eyebrow).toMatchObject({ type: 'text' });
    expect(by.eyebrow.default).toBeUndefined();
    expect(by.heading).toMatchObject({ type: 'inline_richtext' });
    expect(by.heading.default).toBeUndefined();
    expect(by.image.type).toBe('image_picker');
    expect(by.show_newsletter).toMatchObject({ type: 'checkbox', default: true });
    const src = read('blocks/password-hero.liquid');
    expect(src).toMatch(/if form\.errors or show_newsletter == false %\}\s*open/);
    expect(src).toContain('value="newsletter,password-page"');
    expect(src).toContain('autocomplete="current-password"');
    expect(src).toContain('powered_by_link');
    // nút mắt chỉ hiện khi BE gỡ hidden
    expect(src).toMatch(/data-password-toggle[\s\S]*?hidden\s*>/);
    expect(read('layout/password.liquid')).toContain('class="template-password"');
  });

  test('gift card: noindex, hook BE, không script, trạng thái hết hạn/bị tắt tách câu', () => {
    const src = read('templates/gift_card.liquid');
    expect(src).toContain('<meta name="robots" content="noindex">');
    expect(src).not.toMatch(/<script/);
    for (const hook of ['data-gift-card-copy', 'data-gift-card-print', 'data-gift-card-status', 'data-testid="gift-card-contact"', "'gift_card.disabled' | t", "'gift_card.expired_text' | t"]) {
      expect(src, hook).toContain(hook);
    }
    expect(src).toContain("'gift-card/add-to-apple-wallet.svg' | shopify_asset_url");
    expect(src).not.toContain('gift-card/card.svg');
  });

  test('template không chứa handle figma-*, không dữ liệu demo (AC17)', () => {
    for (const f of ['templates/404.liquid', 'templates/password.liquid', 'templates/gift_card.liquid', 'blocks/not-found.liquid', 'blocks/password-hero.liquid']) {
      expect(read(f), f).not.toMatch(/figma-|efx-|all_products\[/);
    }
  });

  test('locale đủ key, không trùng nhóm', () => {
    const raw = read('locales/en.default.json');
    const t = JSON.parse(raw);
    for (const k of ['eyebrow', 'heading', 'text', 'search_label', 'search_placeholder', 'home', 'categories']) expect(t['404'][k], `404.${k}`).toBeTruthy();
    for (const k of ['title', 'newsletter_label', 'notify', 'newsletter_note', 'newsletter_success', 'have_password', 'enter_using', 'password', 'show_password', 'hide_password', 'enter_store', 'error', 'owner', 'owner_link']) expect(t.password[k], `password.${k}`).toBeTruthy();
    for (const k of ['title', 'balance', 'of_initial', 'code_label', 'copy', 'copied', 'qr_alt', 'qr_fallback', 'qr_title', 'qr_text', 'expires_label', 'start_shopping', 'print', 'disabled', 'expired', 'expired_text', 'contact']) expect(t.gift_card[k], `gift_card.${k}`).toBeTruthy();
    expect(t['404'].heading).toBe('Page Not Found');
    expect(t.password.error).toBe('That password is incorrect. Check the spelling and try again.');
    expect(raw.match(/^ {2}"404":/gm)).toHaveLength(1);
    expect(raw.match(/^ {2}"password":/gm)).toHaveLength(1);
  });

  test('base.css: hết rule cũ ES1-T408, QR 144 qua token', () => {
    const css = read('assets/base.css');
    expect(css).not.toMatch(/\.not-found__actions|\.template-gift-card main/);
    expect(css).toMatch(/\.gift-card__qr \{[\s\S]*?inline-size: calc\(var\(--space-7\) \* 3\)/);
  });
});

test.describe('ES1-T384 store', () => {
  test('404: HTTP 404, không breadcrumb, khối chính đủ, ô tìm không tự focus (AC7)', async ({ page }) => {
    const res = await page.goto('/pages/es1-t384-khong-co');
    await expectNotChallenged(page);
    expect(res?.status()).toBe(404);
    const block = page.getByTestId('not-found');
    await expect(block.locator('.not-found__eyebrow')).toHaveText(/error 404/i);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.getByTestId('not-found-heading')).not.toBeEmpty();
    await expect(page.locator('nav[aria-label*="readcrumb" i], [data-testid="breadcrumb"]')).toHaveCount(0);
    await expect(page.getByTestId('not-found-search')).toHaveAttribute('role', 'search');
    await expect(page.getByTestId('not-found-search-submit')).toHaveAccessibleName('Search');
    await expect(page.getByTestId('not-found-home')).toHaveText('Back To Homepage');
    const focused = await page.evaluate(() => document.activeElement?.id);
    expect(focused).not.toBe('NotFoundSearchInput');
  });

  test('404: 360 × 640 thấy eyebrow, h1, mô tả, ô tìm, nút về trang chủ không cuộn (AC7)', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    await page.goto('/pages/es1-t384-khong-co');
    for (const sel of ['.not-found__eyebrow', '[data-testid="not-found-heading"]', '.not-found__text', '[data-testid="not-found-search-input"]', '[data-testid="not-found-home"]']) {
      const box = await page.locator(sel).boundingBox();
      expect(box, sel).not.toBeNull();
      expect(box!.y + box!.height, sel).toBeLessThanOrEqual(640);
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('404: link danh mục ≤ 6, cao ≥ 44; section sản phẩm chỉ khi có collection (AC8)', async ({ page }) => {
    await page.goto('/pages/es1-t384-khong-co');
    const links = page.getByTestId('not-found-category');
    const n = await links.count();
    expect(n).toBeLessThanOrEqual(6);
    for (let i = 0; i < n; i++) {
      const box = await links.nth(i).boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
    const grid = page.getByTestId('container-not-found-products');
    if (await grid.count()) {
      await expect(grid.getByTestId('featured-collection-view-all')).toHaveAttribute('href', /\/collections\/all$/);
      for (const img of await grid.locator('img').all()) expect(await img.getAttribute('loading')).toBe('lazy');
    }
  });

  test('404: axe 0 lỗi serious/critical (AC16)', async ({ page }) => {
    await page.goto('/pages/es1-t384-khong-co');
    const { violations } = await new AxeBuilder({ page }).include('main').analyze();
    expect(violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? '')).map((v) => v.id)).toEqual([]);
  });

  test('password: nền tối, 1 h1, logo không là link, chân trang, details (AC9, AC10)', async ({ browser }) => {
    const preview = process.env.PREVIEW_URL;
    test.skip(!preview, 'thiếu PREVIEW_URL');
    const context = await browser.newContext();
    const page = await context.newPage();
    const url = new URL(preview!);
    await page.goto(`${url.origin}/password${url.search}`);
    test.skip(!new URL(page.url()).pathname.startsWith('/password'), 'store dev không bật mật khẩu');
    await expect(page.locator('body')).toHaveClass(/template-password/);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.getByTestId('password-logo').locator('a')).toHaveCount(0);
    await expect(page.locator('header, footer')).toHaveCount(0);
    await expect(page.locator('.password-hero__footer a[href="/admin"]')).toBeVisible();
    const details = page.getByTestId('password-details');
    if (await page.getByTestId('password-newsletter').count()) {
      await expect(details).not.toHaveAttribute('open', '');
      await expect(page.getByTestId('password-newsletter-email')).toHaveAttribute('autocomplete', 'email');
      await details.locator('summary').click();
    } else {
      await expect(details).toHaveAttribute('open', '');
    }
    await expect(page.getByTestId('password-input')).toBeVisible();
    await expect(page.getByTestId('password-toggle')).toBeHidden();
    const { violations } = await new AxeBuilder({ page }).analyze();
    expect(violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? '')).map((v) => v.id)).toEqual([]);
    await context.close();
  });

  test('password: sai mật khẩu → details mở, lỗi, aria-invalid (AC11)', async ({ browser }) => {
    const preview = process.env.PREVIEW_URL;
    test.skip(!preview, 'thiếu PREVIEW_URL');
    const context = await browser.newContext();
    const page = await context.newPage();
    const url = new URL(preview!);
    await page.goto(`${url.origin}/password${url.search}`);
    test.skip(!new URL(page.url()).pathname.startsWith('/password'), 'store dev không bật mật khẩu');
    const details = page.getByTestId('password-details');
    if ((await details.getAttribute('open')) === null) await details.locator('summary').click();
    await page.getByTestId('password-input').fill('es1-t384-sai');
    await Promise.all([page.waitForLoadState('load'), page.getByTestId('password-submit').click()]);
    await expect(page.getByTestId('password-details')).toHaveAttribute('open', '');
    await expect(page.getByTestId('password-error')).toHaveText('That password is incorrect. Check the spelling and try again.');
    await expect(page.getByTestId('password-input')).toHaveAttribute('aria-invalid', 'true');
    await context.close();
  });

  const GIFT_CARD = env('TS_GIFT_CARD_URL');

  test('gift card: noindex, logo link, QR ≥ 120, Start Shopping, không header theme (AC13)', async ({ page }) => {
    test.fixme(!GIFT_CARD, 'ES1-T298: store dev chưa có gift card phát hành (TS_GIFT_CARD_URL)');
    await page.goto(GIFT_CARD!);
    await expect(page.locator('meta[name="robots"][content="noindex"]')).toHaveCount(1);
    await expect(page.locator('meta[name="viewport"]')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    const logo = page.getByTestId('gift-card-logo');
    expect((await logo.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    const qr = await page.getByTestId('gift-card-qr').boundingBox();
    expect(qr!.width).toBeGreaterThanOrEqual(120);
    expect(qr!.height).toBeGreaterThanOrEqual(120);
    await expect(page.getByTestId('gift-card-start')).toHaveText('Start Shopping');
    await expect(page.locator('.site-header, .site-footer, .announcement-bar')).toHaveCount(0);
  });
});
