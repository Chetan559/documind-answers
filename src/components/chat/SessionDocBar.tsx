import { FileText } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export function SessionDocBar() {
  const { sessions, activeSessionId, documents, setActivePDFViewer, activePDFViewerId } =
    useAppStore();
  const session = sessions.find((s) => s.id === activeSessionId);
  if (!session || session.documentIds.length === 0) return null;

  const sessionDocs = documents.filter((d) =>
    session.documentIds.includes(d.id)
  );

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-t border-border/20 overflow-x-auto">
      <span className="text-[9px] font-body text-muted-foreground shrink-0 uppercase tracking-wider">
        Context:
      </span>
      {sessionDocs.map((doc) => (
        <button
          key={doc.id}
          onClick={() =>
            setActivePDFViewer(activePDFViewerId === doc.id ? null : doc.id)
          }
          className={`flex items-center gap-1 px-2 py-1 rounded-md border text-[10px] font-body shrink-0 transition-all ${
            activePDFViewerId === doc.id
              ? 'bg-surface border-border/30 text-foreground'
              : 'border-border/15 text-muted-foreground hover:border-border/30 hover:text-foreground'
          }`}
        >
          <FileText className="w-2.5 h-2.5" />
          {doc.name}
        </button>
      ))}
    </div>
  );
}
