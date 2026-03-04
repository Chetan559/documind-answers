import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Play, Minus, Plus, CheckSquare, Square } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { QuizConfig } from '@/api/quiz';

interface Props {
  documentName?: string;
  documentId?: string;
  config: QuizConfig;
  onConfigChange: (config: Partial<QuizConfig>) => void;
  onStart: () => void;
  loading: boolean;
}

const questionTypes = [
  { id: 'multiple-choice', label: 'Multiple Choice', desc: '4 answer options' },
  { id: 'true-false', label: 'True / False', desc: 'Binary choice' },
  { id: 'short-answer', label: 'Short Answer', desc: 'Type your answer' },
];

const QuizSetup = ({ documentName, documentId, config, onConfigChange, onStart, loading }: Props) => {
  const navigate = useNavigate();

  const toggleType = (id: string) => {
    const next = config.types.includes(id)
      ? config.types.filter(t => t !== id)
      : [...config.types, id];
    if (next.length > 0) onConfigChange({ types: next });
  };

  const adjustCount = (delta: number) => {
    const n = Math.max(1, Math.min(50, config.numQuestions + delta));
    onConfigChange({ numQuestions: n });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
    >
      {/* Back button */}
      <div className="w-full max-w-lg mb-6">
        <button
          onClick={() => navigate(documentId ? `/chat/${documentId}` : '/upload')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-body"
          aria-label="Back to Document"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Document
        </button>
      </div>

      {/* Document badge */}
      {documentName && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border/30 mb-8">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground font-body truncate max-w-[200px]">{documentName}</span>
        </div>
      )}

      {/* Setup card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-lg bg-surface border border-border/20 rounded-2xl p-8 space-y-8"
      >
        <div className="text-center">
          <h2 className="font-display text-3xl text-foreground mb-1">Quiz Mode</h2>
          <p className="text-sm text-muted-foreground font-body">Test your knowledge</p>
        </div>

        {/* Question count stepper */}
        <div>
          <label className="text-xs text-muted-foreground font-body block mb-3 uppercase tracking-wider">Questions</label>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => adjustCount(-1)}
              disabled={config.numQuestions <= 1}
              className="w-10 h-10 rounded-xl border border-border/30 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-all disabled:opacity-30 active:scale-95"
              aria-label="Decrease questions"
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              type="number"
              min={1}
              max={50}
              value={config.numQuestions}
              onChange={e => onConfigChange({ numQuestions: Math.max(1, Math.min(50, Number(e.target.value) || 1)) })}
              className="w-20 text-center bg-transparent border border-border/30 rounded-xl py-2 text-2xl font-display text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              aria-label="Number of questions"
            />
            <button
              onClick={() => adjustCount(1)}
              disabled={config.numQuestions >= 50}
              className="w-10 h-10 rounded-xl border border-border/30 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-all disabled:opacity-30 active:scale-95"
              aria-label="Increase questions"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="text-xs text-muted-foreground font-body block mb-3 uppercase tracking-wider">Difficulty</label>
          <div className="flex gap-2">
            {(['easy', 'medium', 'hard'] as const).map(d => (
              <button
                key={d}
                onClick={() => onConfigChange({ difficulty: d })}
                className={`flex-1 py-2.5 text-sm rounded-xl border transition-all capitalize font-body active:scale-[0.98] ${
                  config.difficulty === d
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-transparent text-muted-foreground border-border/30 hover:text-foreground hover:border-foreground/50'
                }`}
                aria-label={`${d} difficulty`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Question types */}
        <div>
          <label className="text-xs text-muted-foreground font-body block mb-3 uppercase tracking-wider">Type</label>
          <div className="space-y-2">
            {questionTypes.map(t => {
              const active = config.types.includes(t.id);
              return (
                <button
                  key={t.id}
                  onClick={() => toggleType(t.id)}
                  className={`w-full flex items-center gap-3 text-left px-4 py-3.5 rounded-xl border text-sm transition-all font-body ${
                    active
                      ? 'border-primary bg-primary/5 text-foreground'
                      : 'border-border/30 text-muted-foreground hover:text-foreground hover:border-foreground/50'
                  }`}
                  aria-label={`Select ${t.label}`}
                >
                  {active ? (
                    <CheckSquare className="w-4 h-4 text-primary shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 shrink-0" />
                  )}
                  <div>
                    <span className="block">{t.label}</span>
                    <span className="text-xs text-muted-foreground">{t.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={onStart}
          disabled={loading || config.types.length === 0}
          className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl text-sm hover:bg-primary/90 disabled:opacity-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2 font-body font-medium"
          aria-label="Start Quiz"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" role="status" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          {loading ? 'Generating...' : 'Start Quiz'}
        </button>
      </motion.div>
    </motion.div>
  );
};

export default QuizSetup;
