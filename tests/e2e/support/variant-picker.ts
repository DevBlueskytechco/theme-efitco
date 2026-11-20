// ES1-T350 (ADR 0008 mục 1): radio của bộ chọn mang value = id option value, không còn tên. Test chọn và đọc giá trị theo tên
// hiện trong nhãn (.product-option__text, sau tên có thể có hậu tố ẩn ", sold out" / ", unavailable"). Dữ liệu biến thể lấy từ
// /products/<handle>.js trong trang (ES1-T74), không còn JSON danh sách biến thể trên trang (NFR-7).
import { expect, type Locator } from '@playwright/test';

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Nhãn (product-option-value) của giá trị `name` trong fieldset. */
export function optionValue(fieldset: Locator, name: string): Locator {
  return fieldset.getByTestId('product-option-value').filter({
    has: fieldset.page().locator('.product-option__text', { hasText: new RegExp(`^\\s*${escape(name)}\\s*(,|$)`) }),
  });
}

/** Chọn lần lượt tên giá trị theo thứ tự option; mở "+N" nếu giá trị đang bị thu gọn. Giá trị đã chọn thì bỏ qua.
 *  Trả số lần bấm giá trị thật (mỗi lần bấm = 1 change = 1 request ?option_values=). */
export async function chooseOptions(scope: Locator, names: string[]): Promise<number> {
  const fieldsets = scope.getByTestId('product-option');
  let clicks = 0;
  for (const [i, name] of names.entries()) {
    const fs = fieldsets.nth(i);
    const label = optionValue(fs, name);
    await expect(label, `option ${i + 1} có giá trị "${name}"`).toHaveCount(1);
    if (await label.locator('input[type="radio"]').isChecked()) continue;
    if (!(await label.isVisible())) await fs.getByTestId('product-option-more').click();
    await label.click();
    clicks += 1;
  }
  return clicks;
}

/** Chữ giá trị đang chọn trong legend ([data-option-selected]) của từng option. */
export function legendNames(scope: Locator): Promise<string[]> {
  return scope.getByTestId('product-option').evaluateAll((sets) => sets.map((fs) => fs.querySelector('[data-option-selected]')?.textContent?.trim() ?? ''));
}

/** Tên các giá trị đang chọn, theo thứ tự option. */
export function checkedNames(scope: Locator): Promise<string[]> {
  return scope
    .getByTestId('product-option')
    .evaluateAll((sets) => sets.map((fs) => fs.querySelector('input[type="radio"]:checked')?.parentElement?.querySelector('.product-option__text')?.firstChild?.textContent?.trim() ?? ''));
}

/** Đặt checked theo tên mà không bấm (khôi phục form / lựa chọn trước khi module nạp). */
export function setCheckedByName(picker: Locator, names: string[]) {
  return picker.evaluate((el, names) => {
    el.querySelectorAll('fieldset').forEach((fs, i) => {
      for (const input of fs.querySelectorAll<HTMLInputElement>('input[type="radio"]')) {
        input.checked = input.parentElement?.querySelector('.product-option__text')?.firstChild?.textContent?.trim() === names[i];
      }
    });
  }, names);
}
