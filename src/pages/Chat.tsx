import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ChevronRight, ChevronLeft, FileText, BookOpen } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import ChatMessageComponent from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import PDFViewer from '@/components/pdf/PDFViewer';
import UploadModal from '@/components/upload/UploadModal';
import { useDocuments } from '@/context/DocumentContext';
import { sendMessage, type ChatMessage, type Citation } from '@/api/chat';
import { uploadDocument } from '@/api/documents';
import { useToast } from '@/hooks/use-toast';

const ChatPage = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { state, dispatch } = useDocuments();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [activeCitations, setActiveCitations] = useState<Citation[]>([]);
  const [activePdfPage, setActivePdfPage] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  const doc = state.documents.find(d => d.id === documentId);

  useEffect(() => {
    if (documentId) dispatch({ type: 'SET_ACTIVE_DOC', payload: documentId });
  }, [documentId, dispatch]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (content: string) => {
    if (doc && doc.status !== 'ready') {
      toast({ title: 'PDF is still being processed', description: 'Please wait until processing is complete.', variant: 'destructive' });
      return;
    }

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const response = await sendMessage(documentId || '', content, sessionId);
      setSessionId(response.session_id);

      const assistantMsg: ChatMessage = {
        id: response.message_id,
        role: 'assistant',
        content: response.answer,
        timestamp: new Date(),
        citations: response.citations,
        follow_up: response.follow_up,
      };
      setMessages(prev => [...prev, assistantMsg]);

      // Update citations and navigate to primary citation page
      if (response.citations?.length) {
        setActiveCitations(response.citations);
        const primary = response.citations.find(c => c.is_primary);
        if (primary) setActivePdfPage(primary.page_number);
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

  return (
    <div className="flex h-screen bg-background">
      <Sidebar onUploadClick={() => setUploadOpen(true)} />

      <div className="flex-1 flex">
        {/* Chat Panel */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-foreground font-body px-2 py-1 bg-surface rounded-md truncate max-w-[200px]">
                {doc?.name || 'All Documents'}
              </span>
              {doc && doc.status !== 'ready' && (
                <span className="text-xs text-muted-foreground font-body capitalize px-2 py-0.5 bg-surface rounded-full border border-border/20">
                  {doc.status}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/quiz/${documentId}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-body font-medium bg-surface border border-border/30 text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-all active:scale-95"
                aria-label="Start Quiz"
              >
                <BookOpen className="w-3.5 h-3.5" /> Quiz
              </button>
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
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Sparkles className="w-8 h-8 text-muted-foreground mb-4" />
                <p className="font-display text-lg text-primary mb-1">Ask your first question</p>
                <p className="text-sm text-muted-foreground font-body">DocuMind will find answers grounded in your document</p>
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id}>
                <ChatMessageComponent role={msg.role} content={msg.content} timestamp={msg.timestamp} />
                {/* Follow-up suggestion */}
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
                {/* Citation chips */}
                {msg.role === 'assistant' && msg.citations && msg.citations.length > 0 && (
                  <div className="ml-10 mt-2 flex flex-wrap gap-1.5">
                    {msg.citations.map(c => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setActiveCitations(msg.citations!);
                          setActivePdfPage(c.page_number);
                          setPdfOpen(true);
                        }}
                        className="text-xs font-body px-2 py-1 rounded border border-border/30 text-muted-foreground hover:text-foreground hover:bg-surface transition-all"
                        title={c.cited_text}
                      >
                        📄 Page {c.page_number}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-surface border border-border/30 flex items-center justify-center shrink-0">
                  <span className="text-xs font-display text-primary">D</span>
                </div>
                <div className="flex gap-1 items-center pt-2" role="status">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <ChatInput onSend={handleSend} disabled={loading} />
        </motion.div>

        {/* PDF Panel */}
        {pdfOpen && documentId && (
          <div className="hidden lg:block w-[375px] shrink-0 overflow-hidden">
            <PDFViewer
              pdfId={documentId}
              fileName={doc?.name}
              citations={activeCitations}
              activePage={activePdfPage}
              onPageChange={setActivePdfPage}
              onClose={() => setPdfOpen(false)}
            />
          </div>
        )}
      </div>

      <UploadModal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} onUpload={async (files) => {
        for (const f of files) {
          const d = await uploadDocument(f);
          dispatch({ type: 'ADD_DOCUMENT', payload: d });
        }
      }} />
    </div>
  );
};

export default ChatPage;
