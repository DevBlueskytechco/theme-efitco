// ES1-T217: đọc static-result.json, in test tĩnh đỏ. Test cần trình duyệt fail vì Chromium/store nên bị loại theo nội dung lỗi.
import { readFileSync } from 'node:fs';

const file = process.argv[2];
const report = JSON.parse(readFileSync(file, 'utf8'));
const ENV_ERROR = /browserType\.launch|Target page, context or browser has been closed|ERR_CONNECTION|ERR_|net::|Executable doesn't exist|Test timeout|apiRequestContext|ECONNREFUSED|Timed out|Test ended|PREVIEW_URL|Invalid URL|Cannot navigate|EPERM|SIGTRAP/i;
const counts = { passed: 0, skipped: 0, env: 0, static: 0 };
const rows = [];

const clean = (text) => text.replace(/\u001b\[[0-9;]*m/g, '');

function walk(suite, titles) {
  for (const spec of suite.specs ?? []) {
    for (const t of spec.tests) {
      const result = t.results.at(-1);
      if (result.status === 'passed') counts.passed++;
      else if (result.status === 'skipped') counts.skipped++;
      else {
        const message = clean(result.error?.message ?? result.status);
        if (ENV_ERROR.test(message)) counts.env++;
        else {
          counts.static++;
          rows.push(`${spec.file}:${spec.line} | ${[...titles, spec.title].join(' > ')}\n    ${message.slice(0, 700).replace(/\n/g, '\n    ')}`);
        }
      }
    }
  }
  for (const child of suite.suites ?? []) walk(child, [...titles, child.title]);
}

for (const suite of report.suites) walk(suite, []);
console.log(JSON.stringify(counts));
console.log(rows.join('\n\n'));
