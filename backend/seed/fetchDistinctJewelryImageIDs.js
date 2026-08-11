const fs = require('fs');
const path = require('path');
const https = require('https');

function httpGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function scrapeDistinctPhotoIds() {
  const photoIds = new Set();
  const searchTerms = [
    'jewelry', 'gold-ring', 'silver-ring', 'gold-necklace', 'silver-necklace',
    'diamond-ring', 'earrings', 'gold-earrings', 'silver-earrings', 'bangle',
    'gold-bracelet', 'silver-bracelet', 'luxury-watch', 'gold-watch', 'silver-watch',
    'kundan-jewelry', 'indian-jewelry', 'temple-jewelry', 'pendant', 'jewel',
    'gemstone', 'emerald-ring', 'ruby-necklace', 'sapphire-ring', 'pearl-necklace',
    'gold-chain', 'silver-chain', 'choker-necklace', 'jhumka', 'solitaire-ring',
    'rose-gold-watch', 'chronograph-watch', 'pocket-watch', 'cuff-bracelet',
    'anklet', 'filigree-ring', 'wedding-ring', 'engagement-ring', 'diamond-earrings',
    'gold-bangle', 'silver-bangle', 'silver-pendant', 'gold-pendant', 'gold-jhumka',
    'silver-jhumka', 'kundan-choker', 'pearl-earrings', 'emerald-necklace', 'ruby-earrings'
  ];

  console.log('Scraping distinct jewelry photo IDs from HTML pages...');
  const photoRegex = /https:\/\/images\.unsplash\.com\/photo-([a-zA-Z0-9_-]+)\?/g;

  for (const term of searchTerms) {
    if (photoIds.size >= 750) break;
    try {
      const html = await httpGet(`https://unsplash.com/s/photos/${term}`);
      let match;
      while ((match = photoRegex.exec(html)) !== null) {
        if (match[1] && match[1].length > 5) {
          photoIds.add(`photo-${match[1]}`);
        }
      }
    } catch (e) {
      console.error(`Error scraping ${term}:`, e.message);
    }
  }

  return Array.from(photoIds);
}

(async () => {
  try {
    const ids = await scrapeDistinctPhotoIds();
    console.log(`Scraped ${ids.length} distinct photo IDs!`);
    const outputPath = path.join(__dirname, 'distinct_photo_ids.json');
    fs.writeFileSync(outputPath, JSON.stringify(ids, null, 2));
    console.log(`Saved distinct photo IDs to ${outputPath}`);
  } catch (err) {
    console.error('Error:', err);
  }
})();
