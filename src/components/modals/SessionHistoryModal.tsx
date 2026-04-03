import {
  FileText,
  X,
  Pin,
  Trash2,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ChatSession } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { useNavigate } from 'react-router-dom';

interface Props {
  session: ChatSession;
  onClose: () => void;
}

export function SessionHistoryModal({ session, onClose }: Props) {
  const { documents, openSession, deleteSession, pinSession } = useAppStore();
  const navigate = useNavigate();

  const sessionDocs = documents.filter((d) =>
    session.documentIds.includes(d.id)
  );

  const handleOpen = () => {
    openSession(session.id);
    onClose();
    navigate('/chat');
  };

  const handleDelete = () => {
    deleteSession(session.id);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="w-full max-w-lg bg-surface border border-border/30 rounded-xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-5 border-b border-border/20">
            <div className="min-w-0">
              <h3 className="font-display text-lg text-foreground truncate">
                {session.title}
              </h3>
              <p className="text-[10px] font-body text-muted-foreground mt-1">
                {session.messageCount ?? session.messages.length} messages · {sessionDocs.length}{' '}
                document{sessionDocs.length !== 1 ? 's' : ''} ·{' '}
                {new Date(session.updatedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Documents */}
          <div className="px-5 py-3 border-b border-border/20">
            <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider mb-2">
              Documents ({sessionDocs.length})
            </p>
            {sessionDocs.length === 0 ? (
              <p className="text-xs font-body text-muted-foreground">
                No documents attached
              </p>
            ) : (
              <div className="space-y-1">
                {sessionDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-2 px-2 py-1.5 bg-background rounded-md"
                  >
                    <FileText className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs font-body text-foreground truncate">
                      {doc.name}
                    </span>
                    <span className="text-[10px] font-body text-muted-foreground ml-auto shrink-0">
                      {doc.pageCount}p
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Message preview */}
          <div className="px-5 py-3 border-b border-border/20 max-h-[200px] overflow-y-auto">
            <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider mb-2">
              Conversation preview
            </p>
            {session.messages.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-4 justify-center">
                <MessageSquare className="w-4 h-4 text-muted-foreground/50" />
                <p className="text-xs font-body text-muted-foreground text-center">
                  {(session.messageCount ?? session.messages.length) > 0 
                     ? `Open chat to view ${(session.messageCount ?? session.messages.length)} message${(session.messageCount ?? session.messages.length) > 1 ? 's' : ''}`
                     : 'No messages yet'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {session.messages.slice(-4).map((msg) => (
                  <div key={msg.id} className="flex items-start gap-2">
                    {msg.role === 'assistant' && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <span className="text-[8px] font-display text-primary-foreground">
                          D
                        </span>
                      </div>
                    )}
                    <div
                      className={`${msg.role === 'user' ? 'ml-7' : ''}`}
                    >
                      <p className="text-[10px] font-body text-muted-foreground line-clamp-2">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                ))}
                {session.messages.length > 4 && (
                  <p className="text-[9px] font-body text-muted-foreground/70 text-center">
                    + {session.messages.length - 4} earlier messages
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => pinSession(session.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-body border transition-colors ${
                  session.isPinned
                    ? 'bg-surface border-border/30 text-foreground'
                    : 'border-border/20 text-muted-foreground hover:border-border/40 hover:text-foreground'
                }`}
              >
                <Pin className="w-3 h-3" />
                {session.isPinned ? 'Unpin' : 'Pin'}
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-body text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            </div>

            <button
              onClick={handleOpen}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-body font-medium hover:bg-primary/90 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              Open Chat
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
