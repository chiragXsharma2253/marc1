import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client safely (lazy check in route)
let genAI: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!genAI) {
    genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAI;
}

// Extensive catalog of genuine Amazon and Flipkart products for zero-downtime deduplicated recommendations
interface RealProductSeed {
  title: string;
  brand: string;
  priceINR: number;
  priceUSD: number;
  originalINR: number;
  originalUSD: number;
  category: string;
  rating: number;
  reviewCount: number;
  whyGoodGift: string;
  primaryStore: 'amazon' | 'flipkart' | 'both';
  tags: string[];
  targetRecipients: string[];
  targetInterests: string[];
}

const REAL_STORE_CATALOG: RealProductSeed[] = [
  {
    title: "boAt Airdopes 141 Bluetooth Truly Wireless Earbuds with 42H Playtime & Beast Mode",
    brand: "boAt",
    priceINR: 1299,
    priceUSD: 16,
    originalINR: 4490,
    originalUSD: 49,
    category: "Audio & Electronics",
    rating: 4.3,
    reviewCount: 218500,
    whyGoodGift: "One of the most popular, reliable wireless earbuds on Amazon and Flipkart with punchy bass and long battery life.",
    primaryStore: "both",
    tags: ["Bestseller", "Top Rated", "Fast Delivery"],
    targetRecipients: ["Friend", "Brother", "Sister", "Partner", "Colleague", "Teen"],
    targetInterests: ["Tech & Gadgets", "Music & Audio", "Fitness & Sports", "Gaming"]
  },
  {
    title: "Echo Dot (5th Gen) Smart Speaker with Bigger Sound, Motion Detection & Alexa",
    brand: "Amazon",
    priceINR: 4499,
    priceUSD: 49,
    originalINR: 5499,
    originalUSD: 59,
    category: "Smart Home & Gadgets",
    rating: 4.5,
    reviewCount: 94200,
    whyGoodGift: "A versatile smart speaker that controls home appliances, plays music, and manages daily routines effortlessly.",
    primaryStore: "amazon",
    tags: ["Amazon Choice", "Voice Assistant", "Smart Tech"],
    targetRecipients: ["Partner", "Father", "Mother", "Friend", "Family", "Self"],
    targetInterests: ["Tech & Gadgets", "Home & Kitchen", "Music & Audio"]
  },
  {
    title: "Noise Pulse 2 Max 1.85'' TFT LCD Display Bluetooth Calling Smartwatch with 100 Sports Modes",
    brand: "Noise",
    priceINR: 1499,
    priceUSD: 19,
    originalINR: 5999,
    originalUSD: 65,
    category: "Wearables & Tech",
    rating: 4.2,
    reviewCount: 145000,
    whyGoodGift: "A top-selling fitness and calling smartwatch with bright display and premium metallic build at an accessible budget.",
    primaryStore: "both",
    tags: ["Bestseller", "Bluetooth Calling", "Health Tracker"],
    targetRecipients: ["Partner", "Brother", "Sister", "Friend", "Father", "Colleague"],
    targetInterests: ["Tech & Gadgets", "Fitness & Sports", "Fashion & Grooming"]
  },
  {
    title: "Philips BT1232/15 Skin-friendly Cordless Beard Trimmer with USB Charging",
    brand: "Philips",
    priceINR: 999,
    priceUSD: 14,
    originalINR: 1295,
    originalUSD: 18,
    category: "Grooming & Personal Care",
    rating: 4.3,
    reviewCount: 88400,
    whyGoodGift: "The gold-standard everyday beard trimmer trusted by millions on Flipkart and Amazon for irritation-free grooming.",
    primaryStore: "both",
    tags: ["Flipkart Assured", "Essential Grooming", "Compact"],
    targetRecipients: ["Father", "Brother", "Partner", "Friend", "Colleague"],
    targetInterests: ["Fashion & Grooming", "Personal Care"]
  },
  {
    title: "WildHorn Brown Genuine Leather Wallet, Keyring & Pen Combo Gift Set for Men",
    brand: "WildHorn",
    priceINR: 899,
    priceUSD: 12,
    originalINR: 2499,
    originalUSD: 32,
    category: "Fashion Accessories",
    rating: 4.4,
    reviewCount: 36700,
    whyGoodGift: "Arrives in a ready-to-gift matte presentation box featuring handcrafted genuine leather essentials.",
    primaryStore: "both",
    tags: ["Gift Box Included", "Genuine Leather", "Classic Style"],
    targetRecipients: ["Father", "Brother", "Partner", "Colleague", "Boss"],
    targetInterests: ["Fashion & Grooming", "Lifestyle"]
  },
  {
    title: "Titan Neo Analog Dial Quartz Watch with Stainless Steel Mesh Strap",
    brand: "Titan",
    priceINR: 2995,
    priceUSD: 38,
    originalINR: 3795,
    originalUSD: 48,
    category: "Watches & Jewelry",
    rating: 4.5,
    reviewCount: 18200,
    whyGoodGift: "A timeless, elegant timepiece from India's most trusted watchmaker, ideal for memorable milestones.",
    primaryStore: "both",
    tags: ["Premium Brand", "Water Resistant", "2 Year Warranty"],
    targetRecipients: ["Partner", "Father", "Mother", "Colleague", "Friend"],
    targetInterests: ["Fashion & Grooming", "Lifestyle"]
  },
  {
    title: "Kindle Paperwhite (16 GB) 6.8'' Display with Warm Light & Waterproof Design",
    brand: "Amazon",
    priceINR: 14999,
    priceUSD: 139,
    originalINR: 16999,
    originalUSD: 159,
    category: "Books & Gadgets",
    rating: 4.7,
    reviewCount: 42100,
    whyGoodGift: "The undisputed holy grail for book lovers with glare-free e-ink reading, weeks of battery, and waterproof durability.",
    primaryStore: "amazon",
    tags: ["Top Tier Gift", "Book Lover Favorite", "Glare-free"],
    targetRecipients: ["Partner", "Friend", "Sister", "Brother", "Mother", "Self"],
    targetInterests: ["Books & Stationery", "Tech & Gadgets", "Travel & Outdoors"]
  },
  {
    title: "Bombay Shaving Company Premium Charcoal Facial Grooming & Detox Gift Kit",
    brand: "Bombay Shaving Company",
    priceINR: 1199,
    priceUSD: 15,
    originalINR: 1899,
    originalUSD: 24,
    category: "Beauty & Grooming",
    rating: 4.4,
    reviewCount: 19500,
    whyGoodGift: "A luxurious 6-piece self-care hamper with charcoal face wash, scrub, and restorative moisturizer.",
    primaryStore: "both",
    tags: ["Gift Hamper", "Luxury Grooming", "Natural Extracts"],
    targetRecipients: ["Brother", "Partner", "Friend", "Colleague"],
    targetInterests: ["Fashion & Grooming", "Personal Care"]
  },
  {
    title: "Prestige Iris Plus 750 Watt Mixer Grinder with 3 Stainless Steel Jars and Juicer Jar",
    brand: "Prestige",
    priceINR: 3299,
    priceUSD: 42,
    originalINR: 6295,
    originalUSD: 78,
    category: "Home & Kitchen",
    rating: 4.2,
    reviewCount: 78000,
    whyGoodGift: "A powerhouse kitchen appliance that makes daily culinary prep effortless for any home chef.",
    primaryStore: "both",
    tags: ["Flipkart Bestseller", "Kitchen Essential", "750W Motor"],
    targetRecipients: ["Mother", "Family", "Partner", "Housewarming"],
    targetInterests: ["Home & Kitchen", "Food & Gourmet"]
  },
  {
    title: "InstaCuppa Insulated Stainless Steel Coffee Travel Mug with Leak-Proof Sipper Lid 400ml",
    brand: "InstaCuppa",
    priceINR: 899,
    priceUSD: 12,
    originalINR: 1499,
    originalUSD: 19,
    category: "Drinkware & Kitchen",
    rating: 4.5,
    reviewCount: 14200,
    whyGoodGift: "Keeps beverages steaming hot for 6 hours or icy cold for 12 hours with a sleek textured matte grip.",
    primaryStore: "both",
    tags: ["Eco-friendly", "Spill Proof", "Daily Commute"],
    targetRecipients: ["Colleague", "Friend", "Partner", "Brother", "Sister"],
    targetInterests: ["Food & Gourmet", "Lifestyle", "Travel & Outdoors"]
  },
  {
    title: "The Psychology of Money by Morgan Housel (Deluxe Hardcover Edition)",
    brand: "Harriman House",
    priceINR: 499,
    priceUSD: 18,
    originalINR: 799,
    originalUSD: 25,
    category: "Books & Literature",
    rating: 4.6,
    reviewCount: 112000,
    whyGoodGift: "An eye-opening, universally acclaimed bestseller that transforms how readers perceive wealth, greed, and happiness.",
    primaryStore: "both",
    tags: ["International Bestseller", "Must Read", "Hardcover"],
    targetRecipients: ["Friend", "Colleague", "Brother", "Sister", "Partner", "Teen"],
    targetInterests: ["Books & Stationery", "Self Development", "Lifestyle"]
  },
  {
    title: "Parker Vector Matte Black CT Roller Ball Pen in Premium Presentation Gift Case",
    brand: "Parker",
    priceINR: 425,
    priceUSD: 8,
    originalINR: 550,
    originalUSD: 10,
    category: "Stationery & Executive",
    rating: 4.4,
    reviewCount: 47000,
    whyGoodGift: "An iconic executive pen with ultra-smooth liquid ink technology and timeless black matte finish.",
    primaryStore: "both",
    tags: ["Executive Choice", "Timeless Classic", "Gift Box"],
    targetRecipients: ["Colleague", "Boss", "Father", "Friend", "Teacher"],
    targetInterests: ["Books & Stationery", "Lifestyle"]
  },
  {
    title: "Portronics SoundDrum 15W Portable Bluetooth Speaker with FM Radio & Deep Bass",
    brand: "Portronics",
    priceINR: 1099,
    priceUSD: 15,
    originalINR: 2499,
    originalUSD: 30,
    category: "Audio & Tech",
    rating: 4.3,
    reviewCount: 39000,
    whyGoodGift: "Compact cylindrical design with splash resistance and impressive 360-degree acoustics.",
    primaryStore: "both",
    tags: ["Flipkart Choice", "Pocket Dynamite", "Type-C Fast Charge"],
    targetRecipients: ["Friend", "Brother", "Sister", "Teen", "Partner"],
    targetInterests: ["Tech & Gadgets", "Music & Audio", "Travel & Outdoors"]
  },
  {
    title: "mCaffeine Coffee Body Scrub with Coconut Oil for Exfoliation & Tan Removal 100g",
    brand: "mCaffeine",
    priceINR: 399,
    priceUSD: 6,
    originalINR: 499,
    originalUSD: 8,
    category: "Skin & Beauty Care",
    rating: 4.5,
    reviewCount: 56000,
    whyGoodGift: "India's #1 coffee body scrub infused with pure Arabica coffee that leaves skin velvety soft with an irresistible aroma.",
    primaryStore: "both",
    tags: ["PETA Certified", "Bestseller", "Self Care Spa"],
    targetRecipients: ["Sister", "Mother", "Partner", "Friend"],
    targetInterests: ["Beauty & Personal Care", "Lifestyle"]
  },
  {
    title: "Wonderchef Nutri-blend 400W Mixer-Grinder Blender with 2 Unbreakable Jars",
    brand: "Wonderchef",
    priceINR: 2499,
    priceUSD: 32,
    originalINR: 5000,
    originalUSD: 60,
    category: "Kitchen & Wellness",
    rating: 4.4,
    reviewCount: 31000,
    whyGoodGift: "Crafted by Chef Sanjeev Kapoor, makes silky breakfast smoothies, cold coffees, and dry chutneys in seconds.",
    primaryStore: "both",
    tags: ["Chef Approved", "Nutrient Extractor", "Sleek Aesthetics"],
    targetRecipients: ["Partner", "Mother", "Friend", "Fitness Enthusiast"],
    targetInterests: ["Home & Kitchen", "Fitness & Sports", "Food & Gourmet"]
  },
  {
    title: "Cosmic Byte CB-GK-16 Firefly RGB Mechanical Keyboard with Outemu Blue Switches",
    brand: "Cosmic Byte",
    priceINR: 2199,
    priceUSD: 29,
    originalINR: 3499,
    originalUSD: 45,
    category: "Gaming & Tech",
    rating: 4.4,
    reviewCount: 22400,
    whyGoodGift: "Tactile satisfying clicks, vibrant per-key RGB backlighting, and durable aluminum top plate beloved by gamers.",
    primaryStore: "both",
    tags: ["Gaming Essential", "Mechanical Switch", "RGB"],
    targetRecipients: ["Brother", "Friend", "Teen", "Partner"],
    targetInterests: ["Gaming", "Tech & Gadgets"]
  },
  {
    title: "Scented Soy Wax Aroma Candle Set in Frosted Glass Jars (Pack of 4 Aromatherapies)",
    brand: "Miniso",
    priceINR: 699,
    priceUSD: 10,
    originalINR: 1199,
    originalUSD: 16,
    category: "Home Decor & Relaxation",
    rating: 4.5,
    reviewCount: 16800,
    whyGoodGift: "Infuses bedrooms and living spaces with calming French lavender, vanilla bean, and fresh linen notes.",
    primaryStore: "both",
    tags: ["Aromatherapy", "Clean Burn", "Relaxation"],
    targetRecipients: ["Partner", "Sister", "Mother", "Friend", "Colleague"],
    targetInterests: ["Home & Kitchen", "Lifestyle", "Beauty & Personal Care"]
  },
  {
    title: "Mi 10000mAh 22.5W Fast Charging Power Bank with Dual Output & Metallic Aluminum Body",
    brand: "Xiaomi",
    priceINR: 1199,
    priceUSD: 16,
    originalINR: 1999,
    originalUSD: 25,
    category: "Mobile Accessories",
    rating: 4.4,
    reviewCount: 138000,
    whyGoodGift: "An ultra-slim, universally needed pocket gadget that fast-charges smartphones, earbuds, and wearables on the move.",
    primaryStore: "both",
    tags: ["Everyday Carry", "22.5W Fast Charge", "Heavy Duty"],
    targetRecipients: ["Friend", "Brother", "Sister", "Partner", "Father", "Colleague"],
    targetInterests: ["Tech & Gadgets", "Travel & Outdoors"]
  },
  {
    title: "Fossil Grant Chronograph Blue Dial Men's Watch with Rich Brown Leather Strap",
    brand: "Fossil",
    priceINR: 8495,
    priceUSD: 99,
    originalINR: 13995,
    originalUSD: 155,
    category: "Luxury & Watches",
    rating: 4.6,
    reviewCount: 15400,
    whyGoodGift: "A statement luxury timepiece combining vintage Roman numeral cues with modern chronograph precision.",
    primaryStore: "amazon",
    tags: ["Luxury Gift", "Authentic Fossil", "Chronograph"],
    targetRecipients: ["Partner", "Father", "Brother", "Self"],
    targetInterests: ["Fashion & Grooming", "Lifestyle"]
  },
  {
    title: "Nua Heat Patches for Menstrual Cramp Relief (Pack of 3) & Self-Heating Pads",
    brand: "Nua",
    priceINR: 299,
    priceUSD: 5,
    originalINR: 399,
    originalUSD: 7,
    category: "Wellness & Comfort",
    rating: 4.6,
    reviewCount: 18400,
    whyGoodGift: "A deeply thoughtful, caring comfort gift providing 8 hours of natural soothing warmth.",
    primaryStore: "both",
    tags: ["Thoughtful Care", "Air Activated", "Comfort First"],
    targetRecipients: ["Partner", "Sister", "Friend"],
    targetInterests: ["Beauty & Personal Care", "Lifestyle"]
  },
  {
    title: "Logitech Pebble 2 M350s Slim Wireless Bluetooth Mouse with Silent Clicks",
    brand: "Logitech",
    priceINR: 1795,
    priceUSD: 24,
    originalINR: 2495,
    originalUSD: 32,
    category: "Computer Accessories",
    rating: 4.5,
    reviewCount: 29000,
    whyGoodGift: "Minimalist pebble design with 90% silent click reduction and multi-device pairing for laptops and tablets.",
    primaryStore: "both",
    tags: ["Work From Home", "Silent Click", "Pastel Shades"],
    targetRecipients: ["Colleague", "Partner", "Friend", "Sister", "Student"],
    targetInterests: ["Tech & Gadgets", "Lifestyle"]
  },
  {
    title: "Vahdam Assorted Tea Gift Set - 6 Gourmet Blends in Luxurious Gold Embossed Tin Caddy",
    brand: "Vahdam",
    priceINR: 999,
    priceUSD: 18,
    originalINR: 1499,
    originalUSD: 24,
    category: "Gourmet Food & Beverages",
    rating: 4.6,
    reviewCount: 21500,
    whyGoodGift: "Oprah's Favorite Things selection, featuring 100% direct-sourced whole leaf loose teas in a magnificent festive caddy.",
    primaryStore: "both",
    tags: ["Gourmet Hamper", "Oprah Approved", "Festive Favorite"],
    targetRecipients: ["Parents", "Mother", "Father", "Colleague", "Boss", "Housewarming"],
    targetInterests: ["Food & Gourmet", "Lifestyle"]
  },
  {
    title: "Philips Daily Collection 1.5 Litre 2400W Cordless Stainless Steel Electric Kettle",
    brand: "Philips",
    priceINR: 1549,
    priceUSD: 21,
    originalINR: 2295,
    originalUSD: 30,
    category: "Kitchen & Home",
    rating: 4.4,
    reviewCount: 41200,
    whyGoodGift: "Food-grade stainless steel with rapid boil technology, safe cool-touch handle, and auto shut-off.",
    primaryStore: "both",
    tags: ["Hostel & Home Essential", "Rapid Boil", "Durable Steel"],
    targetRecipients: ["Student", "Friend", "Mother", "Family", "Colleague"],
    targetInterests: ["Home & Kitchen", "Food & Gourmet"]
  },
  {
    title: "Boat Wave Call Smartwatch with 1.69\" HD Curved Display & Advanced Bluetooth Calling",
    brand: "boAt",
    priceINR: 1199,
    priceUSD: 16,
    originalINR: 7990,
    originalUSD: 89,
    category: "Smart Wearables",
    rating: 4.1,
    reviewCount: 89000,
    whyGoodGift: "One of the most viral and gift-friendly budget smartwatches across both Flipkart and Amazon India.",
    primaryStore: "flipkart",
    tags: ["Flipkart Big Billion Favorite", "HD Curved Display", "Built-in Speaker"],
    targetRecipients: ["Brother", "Friend", "Partner", "Sister", "Teen"],
    targetInterests: ["Tech & Gadgets", "Fitness & Sports"]
  },
  {
    title: "Lifelong FitPro Manual Incline Motorized Treadmill with 12 Preset Workouts for Home",
    brand: "Lifelong",
    priceINR: 16999,
    priceUSD: 199,
    originalINR: 32000,
    originalUSD: 380,
    category: "Fitness & Gym",
    rating: 4.2,
    reviewCount: 8500,
    whyGoodGift: "Foldable home cardio station with shock-absorbing running deck and heart rate sensor.",
    primaryStore: "both",
    tags: ["High Value Gift", "Home Fitness", "Foldable"],
    targetRecipients: ["Parents", "Partner", "Self"],
    targetInterests: ["Fitness & Sports", "Health & Wellness"]
  },
  {
    title: "Wipro Garnet 16W Smart LED Batten with 16 Million Colours & Music Sync",
    brand: "Wipro",
    priceINR: 799,
    priceUSD: 11,
    originalINR: 1990,
    originalUSD: 24,
    category: "Smart Lighting & Decor",
    rating: 4.3,
    reviewCount: 16300,
    whyGoodGift: "Instantly transforms gaming corners, study desks, and living rooms with Alexa and Google Assistant voice sync.",
    primaryStore: "both",
    tags: ["Room Aesthetic", "Music Sync", "Smart Home"],
    targetRecipients: ["Teen", "Brother", "Friend", "Partner"],
    targetInterests: ["Tech & Gadgets", "Home & Kitchen", "Gaming"]
  },
  {
    title: "Forest Essentials Facial Indulgence Gift Box with Mashobra Honey & Rosewater",
    brand: "Forest Essentials",
    priceINR: 2250,
    priceUSD: 32,
    originalINR: 2850,
    originalUSD: 38,
    category: "Ayurvedic Luxury Skincare",
    rating: 4.7,
    reviewCount: 9200,
    whyGoodGift: "India's quintessential luxury Ayurvedic brand packaged in an artisanal royal box with pure steam-distilled floral waters.",
    primaryStore: "amazon",
    tags: ["Ultra Luxury", "Pure Ayurveda", "Royal Presentation"],
    targetRecipients: ["Mother", "Partner", "Sister", "Special Occasion"],
    targetInterests: ["Beauty & Personal Care", "Lifestyle"]
  },
  {
    title: "Boya BY-M1 Omnidirectional Lavalier Microphone for Smartphones, DSLR & PCs",
    brand: "Boya",
    priceINR: 699,
    priceUSD: 10,
    originalINR: 1999,
    originalUSD: 24,
    category: "Creator & Video Tech",
    rating: 4.3,
    reviewCount: 110000,
    whyGoodGift: "The default gold-standard clip-on mic for aspiring content creators, podcasters, students, and remote workers.",
    primaryStore: "both",
    tags: ["Creator Essential", "Crystal Audio", "6 Meter Cable"],
    targetRecipients: ["Friend", "Brother", "Sister", "Teen", "Colleague"],
    targetInterests: ["Tech & Gadgets", "Art & Craft", "Gaming"]
  }
];

