import { test } from '@playwright/test';
import { record429 } from '../../../../tests/e2e/support/report-429';

test('worker ghi được vào log do globalSetup tạo', () => {
  record429('hit', 'ES1-T97.spec.ts');
  record429('skip', 'ES1-T97.spec.ts');
  record429('hit', 'TE-4.spec.ts');
});
