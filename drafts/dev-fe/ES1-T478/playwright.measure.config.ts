// Chỉ để đo bảng gzip cho PR body ES1-T478 tại máy dev (không store, không globalSetup).
import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir: '.', testMatch: 'measure.spec.ts', reporter: 'list' });
