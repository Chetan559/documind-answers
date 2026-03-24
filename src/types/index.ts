export interface PDFDocument {
  id: string;
  name: string;
  uploadedAt: Date;
  size: number;
  pageCount: number;
  status: 'queued' | 'processing' | 'ready' | 'failed';
  folderId?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sourceDocs?: SourceCitation[];
  citations?: import('@/api/chat').Citation[];
  follow_up?: string | null;
  mode?: 'rag' | 'continuation' | null;
}

export interface SourceCitation {
  documentId: string;
  documentName: string;
  pageNumber: number;
  excerpt: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  documentIds: string[];
  messages: ChatMessage[];
  isPinned: boolean;
  previewText: string;
  backendSessionId?: string | null;
}

export interface Folder {
  id: string;
  name: string;
  documentIds: string[];
  createdAt: Date;
}

export interface AppState {
  documents: PDFDocument[];
  folders: Folder[];
  sessions: ChatSession[];
  activeSessionId: string | null;
  activePDFViewerId: string | null;
}
