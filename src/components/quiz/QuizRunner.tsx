import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import ProgressBar from './ProgressBar';
import QuestionCard from './QuestionCard';
import AnswerOption from './AnswerOption';
import TrueFalseCard from './TrueFalseCard';
import ShortAnswerInput from './ShortAnswerInput';
import ExplanationBlock from './ExplanationBlock';
import type { QuizQuestion, GradeResult } from '@/api/quiz';
import { gradeShortAnswer } from '@/api/quiz';
import type { AnswerRecord } from '@/hooks/useQuizState';

interface Props {
  questions: QuizQuestion[];
  currentIndex: number;
  isAnswered: boolean;
  onAnswer: (answer: AnswerRecord) => void;
  onNext: () => void;
  onExit: () => void;
}

const slideVariants = {
  enter: { x: 60, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -60, opacity: 0 },
};

const QuizRunner = ({ questions, currentIndex, isAnswered, onAnswer, onNext, onExit }: Props) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [gradeResult, setGradeResult] = useState<GradeResult | undefined>();
  const [isGrading, setIsGrading] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const question = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  // Reset selection on question change
  useEffect(() => {
    setSelected(null);
    setGradeResult(undefined);
    setIsGrading(false);
  }, [currentIndex]);

  const handleMCQSelect = useCallback((index: number) => {
    if (isAnswered) return;
    setSelected(index);
    const correct = index === question.correctIndex;
    onAnswer({ questionId: question.id, selectedIndex: index, correct });
  }, [isAnswered, question, onAnswer]);

  const handleShortAnswer = useCallback(async (answer: string) => {
    setIsGrading(true);
    try {
      const result = await gradeShortAnswer(question.id, answer);
      setGradeResult(result);
      onAnswer({
        questionId: question.id,
        shortAnswer: answer,
        correct: result.result === 'correct',
        gradeResult: result,
      });
    } finally {
      setIsGrading(false);
    }
  }, [question, onAnswer]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (showExitConfirm) return;

      if (e.key === 'Escape') {
        setShowExitConfirm(true);
        return;
      }

      if (e.key === 'Enter' && isAnswered) {
        onNext();
        return;
      }

      if (!isAnswered && question.type === 'multiple-choice' && question.options) {
        const num = parseInt(e.key);
        if (num >= 1 && num <= question.options.length) {
          handleMCQSelect(num - 1);
        }
      }

      if (!isAnswered && question.type === 'true-false') {
        if (e.key.toLowerCase() === 't') handleMCQSelect(0);
        if (e.key.toLowerCase() === 'f') handleMCQSelect(1);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isAnswered, question, handleMCQSelect, onNext, showExitConfirm]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Progress */}
      <div className="px-4 sm:px-8 pt-6">
        <ProgressBar current={currentIndex + 1} total={questions.length} />
      </div>

      {/* Question area */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-8">
        <div className="w-full max-w-[680px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="space-y-10"
            >
              <QuestionCard question={question.question} />

              {/* MCQ options */}
              {question.type === 'multiple-choice' && question.options && (
                <div className="space-y-3" role="radiogroup" aria-label="Answer options">
                  {question.options.map((opt, i) => (
                    <AnswerOption
                      key={i}
                      index={i}
                      text={opt}
                      isSelected={selected === i}
                      isAnswered={isAnswered}
                      isCorrect={i === question.correctIndex}
                      isUserChoice={selected === i}
                      onSelect={() => handleMCQSelect(i)}
                    />
                  ))}
                </div>
              )}

              {/* True/False */}
              {question.type === 'true-false' && (
                <TrueFalseCard
                  selected={selected}
                  isAnswered={isAnswered}
                  correctIndex={question.correctIndex ?? 0}
                  onSelect={handleMCQSelect}
                />
              )}

              {/* Short answer */}
              {question.type === 'short-answer' && (
                <ShortAnswerInput
                  onSubmit={handleShortAnswer}
                  isAnswered={isAnswered}
                  gradeResult={gradeResult}
                  correctAnswer={question.correctAnswer}
                  isGrading={isGrading}
                />
              )}

              {/* Explanation */}
              {isAnswered && (
                <ExplanationBlock
                  explanation={question.explanation}
                  sourcePage={question.sourcePage}
                />
              )}

              {/* Next button */}
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col items-end gap-2"
                >
                  <button
                    onClick={onNext}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-body font-medium hover:bg-primary/90 transition-all active:scale-[0.98]"
                    aria-label={isLast ? 'See Results' : 'Next Question'}
                  >
                    {isLast ? 'See Results' : 'Next Question'} <ArrowRight className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-muted-foreground font-body">Press Enter to continue</span>
                </motion.div>
              )}

              {/* Keyboard hint */}
              {!isAnswered && question.type !== 'short-answer' && (
                <p className="text-xs text-muted-foreground font-body text-center">
                  {question.type === 'multiple-choice'
                    ? 'Tip: Press 1–4 to select, Enter to continue'
                    : 'Tip: Press T or F to select'}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Exit confirmation modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface border border-border/30 rounded-2xl p-8 max-w-sm w-full mx-4 text-center space-y-4"
            >
              <h3 className="font-display text-xl text-foreground">Exit Quiz?</h3>
              <p className="text-sm text-muted-foreground font-body">Your progress will be lost.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-body font-medium hover:bg-primary/90 transition-all active:scale-[0.98]"
                >
                  Keep Going
                </button>
                <button
                  onClick={onExit}
                  className="flex-1 py-2.5 rounded-xl border border-red-400/30 text-red-400 text-sm font-body hover:bg-red-400/10 transition-all active:scale-[0.98]"
                >
                  Exit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuizRunner;
