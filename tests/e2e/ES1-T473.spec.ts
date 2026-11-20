// KHÔNG CHẮC: spec chưa chạy trong phiên viết (không trình duyệt, không preview); chờ CI.
// ES1-T473 TE-20 BE: related-articles nạp scroll-buttons.js lười (AC13); bình luận: focus hộp lỗi/trạng thái sau POST,
// nút Post Comment aria-busy + không gửi lại (AC12, article.md §5 "Đang gửi"). Hook FE từ ES1-T382. Không partial.
// Nhóm "tĩnh" đọc repo. Nhóm "fixture" phục vụ markup + assets/article-comments.js thật qua page.route (không store).
// Nhóm "store" cần TE382_ARTICLE_PATH (bài có ≥ 1 bài khác trong blog, blog bật bình luận), thiếu thì fixme.
import { test, expect, type Page } from './support/test';
import { readFileSync, statSync } from 'node:fs';
import { env } from './support/store-data';
import { expectNotChallenged } from './support/store-guard';
import { watchShopPay403 } from './support/console-guard';

const read = (p: string) => readFileSync(p, 'utf8');
const JS = 'assets/article-comments.js';

test.describe('ES1-T473 tĩnh', () => {
  test.beforeEach(({}, ti) => { test.skip(ti.project.name !== 'desktop', 'tĩnh, chạy 1 lần'); });

  test('trần byte: article-comments.js ≤ 8 192, scroll-buttons.js giữ ≤ 1 536, lazy-module.js ≤ 768; không fetch, không console', () => {
    expect(statSync(JS).size).toBeLessThanOrEqual(8192);
    expect(statSync('assets/scroll-buttons.js').size).toBeLessThanOrEqual(1536);
    expect(statSync('assets/lazy-module.js').size).toBeLessThanOrEqual(768);
    const js = read(JS);
    expect(js).not.toMatch(/fetch\(|partials|console\.|^\s*import /m);
  });

  test('related-articles: data-lazy-module scroll-buttons.js trên <scroll-buttons>, đúng 1 thẻ script lazy-module', () => {
    const src = read('blocks/related-articles.liquid');
    expect(src).toMatch(/<scroll-buttons\s[^>]*data-lazy-module="\{\{ 'scroll-buttons\.js' \| asset_url \}\}"/);
    const scripts = src.match(/<script\b[^>]*>/g) ?? [];
    expect(scripts).toEqual([`<script src="{{ 'lazy-module.js' | asset_url }}" type="module">`]);
    // script nằm trong nhánh có khối (không render khi blog chỉ có 1 bài)
    expect(src.lastIndexOf('lazy-module.js')).toBeLessThan(src.indexOf('</scroll-buttons>'));
    for (const hook of ['data-scroll-track', 'data-scroll-progress', "render 'carousel-nav', prefix: 'related-articles'"]) expect(src).toContain(hook);
  });

  test('article-comments: data-lazy-module article-comments.js trên root #comments, đúng 1 thẻ script, hook khớp JS', () => {
    const src = read('blocks/article-comments.liquid');
    expect(src).toMatch(/id="comments"\s+data-lazy-module="\{\{ 'article-comments\.js' \| asset_url \}\}"/);
    const scripts = src.match(/<script\b[^>]*>/g) ?? [];
    expect(scripts).toEqual([`<script src="{{ 'lazy-module.js' | asset_url }}" type="module">`]);
    expect(src.lastIndexOf('lazy-module.js')).toBeLessThan(src.indexOf('{%- elsif request.design_mode -%}'));
    const js = read(JS);
    for (const hook of ['comment-form', 'comment-submit', 'comment-status']) {
      expect(js).toContain(`[data-testid="${hook}"]`);
      expect(src).toContain(hook);
    }
    expect(js).toContain('#CommentFormErrors');
    expect(src).toMatch(/role="status" tabindex="-1" data-testid="comment-status"/);
    expect(src).toMatch(/role="alert"\s+tabindex="-1"\s+id="CommentFormErrors"/);
  });

  test('article-main không có script (giữ ES1-T382)', () => {
    expect(read('blocks/article-main.liquid')).not.toMatch(/<script src|data-lazy-module/);
  });
});

// Fixture: origin giả, form POST tới /comments (route treo để thấy trạng thái đang gửi).
// Form gửi vào iframe ẩn (target): điều hướng POST treo ở khung chính làm locator/evaluate của Playwright chờ
// "navigation to finish" mãi (CI PR #277, cả khi trả 204). JS chỉ nghe sự kiện submit nên target không đổi hành vi.
const ORIGIN = 'https://fixture.test';
type State = 'blank' | 'errors' | 'status';

function html(state: State) {
  const status = state === 'status'
    ? '<div class="form-status form-status--success" role="status" tabindex="-1" data-testid="comment-status"><p>Thanks, your comment is in review</p></div>' : '';
  const errors = state === 'errors'
    ? '<div class="form-status form-status--error" role="alert" tabindex="-1" id="CommentFormErrors" data-testid="comment-errors"><p>Check 2 fields</p></div>' : '';
  return `<!doctype html><html lang="en"><head><title>fixture</title></head><body><main>
<p style="block-size:50vh">Article</p>
<div class="article-comments" id="comments" data-lazy-module="${ORIGIN}/article-comments.js" data-testid="article-comments">
  <form method="post" action="${ORIGIN}/comments#comment_form" class="comment-form" data-testid="comment-form" target="post-sink">
    ${status}${errors}
    <label for="CommentAuthor">Name</label><input id="CommentAuthor" name="comment[author]" required>
    <button type="submit" class="button" data-testid="comment-submit">Post Comment</button>
  </form>
  <script src="${ORIGIN}/lazy-module.js" type="module"></script>
</div><iframe name="post-sink" title="post" hidden></iframe></main></body></html>`;
}

async function serve(page: Page, state: State) {
  let posts = 0;
  await page.route(`${ORIGIN}/**`, async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === '/article') return route.fulfill({ contentType: 'text/html', body: html(state) });
    if (url.pathname.endsWith('.js')) return route.fulfill({ contentType: 'text/javascript', body: read(`assets${url.pathname}`) });
    if (url.pathname === '/comments') { posts += 1; return; } // treo: trang giữ trạng thái đang gửi
    return route.abort();
  });
  const errors: string[] = [];
  const ignored = watchShopPay403(page);
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && !ignored(m) && errors.push(m.text()));
  await page.goto(`${ORIGIN}/article`);
  return { errors, posts: () => posts };
}

