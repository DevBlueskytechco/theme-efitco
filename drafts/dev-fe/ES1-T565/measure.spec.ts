// Đo cục bộ trước/sau (không phải spec CI). Chạy: npx playwright test -c drafts/dev-fe/ES1-T565/measure.config.ts
import { test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { gzipSync } from 'node:zlib';

const files = ['base', 'critical', 'collection', 'quiz', 'shop-the-look', 'bundle-builder', 'featured-product', 'image-with-text'];
test('đo', () => {
  const rows: string[] = [];
  for (const f of files) {
    const now = readFileSync(`assets/${f}.css`);
    let dev: Buffer | null = null;
    try {
      dev = execFileSync('git', ['show', `origin/develop:assets/${f}.css`], { stdio: ['ignore', 'pipe', 'ignore'] });
    } catch {}
    rows.push(`${f}.css | ${dev ? dev.length : '-'} | ${dev ? gzipSync(dev).length : '-'} | ${now.length} | ${gzipSync(now).length}`);
  }
  console.log(rows.join('\n'));
});
