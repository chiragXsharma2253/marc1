import React from 'react';
import { Sparkles, ShieldCheck, RefreshCw, Trash2, PlusCircle, Layers } from 'lucide-react';

interface DeduplicationBarProps {
  currentCount: number;
  excludedCount: number;
  onGetMoreIdeas: () => void;
  onClearHistory: () => void;
  isLoadingMore: boolean;
  totalUniqueSeen: number;
}

export const DeduplicationBar: React.FC<DeduplicationBarProps> = ({
  currentCount,
  excludedCount,
  onGetMoreIdeas,
  onClearHistory,
  isLoadingMore,
  totalUniqueSeen,
}) => {
  return (
    <div
      id="deduplication-bar"
      className="bg-stone-900 text-stone-100 rounded-2xl p-4 sm:p-5 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-stone-800"
    >
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            Strict Deduplication Active
          </span>
          <span className="text-xs text-stone-400">
            Guaranteed no repeats across Amazon & Flipkart
          </span>
        </div>
        <p className="text-sm font-medium text-stone-200">
          Showing <span className="text-amber-400 font-bold">{currentCount} unique gift ideas</span> on screen{' '}
          <span className="text-stone-400 font-normal">
            ({totalUniqueSeen} total unique products tracked in session)
          </span>
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
        <button
          id="get-more-ideas-button"
          type="button"
          onClick={onGetMoreIdeas}
          disabled={isLoadingMore}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-semibold text-xs hover:bg-amber-400 active:scale-[0.99] disabled:opacity-50 shadow-sm transition-all flex-1 md:flex-initial"
        >
          {isLoadingMore ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Fetching Fresh Items...
            </>
          ) : (
            <>
              <PlusCircle className="w-4 h-4" />
              Give Me More Ideas (+6 Unique)
            </>
          )}
        </button>

        {totalUniqueSeen > 0 && (
          <button
            id="clear-dedup-history-button"
            type="button"
            onClick={onClearHistory}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium border border-stone-700 transition-colors"
            title="Clear deduplication memory if you want to allow past recommendations again"
          >
            <Trash2 className="w-3.5 h-3.5 text-stone-400" />
            Reset History ({totalUniqueSeen})
          </button>
        )}
      </div>
    </div>
  );
};
