SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE `detalle_venta`;
TRUNCATE TABLE `detalle_cotizacion`;
TRUNCATE TABLE `detalle_devolucion`;
TRUNCATE TABLE `devolucion`;
TRUNCATE TABLE `venta`;
TRUNCATE TABLE `notificacion`;
TRUNCATE TABLE `pedido`;
TRUNCATE TABLE `cotizacion`;
TRUNCATE TABLE `producto`;
TRUNCATE TABLE `categoria`;
TRUNCATE TABLE `usuario`;
TRUNCATE TABLE `rol`;
TRUNCATE TABLE `cliente`;

INSERT INTO `categoria` (`id_categoria`, `nombre_categoria`, `descripcion`, `estado`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, 'Galletas', 'Productos horneados a base de cereales.', 1, '2025-12-01 18:56:40', '2025-12-01 18:56:40'),
(2, 'Cereales', 'Desayunos nutritivos a base de avena, maíz o arroz.', 1, '2025-12-01 18:56:40', '2025-12-01 18:56:40'),
(3, 'Panecillos', 'Panecillos dulces o salados elaborados con harina de trigo.', 1, '2025-12-01 18:56:40', '2025-12-01 18:56:40'),
(4, 'Yogures', 'Derivados lácteos con fermentos naturales.', 1, '2025-12-01 18:56:40', '2025-12-01 18:56:40'),
(5, 'Turrones', 'Dulces compactos elaborados con miel, frutos secos y cereal.', 1, '2025-12-01 18:56:40', '2025-12-01 18:56:40'),
(6, 'Barras energéticas', 'Snacks saludables con avena, miel y frutas.', 1, '2025-12-01 18:56:40', '2025-12-01 18:56:40'),
(7, 'Postres lácteos', 'Flanes, natillas y productos lácteos preparados.', 1, '2025-12-01 18:56:40', '2025-12-01 18:56:40'),
(8, 'Derivados del maíz', 'Snacks y productos a base de maíz.', 1, '2025-12-01 18:56:40', '2025-12-01 18:56:40'),
(9, 'Galletas integrales', 'Galletas con harinas integrales y bajos en azúcar.', 1, '2025-12-01 18:56:40', '2025-12-01 18:56:40'),
(10, 'Cereal infantil', 'Cereales fortificados para niños.', 1, '2025-12-01 18:56:40', '2025-12-01 18:56:40');

INSERT INTO `cliente` (`id_cliente`, `nombre_cliente`, `identificacion`, `correo_cliente`, `telefono_cliente`, `direccion_cliente`) VALUES
(1, 'Supermercado El Buen Gusto', '900123456', 'contacto@elbuen.com', '3101234567', 'Cra 12 #45-21 Bogotá'),
(2, 'Tienda Don Pan', '900234567', 'ventas@donpan.com', '3102345678', 'Cll 23 #12-11 Bogotá'),
(3, 'Distribuciones La Estrella', '900345678', 'contacto@laestrella.com', '3103456789', 'Cra 67 #89-30 Bogotá'),
(4, 'Almacén NutriVida', '900456789', 'info@nutrividacol.com', '3114567890', 'Cll 45 #23-45 Bogotá'),
(5, 'Panadería Santa María', '900567890', 'ventas@santamaria.com', '3125678901', 'Cra 34 #45-67 Bogotá'),
(6, 'Comercializadora Andina', '900678901', 'pedidos@andina.com', '3136789012', 'Cll 10 #20-11 Bogotá'),
(7, 'Mercados Unidos', '900789012', 'contacto@mercadosunidos.com', '3147890123', 'Cra 50 #32-21 Bogotá'),
(8, 'DeliPan Express', '900890123', 'ventas@delipan.com', '3158901234', 'Cll 15 #30-11 Bogotá'),
(9, 'Distribuidora Láctea', '900901234', 'info@lactea.com', '3169012345', 'Cra 60 #40-22 Bogotá'),
(10, 'Panadería San Luis', '901012345', 'contacto@sanluis.com', '3170123456', 'Cll 80 #25-33 Bogotá'),
(11, 'Test Nuevo', '123456789', 'nuevo@test.com', '3009999999', 'Test 123'),
(12, 'Almacén DonDimaDon', '101313131313', 'Dondima@gmail.com', '3212303731', 'cra81 #30c 57s');

