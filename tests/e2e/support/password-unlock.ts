// ES1-T442 (nguồn ES1-T384, docs/srs.md#TE-21 AC10, AC11): trang password có 2 dạng.
// - Cũ (templates/password.liquid trước PR #208, hoặc setting "Show newsletter" tắt): ô mật khẩu hiện sẵn.
// - Mới (PR #208, "Show newsletter" bật — mặc định): ô nằm trong <details data-testid="password-details"> "Enter Using Password" đóng sẵn.
// Ô trong <details> đóng không nhận focus/fill (kể cả fill({ force: true })) → phải mở details trước.
// Không phụ thuộc #208 merge: nhận cả details có data-testid lẫn details bất kỳ bọc ô mật khẩu.
import type { Page } from '@playwright/test';

export const PASSWORD_PAGE = {
  form: 'form[action*="password"]',
  input: 'form[action*="password"] input[type="password"]',
  details: '[data-testid="password-details"]',
};

export type RevealResult = 'visible' | 'opened' | 'absent';

// Trả 'absent' khi trang không có ô mật khẩu (store đã mở khoá / không bật password),
// 'visible' khi ô hiện sẵn (dạng cũ hoặc details đã open), 'opened' khi phải mở details.
export async function revealPasswordInput(page: Page, timeout = 10_000): Promise<RevealResult> {
  const input = page.locator(PASSWORD_PAGE.input).first();
  if (!(await input.count())) return 'absent';
  if (await input.isVisible()) return 'visible';

  // Details đóng bọc ô: ưu tiên data-testid (#208), fallback details bất kỳ chứa ô.
  const byTestId = page.locator(`details${PASSWORD_PAGE.details}:not([open])`).filter({ has: page.locator(PASSWORD_PAGE.input) });
  const anyDetails = page.locator('details:not([open])').filter({ has: page.locator(PASSWORD_PAGE.input) });
  const details = (await byTestId.count()) ? byTestId.first() : anyDetails.first();

  if (await details.count()) {
    const summary = details.locator(':scope > summary').first();
    if ((await summary.count()) && (await summary.isVisible())) {
      await summary.click();
    } else {
      await details.evaluate((d: HTMLDetailsElement) => { d.open = true; });
    }
  }
  // Details lồng nhau hoặc summary bị chặn click: mở mọi details tổ tiên của ô.
  if (!(await input.isVisible())) {
    await input.evaluate((el) => {
      for (let n: Element | null = el.closest('details'); n; n = n.parentElement?.closest('details') ?? null) {
        (n as HTMLDetailsElement).open = true;
      }
    });
  }
  await input.waitFor({ state: 'visible', timeout });
  return 'opened';
}

// Mở (nếu cần) rồi điền. Không submit: global setup tự submit và chờ rời /password.
export async function fillStorePassword(page: Page, password: string): Promise<RevealResult> {
  const state = await revealPasswordInput(page);
  if (state !== 'absent') await page.locator(PASSWORD_PAGE.input).first().fill(password);
  return state;
}
