import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthService } from "./auth.service";
import { Request } from "express";

// Esta clase es la que se encarga de "romper el sello" del token y ver qué trae dentro
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      // Extractor personalizado: primero busca en la cookie, luego en el Header Bearer
      // Esto garantiza retrocompatibilidad con Swagger/Postman (que usan el Header)
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return req?.cookies?.token || null;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || "algo_muy_secreto",
    });
  }

  // Si el token es válido, Passport llama a esta función
  async validate(payload: any) {
    console.log("--- JWT Validation Debug ---");
    console.log("Payload:", JSON.stringify(payload));

    // Buscamos si el usuario del token todavía existe en la DB
    const user = await this.authService.findById(payload.id_usuario);

    if (!user) {
      console.warn(`User with ID ${payload.id_usuario} not found in database.`);
      // Si ya no existe, pues pa' fuera
      throw new UnauthorizedException("Usuario no válido o inexistente");
    }

    console.log(`User ${user.correo} validated successfully.`);
    // Lo que devolvemos aquí se guarda en req.user automáticamente
    return user;
  }
}
