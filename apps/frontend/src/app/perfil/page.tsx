'use client';

import Link from 'next/link';
import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function PerfilPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500">
        Cargando perfil del usuario...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">
          Debes iniciar sesión para ver tu perfil
        </h1>
        <Link
          href="/login"
          className="inline-block px-6 py-3 rounded-xl font-bold bg-iinicia-primary text-white"
        >
          Ir a Iniciar Sesión
        </Link>
      </div>
    );
  }

  const { profile, roles, primaryRole } = user;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-iinicia-primary">
            Tabla `public.profiles` · Sección 5.1 y 9.1
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">
            Mi Perfil Institucional
          </h1>
        </div>
        <Link
          href="/mi-iinicia"
          className="px-4 py-2 rounded-xl text-sm font-bold bg-iinicia-primary text-white hover:bg-teal-900 transition"
        >
          Ir a Mi IINICIA →
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div>
            <span className="text-xs font-bold uppercase text-slate-400 block">
              Nombre completo
            </span>
            <p className="text-base font-bold text-slate-900 mt-1">
              {profile.first_name} {profile.last_name}
            </p>
          </div>

          <div>
            <span className="text-xs font-bold uppercase text-slate-400 block">
              Correo electrónico (Supabase Auth)
            </span>
            <p className="text-base font-mono text-slate-800 mt-1">
              {profile.email}
            </p>
          </div>

          <div>
            <span className="text-xs font-bold uppercase text-slate-400 block">
              Teléfono
            </span>
            <p className="text-base text-slate-800 mt-1">
              {profile.phone || 'No especificado'}
            </p>
          </div>

          <div>
            <span className="text-xs font-bold uppercase text-slate-400 block">
              Estado de la cuenta
            </span>
            <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
              {profile.status}
            </span>
          </div>

          <div>
            <span className="text-xs font-bold uppercase text-slate-400 block">
              Roles asignados (RBAC)
            </span>
            <div className="flex flex-wrap gap-2 mt-1">
              {roles.map((r) => (
                <span
                  key={r}
                  className="px-3 py-1 rounded-md text-xs font-bold uppercase bg-teal-50 text-iinicia-primary border border-teal-200"
                >
                  {r}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-bold uppercase text-slate-400 block">
              Vínculo con Campus Moodle (`moodle_user_id`)
            </span>
            <p className="text-sm font-mono text-slate-800 mt-1">
              {profile.moodle_user_id
                ? `Moodle User ID #${profile.moodle_user_id} (${profile.moodle_sync_status})`
                : 'Sin vínculo Moodle (pendiente de autorización académica)'}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 text-xs text-slate-500">
          Rol principal activo: <strong>{primaryRole.toUpperCase()}</strong> ·
          Fecha de alta: {new Date(profile.created_at).toLocaleString('es-MX')}
        </div>
      </div>
    </div>
  );
}
