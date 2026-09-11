-- CreateEnum
CREATE TYPE "cotizacion_estado" AS ENUM ('Pendiente', 'Aprobada', 'Rechazada');

-- CreateEnum
CREATE TYPE "pedido_estado_pedido" AS ENUM ('Pendiente', 'Recibido', 'Preparación', 'Despachado', 'Entregado', 'Cancelado');

-- CreateEnum
CREATE TYPE "venta_estado_venta" AS ENUM ('Pendiente', 'Pagada', 'Cancelada');

-- CreateEnum
CREATE TYPE "usuario_tipo_documento" AS ENUM ('Cédula de ciudadanía', 'Tarjeta de identidad', 'Cédula de extranjería');

-- CreateEnum
CREATE TYPE "devolucion_estado_producto" AS ENUM ('Apto', 'Descarte');

-- CreateEnum
CREATE TYPE "movimiento_inventario_tipo" AS ENUM ('Ingreso', 'Salida', 'Ajuste');

-- CreateTable
CREATE TABLE "auditoria" (
    "id_auditoria" SERIAL NOT NULL,
    "fecha_evento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accion" TEXT NOT NULL,
    "tabla_afectada" TEXT,
    "registro_id" INTEGER,
    "detalles" TEXT,
    "ip_direccion" TEXT,
    "id_usuario" INTEGER,

    CONSTRAINT "auditoria_pkey" PRIMARY KEY ("id_auditoria")
);

-- CreateTable
CREATE TABLE "permiso" (
    "id_permiso" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "permiso_pkey" PRIMARY KEY ("id_permiso")
);

-- CreateTable
CREATE TABLE "permiso_rol" (
    "id_rol" INTEGER NOT NULL,
    "id_permiso" INTEGER NOT NULL,

    CONSTRAINT "permiso_rol_pkey" PRIMARY KEY ("id_rol","id_permiso")
);

-- CreateTable
CREATE TABLE "rol" (
    "id_rol" SERIAL NOT NULL,
    "nombre_rol" TEXT NOT NULL,

    CONSTRAINT "rol_pkey" PRIMARY KEY ("id_rol")
);

-- CreateTable
CREATE TABLE "categoria" (
    "id_categoria" SERIAL NOT NULL,
    "nombre_categoria" TEXT NOT NULL,
    "descripcion" TEXT,
    "estado" BOOLEAN DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categoria_pkey" PRIMARY KEY ("id_categoria")
);

-- CreateTable
CREATE TABLE "cliente" (
    "id_cliente" SERIAL NOT NULL,
    "nombre_cliente" TEXT NOT NULL,
    "identificacion" TEXT NOT NULL,
    "correo_cliente" TEXT,
    "telefono_cliente" TEXT,
    "direccion_cliente" TEXT,

    CONSTRAINT "cliente_pkey" PRIMARY KEY ("id_cliente")
);

-- CreateTable
CREATE TABLE "cotizacion" (
    "id_cotizacion" SERIAL NOT NULL,
    "fecha_cotizacion" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "fecha_vigencia" TIMESTAMP(3) NOT NULL,
    "estado" "cotizacion_estado" DEFAULT 'Pendiente',
    "id_usuario" INTEGER NOT NULL,
    "id_cliente" INTEGER NOT NULL,

    CONSTRAINT "cotizacion_pkey" PRIMARY KEY ("id_cotizacion")
);

-- CreateTable
CREATE TABLE "detalle_cotizacion" (
    "id_detalle_cotizacion" SERIAL NOT NULL,
    "id_cotizacion" INTEGER NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "detalle_cotizacion_pkey" PRIMARY KEY ("id_detalle_cotizacion")
);

-- CreateTable
CREATE TABLE "detalle_devolucion" (
    "id_detalle_devolucion" SERIAL NOT NULL,
    "id_devolucion" INTEGER NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(65,30) NOT NULL,
    "estado_producto" "devolucion_estado_producto" NOT NULL DEFAULT 'Apto',

    CONSTRAINT "detalle_devolucion_pkey" PRIMARY KEY ("id_detalle_devolucion")
);

-- CreateTable
CREATE TABLE "detalle_venta" (
    "id_detalle_venta" SERIAL NOT NULL,
    "id_venta" INTEGER NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "detalle_venta_pkey" PRIMARY KEY ("id_detalle_venta")
);

