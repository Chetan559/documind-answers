import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAppStore } from "@/store/useAppStore";
import { useQuizState } from "@/hooks/useQuizState";
import {
  generateQuiz,
  submitQuiz,
  getQuiz,
  getQuizResult,
  retakeQuizSame,
} from "@/api/quiz";
import QuizSetup from "@/components/quiz/QuizSetup";
import QuizRunner from "@/components/quiz/QuizRunner";
import QuizResults from "@/components/quiz/QuizResults";
import type { QuizCardData } from "@/types";

const QuizPage = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { documents, sessions, activeSessionId, addMessageToSession } = useAppStore();

  // URL params
  const chatSessionId = searchParams.get("chatSession");   // backend chat session ID
  const quizId = searchParams.get("quizId");               // existing quiz session ID
  const retakeMode = searchParams.get("retake");           // "same" | "new"
  const viewMode = searchParams.get("view");               // "results"

  const {
    state,
    setConfig,
    startLoading,
    loadQuiz,
    setAnswer,
    nextQuestion,
    prevQuestion,
    startSubmitting,
    loadResult,
    resetToSetup,
  } = useQuizState();

  const doc = documents.find((d) => d.id === documentId);

  // Docs available in the active chat session for multi-doc selector
  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const sessionDocs = (activeSession?.documentIds || [])
    .map((id) => documents.find((d) => d.id === id))
    .filter(Boolean) as typeof documents;

  // Pre-selected doc IDs for retake-new (same selection as original quiz)
  const [preSelectedDocIds, setPreSelectedDocIds] = useState<string[] | undefined>(undefined);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  // ── Bootstrap: handle retake / view modes on mount ──
  useEffect(() => {
    (async () => {
      try {
        if (viewMode === "results" && quizId) {
          // Show saved results without re-evaluating
          startLoading();
          try {
            const result = await getQuizResult(quizId);
            loadResult(result);
          } catch {
            toast.error("Could not load quiz results.");
            resetToSetup();
          }
          return;
        }

        if (retakeMode === "same" && quizId) {
          // Clone immediately — no setup needed
          startLoading();
          try {
            const cloned = await retakeQuizSame(quizId, { chat_session_id: chatSessionId });
            // Post new quiz card to chat store
            if (chatSessionId && activeSessionId) {
              _injectQuizCard(cloned.id, cloned);
            }
            loadQuiz(cloned);
          } catch (err: any) {
            toast.error(err.message || "Failed to retake quiz.");
            resetToSetup();
          }
          return;
        }

        if (retakeMode === "new" && quizId) {
          // Load original quiz to pre-fill config and doc selection
          try {
            const original = await getQuiz(quizId);
            setPreSelectedDocIds(original.pdf_ids || [original.pdf_id]);
            setConfig({
              question_type: original.questions[0]?.question_type || "mcq",
              difficulty: original.questions[0]?.difficulty || "medium",
              count: original.question_count,
            });
          } catch {/* ignore — just show setup normally */}
          return;
        }

        if (quizId && !retakeMode && !viewMode) {
          // Load existing quiz directly (e.g. navigating back)
          startLoading();
          try {
            const quiz = await getQuiz(quizId);
            if (quiz.status === "evaluated") {
              const result = await getQuizResult(quizId);
              loadResult(result);
            } else {
              loadQuiz(quiz);
            }
          } catch {
            resetToSetup();
          }
          return;
        }
      } finally {
        setIsBootstrapping(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper: inject quiz card message into local store
  const _injectQuizCard = (
    newQuizId: string,
    quizData: {
      id: string; pdf_id: string; pdf_ids: string[];
      status: string; question_count: number; title: string | null;
      chat_session_id: string | null; has_result: boolean;
      score: number | null; total: number | null;
      percentage: number | null; grade: string | null; created_at: string;
    },
  ) => {
    if (!activeSessionId) return;
    addMessageToSession(activeSessionId, {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
      message_type: "quiz",
      quiz_session_id: newQuizId,
      quiz_data: quizData as QuizCardData,
    });
  };

  // ── Generate quiz via API ──
  const handleStart = async (selectedPdfIds: string[]) => {
    if (!documentId) return;
    startLoading();
    try {
      const primaryPdfId = selectedPdfIds[0] || documentId;
      const extraIds = selectedPdfIds.filter((id) => id !== primaryPdfId);

      const quiz = await generateQuiz(
        primaryPdfId,
        state.config,
        {
          pdf_ids: extraIds,
          chat_session_id: chatSessionId,
          title: undefined,
        },
      );

      // Add quiz card message to local chat store
      if (chatSessionId && activeSessionId) {
        _injectQuizCard(quiz.id, {
          id: quiz.id,
          pdf_id: quiz.pdf_id,
          pdf_ids: quiz.pdf_ids,
          status: quiz.status,
          question_count: quiz.question_count,
          title: quiz.title,
          chat_session_id: quiz.chat_session_id,
          has_result: false,
          score: null,
          total: null,
          percentage: null,
          grade: null,
          created_at: quiz.created_at,
        });
      }

      loadQuiz(quiz);
    } catch (err: any) {
      resetToSetup();
      if (err.message === "PDF_NOT_READY") {
        toast.error("PDF is still processing. Please wait until it's ready.");
      } else if (err.message === "NOT_FOUND") {
        toast.error("PDF not found.");
      } else {
        toast.error(err.message || "Failed to generate quiz.");
      }
    }
  };

  // ── Submit quiz answers to API ──
  const handleSubmit = async () => {
    if (!state.quiz) return;
    startSubmitting();
    try {
      const result = await submitQuiz(state.quiz.id, state.answers);
      loadResult(result);
    } catch (err: any) {
      loadQuiz(state.quiz);
      if (err.message === "NOT_FOUND") {
        toast.error("Quiz not found.");
      } else {
        toast.error(err.message || "Failed to submit quiz.");
      }
    }
  };

  const handleExit = () => {
    // Navigate back to chat with the correct session
    if (documentId) {
      navigate(`/chat`);
    } else {
      navigate("/upload");
    }
  };

  if (isBootstrapping) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex gap-1 items-center">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {state.phase === "setup" && (
          <QuizSetup
            key="setup"
            documentName={doc?.name}
            documentId={documentId}
            sessionDocs={sessionDocs}
            preSelectedDocIds={preSelectedDocIds}
            config={state.config}
            onConfigChange={setConfig}
            onStart={handleStart}
            loading={state.isLoading}
          />
        )}

        {(state.phase === "active" || state.phase === "submitting") &&
          state.quiz && (
            <QuizRunner
              key="active"
              questions={state.quiz.questions}
              currentIndex={state.currentIndex}
              answers={state.answers}
              onAnswer={setAnswer}
              onNext={nextQuestion}
              onPrev={prevQuestion}
              onSubmit={handleSubmit}
              onExit={handleExit}
              isSubmitting={state.phase === "submitting"}
            />
          )}

        {state.phase === "results" && state.result && (
          <QuizResults
            key="results"
            result={state.result}
            onNewQuiz={resetToSetup}
            onExit={handleExit}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuizPage;
