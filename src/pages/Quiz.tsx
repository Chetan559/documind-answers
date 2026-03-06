import { useParams, useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useDocuments } from "@/context/DocumentContext";
import { useQuizState } from "@/hooks/useQuizState";
import { generateQuiz, submitQuiz } from "@/api/quiz";
import QuizSetup from "@/components/quiz/QuizSetup";
import QuizRunner from "@/components/quiz/QuizRunner";
import QuizResults from "@/components/quiz/QuizResults";

const QuizPage = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const { state: docState } = useDocuments();
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

  const doc = docState.documents.find((d) => d.id === documentId);

  // ── Generate quiz via API ──
  const handleStart = async () => {
    startLoading();
    try {
      const quiz = await generateQuiz(documentId || "", state.config);
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
      // Go back to active phase on error
      loadQuiz(state.quiz);
      if (err.message === "NOT_FOUND") {
        toast.error("Quiz not found.");
      } else {
        toast.error(err.message || "Failed to submit quiz.");
      }
    }
  };

  const handleExit = () => {
    navigate(documentId ? `/chat/${documentId}` : "/upload");
  };

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {state.phase === "setup" && (
          <QuizSetup
            key="setup"
            documentName={doc?.name}
            documentId={documentId}
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
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuizPage;
