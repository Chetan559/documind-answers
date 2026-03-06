import { BASE_BACKEND_URL } from '@/config';

export interface Citation {
  id: string;
  chunk_id: string;
  page_number: number;
  bbox: { x0: number; y0: number; x1: number; y1: number };
  cited_text: string;
  relevance_score: number;
  is_primary: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  citations?: Citation[];
  follow_up?: string | null;
  mode?: 'rag' | 'continuation' | null;
}

export interface ChatResponse {
  session_id: string;
  message_id: string;
  answer: string;
  mode: 'rag' | 'continuation';
  citations: Citation[];
  follow_up?: string;
}

export const sendMessage = async (
  pdfId: string,
  message: string,
  sessionId: string | null = null,
  userId: string = 'default_user'
): Promise<ChatResponse> => {
  const res = await fetch(`${BASE_BACKEND_URL}/api/chat/${pdfId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      session_id: sessionId,
      user_id: userId,
    }),
  });

  if (res.status === 409) {
    throw new Error('PDF_NOT_READY');
  }
  if (!res.ok) throw new Error(`Chat failed: ${res.status}`);
  return res.json();
};

export const getChatHistory = async (pdfId: string, sessionId: string) => {
  const res = await fetch(`${BASE_BACKEND_URL}/api/chat/${pdfId}/history/${sessionId}`);
  if (!res.ok) throw new Error(`History failed: ${res.status}`);
  return res.json();
};

export const clearChatHistory = async (pdfId: string, sessionId: string) => {
  const res = await fetch(`${BASE_BACKEND_URL}/api/chat/${pdfId}/history/${sessionId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Clear failed: ${res.status}`);
  return res.json();
};
