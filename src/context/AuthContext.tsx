import { createContext, useContext, type ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { isSession } from '../services/guards';
import type { Session } from '../types/models';

interface AuthValue {
  user: Session | null;
  login: (username: string, password: string) => string;
  logout: () => boolean;
  error: string;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { value: user, save, error } = useLocalStorage<Session | null>('miniblog.session', null, isSession);
  const login = (username: string, password: string) => {
    if (username.trim() !== 'admin' || password !== '123456') return 'Tên đăng nhập hoặc mật khẩu không đúng.';
    return save({ username: 'admin' }) ? '' : 'Không lưu được phiên đăng nhập. Hãy kiểm tra quyền lưu trữ.';
  };
  return <AuthContext.Provider value={{ user, login, logout: () => save(null), error }}>
    {children}
  </AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('AuthProvider chưa được khởi tạo.');
  return context;
}
