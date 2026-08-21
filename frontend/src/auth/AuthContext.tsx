import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { API_URL, apiFetch, setAccessToken, setUnauthorizedHandler } from '../lib/api';
import type { AppUser } from '../types';

type LoginResponse = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: AppUser;
};

type AuthContextValue = {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AppUser>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setAccessToken(null);
      setUser(null);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/refresh`, { method: 'POST', credentials: 'include' });
        if (response.ok && !cancelled) {
          const data: LoginResponse = await response.json();
          setAccessToken(data.accessToken);
          setUser(data.user);
        }
      } catch {
        // No active session, user must log in.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiFetch<LoginResponse>('/api/auth/login', { method: 'POST', body: { email, password } });
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    await apiFetch('/api/auth/change-password', { method: 'POST', body: { currentPassword, newPassword } });
    setUser((current) => (current ? { ...current, mustChangePassword: false } : current));
  }, []);

  const hasPermission = useCallback((permission: string) => user?.permissions.includes(permission) ?? false, [user]);
  const hasRole = useCallback((role: string) => user?.roles.includes(role) ?? false, [user]);

  const value = useMemo(
    () => ({ user, loading, login, logout, changePassword, hasPermission, hasRole }),
    [user, loading, login, logout, changePassword, hasPermission, hasRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit etre utilise a l intérieur de AuthProvider');
  return ctx;
}
