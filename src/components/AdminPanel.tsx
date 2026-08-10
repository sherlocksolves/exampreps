import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  Image, 
  Music, 
  Quote, 
  Calendar, 
  MessageSquare,
  Lock,
  LogOut,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { 
  Exam, 
  StudyVibe, 
  AmbientTrack, 
  MotivationalQuote, 
  FeedbackSubmission
} from '../types';
import {
  adminSignIn,
  adminSignOut,
  checkIsAdmin,
  getCurrentSession,
  adminFetchFeedback,
  adminDeleteFeedback,
  adminUpsertExam,
  adminDeleteExam as apiDeleteExam,
  adminUpsertQuote,
  adminDeleteQuote as apiDeleteQuote,
  adminUpsertVibe,
  adminDeleteVibe as apiDeleteVibe,
  adminUpsertTrack,
  adminDeleteTrack as apiDeleteTrack
} from '../lib/api';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  exams: Exam[];
  onSaveExams: (exams: Exam[]) => void;
  vibes: StudyVibe[];
  onSaveVibes: (vibes: StudyVibe[]) => void;
  ambientTracks: AmbientTrack[];
  onSaveAmbientTracks: (tracks: AmbientTrack[]) => void;
  quotes: MotivationalQuote[];
  onSaveQuotes: (quotes: MotivationalQuote[]) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  exams,
  onSaveExams,
  vibes,
  onSaveVibes,
  ambientTracks,
  onSaveAmbientTracks,
  quotes,
  onSaveQuotes
}) => {
  // Auth State — backed by real Supabase Auth, not a hardcoded passcode.
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [checkingSession, setCheckingSession] = useState<boolean>(true);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'vibes' | 'audio' | 'quotes' | 'exams' | 'feedback'>('vibes');

  // Feedback (fetched only once authenticated as admin — RLS blocks anyone else)
  const [feedbackSubmissions, setFeedbackSubmissions] = useState<FeedbackSubmission[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState<boolean>(false);

  // Inline save/delete state for user feedback in the UI
  const [savingId, setSavingId] = useState<string | null>(null);
  const [opError, setOpError] = useState<string>('');

  // --- NEW ITEM MODAL STATES ---
  const [editingVibe, setEditingVibe] = useState<Partial<StudyVibe> | null>(null);
  const [editingTrack, setEditingTrack] = useState<Partial<AmbientTrack> | null>(null);
  const [editingQuote, setEditingQuote] = useState<Partial<MotivationalQuote> | null>(null);
  const [editingExam, setEditingExam] = useState<Partial<Exam> | null>(null);

  // On open, check for an existing admin session so a page refresh doesn't
  // force re-login unnecessarily.
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    (async () => {
      setCheckingSession(true);
      const session = await getCurrentSession();
      if (session) {
        const admin = await checkIsAdmin();
        if (!cancelled) setIsAuthenticated(admin);
      }
      if (!cancelled) setCheckingSession(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  useEffect(() => {
    if (isAuthenticated && activeTab === 'feedback') {
      void loadFeedback();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, activeTab]);

  if (!isOpen) return null;

  const loadFeedback = async () => {
    setFeedbackLoading(true);
    try {
      const data = await adminFetchFeedback();
      setFeedbackSubmissions(data);
    } catch {
      setOpError('Could not load feedback submissions.');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);
    setAuthError('');
    try {
      await adminSignIn(email.trim(), password);
      setIsAuthenticated(true);
      setPassword('');
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Sign-in failed.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    await adminSignOut();
    setIsAuthenticated(false);
  };

  // --- STUDY VIBES MANAGEMENT ---
  const handleSaveVibeItem = async () => {
    if (!editingVibe?.title || !editingVibe?.image_url) return;
    setOpError('');
    try {
      const saved = await adminUpsertVibe(editingVibe);
      const exists = vibes.some((v) => v.id === saved.id);
      onSaveVibes(exists ? vibes.map((v) => (v.id === saved.id ? saved : v)) : [...vibes, saved]);
      setEditingVibe(null);
    } catch (err) {
      setOpError(err instanceof Error ? err.message : 'Failed to save study vibe.');
    }
  };

  const handleDeleteVibe = async (id: string) => {
    setSavingId(id);
    setOpError('');
    try {
      await apiDeleteVibe(id);
      onSaveVibes(vibes.filter((v) => v.id !== id));
    } catch (err) {
      setOpError(err instanceof Error ? err.message : 'Failed to delete study vibe.');
    } finally {
      setSavingId(null);
    }
  };

  // --- AMBIENT TRACKS MANAGEMENT ---
  const handleSaveTrackItem = async () => {
    if (!editingTrack?.title) return;
    setOpError('');
    try {
      const saved = await adminUpsertTrack(editingTrack);
      const exists = ambientTracks.some((t) => t.id === saved.id);
      onSaveAmbientTracks(exists ? ambientTracks.map((t) => (t.id === saved.id ? saved : t)) : [...ambientTracks, saved]);
      setEditingTrack(null);
    } catch (err) {
      setOpError(err instanceof Error ? err.message : 'Failed to save audio track.');
    }
  };

  const handleDeleteTrack = async (id: string) => {
    setSavingId(id);
    setOpError('');
    try {
      await apiDeleteTrack(id);
      onSaveAmbientTracks(ambientTracks.filter((t) => t.id !== id));
    } catch (err) {
      setOpError(err instanceof Error ? err.message : 'Failed to delete audio track.');
    } finally {
      setSavingId(null);
    }
  };

  // --- QUOTES MANAGEMENT ---
  const handleSaveQuoteItem = async () => {
    if (!editingQuote?.text) return;
    setOpError('');
    try {
      const saved = await adminUpsertQuote(editingQuote);
      const exists = quotes.some((q) => q.id === saved.id);
      onSaveQuotes(exists ? quotes.map((q) => (q.id === saved.id ? saved : q)) : [...quotes, saved]);
      setEditingQuote(null);
    } catch (err) {
      setOpError(err instanceof Error ? err.message : 'Failed to save quote.');
    }
  };

  const handleDeleteQuote = async (id: string) => {
    setSavingId(id);
    setOpError('');
    try {
      await apiDeleteQuote(id);
      onSaveQuotes(quotes.filter((q) => q.id !== id));
    } catch (err) {
      setOpError(err instanceof Error ? err.message : 'Failed to delete quote.');
    } finally {
      setSavingId(null);
    }
  };

  // --- EXAMS MANAGEMENT ---
  const handleSaveExamItem = async () => {
    if (!editingExam?.name || !editingExam?.target_date) return;
    setOpError('');
    try {
      const saved = await adminUpsertExam(editingExam);
      const exists = exams.some((e) => e.id === saved.id);
      onSaveExams(exists ? exams.map((e) => (e.id === saved.id ? saved : e)) : [...exams, saved]);
      setEditingExam(null);
    } catch (err) {
      setOpError(err instanceof Error ? err.message : 'Failed to save exam.');
    }
  };

  const handleDeleteExam = async (id: string) => {
    setSavingId(id);
    setOpError('');
    try {
      await apiDeleteExam(id);
      onSaveExams(exams.filter((e) => e.id !== id));
    } catch (err) {
      setOpError(err instanceof Error ? err.message : 'Failed to delete exam.');
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    setSavingId(id);
    setOpError('');
    try {
      await adminDeleteFeedback(id);
      setFeedbackSubmissions((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      setOpError(err instanceof Error ? err.message : 'Failed to delete feedback.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-fade-in font-sans">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header Bar */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-sm">
            <ShieldCheck className="w-5 h-5" />
            <span>PEACEGHOST ADMIN CONTROL PANEL</span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AUTH CHECK */}
        {checkingSession ? (
          <div className="p-12 flex items-center justify-center text-slate-400 gap-2 text-xs font-mono">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>CHECKING SESSION...</span>
          </div>
        ) : !isAuthenticated ? (
          <div className="p-8 sm:p-12 text-center max-w-md mx-auto my-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-white uppercase">
              ADMIN AUTHORIZATION REQUIRED
            </h3>
            <p className="text-xs text-slate-400">
              Sign in with your Supabase administrator account to manage study vibes, ambient audio, quotes, and exams.
            </p>

            <form onSubmit={handleLogin} className="space-y-3">
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Admin email"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 text-center"
              />
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 text-center"
              />
              {authError && (
                <div className="text-xs text-rose-400 font-medium flex items-center gap-1.5 justify-center">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{authError}</span>
                </div>
              )}
              <button
                type="submit"
                disabled={isSigningIn}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                {isSigningIn ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>{isSigningIn ? 'SIGNING IN...' : 'SIGN IN'}</span>
              </button>
            </form>
          </div>
        ) : (
          /* MAIN ADMIN VIEW */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Tabs Bar */}
            <div className="flex items-center gap-2 p-3 bg-slate-900 border-b border-slate-800 overflow-x-auto text-xs font-mono font-bold">
              {[
                { id: 'vibes', label: 'STUDY VIBES', icon: <Image className="w-3.5 h-3.5" /> },
                { id: 'audio', label: 'AMBIENT AUDIO', icon: <Music className="w-3.5 h-3.5" /> },
                { id: 'quotes', label: 'MOTIVATION', icon: <Quote className="w-3.5 h-3.5" /> },
                { id: 'exams', label: 'EXAMS', icon: <Calendar className="w-3.5 h-3.5" /> },
                { id: 'feedback', label: `FEEDBACK (${feedbackSubmissions.length})`, icon: <MessageSquare className="w-3.5 h-3.5" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}

              <button
                onClick={handleLogout}
                className="ml-auto px-3.5 py-2 rounded-lg flex items-center gap-1.5 whitespace-nowrap text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>LOG OUT</span>
              </button>
            </div>

            {opError && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{opError}</span>
              </div>
            )}

            {/* TAB CONTENT PANEL */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              
              {/* TAB 1: STUDY VIBES */}
              {activeTab === 'vibes' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white uppercase font-mono">
                        STUDY VIBES GALLERY MANAGER
                      </h3>
                      <p className="text-xs text-slate-400">
                        Add or edit photography backgrounds and overlay strengths.
                      </p>
                    </div>
                    <button
                      onClick={() => setEditingVibe({ title: '', image_url: '', category: 'night', overlay_strength: 0.5 })}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs uppercase flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> ADD VIBE
                    </button>
                  </div>

                  {/* Vibes Table */}
                  <div className="space-y-2">
                    {vibes.map((v) => (
                      <div
                        key={v.id}
                        className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <img src={v.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                          <div>
                            <div className="text-xs font-bold text-white">{v.title}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Category: {v.category} · Overlay: {v.overlay_strength}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingVibe(v)}
                            className="p-2 rounded bg-slate-800 text-slate-300 hover:text-white"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteVibe(v.id)}
                            className="p-2 rounded bg-slate-800 text-rose-400 hover:bg-rose-500/20"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: AMBIENT AUDIO */}
              {activeTab === 'audio' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white uppercase font-mono">
                        AMBIENT AUDIO TRACKS
                      </h3>
                      <p className="text-xs text-slate-400">
                        Configure audio URLs or procedural categories.
                      </p>
                    </div>
                    <button
                      onClick={() => setEditingTrack({ title: '', category: 'rain', audio_url: '' })}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs uppercase flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> ADD AUDIO TRACK
                    </button>
                  </div>

                  <div className="space-y-2">
                    {ambientTracks.map((t) => (
                      <div
                        key={t.id}
                        className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4"
                      >
                        <div>
                          <div className="text-xs font-bold text-white">{t.title}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Category: {t.category} · {t.audio_url ? 'Custom MP3 URL' : 'Procedural Synthesizer Engine'}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingTrack(t)}
                            className="p-2 rounded bg-slate-800 text-slate-300 hover:text-white"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTrack(t.id)}
                            className="p-2 rounded bg-slate-800 text-rose-400 hover:bg-rose-500/20"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: MOTIVATION QUOTES */}
              {activeTab === 'quotes' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white uppercase font-mono">
                        MOTIVATIONAL QUOTES (150+)
                      </h3>
                      <p className="text-xs text-slate-400">
                        Manage inspirational study messages and feature quotes.
                      </p>
                    </div>
                    <button
                      onClick={() => setEditingQuote({ text: '', author: 'PeaceGhost Study System', category: 'discipline' })}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs uppercase flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> ADD QUOTE
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                    {quotes.map((q) => (
                      <div
                        key={q.id}
                        className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4"
                      >
                        <div>
                          <div className="text-xs text-slate-200 font-serif italic">“{q.text}”</div>
                          <div className="text-[10px] text-amber-400 font-mono mt-0.5">
                            — {q.author} ({q.category}) {q.is_featured && '★ FEATURED'}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingQuote(q)}
                            className="p-2 rounded bg-slate-800 text-slate-300 hover:text-white"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuote(q.id)}
                            className="p-2 rounded bg-slate-800 text-rose-400 hover:bg-rose-500/20"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: EXAMS */}
              {activeTab === 'exams' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white uppercase font-mono">
                        TARGET EXAMS MANAGER
                      </h3>
                      <p className="text-xs text-slate-400">
                        Update exam dates, official/expected flags, and syllabus notes.
                      </p>
                    </div>
                    <button
                      onClick={() => setEditingExam({ name: '', target_date: '2027-01-22T09:00:00', category: 'JEE', is_official: false })}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs uppercase flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> ADD EXAM
                    </button>
                  </div>

                  <div className="space-y-2">
                    {exams.map((ex) => (
                      <div
                        key={ex.id}
                        className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4"
                      >
                        <div>
                          <div className="text-xs font-bold text-white">{ex.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Date: {ex.target_date} · Status: {ex.is_official ? 'Official' : 'Expected'}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingExam(ex)}
                            className="p-2 rounded bg-slate-800 text-slate-300 hover:text-white"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteExam(ex.id)}
                            className="p-2 rounded bg-slate-800 text-rose-400 hover:bg-rose-500/20"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: FEEDBACK */}
              {activeTab === 'feedback' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white uppercase font-mono">
                    SUBMITTED COMMUNITY FEEDBACK
                  </h3>

                  {feedbackLoading ? (
                    <div className="p-8 flex items-center justify-center gap-2 text-xs text-slate-500 bg-slate-900/50 rounded-2xl border border-slate-800">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>LOADING FEEDBACK...</span>
                    </div>
                  ) : feedbackSubmissions.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500 italic bg-slate-900/50 rounded-2xl border border-slate-800">
                      No feedback submissions yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {feedbackSubmissions.map((fb) => (
                        <div key={fb.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="font-bold text-amber-400">{fb.name} ({fb.email || 'No Email'})</span>
                            <div className="flex items-center gap-3">
                              <span className="text-slate-500">{new Date(fb.created_at).toLocaleString()}</span>
                              <button
                                onClick={() => handleDeleteFeedback(fb.id)}
                                disabled={savingId === fb.id}
                                className="p-1.5 rounded bg-slate-800 text-rose-400 hover:bg-rose-500/20 disabled:opacity-50"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <div className="text-xs font-bold text-slate-300 uppercase">
                            Type: {fb.type} · Rating: {fb.rating}/5 Stars
                          </div>
                          <p className="text-xs text-slate-200 mt-2">“{fb.message}”</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>

          </div>
        )}

      </div>

      {/* EDIT MODAL FOR VIBE ITEM */}
      {editingVibe && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl max-w-md w-full space-y-4">
            <h4 className="text-base font-bold text-white uppercase font-mono">EDIT STUDY VIBE</h4>
            <input
              type="text"
              placeholder="Title (e.g. Rainy Night Desk)"
              value={editingVibe.title || ''}
              onChange={(e) => setEditingVibe({ ...editingVibe, title: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
            />
            <input
              type="text"
              placeholder="Image URL (Unsplash or direct link)"
              value={editingVibe.image_url || ''}
              onChange={(e) => setEditingVibe({ ...editingVibe, image_url: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveVibeItem}
                className="flex-1 py-2.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold uppercase"
              >
                Save Vibe
              </button>
              <button
                onClick={() => setEditingVibe(null)}
                className="py-2.5 px-4 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL FOR TRACK ITEM */}
      {editingTrack && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl max-w-md w-full space-y-4">
            <h4 className="text-base font-bold text-white uppercase font-mono">EDIT AMBIENT AUDIO</h4>
            <input
              type="text"
              placeholder="Track Title"
              value={editingTrack.title || ''}
              onChange={(e) => setEditingTrack({ ...editingTrack, title: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
            />
            <input
              type="text"
              placeholder="Audio URL (Optional MP3 link)"
              value={editingTrack.audio_url || ''}
              onChange={(e) => setEditingTrack({ ...editingTrack, audio_url: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveTrackItem}
                className="flex-1 py-2.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold uppercase"
              >
                Save Track
              </button>
              <button
                onClick={() => setEditingTrack(null)}
                className="py-2.5 px-4 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL FOR QUOTE ITEM */}
      {editingQuote && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl max-w-md w-full space-y-4">
            <h4 className="text-base font-bold text-white uppercase font-mono">EDIT QUOTE</h4>
            <textarea
              rows={3}
              placeholder="Quote text..."
              value={editingQuote.text || ''}
              onChange={(e) => setEditingQuote({ ...editingQuote, text: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
            />
            <input
              type="text"
              placeholder="Author (e.g. PeaceGhost Study System)"
              value={editingQuote.author || ''}
              onChange={(e) => setEditingQuote({ ...editingQuote, author: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveQuoteItem}
                className="flex-1 py-2.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold uppercase"
              >
                Save Quote
              </button>
              <button
                onClick={() => setEditingQuote(null)}
                className="py-2.5 px-4 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL FOR EXAM ITEM */}
      {editingExam && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl max-w-md w-full space-y-4 my-auto">
            <h4 className="text-base font-bold text-white uppercase font-mono">
              {editingExam.id ? 'EDIT EXAM' : 'ADD NEW EXAM'}
            </h4>
            
            <div>
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-1">
                EXAM NAME *
              </label>
              <input
                type="text"
                placeholder="e.g. UPSC NDA & NA (II) 2026"
                value={editingExam.name || ''}
                onChange={(e) => setEditingExam({ ...editingExam, name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-1">
                TARGET DATE (ISO YYYY-MM-DDTHH:MM:SS) *
              </label>
              <input
                type="text"
                placeholder="e.g. 2026-09-13T10:00:00"
                value={editingExam.target_date || ''}
                onChange={(e) => setEditingExam({ ...editingExam, target_date: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-1">
                  CATEGORY
                </label>
                <input
                  type="text"
                  placeholder="e.g. NDA / JEE / NEET"
                  value={editingExam.category || ''}
                  onChange={(e) => setEditingExam({ ...editingExam, category: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-1">
                  TARGET SCORE GOAL
                </label>
                <input
                  type="text"
                  placeholder="e.g. 450+ / 900"
                  value={editingExam.target_score || ''}
                  onChange={(e) => setEditingExam({ ...editingExam, target_score: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isOfficialCheck"
                checked={editingExam.is_official ?? false}
                onChange={(e) => setEditingExam({ ...editingExam, is_official: e.target.checked })}
                className="w-4 h-4 rounded bg-slate-900 border-slate-800 text-amber-500"
              />
              <label htmlFor="isOfficialCheck" className="text-xs text-slate-300 font-mono">
                Official Confirmed Date (vs Expected)
              </label>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleSaveExamItem}
                className="flex-1 py-2.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold uppercase shadow-md shadow-amber-500/20"
              >
                SAVE EXAM
              </button>
              <button
                onClick={() => setEditingExam(null)}
                className="py-2.5 px-4 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
