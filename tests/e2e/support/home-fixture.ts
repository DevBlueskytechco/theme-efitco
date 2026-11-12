// ES1-T331 (TE-17-R2-QA0): đọc fixture nội dung Figma (tests/fixtures/home-figma.json) và nhận biết store dev đã áp fixture chưa.
// Spec đo AC-H1..H5, AC-H18, AC-H19, AC-H28 (TE-17-R2-QA1, QA2, ES1-T176) gọi skipUnlessFixture: chưa áp thì test.skip có lý do, không fail (skill playwright-theme).
// Nhận biết bằng text đã render ở server, không gọi JSON storefront (429, CONVENTION.md).
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test, type Page } from '@playwright/test';

export type Marker = { testid: string; text: string };
export type FixtureBlock = {
  scope: string;
  type: string;
  id: string | null;
  row: number;
  ac: string[];
  settings: Record<string, unknown>;
  template_params?: Record<string, unknown>;
  pending_settings?: Record<string, unknown>;
  markers?: Marker[];
};
export type HomeFixture = {
  ticket: string;
  store: string;
  storage: { status: string };
  blocks: FixtureBlock[];
  rows: Array<{ row: number; testid: string }>;
  fresh_install: { forbidden_text: string[]; forbidden_href: string[]; forbidden_testids_visible: string[] };
  store_data: { discounts: Array<{ title: string; min_quantity?: number; percent: number; scope?: string }> };
};

export const FIXTURE_PATH = resolve(__dirname, '../../fixtures/home-figma.json');
export const NOT_APPLIED = 'store dev chưa áp fixture nội dung Figma ES1-T331 (tests/fixtures/home-figma.json, drafts/qa/ES1-T331/content-fixture.md)';

export function loadHomeFixture(): HomeFixture {
  return JSON.parse(readFileSync(FIXTURE_PATH, 'utf8')) as HomeFixture;
}

export const allMarkers = (fixture: HomeFixture) => fixture.blocks.flatMap((block) => (block.markers ?? []).map((marker) => ({ ...marker, row: block.row, type: block.type, id: block.id })));

const squash = (value: string) => value.replace(/\s+/g, ' ').trim();

// Text đã chuẩn hoá khoảng trắng của mọi phần tử cùng testid trên trang hiện tại.
export async function textsByTestId(page: Page, testid: string): Promise<string[]> {
  const texts = await page.getByTestId(testid).allTextContents();
  return texts.map(squash);
}

// Marker thiếu trên trang đang mở; [] = đủ. So không phân biệt hoa thường vì AC-H2 so sau text-transform.
export async function missingMarkers(page: Page, markers: Marker[]): Promise<Marker[]> {
  const missing: Marker[] = [];
  for (const marker of markers) {
    const texts = await textsByTestId(page, marker.testid);
    if (!texts.some((text) => text.toLowerCase().includes(squash(marker.text).toLowerCase()))) missing.push(marker);
  }
  return missing;
}

// Marker nhận biết nhanh: eyebrow hero (hàng 2) và "360+" (hàng 15), đúng 2 chuỗi AC-H5 nêu tên.
export const SENTINELS: Marker[] = [
  { testid: 'slideshow-slide', text: 'Trusted by 10,000+ athletes' },
  { testid: 'faq-stat-1', text: '360+' },
];

export async function fixtureApplied(page: Page): Promise<boolean> {
  return (await missingMarkers(page, SENTINELS)).length === 0;
}

// Gọi sau khi đã mở `/`. Thiếu cả 2 marker nhận biết thì skip; thiếu 1 thì để test chạy và fail ở assertion (fixture áp dở).
export async function skipUnlessFixture(page: Page) {
  const missing = await missingMarkers(page, SENTINELS);
  test.skip(missing.length === SENTINELS.length, NOT_APPLIED);
}
