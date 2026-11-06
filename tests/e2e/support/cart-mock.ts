// ES1-T203: mock Cart API cho T96, T97, T98. Giỏ trong bộ nhớ theo 1 test, page.route trên /cart.js và /cart/*.js: 0 request Cart API tới store.
// Trang và cart-drawer.js, cart-items.js, product-form.js là thật, mỗi test tải trang 1 lần. Trang thật render giỏ rỗng vì store không biết giỏ mock.
//
// Partial: chọn cách ít request nhất là 0 request partial tới store. Sau khi tải trang, thay partials.fetch, partials.apply ngay trên object của thư viện thật
// (cùng 1 instance với theme vì cùng URL, ES1-T81) và dựng lại dòng hàng từ giỏ mock. Không cache HTML của store: muốn có HTML dòng hàng phải có giỏ thật, tức thêm request Cart API.
// partials.fetch vẫn gửi 1 fetch cùng pathname, kèm ?__mock_partials, để test đếm, giữ, abort được qua page.route.
// Giới hạn: (1) dòng hàng dựng tay theo snippets/cart-lines.liquid, cart-summary.liquid, ES1-T203 TC-14 kiểm hook khớp liquid, nhưng không kiểm Liquid render đúng;
// (2) apply là bản giả theo mô tả trong AGENTS.md (giữ focus, giá trị ô nhập), không phải thư viện thật; (3) không dựng free shipping, discount, thuế;
// (4) updateCart, getCart ghi qua Storefront API (ES1-T164), không qua /cart/*.js nên không mock được ở đây.
// Phần (1) (2) (4) do luồng thật trong tests/e2e/ES1-T203.spec.ts kiểm.
import { test as base, expect, type Page, type Route } from '@playwright/test';
import { createHash } from 'node:crypto';
import { gotoStore, watchStore } from './store-guard';

export { expect };

export const MOCK_VARIANT = 40001;
export const MOCK_HEADER = 'x-e2e-cart-mock';
export const PARTIAL_PARAM = '__mock_partials';
const UNIT_PRICE = 1000;
const LIBRARY = '@shopify/partial-rendering';

export const CART_API_PATH = /\/cart(\.js|\/(add|change|update|clear)\.js)$/;

export type CartOp = 'add' | 'change' | 'read' | 'partial';
export type Behaviour = { status?: number; json?: unknown; html?: string; abort?: boolean; delayMs?: number; hold?: Promise<void>; times?: number };
type Properties = Record<string, string>;
type Line = { key: string; id: number; quantity: number; properties: Properties };
type Result = { status: number; json: unknown };

function itemJson(line: Line) {
  const total = line.quantity * UNIT_PRICE;
  return {
    id: line.id,
    properties: line.properties,
    quantity: line.quantity,
    variant_id: line.id,
    key: line.key,
    title: 'Mock product',
    price: UNIT_PRICE,
    original_price: UNIT_PRICE,
    presentment_price: UNIT_PRICE / 100,
    discounted_price: UNIT_PRICE,
    final_price: UNIT_PRICE,
    line_price: total,
    original_line_price: total,
    final_line_price: total,
    total_discount: 0,
    discounts: [],
    line_level_discount_allocations: [],
    line_level_total_discount: 0,
    sku: 'MOCK',
    grams: 0,
    vendor: 'Mock',
    taxable: true,
    product_id: 50001,
    product_has_only_default_variant: true,
    gift_card: false,
    url: `/products/mock?variant=${line.id}`,
    featured_image: { aspect_ratio: 1, alt: '', height: 1, url: '', width: 1 },
    image: null,
    handle: 'mock',
    requires_shipping: true,
    product_type: '',
    product_title: 'Mock product',
    product_description: '',
    variant_title: null,
    variant_options: ['Default Title'],
    options_with_values: [{ name: 'Title', value: 'Default Title' }],
  };
}

export type AjaxCart = {
  item_count: number;
  total_price: number;
  items_subtotal_price: number;
  items: ReturnType<typeof itemJson>[];
  [field: string]: unknown;
};

