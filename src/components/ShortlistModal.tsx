import React, { useState } from 'react';
import { X, Bookmark, ExternalLink, Trash2, Copy, Check, ShoppingBag } from 'lucide-react';
import { GiftItem } from '../types';

interface ShortlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortlist: GiftItem[];
  onRemoveItem: (id: string) => void;
  onClearShortlist: () => void;
  currency: 'INR' | 'USD';
}

export const ShortlistModal: React.FC<ShortlistModalProps> = ({
  isOpen,
  onClose,
  shortlist,
  onRemoveItem,
  onClearShortlist,
  currency,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currencySymbol = currency === 'INR' ? '₹' : '$';
  const totalEstimated = shortlist.reduce((acc, item) => acc + item.price, 0);

  const handleCopyAll = () => {
    if (shortlist.length === 0) return;
    const lines = [
      `🎁 My Gift Shortlist (${shortlist.length} items - Est. Total: ${currencySymbol}${totalEstimated.toLocaleString()}):`,
      '',
      ...shortlist.map(
        (item, i) =>
          `${i + 1}. ${item.title} (${item.brand}) - ${currencySymbol}${item.price.toLocaleString()}\n   Amazon: ${item.amazonUrl}\n   Flipkart: ${item.flipkartUrl}`
      ),
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div
        id="shortlist-modal"
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-600 fill-amber-600" />
            <div>
              <h2 className="text-base font-semibold text-stone-900">Saved Gift Shortlist</h2>
              <p className="text-xs text-stone-500">
                {shortlist.length} items saved • Total: {currencySymbol}
                {totalEstimated.toLocaleString()}
              </p>
            </div>
          </div>
          <button
            id="close-shortlist-modal"
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {shortlist.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
                <Bookmark className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-stone-700">No gifts shortlisted yet</p>
              <p className="text-xs text-stone-400 max-w-xs mx-auto">
                Click the bookmark icon on any gift idea to save it here for comparison.
              </p>
            </div>
          ) : (
            shortlist.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                      {item.brand}
                    </span>
                    <span className="text-xs font-bold text-stone-900">
                      {currencySymbol}{item.price.toLocaleString()}
                    </span>
                  </div>
                  <h4 className="text-xs font-medium text-stone-800 line-clamp-1">{item.title}</h4>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <a
                    href={item.amazonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-[#232F3E] text-[#FF9900] hover:bg-[#131921] transition-colors"
                  >
                    Amazon
                  </a>
                  <a
                    href={item.flipkartUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-[#2874F0] text-white hover:bg-[#1f5ec4] transition-colors"
                  >
                    Flipkart
                  </a>
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1 rounded-md text-stone-400 hover:text-rose-600 hover:bg-stone-100 transition-colors"
                    title="Remove from shortlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {shortlist.length > 0 && (
          <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between gap-3">
            <button
              id="clear-all-shortlist-button"
              type="button"
              onClick={onClearShortlist}
              className="text-xs text-stone-500 hover:text-rose-600 transition-colors"
            >
              Clear All
            </button>

            <button
              id="copy-shortlist-button"
              type="button"
              onClick={handleCopyAll}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied to Clipboard!' : 'Copy List for WhatsApp/Notes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
