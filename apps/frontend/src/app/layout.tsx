import type { Metadata } from 'next';
import React from 'react';
import { Footer } from '../components/Footer';
import { Navbar } from '../components/Navbar';
import { AuthProvider } from '../context/AuthContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'IINICIA | Plataforma Digital Universitaria (React + Moodle)',
  description:
    'Portal institucional de IINICIA integrado con Supabase Auth, NestJS y Campus Virtual Moodle.',
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
