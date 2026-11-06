// Ticket ES1-T45 (2727475000000144006): E2E rich-text (ES1-T44, ADR 0005, TE-2 AC5) + RTL logical properties (ES1-T37 D6, TE-14 AC4).
// Test case: drafts/qa/ES1-T45/test-cases.md. Ticket xin 2 file rich-text.spec.ts + rtl.spec.ts; gộp 1 file theo quy ước tên key ticket, 2 describe.
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T45.spec.ts
// Theme chưa có locale RTL: bật RTL bằng document.documentElement.dir = 'rtl' (D6), không sửa layout.
import { test, expect, type Locator, type Page, type TestInfo } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { fetchRetry429 } from './support/cart-api';

const isDesktop = (ti: TestInfo) => ti.project.name === 'desktop';
const SAND = 'rgb(235, 230, 224)'; // ADR 0005: background_sand #EBE6E0
const SAND_FOREGROUND = 'rgb(26, 26, 26)'; // background_sand_foreground #1A1A1A
const HEADING = 'Everything You Need to Train.';
const TWO_COLUMNS = [1024, 1280, 1920]; // 1920: Figma 1:454 gốc
const ONE_COLUMN = [360, 768, 1023]; // dưới 64rem
const FLIP_ICONS = ['previous', 'next', 'arrow'] as const;
const STILL_ICONS = ['pause', 'play'] as const;

const norm = (s: string | null) => (s ?? '').replace(/\s+/g, ' ').trim();
const box = async (l: Locator) => {
  const b = await l.boundingBox();
  expect(b, 'phần tử có hộp hiển thị').not.toBeNull();
  return b!;
};
const tracks = (l: Locator) =>
  l.evaluate(el => getComputedStyle(el).gridTemplateColumns.trim().split(/\s+/).filter(Boolean).length);
const overflow = (l: Locator) => l.evaluate(el => ({ scroll: el.scrollWidth, client: el.clientWidth }));

async function openHome(page: Page, width?: number) {
  if (width) await page.setViewportSize({ width, height: 900 });
  await page.goto('/');
  const container = page.getByTestId('container-home-intro');
  await expect(container, 'templates/index.liquid có container id home-intro').toHaveCount(1);
  const root = container.getByTestId('rich-text');
  await expect(root).toHaveCount(1);
  await root.scrollIntoViewIfNeeded();
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  return {
    container,
    root,
    heading: root.getByTestId('rich-text-heading'),
    content: root.locator('.rich-text__content'),
    button: root.getByTestId('rich-text-button'),
  };
}

async function setDir(page: Page, dir: 'ltr' | 'rtl') {
  await page.evaluate(d => { document.documentElement.dir = d; }, dir);
}

// Skip có điều kiện (ticket): stylesheet của theme chưa có rule :dir(rtl) thì ES1-T37 chưa vào bản preview.
async function hasDirRtlRule(page: Page) {
  const hrefs = await page.locator('link[rel="stylesheet"][href*="/assets/"], link[rel="stylesheet"][href*="/cdn/shop/t/"]')
    .evaluateAll(links => links.map(l => (l as HTMLLinkElement).href));
  for (const href of hrefs) {
    const res = await fetchRetry429(page, href);
    if (res.ok() && /:dir\(rtl\)/.test(await res.text())) return true;
  }
  return false;
}

const iconScale = (page: Page, name: string) =>
  page.locator(`.slideshow-icon--${name}`).first().evaluate(el => getComputedStyle(el).scale);

const iconTranslateX = (l: Locator) =>
  l.evaluate(el => {
    const t = getComputedStyle(el).translate;
    return t === 'none' ? 0 : parseFloat(t);
  });

