// ES1-T162: parse 2 workflow, kiểm tham chiếu needs/outputs và vị trí concurrency. Không gọi GitHub.
// Dùng từ gốc repo: node drafts/devops/ES1-T162/verify-workflows.js
const fs = require('fs');
const yaml = require(`${process.cwd()}/node_modules/js-yaml`);
const load = (f) => yaml.load(fs.readFileSync(f, 'utf8'));
const ci = load('.github/workflows/ci.yml');
const st = load('.github/workflows/store-tests.yml');
const fails = [];
const check = (name, cond) => { console.log(`${cond ? 'ok  ' : 'FAIL'} ${name}`); if (!cond) fails.push(name); };

for (const [file, wf] of [['ci', ci], ['store-tests', st]]) {
  for (const [id, job] of Object.entries(wf.jobs)) {
    for (const n of [].concat(job.needs || [])) check(`${file}.${id} needs ${n} tồn tại`, n in wf.jobs);
  }
}
const group = ci.jobs['store-tests'].concurrency || {};
check('group store-hoa-qua-e2e, cancel-in-progress false', group.group === 'store-hoa-qua-e2e' && group['cancel-in-progress'] === false);
check('store-tests gọi file reusable', ci.jobs['store-tests'].uses === './.github/workflows/store-tests.yml');
check('store-tests.yml có workflow_call', Boolean(st.on.workflow_call));
for (const id of ['theme-check', 'preview']) check(`${id} không có concurrency`, !ci.jobs[id].concurrency);
for (const id of ['theme-check', 'preview', 'lighthouse', 'e2e', 'cli5-canary']) check(`check ${id} còn ở ci.yml`, id in ci.jobs);
for (const id of Object.keys(st.jobs)) check(`store-tests.${id} không có concurrency riêng`, !st.jobs[id].concurrency);
const outs = st.on.workflow_call.outputs;
check('output lighthouse_result trỏ job có thật', outs.lighthouse_result.value.includes('jobs.lighthouse.result'));
check('output e2e_result trỏ gate không matrix', outs.e2e_result.value.includes('jobs.e2e-gate.result') && !st.jobs['e2e-gate'].strategy);
const steps = ci.jobs.preview.steps;
const warnAt = steps.findIndex((s) => (s.run || '').includes('live-theme-warn'));
const pushAt = steps.findIndex((s) => s.id === 'push');
check('live-theme-warn trước push', warnAt >= 0 && warnAt < pushAt);
check('live-theme-warn không chặn', steps[warnAt] && steps[warnAt]['continue-on-error'] === true);
console.log(fails.length ? `fail=${fails.length}` : 'fail=0');
process.exit(fails.length ? 1 : 0);