INSERT INTO `cotizacion` (`id_cotizacion`, `fecha_cotizacion`, `estado`, `id_usuario`, `id_cliente`, `fecha_vigencia`) VALUES
(1, '2025-12-01 18:56:40', 'Pendiente', 2, 1, '2025-12-31 00:00:00'),
(2, '2025-12-01 18:56:40', 'Aprobada', 3, 2, '2025-12-31 00:00:00'),
(3, '2025-12-01 18:56:40', 'Pendiente', 4, 3, '2025-12-31 00:00:00'),
(4, '2025-12-01 18:56:40', 'Rechazada', 5, 4, '2025-12-31 00:00:00'),
(5, '2025-12-01 18:56:40', 'Pendiente', 6, 5, '2025-12-31 00:00:00'),
(6, '2025-12-01 18:56:40', 'Aprobada', 7, 6, '2025-12-31 00:00:00'),
(7, '2025-12-01 18:56:40', 'Pendiente', 8, 7, '2025-12-31 00:00:00'),
(8, '2025-12-01 18:56:40', 'Pendiente', 9, 8, '2025-12-31 00:00:00'),
(9, '2025-12-01 18:56:40', 'Aprobada', 10, 9, '2025-12-31 00:00:00'),
(10, '2025-12-01 18:56:40', 'Rechazada', 2, 10, '2025-12-31 00:00:00');

INSERT INTO `detalle_cotizacion` (`id_detalle_cotizacion`, `id_cotizacion`, `id_producto`, `cantidad`, `precio_unitario`) VALUES
(1, 1, 1, 20, 2500.00),
(2, 1, 2, 15, 2800.00),
(3, 2, 3, 10, 6000.00),
(4, 3, 4, 8, 6500.00),
(5, 4, 6, 25, 1800.00),
(6, 5, 7, 12, 1900.00),
(7, 6, 8, 20, 3200.00),
(8, 7, 9, 15, 3500.00),
(9, 8, 10, 30, 2700.00),
(10, 9, 5, 10, 2000.00);

INSERT INTO `detalle_venta` (`id_detalle_venta`, `id_venta`, `id_producto`, `cantidad`, `precio_unitario`) VALUES
(1, 1, 1, 10, 2500.00),
(2, 1, 2, 10, 2800.00),
(3, 2, 3, 5, 6000.00),
(4, 3, 4, 8, 6500.00),
(5, 4, 6, 15, 1800.00),
(6, 5, 8, 10, 3200.00),
(7, 6, 9, 8, 3500.00),
(8, 7, 10, 12, 2700.00),
(9, 8, 5, 6, 2000.00),
(10, 9, 7, 14, 1900.00),
(11, 50, 9, 1, 3500.00),
(12, 51, 9, 7, 3500.00),
(13, 52, 9, 8, 3500.00),
(14, 53, 9, 1, 3500.00),
(15, 53, 4, 1, 6500.00),
(16, 53, 3, 4, 6000.00),
(17, 54, 9, 1, 3500.00),
(18, 54, 4, 1, 6500.00),
(19, 54, 3, 1, 6000.00),
(20, 55, 9, 1, 3500.00),
(21, 56, 9, 1, 3500.00),
(22, 57, 14, 1, 25000.00),
(23, 57, 9, 1, 3500.00),
(24, 57, 4, 1, 6500.00),
(25, 57, 3, 1, 6000.00);

