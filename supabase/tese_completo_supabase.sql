-- =============================================================================
-- IINICIA - Esquema de Base de Datos y Seguridad (Supabase PostgreSQL + RLS)
-- Cumple con la SecciÃ³n 5 (Modelo de datos mÃ­nimo y RLS) y SecciÃ³n 6 (RBAC)
-- =============================================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. TIPOS ENUM Y CATÃLOGOS
-- -----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE public.user_status AS ENUM ('pendiente', 'activo', 'suspendido', 'inactivo');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.enrollment_status AS ENUM ('pendiente', 'autorizada', 'rechazada', 'sincronizada');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.program_type AS ENUM ('licenciatura', 'diplomado', 'certificacion', 'curso');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- -----------------------------------------------------------------------------
-- 2. TABLA: roles (CatÃ¡logo de roles de la plataforma)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL, -- superadmin, admin, coordinador, profesor, estudiante, aspirante, soporte
    name TEXT NOT NULL,
    description TEXT,
    moodle_archetype TEXT, -- RelaciÃ³n conceptual con Moodle (manager, editingteacher, student, none)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 3. TABLA: profiles (Datos de perfil vinculados a auth.users)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    status public.user_status NOT NULL DEFAULT 'pendiente',
    moodle_user_id INTEGER UNIQUE,
    moodle_sync_status TEXT NOT NULL DEFAULT 'sin_sincronizar', -- sin_sincronizar, sincronizado, error
    moodle_last_sync_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 4. TABLA: user_roles (RelaciÃ³n usuario-rol N:M)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE RESTRICT,
    assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, role_id)
);

-- -----------------------------------------------------------------------------
-- 5. TABLA: programs (Programas, diplomados, certificaciones o trayectorias)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    type public.program_type NOT NULL,
    modality TEXT NOT NULL DEFAULT 'En lÃ­nea (Campus Moodle)',
    duration TEXT NOT NULL,
    summary TEXT NOT NULL,
    description TEXT,
    semesters JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 6. TABLA: course_mappings (RelaciÃ³n entre elementos del portal y course_id de Moodle)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.course_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
    course_code TEXT UNIQUE NOT NULL,
    course_name TEXT NOT NULL,
    moodle_course_id INTEGER UNIQUE NOT NULL,
    moodle_shortname TEXT UNIQUE NOT NULL,
    moodle_category_id INTEGER DEFAULT 1,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 7. TABLA: user_programs (RelaciÃ³n de usuarios con programas y estatus acadÃ©mico)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
    academic_status TEXT NOT NULL DEFAULT 'inscrito', -- aspirante, inscrito, cursando, egresado, baja
    authorized_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, program_id)
);

-- -----------------------------------------------------------------------------
-- 8. TABLA: enrollment_requests (Solicitudes o autorizaciones de inscripciÃ³n a cursos/Moodle)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.enrollment_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_mapping_id UUID NOT NULL REFERENCES public.course_mappings(id) ON DELETE CASCADE,
    moodle_role TEXT NOT NULL CHECK (moodle_role IN ('student', 'editingteacher')), -- Rol en el curso de Moodle
    status public.enrollment_status NOT NULL DEFAULT 'pendiente',
    authorized_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    authorized_at TIMESTAMPTZ,
    moodle_synced_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, course_mapping_id)
);

-- -----------------------------------------------------------------------------
-- 9. TABLA: audit_logs (Registro de acciones administrativas y eventos relevantes)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    target_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- ej. USER_REGISTERED, ROLE_CHANGED, STATUS_CHANGED, MOODLE_USER_SYNCED, MOODLE_ENROLLED
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 10. FUNCIONES AUXILIARES Y TRIGGERS (Alta automÃ¡tica en profiles + Rol Aspirante)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.has_role(check_user_id UUID, role_codes TEXT[])
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.user_roles ur
        JOIN public.roles r ON r.id = ur.role_id
        WHERE ur.user_id = check_user_id
          AND r.code = ANY(role_codes)
    );
END;
$$;

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_programs_updated_at ON public.programs;
CREATE TRIGGER trg_programs_updated_at
BEFORE UPDATE ON public.programs
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_enrollment_requests_updated_at ON public.enrollment_requests;
CREATE TRIGGER trg_enrollment_requests_updated_at
BEFORE UPDATE ON public.enrollment_requests
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Trigger automÃ¡tico cuando un usuario se registra en Supabase Auth (Flujo 7.1)
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    aspirante_role_id UUID;
BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name, phone, status)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', 'Usuario'),
        COALESCE(NEW.raw_user_meta_data->>'last_name', 'IINICIA'),
        NEW.raw_user_meta_data->>'phone',
        'pendiente'
    )
    ON CONFLICT (id) DO NOTHING;

    SELECT id INTO aspirante_role_id FROM public.roles WHERE code = 'aspirante' LIMIT 1;

    IF aspirante_role_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role_id)
        VALUES (NEW.id, aspirante_role_id)
        ON CONFLICT (user_id, role_id) DO NOTHING;
    END IF;

    INSERT INTO public.audit_logs (actor_id, target_user_id, action, entity_type, entity_id, details)
    VALUES (
        NEW.id,
        NEW.id,
        'USER_REGISTERED',
        'profiles',
        NEW.id::text,
        jsonb_build_object('email', NEW.email, 'initial_role', 'aspirante')
    );

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- -----------------------------------------------------------------------------
-- 11. ROW LEVEL SECURITY (RLS) - SecciÃ³n 5.2 y Criterio CA-06
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- PolÃ­ticas para: roles (CatÃ¡logo legible por autenticados, editable por superadmin)
CREATE POLICY "roles_select_authenticated"
    ON public.roles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "roles_admin_all"
    ON public.roles FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), ARRAY['superadmin']));

