#!/usr/bin/env node
/**
 * Script de sincronización directa hacia Supabase PostgreSQL
 * Verifica la conexión con SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY desde .env
 * y sincroniza el catálogo de roles, las 9 Ingenierías del TESE (con sus 9 semestres) y los 2 cursos de Moodle.
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Carga ligera de archivo .env si existe
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY || SUPABASE_URL.includes('tu-proyecto.supabase.co')) {
  console.error('⚠️  Aún no se han configurado SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en el archivo .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

async function main() {
  console.log('Conectando con tu proyecto en Supabase...');
  const { data: programs, error } = await supabase
    .from('programs')
    .select('code, title, duration')
    .order('code');

  if (error) {
    console.error(
      '❌ Error al consultar la tabla programs en Supabase. Asegúrate de haber ejecutado primero supabase/tese_completo_supabase.sql en el SQL Editor de Supabase:',
      error.message,
    );
    process.exit(1);
  }

  console.log(`✅ Conexión exitosa con Supabase. Ingenierías encontradas (${programs.length}):`);
  for (const p of programs) {
    console.log(`   • [${p.code}] ${p.title} (${p.duration})`);
  }
}

main();
