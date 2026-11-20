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

// Marker nhận biết nhanh: chỉ marker cần setting tài nguyên của fixture (product hàng 10, collection hàng 4).
// ES1-T405 (ADR 0011): index.liquid bỏ handle figma-*/all_products, nên 2 chuỗi AC-H5 ("Trusted by 10,000+ athletes", "360+")
// vẫn ra từ locale default (tới TS-FE4 ES1-T406) dù store chưa áp fixture → không dùng để nhận biết. AC-H5 vẫn kiểm qua allMarkers.
export const SENTINELS: Marker[] = [
  { testid: 'featured-product-title', text: 'Ativafit Lava 66 lb Adjustable' },
  { testid: 'level-card-count', text: '24 Products' },
];

export async function fixtureApplied(page: Page): Promise<boolean> {
  return (await missingMarkers(page, SENTINELS)).length === 0;
}

// Gọi sau khi đã mở `/`. Thiếu cả 2 marker nhận biết thì skip; thiếu 1 thì để test chạy và fail ở assertion (fixture áp dở).
// ES1-T402 (ADR 0011 mục 3): chữ footer (mô tả, heading, text newsletter, trust, nhãn nút) là setting block footer trong layout, default rỗng,
// rỗng thì ẩn, nút dùng locale. preview-push không áp setting layout:theme (ES1-T428/ES1-T177), sentinel ở / không chứng minh phần này.
export const FOOTER_PENDING = 'setting footer (layout:theme) chưa áp trên preview: chữ footer default rỗng nên ẩn, nút dùng locale (ES1-T402, ES1-T428/ES1-T177)';
export const FOOTER_SETTING_TESTIDS = ['footer-description', 'footer-newsletter-heading', 'footer-newsletter-text', 'footer-trust-item'] as const;
export const FOOTER_SUBMIT_DEFAULT: string = JSON.parse(readFileSync(resolve(__dirname, '../../../locales/en.default.json'), 'utf8')).blocks.footer.newsletter_submit;

// Có ít nhất 1 phần tử chỉ render từ setting footer = setting footer đã áp.
export async function footerSettingsApplied(page: Page): Promise<boolean> {
  const footer = page.getByTestId('footer');
  for (const id of FOOTER_SETTING_TESTIDS) if ((await footer.getByTestId(id).count()) > 0) return true;
  return false;
}

// Marker cần có trên trang: setting footer chưa áp thì nút footer phải là nhãn locale (không bỏ marker), ghi annotation.
export async function expectedMarkers(page: Page, fixture: HomeFixture): Promise<Marker[]> {
  const markers = allMarkers(fixture);
  if (await footerSettingsApplied(page)) return markers;
  test.info().annotations.push({ type: 'footer-fixture-pending', description: FOOTER_PENDING });
  return markers.map((marker) => (marker.type === 'footer' && marker.testid === 'footer-newsletter-submit' ? { ...marker, text: FOOTER_SUBMIT_DEFAULT } : marker));
}

export async function skipUnlessFixture(page: Page) {
  const missing = await missingMarkers(page, SENTINELS);
  test.skip(missing.length === SENTINELS.length, NOT_APPLIED);
}
