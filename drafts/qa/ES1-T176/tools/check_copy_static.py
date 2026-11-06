#!/usr/bin/env python3
"""Kiểm tĩnh, không cần store: mỗi dòng copy của bảng ES1-T173 có giá trị trong locales hoặc schema block chưa. In dòng chưa thấy để đọc tay."""
import glob, html, json, re
md = open('drafts/ba/ES1-T173/home-content.md', encoding='utf-8').read()
section = md[md.index('## 2. Bảng nội dung'):md.index('## 3. Dữ liệu store')]
loc = json.load(open('locales/en.default.json', encoding='utf-8'))
def flat(o):
    if isinstance(o, dict):
        for v in o.values():
            yield from flat(v)
    elif isinstance(o, str):
        yield o
def norm(s):
    s = html.unescape(re.sub(r'<[^>]+>', ' ', s))
    return re.sub(r'\s+', ' ', s).strip().lower()
corpus = [norm(s) for s in flat(loc)]
for f in glob.glob('blocks/*.liquid'):
    body = open(f, encoding='utf-8').read()
    corpus += [norm(json.loads('"' + m + '"')) for m in re.findall(r'"default"\s*:\s*"((?:[^"\\]|\\.)*)"', body)]
blob = '\n'.join(corpus)
row, total, missing = '', 0, []
for line in section.split('\n'):
    m = re.match(r'^### Hàng (\w+):', line)
    if m:
        row = m.group(1)
        continue
    if not line.startswith('|') or re.match(r'^\|\s*(Node|---)', line):
        continue
    cells = [c.strip() for c in line.split('|')[1:]]
    node, kind, value, key, note = (cells + [''] * 5)[:5]
    if kind != 'copy' or node == 'Không có node' or re.match(r'^\d sao$', value) or 'E9' in note:
        continue
    total += 1
    want = norm(value.replace('⏎', ' ').replace('[ảnh]', ' '))
    if want not in blob:
        missing.append((row, node, value[:70], key))
print('dong copy', total, 'chua thay', len(missing))
for item in missing:
    print(item)
