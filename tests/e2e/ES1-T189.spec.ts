// KHÔNG CHẮC: spec chưa chạy, chưa type-check (phiên viết không có trình duyệt và preview; CTO 06/11: e2e tắt tới khi trang chủ xong).
// Ticket ES1-T189 TE-3-BE3: assets/collection-tabs.js qua lazy-module (docs/srs.md AC-H11, AC-H12 phần JS; plan ES1-T169 D6).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T189.spec.ts tests/e2e/ES1-T188.spec.ts tests/e2e/TE-3.spec.ts
// 4 tab trên /?view=figma cần figma-tab-* (ES1-T178): thiếu thì skip có lý do.
// Tab rỗng: bảng dữ liệu không bảo đảm có collection rỗng, nên test thay nội dung template bằng đúng markup thông báo của block rồi mới chọn tab.
import { readFileSync, statSync } from 'node:fs';
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { expectNotChallenged } from './support/store-guard';
import { watchShopPay403 } from './support/console-guard';

const FIGMA = '/?view=figma';
const JS_FILE = 'assets/collection-tabs.js';
const LIQUID_FILE = 'blocks/featured-collection.liquid';
const MODULE = /\/collection-tabs\.js/;
const SWATCH = 'input[type="radio"][data-variant-id]';
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];
// Fetch nền của Shopify, không do theme gọi khi đổi tab.
const IGNORE_REQUEST = /shopifycloud|monorail|web-pixels|trekkie|shop\.app|\.well-known\/shopify|\/api\/collect|\/cdn-cgi\//i;

const T = {
  block: 'featured-collection',
  tabs: 'featured-collection-tabs',
  tab: 'featured-collection-tab',
  panel: 'featured-collection-panel',
  grid: 'featured-collection-grid',
  empty: 'featured-collection-tab-empty',
  card: 'product-card',
  swatch: 'product-card-swatch',
};

const block = (page: Page) => page.getByTestId(T.block);
const tab = (page: Page, i: number) => block(page).getByTestId(T.tab).nth(i);
const panel = (page: Page, i: number) => block(page).getByTestId(T.panel).nth(i);

async function goToFigma(page: Page) {
  const res = await page.goto(FIGMA);
  expect(res?.status(), `HTTP ${FIGMA}`).toBeLessThan(400);
  const count = await block(page).getByTestId(T.tab).count();
  test.skip(count < 4, `Chỉ có ${count} tab: thiếu collection figma-tab-* (ES1-T178)`);
}

/** Mở trang và chờ module nâng cấp. Module chỉ nạp khi block gần viewport nên phải cuộn tới. */
async function open(page: Page) {
  await goToFigma(page);
  await block(page).getByTestId(T.tabs).scrollIntoViewIfNeeded();
  await expect(block(page).getByTestId(T.tabs)).toHaveAttribute('role', 'tablist');
}

/** Tab i đang chọn: đúng 1 tab aria-selected, đúng 1 tab trong tab order, đúng panel i hiện. */
async function expectSelected(page: Page, i: number) {
  const tabs = block(page).getByTestId(T.tab);
  const panels = block(page).getByTestId(T.panel);
  const count = await tabs.count();
  for (let n = 0; n < count; n++) {
    await expect(tabs.nth(n)).toHaveAttribute('aria-selected', n === i ? 'true' : 'false');
    await expect(tabs.nth(n)).toHaveAttribute('tabindex', n === i ? '0' : '-1');
    if (n === i) await expect(panels.nth(n)).toBeVisible();
    else await expect(panels.nth(n)).toBeHidden();
  }
}

/** Thay nội dung template tab i (đếm từ 0, i >= 1) bằng thông báo rỗng, phải gọi trước khi chọn tab. */
async function makeTabEmpty(page: Page, i: number) {
  const message = JSON.parse(readFileSync('locales/en.default.json', 'utf8')).blocks.featured_collection.tab_empty;
  await panel(page, i).evaluate(
    (el, { testid, text }) => {
      const template = el.querySelector('template[data-tab-panel-template]') as HTMLTemplateElement;
      const p = document.createElement('p');
      p.className = 'featured-collection__empty';
      p.dataset.tabEmpty = '';
      p.dataset.testid = testid;
      p.textContent = text;
      template.content.replaceChildren(p);
    },
    { testid: T.empty, text: message as string }
  );
  return message as string;
}

