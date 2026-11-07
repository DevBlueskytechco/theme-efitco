# ES1-T224: áp sửa spec một lần. Mỗi thay thế assert khớp, không khớp thì dừng trước khi ghi file đó.
import re

AXE_IMPORTS = """import AxeBuilder from '@axe-core/playwright';
import { expectNotChallenged } from './support/store-guard';
import { watchShopPay403 } from './support/console-guard';
"""
IGNORE = """const IGNORE_CONSOLE = [/shopifycloud|monorail|web-pixels|trekkie|shop\\.app|cdn\\.shopify\\.com\\/s\\/(trekkie|javascripts)/i];
"""
HELPERS = r"function watchConsole\(page: Page\) \{.*?\n\}\n\nasync function expectNoSeriousAxe\(page: Page\) \{.*?\n\}\n\n"


def load(path):
    return open(path, encoding='utf8').read()


def save(path, text):
    open(path, 'w', encoding='utf8').write(text)


def rep(text, old, new):
    assert old in text, old[:70]
    return text.replace(old, new, 1)


def resub(pattern, new, text):
    out, n = re.subn(pattern, lambda _: new, text, flags=re.S)
    assert n == 1, pattern[:70]
    return out


# store-guard
p = 'tests/e2e/support/store-guard.ts'
s = load(p)
s = rep(s, "export async function gotoStore(page: Page, path: string): Promise<void> {",
        "// waitUntil domcontentloaded: cho trang không cần đợi ảnh, ví dụ tắt JS thì Chromium tải ngay cả ảnh loading=lazy (ES1-T224 R5).\nexport async function gotoStore(page: Page, path: string, options: { waitUntil?: 'load' | 'domcontentloaded' } = {}): Promise<void> {")
s = rep(s, "const res = await page.goto(path);", "const res = await page.goto(path, options);")
s = rep(s, "export const isChallengeResponse =",
        """// Request refresh partial của store: cùng origin, cùng pathname với trang. Dịch vụ ngoài cũng có pathname `/` (error-analytics-sessions-production.shopifysvc.com, ES1-T224).
export function isStoreRefresh(requestUrl: string, pageUrl: string) {
  const request = new URL(requestUrl);
  const current = new URL(pageUrl);
  return request.origin === current.origin && request.pathname === current.pathname;
}

export const isChallengeResponse =""")
save(p, s)

# T203
p = 'tests/e2e/ES1-T203.spec.ts'
s = load(p)
s = rep(s, "gotoStore, watchStore, type StoreWatch", "gotoStore, isStoreRefresh, watchStore, type StoreWatch")
s = rep(s, "    const path = new URL(page.url()).pathname;\n    const seen: string[] = [];",
        "    const pageUrl = page.url();\n    const seen: string[] = [];")
s = rep(s, "new URL(r.url()).pathname === path) seen.push", "isStoreRefresh(r.url(), pageUrl)) seen.push")
s = rep(s, "    const path = new URL(page.url()).pathname;\n    const samePath = (url: URL) => url.pathname === path;",
        "    const pageUrl = page.url();\n    const samePath = (url: URL) => isStoreRefresh(url.href, pageUrl);")
save(p, s)

# product-data
p = 'tests/e2e/support/product-data.ts'
s = load(p)
s = rep(s, "import { record429 } from './report-429';", "import { record429 } from './report-429';\nimport { expectNotChallenged } from './store-guard';")
s = rep(s, "{ waitUntil: 'domcontentloaded' });\n    return await readCartJson<T>(helper);",
        "{ waitUntil: 'domcontentloaded' });\n    await expectNotChallenged(helper);\n    return await readCartJson<T>(helper);")
save(p, s)

# T188
p = 'tests/e2e/ES1-T188.spec.ts'
s = load(p)
s = rep(s, "import { expectNotChallenged } from './support/store-guard';",
        "import { expectNotChallenged } from './support/store-guard';\nimport { visibleImagesLoaded } from './support/page-ready';")
s = rep(s, "    await page.waitForLoadState('networkidle');\n    // Ảnh cũng có",
        """    // ES1-T224: networkidle không bao giờ tới vì video và Shop giữ kết nối. Chờ đúng 2 việc có thể làm tải ảnh tab ẩn: module nâng cấp, ảnh trong màn hình của tab đầu tải xong.
    await expect(blockOn(page).getByTestId(T.tab).first()).toHaveAttribute('aria-selected', 'true', { timeout: 15_000 });
    await expect.poll(() => visibleImagesLoaded(blockOn(page).getByTestId(T.panel).first()), { message: 'ảnh tab đầu chưa tải xong', timeout: 15_000 }).toBe(true);
    // Ảnh cũng có""")
save(p, s)

