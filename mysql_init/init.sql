-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 27-03-2026 a las 22:24:20
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `pronavid`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoria`
--

CREATE TABLE `categoria` (
  `id_categoria` int(11) NOT NULL,
  `nombre_categoria` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `estado` tinyint(1) DEFAULT 1,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `fecha_actualizacion` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categoria`
--

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cliente`
--

CREATE TABLE `cliente` (
  `id_cliente` int(11) NOT NULL,
  `nombre_cliente` varchar(100) NOT NULL,
  `identificacion` varchar(30) NOT NULL,
  `correo_cliente` varchar(100) DEFAULT NULL,
  `telefono_cliente` varchar(20) DEFAULT NULL,
  `direccion_cliente` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cliente`
--

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cotizacion`
--

CREATE TABLE `cotizacion` (
  `id_cotizacion` int(11) NOT NULL,
  `fecha_cotizacion` datetime DEFAULT current_timestamp(),
  `estado` enum('Pendiente','Aprobada','Rechazada') DEFAULT 'Pendiente',
  `id_usuario` int(11) NOT NULL,
  `id_cliente` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cotizacion`
--

INSERT INTO `cotizacion` (`id_cotizacion`, `fecha_cotizacion`, `estado`, `id_usuario`, `id_cliente`) VALUES
(1, '2025-12-01 18:56:40', 'Pendiente', 2, 1),
(2, '2025-12-01 18:56:40', 'Aprobada', 3, 2),
(3, '2025-12-01 18:56:40', 'Pendiente', 4, 3),
(4, '2025-12-01 18:56:40', 'Rechazada', 5, 4),
(5, '2025-12-01 18:56:40', 'Pendiente', 6, 5),
(6, '2025-12-01 18:56:40', 'Aprobada', 7, 6),
(7, '2025-12-01 18:56:40', 'Pendiente', 8, 7),
(8, '2025-12-01 18:56:40', 'Pendiente', 9, 8),
(9, '2025-12-01 18:56:40', 'Aprobada', 10, 9),
(10, '2025-12-01 18:56:40', 'Rechazada', 2, 10);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_cotizacion`
--

CREATE TABLE `detalle_cotizacion` (
  `id_detalle_cotizacion` int(11) NOT NULL,
  `id_cotizacion` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `detalle_cotizacion`
--

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_devolucion`
--

