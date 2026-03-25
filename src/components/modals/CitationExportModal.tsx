import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Download, Copy, Check, AlertTriangle } from 'lucide-react';
import { CitationFormat, CitationEntry } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { generateAllCitations } from '@/lib/citations';
import { MetadataEditModal } from './MetadataEditModal';

const FORMATS: { id: CitationFormat; name: string; discipline: string }[] = [
  { id: 'apa', name: 'APA 7th', discipline: 'Psychology, Education, Sciences' },
  { id: 'mla', name: 'MLA 9th', discipline: 'Humanities, Literature, Arts' },
  { id: 'chicago', name: 'Chicago', discipline: 'History, Social Sciences' },
  { id: 'bibtex', name: 'BibTeX', discipline: 'Computer Science, Engineering' },
];

interface CitationExportModalProps {
  sessionId: string;
  onClose: () => void;
}

export function CitationExportModal({ sessionId, onClose }: CitationExportModalProps) {
  const { sessions, documents, documentMetadata } = useAppStore();
  const [format, setFormat] = useState<CitationFormat>('apa');
  const [includePageRefs, setIncludePageRefs] = useState(true);
  const [includeExcerpts, setIncludeExcerpts] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);

  const session = sessions.find((s) => s.id === sessionId);

  // Build citation entries from session messages
  const citationEntries = useMemo((): CitationEntry[] => {
    if (!session) return [];

    const docMap: Record<string, { pages: Set<number>; excerpts: Set<string> }> = {};

    session.messages.forEach((msg) => {
      if (msg.role === 'assistant' && msg.citations) {
        msg.citations.forEach((c) => {
          // Find which doc this citation belongs to by checking session docs
          const docId = session.documentIds[0]; // Primary doc
          if (!docMap[docId]) docMap[docId] = { pages: new Set(), excerpts: new Set() };
          docMap[docId].pages.add(c.page_number);
          if (c.cited_text) docMap[docId].excerpts.add(c.cited_text.slice(0, 200));
        });
      }
    });

    return Object.entries(docMap).map(([docId, data]) => {
      const doc = documents.find((d) => d.id === docId);
      return {
        documentId: docId,
        documentName: doc?.name || 'Unknown Document',
        metadata: documentMetadata[docId] || null,
        pageNumbers: Array.from(data.pages).sort((a, b) => a - b),
        excerpts: Array.from(data.excerpts),
      };
    });
  }, [session, documents, documentMetadata]);

  const preview = useMemo(
    () => generateAllCitations(citationEntries, format, { includePageRefs, includeExcerpts }),
    [citationEntries, format, includePageRefs, includeExcerpts]
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(preview);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (type: 'txt' | 'bib' | 'docx') => {
    const ext = format === 'bibtex' ? 'bib' : type;
    const blob = new Blob([preview], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `citations.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-[672px] max-h-[85vh] bg-popover border border-border/30 rounded-xl shadow-xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/20">
          <h2 className="text-sm font-display text-foreground">Export Citations</h2>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Format picker */}
          <div>
            <p className="text-xs text-muted-foreground font-body mb-2">Citation Format</p>
            <div className="grid grid-cols-4 gap-2">
              {FORMATS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={`text-left px-3 py-2.5 rounded-lg border transition-colors ${
                    format === f.id
                      ? 'border-foreground bg-accent'
                      : 'border-border/20 hover:border-border/40'
                  }`}
                >
                  <p className="text-xs font-body font-medium text-foreground">{f.name}</p>
                  <p className="text-[9px] font-body text-muted-foreground mt-0.5">{f.discipline}</p>
                </button>
              ))}
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-4 mt-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includePageRefs}
                  onChange={(e) => setIncludePageRefs(e.target.checked)}
                  className="rounded border-border/30"
                />
                <span className="text-xs font-body text-foreground">Include page references</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeExcerpts}
                  onChange={(e) => setIncludeExcerpts(e.target.checked)}
                  className="rounded border-border/30"
                />
                <span className="text-xs font-body text-foreground">Include excerpts</span>
              </label>
            </div>
          </div>

          {/* Source metadata review */}
          <div>
            <p className="text-xs text-muted-foreground font-body mb-2">Source Documents</p>
            <div className="space-y-2">
              {citationEntries.map((entry) => (
                <div
                  key={entry.documentId}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-border/20 bg-background"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-body text-foreground truncate">
                      {entry.metadata?.title || entry.documentName}
                    </p>
                    {entry.metadata ? (
                      <p className="text-[10px] text-muted-foreground font-body">
                        {entry.metadata.authors.join(', ')}{entry.metadata.year ? ` (${entry.metadata.year})` : ''}
                        {' · '}Pages {entry.pageNumbers.join(', ')}
                      </p>
                    ) : (
                      <p className="text-[10px] text-destructive font-body flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Metadata missing — click Edit
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setEditingDocId(entry.documentId)}
                    className="ml-2 px-2.5 py-1 text-[10px] font-body text-muted-foreground border border-border/20 rounded-md hover:text-foreground hover:border-border/40 transition-colors"
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div>
            <p className="text-xs text-muted-foreground font-body mb-2">Preview</p>
            <pre className="bg-background border border-border/20 rounded-lg p-3 text-xs font-mono text-foreground whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
              {preview || 'No citations to preview.'}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border/20">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDownload(format === 'bibtex' ? 'bib' : 'txt')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-body border border-border/20 rounded-lg text-muted-foreground hover:text-foreground hover:border-border/40 transition-colors"
            >
              <Download className="w-3 h-3" />
              {format === 'bibtex' ? '.bib' : '.txt'}
            </button>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-body font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied!' : 'Copy All'}
          </button>
        </div>
      </motion.div>

      {/* Metadata edit modal stacks on top */}
      {editingDocId && (
        <MetadataEditModal
          documentId={editingDocId}
          documentName={citationEntries.find((e) => e.documentId === editingDocId)?.documentName || ''}
          onClose={() => setEditingDocId(null)}
        />
      )}
    </>
  );
}