# T180
p = 'tests/e2e/ES1-T180.spec.ts'
s = load(p)
s = rep(s, AXE_IMPORTS, "import { gotoStore } from './support/store-guard';\n")
s = rep(s, IGNORE, "")
s = resub(HELPERS, "", s)
start = s.index("    await page.setViewportSize({ width: 1920, height: 1080 });\n    await page.goto(HOME);\n    const heading = tid(band(page, 'home-inspiration')")
end = s.index("    // Khoảng trắng sau br giữ")
s = s[:start] + """    await page.setViewportSize({ width: 1920, height: 1080 });
    // ES1-T224: gotoStore nêu rõ Cloudflare hoặc 429 thay vì timeout chờ heading. Đổi cỡ không tải lại: br chỉ phụ thuộc media query, ít hơn 1 lần tải trang; tràn ngang khi tải ở 360 đã có test `360: trang chủ không tràn ngang`.
    await gotoStore(page, HOME);
    const heading = tid(band(page, 'home-inspiration'), 'image-with-text-heading');
    await expect(heading, 'trang tải được nhưng thiếu heading hàng 8: lỗi block').toBeAttached({ timeout: 15_000 });
    expect(await heading.evaluate(breaks)).toEqual(['inline', 'inline']);
    // ES1-T217: font display swap, đếm dòng trước khi font về là đo trên font dự phòng.
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    const lines = await heading.evaluate((el) => Math.round(el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight)));
    expect(lines).toBe(3);

    await page.setViewportSize({ width: 360, height: 740 });
    expect(await heading.evaluate(breaks)).toEqual(['none', 'none']);
""" + s[end:]
s = resub(r"\n  test\('axe 0 serious, 0 console error trên / và /\?view=figma'.*?\n  \}\);\n\}\);\n",
          "\n  // Axe cả trang / và /?view=figma: gộp vào tests/e2e/ES1-T224.spec.ts, cùng DOM với T179, T182, bớt 4 lần tải trang.\n});\n", s)
save(p, s)

# T179
p = 'tests/e2e/ES1-T179.spec.ts'
s = load(p)
s = rep(s, AXE_IMPORTS, "")
s = rep(s, IGNORE, "")
s = resub(HELPERS, "", s)
s = rep(s, """    await page.keyboard.press('End');
    await expect.poll(() => list.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
""", """    // ES1-T224: Chromium không cuộn ngang bằng End, kể cả trên overflow-x không có CSS theme (repro R1, R3); End cuộn trang. Bàn phím cuộn ngang bằng mũi tên, nên đo mũi tên thật tới hết card 4.
    const pageY = await page.evaluate(() => window.scrollY);
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => list.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
    const lastCard = tid(scope, 'testimonial-item').last();
    await expect(async () => {
      await page.keyboard.press('ArrowRight');
      expect(await lastCard.evaluate((el) => el.getBoundingClientRect().right)).toBeLessThanOrEqual(page.viewportSize()!.width);
    }).toPass({ timeout: 15_000 });
    await expect(list).toBeFocused();
    expect(await page.evaluate(() => window.scrollY), 'mũi tên không cuộn trang').toBe(pageY);
""")
s = resub(r"\n  test\('axe 0 serious, 0 console error trên / và /\?view=figma'.*?\n  \}\);\n\}\);\n",
          "\n  // Axe cả trang / và /?view=figma: gộp vào tests/e2e/ES1-T224.spec.ts.\n});\n", s)
save(p, s)

# T182
p = 'tests/e2e/ES1-T182.spec.ts'
s = load(p)
s = rep(s, AXE_IMPORTS, "")
s = rep(s, IGNORE, "")
s = resub(HELPERS, "", s)
s = resub(r"\n  test\('axe 0 serious, 0 console error trên / và \?view=figma'.*?\n  \}\);\n\}\);\n",
          "\n  // Axe cả trang / và ?view=figma: gộp vào tests/e2e/ES1-T224.spec.ts.\n});\n", s)
save(p, s)

# T156
p = 'tests/e2e/ES1-T156.spec.ts'
s = load(p)
s = rep(s, "import { test, expect, type Locator, type Page } from '@playwright/test';",
        "import { test, expect, type Locator, type Page, type Response } from '@playwright/test';")
s = rep(s, "import { expectNotChallenged } from './support/store-guard';",
        "import { expectNotChallenged, expectStoreAllowed, gotoStore } from './support/store-guard';")
s = s[:s.index("  test('nojs select variant, form POST vào giỏ đúng variant'")] + """  test('nojs select variant, form POST vào giỏ đúng variant', async ({ page }) => {
    // ES1-T224: tắt JS thì ảnh lazy tải ngay, nên không chờ load của trang nhiều band (repro R5). Mỗi bước có timeout riêng để CI nêu đúng bước treo; POST bị chặn báo Cloudflare, không thành timeout.
    await gotoStore(page, TE13, { waitUntil: 'domcontentloaded' });
    const b = band(page, 'b');
    await expect(tid(b, 'product-variant-picker')).toBeHidden();
    const select = tid(b, 'product-variant-select');
    await expect(select).toBeVisible();
    const values = await select.locator('option:not([disabled])').evaluateAll((els) => els.map((el) => (el as HTMLOptionElement).value));
    test.skip(values.length < 2, 'TE4_VARIANTS_HANDLE cần từ 2 variant còn hàng');
    await select.selectOption(values[1]);
    const isCartAdd = (res: Response) => res.request().method() === 'POST' && new URL(res.url()).pathname.endsWith('/cart/add');
    const [post] = await Promise.all([
      page.waitForResponse(isCartAdd, { timeout: 15_000 }),
      tid(b, 'featured-product-add').click({ timeout: 10_000 }),
    ]);
    expectStoreAllowed(post);
    expect(post.status(), 'POST /cart/add').toBeLessThan(400);
    // Regex /\\/cart/ cũ khớp cả /cart/add, kể cả khi đang ở màn thử thách (repro R7).
    await page.waitForURL((url) => url.pathname.endsWith('/cart'), { waitUntil: 'domcontentloaded', timeout: 15_000 });
    await expectNotChallenged(page);
    const cart = await readCartNoScript<{ items: { variant_id: number }[] }>(page);
    expect(cart.items.map((i) => String(i.variant_id))).toEqual([values[1]]);
  });
});
"""
save(p, s)
print('ok')
