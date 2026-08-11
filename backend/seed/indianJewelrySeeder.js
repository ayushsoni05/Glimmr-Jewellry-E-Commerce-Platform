const mongoose = require('mongoose');
const Product = require('../models/Product');

const PREFIXES = [
  'Aadhya', 'Ananya', 'Devanshi', 'Maharani', 'Royal Ayodhya', 'Nakshi', 'Kundan', 'Polki',
  'Meenakari', 'South Indian Temple', 'Solitaire', 'Vintage Banjara', 'Jaipur Heritage',
  'Nizam', 'Kashi', 'Vedic', 'Shringara', 'Navratna', 'Vrindavan', 'Suryakanti', 'Swarna',
  'Mayura', 'Lotus Blossom', 'Royal Crown', 'Avantika', 'Bhavya', 'Charvi', 'Darshana',
  'Divya', 'Gayatri', 'Hamsini', 'Ishani', 'Janki', 'Kavya', 'Lavanya', 'Madhuri',
  'Malini', 'Nayantara', 'Omisha', 'Padmini', 'Radhika', 'Rukmini', 'Sanjana', 'Trisha',
  'Upasana', 'Vasundhara', 'Yashoda', 'Nila', 'Tanya', 'Varun', 'Rudra', 'Indra',
  'Agni', 'Chandra', 'Surya', 'Padma', 'Tara', 'Anandi', 'Bhairavi', 'Chitra',
  'Dhanalaxmi', 'Gauri', 'Hemlata', 'Jyoti', 'Kamala', 'Laxmi', 'Meera', 'Nandini',
  'Pooja', 'Ritu', 'Saroj', 'Tulsi', 'Usha', 'Vidya', 'Yamuna', 'Zeena'
];

const CRAFTS = [
  'Handcrafted', 'Intricate', 'Heirloom', 'Radiant', 'Imperial', 'Sacred', 'Antique',
  'Opulent', 'Celestial', 'Traditional', 'Majestic', 'Regal', 'Graceful', 'Luminous',
  'Filigree', 'Embossed', 'Carved', 'Sculpted', 'Diamond-Studded', 'Pearl-Adorned',
  'Gold-Plated', 'Beaded', 'Etched', 'Gilded', 'Gem-Set', 'Polished'
];

const BASE_TITLES = {
  rings: [
    'Solitaire Engagement Ring', 'Cocktail Ring', 'Vanki Ring', 'Eternity Band',
    'Signet Ring', 'Coin Ring', 'Floral Motif Ring', 'Geometric Ring',
    'Statement Ring', 'Crown Ring', 'Pavé Band', 'Stackable Ring'
  ],
  necklace: [
    'Choker Necklace', 'Rani Haar', 'Hasli Necklace', 'Pendant Chain',
    'Mangalsutra', 'Temple Mala', 'Coin Necklace', 'Layered Necklace',
    'Station Necklace', 'Lotus Pendant Set', 'Statement Neckpiece', 'Collar Necklace'
  ],
  earring: [
    'Jhumka Earrings', 'Chandbali Danglers', 'Sui Dhaga Drop Earrings', 'Stud Earrings',
    'Hoop Earrings', 'Kaan Chain Earrings', 'Ear Cuffs', 'Hanging Leaf Earrings',
    'Cluster Studs', 'Threader Earrings', 'Drop Earrings', 'Peacock Danglers'
  ],
  bracelet: [
    'Nakshi Kada Bangle', 'Tennis Bracelet', 'Ghungroo Bangle', 'Elephant Motif Bangle',
    'Charm Bracelet', 'Screw Bangle Pair', 'Filigree Cuff', 'Link Bracelet',
    'Snake Chain Bracelet', 'Statement Bangle', 'Curved Cuff', 'Stacked Bangle'
  ],
  watches: [
    'Steel Chronograph Watch', 'Diamond Bezel Dress Watch', 'Leather Strap Timepiece',
    'Mesh Bracelet Watch', 'Automatic Heritage Watch', 'Sapphire Quartz Watch',
    'Bangle Bracelet Watch', 'Imperial Crown Watch', 'Classic Dial Wristwatch', 'Executive Watch'
  ]
};

