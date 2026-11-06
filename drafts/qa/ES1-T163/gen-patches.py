#!/usr/bin/env python3
"""ES1-T163: sinh patch cho file QA không ghi trực tiếp được.
- ES1-T96/T97.spec.ts chỉ có trên nhánh PR #92, #93.
- scripts/e2e-429-count*.sh, CONVENTION.md bị scope-guard chặn.
Chạy từ gốc repo: python3 drafts/qa/ES1-T163/gen-patches.py
Script chỉ đọc git và ghi vào drafts/qa/ES1-T163/, không đổi nhánh, không sửa file đã track.
"""
import difflib
import pathlib
import subprocess
import sys

OUT = pathlib.Path("drafts/qa/ES1-T163")


def show(ref, path):
    return subprocess.run(["git", "show", f"{ref}:{path}"], check=True, capture_output=True, text=True).stdout


def replace(text, old, new, count=1):
    found = text.count(old)
    if found != count:
        sys.exit(f"Cần {count} chỗ, thấy {found}: {old[:70]}")
    return text.replace(old, new)


def diff(path, before, after):
    return "".join(difflib.unified_diff(before.splitlines(True), after.splitlines(True), f"a/{path}", f"b/{path}"))


IMPORT = "import { env } from './support/store-data';\n"

# ES1-T96
path96 = "tests/e2e/ES1-T96.spec.ts"
before = show("origin/feature/ai-ES1-T96", path96)
after = replace(before, IMPORT, IMPORT + "import { CART, CART_GLOB, cartApi } from './support/cart-api';\n")
after = replace(after, "    const res = await page.request.post('/cart/clear.js');\n    test.skip(res.status() === 429, 'Shopify trả 429 cho /cart/clear.js (giới hạn store dev)');\n", "    await cartApi(page, CART.clear);\n")
after = replace(after, "await page.route('**/cart/add.js', (route)", "await page.route(CART_GLOB.add, (route)")
(OUT / "ES1-T96.spec.patch").write_text(diff(path96, before, after))

# ES1-T97
path97 = "tests/e2e/ES1-T97.spec.ts"
before = show("origin/feature/ai-ES1-T97", path97)
after = replace(before, IMPORT, IMPORT + "import { CART, CART_GLOB, cartApi } from './support/cart-api';\n")
after = replace(after, "const CHANGE = '**/cart/change.js';", "const CHANGE = CART_GLOB.change;")
after = replace(after, "  const res = await page.request.post('/cart/add.js', { data: { items } });\n  test.skip(res.status() === 429, 'Shopify trả 429 cho /cart/add.js (giới hạn store dev)');\n  expect(res.ok(), `/cart/add.js trả ${res.status()}`).toBeTruthy();\n", "  const res = await cartApi(page, CART.add, { data: { items } });\n  expect(res.ok(), `${CART.add} trả ${res.status()}`).toBeTruthy();\n")
after = replace(after, "r.url().includes('/cart/change.js')", "r.url().includes(CART.change)", count=5)
after = replace(after, "/cart.js và /cart/change.js khác pathname", "/cart.js và cart/change.js khác pathname")
after = replace(after, "      const res = await page.request.post('/cart/clear.js');\n      test.skip(res.status() === 429, 'Shopify trả 429 cho /cart/clear.js (giới hạn store dev)');\n", "      await cartApi(page, CART.clear);\n")
(OUT / "ES1-T97.spec.patch").write_text(diff(path97, before, after))

