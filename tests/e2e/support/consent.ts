// ES1-T434 (12/11), ES1-T492 (18/11): banner đồng ý cookie của Shopify (Customer Privacy) che vùng đáy: nút gộp localization ở footer
// (TE-1 TC-28/29/45, ES1-T45 R-04/R-05), picker PDP mobile (TE-4 TC-503). Banner do Shopify vẽ (docs/ui-spec/layers.md §5), spec không xoá market.
// Store dev ở chế độ preview: bannerQuery gửi isPreviewMode = true → banner hiện cả với IP US (ES1-T491, CI run 44171510755).
//
// ES1-T492: cách cũ (bấm Decline trong global setup, coi cookie _tracking_consent là bằng chứng) không còn đúng:
// - Shopify không còn ghi _tracking_consent; lựa chọn consent nằm trong _shopify_essential/_shopify_cmp… (tên, nội dung do Shopify quản, không đọc trực tiếp);
// - banner nạp muộn → setup chờ 15 s không thấy, log "absent" ở mọi shard, state.json không mang lựa chọn.
// Cách mới: global setup gọi API công khai Shopify.customerPrivacy.setTrackingConsent (nạp qua Shopify.loadFeatures 'consent-tracking-api')
// với mọi mục = false (tương đương Decline), lưu state.json, rồi mở context mới từ state.json kiểm banner không hiện (verifyConsentState).
// Không dựa vào tên cookie nào. Banner vẫn hiện thì bấm Decline ngay trong context kiểm lại và lưu lại state (1 lần).
// KHÔNG CHẮC: lựa chọn có thể gắn với khách phía server (ES1-T491: Decline ở spec trước làm spec sau cùng shard không thấy banner);
// cách này đúng cả hai trường hợp vì state.json mang cookie định danh khách đã chọn.
//
// Spec cần kiểm hành vi theme khi banner ĐANG hiện (layers.md §5, ES1-T314 "banner thật") mở context khách mới (không state.json),
// mở khoá bằng unlockAndOpenPreview (support/password-unlock.ts), không dùng helper Decline ở đây.
import type { BrowserContext, Page } from '@playwright/test';

export const CONSENT = {
  banner: '#shopify-pc__banner, .shopify-pc__banner__dialog',
  decline: '#shopify-pc__banner__btn-decline',
  // Mọi mục = false: tương đương bấm Decline trên banner (Customer Privacy API, tham số dạng object).
  declined: { analytics: false, marketing: false, preferences: false, sale_of_data: false },
};

export type ConsentApi = {
  // API có nạp được không (content_for_header có Shopify.loadFeatures).
  api: boolean;
  // customerPrivacy.shouldShowBanner(); null khi API không có hàm này.
  shouldShowBanner: boolean | null;
  // customerPrivacy.currentVisitorConsent(); null khi API không có hàm này.
  visitorConsent: Record<string, unknown> | null;
};

// Nạp consent-tracking-api và đọc trạng thái consent của khách hiện tại. Không ghi gì.
export async function readConsent(page: Page, timeout = 10_000): Promise<ConsentApi> {
  return page.evaluate(async (ms) => {
    const w = window as any;
    const ready = await new Promise<boolean>((resolve) => {
      if (w.Shopify?.customerPrivacy) return resolve(true);
      if (typeof w.Shopify?.loadFeatures !== 'function') return resolve(false);
      const t = setTimeout(() => resolve(false), ms);
      w.Shopify.loadFeatures([{ name: 'consent-tracking-api', version: '0.1' }], (err: unknown) => {
        clearTimeout(t);
        resolve(!err && !!w.Shopify.customerPrivacy);
      });
    });
    if (!ready) return { api: false, shouldShowBanner: null, visitorConsent: null };
    const cp = w.Shopify.customerPrivacy;
    const call = (name: string) => {
      try {
        return typeof cp[name] === 'function' ? cp[name]() : null;
      } catch {
        return null;
      }
    };
    const show = call('shouldShowBanner');
    const consent = call('currentVisitorConsent');
    return {
      api: true,
      shouldShowBanner: typeof show === 'boolean' ? show : null,
      visitorConsent: consent && typeof consent === 'object' ? JSON.parse(JSON.stringify(consent)) : null,
    };
  }, timeout);
}

