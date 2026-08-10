import React from 'react';
import { Sparkles, CloudRain, Moon, BookOpen, Sun, Coffee, Zap, Atom, Calculator, Award } from 'lucide-react';
import { StudyVibe, VibeCategory } from '../types';

interface StudyVibeCarouselProps {
  vibes: StudyVibe[];
  selectedVibeId: string;
  onSelectVibe: (vibe: StudyVibe) => void;
}

const CATEGORY_ICONS: Record<VibeCategory, React.ReactNode> = {
  rain: <CloudRain className="w-4 h-4 text-cyan-400" />,
  night: <Moon className="w-4 h-4 text-indigo-400" />,
  library: <BookOpen className="w-4 h-4 text-amber-400" />,
  morning: <Sun className="w-4 h-4 text-yellow-400" />,
  cafe: <Coffee className="w-4 h-4 text-amber-600" />,
  forest: <Sparkles className="w-4 h-4 text-emerald-400" />,
  ocean: <Zap className="w-4 h-4 text-blue-400" />,
  science: <Atom className="w-4 h-4 text-purple-400" />,
  math: <Calculator className="w-4 h-4 text-rose-400" />,
  exam: <Award className="w-4 h-4 text-red-400" />
};

export const StudyVibeCarousel: React.FC<StudyVibeCarouselProps> = ({
  vibes,
  selectedVibeId,
  onSelectVibe
}) => {
  const activeVibes = vibes.filter(v => v.is_active).sort((a, b) => a.display_order - b.display_order);

  return (
    <section className="py-8 bg-slate-950/90 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>DYNAMIC ATMOSPHERES</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
              SELECT STUDY VIBE
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-sm">
            Choose an environment to set the background imagery, lighting, and ambient audio rhythm.
          </p>
        </div>

        {/* Horizontal Scrollable Carousel */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 pt-1 scrollbar-thin scrollbar-thumb-slate-800">
          {activeVibes.map((vibe) => {
            const isSelected = vibe.id === selectedVibeId;
            return (
              <button
                key={vibe.id}
                onClick={() => onSelectVibe(vibe)}
                className={`flex-shrink-0 relative group rounded-2xl overflow-hidden border transition-all duration-300 w-52 sm:w-60 text-left cursor-pointer ${
                  isSelected
                    ? 'border-amber-400 ring-2 ring-amber-400/30 scale-[1.02] shadow-xl shadow-amber-500/10'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-900/60'
                }`}
              >
                {/* Background Image Preview */}
                <div className="h-28 w-full relative overflow-hidden">
                  <img
                    src={vibe.image_url}
                    alt={vibe.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 filter brightness-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  
                  {/* Category Pill */}
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md border border-slate-800 flex items-center gap-1.5 text-[10px] font-mono font-bold text-slate-200">
                    {CATEGORY_ICONS[vibe.category] || <Sparkles className="w-3 h-3 text-amber-400" />}
                    <span className="uppercase">{vibe.category}</span>
                  </div>

                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md">
                      ACTIVE
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-3 bg-slate-950/90 border-t border-slate-800/80 flex flex-col justify-between h-20">
                  <h3 className="text-xs font-bold text-white line-clamp-1 group-hover:text-amber-300 transition-colors">
                    {vibe.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 italic line-clamp-2">
                    “{vibe.quote_text || 'Deep focus and quiet determination.'}”
                  </p>
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
};
