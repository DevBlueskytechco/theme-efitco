// KHÔNG CHẮC: phần so với store chưa từng chạy thật (RUN_STORE_TESTS tắt, phiên QA không vào được store). Số đo thật đọc từ dòng [figma-calibration] khi CI chạy.
// Ticket ES1-T176 TE-17-QA2: so ảnh, so copy, đo style theo block trên /?view=figma; so thứ tự block giữa 2 template (AC-H1 đến H4, plan ES1-T169 D2, D3).
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T176.spec.ts --project=desktop
// Baseline dựng lúc chạy từ docs/figma/img, không commit. Số pixel lấy từ chính comparator của toMatchSnapshot nên khớp với kết quả assert.
import { test, expect, type Locator, type Page } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { gotoStore } from './support/store-guard';
import { applyMasks, buildBaseline, decodePng, encodePng, fitTo, loadRows, medianColor, ROOT } from './support/figma-baseline.cjs';
import { compareStyles, gapBetween, nodeBox, parseContent, snapshotIndex, type StyleSpec } from './support/figma-compare';
import exceptions from './support/figma-exceptions.json';

const FIGMA = '/?view=figma';
const SCALE = 2;
const { thresholds, rows, dataTicket } = loadRows();
const nodes = snapshotIndex(JSON.parse(readFileSync(resolve(ROOT, 'docs/figma/snapshot-1-359.json'), 'utf8')));
const content = parseContent(readFileSync(resolve(ROOT, 'drafts/ba/ES1-T173/home-content.md'), 'utf8'));

type Target = { testid: string; nth?: number; text?: string; inner?: string };
type Row = (typeof rows)[number];

const log = (kind: string, row: string, data: unknown) => console.log(`[figma-calibration] ${JSON.stringify({ kind, row, ...(data as object) })}`);

// Thứ tự block theo cây lồng nhau, kèm background và tag của container. Bỏ comment để block trong ghi chú không tính.
export function blockTree(source: string): string[] {
  const clean = source.replace(/\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g, '').replace(/\{%-?\s*raw\s*-?%\}[\s\S]*?\{%-?\s*endraw\s*-?%\}/g, '');
  const tree: string[] = [];
  let depth = 0;
  for (const match of clean.matchAll(/\{%-?\s*(block|endblock)\b([\s\S]*?)-?%\}/g)) {
    if (match[1] === 'endblock') {
      depth--;
      continue;
    }
    const name = /^\s*'([^']+)'/.exec(match[2])?.[1];
    const attr = (key: string) => new RegExp(`\\b${key}:\\s*'([^']*)'`).exec(match[2])?.[1];
    const extra = name === 'container' ? ` background=${attr('background') ?? '-'} tag=${attr('tag') ?? '-'}` : '';
    tree.push(`${'  '.repeat(depth)}${name}${extra}`);
    depth++;
  }
  return tree;
}

const pickLocator = (page: Page, target: Target): Locator => {
  let locator = page.getByTestId(target.testid);
  if (target.nth !== undefined) locator = target.nth < 0 ? locator.last() : locator.nth(target.nth);
  if (target.text) locator = locator.getByText(target.text, { exact: false }).first();
  if (target.inner) locator = locator.locator(target.inner).first();
  return locator;
};

// Phần tử không có hoặc bị ẩn trả null ngay, không để boundingBox chờ hết timeout của test: nút pause chỉ có khi slideshow autoplay.
async function boxOf(locator: Locator) {
  return (await locator.count()) ? locator.boundingBox({ timeout: 5_000 }).catch(() => null) : null;
}

async function openGate(page: Page) {
  await gotoStore(page, FIGMA);
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
}

function countStoreRequests(page: Page) {
  let count = 0;
  page.on('request', (request) => {
    if (new URL(request.url()).origin === new URL(page.url() === 'about:blank' ? request.url() : page.url()).origin) count++;
  });
  return () => count;
}

// Đưa đúng slide vào khung: nút Next rồi chờ slide về vị trí của node, nếu không số đo là của lúc đang cuộn.
async function showSlide(page: Page, row: Row) {
  if (row.slide === undefined) return;
  const { x } = nodeBox(nodes, row.node);
  const slide = page.getByTestId('slideshow-slide').nth(row.slide);
  for (let i = 0; i < row.slide; i++) await page.getByTestId('slideshow-next').click();
  await expect.poll(async () => Math.abs(((await boxOf(slide))?.x ?? 9999) - x), { message: `slide ${row.slide} chưa về khung` }).toBeLessThan(1);
}

