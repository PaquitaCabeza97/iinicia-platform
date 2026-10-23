import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';
import {
  AuditLogRecord,
  CourseMappingRecord,
  EnrollmentRequestRecord,
  EnrollmentStatus,
  ProfileRecord,
  ProgramRecord,
  RoleCode,
  RoleRecord,
  UserProgramRecord,
  UserStatus,
} from '../types/domain';
import { MoodleService } from './moodle.service';

export interface AuthenticatedUserContext {
  profile: ProfileRecord;
  roles: RoleCode[];
  primaryRole: RoleCode;
}

@Injectable()
export class DataStoreService {
  private supabase: SupabaseClient | null = null;

  // Catálogo oficial de roles (Sección 6)
  private roles: RoleRecord[] = [
    {
      id: 'role-superadmin',
      code: 'superadmin',
      name: 'Superadministrador',
      description: 'Configuración global, usuarios, roles, integraciones, parámetros y auditoría.',
      moodle_archetype: 'manager',
    },
    {
      id: 'role-admin',
      code: 'admin',
      name: 'Administrador',
      description: 'Gestión de usuarios, estados, programas, autorizaciones e inscripciones.',
      moodle_archetype: 'manager',
    },
    {
      id: 'role-coordinador',
      code: 'coordinador',
      name: 'Coordinador',
      description: 'Consulta y gestión de usuarios/programas bajo su ámbito.',
      moodle_archetype: 'coursecreator',
    },
    {
      id: 'role-profesor',
      code: 'profesor',
      name: 'Profesor',
      description: 'Perfil docente, consulta de cursos asignados y acceso al campus.',
      moodle_archetype: 'editingteacher',
    },
    {
      id: 'role-estudiante',
      code: 'estudiante',
      name: 'Estudiante',
      description: 'Perfil, programa, cursos asignados y acceso al campus.',
      moodle_archetype: 'student',
    },
    {
      id: 'role-aspirante',
      code: 'aspirante',
      name: 'Aspirante',
      description: 'Registro, actualización de datos y seguimiento de admisión.',
      moodle_archetype: 'none',
    },
    {
      id: 'role-soporte',
      code: 'soporte',
      name: 'Soporte',
      description: 'Atención operativa limitada y consulta controlada.',
      moodle_archetype: 'none',
    },
  ];

  // Usuarios preconfigurados para demostrar roles diferenciados (CA-05, CA-08, CA-09)
  private profiles: ProfileRecord[] = [
    {
      id: '00000000-0000-4000-8000-000000000001',
      email: 'admin@iinicia.edu.mx',
      first_name: 'Elena',
      last_name: 'Vargas (Administradora)',
      phone: '+52 55 1000 0001',
      status: 'activo',
      moodle_user_id: null,
      moodle_sync_status: 'sin_sincronizar',
      moodle_last_sync_at: null,
      created_at: '2026-10-01T09:00:00Z',
      updated_at: '2026-10-01T09:00:00Z',
    },
    {
      id: '00000000-0000-4000-8000-000000000002',
      email: 'profesor@iinicia.edu.mx',
      first_name: 'Roberto',
      last_name: 'Méndez',
      phone: '+52 55 1000 0002',
      status: 'activo',
      moodle_user_id: 2001,
      moodle_sync_status: 'sincronizado',
      moodle_last_sync_at: '2026-10-15T12:00:00Z',
      created_at: '2026-10-02T10:00:00Z',
      updated_at: '2026-10-15T12:00:00Z',
    },
    {
      id: '00000000-0000-4000-8000-000000000003',
      email: 'estudiante1@iinicia.edu.mx',
      first_name: 'Ana Sofía',
      last_name: 'García',
      phone: '+52 55 1000 0003',
      status: 'activo',
      moodle_user_id: 3001,
      moodle_sync_status: 'sincronizado',
      moodle_last_sync_at: '2026-10-16T14:30:00Z',
      created_at: '2026-10-05T11:00:00Z',
      updated_at: '2026-10-16T14:30:00Z',
    },
    {
      id: '00000000-0000-4000-8000-000000000004',
      email: 'estudiante2@iinicia.edu.mx',
      first_name: 'Carlos Eduardo',
      last_name: 'López',
      phone: '+52 55 1000 0004',
      status: 'activo',
      moodle_user_id: 3002,
      moodle_sync_status: 'sincronizado',
      moodle_last_sync_at: '2026-10-16T15:00:00Z',
      created_at: '2026-10-06T09:30:00Z',
      updated_at: '2026-10-16T15:00:00Z',
    },
    {
      id: '00000000-0000-4000-8000-000000000005',
      email: 'aspirante@iinicia.edu.mx',
      first_name: 'Lucía',
      last_name: 'Fernández',
      phone: '+52 55 1000 0005',
      status: 'pendiente',
      moodle_user_id: null,
      moodle_sync_status: 'sin_sincronizar',
      moodle_last_sync_at: null,
      created_at: '2026-10-19T16:20:00Z',
      updated_at: '2026-10-19T16:20:00Z',
    },
  ];

