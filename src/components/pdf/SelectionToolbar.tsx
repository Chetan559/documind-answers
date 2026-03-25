import { useState } from 'react';
import { MessageSquare, Bookmark, Copy, X, StickyNote } from 'lucide-react';
import { AnnotationColor, AnnotationRect } from '@/types';
import { useAppStore } from '@/store/useAppStore';

const COLORS: { color: AnnotationColor; hex: string }[] = [
  { color: 'yellow', hex: '#facc15' },
  { color: 'blue', hex: '#3b82f6' },
  { color: 'green', hex: '#22c55e' },
  { color: 'red', hex: '#ef4444' },
];

interface SelectionToolbarProps {
  position: { x: number; y: number };
  selectedText: string;
  pageNumber: number;
  rects: AnnotationRect[];
  documentId: string;
  sessionId?: string;
  onDismiss: () => void;
  onAsk?: (text: string) => void;
}

export function SelectionToolbar({
  position,
  selectedText,
  pageNumber,
  rects,
  documentId,
  sessionId,
  onDismiss,
  onAsk,
}: SelectionToolbarProps) {
  const { createAnnotation, annotationCollections, addToCollection } = useAppStore();
  const [showNote, setShowNote] = useState(false);
  const [showCollections, setShowCollections] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [selectedColor, setSelectedColor] = useState<AnnotationColor>('yellow');

  const createHighlight = (color: AnnotationColor, note?: string) => {
    const ann = createAnnotation({
      documentId,
      sessionId,
      selectedText,
      note,
      color,
      bounds: { page: pageNumber, rects },
    });
    if (!note) onDismiss();
    return ann;
  };

  const handleColorClick = (color: AnnotationColor) => {
    setSelectedColor(color);
    if (!showNote) {
      createHighlight(color);
    }
  };

  const handleNoteSave = () => {
    createHighlight(selectedColor, noteText);
    onDismiss();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedText);
    onDismiss();
  };

  const handleAsk = () => {
    const truncated = selectedText.slice(0, 200);
    const query = `Regarding this passage: '${truncated}${selectedText.length > 200 ? '...' : ''}' — can you explain this further?`;
    onAsk?.(query);
    onDismiss();
  };

  return (
    <div
      className="absolute z-30"
      style={{
        left: position.x,
        top: position.y - 52,
        transform: 'translateX(-50%)',
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="bg-popover border border-border/30 rounded-xl shadow-xl">
        {/* Main row */}
        <div className="flex items-center gap-1 px-2 py-1.5">
          {/* Color swatches */}
          <div className="flex items-center gap-1 pr-2 border-r border-border/20">
            {COLORS.map((c) => (
              <button
                key={c.color}
                onClick={() => handleColorClick(c.color)}
                className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  backgroundColor: c.hex,
                  borderColor: selectedColor === c.color ? 'hsl(var(--foreground))' : 'transparent',
                }}
              />
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => { setShowNote(!showNote); setShowCollections(false); }}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              title="Add note"
            >
              <StickyNote className="w-3.5 h-3.5" />
            </button>
            {sessionId && (
              <button
                onClick={handleAsk}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                title="Ask about this"
              >
                <MessageSquare className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => { setShowCollections(!showCollections); setShowNote(false); }}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              title="Save to collection"
            >
              <Bookmark className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              title="Copy text"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDismiss}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Note panel */}
        {showNote && (
          <div className="px-2 pb-2 border-t border-border/20">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add a note..."
              className="w-full mt-2 bg-background border border-border/20 rounded-md px-2 py-1.5 text-xs text-foreground font-body resize-none focus:outline-none focus:ring-1 focus:ring-ring"
              rows={2}
              autoFocus
            />
            <button
              onClick={handleNoteSave}
              className="mt-1 w-full py-1 text-xs font-body font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
            >
              Save Highlight + Note
            </button>
          </div>
        )}

        {/* Collection picker */}
        {showCollections && (
          <div className="px-2 pb-2 border-t border-border/20 max-h-40 overflow-y-auto">
            <p className="text-[10px] text-muted-foreground font-body mt-2 mb-1">Save to collection:</p>
            {annotationCollections.length === 0 ? (
              <p className="text-[10px] text-muted-foreground font-body italic">No collections yet</p>
            ) : (
              annotationCollections.map((col) => (
                <button
                  key={col.id}
                  onClick={() => {
                    const ann = createHighlight(selectedColor);
                    addToCollection(col.id, ann.id);
                    onDismiss();
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-foreground font-body hover:bg-accent transition-colors"
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: COLORS.find((c) => c.color === col.color)?.hex }}
                  />
                  <span className="truncate">{col.name}</span>
                  <span className="text-muted-foreground ml-auto">{col.annotationIds.length}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Arrow pointer */}
      <div
        className="w-3 h-3 bg-popover border-r border-b border-border/30 mx-auto"
        style={{ transform: 'rotate(45deg)', marginTop: -6 }}
      />
    </div>
  );
}
