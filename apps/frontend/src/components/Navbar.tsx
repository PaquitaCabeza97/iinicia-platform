'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isStaff =
    user &&
    user.roles.some((r) =>
      ['superadmin', 'admin', 'coordinador', 'soporte'].includes(r),
    );

  const navItems = [
    { href: '/', label: 'Inicio' },
    { href: '/universidad', label: 'Universidad' },
    { href: '/oferta-academica', label: 'Oferta Académica' },
    { href: '/admisiones', label: 'Admisiones' },
    { href: '/noticias', label: 'Noticias' },
    { href: '/contacto', label: 'Contacto' },
  ];

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-iinicia-navy to-iinicia-primary text-white border-b-2 border-iinicia-teal shadow-md">
      {/* Enlace de accesibilidad por teclado WCAG 2.2 AA (Sección 13) */}
      <a
        href="#contenido-principal"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:text-iinicia-navy focus:px-4 focus:py-2 focus:rounded-md focus:font-semibold"
      >
        Saltar al contenido principal
      </a>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Identidad Institucional TESE */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-iinicia-teal rounded-lg p-1"
            >
              <div className="w-10 h-10 rounded-xl bg-iinicia-teal flex items-center justify-center text-iinicia-navy font-extrabold text-base shadow-sm tracking-tighter">
                TESE
              </div>
              <div>
                <span className="block font-extrabold text-xl tracking-tight leading-none">
                  TESE
                </span>
                <span className="block text-xs text-teal-200 font-medium mt-0.5">
                  Tecnológico de Estudios Superiores
                </span>
              </div>
            </Link>
          </div>

          {/* Navegación Escritorio */}
          <nav
            aria-label="Navegación institucional principal"
            className="hidden lg:flex items-center gap-1"
          >
            {navItems.map((item) => {
              const active =
                item.href === '/'
                  ? pathname === '/'
                  : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-white/15 text-teal-200 border-b-2 border-iinicia-teal'
                      : 'text-slate-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Acciones de Identidad y Acceso por Rol */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/mi-iinicia"
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition ${
                    pathname === '/mi-iinicia'
                      ? 'bg-iinicia-teal text-slate-950'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  Mi IINICIA ({user.primaryRole.toUpperCase()})
                </Link>

                {/* Requisito obligatorio Sección 6 y 9.2: Solo personal autorizado visualiza el enlace Administrativo */}
                {isStaff && (
                  <Link
                    href="/admin"
                    className={`px-3.5 py-2 rounded-lg text-sm font-semibold border transition ${
                      pathname === '/admin'
                        ? 'bg-amber-400 text-slate-950 border-amber-300'
                        : 'border-teal-300/60 text-teal-200 hover:bg-white/10'
                    }`}
                  >
                    Panel Admin
                  </Link>
                )}

                <Link
                  href="/perfil"
                  className="px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-white/10"
                >
                  Mi Perfil
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-lg text-xs font-semibold bg-rose-600/90 hover:bg-rose-600 text-white transition"
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white hover:bg-white/10 border border-white/25 transition"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/registro"
                  className="px-4 py-2 rounded-lg text-sm font-bold bg-iinicia-teal hover:bg-teal-400 text-slate-950 shadow-sm transition"
                >
                  Registro de Aspirantes
                </Link>
              </>
            )}
          </div>

          {/* Botón Menú Móvil (Responsive Sección 13, CA-16) */}
          <div className="lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Abrir menú de navegación"
              className="p-2 rounded-lg text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-iinicia-teal"
            >
              <span className="text-sm font-bold">
                {mobileMenuOpen ? '✕ Cerrar' : '☰ Menú'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Menú Móvil Desplegable */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-iinicia-navy border-t border-white/10 px-4 pt-3 pb-5 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-100 hover:bg-white/10"
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-white/15 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  href="/mi-iinicia"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center px-4 py-2.5 rounded-lg font-bold bg-iinicia-teal text-slate-950"
                >
                  Mi IINICIA ({user.primaryRole.toUpperCase()})
                </Link>
                {isStaff && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center px-4 py-2 rounded-lg font-semibold border border-teal-300 text-teal-200"
                  >
                    Panel Administrativo
                  </Link>
                )}
                <Link
                  href="/perfil"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center px-4 py-2 rounded-lg text-sm text-slate-200 hover:bg-white/10"
                >
                  Mi Perfil ({user.profile.email})
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full px-4 py-2 rounded-lg text-sm font-semibold bg-rose-600 text-white"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center px-4 py-2.5 rounded-lg font-semibold border border-white/25 text-white"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/registro"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center px-4 py-2.5 rounded-lg font-bold bg-iinicia-teal text-slate-950"
                >
                  Registro de Aspirantes
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