  // Relación user_roles (Sección 5.1)
  private userRoles: Array<{ user_id: string; role_code: RoleCode; assigned_at: string }> = [
    {
      user_id: '00000000-0000-4000-8000-000000000001',
      role_code: 'admin',
      assigned_at: '2026-10-01T09:00:00Z',
    },
    {
      user_id: '00000000-0000-4000-8000-000000000002',
      role_code: 'profesor',
      assigned_at: '2026-10-02T10:00:00Z',
    },
    {
      user_id: '00000000-0000-4000-8000-000000000003',
      role_code: 'estudiante',
      assigned_at: '2026-10-05T11:00:00Z',
    },
    {
      user_id: '00000000-0000-4000-8000-000000000004',
      role_code: 'estudiante',
      assigned_at: '2026-10-06T09:30:00Z',
    },
    {
      user_id: '00000000-0000-4000-8000-000000000005',
      role_code: 'aspirante',
      assigned_at: '2026-10-19T16:20:00Z',
    },
  ];

  // Oferta académica TESE: 9 Ingenierías con su mapa curricular de 9 semestres (Sección 9.1)
  private programs: ProgramRecord[] = [
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
    },
  ];

  // Los Dos Cursos de Ejemplo Obligatorios en Moodle (Sección 8.1, CA-08)
  private courseMappings: CourseMappingRecord[] = [
    {
      id: '22222222-2222-4222-8222-222222222201',
      program_id: '11111111-1111-4111-8111-111111111101',
      course_code: 'TI-101',
      course_name: 'Curso 1. Introducción a las Tecnologías de la Información',
      moodle_course_id: 101,
      moodle_shortname: 'IINICIA-TI-101',
      moodle_category_id: 1,
      description:
        'Fundamentos de sistemas computacionales, redes, bases de datos, seguridad de la información y servicios en la nube.',
      is_active: true,
      minimum_content_checklist: [
        'Profesor de prueba asignado (Roberto Méndez - Teacher)',
        'Al menos dos estudiantes matriculados (Ana Sofía García y Carlos Eduardo López)',
        'Presentación del curso y encuadre académico',
        'Recurso PDF / Página: Manual de Fundamentos de TI',
        'Foro de debate: Impacto de las TI en las organizaciones',
        'Tarea evaluable: Diagnóstico de arquitectura empresarial',
        'Cuestionario automatizado de Unidad 1',
        'Configuración de Calificación y Finalización de actividad',
      ],
      syllabus: [
        {
          unit: 'Unidad 1',
          title: 'Presentación y Fundamentos de Sistemas de Información',
          activities: [
            'Página: Presentación del curso y criterios de evaluación',
            'Recurso PDF: Arquitectura de Computadoras y Sistemas Operativos',
            'Foro: Bienvenida y análisis de casos de TI',
          ],
        },
        {
          unit: 'Unidad 2',
          title: 'Redes, Bases de Datos y Ciberseguridad',
          activities: [
            'Tarea: Diseño de red y modelo de datos básico',
            'Cuestionario: Evaluación de conceptos clave de TI (con calificación automática)',
            'Hito: Finalización de actividad verificada',
          ],
        },
      ],
    },
    {
      id: '22222222-2222-4222-8222-222222222202',
      program_id: '11111111-1111-4111-8111-111111111102',
      course_code: 'WEB-202',
      course_name: 'Curso 2. Desarrollo Web con React',
      moodle_course_id: 102,
      moodle_shortname: 'IINICIA-REACT-202',
      moodle_category_id: 1,
      description:
        'Construcción de aplicaciones web modernas con React, TypeScript, Next.js, consumo seguro de APIs REST y control de acceso por rol.',
      is_active: true,
      minimum_content_checklist: [
        'Profesor de prueba asignado (Roberto Méndez - Teacher)',
        'Al menos dos estudiantes matriculados (Ana Sofía García y Carlos Eduardo López)',
        'Unidades temáticas estructuradas (JSX, Estado, Hooks, Next.js App Router)',
        'Recurso técnico: Guía de Arquitectura React + TypeScript',
        'Actividad práctica entregable: Panel con RBAC y consumo de API',
        'Foro técnico de arquitectura frontend',
        'Cuestionario / Evaluación final con calificación',
        'Criterio de Finalización de curso habilitado',
      ],
      syllabus: [
        {
          unit: 'Tema 1',
          title: 'Componentes, Props, Estado y TypeScript en React',
          activities: [
            'Recurso: Guía oficial de patrones con React y TypeScript',
            'Foro técnico: Mejores prácticas de composición de componentes',
          ],
        },
        {
          unit: 'Tema 2',
          title: 'Next.js App Router, Seguridad y Consumo de APIs',
          activities: [
            'Actividad práctica: Implementación de panel protegido por rol',
            'Cuestionario de evaluación final de React y Next.js',
            'Hito: Finalización de curso con emisión de calificación en Moodle',
          ],
        },
      ],
    },
  ];

  // Relación user_programs
  private userPrograms: UserProgramRecord[] = [
    {
      id: 'up-001',
      user_id: '00000000-0000-4000-8000-000000000003',
      program_id: '11111111-1111-4111-8111-111111111101',
      academic_status: 'cursando',
      authorized_by: '00000000-0000-4000-8000-000000000001',
      enrolled_at: '2026-10-05T12:00:00Z',
    },
    {
      id: 'up-002',
      user_id: '00000000-0000-4000-8000-000000000004',
      program_id: '11111111-1111-4111-8111-111111111102',
      academic_status: 'cursando',
      authorized_by: '00000000-0000-4000-8000-000000000001',
      enrolled_at: '2026-10-06T12:00:00Z',
    },
  ];

  // Matrículas y autorizaciones en cursos de Moodle (CA-09, CA-12, CA-13)
  // Profesor asignado a Curso 1 y Curso 2 (editingteacher)
  // Estudiante 1 matriculada en Curso 1 y Curso 2
  // Estudiante 2 matriculado en Curso 1 y Curso 2
  private enrollments: EnrollmentRequestRecord[] = [
    {
      id: 'enr-prof-101',
      user_id: '00000000-0000-4000-8000-000000000002',
      course_mapping_id: '22222222-2222-4222-8222-222222222201',
      moodle_role: 'editingteacher',
      status: 'sincronizada',
      authorized_by: '00000000-0000-4000-8000-000000000001',
      authorized_at: '2026-10-15T12:00:00Z',
      moodle_synced_at: '2026-10-15T12:01:00Z',
      notes: 'Titular docente de Curso 1 (TI-101)',
      created_at: '2026-10-15T11:55:00Z',
    },
    {
      id: 'enr-prof-102',
      user_id: '00000000-0000-4000-8000-000000000002',
      course_mapping_id: '22222222-2222-4222-8222-222222222202',
      moodle_role: 'editingteacher',
      status: 'sincronizada',
      authorized_by: '00000000-0000-4000-8000-000000000001',
      authorized_at: '2026-10-15T12:02:00Z',
      moodle_synced_at: '2026-10-15T12:03:00Z',
      notes: 'Titular docente de Curso 2 (WEB-202)',
      created_at: '2026-10-15T11:58:00Z',
    },
    {
      id: 'enr-est1-101',
      user_id: '00000000-0000-4000-8000-000000000003',
      course_mapping_id: '22222222-2222-4222-8222-222222222201',
      moodle_role: 'student',
      status: 'sincronizada',
      authorized_by: '00000000-0000-4000-8000-000000000001',
      authorized_at: '2026-10-16T14:30:00Z',
      moodle_synced_at: '2026-10-16T14:31:00Z',
      notes: 'Matrícula ordinaria Estudiante 1 en Curso 1',
      created_at: '2026-10-16T14:00:00Z',
    },
    {
      id: 'enr-est1-102',
      user_id: '00000000-0000-4000-8000-000000000003',
      course_mapping_id: '22222222-2222-4222-8222-222222222202',
      moodle_role: 'student',
      status: 'sincronizada',
      authorized_by: '00000000-0000-4000-8000-000000000001',
      authorized_at: '2026-10-16T14:32:00Z',
      moodle_synced_at: '2026-10-16T14:33:00Z',
      notes: 'Matrícula ordinaria Estudiante 1 en Curso 2',
      created_at: '2026-10-16T14:05:00Z',
    },
    {
      id: 'enr-est2-101',
      user_id: '00000000-0000-4000-8000-000000000004',
      course_mapping_id: '22222222-2222-4222-8222-222222222201',
      moodle_role: 'student',
      status: 'sincronizada',
      authorized_by: '00000000-0000-4000-8000-000000000001',
      authorized_at: '2026-10-16T15:00:00Z',
      moodle_synced_at: '2026-10-16T15:01:00Z',
      notes: 'Matrícula ordinaria Estudiante 2 en Curso 1',
      created_at: '2026-10-16T14:50:00Z',
    },
    {
      id: 'enr-est2-102',
      user_id: '00000000-0000-4000-8000-000000000004',
      course_mapping_id: '22222222-2222-4222-8222-222222222202',
      moodle_role: 'student',
      status: 'sincronizada',
      authorized_by: '00000000-0000-4000-8000-000000000001',
      authorized_at: '2026-10-16T15:02:00Z',
      moodle_synced_at: '2026-10-16T15:03:00Z',
      notes: 'Matrícula ordinaria Estudiante 2 en Curso 2',
      created_at: '2026-10-16T14:55:00Z',
    },
  ];

  // Bitácora de auditoría (Sección 5.2, CA-19)
  private auditLogs: AuditLogRecord[] = [
    {
      id: 'audit-001',
      actor_id: '00000000-0000-4000-8000-000000000001',
      actor_email: 'admin@iinicia.edu.mx',
      target_user_id: '00000000-0000-4000-8000-000000000002',
      target_user_email: 'profesor@iinicia.edu.mx',
      action: 'MOODLE_TEACHER_SYNCED',
      entity_type: 'enrollment_requests',
      entity_id: 'enr-prof-101',
      details: {
        moodle_user_id: 2001,
        courses: ['IINICIA-TI-101', 'IINICIA-REACT-202'],
        moodle_role: 'editingteacher',
      },
      created_at: '2026-10-15T12:03:00Z',
    },
    {
      id: 'audit-002',
      actor_id: '00000000-0000-4000-8000-000000000001',
      actor_email: 'admin@iinicia.edu.mx',
      target_user_id: '00000000-0000-4000-8000-000000000003',
      target_user_email: 'estudiante1@iinicia.edu.mx',
      action: 'MOODLE_STUDENT_ENROLLED',
      entity_type: 'enrollment_requests',
      entity_id: 'enr-est1-101',
      details: {
        moodle_user_id: 3001,
        courses: ['IINICIA-TI-101', 'IINICIA-REACT-202'],
        moodle_role: 'student',
      },
      created_at: '2026-10-16T14:33:00Z',
    },
  ];

  constructor(private readonly moodleService: MoodleService) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (
      supabaseUrl &&
      supabaseServiceKey &&
      supabaseUrl !== 'https://tu-proyecto.supabase.co'
    ) {
      this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false },
      });
    }
  }

  isSupabaseLive(): boolean {
    return this.supabase !== null;
  }

  // ---------------------------------------------------------------------------
  // CONSULTAS PÚBLICAS (Catálogo institucional)
  // ---------------------------------------------------------------------------
  getPublicPrograms(): ProgramRecord[] {
    return this.programs.filter((p) => p.is_active);
  }

  getProgramBySlug(slug: string) {
    const program = this.programs.find((p) => p.slug === slug && p.is_active);
    if (!program) {
      throw new NotFoundException(`Programa académico '${slug}' no encontrado`);
    }
    const relatedCourses = this.courseMappings
      .filter((c) => c.program_id === program.id && c.is_active)
      .map((c) => ({
        course_code: c.course_code,
        course_name: c.course_name,
        description: c.description,
      }));
    return {
      ...program,
      courses: relatedCourses,
    };
  }

  getRolesCatalog(): RoleRecord[] {
    return this.roles;
  }

  // ---------------------------------------------------------------------------
  // AUTENTICACIÓN, REGISTRO Y RESOLUCIÓN DE IDENTIDAD (Sección 5 y Flujo 7.1)
  // ---------------------------------------------------------------------------
  getUserRoles(userId: string): RoleCode[] {
    const codes = this.userRoles
      .filter((ur) => ur.user_id === userId)
      .map((ur) => ur.role_code);
    return codes.length > 0 ? codes : ['aspirante'];
  }

  getPrimaryRole(roles: RoleCode[]): RoleCode {
    const priority: RoleCode[] = [
      'superadmin',
      'admin',
      'coordinador',
      'profesor',
      'estudiante',
      'soporte',
      'aspirante',
    ];
    for (const r of priority) {
      if (roles.includes(r)) return r;
    }
    return 'aspirante';
  }

  resolveUserContextByIdOrEmail(identifier: string): AuthenticatedUserContext | null {
    const normalized = identifier.trim().toLowerCase();
    const profile = this.profiles.find(
      (p) => p.id.toLowerCase() === normalized || p.email.toLowerCase() === normalized,
    );
    if (!profile) return null;
    const roles = this.getUserRoles(profile.id);
    return {
      profile,
      roles,
      primaryRole: this.getPrimaryRole(roles),
    };
  }

  /**
   * Flujo 7.1: Registro y alta de usuario
   * 1. Usuario accede a /registro y captura sus datos.
   * 2. Supabase Auth genera identidad (sin guardar contraseñas en tablas propias, CA-04).
   * 3. Se crea el perfil en profiles.
   * 4. Se asigna rol inicial 'aspirante' y se audita el evento (CA-19).
   */
  async registerNewUser(input: {
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    interested_program_id?: string;
  }): Promise<AuthenticatedUserContext> {
    const email = input.email.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      throw new BadRequestException('El correo electrónico proporcionado no es válido.');
    }

    const existing = this.profiles.find((p) => p.email.toLowerCase() === email);
    if (existing) {
      throw new BadRequestException(
        `Ya existe un usuario registrado con el correo ${email}.`,
      );
    }

    const now = new Date().toISOString();
    const newId = crypto.randomUUID();
    const newProfile: ProfileRecord = {
      id: newId,
      email,
      first_name: input.first_name.trim(),
      last_name: input.last_name.trim(),
      phone: input.phone?.trim() || '',
      status: 'pendiente',
      moodle_user_id: null,
      moodle_sync_status: 'sin_sincronizar',
      moodle_last_sync_at: null,
      created_at: now,
      updated_at: now,
    };

    this.profiles.unshift(newProfile);
    this.userRoles.push({
      user_id: newId,
      role_code: 'aspirante',
      assigned_at: now,
    });

    if (input.interested_program_id) {
      const prog = this.programs.find((p) => p.id === input.interested_program_id);
      if (prog) {
        this.userPrograms.push({
          id: `up-${crypto.randomUUID().slice(0, 8)}`,
          user_id: newId,
          program_id: prog.id,
          academic_status: 'aspirante',
          enrolled_at: now,
        });
      }
    }

    this.recordAudit({
      actor_id: newId,
      target_user_id: newId,
      action: 'USER_REGISTERED',
      entity_type: 'profiles',
      entity_id: newId,
      details: {
        email,
        initial_role: 'aspirante',
        initial_status: 'pendiente',
        password_stored_in_custom_table: false,
      },
    });

    return {
      profile: newProfile,
      roles: ['aspirante'],
      primaryRole: 'aspirante',
    };
  }

  // ---------------------------------------------------------------------------
  // PANEL MI IINICIA Y ACCESO ESTRICTO POR ROL (Secciones 6, 7, 9.2, CA-06, CA-11, CA-12, CA-13)
  // ---------------------------------------------------------------------------
  getPersonalizedDashboard(ctx: AuthenticatedUserContext) {
    const { profile, roles, primaryRole } = ctx;

    // Programas asociados a este usuario
    const myPrograms = this.userPrograms
      .filter((up) => up.user_id === profile.id)
      .map((up) => {
        const program = this.programs.find((p) => p.id === up.program_id);
        return {
          ...up,
          program,
        };
      });

    // Cursos autorizados:
    // Requisito obligatorio (Sección 6 y 9.2):
    // Un usuario NO deberá visualizar cursos fuera de su rol y ámbito de autorización.
    const authorizedEnrollments = this.enrollments.filter(
      (enr) =>
        enr.user_id === profile.id &&
        (enr.status === 'autorizada' || enr.status === 'sincronizada'),
    );

    const authorizedCourses = authorizedEnrollments
      .map((enr) => {
        const course = this.courseMappings.find((c) => c.id === enr.course_mapping_id);
        if (!course) return null;

        // Validar coherencia de rol: Estudiante -> student, Profesor -> editingteacher
        if (primaryRole === 'estudiante' && enr.moodle_role !== 'student') {
          return null;
        }
        if (primaryRole === 'profesor' && enr.moodle_role !== 'editingteacher') {
          return null;
        }

        return {
          enrollment_id: enr.id,
          enrollment_status: enr.status,
          moodle_role: enr.moodle_role,
          moodle_role_label:
            enr.moodle_role === 'editingteacher' ? 'Profesor (Teacher)' : 'Estudiante (Student)',
          moodle_synced_at: enr.moodle_synced_at,
          course: {
            id: course.id,
            course_code: course.course_code,
            course_name: course.course_name,
            moodle_course_id: course.moodle_course_id,
            moodle_shortname: course.moodle_shortname,
            description: course.description,
            syllabus: course.syllabus,
            minimum_content_checklist: course.minimum_content_checklist,
          },
          role_capabilities_in_moodle:
            enr.moodle_role === 'editingteacher'
              ? [
                  'Configurar actividades, foros, tareas y cuestionarios',
                  'Calificar entregas y retroalimentar estudiantes',
                  'Consultar reporte de participación y finalización del grupo',
                ]
              : [
                  'Consultar materiales, páginas y recursos PDF',
                  'Participar en foros y entregar tareas/actividades prácticas',
                  'Responder cuestionarios y consultar calificaciones propias y progreso',
                ],
        };
      })
      .filter(Boolean);

    // Respuesta estrictamente adaptada al rol (Sección 9.2: no enviar datos no autorizados al cliente)
    const baseResponse = {
      profile,
      roles,
      primaryRole,
      programs: myPrograms,
      authorizedCourses,
      campusAccessEnabled:
        profile.status === 'activo' &&
        profile.moodle_user_id !== null &&
        authorizedCourses.length > 0 &&
        (roles.includes('estudiante') ||
          roles.includes('profesor') ||
          roles.includes('admin') ||
          roles.includes('superadmin') ||
          roles.includes('coordinador')),
    };

    if (primaryRole === 'aspirante') {
      return {
        ...baseResponse,
        authorizedCourses: [], // Aspirante nunca recibe cursos hasta ser autorizado (Sección 6)
        campusAccessEnabled: false,
        admissionTracker: {
          stage: profile.status === 'pendiente' ? 'En revisión por Admisiones' : 'Validado',
          nextSteps: [
            'Verificación de correo electrónico en Supabase Auth',
            'Revisión documental y autorización administrativa',
            'Asignación de rol Estudiante y matrícula en cursos autorizados',
          ],
        },
      };
    }

    if (primaryRole === 'admin' || primaryRole === 'superadmin') {
      return {
        ...baseResponse,
        adminSummary: {
          totalUsers: this.profiles.length,
          pendingUsers: this.profiles.filter((u) => u.status === 'pendiente').length,
          syncedWithMoodle: this.profiles.filter((u) => u.moodle_user_id !== null).length,
          totalActiveCourses: this.courseMappings.length,
          totalEnrollments: this.enrollments.length,
          moodleIntegration: this.moodleService.getIntegrationStatus(),
        },
      };
    }

    return baseResponse;
  }

  /**
   * Genera el enlace seguro SSO para acceder a un curso específico en el Campus Moodle (Sección 11).
   * Valida que el usuario esté activo, sincronizado con Moodle y tenga matrícula autorizada en ese curso.
   */
  generateCourseLaunchForUser(ctx: AuthenticatedUserContext, courseMappingId: string) {
    const { profile, roles } = ctx;

    if (profile.status !== 'activo') {
      throw new ForbiddenException(
        'Tu cuenta aún no está activa para ingresar al Campus Moodle.',
      );
    }

    if (roles.includes('aspirante') && !roles.includes('estudiante') && !roles.includes('profesor')) {
      throw new ForbiddenException(
        'El rol Aspirante no tiene acceso a cursos en Moodle hasta ser autorizado como Estudiante.',
      );
    }

    const enrollment = this.enrollments.find(
      (e) =>
        e.user_id === profile.id &&
        e.course_mapping_id === courseMappingId &&
        (e.status === 'autorizada' || e.status === 'sincronizada'),
    );

    if (!enrollment) {
      throw new ForbiddenException(
        'Acceso denegado: No cuentas con matrícula ni autorización vigente para este curso en Moodle (CA-12 / CA-13).',
      );
    }

    const course = this.courseMappings.find((c) => c.id === courseMappingId);
    if (!course) {
      throw new NotFoundException('Curso no encontrado.');
    }

    if (!profile.moodle_user_id) {
      throw new BadRequestException(
        'Tu perfil aún no tiene un moodle_user_id sincronizado. Solicita sincronización al administrador.',
      );
    }

    this.recordAudit({
      actor_id: profile.id,
      target_user_id: profile.id,
      action: 'CAMPUS_MOODLE_SSO_LAUNCH',
      entity_type: 'course_mappings',
      entity_id: course.id,
      details: {
        moodle_course_id: course.moodle_course_id,
        moodle_shortname: course.moodle_shortname,
        moodle_role: enrollment.moodle_role,
      },
    });

    return this.moodleService.generateCampusSsoLaunchUrl({
      userId: profile.id,
      moodleUserId: profile.moodle_user_id,
      moodleCourseId: course.moodle_course_id,
      moodleShortname: course.moodle_shortname,
      courseRole: enrollment.moodle_role,
    });
  }

  // ---------------------------------------------------------------------------
  // OPERACIONES ADMINISTRATIVAS Y SINCRONIZACIÓN CON MOODLE (Sección 10)
  // ---------------------------------------------------------------------------
  listUsersForAdmin(filters?: { search?: string; role?: string; status?: string }) {
    let list = this.profiles.map((profile) => {
      const roles = this.getUserRoles(profile.id);
      const userPrograms = this.userPrograms
        .filter((up) => up.user_id === profile.id)
        .map((up) => {
          const prog = this.programs.find((p) => p.id === up.program_id);
          return {
            id: up.id,
            program_id: up.program_id,
            program_title: prog?.title || '',
            program_code: prog?.code || '',
            academic_status: up.academic_status,
          };
        });

      const userEnrollments = this.enrollments
        .filter((e) => e.user_id === profile.id)
        .map((e) => {
          const course = this.courseMappings.find((c) => c.id === e.course_mapping_id);
          return {
            id: e.id,
            course_mapping_id: e.course_mapping_id,
            course_code: course?.course_code || '',
            course_name: course?.course_name || '',
            moodle_course_id: course?.moodle_course_id || null,
            moodle_role: e.moodle_role,
            status: e.status,
            moodle_synced_at: e.moodle_synced_at,
          };
        });

      return {
        ...profile,
        roles,
        primaryRole: this.getPrimaryRole(roles),
        programs: userPrograms,
        enrollments: userEnrollments,
      };
    });

    if (filters?.search) {
      const q = filters.search.trim().toLowerCase();
      list = list.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          u.first_name.toLowerCase().includes(q) ||
          u.last_name.toLowerCase().includes(q),
      );
    }

    if (filters?.role && filters.role !== 'todos') {
      list = list.filter((u) => u.roles.includes(filters.role as RoleCode));
    }

    if (filters?.status && filters.status !== 'todos') {
      list = list.filter((u) => u.status === filters.status);
    }

    return list;
  }

  getAllCoursesForAdmin() {
    return this.courseMappings.map((course) => {
      const enrolledCount = this.enrollments.filter(
        (e) => e.course_mapping_id === course.id && e.status === 'sincronizada',
      ).length;
      return {
        ...course,
        enrolledCount,
      };
    });
  }

  /**
   * Sección 10 y Flujos 7.1, 7.2, 7.3:
   * Cambia rol, estado y/o programa de un usuario, audita la operación y sincroniza con Moodle si procede.
   */
  async updateUserRoleAndStatus(
    actorCtx: AuthenticatedUserContext,
    targetUserId: string,
    payload: {
      role_code?: RoleCode;
      status?: UserStatus;
      program_id?: string;
      sync_moodle?: boolean;
    },
  ) {
    const profile = this.profiles.find((p) => p.id === targetUserId);
    if (!profile) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const previousRoles = this.getUserRoles(targetUserId);
    const previousStatus = profile.status;
    const now = new Date().toISOString();

    if (payload.role_code) {
      const validRole = this.roles.find((r) => r.code === payload.role_code);
      if (!validRole) {
        throw new BadRequestException(`Rol '${payload.role_code}' inválido.`);
      }
      this.userRoles = this.userRoles.filter((ur) => ur.user_id !== targetUserId);
      this.userRoles.push({
        user_id: targetUserId,
        role_code: payload.role_code,
        assigned_at: now,
      });
    }

    if (payload.status) {
      profile.status = payload.status;
      profile.updated_at = now;
    }

    if (payload.program_id) {
      const prog = this.programs.find((p) => p.id === payload.program_id);
      if (!prog) {
        throw new BadRequestException('Programa académico no encontrado.');
      }
      const existingProg = this.userPrograms.find(
        (up) => up.user_id === targetUserId && up.program_id === payload.program_id,
      );
      if (!existingProg) {
        this.userPrograms.push({
          id: `up-${crypto.randomUUID().slice(0, 8)}`,
          user_id: targetUserId,
          program_id: prog.id,
          academic_status: 'inscrito',
          authorized_by: actorCtx.profile.id,
          enrolled_at: now,
        });
      } else {
        existingProg.academic_status = 'inscrito';
      }
    }

    let moodleSyncResult: any = null;
    const updatedRoles = this.getUserRoles(targetUserId);
    const shouldSyncMoodle =
      payload.sync_moodle !== false &&
      profile.status === 'activo' &&
      (updatedRoles.includes('estudiante') || updatedRoles.includes('profesor'));

    if (shouldSyncMoodle) {
      moodleSyncResult = await this.syncUserWithMoodle(actorCtx, targetUserId);
    }

    this.recordAudit({
      actor_id: actorCtx.profile.id,
      target_user_id: targetUserId,
      action: 'USER_ROLE_OR_STATUS_UPDATED',
      entity_type: 'profiles',
      entity_id: targetUserId,
      details: {
        previous_roles: previousRoles,
        new_roles: updatedRoles,
        previous_status: previousStatus,
        new_status: profile.status,
        program_id: payload.program_id || null,
        moodle_user_id: profile.moodle_user_id,
      },
    });

    return {
      user: this.listUsersForAdmin().find((u) => u.id === targetUserId),
      moodleSyncResult,
    };
  }

  /**
   * Sincroniza la identidad de un usuario con Moodle evitando duplicados (CA-10).
   */
  async syncUserWithMoodle(actorCtx: AuthenticatedUserContext, targetUserId: string) {
    const profile = this.profiles.find((p) => p.id === targetUserId);
    if (!profile) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const syncRes = await this.moodleService.findOrCreateMoodleUser(profile);
    profile.moodle_user_id = syncRes.moodleUserId;
    profile.moodle_sync_status = 'sincronizado';
    profile.moodle_last_sync_at = new Date().toISOString();
    profile.updated_at = profile.moodle_last_sync_at;

    this.recordAudit({
      actor_id: actorCtx.profile.id,
      target_user_id: profile.id,
      action: 'MOODLE_USER_SYNCED',
      entity_type: 'profiles',
      entity_id: profile.id,
      details: {
        moodle_user_id: syncRes.moodleUserId,
        created_new_in_moodle: syncRes.createdNew,
        mode: syncRes.mode,
        message: syncRes.message,
      },
    });

    return syncRes;
  }

  /**
   * Autoriza y ejecuta la matrícula de un usuario (Estudiante o Profesor) en un curso de Moodle (Sección 8.2, 10, CA-12, CA-13).
   */
  async authorizeAndEnrolCourse(
    actorCtx: AuthenticatedUserContext,
    payload: {
      user_id: string;
      course_mapping_id: string;
      moodle_role?: 'student' | 'editingteacher';
      notes?: string;
    },
  ) {
    const profile = this.profiles.find((p) => p.id === payload.user_id);
    if (!profile) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    const course = this.courseMappings.find((c) => c.id === payload.course_mapping_id);
    if (!course) {
      throw new NotFoundException('Curso de Moodle no encontrado en course_mappings.');
    }

    const userRoles = this.getUserRoles(profile.id);
    const resolvedMoodleRole: 'student' | 'editingteacher' =
      payload.moodle_role ||
      (userRoles.includes('profesor') ? 'editingteacher' : 'student');

    // Validar coherencia entre el rol en el portal y el rol en Moodle
    if (resolvedMoodleRole === 'editingteacher' && !userRoles.includes('profesor')) {
      throw new BadRequestException(
        'Solo un usuario con rol Profesor en el portal puede recibir el rol Teacher (editingteacher) en Moodle (CA-13).',
      );
    }

    if (
      resolvedMoodleRole === 'student' &&
      !userRoles.includes('estudiante') &&
      !userRoles.includes('profesor')
    ) {
      throw new BadRequestException(
        'El usuario debe tener rol Estudiante autorizado antes de ser matriculado en un curso de Moodle (CA-12).',
      );
    }

    // Asegurar que el usuario esté activo y vinculado en Moodle sin duplicados (CA-10)
    if (profile.status !== 'activo') {
      profile.status = 'activo';
    }
    if (!profile.moodle_user_id) {
      await this.syncUserWithMoodle(actorCtx, profile.id);
    }

    const moodleEnrolRes = await this.moodleService.enrolUserInCourse({
      moodleUserId: profile.moodle_user_id!,
      moodleCourseId: course.moodle_course_id,
      roleName: resolvedMoodleRole,
    });

    const now = new Date().toISOString();
    let enrollment = this.enrollments.find(
      (e) =>
        e.user_id === profile.id && e.course_mapping_id === course.id,
    );

    if (enrollment) {
      enrollment.moodle_role = resolvedMoodleRole;
      enrollment.status = 'sincronizada';
      enrollment.authorized_by = actorCtx.profile.id;
      enrollment.authorized_at = now;
      enrollment.moodle_synced_at = now;
      enrollment.notes = payload.notes || enrollment.notes;
    } else {
      enrollment = {
        id: `enr-${crypto.randomUUID().slice(0, 8)}`,
        user_id: profile.id,
        course_mapping_id: course.id,
        moodle_role: resolvedMoodleRole,
        status: 'sincronizada',
        authorized_by: actorCtx.profile.id,
        authorized_at: now,
        moodle_synced_at: now,
        notes: payload.notes || 'Autorizada y sincronizada desde Panel Administrativo',
        created_at: now,
      };
      this.enrollments.push(enrollment);
    }

    this.recordAudit({
      actor_id: actorCtx.profile.id,
      target_user_id: profile.id,
      action:
        resolvedMoodleRole === 'editingteacher'
          ? 'MOODLE_TEACHER_ASSIGNED'
          : 'MOODLE_STUDENT_ENROLLED',
      entity_type: 'enrollment_requests',
      entity_id: enrollment.id,
      details: {
        course_code: course.course_code,
        course_name: course.course_name,
        moodle_course_id: course.moodle_course_id,
        moodle_user_id: profile.moodle_user_id,
        moodle_role: resolvedMoodleRole,
      },
    });

    return {
      enrollment,
      moodleEnrolResult: moodleEnrolRes,
    };
  }

  /**
   * Desmatricula a un usuario de un curso y actualiza su estado en enrollment_requests.
   */
  async revokeCourseEnrollment(actorCtx: AuthenticatedUserContext, enrollmentId: string) {
    const idx = this.enrollments.findIndex((e) => e.id === enrollmentId);
    if (idx === -1) {
      throw new NotFoundException('Matrícula no encontrada.');
    }

    const enrollment = this.enrollments[idx];
    const profile = this.profiles.find((p) => p.id === enrollment.user_id);
    const course = this.courseMappings.find((c) => c.id === enrollment.course_mapping_id);

    if (profile?.moodle_user_id && course) {
      await this.moodleService.unenrolUserFromCourse({
        moodleUserId: profile.moodle_user_id,
        moodleCourseId: course.moodle_course_id,
        roleName: enrollment.moodle_role,
      });
    }

    this.enrollments.splice(idx, 1);

    this.recordAudit({
      actor_id: actorCtx.profile.id,
      target_user_id: enrollment.user_id,
      action: 'MOODLE_COURSE_UNENROLLED',
      entity_type: 'enrollment_requests',
      entity_id: enrollmentId,
      details: {
        course_code: course?.course_code,
        moodle_course_id: course?.moodle_course_id,
      },
    });

    return { revoked: true, enrollmentId };
  }

  getAuditLogs(limit = 50): AuditLogRecord[] {
    return this.auditLogs.slice(0, limit);
  }

  private recordAudit(entry: {
    actor_id: string | null;
    target_user_id: string | null;
    action: string;
    entity_type: string;
    entity_id: string;
    details: Record<string, unknown>;
  }) {
    const actor = entry.actor_id
      ? this.profiles.find((p) => p.id === entry.actor_id)
      : undefined;
    const target = entry.target_user_id
      ? this.profiles.find((p) => p.id === entry.target_user_id)
      : undefined;

    this.auditLogs.unshift({
      id: `audit-${crypto.randomUUID().slice(0, 8)}`,
      actor_id: entry.actor_id,
      actor_email: actor?.email || 'sistema@iinicia.edu.mx',
      target_user_id: entry.target_user_id,
      target_user_email: target?.email || undefined,
      action: entry.action,
      entity_type: entry.entity_type,
      entity_id: entry.entity_id,
      details: entry.details,
      created_at: new Date().toISOString(),
    });
  }
}
