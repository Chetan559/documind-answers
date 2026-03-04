import { useState } from 'react';
import { motion } from 'framer-motion';
import type { GradeResult } from '@/api/quiz';

interface Props {
  onSubmit: (answer: string) => void;
  isAnswered: boolean;
  gradeResult?: GradeResult;
  correctAnswer?: string;
  isGrading: boolean;
}

const ShortAnswerInput = ({ onSubmit, isAnswered, gradeResult, correctAnswer, isGrading }: Props) => {
  const [text, setText] = useState('');

  const badgeColors: Record<string, string> = {
    correct: 'bg-green-400/10 text-green-400 border-green-400/30',
    partial: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30',
    incorrect: 'bg-red-400/10 text-red-400 border-red-400/30',
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          disabled={isAnswered}
          maxLength={500}
          placeholder="Type your answer here..."
          className="w-full min-h-[96px] bg-surface border border-border/30 rounded-xl px-4 py-3 text-sm text-foreground font-body placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none disabled:opacity-60"
          aria-label="Your answer"
        />
        <span className="absolute bottom-2 right-3 text-xs text-muted-foreground font-body">
          {text.length} / 500
        </span>
      </div>

      {!isAnswered && (
        <button
          onClick={() => text.trim() && onSubmit(text.trim())}
          disabled={!text.trim() || isGrading}
          className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-body font-medium disabled:opacity-50 transition-all active:scale-[0.98] flex items-center gap-2"
          aria-label="Submit Answer"
        >
          {isGrading ? (
            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" role="status" />
          ) : null}
          {isGrading ? 'Grading...' : 'Submit Answer'}
        </button>
      )}

      {isAnswered && gradeResult && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <span className={`inline-block px-3 py-1 rounded-lg border text-xs font-body font-medium capitalize ${badgeColors[gradeResult.result]}`}>
            {gradeResult.result === 'partial' ? 'Partially Correct' : gradeResult.result}
          </span>
          <p className="text-sm text-muted-foreground font-body">{gradeResult.feedback}</p>
          {correctAnswer && (
            <div className="p-3 bg-green-400/[0.06] border border-green-400/20 rounded-xl">
              <p className="text-xs text-muted-foreground font-body mb-1 uppercase tracking-wider">Model Answer</p>
              <p className="text-sm text-foreground font-body">{correctAnswer}</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default ShortAnswerInput;