-- PolÃ­ticas para: profiles
-- Un usuario solo ve su propio perfil; admin/superadmin/coordinador/soporte pueden consultar perfiles autorizados
CREATE POLICY "profiles_select_own_or_staff"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (
        id = auth.uid()
        OR public.has_role(auth.uid(), ARRAY['superadmin', 'admin', 'coordinador', 'soporte'])
    );

-- Un usuario solo puede actualizar datos bÃ¡sicos propios (sin cambiar su estado ni moodle_user_id)
CREATE POLICY "profiles_update_own"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Administradores pueden actualizar cualquier perfil
CREATE POLICY "profiles_admin_all"
    ON public.profiles FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), ARRAY['superadmin', 'admin']));

-- PolÃ­ticas para: user_roles
CREATE POLICY "user_roles_select_own_or_staff"
    ON public.user_roles FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid()
        OR public.has_role(auth.uid(), ARRAY['superadmin', 'admin', 'coordinador', 'soporte'])
    );

CREATE POLICY "user_roles_admin_manage"
    ON public.user_roles FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), ARRAY['superadmin', 'admin']));

-- PolÃ­ticas para: programs (Oferta acadÃ©mica pÃºblica para lectura cuando estÃ¡ activa)
CREATE POLICY "programs_select_public"
    ON public.programs FOR SELECT
    TO anon, authenticated
    USING (is_active = true OR public.has_role(auth.uid(), ARRAY['superadmin', 'admin', 'coordinador']));

CREATE POLICY "programs_admin_manage"
    ON public.programs FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), ARRAY['superadmin', 'admin']));

-- PolÃ­ticas para: course_mappings
-- Solo se ven los cursos a los que el usuario estÃ¡ autorizado o si es personal administrativo
CREATE POLICY "course_mappings_select_authorized"
    ON public.course_mappings FOR SELECT
    TO authenticated
    USING (
        public.has_role(auth.uid(), ARRAY['superadmin', 'admin', 'coordinador'])
        OR EXISTS (
            SELECT 1 FROM public.enrollment_requests er
            WHERE er.course_mapping_id = course_mappings.id
              AND er.user_id = auth.uid()
              AND er.status IN ('autorizada', 'sincronizada')
        )
    );

CREATE POLICY "course_mappings_admin_manage"
    ON public.course_mappings FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), ARRAY['superadmin', 'admin']));

-- PolÃ­ticas para: user_programs
CREATE POLICY "user_programs_select_own_or_staff"
    ON public.user_programs FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid()
        OR public.has_role(auth.uid(), ARRAY['superadmin', 'admin', 'coordinador'])
    );

CREATE POLICY "user_programs_admin_manage"
    ON public.user_programs FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), ARRAY['superadmin', 'admin']));

-- PolÃ­ticas para: enrollment_requests
CREATE POLICY "enrollment_requests_select_own_or_staff"
    ON public.enrollment_requests FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid()
        OR public.has_role(auth.uid(), ARRAY['superadmin', 'admin', 'coordinador'])
    );

CREATE POLICY "enrollment_requests_admin_manage"
    ON public.enrollment_requests FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), ARRAY['superadmin', 'admin']));

-- PolÃ­ticas para: audit_logs (Solo lectura para superadmin y admin)
CREATE POLICY "audit_logs_select_admin"
    ON public.audit_logs FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), ARRAY['superadmin', 'admin']));

CREATE POLICY "audit_logs_insert_admin"
    ON public.audit_logs FOR INSERT
    TO authenticated
    WITH CHECK (public.has_role(auth.uid(), ARRAY['superadmin', 'admin']));
-- =============================================================================
-- TESE (Portal Institucional) - Datos Semilla Completos
-- Incluye: 7 Roles, las 9 IngenierÃ­as con sus 9 Semestres (JSONB) y los 2 Cursos Moodle
-- =============================================================================

