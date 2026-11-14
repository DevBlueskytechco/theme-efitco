// KHÔNG CHẮC: nhóm "store dev" và "theme mới cài" chưa chạy thật (phiên QA không chạy được shopify CLI, chưa có PR để store-tests chạy); nơi lưu setting static block chưa đo, xem drafts/qa/ES1-T331/content-fixture.md mục 1.
// Ticket ES1-T331 (TE-17-R2-QA0, story TE-17, D10 của ES1-T307, ADR 0011 mục 5): kiểm fixture nội dung Figma cho store dev.
// Không trùng ES1-T176 (so ảnh, style, copy theo bảng ES1-T173) và TE-17-R2-QA1/QA2 (đo khối): spec này chỉ kiểm (1) fixture khớp schema và template,
// (2) store dev đã áp đủ fixture để các spec đó đo được AC-H1..H5, AC-H18, AC-H19, AC-H28, (3) theme không fixture không có nội dung demo (D10, TE-10 AC3).
// Test case: drafts/qa/ES1-T331/test-cases.md (TC-xx ghi trong tên test). Nguồn: docs/srs.md#TE-17, docs/adr/0011.
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... [FRESH_THEME_ID=<id theme không áp fixture>] npx playwright test tests/e2e/ES1-T331.spec.ts
import { test, expect, type Page } from '@playwright/test';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { gotoStore } from './support/store-guard';
import { allMarkers, loadHomeFixture, missingMarkers, skipUnlessFixture, type FixtureBlock } from './support/home-fixture';

const ROOT = resolve(__dirname, '../..');
const fixture = loadHomeFixture();
const read = (path: string) => readFileSync(resolve(ROOT, path), 'utf8');
const WIDTHS = [360, 768, 1280, 1920] as const;

// Setting trong {% schema %} của block: id → type.
function schemaSettings(type: string): Map<string, string> {
  const source = read(`blocks/${type}.liquid`);
  const match = /\{%-?\s*schema\s*-?%\}([\s\S]*?)\{%-?\s*endschema\s*-?%\}/.exec(source);
  if (!match) throw new Error(`blocks/${type}.liquid không có schema`);
  const schema = JSON.parse(match[1]) as { settings?: Array<{ id?: string; type: string }> };
  return new Map((schema.settings ?? []).filter((s) => s.id).map((s) => [s.id as string, s.type]));
}

