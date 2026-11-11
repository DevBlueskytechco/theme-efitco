// ES1-T203: nhận biết store chặn, phân biệt với lỗi code. Trang thử thách Cloudflare → test fail với thông báo 'bị Cloudflare chặn', không skip.
// Không dựa vào script /cdn-cgi/challenge-platform: Cloudflare chèn script đó cả vào trang thường, chỉ title, phần tử thử thách hoặc header cf-mitigated mới là bị chặn.
// watchStore gộp console guard của T96, T97, T98 và luồng thật; ghi số 429, trang thử thách vào [429-tong-ket].
import { expect, test, type Page, type Request, type Response } from '@playwright/test';
import { basename } from 'node:path';
import { MAX_WAITS, retryDelayMs, skip429 } from './cart-api';
import { isCloudflareLog, watchShopPay403 } from './console-guard';
import { record429 } from './report-429';

const IGNORE_CONSOLE = /shopifycloud|monorail|web-pixels|trekkie|shop\.app|shopifysvc\.com|cdn\.shopify\.com\/s\/(trekkie|javascripts)|status of 429/i;
const NETWORK_LOG = /Failed to load resource/i;
const CHALLENGE_TITLE = /just a moment|attention required|verify(ing)? you are human|connection needs to be verified/i;
// orchestrate/chl_page chỉ có trên màn thử thách; scripts/jsd/main.js của trang thường không khớp.
const CHALLENGE_DOM = '#challenge-form, #challenge-stage, #cf-challenge-running, .cf-turnstile, iframe[src*="challenges.cloudflare.com"], script[src*="challenges.cloudflare.com/turnstile"], script[src*="/orchestrate/chl_page/"]';

export const CLOUDFLARE_BLOCKED = 'bị Cloudflare chặn';

const specName = () => basename(test.info().file);
const blockedError = (reason: string, url: string) => new Error(`${CLOUDFLARE_BLOCKED} (${reason}) tại ${url}. Store dev giới hạn phiên, không phải lỗi code: chờ hết chặn rồi chạy lại.`);

// Trả lý do nếu trang đang mở là màn thử thách, ngược lại null. Trang đang điều hướng thì evaluate lỗi, coi như chưa biết.
export async function challengeReason(page: Page): Promise<string | null> {
  return page
    .evaluate(({ dom, title }) => {
      if (new RegExp(title, 'i').test(document.title)) return `title "${document.title}"`;
      const el = document.querySelector(dom);
      return el ? `phần tử ${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}` : null;
    }, { dom: CHALLENGE_DOM, title: CHALLENGE_TITLE.source })
    .catch(() => null);
}

// Request refresh partial của store: cùng origin, cùng pathname với trang. Dịch vụ ngoài cũng có pathname `/` (error-analytics-sessions-production.shopifysvc.com, ES1-T224).
export function isStoreRefresh(requestUrl: string, pageUrl: string) {
  const request = new URL(requestUrl);
  const current = new URL(pageUrl);
  return request.origin === current.origin && request.pathname === current.pathname;
}

// ES1-T229: request lấy dữ liệu tab do theme gửi: cùng origin store, tới collections, products, partial hoặc section. Allowlist, nên analytics (otlp-http-production.shopifysvc.com, /api/collect, monorail), login_with_shop, challenges.cloudflare.com, /cdn-cgi không được tính.
const STORE_DATA_PATH = /^(?:\/[a-z]{2}(?:-[a-z]{2})?)?\/(?:collections|products)(?:[/.]|$)/i;
export function isTabDataRequest(requestUrl: string, pageUrl: string) {
  const request = new URL(requestUrl);
  if (request.origin !== new URL(pageUrl).origin) return false;
  return STORE_DATA_PATH.test(request.pathname) || request.searchParams.has('section_id') || request.searchParams.has('sections') || isStoreRefresh(requestUrl, pageUrl);
}

