-- =============================================================================
-- TESE (Portal Institucional) - Datos Semilla (Roles, 9 Ingenierías y Cursos Moodle)
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

-- 2. Catálogo de las 9 Ingenierías del TESE (Sección 9.1 - Oferta académica)
INSERT INTO public.programs (id, slug, code, title, type, modality, duration, summary, description, is_active)
VALUES
    (
        '11111111-1111-4111-8111-111111111101',
        'ingenieria-mecatronica',
        'ING-MEC-01',
        'Ingeniería Mecatrónica',
        'licenciatura',
        'Escolarizada y Apoyo en Campus Moodle',
        '9 Semestres',
        'Enfocada en la integración de mecánica, electrónica y sistemas de control para automatizar procesos.',
        'Forma profesionales capaces de diseñar, integrar y automatizar sistemas mecatrónicos, robóticos y de manufactura avanzada mediante mecánica de precisión, electrónica de potencia, microcontroladores y PLC.',
        true
    ),
    (
        '11111111-1111-4111-8111-111111111102',
        'ingenieria-industrial',
        'ING-IND-02',
        'Ingeniería Industrial',
        'licenciatura',
        'Escolarizada y Apoyo en Campus Moodle',
        '9 Semestres',
        'Orientada a la optimización de procesos, gestión de calidad, manufactura y logística.',
        'Prepara ingenieros líderes en la mejora continua de sistemas productivos, ergonomía, investigación de operaciones, control estadístico de la calidad y cadenas de suministro.',
        true
    ),
    (
        '11111111-1111-4111-8111-111111111103',
        'ingenieria-quimica',
        'ING-QUI-03',
        'Ingeniería Química',
        'licenciatura',
        'Escolarizada y Apoyo en Campus Moodle',
        '9 Semestres',
        'Centrada en la transformación de materias primas, diseño de reactores y termodinámica.',
        'Desarrolla competencias en fenómenos de transporte, operaciones unitarias, cinética química, diseño de reactores, simulación y optimización de procesos industriales sustentables.',
        true
    ),
    (
        '11111111-1111-4111-8111-111111111104',
        'ingenieria-bioquimica',
        'ING-BIO-04',
        'Ingeniería Bioquímica',
        'licenciatura',
        'Escolarizada y Apoyo en Campus Moodle',
        '9 Semestres',
        'Aplicación de procesos biológicos y químicos en las industrias alimentaria y farmacéutica.',
        'Integra microbiología industrial, bioquímica, ingeniería de biorreactores y operaciones unitarias para el desarrollo e innovación en alimentos, fármacos y bioprocesos.',
        true
    ),
    (
        '11111111-1111-4111-8111-111111111105',
        'ingenieria-aeronautica',
        'ING-AER-05',
        'Ingeniería Aeronáutica',
        'licenciatura',
        'Escolarizada y Apoyo en Campus Moodle',
        '9 Semestres',
        'Diseño, manufactura y mantenimiento de aeronaves y sistemas aeroespaciales.',
        'Especializa en aerodinámica, estructuras aeronáuticas, sistemas de propulsión, dinámica y control de vuelo, manufactura y legislación aeronáutica.',
        true
    ),
    (
        '11111111-1111-4111-8111-111111111106',
        'ingenieria-gestion-empresarial',
        'ING-IGE-06',
        'Ingeniería en Gestión Empresarial',
        'licenciatura',
        'Escolarizada y Apoyo en Campus Moodle',
        '9 Semestres',
        'Combinación de administración de negocios, finanzas e ingeniería de procesos.',
        'Forma estrategas organizacionales en finanzas corporativas, capital humano, mercadotecnia, innovación, gestión de la producción y dirección estratégica.',
        true
    ),
    (
        '11111111-1111-4111-8111-111111111107',
        'ingenieria-electromecanica',
        'ING-IEM-07',
        'Ingeniería Electromecánica',
        'licenciatura',
        'Escolarizada y Apoyo en Campus Moodle',
        '9 Semestres',
        'Integración de sistemas eléctricos, mecánicos y térmicos para la industria.',
        'Capacita en el análisis, diseño y mantenimiento de máquinas eléctricas, subestaciones, sistemas hidráulicos y neumáticos, transferencia de calor, refrigeración y automatización.',
        true
    ),
    (
        '11111111-1111-4111-8111-111111111108',
        'ingenieria-electronica',
        'ING-IEL-08',
        'Ingeniería Electrónica',
        'licenciatura',
        'Escolarizada y Apoyo en Campus Moodle',
        '9 Semestres',
        'Diseño de hardware, telecomunicaciones, instrumentación y control analógico/digital.',
        'Enfocada en semiconductores, diseño digital con VHDL, amplificadores operacionales, microcontroladores, optoelectrónica, sistemas de comunicación y control.',
        true
    ),
    (
        '11111111-1111-4111-8111-111111111109',
        'ingenieria-logistica',
        'ING-LOG-09',
        'Ingeniería en Logística',
        'licenciatura',
        'Escolarizada y Apoyo en Campus Moodle',
        '9 Semestres',
        'Diseño, operación y mejora de cadenas de suministro, transporte y almacenes.',
        'Prepara especialistas en tráfico y transporte, legislación aduanera, gestión de inventarios, almacenes, envase y embalaje, simulación logística y servicio al cliente.',
        true
    )
ON CONFLICT (code) DO UPDATE SET
    slug = EXCLUDED.slug,
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
