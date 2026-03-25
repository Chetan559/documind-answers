import { BASE_BACKEND_URL } from '@/config';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export const loginWithGoogle = async (credential: string): Promise<AuthResponse> => {
  const res = await fetch(`${BASE_BACKEND_URL}/api/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `Login failed: ${res.status}`);
  }

  return res.json();
};

export const getMe = async (token: string): Promise<AuthUser> => {
  const res = await fetch(`${BASE_BACKEND_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error(`Auth check failed: ${res.status}`);
  return res.json();
};
