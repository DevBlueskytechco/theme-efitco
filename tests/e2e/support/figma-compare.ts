// ES1-T176: đọc snapshot Figma và bảng nội dung ES1-T173, so computed style với node. Thuần dữ liệu, không gọi store.

export type FigmaNode = {
  id: string;
  visible: boolean;
  box: { x: number; y: number; width: number; height: number };
  style: Record<string, number | string>;
  fill?: string;
  cornerRadius?: number;
  paddingLeft?: number;
  paddingTop?: number;
};
export type StyleSpec = { name: string; node: string; props: string[] };
export type ContentLine = { node: string; kind: string; value: string; note: string; expected: string };
type RawNode = {
  id: string;
  visible?: boolean;
  absoluteBoundingBox?: FigmaNode['box'];
  style?: FigmaNode['style'];
  fills?: Array<{ type: string; visible?: boolean; color?: { r: number; g: number; b: number } }>;
  cornerRadius?: number;
  paddingLeft?: number;
  paddingTop?: number;
  children?: RawNode[];
};

const channel = (value: number) => Math.round(value * 255);
const toHex = ({ r, g, b }: { r: number; g: number; b: number }) => `#${[r, g, b].map((v) => channel(v).toString(16).padStart(2, '0')).join('')}`;

// visible tính cả node cha: node ẩn hoặc nằm trong node ẩn thì không so (ES1-T168 1.3 #2).
export function snapshotIndex(snapshot: { document: RawNode }): Map<string, FigmaNode> {
  const index = new Map<string, FigmaNode>();
  const walk = (node: RawNode, parentVisible: boolean) => {
    const visible = parentVisible && node.visible !== false;
    const solid = (node.fills ?? []).find((fill) => fill.visible !== false && fill.type === 'SOLID' && fill.color);
    index.set(node.id, {
      id: node.id,
      visible,
      box: node.absoluteBoundingBox ?? { x: 0, y: 0, width: 0, height: 0 },
      style: node.style ?? {},
      fill: solid?.color ? toHex(solid.color) : undefined,
      cornerRadius: node.cornerRadius,
      paddingLeft: node.paddingLeft,
      paddingTop: node.paddingTop,
    });
    for (const child of node.children ?? []) walk(child, visible);
  };
  walk(snapshot.document, true);
  return index;
}

export function nodeBox(nodes: Map<string, FigmaNode>, id: string) {
  const node = nodes.get(id);
  if (!node) throw new Error(`Không có node ${id} trong snapshot`);
  return node.box;
}

export function gapBetween(nodes: Map<string, FigmaNode>, fromId: string, toId: string) {
  const from = nodeBox(nodes, fromId);
  return nodeBox(nodes, toId).y - (from.y + from.height);
}

