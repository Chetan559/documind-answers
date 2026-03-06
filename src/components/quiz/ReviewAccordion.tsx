import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, X } from "lucide-react";
import type { PerQuestionResult } from "@/api/quiz";

interface Props {
  perQuestion: PerQuestionResult[];
}

const ReviewAccordion = ({ perQuestion }: Props) => {
  const [open, setOpen] = useState(false);

  if (perQuestion.length === 0) return null;

  return (
    <div className="w-full">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 rounded-xl border border-border/30 bg-surface text-sm font-body text-foreground hover:border-foreground/50 transition-all"
        aria-expanded={open}
        aria-label="Review All Answers"
      >
        <span>Review All Answers</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 pt-3">
              {perQuestion.map((item, i) => (
                <div
                  key={item.question_id}
                  className={`p-4 rounded-xl border space-y-2 ${
                    item.is_correct
                      ? "border-green-400/30 bg-green-400/[0.04]"
                      : "border-red-400/30 bg-red-400/[0.04]"
                  }`}
                >
                  {/* Question text with correct/incorrect icon */}
                  <div className="flex items-start gap-2">
                    <span
                      className={`mt-0.5 shrink-0 ${item.is_correct ? "text-green-400" : "text-red-400"}`}
                    >
                      {item.is_correct ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                    </span>
                    <p className="text-sm font-body text-foreground">
                      {item.question_text}
                    </p>
                  </div>

                  {/* Answer comparison */}
                  <div className="flex flex-col gap-1 text-xs font-body ml-6">
                    <span
                      className={
                        item.is_correct ? "text-green-400" : "text-red-400"
                      }
                    >
                      Your answer: {item.user_answer ?? "(skipped)"}
                    </span>
                    {!item.is_correct && (
                      <span className="text-green-400">
                        Correct answer: {item.correct_answer}
                      </span>
                    )}
                  </div>

                  {/* Explanation */}
                  {item.explanation && (
                    <p className="text-xs text-muted-foreground font-body italic ml-6">
                      {item.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReviewAccordion;
