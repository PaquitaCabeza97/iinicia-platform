#!/usr/bin/env node
/**
 * Script de aprovisionamiento automático de Moodle vía Web Services oficiales
 * Cumple con Sección 8.1 y Criterios CA-08, CA-09 y CA-10:
 *  - Curso 1: Introducción a las Tecnologías de la Información (shortname: IINICIA-TI-101)
 *  - Curso 2: Desarrollo Web con React (shortname: IINICIA-REACT-202)
 *  - Usuarios de prueba: 1 Profesor (roleid=3 editingteacher) y 2 Estudiantes (roleid=5 student)
 */

const MOODLE_URL = process.env.MOODLE_BASE_URL || 'http://localhost:8080';
const MOODLE_TOKEN = process.env.MOODLE_WS_TOKEN || '';

async function callMoodleWs(wsfunction, params = {}) {
  const url = new URL('/webservice/rest/server.php', MOODLE_URL);
  const body = new URLSearchParams({
    wstoken: MOODLE_TOKEN,
    wsfunction,
    moodlewsrestformat: 'json',
    ...params,
  });

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const data = await res.json();
  if (data && data.exception) {
    throw new Error(`[Moodle WS ${wsfunction}] ${data.errorcode}: ${data.message}`);
  }
  return data;
}

const REQUIRED_COURSES = [
  {
    fullname: 'Curso 1. Introducción a las Tecnologías de la Información',
    shortname: 'IINICIA-TI-101',
    categoryid: 1,
    idnumber: 'TI-101',
    format: 'topics',
    numsections: 4,
    enablecompletion: 1,
    summary:
      'Curso obligatorio de validación IINICIA. Incluye presentación del curso, recurso PDF/página, foro de discusión, tarea práctica, cuestionario de evaluación, calificaciones y seguimiento de finalización de actividad.',
  },
  {
    fullname: 'Curso 2. Desarrollo Web con React',
    shortname: 'IINICIA-REACT-202',
    categoryid: 1,
    idnumber: 'WEB-202',
    format: 'topics',
    numsections: 4,
    enablecompletion: 1,
    summary:
      'Curso obligatorio de validación IINICIA. Incluye unidades temáticas de React/Next.js, recursos técnicos, actividad práctica entregable, foro técnico, evaluación final, calificaciones y finalización de curso.',
  },
];

const TEST_USERS = [
  {
    username: 'profesor.prueba',
    firstname: 'Roberto',
    lastname: 'Méndez (Profesor)',
    email: 'profesor@iinicia.edu.mx',
    password: 'Iinicia2026!Prof',
    roleid: 3, // editingteacher en Moodle
  },
  {
    username: 'estudiante.ana',
    firstname: 'Ana Sofía',
    lastname: 'García (Estudiante 1)',
    email: 'estudiante1@iinicia.edu.mx',
    password: 'Iinicia2026!Est1',
    roleid: 5, // student en Moodle
  },
  {
    username: 'estudiante.carlos',
    firstname: 'Carlos Eduardo',
    lastname: 'López (Estudiante 2)',
    email: 'estudiante2@iinicia.edu.mx',
    password: 'Iinicia2026!Est2',
    roleid: 5, // student en Moodle
  },
];

async function main() {
  if (!MOODLE_TOKEN) {
    console.log('⚠️  MOODLE_WS_TOKEN no definido. Mostrando plan de aprovisionamiento listo para ejecutar:');
    console.log(JSON.stringify({ courses: REQUIRED_COURSES, users: TEST_USERS }, null, 2));
    console.log('\nPara ejecutar contra Moodle en vivo: MOODLE_BASE_URL=http://localhost:8080 MOODLE_WS_TOKEN=tu_token node moodle/scripts/provision-courses-and-users.mjs');
    return;
  }

  console.log(`Conectando a Moodle en ${MOODLE_URL}...`);
  const createdCourses = [];

  for (const [idx, course] of REQUIRED_COURSES.entries()) {
    const existing = await callMoodleWs('core_course_get_courses_by_field', {
      field: 'shortname',
      value: course.shortname,
    });

    if (existing?.courses?.length > 0) {
      console.log(`✔ Curso existente encontrado: ${course.fullname} (ID: ${existing.courses[0].id})`);
      createdCourses.push(existing.courses[0]);
    } else {
      const res = await callMoodleWs('core_course_create_courses', {
        'courses[0][fullname]': course.fullname,
        'courses[0][shortname]': course.shortname,
        'courses[0][categoryid]': String(course.categoryid),
        'courses[0][idnumber]': course.idnumber,
        'courses[0][format]': course.format,
        'courses[0][numsections]': String(course.numsections),
        'courses[0][enablecompletion]': String(course.enablecompletion),
        'courses[0][summary]': course.summary,
      });
      console.log(`✔ Curso creado: ${course.fullname} (ID: ${res[0].id})`);
      createdCourses.push(res[0]);
    }
  }

  for (const user of TEST_USERS) {
    const existing = await callMoodleWs('core_user_get_users_by_field', {
      field: 'email',
      'values[0]': user.email,
    });

    let moodleUserId;
    if (existing?.length > 0) {
      moodleUserId = existing[0].id;
      console.log(`✔ Usuario existente en Moodle: ${user.email} (ID: ${moodleUserId})`);
    } else {
      const created = await callMoodleWs('core_user_create_users', {
        'users[0][username]': user.username,
        'users[0][firstname]': user.firstname,
        'users[0][lastname]': user.lastname,
        'users[0][email]': user.email,
        'users[0][password]': user.password,
        'users[0][auth]': 'manual',
      });
      moodleUserId = created[0].id;
      console.log(`✔ Usuario creado en Moodle: ${user.email} (ID: ${moodleUserId})`);
    }

    for (const c of createdCourses) {
      await callMoodleWs('enrol_manual_enrol_users', {
        'enrolments[0][roleid]': String(user.roleid),
        'enrolments[0][userid]': String(moodleUserId),
        'enrolments[0][courseid]': String(c.id),
      });
      console.log(`  ↳ Matriculado ${user.email} en curso ID ${c.id} con rol ${user.roleid === 3 ? 'Teacher' : 'Student'}`);
    }
  }

  console.log('\n✅ Aprovisionamiento de cursos y usuarios de ejemplo completado.');
}

main().catch((err) => {
  console.error('Error en aprovisionamiento de Moodle:', err.message);
  process.exit(1);
});
