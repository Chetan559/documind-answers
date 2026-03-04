import { useParams, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useDocuments } from '@/context/DocumentContext';
import { useQuizState } from '@/hooks/useQuizState';
import { generateQuiz } from '@/api/quiz';
import QuizSetup from '@/components/quiz/QuizSetup';
import QuizRunner from '@/components/quiz/QuizRunner';
import QuizResults from '@/components/quiz/QuizResults';

const QuizPage = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const { state: docState } = useDocuments();
  const { state, score, wrongAnswers, setConfig, startLoading, loadQuestions, answerQuestion, nextQuestion, resetQuiz, resetToSetup } = useQuizState();

  const doc = docState.documents.find(d => d.id === documentId);

  const handleStart = async () => {
    startLoading();
    try {
      const qs = await generateQuiz(documentId || '', state.config);
      loadQuestions(qs);
    } catch {
      resetToSetup();
    }
  };

  const handleExit = () => {
    navigate(documentId ? `/chat/${documentId}` : '/upload');
  };

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {state.phase === 'setup' && (
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

        {state.phase === 'active' && (
          <QuizRunner
            key="active"
            questions={state.questions}
            currentIndex={state.currentIndex}
            isAnswered={state.isAnswered}
            onAnswer={answerQuestion}
            onNext={nextQuestion}
            onExit={handleExit}
          />
        )}

        {state.phase === 'results' && (
          <QuizResults
            key="results"
            score={score}
            total={state.questions.length}
            questions={state.questions}
            answers={state.answers}
            wrongAnswers={wrongAnswers}
            onRetake={resetQuiz}
            onNewQuiz={resetToSetup}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuizPage;
