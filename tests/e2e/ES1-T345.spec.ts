// KHÔNG CHẮC: (1) nhóm store chưa chạy thật: phiên QA không có PREVIEW_URL/STORE_PASSWORD, chưa có PR để store-tests chạy; chỉ nhóm @static chạy local.
// (2) Số đo AC-H37 lấy theo docs/srs.md#TE-17 AC-H37 (hero 1280 × 589, ảnh danh mục 271 × 177, review 360 × 213, why 600 × 571, FAQ 442 × 471,
//     featured 580 × 566, shop the look 819 × 714). docs/ui-spec/index-1280.md sau ES1-T567 (tỉ lệ có tên, ES1-T580 PR #323 chưa merge) ghi 640, 180, 203,
//     600, 435, 580, 819. Câu hỏi BA/CTO: xem drafts/qa/ES1-T345/test-cases.md mục KHÔNG CHẮC. AC_H37_SOURCE=t567 đổi sang bộ số ES1-T567 khi SRS cập nhật.
// (3) Blog: fixture articles_to_show 5 (home-figma.json) trong khi AC-H37 ghi "blog 4 card 292 × 389"; spec kiểm theo luật index-1280 khối 14
//     (4 bài → lưới tĩnh 292 × 389, ≥ 5 bài → hàng ngang card ≈ 271) và ghi annotation.
// Ticket ES1-T345 (TE-17-R2-QA1, story TE-17, Sprint 3): trang chủ 1280 trên store dev đã áp fixture ES1-T331.
// AC: TE-17 AC-H1, AC-H2, AC-H3 (ở 1280 = đo khối AC-H37, ES1-T309 #4; so ảnh chỉ 1920, ES1-T176), AC-H4, AC-H5; TE-2 AC7; TE-7 AC1; D10 (task-split ES1-T307).
// Test case: drafts/qa/ES1-T345/test-cases.md (TC-xx trong tên test). Nguồn: docs/srs.md#TE-17, #TE-2, #TE-7; docs/ui-spec/index-1280.md §0–§2.
// Không trùng: ES1-T331 (fixture khớp schema, marker 4 mốc, TC-20 text/href/testid theme mới cài), ES1-T176 (so ảnh 1920), ES1-T341/T342 (FE đo từng khối
// trên template test ?view=te7/te13). Spec này là cổng QA 1280 trên `/` đã áp fixture: 1 lần mở trang đo cả bảng AC-H37 (expect.soft, đủ danh sách lệch).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... [FRESH_THEME_ID=<theme không áp fixture>] npx playwright test tests/e2e/ES1-T345.spec.ts --project=desktop
import AxeBuilder from '@axe-core/playwright';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { test, expect, type Locator, type Page, type ConsoleMessage } from './support/test';
import { gotoStore } from './support/store-guard';
import { watchShopPay403 } from './support/console-guard';
import { footerSettingsApplied, loadHomeFixture, skipUnlessFixture, FOOTER_PENDING, type FixtureBlock } from './support/home-fixture';

const ROOT = resolve(__dirname, '../..');
const read = (path: string) => readFileSync(resolve(ROOT, path), 'utf8');
const fixture = loadHomeFixture();
const W = 1280;
const H = 800; // AC-H37: viewport 1280 × 800
const TOL = 2; // ES1-T309 #4, chỉ CTO nới
const SOURCE = process.env.AC_H37_SOURCE === 't567' ? 't567' : 'srs';
const IGNORE_CONSOLE = [/shopifycloud|monorail|otlp|web-pixels|trekkie|shop\.app|cdn\.shopify\.com\/s\/(trekkie|javascripts)/i];

type Box = { x: number; y: number; width: number; height: number };
const squash = (value: string) => value.replace(/\s+/g, ' ').trim();
const plain = (html: string) => squash(html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&'));

// Hộp theo toạ độ trang (cộng scroll), không có hộp thì null để expect.soft báo rõ phần tử thiếu.
async function pageBox(locator: Locator): Promise<Box | null> {
  if ((await locator.count()) === 0) return null;
  await locator.scrollIntoViewIfNeeded().catch(() => undefined);
  return locator.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return r.width || r.height ? { x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height } : null;
  });
}

function near(actual: number | undefined, expected: number, label: string) {
  expect.soft(actual, `${label}: thiếu phần tử`).not.toBeUndefined();
  if (actual === undefined) return;
  expect.soft(Math.abs(actual - expected), `${label}: đo ${actual.toFixed(1)}, cần ${expected} ± ${TOL}`).toBeLessThanOrEqual(TOL);
}

