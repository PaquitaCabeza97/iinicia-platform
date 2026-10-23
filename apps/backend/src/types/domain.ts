export type RoleCode =
  | 'superadmin'
  | 'admin'
  | 'coordinador'
  | 'profesor'
  | 'estudiante'
  | 'aspirante'
  | 'soporte';

export type UserStatus = 'pendiente' | 'activo' | 'suspendido' | 'inactivo';

export type EnrollmentStatus = 'pendiente' | 'autorizada' | 'rechazada' | 'sincronizada';

export type ProgramType = 'licenciatura' | 'diplomado' | 'certificacion' | 'curso';

export interface RoleRecord {
  id: string;
  code: RoleCode;
  name: string;
  description: string;
  moodle_archetype: string;
}

export interface ProfileRecord {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  status: UserStatus;
  moodle_user_id: number | null;
  moodle_sync_status: 'sin_sincronizar' | 'sincronizado' | 'error';
  moodle_last_sync_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProgramSemester {
  semester: number;
  title: string;
  subjects: string[];
}

export interface ProgramRecord {
  id: string;
  slug: string;
  code: string;
  title: string;
  type: ProgramType;
  modality: string;
  duration: string;
  summary: string;
  description: string;
  semesters?: ProgramSemester[];
  is_active: boolean;
}

export interface CourseSyllabusItem {
  unit: string;
  title: string;
  activities: string[];
}

export interface CourseMappingRecord {
  id: string;
  program_id: string;
  course_code: string;
  course_name: string;
  moodle_course_id: number;
  moodle_shortname: string;
  moodle_category_id: number;
  description: string;
  is_active: boolean;
  minimum_content_checklist: string[];
  syllabus: CourseSyllabusItem[];
}

export interface UserProgramRecord {
  id: string;
  user_id: string;
  program_id: string;
  academic_status: 'aspirante' | 'inscrito' | 'cursando' | 'egresado' | 'baja';
  authorized_by?: string;
  enrolled_at: string;
}

export interface EnrollmentRequestRecord {
  id: string;
  user_id: string;
  course_mapping_id: string;
  moodle_role: 'student' | 'editingteacher';
  status: EnrollmentStatus;
  authorized_by?: string;
  authorized_at?: string;
  moodle_synced_at?: string;
  notes?: string;
  created_at: string;
}

export interface AuditLogRecord {
  id: string;
  actor_id: string | null;
  actor_email?: string;
  target_user_id: string | null;
  target_user_email?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: Record<string, unknown>;
  created_at: string;
}
