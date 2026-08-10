import React from 'react';
import { Calendar, CheckCircle2, AlertCircle, Target, ArrowRight } from 'lucide-react';
import { Exam } from '../types';
import { calculateTimeRemaining } from '../lib/quoteSystem';

interface ExamSelectorProps {
  exams: Exam[];
  onSelectExam: (examId: string) => void;
}

export const ExamSelector: React.FC<ExamSelectorProps> = ({ exams, onSelectExam }) => {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden py-16 sm:py-24">
      <div className="absolute inset-0 formula-bg opacity-20 pointer-events-none" />
      <div className="absolute inset-0 lamp-glow pointer-events-none" />
      <div className="absolute inset-0 vignette pointer-events-none" />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.3em] uppercase text-orange-400 mb-4">
            <Target className="w-4 h-4" />
            <span>PERSONALIZE YOUR EXAM COUNTDOWN</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white uppercase">
            What are you preparing for?
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Select your exam to make it your personal target. EXAMPREP will show its countdown,
            preparation focus, and study tools around your goal.
          </p>
        </div>

        {exams.length === 0 ? (
          <div className="glass rounded-3xl border border-white/10 p-8 text-center text-slate-400">
            No exams are currently available. Please check back soon.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {exams.map((exam) => {
              const remaining = calculateTimeRemaining(exam.target_date);
              const dateObj = new Date(exam.target_date);
              const formattedDate = dateObj.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <button
                  key={exam.id}
                  type="button"
                  onClick={() => onSelectExam(exam.id)}
                  className="group text-left glass rounded-3xl border border-white/10 hover:border-orange-500/50 hover:bg-white/[0.06] p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-500/10 cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2 mb-5">
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[10px] font-mono font-bold tracking-widest uppercase">
                      {exam.category}
                    </span>

                    {exam.is_official ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        OFFICIAL
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-orange-300">
                        <AlertCircle className="w-3.5 h-3.5" />
                        EXPECTED
                      </span>
                    )}
                  </div>

                  <h2 className="text-lg sm:text-xl font-extrabold text-white leading-snug mb-3 group-hover:text-orange-200 transition-colors">
                    {exam.name}
                  </h2>

                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mb-5">
                    <Calendar className="w-3.5 h-3.5 text-orange-400" />
                    <span>{formattedDate}</span>
                  </div>

                  <div className="flex items-end justify-between gap-4 pt-4 border-t border-white/5">
                    <div>
                      <div className="text-2xl sm:text-3xl font-black text-white font-mono glow-orange">
                        {remaining.days}
                      </div>
                      <div className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-bold">
                        days remaining
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-black text-[10px] font-black tracking-widest uppercase group-hover:bg-orange-400 transition-colors">
                      Select
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <p className="text-center text-[10px] sm:text-xs text-slate-600 font-mono mt-8">
          You can change your target exam anytime from the navigation bar.
        </p>
      </div>
    </section>
  );
};
