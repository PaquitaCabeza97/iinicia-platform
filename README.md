# Proyecto de Rediseño y Migración del Portal IINICIA (React + Moodle)

Plataforma Digital Universitaria construida bajo la arquitectura objetivo definida en el **Documento de Alcance Técnico v1.0 (octubre de 2026)**:

- **Frontend Institucional**: React 18 + Next.js 14 (App Router) + TypeScript + Tailwind CSS (`apps/frontend`)
- **Backend / API de Integración**: Node.js + NestJS + TypeScript (`apps/backend`)
- **Identidad, RBAC y Base de Datos**: Supabase Auth + PostgreSQL + Row Level Security (`supabase/`)
- **Sistema de Gestión del Aprendizaje (LMS)**: Moodle 4.4 + Web Services REST oficiales + Tema Institucional (`moodle/` y `docker-compose.yml`)

---

## Estructura del Repositorio

```text
IINICIA/
├── apps/
│   ├── backend/                 # API NestJS: RBAC, sincronización Moodle, SSO y auditoría
│   └── frontend/                # Portal Next.js: Secciones institucionales, Mi IINICIA y Panel Admin
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql # Tablas (profiles, roles, user_roles, programs, etc.) + RLS
│   └── seed.sql                 # Semilla de roles, programas y los 2 cursos obligatorios
├── moodle/
│   ├── scripts/
│   │   └── provision-courses-and-users.mjs # Aprovisionamiento vía Web Services de cursos y usuarios
│   └── theme/
│       └── iinicia_custom.scss  # Tema visual coherente entre Portal y Moodle (CA-17)
├── scripts/
│   └── run-poc-e2e.mjs          # Prueba de concepto obligatoria automatizada (Sección 16 - 10 pasos)
├── docs/
│   └── ARQUITECTURA_Y_OPERACION.md # Manuales de instalación, administración, migración y respaldos
├── docker-compose.yml           # Contenedores Moodle 4.4 + MariaDB
└── .env.example                 # Variables de entorno separadas por capa
```

---

## Inicio Rápido

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Compilar Backend y Frontend**:
   ```bash
   npm run build
   ```

3. **Iniciar el Backend NestJS (`http://localhost:4000/api/v1`)**:
   ```bash
   npm run dev:backend
   ```

4. **Iniciar el Portal Next.js (`http://localhost:3000`)**:
   ```bash
   npm run dev:frontend
   ```

5. **Ejecutar la Prueba de Concepto Obligatoria (10 pasos de extremo a extremo)**:
   ```bash
   npm run test:poc
   ```

---

## Despliegue en Producción

- **Frontend en Vercel**: https://iinicia.vercel.app
- **Repositorio**: https://github.com/PaquitaCabeza97/iinicia-platform
- El despliegue es automático: cada push a la rama `main` dispara un build de Vercel (Root Directory: `apps/frontend`).
- Variables de entorno requeridas en Vercel para las secciones que consumen API: `NEXT_PUBLIC_API_URL` (backend NestJS, se despliega por separado), `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