INSERT INTO `devolucion` (`id_devolucion`, `fecha_devolucion`, `motivo`, `id_venta`) VALUES
(1, '2025-12-01 18:56:40', 'Producto dañado en el transporte', 4, '2025-12-31 00:00:00'),
(2, '2025-12-01 18:56:40', 'Error en cantidad entregada', 2, '2025-12-31 00:00:00'),
(3, '2025-12-01 18:56:40', 'Cliente canceló el pedido antes del envío', 5, '2025-12-31 00:00:00'),
(4, '2025-12-01 18:56:40', 'Retraso en entrega', 6, '2025-12-31 00:00:00'),
(5, '2025-12-01 18:56:40', 'Producto equivocado', 8, '2025-12-31 00:00:00'),
(6, '2025-12-01 18:56:40', 'Empaque defectuoso', 9, '2025-12-31 00:00:00'),
(7, '2025-12-01 18:56:40', 'Cliente devolvió por vencimiento', 3, '2025-12-31 00:00:00'),
(8, '2025-12-01 18:56:40', 'Error en cotización inicial', 1, '2025-12-31 00:00:00'),
(9, '2025-12-01 18:56:40', 'Pedido duplicado', 7, '2025-12-31 00:00:00'),
(10, '2025-12-01 18:56:40', 'Motivo no especificado', 10, '2025-12-31 00:00:00');

INSERT INTO `notificacion` (`id_notificacion`, `fecha_notificacion`, `mensaje`, `id_pedido`) VALUES
(1, '2025-12-01 18:56:40', 'Nuevo pedido pendiente de aprobación.', 1, '2025-12-31 00:00:00'),
(2, '2025-12-01 18:56:40', 'Pedido en proceso de envío.', 2, '2025-12-31 00:00:00'),
(3, '2025-12-01 18:56:40', 'Pedido entregado exitosamente.', 3, '2025-12-31 00:00:00'),
(4, '2025-12-01 18:56:40', 'Pedido pendiente de revisión.', 4, '2025-12-31 00:00:00'),
(5, '2025-12-01 18:56:40', 'Pedido cancelado por el cliente.', 5, '2025-12-31 00:00:00'),
(6, '2025-12-01 18:56:40', 'Pedido en preparación.', 6, '2025-12-31 00:00:00'),
(7, '2025-12-01 18:56:40', 'Pedido entregado sin novedades.', 7, '2025-12-31 00:00:00'),
(8, '2025-12-01 18:56:40', 'Nuevo pedido asignado al asesor.', 8, '2025-12-31 00:00:00'),
(9, '2025-12-01 18:56:40', 'Pedido entregado al cliente.', 9, '2025-12-31 00:00:00'),
(10, '2025-12-01 18:56:40', 'Pedido recibido para verificación.', 10, '2025-12-31 00:00:00');

