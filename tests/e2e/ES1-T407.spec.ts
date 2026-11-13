// ES1-T407 (TS-FE7): blog excerpt_or_content + ảnh responsive, article thông báo comment posted/moderated, page.contact form 3 trường.
// Nhóm @static đọc file repo, không cần store. Nhóm store cần dữ liệu (store-data.json hoặc env):
//   TE407_BLOG_PATH     blog có ít nhất 1 bài không excerpt nhưng có content (vd /blogs/figma-blog)
//   TE407_ARTICLE_PATH  bài thuộc blog bật comment + duyệt (moderated)
//   TE407_CONTACT_PATH  page gán template "contact" (mặc định /pages/contact)
// Thiếu dữ liệu → fixme (không tính đạt). hCaptcha sau submit (/challenge hoặc invisible giữ submit) → skip có lý do, chạy tay ghi PR.
import { test, expect, type Page } from '@playwright/test';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { env } from './support/store-data';
import { expectNotChallenged } from './support/store-guard';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

test.describe('ES1-T407 @static', () => {
  test('blog: excerpt_or_content | strip_html | truncatewords: 30, ảnh widths/sizes, bài đầu eager', () => {
    const src = read('templates/blog.liquid');
    expect(src).toContain('article.excerpt_or_content | strip_html | truncatewords: 30');
    expect(src).not.toMatch(/\{\{ article\.excerpt \}\}/);
    expect(src).toContain("widths: '360, 540, 720, 900, 1200'");
    expect(src).toMatch(/sizes: '[^']+'/);
    expect(src).toMatch(/if forloop\.first[\s\S]*'eager'[\s\S]*'lazy'/);
    expect(src).toContain("render 'image'");
  });

  test('article: ảnh bìa eager + high, hộp role=status tabindex=-1 theo blog.moderated?, giữ form.errors', () => {
    const src = read('templates/article.liquid');
    expect(src).toContain("loading: 'eager'");
    expect(src).toContain("fetchpriority: 'high'");
    expect(src).toContain("widths: '360, 540, 720, 900, 1200'");
    expect(src).toMatch(/form\.posted_successfully\?[\s\S]*role="status" tabindex="-1"[\s\S]*blog\.moderated\?[\s\S]*blog\.comment_pending_title[\s\S]*blog\.comment_posted/);
    expect(src).toMatch(/form\.errors/);
    expect(src).not.toContain('default_errors');
    expect(src).toMatch(/<button type="submit"/);
  });

  test('page.contact: tồn tại, form contact 3 trường có label thật, email + body required, success + errors', () => {
    expect(existsSync(join(process.cwd(), 'templates/page.contact.liquid'))).toBe(true);
    const src = read('templates/page.contact.liquid');
    expect(src).toContain("{% form 'contact'");
    for (const [id, name] of [['ContactName', 'contact[name]'], ['ContactEmail', 'contact[email]'], ['ContactBody', 'contact[body]']]) {
      expect(src, id).toContain(`<label for="${id}"`);
      expect(src, id).toContain(`name="${name}"`);
    }
    expect(src).toMatch(/id="ContactEmail"[\s\S]*?required/);
    expect(src).toMatch(/id="ContactBody"[\s\S]*?required/);
    expect(src).toMatch(/aria-describedby="ContactEmailError"/);
    expect(src).toContain('form.posted_successfully?');
    expect(src).toContain('class="rte"');
    expect(src).not.toMatch(/\{% schema %\}|<script/);
  });

  test('locale có đủ key, không trùng nhóm', () => {
    const raw = read('locales/en.default.json');
    expect(raw.match(/^ {2}"contact": \{/gm)?.length).toBe(1);
    expect(raw.match(/^ {2}"blog": \{/gm)?.length).toBe(1);
    const t = JSON.parse(raw);
    expect(t.blog.comment_pending_title).toBe('Thanks, your comment is in review');
    expect(t.blog.comment_pending_body).toBe('It appears here once a moderator approves it.');
    expect(t.blog.comment_posted).toBe('Your comment is posted.');
    expect(t.blog.comment_form_submit).toBe('Post Comment');
    expect(t.contact.success_title).toBe('Thanks for contacting us');
  });
});

/**
 * Bấm submit rồi chờ khung chính điều hướng thật (CI #210: chờ load state của trang cũ resolve ngay,
 * nên kiểm /challenge trên URL cũ rồi chờ phần tử của trang chưa tới → "element not found").
 * Dùng framenavigated thay vì so URL: POST /contact có thể quay về đúng URL cũ.
 * hCaptcha của Shopify: chuyển sang /challenge, hoặc invisible giữ submit không điều hướng → skip có lý do, chạy tay, ghi PR.
 * Không điều hướng mà không có hCaptcha → lỗi thật của form, fail.
 */
async function submitAndLoad(page: Page, submit: () => Promise<unknown>) {
  const navigated = page
    .waitForEvent('framenavigated', { predicate: (f) => f === page.mainFrame(), timeout: 15_000 })
    .then(() => true, () => false);
  await submit();
  const moved = await navigated;
  if (moved) await page.waitForLoadState('domcontentloaded');
  const captcha = (await page.locator('iframe[src*="hcaptcha"]').or(page.getByRole('img', { name: /hCaptcha/i })).count()) > 0;
  test.skip(/^\/challenge/.test(new URL(page.url()).pathname) || (!moved && captcha), 'hCaptcha chặn submit tự động: chạy tay, ghi PR');
  expect(moved, 'submit không điều hướng và không có hCaptcha').toBe(true);
  await expectNotChallenged(page);
}

test.describe('ES1-T407 store', () => {
  const BLOG = env('TE407_BLOG_PATH');
  const ARTICLE = env('TE407_ARTICLE_PATH');
  const CONTACT = env('TE407_CONTACT_PATH') ?? '/pages/contact';

  test('blog: mọi bài có content đều hiện trích đoạn, ảnh đầu eager, còn lại lazy', async ({ page }) => {
    test.fixme(!BLOG, 'thiếu TE407_BLOG_PATH (blog có bài không excerpt)');
    await page.goto(BLOG!);
    await expectNotChallenged(page);
    const articles = page.getByTestId('blog-article');
    const n = await articles.count();
    expect(n).toBeGreaterThan(0);
    for (let i = 0; i < n; i++) {
      await expect(articles.nth(i).getByTestId('blog-article-excerpt')).not.toHaveText('');
    }
    const imgs = page.locator('[data-testid="blog-article"] img');
    const count = await imgs.count();
    for (let i = 0; i < count; i++) {
      const img = imgs.nth(i);
      await expect(img).toHaveAttribute('sizes', /.+/);
      await expect(img).toHaveAttribute('srcset', /1200w/);
      await expect(img).toHaveAttribute('width', /\d+/);
      await expect(img).toHaveAttribute('height', /\d+/);
      const first = (await page.locator('[data-testid="blog-article"]').first().locator('img').count()) > 0 && i === 0;
      await expect(img).toHaveAttribute('loading', first ? 'eager' : 'lazy');
    }
  });

  test('article: POST comment trên blog duyệt → [role=status] chữ chờ duyệt', async ({ page }) => {
    test.fixme(!ARTICLE, 'thiếu TE407_ARTICLE_PATH (bài trên blog bật comment + duyệt)');
    await page.goto(ARTICLE!);
    await expectNotChallenged(page);
    await expect(page.getByTestId('article-cover').locator('img')).toHaveAttribute('fetchpriority', 'high');
    const form = page.getByTestId('comment-form');
    await form.locator('#CommentAuthor').fill('QA ES1-T407');
    await form.locator('#CommentEmail').fill('qa+es1-t407@example.com');
    await form.locator('#CommentBody').fill(`ES1-T407 kiểm thông báo duyệt ${Date.now()}`);
    await submitAndLoad(page, () => form.getByTestId('comment-submit').click());
    const status = page.getByTestId('comment-status');
    await expect(status).toHaveAttribute('role', 'status');
    await expect(status).toHaveAttribute('tabindex', '-1');
    await expect(status).toContainText('Thanks, your comment is in review');
    await expect(status).toContainText('It appears here once a moderator approves it.');
  });

  test('contact: thiếu email → lỗi có aria-describedby; đủ → hộp thành công', async ({ page }) => {
    const res = await page.goto(CONTACT);
    test.fixme(res?.status() === 404, `thiếu page ${CONTACT} gán template contact`);
    await expectNotChallenged(page);
    const form = page.getByTestId('contact-form');
    test.fixme((await form.count()) === 0, `page ${CONTACT} chưa gán template contact`);
    await expect(page.locator('h1')).toHaveCount(1);

    // Thiếu email: bỏ validation trình duyệt để server trả form.errors.
    await form.evaluate((f: HTMLFormElement) => (f.noValidate = true));
    await form.locator('#ContactBody').fill('ES1-T407 thiếu email');
    await submitAndLoad(page, () => form.getByTestId('contact-submit').click());
    await expect(page.getByTestId('contact-errors')).toBeVisible();
    const email = page.locator('#ContactEmail');
    await expect(email).toHaveAttribute('aria-invalid', 'true');
    await expect(email).toHaveAttribute('aria-describedby', 'ContactEmailError');
    await expect(page.locator('#ContactEmailError')).toHaveText('Enter an email like name@example.com.');
    await expect(page.locator('#ContactBody')).toHaveValue('ES1-T407 thiếu email');

    // Đủ trường
    const again = page.getByTestId('contact-form');
    await again.locator('#ContactEmail').fill('qa+es1-t407@example.com');
    await submitAndLoad(page, () => again.getByTestId('contact-submit').click());
    const status = page.getByTestId('contact-status');
    await expect(status).toHaveAttribute('role', 'status');
    await expect(status).toContainText('Thanks for contacting us');
  });
});
