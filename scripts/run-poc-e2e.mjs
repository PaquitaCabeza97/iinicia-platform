#!/usr/bin/env node
/**
 * Script Automatizado de Prueba de Concepto Obligatoria (Sección 16 - 10 pasos de extremo a extremo)
 * Verifica la integración completa Portal -> Backend NestJS -> Supabase/Profiles/RBAC -> Moodle LMS
 */

const API_URL = process.env.API_URL || 'http://localhost:4000/api/v1';

async function req(path, options = {}, token = null) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`[HTTP ${res.status} ${path}] ${data.message || JSON.stringify(data)}`);
  }
  return data;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`❌ Falló aserción: ${message}`);
  }
}

async function runProofOfConcept() {
  console.log('================================================================================');
  console.log('🧪 IINICIA - EJECUCIÓN DE PRUEBA DE CONCEPTO OBLIGATORIA (SECCIÓN 16 · 10 PASOS)');
  console.log('================================================================================\n');

  const uniqueEmail = `poc.estudiante.${Date.now()}@iinicia.edu.mx`;

  // PASO 1 y 2: Usuario se registra en el portal -> Identidad + tabla profiles + rol inicial Aspirante
  console.log('▶ Paso 1 y 2: Registrando nuevo usuario en /auth/register...');
  const regRes = await req('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email: uniqueEmail,
      first_name: 'Valeria',
      last_name: 'Sánchez (PoC)',
      phone: '+52 55 9999 0000',
    }),
  });
  const newUserId = regRes.user.profile.id;
  assert(regRes.user.primaryRole === 'aspirante', 'El rol inicial debe ser aspirante');
  assert(regRes.user.profile.status === 'pendiente', 'El estado inicial debe ser pendiente');
  console.log(`  ✔ Usuario creado en profiles (ID: ${newUserId}) con rol inicial: ${regRes.user.primaryRole}`);

  // Verificar que como Aspirante NO ve ningún curso autorizado (Requisito obligatorio Sección 6)
  const aspiranteDash = await req('/campus/dashboard', {}, newUserId);
  assert(
    aspiranteDash.authorizedCourses.length === 0,
    'Un aspirante no debe visualizar cursos antes de ser autorizado',
  );
  console.log('  ✔ Verificado (CA-06): El Aspirante tiene 0 cursos visibles antes de ser autorizado.\n');

  // Inicio de sesión del Administrador
  const adminLogin = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@iinicia.edu.mx' }),
  });
  const adminToken = adminLogin.accessToken;

  // PASO 3 y 4: Administrador asigna rol Estudiante y el Backend verifica/crea el usuario en Moodle sin duplicados
  console.log('▶ Paso 3 y 4: Administrador autoriza y asigna rol Estudiante + Sincronización con Moodle...');
  const updateRes = await req(
    `/admin/users/${newUserId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        role_code: 'estudiante',
        status: 'activo',
        sync_moodle: true,
      }),
    },
    adminToken,
  );
  assert(updateRes.user.primaryRole === 'estudiante', 'El rol debe actualizarse a estudiante');
  assert(updateRes.user.moodle_user_id !== null, 'Debe haberse generado/vinculado moodle_user_id');
  const firstMoodleId = updateRes.user.moodle_user_id;
  console.log(`  ✔ Rol actualizado a Estudiante. Usuario sincronizado en Moodle con moodle_user_id=${firstMoodleId}`);

  // Comprobar anti-duplicados (CA-10) invocando sync-moodle nuevamente
  const resyncRes = await req(
    `/admin/users/${newUserId}/sync-moodle`,
    { method: 'POST' },
    adminToken,
  );
  assert(
    resyncRes.moodleSyncResult.moodleUserId === firstMoodleId &&
      resyncRes.moodleSyncResult.createdNew === false,
    'La resincronización debe reutilizar el moodle_user_id existente sin duplicar (CA-10)',
  );
  console.log(`  ✔ Verificado (CA-10): Prevención de duplicados en Moodle confirmada (moodle_user_id=${firstMoodleId}).\n`);

  // PASO 5: El estudiante se matricula en UNO de los dos cursos de ejemplo (Curso 2: Desarrollo Web con React)
  console.log('▶ Paso 5: Matriculando al estudiante únicamente en Curso 2 (Desarrollo Web con React)...');
  const courseReactId = '22222222-2222-4222-8222-222222222202';
  const courseTiId = '22222222-2222-4222-8222-222222222201';

  const enrolRes = await req(
    '/admin/enrollments',
    {
      method: 'POST',
      body: JSON.stringify({
        user_id: newUserId,
        course_mapping_id: courseReactId,
        moodle_role: 'student',
      }),
    },
    adminToken,
  );
  assert(enrolRes.enrollment.status === 'sincronizada', 'La matrícula debe quedar sincronizada');
  console.log(`  ✔ Estudiante matriculado en Curso 2 (Moodle Course ID: ${enrolRes.moodleEnrolResult.moodleCourseId}).\n`);

  // PASO 6 y 7: El usuario inicia sesión en el portal y Mi IINICIA muestra ÚNICAMENTE los cursos autorizados
  console.log('▶ Paso 6 y 7: El estudiante inicia sesión y consulta Mi IINICIA (/campus/dashboard)...');
  const studentLogin = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: uniqueEmail }),
  });
  const studentToken = studentLogin.accessToken;
  const studentDash = await req('/campus/dashboard', {}, studentToken);

  assert(
    studentDash.authorizedCourses.length === 1,
    'Mi IINICIA debe mostrar exactamente 1 curso autorizado',
  );
  assert(
    studentDash.authorizedCourses[0].course.course_code === 'WEB-202',
    'El curso visible debe ser exclusivamente WEB-202 (Desarrollo Web con React)',
  );
  console.log(
    `  ✔ Verificado (CA-11 y CA-12): Mi IINICIA muestra únicamente "${studentDash.authorizedCourses[0].course.course_name}".\n`,
  );

  // PASO 8: El usuario accede al campus Moodle con los permisos correctos (y se bloquea acceso al Curso 1 no matriculado)
  console.log('▶ Paso 8: Generando acceso SSO al Campus Moodle para el curso autorizado...');
  const ssoLaunch = await req(
    `/campus/launch/${courseReactId}`,
    { method: 'POST' },
    studentToken,
  );
  assert(
    ssoLaunch.assignedMoodleRole.includes('Student'),
    'El acceso SSO debe otorgar rol Student',
  );
  console.log(`  ✔ Acceso SSO generado: ${ssoLaunch.launchUrl}`);

  let unauthorizedBlocked = false;
  try {
    await req(`/campus/launch/${courseTiId}`, { method: 'POST' }, studentToken);
  } catch {
    unauthorizedBlocked = true;
  }
  assert(
    unauthorizedBlocked,
    'El backend debe bloquear el acceso al Curso 1 donde el estudiante no está matriculado',
  );
  console.log('  ✔ Verificado (CA-12): Acceso bloqueado al Curso 1 no matriculado.\n');

  // PASO 9: Un profesor inicia sesión y visualiza funciones diferentes a las del estudiante
  console.log('▶ Paso 9: Profesor inicia sesión y consulta sus cursos asignados con rol Teacher...');
  const profLogin = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'profesor@iinicia.edu.mx' }),
  });
  const profDash = await req('/campus/dashboard', {}, profLogin.accessToken);
  assert(profDash.primaryRole === 'profesor', 'El rol principal debe ser profesor');
  assert(
    profDash.authorizedCourses.every((c) => c.moodle_role === 'editingteacher'),
    'El profesor debe tener rol editingteacher (Teacher) en sus cursos asignados (CA-13)',
  );
  console.log(
    `  ✔ Verificado (CA-13): Profesor visualiza ${profDash.authorizedCourses.length} cursos con rol "${profDash.authorizedCourses[0].moodle_role_label}".\n`,
  );

  // PASO 10: Un administrador consulta usuarios, roles, bitácora y estado de integración sin credenciales de Moodle en navegador
  console.log('▶ Paso 10: Administrador consulta usuarios, estado de integración Moodle y bitácora audit_logs...');
  const moodleStatus = await req('/admin/moodle-status', {}, adminToken);
  const auditLogs = await req('/admin/audit-logs?limit=10', {}, adminToken);
  assert(
    moodleStatus.integration.exposedToFrontend === false,
    'Las credenciales de Moodle nunca deben exponerse al frontend (CA-14)',
  );
  assert(
    auditLogs.auditLogs.length >= 3,
    'Los cambios relevantes deben quedar registrados en audit_logs (CA-19)',
  );
  console.log(
    `  ✔ Verificado (CA-14, CA-19): Estado de integración consultado sin exponer tokens. Eventos auditados: ${auditLogs.auditLogs.length}.`,
  );

  console.log('\n================================================================================');
  console.log('✅ PRUEBA DE CONCEPTO OBLIGATORIA (10/10 PASOS) COMPLETADA EXITOSAMENTE');
  console.log('================================================================================');
}

runProofOfConcept().catch((err) => {
  console.error('\n❌ Error durante la Prueba de Concepto:', err.message);
  process.exit(1);
});
