// KHÔNG CHẮC: nhóm "HTTP thật" (TC-09, TC-11) chưa chạy: sandbox agent cấm mở cổng cục bộ và không mở được Chromium → chờ CI. Nhóm logic đã chạy.
// Ticket ES1-T163: helper tests/e2e/support/cart-api.ts. Không gọi store dev (không tốn hạn mức 429).
// Chạy: npx playwright test tests/e2e/ES1-T163.spec.ts
import { test, expect, type APIRequestContext } from '@playwright/test';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { CART, MAX_TOTAL_WAIT_MS, cartApi, retryDelayMs, type CartInit } from './support/cart-api';

type Reply = { status: number; retryAfter?: string };

// Bắt lỗi skip để kiểm lý do, rồi trả test về trạng thái thường; không làm vậy thì test này tự thành skip và không kiểm được gì.
async function expectSkip(run: () => Promise<unknown>, reason: string) {
  const info = test.info();
  await expect(run()).rejects.toThrow();
  expect(info.expectedStatus).toBe('skipped');
  expect(info.annotations).toContainEqual(expect.objectContaining({ type: 'skip', description: reason }));
  info.expectedStatus = 'passed';
  info.annotations.length = 0;
}

test.describe('ES1-T163 cartApi logic', () => {
  let calls: { path: string; init: CartInit }[];
  let replies: Reply[]; // trả lần lượt theo từng lời gọi; hết danh sách thì 200

  const fake = {
    fetch: async (path: string, init: CartInit) => {
      calls.push({ path, init });
      const reply = replies.shift() ?? { status: 200 };
      return { status: () => reply.status, headers: () => (reply.retryAfter === undefined ? {} : { 'retry-after': reply.retryAfter }) };
    },
  } as unknown as APIRequestContext;
  const always429 = (retryAfter?: string): Reply[] => Array.from({ length: 9 }, () => ({ status: 429, retryAfter }));

  test.beforeEach(() => { calls = []; replies = []; });

  test('TC-01 429 một lần: chờ theo Retry-After, thử lại, trả 200, không skip', async () => {
    replies = [{ status: 429, retryAfter: '1' }];
    const started = Date.now();
    const res = await cartApi(fake, CART.clear);
    expect(res.status()).toBe(200);
    expect(calls).toHaveLength(2);
    expect(Date.now() - started).toBeGreaterThanOrEqual(900);
    expect(test.info().expectedStatus).toBe('passed');
  });

  test('TC-02 429 không có Retry-After: chờ mặc định 2 s', async () => {
    replies = [{ status: 429 }];
    const started = Date.now();
    expect((await cartApi(fake, CART.add)).status()).toBe(200);
    expect(Date.now() - started).toBeGreaterThanOrEqual(1900);
  });

  test('TC-03 429 cả 4 lần: chờ đúng 3 lần 2, 4, 8 s (ES1-T201), skip với lý do có N và path, log đúng dạng script đếm', async () => {
    replies = always429('1');
    const lines: string[] = [];
    const log = console.log;
    console.log = (...args: unknown[]) => { lines.push(args.join(' ')); };
    const started = Date.now();
    try {
      await expectSkip(() => cartApi(fake, CART.clear), `429 sau 4 lần thử: ${CART.clear}`);
    } finally {
      console.log = log;
    }
    expect(calls).toHaveLength(4);
    const elapsed = Date.now() - started;
    expect(elapsed).toBeGreaterThanOrEqual(13_900);
    expect(elapsed).toBeLessThan(15_000); // lần 429 thứ 4 không chờ thêm
    expect(lines.filter((l) => l.includes('[cartApi] 429 lần'))).toHaveLength(4);
    expect(lines.filter((l) => l.includes('trả 429'))).toHaveLength(1);
  });

  test('TC-04 Retry-After lớn hơn ngân sách: tổng chờ không quá 15 s, skip thay vì treo', async () => {
    replies = always429('60');
    const started = Date.now();
    await expectSkip(() => cartApi(fake, CART.clear), `429 sau 2 lần thử: ${CART.clear}`);
    expect(calls).toHaveLength(2);
    const elapsed = Date.now() - started;
    expect(elapsed).toBeGreaterThanOrEqual(MAX_TOTAL_WAIT_MS - 100);
    expect(elapsed).toBeLessThan(MAX_TOTAL_WAIT_MS + 2000);
  });

  test('TC-05 retryDelayMs: giá trị hợp lệ, không hợp lệ, chạm ngân sách', () => {
    expect(retryDelayMs('3', 0)).toBe(3000);
    expect(retryDelayMs('1.5', 0)).toBe(2000); // nhỏ hơn mức chờ của lượt (ES1-T201)
    expect(retryDelayMs(undefined, 0)).toBe(2000);
    expect(retryDelayMs('', 0)).toBe(2000);
    expect(retryDelayMs('0', 0)).toBe(2000);
    expect(retryDelayMs('-5', 0)).toBe(2000);
    expect(retryDelayMs('Fri, 06 Nov 2026 09:00:00 GMT', 0)).toBe(2000);
    expect(retryDelayMs('Infinity', 0)).toBe(2000);
    expect(retryDelayMs('60', 0)).toBe(15_000);
    expect(retryDelayMs('10', 10_000)).toBe(5000);
    expect(retryDelayMs('10', 15_000)).toBe(0);
  });

  test('TC-06 thời gian chờ không tính vào timeout của test', async () => {
    test.setTimeout(1000);
    replies = [{ status: 429, retryAfter: '2' }];
    expect((await cartApi(fake, CART.clear)).status()).toBe(200);
  });

  for (const status of [422, 403, 500]) {
    test(`TC-07 status ${status}: trả cho caller ngay, không thử lại, không skip`, async () => {
      replies = [{ status }];
      expect((await cartApi(fake, CART.change, { data: { id: 'k', quantity: 1 } })).status()).toBe(status);
      expect(calls).toHaveLength(1);
      expect(test.info().expectedStatus).toBe('passed');
    });
  }

  test('TC-08 method mặc định: /cart.js GET, còn lại POST; init giữ nguyên qua lần thử lại', async () => {
    await cartApi(fake, CART.read);
    await cartApi(fake, CART.clear);
    await cartApi(fake, CART.read, { method: 'HEAD' });
    expect(calls.map((c) => c.init.method)).toEqual(['GET', 'POST', 'HEAD']);

    calls = [];
    replies = [{ status: 429, retryAfter: '1' }];
    const data = { items: [{ id: 1, quantity: 2 }] };
    await cartApi(fake, CART.add, { data });
    expect(calls.map((c) => [c.path, c.init.data])).toEqual([[CART.add, data], [CART.add, data]]);
  });

  test('TC-10 mất mạng: lỗi kết nối ném ra cho test fail, không skip nhầm thành 429', async () => {
    const down = { fetch: async () => { throw new Error('connect ECONNREFUSED'); } } as unknown as APIRequestContext;
    await expect(cartApi(down, CART.clear)).rejects.toThrow(/ECONNREFUSED/);
    expect(test.info().expectedStatus).toBe('passed');
  });
});