// Màu của một token CSS đã resolve trên phần tử (setting màu của theme có thể đổi, không so literal).
const tokenColor = (locator: Locator, token: string) =>
  locator.evaluate((el, name) => {
    const probe = document.createElement('span');
    probe.style.color = `var(${name})`;
    el.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  }, token);

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  const ignore = watchShopPay403(page);
  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() !== 'error' || ignore(msg)) return;
    const where = `${msg.text()} ${msg.location().url}`;
    if (!IGNORE_CONSOLE.some((re) => re.test(where))) errors.push(where);
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

async function openHome(page: Page, path = '/') {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: W, height: H });
  await gotoStore(page, path);
}

async function openFixtureHome(page: Page) {
  await openHome(page);
  await skipUnlessFixture(page);
}

// Phần tử gốc <scroll-buttons> chứa list (video-carousel đặt testid ở block ngoài, không ở scroll-buttons).
const scrollRoot = (list: Locator) => list.locator('xpath=ancestor::scroll-buttons[1]');

async function waitEnhanced(list: Locator) {
  await list.scrollIntoViewIfNeeded();
  await expect(scrollRoot(list), 'scroll-buttons.js tải lười gần viewport rồi gắn data-enhanced').toHaveAttribute('data-enhanced', '');
}

// Hàng ngang ở 1280 (index-1280 R4): bao nhiêu card trọn trong màn, card kế lộ bao nhiêu phần.
async function rowPeek(list: Locator, card: string) {
  return list.evaluate((el, testid) => {
    el.scrollLeft = 0;
    const cards = [...el.querySelectorAll(`[data-testid="${testid}"]`)].map((c) => c.getBoundingClientRect());
    const vw = document.documentElement.clientWidth;
    const full = cards.filter((r) => r.right <= vw + 1).length;
    const next = cards[full];
    return { count: cards.length, full, width: cards[0]?.width ?? 0, peek: next ? Math.max(0, vw - next.left) / next.width : 0 };
  }, card);
}

// Bảng AC-H37 (srs) và bộ số ES1-T567 (t567) chỉ khác ở các ô ảnh theo tỉ lệ có tên.
const V = (srs: number, t567 = srs) => (SOURCE === 't567' ? t567 : srs);

// Setting chữ hiển thị của schema block: id → type.
function textSettings(type: string): Map<string, string> {
  const match = /\{%-?\s*schema\s*-?%\}([\s\S]*?)\{%-?\s*endschema\s*-?%\}/.exec(read(`blocks/${type}.liquid`));
  const schema = JSON.parse(match?.[1] ?? '{}') as { settings?: Array<{ id?: string; type: string }> };
  return new Map((schema.settings ?? []).filter((s) => s.id && ['text', 'textarea', 'richtext', 'inline_richtext'].includes(s.type)).map((s) => [s.id as string, s.type]));
}

const stripComments = (source: string) => source.replace(/\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g, '').replace(/\{%-?\s*doc\s*-?%\}[\s\S]*?\{%-?\s*enddoc\s*-?%\}/g, '');
const CLAIMS = ['Trusted by 10,000+', '360+', '12 Warranty', 'Get 15% Off', '1 Year Warranty'];

