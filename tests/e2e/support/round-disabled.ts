// ES1-T543 (TE-7 AC6, kit .round-button[aria-disabled], foundation §6; assert theo ES1-T561): nút tròn tắt không làm mờ.
// Nền sáng: opacity 1, viền --color-border, nền --color-background, icon --color-muted-light, cursor not-allowed.
// Dải tối (.block-container--dark): nền trong suốt, viền + icon --color-muted-on-dark.
// Màu so với token đang dùng trên trang (store hoặc fixture), không chép cứng mã màu. Poll vì .round-button có transition màu.
import { expect, type Locator } from '@playwright/test';

export async function expectRoundDisabled(button: Locator) {
  const expected = await button.evaluate((el) => {
    const token = (name: string) => {
      const probe = document.createElement('span');
      probe.style.color = `var(${name})`;
      document.body.append(probe);
      const value = getComputedStyle(probe).color;
      probe.remove();
      return value;
    };
    const dark = el.closest('.block-container--dark') !== null;
    return {
      opacity: '1',
      cursor: 'not-allowed',
      border: token(dark ? '--color-muted-on-dark' : '--color-border'),
      background: dark ? 'rgba(0, 0, 0, 0)' : token('--color-background'),
      icon: token(dark ? '--color-muted-on-dark' : '--color-muted-light'),
    };
  });
  await expect
    .poll(() =>
      button.evaluate((el) => {
        const cs = getComputedStyle(el);
        return { opacity: cs.opacity, cursor: cs.cursor, border: cs.borderTopColor, background: cs.backgroundColor, icon: cs.color };
      }),
    )
    .toEqual(expected);
}
