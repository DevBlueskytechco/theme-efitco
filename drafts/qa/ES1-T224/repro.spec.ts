// ES1-T224: tái lập bằng CSS thật trên trang giả (route.fulfill, không cổng, không store). Không thay CI.
// Chạy: npx playwright test --config=drafts/qa/ES1-T224/pw.repro.config.ts
import { readFileSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { test, expect, type Page } from '@playwright/test';

const ORIGIN = 'http://stub.test';
const asset = (name: string) => readFileSync(`assets/${name}`, 'utf8');
const TOKENS = `:root{--page-width:91rem;--content-width:1400px;--page-margin:20px;--header-height:80px;--space-1:4px;--space-2:8px;--space-3:12px;--space-4:16px;--space-5:24px;--space-6:32px;--space-7:48px;--space-8:120px;--radius-card:12px;--font-size-h1:48px;--font-size-base:16px;--font-size-sm:14px;--font-size-lg:18px;--font-size-display:96px;--color-background:#fff;--color-foreground:#111;--color-muted:#555;--color-accent:#d00;--color-border:#ccc}`;
const shell = (body: string, title = 'stub') => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
<style>${TOKENS}</style><link rel="stylesheet" href="/critical.css"><link rel="stylesheet" href="/base.css"></head><body><main>${body}</main></body></html>`;

const REVIEWS = `<div class="block-container block-container--cream" data-testid="container-home-testimonials"><div class="testimonials" data-testid="testimonials">
<div class="testimonials__header"><h2 class="testimonials__heading" data-testid="testimonials-heading">What Our Customers Say?</h2></div>
<ul class="testimonials__list" role="list" tabindex="0" data-testid="testimonials-list">${[1, 2, 3, 4].map((n) => `<li class="testimonial-item" data-testid="testimonial-item"><div class="testimonial-item__content">Review ${n}</div></li>`).join('')}</ul></div></div><div style="height:3000px">trang dài</div>`;

// Markup rút từ blocks/featured-product.liquid, snippets/product-variant-select.liquid: band B.
const BAND_B = `<div class="block-container" data-testid="container-te13-b"><featured-product class="featured-product" data-testid="featured-product"><s-view-event class="featured-product__view">
<div class="featured-product__gallery"><ul class="featured-product__media-list" role="list" tabindex="0" data-testid="featured-product-media">${[1, 2, 3].map((n) => `<li class="featured-product__media-item" id="FeaturedMedia-1-${n}"><img src="/img/${n}.png" width="10" height="10" loading="lazy" alt=""></li>`).join('')}</ul></div>
<div class="featured-product__details"><div class="featured-product__summary"></div>
<product-form class="featured-product__buy"><product-variant-picker class="product-variant-picker" data-testid="product-variant-picker"><p>picker</p></product-variant-picker>
<form method="post" action="/cart/add" id="product-form-1" class="featured-product__actions"><input type="hidden" name="form_type" value="product"><input type="hidden" name="id" value="11">
<noscript><div class="product-form__field"><label class="product-form__label" for="v">Variant</label><select id="v" class="product-form__input product-form__select" name="id" data-testid="product-variant-select"><option value="11" selected>a</option><option value="22">b</option><option value="33" disabled>c</option></select></div></noscript>
<div class="featured-product__add-wrapper"><button class="button featured-product__add" type="submit" name="add" data-testid="featured-product-add"><span class="product-form__add-label">Add</span></button></div>
<a class="button button--secondary featured-product__view-detail" href="/products/x" data-testid="featured-product-view-detail">View</a></form></product-form></div></s-view-event></featured-product></div>`;

const CHALLENGE = '<!doctype html><html><head><title>Just a moment...</title><meta http-equiv="refresh" content="360"></head><body><div id="challenge-stage">Enable JavaScript and cookies to continue</div></body></html>';
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAEAQH/7yMK/gAAAABJRU5ErkJggg==', 'base64');

type Stub = { images: string[]; posted: URLSearchParams | null };

async function stub(page: Page, opts: { challengePost?: boolean } = {}): Promise<Stub> {
  const state: Stub = { images: [], posted: null };
  await page.route(`${ORIGIN}/**`, async (route) => {
    const req = route.request();
    const path = new URL(req.url()).pathname;
    if (path.endsWith('.css')) return route.fulfill({ contentType: 'text/css', body: asset(path.slice(1)) });
    if (path.startsWith('/img/')) { state.images.push(path); return route.fulfill({ contentType: 'image/png', body: PNG }); }
    if (path === '/reviews') return route.fulfill({ contentType: 'text/html', body: shell(REVIEWS) });
    if (path === '/band') return route.fulfill({ contentType: 'text/html', body: shell(BAND_B) });
    if (path === '/cart/add') {
      state.posted = new URLSearchParams(req.postData() ?? '');
      if (opts.challengePost) return route.fulfill({ status: 403, contentType: 'text/html', headers: { 'cf-mitigated': 'challenge' }, body: CHALLENGE });
      return route.fulfill({ status: 302, headers: { location: `${ORIGIN}/cart` } });
    }
    if (path === '/cart') return route.fulfill({ contentType: 'text/html', body: shell('<h1>Cart</h1>') });
    return route.fulfill({ status: 404, body: '' });
  });
  return state;
}

test.describe('T179 phím trên danh sách testimonials', () => {
  const open = async (page: Page) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await stub(page);
    await page.goto(`${ORIGIN}/reviews`);
    const list = page.getByTestId('testimonials-list');
    await list.focus();
    await expect(list).toBeFocused();
    return list;
  };
  const read = (page: Page) => page.evaluate(() => {
    const el = document.querySelector<HTMLElement>('[data-testid="testimonials-list"]')!;
    const cards = el.querySelectorAll('[data-testid="testimonial-item"]');
    return { scrollLeft: el.scrollLeft, max: el.scrollWidth - el.clientWidth, windowY: window.scrollY, last: cards[cards.length - 1].getBoundingClientRect().right, active: document.activeElement?.getAttribute('data-testid') ?? null };
  });

  for (const key of ['End', 'Home', 'PageDown', 'ArrowDown', 'ArrowRight', 'ArrowLeft']) {
    test(`R1 ghi nhận phím ${key}`, async ({ page }) => {
      await open(page);
      if (key === 'Home' || key === 'ArrowLeft') await page.evaluate(() => { document.querySelector('[data-testid="testimonials-list"]')!.scrollLeft = 200; });
      const before = await read(page);
      await page.keyboard.press(key);
      await page.waitForTimeout(600);
      console.log(`[R1] ${test.info().project.name} ${key} ${JSON.stringify({ before, after: await read(page) })}`);
    });
  }

  test('R2 chỉ dùng ArrowRight có tới hết card 4 không', async ({ page }) => {
    await open(page);
    let presses = 0;
    let state = await read(page);
    while (state.last > 1920 && presses < 60) {
      await page.keyboard.press('ArrowRight');
      presses += 1;
      await page.waitForTimeout(120);
      state = await read(page);
    }
    console.log(`[R2] ${test.info().project.name} ${JSON.stringify({ presses, state })}`);
    expect(state.last).toBeLessThanOrEqual(1920);
  });

  test('R3 phím End trên overflow-x thuần, không CSS theme: hành vi của Chromium', async ({ page }) => {
    await page.route(`${ORIGIN}/plain`, (route) => route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>x</title><div id="s" tabindex="0" style="overflow-x:auto;width:500px;white-space:nowrap"><div style="width:3000px;height:100px">x</div></div><div style="height:3000px"></div>' }));
    await page.goto(`${ORIGIN}/plain`);
    await page.locator('#s').focus();
    await page.keyboard.press('End');
    await page.waitForTimeout(600);
    const out = await page.evaluate(() => ({ left: document.getElementById('s')!.scrollLeft, windowY: window.scrollY }));
    console.log(`[R3] ${test.info().project.name} ${JSON.stringify(out)}`);
  });
});

test.describe('T156 nojs', () => {
  test.use({ javaScriptEnabled: false });

  // R4 dùng server thật: redirect của route.fulfill không đi qua route, nên không kiểm được luồng POST rồi 302.
  test('R4 band B CSS thật, server thật: luồng mới của ES1-T156, POST rồi 302 tới /cart', async ({ page }) => {
    const posted: string[] = [];
    const server: Server = createServer((req, res) => {
      const path = new URL(req.url!, 'http://x').pathname;
      if (path.endsWith('.css')) { res.setHeader('content-type', 'text/css'); return res.end(asset(path.slice(1))); }
      if (path.startsWith('/img/')) { res.setHeader('content-type', 'image/png'); return res.end(PNG); }
      if (path === '/band') { res.setHeader('content-type', 'text/html'); return res.end(shell(BAND_B)); }
      if (path === '/cart/add') {
        let body = '';
        req.on('data', (c) => { body += c; });
        req.on('end', () => { posted.push(body); res.writeHead(302, { location: '/cart' }); res.end(); });
        return;
      }
      if (path === '/cart') { res.setHeader('content-type', 'text/html'); return res.end(shell('<h1>Cart</h1>')); }
      res.statusCode = 404; res.end();
    });
    await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
    const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    try {
      await page.goto(`${base}/band`, { waitUntil: 'domcontentloaded' });
      const b = page.getByTestId('container-te13-b');
      await expect(b.getByTestId('product-variant-picker')).toBeHidden();
      const select = b.getByTestId('product-variant-select');
      await expect(select).toBeVisible();
      await select.selectOption('22');
      const [post] = await Promise.all([
        page.waitForResponse((r) => r.request().method() === 'POST' && new URL(r.url()).pathname.endsWith('/cart/add'), { timeout: 10000 }),
        b.getByTestId('featured-product-add').click({ timeout: 5000 }),
      ]);
      await page.waitForURL((u) => u.pathname.endsWith('/cart'), { waitUntil: 'domcontentloaded', timeout: 5000 });
      const ids = new URLSearchParams(posted[0]).getAll('id');
      console.log(`[R4] ${test.info().project.name} post=${post.status()} url=${page.url()} ids=${JSON.stringify(ids)}`);
      expect(post.status()).toBe(302);
      expect(ids.at(-1)).toBe('22');
    } finally {
      server.close();
    }
  });

  test('R5 tắt JS: ảnh loading=lazy dưới màn hình vẫn tải ngay (load chờ cả ảnh)', async ({ page }) => {
    const state = await stub(page);
    await page.route(`${ORIGIN}/lazy`, (route) => route.fulfill({ contentType: 'text/html', body: `<!doctype html><title>x</title><div style="height:5000px"></div>${[1, 2, 3, 4, 5, 6].map((n) => `<img src="/img/l${n}.png" loading="lazy" width="10" height="10" alt="">`).join('')}` }));
    await page.goto(`${ORIGIN}/lazy`);
    console.log(`[R5] ${test.info().project.name} JS tắt: ${state.images.length} ảnh lazy đã tải`);
  });

  test('R6 tắt JS: page.evaluate, storageState có treo không', async ({ page }) => {
    await stub(page);
    await page.goto(`${ORIGIN}/band`);
    const race = async (label: string, work: Promise<unknown>) => console.log(`[R6] ${label}: ${await Promise.race([
      work.then((v) => `trả ${JSON.stringify(v).slice(0, 80)}`).catch((e) => `lỗi ${String(e).slice(0, 100)}`),
      new Promise<string>((r) => setTimeout(() => r('TREO sau 5 s'), 5000)),
    ])}`);
    await race('page.evaluate', page.evaluate(() => document.title));
    await race('storageState', page.context().storageState());
  });

  test('R7 POST /cart/add bị thử thách khi tắt JS: URL /cart/add khớp regex cũ /\\/cart/', async ({ page }) => {
    await stub(page, { challengePost: true });
    await page.goto(`${ORIGIN}/band`);
    await page.getByTestId('featured-product-add').click({ timeout: 5000 });
    const passed = await page.waitForURL(/\/cart/, { timeout: 5000 }).then(() => true).catch(() => false);
    console.log(`[R7] ${test.info().project.name} regex cũ qua=${passed} url=${page.url()} title=${await page.title()}`);
  });
});
