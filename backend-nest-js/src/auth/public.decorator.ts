import { SetMetadata } from "@nestjs/common";

// Esta es la llave secreta para marcar rutas como públicas
export const IS_PUBLIC_KEY = "isPublic";
// El decorador @Public() sirve para que no te pida token en esa ruta específica
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
