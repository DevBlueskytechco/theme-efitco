// KHÔNG CHẮC: chưa chạy trên preview (phiên QA không có PREVIEW_URL/STORE_PASSWORD) — chờ CI store-tests của PR, chưa báo đạt. Store dev chỉ chắc có blog figma-blog (fixture ES1-T331);
// blog rỗng, nhiều trang, không tag, 1 bài, bài > 10 bình luận, bài tắt bình luận chưa có → fixme theo env (hỏi ES1-T507).
// ES1-T385 (TE-20-R2-QA1): docs/srs.md#TE-20 AC1–AC15 (0.5; thay TE-9 AC3, TE-6 AC6 bản 0.4) — trang blog và bài viết ở 4 mốc 360/768/1280/1920, mọi trạng thái.
// Test case: drafts/qa/ES1-T385/test-cases.md (TC-xx, B-xx trong tên test). Phạm vi AC: drafts/qa/ES1-T385/ac-scope.md.
// Không viết trùng: kiểm tĩnh template/schema/locale/CSS ở ES1-T381, ES1-T382, ES1-T403, ES1-T407; AC-H26/AC-H27 trang chủ ở TE-16.spec.ts.
// Spec này phủ ma trận 4 mốc có số đo, trạng thái rỗng/không ảnh/mất mạng/không JS, bàn phím, tên link, tương phản chữ trên ảnh trắng, LCP, axe mọi mức,
// SEO HTML, thuật toán bài liên quan, AC15 hai lớp nội dung. Gộp blog + bài viết 1 file theo ticket (1 story TE-20, 1 ticket QA).
// Ma trận 4 mốc dùng setViewportSize, chạy 1 lần ở project desktop; project mobile (Pixel 7) chạy B-01.
// Dữ liệu (env hoặc tests/e2e/store-data.json; thiếu → fixme/skip có lý do, KHÔNG tính đạt):
//   TE385_BLOG_PATH | TE381_BLOG_PATH | TE407_BLOG_PATH   blog ≥ 2 bài, có tag (mặc định /blogs/figma-blog)
//   TE385_EMPTY_BLOG_PATH, TE385_PAGED_BLOG_PATH | TE381_PAGED_BLOG_PATH, TE385_NO_TAG_BLOG_PATH, TE385_EDGE_BLOG_PATH
//   TE385_ARTICLE_NO_COVER_PATH | TE382_ARTICLE_NO_COVER_PATH, TE385_NO_COMMENTS_ARTICLE_PATH, TE385_COMMENTS_PAGED_PATH, TE385_SINGLE_ARTICLE_PATH
//   TE385_POST_COMMENT=1 (đăng bình luận thật), TE385_STORE_STATE=configured (AC15), FRESH_THEME_ID (theme mới cài, AC15)
// Bài có ảnh, bài không ảnh, trang tag tìm lúc chạy từ trang blog, không cứng handle bài.
// Phần JS do BE còn mở: ES1-T473 (focus hộp lỗi/thành công bình luận, chevron bài liên quan) → fixme gắn mã.
// Bug đã biết: test.fail gắn mã (ES1-T506 (ES1-T385-B01), ES1-T517 (B02, TC-14 360), ES1-T518 (B03), ES1-T520 (B04, TC-33 1280/1920)); khi bug sửa test đỏ lại → gỡ test.fail.
// Câu hỏi AC: ES1-T519 [Q] (AC14 bài không ảnh → LCP h1) — CI 20/11 đo LCP là <p>; TC-46b test.fail tới khi CTO chốt.
import { test, expect, type Browser, type Locator, type Page } from './support/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { env } from './support/store-data';
import { clickAndLoad, expectNotChallenged, gotoStore, watchStore } from './support/store-guard';
import { newStoreContext } from './support/store-noise';

const WIDTHS = [360, 768, 1280, 1920] as const;
const VIEW_H = 900;
const BLOG = (env('TE385_BLOG_PATH', 'TE381_BLOG_PATH', 'TE407_BLOG_PATH') ?? '/blogs/figma-blog').replace(/\/$/, '');
const EMPTY_TAG = `${BLOG}/tagged/es1-t385-khong-co`;
const EMPTY_BLOG = env('TE385_EMPTY_BLOG_PATH');
const PAGED_BLOG = env('TE385_PAGED_BLOG_PATH', 'TE381_PAGED_BLOG_PATH');
const NO_TAG_BLOG = env('TE385_NO_TAG_BLOG_PATH');
const EDGE_BLOG = env('TE385_EDGE_BLOG_PATH');
const NO_COVER_ENV = env('TE385_ARTICLE_NO_COVER_PATH', 'TE382_ARTICLE_NO_COVER_PATH');
const NO_COMMENTS = env('TE385_NO_COMMENTS_ARTICLE_PATH');
const COMMENTS_PAGED = env('TE385_COMMENTS_PAGED_PATH');
const SINGLE_ARTICLE = env('TE385_SINGLE_ARTICLE_PATH');
const POST_COMMENT = env('TE385_POST_COMMENT') === '1';
const STORE_STATE = env('TE385_STORE_STATE');
const FRESH_THEME_ID = process.env.FRESH_THEME_ID;
const STATE = 'tests/setup/state.json';
const BE_FOCUS = 'ES1-T473 (BE, Open): focus hộp lỗi/thành công sau khi tải lại chưa có';
const BE_ROW = 'ES1-T473 (BE, Open): related-articles chưa nạp scroll-buttons.js, nút chevron còn ẩn';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');
const desktopOnly = (name: string) => test.skip(name !== 'desktop', 'ma trận 4 mốc dùng setViewportSize, chạy 1 lần ở project desktop');
const pathOf = (href: string | null) => new URL(href ?? '', 'https://store.invalid').pathname.replace(/\/$/, '');
const handle = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const near = (actual: number, expected: number, tol = 2) => Math.abs(actual - expected) <= tol;

async function rect(l: Locator) {
  const b = await l.boundingBox();
  expect(b, 'phần tử không hiển thị').not.toBeNull();
  return b!;
}

const css = (l: Locator, prop: string, pseudo?: string) =>
  l.evaluate((el, [p, ps]) => getComputedStyle(el, ps || undefined).getPropertyValue(p as string), [prop, pseudo ?? ''] as const);

// Màu thật của 1 biến CSS trên trang (dạng rgb/rgba như computed style trả về).
const resolveColor = (page: Page, value: string) =>
  page.evaluate((v) => {
    const probe = document.createElement('span');
    probe.style.color = v;
    document.body.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  }, value);

const noHScroll = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

