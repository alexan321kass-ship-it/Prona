import {
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { IS_PUBLIC_KEY } from "./public.decorator";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    console.log(`--- Request to ${request.url} ---`);
    console.log("Authorization Header:", request.headers.authorization);

    // Buscamos si la ruta tiene el sello de @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    // Si es pública, dejamos pasar a cualquiera
    if (isPublic) {
      console.log("Route is public.");
      return true;
    }

    console.log("Route is private. Validating token...");
    // Validamos el JWT
    const isAuthenticated = (await super.canActivate(context)) as boolean;
    if (!isAuthenticated) return false;



    return true;
  }
}
