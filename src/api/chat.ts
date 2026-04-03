import { authFetch, apiUrl } from '@/lib/authFetch';
import { z } from 'zod';

export interface Citation {
  id: string;
  chunk_id: string;
  source_pdf_id: string | null;   // which PDF this citation came from
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

/**
 * Multi-document chat — sends all PDF IDs so RAG retrieves from all.
 * Falls back to single-PDF endpoint if only one ID.
 */
export const sendMessage = async (
  pdfIds: string | string[],
  message: string,
  sessionId: string | null = null,
): Promise<ChatResponse> => {
  const ids = Array.isArray(pdfIds) ? pdfIds : [pdfIds];

  const res = await authFetch(apiUrl('/api/chat/'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      pdf_ids: ids,
      message,
      session_id: sessionId,
    }),
  });

  if (res.status === 409) throw new Error('PDF_NOT_READY');
  if (!res.ok) throw new Error(`Chat failed: ${res.status}`);
  return res.json();
};

export const getChatHistory = async (pdfId: string, sessionId: string) => {
  const res = await authFetch(apiUrl(`/api/chat/${pdfId}/history/${sessionId}`));
  if (!res.ok) throw new Error(`History failed: ${res.status}`);
  return res.json();
};

export const clearChatHistory = async (pdfId: string, sessionId: string) => {
  const res = await authFetch(apiUrl(`/api/chat/${pdfId}/history/${sessionId}`), {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Clear failed: ${res.status}`);
  return res.json();
};

export const SessionMetadataSchema = z.object({
  id: z.string(),
  pdf_id: z.string(),
  extra_pdf_ids: z.array(z.string()),
  created_at: z.string(),
  updated_at: z.string(),
  title: z.string(),
  preview_text: z.string(),
  message_count: z.number(),
});
export type SessionMetadata = z.infer<typeof SessionMetadataSchema>;

export const getSessionsMetadata = async (): Promise<SessionMetadata[]> => {
  const res = await authFetch(apiUrl('/api/chat/sessions'));
  if (!res.ok) throw new Error(`Failed to fetch sessions: ${res.status}`);
  const json = await res.json();
  return z.array(SessionMetadataSchema).parse(json);
};
