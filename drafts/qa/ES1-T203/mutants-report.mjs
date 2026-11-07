// Tóm tắt kết quả pw.mutant.config.ts: mỗi mutation bao nhiêu test đỏ và đó là test nào.
import { readFileSync } from 'node:fs';

const report = JSON.parse(readFileSync('drafts/qa/ES1-T203/test-results/mutants.json', 'utf8'));
const byProject = new Map();
const walk = (suite, trail) => {
  for (const spec of suite.specs ?? []) {
    for (const t of spec.tests) {
      const row = byProject.get(t.projectName) ?? { failed: [], total: 0 };
      row.total++;
      if (t.status === 'unexpected') row.failed.push(`${spec.title} [${trail}]`);
      byProject.set(t.projectName, row);
    }
  }
  for (const child of suite.suites ?? []) walk(child, child.title);
};
for (const suite of report.suites) walk(suite, suite.title);
for (const [name, row] of byProject) {
  console.log(`${row.failed.length ? 'BẮT ĐƯỢC' : 'LỌT'}  ${name}: ${row.failed.length}/${row.total} đỏ`);
  for (const title of row.failed.slice(0, 2)) console.log(`    ${title.slice(0, 130)}`);
}