-- CreateTable
CREATE TABLE "devolucion" (
    "id_devolucion" SERIAL NOT NULL,
    "fecha_devolucion" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "motivo" TEXT NOT NULL,
    "id_venta" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,

    CONSTRAINT "devolucion_pkey" PRIMARY KEY ("id_devolucion")
);

-- CreateTable
CREATE TABLE "notificacion" (
    "id_notificacion" SERIAL NOT NULL,
    "fecha_notificacion" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "mensaje" TEXT NOT NULL,
    "id_pedido" INTEGER NOT NULL,

    CONSTRAINT "notificacion_pkey" PRIMARY KEY ("id_notificacion")
);

-- CreateTable
CREATE TABLE "pedido" (
    "id_pedido" SERIAL NOT NULL,
    "fecha_pedido" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "estado_pedido" "pedido_estado_pedido" DEFAULT 'Pendiente',
    "id_cliente" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,

    CONSTRAINT "pedido_pkey" PRIMARY KEY ("id_pedido")
);

-- CreateTable
CREATE TABLE "producto" (
    "id_producto" SERIAL NOT NULL,
    "codigo_interno" TEXT,
    "nombre_producto" TEXT NOT NULL,
    "descripcion" TEXT,
    "precio" DECIMAL(65,30) NOT NULL,
    "stock" INTEGER DEFAULT 0,
    "imagen_url" TEXT,
    "imagen_public_id" TEXT,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "id_categoria" INTEGER NOT NULL,

    CONSTRAINT "producto_pkey" PRIMARY KEY ("id_producto")
);