// Helper to clean and normalize titles for strict deduplication
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildUrls(title: string, brand: string, currency: 'INR' | 'USD') {
  const isINR = currency === 'INR';
  const query = encodeURIComponent(`${brand} ${title}`);
  const amazonBase = isINR ? 'https://www.amazon.in/s?k=' : 'https://www.amazon.com/s?k=';
  const flipkartBase = 'https://www.flipkart.com/search?q=';
  return {
    amazonUrl: `${amazonBase}${query}`,
    flipkartUrl: `${flipkartBase}${query}`,
  };
}

// Filter fallback catalog strictly excluding seen titles
function getDeduplicatedCatalogGifts(
  excludeList: string[],
  currency: 'INR' | 'USD',
  requestedCount: number = 8,
  preferredPlatform: string = 'all'
) {
  const normalizedExcludes = new Set(excludeList.map(normalizeTitle));

  const available = REAL_STORE_CATALOG.filter(item => {
    const norm = normalizeTitle(item.title);
    if (normalizedExcludes.has(norm)) return false;
    for (const excl of normalizedExcludes) {
      if (norm.includes(excl) || excl.includes(norm)) return false;
    }
    if (preferredPlatform === 'amazon' && item.primaryStore === 'flipkart') return false;
    if (preferredPlatform === 'flipkart' && item.primaryStore === 'amazon') return false;
    return true;
  });

  // Shuffle available items
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, requestedCount);

  return selected.map((seed, index) => {
    const isINR = currency === 'INR';
    const price = isINR ? seed.priceINR : seed.priceUSD;
    const originalPrice = isINR ? seed.originalINR : seed.originalUSD;
    const { amazonUrl, flipkartUrl } = buildUrls(seed.title, seed.brand, currency);

    return {
      id: `catalog_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 7)}`,
      title: seed.title,
      brand: seed.brand,
      price,
      originalPrice,
      currency,
      category: seed.category,
      rating: seed.rating,
      reviewCount: seed.reviewCount,
      whyGoodGift: seed.whyGoodGift,
      amazonSearchTerm: `${seed.brand} ${seed.title}`,
      flipkartSearchTerm: `${seed.brand} ${seed.title}`,
      amazonUrl,
      flipkartUrl,
      primaryStore: seed.primaryStore,
      tags: seed.tags,
      createdAt: Date.now(),
    };
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: Date.now(),
  });
});

