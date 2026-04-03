import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  Play,
  Minus,
  Plus,
  LayoutDashboard,
  Check,
  Files,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { GenerateConfig } from "@/api/quiz";
import type { PDFDocument } from "@/types";

interface Props {
  documentName?: string;
  documentId?: string;
  /** All available docs in the current session */
  sessionDocs?: PDFDocument[];
  /** Pre-selected PDF IDs (for retake-new flow) */
  preSelectedDocIds?: string[];
  config: GenerateConfig;
  onConfigChange: (config: Partial<GenerateConfig>) => void;
  onStart: (selectedPdfIds: string[]) => void;
  loading: boolean;
}

// Map API values to display labels
const questionTypes = [
  { id: "mcq" as const, label: "Multiple Choice", desc: "4 answer options" },
  { id: "true_false" as const, label: "True / False", desc: "Binary choice" },
  {
    id: "fill_in_the_blank" as const,
    label: "Fill in the Blank",
    desc: "Type your answer",
  },
];

const QuizSetup = ({
  documentName,
  documentId,
  sessionDocs = [],
  preSelectedDocIds,
  config,
  onConfigChange,
  onStart,
  loading,
}: Props) => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState(config.topic || "");

  // Doc selection state — default to preSelected or all
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(() => {
    if (preSelectedDocIds && preSelectedDocIds.length > 0) {
      return new Set(preSelectedDocIds);
    }
    // Default: select all available docs (at minimum the primary)
    const ids = sessionDocs.filter((d) => d.status === "ready").map((d) => d.id);
    if (ids.length === 0 && documentId) return new Set([documentId]);
    return new Set(ids);
  });

  // Ensure primary doc is always shown at the top-level
  const availableDocs = sessionDocs.filter((d) => d.status === "ready");
  const hasMultipleDocs = availableDocs.length > 1;

  const toggleDoc = (docId: string) => {
    setSelectedDocIds((prev) => {
      const next = new Set(prev);
      if (next.has(docId)) {
        // Can't deselect if it's the only one or the primary (always need >= 1)
        if (next.size <= 1) return prev;
        next.delete(docId);
      } else {
        next.add(docId);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedDocIds(new Set(availableDocs.map((d) => d.id)));
  };

  const allSelected = availableDocs.length > 0 && availableDocs.every((d) => selectedDocIds.has(d.id));

  const adjustCount = (delta: number) => {
    const n = Math.max(3, Math.min(20, config.count + delta));
    onConfigChange({ count: n });
  };

  const handleStart = () => {
    onConfigChange({ topic: topic.trim() || null });
    const ids = Array.from(selectedDocIds);
    // Ensure primary doc is first
    const sorted = documentId
      ? [documentId, ...ids.filter((id) => id !== documentId)]
      : ids;
    setTimeout(() => onStart(sorted), 0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
    >
      {/* Back buttons */}
      <div className="w-full max-w-lg mb-6 flex items-center justify-between">
        <button
          onClick={() =>
            navigate(documentId ? `/chat/${documentId}` : "/upload")
          }
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-body"
          aria-label="Back to Chat"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Chat
        </button>
        <button
          onClick={() => navigate("/upload")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-body"
          aria-label="My Documents"
        >
          <LayoutDashboard className="w-4 h-4" /> My Documents
        </button>
      </div>

      {/* Document badge (single doc) — only when no multi-doc selector */}
      {documentName && !hasMultipleDocs && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border/30 mb-8">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground font-body truncate max-w-[200px]">
            {documentName}
          </span>
        </div>
      )}

      {/* Setup card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-lg bg-surface border border-border/20 rounded-2xl p-8 space-y-8"
      >
        <div className="text-center">
          <h2 className="font-display text-3xl text-foreground mb-1">
            Quiz Mode
          </h2>
          <p className="text-sm text-muted-foreground font-body">
            Test your knowledge
          </p>
        </div>

        {/* ── Document selector (multi-doc) ── */}
        {hasMultipleDocs && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs text-muted-foreground font-body uppercase tracking-wider flex items-center gap-1.5">
                <Files className="w-3.5 h-3.5" />
                Documents
              </label>
              <button
                onClick={allSelected ? () => {
                  // keep at least one selected (primary)
                  if (documentId) setSelectedDocIds(new Set([documentId]));
                } : selectAll}
                className="text-xs font-body text-muted-foreground hover:text-foreground transition-colors"
              >
                {allSelected ? "Deselect all" : "Select all"}
              </button>
            </div>
            <div className="space-y-1.5">
              {availableDocs.map((doc) => {
                const isSelected = selectedDocIds.has(doc.id);
                const isPrimary = doc.id === documentId;
                return (
                  <button
                    key={doc.id}
                    onClick={() => toggleDoc(doc.id)}
                    disabled={isPrimary && selectedDocIds.size === 1}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm transition-all font-body text-left ${
                      isSelected
                        ? "border-primary/40 bg-primary/5 text-foreground"
                        : "border-border/30 text-muted-foreground hover:text-foreground hover:border-foreground/50"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    aria-label={`Toggle ${doc.name}`}
                  >
                    <span
                      className={`w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors ${
                        isSelected ? "border-primary bg-primary" : "border-muted-foreground/40"
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                    </span>
                    <FileText className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate flex-1">{doc.name}</span>
                    {isPrimary && (
                      <span className="text-[10px] text-muted-foreground/60 shrink-0">primary</span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground/60 font-body mt-2">
              {selectedDocIds.size} of {availableDocs.length} docs selected
            </p>
          </div>
        )}

        {/* Question count stepper */}
        <div>
          <label className="text-xs text-muted-foreground font-body block mb-3 uppercase tracking-wider">
            Questions
          </label>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => adjustCount(-1)}
              disabled={config.count <= 3}
              className="w-10 h-10 rounded-xl border border-border/30 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-all disabled:opacity-30 active:scale-95"
              aria-label="Decrease questions"
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              type="number"
              min={3}
              max={20}
              value={config.count}
              onChange={(e) =>
                onConfigChange({
                  count: Math.max(3, Math.min(20, Number(e.target.value) || 3)),
                })
              }
              className="w-20 text-center bg-transparent border border-border/30 rounded-xl py-2 text-2xl font-display text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              aria-label="Number of questions"
            />
            <button
              onClick={() => adjustCount(1)}
              disabled={config.count >= 20}
              className="w-10 h-10 rounded-xl border border-border/30 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-all disabled:opacity-30 active:scale-95"
              aria-label="Increase questions"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="text-xs text-muted-foreground font-body block mb-3 uppercase tracking-wider">
            Difficulty
          </label>
          <div className="flex gap-2">
            {(["easy", "medium", "hard"] as const).map((d) => (
              <button
                key={d}
                onClick={() => onConfigChange({ difficulty: d })}
                className={`flex-1 py-2.5 text-sm rounded-xl border transition-all capitalize font-body active:scale-[0.98] ${
                  config.difficulty === d
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-transparent text-muted-foreground border-border/30 hover:text-foreground hover:border-foreground/50"
                }`}
                aria-label={`${d} difficulty`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Question type */}
        <div>
          <label className="text-xs text-muted-foreground font-body block mb-3 uppercase tracking-wider">
            Type
          </label>
          <div className="space-y-2">
            {questionTypes.map((t) => {
              const active = config.question_type === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => onConfigChange({ question_type: t.id })}
                  className={`w-full flex items-center gap-3 text-left px-4 py-3.5 rounded-xl border text-sm transition-all font-body ${
                    active
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border/30 text-muted-foreground hover:text-foreground hover:border-foreground/50"
                  }`}
                  aria-label={`Select ${t.label}`}
                >
                  <span
                    className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                      active ? "border-primary" : "border-muted-foreground/40"
                    }`}
                  >
                    {active && <span className="w-2 h-2 rounded-full bg-primary" />}
                  </span>
                  <div>
                    <span className="block">{t.label}</span>
                    <span className="text-xs text-muted-foreground">{t.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional topic input */}
        <div>
          <label className="text-xs text-muted-foreground font-body block mb-3 uppercase tracking-wider">
            Topic{" "}
            <span className="normal-case text-muted-foreground/60">(optional)</span>
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Machine Learning, Chapter 3..."
            className="w-full bg-transparent border border-border/30 rounded-xl px-4 py-2.5 text-sm text-foreground font-body placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring"
            aria-label="Focus topic"
          />
        </div>

        {/* Start button */}
        <button
          onClick={handleStart}
          disabled={loading || selectedDocIds.size === 0}
          className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl text-sm hover:bg-primary/90 disabled:opacity-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2 font-body font-medium"
          aria-label="Start Quiz"
        >
          {loading ? (
            <div
              className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"
              role="status"
            />
          ) : (
            <Play className="w-4 h-4" />
          )}
          {loading ? "Generating..." : "Start Quiz"}
        </button>
      </motion.div>
    </motion.div>
  );
};

export default QuizSetup;
