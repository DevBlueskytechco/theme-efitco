// ES1-T446: harness local cho scripts/lhci-auth.js, không chạm store, không mở cổng.
// Giả /password bằng request interception: 'old' = form thẳng (trang cũ), 'new' = form trong <details> đóng (ES1-T384 / PR #208).
// Chạy: node drafts/devops/ES1-T446/lhci-auth-harness.js <đường dẫn puppeteer> scripts/lhci-auth.js
const path = require('path');
const puppeteer = require(process.argv[2] || 'puppeteer');
const auth = require(path.resolve(process.argv[3] || 'scripts/lhci-auth.js'));
const ORIGIN = 'https://harness.invalid';
const form = '<form method="post" action="/password"><label for="p">Password</label><input type="password" name="password" id="p"><button type="submit">Enter</button></form>';
const page = (v) => '<!doctype html><title>pw</title><h1>Opening soon</h1>' + (v === 'new' ? '<details><summary>Enter Using Password</summary>' + form + '</details>' : form);
const html = (body) => ({ status: 200, contentType: 'text/html', body });

async function run(v, pw, expect) {
  process.env.STORE_ORIGIN = ORIGIN;
  process.env.STORE_PASSWORD = pw;
  const b = await puppeteer.launch({ headless: true });
  const newPage = b.newPage.bind(b);
  b.newPage = async () => {
    const p = await newPage();
    await p.setRequestInterception(true);
    p.on('request', (q) => {
      const u = new URL(q.url());
      if (u.origin !== ORIGIN) return q.abort();
      if (q.method() === 'POST') {
        const sent = new URLSearchParams(q.postData() || '').get('password');
        return sent === 'secret' ? q.respond({ status: 302, headers: { location: ORIGIN + '/' } }) : q.respond(html(page(v)));
      }
      if (u.pathname.startsWith('/password')) return q.respond(html(page(v)));
      return q.respond(html('<title>home</title>home'));
    });
    return p;
  };
  let res;
  try { await auth(b); res = 'unlocked'; } catch (e) { res = 'error'; }
  await b.close();
  const ok = res === expect;
  console.log(`${ok ? 'PASS' : 'FAIL'} page=${v} pw=${pw} -> ${res} (expect ${expect})`);
  return ok;
}

(async () => {
  const r = [
    await run('old', 'secret', 'unlocked'),
    await run('new', 'secret', 'unlocked'),
    await run('new', 'wrong', 'error'),
    await run('old', 'wrong', 'error'),
  ];
  process.exit(r.every(Boolean) ? 0 : 1);
})();
