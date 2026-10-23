import Link from 'next/link';
import React from 'react';

export function Footer() {
  return (
    <footer className="bg-iinicia-navy text-slate-300 border-t border-slate-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img
                src="/logo-tese.png"
                alt="Escudo TESE"
                className="w-10 h-10 rounded-lg bg-white p-0.5 object-contain shadow-sm"
              />
              <span className="font-extrabold text-lg text-white">TESE</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Portal Institucional y Campus Virtual del Tecnológico de Estudios
              Superiores de Ecatepec (TESE): 9 Ingenierías con planes de 9
              semestres, integrado con React/Next.js, NestJS, Supabase y Moodle.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
              Secciones Institucionales
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/universidad" className="hover:text-teal-300 transition">
                  Universidad y Modelo Educativo
                </Link>
              </li>
              <li>
                <Link href="/oferta-academica" className="hover:text-teal-300 transition">
                  Oferta Académica
                </Link>
              </li>
              <li>
                <Link href="/admisiones" className="hover:text-teal-300 transition">
                  Proceso de Admisiones
                </Link>
              </li>
              <li>
                <Link href="/noticias" className="hover:text-teal-300 transition">
                  Noticias Institucionales
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
              Comunidad y Campus
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/registro" className="hover:text-teal-300 transition">
                  Registro de Aspirantes
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-teal-300 transition">
                  Acceso a Mi IINICIA
                </Link>
              </li>
              <li>
                <Link href="/recuperar-acceso" className="hover:text-teal-300 transition">
                  Recuperación de Acceso
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="hover:text-teal-300 transition">
                  Contacto y Soporte
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
              Arquitectura y Seguridad
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>• Sin dependencia de WordPress (CA-01)</li>
              <li>• React / Next.js + TypeScript (CA-02)</li>
              <li>• Supabase Auth + PostgreSQL + RLS (CA-03, CA-06)</li>
              <li>• NestJS API + Moodle Web Services (CA-14, CA-15)</li>
              <li>• Accesibilidad WCAG 2.2 AA (Sección 13)</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 TESE — Tecnológico de Estudios Superiores de Ecatepec. Todos los derechos reservados.</p>
          <p>Versión 1.0 · Arquitectura Next.js · NestJS · Supabase · Moodle</p>
        </div>
      </div>
    </footer>
  );
}
