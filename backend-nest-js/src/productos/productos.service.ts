import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { CreateProductoDto, UpdateProductoDto } from "./dto/producto.dto";
import { CategoriasService } from "../categorias/categorias.service";
import * as xlsx from "xlsx";
import { NotificacionesService } from "../notificaciones/notificaciones.service";
import { IMAGE_STORAGE_SERVICE } from "../common/image-storage/image-storage.interface";
import type { IImageStorageService } from "../common/image-storage/image-storage.interface";

@Injectable()
export class ProductosService {
  constructor(
    private prisma: PrismaService,
    private notificacionesService: NotificacionesService,
    private categoriasService: CategoriasService,
    @Inject(IMAGE_STORAGE_SERVICE)
    private imageStorageService: IImageStorageService,
  ) {}

  // --- Lógica de Negocio ---

  // Obtener catálogo completo de productos con su categoría
  async findAll() {
    const productos = await (this.prisma.producto as any).findMany({
      include: {
        categoria: { select: { nombre_categoria: true } },
      },
      orderBy: { nombre_producto: "asc" },
    });

    return productos.map((p) => ({
      ...p,
      nombre_categoria: p.categoria?.nombre_categoria,
    }));
  }

  // Filtrar productos por identificador de categoría
  async getByCategory(categoryId: number) {
    const productos = await (this.prisma.producto as any).findMany({
      where: { id_categoria: categoryId },
      include: {
        categoria: { select: { nombre_categoria: true } },
      },
      orderBy: { nombre_producto: "asc" },
    });

    return productos.map((p) => ({
      ...p,
      nombre_categoria: p.categoria?.nombre_categoria,
    }));
  }

  // Buscar un producto específico por ID
  async getById(id: number) {
    const producto = await (this.prisma.producto as any).findUnique({
      where: { id_producto: id },
      include: {
        categoria: { select: { nombre_categoria: true } },
      },
    });

    if (!producto) {
      throw new NotFoundException("Producto no encontrado");
    }

    return {
      ...producto,
      nombre_categoria: producto.categoria?.nombre_categoria,
    };
  }

