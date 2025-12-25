import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'Admin' | 'CISO' | 'Analyst';

interface User {
  email: string;
  name: string;
  role: UserRole;
  isAuthenticated: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (userData: { name: string; email: string; role: UserRole }) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedName = localStorage.getItem('name');
    const savedEmail = localStorage.getItem('email');
    const savedRole = localStorage.getItem('role');

    if (token && savedName && savedEmail && savedRole) {
      setUser({
        name: savedName,
        email: savedEmail,
        role: savedRole as UserRole,
        isAuthenticated: true,
      });
    }

    setIsLoading(false);
  }, []);

  const login = (userData: { name: string; email: string; role: UserRole }) => {
    const authenticatedUser: User = {
      name: userData.name,
      email: userData.email,
      role: userData.role,
      isAuthenticated: true,
    };

    setUser(authenticatedUser);

    // Save individually (compatible with LoginPage)
    localStorage.setItem('token', localStorage.getItem('token') || 'saved');
    localStorage.setItem('name', userData.name);
    localStorage.setItem('email', userData.email);
    localStorage.setItem('role', userData.role);
  };

  const logout = () => {
    setUser(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}