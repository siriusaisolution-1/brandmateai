const express = require('express');
const puppeteer = require('puppeteer');
const admin = require('firebase-admin');
const dns = require('dns').promises;
const net = require('net');

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
    await validateTarget(urlObj);
  } catch {
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

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'localhost.',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  '::',
  'metadata.google.internal',
  'metadata.google.internal.',
  'metadata.google.internal.google',
  'metadata.google.internal.google.com',
  'metadata.google.internal.googleusercontent.com',
  'metadata.google.internal.googleusercontent.com.',
  '169.254.169.254',
  '169.254.169.254.',
  'metadata.aws',
  'instance-data',
  'instance-data.',
  'instance-data.ec2.internal'
]);

const PRIVATE_IPV4_RANGES = [
  { base: '0.0.0.0', mask: 8 },
  { base: '10.0.0.0', mask: 8 },
  { base: '100.64.0.0', mask: 10 },
  { base: '127.0.0.0', mask: 8 },
  { base: '169.254.0.0', mask: 16 },
  { base: '172.16.0.0', mask: 12 },
  { base: '192.0.0.0', mask: 24 },
  { base: '192.168.0.0', mask: 16 },
  { base: '198.18.0.0', mask: 15 },
  { base: '224.0.0.0', mask: 4 },
  { base: '240.0.0.0', mask: 4 }
];

async function validateTarget(urlObj) {
  const hostname = urlObj.hostname;
  if (isBlockedHostname(hostname)) {
    throw new Error('Blocked hostname');
  }

  const lookupResults = await resolveHostname(hostname);
  if (!lookupResults.length) {
    throw new Error('Unable to resolve hostname');
  }

  for (const { address, family } of lookupResults) {
    if (isBlockedHostname(address)) {
      throw new Error('Blocked address');
    }
    if (family === 4 && isPrivateIPv4(address)) {
      throw new Error('Disallowed private IPv4 address');
    }
    if (family === 6 && isPrivateIPv6(address)) {
      throw new Error('Disallowed private IPv6 address');
    }
  }
}

function isBlockedHostname(hostname) {
  return BLOCKED_HOSTNAMES.has(hostname.toLowerCase());
}

async function resolveHostname(hostname) {
  const ipType = net.isIP(hostname);
  if (ipType) {
    return [{ address: hostname, family: ipType }];
  }
  try {
    return await dns.lookup(hostname, { all: true, verbatim: false });
  } catch (error) {
    console.error('DNS resolution failed for hostname:', hostname, error);
    throw new Error('Unable to resolve hostname');
  }
}

function isPrivateIPv4(address) {
  const ipInt = ipv4ToInt(address);
  if (ipInt === null) {
    return true;
  }
  return PRIVATE_IPV4_RANGES.some(range => isIPv4InRange(ipInt, range));
}

function ipv4ToInt(ip) {
  const parts = ip.split('.');
  if (parts.length !== 4) {
    return null;
  }
  let result = 0;
  for (const part of parts) {
    const octet = Number(part);
    if (!Number.isInteger(octet) || octet < 0 || octet > 255) {
      return null;
    }
    result = (result << 8) + octet;
  }
  return result >>> 0;
}

function isIPv4InRange(ipInt, { base, mask }) {
  const baseInt = ipv4ToInt(base);
  if (baseInt === null) {
    return false;
  }
  if (mask === 0) {
    return true;
  }
  const maskInt = mask === 32 ? 0xffffffff : ((0xffffffff << (32 - mask)) >>> 0);
  return (ipInt & maskInt) === (baseInt & maskInt);
}

function isPrivateIPv6(address) {
  const normalized = address.toLowerCase();
  if (normalized === '::' || normalized === '::1') {
    return true;
  }
  if (normalized.startsWith('::ffff:')) {
    const mappedIPv4 = normalized.replace('::ffff:', '');
    if (isPrivateIPv4(mappedIPv4)) {
      return true;
    }
  }
  const firstBlock = normalized.split(':')[0];
  if (firstBlock.startsWith('fc') || firstBlock.startsWith('fd')) {
    return true;
  }
  if (/^fe[89ab]/.test(firstBlock)) {
    return true;
  }
  return false;
}
