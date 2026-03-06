import { useState } from "react";
import { motion } from "framer-motion";
import type { QuizQuestion } from "@/api/quiz";

interface QuizCardProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answer: string) => void;
  onNext: () => void;
  isLast: boolean;
}

const QuizCard = ({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  onNext,
  isLast,
}: QuizCardProps) => {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (opt: string) => {
    setSelected(opt);
    onAnswer(opt);
  };

  const handleNext = () => {
    setSelected(null);
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground font-body">
            Question {questionNumber} of {totalQuestions}
          </span>
        </div>
        <div className="w-full bg-surface rounded-full h-1 mb-4">
          <div
            className="bg-primary h-1 rounded-full transition-all"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      <p className="font-display text-lg text-primary">
        {question.question_text}
      </p>

      {question.options && (
        <div className="space-y-2">
          {question.options.map((opt, i) => {
            let cls = "border-border/30 text-foreground hover:border-border";
            if (selected === opt)
              cls = "border-primary bg-primary/5 text-foreground";

            return (
              <button
                key={i}
                onClick={() => handleSelect(opt)}
                className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all font-body ${cls}`}
                aria-label={opt}
              >
                <span className="text-muted-foreground mr-2 font-body">
                  {String.fromCharCode(65 + i)}.
                </span>
                {opt}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleNext}
          disabled={selected === null}
          className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm disabled:opacity-50 transition-all active:scale-95 font-body"
          aria-label={isLast ? "See Results" : "Next Question"}
        >
          {isLast ? "See Results" : "Next Question"}
        </button>
      </div>
    </motion.div>
  );
};

export default QuizCard;
