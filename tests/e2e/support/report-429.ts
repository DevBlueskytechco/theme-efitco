// ES1-T201: tổng kết 429 theo spec ở cuối mỗi shard. Worker ghi vào file, globalSetup trả teardown để in; không đổi config, store-tests.yml.
// Tiền tố [429-tong-ket] không khớp regex của scripts/e2e-429-count.sh nên không bị đếm trùng.
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// ES1-T203: 'challenge' = 1 test gặp trang thử thách Cloudflare. Cột chỉ in khi khác 0.
export type Kind429 = 'hit' | 'skip' | 'challenge';

// Spec kiểm helper bằng 429 hoặc trang thử thách giả: không tính vào tổng kết. ES1-T475: thêm T217 (setContent trang thử thách giả ở mọi desktop-1).
export const SELF_TEST = /^ES1-T(100|163|171|201|217)\.spec\.ts$/;
const TE5 = /^ES1-T9[4-8]\.spec\.ts$/;

// Biến môi trường đặt trong globalSetup được worker kế thừa.
export function startLog429() {
  const file = join(tmpdir(), `efitco-e2e-429-${process.pid}.log`);
  writeFileSync(file, '');
  writeFileSync(`${file}.req`, '');
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

// ES1-T475: số request mỗi spec gửi đi (support/store-noise.ts), để so trước/sau cùng mốc T149:570 và số test đỏ/skip, không chỉ đếm 429.
// Tiền tố [req-tong-ket] không khớp regex của scripts/e2e-429-count.sh. summary429 giữ nguyên output (ES1-T201 so khớp chính xác).
export const REQ_KINDS = ['doc', 'dyn', 'cdn', '3p', 'challenge', 'stubbed'] as const;
export type ReqKind = (typeof REQ_KINDS)[number];
export type ReqCounts = Record<ReqKind, number>;
export const emptyReqCounts = (): ReqCounts => ({ doc: 0, dyn: 0, cdn: 0, '3p': 0, challenge: 0, stubbed: 0 });

export function recordReq(spec: string, counts: ReqCounts) {
  const file = process.env.E2E_429_LOG;
  if (!file || SELF_TEST.test(spec) || REQ_KINDS.every((k) => !counts[k])) return;
  try {
    appendFileSync(`${file}.req`, `${spec}\t${REQ_KINDS.map((k) => counts[k]).join('\t')}\n`);
  } catch {
    // Tổng kết là phụ, lỗi ghi không được làm hỏng test.
  }
}

export function summaryReq(log: string): string[] {
  const specs = new Map<string, ReqCounts>();
  for (const line of log.split('\n').filter(Boolean)) {
    const [spec, ...values] = line.split('\t');
    const row = specs.get(spec) ?? emptyReqCounts();
    REQ_KINDS.forEach((k, i) => { row[k] += Number(values[i]) || 0; });
    specs.set(spec, row);
  }
  if (!specs.size) return [];
  const format = (r: ReqCounts) => REQ_KINDS.map((k) => `${k}=${r[k]}`).join(' ');
  const rows = [...specs].sort(([a], [b]) => a.localeCompare(b));
  const total = emptyReqCounts();
  for (const [, r] of rows) for (const k of REQ_KINDS) total[k] += r[k];
  return [...rows.map(([spec, r]) => `[req-tong-ket] ${spec} ${format(r)}`), `[req-tong-ket] tổng ${format(total)}`];
}

const readLog = (file: string) => {
  try {
    return readFileSync(file, 'utf8');
  } catch {
    return ''; // Không có file: in như không có 429, không in [req-tong-ket].
  }
};

export function printSummary429() {
  const file = process.env.E2E_429_LOG;
  if (!file) return;
  for (const line of summary429(readLog(file), !!process.env.CI)) console.log(line);
  for (const line of summaryReq(readLog(`${file}.req`))) console.log(line);
}
