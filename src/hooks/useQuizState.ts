import { useReducer, useCallback } from "react";
import type {
  Quiz,
  QuizQuestion,
  QuizSubmitResult,
  GenerateConfig,
} from "@/api/quiz";

// ── State shape ──

export interface QuizState {
  phase: "setup" | "active" | "submitting" | "results";
  config: GenerateConfig;
  quiz: Quiz | null; // full quiz object from server
  currentIndex: number;
  answers: Record<string, string>; // { [questionId]: userAnswer }
  result: QuizSubmitResult | null; // server grading result
  isLoading: boolean;
}

// ── Actions ──

type QuizAction =
  | { type: "SET_CONFIG"; payload: Partial<GenerateConfig> }
  | { type: "START_LOADING" }
  | { type: "LOAD_QUIZ"; payload: Quiz }
  | { type: "SET_ANSWER"; payload: { questionId: string; answer: string } }
  | { type: "NEXT_QUESTION" }
  | { type: "PREV_QUESTION" }
  | { type: "START_SUBMITTING" }
  | { type: "LOAD_RESULT"; payload: QuizSubmitResult }
  | { type: "APPEND_QUESTIONS"; payload: QuizQuestion[] }
  | { type: "RESET_TO_SETUP" };

const initialConfig: GenerateConfig = {
  count: 5,
  question_type: "mcq",
  difficulty: "medium",
  topic: null,
};

const initialState: QuizState = {
  phase: "setup",
  config: initialConfig,
  quiz: null,
  currentIndex: 0,
  answers: {},
  result: null,
  isLoading: false,
};

function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case "SET_CONFIG":
      return { ...state, config: { ...state.config, ...action.payload } };

    case "START_LOADING":
      return { ...state, isLoading: true };

    case "LOAD_QUIZ":
      return {
        ...state,
        isLoading: false,
        phase: "active",
        quiz: action.payload,
        currentIndex: 0,
        answers: {},
        result: null,
      };

    case "SET_ANSWER":
      return {
        ...state,
        answers: {
          ...state.answers,
          [action.payload.questionId]: action.payload.answer,
        },
      };

    case "NEXT_QUESTION": {
      const total = state.quiz?.questions.length ?? 0;
      const nextIdx = Math.min(state.currentIndex + 1, total - 1);
      return { ...state, currentIndex: nextIdx };
    }

    case "PREV_QUESTION":
      return { ...state, currentIndex: Math.max(state.currentIndex - 1, 0) };

    case "START_SUBMITTING":
      return { ...state, phase: "submitting", isLoading: true };

    case "LOAD_RESULT":
      return {
        ...state,
        isLoading: false,
        phase: "results",
        result: action.payload,
      };

    case "APPEND_QUESTIONS":
      if (!state.quiz) return state;
      return {
        ...state,
        quiz: {
          ...state.quiz,
          questions: [...state.quiz.questions, ...action.payload],
          question_count: state.quiz.question_count + action.payload.length,
        },
      };

    case "RESET_TO_SETUP":
      return { ...initialState };

    default:
      return state;
  }
}

// ── Hook ──

export function useQuizState() {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  const setConfig = useCallback(
    (config: Partial<GenerateConfig>) =>
      dispatch({ type: "SET_CONFIG", payload: config }),
    [],
  );
  const startLoading = useCallback(
    () => dispatch({ type: "START_LOADING" }),
    [],
  );
  const loadQuiz = useCallback(
    (quiz: Quiz) => dispatch({ type: "LOAD_QUIZ", payload: quiz }),
    [],
  );
  const setAnswer = useCallback(
    (questionId: string, answer: string) =>
      dispatch({ type: "SET_ANSWER", payload: { questionId, answer } }),
    [],
  );
  const nextQuestion = useCallback(
    () => dispatch({ type: "NEXT_QUESTION" }),
    [],
  );
  const prevQuestion = useCallback(
    () => dispatch({ type: "PREV_QUESTION" }),
    [],
  );
  const startSubmitting = useCallback(
    () => dispatch({ type: "START_SUBMITTING" }),
    [],
  );
  const loadResult = useCallback(
    (result: QuizSubmitResult) =>
      dispatch({ type: "LOAD_RESULT", payload: result }),
    [],
  );
  const appendQuestions = useCallback(
    (questions: QuizQuestion[]) =>
      dispatch({ type: "APPEND_QUESTIONS", payload: questions }),
    [],
  );
  const resetToSetup = useCallback(
    () => dispatch({ type: "RESET_TO_SETUP" }),
    [],
  );

  return {
    state,
    setConfig,
    startLoading,
    loadQuiz,
    setAnswer,
    nextQuestion,
    prevQuestion,
    startSubmitting,
    loadResult,
    appendQuestions,
    resetToSetup,
  };
}