const px = (value: string) => (value === 'normal' ? 0 : parseFloat(value));
const rgbToHex = (value: string) => {
  const match = /rgba?\(([^)]+)\)/.exec(value);
  if (!match) return value.toLowerCase();
  const parts = match[1].split(/[,\s/]+/).filter(Boolean).map(Number);
  if (parts.length > 3 && parts[3] === 0) return 'transparent';
  return `#${parts.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;
};
const firstFont = (value: string) => value.split(',')[0].replace(/["']/g, '').trim().toLowerCase();

type Exceptions = Record<string, unknown>;
const collect = (exceptions: Exceptions, field: 'colorMap' | 'fontMap') => {
  const merged: Record<string, string> = {};
  for (const entry of Object.values(exceptions)) {
    if (entry && typeof entry === 'object' && field in entry) Object.assign(merged, (entry as Record<string, Record<string, string>>)[field]);
  }
  return merged;
};

// Trả danh sách lệch. Số so sai số 0,01 px để bỏ làm tròn của trình duyệt; màu, font so đúng giá trị sau khi áp E1-E11. Không có ngưỡng nới: tiêu chí này CTO đã chốt không nới.
export function compareStyles(nodes: Map<string, FigmaNode>, spec: StyleSpec, computed: Record<string, string>, exceptions: Exceptions) {
  const node = nodes.get(spec.node);
  if (!node) throw new Error(`Không có node ${spec.node} trong snapshot`);
  const colors = collect(exceptions, 'colorMap');
  const fonts = collect(exceptions, 'fontMap');
  const diffs: string[] = [];
  const number = (prop: string, want: number | string | undefined) => {
    if (want === undefined) return diffs.push(`${prop}: node ${spec.node} không có giá trị`);
    const got = px(computed[prop]);
    if (Math.abs(got - Number(want)) > 0.01) diffs.push(`${prop}: ${computed[prop]} so với Figma ${want}`);
    return undefined;
  };
  for (const prop of spec.props) {
    if (prop === 'fontFamily') {
      const raw = String(node.style.fontFamily ?? '').toLowerCase();
      const want = fonts[raw] ?? raw;
      if (firstFont(computed.fontFamily) !== want) diffs.push(`fontFamily: ${computed.fontFamily} so với Figma ${want}`);
    } else if (prop === 'fontWeight') number(prop, node.style.fontWeight);
    else if (prop === 'fontSize') number(prop, node.style.fontSize);
    else if (prop === 'lineHeight') number(prop, node.style.lineHeightPx);
    else if (prop === 'letterSpacing') number(prop, node.style.letterSpacing ?? 0);
    else if (prop === 'textTransform') {
      const want = node.style.textCase === 'UPPER' ? 'uppercase' : 'none';
      if (computed.textTransform !== want) diffs.push(`textTransform: ${computed.textTransform} so với Figma ${want}`);
    } else if (prop === 'color' || prop === 'backgroundColor') {
      const raw = node.fill;
      const want = raw ? (colors[raw] ?? raw) : undefined;
      const got = rgbToHex(computed[prop]);
      if (got !== want) diffs.push(`${prop}: ${got} so với Figma ${want}`);
    } else if (prop === 'borderRadius') number(prop, node.cornerRadius);
    else if (prop === 'paddingLeft') number(prop, node.paddingLeft);
    else if (prop === 'paddingTop') number(prop, node.paddingTop);
    else if (prop === 'width') number(prop, node.box.width);
    else if (prop === 'height') number(prop, node.box.height);
    else diffs.push(`${prop}: spec chưa biết cách so`);
  }
  return diffs;
}

// Chuỗi mong đợi sau text-transform, đã bỏ khoảng trắng thừa (AC-H2). Cờ TT: Figma lưu thường, hiển thị hoa.
function expectedText(value: string, note: string) {
  const text = value.replace(/⏎/g, ' ').replace(/\[ảnh\]/g, ' ').replace(/\s+/g, ' ').trim();
  return /\bTT\b/.test(note) ? text.toUpperCase() : text;
}

// Đọc mục 2 của bảng ES1-T173. Bỏ dòng không có node trong Figma, số sao (không phải chuỗi), Verified (E9, mặc định tắt).
export function parseContent(markdown: string): Record<string, ContentLine[]> {
  const section = markdown.slice(markdown.indexOf('## 2. Bảng nội dung'), markdown.indexOf('## 3. Dữ liệu store'));
  const result: Record<string, ContentLine[]> = {};
  let row = '';
  for (const line of section.split('\n')) {
    const heading = /^### Hàng (\w+):/.exec(line);
    if (heading) {
      row = heading[1];
      result[row] = [];
      continue;
    }
    if (!row || !line.startsWith('|') || /^\|\s*(Node|---)/.test(line)) continue;
    const [node, kind, value, , note = ''] = line.split('|').slice(1).map((cell) => cell.trim());
    if (node === 'Không có node' || /^\d sao$/.test(value) || /\bE9\b/.test(note)) continue;
    result[row].push({ node, kind, value, note, expected: expectedText(value, note) });
  }
  return result;
}
