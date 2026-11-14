// KHÔNG CHẮC: spec chưa chạy, chưa type-check (phiên viết không có trình duyệt, preview; chờ CI).
// Ticket ES1-T335 TE-7-R2-BE1: assets/scroll-buttons.js 768 → ≤ 1 536 B (ADR 0010, trả lời ES1-T209). AC: TE-7 AC1, AC6.
// - data-static khi scrollWidth ≤ clientWidth (ResizeObserver), CSS ẩn nút + tiến trình (ES1-T334).
// - Nút đầu/cuối aria-disabled="true", giữ chỗ (sổ 10/11 câu 5); nút đang focus bị tắt: focus sang nút kia,
//   hàng thành data-static: focus về khung cuộn.
// - Listener qua AbortController, scroll passive; RTL (scrollLeft âm).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T335.spec.ts tests/e2e/ES1-T185.spec.ts tests/e2e/ES1-T220.spec.ts
// Dữ liệu: /?view=te15 (te15-five 5 card tràn ở 1024, te15-one 1 card vừa khung), giống ES1-T185.
import { readFileSync, statSync } from 'node:fs';
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { expectNotChallenged } from './support/store-guard';
import { watchShopPay403 } from './support/console-guard';

const TE15 = '/?view=te15';
const JS_FILE = 'assets/scroll-buttons.js';
const ROW_BLOCKS = ['collection-list', 'testimonials', 'video-carousel', 'blog-posts'];
const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\.app|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];

const band = (page: Page, id: string) => page.getByTestId(`container-${id}`);
const rootOf = (page: Page, id: string) => band(page, id).locator('scroll-buttons');
const trackOf = (page: Page, id: string) => band(page, id).getByTestId('collection-list-track');
const prevOf = (page: Page, id: string) => band(page, id).getByTestId('collection-list-prev');
const nextOf = (page: Page, id: string) => band(page, id).getByTestId('collection-list-next');
type Loc = ReturnType<typeof prevOf>;
const off = (button: Loc) => expect(button).toHaveAttribute('aria-disabled', 'true');
const on = (button: Loc) => expect(button).toHaveAttribute('aria-disabled', 'false');

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

async function open(page: Page, width = 1024) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(TE15);
  await expect(rootOf(page, 'te15-five')).toHaveAttribute('data-enhanced', '');
  await expect(rootOf(page, 'te15-one')).toHaveAttribute('data-enhanced', '');
}

/** Ghi lại listener gắn lên khung cuộn và nút: loại sự kiện, passive, signal. */
async function recordListeners(page: Page) {
  await page.addInitScript(() => {
    const log: { type: string; passive: boolean; signal: AbortSignal | null; hook: string }[] = [];
    (window as unknown as { __listeners: typeof log }).__listeners = log;
    const original = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (this: EventTarget, type: string, fn: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions) {
      const el = this as HTMLElement;
      const hook = el.dataset ? Object.keys(el.dataset).find((k) => /^scroll(Track|Prev|Next)$/.test(k)) : undefined;
      if (hook && el.closest?.('scroll-buttons')) {
        const o = typeof options === 'object' ? options : {};
        log.push({ type, passive: !!o.passive, signal: o.signal ?? null, hook });
      }
      return original.call(this, type, fn, options);
    } as typeof EventTarget.prototype.addEventListener;
  });
}

