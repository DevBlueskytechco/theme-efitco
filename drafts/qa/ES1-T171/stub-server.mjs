// Trang chủ giả cho ES1-T30: markup chép từ blocks/slideshow.liquid (autoplay tắt như mặc định), assets/slideshow.js và base.css thật. Không gọi store.
// Chạy qua drafts/qa/ES1-T171/pw.t30.config.ts.
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';

const slide = (n) => `<div class="slideshow__slide" role="group" aria-roledescription="slide" data-slide-id="s${n}" data-testid="slideshow-slide"><p style="height:400px">Slide ${n} <a href="#${n}">Link ${n}</a></p></div>`;

const HOME = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>stub</title>
<meta name="viewport" content="width=device-width,initial-scale=1"><style>:root{--space-1:4px;--space-2:8px;--space-3:12px;--space-4:16px;--space-5:24px;--space-6:32px;--page-margin:16px}</style><link rel="stylesheet" href="/assets/base.css"></head>
<body><header style="height:40px">header</header><main>
<slideshow-carousel class="slideshow full-width" role="region" aria-roledescription="carousel" aria-label="Slideshow" data-header-overlay
  data-autoplay="false" data-autoplay-speed="5" data-label-slide="Slide [index] of [total]" data-label-dot="Go to slide [index]"
  data-label-pause="Pause" data-label-play="Play" data-testid="slideshow">
  <div class="slideshow__frame">
    <div class="slideshow__track" role="group" tabindex="0" aria-label="Slides" data-testid="slideshow-track">${slide(1)}${slide(2)}${slide(3)}</div>
    <div class="slideshow__controls" data-testid="slideshow-controls">
      <button type="button" class="slideshow__arrow slideshow__arrow--prev" aria-label="Previous" data-testid="slideshow-prev">&lt;</button>
      <button type="button" class="slideshow__arrow slideshow__arrow--next" aria-label="Next" data-testid="slideshow-next">&gt;</button>
      <div class="slideshow__dots" data-testid="slideshow-dots"><template><button type="button" class="slideshow__dot" data-testid="slideshow-dot"></button></template></div>
      <button type="button" class="slideshow__pause" aria-label="Pause" data-testid="slideshow-pause">||</button>
    </div>
  </div>
  <div class="visually-hidden" aria-live="polite" aria-atomic="true" data-testid="slideshow-live"></div>
</slideshow-carousel>
<script src="/assets/slideshow.js" type="module"></script>
<div style="height:3000px">Nội dung dài để đưa slideshow ra khỏi viewport</div>
</main></body></html>`;

const TYPES = { css: 'text/css', js: 'text/javascript' };

createServer((req, res) => {
  const { pathname } = new URL(req.url, 'http://stub');
  if (pathname === '/') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(HOME);
    return;
  }
  const asset = /^\/assets\/([\w-]+\.(css|js))$/.exec(pathname);
  if (asset) {
    res.writeHead(200, { 'content-type': TYPES[asset[2]] });
    res.end(readFileSync(`assets/${asset[1]}`));
    return;
  }
  res.writeHead(404).end();
}).listen(Number(process.argv[2]), '127.0.0.1');
