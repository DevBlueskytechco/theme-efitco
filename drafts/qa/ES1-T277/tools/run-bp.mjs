// ES1-T277 mục 1: đo Lighthouse (chỉ category best-practices) desktop + mobile cho 6 loại trang, theme live và preview,
// tuần tự 1 lần đo mỗi lúc (không chạy song song với CI store-tests: cùng concurrency store dev).
// Ghi lhr vào drafts/qa/ES1-T277/lhr/<theme>-<formFactor>-<trang>.json, rồi chạy classify-bp.mjs để ra bảng.
//
// Biến môi trường:
//   STORE_ORIGIN       bắt buộc = https://hoa-qua-nhap-khau.myshopify.com (store khác: dừng, theo .claude/rules/no-production.md)
//   STORE_PASSWORD     mật khẩu trang password store dev
//   BP_THEMES          danh sách cách nhau dấu phẩy: 'live' và/hoặc theme id preview (develop). Mặc định: live,$PREVIEW_THEME_ID
//   BP_PRODUCT, BP_COLLECTION, BP_BLOG, BP_ARTICLE, BP_PAGE  handle; thiếu thì dò (products.json, link bài đầu tiên của blog)
//   BP_RUNS            số lần đo mỗi URL (mặc định 1), BP_PAUSE_MS nghỉ giữa 2 lần đo (mặc định 5000)
//   BP_ISOLATE=1       đo thêm biến thể '-isolated': chặn request nền tảng Shopify (PLATFORM_BLOCK) để thấy trần điểm của riêng theme.
//                      Request bị chặn sinh log ERR_BLOCKED_BY_CLIENT; classify-bp.mjs xếp log đó vào nền tảng.
// Dùng: STORE_ORIGIN=... STORE_PASSWORD=... BP_THEMES=live,123456789 node drafts/qa/ES1-T277/tools/run-bp.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import lighthouse from 'lighthouse';
import desktopConfig from 'lighthouse/core/config/desktop-config.js';

const ALLOWED_ORIGIN = 'https://hoa-qua-nhap-khau.myshopify.com';
const origin = (process.env.STORE_ORIGIN || '').replace(/\/$/, '');
if (origin !== ALLOWED_ORIGIN) {
  console.error(`STORE_ORIGIN phải là ${ALLOWED_ORIGIN} (nhận: '${origin}')`);
  process.exit(2);
}
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'lhr');
const RUNS = Number(process.env.BP_RUNS || 1);
const PAUSE = Number(process.env.BP_PAUSE_MS || 5000);
const themes = (process.env.BP_THEMES || ['live', process.env.PREVIEW_THEME_ID].filter(Boolean).join(','))
  .split(',').map((s) => s.trim()).filter(Boolean);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// Script nền tảng Shopify (không phải asset theme). Không chặn /cdn-cgi/ (Cloudflare) để không bị thử thách lại.
const PLATFORM_BLOCK = ['*shop.app*', '*shopifysvc.com*', '*/cdn/shopifycloud/*', '*cdn.shopify.com/shopifycloud/*', '*/wpm@*',
  '*/cdn/wpm/*', '*web-pixel*', '*trekkie*', '*/api/collect*', '*otlp*', '*/checkouts/internal/preloads*', '*pay.shopify.com*'];
const variants = process.env.BP_ISOLATE === '1' ? ['', '-isolated'] : [''];

const withTheme = (path, theme) => {
  const u = new URL(path, origin);
  if (theme !== 'live') { u.searchParams.set('preview_theme_id', theme); u.searchParams.set('pb', '0'); }
  return u.toString();
};

async function unlock(page) {
  await page.goto(`${origin}/password`, { waitUntil: 'networkidle2' });
  const input = await page.$('form[action*="password"] input[type="password"]');
  if (input) {
    await input.type(process.env.STORE_PASSWORD || '');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
      page.$eval('form[action*="password"]', (f) => f.submit()),
    ]);
  }
  await page.goto(`${origin}/`, { waitUntil: 'domcontentloaded' });
  if (new URL(page.url()).pathname.startsWith('/password')) throw new Error('Không mở khoá được store dev: kiểm STORE_PASSWORD');
}

async function discover(page, theme) {
  const product = process.env.BP_PRODUCT || process.env.BENCH_PRODUCT || await page.evaluate(async () => {
    const r = await fetch('/products.json?limit=1'); return r.ok ? (await r.json()).products?.[0]?.handle : null;
  });
  const collection = process.env.BP_COLLECTION || process.env.BENCH_COLLECTION || 'all';
  const blog = process.env.BP_BLOG || 'news';
  let article = process.env.BP_ARTICLE;
  if (!article) {
    await page.goto(withTheme(`/blogs/${blog}`, theme), { waitUntil: 'domcontentloaded' });
    article = await page.evaluate((b) => {
      const a = [...document.querySelectorAll(`main a[href*="/blogs/${b}/"]`)].map((x) => new URL(x.href).pathname)
        .find((p) => p.split('/').filter(Boolean).length === 3 && !p.includes('/tagged/'));
      return a ? a.split('/').pop() : null;
    }, blog);
  }
  const pageHandle = process.env.BP_PAGE || 'contact';
  const pages = { home: '/', collection: `/collections/${collection}`, blog: `/blogs/${blog}`, page: `/pages/${pageHandle}` };
  if (product) pages.product = `/products/${product}`; else console.warn('Thiếu handle sản phẩm: đặt BP_PRODUCT');
  if (article) pages.article = `/blogs/${blog}/${article}`; else console.warn(`Không dò được bài viết của blog '${blog}': đặt BP_ARTICLE`);
  return pages;
}

mkdirSync(OUT, { recursive: true });
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
try {
  const page = await browser.newPage();
  await unlock(page);
  for (const theme of themes) {
    const pages = await discover(page, theme);
    console.log(`[${theme}] trang:`, pages);
    for (const formFactor of ['desktop', 'mobile']) {
      for (const [name, path] of Object.entries(pages)) {
        for (const variant of variants) for (let run = 1; run <= RUNS; run++) {
          const url = withTheme(path, theme);
          const flags = { output: 'json', logLevel: 'error', onlyCategories: ['best-practices'], disableStorageReset: true };
          if (variant) flags.blockedUrlPatterns = PLATFORM_BLOCK;
          const result = await lighthouse(url, flags, formFactor === 'desktop' ? desktopConfig : undefined, page);
          const lhr = result?.lhr;
          const file = join(OUT, `${theme}-${formFactor}-${name}${variant}${RUNS > 1 ? `-run${run}` : ''}.json`);
          writeFileSync(file, JSON.stringify(lhr));
          console.log(`${file}  bp=${lhr?.categories?.['best-practices']?.score}  status=${lhr?.runtimeError?.code || 'ok'}`);
          await sleep(PAUSE);
        }
      }
    }
  }
} finally {
  await browser.close();
}
