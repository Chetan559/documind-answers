import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Trash2 } from 'lucide-react';
import { DocumentType, DocumentMetadata } from '@/types';
import { useAppStore } from '@/store/useAppStore';

const DOC_TYPES: { id: DocumentType; label: string }[] = [
  { id: 'article', label: 'Article' },
  { id: 'book', label: 'Book' },
  { id: 'report', label: 'Report' },
  { id: 'webpage', label: 'Webpage' },
  { id: 'other', label: 'Other' },
];

interface MetadataEditModalProps {
  documentId: string;
  documentName: string;
  onClose: () => void;
}

export function MetadataEditModal({ documentId, documentName, onClose }: MetadataEditModalProps) {
  const { documentMetadata, setDocumentMetadata } = useAppStore();
  const existing = documentMetadata[documentId];

  const [docType, setDocType] = useState<DocumentType>(existing?.documentType || 'article');
  const [title, setTitle] = useState(existing?.title || documentName.replace(/\.pdf$/i, ''));
  const [authors, setAuthors] = useState<string[]>(existing?.authors || []);
  const [newAuthor, setNewAuthor] = useState('');
  const [year, setYear] = useState(existing?.year?.toString() || '');
  const [doi, setDoi] = useState(existing?.doi || '');
  const [journal, setJournal] = useState(existing?.journal || '');
  const [volume, setVolume] = useState(existing?.volume || '');
  const [issue, setIssue] = useState(existing?.issue || '');
  const [pages, setPages] = useState(existing?.pages || '');
  const [publisher, setPublisher] = useState(existing?.publisher || '');
  const [url, setUrl] = useState(existing?.url || '');

  const addAuthor = () => {
    if (!newAuthor.trim()) return;
    setAuthors([...authors, newAuthor.trim()]);
    setNewAuthor('');
  };

  const handleSave = () => {
    const metadata: DocumentMetadata = {
      documentId,
      title,
      authors,
      documentType: docType,
      ...(year ? { year: parseInt(year) } : {}),
      ...(doi ? { doi } : {}),
      ...(journal ? { journal } : {}),
      ...(volume ? { volume } : {}),
      ...(issue ? { issue } : {}),
      ...(pages ? { pages } : {}),
      ...(publisher ? { publisher } : {}),
      ...(url ? { url } : {}),
    };
    setDocumentMetadata(documentId, metadata);
    onClose();
  };

  const inputClass = 'w-full bg-background border border-border/20 rounded-lg px-3 py-2 text-xs text-foreground font-body placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring';

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-background/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed left-1/2 top-1/2 z-[60] -translate-x-1/2 -translate-y-1/2 w-full max-w-md max-h-[80vh] bg-popover border border-border/30 rounded-xl shadow-xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-border/20">
          <h3 className="text-sm font-display text-foreground">Edit Metadata</h3>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {/* Document type */}
          <div>
            <label className="text-[10px] text-muted-foreground font-body mb-1 block">Type</label>
            <div className="flex gap-1.5">
              {DOC_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setDocType(t.id)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-body transition-colors ${
                    docType === t.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-accent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-[10px] text-muted-foreground font-body mb-1 block">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
          </div>

          {/* Authors */}
          <div>
            <label className="text-[10px] text-muted-foreground font-body mb-1 block">Authors (Last, First)</label>
            <div className="space-y-1 mb-1.5">
              {authors.map((a, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="text-xs font-body text-foreground flex-1 truncate">{a}</span>
                  <button
                    onClick={() => setAuthors(authors.filter((_, j) => j !== i))}
                    className="p-0.5 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-1.5">
              <input
                value={newAuthor}
                onChange={(e) => setNewAuthor(e.target.value)}
                placeholder="Smith, John"
                className={inputClass}
                onKeyDown={(e) => { if (e.key === 'Enter') addAuthor(); }}
              />
              <button
                onClick={addAuthor}
                className="px-2 py-1 bg-accent text-foreground rounded-lg text-xs hover:bg-accent/80 transition-colors shrink-0"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Year + DOI */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-muted-foreground font-body mb-1 block">Year</label>
              <input value={year} onChange={(e) => setYear(e.target.value)} placeholder="2024" className={inputClass} />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground font-body mb-1 block">DOI</label>
              <input value={doi} onChange={(e) => setDoi(e.target.value)} placeholder="10.1234/..." className={inputClass} />
            </div>
          </div>

          {/* Conditional fields */}
          {docType === 'article' && (
            <>
              <div>
                <label className="text-[10px] text-muted-foreground font-body mb-1 block">Journal</label>
                <input value={journal} onChange={(e) => setJournal(e.target.value)} className={inputClass} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-muted-foreground font-body mb-1 block">Volume</label>
                  <input value={volume} onChange={(e) => setVolume(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground font-body mb-1 block">Issue</label>
                  <input value={issue} onChange={(e) => setIssue(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground font-body mb-1 block">Pages</label>
                  <input value={pages} onChange={(e) => setPages(e.target.value)} placeholder="1-15" className={inputClass} />
                </div>
              </div>
            </>
          )}

          {docType === 'book' && (
            <div>
              <label className="text-[10px] text-muted-foreground font-body mb-1 block">Publisher</label>
              <input value={publisher} onChange={(e) => setPublisher(e.target.value)} className={inputClass} />
            </div>
          )}

          {/* URL */}
          <div>
            <label className="text-[10px] text-muted-foreground font-body mb-1 block">URL</label>
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className={inputClass} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border/20">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-body text-muted-foreground border border-border/20 rounded-lg hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 text-xs font-body font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            Save Metadata
          </button>
        </div>
      </motion.div>
    </>
  );
}
