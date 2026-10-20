'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { apiRequest, FALLBACK_PROGRAMS } from '../../lib/api';

export default function OfertaAcademicaPage() {
  const [programs, setPrograms] = useState(FALLBACK_PROGRAMS);
  const [filterType, setFilterType] = useState<string>('todos');

  useEffect(() => {
    apiRequest<{ programs: typeof FALLBACK_PROGRAMS }>('/public/programs')
      .then((res) => {
        if (res.programs?.length > 0) {
          setPrograms(res.programs);
        }
      })
      .catch(() => {
        // Mantiene catálogo de respaldo si el backend está iniciando
      });
  }, []);

  const filtered =
    filterType === 'todos'
      ? programs
      : programs.filter((p) => p.type === filterType);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-iinicia-primary">
            Programas Académicos · Sección 9.1
          </span>
          <h1 className="text-4xl font-extrabold text-slate-900 mt-1">
            Oferta Académica
          </h1>
          <p className="text-slate-600 mt-2 max-w-2xl">
            Conoce nuestras licenciaturas, diplomados y certificaciones
            impartidas en el Campus Virtual Moodle de IINICIA.
          </p>
        </div>

        {/* Filtro accesible por tipo */}
        <div
          role="group"
          aria-label="Filtrar oferta académica por nivel"
          className="flex flex-wrap gap-2"
        >
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'licenciatura', label: 'Licenciaturas' },
            { id: 'diplomado', label: 'Diplomados' },
            { id: 'certificacion', label: 'Certificaciones' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                filterType === tab.id
                  ? 'bg-iinicia-primary text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {filtered.map((prog) => (
          <article
            key={prog.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-teal-50 text-iinicia-primary border border-teal-200">
                  {prog.type}
                </span>
                <span className="text-xs font-mono text-slate-500">
                  {prog.code}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                {prog.title}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                {prog.summary}
              </p>
              <div className="text-xs text-slate-500 space-y-1 mb-6">
                <div>
                  <strong>Modalidad:</strong> {prog.modality}
                </div>
                <div>
                  <strong>Duración:</strong> {prog.duration}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <Link
                href={`/oferta-academica/${prog.slug}`}
                className="text-sm font-bold text-iinicia-primary hover:underline"
              >
                Ver detalle del programa →
              </Link>
              <Link
                href="/registro"
                className="px-3.5 py-2 rounded-lg text-xs font-bold bg-iinicia-teal text-slate-950 hover:bg-teal-400 transition"
              >
                Inscribirme
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