// a đứng trước b trong DOM.
async function before(a: Locator, b: Locator) {
  const other = await b.elementHandle();
  return a.evaluate((el, o) => !!o && (el.compareDocumentPosition(o) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0, other);
}

// --- Tương phản WCAG ---
type RGB = [number, number, number];
// Computed color: rgb()/rgba() (0–255) hoặc color(srgb r g b / a) (0–1) — Chrome trả dạng sau cho màu từ color-mix(in srgb, …).
function parseColor(c: string): { rgb: RGB; a: number } {
  const m = c.match(/rgba?\(([^)]+)\)/) ?? c.match(/color\(srgb\s+([^)]+)\)/);
  expect(m, `màu không đọc được: ${c}`).not.toBeNull();
  const parts = m![1].split(/[\s,/]+/).filter(Boolean).map(Number);
  const k = m![0].startsWith('color(') ? 255 : 1;
  return { rgb: [parts[0] * k, parts[1] * k, parts[2] * k], a: parts.length > 3 ? parts[3] : 1 };
}
const blend = (fg: { rgb: RGB; a: number }, bg: RGB): RGB => fg.rgb.map((v, i) => v * fg.a + bg[i] * (1 - fg.a)) as RGB;
const lum = (rgb: RGB) => {
  const [r, g, b] = rgb.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: RGB, b: RGB) => {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

// Pixel sáng nhất trong vùng chụp (nền xấu nhất cho chữ trắng). Giải PNG trong trang trắng riêng (không dính CSP của store).
async function brightestPixel(page: Page, clip: { x: number; y: number; width: number; height: number }): Promise<RGB> {
  const png = await page.screenshot({ clip });
  const scratch = await page.context().newPage();
  try {
    return await scratch.evaluate(async (b64) => {
      const img = new Image();
      img.src = `data:image/png;base64,${b64}`;
      await img.decode();
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let best: [number, number, number] = [0, 0, 0];
      let bestL = -1;
      for (let i = 0; i < d.length; i += 4) {
        const l = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
        if (l > bestL) {
          bestL = l;
          best = [d[i], d[i + 1], d[i + 2]];
        }
      }
      return best;
    }, png.toString('base64'));
  } finally {
    await scratch.close();
  }
}

// Phần tử LCP sau khi tải. testids: testid của phần tử và các tổ tiên.
async function lcp(page: Page): Promise<{ tag: string; testids: string[]; reveal: string | null }> {
  await page.waitForLoadState('load');
  const reading = page.evaluate(
    () =>
      new Promise<{ tag: string; testids: string[]; reveal: string | null }>((resolve) => {
        new PerformanceObserver((list, observer) => {
          const entries = list.getEntries();
          const last = (entries[entries.length - 1] as PerformanceEntry & { element?: Element | null }).element ?? null;
          observer.disconnect();
          const testids: string[] = [];
          let reveal: string | null = null;
          for (let n: Element | null = last; n; n = n.parentElement) {
            const id = n.getAttribute('data-testid');
            if (id) testids.push(id);
            reveal ??= n.getAttribute('data-reveal');
          }
          resolve({ tag: last ? last.tagName.toLowerCase() : '', testids, reveal });
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      }),
  );
  const none = new Promise<{ tag: string; testids: string[]; reveal: string | null }>((resolve) =>
    setTimeout(() => resolve({ tag: '(không có LCP)', testids: [], reveal: null }), 5_000),
  );
  return Promise.race([reading, none]);
}

// Accessibility 100: 0 vi phạm mọi mức. Bỏ khung preview và banner consent của Shopify (không phải theme).
async function axeViolations(page: Page, include = 'main') {
  await expectNotChallenged(page);
  const { violations } = await new AxeBuilder({ page })
    .exclude('#preview-bar-iframe')
    .exclude('#PBarNextFrameWrapper')
    .exclude('#shopify-pc__banner')
    .include(include)
    .analyze();
  return violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(', ')}`);
}

async function isNotFound(page: Page) {
  return (await page.getByTestId('not-found-heading').count()) > 0;
}

async function openBlog(page: Page, width: number, path = BLOG, height = VIEW_H) {
  await page.setViewportSize({ width, height });
  await gotoStore(page, path);
  test.fixme(await isNotFound(page), `store chưa có blog ${path} (fixture ES1-T331 / ES1-T507)`);
  await expect(page.getByTestId('blog-articles'), `${path} phải render block blog-articles`).toBeVisible();
}

async function openArticle(page: Page, width: number, path: string, height = VIEW_H) {
  await page.setViewportSize({ width, height });
  await gotoStore(page, path);
  test.fixme(await isNotFound(page), `store chưa có bài ${path}`);
  await expect(page.getByTestId('article-main'), `${path} phải render block article-main`).toBeVisible();
}

// Dòng số bài và eyebrow của snippet page-title chưa có data-testid (ES1-T507): bám text và cấu trúc.
const countLine = (page: Page) => page.getByTestId('page-title').locator('p').filter({ hasText: /\d+ articles?(\s|$)/ });
const eyebrowOf = (page: Page) => page.getByTestId('page-title').locator('p:has(+ h1)');
const topicsNav = (page: Page) => page.getByRole('navigation', { name: 'Blog topics' });

// Dữ liệu tìm từ trang blog 1 lần mỗi worker (CI 1 worker): bài có ảnh, bài không ảnh, trang tag, thứ tự bài.
type Discovery = { order: string[]; withCover?: string; noCover?: string; tagHref?: string; tagName?: string; longest?: string; paged: boolean };
let discovered: Discovery | undefined;
async function discover(page: Page): Promise<Discovery> {
  if (discovered) return discovered;
  await openBlog(page, 1280);
  const items: { href: string; image: boolean; title: string }[] = [];
  const featured = page.getByTestId('blog-articles-featured');
  if (await featured.count()) {
    const link = featured.getByTestId('blog-articles-featured-link');
    items.push({ href: pathOf(await link.getAttribute('href')), image: (await featured.locator('img').count()) > 0, title: ((await link.textContent()) ?? '').trim() });
  }
  for (const card of await page.getByTestId('blog-articles-grid').getByTestId('article-card').all()) {
    items.push({
      href: pathOf(await card.getByTestId('article-card-link').getAttribute('href')),
      image: (await card.getByTestId('article-card-image').count()) > 0,
      title: ((await card.getByTestId('article-card-title').textContent()) ?? '').trim(),
    });
  }
  const tag = topicsNav(page).getByRole('link').nth(1);
  const hasTag = (await tag.count()) > 0;
  discovered = {
    order: items.map((i) => i.href),
    withCover: items.find((i) => i.image)?.href,
    noCover: NO_COVER_ENV ?? items.find((i) => !i.image)?.href,
    tagHref: hasTag ? pathOf(await tag.getAttribute('href')) : undefined,
    tagName: hasTag ? ((await tag.textContent()) ?? '').trim() : undefined,
    longest: [...items].sort((a, b) => b.title.length - a.title.length)[0]?.href,
    paged: (await page.getByTestId('pagination').count()) > 0,
  };
  return discovered;
}

async function coverArticle(page: Page) {
  const d = await discover(page);
  test.fixme(!d.withCover, `blog ${BLOG} không có bài có ảnh`);
  return d.withCover!;
}

// Submit form có điều hướng; hCaptcha của Shopify chặn → skip có lý do (chạy tay, ghi báo cáo), như ES1-T382, ES1-T407.
async function submitAndLoad(page: Page, submit: () => Promise<unknown>) {
  const navigated = page
    .waitForEvent('framenavigated', { predicate: (f) => f === page.mainFrame(), timeout: 15_000 })
    .then(() => true, () => false);
  await submit();
  const moved = await navigated;
  if (moved) await page.waitForLoadState('domcontentloaded');
  const captcha = (await page.locator('iframe[src*="hcaptcha"]').count()) > 0;
  test.skip(/^\/challenge/.test(new URL(page.url()).pathname) || (!moved && captcha), 'hCaptcha chặn submit tự động: chạy tay, ghi báo cáo');
  expect(moved, 'submit không điều hướng và không có hCaptcha').toBe(true);
  await expectNotChallenged(page);
}

async function noJsPage(browser: Browser, width: number) {
  const context = await newStoreContext(browser, { javaScriptEnabled: false, storageState: STATE, viewport: { width, height: VIEW_H } });
  return { context, page: await context.newPage() };
}

// ============================================================ Trang blog
test.describe('ES1-T385 blog', () => {
  test('TC-01, TC-18 AC1, AC5: thứ tự breadcrumb → h1 → số bài → chủ đề → nổi bật → lưới; 1 trang không phân trang, ×4', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    for (const w of WIDTHS) {
      await openBlog(page, w);
      const root = page.getByTestId('blog-articles');
      const h1 = page.locator('h1');
      await expect(h1, `${w}: 1 h1`).toHaveCount(1);
      const bc = root.getByTestId('breadcrumb');
      await expect(bc.locator('li'), `${w}: breadcrumb Home / blog`).toHaveCount(2);
      await expect(bc.getByTestId('breadcrumb-current')).toHaveText(((await h1.textContent()) ?? '').trim());
      await expect(countLine(page), `${w}: dòng "N articles"`).toHaveCount(1);
      const chain: [string, Locator][] = [
        ['breadcrumb', bc],
        ['h1', root.getByTestId('page-title-heading')],
        ['số bài', countLine(page)],
        ['chủ đề', root.getByTestId('blog-articles-topics')],
        ['nổi bật', root.getByTestId('blog-articles-featured')],
        ['lưới', root.getByTestId('blog-articles-grid')],
      ];
      for (const [, l] of chain) await expect(l.first()).toBeVisible();
      for (let i = 0; i < chain.length - 1; i++) expect(await before(chain[i][1], chain[i + 1][1]), `${w}: ${chain[i][0]} trước ${chain[i + 1][0]}`).toBe(true);
      const n = Number(((await countLine(page).textContent()) ?? '').match(/\d+/)![0]);
      if (n <= 9) await expect(page.getByTestId('pagination'), `${w}: ${n} bài ≤ Articles per page (mặc định 9) → không phân trang`).toHaveCount(0);
      if ((await page.getByTestId('pagination').count()) === 0) await expect(root.getByTestId('article-card'), `${w}: N = 1 nổi bật + số card`).toHaveCount(n - 1);
    }
  });

  test('TC-02 AC1: bài nổi bật là bài mới nhất, 1 link trong h2, excerpt ≤ 30 từ, meta ngày · thời gian đọc', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    await openBlog(page, 1280);
    const featured = page.getByTestId('blog-articles-featured');
    await expect(featured.getByRole('link')).toHaveCount(1);
    await expect(featured.locator('h2 > a')).toHaveCount(1);
    const fDate = Date.parse((await featured.locator('time').getAttribute('datetime')) ?? '');
    expect(Number.isNaN(fDate), 'bài nổi bật có time[datetime]').toBe(false);
    const cardDates = await page.getByTestId('blog-articles-grid').locator('time').evaluateAll((els) => els.map((e) => e.getAttribute('datetime') ?? ''));
    for (const d of cardDates) expect(fDate, `nổi bật mới hơn card ${d}`).toBeGreaterThanOrEqual(Date.parse(d));
    const excerpt = featured.getByTestId('blog-articles-featured-excerpt');
    if (await excerpt.count()) {
      const text = (await excerpt.textContent()) ?? '';
      expect(words(text), 'excerpt ≤ 30 từ').toBeLessThanOrEqual(30);
      expect(text).not.toMatch(/<[a-z/]/i);
    } else test.info().annotations.push({ type: 'dữ liệu', description: 'bài nổi bật không có excerpt_or_content' });
    const meta = featured.getByTestId('blog-articles-featured-meta');
    await expect(meta.locator('time[datetime]')).toHaveCount(1);
    await expect(meta).toContainText(/\d+ min read/);
    const tag = featured.locator('p').first();
    if (await tag.count()) await expect(tag.locator('a')).toHaveCount(0);
  });

  test('TC-03 AC1: ảnh nổi bật 4/3 bo 16; 360 xếp dọc, ≥ 768 chữ bên phải ảnh, ×4', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    const SIZE: Record<number, [number, number]> = { 360: [320, 240], 768: [406, 305], 1280: [695, 521], 1920: [798, 599] };
    for (const w of WIDTHS) {
      await openBlog(page, w);
      const featured = page.getByTestId('blog-articles-featured');
      const media = featured.locator(':scope > div').nth(0);
      const body = featured.locator(':scope > div').nth(1);
      const m = await rect(media);
      const b = await rect(body);
      expect(Math.abs(m.width / m.height - 4 / 3), `${w}: tỉ lệ 4/3`).toBeLessThan(0.02);
      expect(await css(media, 'border-top-left-radius'), `${w}: bo 16`).toBe('16px');
      if (w < 768) expect(b.y, `${w}: chữ dưới ảnh`).toBeGreaterThanOrEqual(m.y + m.height - 1);
      else {
        expect(b.x, `${w}: chữ bên phải ảnh`).toBeGreaterThanOrEqual(m.x + m.width - 1);
        expect(b.y, `${w}: cùng hàng`).toBeLessThan(m.y + m.height);
      }
      expect.soft(near(m.width, SIZE[w][0]) && near(m.height, SIZE[w][1]), `${w}: ảnh ${m.width}×${m.height}, ui-spec ${SIZE[w].join('×')}`).toBe(true);
    }
  });

  test('TC-04 AC2: lưới 1/2/3/4/4 cột, card 320 / 292 / 336 rộng, cao theo 3/4, bo 16, không cuộn ngang', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    const CASES: [number, number, number, number][] = [[360, 1, 320, 427], [768, 2, 356, 475], [1024, 3, 0, 0], [1280, 4, 292, 389], [1920, 4, 336, 448]];
    for (const [w, cols, cw, ch] of CASES) {
      await openBlog(page, w);
      const grid = page.getByTestId('blog-articles-grid');
      expect(await grid.evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length), `${w}: số cột`).toBe(cols);
      const link = grid.getByTestId('article-card-link').first();
      const r = await rect(link);
      expect(r.height, `${w}: cao ≥ rộng × 4/3`).toBeGreaterThanOrEqual((r.width * 4) / 3 - 2);
      expect(await css(link, 'border-top-left-radius')).toBe('16px');
      if (cw) {
        expect(near(r.width, cw), `${w}: rộng ${r.width}, cần ${cw}`).toBe(true);
        expect.soft(near(r.height, ch), `${w}: cao ${r.height}, cần ${ch} (tên dài được cao thêm)`).toBe(true);
      }
      expect(await noHScroll(page), `${w}: không cuộn ngang`).toBe(true);
    }
  });

  test('TC-05 AC2, AC7: mỗi card 1 link, tên link = tiêu đề bài', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    test.fail(true, 'ES1-T506 (ES1-T385-B01): link card bọc tag, trích đoạn, meta nên tên truy cập dài hơn tiêu đề');
    await openBlog(page, 1280);
    const cards = page.getByTestId('blog-articles-grid').getByTestId('article-card');
    expect(await cards.count()).toBeGreaterThan(0);
    for (const card of await cards.all()) {
      await expect(card.getByRole('link')).toHaveCount(1);
      const title = ((await card.getByTestId('article-card-title').textContent()) ?? '').trim();
      await expect(card.getByTestId('article-card-link')).toHaveAccessibleName(title);
    }
  });

  test('TC-06 AC2: tiêu đề hiện đủ, excerpt ≤ 20 từ, meta time + "N min read", tag không phải link, ảnh alt rỗng, ×4', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    for (const w of WIDTHS) {
      await openBlog(page, w);
      for (const card of await page.getByTestId('blog-articles-grid').getByTestId('article-card').all()) {
        const link = await rect(card.getByTestId('article-card-link'));
        const title = card.getByTestId('article-card-title');
        const t = await title.evaluate((el) => {
          const s = getComputedStyle(el);
          const r = el.getBoundingClientRect();
          return { clamp: s.getPropertyValue('-webkit-line-clamp'), overflow: s.textOverflow, fits: el.scrollHeight <= el.clientHeight + 1, text: el.textContent ?? '', top: r.top, bottom: r.bottom };
        });
        expect(t.clamp === 'none' || t.clamp === '', `${w}: không line-clamp`).toBe(true);
        expect(t.overflow, `${w}: không ellipsis`).not.toBe('ellipsis');
        expect(t.fits && !t.text.includes('…'), `${w}: tiêu đề "${t.text.trim()}" hiện đủ`).toBe(true);
        expect(t.top >= link.y - 1 && t.bottom <= link.y + link.height + 1, `${w}: tiêu đề nằm trong card (không bị clip)`).toBe(true);
        const excerpt = card.getByTestId('article-card-excerpt');
        if (await excerpt.count()) {
          const e = (await excerpt.textContent()) ?? '';
          expect(words(e), `${w}: excerpt ≤ 20 từ`).toBeLessThanOrEqual(20);
          expect(e).not.toMatch(/<[a-z/]/i);
        }
        await expect(card.getByTestId('article-card-meta').locator('time[datetime]')).toHaveCount(1);
        const rt = card.getByTestId('article-card-read-time');
        if (await rt.count()) await expect(rt).toHaveText(/^\s*\d+ min read\s*$/);
        const tag = card.getByTestId('article-card-tag');
        if (await tag.count()) {
          expect(await tag.evaluate((el) => el.tagName)).toBe('P');
          await expect(tag.locator('a')).toHaveCount(0);
        }
        for (const img of await card.locator('img').all()) await expect(img).toHaveAttribute('alt', '');
      }
    }
  });

  test('TC-07 AC2 (kiểm mockup trên store): card không ảnh → nền --color-background-dark, chữ ≥ 17:1, giữ kích thước', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    for (const w of [360, 1280]) {
      await openBlog(page, w);
      const card = page.getByTestId('blog-articles-grid').getByTestId('article-card').first();
      const link = card.getByTestId('article-card-link');
      const sizeBefore = await rect(link);
      await card.getByTestId('article-card-image').evaluate((el) => el.remove());
      const sizeAfter = await rect(link);
      expect(near(sizeAfter.width, sizeBefore.width, 1) && near(sizeAfter.height, sizeBefore.height, 1), `${w}: giữ kích thước card`).toBe(true);
      const dark = await resolveColor(page, 'var(--color-background-dark)');
      const fg = await resolveColor(page, 'var(--color-background-dark-foreground)');
      expect(await css(link, 'background-color'), `${w}: nền tối`).toBe(dark);
      expect(await css(card.getByTestId('article-card-title'), 'color'), `${w}: chữ trắng`).toBe(fg);
      expect(contrast(parseColor(fg).rgb, parseColor(dark).rgb), `${w}: tương phản`).toBeGreaterThanOrEqual(17);
    }
  });

  test('TC-08 AC2: bài không tag → không pill; content rỗng → chỉ còn ngày', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    test.fixme(!EDGE_BLOG, 'thiếu TE385_EDGE_BLOG_PATH (blog có bài không tag, bài content rỗng — ES1-T507)');
    await openBlog(page, 1280, EDGE_BLOG!);
    let noTag = 0;
    let noTime = 0;
    for (const card of await page.getByTestId('article-card').all()) {
      if ((await card.getByTestId('article-card-tag').count()) === 0) noTag++;
      if ((await card.getByTestId('article-card-read-time').count()) === 0) {
        noTime++;
        await expect(card.getByTestId('article-card-date')).toHaveCount(1);
        await expect(card.getByTestId('article-card-meta')).not.toContainText('min read');
      }
    }
    expect(noTag, 'có ≥ 1 card không pill').toBeGreaterThan(0);
    expect(noTime, 'có ≥ 1 card không thời gian đọc').toBeGreaterThan(0);
  });

  test('TC-09 AC3: nav "Blog topics" link All + tag, đúng 1 aria-current, không role=tab; 360 một hàng cuộn ngang, ×4', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    for (const w of WIDTHS) {
      await openBlog(page, w);
      const nav = topicsNav(page);
      await expect(nav, `${w}: nav Blog topics`).toBeVisible();
      const links = nav.getByRole('link');
      expect(await links.count(), `${w}: All + ≥ 1 tag`).toBeGreaterThanOrEqual(2);
      await expect(links.first()).toHaveText('All');
      expect(pathOf(await links.first().getAttribute('href'))).toBe(BLOG);
      await expect(links.first()).toHaveAttribute('aria-current', 'page');
      await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
      for (const l of (await links.all()).slice(1)) await expect(l).toHaveAttribute('href', /\/tagged\//);
      await expect(page.getByTestId('blog-articles').locator('[role="tab"], [role="tablist"]')).toHaveCount(0);
      if (w === 360) {
        const ys = await links.evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
        expect(new Set(ys).size, '360: 1 hàng').toBe(1);
        expect(await css(nav.locator('ul'), 'overflow-x')).toBe('auto');
      }
      expect(await noHScroll(page), `${w}: không cuộn ngang`).toBe(true);
    }
  });

  test('TC-10 AC3: 360 × 800 và 640 × 450 (1280 phóng 200%) trang không cuộn ngang', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    for (const [w, h] of [[360, 800], [640, 450]] as const) {
      await openBlog(page, w, BLOG, h);
      expect(await noHScroll(page), `${w}×${h}`).toBe(true);
      const ul = topicsNav(page).locator('ul');
      const o = await ul.evaluate((el) => ({ sw: el.scrollWidth, cw: el.clientWidth, ox: getComputedStyle(el).overflowX }));
      if (o.sw > o.cw) expect(o.ox, `${w}: chủ đề tràn thì cuộn trong khung riêng`).toBe('auto');
    }
  });

  test('TC-11 AC3: bấm tag → breadcrumb 3 mục, "N articles tagged {tag}", aria-current tag, không nổi bật, lưới ngay sau nav, ×4', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    for (const w of WIDTHS) {
      await openBlog(page, w);
      const tag = topicsNav(page).getByRole('link').nth(1);
      const name = ((await tag.textContent()) ?? '').trim();
      await clickAndLoad(page, () => tag.click());
      await expect(page).toHaveURL(/\/tagged\//);
      const bc = page.getByTestId('breadcrumb');
      await expect(bc.locator('li'), `${w}: Home / blog / tag`).toHaveCount(3);
      expect(pathOf(await bc.locator('li').nth(1).locator('a').getAttribute('href'))).toBe(BLOG);
      const current = ((await bc.getByTestId('breadcrumb-current').textContent()) ?? '').trim();
      expect(handle(current), `${w}: breadcrumb mục cuối là tag`).toBe(handle(name));
      expect.soft(current, `${w}: breadcrumb hiện tên tag như nav (không dạng handle)`).toBe(name);
      await expect(page.getByTestId('page-title').locator('p').filter({ hasText: /\d+ articles? tagged / })).toHaveCount(1);
      const nav = topicsNav(page);
      await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
      await expect(nav.locator('[aria-current="page"]')).toHaveText(name);
      await expect(nav.getByRole('link').first()).not.toHaveAttribute('aria-current', /.+/);
      await expect(page.getByTestId('blog-articles-featured')).toHaveCount(0);
      expect(await page.getByTestId('blog-articles-topics').evaluate((el) => (el.nextElementSibling as HTMLElement | null)?.dataset.testid), `${w}: lưới ngay sau nav`).toBe('blog-articles-grid');
    }
  });

  test('TC-12 AC3 không JS: lọc bằng link, kết quả như có JS', async ({ page, browser }, ti) => {
    desktopOnly(ti.project.name);
    const { context, page: nojs } = await noJsPage(browser, 1280);
    try {
      await gotoStore(nojs, BLOG);
      test.fixme(await isNotFound(nojs), `store chưa có blog ${BLOG}`);
      const tag = topicsNav(nojs).getByRole('link').nth(1);
      await clickAndLoad(nojs, () => tag.click());
      await expect(nojs).toHaveURL(/\/tagged\//);
      await expect(nojs.getByTestId('blog-articles-featured')).toHaveCount(0);
      const hrefsNoJs = await nojs.getByTestId('article-card-link').evaluateAll((els) => els.map((e) => e.getAttribute('href')));
      expect(hrefsNoJs.length).toBeGreaterThan(0);
      await page.setViewportSize({ width: 1280, height: VIEW_H });
      await gotoStore(page, new URL(nojs.url()).pathname);
      const hrefsJs = await page.getByTestId('article-card-link').evaluateAll((els) => els.map((e) => e.getAttribute('href')));
      expect(hrefsNoJs).toEqual(hrefsJs);
    } finally {
      await context.close();
    }
  });

  test('TC-13 AC3: blog không tag → không nav chủ đề', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    test.fixme(!NO_TAG_BLOG, 'thiếu TE385_NO_TAG_BLOG_PATH (blog có bài nhưng không tag — ES1-T507)');
    await openBlog(page, 1280, NO_TAG_BLOG!);
    await expect(page.getByTestId('blog-articles-topics')).toHaveCount(0);
  });

  // TC-14 tách theo mốc: 360 vướng bug ES1-T517 (test.fail), 1280 là test thường.
  for (const w of [360, 1280] as const) {
    test(`TC-14 AC3, AC7 bàn phím ${w}: Tab tới chủ đề cuối, outline hiện, link nằm trọn trong khung cuộn`, async ({ page }, ti) => {
      desktopOnly(ti.project.name);
      test.fail(w === 360, 'ES1-T517 (ES1-T385-B02): 360 Tab tới chủ đề cuối, khung cuộn không cuộn hết, link và outline bị cắt mép phải');
      await openBlog(page, w);
      const links = topicsNav(page).getByRole('link');
      const n = await links.count();
      await links.first().focus();
      for (let i = 1; i < n; i++) await page.keyboard.press('Tab');
      const last = links.nth(n - 1);
      await expect(last).toBeFocused();
      expect(await css(last, 'outline-style'), `${w}: outline focus`).not.toBe('none');
      const l = await rect(last);
      const ul = await rect(topicsNav(page).locator('ul'));
      expect(l.x >= ul.x - 1 && l.x + l.width <= ul.x + ul.width + 1, `${w}: link focus nằm trọn trong khung`).toBe(true);
    });
  }

  test('TC-15 AC4: tag không còn bài → giữ nav, "No Articles On This Topic", primary "View All Articles", ×4', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    for (const w of WIDTHS) {
      await page.setViewportSize({ width: w, height: VIEW_H });
      const res = await page.goto(EMPTY_TAG);
      await expectNotChallenged(page);
      test.fixme(await isNotFound(page), `store chưa có blog ${BLOG}`);
      expect(res?.status(), `${w}: HTTP 200`).toBe(200);
      await expect(page.getByTestId('blog-articles-topics')).toBeVisible();
      await expect(page.getByTestId('page-title').locator('p').filter({ hasText: /articles?/ })).toHaveCount(0);
      await expect(page.getByTestId('blog-articles-featured')).toHaveCount(0);
      await expect(page.getByTestId('article-card')).toHaveCount(0);
      await expect(page.getByTestId('pagination')).toHaveCount(0);
      const heading = page.getByTestId('blog-articles-empty-heading');
      await expect(heading).toHaveText('No Articles On This Topic');
      expect(await heading.evaluate((el) => el.tagName)).toBe('H2');
      await expect(page.getByTestId('blog-articles-empty')).toContainText('Try another topic above or browse every article.');
      const button = page.getByTestId('blog-articles-empty-button');
      await expect(button).toHaveText('View All Articles');
      expect(pathOf(await button.getAttribute('href'))).toBe(BLOG);
      await expect(button).toHaveClass(/(^|\s)button(\s|$)/);
      await expect(button).not.toHaveClass(/button--secondary/);
      expect(await noHScroll(page), `${w}: không cuộn ngang`).toBe(true);
    }
  });

  test('TC-16 AC4: blog 0 bài → không nav, không số bài, "No Articles Yet", "Explore Equipment", "Back to homepage", ×4', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    test.fixme(!EMPTY_BLOG, 'thiếu TE385_EMPTY_BLOG_PATH (blog 0 bài — ES1-T507)');
    for (const w of WIDTHS) {
      await openBlog(page, w, EMPTY_BLOG!);
      await expect(page.getByTestId('blog-articles-topics')).toHaveCount(0);
      await expect(page.getByTestId('page-title').locator('p').filter({ hasText: /articles?/ })).toHaveCount(0);
      await expect(page.getByTestId('blog-articles-empty-heading')).toHaveText('No Articles Yet');
      await expect(page.getByTestId('blog-articles-empty-button')).toHaveText('Explore Equipment');
      expect(pathOf(await page.getByTestId('blog-articles-empty-button').getAttribute('href'))).toBe('/collections/all');
      await expect(page.getByTestId('blog-articles-empty-link')).toHaveText('Back to homepage');
      expect(pathOf(await page.getByTestId('blog-articles-empty-link').getAttribute('href'))).toBe('');
      expect(await noHScroll(page)).toBe(true);
    }
  });

  test('TC-17, TC-19 AC4, AC5, TE-6 AC6: trang 1 có 1 nổi bật + 8 card, phân trang neo #blog-grid; trang 2 không nổi bật, card đầu eager', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    test.fixme(!PAGED_BLOG, 'thiếu TE385_PAGED_BLOG_PATH (blog > 9 bài — ES1-T507)');
    for (const w of WIDTHS) {
      await openBlog(page, w, PAGED_BLOG!);
      await expect(page.getByTestId('blog-articles-featured')).toHaveCount(1);
      await expect(page.getByTestId('blog-articles-grid').getByTestId('article-card'), `${w}: 9 bài/trang = 1 + 8`).toHaveCount(8);
      const nav = page.getByTestId('pagination');
      await expect(nav).toBeVisible();
      await expect(page.getByTestId('pagination-previous-disabled')).toHaveAttribute('aria-disabled', 'true');
      for (const href of await nav.locator('a[href]').evaluateAll((els) => els.map((e) => e.getAttribute('href') ?? ''))) expect(href, `${w}: neo`).toMatch(/#blog-grid$/);
      if (w < 768) await expect(page.getByTestId('pagination-status')).toHaveText(/Page 1 of \d+/);
    }
    await clickAndLoad(page, () => page.getByTestId('pagination-next').click());
    expect(new URL(page.url()).searchParams.get('page')).toBe('2');
    expect(new URL(page.url()).hash).toBe('#blog-grid');
    await expect(page.getByTestId('blog-articles-featured')).toHaveCount(0);
    const first = page.getByTestId('article-card').first().locator('img');
    await expect(first).toHaveAttribute('loading', 'eager');
    await expect(first).toHaveAttribute('fetchpriority', 'high');
    await expect(page).toHaveTitle(/Page 2/);
  });

  test('TC-20 AC6: <title> có tên blog; trang tag có "tagged" + tag', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    await openBlog(page, 1280);
    const title = ((await page.locator('h1').textContent()) ?? '').trim();
    expect(await page.title()).toContain(title);
    const tag = topicsNav(page).getByRole('link').nth(1);
    const name = ((await tag.textContent()) ?? '').trim();
    await clickAndLoad(page, () => tag.click());
    const t = (await page.title()).toLowerCase();
    expect(t).toContain(title.toLowerCase());
    // KHÔNG CHẮC 5: AC ghi "Tagged {tag}", meta-tags in 'tagged "{current_tags}"'; so không phân biệt hoa thường, tag theo tên hoặc handle.
    expect(t).toContain('tagged');
    expect(t.includes(name.toLowerCase()) || t.includes(handle(name)), `title "${t}" có tag ${name}`).toBe(true);
  });

  test('TC-22 AC6: ảnh nổi bật là ảnh eager + high duy nhất, còn lại lazy, đủ width/height, 0 JS riêng, ×4', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    for (const w of WIDTHS) {
      await openBlog(page, w);
      const featuredImg = page.getByTestId('blog-articles-featured').locator('img');
      test.fixme((await featuredImg.count()) === 0, 'bài mới nhất không có ảnh');
      await expect(page.locator('main img[loading="eager"]'), `${w}: 1 ảnh eager`).toHaveCount(1);
      await expect(featuredImg).toHaveAttribute('loading', 'eager');
      await expect(featuredImg).toHaveAttribute('fetchpriority', 'high');
      const imgs = await page.locator('main img').evaluateAll((els) =>
        els.map((e) => ({ loading: e.getAttribute('loading'), w: e.getAttribute('width'), h: e.getAttribute('height'), featured: !!e.closest('[data-testid="blog-articles-featured"]') })),
      );
      for (const i of imgs) {
        if (!i.featured) expect(i.loading, `${w}: ảnh không phải LCP lazy`).toBe('lazy');
        expect(Number(i.w) > 0 && Number(i.h) > 0, `${w}: ảnh có width/height`).toBe(true);
      }
      await expect(page.locator('main script[src]')).toHaveCount(0);
      await expect(page.getByTestId('blog-articles').locator('[data-lazy-module]')).toHaveCount(0);
    }
  });

  test('TC-23 AC6: LCP là ảnh nổi bật, không hiện dần (LCP và h2 nổi bật không data-reveal), ×4', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    for (const w of WIDTHS) {
      await openBlog(page, w);
      const entry = await lcp(page);
      expect(entry.tag === 'img' && entry.testids.includes('blog-articles-featured'), `${w}: LCP ${entry.tag} [${entry.testids.join(' < ')}]`).toBe(true);
      expect(entry.reveal, `${w}: LCP không hiện dần`).toBeNull();
      expect(await page.getByTestId('blog-articles-featured').locator('h2').getAttribute('data-reveal'), `${w}: h2 nổi bật không hiện dần`).toBeNull();
    }
  });

  test('TC-24 AC6: trang tag → ảnh card đầu là ảnh eager + high duy nhất, ×4', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    const d = await discover(page);
    test.fixme(!d.tagHref, `blog ${BLOG} không có tag`);
    for (const w of WIDTHS) {
      await openBlog(page, w, d.tagHref!);
      const first = page.getByTestId('article-card').first().locator('img');
      test.fixme((await first.count()) === 0, 'bài đầu của trang tag không có ảnh');
      await expect(page.locator('main img[loading="eager"]'), `${w}: 1 ảnh eager`).toHaveCount(1);
      await expect(first).toHaveAttribute('loading', 'eager');
      await expect(first).toHaveAttribute('fetchpriority', 'high');
      for (const img of (await page.getByTestId('article-card').locator('img').all()).slice(1)) await expect(img).toHaveAttribute('loading', 'lazy');
    }
  });

  test('TC-25 AC7: 1 h1, nổi bật và card là h2, 0 h3 trong lưới, time có datetime ISO, ×4', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    for (const w of WIDTHS) {
      await openBlog(page, w);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.getByTestId('blog-articles-featured').locator('h2')).toHaveCount(1);
      const tags = await page.getByTestId('blog-articles-grid').getByTestId('article-card-title').evaluateAll((els) => els.map((e) => e.tagName));
      expect(tags.length).toBeGreaterThan(0);
      expect(new Set(tags), `${w}: card h2`).toEqual(new Set(['H2']));
      await expect(page.getByTestId('blog-articles-grid').locator('h3')).toHaveCount(0);
      for (const dt of await page.getByTestId('blog-articles').locator('time').evaluateAll((els) => els.map((e) => e.getAttribute('datetime') ?? ''))) {
        expect(dt, `${w}: datetime ISO`).toMatch(/^\d{4}-\d{2}-\d{2}/);
      }
    }
  });

  test('TC-26 AC7: vùng chạm link chủ đề 44 dưới 80rem, 40 từ 80rem, ×4', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    for (const w of WIDTHS) {
      await openBlog(page, w);
      const min = w < 1280 ? 44 : 40;
      for (const l of await topicsNav(page).getByRole('link').all()) expect((await rect(l)).height, `${w}: cao ≥ ${min}`).toBeGreaterThanOrEqual(min - 0.5);
    }
  });

  test('TC-27 AC7: ảnh card trắng tinh → tiêu đề, trích đoạn, meta ≥ 4.5:1', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const WHITE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="8" height="8"%3E%3Crect width="8" height="8" fill="%23fff"/%3E%3C/svg%3E';
    for (const w of [360, 1280]) {
      await openBlog(page, w);
      const card = page.getByTestId('blog-articles-grid').getByTestId('article-card').first();
      const img = card.locator('img');
      test.fixme((await img.count()) === 0, 'card đầu không có ảnh');
      await card.scrollIntoViewIfNeeded();
      await img.evaluate(async (el: HTMLImageElement, src) => {
        el.removeAttribute('srcset');
        el.removeAttribute('sizes');
        el.loading = 'eager';
        el.src = src;
        await el.decode();
      }, WHITE);
      await page.mouse.move(0, 0);
      const link = await rect(card.getByTestId('article-card-link'));
      for (const id of ['article-card-title', 'article-card-excerpt', 'article-card-meta']) {
        const el = card.getByTestId(id);
        if ((await el.count()) === 0) continue;
        const r = await rect(el);
        const bg = await brightestPixel(page, { x: Math.round(link.x + 6), y: Math.round(r.y), width: 3, height: Math.max(1, Math.round(r.height)) });
        const fg = blend(parseColor(await css(el, 'color')), bg);
        const ratio = contrast(fg, bg);
        expect(ratio, `${w} ${id}: ${ratio.toFixed(2)}:1 trên nền rgb(${bg.join(',')})`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  test('TC-28 AC7: axe 0 vi phạm mọi mức trên blog và trang tag rỗng, ×4', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    for (const w of WIDTHS) {
      await openBlog(page, w);
      expect(await axeViolations(page), `${w}: blog`).toEqual([]);
      await gotoStore(page, EMPTY_TAG);
      expect(await axeViolations(page), `${w}: tag rỗng`).toEqual([]);
    }
  });

  test('TC-29 AC8: card trang chủ không ngày, không excerpt, tiêu đề h3 (AC-H26, AC-H27 ở TE-16.spec.ts)', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    for (const w of [360, 1280]) {
      await page.setViewportSize({ width: w, height: VIEW_H });
      await gotoStore(page, '/');
      const row = page.getByTestId('blog-posts');
      test.skip((await row.getByTestId('article-card').count()) === 0, 'trang chủ không có block blog posts có bài');
      await expect(row.getByTestId('article-card-date')).toHaveCount(0);
      await expect(row.getByTestId('article-card-excerpt')).toHaveCount(0);
      await expect(row.getByTestId('article-card-meta')).toHaveCount(0);
      expect(new Set(await row.getByTestId('article-card-title').evaluateAll((els) => els.map((e) => e.tagName)))).toEqual(new Set(['H3']));
    }
  });
});

// ============================================================ Trang bài viết
test.describe('ES1-T385 bài viết', () => {
  test('TC-30 AC9: ảnh bìa 320×240 / 728×410 / 1240×570 / 1416×651, bo 16, dưới header 16/24, không chữ, eager + high, ×4', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    const path = await coverArticle(page);
    const SIZE: Record<number, [number, number]> = { 360: [320, 240], 768: [728, 410], 1280: [1240, 570], 1920: [1416, 651] };
    for (const w of WIDTHS) {
      await openArticle(page, w, path);
      const cover = page.getByTestId('article-cover');
      const c = await rect(cover);
      expect(near(c.width, SIZE[w][0]) && near(c.height, SIZE[w][1]), `${w}: ${c.width}×${c.height}, cần ${SIZE[w].join('×')}`).toBe(true);
      expect(await css(cover, 'border-top-left-radius')).toBe('16px');
      const header = await rect(page.getByTestId('header'));
      const gap = c.y - (header.y + header.height);
      expect(near(gap, w < 1024 ? 16 : 24), `${w}: cách header ${gap}`).toBe(true);
      expect(((await cover.innerText()) ?? '').trim(), `${w}: không chữ trên ảnh`).toBe('');
      for (const ps of ['::before', '::after']) {
        const layer = await cover.evaluate((el, p) => {
          const s = getComputedStyle(el, p);
          return { content: s.content, image: s.backgroundImage, color: s.backgroundColor };
        }, ps);
        expect(layer.content === 'none' || (layer.image === 'none' && /rgba\(0, 0, 0, 0\)|transparent/.test(layer.color)), `${w}: ${ps} không phải lớp tối`).toBe(true);
      }
      const img = cover.locator('img');
      await expect(img).toHaveAttribute('loading', 'eager');
      await expect(img).toHaveAttribute('fetchpriority', 'high');
      expect(await img.getAttribute('alt'), `${w}: có thuộc tính alt (alt Shopify)`).not.toBeNull();
      await expect(page.locator('main img[loading="eager"]'), `${w}: ảnh bìa là ảnh eager duy nhất`).toHaveCount(1);
    }
  });

  test('TC-31 AC9: bài không ảnh → không khung ảnh, không ảnh eager, cột đọc ngay dưới header, ×4', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    const d = await discover(page);
    test.fixme(!d.noCover, 'không có bài không ảnh (TE385_ARTICLE_NO_COVER_PATH — ES1-T507)');
    for (const w of WIDTHS) {
      await openArticle(page, w, d.noCover!);
      await expect(page.getByTestId('article-cover')).toHaveCount(0);
      await expect(page.locator('main img[loading="eager"]')).toHaveCount(0);
      const header = await rect(page.getByTestId('header'));
      const bc = await rect(page.getByTestId('article-main').getByTestId('breadcrumb'));
      expect(bc.y - (header.y + header.height), `${w}: breadcrumb ngay dưới header`).toBeLessThanOrEqual(32);
    }
  });

  test('TC-32 AC10: cột đọc 320 / 728 / 736 giữa; breadcrumb 3 mục; tag 44; meta; .rte; Topics; Back to {blog} 44, ×4', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    const path = await coverArticle(page);
    const COL: Record<number, number> = { 360: 320, 768: 728, 1280: 736, 1920: 736 };
    for (const w of WIDTHS) {
      await openArticle(page, w, path);
      const main = page.getByTestId('article-main');
      const head = await rect(main.locator('header'));
      expect(near(head.width, COL[w], 1), `${w}: cột đọc ${head.width}, cần ${COL[w]}`).toBe(true);
      if (w >= 1280) {
        const vw = await page.evaluate(() => document.documentElement.clientWidth);
        expect(near(head.x + head.width / 2, vw / 2, 2), `${w}: căn giữa`).toBe(true);
      }
      const h1 = ((await page.locator('h1').textContent()) ?? '').trim();
      const bc = main.getByTestId('breadcrumb');
      await expect(bc.locator('li')).toHaveCount(3);
      const blogLink = bc.locator('li').nth(1).locator('a');
      const blogTitle = ((await blogLink.textContent()) ?? '').trim();
      expect(pathOf(await blogLink.getAttribute('href'))).toMatch(/^\/blogs\/[^/]+$/);
      await expect(bc.getByTestId('breadcrumb-current')).toHaveText(h1);
      const tag = main.getByTestId('article-main-tag');
      if (await tag.count()) {
        await expect(tag).toHaveAttribute('href', /\/tagged\//);
        const hit = await tag.evaluate((el) => el.getBoundingClientRect().height - 2 * Math.min(0, parseFloat(getComputedStyle(el, '::after').insetBlockStart) || 0));
        expect(hit, `${w}: vùng chạm tag`).toBeGreaterThanOrEqual(44);
      }
      const meta = main.getByTestId('article-main-meta');
      await expect(meta.locator('time[datetime]')).toHaveCount(1);
      if (await main.getByTestId('article-content').count()) await expect(main.getByTestId('article-main-read-time')).toHaveText(/^\s*\d+ min read\s*$/);
      await expect(main.getByTestId('article-content')).toHaveClass(/(^|\s)rte(\s|$)/);
      const topics = main.getByTestId('article-main-topics');
      if (await tag.count()) {
        await expect(topics).toContainText('Topics');
        const hrefs = await topics.getByRole('link').evaluateAll((els) => els.map((e) => e.getAttribute('href') ?? ''));
        expect(hrefs.length).toBeGreaterThan(0);
        for (const h of hrefs) expect(h).toMatch(/\/tagged\//);
        expect(hrefs).toContain(await tag.getAttribute('href'));
      } else await expect(topics).toHaveCount(0);
      const back = main.getByTestId('article-main-back');
      await expect(back).toHaveText(`Back to ${blogTitle}`);
      expect(pathOf(await back.getAttribute('href'))).toBe(pathOf(await blogLink.getAttribute('href')));
      expect((await rect(back)).height, `${w}: Back cao ≥ 44`).toBeGreaterThanOrEqual(44);
      expect(await noHScroll(page), `${w}: không cuộn ngang`).toBe(true);
    }
  });

  // srs TE-10 AC15 (sổ 11/11, TS-FE5 ES1-T403) + foundation §28 (CTO 11/11, "Thay §4 article.md"): đoạn .rte 16px / lh 1.7 mọi mốc.
  // Văn bản chốt sau thắng bảng mốc cũ article.md §3 (18 / 1.7 ở 1280, 1920). Theme aux.css (.article-main .rte font-size-lg từ 64rem) lệch → bug ES1-T520.
  async function rteParagraph(page: Page, w: number, path: string) {
    await openArticle(page, w, path);
    const p = page.getByTestId('article-content').locator('p').first();
    test.fixme((await p.count()) === 0, 'bài không có đoạn văn');
    const s = await p.evaluate((el) => {
      const cs = getComputedStyle(el);
      const probe = document.createElement('span');
      probe.style.cssText = 'display:inline-block;white-space:nowrap;visibility:hidden;position:absolute';
      probe.textContent = '0'.repeat(65);
      el.append(probe);
      const ch65 = probe.getBoundingClientRect().width;
      probe.remove();
      return { size: cs.fontSize, lh: cs.lineHeight, width: el.getBoundingClientRect().width, ch65 };
    });
    expect(s.size, `${w}: đoạn 16px`).toBe('16px');
    expect(parseFloat(s.lh), `${w}: line-height 1.7`).toBeCloseTo(27.2, 0);
    expect(s.width, `${w}: ≤ 65ch`).toBeLessThanOrEqual(s.ch65 + 1);
    for (const a of await page.getByTestId('article-content').locator('p a').all()) expect(await css(a, 'text-decoration-line')).toContain('underline');
  }

  test('TC-33 AC10 360, 768: .rte đoạn 16px / 1.7, ≤ 65ch, link gạch chân; 640 × 450 không cuộn ngang', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    const path = await coverArticle(page);
    for (const w of [360, 768]) await rteParagraph(page, w, path);
    await openArticle(page, 640, path, 450);
    expect(await noHScroll(page), '640×450').toBe(true);
  });

  test('TC-33 AC10 1280, 1920: .rte đoạn 16px / 1.7, ≤ 65ch, link gạch chân', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    test.fail(true, 'ES1-T520 (ES1-T385-B04): aux.css .article-main .rte font-size-lg từ 64rem → đoạn 18px, srs TE-10 AC15 + foundation §28 chốt 16px');
    const path = await coverArticle(page);
    for (const w of [1280, 1920]) await rteParagraph(page, w, path);
  });

  test('TC-34 AC11: blog tắt bình luận → không khu bình luận', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    test.fixme(!NO_COMMENTS, 'thiếu TE385_NO_COMMENTS_ARTICLE_PATH (bài thuộc blog tắt bình luận — ES1-T507)');
    await openArticle(page, 1280, NO_COMMENTS!);
    await expect(page.getByTestId('article-comments')).toHaveCount(0);
    await expect(page.getByTestId('comment-form')).toHaveCount(0);
  });

  test('TC-35 AC11: h2 "{n} Comments" hoặc "Comments" + câu chưa có; ol mục tên, time, nội dung', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    const path = await coverArticle(page);
    for (const w of [360, 1280]) {
      await openArticle(page, w, path);
      const box = page.getByTestId('article-comments');
      test.skip((await box.count()) === 0, `blog của ${path} chưa bật bình luận (ES1-T507)`);
      await expect(box).toHaveAttribute('id', 'comments');
      const heading = box.getByTestId('article-comments-heading');
      expect(await heading.evaluate((el) => el.tagName)).toBe('H2');
      const list = box.getByTestId('article-comments-list');
      if (await list.count()) {
        const n = Number(((await heading.textContent()) ?? '').match(/(\d+) Comments?/)?.[1] ?? NaN);
        expect(Number.isNaN(n), 'h2 "{n} Comment(s)"').toBe(false);
        expect(await list.evaluate((el) => el.tagName)).toBe('OL');
        await expect(list.getByTestId('article-comment')).toHaveCount(Math.min(n, 10));
        for (const item of await list.getByTestId('article-comment').all()) {
          await expect(item.locator('time[datetime]')).toHaveCount(1);
          expect(((await item.innerText()) ?? '').trim().length).toBeGreaterThan(0);
        }
      } else {
        await expect(heading).toHaveText('Comments');
        await expect(box.getByTestId('article-comments-empty')).toHaveText(/No comments yet/);
      }
    }
  });

  test('TC-36 AC11, TE-6 AC6: > 10 bình luận → 10 mục, nav "Comment pages", neo #comments', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    test.fixme(!COMMENTS_PAGED, 'thiếu TE385_COMMENTS_PAGED_PATH (bài > 10 bình luận — ES1-T507)');
    await openArticle(page, 1280, COMMENTS_PAGED!);
    await expect(page.getByTestId('article-comment')).toHaveCount(10);
    const nav = page.getByRole('navigation', { name: 'Comment pages' });
    await expect(nav).toBeVisible();
    for (const href of await nav.locator('a[href]').evaluateAll((els) => els.map((e) => e.getAttribute('href') ?? ''))) expect(href).toMatch(/#comments$/);
    await clickAndLoad(page, () => nav.getByTestId('pagination-next').click());
    expect(new URL(page.url()).hash).toBe('#comments');
    expect(await page.getByTestId('article-comment').count()).toBeGreaterThan(0);
  });

  test('TC-37 AC12: form Name*, Email* "Not published.", Comment*, "Post Comment"; label, autocomplete; bố cục 360 / 1280', async ({ page, browser }, ti) => {
    desktopOnly(ti.project.name);
    const path = await coverArticle(page);
    for (const w of [360, 1280]) {
      await openArticle(page, w, path);
      const form = page.getByTestId('comment-form');
      test.skip((await form.count()) === 0, `blog của ${path} chưa bật bình luận`);
      for (const id of ['CommentAuthor', 'CommentEmail', 'CommentBody']) await expect(form.locator(`label[for="${id}"]`)).toHaveCount(1);
      await expect(form.locator('#CommentAuthor')).toHaveAttribute('autocomplete', 'name');
      await expect(form.locator('#CommentEmail')).toHaveAttribute('autocomplete', 'email');
      await expect(form.locator('#CommentEmail')).toHaveAttribute('type', 'email');
      await expect(form.locator('#CommentEmail')).toHaveAttribute('aria-describedby', /CommentEmailHint/);
      await expect(form.locator('#CommentEmailHint')).toHaveText('Not published.');
      const submit = form.getByTestId('comment-submit');
      await expect(submit).toHaveText('Post Comment');
      await expect(submit).toHaveAttribute('type', 'submit');
      const note = form.getByTestId('comment-moderated-note');
      if (await note.count()) await expect(note).toHaveText('Comments are reviewed before they appear.');
      const name = await rect(form.locator('#CommentAuthor'));
      const email = await rect(form.locator('#CommentEmail'));
      if (w < 768) {
        expect(email.y, '360: Email dưới Name').toBeGreaterThan(name.y + name.height - 1);
        expect((await rect(submit)).width, '360: nút rộng bằng form').toBeGreaterThanOrEqual((await rect(form.locator('#CommentBody'))).width - 2);
      } else expect(near(email.y, name.y, 1), '1280: Name, Email cùng hàng').toBe(true);
    }
    // Không JS: form vẫn là POST thường (Shopify new_comment).
    const { context, page: nojs } = await noJsPage(browser, 1280);
    try {
      await gotoStore(nojs, path);
      const form = nojs.getByTestId('comment-form');
      await expect(form).toHaveAttribute('method', /post/i);
      await expect(form).toHaveAttribute('action', /\/comments/);
    } finally {
      await context.close();
    }
  });

  test('TC-38 AC12: gửi thiếu trường (đường POST thường) → "Check n fields" role=alert, lỗi theo trường + icon, giữ chữ, về #comments', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    const path = await coverArticle(page);
    await openArticle(page, 1280, path);
    const form = page.getByTestId('comment-form');
    test.skip((await form.count()) === 0, `blog của ${path} chưa bật bình luận`);
    await form.evaluate((f: HTMLFormElement) => (f.noValidate = true));
    await form.locator('#CommentAuthor').fill('QA ES1-T385');
    await submitAndLoad(page, () => form.getByTestId('comment-submit').click());
    const errors = page.getByTestId('comment-errors');
    await expect(errors).toBeVisible();
    await expect(errors).toHaveAttribute('role', 'alert');
    const ERR: Record<string, string> = { CommentEmail: 'Enter an email like name@example.com.', CommentBody: 'Write a comment before posting.', CommentAuthor: 'Enter your name.' };
    let n = 0;
    for (const [id, text] of Object.entries(ERR)) {
      const input = page.locator(`#${id}`);
      if ((await input.getAttribute('aria-invalid')) !== 'true') continue;
      n++;
      const errId = `${id}Error`;
      await expect(input).toHaveAttribute('aria-describedby', new RegExp(errId));
      await expect(page.locator(`#${errId}`)).toHaveText(text);
      await expect(page.locator(`#${errId} svg`)).toHaveCount(1);
    }
    expect(n, 'Shopify trả ≥ 1 trường lỗi (email, comment trống)').toBeGreaterThan(0);
    await expect(errors).toContainText(n === 1 ? 'Check 1 field' : `Check ${n} fields`);
    await expect(page.locator('#CommentAuthor')).toHaveValue('QA ES1-T385');
    const atComments = new URL(page.url()).hash === '#comments' || (await page.getByTestId('comment-form').evaluate((el) => {
      const r = el.getBoundingClientRect();
      return r.top < innerHeight && r.bottom > 0;
    }));
    expect(atComments, `sau tải lại về #comments (URL ${page.url()})`).toBe(true);
  });

  test('TC-39 AC12: có JS → hộp lỗi nhận focus sau tải lại', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    test.fixme(true, BE_FOCUS);
    const path = await coverArticle(page);
    await openArticle(page, 1280, path);
    const form = page.getByTestId('comment-form');
    test.skip((await form.count()) === 0, `blog của ${path} chưa bật bình luận`);
    await form.evaluate((f: HTMLFormElement) => (f.noValidate = true));
    await submitAndLoad(page, () => form.getByTestId('comment-submit').click());
    await expect(page.locator('#CommentFormErrors')).toBeFocused();
  });

  test('TC-40 AC12: gửi hợp lệ → hộp role=status (duyệt: "in review", không duyệt: "posted" + bình luận cuối), ô rỗng', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    test.skip(!POST_COMMENT, 'TE385_POST_COMMENT≠1: không đăng bình luận thật lên store dev mỗi lần CI; chạy tay');
    const path = await coverArticle(page);
    await openArticle(page, 1280, path);
    const form = page.getByTestId('comment-form');
    test.skip((await form.count()) === 0, `blog của ${path} chưa bật bình luận`);
    const moderated = (await form.getByTestId('comment-moderated-note').count()) > 0;
    const body = `QA ES1-T385 ${Date.now()}`;
    await form.locator('#CommentAuthor').fill('QA ES1-T385');
    await form.locator('#CommentEmail').fill('qa+es1-t385@example.com');
    await form.locator('#CommentBody').fill(body);
    await submitAndLoad(page, () => form.getByTestId('comment-submit').click());
    const status = page.getByTestId('comment-status');
    await expect(status).toHaveAttribute('role', 'status');
    if (moderated) await expect(status).toContainText('Thanks, your comment is in review');
    else {
      await expect(status).toContainText('Your comment is posted.');
      await expect(page.getByTestId('article-comment').last()).toContainText(body);
    }
    for (const id of ['#CommentAuthor', '#CommentEmail', '#CommentBody']) await expect(page.locator(id)).toHaveValue('');
  });

  test('TC-41 AC13: khối liên quan có h2, 1–4 card, không bài đang xem, card h3 hiện đủ, ×4', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    const d = await discover(page);
    const path = await coverArticle(page);
    for (const w of WIDTHS) {
      await openArticle(page, w, path);
      const block = page.getByTestId('related-articles');
      await expect(block, `${w}: blog ≥ 2 bài → có khối`).toHaveCount(1);
      expect(((await block.getByTestId('related-articles-heading').textContent()) ?? '').trim().length).toBeGreaterThan(0);
      expect(await block.getByTestId('related-articles-heading').evaluate((el) => el.tagName)).toBe('H2');
      const hrefs = (await block.getByTestId('article-card-link').evaluateAll((els) => els.map((e) => e.getAttribute('href')))).map(pathOf);
      expect(hrefs.length).toBeGreaterThanOrEqual(1);
      expect(hrefs.length).toBeLessThanOrEqual(8);
      if (!d.paged) expect(hrefs.length, `${w}: ≤ số bài blog − 1`).toBeLessThanOrEqual(d.order.length - 1);
      expect(hrefs).not.toContain(path);
      expect(new Set(await block.getByTestId('article-card-title').evaluateAll((els) => els.map((e) => e.tagName)))).toEqual(new Set(['H3']));
      for (const t of await block.getByTestId('article-card-title').all()) {
        expect(await t.evaluate((el) => el.scrollHeight <= el.clientHeight + 1 && !(el.textContent ?? '').includes('…'))).toBe(true);
      }
    }
  });

  test('TC-42 AC13: chọn bài cùng tag đầu trước, thiếu thì bù bài mới nhất', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    const d = await discover(page);
    test.fixme(d.paged, 'blog nhiều trang: thứ tự bài mới nhất chỉ đọc được trang 1');
    const path = await coverArticle(page);
    await openArticle(page, 1280, path);
    const tagHref = await page.getByTestId('article-main').getByTestId('article-main-tag').getAttribute('href');
    const related = (await page.getByTestId('related-articles').getByTestId('article-card-link').evaluateAll((els) => els.map((e) => e.getAttribute('href')))).map(pathOf);
    let same: string[] = [];
    if (tagHref) {
      await gotoStore(page, tagHref);
      same = (await page.getByTestId('article-card-link').evaluateAll((els) => els.map((e) => e.getAttribute('href')))).map(pathOf).filter((h) => h !== path);
    }
    const rest = d.order.filter((h) => h !== path && !same.includes(h));
    const expected = [...same, ...rest].slice(0, related.length);
    expect(related, `tag đầu ${tagHref ?? '(không tag)'}: cùng tag trước, rồi mới nhất`).toEqual(expected);
    expect.soft(related.length, 'mặc định Articles to show 4').toBe(Math.min(4, d.order.length - 1));
  });

  test('TC-43 AC13: 360 vuốt thấy mép card kế, không chevron; 1280/1920 vừa khung → lưới tĩnh; 768 chevron 52 + tiến trình', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    const path = await coverArticle(page);
    for (const w of WIDTHS) {
      await openArticle(page, w, path);
      const block = page.getByTestId('related-articles');
      const list = block.getByTestId('related-articles-list');
      const cards = block.getByTestId('article-card');
      const n = await cards.count();
      if (w === 360) {
        await expect(block.getByTestId('related-articles-nav')).toBeHidden();
        if (n >= 2) {
          const second = await rect(cards.nth(1));
          expect(second.x, '360: card 2 lộ mép').toBeLessThan(360);
          expect(await list.evaluate((el) => el.scrollWidth > el.clientWidth), '360: cuộn ngang được').toBe(true);
        }
      } else if (w >= 1280 && n <= 4) {
        expect(await css(list, 'display'), `${w}: lưới tĩnh`).toBe('grid');
        await expect(block.getByTestId('related-articles-nav')).toBeHidden();
        await expect(block.getByTestId('carousel-progress')).toBeHidden();
        expect(await list.evaluate((el) => el.scrollWidth <= el.clientWidth + 1), `${w}: vừa khung`).toBe(true);
      } else if (w === 768 && n >= 3) {
        const next = block.getByTestId('related-articles-next');
        test.fixme(!(await next.isVisible()), BE_ROW);
        const r = await rect(next);
        expect(near(r.width, 52, 1) && near(r.height, 52, 1), '768: chevron 52').toBe(true);
        await expect(block.getByTestId('carousel-progress')).toBeVisible();
      }
      expect(await noHScroll(page), `${w}: trang không cuộn ngang`).toBe(true);
    }
  });

  test('TC-44 AC13: blog 1 bài → không khối liên quan', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    test.fixme(!SINGLE_ARTICLE, 'thiếu TE385_SINGLE_ARTICLE_PATH (bài của blog chỉ 1 bài — ES1-T507)');
    await openArticle(page, 1280, SINGLE_ARTICLE!);
    await expect(page.getByTestId('related-articles')).toHaveCount(0);
  });

  // Độ dài meta description tách sang TC-45b (bug ES1-T518) để title, JSON-LD vẫn được kiểm.
  test('TC-45 AC14: title, 1 meta description, 1 BlogPosting đủ trường, 1 BreadcrumbList 3 mục', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    const d = await discover(page);
    const paths = [d.withCover, d.noCover].filter((p): p is string => !!p);
    test.fixme(paths.length === 0, 'không có bài');
    for (const path of paths) {
      await openArticle(page, 1280, path);
      const h1 = ((await page.locator('h1').textContent()) ?? '').trim();
      expect((await page.title()).trim().startsWith(h1), `${path}: title bắt đầu bằng tên bài`).toBe(true);
      const desc = (await page.locator('meta[name="description"]').getAttribute('content')) ?? '';
      expect(desc.trim().length, `${path}: có meta description`).toBeGreaterThan(0);
      expect(desc).not.toMatch(/<[a-z/]/i);
      await expect(page.locator('meta[name="description"]')).toHaveCount(1);
      const blocks = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((s) => JSON.parse(s) as Record<string, unknown>);
      const posting = blocks.filter((b) => b['@type'] === 'BlogPosting');
      const crumbs = blocks.filter((b) => b['@type'] === 'BreadcrumbList');
      expect(posting, `${path}: 1 BlogPosting`).toHaveLength(1);
      expect(crumbs, `${path}: 1 BreadcrumbList`).toHaveLength(1);
      const p = posting[0] as { headline: string; datePublished: string; author?: { name?: string }; image?: string[] };
      expect(p.headline).toBe(h1);
      expect(Number.isNaN(Date.parse(p.datePublished))).toBe(false);
      expect((p.author?.name ?? '').length).toBeGreaterThan(0);
      if (path === d.withCover) expect(p.image?.[0], 'image khi có ảnh bìa').toMatch(/^https:\/\//);
      expect((crumbs[0] as { itemListElement: unknown[] }).itemListElement).toHaveLength(3);
    }
  });

  test('TC-45b AC14: meta description bài ≤ 160 ký tự', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    test.fail(true, 'ES1-T518 (ES1-T385-B03): meta-tags dùng page_description (~320 ký tự), chưa cắt excerpt_or_content về 160');
    const d = await discover(page);
    const paths = [d.withCover, d.noCover].filter((p): p is string => !!p);
    test.fixme(paths.length === 0, 'không có bài');
    for (const path of paths) {
      await openArticle(page, 1280, path);
      const desc = (await page.locator('meta[name="description"]').getAttribute('content')) ?? '';
      expect(desc.length, `${path}: ≤ 160 ký tự (${desc.length})`).toBeLessThanOrEqual(160);
    }
  });

  // AC14: "Given đo Lighthouse … có ảnh bìa Then ảnh bìa là LCP" → đo ở khung nhìn Lighthouse (mobile mặc định 412 × 823, preset desktop 1350 × 940),
  // không ở 360 × 900: khung cao 900 ở 360 cho đoạn đầu bài (~285 × 320 px) lớn hơn ảnh bìa 320 × 240, LCP phụ thuộc độ dài nội dung, không phải theme.
  const LH_VIEWPORTS = [
    { w: 412, h: 823 },
    { w: 1350, h: 940 },
  ] as const;

  test('TC-46 AC14: có ảnh bìa → LCP là ảnh bìa (khung nhìn Lighthouse)', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    const d = await discover(page);
    test.fixme(!d.withCover, `blog ${BLOG} không có bài có ảnh`);
    for (const { w, h } of LH_VIEWPORTS) {
      await openArticle(page, w, d.withCover!, h);
      const e = await lcp(page);
      expect(e.tag === 'img' && e.testids.includes('article-cover'), `${w}×${h} có ảnh: LCP ${e.tag} [${e.testids.join(' < ')}]`).toBe(true);
    }
  });

  test('TC-46b AC14: không ảnh bìa → LCP là h1 (khung nhìn Lighthouse)', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    const d = await discover(page);
    test.fixme(!d.noCover, 'không có bài không ảnh (TE385_ARTICLE_NO_COVER_PATH — ES1-T507)');
    // CI run 44702293347 (20/11) đo thật: 412×823 không ảnh → LCP là <p> đầu bài, không phải h1. Chờ CTO chốt ES1-T519.
    test.fail(true, 'ES1-T519 [Q]: AC14 "không ảnh bìa → LCP là h1" — CI đo LCP là đoạn đầu .rte');
    for (const { w, h } of LH_VIEWPORTS) {
      await openArticle(page, w, d.noCover!, h);
      const e = await lcp(page);
      expect(e.tag === 'img', `${w}×${h} không ảnh: LCP không được là ảnh`).toBe(false);
      expect(e.testids.includes('page-title-heading'), `${w}×${h} không ảnh: LCP ${e.tag} [${e.testids.join(' < ')}]`).toBe(true);
    }
  });
});