/** Chờ lazy-module.js nạp xong module (cùng URL → cùng bản trong module map, import() chờ đánh giá xong). */
const loaded = async (page: Page) => {
  await page.waitForFunction(() => performance.getEntriesByType('resource').some((r) => r.name.endsWith('/article-comments.js')));
  await page.evaluate((src) => import(src).then(() => undefined), `${ORIGIN}/article-comments.js`);
};

test.describe('ES1-T473 fixture', () => {
  test.use({ stubNoise: false });

  test('sau POST lỗi: focus vào hộp tóm tắt #CommentFormErrors', async ({ page }) => {
    const { errors } = await serve(page, 'errors');
    await loaded(page);
    await expect(page.locator('#CommentFormErrors')).toBeFocused();
    expect(errors).toEqual([]);
  });

  test('sau POST thành công: focus vào hộp role=status', async ({ page }) => {
    const { errors } = await serve(page, 'status');
    await loaded(page);
    await expect(page.getByTestId('comment-status')).toBeFocused();
    expect(errors).toEqual([]);
  });

  test('tải thường: không hộp → không cướp focus', async ({ page }) => {
    await serve(page, 'blank');
    await loaded(page);
    expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
  });

  test('gửi: nút aria-busy, bấm lại không gửi lần 2', async ({ page }) => {
    const { errors, posts } = await serve(page, 'blank');
    await loaded(page);
    const button = page.getByTestId('comment-submit');
    await page.locator('#CommentAuthor').fill('QA ES1-T473');
    await button.click({ noWaitAfter: true });
    await expect(button).toHaveAttribute('aria-busy', 'true');
    const second = await page.evaluate(() => {
      const f = document.querySelector<HTMLFormElement>('[data-testid="comment-form"]')!;
      const ev = new SubmitEvent('submit', { cancelable: true, bubbles: true });
      return f.dispatchEvent(ev);
    });
    expect(second, 'submit lần 2 bị preventDefault').toBe(false);
    await expect.poll(posts).toBe(1);
    expect(errors).toEqual([]);
  });

  test('form không hợp lệ (required trống): không gửi, nút không busy', async ({ page }) => {
    await serve(page, 'blank');
    await loaded(page);
    await page.getByTestId('comment-submit').click();
    await expect(page.getByTestId('comment-submit')).not.toHaveAttribute('aria-busy', /.*/);
  });

  test('listener khác chặn submit (captcha): nút không busy, gửi lại được', async ({ page }) => {
    await serve(page, 'blank');
    await loaded(page);
    await page.evaluate(() => document.addEventListener('submit', (e) => e.preventDefault(), { once: true }));
    await page.locator('#CommentAuthor').fill('QA');
    await page.getByTestId('comment-submit').click();
    await page.waitForTimeout(50);
    await expect(page.getByTestId('comment-submit')).not.toHaveAttribute('aria-busy', /.*/);
  });
});

