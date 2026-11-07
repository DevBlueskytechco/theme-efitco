// KHÔNG CHẮC: nhóm này không gọi store. DoD số test chạy thật T96, T97, T98 chỉ đo được trên CI PR (phiên QA bị chặn store dev).
// Ticket ES1-T201 TE-10-QA3: bỏ bước clear giỏ thừa, giảm request Cart API, 429 chờ tăng dần, tổng kết skip theo spec.
// Chạy: npx playwright test tests/e2e/ES1-T201.spec.ts
import { test, expect, type APIRequestContext, type Page } from '@playwright/test';
import { existsSync, mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { CART, MAX_TOTAL_WAIT_MS, MAX_WAITS, cartApi, retryDelayMs, themeAdd } from './support/cart-api';
import { lineKeys, seedCart } from './support/cart-seed';
import { printSummary429, record429, summary429 } from './support/report-429';

const ROOT = process.cwd();
const E2E = join(ROOT, 'tests/e2e');
const read = (path: string) => readFileSync(join(ROOT, path), 'utf8');

// Bắt lỗi skip để kiểm lý do, rồi trả test về trạng thái thường.
async function expectSkip(run: () => Promise<unknown>, reason: string) {
  const info = test.info();
  await expect(run()).rejects.toThrow();
  expect(info.expectedStatus).toBe('skipped');
  expect(info.annotations).toContainEqual(expect.objectContaining({ type: 'skip', description: reason }));
  info.expectedStatus = 'passed';
  info.annotations.length = 0;
}

test.describe('ES1-T201 quy ước spec (tĩnh)', () => {
  test.beforeEach(({}, ti) => { test.skip(ti.project.name !== 'desktop', 'tĩnh, chạy 1 lần'); });

  test('TC-01 state.json do globalSetup sinh không có cookie cart', () => {
    const state = 'tests/setup/state.json';
    test.skip(!existsSync(join(ROOT, state)), 'Chưa có state.json: chỉ có sau globalSetup trên store');
    const { cookies } = JSON.parse(read(state)) as { cookies: { name: string }[] };
    expect(cookies.map((c) => c.name)).not.toContain('cart');
  });

  test('TC-02 globalSetup xoá cookie cart trước khi lưu state, trả teardown in tổng kết', () => {
    const setup = read('tests/setup/password.ts');
    expect(setup.indexOf("clearCookies({ name: 'cart' })")).toBeGreaterThan(0);
    expect(setup.indexOf("clearCookies({ name: 'cart' })")).toBeLessThan(setup.indexOf('storageState({ path'));
    expect(setup).toContain('return printSummary429');
  });

  test('TC-03 không spec nào gọi clear giỏ, trừ spec kiểm helper bằng request giả', () => {
    const allowed = new Set(['ES1-T163.spec.ts', 'ES1-T201.spec.ts']);
    const offenders = readdirSync(E2E)
      .filter((f) => f.endsWith('.spec.ts') && !allowed.has(f))
      .filter((f) => /CART\.clear|clearCart|cart\/clear/.test(readFileSync(join(E2E, f), 'utf8')));
    expect(offenders).toEqual([]);
  });

  // ES1-T203: T97, T98 seed vào giỏ mock trong bộ nhớ, không còn request seed. Vẫn đọc line key từ DOM.
  test('TC-04 ES1-T97, T98 đọc line key từ DOM, không fetch /cart.js chỉ để lấy key', () => {
    for (const spec of ['ES1-T97.spec.ts', 'ES1-T98.spec.ts']) {
      const source = readFileSync(join(E2E, spec), 'utf8');
      expect(source, spec).toContain('await lineKeys(page)');
      expect(source, spec).not.toMatch(/readCart\(page\)\)\.items\[0\]\.key|readCart\(page\)\)\.items\.map/);
    }
  });

  test('TC-05 không đổi store-tests.yml, không route.fetch trong helper', () => {
    expect(read('.github/workflows/store-tests.yml')).toContain('--shard=${{ matrix.shard }}/2');
    expect(read('tests/e2e/support/cart-api.ts')).not.toMatch(/\broute\.fetch\(/);
  });
});

