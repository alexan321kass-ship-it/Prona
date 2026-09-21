import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  Req,
  ForbiddenException,
} from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { ClientesService } from "./clientes.service";
import { AuthGuard } from "@nestjs/passport";
import { CreateClienteDto, UpdateClienteDto } from "./dto/cliente.dto";

@ApiBearerAuth("JWT-auth")
@Controller("clientes")
@UseGuards(AuthGuard("jwt"))
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  // Listar todos los clientes registrados
  @Get()
  async findAll() {
    const clientes = await this.clientesService.getAll();
    return { clientes };
  }

  // Buscar clientes por coincidencia de nombre o identificación
  @Get("buscar")
  async search(@Query("q") q: string) {
    const clientes = await this.clientesService.search(q);
    return { clientes };
  }

  // Obtener información de un cliente específico
  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number) {
    const cliente = await this.clientesService.getById(id);
    return { cliente };
  }

  // Registrar un nuevo cliente
  @Post()
  async create(@Body() createClienteDto: CreateClienteDto) {
    const result = await this.clientesService.create(createClienteDto);
    return {
      message: "Cliente creado exitosamente",
      id_cliente: result.id_cliente,
    };
  }

  // Actualizar datos de un cliente
  @Put(":id")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateClienteDto: UpdateClienteDto,
  ) {
    await this.clientesService.update(id, updateClienteDto);
    return { message: "Cliente actualizado exitosamente" };
  }

  // Eliminar un cliente por su ID (solo Administradores / Super Administradores)
  @Delete(":id")
  async remove(@Req() req: any, @Param("id", ParseIntPipe) id: number) {
    if (req.user?.id_rol === 2) {
      throw new ForbiddenException(
        "Los asesores no tienen permisos para eliminar clientes. Solo pueden inactivarlos.",
      );
    }
    await this.clientesService.delete(id);
    return { message: "Cliente eliminado exitosamente" };
  }
}
