import { motion } from "framer-motion";
import { RotateCcw, Sparkles, AlertTriangle, Lightbulb } from "lucide-react";
import ScoreCircle from "./ScoreCircle";
import ReviewAccordion from "./ReviewAccordion";
import type { QuizSubmitResult } from "@/api/quiz";

interface Props {
  result: QuizSubmitResult;
  onNewQuiz: () => void;
}

const QuizResults = ({ result, onNewQuiz }: Props) => {
  const {
    score,
    total,
    percentage,
    grade,
    per_question,
    weak_topics,
    recommendation,
  } = result;
  const wrongCount = per_question.filter((q) => !q.is_correct).length;
  const unanswered = per_question.filter((q) => q.user_answer === null).length;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", duration: 0.5 }}
      className="min-h-screen flex items-center justify-center px-4 py-12"
    >
      <div className="w-full max-w-lg space-y-8">
        {/* Score header */}
        <div className="text-center">
          <h2 className="font-display text-3xl text-foreground mb-6">
            Quiz Complete
          </h2>
          <ScoreCircle score={score} total={total} />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-4"
          >
            <span className="font-display text-xl text-foreground">
              {grade}
            </span>
            <span className="text-sm text-muted-foreground font-body ml-2">
              ({percentage.toFixed(1)}%)
            </span>
          </motion.div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Correct", value: score, delay: 0 },
            { label: "Wrong", value: wrongCount, delay: 0.08 },
            { label: "Skipped", value: unanswered, delay: 0.16 },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + stat.delay }}
              className="text-center p-4 rounded-xl border border-border/30 bg-surface"
            >
              <span className="font-display text-2xl text-foreground block">
                {stat.value}
              </span>
              <span className="text-xs text-muted-foreground font-body uppercase tracking-wider">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Weak topics chips */}
        {weak_topics.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-body uppercase tracking-wider">
              <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
              Areas to Improve
            </div>
            <div className="flex flex-wrap gap-2">
              {weak_topics.map((topic) => (
                <span
                  key={topic}
                  className="px-3 py-1.5 rounded-lg border border-yellow-400/30 bg-yellow-400/10 text-yellow-400 text-xs font-body font-medium"
                >
                  {topic}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recommendation callout */}
        {recommendation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="flex gap-3 p-4 bg-primary/5 border-l-[3px] border-l-primary rounded-r-xl"
          >
            <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-foreground font-body leading-relaxed">
              {recommendation}
            </p>
          </motion.div>
        )}

        {/* Per-question review */}
        <ReviewAccordion perQuestion={per_question} />

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={onNewQuiz}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-body font-medium hover:bg-primary/90 transition-all active:scale-[0.98]"
            aria-label="New Quiz"
          >
            <Sparkles className="w-4 h-4" /> New Quiz
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default QuizResults;
