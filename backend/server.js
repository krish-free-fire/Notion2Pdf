const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// ─── Health Check ───────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ─── Validate Notion URL ───────────────────────────────────────
function isValidNotionUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname === 'notion.so' ||
      parsed.hostname.endsWith('.notion.so') ||
      parsed.hostname === 'www.notion.so' ||
      parsed.hostname === 'notion.site' ||
      parsed.hostname.endsWith('.notion.site')
    );
  } catch {
    return false;
  }
}

// ─── Fetch & Parse Notion Content ──────────────────────────────
// (Using Puppeteer in the route to ensure JS renders the blocks)

function parseNotionHTML(html) {
  const $ = cheerio.load(html);
  const blocks = [];

  // Extract page title
  const title =
    $('title').text().replace(' | Notion', '').trim() || 'Untitled';
  blocks.push({ type: 'heading', level: 1, text: title });

  // Parse content blocks from the Notion page
  // Notion renders content inside divs with specific data attributes
  $('[data-block-id]').each((_, el) => {
    const $el = $(el);
    const text = $el.text().trim();
    if (!text) return;

    // Detect headings
    const h1 = $el.find('h1, [class*="header-block"]');
    const h2 = $el.find('h2, [class*="sub_header"]');
    const h3 = $el.find('h3, [class*="sub_sub_header"]');

    if (h1.length) {
      blocks.push({ type: 'heading', level: 1, text: h1.text().trim() });
      return;
    }
    if (h2.length) {
      blocks.push({ type: 'heading', level: 2, text: h2.text().trim() });
      return;
    }
    if (h3.length) {
      blocks.push({ type: 'heading', level: 3, text: h3.text().trim() });
      return;
    }

    // Detect lists
    const listItems = $el.find('li');
    if (listItems.length) {
      const items = [];
      listItems.each((_, li) => {
        const liText = $(li).text().trim();
        if (liText) items.push(liText);
      });
      if (items.length) {
        const isOrdered = $el.find('ol').length > 0;
        blocks.push({ type: 'list', ordered: isOrdered, items });
      }
      return;
    }

    // Detect images
    const img = $el.find('img[src]');
    if (img.length) {
      const src = img.attr('src');
      if (src && !src.includes('data:image/svg')) {
        blocks.push({ type: 'image', src });
      }
    }

    // Paragraph fallback
    if (text.length > 1) {
      blocks.push({ type: 'paragraph', text });
    }
  });

  // Fallback: if no data-block-id elements found, parse generically
  if (blocks.length <= 1) {
    $('h1, h2, h3, p, ul, ol, img').each((_, el) => {
      const $el = $(el);
      const tag = el.tagName.toLowerCase();

      if (tag === 'h1')
        blocks.push({ type: 'heading', level: 1, text: $el.text().trim() });
      else if (tag === 'h2')
        blocks.push({ type: 'heading', level: 2, text: $el.text().trim() });
      else if (tag === 'h3')
        blocks.push({ type: 'heading', level: 3, text: $el.text().trim() });
      else if (tag === 'p' && $el.text().trim())
        blocks.push({ type: 'paragraph', text: $el.text().trim() });
      else if (tag === 'ul' || tag === 'ol') {
        const items = [];
        $el.find('li').each((_, li) => {
          const t = $(li).text().trim();
          if (t) items.push(t);
        });
        if (items.length)
          blocks.push({ type: 'list', ordered: tag === 'ol', items });
      } else if (tag === 'img') {
        const src = $el.attr('src');
        if (src && !src.includes('data:image/svg'))
          blocks.push({ type: 'image', src });
      }
    });
  }

  return { title, blocks };
}

