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
} from "@nestjs/common";
import { CategoriasService } from "./categorias.service";
import { AuthGuard } from "@nestjs/passport";
import { Public } from "../auth/public.decorator";
import { CreateCategoriaDto, UpdateCategoriaDto } from "./dto/categoria.dto";
import { ApiBearerAuth } from "@nestjs/swagger";

// Mantiene las rutas bajo /productos para compatibilidad con el frontend React
@ApiBearerAuth("JWT-auth")
@Controller("productos")
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  // Listar categorías de productos (Público)
  @Get("categorias")
  async getCategorias() {
    const categorias = await this.categoriasService.getCategories();
    return { categorias };
  }

  // Crear nueva categoría
  @UseGuards(AuthGuard("jwt"))
  @Post("categorias")
  async createCategoria(@Body() dto: CreateCategoriaDto) {
    const categoria = await this.categoriasService.createCategoria(dto);
    return { message: "Categoría creada", categoria };
  }

  // Actualizar categoría existente
  @UseGuards(AuthGuard("jwt"))
  @Put("categorias/:id")
  async updateCategoria(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateCategoriaDto,
  ) {
    const categoria = await this.categoriasService.updateCategoria(id, dto);
    return { message: "Categoría actualizada", categoria };
  }

  // Eliminar categoría (solo si no tiene productos asociados)
  @UseGuards(AuthGuard("jwt"))
  @Delete("categorias/:id")
  async deleteCategoria(@Param("id", ParseIntPipe) id: number) {
    await this.categoriasService.deleteCategoria(id);
    return { message: "Categoría eliminada" };
  }
}
