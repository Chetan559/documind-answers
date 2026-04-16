import { useState, useCallback } from 'react';
import { Upload, Plus, X, FileText, Loader2, AlertTriangle, ChevronUp, ChevronDown } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { uploadDocument } from '@/api/documents';
import { useDocumentPolling } from '@/hooks/useDocumentPolling';
import { PDFDocument } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

// ── Constants ────────────────────────────────────────────────────────────────
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_CHUNKS = 1000;

// Rough estimate: a typical PDF page ≈ 5–10 text blocks (chunks).
// We estimate chunk count from page count as a frontend pre-check.
// The precise count is enforced server-side; this is for UX guidance.
const PAGES_PER_CHUNK_ESTIMATE = 4; // ≈ 4 pages produce ~1 chunk avg block

/**
 * Estimates number of extractable chunks from a File by reading it with the
 * PDF.js-free approach: page count isn't directly accessible from a File object,
 * so we estimate based on file size. A typical digital PDF page ≈ 50–100 KB.
 * For the chunk-overflow dialog trigger we use a conservative page estimate.
 */
function estimateChunksFromSize(bytes: number): number {
  const estimatedPages = Math.ceil(bytes / (75 * 1024)); // ~75 KB per page
  return estimatedPages * PAGES_PER_CHUNK_ESTIMATE;
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface ChunkWarningState {
  file: File;
  estimatedChunks: number;
  resolve: (choice: 'first' | 'last' | 'abort') => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function UploadTab() {
  const [dragging, setDragging] = useState(false);
  const [staged, setStaged] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [sizeErrors, setSizeErrors] = useState<string[]>([]);
  const [pollingDocId, setPollingDocId] = useState<string | null>(null);
  const [chunkWarning, setChunkWarning] = useState<ChunkWarningState | null>(null);

  const { addDocuments, createSession, activeSessionId, attachDocToSession } =
    useAppStore();

  useDocumentPolling(pollingDocId);

  // ── File validation & staging ─────────────────────────────────────────────

  const addFiles = (files: File[]) => {
    const errors: string[] = [];
    const valid: File[] = [];

    for (const file of files) {
      if (file.type !== 'application/pdf') continue; // non-PDFs silently ignored

      if (file.size > MAX_FILE_SIZE_BYTES) {
        errors.push(
          `"${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)} MB — max allowed is 5 MB.`
        );
        continue;
      }

      valid.push(file);
    }

    setSizeErrors(errors);
    setStaged((prev) => [...prev, ...valid]);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  }, []);

  const removeStaged = (index: number) =>
    setStaged((prev) => prev.filter((_, i) => i !== index));

  // ── Chunk-overflow dialog (Promise-based) ─────────────────────────────────

  /**
   * Shows the chunk-overflow dialog and returns a Promise that resolves
   * to the user's choice. Uses React state + a stored resolve callback
   * so the upload loop can await it inline.
   */
  const askChunkChoice = (
    file: File,
    estimatedChunks: number
  ): Promise<'first' | 'last' | 'abort'> => {
    return new Promise((resolve) => {
      setChunkWarning({ file, estimatedChunks, resolve });
    });
  };

  const handleChunkChoice = (choice: 'first' | 'last' | 'abort') => {
    if (chunkWarning) {
      chunkWarning.resolve(choice);
      setChunkWarning(null);
    }
  };

  // ── Upload handler ────────────────────────────────────────────────────────

  const handleUpload = async (mode: 'new' | 'existing') => {
    if (!staged.length) return;
    setUploading(true);

    try {
      const newDocs: PDFDocument[] = [];

      for (const file of staged) {
        // Check estimated chunk count
        const estimated = estimateChunksFromSize(file.size);
        let chunkMode: 'all' | 'first' | 'last' = 'all';

        if (estimated > MAX_CHUNKS) {
          const choice = await askChunkChoice(file, estimated);
          if (choice === 'abort') continue; // skip this file
          chunkMode = choice; // 'first' | 'last'
        }

        // Build FormData and include chunk preference
        const formData = new FormData();
        formData.append('file', file);
        if (chunkMode !== 'all') {
          formData.append('chunk_limit', String(MAX_CHUNKS));
          formData.append('chunk_mode', chunkMode);
        }

        const doc = await uploadDocument(file, chunkMode !== 'all' ? { chunkLimit: MAX_CHUNKS, chunkMode } : undefined);
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

      if (!newDocs.length) return;

      addDocuments(newDocs);

      if (mode === 'new') {
        createSession(newDocs.map((d) => d.id));
      } else if (mode === 'existing' && activeSessionId) {
        newDocs.forEach((d) => attachDocToSession(activeSessionId, d.id));
      }

      setStaged([]);
      setSizeErrors([]);
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

  // ── Render ────────────────────────────────────────────────────────────────

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
          {/* Limit hint */}
          <p className="text-[9px] font-body text-muted-foreground/60 mt-1">
            Max 5 MB · PDF only
          </p>
        </div>
        <input
          id="sidebar-file-input"
          type="file"
          accept=".pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            addFiles(Array.from(e.target.files || []));
            e.target.value = ''; // reset so same file can be re-selected
          }}
        />
      </div>

      {/* Size error banners */}
      <AnimatePresence>
        {sizeErrors.map((err, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-start gap-2 px-2.5 py-2 bg-destructive/10 border border-destructive/30 rounded-lg"
          >
            <AlertTriangle className="w-3 h-3 text-destructive shrink-0 mt-0.5" />
            <p className="text-[10px] font-body text-destructive leading-snug">{err}</p>
            <button
              onClick={() => setSizeErrors((prev) => prev.filter((_, idx) => idx !== i))}
              className="ml-auto text-destructive/60 hover:text-destructive shrink-0"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

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

      {/* ── Chunk-overflow dialog ─────────────────────────────────────────── */}
      <AnimatePresence>
        {chunkWarning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          >
            <div className="w-full max-w-xs bg-surface border border-border/30 rounded-2xl shadow-2xl p-5 space-y-4">
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-500/15 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                </div>
                <div>
                  <p className="text-xs font-body font-semibold text-foreground">
                    Document too large
                  </p>
                  <p className="text-[10px] font-body text-muted-foreground mt-0.5">
                    <span className="text-foreground font-medium truncate block max-w-[180px]">
                      {chunkWarning.file.name}
                    </span>
                    Estimated ~{chunkWarning.estimatedChunks.toLocaleString()} chunks
                    — limit is {MAX_CHUNKS.toLocaleString()}.
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-border/20" />

              {/* Body */}
              <p className="text-[10px] font-body text-muted-foreground leading-relaxed">
                Would you like to index only the <strong>first</strong> or <strong>last</strong> {MAX_CHUNKS} chunks,
                or skip this file entirely?
              </p>

              {/* Actions */}
              <div className="space-y-1.5">
                <button
                  onClick={() => handleChunkChoice('first')}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-border/30 text-[10px] font-body text-foreground hover:bg-sidebar-accent/50 transition-colors"
                >
                  <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                  Use first {MAX_CHUNKS} chunks (beginning of document)
                </button>
                <button
                  onClick={() => handleChunkChoice('last')}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-border/30 text-[10px] font-body text-foreground hover:bg-sidebar-accent/50 transition-colors"
                >
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  Use last {MAX_CHUNKS} chunks (end of document)
                </button>
                <button
                  onClick={() => handleChunkChoice('abort')}
                  className="w-full px-3 py-2 rounded-lg text-[10px] font-body text-destructive hover:bg-destructive/10 transition-colors"
                >
                  Skip this file
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
