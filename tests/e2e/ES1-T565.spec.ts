// ES1-T565 TE-10-R2-FE9 (ADR 0014 mục Đo): CSS theo block, tầng 4 `assets/<block>.css` nạp bằng stylesheet_tag trong block. Spec tĩnh, không cần store.
// - Mỗi file CSS có dòng stylesheet_tag trong blocks/*.liquid (trừ tầng 1–3): gzip ≤ 8 192 B (Node zlib.gzipSync mức mặc định).
// - File tầng 4 có ≥ 1 block nạp; block cha trong bảng ADR 0014 mục 2 nạp đúng 1 lần, trước root (trước block.shopify_attributes), ngoài {% partial %}.
// - Không `preload` trên dòng link; không stylesheet_tag trong snippets/.
// - base.css ≤ 49 152 B (ES1-T566 hạ 40 960); base + file tầng 4 do block trong templates/index.liquid nạp ≤ 57 344 B (CTO 21/11 ES1-T569), ≤ 10 file.
// - Không prelude trùng giữa base.css, file tầng 3, file tầng 4; base.css không còn selector của 5 block đã tách; .quiz-page__breadcrumb ở collection.css.
// ES1-T566 dùng lại spec này: thêm 6 file vào BLOCK_FILES/PARENTS, hạ BASE_MAX.
// Chạy: npx playwright test tests/e2e/ES1-T565.spec.ts --project=desktop
import { test, expect } from './support/test';
import { readFileSync, readdirSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const read = (path: string) => readFileSync(path, 'utf8');
const gz = (path: string) => gzipSync(readFileSync(path)).length;

const BASE_MAX = 49152;
const BLOCK_MAX = 8192;
const INDEX_MAX = 57344; // CTO 21/11 (ES1-T569): chấp nhận overhead nén từng file block
const INDEX_FILES_MAX = 10;
const NOT_TIER4 = ['critical', 'base', 'product', 'collection', 'cart', 'aux'];
const PAGE_FILES = ['product', 'collection', 'cart', 'aux'];
// ADR 0014 mục 2: file tầng 4 → block cha nạp file đó
const PARENTS: Record<string, string[]> = {
  quiz: ['quiz'],
  'shop-the-look': ['shop-the-look'],
  'bundle-builder': ['bundle-builder'],
  'featured-product': ['featured-product'],
  'image-with-text': ['image-with-text'],
};
const BLOCK_FILES = Object.keys(PARENTS);
// Block con: không nạp link (block cha đã nạp)
const CHILDREN = ['quiz-step', 'shop-the-look-row'];
// Class block đã tách: không được còn trong prelude nào của base.css
const MOVED = /\.(quiz|bundle-builder|shop-the-look|featured-product|image-with-text)(?![\w-])|\.(quiz|bundle-builder|shop-the-look|featured-product|image-with-text)[-_]/;

const LINK = /\{\{-?\s*'([a-z0-9-]+)\.css'\s*\|\s*asset_url\s*\|\s*stylesheet_tag([^}]*)\}\}/g;

const blocks = readdirSync('blocks').filter((f) => f.endsWith('.liquid')).map((f) => f.replace(/\.liquid$/, ''));
const links = (name: string) => {
  const src = read(`blocks/${name}.liquid`);
  return [...src.matchAll(LINK)].map((m) => ({ file: m[1], args: m[2], index: m.index ?? 0, src }));
};
// file tầng 4 → các block nạp
const loaders = new Map<string, string[]>();
for (const b of blocks) {
  for (const l of links(b)) {
    if (NOT_TIER4.includes(l.file)) continue;
    loaders.set(l.file, [...(loaders.get(l.file) ?? []), b]);
  }
}

// Prelude của mọi rule kiểu (bỏ comment, at-rule, keyframe from/to/%), chuẩn hoá khoảng trắng (như ES1-T478)
const preludes = (css: string) => {
  const out = new Set<string>();
  const src = css.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const m of src.matchAll(/([^{};]+)\{/g)) {
    const p = m[1].replace(/\s+/g, ' ').trim();
    if (!p || p.startsWith('@') || /^(from|to|[\d.]+%)(\s*,\s*(from|to|[\d.]+%))*$/.test(p)) continue;
    out.add(p);
  }
  return out;
};