test.describe('ES1-T45 rich-text (ES1-T44, ADR 0005)', () => {
  test('TC-01 container home-intro nền sand rgb(235, 230, 224), chữ foreground sand', async ({ page }) => {
    const { container } = await openHome(page);
    await expect(container).toHaveClass(/\bblock-container--sand\b/);
    await expect(container).toHaveCSS('background-color', SAND);
    await expect(container).toHaveCSS('color', SAND_FOREGROUND);
  });

  test('TC-02 heading textContent chuẩn hoá = "Everything You Need to Train.", thẻ h1/h2', async ({ page }) => {
    const { heading } = await openHome(page);
    await expect(heading).toBeVisible();
    expect(norm(await heading.textContent())).toBe(HEADING);
    expect(['H1', 'H2']).toContain(await heading.evaluate(el => el.tagName));
  });

  test('TC-03 screen reader: tên truy cập heading đọc liền câu, ảnh inline không chen vào', async ({ page }) => {
    const { heading } = await openHome(page);
    await expect(heading).toHaveAccessibleName(HEADING);
  });

  test('TC-04 ảnh inline (nếu có) alt="", nằm trong heading, wrapper span, lazy', async ({ page }) => {
    const { heading } = await openHome(page);
    const img = heading.locator('[data-testid="rich-text-inline-image"] img');
    test.skip(!(await img.count()), 'merchant chưa chọn inline_image trên store dev');
    await expect(img).toHaveCount(1);
    await expect(img).toHaveAttribute('alt', '');
    await expect(img).toHaveAttribute('loading', 'lazy');
    expect(await heading.getByTestId('rich-text-inline-image').evaluate(el => el.tagName)).toBe('SPAN');
    await expect(img).toBeVisible();
    // block-size 0.94em của cỡ chữ heading (ADR 0005 QĐ3), sai số 2px do làm tròn
    const { h, fs } = await img.evaluate(el => ({
      h: el.parentElement!.getBoundingClientRect().height,
      fs: parseFloat(getComputedStyle(el.closest('[data-testid="rich-text-heading"]')!).fontSize),
    }));
    expect(Math.abs(h - fs * 0.94)).toBeLessThanOrEqual(2);
  });

  test('TC-05 CTA rich-text-button cao từ 44px, icon aria-hidden, tên truy cập = nhãn', async ({ page }) => {
    const { button } = await openHome(page);
    test.skip(!(await button.count()), 'button_label trống trên store dev');
    await expect(button).toBeVisible();
    expect((await box(button)).height).toBeGreaterThanOrEqual(44);
    const icon = button.locator('svg.slideshow-icon--arrow');
    await expect(icon).toHaveCount(1);
    await expect(icon).toHaveAttribute('aria-hidden', 'true');
    await expect(icon).toHaveAttribute('focusable', 'false');
    await expect(button).toHaveClass(/\bbutton--link\b/);
    const label = norm(await button.locator('.button__label').textContent());
    expect(label.length).toBeGreaterThan(0);
    await expect(button).toHaveAccessibleName(label);
  });

  test('TC-06 CTA có href và đích trả về < 400', async ({ page }) => {
    const { button } = await openHome(page);
    test.skip(!(await button.count()), 'button_label trống trên store dev');
    const href = await button.getAttribute('href');
    expect(href, 'button_url trống thì mặc định routes.all_products_collection_url').toBeTruthy();
    const res = await fetchRetry429(page, new URL(href!, page.url()).toString());
    expect(res.status()).toBeLessThan(400);
  });

  test('TC-07 keyboard: Tab tới được CTA, có viền focus-visible', async ({ page }, ti) => {
    test.skip(!isDesktop(ti), 'desktop: bàn phím vật lý');
    const { button } = await openHome(page);
    test.skip(!(await button.count()), 'button_label trống trên store dev');
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    let reached = false;
    for (let i = 0; i < 120 && !reached; i++) {
      await page.keyboard.press('Tab');
      reached = await page.evaluate(() => document.activeElement?.getAttribute('data-testid') === 'rich-text-button');
    }
    expect(reached, 'CTA nằm trong thứ tự Tab').toBe(true);
    const ring = await button.evaluate(el => {
      const s = getComputedStyle(el);
      return { visible: el.matches(':focus-visible'), style: s.outlineStyle, width: parseFloat(s.outlineWidth) };
    });
    expect(ring.visible).toBe(true);
    expect(ring.style).not.toBe('none');
    expect(ring.width).toBeGreaterThanOrEqual(2);
  });

  for (const width of TWO_COLUMNS) {
    test(`TC-08 ${width}px: 2 cột, heading không tràn cột, không đè cột phải`, async ({ page }, ti) => {
      test.skip(!isDesktop(ti), 'desktop: đặt viewport');
      const { root, heading, content } = await openHome(page, width);
      expect(await tracks(root)).toBe(2);
      const o = await overflow(heading);
      expect(o.scroll, `scrollWidth ${o.scroll} <= clientWidth ${o.client}`).toBeLessThanOrEqual(o.client);
      const h = await box(heading);
      const c = await box(content);
      expect(h.x + h.width).toBeLessThanOrEqual(c.x + 1);
    });
  }

  for (const width of ONE_COLUMN) {
    test(`TC-09 ${width}px: 1 cột, nội dung xếp dưới heading, không tràn ngang`, async ({ page }, ti) => {
      test.skip(!isDesktop(ti), 'desktop: đặt viewport');
      const { root, heading, content } = await openHome(page, width);
      expect(await tracks(root)).toBe(1);
      const h = await box(heading);
      const c = await box(content);
      expect(c.y).toBeGreaterThanOrEqual(h.y + h.height - 1);
      expect(Math.abs(c.x - h.x)).toBeLessThanOrEqual(1);
      for (const l of [root, heading]) {
        const o = await overflow(l);
        expect(o.scroll).toBeLessThanOrEqual(o.client);
      }
    });
  }

  test('TC-10 mobile (Pixel 7): 1 cột, CTA vẫn từ 44px', async ({ page }, ti) => {
    test.skip(isDesktop(ti), 'mobile');
    const { root, heading, button } = await openHome(page);
    expect(await tracks(root)).toBe(1);
    const o = await overflow(heading);
    expect(o.scroll).toBeLessThanOrEqual(o.client);
    if (await button.count()) expect((await box(button)).height).toBeGreaterThanOrEqual(44);
  });

  test('TC-11 độ rộng không vượt setting max_width', async ({ page }, ti) => {
    test.skip(!isDesktop(ti), 'desktop: đặt viewport');
    const { root } = await openHome(page, 1920);
    const { max, width } = await root.evaluate(el => ({
      max: parseFloat((el as HTMLElement).style.getPropertyValue('--rich-text-max-width')),
      width: el.getBoundingClientRect().width,
    }));
    expect(max).toBeGreaterThanOrEqual(480);
    expect(width).toBeLessThanOrEqual(max + 0.5);
  });

  test('TC-12 body richtext hiển thị, có đoạn văn', async ({ page }) => {
    const { root } = await openHome(page);
    const body = root.getByTestId('rich-text-body');
    test.skip(!(await body.count()), 'body trống trên store dev');
    await expect(body).toBeVisible();
    expect(norm(await body.textContent()).length).toBeGreaterThan(0);
  });

  test('TC-13 axe vùng home-intro: 0 color-contrast, 0 serious/critical', async ({ page }) => {
    await openHome(page);
    const axe = await new AxeBuilder({ page }).include('[data-testid="container-home-intro"]').analyze();
    const bad = axe.violations.filter(v => v.id === 'color-contrast' || ['serious', 'critical'].includes(v.impact || ''));
    const report = bad.map(v => `${v.impact} ${v.id}: ` + v.nodes.slice(0, 5).map(n => n.target.join(' ')).join(', ')).join('\n');
    expect(bad, report).toEqual([]);
  });

  test('TC-14 hover CTA: icon dịch theo chiều inline; reduced-motion thì không dịch', async ({ page }, ti) => {
    test.skip(!isDesktop(ti), 'desktop: hover chuột');
    const { button } = await openHome(page);
    test.skip(!(await button.count()), 'button_label trống trên store dev');
    const icon = button.locator('svg.slideshow-icon--arrow');
    await button.hover();
    await expect.poll(() => iconTranslateX(icon)).toBeGreaterThan(0);
    await page.mouse.move(0, 0);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await button.hover();
    await expect.poll(() => iconTranslateX(icon)).toBe(0);
  });

  test.describe('không JS', () => {
    test.use({ javaScriptEnabled: false });
    test('TC-15 rich-text render đủ khi tắt JS (block không phụ thuộc JS)', async ({ page }) => {
      // Không gọi openHome: page.evaluate chạy trong main world, bị chặn khi tắt JS
      await page.goto('/');
      const container = page.getByTestId('container-home-intro');
      await expect(container).toHaveCSS('background-color', SAND);
      const heading = container.getByTestId('rich-text-heading');
      await expect(heading).toBeVisible();
      expect(norm(await heading.textContent())).toBe(HEADING);
    });
  });
});

