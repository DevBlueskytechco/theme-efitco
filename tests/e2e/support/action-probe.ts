// ES1-T227: đọc giá trị thật của Shopify.actions mà không giả định shape. Không import Playwright để kiểm được bằng node.

export type ActionRead = {
  type: string;
  ctor?: string;
  keys?: string[];
  // Key còn lại sau JSON.stringify: khác `keys` nghĩa là clone qua JSON làm mất field (getter trên prototype, không enumerable).
  jsonKeys?: string[] | null;
  threw?: string;
  // Bản sao thuần của giá trị; chỉ dùng để tính đường dẫn, không được in nguyên (có token giỏ).
  value?: unknown;
};

// Chạy trong trang: page.evaluate serialize hàm này, nên không dùng biến ngoài.
export async function readCartAction([name, payload]: [string, unknown?]): Promise<ActionRead> {
  const plain = (v: unknown, depth: number): unknown => {
    if (typeof v === 'function') return undefined;
    if (v === null || typeof v !== 'object') return v;
    if (depth > 5) return '[sâu quá]';
    if (Array.isArray(v)) return { $length: v.length, $first: plain(v[0], depth + 1) };
    const out: Record<string, unknown> = {};
    const names = new Set<string>();
    for (let o: object | null = v; o && o !== Object.prototype; o = Object.getPrototypeOf(o)) {
      for (const k of Object.getOwnPropertyNames(o)) if (k !== 'constructor') names.add(k);
    }
    for (const k of names) {
      try {
        out[k] = plain((v as Record<string, unknown>)[k], depth + 1);
      } catch (e) {
        out[k] = `[getter ném: ${String(e)}]`;
      }
    }
    return out;
  };
  try {
    const actions = (window as unknown as { Shopify?: { actions?: Record<string, (p?: unknown) => Promise<unknown>> } }).Shopify?.actions;
    if (!actions?.[name]) return { type: 'không có action', threw: `Shopify.actions.${name} không tồn tại` };
    const res = await (payload === undefined ? actions[name]() : actions[name](payload));
    if (res === null || typeof res !== 'object') return { type: res === null ? 'null' : typeof res, value: res };
    let jsonKeys: string[] | null = null;
    try {
      jsonKeys = Object.keys(JSON.parse(JSON.stringify(res)));
    } catch {
      jsonKeys = null;
    }
    const value = plain(res, 0) as Record<string, unknown>;
    return { type: 'object', ctor: (res as object).constructor?.name, keys: Object.keys(value), jsonKeys, value };
  } catch (e) {
    return { type: 'ném lỗi', threw: String(e).slice(0, 300) };
  }
}

// Mọi đường dẫn tới số có tên giống số lượng, kể cả độ dài mảng. Không in dữ liệu giỏ, chỉ in số.
export function countPaths(value: unknown, prefix = ''): Record<string, number> {
  const out: Record<string, number> = {};
  if (value === null || typeof value !== 'object') return out;
  for (const [k, v] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'number' && /quantity|count|\$length/i.test(k)) out[path] = v;
    Object.assign(out, countPaths(v, path));
  }
  return out;
}

// Phần được phép in của 1 lần đọc: bỏ value (có token giỏ).
export function summarizeRead(read: ActionRead) {
  const { value, ...rest } = read;
  return { ...rest, counts: countPaths(value) };
}

// Cookie và token Ajax có dạng <id>?key=<khoá>: chỉ so phần id, không in.
export const tokenId = (token: string | null | undefined) => (token ? decodeURIComponent(token).split('?')[0] : null);
