import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { QuizQuestion } from '@/api/quiz';
import type { AnswerRecord } from '@/hooks/useQuizState';

interface Props {
  questions: QuizQuestion[];
  wrongAnswers: AnswerRecord[];
}

const ReviewAccordion = ({ questions, wrongAnswers }: Props) => {
  const [open, setOpen] = useState(false);

  if (wrongAnswers.length === 0) return null;

  const wrongQuestions = wrongAnswers.map(a => {
    const q = questions.find(q => q.id === a.questionId);
    return { ...a, question: q };
  });

  return (
    <div className="w-full">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 rounded-xl border border-border/30 bg-surface text-sm font-body text-foreground hover:border-foreground/50 transition-all"
        aria-expanded={open}
        aria-label="Review Incorrect Answers"
      >
        <span>Review Incorrect Answers</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 pt-3">
              {wrongQuestions.map(({ question: q, selectedIndex }, i) => {
                if (!q) return null;
                return (
                  <div key={q.id} className="p-4 rounded-xl border border-border/20 bg-surface space-y-2">
                    <p className="text-sm font-body text-foreground">{q.question}</p>
                    {q.options && selectedIndex !== undefined && (
                      <div className="flex flex-col gap-1 text-xs font-body">
                        <span className="text-red-400">Your answer: {q.options[selectedIndex]}</span>
                        <span className="text-green-400">Correct: {q.options[q.correctIndex!]}</span>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground font-body italic">{q.explanation}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReviewAccordion;
