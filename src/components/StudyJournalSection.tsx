import React, { useState } from 'react';
import { BookOpen, Plus, Save, Trash2, CheckCircle2 } from 'lucide-react';
import { JournalEntry } from '../types';

interface StudyJournalSectionProps {
  entries: JournalEntry[];
  onSaveEntry: (content: string, accomplishments: string[], rating: string) => void;
  onDeleteEntry: (id: string) => void;
}

export const StudyJournalSection: React.FC<StudyJournalSectionProps> = ({
  entries,
  onSaveEntry,
  onDeleteEntry
}) => {
  const [content, setContent] = useState<string>('');
  const [tagInput, setTagInput] = useState<string>('');
  const [tags, setTags] = useState<string[]>(['Solved 30 PYQs', 'Revised Organic Mechanisms']);
  const [rating, setRating] = useState<string>('🔥 Productive');

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && tags.length === 0) return;

    onSaveEntry(content, tags, rating);
    setContent('');
    setTags([]);
  };

  return (
    <section className="py-16 bg-slate-950 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 tracking-wider uppercase mb-2">
              <BookOpen className="w-4 h-4" />
              <span>REFLECTIVE LOG</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase">
              STUDY JOURNAL & DAILY NOTES
            </h2>
          </div>
          <p className="text-sm text-slate-400 max-w-md">
            Document key breakthroughs, chapters finished, and daily accomplishments.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* New Entry Form */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white uppercase font-mono flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-400" />
              <span>TODAY'S STUDY LOG</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-mono font-bold text-slate-400 uppercase block mb-1.5">
                  WHAT DID YOU ACCOMPLISH TODAY?
                </label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="e.g. Mastered rotational dynamics equations, solved 35 past year questions, revised organic chemistry mechanisms."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Accomplishment Tags Input */}
              <div>
                <label className="text-xs font-mono font-bold text-slate-400 uppercase block mb-1.5">
                  KEY ACCOMPLISHMENT TAGS
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Add tag (e.g. Solved 35 PYQs)"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold"
                  >
                    Add
                  </button>
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        onClick={() => handleRemoveTag(tag)}
                        className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer hover:bg-rose-500/20 hover:text-rose-300"
                        title="Click to remove"
                      >
                        ✓ {tag} ×
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Rating selection */}
              <div>
                <label className="text-xs font-mono font-bold text-slate-400 uppercase block mb-1.5">
                  SESSION RATING
                </label>
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="🔥 Productive">🔥 Highly Productive</option>
                  <option value="🙂 Good Progress">🙂 Good Progress</option>
                  <option value="😐 Average Focus">😐 Average Focus</option>
                  <option value="😓 Challenging Day">😓 Challenging Day</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>SAVE JOURNAL ENTRY</span>
              </button>
            </form>
          </div>

          {/* Saved Journal History */}
          <div className="lg:col-span-7 space-y-3">
            <h3 className="text-base font-bold text-white uppercase font-mono mb-2">
              PREVIOUS JOURNAL ENTRIES ({entries.length})
            </h3>

            {entries.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900/30 border border-slate-800 text-center text-xs text-slate-500 italic">
                No journal logs saved yet. Write down today's accomplishments to start building your study archive.
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {entry.date}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-bold text-slate-300">
                          {entry.rating}
                        </span>
                        <button
                          onClick={() => onDeleteEntry(entry.id)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete Entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {entry.content && (
                      <p className="text-xs text-slate-200 leading-relaxed font-sans">
                        {entry.content}
                      </p>
                    )}

                    {entry.accomplishments && entry.accomplishments.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {entry.accomplishments.map((acc, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-medium flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            {acc}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
