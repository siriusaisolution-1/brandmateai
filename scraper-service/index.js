const express = require('express');
const puppeteer = require('puppeteer-core');
const chromium = require('chrome-aws-lambda');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// IMPORTANT: Set up GOOGLE_APPLICATION_CREDENTIALS environment variable in Cloud Run
admin.initializeApp();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;

// Middleware to verify Firebase ID token
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send('Unauthorized: No token provided');
  }
  const idToken = authHeader.split('Bearer ')[1];
  try {
    await admin.auth().verifyIdToken(idToken);
    next();
  } catch (error) {
    res.status(403).send('Unauthorized: Invalid token');
  }
};

app.post('/scrape', verifyToken, async (req, res) => {
  const { url } = req.body;

  // Basic URL validation
  if (!url || !url.startsWith('http')) {
    return res.status(400).send({ error: 'A valid URL is required.' });
  }

  let browser = null;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    // --- Data Extraction Logic ---
    const logoUrl = await page.$eval('img[src*="logo"]', img => img.src).catch(() => null);
    
    const colors = await page.evaluate(() => {
        const colorSet = new Set();
        const styleSheets = Array.from(document.styleSheets);
        styleSheets.forEach(sheet => {
            try {
                const cssRules = Array.from(sheet.cssRules);
                cssRules.forEach(rule => {
                    if (rule.style) {
                        const color = rule.style.color;
                        if (color && color.startsWith('rgb')) colorSet.add(color);
                        const bgColor = rule.style.backgroundColor;
                        if (bgColor && bgColor.startsWith('rgb')) colorSet.add(bgColor);
                    }
                });
            } catch (e) {
                // Ignore CORS errors on stylesheets
            }
        });
        return Array.from(colorSet).slice(0, 5); // Return top 5 colors
    });

    const textContent = await page.$eval('body', el => el.innerText.substring(0, 2000));
    
    res.status(200).send({
      logoUrl,
      colors,
      textContent,
    });

  } catch (error) {
    console.error('Scraping failed:', error);
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
