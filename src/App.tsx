import React, { useState, useEffect } from 'react';
import {
  Gift,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  ShieldAlert,
  SlidersHorizontal,
  ArrowUpDown,
  Filter,
  Flame,
  Info,
} from 'lucide-react';
import { Header } from './components/Header';
import { GiftSearchForm } from './components/GiftSearchForm';
import { DeduplicationBar } from './components/DeduplicationBar';
import { GiftCard } from './components/GiftCard';
import { ShortlistModal } from './components/ShortlistModal';
import { BackendConfigModal } from './components/BackendConfigModal';
import { GiftItem, GiftSearchParams, BackendConfig } from './types';

const INITIAL_BACKEND_CONFIG: BackendConfig = {
  sourceType: 'integrated',
  customUrl: 'http://127.0.0.1:8000',
  customPath: '/api/gifts',
  status: 'idle',
};

export default function App() {
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Persistent deduplication memory (list of all item titles seen across queries)
  const [seenTitles, setSeenTitles] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('gift_finder_seen_titles');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Saved shortlist items
  const [shortlist, setShortlist] = useState<GiftItem[]>(() => {
    try {
      const saved = localStorage.getItem('gift_finder_shortlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Backend config
  const [backendConfig, setBackendConfig] = useState<BackendConfig>(() => {
    try {
      const saved = localStorage.getItem('gift_finder_backend_config');
      return saved ? JSON.parse(saved) : INITIAL_BACKEND_CONFIG;
    } catch {
      return INITIAL_BACKEND_CONFIG;
    }
  });

  const [isShortlistOpen, setIsShortlistOpen] = useState(false);
  const [isBackendModalOpen, setIsBackendModalOpen] = useState(false);

  // Filter and sorting states for displayed results
  const [storeFilter, setStoreFilter] = useState<'all' | 'amazon' | 'flipkart'>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc' | 'rating'>('recommended');

  // Last active search parameters for "Get More Ideas"
  const [lastSearchParams, setLastSearchParams] = useState<Omit<GiftSearchParams, 'excludeItems'> | null>(null);

  // Sync state to local storage
  useEffect(() => {
    try {
      localStorage.setItem('gift_finder_seen_titles', JSON.stringify(seenTitles));
    } catch (e) {
      console.error(e);
    }
  }, [seenTitles]);

  useEffect(() => {
    try {
      localStorage.setItem('gift_finder_shortlist', JSON.stringify(shortlist));
    } catch (e) {
      console.error(e);
    }
  }, [shortlist]);

  useEffect(() => {
    try {
      localStorage.setItem('gift_finder_backend_config', JSON.stringify(backendConfig));
    } catch (e) {
      console.error(e);
    }
  }, [backendConfig]);

  // Initial load auto-fetch with popular defaults so user sees immediate results
  useEffect(() => {
    if (gifts.length === 0 && !isLoading) {
      handleInitialFetch();
    }
  }, []);

  const handleInitialFetch = () => {
    const defaultParams: Omit<GiftSearchParams, 'excludeItems'> = {
      recipient: 'Partner / Spouse',
      ageGroup: 'Adult (26-45)',
      occasion: 'Birthday',
      budgetRange: currency === 'INR' ? '₹1,000 - ₹2,500' : '$20 - $50',
      currency,
      interests: ['Tech & Gadgets', 'Fashion & Grooming'],
      personaNotes: '',
      platformPreference: 'all',
      count: 8,
    };
    executeFetch(defaultParams, false);
  };

  const executeFetch = async (
    params: Omit<GiftSearchParams, 'excludeItems'>,
    isAppending: boolean = false
  ) => {
    if (isAppending) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }
    setErrorMessage(null);

    // Current exclusions: all previously seen titles
    const payload: GiftSearchParams = {
      ...params,
      currency,
      excludeItems: seenTitles,
      count: isAppending ? 6 : 8,
    };

    try {
      let resultGifts: GiftItem[] = [];

      if (backendConfig.sourceType === 'custom') {
        // User requested custom backend (e.g. http://127.0.0.1:8000)
        try {
          const customFullUrl = `${backendConfig.customUrl.replace(/\/$/, '')}${
            backendConfig.customPath.startsWith('/')
              ? backendConfig.customPath
              : `/${backendConfig.customPath}`
          }`;

          const res = await fetch(customFullUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          if (!res.ok) {
            throw new Error(`Custom server responded with status ${res.status}`);
          }
          const data = await res.json();
          resultGifts = Array.isArray(data) ? data : data.gifts || [];
        } catch (customErr: any) {
          console.warn('Custom backend failed, falling back to integrated engine:', customErr);
          setErrorMessage(
            `Could not reach ${backendConfig.customUrl} (${customErr.message}). Temporarily using integrated store engine.`
          );
          // Fallback to integrated endpoint
          const res = await fetch('/api/gifts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          const data = await res.json();
          resultGifts = data.gifts || [];
        }
      } else {
        // Integrated engine
        const res = await fetch('/api/gifts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          throw new Error('Failed to fetch gifts from integrated engine');
        }
        const data = await res.json();
        resultGifts = data.gifts || [];
      }

      // Deduplicate received gifts strictly against seenTitles
      const seenSet = new Set(seenTitles.map((t) => t.toLowerCase().trim()));
      const strictlyNewGifts = resultGifts.filter(
        (g) => !seenSet.has((g.title || '').toLowerCase().trim())
      );

      // Record newly seen titles
      const newTitles = strictlyNewGifts.map((g) => g.title);
      setSeenTitles((prev) => Array.from(new Set([...prev, ...newTitles])));

      if (isAppending) {
        if (strictlyNewGifts.length === 0) {
          setErrorMessage('All catalog items for this narrow criteria have been explored! Try changing budget or resetting history.');
        } else {
          setGifts((prev) => [...prev, ...strictlyNewGifts]);
        }
      } else {
        setGifts(strictlyNewGifts);
      }

      setLastSearchParams(params);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'An unexpected error occurred while fetching gift ideas.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleSearch = (params: Omit<GiftSearchParams, 'excludeItems'>) => {
    executeFetch(params, false);
  };

  const handleGetMoreIdeas = () => {
    if (lastSearchParams) {
      executeFetch(lastSearchParams, true);
    } else {
      handleInitialFetch();
    }
  };

  const handleClearHistory = () => {
    setSeenTitles([]);
    if (lastSearchParams) {
      executeFetch(lastSearchParams, false);
    }
  };

  const handleToggleShortlist = (gift: GiftItem) => {
    setShortlist((prev) => {
      const exists = prev.some((item) => item.id === gift.id);
      if (exists) {
        return prev.filter((item) => item.id !== gift.id);
      }
      return [...prev, gift];
    });
  };

  const handleRemoveShortlistItem = (id: string) => {
    setShortlist((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearShortlist = () => {
    setShortlist([]);
  };

  // Quick preset search handler
  const handleQuickPreset = (preset: {
    recipient: string;
    occasion: string;
    budget: string;
    interests: string[];
  }) => {
    const params: Omit<GiftSearchParams, 'excludeItems'> = {
      recipient: preset.recipient,
      ageGroup: 'Adult (26-45)',
      occasion: preset.occasion,
      budgetRange: preset.budget,
      currency,
      interests: preset.interests,
      personaNotes: '',
      platformPreference: 'all',
      count: 8,
    };
    executeFetch(params, false);
  };

  // Filter and sort gifts for render
  const filteredGifts = gifts.filter((gift) => {
    if (storeFilter === 'all') return true;
    if (storeFilter === 'amazon') return gift.primaryStore === 'amazon' || gift.primaryStore === 'both';
    if (storeFilter === 'flipkart') return gift.primaryStore === 'flipkart' || gift.primaryStore === 'both';
    return true;
  });

  const sortedGifts = [...filteredGifts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0; // recommended
  });

  return (
    <div className="min-h-screen bg-stone-50/50 text-stone-900 flex flex-col antialiased selection:bg-amber-100 selection:text-amber-900">
      <Header
        currency={currency}
        onCurrencyChange={(newCurr) => {
          setCurrency(newCurr);
          if (lastSearchParams) {
            executeFetch({ ...lastSearchParams, currency: newCurr }, false);
          }
        }}
        shortlistCount={shortlist.length}
        onOpenShortlist={() => setIsShortlistOpen(true)}
        backendConfig={backendConfig}
        onOpenBackendConfig={() => setIsBackendModalOpen(true)}
        seenCount={seenTitles.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Quick presets banner */}
        <div className="bg-gradient-to-r from-amber-500/10 via-stone-100 to-blue-500/10 rounded-2xl p-4 sm:p-5 border border-stone-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" />
                Popular Quick Inspirations
              </span>
              <h2 className="text-sm font-semibold text-stone-900">
                Explore real products currently trending on Flipkart & Amazon
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  handleQuickPreset({
                    recipient: 'Partner / Spouse',
                    occasion: 'Anniversary',
                    budget: currency === 'INR' ? '₹2,500 - ₹5,000' : '$50 - $100',
                    interests: ['Tech & Gadgets', 'Watches & Jewelry'],
                  })
                }
                className="text-xs px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-amber-400 font-medium transition-colors shadow-2xs"
              >
                Watches & Luxury
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickPreset({
                    recipient: 'Best Friend',
                    occasion: 'Birthday',
                    budget: currency === 'INR' ? '₹1,000 - ₹2,500' : '$20 - $50',
                    interests: ['Tech & Gadgets', 'Audio & Music'],
                  })
                }
                className="text-xs px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-amber-400 font-medium transition-colors shadow-2xs"
              >
                Wireless Audio & Gear
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickPreset({
                    recipient: 'Brother',
                    occasion: 'Festival / Diwali',
                    budget: currency === 'INR' ? 'Under ₹1,000' : 'Under $20',
                    interests: ['Fashion & Grooming'],
                  })
                }
                className="text-xs px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-amber-400 font-medium transition-colors shadow-2xs"
              >
                Grooming Essentials
              </button>
            </div>
          </div>
        </div>

        {/* Search Criteria Form */}
        <GiftSearchForm
          onSearch={handleSearch}
          isLoading={isLoading}
          currency={currency}
        />

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Notice</p>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Deduplication Status Bar */}
        {gifts.length > 0 && (
          <DeduplicationBar
            currentCount={gifts.length}
            excludedCount={seenTitles.length - gifts.length}
            totalUniqueSeen={seenTitles.length}
            onGetMoreIdeas={handleGetMoreIdeas}
            onClearHistory={handleClearHistory}
            isLoadingMore={isLoadingMore}
          />
        )}

        {/* Results Controls: Filtering and Sorting */}
        {gifts.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 font-medium">Filter Store:</span>
              <div className="inline-flex rounded-lg border border-stone-200 p-0.5 bg-white text-xs">
                <button
                  type="button"
                  onClick={() => setStoreFilter('all')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    storeFilter === 'all'
                      ? 'bg-stone-900 text-white font-medium shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  All ({gifts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStoreFilter('amazon')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    storeFilter === 'amazon'
                      ? 'bg-[#232F3E] text-[#FF9900] font-medium shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Amazon
                </button>
                <button
                  type="button"
                  onClick={() => setStoreFilter('flipkart')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    storeFilter === 'flipkart'
                      ? 'bg-[#2874F0] text-white font-medium shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Flipkart
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
              <label htmlFor="sort-by-select" className="text-xs text-stone-500 font-medium">Sort By:</label>
              <select
                id="sort-by-select"
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="text-xs bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-stone-700 outline-none focus:border-amber-500"
              >
                <option value="recommended">Best Match / Recommended</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Customer Rating</option>
              </select>
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3 animate-pulse"
              >
                <div className="flex justify-between">
                  <div className="h-4 bg-stone-200 rounded w-16" />
                  <div className="h-4 bg-stone-200 rounded w-12" />
                </div>
                <div className="h-10 bg-stone-200 rounded w-full" />
                <div className="h-4 bg-stone-200 rounded w-24" />
                <div className="h-6 bg-stone-200 rounded w-20" />
                <div className="h-16 bg-stone-100 rounded w-full" />
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="h-8 bg-stone-200 rounded" />
                  <div className="h-8 bg-stone-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Gift Cards Grid */}
        {!isLoading && sortedGifts.length > 0 && (
          <div
            id="gifts-grid"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5"
          >
            {sortedGifts.map((gift) => (
              <GiftCard
                key={gift.id}
                gift={gift}
                isShortlisted={shortlist.some((item) => item.id === gift.id)}
                onToggleShortlist={handleToggleShortlist}
                currency={currency}
              />
            ))}
          </div>
        )}

        {/* Empty State after filtering */}
        {!isLoading && sortedGifts.length === 0 && gifts.length > 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 p-8">
            <p className="text-sm font-semibold text-stone-800">No items match this store filter</p>
            <p className="text-xs text-stone-500 mt-1">Switch to "All" to view all available gift recommendations.</p>
            <button
              type="button"
              onClick={() => setStoreFilter('all')}
              className="mt-3 px-4 py-1.5 text-xs font-semibold rounded-lg bg-stone-900 text-white"
            >
              Show All Stores
            </button>
          </div>
        )}

        {/* Bottom "Give Me More Ideas" action bar */}
        {!isLoading && gifts.length > 0 && (
          <div className="text-center py-6 border-t border-stone-200 space-y-2">
            <p className="text-xs text-stone-500">
              Want more varieties? The engine will find brand new, non-repeated products.
            </p>
            <button
              id="bottom-get-more-ideas"
              type="button"
              onClick={handleGetMoreIdeas}
              disabled={isLoadingMore}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 text-white font-semibold text-sm hover:bg-amber-700 active:scale-[0.99] disabled:opacity-50 shadow-xs transition-all"
            >
              <Sparkles className="w-4 h-4" />
              {isLoadingMore ? 'Fetching Non-Repeated Gifts...' : 'Load 6 More Unique Gift Ideas'}
            </button>
          </div>
        )}
      </main>

      {/* Shortlist Modal */}
      <ShortlistModal
        isOpen={isShortlistOpen}
        onClose={() => setIsShortlistOpen(false)}
        shortlist={shortlist}
        onRemoveItem={handleRemoveShortlistItem}
        onClearShortlist={handleClearShortlist}
        currency={currency}
      />

      {/* Backend / Source Configuration Modal */}
      <BackendConfigModal
        isOpen={isBackendModalOpen}
        onClose={() => setIsBackendModalOpen(false)}
        config={backendConfig}
        onSaveConfig={(updated) => setBackendConfig(updated)}
      />

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-4 mt-auto text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Gift Finder • Powered by Flipkart & Amazon Catalog Verification</span>
          <span className="text-stone-400">Strict Deduplication Engine • Zero repeats guaranteed</span>
        </div>
      </footer>
    </div>
  );
}