const PHOTO_TOKENS = {
  rings: [
    'photo-1605100804763-247f67b3557e',
    'photo-1603561591411-07134e71a2a9',
    'photo-1601121141461-9d6647bca1ed',
    'photo-1598560917505-59a3ad559071',
    'photo-1603561596112-0a132b757442',
    'photo-1573408301185-9146fe634ad0',
    'photo-1544816155-12df9643f363',
    'photo-1588444837495-c6cfeb53f32d'
  ],
  necklace: [
    'photo-1599643478518-a784e5dc4c8f',
    'photo-1515562141207-7a88fb7ce338',
    'photo-1611591437281-460bfbe1220a',
    'photo-1539571696357-5a69c17a67c6',
    'photo-1602751584552-8ba73aad10e1',
    'photo-1506630448388-4e683c67ddb0'
  ],
  earring: [
    'photo-1535632066927-ab7c9ab60908',
    'photo-1630019852942-f89202989a59',
    'photo-1617038260897-41a1f14a8ca0',
    'photo-1588444837495-c6cfeb53f32d',
    'photo-1590548784585-643d2b9f2925'
  ],
  bracelet: [
    'photo-1520975914443-3d9b36b4f9f3',
    'photo-1611591437281-460bfbe1220a',
    'photo-1535632066927-ab7c9ab60908',
    'photo-1605100804763-247f67b3557e'
  ]
};

const UNBOUND_PHOTO_IDS = [
  'photo-1605100804763-247f67b3557e',
  'photo-1603561591411-07134e71a2a9',
  'photo-1601121141461-9d6647bca1ed',
  'photo-1598560917505-59a3ad559071',
  'photo-1603561596112-0a132b757442',
  'photo-1573408301185-9146fe634ad0',
  'photo-1544816155-12df9643f363',
  'photo-1588444837495-c6cfeb53f32d',
  'photo-1599643478518-a784e5dc4c8f',
  'photo-1515562141207-7a88fb7ce338',
  'photo-1611591437281-460bfbe1220a',
  'photo-1539571696357-5a69c17a67c6',
  'photo-1602751584552-8ba73aad10e1',
  'photo-1506630448388-4e683c67ddb0',
  'photo-1535632066927-ab7c9ab60908',
  'photo-1630019852942-f89202989a59',
  'photo-1617038260897-41a1f14a8ca0',
  'photo-1590548784585-643d2b9f2925',
  'photo-1520975914443-3d9b36b4f9f3',
  'photo-1522335789203-aabd1fc54bc9',
  'photo-1524805444758-089113d48a6d',
  'photo-1523275335684-37898b6baf30',
  'photo-1533139502658-0198f920d8e8',
  'photo-1542496658-e33a6d0d50f6'
];

const fs = require('fs');
const path = require('path');

let DISTINCT_PHOTO_POOL = [];
try {
  const poolPath = path.join(__dirname, 'distinct_photo_urls.json');
  if (fs.existsSync(poolPath)) {
    DISTINCT_PHOTO_POOL = JSON.parse(fs.readFileSync(poolPath, 'utf8'));
  }
} catch (e) {
  console.error('Failed to load distinct_photo_urls.json:', e);
}

const WATCH_IMAGES = {
  gold24k: '/images/watches/gold_chronograph_24k.jpg',
  gold22k: '/images/watches/kundan_gold_watch_22k.jpg',
  gold18k: '/images/watches/diamond_rose_gold_watch_18k.jpg',
  gold14k: '/images/watches/gold_leather_watch_14k.jpg',
  silver999: '/images/watches/pure_silver_pocket_watch_999.jpg',
  silver925: '/images/watches/silver_mesh_watch_925.jpg',
  silver900: '/images/watches/oxidized_silver_cuff_watch.jpg'
};

