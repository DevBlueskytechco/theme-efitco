#!/usr/bin/env python3
"""Rà spec: test nào mở trang chủ thật (/, không ?view=) mà khẳng định trống. In file:dòng để đọc tay, không tự kết luận."""
import glob, os, re
HOME = re.compile(r"""(goto|gotoStore)\((page,\s*)?(['"`]/['"`]|HOME\b|['"`]/\?(?!view)|ROOT\b)""")
EMPTY = re.compile(r"toHaveCount\(0\)|not\.toContain|not\.toBeVisible|toBeHidden|Add a |Customer name|placeholder|toHaveCount\(3\)")
TEST = re.compile(r"^\s*test(\.\w+)?\(\s*['\"`]")
total = 0
for f in sorted(glob.glob('tests/e2e/*.spec.ts')):
    lines = open(f, encoding='utf-8').read().split('\n')
    starts = [i for i, l in enumerate(lines) if TEST.match(l)] + [len(lines)]
    for a, b in zip(starts, starts[1:]):
        body = lines[a:b]
        if not any(HOME.search(l) for l in body):
            continue
        hits = [(a + j + 1, l.strip()) for j, l in enumerate(body) if EMPTY.search(l)]
        if hits:
            print('##', os.path.basename(f), a + 1, lines[a].strip()[:90])
            for n, l in hits:
                print('   ', n, l[:120])
                total += 1
print('tong dong can doc', total)
