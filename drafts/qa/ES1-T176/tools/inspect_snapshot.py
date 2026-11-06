#!/usr/bin/env python3
"""Xem cây node Figma: python3 inspect_snapshot.py <node> [độ sâu]. Không có node thì in các node gốc và 17 ảnh tham chiếu."""
import json, struct, sys, zlib
SNAP = 'docs/figma/snapshot-1-359.json'
d = json.load(open(SNAP))
print('keys', list(d.keys())[:10])
if 'document' in d:
    r = d['document']
elif 'nodes' in d:
    r = list(d['nodes'].values())[0]['document']
else:
    r = d
idx = {}
def walk(n, vis=True, parent=None):
    v = vis and n.get('visible', True)
    idx[n['id']] = (n, v, parent)
    for c in n.get('children', []):
        walk(c, v, n['id'])
walk(r)
def box(n):
    b = n.get('absoluteBoundingBox') or {}
    return {k: round(b[k], 1) for k in b}
def dump(nid, depth=0, maxd=4):
    n, v, _ = idx[nid]
    s = n.get('style') or {}
    keep = ('fontFamily', 'fontWeight', 'fontSize', 'lineHeightPx', 'letterSpacing', 'textCase')
    fills = [(f.get('type'), f.get('color')) for f in n.get('fills', []) if f.get('visible', True)][:1]
    print('  ' * depth, nid, repr(n['name'])[:28], n['type'], 'V' if v else 'HIDDEN', box(n), repr(n.get('characters') or '')[:40],
          {k: s[k] for k in keep if k in s}, 'rad', n.get('cornerRadius'), fills, 'pad', n.get('paddingLeft'), n.get('paddingTop'), 'gap', n.get('itemSpacing'))
    if depth < maxd:
        for c in n.get('children', []):
            dump(c['id'], depth + 1, maxd)
if len(sys.argv) > 1:
    dump(sys.argv[1], 0, int(sys.argv[2]) if len(sys.argv) > 2 else 4)
else:
    print(r['id'], r['name'], box(r), len(idx))
    for c in r['children']:
        print(c['id'], c['name'], c['type'], c.get('visible', True), box(c))
    for nid in '1:362 1:422 1:437 1:395 1:453 1:454 1:464 1:490 1:506 1:560 1:625 1:636 1:759 1:817 1:885 1:992 1:1022 1:1057 1:1104'.split():
        n, v, p = idx.get(nid, (None, None, None))
        if n:
            print(nid, n['name'], n['type'], 'vis', v, 'parent', p, box(n))
        else:
            print(nid, 'MISSING')
