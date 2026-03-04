import { useReducer, useCallback } from 'react';
import type { QuizQuestion, QuizConfig, GradeResult } from '@/api/quiz';

export interface AnswerRecord {
  questionId: string;
  selectedIndex?: number;
  shortAnswer?: string;
  correct: boolean;
  gradeResult?: GradeResult;
}

interface QuizState {
  phase: 'setup' | 'active' | 'results';
  config: QuizConfig;
  questions: QuizQuestion[];
  currentIndex: number;
  answers: AnswerRecord[];
  isAnswered: boolean;
  isLoading: boolean;
}

type QuizAction =
  | { type: 'SET_CONFIG'; payload: Partial<QuizConfig> }
  | { type: 'START_LOADING' }
  | { type: 'LOAD_QUESTIONS'; payload: QuizQuestion[] }
  | { type: 'ANSWER_QUESTION'; payload: AnswerRecord }
  | { type: 'NEXT_QUESTION' }
  | { type: 'COMPLETE_QUIZ' }
  | { type: 'RESET_QUIZ' }
  | { type: 'RESET_TO_SETUP' };

const initialState: QuizState = {
  phase: 'setup',
  config: { numQuestions: 5, difficulty: 'medium', types: ['multiple-choice'] },
  questions: [],
  currentIndex: 0,
  answers: [],
  isAnswered: false,
  isLoading: false,
};

function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'SET_CONFIG':
      return { ...state, config: { ...state.config, ...action.payload } };
    case 'START_LOADING':
      return { ...state, isLoading: true };
    case 'LOAD_QUESTIONS':
      return { ...state, isLoading: false, phase: 'active', questions: action.payload, currentIndex: 0, answers: [], isAnswered: false };
    case 'ANSWER_QUESTION':
      return { ...state, isAnswered: true, answers: [...state.answers, action.payload] };
    case 'NEXT_QUESTION': {
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.questions.length) {
        return { ...state, phase: 'results' };
      }
      return { ...state, currentIndex: nextIndex, isAnswered: false };
    }
    case 'COMPLETE_QUIZ':
      return { ...state, phase: 'results' };
    case 'RESET_QUIZ':
      return { ...state, phase: 'active', currentIndex: 0, answers: [], isAnswered: false };
    case 'RESET_TO_SETUP':
      return { ...initialState };
    default:
      return state;
  }
}

export function useQuizState() {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  const setConfig = useCallback((config: Partial<QuizConfig>) => dispatch({ type: 'SET_CONFIG', payload: config }), []);
  const startLoading = useCallback(() => dispatch({ type: 'START_LOADING' }), []);
  const loadQuestions = useCallback((questions: QuizQuestion[]) => dispatch({ type: 'LOAD_QUESTIONS', payload: questions }), []);
  const answerQuestion = useCallback((answer: AnswerRecord) => dispatch({ type: 'ANSWER_QUESTION', payload: answer }), []);
  const nextQuestion = useCallback(() => dispatch({ type: 'NEXT_QUESTION' }), []);
  const resetQuiz = useCallback(() => dispatch({ type: 'RESET_QUIZ' }), []);
  const resetToSetup = useCallback(() => dispatch({ type: 'RESET_TO_SETUP' }), []);

  const score = state.answers.filter(a => a.correct).length;
  const wrongAnswers = state.answers.filter(a => !a.correct);

  return { state, score, wrongAnswers, setConfig, startLoading, loadQuestions, answerQuestion, nextQuestion, resetQuiz, resetToSetup };
}
