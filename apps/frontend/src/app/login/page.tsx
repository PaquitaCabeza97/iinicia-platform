'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const loggedUser = await loginWithEmail(email, password);
      if (
        loggedUser.roles.includes('admin') ||
        loggedUser.roles.includes('superadmin')
      ) {
        router.push('/admin');
      } else {
        router.push('/mi-iinicia');
      }
    } catch (err: any) {
      setError(err.message || 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <img
            src="/logo-tese.png"
            alt="Escudo TESE"
            className="w-16 h-16 rounded-xl bg-white p-1 border border-slate-200 object-contain shadow-sm shrink-0"
          />
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-iinicia-primary">
              TESE
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 mt-0.5">
              Iniciar Sesión
            </h1>
          </div>
        </div>
        <p className="text-sm text-slate-600">
          Ingresa con tu correo registrado para acceder a tu panel del TESE.
        </p>

        {error && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="login-email"
              className="block text-sm font-semibold text-slate-700 mb-1"
            >
              Correo electrónico
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-iinicia-teal"
              placeholder="usuario@iinicia.edu.mx"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="login-password"
                className="block text-sm font-semibold text-slate-700"
              >
                Contraseña
              </label>
              <Link
                href="/recuperar-acceso"
                className="text-xs font-semibold text-iinicia-primary hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-iinicia-teal"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold bg-iinicia-primary text-white hover:bg-teal-900 transition disabled:opacity-50"
          >
            {loading ? 'Verificando sesión...' : 'Ingresar al Portal TESE'}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center text-sm text-slate-600">
          ¿Aún no tienes cuenta?{' '}
          <Link
            href="/registro"
            className="font-bold text-iinicia-primary hover:underline"
          >
            Regístrate como Aspirante
          </Link>
        </div>
      </div>
    </div>
  );
}
