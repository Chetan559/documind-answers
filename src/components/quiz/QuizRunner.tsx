import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Send } from "lucide-react";
import ProgressBar from "./ProgressBar";
import QuestionCard from "./QuestionCard";
import AnswerOption from "./AnswerOption";
import TrueFalseCard from "./TrueFalseCard";
import ShortAnswerInput from "./ShortAnswerInput";
import type { QuizQuestion } from "@/api/quiz";

interface Props {
  questions: QuizQuestion[];
  currentIndex: number;
  answers: Record<string, string>;
  onAnswer: (questionId: string, answer: string) => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  onExit: () => void;
  isSubmitting: boolean;
}

const slideVariants = {
  enter: { x: 60, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -60, opacity: 0 },
};

const QuizRunner = ({
  questions,
  currentIndex,
  answers,
  onAnswer,
  onNext,
  onPrev,
  onSubmit,
  onExit,
  isSubmitting,
}: Props) => {
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const question = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const isFirst = currentIndex === 0;
  const currentAnswer = answers[question?.id] ?? null;
  const answeredCount = Object.keys(answers).length;

  // For MCQ: track selected option index locally, derived from answers map
  const selectedMCQIndex = question?.options
    ? question.options.findIndex((opt) => opt === currentAnswer)
    : -1;

  // For True/False: track selected index
  const selectedTFIndex =
    currentAnswer === "True" ? 0 : currentAnswer === "False" ? 1 : null;

  const handleMCQSelect = useCallback(
    (index: number) => {
      if (!question?.options) return;
      onAnswer(question.id, question.options[index]);
    },
    [question, onAnswer],
  );

  const handleTFSelect = useCallback(
    (index: number) => {
      onAnswer(question.id, index === 0 ? "True" : "False");
    },
    [question, onAnswer],
  );

  const handleShortAnswer = useCallback(
    (answer: string) => {
      onAnswer(question.id, answer);
    },
    [question, onAnswer],
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (showExitConfirm) return;

      if (e.key === "Escape") {
        setShowExitConfirm(true);
        return;
      }

      if (e.key === "Enter" && !e.shiftKey) {
        if (isLast) return; // Don't auto-advance on last
        if (currentAnswer) onNext();
        return;
      }

      if (question?.question_type === "mcq" && question.options) {
        const num = parseInt(e.key);
        if (num >= 1 && num <= question.options.length) {
          handleMCQSelect(num - 1);
        }
      }

      if (question?.question_type === "true_false") {
        if (e.key.toLowerCase() === "t") handleTFSelect(0);
        if (e.key.toLowerCase() === "f") handleTFSelect(1);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    currentAnswer,
    question,
    handleMCQSelect,
    handleTFSelect,
    onNext,
    showExitConfirm,
    isLast,
  ]);

  if (!question) return null;

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
              <QuestionCard question={question.question_text} />

              {/* MCQ options */}
              {question.question_type === "mcq" && question.options && (
                <div
                  className="space-y-3"
                  role="radiogroup"
                  aria-label="Answer options"
                >
                  {question.options.map((opt, i) => (
                    <AnswerOption
                      key={i}
                      index={i}
                      text={opt}
                      isSelected={selectedMCQIndex === i}
                      onSelect={() => handleMCQSelect(i)}
                    />
                  ))}
                </div>
              )}

              {/* True/False */}
              {question.question_type === "true_false" && (
                <TrueFalseCard
                  selected={selectedTFIndex}
                  onSelect={handleTFSelect}
                />
              )}

              {/* Fill in the blank */}
              {question.question_type === "fill_in_the_blank" && (
                <ShortAnswerInput
                  onSubmit={handleShortAnswer}
                  value={currentAnswer || ""}
                />
              )}

              {/* Navigation buttons */}
              <div className="flex items-center justify-between gap-3">
                {/* Back button */}
                <div>
                  {!isFirst && (
                    <button
                      onClick={onPrev}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl border border-border/30 text-sm font-body text-foreground hover:bg-surface transition-all active:scale-[0.98]"
                      aria-label="Previous Question"
                    >
                      <ArrowLeft className="w-4 h-4" /> Previous
                    </button>
                  )}
                </div>

                {/* Next / Submit */}
                <div className="flex flex-col items-end gap-2">
                  {isLast ? (
                    <button
                      onClick={onSubmit}
                      disabled={isSubmitting}
                      className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-body font-medium hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50"
                      aria-label="Submit Quiz"
                    >
                      {isSubmitting ? (
                        <div
                          className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"
                          role="status"
                        />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      {isSubmitting
                        ? "Submitting..."
                        : `Submit Quiz (${answeredCount}/${questions.length})`}
                    </button>
                  ) : (
                    <button
                      onClick={onNext}
                      className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-body font-medium hover:bg-primary/90 transition-all active:scale-[0.98]"
                      aria-label="Next Question"
                    >
                      Next Question <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                  {!isLast && (
                    <span className="text-xs text-muted-foreground font-body">
                      Press Enter to continue
                    </span>
                  )}
                </div>
              </div>

              {/* Keyboard hint */}
              {question.question_type !== "fill_in_the_blank" && (
                <p className="text-xs text-muted-foreground font-body text-center">
                  {question.question_type === "mcq"
                    ? "Tip: Press 1–4 to select"
                    : "Tip: Press T or F to select"}
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
              <h3 className="font-display text-xl text-foreground">
                Exit Quiz?
              </h3>
              <p className="text-sm text-muted-foreground font-body">
                Your progress will be lost.
              </p>
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