// ============================================================ AC15 nội dung mẫu 2 lớp
test.describe('ES1-T385 AC15', () => {
  test('TC-48 AC15 theme mới cài: không eyebrow, heading bài liên quan dùng locale, không "Efitco"', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    test.skip(!FRESH_THEME_ID, 'chưa có FRESH_THEME_ID: theme preview push từ repo, không cấu hình (ES1-T331 content-fixture.md mục 5)');
    const q = `preview_theme_id=${FRESH_THEME_ID}`;
    await openBlog(page, 1280, `${BLOG}?${q}`);
    await expect(eyebrowOf(page)).toHaveCount(0);
    await expect(page.getByTestId('page-title')).not.toContainText('Efitco');
    const link = page.getByTestId('blog-articles-featured-link').or(page.getByTestId('article-card-link')).first();
    const path = pathOf(await link.getAttribute('href'));
    await openArticle(page, 1280, `${path}?${q}`);
    const block = page.getByTestId('related-articles');
    await expect(block.getByTestId('related-articles-eyebrow')).toHaveCount(0);
    await expect(block.getByTestId('related-articles-heading')).toHaveText('More Articles');
    await expect(block.getByTestId('related-articles-heading')).not.toContainText('Efitco');
  });

  test('TC-49 AC15 store dev đã cấu hình: eyebrow "From the Efitco blog", heading "More Training Tips"', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    test.skip(STORE_STATE !== 'configured', 'TE385_STORE_STATE≠configured: blog-articles/related-articles chưa cấu hình trên store dev (fixture ES1-T331 không có, ES1-T507)');
    await openBlog(page, 1280);
    await expect(eyebrowOf(page)).toHaveText('From the Efitco blog');
    const path = await coverArticle(page);
    await openArticle(page, 1280, path);
    await expect(page.getByTestId('related-articles-eyebrow')).toHaveText('From the Efitco blog');
    await expect(page.getByTestId('related-articles-heading')).toHaveText('More Training Tips');
  });
});