// Số pixel khác của comparator tại 1 threshold. maxDiffPixels 0 làm comparator báo số trong message.
// Mỗi lần gọi có khác biệt thì report thêm 1 bộ ảnh actual, expected, diff, nên mặc định chỉ gọi 1 lần; FIGMA_PROBE_ALL=1 khi hiệu chuẩn.
function diffPixels(actual: Buffer, name: string, threshold: number): number {
  try {
    expect(actual).toMatchSnapshot(name, { threshold, maxDiffPixels: 0 });
    return 0;
  } catch (error) {
    const found = /(\d+) pixels \(ratio/.exec(String((error as Error).message));
    if (!found) throw error;
    return Number(found[1]);
  }
}

async function compareImage(page: Page, row: Row) {
  const info = test.info();
  const baseline = buildBaseline(row, SCALE);
  const clip = { x: row.clip.x, y: row.clip.y, width: baseline.width / SCALE, height: baseline.height / SCALE };

  if (row.hideMedia) {
    // Ảnh chưa có trên ?view=figma (D2, Q3): ẩn ảnh, overlay, sơn nền bằng màu lấy từ vùng không có chữ của chính ảnh Figma.
    const area = row.flatBackgroundFrom;
    const color = medianColor(baseline, { x: area.x * SCALE, y: area.y * SCALE, w: area.w * SCALE, h: area.h * SCALE });
    await page.addStyleTag({ content: `[data-testid="${row.hideMedia}"]{visibility:hidden!important}[data-testid="slideshow-slide"]{background:${color}!important;--overlay-opacity:0%!important}` });
  }

  const actualShot = decodePng(await page.screenshot({ clip, animations: 'disabled', scale: 'device' }));
  const actual = fitTo(actualShot, baseline.width, baseline.height, row.band);

  const rects = (row.masks ?? []).map((m: { x: number; y: number; w: number; h: number }) => ({ x: m.x * SCALE, y: m.y * SCALE, w: m.w * SCALE, h: m.h * SCALE }));
  for (const mask of row.domMasks ?? []) {
    const box = await boxOf(page.getByTestId(mask.testid).first());
    if (box) rects.push({ x: (box.x - clip.x) * SCALE, y: (box.y - clip.y) * SCALE, w: box.width * SCALE, h: box.height * SCALE });
  }
  const masked = applyMasks([actual, baseline], rects);
  const total = baseline.width * baseline.height;
  const visible = total - masked;

  const name = `${row.snapshot}.png`;
  const path = info.snapshotPath(name);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, encodePng(baseline));
  const buffer = encodePng(actual);

  const levels: number[] = process.env.FIGMA_PROBE_ALL ? thresholds.probeThresholds : [thresholds.pixelThreshold];
  const probes = levels.map((threshold) => {
    const pixels = diffPixels(buffer, name, threshold);
    return { threshold, pixels, ratioVisible: Number((pixels / visible).toFixed(5)), ratioAll: Number((pixels / total).toFixed(5)) };
  });
  log('image', row.id, { node: row.node, size: `${baseline.width}x${baseline.height}`, maskedPx: masked, visiblePx: visible, probes });

  // 1% tính trên phần không che: chia cho cả ảnh thì vùng che càng lớn càng dễ đạt. Số pixel lấy từ comparator của toMatchSnapshot ở trên.
  const pixels = probes.find((probe) => probe.threshold === thresholds.pixelThreshold)!.pixels;
  expect(pixels, `Hàng ${row.id}: ${pixels} pixel khác trên ${visible} pixel không che, xem ảnh diff`).toBeLessThanOrEqual(Math.floor(thresholds.maxDiffRatio * visible));
}

