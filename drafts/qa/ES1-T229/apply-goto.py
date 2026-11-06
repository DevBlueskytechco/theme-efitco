# ES1-T229: đổi các page.goto còn lại của T94, T95 sang gotoStore. Chỉ đổi đúng dạng "await page.goto(", in số dòng đã đổi.
import re

for path in ["tests/e2e/ES1-T94.spec.ts", "tests/e2e/ES1-T95.spec.ts"]:
    with open(path, encoding="utf-8") as f:
        text = f.read()
    text, count = re.subn(r"await page\.goto\(", "await gotoStore(page, ", text)
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)
    print(path, count)
