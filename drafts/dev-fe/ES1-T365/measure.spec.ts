// Tạm: đo byte base.css/critical.css trước (HEAD) và sau (working tree). Xoá trước khi nộp.
import { test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { gzipSync } from 'node:zlib';

test('measure', () => {
  const before = execSync('git show HEAD:assets/base.css');
  const after = readFileSync('assets/base.css');
  console.log(JSON.stringify({
    baseBefore: before.length, baseAfter: after.length,
    gzipBefore: gzipSync(before, { level: 6 }).length, gzipAfter: gzipSync(after, { level: 6 }).length,
    critical: readFileSync('assets/critical.css').length,
  }));
});
