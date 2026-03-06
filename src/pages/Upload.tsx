import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import UploadModal from '@/components/upload/UploadModal';
import { useDocuments } from '@/context/DocumentContext';
import { uploadDocument } from '@/api/documents';
import { useDocumentPolling } from '@/hooks/useDocumentPolling';
import { FileText, MessageSquare, BookOpen, Loader2 } from 'lucide-react';

const UploadPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [pollingDocId, setPollingDocId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { state, dispatch } = useDocuments();

  useDocumentPolling(pollingDocId);

  const handleUpload = async (files: File[]) => {
    for (const file of files) {
      const doc = await uploadDocument(file);
      dispatch({ type: 'ADD_DOCUMENT', payload: doc });
      // Start polling for this document
      setPollingDocId(doc.id);
    }
  };

  const readyDocs = state.documents.filter(d => d.status === 'ready');
  const processingDocs = state.documents.filter(d => d.status === 'queued' || d.status === 'processing');

  return (
    <div className="flex h-screen bg-background">
      <Sidebar onUploadClick={() => setModalOpen(true)} />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 flex items-center justify-center p-6"
      >
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-surface rounded-2xl border border-border/20 flex items-center justify-center mx-auto mb-6">
            <FileText className="w-7 h-7 text-muted-foreground" />
          </div>
          <h1 className="font-display text-2xl text-primary mb-2">Welcome to DocuMind</h1>
          <p className="text-sm text-muted-foreground font-body mb-6">
            Upload a PDF to get started. Ask questions, generate quizzes, and explore your documents with AI.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-body hover:bg-primary/90 transition-all active:scale-95"
            aria-label="Upload your first document"
          >
            Upload your first document
          </button>

          {/* Processing status */}
          {processingDocs.length > 0 && (
            <div className="mt-6 space-y-2">
              {processingDocs.map(doc => (
                <div key={doc.id} className="flex items-center gap-2 px-4 py-2 bg-surface rounded-lg border border-border/20">
                  <Loader2 className="w-4 h-4 text-muted-foreground animate-spin shrink-0" />
                  <span className="text-xs text-muted-foreground font-body truncate">{doc.name}</span>
                  <span className="text-xs text-muted-foreground font-body capitalize shrink-0">{doc.status}</span>
                </div>
              ))}
            </div>
          )}

          {readyDocs.length > 0 && (
            <div className="mt-6 space-y-3">
              <p className="text-xs text-muted-foreground font-body mb-3">
                {readyDocs.length} document{readyDocs.length !== 1 ? 's' : ''} ready — choose an action:
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate(`/chat/${readyDocs[0].id}`)}
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

      <UploadModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onUpload={handleUpload} />
    </div>
  );
};

export default UploadPage;