-- 1. CatÃ¡logo de Roles (SecciÃ³n 6)
INSERT INTO public.roles (code, name, description, moodle_archetype)
VALUES
    ('superadmin', 'Superadministrador', 'ConfiguraciÃ³n global, usuarios, roles, integraciones, parÃ¡metros y auditorÃ­a.', 'manager'),
    ('admin', 'Administrador', 'GestiÃ³n de usuarios, estados, programas, autorizaciones e inscripciones.', 'manager'),
    ('coordinador', 'Coordinador', 'Consulta y gestiÃ³n de usuarios/programas bajo su Ã¡mbito.', 'coursecreator'),
    ('profesor', 'Profesor', 'Perfil docente, consulta de cursos asignados y acceso al campus con rol Teacher.', 'editingteacher'),
    ('estudiante', 'Estudiante', 'Perfil, programa, cursos asignados y acceso al campus con rol Student.', 'student'),
    ('aspirante', 'Aspirante', 'Registro, actualizaciÃ³n de datos y seguimiento de admisiÃ³n. Sin acceso a cursos hasta ser autorizado.', 'none'),
    ('soporte', 'Soporte', 'AtenciÃ³n operativa limitada y consulta controlada.', 'none')
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    moodle_archetype = EXCLUDED.moodle_archetype;

