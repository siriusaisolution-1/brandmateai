const express = require('express');
const puppeteer = require('puppeteer');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;

// Health check endpoint for Cloud Run readiness
app.get('/healthz', (req, res) => res.status(200).send('ok'));

// Middleware to verify Firebase ID token
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send('Unauthorized: No token provided');
  }
  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; // Pass user info to the main handler
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(403).send('Unauthorized: Invalid token');
  }
};

app.post('/scrape', verifyToken, async (req, res) => {
  const { url } = req.body;

  // --- Enhanced URL Validation (SSRF Protection) ---
  if (!url) {
    return res.status(400).send({ error: 'URL is required.' });
  }
  let urlObj;
  try {
    urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('Invalid protocol');
    }
  } catch (error) {
    return res.status(400).send({ error: 'Invalid URL provided.' });
  }
  // --- End of Validation ---

  let browser = null;
  try {
    browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage' // Recommended for Docker/Cloud Run
        ]
    });

    const page = await browser.newPage();
    await page.goto(urlObj.href, { waitUntil: 'networkidle2', timeout: 30000 });

    const logoUrl = await page.$eval('img[src*="logo"]', img => img.src).catch(() => null);
    
    const colors = await page.evaluate(() => {
        const colorSet = new Set();
        const nodes = Array.from(document.querySelectorAll('*')).slice(0, 3000); // Limit node processing
        for (const el of nodes) {
            const style = window.getComputedStyle(el);
            const color = style.getPropertyValue('color');
            const bgColor = style.getPropertyValue('background-color');
            if (color && color.startsWith('rgb')) colorSet.add(color);
            if (bgColor && bgColor.startsWith('rgb')) colorSet.add(bgColor);
            if (colorSet.size >= 25) break; // Exit early if we have enough colors
        }
        return Array.from(colorSet).slice(0, 5);
    });

    const textContent = await page.$eval('body', el => el.innerText.substring(0, 2000));
    
    res.status(200).send({ logoUrl, colors, textContent });

  } catch (error) {
    console.error('Scraping failed for URL:', url, 'Error:', error.stack || error);
    res.status(500).send({ error: 'Failed to scrape the website.' });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

app.listen(PORT, () => {
  console.log(`Scraper service listening on port ${PORT}`);
});
