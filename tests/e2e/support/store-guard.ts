// ES1-T203: nhận biết store chặn, phân biệt với lỗi code. Trang thử thách Cloudflare → test fail với thông báo 'bị Cloudflare chặn', không skip.
// Không dựa vào script /cdn-cgi/challenge-platform: Cloudflare chèn script đó cả vào trang thường, chỉ title, phần tử thử thách hoặc header cf-mitigated mới là bị chặn.
// watchStore gộp console guard của T96, T97, T98 và luồng thật; ghi số 429, trang thử thách vào [429-tong-ket].
import { expect, test, type Page, type Response } from '@playwright/test';
import { basename } from 'node:path';
import { MAX_WAITS, retryDelayMs } from './cart-api';
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
