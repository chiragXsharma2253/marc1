import React, { useState } from 'react';
import { Search, Sparkles, SlidersHorizontal, RotateCcw, Tag } from 'lucide-react';
import { GiftSearchParams } from '../types';

interface GiftSearchFormProps {
  onSearch: (params: Omit<GiftSearchParams, 'excludeItems'>) => void;
  isLoading: boolean;
  currency: 'INR' | 'USD';
}

const RECIPIENTS = [
  'Partner / Spouse',
  'Best Friend',
  'Mother',
  'Father',
  'Brother',
  'Sister',
  'Colleague / Boss',
  'Teenager',
  'Kids / Toddler',
  'Myself',
];

const OCCASIONS = [
  'Birthday',
  'Anniversary',
  'Diwali / Festival',
  'Wedding',
  'Housewarming',
  'Valentine’s Day',
  'Christmas / New Year',
  'Promotion / Career',
  'Thank You / Token',
  'Just Because',
];

const INTEREST_TAGS = [
  'Tech & Gadgets',
  'Fashion & Grooming',
  'Home & Kitchen',
  'Books & Stationery',
  'Fitness & Sports',
  'Gaming',
  'Beauty & Skincare',
  'Gourmet Food & Tea',
  'Travel & Outdoors',
  'Art & Photography',
];

export const GiftSearchForm: React.FC<GiftSearchFormProps> = ({
  onSearch,
  isLoading,
  currency,
}) => {
  const [recipient, setRecipient] = useState('Partner / Spouse');
  const [ageGroup, setAgeGroup] = useState('Young Adult (18-25)');
  const [occasion, setOccasion] = useState('Birthday');
  const [budgetRange, setBudgetRange] = useState(currency === 'INR' ? '₹1,000 - ₹2,500' : '$20 - $50');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Tech & Gadgets', 'Fashion & Grooming']);
  const [personaNotes, setPersonaNotes] = useState('');
  const [platformPreference, setPlatformPreference] = useState<'all' | 'amazon' | 'flipkart'>('all');

  const budgetOptions = currency === 'INR'
    ? ['Under ₹1,000', '₹1,000 - ₹2,500', '₹2,500 - ₹5,000', '₹5,000 - ₹10,000', '₹10,000+']
    : ['Under $20', '$20 - $50', '$50 - $100', '$100 - $200', '$200+'];

  const toggleInterest = (tag: string) => {
    if (selectedInterests.includes(tag)) {
      setSelectedInterests(selectedInterests.filter((t) => t !== tag));
    } else {
      setSelectedInterests([...selectedInterests, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      recipient,
      ageGroup,
      occasion,
      budgetRange,
      currency,
      interests: selectedInterests,
      personaNotes,
      platformPreference,
      count: 8,
    });
  };

  const handleReset = () => {
    setRecipient('Partner / Spouse');
    setOccasion('Birthday');
    setBudgetRange(currency === 'INR' ? '₹1,000 - ₹2,500' : '$20 - $50');
    setSelectedInterests(['Tech & Gadgets']);
    setPersonaNotes('');
    setPlatformPreference('all');
  };

  return (
    <form
      id="gift-search-form"
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-100">
        <div>
          <h2 className="text-base font-semibold text-stone-900 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-amber-600" />
            Gift Criteria & Recipient Profile
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Personalize your search for genuine Flipkart & Amazon products
          </p>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Store selector toggle */}
          <div className="inline-flex rounded-lg border border-stone-200 p-0.5 bg-stone-50 text-xs font-medium">
            <button
              type="button"
              onClick={() => setPlatformPreference('all')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                platformPreference === 'all'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              All Stores
            </button>
            <button
              type="button"
              onClick={() => setPlatformPreference('amazon')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                platformPreference === 'amazon'
                  ? 'bg-amber-100/70 text-amber-900 shadow-xs font-semibold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Amazon
            </button>
            <button
              type="button"
              onClick={() => setPlatformPreference('flipkart')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                platformPreference === 'flipkart'
                  ? 'bg-blue-100/70 text-blue-900 shadow-xs font-semibold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Flipkart
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Recipient */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
            Who is this gift for?
          </label>
          <select
            id="recipient-select"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 bg-stone-50/50 text-stone-800 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none transition-all"
          >
            {RECIPIENTS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Occasion */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
            Occasion
          </label>
          <select
            id="occasion-select"
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 bg-stone-50/50 text-stone-800 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none transition-all"
          >
            {OCCASIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        {/* Budget */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
            Budget Bracket ({currency === 'INR' ? '₹ INR' : '$ USD'})
          </label>
          <select
            id="budget-select"
            value={budgetRange}
            onChange={(e) => setBudgetRange(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 bg-stone-50/50 text-stone-800 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none transition-all"
          >
            {budgetOptions.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Interests & Hobbies Tags */}
      <div>
        <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Interests & Product Categories (Select any)</span>
          <span className="text-[11px] font-normal text-stone-400">
            {selectedInterests.length} selected
          </span>
        </label>
        <div className="flex flex-wrap gap-2">
          {INTEREST_TAGS.map((tag) => {
            const active = selectedInterests.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleInterest(tag)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  active
                    ? 'bg-amber-600 border-amber-600 text-white font-medium shadow-xs'
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100 hover:border-stone-300'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Specific Persona / Additional notes */}
      <div>
        <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
          Extra Context / Specific Hobbies (Optional)
        </label>
        <input
          id="persona-notes-input"
          type="text"
          value={personaNotes}
          onChange={(e) => setPersonaNotes(e.target.value)}
          placeholder="e.g. Loves manual pour-over coffee, minimal desk setup, reads sci-fi books..."
          className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 bg-stone-50/50 text-stone-800 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none transition-all"
        />
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-stone-100">
        <button
          id="reset-form-button"
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 px-3 py-2 rounded-lg hover:bg-stone-100 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Form
        </button>

        <button
          id="search-gifts-button"
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 active:scale-[0.99] disabled:opacity-50 shadow-xs transition-all"
        >
          <Search className="w-4 h-4" />
          {isLoading ? 'Finding Gifts...' : 'Find Verified Gift Ideas'}
        </button>
      </div>
    </form>
  );
};
