import { useState, useCallback, useRef, ReactNode } from 'react';
import { X, Upload as UploadIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[]) => Promise<void>;
}

const UploadModal = ({ isOpen, onClose, onUpload }: UploadModalProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
    setFiles(prev => [...prev, ...dropped]);
  }, []);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (idx: number) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const handleUpload = async () => {
    setUploading(true);
    try {
      await onUpload(files);
      setStatus('success');
      setTimeout(() => { setFiles([]); setStatus('idle'); onClose(); }, 1000);
    } catch {
      setStatus('error');
    } finally {
      setUploading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg mx-4 bg-surface border border-border/30 rounded-xl p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Upload Files"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl text-primary">Upload Files</h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                status === 'error' ? 'border-destructive' :
                dragOver ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border/40 hover:border-border'
              }`}
              aria-label="Drop your PDF file here"
            >
              <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center mx-auto mb-4">
                <UploadIcon className="w-5 h-5 text-foreground" />
              </div>
              <p className="text-sm text-foreground font-body">Drop your PDF file here</p>
              <p className="text-xs text-muted-foreground mt-1 font-body">or click to browse</p>
              <input ref={inputRef} type="file" accept=".pdf" multiple className="hidden" onChange={handleSelect} aria-label="Select PDF files" />
            </div>

            {status === 'error' && (
              <p className="text-sm text-destructive mt-2 flex items-center gap-1 font-body"><AlertCircle className="w-4 h-4" /> Upload failed. Please try again.</p>
            )}

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-muted-foreground font-body">Files to upload</p>
                {files.map((f, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 bg-background rounded-lg">
                    <div className="flex items-center gap-2 min-w-0">
                      <UploadIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="text-sm text-foreground truncate font-body">{f.name}</span>
                      <span className="text-xs text-muted-foreground font-body">{formatSize(f.size)}</span>
                    </div>
                    <button onClick={() => removeFile(i)} className="text-muted-foreground hover:text-foreground" aria-label={`Remove ${f.name}`}>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={onClose} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-body" aria-label="Close">
                Close
              </button>
              <button
                onClick={handleUpload}
                disabled={files.length === 0 || uploading}
                className="px-6 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-2 font-body"
                aria-label="Upload"
              >
                {uploading ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" role="status" />
                ) : status === 'success' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : null}
                {uploading ? 'Uploading...' : status === 'success' ? 'Done!' : 'Upload'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UploadModal;