test.describe('ES1-T201 seedCart', () => {
  function fakePage(status = 200) {
    const gotos: string[] = [];
    const posts: { path: string; data: unknown }[] = [];
    const embedded = JSON.stringify({ product: { id: 1, handle: 't201' }, variants: [{ id: 8, available: false, price: 1 }, { id: 9, available: true, price: 1 }] });
    const page = {
      goto: async (url: string) => { gotos.push(url); },
      url: () => 'https://store.test/products/t201',
      locator: () => ({ count: async () => 1, first: () => ({ textContent: async () => embedded }) }),
      request: {
        fetch: async (path: string, init: { data: unknown }) => {
          posts.push({ path, data: init.data });
          return { status: () => status, ok: () => status < 400, headers: () => ({}) };
        },
      },
    } as unknown as Page;
    return { page, gotos, posts };
  }

  test('TC-06 2 dòng = 1 request add với items[]; test sau không mở lại trang sản phẩm', async () => {
    const first = fakePage();
    expect(await seedCart(first.page, 't201', [1, 2], '_x')).toBe(9);
    expect(first.gotos).toEqual(['/products/t201']);
    expect(first.posts).toEqual([{
      path: CART.add,
      data: { items: [{ id: 9, quantity: 1, properties: { _x: '0' } }, { id: 9, quantity: 2, properties: { _x: '1' } }] },
    }]);

    const second = fakePage();
    expect(await seedCart(second.page, 't201', [1], '_x')).toBe(9);
    expect(second.gotos, 'variant lấy từ cache của worker').toEqual([]);
    expect(second.posts).toHaveLength(1);
  });

  test('TC-07 add trả lỗi khác 429: fail, không skip', async () => {
    const { page } = fakePage(422);
    await expect(seedCart(page, 't201', [1], '_x')).rejects.toThrow(/trả 422/);
    expect(test.info().expectedStatus).toBe('passed');
  });
});

test.describe('ES1-T201 chờ 429', () => {
  test('TC-08 chờ tăng dần 2, 4, 8 s, tổng không quá 15 s kể cả Retry-After lớn', () => {
    const delays = Array.from({ length: MAX_WAITS }, (_, i) => retryDelayMs(undefined, 0, i + 1));
    expect(delays).toEqual([2000, 4000, 8000]);
    expect(delays.reduce((a, b) => a + b)).toBeLessThanOrEqual(MAX_TOTAL_WAIT_MS);
    expect(retryDelayMs('3', 0, 1)).toBe(3000);
    expect(retryDelayMs('1', 6000, 3)).toBe(8000);
    expect(retryDelayMs('60', 14_000, 3)).toBe(1000);
    expect(retryDelayMs('60', 15_000, 3)).toBe(0);
  });

  function fakeTheme(statuses: number[]) {
    const log: string[] = [];
    const page = { waitForResponse: async () => ({ status: () => statuses.shift() ?? 200, headers: () => ({}) }) } as unknown as Page;
    const click = async () => { log.push('click'); };
    const reopen = async () => { log.push('reopen'); };
    return { page, click, reopen, log };
  }

  test('TC-09 theme nhận 429 rồi 200: mở lại trang và bấm lại, không skip', async () => {
    const { page, click, reopen, log } = fakeTheme([429]);
    await themeAdd(page, click, reopen);
    expect(log).toEqual(['click', 'reopen', 'click']);
    expect(test.info().expectedStatus).toBe('passed');
  });

  test('TC-10 theme nhận 429 mọi lần: tối đa 4 lần bấm, skip có lý do', async () => {
    const { page, click, reopen, log } = fakeTheme(Array(9).fill(429));
    await expectSkip(() => themeAdd(page, click, reopen), `429 sau 4 lần thử: ${CART.add}`);
    expect(log.filter((l) => l === 'click')).toHaveLength(4);
    expect(log.filter((l) => l === 'reopen')).toHaveLength(3);
  });

  test('TC-11 status khác 429: không mở lại trang', async () => {
    const { page, click, reopen, log } = fakeTheme([422]);
    await themeAdd(page, click, reopen);
    expect(log).toEqual(['click']);
  });

  test('TC-12 mất mạng trên request helper: ném lỗi, không skip nhầm', async () => {
    const down = { fetch: async () => { throw new Error('connect ECONNREFUSED'); } } as unknown as APIRequestContext;
    await expect(cartApi(down, CART.add)).rejects.toThrow(/ECONNREFUSED/);
    expect(test.info().expectedStatus).toBe('passed');
  });
});

