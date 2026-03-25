import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { AnnotationColor } from '@/types';
import { useAppStore } from '@/store/useAppStore';

const COLORS: { color: AnnotationColor; hex: string }[] = [
  { color: 'yellow', hex: '#facc15' },
  { color: 'blue', hex: '#3b82f6' },
  { color: 'green', hex: '#22c55e' },
  { color: 'red', hex: '#ef4444' },
];

interface CreateCollectionModalProps {
  onClose: () => void;
}

export function CreateCollectionModal({ onClose }: CreateCollectionModalProps) {
  const { createCollection } = useAppStore();
  const [name, setName] = useState('');
  const [color, setColor] = useState<AnnotationColor>('yellow');

  const handleSubmit = () => {
    if (!name.trim()) return;
    createCollection(name.trim(), color);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-72 bg-popover border border-border/30 rounded-xl shadow-xl p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-display text-foreground">New Collection</h3>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Collection name"
          className="w-full bg-background border border-border/20 rounded-lg px-3 py-2 text-xs text-foreground font-body placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
          }}
        />

        <div className="flex items-center gap-2 mt-3">
          {COLORS.map((c) => (
            <button
              key={c.color}
              onClick={() => setColor(c.color)}
              className="w-7 h-7 rounded-full transition-transform hover:scale-110"
              style={{
                backgroundColor: c.hex,
                boxShadow: color === c.color ? '0 0 0 2.5px hsl(var(--foreground))' : 'none',
              }}
            />
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="w-full mt-3 py-2 text-xs font-body font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          Create
        </button>
      </motion.div>
    </>
  );
}
