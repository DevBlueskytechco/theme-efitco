// KHÔNG CHẮC: spec chưa chạy lần nào: phiên agent không mở được trình duyệt, không gọi mạng. Chờ CI PR.
// Ticket ES1-T227. Spec thăm dò, tìm vì sao getCart trả 0 ở ES1-T203 TC-25. Xoá sau khi kết luận.
// Cố ý KHÔNG assert giá trị getCart: assert đó vẫn ở ES1-T203 TC-25 và vẫn đỏ nếu getCart sai. Ở đây chỉ assert điều kiện chạy: /cart.js thật có 2.
// Đọc kết quả: dòng [ES1-T227] trong log CI, hoặc attachment của test. Không in token giỏ. Cách kết luận: drafts/dev-be/ES1-T227/pr-description.md.
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T227.spec.ts
import { test, expect, type Page, type Response } from '@playwright/test';
import { readCartAction, summarizeRead, countPaths, tokenId } from './support/action-probe';
import { CART } from './support/cart-api';
import { env } from './support/store-data';
import { expectStoreAllowed, gotoStore, watchStore } from './support/store-guard';

const HANDLE = env('TE4_VARIANTS_HANDLE', 'TE4_SINGLE_HANDLE');
const PAGE_MODE = process.env.EXPECT_CART_TYPE === 'page';

type Row = Record<string, unknown>;