// Cặp type|id của thẻ {% block %} trong file, bỏ phần comment. Block không id ghi là type|-.
function blockCalls(path: string): string[] {
  const clean = read(path).replace(/\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g, '');
  return [...clean.matchAll(/\{%-?\s*block\s+'([^']+)'([\s\S]*?)-?%\}/g)].map((m) => `${m[1]}|${/\bid:\s*'([^']+)'/.exec(m[2])?.[1] ?? '-'}`);
}

const key = (block: FixtureBlock) => `${block.type}|${block.id ?? '-'}`;
const money = (text: string) => Number(text.replace(/[^0-9.]/g, ''));

async function openHome(page: Page, width: number, path = '/') {
  await page.setViewportSize({ width, height: 1080 });
  await gotoStore(page, path);
}

test.describe('ES1-T331 fixture nội dung Figma', () => {
  test.describe('Fixture tĩnh, không gọi store', () => {
    test('TC-01, TC-01b mọi block trong fixture có file block, mọi key settings có trong schema (AC-H2, AC-H5)', () => {
      const problems: string[] = [];
      for (const block of fixture.blocks) {
        if (!existsSync(resolve(ROOT, `blocks/${block.type}.liquid`))) {
          problems.push(`${key(block)}: không có blocks/${block.type}.liquid`);
          continue;
        }
        const settings = schemaSettings(block.type);
        for (const id of Object.keys(block.settings)) if (!settings.has(id)) problems.push(`${key(block)}: setting '${id}' không có trong schema`);
      }
      expect(problems, 'fixture lệch schema: sửa fixture hoặc báo FE nếu setting bị đổi tên').toEqual([]);
    });

    test('TC-02 mọi block trong fixture có trong templates/index.liquid hoặc layout/theme.liquid cùng type và id (AC-H1)', () => {
      const calls = { 'template:index': blockCalls('templates/index.liquid'), 'layout:theme': blockCalls('layout/theme.liquid') } as Record<string, string[]>;
      const missing = fixture.blocks.filter((block) => !calls[block.scope]?.includes(key(block))).map((block) => `${block.scope} ${key(block)}`);
      expect(missing, 'block trong fixture không còn trong template: id đổi thì setting đã áp trên store mất').toEqual([]);
    });

    test('TC-03 16 hàng inventory, container theo đúng thứ tự trong templates/index.liquid (AC-H1)', () => {
      expect(fixture.rows.map((row) => row.row)).toEqual(Array.from({ length: 16 }, (_, i) => i + 1));
      const containers = blockCalls('templates/index.liquid').filter((call) => call.startsWith('container|')).map((call) => `container-${call.split('|')[1]}`);
      expect(fixture.rows.slice(1, -1).map((row) => row.testid)).toEqual(containers);
      expect([fixture.rows[0].testid, fixture.rows[15].testid]).toEqual(['header', 'footer']);
    });

    test('TC-04, TC-04b bậc giảm trong setting block khớp discount tự động của fixture (AC-H18, AC-H19)', () => {
      const tiers = (type: string) => {
        const settings = fixture.blocks.find((block) => block.type === type)!.settings as Record<string, number>;
        return [1, 2, 3].map((n) => ({ min_quantity: settings[`tier_${n}_quantity`], percent: settings[`tier_${n}_percent`] })).filter((tier) => tier.percent > 0);
      };
      const discounts = (scope: string) => fixture.store_data.discounts.filter((d) => d.scope === scope).map((d) => ({ min_quantity: d.min_quantity, percent: d.percent }));
      expect(tiers('bundle-builder')).toEqual([{ min_quantity: 2, percent: 10 }, { min_quantity: 3, percent: 15 }]);
      expect(tiers('bundle-builder')).toEqual(discounts('collection:figma-bundle'));
      expect(tiers('shop-the-look')).toEqual(discounts('collection:figma-setup'));
    });

    test('TC-06 mọi ảnh của block có giá trị, trừ 3 chỗ chờ ES1-T178 (AC-H3)', () => {
      const waiting = ['header|-|logo', 'footer|-|logo', 'footer|-|newsletter_image'];
      const empty = fixture.blocks.flatMap((block) => {
        const types = schemaSettings(block.type);
        return Object.entries(block.settings).filter(([id, value]) => types.get(id) === 'image_picker' && value === null).map(([id]) => `${key(block)}|${id}`);
      });
      expect(empty.sort()).toEqual([...waiting].sort());
    });

    test('TC-05 ảnh trong fixture là file shop_images, không đặt ảnh, handle demo vào repo (D10, ADR 0011 mục 5)', () => {
      const images = fixture.blocks.flatMap((block) => Object.entries(block.settings).filter(([id]) => schemaSettings(block.type).get(id) === 'image_picker').map(([, value]) => value));
      for (const value of images) if (value !== null) expect(value).toMatch(/^shopify:\/\/shop_images\/efx-[\w-]+\.(jpg|png|svg)$/);
      const template = read('templates/index.liquid');
      // ES1-T304 chưa merge thì templates/index.liquid còn handle demo: skip có lý do, tự chạy khi ES1-T304 xong.
      test.skip(/figma-|images\['efx-/.test(template), 'templates/index.liquid còn handle/ảnh demo, chờ ES1-T304 (ADR 0011 mục 2)');
      const handles = fixture.store_data.collections;
      expect(handles.filter((handle) => template.includes(handle))).toEqual([]);
    });
  });

  test.describe('Store dev đã áp fixture', () => {
    // Đo nội dung không phụ thuộc thiết bị giả lập: chạy ở project desktop, đổi viewport theo mốc; mobile chỉ chạy TC-11 ở 360 (giảm request, 429).
    test('TC-10, TC-10b 16 hàng render đúng thứ tự y, mỗi hàng có nội dung (AC-H1, AC-H4)', async ({ page }, info) => {
      test.skip(info.project.name !== 'desktop', 'đo ở project desktop, 1920');
      await openHome(page, 1920);
      await skipUnlessFixture(page);
      const tops: number[] = [];
      for (const row of fixture.rows) {
        const locator = page.getByTestId(row.testid).first();
        await expect(locator, `hàng ${row.row} ${row.testid}`).toBeVisible();
        const box = await locator.boundingBox();
        expect(box?.height ?? 0, `hàng ${row.row} rỗng: thiếu setting resource trong fixture`).toBeGreaterThan(40);
        tops.push(box!.y);
      }
      expect(tops).toEqual([...tops].sort((a, b) => a - b));
      const containers = await page.locator('main [data-testid^="container-"]').evaluateAll((els) => els.map((el) => el.getAttribute('data-testid')));
      expect(containers.filter((id) => !fixture.rows.some((row) => row.testid === id)), 'block ngoài danh sách 16 hàng').toEqual([]);
    });

    for (const width of WIDTHS) {
      test(`TC-11, TC-11b đủ marker nội dung Figma ở ${width} (AC-H2, AC-H5)`, async ({ page }, info) => {
        test.skip(info.project.name === 'mobile' && width !== 360, 'mobile chỉ đo 360');
        await openHome(page, width);
        await skipUnlessFixture(page);
        expect(await missingMarkers(page, allMarkers(fixture))).toEqual([]);
      });
    }

    test.describe('Không JS', () => {
      test.use({ javaScriptEnabled: false });
      test('TC-12 marker có trong HTML server render khi tắt JS (AC-H5)', async ({ page }, info) => {
        test.skip(info.project.name !== 'desktop', 'nojs đo 1 lần ở desktop');
        await openHome(page, 1280);
        await skipUnlessFixture(page);
        expect(await missingMarkers(page, allMarkers(fixture))).toEqual([]);
      });
    });

    test('TC-13 bundle builder chọn 1, 2, 3 món ra nhắc 10%, giảm 10%, giảm 15% (AC-H18)', async ({ page }, info) => {
      test.skip(info.project.name !== 'desktop', 'tương tác đo ở desktop; 360 thuộc TE-17-R2-QA2');
      await openHome(page, 1920);
      await skipUnlessFixture(page);
      const bundle = page.getByTestId('bundle-builder');
      const inputs = bundle.getByTestId('bundle-builder-input');
      const enabled: number[] = [];
      for (let i = 0; i < (await inputs.count()); i++) {
        if (await inputs.nth(i).isEnabled()) {
          enabled.push(i);
          await inputs.nth(i).setChecked(false, { force: true });
        }
      }
      test.skip(enabled.length < 3, 'figma-bundle cần ≥ 3 sản phẩm còn hàng (home-content.md 3.3)');
      const progress = bundle.getByTestId('bundle-builder-progress-text');
      const discount = bundle.getByTestId('bundle-builder-discount-row');
      await inputs.nth(enabled[0]).setChecked(true, { force: true });
      await expect(progress).toContainText(/\b1\b/);
      await expect(progress).toContainText('10%');
      await inputs.nth(enabled[1]).setChecked(true, { force: true });
      await expect(discount).toContainText('10%');
      await inputs.nth(enabled[2]).setChecked(true, { force: true });
      await expect(discount).toContainText('15%');
      await expect(progress).toContainText('15%');
    });

    // Markup thật (blocks/shop-the-look-row.liquid): không chọn từng món; mỗi row còn hàng có 1 <input type=hidden name=id[] data-price>
    // (luôn vào giỏ), row hết hàng không có input. Nên không setChecked; tạm tính đối chiếu tổng data-price (cent) của các input.
    test('TC-14 shop the look có "Fits", đủ 4 món thì dòng giảm 10%, tổng = tạm tính − giảm (AC-H19)', async ({ page }, info) => {
      test.skip(info.project.name !== 'desktop', 'đo ở desktop');
      await openHome(page, 1920);
      await skipUnlessFixture(page);
      const look = page.getByTestId('shop-the-look');
      await expect(look.getByTestId('shop-the-look-note')).toContainText('Fits');
      await expect(look.getByTestId('shop-the-look-row')).toHaveCount(4);
      const inputs = look.getByTestId('shop-the-look-row-input');
      const types = await inputs.evaluateAll((els) => els.map((el) => (el as HTMLInputElement).type));
      test.skip(types.length < 4, 'row hết hàng không có input: bậc 4 món không đạt; "row hết hàng không tính vào tổng" kiểm ở TE-12 QA');
      // Hidden = luôn chọn; nếu sau này block đổi sang checkbox thì tick đủ 4 món.
      for (let i = 0; i < types.length; i++) if (types[i] === 'checkbox') await inputs.nth(i).setChecked(true, { force: true });
      const cents = await inputs.evaluateAll((els) => els.reduce((sum, el) => sum + Number(el.getAttribute('data-price')), 0));
      await look.scrollIntoViewIfNeeded(); // data-lazy-module: bundle-form.js chỉ tải gần viewport
      await expect(look).toHaveAttribute('data-enhanced', /.*/);
      await expect(look.getByTestId('shop-the-look-discount-row')).toContainText('10%');
      const subtotal = money(await look.getByTestId('shop-the-look-subtotal').innerText());
      expect(subtotal, 'tạm tính = tổng data-price của row còn hàng').toBeCloseTo(cents / 100, 2);
      const off = money(await look.getByTestId('shop-the-look-discount').innerText());
      const total = money(await look.getByTestId('shop-the-look-total').innerText());
      expect(off).toBeCloseTo(subtotal * 0.1, 1);
      expect(total).toBeCloseTo(subtotal - off, 2);
    });

    test('TC-15 footer 1920 đủ logo, mô tả, heading và nút "Get 15% Off", dòng "No spam" (AC-H28)', async ({ page }, info) => {
      test.skip(info.project.name !== 'desktop', 'AC-H28 đo ở 1920');
      await openHome(page, 1920);
      await skipUnlessFixture(page);
      const footer = page.getByTestId('footer');
      await expect(footer.getByTestId('footer-logo')).toBeVisible();
      await expect(footer.getByTestId('footer-description')).toContainText('Efitco provides premium fitness accessories');
      // ES1-T464: newsletter_heading default rỗng, ẩn khi rỗng; setting footer (layout:theme) chưa áp được trên preview (ES1-T428/ES1-T177).
      if ((await footer.getByTestId('footer-newsletter-heading').count()) > 0) {
        await expect(footer.getByTestId('footer-newsletter-heading')).toContainText('Get 15% Off');
      } else {
        info.annotations.push({ type: 'footer-fixture-pending', description: 'newsletter_heading chưa áp trên preview (ES1-T464, ES1-T428/ES1-T177)' });
      }
      await expect(footer.getByTestId('footer-newsletter-submit')).toContainText('Get 15% Off');
      await expect(footer.getByTestId('footer-newsletter-note')).toHaveText(/No spam\. Unsubscribe anytime\./);
    });

    test('TC-16 ảnh CDN lỗi mạng thì chữ fixture vẫn render (biên mất mạng)', async ({ page }, info) => {
      test.skip(info.project.name !== 'desktop', 'đo 1 lần');
      await page.route(/\/cdn\/shop\/files\/efx-/, (route) => route.abort());
      await openHome(page, 1280);
      await skipUnlessFixture(page);
      expect(await missingMarkers(page, allMarkers(fixture))).toEqual([]);
    });
  });

  test.describe('Theme mới cài, không fixture (D10, TE-10 AC3)', () => {
    const freshId = process.env.FRESH_THEME_ID;
    test('TC-20 không claim, không bậc giảm, không link tài nguyên demo trên / (AC3)', async ({ page }, info) => {
      test.skip(!freshId, 'chưa có FRESH_THEME_ID: theme preview push từ repo, không áp fixture (content-fixture.md mục 5)');
      test.skip(info.project.name !== 'desktop', 'đo 1 lần');
      for (const width of WIDTHS) {
        await openHome(page, width, `/?preview_theme_id=${freshId}`);
        const text = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
        expect(fixture.fresh_install.forbidden_text.filter((value) => text.includes(value)), `chữ demo ở ${width}`).toEqual([]);
        const hrefs = await page.locator('a[href]').evaluateAll((links) => links.map((a) => a.getAttribute('href') ?? ''));
        expect(hrefs.filter((href) => fixture.fresh_install.forbidden_href.some((bad) => href.includes(bad))), `link demo ở ${width}`).toEqual([]);
        for (const testid of fixture.fresh_install.forbidden_testids_visible) await expect(page.getByTestId(testid), `${testid} ở ${width}`).toHaveCount(0);
      }
    });
  });
});
