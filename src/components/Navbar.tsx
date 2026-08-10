import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Flame, 
  Clock, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Compass, 
  Menu, 
  X,
  Target,
  MessageCircle,
  Instagram
} from 'lucide-react';
import { Exam, AmbientCategory } from '../types';

const WHATSAPP_URL = 'https://chat.whatsapp.com/LBGnz1tsfPg3EG87QiL5Xg';
const INSTAGRAM_URL = 'https://www.instagram.com/viratanand.7';

interface NavbarProps {
  exams: Exam[];
  targetExam: Exam | null;
  onSelectTargetExam: (examId: string) => void;
  onOpenFocusRoom: () => void;
  onOpenAdmin: () => void;
  streakDays: number;
  currentAudioCategory: AmbientCategory;
  onToggleAudio: () => void;
  isAudioPlaying: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  exams,
  targetExam,
  onSelectTargetExam,
  onOpenFocusRoom,
  onOpenAdmin,
  streakDays,
  currentAudioCategory,
  onToggleAudio,
  isAudioPlaying
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full glass border-b border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse glow-orange"></div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold tracking-[0.3em] uppercase opacity-90 text-white font-sans">
                EXAM<span className="text-orange-400">//</span>COUNTDOWN
              </span>
            </div>
          </a>

          {/* Managed by PeaceGhost Spotlight Pill */}
          <a
            href="https://peaceghosts.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-amber-500/30 text-amber-400 hover:text-amber-300 text-[10px] font-mono font-bold tracking-wider hover:border-amber-400 transition-all shadow-[0_0_15px_rgba(245,158,11,0.15)]"
          >
            <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>MANAGED BY PEACEGHOST</span>
          </a>

          {/* Streak Indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full glass border border-orange-500/30 text-orange-400 text-[11px] font-semibold tracking-wider">
            <Flame className="w-3.5 h-3.5 fill-orange-400 text-orange-500 animate-pulse" />
            <span>{streakDays} DAY STREAK</span>
          </div>
        </div>

        {/* Desktop Quick Tools */}
        <div className="hidden lg:flex items-center gap-3">
          
          {/* Target Exam Dropdown */}
          <div className="flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs text-slate-300">
            <Target className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-slate-400 font-medium">TARGET:</span>
            <select
              value={targetExam?.id || ''}
              onChange={(e) => onSelectTargetExam(e.target.value)}
              className="bg-transparent text-white font-semibold cursor-pointer focus:outline-none"
            >
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id} className="bg-slate-900 text-white">
                  {ex.name}
                </option>
              ))}
            </select>
          </div>

          {/* Live Clock */}
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300 glass px-4 py-1.5 rounded-full">
            <Clock className="w-3.5 h-3.5 text-orange-400" />
            <span>{timeStr || '00:00:00'}</span>
          </div>

          {/* Ambience Quick Audio Toggle */}
          <button
            onClick={onToggleAudio}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-all cursor-pointer ${
              isAudioPlaying
                ? 'bg-orange-500/20 border border-orange-500/40 text-orange-300'
                : 'glass text-slate-400 hover:text-white'
            }`}
            title="Toggle Ambient Audio"
          >
            {isAudioPlaying ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
                <span className="uppercase font-mono text-[11px]">{currentAudioCategory}</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span>SOUND OFF</span>
              </>
            )}
          </button>

          {/* Start Focus Button */}
          <button
            onClick={onOpenFocusRoom}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-white text-black font-bold text-xs tracking-widest uppercase hover:scale-105 transition-all cursor-pointer shadow-lg"
          >
            <Compass className="w-3.5 h-3.5 fill-black text-black" />
            <span>FOCUS ROOM</span>
          </button>

          {/* Admin Panel Button */}
          <button
            onClick={onOpenAdmin}
            className="p-2 rounded-full glass text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Admin Control Panel"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>

          {/* Contact Us: WhatsApp + Instagram */}
          <div className="flex items-center gap-1.5 pl-1 border-l border-white/10 ml-1">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contact us on WhatsApp"
              className="p-2 rounded-full glass text-slate-400 hover:text-emerald-400 transition-all cursor-pointer"
              title="Contact us on WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow us on Instagram"
              className="p-2 rounded-full glass text-slate-400 hover:text-pink-400 transition-all cursor-pointer"
              title="Follow us on Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={onOpenFocusRoom}
            className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-black text-xs tracking-wider uppercase shadow-md shadow-amber-500/20"
          >
            FOCUS
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-slate-950/95 backdrop-blur-2xl px-4 pt-3 pb-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400">LOCAL TIME:</span>
            <span className="font-bold text-amber-400">{timeStr}</span>
          </div>

          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              TARGET EXAM
            </label>
            <select
              value={targetExam?.id || ''}
              onChange={(e) => {
                onSelectTargetExam(e.target.value);
                setMobileMenuOpen(false);
              }}
              className="w-full bg-slate-950 text-white font-semibold text-xs border border-slate-800 rounded-md p-2 focus:outline-none"
            >
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onToggleAudio();
              }}
              className="flex-1 py-2.5 px-3 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 flex items-center justify-center gap-2"
            >
              {isAudioPlaying ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
              <span>{isAudioPlaying ? `AUDIO: ${currentAudioCategory.toUpperCase()}` : 'ENABLE AMBIENCE'}</span>
            </button>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contact us on WhatsApp"
              className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400"
              title="WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </a>

            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow us on Instagram"
              className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-pink-400"
              title="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400"
              title="Admin"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
