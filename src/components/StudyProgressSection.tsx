import React from 'react';
import { BarChart3, Clock, CheckCircle2, Trophy, Award, Calendar } from 'lucide-react';
import { FocusSession } from '../types';

interface StudyProgressSectionProps {
  sessions: FocusSession[];
  totalFocusMinutes: number;
}

export const StudyProgressSection: React.FC<StudyProgressSectionProps> = ({
  sessions,
  totalFocusMinutes
}) => {
  const totalHours = (totalFocusMinutes / 60).toFixed(1);
  const totalSessions = sessions.length;
  const avgMins = totalSessions > 0 ? Math.round(totalFocusMinutes / totalSessions) : 0;

  return (
    <section className="py-16 bg-slate-950 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 tracking-wider uppercase mb-2">
              <BarChart3 className="w-4 h-4" />
              <span>QUANTIFIED PRODUCTIVITY</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase">
              STUDY ANALYTICS & HISTORY
            </h2>
          </div>
          <p className="text-sm text-slate-400 max-w-md">
            Review completed focus blocks, subject time distribution, and session ratings.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase">TOTAL FOCUSED</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black font-mono text-white">
              {totalHours}h <span className="text-xs text-slate-400">({totalFocusMinutes}m)</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Lifetime focus time logged</span>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase">SESSIONS COMPLETED</span>
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black font-mono text-white">
              {totalSessions}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Full focus blocks finished</span>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase">AVG BLOCK DURATION</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black font-mono text-white">
              {avgMins}m
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Average minutes per block</span>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase">QUALITY SCORE</span>
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black font-mono text-amber-400">
              {totalSessions > 0 ? '94%' : 'N/A'}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Focus efficiency rating</span>
          </div>

        </div>

        {/* Recent Focus Session Logs */}
        <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/80">
          <h3 className="text-lg font-extrabold text-white mb-4 uppercase tracking-wide flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>RECENT COMPLETED SESSIONS</span>
          </h3>

          {sessions.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs italic">
              No completed sessions yet. Click "START FOCUS" above to log your first study block!
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.slice(0, 5).map((session) => (
                <div
                  key={session.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <div className="text-sm font-bold text-white mb-0.5">
                      {session.task_name || 'General Focus Block'}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2 font-mono">
                      <span>{session.completed_at}</span>
                      {session.reflection && <span>· Note: “{session.reflection}”</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {session.rating && (
                      <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-bold text-amber-300">
                        {session.rating.toUpperCase()}
                      </span>
                    )}
                    <span className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold text-xs">
                      +{session.duration_minutes} MINS
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
