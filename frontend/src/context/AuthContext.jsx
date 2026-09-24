import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AuthApi, getToken, setToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(getToken() ? 'loading' : 'unauthenticated');

  const refresh = useCallback(async () => {
    if (!getToken()) { setUser(null); setStatus('unauthenticated'); return null; }
    try {
      const res = await AuthApi.me();
      setUser(res.user);
      setStatus('authenticated');
      return res.user;
    } catch {
      setToken(null);
      setUser(null);
      setStatus('unauthenticated');
      return null;
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = useCallback(async (payload) => {
    const res = await AuthApi.login(payload);
    setToken(res.token);
    setUser(res.user);
    setStatus('authenticated');
    return res.user;
  }, []);

  const register = useCallback(async (payload) => {
    const res = await AuthApi.register(payload);
    setToken(res.token);
    setUser(res.user);
    setStatus('authenticated');
    return res.user;
  }, []);

  const logout = useCallback(async () => {
    try { await AuthApi.logout(); } catch { /* ignore */ }
    setToken(null);
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: status === 'authenticated',
      hasSubscription: !!user?.subscription,
      login,
      register,
      logout,
      refresh,
      setUser,
    }),
    [user, status, login, register, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
