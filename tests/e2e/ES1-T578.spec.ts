// KHÔNG CHẮC: spec chưa chạy (phiên viết không có trình duyệt, preview, node_modules) → chờ CI.
// Ticket ES1-T578 (gộp ES1-T552): chữ mặc định sentence case trong locales/en.default.json và schema default của blocks/.
// Nguồn: docs/design/content.md §2, §3, §8.1, §8.2. Drawer mini cart giữ "Cart" (CTO 23/11).
// Nhóm tĩnh đọc file trong repo, không gọi store. Nhóm storefront chạy trên PREVIEW_URL.
// AC5 (AGENTS.md) do người quản trị sửa (hook scope-guard chặn Dev FE): test.fixme tới khi AGENTS.md đổi.
// Chạy: PREVIEW_URL=... STORE_PASSWORD=... npx playwright test tests/e2e/ES1-T578.spec.ts
import { readFileSync, readdirSync } from 'node:fs';
import { test, expect } from './support/test';
import { gotoStore } from './support/store-guard';
import { env } from './support/store-data';
import { seedCart } from './support/cart-seed';

const read = (f: string) => readFileSync(f, 'utf8');
const desktopOnly = (name: string) => test.skip(name !== 'desktop', 'chạy 1 lần ở project desktop');
const TITLE_CASE = /\b[A-Z][a-z]+ [A-Z][a-z]+/;

