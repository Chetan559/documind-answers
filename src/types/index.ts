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

// Annotation types
export interface AnnotationRect {
  x: number;      // percentage 0-100
  y: number;      // percentage 0-100
  width: number;  // percentage 0-100
  height: number; // percentage 0-100
}

export type AnnotationColor = 'yellow' | 'blue' | 'green' | 'red';

export interface Annotation {
  id: string;
  documentId: string;
  sessionId?: string;
  selectedText: string;
  note?: string;
  color: AnnotationColor;
  bounds: {
    page: number;
    rects: AnnotationRect[];
  };
  collectionIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AnnotationCollection {
  id: string;
  name: string;
  color: AnnotationColor;
  annotationIds: string[];
  createdAt: Date;
}

// Citation export types
export type CitationFormat = 'apa' | 'mla' | 'chicago' | 'bibtex';
export type DocumentType = 'article' | 'book' | 'report' | 'webpage' | 'other';

export interface DocumentMetadata {
  documentId: string;
  title: string;
  authors: string[];
  year?: number;
  publisher?: string;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url?: string;
  accessedAt?: Date;
  documentType: DocumentType;
}

export interface CitationEntry {
  documentId: string;
  documentName: string;
  metadata: DocumentMetadata | null;
  pageNumbers: number[];
  excerpts: string[];
}

export interface AppState {
  documents: PDFDocument[];
  folders: Folder[];
  sessions: ChatSession[];
  activeSessionId: string | null;
  activePDFViewerId: string | null;
  annotations: Annotation[];
  annotationCollections: AnnotationCollection[];
  activeAnnotationId: string | null;
  documentMetadata: Record<string, DocumentMetadata>;
}
