-- CreateTable
CREATE TABLE `categoria` (
    `id_categoria` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre_categoria` VARCHAR(100) NOT NULL,
    `descripcion` TEXT NULL,
    `estado` BOOLEAN NULL DEFAULT true,
    `fecha_creacion` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `fecha_actualizacion` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id_categoria`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cliente` (
    `id_cliente` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre_cliente` VARCHAR(100) NOT NULL,
    `identificacion` VARCHAR(30) NOT NULL,
    `correo_cliente` VARCHAR(100) NULL,
    `telefono_cliente` VARCHAR(20) NULL,
    `direccion_cliente` VARCHAR(255) NULL,

    UNIQUE INDEX `identificacion`(`identificacion`),
    PRIMARY KEY (`id_cliente`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cotizacion` (
    `id_cotizacion` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha_cotizacion` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `estado` ENUM('Pendiente', 'Aprobada', 'Rechazada') NULL DEFAULT 'Pendiente',
    `id_usuario` INTEGER NOT NULL,
    `id_cliente` INTEGER NOT NULL,

    INDEX `id_cliente`(`id_cliente`),
    INDEX `id_usuario`(`id_usuario`),
    PRIMARY KEY (`id_cotizacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `detalle_cotizacion` (
    `id_detalle_cotizacion` INTEGER NOT NULL AUTO_INCREMENT,
    `id_cotizacion` INTEGER NOT NULL,
    `id_producto` INTEGER NOT NULL,
    `cantidad` INTEGER NOT NULL,
    `precio_unitario` DECIMAL(10, 2) NOT NULL,

    INDEX `id_cotizacion`(`id_cotizacion`),
    INDEX `id_producto`(`id_producto`),
    PRIMARY KEY (`id_detalle_cotizacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `detalle_devolucion` (
    `id_detalle_devolucion` INTEGER NOT NULL AUTO_INCREMENT,
    `id_devolucion` INTEGER NOT NULL,
    `id_producto` INTEGER NOT NULL,
    `cantidad` INTEGER NOT NULL,
    `precio_unitario` DECIMAL(10, 2) NOT NULL,

    INDEX `id_devolucion`(`id_devolucion`),
    INDEX `id_producto`(`id_producto`),
    PRIMARY KEY (`id_detalle_devolucion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `detalle_venta` (
    `id_detalle_venta` INTEGER NOT NULL AUTO_INCREMENT,
    `id_venta` INTEGER NOT NULL,
    `id_producto` INTEGER NOT NULL,
    `cantidad` INTEGER NOT NULL,
    `precio_unitario` DECIMAL(10, 2) NOT NULL,

    INDEX `id_producto`(`id_producto`),
    INDEX `id_venta`(`id_venta`),
    PRIMARY KEY (`id_detalle_venta`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `devolucion` (
    `id_devolucion` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha_devolucion` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `motivo` TEXT NOT NULL,
    `id_venta` INTEGER NOT NULL,

    INDEX `id_venta`(`id_venta`),
    PRIMARY KEY (`id_devolucion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notificacion` (
    `id_notificacion` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha_notificacion` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `mensaje` TEXT NOT NULL,
    `id_pedido` INTEGER NOT NULL,

    INDEX `id_pedido`(`id_pedido`),
    PRIMARY KEY (`id_notificacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pedido` (
    `id_pedido` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha_pedido` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `estado_pedido` ENUM('Pendiente', 'En proceso', 'Entregado', 'Cancelado') NULL DEFAULT 'Pendiente',
    `id_cliente` INTEGER NOT NULL,
    `id_usuario` INTEGER NOT NULL,

    INDEX `id_cliente`(`id_cliente`),
    INDEX `id_usuario`(`id_usuario`),
    PRIMARY KEY (`id_pedido`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `producto` (
    `id_producto` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo_interno` VARCHAR(50) NULL,
    `nombre_producto` VARCHAR(100) NOT NULL,
    `descripcion` TEXT NULL,
    `precio` DECIMAL(10, 2) NOT NULL,
    `stock` INTEGER NULL DEFAULT 0,
    `imagen_url` VARCHAR(255) NULL,
    `id_categoria` INTEGER NOT NULL,

    UNIQUE INDEX `codigo_interno`(`codigo_interno`),
    INDEX `id_categoria`(`id_categoria`),
    PRIMARY KEY (`id_producto`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rol` (
    `id_rol` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre_rol` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `nombre_rol`(`nombre_rol`),
    PRIMARY KEY (`id_rol`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuario` (
    `id_usuario` INTEGER NOT NULL AUTO_INCREMENT,
    `primer_nombre` VARCHAR(50) NOT NULL,
    `primer_apellido` VARCHAR(50) NOT NULL,
    `tipo_documento` ENUM('Cédula de ciudadanía', 'Tarjeta de identidad', 'Cédula de extranjería') NOT NULL,
    `numero_documento` VARCHAR(30) NOT NULL,
    `correo` VARCHAR(100) NOT NULL,
    `contrasena` VARCHAR(255) NOT NULL,
    `estado` BOOLEAN NULL DEFAULT true,
    `id_rol` INTEGER NOT NULL,

    UNIQUE INDEX `numero_documento`(`numero_documento`),
    UNIQUE INDEX `correo`(`correo`),
    INDEX `id_rol`(`id_rol`),
    PRIMARY KEY (`id_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `venta` (
    `id_venta` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha_venta` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `estado_venta` ENUM('Pendiente', 'Pagada', 'Cancelada') NULL DEFAULT 'Pendiente',
    `subtotal` DECIMAL(10, 2) NOT NULL,
    `descuento` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `impuestos` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `total` DECIMAL(10, 2) NULL,
    `id_pedido` INTEGER NULL,
    `id_usuario` INTEGER NOT NULL,

    INDEX `id_pedido`(`id_pedido`),
    INDEX `id_usuario`(`id_usuario`),
    PRIMARY KEY (`id_venta`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `cotizacion` ADD CONSTRAINT `cotizacion_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `cotizacion` ADD CONSTRAINT `cotizacion_ibfk_2` FOREIGN KEY (`id_cliente`) REFERENCES `cliente`(`id_cliente`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `detalle_cotizacion` ADD CONSTRAINT `detalle_cotizacion_ibfk_1` FOREIGN KEY (`id_cotizacion`) REFERENCES `cotizacion`(`id_cotizacion`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `detalle_cotizacion` ADD CONSTRAINT `detalle_cotizacion_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `producto`(`id_producto`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `detalle_devolucion` ADD CONSTRAINT `detalle_devolucion_ibfk_1` FOREIGN KEY (`id_devolucion`) REFERENCES `devolucion`(`id_devolucion`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `detalle_devolucion` ADD CONSTRAINT `detalle_devolucion_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `producto`(`id_producto`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `detalle_venta` ADD CONSTRAINT `detalle_venta_ibfk_1` FOREIGN KEY (`id_venta`) REFERENCES `venta`(`id_venta`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `detalle_venta` ADD CONSTRAINT `detalle_venta_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `producto`(`id_producto`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `devolucion` ADD CONSTRAINT `devolucion_ibfk_1` FOREIGN KEY (`id_venta`) REFERENCES `venta`(`id_venta`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `notificacion` ADD CONSTRAINT `notificacion_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `pedido`(`id_pedido`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `pedido` ADD CONSTRAINT `pedido_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente`(`id_cliente`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `pedido` ADD CONSTRAINT `pedido_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `producto` ADD CONSTRAINT `producto_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categoria`(`id_categoria`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `usuario` ADD CONSTRAINT `usuario_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `rol`(`id_rol`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `venta` ADD CONSTRAINT `venta_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `pedido`(`id_pedido`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `venta` ADD CONSTRAINT `venta_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE RESTRICT;
