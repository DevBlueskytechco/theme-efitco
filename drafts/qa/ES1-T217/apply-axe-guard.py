#!/usr/bin/env python3
"""ES1-T217: chèn expectNotChallenged(page) ngay trước mỗi new AxeBuilder trong spec. Chạy lại không đổi gì thêm."""
import glob
import re

CALL = "await expectNotChallenged(page);"
IMPORT = "import { expectNotChallenged } from './support/store-guard';"
STORE_GUARD = re.compile(r"^import \{ ([^}]*) \} from './support/store-guard';$", re.M)
AXE_IMPORT = re.compile(r"^import AxeBuilder from '@axe-core/playwright';$", re.M)

changed = 0
for path in sorted(glob.glob("tests/e2e/*.spec.ts")):
    source = open(path, encoding="utf-8").read()
    if "new AxeBuilder(" not in source:
        continue
    lines = source.split("\n")
    out = []
    for i, line in enumerate(lines):
        if "new AxeBuilder({ page })" in line and CALL not in (lines[i - 1] if i else ""):
            out.append(re.match(r"\s*", line).group(0) + CALL)
        out.append(line)
    updated = "\n".join(out)
    if "expectNotChallenged" not in STORE_GUARD.search(updated).group(1) if STORE_GUARD.search(updated) else True:
        match = STORE_GUARD.search(updated)
        if match:
            names = match.group(1) + ", expectNotChallenged"
            updated = updated[: match.start()] + f"import {{ {names} }} from './support/store-guard';" + updated[match.end() :]
        else:
            updated = AXE_IMPORT.sub(lambda m: m.group(0) + "\n" + IMPORT, updated, count=1)
    if updated != source:
        open(path, "w", encoding="utf-8").write(updated)
        changed += 1
        print(path)
print(f"đã đổi {changed} file")
