// KHÔNG CHẮC: spec chưa chạy trên store dev (phiên agent không có PREVIEW_URL/STORE_PASSWORD) → chờ CI. Tên/hành vi API
// Shopify.customerPrivacy (loadFeatures 'consent-tracking-api' 0.1, setTrackingConsent dạng object, shouldShowBanner, currentVisitorConsent)
// theo tài liệu Customer Privacy API công khai, chưa đo trên store dev; nhóm "store dev" xác nhận.
// Ticket ES1-T492 (task regression, cha TE-10): global setup consent lỗi thời — CONSENT.cookie '_tracking_consent' không còn,
// declineConsentBanner luôn 'absent'. Nguồn: ES1-T491, ES1-T434, docs/ui-spec/layers.md §5, docs/srs.md#TE-10 AC7.
// Test case: drafts/qa/ES1-T492/test-cases.md. Không gộp vào ES1-T314/ES1-T434: kiểm hạ tầng test (setup + support), không kiểm theme.
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T492.spec.ts
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect, type Page } from './support/test';
import { CONSENT, clickDeclineIfShown, declineConsent, readConsent } from './support/consent';
import { expectNotChallenged } from './support/store-guard';

const read = (f: string) => readFileSync(f, 'utf8');
const E2E = 'tests/e2e';
const specs = () => readdirSync(E2E).filter((f) => f.endsWith('.spec.ts'));
// Bỏ chú thích để kiểm code, không kiểm lịch sử ghi trong comment.
const code = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');

// Trang giả cho helper: window.Shopify do test dựng, không gọi mạng.
type Fake = { api: 'ok' | 'error' | 'none' | 'hang'; banner: boolean };
async function fakePage(page: Page, fake: Fake) {
  await page.setContent(`<!doctype html><html lang="en"><body><main>t</main>
    ${fake.banner ? '<div id="shopify-pc__banner" style="position:fixed;bottom:0;inset-inline:0;height:120px;background:#eee"><button id="shopify-pc__banner__btn-decline" onclick="this.parentElement.remove()">Decline</button></div>' : ''}
    <script>
      window.__calls = [];
      window.Shopify = {};
      if (${JSON.stringify(fake.api)} !== 'none') {
        window.Shopify.loadFeatures = (features, cb) => {
          window.__calls.push(['loadFeatures', features]);
          if (${JSON.stringify(fake.api)} === 'hang') return;
          window.Shopify.customerPrivacy = {
            _consent: null,
            shouldShowBanner() { return this._consent === null; },
            currentVisitorConsent() { return this._consent || { analytics: '', marketing: '', preferences: '', sale_of_data: '' }; },
            setTrackingConsent(choice, done) {
              window.__calls.push(['setTrackingConsent', choice]);
              if (${JSON.stringify(fake.api)} === 'error') return done({ error: 'fake 500' });
              this._consent = { analytics: 'no', marketing: 'no', preferences: 'no', sale_of_data: 'no' };
              done({});
            },
          };
          cb();
        };
      }
    </script></body></html>`);
}
const calls = (page: Page) => page.evaluate(() => (window as any).__calls as [string, unknown][]);

