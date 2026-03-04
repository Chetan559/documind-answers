export interface Document {
  id: string;
  name: string;
  size: number;
  uploadedAt: Date;
  pageCount: number;
}

export interface Folder {
  id: string;
  name: string;
  documents: Document[];
}

const mockDocuments: Document[] = [
  { id: '1', name: 'Research-Paper-2024.pdf', size: 2400000, uploadedAt: new Date('2025-01-15'), pageCount: 42 },
  { id: '2', name: 'Quarterly-Report-Q4.pdf', size: 1800000, uploadedAt: new Date('2025-02-01'), pageCount: 28 },
  { id: '3', name: 'Machine-Learning-Textbook.pdf', size: 5200000, uploadedAt: new Date('2025-02-10'), pageCount: 156 },
];

export const uploadDocument = async (file: File): Promise<Document> => {
  await new Promise(r => setTimeout(r, 1500));
  return {
    id: Math.random().toString(36).slice(2),
    name: file.name,
    size: file.size,
    uploadedAt: new Date(),
    pageCount: Math.floor(Math.random() * 50) + 5,
  };
};

export const listDocuments = async (): Promise<Document[]> => {
  await new Promise(r => setTimeout(r, 300));
  return [...mockDocuments];
};

export const deleteDocument = async (id: string): Promise<void> => {
  await new Promise(r => setTimeout(r, 500));
};
