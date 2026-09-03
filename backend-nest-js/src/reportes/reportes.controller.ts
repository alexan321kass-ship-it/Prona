import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { ReportesService } from "./reportes.service";
import { Roles } from "../auth/roles.decorator";

@ApiBearerAuth("JWT-auth")
@Controller("reportes")
@Roles("Administrador") // Solo administradores
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  // Historial completo de ventas
  @Get("historial")
  async getHistorial() {
    const ventas = await this.reportesService.getHistorial();
    return { ventas };
  }

  // Listado de productos más vendidos
  @Get("mas-vendido")
  async getMasVendidos() {
    return this.reportesService.getMasVendidos();
  }

  // Análisis de clientes con mayor frecuencia de compra
  @Get("cliente-frecuente")
  async getClientesFrecuentes() {
    const clientes = await this.reportesService.getClientesFrecuentes();
    return { clientes };
  }

  // Resumen ejecutivo de ventas e ingresos
  @Get("resumen")
  async getResumen() {
    return this.reportesService.getResumen();
  }

  // Reporte de ventas mensuales del año en curso
  @Get("mensual")
  async getVentasMensuales() {
    return this.reportesService.getVentasMensuales();
  }

  // Métricas globales de la operación (clientes, productos, ingresos)
  @Get("metricas-grales")
  async getMetricasGrales() {
    return this.reportesService.getMetricasGrales();
  }
}
