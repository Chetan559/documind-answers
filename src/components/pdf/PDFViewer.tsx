import { useState } from 'react';
import { FileText, ZoomIn, ZoomOut, Maximize, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface PDFViewerProps {
  fileUrl?: string;
  fileName?: string;
  totalPages?: number;
  onClose?: () => void;
}

const PDFViewer = ({ fileName = 'Document.pdf', totalPages = 42, onClose }: PDFViewerProps) => {
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(100);

  return (
    <div className="flex flex-col h-full bg-surface border-l border-border/20">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-xs text-foreground truncate font-body">{fileName}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage(Math.max(1, page - 1))} className="p-1 hover:bg-background rounded transition-colors" aria-label="Previous page">
            <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <span className="text-xs text-muted-foreground font-body px-1">{page} / {totalPages}</span>
          <button onClick={() => setPage(Math.min(totalPages, page + 1))} className="p-1 hover:bg-background rounded transition-colors" aria-label="Next page">
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <div className="w-px h-4 bg-border/30 mx-1" />
          <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="p-1 hover:bg-background rounded transition-colors" aria-label="Zoom out">
            <ZoomOut className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <span className="text-xs text-muted-foreground font-body w-8 text-center">{zoom}%</span>
          <button onClick={() => setZoom(Math.min(200, zoom + 10))} className="p-1 hover:bg-background rounded transition-colors" aria-label="Zoom in">
            <ZoomIn className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          {onClose && (
            <>
              <div className="w-px h-4 bg-border/30 mx-1" />
              <button onClick={onClose} className="p-1 hover:bg-background rounded transition-colors" aria-label="Close PDF viewer">
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mock PDF content */}
      <div className="flex-1 overflow-auto p-6 flex justify-center">
        <div className="bg-background rounded-lg p-8 w-full max-w-md shadow-lg" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}>
          <div className="space-y-4">
            <div className="h-6 bg-surface rounded w-3/4" />
            <div className="h-3 bg-surface/60 rounded w-full" />
            <div className="h-3 bg-surface/60 rounded w-5/6" />
            <div className="h-3 bg-surface/60 rounded w-full" />
            <div className="h-3 bg-surface/60 rounded w-4/6" />
            <div className="h-12 my-4" />
            <div className="h-5 bg-surface rounded w-2/3" />
            <div className="h-3 bg-surface/60 rounded w-full" />
            <div className="h-3 bg-surface/60 rounded w-5/6" />
            <div className="h-3 bg-surface/60 rounded w-full" />
            <div className="h-3 bg-surface/60 rounded w-3/4" />
            <div className="h-3 bg-surface/60 rounded w-full" />
            <div className="h-8 my-4" />
            <div className="h-3 bg-surface/60 rounded w-full" />
            <div className="h-3 bg-surface/60 rounded w-4/5" />
            <div className="h-3 bg-surface/60 rounded w-full" />
          </div>
          <p className="text-center text-xs text-muted-foreground mt-8 font-body">Page {page}</p>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
