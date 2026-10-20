import React from 'react';

export default function NoticiasPage() {
  const articles = [
    {
      id: '1',
      date: '20 de octubre de 2026',
      category: 'Transformación Digital',
      title: 'IINICIA estrena nueva plataforma digital basada en React, Next.js y Moodle',
      excerpt:
        'La nueva arquitectura sustituye el antiguo portal en WordPress por un ecosistema integrado con identidad en Supabase Auth, control de acceso basado en roles (RBAC) y conexión directa al Campus Virtual.',
    },
    {
      id: '2',
      date: '15 de octubre de 2026',
      category: 'Vida Académica',
      title: 'Apertura de convocatorias para Ingeniería de Software y Diplomado en React',
      excerpt:
        'Los aspirantes ya pueden registrarse desde el portal institucional y dar seguimiento en tiempo real a su autorización académica e inscripción en Moodle.',
    },
    {
      id: '3',
      date: '10 de octubre de 2026',
      category: 'Calidad y Accesibilidad',
      title: 'Compromiso con el estándar WCAG 2.2 AA y seguridad de datos estudiantiles',
      excerpt:
        'Todas las operaciones sensibles están protegidas mediante Row Level Security (RLS) y validaciones del lado servidor, garantizando privacidad y trazabilidad.',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
      <header>
        <span className="text-xs font-bold uppercase tracking-wider text-iinicia-primary">
          Actualidad Universitaria · Sección 9.1
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 mt-1">
          Noticias y Contenidos Institucionales
        </h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {articles.map((art) => (
          <article
            key={art.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold text-iinicia-primary">
                  {art.category}
                </span>
                <time>{art.date}</time>
              </div>
              <h2 className="text-lg font-bold text-slate-900">{art.title}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {art.excerpt}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
