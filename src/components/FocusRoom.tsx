import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  X, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Maximize2, 
  Minimize2, 
  CheckCircle2, 
  Flame, 
  Zap, 
  Lock, 
  BookOpen, 
  ChevronRight,
  Music,
  Target,
  Calendar,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Exam, StudyVibe, AmbientTrack, MotivationalQuote, AmbientCategory } from '../types';
import { getRandomQuote } from '../lib/quoteSystem';

interface FocusRoomProps {
  targetExam: Exam | null;
  currentVibe: StudyVibe | null;
  ambientTracks: AmbientTrack[];
  quotes: MotivationalQuote[];
  activeAudioCategory: AmbientCategory;
  onSelectAudioCategory: (category: AmbientCategory) => void;
  audioVolume: number;
  onSetAudioVolume: (vol: number) => void;
  isAudioPlaying: boolean;
  onToggleAudio: () => void;
  onCloseFocusRoom: () => void;
  onSaveCompletedSession: (minutes: number, rating?: 'excellent' | 'good' | 'average' | 'difficult', task?: string, note?: string) => void;
}

export const FocusRoom: React.FC<FocusRoomProps> = ({
  targetExam,
  currentVibe,
  ambientTracks,
  quotes,
  activeAudioCategory,
  onSelectAudioCategory,
  audioVolume,
  onSetAudioVolume,
  isAudioPlaying,
  onToggleAudio,
  onCloseFocusRoom,
  onSaveCompletedSession
}) => {
  // Timer States
  const [selectedDuration, setSelectedDuration] = useState<number>(45); // default 45 mins
  const [secondsLeft, setSecondsLeft] = useState<number>(45 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [taskName, setTaskName] = useState<string>(() => {
    if (targetExam?.syllabus_tips && targetExam.syllabus_tips.length > 0) {
      return `${targetExam.name} — ${targetExam.syllabus_tips[0]}`;
    }
    return 'Physics & Mathematics Preparation';
  });
  
  // Target Exam Live Countdown State
  const [examTimeLeft, setExamTimeLeft] = useState(() => {
    if (!targetExam?.target_date) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    const diff = new Date(targetExam.target_date).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / 1000 / 60) % 60),
      seconds: Math.floor((diff / 1000) % 60)
    };
  });

  // Auto start sound on focus room open if sound isn't playing
  useEffect(() => {
    if (!isAudioPlaying && activeAudioCategory !== 'silent') {
      onToggleAudio();
    }
  }, []);

  // Update target exam countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      if (!targetExam?.target_date) return;
      const diff = new Date(targetExam.target_date).getTime() - Date.now();
      if (diff <= 0) {
        setExamTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setExamTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60)
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [targetExam]);

  // Animation state (3..2..1.. FOCUS!)
  const [countdownStartNum, setCountdownStartNum] = useState<number | null>(null);
  
  // Deep Focus Screen Lock State
  const [deepFocusMode, setDeepFocusMode] = useState<boolean>(false);
  
  // Session Completed state
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [sessionRating, setSessionRating] = useState<'excellent' | 'good' | 'average' | 'difficult'>('good');
  const [accomplishmentNote, setAccomplishmentNote] = useState<string>('');

  // Floating audio menu open
  const [audioMenuOpen, setAudioMenuOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Rotating quote
  const [currentQuote, setCurrentQuote] = useState<MotivationalQuote>(() => getRandomQuote(quotes, 'focus'));

  const bgImage = currentVibe?.image_url || 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2000&q=80';

  // Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && secondsLeft === 0) {
      setIsRunning(false);
      setIsCompleted(true);
      
      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        console.warn('Confetti error:', err);
      }
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, secondsLeft]);

  // Rotate quote every 5 minutes
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setCurrentQuote(getRandomQuote(quotes, 'focus'));
    }, 5 * 60 * 1000);
    return () => clearInterval(quoteInterval);
  }, [quotes]);

  // Start sequence trigger
  const handleStartTimerClick = () => {
    if (isRunning) {
      setIsRunning(false);
      return;
    }

    if (secondsLeft === 0) {
      setSecondsLeft(selectedDuration * 60);
    }

    // Run 3..2..1 countdown animation
    setCountdownStartNum(3);
    const countdownTimer = setInterval(() => {
      setCountdownStartNum((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownTimer);
          setIsRunning(true);
          return null;
        }
        return prev - 1;
      });
    }, 800);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setSecondsLeft(selectedDuration * 60);
    setIsCompleted(false);
  };

  const handleDurationSelect = (mins: number) => {
    if (isRunning) return;
    setSelectedDuration(mins);
    setSecondsLeft(mins * 60);
  };

  const handleFinishAndSaveSession = () => {
    onSaveCompletedSession(selectedDuration, sessionRating, taskName, accomplishmentNote);
    setIsCompleted(false);
    setSecondsLeft(selectedDuration * 60);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between overflow-hidden animate-fade-in font-sans">
      
      {/* Background Cinematic Visual */}
      <div className="absolute inset-0 z-0">
        <img
          src={bgImage}
          alt="Focus Room Atmosphere"
          className={`w-full h-full object-cover transition-all duration-1000 filter ${
            isCompleted ? 'brightness-90 contrast-105 blur-none' : 'brightness-50 contrast-125 blur-[1px]'
          }`}
        />
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" />
      </div>

      {/* 3..2..1 FOCUS overlay animation */}
      {countdownStartNum !== null && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl animate-fade-in">
          <div className="text-center space-y-4">
            <span className="text-8xl sm:text-9xl font-black font-mono text-amber-400 animate-ping">
              {countdownStartNum}
            </span>
            <div className="text-2xl font-black tracking-widest text-white uppercase font-mono">
              GET READY TO FOCUS
            </div>
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="relative z-20 p-4 sm:p-6 flex items-center justify-between border-b border-slate-800/60 bg-slate-950/60 backdrop-blur-md">
        
        {/* Left: Focus Badge & Deep Focus Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Zap className="w-4 h-4 fill-amber-400" />
            <span>FOCUS SANCTUARY</span>
          </div>

          <button
            onClick={() => setDeepFocusMode(!deepFocusMode)}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-mono font-bold transition-all ${
              deepFocusMode
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{deepFocusMode ? '🔥 DEEP FOCUS ON' : 'DEEP FOCUS OFF'}</span>
          </button>
        </div>

        {/* Right: Actions (Fullscreen & Exit) */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-all"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onCloseFocusRoom}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-mono font-bold transition-all"
          >
            <X className="w-4 h-4" />
            <span>EXIT ROOM</span>
          </button>
        </div>
      </div>

      {/* Main Focus Room Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-3xl mx-auto w-full text-center">
        
        {/* SESSION COMPLETED VIEW */}
        {isCompleted ? (
          <div className="space-y-6 bg-slate-950/90 border border-amber-500/40 p-8 sm:p-10 rounded-3xl backdrop-blur-2xl shadow-2xl animate-fade-in w-full">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-mono font-bold text-amber-400 tracking-widest uppercase block mb-1">
                EXCELLENT DISCIPLINE
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
                SESSION COMPLETE
              </h2>
              <div className="text-5xl font-black font-mono text-amber-400 my-3">
                +{selectedDuration} MINUTES
              </div>
              <p className="text-base text-slate-300 font-serif italic max-w-md mx-auto">
                “You showed up today. That is what builds extraordinary results.”
              </p>
            </div>

            {/* Reflection Check-in */}
            <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3 text-left">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block font-mono">
                HOW DID THAT SESSION GO?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'excellent', label: '🔥 Excellent' },
                  { id: 'good', label: '🙂 Good' },
                  { id: 'average', label: '😐 Average' },
                  { id: 'difficult', label: '😓 Difficult' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSessionRating(item.id as any)}
                    className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                      sessionRating === item.id
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="What did you accomplish in this session? (optional)"
                value={accomplishmentNote}
                onChange={(e) => setAccomplishmentNote(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Finish Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={handleFinishAndSaveSession}
                className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20"
              >
                SAVE & START ANOTHER SESSION
              </button>
              <button
                onClick={() => {
                  handleFinishAndSaveSession();
                  onCloseFocusRoom();
                }}
                className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs uppercase"
              >
                RETURN TO DASHBOARD
              </button>
            </div>
          </div>
        ) : (
          /* ACTIVE FOCUS TIMER VIEW */
          <div className="space-y-8 w-full">
            
            {/* Selected Target Exam Banner */}
            {targetExam && (
              <div className="max-w-xl mx-auto p-4 rounded-2xl bg-slate-950/90 border border-amber-500/30 backdrop-blur-md shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                      <span>TARGET EXAM</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block animate-ping" />
                    </div>
                    <div className="text-sm sm:text-base font-black text-white uppercase tracking-tight">
                      {targetExam.name}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/90 px-3.5 py-2 rounded-xl border border-slate-800 font-mono text-center sm:text-right shrink-0 w-full sm:w-auto">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">COUNTDOWN TO EXAM</div>
                  <div className="text-xs sm:text-sm font-black text-amber-300">
                    {examTimeLeft.days}d {examTimeLeft.hours}h {examTimeLeft.minutes}m {examTimeLeft.seconds}s
                  </div>
                </div>
              </div>
            )}

            {/* Task Title Input */}
            <div className="space-y-2 max-w-lg mx-auto">
              <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                CURRENT STUDY TASK
              </label>
              <input
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                disabled={isRunning}
                className="w-full bg-slate-950/80 border border-slate-800/80 rounded-2xl px-4 py-3 text-center text-sm font-bold text-amber-300 placeholder-slate-600 focus:outline-none focus:border-amber-500/60 transition-all shadow-inner"
                placeholder="e.g. Physics — Rotational Motion & Calculus"
              />
            </div>

            {/* Giant Timer Display */}
            <div className="my-6">
              <div className="text-7xl sm:text-9xl font-black font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-amber-200 drop-shadow-[0_10px_30px_rgba(0,0,0,0.9)]">
                {formatTimer(secondsLeft)}
              </div>
            </div>

            {/* Duration Selector Pills */}
            {!isRunning && (
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-md mx-auto">
                {[15, 25, 45, 60, 90].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => handleDurationSelect(mins)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all ${
                      selectedDuration === mins
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 scale-105'
                        : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            )}

            {/* Timer Controls */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                onClick={handleStartTimerClick}
                className={`px-10 py-4 rounded-2xl font-black text-sm tracking-wider uppercase transition-all flex items-center gap-3 shadow-xl ${
                  isRunning
                    ? 'bg-rose-500/20 border border-rose-500/50 text-rose-300 hover:bg-rose-500/30'
                    : 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 shadow-amber-500/25 hover:scale-105'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5 fill-rose-300" />
                    <span>PAUSE TIMER</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-slate-950" />
                    <span>BEGIN FOCUS</span>
                  </>
                )}
              </button>

              <button
                onClick={handleResetTimer}
                className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all"
                title="Reset Timer"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>

            {/* Rotating Motivational Quote */}
            <div className="pt-6 max-w-xl mx-auto">
              <p className="text-xs sm:text-sm text-slate-300 italic font-serif leading-relaxed bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 backdrop-blur-md">
                “{currentQuote.text}”
              </p>
            </div>

          </div>
        )}

      </div>

      {/* Floating Minimal Ambient Audio Controls Footer */}
      <div className="relative z-20 p-4 sm:p-6 border-t border-slate-800/60 bg-slate-950/80 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Audio Info */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleAudio}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              isAudioPlaying
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            {isAudioPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          <div className="text-left">
            <div className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <Music className="w-3 h-3" />
              <span>STUDY ATMOSPHERE: {activeAudioCategory.toUpperCase()}</span>
            </div>
            <div className="text-xs text-slate-400">
              {isAudioPlaying ? 'Playing seamless loop' : 'Audio paused — press to start ambience'}
            </div>
          </div>
        </div>

        {/* Volume Slider & Sound Selector Trigger */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* Slider */}
          <div className="flex items-center gap-2 flex-1 sm:w-36">
            <VolumeX className="w-3.5 h-3.5 text-slate-500" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={audioVolume}
              onChange={(e) => onSetAudioVolume(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <Volume2 className="w-3.5 h-3.5 text-slate-400" />
          </div>

          {/* Sound Category Menu Trigger */}
          <button
            onClick={() => setAudioMenuOpen(!audioMenuOpen)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-slate-300 hover:text-white transition-all flex items-center gap-1"
          >
            <span>CHANGE SOUND</span>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${audioMenuOpen ? 'rotate-90' : ''}`} />
          </button>
        </div>

        {/* Floating Sound Category Picker Dropdown */}
        {audioMenuOpen && (
          <div className="absolute bottom-20 right-4 sm:right-6 w-64 bg-slate-950 border border-slate-800 p-3 rounded-2xl shadow-2xl space-y-1.5 z-50 text-left animate-fade-in">
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase px-2 mb-1">
              SELECT SOUNDSCAPE
            </div>
            {ambientTracks.map((track) => (
              <button
                key={track.id}
                onClick={() => {
                  onSelectAudioCategory(track.category);
                  setAudioMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-all ${
                  activeAudioCategory === track.category
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <span>{track.title}</span>
                {activeAudioCategory === track.category && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
              </button>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};
