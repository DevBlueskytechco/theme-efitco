const z = require('zlib');
const fs = require('fs');
const cp = require('child_process');
const files = ['base', 'quiz', 'shop-the-look', 'bundle-builder', 'featured-product', 'image-with-text', 'collection', 'critical'];
for (const n of files) {
  const b = fs.readFileSync('assets/' + n + '.css');
  let d = null;
  try {
    d = cp.execFileSync('git', ['show', 'origin/develop:assets/' + n + '.css'], { stdio: ['ignore', 'pipe', 'ignore'] });
  } catch (e) {}
  console.log(n, 'now', b.length, z.gzipSync(b).length, 'dev', d ? d.length : '-', d ? z.gzipSync(d).length : '-');
}
