// ES1-T229: in từng test trong repro-result.json: project, trạng thái, thời gian, dòng lỗi đầu.
import { readFileSync } from 'node:fs';

const report = JSON.parse(readFileSync('drafts/qa/ES1-T229/repro-result.json', 'utf8'));
const clean = (text) => text.replace(/\u001b\[[0-9;]*m/g, '').split('\n')[0].slice(0, 110);

function walk(suite, titles) {
  for (const spec of suite.specs ?? []) {
    for (const t of spec.tests) {
      const r = t.results.at(-1);
      console.log(`${t.projectName}\t${r.status}\t${(r.duration / 1000).toFixed(1)}s\t${spec.title.slice(0, 48)}\t${clean(r.error?.message ?? '')}`);
    }
  }
  for (const child of suite.suites ?? []) walk(child, [...titles, child.title]);
}
for (const suite of report.suites) walk(suite, []);
console.log(JSON.stringify(report.stats));
