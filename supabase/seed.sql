-- =============================================================================
-- TESE (Portal Institucional) - Datos Semilla Completos
-- Incluye: 7 Roles, las 9 Ingenierías con sus 9 Semestres (JSONB) y los 2 Cursos Moodle
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

-- 2. Catálogo de las 9 Ingenierías del TESE con sus 9 Semestres (Sección 9.1)
INSERT INTO public.programs (id, slug, code, title, type, modality, duration, summary, description, semesters, is_active)
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
        '[
          {"semester": 1, "title": "Semestre 1", "subjects": ["Cálculo Diferencial", "Química", "Taller de Ética", "Fundamentos de Investigación", "Dibujo Electromecánico", "Metrología y Normalización"]},
          {"semester": 2, "title": "Semestre 2", "subjects": ["Cálculo Integral", "Álgebra Lineal", "Física", "Programación Básica", "Ciencia e Ingeniería de Materiales", "Estadística y Control de Calidad"]},
          {"semester": 3, "title": "Semestre 3", "subjects": ["Cálculo Vectorial", "Electromagnetismo", "Estática", "Procesos de Fabricación", "Dinámica", "Desarrollo Sustentable"]},
          {"semester": 4, "title": "Semestre 4", "subjects": ["Ecuaciones Diferenciales", "Análisis de Circuitos Eléctricos", "Mecánica de Materiales", "Fundamentos de Termodinámica", "Máquinas Eléctricas", "Métodos Numéricos"]},
          {"semester": 5, "title": "Semestre 5", "subjects": ["Electrónica Analógica", "Análisis y Síntesis de Mecanismos", "Microcontroladores", "Instrumentación", "Taller de Investigación I", "Dinámica de Sistemas"]},
          {"semester": 6, "title": "Semestre 6", "subjects": ["Electrónica de Potencia", "Diseño de Elementos Mecánicos", "Mantenimiento", "Taller de Investigación II", "Control", "Electrónica Digital"]},
          {"semester": 7, "title": "Semestre 7", "subjects": ["Robótica", "Controladores Lógicos Programables (PLC)", "Manufactura Avanzada", "Materias de Especialidad"]},
          {"semester": 8, "title": "Semestre 8", "subjects": ["Formulación y Evaluación de Proyectos", "Interfases y Redes Industriales", "Materias de Especialidad"]},
          {"semester": 9, "title": "Semestre 9", "subjects": ["Residencia Profesional"]}
        ]'::jsonb,
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
        '[
          {"semester": 1, "title": "Semestre 1", "subjects": ["Cálculo Diferencial", "Fundamentos de Investigación", "Taller de Ética", "Química", "Dibujo Industrial", "Taller de Herramientas Intelectuales"]},
          {"semester": 2, "title": "Semestre 2", "subjects": ["Cálculo Integral", "Probabilidad y Estadística", "Análisis de la Realidad Nacional", "Propiedad de los Materiales", "Electricidad y Electrónica Industrial", "Taller de Liderazgo"]},
          {"semester": 3, "title": "Semestre 3", "subjects": ["Cálculo Vectorial", "Estadística Inferencial I", "Estudio del Trabajo I", "Economía", "Álgebra Lineal", "Metrología y Normalización"]},
          {"semester": 4, "title": "Semestre 4", "subjects": ["Ecuaciones Diferenciales", "Estadística Inferencial II", "Estudio del Trabajo II", "Investigación de Operaciones I", "Procesos de Fabricación", "Higiene y Seguridad Industrial"]},
          {"semester": 5, "title": "Semestre 5", "subjects": ["Desarrollo Sustentable", "Administración de Proyectos", "Gestión de Costos", "Investigación de Operaciones II", "Ergonomía", "Control Estadístico de la Calidad"]},
          {"semester": 6, "title": "Semestre 6", "subjects": ["Taller de Investigación I", "Ingeniería Económica", "Administración del Mantenimiento", "Sistemas de Manufactura", "Diseño de Experimentos", "Logística y Cadenas de Suministro"]},
          {"semester": 7, "title": "Semestre 7", "subjects": ["Planeación Financiera", "Planeación y Diseño de Instalaciones", "Sistemas de Producción", "Taller de Investigación II", "Materias de Especialidad"]},
          {"semester": 8, "title": "Semestre 8", "subjects": ["Formulación y Evaluación de Proyectos", "Relaciones Industriales", "Materias de Especialidad"]},
          {"semester": 9, "title": "Semestre 9", "subjects": ["Residencia Profesional"]}
        ]'::jsonb,
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
        '[
          {"semester": 1, "title": "Semestre 1", "subjects": ["Cálculo Diferencial", "Química Inorgánica", "Taller de Ética", "Fundamentos de Investigación", "Dibujo", "Mecánica Clásica"]},
          {"semester": 2, "title": "Semestre 2", "subjects": ["Cálculo Integral", "Álgebra Lineal", "Química Analítica", "Química Orgánica I", "Probabilidad y Estadística", "Termodinámica"]},
          {"semester": 3, "title": "Semestre 3", "subjects": ["Cálculo Vectorial", "Química Orgánica II", "Fisicoquímica I", "Balance de Materia y Energía", "Ecuaciones Diferenciales", "Desarrollo Sustentable"]},
          {"semester": 4, "title": "Semestre 4", "subjects": ["Métodos Numéricos", "Termodinámica", "Fisicoquímica II", "Fenómenos de Transporte I", "Análisis Instrumental", "Programación"]},
          {"semester": 5, "title": "Semestre 5", "subjects": ["Cinética Química y Biológica", "Operaciones Unitarias I", "Fenómenos de Transporte II", "Taller de Investigación I", "Legislación", "Ingeniería Ambiental"]},
          {"semester": 6, "title": "Semestre 6", "subjects": ["Diseño de Reactores", "Operaciones Unitarias II", "Dinámica y Control de Procesos", "Taller de Investigación II", "Seguridad e Higiene Industrial"]},
          {"semester": 7, "title": "Semestre 7", "subjects": ["Simulación de Procesos", "Operaciones Unitarias III", "Síntesis y Optimización de Procesos", "Especialidad"]},
          {"semester": 8, "title": "Semestre 8", "subjects": ["Formulación y Evaluación de Proyectos", "Ingeniería Económica", "Especialidad"]},
          {"semester": 9, "title": "Semestre 9", "subjects": ["Residencia Profesional"]}
        ]'::jsonb,
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
        '[
          {"semester": 1, "title": "Semestre 1", "subjects": ["Cálculo Diferencial", "Química Inorgánica", "Biología", "Taller de Ética", "Fundamentos de Investigación", "Dibujo"]},
          {"semester": 2, "title": "Semestre 2", "subjects": ["Cálculo Integral", "Química Analítica", "Física I", "Álgebra Lineal", "Probabilidad y Estadística", "Programación"]},
          {"semester": 3, "title": "Semestre 3", "subjects": ["Cálculo Vectorial", "Química Orgánica I", "Física II", "Fisicoquímica", "Bioquímica I", "Microbiología"]},
          {"semester": 4, "title": "Semestre 4", "subjects": ["Ecuaciones Diferenciales", "Química Orgánica II", "Termodinámica", "Bioquímica II", "Microbiología Industrial", "Métodos Numéricos"]},
          {"semester": 5, "title": "Semestre 5", "subjects": ["Operaciones Unitarias I", "Cinética Química y Biológica", "Taller de Investigación I", "Biología Celular", "Desarrollo Sustentable", "Ingeniería de Bioprocesos"]},
          {"semester": 6, "title": "Semestre 6", "subjects": ["Operaciones Unitarias II", "Ingeniería de Biorreactores", "Instrumentación y Control", "Taller de Investigación II", "Fenómenos de Transporte"]},
          {"semester": 7, "title": "Semestre 7", "subjects": ["Operaciones Unitarias III", "Formulación y Evaluación de Proyectos", "Tecnología de Alimentos/Fármacos (según especialidad)", "Especialidad"]},
          {"semester": 8, "title": "Semestre 8", "subjects": ["Ingeniería Económica", "Administración y Legislación", "Especialidad"]},
          {"semester": 9, "title": "Semestre 9", "subjects": ["Residencia Profesional"]}
        ]'::jsonb,
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
        '[
          {"semester": 1, "title": "Semestre 1", "subjects": ["Cálculo Diferencial", "Álgebra Lineal", "Taller de Ética", "Química", "Dibujo Aeronáutico", "Fundamentos de Investigación"]},
          {"semester": 2, "title": "Semestre 2", "subjects": ["Cálculo Integral", "Mecánica Clásica", "Probabilidad y Estadística", "Ciencia de Materiales Aeronáuticos", "Termodinámica", "Programación"]},
          {"semester": 3, "title": "Semestre 3", "subjects": ["Cálculo Vectorial", "Estática", "Electromagnetismo", "Mecánica de Fluidos", "Ecuaciones Diferenciales", "Desarrollo Sustentable"]},
          {"semester": 4, "title": "Semestre 4", "subjects": ["Dinámica", "Mecánica de Materiales", "Aerodinámica", "Análisis de Circuitos", "Métodos Numéricos", "Electrónica"]},
          {"semester": 5, "title": "Semestre 5", "subjects": ["Aerodinámica de Alta Velocidad", "Estructuras Aeronáuticas", "Taller de Investigación I", "Sistemas de Aeronaves", "Propulsión", "Instrumentación Aeronáutica"]},
          {"semester": 6, "title": "Semestre 6", "subjects": ["Desempeño de Aeronaves", "Diseño de Elementos de Máquinas", "Taller de Investigación II", "Manufactura Aeronáutica", "Dinámica de Vuelo"]},
          {"semester": 7, "title": "Semestre 7", "subjects": ["Mantenimiento Aeronáutico", "Diseño Aeronáutico", "Control de Vuelo", "Materias de Especialidad"]},
          {"semester": 8, "title": "Semestre 8", "subjects": ["Administración de Operaciones Aeronáuticas", "Legislación Aeronáutica", "Especialidad"]},
          {"semester": 9, "title": "Semestre 9", "subjects": ["Residencia Profesional"]}
        ]'::jsonb,
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
        '[
          {"semester": 1, "title": "Semestre 1", "subjects": ["Fundamentos de Investigación", "Cálculo Diferencial", "Desarrollo Humano", "Fundamentos de Gestión Empresarial", "Física", "Dinámica Social"]},
          {"semester": 2, "title": "Semestre 2", "subjects": ["Software de Aplicación Ejecutivo", "Cálculo Integral", "Contabilidad Orientada a los Negocios", "Dinámica de la Empresa", "Estadística para la Administración I", "Legislación Laboral"]},
          {"semester": 3, "title": "Semestre 3", "subjects": ["Marco Legal de las Organizaciones", "Probabilidad y Estadística Descriptiva", "Costos Empresariales", "Habilidades Directivas I", "Economía Empresarial", "Álgebra Lineal"]},
          {"semester": 4, "title": "Semestre 4", "subjects": ["Ingeniería Económica", "Estadística para la Administración II", "Instrumentos de Presupuestación", "Habilidades Directivas II", "Entorno Macroeconómico", "Investigación de Operaciones"]},
          {"semester": 5, "title": "Semestre 5", "subjects": ["Finanzas en las Organizaciones", "Diseño Organizacional", "Gestión del Capital Humano", "Taller de Investigación I", "Mercadotecnia", "Desarrollo Sustentable"]},
          {"semester": 6, "title": "Semestre 6", "subjects": ["Administración de la Salud y Seguridad Ocupacional", "El Emprendedor y la Innovación", "Gestión de la Producción I", "Taller de Investigación II", "Sistemas de Información de Mercadotecnia"]},
          {"semester": 7, "title": "Semestre 7", "subjects": ["Plan de Negocios", "Gestión de la Producción II", "Calidad Aplicada a la Gestión Empresarial", "Materias de Especialidad"]},
          {"semester": 8, "title": "Semestre 8", "subjects": ["Gestión Estratégica", "Cadena de Suministros", "Materias de Especialidad"]},
          {"semester": 9, "title": "Semestre 9", "subjects": ["Residencia Profesional"]}
        ]'::jsonb,
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
        '[
          {"semester": 1, "title": "Semestre 1", "subjects": ["Cálculo Diferencial", "Química", "Taller de Ética", "Fundamentos de Investigación", "Dibujo Electromecánico", "Introducción a la Programación"]},
          {"semester": 2, "title": "Semestre 2", "subjects": ["Cálculo Integral", "Álgebra Lineal", "Mecánica Clásica", "Tecnología de los Materiales", "Probabilidad y Estadística", "Metrología y Normalización"]},
          {"semester": 3, "title": "Semestre 3", "subjects": ["Cálculo Vectorial", "Electricidad y Magnetismo", "Estática", "Procesos de Manufactura", "Electrónica Analógica", "Desarrollo Sustentable"]},
          {"semester": 4, "title": "Semestre 4", "subjects": ["Ecuaciones Diferenciales", "Dinámica", "Mecánica de Materiales", "Análisis de Circuitos", "Termodinámica", "Métodos Numéricos"]},
          {"semester": 5, "title": "Semestre 5", "subjects": ["Máquinas Eléctricas", "Mecánica de Fluidos", "Diseño de Elementos de Máquinas", "Instalaciones Eléctricas", "Taller de Investigación I"]},
          {"semester": 6, "title": "Semestre 6", "subjects": ["Controles Eléctricos", "Transferencia de Calor", "Electrónica Industrial", "Sistemas Hidráulicos y Neumáticos", "Taller de Investigación II"]},
          {"semester": 7, "title": "Semestre 7", "subjects": ["Refrigeración y Aire Acondicionado", "Subestaciones Eléctricas", "Automatización", "Materias de Especialidad"]},
          {"semester": 8, "title": "Semestre 8", "subjects": ["Formulación y Evaluación de Proyectos", "Mantenimiento Industrial", "Especialidad"]},
          {"semester": 9, "title": "Semestre 9", "subjects": ["Residencia Profesional"]}
        ]'::jsonb,
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
        '[
          {"semester": 1, "title": "Semestre 1", "subjects": ["Cálculo Diferencial", "Física I (Mecánica)", "Química", "Taller de Ética", "Fundamentos de Investigación", "Comunicación Humana"]},
          {"semester": 2, "title": "Semestre 2", "subjects": ["Cálculo Integral", "Física II (Electromagnetismo)", "Álgebra Lineal", "Probabilidad y Estadística", "Programación Estructurada", "Dibujo Asistido por Computadora"]},
          {"semester": 3, "title": "Semestre 3", "subjects": ["Cálculo Vectorial", "Ecuaciones Diferenciales", "Física de Semiconductores", "Mediciones Eléctricas", "Programación Visual", "Desarrollo Sustentable"]},
          {"semester": 4, "title": "Semestre 4", "subjects": ["Análisis de Circuitos Eléctricos", "Electrónica Analógica", "Diseño Digital", "Métodos Numéricos", "Máquinas Eléctricas", "Teoría Electromagnética"]},
          {"semester": 5, "title": "Semestre 5", "subjects": ["Taller de Investigación I", "Amplificadores Operacionales", "Microcontroladores", "Diseño Digital con VHDL", "Instrumentación", "Fundamentos de Telecomunicaciones"]},
          {"semester": 6, "title": "Semestre 6", "subjects": ["Taller de Investigación II", "Control I", "Electrónica de Potencia", "Optoelectrónica", "Sistemas de Comunicación"]},
          {"semester": 7, "title": "Semestre 7", "subjects": ["Control II", "PLC y Automatización", "Materias de Especialidad"]},
          {"semester": 8, "title": "Semestre 8", "subjects": ["Formulación y Evaluación de Proyectos", "Administración Gerencial", "Especialidad"]},
          {"semester": 9, "title": "Semestre 9", "subjects": ["Residencia Profesional"]}
        ]'::jsonb,
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
        '[
          {"semester": 1, "title": "Semestre 1", "subjects": ["Introducción a la Ingeniería en Logística", "Cálculo Diferencial", "Química", "Fundamentos de Investigación", "Taller de Ética", "Economía"]},
          {"semester": 2, "title": "Semestre 2", "subjects": ["Cálculo Integral", "Probabilidad y Estadística", "Álgebra Lineal", "Dinámica Social", "Fundamentos de Administración", "Contabilidad Financiera"]},
          {"semester": 3, "title": "Semestre 3", "subjects": ["Tipología del Producto", "Estadística Inferencial I", "Cálculo Vectorial", "Bases de Datos", "Entorno Macroeconómico", "Costos Logísticos"]},
          {"semester": 4, "title": "Semestre 4", "subjects": ["Legislación Aduanera", "Estadística Inferencial II", "Finanzas", "Investigación de Operaciones I", "Higiene y Seguridad", "Mecánica Clásica"]},
          {"semester": 5, "title": "Semestre 5", "subjects": ["Compras", "Tráfico y Transporte", "Investigación de Operaciones II", "Taller de Investigación I", "Desarrollo Sustentable", "Procesos de Fabricación"]},
          {"semester": 6, "title": "Semestre 6", "subjects": ["Inventarios", "Envase, Empaque y Embalaje", "Modelos de Simulación y Logística", "Taller de Investigación II", "Ingeniería Económica", "Geografía Logística"]},
          {"semester": 7, "title": "Semestre 7", "subjects": ["Almacenes", "Servicio al Cliente", "Formulación y Evaluación de Proyectos", "Materias de Especialidad"]},
          {"semester": 8, "title": "Semestre 8", "subjects": ["Cadena de Suministro", "Diseño de Instalaciones", "Especialidad"]},
          {"semester": 9, "title": "Semestre 9", "subjects": ["Residencia Profesional"]}
        ]'::jsonb,
        true
    )
ON CONFLICT (code) DO UPDATE SET
    slug = EXCLUDED.slug,
    title = EXCLUDED.title,
    summary = EXCLUDED.summary,
    description = EXCLUDED.description,
    semesters = EXCLUDED.semesters;

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
