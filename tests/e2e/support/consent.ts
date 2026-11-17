// ES1-T434 (12/11): banner đồng ý cookie của Shopify (Customer Privacy) hiện trên store dev từ khi market International có nước EU (ES1-T298).
// Banner đáy che nút gộp localization ở footer (TE-1 TC-28/29/45, ES1-T45 R-04/R-05) và picker PDP mobile (TE-4 TC-503).
// Banner là hành vi thật, do Shopify vẽ (docs/ui-spec/layers.md §5): spec không xoá market, chọn Decline một lần trong global setup
// (tests/setup/password.ts) → cookie _tracking_consent vào state.json, mọi context dùng state.json không thấy banner.
// Spec cần kiểm hành vi theme khi banner ĐANG hiện (layers.md §5) mở context không storageState, không dùng helper này.
import type { Page } from '@playwright/test';

export const CONSENT = {
  banner: '#shopify-pc__banner, .shopify-pc__banner__dialog',
  decline: '#shopify-pc__banner__btn-decline',
  cookie: '_tracking_consent',
};

// Chờ banner tối đa waitMs; có thì bấm Decline (fallback: nút có chữ Decline/Reject/Refuser trong banner).
// Trả 'declined' | 'absent' | 'already' để global setup ghi log.
export async function declineConsentBanner(page: Page, waitMs = 15_000): Promise<'declined' | 'absent' | 'already'> {
  const banner = page.locator(CONSENT.banner).first();
  const visible = await banner.waitFor({ state: 'visible', timeout: waitMs }).then(() => true, () => false);
  if (!visible) {
    const has = (await page.context().cookies()).some((c) => c.name === CONSENT.cookie);
    return has ? 'already' : 'absent';
  }
  const byId = page.locator(CONSENT.decline);
  const button = (await byId.count()) ? byId.first() : banner.getByRole('button', { name: /decline|reject|refuser/i }).first();
  await button.click();
  await banner.waitFor({ state: 'hidden', timeout: 10_000 });
  return 'declined';
}

// Lưới an toàn cho spec mở context riêng có JS mà không dùng state.json: banner hiện lúc nào thì Decline lúc đó.
export async function autoDeclineConsent(page: Page): Promise<void> {
  await page.addLocatorHandler(page.locator(CONSENT.banner).first(), async () => {
    await declineConsentBanner(page, 1_000);
  });
}
