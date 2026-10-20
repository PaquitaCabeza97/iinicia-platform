import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RbacGuard, RequireRoles } from '../guards/rbac.guard';
import { DataStoreService } from '../services/data-store.service';
import { MoodleService } from '../services/moodle.service';
import { RoleCode, UserStatus } from '../types/domain';

@Controller('admin')
@UseGuards(RbacGuard)
export class AdminController {
  constructor(
    private readonly dataStore: DataStoreService,
    private readonly moodleService: MoodleService,
  ) {}

  /**
   * Sección 10: Consultar, buscar y filtrar usuarios; visualizar tipo de usuario, estado,
   * programa, fecha de alta y vínculo con Moodle.
   */
  @Get('users')
  @RequireRoles('superadmin', 'admin', 'coordinador', 'soporte')
  listUsers(
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
  ) {
    return {
      users: this.dataStore.listUsersForAdmin({ search, role, status }),
      rolesCatalog: this.dataStore.getRolesCatalog(),
      programsCatalog: this.dataStore.getPublicPrograms(),
      coursesCatalog: this.dataStore.getAllCoursesForAdmin(),
    };
  }

  /**
   * Sección 10: Asignar o retirar roles, autorizar o suspender usuarios,
   * asignar estudiantes a programas y sincronizar con Moodle.
   */
  @Patch('users/:id')
  @RequireRoles('superadmin', 'admin')
  async updateUser(
    @Req() req: any,
    @Param('id') targetUserId: string,
    @Body()
    body: {
      role_code?: RoleCode;
      status?: UserStatus;
      program_id?: string;
      sync_moodle?: boolean;
    },
  ) {
    return this.dataStore.updateUserRoleAndStatus(
      req.userContext,
      targetUserId,
      body,
    );
  }

  /**
   * Sección 8.2 y 10 (CA-10): Ejecutar sincronización explícita de usuario con Moodle sin duplicados.
   */
  @Post('users/:id/sync-moodle')
  @RequireRoles('superadmin', 'admin')
  async syncUserMoodle(@Req() req: any, @Param('id') targetUserId: string) {
    const result = await this.dataStore.syncUserWithMoodle(
      req.userContext,
      targetUserId,
    );
    return {
      moodleSyncResult: result,
      user: this.dataStore.listUsersForAdmin().find((u) => u.id === targetUserId),
    };
  }

  /**
   * Sección 8.2 y 10: Autorizar inscripciones y matricular profesor/estudiante en cursos de Moodle.
   */
  @Post('enrollments')
  @RequireRoles('superadmin', 'admin')
  async createEnrollment(
    @Req() req: any,
    @Body()
    body: {
      user_id: string;
      course_mapping_id: string;
      moodle_role?: 'student' | 'editingteacher';
      notes?: string;
    },
  ) {
    return this.dataStore.authorizeAndEnrolCourse(req.userContext, body);
  }

  /**
   * Sección 8.2: Desmatricular usuario de un curso en Moodle.
   */
  @Delete('enrollments/:id')
  @RequireRoles('superadmin', 'admin')
  async deleteEnrollment(@Req() req: any, @Param('id') enrollmentId: string) {
    return this.dataStore.revokeCourseEnrollment(req.userContext, enrollmentId);
  }

  /**
   * Sección 10: Consultar el estado de sincronización e integración con Moodle.
   */
  @Get('moodle-status')
  @RequireRoles('superadmin', 'admin', 'coordinador')
  getMoodleStatus() {
    return {
      integration: this.moodleService.getIntegrationStatus(),
      courses: this.dataStore.getAllCoursesForAdmin(),
    };
  }

  /**
   * Sección 10 y CA-19: Visualizar bitácora de operaciones relevantes (audit_logs).
   */
  @Get('audit-logs')
  @RequireRoles('superadmin', 'admin')
  getAuditLogs(@Query('limit') limit?: string) {
    const parsedLimit = limit ? Math.min(Number(limit) || 50, 200) : 50;
    return {
      auditLogs: this.dataStore.getAuditLogs(parsedLimit),
    };
  }

  /**
   * Sección 10 (Restricción explícita):
   * "No permitir la edición directa de calificaciones de Moodle desde el portal"
   */
  @Post('grades/override')
  @RequireRoles('superadmin', 'admin')
  rejectDirectGradeModification() {
    throw new ForbiddenException(
      'Operación bloqueada por política arquitectónica (Sección 10): Moodle es la fuente de verdad académica; no se permite editar calificaciones directamente desde el portal administrativo.',
    );
  }
}
