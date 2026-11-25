// KHÔNG CHẮC: spec chưa chạy, chưa type-check (phiên viết không có preview, không mạng); chờ CI.
// Ticket ES1-T344 TE-13-R2-BE1: assets/sale-countdown.js (mới, ≤ 2 048 B, lười viewport trang chủ), featured-product.js bỏ đếm (≤ 1 024 B),
// data-lazy-on="interaction" cho picker/form của featured product, quiz-dialog.js lười theo tương tác.
// AC: docs/srs.md TE-4 AC17, AC32, TE-13 AC1, AC-H22, AC-H23; ADR 0009 mục 3, 4; ADR 0010.
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T344.spec.ts
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { test, expect, type Locator, type Page } from './support/test';
import { watchShopPay403 } from './support/console-guard';

const STATES = '/?view=te13-states';
const COUNTDOWN = 'featured-product-countdown';
const IGNORE_CONSOLE = [
  /shopifycloud|monorail|web-pixels|trekkie|shop\.app|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i,
  /Failed to resolve module specifier "?@shopify\/partial-rendering/,
];
const read = (file: string) => readFileSync(file, 'utf8');
const size = (file: string) => statSync(file).size;
const band = (page: Page, id: string) => page.getByTestId(`container-te13-${id}`);
const LAZY = `<script src="{{ 'lazy-module.js' | asset_url }}" type="module">`;

