import { printSummary429, startLog429 } from '../../../../tests/e2e/support/report-429';
// Cùng cách nối với tests/setup/password.ts, bỏ phần mở khoá store.
export default async () => {
  startLog429();
  return printSummary429;
};