# scripts + CONVENTION
parts = []
path = "scripts/e2e-429-count.sh"
before = show("HEAD", path)
after = replace(before, "# ES1-T100: đếm test skip do 429 trong log CI (dòng 'trả 429', support/product-data.ts in ra), theo job.\n", "# ES1-T100, ES1-T163: đếm trong log CI theo job (mỗi job e2e là 1 shard): số lần 429 của cartApi (dòng '[cartApi] 429 lần') và test skip do 429 (dòng 'trả 429', support/cart-api.ts và product-data.ts in ra).\n# 429 của fetch trong trang (pageJson) không có log nên không vào cột số lần; hết lượt thử vẫn vào cột skip.\n")
after = replace(after, """    /trả 429/ { n[$1]++; total++ }
    END {
      for (job in n) printf "| %s | %s | %d |\\n", run, job, n[job] | "sort"
      close("sort")
      printf "| %s | tổng | %d |\\n", run, total + 0
""", """    /\\[cartApi\\] 429 lần/ { hit[$1]++; jobs[$1] = 1; hits++ }
    /trả 429/ { skip[$1]++; jobs[$1] = 1; skips++ }
    END {
      for (job in jobs) printf "| %s | %s | %d | %d |\\n", run, job, hit[job], skip[job] | "sort"
      close("sort")
      printf "| %s | tổng | %d | %d |\\n", run, hits + 0, skips + 0
""")
after = replace(after, 'echo "| Run | Job | Số dòng trả 429 |"\necho "| --- | --- | --- |"\n', 'echo "| Run | Job | Số lần 429 (cartApi) | Test skip do 429 |"\necho "| --- | --- | --- | --- |"\n')
parts.append(diff(path, before, after))

path = "scripts/e2e-429-count.test.sh"
before = show("HEAD", path)
after = replace(before, "'| some.log | e2e-desktop-1 | 2 |'", "'| some.log | e2e-desktop-1 | 0 | 2 |'")
after = replace(after, "'| some.log | e2e-mobile-2 | 1 |'", "'| some.log | e2e-mobile-2 | 0 | 1 |'")
after = replace(after, "'| some.log | tổng | 3 |'", "'| some.log | tổng | 0 | 3 |'")
after = replace(after, "'| none.log | tổng | 0 |'", "'| none.log | tổng | 0 | 0 |'")
after = replace(after, "printf 'e2e-desktop-1\\tRun\\tok\\n' > \"$DIR/none.log\"\n", """# ES1-T163: 3 lần 429 rồi skip ở mobile-1; 1 lần 429 rồi thử lại được ở desktop-2 (có 429, không skip).
printf 'e2e-mobile-1\\tRun\\t[cartApi] 429 lần 1: /cart/clear.js Retry-After=2\\ne2e-mobile-1\\tRun\\t[cartApi] 429 lần 2: /cart/clear.js Retry-After=2\\ne2e-mobile-1\\tRun\\t[cartApi] 429 lần 3: /cart/clear.js Retry-After=2\\ne2e-mobile-1\\tRun\\t[cartApi] Shopify trả 429, skip: 429 sau 3 lần thử: /cart/clear.js\\ne2e-desktop-2\\tRun\\t[cartApi] 429 lần 1: /cart/add.js Retry-After=không có\\n' > "$DIR/cart.log"
OUT="$("$HERE/e2e-429-count.sh" --log "$DIR/cart.log")"
echo "$OUT" | grep -qF '| cart.log | e2e-mobile-1 | 3 | 1 |' || { echo "FAIL cartApi skip: $OUT"; exit 1; }
echo "$OUT" | grep -qF '| cart.log | e2e-desktop-2 | 1 | 0 |' || { echo "FAIL cartApi thử lại được: $OUT"; exit 1; }
echo "$OUT" | grep -qF '| cart.log | tổng | 4 | 1 |' || { echo "FAIL cartApi tổng: $OUT"; exit 1; }

printf 'e2e-desktop-1\\tRun\\tok\\n' > "$DIR/none.log"
""")
parts.append(diff(path, before, after))

path = "CONVENTION.md"
before = show("HEAD", path)
line = "store dev trả 429 cho request ngoài trình duyệt (ES1-T100).\n"
after = replace(before, line, line + "Gọi Cart API qua helper `cartApi` (`tests/e2e/support/cart-api.ts`), không request thẳng; đọc giỏ của trang đang mở vẫn dùng `readCartJson` (ES1-T163).\n")
parts.append(diff(path, before, after))
(OUT / "scripts-convention.patch").write_text("".join(parts))
print("OK")
