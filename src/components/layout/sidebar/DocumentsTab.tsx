import { FileText, Eye, Trash2, Paperclip, Plus } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { deleteDocument } from '@/api/documents';
import { useToast } from '@/hooks/use-toast';

export function DocumentsTab() {
  const {
    documents,
    sessions,
    activeSessionId,
    detachDocFromSession,
    setActivePDFViewer,
    activePDFViewerId,
    attachDocToSession,
    createSession,
    removeDocument,
  } = useAppStore();
  const { toast } = useToast();

  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const sessionDocs = activeSession
    ? documents.filter((d) => activeSession.documentIds.includes(d.id))
    : [];
  const otherDocs = documents.filter(
    (d) => !activeSession?.documentIds.includes(d.id)
  );

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDeleteDoc = async (docId: string, docName: string) => {
    try {
      await deleteDocument(docId);
      removeDocument(docId);
      toast({ title: 'Deleted', description: `${docName} has been removed.` });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete document.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-3 space-y-4">
      {activeSession ? (
        <div>
          <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider mb-2">
            In this chat ({sessionDocs.length})
          </p>
          <div className="space-y-1">
            {sessionDocs.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-center">
                <FileText className="w-6 h-6 text-muted-foreground/50 mb-2" />
                <p className="text-[10px] font-body text-muted-foreground">
                  No documents in this chat.
                  <br />
                  Upload one from the Upload tab.
                </p>
              </div>
            ) : (
              sessionDocs.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setActivePDFViewer(doc.id)}
                  className={`flex items-center justify-between w-full px-2.5 py-2 rounded-lg text-left transition-all group ${
                    activePDFViewerId === doc.id
                      ? 'bg-sidebar-accent border border-border/20'
                      : 'hover:bg-sidebar-accent/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="relative shrink-0">
                      <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                      <DocStatusDot status={doc.status} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-body text-foreground truncate">
                        {doc.name}
                      </p>
                      <p className="text-[10px] font-body text-muted-foreground">
                        {doc.pageCount}p · {formatSize(doc.size)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePDFViewer(doc.id);
                      }}
                      className="p-1 hover:text-foreground text-muted-foreground"
                      title="View PDF"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        detachDocFromSession(activeSessionId!, doc.id);
                      }}
                      className="p-1 hover:text-destructive text-muted-foreground"
                      title="Remove from chat"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center py-6 text-center">
          <p className="text-[10px] font-body text-muted-foreground mb-3">
            Open a chat from History to see its documents here.
          </p>
          <button
            onClick={() => createSession([])}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border/20 rounded-lg text-[10px] font-body text-foreground hover:border-border/40 transition-colors"
          >
            <Plus className="w-3 h-3" /> New Chat
          </button>
        </div>
      )}

      {/* Library — docs not in current session */}
      {otherDocs.length > 0 && (
        <div>
          <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider mb-2">
            Library ({otherDocs.length})
          </p>
          <div className="space-y-1">
            {otherDocs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-sidebar-accent/50 transition-all group border border-transparent"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="relative shrink-0">
                    <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                    <DocStatusDot status={doc.status} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-body text-foreground truncate">
                      {doc.name}
                    </p>
                    <p className="text-[10px] font-body text-muted-foreground">
                      {doc.pageCount}p · {formatSize(doc.size)}
                      {doc.status !== 'ready' && (
                        <span className="ml-1 capitalize">· {doc.status}</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  {activeSessionId && (
                    <button
                      onClick={() =>
                        attachDocToSession(activeSessionId, doc.id)
                      }
                      className="p-1 hover:text-foreground text-muted-foreground"
                      title="Add to current chat"
                    >
                      <Paperclip className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteDoc(doc.id, doc.name)}
                    className="p-1 hover:text-destructive text-muted-foreground"
                    title="Delete document"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Status indicator dot ──────────────────────────────────────────────────────
function DocStatusDot({ status }: { status: string }) {
  if (status === 'ready') return null;

  if (status === 'failed') {
    return (
      <span
        className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 ring-1 ring-sidebar"
        title="Processing failed"
      />
    );
  }

  // queued or processing → blinking yellow
  return (
    <span
      className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-yellow-400 ring-1 ring-sidebar animate-pulse"
      title={status === 'queued' ? 'Queued for processing' : 'Processing…'}
    />
  );
}
