#!/usr/bin/env python3
"""Tỷ lệ pixel trong suốt của mỗi ảnh tham chiếu, màu góc, màu nền node gốc. Dùng để điền figma-rows.json."""
import glob, json, os
import numpy as np
from PIL import Image
for f in sorted(glob.glob('docs/figma/img/*.png')):
    if 'lowres' in f:
        continue
    a = np.array(Image.open(f).convert('RGBA'))
    al = a[..., 3]
    h, w = al.shape
    print(os.path.basename(f), w, h, 'trong_suot=%.1f%%' % (100 * (al == 0).mean()), 'mot_phan=%.1f%%' % (100 * ((al > 0) & (al < 255)).mean()),
          'goc', tuple(int(x) for x in a[0, 0]), 'giua_tren', tuple(int(x) for x in a[0, w // 2]))
d = json.load(open('docs/figma/snapshot-1-359.json'))
root = d['document']
def find(n, i):
    if n['id'] == i:
        return n
    for c in n.get('children', []):
        r = find(c, i)
        if r:
            return r
for i in ['1:359', '1:360', '1:452', '1:453', '1:490', '1:560', '1:625', '1:636', '1:817', '1:1022', '1:429', '1:431', '1:432', 'I1:433;377:1333', '1:424']:
    n = find(root, i)
    print(i, n['name'][:24], [(f.get('type'), f.get('color'), f.get('visible', True), f.get('gradientStops')) for f in n.get('fills', [])], n.get('background') and n['background'][:1])
