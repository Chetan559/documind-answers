import { useState } from 'react';
import { motion } from 'framer-motion';
import type { QuizQuestion } from '@/api/quiz';

interface QuizCardProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  onNext: () => void;
  isLast: boolean;
}

const QuizCard = ({ question, questionNumber, totalQuestions, onNext, isLast }: QuizCardProps) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);

  const isCorrect = selected === question.correctIndex;

  const handleCheck = () => setChecked(true);

  const handleNext = () => {
    setSelected(null);
    setChecked(false);
    onNext();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground font-body">Question {questionNumber} of {totalQuestions}</span>
        </div>
        <div className="w-full bg-surface rounded-full h-1 mb-4">
          <div className="bg-primary h-1 rounded-full transition-all" style={{ width: `${(questionNumber / totalQuestions) * 100}%` }} />
        </div>
      </div>

      <p className="font-display text-lg text-primary">{question.question}</p>

      {question.options && (
        <div className="space-y-2">
          {question.options.map((opt, i) => {
            let cls = 'border-border/30 text-foreground hover:border-border';
            if (checked && i === question.correctIndex) cls = 'border-green-500 bg-green-500/10 text-foreground';
            else if (checked && i === selected && !isCorrect) cls = 'border-destructive bg-destructive/10 text-foreground';
            else if (selected === i) cls = 'border-primary bg-primary/5 text-foreground';

            return (
              <button
                key={i}
                onClick={() => !checked && setSelected(i)}
                disabled={checked}
                className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all font-body ${cls}`}
                aria-label={opt}
              >
                <span className="text-muted-foreground mr-2 font-body">{String.fromCharCode(65 + i)}.</span>
                {opt}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex gap-3">
        {!checked ? (
          <button
            onClick={handleCheck}
            disabled={selected === null}
            className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm disabled:opacity-50 transition-all active:scale-95 font-body"
            aria-label="Check Answer"
          >
            Check Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm transition-all active:scale-95 font-body"
            aria-label={isLast ? 'See Results' : 'Next Question'}
          >
            {isLast ? 'See Results' : 'Next Question'}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default QuizCard;