INSERT INTO `pedido` (`id_pedido`, `fecha_pedido`, `estado_pedido`, `id_cliente`, `id_usuario`) VALUES
(1, '2025-12-01 18:56:40', 'Pendiente', 1, 2, '2025-12-31 00:00:00'),
(2, '2025-12-01 18:56:40', 'En proceso', 2, 3, '2025-12-31 00:00:00'),
(3, '2025-12-01 18:56:40', 'Entregado', 3, 4, '2025-12-31 00:00:00'),
(4, '2025-12-01 18:56:40', 'Pendiente', 4, 5, '2025-12-31 00:00:00'),
(5, '2025-12-01 18:56:40', 'Cancelado', 5, 6, '2025-12-31 00:00:00'),
(6, '2025-12-01 18:56:40', 'En proceso', 6, 7, '2025-12-31 00:00:00'),
(7, '2025-12-01 18:56:40', 'Entregado', 7, 8, '2025-12-31 00:00:00'),
(8, '2025-12-01 18:56:40', 'Pendiente', 8, 9, '2025-12-31 00:00:00'),
(9, '2025-12-01 18:56:40', 'Entregado', 9, 10),
(10, '2025-12-01 18:56:40', 'Pendiente', 10, 2, '2025-12-31 00:00:00'),
(11, '2025-12-08 12:32:17', 'Pendiente', 4, 11, '2025-12-31 00:00:00'),
(12, '2025-12-08 13:18:53', 'Pendiente', 6, 11, '2025-12-31 00:00:00'),
(13, '2025-12-08 13:36:05', 'Pendiente', 2, 11, '2025-12-31 00:00:00'),
(14, '2025-12-08 14:16:28', 'Pendiente', 7, 11, '2025-12-31 00:00:00'),
(15, '2025-12-17 07:54:58', 'Pendiente', 2, 15, '2025-12-31 00:00:00'),
(16, '2025-12-17 07:55:01', 'Pendiente', 2, 15, '2025-12-31 00:00:00'),
(17, '2025-12-17 07:55:01', 'Pendiente', 2, 15, '2025-12-31 00:00:00'),
(18, '2025-12-17 07:55:09', 'Pendiente', 2, 15, '2025-12-31 00:00:00'),
(19, '2025-12-17 07:55:10', 'Pendiente', 2, 15, '2025-12-31 00:00:00'),
(20, '2025-12-17 07:55:10', 'Pendiente', 2, 15, '2025-12-31 00:00:00'),
(21, '2025-12-17 07:55:10', 'Pendiente', 2, 15, '2025-12-31 00:00:00'),
(22, '2025-12-17 07:55:11', 'Pendiente', 2, 15, '2025-12-31 00:00:00'),
(23, '2025-12-17 07:55:11', 'Pendiente', 2, 15, '2025-12-31 00:00:00'),
(24, '2025-12-17 07:55:11', 'Pendiente', 2, 15, '2025-12-31 00:00:00'),
(25, '2025-12-17 07:55:26', 'Pendiente', 2, 15, '2025-12-31 00:00:00'),
(26, '2025-12-17 07:58:10', 'Pendiente', 2, 15, '2025-12-31 00:00:00'),
(27, '2025-12-17 07:58:44', 'Pendiente', 2, 15, '2025-12-31 00:00:00'),
(28, '2025-12-17 08:05:46', 'Pendiente', 2, 15, '2025-12-31 00:00:00'),
(29, '2025-12-17 08:07:13', 'Pendiente', 2, 15, '2025-12-31 00:00:00'),
(30, '2025-12-17 08:07:25', 'Pendiente', 2, 15, '2025-12-31 00:00:00'),
(31, '2025-12-17 08:07:39', 'Pendiente', 2, 15, '2025-12-31 00:00:00'),
(32, '2025-12-17 08:10:57', 'Pendiente', 2, 15, '2025-12-31 00:00:00'),
(33, '2025-12-17 08:12:38', 'Pendiente', 2, 15, '2025-12-31 00:00:00'),
(34, '2025-12-17 08:13:42', 'Pendiente', 2, 15, '2025-12-31 00:00:00'),
(35, '2025-12-17 08:23:25', 'Pendiente', 2, 14, '2025-12-31 00:00:00'),
(36, '2025-12-17 08:24:27', 'Pendiente', 2, 11, '2025-12-31 00:00:00'),
(37, '2025-12-17 08:28:03', 'Pendiente', 2, 11, '2025-12-31 00:00:00'),
(38, '2025-12-17 08:28:30', 'Pendiente', 4, 15, '2025-12-31 00:00:00'),
(39, '2025-12-17 08:28:31', 'Pendiente', 4, 15, '2025-12-31 00:00:00'),
(40, '2025-12-17 08:28:31', 'Pendiente', 4, 15, '2025-12-31 00:00:00'),
(41, '2025-12-17 08:28:31', 'Pendiente', 4, 15, '2025-12-31 00:00:00'),
(42, '2025-12-17 08:28:32', 'Pendiente', 4, 15, '2025-12-31 00:00:00'),
(43, '2025-12-17 08:28:32', 'Pendiente', 4, 15, '2025-12-31 00:00:00'),
(44, '2025-12-17 08:30:49', 'Pendiente', 4, 15, '2025-12-31 00:00:00'),
(45, '2025-12-17 08:32:11', 'Pendiente', 4, 15, '2025-12-31 00:00:00'),
(46, '2025-12-17 08:33:04', 'Pendiente', 2, 15, '2025-12-31 00:00:00'),
(47, '2025-12-17 08:33:35', 'Pendiente', 2, 15, '2025-12-31 00:00:00'),
(48, '2025-12-17 08:36:43', 'Pendiente', 3, 11, '2025-12-31 00:00:00'),
(49, '2025-12-17 08:36:44', 'Pendiente', 3, 11, '2025-12-31 00:00:00'),
(50, '2025-12-17 08:36:44', 'Pendiente', 3, 11, '2025-12-31 00:00:00'),
(51, '2025-12-17 08:36:44', 'Pendiente', 3, 11, '2025-12-31 00:00:00'),
(52, '2025-12-17 08:36:44', 'Pendiente', 3, 11, '2025-12-31 00:00:00'),
(53, '2025-12-17 08:36:45', 'Pendiente', 3, 11, '2025-12-31 00:00:00'),
(54, '2025-12-17 08:38:48', 'Pendiente', 2, 15, '2025-12-31 00:00:00'),
(55, '2025-12-17 09:07:18', 'Pendiente', 2, 15, '2025-12-31 00:00:00'),
(56, '2025-12-17 09:07:31', 'En proceso', 2, 15, '2025-12-31 00:00:00'),
(57, '2026-02-03 17:45:30', 'Entregado', 2, 23, '2025-12-31 00:00:00'),
(58, '2026-02-09 15:27:31', 'Pendiente', 4, 27, '2025-12-31 00:00:00'),
(59, '2026-02-20 15:07:20', 'Pendiente', 12, 27, '2025-12-31 00:00:00'),
(60, '2026-02-27 20:13:41', 'Entregado', 12, 27, '2025-12-31 00:00:00'),
(61, '2026-03-12 19:45:48', 'Pendiente', 12, 27);

