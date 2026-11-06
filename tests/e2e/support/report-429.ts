// ES1-T201: tổng kết 429 theo spec ở cuối mỗi shard. Worker ghi vào file, globalSetup trả teardown để in; không đổi config, store-tests.yml.
// Tiền tố [429-tong-ket] không khớp regex của scripts/e2e-429-count.sh nên không bị đếm trùng.
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// ES1-T203: 'challenge' = 1 test gặp trang thử thách Cloudflare. Cột chỉ in khi khác 0.
export type Kind429 = 'hit' | 'skip' | 'challenge';

// Spec kiểm helper bằng 429 giả: không tính vào tổng kết.
const SELF_TEST = /^ES1-T(100|163|171|201)\.spec\.ts$/;
const TE5 = /^ES1-T9[4-8]\.spec\.ts$/;

// Biến môi trường đặt trong globalSetup được worker kế thừa.
export function startLog429() {
  const file = join(tmpdir(), `efitco-e2e-429-${process.pid}.log`);
  writeFileSync(file, '');
  process.env.E2E_429_LOG = file;
}

export function record429(kind: Kind429, spec: string) {
  const file = process.env.E2E_429_LOG;
  if (!file || SELF_TEST.test(spec)) return;
  try {
    appendFileSync(file, `${kind}\t${spec}\n`);
  } catch {
    // Tổng kết là phụ, lỗi ghi không được làm hỏng test.
  }
}

export function summary429(log: string, ci = false): string[] {
  const specs = new Map<string, { hit: number; skip: number; challenge: number }>();
  for (const line of log.split('\n').filter(Boolean)) {
    const [kind, spec] = line.split('\t');
    const row = specs.get(spec) ?? { hit: 0, skip: 0, challenge: 0 };
    row[kind as Kind429]++;
    specs.set(spec, row);
  }
  if (!specs.size) return ['[429-tong-ket] không có 429'];
  const rows = [...specs].sort(([a], [b]) => a.localeCompare(b));
  const challenge = (n: number) => (n ? ` trang_thử_thách=${n}` : '');
  const lines = rows.map(([spec, r]) => `[429-tong-ket] ${spec} số_lần_429=${r.hit} test_skip=${r.skip}${challenge(r.challenge)}`);
  const total = (kind: Kind429) => rows.reduce((sum, [, r]) => sum + r[kind], 0);
  lines.push(`[429-tong-ket] tổng số_lần_429=${total('hit')} test_skip=${total('skip')}${challenge(total('challenge'))}`);
  // Test TE-5 skip không được im lặng: nổi lên thành annotation của job.
  if (ci) for (const [spec, r] of rows) if (TE5.test(spec) && r.skip) lines.push(`::warning title=429 skip TE-5::${spec} skip ${r.skip} test do 429`);
  return lines;
}

export function printSummary429() {
  const file = process.env.E2E_429_LOG;
  if (!file) return;
  let log = '';
  try {
    log = readFileSync(file, 'utf8');
  } catch {
    // Không có file: in như không có 429.
  }
  for (const line of summary429(log, !!process.env.CI)) console.log(line);
}