test.describe('ES1-T565 CSS theo block (tĩnh, ADR 0014)', () => {
  test.beforeEach(({}, info) => {
    test.skip(info.project.name !== 'desktop', 'tĩnh, chạy 1 lần');
  });

  test('mỗi file tầng 4 gzip ≤ 8 192 B; đủ 5 file của đợt này', () => {
    const sizes = Object.fromEntries([...loaders.keys()].map((f) => [`${f}.css`, gz(`assets/${f}.css`)]));
    console.log(`[ES1-T565] gzip tầng 4 ${JSON.stringify(sizes)}`);
    for (const f of BLOCK_FILES) expect(loaders.has(f), `${f}.css có block nạp`).toBe(true);
    for (const [f, size] of Object.entries(sizes)) expect(size, f).toBeLessThanOrEqual(BLOCK_MAX);
  });

  test('block cha nạp đúng 1 lần, trước root, ngoài partial, không preload; block con không nạp', () => {
    for (const [file, parents] of Object.entries(PARENTS)) {
      for (const p of parents) {
        const own = links(p).filter((l) => l.file === file);
        expect(own, `${p} nạp ${file}.css`).toHaveLength(1);
        const { index, src } = own[0];
        const root = src.indexOf('block.shopify_attributes');
        expect(root, `${p} có block.shopify_attributes`).toBeGreaterThan(-1);
        expect(index, `${p}: link trước root`).toBeLessThan(root);
        // Nhánh placeholder đầu tiên (tag if/elsif, không tính assign dùng request.design_mode)
        const design = src.search(/\{%-?\s*(if|elsif)\s+request\.design_mode\s*-?%\}/);
        if (design > -1) expect(index, `${p}: link trước nhánh placeholder`).toBeLessThan(design);
      }
    }
    for (const c of CHILDREN) expect(links(c).filter((l) => !NOT_TIER4.includes(l.file)), c).toEqual([]);
    for (const b of blocks) {
      for (const l of links(b)) {
        expect(l.args, `${b}: ${l.file}.css không preload`).not.toContain('preload');
        const before = l.src.slice(0, l.index);
        const open = (before.match(/\{%-?\s*partial\b/g) ?? []).length;
        const close = (before.match(/\{%-?\s*endpartial\b/g) ?? []).length;
        expect(open - close, `${b}: ${l.file}.css nằm ngoài partial`).toBe(0);
      }
    }
  });

  test('không stylesheet_tag trong snippets/', () => {
    const hits = readdirSync('snippets')
      .filter((f) => f.endsWith('.liquid'))
      .filter((f) => /\|\s*stylesheet_tag/.test(read(`snippets/${f}`)));
    expect(hits).toEqual([]);
  });

  const indexBudget = () => {
    const base = gz('assets/base.css');
    const index = read('templates/index.liquid');
    const used = new Set([...index.matchAll(/\{%-?\s*block\s+'([a-z0-9-]+)'/g)].map((m) => m[1]));
    const files = [...loaders.entries()].filter(([, bs]) => bs.some((b) => used.has(b))).map(([f]) => f);
    const total = base + files.reduce((sum, f) => sum + gz(`assets/${f}.css`), 0);
    return { base, files, total };
  };

  test('base.css ≤ 49 152; trang chủ ≤ 10 file tầng 4', () => {
    const { base, files, total } = indexBudget();
    console.log(`[ES1-T565] base ${base} | index tầng 4 ${JSON.stringify(files)} | tổng ${total}`);
    expect(base).toBeLessThanOrEqual(BASE_MAX);
    expect(files.length).toBeLessThanOrEqual(INDEX_FILES_MAX);
  });

  // KHÔNG CHẮC: đo thật 55 350 B (base 36 925 + 5 file 18 425), develop 48 641; nén từng file mất ngữ cảnh chung ≈ +1,3 KB/file.
  test('trang chủ: base + file tầng 4 ≤ 57 344', () => {
    expect(indexBudget().total).toBeLessThanOrEqual(INDEX_MAX);
  });

  test('không prelude trùng giữa base.css, file tầng 3 và file tầng 4', () => {
    const base = preludes(read('assets/base.css'));
    const seen = new Map<string, string>();
    const dupes: string[] = [];
    for (const f of [...PAGE_FILES, ...loaders.keys()]) {
      for (const p of preludes(read(`assets/${f}.css`))) {
        if (base.has(p)) dupes.push(`base.css ↔ ${f}.css: ${p}`);
        const other = seen.get(p);
        if (other && other !== f) dupes.push(`${other}.css ↔ ${f}.css: ${p}`);
        seen.set(p, f);
      }
    }
    expect(dupes).toEqual([]);
  });

  test('base.css không còn selector 5 block đã tách; breadcrumb quiz ở collection.css; quiz-fade theo quiz.css', () => {
    const left = [...preludes(read('assets/base.css'))].filter((p) => MOVED.test(p));
    expect(left).toEqual([]);
    const base = read('assets/base.css');
    expect(base).not.toContain('@keyframes quiz-fade');
    expect(read('assets/quiz.css')).toContain('@keyframes quiz-fade');
    expect(read('assets/collection.css')).toMatch(/\.quiz-page__breadcrumb \{/);
    expect(read('assets/quiz.css')).not.toContain('.quiz-page__breadcrumb');
    // Keyframe motion-* chỉ ở base.css
    for (const f of BLOCK_FILES) expect(read(`assets/${f}.css`), f).not.toMatch(/@keyframes motion-/);
  });
});