test.describe('ES1-T335 tĩnh', () => {
  test('trần 1 536 B, không fetch, không console, có AbortController, scroll passive, không gán hidden', () => {
    expect(statSync(JS_FILE).size).toBeLessThanOrEqual(1536);
    const js = readFileSync(JS_FILE, 'utf8');
    expect(js).not.toMatch(/fetch|partials|console\.|\.hidden\s*=|\bon(scroll|click)\s*=/);
    expect(js).toContain('new AbortController()');
    expect(js).toMatch(/addEventListener\("scroll", \w+, \{ signal, passive: true \}\)/);
    expect(js).toContain('"data-static"');
    expect(js).toContain('ariaDisabled');
    expect(js).toContain('customElements.get("scroll-buttons")');
  });

  test('4 hàng ngang dùng chung hook: scroll-buttons, data-scroll-track/prev/next, lazy-module trỏ scroll-buttons.js', () => {
    const nav = readFileSync('snippets/carousel-nav.liquid', 'utf8');
    expect(nav).toContain('data-scroll-prev');
    expect(nav).toContain('data-scroll-next');
    for (const name of ROW_BLOCKS) {
      const liquid = readFileSync(`blocks/${name}.liquid`, 'utf8');
      expect(liquid, name).toContain('<scroll-buttons');
      expect(liquid, name).toContain('data-scroll-track');
      expect(liquid, name).toContain(`data-lazy-module="{{ 'scroll-buttons.js' | asset_url }}"`);
      expect(liquid, name).toContain("render 'carousel-nav'");
      expect(liquid, name).toContain("render 'carousel-progress'");
    }
  });
});

test.describe('ES1-T335 data-static', () => {
  test('hàng tràn không có data-static, hàng vừa khung có; tiến trình theo đó', async ({ page }) => {
    await open(page);
    await expect(rootOf(page, 'te15-five')).not.toHaveAttribute('data-static', '');
    await expect(rootOf(page, 'te15-one')).toHaveAttribute('data-static', '');
    await expect(band(page, 'te15-one').getByTestId('carousel-progress')).toBeHidden();
    await expect(prevOf(page, 'te15-one')).toBeHidden();
    await expect(nextOf(page, 'te15-one')).toBeHidden();
    await expect(band(page, 'te15-five').getByTestId('carousel-progress')).toBeVisible();
  });

  test('khung cuộn hẹp lại (ResizeObserver): hàng 1 card hết data-static, next bật', async ({ page }) => {
    await open(page);
    await trackOf(page, 'te15-one').evaluate((el) => (el.style.inlineSize = '120px'));
    await expect(rootOf(page, 'te15-one')).not.toHaveAttribute('data-static', '');
    await on(nextOf(page, 'te15-one'));
    await off(prevOf(page, 'te15-one'));
    await trackOf(page, 'te15-one').evaluate((el) => (el.style.inlineSize = ''));
    await expect(rootOf(page, 'te15-one')).toHaveAttribute('data-static', '');
  });

  test('nút đang focus, hàng thành vừa khung: focus về khung cuộn, không rơi về body', async ({ page }) => {
    await open(page);
    await nextOf(page, 'te15-five').focus();
    await band(page, 'te15-five').evaluate((el) => {
      const style = document.createElement('style');
      style.textContent = '[data-testid="container-te15-five"] [data-testid="collection-card"] { flex-basis: 8px !important; }';
      document.head.append(style);
      // Đổi bề khung để ResizeObserver chạy sau khi card thu nhỏ
      const track = el.querySelector<HTMLElement>('[data-scroll-track]')!;
      track.style.inlineSize = `${track.clientWidth - 2}px`;
    });
    await expect(rootOf(page, 'te15-five')).toHaveAttribute('data-static', '');
    await expect(trackOf(page, 'te15-five')).toBeFocused();
  });
});

test.describe('ES1-T335 nút đầu/cuối', () => {
  test('nút tắt vẫn hiện, mờ 0.35, vẫn có tên; đầu/cuối không đổi kích thước nút', async ({ page }) => {
    await open(page);
    const prev = prevOf(page, 'te15-five');
    await off(prev);
    await expect(prev).toBeVisible();
    await expect(prev).toHaveCSS('opacity', '0.35');
    await expect(prev).toHaveAccessibleName(/.+/);
    await expect(prev).not.toHaveAttribute('hidden', '');
    await on(nextOf(page, 'te15-five'));
  });

  test('Enter trên nút tắt không cuộn, focus giữ nguyên', async ({ page }) => {
    await open(page);
    const prev = prevOf(page, 'te15-five');
    await off(prev);
    await prev.focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    expect(await trackOf(page, 'te15-five').evaluate((el) => el.scrollLeft)).toBe(0);
    await expect(prev).toBeFocused();
  });
});