// ─── Build clean HTML for PDF ──────────────────────────────────
function buildPDFHtml(content) {
  const { blocks } = content;

  const renderBlock = (block) => {
    switch (block.type) {
      case 'heading':
        return `<h${block.level} class="heading-${block.level}">${escapeHtml(block.text)}</h${block.level}>`;
      case 'paragraph':
        return `<p class="body-text">${escapeHtml(block.text)}</p>`;
      case 'list': {
        const tag = block.ordered ? 'ol' : 'ul';
        const items = block.items
          .map((item) => `<li>${escapeHtml(item)}</li>`)
          .join('\n');
        return `<${tag} class="content-list">${items}</${tag}>`;
      }
      case 'image':
        return `<div class="image-container"><img src="${escapeHtml(block.src)}" alt="Content image" /></div>`;
      default:
        return '';
    }
  };

  const bodyContent = blocks.map(renderBlock).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

    *, *::before, *::after {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #0e0e0e;
      background: #ffffff;
      line-height: 1.6;
      font-size: 11pt;
      padding: 0;
    }

    .page-content {
      max-width: 100%;
      padding: 12px 0;
    }

    .heading-1 {
      font-size: 26pt;
      font-weight: 800;
      letter-spacing: -0.02em;
      line-height: 1.15;
      color: #0e0e0e;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 2px solid #e4e2e2;
    }

    .heading-2 {
      font-size: 18pt;
      font-weight: 700;
      letter-spacing: -0.01em;
      line-height: 1.25;
      color: #0e0e0e;
      margin-top: 28px;
      margin-bottom: 12px;
    }

    .heading-3 {
      font-size: 14pt;
      font-weight: 600;
      line-height: 1.3;
      color: #323233;
      margin-top: 20px;
      margin-bottom: 8px;
    }

    .body-text {
      font-size: 11pt;
      line-height: 1.7;
      color: #323233;
      margin-bottom: 12px;
    }

    .content-list {
      margin: 8px 0 16px 24px;
      font-size: 11pt;
      line-height: 1.7;
      color: #323233;
    }

    .content-list li {
      margin-bottom: 4px;
    }

    .image-container {
      margin: 16px 0;
      text-align: center;
    }

    .image-container img {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="page-content">
    ${bodyContent}
  </div>
</body>
</html>`;
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ─── Generate PDF Endpoint ─────────────────────────────────────
app.post('/generate-pdf', async (req, res) => {
  const { url } = req.body;

  // Validate input
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }
  if (!isValidNotionUrl(url)) {
    return res.status(400).json({ error: 'Invalid Notion link' });
  }

  let browser;
  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: 'new',
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath(),
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer'
      ],
    });

    const page = await browser.newPage();
    
    // 1. Fetch content by loading the page in Puppeteer (Notion is JS-heavy SPA)
    console.log(`Fetching Notion URL: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    // Wait for Notion's content blocks to render
    try {
      await page.waitForSelector('.notion-page-content, [data-block-id]', { timeout: 20000 });
    } catch(err) {
      // If we timeout, it might be a private page showing a login screen, or an empty page.
      const html = await page.content();
      if (html.includes('Log in') || html.includes('Continue with Google')) {
         throw new Error('Page is private. Please make sure the Notion page is published to the web.');
      }
    }

    const rawHtml = await page.content();

    // 2. Parse the rendered HTML
    const content = parseNotionHTML(rawHtml);
    if (!content.blocks || content.blocks.length === 0) {
      return res.status(400).json({ error: 'No recognizable content found. Ensure the page is public and not empty.' });
    }

    // 3. Build clean PDF HTML
    const pdfHtml = buildPDFHtml(content);

    // 4. Generate PDF using the same page instance
    await page.setContent(pdfHtml, { waitUntil: 'networkidle2', timeout: 60000 });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' },
    });

    // Create safe filename
    const safeName = content.title
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 64)
      .toLowerCase();

    const filename = `${safeName || 'notion-export'}.pdf`;

    // Send PDF
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error.message);

    const statusCode = error.message.includes('not public') ? 403 : 500;
    res.status(statusCode).json({
      error: error.message || 'Failed to generate PDF. Please try again.',
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

// ─── Start Server ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  ✦ Notion2PDF Backend running on http://localhost:${PORT}`);
  console.log(`  ✦ POST /generate-pdf — Convert a public Notion page`);
  console.log(`  ✦ GET  /health       — Health check\n`);
});