// Document của khung chính. Iframe (login_with_shop, Turnstile) cũng là navigation request nhưng không phải tải lại trang.
// request.frame() ném lỗi khi iframe chưa tạo xong (docs Playwright), trường hợp đó không phải khung chính.
function isMainDocument(request: Request, page: Page) {
  if (!request.isNavigationRequest()) return false;
  try {
    return request.frame() === page.mainFrame();
  } catch {
    return false;
  }
}

// Gọi trước lúc đổi tab. Trả danh sách lớn dần: request dữ liệu tab và lần tải lại trang.
export function watchTabDataRequests(page: Page): string[] {
  const requests: string[] = [];
  page.on('request', (r) => {
    if (isMainDocument(r, page)) requests.push(`document: ${r.url()}`);
    else if (['fetch', 'xhr'].includes(r.resourceType()) && isTabDataRequest(r.url(), page.url())) requests.push(r.url());
  });
  return requests;
}

export const isChallengeResponse = (res: Pick<Response, 'headers'>) => res.headers()['cf-mitigated'] === 'challenge';

// Trang đang mở là màn thử thách thì ném lỗi rõ ràng và tính vào tổng kết.
export async function expectNotChallenged(page: Page) {
  const reason = await challengeReason(page);
  if (!reason) return;
  record429('challenge', specName());
  throw blockedError(reason, page.url());
}

// Response thật của Cart API trong luồng thật: bị chặn thì nói rõ, không để thành assertion khó hiểu ở bước sau.
export function expectStoreAllowed(res: Pick<Response, 'headers' | 'status' | 'url'>) {
  if (isChallengeResponse(res)) {
    record429('challenge', specName());
    throw blockedError(`cf-mitigated, status ${res.status()}`, res.url());
  }
  if (res.status() === 429) throw new Error(`store trả 429 cho ${res.url()}: giới hạn store dev, không phải lỗi code`);
}

// ES1-T229: JSON lấy bằng APIRequestContext (support/http.ts) bị chặn thì nêu Cloudflare, không để thành 'trả 403'.
export function expectJsonAllowed(result: { challenged?: boolean; status: number }, url: string) {
  if (!result.challenged) return;
  record429('challenge', specName());
  throw blockedError(`cf-mitigated, status ${result.status}`, url);
}

// ES1-T229: sau page.reload(), page.goBack(): trang vừa mở bị chặn thì fail ngay, không chờ tới timeout. goBack từ bfcache trả null.
export async function expectLoaded(page: Page, res: Response | null) {
  if (res) expectStoreAllowed(res);
  await expectNotChallenged(page);
}

// ES1-T229: bấm link hoặc nút submit có điều hướng, gồm cả trang tắt JS. Chờ khung chính sang trang mới rồi kiểm bị chặn.
// Màn thử thách giữ nguyên URL, nên assert URL hay chờ phần tử sau đó không phân biệt được bị chặn với lỗi code.
// Trang checkout không phải storefront, có thể có script Turnstile thường: chỉ tin header, không xét DOM.
export async function clickAndLoad(page: Page, click: () => Promise<unknown>) {
  let blocked: Response | undefined;
  const onResponse = (res: Response) => {
    if (isMainDocument(res.request(), page) && (isChallengeResponse(res) || res.status() === 429)) blocked ??= res;
  };
  page.on('response', onResponse);
  try {
    await Promise.all([page.waitForEvent('framenavigated', { predicate: (f) => f === page.mainFrame(), timeout: 20_000 }), click()]);
    await page.waitForLoadState('domcontentloaded');
  } finally {
    page.off('response', onResponse);
  }
  if (blocked) expectStoreAllowed(blocked);
  if (!/\/checkouts?(\/|$)/.test(new URL(page.url()).pathname)) await expectNotChallenged(page);
}

