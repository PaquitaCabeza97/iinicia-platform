import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DataStoreService } from '../services/data-store.service';
import { RoleCode } from '../types/domain';

export const ROLES_KEY = 'iinicia_required_roles';
export const RequireRoles = (...roles: RoleCode[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly dataStore: DataStoreService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleCode[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const authHeader: string | undefined = request.headers['authorization'];
    const headerUserId: string | undefined = request.headers['x-iinicia-user'];

    let identifier = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      identifier = authHeader.replace('Bearer ', '').trim();
    } else if (headerUserId) {
      identifier = String(headerUserId).trim();
    }

    if (!identifier) {
      throw new UnauthorizedException(
        'Autenticación requerida. Inicia sesión en el Portal IINICIA (Supabase Auth).',
      );
    }

    const userContext = this.dataStore.resolveUserContextByIdOrEmail(identifier);
    if (!userContext) {
      throw new UnauthorizedException('Sesión inválida o usuario no registrado en profiles.');
    }

    if (userContext.profile.status === 'suspendido') {
      throw new ForbiddenException('Tu cuenta se encuentra suspendida por administración.');
    }

    request.userContext = userContext;

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const hasPermission = userContext.roles.some((role) =>
      requiredRoles.includes(role),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Acceso denegado (RBAC CA-06). Tu rol actual (${userContext.primaryRole}) no tiene permisos para esta operación.`,
      );
    }

    return true;
  }
}