test.describe('ES1-T492 tĩnh: setup và support không dựa cookie _tracking_consent', () => {
  test.beforeEach(({}, ti) => { test.skip(ti.project.name !== 'desktop', 'tĩnh, chạy 1 lần'); });

  test('TC-01 AC1 consent.ts: CONSENT không còn khoá cookie, code không nhắc _tracking_consent, có setTrackingConsent', () => {
    expect(CONSENT).not.toHaveProperty('cookie');
    const src = code(read(`${E2E}/support/consent.ts`));
    expect(src).not.toContain('_tracking_consent');
    expect(src).toContain('setTrackingConsent');
    expect(src).toContain("'consent-tracking-api'");
  });

  test('TC-02 AC2 global setup: declineConsent → storageState → verifyConsentState; không còn declineConsentBanner; vẫn giữ thứ tự ES1-T201', () => {
    const setup = code(read('tests/setup/password.ts'));
    expect(setup).not.toContain('declineConsentBanner');
    expect(setup).not.toContain('_tracking_consent');
    const decline = setup.indexOf('declineConsent(');
    const save = setup.indexOf('storageState({ path');
    const verify = setup.indexOf('verifyConsentState(');
    expect(decline).toBeGreaterThan(0);
    expect(decline).toBeLessThan(save);
    expect(save).toBeLessThan(verify);
    // ES1-T201 TC-02 vẫn đúng
    expect(setup.indexOf("clearCookies({ name: 'cart' })")).toBeGreaterThan(0);
    expect(setup.indexOf("clearCookies({ name: 'cart' })")).toBeLessThan(save);
    // Log mới thay "[state] banner consent"
    expect(setup).toContain('[state] consent:');
    expect(setup).toContain('[state] consent kiểm lại:');
  });

  test('TC-03 AC3 không spec nào xoá cookie consent theo tên (clearCookies vô tác dụng ES1-T314 đã gỡ)', () => {
    const offenders = specs().filter((f) => /clearCookies\(\s*\{\s*name:\s*(CONSENT\.|'_tracking_consent'|'_shopify_(essential|cmp))/.test(read(join(E2E, f))));
    expect(offenders).toEqual([]);
  });

  test('TC-04 AC3 ES1-T314 "banner thật" dùng khách mới (không state.json), mở khoá bằng unlockAndOpenPreview', () => {
    const src = read(`${E2E}/ES1-T314.spec.ts`);
    const body = src.slice(src.indexOf("test('banner thật"));
    expect(body.length).toBeGreaterThan(20);
    const head = body.slice(0, body.indexOf('openPage('));
    expect(head).not.toContain('tests/setup/state.json');
    expect(head).toContain('storageState: undefined');
    expect(head).toContain('unlockAndOpenPreview(');
  });

  test('TC-05 AC4 chú thích consent.ts, setup, ES1-T314 ghi cách mới (ES1-T492), không còn câu "cookie _tracking_consent vào state.json"', () => {
    for (const f of [`${E2E}/support/consent.ts`, 'tests/setup/password.ts', `${E2E}/ES1-T314.spec.ts`]) {
      const src = read(f);
      expect(src, f).toContain('ES1-T492');
      expect(src, f).not.toMatch(/cookie _tracking_consent vào state\.json/);
    }
  });
});

test.describe('ES1-T492 helper consent trên trang giả (không mạng)', () => {
  test.beforeEach(({}, ti) => { test.skip(ti.project.name !== 'desktop', 'helper, chạy 1 lần'); });

  test('TC-06 AC1 API có: declineConsent → "api", setTrackingConsent nhận mọi mục false, shouldShowBanner thành false', async ({ page }) => {
    await fakePage(page, { api: 'ok', banner: false });
    expect(await readConsent(page)).toMatchObject({ api: true, shouldShowBanner: true });
    expect(await declineConsent(page, { apiMs: 2_000, bannerMs: 500 })).toEqual({ result: 'api', error: null });
    const log = await calls(page);
    expect(log[0]).toEqual(['loadFeatures', [{ name: 'consent-tracking-api', version: '0.1' }]]);
    expect(log).toContainEqual(['setTrackingConsent', { analytics: false, marketing: false, preferences: false, sale_of_data: false }]);
    expect(await readConsent(page)).toMatchObject({ api: true, shouldShowBanner: false, visitorConsent: { analytics: 'no' } });
  });

  test('TC-07 AC1 API có + banner đã vẽ: ghi qua API và đóng banner đang hiện', async ({ page }) => {
    await fakePage(page, { api: 'ok', banner: true });
    expect((await declineConsent(page, { apiMs: 2_000, bannerMs: 500 })).result).toBe('api');
    await expect(page.locator(CONSENT.banner)).toHaveCount(0);
  });

  test('TC-08 AC1 API trả lỗi: fallback bấm Decline trên banner → "banner", kèm lỗi API để log', async ({ page }) => {
    await fakePage(page, { api: 'error', banner: true });
    const r = await declineConsent(page, { apiMs: 2_000, bannerMs: 2_000 });
    expect(r.result).toBe('banner');
    expect(r.error).toContain('fake 500');
    await expect(page.locator(CONSENT.banner)).toHaveCount(0);
  });

  test('TC-09 AC1 biên: không có Shopify.loadFeatures, không banner → "failed", không treo', async ({ page }) => {
    await fakePage(page, { api: 'none', banner: false });
    const started = Date.now();
    const r = await declineConsent(page, { apiMs: 1_000, bannerMs: 500 });
    expect(r.result).toBe('failed');
    expect(r.error).toMatch(/customerPrivacy/);
    expect(Date.now() - started).toBeLessThan(5_000);
  });

  test('TC-10 AC1 biên: loadFeatures không gọi lại (mạng treo) → quá giờ, api=false', async ({ page }) => {
    await fakePage(page, { api: 'hang', banner: false });
    expect(await readConsent(page, 500)).toEqual({ api: false, shouldShowBanner: null, visitorConsent: null });
    expect((await declineConsent(page, { apiMs: 500, bannerMs: 300 })).result).toBe('failed');
  });

  test('TC-11 AC1 clickDeclineIfShown: banner không có → false sau waitMs; có → bấm, banner gỡ', async ({ page }) => {
    await fakePage(page, { api: 'none', banner: false });
    expect(await clickDeclineIfShown(page, 300)).toBe(false);
    await fakePage(page, { api: 'none', banner: true });
    expect(await clickDeclineIfShown(page, 1_000)).toBe(true);
    await expect(page.locator(CONSENT.banner)).toHaveCount(0);
  });
});

test.describe('ES1-T492 store dev: context từ state.json không thấy banner consent (TE-10 AC7 tiền đề, layers.md §5)', () => {
  test.skip(!process.env.PREVIEW_URL, 'cần PREVIEW_URL (global setup đã chạy)');

  // Không autoDeclineConsent, không chặn privacy-banner: đây chính là điều kiện spec vùng đáy cần, độc lập thứ tự shard.
  for (const path of ['/', '/collections/all']) {
    test(`TC-12 AC2 ${path}: banner thật không hiện trong 10 s, html không có data-consent, API báo đã chọn`, async ({ page }) => {
      await page.goto(path);
      await expectNotChallenged(page);
      const shown = await page.locator(CONSENT.banner).first().waitFor({ state: 'visible', timeout: 10_000 }).then(() => true, () => false);
      expect(shown, 'banner consent vẫn hiện với state.json: xem log "[state] consent kiểm lại" của global setup').toBe(false);
      await expect.poll(() => page.evaluate(() => document.documentElement.hasAttribute('data-consent'))).toBe(false);
      const api = await readConsent(page);
      test.info().annotations.push({ type: 'consent-api', description: JSON.stringify(api) });
      if (api.api && api.shouldShowBanner !== null) expect(api.shouldShowBanner).toBe(false);
    });
  }

  test('TC-13 AC2 mobile 360: banner không che footer (vùng đáy) — phần tử ở điểm đáy giữa viewport không thuộc banner', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto('/');
    await expectNotChallenged(page);
    // Chờ đủ lâu cho banner nạp muộn rồi mới đo bằng evaluate (addLocatorHandler không chạy với evaluate — lý do ticket)
    await page.locator(CONSENT.banner).first().waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
    const hit = await page.evaluate((sel) => {
      const el = document.elementFromPoint(innerWidth / 2, innerHeight - 4);
      return !!el?.closest(sel);
    }, CONSENT.banner);
    expect(hit).toBe(false);
  });
});
