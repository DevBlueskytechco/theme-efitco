'use strict';
// ES1-T176: tạo baseline so ảnh từ docs/figma/img, không dependency (plan ES1-T169 D3). Spec gọi trực tiếp, scripts/figma-baseline.js là CLI.
// Baseline dựng lúc chạy, không commit: ảnh gốc đã nằm trong repo, thêm bản ghép sẽ tăng khoảng 40 MB.
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const zlib = require('node:zlib');

const ROOT = resolve(__dirname, '../../..');
const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const CHANNELS = { 2: 3, 6: 4 };

// PNG 8 bit, RGB hoặc RGBA, không interlace: đủ cho ảnh Figma export và ảnh Chromium chụp. Trả về luôn là RGBA.
function decodePng(buffer) {
  if (!buffer.subarray(0, 8).equals(SIGNATURE)) throw new Error('Không phải PNG');
  let offset = 8;
  let width, height, depth, colorType, interlace;
  const parts = [];
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('latin1', offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      depth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === 'IDAT') parts.push(data);
    else if (type === 'IEND') break;
    offset += 12 + length;
  }
  const channels = CHANNELS[colorType];
  if (depth !== 8 || !channels || interlace !== 0) throw new Error(`PNG chưa hỗ trợ: depth ${depth}, colorType ${colorType}, interlace ${interlace}`);
  const raw = zlib.inflateSync(Buffer.concat(parts));
  const stride = width * channels;
  const rgba = Buffer.alloc(width * height * 4, 255);
  let previous = Buffer.alloc(stride);
  let current = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const start = y * (stride + 1);
    const filter = raw[start];
    for (let i = 0; i < stride; i++) {
      const value = raw[start + 1 + i];
      const left = i >= channels ? current[i - channels] : 0;
      const up = previous[i];
      let predict = 0;
      if (filter === 1) predict = left;
      else if (filter === 2) predict = up;
      else if (filter === 3) predict = (left + up) >> 1;
      else if (filter === 4) {
        const corner = i >= channels ? previous[i - channels] : 0;
        const p = left + up - corner;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - corner);
        predict = pa <= pb && pa <= pc ? left : pb <= pc ? up : corner;
      }
      current[i] = (value + predict) & 255;
    }
    for (let x = 0; x < width; x++) {
      const target = (y * width + x) * 4;
      const source = x * channels;
      rgba[target] = current[source];
      rgba[target + 1] = current[source + 1];
      rgba[target + 2] = current[source + 2];
      if (channels === 4) rgba[target + 3] = current[source + 3];
    }
    [previous, current] = [current, previous];
  }
  return { width, height, data: rgba };
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) c = CRC_TABLE[(c ^ byte) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function encodePng({ width, height, data }) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) data.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  return Buffer.concat([SIGNATURE, chunk('IHDR', header), chunk('IDAT', zlib.deflateSync(raw, { level: 6 })), chunk('IEND', Buffer.alloc(0))]);
}

function hexToRgb(hex) {
  const value = parseInt(hex.replace('#', ''), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function crop(image, { x, y, w, h }) {
  const data = Buffer.alloc(w * h * 4);
  for (let row = 0; row < h; row++) {
    const start = ((y + row) * image.width + x) * 4;
    image.data.copy(data, row * w * 4, start, start + w * 4);
  }
  return { width: w, height: h, data };
}

// Ghép lên màu nền band, alpha thành 255. Ảnh Figma nền trong suốt so thẳng sẽ lệch giả (D3).
function overBackground(image, hex) {
  const [r, g, b] = hexToRgb(hex);
  const data = Buffer.from(image.data);
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3] / 255;
    data[i] = Math.round(data[i] * alpha + r * (1 - alpha));
    data[i + 1] = Math.round(data[i + 1] * alpha + g * (1 - alpha));
    data[i + 2] = Math.round(data[i + 2] * alpha + b * (1 - alpha));
    data[i + 3] = 255;
  }
  return { ...image, data };
}

// Đưa ảnh về đúng kích thước, phần thiếu tô màu nền. Comparator báo "sizes differ" thay vì đếm pixel, nên cần cùng cỡ để có số đo.
function fitTo(image, width, height, hex) {
  const [r, g, b] = hexToRgb(hex);
  const data = Buffer.alloc(width * height * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    data[i + 3] = 255;
  }
  const rows = Math.min(height, image.height);
  const bytes = Math.min(width, image.width) * 4;
  for (let y = 0; y < rows; y++) image.data.copy(data, y * width * 4, y * image.width * 4, y * image.width * 4 + bytes);
  return { width, height, data };
}

// Che cùng 1 tập hình chữ nhật (pixel ảnh) trên mọi ảnh. Trả số pixel đã che, tính cả phần chồng nhau đúng 1 lần.
function applyMasks(images, rects, hex = '#ff00ff') {
  const [r, g, b] = hexToRgb(hex);
  const { width, height } = images[0];
  const covered = new Uint8Array(width * height);
  for (const rect of rects) {
    const left = Math.max(0, Math.floor(rect.x));
    const top = Math.max(0, Math.floor(rect.y));
    const right = Math.min(width, Math.ceil(rect.x + rect.w));
    const bottom = Math.min(height, Math.ceil(rect.y + rect.h));
    for (let y = top; y < bottom; y++) covered.fill(1, y * width + left, y * width + right);
  }
  let count = 0;
  for (let p = 0; p < covered.length; p++) {
    if (!covered[p]) continue;
    count++;
    for (const image of images) {
      image.data[p * 4] = r;
      image.data[p * 4 + 1] = g;
      image.data[p * 4 + 2] = b;
      image.data[p * 4 + 3] = 255;
    }
  }
  return count;
}

// Trung vị từng kênh trong 1 vùng, trả hex. Dùng làm nền thay ảnh khi ảnh bị che (Q3 chưa trả lời).
function medianColor(image, { x, y, w, h }) {
  const channels = [[], [], []];
  for (let row = y; row < y + h; row += 2) {
    for (let col = x; col < x + w; col += 2) {
      const i = (row * image.width + col) * 4;
      channels.forEach((list, c) => list.push(image.data[i + c]));
    }
  }
  const pick = (list) => list.sort((a, b) => a - b)[list.length >> 1];
  return `#${channels.map((list) => pick(list).toString(16).padStart(2, '0')).join('')}`;
}

const loadRows = () => JSON.parse(readFileSync(resolve(ROOT, 'tests/e2e/support/figma-rows.json'), 'utf8'));

// Ảnh tham chiếu của 1 hàng, đã cắt và ghép nền. Toạ độ cắt trong JSON là px CSS, ảnh export 2x.
function buildBaseline(row, scale = 2) {
  let image = decodePng(readFileSync(resolve(ROOT, 'docs/figma/img', row.src)));
  if (row.crop) image = crop(image, { x: row.crop.x * scale, y: row.crop.y * scale, w: row.crop.w * scale, h: row.crop.h * scale });
  return overBackground(image, row.band);
}

module.exports = { ROOT, applyMasks, buildBaseline, crop, decodePng, encodePng, fitTo, hexToRgb, loadRows, medianColor, overBackground };
