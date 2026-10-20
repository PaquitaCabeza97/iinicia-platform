'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';

export type RoleCode =
  | 'superadmin'
  | 'admin'
  | 'coordinador'
  | 'profesor'
  | 'estudiante'
  | 'aspirante'
  | 'soporte';

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  status: 'pendiente' | 'activo' | 'suspendido' | 'inactivo';
  moodle_user_id: number | null;
  moodle_sync_status: string;
  moodle_last_sync_at: string | null;
  created_at: string;
}

export interface AuthUser {
  profile: UserProfile;
  roles: RoleCode[];
  primaryRole: RoleCode;
}

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  loading: boolean;
  loginWithEmail: (email: string, password?: string) => Promise<AuthUser>;
  registerUser: (payload: {
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    interested_program_id?: string;
  }) => Promise<AuthUser>;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_TOKEN_KEY = 'iinicia_portal_access_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken =
      typeof window !== 'undefined'
        ? window.localStorage.getItem(STORAGE_TOKEN_KEY)
        : null;

    if (!savedToken) {
      setLoading(false);
      return;
    }

    setAccessToken(savedToken);
    apiRequest<{ user: AuthUser }>('/auth/me', {}, savedToken)
      .then((res) => {
        setUser(res.user);
      })
      .catch(() => {
        window.localStorage.removeItem(STORAGE_TOKEN_KEY);
        setAccessToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const loginWithEmail = async (email: string, password?: string) => {
    const res = await apiRequest<{ accessToken: string; user: AuthUser }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      },
    );
    window.localStorage.setItem(STORAGE_TOKEN_KEY, res.accessToken);
    setAccessToken(res.accessToken);
    setUser(res.user);
    return res.user;
  };

  const registerUser = async (payload: {
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    interested_program_id?: string;
  }) => {
    const res = await apiRequest<{ accessToken: string; user: AuthUser }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );
    window.localStorage.setItem(STORAGE_TOKEN_KEY, res.accessToken);
    setAccessToken(res.accessToken);
    setUser(res.user);
    return res.user;
  };

  const refreshUser = async () => {
    if (!accessToken) return;
    const res = await apiRequest<{ user: AuthUser }>('/auth/me', {}, accessToken);
    setUser(res.user);
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_TOKEN_KEY);
    }
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        loginWithEmail,
        registerUser,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe utilizarse dentro de un AuthProvider');
  }
  return ctx;
}
