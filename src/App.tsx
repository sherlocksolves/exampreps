import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { StudyVibeCarousel } from './components/StudyVibeCarousel';
import { ExamCardsSection } from './components/ExamCardsSection';
import { ExamSelector } from './components/ExamSelector';
import { MotivationalSection } from './components/MotivationalSection';
import { FocusRoom } from './components/FocusRoom';
import { StudyProgressSection } from './components/StudyProgressSection';
import { StudyStreakSection } from './components/StudyStreakSection';
import { TodayQuoteSection } from './components/TodayQuoteSection';
import { StudyVibeGallery } from './components/StudyVibeGallery';
import { FeedbackSection } from './components/FeedbackSection';
import { AdminPanel } from './components/AdminPanel';
import { Footer } from './components/Footer';

import { 
  Exam, 
  StudyVibe, 
  AmbientTrack, 
  MotivationalQuote, 
  FocusSession, 
  JournalEntry, 
  AmbientCategory 
} from './types';
import { 
  INITIAL_EXAMS, 
  INITIAL_STUDY_VIBES, 
  INITIAL_AMBIENT_TRACKS, 
  INITIAL_QUOTES 
} from './data/initialData';
import { studyAudioEngine } from './lib/audioSynthesizer';
import { fetchExams, fetchQuotes, fetchVibes, fetchAmbientTracks } from './lib/api';
import { isSupabaseConfigured } from './lib/supabase';

// Local storage key constants
// NOTE: exams / study vibes / ambient tracks / quotes are admin-managed
// content that now lives in Supabase (see src/lib/api.ts) — they are no
// longer persisted to localStorage. Focus sessions, the study journal, the
// user's exam/vibe selection, and streak count are personal, anonymous,
// device-local preferences (this site has no end-user account system), so
// they intentionally remain in localStorage.
const STORAGE_KEYS = {
  SESSIONS: 'exam_countdown_sessions_v2',
  JOURNAL: 'exam_countdown_journal_v2',
  TARGET_EXAM_ID: 'exam_countdown_target_id_v3',
  SELECTED_VIBE_ID: 'exam_countdown_selected_vibe_v2',
  STREAK_DAYS: 'exam_countdown_streak_days_v2',
  LAST_STUDIED_DATE: 'exam_countdown_last_studied_date_v2'
};