// Chạy trong trình duyệt. Hook và class chép từ snippets/cart-lines.liquid, snippets/cart-summary.liquid, blocks/header.liquid (TC-14).
export function installPartials(library: { partials?: Record<string, unknown> }, initial: AjaxCart, param: string) {
  const partials = library.partials;
  if (!partials) throw new Error('Thư viện partial không export partials');
  const esc = (value: unknown) => String(value).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  const money = (cents: number) => (cents / 100).toFixed(2);
  const body = document.querySelector('[data-testid="cart-page-body"], [data-testid="cart-drawer-body"]') as HTMLElement | null;
  const form = body?.querySelector('form') ?? null;
  const main = form?.firstElementChild ?? null;
  const context = form ? form.id.replace('cart-form-', '') : '';
  const emptyHtml = main?.querySelector('[data-testid="cart-empty"]')?.outerHTML;
  if (body && !emptyHtml) throw new Error('Trang thật không ở trạng thái giỏ rỗng: cookie cart lọt vào context test?');

  const lineHtml = (item: AjaxCart['items'][number], index: number) => {
    const title = esc(item.product_title);
    const id = `cart-quantity-${context}-${index + 1}-${item.key.replace(/\W/g, '')}`;
    return `<li class="cart-line" data-line-key="${esc(item.key)}" data-testid="cart-line">
      <div class="cart-line__image cart-line__image--empty" data-testid="cart-line-image"></div>
      <div class="cart-line__details">
        <a class="cart-line__title" href="${esc(item.url)}" data-testid="cart-line-title">${title}</a>
        <div class="price"><span class="visually-hidden">Regular price</span><span class="price__current" data-testid="cart-line-price">${money(item.final_price)}</span></div>
      </div>
      <div class="cart-line__controls">
        <label class="visually-hidden" for="${id}">Quantity for ${title}</label>
        <input id="${id}" class="cart-line__quantity" type="number" name="updates[]" value="${item.quantity}" min="0" inputmode="numeric" form="${form!.id}" data-testid="cart-line-quantity">
        <a class="cart-line__remove" href="/cart/change?id=${encodeURIComponent(item.key)}&amp;quantity=0" aria-label="Remove ${title}" data-cart-remove data-testid="cart-line-remove">Remove</a>
      </div>
      <p class="cart-line__total"><span class="visually-hidden">Line total</span><span data-testid="cart-line-total">${money(item.final_line_price)}</span></p>
    </li>`;
  };

  const summaryHtml = (cart: AjaxCart) => `<div class="cart-summary">
    <p class="cart-summary__row"><span>Subtotal</span><span data-testid="cart-subtotal">${money(cart.items_subtotal_price)}</span></p>
    <p class="cart-summary__row cart-summary__row--total"><span>Total</span><span data-testid="cart-total">${money(cart.total_price)}</span></p>
    <button class="button cart-summary__checkout" type="submit" name="checkout" form="${form!.id}" data-testid="cart-checkout">Checkout</button>
  </div>`;

  const updateHtml = () => `<button class="button button--secondary cart-update" type="submit" name="update" form="${form!.id}" data-cart-update data-testid="cart-update">Update</button>`;

  const fragment = (html: string) => {
    const template = document.createElement('template');
    template.innerHTML = html;
    return template.content.firstElementChild as HTMLElement;
  };

  function renderBody(cart: AjaxCart) {
    if (!body || !main || !form) return;
    body.dataset.itemCount = String(cart.item_count);
    if (!cart.items.length) {
      main.querySelector('[data-testid="cart-lines"]')?.remove();
      main.querySelector('[data-testid="cart-update"]')?.remove();
      form.querySelector('.cart-summary')?.remove();
      if (!main.querySelector('[data-testid="cart-empty"]')) main.append(fragment(emptyHtml!));
      return;
    }
    main.querySelector('[data-testid="cart-empty"]')?.remove();
    let list = main.querySelector('[data-testid="cart-lines"]') as HTMLElement | null;
    if (!list) {
      list = fragment('<ul class="cart-lines" role="list" data-testid="cart-lines"></ul>');
      main.append(list, fragment(updateHtml()));
    }
    // Theo key, giữ nguyên phần tử: focus và giá trị ô đang nhập còn nguyên như apply() thật (AGENTS.md). value đổi qua thuộc tính nên ô đã bị sửa giữ số đang nhập.
    const keep = new Set(cart.items.map((item) => item.key));
    for (const li of [...list.children] as HTMLElement[]) if (!keep.has(li.dataset.lineKey!)) li.remove();
    cart.items.forEach((item, index) => {
      let li = ([...list!.children] as HTMLElement[]).find((el) => el.dataset.lineKey === item.key);
      if (li) {
        li.querySelector('[name="updates[]"]')!.setAttribute('value', String(item.quantity));
        li.querySelector('[data-testid="cart-line-total"]')!.textContent = money(item.final_line_price);
      } else li = fragment(lineHtml(item, index));
      if (list!.children[index] !== li) list!.insertBefore(li, list!.children[index] ?? null);
    });
    const summary = form.querySelector('.cart-summary');
    if (summary) {
      summary.querySelector('[data-testid="cart-subtotal"]')!.textContent = money(cart.items_subtotal_price);
      summary.querySelector('[data-testid="cart-total"]')!.textContent = money(cart.total_price);
    } else form.append(fragment(summaryHtml(cart)));
  }

  function renderCount(cart: AjaxCart) {
    const link = document.querySelector('[data-testid="header-cart-link"]');
    if (!link) return;
    link.setAttribute('aria-label', (link.getAttribute('aria-label') ?? '').replace(/\d+/, String(cart.item_count)));
    let count = link.querySelector('[data-testid="header-cart-count"]');
    if (!cart.item_count) return count?.remove();
    if (!count) {
      count = fragment('<span class="site-header__cart-count" data-testid="header-cart-count" aria-hidden="true"></span>');
      link.append(count);
    }
    count.textContent = String(cart.item_count);
  }

  const patched = {
    fetch: async (...args: unknown[]) => {
      const options = (typeof args[args.length - 1] === 'object' ? args.pop() : {}) as { url?: string; signal?: AbortSignal };
      const url = new URL(options.url ?? location.href, location.href);
      url.searchParams.set(param, args.join(' '));
      const res = await fetch(url, { signal: options.signal, headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(`partial ${res.status}`);
      return res.json();
    },
    apply: async (update: { names: string[]; cart: AjaxCart }) => {
      if (update.names.includes('cart-count')) renderCount(update.cart);
      if (update.names.includes('cart-page') || update.names.includes('cart-drawer')) renderBody(update.cart);
    },
    refresh: async (...names: string[]) => patched.apply(await patched.fetch(...names)),
  };
  Object.assign(partials, patched);
  if (partials.fetch !== patched.fetch) throw new Error('Không thay được partials.fetch: object thư viện bị khoá');
  renderBody(initial);
  renderCount(initial);
}

export class MockCart {
  private lines: Line[] = [];
  private behaviours: Record<CartOp, Behaviour[]> = { add: [], change: [], read: [], partial: [] };
  // Số tối đa của mọi dòng khi đặt (quá tồn: 200 kèm số lượng bị giảm).
  stock: number | undefined;
  // Request Cart API tới được store: phải luôn rỗng.
  readonly leaks: string[] = [];
  readonly calls: Record<CartOp, unknown[]> = { add: [], change: [], read: [], partial: [] };

  constructor(private readonly page: Page) {}

  async install() {
    this.page.on('response', (res) => {
      if (CART_API_PATH.test(new URL(res.url()).pathname) && !res.headers()[MOCK_HEADER]) this.leaks.push(`${res.request().method()} ${res.url()} ${res.status()}`);
    });
    await this.page.route((url) => url.searchParams.has(PARTIAL_PARAM), (route) => {
      const names = (new URL(route.request().url()).searchParams.get(PARTIAL_PARAM) ?? '').split(' ');
      this.calls.partial.push(names);
      return this.reply('partial', route, () => ({ status: 200, json: { names, cart: this.state() } }));
    });
    await this.page.route((url) => CART_API_PATH.test(url.pathname), (route) => this.cartApi(route));
  }

  // Trang thật, 1 lần tải; sau đó dựng giỏ mock lên trang và thay partials.
  async goto(path: string) {
    await gotoStore(this.page, path);
    await this.attach();
  }

  // Chuỗi, không truyền function: Playwright biên dịch import() trong spec thành require, trình duyệt không chạy được.
  async attach() {
    const script = `import(${JSON.stringify(LIBRARY)}).then((library) => (${installPartials.toString()})(library, ${JSON.stringify(this.state())}, ${JSON.stringify(PARTIAL_PARAM)}))`;
    await this.page.evaluate(script);
  }

  // Thay trang /cart thật bằng trang tối giản khi test chỉ cần biết đã chuyển trang: không thêm 1 lần tải trang.
  async stubCartDocument() {
    await this.page.route(
      (url) => /\/cart\/?$/.test(url.pathname),
      (route) => (route.request().resourceType() === 'document' ? route.fulfill({ contentType: 'text/html', body: '<!doctype html><html lang="en"><title>cart</title><div data-testid="cart-page">cart</div></html>' }) : route.fallback()),
    );
  }

  // Mỗi phần tử là 1 dòng riêng nhờ property ẩn, như store thật khi khác properties.
  seed(quantities: number[], id = MOCK_VARIANT) {
    quantities.forEach((quantity, i) => this.add(id, quantity, { _mock: String(i) }));
    return id;
  }

  // Thêm thẳng vào giỏ, không qua trang: thay cho "request ngoài" làm trang lệch server.
  add(id: number, quantity: number, properties: Properties = {}): Line {
    const key = `${id}:${createHash('md5').update(JSON.stringify(properties)).digest('hex')}`;
    const line = this.lines.find((l) => l.key === key);
    if (line) {
      line.quantity += quantity;
      return line;
    }
    const created = { key, id, quantity, properties };
    this.lines.push(created);
    return created;
  }

  state(): AjaxCart {
    const total = this.lines.reduce((sum, l) => sum + l.quantity * UNIT_PRICE, 0);
    return JSON.parse(JSON.stringify({
      token: 'mock-cart-token?key=mock',
      note: '',
      attributes: {},
      original_total_price: total,
      total_price: total,
      total_discount: 0,
      total_weight: 0,
      item_count: this.lines.reduce((sum, l) => sum + l.quantity, 0),
      items: this.lines.map(itemJson),
      requires_shipping: this.lines.length > 0,
      currency: 'USD',
      items_subtotal_price: total,
      cart_level_discount_applications: [],
    }));
  }

  // Hành vi cho request tiếp theo của op, tới khi hết times hoặc reset. status/json/html thay kết quả của giỏ, giỏ không đổi.
  respond(op: CartOp, behaviour: Behaviour) {
    this.behaviours[op].push({ times: Infinity, ...behaviour });
  }

  reset(op: CartOp) {
    this.behaviours[op] = [];
  }

  // Giữ request kế tiếp của op tới khi gọi hàm trả về. Kết quả tính lúc request tới, như server trả HTML của thời điểm đó.
  hold(op: CartOp): () => void {
    let release = () => {};
    const hold = new Promise<void>((resolve) => { release = resolve; });
    this.respond(op, { hold, times: 1 });
    return release;
  }

  private take(op: CartOp) {
    const next = this.behaviours[op][0];
    if (next && (next.times = (next.times ?? Infinity) - 1) <= 0) this.behaviours[op].shift();
    return next;
  }

  private async reply(op: CartOp, route: Route, real: () => Result) {
    const behaviour = this.take(op);
    const replaced = behaviour?.status !== undefined || behaviour?.abort;
    const result = replaced ? undefined : real();
    if (behaviour?.hold) await behaviour.hold;
    if (behaviour?.delayMs) await new Promise((r) => setTimeout(r, behaviour.delayMs));
    // Request đã bị trang huỷ thì fulfill lỗi: bỏ qua.
    if (behaviour?.abort) return route.abort().catch(() => {});
    const headers = { [MOCK_HEADER]: '1' };
    if (behaviour?.html !== undefined) return route.fulfill({ status: behaviour.status ?? 200, contentType: 'text/html', headers, body: behaviour.html }).catch(() => {});
    const status = behaviour?.status ?? result!.status;
    const json = behaviour?.status !== undefined ? behaviour.json : result!.json;
    return route.fulfill({ status, contentType: 'application/json', headers, body: JSON.stringify(json) }).catch(() => {});
  }

  private async cartApi(route: Route) {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const body = this.parseBody(route);
    if (path.endsWith('/add.js')) {
      this.calls.add.push(body);
      return this.reply('add', route, () => this.applyAdd(body));
    }
    if (path.endsWith('/change.js')) {
      this.calls.change.push(body);
      return this.reply('change', route, () => this.applyChange(body));
    }
    if (path.endsWith('/clear.js')) {
      this.lines = [];
      return this.reply('change', route, () => ({ status: 200, json: this.state() }));
    }
    if (path.endsWith('/update.js')) throw new Error('ES1-T203: mock chưa hỗ trợ /cart/update.js, theme không gọi đường này');
    this.calls.read.push(null);
    return this.reply('read', route, () => ({ status: 200, json: this.state() }));
  }

  // JSON của cart-items.js hoặc multipart của product-form.js.
  private parseBody(route: Route): Record<string, unknown> {
    const raw = route.request().postData() ?? '';
    if (!raw) return {};
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      const fields = [...raw.matchAll(/name="([^"]+)"\r?\n\r?\n([^\r\n]*)/g)];
      return Object.fromEntries(fields.map((m) => [m[1], m[2]]));
    }
  }

  private capped(line: Line) {
    if (this.stock !== undefined) line.quantity = Math.min(line.quantity, this.stock);
    return itemJson(line);
  }

  private applyAdd(body: Record<string, unknown>): Result {
    type Input = { id?: number | string; quantity?: number | string; properties?: Properties };
    const inputs = (body.items as Input[] | undefined) ?? [body as Input];
    if (inputs.some((input) => !Number(input.id))) return { status: 422, json: { status: 422, message: 'Cart Error', description: 'Cannot find variant' } };
    const added = inputs.map((input) => this.capped(this.add(Number(input.id), Number(input.quantity) || 1, input.properties ?? {})));
    return { status: 200, json: body.items ? { items: added } : added[0] };
  }

  private applyChange(body: Record<string, unknown>): Result {
    const line = this.lines.find((l) => l.key === body.id);
    if (!line) return { status: 400, json: { status: 400, message: 'Bad Request', description: 'No valid id or line parameter' } };
    line.quantity = Number(body.quantity);
    if (line.quantity <= 0) this.lines = this.lines.filter((l) => l !== line);
    else this.capped(line);
    return { status: 200, json: this.state() };
  }
}

export type Guard = { allowNetworkLog: () => void };

export const test = base.extend<{ guard: Guard; cart: MockCart }>({
  guard: [
    async ({ page }, use, info) => {
      const watch = watchStore(page);
      await use({ allowNetworkLog: watch.allowNetworkLog });
      if (info.status !== 'skipped') await watch.finish();
    },
    { auto: true },
  ],
  cart: [
    async ({ page }, use, info) => {
      const cart = new MockCart(page);
      await cart.install();
      await use(cart);
      if (info.status !== 'skipped') expect(cart.leaks, 'Cart API lọt tới store').toEqual([]);
    },
    { auto: true },
  ],
});
