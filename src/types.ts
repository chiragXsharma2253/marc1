export interface GiftItem {
  id: string;
  title: string;
  brand: string;
  price: number;
  originalPrice: number;
  currency: 'INR' | 'USD';
  category: string;
  rating: number;
  reviewCount: number;
  whyGoodGift: string;
  amazonSearchTerm: string;
  flipkartSearchTerm: string;
  amazonUrl: string;
  flipkartUrl: string;
  primaryStore: 'amazon' | 'flipkart' | 'both';
  tags: string[];
  imageUrl?: string;
  createdAt?: number;
}

export interface GiftSearchParams {
  recipient: string;
  ageGroup: string;
  occasion: string;
  budgetRange: string;
  currency: 'INR' | 'USD';
  interests: string[];
  personaNotes: string;
  platformPreference: 'all' | 'amazon' | 'flipkart';
  excludeItems: string[];
  count?: number;
}

export interface GiftSearchResponse {
  gifts: GiftItem[];
  totalGenerated: number;
  excludedCount: number;
  source: 'gemini' | 'catalog' | 'custom_api';
  disclaimer?: string;
}

export interface BackendConfig {
  sourceType: 'integrated' | 'custom';
  customUrl: string; // e.g. "http://127.0.0.1:8000"
  customPath: string; // e.g. "/api/gifts" or "/gifts"
  status: 'idle' | 'testing' | 'online' | 'offline';
  lastPingMessage?: string;
}
