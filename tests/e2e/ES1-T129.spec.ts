// KHÔNG CHẮC: spec chưa chạy (không preview, sandbox chặn Chromium). Bản này đã chép đè tests/e2e/ES1-T129.spec.ts (lượt 3).
// CI PR #222 đỏ vì tests/e2e/ES1-T129.spec.ts còn bản cũ (nextElementSibling testid = dialog, nay là <modal-dialog> → null).
// Ticket ES1-T129 TE-8-FE2 (lượt 2, phạm vi ES1-T307 §3): khung search popup + biến thể drawer, <modal-dialog data-layer="search">,
// form kính lúp đầu ô + nút xoá (docs/ui-spec/predictive-search.md §1–§3, §11; ADR 0007).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T129.spec.ts -g "AC1-markup|AC3"
// JS chưa có (modal-dialog.js, predictive-search.js của BE) nên test tự gọi showModal. Spec không click link khi có JS: sau BE spec vẫn đúng.
// Đo hình học với reducedMotion 'reduce': transition mở (opacity + translate) không làm lệch boundingBox (bài học ES1-T313 TC-05).
import { test, expect, type Browser, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { expectNotChallenged } from './support/store-guard';

const T = {
  link: 'header-search-link',
  root: 'predictive-search',
  dialog: 'predictive-search-dialog',
  close: 'predictive-search-close',
  form: 'predictive-search-form',
  input: 'predictive-search-input',
  submit: 'predictive-search-submit',
  clear: 'predictive-search-clear',
  listbox: 'predictive-search-listbox',
  group: 'predictive-search-group',
  option: 'predictive-search-option',
  all: 'predictive-search-all',
  status: 'predictive-search-status',
};

const tid = (page: Page, id: string) => page.getByTestId(id);

// Dung sai subpixel cho so sánh mép (boundingBox trả số lẻ như 779.99998, -0.035)
const PX = 0.5;

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

// Focus link trước showModal: dialog trả focus về phần tử đang focus lúc mở
async function openDialog(page: Page) {
  await tid(page, T.link).focus();
  await tid(page, T.dialog).evaluate((d: HTMLDialogElement) => {
    if (!d.open) d.showModal();
  });
  await expect(tid(page, T.dialog)).toBeVisible();
}

// Đổi sang biến thể drawer như khi setting Search style = Drawer (cùng class Liquid in ra)
async function asDrawer(page: Page) {
  await tid(page, T.dialog).evaluate((d) => {
    d.classList.add('drawer', 'drawer--end', 'drawer--wide');
    d.setAttribute('data-style', 'drawer');
    const title = d.querySelector('#PredictiveSearchTitle')!;
    title.classList.replace('visually-hidden', 'drawer__title');
    d.querySelector('.predictive-search__logo')?.remove();
  });
}

// Giống BE1: clone template vào nhóm, mở listbox. count option mỗi thẻ template.
async function fillListbox(page: Page, count = 1) {
  await page.evaluate((n) => {
    const root = document.querySelector('[data-testid="predictive-search"]')!;
    const clone = (kind: string, group: string, label: string) => {
      const tpl = root.querySelector<HTMLTemplateElement>(`[data-predictive-template="${kind}"]`)!;
      const box = root.querySelector<HTMLElement>(`[data-predictive-group="${group}"]`)!;
      for (let i = 0; i < n; i++) {
        const node = tpl.content.cloneNode(true) as DocumentFragment;
        node.querySelector('[data-predictive-title]')!.textContent = `${label} ${i + 1}`;
        const price = node.querySelector('[data-predictive-price]');
        if (price) price.textContent = '10.00';
        box.querySelector('[data-predictive-options]')!.append(node);
      }
      box.hidden = false;
    };
    clone('product', 'products', 'Product');
    clone('link', 'collections', 'Collection');
    clone('link', 'pages', 'Page');
    clone('link', 'articles', 'Article');
    root.querySelector<HTMLElement>('[role="listbox"]')!.hidden = false;
    root.querySelector('[role="combobox"]')!.setAttribute('aria-expanded', 'true');
  }, count);
}

// Phần còn lại của trang là inert khi dialog mở; axe trang đầy đủ đã có ở TE-1
async function expectNoSeriousAxe(page: Page) {
  await expectNotChallenged(page);
  const { violations } = await new AxeBuilder({ page }).include(`[data-testid="${T.dialog}"]`).analyze();
  const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(serious.map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
}

async function noJsPage(browser: Browser) {
  const use = test.info().project.use;
  const context = await browser.newContext({
    javaScriptEnabled: false,
    storageState: 'tests/setup/state.json',
    baseURL: use.baseURL,
    ...(use.viewport ? { viewport: use.viewport } : {}),
    ...(use.userAgent ? { userAgent: use.userAgent } : {}),
    ...(use.isMobile !== undefined ? { isMobile: use.isMobile, hasTouch: use.hasTouch } : {}),
  });
  return { context, page: await context.newPage() };
}

test.describe('ES1-T129 TE-8 dialog search', () => {
  test('AC1-markup modal-dialog search liền sau link, dialog đóng sẵn, đủ hook cho BE', async ({ page }) => {
    await page.goto('/');
    await expect(tid(page, T.dialog)).toBeHidden();
    const next = await tid(page, T.link).evaluate((a) => {
      const host = a.nextElementSibling;
      return [host?.localName, host?.getAttribute('data-layer'), host?.firstElementChild?.getAttribute('data-testid')];
    });
    expect(next).toEqual(['modal-dialog', 'search', T.dialog]);
    await expect(tid(page, T.link)).toHaveAttribute('aria-haspopup', 'dialog');
    const dialog = tid(page, T.dialog);
    await expect(dialog).toHaveAttribute('scroll-lock', '');
    await expect(dialog).toHaveAttribute('data-style', /^(popup|drawer)$/);
    const labelledby = await dialog.getAttribute('aria-labelledby');
    expect(labelledby).toBeTruthy();
    await expect(page.locator(`#${labelledby}`)).toHaveJSProperty('tagName', 'H2');

    const root = tid(page, T.root);
    await expect(root).toHaveAttribute('data-url', /search\/suggest/);
    await expect(root).toHaveAttribute('data-money-format', /\S/);
    await expect(root).toHaveAttribute('data-label-count', /%n/);
    await expect(root).toHaveAttribute('data-label-empty', /%s/);
    await expect(root).toHaveAttribute('data-label-all', /%s/);

    const groups = await tid(page, T.group).evaluateAll((els) =>
      els.map((e) => [e.getAttribute('data-predictive-group'), (e as HTMLElement).hidden, e.getAttribute('role')])
    );
    expect(groups).toEqual([
      ['products', true, 'group'],
      ['collections', true, 'group'],
      ['pages', true, 'group'],
      ['articles', true, 'group'],
    ]);
    await expect(root.locator('[data-predictive-group] [data-predictive-options]')).toHaveCount(4);
    await expect(tid(page, T.listbox)).toHaveJSProperty('hidden', true);
    await expect(root.locator('template[data-predictive-template]')).toHaveCount(2);
    await expect(tid(page, T.status)).toBeEmpty();
    const inList = await tid(page, T.status).evaluate((e) => !!e.closest('[role="listbox"]'));
    expect(inList).toBe(false);
    const last = await tid(page, T.listbox).evaluate((e) => e.lastElementChild?.getAttribute('data-testid'));
    expect(last).toBe(T.all);
    await expect(tid(page, T.clear)).toHaveAttribute('type', 'reset');
  });

  test('AC1-markup showModal: dialog hiện, input có focus, combobox đúng', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/');
    await openDialog(page);
    const input = tid(page, T.input);
    await expect(input).toBeFocused();
    await expect(input).toHaveAttribute('role', 'combobox');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await expect(input).toHaveAttribute('aria-autocomplete', 'list');
    await expect(input).toHaveAttribute('aria-controls', (await tid(page, T.listbox).getAttribute('id'))!);
    await expect(input).toHaveAttribute('autocomplete', 'off');
    await expect(input).toHaveAccessibleName(/\S/);
    await expect(tid(page, T.close)).toHaveAccessibleName(/\S/);
    await expect(tid(page, T.submit)).toHaveAccessibleName(/\S/);
    await expect(tid(page, T.dialog)).toHaveAccessibleName(/\S/);
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflowY)).toBe('hidden');
    expect(errors).toEqual([]);
  });

  test('AC1-markup nút xoá chỉ hiện khi có chữ, bấm thì ô rỗng', async ({ page }) => {
    await page.goto('/');
    await openDialog(page);
    await expect(tid(page, T.clear)).toBeHidden();
    await tid(page, T.input).fill('bench');
    await expect(tid(page, T.clear)).toBeVisible();
    // Nút xoá display:none khi ô rỗng → tên truy cập chỉ đo được khi đã hiện
    await expect(tid(page, T.clear)).toHaveAccessibleName(/\S/);
    const box = (await tid(page, T.clear).boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
    await tid(page, T.clear).click();
    await expect(tid(page, T.input)).toHaveValue('');
    await expect(tid(page, T.clear)).toBeHidden();
    await expect(tid(page, T.dialog)).toBeVisible();
  });

  test('AC1-markup nút đóng đóng được, focus về link', async ({ page }) => {
    await page.goto('/');
    await openDialog(page);
    await tid(page, T.close).click();
    await expect(tid(page, T.dialog)).toBeHidden();
    await expect(tid(page, T.link)).toBeFocused();
  });

  test('AC1-markup Esc đóng được, focus về link', async ({ page }) => {
    await page.goto('/');
    await openDialog(page);
    await page.keyboard.press('Escape');
    await expect(tid(page, T.dialog)).toBeHidden();
    await expect(tid(page, T.link)).toBeFocused();
  });

  test('AC1-markup 360 popup phủ đủ viewport, thanh tối 80, kính lúp đầu ô, không cuộn ngang', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto('/');
    test.skip((await tid(page, T.dialog).getAttribute('data-style')) !== 'popup', 'store đang chọn drawer');
    await openDialog(page);
    const box = (await tid(page, T.dialog).boundingBox())!;
    // Số lẻ subpixel (779.99998, y -0.035): so gần đúng, 0 chữ số thập phân
    expect(box.x).toBeCloseTo(0, 0);
    expect(box.y).toBeCloseTo(0, 0);
    expect(box.width).toBeCloseTo(360, 0);
    expect(box.height).toBeCloseTo(780, 0);

    const bar = await tid(page, T.form).evaluate((f) => {
      const b = f.parentElement!;
      return { h: b.getBoundingClientRect().height, bg: getComputedStyle(b).backgroundImage };
    });
    expect(bar.h).toBeGreaterThanOrEqual(80);
    expect(bar.bg).toContain('noise-dark');

    await fillListbox(page, 12);
    const list = tid(page, T.listbox);
    const form = tid(page, T.form);
    const before = (await form.boundingBox())!;
    const scroll = await list.evaluate((e) => {
      e.scrollTop = 200;
      return { top: e.scrollTop, overX: e.scrollWidth - e.clientWidth };
    });
    expect(scroll.top, 'listbox phải tự cuộn').toBeGreaterThan(0);
    expect(scroll.overX).toBeLessThanOrEqual(0);
    expect((await form.boundingBox())!.y).toBeCloseTo(before.y, 0);
    const dialogOverX = await tid(page, T.dialog).evaluate((e) => e.scrollWidth - e.clientWidth);
    expect(dialogOverX).toBeLessThanOrEqual(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);

    // Kính lúp đầu ô, rồi input, rồi nút đóng; không chồng nhau
    await tid(page, T.input).fill('ab');
    const submit = (await tid(page, T.submit).boundingBox())!;
    const input = (await tid(page, T.input).boundingBox())!;
    const clear = (await tid(page, T.clear).boundingBox())!;
    const close = (await tid(page, T.close).boundingBox())!;
    expect(submit.x + submit.width).toBeLessThanOrEqual(input.x + PX);
    expect(input.x + input.width).toBeLessThanOrEqual(clear.x + PX);
    expect(clear.x + clear.width).toBeLessThanOrEqual(close.x + PX);
    expect(close.x + close.width).toBeLessThanOrEqual(360 + PX);
    expect(close.width).toBeGreaterThanOrEqual(48);
  });

  test('AC1-markup từ 48rem popup dải trên rộng 100%, tối đa 80dvh, cuộn trong', async ({ page }, ti) => {
    test.skip(ti.project.name !== 'desktop', 'bố cục desktop');
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    test.skip((await tid(page, T.dialog).getAttribute('data-style')) !== 'popup', 'store đang chọn drawer');
    await openDialog(page);
    await fillListbox(page, 12);
    const box = (await tid(page, T.dialog).boundingBox())!;
    expect(box.y).toBeCloseTo(0, 0);
    expect(box.x).toBeCloseTo(0, 0);
    expect(box.width).toBeCloseTo(1280, 0);
    expect(box.height).toBeLessThanOrEqual(640 + PX);
    const scroll = await tid(page, T.listbox).evaluate((e) => e.scrollHeight - e.clientHeight);
    expect(scroll, 'listbox phải tự cuộn').toBeGreaterThan(0);
    const backdrop = await tid(page, T.dialog).evaluate((d) => getComputedStyle(d, '::backdrop').backgroundColor);
    expect(backdrop).not.toBe('rgba(0, 0, 0, 0)');
    // Lưới 12: logo trước ô, ô trước nút đóng, cùng hàng
    const logo = (await tid(page, T.dialog).locator('.predictive-search__logo').boundingBox())!;
    const form = (await tid(page, T.form).boundingBox())!;
    const close = (await tid(page, T.close).boundingBox())!;
    expect(logo.x + logo.width).toBeLessThanOrEqual(form.x + PX);
    expect(form.x + form.width).toBeLessThanOrEqual(close.x + PX);
    expect(Math.abs(form.y + form.height / 2 - (close.y + close.height / 2))).toBeLessThanOrEqual(1);
  });

  test('AC1-markup biến thể drawer: mép inline-end, 90% ở 360, tiêu đề hiện', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto('/');
    await asDrawer(page);
    await openDialog(page);
    const box = (await tid(page, T.dialog).boundingBox())!;
    expect(box.width).toBeCloseTo(324, 0);
    expect(box.x + box.width).toBeCloseTo(360, 0);
    expect(box.height).toBeCloseTo(780, 0);
    await expect(page.locator('#PredictiveSearchTitle')).toBeVisible();
    const title = (await page.locator('#PredictiveSearchTitle').boundingBox())!;
    const form = (await tid(page, T.form).boundingBox())!;
    const close = (await tid(page, T.close).boundingBox())!;
    expect(form.y + PX).toBeGreaterThanOrEqual(title.y + title.height);
    expect(close.y).toBeLessThan(form.y);
    await expectNoSeriousAxe(page);
  });

  test('AC1-markup option từ 44px, sản phẩm ảnh 64, aria-selected có nền và outline', async ({ page }) => {
    await page.goto('/');
    await openDialog(page);
    await fillListbox(page);
    const options = tid(page, T.option);
    await expect(options).toHaveCount(4);
    for (const option of await options.all()) {
      expect((await option.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      await expect(option).toHaveAttribute('role', 'option');
      await expect(option).toHaveAttribute('tabindex', '-1');
    }
    const image = options.first().locator('img');
    await expect(image).toHaveAttribute('alt', '');
    const size = await image.evaluate((e) => [e.getBoundingClientRect().width, e.getBoundingClientRect().height]);
    expect(size[0]).toBeCloseTo(64, 0);
    expect(size[1]).toBeCloseTo(64, 0);

    const style = (el: Element) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, outline: s.outlineStyle };
    };
    const off = await tid(page, T.all).evaluate(style);
    await tid(page, T.all).evaluate((e) => e.setAttribute('aria-selected', 'true'));
    const on = await tid(page, T.all).evaluate(style);
    expect(on.bg).not.toBe(off.bg);
    expect(on.outline).toBe('solid');
  });

  test('AC1-markup axe 0 serious khi dialog mở, kể cả có option mẫu', async ({ page }) => {
    await page.goto('/');
    await openDialog(page);
    await expectNoSeriousAxe(page);
    await tid(page, T.input).fill('ab');
    await fillListbox(page);
    await tid(page, T.option).first().evaluate((e) => e.setAttribute('aria-selected', 'true'));
    await expectNoSeriousAxe(page);
  });

  test('AC3 submit trong dialog sang /search, giữ q và type', async ({ page }) => {
    await page.goto('/');
    await openDialog(page);
    await tid(page, T.input).fill('a');
    await tid(page, T.submit).click();
    await page.waitForURL((u) => u.pathname.endsWith('/search'));
    const params = new URL(page.url()).searchParams;
    expect(params.get('q')).toBe('a');
    expect(params.get('type')).toBe('product,article,page');
    expect(params.get('options[prefix]')).toBe('last');
  });

  test('AC3 JS tắt: click link sang /search, dialog không hiện', async ({ browser }) => {
    const { context, page } = await noJsPage(browser);
    try {
      await page.goto('/');
      await expect(tid(page, T.dialog)).toBeHidden();
      await tid(page, T.link).click();
      await page.waitForURL((u) => u.pathname.endsWith('/search'));
      await expect(tid(page, T.dialog)).toBeHidden();
    } finally {
      await context.close();
    }
  });
});
