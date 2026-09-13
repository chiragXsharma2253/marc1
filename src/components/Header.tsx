import React from 'react';
import { Gift, Bookmark, Sliders, ExternalLink, RefreshCw } from 'lucide-react';
import { BackendConfig } from '../types';

interface HeaderProps {
  currency: 'INR' | 'USD';
  onCurrencyChange: (c: 'INR' | 'USD') => void;
  shortlistCount: number;
  onOpenShortlist: () => void;
  backendConfig: BackendConfig;
  onOpenBackendConfig: () => void;
  seenCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currency,
  onCurrencyChange,
  shortlistCount,
  onOpenShortlist,
  backendConfig,
  onOpenBackendConfig,
  seenCount,
}) => {
  return (
    <header id="app-header" className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-lg text-stone-900 tracking-tight">Gift Finder</h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-stone-100 text-stone-600 border border-stone-200">
                Flipkart & Amazon Verified
              </span>
            </div>
            <p className="text-xs text-stone-500 hidden md:block">
              Zero-repeat gift discovery engine with direct store search
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Backend Status / Settings Button */}
          <button
            id="backend-settings-button"
            type="button"
            onClick={onOpenBackendConfig}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              backendConfig.sourceType === 'custom'
                ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
            }`}
            title="Configure API backend or local server (http://127.0.0.1:8000)"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Source:</span>
            <span className="font-semibold">
              {backendConfig.sourceType === 'custom' ? 'Local :8000' : 'Integrated AI'}
            </span>
          </button>

          {/* Currency Switcher */}
          <div className="inline-flex rounded-lg border border-stone-200 p-0.5 bg-stone-100 text-xs font-medium">
            <button
              id="currency-inr-button"
              type="button"
              onClick={() => onCurrencyChange('INR')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                currency === 'INR'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              ₹ INR
            </button>
            <button
              id="currency-usd-button"
              type="button"
              onClick={() => onCurrencyChange('USD')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                currency === 'USD'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              $ USD
            </button>
          </div>

          {/* Shortlist Button */}
          <button
            id="open-shortlist-button"
            type="button"
            onClick={onOpenShortlist}
            className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-800 text-xs font-medium hover:bg-stone-50 hover:border-stone-400 transition-colors"
          >
            <Bookmark className="w-4 h-4 text-amber-600" />
            <span className="hidden sm:inline">Shortlist</span>
            {shortlistCount > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-600 text-white">
                {shortlistCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
