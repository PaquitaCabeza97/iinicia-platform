'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { apiRequest, FALLBACK_PROGRAMS, ProgramItem } from '../../lib/api';

export default function OfertaAcademicaPage() {
  const [programs, setPrograms] = useState<ProgramItem[]>(FALLBACK_PROGRAMS);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<{ programs: ProgramItem[] }>('/public/programs')
      .then((res) => {
        if (res.programs?.length > 0) {
          setPrograms(res.programs);
        }
      })
      .catch(() => {
        // Mantiene catálogo de respaldo con las 9 Ingenierías de TESE
      });
  }, []);

  const filtered = programs.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchTitle =
      p.title.toLowerCase().includes(q) ||
      p.summary.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q);
    const matchSubjects = p.semesters?.some((sem) =>
      sem.subjects.some((sub) => sub.toLowerCase().includes(q)),
    );
    return matchTitle || matchSubjects;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-iinicia-primary">
            Tecnológico de Estudios Superiores de Ecatepec · TESE
          </span>
          <h1 className="text-4xl font-extrabold text-slate-900 mt-1">
            Oferta Académica: 9 Ingenierías
          </h1>
          <p className="text-slate-600 mt-2 max-w-2xl">
            Consulta el plan de estudios completo por semestre (Semestre 1 a
            Semestre 9) de nuestras carreras de ingeniería e inscríbete desde el
            portal.
          </p>
        </div>

        {/* Buscador por carrera o materia */}
        <div className="w-full md:w-80">
          <label
            htmlFor="search-carrera"
            className="block text-xs font-bold uppercase text-slate-600 mb-1"
          >
            Buscar ingeniería o asignatura
          </label>
          <input
            id="search-carrera"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ej. Mecatrónica, Robótica, Reactores..."
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-iinicia-teal"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {filtered.map((prog, idx) => {
          const isExpanded = expandedSlug === prog.slug;
          return (
            <article
              key={prog.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-teal-50 text-iinicia-primary border border-teal-200">
                      Ingeniería #{idx + 1} · {prog.duration}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      Clave: {prog.code}
                    </span>
                    <span className="text-xs text-slate-500">
                      Modalidad: {prog.modality}
                    </span>
                  </div>

                  <h2 className="text-2xl font-extrabold text-slate-900">
                    {prog.title}
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {prog.summary}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedSlug(isExpanded ? null : prog.slug)
                    }
                    className="px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
                  >
                    {isExpanded
                      ? '▲ Ocultar los 9 semestres'
                      : '▼ Desplegar los 9 semestres'}
                  </button>
                  <Link
                    href={`/oferta-academica/${prog.slug}`}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-iinicia-primary text-white hover:bg-teal-900 transition"
                  >
                    Ver ficha completa →
                  </Link>
                  <Link
                    href="/registro"
                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-iinicia-teal text-slate-950 hover:bg-teal-400 transition"
                  >
                    Inscribirme
                  </Link>
                </div>
              </div>

              {/* Retícula de 9 Semestres Desplegable */}
              {isExpanded && prog.semesters && (
                <div className="pt-4 border-t border-slate-200">
                  <h3 className="text-sm font-bold uppercase text-iinicia-primary mb-4">
                    Mapa Curricular Oficial ({prog.title} — 9 Semestres)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {prog.semesters.map((sem) => (
                      <div
                        key={sem.semester}
                        className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
                      >
                        <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                          <span className="font-extrabold text-sm text-iinicia-navy">
                            {sem.title}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500">
                            {sem.subjects.length}{' '}
                            {sem.subjects.length === 1
                              ? 'materia'
                              : 'materias'}
                          </span>
                        </div>
                        <ul className="text-xs text-slate-700 space-y-1 list-disc pl-4">
                          {sem.subjects.map((sub) => (
                            <li key={sub}>{sub}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
