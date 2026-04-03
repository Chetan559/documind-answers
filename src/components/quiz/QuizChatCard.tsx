import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  RotateCcw,
  BarChart2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Trophy,
  FileText,
  Clock,
} from "lucide-react";
import type { QuizCardData } from "@/types";

interface Props {
  messageId: string;
  quizData: QuizCardData;
  chatSessionId: string;
  onDelete: (messageId: string) => void;
  onQuizUpdated: (messageId: string, updatedQuiz: QuizCardData) => void;
}

type RetakeMode = "same" | "new" | null;

function getGradeColor(grade: string | null) {
  if (!grade) return "text-muted-foreground";
  if (grade === "A") return "text-emerald-400";
  if (grade === "B") return "text-blue-400";
  if (grade === "C") return "text-yellow-400";
  if (grade === "D") return "text-orange-400";
  return "text-red-400";
}

function StatusBadge({ status }: { status: string }) {
  const isEvaluated = status === "evaluated";
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${
        isEvaluated
          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
          : "bg-amber-500/10 text-amber-400 border-amber-500/30"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${isEvaluated ? "bg-emerald-400" : "bg-amber-400"}`}
      />
      {isEvaluated ? "Completed" : "Not taken"}
    </span>
  );
}

const QuizChatCard = ({ messageId, quizData, chatSessionId, onDelete, onQuizUpdated }: Props) => {
  const navigate = useNavigate();
  const [showRetakeMenu, setShowRetakeMenu] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { id: quizId, title, question_count, status, has_result, score, total, percentage, grade } = quizData;

  const handleOpenQuiz = () => {
    navigate(`/quiz/${quizData.pdf_id}?quizId=${quizId}&chatSession=${chatSessionId}`);
  };

  const handleRetakeSame = () => {
    setShowRetakeMenu(false);
    navigate(`/quiz/${quizData.pdf_id}?quizId=${quizId}&retake=same&chatSession=${chatSessionId}`);
  };

  const handleRetakeNew = () => {
    setShowRetakeMenu(false);
    navigate(`/quiz/${quizData.pdf_id}?quizId=${quizId}&retake=new&chatSession=${chatSessionId}`);
  };

  const handleViewResults = () => {
    navigate(`/quiz/${quizData.pdf_id}?quizId=${quizId}&view=results&chatSession=${chatSessionId}`);
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    onDelete(messageId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="ml-10 mt-1 max-w-sm"
    >
      <div className="bg-surface border border-border/30 rounded-2xl overflow-hidden shadow-sm">
        {/* Header */}
        <div className="px-4 pt-4 pb-3 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-foreground font-body truncate">
                {title || "Quiz"}
              </span>
              <StatusBadge status={status} />
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-muted-foreground font-body flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {question_count} questions
              </span>
              {quizData.pdf_ids && quizData.pdf_ids.length > 1 && (
                <span className="text-xs text-muted-foreground font-body flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {quizData.pdf_ids.length} docs
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Score row — visible if evaluated */}
        {has_result && percentage !== null && (
          <div className="mx-4 mb-3 px-3 py-2.5 rounded-xl bg-background/50 border border-border/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-body">
                {score}/{total} correct
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium font-body text-foreground">
                {percentage.toFixed(0)}%
              </span>
              <span className={`text-sm font-display font-bold ${getGradeColor(grade)}`}>
                {grade}
              </span>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="px-4 pb-4 flex items-center gap-2">
          {/* Retake button + dropdown */}
          <div className="relative flex-1">
            <div className="flex rounded-xl overflow-hidden border border-border/30">
              <button
                onClick={has_result ? handleRetakeSame : handleOpenQuiz}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-body font-medium text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-all"
                title={has_result ? "Retake quiz" : "Start quiz"}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {has_result ? "Retake" : "Start"}
              </button>
              {/* Dropdown toggle — only show if already evaluated */}
              {has_result && (
                <button
                  onClick={() => setShowRetakeMenu((v) => !v)}
                  className="px-2 border-l border-border/30 text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-all"
                  title="Retake options"
                >
                  {showRetakeMenu ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>
              )}
            </div>

            {/* Retake dropdown menu */}
            <AnimatePresence>
              {showRetakeMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute bottom-full left-0 mb-1.5 w-full bg-background border border-border/30 rounded-xl overflow-hidden shadow-lg z-20"
                >
                  <button
                    onClick={handleRetakeSame}
                    className="w-full text-left px-3 py-2 text-xs font-body text-muted-foreground hover:text-foreground hover:bg-surface transition-all"
                  >
                    Same questions
                  </button>
                  <div className="h-px bg-border/20" />
                  <button
                    onClick={handleRetakeNew}
                    className="w-full text-left px-3 py-2 text-xs font-body text-muted-foreground hover:text-foreground hover:bg-surface transition-all"
                  >
                    New questions
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* View Results */}
          {has_result && (
            <button
              onClick={handleViewResults}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border/30 text-xs font-body font-medium text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-all"
              title="View analysis"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              Results
            </button>
          )}

          {/* Delete (chat only) */}
          <button
            onClick={handleDelete}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all text-xs font-body font-medium ${
              confirmDelete
                ? "border-red-500/50 text-red-400 bg-red-500/10"
                : "border-border/30 text-muted-foreground hover:text-red-400 hover:border-red-500/30"
            }`}
            title={confirmDelete ? "Click again to confirm" : "Remove from chat"}
          >
            <Trash2 className="w-3.5 h-3.5" />
            {confirmDelete ? "Sure?" : ""}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default QuizChatCard;
