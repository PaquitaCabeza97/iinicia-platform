import Link from 'next/link';
import { notFound } from 'next/navigation';
import React from 'react';
import { FALLBACK_PROGRAMS } from '../../../lib/api';

export default function ProgramDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const program = FALLBACK_PROGRAMS.find((p) => p.slug === params.slug);
  if (!program) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
      <div>
        <Link
          href="/oferta-academica"
          className="text-sm font-semibold text-iinicia-primary hover:underline"
        >
          ← Volver a las 9 Ingenierías del TESE
        </Link>
      </div>

      <header className="bg-gradient-to-r from-iinicia-navy to-iinicia-primary text-white rounded-2xl p-8 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-teal-400/20 text-teal-200 border border-teal-400/30">
            TESE · Nivel Ingeniería
          </span>
          <span className="text-xs font-mono text-slate-300">
            Clave: {program.code}
          </span>
          <span className="text-xs text-slate-300">
            Modalidad: {program.modality}
          </span>
          <span className="text-xs text-slate-300">
            Duración: {program.duration}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold">{program.title}</h1>
        <p className="text-teal-200 font-medium">{program.summary}</p>
        <p className="text-slate-200 leading-relaxed max-w-4xl">
          {program.description}
        </p>

        <div className="pt-2 flex flex-wrap gap-4">
          <Link
            href="/registro"
            className="px-6 py-3 rounded-xl font-bold bg-iinicia-teal text-slate-950 hover:bg-teal-400 transition"
          >
            Solicitar Admisión a {program.title}
          </Link>
          <Link
            href="/admisiones"
            className="px-5 py-3 rounded-xl font-semibold border border-white/25 hover:bg-white/10 transition"
          >
            Ver requisitos de admisión
          </Link>
        </div>
      </header>

      {/* Mapa Curricular Completo: Semestre 1 al Semestre 9 */}
      <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-iinicia-primary">
              Plan de Estudios Oficial TESE
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
              Retícula por Semestre (Semestre 1 a Semestre 9)
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            9 Semestres · Incluye Especialidad y Residencia Profesional
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {program.semesters?.map((sem) => (
            <div
              key={sem.semester}
              className="rounded-xl bg-slate-50 border border-slate-200 p-5 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                  <span className="px-2.5 py-1 rounded-md text-xs font-extrabold uppercase bg-iinicia-navy text-teal-200">
                    {sem.title}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {sem.subjects.length}{' '}
                    {sem.subjects.length === 1 ? 'asignatura' : 'asignaturas'}
                  </span>
                </div>

                <ul className="space-y-2 text-sm text-slate-700">
                  {sem.subjects.map((subject) => (
                    <li
                      key={subject}
                      className="flex items-start gap-2 leading-snug"
                    >
                      <span className="text-iinicia-teal font-bold mt-0.5">
                        •
                      </span>
                      <span>{subject}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Vinculación con Campus Virtual Moodle */}
      <section className="bg-slate-900 text-white rounded-2xl p-8 space-y-4">
        <h2 className="text-xl font-bold text-teal-300">
          Integración con el Campus Virtual Moodle del TESE
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
          Una vez que completas tu registro como Aspirante y el área de
          Administración valida tu ingreso como Estudiante de{' '}
          <strong>{program.title}</strong>, el sistema sincroniza tu identidad
          con Moodle (`moodle_user_id`) y habilita el acceso a tus aulas
          virtuales desde tu panel personalizado.
        </p>
      </section>
    </div>
  );
}
