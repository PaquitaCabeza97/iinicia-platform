import Link from 'next/link';
import React from 'react';
import { FALLBACK_PROGRAMS } from '../lib/api';

export default function HomePage() {
  return (
    <div>
      {/* Hero Institucional TESE */}
      <section className="relative bg-gradient-to-br from-iinicia-navy via-iinicia-primary to-slate-900 text-white py-20 lg:py-24 border-b border-teal-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/15 border border-teal-400/40 text-teal-200 text-xs font-semibold tracking-wide uppercase">
                Portal Institucional TESE · 9 Ingenierías + Campus Moodle
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                Bienvenido al Portal Digital del{' '}
                <span className="text-teal-300">TESE</span> integrado con{' '}
                <span className="text-teal-300">Moodle LMS</span>
              </h1>

              <p className="text-lg text-slate-200 leading-relaxed max-w-2xl">
                Explora nuestras <strong>9 Ingenierías de 9 semestres</strong>,
                regístrate como aspirante, recibe tu rol académico y accede al
                Campus Virtual Moodle únicamente a las asignaturas y espacios
                académicos que tengas autorizados.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/oferta-academica"
                  className="px-6 py-3.5 rounded-xl font-bold bg-iinicia-teal hover:bg-teal-400 text-slate-950 shadow-lg transition"
                >
                  Ver las 9 Ingenierías y Retículas
                </Link>
                <Link
                  href="/registro"
                  className="px-6 py-3.5 rounded-xl font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/25 transition"
                >
                  Registro de Aspirantes
                </Link>
                <Link
                  href="/mi-iinicia"
                  className="px-5 py-3.5 rounded-xl font-medium text-teal-200 hover:text-white underline underline-offset-4"
                >
                  Ir a Mi TESE / Campus →
                </Link>
              </div>
            </div>

            {/* Tarjeta de Arquitectura de Seguridad (Sección 4) */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900/80 backdrop-blur border border-teal-400/30 rounded-2xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
                    Plataforma Digital TESE
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Next.js + NestJS + Supabase + Moodle
                  </span>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                    <div className="font-bold text-white">
                      1. Portal Institucional TESE · React / Next.js
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      Catálogo de las 9 Ingenierías con planes de estudio de 9
                      semestres, admisiones, registro y paneles por rol.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                    <div className="font-bold text-teal-300">
                      2. Backend / API · NestJS (Capa de Seguridad)
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      Valida permisos del lado servidor, sincroniza identidades
                      sin duplicados y protege credenciales de Moodle y Supabase.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                      <div className="font-bold text-emerald-300">
                        3. Supabase Auth + RLS
                      </div>
                      <p className="text-xs text-slate-300 mt-1">
                        Identidad, perfiles, roles, carreras y bitácora de
                        auditoría (`audit_logs`).
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                      <div className="font-bold text-amber-300">
                        4. Moodle LMS
                      </div>
                      <p className="text-xs text-slate-300 mt-1">
                        Fuente de verdad académica: cursos, actividades,
                        calificaciones y finalización.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Las 9 Ingenierías del TESE (Sección 9.1) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-iinicia-primary">
              Oferta Educativa de Nivel Superior · TESE
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
              Nuestras 9 Carreras de Ingeniería (9 Semestres)
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Selecciona cualquier ingeniería para consultar su retícula
              completa del Semestre 1 al Semestre 9 (incluyendo Residencia
              Profesional).
            </p>
          </div>
          <Link
            href="/oferta-academica"
            className="text-sm font-bold text-iinicia-primary hover:text-teal-700 shrink-0"
          >
            Explorar planes de estudio completos →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {FALLBACK_PROGRAMS.map((program, index) => {
            const totalSubjects =
              program.semesters?.reduce(
                (acc, s) => acc + s.subjects.length,
                0,
              ) || 0;

            return (
              <article
                key={program.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-teal-50 text-iinicia-primary border border-teal-200">
                      Carrera #{index + 1} · {program.duration}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      {program.code}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {program.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    {program.summary}
                  </p>

                  {/* Vista previa de primeros semestres */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1 mb-4">
                    <div className="font-bold text-slate-800">
                      Plan de estudios: 9 Semestres ({totalSubjects} asignaturas)
                    </div>
                    <div className="truncate">
                      <strong>Sem. 1:</strong>{' '}
                      {program.semesters?.[0]?.subjects.slice(0, 3).join(', ')}...
                    </div>
                    <div className="truncate">
                      <strong>Sem. 9:</strong>{' '}
                      {program.semesters?.[8]?.subjects.join(', ')}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <Link
                    href={`/oferta-academica/${program.slug}`}
                    className="font-bold text-iinicia-primary hover:underline text-sm"
                  >
                    Ver los 9 semestres →
                  </Link>
                  <Link
                    href="/registro"
                    className="px-3 py-1.5 rounded-lg font-bold bg-iinicia-teal text-slate-950 hover:bg-teal-400 transition"
                  >
                    Inscribirme
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Cursos de Ejemplo Obligatorios en Moodle (Sección 8.1) */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
              Sección 8.1 · Validación de Integración LMS TESE
            </span>
            <h2 className="text-3xl font-extrabold mt-1">
              Cursos Activos en el Campus Virtual Moodle
            </h2>
            <p className="text-sm text-slate-300 mt-2">
              Ambos cursos cuentan con profesor de prueba asignado, estudiantes
              matriculados, unidades temáticas, recursos PDF/páginas, foros,
              tareas prácticas, cuestionarios, calificaciones y seguimiento de
              finalización. Visibles únicamente para usuarios autenticados con
              matrícula válida.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-2xl bg-slate-800/90 border border-slate-700 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-md text-xs font-mono font-bold bg-teal-500/20 text-teal-300">
                  Moodle Shortname: IINICIA-TI-101
                </span>
                <span className="text-xs text-slate-400">Course ID: 101</span>
              </div>
              <h3 className="text-xl font-bold">
                Curso 1. Introducción a las Tecnologías de la Información
              </h3>
              <ul className="text-sm text-slate-300 space-y-1.5">
                <li>✔ Profesor titular: Roberto Méndez (`editingteacher`)</li>
                <li>✔ Estudiantes matriculados: Ana Sofía García y Carlos Eduardo López</li>
                <li>✔ Contenido: Presentación, Recurso PDF/Página, Foro, Tarea, Cuestionario, Calificación y Finalización de actividad</li>
              </ul>
            </div>

            <div className="rounded-2xl bg-slate-800/90 border border-slate-700 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-md text-xs font-mono font-bold bg-teal-500/20 text-teal-300">
                  Moodle Shortname: IINICIA-REACT-202
                </span>
                <span className="text-xs text-slate-400">Course ID: 102</span>
              </div>
              <h3 className="text-xl font-bold">
                Curso 2. Desarrollo Web con React
              </h3>
              <ul className="text-sm text-slate-300 space-y-1.5">
                <li>✔ Profesor titular: Roberto Méndez (`editingteacher`)</li>
                <li>✔ Estudiantes matriculados: Ana Sofía García y Carlos Eduardo López</li>
                <li>✔ Contenido: Unidades temáticas, Recurso técnico, Actividad práctica, Foro, Evaluación, Calificación y Finalización de curso</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/login"
              className="px-5 py-3 rounded-xl font-bold bg-iinicia-teal text-slate-950 hover:bg-teal-400 transition text-sm"
            >
              Probar acceso como Profesor, Estudiante o Administrador →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
