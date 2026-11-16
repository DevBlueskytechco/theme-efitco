// ES1-T470: partial quiz-results giả cho test máy trạng thái của assets/quiz-finder.js (đang tải, Back, double click; docs/srs.md#TE-11 AC2, AC3).
// Các test này kiểm JS, không kiểm dữ liệu store: response thật của store dev chung hay bị Cloudflare chặn (429, cf-mitigated) rồi theme đúng AC sang /search.
// Luồng thật với store vẫn ở tests/e2e/ES1-T139.spec.ts (AC3 aria-busy, đổi nhanh ở bước cuối, route.abort, 500).
// Định dạng theo @shopify/partial-rendering: partials.fetch thêm ?partials=<tên>, partials.apply lấy nội dung <template for="<tên>"> của response.
// Markup giữ hook của blocks/quiz.liquid; fixture kiểm hook còn trong liquid trước khi trả, liquid đổi thì fail ở đây.
import { expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const isQuizResults = (url: URL) => url.pathname.includes('/collections/') && url.searchParams.get('view') === 'quiz';

const HOOKS = [
  "{% partial 'quiz-results' %}",
  '<div class="quiz__results-body" data-quiz-count="{{ card_count }}" data-testid="quiz-results">',
  '<ul class="quiz__results-grid" role="list" data-testid="quiz-results-grid">',
  '<li class="quiz__results-item">',
];

export function quizResultsHtml(count: number) {
  const items = Array.from({ length: count }, (_, i) => `<li class="quiz__results-item"><a href="/products/es1-t470-${i + 1}">ES1-T470 ${i + 1}</a></li>`).join('');
  const grid = count > 0 ? `<ul class="quiz__results-grid" role="list" data-testid="quiz-results-grid">${items}</ul>` : '';
  return `<!doctype html><template for="quiz-results"><div class="quiz__results-body" data-quiz-count="${count}" data-testid="quiz-results">${grid}</div></template>`;
}

// Trả partial cho request kết quả có `tag` trong đường dẫn, 0 request tới store. Request vẫn đi qua page.route nên đếm, chờ được như request thật.
export async function fulfillQuizResults(page: Page, tag: string, count = 1) {
  const liquid = readFileSync(join(process.cwd(), 'blocks/quiz.liquid'), 'utf8');
  for (const hook of HOOKS) expect(liquid, `fixture partial lệch blocks/quiz.liquid, thiếu: ${hook}`).toContain(hook);
  await page.route(
    (url) => isQuizResults(url) && url.pathname.includes(tag),
    (route) => route.fulfill({ status: 200, contentType: 'text/html', body: quizResultsHtml(count) })
  );
}
