import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  InternalServerErrorException,
} from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

// Este servicio es el puente entre Nest y la base de datos (usando Prisma)
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  // Se ejecuta apenas arranca el módulo
  async onModuleInit() {
    try {
      // Intentamos conectar con la DB
      await this.$connect();
      console.log("¡Conexión exitosa a la base de datos! :D");
    } catch (error) {
      // Si algo sale mal, tiramos un error que Nest entienda
      console.error("Error connecting to database:", error);
      throw new InternalServerErrorException(
        "No se pudo conectar a la base de datos",
      );
    }
  }

  // Se ejecuta cuando el servidor se apaga (limpieza)
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
