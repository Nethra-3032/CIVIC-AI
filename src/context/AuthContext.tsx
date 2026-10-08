import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Profile } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  token: string | null;
  isLoading: boolean;
  login: (identifier: string, pass: string) => Promise<void>;
  register: (name: string, email?: string, phone?: string, pass?: string) => Promise<void>;
  loginAsPriya: () => Promise<void>;
  loginAsAdmin: () => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('civic_token') || 'demo_token_priya');
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    try {
      const p = await api.getProfile();
      setProfile(p);
      if (!user) {
        setUser({
          id: p.user_id,
          name: p.name,
          email: p.email,
          phone: p.phone,
          role: p.user_id === 'usr_admin_001' ? 'ADMIN' : 'CITIZEN'
        });
      }
    } catch (e) {
      console.warn("Could not load profile", e);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        await refreshProfile();
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [token]);

  const login = async (identifier: string, pass: string) => {
    const res = await api.login(identifier, pass);
    localStorage.setItem('civic_token', res.token);
    setToken(res.token);
    setUser(res.user);
    await refreshProfile();
  };

  const register = async (name: string, email?: string, phone?: string, pass: string = 'demo123') => {
    const res = await api.register({ name, email, phone, password: pass });
    localStorage.setItem('civic_token', res.token);
    setToken(res.token);
    setUser(res.user);
    await refreshProfile();
  };

  const loginAsPriya = async () => {
    localStorage.setItem('civic_token', 'demo_token_priya');
    setToken('demo_token_priya');
    setUser({
      id: 'usr_priya_001',
      name: 'Priya Kumar',
      email: 'priya.kumar@example.com',
      phone: '+919876543210',
      role: 'CITIZEN'
    });
    await refreshProfile();
  };

  const loginAsAdmin = async () => {
    localStorage.setItem('civic_token', 'demo_token_admin');
    setToken('demo_token_admin');
    setUser({
      id: 'usr_admin_001',
      name: 'S. Meenakshi (Admin Officer)',
      email: 'admin@civic.gov.in',
      phone: '+919123456789',
      role: 'ADMIN'
    });
    await refreshProfile();
  };

  const logout = () => {
    localStorage.removeItem('civic_token');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      token,
      isLoading,
      login,
      register,
      loginAsPriya,
      loginAsAdmin,
      logout,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
