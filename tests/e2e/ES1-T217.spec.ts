// ES1-T217: giữ chặt các chỗ test vừa sửa để chúng không thành kẽ hở. Không gọi store.
// Chạy: npx playwright test --config=drafts/qa/ES1-T217/pw.static.config.ts tests/e2e/ES1-T217.spec.ts
import { test, expect, type ConsoleMessage } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readdirSync, readFileSync } from 'node:fs';
import { isResource429Log, watchShopPay403 } from './support/console-guard';
import { CLOUDFLARE_BLOCKED, expectNotChallenged } from './support/store-guard';

const log = (type: string, text: string, url = 'https://store.test/assets/a.js') =>
  ({ type: () => type, text: () => text, location: () => ({ url, lineNumber: 0, columnNumber: 0 }) }) as unknown as ConsoleMessage;
const LOG_429 = 'Failed to load resource: the server responded with a status of 429 ()';

test.describe('ES1-T217 tĩnh', () => {
  test.beforeEach(({}, ti) => { test.skip(ti.project.name !== 'desktop', 'tĩnh, chạy 1 lần'); });

  test('TC-01 bộ lọc bỏ đúng log tài nguyên 429', () => {
    const guard = watchShopPay403({ on: () => {} } as never);
    expect(isResource429Log(log('error', LOG_429))).toBe(true);
    expect(guard(log('error', LOG_429))).toBe(true);
  });

  test('TC-02 bộ lọc giữ mọi lỗi khác: status khác, lỗi JS nhắc 429, không phải type error', () => {
    const guard = watchShopPay403({ on: () => {} } as never);
    for (const message of [
      log('error', 'Failed to load resource: the server responded with a status of 500 ()'),
      log('error', 'Failed to load resource: the server responded with a status of 404 ()'),
      log('error', 'Failed to load resource: the server responded with a status of 4290 ()'),
      log('error', 'Uncaught Error: cart returned status of 429'),
      log('warning', LOG_429),
    ]) expect(guard(message), message.text()).toBe(false);
  });

  test('TC-03 mọi spec có AxeBuilder đều kiểm màn thử thách ngay trước khi quét', () => {
    const missing: string[] = [];
    for (const file of readdirSync('tests/e2e').filter((f) => f.endsWith('.spec.ts') && f !== 'ES1-T217.spec.ts')) {
      readFileSync(`tests/e2e/${file}`, 'utf8').split('\n').forEach((line, i, lines) => {
        if (line.includes('new AxeBuilder({ page })') && !lines[i - 1].includes('await expectNotChallenged(page);')) missing.push(`${file}:${i + 1}`);
      });
    }
    expect(missing).toEqual([]);
  });

  test('TC-04 toàn base.css: 0 màu literal ngoài comment, bù cho việc T94, T95, T184, T186 chỉ quét mục của mình', () => {
    const css = readFileSync('assets/base.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    expect(css.match(/#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(/gi)).toBeNull();
  });

  test('TC-05 toàn base.css: 0 margin, padding vật lý ngoài comment', () => {
    const css = readFileSync('assets/base.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    expect(css.match(/(^|[\s;{])(margin|padding)-(left|right|top|bottom)\s*:/g)).toBeNull();
  });

  test('TC-06 mốc cắt của T94, T95, T184, T186 có trong base.css, đúng thứ tự', () => {
    const css = readFileSync('assets/base.css', 'utf8');
    const at = (mark: string) => css.indexOf(mark);
    const order = ['/** Cart (TE-5', '/** Cart drawer (TE-5', '/** Image with text (TE-7', '/** Collection list (TE-15', '/** Shop by level (TE-15', '/** Blog posts (TE-16'].map(at);
    expect(order.every((position) => position > 0)).toBe(true);
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });
});

test.describe('ES1-T217 axe', () => {
  test.beforeEach(({}, ti) => { test.skip(ti.project.name !== 'desktop', 'không cần store, chạy 1 lần'); });

  test('TC-07 meta refresh trên trang thường: không bị coi là thử thách, axe vẫn báo', async ({ page }) => {
    await page.setContent('<!doctype html><html lang="en"><head><title>Home</title><meta http-equiv="refresh" content="5"></head><body><main><h1>Home</h1></main></body></html>');
    await expectNotChallenged(page);
    const { violations } = await new AxeBuilder({ page }).analyze();
    expect(violations.map((v) => v.id)).toContain('meta-refresh');
  });

  test('TC-08 màn thử thách: test báo Cloudflare, không báo vi phạm axe', async ({ page }) => {
    await page.setContent('<!doctype html><html lang="en"><head><title>Just a moment...</title><meta http-equiv="refresh" content="360"></head><body><div id="challenge-stage"></div></body></html>');
    await expect(expectNotChallenged(page)).rejects.toThrow(CLOUDFLARE_BLOCKED);
  });
});
