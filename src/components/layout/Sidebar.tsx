import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Upload, MessageSquare, Search, FileText, Folder, ChevronRight, MoreVertical, Share2, Menu, X, BookOpen } from 'lucide-react';
import { useDocuments } from '@/context/DocumentContext';

interface SidebarProps {
  onUploadClick?: () => void;
}

const Sidebar = ({ onUploadClick }: SidebarProps) => {
  const { state, dispatch } = useDocuments();
  const navigate = useNavigate();
  const location = useLocation();
  const [foldersOpen, setFoldersOpen] = useState(true);
  const [docsOpen, setDocsOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const filteredDocs = state.documents.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const content = (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      <div className="p-4 space-y-3">
        <button
          onClick={onUploadClick}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-border/40 rounded-lg text-sm text-foreground hover:bg-sidebar-accent transition-all active:scale-95 font-body"
          aria-label="Upload Documents"
        >
          <Upload className="w-4 h-4" /> Upload Documents
        </button>
        <button
          onClick={() => navigate('/chat/all')}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-all active:scale-95 font-body"
          aria-label="Chat with All Documents"
        >
          <MessageSquare className="w-4 h-4" /> Chat with All
        </button>
      </div>

      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search Documents"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-surface border border-sidebar-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring font-body"
            aria-label="Search documents"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        <button
          onClick={() => setFoldersOpen(!foldersOpen)}
          className="flex items-center gap-1.5 w-full px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-body"
        >
          <ChevronRight className={`w-3 h-3 transition-transform ${foldersOpen ? 'rotate-90' : ''}`} />
          <Folder className="w-3.5 h-3.5" /> Folders
        </button>

        <button
          onClick={() => setDocsOpen(!docsOpen)}
          className="flex items-center gap-1.5 w-full px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mt-1 font-body"
        >
          <ChevronRight className={`w-3 h-3 transition-transform ${docsOpen ? 'rotate-90' : ''}`} />
          <FileText className="w-3.5 h-3.5" /> Documents
        </button>

        {docsOpen && (
          <div className="ml-4 mt-1 space-y-0.5">
            {filteredDocs.map((doc) => {
              const isActive = state.activeDocId === doc.id || location.pathname.includes(doc.id);
              return (
                <button
                  key={doc.id}
                  onClick={() => {
                    dispatch({ type: 'SET_ACTIVE_DOC', payload: doc.id });
                    navigate(`/chat/${doc.id}`);
                    setMobileOpen(false);
                  }}
                  className={`flex items-center justify-between w-full px-2 py-1.5 rounded-md text-sm truncate transition-all font-body group ${
                    isActive ? 'bg-sidebar-accent text-accent-foreground border-l-2 border-primary' : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground hover:border-l-2 hover:border-primary/50'
                  }`}
                  aria-label={`Open ${doc.name}`}
                >
                  <span className="truncate text-xs">{doc.name}</span>
                  <span className="flex items-center gap-1 shrink-0">
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/quiz/${doc.id}`);
                        setMobileOpen(false);
                      }}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); navigate(`/quiz/${doc.id}`); setMobileOpen(false); } }}
                      className="p-0.5 opacity-0 group-hover:opacity-100 transition-opacity rounded hover:bg-primary/10"
                      aria-label={`Quiz ${doc.name}`}
                    >
                      <BookOpen className="w-3 h-3" />
                    </span>
                    <MoreVertical className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors font-body" aria-label="Share Your Chatbot">
          <Share2 className="w-3.5 h-3.5" /> Share Your Chatbot
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-surface rounded-md border border-sidebar-border"
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:relative z-40 w-[280px] h-screen shrink-0 transition-transform lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {content}
      </aside>
    </>
  );
};

export default Sidebar;
