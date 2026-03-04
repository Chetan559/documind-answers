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
import { sendMessage, type ChatMessage } from '@/api/chat';
import { uploadDocument } from '@/api/documents';

const ChatPage = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useDocuments();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const doc = state.documents.find(d => d.id === documentId);

  useEffect(() => {
    if (documentId) dispatch({ type: 'SET_ACTIVE_DOC', payload: documentId });
  }, [documentId, dispatch]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (content: string) => {
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const reply = await sendMessage(documentId || '', content);
      setMessages(prev => [...prev, reply]);
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
              <ChatMessageComponent key={msg.id} role={msg.role} content={msg.content} timestamp={msg.timestamp} />
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
        {pdfOpen && (
          <div className="hidden lg:block w-[340px] shrink-0">
            <PDFViewer
              fileName={doc?.name}
              totalPages={doc?.pageCount}
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
