import React, { useState } from 'react';
import { Quote as QuoteIcon, Sparkles, RefreshCw, Bookmark } from 'lucide-react';
import { MotivationalQuote, QuoteCategory } from '../types';
import { getRandomQuote } from '../lib/quoteSystem';

interface TodayQuoteSectionProps {
  quotes: MotivationalQuote[];
}

export const TodayQuoteSection: React.FC<TodayQuoteSectionProps> = ({ quotes }) => {
  const featuredQuote = quotes.find(q => q.is_featured) || quotes[0] || {
    id: 'f1',
    text: 'KNOW THE DATE. USE THE TIME. BUILD THE RESULT.',
    author: 'PeaceGhost Study System',
    category: 'discipline'
  };

  const [activeCategory, setActiveCategory] = useState<QuoteCategory>('discipline');
  const [currentBrowseQuote, setCurrentBrowseQuote] = useState<MotivationalQuote>(() => 
    getRandomQuote(quotes, 'discipline')
  );

  const handleCategoryChange = (cat: QuoteCategory) => {
    setActiveCategory(cat);
    setCurrentBrowseQuote(getRandomQuote(quotes, cat));
  };

  const handleShuffleQuote = () => {
    setCurrentBrowseQuote(getRandomQuote(quotes, activeCategory));
  };

  return (
    <section className="py-16 bg-slate-950 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Featured Quote Block */}
        <div className="relative rounded-3xl bg-slate-900/80 border border-slate-800 p-8 sm:p-14 text-center max-w-4xl mx-auto shadow-2xl overflow-hidden mb-12">
          
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-6">
            <QuoteIcon className="w-6 h-6" />
          </div>

          <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest mb-3 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>TODAY'S FEATURED MESSAGE</span>
          </div>

          <blockquote className="text-2xl sm:text-4xl font-extrabold text-white font-serif leading-snug mb-6 max-w-3xl mx-auto">
            “{featuredQuote.text}”
          </blockquote>

          <cite className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest not-italic">
            — {featuredQuote.author.toUpperCase()}
          </cite>
        </div>

        {/* Quote Explorer by Category */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/40 border border-slate-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-amber-400" />
                <span>STUDY WISDOM VAULT</span>
              </h3>
              <p className="text-xs text-slate-400">
                Browse 150+ curated study quotes across specialized categories.
              </p>
            </div>

            <button
              onClick={handleShuffleQuote}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono font-bold text-amber-400 flex items-center gap-2 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>SHUFFLE QUOTE</span>
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-slate-800 mb-6">
            {[
              'discipline',
              'focus',
              'consistency',
              'comeback',
              'JEE',
              'NEET',
              'NDA',
              'late_night',
              'morning',
              'exam_pressure'
            ].map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat as QuoteCategory)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-amber-500 text-slate-950 border border-amber-400'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Active Category Quote Display */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 text-center">
            <p className="text-lg sm:text-xl font-serif italic text-slate-200 mb-3">
              “{currentBrowseQuote.text}”
            </p>
            <span className="text-xs font-mono font-bold text-amber-400">
              — {currentBrowseQuote.author}
            </span>
          </div>

        </div>

      </div>
    </section>
  );
};
