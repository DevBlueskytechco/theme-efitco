// ES1-T217: tái lập nhóm D bằng JS, CSS thật của theme trên trang giả (route.fulfill, không cổng, không store).
// Thư viện partial là bản giả: chỉ dùng để phân biệt lỗi do code theme với lỗi môi trường, không thay CI.
// Chạy: npx playwright test --config=drafts/qa/ES1-T217/pw.repro.config.ts
import { readFileSync } from 'node:fs';
import { test, expect, type Page } from '@playwright/test';

const ORIGIN = 'http://stub.test';
const asset = (name: string) => readFileSync(`assets/${name}`, 'utf8');

const TOKENS = `:root{--page-width:91rem;--page-margin:20px;--header-height:80px;--space-1:4px;--space-2:8px;--space-3:12px;--space-4:16px;--space-5:24px;--space-6:32px;--space-7:48px;--space-8:120px;--radius-card:12px;--font-size-h1:48px;--font-size-base:16px;--font-size-sm:14px;--font-size-lg:18px;--font-size-display:96px;--color-background:#fff;--color-foreground:#111;--color-muted:#555;--color-accent:#d00;--color-border:#ccc;--color-background-sand-foreground:#111}`;

const PARTIAL_STUB = `
export const partials = {
  fetch: async (name, { url, signal }) => {
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error('http ' + res.status);
    return { html: await res.text() };
  },
  apply: async ({ html }) => {
    const host = document.querySelector('[data-partial-host]');
    host.innerHTML = html;
  },
};`;

