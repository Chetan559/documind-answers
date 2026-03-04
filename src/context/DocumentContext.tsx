import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Document } from '@/api/documents';

interface State {
  documents: Document[];
  activeDocId: string | null;
  sidebarOpen: boolean;
}

type Action =
  | { type: 'SET_DOCUMENTS'; payload: Document[] }
  | { type: 'ADD_DOCUMENT'; payload: Document }
  | { type: 'REMOVE_DOCUMENT'; payload: string }
  | { type: 'SET_ACTIVE_DOC'; payload: string | null }
  | { type: 'TOGGLE_SIDEBAR' };

const initialState: State = {
  documents: [],
  activeDocId: null,
  sidebarOpen: true,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_DOCUMENTS': return { ...state, documents: action.payload };
    case 'ADD_DOCUMENT': return { ...state, documents: [...state.documents, action.payload] };
    case 'REMOVE_DOCUMENT': return { ...state, documents: state.documents.filter(d => d.id !== action.payload) };
    case 'SET_ACTIVE_DOC': return { ...state, activeDocId: action.payload };
    case 'TOGGLE_SIDEBAR': return { ...state, sidebarOpen: !state.sidebarOpen };
    default: return state;
  }
}

const DocumentContext = createContext<{ state: State; dispatch: React.Dispatch<Action> } | null>(null);

export const DocumentProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    documents: [
      { id: '1', name: 'Research-Paper-2024.pdf', size: 2400000, uploadedAt: new Date('2025-01-15'), pageCount: 42 },
      { id: '2', name: 'Quarterly-Report-Q4.pdf', size: 1800000, uploadedAt: new Date('2025-02-01'), pageCount: 28 },
      { id: '3', name: 'Machine-Learning-Textbook.pdf', size: 5200000, uploadedAt: new Date('2025-02-10'), pageCount: 156 },
    ],
  });
  return <DocumentContext.Provider value={{ state, dispatch }}>{children}</DocumentContext.Provider>;
};

export const useDocuments = () => {
  const ctx = useContext(DocumentContext);
  if (!ctx) throw new Error('useDocuments must be used within DocumentProvider');
  return ctx;
};
