// Dò xem response 403 dạng nào của iframe làm Chrome log vị trí chrome-error://, và thứ tự response so với console. Không gọi store.
import { test } from '@playwright/test';

const FRAME = 'https://shop.app/pay/t171';
const VARIANTS: Record<string, { headers?: Record<string, string>; body: string }> = {
  empty: { body: '' },
  body: { headers: { 'content-type': 'text/html' }, body: '<h1>Forbidden</h1>' },
  xfo: { headers: { 'content-type': 'text/html', 'x-frame-options': 'DENY' }, body: '<h1>Forbidden</h1>' },
  csp: { headers: { 'content-type': 'text/html', 'content-security-policy': "frame-ancestors 'none'" }, body: '<h1>Forbidden</h1>' },
};

for (const [name, reply] of Object.entries(VARIANTS)) {
  test(`probe ${name}`, async ({ page }) => {
    const order: string[] = [];
    page.on('response', (r) => { if (r.url() === FRAME) order.push(`response ${r.status()}`); });
    page.on('console', (m) => { if (m.type() === 'error') order.push(`console ${m.text().slice(0, 70)} @ ${m.location().url}`); });
    await page.route('https://t171.invalid/', (r) => r.fulfill({ contentType: 'text/html', body: `<!doctype html><iframe src="${FRAME}"></iframe>` }));
    await page.route(FRAME, (r) => r.fulfill({ status: 403, ...reply }));
    await page.goto('https://t171.invalid/');
    await page.waitForTimeout(500);
    console.log(`[${name}]`, JSON.stringify(order));
  });
}