const shell = (body: string) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>stub</title>
<style>${TOKENS}</style><link rel="stylesheet" href="/critical.css"><link rel="stylesheet" href="/base.css">
<script type="importmap">{"imports":{"@shopify/partial-rendering":"/partial-stub.js"}}</script></head><body><main>${body}</main></body></html>`;

const option = (step: number, tag: string, label: string) =>
  `<label class="quiz-option" data-testid="quiz-option"><input class="quiz-option__input" type="checkbox" name="filter.p.tag" value="${tag}" data-tag-handle="${tag}" data-testid="quiz-option-input"><span class="quiz-option__text"><span class="quiz-option__label">${label}</span></span></label>`;
const step = (n: number, tags: string[]) =>
  `<fieldset class="quiz-step" data-quiz-step="${n}" data-testid="quiz-step"><legend><span class="quiz-step__count" data-testid="quiz-step-progress">Step ${n} of 3</span><h3 tabindex="-1" data-quiz-title data-testid="quiz-step-title">Q${n}</h3></legend>${tags.map((t) => option(n, t, t)).join('')}</fieldset>`;

const QUIZ = `<quiz-finder class="quiz" data-results-url="/collections/all" data-results-view="quiz" data-label-results="%n products" data-testid="quiz">
<form action="/search" method="get" data-testid="quiz-form">
${step(1, ['quiz-upper', 'quiz-core', 'quiz-lower'])}${step(2, ['quiz-beginner', 'quiz-intermediate', 'quiz-advanced'])}${step(3, ['quiz-home', 'quiz-gym', 'quiz-outdoor'])}
<div class="quiz__actions"><button class="button quiz__back" type="button" hidden data-quiz-back data-testid="quiz-back">Back</button></div>
<div class="visually-hidden" role="status" data-quiz-status data-testid="quiz-status"></div>
</form>
<div class="quiz__results" hidden data-quiz-results-panel><h3 tabindex="-1" data-quiz-title>Results</h3>
<div data-partial-host><div class="quiz__results-body" data-quiz-count="0" data-testid="quiz-results"></div></div>
<div hidden data-quiz-empty data-testid="quiz-empty"><p>No match</p></div></div>
<script src="/quiz-finder.js" type="module"></script></quiz-finder>`;

const SCROLL = `<div class="block-container" data-testid="container-te15-five"><scroll-buttons class="collection-list full-width" data-testid="collection-list">
<div class="collection-list__header"><h2 class="collection-list__heading">Browse</h2><div class="collection-list__nav">
<button type="button" class="collection-list__button collection-list__button--prev" aria-label="Previous" data-scroll-prev data-testid="collection-list-prev">P</button>
<button type="button" class="collection-list__button collection-list__button--next" aria-label="Next" data-scroll-next data-testid="collection-list-next">N</button></div></div>
<ul class="collection-list__track" role="list" tabindex="0" aria-label="list" data-scroll-track data-testid="collection-list-track">
${[1, 2, 3, 4, 5].map((n) => `<li class="collection-card"><a class="collection-card__link" href="#${n}"><span class="collection-card__title">${n}</span></a></li>`).join('')}
</ul><script src="/scroll-buttons.js" type="module"></script></scroll-buttons></div>`;

const REVIEWS = `<div class="block-container block-container--cream" data-testid="container-home-testimonials"><div class="testimonials" data-testid="testimonials">
<div class="testimonials__header"><h2 class="testimonials__heading" data-testid="testimonials-heading">What Our Customers Say?</h2></div>
<ul class="testimonials__list" role="list" tabindex="0" data-testid="testimonials-list">${[1, 2, 3, 4].map((n) => `<li class="testimonial-item" data-testid="testimonial-item"><div class="testimonial-item__content">Review ${n}</div></li>`).join('')}</ul></div></div>`;

const VIDEO = (href: string, product: string) => `<ul data-testid="video-carousel"><li class="video-card-item"><video-card class="video-card" data-video-kind="shopify" data-label-error="Error" ${product ? `data-product-url="${product}"` : ''} data-testid="video-card">
<div class="video-card__frame" data-testid="video-card-frame"><a class="video-card__poster" href="${href}" data-video-poster data-testid="video-card-poster"><span class="visually-hidden" data-video-label>Play</span></a>
<template data-video-template><video class="video-card__media" controls playsinline preload="metadata" aria-label="Demo"><source src="https://cdn.shopify.com/videos/c/vp/es1-t158/fake.mp4" type="video/mp4"></video></template></div>
</video-card><script src="/video-carousel.js" type="module"></script></li></ul>`;

const PAGES: Record<string, string> = {
  '/quiz': QUIZ,
  '/scroll': SCROLL,
  '/reviews': REVIEWS,
  '/video-product': VIDEO('/products/x', '/products/x'),
  '/video-none': VIDEO('https://www.youtube.com/watch?v=a', ''),
  '/nojs': `<select data-testid="select"><option value="1">a</option><option value="2">b</option><option value="3" disabled>c</option></select>`,
};

async function stub(page: Page, results: Record<string, string> = {}) {
  const js = (body: string) => ({ status: 200, contentType: 'text/javascript', body });
  await page.route(`${ORIGIN}/**`, async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    if (path === '/partial-stub.js') return route.fulfill(js(PARTIAL_STUB));
    if (path.endsWith('.js')) return route.fulfill(js(asset(path.slice(1))));
    if (path.endsWith('.css')) return route.fulfill({ status: 200, contentType: 'text/css', body: asset(path.slice(1)) });
    if (PAGES[path]) return route.fulfill({ status: 200, contentType: 'text/html', body: shell(PAGES[path]) });
    if (path.startsWith('/collections/')) return route.fulfill({ status: 200, contentType: 'text/html', body: results[path] ?? '<div class="quiz__results-body" data-quiz-count="0" data-testid="quiz-results"></div>' });
    return route.fulfill({ status: 404, body: '' });
  });
}

const tid = (page: Page, id: string) => page.getByTestId(id);
const stepEl = (page: Page, n: number) => page.locator(`[data-quiz-step="${n}"]`);
const input = (page: Page, tag: string) => page.locator(`input[value="${tag}"]`);

async function openQuiz(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await stub(page);
  await page.goto(`${ORIGIN}/quiz`);
  await expect(tid(page, 'quiz')).toHaveAttribute('data-enhanced', '');
  return errors;
}

test.describe('T139 quiz-finder.js thật', () => {
  test('R1 Back khi đang tải: phải về bước 2, không pageerror', async ({ page }) => {
    const errors = await openQuiz(page);
    await page.route(/view=quiz/, () => {});
    await input(page, 'quiz-lower').check();
    await input(page, 'quiz-advanced').check();
    await input(page, 'quiz-gym').check();
    await expect(page.locator('[data-quiz-results-panel]')).toHaveAttribute('aria-busy', 'true');
    await tid(page, 'quiz-back').click();
    await page.waitForTimeout(300);
    const active = await page.locator('[data-quiz-step][data-active]').getAttribute('data-quiz-step');
    console.log(`[R1] bước đang mở: ${active}; pageerror: ${JSON.stringify(errors)}`);
    expect({ active, errors }).toEqual({ active: '2', errors: [] });
  });

  test('R2 đổi đáp án bước cuối khi đang tải: request mới chạy, hết aria-busy', async ({ page }) => {
    const errors = await openQuiz(page);
    const sent: string[] = [];
    page.on('request', (r) => { if (r.url().includes('view=quiz')) sent.push(r.url()); });
    await page.route(/quiz-home.*view=quiz/, () => {});
    await input(page, 'quiz-lower').check();
    await input(page, 'quiz-advanced').check();
    await input(page, 'quiz-home').check();
    await expect(page.locator('[data-quiz-results-panel]')).toHaveAttribute('aria-busy', 'true');
    await input(page, 'quiz-gym').check();
    await page.waitForTimeout(500);
    const busy = await page.locator('[data-quiz-results-panel]').getAttribute('aria-busy');
    const gym = sent.filter((u) => u.includes('quiz-gym')).length;
    console.log(`[R2] request quiz-gym: ${gym}; aria-busy: ${busy}; pageerror: ${JSON.stringify(errors)}`);
    expect({ gym, busy, errors }).toEqual({ gym: 1, busy: null, errors: [] });
  });

  test('R3 double click: 1 bước, không chọn hộ, focus ở tiêu đề', async ({ page }) => {
    await openQuiz(page);
    await stepEl(page, 1).getByTestId('quiz-option').first().dblclick();
    const active = await page.locator('[data-quiz-step][data-active]').getAttribute('data-quiz-step');
    const checked = await stepEl(page, 2).locator('input:checked').count();
    const focus = await page.evaluate(() => { const a = document.activeElement!; return `${a.tagName}${a.hasAttribute('data-quiz-title') ? '[title]' : ''}${(a as HTMLInputElement).value ? `=${(a as HTMLInputElement).value}` : ''}`; });
    console.log(`[R3] bước: ${active}; đã chọn ở bước 2: ${checked}; focus: ${focus}`);
    expect({ active, checked }).toEqual({ active: '2', checked: 0 });
    expect(focus).toBe('H3[title]');
  });
});

test.describe('T185 scroll-buttons.js thật', () => {
  test('R4 nút focus bị ẩn: focus sang nút kia ở cả 2 đầu', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 900 });
    await stub(page);
    await page.goto(`${ORIGIN}/scroll`);
    const prev = tid(page, 'collection-list-prev');
    const next = tid(page, 'collection-list-next');
    const track = tid(page, 'collection-list-track');
    await expect(page.locator('scroll-buttons')).toHaveAttribute('data-enhanced', '');
    const left = () => track.evaluate((el) => el.scrollLeft);
    const info = await track.evaluate((el) => ({ max: el.scrollWidth - el.clientWidth, step: el.children[0].getBoundingClientRect().width + parseFloat(getComputedStyle(el).columnGap), offset: (el.children[1] as HTMLElement).offsetLeft - (el.children[0] as HTMLElement).offsetLeft }));
    console.log(`[R4] ${JSON.stringify(info)}`);
    await next.click();
    await expect.poll(left).toBeGreaterThan(0);
    await prev.focus();
    await page.keyboard.press('Enter');
    await expect(prev).toBeHidden();
    await expect(next).toBeFocused();
    const seen: number[] = [];
    for (let i = 1; i <= Math.ceil(info.max / info.step); i += 1) {
      await next.focus();
      await page.keyboard.press('Enter');
      await expect.poll(left).toBeCloseTo(Math.min(info.step * i, info.max), 0);
      seen.push(await left());
    }
    console.log(`[R4] vị trí: ${JSON.stringify(seen)}`);
    await expect(next).toBeHidden();
    await expect(prev).toBeFocused();
  });
});

test.describe('T185 chẩn đoán', () => {
  test('R4b nhật ký focus khi nút prev tự ẩn', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 900 });
    await stub(page);
    await page.goto(`${ORIGIN}/scroll`);
    await expect(page.locator('scroll-buttons')).toHaveAttribute('data-enhanced', '');
    const prev = tid(page, 'collection-list-prev');
    const next = tid(page, 'collection-list-next');
    const track = tid(page, 'collection-list-track');
    await next.click();
    await expect.poll(() => track.evaluate((el) => el.scrollLeft)).toBeCloseTo(360, 0);
    await page.evaluate(() => {
      const log: string[] = [];
      (window as unknown as { __log: string[] }).__log = log;
      const name = (el: EventTarget | null) => (el as HTMLElement | null)?.dataset?.testid ?? (el as Element | null)?.tagName ?? 'null';
      for (const t of ['focusin', 'focusout']) document.addEventListener(t, (e) => log.push(`${t}:${name(e.target)}`), true);
      const track = document.querySelector('[data-scroll-track]')!;
      track.addEventListener('scroll', () => log.push(`scroll:${track.scrollLeft} active=${name(document.activeElement)} prevHidden=${(document.querySelector('[data-scroll-prev]') as HTMLElement).hidden}`));
    });
    await prev.focus();
    await page.keyboard.press('Enter');
    await expect(prev).toBeHidden();
    await page.waitForTimeout(800);
    const out = await page.evaluate(() => ({ log: (window as unknown as { __log: string[] }).__log.slice(-12), active: (document.activeElement as HTMLElement)?.dataset?.testid ?? document.activeElement?.tagName, hasFocus: document.hasFocus() }));
    console.log(`[R4b] ${test.info().project.name} ${JSON.stringify(out, null, 1)}`);
    expect(out.active).toBe('collection-list-next');
    await expect(next).toBeFocused();
  });
});

test.describe('T179 CSS thật', () => {
  test('R5 1920: đo card', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await stub(page);
    await page.goto(`${ORIGIN}/reviews`);
    const cards = tid(page, 'testimonial-item');
    const raw = await cards.evaluateAll((els) => els.map((el) => { const b = el.getBoundingClientRect(); return { w: b.width, l: b.left }; }));
    const heading = await tid(page, 'testimonials-heading').evaluate((el) => el.getBoundingClientRect().left);
    const list = await tid(page, 'testimonials-list').evaluate((el) => ({ right: el.getBoundingClientRect().right, scrollable: el.scrollWidth > el.clientWidth }));
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    console.log(`[R5] ${test.info().project.name} ${JSON.stringify({ raw, heading, list, overflow })}`);
    expect(raw.map((c) => Math.round(c.w))).toEqual([456, 456, 456, 456]);
    expect(Math.round(raw[1].l - raw[0].l)).toBe(480);
    expect(Math.abs(raw[0].l - heading)).toBeLessThanOrEqual(1);
    expect(list.scrollable).toBe(true);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('R6 1280: lưới 4 cột, không cuộn', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await stub(page);
    await page.goto(`${ORIGIN}/reviews`);
    const state = await tid(page, 'testimonials-list').evaluate((el) => ({ columns: getComputedStyle(el).gridTemplateColumns.trim().split(/\s+/).length, display: getComputedStyle(el).display, scrollable: el.scrollWidth > el.clientWidth }));
    console.log(`[R6] ${test.info().project.name} ${JSON.stringify(state)}`);
    expect(state).toEqual({ columns: 4, display: 'grid', scrollable: false });
  });
});

test.describe('T158 video-carousel.js thật', () => {
  for (const [name, path, want] of [['có product', '/video-product', '/products/x'], ['không product', '/video-none', 'https://www.youtube.com/watch?v=a']] as const) {
    test(`R7 lỗi video, ${name}: data-video-error, giữ poster, href đúng`, async ({ page }) => {
      await stub(page);
      await page.route('https://cdn.shopify.com/videos/**', (route) => route.abort());
      await page.goto(`${ORIGIN}${path}`);
      const card = tid(page, 'video-card');
      await expect(card).toHaveAttribute('data-video-error', '', { timeout: 5000 });
      await expect(card.locator('video')).toHaveCount(0);
      await expect(tid(page, 'video-card-poster')).toHaveAttribute('href', want);
      await expect(tid(page, 'video-card-poster').locator('[data-video-label]')).toHaveText('Error');
    });
  }
});

test.describe('T156 nojs', () => {
  test.use({ javaScriptEnabled: false });

  test('R8 evaluateAll trong trang tắt JS: treo tới timeout', async ({ page }) => {
    await stub(page);
    await page.goto(`${ORIGIN}/nojs`);
    const result = await Promise.race([
      tid(page, 'select').locator('option:not([disabled])').evaluateAll((els) => els.map((el) => (el as HTMLOptionElement).value)).then((v) => `trả ${JSON.stringify(v)}`).catch((e) => `lỗi ${String(e).slice(0, 80)}`),
      new Promise<string>((r) => setTimeout(() => r('treo sau 5 s'), 5000)),
    ]);
    console.log(`[R8] evaluateAll: ${result}`);
    const options = tid(page, 'select').locator('option:not([disabled])');
    const values = [];
    for (let i = 0; i < (await options.count()); i += 1) values.push(await options.nth(i).getAttribute('value'));
    console.log(`[R8] getAttribute: ${JSON.stringify(values)}`);
    expect(values).toEqual(['1', '2']);
  });
});