async function ajaxCart(page: Page) {
  const { status, text } = await page.evaluate(async () => {
    const res = await fetch('/cart.js', { cache: 'no-store', headers: { Accept: 'application/json' } });
    return { status: res.status, text: await res.text() };
  });
  expect([status, text.slice(0, 80)], '/cart.js phải trả 200 JSON').toEqual([200, expect.stringMatching(/^\{/)]);
  return JSON.parse(text) as { item_count: number; token: string };
}

// Chỉ phân tích body của GraphQL. Request khác chỉ ghi host, path, status.
async function describeCall(res: Response, token: string | null) {
  const req = res.request();
  const url = new URL(res.url());
  const call: Row = { url: `${url.host}${url.pathname}`, method: req.method(), status: res.status() };
  if (!/graphql/i.test(url.pathname)) return call;
  const sent = `${req.postData() ?? ''} ${url.searchParams.get('variables') ?? ''}`;
  const body = (await res.json().catch(() => null)) as { data?: { cart?: unknown }; errors?: { message?: string }[] } | null;
  call.operation = /(?:query|mutation)\s+(\w+)/.exec(sent)?.[1] ?? null;
  call.sentCartGid = /gid:(\\?\/){2}shopify(\\?\/)Cart/.test(sent);
  call.sentAjaxToken = token ? sent.includes(token) : null;
  call.answeredAjaxToken = token ? JSON.stringify(body?.data ?? null).includes(token) : null;
  call.dataCartIsNull = body?.data ? body.data.cart === null : null;
  call.errors = (body?.errors ?? []).map((e) => String(e.message).slice(0, 200));
  call.counts = countPaths(body?.data);
  return call;
}

function createProbe(page: Page, scenario: string) {
  const rows: Row[] = [];
  return {
    rows,
    // 1 hàng cho 1 lần đọc: getCart thật, /cart.js cùng lúc, cookie, và fetch phát sinh trong lúc gọi.
    async read(stage: string, action = 'getCart', payload?: unknown) {
      const before = await ajaxCart(page);
      const token = tokenId(before.token);
      const calls: Promise<Row>[] = [];
      const listener = (res: Response) => {
        if (['fetch', 'xhr'].includes(res.request().resourceType())) calls.push(describeCall(res, token));
      };
      page.on('response', listener);
      const read = await page.evaluate(readCartAction, [action, payload] as [string, unknown?]);
      // Sự kiện response có thể tới sau khi promise trong trang đã xong.
      await page.waitForTimeout(500);
      page.off('response', listener);
      const after = await ajaxCart(page);
      const cookie = (await page.context().cookies()).find((c) => c.name === 'cart');
      const row: Row = {
        scenario,
        stage,
        action,
        result: summarizeRead(read),
        ajaxCountBefore: before.item_count,
        ajaxCountAfter: after.item_count,
        cartCookie: !!cookie,
        cookieMatchesAjax: cookie ? tokenId(cookie.value) === tokenId(after.token) : null,
        previewInUrl: new URL(page.url()).searchParams.has('preview_theme_id'),
        calls: await Promise.all(calls),
      };
      rows.push(row);
      console.log(`[ES1-T227] ${JSON.stringify(row)}`);
      return row;
    },
  };
}

async function openHome(page: Page) {
  await gotoStore(page, '/');
  await expect(page.getByTestId('cart-drawer'), 'Shopify.actions chưa được configure').toHaveAttribute('data-actions', '', { timeout: 15_000 });
}

async function readVariant(page: Page) {
  await gotoStore(page, `/products/${HANDLE}`);
  return Number(await page.getByTestId('product-form-variant-id').inputValue());
}

test.describe('ES1-T227 thăm dò getCart thật', () => {
  test.describe.configure({ retries: 0 });
  test.beforeEach(({}, info) => {
    test.skip(PAGE_MODE, 'Cùng điều kiện với luồng thật ES1-T203');
    expect(HANDLE, 'Thiếu TE4_VARIANTS_HANDLE / TE4_SINGLE_HANDLE').toBeTruthy();
    // 3 lần mở trang và các lần chờ, 30 s mặc định không đủ.
    info.setTimeout(120_000);
  });

  // Đối chứng với TC-25: phiên mới, không có giỏ cũ, không gọi getCart trước updateCart. Tách được giả thuyết getCart nhớ kết quả lần đầu.
  test('A phiên sạch: updateCart rồi mới getCart lần đầu', async ({ page }, info) => {
    const watch = watchStore(page);
    const variantId = await readVariant(page);
    await openHome(page);
    const probe = createProbe(page, 'A');
    await probe.read('updateCart', 'updateCart', { lines: [{ merchandiseId: variantId, quantity: 2, attributes: [{ key: '_t227', value: 'a' }] }] });
    expect((await ajaxCart(page)).item_count, 'updateCart phải ghi được giỏ để phép đo có nghĩa').toBe(2);
    await probe.read('ngay sau updateCart');
    await page.waitForTimeout(5_000);
    await probe.read('sau 5 s');
    await openHome(page);
    await probe.read('sau khi mở lại trang');
    await info.attach('getcart-probe-a.json', { body: JSON.stringify(probe.rows, null, 2), contentType: 'application/json' });
    await watch.finish();
  });

  // Dựng đúng trạng thái TC-25: giỏ Ajax đã thêm rồi xoá về rỗng, getCart 1 lần trước updateCart.
  test('B giống TC-25: giỏ cũ về rỗng, getCart trước và sau updateCart', async ({ page }, info) => {
    const watch = watchStore(page);
    const variantId = await readVariant(page);
    await page.waitForFunction(() => ['product-form', 'cart-drawer'].every((n) => !!customElements.get(n)));
    await expect(page.getByTestId('product-form-add'), 'Variant mặc định phải còn hàng').toBeEnabled();
    const added = page.waitForResponse((r) => r.url().includes(CART.add) && r.request().method() === 'POST');
    await page.getByTestId('product-form-add').click();
    expectStoreAllowed(await added);
    await expect(page.getByTestId('cart-drawer-dialog')).toBeVisible();
    await expect(page.getByTestId('cart-items')).toHaveAttribute('data-enhanced', '', { timeout: 15_000 });
    const removed = page.waitForResponse((r) => r.url().includes(CART.change) && r.request().method() === 'POST');
    await page.getByTestId('cart-line-remove').click();
    expectStoreAllowed(await removed);
    await expect(page.getByTestId('cart-empty')).toBeVisible();
    expect((await ajaxCart(page)).item_count).toBe(0);

    await openHome(page);
    const probe = createProbe(page, 'B');
    await probe.read('trước updateCart');
    await probe.read('updateCart', 'updateCart', { lines: [{ merchandiseId: variantId, quantity: 2, attributes: [{ key: '_t227', value: 'b' }] }] });
    expect((await ajaxCart(page)).item_count, 'updateCart phải ghi được giỏ để phép đo có nghĩa').toBe(2);
    await probe.read('ngay sau updateCart');
    await page.waitForTimeout(5_000);
    await probe.read('sau 5 s');
    await openHome(page);
    await probe.read('sau khi mở lại trang');
    await info.attach('getcart-probe-b.json', { body: JSON.stringify(probe.rows, null, 2), contentType: 'application/json' });
    await watch.finish();
  });
});
