import React from 'react';
import { Flame, Clock, Play, Sparkles, Trophy, ArrowUpRight } from 'lucide-react';
import { getTimeOfDayGreeting } from '../lib/quoteSystem';

interface MotivationalSectionProps {
  completedMinutesToday: number;
  dailyTargetHours: number;
  streakDays: number;
  onStartFocusSession: () => void;
}

export const MotivationalSection: React.FC<MotivationalSectionProps> = ({
  completedMinutesToday,
  dailyTargetHours,
  streakDays,
  onStartFocusSession
}) => {
  const timeInfo = getTimeOfDayGreeting();
  const completedHours = (completedMinutesToday / 60).toFixed(1);
  const targetMinutes = dailyTargetHours * 60;
  const progressPercent = Math.min(100, Math.round((completedMinutesToday / targetMinutes) * 100));

  return (
    <section className="py-16 bg-slate-950 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Banner */}
        <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8 sm:p-12 shadow-2xl">
          
          {/* Subtle Ambient Background Accent */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Dynamic Time-based Greeting */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{timeInfo.badge}</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight uppercase">
                {timeInfo.greeting}
              </h2>

              <p className="text-base sm:text-lg text-slate-300 font-serif italic max-w-xl leading-relaxed">
                “{timeInfo.message}”
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <button
                  onClick={onStartFocusSession}
                  className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs tracking-wider uppercase shadow-lg shadow-amber-500/20 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>START TODAY'S FIRST SESSION</span>
                </button>
              </div>
            </div>

            {/* Right Column: Daily Progress Card */}
            <div className="lg:col-span-5 bg-slate-950/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400 uppercase">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>TODAY'S STUDY GOAL</span>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/30">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{streakDays} DAY STREAK</span>
                </div>
              </div>

              {/* Progress Numbers */}
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl sm:text-4xl font-black font-mono text-white">
                    {completedHours}h <span className="text-sm text-slate-400 font-normal">({completedMinutesToday}m)</span>
                  </span>
                  <span className="text-sm font-mono text-slate-400">
                    TARGET: <strong className="text-amber-400">{dailyTargetHours} HOURS</strong>
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-700 shadow-md shadow-amber-500/50"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-1">
                  <span>{progressPercent}% Completed</span>
                  <span>{Math.max(0, targetMinutes - completedMinutesToday)}m remaining</span>
                </div>
              </div>

              {/* Emotional encouragement note */}
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
                <Trophy className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>
                  {progressPercent >= 100
                    ? '🎉 Goal crushed for today! Rest well or aim for extra revision.'
                    : 'Consistency over intensity. One 45-minute block gets you 25% closer.'}
                </span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
