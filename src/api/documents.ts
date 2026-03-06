import { BASE_BACKEND_URL } from '@/config';

export interface Document {
  id: string;
  name: string;
  status: 'queued' | 'processing' | 'ready' | 'failed';
  file_size: number;
  total_pages?: number;
  created_at?: string;
}

export interface DocumentStatus {
  id: string;
  name: string;
  status: 'queued' | 'processing' | 'ready' | 'failed';
  progress: number;
  message: string;
  pdf_id: string;
  total_pages: number;
}

export const uploadDocument = async (file: File): Promise<Document> => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${BASE_BACKEND_URL}/api/documents/upload?user_id=default_user`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return res.json();
};

export const getDocumentStatus = async (pdfId: string): Promise<DocumentStatus> => {
  const res = await fetch(`${BASE_BACKEND_URL}/api/documents/${pdfId}/status`);
  if (!res.ok) throw new Error(`Status check failed: ${res.status}`);
  return res.json();
};

export const listDocuments = async (): Promise<Document[]> => {
  const res = await fetch(`${BASE_BACKEND_URL}/api/documents/?user_id=default_user`);
  if (!res.ok) throw new Error(`List failed: ${res.status}`);
  const data = await res.json();
  return data.pdfs;
};

export const deleteDocument = async (id: string): Promise<void> => {
  const res = await fetch(`${BASE_BACKEND_URL}/api/documents/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
};

export const getDocumentFileUrl = (pdfId: string): string => {
  return `${BASE_BACKEND_URL}/api/documents/${pdfId}/file`;
};
