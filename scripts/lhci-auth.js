// Lighthouse CI puppeteerScript: mở khoá trang password của store dev trước khi đo.
// Cookie giữ lại nhờ settings.disableStorageReset. URL đo đã kèm ?preview_theme_id=...&pb=0 (ẩn thanh preview).
module.exports = async (browser) => {
  const origin = process.env.STORE_ORIGIN;
  const page = await browser.newPage();
  await page.goto(`${origin}/password`, { waitUntil: 'networkidle2' });
  const input = await page.$('input[type="password"]');
  if (input) {
    await input.type(process.env.STORE_PASSWORD || '');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
      page.$eval('form[action*="password"]', (f) => f.submit()),
    ]);
  }
  await page.close();
};
