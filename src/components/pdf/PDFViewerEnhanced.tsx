import { useState, useCallback, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { ZoomIn, ZoomOut, X, Loader2, StickyNote } from 'lucide-react';
import { getDocumentFileUrl } from '@/api/documents';
import { Citation } from '@/api/chat';
import { AnnotationRect } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { AnnotationLayer } from './AnnotationLayer';
import { SelectionToolbar } from './SelectionToolbar';
import { AnnotationSidepanel } from './AnnotationSidepanel';
import { CreateCollectionModal } from '@/components/modals/CreateCollectionModal';
import { AnimatePresence } from 'framer-motion';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface CitationHighlightProps {
  bbox: Citation['bbox'];
  pageSize: { width: number; height: number };
  pdfNativeSize: { width: number; height: number };
}

function CitationHighlight({ bbox, pageSize, pdfNativeSize }: CitationHighlightProps) {
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

interface PDFViewerEnhancedProps {
  pdfId: string;
  fileName?: string;
  onClose?: () => void;
  citations?: Citation[];
  activePage?: number;
  onPageChange?: (page: number) => void;
  sessionId?: string;
  onAskFromSelection?: (text: string) => void;
}

const PDFViewerEnhanced = ({
  pdfId,
  fileName = 'Document.pdf',
  onClose,
  citations = [],
  activePage,
  onPageChange,
  sessionId,
  onAskFromSelection,
}: PDFViewerEnhancedProps) => {
  const { annotations } = useAppStore();
  const [numPages, setNumPages] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [loading, setLoading] = useState(true);
  const [pageSizes, setPageSizes] = useState<Record<number, { width: number; height: number }>>({});
  const [pdfNativeSizes, setPdfNativeSizes] = useState<Record<number, { width: number; height: number }>>({});
  const [showSidepanel, setShowSidepanel] = useState(false);
  const [showCreateCollection, setShowCreateCollection] = useState(false);

  // Selection state
  const [selectionToolbar, setSelectionToolbar] = useState<{
    position: { x: number; y: number };
    selectedText: string;
    pageNumber: number;
    rects: AnnotationRect[];
  } | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const viewerContainerRef = useRef<HTMLDivElement>(null);

  const fileUrl = getDocumentFileUrl(pdfId);
  const docAnnotationCount = annotations.filter((a) => a.documentId === pdfId).length;

  // Scroll to page when activePage changes
  useEffect(() => {
    if (activePage && scrollContainerRef.current) {
      const pageEl = scrollContainerRef.current.querySelector(`[data-page-number="${activePage}"]`);
      pageEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activePage]);

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.toString().trim()) return;

    const selectedText = selection.toString().trim();
    const range = selection.getRangeAt(0);

    // Find which page the selection is in
    const pageEl = (range.startContainer as HTMLElement).nodeType === 1
      ? (range.startContainer as HTMLElement).closest('[data-page-number]')
      : (range.startContainer.parentElement)?.closest('[data-page-number]');

    if (!pageEl || !viewerContainerRef.current) return;

    const pageNumber = parseInt(pageEl.getAttribute('data-page-number') || '1');
    const pageRect = pageEl.getBoundingClientRect();
    const containerRect = viewerContainerRef.current.getBoundingClientRect();

    // Calculate rects as percentages of page
    const clientRects = range.getClientRects();
    const rects: AnnotationRect[] = [];
    for (let i = 0; i < clientRects.length; i++) {
      const r = clientRects[i];
      rects.push({
        x: ((r.left - pageRect.left) / pageRect.width) * 100,
        y: ((r.top - pageRect.top) / pageRect.height) * 100,
        width: (r.width / pageRect.width) * 100,
        height: (r.height / pageRect.height) * 100,
      });
    }

    // Position toolbar centered on first rect, relative to viewer container
    const firstRect = clientRects[0];
    const posX = firstRect.left + firstRect.width / 2 - containerRect.left;
    const posY = firstRect.top - containerRect.top + (scrollContainerRef.current?.scrollTop || 0);

    setSelectionToolbar({
      position: { x: posX, y: posY },
      selectedText,
      pageNumber,
      rects,
    });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Dismiss selection toolbar when clicking outside it
    const target = e.target as HTMLElement;
    if (!target.closest('[data-selection-toolbar]') && !target.closest('[data-annotation-highlight]')) {
      setSelectionToolbar(null);
    }
  }, []);

  const pageWidth = Math.max(200, 300 * (zoom / 100));

  return (
    <div className="flex h-full bg-surface border-l border-border/20">
      {/* Main viewer area */}
      <div className="flex-1 flex flex-col min-w-0" ref={viewerContainerRef}>
        {/* Toolbar */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/20 shrink-0">
          <span className="text-xs text-foreground truncate font-body max-w-[120px]">{fileName}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="p-1 hover:bg-background rounded transition-colors" aria-label="Zoom out">
              <ZoomOut className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            <span className="text-xs text-muted-foreground font-body w-8 text-center">{zoom}%</span>
            <button onClick={() => setZoom(Math.min(250, zoom + 10))} className="p-1 hover:bg-background rounded transition-colors" aria-label="Zoom in">
              <ZoomIn className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            <div className="w-px h-4 bg-border/30 mx-1" />
            <button
              onClick={() => setShowSidepanel(!showSidepanel)}
              className={`p-1 rounded transition-colors relative ${showSidepanel ? 'bg-accent text-foreground' : 'hover:bg-background text-muted-foreground'}`}
              aria-label="Toggle annotations"
            >
              <StickyNote className="w-3.5 h-3.5" />
              {docAnnotationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary text-primary-foreground text-[8px] rounded-full flex items-center justify-center font-body">
                  {docAnnotationCount}
                </span>
              )}
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

        {/* Scrollable pages */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto overflow-x-auto p-4 relative"
          onMouseUp={handleMouseUp}
          onMouseDown={handleMouseDown}
        >
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
            <div className="flex flex-col items-center gap-4">
              {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => {
                const pageCitations = citations.filter((c) => c.page_number === pageNum);
                const ps = pageSizes[pageNum] || { width: 0, height: 0 };
                const ns = pdfNativeSizes[pageNum] || { width: 612, height: 792 };

                return (
                  <div
                    key={pageNum}
                    data-page-number={pageNum}
                    className="relative inline-block shadow-lg"
                  >
                    <Page
                      pageNumber={pageNum}
                      width={pageWidth}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                      onLoadSuccess={(pageInfo) => {
                        setPdfNativeSizes((prev) => ({
                          ...prev,
                          [pageNum]: { width: pageInfo.originalWidth, height: pageInfo.originalHeight },
                        }));
                      }}
                      onRenderSuccess={() => {
                        const canvas = scrollContainerRef.current?.querySelector(
                          `[data-page-number="${pageNum}"] .react-pdf__Page__canvas`
                        ) as HTMLCanvasElement;
                        if (canvas) {
                          setPageSizes((prev) => ({
                            ...prev,
                            [pageNum]: { width: canvas.clientWidth, height: canvas.clientHeight },
                          }));
                        }
                      }}
                    />
                    {/* Citation highlights */}
                    {pageCitations.map((c) => (
                      <CitationHighlight
                        key={c.id}
                        bbox={c.bbox}
                        pageSize={ps}
                        pdfNativeSize={ns}
                      />
                    ))}
                    {/* Annotation highlights */}
                    <AnnotationLayer pageNumber={pageNum} documentId={pdfId} />
                    {/* Page number label */}
                    <div className="text-center mt-1">
                      <span className="text-[10px] text-muted-foreground font-body">{pageNum}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Document>

          {/* Selection toolbar */}
          {selectionToolbar && (
            <div data-selection-toolbar>
              <SelectionToolbar
                position={selectionToolbar.position}
                selectedText={selectionToolbar.selectedText}
                pageNumber={selectionToolbar.pageNumber}
                rects={selectionToolbar.rects}
                documentId={pdfId}
                sessionId={sessionId}
                onDismiss={() => setSelectionToolbar(null)}
                onAsk={onAskFromSelection}
              />
            </div>
          )}
        </div>
      </div>

      {/* Annotation sidepanel */}
      {showSidepanel && (
        <AnnotationSidepanel
          documentId={pdfId}
          onClose={() => setShowSidepanel(false)}
          onCreateCollection={() => setShowCreateCollection(true)}
        />
      )}

      {/* Create collection modal */}
      <AnimatePresence>
        {showCreateCollection && (
          <CreateCollectionModal onClose={() => setShowCreateCollection(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PDFViewerEnhanced;
