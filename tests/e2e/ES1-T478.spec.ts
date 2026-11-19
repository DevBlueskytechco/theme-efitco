// ES1-T478 (ADR 0013, CTO 17/11 ES1-T472 a): tách CSS theo template. Spec tĩnh, không cần store.
// - Trần gzip (Node zlib.gzipSync mức mặc định): base.css ≤ 49 152 B; product.css, collection.css, cart.css, aux.css ≤ 16 384 B mỗi file;
//   critical.css ≤ 10 240 B thô.
// - layout/theme.liquid: đúng 1 `case template.name` ngay sau base.css, mỗi file template đúng 1 lần, không preload.
// - layout/password.liquid, templates/gift_card.liquid: aux.css ngay sau base.css.
// - Không prelude (chuỗi trước `{`, bỏ at-rule và keyframe) nào vừa ở base.css vừa ở file template, và không trùng giữa 2 file template.
// Chạy: npx playwright test tests/e2e/ES1-T478.spec.ts --project=desktop
import { test, expect } from './support/test';
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const PAGE_FILES = ['product', 'collection', 'cart', 'aux'] as const;
const read = (path: string) => readFileSync(path, 'utf8');
const gz = (path: string) => gzipSync(readFileSync(path)).length;

// Prelude của mọi rule kiểu (bỏ comment, at-rule, keyframe from/to/%), chuẩn hoá khoảng trắng
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

test.describe('ES1-T478 tách CSS theo template (tĩnh)', () => {
  test('trần kích thước: base ≤ 49 152 gzip, file template ≤ 16 384 gzip, critical ≤ 10 240 thô', () => {
    const sizes = Object.fromEntries(
      ['base', ...PAGE_FILES].map((f) => [`${f}.css`, gz(`assets/${f}.css`)]),
    );
    console.log(`[ES1-T478] gzip ${JSON.stringify(sizes)} | critical thô ${readFileSync('assets/critical.css').length}`);
    expect(sizes['base.css']).toBeLessThanOrEqual(49152);
    for (const f of PAGE_FILES) expect(sizes[`${f}.css`], `${f}.css`).toBeLessThanOrEqual(16384);
    expect(readFileSync('assets/critical.css').length).toBeLessThanOrEqual(10240);
  });

  test('layout/theme.liquid: 1 case template.name sau base.css, mỗi file 1 lần, không preload', () => {
    const theme = read('layout/theme.liquid');
    expect(theme.match(/case template\.name/g) ?? []).toHaveLength(1);
    const base = theme.indexOf("'base.css' | asset_url | stylesheet_tag");
    const kase = theme.indexOf('case template.name');
    expect(base).toBeGreaterThan(-1);
    expect(kase).toBeGreaterThan(base);
    for (const f of PAGE_FILES) {
      const tags = theme.match(new RegExp(`'${f}\\.css' \\| asset_url \\| stylesheet_tag[^}]*`, 'g')) ?? [];
      expect(tags, `${f}.css`).toHaveLength(1);
      expect(tags[0]).not.toContain('preload');
      expect(theme.indexOf(`'${f}.css'`)).toBeGreaterThan(kase);
    }
    // Nhánh đúng nhóm (ADR 0013 bảng 1)
    const block = theme.slice(kase, theme.indexOf('endcase', kase));
    expect(block).toMatch(/when 'product'\s*-?%\}\s*\{\{ 'product\.css'/);
    expect(block).toMatch(/when 'collection', 'search', 'list-collections'\s*-?%\}\s*\{\{ 'collection\.css'/);
    expect(block).toMatch(/when 'cart'\s*-?%\}\s*\{\{ 'cart\.css'/);
    expect(block).toMatch(/when '404', 'page', 'blog', 'article', 'password'\s*-?%\}\s*\{\{ 'aux\.css'/);
  });

  test('password, gift card: aux.css ngay sau base.css, không preload', () => {
    for (const path of ['layout/password.liquid', 'templates/gift_card.liquid']) {
      const src = read(path);
      expect(src, path).toMatch(
        /\{\{ 'base\.css' \| asset_url \| stylesheet_tag \}\}\s*\{\{ 'aux\.css' \| asset_url \| stylesheet_tag \}\}/,
      );
      expect(src.match(/'(product|collection|cart)\.css'/g), path).toBeNull();
    }
  });

  test('không prelude nào trùng giữa base.css và file template, hay giữa 2 file template', () => {
    const base = preludes(read('assets/base.css'));
    const seen = new Map<string, string>();
    const dupes: string[] = [];
    for (const f of PAGE_FILES) {
      for (const p of preludes(read(`assets/${f}.css`))) {
        if (base.has(p)) dupes.push(`base.css ↔ ${f}.css: ${p}`);
        const other = seen.get(p);
        if (other && other !== f) dupes.push(`${other}.css ↔ ${f}.css: ${p}`);
        seen.set(p, f);
      }
    }
    expect(dupes).toEqual([]);
  });
});
