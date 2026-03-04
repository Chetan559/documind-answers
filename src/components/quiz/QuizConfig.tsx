import { useState } from 'react';
import { Play } from 'lucide-react';
import type { QuizConfig } from '@/api/quiz';

interface QuizConfigPanelProps {
  onGenerate: (config: QuizConfig) => void;
  loading?: boolean;
}

const QuizConfigPanel = ({ onGenerate, loading }: QuizConfigPanelProps) => {
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [types, setTypes] = useState<string[]>(['multiple-choice']);

  const toggleType = (t: string) => {
    setTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-lg text-primary mb-1">Quiz Generator</h3>
        <p className="text-sm text-muted-foreground font-body">Generate custom quizzes from your document</p>
      </div>

      <div>
        <label className="text-xs text-muted-foreground font-body block mb-2">Number of Questions</label>
        <input
          type="number"
          min={1}
          max={50}
          value={numQuestions}
          onChange={(e) => setNumQuestions(Number(e.target.value))}
          className="w-full bg-surface border border-border/30 rounded-lg px-3 py-2 text-sm text-foreground font-body focus:outline-none focus:ring-1 focus:ring-ring"
          aria-label="Number of questions"
        />
      </div>

      <div>
        <label className="text-xs text-muted-foreground font-body block mb-2">Difficulty Level</label>
        <div className="flex gap-2">
          {(['easy', 'medium', 'hard'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`flex-1 py-2 text-sm rounded-lg border transition-all capitalize font-body active:scale-95 ${
                difficulty === d
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-transparent text-muted-foreground border-border/30 hover:text-foreground hover:border-border'
              }`}
              aria-label={`${d} difficulty`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-muted-foreground font-body block mb-2">Question Type</label>
        <div className="space-y-2">
          {[
            { id: 'multiple-choice', label: 'Multiple Choice' },
            { id: 'true-false', label: 'True / False' },
            { id: 'short-answer', label: 'Short Answer' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => toggleType(t.id)}
              className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all font-body ${
                types.includes(t.id)
                  ? 'border-primary bg-primary/5 text-foreground border-l-2'
                  : 'border-border/30 text-muted-foreground hover:text-foreground hover:border-border'
              }`}
              aria-label={`Select ${t.label}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => onGenerate({ numQuestions, difficulty, types })}
        disabled={loading || types.length === 0}
        className="w-full py-3 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-2 font-body"
        aria-label="Generate Quiz"
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" role="status" />
        ) : (
          <Play className="w-4 h-4" />
        )}
        {loading ? 'Generating...' : 'Generate Quiz'}
      </button>
    </div>
  );
};

export default QuizConfigPanel;
