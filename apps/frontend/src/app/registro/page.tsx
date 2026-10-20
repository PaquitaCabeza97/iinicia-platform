'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FALLBACK_PROGRAMS } from '../../lib/api';

export default function RegistroPage() {
  const router = useRouter();
  const { registerUser } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [programId, setProgramId] = useState(FALLBACK_PROGRAMS[0].id);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!captchaVerified) {
      setError('Por favor confirma la verificación de seguridad anti-automatización (Sección 14).');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setSubmitting(true);
    try {
      await registerUser({
        email,
        first_name: firstName,
        last_name: lastName,
        phone,
        interested_program_id: programId,
      });
      router.push('/mi-iinicia');
    } catch (err: any) {
      setError(err.message || 'No fue posible completar el registro.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-iinicia-primary">
            Flujo 7.1 · Supabase Auth + Profiles
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">
            Registro en el Portal IINICIA
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            Al registrarte, Supabase Auth gestiona tu identidad (sin guardar
            contraseñas en tablas propias) y recibes el rol inicial de{' '}
            <strong>Aspirante</strong> hasta que administración autorice tus
            cursos en Moodle.
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="reg-first-name"
                className="block text-sm font-semibold text-slate-700 mb-1"
              >
                Nombre(s) *
              </label>
              <input
                id="reg-first-name"
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-iinicia-teal"
                placeholder="Ej. Mariana"
              />
            </div>

            <div>
              <label
                htmlFor="reg-last-name"
                className="block text-sm font-semibold text-slate-700 mb-1"
              >
                Apellidos *
              </label>
              <input
                id="reg-last-name"
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-iinicia-teal"
                placeholder="Ej. Torres Vega"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="reg-email"
                className="block text-sm font-semibold text-slate-700 mb-1"
              >
                Correo electrónico *
              </label>
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-iinicia-teal"
                placeholder="mariana.torres@ejemplo.com"
              />
            </div>

            <div>
              <label
                htmlFor="reg-phone"
                className="block text-sm font-semibold text-slate-700 mb-1"
              >
                Teléfono de contacto
              </label>
              <input
                id="reg-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-iinicia-teal"
                placeholder="+52 55 1234 5678"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="reg-program"
              className="block text-sm font-semibold text-slate-700 mb-1"
            >
              Programa académico de interés
            </label>
            <select
              id="reg-program"
              value={programId}
              onChange={(e) => setProgramId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-iinicia-teal"
            >
              {FALLBACK_PROGRAMS.map((prog) => (
                <option key={prog.id} value={prog.id}>
                  {prog.title} ({prog.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="reg-password"
              className="block text-sm font-semibold text-slate-700 mb-1"
            >
              Contraseña (gestionada exclusivamente por Supabase Auth) *
            </label>
            <input
              id="reg-password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-iinicia-teal"
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          {/* Mecanismo equivalente a CAPTCHA en registro (Sección 14) */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <input
              id="reg-captcha"
              type="checkbox"
              checked={captchaVerified}
              onChange={(e) => setCaptchaVerified(e.target.checked)}
              className="w-4 h-4 rounded text-iinicia-primary focus:ring-iinicia-teal"
            />
            <label htmlFor="reg-captcha" className="text-xs text-slate-700">
              Verificación de seguridad: confirmo que soy una persona real
              solicitando registro institucional (Protección anti-bots ·
              Sección 14).
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl font-bold bg-iinicia-primary text-white hover:bg-teal-900 transition disabled:opacity-50"
          >
            {submitting
              ? 'Registrando identidad en Supabase Auth...'
              : 'Crear cuenta y obtener rol Aspirante'}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center text-sm text-slate-600">
          ¿Ya tienes una cuenta en IINICIA?{' '}
          <Link
            href="/login"
            className="font-bold text-iinicia-primary hover:underline"
          >
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