test.describe('ES1-T335 listener', () => {
  test('scroll passive, mọi listener có signal; gỡ khỏi DOM thì signal huỷ; gắn lại chạy lại 1 lần', async ({ page }) => {
    await recordListeners(page);
    await open(page);
    const read = () =>
      page.evaluate(() =>
        (window as unknown as { __listeners: { type: string; passive: boolean; signal: AbortSignal | null; hook: string }[] }).__listeners
          .filter((l) => l.signal)
          .map((l) => ({ type: l.type, passive: l.passive, aborted: l.signal!.aborted, hook: l.hook })),
      );
    const before = await read();
    expect(before.some((l) => l.type === 'scroll' && l.hook === 'scrollTrack' && l.passive)).toBe(true);
    expect(before.filter((l) => l.type === 'click').map((l) => l.hook).sort()).toEqual(expect.arrayContaining(['scrollNext', 'scrollPrev']));

    await rootOf(page, 'te15-five').evaluate((el) => {
      const parent = el.parentElement!;
      el.remove();
      (window as unknown as { __back: () => void }).__back = () => parent.append(el);
    });
    const removed = await read();
    expect(removed.filter((l) => l.aborted).length).toBeGreaterThanOrEqual(3);

    await page.evaluate(() => (window as unknown as { __back: () => void }).__back());
    await expect.poll(async () => (await read()).filter((l) => !l.aborted && l.type === 'scroll').length).toBe(before.filter((l) => l.type === 'scroll').length);
  });
});

test.describe('ES1-T335 RTL', () => {
  // KHÔNG CHẮC: theme chưa có locale RTL; ép dir=rtl để kiểm hướng (ES1-T209 mục 4).
  test('dir=rtl: đầu hàng back tắt, next cuộn về âm, back bật', async ({ page }) => {
    // Đặt dir ngay trong HTML trả về để module nâng cấp trên bố cục RTL từ đầu
    await page.route(/view=te15/, async (route) => {
      if (route.request().resourceType() !== 'document') return route.fallback();
      const response = await route.fetch();
      const body = (await response.text()).replace(/<html\b/, '<html dir="rtl"');
      await route.fulfill({ response, body });
    });
    await open(page);
    await off(prevOf(page, 'te15-five'));
    await on(nextOf(page, 'te15-five'));
    await nextOf(page, 'te15-five').click();
    await expect.poll(() => trackOf(page, 'te15-five').evaluate((el) => el.scrollLeft)).toBeLessThan(0);
    await on(prevOf(page, 'te15-five'));
  });
});

test.describe('ES1-T335 trang chủ', () => {
  test('mọi hàng ngang tới gần đều nâng cấp; vừa khung thì data-static, tràn thì back tắt ở đầu', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');
    const rows = page.locator('scroll-buttons');
    const count = await rows.count();
    test.skip(count === 0, 'store chưa cấu hình hàng ngang trên trang chủ');
    for (let i = 0; i < count; i += 1) {
      const row = rows.nth(i);
      await row.scrollIntoViewIfNeeded();
      await expect(row).toHaveAttribute('data-enhanced', '');
      const isStatic = await row.evaluate((el) => el.hasAttribute('data-static'));
      const fits = await row.locator('[data-scroll-track]').evaluate((el) => el.scrollWidth <= el.clientWidth);
      expect(isStatic).toBe(fits);
      if (!fits) await expect(row.locator('[data-scroll-prev]')).toHaveAttribute('aria-disabled', 'true');
    }
  });
});

test.describe('ES1-T335 chất lượng', () => {
  test('0 console error, axe 0 serious khi có nút tắt', async ({ page }) => {
    const errors = watchConsole(page);
    await open(page);
    await off(prevOf(page, 'te15-five'));
    await expectNotChallenged(page);
    const { violations } = await new AxeBuilder({ page }).analyze();
    const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious.map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
    expect(errors).toEqual([]);
  });
});
