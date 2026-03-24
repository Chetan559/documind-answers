import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, ChatSession, PDFDocument, ChatMessage } from '@/types';

interface AppStore extends AppState {
  createSession: (documentIds: string[]) => ChatSession;
  openSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  pinSession: (sessionId: string) => void;
  renameSession: (sessionId: string, title: string) => void;
  addMessageToSession: (sessionId: string, message: ChatMessage) => void;
  setBackendSessionId: (sessionId: string, backendId: string) => void;

  addDocuments: (docs: PDFDocument[]) => void;
  updateDocument: (doc: Partial<PDFDocument> & { id: string }) => void;
  removeDocument: (docId: string) => void;
  attachDocToSession: (sessionId: string, docId: string) => void;
  detachDocFromSession: (sessionId: string, docId: string) => void;

  setActivePDFViewer: (docId: string | null) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      documents: [],
      folders: [],
      sessions: [],
      activeSessionId: null,
      activePDFViewerId: null,

      createSession: (documentIds) => {
        const session: ChatSession = {
          id: crypto.randomUUID(),
          title: 'New Chat',
          createdAt: new Date(),
          updatedAt: new Date(),
          documentIds,
          messages: [],
          isPinned: false,
          previewText: 'No messages yet',
          backendSessionId: null,
        };
        set((s) => ({
          sessions: [session, ...s.sessions],
          activeSessionId: session.id,
        }));
        return session;
      },

      openSession: (sessionId) => set({ activeSessionId: sessionId }),

      deleteSession: (sessionId) =>
        set((s) => ({
          sessions: s.sessions.filter((sess) => sess.id !== sessionId),
          activeSessionId:
            s.activeSessionId === sessionId ? null : s.activeSessionId,
        })),

      pinSession: (sessionId) =>
        set((s) => ({
          sessions: s.sessions.map((sess) =>
            sess.id === sessionId
              ? { ...sess, isPinned: !sess.isPinned }
              : sess
          ),
        })),

      renameSession: (sessionId, title) =>
        set((s) => ({
          sessions: s.sessions.map((sess) =>
            sess.id === sessionId ? { ...sess, title } : sess
          ),
        })),

      addMessageToSession: (sessionId, message) =>
        set((s) => ({
          sessions: s.sessions.map((sess) =>
            sess.id === sessionId
              ? {
                  ...sess,
                  messages: [...sess.messages, message],
                  updatedAt: new Date(),
                  previewText: message.content.slice(0, 80),
                  title:
                    sess.messages.length === 0 && message.role === 'user'
                      ? message.content.slice(0, 40)
                      : sess.title,
                }
              : sess
          ),
        })),

      setBackendSessionId: (sessionId, backendId) =>
        set((s) => ({
          sessions: s.sessions.map((sess) =>
            sess.id === sessionId
              ? { ...sess, backendSessionId: backendId }
              : sess
          ),
        })),

      addDocuments: (docs) =>
        set((s) => ({
          documents: [
            ...s.documents,
            ...docs.filter(
              (d) => !s.documents.some((existing) => existing.id === d.id)
            ),
          ],
        })),

      updateDocument: (doc) =>
        set((s) => ({
          documents: s.documents.map((d) =>
            d.id === doc.id ? { ...d, ...doc } : d
          ),
        })),

      removeDocument: (docId) =>
        set((s) => ({
          documents: s.documents.filter((d) => d.id !== docId),
        })),

      attachDocToSession: (sessionId, docId) =>
        set((s) => ({
          sessions: s.sessions.map((sess) =>
            sess.id === sessionId && !sess.documentIds.includes(docId)
              ? { ...sess, documentIds: [...sess.documentIds, docId] }
              : sess
          ),
        })),

      detachDocFromSession: (sessionId, docId) =>
        set((s) => ({
          sessions: s.sessions.map((sess) =>
            sess.id === sessionId
              ? {
                  ...sess,
                  documentIds: sess.documentIds.filter((id) => id !== docId),
                }
              : sess
          ),
        })),

      setActivePDFViewer: (docId) => set({ activePDFViewerId: docId }),
    }),
    {
      name: 'documind-store',
      partialize: (state) => ({
        documents: state.documents,
        folders: state.folders,
        sessions: state.sessions,
        activeSessionId: state.activeSessionId,
        activePDFViewerId: state.activePDFViewerId,
      }),
    }
  )
);
