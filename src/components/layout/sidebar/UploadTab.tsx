import { useState, useCallback } from 'react';
import { Upload, Plus, X, FileText, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { uploadDocument } from '@/api/documents';
import { useDocumentPolling } from '@/hooks/useDocumentPolling';
import { PDFDocument } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

export function UploadTab() {
  const [dragging, setDragging] = useState(false);
  const [staged, setStaged] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [pollingDocId, setPollingDocId] = useState<string | null>(null);
  const { addDocuments, createSession, activeSessionId, attachDocToSession } =
    useAppStore();

  useDocumentPolling(pollingDocId);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(
      (f) => f.type === 'application/pdf'
    );
    setStaged((prev) => [...prev, ...files]);
  }, []);

  const removeStaged = (index: number) =>
    setStaged((prev) => prev.filter((_, i) => i !== index));

  const handleUpload = async (mode: 'new' | 'existing') => {
    if (!staged.length) return;
    setUploading(true);

    try {
      const newDocs: PDFDocument[] = [];
      for (const file of staged) {
        const doc = await uploadDocument(file);
        const pdfDoc: PDFDocument = {
          id: doc.id,
          name: doc.name,
          uploadedAt: new Date(),
          size: doc.file_size,
          pageCount: doc.total_pages || 0,
          status: doc.status,
        };
        newDocs.push(pdfDoc);
        setPollingDocId(doc.id);
      }

      addDocuments(newDocs);

      if (mode === 'new') {
        createSession(newDocs.map((d) => d.id));
      } else if (mode === 'existing' && activeSessionId) {
        newDocs.forEach((d) => attachDocToSession(activeSessionId, d.id));
      }

      setStaged([]);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="p-3 space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => document.getElementById('sidebar-file-input')?.click()}
        className={`flex flex-col items-center justify-center gap-2 border border-dashed rounded-xl py-8 px-4 cursor-pointer transition-all ${
          dragging
            ? 'border-foreground bg-foreground/5'
            : 'border-border/30 hover:border-border/50'
        }`}
      >
        <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center">
          <Upload className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="text-xs font-body text-foreground">Drop PDFs here</p>
          <p className="text-[10px] font-body text-muted-foreground">
            or click to browse
          </p>
        </div>
        <input
          id="sidebar-file-input"
          type="file"
          accept=".pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            setStaged((prev) => [...prev, ...files]);
          }}
        />
      </div>

      {/* Staged files */}
      <AnimatePresence>
        {staged.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider">
              Ready to upload
            </p>
            {staged.map((file, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-2.5 py-2 bg-surface rounded-lg border border-border/20"
              >
                <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs font-body text-foreground truncate flex-1">
                  {file.name}
                </span>
                <span className="text-[10px] font-body text-muted-foreground shrink-0">
                  {formatSize(file.size)}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeStaged(i);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            <div className="space-y-1.5">
              <button
                onClick={() => handleUpload('new')}
                disabled={uploading}
                className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-[10px] font-body font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {uploading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Plus className="w-3 h-3" />
                )}
                Start New Chat
              </button>

              {activeSessionId && (
                <button
                  onClick={() => handleUpload('existing')}
                  disabled={uploading}
                  className="w-full py-2 border border-border/30 text-foreground rounded-lg text-[10px] font-body hover:border-border/50 transition-colors disabled:opacity-50"
                >
                  Add to Current Chat
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
