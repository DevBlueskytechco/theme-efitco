#!/usr/bin/env node
// ES1-T176: xuất baseline so ảnh ra thư mục để xem bằng mắt. Spec tự dựng baseline lúc chạy, không cần lệnh này trên CI.
// Chạy từ gốc repo: node scripts/figma-baseline.js <thư mục ra> [mã hàng ...]
const { mkdirSync, writeFileSync } = require('node:fs');
const { join, resolve } = require('node:path');
const { buildBaseline, encodePng, loadRows } = require(resolve('tests/e2e/support/figma-baseline.cjs'));

const [out, ...ids] = process.argv.slice(2);
if (!out) {
  console.error('Thiếu thư mục ra: node scripts/figma-baseline.js <thư mục ra> [mã hàng ...]');
  process.exit(1);
}
mkdirSync(out, { recursive: true });
for (const row of loadRows().rows) {
  if (ids.length && !ids.includes(row.id)) continue;
  const image = buildBaseline(row);
  const file = join(out, `${row.snapshot}.png`);
  writeFileSync(file, encodePng(image));
  console.log(`${row.id}\t${row.node}\t${image.width}x${image.height}\tnền ${row.band}\t${file}`);
}
