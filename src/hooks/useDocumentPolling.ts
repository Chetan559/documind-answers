import { useEffect, useRef } from 'react';
import { getDocumentStatus } from '@/api/documents';
import { useDocuments } from '@/context/DocumentContext';

export function useDocumentPolling(docId: string | null) {
  const { dispatch } = useDocuments();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!docId) return;

    const poll = async () => {
      try {
        const status = await getDocumentStatus(docId);
        dispatch({
          type: 'UPDATE_DOCUMENT',
          payload: {
            id: docId,
            status: status.status,
            total_pages: status.total_pages,
            name: status.name,
          },
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
  }, [docId, dispatch]);
}
