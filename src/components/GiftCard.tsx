import React, { useState } from 'react';
import {
  Star,
  ExternalLink,
  Bookmark,
  Share2,
  Check,
  Tag,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { GiftItem } from '../types';

interface GiftCardProps {
  gift: GiftItem;
  isShortlisted: boolean;
  onToggleShortlist: (gift: GiftItem) => void;
  currency: 'INR' | 'USD';
}

export const GiftCard: React.FC<GiftCardProps> = ({
  gift,
  isShortlisted,
  onToggleShortlist,
  currency,
}) => {
  const [copied, setCopied] = useState(false);

  const discountPercent =
    gift.originalPrice > gift.price
      ? Math.round(((gift.originalPrice - gift.price) / gift.originalPrice) * 100)
      : null;

  const handleCopy = () => {
    const text = `${gift.title} (${gift.brand})\nPrice: ${currency === 'INR' ? '₹' : '$'}${gift.price.toLocaleString()}\nAmazon: ${gift.amazonUrl}\nFlipkart: ${gift.flipkartUrl}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currencySymbol = currency === 'INR' ? '₹' : '$';

  return (
    <div
      id={`gift-card-${gift.id}`}
      className="group bg-white rounded-2xl border border-stone-200 hover:border-stone-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden"
    >
      {/* Top Details & Header */}
      <div className="p-5 space-y-3.5">
        {/* Category, Brand, and Shortlist button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/50">
              {gift.brand}
            </span>
            <span className="text-[11px] font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
              {gift.category}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              title="Copy gift details"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              id={`shortlist-btn-${gift.id}`}
              type="button"
              onClick={() => onToggleShortlist(gift)}
              className={`p-1.5 rounded-lg transition-colors ${
                isShortlisted
                  ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                  : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
              }`}
              title={isShortlisted ? 'Remove from Shortlist' : 'Add to Shortlist'}
            >
              <Bookmark className={`w-4 h-4 ${isShortlisted ? 'fill-amber-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-stone-900 text-sm leading-snug line-clamp-2 group-hover:text-amber-800 transition-colors">
          {gift.title}
        </h3>

        {/* Ratings and Reviews */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1 font-semibold text-stone-800 bg-stone-100 px-2 py-0.5 rounded-md">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{gift.rating.toFixed(1)}</span>
          </div>
          <span className="text-stone-400">
            ({gift.reviewCount ? gift.reviewCount.toLocaleString() : '5,000+'} reviews on stores)
          </span>
        </div>

        {/* Price Section */}
        <div className="flex items-baseline gap-2 pt-1">
          <span className="text-lg font-bold text-stone-900 tracking-tight">
            {currencySymbol}{gift.price.toLocaleString()}
          </span>
          {gift.originalPrice > gift.price && (
            <span className="text-xs text-stone-400 line-through">
              {currencySymbol}{gift.originalPrice.toLocaleString()}
            </span>
          )}
          {discountPercent && discountPercent > 0 && (
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Why it makes a great gift */}
        <div className="rounded-xl bg-stone-50 border border-stone-200/70 p-3 text-xs text-stone-600 space-y-1">
          <div className="flex items-center gap-1 font-semibold text-stone-800 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Why It's a Great Gift
          </div>
          <p className="leading-relaxed">{gift.whyGoodGift}</p>
        </div>

        {/* Tags */}
        {gift.tags && gift.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {gift.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-medium text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Direct Store Action Buttons */}
      <div className="p-4 bg-stone-50/70 border-t border-stone-100 grid grid-cols-2 gap-2">
        {/* Amazon Button */}
        <a
          id={`buy-amazon-${gift.id}`}
          href={gift.amazonUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#232F3E] text-[#FF9900] hover:bg-[#131921] transition-colors shadow-2xs text-center"
          title="Search and view this verified product on Amazon"
        >
          <span>Amazon</span>
          <ExternalLink className="w-3 h-3 text-white/70" />
        </a>

        {/* Flipkart Button */}
        <a
          id={`buy-flipkart-${gift.id}`}
          href={gift.flipkartUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#2874F0] text-white hover:bg-[#1f5ec4] transition-colors shadow-2xs text-center"
          title="Search and view this verified product on Flipkart"
        >
          <span>Flipkart</span>
          <ExternalLink className="w-3 h-3 text-white/70" />
        </a>
      </div>
    </div>
  );
};
