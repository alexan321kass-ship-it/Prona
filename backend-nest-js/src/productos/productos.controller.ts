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
  Query,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
//El Service donde va la lógica
import { ProductosService } from "./productos.service";
//Guard donde va la autenticación de JWT (JSON Web Token xd )
import { AuthGuard } from "@nestjs/passport";
// Decorador de rutas públicas 🕵️‍♂️
import { Public } from "../auth/public.decorator";
//DTOs (tipado de datos + validación de datos btw nwn)
import { CreateProductoDto, UpdateProductoDto } from "./dto/producto.dto";
import { ApiBearerAuth, ApiConsumes } from "@nestjs/swagger";

//todas las rutas empiezan con /productos
@ApiBearerAuth("JWT-auth")
@Controller("productos")
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  // Listar todos los productos (Público)
  @Get()
  async findAll() {
    const productos = await this.productosService.findAll();
    return { productos };
  }

  // Filtrar productos por categoría (Público)
  @Get("categoria/:id")
  async findByCategory(@Param("id", ParseIntPipe) id: number) {
    const productos = await this.productosService.getByCategory(id);
    return { productos };
  }

  // Obtener detalle de un producto específico
  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number) {
    const producto = await this.productosService.getById(id);
    return { producto };
  }

  // Subida masiva de productos (Excel o CSV)
  @Post("bulk")
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  async bulkCreate(@UploadedFile() file: Express.Multer.File) {
    return await this.productosService.bulkCreate(file);
  }

  // Registrar nuevo producto con soporte para carga de imagen (Multipart)
  @Post()
  @UseInterceptors(FileInterceptor("imagen"))
  @ApiConsumes("multipart/form-data")
  async create(
    @Body() createProductoDto: CreateProductoDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const result = await this.productosService.create(createProductoDto, file);
    return {
      message: "Producto creado exitosamente",
      id_producto: result.id_producto,
    };
  }

  // Actualizar producto y gestionar cambio de imagen
  @Put(":id")
  @UseInterceptors(FileInterceptor("imagen"))
  @ApiConsumes("multipart/form-data")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateProductoDto: UpdateProductoDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    await this.productosService.update(id, updateProductoDto, file);
    return { message: "Producto actualizado exitosamente" };
  }

  // Ajustar niveles de stock para un producto
  @Put(":id/stock")
  async updateStock(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: { cantidad: number; operacion: "sumar" | "restar" | "set" },
  ) {
    const result = await this.productosService.updateStock(
      id,
      body.cantidad,
      body.operacion,
    );
    return {
      message: "Stock actualizado",
      nuevoStock: result.stock,
    };
  }

  // Eliminar un producto del catálogo
  @Delete(":id")
  async remove(@Param("id", ParseIntPipe) id: number) {
    await this.productosService.delete(id);
    return { message: "Producto eliminado exitosamente" };
  }
}
