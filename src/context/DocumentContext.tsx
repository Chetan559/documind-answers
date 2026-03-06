import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Document, listDocuments } from '@/api/documents';

interface State {
  documents: Document[];
  activeDocId: string | null;
  sidebarOpen: boolean;
  loading: boolean;
}

type Action =
  | { type: 'SET_DOCUMENTS'; payload: Document[] }
  | { type: 'ADD_DOCUMENT'; payload: Document }
  | { type: 'UPDATE_DOCUMENT'; payload: Partial<Document> & { id: string } }
  | { type: 'REMOVE_DOCUMENT'; payload: string }
  | { type: 'SET_ACTIVE_DOC'; payload: string | null }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: State = {
  documents: [],
  activeDocId: null,
  sidebarOpen: true,
  loading: false,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_DOCUMENTS': return { ...state, documents: action.payload, loading: false };
    case 'ADD_DOCUMENT': return { ...state, documents: [...state.documents, action.payload] };
    case 'UPDATE_DOCUMENT': return {
      ...state,
      documents: state.documents.map(d => d.id === action.payload.id ? { ...d, ...action.payload } : d),
    };
    case 'REMOVE_DOCUMENT': return { ...state, documents: state.documents.filter(d => d.id !== action.payload) };
    case 'SET_ACTIVE_DOC': return { ...state, activeDocId: action.payload };
    case 'TOGGLE_SIDEBAR': return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'SET_LOADING': return { ...state, loading: action.payload };
    default: return state;
  }
}

const DocumentContext = createContext<{ state: State; dispatch: React.Dispatch<Action> } | null>(null);

export const DocumentProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: true });
    listDocuments()
      .then(docs => dispatch({ type: 'SET_DOCUMENTS', payload: docs }))
      .catch(() => dispatch({ type: 'SET_LOADING', payload: false }));
  }, []);

  return <DocumentContext.Provider value={{ state, dispatch }}>{children}</DocumentContext.Provider>;
};

export const useDocuments = () => {
  const ctx = useContext(DocumentContext);
  if (!ctx) throw new Error('useDocuments must be used within DocumentProvider');
  return ctx;
};
