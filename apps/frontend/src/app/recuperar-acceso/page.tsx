'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { apiRequest } from '../../lib/api';

export default function RecuperarAccesoPage() {
  const [email, setEmail] = useState('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatusMsg(null);
    setLoading(true);
    try {
      const res = await apiRequest<{ message: string }>('/auth/recover', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setStatusMsg(res.message);
    } catch (err: any) {
      setError(err.message || 'No fue posible procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-16">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-iinicia-primary">
            Supabase Auth · Sección 5 y 9.1 (CA-03)
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Recuperación de Acceso
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            Ingresa tu correo registrado para recibir un enlace seguro de
            restablecimiento de contraseña gestionado por Supabase Auth.
          </p>
        </div>

        {statusMsg && (
          <div
            role="status"
            className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium"
          >
            ✔ {statusMsg}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="recover-email"
              className="block text-sm font-semibold text-slate-700 mb-1"
            >
              Correo electrónico registrado
            </label>
            <input
              id="recover-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-iinicia-teal"
              placeholder="correo@iinicia.edu.mx"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold bg-iinicia-primary text-white hover:bg-teal-900 transition disabled:opacity-50"
          >
            {loading ? 'Enviando enlace...' : 'Enviar enlace de recuperación'}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center text-sm">
          <Link
            href="/login"
            className="font-semibold text-iinicia-primary hover:underline"
          >
            ← Volver a Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