function generateUniqueImageUrl(category, globalIdx, key = null) {
  const poolIdx = (globalIdx - 1001) % DISTINCT_PHOTO_POOL.length;
  if (DISTINCT_PHOTO_POOL[poolIdx]) {
    return DISTINCT_PHOTO_POOL[poolIdx];
  }
  return `https://picsum.photos/id/${globalIdx}/800/800`;
}

function generateProducts() {
  const products = [];
  const usedNames = new Set();
  const categories = ['rings', 'necklace', 'earring', 'bracelet', 'watches'];
  let globalCount = 1000;

  categories.forEach((cat) => {
    const titlesList = BASE_TITLES[cat];

    // --- GOLD PRODUCTS (80 per category: 20x 24K, 20x 22K, 20x 18K, 20x 14K) ---
    const goldTiers = [
      { key: 'gold24k', karat: 24, purity: 99.9, hallmark: 'BIS 999 Hallmarked Pure Gold', priceRange: [85000, 450000], weightRange: [10, 60] },
      { key: 'gold22k', karat: 22, purity: 91.6, hallmark: 'BIS 916 Hallmarked Gold', priceRange: [45000, 280000], weightRange: [8, 45] },
      { key: 'gold18k', karat: 18, purity: 75.0, hallmark: 'BIS 750 Hallmarked Gold', priceRange: [25000, 180000], weightRange: [4, 25] },
      { key: 'gold14k', karat: 14, purity: 58.5, hallmark: 'BIS 585 Hallmarked Gold', priceRange: [12000, 75000], weightRange: [2, 15] }
    ];

    goldTiers.forEach((tier) => {
      for (let i = 0; i < 20; i++) {
        globalCount++;
        let name = '';
        let prefixIdx = (globalCount * 7) % PREFIXES.length;
        let craftIdx = (globalCount * 13) % CRAFTS.length;
        let baseIdx = (globalCount * 3) % titlesList.length;

        name = `${PREFIXES[prefixIdx]} ${tier.karat}K ${CRAFTS[craftIdx]} ${titlesList[baseIdx]}`;
        while (usedNames.has(name)) {
          prefixIdx = (prefixIdx + 1) % PREFIXES.length;
          name = `${PREFIXES[prefixIdx]} ${tier.karat}K ${CRAFTS[craftIdx]} ${titlesList[baseIdx]}`;
        }
        usedNames.add(name);

        const weight = Math.round((Math.random() * (tier.weightRange[1] - tier.weightRange[0]) + tier.weightRange[0]) * 10) / 10;
        const price = Math.round(tier.priceRange[0] + Math.random() * (tier.priceRange[1] - tier.priceRange[0]));
        const makingCharge = Math.round(350 + Math.random() * 400);
        const imageUrl = generateUniqueImageUrl(cat, globalCount, tier.key);

        products.push({
          name,
          description: `Authentic Indian ${tier.karat}K Gold ${cat.replace(/s$/, '')}. Crafted with certified ${tier.hallmark} (${tier.purity}% purity). Net Gold Weight: ${weight}g. BIS Hallmarked for guaranteed gold purity. Perfect for Indian festive and bridal occasions.`,
          category: cat,
          material: 'gold',
          price,
          weight,
          karat: tier.karat,
          purityPercentage: tier.purity,
          hallmarkDetails: tier.hallmark,
          makingChargePerGram: makingCharge,
          images: [imageUrl],
          variants: ['Standard', 'Custom Fit'],
          rating: +(Math.random() * 0.8 + 4.2).toFixed(1),
          stock: Math.floor(Math.random() * 30) + 10,
          isActive: true
        });
      }
    });

    // --- SILVER PRODUCTS (60 per category: 20x 99.9%, 20x 92.5%, 20x 90.0%) ---
    const silverTiers = [
      { key: 'silver999', purity: 99.9, hallmark: '999 Fine Pure Silver Certified', priceRange: [4999, 35000], weightRange: [20, 150] },
      { key: 'silver925', purity: 92.5, hallmark: '925 Sterling Silver Hallmarked', priceRange: [1999, 18000], weightRange: [8, 50] },
      { key: 'silver900', purity: 90.0, hallmark: '900 Antique Oxidized Silver', priceRange: [999, 12000], weightRange: [10, 80] }
    ];

    silverTiers.forEach((tier) => {
      for (let i = 0; i < 20; i++) {
        globalCount++;
        let name = '';
        let prefixIdx = (globalCount * 11) % PREFIXES.length;
        let craftIdx = (globalCount * 5) % CRAFTS.length;
        let baseIdx = (globalCount * 2) % titlesList.length;

        const silverLabel = tier.purity === 92.5 ? 'Sterling Silver' : tier.purity === 99.9 ? '999 Fine Silver' : 'Oxidized Silver';
        name = `${PREFIXES[prefixIdx]} ${CRAFTS[craftIdx]} ${silverLabel} ${titlesList[baseIdx]}`;
        while (usedNames.has(name)) {
          prefixIdx = (prefixIdx + 1) % PREFIXES.length;
          name = `${PREFIXES[prefixIdx]} ${CRAFTS[craftIdx]} ${silverLabel} ${titlesList[baseIdx]}`;
        }
        usedNames.add(name);

        const weight = Math.round((Math.random() * (tier.weightRange[1] - tier.weightRange[0]) + tier.weightRange[0]) * 10) / 10;
        const price = Math.round(tier.priceRange[0] + Math.random() * (tier.priceRange[1] - tier.priceRange[0]));
        const makingCharge = Math.round(40 + Math.random() * 100);
        const imageUrl = generateUniqueImageUrl(cat, globalCount, tier.key);

        products.push({
          name,
          description: `Genuine Indian Silver ${cat.replace(/s$/, '')}. Crafted with ${tier.hallmark} containing ${tier.purity}% pure silver content. Net Silver Weight: ${weight}g. Stamped for certified authenticity and long-lasting lustre.`,
          category: cat,
          material: 'silver',
          price,
          weight,
          karat: 0,
          purityPercentage: tier.purity,
          hallmarkDetails: tier.hallmark,
          makingChargePerGram: makingCharge,
          images: [imageUrl],
          variants: ['Standard'],
          rating: +(Math.random() * 0.8 + 4.1).toFixed(1),
          stock: Math.floor(Math.random() * 35) + 15,
          isActive: true
        });
      }
    });
  });

  return products;
}

async function seedIndianJewelry() {
  try {
    const countBefore = await Product.countDocuments();
    console.log(`Clearing ${countBefore} existing products from database...`);
    await Product.deleteMany({});

    const allProducts = generateProducts();
    console.log(`Generated ${allProducts.length} unique Indian Gold & Silver products.`);
    
    await Product.insertMany(allProducts);
    console.log(`✅ Successfully seeded ${allProducts.length} Indian products into MongoDB!`);
    return allProducts.length;
  } catch (err) {
    console.error('Failed to seed Indian jewelry products:', err);
    throw err;
  }
}

module.exports = { seedIndianJewelry };

if (require.main === module) {
  (async () => {
    const dotenv = require('dotenv');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    dotenv.config();
    const mongoURI = process.env.MONGO_URI;
    try {
      if (mongoURI) {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB for Indian Jewelry seeding...');
      } else {
        const mem = await MongoMemoryServer.create();
        await mongoose.connect(mem.getUri());
        console.log('Connected to In-Memory MongoDB for Indian Jewelry seeding...');
      }
      await seedIndianJewelry();
      process.exit(0);
    } catch (err) {
      console.error('Seeding error:', err);
      process.exit(1);
    }
  })();
}