async function compareGeometry(page: Page, row: Row) {
  for (const item of row.geometry ?? []) {
    const box = await boxOf(pickLocator(page, item));
    expect.soft(box, `${row.id} ${item.name}: không có phần tử`).not.toBeNull();
    if (!box) continue;
    const figma = nodeBox(nodes, item.node);
    const pairs: Array<[string, number, number]> =
      item.edge === 'left' ? [['x', box.x, figma.x]]
      : item.edge === 'right' ? [['phải', box.x + box.width, figma.x + figma.width]]
      : item.edge === 'centerX' ? [['giữa', box.x + box.width / 2, figma.x + figma.width / 2]]
      : [['x', box.x, figma.x], ['y', box.y, figma.y], ['rộng', box.width, figma.width], ['cao', box.height, figma.height]];
    for (const [label, got, want] of pairs) {
      const delta = Number((got - want).toFixed(2));
      log('geometry', row.id, { name: item.name, label, got: Number(got.toFixed(2)), want: Number(want.toFixed(2)), delta });
      expect.soft(Math.abs(delta), `${row.id} ${item.name} ${label}: ${got} so với Figma ${want}`).toBeLessThanOrEqual(thresholds.sizePx);
    }
  }
}

async function compareStyle(page: Page, row: Row) {
  for (const item of (row.styles ?? []) as Array<StyleSpec & Target>) {
    const locator = pickLocator(page, item);
    await expect.soft(locator, `${row.id} ${item.name}: không có phần tử`).toHaveCount(1);
    if ((await locator.count()) !== 1) continue;
    const computed = await locator.evaluate((el) => {
      const s = getComputedStyle(el);
      const box = el.getBoundingClientRect();
      return { fontFamily: s.fontFamily, fontWeight: s.fontWeight, fontSize: s.fontSize, lineHeight: s.lineHeight, letterSpacing: s.letterSpacing, textTransform: s.textTransform, color: s.color, backgroundColor: s.backgroundColor, borderRadius: s.borderTopLeftRadius, paddingLeft: s.paddingLeft, paddingTop: s.paddingTop, width: `${box.width}px`, height: `${box.height}px` };
    });
    const diffs = compareStyles(nodes, item, computed, exceptions);
    log('style', row.id, { name: item.name, node: item.node, computed, diffs });
    expect.soft(diffs, `${row.id} ${item.name} lệch Figma`).toEqual([]);
  }
  for (const item of row.spacing ?? []) {
    const [from, to] = await Promise.all([boxOf(pickLocator(page, item.from)), boxOf(pickLocator(page, item.to))]);
    expect.soft(from && to, `${row.id} ${item.name}: không có phần tử`).toBeTruthy();
    if (!from || !to) continue;
    const got = to.y - (from.y + from.height);
    const want = gapBetween(nodes, item.fromNode, item.toNode);
    log('spacing', row.id, { name: item.name, got, want });
    expect.soft(Math.abs(got - want), `${row.id} ${item.name}: ${got} so với Figma ${want}`).toBeLessThanOrEqual(0.5);
  }
}

