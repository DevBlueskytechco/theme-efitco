#!/usr/bin/env python3
# ES1-T171: chèn watchShopPay403 vào console guard của các spec. Chạy 1 lần từ gốc repo; chạy lại không đổi gì.
import re
from pathlib import Path

SPECS = """ES1-T66 ES1-T67 ES1-T68 ES1-T69 ES1-T73 ES1-T81 ES1-T85 ES1-T87 ES1-T96 ES1-T97 ES1-T98
ES1-T108 ES1-T109 ES1-T118 ES1-T119 ES1-T120 ES1-T121 ES1-T137 ES1-T138 ES1-T147 ES1-T156 smoke TE-3""".split()

GUARD = re.compile(
    r"^(?P<i>[ \t]*)page\.on\('console', \(?(?P<v>m|msg)\)? => \{\n"
    r"(?P<check>[ \t]*if \((?P=v)\.type\(\) !== 'error'\) return;\n)",
    re.M,
)
IMPORT = "import { watchShopPay403 } from './support/console-guard';\n"


def patch(match):
    i, v, check = match['i'], match['v'], match['check']
    return (
        f"{i}const isShopPay403 = watchShopPay403(page);\n"
        f"{i}page.on('console', ({v}) => {{\n"
        f"{check}"
        f"{i}  if (isShopPay403({v})) return;\n"
    )


for name in SPECS:
    path = Path(f'tests/e2e/{name}.spec.ts')
    src = path.read_text()
    if 'watchShopPay403' in src:
        print(f'{name}: đã có')
        continue
    out, count = GUARD.subn(patch, src)
    if count != 1:
        raise SystemExit(f'{name}: khớp {count} guard, cần đúng 1')
    lines = out.splitlines(keepends=True)
    last = max(n for n, line in enumerate(lines) if re.match(r"import .*;\s*$|\} from '.*';\s*$", line))
    lines.insert(last + 1, IMPORT)
    path.write_text(''.join(lines))
    print(f'{name}: ok')
