import { supabase } from './supabase';
import {
  Exam,
  ExamCategory,
  StudyVibe,
  AmbientTrack,
  MotivationalQuote,
  FeedbackSubmission
} from '../types';

/* -------------------------------------------------------------------------
 * Row <-> frontend type mapping
 *
 * The database schema carries a few extra operational fields (status,
 * authority, short_name, ...) that the existing frontend components don't
 * know about. These functions translate between the two shapes so the
 * existing UI code (types.ts, components) never has to change.
 * ---------------------------------------------------------------------- */

interface ExamRow {
  id: string;
  name: string;
  category: string;
  status: 'official' | 'expected' | 'not_announced' | 'completed';
  exam_date: string | null;
  expected_date: string | null;
  expected_note: string | null;
  target_score: string | null;
  description: string | null;
  syllabus_tips: string[] | null;
  is_target: boolean;
  is_active: boolean;
  display_order: number;
}

function examRowToExam(row: ExamRow): Exam {
  return {
    id: row.id,
    name: row.name,
    category: (row.category as ExamCategory) || 'OTHER',
    target_date: row.exam_date || row.expected_date || new Date().toISOString(),
    is_official: row.status === 'official',
    expected_note: row.expected_note || undefined,
    target_score: row.target_score || undefined,
    description: row.description || undefined,
    syllabus_tips: row.syllabus_tips || undefined,
    is_target: row.is_target
  };
}

function examToRow(exam: Partial<Exam>) {
  const isOfficial = exam.is_official ?? false;
  const dateValue = exam.target_date || new Date().toISOString();
  return {
    name: exam.name,
    category: exam.category,
    status: isOfficial ? 'official' : 'expected',
    exam_date: isOfficial ? dateValue : null,
    expected_date: isOfficial ? null : dateValue,
    expected_note: exam.expected_note || null,
    target_score: exam.target_score || null,
    description: exam.description || null,
    syllabus_tips: exam.syllabus_tips || [],
    is_target: exam.is_target ?? false
  };
}

function quoteRowToQuote(row: any): MotivationalQuote {
  return {
    id: row.id,
    text: row.text,
    author: row.author,
    category: row.category,
    is_featured: row.is_featured,
    is_active: row.is_active
  };
}

function vibeRowToVibe(row: any): StudyVibe {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    image_url: row.image_url,
    mobile_image_url: row.mobile_image_url || undefined,
    overlay_strength: Number(row.overlay_strength),
    is_active: row.is_active,
    display_order: row.display_order,
    photographer: row.photographer || undefined,
    source_name: row.source_name || undefined,
    source_url: row.source_url || undefined,
    license: row.license || undefined,
    quote_text: row.quote_text || undefined
  };
}

function trackRowToTrack(row: any): AmbientTrack {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    audio_url: row.audio_url || undefined,
    duration: row.duration || undefined,
    is_active: row.is_active,
    display_order: row.display_order,
    volume_recommendation: row.volume_recommendation != null ? Number(row.volume_recommendation) : undefined
  };
}

function feedbackRowToFeedback(row: any): FeedbackSubmission {
  return {
    id: row.id,
    name: row.name || '',
    email: row.email || undefined,
    type: row.type,
    rating: row.rating ?? 5,
    message: row.message,
    created_at: row.created_at,
    status: row.status === 'new' ? 'pending' : 'reviewed'
  };
}

/* -------------------------------------------------------------------------
 * Public reads (anon-accessible; active rows only, enforced by RLS)
 * ---------------------------------------------------------------------- */

export async function fetchExams(): Promise<Exam[]> {
  const { data, error } = await supabase
    .from('exams')
    .select('*')
    .order('display_order', { ascending: true });
  if (error) throw error;
  return (data as ExamRow[]).map(examRowToExam);
}

export async function fetchQuotes(): Promise<MotivationalQuote[]> {
  const { data, error } = await supabase.from('quotes').select('*').order('created_at', { ascending: true });
  if (error) throw error;
  return data.map(quoteRowToQuote);
}

export async function fetchVibes(): Promise<StudyVibe[]> {
  const { data, error } = await supabase
    .from('study_vibes')
    .select('*')
    .order('display_order', { ascending: true });
  if (error) throw error;
  return data.map(vibeRowToVibe);
}

export async function fetchAmbientTracks(): Promise<AmbientTrack[]> {
  const { data, error } = await supabase
    .from('ambient_tracks')
    .select('*')
    .order('display_order', { ascending: true });
  if (error) throw error;
  return data.map(trackRowToTrack);
}

/* -------------------------------------------------------------------------
 * Public write: feedback submissions
 * ---------------------------------------------------------------------- */

export async function submitFeedback(submission: {
  name: string;
  email?: string;
  type: 'suggestion' | 'bug' | 'praise' | 'exam_request';
  rating: number;
  message: string;
}): Promise<void> {
  // Basic client-side validation as a first line of defense. The database
  // (check constraints + the enforce_feedback_rate_limit trigger) is the
  // real, non-bypassable line of defense — this just gives faster feedback.
  const name = submission.name.trim().slice(0, 120);
  const message = submission.message.trim().slice(0, 2000);
  if (!name || !message) throw new Error('Name and message are required.');
  if (submission.rating < 1 || submission.rating > 5) throw new Error('Rating must be between 1 and 5.');

  const { error } = await supabase.from('feedback').insert({
    name,
    email: submission.email?.trim() || null,
    type: submission.type,
    rating: submission.rating,
    message
  });
  if (error) throw error;
}

