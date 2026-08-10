import React from 'react';
import { Image, Sparkles, Check, ExternalLink } from 'lucide-react';
import { StudyVibe } from '../types';

interface StudyVibeGalleryProps {
  vibes: StudyVibe[];
  selectedVibeId: string;
  onSelectVibe: (vibe: StudyVibe) => void;
}

export const StudyVibeGallery: React.FC<StudyVibeGalleryProps> = ({
  vibes,
  selectedVibeId,
  onSelectVibe
}) => {
  return (
    <section className="py-16 bg-slate-950 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 tracking-wider uppercase mb-2">
              <Image className="w-4 h-4" />
              <span>VISUAL ENVIRONMENT GALLERY</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase">
              STUDY VIBE COLLECTION
            </h2>
          </div>
          <p className="text-sm text-slate-400 max-w-md">
            All photography is dynamically managed and categorized. Click any atmosphere to set as your primary active theme.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vibes.map((vibe) => {
            const isSelected = vibe.id === selectedVibeId;
            return (
              <div
                key={vibe.id}
                onClick={() => onSelectVibe(vibe)}
                className={`group relative rounded-2xl overflow-hidden border cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                  isSelected
                    ? 'border-amber-400 ring-2 ring-amber-400/30 scale-[1.02] bg-slate-900/90 shadow-xl shadow-amber-500/10'
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                }`}
              >
                {/* Image */}
                <div className="h-48 w-full relative overflow-hidden">
                  <img
                    src={vibe.image_url}
                    alt={vibe.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 filter brightness-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  
                  {isSelected && (
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                      <Check className="w-3.5 h-3.5" /> ACTIVE VIBE
                    </div>
                  )}

                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[10px] font-mono font-bold text-slate-200 uppercase">
                    {vibe.category}
                  </div>
                </div>

                {/* Info */}
                <div className="p-5 space-y-2">
                  <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                    {vibe.title}
                  </h3>
                  <p className="text-xs text-slate-400 italic line-clamp-2">
                    “{vibe.quote_text || 'Deep focus in a quiet sanctuary.'}”
                  </p>

                  {/* Credit System */}
                  {vibe.photographer && (
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span>Photo: {vibe.photographer}</span>
                      {vibe.source_name && (
                        <span className="flex items-center gap-0.5 hover:text-slate-300">
                          {vibe.source_name} <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
