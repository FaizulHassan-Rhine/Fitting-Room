/**
 * Database seeder — run with:
 *   npm run seed          → insert 200 dummy products
 *   npm run seed:clear    → wipe products + search logs
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product  = require('../models/Product');
const SearchLog = require('../models/SearchLog');

// ─── Dummy data pools ─────────────────────────────────────────────────────────

const CATEGORIES = [
  { name: 'electronics',  sub: ['smartphones', 'laptops', 'headphones', 'cameras', 'tablets'] },
  { name: 'footwear',     sub: ['sneakers', 'boots', 'sandals', 'loafers'] },
  { name: 'clothing',     sub: ['t-shirts', 'jackets', 'dresses', 'jeans', 'hoodies'] },
  { name: 'home',         sub: ['furniture', 'kitchen', 'bedding', 'lighting'] },
  { name: 'sports',       sub: ['gym', 'cycling', 'running', 'yoga', 'swimming'] },
  { name: 'beauty',       sub: ['skincare', 'haircare', 'makeup', 'fragrances'] },
  { name: 'books',        sub: ['fiction', 'non-fiction', 'science', 'biography'] },
  { name: 'toys',         sub: ['action-figures', 'board-games', 'puzzles', 'educational'] },
];

const BRANDS = [
  'TechNova', 'UrbanStep', 'CloudWear', 'PeakGear', 'LumaHome',
  'VitalBeauty', 'PageTurner', 'PlayWorld', 'SwiftRun', 'EcoStyle',
  'NexCore', 'AlphaFit', 'BrightSpark', 'CozyNest', 'PulseAudio',
];

const ADJECTIVES = [
  'Premium', 'Ultra', 'Pro', 'Lite', 'Slim', 'Bold', 'Smart',
  'Classic', 'Modern', 'Nano', 'Flex', 'Max', 'Air', 'Elite', 'Core',
];

const NOUNS_BY_CATEGORY = {
  electronics: ['Smartphone X', 'Laptop G5', 'Wireless Earbuds', 'DSLR Camera', 'Smart Watch', 'Tablet Pro', 'Bluetooth Speaker', 'USB-C Hub'],
  footwear:    ['Running Shoes', 'Trail Boots', 'Summer Sandals', 'Canvas Sneakers', 'Leather Loafers', 'High-Top Kicks', 'Slide Slippers'],
  clothing:    ['Graphic Tee', 'Bomber Jacket', 'Slim Jeans', 'Floral Dress', 'Zip Hoodie', 'Polo Shirt', 'Cargo Pants', 'Trench Coat'],
  home:        ['Standing Desk', 'Memory Foam Pillow', 'Smart Lamp', 'Cast Iron Pan', 'Linen Duvet', 'Wall Shelf', 'Scented Candle'],
  sports:      ['Resistance Bands', 'Yoga Mat', 'Road Bike Helmet', 'Running Vest', 'Pull-Up Bar', 'Jump Rope', 'Knee Sleeve'],
  beauty:      ['Vitamin C Serum', 'Argan Hair Oil', 'Matte Foundation', 'Eau de Parfum', 'Lip Gloss Set', 'Face Mask Kit'],
  books:       ['The Lost Horizon', 'Data Science Handbook', 'Atomic Habits', 'Space Odyssey', 'Clean Code', 'Deep Work'],
  toys:        ['LEGO City Set', 'Remote Control Car', 'Chess Master Board', 'Science Lab Kit', 'Plush Dinosaur', 'Memory Card Game'],
};

const TAGS_BY_CATEGORY = {
  electronics: ['tech', 'gadget', 'wireless', 'smart', 'portable'],
  footwear:    ['shoes', 'fashion', 'comfort', 'sport', 'casual'],
  clothing:    ['fashion', 'style', 'apparel', 'casual', 'trendy'],
  home:        ['home', 'decor', 'interior', 'comfort', 'lifestyle'],
  sports:      ['fitness', 'workout', 'sport', 'health', 'outdoor'],
  beauty:      ['beauty', 'skincare', 'organic', 'selfcare', 'glow'],
  books:       ['reading', 'knowledge', 'bestseller', 'education'],
  toys:        ['kids', 'play', 'educational', 'fun', 'creative'],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function slugify(str, id) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + id;
}

function generateProduct(index) {
  const cat     = pick(CATEGORIES);
  const nouns   = NOUNS_BY_CATEGORY[cat.name];
  const noun    = pick(nouns);
  const adj     = pick(ADJECTIVES);
  const brand   = pick(BRANDS);
  const name    = `${brand} ${adj} ${noun}`;
  const price   = randFloat(5, 1200);
  const hasDisc = Math.random() > 0.4;
  const origP   = hasDisc ? parseFloat((price * randFloat(1.1, 1.5)).toFixed(2)) : undefined;
  const rating  = { average: randFloat(1, 5), count: randInt(0, 5000) };
  const stock   = randInt(0, 500);

  const tags = [
    ...(TAGS_BY_CATEGORY[cat.name] || []).slice(0, randInt(2, 4)),
    adj.toLowerCase(),
    brand.toLowerCase(),
  ];

  return {
    name,
    slug: slugify(name, index),
    description: `The ${name} delivers outstanding performance and lasting quality. Designed for everyday use, it combines ${adj.toLowerCase()} engineering with stylish aesthetics. Backed by ${brand}'s reputation for excellence. Perfect for anyone seeking reliability and value in the ${cat.name} category.`,
    shortDescription: `${adj} ${noun} by ${brand} — built for performance and style.`,
    category: cat.name,
    subcategory: pick(cat.sub),
    brand,
    tags,
    price,
    originalPrice: origP,
    currency: 'USD',
    rating,
    stock,
    inStock: stock > 0,
    images: [
      {
        url: `https://picsum.photos/seed/${index}/400/400`,
        alt: name,
        isPrimary: true,
      },
      {
        url: `https://picsum.photos/seed/${index + 1000}/400/400`,
        alt: `${name} angle`,
        isPrimary: false,
      },
    ],
    attributes: new Map([
      ['color',    pick(['Black', 'White', 'Navy', 'Red', 'Green', 'Grey'])],
      ['material', pick(['Cotton', 'Polyester', 'Leather', 'Aluminium', 'Wood', 'Silicone'])],
    ]),
    isActive: Math.random() > 0.05, // ~95% active
    isFeatured: Math.random() > 0.85,
    salesCount: randInt(0, 10000),
    viewCount: randInt(0, 50000),
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error('❌  MONGODB_URI is not set. Copy .env.example → .env and add your credentials.');
    process.exit(1);
  }

  console.log('🔗  Connecting to MongoDB…');
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  console.log('✅  Connected');

  const isClear = process.argv.includes('--clear');

  if (isClear) {
    await Promise.all([Product.deleteMany({}), SearchLog.deleteMany({})]);
    console.log('🗑   Cleared all products and search logs.');
    await mongoose.disconnect();
    process.exit(0);
  }

  const count = await Product.countDocuments();
  if (count > 0) {
    console.log(`ℹ️   Database already has ${count} products. Skipping seed.`);
    console.log('    Run "npm run seed:clear" first to reseed from scratch.');
    await mongoose.disconnect();
    process.exit(0);
  }

  console.log('🌱  Generating 200 dummy products…');
  const products = Array.from({ length: 200 }, (_, i) => generateProduct(i + 1));

  await Product.insertMany(products, { ordered: false });
  console.log(`✅  Inserted ${products.length} products successfully.`);
  console.log('\n📋  Sample slugs to test with:');
  products.slice(0, 5).forEach((p) => console.log(`    GET /api/v1/products/${p.slug}`));

  await mongoose.disconnect();
  console.log('\n🎉  Seeding complete! Run "npm run dev" to start the server.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌  Seed failed:', err.message);
  process.exit(1);
});