test.describe('ES1-T345 trang chủ 1280', () => {
  test.beforeEach(({}, info) => {
    test.skip(info.project.name !== 'desktop', 'đo 1280 ở project desktop (đổi viewport tay); 360/768 thuộc TE-17-R2-QA2');
  });

  test.describe('@static D10 theme mới cài (không gọi store)', () => {
    test('TC-30 templates/index.liquid không handle demo, ảnh efx-, chữ claim (D10, AC-H36)', () => {
      const template = stripComments(read('templates/index.liquid'));
      expect(template.match(/['"]figma-[\w-]+['"]|efx-[\w-]+|images\[/g) ?? [], 'tài nguyên demo trong template').toEqual([]);
      expect(CLAIMS.filter((claim) => template.includes(claim)), 'chữ claim trong template').toEqual([]);
    });

    test('TC-31 locale storefront không có chữ claim làm mặc định (D10)', () => {
      const locale = read('locales/en.default.json');
      expect(CLAIMS.filter((claim) => locale.includes(claim))).toEqual([]);
    });

    test('TC-32 schema mọi block: bậc giảm mặc định 0, default chữ không mang claim (D10, ES1-T308 #1)', () => {
      const problems: string[] = [];
      for (const file of readdirSync(resolve(ROOT, 'blocks')).filter((name) => name.endsWith('.liquid'))) {
        const match = /\{%-?\s*schema\s*-?%\}([\s\S]*?)\{%-?\s*endschema\s*-?%\}/.exec(read(`blocks/${file}`));
        if (!match) continue;
        const schema = JSON.parse(match[1]) as { settings?: Array<{ id?: string; type: string; default?: unknown }> };
        for (const s of schema.settings ?? []) {
          if (s.id && /^tier_\d+_percent$/.test(s.id) && s.default !== undefined && s.default !== 0) problems.push(`${file} ${s.id} default ${String(s.default)}`);
          if (typeof s.default === 'string' && CLAIMS.some((claim) => (s.default as string).includes(claim))) problems.push(`${file} ${s.id} default "${s.default}"`);
        }
      }
      expect(problems).toEqual([]);
    });
  });

  test.describe('Store dev đã áp fixture ES1-T331', () => {
    test('TC-01 AC-H1: 16 hàng inventory theo y ở 1280, 0 block ngoài danh sách', async ({ page }) => {
      await openFixtureHome(page);
      const tops: number[] = [];
      for (const row of fixture.rows) {
        const locator = page.getByTestId(row.testid).first();
        await expect(locator, `hàng ${row.row} ${row.testid}`).toBeVisible();
        const box = await pageBox(locator);
        expect(box?.height ?? 0, `hàng ${row.row} ${row.testid} rỗng`).toBeGreaterThan(40);
        tops.push(box!.y);
      }
      expect(tops, 'thứ tự y đúng thứ tự inventory').toEqual([...tops].sort((a, b) => a - b));
      const containers = await page.locator('main [data-testid^="container-"]').evaluateAll((els) => els.map((el) => el.getAttribute('data-testid')));
      expect(containers.filter((id) => !fixture.rows.some((row) => row.testid === id)), 'block ngoài 16 hàng').toEqual([]);
    });

    test('TC-02 AC-H2: mọi setting chữ của fixture hiện trong đúng hàng, so sau bỏ khoảng trắng thừa, không phân biệt hoa thường', async ({ page }, info) => {
      await openFixtureHome(page);
      const footerApplied = await footerSettingsApplied(page);
      if (!footerApplied) info.annotations.push({ type: 'footer-fixture-pending', description: FOOTER_PENDING });
      const countdown = (await page.getByTestId('featured-product-countdown').count()) > 0;
      const rowText = new Map<number, string>();
      const missing: string[] = [];
      for (const block of fixture.blocks as FixtureBlock[]) {
        if (block.type === 'header' || (block.type === 'footer' && !footerApplied)) continue;
        const types = textSettings(block.type);
        for (const [id, value] of Object.entries(block.settings)) {
          if (typeof value !== 'string' || !types.has(id) || /_tag$/.test(id)) continue; // tag quiz là dữ liệu lọc, không hiển thị
          if (id === 'countdown_label' && !countdown) continue; // giá trị động E8: chỉ có khi custom.sale_ends_at còn hạn
          if (!rowText.has(block.row)) {
            const testid = fixture.rows.find((row) => row.row === block.row)!.testid;
            rowText.set(block.row, squash((await page.getByTestId(testid).first().textContent()) ?? '').toLowerCase());
          }
          const want = plain(value).toLowerCase();
          if (!rowText.get(block.row)!.includes(want)) missing.push(`hàng ${block.row} ${block.type}|${block.id ?? '-'}.${id}: "${plain(value)}"`);
        }
      }
      expect(missing, 'chuỗi fixture không hiện').toEqual([]);
    });

    test('TC-03 AC-H3, AC-H37: bounding box 16 khối ở 1280 × 800 lệch ≤ 2 px theo bảng', async ({ page }, info) => {
      info.annotations.push({ type: 'so-lieu', description: `bộ số ${SOURCE} (KHÔNG CHẮC (2) đầu file)` });
      await openFixtureHome(page);
      const id = (testid: string, scope: Page | Locator = page) => scope.getByTestId(testid).first();
      const band = (name: string) => page.getByTestId(`container-home-${name}`);

      // Nội dung 1240, lề 20
      const content = await pageBox(id('featured-collection'));
      near(content?.x, 20, 'lề trái nội dung');
      near(content?.width, 1240, 'nội dung');

      // Hero: thẻ tràn mép 1280 × 589, bo 16, chữ x 20, 2 mũi tên góc dưới phải đáy 24, phải 24, cách nhau 8
      const track = await pageBox(id('slideshow-track'));
      near(track?.x, 0, 'hero tràn mép');
      near(track?.width, 1280, 'hero rộng');
      near(track?.height, V(589, 640), 'hero cao');
      near(await id('slideshow-track').evaluate((el) => parseFloat(getComputedStyle(el).borderTopLeftRadius)), 16, 'hero bo góc');
      near((await pageBox(id('slideshow-heading')))?.x, 20, 'chữ hero x');
      const next = await pageBox(id('slideshow-next'));
      const prev = await pageBox(id('slideshow-prev'));
      if (track && next && prev) {
        near(next.width, 52, 'mũi tên 52');
        near(track.x + track.width - (next.x + next.width), 24, 'mũi tên cách mép phải');
        near(track.y + track.height - (next.y + next.height), 24, 'mũi tên cách đáy');
        near(next.x - (prev.x + prev.width), 8, '2 mũi tên cách nhau');
        near(prev.y, next.y, '2 mũi tên cùng hàng');
      } else expect.soft([track, next, prev].every(Boolean), 'hero cần track và 2 mũi tên (≥ 2 slide)').toBe(true);

      // Danh mục card 271, ảnh 271 × 177
      near((await pageBox(id('collection-card')))?.width, 271, 'danh mục card');
      const catImg = await pageBox(id('collection-card-image'));
      near(catImg?.width, 271, 'ảnh danh mục rộng');
      near(catImg?.height, V(177, 180), 'ảnh danh mục cao');
      // Level 397, bestseller 292
      near((await pageBox(id('level-card')))?.width, 397, 'level card');
      near((await pageBox(id('featured-collection').locator('[data-testid="product-card"]:visible').first()))?.width, 292, 'bestseller card');
      // Quiz panel 1240, thẻ câu hỏi 608
      near((await pageBox(id('quiz')))?.width, 1240, 'quiz panel');
      near((await pageBox(id('quiz-form')))?.width, 608, 'quiz thẻ câu hỏi');
      // Shop the look ảnh 819 × 714 + cột 397, ô Fits 84, hàng 80
      const look = await pageBox(id('shop-the-look-image'));
      near(look?.width, 819, 'shop the look ảnh rộng');
      near(look?.height, V(714, 819), 'shop the look ảnh cao');
      near((await pageBox(id('shop-the-look-rows')))?.width, 397, 'shop the look cột phải');
      near((await pageBox(id('shop-the-look-note')))?.height, 84, 'ô Fits cao');
      near((await pageBox(id('shop-the-look-row')))?.height, 80, 'hàng shop the look cao');
      // Make fitness cao 640
      near((await pageBox(id('image-with-text', band('inspiration'))))?.height, 640, 'make fitness cao');
      // Bundle card 222, panel 503
      near((await pageBox(id('bundle-builder-item')))?.width, 222, 'bundle card');
      near((await pageBox(id('bundle-builder-panel')))?.width, 503, 'bundle panel');
      // Featured 580 | 80 | 580, ảnh 580 × 566
      const media = await pageBox(id('featured-product-media-item'));
      near(media?.x, 20, 'featured ảnh x');
      near(media?.width, 580, 'featured ảnh rộng');
      near(media?.height, V(566, 580), 'featured ảnh cao');
      near((await pageBox(id('featured-product-title')))?.x, 680, 'featured cột chi tiết sau khoảng 80');
      // Video card 264
      near((await pageBox(id('video-card')))?.width, 264, 'video card');
      // Testimonial card 360, ảnh 360 × 213
      near((await pageBox(id('testimonial-item')))?.width, 360, 'testimonial card');
      const rev = await pageBox(id('testimonial-image'));
      near(rev?.width, 360, 'ảnh review rộng');
      near(rev?.height, V(213, 203), 'ảnh review cao');
      // Why ảnh 600 × 571
      const why = await pageBox(id('image-with-text-image', band('why-choose')));
      near(why?.width, 600, 'why ảnh rộng');
      near(why?.height, V(571, 600), 'why ảnh cao');
      // Blog: 4 bài → lưới 292 × 389; ≥ 5 bài → hàng ngang ≈ 271 (index-1280 khối 14)
      const articles = await page.getByTestId('blog-posts').getByTestId('article-card').count();
      const article = await pageBox(id('article-card'));
      if (articles === 4) {
        near(article?.width, 292, 'blog card rộng');
        near(article?.height, 389, 'blog card cao');
      } else {
        info.annotations.push({ type: 'KHÔNG CHẮC', description: `blog có ${articles} bài (fixture articles_to_show 5), AC-H37 ghi 4 card 292 × 389: đo theo hàng ngang ≈ 271` });
        near(article?.width, 271, 'blog card hàng ngang');
      }
      // FAQ ảnh 442 × 471, ô số 225 × 148
      const faq = await pageBox(id('faq-image'));
      near(faq?.width, 442, 'FAQ ảnh rộng');
      near(faq?.height, V(471, 435), 'FAQ ảnh cao');
      const stat = await pageBox(id('faq-stat-1'));
      near(stat?.width, 225, 'FAQ ô số rộng');
      near(stat?.height, 148, 'FAQ ô số cao');
      // Không tràn ngang
      expect.soft(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), 'không cuộn ngang ở 1280').toBeLessThanOrEqual(0);
    });

    test('TC-04 AC-H4: computed style 1280 — display 80/80, h2 48/56, nút tròn 52, tab 40, eyebrow why, ≤ 2 họ font', async ({ page }) => {
      await openFixtureHome(page);
      const style = (locator: Locator) =>
        locator.evaluate((el) => {
          const cs = getComputedStyle(el);
          return { size: parseFloat(cs.fontSize), line: parseFloat(cs.lineHeight), color: cs.color };
        });
      const displays: Array<[string, Locator]> = [
        ['hero', page.getByTestId('slideshow-heading').first()],
        ['intro', page.getByTestId('rich-text-heading').first()],
        ['make fitness', page.getByTestId('container-home-inspiration').getByTestId('image-with-text-heading')],
        ['why', page.getByTestId('container-home-why-choose').getByTestId('image-with-text-heading')],
      ];
      for (const [label, locator] of displays) {
        await expect.soft(locator, `display ${label}`).toHaveCount(1);
        if ((await locator.count()) !== 1) continue;
        const s = await style(locator);
        near(s.size, 80, `display ${label} font-size (HD1)`);
        near(s.line, 80, `display ${label} line-height`);
      }
      for (const testid of ['collection-list-heading', 'shop-by-level-heading', 'featured-collection-heading', 'video-carousel-heading', 'testimonials-heading', 'blog-posts-heading', 'faq-heading']) {
        const locator = page.getByTestId(testid).first();
        if ((await locator.count()) === 0) {
          expect.soft(0, `${testid} thiếu`).toBe(1);
          continue;
        }
        const s = await style(locator);
        near(s.size, 48, `${testid} font-size`);
        near(s.line, 56, `${testid} line-height`);
      }
      for (const testid of ['slideshow-next', 'collection-list-next', 'testimonials-next', 'video-carousel-next']) {
        const box = await pageBox(page.getByTestId(testid).first());
        near(box?.width, 52, `${testid} rộng`);
        near(box?.height, 52, `${testid} cao`);
      }
      near((await pageBox(page.getByTestId('featured-collection-tab').first()))?.height, 40, 'tab bestseller cao (R3)');
      const eyebrow = page.getByTestId('container-home-why-choose').getByTestId('image-with-text-eyebrow');
      expect.soft(await eyebrow.evaluate((el) => getComputedStyle(el).color), 'eyebrow why = --color-muted-on-dark (TE-7 AC7, sổ 10/11)').toBe(await tokenColor(eyebrow, '--color-muted-on-dark'));
      const families = await page.locator('main').evaluate((main) => {
        const set = new Set<string>();
        for (const el of main.querySelectorAll('*')) {
          if (!(el as HTMLElement).offsetParent || ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim())) continue;
          set.add(getComputedStyle(el).fontFamily.split(',')[0].replace(/["']/g, '').trim().toLowerCase());
        }
        return [...set];
      });
      expect.soft(families.length, `họ font trên / (sổ 30/10): ${families.join(', ')}`).toBeLessThanOrEqual(2);
    });

    test('TC-05 AC-H5: copy và số liệu demo hiển thị, 0 chữ hướng dẫn', async ({ page }) => {
      await openFixtureHome(page);
      await expect.soft(page.getByTestId('slideshow-slide').first()).toContainText('Trusted by 10,000+ athletes');
      await expect.soft(page.getByTestId('faq-stat-1')).toContainText('360+');
      await expect.soft(page.getByTestId('faq-stat-2')).toContainText('12');
      await expect.soft(page.getByTestId('level-card-count').first()).toContainText('24 Products');
      await expect.soft(page.getByTestId('featured-product-rating-count')).toContainText('341');
      const text = squash(await page.locator('body').innerText());
      for (const hint of ['Add a ', 'Customer name', 'Lorem ipsum']) expect.soft(text.includes(hint), `chữ hướng dẫn "${hint}" trên storefront`).toBe(false);
    });

    test('TC-06 TE-2 AC7: ≥ 2 slide ở 1280 có 2 nút tròn 52 góc dưới phải, không chấm; bấm và bàn phím đổi slide, slide ẩn inert', async ({ page }) => {
      await openFixtureHome(page);
      const slides = page.getByTestId('slideshow-slide');
      test.skip((await slides.count()) < 2, 'fixture cần 2 slide (slide-1, slide-2)');
      const next = page.getByTestId('slideshow-next');
      const prev = page.getByTestId('slideshow-prev');
      await expect(next).toBeVisible();
      await expect(prev).toBeVisible();
      await expect(page.getByTestId('slideshow-dots')).toBeHidden();
      await expect(next).toHaveAccessibleName(/.+/);
      await expect(prev).toHaveAccessibleName(/.+/);
      const inert = () => slides.evaluateAll((els) => els.map((el) => (el as HTMLElement).inert));
      await expect.poll(inert, 'ban đầu slide 1 hiện').toEqual([false, ...Array((await slides.count()) - 1).fill(true)]);
      await next.click();
      await expect.poll(async () => (await inert())[0], 'sau Next: slide 1 inert').toBe(true);
      expect((await inert())[1], 'sau Next: slide 2 hiện').toBe(false);
      const trackBox = await pageBox(page.getByTestId('slideshow-track'));
      await expect.poll(async () => Math.abs(((await pageBox(slides.nth(1)))?.x ?? -999) - (trackBox?.x ?? 0)), 'slide 2 nằm trong khung').toBeLessThanOrEqual(TOL);
      await prev.focus();
      await page.keyboard.press('Enter');
      await expect.poll(async () => (await inert())[0], 'Enter trên Previous: về slide 1').toBe(false);
      await expect(page.getByTestId('slideshow-pause'), 'autoplay mặc định tắt: không nút pause').toBeHidden();
    });

    test('TC-08 TE-7 AC1: testimonials 1280 hàng ngang, không thanh cuộn trình duyệt, nút 52 đầu khối, tiến trình mảnh, lộ ≥ 25% card 4', async ({ page }) => {
      await openFixtureHome(page);
      const root = page.getByTestId('testimonials');
      const list = page.getByTestId('testimonials-list');
      await waitEnhanced(list);
      const peek = await rowPeek(list, 'testimonial-item');
      expect(peek.count, 'fixture 4 review').toBe(4);
      expect(peek.full, '3 card trọn').toBe(3);
      expect(peek.peek, 'card 4 lộ ≥ 25%').toBeGreaterThanOrEqual(0.25);
      const rows = await list.evaluate((el) => new Set([...el.querySelectorAll('[data-testid="testimonial-item"]')].map((c) => Math.round(c.getBoundingClientRect().top))).size);
      expect(rows, 'mọi card cùng 1 hàng').toBe(1);
      expect(await list.evaluate((el) => getComputedStyle(el).scrollbarWidth === 'none' || el.offsetHeight - el.clientHeight === 0), 'không thanh cuộn trình duyệt').toBe(true);
      await expect(root).not.toHaveAttribute('data-static');
      const prev = page.getByTestId('testimonials-prev');
      const next = page.getByTestId('testimonials-next');
      await expect(next).toBeVisible();
      const nav = await pageBox(page.getByTestId('testimonials-nav'));
      const listBox = await pageBox(list);
      expect(nav!.y + nav!.height, 'nút nằm ở đầu khối, trên hàng').toBeLessThanOrEqual(listBox!.y + 1);
      near((await pageBox(next))?.width, 52, 'nút next 52');
      const look = await next.evaluate((el) => ({ bg: getComputedStyle(el).backgroundColor, border: getComputedStyle(el).borderTopColor }));
      expect(look.bg, 'nền trắng').toBe('rgb(255, 255, 255)');
      expect(look.border, 'viền #E5E5E5').toBe('rgb(229, 229, 229)');
      await expect(prev, 'đầu hàng: back aria-disabled').toHaveAttribute('aria-disabled', 'true');
      const progress = root.getByTestId('carousel-progress');
      await expect(progress).toBeVisible();
      expect((await pageBox(progress))!.height, 'thanh tiến trình mảnh').toBeLessThanOrEqual(4);
      await next.hover();
      const accent = await tokenColor(next, '--color-accent');
      await expect.poll(() => next.evaluate((el) => getComputedStyle(el).backgroundColor), 'rê chuột: nền cam (--color-accent)').toBe(accent);
      await next.click();
      await expect.poll(() => list.evaluate((el) => el.scrollLeft), 'Next cuộn hàng').toBeGreaterThan(0);
      await expect(prev).toHaveAttribute('aria-disabled', 'false');
    });

    test('TC-09 TE-7 AC1 (index-1280 R4): danh mục và video ở 1280 lộ ≥ 25% card kế, card danh mục 271, video giữ 264', async ({ page }) => {
      await openFixtureHome(page);
      for (const [list, card, full, width] of [
        ['collection-list-track', 'collection-card', 4, 271],
        ['video-carousel-list', 'video-card', 4, 264],
      ] as const) {
        const locator = page.getByTestId(list);
        await waitEnhanced(locator);
        const peek = await rowPeek(locator, card);
        expect.soft(peek.full, `${list}: ${full} card trọn`).toBe(full);
        expect.soft(peek.peek, `${list}: card ${full + 1} lộ ≥ 25%`).toBeGreaterThanOrEqual(0.25);
        near(peek.width, width, `${card} rộng`);
        await expect.soft(scrollRoot(locator)).not.toHaveAttribute('data-static');
      }
    });

    test('TC-10 TE-7 AC1: hàng vừa khung thành lưới tĩnh, không nút, không thanh tiến trình (blog; testimonials 1 mục)', async ({ page }, info) => {
      await openFixtureHome(page);
      const blogList = page.getByTestId('blog-posts-list');
      await waitEnhanced(blogList);
      const peek = await rowPeek(blogList, 'article-card');
      if (peek.count <= 4) {
        await expect.soft(page.getByTestId('blog-posts'), 'blog 4 bài vừa khung: data-static').toHaveAttribute('data-static', '');
        await expect.soft(page.getByTestId('blog-posts-next')).toBeHidden();
        await expect.soft(page.getByTestId('blog-posts').getByTestId('carousel-progress')).toBeHidden();
      } else {
        info.annotations.push({ type: 'KHÔNG CHẮC', description: `blog ${peek.count} bài: hàng ngang (index-1280 khối 14), không phải lưới tĩnh` });
        await expect.soft(page.getByTestId('blog-posts')).not.toHaveAttribute('data-static');
      }
      // Dựng trạng thái "hàng vừa khung" không cần đổi setting store: bỏ bớt card trong DOM rồi đổi bề track để ResizeObserver chạy lại.
      const list = page.getByTestId('testimonials-list');
      await waitEnhanced(list);
      await list.evaluate((el) => [...el.querySelectorAll('[data-testid="testimonial-item"]')].slice(1).forEach((c) => (c.closest('li') ?? c).remove()));
      await page.setViewportSize({ width: W - 1, height: H });
      await page.setViewportSize({ width: W, height: H });
      await expect(page.getByTestId('testimonials')).toHaveAttribute('data-static', '');
      await expect(page.getByTestId('testimonials-next')).toBeHidden();
      await expect(page.getByTestId('testimonials-prev')).toBeHidden();
      await expect(page.getByTestId('testimonials').getByTestId('carousel-progress')).toBeHidden();
    });

    test('TC-11 TE-7 AC1 bàn phím, trình đọc màn hình: hàng review focus được, mũi tên cuộn, có nhãn; axe 0 serious ở hero và hàng ngang', async ({ page }) => {
      await openFixtureHome(page);
      const list = page.getByTestId('testimonials-list');
      await waitEnhanced(list);
      await expect(list).toHaveAttribute('tabindex', '0');
      await expect(list).toHaveAccessibleName(/.+/);
      await expect(page.getByTestId('testimonials').getByTestId('carousel-progress')).toHaveAttribute('aria-hidden', 'true');
      await list.focus();
      await page.keyboard.press('End');
      await expect.poll(() => list.evaluate((el) => el.scrollLeft), 'End cuộn tới cuối hàng').toBeGreaterThan(0);
      const axe = await new AxeBuilder({ page })
        .include('[data-testid="container-home-hero"]')
        .include('[data-testid="container-home-collection-list"]')
        .include('[data-testid="container-home-testimonials"]')
        .analyze();
      const serious = axe.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${v.id}: ${v.nodes.length}`);
      expect(serious).toEqual([]);
    });

    test('TC-12 mất mạng: slideshow.js, scroll-buttons.js lỗi tải thì hero và hàng review vẫn xem được, không nút chết', async ({ page }) => {
      await page.route(/\/assets\/(slideshow|scroll-buttons)\.js/, (route) => route.abort());
      await openFixtureHome(page);
      await expect(page.getByTestId('slideshow-next'), 'không JS slideshow: không mũi tên').toBeHidden();
      const track = page.getByTestId('slideshow-track');
      await track.evaluate((el) => el.scrollTo({ left: el.scrollWidth }));
      await expect.poll(() => track.evaluate((el) => el.scrollLeft), 'hero vẫn cuộn ngang được').toBeGreaterThan(0);
      const list = page.getByTestId('testimonials-list');
      await list.scrollIntoViewIfNeeded();
      await expect(page.getByTestId('testimonials')).not.toHaveAttribute('data-enhanced');
      await expect(page.getByTestId('testimonials-next')).toBeHidden();
      near((await pageBox(page.getByTestId('testimonial-item').first()))?.width, 360, 'card giữ 360 khi JS lỗi');
      await list.focus();
      await page.keyboard.press('End');
      await expect.poll(() => list.evaluate((el) => el.scrollLeft), 'bàn phím vẫn cuộn hàng').toBeGreaterThan(0);
    });

    test.describe('Không JS', () => {
      test.use({ javaScriptEnabled: false });

      test('TC-07 TE-2 AC7 nojs: slide cuộn ngang bằng scroll-snap, xem được slide 2, không mũi tên', async ({ page }) => {
        await openHome(page);
        await skipUnlessFixture(page);
        const track = page.getByTestId('slideshow-track');
        const snap = await track.evaluate((el) => ({ type: getComputedStyle(el).scrollSnapType, overflow: getComputedStyle(el).overflowX }));
        expect(snap.type).toContain('x');
        expect(['auto', 'scroll']).toContain(snap.overflow);
        await expect(page.getByTestId('slideshow-next')).toBeHidden();
        const slides = page.getByTestId('slideshow-slide');
        test.skip((await slides.count()) < 2, 'fixture cần 2 slide');
        expect(await slides.nth(1).evaluate((el) => (el as HTMLElement).inert), 'slide 2 không inert khi không JS').toBe(false);
        await track.evaluate((el) => el.scrollTo({ left: el.scrollWidth }));
        const t = await track.boundingBox();
        await expect.poll(async () => Math.abs(((await slides.nth(1).boundingBox())?.x ?? -999) - (t?.x ?? 0)), 'slide 2 vào khung').toBeLessThanOrEqual(TOL);
      });

      test('TC-13 TE-7 AC1 nojs: hàng review vẫn 1 hàng ngang, card 360, không nút', async ({ page }) => {
        await openHome(page);
        await skipUnlessFixture(page);
        const list = page.getByTestId('testimonials-list');
        await list.scrollIntoViewIfNeeded();
        await expect(page.getByTestId('testimonials-next')).toBeHidden();
        const peek = await rowPeek(list, 'testimonial-item');
        expect(peek.full).toBe(3);
        expect(peek.peek).toBeGreaterThanOrEqual(0.25);
        near(peek.width, 360, 'card review nojs');
      });
    });
  });

  test.describe('Theme mới cài, không fixture (D10, AC-H36 phần 1280)', () => {
    const freshId = process.env.FRESH_THEME_ID;

    test('TC-20 1280: HTML không handle demo, ảnh efx-, chữ claim; không dòng giảm, Verified; không khung chữ rỗng; 0 console error', async ({ page }) => {
      test.skip(!freshId, 'chưa có FRESH_THEME_ID: theme preview push từ repo, không áp fixture (drafts/qa/ES1-T331/content-fixture.md mục 5)');
      const errors = collectConsoleErrors(page);
      await openHome(page, `/?preview_theme_id=${freshId}`);
      const html = await page.content();
      expect.soft(html.match(/\/(collections|products|blogs)\/figma-[\w-]+/g) ?? [], 'link tài nguyên demo').toEqual([]);
      expect.soft(html.match(/efx-[\w-]+\.(jpe?g|png|svg|webp)/g) ?? [], 'ảnh efx-').toEqual([]);
      const text = squash(await page.locator('body').innerText());
      expect.soft(fixture.fresh_install.forbidden_text.filter((value) => text.includes(value)), 'chữ demo, chữ hướng dẫn').toEqual([]);
      for (const testid of fixture.fresh_install.forbidden_testids_visible) await expect.soft(page.getByTestId(testid), testid).toHaveCount(0);
      const empty = await page.locator('main [data-testid$="-heading"], main [data-testid$="-eyebrow"], main [data-testid$="-body"], main [data-testid$="-button"]').evaluateAll((els) =>
        els.filter((el) => !el.textContent?.trim() && !el.querySelector('img, svg')).map((el) => el.getAttribute('data-testid')));
      expect.soft(empty, 'phần tử chữ rỗng vẫn render khung').toEqual([]);
      // Cuộn hết trang để module lười (data-lazy-module) chạy, bắt lỗi console của chúng.
      for (const row of fixture.rows) await page.getByTestId(row.testid).first().scrollIntoViewIfNeeded().catch(() => undefined);
      await page.waitForLoadState('load');
      expect.soft(errors, 'console error').toEqual([]);
    });
  });
});