/* -------------------------------------------------------------------------
 * Admin authentication
 * ---------------------------------------------------------------------- */

export async function adminSignIn(email: string, password: string): Promise<void> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (!data.session) throw new Error('Sign-in did not return a session.');

  // Verify the signed-in account actually has the admin role before treating
  // the session as authorized. This is a UX check only — every subsequent
  // read/write is independently re-checked by Postgres RLS via is_admin(),
  // so a forged or stale client-side flag can never grant real access.
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    await supabase.auth.signOut();
    throw new Error('This account is not authorized as an administrator.');
  }
}

export async function adminSignOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function checkIsAdmin(): Promise<boolean> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return false;

  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .maybeSingle();

  if (error || !data) return false;
  return data.role === 'admin';
}

export async function getCurrentSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/* -------------------------------------------------------------------------
 * Admin CRUD (every call below is only permitted by RLS for role='admin';
 * a non-admin authenticated user or anon caller receives a policy error)
 * ---------------------------------------------------------------------- */

export async function adminFetchFeedback(): Promise<FeedbackSubmission[]> {
  const { data, error } = await supabase.from('feedback').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(feedbackRowToFeedback);
}

export async function adminDeleteFeedback(id: string): Promise<void> {
  const { error } = await supabase.from('feedback').delete().eq('id', id);
  if (error) throw error;
}

export async function adminUpsertExam(exam: Partial<Exam> & { id?: string }): Promise<Exam> {
  const row = examToRow(exam);
  if (exam.id) {
    const { data, error } = await supabase.from('exams').update(row).eq('id', exam.id).select('*').single();
    if (error) throw error;
    return examRowToExam(data as ExamRow);
  }
  const { data, error } = await supabase.from('exams').insert(row).select('*').single();
  if (error) throw error;
  return examRowToExam(data as ExamRow);
}

export async function adminDeleteExam(id: string): Promise<void> {
  const { error } = await supabase.from('exams').delete().eq('id', id);
  if (error) throw error;
}

export async function adminUpsertQuote(quote: Partial<MotivationalQuote> & { id?: string }): Promise<MotivationalQuote> {
  const row = {
    text: quote.text,
    author: quote.author || 'PeaceGhost Study System',
    category: quote.category,
    is_featured: quote.is_featured ?? false,
    is_active: quote.is_active ?? true
  };
  if (quote.id) {
    const { data, error } = await supabase.from('quotes').update(row).eq('id', quote.id).select('*').single();
    if (error) throw error;
    return quoteRowToQuote(data);
  }
  const { data, error } = await supabase.from('quotes').insert(row).select('*').single();
  if (error) throw error;
  return quoteRowToQuote(data);
}

export async function adminDeleteQuote(id: string): Promise<void> {
  const { error } = await supabase.from('quotes').delete().eq('id', id);
  if (error) throw error;
}

export async function adminUpsertVibe(vibe: Partial<StudyVibe> & { id?: string }): Promise<StudyVibe> {
  const row = {
    title: vibe.title,
    category: vibe.category,
    image_url: vibe.image_url,
    mobile_image_url: vibe.mobile_image_url || vibe.image_url,
    overlay_strength: vibe.overlay_strength ?? 0.5,
    is_active: vibe.is_active ?? true,
    display_order: vibe.display_order ?? 0,
    photographer: vibe.photographer || null,
    source_name: vibe.source_name || null,
    source_url: vibe.source_url || null,
    license: vibe.license || null,
    quote_text: vibe.quote_text || null
  };
  if (vibe.id) {
    const { data, error } = await supabase.from('study_vibes').update(row).eq('id', vibe.id).select('*').single();
    if (error) throw error;
    return vibeRowToVibe(data);
  }
  const { data, error } = await supabase.from('study_vibes').insert(row).select('*').single();
  if (error) throw error;
  return vibeRowToVibe(data);
}

export async function adminDeleteVibe(id: string): Promise<void> {
  const { error } = await supabase.from('study_vibes').delete().eq('id', id);
  if (error) throw error;
}

export async function adminUpsertTrack(track: Partial<AmbientTrack> & { id?: string }): Promise<AmbientTrack> {
  const row = {
    title: track.title,
    category: track.category,
    audio_url: track.audio_url || null,
    duration: track.duration || 'Infinite Loop',
    is_active: track.is_active ?? true,
    display_order: track.display_order ?? 0,
    volume_recommendation: track.volume_recommendation ?? 0.5
  };
  if (track.id) {
    const { data, error } = await supabase.from('ambient_tracks').update(row).eq('id', track.id).select('*').single();
    if (error) throw error;
    return trackRowToTrack(data);
  }
  const { data, error } = await supabase.from('ambient_tracks').insert(row).select('*').single();
  if (error) throw error;
  return trackRowToTrack(data);
}

export async function adminDeleteTrack(id: string): Promise<void> {
  const { error } = await supabase.from('ambient_tracks').delete().eq('id', id);
  if (error) throw error;
}
