import { SetMetadata } from "@nestjs/common";

// Llave para guardar los roles permitidos en los metadatos
export const ROLES_KEY = "roles";
// El decorador @Roles(1, 2) sirve para decir quién tiene permiso de entrar
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
