import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Annotation, AnnotationColor } from '@/types';
import { useAppStore } from '@/store/useAppStore';

const COLOR_MAP: Record<AnnotationColor, { bg: string; border: string }> = {
  yellow: { bg: 'rgba(250, 204, 21, 0.35)', border: 'rgba(250, 204, 21, 0.7)' },
  blue: { bg: 'rgba(59, 130, 246, 0.35)', border: 'rgba(59, 130, 246, 0.7)' },
  green: { bg: 'rgba(34, 197, 94, 0.35)', border: 'rgba(34, 197, 94, 0.7)' },
  red: { bg: 'rgba(239, 68, 68, 0.35)', border: 'rgba(239, 68, 68, 0.7)' },
};

interface AnnotationLayerProps {
  pageNumber: number;
  documentId: string;
}

export function AnnotationLayer({ pageNumber, documentId }: AnnotationLayerProps) {
  const { annotations, deleteAnnotation, setActiveAnnotation } = useAppStore();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const pageAnnotations = annotations.filter(
    (a) => a.documentId === documentId && a.bounds.page === pageNumber
  );

  if (pageAnnotations.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
      {pageAnnotations.map((ann) =>
        ann.bounds.rects.map((rect, i) => {
          const colors = COLOR_MAP[ann.color];
          const isFirst = i === 0;
          return (
            <div
              key={`${ann.id}-${i}`}
              className="absolute pointer-events-auto cursor-pointer"
              style={{
                left: `${rect.x}%`,
                top: `${rect.y}%`,
                width: `${rect.width}%`,
                height: `${rect.height}%`,
                backgroundColor: colors.bg,
                borderBottom: `2px solid ${colors.border}`,
                mixBlendMode: 'multiply',
              }}
              onMouseEnter={() => setHoveredId(ann.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => setActiveAnnotation(ann.id)}
            >
              {/* Note indicator dot */}
              {isFirst && ann.note && (
                <div
                  className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-background"
                  style={{ backgroundColor: colors.border }}
                />
              )}

              {/* Hover tooltip */}
              {isFirst && hoveredId === ann.id && (
                <div
                  className="absolute bottom-full left-0 mb-2 z-20 pointer-events-auto"
                  style={{ minWidth: 200, maxWidth: 280 }}
                >
                  <div className="bg-popover border border-border/30 rounded-lg p-3 shadow-xl">
                    <p className="text-xs text-muted-foreground italic font-body truncate">
                      "{ann.selectedText.slice(0, 100)}{ann.selectedText.length > 100 ? '…' : ''}"
                    </p>
                    {ann.note && (
                      <p className="text-xs text-foreground font-body mt-1.5">{ann.note}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-muted-foreground font-body">
                        {new Date(ann.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAnnotation(ann.id);
                        }}
                        className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
