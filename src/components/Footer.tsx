import React from 'react';
import { Sparkles, ExternalLink, Heart, Shield, MessageCircle, Instagram } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-center space-y-6">
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-lg font-black tracking-widest text-white font-mono">
            EXAM<span className="text-amber-400">//</span>COUNTDOWN
          </span>
        </div>

        {/* Motto */}
        <div className="text-sm font-mono font-bold tracking-widest text-slate-300 uppercase">
          KNOW THE DATE. USE THE TIME. BUILD THE RESULT.
        </div>

        <p className="text-xs text-slate-500 max-w-md">
          A cinematic digital study sanctuary engineered for ambitious students striving for rank excellence across national entrance exams.
        </p>

        {/* Contact Us */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">
            CONTACT US
          </span>
          <div className="flex items-center gap-3">
            
              href="https://chat.whatsapp.com/LBGnz1tsfPg3EG87QiL5Xg"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contact us on WhatsApp"
              className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 flex items-center justify-center transition-all duration-300"
            >
              <MessageCircle className="w-4.5 h-4.5" />
            </a>
            
              href="https://www.instagram.com/viratanand.7"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow us on Instagram"
              className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 hover:border-pink-500/50 hover:bg-pink-500/10 text-slate-400 hover:text-pink-400 flex items-center justify-center transition-all duration-300"
            >
              <Instagram className="w-4.5 h-4.5" />
            </a>
          </div>
        </div>

        {/* PeaceGhost Branding Spotlight */}
        <div className="pt-6 border-t border-slate-900 w-full max-w-lg flex flex-col items-center justify-center gap-3">
          
          
            href="https://peaceghosts.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-900/90 border border-amber-500/40 hover:border-amber-400 text-amber-300 font-mono font-bold text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(245,158,11,0.25)] hover:shadow-[0_0_35px_rgba(245,158,11,0.45)] transition-all duration-300 scale-100 hover:scale-105"
          >
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">OFFICIAL SYSTEM ARCHITECT</span>
              <span className="text-xs font-black text-white group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                MANAGED BY PEACEGHOST
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              </span>
            </div>
          </a>

          <span className="text-[11px] font-mono text-slate-600">
            © {new Date().getFullYear()} EXAM//COUNTDOWN STUDY SANCTUARY
          </span>
        </div>

      </div>
    </footer>
  );
};