-- CreateTable
CREATE TABLE "movimiento_inventario" (
    "id_movimiento" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "tipo_movimiento" "movimiento_inventario_tipo" NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "motivo" TEXT,
    "id_producto" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,

    CONSTRAINT "movimiento_inventario_pkey" PRIMARY KEY ("id_movimiento")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id_usuario" SERIAL NOT NULL,
    "primer_nombre" TEXT NOT NULL,
    "primer_apellido" TEXT NOT NULL,
    "tipo_documento" "usuario_tipo_documento" NOT NULL,
    "numero_documento" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "contrasena" TEXT NOT NULL,
    "estado" BOOLEAN DEFAULT true,
    "requiere_cambio_contrasena" BOOLEAN NOT NULL DEFAULT true,
    "id_rol" INTEGER NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "venta" (
    "id_venta" SERIAL NOT NULL,
    "fecha_venta" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "estado_venta" "venta_estado_venta" DEFAULT 'Pendiente',
    "subtotal" DECIMAL(65,30) NOT NULL,
    "descuento" DECIMAL(65,30) DEFAULT 0.00,
    "impuestos" DECIMAL(65,30) DEFAULT 0.00,
    "total" DECIMAL(65,30),
    "id_pedido" INTEGER,
    "id_cliente" INTEGER,
    "id_usuario" INTEGER NOT NULL,

    CONSTRAINT "venta_pkey" PRIMARY KEY ("id_venta")
);

-- CreateIndex
CREATE INDEX "auditoria_id_usuario_idx" ON "auditoria"("id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "permiso_nombre_key" ON "permiso"("nombre");

-- CreateIndex
CREATE INDEX "permiso_rol_id_permiso_idx" ON "permiso_rol"("id_permiso");

-- CreateIndex
CREATE UNIQUE INDEX "rol_nombre_rol_key" ON "rol"("nombre_rol");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_identificacion_key" ON "cliente"("identificacion");

-- CreateIndex
CREATE INDEX "cotizacion_id_cliente_idx" ON "cotizacion"("id_cliente");

-- CreateIndex
CREATE INDEX "cotizacion_id_usuario_idx" ON "cotizacion"("id_usuario");

-- CreateIndex
CREATE INDEX "detalle_cotizacion_id_cotizacion_idx" ON "detalle_cotizacion"("id_cotizacion");

-- CreateIndex
CREATE INDEX "detalle_cotizacion_id_producto_idx" ON "detalle_cotizacion"("id_producto");

-- CreateIndex
CREATE INDEX "detalle_devolucion_id_devolucion_idx" ON "detalle_devolucion"("id_devolucion");

-- CreateIndex
CREATE INDEX "detalle_devolucion_id_producto_idx" ON "detalle_devolucion"("id_producto");

-- CreateIndex
CREATE INDEX "detalle_venta_id_producto_idx" ON "detalle_venta"("id_producto");

-- CreateIndex
CREATE INDEX "detalle_venta_id_venta_idx" ON "detalle_venta"("id_venta");

-- CreateIndex
CREATE INDEX "devolucion_id_venta_idx" ON "devolucion"("id_venta");

-- CreateIndex
CREATE INDEX "devolucion_id_usuario_idx" ON "devolucion"("id_usuario");

-- CreateIndex
CREATE INDEX "notificacion_id_pedido_idx" ON "notificacion"("id_pedido");

-- CreateIndex
CREATE INDEX "pedido_id_cliente_idx" ON "pedido"("id_cliente");

-- CreateIndex
CREATE INDEX "pedido_id_usuario_idx" ON "pedido"("id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "producto_codigo_interno_key" ON "producto"("codigo_interno");

-- CreateIndex
CREATE INDEX "producto_id_categoria_idx" ON "producto"("id_categoria");

-- CreateIndex
CREATE INDEX "movimiento_inventario_id_producto_idx" ON "movimiento_inventario"("id_producto");

-- CreateIndex
CREATE INDEX "movimiento_inventario_id_usuario_idx" ON "movimiento_inventario"("id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_numero_documento_key" ON "usuario"("numero_documento");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_correo_key" ON "usuario"("correo");

-- CreateIndex
CREATE INDEX "usuario_id_rol_idx" ON "usuario"("id_rol");

-- CreateIndex
CREATE INDEX "venta_id_pedido_idx" ON "venta"("id_pedido");

-- CreateIndex
CREATE INDEX "venta_id_usuario_idx" ON "venta"("id_usuario");

-- CreateIndex
CREATE INDEX "venta_id_cliente_idx" ON "venta"("id_cliente");

-- AddForeignKey
ALTER TABLE "auditoria" ADD CONSTRAINT "auditoria_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permiso_rol" ADD CONSTRAINT "permiso_rol_id_permiso_fkey" FOREIGN KEY ("id_permiso") REFERENCES "permiso"("id_permiso") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permiso_rol" ADD CONSTRAINT "permiso_rol_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "rol"("id_rol") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizacion" ADD CONSTRAINT "cotizacion_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "cotizacion" ADD CONSTRAINT "cotizacion_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "cliente"("id_cliente") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "detalle_cotizacion" ADD CONSTRAINT "detalle_cotizacion_id_cotizacion_fkey" FOREIGN KEY ("id_cotizacion") REFERENCES "cotizacion"("id_cotizacion") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "detalle_cotizacion" ADD CONSTRAINT "detalle_cotizacion_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "producto"("id_producto") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "detalle_devolucion" ADD CONSTRAINT "detalle_devolucion_id_devolucion_fkey" FOREIGN KEY ("id_devolucion") REFERENCES "devolucion"("id_devolucion") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "detalle_devolucion" ADD CONSTRAINT "detalle_devolucion_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "producto"("id_producto") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "detalle_venta" ADD CONSTRAINT "detalle_venta_id_venta_fkey" FOREIGN KEY ("id_venta") REFERENCES "venta"("id_venta") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "detalle_venta" ADD CONSTRAINT "detalle_venta_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "producto"("id_producto") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "devolucion" ADD CONSTRAINT "devolucion_id_venta_fkey" FOREIGN KEY ("id_venta") REFERENCES "venta"("id_venta") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "devolucion" ADD CONSTRAINT "devolucion_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "notificacion" ADD CONSTRAINT "notificacion_id_pedido_fkey" FOREIGN KEY ("id_pedido") REFERENCES "pedido"("id_pedido") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "pedido" ADD CONSTRAINT "pedido_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "cliente"("id_cliente") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "pedido" ADD CONSTRAINT "pedido_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "producto" ADD CONSTRAINT "producto_id_categoria_fkey" FOREIGN KEY ("id_categoria") REFERENCES "categoria"("id_categoria") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "movimiento_inventario" ADD CONSTRAINT "movimiento_inventario_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "producto"("id_producto") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "movimiento_inventario" ADD CONSTRAINT "movimiento_inventario_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "rol"("id_rol") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "venta" ADD CONSTRAINT "venta_id_pedido_fkey" FOREIGN KEY ("id_pedido") REFERENCES "pedido"("id_pedido") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "venta" ADD CONSTRAINT "venta_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "venta" ADD CONSTRAINT "venta_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "cliente"("id_cliente") ON DELETE SET NULL ON UPDATE RESTRICT;