  // Registrar un nuevo producto incluyendo su imagen
  async create(data: CreateProductoDto, file?: Express.Multer.File) {
    if (data.nombre_producto) {
      const nombre = String(data.nombre_producto).trim();
      if (/^\d+$/.test(nombre)) {
        throw new BadRequestException("El nombre del producto debe ser texto y no solo números");
      }
      if (/[<>{}\[\]\\^~*|=#$%@!?;:\"'`+]/g.test(nombre)) {
        throw new BadRequestException("El nombre del producto no permite caracteres especiales");
      }
    }
    if (data.descripcion && /[<>{}\[\]\\^~*|=#$%@!?\"'`+]/g.test(data.descripcion)) {
      throw new BadRequestException("La descripción no permite caracteres especiales");
    }
    if (data.codigo_interno && !/^[a-zA-Z0-9-_]+$/.test(data.codigo_interno.trim())) {
      throw new BadRequestException("El formato del código es inválido");
    }

    if (data.id_categoria) {
      const catExists = await this.categoriasService.exists(
        Number(data.id_categoria),
      );
      if (!catExists) {
        throw new BadRequestException("La categoría especificada no existe");
      }
    }

    let imagen_url: string | null = null;
    let imagen_public_id: string | null = null;
    if (file) {
      const uploadResult = await this.imageStorageService.uploadImage(
        file,
        "productos",
      );
      imagen_url = uploadResult.url;
      imagen_public_id = uploadResult.publicId;
    }

    const nuevoProducto = await (this.prisma.producto as any).create({
      data: {
        codigo_interno: data.codigo_interno || null,
        nombre_producto: data.nombre_producto.trim(),
        descripcion: data.descripcion || null,
        precio: Number(data.precio),
        stock: Number(data.stock) || 0,
        id_categoria: Number(data.id_categoria),
        imagen_url: imagen_url,
        imagen_public_id: imagen_public_id,
      },
    });

    // Notificar a administradores sobre el nuevo producto
    try {
      await this.notificacionesService.sendPushNotification(
        "role_1",
        "Nuevo Producto Registrado",
        `Se ha añadido el producto: ${nuevoProducto.nombre_producto}`,
        { id_producto: nuevoProducto.id_producto.toString() },
      );
    } catch (e) {
      console.error("Error enviando notificación de nuevo producto:", e);
    }

    return nuevoProducto;
  }

  // Actualizar datos de un producto y gestionar reemplazo de imagen
  async update(
    id: number,
    data: UpdateProductoDto,
    file?: Express.Multer.File,
  ) {
    const productoActual = await this.getById(id);

    if (data.nombre_producto) {
      const nombre = String(data.nombre_producto).trim();
      if (/^\d+$/.test(nombre)) {
        throw new BadRequestException("El nombre del producto debe ser texto y no solo números");
      }
      if (/[<>{}\[\]\\^~*|=#$%@!?;:\"'`+]/g.test(nombre)) {
        throw new BadRequestException("El nombre del producto no permite caracteres especiales");
      }
    }
    if (data.descripcion && /[<>{}\[\]\\^~*|=#$%@!?\"'`+]/g.test(data.descripcion)) {
      throw new BadRequestException("La descripción no permite caracteres especiales");
    }
    if (data.codigo_interno && !/^[a-zA-Z0-9-_]+$/.test(data.codigo_interno.trim())) {
      throw new BadRequestException("El formato del código es inválido");
    }

    if (data.id_categoria) {
      const catExists = await this.categoriasService.exists(
        Number(data.id_categoria),
      );
      if (!catExists) {
        throw new BadRequestException("La categoría especificada no existe");
      }
    }

    let imagen_url: string | null = productoActual.imagen_url || null;
    let imagen_public_id: string | null =
      productoActual.imagen_public_id || null;

    if (file) {
      if (imagen_public_id) {
        await this.imageStorageService.deleteImage(imagen_public_id);
      }
      const uploadResult = await this.imageStorageService.uploadImage(
        file,
        "productos",
      );
      imagen_url = uploadResult.url;
      imagen_public_id = uploadResult.publicId;
    } else if (data.imagen_url === "" || data.imagen_url === "null") {
      if (imagen_public_id) {
        await this.imageStorageService.deleteImage(imagen_public_id);
      }
      imagen_url = null;
      imagen_public_id = null;
    }

    const productoActualizado = await (this.prisma.producto as any).update({
      where: { id_producto: id },
      data: {
        codigo_interno: data.codigo_interno,
        nombre_producto: data.nombre_producto?.trim(),
        descripcion: data.descripcion,
        precio: data.precio ? Number(data.precio) : undefined,
        stock: data.stock !== undefined ? Number(data.stock) : undefined,
        id_categoria: data.id_categoria ? Number(data.id_categoria) : undefined,
        imagen_url: imagen_url,
        imagen_public_id: imagen_public_id,
      },
    });

    // Notificar a administradores sobre la actualización
    try {
      await this.notificacionesService.sendPushNotification(
        "role_1",
        "Producto Actualizado",
        `Se ha modificado el producto: ${productoActualizado.nombre_producto}`,
        { id_producto: productoActualizado.id_producto.toString() },
      );
    } catch (e) {
      console.error(
        "Error enviando notificación de actualización de producto:",
        e,
      );
    }

    return productoActualizado;
  }

  // Subida masiva de productos vía archivo Excel o CSV
  async bulkCreate(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("No se proporcionó ningún archivo");
    }

    try {
      // Leer el archivo desde el buffer
      const workbook = xlsx.read(file.buffer, { type: "buffer" });

      // Asumimos que los datos están en la primera hoja
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convertir la hoja a JSON
      const data = xlsx.utils.sheet_to_json(worksheet);

      if (!data || data.length === 0) {
        throw new BadRequestException(
          "El archivo está vacío o no tiene el formato correcto",
        );
      }

      let creados = 0;
      let fallidos = 0;
      const errores: string[] = [];

      // Obtener categorías válidas para validar
      const categorias = await this.categoriasService.getCategories();
      const categoriasMap = new Map(
        categorias.map((c) => [c.id_categoria, true]),
      );

      for (let index = 0; index < data.length; index++) {
        try {
          // Mapear columnas esperadas (soporta varios nombres comunes):
          const rowData = data[index] as any;

          const nombre_producto =
            rowData["nombre_producto"] ||
            rowData["Nombre"] ||
            rowData["nombre"];
          const precio = rowData["precio"] || rowData["Precio"];
          const id_categoria =
            rowData["id_categoria"] ||
            rowData["Categoria"] ||
            rowData["categoria"];
          const codigo_interno =
            rowData["codigo_interno"] ||
            rowData["Codigo"] ||
            rowData["codigo"] ||
            rowData["codigo_interno"];
          const descripcion =
            rowData["descripcion"] ||
            rowData["Descripcion"] ||
            rowData["descripción"];
          const stock = rowData["stock"] || rowData["Stock"];

          if (!nombre_producto || !precio || !id_categoria) {
            throw new Error(
              "Faltan campos obligatorios (nombre_producto, precio, id_categoria)",
            );
          }

          if (!categoriasMap.has(Number(id_categoria))) {
            throw new Error(`La categoría con ID ${id_categoria} no existe`);
          }

          await (this.prisma.producto as any).create({
            data: {
              codigo_interno: codigo_interno ? String(codigo_interno) : null,
              nombre_producto: String(nombre_producto).trim(),
              descripcion: descripcion ? String(descripcion) : null,
              precio: Number(precio),
              stock: stock !== undefined ? Number(stock) : 0,
              id_categoria: Number(id_categoria),
              imagen_url: null, // Sin imagen por defecto en subida masiva
            },
          });
          creados++;
        } catch (err: any) {
          fallidos++;
          errores.push(`Fila ${index + 2}: ${err.message}`); // +2 por el encabezado y el índice base 0
        }
      }

      return {
        message: "Proceso de subida masiva finalizado",
        resultados: {
          total: data.length,
          creados,
          fallidos,
          errores: errores.length > 0 ? errores : undefined,
        },
      };
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Error procesando el archivo: ${error.message}`,
      );
    }
  }

  // Ajustar niveles de inventario (suma, resta o asignación directa)
  async updateStock(
    id: number,
    cantidad: number,
    operacion: "sumar" | "restar" | "set",
  ) {
    const producto = await this.getById(id);
    let nuevoStock = producto.stock || 0;

    if (operacion === "sumar") {
      nuevoStock += cantidad;
    } else if (operacion === "restar") {
      nuevoStock -= cantidad;
      if (nuevoStock < 0) {
        throw new BadRequestException("Stock insuficiente");
      }
    } else {
      nuevoStock = cantidad;
    }

    return this.prisma.producto.update({
      where: { id_producto: id },
      data: { stock: nuevoStock },
    });
  }

  // Eliminar registro del producto y su archivo de imagen asociado
  async delete(id: number) {
    const producto = await this.getById(id);

    // Validar integridad referencial manual en tablas relacionadas
    const hasRelated = await this.prisma.detalle_venta.findFirst({
      where: { id_producto: id },
    });

    const hasRelatedCot = await this.prisma.detalle_cotizacion.findFirst({
      where: { id_producto: id },
    });

    if (hasRelated || hasRelatedCot) {
      throw new BadRequestException(
        "No se puede eliminar el producto porque tiene ventas o cotizaciones asociadas",
      );
    }

    if (producto.imagen_public_id) {
      await this.imageStorageService.deleteImage(producto.imagen_public_id);
    }

    return this.prisma.producto.delete({
      where: { id_producto: id },
    });
  }
}