export default function App() {
  // Admin-managed content — loaded from Supabase. Initial data is used only
  // as an instant-paint placeholder while the real fetch is in flight, and
  // as a last-resort fallback if the backend is unreachable.
  const [exams, setExams] = useState<Exam[]>(INITIAL_EXAMS);
  const [vibes, setVibes] = useState<StudyVibe[]>(INITIAL_STUDY_VIBES);
  const [ambientTracks, setAmbientTracks] = useState<AmbientTrack[]>(INITIAL_AMBIENT_TRACKS);
  const [quotes, setQuotes] = useState<MotivationalQuote[]>(INITIAL_QUOTES);

  const [contentLoading, setContentLoading] = useState<boolean>(true);
  const [contentError, setContentError] = useState<string>('');

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setContentError('Backend is not configured. Showing local sample content only.');
      setContentLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const [examsData, quotesData, vibesData, tracksData] = await Promise.all([
          fetchExams(),
          fetchQuotes(),
          fetchVibes(),
          fetchAmbientTracks()
        ]);
        if (cancelled) return;
        if (examsData.length) setExams(examsData);
        if (quotesData.length) setQuotes(quotesData);
        if (vibesData.length) setVibes(vibesData);
        if (tracksData.length) setAmbientTracks(tracksData);
      } catch (err) {
        if (!cancelled) {
          setContentError('Could not reach the backend — showing local sample content instead.');
          // eslint-disable-next-line no-console
          console.error('Failed to load site content from Supabase:', err);
        }
      } finally {
        if (!cancelled) setContentLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const [sessions, setSessions] = useState<FocusSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.JOURNAL);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // User Target Exam selection
  const [targetExamId, setTargetExamId] = useState<string>(() => {
    // No default exam: first-time visitors choose their own exam.
    const saved = localStorage.getItem(STORAGE_KEYS.TARGET_EXAM_ID);
    return saved || '';
  });

  // User Vibe Selection
  const [selectedVibeId, setSelectedVibeId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SELECTED_VIBE_ID);
    return saved || 'vibe-rainy-night';
  });

  // Streak Days
  // A new visitor starts at 0. Existing users keep a real streak if they have
  // a recorded study date; the old hard-coded 6-day placeholder is reset.
  const [streakDays, setStreakDays] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STREAK_DAYS);
    const lastStudied = localStorage.getItem(STORAGE_KEYS.LAST_STUDIED_DATE);
    if (!lastStudied) return 0;
    const parsed = saved ? parseInt(saved, 10) : 0;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  });

  // Audio State — Nature/forest is the default ambience.
  const [activeAudioCategory, setActiveAudioCategory] = useState<AmbientCategory>('forest');
  const [audioVolume, setAudioVolume] = useState<number>(0.5);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);

  // Modals & Focus Room
  const [focusRoomOpen, setFocusRoomOpen] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(journalEntries));
  }, [journalEntries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TARGET_EXAM_ID, targetExamId);
  }, [targetExamId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_VIBE_ID, selectedVibeId);
  }, [selectedVibeId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STREAK_DAYS, streakDays.toString());
  }, [streakDays]);

  // Audio Engine Sync
  useEffect(() => {
    studyAudioEngine.setVolume(audioVolume);
  }, [audioVolume]);

  const handleToggleAudio = async () => {
    if (isAudioPlaying) {
      studyAudioEngine.stopAll();
      setIsAudioPlaying(false);
    } else {
      const activeTrack = ambientTracks.find(t => t.category === activeAudioCategory);
      await studyAudioEngine.playCategory(activeAudioCategory, activeTrack?.audio_url);
      setIsAudioPlaying(true);
    }
  };

  const handleSelectAudioCategory = async (category: AmbientCategory) => {
    setActiveAudioCategory(category);
    if (category === 'silent') {
      studyAudioEngine.stopAll();
      setIsAudioPlaying(false);
    } else {
      const activeTrack = ambientTracks.find(t => t.category === category);
      await studyAudioEngine.playCategory(category, activeTrack?.audio_url);
      setIsAudioPlaying(true);
    }
  };

  const handleSelectVibe = (vibe: StudyVibe) => {
    setSelectedVibeId(vibe.id);
  };

  const handleSaveCompletedSession = (
    minutes: number, 
    rating?: 'excellent' | 'good' | 'average' | 'difficult', 
    task?: string, 
    note?: string
  ) => {
    const newSession: FocusSession = {
      id: `session-${Date.now()}`,
      task_name: task || 'Focus Study Block',
      duration_minutes: minutes,
      completed_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      rating: rating || 'good',
      reflection: note || ''
    };

    setSessions(prev => [newSession, ...prev]);

    // Daily streak logic:
    // - First completed focus session: 0 → 1
    // - Same calendar day: no change
    // - Next consecutive day: +1
    // - If one or more days were missed: reset to 1
    const now = new Date();
    const todayStr = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0')
    ].join('-');
    const lastStudied = localStorage.getItem(STORAGE_KEYS.LAST_STUDIED_DATE);

    if (lastStudied !== todayStr) {
      setStreakDays(prev => {
        if (!lastStudied) return 1;

        const lastDate = new Date(`${lastStudied}T00:00:00`);
        const todayDate = new Date(`${todayStr}T00:00:00`);
        const daysSinceLastStudy = Math.round(
          (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        return daysSinceLastStudy === 1 ? prev + 1 : 1;
      });
      localStorage.setItem(STORAGE_KEYS.LAST_STUDIED_DATE, todayStr);
    }
  };

  const handleSaveJournalEntry = (content: string, accomplishments: string[], rating: string) => {
    const newEntry: JournalEntry = {
      id: `j-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      content,
      accomplishments,
      rating,
      created_at: new Date().toISOString()
    };
    setJournalEntries(prev => [newEntry, ...prev]);
  };

  const handleDeleteJournalEntry = (id: string) => {
    setJournalEntries(prev => prev.filter(e => e.id !== id));
  };

  const targetExam = exams.find(e => e.id === targetExamId) || null;
  const currentVibe = vibes.find(v => v.id === selectedVibeId) || vibes[0];

  const totalFocusMinutes = sessions.reduce((acc, s) => acc + s.duration_minutes, 0);

  // The admin dashboard lives on its own hidden path (/admins) and is never
  // linked from the public site — no button, no icon, nothing to discover.
  const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admins');

  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-[#050508] text-white font-sans">
        <AdminPanel
          isOpen={true}
          onClose={() => { window.location.href = '/'; }}
          exams={exams}
          onSaveExams={setExams}
          vibes={vibes}
          onSaveVibes={setVibes}
          ambientTracks={ambientTracks}
          onSaveAmbientTracks={setAmbientTracks}
          quotes={quotes}
          onSaveQuotes={setQuotes}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] text-white font-sans relative overflow-x-hidden selection:bg-orange-500 selection:text-slate-950">
      
      {/* Immersive UI Background Atmosphere Layers */}
      <div className="fixed inset-0 formula-bg opacity-30 pointer-events-none z-0"></div>
      <div className="fixed inset-0 lamp-glow pointer-events-none z-0"></div>
      <div className="fixed inset-0 vignette pointer-events-none z-0"></div>

      <div className="relative z-10">
        {/* 1. Header Navigation */}
        <Navbar
          exams={exams}
          targetExam={targetExam}
          onSelectTargetExam={(id) => setTargetExamId(id)}
          onOpenFocusRoom={() => setFocusRoomOpen(true)}
          streakDays={streakDays}
          currentAudioCategory={activeAudioCategory}
          onToggleAudio={handleToggleAudio}
          isAudioPlaying={isAudioPlaying}
        />

      <main>
        {/* SECTION 1: First-Visit Exam Selection / Selected Exam Countdown */}
        {!targetExam ? (
          <ExamSelector
            exams={exams}
            onSelectExam={(id) => setTargetExamId(id)}
          />
        ) : (
          <HeroSection
            targetExam={targetExam}
            currentVibe={currentVibe}
            onStartFocus={() => setFocusRoomOpen(true)}
            onViewExams={() => {
              const el = document.getElementById('exams-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        )}

        {/* SECTION 2: Study Vibe of the Day Carousel */}
        <StudyVibeCarousel
          vibes={vibes}
          selectedVibeId={selectedVibeId}
          onSelectVibe={handleSelectVibe}
        />

        {/* SECTION 3: All Exam Countdowns */}
        <ExamCardsSection
          exams={exams}
          targetExamId={targetExamId}
          onSelectTargetExam={(id) => setTargetExamId(id)}
          onFocusOnExam={(exam) => {
            setTargetExamId(exam.id);
            setFocusRoomOpen(true);
          }}
        />

        {/* SECTION 4: "Your Future Is Being Built Today" Motivational Check-in */}
        <MotivationalSection
          completedMinutesToday={totalFocusMinutes}
          dailyTargetHours={4}
          streakDays={streakDays}
          onStartFocusSession={() => setFocusRoomOpen(true)}
        />

        {/* SECTION 5 & 6: Study Analytics & History */}
        <StudyProgressSection
          sessions={sessions}
          totalFocusMinutes={totalFocusMinutes}
        />

        {/* SECTION 7: Emotional Study Streak Visual & Milestones */}
        <StudyStreakSection
          streakDays={streakDays}
        />

        {/* SECTION 8: Today's Featured Quote & Wisdom Vault */}
        <TodayQuoteSection
          quotes={quotes}
        />

        {/* SECTION 9: Study Journal */}
        <JournalSectionWrapper
          entries={journalEntries}
          onSaveEntry={handleSaveJournalEntry}
          onDeleteEntry={handleDeleteJournalEntry}
        />

        {/* SECTION 10: Study Vibe Gallery */}
        <StudyVibeGallery
          vibes={vibes}
          selectedVibeId={selectedVibeId}
          onSelectVibe={handleSelectVibe}
        />

        {/* SECTION 11: Feedback System */}
        <FeedbackSection />
      </main>

      {/* SECTION 12: PeaceGhost Footer */}
      <Footer />

      {/* FULLSCREEN FOCUS ROOM MODAL */}
      {focusRoomOpen && (
        <FocusRoom
          targetExam={targetExam}
          currentVibe={currentVibe}
          ambientTracks={ambientTracks}
          quotes={quotes}
          activeAudioCategory={activeAudioCategory}
          onSelectAudioCategory={handleSelectAudioCategory}
          audioVolume={audioVolume}
          onSetAudioVolume={setAudioVolume}
          isAudioPlaying={isAudioPlaying}
          onToggleAudio={handleToggleAudio}
          onCloseFocusRoom={() => setFocusRoomOpen(false)}
          onSaveCompletedSession={handleSaveCompletedSession}
        />
      )}

      {contentError && !contentLoading && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-[60] bg-slate-900 border border-amber-500/30 text-amber-300 text-xs rounded-xl p-3 shadow-2xl font-mono">
          {contentError}
        </div>
      )}

      </div>
    </div>
  );
}

// Wrapper for Journal Section
import { StudyJournalSection } from './components/StudyJournalSection';
function JournalSectionWrapper(props: any) {
  return <StudyJournalSection {...props} />;
}
