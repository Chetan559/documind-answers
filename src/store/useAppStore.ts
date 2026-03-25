import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  AppState, ChatSession, PDFDocument, ChatMessage,
  Annotation, AnnotationCollection, AnnotationColor, AnnotationRect,
  DocumentMetadata,
} from '@/types';
import type { AuthUser } from '@/api/auth';

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

  // Annotation actions
  createAnnotation: (params: {
    documentId: string;
    sessionId?: string;
    selectedText: string;
    note?: string;
    color: AnnotationColor;
    bounds: { page: number; rects: AnnotationRect[] };
  }) => Annotation;
  updateAnnotation: (id: string, updates: Partial<Pick<Annotation, 'note' | 'color'>>) => void;
  deleteAnnotation: (id: string) => void;
  setActiveAnnotation: (id: string | null) => void;

  // Collection actions
  createCollection: (name: string, color: AnnotationColor) => AnnotationCollection;
  deleteCollection: (id: string) => void;
  addToCollection: (collectionId: string, annotationId: string) => void;
  removeFromCollection: (collectionId: string, annotationId: string) => void;

  // Metadata actions
  setDocumentMetadata: (docId: string, metadata: DocumentMetadata) => void;
  updateDocumentMetadata: (docId: string, partial: Partial<DocumentMetadata>) => void;

  // Auth
  user: AuthUser | null;
  accessToken: string | null;
  setAuth: (token: string, user: AuthUser) => void;
  logout: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      documents: [],
      folders: [],
      sessions: [],
      activeSessionId: null,
      activePDFViewerId: null,
      annotations: [],
      annotationCollections: [],
      activeAnnotationId: null,
      documentMetadata: {},
      user: null,
      accessToken: null,

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
          activeSessionId: s.activeSessionId === sessionId ? null : s.activeSessionId,
        })),

      pinSession: (sessionId) =>
        set((s) => ({
          sessions: s.sessions.map((sess) =>
            sess.id === sessionId ? { ...sess, isPinned: !sess.isPinned } : sess
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
            sess.id === sessionId ? { ...sess, backendSessionId: backendId } : sess
          ),
        })),

      addDocuments: (docs) =>
        set((s) => ({
          documents: [
            ...s.documents,
            ...docs.filter((d) => !s.documents.some((existing) => existing.id === d.id)),
          ],
        })),

      updateDocument: (doc) =>
        set((s) => ({
          documents: s.documents.map((d) => (d.id === doc.id ? { ...d, ...doc } : d)),
        })),

      removeDocument: (docId) =>
        set((s) => ({ documents: s.documents.filter((d) => d.id !== docId) })),

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
              ? { ...sess, documentIds: sess.documentIds.filter((id) => id !== docId) }
              : sess
          ),
        })),

      setActivePDFViewer: (docId) => set({ activePDFViewerId: docId }),

      // Annotation actions
      createAnnotation: (params) => {
        const annotation: Annotation = {
          id: crypto.randomUUID(),
          ...params,
          collectionIds: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((s) => ({ annotations: [...s.annotations, annotation] }));
        return annotation;
      },

      updateAnnotation: (id, updates) =>
        set((s) => ({
          annotations: s.annotations.map((a) =>
            a.id === id ? { ...a, ...updates, updatedAt: new Date() } : a
          ),
        })),

      deleteAnnotation: (id) =>
        set((s) => ({
          annotations: s.annotations.filter((a) => a.id !== id),
          annotationCollections: s.annotationCollections.map((c) => ({
            ...c,
            annotationIds: c.annotationIds.filter((aId) => aId !== id),
          })),
          activeAnnotationId: s.activeAnnotationId === id ? null : s.activeAnnotationId,
        })),

      setActiveAnnotation: (id) => set({ activeAnnotationId: id }),

      createCollection: (name, color) => {
        const collection: AnnotationCollection = {
          id: crypto.randomUUID(),
          name,
          color,
          annotationIds: [],
          createdAt: new Date(),
        };
        set((s) => ({ annotationCollections: [...s.annotationCollections, collection] }));
        return collection;
      },

      deleteCollection: (id) =>
        set((s) => ({
          annotationCollections: s.annotationCollections.filter((c) => c.id !== id),
          annotations: s.annotations.map((a) => ({
            ...a,
            collectionIds: a.collectionIds.filter((cId) => cId !== id),
          })),
        })),

      addToCollection: (collectionId, annotationId) =>
        set((s) => ({
          annotationCollections: s.annotationCollections.map((c) =>
            c.id === collectionId && !c.annotationIds.includes(annotationId)
              ? { ...c, annotationIds: [...c.annotationIds, annotationId] }
              : c
          ),
          annotations: s.annotations.map((a) =>
            a.id === annotationId && !a.collectionIds.includes(collectionId)
              ? { ...a, collectionIds: [...a.collectionIds, collectionId] }
              : a
          ),
        })),

      removeFromCollection: (collectionId, annotationId) =>
        set((s) => ({
          annotationCollections: s.annotationCollections.map((c) =>
            c.id === collectionId
              ? { ...c, annotationIds: c.annotationIds.filter((id) => id !== annotationId) }
              : c
          ),
          annotations: s.annotations.map((a) =>
            a.id === annotationId
              ? { ...a, collectionIds: a.collectionIds.filter((id) => id !== collectionId) }
              : a
          ),
        })),

      setDocumentMetadata: (docId, metadata) =>
        set((s) => ({
          documentMetadata: { ...s.documentMetadata, [docId]: metadata },
        })),

      updateDocumentMetadata: (docId, partial) =>
        set((s) => ({
          documentMetadata: {
            ...s.documentMetadata,
            [docId]: { ...s.documentMetadata[docId], ...partial },
          },
        })),

      // Auth
      setAuth: (token, authUser) => set({ accessToken: token, user: authUser }),
      logout: () => set({ accessToken: null, user: null }),
    }),
    {
      name: 'documind-store',
      partialize: (state) => ({
        documents: state.documents,
        folders: state.folders,
        sessions: state.sessions,
        activeSessionId: state.activeSessionId,
        activePDFViewerId: state.activePDFViewerId,
        annotations: state.annotations,
        annotationCollections: state.annotationCollections,
        documentMetadata: state.documentMetadata,
        user: state.user,
        accessToken: state.accessToken,
      }),
    }
  )
);
