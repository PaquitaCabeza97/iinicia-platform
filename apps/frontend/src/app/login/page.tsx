'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const DEMO_ACCOUNTS = [
  {
    role: 'Administrador',
    email: 'admin@iinicia.edu.mx',
    desc: 'Gestiona usuarios, roles, estados, programas, matrículas Moodle y bitácora audit_logs.',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
  },
  {
    role: 'Profesor (Teacher Moodle)',
    email: 'profesor@iinicia.edu.mx',
    desc: 'Titular docente en Curso 1 (TI-101) y Curso 2 (WEB-202) con permisos de Teacher.',
    badgeClass: 'bg-indigo-100 text-indigo-900 border-indigo-300',
  },
  {
    role: 'Estudiante 1 (Student Moodle)',
    email: 'estudiante1@iinicia.edu.mx',
    desc: 'Ana Sofía García · Matriculada en Curso 1 y Curso 2 con permisos de Student.',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  },
  {
    role: 'Estudiante 2 (Student Moodle)',
    email: 'estudiante2@iinicia.edu.mx',
    desc: 'Carlos Eduardo López · Segundo estudiante requerido por CA-09 para validar los dos cursos.',
    badgeClass: 'bg-teal-100 text-teal-900 border-teal-300',
  },
  {
    role: 'Aspirante (Sin acceso a cursos)',
    email: 'aspirante@iinicia.edu.mx',
    desc: 'Lucía Fernández · Rol inicial tras registro; sin acceso a cursos hasta autorización.',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
  },
];

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

  const quickLogin = async (demoEmail: string) => {
    setError(null);
    setLoading(true);
    try {
      const loggedUser = await loginWithEmail(demoEmail, 'Demo2026!');
      if (
        loggedUser.roles.includes('admin') ||
        loggedUser.roles.includes('superadmin')
      ) {
        router.push('/admin');
      } else {
        router.push('/mi-iinicia');
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión de prueba.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Formulario Principal */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-iinicia-primary">
              Identidad Unificada · Supabase Auth (CA-03)
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 mt-1">
              Iniciar Sesión
            </h1>
            <p className="text-sm text-slate-600 mt-2">
              Ingresa con tu correo registrado para acceder a Mi IINICIA y al
              Campus Virtual Moodle según tu rol autorizado.
            </p>
          </div>

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
              {loading ? 'Verificando sesión...' : 'Ingresar a Mi IINICIA'}
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

        {/* Panel de Validación Rápida de Roles (Criterios CA-05, CA-09, CA-12, CA-13) */}
        <div className="lg:col-span-6 bg-slate-900 text-white rounded-2xl p-8 shadow-lg space-y-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
              Criterios de Aceptación CA-05 y CA-09 · Sección 16
            </span>
            <h2 className="text-2xl font-bold mt-1">
              Acceso Rápido de Validación por Rol
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Selecciona cualquiera de los perfiles de prueba preconfigurados
              para comprobar permisos diferenciados entre Administrador,
              Profesor, Estudiantes y Aspirante:
            </p>
          </div>

          <div className="space-y-3">
            {DEMO_ACCOUNTS.map((acc) => (
              <div
                key={acc.email}
                className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${acc.badgeClass}`}
                    >
                      {acc.role}
                    </span>
                    <span className="text-xs font-mono text-teal-200">
                      {acc.email}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{acc.desc}</p>
                </div>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => quickLogin(acc.email)}
                  className="px-3.5 py-2 rounded-lg text-xs font-bold bg-iinicia-teal text-slate-950 hover:bg-teal-400 transition shrink-0"
                >
                  Entrar →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
