// ES1-T229: in lỗi của project tabfetch trong repro-result.json: test ES1-T189 phải chỉ nêu request dữ liệu tab, không nêu nhiễu.
import { readFileSync } from 'node:fs';

const report = JSON.parse(readFileSync('drafts/qa/ES1-T229/repro-result.json', 'utf8'));
const clean = (text) => text.replace(/\u001b\[[0-9;]*m/g, '');

function walk(suite) {
  for (const spec of suite.specs ?? []) {
    for (const t of spec.tests) {
      if (t.projectName === 'tabfetch') console.log(clean(t.results.at(-1).error?.message ?? '(không lỗi)'));
    }
  }
  for (const child of suite.suites ?? []) walk(child);
}
for (const suite of report.suites) walk(suite);
