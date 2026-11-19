// Lighthouse CI puppeteerScript: mở khoá trang password của store dev trước khi đo.
// Cookie giữ lại nhờ settings.disableStorageReset. URL đo đã kèm ?preview_theme_id=...&pb=0 (ẩn thanh preview).
// ES1-T446: trang password mới (ES1-T384, PR #208) bọc form trong <details> 'Enter Using Password' đóng sẵn;
// input trong <details> đóng không focus được nên type() không ghi gì. Mở mọi <details> tổ tiên trước khi điền.
// Trang password cũ (không có <details>) chạy như trước.
module.exports = async (browser) => {
  const origin = process.env.STORE_ORIGIN;
  const page = await browser.newPage();
  await page.goto(`${origin}/password`, { waitUntil: 'networkidle2' });
  const input = await page.$('input[type="password"]');
  if (input) {
    await input.evaluate((el) => {
      for (let d = el.closest('details'); d; d = d.parentElement && d.parentElement.closest('details')) {
        if (!d.open) {
          const summary = d.querySelector(':scope > summary');
          if (summary) summary.click();
          if (!d.open) d.open = true;
        }
      }
    });
    await input.type(process.env.STORE_PASSWORD || '');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
      input.evaluate((el) => (el.form || document.querySelector('form[action*="password"]')).submit()),
    ]);
    if (new URL(page.url()).pathname.startsWith('/password')) {
      await page.close();
      throw new Error('lhci-auth: vẫn ở /password sau khi gửi mật khẩu (sai STORE_PASSWORD hoặc form không gửi được)');
    }
  }
  await page.close();
};