// ============================================================ Case biên
test.describe('ES1-T385 biên', () => {
  test('B-01 360 thật (Pixel 7): blog → tag → bài không cuộn ngang', async ({ page }, ti) => {
    test.skip(ti.project.name !== 'mobile', 'chỉ project mobile');
    await gotoStore(page, BLOG);
    test.fixme(await isNotFound(page), `store chưa có blog ${BLOG}`);
    expect(await noHScroll(page), 'blog').toBe(true);
    const tag = topicsNav(page).getByRole('link').nth(1);
    const name = ((await tag.textContent()) ?? '').trim();
    await clickAndLoad(page, () => tag.tap());
    await expect(topicsNav(page).locator('[aria-current="page"]')).toHaveText(name);
    expect(await noHScroll(page), 'trang tag').toBe(true);
    await clickAndLoad(page, () => page.getByTestId('article-card-link').first().tap());
    await expect(page.locator('h1')).toHaveCount(1);
    expect(await noHScroll(page), 'bài').toBe(true);
  });

  test('B-02 mất mạng ảnh: card giữ nền tối, tiêu đề hiện, khung nổi bật giữ 4/3, 0 console error theme', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    const watch = watchStore(page);
    watch.allowNetworkLog();
    await page.route('**/*', (r) => (r.request().resourceType() === 'image' ? r.abort() : r.fallback()));
    for (const w of [360, 1280]) {
      await openBlog(page, w);
      const dark = await resolveColor(page, 'var(--color-background-dark)');
      for (const card of (await page.getByTestId('blog-articles-grid').getByTestId('article-card').all()).slice(0, 4)) {
        expect(await css(card.getByTestId('article-card-link'), 'background-color')).toBe(dark);
        await expect(card.getByTestId('article-card-title')).toBeVisible();
      }
      const media = page.getByTestId('blog-articles-featured').locator(':scope > div').first();
      const m = await rect(media);
      expect(Math.abs(m.width / m.height - 4 / 3), `${w}: khung nổi bật 4/3`).toBeLessThan(0.02);
    }
    await watch.finish();
  });

  test('B-03 bàn phím: breadcrumb → chủ đề → nổi bật → card; outline accent trên card, khung nổi bật có outline', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    await openBlog(page, 1280);
    const root = page.getByTestId('blog-articles');
    const topics = await topicsNav(page).getByRole('link').count();
    await root.getByTestId('breadcrumb').getByRole('link').first().focus();
    const seen: string[] = [];
    for (let i = 0; i < topics + 2; i++) {
      await page.keyboard.press('Tab');
      seen.push(await page.evaluate(() => (document.activeElement as HTMLElement | null)?.dataset.testid ?? document.activeElement?.tagName ?? ''));
    }
    expect(seen.slice(0, topics)).toEqual(Array(topics).fill('blog-articles-topic'));
    expect(seen[topics]).toBe('blog-articles-featured-link');
    expect(seen[topics + 1]).toBe('article-card-link');
    const accent = await resolveColor(page, 'var(--color-accent)');
    const focused = page.locator(':focus');
    expect(await css(focused, 'outline-color'), 'outline card màu accent').toBe(accent);
    await page.keyboard.press('Shift+Tab');
    await expect(page.getByTestId('blog-articles-featured-link')).toBeFocused();
    expect(await css(page.getByTestId('blog-articles-featured'), 'outline-style'), 'khối nổi bật có outline').not.toBe('none');
  });

  test('B-04 storefront không hiện placeholder editor', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    const path = await coverArticle(page);
    await openBlog(page, 1280);
    await expect(page.getByTestId('blog-articles-placeholder')).toHaveCount(0);
    await openArticle(page, 1280, path);
    for (const id of ['article-main-placeholder', 'article-comments-placeholder', 'related-articles-placeholder']) await expect(page.getByTestId(id)).toHaveCount(0);
  });

  test('B-05 chưa có blog/bài (block đặt sai template): placeholder chỉ trong design_mode (tĩnh)', ({}, ti) => {
    desktopOnly(ti.project.name);
    expect(read('blocks/blog-articles.liquid')).toMatch(/if blog == blank -%\}\s*\{%- if request\.design_mode -%\}/);
    for (const f of ['article-main', 'article-comments', 'related-articles']) expect(read(`blocks/${f}.liquid`), f).toMatch(/elsif request\.design_mode/);
  });

  test('B-06 bài 640 × 450 (phóng 200%): không cuộn ngang, ảnh bìa vừa khung', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    const path = await coverArticle(page);
    await openArticle(page, 640, path, 450);
    expect(await noHScroll(page)).toBe(true);
    const c = await rect(page.getByTestId('article-cover'));
    expect(c.x + c.width).toBeLessThanOrEqual(640);
  });

  test('B-07 0 console error theme trên blog, trang tag, bài', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    const d = await discover(page);
    const watch = watchStore(page);
    await page.setViewportSize({ width: 1280, height: VIEW_H });
    for (const p of [BLOG, d.tagHref, d.withCover].filter((x): x is string => !!x)) {
      await gotoStore(page, p);
      await page.waitForLoadState('load');
    }
    await watch.finish();
  });

  test('B-08 tên bài dài nhất ở 360: breadcrumb không cắt, h1 không tràn ngang', async ({ page }, ti) => {
    desktopOnly(ti.project.name);
    const d = await discover(page);
    test.fixme(!d.longest, 'không có bài');
    await openArticle(page, 360, d.longest!);
    const cur = page.getByTestId('article-main').getByTestId('breadcrumb-current');
    expect(await cur.evaluate((el) => el.scrollWidth <= el.clientWidth + 1 && getComputedStyle(el).textOverflow !== 'ellipsis'), 'breadcrumb không cắt').toBe(true);
    expect(await page.locator('h1').evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
    expect(await noHScroll(page)).toBe(true);
  });
});
