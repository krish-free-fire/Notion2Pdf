const puppeteer = require('puppeteer');
async function run() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto('https://www.notion.so/Notion-Official-83715d7703ee4b8699b5e659a4712dd8', { waitUntil: 'networkidle0' });
  const html = await page.content();
  console.log("HTML length:", html.length);
  const dataBlockIds = await page.$$eval('[data-block-id]', els => els.length);
  console.log("Found data-block-ids:", dataBlockIds);
  await browser.close();
}
run().catch(console.error);
