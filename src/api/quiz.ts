import { authFetch, apiUrl } from "@/lib/authFetch";

// ── TypeScript interfaces matching real API response shapes ──

export interface QuizQuestion {
  id: string;
  question_index: number;
  question_text: string;
  question_type: "mcq" | "true_false" | "fill_in_the_blank";
  difficulty: "easy" | "medium" | "hard";
  options: string[] | null;
  source_page: number | null;
}

export interface Quiz {
  id: string;
  pdf_id: string;
  pdf_ids: string[];
  status: string;
  question_count: number;
  questions: QuizQuestion[];
  title: string | null;
  chat_session_id: string | null;
  has_result: boolean;
  score: number | null;
  total: number | null;
  percentage: number | null;
  grade: string | null;
  created_at: string;
}

export interface PerQuestionResult {
  question_id: string;
  question_text: string;
  is_correct: boolean;
  user_answer: string | null;
  correct_answer: string;
  explanation: string | null;
}

export interface QuizSubmitResult {
  session_id: string;
  score: number;
  total: number;
  percentage: number;
  grade: string;
  per_question: PerQuestionResult[];
  weak_topics: string[];
  recommendation: string;
}

export interface AppendResult {
  id: string;
  question_count: number;
  new_questions_added: number;
  questions: QuizQuestion[];
}

export interface GenerateConfig {
  count: number;
  question_type: "mcq" | "true_false" | "fill_in_the_blank";
  difficulty: "easy" | "medium" | "hard";
  topic?: string | null;
}

// ── Helper to handle API errors consistently ──

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) return res.json();

  if (res.status === 409) throw new Error("PDF_NOT_READY");
  if (res.status === 404) throw new Error("NOT_FOUND");
  if (res.status === 422) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail || "Validation error — check request body");
  }
  throw new Error(`Server error (${res.status})`);
}

// ── API functions ──

/** POST /api/quiz/{pdf_id}/generate */
export const generateQuiz = async (
  primaryPdfId: string,
  config: GenerateConfig,
  opts?: {
    pdf_ids?: string[];
    chat_session_id?: string | null;
    title?: string | null;
  },
): Promise<Quiz> => {
  const res = await authFetch(apiUrl(`/api/quiz/${primaryPdfId}/generate`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      count: config.count,
      question_type: config.question_type,
      difficulty: config.difficulty,
      topic: config.topic ?? null,
      pdf_ids: opts?.pdf_ids ?? [],
      chat_session_id: opts?.chat_session_id ?? null,
      title: opts?.title ?? null,
    }),
  });
  return handleResponse<Quiz>(res);
};

/** POST /api/quiz/{quiz_id}/retake — clone with same questions */
export const retakeQuizSame = async (
  quizId: string,
  opts?: { chat_session_id?: string | null },
): Promise<Quiz> => {
  const res = await authFetch(apiUrl(`/api/quiz/${quizId}/retake`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_session_id: opts?.chat_session_id ?? null }),
  });
  return handleResponse<Quiz>(res);
};

/** GET /api/quiz/chat-session/{chat_session_id}/cards */
export const listQuizCardsForSession = async (chatSessionId: string): Promise<Quiz[]> => {
  const res = await authFetch(apiUrl(`/api/quiz/chat-session/${chatSessionId}/cards`));
  return handleResponse<Quiz[]>(res);
};

/** GET /api/quiz/{pdf_id}/list */
export const listQuizzes = async (pdfId: string): Promise<Quiz[]> => {
  const res = await authFetch(apiUrl(`/api/quiz/${pdfId}/list`));
  return handleResponse<Quiz[]>(res);
};

/** GET /api/quiz/{quiz_id} — no answers, for active quiz UI */
export const getQuiz = async (quizId: string): Promise<Quiz> => {
  const res = await authFetch(apiUrl(`/api/quiz/${quizId}`));
  return handleResponse<Quiz>(res);
};

/** POST /api/quiz/{quiz_id}/append */
export const appendQuestions = async (
  quizId: string,
  opts: {
    count?: number;
    question_type?: string | null;
    difficulty?: string | null;
  },
): Promise<AppendResult> => {
  const res = await authFetch(apiUrl(`/api/quiz/${quizId}/append`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(opts),
  });
  return handleResponse<AppendResult>(res);
};

/** POST /api/quiz/{quiz_id}/submit */
export const submitQuiz = async (
  quizId: string,
  answers: Record<string, string>,
): Promise<QuizSubmitResult> => {
  const res = await authFetch(apiUrl(`/api/quiz/${quizId}/submit`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers }),
  });
  return handleResponse<QuizSubmitResult>(res);
};

/** GET /api/quiz/{quiz_id}/result */
export const getQuizResult = async (
  quizId: string,
): Promise<QuizSubmitResult> => {
  const res = await authFetch(apiUrl(`/api/quiz/${quizId}/result`));
  return handleResponse<QuizSubmitResult>(res);
};

/** DELETE /api/quiz/{quiz_id} */
export const deleteQuiz = async (
  quizId: string,
): Promise<{ success: boolean; message: string }> => {
  const res = await authFetch(apiUrl(`/api/quiz/${quizId}`), {
    method: "DELETE",
  });
  return handleResponse<{ success: boolean; message: string }>(res);
};
