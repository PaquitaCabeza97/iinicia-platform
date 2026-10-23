import type { Metadata } from 'next';
import React from 'react';
import { Footer } from '../components/Footer';
import { Navbar } from '../components/Navbar';
import { AuthProvider } from '../context/AuthContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'TESE | Portal Institucional y Campus Virtual (React + Moodle)',
  description:
    'Portal institucional del Tecnológico de Estudios Superiores de Ecatepec (TESE) con sus 9 Ingenierías, integrado con Supabase Auth, NestJS y Campus Virtual Moodle.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <Navbar />
          <main id="contenido-principal" className="flex-1">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