// Proxy/test endpoint for user's custom server (e.g. http://127.0.0.1:8000)
app.post('/api/test-external-backend', async (req, res) => {
  const { url, path: subpath } = req.body;
  if (!url) {
    return res.status(400).json({ success: false, message: 'URL is required' });
  }

  const targetUrl = `${url.replace(/\/$/, '')}${subpath ? (subpath.startsWith('/') ? subpath : `/${subpath}`) : ''}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(targetUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeoutId);

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text.substring(0, 300);
    }

    return res.json({
      success: true,
      statusCode: response.status,
      targetUrl,
      message: `Connected successfully (${response.status} ${response.statusText})`,
      data,
    });
  } catch (err: any) {
    return res.status(502).json({
      success: false,
      targetUrl,
      message: err.name === 'AbortError' ? 'Connection timed out' : (err.message || 'Failed to connect to backend'),
    });
  }
});

// Primary Gift Search & Generation Route with Guaranteed Deduplication
app.post('/api/gifts', async (req, res) => {
  try {
    const {
      recipient = 'Friend',
      ageGroup = 'Adult (26-45)',
      occasion = 'Birthday',
      budgetRange = 'Under ₹1,500',
      currency = 'INR',
      interests = [],
      personaNotes = '',
      platformPreference = 'all',
      excludeItems = [],
      count = 8,
    } = req.body;

    const excludeSet = new Set<string>((excludeItems || []).map((t: string) => normalizeTitle(t)));
    const ai = getGenAI();

    // If Gemini is configured, use AI with Flipkart/Amazon grounding prompt
    if (ai) {
      try {
        const excludeListText = excludeItems && excludeItems.length > 0
          ? `CRITICAL DEDUPLICATION RULE: The user has ALREADY received or seen the following ${excludeItems.length} gift items. You are STRICTLY FORBIDDEN from repeating any of them, or slight title variants of them:\n${excludeItems.slice(-50).map((t: string) => `- ${t}`).join('\n')}\nEvery single item in your response MUST be fresh, distinct, and not on this list.`
          : 'Provide fresh, non-repeated gift recommendations.';

        const prompt = `You are an expert e-commerce gift curation engine specialized in verified, popular products sold on Amazon (Amazon.in / Amazon.com) and Flipkart (Flipkart.com).
The user is checking for gift ideas with these criteria:
- Recipient: ${recipient}
- Age Group: ${ageGroup}
- Occasion: ${occasion}
- Budget: ${budgetRange} (Currency: ${currency})
- Interests / Hobbies: ${interests.length ? interests.join(', ') : 'Popular trending gifts'}
- Specific Persona Notes: ${personaNotes || 'None'}
- Store Preference: ${platformPreference === 'all' ? 'Both Flipkart and Amazon' : platformPreference.toUpperCase()}

${excludeListText}

REQUIREMENTS:
1. Every gift idea MUST be a REAL, genuine branded product currently popular or bestselling on Amazon or Flipkart. Do NOT invent fictional products or conceptual non-existent items.
2. Include accurate brand name, realistic current market price in ${currency}, MRP / original price, category, realistic star rating (between 4.1 and 4.8), and review count.
3. Write a crisp 1-2 sentence explanation of "whyGoodGift" tailored to why this exact item makes a thoughtful, delighting present for this recipient.
4. Return exactly ${count} distinct items.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: 'You are an elite product finder that recommends real, top-selling, high-reputation gifts from Amazon and Flipkart. Always output strictly valid JSON matching the requested schema.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: 'Specific real product title as listed on Amazon or Flipkart' },
                  brand: { type: Type.STRING, description: 'Real brand name (e.g. boAt, Philips, Titan, Noise, Parker)' },
                  price: { type: Type.NUMBER, description: `Estimated current selling price in ${currency}` },
                  originalPrice: { type: Type.NUMBER, description: `Original list/MRP price in ${currency}` },
                  category: { type: Type.STRING, description: 'Category e.g. Electronics, Grooming, Books, Kitchen' },
                  rating: { type: Type.NUMBER, description: 'Star rating from 4.0 to 4.9' },
                  reviewCount: { type: Type.NUMBER, description: 'Approximate customer reviews count' },
                  whyGoodGift: { type: Type.STRING, description: 'Why this makes a great gift for this recipient' },
                  primaryStore: { type: Type.STRING, description: 'Store where it is best found: amazon, flipkart, or both' },
                  tags: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Tags like Bestseller, Prime, Flipkart Assured, Top Rated',
                  },
                },
                required: ['title', 'brand', 'price', 'category', 'rating', 'whyGoodGift', 'primaryStore'],
              },
            },
          },
        });

        const rawText = response.text?.trim() || '[]';
        const parsedItems = JSON.parse(rawText);

        if (Array.isArray(parsedItems) && parsedItems.length > 0) {
          // Double deduplicate against excludeSet and within current batch
          const uniqueItems: any[] = [];
          const currentBatchSeen = new Set<string>();

          for (const item of parsedItems) {
            const norm = normalizeTitle(item.title || '');
            if (!norm || excludeSet.has(norm) || currentBatchSeen.has(norm)) {
              continue;
            }
            currentBatchSeen.add(norm);

            const { amazonUrl, flipkartUrl } = buildUrls(item.title, item.brand, currency);
            const validPrimaryStore = (['amazon', 'flipkart', 'both'].includes(item.primaryStore?.toLowerCase()))
              ? item.primaryStore.toLowerCase()
              : 'both';

            uniqueItems.push({
              id: `gemini_${Date.now()}_${uniqueItems.length}_${Math.random().toString(36).substring(2, 7)}`,
              title: item.title,
              brand: item.brand || 'Popular Brand',
              price: Number(item.price) || 999,
              originalPrice: Number(item.originalPrice) || Math.round((Number(item.price) || 999) * 1.4),
              currency,
              category: item.category || 'Lifestyle',
              rating: Math.min(4.9, Math.max(4.0, Number(item.rating) || 4.4)),
              reviewCount: Number(item.reviewCount) || 15400,
              whyGoodGift: item.whyGoodGift || 'A thoughtful, high-utility gift sure to be appreciated.',
              amazonSearchTerm: `${item.brand || ''} ${item.title}`.trim(),
              flipkartSearchTerm: `${item.brand || ''} ${item.title}`.trim(),
              amazonUrl,
              flipkartUrl,
              primaryStore: validPrimaryStore,
              tags: Array.isArray(item.tags) && item.tags.length ? item.tags : ['Bestseller', 'Trending'],
              createdAt: Date.now(),
            });
          }

          // If we got good unique items, return them
          if (uniqueItems.length >= Math.min(3, count)) {
            return res.json({
              gifts: uniqueItems,
              totalGenerated: uniqueItems.length,
              excludedCount: excludeItems.length,
              source: 'gemini',
            });
          }
        }
      } catch (aiError) {
        console.warn('Gemini API call failed, falling back to curated real store catalog:', aiError);
      }
    }

    // Fallback or no key: Serve deduplicated real store catalog
    const catalogGifts = getDeduplicatedCatalogGifts(
      excludeItems,
      currency,
      count,
      platformPreference
    );

    return res.json({
      gifts: catalogGifts,
      totalGenerated: catalogGifts.length,
      excludedCount: excludeItems.length,
      source: 'catalog',
      disclaimer: !process.env.GEMINI_API_KEY
        ? 'Using curated real Amazon & Flipkart gift catalog. Add GEMINI_API_KEY for infinite dynamic AI recommendations.'
        : undefined,
    });
  } catch (error: any) {
    console.error('Error generating gifts:', error);
    res.status(500).json({
      error: 'Failed to generate gifts',
      message: error.message || 'Internal server error',
    });
  }
});

// Vite Middleware for development vs production static serve
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
