import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight, ChevronLeft, FileText, BookOpen, ArrowLeft, Download } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import ChatMessageComponent from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import PDFViewerEnhanced from '@/components/pdf/PDFViewerEnhanced';
import QuizChatCard from '@/components/quiz/QuizChatCard';
import { SessionDocBar } from '@/components/chat/SessionDocBar';
import { CitationExportModal } from '@/components/modals/CitationExportModal';
import { useAppStore } from '@/store/useAppStore';
import { sendMessage, getChatHistory, type Citation } from '@/api/chat';
import { getDocumentStatus } from '@/api/documents';
import { getQuiz } from '@/api/quiz';
import { useToast } from '@/hooks/use-toast';
import { ChatMessage, QuizCardData } from '@/types';

const ChatPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    sessions,
    activeSessionId,
    documents,
    activePDFViewerId,
    setActivePDFViewer,
    addMessageToSession,
    removeMessageFromSession,
    updateMessageInSession,
    setBackendSessionId,
    setSessionMessages,
    createSession,
    updateDocument,
  } = useAppStore();

  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(true);
  const [activeCitations, setActiveCitations] = useState<Citation[]>([]);
  const [activePdfPage, setActivePdfPage] = useState(1);
  const [showCitationExport, setShowCitationExport] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Live-refresh quiz cards when window gets focus
  const refreshQuizCards = useCallback(async () => {
    if (!activeSessionId) return;
    const sess = sessions.find((s) => s.id === activeSessionId);
    if (!sess) return;
    const quizMessages = sess.messages.filter((m) => m.message_type === 'quiz' && m.quiz_session_id);
    for (const msg of quizMessages) {
      try {
        const fresh = await getQuiz(msg.quiz_session_id!);
        updateMessageInSession(activeSessionId, msg.id, {
          quiz_data: {
            id: fresh.id,
            pdf_id: fresh.pdf_id,
            pdf_ids: fresh.pdf_ids,
            status: fresh.status,
            question_count: fresh.question_count,
            title: fresh.title,
            chat_session_id: fresh.chat_session_id,
            has_result: fresh.has_result,
            score: fresh.score,
            total: fresh.total,
            percentage: fresh.percentage,
            grade: fresh.grade,
            created_at: fresh.created_at,
          } as QuizCardData,
        });
      } catch {/* ignore */}
    }
  }, [activeSessionId, sessions, updateMessageInSession]);

  useEffect(() => {
    const handler = () => { refreshQuizCards(); };
    window.addEventListener('focus', handler);
    return () => window.removeEventListener('focus', handler);
  }, [refreshQuizCards]);

  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const messages = activeSession?.messages || [];
  const activePdfDoc = documents.find((d) => d.id === activePDFViewerId);

  // Check if session has any citations
  const hasCitations = messages.some((m) => m.role === 'assistant' && m.citations && m.citations.length > 0);

  // Lazy load history if session is bound to backend but empty locally
  useEffect(() => {
    if (
      activeSession?.backendSessionId && 
      activeSession.messages.length === 0 && 
      activeSession.documentIds.length > 0
    ) {
      setLoadingHistory(true);
      getChatHistory(activeSession.documentIds[0], activeSession.backendSessionId)
        .then((res) => {
          const loadedMessages: ChatMessage[] = res.messages.map((m: any) => ({
            id: m.id,
            role: m.role as 'user' | 'assistant',
            content: m.content,
            timestamp: new Date(m.created_at),
            citations: m.citations || [],
            follow_up: m.follow_up,
            message_type: (m.message_type as "chat" | "quiz") || "chat",
            quiz_session_id: m.quiz_session_id,
            quiz_data: m.quiz_data,
          }));
          setSessionMessages(activeSession.id, loadedMessages);
        })
        .catch((err) => {
          console.error("Failed to load chat history", err);
          toast({ title: 'Error', description: 'Failed to load chat history.', variant: 'destructive' });
        })
        .finally(() => {
          setLoadingHistory(false);
        });
    }
  }, [activeSession?.id, activeSession?.backendSessionId, activeSession?.documentIds?.[0]]);

  useEffect(() => {
    if (!activeSessionId) {
      createSession([]);
    }
  }, [activeSessionId, createSession]);

  useEffect(() => {
    if (activeSession && activeSession.documentIds.length > 0 && !activePDFViewerId) {
      setActivePDFViewer(activeSession.documentIds[0]);
    }
  }, [activeSession, activePDFViewerId, setActivePDFViewer]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  const handleSend = async (content: string) => {
    if (!activeSessionId || !activeSession) return;

    const allDocIds = activeSession.documentIds;
    if (!allDocIds.length) {
      toast({ title: 'No document attached', description: 'Upload a PDF first to start chatting.', variant: 'destructive' });
      return;
    }

    // Validate all attached docs are ready (re-check backend for stale status)
    for (const docId of allDocIds) {
      const doc = documents.find((d) => d.id === docId);
      if (doc && doc.status !== 'ready') {
        try {
          const fresh = await getDocumentStatus(docId);
          if (fresh.status === 'ready') {
            updateDocument({ id: docId, status: 'ready' });
          } else {
            const name = doc.name || docId;
            toast({ title: 'Document still processing', description: `"${name}" is not ready yet. Please wait.`, variant: 'destructive' });
            return;
          }
        } catch {
          toast({ title: 'Document still processing', description: 'Please wait until all documents are ready.', variant: 'destructive' });
          return;
        }
      }
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    addMessageToSession(activeSessionId, userMsg);
    setLoading(true);

    try {
      const response = await sendMessage(allDocIds, content, activeSession.backendSessionId || null);
      setBackendSessionId(activeSessionId, response.session_id);

      const assistantMsg: ChatMessage = {
        id: response.message_id,
        role: 'assistant',
        content: response.answer,
        timestamp: new Date(),
        citations: response.citations,
        follow_up: response.follow_up,
      };
      addMessageToSession(activeSessionId, assistantMsg);

      if (response.citations?.length) {
        setActiveCitations(response.citations);
        const primary = response.citations.find((c) => c.is_primary);
        if (primary) {
          // Navigate to the source PDF of the primary citation
          if (primary.source_pdf_id && primary.source_pdf_id !== activePDFViewerId) {
            setActivePDFViewer(primary.source_pdf_id);
          }
          setActivePdfPage(primary.page_number);
        }
      }
    } catch (err: any) {
      if (err.message === 'PDF_NOT_READY') {
        toast({ title: 'PDF still processing', description: 'Please wait until your document is ready.', variant: 'destructive' });
      } else {
        toast({ title: 'Error', description: 'Failed to get a response. Please try again.', variant: 'destructive' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAskFromSelection = (text: string) => {
    handleSend(text);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex">
        {/* Chat Panel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 flex flex-col min-w-0"
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/upload')}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors font-body"
                aria-label="Back to Documents"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-foreground font-body px-2 py-1 bg-surface rounded-md truncate max-w-[200px]">
                {activeSession?.title || 'New Chat'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {hasCitations && activeSessionId && (
                <button
                  onClick={() => setShowCitationExport(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-body font-medium bg-surface border border-border/30 text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-all active:scale-95"
                  aria-label="Export Citations"
                >
                  <Download className="w-3.5 h-3.5" /> Export
                </button>
              )}
              {activeSession?.documentIds[0] && (
                <button
                  onClick={() => navigate(
                    `/quiz/${activeSession.documentIds[0]}` +
                    (activeSession.backendSessionId ? `?chatSession=${activeSession.backendSessionId}` : '')
                  )}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-body font-medium bg-surface border border-border/30 text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-all active:scale-95"
                  aria-label="Start Quiz"
                >
                  <BookOpen className="w-3.5 h-3.5" /> Quiz
                </button>
              )}
              <button
                onClick={() => setPdfOpen(!pdfOpen)}
                className="hidden lg:flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors font-body"
                aria-label="Toggle PDF viewer"
              >
                {pdfOpen ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                {pdfOpen ? 'Hide PDF' : 'Show PDF'}
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
            {loadingHistory && (
              <div className="flex flex-col items-center justify-center p-8 space-y-4">
                <div className="flex gap-1 items-center" role="status">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground font-body">Loading history...</p>
              </div>
            )}
            {!loadingHistory && messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Sparkles className="w-8 h-8 text-muted-foreground mb-4" />
                <p className="font-display text-lg text-primary mb-1">Ask your first question</p>
                <p className="text-sm text-muted-foreground font-body">DocuMind will find answers grounded in your documents</p>
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id}>
                {/* Quiz card message */}
                {msg.message_type === 'quiz' && msg.quiz_data ? (
                  <QuizChatCard
                    messageId={msg.id}
                    quizData={msg.quiz_data}
                    chatSessionId={activeSession?.backendSessionId || ''}
                    onDelete={(msgId) => removeMessageFromSession(activeSessionId!, msgId)}
                    onQuizUpdated={(msgId, updatedQuiz) =>
                      updateMessageInSession(activeSessionId!, msgId, { quiz_data: updatedQuiz })
                    }
                  />
                ) : (
                  <>
                    <ChatMessageComponent role={msg.role} content={msg.content} timestamp={msg.timestamp} />
                    {msg.role === 'assistant' && msg.follow_up && (
                      <div className="ml-10 mt-2">
                        <button
                          onClick={() => handleSend(msg.follow_up!)}
                          className="text-xs font-body px-3 py-1.5 rounded-full border border-border/30 text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-all"
                        >
                          <Sparkles className="w-3 h-3 inline mr-1" />
                          {msg.follow_up}
                        </button>
                      </div>
                    )}
                    {msg.role === 'assistant' && msg.citations && msg.citations.length > 0 && (
                      <div className="ml-10 mt-2 flex flex-wrap gap-1.5">
                        {msg.citations.map((c) => {
                          const sourcePdfDoc = documents.find((d) => d.id === c.source_pdf_id);
                          const multiDoc = activeSession?.documentIds && activeSession.documentIds.length > 1;
                          return (
                            <button
                              key={c.id}
                              onClick={() => {
                                setActiveCitations(msg.citations!);
                                if (c.source_pdf_id && c.source_pdf_id !== activePDFViewerId) {
                                  setActivePDFViewer(c.source_pdf_id);
                                }
                                setActivePdfPage(c.page_number);
                                setPdfOpen(true);
                              }}
                              className="text-xs font-body px-2 py-1 rounded border border-border/30 text-muted-foreground hover:text-foreground hover:bg-surface transition-all"
                              title={c.cited_text}
                            >
                              📄 {multiDoc && sourcePdfDoc ? `${sourcePdfDoc.name.split('.')[0]} · ` : ''}Page {c.page_number}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-surface border border-border/30 flex items-center justify-center shrink-0">
                  <span className="text-xs font-display text-primary">D</span>
                </div>
                <div className="flex gap-1 items-center pt-2" role="status">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <SessionDocBar />
          <ChatInput onSend={handleSend} disabled={loading} />
        </motion.div>

        {/* PDF Panel */}
        {pdfOpen && activePDFViewerId && (
          <div className="hidden lg:block w-[375px] shrink-0 overflow-hidden">
            <PDFViewerEnhanced
              pdfId={activePDFViewerId}
              fileName={activePdfDoc?.name}
              citations={activeCitations}
              activePage={activePdfPage}
              onPageChange={setActivePdfPage}
              onClose={() => setPdfOpen(false)}
              sessionId={activeSessionId || undefined}
              onAskFromSelection={handleAskFromSelection}
            />
          </div>
        )}
      </div>

      {/* Citation export modal */}
      <AnimatePresence>
        {showCitationExport && activeSessionId && (
          <CitationExportModal
            sessionId={activeSessionId}
            onClose={() => setShowCitationExport(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatPage;
