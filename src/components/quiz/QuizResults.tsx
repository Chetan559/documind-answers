import { motion } from 'framer-motion';
import { RotateCcw, Sparkles, Download } from 'lucide-react';
import ScoreCircle from './ScoreCircle';
import ReviewAccordion from './ReviewAccordion';
import type { QuizQuestion } from '@/api/quiz';
import type { AnswerRecord } from '@/hooks/useQuizState';

interface Props {
  score: number;
  total: number;
  questions: QuizQuestion[];
  answers: AnswerRecord[];
  wrongAnswers: AnswerRecord[];
  onRetake: () => void;
  onNewQuiz: () => void;
}

const getGrade = (pct: number) => {
  if (pct === 100) return { label: 'Perfect!', icon: '🏆' };
  if (pct >= 80)  return { label: 'Great Job!', icon: '🏅' };
  if (pct >= 60)  return { label: 'Good Effort', icon: '👍' };
  if (pct >= 40)  return { label: 'Keep Studying', icon: '📖' };
  return { label: 'Needs Review', icon: '🔁' };
};

const QuizResults = ({ score, total, questions, answers, wrongAnswers, onRetake, onNewQuiz }: Props) => {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const grade = getGrade(pct);
  const skipped = total - answers.length;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', duration: 0.5 }}
      className="min-h-screen flex items-center justify-center px-4 py-12"
    >
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center">
          <h2 className="font-display text-3xl text-foreground mb-6">Quiz Complete</h2>
          <ScoreCircle score={score} total={total} />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-4"
          >
            <span className="text-2xl mr-2">{grade.icon}</span>
            <span className="font-display text-xl text-foreground">{grade.label}</span>
          </motion.div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Correct', value: score, delay: 0 },
            { label: 'Wrong', value: wrongAnswers.length, delay: 0.08 },
            { label: 'Skipped', value: skipped, delay: 0.16 },
          ].map(stat => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + stat.delay }}
              className="text-center p-4 rounded-xl border border-border/30 bg-surface"
            >
              <span className="font-display text-2xl text-foreground block">{stat.value}</span>
              <span className="text-xs text-muted-foreground font-body uppercase tracking-wider">{stat.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Review */}
        <ReviewAccordion questions={questions} wrongAnswers={wrongAnswers} />

        {/* Actions */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onRetake}
              className="flex items-center justify-center gap-2 py-3 rounded-xl border border-border/30 text-sm font-body text-foreground hover:bg-surface transition-all active:scale-[0.98]"
              aria-label="Retake Quiz"
            >
              <RotateCcw className="w-4 h-4" /> Retake
            </button>
            <button
              onClick={onNewQuiz}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-body font-medium hover:bg-primary/90 transition-all active:scale-[0.98]"
              aria-label="New Quiz"
            >
              <Sparkles className="w-4 h-4" /> New Quiz
            </button>
          </div>
          <button
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border/30 text-sm font-body text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-all active:scale-[0.98]"
            aria-label="Download Results PDF"
          >
            <Download className="w-4 h-4" /> Download Results PDF
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default QuizResults;
