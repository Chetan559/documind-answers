import { useEffect, useRef } from 'react';
import { getDocumentStatus } from '@/api/documents';
import { useAppStore } from '@/store/useAppStore';

export function useDocumentPolling(docId: string | null) {
  const updateDocument = useAppStore((s) => s.updateDocument);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!docId) return;

    const poll = async () => {
      try {
        const status = await getDocumentStatus(docId);
        updateDocument({
          id: docId,
          status: status.status,
          pageCount: status.total_pages,
          name: status.name,
        });
        if (status.status === 'ready' || status.status === 'failed') {
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      } catch {
        // ignore polling errors
      }
    };

    poll();
    intervalRef.current = setInterval(poll, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [docId, updateDocument]);
}
