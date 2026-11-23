// Đo cục bộ ES1-T566 (không phải spec CI): gzip từng file, tổng trang chủ, ảnh hưởng của comment.
import { test } from '@playwright/test';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { gzipSync } from 'node:zlib';

const FILES = ['base', 'critical', 'aux', 'collection', 'product', 'cart', 'quiz', 'shop-the-look', 'bundle-builder', 'featured-product', 'image-with-text', 'multicolumn', 'hello-world'];
// CTO 21/11 ES1-T575: testimonials, video-carousel, faq, shop-by-level ở base.css
const INDEX = ['quiz', 'shop-the-look', 'bundle-builder', 'featured-product', 'image-with-text'];
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '');
const dev = (f: string) => {
  try { return execFileSync('git', ['show', `HEAD:assets/${f}.css`]); } catch { return null; }
};

test('đo', () => {
  const rows: string[] = [];
  let idx = 0, idxStrip = 0;
  for (const f of FILES) {
    const p = `assets/${f}.css`;
    if (!existsSync(p)) continue;
    const b = readFileSync(p);
    const d = dev(f);
    const g = gzipSync(b).length;
    const gs = gzipSync(Buffer.from(strip(b.toString()))).length;
    rows.push(`${f}\tthô ${b.length}\tgzip ${g}\tgzip-bỏ-comment ${gs}\tdevelop thô ${d ? d.length : '-'}\tdevelop gzip ${d ? gzipSync(d).length : '-'}`);
    if (f === 'base' || INDEX.includes(f)) { idx += g; idxStrip += gs; }
  }
  rows.push(`index base+5 file: ${idx} | bỏ comment: ${idxStrip}`);
  console.log(rows.join('\n'));
});
