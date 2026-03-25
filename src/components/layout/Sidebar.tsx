import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Clock, Plus, Menu, X, LogOut } from 'lucide-react';
import { UploadTab } from './sidebar/UploadTab';
import { DocumentsTab } from './sidebar/DocumentsTab';
import { HistoryTab } from './sidebar/HistoryTab';
import { useAppStore } from '@/store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';

type Tab = 'upload' | 'documents' | 'history';

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState<Tab>('documents');
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { createSession, user, logout } = useAppStore();

  const tabs: { id: Tab; icon: typeof Upload; label: string }[] = [
    { id: 'upload', icon: Upload, label: 'Upload' },
    { id: 'documents', icon: FileText, label: 'Docs' },
    { id: 'history', icon: Clock, label: 'History' },
  ];

  const handleNewChat = () => {
    createSession([]);
    navigate('/chat');
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const content = (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
            <span className="text-[10px] font-display text-primary-foreground">D</span>
          </div>
          <span className="font-display text-sm text-foreground">DocuMind</span>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-sidebar-border">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex flex-col items-center gap-1 py-2.5 relative transition-colors"
            >
              <Icon
                className={`w-4 h-4 ${
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                }`}
              />
              <span
                className={`text-[9px] font-body ${
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="sidebar-tab-indicator"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-foreground rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'upload' && <UploadTab />}
            {activeTab === 'documents' && <DocumentsTab />}
            {activeTab === 'history' && <HistoryTab />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom actions */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-body font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New Chat
        </button>

        {/* User profile */}
        {user && (
          <div className="flex items-center gap-2 px-1 pt-1">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name || 'User'}
                className="w-7 h-7 rounded-full border border-sidebar-border"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium">
                {(user.name || user.email || '?')[0].toUpperCase()}
              </div>
            )}
            <span className="text-xs font-body text-muted-foreground truncate flex-1">
              {user.name || user.email}
            </span>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
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
        {mobileOpen ? (
          <X className="w-4 h-4" />
        ) : (
          <Menu className="w-4 h-4" />
        )}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:relative z-40 w-[280px] h-screen shrink-0 transition-transform lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {content}
      </aside>
    </>
  );
};

export default Sidebar;
