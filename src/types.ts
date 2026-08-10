export type ExamCategory = 
  | 'JEE' 
  | 'NEET' 
  | 'NDA' 
  | 'CUET' 
  | 'BOARDS' 
  | 'GATE' 
  | 'UPSC' 
  | 'OTHER';

export interface Exam {
  id: string;
  name: string;
  category: ExamCategory;
  target_date: string; // ISO string or YYYY-MM-DD HH:mm
  is_official: boolean;
  expected_note?: string;
  target_score?: string;
  description?: string;
  syllabus_tips?: string[];
  is_target?: boolean;
}

export type VibeCategory = 
  | 'night' 
  | 'rain' 
  | 'morning' 
  | 'library' 
  | 'science' 
  | 'math' 
  | 'exam' 
  | 'cafe' 
  | 'forest' 
  | 'ocean';

export interface StudyVibe {
  id: string;
  title: string;
  category: VibeCategory;
  image_url: string;
  mobile_image_url?: string;
  overlay_strength: number; // 0.1 to 0.9
  is_active: boolean;
  display_order: number;
  photographer?: string;
  source_name?: string;
  source_url?: string;
  license?: string;
  quote_text?: string;
}

export type AmbientCategory = 
  | 'rain' 
  | 'library' 
  | 'cafe' 
  | 'forest' 
  | 'ocean' 
  | 'deep_focus' 
  | 'white_noise' 
  | 'silent';

export interface AmbientTrack {
  id: string;
  title: string;
  category: AmbientCategory;
  audio_url?: string; // Optional remote mp3 URL
  duration?: string;
  is_active: boolean;
  display_order: number;
  volume_recommendation?: number;
  icon?: string;
}

export type QuoteCategory = 
  | 'discipline' 
  | 'focus' 
  | 'consistency' 
  | 'comeback' 
  | 'failure' 
  | 'JEE' 
  | 'NEET' 
  | 'NDA' 
  | 'CUET' 
  | 'exam_pressure' 
  | 'confidence' 
  | 'late_night' 
  | 'morning' 
  | 'productivity' 
  | 'self_belief';

export interface MotivationalQuote {
  id: string;
  text: string;
  author: string;
  category: QuoteCategory;
  is_featured?: boolean;
  is_active: boolean;
}

export interface FocusSession {
  id: string;
  task_name: string;
  duration_minutes: number;
  completed_at: string;
  rating?: 'excellent' | 'good' | 'average' | 'difficult';
  reflection?: string;
  subject?: string;
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  content: string;
  accomplishments: string[];
  rating: string;
  created_at: string;
}

export interface FeedbackSubmission {
  id: string;
  name: string;
  email?: string;
  type: 'suggestion' | 'bug' | 'praise' | 'exam_request';
  rating: number;
  message: string;
  created_at: string;
  status: 'pending' | 'reviewed';
}

export interface UserStats {
  totalFocusMinutes: number;
  sessionsCompleted: number;
  streakDays: number;
  lastStudiedDate: string; // YYYY-MM-DD
  dailyTargetMinutes: number;
  targetExamId?: string;
  journalEnabled: boolean;
  ambientVolume: number;
  selectedVibeId: string;
  selectedAmbientCategory: AmbientCategory;
}


