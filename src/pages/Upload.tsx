import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import { useAppStore } from '@/store/useAppStore';
import { listDocuments } from '@/api/documents';
import { FileText, MessageSquare, BookOpen, Loader2 } from 'lucide-react';

const UploadPage = () => {
  const navigate = useNavigate();
  const { documents, addDocuments } = useAppStore();

  // Sync documents from backend on mount
  useEffect(() => {
    listDocuments()
      .then((docs) => {
        const mapped = docs.map((d) => ({
          id: d.id,
          name: d.name,
          uploadedAt: new Date(d.created_at || Date.now()),
          size: d.file_size,
          pageCount: d.total_pages || 0,
          status: d.status,
        }));
        addDocuments(mapped);
      })
      .catch(() => {});
  }, [addDocuments]);

  const readyDocs = documents.filter((d) => d.status === 'ready');
  const processingDocs = documents.filter(
    (d) => d.status === 'queued' || d.status === 'processing'
  );

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 flex items-center justify-center p-6"
      >
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-surface rounded-2xl border border-border/20 flex items-center justify-center mx-auto mb-6">
            <FileText className="w-7 h-7 text-muted-foreground" />
          </div>
          <h1 className="font-display text-2xl text-primary mb-2">
            Welcome to DocuMind
          </h1>
          <p className="text-sm text-muted-foreground font-body mb-6">
            Upload a PDF to get started. Ask questions, generate quizzes, and
            explore your documents with AI.
          </p>

          {/* Processing status */}
          {processingDocs.length > 0 && (
            <div className="mt-6 space-y-2">
              {processingDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-2 px-4 py-2 bg-surface rounded-lg border border-border/20"
                >
                  <Loader2 className="w-4 h-4 text-muted-foreground animate-spin shrink-0" />
                  <span className="text-xs text-muted-foreground font-body truncate">
                    {doc.name}
                  </span>
                  <span className="text-xs text-muted-foreground font-body capitalize shrink-0">
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {readyDocs.length > 0 && (
            <div className="mt-6 space-y-3">
              <p className="text-xs text-muted-foreground font-body mb-3">
                {readyDocs.length} document
                {readyDocs.length !== 1 ? 's' : ''} ready — choose an action:
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate('/chat')}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border/30 text-sm font-body text-foreground hover:bg-surface transition-all active:scale-95"
                  aria-label="Chat with document"
                >
                  <MessageSquare className="w-4 h-4" /> Chat
                </button>
                <button
                  onClick={() => navigate(`/quiz/${readyDocs[0].id}`)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border/30 text-sm font-body text-foreground hover:bg-surface transition-all active:scale-95"
                  aria-label="Quiz on document"
                >
                  <BookOpen className="w-4 h-4" /> Quiz
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.main>
    </div>
  );
};

export default UploadPage;