test.describe('ES1-T163 cartApi HTTP thật', () => {
  let server: Server;
  let origin: string;
  let hits: { method: string; body: string; cookie: string }[];
  let replies: Reply[];

  test.beforeAll(async () => {
    server = createServer((req, res) => {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        hits.push({ method: req.method ?? '', body, cookie: req.headers.cookie ?? '' });
        const reply = replies.shift() ?? { status: 200 };
        res.writeHead(reply.status, { 'content-type': 'application/json', ...(reply.retryAfter ? { 'Retry-After': reply.retryAfter } : {}) }).end('{}');
      });
    });
    await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
    origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });
  test.afterAll(() => new Promise((r) => server.close(r)));
  test.beforeEach(() => { hits = []; replies = []; });

  test('TC-09 truyền page: dùng page.request, chung cookie giỏ với trang', async ({ browser }) => {
    const context = await browser.newContext({ baseURL: origin });
    await context.addCookies([{ name: 'cart', value: 'c1', url: origin }]);
    const page = await context.newPage();
    await cartApi(page, CART.clear);
    expect(hits[0].cookie).toContain('cart=c1');
    await context.close();
  });

  test('TC-11 APIRequestContext thật: đọc header Retry-After, gửi lại đúng body JSON', async ({ playwright }) => {
    replies = [{ status: 429, retryAfter: '1' }];
    const request = await playwright.request.newContext({ baseURL: origin });
    const started = Date.now();
    const res = await cartApi(request, CART.add, { data: { id: 1, quantity: 2 } });
    expect(res.status()).toBe(200);
    expect(Date.now() - started).toBeGreaterThanOrEqual(900);
    expect(hits.map((h) => [h.method, JSON.parse(h.body)])).toEqual([['POST', { id: 1, quantity: 2 }], ['POST', { id: 1, quantity: 2 }]]);
    await request.dispose();
  });
});