function watchConsole(page: Page) {
  const errors: string[] = [];
  const isShopPay403 = watchShopPay403(page);
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    if (isShopPay403(msg)) return;
    if (IGNORE_CONSOLE.some((r) => r.test(msg.text()) || r.test(msg.location().url))) return;
    errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

async function expectNoSeriousAxe(page: Page) {
  await expectNotChallenged(page);
  const { violations } = await new AxeBuilder({ page }).include(`[data-testid="${T.block}"]`).analyze();
  const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(serious.map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
}

test.describe('ES1-T189 tĩnh', () => {
  test('trần 1536 B, không fetch, không innerHTML, hook khớp giữa Liquid và JS', ({}, ti) => {
    test.skip(ti.project.name !== 'desktop', 'static, chạy 1 lần ở desktop');
    expect(statSync(JS_FILE).size).toBeLessThanOrEqual(1536);
    const js = readFileSync(JS_FILE, 'utf8');
    // ES1-T217: kiểm code, không kiểm comment: dòng 1 của file ghi "no fetch". Chỉ bỏ dòng comment nguyên dòng, không đụng chuỗi.
    const code = js.replace(/^\s*\/\/.*$/gm, '');
    expect(code).not.toMatch(/fetch|XMLHttpRequest|partials|innerHTML|insertAdjacentHTML|console\./);
    const liquid = readFileSync(LIQUID_FILE, 'utf8');
    expect(js).toContain('"collection-tabs"');
    expect(liquid).toContain('<collection-tabs');
    const hooks: [string, string][] = [
      ['[data-tab-list]', 'data-tab-list'],
      ['[data-tab]', 'data-tab="{{ tab_count }}"'],
      ['[data-tab-panel="', 'data-tab-panel="{{ tab_count }}"'],
      ['[data-tab-panel-template]', 'data-tab-panel-template="{{ tab_count }}"'],
      ['[data-tab-empty]', 'data-tab-empty'],
    ];
    for (const [inJs, inLiquid] of hooks) {
      expect(js, `JS dùng ${inJs}`).toContain(inJs);
      expect(liquid, `Liquid có ${inLiquid}`).toContain(inLiquid);
    }
    expect(liquid).toContain(`data-lazy-module="{{ 'collection-tabs.js' | asset_url }}"`);
  });

  test('block chỉ có thẻ script lazy-module và product-swatch', ({}, ti) => {
    test.skip(ti.project.name !== 'desktop', 'static, chạy 1 lần ở desktop');
    const scripts = readFileSync(LIQUID_FILE, 'utf8').match(/<script[^>]*>/g);
    expect(scripts?.sort()).toEqual([
      `<script src="{{ 'lazy-module.js' | asset_url }}" type="module">`,
      `<script src="{{ 'product-swatch.js' | asset_url }}" type="module">`,
    ]);
  });
});

test.describe('ES1-T189 nâng cấp', () => {
  test('link thành tablist: role, aria-controls, aria-labelledby, gỡ aria-current, href giữ nguyên', async ({ page }) => {
    await open(page);
    const list = block(page).getByTestId(T.tabs);
    await expect(list).toHaveAttribute('aria-label', /.+/);
    await expectSelected(page, 0);
    await expect(block(page).locator('[data-tab][aria-current]')).toHaveCount(0);
    for (let i = 0; i < 4; i++) {
      const t = tab(page, i);
      const p = panel(page, i);
      await expect(t).toHaveAttribute('role', 'tab');
      await expect(t).toHaveAttribute('href', /\/collections\//);
      await expect(t).toHaveAttribute('aria-controls', (await p.getAttribute('id'))!);
      await expect(p).toHaveAttribute('role', 'tabpanel');
      await expect(p).toHaveAttribute('aria-labelledby', (await t.getAttribute('id'))!);
    }
  });

  test('CLS: tab và lưới không dịch khi module nâng cấp', async ({ page }) => {
    let release = () => {};
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route(MODULE, async (route) => {
      await held;
      await route.continue();
    });
    await goToFigma(page);
    const list = block(page).getByTestId(T.tabs);
    await list.scrollIntoViewIfNeeded();
    await expect(list).toHaveAttribute('role', 'group');
    const before = [await list.boundingBox(), await panel(page, 0).boundingBox()];
    release();
    await expect(list).toHaveAttribute('role', 'tablist');
    expect([await list.boundingBox(), await panel(page, 0).boundingBox()]).toEqual(before);
  });

  test('không tải file khi block còn xa viewport', async ({ page }) => {
    const loaded: string[] = [];
    page.on('request', (r) => {
      if (MODULE.test(r.url())) loaded.push(r.url());
    });
    await page.route(/view=figma/, async (route) => {
      if (route.request().resourceType() !== 'document') return route.fallback();
      const response = await route.fetch();
      const body = (await response.text()).replace('</head>', '<style>[data-testid="featured-collection"]{margin-block-start:2000vh}</style></head>');
      await route.fulfill({ response, body });
    });
    await goToFigma(page);
    await page.waitForLoadState('load');
    expect(loaded).toEqual([]);
    await block(page).getByTestId(T.tabs).scrollIntoViewIfNeeded();
    await expect.poll(() => loaded.length).toBeGreaterThan(0);
  });
});

test.describe('ES1-T189 đổi tab', () => {
  test('bấm: không reload, không đổi URL, 0 fetch, xhr, lưới đổi đúng tab', async ({ page }) => {
    await open(page);
    await page.waitForLoadState('load');
    await page.evaluate(() => {
      (window as unknown as { __noReload: boolean }).__noReload = true;
    });
    const url = page.url();
    const requests: string[] = [];
    page.on('request', (r) => {
      if ((r.resourceType() === 'fetch' || r.resourceType() === 'xhr') && !IGNORE_REQUEST.test(r.url())) requests.push(r.url());
      if (r.resourceType() === 'document') requests.push(`document: ${r.url()}`);
    });

    for (const i of [1, 2, 3, 0]) {
      await tab(page, i).click();
      await expectSelected(page, i);
    }

    expect(await page.evaluate(() => (window as unknown as { __noReload?: boolean }).__noReload)).toBe(true);
    expect(page.url()).toBe(url);
    expect(requests).toEqual([]);
  });

  test('mỗi tab clone 1 lần: mở lại không nhân đôi card, template đã thay bằng nội dung', async ({ page }) => {
    await open(page);
    const expected = await panel(page, 1).evaluate(
      (el) => (el.querySelector('template[data-tab-panel-template]') as HTMLTemplateElement).content.querySelectorAll('[data-testid="product-card"]').length
    );
    await tab(page, 1).click();
    await expect(panel(page, 1).getByTestId(T.card)).toHaveCount(expected);
    await tab(page, 0).click();
    await tab(page, 1).click();
    await expect(panel(page, 1).getByTestId(T.card)).toHaveCount(expected);
    await expect(panel(page, 1).locator('template[data-tab-panel-template]')).toHaveCount(0);
    // Tab chưa chọn vẫn chưa clone.
    await expect(panel(page, 2).locator('template[data-tab-panel-template]')).toHaveCount(1);
    await expect(panel(page, 2).getByTestId(T.card)).toHaveCount(0);
  });

  test('id không trùng sau khi clone hết', async ({ page }) => {
    await open(page);
    for (const i of [1, 2, 3]) await tab(page, i).click();
    const dup = await block(page).evaluate((el) => {
      const ids = [...el.querySelectorAll('[id]')].map((n) => n.id);
      return ids.filter((id, i) => ids.indexOf(id) !== i);
    });
    expect(dup).toEqual([]);
  });

  test('phím bổ trợ: link chạy như thường, không đổi tab', async ({ page }) => {
    await open(page);
    // Đọc defaultPrevented ở window rồi tự chặn, để test không mở cửa sổ mới.
    const prevented = await tab(page, 1).evaluate((el) => {
      const seen: boolean[] = [];
      const spy = (e: Event) => {
        seen.push(e.defaultPrevented);
        e.preventDefault();
      };
      window.addEventListener('click', spy);
      for (const mod of ['ctrlKey', 'metaKey', 'shiftKey']) {
        el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, [mod]: true }));
      }
      window.removeEventListener('click', spy);
      return seen;
    });
    expect(prevented).toEqual([false, false, false]);
    await expectSelected(page, 0);
  });

  test('gỡ khỏi DOM rồi gắn lại: 1 lần bấm đổi đúng 1 tab, không nhân đôi card', async ({ page }) => {
    await open(page);
    await tab(page, 1).click();
    const cards = await panel(page, 1).getByTestId(T.card).count();
    await block(page).evaluate((el) => {
      const root = el.querySelector('collection-tabs')!;
      el.append(root);
    });
    await tab(page, 1).click();
    await expectSelected(page, 1);
    await expect(panel(page, 1).getByTestId(T.card)).toHaveCount(cards);
  });
});

