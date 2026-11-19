# ES1-T331: in setting (id, type, default) trong {% schema %} của block, phục vụ lập fixture nội dung Figma.
# Dùng: python3 -I drafts/qa/ES1-T331/tools/schema_dump.py <block> [<block> ...]  (chạy ở gốc repo)
import json
import os
import re
import sys

for name in sys.argv[1:]:
    path = f'blocks/{name}.liquid'
    if not os.path.exists(path):
        print('##', name, 'MISSING')
        continue
    src = open(path, encoding='utf-8').read()
    m = re.search(r'{%-?\s*schema\s*-?%}(.*?){%-?\s*endschema\s*-?%}', src, re.S)
    if not m:
        print('##', name, 'NO SCHEMA')
        continue
    schema = json.loads(m.group(1))
    print('##', name, '| blocks:', schema.get('blocks'))
    for setting in schema.get('settings', []):
        if 'id' in setting:
            print('  ', setting['id'], setting['type'], repr(setting.get('default'))[:60])
