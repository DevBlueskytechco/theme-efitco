// Kiểm cục bộ assets/page-layers.js trên trang giả lập, không gọi mạng (Chromium của Playwright).
// Chạy: node drafts/dev-be/ES1-T314/local-check.mjs assets/page-layers.js
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const require = createRequire(process.cwd() + '/package.json');
const { chromium } = require('playwright');
const js = readFileSync(process.argv[2], 'utf8');
const b = await chromium.launch();
const p = await b.newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(e.message));
p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
await p.setContent(
  '<html><body><page-layers data-inbox-selector="#ShopifyChat, #dummy-chat-button-iframe"></page-layers><main><input id=i><button id=t data-layer=x aria-expanded=false>t</button><div data-layer=o><dialog id=nm>x</dialog></div><dialog id=m>m</dialog><iframe id=f title=f srcdoc="<button>b</button>"></iframe></main></body></html>'
);
await p.addScriptTag({ content: js, type: 'module' });
await p.waitForFunction(() => customElements.get('page-layers'));
await p.evaluate(() => {
  window.idle = 0;
  document.addEventListener('layers:idle', () => window.idle++);
});
const st = () =>
  p.evaluate(() => {
    const h = document.documentElement;
    return { open: h.hasAttribute('data-layer-open'), consent: h.hasAttribute('data-consent'), inbox: h.hasAttribute('data-inbox'), h: h.style.getPropertyValue('--consent-height'), idle: window.idle };
  });
const log = async (l) => {
  await p.waitForTimeout(80);
  console.log(l.padEnd(20), JSON.stringify(await st()));
};
const ev = (f) => p.evaluate(f);
await log('init');
await ev(() => document.getElementById('m').showModal()); await log('showModal');
await p.keyboard.press('Escape'); await log('esc');
await ev(() => document.getElementById('t').setAttribute('aria-expanded', 'true')); await log('aria true');
await ev(() => document.getElementById('t').setAttribute('aria-expanded', 'false')); await log('aria false');
await ev(() => document.getElementById('nm').show()); await log('nonmodal show');
await ev(() => document.getElementById('nm').close()); await log('nonmodal close');
await p.focus('#i'); await log('focus input');
await ev(() => document.activeElement.blur()); await log('blur input');
await p.frameLocator('#f').locator('button').click(); await log('focus iframe');
await ev(() => document.activeElement.blur()); await log('leave iframe');
await ev(() => { const d = document.createElement('div'); d.id = 'ShopifyChat'; document.body.append(d); }); await log('inbox add');
await ev(() => { const d = document.createElement('div'); d.id = 'shopify-pc__banner'; d.style.cssText = 'position:fixed;left:0;right:0;bottom:0;height:200px'; document.body.append(d); }); await log('banner 200');
await ev(() => { document.getElementById('shopify-pc__banner').style.height = '260px'; }); await log('banner 260');
await ev(() => { document.getElementById('shopify-pc__banner').style.display = 'none'; }); await log('banner none');
await ev(() => { document.getElementById('shopify-pc__banner').style.display = ''; }); await log('banner back');
await ev(() => document.dispatchEvent(new Event('visitorConsentCollected'))); await log('collected');
await ev(() => document.querySelector('page-layers').remove()); await log('removed');
console.log('errors', JSON.stringify(errs));
await b.close();
