-- =============================================================================
-- IINICIA - Datos Semilla (Roles, Programas y Cursos obligatorios de Moodle)
-- Cumple con la Sección 6 (Roles) y Sección 8.1 (Dos cursos de ejemplo obligatorios)
-- =============================================================================

-- 1. Catálogo de Roles (Sección 6)
INSERT INTO public.roles (code, name, description, moodle_archetype)
VALUES
    ('superadmin', 'Superadministrador', 'Configuración global, usuarios, roles, integraciones, parámetros y auditoría.', 'manager'),
    ('admin', 'Administrador', 'Gestión de usuarios, estados, programas, autorizaciones e inscripciones.', 'manager'),
    ('coordinador', 'Coordinador', 'Consulta y gestión de usuarios/programas bajo su ámbito.', 'coursecreator'),
    ('profesor', 'Profesor', 'Perfil docente, consulta de cursos asignados y acceso al campus con rol Teacher.', 'editingteacher'),
    ('estudiante', 'Estudiante', 'Perfil, programa, cursos asignados y acceso al campus con rol Student.', 'student'),
    ('aspirante', 'Aspirante', 'Registro, actualización de datos y seguimiento de admisión. Sin acceso a cursos hasta ser autorizado.', 'none'),
    ('soporte', 'Soporte', 'Atención operativa limitada y consulta controlada.', 'none')
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    moodle_archetype = EXCLUDED.moodle_archetype;

-- 2. Catálogo de Programas Académicos (Sección 9.1 - Oferta académica)
INSERT INTO public.programs (id, slug, code, title, type, modality, duration, summary, description, is_active)
VALUES
    (
        '11111111-1111-4111-8111-111111111101',
        'ingenieria-software-ti',
        'LIC-ISTI-01',
        'Licenciatura en Ingeniería de Software y Tecnologías de la Información',
        'licenciatura',
        'En línea (Campus Moodle)',
        '9 Cuatrimestres',
        'Formación integral en arquitectura de software, desarrollo web moderno, bases de datos y gestión de infraestructura tecnológica.',
        'Programa universitario diseñado para formar profesionales capaces de diseñar, construir y operar plataformas digitales empresariales y educativas con estándares modernos de seguridad y escalabilidad.',
        true
    ),
    (
        '11111111-1111-4111-8111-111111111102',
        'diplomado-desarrollo-web-fullstack',
        'DIP-FS-02',
        'Diplomado en Desarrollo Web Full-Stack con React y Node.js',
        'diplomado',
        'En línea (Campus Moodle)',
        '160 Horas (4 Módulos)',
        'Especialización práctica en interfaces modernas con React, Next.js, TypeScript y arquitecturas backend orientadas a servicios.',
        'Diplomado intensivo enfocado en el dominio práctico de aplicaciones web con React, Next.js, NestJS y bases de datos relacionales con control de acceso basado en roles.',
        true
    ),
    (
        '11111111-1111-4111-8111-111111111103',
        'certificacion-arquitectura-cloud-seguridad',
        'CERT-ACS-03',
        'Certificación en Arquitectura Cloud y Seguridad Aplicada',
        'certificacion',
        'En línea (Campus Moodle)',
        '80 Horas',
        'Diseño de sistemas seguros, identidad federada, protección de APIs, Row Level Security y cumplimiento normativo.',
        'Certificación técnica orientada a arquitectos y líderes técnicos que implementan sistemas seguros e integraciones institucionales.',
        true
    )
ON CONFLICT (code) DO UPDATE SET
    title = EXCLUDED.title,
    summary = EXCLUDED.summary,
    description = EXCLUDED.description;

-- 3. Mapeo de los Dos Cursos de Ejemplo Obligatorios en Moodle (Sección 8.1)
INSERT INTO public.course_mappings (
    id,
    program_id,
    course_code,
    course_name,
    moodle_course_id,
    moodle_shortname,
    moodle_category_id,
    description,
    is_active
)
VALUES
    (
        '22222222-2222-4222-8222-222222222201',
        '11111111-1111-4111-8111-111111111101',
        'TI-101',
        'Curso 1. Introducción a las Tecnologías de la Información',
        101,
        'IINICIA-TI-101',
        1,
        'Incluye: Presentación del curso, recurso PDF/página, foro de bienvenida, tarea evaluable, cuestionario diagnóstico, libro de calificaciones y criterios de finalización de actividad.',
        true
    ),
    (
        '22222222-2222-4222-8222-222222222202',
        '11111111-1111-4111-8111-111111111102',
        'WEB-202',
        'Curso 2. Desarrollo Web con React',
        102,
        'IINICIA-REACT-202',
        1,
        'Incluye: Unidades temáticas (JSX, Hooks, Next.js), recursos técnicos, actividad práctica entregable, foro técnico, evaluación final, calificación y finalización de curso.',
        true
    )
ON CONFLICT (course_code) DO UPDATE SET
    course_name = EXCLUDED.course_name,
    moodle_course_id = EXCLUDED.moodle_course_id,
    moodle_shortname = EXCLUDED.moodle_shortname,
    description = EXCLUDED.description;