INSERT INTO `producto` (`id_producto`, `codigo_interno`, `nombre_producto`, `descripcion`, `precio`, `stock`, `id_categoria`) VALUES
(1, 'GAL001', 'Galleta de avena y miel', 'Galleta dulce a base de avena, miel y canela.', 2500.00, 150, 1, '2025-12-31 00:00:00'),
(2, 'GAL002', 'Galleta de chocolate', 'Galleta crujiente con chips de chocolate.', 2800.00, 100, 1, '2025-12-31 00:00:00'),
(3, 'CER001', 'Cereal de maíz', 'Cereal clásico de hojuelas de maíz.', 6000.00, 180, 2, '2025-12-31 00:00:00'),
(4, 'CER002', 'Cereal de avena con miel', 'Cereal de avena tostada endulzado con miel.', 6500.00, 120, 2, '2025-12-31 00:00:00'),
(5, 'PAN001', 'Panecillo integral', 'Panecillo bajo en grasa con fibra natural.', 2000.00, 100, 3, '2025-12-31 00:00:00'),
(6, 'YOG001', 'Yogur natural 200ml', 'Yogur artesanal sin azúcar.', 1800.00, 250, 4, '2025-12-31 00:00:00'),
(7, 'YOG002', 'Yogur de fresa 200ml', 'Yogur natural con pulpa de fresa.', 1900.00, 230, 4, '2025-12-31 00:00:00'),
(8, 'TUR001', 'Turrón de maní', 'Turrón artesanal con maní y miel.', 3200.00, 160, 5, '2025-12-31 00:00:00'),
(9, 'BAR001', 'Barra energética de avena', 'Snack saludable de avena y frutos secos.', 3500.00, 181, 6, '2025-12-31 00:00:00'),
(10, 'POS001', 'Flan de vainilla', 'Postre lácteo con sabor a vainilla.', 2700.00, 146, 7, '2025-12-31 00:00:00'),
(14, NULL, 'Aceite de Coco', '100% natural prensado en frío', 25000.00, 50, 1, '2025-12-31 00:00:00'),
(15, 'PROD-001', 'Paracetamol 500mg', 'Caja x 100 tabletas', 5.50, 50, 1);