// Trang giả qua page.route: không gọi store, không mở cổng.
test.describe('ES1-T201 trình duyệt thật, trang giả', () => {
  const ORIGIN = 'https://store.test';
  const HTML = `<!doctype html><title>t201</title><button>Add</button><ul>
    <li data-testid="cart-line" data-line-key="9:aaa"></li><li data-testid="cart-line" data-line-key="9:bbb"></li></ul>
    <script>document.querySelector('button').onclick = () => fetch('${CART.add}', { method: 'POST' });</script>`;

  test('TC-18 theme nhận 429 thật qua fetch: mở lại trang, bấm lại, POST lần 2 trả 200', async ({ page }) => {
    const statuses = [429, 200];
    let posts = 0;
    let loads = 0;
    await page.route(`${ORIGIN}/**`, (route) => {
      if (route.request().method() === 'POST') {
        posts++;
        return route.fulfill({ status: statuses.shift() ?? 200, json: {} });
      }
      loads++;
      return route.fulfill({ contentType: 'text/html', body: HTML });
    });
    await page.goto(`${ORIGIN}/products/t201`);
    await themeAdd(page, () => page.getByRole('button').click(), async () => { await page.goto(`${ORIGIN}/products/t201`); });
    expect(posts).toBe(2);
    expect(loads).toBe(2);
  });

  test('TC-19 lineKeys đọc đúng thứ tự từ DOM', async ({ page }) => {
    await page.route(`${ORIGIN}/**`, (route) => route.fulfill({ contentType: 'text/html', body: HTML }));
    await page.goto(`${ORIGIN}/cart`);
    expect(await lineKeys(page)).toEqual(['9:aaa', '9:bbb']);
  });
});

test.describe('ES1-T201 tổng kết 429', () => {
  const LOG = 'hit\tES1-T97.spec.ts\nhit\tES1-T97.spec.ts\nskip\tES1-T97.spec.ts\nhit\tTE-4.spec.ts\nskip\tES1-T45.spec.ts\n';

  test('TC-13 theo spec, có dòng tổng, sắp theo tên', () => {
    expect(summary429(LOG)).toEqual([
      '[429-tong-ket] ES1-T45.spec.ts số_lần_429=0 test_skip=1',
      '[429-tong-ket] ES1-T97.spec.ts số_lần_429=2 test_skip=1',
      '[429-tong-ket] TE-4.spec.ts số_lần_429=1 test_skip=0',
      '[429-tong-ket] tổng số_lần_429=3 test_skip=2',
    ]);
  });

  test('TC-14 log rỗng: báo không có 429', () => {
    expect(summary429('')).toEqual(['[429-tong-ket] không có 429']);
  });

  test('TC-15 CI: chỉ spec TE-5 có skip mới thành annotation warning', () => {
    expect(summary429(LOG, true).filter((l) => l.startsWith('::warning'))).toEqual(['::warning title=429 skip TE-5::ES1-T97.spec.ts skip 1 test do 429']);
    expect(summary429('hit\tES1-T97.spec.ts\n', true).some((l) => l.startsWith('::warning'))).toBe(false);
  });

  test('TC-16 dòng tổng kết không bị scripts/e2e-429-count.sh đếm trùng', () => {
    for (const line of summary429(LOG, true)) {
      expect(line).not.toMatch(/\[cartApi\] 429 lần/);
      expect(line).not.toMatch(/trả 429/);
    }
  });

  test('TC-17 ghi và in qua file: spec thật được tính, spec kiểm helper bị bỏ, không có file không lỗi', () => {
    const saved = process.env.E2E_429_LOG;
    const log = console.log;
    const lines: string[] = [];
    console.log = (...args: unknown[]) => { lines.push(args.join(' ')); };
    try {
      process.env.E2E_429_LOG = join(mkdtempSync(join(tmpdir(), 'efitco-t201-')), 'log');
      record429('skip', 'ES1-T96.spec.ts');
      record429('skip', 'ES1-T163.spec.ts');
      printSummary429();
      expect(lines.filter((l) => l.startsWith('[429-tong-ket]'))).toEqual([
        '[429-tong-ket] ES1-T96.spec.ts số_lần_429=0 test_skip=1',
        '[429-tong-ket] tổng số_lần_429=0 test_skip=1',
      ]);

      lines.length = 0;
      process.env.E2E_429_LOG = join(tmpdir(), 'efitco-t201-khong-co', 'log');
      record429('skip', 'ES1-T96.spec.ts');
      printSummary429();
      expect(lines).toEqual(['[429-tong-ket] không có 429']);
    } finally {
      console.log = log;
      if (saved === undefined) delete process.env.E2E_429_LOG;
      else process.env.E2E_429_LOG = saved;
    }
  });
});
