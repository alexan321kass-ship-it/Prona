import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "./roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Buscamos qué roles son los que pueden entrar aquí (usando @Roles)
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    // Si no hay roles requeridos, pues cualquiera que esté logueado puede pasar
    if (!requiredRoles) {
      return true;
    }
    // Sacamos al usuario de la petición (lo puso ahí el JwtStrategy)
    const { user } = context.switchToHttp().getRequest();
    console.log("--- RolesGuard Debug ---");
    console.log("Required Roles:", requiredRoles);
    console.log("User Role:", user?.rol?.nombre_rol);
    // Revisamos si el rol del usuario está en la lista de permitidos, o si es Super Administrador
    if (user && user.rol && user.rol.nombre_rol === "Super Administrador") {
      return true;
    }

    return (
      user &&
      user.rol &&
      user.rol.nombre_rol &&
      requiredRoles.includes(user.rol.nombre_rol)
    );
  }
}