function watchConsole(page: Page) {
  const errors: string[] = [];
  const isShopPay403 = watchShopPay403(page);
  page.on('console', (msg) => {
    if (msg.type() !== 'error' || isShopPay403(msg)) return;
    if (IGNORE_CONSOLE.some((r) => r.test(msg.text()) || r.test(msg.location().url))) return;
    errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

/** Tên file JS theme đã request (bỏ query ?v=). */
function watchModules(page: Page) {
  const hits: string[] = [];
  page.on('request', (req) => {
    const m = new URL(req.url()).pathname.match(/\/([\w-]+)\.js$/);
    if (m) hits.push(m[1]);
  });
  return hits;
}

/** Đặt data-end mọi khung trước khi module chạy (HTML đã parse, module deferred chưa chạy). */
const setEnd = (page: Page, end: number) =>
  page.addInitScript({
    content: `if (window === window.top) document.addEventListener('readystatechange', () => { for (const el of document.querySelectorAll('[data-sale-countdown]')) el.dataset.end = '${end}'; }, { once: true });`,
  });

const cells = async (box: Locator) =>
  box.locator('[data-countdown-unit]:not([hidden]) [data-countdown-value]').allTextContents();
const seconds = (values: string[]) => values.reduce((sum, v, i, all) => sum + Number(v) * [86400, 3600, 60, 1].slice(-all.length)[i], 0);

/** Đồng hồ giả, band A có khung, module đã define và khung trong khung nhìn. */
async function open(page: Page, left: number) {
  const start = Date.now();
  const end = Math.floor(start / 1000) + left;
  await page.clock.install({ time: start });
  await setEnd(page, end);
  await page.goto(STATES);
  const box = band(page, 'a').getByTestId(COUNTDOWN);
  test.skip((await box.count()) === 0, 'Band A không có giá gạch ở biến thể đầu (te13-featured, ES1-T153)');
  await box.scrollIntoViewIfNeeded();
  await expect.poll(() => page.evaluate(() => !!customElements.get('sale-countdown'))).toBe(true);
  await expect(box).toBeInViewport();
  await page.waitForTimeout(300); // IntersectionObserver chạy theo frame thật.
  return { box, end };
}

test.describe('ES1-T344 tĩnh', () => {
  test('trần byte: sale-countdown 2 048, featured-product 1 024, mọi file ≤ 8 192', () => {
    expect(size('assets/sale-countdown.js')).toBeLessThanOrEqual(2048);
    expect(size('assets/featured-product.js')).toBeLessThanOrEqual(1024);
    expect(size('assets/lazy-module.js')).toBeLessThanOrEqual(768);
    for (const f of readdirSync('assets').filter((n) => n.endsWith('.js'))) expect(size(`assets/${f}`), f).toBeLessThanOrEqual(8192);
  });

  test('sale-countdown.js: guard define, 1 interval, visibilitychange, không storage/URL/fetch/log', () => {
    const js = read('assets/sale-countdown.js');
    expect(js).toMatch(/customElements\.get\("sale-countdown"\) \|\|/);
    expect(js.match(/setInterval\(/g)).toHaveLength(1);
    expect(js).toContain('visibilitychange');
    expect(js).toContain('IntersectionObserver');
    expect(js).not.toMatch(/console\.|localStorage|sessionStorage|document\.cookie|location|searchParams|fetch\(|import\s/);
    // Hook JS ↔ snippet (contract FE TE-13-R2-FE1).
    const snippet = read('snippets/sale-countdown.liquid');
    const hooks: Record<string, string> = {
      'data-end': '[data-end]',
      'data-countdown-unit': '[data-countdown-unit]',
      'data-countdown-value': '[data-countdown-value]',
      'data-label-ended': 'labelEnded',
      'aria-labelledby': 'aria-labelledby',
    };
    for (const [hook, inJs] of Object.entries(hooks)) {
      expect(js, hook).toContain(inJs);
      expect(snippet, hook).toContain(hook);
    }
    expect(js).toContain('sale-countdown__ended');
    expect(read('assets/base.css')).toContain('.sale-countdown__ended');
  });

  test('featured-product.js bỏ đếm, swap() thay cả khung countdown', () => {
    const js = read('assets/featured-product.js');
    expect(js).not.toMatch(/setInterval|data-end|countdown-value|visibilitychange|IntersectionObserver/);
    expect(js).toContain('[data-sale-countdown-slot]');
    expect(js).toMatch(/customElements\.get\("featured-product"\) \|\|/);
    expect(read('blocks/featured-product.liquid')).toMatch(/<div class="sale-countdown-slot" data-sale-countdown-slot>/);
  });

  test('featured-product.liquid: countdown lười viewport, picker/form lười interaction, 1 thẻ script', () => {
    const liquid = read('blocks/featured-product.liquid');
    expect(liquid.match(/<script[^>]*>/g)).toEqual([LAZY]);
    expect(liquid).toMatch(/class="featured-product__summary" data-lazy-module="{{ 'sale-countdown\.js' \| asset_url }}"/);
    // Picker: thuộc tính trên .featured-product__details (chứa nút mua: focus bàn phím tới được), không trên summary.
    expect(liquid).toMatch(/class="featured-product__details"\s*{% if has_variant_choice %}\s*{% unless request\.design_mode or featured\.requires_selling_plan %}\s*data-lazy-module="{{ 'product-variant-picker\.js' \| asset_url }}"\s*{% endunless %}\s*data-lazy-on="interaction"/);
    expect(liquid).toMatch(/data-lazy-module="{{ 'product-form\.js' \| asset_url }}"\s*{% endunless %}\s*data-lazy-on="interaction"/);
    // sale-countdown không dùng data-lazy-on (viewport).
    expect(liquid).not.toMatch(/class="featured-product__summary"[^>]*data-lazy-on/);
  });

  test('quiz.liquid: quiz-dialog.js lười interaction trên form, không thẻ script riêng', () => {
    const liquid = read('blocks/quiz.liquid');
    expect(liquid.match(/<script[^>]*>/g)).toEqual([LAZY]);
    expect(liquid).toMatch(/{% if results_popup %}\s*data-lazy-module="{{ 'quiz-dialog\.js' \| asset_url }}"\s*data-lazy-on="interaction"\s*{% endif %}\s*data-testid="quiz-form"/);
    const js = read('assets/quiz-dialog.js');
    expect(js).not.toMatch(/console\.|fetch\(/);
    expect(size('assets/quiz-dialog.js')).toBeLessThanOrEqual(8192);
  });
});

test.describe('ES1-T344 nạp lười', () => {
  test('featured: sale-countdown.js nạp khi gần khung nhìn; picker, form chỉ nạp khi tương tác', async ({ page }) => {
    const errors = watchConsole(page);
    const hits = watchModules(page);
    await page.goto(STATES);
    const a = band(page, 'a');
    const details = a.locator('.featured-product__details');
    await a.getByTestId('featured-product').scrollIntoViewIfNeeded();
    await expect.poll(() => hits.includes('sale-countdown')).toBe(true);
    expect(hits.filter((h) => h === 'sale-countdown')).toHaveLength(1);
    await page.waitForTimeout(500);
    expect(hits).not.toContain('product-form');
    const lazyPicker = await details.getAttribute('data-lazy-module');
    if (lazyPicker) expect(hits).not.toContain('product-variant-picker');

    await a.getByTestId('featured-product-add').hover();
    await expect.poll(() => hits.includes('product-form')).toBe(true);
    if (lazyPicker) await expect.poll(() => hits.includes('product-variant-picker')).toBe(true);
    expect(errors).toEqual([]);
  });

  test('featured: chỉ bàn phím — focus nút mua nạp product-form (và picker)', async ({ page }) => {
    const hits = watchModules(page);
    await page.goto(STATES);
    const a = band(page, 'a');
    const add = a.getByTestId('featured-product-add');
    await add.scrollIntoViewIfNeeded();
    await add.evaluate((el: HTMLElement) => el.focus());
    await expect.poll(() => hits.includes('product-form')).toBe(true);
    if (await a.locator('.featured-product__details[data-lazy-module]').count()) {
      await expect.poll(() => hits.includes('product-variant-picker')).toBe(true);
    }
  });

  test('quiz: quiz-dialog.js không nạp khi tải và cuộn, nạp khi tương tác form', async ({ page }) => {
    const errors = watchConsole(page);
    const hits = watchModules(page);
    await page.goto('/');
    const form = page.locator('[data-testid="quiz-form"][data-lazy-module]').first();
    test.skip((await form.count()) === 0, 'Trang chủ không có quiz popup (fixture store dev)');
    await form.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    expect(hits).not.toContain('quiz-dialog');
    await form.hover();
    await expect.poll(() => hits.includes('quiz-dialog')).toBe(true);
    const dialog = page.getByTestId('quiz-dialog').first();
    await expect(dialog).not.toHaveAttribute('open', /.*/);
    expect(errors).toEqual([]);
  });
});

test.describe('ES1-T344 countdown', () => {
  test('TE-4 AC17: số giảm mỗi giây theo data-end, ≥ 24 giờ 4 ô', async ({ page }) => {
    const errors = watchConsole(page);
    const { box, end } = await open(page, 2 * 86400 + 5000);
    await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 1000);
    await page.clock.runFor(1000);
    const first = await cells(box);
    expect(first).toHaveLength(4);
    const now = await page.evaluate(() => Math.floor(Date.now() / 1000));
    expect(Math.abs(seconds(first) - (end - now))).toBeLessThanOrEqual(1);
    await page.clock.runFor(1000);
    expect(seconds(first) - seconds(await cells(box))).toBe(1);
    await expect(box).toHaveAttribute('data-state', 'running');
    await expect(box).not.toHaveAttribute('aria-live', /.*/);
    expect(errors).toEqual([]);
  });

  test('AC-H23: dưới 24 giờ ô ngày ẩn, 3 ô 2 chữ số', async ({ page }) => {
    const { box } = await open(page, 3 * 3600 + 5);
    await expect(box.getByTestId(`${COUNTDOWN}-days`)).toBeHidden();
    const values = await cells(box);
    expect(values).toHaveLength(3);
    for (const v of values) expect(v).toMatch(/^\d{2}$/);
  });

  test('TE-4 AC32: dưới 1 giờ data-state ending', async ({ page }) => {
    const { box } = await open(page, 3605);
    await expect(box).toHaveAttribute('data-state', 'running');
    await page.clock.fastForward(10000);
    await expect(box).toHaveAttribute('data-state', 'ending');
  });

  test('K3: hết giờ khi đang xem → "This sale has ended", giữ khung, tên timer là chữ đó, không đếm lại', async ({ page }) => {
    const errors = watchConsole(page);
    const { box } = await open(page, 30);
    const before = (await box.boundingBox())!;
    const label = await box.getAttribute('data-label-ended');
    await page.clock.fastForward(31000);
    await expect(box).toHaveAttribute('data-state', 'ended');
    await expect(box).toHaveText(label!);
    await expect(box.locator('[data-countdown-unit]')).toHaveCount(0);
    const after = (await box.boundingBox())!;
    expect(Math.abs(after.height - before.height)).toBeLessThanOrEqual(0.5);
    // Tên role timer trỏ vào chữ ended nhìn thấy.
    const id = await box.getAttribute('aria-labelledby');
    await expect(box.locator(`#${id}`)).toHaveClass(/sale-countdown__ended/);
    await expect(box.locator(`#${id}`)).toBeVisible();
    // Không đếm lại, giá và nút giữ nguyên.
    await page.clock.fastForward(120000);
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
    await expect(box).toHaveAttribute('data-state', 'ended');
    await expect(band(page, 'a').getByTestId('featured-product-price')).toBeVisible();
    await expect(band(page, 'a').getByTestId('featured-product-add')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('trang cache cũ: data-end đã qua khi JS chạy → K3 ngay, không đếm âm', async ({ page }) => {
    const { box } = await open(page, -60);
    await expect(box).toHaveAttribute('data-state', 'ended');
    await expect(box).not.toContainText('-');
  });

  test('reload không reset; không khoá countdown trong storage', async ({ page }) => {
    const { box, end } = await open(page, 90061);
    await page.reload();
    await box.scrollIntoViewIfNeeded();
    await expect.poll(() => page.evaluate(() => !!customElements.get('sale-countdown'))).toBe(true);
    await page.waitForTimeout(300);
    const now = await page.evaluate(() => Math.floor(Date.now() / 1000));
    expect(Math.abs(seconds(await cells(box)) - (end - now))).toBeLessThanOrEqual(1);
    const keys = await page.evaluate(() => [...Object.keys(localStorage), ...Object.keys(sessionStorage), document.cookie]);
    expect(keys.filter((k) => /countdown|deadline|timer|sale/i.test(k))).toEqual([]);
  });

  test('tab ẩn thì dừng, hiện lại tính ngay từ data-end', async ({ page }) => {
    const { box, end } = await open(page, 90061);
    await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 1000);
    const setHidden = (hidden: boolean) =>
      page.evaluate((value) => {
        Object.defineProperty(document, 'hidden', { configurable: true, get: () => value });
        document.dispatchEvent(new Event('visibilitychange'));
      }, hidden);
    await setHidden(true);
    const frozen = await cells(box);
    await page.clock.runFor(10000);
    expect(await cells(box)).toEqual(frozen);
    await setHidden(false);
    const now = await page.evaluate(() => Math.floor(Date.now() / 1000));
    expect(Math.abs(seconds(await cells(box)) - (end - now))).toBeLessThanOrEqual(1);
  });

  test('editor/partial: thẻ mới chèn sau khi module chạy tự nâng cấp, thẻ gỡ ra không còn tick', async ({ page }) => {
    const errors = watchConsole(page);
    const { box } = await open(page, 90061);
    const host = box.locator('xpath=..');
    // Gỡ rồi gắn lại (như partials.apply / swap thay khung): connectedCallback chạy lại, không lỗi.
    await host.evaluate((el) => {
      const parent = el.parentElement!;
      el.remove();
      parent.append(el);
    });
    await page.clock.fastForward(2000);
    await expect(box).toHaveAttribute('data-state', 'running');
    expect(errors).toEqual([]);
  });
});