INSERT INTO `rol` (`id_rol`, `nombre_rol`) VALUES
(1, 'Administrador'),
(2, 'Asesor');

INSERT INTO `usuario` (`id_usuario`, `primer_nombre`, `primer_apellido`, `tipo_documento`, `numero_documento`, `correo`, `contrasena`, `estado`, `id_rol`) VALUES
(1, 'Carlos', 'Martínez', 'CC', '10102030', 'carlos.martinez@pronavid.com', 'hashedpass1', 1, 1, '2025-12-31 00:00:00'),
(2, 'Laura', 'Gómez', 'CC', '10203040', 'laura.gomez@pronavid.com', 'hashedpass2', 1, 2, '2025-12-31 00:00:00'),
(3, 'Andrés', 'Pérez', 'CC', '10304050', 'andres.perez@pronavid.com', 'hashedpass3', 1, 2, '2025-12-31 00:00:00'),
(4, 'María', 'Rojas', 'CC', '10405060', 'maria.rojas@pronavid.com', 'hashedpass4', 1, 2, '2025-12-31 00:00:00'),
(5, 'Camilo', 'López', 'CC', '10506070', 'camilo.lopez@pronavid.com', 'hashedpass5', 1, 1, '2025-12-31 00:00:00'),
(6, 'Diana', 'Ramírez', 'CC', '10607080', 'diana.ramirez@pronavid.com', 'hashedpass6', 1, 2, '2025-12-31 00:00:00'),
(7, 'Felipe', 'Torres', 'CC', '10708090', 'felipe.torres@pronavid.com', 'hashedpass7', 1, 2, '2025-12-31 00:00:00'),
(8, 'Natalia', 'Jiménez', 'CC', '10809100', 'natalia.jimenez@pronavid.com', 'hashedpass8', 1, 2, '2025-12-31 00:00:00'),
(9, 'Jorge', 'Suárez', 'CC', '10901020', 'jorge.suarez@pronavid.com', 'hashedpass9', 1, 1, '2025-12-31 00:00:00'),
(10, 'Paula', 'Castro', 'CC', '11002030', 'paula.castro@pronavid.com', 'hashedpass10', 1, 2, '2025-12-31 00:00:00'),
(11, 'nicolas', 'moreno', 'CC', '1029140364', 'a@tester.com', '$2b$10$YEjdJka6p0dWIQKwiRES.OfgDxLT8e4itmNE/iS9mM7xKcB/3gWQK', 1, 2, '2025-12-31 00:00:00'),
(12, 'Nireba', 'deida', 'CC', '1025142638', 'ad@test.com', '$2b$10$VBgZSdvZaVfsGtezaXATI.Bm6xGQdgW46OVsCTcv31D9t2AVeBJmO', 1, 1, '2025-12-31 00:00:00'),
(13, 'juan', 'santos', 'CC', '129283893', 'juan@test.com', '$2b$10$0D4Ot.ug21I4B1wGeGdvAubenhoeFtJiDHAQEfsW/hDD2VivY9Hhe', 1, 2, '2025-12-31 00:00:00'),
(14, 'Jhon', 'Merchan', 'CC', '1033704652', 'a@gmail.com', '$2b$10$2mwoTqURodx2zDDz/7/CYeWw4b9U8B2es5XUcQ9Lvr5AWbB649P3W', 1, 2, '2025-12-31 00:00:00'),
(15, 'Michell', 'Quintero', 'CC', '12345678', 'asd@test.com', '$2b$10$8Y5rIIDdryDfmcI8zYbgeugnwpQzNb/4GnOFuSwS1MyZFW1TdGzyq', 1, 2, '2025-12-31 00:00:00'),
(16, 'Jhon', 'Moreno', 'CC', '987654321', 'e@gmail.com', '$2b$10$qyxl6S5BfwTpG8OBFxCZ0.TMR4RFdAsmbSMq.uPiLsnUXGYRsJ/fi', 1, 1, '2025-12-31 00:00:00'),
(18, 'Fabian', 'Parra', 'CC', '1234567', 'foparra@gmail.com', '$2b$10$6Uh70tMv6ZqW2pAuhZfuauSYTILoXHtWYWtkz68TxgLJcK/lXiSoy', 1, 1, '2025-12-31 00:00:00'),
(19, 'Nireba', 'Moreno', 'CC', '1231231231', 'qwerty@gmail.com', '$2b$10$mfLvcOTy4uFEMUeVv0yJN.f62luMb2FV1RP/.wk.kwFFp6tLQgdGe', 1, 2, '2025-12-31 00:00:00'),
(21, 'Alexxx', 'Merchan', 'CC', '1033704653', 'alexan321kass@gmail.com', '$2b$10$JfRrRyEdV8lEBOywCkOoyOBnnw0ehzXdDLhGm.m9LfyduGCP4oJ5O', 1, 1, '2025-12-31 00:00:00'),
(23, 'viktor', 'marin', 'CC', '1234567888', 'asw@gm.com', '$2b$10$Rzd/F/Ij57ZiE0r45nKGd.nVUwAeLaxz3AiuqOqRrnR5rNU52CxhW', 1, 2, '2025-12-31 00:00:00'),
(24, 'Test7453', 'User', 'CC', '1234567453', 'test7453@example.com', '$2b$10$S2Dbi2YzZrvpErQEYKwfjOh5wX3rWyW5acVzaAqOgY.EbWyuCcQnS', 1, 1, '2025-12-31 00:00:00'),
(25, 'Test9510', 'User', 'CC', '1234569510', 'test9510@example.com', '$2b$10$2DYaEMXPc4EUFZ/TA2GP8.RB7AlvPiz76TiR5eZArdpCxxKtwMmMq', 1, 1, '2025-12-31 00:00:00'),
(27, 'Nicolas', 'Soba', 'CC', '1029140365', 'nicolas220x@gmail.com', '$2b$10$FMzCGfEKBTWewF8wr1hRceaUzNyYbpE1kp4S48rRDejNNN59xfKb.', 1, 2, '2025-12-31 00:00:00'),
(28, 'asd', 'asd', 'CC', '123456789', 'as@as.com', '$2b$10$lwrsn5r4VN8GNULVnCtFYOh8xrJ.naMzO5P4y2hroJ09FcQ/29LPK', 1, 2, '2025-12-31 00:00:00'),
(29, 'ads', 'ads', 'CC', '123123412', 'adso@adso.com', '$2b$10$VSOVELt3QbfKvfvVqVS9L.IRi/ZKOfw5QG11MY.UI87oqbFZPBq66', 1, 1, '2025-12-31 00:00:00'),
(30, 'Test5015', 'User', 'CC', '1234565015', 'test5015@example.com', '$2b$10$KZN6YuOBML9thSslGmlTy.vSOOCTMn2UNMSJltLR.5OmVNmyI5riO', 1, 1, '2025-12-31 00:00:00'),
(31, 'Test4855', 'User', 'CC', '1234564855', 'test4855@example.com', '$2b$10$wv78RvK3sfGECG6p5AiNO.pARgFsDsknt/P07OyPtML7WGQJQO9WO', 1, 1, '2025-12-31 00:00:00'),
(32, 'basxn', 'tico', 'CC', '1234561231', 'basxngod@gmail.com', '$2b$10$3ZTghgGlj4oxOp8eGASfHORX896LuCWjmK6qEUkPVguo375sX1Nki', 1, 2, '2025-12-31 00:00:00'),
(33, 'Test', 'User', 'CC', '55667788', 'test15@example.com', '$2b$10$bX1H2K6rrA2.JlNJ1J0mpeUxQb9X/Sd3FavSJVkMVvg7CSGmgE3w2', 1, 2, '2025-12-31 00:00:00'),
(34, 'basan', 'chan', 'CE', '1234561233', 'basxn@bsx.com', '$2b$10$uRjuec2lW77BGWhPgrwFJ.Twel5FwSHBAeq3gWs./k9sDq.QNHCgC', 1, 2, '2025-12-31 00:00:00'),
(35, 'basxnn', 'tote', 'CC', '1234567123', 'basxn@basxn.com', '$2b$10$akHehiSoFVamTyJWTgRjWeZZuuJzXNgovvJSz8uduGJIF//3MvkbO', 1, 2, '2025-12-31 00:00:00'),
(36, 'samuel', 'fernandez', 'TI', '1231231234', 'samu@fer.com', '$2b$10$irSbMJxA3/vHXqFOgGbPs.T4T.30xj17Y951ntJnpzxH.0uhZ6XZ2', 1, 2, '2025-12-31 00:00:00'),
(37, 'Juan', 'Pérez', 'CC', '1234567890', 'juan.perez@email.com', '$2b$10$/L643RG.y/wngEoA47q/e.nB9vQebStLlBg729hUDXgxJBuQ9aLu.', 1, 2);

