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
      data?.message || `Error ${res.status} al comunicarse con la API de TESE`,
    );
  }

  return data as T;
}

export interface ProgramSemester {
  semester: number;
  title: string;
  subjects: string[];
}

export interface ProgramItem {
  id: string;
  slug: string;
  code: string;
  title: string;
  type: string;
  modality: string;
  duration: string;
  summary: string;
  description: string;
  is_active: boolean;
  semesters: ProgramSemester[];
  courses: Array<{
    course_code: string;
    course_name: string;
    description: string;
  }>;
}

export const FALLBACK_PROGRAMS: ProgramItem[] = [
  {
    id: '11111111-1111-4111-8111-111111111101',
    slug: 'ingenieria-mecatronica',
    code: 'ING-MEC-01',
    title: 'Ingeniería Mecatrónica',
    type: 'licenciatura',
    modality: 'Escolarizada y Apoyo en Campus Moodle',
    duration: '9 Semestres',
    summary:
      'Enfocada en la integración de mecánica, electrónica y sistemas de control para automatizar procesos.',
    description:
      'Forma profesionales en el TESE capaces de integrar diseño mecánico, electrónica de potencia, microcontroladores, PLC y robótica industrial para la automatización de procesos y manufactura avanzada.',
    is_active: true,
    semesters: [
      {
        semester: 1,
        title: 'Semestre 1',
        subjects: [
          'Cálculo Diferencial',
          'Química',
          'Taller de Ética',
          'Fundamentos de Investigación',
          'Dibujo Electromecánico',
          'Metrología y Normalización',
        ],
      },
      {
        semester: 2,
        title: 'Semestre 2',
        subjects: [
          'Cálculo Integral',
          'Álgebra Lineal',
          'Física',
          'Programación Básica',
          'Ciencia e Ingeniería de Materiales',
          'Estadística y Control de Calidad',
        ],
      },
      {
        semester: 3,
        title: 'Semestre 3',
        subjects: [
          'Cálculo Vectorial',
          'Electromagnetismo',
          'Estática',
          'Procesos de Fabricación',
          'Dinámica',
          'Desarrollo Sustentable',
        ],
      },
      {
        semester: 4,
        title: 'Semestre 4',
        subjects: [
          'Ecuaciones Diferenciales',
          'Análisis de Circuitos Eléctricos',
          'Mecánica de Materiales',
          'Fundamentos de Termodinámica',
          'Máquinas Eléctricas',
          'Métodos Numéricos',
        ],
      },
      {
        semester: 5,
        title: 'Semestre 5',
        subjects: [
          'Electrónica Analógica',
          'Análisis y Síntesis de Mecanismos',
          'Microcontroladores',
          'Instrumentación',
          'Taller de Investigación I',
          'Dinámica de Sistemas',
        ],
      },
      {
        semester: 6,
        title: 'Semestre 6',
        subjects: [
          'Electrónica de Potencia',
          'Diseño de Elementos Mecánicos',
          'Mantenimiento',
          'Taller de Investigación II',
          'Control',
          'Electrónica Digital',
        ],
      },
      {
        semester: 7,
        title: 'Semestre 7',
        subjects: [
          'Robótica',
          'Controladores Lógicos Programables (PLC)',
          'Manufactura Avanzada',
          'Materias de Especialidad',
        ],
      },
      {
        semester: 8,
        title: 'Semestre 8',
        subjects: [
          'Formulación y Evaluación de Proyectos',
          'Interfases y Redes Industriales',
          'Materias de Especialidad',
        ],
      },
      {
        semester: 9,
        title: 'Semestre 9',
        subjects: ['Residencia Profesional'],
      },
    ],
    courses: [
      {
        course_code: 'TI-101',
        course_name: 'Curso 1. Introducción a las Tecnologías de la Información',
        description:
          'Fundamentos de sistemas computacionales, redes, bases de datos, seguridad de la información y servicios en la nube en el Campus Moodle.',
      },
    ],
  },
  {
    id: '11111111-1111-4111-8111-111111111102',
    slug: 'ingenieria-industrial',
    code: 'ING-IND-02',
    title: 'Ingeniería Industrial',
    type: 'licenciatura',
    modality: 'Escolarizada y Apoyo en Campus Moodle',
    duration: '9 Semestres',
    summary:
      'Orientada a la optimización de procesos, gestión de calidad, manufactura y logística.',
    description:
      'Programa de ingeniería del TESE enfocado en la mejora continua de sistemas productivos, estudio del trabajo, investigación de operaciones, ergonomía, control estadístico de la calidad y cadenas de suministro.',
    is_active: true,
    semesters: [
      {
        semester: 1,
        title: 'Semestre 1',
        subjects: [
          'Cálculo Diferencial',
          'Fundamentos de Investigación',
          'Taller de Ética',
          'Química',
          'Dibujo Industrial',
          'Taller de Herramientas Intelectuales',
        ],
      },
      {
        semester: 2,
        title: 'Semestre 2',
        subjects: [
          'Cálculo Integral',
          'Probabilidad y Estadística',
          'Análisis de la Realidad Nacional',
          'Propiedad de los Materiales',
          'Electricidad y Electrónica Industrial',
          'Taller de Liderazgo',
        ],
      },
      {
        semester: 3,
        title: 'Semestre 3',
        subjects: [
          'Cálculo Vectorial',
          'Estadística Inferencial I',
          'Estudio del Trabajo I',
          'Economía',
          'Álgebra Lineal',
          'Metrología y Normalización',
        ],
      },
      {
        semester: 4,
        title: 'Semestre 4',
        subjects: [
          'Ecuaciones Diferenciales',
          'Estadística Inferencial II',
          'Estudio del Trabajo II',
          'Investigación de Operaciones I',
          'Procesos de Fabricación',
          'Higiene y Seguridad Industrial',
        ],
      },
      {
        semester: 5,
        title: 'Semestre 5',
        subjects: [
          'Desarrollo Sustentable',
          'Administración de Proyectos',
          'Gestión de Costos',
          'Investigación de Operaciones II',
          'Ergonomía',
          'Control Estadístico de la Calidad',
        ],
      },
      {
        semester: 6,
        title: 'Semestre 6',
        subjects: [
          'Taller de Investigación I',
          'Ingeniería Económica',
          'Administración del Mantenimiento',
          'Sistemas de Manufactura',
          'Diseño de Experimentos',
          'Logística y Cadenas de Suministro',
        ],
      },
      {
        semester: 7,
        title: 'Semestre 7',
        subjects: [
          'Planeación Financiera',
          'Planeación y Diseño de Instalaciones',
          'Sistemas de Producción',
          'Taller de Investigación II',
          'Materias de Especialidad',
        ],
      },
      {
        semester: 8,
        title: 'Semestre 8',
        subjects: [
          'Formulación y Evaluación de Proyectos',
          'Relaciones Industriales',
          'Materias de Especialidad',
        ],
      },
      {
        semester: 9,
        title: 'Semestre 9',
        subjects: ['Residencia Profesional'],
      },
    ],
    courses: [
      {
        course_code: 'WEB-202',
        course_name: 'Curso 2. Desarrollo Web con React',
        description:
          'Construcción de aplicaciones web modernas con React, TypeScript, Next.js, consumo seguro de APIs REST y control de acceso por rol en el Campus Moodle.',
      },
    ],
  },
  {
    id: '11111111-1111-4111-8111-111111111103',
    slug: 'ingenieria-quimica',
    code: 'ING-QUI-03',
    title: 'Ingeniería Química',
    type: 'licenciatura',
    modality: 'Escolarizada y Apoyo en Campus Moodle',
    duration: '9 Semestres',
    summary:
      'Centrada en la transformación de materias primas, diseño de reactores y termodinámica.',
    description:
      'Especializa en procesos químicos industriales, balance de materia y energía, fenómenos de transporte, operaciones unitarias, diseño de reactores y simulación de procesos.',
    is_active: true,
    semesters: [
      {
        semester: 1,
        title: 'Semestre 1',
        subjects: [
          'Cálculo Diferencial',
          'Química Inorgánica',
          'Taller de Ética',
          'Fundamentos de Investigación',
          'Dibujo',
          'Mecánica Clásica',
        ],
      },
      {
        semester: 2,
        title: 'Semestre 2',
        subjects: [
          'Cálculo Integral',
          'Álgebra Lineal',
          'Química Analítica',
          'Química Orgánica I',
          'Probabilidad y Estadística',
          'Termodinámica',
        ],
      },
      {
        semester: 3,
        title: 'Semestre 3',
        subjects: [
          'Cálculo Vectorial',
          'Química Orgánica II',
          'Fisicoquímica I',
          'Balance de Materia y Energía',
          'Ecuaciones Diferenciales',
          'Desarrollo Sustentable',
        ],
      },
      {
        semester: 4,
        title: 'Semestre 4',
        subjects: [
          'Métodos Numéricos',
          'Termodinámica',
          'Fisicoquímica II',
          'Fenómenos de Transporte I',
          'Análisis Instrumental',
          'Programación',
        ],
      },
      {
        semester: 5,
        title: 'Semestre 5',
        subjects: [
          'Cinética Química y Biológica',
          'Operaciones Unitarias I',
          'Fenómenos de Transporte II',
          'Taller de Investigación I',
          'Legislación',
          'Ingeniería Ambiental',
        ],
      },
      {
        semester: 6,
        title: 'Semestre 6',
        subjects: [
          'Diseño de Reactores',
          'Operaciones Unitarias II',
          'Dinámica y Control de Procesos',
          'Taller de Investigación II',
          'Seguridad e Higiene Industrial',
        ],
      },
      {
        semester: 7,
        title: 'Semestre 7',
        subjects: [
          'Simulación de Procesos',
          'Operaciones Unitarias III',
          'Síntesis y Optimización de Procesos',
          'Especialidad',
        ],
      },
      {
        semester: 8,
        title: 'Semestre 8',
        subjects: [
          'Formulación y Evaluación de Proyectos',
          'Ingeniería Económica',
          'Especialidad',
        ],
      },
      {
        semester: 9,
        title: 'Semestre 9',
        subjects: ['Residencia Profesional'],
      },
    ],
    courses: [],
  },
  {
    id: '11111111-1111-4111-8111-111111111104',
    slug: 'ingenieria-bioquimica',
    code: 'ING-BIO-04',
    title: 'Ingeniería Bioquímica',
    type: 'licenciatura',
    modality: 'Escolarizada y Apoyo en Campus Moodle',
    duration: '9 Semestres',
    summary:
      'Aplicación de procesos biológicos y químicos en las industrias alimentaria y farmacéutica.',
    description:
      'Forma profesionales capaces de diseñar, operar y controlar bioprocesos, biorreactores y plantas de procesamiento en las industrias alimentaria, biotecnológica y farmacéutica.',
    is_active: true,
    semesters: [
      {
        semester: 1,
        title: 'Semestre 1',
        subjects: [
          'Cálculo Diferencial',
          'Química Inorgánica',
          'Biología',
          'Taller de Ética',
          'Fundamentos de Investigación',
          'Dibujo',
        ],
      },
      {
        semester: 2,
        title: 'Semestre 2',
        subjects: [
          'Cálculo Integral',
          'Química Analítica',
          'Física I',
          'Álgebra Lineal',
          'Probabilidad y Estadística',
          'Programación',
        ],
      },
      {
        semester: 3,
        title: 'Semestre 3',
        subjects: [
          'Cálculo Vectorial',
          'Química Orgánica I',
          'Física II',
          'Fisicoquímica',
          'Bioquímica I',
          'Microbiología',
        ],
      },
      {
        semester: 4,
        title: 'Semestre 4',
        subjects: [
          'Ecuaciones Diferenciales',
          'Química Orgánica II',
          'Termodinámica',
          'Bioquímica II',
          'Microbiología Industrial',
          'Métodos Numéricos',
        ],
      },
      {
        semester: 5,
        title: 'Semestre 5',
        subjects: [
          'Operaciones Unitarias I',
          'Cinética Química y Biológica',
          'Taller de Investigación I',
          'Biología Celular',
          'Desarrollo Sustentable',
          'Ingeniería de Bioprocesos',
        ],
      },
      {
        semester: 6,
        title: 'Semestre 6',
        subjects: [
          'Operaciones Unitarias II',
          'Ingeniería de Biorreactores',
          'Instrumentación y Control',
          'Taller de Investigación II',
          'Fenómenos de Transporte',
        ],
      },
      {
        semester: 7,
        title: 'Semestre 7',
        subjects: [
          'Operaciones Unitarias III',
          'Formulación y Evaluación de Proyectos',
          'Tecnología de Alimentos/Fármacos (según especialidad)',
          'Especialidad',
        ],
      },
      {
        semester: 8,
        title: 'Semestre 8',
        subjects: [
          'Ingeniería Económica',
          'Administración y Legislación',
          'Especialidad',
        ],
      },
      {
        semester: 9,
        title: 'Semestre 9',
        subjects: ['Residencia Profesional'],
      },
    ],
    courses: [],
  },
  {
    id: '11111111-1111-4111-8111-111111111105',
    slug: 'ingenieria-aeronautica',
    code: 'ING-AER-05',
    title: 'Ingeniería Aeronáutica',
    type: 'licenciatura',
    modality: 'Escolarizada y Apoyo en Campus Moodle',
    duration: '9 Semestres',
    summary:
      'Diseño, manufactura y mantenimiento de aeronaves y sistemas aeroespaciales.',
    description:
      'Prepara ingenieros especializados en aerodinámica, estructuras aeroespaciales, sistemas de propulsión, manufactura aeronáutica, control de vuelo y gestión de operaciones aéreas.',
    is_active: true,
    semesters: [
      {
        semester: 1,
        title: 'Semestre 1',
        subjects: [
          'Cálculo Diferencial',
          'Álgebra Lineal',
          'Taller de Ética',
          'Química',
          'Dibujo Aeronáutico',
          'Fundamentos de Investigación',
        ],
      },
      {
        semester: 2,
        title: 'Semestre 2',
        subjects: [
          'Cálculo Integral',
          'Mecánica Clásica',
          'Probabilidad y Estadística',
          'Ciencia de Materiales Aeronáuticos',
          'Termodinámica',
          'Programación',
        ],
      },
      {
        semester: 3,
        title: 'Semestre 3',
        subjects: [
          'Cálculo Vectorial',
          'Estática',
          'Electromagnetismo',
          'Mecánica de Fluidos',
          'Ecuaciones Diferenciales',
          'Desarrollo Sustentable',
        ],
      },
      {
        semester: 4,
        title: 'Semestre 4',
        subjects: [
          'Dinámica',
          'Mecánica de Materiales',
          'Aerodinámica',
          'Análisis de Circuitos',
          'Métodos Numéricos',
          'Electrónica',
        ],
      },
      {
        semester: 5,
        title: 'Semestre 5',
        subjects: [
          'Aerodinámica de Alta Velocidad',
          'Estructuras Aeronáuticas',
          'Taller de Investigación I',
          'Sistemas de Aeronaves',
          'Propulsión',
          'Instrumentación Aeronáutica',
        ],
      },
      {
        semester: 6,
        title: 'Semestre 6',
        subjects: [
          'Desempeño de Aeronaves',
          'Diseño de Elementos de Máquinas',
          'Taller de Investigación II',
          'Manufactura Aeronáutica',
          'Dinámica de Vuelo',
        ],
      },
      {
        semester: 7,
        title: 'Semestre 7',
        subjects: [
          'Mantenimiento Aeronáutico',
          'Diseño Aeronáutico',
          'Control de Vuelo',
          'Materias de Especialidad',
        ],
      },
      {
        semester: 8,
        title: 'Semestre 8',
        subjects: [
          'Administración de Operaciones Aeronáuticas',
          'Legislación Aeronáutica',
          'Especialidad',
        ],
      },
      {
        semester: 9,
        title: 'Semestre 9',
        subjects: ['Residencia Profesional'],
      },
    ],
    courses: [],
  },
  {
    id: '11111111-1111-4111-8111-111111111106',
    slug: 'ingenieria-gestion-empresarial',
    code: 'ING-IGE-06',
    title: 'Ingeniería en Gestión Empresarial',
    type: 'licenciatura',
    modality: 'Escolarizada y Apoyo en Campus Moodle',
    duration: '9 Semestres',
    summary:
      'Combinación de administración de negocios, finanzas e ingeniería de procesos.',
    description:
      'Forma líderes capaces de diseñar organizaciones competitivas mediante gestión financiera, capital humano, sistemas de producción, innovación, mercadotecnia y planeación estratégica.',
    is_active: true,
    semesters: [
      {
        semester: 1,
        title: 'Semestre 1',
        subjects: [
          'Fundamentos de Investigación',
          'Cálculo Diferencial',
          'Desarrollo Humano',
          'Fundamentos de Gestión Empresarial',
          'Física',
          'Dinámica Social',
        ],
      },
      {
        semester: 2,
        title: 'Semestre 2',
        subjects: [
          'Software de Aplicación Ejecutivo',
          'Cálculo Integral',
          'Contabilidad Orientada a los Negocios',
          'Dinámica de la Empresa',
          'Estadística para la Administración I',
          'Legislación Laboral',
        ],
      },
      {
        semester: 3,
        title: 'Semestre 3',
        subjects: [
          'Marco Legal de las Organizaciones',
          'Probabilidad y Estadística Descriptiva',
          'Costos Empresariales',
          'Habilidades Directivas I',
          'Economía Empresarial',
          'Álgebra Lineal',
        ],
      },
      {
        semester: 4,
        title: 'Semestre 4',
        subjects: [
          'Ingeniería Económica',
          'Estadística para la Administración II',
          'Instrumentos de Presupuestación',
          'Habilidades Directivas II',
          'Entorno Macroeconómico',
          'Investigación de Operaciones',
        ],
      },
      {
        semester: 5,
        title: 'Semestre 5',
        subjects: [
          'Finanzas en las Organizaciones',
          'Diseño Organizacional',
          'Gestión del Capital Humano',
          'Taller de Investigación I',
          'Mercadotecnia',
          'Desarrollo Sustentable',
        ],
      },
      {
        semester: 6,
        title: 'Semestre 6',
        subjects: [
          'Administración de la Salud y Seguridad Ocupacional',
          'El Emprendedor y la Innovación',
          'Gestión de la Producción I',
          'Taller de Investigación II',
          'Sistemas de Información de Mercadotecnia',
        ],
      },
      {
        semester: 7,
        title: 'Semestre 7',
        subjects: [
          'Plan de Negocios',
          'Gestión de la Producción II',
          'Calidad Aplicada a la Gestión Empresarial',
          'Materias de Especialidad',
        ],
      },
      {
        semester: 8,
        title: 'Semestre 8',
        subjects: [
          'Gestión Estratégica',
          'Cadena de Suministros',
          'Materias de Especialidad',
        ],
      },
      {
        semester: 9,
        title: 'Semestre 9',
        subjects: ['Residencia Profesional'],
      },
    ],
    courses: [],
  },
  {
    id: '11111111-1111-4111-8111-111111111107',
    slug: 'ingenieria-electromecanica',
    code: 'ING-IEM-07',
    title: 'Ingeniería Electromecánica',
    type: 'licenciatura',
    modality: 'Escolarizada y Apoyo en Campus Moodle',
    duration: '9 Semestres',
    summary:
      'Integración de sistemas eléctricos, mecánicos y térmicos para la industria.',
    description:
      'Desarrolla especialistas en instalaciones y subestaciones eléctricas, máquinas eléctricas, sistemas hidráulicos y neumáticos, transferencia de calor, refrigeración y automatización industrial.',
    is_active: true,
    semesters: [
      {
        semester: 1,
        title: 'Semestre 1',
        subjects: [
          'Cálculo Diferencial',
          'Química',
          'Taller de Ética',
          'Fundamentos de Investigación',
          'Dibujo Electromecánico',
          'Introducción a la Programación',
        ],
      },
      {
        semester: 2,
        title: 'Semestre 2',
        subjects: [
          'Cálculo Integral',
          'Álgebra Lineal',
          'Mecánica Clásica',
          'Tecnología de los Materiales',
          'Probabilidad y Estadística',
          'Metrología y Normalización',
        ],
      },
      {
        semester: 3,
        title: 'Semestre 3',
        subjects: [
          'Cálculo Vectorial',
          'Electricidad y Magnetismo',
          'Estática',
          'Procesos de Manufactura',
          'Electrónica Analógica',
          'Desarrollo Sustentable',
        ],
      },
      {
        semester: 4,
        title: 'Semestre 4',
        subjects: [
          'Ecuaciones Diferenciales',
          'Dinámica',
          'Mecánica de Materiales',
          'Análisis de Circuitos',
          'Termodinámica',
          'Métodos Numéricos',
        ],
      },
      {
        semester: 5,
        title: 'Semestre 5',
        subjects: [
          'Máquinas Eléctricas',
          'Mecánica de Fluidos',
          'Diseño de Elementos de Máquinas',
          'Instalaciones Eléctricas',
          'Taller de Investigación I',
        ],
      },
      {
        semester: 6,
        title: 'Semestre 6',
        subjects: [
          'Controles Eléctricos',
          'Transferencia de Calor',
          'Electrónica Industrial',
          'Sistemas Hidráulicos y Neumáticos',
          'Taller de Investigación II',
        ],
      },
      {
        semester: 7,
        title: 'Semestre 7',
        subjects: [
          'Refrigeración y Aire Acondicionado',
          'Subestaciones Eléctricas',
          'Automatización',
          'Materias de Especialidad',
        ],
      },
      {
        semester: 8,
        title: 'Semestre 8',
        subjects: [
          'Formulación y Evaluación de Proyectos',
          'Mantenimiento Industrial',
          'Especialidad',
        ],
      },
      {
        semester: 9,
        title: 'Semestre 9',
        subjects: ['Residencia Profesional'],
      },
    ],
    courses: [],
  },
  {
    id: '11111111-1111-4111-8111-111111111108',
    slug: 'ingenieria-electronica',
    code: 'ING-IEL-08',
    title: 'Ingeniería Electrónica',
    type: 'licenciatura',
    modality: 'Escolarizada y Apoyo en Campus Moodle',
    duration: '9 Semestres',
    summary:
      'Diseño de hardware, telecomunicaciones, instrumentación y control analógico/digital.',
    description:
      'Enfocada en el diseño de sistemas electrónicos analógicos y digitales, VHDL, microcontroladores, instrumentación, optoelectrónica, telecomunicaciones y control automático.',
    is_active: true,
    semesters: [
      {
        semester: 1,
        title: 'Semestre 1',
        subjects: [
          'Cálculo Diferencial',
          'Física I (Mecánica)',
          'Química',
          'Taller de Ética',
          'Fundamentos de Investigación',
          'Comunicación Humana',
        ],
      },
      {
        semester: 2,
        title: 'Semestre 2',
        subjects: [
          'Cálculo Integral',
          'Física II (Electromagnetismo)',
          'Álgebra Lineal',
          'Probabilidad y Estadística',
          'Programación Estructurada',
          'Dibujo Asistido por Computadora',
        ],
      },
      {
        semester: 3,
        title: 'Semestre 3',
        subjects: [
          'Cálculo Vectorial',
          'Ecuaciones Diferenciales',
          'Física de Semiconductores',
          'Mediciones Eléctricas',
          'Programación Visual',
          'Desarrollo Sustentable',
        ],
      },
      {
        semester: 4,
        title: 'Semestre 4',
        subjects: [
          'Análisis de Circuitos Eléctricos',
          'Electrónica Analógica',
          'Diseño Digital',
          'Métodos Numéricos',
          'Máquinas Eléctricas',
          'Teoría Electromagnética',
        ],
      },
      {
        semester: 5,
        title: 'Semestre 5',
        subjects: [
          'Taller de Investigación I',
          'Amplificadores Operacionales',
          'Microcontroladores',
          'Diseño Digital con VHDL',
          'Instrumentación',
          'Fundamentos de Telecomunicaciones',
        ],
      },
      {
        semester: 6,
        title: 'Semestre 6',
        subjects: [
          'Taller de Investigación II',
          'Control I',
          'Electrónica de Potencia',
          'Optoelectrónica',
          'Sistemas de Comunicación',
        ],
      },
      {
        semester: 7,
        title: 'Semestre 7',
        subjects: [
          'Control II',
          'PLC y Automatización',
          'Materias de Especialidad',
        ],
      },
      {
        semester: 8,
        title: 'Semestre 8',
        subjects: [
          'Formulación y Evaluación de Proyectos',
          'Administración Gerencial',
          'Especialidad',
        ],
      },
      {
        semester: 9,
        title: 'Semestre 9',
        subjects: ['Residencia Profesional'],
      },
    ],
    courses: [],
  },
  {
    id: '11111111-1111-4111-8111-111111111109',
    slug: 'ingenieria-logistica',
    code: 'ING-LOG-09',
    title: 'Ingeniería en Logística',
    type: 'licenciatura',
    modality: 'Escolarizada y Apoyo en Campus Moodle',
    duration: '9 Semestres',
    summary:
      'Diseño, operación y mejora de cadenas de suministro, transporte y almacenes.',
    description:
      'Forma especialistas en gestión de compras, inventarios, almacenes, tráfico y transporte, legislación aduanera, envase y embalaje, simulación logística y redes de suministro globales.',
    is_active: true,
    semesters: [
      {
        semester: 1,
        title: 'Semestre 1',
        subjects: [
          'Introducción a la Ingeniería en Logística',
          'Cálculo Diferencial',
          'Química',
          'Fundamentos de Investigación',
          'Taller de Ética',
          'Economía',
        ],
      },
      {
        semester: 2,
        title: 'Semestre 2',
        subjects: [
          'Cálculo Integral',
          'Probabilidad y Estadística',
          'Álgebra Lineal',
          'Dinámica Social',
          'Fundamentos de Administración',
          'Contabilidad Financiera',
        ],
      },
      {
        semester: 3,
        title: 'Semestre 3',
        subjects: [
          'Tipología del Producto',
          'Estadística Inferencial I',
          'Cálculo Vectorial',
          'Bases de Datos',
          'Entorno Macroeconómico',
          'Costos Logísticos',
        ],
      },
      {
        semester: 4,
        title: 'Semestre 4',
        subjects: [
          'Legislación Aduanera',
          'Estadística Inferencial II',
          'Finanzas',
          'Investigación de Operaciones I',
          'Higiene y Seguridad',
          'Mecánica Clásica',
        ],
      },
      {
        semester: 5,
        title: 'Semestre 5',
        subjects: [
          'Compras',
          'Tráfico y Transporte',
          'Investigación de Operaciones II',
          'Taller de Investigación I',
          'Desarrollo Sustentable',
          'Procesos de Fabricación',
        ],
      },
      {
        semester: 6,
        title: 'Semestre 6',
        subjects: [
          'Inventarios',
          'Envase, Empaque y Embalaje',
          'Modelos de Simulación y Logística',
          'Taller de Investigación II',
          'Ingeniería Económica',
          'Geografía Logística',
        ],
      },
      {
        semester: 7,
        title: 'Semestre 7',
        subjects: [
          'Almacenes',
          'Servicio al Cliente',
          'Formulación y Evaluación de Proyectos',
          'Materias de Especialidad',
        ],
      },
      {
        semester: 8,
        title: 'Semestre 8',
        subjects: [
          'Cadena de Suministro',
          'Diseño de Instalaciones',
          'Especialidad',
        ],
      },
      {
        semester: 9,
        title: 'Semestre 9',
        subjects: ['Residencia Profesional'],
      },
    ],
    courses: [],
  },
];
