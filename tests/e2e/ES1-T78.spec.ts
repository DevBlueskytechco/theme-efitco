// KHÔNG CHẮC: chưa chạy cục bộ (không node_modules, npm bị chặn) → chờ CI. Chưa có handle cho TE4_PICKUP_HANDLE, TE4_TAX_INCLUDED_COUNTRY (hỏi CTO).
// Ticket ES1-T78: spec TE-4 lấy handle từ tests/e2e/store-data.json khi CI thiếu env TE4_*. Test cases: drafts/qa/ES1-T78/test-cases.md.
// Không mở trình duyệt: chỉ kiểm helper tests/e2e/support/store-data.ts và dữ liệu. Test hành vi nằm ở ES1-T62/T63/T64/T66.
import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { env } from './support/store-data';

const ROOT = process.cwd();
const DATA = JSON.parse(readFileSync(join(ROOT, 'tests/e2e/store-data.json'), 'utf8')) as Record<string, unknown>;
const SPECS = ['ES1-T62', 'ES1-T63', 'ES1-T64', 'ES1-T66'];
// Biến chưa có dữ liệu trên store dev (ticket ES1-T78 không cấp) → test liên quan skip có lý do.
const NO_DATA = new Set(['TE4_PICKUP_HANDLE', 'TE4_TAX_INCLUDED_COUNTRY']);
// Handle Shopify: chữ thường (gồm Unicode), số, gạch ngang; không khoảng trắng, không '/', '?', '#'.
const HANDLE = /^[\p{Ll}\p{Lo}\p{M}0-9]+(?:-[\p{Ll}\p{Lo}\p{M}0-9]+)*$/u;

function withEnv(vars: Record<string, string | undefined>, fn: () => void) {
  const saved: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(vars)) {
    saved[k] = process.env[k];
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  try {
    fn();
  } finally {
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
}

test.describe('ES1-T78 store-data', () => {
  test('S-01 mọi TE4_* spec TE-4 đọc đều có trong store-data.json (trừ biến chưa có dữ liệu)', () => {
    const read = new Set<string>();
    for (const s of SPECS) {
      const src = readFileSync(join(ROOT, `tests/e2e/${s}.spec.ts`), 'utf8');
      for (const m of src.matchAll(/env\(([^)]*)\)/g)) for (const n of m[1].matchAll(/'(TE4_[A-Z_]+)'/g)) read.add(n[1]);
    }
    expect(read.size).toBeGreaterThan(0);
    const missing = [...read].filter((n) => !NO_DATA.has(n) && typeof DATA[n] !== 'string');
    expect(missing, 'biến spec đọc nhưng store-data.json không có').toEqual([]);
  });

  test('S-02 spec TE-4 không còn đọc process.env.TE4_* trực tiếp', () => {
    for (const s of readdirSync(join(ROOT, 'tests/e2e')).filter((f) => SPECS.some((p) => f === `${p}.spec.ts`))) {
      const src = readFileSync(join(ROOT, 'tests/e2e', s), 'utf8');
      expect(src, s).not.toMatch(/process\.env(\.|\[['"])TE4_/);
    }
  });

  test('S-03 giá trị handle hợp lệ, không rỗng', () => {
    for (const [k, v] of Object.entries(DATA)) {
      if (!k.startsWith('TE4_') || !k.endsWith('_HANDLE')) continue;
      expect(typeof v, k).toBe('string');
      expect(v as string, k).toMatch(HANDLE);
    }
  });

  test('S-04 env không rỗng thắng store-data.json', () => {
    withEnv({ TE4_MEDIA_HANDLE: 'tu-env' }, () => expect(env('TE4_MEDIA_HANDLE')).toBe('tu-env'));
  });

  test('S-05 thiếu env hoặc env rỗng → lấy store-data.json', () => {
    withEnv({ TE4_MEDIA_HANDLE: undefined }, () => expect(env('TE4_MEDIA_HANDLE')).toBe(DATA.TE4_MEDIA_HANDLE));
    withEnv({ TE4_MEDIA_HANDLE: '' }, () => expect(env('TE4_MEDIA_HANDLE')).toBe(DATA.TE4_MEDIA_HANDLE));
    withEnv({ TE4_MEDIA_HANDLE: '  ' }, () => expect(env('TE4_MEDIA_HANDLE')).toBe(DATA.TE4_MEDIA_HANDLE));
  });

  test('S-06 không env, không dữ liệu → undefined (spec tự skip)', () => {
    withEnv({ TE4_KHONG_TON_TAI: undefined }, () => expect(env('TE4_KHONG_TON_TAI')).toBeUndefined());
  });

  test('S-07 nhiều tên: mọi env trước, rồi mới tới file (T66 OPTIONS → VARIANTS)', () => {
    withEnv({ TE4_OPTIONS_HANDLE: undefined, TE4_VARIANTS_HANDLE: 'env-variants' }, () =>
      expect(env('TE4_OPTIONS_HANDLE', 'TE4_VARIANTS_HANDLE')).toBe('env-variants')
    );
    withEnv({ TE4_OPTIONS_HANDLE: 'env-options', TE4_VARIANTS_HANDLE: 'env-variants' }, () =>
      expect(env('TE4_OPTIONS_HANDLE', 'TE4_VARIANTS_HANDLE')).toBe('env-options')
    );
    withEnv({ TE4_OPTIONS_HANDLE: undefined, TE4_VARIANTS_HANDLE: undefined }, () =>
      expect(env('TE4_OPTIONS_HANDLE', 'TE4_VARIANTS_HANDLE')).toBe(DATA.TE4_OPTIONS_HANDLE)
    );
  });

  test('S-08 handle Unicode: URL percent-encode rồi decode khớp lại path gốc (route matcher T66)', () => {
    const handle = String(DATA.TE4_OPTIONS_HANDLE);
    const path = `/products/${handle}`;
    const url = new URL(`${path}?variant=1`, 'https://hoa-qua-nhap-khau.myshopify.com');
    expect(url.pathname).not.toBe(path);
    expect(decodeURIComponent(url.pathname).endsWith(path)).toBe(true);
  });
});