test.describe('ES1-T45 RTL (ES1-T37 D6, TE-14 AC4)', () => {
  async function openRtlReady(page: Page, width?: number) {
    const parts = await openHome(page, width);
    test.skip(!(await hasDirRtlRule(page)), 'stylesheet preview chưa có rule :dir(rtl) (ES1-T37 chưa vào bản này)');
    return parts;
  }

  test('R-01 LTR mặc định: direction ltr, không icon nào bị lật', async ({ page }) => {
    await openRtlReady(page);
    expect(await page.evaluate(() => getComputedStyle(document.body).direction)).toBe('ltr');
    for (const name of [...FLIP_ICONS, ...STILL_ICONS]) {
      if (!(await page.locator(`.slideshow-icon--${name}`).count())) continue;
      expect(await iconScale(page, name), name).toBe('none');
    }
  });

  test('R-02 RTL: previous, next, arrow scale -1 1; pause, play giữ nguyên', async ({ page }) => {
    await openRtlReady(page);
    await setDir(page, 'rtl');
    expect(await page.evaluate(() => getComputedStyle(document.body).direction)).toBe('rtl');
    for (const name of FLIP_ICONS) {
      expect(await page.locator(`.slideshow-icon--${name}`).count(), `trang chủ có icon ${name}`).toBeGreaterThan(0);
      expect(await iconScale(page, name), name).toBe('-1 1');
    }
    for (const name of STILL_ICONS) {
      if (!(await page.locator(`.slideshow-icon--${name}`).count())) continue;
      expect(await iconScale(page, name), name).toBe('none');
    }
  });

  test('R-03 RTL rồi về ltr: icon trở lại none (ltr không đổi)', async ({ page }) => {
    await openRtlReady(page);
    await setDir(page, 'rtl');
    await setDir(page, 'ltr');
    for (const name of FLIP_ICONS) expect(await iconScale(page, name), name).toBe('none');
  });

  test('R-04 1280: panel localization bám inline-end (LTR mép phải, RTL mép trái)', async ({ page }, ti) => {
    test.skip(!isDesktop(ti), 'desktop: đặt viewport');
    await openRtlReady(page, 1280);
    const disclosure = page.locator('.site-footer__disclosure');
    test.skip(!(await disclosure.count()), 'store chỉ 1 nước + 1 ngôn ngữ: footer không có localization');
    await disclosure.locator('summary').click();
    const panel = page.locator('.site-footer__panel');
    await expect(panel).toBeVisible();
    const edges = () =>
      panel.evaluate(el => {
        const p = el.getBoundingClientRect();
        const r = ((el as HTMLElement).offsetParent as HTMLElement).getBoundingClientRect();
        return { left: Math.round(p.left - r.left), right: Math.round(r.right - p.right), vl: p.left, vr: p.right, vw: innerWidth };
      });
    const ltr = await edges();
    expect(ltr.right, 'LTR: mép phải panel = mép phải neo').toBe(0);
    await setDir(page, 'rtl');
    const rtl = await edges();
    expect(rtl.left, 'RTL: mép trái panel = mép trái neo').toBe(0);
    for (const e of [ltr, rtl]) {
      expect(e.vl).toBeGreaterThanOrEqual(0);
      expect(e.vr).toBeLessThanOrEqual(e.vw);
    }
  });

  test('R-05 dưới 48rem: panel bám inline-start, đổi phía khi RTL', async ({ page }, ti) => {
    test.skip(isDesktop(ti), 'mobile');
    await openRtlReady(page);
    const disclosure = page.locator('.site-footer__disclosure');
    test.skip(!(await disclosure.count()), 'store chỉ 1 nước + 1 ngôn ngữ: footer không có localization');
    await disclosure.locator('summary').click();
    const panel = page.locator('.site-footer__panel');
    await expect(panel).toBeVisible();
    const edges = () =>
      panel.evaluate(el => {
        const p = el.getBoundingClientRect();
        const r = ((el as HTMLElement).offsetParent as HTMLElement).getBoundingClientRect();
        return { left: Math.round(p.left - r.left), right: Math.round(r.right - p.right) };
      });
    expect((await edges()).left).toBe(0);
    await setDir(page, 'rtl');
    expect((await edges()).right).toBe(0);
  });

  test('R-06 RTL: CTA mũi tên nằm bên trái nhãn', async ({ page }) => {
    const { button } = await openRtlReady(page);
    test.skip(!(await button.count()), 'button_label trống trên store dev');
    await setDir(page, 'rtl');
    const icon = await box(button.locator('svg.slideshow-icon--arrow'));
    const label = await box(button.locator('.button__label'));
    expect(icon.x + icon.width).toBeLessThanOrEqual(label.x + 1);
  });

  test('R-07 RTL 1280: heading sang cột phải, body + CTA cột trái', async ({ page }, ti) => {
    test.skip(!isDesktop(ti), 'desktop: đặt viewport');
    const { heading, content } = await openRtlReady(page, 1280);
    await setDir(page, 'rtl');
    const h = await box(heading);
    const c = await box(content);
    expect(h.x).toBeGreaterThanOrEqual(c.x + c.width - 1);
    const o = await overflow(heading);
    expect(o.scroll).toBeLessThanOrEqual(o.client);
  });

  test('R-08 RTL hover CTA: icon dịch ngược chiều; reduced-motion thì không dịch', async ({ page }, ti) => {
    test.skip(!isDesktop(ti), 'desktop: hover chuột');
    const { button } = await openRtlReady(page);
    test.skip(!(await button.count()), 'button_label trống trên store dev');
    await setDir(page, 'rtl');
    const icon = button.locator('svg.slideshow-icon--arrow');
    await button.hover();
    await expect.poll(() => iconTranslateX(icon)).toBeLessThan(0);
    await page.mouse.move(0, 0);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await button.hover();
    await expect.poll(() => iconTranslateX(icon)).toBe(0);
  });

  test('R-09 container chỉ xuất --text-align start/center/end, text-align không left/right', async ({ page }) => {
    await openRtlReady(page);
    const values = await page.locator('.block-container').evaluateAll(els =>
      els.map(el => ({
        v: (el as HTMLElement).style.getPropertyValue('--text-align').trim(),
        c: getComputedStyle(el).textAlign,
      })),
    );
    expect(values.length).toBeGreaterThan(0);
    for (const { v, c } of values) {
      expect(['start', 'center', 'end']).toContain(v);
      expect(['left', 'right']).not.toContain(c);
    }
  });
});