-- 2. CatÃ¡logo de las 9 IngenierÃ­as del TESE con sus 9 Semestres (SecciÃ³n 9.1)
INSERT INTO public.programs (id, slug, code, title, type, modality, duration, summary, description, semesters, is_active)
VALUES
    (
        '11111111-1111-4111-8111-111111111101',
        'ingenieria-mecatronica',
        'ING-MEC-01',
        'IngenierÃ­a MecatrÃ³nica',
        'licenciatura',
        'Escolarizada y Apoyo en Campus Moodle',
        '9 Semestres',
        'Enfocada en la integraciÃ³n de mecÃ¡nica, electrÃ³nica y sistemas de control para automatizar procesos.',
        'Forma profesionales capaces de diseÃ±ar, integrar y automatizar sistemas mecatrÃ³nicos, robÃ³ticos y de manufactura avanzada mediante mecÃ¡nica de precisiÃ³n, electrÃ³nica de potencia, microcontroladores y PLC.',
        '[
          {"semester": 1, "title": "Semestre 1", "subjects": ["CÃ¡lculo Diferencial", "QuÃ­mica", "Taller de Ã‰tica", "Fundamentos de InvestigaciÃ³n", "Dibujo ElectromecÃ¡nico", "MetrologÃ­a y NormalizaciÃ³n"]},
          {"semester": 2, "title": "Semestre 2", "subjects": ["CÃ¡lculo Integral", "Ãlgebra Lineal", "FÃ­sica", "ProgramaciÃ³n BÃ¡sica", "Ciencia e IngenierÃ­a de Materiales", "EstadÃ­stica y Control de Calidad"]},
          {"semester": 3, "title": "Semestre 3", "subjects": ["CÃ¡lculo Vectorial", "Electromagnetismo", "EstÃ¡tica", "Procesos de FabricaciÃ³n", "DinÃ¡mica", "Desarrollo Sustentable"]},
          {"semester": 4, "title": "Semestre 4", "subjects": ["Ecuaciones Diferenciales", "AnÃ¡lisis de Circuitos ElÃ©ctricos", "MecÃ¡nica de Materiales", "Fundamentos de TermodinÃ¡mica", "MÃ¡quinas ElÃ©ctricas", "MÃ©todos NumÃ©ricos"]},
          {"semester": 5, "title": "Semestre 5", "subjects": ["ElectrÃ³nica AnalÃ³gica", "AnÃ¡lisis y SÃ­ntesis de Mecanismos", "Microcontroladores", "InstrumentaciÃ³n", "Taller de InvestigaciÃ³n I", "DinÃ¡mica de Sistemas"]},
          {"semester": 6, "title": "Semestre 6", "subjects": ["ElectrÃ³nica de Potencia", "DiseÃ±o de Elementos MecÃ¡nicos", "Mantenimiento", "Taller de InvestigaciÃ³n II", "Control", "ElectrÃ³nica Digital"]},
          {"semester": 7, "title": "Semestre 7", "subjects": ["RobÃ³tica", "Controladores LÃ³gicos Programables (PLC)", "Manufactura Avanzada", "Materias de Especialidad"]},
          {"semester": 8, "title": "Semestre 8", "subjects": ["FormulaciÃ³n y EvaluaciÃ³n de Proyectos", "Interfases y Redes Industriales", "Materias de Especialidad"]},
          {"semester": 9, "title": "Semestre 9", "subjects": ["Residencia Profesional"]}
        ]'::jsonb,
        true
    ),
    (
        '11111111-1111-4111-8111-111111111102',
        'ingenieria-industrial',
        'ING-IND-02',
        'IngenierÃ­a Industrial',
        'licenciatura',
        'Escolarizada y Apoyo en Campus Moodle',
        '9 Semestres',
        'Orientada a la optimizaciÃ³n de procesos, gestiÃ³n de calidad, manufactura y logÃ­stica.',
        'Prepara ingenieros lÃ­deres en la mejora continua de sistemas productivos, ergonomÃ­a, investigaciÃ³n de operaciones, control estadÃ­stico de la calidad y cadenas de suministro.',
        '[
          {"semester": 1, "title": "Semestre 1", "subjects": ["CÃ¡lculo Diferencial", "Fundamentos de InvestigaciÃ³n", "Taller de Ã‰tica", "QuÃ­mica", "Dibujo Industrial", "Taller de Herramientas Intelectuales"]},
          {"semester": 2, "title": "Semestre 2", "subjects": ["CÃ¡lculo Integral", "Probabilidad y EstadÃ­stica", "AnÃ¡lisis de la Realidad Nacional", "Propiedad de los Materiales", "Electricidad y ElectrÃ³nica Industrial", "Taller de Liderazgo"]},
          {"semester": 3, "title": "Semestre 3", "subjects": ["CÃ¡lculo Vectorial", "EstadÃ­stica Inferencial I", "Estudio del Trabajo I", "EconomÃ­a", "Ãlgebra Lineal", "MetrologÃ­a y NormalizaciÃ³n"]},
          {"semester": 4, "title": "Semestre 4", "subjects": ["Ecuaciones Diferenciales", "EstadÃ­stica Inferencial II", "Estudio del Trabajo II", "InvestigaciÃ³n de Operaciones I", "Procesos de FabricaciÃ³n", "Higiene y Seguridad Industrial"]},
          {"semester": 5, "title": "Semestre 5", "subjects": ["Desarrollo Sustentable", "AdministraciÃ³n de Proyectos", "GestiÃ³n de Costos", "InvestigaciÃ³n de Operaciones II", "ErgonomÃ­a", "Control EstadÃ­stico de la Calidad"]},
          {"semester": 6, "title": "Semestre 6", "subjects": ["Taller de InvestigaciÃ³n I", "IngenierÃ­a EconÃ³mica", "AdministraciÃ³n del Mantenimiento", "Sistemas de Manufactura", "DiseÃ±o de Experimentos", "LogÃ­stica y Cadenas de Suministro"]},
          {"semester": 7, "title": "Semestre 7", "subjects": ["PlaneaciÃ³n Financiera", "PlaneaciÃ³n y DiseÃ±o de Instalaciones", "Sistemas de ProducciÃ³n", "Taller de InvestigaciÃ³n II", "Materias de Especialidad"]},
          {"semester": 8, "title": "Semestre 8", "subjects": ["FormulaciÃ³n y EvaluaciÃ³n de Proyectos", "Relaciones Industriales", "Materias de Especialidad"]},
          {"semester": 9, "title": "Semestre 9", "subjects": ["Residencia Profesional"]}
        ]'::jsonb,
        true
    ),
    (
        '11111111-1111-4111-8111-111111111103',
        'ingenieria-quimica',
        'ING-QUI-03',
        'IngenierÃ­a QuÃ­mica',
        'licenciatura',
        'Escolarizada y Apoyo en Campus Moodle',
        '9 Semestres',
        'Centrada en la transformaciÃ³n de materias primas, diseÃ±o de reactores y termodinÃ¡mica.',
        'Desarrolla competencias en fenÃ³menos de transporte, operaciones unitarias, cinÃ©tica quÃ­mica, diseÃ±o de reactores, simulaciÃ³n y optimizaciÃ³n de procesos industriales sustentables.',
        '[
          {"semester": 1, "title": "Semestre 1", "subjects": ["CÃ¡lculo Diferencial", "QuÃ­mica InorgÃ¡nica", "Taller de Ã‰tica", "Fundamentos de InvestigaciÃ³n", "Dibujo", "MecÃ¡nica ClÃ¡sica"]},
          {"semester": 2, "title": "Semestre 2", "subjects": ["CÃ¡lculo Integral", "Ãlgebra Lineal", "QuÃ­mica AnalÃ­tica", "QuÃ­mica OrgÃ¡nica I", "Probabilidad y EstadÃ­stica", "TermodinÃ¡mica"]},
          {"semester": 3, "title": "Semestre 3", "subjects": ["CÃ¡lculo Vectorial", "QuÃ­mica OrgÃ¡nica II", "FisicoquÃ­mica I", "Balance de Materia y EnergÃ­a", "Ecuaciones Diferenciales", "Desarrollo Sustentable"]},
          {"semester": 4, "title": "Semestre 4", "subjects": ["MÃ©todos NumÃ©ricos", "TermodinÃ¡mica", "FisicoquÃ­mica II", "FenÃ³menos de Transporte I", "AnÃ¡lisis Instrumental", "ProgramaciÃ³n"]},
          {"semester": 5, "title": "Semestre 5", "subjects": ["CinÃ©tica QuÃ­mica y BiolÃ³gica", "Operaciones Unitarias I", "FenÃ³menos de Transporte II", "Taller de InvestigaciÃ³n I", "LegislaciÃ³n", "IngenierÃ­a Ambiental"]},
          {"semester": 6, "title": "Semestre 6", "subjects": ["DiseÃ±o de Reactores", "Operaciones Unitarias II", "DinÃ¡mica y Control de Procesos", "Taller de InvestigaciÃ³n II", "Seguridad e Higiene Industrial"]},
          {"semester": 7, "title": "Semestre 7", "subjects": ["SimulaciÃ³n de Procesos", "Operaciones Unitarias III", "SÃ­ntesis y OptimizaciÃ³n de Procesos", "Especialidad"]},
          {"semester": 8, "title": "Semestre 8", "subjects": ["FormulaciÃ³n y EvaluaciÃ³n de Proyectos", "IngenierÃ­a EconÃ³mica", "Especialidad"]},
          {"semester": 9, "title": "Semestre 9", "subjects": ["Residencia Profesional"]}
        ]'::jsonb,
        true
    ),
    (
        '11111111-1111-4111-8111-111111111104',
        'ingenieria-bioquimica',
        'ING-BIO-04',
        'IngenierÃ­a BioquÃ­mica',
        'licenciatura',
        'Escolarizada y Apoyo en Campus Moodle',
        '9 Semestres',
        'AplicaciÃ³n de procesos biolÃ³gicos y quÃ­micos en las industrias alimentaria y farmacÃ©utica.',
        'Integra microbiologÃ­a industrial, bioquÃ­mica, ingenierÃ­a de biorreactores y operaciones unitarias para el desarrollo e innovaciÃ³n en alimentos, fÃ¡rmacos y bioprocesos.',
        '[
          {"semester": 1, "title": "Semestre 1", "subjects": ["CÃ¡lculo Diferencial", "QuÃ­mica InorgÃ¡nica", "BiologÃ­a", "Taller de Ã‰tica", "Fundamentos de InvestigaciÃ³n", "Dibujo"]},
          {"semester": 2, "title": "Semestre 2", "subjects": ["CÃ¡lculo Integral", "QuÃ­mica AnalÃ­tica", "FÃ­sica I", "Ãlgebra Lineal", "Probabilidad y EstadÃ­stica", "ProgramaciÃ³n"]},
          {"semester": 3, "title": "Semestre 3", "subjects": ["CÃ¡lculo Vectorial", "QuÃ­mica OrgÃ¡nica I", "FÃ­sica II", "FisicoquÃ­mica", "BioquÃ­mica I", "MicrobiologÃ­a"]},
          {"semester": 4, "title": "Semestre 4", "subjects": ["Ecuaciones Diferenciales", "QuÃ­mica OrgÃ¡nica II", "TermodinÃ¡mica", "BioquÃ­mica II", "MicrobiologÃ­a Industrial", "MÃ©todos NumÃ©ricos"]},
          {"semester": 5, "title": "Semestre 5", "subjects": ["Operaciones Unitarias I", "CinÃ©tica QuÃ­mica y BiolÃ³gica", "Taller de InvestigaciÃ³n I", "BiologÃ­a Celular", "Desarrollo Sustentable", "IngenierÃ­a de Bioprocesos"]},
          {"semester": 6, "title": "Semestre 6", "subjects": ["Operaciones Unitarias II", "IngenierÃ­a de Biorreactores", "InstrumentaciÃ³n y Control", "Taller de InvestigaciÃ³n II", "FenÃ³menos de Transporte"]},
          {"semester": 7, "title": "Semestre 7", "subjects": ["Operaciones Unitarias III", "FormulaciÃ³n y EvaluaciÃ³n de Proyectos", "TecnologÃ­a de Alimentos/FÃ¡rmacos (segÃºn especialidad)", "Especialidad"]},
          {"semester": 8, "title": "Semestre 8", "subjects": ["IngenierÃ­a EconÃ³mica", "AdministraciÃ³n y LegislaciÃ³n", "Especialidad"]},
          {"semester": 9, "title": "Semestre 9", "subjects": ["Residencia Profesional"]}
        ]'::jsonb,
        true
    ),
    (
        '11111111-1111-4111-8111-111111111105',
        'ingenieria-aeronautica',
        'ING-AER-05',
        'IngenierÃ­a AeronÃ¡utica',
        'licenciatura',
        'Escolarizada y Apoyo en Campus Moodle',
        '9 Semestres',
        'DiseÃ±o, manufactura y mantenimiento de aeronaves y sistemas aeroespaciales.',
        'Especializa en aerodinÃ¡mica, estructuras aeronÃ¡uticas, sistemas de propulsiÃ³n, dinÃ¡mica y control de vuelo, manufactura y legislaciÃ³n aeronÃ¡utica.',
        '[
          {"semester": 1, "title": "Semestre 1", "subjects": ["CÃ¡lculo Diferencial", "Ãlgebra Lineal", "Taller de Ã‰tica", "QuÃ­mica", "Dibujo AeronÃ¡utico", "Fundamentos de InvestigaciÃ³n"]},
          {"semester": 2, "title": "Semestre 2", "subjects": ["CÃ¡lculo Integral", "MecÃ¡nica ClÃ¡sica", "Probabilidad y EstadÃ­stica", "Ciencia de Materiales AeronÃ¡uticos", "TermodinÃ¡mica", "ProgramaciÃ³n"]},
          {"semester": 3, "title": "Semestre 3", "subjects": ["CÃ¡lculo Vectorial", "EstÃ¡tica", "Electromagnetismo", "MecÃ¡nica de Fluidos", "Ecuaciones Diferenciales", "Desarrollo Sustentable"]},
          {"semester": 4, "title": "Semestre 4", "subjects": ["DinÃ¡mica", "MecÃ¡nica de Materiales", "AerodinÃ¡mica", "AnÃ¡lisis de Circuitos", "MÃ©todos NumÃ©ricos", "ElectrÃ³nica"]},
          {"semester": 5, "title": "Semestre 5", "subjects": ["AerodinÃ¡mica de Alta Velocidad", "Estructuras AeronÃ¡uticas", "Taller de InvestigaciÃ³n I", "Sistemas de Aeronaves", "PropulsiÃ³n", "InstrumentaciÃ³n AeronÃ¡utica"]},
          {"semester": 6, "title": "Semestre 6", "subjects": ["DesempeÃ±o de Aeronaves", "DiseÃ±o de Elementos de MÃ¡quinas", "Taller de InvestigaciÃ³n II", "Manufactura AeronÃ¡utica", "DinÃ¡mica de Vuelo"]},
          {"semester": 7, "title": "Semestre 7", "subjects": ["Mantenimiento AeronÃ¡utico", "DiseÃ±o AeronÃ¡utico", "Control de Vuelo", "Materias de Especialidad"]},
          {"semester": 8, "title": "Semestre 8", "subjects": ["AdministraciÃ³n de Operaciones AeronÃ¡uticas", "LegislaciÃ³n AeronÃ¡utica", "Especialidad"]},
          {"semester": 9, "title": "Semestre 9", "subjects": ["Residencia Profesional"]}
        ]'::jsonb,
        true
    ),
    (
        '11111111-1111-4111-8111-111111111106',
        'ingenieria-gestion-empresarial',
        'ING-IGE-06',
        'IngenierÃ­a en GestiÃ³n Empresarial',
        'licenciatura',
        'Escolarizada y Apoyo en Campus Moodle',
        '9 Semestres',
        'CombinaciÃ³n de administraciÃ³n de negocios, finanzas e ingenierÃ­a de procesos.',
        'Forma estrategas organizacionales en finanzas corporativas, capital humano, mercadotecnia, innovaciÃ³n, gestiÃ³n de la producciÃ³n y direcciÃ³n estratÃ©gica.',
        '[
          {"semester": 1, "title": "Semestre 1", "subjects": ["Fundamentos de InvestigaciÃ³n", "CÃ¡lculo Diferencial", "Desarrollo Humano", "Fundamentos de GestiÃ³n Empresarial", "FÃ­sica", "DinÃ¡mica Social"]},
          {"semester": 2, "title": "Semestre 2", "subjects": ["Software de AplicaciÃ³n Ejecutivo", "CÃ¡lculo Integral", "Contabilidad Orientada a los Negocios", "DinÃ¡mica de la Empresa", "EstadÃ­stica para la AdministraciÃ³n I", "LegislaciÃ³n Laboral"]},
          {"semester": 3, "title": "Semestre 3", "subjects": ["Marco Legal de las Organizaciones", "Probabilidad y EstadÃ­stica Descriptiva", "Costos Empresariales", "Habilidades Directivas I", "EconomÃ­a Empresarial", "Ãlgebra Lineal"]},
          {"semester": 4, "title": "Semestre 4", "subjects": ["IngenierÃ­a EconÃ³mica", "EstadÃ­stica para la AdministraciÃ³n II", "Instrumentos de PresupuestaciÃ³n", "Habilidades Directivas II", "Entorno MacroeconÃ³mico", "InvestigaciÃ³n de Operaciones"]},
          {"semester": 5, "title": "Semestre 5", "subjects": ["Finanzas en las Organizaciones", "DiseÃ±o Organizacional", "GestiÃ³n del Capital Humano", "Taller de InvestigaciÃ³n I", "Mercadotecnia", "Desarrollo Sustentable"]},
          {"semester": 6, "title": "Semestre 6", "subjects": ["AdministraciÃ³n de la Salud y Seguridad Ocupacional", "El Emprendedor y la InnovaciÃ³n", "GestiÃ³n de la ProducciÃ³n I", "Taller de InvestigaciÃ³n II", "Sistemas de InformaciÃ³n de Mercadotecnia"]},
          {"semester": 7, "title": "Semestre 7", "subjects": ["Plan de Negocios", "GestiÃ³n de la ProducciÃ³n II", "Calidad Aplicada a la GestiÃ³n Empresarial", "Materias de Especialidad"]},
          {"semester": 8, "title": "Semestre 8", "subjects": ["GestiÃ³n EstratÃ©gica", "Cadena de Suministros", "Materias de Especialidad"]},
          {"semester": 9, "title": "Semestre 9", "subjects": ["Residencia Profesional"]}
        ]'::jsonb,
        true
    ),
    (
        '11111111-1111-4111-8111-111111111107',
        'ingenieria-electromecanica',
        'ING-IEM-07',
        'IngenierÃ­a ElectromecÃ¡nica',
        'licenciatura',
        'Escolarizada y Apoyo en Campus Moodle',
        '9 Semestres',
        'IntegraciÃ³n de sistemas elÃ©ctricos, mecÃ¡nicos y tÃ©rmicos para la industria.',
        'Capacita en el anÃ¡lisis, diseÃ±o y mantenimiento de mÃ¡quinas elÃ©ctricas, subestaciones, sistemas hidrÃ¡ulicos y neumÃ¡ticos, transferencia de calor, refrigeraciÃ³n y automatizaciÃ³n.',
        '[
          {"semester": 1, "title": "Semestre 1", "subjects": ["CÃ¡lculo Diferencial", "QuÃ­mica", "Taller de Ã‰tica", "Fundamentos de InvestigaciÃ³n", "Dibujo ElectromecÃ¡nico", "IntroducciÃ³n a la ProgramaciÃ³n"]},
          {"semester": 2, "title": "Semestre 2", "subjects": ["CÃ¡lculo Integral", "Ãlgebra Lineal", "MecÃ¡nica ClÃ¡sica", "TecnologÃ­a de los Materiales", "Probabilidad y EstadÃ­stica", "MetrologÃ­a y NormalizaciÃ³n"]},
          {"semester": 3, "title": "Semestre 3", "subjects": ["CÃ¡lculo Vectorial", "Electricidad y Magnetismo", "EstÃ¡tica", "Procesos de Manufactura", "ElectrÃ³nica AnalÃ³gica", "Desarrollo Sustentable"]},
          {"semester": 4, "title": "Semestre 4", "subjects": ["Ecuaciones Diferenciales", "DinÃ¡mica", "MecÃ¡nica de Materiales", "AnÃ¡lisis de Circuitos", "TermodinÃ¡mica", "MÃ©todos NumÃ©ricos"]},
          {"semester": 5, "title": "Semestre 5", "subjects": ["MÃ¡quinas ElÃ©ctricas", "MecÃ¡nica de Fluidos", "DiseÃ±o de Elementos de MÃ¡quinas", "Instalaciones ElÃ©ctricas", "Taller de InvestigaciÃ³n I"]},
          {"semester": 6, "title": "Semestre 6", "subjects": ["Controles ElÃ©ctricos", "Transferencia de Calor", "ElectrÃ³nica Industrial", "Sistemas HidrÃ¡ulicos y NeumÃ¡ticos", "Taller de InvestigaciÃ³n II"]},
          {"semester": 7, "title": "Semestre 7", "subjects": ["RefrigeraciÃ³n y Aire Acondicionado", "Subestaciones ElÃ©ctricas", "AutomatizaciÃ³n", "Materias de Especialidad"]},
          {"semester": 8, "title": "Semestre 8", "subjects": ["FormulaciÃ³n y EvaluaciÃ³n de Proyectos", "Mantenimiento Industrial", "Especialidad"]},
          {"semester": 9, "title": "Semestre 9", "subjects": ["Residencia Profesional"]}
        ]'::jsonb,
        true
    ),
    (
        '11111111-1111-4111-8111-111111111108',
        'ingenieria-electronica',
        'ING-IEL-08',
        'IngenierÃ­a ElectrÃ³nica',
        'licenciatura',
        'Escolarizada y Apoyo en Campus Moodle',
        '9 Semestres',
        'DiseÃ±o de hardware, telecomunicaciones, instrumentaciÃ³n y control analÃ³gico/digital.',
        'Enfocada en semiconductores, diseÃ±o digital con VHDL, amplificadores operacionales, microcontroladores, optoelectrÃ³nica, sistemas de comunicaciÃ³n y control.',
        '[
          {"semester": 1, "title": "Semestre 1", "subjects": ["CÃ¡lculo Diferencial", "FÃ­sica I (MecÃ¡nica)", "QuÃ­mica", "Taller de Ã‰tica", "Fundamentos de InvestigaciÃ³n", "ComunicaciÃ³n Humana"]},
          {"semester": 2, "title": "Semestre 2", "subjects": ["CÃ¡lculo Integral", "FÃ­sica II (Electromagnetismo)", "Ãlgebra Lineal", "Probabilidad y EstadÃ­stica", "ProgramaciÃ³n Estructurada", "Dibujo Asistido por Computadora"]},
          {"semester": 3, "title": "Semestre 3", "subjects": ["CÃ¡lculo Vectorial", "Ecuaciones Diferenciales", "FÃ­sica de Semiconductores", "Mediciones ElÃ©ctricas", "ProgramaciÃ³n Visual", "Desarrollo Sustentable"]},
          {"semester": 4, "title": "Semestre 4", "subjects": ["AnÃ¡lisis de Circuitos ElÃ©ctricos", "ElectrÃ³nica AnalÃ³gica", "DiseÃ±o Digital", "MÃ©todos NumÃ©ricos", "MÃ¡quinas ElÃ©ctricas", "TeorÃ­a ElectromagnÃ©tica"]},
          {"semester": 5, "title": "Semestre 5", "subjects": ["Taller de InvestigaciÃ³n I", "Amplificadores Operacionales", "Microcontroladores", "DiseÃ±o Digital con VHDL", "InstrumentaciÃ³n", "Fundamentos de Telecomunicaciones"]},
          {"semester": 6, "title": "Semestre 6", "subjects": ["Taller de InvestigaciÃ³n II", "Control I", "ElectrÃ³nica de Potencia", "OptoelectrÃ³nica", "Sistemas de ComunicaciÃ³n"]},
          {"semester": 7, "title": "Semestre 7", "subjects": ["Control II", "PLC y AutomatizaciÃ³n", "Materias de Especialidad"]},
          {"semester": 8, "title": "Semestre 8", "subjects": ["FormulaciÃ³n y EvaluaciÃ³n de Proyectos", "AdministraciÃ³n Gerencial", "Especialidad"]},
          {"semester": 9, "title": "Semestre 9", "subjects": ["Residencia Profesional"]}
        ]'::jsonb,
        true
    ),
    (
        '11111111-1111-4111-8111-111111111109',
        'ingenieria-logistica',
        'ING-LOG-09',
        'IngenierÃ­a en LogÃ­stica',
        'licenciatura',
        'Escolarizada y Apoyo en Campus Moodle',
        '9 Semestres',
        'DiseÃ±o, operaciÃ³n y mejora de cadenas de suministro, transporte y almacenes.',
        'Prepara especialistas en trÃ¡fico y transporte, legislaciÃ³n aduanera, gestiÃ³n de inventarios, almacenes, envase y embalaje, simulaciÃ³n logÃ­stica y servicio al cliente.',
        '[
          {"semester": 1, "title": "Semestre 1", "subjects": ["IntroducciÃ³n a la IngenierÃ­a en LogÃ­stica", "CÃ¡lculo Diferencial", "QuÃ­mica", "Fundamentos de InvestigaciÃ³n", "Taller de Ã‰tica", "EconomÃ­a"]},
          {"semester": 2, "title": "Semestre 2", "subjects": ["CÃ¡lculo Integral", "Probabilidad y EstadÃ­stica", "Ãlgebra Lineal", "DinÃ¡mica Social", "Fundamentos de AdministraciÃ³n", "Contabilidad Financiera"]},
          {"semester": 3, "title": "Semestre 3", "subjects": ["TipologÃ­a del Producto", "EstadÃ­stica Inferencial I", "CÃ¡lculo Vectorial", "Bases de Datos", "Entorno MacroeconÃ³mico", "Costos LogÃ­sticos"]},
          {"semester": 4, "title": "Semestre 4", "subjects": ["LegislaciÃ³n Aduanera", "EstadÃ­stica Inferencial II", "Finanzas", "InvestigaciÃ³n de Operaciones I", "Higiene y Seguridad", "MecÃ¡nica ClÃ¡sica"]},
          {"semester": 5, "title": "Semestre 5", "subjects": ["Compras", "TrÃ¡fico y Transporte", "InvestigaciÃ³n de Operaciones II", "Taller de InvestigaciÃ³n I", "Desarrollo Sustentable", "Procesos de FabricaciÃ³n"]},
          {"semester": 6, "title": "Semestre 6", "subjects": ["Inventarios", "Envase, Empaque y Embalaje", "Modelos de SimulaciÃ³n y LogÃ­stica", "Taller de InvestigaciÃ³n II", "IngenierÃ­a EconÃ³mica", "GeografÃ­a LogÃ­stica"]},
          {"semester": 7, "title": "Semestre 7", "subjects": ["Almacenes", "Servicio al Cliente", "FormulaciÃ³n y EvaluaciÃ³n de Proyectos", "Materias de Especialidad"]},
          {"semester": 8, "title": "Semestre 8", "subjects": ["Cadena de Suministro", "DiseÃ±o de Instalaciones", "Especialidad"]},
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

-- 3. Mapeo de los Dos Cursos de Ejemplo Obligatorios en Moodle (SecciÃ³n 8.1)
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
        'Curso 1. IntroducciÃ³n a las TecnologÃ­as de la InformaciÃ³n',
        101,
        'IINICIA-TI-101',
        1,
        'Incluye: PresentaciÃ³n del curso, recurso PDF/pÃ¡gina, foro de bienvenida, tarea evaluable, cuestionario diagnÃ³stico, libro de calificaciones y criterios de finalizaciÃ³n de actividad.',
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
        'Incluye: Unidades temÃ¡ticas (JSX, Hooks, Next.js), recursos tÃ©cnicos, actividad prÃ¡ctica entregable, foro tÃ©cnico, evaluaciÃ³n final, calificaciÃ³n y finalizaciÃ³n de curso.',
        true
    )
ON CONFLICT (course_code) DO UPDATE SET
    course_name = EXCLUDED.course_name,
    moodle_course_id = EXCLUDED.moodle_course_id,
    moodle_shortname = EXCLUDED.moodle_shortname,
    description = EXCLUDED.description;