test.describe('ES1-T189 bàn phím', () => {
  test('mũi tên phải, trái, vòng 2 đầu, Home, End: đổi tab, focus đi theo', async ({ page }) => {
    await open(page);
    await tab(page, 0).focus();

    const steps: [string, number][] = [
      ['ArrowRight', 1],
      ['ArrowRight', 2],
      ['ArrowLeft', 1],
      ['End', 3],
      ['ArrowRight', 0],
      ['ArrowLeft', 3],
      ['Home', 0],
    ];
    for (const [key, expected] of steps) {
      await page.keyboard.press(key);
      await expect(tab(page, expected), `${key} tới tab ${expected}`).toBeFocused();
      await expectSelected(page, expected);
    }
  });

  test('Alt+mũi tên không bị chặn, không đổi tab', async ({ page }) => {
    await open(page);
    const prevented = await tab(page, 0).evaluate((el) => {
      const e = new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true, bubbles: true, cancelable: true });
      el.dispatchEvent(e);
      return e.defaultPrevented;
    });
    expect(prevented).toBe(false);
    await expectSelected(page, 0);
  });

  test('Enter và Space trên tab đang focus: không điều hướng, không cuộn trang', async ({ page }) => {
    await open(page);
    const url = page.url();
    await tab(page, 0).focus();
    const scrollY = await page.evaluate(() => window.scrollY);
    await page.keyboard.press('Space');
    await page.keyboard.press('Enter');
    await expectSelected(page, 0);
    expect(page.url()).toBe(url);
    expect(await page.evaluate(() => window.scrollY)).toBe(scrollY);
  });

  test('Tab rời hàng tab: tab chưa chọn không nằm trong tab order', async ({ page }) => {
    await open(page);
    await tab(page, 0).focus();
    await page.keyboard.press('Tab');
    const inList = await page.evaluate(() => document.activeElement?.closest('[data-tab-list]') !== null);
    expect(inList).toBe(false);
  });
});

