import { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react';
import { getDocumentFileUrl } from '@/api/documents';
import { Citation } from '@/api/chat';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface PDFViewerProps {
  pdfId: string;
  fileName?: string;
  onClose?: () => void;
  citations?: Citation[];
  activePage?: number;
  onPageChange?: (page: number) => void;
}

function CitationHighlight({
  bbox,
  pageSize,
  pdfNativeSize,
}: {
  bbox: Citation['bbox'];
  pageSize: { width: number; height: number };
  pdfNativeSize: { width: number; height: number };
}) {
  const scaleX = pageSize.width / pdfNativeSize.width;
  const scaleY = pageSize.height / pdfNativeSize.height;

  const left = bbox.x0 * scaleX;
  const top = pageSize.height - bbox.y1 * scaleY;
  const width = (bbox.x1 - bbox.x0) * scaleX;
  const height = (bbox.y1 - bbox.y0) * scaleY;

  return (
    <div
      className="absolute pointer-events-none z-10 rounded-sm"
      style={{
        left, top, width, height,
        backgroundColor: 'rgba(255, 220, 0, 0.35)',
        border: '2px solid rgba(255, 180, 0, 0.8)',
      }}
    />
  );
}

const PDFViewer = ({ pdfId, fileName = 'Document.pdf', onClose, citations = [], activePage, onPageChange }: PDFViewerProps) => {
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(activePage || 1);
  const [zoom, setZoom] = useState(100);
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });
  const [pdfNativeSize, setPdfNativeSize] = useState({ width: 612, height: 792 });
  const [loading, setLoading] = useState(true);

  const currentPage = activePage || page;

  const goToPage = useCallback((p: number) => {
    const clamped = Math.max(1, Math.min(numPages || 1, p));
    setPage(clamped);
    onPageChange?.(clamped);
  }, [numPages, onPageChange]);

  const fileUrl = getDocumentFileUrl(pdfId);

  const pageCitations = citations.filter(c => c.page_number === currentPage);

  return (
    <div className="flex flex-col h-full bg-surface border-l border-border/20">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
        <span className="text-xs text-foreground truncate font-body max-w-[140px]">{fileName}</span>
        <div className="flex items-center gap-1">
          <button onClick={() => goToPage(currentPage - 1)} className="p-1 hover:bg-background rounded transition-colors" aria-label="Previous page">
            <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <span className="text-xs text-muted-foreground font-body px-1">{currentPage} / {numPages || '–'}</span>
          <button onClick={() => goToPage(currentPage + 1)} className="p-1 hover:bg-background rounded transition-colors" aria-label="Next page">
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

      {/* PDF Content */}
      <div className="flex-1 overflow-auto p-4 flex justify-center">
        <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}>
          <Document
            file={fileUrl}
            onLoadSuccess={({ numPages: n }) => { setNumPages(n); setLoading(false); }}
            onLoadError={() => setLoading(false)}
            loading={
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
              </div>
            }
          >
            <div className="relative inline-block">
              <Page
                pageNumber={currentPage}
                width={300}
                onLoadSuccess={(pageInfo) => {
                  setPdfNativeSize({ width: pageInfo.originalWidth, height: pageInfo.originalHeight });
                }}
                onRenderSuccess={() => {
                  // Get rendered size from the canvas
                  const canvas = document.querySelector('.react-pdf__Page__canvas') as HTMLCanvasElement;
                  if (canvas) {
                    setPageSize({ width: canvas.clientWidth, height: canvas.clientHeight });
                  }
                }}
              />
              {pageCitations.map(c => (
                <CitationHighlight
                  key={c.id}
                  bbox={c.bbox}
                  pageSize={pageSize}
                  pdfNativeSize={pdfNativeSize}
                />
              ))}
            </div>
          </Document>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
