import { useAppStore } from '@/store/useAppStore';
import { BASE_BACKEND_URL } from '@/config';

/**
 * Authenticated fetch wrapper that auto-injects the JWT Bearer token.
 * If the token is expired (401), it logs the user out.
 */
export const authFetch = async (
  input: string | URL | Request,
  init?: RequestInit,
): Promise<Response> => {
  const token = useAppStore.getState().accessToken;

  const headers = new Headers(init?.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(input, { ...init, headers });

  // Auto-logout on 401
  if (res.status === 401) {
    useAppStore.getState().logout();
  }

  return res;
};

/**
 * Shorthand for building full API URL
 */
export const apiUrl = (path: string) => `${BASE_BACKEND_URL}${path}`;
