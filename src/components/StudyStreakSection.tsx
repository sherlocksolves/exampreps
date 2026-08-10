import React from 'react';
import { Flame, Trophy, Award, Star, Shield, Sparkles } from 'lucide-react';

interface StudyStreakSectionProps {
  streakDays: number;
}

const MILESTONES = [
  { days: 7, label: '7 DAYS', title: 'You built momentum.', icon: <Flame className="w-5 h-5 text-amber-400" /> },
  { days: 14, label: '14 DAYS', title: 'Two weeks of showing up.', icon: <Star className="w-5 h-5 text-amber-400" /> },
  { days: 30, label: '30 DAYS', title: '30 days of unyielding discipline.', icon: <Award className="w-5 h-5 text-amber-400" /> },
  { days: 60, label: '60 DAYS', title: 'This is becoming an elite habit.', icon: <Shield className="w-5 h-5 text-amber-400" /> },
  { days: 100, label: '100 DAYS', title: 'You became the student who does not quit.', icon: <Trophy className="w-5 h-5 text-amber-400" /> }
];

export const StudyStreakSection: React.FC<StudyStreakSectionProps> = ({ streakDays }) => {
  return (
    <section className="py-16 bg-slate-950 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider mb-3">
            <Flame className="w-4 h-4 fill-amber-400" />
            <span>CONSISTENCY ENGINE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
            STREAK OF SHOWING UP
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Every consecutive day spent sitting at this desk compounds your knowledge base.
          </p>
        </div>

        {/* Big Streak Visual Box */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-2xl relative overflow-hidden mb-12">
          
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-center gap-3 text-amber-400 font-black text-6xl sm:text-8xl font-mono tracking-tighter mb-2">
            <Flame className="w-16 h-16 sm:w-24 sm:h-24 fill-amber-400 text-amber-500 animate-pulse" />
            <span>{streakDays}</span>
          </div>

          <div className="text-lg sm:text-xl font-mono font-black text-white tracking-widest uppercase mb-6">
            DAYS OF SHOWING UP
          </div>

          {/* Visual Bar Blocks */}
          <div className="flex items-center justify-center gap-1.5 max-w-md mx-auto mb-6">
            {Array.from({ length: 14 }).map((_, idx) => {
              const active = idx < streakDays;
              return (
                <div
                  key={idx}
                  className={`h-6 flex-1 rounded-md border transition-all ${
                    active
                      ? 'bg-amber-500 border-amber-400 shadow-sm shadow-amber-500/50'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                />
              );
            })}
          </div>

          <p className="text-xs text-slate-400 italic">
            * Keep your streak alive by completing at least 1 focus block daily.
          </p>
        </div>

        {/* Milestone Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {MILESTONES.map((m) => {
            const isUnlocked = streakDays >= m.days;
            return (
              <div
                key={m.days}
                className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                  isUnlocked
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-xl shadow-amber-500/5'
                    : 'bg-slate-900/40 border-slate-800/80 text-slate-500'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-xl border ${isUnlocked ? 'bg-amber-500/20 border-amber-400' : 'bg-slate-950 border-slate-800'}`}>
                      {m.icon}
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                      {m.label}
                    </span>
                  </div>

                  <h3 className={`text-sm font-bold mb-1 ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>
                    {m.label} Milestone
                  </h3>

                  <p className="text-xs italic line-clamp-2">
                    “{m.title}”
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono font-bold">
                  {isUnlocked ? (
                    <span className="text-amber-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> UNLOCKED
                    </span>
                  ) : (
                    <span className="text-slate-600">
                      {m.days - streakDays} days remaining
                    </span>
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
