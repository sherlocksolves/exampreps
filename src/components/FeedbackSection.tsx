import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle2, Star, AlertTriangle, Loader2 } from 'lucide-react';
import { submitFeedback } from '../lib/api';

export const FeedbackSection: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [type, setType] = useState<'suggestion' | 'bug' | 'praise' | 'exam_request'>('suggestion');
  const [rating, setRating] = useState<number>(5);
  const [message, setMessage] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await submitFeedback({
        name: name.trim(),
        email: email.trim() || undefined,
        type,
        rating,
        message: message.trim()
      });

      setSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
      setRating(5);
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      // Never surface raw Supabase/Postgres error text to the user (it can
      // include internal details) — show a safe, generic message instead.
      const raw = err instanceof Error ? err.message : '';
      const isRateLimited = raw.toLowerCase().includes('too many submissions');
      setErrorMessage(
        isRateLimited
          ? "You've submitted a few messages recently — please try again in a little while."
          : 'Something went wrong sending your feedback. Please try again in a moment.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 bg-slate-950 border-b border-slate-800/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-2xl">
          
          <div className="text-center max-w-xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>COMMUNITY FEEDBACK & EXAM REQUESTS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              REQUEST AN EXAM OR SUPPORT PEACEGHOST
            </h2>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Have any other exam you want us to add? Want to support us or send PeaceGhost a message? Leave your feedback below — all messages go directly to the Admin Panel!
            </p>
          </div>

          {submitted ? (
            <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3 animate-fade-in">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-xl font-bold text-white uppercase">
                FEEDBACK RECEIVED WITH GRATITUDE
              </h3>
              <p className="text-xs text-slate-300">
                Thank you for contributing to the PeaceGhost Study System.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono font-bold text-slate-400 uppercase block mb-1">
                    YOUR NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-slate-400 uppercase block mb-1">
                    EMAIL ADDRESS (OPTIONAL)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. rahul@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono font-bold text-slate-400 uppercase block mb-1">
                    FEEDBACK CATEGORY
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
                  >
                    <option value="suggestion">💡 Feature Suggestion</option>
                    <option value="exam_request">📅 New Exam Request</option>
                    <option value="praise">❤️ Appreciation / Praise</option>
                    <option value="bug">🐛 Report an Issue</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-slate-400 uppercase block mb-1">
                    SANCTUARY RATING
                  </label>
                  <div className="flex items-center gap-1 pt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 text-amber-400 focus:outline-none hover:scale-110 transition-transform"
                      >
                        <Star className={`w-5 h-5 ${star <= rating ? 'fill-amber-400' : 'text-slate-700'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-slate-400 uppercase block mb-1">
                  YOUR MESSAGE *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share your thoughts, exam requests, or experience with EXAM//COUNTDOWN..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>SENDING...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>SUBMIT FEEDBACK TO PEACEGHOST</span>
                  </>
                )}
              </button>
            </form>
          )}

        </div>

      </div>
    </section>
  );
};
