import React, { useState, useEffect } from 'react';
import { Play, Calendar, Zap, Sparkles, BookOpen, Clock, Target } from 'lucide-react';
import { Exam, StudyVibe } from '../types';
import { calculateTimeRemaining, getCountdownMotivationContext } from '../lib/quoteSystem';

interface HeroSectionProps {
  targetExam: Exam | null;
  currentVibe: StudyVibe | null;
  onStartFocus: () => void;
  onViewExams: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  targetExam,
  currentVibe,
  onStartFocus,
  onViewExams
}) => {
  const [timeLeft, setTimeLeft] = useState(() => 
    targetExam ? calculateTimeRemaining(targetExam.target_date) : { days: 0, hours: 0, minutes: 0, seconds: 0, totalDays: 0, isPassed: false }
  );

  useEffect(() => {
    if (!targetExam) return;
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeRemaining(targetExam.target_date));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetExam]);

  const motivationContext = getCountdownMotivationContext(timeLeft.days);

  const bgImage = currentVibe?.image_url || 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2000&q=80';
  const overlayStrength = currentVibe?.overlay_strength || 0.6;

  return (
    <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden border-b border-white/5 py-16 sm:py-24">
      
      {/* Background Image with Cinematic Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={bgImage}
          alt={currentVibe?.title || 'Study Sanctuary Background'}
          className="w-full h-full object-cover object-center scale-105 transition-all duration-1000 ease-out filter brightness-[0.75] contrast-[1.1]"
        />
        <div 
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px]"
          style={{ opacity: overlayStrength + 0.1 }}
        />
        <div className="absolute inset-0 vignette pointer-events-none" />
        <div className="absolute inset-0 lamp-glow pointer-events-none" />
      </div>

      {/* Hero Content Overlay */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center flex flex-col items-center justify-center">
        
        {/* Eyebrow Badge */}
        <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.3em] sm:tracking-[0.4em] uppercase text-orange-400/90 mb-4 animate-fade-in">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
          <span>YOUR FUTURE IS BEING BUILT RIGHT NOW</span>
        </div>

        {/* Exam Title */}
        <div className="space-y-3 mb-6 max-w-3xl">
          <div className="flex items-center justify-center gap-2 text-xs font-mono tracking-widest uppercase text-slate-400">
            <Target className="w-3.5 h-3.5 text-orange-400" />
            <span>{targetExam?.category || 'TARGET'} EXAM</span>
            {targetExam?.is_official ? (
              <span className="px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded">OFFICIAL DATE</span>
            ) : (
              <span className="px-2 py-0.5 text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">EXPECTED DATE</span>
            )}
          </div>

          <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-widest uppercase border-y border-white/10 py-3 px-6 sm:px-12 text-white font-sans inline-block">
            {targetExam?.name || 'JEE MAIN 2027 — SESSION 1'}
          </h1>
        </div>

        {/* Big Days Countdown Display with Orange Glow */}
        <div className="my-6 relative flex flex-col items-center">
          <div className="absolute -inset-10 bg-orange-500/10 blur-[80px] rounded-full pointer-events-none"></div>
          <div className="relative flex flex-col items-center">
            <span className="text-8xl sm:text-[130px] font-black leading-none tracking-tighter text-white glow-orange font-sans">
              {String(timeLeft.days).padStart(2, '0')}
            </span>
            <span className="text-xs sm:text-sm uppercase tracking-[0.8em] sm:tracking-[1em] opacity-50 text-slate-300 mt-1 ml-2 font-mono">
              DAYS REMAINING
            </span>
          </div>
        </div>

        {/* HH : MM : SS Countdown */}
        <div className="flex items-center gap-6 sm:gap-12 font-mono text-2xl sm:text-3xl opacity-90 my-6 glass px-8 py-3 rounded-full border border-white/10">
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-sans tracking-widest opacity-40 mb-0.5">Hours</span>
            <span>{String(timeLeft.hours).padStart(2, '0')}</span>
          </div>
          <div className="opacity-30 text-orange-400 animate-pulse">:</div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-sans tracking-widest opacity-40 mb-0.5">Mins</span>
            <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
          </div>
          <div className="opacity-30 text-orange-400 animate-pulse">:</div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-sans tracking-widest opacity-40 mb-0.5">Secs</span>
            <span className="text-orange-400">{String(timeLeft.seconds).padStart(2, '0')}</span>
          </div>
        </div>

        {/* Context Motivational Quote */}
        <blockquote className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 italic font-serif leading-relaxed mb-8 px-6 py-3 glass rounded-2xl border-l-2 border-orange-500">
          “{motivationContext}”
        </blockquote>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
          <button
            onClick={onStartFocus}
            className="w-full sm:w-auto bg-white text-black px-10 py-4 rounded-full font-bold text-xs uppercase tracking-widest hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-2xl shadow-orange-500/10 cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-black text-black" />
            <span>START FOCUS MODE</span>
          </button>

          <button
            onClick={onViewExams}
            className="w-full sm:w-auto glass px-10 py-4 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-orange-400" />
            <span>VIEW EXAMS</span>
          </button>
        </div>

        {/* Current Vibe Source Badge */}
        {currentVibe && (
          <div className="mt-8 text-[10px] font-mono tracking-widest uppercase text-slate-400 flex items-center gap-2 glass px-4 py-1.5 rounded-full">
            <BookOpen className="w-3 h-3 text-orange-400" />
            <span>Atmosphere: {currentVibe.title}</span>
            {currentVibe.photographer && (
              <span className="opacity-50">· Photo by {currentVibe.photographer}</span>
            )}
          </div>
        )}

      </div>
    </section>
  );
};