INSERT INTO `venta` (`id_venta`, `fecha_venta`, `estado_venta`, `subtotal`, `descuento`, `impuestos`, `id_pedido`, `id_usuario`) VALUES
(1, '2025-12-01 18:56:40', 'Pagada', 80000.00, 0.00, 15200.00, 1, 2, '2025-12-31 00:00:00'),
(2, '2025-12-01 18:56:40', 'Pendiente', 45000.00, 2000.00, 8550.00, 2, 3, '2025-12-31 00:00:00'),
(3, '2025-12-01 18:56:40', 'Pagada', 60000.00, 0.00, 11400.00, 3, 4, '2025-12-31 00:00:00'),
(4, '2025-12-01 18:56:40', 'Cancelada', 50000.00, 1000.00, 9500.00, 4, 5, '2025-12-31 00:00:00'),
(5, '2025-12-01 18:56:40', 'Pagada', 90000.00, 0.00, 17100.00, 5, 6, '2025-12-31 00:00:00'),
(6, '2025-12-01 18:56:40', 'Pendiente', 30000.00, 0.00, 5700.00, 6, 7, '2025-12-31 00:00:00'),
(7, '2025-12-01 18:56:40', 'Pagada', 110000.00, 5000.00, 19950.00, 7, 8, '2025-12-31 00:00:00'),
(8, '2025-12-01 18:56:40', 'Pagada', 65000.00, 0.00, 12350.00, 8, 9, '2025-12-31 00:00:00'),
(9, '2025-12-01 18:56:40', 'Pendiente', 70000.00, 0.00, 13300.00, 9, 10),
(10, '2025-12-01 18:56:40', 'Pagada', 95000.00, 2000.00, 17500.00, 10, 2, '2025-12-31 00:00:00'),
(50, '2025-12-17 08:38:48', 'Pendiente', 0.00, 0.00, 0.00, 54, 15, '2025-12-31 00:00:00'),
(51, '2025-12-17 09:07:18', 'Pendiente', 0.00, 0.00, 0.00, 55, 15, '2025-12-31 00:00:00'),
(52, '2025-12-17 09:07:31', 'Pendiente', 0.00, 0.00, 0.00, 56, 15, '2025-12-31 00:00:00'),
(53, '2026-02-03 17:45:30', 'Pendiente', 0.00, 0.00, 0.00, 57, 23, '2025-12-31 00:00:00'),
(54, '2026-02-09 15:27:31', 'Pendiente', 0.00, 0.00, 0.00, 58, 27, '2025-12-31 00:00:00'),
(55, '2026-02-20 15:07:20', 'Pendiente', 0.00, 0.00, 0.00, 59, 27, '2025-12-31 00:00:00'),
(56, '2026-02-27 20:13:41', 'Pendiente', 3500.00, 0.00, 0.00, 60, 27, '2025-12-31 00:00:00'),
(57, '2026-03-12 19:45:48', 'Pendiente', 41000.00, 0.00, 0.00, 61, 27);

SET FOREIGN_KEY_CHECKS = 1;
