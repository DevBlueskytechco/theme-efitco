// Tóm tắt static-run.json cục bộ (không phải spec CI)
import { test } from '@playwright/test';
import { readFileSync } from 'node:fs';

test('tóm tắt', () => {
  const r = JSON.parse(readFileSync('drafts/dev-fe/ES1-T565/static-run.json', 'utf8'));
  const out: string[] = [];
  const walk = (s: any, file: string) => {
    for (const sp of s.specs ?? []) {
      for (const t of sp.tests ?? []) {
        const res = t.results?.[0];
        const err = res?.error?.message ?? '';
        const browser = /browserType\.launch|Target page, context or browser/.test(err);
        out.push(`${t.status === 'expected' ? 'PASS' : t.status === 'skipped' ? 'SKIP' : browser ? 'ENV ' : 'FAIL'} ${file}:${sp.line} ${sp.title}${!browser && err && t.status !== 'expected' ? ' :: ' + err.slice(0, 300) : ''}`);
      }
    }
    for (const c of s.suites ?? []) walk(c, file || c.file);
  };
  for (const s of r.suites) walk(s, s.file);
  console.log(out.join('\n'));
});
