// ES1-T201: seed giỏ bằng đúng 1 request /cart/add.js với items[]. Mỗi test có context mới nên giỏ đã rỗng, không cần /cart/clear.js.
// Variant id cache theo worker: chỉ test đầu của worker mở trang sản phẩm, id và trạng thái còn hàng không đổi trong 1 lượt chạy.
import { expect, test, type Page } from '@playwright/test';
import { CART, cartApi } from './cart-api';
import { productData } from './product-data';

const VARIANTS = new Map<string, number>();

async function availableVariantId(page: Page, handle: string): Promise<number> {
  const cached = VARIANTS.get(handle);
  if (cached) return cached;
  await page.goto(`/products/${handle}`);
  const variant = (await productData(page, handle)).variants.find((v) => v.available);
  test.skip(!variant, `${handle} không có variant bán được`);
  VARIANTS.set(handle, variant!.id);
  return variant!.id;
}

// Mỗi phần tử quantities là 1 dòng riêng nhờ property ẩn, không cần sản phẩm thứ 2. Trả variant id.
export async function seedCart(page: Page, handle: string, quantities: number[], property: string): Promise<number> {
  const id = await availableVariantId(page, handle);
  const items = quantities.map((quantity, i) => ({ id, quantity, properties: { [property]: String(i) } }));
  const res = await cartApi(page, CART.add, { data: { items } });
  expect(res.ok(), `${CART.add} trả ${res.status()}`).toBeTruthy();
  return id;
}

// Line key đọc từ DOM thay vì thêm 1 request /cart.js. Theo thứ tự hiển thị.
export async function lineKeys(page: Page): Promise<string[]> {
  const lines = page.getByTestId('cart-line');
  await lines.first().waitFor({ state: 'attached' });
  return lines.evaluateAll((els) => els.map((el) => el.getAttribute('data-line-key')!));
}
