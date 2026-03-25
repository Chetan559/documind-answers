import { useState } from 'react';
import { X, Trash2, Plus, StickyNote } from 'lucide-react';
import { AnnotationColor } from '@/types';
import { useAppStore } from '@/store/useAppStore';

const COLORS: { color: AnnotationColor; hex: string }[] = [
  { color: 'yellow', hex: '#facc15' },
  { color: 'blue', hex: '#3b82f6' },
  { color: 'green', hex: '#22c55e' },
  { color: 'red', hex: '#ef4444' },
];

interface AnnotationSidepanelProps {
  documentId: string;
  onClose: () => void;
  onCreateCollection: () => void;
}

export function AnnotationSidepanel({ documentId, onClose, onCreateCollection }: AnnotationSidepanelProps) {
  const { annotations, annotationCollections, updateAnnotation, deleteAnnotation, setActiveAnnotation } = useAppStore();
  const [filterColor, setFilterColor] = useState<AnnotationColor | null>(null);
  const [filterCollectionId, setFilterCollectionId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  const docAnnotations = annotations.filter((a) => a.documentId === documentId);
  let filtered = docAnnotations;
  if (filterColor) filtered = filtered.filter((a) => a.color === filterColor);
  if (filterCollectionId) filtered = filtered.filter((a) => a.collectionIds.includes(filterCollectionId));

  // Group by page
  const byPage = filtered.reduce<Record<number, typeof filtered>>((acc, a) => {
    const p = a.bounds.page;
    if (!acc[p]) acc[p] = [];
    acc[p].push(a);
    return acc;
  }, {});
  const pages = Object.keys(byPage).map(Number).sort((a, b) => a - b);

  const startEditNote = (ann: typeof docAnnotations[0]) => {
    setEditingNoteId(ann.id);
    setNoteText(ann.note || '');
  };

  const saveNote = (id: string) => {
    updateAnnotation(id, { note: noteText });
    setEditingNoteId(null);
  };

  return (
    <div className="w-64 bg-surface border-l border-border/20 flex flex-col h-full shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-border/20">
        <span className="text-xs font-body text-foreground font-medium">
          Annotations ({docAnnotations.length})
        </span>
        <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Filters */}
      <div className="px-3 py-2 border-b border-border/20 space-y-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilterColor(null)}
            className={`px-2 py-0.5 rounded-full text-[10px] font-body transition-colors ${
              !filterColor ? 'bg-primary text-primary-foreground' : 'bg-accent text-muted-foreground hover:text-foreground'
            }`}
          >
            All
          </button>
          {COLORS.map((c) => (
            <button
              key={c.color}
              onClick={() => setFilterColor(filterColor === c.color ? null : c.color)}
              className="w-5 h-5 rounded-full transition-all"
              style={{
                backgroundColor: c.hex,
                boxShadow: filterColor === c.color ? '0 0 0 2px hsl(var(--foreground))' : 'none',
              }}
            />
          ))}
        </div>
        {annotationCollections.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {annotationCollections.map((col) => (
              <button
                key={col.id}
                onClick={() => setFilterCollectionId(filterCollectionId === col.id ? null : col.id)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-body transition-colors ${
                  filterCollectionId === col.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-accent text-muted-foreground hover:text-foreground'
                }`}
              >
                {col.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Annotation list */}
      <div className="flex-1 overflow-y-auto">
        {pages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center px-4">
            <StickyNote className="w-5 h-5 text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground font-body">No annotations yet</p>
          </div>
        ) : (
          pages.map((page) => (
            <div key={page} className="px-3 pt-3">
              <p className="text-[10px] text-muted-foreground font-body mb-1.5">Page {page}</p>
              {byPage[page].map((ann) => {
                const colorHex = COLORS.find((c) => c.color === ann.color)?.hex || '#facc15';
                return (
                  <div
                    key={ann.id}
                    className="group mb-2 rounded-lg bg-background border border-border/15 overflow-hidden cursor-pointer hover:border-border/30 transition-colors"
                    onClick={() => setActiveAnnotation(ann.id)}
                  >
                    <div className="flex">
                      <div className="w-1 shrink-0" style={{ backgroundColor: colorHex }} />
                      <div className="flex-1 px-2.5 py-2">
                        <p className="text-xs text-muted-foreground font-body italic leading-tight">
                          "{ann.selectedText.slice(0, 80)}{ann.selectedText.length > 80 ? '…' : ''}"
                        </p>

                        {editingNoteId === ann.id ? (
                          <div className="mt-1.5">
                            <textarea
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              className="w-full bg-surface border border-border/20 rounded px-1.5 py-1 text-[11px] text-foreground font-body resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                              rows={2}
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  saveNote(ann.id);
                                }
                              }}
                            />
                            <button
                              onClick={(e) => { e.stopPropagation(); saveNote(ann.id); }}
                              className="mt-1 text-[10px] font-body text-primary hover:underline"
                            >
                              Save
                            </button>
                          </div>
                        ) : ann.note ? (
                          <p
                            className="text-[11px] text-foreground font-body mt-1 cursor-text"
                            onClick={(e) => { e.stopPropagation(); startEditNote(ann); }}
                          >
                            {ann.note}
                          </p>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); startEditNote(ann); }}
                            className="text-[10px] text-muted-foreground font-body mt-1 hover:text-foreground transition-colors"
                          >
                            + add note
                          </button>
                        )}

                        <div className="flex items-center justify-between mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[9px] text-muted-foreground font-body">
                            {new Date(ann.createdAt).toLocaleDateString()}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteAnnotation(ann.id); }}
                            className="p-0.5 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Bottom action */}
      <div className="px-3 py-3 border-t border-border/20">
        <button
          onClick={onCreateCollection}
          className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-border/30 rounded-lg text-[10px] font-body text-muted-foreground hover:text-foreground hover:border-border/50 transition-colors"
        >
          <Plus className="w-3 h-3" />
          New Collection
        </button>
      </div>
    </div>
  );
}
