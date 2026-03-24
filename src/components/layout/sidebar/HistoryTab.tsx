import { useState } from 'react';
import {
  Clock,
  Pin,
  MessageSquare,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { ChatSession } from '@/types';
import { SessionHistoryModal } from '@/components/modals/SessionHistoryModal';
import { AnimatePresence } from 'framer-motion';

export function HistoryTab() {
  const { sessions, activeSessionId } = useAppStore();
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(
    null
  );

  const pinned = sessions.filter((s) => s.isPinned);
  const recent = sessions.filter((s) => !s.isPinned);

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - d.getTime()) / 86400000
    );
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const SessionRow = ({ session }: { session: ChatSession }) => (
    <button
      onClick={() => setSelectedSession(session)}
      className={`w-full text-left flex items-start gap-2.5 px-2.5 py-2.5 rounded-lg mb-1 border transition-all group ${
        activeSessionId === session.id
          ? 'bg-sidebar-accent border-border/20'
          : 'border-transparent hover:bg-sidebar-accent/50 hover:border-border/10'
      }`}
    >
      <MessageSquare className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-body text-foreground truncate">
            {session.title}
          </span>
          {session.isPinned && (
            <Pin className="w-2.5 h-2.5 text-muted-foreground shrink-0" />
          )}
        </div>
        <p className="text-[10px] font-body text-muted-foreground truncate mt-0.5">
          {session.previewText}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[9px] font-body text-muted-foreground/70">
            {formatDate(session.updatedAt)}
          </span>
          <span className="text-[9px] font-body text-muted-foreground/70">
            · {session.documentIds.length} doc
            {session.documentIds.length !== 1 ? 's' : ''}
          </span>
          <span className="text-[9px] font-body text-muted-foreground/70">
            · {session.messages.length} msg
            {session.messages.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      <ChevronRight className="w-3 h-3 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
    </button>
  );

  return (
    <>
      <div className="p-3">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <Clock className="w-6 h-6 text-muted-foreground/50 mb-2" />
            <p className="text-[10px] font-body text-muted-foreground">
              No chat history yet.
              <br />
              Start a new chat to begin.
            </p>
          </div>
        ) : (
          <>
            {pinned.length > 0 && (
              <div className="mb-3">
                <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider mb-1.5">
                  Pinned
                </p>
                {pinned.map((s) => (
                  <SessionRow key={s.id} session={s} />
                ))}
              </div>
            )}
            <div>
              {pinned.length > 0 && (
                <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider mb-1.5">
                  Recent
                </p>
              )}
              {recent.map((s) => (
                <SessionRow key={s.id} session={s} />
              ))}
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {selectedSession && (
          <SessionHistoryModal
            session={selectedSession}
            onClose={() => setSelectedSession(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
