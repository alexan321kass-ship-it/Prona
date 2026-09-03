import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  Request,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { AuthGuard } from "@nestjs/passport";
import { Roles } from "../auth/roles.decorator";
import { UpdateUserDto } from "./dto/user.dto";
import { RegisterDto } from "../auth/dto/auth.dto";

@ApiBearerAuth("JWT-auth")
@Controller("users")
@UseGuards(AuthGuard("jwt"))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Obtener todos los usuarios (Admin y Super Admin)
  @Get()
  @Roles("Administrador", "Super Administrador")
  async findAll() {
    return this.usersService.findAll();
  }

  // Obtener un usuario específico por ID
  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.findById(id);
  }

  // Registro de nuevos usuarios
  @Post("register")
  @Roles("Administrador", "Super Administrador")
  async create(@Body() registerDto: RegisterDto, @Request() req) {
    if (
      req.user.rol.nombre_rol === "Administrador" &&
      (registerDto.id_rol === 1 || registerDto.id_rol === 3)
    ) {
      throw new ForbiddenException(
        "Los Administradores solo pueden crear usuarios Asesores",
      );
    }
    const result = await this.usersService.create(registerDto);
    return { message: "Usuario creado exitosamente", id: result.id_usuario };
  }

  // Actualizar información de usuario
  @Put(":id")
  @Roles("Administrador", "Super Administrador")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    const targetUser = await this.usersService.findById(id);
    if (!targetUser) throw new BadRequestException("Usuario no encontrado");

    const currentUserRole = req.user.rol.nombre_rol;

    if (currentUserRole === "Administrador") {
      if (
        req.user.id_usuario !== id &&
        (targetUser.rol.nombre_rol === "Super Administrador" ||
          targetUser.rol.nombre_rol === "Administrador")
      ) {
        throw new ForbiddenException(
          "No tienes permiso para editar a este usuario",
        );
      }
      if (
        updateUserDto.id_rol &&
        updateUserDto.id_rol !== 2 &&
        req.user.id_usuario !== id
      ) {
        throw new ForbiddenException("No tienes permiso para asignar este rol");
      }
    }

    await this.usersService.update(id, updateUserDto);
    return { message: "Usuario actualizado correctamente" };
  }

  // Eliminar un usuario
  @Delete(":id")
  @Roles("Administrador", "Super Administrador")
  async remove(@Param("id", ParseIntPipe) id: number, @Request() req) {
    const targetUser = await this.usersService.findById(id);
    if (
      req.user.rol.nombre_rol === "Administrador" &&
      (targetUser.rol.nombre_rol === "Super Administrador" ||
        targetUser.rol.nombre_rol === "Administrador")
    ) {
      throw new ForbiddenException(
        "No tienes permiso para eliminar a este usuario",
      );
    }
    await this.usersService.delete(id);
    return { message: "Usuario eliminado" };
  }

  // Alternar estado de un usuario
  @Put(":id/estado")
  @Roles("Administrador", "Super Administrador")
  async toggleEstado(
    @Param("id", ParseIntPipe) id: number,
    @Body("estado") estado: boolean,
    @Request() req,
  ) {
    const targetUser = await this.usersService.findById(id);
    if (
      req.user.rol.nombre_rol === "Administrador" &&
      (targetUser.rol.nombre_rol === "Super Administrador" ||
        targetUser.rol.nombre_rol === "Administrador")
    ) {
      throw new ForbiddenException(
        "No tienes permiso para cambiar el estado de este usuario",
      );
    }
    if (typeof estado !== "boolean") {
      throw new BadRequestException("Estado inválido");
    }
    await this.usersService.toggleEstado(id, estado);
    return { message: `Usuario ${estado ? "activado" : "inactivado"}` };
  }

  // Restablecer contraseña temporal
  @Post(":id/reset-password")
  @Roles("Administrador", "Super Administrador")
  async resetPassword(@Param("id", ParseIntPipe) id: number, @Request() req) {
    const targetUser = await this.usersService.findById(id);
    if (
      req.user.rol.nombre_rol === "Administrador" &&
      (targetUser.rol.nombre_rol === "Super Administrador" ||
        targetUser.rol.nombre_rol === "Administrador")
    ) {
      throw new ForbiddenException(
        "No tienes permiso para restablecer la contraseña de este usuario",
      );
    }
    const result = await this.usersService.resetPassword(id);
    return {
      message: "Contraseña restablecida y cambio obligatorio activado",
      tempPassword: result.tempPassword,
    };
  }
}
