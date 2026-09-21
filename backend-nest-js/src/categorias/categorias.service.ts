import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { CreateCategoriaDto, UpdateCategoriaDto } from "./dto/categoria.dto";

@Injectable()
export class CategoriasService {
  constructor(private prisma: PrismaService) {}

  // Listar todas las categorías disponibles
  async getCategories() {
    return (this.prisma as any).categoria.findMany({
      orderBy: { nombre_categoria: "asc" },
    });
  }

  // Buscar una categoría por ID
  async getById(id: number) {
    const cat = await (this.prisma as any).categoria.findUnique({
      where: { id_categoria: id },
    });
    if (!cat) throw new NotFoundException(`Categoría #${id} no encontrada`);
    return cat;
  }

  // Verificar que una categoría existe (para validaciones externas)
  async exists(id: number): Promise<boolean> {
    const cat = await (this.prisma as any).categoria.findUnique({
      where: { id_categoria: id },
    });
    return !!cat;
  }

  // Crear una nueva categoría
  async createCategoria(data: CreateCategoriaDto) {
    const nombre = data.nombre_categoria ? String(data.nombre_categoria).trim() : "";
    if (!nombre) {
      throw new BadRequestException("El nombre de la categoría es obligatorio");
    }
    if (/^\d+$/.test(nombre)) {
      throw new BadRequestException("El nombre de la categoría debe ser texto y no solo números");
    }

    const existe = await (this.prisma as any).categoria.findFirst({
      where: { nombre_categoria: { contains: nombre } },
    });
    if (existe)
      throw new BadRequestException(
        `Ya existe una categoría con el nombre "${nombre}"`,
      );
    return (this.prisma as any).categoria.create({
      data: {
        ...data,
        nombre_categoria: nombre,
      },
    });
  }

  // Actualizar una categoría existente
  async updateCategoria(id: number, data: UpdateCategoriaDto) {
    const cat = await (this.prisma as any).categoria.findUnique({
      where: { id_categoria: id },
    });
    if (!cat) throw new NotFoundException(`Categoría #${id} no encontrada`);
    if (data.nombre_categoria) {
      const nombre = String(data.nombre_categoria).trim();
      if (!nombre) {
        throw new BadRequestException("El nombre de la categoría no puede estar vacío");
      }
      if (/^\d+$/.test(nombre)) {
        throw new BadRequestException("El nombre de la categoría debe ser texto y no solo números");
      }
      if (nombre !== cat.nombre_categoria) {
        const existe = await (this.prisma as any).categoria.findFirst({
          where: { nombre_categoria: { contains: nombre } },
        });
        if (existe)
          throw new BadRequestException(
            `Ya existe una categoría con el nombre "${nombre}"`,
          );
      }
    }
    return (this.prisma as any).categoria.update({
      where: { id_categoria: id },
      data: {
        ...data,
        nombre_categoria: data.nombre_categoria ? String(data.nombre_categoria).trim() : undefined,
      },
    });
  }

  // Eliminar categoría (solo si no tiene productos asociados)
  async deleteCategoria(id: number) {
    const cat = await (this.prisma as any).categoria.findUnique({
      where: { id_categoria: id },
    });
    if (!cat) throw new NotFoundException(`Categoría #${id} no encontrada`);
    const count = await (this.prisma as any).producto.count({
      where: { id_categoria: id },
    });
    if (count > 0)
      throw new BadRequestException(
        `No se puede eliminar: hay ${count} producto(s) en esta categoría`,
      );
    return (this.prisma as any).categoria.delete({
      where: { id_categoria: id },
    });
  }
}
