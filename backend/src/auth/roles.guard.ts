import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { AppRole, ROLES_KEY } from "./roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const handlerRoles = Reflect.getMetadata(
      ROLES_KEY,
      context.getHandler(),
    ) as AppRole[] | undefined;
    const classRoles = Reflect.getMetadata(ROLES_KEY, context.getClass()) as
      AppRole[] | undefined;
    const roles = handlerRoles || classRoles || [];

    if (roles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userRole = request.user?.role as AppRole | undefined;

    if (userRole && roles.includes(userRole)) {
      return true;
    }

    throw new ForbiddenException(
      `Requires one of these roles: ${roles.join(", ")}`,
    );
  }
}
