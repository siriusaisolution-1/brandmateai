const express = require('express');
const puppeteer = require('puppeteer');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();
const cacheCollection = db.collection('scrapedCache');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;

app.get('/healthz', (req, res) => res.status(200).send('ok'));

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send('Unauthorized: No token provided');
  }
  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(403).send('Unauthorized: Invalid token');
  }
};

app.post('/scrape', verifyToken, async (req, res) => {
  const { url } = req.body;

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

  const cacheKey = Buffer.from(urlObj.href).toString('base64');
  const cacheRef = cacheCollection.doc(cacheKey);

  try {
    // 1. Check for a valid cache entry
    const doc = await cacheRef.get();
    if (doc.exists) {
      const data = doc.data();
      const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
      if (data.timestamp > twentyFourHoursAgo) {
        console.log('Returning cached result for URL:', url);
        return res.status(200).send(data.payload);
      }
    }

    // 2. If no cache, perform the scrape
    console.log('No valid cache found. Scraping URL:', url);
    let browser = null;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });

      const page = await browser.newPage();
      await page.goto(urlObj.href, { waitUntil: 'networkidle2', timeout: 30000 });

      const logoUrl = await page.$eval('img[src*="logo"]', img => img.src).catch(() => null);
      
      const colors = await page.evaluate(() => {
          const colorSet = new Set();
          const nodes = Array.from(document.querySelectorAll('*')).slice(0, 3000);
          for (const el of nodes) {
              const style = window.getComputedStyle(el);
              const color = style.getPropertyValue('color');
              const bgColor = style.getPropertyValue('background-color');
              if (color && color.startsWith('rgb')) colorSet.add(color);
              if (bgColor && bgColor.startsWith('rgb')) colorSet.add(bgColor);
              if (colorSet.size >= 25) break;
          }
          return Array.from(colorSet).slice(0, 5);
      });

      const textContent = await page.$eval('body', el => el.innerText.substring(0, 2000));
      
      const payload = { logoUrl, colors, textContent };

      // 3. Store the new result in the cache
      await cacheRef.set({
        timestamp: Date.now(),
        payload: payload,
      });

      res.status(200).send(payload);

    } finally {
      if (browser) {
        await browser.close();
      }
    }
  } catch (error) {
    console.error('Scraping or caching failed for URL:', url, 'Error:', error.stack || error);
    res.status(500).send({ error: 'Failed to scrape or cache the website.' });
  }
});

app.listen(PORT, () => {
  console.log(`Scraper service listening on port ${PORT}`);
});