test.describe('ES1-T176 so Figma', () => {
  test.skip(({ isMobile }) => isMobile, 'Figma chỉ có desktop 1920 (plan ES1-T169 D3); mobile do ES1-T196 đo theo mặc định đã chốt');
  test.use({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: SCALE, contextOptions: { reducedMotion: 'reduce' } });

  test.beforeEach(() => {
    // Baseline không phụ thuộc hệ điều hành vì dựng từ ảnh Figma.
    test.info().snapshotSuffix = '';
  });

  test.describe('Thứ tự block giữa 2 template (AC-H1, D2)', () => {
    const templateDir = process.env.ES1T176_TEMPLATE_DIR || resolve(ROOT, 'templates');
    const read = (file: string) => readFileSync(resolve(templateDir, file), 'utf8');

    test('index.figma và index cùng cây block, cùng background, tag của container', () => {
      expect(blockTree(read('index.figma.liquid'))).toEqual(blockTree(read('index.liquid')));
    });

    test('Bộ so nhận ra block thừa, block đổi chỗ, background khác; bỏ qua block trong comment', () => {
      const base = "{% block 'container', background: 'dark' %}{% block 'a' %}{% endblock %}{% block 'b' %}{% endblock %}{% endblock %}";
      expect(blockTree(base)).toEqual(['container background=dark tag=-', '  a', '  b']);
      expect(blockTree(base.replace("{% block 'b' %}", "{% block 'c' %}{% endblock %}{% block 'b' %}"))).not.toEqual(blockTree(base));
      expect(blockTree(base.replace("'a'", "'x'").replace("'b'", "'a'").replace("'x'", "'b'"))).not.toEqual(blockTree(base));
      expect(blockTree(base.replace('dark', 'sand'))).not.toEqual(blockTree(base));
      expect(blockTree(`{% comment %}{% block 'z' %}{% endblock %}{% endcomment %}${base}`)).toEqual(blockTree(base));
    });
  });

  test.describe('Dữ liệu đối chiếu', () => {
    test('Đủ ngoại lệ còn hiệu lực, mỗi mục có nguồn', () => {
      const keys = Object.keys(exceptions).filter((key) => /^E\d+$/.test(key));
      // E6, E11 đã bỏ: theo Figma (CTO 07/11)
      expect(keys).toEqual(Array.from({ length: 11 }, (_, i) => `E${i + 1}`).filter((key) => !['E6', 'E11'].includes(key)));
      for (const key of keys) expect((exceptions as unknown as Record<string, { source: string }>)[key].source, key).toBeTruthy();
    });

    test('Bảng ES1-T173 đủ 17 hàng, mọi node so ảnh có trong snapshot và đang hiện', () => {
      expect(Object.keys(content).sort()).toEqual(['1', '10', '11', '12', '13', '14', '15', '16', '2', '3', '4a', '4b', '5', '6', '7', '8', '9'].sort());
      for (const row of rows as Row[]) expect(nodes.get(row.node)?.visible, `${row.id} ${row.node}`).toBe(true);
      for (const row of rows as Row[]) {
        for (const item of row.styles ?? []) expect(nodes.get(item.node)?.visible, `${row.id} ${item.node}`).toBe(true);
      }
    });
  });

  test.describe('So ảnh, kích thước, style (AC-H3, AC-H4)', () => {
    for (const row of rows as Row[]) {
      const title = `Hàng ${row.id} ${row.name} (${row.node})`;
      if (row.image !== 'active') {
        test.fixme(`${title}: chưa hiệu chuẩn, ${row.closedBy} đóng hàng này`, () => {});
        continue;
      }
      test(`${title}: so ảnh`, async ({ page }) => {
        const requests = countStoreRequests(page);
        await openGate(page);
        await showSlide(page, row);
        await compareGeometry(page, row);
        await compareImage(page, row);
        log('requests', row.id, { count: requests() });
      });
      if ((row.styles ?? []).length || (row.spacing ?? []).length) {
        test(`${title}: computed style`, async ({ page }) => {
          const requests = countStoreRequests(page);
          await openGate(page);
          await compareStyle(page, row);
          log('requests', row.id, { count: requests() });
        });
      }
    }
  });

  test.describe('So copy theo bảng ES1-T173 (AC-H2)', () => {
    const copyRows = (rows as Row[]).filter((row) => row.copyRow);
    const ready = copyRows.filter((row) => !row.copyNeedsData);

    test('Copy mặc định của theme trên các hàng render được không cần dữ liệu Figma', async ({ page }) => {
      const requests = countStoreRequests(page);
      await openGate(page);
      const report: Array<{ row: string; missing: string[] }> = [];
      for (const row of ready) {
        const root = page.getByTestId(row.copyRoot).first();
        await expect.soft(root, `Hàng ${row.copyRow}: không có ${row.copyRoot}`).toHaveCount(1);
        await root.scrollIntoViewIfNeeded().catch(() => {});
        await page.waitForTimeout(800); // module lazy tính số liệu panel
        const text = (await root.innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
        const skip = new Set((row.copySkip ?? []).map((s: { value: string }) => s.value));
        const missing = content[row.copyRow].filter((line) => line.kind === 'copy' && !skip.has(line.value)).map((line) => line.expected).filter((expected) => !text.includes(expected));
        report.push({ row: row.copyRow, missing });
        log('copy', row.copyRow, { missing });
        expect.soft(missing, `Hàng ${row.copyRow} thiếu copy. Đọc được: ${text.slice(0, 400)}`).toEqual([]);
      }
      expect(report.length).toBe(ready.length);
      log('requests', 'copy', { count: requests() });
    });

    for (const row of copyRows.filter((item) => item.copyNeedsData)) {
      test.fixme(`Hàng ${row.copyRow} copy: band chưa render khi thiếu collection, blog figma-*, ${dataTicket} đóng hàng này`, () => {});
    }
    test.fixme(`Dữ liệu store (dòng loại store của 17 hàng, menu hàng 1): chờ nhập dữ liệu, ${dataTicket} đóng phần này`, () => {});
  });
});
