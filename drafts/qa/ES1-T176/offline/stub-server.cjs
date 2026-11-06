'use strict';
// ES1-T176: trang giả để kiểm đường đo của spec, KHÔNG phải số đo theme. Đặt đúng ảnh Figma và phần tử đúng toạ độ, style của node.
// STUB_MODE: identity (khớp Figma), shift1, shift2 (ảnh lệch 1, 2 px CSS), wrong (sai style, thiếu copy).
const { createServer } = require('node:http');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { loadRows, ROOT } = require(resolve('tests/e2e/support/figma-baseline.cjs'));
const { parseContent, snapshotIndex } = require(resolve('tests/e2e/support/figma-compare.ts'));

const MODE = process.env.STUB_MODE || 'identity';
const SHIFT = { shift1: 1, shift2: 2 }[MODE] ?? 0;
const nodes = snapshotIndex(JSON.parse(readFileSync(resolve(ROOT, 'docs/figma/snapshot-1-359.json'), 'utf8')));
const content = parseContent(readFileSync(resolve(ROOT, 'drafts/ba/ES1-T173/home-content.md'), 'utf8'));
const { rows } = loadRows();

const css = (id, extra = '', origin = { x: 0, y: 0 }) => {
  const b = nodes.get(id).box;
  return `position:absolute;left:${b.x - origin.x}px;top:${b.y - origin.y}px;width:${b.width}px;height:${b.height}px;${extra}`;
};
const font = (id) => {
  const s = nodes.get(id).style;
  const size = MODE === 'wrong' && id === '1:431' ? 99 : s.fontSize;
  return `font-family:'${s.fontFamily}';font-weight:${s.fontWeight};font-size:${size}px;line-height:${s.lineHeightPx}px;letter-spacing:${s.letterSpacing ?? 0}px;text-transform:${s.textCase === 'UPPER' ? 'uppercase' : 'none'};color:${nodes.get(id).fill};margin:0;`;
};
const slideBox = nodes.get('1:423').box;

function copyBlocks() {
  let out = '';
  for (const row of rows) {
    if (!row.copyRow || row.copyNeedsData) continue;
    let lines = content[row.copyRow].filter((line) => line.kind === 'copy').map((line) => line.expected);
    if (MODE === 'wrong' && row.copyRow === '15') lines = lines.slice(1);
    if (row.copyRow === '2') continue;
    out += `<div data-testid="${row.copyRoot}">${lines.map((l) => `<p>${l}</p>`).join('')}</div>`;
  }
  return out;
}

const html = () => `<!doctype html><html><head><title>stub</title><style>html,body{margin:0;background:#1a1a1a;color:#fff}ul{list-style:none;margin:0;padding:0}a{text-decoration:none}</style></head><body>
<header data-testid="header">
  <a data-testid="header-logo" style="${css('1:377')}">logo</a>
  <ul>
    <li data-testid="header-menu-item" style="${css('1:366')}"><a href="#" style="visibility:hidden;${font('I1:366;2963:2083;1327:1245')}">Shop</a></li>
    <li data-testid="header-menu-item" style="${css('1:372')}"><a href="#" style="visibility:hidden">Help</a></li>
  </ul>
  <a data-testid="header-search-link" style="${css('1:374')}"></a>
  <a data-testid="header-account" style="${css('1:375')}"></a>
  <a data-testid="header-cart-link" style="${css('1:376')}"></a>
</header>
<div data-testid="slideshow">
  <div data-testid="slideshow-track" style="${css('1:423', 'border-radius:24px;')}"></div>
  <div data-testid="slideshow-slide" style="${css('1:423', 'border-radius:24px;')}">
    <div data-testid="slideshow-image" style="position:absolute;inset:0"></div>
    <p style="${css('1:429', font('1:429'), slideBox)}">Trusted by 10,000+ athletes</p>
    <h1 data-testid="slideshow-heading" style="${css('1:431', font('1:431'), slideBox)}">Level Up Your Fitness</h1>
    <p style="${css('1:432', font('1:432'), slideBox)}">Upgrade your journey with Efitco gear made for every workout.</p>
    <a data-testid="slideshow-button-primary" style="${css('1:433', `background:#c8400e;border-radius:8px;padding:13px 32px;box-sizing:border-box;${font('I1:433;377:1333')}`, slideBox)}">Explore Equipment</a>
  </div>
  <div data-testid="slideshow-slide" style="${css('1:438', 'border-radius:24px;')}"></div>
  <button data-testid="slideshow-prev" style="${css('1:435', 'background:#fff;border:0;padding:0;')}"></button>
  <button data-testid="slideshow-next" style="${css('1:436', 'background:#c8400e;border:0;padding:0;')}"></button>
  <div data-testid="slideshow-dots" style="${css('1:418')}"></div>
</div>
<div style="position:absolute;top:1200px;left:0;width:1000px"><div data-testid="stub-hero-copy">${content['2'].filter((l) => l.kind === 'copy').map((l) => `<p>${l.expected}</p>`).join('')}</div>${copyBlocks()}</div>
<img id="h" src="/img/1-362.png" style="position:absolute;left:${252 + SHIFT}px;top:24px;width:1416px;height:30px;pointer-events:none;z-index:9">
<img id="s" src="/img/1-422.png" style="position:absolute;left:${61 + SHIFT}px;top:80px;width:1798px;height:827px;pointer-events:none;z-index:9">
<script>document.querySelector('[data-testid="slideshow-next"]').addEventListener('click',()=>{document.getElementById('s').src='/img/1-437.png'});
document.querySelector('[data-testid="slideshow"]').insertAdjacentHTML('afterbegin', document.querySelector('[data-testid="stub-hero-copy"]').outerHTML.replace('stub-hero-copy','stub-hero-copy-2'));</script>
</body></html>`;

createServer((req, res) => {
  const url = new URL(req.url, 'http://stub');
  if (url.pathname.startsWith('/img/')) {
    res.writeHead(200, { 'content-type': 'image/png' });
    return res.end(readFileSync(resolve(ROOT, 'docs/figma/img', url.pathname.slice(5))));
  }
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  return res.end(html());
}).listen(4176, '127.0.0.1', () => console.log('stub', MODE));
