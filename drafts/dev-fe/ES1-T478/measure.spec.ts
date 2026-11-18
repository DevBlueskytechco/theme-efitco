// Đo bảng gzip trước/sau cho PR body ES1-T478 (Node zlib.gzipSync mức mặc định, như ES1-T326.spec.ts). Không phải spec CI.
// npx playwright test -c drafts/dev-fe/ES1-T478/playwright.measure.config.ts
import { test } from '@playwright/test';
import { readFileSync, existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

test('bảng gzip', () => {
  const files = [
    'drafts/dev-fe/ES1-T478/base.before.css',
    'assets/base.css',
    'assets/product.css',
    'assets/collection.css',
    'assets/cart.css',
    'assets/aux.css',
    'assets/critical.css',
  ];
  for (const f of files) {
    if (!existsSync(f)) continue;
    const buf = readFileSync(f);
    console.log(`[gzip] ${f} raw=${buf.length} gzip=${gzipSync(buf).length}`);
  }
});
