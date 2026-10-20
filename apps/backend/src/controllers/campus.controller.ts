import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { RbacGuard } from '../guards/rbac.guard';
import { DataStoreService } from '../services/data-store.service';

@Controller('campus')
@UseGuards(RbacGuard)
export class CampusController {
  constructor(private readonly dataStore: DataStoreService) {}

  /**
   * Sección 9.2: Panel Mi IINICIA adaptado al rol autenticado.
   * - Estudiante: ve sus datos, programa y únicamente los cursos en los que está matriculado (CA-11, CA-12).
   * - Profesor: ve sus cursos asignados con rol docente (CA-13).
   * - Aspirante: ve estado de admisión sin acceso a cursos (Sección 6).
   * - Administrador: ve resumen de gestión y enlaces administrativos.
   */
  @Get('dashboard')
  getDashboard(@Req() req: any) {
    return this.dataStore.getPersonalizedDashboard(req.userContext);
  }

  /**
   * Sección 11: Genera acceso seguro SSO al Campus Moodle para un curso autorizado.
   */
  @Post('launch/:courseMappingId')
  launchCourse(@Req() req: any, @Param('courseMappingId') courseMappingId: string) {
    return this.dataStore.generateCourseLaunchForUser(
      req.userContext,
      courseMappingId,
    );
  }
}
