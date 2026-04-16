import { authFetch, apiUrl } from '@/lib/authFetch';

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

export interface UploadOptions {
  /** Maximum number of chunks to index (server will slice the rest). */
  chunkLimit?: number;
  /** Which end to keep when chunks exceed the limit. */
  chunkMode?: 'first' | 'last';
}

export const uploadDocument = async (file: File, opts?: UploadOptions): Promise<Document> => {
  const formData = new FormData();
  formData.append('file', file);

  if (opts?.chunkLimit !== undefined) {
    formData.append('chunk_limit', String(opts.chunkLimit));
  }
  if (opts?.chunkMode) {
    formData.append('chunk_mode', opts.chunkMode);
  }

  const res = await authFetch(apiUrl('/api/documents/upload'), {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return res.json();
};

export const getDocumentStatus = async (pdfId: string): Promise<DocumentStatus> => {
  const res = await authFetch(apiUrl(`/api/documents/${pdfId}/status`));
  if (!res.ok) throw new Error(`Status check failed: ${res.status}`);
  return res.json();
};

export const listDocuments = async (): Promise<Document[]> => {
  const res = await authFetch(apiUrl('/api/documents/'));
  if (!res.ok) throw new Error(`List failed: ${res.status}`);
  const data = await res.json();
  return data.pdfs;
};

export const deleteDocument = async (id: string): Promise<void> => {
  const res = await authFetch(apiUrl(`/api/documents/${id}`), { method: 'DELETE' });
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
};

export const getDocumentFileUrl = (pdfId: string): string => {
  return apiUrl(`/api/documents/${pdfId}/file`);
};
