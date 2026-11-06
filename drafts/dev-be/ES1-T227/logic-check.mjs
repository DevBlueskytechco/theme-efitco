// ES1-T227: kiểm logic đọc của action-probe và total mới trong ES1-T203, không cần trình duyệt.
// Chạy: node --experimental-strip-types drafts/dev-be/ES1-T227/logic-check.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { countPaths, readCartAction, summarizeRead, tokenId } from '../../../tests/e2e/support/action-probe.ts';

class CartWithGetter {
  #q = 2;
  get totalQuantity() { return this.#q; }
  get lines() { return [{ id: 'a' }, { id: 'b' }]; }
  get broken() { throw new Error('x'); }
}

const set = (getCart) => { globalThis.window = { Shopify: { actions: { getCart } } }; };

// 1. Getter trên prototype: JSON clone mất field, probe vẫn thấy.
set(async () => new CartWithGetter());
let read = await readCartAction(['getCart']);
assert.equal(read.ctor, 'CartWithGetter');
assert.deepEqual(read.jsonKeys, []);
assert.ok(read.keys.includes('totalQuantity'));
assert.equal(summarizeRead(read).counts.totalQuantity, 2);
assert.equal(summarizeRead(read).counts['lines.$length'], 2);
assert.match(read.value.broken, /getter ném/);

// 2. Bọc trong { cart }, lines dạng connection.
set(async () => ({ cart: { totalQuantity: 2, lines: { nodes: [{ quantity: 2 }] }, id: 'gid://shopify/Cart/secret?key=k' } }));
read = await readCartAction(['getCart']);
assert.deepEqual(summarizeRead(read).counts, { 'cart.totalQuantity': 2, 'cart.lines.nodes.$length': 1, 'cart.lines.nodes.$first.quantity': 2 });

// 3. Dòng log không được chứa token giỏ.
assert.ok(!JSON.stringify(summarizeRead(read)).includes('secret'));

// 4. null, action ném lỗi, thiếu action.
set(async () => null);
assert.equal((await readCartAction(['getCart'])).type, 'null');
set(async () => { throw new Error('boom'); });
assert.match((await readCartAction(['getCart'])).threw, /boom/);
assert.match((await readCartAction(['openCart'])).threw, /không tồn tại/);

// 5. Tham chiếu vòng không treo, không ném.
const loop = { totalQuantity: 1 }; loop.self = loop;
set(async () => loop);
read = await readCartAction(['getCart']);
assert.equal(read.jsonKeys, null);
assert.equal(read.value.totalQuantity, 1);

// 6. Token cookie (có thể encode) và token Ajax so được theo id.
assert.equal(tokenId('abc%3Fkey%3Dk'), 'abc');
assert.equal(tokenId('abc?key=k'), 'abc');
assert.equal(tokenId(undefined), null);
assert.deepEqual(countPaths(null), {});

// 7. total mới trong ES1-T203: bản cũ cho 0 với shape lạ, bản mới phải ném.
const spec = readFileSync('tests/e2e/ES1-T203.spec.ts', 'utf8');
assert.ok(!spec.includes('cart?.totalQuantity ?? cart?.item_count ?? 0'), 'còn total cũ');
assert.ok(/if \(cart === null\) return 0;/.test(spec));
assert.ok(spec.includes("toBe(2);\n  });\n\n  test('TC-26") && spec.includes("'getCart trả giỏ mới').toBe(2)"), 'assert getCart sau updateCart phải giữ nguyên');

console.log('logic-check OK');