CREATE TABLE `detalle_devolucion` (
  `id_detalle_devolucion` int(11) NOT NULL,
  `id_devolucion` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_venta`
--

CREATE TABLE `detalle_venta` (
  `id_detalle_venta` int(11) NOT NULL,
  `id_venta` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `detalle_venta`
--

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `devolucion`
--

CREATE TABLE `devolucion` (
  `id_devolucion` int(11) NOT NULL,
  `fecha_devolucion` datetime DEFAULT current_timestamp(),
  `motivo` text NOT NULL,
  `id_venta` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `devolucion`
--

INSERT INTO `devolucion` (`id_devolucion`, `fecha_devolucion`, `motivo`, `id_venta`) VALUES
(1, '2025-12-01 18:56:40', 'Producto dañado en el transporte', 4),
(2, '2025-12-01 18:56:40', 'Error en cantidad entregada', 2),
(3, '2025-12-01 18:56:40', 'Cliente canceló el pedido antes del envío', 5),
(4, '2025-12-01 18:56:40', 'Retraso en entrega', 6),
(5, '2025-12-01 18:56:40', 'Producto equivocado', 8),
(6, '2025-12-01 18:56:40', 'Empaque defectuoso', 9),
(7, '2025-12-01 18:56:40', 'Cliente devolvió por vencimiento', 3),
(8, '2025-12-01 18:56:40', 'Error en cotización inicial', 1),
(9, '2025-12-01 18:56:40', 'Pedido duplicado', 7),
(10, '2025-12-01 18:56:40', 'Motivo no especificado', 10);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notificacion`
--

CREATE TABLE `notificacion` (
  `id_notificacion` int(11) NOT NULL,
  `fecha_notificacion` datetime DEFAULT current_timestamp(),
  `mensaje` text NOT NULL,
  `id_pedido` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `notificacion`
--

INSERT INTO `notificacion` (`id_notificacion`, `fecha_notificacion`, `mensaje`, `id_pedido`) VALUES
(1, '2025-12-01 18:56:40', 'Nuevo pedido pendiente de aprobación.', 1),
(2, '2025-12-01 18:56:40', 'Pedido en proceso de envío.', 2),
(3, '2025-12-01 18:56:40', 'Pedido entregado exitosamente.', 3),
(4, '2025-12-01 18:56:40', 'Pedido pendiente de revisión.', 4),
(5, '2025-12-01 18:56:40', 'Pedido cancelado por el cliente.', 5),
(6, '2025-12-01 18:56:40', 'Pedido en preparación.', 6),
(7, '2025-12-01 18:56:40', 'Pedido entregado sin novedades.', 7),
(8, '2025-12-01 18:56:40', 'Nuevo pedido asignado al asesor.', 8),
(9, '2025-12-01 18:56:40', 'Pedido entregado al cliente.', 9),
(10, '2025-12-01 18:56:40', 'Pedido recibido para verificación.', 10);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedido`
--

CREATE TABLE `pedido` (
  `id_pedido` int(11) NOT NULL,
  `fecha_pedido` datetime DEFAULT current_timestamp(),
  `estado_pedido` enum('Pendiente','En proceso','Entregado','Cancelado') DEFAULT 'Pendiente',
  `id_cliente` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pedido`
--

INSERT INTO `pedido` (`id_pedido`, `fecha_pedido`, `estado_pedido`, `id_cliente`, `id_usuario`) VALUES
(1, '2025-12-01 18:56:40', 'Pendiente', 1, 2),
(2, '2025-12-01 18:56:40', 'En proceso', 2, 3),
(3, '2025-12-01 18:56:40', 'Entregado', 3, 4),
(4, '2025-12-01 18:56:40', 'Pendiente', 4, 5),
(5, '2025-12-01 18:56:40', 'Cancelado', 5, 6),
(6, '2025-12-01 18:56:40', 'En proceso', 6, 7),
(7, '2025-12-01 18:56:40', 'Entregado', 7, 8),
(8, '2025-12-01 18:56:40', 'Pendiente', 8, 9),
(9, '2025-12-01 18:56:40', 'Entregado', 9, 10),
(10, '2025-12-01 18:56:40', 'Pendiente', 10, 2),
(11, '2025-12-08 12:32:17', 'Pendiente', 4, 11),
(12, '2025-12-08 13:18:53', 'Pendiente', 6, 11),
(13, '2025-12-08 13:36:05', 'Pendiente', 2, 11),
(14, '2025-12-08 14:16:28', 'Pendiente', 7, 11),
(15, '2025-12-17 07:54:58', 'Pendiente', 2, 15),
(16, '2025-12-17 07:55:01', 'Pendiente', 2, 15),
(17, '2025-12-17 07:55:01', 'Pendiente', 2, 15),
(18, '2025-12-17 07:55:09', 'Pendiente', 2, 15),
(19, '2025-12-17 07:55:10', 'Pendiente', 2, 15),
(20, '2025-12-17 07:55:10', 'Pendiente', 2, 15),
(21, '2025-12-17 07:55:10', 'Pendiente', 2, 15),
(22, '2025-12-17 07:55:11', 'Pendiente', 2, 15),
(23, '2025-12-17 07:55:11', 'Pendiente', 2, 15),
(24, '2025-12-17 07:55:11', 'Pendiente', 2, 15),
(25, '2025-12-17 07:55:26', 'Pendiente', 2, 15),
(26, '2025-12-17 07:58:10', 'Pendiente', 2, 15),
(27, '2025-12-17 07:58:44', 'Pendiente', 2, 15),
(28, '2025-12-17 08:05:46', 'Pendiente', 2, 15),
(29, '2025-12-17 08:07:13', 'Pendiente', 2, 15),
(30, '2025-12-17 08:07:25', 'Pendiente', 2, 15),
(31, '2025-12-17 08:07:39', 'Pendiente', 2, 15),
(32, '2025-12-17 08:10:57', 'Pendiente', 2, 15),
(33, '2025-12-17 08:12:38', 'Pendiente', 2, 15),
(34, '2025-12-17 08:13:42', 'Pendiente', 2, 15),
(35, '2025-12-17 08:23:25', 'Pendiente', 2, 14),
(36, '2025-12-17 08:24:27', 'Pendiente', 2, 11),
(37, '2025-12-17 08:28:03', 'Pendiente', 2, 11),
(38, '2025-12-17 08:28:30', 'Pendiente', 4, 15),
(39, '2025-12-17 08:28:31', 'Pendiente', 4, 15),
(40, '2025-12-17 08:28:31', 'Pendiente', 4, 15),
(41, '2025-12-17 08:28:31', 'Pendiente', 4, 15),
(42, '2025-12-17 08:28:32', 'Pendiente', 4, 15),
(43, '2025-12-17 08:28:32', 'Pendiente', 4, 15),
(44, '2025-12-17 08:30:49', 'Pendiente', 4, 15),
(45, '2025-12-17 08:32:11', 'Pendiente', 4, 15),
(46, '2025-12-17 08:33:04', 'Pendiente', 2, 15),
(47, '2025-12-17 08:33:35', 'Pendiente', 2, 15),
(48, '2025-12-17 08:36:43', 'Pendiente', 3, 11),
(49, '2025-12-17 08:36:44', 'Pendiente', 3, 11),
(50, '2025-12-17 08:36:44', 'Pendiente', 3, 11),
(51, '2025-12-17 08:36:44', 'Pendiente', 3, 11),
(52, '2025-12-17 08:36:44', 'Pendiente', 3, 11),
(53, '2025-12-17 08:36:45', 'Pendiente', 3, 11),
(54, '2025-12-17 08:38:48', 'Pendiente', 2, 15),
(55, '2025-12-17 09:07:18', 'Pendiente', 2, 15),
(56, '2025-12-17 09:07:31', 'En proceso', 2, 15),
(57, '2026-02-03 17:45:30', 'Entregado', 2, 23),
(58, '2026-02-09 15:27:31', 'Pendiente', 4, 27),
(59, '2026-02-20 15:07:20', 'Pendiente', 12, 27),
(60, '2026-02-27 20:13:41', 'Entregado', 12, 27),
(61, '2026-03-12 19:45:48', 'Pendiente', 12, 27);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto`
--

CREATE TABLE `producto` (
  `id_producto` int(11) NOT NULL,
  `codigo_interno` varchar(50) DEFAULT NULL,
  `nombre_producto` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL,
  `stock` int(11) DEFAULT 0,
  `id_categoria` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `producto`
--

INSERT INTO `producto` (`id_producto`, `codigo_interno`, `nombre_producto`, `descripcion`, `precio`, `stock`, `id_categoria`) VALUES
(1, 'GAL001', 'Galleta de avena y miel', 'Galleta dulce a base de avena, miel y canela.', 2500.00, 150, 1),
(2, 'GAL002', 'Galleta de chocolate', 'Galleta crujiente con chips de chocolate.', 2800.00, 100, 1),
(3, 'CER001', 'Cereal de maíz', 'Cereal clásico de hojuelas de maíz.', 6000.00, 180, 2),
(4, 'CER002', 'Cereal de avena con miel', 'Cereal de avena tostada endulzado con miel.', 6500.00, 120, 2),
(5, 'PAN001', 'Panecillo integral', 'Panecillo bajo en grasa con fibra natural.', 2000.00, 100, 3),
(6, 'YOG001', 'Yogur natural 200ml', 'Yogur artesanal sin azúcar.', 1800.00, 250, 4),
(7, 'YOG002', 'Yogur de fresa 200ml', 'Yogur natural con pulpa de fresa.', 1900.00, 230, 4),
(8, 'TUR001', 'Turrón de maní', 'Turrón artesanal con maní y miel.', 3200.00, 160, 5),
(9, 'BAR001', 'Barra energética de avena', 'Snack saludable de avena y frutos secos.', 3500.00, 181, 6),
(10, 'POS001', 'Flan de vainilla', 'Postre lácteo con sabor a vainilla.', 2700.00, 146, 7),
(14, NULL, 'Aceite de Coco', '100% natural prensado en frío', 25000.00, 50, 1),
(15, 'PROD-001', 'Paracetamol 500mg', 'Caja x 100 tabletas', 5.50, 50, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol`
--

CREATE TABLE `rol` (
  `id_rol` int(11) NOT NULL,
  `nombre_rol` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `rol`
--

INSERT INTO `rol` (`id_rol`, `nombre_rol`) VALUES
(1, 'Administrador'),
(2, 'Asesor');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id_usuario` int(11) NOT NULL,
  `primer_nombre` varchar(50) NOT NULL,
  `primer_apellido` varchar(50) NOT NULL,
  `tipo_documento` enum('Cédula de ciudadanía','Tarjeta de identidad','Cédula de extranjería') NOT NULL,
  `numero_documento` varchar(30) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `estado` tinyint(1) DEFAULT 1,
  `id_rol` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id_usuario`, `primer_nombre`, `primer_apellido`, `tipo_documento`, `numero_documento`, `correo`, `contrasena`, `estado`, `id_rol`) VALUES
(1, 'Carlos', 'Martínez', 'Cédula de ciudadanía', '10102030', 'carlos.martinez@pronavid.com', 'hashedpass1', 1, 1),
(2, 'Laura', 'Gómez', 'Cédula de ciudadanía', '10203040', 'laura.gomez@pronavid.com', 'hashedpass2', 1, 2),
(3, 'Andrés', 'Pérez', 'Cédula de ciudadanía', '10304050', 'andres.perez@pronavid.com', 'hashedpass3', 1, 2),
(4, 'María', 'Rojas', 'Cédula de ciudadanía', '10405060', 'maria.rojas@pronavid.com', 'hashedpass4', 1, 2),
(5, 'Camilo', 'López', 'Cédula de ciudadanía', '10506070', 'camilo.lopez@pronavid.com', 'hashedpass5', 1, 1),
(6, 'Diana', 'Ramírez', 'Cédula de ciudadanía', '10607080', 'diana.ramirez@pronavid.com', 'hashedpass6', 1, 2),
(7, 'Felipe', 'Torres', 'Cédula de ciudadanía', '10708090', 'felipe.torres@pronavid.com', 'hashedpass7', 1, 2),
(8, 'Natalia', 'Jiménez', 'Cédula de ciudadanía', '10809100', 'natalia.jimenez@pronavid.com', 'hashedpass8', 1, 2),
(9, 'Jorge', 'Suárez', 'Cédula de ciudadanía', '10901020', 'jorge.suarez@pronavid.com', 'hashedpass9', 1, 1),
(10, 'Paula', 'Castro', 'Cédula de ciudadanía', '11002030', 'paula.castro@pronavid.com', 'hashedpass10', 1, 2),
(11, 'nicolas', 'moreno', 'Cédula de ciudadanía', '1029140364', 'a@tester.com', '$2b$10$YEjdJka6p0dWIQKwiRES.OfgDxLT8e4itmNE/iS9mM7xKcB/3gWQK', 1, 2),
(12, 'Nireba', 'deida', 'Cédula de ciudadanía', '1025142638', 'ad@test.com', '$2b$10$VBgZSdvZaVfsGtezaXATI.Bm6xGQdgW46OVsCTcv31D9t2AVeBJmO', 1, 1),
(13, 'juan', 'santos', 'Cédula de ciudadanía', '129283893', 'juan@test.com', '$2b$10$0D4Ot.ug21I4B1wGeGdvAubenhoeFtJiDHAQEfsW/hDD2VivY9Hhe', 1, 2),
(14, 'Jhon', 'Merchan', 'Cédula de ciudadanía', '1033704652', 'a@gmail.com', '$2b$10$2mwoTqURodx2zDDz/7/CYeWw4b9U8B2es5XUcQ9Lvr5AWbB649P3W', 1, 2),
(15, 'Michell', 'Quintero', 'Cédula de ciudadanía', '12345678', 'asd@test.com', '$2b$10$8Y5rIIDdryDfmcI8zYbgeugnwpQzNb/4GnOFuSwS1MyZFW1TdGzyq', 1, 2),
(16, 'Jhon', 'Moreno', 'Cédula de ciudadanía', '987654321', 'e@gmail.com', '$2b$10$qyxl6S5BfwTpG8OBFxCZ0.TMR4RFdAsmbSMq.uPiLsnUXGYRsJ/fi', 1, 1),
(18, 'Fabian', 'Parra', 'Cédula de ciudadanía', '1234567', 'foparra@gmail.com', '$2b$10$6Uh70tMv6ZqW2pAuhZfuauSYTILoXHtWYWtkz68TxgLJcK/lXiSoy', 1, 1),
(19, 'Nireba', 'Moreno', 'Cédula de ciudadanía', '1231231231', 'qwerty@gmail.com', '$2b$10$mfLvcOTy4uFEMUeVv0yJN.f62luMb2FV1RP/.wk.kwFFp6tLQgdGe', 1, 2),
(21, 'Alexxx', 'Merchan', 'Cédula de ciudadanía', '1033704653', 'alexan321kass@gmail.com', '$2b$10$JfRrRyEdV8lEBOywCkOoyOBnnw0ehzXdDLhGm.m9LfyduGCP4oJ5O', 1, 1),
(23, 'viktor', 'marin', 'Cédula de ciudadanía', '1234567888', 'asw@gm.com', '$2b$10$Rzd/F/Ij57ZiE0r45nKGd.nVUwAeLaxz3AiuqOqRrnR5rNU52CxhW', 1, 2),
(24, 'Test7453', 'User', 'Cédula de ciudadanía', '1234567453', 'test7453@example.com', '$2b$10$S2Dbi2YzZrvpErQEYKwfjOh5wX3rWyW5acVzaAqOgY.EbWyuCcQnS', 1, 1),
(25, 'Test9510', 'User', 'Cédula de ciudadanía', '1234569510', 'test9510@example.com', '$2b$10$2DYaEMXPc4EUFZ/TA2GP8.RB7AlvPiz76TiR5eZArdpCxxKtwMmMq', 1, 1),
(27, 'Nicolas', 'Soba', 'Cédula de ciudadanía', '1029140365', 'nicolas220x@gmail.com', '$2b$10$FMzCGfEKBTWewF8wr1hRceaUzNyYbpE1kp4S48rRDejNNN59xfKb.', 1, 2),
(28, 'asd', 'asd', 'Cédula de ciudadanía', '123456789', 'as@as.com', '$2b$10$lwrsn5r4VN8GNULVnCtFYOh8xrJ.naMzO5P4y2hroJ09FcQ/29LPK', 1, 2),
(29, 'ads', 'ads', 'Cédula de ciudadanía', '123123412', 'adso@adso.com', '$2b$10$VSOVELt3QbfKvfvVqVS9L.IRi/ZKOfw5QG11MY.UI87oqbFZPBq66', 1, 1),
(30, 'Test5015', 'User', 'Cédula de ciudadanía', '1234565015', 'test5015@example.com', '$2b$10$KZN6YuOBML9thSslGmlTy.vSOOCTMn2UNMSJltLR.5OmVNmyI5riO', 1, 1),
(31, 'Test4855', 'User', 'Cédula de ciudadanía', '1234564855', 'test4855@example.com', '$2b$10$wv78RvK3sfGECG6p5AiNO.pARgFsDsknt/P07OyPtML7WGQJQO9WO', 1, 1),
(32, 'basxn', 'tico', 'Cédula de ciudadanía', '1234561231', 'basxngod@gmail.com', '$2b$10$3ZTghgGlj4oxOp8eGASfHORX896LuCWjmK6qEUkPVguo375sX1Nki', 1, 2),
(33, 'Test', 'User', 'Cédula de ciudadanía', '55667788', 'test15@example.com', '$2b$10$bX1H2K6rrA2.JlNJ1J0mpeUxQb9X/Sd3FavSJVkMVvg7CSGmgE3w2', 1, 2),
(34, 'basan', 'chan', 'Cédula de extranjería', '1234561233', 'basxn@bsx.com', '$2b$10$uRjuec2lW77BGWhPgrwFJ.Twel5FwSHBAeq3gWs./k9sDq.QNHCgC', 1, 2),
(35, 'basxnn', 'tote', 'Cédula de ciudadanía', '1234567123', 'basxn@basxn.com', '$2b$10$akHehiSoFVamTyJWTgRjWeZZuuJzXNgovvJSz8uduGJIF//3MvkbO', 1, 2),
(36, 'samuel', 'fernandez', 'Tarjeta de identidad', '1231231234', 'samu@fer.com', '$2b$10$irSbMJxA3/vHXqFOgGbPs.T4T.30xj17Y951ntJnpzxH.0uhZ6XZ2', 1, 2),
(37, 'Juan', 'Pérez', 'Cédula de ciudadanía', '1234567890', 'juan.perez@email.com', '$2b$10$/L643RG.y/wngEoA47q/e.nB9vQebStLlBg729hUDXgxJBuQ9aLu.', 1, 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `venta`
--

CREATE TABLE `venta` (
  `id_venta` int(11) NOT NULL,
  `fecha_venta` datetime DEFAULT current_timestamp(),
  `estado_venta` enum('Pendiente','Pagada','Cancelada') DEFAULT 'Pendiente',
  `subtotal` decimal(10,2) NOT NULL,
  `descuento` decimal(10,2) DEFAULT 0.00,
  `impuestos` decimal(10,2) DEFAULT 0.00,
  `total` decimal(10,2) GENERATED ALWAYS AS (`subtotal` - `descuento` + `impuestos`) STORED,
  `id_pedido` int(11) DEFAULT NULL,
  `id_usuario` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `venta`
--

INSERT INTO `venta` (`id_venta`, `fecha_venta`, `estado_venta`, `subtotal`, `descuento`, `impuestos`, `id_pedido`, `id_usuario`) VALUES
(1, '2025-12-01 18:56:40', 'Pagada', 80000.00, 0.00, 15200.00, 1, 2),
(2, '2025-12-01 18:56:40', 'Pendiente', 45000.00, 2000.00, 8550.00, 2, 3),
(3, '2025-12-01 18:56:40', 'Pagada', 60000.00, 0.00, 11400.00, 3, 4),
(4, '2025-12-01 18:56:40', 'Cancelada', 50000.00, 1000.00, 9500.00, 4, 5),
(5, '2025-12-01 18:56:40', 'Pagada', 90000.00, 0.00, 17100.00, 5, 6),
(6, '2025-12-01 18:56:40', 'Pendiente', 30000.00, 0.00, 5700.00, 6, 7),
(7, '2025-12-01 18:56:40', 'Pagada', 110000.00, 5000.00, 19950.00, 7, 8),
(8, '2025-12-01 18:56:40', 'Pagada', 65000.00, 0.00, 12350.00, 8, 9),
(9, '2025-12-01 18:56:40', 'Pendiente', 70000.00, 0.00, 13300.00, 9, 10),
(10, '2025-12-01 18:56:40', 'Pagada', 95000.00, 2000.00, 17500.00, 10, 2),
(50, '2025-12-17 08:38:48', 'Pendiente', 0.00, 0.00, 0.00, 54, 15),
(51, '2025-12-17 09:07:18', 'Pendiente', 0.00, 0.00, 0.00, 55, 15),
(52, '2025-12-17 09:07:31', 'Pendiente', 0.00, 0.00, 0.00, 56, 15),
(53, '2026-02-03 17:45:30', 'Pendiente', 0.00, 0.00, 0.00, 57, 23),
(54, '2026-02-09 15:27:31', 'Pendiente', 0.00, 0.00, 0.00, 58, 27),
(55, '2026-02-20 15:07:20', 'Pendiente', 0.00, 0.00, 0.00, 59, 27),
(56, '2026-02-27 20:13:41', 'Pendiente', 3500.00, 0.00, 0.00, 60, 27),
(57, '2026-03-12 19:45:48', 'Pendiente', 41000.00, 0.00, 0.00, 61, 27);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categoria`
--
ALTER TABLE `categoria`
  ADD PRIMARY KEY (`id_categoria`);

--
-- Indices de la tabla `cliente`
--
ALTER TABLE `cliente`
  ADD PRIMARY KEY (`id_cliente`),
  ADD UNIQUE KEY `identificacion` (`identificacion`);

--
-- Indices de la tabla `cotizacion`
--
ALTER TABLE `cotizacion`
  ADD PRIMARY KEY (`id_cotizacion`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `id_cliente` (`id_cliente`);

--
-- Indices de la tabla `detalle_cotizacion`
--
ALTER TABLE `detalle_cotizacion`
  ADD PRIMARY KEY (`id_detalle_cotizacion`),
  ADD KEY `id_cotizacion` (`id_cotizacion`),
  ADD KEY `id_producto` (`id_producto`);

--
-- Indices de la tabla `detalle_devolucion`
--
ALTER TABLE `detalle_devolucion`
  ADD PRIMARY KEY (`id_detalle_devolucion`),
  ADD KEY `id_devolucion` (`id_devolucion`),
  ADD KEY `id_producto` (`id_producto`);

--
-- Indices de la tabla `detalle_venta`
--
ALTER TABLE `detalle_venta`
  ADD PRIMARY KEY (`id_detalle_venta`),
  ADD KEY `id_venta` (`id_venta`),
  ADD KEY `id_producto` (`id_producto`);

--
-- Indices de la tabla `devolucion`
--
ALTER TABLE `devolucion`
  ADD PRIMARY KEY (`id_devolucion`),
  ADD KEY `id_venta` (`id_venta`);

--
-- Indices de la tabla `notificacion`
--
ALTER TABLE `notificacion`
  ADD PRIMARY KEY (`id_notificacion`),
  ADD KEY `id_pedido` (`id_pedido`);

--
-- Indices de la tabla `pedido`
--
ALTER TABLE `pedido`
  ADD PRIMARY KEY (`id_pedido`),
  ADD KEY `id_cliente` (`id_cliente`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `producto`
--
ALTER TABLE `producto`
  ADD PRIMARY KEY (`id_producto`),
  ADD UNIQUE KEY `codigo_interno` (`codigo_interno`),
  ADD KEY `id_categoria` (`id_categoria`);

--
-- Indices de la tabla `rol`
--
ALTER TABLE `rol`
  ADD PRIMARY KEY (`id_rol`),
  ADD UNIQUE KEY `nombre_rol` (`nombre_rol`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `numero_documento` (`numero_documento`),
  ADD UNIQUE KEY `correo` (`correo`),
  ADD KEY `id_rol` (`id_rol`);

--
-- Indices de la tabla `venta`
--
ALTER TABLE `venta`
  ADD PRIMARY KEY (`id_venta`),
  ADD KEY `id_pedido` (`id_pedido`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categoria`
--
ALTER TABLE `categoria`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `cliente`
--
ALTER TABLE `cliente`
  MODIFY `id_cliente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `cotizacion`
--
ALTER TABLE `cotizacion`
  MODIFY `id_cotizacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `detalle_cotizacion`
--
ALTER TABLE `detalle_cotizacion`
  MODIFY `id_detalle_cotizacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `detalle_devolucion`
--
ALTER TABLE `detalle_devolucion`
  MODIFY `id_detalle_devolucion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `detalle_venta`
--
ALTER TABLE `detalle_venta`
  MODIFY `id_detalle_venta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT de la tabla `devolucion`
--
ALTER TABLE `devolucion`
  MODIFY `id_devolucion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `notificacion`
--
ALTER TABLE `notificacion`
  MODIFY `id_notificacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `pedido`
--
ALTER TABLE `pedido`
  MODIFY `id_pedido` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT de la tabla `producto`
--
ALTER TABLE `producto`
  MODIFY `id_producto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `rol`
--
ALTER TABLE `rol`
  MODIFY `id_rol` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT de la tabla `venta`
--
ALTER TABLE `venta`
  MODIFY `id_venta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `cotizacion`
--
ALTER TABLE `cotizacion`
  ADD CONSTRAINT `cotizacion_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`),
  ADD CONSTRAINT `cotizacion_ibfk_2` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`);

--
-- Filtros para la tabla `detalle_cotizacion`
--
ALTER TABLE `detalle_cotizacion`
  ADD CONSTRAINT `detalle_cotizacion_ibfk_1` FOREIGN KEY (`id_cotizacion`) REFERENCES `cotizacion` (`id_cotizacion`),
  ADD CONSTRAINT `detalle_cotizacion_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`);

--
-- Filtros para la tabla `detalle_devolucion`
--
ALTER TABLE `detalle_devolucion`
  ADD CONSTRAINT `detalle_devolucion_ibfk_1` FOREIGN KEY (`id_devolucion`) REFERENCES `devolucion` (`id_devolucion`),
  ADD CONSTRAINT `detalle_devolucion_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`);

--
-- Filtros para la tabla `detalle_venta`
--
ALTER TABLE `detalle_venta`
  ADD CONSTRAINT `detalle_venta_ibfk_1` FOREIGN KEY (`id_venta`) REFERENCES `venta` (`id_venta`),
  ADD CONSTRAINT `detalle_venta_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`);

--
-- Filtros para la tabla `devolucion`
--
ALTER TABLE `devolucion`
  ADD CONSTRAINT `devolucion_ibfk_1` FOREIGN KEY (`id_venta`) REFERENCES `venta` (`id_venta`);

--
-- Filtros para la tabla `notificacion`
--
ALTER TABLE `notificacion`
  ADD CONSTRAINT `notificacion_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`);

--
-- Filtros para la tabla `pedido`
--
ALTER TABLE `pedido`
  ADD CONSTRAINT `pedido_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`),
  ADD CONSTRAINT `pedido_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`);

--
-- Filtros para la tabla `producto`
--
ALTER TABLE `producto`
  ADD CONSTRAINT `producto_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id_categoria`);

--
-- Filtros para la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `usuario_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`);

--
-- Filtros para la tabla `venta`
--
ALTER TABLE `venta`
  ADD CONSTRAINT `venta_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`),
  ADD CONSTRAINT `venta_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
