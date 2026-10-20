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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
      <div>
        <Link
          href="/oferta-academica"
          className="text-sm font-semibold text-iinicia-primary hover:underline"
        >
          ← Volver a Oferta Académica
        </Link>
      </div>

      <header className="bg-gradient-to-r from-iinicia-navy to-iinicia-primary text-white rounded-2xl p-8 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-teal-400/20 text-teal-200 border border-teal-400/30">
            {program.type}
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
        <p className="text-slate-200 leading-relaxed">{program.description}</p>

        <div className="pt-2 flex flex-wrap gap-4">
          <Link
            href="/registro"
            className="px-6 py-3 rounded-xl font-bold bg-iinicia-teal text-slate-950 hover:bg-teal-400 transition"
          >
            Solicitar Admisión a este Programa
          </Link>
          <Link
            href="/admisiones"
            className="px-5 py-3 rounded-xl font-semibold border border-white/25 hover:bg-white/10 transition"
          >
            Ver requisitos de admisión
          </Link>
        </div>
      </header>

      <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
        <h2 className="text-2xl font-bold text-slate-900">
          Cursos Integrados en el Campus Moodle
        </h2>
        <p className="text-sm text-slate-600">
          Una vez autorizado tu ingreso como Estudiante, el sistema sincronizará
          tu identidad con Moodle y generará tu matrícula en las asignaturas
          correspondientes.
        </p>

        {program.courses && program.courses.length > 0 ? (
          <div className="space-y-4">
            {program.courses.map((course) => (
              <div
                key={course.course_code}
                className="p-5 rounded-xl bg-slate-50 border border-slate-200"
              >
                <div className="text-xs font-mono font-bold text-iinicia-primary">
                  Código: {course.course_code}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {course.course_name}
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  {course.description}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Las asignaturas de esta certificación se habilitan al iniciar el
            periodo lectivo en el Campus Moodle.
          </p>
        )}
      </section>
    </div>
  );
}
