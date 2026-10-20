/**
 * Capa de comunicación del Frontend (Next.js) con el Backend API (NestJS).
 * Cumple con la Regla de Integración (Sección 4, CA-14 y CA-15):
 * - El frontend NUNCA accede directamente a la base de datos de Moodle.
 * - No existen tokens administrativos de Moodle ni Service Role Keys de Supabase en el navegador.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
  accessToken?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    cache: 'no-store',
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      data?.message || `Error ${res.status} al comunicarse con la API de IINICIA`,
    );
  }

  return data as T;
}

export const FALLBACK_PROGRAMS = [
  {
    id: '11111111-1111-4111-8111-111111111101',
    slug: 'ingenieria-software-ti',
    code: 'LIC-ISTI-01',
    title: 'Licenciatura en Ingeniería de Software y Tecnologías de la Información',
    type: 'licenciatura',
    modality: 'En línea (Campus Moodle)',
    duration: '9 Cuatrimestres',
    summary:
      'Formación integral en arquitectura de software, desarrollo web moderno, bases de datos y gestión de infraestructura tecnológica.',
    description:
      'Programa universitario diseñado para formar profesionales capaces de diseñar, construir y operar plataformas digitales empresariales y educativas con estándares modernos de seguridad, nube y escalabilidad.',
    is_active: true,
    courses: [
      {
        course_code: 'TI-101',
        course_name: 'Curso 1. Introducción a las Tecnologías de la Información',
        description:
          'Fundamentos de sistemas computacionales, redes, bases de datos, seguridad de la información y servicios en la nube.',
      },
    ],
  },
  {
    id: '11111111-1111-4111-8111-111111111102',
    slug: 'diplomado-desarrollo-web-fullstack',
    code: 'DIP-FS-02',
    title: 'Diplomado en Desarrollo Web Full-Stack con React y Node.js',
    type: 'diplomado',
    modality: 'En línea (Campus Moodle)',
    duration: '160 Horas (4 Módulos)',
    summary:
      'Especialización práctica en interfaces modernas con React, Next.js, TypeScript y arquitecturas backend con NestJS.',
    description:
      'Diplomado intensivo enfocado en el dominio práctico de aplicaciones web con React, Next.js, NestJS y bases de datos relacionales con control de acceso basado en roles (RBAC).',
    is_active: true,
    courses: [
      {
        course_code: 'WEB-202',
        course_name: 'Curso 2. Desarrollo Web con React',
        description:
          'Construcción de aplicaciones web modernas con React, TypeScript, Next.js, consumo seguro de APIs REST y control de acceso por rol.',
      },
    ],
  },
  {
    id: '11111111-1111-4111-8111-111111111103',
    slug: 'certificacion-arquitectura-cloud-seguridad',
    code: 'CERT-ACS-03',
    title: 'Certificación en Arquitectura Cloud y Seguridad Aplicada',
    type: 'certificacion',
    modality: 'En línea (Campus Moodle)',
    duration: '80 Horas',
    summary:
      'Diseño de sistemas seguros, identidad federada, protección de APIs, Row Level Security y cumplimiento normativo.',
    description:
      'Certificación técnica orientada a arquitectos y líderes técnicos que implementan sistemas seguros e integraciones institucionales.',
    is_active: true,
    courses: [],
  },
];