test.describe('ES1-T473 store', () => {
  const ARTICLE = env('TE382_ARTICLE_PATH');

  test('AC13 768: related-articles được nâng cấp (data-enhanced), nút next cuộn hàng hoặc data-static', async ({ page }) => {
    test.fixme(!ARTICLE, 'thiếu TE382_ARTICLE_PATH');
    await page.setViewportSize({ width: 768, height: 900 });
    await page.goto(ARTICLE!);
    await expectNotChallenged(page);
    const root = page.getByTestId('related-articles');
    test.skip((await root.count()) === 0, 'blog chỉ có 1 bài');
    await root.scrollIntoViewIfNeeded();
    await expect(root).toHaveAttribute('data-enhanced', '');
    if ((await root.getAttribute('data-static')) === null) {
      const list = root.getByTestId('related-articles-list');
      await expect(root.getByTestId('related-articles-next')).toBeVisible();
      await root.getByTestId('related-articles-next').click();
      await expect.poll(() => list.evaluate((el) => Math.abs(el.scrollLeft))).toBeGreaterThan(0);
    } else {
      await expect(root.getByTestId('related-articles-next')).toBeHidden();
    }
  });

  test('AC12: gửi thiếu trường → focus hộp #CommentFormErrors sau khi trang tải lại', async ({ page }) => {
    test.fixme(!ARTICLE, 'thiếu TE382_ARTICLE_PATH');
    await page.goto(ARTICLE!);
    await expectNotChallenged(page);
    const form = page.getByTestId('comment-form');
    test.skip((await form.count()) === 0, 'blog của bài chưa bật bình luận');
    await form.evaluate((f: HTMLFormElement) => (f.noValidate = true));
    await form.locator('#CommentAuthor').fill('QA ES1-T473');
    const navigated = page.waitForEvent('framenavigated', { predicate: (f) => f === page.mainFrame(), timeout: 15_000 }).then(() => true, () => false);
    await form.getByTestId('comment-submit').click();
    const moved = await navigated;
    const captcha = (await page.locator('iframe[src*="hcaptcha"]').count()) > 0;
    test.skip(/^\/challenge/.test(new URL(page.url()).pathname) || (!moved && captcha), 'hCaptcha chặn submit tự động: chạy tay, ghi PR');
    await page.waitForLoadState('domcontentloaded');
    await expectNotChallenged(page);
    await expect(page.locator('#CommentFormErrors')).toBeFocused();
  });
});
