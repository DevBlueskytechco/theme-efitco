// ES1-T78: đọc dữ liệu store dev cho spec TE-4. Thứ tự: env (không rỗng) → tests/e2e/store-data.json → undefined (spec tự skip).
// Env rỗng ("") coi như thiếu: GitHub Actions truyền `${{ vars.X }}` chưa khai báo thành chuỗi rỗng, `??` sẽ chặn fallback.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const FILE = join(process.cwd(), 'tests/e2e/store-data.json');

let cache: Record<string, unknown> | undefined;
function data(): Record<string, unknown> {
  if (!cache) {
    try {
      cache = JSON.parse(readFileSync(FILE, 'utf8')) as Record<string, unknown>;
    } catch {
      cache = {};
    }
  }
  return cache;
}

const present = (v: unknown): v is string => typeof v === 'string' && v.trim() !== '';

/** Giá trị đầu tiên tìm thấy: mọi tên trong env trước, rồi mọi tên trong store-data.json. */
export function env(...names: string[]): string | undefined {
  for (const n of names) {
    const v = process.env[n];
    if (present(v)) return v.trim();
  }
  const d = data();
  for (const n of names) {
    const v = d[n];
    if (present(v)) return v.trim();
  }
  return undefined;
}