// Mở trang thật. 429 chờ 2, 4, 8 s rồi thử lại, hết lượt thì fail nói rõ 429; không skip.
// waitUntil domcontentloaded: cho trang không cần đợi ảnh, ví dụ tắt JS thì Chromium tải ngay cả ảnh loading=lazy (ES1-T224 R5).
export async function gotoStore(page: Page, path: string, options: { waitUntil?: 'load' | 'domcontentloaded' } = {}): Promise<void> {
  const info = test.info();
  let waited = 0;
  for (let tries = 1; ; tries++) {
    const res = await page.goto(path, options);
    if (res && isChallengeResponse(res)) {
      record429('challenge', specName());
      throw blockedError(`cf-mitigated, status ${res.status()}`, res.url());
    }
    if (res?.status() !== 429) return expectNotChallenged(page);
    const delay = tries <= MAX_WAITS ? retryDelayMs(res.headers()['retry-after'], waited, tries) : 0;
    if (delay === 0) throw new Error(`store trả 429 cho trang ${path} sau ${tries} lần thử: giới hạn store dev, không phải lỗi code`);
    if (info.timeout > 0) info.setTimeout(info.timeout + delay);
    await new Promise((r) => setTimeout(r, delay));
    waited += delay;
  }
}

// ES1-T300 (CTO 11/11 mục 4): luồng thêm giỏ thật (POST /cart/add) mà store dev chặn (Cloudflare cf-mitigated hoặc 429 sau khi đã thử lại)
// thì skip có lý do, không fail gate. Chỉ dùng cho test được CTO cho phép (ES1-T156 nojs POST, ES1-T158 AC-H22; CTO 11/11 16:12: ES1-T95 :106 :138, ES1-T190 :216); test khác giữ quy tắc ES1-T203 (fail rõ).
// Skip ghi vào [429-tong-ket] (record429 'skip') và log [cartApi], nên không im lặng. Lỗi khác (assertion, timeout) ném lại nguyên vẹn.
export const isStoreBlockedError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes(CLOUDFLARE_BLOCKED) || /store trả 429/.test(message);
};

export async function skipIfStoreBlocked<T>(reason: string, flow: () => Promise<T>): Promise<T> {
  try {
    return await flow();
  } catch (error) {
    if (isStoreBlockedError(error)) skip429(`${reason}: ${(error as Error).message.split('\n')[0]}`);
    throw error;
  }
}

export type StoreWatch = {
  allowNetworkLog: () => void;
  // Gọi cuối test: bị chặn thì fail nêu Cloudflare trước, sau đó mới tới console error.
  finish: () => Promise<void>;
};

export function watchStore(page: Page): StoreWatch {
  const errors: string[] = [];
  let allowNetwork = false;
  let challenged: { reason: string; url: string } | undefined;
  const isShopPay403 = watchShopPay403(page);

  page.on('response', (res) => {
    if (res.status() === 429) record429('hit', specName());
    if (isChallengeResponse(res)) challenged ??= { reason: `cf-mitigated, status ${res.status()}`, url: res.url() };
  });
  page.on('console', (msg) => {
    if (msg.type() !== 'error' || isShopPay403(msg)) return;
    const text = msg.text();
    const source = msg.location().url;
    if (IGNORE_CONSOLE.test(text) || IGNORE_CONSOLE.test(source)) return;
    if (allowNetwork && NETWORK_LOG.test(text)) return;
    errors.push(`${text} @ ${source}`);
  });
  page.on('pageerror', (err) => {
    // Lỗi JS của script thử thách không phải lỗi theme.
    if (!isCloudflareLog({ text: () => err.stack ?? err.message, location: () => ({ url: '', lineNumber: 0, columnNumber: 0 }) })) errors.push(`pageerror: ${err.message}`);
  });

  return {
    allowNetworkLog: () => { allowNetwork = true; },
    finish: async () => {
      if (challenged) {
        record429('challenge', specName());
        throw blockedError(challenged.reason, challenged.url);
      }
      await expectNotChallenged(page);
      expect(errors, `console error:\n${errors.join('\n')}`).toEqual([]);
    },
  };
}