// Ghi lựa chọn "từ chối mọi mục" qua customerPrivacy.setTrackingConsent. Trả lỗi dạng chuỗi, null khi thành công.
export async function setDeclinedConsent(page: Page, timeout = 10_000): Promise<string | null> {
  const ready = await readConsent(page, timeout);
  if (!ready.api) return 'không nạp được Shopify.customerPrivacy (Shopify.loadFeatures vắng hoặc quá giờ)';
  const error = await page.evaluate(
    ({ ms, choice }) =>
      new Promise<string | null>((resolve) => {
        const cp = (window as any).Shopify.customerPrivacy;
        if (typeof cp.setTrackingConsent !== 'function') return resolve('customerPrivacy.setTrackingConsent không có');
        const t = setTimeout(() => resolve('setTrackingConsent quá giờ'), ms);
        try {
          cp.setTrackingConsent(choice, (res: any) => {
            clearTimeout(t);
            resolve(res && res.error ? String(res.error) : null);
          });
        } catch (e) {
          clearTimeout(t);
          resolve(String(e));
        }
      }),
    { ms: timeout, choice: CONSENT.declined },
  );
  return error;
}

// Banner đang hiện thì bấm Decline (fallback: nút có chữ Decline/Reject/Refuser trong banner). Chờ tối đa waitMs.
export async function clickDeclineIfShown(page: Page, waitMs = 15_000): Promise<boolean> {
  const banner = page.locator(CONSENT.banner).first();
  const visible = await banner.waitFor({ state: 'visible', timeout: waitMs }).then(() => true, () => false);
  if (!visible) return false;
  const byId = page.locator(CONSENT.decline);
  const button = (await byId.count()) ? byId.first() : banner.getByRole('button', { name: /decline|reject|refuser/i }).first();
  await button.click();
  await banner.waitFor({ state: 'hidden', timeout: 10_000 });
  return true;
}

export type DeclineResult = 'api' | 'banner' | 'failed';

// Global setup: ưu tiên API (không phụ thuộc banner nạp muộn); API lỗi thì bấm Decline trên banner. Kèm lỗi API để ghi log.
export async function declineConsent(
  page: Page,
  { apiMs = 10_000, bannerMs = 15_000 } = {},
): Promise<{ result: DeclineResult; error: string | null }> {
  const error = await setDeclinedConsent(page, apiMs);
  if (!error) {
    // Banner đã vẽ trên trang hiện tại không tự gỡ khi gọi API; đóng nếu đang hiện (không chờ lâu) để trang sạch trước khi lưu state.
    await clickDeclineIfShown(page, 1_000).catch(() => false);
    return { result: 'api', error: null };
  }
  const clicked = await clickDeclineIfShown(page, bannerMs).catch(() => false);
  return { result: clicked ? 'banner' : 'failed', error };
}

export type VerifyResult = 'banner-absent' | 'banner-declined-again' | 'banner-shown';

// context: context MỚI do global setup tạo từ statePath vừa lưu (tạo context chỉ ở store-noise.ts hoặc tests/setup, ES1-T475 TC-06).
// Vào url, chờ banner tối đa waitMs. Không hiện → 'banner-absent'. Hiện → bấm Decline, ghi đè statePath bằng state của context này
// → 'banner-declined-again'; bấm không được → 'banner-shown'. Đóng context. Trả kèm trạng thái API để log.
export async function verifyConsentState(
  context: BrowserContext,
  statePath: string,
  url: string,
  waitMs = 10_000,
): Promise<{ result: VerifyResult; api: ConsentApi }> {
  try {
    const page = await context.newPage();
    await page.goto(url);
    const banner = page.locator(CONSENT.banner).first();
    const shown = await banner.waitFor({ state: 'visible', timeout: waitMs }).then(() => true, () => false);
    if (!shown) return { result: 'banner-absent', api: await readConsent(page).catch(() => ({ api: false, shouldShowBanner: null, visitorConsent: null })) };
    const clicked = await clickDeclineIfShown(page, 1_000).catch(() => false);
    const api = await readConsent(page).catch(() => ({ api: false, shouldShowBanner: null, visitorConsent: null }));
    if (!clicked) return { result: 'banner-shown', api };
    await context.clearCookies({ name: 'cart' });
    await context.storageState({ path: statePath });
    return { result: 'banner-declined-again', api };
  } finally {
    await context.close();
  }
}

// Lưới an toàn cho spec mở context riêng có JS mà không dùng state.json, hoặc khi global setup log 'banner-shown':
// banner hiện lúc nào thì Decline lúc đó. Chỉ chạy khi Playwright thao tác (click/fill…) bị banner che;
// assertion dạng evaluate/expect.poll không kích hoạt handler — không dựa vào đây cho spec đo vùng đáy.
export async function autoDeclineConsent(page: Page): Promise<void> {
  await page.addLocatorHandler(page.locator(CONSENT.banner).first(), async () => {
    await clickDeclineIfShown(page, 1_000);
  });
}
