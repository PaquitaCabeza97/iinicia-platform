'use client';

import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';
import { RoleCode, useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api';

export default function AdminPanelPage() {
  const { user, accessToken, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [rolesCatalog, setRolesCatalog] = useState<any[]>([]);
  const [programsCatalog, setProgramsCatalog] = useState<any[]>([]);
  const [coursesCatalog, setCoursesCatalog] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [moodleStatus, setMoodleStatus] = useState<any>(null);

  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('todos');
  const [filterStatus, setFilterStatus] = useState('todos');

  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedMoodleRole, setSelectedMoodleRole] = useState<
    'student' | 'editingteacher'
  >('student');

  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthorizedStaff =
    user &&
    user.roles.some((r) =>
      ['superadmin', 'admin', 'coordinador', 'soporte'].includes(r),
    );

  const loadAdminData = useCallback(async () => {
    if (!accessToken || !isAuthorizedStaff) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({
        ...(search ? { search } : {}),
        ...(filterRole !== 'todos' ? { role: filterRole } : {}),
        ...(filterStatus !== 'todos' ? { status: filterStatus } : {}),
      });

      const [usersRes, statusRes, logsRes] = await Promise.all([
        apiRequest(`/admin/users?${query.toString()}`, {}, accessToken),
        apiRequest('/admin/moodle-status', {}, accessToken).catch(() => null),
        apiRequest('/admin/audit-logs?limit=30', {}, accessToken).catch(() => ({
          auditLogs: [],
        })),
      ]);

      setUsers(usersRes.users || []);
      setRolesCatalog(usersRes.rolesCatalog || []);
      setProgramsCatalog(usersRes.programsCatalog || []);
      setCoursesCatalog(usersRes.coursesCatalog || []);
      if (statusRes) setMoodleStatus(statusRes.integration);
      if (logsRes) setAuditLogs(logsRes.auditLogs || []);

      if (!selectedUserId && usersRes.users?.length > 0) {
        setSelectedUserId(usersRes.users[0].id);
      }
      if (!selectedCourseId && usersRes.coursesCatalog?.length > 0) {
        setSelectedCourseId(usersRes.coursesCatalog[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'No se pudo cargar la información administrativa.');
    } finally {
      setLoading(false);
    }
  }, [accessToken, isAuthorizedStaff, search, filterRole, filterStatus, selectedUserId, selectedCourseId]);

  useEffect(() => {
    if (!authLoading) {
      loadAdminData();
    }
  }, [authLoading, loadAdminData]);

  const handleUpdateUser = async (
    userId: string,
    changes: { role_code?: RoleCode; status?: string; program_id?: string },
  ) => {
    if (!accessToken) return;
    setFeedback(null);
    setError(null);
    try {
      const res = await apiRequest(
        `/admin/users/${userId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ ...changes, sync_moodle: true }),
        },
        accessToken,
      );
      setFeedback(
        res.moodleSyncResult
          ? `✔ Usuario actualizado y sincronizado con Moodle: ${res.moodleSyncResult.message}`
          : '✔ Usuario actualizado y registrado en bitácora de auditoría.',
      );
      await loadAdminData();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el usuario.');
    }
  };

  const handleSyncMoodle = async (userId: string) => {
    if (!accessToken) return;
    setFeedback(null);
    setError(null);
    try {
      const res = await apiRequest(
        `/admin/users/${userId}/sync-moodle`,
        { method: 'POST' },
        accessToken,
      );
      setFeedback(`✔ ${res.moodleSyncResult.message}`);
      await loadAdminData();
    } catch (err: any) {
      setError(err.message || 'Error al sincronizar con Moodle.');
    }
  };

  const handleEnrolCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !selectedUserId || !selectedCourseId) return;
    setFeedback(null);
    setError(null);
    try {
      const res = await apiRequest(
        '/admin/enrollments',
        {
          method: 'POST',
          body: JSON.stringify({
            user_id: selectedUserId,
            course_mapping_id: selectedCourseId,
            moodle_role: selectedMoodleRole,
          }),
        },
        accessToken,
      );
      setFeedback(
        `✔ Matrícula autorizada y sincronizada en Moodle (Curso ID ${res.moodleEnrolResult.moodleCourseId}, Rol: ${res.moodleEnrolResult.roleName}).`,
      );
      await loadAdminData();
    } catch (err: any) {
      setError(err.message || 'No se pudo matricular al usuario en el curso.');
    }
  };

  const handleRevokeEnrollment = async (enrollmentId: string) => {
    if (!accessToken) return;
    setFeedback(null);
    setError(null);
    try {
      await apiRequest(
        `/admin/enrollments/${enrollmentId}`,
        { method: 'DELETE' },
        accessToken,
      );
      setFeedback('✔ Matrícula revocada y desmatriculada en Moodle.');
      await loadAdminData();
    } catch (err: any) {
      setError(err.message || 'No se pudo revocar la matrícula.');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">
        Cargando Panel Administrativo IINICIA...
      </div>
    );
  }

  // Requisito obligatorio Sección 6 y 9.2: Bloquear acceso a roles no autorizados
  if (!user || !isAuthorizedStaff) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-3">
          <h1 className="text-2xl font-extrabold">
            Acceso Restringido por RBAC (CA-06)
          </h1>
          <p className="text-sm">
            Esta sección está reservada exclusivamente para perfiles de
            Administración. Los datos administrativos no se envían a cuentas sin
            privilegios.
          </p>
          <Link
            href="/login"
            className="inline-block px-5 py-2.5 rounded-xl font-bold bg-iinicia-primary text-white text-sm"
          >
            Cambiar a cuenta de Administrador
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Encabezado del Panel Administrativo (Sección 10) */}
      <header className="bg-slate-900 text-white rounded-2xl p-8 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-400 text-slate-950">
            Sección 10 · Panel Administrativo y Sincronización Moodle
          </span>
          <h1 className="text-3xl font-extrabold mt-1">
            Control de Usuarios, Roles, Programas y Matrículas LMS
          </h1>
          <p className="text-sm text-slate-300 max-w-3xl">
            Todas las operaciones se ejecutan a través del backend NestJS sin
            exponer tokens de Moodle ni la Service Role Key de Supabase en el
            navegador (CA-14, CA-15).
          </p>
        </div>

        {moodleStatus && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-xs space-y-1 shrink-0">
            <div className="font-bold text-teal-300 uppercase">
              Estado Integración Moodle
            </div>
            <div>URL: {moodleStatus.moodleBaseUrl}</div>
            <div>Modo: {moodleStatus.mode}</div>
            <div className="text-emerald-300 font-semibold">
              ✔ Credenciales protegidas en Backend
            </div>
          </div>
        )}
      </header>

      {feedback && (
        <div
          role="status"
          className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-medium"
        >
          {feedback}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium"
        >
          {error}
        </div>
      )}

      {/* Buscador y Filtros de Usuarios (Sección 10) */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              1. Directorio de Usuarios, Roles, Estados y Vínculo Moodle
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Autoriza aspirantes, asigna el rol Estudiante o Profesor, asocia
              programas y sincroniza `moodle_user_id` sin duplicados (CA-10).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label
                htmlFor="admin-search"
                className="block text-xs font-bold text-slate-600 mb-1"
              >
                Buscar por nombre o correo
              </label>
              <input
                id="admin-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ej. Ana, profesor@..."
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="admin-role-filter"
                className="block text-xs font-bold text-slate-600 mb-1"
              >
                Filtrar por Rol
              </label>
              <select
                id="admin-role-filter"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm bg-white"
              >
                <option value="todos">Todos los roles</option>
                {rolesCatalog.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="admin-status-filter"
                className="block text-xs font-bold text-slate-600 mb-1"
              >
                Filtrar por Estado
              </label>
              <select
                id="admin-status-filter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm bg-white"
              >
                <option value="todos">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="activo">Activo</option>
                <option value="suspendido">Suspendido</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabla Responsive de Usuarios */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold uppercase text-slate-500 bg-slate-50">
                <th className="py-3 px-4">Usuario / Alta</th>
                <th className="py-3 px-4">Rol Actual (RBAC)</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Programa Académico</th>
                <th className="py-3 px-4">Vínculo Moodle</th>
                <th className="py-3 px-4">Cursos Matriculados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 align-top">
                  <td className="py-4 px-4">
                    <div className="font-bold text-slate-900">
                      {u.first_name} {u.last_name}
                    </div>
                    <div className="text-xs font-mono text-slate-600">
                      {u.email}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Alta: {new Date(u.created_at).toLocaleDateString('es-MX')}
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <select
                      aria-label={`Cambiar rol de ${u.email}`}
                      value={u.primaryRole}
                      onChange={(e) =>
                        handleUpdateUser(u.id, {
                          role_code: e.target.value as RoleCode,
                        })
                      }
                      className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-bold bg-white"
                    >
                      {rolesCatalog.map((r) => (
                        <option key={r.code} value={r.code}>
                          {r.name} ({r.code})
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="py-4 px-4">
                    <select
                      aria-label={`Cambiar estado de ${u.email}`}
                      value={u.status}
                      onChange={(e) =>
                        handleUpdateUser(u.id, { status: e.target.value })
                      }
                      className={`rounded-lg border px-2.5 py-1.5 text-xs font-bold ${
                        u.status === 'activo'
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                          : u.status === 'pendiente'
                          ? 'bg-amber-50 text-amber-900 border-amber-300'
                          : 'bg-rose-50 text-rose-900 border-rose-300'
                      }`}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="activo">Autorizado / Activo</option>
                      <option value="suspendido">Suspendido</option>
                    </select>
                  </td>

                  <td className="py-4 px-4">
                    <div className="space-y-1.5">
                      {u.programs?.map((p: any) => (
                        <span
                          key={p.id}
                          className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-teal-50 text-iinicia-primary border border-teal-200"
                        >
                          {p.program_code} ({p.academic_status})
                        </span>
                      ))}
                      <select
                        aria-label={`Asignar programa a ${u.email}`}
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value) {
                            handleUpdateUser(u.id, {
                              program_id: e.target.value,
                            });
                          }
                        }}
                        className="block w-full rounded border border-slate-200 px-2 py-1 text-xs bg-white text-slate-700"
                      >
                        <option value="">+ Asignar programa...</option>
                        {programsCatalog.map((prog) => (
                          <option key={prog.id} value={prog.id}>
                            {prog.code} - {prog.title.slice(0, 32)}...
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    {u.moodle_user_id ? (
                      <div className="space-y-1">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-100 text-emerald-900">
                          moodle_user_id: {u.moodle_user_id}
                        </span>
                        <div className="text-[11px] text-slate-500">
                          {u.moodle_sync_status}
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSyncMoodle(u.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-iinicia-primary text-white hover:bg-teal-900 transition"
                      >
                        Sincronizar con Moodle
                      </button>
                    )}
                  </td>

                  <td className="py-4 px-4">
                    <div className="space-y-1.5">
                      {u.enrollments?.length > 0 ? (
                        u.enrollments.map((enr: any) => (
                          <div
                            key={enr.id}
                            className="flex items-center justify-between gap-2 p-1.5 rounded bg-slate-100 text-xs"
                          >
                            <span>
                              <strong>{enr.course_code}</strong> (
                              {enr.moodle_role === 'editingteacher'
                                ? 'Teacher'
                                : 'Student'}
                              )
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRevokeEnrollment(enr.id)}
                              title="Desmatricular de Moodle"
                              className="text-rose-600 hover:text-rose-800 font-bold px-1"
                            >
                              ✕
                            </button>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">
                          Sin cursos asignados
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Sección 2: Autorizar Matrículas y Asignación Docente en Moodle (Sección 8.2 y 10) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div>
            <span className="text-xs font-bold uppercase text-iinicia-primary">
              Sección 8.2 · Web Services Moodle (`enrol_manual_enrol_users`)
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              2. Autorizar Inscripción a Curso en Moodle
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Matricula a un Estudiante (`student`) o asigna a un Profesor
              (`editingteacher`) en cualquiera de los dos cursos obligatorios de
              Moodle.
            </p>
          </div>

          <form onSubmit={handleEnrolCourse} className="space-y-4">
            <div>
              <label
                htmlFor="enrol-user"
                className="block text-xs font-bold text-slate-700 mb-1"
              >
                Seleccionar Usuario
              </label>
              <select
                id="enrol-user"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.first_name} {u.last_name} ({u.email}) — [{u.primaryRole}]
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="enrol-course"
                className="block text-xs font-bold text-slate-700 mb-1"
              >
                Seleccionar Curso de Moodle (`course_mappings`)
              </label>
              <select
                id="enrol-course"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
              >
                {coursesCatalog.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.course_name} (Moodle ID: {c.moodle_course_id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="enrol-role"
                className="block text-xs font-bold text-slate-700 mb-1"
              >
                Rol dentro del Curso en Moodle
              </label>
              <select
                id="enrol-role"
                value={selectedMoodleRole}
                onChange={(e) =>
                  setSelectedMoodleRole(
                    e.target.value as 'student' | 'editingteacher',
                  )
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
              >
                <option value="student">
                  Student (Estudiante matriculado · CA-12)
                </option>
                <option value="editingteacher">
                  Teacher (Profesor titular · CA-13)
                </option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl font-bold bg-iinicia-primary text-white hover:bg-teal-900 transition text-sm"
            >
              Autorizar y Sincronizar Matrícula en Moodle
            </button>
          </form>

          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
            <strong>Política de Gobernanza Académica (Sección 10):</strong> Las
            calificaciones son administradas exclusivamente en el libro de
            calificaciones de Moodle; no se permite su edición directa desde
            este panel administrativo.
          </div>
        </section>

        {/* Sección 3: Bitácora de Auditoría audit_logs (Sección 5.2, 10 y CA-19) */}
        <section className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-iinicia-primary">
                Tabla `public.audit_logs` · Criterio CA-19
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">
                3. Bitácora de Operaciones y Auditoría
              </h2>
            </div>
            <span className="text-xs text-slate-500">
              Últimos {auditLogs.length} eventos
            </span>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2.5 pr-1">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded font-mono font-bold bg-iinicia-navy text-teal-200">
                    {log.action}
                  </span>
                  <time className="text-slate-400">
                    {new Date(log.created_at).toLocaleString('es-MX')}
                  </time>
                </div>
                <div className="text-slate-700">
                  <strong>Actor:</strong> {log.actor_email} →{' '}
                  <strong>Usuario objetivo:</strong>{' '}
                  {log.target_user_email || log.entity_id}
                </div>
                <pre className="p-2 rounded bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto">
                  {JSON.stringify(log.details)}
                </pre>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