type Tree = { [k: string]: string | Tree };
function flatten(o: Tree, prefix = ''): [string, string][] {
  return Object.entries(o).flatMap(([k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    return typeof v === 'string' ? [[key, v] as [string, string]] : flatten(v, key);
  });
}
const locale = Object.fromEntries(flatten(JSON.parse(read('locales/en.default.json'))));

test.describe('ES1-T578 tĩnh', () => {
  test.beforeEach(({}, ti) => desktopOnly(ti.project.name));

  test('AC1 regex Title Case chỉ còn hello_world.* và 4 khoá tên riêng', () => {
    const allowed = [
      'blocks.custom_liquid.placeholder',
      'gift_card.add_to_apple_wallet',
      'blocks.product_recommendations.placeholder_complementary',
      'page.empty_hint',
    ];
    const hits = Object.entries(locale)
      .filter(([k, v]) => !k.startsWith('hello_world.') && TITLE_CASE.test(v))
      .map(([k]) => k);
    expect(hits.sort()).toEqual([...allowed].sort());
  });

  test('AC1 khoá §8.1, §8.2 và ES1-T552 đúng giá trị mới', () => {
    const expected: Record<string, string> = {
      '404.heading': 'Page not found',
      '404.home': 'Back to homepage',
      'blocks.product_form.add_to_cart': 'Add to cart',
      'blocks.quiz.card_add': 'Add to cart: {{ title }}',
      'blocks.featured_product.view_detail': 'View details',
      'blocks.level_card.default_label': 'Level fitness',
      'blocks.level_card.products_count.other': '{{ count }} products',
      'blocks.bundle_builder.count_other': '%n items',
      'blocks.contact_aside.eyebrow': 'Questions and answers',
      'blocks.image_with_text.why_heading_html': 'Why choose<br> Efitco?',
      'blocks.slideshow_slide.default_heading_html': 'Level up<br> your fitness',
      'blog.comments_count.other': '{{ count }} comments',
      'cart.empty_heading': 'Your cart is empty',
      'cart.item_count_badge.one': '{{ count }} item',
      'cart.item_count_badge.other': '{{ count }} items',
      'cart.summary_title': 'Order summary',
      'cart.error': 'Check your connection, then try again.',
      'blocks.footer.newsletter_invalid': 'Enter an email like name@example.com.',
      'general.try_again': 'Try again',
      'search.no_results_title_html': 'Nothing matches “{{ terms }}” yet',
      // Giữ nguyên
      'cart.title': 'Cart',
      'cart.view_cart': 'View cart',
      'blocks.quiz.view_cart': 'View cart',
      'cart.checkout': 'Checkout',
      'search.clear_all': 'Clear all',
      'cart.added': 'Added to cart',
      // ES1-T579 (đã merge develop): dấu trừ U+2212
      'products.card.sale_percent': '\u2212{{ percent }}%',
      'cart.discount_value': '\u2212{{ amount }}',
    };
    for (const [k, v] of Object.entries(expected)) expect(locale[k], k).toBe(v);
    // Toast success ≤ 3 từ, ≤ 24 ký tự
    expect(locale['cart.added'].split(' ').length).toBeLessThanOrEqual(3);
    expect(locale['cart.added'].length).toBeLessThanOrEqual(24);
  });

  test('AC2 schema default trong blocks/ chỉ còn "Portable Fitness"', () => {
    const hits = readdirSync('blocks')
      .filter((f) => f.endsWith('.liquid'))
      .flatMap((f) => [...read(`blocks/${f}`).matchAll(/"default": "([^"]*)"/g)].map((m) => m[1]))
      .filter((v) => TITLE_CASE.test(v));
    expect(hits).toEqual(['Portable Fitness']);
    const rich = read('blocks/rich-text.liquid');
    expect(rich).toContain('"default": "Become a member"');
    expect(rich).toContain('"default": "to train."');
  });

  test.fixme('AC5 AGENTS.md không còn "Title Case" (người quản trị sửa, ngoài phạm vi Dev FE)', () => {
    expect(read('AGENTS.md')).not.toMatch(/title case/i);
  });
});

test.describe('ES1-T578 storefront', () => {
  test('AC3 AC4 404: h1 "Page not found", eyebrow và display vẫn HOA bằng CSS', async ({ page }) => {
    await gotoStore(page, '/pages/es1-t578-khong-co');
    const heading = page.getByTestId('not-found-heading');
    await expect(heading).toHaveText('Page not found');
    await expect(heading).toHaveCSS('text-transform', 'uppercase');
    await expect(page.getByTestId('not-found-eyebrow')).toHaveCSS('text-transform', 'uppercase');
    await expect(page.getByTestId('not-found').getByRole('link', { name: 'Back to homepage' })).toBeVisible();
  });

  test('AC3 trang giỏ rỗng: h2 "Your cart is empty"', async ({ page }) => {
    await gotoStore(page, '/cart');
    await expect(page.getByTestId('cart-empty-heading').first()).toHaveText('Your cart is empty');
  });

  test('AC3 tiêu đề drawer mini cart "Cart" (CTO 23/11)', async ({ page }) => {
    // Trang /cart không dựng drawer (cart-drawer.liquid: template cart hoặc cart_type page) → kiểm ở trang chủ.
    await gotoStore(page, '/');
    const heading = page.getByTestId('cart-drawer-heading');
    test.skip((await heading.count()) === 0, 'cart_type = page: store không dùng drawer');
    await expect(heading.first()).toHaveText('Cart');
  });

  test('AC3 PDP nút "Add to cart"', async ({ page }) => {
    const handle = env('TE1_PRODUCT_HANDLE');
    test.skip(!handle, 'thiếu TE1_PRODUCT_HANDLE (store-data)');
    await gotoStore(page, `/products/${handle}`);
    const add = page.getByTestId('product-form-add').first();
    test.skip(await add.isDisabled(), 'sản phẩm TE1_PRODUCT_HANDLE đang hết hàng');
    await expect(add.locator('.product-form__add-label')).toHaveText('Add to cart');
  });

  test('AC3 badge tóm tắt giỏ "4 items"', async ({ page }) => {
    const handle = env('TE1_PRODUCT_HANDLE');
    test.skip(!handle, 'thiếu TE1_PRODUCT_HANDLE (store-data)');
    await gotoStore(page, '/cart');
    await seedCart(page, handle!, [4], '_es1t578');
    await gotoStore(page, '/cart');
    await expect(page.getByTestId('cart-summary-count').first()).toHaveText('4 items');
  });
});