test.describe('ES1-T189 tab rỗng', () => {
  test('hiện thông báo, 0 card của tab trước, panel focus được', async ({ page }) => {
    await open(page);
    const message = await makeTabEmpty(page, 2);
    await tab(page, 2).click();
    await expectSelected(page, 2);
    await expect(panel(page, 2).getByTestId(T.empty)).toHaveText(message);
    await expect(panel(page, 2)).toHaveAttribute('tabindex', '0');
    await expect(panel(page, 2).getByTestId(T.card)).toHaveCount(0);
    await expect(block(page).getByTestId(T.card).locator('visible=true')).toHaveCount(0);

    await tab(page, 0).click();
    await expectSelected(page, 0);
    await expect(block(page).getByTestId(T.empty).locator('visible=true')).toHaveCount(0);
    await expect(panel(page, 0).getByTestId(T.card).first()).toBeVisible();
  });
});

test.describe('ES1-T189 swatch sau clone', () => {
  test('card clone được nâng cấp, chọn màu đổi link card, không reload', async ({ page }) => {
    await open(page);
    let found = -1;
    for (const i of [1, 2, 3]) {
      await tab(page, i).click();
      await expect(panel(page, i).locator('product-swatch:not(:defined)')).toHaveCount(0);
      if (found < 0 && (await panel(page, i).locator(`product-swatch:has(${SWATCH}:nth-of-type(2))`).count())) found = i;
    }
    test.skip(found < 0, 'Không có card nhiều màu trong tab 2 đến 4 (dữ liệu ES1-T178)');

    await tab(page, found).click();
    const card = panel(page, found).locator(`product-swatch:has(${SWATCH}:nth-of-type(2))`).first();
    await card.scrollIntoViewIfNeeded();
    const radios = card.locator(SWATCH);
    const count = await radios.count();
    const checked = await radios.evaluateAll((els) => els.findIndex((e) => (e as HTMLInputElement).checked));
    const target = (checked + 1) % count;
    const variantUrl = await radios.nth(target).getAttribute('data-variant-url');
    const url = page.url();

    await card.getByTestId(T.swatch).nth(target).click();
    await expect(radios.nth(target)).toBeChecked();
    await expect(card.locator('a[data-card-link]').first()).toHaveAttribute('href', variantUrl!);
    expect(page.url()).toBe(url);
  });
});

test.describe('ES1-T189 thiếu file JS', () => {
  test('chặn file: không nâng cấp, tab vẫn là link tới collection', async ({ page }) => {
    await page.route(MODULE, (route) => route.abort());
    await goToFigma(page);
    await block(page).getByTestId(T.tabs).scrollIntoViewIfNeeded();
    await page.waitForLoadState('load');
    await expect(block(page).getByTestId(T.tabs)).toHaveAttribute('role', 'group');
    await expect(tab(page, 0)).toHaveAttribute('aria-current', 'true');
    await expect(tab(page, 1)).not.toHaveAttribute('role', 'tab');
    await expect(panel(page, 0)).toBeVisible();
    await tab(page, 1).click();
    await page.waitForURL(/\/collections\/figma-tab-weight/);
  });
});

test.describe('ES1-T189 chất lượng', () => {
  test('axe 0 serious ở tab 1, tab khác, tab rỗng; 0 console error, 0 pageerror', async ({ page }) => {
    const errors = watchConsole(page);
    await open(page);
    await expectNoSeriousAxe(page);

    await tab(page, 1).click();
    await expectSelected(page, 1);
    await expectNoSeriousAxe(page);

    await makeTabEmpty(page, 3);
    await tab(page, 3).click();
    await expectSelected(page, 3);
    await expectNoSeriousAxe(page);

    expect(errors).toEqual([]);
  });
});
