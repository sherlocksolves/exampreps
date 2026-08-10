import React from 'react';
import { Calendar, CheckCircle2, AlertCircle, Target, ArrowRight, Zap, BookOpen } from 'lucide-react';
import { Exam } from '../types';
import { calculateTimeRemaining } from '../lib/quoteSystem';

interface ExamCardsSectionProps {
  exams: Exam[];
  targetExamId?: string;
  onSelectTargetExam: (examId: string) => void;
  onFocusOnExam: (exam: Exam) => void;
}

export const ExamCardsSection: React.FC<ExamCardsSectionProps> = ({
  exams,
  targetExamId,
  onSelectTargetExam,
  onFocusOnExam
}) => {
  return (
    <section id="exams-section" className="py-20 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.3em] text-orange-400 uppercase mb-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>TIMELINE & COUNTDOWNS</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight uppercase font-sans">
              UPCOMING TARGET EXAMS
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md">
            Track official dates and intelligent expected windows based on historical exam authority schedules.
          </p>
        </div>

        {/* Exam Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => {
            const isTarget = exam.id === targetExamId;
            const remaining = calculateTimeRemaining(exam.target_date);
            const dateObj = new Date(exam.target_date);
            const formattedDate = dateObj.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            return (
              <div
                key={exam.id}
                className={`relative flex flex-col justify-between p-6 rounded-3xl glass transition-all duration-300 ${
                  isTarget
                    ? 'border-orange-500/60 ring-1 ring-orange-500/30 shadow-2xl shadow-orange-500/10'
                    : 'hover:border-white/20'
                }`}
              >
                {/* Card Header Badge */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="px-3 py-1 rounded-full glass text-slate-300 text-[10px] font-mono font-bold tracking-widest uppercase">
                      {exam.category}
                    </span>

                    {/* Official vs Expected badge */}
                    {exam.is_official ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> OFFICIAL
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-orange-300 bg-orange-500/10 border border-orange-500/30 px-2.5 py-0.5 rounded-full">
                        <AlertCircle className="w-3 h-3" /> EXPECTED DATE
                      </span>
                    )}
                  </div>

                  {/* Exam Title */}
                  <h3 className="text-lg font-bold text-white mb-2 leading-snug">
                    {exam.name}
                  </h3>

                  {/* Target Date string */}
                  <div className="text-xs text-slate-400 font-mono mb-4 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-orange-400" />
                    <span>Target Date: <strong className="text-slate-200">{formattedDate}</strong></span>
                  </div>

                  {/* Countdown Big Display */}
                  <div className="my-5 p-4 rounded-2xl glass text-center border border-white/5">
                    <div className="text-4xl font-black font-mono text-white tracking-tight glow-orange">
                      {remaining.days} <span className="text-xs text-orange-400 font-sans uppercase tracking-widest font-bold">DAYS LEFT</span>
                    </div>
                    <div className="text-xs font-mono text-slate-400 mt-2 flex items-center justify-center gap-2">
                      <span>{String(remaining.hours).padStart(2, '0')}h</span> :
                      <span>{String(remaining.minutes).padStart(2, '0')}m</span> :
                      <span className="text-orange-400">{String(remaining.seconds).padStart(2, '0')}s</span>
                    </div>
                  </div>

                  {/* Expected Note */}
                  {exam.expected_note && (
                    <p className="text-xs text-slate-400 italic mb-3">
                      * {exam.expected_note}
                    </p>
                  )}

                  {/* Target Score Goal */}
                  {exam.target_score && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-orange-300 bg-orange-500/10 px-3 py-1.5 rounded-full border border-orange-500/20 mb-4">
                      <Target className="w-3.5 h-3.5 text-orange-400" />
                      <span>Goal: {exam.target_score}</span>
                    </div>
                  )}

                  {/* Syllabus Tips */}
                  {exam.syllabus_tips && exam.syllabus_tips.length > 0 && (
                    <div className="space-y-1 mb-6 text-xs text-slate-300">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">
                        Key Prep Tips:
                      </span>
                      {exam.syllabus_tips.map((tip, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-slate-300">
                          <BookOpen className="w-3 h-3 text-orange-400 flex-shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Action Controls */}
                <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                  <button
                    onClick={() => onSelectTargetExam(exam.id)}
                    className={`flex-1 py-2.5 px-3 rounded-full text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isTarget
                        ? 'bg-white text-black font-extrabold shadow-md'
                        : 'glass text-slate-300 hover:text-white'
                    }`}
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>{isTarget ? 'TARGET EXAM' : 'SET TARGET'}</span>
                  </button>

                  <button
                    onClick={() => onFocusOnExam(exam)}
                    className="py-2.5 px-4 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300 text-xs font-bold tracking-widest transition-all flex items-center justify-center gap-1 cursor-pointer hover:bg-orange-500/30"
                    title="Start Focus Session for this exam"
                  >
                    <Zap className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                    <span>FOCUS</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
