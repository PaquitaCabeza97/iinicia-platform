-- =============================================================================
-- IINICIA - Esquema de Base de Datos y Seguridad (Supabase PostgreSQL + RLS)
-- Cumple con la Sección 5 (Modelo de datos mínimo y RLS) y Sección 6 (RBAC)
-- =============================================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. TIPOS ENUM Y CATÁLOGOS
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
-- 2. TABLA: roles (Catálogo de roles de la plataforma)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL, -- superadmin, admin, coordinador, profesor, estudiante, aspirante, soporte
    name TEXT NOT NULL,
    description TEXT,
    moodle_archetype TEXT, -- Relación conceptual con Moodle (manager, editingteacher, student, none)
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
-- 4. TABLA: user_roles (Relación usuario-rol N:M)
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
    modality TEXT NOT NULL DEFAULT 'En línea (Campus Moodle)',
    duration TEXT NOT NULL,
    summary TEXT NOT NULL,
    description TEXT,
    semesters JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 6. TABLA: course_mappings (Relación entre elementos del portal y course_id de Moodle)
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
-- 7. TABLA: user_programs (Relación de usuarios con programas y estatus académico)
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
-- 8. TABLA: enrollment_requests (Solicitudes o autorizaciones de inscripción a cursos/Moodle)
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
-- 10. FUNCIONES AUXILIARES Y TRIGGERS (Alta automática en profiles + Rol Aspirante)
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

-- Trigger automático cuando un usuario se registra en Supabase Auth (Flujo 7.1)
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
-- 11. ROW LEVEL SECURITY (RLS) - Sección 5.2 y Criterio CA-06
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para: roles (Catálogo legible por autenticados, editable por superadmin)
CREATE POLICY "roles_select_authenticated"
    ON public.roles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "roles_admin_all"
    ON public.roles FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), ARRAY['superadmin']));

-- Políticas para: profiles
-- Un usuario solo ve su propio perfil; admin/superadmin/coordinador/soporte pueden consultar perfiles autorizados
CREATE POLICY "profiles_select_own_or_staff"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (
        id = auth.uid()
        OR public.has_role(auth.uid(), ARRAY['superadmin', 'admin', 'coordinador', 'soporte'])
    );

-- Un usuario solo puede actualizar datos básicos propios (sin cambiar su estado ni moodle_user_id)
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

-- Políticas para: user_roles
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

-- Políticas para: programs (Oferta académica pública para lectura cuando está activa)
CREATE POLICY "programs_select_public"
    ON public.programs FOR SELECT
    TO anon, authenticated
    USING (is_active = true OR public.has_role(auth.uid(), ARRAY['superadmin', 'admin', 'coordinador']));

CREATE POLICY "programs_admin_manage"
    ON public.programs FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), ARRAY['superadmin', 'admin']));

-- Políticas para: course_mappings
-- Solo se ven los cursos a los que el usuario está autorizado o si es personal administrativo
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

-- Políticas para: user_programs
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

-- Políticas para: enrollment_requests
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

-- Políticas para: audit_logs (Solo lectura para superadmin y admin)
CREATE POLICY "audit_logs_select_admin"
    ON public.audit_logs FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), ARRAY['superadmin', 'admin']));

CREATE POLICY "audit_logs_insert_admin"
    ON public.audit_logs FOR INSERT
    TO authenticated
    WITH CHECK (public.has_role(auth.uid(), ARRAY['superadmin', 'admin']));
